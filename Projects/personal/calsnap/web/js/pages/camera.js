let cameraState = {
  file: null,
  result: null,
  mealType: 'breakfast',
  mode: 'photo',
  manualFoods: [{ name: '', weight_g: '' }],
  analysis: null,
};
let cameraSelfTestStarted = false;
let cameraRequestSequence = 0;
let ingredientEditorState = null;

function renderCamera() {
  closeIngredientEditor();
  cancelActiveAnalysis(false);
  cameraRequestSequence += 1;
  cameraState = {
    file: null,
    result: null,
    mealType: 'breakfast',
    mode: 'photo',
    manualFoods: [{ name: '', weight_g: '' }],
    analysis: null,
  };

  const content = document.getElementById('content');
  content.classList.remove('camera-result-view');
  content.innerHTML = `
    <div class="page-header camera-page-header">
      <h1>记录饮食</h1>
      <p class="page-lead">选择一种方式计算本餐热量</p>
    </div>
    <div class="food-entry-modes" role="tablist" aria-label="热量计算方式">
      <button type="button" class="active" data-camera-mode="photo" role="tab" aria-selected="true">
        <span>📷</span><b>拍照估算</b><small>快速识别整份餐食</small>
      </button>
      <button type="button" data-camera-mode="weight" role="tab" aria-selected="false">
        <span>⚖️</span><b>按克重计算</b><small>已称重时更精准</small>
      </button>
    </div>
    <div id="camera-mode-panel"></div>
    <div id="result-zone"></div>
  `;

  document.querySelectorAll('[data-camera-mode]').forEach((button) => {
    button.onclick = () => setCameraMode(button.dataset.cameraMode);
  });
  renderCameraModePanel();
  runCameraSelfTest();
}

function mealButtons() {
  return Object.entries(CONFIG.MEAL_LABELS)
    .map(([key, label]) => {
      const active = cameraState.mealType === key;
      return `
        <button type="button" class="${active ? 'active' : ''}" data-meal-option="${key}" aria-pressed="${active}">
          <span>${CONFIG.MEAL_EMOJI[key]}</span><b>${label}</b>
        </button>`;
    })
    .join('');
}

function renderMealChoice() {
  return `
    <div class="meal-choice">
      <div class="meal-choice-head">
        <b>记录到</b><small>选择本餐类型</small>
      </div>
      <div class="meal-choice-buttons" role="group" aria-label="记录餐别">
        ${mealButtons()}
      </div>
    </div>`;
}

