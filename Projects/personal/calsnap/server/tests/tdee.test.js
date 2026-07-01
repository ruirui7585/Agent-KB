import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcBMR, calcTDEE, calcCalorieDelta } from '../src/services/tdee.js';

describe('TDEE Calculator', () => {
  it('calculates BMR for male correctly (AC-4.11)', () => {
    // 男 175cm / 70kg / 28岁 → BMR = 1658.75
    const bmr = calcBMR('male', 175, 70, 28);
    assert.strictEqual(bmr, 1659);
  });

  it('calculates BMR for female correctly (DATA-1.3)', () => {
    // 女 160cm / 55kg / 25岁 → BMR = 1264
    const bmr = calcBMR('female', 160, 55, 25);
    assert.strictEqual(bmr, 1264);
  });

  it('calculates TDEE correctly (DATA-1.2)', () => {
    // BMR=1659 × 轻度 1.375 = 2280.78 → 2281
    const tdee = calcTDEE(1659, 'light');
    assert.strictEqual(tdee, 2281);
  });

  it('calculates TDEE with sedentary correctly (DATA-1.1)', () => {
    // DATA-1.1: male 175/70/28 sedentary → BMR=1659, TDEE=1659×1.2=1990.8→1991
    const tdee = calcTDEE(1659, 'sedentary');
    assert.strictEqual(tdee, 1991);
  });

  it('calculates calorie delta correctly (DATA-1.4)', () => {
    const delta = calcCalorieDelta(1500, 2280);
    assert.strictEqual(delta, -780);
  });

  it('defaults activity level to sedentary', () => {
    const tdee = calcTDEE(2000, 'unknown');
    assert.strictEqual(tdee, 2400); // 2000 × 1.2 = 2400
  });
});
