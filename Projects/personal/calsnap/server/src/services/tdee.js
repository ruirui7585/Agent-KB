const ACTIVITY = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calcBMR(gender, heightCm, weightKg, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calcTDEE(bmr, activityLevel) {
  const coef = ACTIVITY[activityLevel] || 1.2;
  return Math.round(bmr * coef);
}

export function calcCalorieDelta(intake, tdee) {
  return Math.round(intake - tdee);
}
