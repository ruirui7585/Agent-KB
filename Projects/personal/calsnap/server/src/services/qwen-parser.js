function toNumber(value, fallback = 0) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function round(value) {
  return Math.round(toNumber(value));
}

function normalizeConfidence(value) {
  return ['high', 'medium', 'low'].includes(value) ? value : 'low';
}

export function parseFoodAnalysis(text) {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  const jsonText = cleaned.startsWith('{')
    ? cleaned
    : cleaned.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error('百练返回内容不是有效 JSON');

  const parsed = JSON.parse(jsonText);
  const rawFoods = Array.isArray(parsed.foods) ? parsed.foods : [];
  const foods = rawFoods.slice(0, 20).map((food) => {
    const calories = round(food.calories);
    let calorieMin = round(food.calorie_min ?? calories);
    let calorieMax = round(food.calorie_max ?? calories);
    if (calorieMin > calorieMax) [calorieMin, calorieMax] = [calorieMax, calorieMin];

    return {
      name: String(food.name || '未知食物').slice(0, 80),
      weight_g: round(food.weight_g),
      calories,
      calorie_min: calorieMin,
      calorie_max: calorieMax,
      protein_g: round(food.protein_g),
      fat_g: round(food.fat_g),
      carbs_g: round(food.carbs_g),
      confidence: normalizeConfidence(food.confidence),
    };
  });

  return {
    foods,
    total_calories: foods.reduce((sum, food) => sum + food.calories, 0),
    total_calorie_min: foods.reduce((sum, food) => sum + food.calorie_min, 0),
    total_calorie_max: foods.reduce((sum, food) => sum + food.calorie_max, 0),
    description: String(parsed.description || '').slice(0, 300),
    caveat: String(parsed.caveat || '图片无法精确判断重量、用油量和隐藏配料。').slice(0, 300),
  };
}
