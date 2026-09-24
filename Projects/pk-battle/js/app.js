/* app.js — PK Battle prototype interactions */

(function () {
  'use strict';

  let cur = 1;
  let invTimer = null;

  function go(n) {
    document.getElementById('s' + cur).classList.remove('active');
    document.getElementById('nb' + cur).classList.remove('active');
    cur = n;
    document.getElementById('s' + n).classList.add('active');
    document.getElementById('nb' + n).classList.add('active');

    if (n === 4) {
      startInv();
    } else {
      clearInterval(invTimer);
      invTimer = null;
    }
  }

  function startInv() {
    clearInterval(invTimer);
    let t = 20;
    const el = document.getElementById('inv-cnt');
    if (!el) return;
    el.textContent = t + 's';
    invTimer = setInterval(function () {
      if (cur !== 4) { clearInterval(invTimer); return; }
      el.textContent = (--t) + 's';
      if (t <= 0) { clearInterval(invTimer); go(1); }
    }, 1000);
  }

  function pickDur(el) {
    document.querySelectorAll('.dur-opt').forEach(function (d) {
      d.classList.remove('sel');
    });
    el.classList.add('sel');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      go(Math.min(cur + 1, 12));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(Math.max(cur - 1, 1));
    }
  });

  /* expose to inline onclick handlers */
  window.go = go;
  window.pickDur = pickDur;
}());
