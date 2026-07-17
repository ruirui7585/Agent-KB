(() => {
  "use strict";

  let currentPageId = "product";
  const pageIds = new Set(["product", "delivery"]);

  function normalizePageId(value) {
    return pageIds.has(value) ? value : "product";
  }

  function renderPage(pageId) {
    currentPageId = normalizePageId(pageId);
    document.querySelectorAll("[data-page]").forEach((page) => {
      page.hidden = page.dataset.page !== currentPageId;
    });
    document.querySelectorAll(".page-tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.route === currentPageId);
    });
  }

  function renderDeliveryState(state) {
    const deliveryState = state.delivery_state || "confirmed";
    const variants = {
      confirmed: {
        icon: "✓",
        label: "ORDER CONFIRMED",
        title: "Your piece is being prepared",
        description: "We’ll notify you as soon as it leaves our studio.",
        progress: 1
      },
      shipped: {
        icon: "→",
        label: "IN TRANSIT",
        title: "Your piece is on its way",
        description: "Estimated arrival is within two business days.",
        progress: 2
      },
      exception: {
        icon: "!",
        label: "DELIVERY UPDATE",
        title: "We need a little more time",
        description: "The carrier reported a delay. No action is needed from you.",
        progress: 1
      }
    };
    const variant = variants[deliveryState] || variants.confirmed;
    document.querySelector("[data-status-icon]").textContent = variant.icon;
    document.querySelector("[data-status-label]").textContent = variant.label;
    document.querySelector("[data-status-title]").textContent = variant.title;
    document.querySelector("[data-status-description]").textContent = variant.description;
    document.querySelector("[data-progress-step]").classList.toggle("is-current", variant.progress >= 2);
  }

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      renderPage(button.dataset.route);
      window.axhubDemoViewer?.refresh();
    });
  });

  document.querySelectorAll("[data-finish]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-finish]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      document.querySelector("[data-finish-name]").textContent = button.dataset.finish;
    });
  });

  document.querySelector("[data-annotation-id='add-to-bag']").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const label = button.querySelector("span");
    const count = document.querySelector(".bag-count");
    count.textContent = String(Number(count.textContent) + 1);
    label.textContent = "Added";
    window.setTimeout(() => { label.textContent = "Add to bag"; }, 1200);
  });

  const axhubAnnotation = window.AxhubAnnotation;
  if (!axhubAnnotation) {
    throw new Error("Missing window.AxhubAnnotation browser bundle.");
  }

  const viewer = axhubAnnotation.createAnnotationViewer({
    source: window.AXHUB_DEMO_SOURCE,
    options: {
      getCurrentPageId: () => currentPageId,
      showToolbar: true,
      showThemeToggle: true,
      showColorFilter: true,
      onDirectoryRoute: (node) => {
        renderPage(node.route);
        viewer.refresh();
      }
    }
  });
  window.axhubDemoViewer = viewer;

  void viewer.start().then(() => {
    const attachStateControls = () => {
      const protoDev = window.__AXHUB_PROTO_DEV__;
      if (!protoDev) {
        window.setTimeout(attachStateControls, 80);
        return;
      }
      renderDeliveryState(protoDev.getState());
      protoDev.subscribe(() => renderDeliveryState(protoDev.getState()));
    };
    attachStateControls();
  });

  renderPage(currentPageId);
})();
