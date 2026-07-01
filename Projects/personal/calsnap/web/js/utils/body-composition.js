(function registerBodyComposition(root) {
  const KCAL_PER_KG_FAT = 7700;

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function estimateBodyFatPercentage(profile = {}) {
    const providedBodyFatPct = Number(profile.body_fat_pct);
    if (Number.isFinite(providedBodyFatPct)
      && providedBodyFatPct >= 3
      && providedBodyFatPct <= 60) {
      return round(providedBodyFatPct, 1);
    }

    const heightCm = Number(profile.height_cm);
    const weightKg = Number(profile.weight_kg);
    const age = Number(profile.age);
    const gender = profile.gender;

    if (!['male', 'female'].includes(gender)
      || !Number.isFinite(heightCm)
      || !Number.isFinite(weightKg)
      || !Number.isFinite(age)
      || heightCm <= 0
      || weightKg <= 0
      || age < 18) {
      return null;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM ** 2);
    const sexFactor = gender === 'male' ? 1 : 0;
    const estimate = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
    const minimum = gender === 'male' ? 3 : 10;
    const maximum = gender === 'male' ? 50 : 60;

    return round(clamp(estimate, minimum, maximum), 1);
  }

  function projectBodyFatPercentage(weightKg, currentBodyFatPct, fatChangeKg, gender) {
    const futureWeight = weightKg + fatChangeKg;
    const futureFatMass = weightKg * currentBodyFatPct / 100 + fatChangeKg;
    if (futureWeight <= 0 || futureFatMass <= 0) return null;

    const minimum = gender === 'male' ? 3 : 10;
    const maximum = gender === 'male' ? 50 : 60;
    return round(clamp(futureFatMass / futureWeight * 100, minimum, maximum), 1);
  }

  function buildProjection(calorieDelta, profile = {}) {
    const dailyDelta = Number.isFinite(Number(calorieDelta)) ? Number(calorieDelta) : 0;
    const dailyFatChangeKg = dailyDelta / KCAL_PER_KG_FAT;
    const fatChange = {
      today_kg: round(dailyFatChangeKg, 2),
      week_kg: round(dailyFatChangeKg * 7, 2),
      month_kg: round(dailyFatChangeKg * 30, 2),
    };

    const currentBodyFatPct = estimateBodyFatPercentage(profile);
    const weightKg = Number(profile.weight_kg);
    if (currentBodyFatPct === null || !Number.isFinite(weightKg)) {
      return {
        available: false,
        calorie_delta: Math.round(dailyDelta),
        kcal_per_kg_fat: KCAL_PER_KG_FAT,
        fat_change: fatChange,
      };
    }

    const weekPct = projectBodyFatPercentage(
      weightKg,
      currentBodyFatPct,
      fatChange.week_kg,
      profile.gender
    );
    const monthPct = projectBodyFatPercentage(
      weightKg,
      currentBodyFatPct,
      fatChange.month_kg,
      profile.gender
    );

    return {
      available: weekPct !== null && monthPct !== null,
      calorie_delta: Math.round(dailyDelta),
      kcal_per_kg_fat: KCAL_PER_KG_FAT,
      fat_change: fatChange,
      body_fat: {
        current_pct: currentBodyFatPct,
        week_pct: weekPct,
        month_pct: monthPct,
        week_change_pct: weekPct === null ? null : round(weekPct - currentBodyFatPct, 1),
        month_change_pct: monthPct === null ? null : round(monthPct - currentBodyFatPct, 1),
      },
      method: Number.isFinite(Number(profile.body_fat_pct))
        && Number(profile.body_fat_pct) >= 3
        && Number(profile.body_fat_pct) <= 60
        ? 'provided_body_fat'
        : 'bmi_age_gender_estimate',
    };
  }

  function buildHistoricalTrend(daily = [], profile = {}) {
    const rows = Array.isArray(daily) ? daily : [];
    const changes = rows.map((item) => {
      if (item?.has_data === false) return 0;
      const balance = Number(item?.balance);
      return Number.isFinite(balance) ? balance / KCAL_PER_KG_FAT : 0;
    });
    const totalFatChange = changes.reduce((sum, value) => sum + value, 0);
    const currentWeight = Number(profile.weight_kg);
    const currentBodyFatPct = estimateBodyFatPercentage(profile);
    const hasBodyProfile = Number.isFinite(currentWeight)
      && currentWeight > 0
      && currentBodyFatPct !== null;
    let runningWeight = hasBodyProfile ? currentWeight - totalFatChange : null;
    let runningFatMass = hasBodyProfile
      ? currentWeight * currentBodyFatPct / 100 - totalFatChange
      : null;
    const profileIsUsable = hasBodyProfile && runningWeight > 0 && runningFatMass > 0;
    let cumulativeFatChange = 0;

    const series = rows.map((item, index) => {
      const fatChange = changes[index];
      cumulativeFatChange += fatChange;
      if (profileIsUsable) {
        runningWeight += fatChange;
        runningFatMass += fatChange;
      }
      const estimatedBodyFatPct = profileIsUsable
        ? clamp(runningFatMass / runningWeight * 100, profile.gender === 'male' ? 3 : 10, profile.gender === 'male' ? 50 : 60)
        : null;

      return {
        date: item?.date || '',
        has_data: item?.has_data !== false,
        calorie_delta: Math.round(Number(item?.balance) || 0),
        fat_change_kg: round(fatChange, 3),
        cumulative_fat_change_kg: round(cumulativeFatChange, 2),
        estimated_weight_kg: profileIsUsable ? round(runningWeight, 2) : null,
        estimated_body_fat_pct: estimatedBodyFatPct === null ? null : round(estimatedBodyFatPct, 1),
      };
    });

    return {
      available: profileIsUsable,
      series,
      total_fat_change_kg: round(totalFatChange, 2),
      method: 'calorie_balance_reconstruction',
    };
  }

  root.BodyComposition = Object.freeze({
    KCAL_PER_KG_FAT,
    estimateBodyFatPercentage,
    projectBodyFatPercentage,
    buildProjection,
    buildHistoricalTrend,
  });
})(globalThis);
