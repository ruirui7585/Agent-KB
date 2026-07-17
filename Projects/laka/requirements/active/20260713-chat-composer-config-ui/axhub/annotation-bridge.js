(() => {
  "use strict";

  const axhubAnnotation = window.AxhubAnnotation;
  const source = window.LAKA_AXHUB_ANNOTATION_SOURCE;

  if (!axhubAnnotation || !source) {
    throw new Error("Axhub annotation runtime or source is missing.");
  }

  function currentPageId() {
    return document.querySelector('[data-screen-view="profile"]')?.hidden ? "chat" : "profile";
  }

  function clickLegacyControl(selector) {
    const button = document.querySelector(selector);
    if (button && button.getAttribute("aria-pressed") !== "true") button.click();
  }

  function applyPrototypeState(state) {
    const page = state.preview_page === "profile" ? "profile" : "chat";
    const userType = state.user_type === "blocked" ? "blocked" : "core";
    const accessState = state.access_state === "unlocked" ? "unlocked" : "locked";

    clickLegacyControl(`[data-preview-page="${page}"]`);
    clickLegacyControl(`[data-user-type="${userType}"]`);
    clickLegacyControl(`[data-access-state="${accessState}"]`);
  }

  function navigate(page) {
    clickLegacyControl(`[data-preview-page="${page === "profile" ? "profile" : "chat"}"]`);
  }

  const viewer = axhubAnnotation.createAnnotationViewer({
    source,
    options: {
      getCurrentPageId: currentPageId,
      showToolbar: true,
      showThemeToggle: true,
      showColorFilter: true,
      onDirectoryRoute: (node) => {
        navigate(node.route);
        viewer.refresh();
      }
    }
  });

  window.LAKA_AXHUB_VIEWER = viewer;

  void viewer.start().then(() => {
    const attachStateControls = () => {
      const protoDev = window.__AXHUB_PROTO_DEV__;
      if (!protoDev) {
        window.setTimeout(attachStateControls, 80);
        return;
      }

      applyPrototypeState(protoDev.getState());
      protoDev.subscribe(() => {
        applyPrototypeState(protoDev.getState());
        window.requestAnimationFrame(() => viewer.refresh());
      });
    };

    attachStateControls();
  });
})();
