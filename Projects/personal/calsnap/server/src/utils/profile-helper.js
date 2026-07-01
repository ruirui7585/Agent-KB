import db from '../db.js';
import { calcBMR, calcTDEE } from '../services/tdee.js';

export function getTDEE() {
  const p = getProfileMap();
  if (!p.gender || !p.height_cm || !p.weight_kg || !p.age) return null;
  const bmr = calcBMR(p.gender, parseFloat(p.height_cm), parseFloat(p.weight_kg), parseInt(p.age));
  return calcTDEE(bmr, p.activity_level || 'sedentary');
}

export function getProfileMap() {
  const rows = db.prepare('SELECT key, value FROM profile').all();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function getBaselineExpenditure() {
  const p = getProfileMap();
  const manualBaseline = Number.parseInt(p.baseline_expenditure_override, 10);
  if (Number.isFinite(manualBaseline) && manualBaseline >= 500 && manualBaseline <= 5000) {
    return manualBaseline;
  }
  if (!p.gender || !p.height_cm || !p.weight_kg || !p.age) return 1400;
  const bmr = calcBMR(p.gender, parseFloat(p.height_cm), parseFloat(p.weight_kg), parseInt(p.age));
  return calcTDEE(bmr, 'sedentary');
}

export function getGoal() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'daily_cal_goal'").get();
  if (row) return parseInt(row.value, 10);
  return getTDEE() || 2000;
}
