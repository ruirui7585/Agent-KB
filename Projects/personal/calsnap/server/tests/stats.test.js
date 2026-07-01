import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStatsRange } from '../src/utils/stats.js';

describe('Stats range', () => {
  it('supports week, month, quarter and year ranges', () => {
    assert.equal(normalizeStatsRange('7'), 7);
    assert.equal(normalizeStatsRange('30'), 30);
    assert.equal(normalizeStatsRange('90'), 90);
    assert.equal(normalizeStatsRange('365'), 365);
  });

  it('clamps unsafe ranges and falls back for invalid values', () => {
    assert.equal(normalizeStatsRange('999'), 365);
    assert.equal(normalizeStatsRange('-5'), 1);
    assert.equal(normalizeStatsRange('invalid'), 7);
  });
});
