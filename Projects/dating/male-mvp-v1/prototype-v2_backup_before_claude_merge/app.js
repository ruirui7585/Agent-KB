const appRoot = document.getElementById("app");
const annotationRoot = document.getElementById("annotation-root");

function renderPhoneApp() {
  appRoot.innerHTML = `
    <div class="app-page">
      ${renderCurrentPage()}
      ${renderBottomTab()}
      ${renderBottomSheet()}
      ${renderModal()}
      ${renderToast()}
    </div>
  `;
}

function renderAnnotationEditor() {
  if (!annotationRoot) return;
  annotationRoot.innerHTML = renderAnnotationPanel();
}

function renderApp() {
  renderPhoneApp();
  renderAnnotationEditor();

  if (prototypeState.activeModuleId) {
    if (typeof setTimeout === "function") {
      setTimeout(() => highlightAnnotationTarget(prototypeState.activeModuleId), 0);
    }
  }
}

function renderCurrentPage() {
  switch (prototypeState.currentPage) {
    case "discover":
      return renderDiscoverPage();
    case "likes":
      return renderLikesPage();
    case "matches":
      return renderMatchesPage();
    case "chat":
      return renderChatPage();
    case "me":
      return renderMePage();
    case "profile":
      return renderProfilePage();
    default:
      return renderDiscoverPage();
  }
}

function getCurrentUser() {
  return mockUsers[prototypeState.currentCardIndex % mockUsers.length];
}

function getImageWithFallback(user) {
  var pool = getAvatar(user.id);
  return {
    src: pool.src || user.avatar || "",
    fallback: pool.fallback,
    initial: pool.initial || (user.name ? user.name[0] : "?")
  };
}

function imgOnError(fallbackSrc) {
  return "this.onerror=null;this.src='" + fallbackSrc + "'";
}

function getImgTag(user, className, alt) {
  var img = getImageWithFallback(user);
  var cls = className ? ' class="' + className + '"' : "";
  var altText = alt || user.name || "";
  return '<img' + cls + ' src="' + img.src + '" alt="' + altText + '" onerror="' + imgOnError(img.fallback) + '" />';
}

function getCurrentPageConfig() {
  return pageConfigs[prototypeState.activeAnnotationPage] || pageConfigs[prototypeState.currentPage] || pageConfigs.discover;
}

function getPageModules(pageConfig = getCurrentPageConfig()) {
  return Object.entries(pageConfig.modules || {}).map(([id, module]) => ({ id, ...module }));
}

function getActiveModule() {
  const pageConfig = getCurrentPageConfig();
  const modules = getPageModules(pageConfig);
  return modules.find(module => module.id === prototypeState.activeModuleId) || modules[0];
}

function getModuleClass(moduleId, baseClass = "") {
  const classes = [baseClass, "annotatable-module"].filter(Boolean);

  if (prototypeState.activeModuleId === moduleId && prototypeState.annotationStatus === "visible") {
    classes.push("annotation-highlight", "hotspot", "active");
    const activeModule = getActiveModule();
    const stateConfig = activeModule && activeModule.states ? activeModule.states[prototypeState.activeModuleState] : null;
    const action = stateConfig ? stateConfig.action : "none";

    if (action === "hide") {
      classes.push("state-hidden");
    }

    if (action === "blur_and_lock") {
      classes.push("state-blur");
    }

    if (action === "skeleton") {
      classes.push("state-skeleton");
    }

    if (action === "empty") {
      classes.push("state-empty");
    }

    if (action === "disabled") {
      classes.push("state-disabled");
    }

    if (action === "matched") {
      classes.push("state-matched");
    }

    if (action === "unlocked") {
      classes.push("state-unlocked");
    }
  }

  return classes.join(" ");
}

function handleAnnotatedModuleClick(event, moduleId) {
  if (prototypeState.annotationMode !== "select" || prototypeState.annotationPanelStatus !== "expanded") {
    return true;
  }

  event.preventDefault();
  event.stopPropagation();
  updateState({
    activeModuleId: moduleId,
    activeModuleState: "default"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(moduleId), 0);
  }
  return false;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAnnotationStorageKey(pageId, moduleId) {
  return `dating.annotation.${pageId}.${moduleId}`;
}

function getSavedAnnotationNotes(pageId, moduleId) {
  if (typeof localStorage === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(getAnnotationStorageKey(pageId, moduleId)) || "{}");
  } catch (error) {
    return {};
  }
}

function getModuleNotes(module) {
  const savedNotes = getSavedAnnotationNotes(prototypeState.activeAnnotationPage, module.id);
  return { ...module.notes, ...savedNotes };
}

