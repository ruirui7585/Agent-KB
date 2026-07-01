import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../../web/js/utils/body-composition.js';

const {
  estimateBodyFatPercentage,
  buildProjection,
  buildHistoricalTrend,
} = globalThis.BodyComposition;

describe('Body composition projection', () => {
  it('estimates adult body fat from BMI, age and gender', () => {
    const result = estimateBodyFatPercentage({
      gender: 'male',
      height_cm: 175,
      weight_kg: 70,
      age: 28,
    });

    assert.equal(result, 17.7);
  });

  it('prefers a measured body-fat percentage over the model estimate', () => {
    const result = estimateBodyFatPercentage({
      gender: 'male',
      height_cm: 175,
      weight_kg: 70,
      age: 28,
      body_fat_pct: 18.6,
    });

    assert.equal(result, 18.6);
  });

  it('converts calorie deficit into daily, weekly and monthly fat equivalents', () => {
    const result = buildProjection(-770, {
      gender: 'male',
      height_cm: 175,
      weight_kg: 70,
      age: 28,
    });

    assert.equal(result.fat_change.today_kg, -0.1);
    assert.equal(result.fat_change.week_kg, -0.7);
    assert.equal(result.fat_change.month_kg, -3);
    assert.equal(result.body_fat.current_pct, 17.7);
    assert.equal(result.body_fat.week_pct, 16.9);
    assert.equal(result.body_fat.month_pct, 14);
  });

  it('marks projections that use a measured body-fat percentage', () => {
    const result = buildProjection(-320, {
      gender: 'female',
      height_cm: 165,
      weight_kg: 58,
      age: 30,
      body_fat_pct: 24.3,
    });

    assert.equal(result.body_fat.current_pct, 24.3);
    assert.equal(result.method, 'provided_body_fat');
  });

  it('keeps fat equivalent available when profile data is incomplete', () => {
    const result = buildProjection(385, {});

    assert.equal(result.available, false);
    assert.equal(result.fat_change.today_kg, 0.05);
    assert.equal(result.fat_change.week_kg, 0.35);
  });

  it('reconstructs weight and body-fat trends anchored to the current profile', () => {
    const result = buildHistoricalTrend([
      { date: '2026-06-29', balance: -770, has_data: true },
      { date: '2026-06-30', balance: 0, has_data: false },
      { date: '2026-07-01', balance: -385, has_data: true },
    ], {
      gender: 'male',
      height_cm: 175,
      weight_kg: 70,
      age: 28,
    });

    assert.equal(result.available, true);
    assert.equal(result.total_fat_change_kg, -0.15);
    assert.equal(result.series.at(-1).estimated_weight_kg, 70);
    assert.equal(result.series.at(-1).estimated_body_fat_pct, 17.7);
    assert.equal(result.series[1].has_data, false);
  });
});
