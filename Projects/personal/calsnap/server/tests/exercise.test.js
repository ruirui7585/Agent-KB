import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateExerciseCalories, normalizeExerciseInput } from '../src/services/exercise.js';

describe('Exercise calorie estimation', () => {
  it('estimates moderate walking calories', () => {
    assert.equal(estimateExerciseCalories('walking', 40, 'moderate', 70), 163);
  });

  it('applies intensity and supplied calorie override', () => {
    const result = normalizeExerciseInput({
      exercise_type: 'running',
      duration_minutes: 30,
      intensity: 'high',
      calories: 420,
      note: '晚间跑步',
    }, 60);
    assert.equal(result.calories, 420);
    assert.equal(result.estimated_calories, 324);
    assert.equal(result.note, '晚间跑步');
  });
});
