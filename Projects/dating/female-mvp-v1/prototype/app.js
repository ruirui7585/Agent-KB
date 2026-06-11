(function () {
  const data = window.FEMALE_MVP_DATA;
  const state = window.FEMALE_MVP_STATE;
  const annotations = window.FEMALE_MVP_ANNOTATIONS || {};
  const primaryPages = ["inbox", "models", "content", "me"];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function getModel(id) {
    return data.models.find((model) => model.model_id === id);
  }

  function getMaleUser(id) {
    return data.maleUsers.find((user) => user.male_user_id === id);
  }

  function getConversation(id) {
    return data.conversations.find((conversation) => conversation.conversation_id === id);
  }

  function getContent(id) {
    return data.contents.find((content) => content.content_id === id);
  }

  function money(value) {
    return `$${value}`;
  }

  function navigateTo(pageId) {
    state.previousPageId = state.currentPageId;
    state.currentPageId = pageId;
    if (primaryPages.includes(pageId)) state.activeTab = pageId;

    $$(".page").forEach((page) => page.classList.toggle("active", page.dataset.pageId === pageId));
    const appFrame = $("[data-app-frame]");
    appFrame.hidden = pageId === "login";
    $$(".bottom-tabs button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === state.activeTab);
    });
    renderPage(pageId);
    syncAnnotation(pageId);
  }

  function syncAnnotation(pageId) {
    const annotation = annotations[pageId];
    $("[data-annotation-title]").textContent = annotation ? annotation.title : pageId;
    $("[data-annotation-body]").innerHTML = annotation
      ? `<p>${annotation.goal}</p><h3>Core Fields</h3><ul>${annotation.fields.map((item) => `<li>${item}</li>`).join("")}</ul><h3>Interactions</h3><ul>${annotation.interactions.map((item) => `<li>${item}</li>`).join("")}</ul><h3>Rules</h3><ul>${annotation.rules.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : "<p>No annotation data.</p>";
  }

  function renderPage(pageId) {
    renderStaff();
    if (pageId === "inbox") renderInbox();
    if (pageId === "chat_detail") renderChatDetail();
    if (pageId === "models") renderModels();
    if (pageId === "model_detail") renderModelDetail();
    if (pageId === "content") renderContent();
    if (pageId === "content_picker") renderContentPicker();
    if (pageId === "me") renderMe();
    if (pageId === "work_status") renderWorkStatus();
  }

  function renderStaff() {
    $("[data-staff-name]").textContent = data.staff.staff_name;
    $("[data-staff-status]").textContent = data.staff.online_status;
    $("[data-today-conversations]").textContent = data.staff.today_conversations;
    $("[data-today-revenue]").textContent = money(data.staff.today_revenue);
  }

  function renderInbox() {
    $("[data-conversation-list]").innerHTML = data.conversations
      .map((conversation) => {
        const user = getMaleUser(conversation.male_user_id);
        const model = getModel(conversation.model_id);
        return `<button class="card clickable" data-conversation-id="${conversation.conversation_id}">
          <div class="card-head">
            <img class="avatar" src="${user.avatar}" alt="${user.nickname}" />
            <div>
              <h2>${user.nickname}</h2>
              <p class="meta">${user.payment_status} · Free messages left: ${user.free_messages_left}</p>
            </div>
            <img class="avatar mini-avatar" src="${model.avatar}" alt="${model.display_name}" />
          </div>
          <p>${conversation.last_message}</p>
          <div class="card-grid">
            <span>Model: ${model.display_name}</span>
            <span>Unread: ${conversation.unread_count}</span>
            <span>Waiting: ${conversation.reply_waiting_time}</span>
            <span>${conversation.conversation_stage}</span>
          </div>
          <p class="meta">Action: ${conversation.suggested_action}</p>
        </button>`;
      })
      .join("");
  }

  function renderChatDetail() {
    const conversation = getConversation(state.selectedConversationId);
    const user = getMaleUser(conversation.male_user_id);
    const model = getModel(conversation.model_id);
    $("[data-chat-header]").innerHTML = `
      <img class="avatar" src="${user.avatar}" alt="${user.nickname}" />
      <div><h2>${user.nickname}</h2><p class="meta">${user.payment_status} · Free messages left: ${user.free_messages_left}</p></div>
      <img class="avatar mini-avatar" src="${model.avatar}" alt="${model.display_name}" />
      <div><strong>${model.display_name}</strong><p class="meta">Reply identity</p></div>`;
    $("[data-chat-action]").textContent = conversation.suggested_action;
    const messages = data.messages[conversation.conversation_id] || [];
    $("[data-message-list]").innerHTML = messages.map((message) => `<div class="message ${message.sender}">${message.text}</div>`).join("");
  }

  function renderModels() {
    $("[data-bound-model-count]").textContent = data.models.length;
    $("[data-online-model-count]").textContent = data.models.filter((model) => model.online_status === "Online").length;
    $("[data-model-list]").innerHTML = data.models
      .map((model) => `<button class="card clickable" data-model-id="${model.model_id}">
        <div class="card-head">
          <img class="avatar" src="${model.avatar}" alt="${model.display_name}" />
          <div><h2>${model.display_name}, ${model.age}</h2><p class="meta">${model.city} · ${model.online_status}</p></div>
        </div>
        <div class="card-grid">
          <span>Chats: ${model.today_conversations}</span>
          <span>Revenue: ${money(model.today_revenue)}</span>
          <span>Pending: ${model.pending_replies}</span>
          <span>${model.tags.join(", ")}</span>
        </div>
      </button>`)
      .join("");
  }

  function renderModelDetail() {
    const model = getModel(state.selectedModelId);
    $("[data-model-detail]").innerHTML = `
      <article class="card">
        <div class="card-head"><img class="avatar" src="${model.avatar}" alt="${model.display_name}" /><div><h2>${model.display_name}, ${model.age}</h2><p class="meta">${model.country} · ${model.city}</p></div></div>
        <p>${model.bio}</p><p class="meta">Tags: ${model.tags.join(", ")}</p>
      </article>
      <article class="card"><h2>Persona Notes</h2><p>Voice: ${model.persona_note.tone}</p><p>Topics: ${model.persona_note.allowed_topics}</p><p>Blocked: ${model.persona_note.blocked_topics}</p><p>Push: ${model.persona_note.relationship_push}</p></article>
      <article class="card"><h2>Content Pack</h2><div class="card-grid"><span>Public Photos: ${model.content_pack.public_photos}</span><span>Private Photos: ${model.content_pack.private_photos}</span><span>Private Videos: ${model.content_pack.private_videos}</span><span>Scripts: ${model.content_pack.scripts}</span></div></article>
      <article class="card"><h2>Today Data</h2><div class="card-grid"><span>Chats: ${model.today_conversations}</span><span>Revenue: ${money(model.today_revenue)}</span><span>Pending: ${model.pending_replies}</span><span>Configured by backend. Operator can view only.</span></div></article>`;
  }

  function renderContent() {
    $("[data-content-list]").innerHTML = data.contents
      .map((content) => {
        const model = getModel(content.model_id);
        return `<button class="card clickable" data-content-id="${content.content_id}" data-content-source="content">
          <div class="content-thumb">${content.thumbnail}</div>
          <h2>${content.content_type}</h2>
          <p class="meta">${model.display_name} · Price: ${money(content.unlock_price)} · ${content.send_status}</p>
          <p>${content.conversion_tag}</p>
          <span class="badge">${content.is_sent_to_current_user ? "Already sent" : "Not sent"}</span>
        </button>`;
      })
      .join("");
  }

  function renderContentPicker() {
    const content = getContent(state.selectedContentId);
    const model = getModel(content.model_id);
    const conversation = getConversation(state.selectedConversationId);
    const user = getMaleUser(conversation.male_user_id);
    const currentModel = getModel(conversation.model_id);
    $("[data-content-preview]").innerHTML = `
      <article class="card">
        <div class="content-thumb">${content.thumbnail}</div>
        <h2>${content.content_type}</h2>
        <p>Model: ${model.display_name}</p>
        <p>Unlock price: ${money(content.unlock_price)}</p>
        <p>Status: ${content.is_sent_to_current_user ? "This content has already been sent to this user." : "Not sent to current user."}</p>
      </article>
      <article class="card">
        <h2>Current Conversation</h2>
        <p>${user.nickname} · ${user.payment_status} · Free messages left: ${user.free_messages_left}</p>
        <p>Reply as ${currentModel.display_name}</p>
        <p class="meta">${conversation.suggested_action}</p>
      </article>
      <button class="primary-btn" data-action="send-public-content">Send as Public</button>
      <button class="primary-btn" data-action="send-private-content">Send as Private Unlock</button>
      <button class="secondary-btn" data-action="content-cancel">Cancel</button>`;
  }

  function renderMe() {
    const staff = data.staff;
    $("[data-me-status]").textContent = staff.online_status;
    $("[data-me-panel]").innerHTML = `
      <article class="card">
        <div class="card-head"><img class="avatar" src="${staff.avatar}" alt="${staff.staff_name}" /><div><h2>${staff.staff_name}</h2><p class="meta">${staff.staff_id} · ${staff.online_status}</p></div></div>
      </article>
      <article class="card"><h2>Today Summary</h2><div class="card-grid"><span>Chats: ${staff.today_conversations}</span><span>Revenue: ${money(staff.today_revenue)}</span><span>Pending: ${staff.pending_replies}</span><span>Models: ${staff.bound_model_count}</span></div></article>
      <article class="card"><h2>Work Info</h2><p>Language: ${staff.language}</p><p>Market: ${staff.market}</p><p>Current Status: ${staff.online_status}</p></article>
      <button class="primary-btn" data-action="open-work-status">Work Status</button>
      <button class="secondary-btn" data-action="logout">Logout</button>`;
  }

  function renderWorkStatus() {
    $("[data-work-status]").textContent = data.staff.online_status;
  }

  function addMessage(sender, text) {
    const conversation = getConversation(state.selectedConversationId);
    data.messages[conversation.conversation_id].push({ sender, text });
    renderChatDetail();
  }

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) navigateTo(tab.dataset.tab);

    const conversationCard = event.target.closest("[data-conversation-id]");
    if (conversationCard) {
      state.selectedConversationId = conversationCard.dataset.conversationId;
      navigateTo("chat_detail");
    }

    const modelCard = event.target.closest("[data-model-id]");
    if (modelCard) {
      state.selectedModelId = modelCard.dataset.modelId;
      navigateTo("model_detail");
    }

    const contentCard = event.target.closest("[data-content-id]");
    if (contentCard) {
      state.selectedContentId = contentCard.dataset.contentId;
      state.contentEntrySource = contentCard.dataset.contentSource || "content";
      navigateTo("content_picker");
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "demo-login") navigateTo("inbox");
    if (action === "back-to-inbox") navigateTo("inbox");
    if (action === "back-to-models") navigateTo("models");
    if (action === "back-to-me") navigateTo("me");
    if (action === "open-work-status") navigateTo("work_status");
    if (action === "logout") navigateTo("login");
    if (action === "quick-reply") addMessage("model", "I like talking with you. Tell me what you want to know about me.");
    if (action === "translate") addMessage("system", "Translation preview: Arabic / English tone checked.");
    if (action === "photo") addMessage("model", "Public photo sent.");
    if (action === "private") {
      const conversation = getConversation(state.selectedConversationId);
      const privateContent = data.contents.find((content) => content.model_id === conversation.model_id && content.content_type.includes("Private")) || data.contents[0];
      state.selectedContentId = privateContent.content_id;
      state.contentEntrySource = "chat_detail";
      navigateTo("content_picker");
    }
    if (action === "call") addMessage("model", "Call invite sent. Would you like to talk for a few minutes?");
    if (action === "send-message") {
      const input = $("[data-chat-input]");
      if (input.value.trim()) addMessage("model", input.value.trim());
      input.value = "";
    }
    if (action === "content-cancel") navigateTo(state.contentEntrySource === "chat_detail" ? "chat_detail" : "content");
    if (action === "send-public-content" || action === "send-private-content") {
      const content = getContent(state.selectedContentId);
      content.is_sent_to_current_user = true;
      addMessage("model", `${content.content_type} sent: ${content.thumbnail}`);
      navigateTo("chat_detail");
    }
    if (action === "switch-online") {
      data.staff.online_status = "Online";
      renderWorkStatus();
    }
    if (action === "switch-offline") {
      data.staff.online_status = "Offline";
      renderWorkStatus();
    }
  });

  navigateTo("login");
})();