function renderCameraModePanel() {
  const panel = document.getElementById('camera-mode-panel');
  if (!panel) return;

  if (cameraState.mode === 'weight') {
    panel.innerHTML = `
      <div class="card weight-entry-card" id="camera-zone">
        <div class="weight-entry-intro">
          <span class="weight-entry-icon">⚖️</span>
          <div><b>输入食物实际重量</b><p>克重越准确，热量结果越可靠</p></div>
          <em>更精准</em>
        </div>
        <div class="manual-food-list" id="manual-food-list">
          ${cameraState.manualFoods.map((food, index) => `
            <div class="manual-food-row" data-manual-index="${index}">
              <label>
                <span>食物名称</span>
                <input class="input" data-manual-field="name" value="${esc(food.name)}" placeholder="如：熟米饭">
              </label>
              <label class="manual-weight-field">
                <span>实际克重</span>
                <div><input type="number" class="input" data-manual-field="weight_g" value="${esc(food.weight_g)}" min="1" max="5000" inputmode="decimal" placeholder="150"><i>g</i></div>
              </label>
              ${cameraState.manualFoods.length > 1 ? `<button class="manual-remove" type="button" data-manual-remove="${index}" aria-label="删除第${index + 1}项">×</button>` : ''}
            </div>
          `).join('')}
        </div>
        <button class="manual-add" id="btn-add-manual-food" type="button"><span>＋</span> 添加另一种食物</button>
        ${renderMealChoice()}
        <button class="btn btn-primary btn-block weight-calculate-btn" id="btn-calculate-weight" type="button">
          计算本餐热量 <span>→</span>
        </button>
        <p class="weight-caveat">结果会因品牌和烹饪方式略有差异，计算后仍可修改</p>
      </div>
    `;

    document.getElementById('btn-add-manual-food').onclick = addManualFood;
    document.querySelectorAll('[data-manual-remove]').forEach((button) => {
      button.onclick = () => removeManualFood(Number(button.dataset.manualRemove));
    });
    document.getElementById('btn-calculate-weight').onclick = calculateManualFoods;
  } else {
    panel.innerHTML = `
      <div class="card photo-entry-card" id="camera-zone">
        <div class="camera-placeholder" id="photo-preview">
          <div class="camera-icon">📷</div>
          <b>拍照或选择食物图片</b>
          <p>尽量拍全餐盘并保持光线清晰</p>
        </div>
        <input type="file" accept="image/*" capture="environment" id="file-input" class="hidden-input">
        ${renderMealChoice()}
        <div class="camera-actions">
          <button class="btn btn-secondary" id="btn-album">从相册选择</button>
          <button class="btn btn-primary" id="btn-camera">拍照识别</button>
        </div>
        <p class="photo-caveat">AI 将自动判断食物种类、份量和热量</p>
      </div>
    `;

    const fileInput = document.getElementById('file-input');
    document.getElementById('btn-camera').onclick = () => {
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
    };
    document.getElementById('btn-album').onclick = () => {
      fileInput.removeAttribute('capture');
      fileInput.click();
    };
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) handleFileSelect(file);
    };
    if (cameraState.file) previewPhoto(cameraState.file);
  }

  document.querySelectorAll('[data-meal-option]').forEach((button) => {
    button.onclick = () => {
      cameraState.mealType = button.dataset.mealOption;
      document.querySelectorAll('[data-meal-option]').forEach((item) => {
        const active = item.dataset.mealOption === cameraState.mealType;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    };
  });
}

function setCameraMode(mode) {
  if (!['photo', 'weight'].includes(mode) || mode === cameraState.mode) return;
  if (cameraState.mode === 'weight') syncManualFoods();
  cancelActiveAnalysis(false);
  cameraRequestSequence += 1;
  cameraState.mode = mode;
  cameraState.result = null;
  document.getElementById('result-zone').innerHTML = '';
  document.querySelectorAll('[data-camera-mode]').forEach((button) => {
    const active = button.dataset.cameraMode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  renderCameraModePanel();
}

function previewPhoto(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('photo-preview');
    if (preview) preview.innerHTML = `<img src="${event.target.result}" alt="待识别食物" class="preview-img">`;
  };
  reader.readAsDataURL(file);
}

function syncManualFoods() {
  const rows = document.querySelectorAll('[data-manual-index]');
  if (!rows.length) return cameraState.manualFoods;
  cameraState.manualFoods = Array.from(rows).map((row) => ({
    name: row.querySelector('[data-manual-field="name"]').value.trim(),
    weight_g: row.querySelector('[data-manual-field="weight_g"]').value,
  }));
  return cameraState.manualFoods;
}

function addManualFood() {
  syncManualFoods();
  if (cameraState.manualFoods.length >= 10) {
    showToast('一次最多添加 10 种食物');
    return;
  }
  cameraState.manualFoods.push({ name: '', weight_g: '' });
  renderCameraModePanel();
  document.querySelector('[data-manual-index]:last-child [data-manual-field="name"]')?.focus();
}

function removeManualFood(index) {
  syncManualFoods();
  cameraState.manualFoods.splice(index, 1);
  if (!cameraState.manualFoods.length) cameraState.manualFoods.push({ name: '', weight_g: '' });
  renderCameraModePanel();
}

function validateManualFoods() {
  const foods = syncManualFoods().map((food) => ({
    name: food.name,
    weight_g: Number.parseInt(food.weight_g, 10),
  }));
  for (let index = 0; index < foods.length; index += 1) {
    if (!foods[index].name) throw new Error(`请填写第 ${index + 1} 项食物名称`);
    if (!Number.isFinite(foods[index].weight_g) || foods[index].weight_g < 1 || foods[index].weight_g > 5000) {
      throw new Error(`第 ${index + 1} 项克重需在 1–5000g 之间`);
    }
  }
  return foods;
}

async function calculateManualFoods() {
  let foods;
  try {
    foods = validateManualFoods();
  } catch (error) {
    showToast(error.message);
    return;
  }
  cameraState.manualFoods = foods;
  await runFoodAnalysis(
    (signal) => API.calculateFoodByWeight(foods, { signal }),
    'weight'
  );
}

function retryCurrentAnalysis() {
  return cameraState.mode === 'weight' ? calculateManualFoods() : analyzeCurrentPhoto();
}

function resetCurrentEntry() {
  if (cameraState.mode === 'photo') {
    renderCamera();
    return;
  }
  document.getElementById('content')?.classList.remove('camera-result-view');
  cameraState.result = null;
  document.getElementById('result-zone').innerHTML = '';
  renderCameraModePanel();
  document.getElementById('camera-mode-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function runCameraSelfTest() {
  const isEnabled = new URLSearchParams(window.location.search).get('e2e') === 'rice';
  if (!isEnabled || cameraSelfTestStarted) return;

  cameraSelfTestStarted = true;
  try {
    const response = await fetch('/assets/test-food-rice.jpg?e2e=20260630');
    if (!response.ok) throw new Error(`测试图片加载失败：HTTP ${response.status}`);
    const blob = await response.blob();
    const file = new File([blob], 'test-food-rice.jpg', { type: 'image/jpeg' });
    await handleFileSelect(file);
  } catch (err) {
    const resultZone = document.getElementById('result-zone');
    if (resultZone) {
      resultZone.innerHTML = `<div class="card error-card"><p>❌ 自测失败：${esc(err.message)}</p></div>`;
    }
  }
}

async function handleFileSelect(file) {
  cameraState.file = file;
  cameraState.result = null;
  previewPhoto(file);
  await analyzeCurrentPhoto();
}

function setCameraControlsDisabled(disabled) {
  document.querySelectorAll(
    '[data-camera-mode], #camera-zone input, #camera-zone select, #camera-zone button'
  ).forEach((node) => {
    node.disabled = disabled;
  });
  document.getElementById('camera-zone')?.classList.toggle('is-analyzing', disabled);
}

function cancelActiveAnalysis(showCancelled = true) {
  const active = cameraState.analysis;
  if (!active) return;
  active.cancelReason = showCancelled ? 'user' : 'navigation';
  active.controller.abort();
}

function getAnalysisProgress(elapsedMs, mode = 'photo') {
  const seconds = Math.floor(elapsedMs / 1000);
  if (elapsedMs < 1500) {
    return {
      title: mode === 'weight' ? '正在核对食物克重' : '正在上传图片',
      hint: mode === 'weight' ? 'AI 将按实际重量换算热量与营养' : '正在准备清晰图片，通常需要 5–15 秒',
      elapsed: seconds,
      percent: Math.min(24, 12 + Math.floor(elapsedMs / 125)),
      step: 'upload',
    };
  }

  const percent = Math.min(90, 28 + Math.floor((elapsedMs - 1500) / 260));
  return {
    title: mode === 'weight' ? 'AI 正在计算热量' : 'AI 正在识别食物',
    hint: mode === 'weight'
      ? (elapsedMs >= 8000 ? '正在核对不同烹饪方式的营养差异' : '正在按每种食物的实际克重换算')
      : (elapsedMs >= 8000
        ? '复杂餐盘需要更仔细分析，结果出来前可以随时取消'
        : '正在判断食物种类、份量和热量'),
    elapsed: seconds,
    percent,
    step: 'recognize',
  };
}

async function analyzeCurrentPhoto() {
  if (!cameraState.file) return;
  await runFoodAnalysis(
    (signal) => API.analyzeFood(cameraState.file, { signal }),
    'photo'
  );
}

async function runFoodAnalysis(request, mode) {
  cancelActiveAnalysis(false);

  const requestId = ++cameraRequestSequence;
  const controller = new AbortController();
  const analysis = {
    controller,
    requestId,
    cancelReason: '',
    startedAt: Date.now(),
    intervalId: null,
    timeoutId: null,
  };
  cameraState.analysis = analysis;
  setCameraControlsDisabled(true);
  showAnalyzing(mode);

  const refreshProgress = () => {
    updateAnalyzing(getAnalysisProgress(Date.now() - analysis.startedAt, mode));
  };
  refreshProgress();
  analysis.intervalId = window.setInterval(refreshProgress, 250);
  analysis.timeoutId = window.setTimeout(() => {
    analysis.cancelReason = 'timeout';
    controller.abort();
  }, 40000);
  const cancelButton = document.getElementById('btn-cancel-analysis');
  if (cancelButton) cancelButton.onclick = () => cancelActiveAnalysis(true);

  try {
    const result = await request(controller.signal);
    if (requestId !== cameraRequestSequence) return;
    updateAnalyzing({
      title: mode === 'weight' ? '正在整理计算结果' : '正在整理识别结果',
      hint: '马上就好，正在汇总食物和热量',
      elapsed: Math.floor((Date.now() - analysis.startedAt) / 1000),
      percent: 96,
      step: 'result',
    });
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    if (requestId !== cameraRequestSequence) return;
    cameraState.result = result;
    showResult(result);
  } catch (err) {
    if (requestId !== cameraRequestSequence || analysis.cancelReason === 'navigation') return;
    const isCancelled = err?.name === 'AbortError' && analysis.cancelReason === 'user';
    const isTimeout = err?.name === 'AbortError' && analysis.cancelReason === 'timeout';
    showAnalysisError({
      title: isCancelled
        ? `已取消${mode === 'weight' ? '计算' : '识别'}`
        : (isTimeout ? `${mode === 'weight' ? '计算' : '识别'}时间较长，已暂停` : `${mode === 'weight' ? '计算' : '识别'}失败`),
      message: isCancelled
        ? (mode === 'weight' ? '填写内容已保留，你可以直接重新计算。' : '照片已保留，你可以直接重新识别。')
        : (isTimeout
          ? '本次等待超过 40 秒，可能是网络或 AI 服务繁忙。'
          : (err.message || '请检查网络后重试。')),
    });
  } finally {
    window.clearInterval(analysis.intervalId);
    window.clearTimeout(analysis.timeoutId);
    if (requestId === cameraRequestSequence) {
      cameraState.analysis = null;
      setCameraControlsDisabled(false);
    }
  }
}

function showAnalysisError({ title, message }) {
  const resultZone = document.getElementById('result-zone');
  if (!resultZone) return;
  resultZone.innerHTML = `
    <div class="card error-card analysis-error">
      <div class="analysis-error-icon">!</div>
      <div>
        <h2>${esc(title)}</h2>
        <p>${esc(message)}</p>
      </div>
      <div class="analysis-error-actions">
        <button class="btn btn-outline" type="button" onclick="resetCurrentEntry()">${cameraState.mode === 'weight' ? '修改克重' : '换一张照片'}</button>
        <button class="btn btn-primary" type="button" onclick="retryCurrentAnalysis()">重新${cameraState.mode === 'weight' ? '计算' : '识别'}</button>
      </div>
    </div>
  `;
}

function formatMacroGrams(value) {
  const grams = Number(value) || 0;
  return Number.isInteger(grams) ? String(grams) : grams.toFixed(1);
}

function renderNutritionDistribution(nutrition) {
  if (!nutrition.available) {
    return `
      <section class="result-nutrition nutrition-empty result-macro-panel" id="result-nutrition">
        <div class="nutrition-head"><b>三大营养素</b><small>暂无完整数据</small></div>
        <p>本次结果未返回完整的蛋白质、碳水和脂肪数据。</p>
      </section>`;
  }

  return `
    <section class="result-nutrition result-macro-panel" id="result-nutrition"
      aria-label="蛋白质 ${nutrition.protein_pct}%，碳水 ${nutrition.carbs_pct}%，脂肪 ${nutrition.fat_pct}%">
      <div class="nutrition-head"><b>三大营养素</b><small>按热量占比</small></div>
      <div class="result-macro-grid">
        <div class="macro-carbs"><span>⌁ 碳水</span><b>${formatMacroGrams(nutrition.carbs_g)}g</b><em>${nutrition.carbs_pct}%</em></div>
        <div class="macro-protein"><span>⌇ 蛋白质</span><b>${formatMacroGrams(nutrition.protein_g)}g</b><em>${nutrition.protein_pct}%</em></div>
        <div class="macro-fat"><span>◉ 脂肪</span><b>${formatMacroGrams(nutrition.fat_g)}g</b><em>${nutrition.fat_pct}%</em></div>
      </div>
    </section>`;
}

function refreshNutritionDistribution() {
  const node = document.getElementById('result-nutrition');
  if (!node || !cameraState.result) return;
  node.outerHTML = renderNutritionDistribution(
    FoodPortion.summarizeNutrition(cameraState.result.foods)
  );
}

function showResult(result) {
  if (!result.foods?.length) {
    document.getElementById('result-zone').innerHTML = `
      <div class="card error-card">
        <p>${cameraState.mode === 'weight' ? '没有计算出有效结果，请检查食物名称和克重。' : '没有识别到食物，请换一张更清晰的照片。'}</p>
        ${result.description ? `<p class="text-sm text-gray">${esc(result.description)}</p>` : ''}
        <button class="btn btn-outline" onclick="resetCurrentEntry()">${cameraState.mode === 'weight' ? '修改克重' : '重新拍摄'}</button>
      </div>
    `;
    return;
  }

  const resultImage = document.querySelector('#photo-preview img')?.src || '';
  const mealLabel = CONFIG.MEAL_LABELS[cameraState.mealType] || '本餐';
  document.getElementById('content')?.classList.add('camera-result-view');
  document.getElementById('result-zone').innerHTML = `
    <div class="result-experience">
      <div class="result-photo-stage ${resultImage ? '' : 'no-photo'}">
        ${resultImage
          ? `<img src="${resultImage}" alt="本餐识别图片" onerror="this.parentElement.classList.add('no-photo');this.remove()">`
          : ''}
        <div class="result-photo-fallback">
          <span>${cameraState.mode === 'weight' ? '⚖️' : '🍽️'}</span>
          <b>${cameraState.mode === 'weight' ? '按实际克重计算' : '餐盘图片暂不可用'}</b>
          <small>${cameraState.mode === 'weight' ? '本次未使用餐盘照片' : '识别结果和编辑功能不受影响'}</small>
        </div>
        <button type="button" class="result-stage-button back" onclick="resetCurrentEntry()" aria-label="返回修改">‹</button>
        <button type="button" class="result-stage-button retry" onclick="${cameraState.mode === 'weight' ? 'resetCurrentEntry()' : 'retryCurrentAnalysis()'}" aria-label="${cameraState.mode === 'weight' ? '修改克重' : '重新识别'}">↻</button>
        <span class="result-stage-status">${cameraState.mode === 'weight' ? '实际克重' : 'AI 识别完成'}</span>
      </div>

      <div class="result-sheet result-card">
        <div class="result-sheet-handle" aria-hidden="true"></div>
        <div class="result-meal-heading">
          <div>
            <small>${cameraState.mode === 'weight' ? '克重计算结果' : '识别结果'}</small>
            <h2>${cameraState.mode === 'weight' ? '本餐营养计算' : 'AI 识别餐盘'}</h2>
          </div>
          <span>${esc(CONFIG.MEAL_EMOJI[cameraState.mealType] || '🍽️')} ${esc(mealLabel)}</span>
        </div>

        <div class="result-primary-summary">
          <div>
            <small>本餐总热量</small>
            <strong id="result-total-cal">${fmtCal(result.total_calories)}<em>kcal</em></strong>
          </div>
          <div class="result-food-count"><b>${result.foods.length}</b><span>种食材</span></div>
        </div>

        ${renderNutritionDistribution(FoodPortion.summarizeNutrition(result.foods))}

        <div class="result-summary-copy">
          <span>AI</span>
          <div>
            ${result.description ? `<p>${esc(result.description)}</p>` : ''}
            <small>${result.caveat
              ? `影响因素：${esc(result.caveat)}`
              : (cameraState.mode === 'weight'
                ? '已按填写克重计算，请核对烹饪方式。'
                : '估算仅供参考，请核对食物和份量。')}</small>
          </div>
        </div>

        <div class="ingredient-section-head">
          <div><h3>食材 <small>(kcal)</small></h3><span>点击食材可修改名称、克重和热量</span></div>
          <em>${result.foods.length} 项</em>
        </div>

        <div class="food-list result-ingredient-grid" id="food-list">
          ${result.foods.map((f, i) => `
            <div class="food-item food-edit-row ingredient-card" data-index="${i}" role="button" tabindex="0" aria-label="修改${esc(f.name)}">
              <button class="food-remove" type="button" data-remove="${i}" aria-label="删除${esc(f.name)}">×</button>
              <div class="ingredient-card-summary">
                <b data-display-name>${esc(f.name)}</b>
                <strong><span data-display-calories>${f.calories || 0}</span><em>kcal</em></strong>
                <small><span data-display-weight>${f.weight_g || 0}</span>g · ${confidenceLabel(f.confidence)}置信度</small>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="result-actions">
          <button class="btn btn-outline" onclick="${cameraState.mode === 'weight' ? 'resetCurrentEntry()' : 'openResultEditor()'}">✦ ${cameraState.mode === 'weight' ? '修改克重' : '修正结果'}</button>
          <button class="btn btn-primary" id="btn-save">记录 <span>→</span></button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.ingredient-card').forEach((card) => {
    card.onclick = (event) => {
      if (event.target.closest('button')) return;
      openFoodEditor(Number(card.dataset.index));
    };
    card.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFoodEditor(Number(card.dataset.index));
      }
    };
  });
  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      syncEditedFoods();
      cameraState.result.foods.splice(Number(button.dataset.remove), 1);
      cameraState.result.total_calories = cameraState.result.foods
        .reduce((sum, food) => sum + (Number(food.calories) || 0), 0);
      showResult(cameraState.result);
    };
  });

  document.getElementById('btn-save').onclick = async () => {
    syncEditedFoods();
    if (!cameraState.result.foods.length) {
      showToast('请至少保留一项食物');
      return;
    }

    const button = document.getElementById('btn-save');
    button.disabled = true;
    button.innerHTML = '保存中...';
    try {
      await API.saveRecord({
        meal_type: cameraState.mealType,
        foods: cameraState.result.foods,
      });
      showToast('已保存');
      document.getElementById('content')?.classList.remove('camera-result-view');
      navigate('dashboard');
    } catch (err) {
      button.disabled = false;
      button.innerHTML = '记录 <span>→</span>';
      showToast(err.message || '保存失败');
    }
  };
}

