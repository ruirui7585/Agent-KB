// ===== DOM 元素 =====
const fileInput = document.getElementById('file-input');
const uploadZone = document.getElementById('upload-zone');
const uploadIcon = document.getElementById('upload-icon');
const uploadText = document.getElementById('upload-text');
const preview = document.getElementById('preview');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const errorCard = document.getElementById('error-card');
const resultCard = document.getElementById('result-card');
const resetBtn = document.getElementById('reset-btn');

let selectedFile = null;

// ===== 点击上传区域 → 弹出文件选择 =====
uploadZone.addEventListener('click', () => fileInput.click());

// 支持拖拽
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#22c55e'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// ===== 文件选择 =====
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  // 校验格式
  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowed.includes(file.type)) {
    showError('不支持的图片格式，仅支持 PNG、JPG、JPEG');
    return;
  }
  // 校验大小
  if (file.size > 5 * 1024 * 1024) {
    showError('图片过大，最大 5MB');
    return;
  }

  selectedFile = file;

  // 预览
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    uploadIcon.classList.add('hidden');
    uploadText.classList.add('hidden');
    analyzeBtn.classList.remove('hidden');
  };
  reader.readAsDataURL(file);

  // 隐藏旧结果
  errorCard.classList.add('hidden');
  resultCard.classList.add('hidden');
}

// ===== 分析按钮 =====
analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  // 显示 loading
  analyzeBtn.classList.add('hidden');
  loading.classList.remove('hidden');
  errorCard.classList.add('hidden');
  resultCard.classList.add('hidden');

  const form = new FormData();
  form.append('image', selectedFile);

  try {
    const res = await fetch('/api/analyze-food', { method: 'POST', body: form });
    const data = await res.json();

    if (!data.success) {
      showError(data.error || '识别失败，请重试');
      return;
    }

    // 填充结果
    document.getElementById('res-name').textContent = data.data.food_name;
    document.getElementById('res-cal').textContent = data.data.estimated_calories + ' 千卡';
    document.getElementById('res-range').textContent = data.data.calorie_range || '-';
    document.getElementById('res-ingredients').textContent = data.data.ingredients.join('、') || '-';
    document.getElementById('res-confidence').textContent = data.data.confidence;
    document.getElementById('res-explanation').textContent = data.data.explanation || '-';

    resultCard.classList.remove('hidden');
  } catch (err) {
    showError('网络请求失败，请检查连接');
  } finally {
    loading.classList.add('hidden');
  }
});

// ===== 重置 =====
resetBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  preview.src = '';
  preview.classList.add('hidden');
  uploadIcon.classList.remove('hidden');
  uploadText.classList.remove('hidden');
  analyzeBtn.classList.add('hidden');
  resultCard.classList.add('hidden');
  errorCard.classList.add('hidden');
});

function showError(msg) {
  loading.classList.add('hidden');
  analyzeBtn.classList.remove('hidden');
  errorCard.textContent = '❌ ' + msg;
  errorCard.classList.remove('hidden');
}
