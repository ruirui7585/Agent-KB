'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../js/engine.js');

const wealthRows = [
  ['C', 25, ['ABCDABC', 'ABCABCD']],
  ['C', 30, ['ABCBBBB', 'AABBAC', 'AABBBAC', 'ABABAD', 'AABCCAA', 'ABCABCA', 'ABCCCAB', 'ABACABA']],
  ['C', 35, ['ABBCCA', 'AABBBC', 'AAAABC', 'ABBBBC']],
  ['C', 40, ['AABBCC', 'ABCAA', 'ABCABC', 'AABBC']],
  ['B', 45, ['ABABAB', 'AAABC', 'AABBAA', 'ABCCC', 'AABBBB']],
  ['B', 50, ['ABBBBB', 'AABBA', 'AAAAAB', 'AAABA']],
  ['B', 55, ['AAABBB', 'AAAAB', 'AABBB', 'AAABB']],
  ['B', 60, ['AAAAAA', 'AABAA', 'ABAC', 'ABCB', 'ABCA']],
  ['B', 65, ['ABBBB', 'AABC', 'ABBC', 'ABCC']],
  ['B', 70, ['AAAAA', 'ABBA', 'AABA']],
  ['B', 75, ['AABB', 'ABAB']],
  ['A', 85, ['AAAA', 'ABB', 'ABBB', 'ABA']],
  ['A', 95, ['AAA', 'AB', 'AA']],
  ['A', 100, ['A']]
];

const toInput = (label) => {
  const symbols = [];
  return [...label].map((letter) => {
    let index = symbols.indexOf(letter);
    if (index === -1) {
      symbols.push(letter);
      index = symbols.length - 1;
    }
    return String(index + 1);
  }).join('');
};

test('structures digits and letters independently, without mixing classes', () => {
  assert.equal(engine.structure('121'), 'ABA');
  assert.equal(engine.structure('AAB'), 'AAB');
  assert.equal(engine.structure('12A'), null);
  assert.equal(engine.structure('aab'), null);
  assert.equal(engine.structure('12 1'), null);
  assert.equal(engine.maxLength, 7);
});

test('matches the authoritative wealth configuration exactly', () => {
  const expected = wealthRows.map(([category, level, patterns]) => ({ category, level, patterns, pending: false }));
  assert.deepEqual(engine.config.map(({ category, level, patterns, pending }) => ({ category, level, patterns, pending })), expected);
  assert.equal(engine.config.every((row) => row.pending === false), true);
});

test('accepts every configured pattern at its level and rejects unknown shapes', () => {
  for (const [category, level, patterns] of wealthRows) {
    for (const label of patterns) {
      const input = toInput(label);
      const result = engine.validate(input, engine.createState({ level }));
      assert.equal(result.ok, true, `${category}${level} ${label}`);
      assert.equal(result.category, category, `${category}${level} ${label}`);
      assert.equal(result.level, level, `${category}${level} ${label}`);
    }
  }
  assert.equal(engine.validate('1234567', engine.createState({ level: 100 })).error, 'This Pretty ID is not available.');
  assert.equal(engine.validate('ABCDEFG', engine.createState({ level: 100 })).error, 'This Pretty ID is not available.');
  assert.equal(engine.validate('abcdefg', engine.createState({ level: 100 })).error, 'This Pretty ID is not available.');
});

test('levels inherit lower rows and category priority is A then B then C', () => {
  const c25 = toInput('ABCDABC');
  assert.equal(engine.validate(c25, engine.createState({ level: 24 })).ok, false);
  assert.equal(engine.validate(c25, engine.createState({ level: 25 })).ok, true);
  assert.equal(engine.validate(toInput('AABBCC'), engine.createState({ level: 40 })).ok, true);
  assert.equal(engine.validate(toInput('AAABBB'), engine.createState({ level: 55 })).ok, true);
  assert.equal(engine.validate(toInput('ABBBB'), engine.createState({ level: 65 })).ok, true);
  assert.equal(engine.validate(toInput('AABB'), engine.createState({ level: 75 })).ok, true);
  assert.equal(engine.validate(toInput('AAAA'), engine.createState({ level: 85 })).category, 'A');
  assert.equal(engine.validate(toInput('AAA'), engine.createState({ level: 95 })).category, 'A');
  assert.equal(engine.validate('1', engine.createState({ level: 100 })).category, 'A');
  assert.equal(engine.validate(c25, engine.createState({ level: 24 })).error, 'Unlock at Wealth Level LV25.');
});

test('precise patterns remain distinct and lower input is normalized only for validation', () => {
  const first = engine.validate(toInput('ABCDABC'), engine.createState({ level: 25 }));
  const second = engine.validate(toInput('ABCABCD'), engine.createState({ level: 25 }));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.notEqual(first.pattern, second.pattern);
  assert.equal(engine.validate('ab', engine.createState({ level: 95 })).input, 'AB');
  assert.equal(engine.validate('12A', engine.createState({ level: 100 })).error, 'Use only letters or only numbers, without spaces.');
});

test('redemption is immutable, retains ownership, enforces limits, and is idempotent', () => {
  const initial = engine.createState();
  const first = engine.redeem('1', initial, 'op-1');
  assert.equal(first.ok, true);
  assert.deepEqual(initial, engine.createState());
  assert.equal(first.state.owned['1'], 'self');
  assert.equal(first.state.current, '1');

  const taken = engine.validate('1', first.state);
  assert.equal(taken.error, 'This Pretty ID is already taken.');
  const second = engine.redeem('12', first.state, 'op-2');
  assert.equal(second.ok, true);
  assert.deepEqual(second.state.rewards, ['A']);
  assert.equal(second.state.owned['1'], 'self');
  assert.equal(second.state.owned['12'], 'self');

  const retry = engine.redeem('12', second.state, 'op-2');
  assert.equal(retry.idempotent, true);
  assert.equal(retry.state.remaining, second.state.remaining);
  assert.equal(retry.state.records.length, 2);

  const limited = engine.redeem('111', second.state, 'op-3');
  assert.equal(limited.error, 'You have reached the redemption limit.');
  assert.deepEqual(limited.state, second.state);
});

test('tableRows, when exposed, preserve every configured pattern and length 1 through 7', () => {
  if (!engine.tableRows) return;
  const patterns = engine.tableRows.flatMap((row) => row.patterns || [row.pattern]).filter(Boolean);
  const configured = wealthRows.flatMap(([, , rowPatterns]) => rowPatterns);
  assert.deepEqual(patterns, configured);
  assert.deepEqual([...new Set(patterns.map((pattern) => pattern.length))].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
});

test('SVIP route remains isolated and compatible', () => {
  assert.deepEqual(engine.svipConfig[0], { category: 'SS', level: 5, patterns: ['AB', 'AA'], pending: false });
  const state = engine.createState({ route: 'svip', svip: 5 });
  assert.equal(engine.validate('88', state).ok, true);
  assert.equal(engine.validate('89', state).entitlement, 'SVIP5');
  assert.equal(engine.validate('AAA', state).error, 'This Pretty ID is not available.');
  assert.equal(engine.validate('88', engine.createState({ route: 'svip', svip: 4 })).error, 'Unlock at SVIP5.');
  assert.equal(engine.validate('88', engine.createState({ route: 'wealth', level: 0, svip: 5 })).error, 'Unlock at Wealth Level LV95.');

  const expired = engine.createState({ route: 'svip', svip: 5, svipActive: false });
  const result = engine.redeem('88', expired, 'expired-op');
  assert.equal(result.error, 'Your SVIP redemption entitlement has expired.');
  assert.deepEqual(result.state, expired);
});

