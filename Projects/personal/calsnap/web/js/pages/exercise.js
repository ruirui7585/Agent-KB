let exerciseState = { type: 'walking', intensity: 'moderate', duration: 40, calories: 0, weight: 70 };

const EXERCISE_MET = { walking: 3.5, running: 8.3, cycling: 6.8, strength: 5, swimming: 6, yoga: 2.8, other: 4 };
const EXERCISE_FACTOR = { light: 0.75, moderate: 1, high: 1.3 };

function estimateExercise() {
  return Math.round((EXERCISE_MET[exerciseState.type] || 4)
    * (EXERCISE_FACTOR[exerciseState.intensity] || 1)
    * exerciseState.weight * exerciseState.duration / 60);
}

async function renderExercise() {
  try {
    const profile = await API.getProfile();
    exerciseState.weight = Number(profile.weight_kg) || 70;
  } catch {}
  exerciseState.calories = estimateExercise();

  document.getElementById('content').innerHTML = `
    <div class="subpage-header"><button onclick="navigate('dashboard')">‹</button><h1>记录运动</h1><span></span></div>
    <p class="page-lead">告诉我你今天完成了什么运动</p>
    <section class="card exercise-form-card">
      <label class="field-title">运动类型</label>
      <div class="exercise-type-grid">
        ${Object.entries(CONFIG.EXERCISE_LABELS).map(([key, label]) => `
          <button class="exercise-type ${key === exerciseState.type ? 'active' : ''}" data-exercise="${key}">
            <span>${CONFIG.EXERCISE_EMOJI[key]}</span><small>${label}</small>
          </button>`).join('')}
      </div>

      <label class="field-title">运动强度</label>
      <div class="segmented" id="intensity-segment">
        <button data-intensity="light">轻松</button>
        <button class="active" data-intensity="moderate">中等</button>
        <button data-intensity="high">高强度</button>
      </div>

      <div class="duration-head"><label class="field-title">运动时间</label><b><span id="duration-value">${exerciseState.duration}</span> 分钟</b></div>
      <input type="range" id="duration-range" min="10" max="120" step="5" value="${exerciseState.duration}">
      <div class="range-labels"><span>10</span><span>30</span><span>60</span><span>90</span><span>120</span></div>

      <div class="calorie-estimate">
        <span>预计消耗</span><div><input type="number" id="exercise-calories" value="${exerciseState.calories}" min="1" max="10000"><b>kcal</b></div>
        <small>基于体重、运动类型、时长和强度估算，可手动修改</small>
      </div>

      <label class="field-title" for="exercise-note">备注（可选）</label>
      <input class="input" id="exercise-note" maxlength="160" placeholder="例如：晚饭后快走">
    </section>
    <button class="btn btn-primary btn-block sticky-primary" id="save-exercise">保存运动</button>
  `;

  const refreshEstimate = () => {
    exerciseState.calories = estimateExercise();
    document.getElementById('exercise-calories').value = exerciseState.calories;
    document.getElementById('duration-value').textContent = exerciseState.duration;
  };
  document.querySelectorAll('[data-exercise]').forEach((button) => {
    button.onclick = () => {
      exerciseState.type = button.dataset.exercise;
      document.querySelectorAll('[data-exercise]').forEach((item) => item.classList.toggle('active', item === button));
      refreshEstimate();
    };
  });
  document.querySelectorAll('[data-intensity]').forEach((button) => {
    button.onclick = () => {
      exerciseState.intensity = button.dataset.intensity;
      document.querySelectorAll('[data-intensity]').forEach((item) => item.classList.toggle('active', item === button));
      refreshEstimate();
    };
  });
  document.getElementById('duration-range').oninput = (event) => {
    exerciseState.duration = Number(event.target.value);
    refreshEstimate();
  };
  document.getElementById('save-exercise').onclick = async () => {
    const button = document.getElementById('save-exercise');
    button.disabled = true;
    button.textContent = '保存中...';
    try {
      await API.saveExercise({
        exercise_type: exerciseState.type,
        duration_minutes: exerciseState.duration,
        intensity: exerciseState.intensity,
        calories: Number(document.getElementById('exercise-calories').value),
        note: document.getElementById('exercise-note').value,
      });
      showToast('运动已保存');
      navigate('dashboard');
    } catch (err) {
      button.disabled = false;
      button.textContent = '保存运动';
      showToast(err.message || '保存失败');
    }
  };
}
