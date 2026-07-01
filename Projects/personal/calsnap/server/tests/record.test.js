import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecordInput } from '../src/utils/record.js';

describe('Food record validation', () => {
  it('normalizes editable analysis results', () => {
    const record = normalizeRecordInput({
      meal_type: 'lunch',
      foods: [
        { name: ' 米饭 ', calories: '200.4', weight_g: '150', confidence: 'high' },
        { name: '青菜', calories: 80, weight_g: 120, confidence: 'medium' },
      ],
    });

    assert.equal(record.meal_type, 'lunch');
    assert.equal(record.foods[0].name, '米饭');
    assert.equal(record.total_calories, 280);
  });

  it('rejects invalid meal types and unusable foods', () => {
    const record = normalizeRecordInput({
      meal_type: 'midnight',
      foods: [{ name: '', calories: 100 }, { name: '异常', calories: 50000 }],
    });

    assert.equal(record.meal_type, null);
    assert.deepEqual(record.foods, []);
    assert.equal(record.total_calories, 0);
  });
});
