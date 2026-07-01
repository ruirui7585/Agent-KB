const API = {
  async _request(url, opts = {}) {
    const headers = { ...(opts.headers || {}) };

    const res = await fetch(url, { ...opts, headers, cache: 'no-store' });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  async _fetch(path, opts = {}) {
    const url = CONFIG.API_BASE + path;
    return this._request(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
  },

  async analyzeFood(file, { signal } = {}) {
    const form = new FormData();
    form.append('image', file);
    return this._request(CONFIG.API_BASE + '/food/analyze', {
      method: 'POST',
      body: form,
      signal,
    });
  },

  async calculateFoodByWeight(foods, { signal } = {}) {
    return this._fetch('/food/calculate', {
      method: 'POST',
      body: JSON.stringify({ foods }),
      signal,
    });
  },

  async saveRecord(record) { return this._fetch('/records', { method: 'POST', body: JSON.stringify(record) }); },
  async getRecords(date) { return this._fetch('/records?date=' + encodeURIComponent(date)); },
  async deleteRecord(id) { return this._fetch('/records/' + id, { method: 'DELETE' }); },
  async getExercises(date) { return this._fetch('/exercises?date=' + encodeURIComponent(date)); },
  async saveExercise(exercise) { return this._fetch('/exercises', { method: 'POST', body: JSON.stringify(exercise) }); },
  async deleteExercise(id) { return this._fetch('/exercises/' + id, { method: 'DELETE' }); },
  async getStats(range = 7) { return this._fetch('/stats?range=' + range); },
  async getSettings() { return this._fetch('/settings'); },
  async updateSettings(settings) { return this._fetch('/settings', { method: 'PUT', body: JSON.stringify(settings) }); },
  async getProfile() { return this._fetch('/profile'); },
  async updateProfile(profile) { return this._fetch('/profile', { method: 'PUT', body: JSON.stringify(profile) }); },

  async healthCheck() {
    try { await this._request(CONFIG.API_BASE + '/health'); return true; } catch { return false; }
  }
};
