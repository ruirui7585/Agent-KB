function showLoader(msg) {
  document.getElementById('content').innerHTML = `
    <div class="loader-box">
      <div class="spinner"></div>
      <p>${msg || '加载中...'}</p>
    </div>
  `;
}

function showAnalyzing(mode = 'photo') {
  const resultZone = document.getElementById('result-zone');
  if (!resultZone) return;
  const isWeightMode = mode === 'weight';

  resultZone.innerHTML = `
    <div class="analysis-card" role="status" aria-live="polite">
      <div class="analysis-head">
        <div class="analysis-pulse" aria-hidden="true"><span></span></div>
        <div>
          <p class="analyze-text" id="analysis-title">${isWeightMode ? '正在核对食物克重' : '正在上传图片'}</p>
          <p class="analyze-hint" id="analysis-hint">${isWeightMode ? 'AI 将按实际重量换算热量与营养' : '正在准备清晰图片，通常需要 5–15 秒'}</p>
        </div>
      </div>
      <div class="analysis-progress" aria-hidden="true">
        <span id="analysis-progress-bar"></span>
      </div>
      <div class="analysis-meta">
        <span id="analysis-elapsed">已等待 0 秒</span>
        <span id="analysis-percent">12%</span>
      </div>
      <div class="analysis-steps" aria-label="识别进度">
        <span class="active" data-analysis-step="upload">${isWeightMode ? '核对克重' : '上传图片'}</span>
        <span data-analysis-step="recognize">${isWeightMode ? '计算热量' : '识别食物'}</span>
        <span data-analysis-step="result">整理结果</span>
      </div>
      <button class="analysis-cancel" id="btn-cancel-analysis" type="button">取消${isWeightMode ? '计算' : '识别'}</button>
    </div>
  `;
}

function updateAnalyzing({ title, hint, elapsed, percent, step }) {
  const titleNode = document.getElementById('analysis-title');
  const hintNode = document.getElementById('analysis-hint');
  const elapsedNode = document.getElementById('analysis-elapsed');
  const percentNode = document.getElementById('analysis-percent');
  const progressNode = document.getElementById('analysis-progress-bar');
  if (!titleNode || !hintNode || !elapsedNode || !percentNode || !progressNode) return;

  titleNode.textContent = title;
  hintNode.textContent = hint;
  elapsedNode.textContent = `已等待 ${elapsed} 秒`;
  percentNode.textContent = `${percent}%`;
  progressNode.style.width = `${percent}%`;

  const order = ['upload', 'recognize', 'result'];
  const activeIndex = order.indexOf(step);
  document.querySelectorAll('[data-analysis-step]').forEach((node) => {
    const index = order.indexOf(node.dataset.analysisStep);
    node.classList.toggle('active', index === activeIndex);
    node.classList.toggle('done', index < activeIndex);
  });
}
