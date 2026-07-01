let currentPage = 'dashboard';
let pageHistory = [];
const DATA_DEPENDENT_PAGES = new Set(['dashboard', 'history', 'trends', 'exercise', 'settings']);
const DATA_REVISION_KEY = 'calsnap_data_revision';

const pages = {
  dashboard: renderDashboard,
  camera: renderCamera,
  barcode: renderBarcode,
  history: renderHistory,
  exercise: renderExercise,
  trends: renderTrends,
  settings: renderSettings,
};

async function navigate(page) {
  if (page !== currentPage) {
    pageHistory.push(currentPage);
    currentPage = page;
  }

  renderTabbar(page);
  document.getElementById('content').innerHTML = '';

  const renderFn = pages[page];
  if (renderFn) {
    try {
      await renderFn();
    } catch (err) {
      document.getElementById('content').innerHTML =
        `<div class="card error-card"><p>❌ 页面加载失败: ${esc(err.message)}</p></div>`;
    }
  }
}

function goBack() {
  const prev = pageHistory.pop() || 'dashboard';
  currentPage = prev;
  navigate(prev);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

function notifyAppDataChanged(source) {
  const revision = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(DATA_REVISION_KEY, revision);
  window.dispatchEvent(new CustomEvent('calsnap:data-changed', {
    detail: { source, revision },
  }));
}

window.addEventListener('storage', (event) => {
  if (event.key !== DATA_REVISION_KEY || !DATA_DEPENDENT_PAGES.has(currentPage)) return;
  navigate(currentPage);
});

// Init
document.addEventListener('DOMContentLoaded', () => navigate('dashboard'));