function openResultEditor() {
  if (!cameraState.result?.foods?.length) return;
  openFoodEditor(0);
}

function openFoodEditor(index) {
  const food = cameraState.result?.foods?.[index];
  if (!food) return;

  closeIngredientEditor();
  ingredientEditorState = {
    index,
    basis: { ...food },
    draft: { ...food },
    scrollY: window.scrollY,
  };

  const layer = document.createElement('div');
  layer.id = 'ingredient-editor-layer';
  layer.className = 'ingredient-editor-layer';
  layer.innerHTML = `
    <button class="ingredient-editor-backdrop" type="button" aria-label="关闭食材修改页"></button>
    <section class="ingredient-editor-page" role="dialog" aria-modal="true" aria-labelledby="ingredient-editor-title">
      <header class="ingredient-editor-header">
        <button class="ingredient-editor-back" type="button" aria-label="返回">‹</button>
        <div><small>食材详情</small><h2 id="ingredient-editor-title">修改食材</h2></div>
        <button class="ingredient-editor-close" type="button" aria-label="关闭">×</button>
      </header>

      <div class="ingredient-editor-summary">
        <div><span>当前食材</span><strong id="ingredient-editor-preview-name">${esc(food.name)}</strong></div>
        <div><strong><b id="ingredient-editor-preview-calories">${fmtCal(food.calories || 0)}</b><em>kcal</em></strong><small id="ingredient-editor-preview-weight">${fmtCal(food.weight_g || 0)}g</small></div>
      </div>

      <form id="ingredient-editor-form" class="ingredient-editor-form">
        <label>
          <span>食物名称</span>
          <input class="input" id="ingredient-editor-name" value="${esc(food.name)}" maxlength="40" ${cameraState.mode === 'weight' ? 'readonly' : ''}>
        </label>
        <div class="ingredient-editor-number-grid">
          <label>
            <span>份量</span>
            <div><input type="number" class="input" id="ingredient-editor-weight" value="${food.weight_g || 0}" min="0" max="5000" inputmode="decimal" ${cameraState.mode === 'weight' ? 'readonly' : ''}><em>g</em></div>
          </label>
          <label>
            <span>热量</span>
            <div><input type="number" class="input" id="ingredient-editor-calories" value="${food.calories || 0}" min="0" max="10000" inputmode="decimal"><em>kcal</em></div>
          </label>
        </div>
        <div class="ingredient-editor-estimate">
          <span>估算范围 ${food.calorie_min || food.calories || 0}–${food.calorie_max || food.calories || 0} kcal</span>
          <em>${confidenceLabel(food.confidence)}置信度</em>
        </div>
        ${cameraState.mode === 'photo'
          ? '<p class="ingredient-editor-tip">修改份量后，热量与三大营养素会按识别基准同步换算；保存后才更新一级页面。</p>'
          : '<p class="ingredient-editor-tip">克重计算结果的食材和份量不可修改，可校正最终热量。</p>'}
        <div class="ingredient-editor-actions">
          <button class="btn btn-outline" type="button" id="ingredient-editor-cancel">取消</button>
          <button class="btn btn-primary" type="submit">保存修改</button>
        </div>
      </form>
    </section>
  `;

  document.body.appendChild(layer);
  document.body.classList.add('ingredient-editor-open');

  const nameInput = document.getElementById('ingredient-editor-name');
  const weightInput = document.getElementById('ingredient-editor-weight');
  const caloriesInput = document.getElementById('ingredient-editor-calories');

  const refreshPreview = () => {
    document.getElementById('ingredient-editor-preview-name').textContent = nameInput.value.trim() || '未命名食物';
    document.getElementById('ingredient-editor-preview-calories').textContent = fmtCal(Number(caloriesInput.value) || 0);
    document.getElementById('ingredient-editor-preview-weight').textContent = `${fmtCal(Number(weightInput.value) || 0)}g`;
  };

  nameInput.oninput = refreshPreview;
  caloriesInput.oninput = refreshPreview;
  if (cameraState.mode === 'photo') {
    weightInput.oninput = () => {
      const scaled = FoodPortion.scaleFoodByWeight(
        ingredientEditorState.basis,
        Number(weightInput.value)
      );
      ingredientEditorState.draft = { ...ingredientEditorState.draft, ...scaled };
      caloriesInput.value = scaled.calories || 0;
      refreshPreview();
    };
  }

  layer.querySelector('.ingredient-editor-backdrop').onclick = closeIngredientEditor;
  layer.querySelector('.ingredient-editor-back').onclick = closeIngredientEditor;
  layer.querySelector('.ingredient-editor-close').onclick = closeIngredientEditor;
  document.getElementById('ingredient-editor-cancel').onclick = closeIngredientEditor;
  document.getElementById('ingredient-editor-form').onsubmit = saveIngredientEditor;
  document.addEventListener('keydown', handleIngredientEditorKeydown);

  requestAnimationFrame(() => layer.classList.add('open'));
}