function renderDiscoverPage() {
  const user = getCurrentUser();

  return `
    <main class="page discover-page">
      <header class="${getModuleClass("discover_primary", "top-header")}" data-module-id="discover_primary" onclick="return handleAnnotatedModuleClick(event, 'discover_primary')">
        <div>
          <h1>Discover</h1>
        </div>
        <button class="settings-entry-btn" onclick="goToPage('me')" aria-label="Settings">
          <span class="settings-icon" aria-hidden="true"></span>
        </button>
      </header>

      <section class="${getModuleClass("discover_card", "swipe-card")}" data-module-id="discover_card" onclick="if (handleAnnotatedModuleClick(event, 'discover_card')) openProfile('${user.id}')">
        <img src="${getImageWithFallback(user).src}" alt="${user.name}" onerror="this.onerror=null;this.src='${getImageWithFallback(user).fallback}'" />
        <div class="card-gradient"></div>
        <div class="card-info">
          <h2>${user.name}, ${user.age}</h2>
          <p>${user.city}, ${user.country} · ${user.distance}</p>
          <p>${user.online ? "Online now" : "Recently active"} ${user.verified ? "· Verified" : ""}</p>
          <div class="interests">
            ${user.interests.map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>
      </section>

      <section class="${getModuleClass("discover_actions", "swipe-actions")}" data-module-id="discover_actions" onclick="return handleAnnotatedModuleClick(event, 'discover_actions')">
        <button onclick="swipePass()">✕</button>
        <button class="like" onclick="swipeLike()">♥</button>
      </section>
    </main>
  `;
}

function renderLikesPage() {
  const locked = prototypeState.likesMePermissionStatus !== "unlocked";
  const isLikedPane = prototypeState.likesViewStatus !== "matches";

  return `
    <main class="page likes-page">
      <header class="likes-head">
        <div>
          <h1>Likes</h1>
          <p>${isLikedPane ? "People who already showed interest" : `${legacyMatchUsers.length} active matches`}</p>
        </div>
        <button class="upgrade-pill" onclick="openSubscriptionPaywall()">Premium</button>
      </header>

      <div class="${getModuleClass("likes_primary", "segment-tabs likes-segment")}" data-module-id="likes_primary" onclick="return handleAnnotatedModuleClick(event, 'likes_primary')">
        <button class="${isLikedPane ? "active" : ""}" onclick="switchLikesTab('liked')">Like you</button>
        <button class="${!isLikedPane ? "active" : ""}" onclick="switchLikesTab('matches')">Match</button>
      </div>

      ${isLikedPane ? renderLegacyLikedPane(locked) : renderLegacyMatchesPane()}
    </main>
  `;
}

function renderUserRow(user, locked) {
  return `
    <div class="user-row ${locked ? "locked" : ""}" onclick="${locked ? "openSubscriptionPaywall()" : `openProfile('${user.id}')`}">
      <img src="${getImageWithFallback(user).src}" alt="${user.name}" onerror="this.onerror=null;this.src='${getImageWithFallback(user).fallback}'" />
      <div style="flex:1;min-width:0;">
        <h3>${locked ? "Hidden Admirer" : `${user.name}, ${user.age}`}</h3>
        <p>${locked ? "Upgrade to see who liked you" : `${user.city} · ${user.distance}`}</p>
      </div>
      <button class="secondary-btn">${locked ? "Unlock" : "View"}</button>
    </div>
  `;
}

function renderLegacyLikedPane(locked) {
  const previewUser = likesMeUsers[0] || mockUsers[0];

  return `
    <section class="${getModuleClass("likes_me_list", "liked-you-panel")}" data-module-id="likes_me_list" onclick="return handleAnnotatedModuleClick(event, 'likes_me_list')">
      <p class="liked-you-sub">Go premium to see people who already liked you</p>
      <div class="liked-filter-row" aria-label="Liked you filters">
        <button class="active">All <span>${likesMeUsers.length}</span></button>
        <button>Verified <span>${likesMeUsers.filter(user => user.verified).length}</span></button>
        <button>Age: 18-90 <span>${likesMeUsers.length}</span></button>
        <button>Active <span>${likesMeUsers.filter(user => user.online).length}</span></button>
      </div>
      <button class="liked-preview-card ${locked ? "locked" : ""}" onclick="${locked ? "openSubscriptionPaywall()" : `openProfile('${previewUser.id}')`}">
        <img src="${getImageWithFallback(previewUser).src}" alt="${locked ? "Hidden admirer" : previewUser.name}" onerror="this.onerror=null;this.src='${getImageWithFallback(previewUser).fallback}'" />
        <div class="liked-preview-shade"></div>
        <div class="liked-preview-info">
          <div class="liked-blur-name"><span>${locked ? "" : `${previewUser.name}, ${previewUser.age}`}</span><b>✓</b></div>
          <div class="liked-tags">
            <span>Friendship</span>
            <span>Hang out</span>
            <span>Travel</span>
          </div>
        </div>
      </button>
    </section>
    <div class="liked-bottom-cta">
      <button onclick="${locked ? "openSubscriptionPaywall()" : `openProfile('${previewUser.id}')`}">
        ${locked ? "See who likes you" : "View profile"}
      </button>
    </div>
  `;
}

function renderLegacyMatchesPane() {
  return `
    <section class="${getModuleClass("matches_primary", "matches-hero")}" data-module-id="matches_primary" onclick="return handleAnnotatedModuleClick(event, 'matches_primary')">
      <div class="match-hero-icon">♥</div>
      <div>
        <h2>${legacyMatchUsers.length} active matches</h2>
        <p>Start a chat while they are online and keep the momentum fresh.</p>
      </div>
    </section>
    <section class="matches-list">
      ${legacyMatchUsers.map(user => `
        <button class="${getModuleClass("matches_chat_entry", "match-row")}" data-module-id="matches_chat_entry" onclick="if (handleAnnotatedModuleClick(event, 'matches_chat_entry')) openChat('${user.id}')">
          <span class="match-avatar" style="background-image:url('${user.avatar}')">${user.initial}</span>
          <span>
            <strong>${user.name}, ${user.age}</strong>
            <em>${user.status}</em>
          </span>
          <b>${user.action}</b>
        </button>
      `).join("")}
    </section>
  `;
}

