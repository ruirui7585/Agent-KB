// ===== DOM Refs =====
var btnBlock = document.getElementById('btnBlock');
var btnDelete = document.getElementById('btnDelete');
var btnAccept = document.getElementById('btnAccept');
var actionBar = document.getElementById('actionBar');
var toast = document.getElementById('toast');

// ===== State =====
var profileState = 'default'; // default | accepted | blocked | deleted

// ===== Toast =====
var toastTimer = null;

function showToast(msg, type) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast ' + (type || '');
  // force reflow then show
  toast.offsetHeight;
  toast.classList.add('show');
  toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
}

// ===== BLOCK =====
btnBlock.addEventListener('click', function() {
  if (profileState === 'blocked') {
    showToast('Already blocked', 'warning');
    return;
  }
  profileState = 'blocked';
  actionBar.className = 'action-bar blocked';
  showToast('User blocked', 'error');
});

// ===== DELETE =====
btnDelete.addEventListener('click', function() {
  if (profileState === 'deleted') {
    showToast('Already deleted', 'warning');
    return;
  }
  profileState = 'deleted';
  actionBar.className = 'action-bar deleted';
  showToast('Request deleted', 'warning');
});

// ===== ACCEPT =====
btnAccept.addEventListener('click', function() {
  if (profileState === 'accepted') {
    showToast('Already accepted', 'success');
    return;
  }
  profileState = 'accepted';
  actionBar.className = 'action-bar accepted';
  showToast('Connection accepted — chat is now open', 'success');
});

// ===== Tab switching =====
document.querySelectorAll('.content-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.content-tab').forEach(function(t) {
      t.classList.remove('active');
    });
    this.classList.add('active');
  });
});

// ===== Init =====
console.log('laka — Profile ready');
console.log('Actions: Block | Delete | Accept');
