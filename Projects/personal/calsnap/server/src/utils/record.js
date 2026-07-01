const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner', 'snack']);

function safeNumber(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

export function normalizeRecordInput(input = {}) {
  const mealType = MEAL_TYPES.has(input.meal_type) ? input.meal_type : null;
  const rawFoods = Array.isArray(input.foods) ? input.foods : [];
  const foods = rawFoods.slice(0, 20).map((food) => ({
    name: String(food.name || '').trim().slice(0, 80),
    weight_g: safeNumber(food.weight_g),
    calories: safeNumber(food.calories),
    calorie_min: safeNumber(food.calorie_min ?? food.calories),
    calorie_max: safeNumber(food.calorie_max ?? food.calories),
    protein_g: safeNumber(food.protein_g),
    fat_g: safeNumber(food.fat_g),
    carbs_g: safeNumber(food.carbs_g),
    confidence: ['high', 'medium', 'low'].includes(food.confidence) ? food.confidence : 'low',
  })).filter((food) => food.name && food.calories <= 10000);

  return {
    meal_type: mealType,
    foods,
    total_calories: foods.reduce((sum, food) => sum + food.calories, 0),
  };
}
