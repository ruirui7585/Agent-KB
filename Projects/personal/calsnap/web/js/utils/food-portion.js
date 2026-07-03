(function registerFoodPortion(root) {
  const SCALABLE_FIELDS = [
    'calories',
    'calorie_min',
    'calorie_max',
    'protein_g',
    'fat_g',
    'carbs_g',
  ];

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((value + 1e-10) * factor) / factor;
  }

  function scaleFoodByWeight(food = {}, nextWeight) {
    const referenceWeight = Number(food.weight_g);
    const weight = Number(nextWeight);
    if (!Number.isFinite(referenceWeight) || referenceWeight <= 0
      || !Number.isFinite(weight) || weight < 0) {
      return { ...food, weight_g: Number.isFinite(weight) && weight >= 0 ? weight : 0 };
    }

    const ratio = weight / referenceWeight;
    const scaled = { ...food, weight_g: weight };
    SCALABLE_FIELDS.forEach((field) => {
      const value = Number(food[field]);
      if (!Number.isFinite(value)) return;
      scaled[field] = field.startsWith('calorie')
        ? Math.round(value * ratio)
        : round(value * ratio, 1);
    });
    return scaled;
  }

  function summarizeNutrition(foods = []) {
    const totals = (Array.isArray(foods) ? foods : []).reduce((summary, food) => ({
      protein_g: summary.protein_g + Math.max(0, Number(food?.protein_g) || 0),
      carbs_g: summary.carbs_g + Math.max(0, Number(food?.carbs_g) || 0),
      fat_g: summary.fat_g + Math.max(0, Number(food?.fat_g) || 0),
    }), { protein_g: 0, carbs_g: 0, fat_g: 0 });

    const proteinCalories = totals.protein_g * 4;
    const carbsCalories = totals.carbs_g * 4;
    const fatCalories = totals.fat_g * 9;
    const macroCalories = proteinCalories + carbsCalories + fatCalories;
    if (macroCalories <= 0) {
      return {
        available: false,
        protein_g: round(totals.protein_g, 1),
        carbs_g: round(totals.carbs_g, 1),
        fat_g: round(totals.fat_g, 1),
        protein_pct: 0,
        carbs_pct: 0,
        fat_pct: 0,
      };
    }

    const proteinPct = Math.round(proteinCalories / macroCalories * 100);
    const carbsPct = Math.round(carbsCalories / macroCalories * 100);
    return {
      available: true,
      protein_g: round(totals.protein_g, 1),
      carbs_g: round(totals.carbs_g, 1),
      fat_g: round(totals.fat_g, 1),
      protein_pct: proteinPct,
      carbs_pct: carbsPct,
      fat_pct: Math.max(0, 100 - proteinPct - carbsPct),
    };
  }

  root.FoodPortion = Object.freeze({
    scaleFoodByWeight,
    summarizeNutrition,
  });
})(globalThis);
