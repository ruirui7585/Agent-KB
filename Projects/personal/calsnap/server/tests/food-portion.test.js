import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../../web/js/utils/food-portion.js';

const { scaleFoodByWeight, summarizeNutrition } = globalThis.FoodPortion;

describe('Photo result portion scaling', () => {
  const recognizedFood = {
    name: '熟米饭',
    weight_g: 100,
    calories: 116,
    calorie_min: 105,
    calorie_max: 130,
    protein_g: 2.6,
    fat_g: 0.3,
    carbs_g: 25.9,
  };

  it('updates calories and nutrients proportionally when weight changes', () => {
    const result = scaleFoodByWeight(recognizedFood, 150);

    assert.equal(result.weight_g, 150);
    assert.equal(result.calories, 174);
    assert.equal(result.calorie_min, 158);
    assert.equal(result.calorie_max, 195);
    assert.equal(result.protein_g, 3.9);
    assert.equal(result.fat_g, 0.5);
    assert.equal(result.carbs_g, 38.9);
  });

  it('always scales from the supplied recognition basis', () => {
    assert.equal(scaleFoodByWeight(recognizedFood, 200).calories, 232);
    assert.equal(scaleFoodByWeight(recognizedFood, 80).calories, 93);
  });

  it('supports a temporarily empty weight without producing invalid numbers', () => {
    const result = scaleFoodByWeight(recognizedFood, 0);

    assert.equal(result.weight_g, 0);
    assert.equal(result.calories, 0);
    assert.equal(Number.isFinite(result.protein_g), true);
  });

  it('summarizes macro grams and energy percentages', () => {
    const result = summarizeNutrition([
      { protein_g: 40, carbs_g: 30, fat_g: 10 },
      { protein_g: 5, carbs_g: 20, fat_g: 2 },
    ]);

    assert.equal(result.protein_g, 45);
    assert.equal(result.carbs_g, 50);
    assert.equal(result.fat_g, 12);
    assert.equal(result.protein_pct + result.carbs_pct + result.fat_pct, 100);
    assert.equal(result.available, true);
  });

  it('returns an explicit empty nutrition state', () => {
    assert.deepEqual(summarizeNutrition([{ calories: 100 }]), {
      available: false,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      protein_pct: 0,
      carbs_pct: 0,
      fat_pct: 0,
    });
  });
});