function renderMatchesPage() {
  return `
    <main class="page matches-page">
      <header class="top-header">
        <h1>Matches</h1>
      </header>

      <section class="${getModuleClass("matches_primary", "matches-list")}" data-module-id="matches_primary" onclick="return handleAnnotatedModuleClick(event, 'matches_primary')">
        ${matchUsers.map(user => `
        <div class="match-card">
          <img src="${getImageWithFallback(user).src}" alt="${user.name}" onerror="this.onerror=null;this.src='${getImageWithFallback(user).fallback}'" />
          <div style="flex:1;">
            <h3>${user.name}, ${user.age}</h3>
            <p class="sub-text">${user.prompt}</p>
          </div>
          <button class="${getModuleClass("matches_chat_entry", "primary-btn")}" data-module-id="matches_chat_entry" onclick="if (handleAnnotatedModuleClick(event, 'matches_chat_entry')) goToPage('chat')">Chat</button>
        </div>
        `).join("")}
      </section>
    </main>
  `;
}

function renderChatPage() {
  if (prototypeState.chatViewStatus === "detail") {
    return renderChatDetailPage();
  }

  return `
    <main class="page chat-page chat-inbox-page">
      <header class="chat-status-bar" aria-label="Phone status">
        <span>16:18</span>
        <div>
          <span class="status-bars"></span>
          <span class="status-wifi"></span>
          <span class="status-battery">84</span>
        </div>
      </header>

      <section class="${getModuleClass("chat_primary", "chat-list")}" data-module-id="chat_primary" onclick="return handleAnnotatedModuleClick(event, 'chat_primary')">
        <div class="chat-title-row">
          <h1>Chat</h1>
          <div class="chat-tools" aria-label="Chat tools">
            <button onclick="showMeHint('Boost preview')" aria-label="Boost"><span class="tool-gauge"></span></button>
            <button onclick="showMeHint('Notifications')" aria-label="Notifications"><span class="tool-bell"></span><i></i></button>
            <button onclick="showMeHint('Search')" aria-label="Search"><span class="tool-search"></span></button>
          </div>
        </div>

        <h2 class="chat-subtitle">Swipe right on your matches</h2>

        <div class="chat-match-strip" aria-label="People you like">
          <button class="chat-match-story liked-summary" onclick="openSubscriptionPaywall()">
            <span class="match-story-avatar blurred-grid">
              <img src="${getImageWithFallback(likesMeUsers[0]).src}" alt="" onerror="this.onerror=null;this.src='${getImageWithFallback(likesMeUsers[0]).fallback}'" />
              <img src="${getImageWithFallback(likesMeUsers[1]).src}" alt="" onerror="this.onerror=null;this.src='${getImageWithFallback(likesMeUsers[1]).fallback}'" />
            </span>
            <b>Likes</b>
            <em>13</em>
          </button>
          ${legacyChatThreads.slice(0, 4).map(thread => `
            <button class="chat-match-story" onclick="${thread.locked ? "openChatPaywall()" : `openChat('${thread.id}')`}">
              <span class="match-story-avatar ${thread.locked ? "empty" : ""}" style="${thread.locked ? "" : `background-image:url('${thread.avatar}')`}"></span>
              <b>${thread.locked ? "Locked" : thread.name}</b>
            </button>
          `).join("")}
        </div>

        <div class="chat-section-head">
          <h2>Messages</h2>
          <button onclick="showMeHint('Sort')"><span class="sort-icon"></span> Sort</button>
        </div>

        <button class="chat-like-card" onclick="openSubscriptionPaywall()">
          <span class="like-collage">
            ${likesMeUsers.concat(mockUsers).slice(0, 4).map(user => '<img src="' + getImageWithFallback(user).src + '" alt="" onerror="this.onerror=null;this.src=\'' + getImageWithFallback(user).fallback + '\'" />').join("")}
            <i></i>
          </span>
          <span>Want to see the 13 women who liked you?</span>
        </button>

        ${legacyChatThreads.map((thread, index) => `
          <button class="${getModuleClass(thread.locked ? "chat_paid_message" : "chat_primary", `chat-message-row ${thread.locked ? "locked-row" : ""}`)}" data-module-id="${thread.locked ? "chat_paid_message" : "chat_primary"}" onclick="${thread.locked ? "if (handleAnnotatedModuleClick(event, 'chat_paid_message')) openChatPaywall()" : `if (handleAnnotatedModuleClick(event, 'chat_primary')) openChat('${thread.id}')`}">
            <span class="chat-message-avatar ${index === 2 ? "brand-avatar" : ""}" style="${index === 2 ? "" : `background-image:url('${thread.avatar}')`}">
              ${index === 2 ? "DATING" : ""}
              ${thread.online ? `<i class="online-dot"></i>` : ""}
            </span>
            <span class="chat-message-meta">
              <b>${index === 2 ? "Dating Team" : `${thread.name}${index === 0 ? " · online" : ""}`}</b>
              <span>${index === 2 ? "Welcome. Here, everyone wants to meet someone real..." : thread.lastMessage}</span>
            </span>
            <span class="chat-message-side">
              ${index < 3 ? `<span class="star-btn">☆</span>` : `<span class="chat-time">${thread.time}</span>`}
              ${thread.unreadCount ? `<span class="unread-badge">${thread.unreadCount}</span>` : ""}
            </span>
          </button>
        `).join("")}
      </section>
    </main>
  `;
}

