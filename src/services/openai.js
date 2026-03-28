import OpenAI from 'openai';
import CryptoJS from 'crypto-js';
import { supabase } from './supabase';
import { format } from 'date-fns';

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
