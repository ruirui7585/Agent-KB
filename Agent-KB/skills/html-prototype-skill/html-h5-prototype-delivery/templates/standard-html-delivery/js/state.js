(function () {
  window.ProductPrototypeState = {
    currentPage: window.ProductPrototypeConfig.defaultPage,
    currentScenario: window.ProductPrototypeConfig.defaultScenario,
    modalStatus: "none",
    sheetStatus: "none",
    toastMessage: "",
    isLoading: false,
    errorStatus: "none",
    userStatus: "default",
    annotationTab: "notes"
  };

  window.updatePrototypeState = function updatePrototypeState(partialState) {
    Object.assign(window.ProductPrototypeState, partialState);

    if (typeof window.renderPrototype === "function") {
      window.renderPrototype();
    }
  };
})();