function renderChatDetailPage() {
  const thread = legacyChatThreads.find(item => item.id === prototypeState.activeChatThreadId) || legacyChatThreads[0];

  return `
    <main class="page chat-page chat-detail-page">
      <header class="chat-head">
        <button class="back" onclick="closeChat()">‹</button>
        <span class="chat-avatar large" style="background-image:url('${thread.avatar}')">${thread.initial}</span>
        <div>
          <h1>${thread.name}, ${thread.age}</h1>
          <p>${thread.online ? "Online now" : "Recently active"}</p>
        </div>
      </header>

      <section class="${getModuleClass("chat_primary", "chat-messages")}" data-module-id="chat_primary" onclick="return handleAnnotatedModuleClick(event, 'chat_primary')">
        <div class="message-bubble incoming">Matched today. Say hi before the chat cools down.</div>
        <div class="message-bubble outgoing">Hi ${thread.name}, nice to meet you.</div>
        <div class="message-bubble incoming">${thread.lastMessage}</div>
        <button class="${getModuleClass("chat_paid_message", "private-message-card")}" data-module-id="chat_paid_message" onclick="if (handleAnnotatedModuleClick(event, 'chat_paid_message')) openChatPaywall()">
          <strong>Private Moment</strong>
          <span>Unlock the HD photo after VIP access</span>
          <b>Unlock HD</b>
        </button>
      </section>

      <div class="composer">
        <input value="Tell me more about you" aria-label="Chat message" onclick="if (prototypeState.paidMessageStatus === 'locked') openChatPaywall()" />
        <button onclick="sendChatMessage()">➤</button>
      </div>
    </main>
  `;
}

function renderProfilePage() {
  const user = getCurrentUser();
  const photos = photoUnlockItems.filter(item => item.userId === user.id);

  return `
    <main class="page profile-page">
      <header class="top-header">
        <button class="secondary-btn" onclick="goToPage('discover')">Back</button>
        <button class="primary-btn" onclick="openGiftPanel()">Gift</button>
      </header>

      <section class="${getModuleClass("profile_primary", "profile-hero")}" data-module-id="profile_primary" onclick="return handleAnnotatedModuleClick(event, 'profile_primary')">
        <img src="${getImageWithFallback(user).src}" alt="${user.name}" onerror="this.onerror=null;this.src='${getImageWithFallback(user).fallback}'" />
        <h1>${user.name}, ${user.age}</h1>
        <p class="sub-text">${user.city}, ${user.country} · ${user.distance}</p>
        <p>${user.bio}</p>
      </section>

      <h2>Private Photos</h2>
      <section class="${getModuleClass("profile_photos", "photo-grid")}" data-module-id="profile_photos" onclick="return handleAnnotatedModuleClick(event, 'profile_photos')">
        ${photos.map(photo => `
          <div class="photo-lock ${prototypeState.photoUnlockStatus === "unlocked" ? "" : "locked"}" onclick="openPhotoUnlock('${photo.id}')">
            <img src="${getPhoto(photo.id).src}" alt="private photo" onerror="this.onerror=null;this.src='${getPhoto(photo.id).fallback}'" />
            ${prototypeState.photoUnlockStatus === "unlocked" ? "" : `<div class="lock-badge">Unlock ${photo.price} coins</div>`}
          </div>
        `).join("")}
      </section>

      <div style="display:flex;gap:10px;margin-top:18px;">
        <button class="primary-btn" style="flex:1;" onclick="goToPage('chat')">Start Chat</button>
        <button class="secondary-btn" style="flex:1;" onclick="openGiftPanel()">Send Gift</button>
      </div>
    </main>
  `;
}

function renderMePage() {
  return `
    <main class="page me-page">
      <header class="me-top">
        <button class="me-icon-btn" onclick="showMeHint('Filters')">⌘</button>
        <h1>Me</h1>
        <button class="me-icon-btn" onclick="showMeHint('Settings')">⚙</button>
      </header>

      <section class="${getModuleClass("me_primary", "me-card me-profile-card")}" data-module-id="me_primary" onclick="return handleAnnotatedModuleClick(event, 'me_primary')">
        <div class="me-identity">
          <img
            class="me-avatar"
            src="${getAvatar('me').src}"
            alt="Rui profile avatar"
            onerror="this.onerror=null;this.src='${getAvatar('me').fallback}'"
          />
          <div>
            <h2>rui</h2>
            <p>Edit</p>
          </div>
        </div>
      </section>

      <button class="verify-card" onclick="openVerifyIntro()">
        <span class="verify-shield">✓</span>
        <span><b>Verify account</b><small>to get more attention</small></span>
        <i>›</i>
      </button>

      <button class="${getModuleClass("me_primary", "me-vip")}" data-module-id="me_primary" onclick="if (handleAnnotatedModuleClick(event, 'me_primary')) openSubscriptionPaywall()">
        <h2>Zayna <span>PLUS</span> 40% Off</h2>
        <p>Offer ends in 00:58:54</p>
        <div class="upgrade-btn">Subscribe</div>
        <div class="plus-table">
          <b>What's included</b><span>Free</span><span>Plus</span>
          ${legacyMeBenefits.map(item => `
            <b>${item.label}</b><span>${item.free}</span><span>${item.plus}</span>
          `).join("")}
        </div>
      </button>

      <section class="${getModuleClass("me_balance", "me-card me-balance-card")}" data-module-id="me_balance" onclick="return handleAnnotatedModuleClick(event, 'me_balance')">
        <div>
          <h2>Coins</h2>
          <p class="sub-text">${prototypeState.coinBalance} coins available</p>
        </div>
        <button class="secondary-btn" onclick="openCoinRecharge()">Recharge</button>
      </section>

      <div class="me-dots"><span class="active"></span><span></span></div>
    </main>
  `;
}

