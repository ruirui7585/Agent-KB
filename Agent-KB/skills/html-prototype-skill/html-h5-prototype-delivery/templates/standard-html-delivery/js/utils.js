(function () {
  let toastTimer = null;

  window.PrototypeUtils = {
    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },

    getPageData(pageKey) {
      return window.ProductPrototypeData.pages[pageKey] || window.ProductPrototypeData.pages.home;
    },

    showToast(message, duration) {
      window.updatePrototypeState({ toastMessage: message });
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        window.updatePrototypeState({ toastMessage: "" });
      }, duration || window.ProductPrototypeConfig.toastDuration);
    }
  };
})();
