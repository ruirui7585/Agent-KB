// ========== 心愿礼物轮播数据（6 项，对应截图中的 6 个指示点）==========
const WISH_GIFTS = [
  { id: 'rose',     name: 'Rose',          color: '#e85a7a' },
  { id: 'lily',     name: 'Lily',          color: '#f0a0e0' },
  { id: 'crystal',  name: 'Crystal Heart', color: '#7ec8e8' },
  { id: 'crown',    name: 'Royal Crown',   color: '#f0c14b' },
  { id: 'necklace', name: 'Necklace',      color: '#a78bfa' },
  { id: 'ring',     name: 'Diamond Ring',  color: '#6ee7b7' }
];

let wishGiftIndex = 0;
let wishGiftTimer = null;

// ========== 渲染当前礼物到入口 Banner ==========
function renderWishGift() {
  const entry = document.getElementById('wishGiftEntry');
  if (!entry) return;

  const gift = WISH_GIFTS[wishGiftIndex];
  const iconEl = document.getElementById('wgeIcon');
  const dotsEl = document.getElementById('wgeDots');

  // 切换动画
  entry.style.opacity = '0';
  entry.style.transform = 'scale(.96)';

  setTimeout(() => {
    // 切换图标颜色主题（通过 SVG fill 色调变化暗示不同礼物）
    const svg = iconEl ? iconEl.querySelector('svg') : null;
    if (svg) {
      const stops = svg.querySelectorAll('stop');
      if (stops.length >= 4) {
        stops[0].setAttribute('stop-color', gift.color);
        stops[1].setAttribute('stop-color', adjustColor(gift.color, -20));
        stops[2].setAttribute('stop-color', adjustColor(gift.color, -10));
        stops[3].setAttribute('stop-color', adjustColor(gift.color, -30));
      }
    }
    entry.style.opacity = '1';
    entry.style.transform = 'scale(1)';
  }, 120);

  // 更新 6 个指示点（与截图一致）
  if (dotsEl) {
    dotsEl.innerHTML = WISH_GIFTS.map((_, i) =>
      '<span class="dot' + (i === wishGiftIndex ? ' active' : '') + '"></span>'
    ).join('');
  }
}

// 颜色辅助：明暗微调
function adjustColor(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ========== 切换控制 ==========
function nextWishGift() {
  wishGiftIndex = (wishGiftIndex + 1) % WISH_GIFTS.length;
  renderWishGift();
}
function goToWishGift(index) {
  if (index >= 0 && index < WISH_GIFTS.length) {
    wishGiftIndex = index; renderWishGift();
  }
}

// ========== 自动轮播 ==========
function startWishGiftCarousel() {
  stopWishGiftCarousel();
  wishGiftTimer = setInterval(nextWishGift, 3000);
}
function stopWishGiftCarousel() {
  if (wishGiftTimer) { clearInterval(wishGiftTimer); wishGiftTimer = null; }
}

// ========== 点击入口 ==========
function handleWishGiftClick() {
  const gift = WISH_GIFTS[wishGiftIndex];
  const toast = document.getElementById('wishToast');
  if (toast) {
    toast.textContent = '\uD83C\uDF81 ' + gift.name + ' \u2014 Opening...';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }
  console.log('[Wish Gift] clicked:', gift.id, gift.name);
}

// ========== 发送消息 ==========
function sendImMessage() {
  var input = document.getElementById('imInput');
  var msg = (input.textContent || '').trim();
  if (!msg || msg === 'Say something...') return;
  console.log('[IM] send:', msg);
  input.textContent = 'Say something...';
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function () {
  renderWishGift();        // 渲染首屏 + 6 个指示点
  startWishGiftCarousel(); // 启动 3s 自动轮播
});
