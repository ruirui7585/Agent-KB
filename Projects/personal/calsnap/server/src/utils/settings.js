export const SETTING_DEFINITIONS = Object.freeze({
  daily_cal_goal: {
    min: 500,
    max: 10000,
    error: '热量目标必须在 500–10000 kcal 之间',
  },
  daily_protein_goal: {
    min: 20,
    max: 400,
    defaultValue: 80,
    error: '蛋白质目标必须在 20–400 g 之间',
  },
  daily_carbs_goal: {
    min: 20,
    max: 800,
    defaultValue: 180,
    error: '碳水目标必须在 20–800 g 之间',
  },
  daily_fat_goal: {
    min: 10,
    max: 300,
    defaultValue: 45,
    error: '脂肪目标必须在 10–300 g 之间',
  },
});

export const SETTING_KEYS = Object.freeze(Object.keys(SETTING_DEFINITIONS));

export function parseSettingsRows(rows = []) {
  const settings = {};

  for (const row of rows) {
    if (!Object.hasOwn(SETTING_DEFINITIONS, row.key)) continue;
    const value = Number.parseInt(row.value, 10);
    if (Number.isFinite(value)) settings[row.key] = value;
  }

  for (const [key, definition] of Object.entries(SETTING_DEFINITIONS)) {
    if (!Object.hasOwn(settings, key) && Number.isFinite(definition.defaultValue)) {
      settings[key] = definition.defaultValue;
    }
  }

  return settings;
}

export function normalizeSettingsUpdates(updates = {}) {
  const allowedUpdates = {};

  for (const [key, definition] of Object.entries(SETTING_DEFINITIONS)) {
    if (!Object.hasOwn(updates, key)) continue;
    const value = Number.parseInt(updates[key], 10);
    if (!Number.isFinite(value) || value < definition.min || value > definition.max) {
      const error = new Error(definition.error);
      error.statusCode = 400;
      throw error;
    }
    allowedUpdates[key] = String(value);
  }

  return allowedUpdates;
}