function renderBottomTab() {
  const tabs = [
    { key: "discover", label: "Discover", icon: "discover" },
    { key: "likes", label: "Likes", icon: "likes" },
    { key: "chat", label: "Chat", icon: "chat" },
    { key: "me", label: "Me", icon: "me" }
  ];

  return `
    <nav class="bottom-tab">
      ${tabs.map(tab => `
        <button class="${prototypeState.currentPage === tab.key ? "active" : ""}" onclick="goToPage('${tab.key}')">
          <span class="tab-icon tab-icon-${tab.icon}" aria-hidden="true"></span>
          <span>${tab.label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderBottomSheet() {
  if (prototypeState.bottomSheetStatus === "none") return "";

  if (prototypeState.bottomSheetStatus === "subscription_paywall") {
    return renderSubscriptionPaywall();
  }

  if (prototypeState.bottomSheetStatus === "coin_recharge") {
    return renderCoinRechargeSheet();
  }

  if (prototypeState.bottomSheetStatus === "photo_unlock") {
    return renderPhotoUnlockSheet();
  }

  if (prototypeState.bottomSheetStatus === "gift_panel") {
    return renderGiftPanel();
  }

  if (prototypeState.bottomSheetStatus === "chat_paywall") {
    return renderChatPaywall();
  }

  return "";
}

function renderSubscriptionPaywall() {
  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Upgrade to Premium</h2>
      <p class="sub-text">See who liked you, get more swipes and more Super Likes.</p>
      <div class="package-list">
        ${subscriptionPackages.map(pkg => `
          <button class="package-card" onclick="selectPackage('${pkg.id}')">
            <strong>${pkg.name}</strong>
            <span>${pkg.price}</span>
            <p>${pkg.benefits.join(" · ")}</p>
          </button>
        `).join("")}
      </div>
      <button class="primary-btn" style="width:100%;margin-top:14px;" onclick="completeSubscriptionPurchase()">Continue</button>
    </section>
  `;
}

function renderCoinRechargeSheet() {
  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Recharge Coins</h2>
      <p class="sub-text">Use coins for photo unlocks, gifts and paid chat.</p>
      <div class="package-list">
        ${coinPackages.map(pkg => `
          <button class="package-card" onclick="selectPackage('${pkg.id}')">
            <strong>${pkg.coins} coins</strong>
            <span>${pkg.price}</span>
            <p>${pkg.tag}</p>
          </button>
        `).join("")}
      </div>
      <button class="primary-btn" style="width:100%;margin-top:14px;" onclick="completeCoinRecharge()">Recharge</button>
    </section>
  `;
}

function renderPhotoUnlockSheet() {
  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Unlock Private Photo</h2>
      <p class="sub-text">Unlock this photo for ${prototypeState.photoUnlockPrice} coins.</p>
      <button class="primary-btn" style="width:100%;" onclick="unlockPhoto()">Unlock Now</button>
    </section>
  `;
}

function renderGiftPanel() {
  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Send a Gift</h2>
      <div class="package-list">
        ${giftCatalog.map(gift => `
          <button class="package-card" onclick="sendGift('${gift.id}')">
            <strong>${gift.icon} ${gift.name}</strong>
            <span>${gift.price} coins</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderChatPaywall() {
  return `
    <div class="sheet-mask" onclick="closeSheet()"></div>
    <section class="bottom-sheet">
      <h2>Unlock Chat</h2>
      <p class="sub-text">Recharge coins to continue this private conversation.</p>
      <button class="primary-btn" style="width:100%;" onclick="openCoinRecharge()">Recharge Coins</button>
    </section>
  `;
}

function renderModal() {
  if (prototypeState.modalStatus === "none") return "";

  return `
    <div class="modal-mask">
      <div class="modal-card">
        <h2>${prototypeState.modalStatus.replaceAll("_", " ")}</h2>
        <button class="primary-btn" onclick="closeModal()">OK</button>
      </div>
    </div>
  `;
}

function renderToast() {
  if (prototypeState.toastStatus === "none") return "";
  return `<div class="toast">${prototypeState.toastStatus}</div>`;
}

function renderStatePanel() {
  if (prototypeState.prototypeMode !== "pm_review") return "";

  return `
    <aside class="state-panel">
      <strong>States</strong>
      <select onchange="updateState({ subscriptionStatus: this.value })">
        ${stateOptions.subscriptionStatus.map(item => `<option value="${item}" ${prototypeState.subscriptionStatus === item ? "selected" : ""}>${item}</option>`).join("")}
      </select>
      <select onchange="updateState({ photoUnlockStatus: this.value })">
        ${stateOptions.photoUnlockStatus.map(item => `<option value="${item}" ${prototypeState.photoUnlockStatus === item ? "selected" : ""}>${item}</option>`).join("")}
      </select>
    </aside>
  `;
}

function renderAnnotationPanel() {
  if (prototypeState.annotationStatus !== "visible") return "";

  return `
    <aside class="annotation-editor">
      <div class="annotation-header">
        <div>
          <strong>Annotation Editor</strong>
          <p>${escapeHtml(getCurrentPageConfig().pageName)}</p>
        </div>
        <button onclick="clearAllModuleEffects()">Clear</button>
      </div>
      <div class="annotation-content">
        ${renderAnnotationModuleList()}
        ${renderAnnotationDetail()}
      </div>
    </aside>
  `;
}

function renderAnnotationTrigger() {
  return "";
}

function renderAnnotationModuleList() {
  const pageConfig = getCurrentPageConfig();
  const modules = getPageModules(pageConfig);
  const activeModule = getActiveModule();

  return `
    <section class="annotation-module-list">
      <div class="annotation-section-title">${escapeHtml(pageConfig.description)}</div>
      ${modules.map(module => `
        <button class="annotation-module-item ${activeModule && activeModule.id === module.id ? "active" : ""}" onclick="selectAnnotationModule('${module.id}')">
          <span>${escapeHtml(module.title)}</span>
          <small>${escapeHtml(module.type)}</small>
        </button>
      `).join("")}
    </section>
  `;
}

function renderAnnotationDetail() {
  const activeModule = getActiveModule();

  return `
    <section class="annotation-detail">
      <div class="annotation-detail-title">
        <strong>${escapeHtml(activeModule.title)}</strong>
        <span>${escapeHtml(activeModule.selector)}</span>
      </div>
      ${prototypeState.annotationSelectorStatus === "missing" ? `<div class="annotation-missing">Selector missing on current page.</div>` : ""}
      ${renderAnnotationTabs()}
      ${prototypeState.activeAnnotationTab === "notes" ? renderAnnotationNotes(activeModule) : ""}
      ${prototypeState.activeAnnotationTab === "states" ? renderAnnotationStates(activeModule) : ""}
      ${prototypeState.activeAnnotationTab === "matrix" ? renderAnnotationMatrix(activeModule) : ""}
      ${prototypeState.activeAnnotationTab === "flow" ? renderAnnotationFlow(activeModule) : ""}
      ${prototypeState.activeAnnotationTab === "tracking" ? renderAnnotationTracking(activeModule) : ""}
    </section>
  `;
}

function renderAnnotationTabs() {
  const labels = {
    notes: "Notes",
    states: "States",
    matrix: "Matrix",
    flow: "Flow",
    tracking: "Tracking"
  };

  return `
    <div class="annotation-tabs">
      ${stateOptions.activeAnnotationTab.map(tab => `
        <button class="annotation-tab ${prototypeState.activeAnnotationTab === tab ? "active" : ""}" onclick="switchAnnotationTab('${tab}')">
          ${labels[tab] || tab}
        </button>
      `).join("")}
    </div>
  `;
}

function renderAnnotationNotes(module) {
  const notes = getModuleNotes(module);
  const fields = [
    ["business", "Business"],
    ["ui", "UI"],
    ["interaction", "Interaction"],
    ["stateRules", "State Rules"],
    ["edgeCases", "Edge Cases"],
    ["acceptance", "Acceptance"]
  ];

  return `
    <div class="annotation-note-body">
      ${fields.map(([key, label]) => `
        <label class="annotation-field">
          <span>${label}</span>
          <textarea class="annotation-textarea" ${prototypeState.annotationReadOnly ? "readonly" : ""} onchange="saveAnnotationData('${module.id}', '${key}', this.value)">${escapeHtml(notes[key])}</textarea>
        </label>
      `).join("")}
    </div>
  `;
}

function renderAnnotationStates(module) {
  const stateKeys = Object.keys(module.states || {});
  const activeState = module.states[prototypeState.activeModuleState] || module.states.default;

  return `
    <div class="annotation-states">
      <div class="annotation-section-title">Quick Presets</div>
      <div class="annotation-preset-row">
        ${stateKeys.map(key => `
          <button class="annotation-preset-btn ${prototypeState.activeModuleState === key ? "active" : ""}" onclick="applyAnnotationPreset('${key}')">
            ${key}
          </button>
        `).join("")}
      </div>

      <label class="annotation-field">
        <span>State Composer</span>
        <select onchange="applyModuleState('${module.id}', this.value)">
          ${stateKeys.map(key => `<option value="${key}" ${prototypeState.activeModuleState === key ? "selected" : ""}>${key}</option>`).join("")}
        </select>
      </label>

      <div class="annotation-preview-box">
        <strong>${escapeHtml(prototypeState.activeModuleState)}</strong>
        <span>Action: ${escapeHtml(activeState ? activeState.action : "none")}</span>
        <p>${escapeHtml(activeState ? activeState.text : "")}</p>
      </div>

      <button class="primary-btn annotation-apply-btn" onclick="applyModuleState('${module.id}', prototypeState.activeModuleState)">Apply</button>
    </div>
  `;
}

function renderAnnotationMatrix(module) {
  return `
    <div class="annotation-list">
      ${(module.matrix || []).map(item => `
        <div class="annotation-row">
          <strong>${escapeHtml(item.state)}</strong>
          <span>${escapeHtml(item.behavior)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAnnotationFlow(module) {
  return `
    <ol class="annotation-list ordered">
      ${(module.flow || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ol>
  `;
}

function renderAnnotationTracking(module) {
  return `
    <div class="annotation-list">
      ${(module.tracking || []).map(item => `
        <div class="annotation-row">
          <strong>${escapeHtml(item.event)}</strong>
          <span>${escapeHtml(item.trigger)}</span>
          <small>${escapeHtml((item.params || []).join(", "))}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function openAnnotationPanel() {
  updateState({
    annotationPanelStatus: "expanded",
    activeModuleId: prototypeState.activeModuleId || getPageModules()[0].id,
    activeAnnotationTab: "notes",
    activeModuleState: "default"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(prototypeState.activeModuleId || getPageModules()[0].id), 0);
  }
}

function closeAnnotationPanel() {
  clearAllModuleEffects();
  updateState({
    annotationPanelStatus: "expanded",
    activeModuleId: null,
    activeModuleState: "default",
    annotationSelectorStatus: "idle"
  });
}

function selectAnnotationModule(moduleId) {
  clearAllModuleEffects();
  updateState({
    activeModuleId: moduleId,
    activeAnnotationTab: "notes",
    activeModuleState: "default",
    annotationSelectorStatus: "idle"
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => highlightAnnotationTarget(moduleId), 0);
  }
}

function switchAnnotationTab(tab) {
  updateState({
    activeAnnotationTab: tab
  });
}

function applyAnnotationPreset(preset) {
  const module = getActiveModule();
  if (!module) return;
  applyModuleState(module.id, preset);
}

function applyModuleState(moduleId, stateKey) {
  clearModuleEffects(moduleId);
  const pageConfig = getCurrentPageConfig();
  const module = pageConfig.modules[moduleId];
  const stateConfig = module && module.states ? module.states[stateKey] : null;

  updateState({
    activeModuleId: moduleId,
    activeModuleState: stateConfig ? stateKey : "default",
    annotationSelectorStatus: "idle"
  });

  if (typeof setTimeout === "function") {
    setTimeout(() => {
      const applied = applyModuleStateEffect(moduleId, stateKey);
      if (!applied) {
        updateState({ annotationSelectorStatus: "missing" });
      }
    }, 0);
  }
}

function applyModuleStateEffect(moduleId, stateKey) {
  const pageConfig = getCurrentPageConfig();
  const module = pageConfig.modules[moduleId];
  const stateConfig = module && module.states ? module.states[stateKey] : null;
  if (!module || !stateConfig || typeof document === "undefined" || typeof document.querySelector !== "function") return false;

  const target = document.querySelector(module.selector);
  if (!target) return false;

  clearModuleEffects(moduleId);
  target.classList.add("annotation-highlight", "hotspot", "active");

  if (stateConfig.action === "hide") target.classList.add("state-hidden");
  if (stateConfig.action === "blur_and_lock") {
    target.classList.add("state-blur");
    target.appendChild(createLockOverlay(stateConfig.text));
  }
  if (stateConfig.action === "skeleton") target.classList.add("state-skeleton");
  if (stateConfig.action === "empty") {
    target.classList.add("state-empty");
    target.appendChild(createEmptyStatePreview(stateConfig.text));
  }
  if (stateConfig.action === "disabled") target.classList.add("state-disabled");
  if (stateConfig.action === "matched") target.classList.add("state-matched");
  if (stateConfig.action === "unlocked") target.classList.add("state-unlocked");

  return true;
}

function createLockOverlay(text) {
  const overlay = document.createElement("div");
  overlay.className = "lock-overlay";
  overlay.textContent = text || "Locked";
  return overlay;
}

function createEmptyStatePreview(text) {
  const preview = document.createElement("div");
  preview.className = "empty-state-preview";
  preview.textContent = text || "No content";
  return preview;
}

function clearModuleEffects(moduleId) {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return;

  const module = getCurrentPageConfig().modules[moduleId];
  if (!module) return;

  const target = document.querySelector(module.selector);
  if (!target) return;

  target.classList.remove(
    "annotation-highlight",
    "hotspot",
    "active",
    "state-hidden",
    "state-blur",
    "state-skeleton",
    "state-empty",
    "state-disabled",
    "state-matched",
    "state-unlocked"
  );
  target.querySelectorAll(":scope > .lock-overlay, :scope > .empty-state-preview").forEach(node => node.remove());
}

function clearAllModuleEffects() {
  getPageModules().forEach(module => clearModuleEffects(module.id));
}

function highlightAnnotationTarget(moduleId) {
  clearAllModuleEffects();
  const applied = applyModuleStateEffect(moduleId, prototypeState.activeModuleState || "default");
  if (!applied) {
    updateState({ annotationSelectorStatus: "missing" });
  }
}

function saveAnnotationData(moduleId, field, value) {
  if (prototypeState.annotationReadOnly || typeof localStorage === "undefined") return;

  const pageId = prototypeState.activeAnnotationPage;
  const notes = getSavedAnnotationNotes(pageId, moduleId);
  notes[field] = value;
  localStorage.setItem(getAnnotationStorageKey(pageId, moduleId), JSON.stringify(notes));
}

function switchLikesTab(tab) {
  updateState({
    likesViewStatus: tab === "matches" ? "matches" : "liked"
  });
}

function openChat(threadId) {
  clearAllModuleEffects();
  updateState({
    currentPage: "chat",
    chatViewStatus: "detail",
    activeChatThreadId: threadId || legacyChatThreads[0].id,
    bottomSheetStatus: "none",
    modalStatus: "none"
  });
}

function closeChat() {
  updateState({
    chatViewStatus: "list",
    activeChatThreadId: null
  });
}

function sendChatMessage() {
  updateState({
    toastStatus: "Message sent"
  });
}

function showMeHint(label) {
  updateState({
    toastStatus: label
  });
}

function openVerifyIntro() {
  updateState({
    toastStatus: "Verification preview"
  });
}

function goToPage(page) {
  clearAllModuleEffects();
  const nextState = {
    currentPage: page,
    bottomSheetStatus: "none",
    modalStatus: "none"
  };

  if (page !== "chat") {
    nextState.chatViewStatus = "list";
    nextState.activeChatThreadId = null;
  }

  updateState(nextState);
}

function swipeLike() {
  const user = getCurrentUser();

  updateState({
    likeStatus: user.likedMe ? "mutual_match" : "liked",
    matchStatus: user.likedMe ? "matched" : "none",
    matchModalStatus: "hidden",
    modalStatus: "none",
    currentCardIndex: prototypeState.currentCardIndex + 1,
    toastStatus: "none"
  });
}

function swipePass() {
  updateState({
    passStatus: "passed",
    currentCardIndex: prototypeState.currentCardIndex + 1,
    toastStatus: "none"
  });
}

function swipeSuperLike() {
  if (prototypeState.superLikeRemaining <= 0 && prototypeState.subscriptionStatus !== "active") {
    openSubscriptionPaywall();
    return;
  }

  updateState({
    superLikeStatus: "used",
    superLikeRemaining: prototypeState.subscriptionStatus === "active" ? prototypeState.superLikeRemaining - 1 : 0,
    currentCardIndex: prototypeState.currentCardIndex + 1,
    toastStatus: "none"
  });
}

function openProfile(userId) {
  const index = mockUsers.findIndex(user => user.id === userId);
  clearAllModuleEffects();

  updateState({
    currentCardIndex: index >= 0 ? index : prototypeState.currentCardIndex,
    currentPage: "profile"
  });
}

function openSubscriptionPaywall() {
  updateState({
    paywallStatus: "subscription_paywall",
    bottomSheetStatus: "subscription_paywall"
  });
}

function openCoinRecharge() {
  updateState({
    paywallStatus: "coin_recharge",
    bottomSheetStatus: "coin_recharge"
  });
}

function openPhotoUnlock(photoId) {
  const photo = photoUnlockItems.find(item => item.id === photoId);

  updateState({
    selectedPhotoId: photoId,
    photoUnlockPrice: photo ? photo.price : prototypeState.photoUnlockPrice,
    bottomSheetStatus: "photo_unlock"
  });
}

function unlockPhoto() {
  if (prototypeState.balanceStatus !== "enough_balance") {
    openCoinRecharge();
    return;
  }

  updateState({
    photoUnlockStatus: "unlocked",
    coinBalance: prototypeState.coinBalance - prototypeState.photoUnlockPrice,
    bottomSheetStatus: "none",
    modalStatus: "unlock_success"
  });
}

function openGiftPanel() {
  updateState({
    giftPanelStatus: "open",
    bottomSheetStatus: "gift_panel"
  });
}

function sendGift(giftId) {
  const gift = giftCatalog.find(item => item.id === giftId);

  if (!gift) return;

  if (prototypeState.coinBalance < gift.price) {
    updateState({
      selectedGiftId: giftId,
      giftSendStatus: "insufficient_balance",
      bottomSheetStatus: "coin_recharge"
    });
    return;
  }

  updateState({
    selectedGiftId: giftId,
    giftSendStatus: "success",
    coinBalance: prototypeState.coinBalance - gift.price,
    bottomSheetStatus: "none",
    modalStatus: "gift_success"
  });
}

function openChatPaywall() {
  updateState({
    bottomSheetStatus: "chat_paywall",
    paywallStatus: "chat_paywall"
  });
}

function selectPackage(packageId) {
  updateState({
    selectedPackageId: packageId,
    paymentStatus: "package_selected"
  });
}

function completeSubscriptionPurchase() {
  updateState({
    subscriptionStatus: "active",
    paymentStatus: "success",
    bottomSheetStatus: "none",
    modalStatus: "payment_success"
  });
}

function completeCoinRecharge() {
  updateState({
    coinBalance: prototypeState.coinBalance + 7000,
    paymentStatus: "success",
    bottomSheetStatus: "none",
    modalStatus: "payment_success"
  });
}

function closeSheet() {
  updateState({
    bottomSheetStatus: "none",
    paywallStatus: "none"
  });
}

function closeModal() {
  updateState({
    modalStatus: "none",
    toastStatus: "none"
  });
}

renderApp();