function saveIngredientEditor(event) {
  event.preventDefault();
  if (!ingredientEditorState || !cameraState.result) return;

  const name = document.getElementById('ingredient-editor-name').value.trim();
  if (!name) {
    showToast('请填写食物名称');
    return;
  }

  const weight = Number(document.getElementById('ingredient-editor-weight').value) || 0;
  const calories = Number(document.getElementById('ingredient-editor-calories').value) || 0;
  const nextFood = {
    ...ingredientEditorState.draft,
    name,
    weight_g: weight,
    calories,
  };
  const index = ingredientEditorState.index;
  const scrollY = ingredientEditorState.scrollY;
  cameraState.result.foods[index] = nextFood;
  refreshEditableTotal();
  closeIngredientEditor();
  showResult(cameraState.result);
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
  showToast('食材已更新');
}

function closeIngredientEditor() {
  const layer = document.getElementById('ingredient-editor-layer');
  if (layer) layer.remove();
  document.body.classList.remove('ingredient-editor-open');
  document.removeEventListener('keydown', handleIngredientEditorKeydown);
  ingredientEditorState = null;
}

function handleIngredientEditorKeydown(event) {
  if (event.key === 'Escape') closeIngredientEditor();
}

function confidenceLabel(value) {
  return ({ high: '高', medium: '中', low: '低' })[value] || '低';
}

function syncEditedFoods() {
  if (!cameraState.result) return;
  cameraState.result.foods = cameraState.result.foods.filter((food) => food.name);
  cameraState.result.total_calories = cameraState.result.foods
    .reduce((sum, food) => sum + (Number(food.calories) || 0), 0);
}

function refreshEditableTotal() {
  const total = (cameraState.result?.foods || [])
    .reduce((sum, food) => sum + (Number(food.calories) || 0), 0);
  if (cameraState.result) cameraState.result.total_calories = total;
  const totalNode = document.getElementById('result-total-cal');
  if (totalNode) totalNode.innerHTML = `${fmtCal(total)}<em>kcal</em>`;
  refreshNutritionDistribution();
}
