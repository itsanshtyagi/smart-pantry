import OpenAI from 'openai';
import CryptoJS from 'crypto-js';
import { supabase } from './supabase';
import { format } from 'date-fns';

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true,
});

function buildCacheKey(items) {
    const sorted = [...items].sort((a, b) => a.item_name.localeCompare(b.item_name));
    const str = sorted.map(i => `${i.item_name}:${i.expiry_date}`).join('|');
    return CryptoJS.MD5(str).toString();
}

export async function generateRecipes(pantryItems, userId, dietPref = 'all') {
    const sorted = [...pantryItems]
        .filter(i => i.status !== 'expired')
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
        .slice(0, 15);

    const cacheKey = buildCacheKey(sorted);

    // Check cache first
    const { data: cached } = await supabase
        .from('recipes')
        .select('recipes_json, expires_at')
        .eq('user_id', userId)
        .eq('cache_key', cacheKey)
        .single();

    if (cached && new Date(cached.expires_at) > new Date()) {
        return cached.recipes_json;
    }

    // Build AI prompt
    const ingredientList = sorted.map(i =>
        `- ${i.item_name} (expires: ${format(new Date(i.expiry_date), 'MMM d')}, qty: ${i.quantity} ${i.unit})`
    ).join('\n');

    const dietNote = dietPref === 'veg'
        ? 'The user is vegetarian — no meat or fish.'
        : dietPref === 'vegan'
            ? 'The user is vegan — no animal products.'
            : '';

    const prompt = `You are a helpful chef AI. Based on these pantry ingredients (sorted by expiry — use expiring items first), suggest 3–5 recipes. ${dietNote}

Ingredients:
${ingredientList}

Respond ONLY with a valid JSON array. Each recipe object must have:
{
  "name": "Recipe Name",
  "description": "One sentence description",
  "cooking_time": "25 mins",
  "servings": 2,
  "difficulty": "Easy",
  "ingredients": [{"name": "ingredient", "amount": "1 cup", "using_from_pantry": true}],
  "steps": ["Step 1...", "Step 2..."],
  "expiring_used": ["item1", "item2"]
}`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
    });

    let recipes;
    try {
        const text = response.choices[0].message.content.replace(/```json|```/g, '').trim();
        recipes = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse AI response');
    }

    // Cache result
    await supabase.from('recipes').upsert({
        user_id: userId,
        cache_key: cacheKey,
        recipes_json: recipes,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id,cache_key' });

    return recipes;
}

export async function scanLabelWithAI(base64Image) {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `You are a food label reading AI. Analyze this product label image and extract the following information.

Today's date is: ${today}

Look for:
1. Product name
2. Manufacturing date (MFG date)
3. Expiry date / Use by date
4. "Best before X months/days" — if found, calculate expiry date from MFG date
5. Category (one of: Fruits & Vegetables, Dairy, Meat & Fish, Grains, Beverages, Snacks, Condiments, Frozen, Bakery, Canned Goods, Other)

Rules:
- If you find "Best before 24 months" and MFG date is "Jan 2025", then expiry = "Jan 2027"
- If you find "Best before 12 months" and MFG date is "Mar 2025", then expiry = "Mar 2026"
- If only MFG date is available with no best-before info, estimate a reasonable expiry
- Return dates in YYYY-MM-DD format
- If you cannot read something, use empty string ""

Respond ONLY with valid JSON:
{
  "item_name": "Product Name",
  "category": "Category",
  "mfg_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "notes": "Any extra info like best before 24 months, weight, etc."
}`;

    let response;
    try {
        response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'auto',
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
            temperature: 0.2,
        });
    } catch (apiErr) {
        console.error('OpenAI API error:', apiErr);
        const status = apiErr?.status || apiErr?.response?.status || '';
        const msg = apiErr?.message || apiErr?.error?.message || apiErr?.toString() || '';
        throw new Error(`API error ${status}: ${msg}`);
    }

    let result;
    try {
        const text = response.choices[0].message.content.replace(/```json|```/g, '').trim();
        result = JSON.parse(text);
    } catch {
        throw new Error('AI returned invalid response format');
    }

    return {
        item_name: result.item_name || '',
        category: result.category || 'Other',
        expiry_date: result.expiry_date || '',
        notes: result.notes || '',
    };
}

