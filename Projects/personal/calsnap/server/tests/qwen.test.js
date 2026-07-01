import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFoodAnalysis } from '../src/services/qwen-parser.js';
import { normalizeWeightFoods } from '../src/services/qwen.js';

describe('Bailian food analysis parser', () => {
  it('normalizes multiple foods and calculates totals', () => {
    const result = parseFoodAnalysis(JSON.stringify({
      foods: [
        {
          name: '番茄炒蛋',
          weight_g: 200.4,
          calories: 180.2,
          calorie_min: 150,
          calorie_max: 230,
          protein_g: 12,
          fat_g: 10,
          carbs_g: 8,
          confidence: 'medium',
        },
        {
          name: '米饭',
          weight_g: 150,
          calories: 174,
          calorie_min: 160,
          calorie_max: 190,
          confidence: 'high',
        },
      ],
      description: '番茄炒蛋配米饭',
    }));

    assert.equal(result.foods.length, 2);
    assert.equal(result.total_calories, 354);
    assert.equal(result.total_calorie_min, 310);
    assert.equal(result.total_calorie_max, 420);
    assert.equal(result.foods[0].weight_g, 200);
  });

  it('accepts JSON wrapped in explanatory text and sanitizes invalid values', () => {
    const result = parseFoodAnalysis('结果如下：{"foods":[{"name":"苹果","calories":-5,"confidence":"maybe"}]}');
    assert.equal(result.foods[0].calories, 0);
    assert.equal(result.foods[0].confidence, 'low');
  });

  it('throws when no JSON object exists', () => {
    assert.throws(() => parseFoodAnalysis('无法分析'), /有效 JSON/);
  });
});

describe('Manual food weight input', () => {
  it('normalizes food names and integer weights', () => {
    assert.deepEqual(normalizeWeightFoods([
      { name: ' 熟米饭 ', weight_g: '150.8' },
      { name: '鸡胸肉', weight_g: 120 },
    ]), [
      { name: '熟米饭', weight_g: 150 },
      { name: '鸡胸肉', weight_g: 120 },
    ]);
  });

  it('rejects empty names and invalid weights', () => {
    assert.throws(
      () => normalizeWeightFoods([{ name: '', weight_g: 100 }]),
      /名称不能为空/
    );
    assert.throws(
      () => normalizeWeightFoods([{ name: '米饭', weight_g: 0 }]),
      /1–5000g/
    );
  });
});
