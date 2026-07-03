import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSettingsUpdates,
  parseSettingsRows,
} from '../src/utils/settings.js';

describe('Daily nutrition goal settings', () => {
  it('provides macro defaults while preserving a stored calorie goal', () => {
    assert.deepEqual(parseSettingsRows([
      { key: 'daily_cal_goal', value: '2200' },
    ]), {
      daily_cal_goal: 2200,
      daily_protein_goal: 80,
      daily_carbs_goal: 180,
      daily_fat_goal: 45,
    });
  });

  it('normalizes all supported settings for persistence', () => {
    assert.deepEqual(normalizeSettingsUpdates({
      daily_cal_goal: 2100,
      daily_protein_goal: '95',
      daily_carbs_goal: '220',
      daily_fat_goal: 60,
      ignored_key: 'value',
    }), {
      daily_cal_goal: '2100',
      daily_protein_goal: '95',
      daily_carbs_goal: '220',
      daily_fat_goal: '60',
    });
  });

  it('rejects macro targets outside their supported ranges', () => {
    assert.throws(
      () => normalizeSettingsUpdates({ daily_protein_goal: 10 }),
      /蛋白质目标必须在 20–400 g 之间/,
    );
    assert.throws(
      () => normalizeSettingsUpdates({ daily_carbs_goal: 900 }),
      /碳水目标必须在 20–800 g 之间/,
    );
    assert.throws(
      () => normalizeSettingsUpdates({ daily_fat_goal: 0 }),
      /脂肪目标必须在 10–300 g 之间/,
    );
  });
});
