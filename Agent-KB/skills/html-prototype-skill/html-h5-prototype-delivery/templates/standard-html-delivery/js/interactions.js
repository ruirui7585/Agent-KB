(function () {
  window.PrototypeInteractions = {
    goToPage(pageKey) {
      window.updatePrototypeState({
        currentPage: pageKey,
        currentScenario: "overview",
        modalStatus: "none",
        sheetStatus: "none"
      });
    },

    openModal() {
      window.updatePrototypeState({ modalStatus: "example" });
    },

    closeModal() {
      window.updatePrototypeState({ modalStatus: "none" });
    },

    openSheet() {
      window.updatePrototypeState({ sheetStatus: "example" });
    },

    closeSheet() {
      window.updatePrototypeState({ sheetStatus: "none" });
    },

    switchAnnotationTab(tabKey) {
      window.updatePrototypeState({ annotationTab: tabKey });
    },

    applyExampleState(stateKey) {
      if (stateKey === "loading") {
        window.updatePrototypeState({ isLoading: true, errorStatus: "none" });
        return;
      }

      if (stateKey === "error") {
        window.updatePrototypeState({ isLoading: false, errorStatus: "example_error" });
        return;
      }

      window.updatePrototypeState({ isLoading: false, errorStatus: "none" });
    }
  };
})();
