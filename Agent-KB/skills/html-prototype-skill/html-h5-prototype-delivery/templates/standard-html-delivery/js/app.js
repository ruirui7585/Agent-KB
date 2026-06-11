(function () {
  const appRoot = document.getElementById("app");
  const annotationRoot = document.getElementById("annotation-root");

  function renderCurrentPage() {
    const state = window.ProductPrototypeState;
    const page = window.PrototypeUtils.getPageData(state.currentPage);

    if (state.isLoading) {
      return `
        <main class="page">
          <section class="loading-state">Loading current state...</section>
        </main>
      `;
    }

    if (state.errorStatus !== "none") {
      return `
        <main class="page">
          <section class="empty-state">
            <strong>Something needs attention</strong>
            <span class="muted text-small">Replace this with the product's error state.</span>
          </section>
        </main>
      `;
    }

    return `
      <main class="page">
        <header class="top-header">
          <div>
            <h1>${window.PrototypeUtils.escapeHtml(page.title)}</h1>
            <p class="muted text-body">${window.PrototypeUtils.escapeHtml(page.subtitle)}</p>
          </div>
          <button class="icon-btn" type="button" onclick="PrototypeInteractions.openSheet()" aria-label="Open actions">+</button>
        </header>

        <section class="card hero-card">
          <span class="annotation-chip active">Prototype</span>
          <h2>${window.PrototypeUtils.escapeHtml(page.description)}</h2>
          <p class="muted text-body">Replace this starter content with the product flow. Keep page-specific content here and shared modules in CSS/JS.</p>
          <button class="primary-btn" type="button" onclick="PrototypeInteractions.openModal()">Open Modal</button>
        </section>

        <section style="display:grid;gap:12px;margin-top:16px;">
          ${window.ProductPrototypeData.cards.map(function (card) {
            return `
              <article class="card">
                <span class="annotation-chip">${window.PrototypeUtils.escapeHtml(card.tag)}</span>
                <h3 style="margin-top:10px;">${window.PrototypeUtils.escapeHtml(card.title)}</h3>
                <p class="muted text-body" style="margin-top:6px;">${window.PrototypeUtils.escapeHtml(card.body)}</p>
              </article>
            `;
          }).join("")}
        </section>
      </main>
    `;
  }

  function renderBottomNav() {
    const state = window.ProductPrototypeState;

    return `
      <nav class="bottom-nav">
        ${window.ProductPrototypeData.navItems.map(function (item) {
          const active = state.currentPage === item.key ? "active" : "";
          return `
            <button class="${active}" type="button" onclick="PrototypeInteractions.goToPage('${item.key}')">
              <span>${item.icon}</span>
              <span>${window.PrototypeUtils.escapeHtml(item.label)}</span>
            </button>
          `;
        }).join("")}
      </nav>
    `;
  }

  function renderModal() {
    if (window.ProductPrototypeState.modalStatus === "none") return "";

    return `
      <div class="modal-mask">
        <section class="modal-card">
          <h2>Example Modal</h2>
          <p class="muted text-body" style="margin:12px 0;">Use shared modal styles for important confirmations.</p>
          <button class="primary-btn" type="button" onclick="PrototypeInteractions.closeModal()">Close</button>
        </section>
      </div>
    `;
  }

  function renderSheet() {
    if (window.ProductPrototypeState.sheetStatus === "none") return "";

    return `
      <div class="sheet-mask" onclick="PrototypeInteractions.closeSheet()"></div>
      <section class="bottom-sheet">
        <h2>Example Bottom Sheet</h2>
        <p class="muted text-body" style="margin:12px 0;">Use sheets for temporary actions, options, and cashier flows.</p>
        <button class="primary-btn" type="button" onclick="PrototypeUtils.showToast('Action confirmed')">Confirm</button>
      </section>
    `;
  }

  function renderToast() {
    const message = window.ProductPrototypeState.toastMessage;
    return message ? `<div class="toast">${window.PrototypeUtils.escapeHtml(message)}</div>` : "";
  }

  function renderPhoneApp() {
    appRoot.innerHTML = `
      <div class="app-shell">
        ${renderCurrentPage()}
        ${renderBottomNav()}
        ${renderSheet()}
        ${renderModal()}
        ${renderToast()}
      </div>
    `;
  }

  function renderAnnotationEditor() {
    const state = window.ProductPrototypeState;
    const page = window.PrototypeUtils.getPageData(state.currentPage);
    const annotation = window.ProductPrototypeData.annotations[state.currentPage] || window.ProductPrototypeData.annotations.home;
    const notes = annotation.notes;
    const activeTab = state.annotationTab;

    annotationRoot.innerHTML = `
      <section class="annotation-panel">
        <header class="annotation-header">
          <h2>Prototype Annotation Editor</h2>
          <p class="muted text-small">${window.PrototypeUtils.escapeHtml(page.title)} · ${window.PrototypeUtils.escapeHtml(annotation.scenarioName)}</p>
        </header>

        <div class="annotation-content">
          <strong>Current Scenario</strong>
          <div class="card" style="margin-top:10px;">
            ${window.PrototypeUtils.escapeHtml(page.description)}
          </div>

          <div class="annotation-chip-row">
            ${["notes", "states", "tracking"].map(function (tab) {
              const active = activeTab === tab ? "active" : "";
              const label = { notes: "Notes", states: "States", tracking: "Tracking" }[tab];
              return `<button class="annotation-chip ${active}" type="button" onclick="PrototypeInteractions.switchAnnotationTab('${tab}')">${label}</button>`;
            }).join("")}
          </div>

          ${activeTab === "notes" ? `
            <div class="annotation-field">
              <strong>Business</strong>
              <textarea readonly>${notes.business}</textarea>
            </div>
            <div class="annotation-field">
              <strong>Interaction</strong>
              <textarea readonly>${notes.interaction}</textarea>
            </div>
            <div class="annotation-field">
              <strong>Acceptance</strong>
              <textarea readonly>${notes.acceptance}</textarea>
            </div>
          ` : ""}

          ${activeTab === "states" ? `
            <div class="annotation-field">
              <strong>State Presets</strong>
              <div class="annotation-chip-row">
                <button class="annotation-chip" type="button" onclick="PrototypeInteractions.applyExampleState('default')">Default</button>
                <button class="annotation-chip" type="button" onclick="PrototypeInteractions.applyExampleState('loading')">Loading</button>
                <button class="annotation-chip" type="button" onclick="PrototypeInteractions.applyExampleState('error')">Error</button>
              </div>
            </div>
            <div class="card">${notes.state}</div>
          ` : ""}

          ${activeTab === "tracking" ? `
            <div class="card">
              <strong>Tracking Template</strong>
              <p class="muted text-body" style="margin-top:8px;">Define event name, trigger, params, and expected result in docs/tracking.md.</p>
            </div>
          ` : ""}
        </div>
      </section>
    `;
  }

  window.renderPrototype = function renderPrototype() {
    renderPhoneApp();

    if (window.ProductPrototypeConfig.enableAnnotationEditor) {
      renderAnnotationEditor();
    }
  };

  window.renderPrototype();
})();
