const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

const CATEGORY_MAP = {
    'en:beverages': 'Beverages',
    'en:dairy': 'Dairy',
    'en:meats': 'Meat & Fish',
    'en:cereals-and-potatoes': 'Grains',
    'en:fruits-and-vegetables': 'Fruits & Vegetables',
    'en:snacks': 'Snacks',
    'en:condiments': 'Condiments',
    'en:frozen-foods': 'Frozen',
    'en:breads': 'Bakery',
    'en:canned-foods': 'Canned Goods',
};

export async function lookupBarcode(barcode) {
    try {
        const res = await fetch(`${BASE_URL}/${barcode}.json`);
        if (!res.ok) return null;

        const data = await res.json();
        if (data.status !== 1) return null;

        const p = data.product;
        const rawCategory = p.categories_tags?.[0] || '';
        const category = CATEGORY_MAP[rawCategory] || 'Other';

        return {
            item_name: p.product_name || p.generic_name || '',
            category,
            barcode,
            image_url: p.image_url || null,
        };
    } catch (err) {
        console.error('Open Food Facts error:', err);
        return null;
    }
}
