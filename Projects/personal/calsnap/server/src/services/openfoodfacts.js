import db from '../db.js';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

export async function lookupBarcode(barcode) {
  const cached = db.prepare('SELECT data_json FROM barcode_cache WHERE barcode = ?').get(barcode);
  if (cached) return JSON.parse(cached.data_json);

  const url = `${BASE_URL}/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CalSnap/1.0' } });

  if (!res.ok) throw new Error(`OFF API error ${res.status}`);

  const json = await res.json();
  const p = json.product;

  if (!p || json.status !== 1) {
    return null;
  }

  const nutriments = p.nutriments || {};
  const calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_value'] || 0);

  const result = {
    product_name: p.product_name || '未知商品',
    brand: p.brands || '',
    weight_g: parseInt(p.product_quantity) || 100,
    foods: [{
      name: p.product_name || '未知商品',
      calories,
      weight_g: 100,
      protein: parseFloat((nutriments.proteins_100g || 0).toFixed(1)),
      fat: parseFloat((nutriments.fat_100g || 0).toFixed(1)),
      carbs: parseFloat((nutriments.carbohydrates_100g || 0).toFixed(1)),
    }],
    total_calories: calories,
  };

  db.prepare('INSERT OR REPLACE INTO barcode_cache (barcode, data_json) VALUES (?, ?)')
    .run(barcode, JSON.stringify(result));

  return result;
}
