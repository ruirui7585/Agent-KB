function renderBarcode() {
  document.getElementById('content').innerHTML = `
    <div class="page-header"><h1>扫码查询</h1></div>

    <div class="card">
      <div class="barcode-viewport">
        <div class="barcode-placeholder">📱</div>
      </div>

      <div class="meal-select">
        <label>餐别</label>
        <select id="barcode-meal-select">
          ${Object.entries(CONFIG.MEAL_LABELS).map(([k, v]) => `<option value="${k}" ${k === 'breakfast' ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>

      <p class="text-gray text-center" style="margin: 24px 0; font-size: 14px;">
        扫码功能将在后续版本开放<br>
        敬请期待
      </p>
    </div>
  `;
}
