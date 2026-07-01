const BASE_MET = {
  walking: 3.5,
  running: 8.3,
  cycling: 6.8,
  strength: 5,
  swimming: 6,
  yoga: 2.8,
  other: 4,
};

const INTENSITY_FACTOR = {
  light: 0.75,
  moderate: 1,
  high: 1.3,
};

export function estimateExerciseCalories(type, durationMinutes, intensity = 'moderate', weightKg = 70) {
  const met = BASE_MET[type] || BASE_MET.other;
  const factor = INTENSITY_FACTOR[intensity] || 1;
  const duration = Math.max(1, Math.min(Number(durationMinutes) || 0, 600));
  const weight = Math.max(20, Math.min(Number(weightKg) || 70, 300));
  return Math.round(met * factor * weight * duration / 60);
}

export function normalizeExerciseInput(input = {}, weightKg = 70) {
  const allowedTypes = new Set(Object.keys(BASE_MET));
  const allowedIntensity = new Set(Object.keys(INTENSITY_FACTOR));
  const exerciseType = allowedTypes.has(input.exercise_type) ? input.exercise_type : null;
  const intensity = allowedIntensity.has(input.intensity) ? input.intensity : 'moderate';
  const durationMinutes = Math.round(Number(input.duration_minutes) || 0);
  const estimated = estimateExerciseCalories(exerciseType, durationMinutes, intensity, weightKg);
  const suppliedCalories = Math.round(Number(input.calories) || 0);

  return {
    exercise_type: exerciseType,
    intensity,
    duration_minutes: durationMinutes,
    calories: suppliedCalories > 0 ? suppliedCalories : estimated,
    estimated_calories: estimated,
    note: String(input.note || '').trim().slice(0, 160),
  };
}
