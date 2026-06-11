const prototypeState = {
  currentPage: "discover",
  prototypeMode: "pm_review",

  userStatus: "free_user",
  genderSide: "male",

  subscriptionStatus: "none",
  subscriptionPlan: null,
  likesMePermissionStatus: "locked",
  dailySwipeRemaining: 20,
  superLikeRemaining: 1,

  balanceStatus: "low_balance",
  coinBalance: 120,
  paywallStatus: "none",
  paymentStatus: "idle",
  selectedPackageId: null,

  swipeStatus: "ready",
  currentCardIndex: 0,
  likeStatus: "not_liked",
  passStatus: "idle",
  superLikeStatus: "available",

  likedByMeStatus: "normal",
  likesMeStatus: "locked",
  matchStatus: "none",
  matchModalStatus: "hidden",
  likesViewStatus: "liked",

  /* Swipe action state for annotation demo */
  activeSwipeActionState: "like",
  activeChatUserId: null,

  chatPermissionStatus: "limited_free",
  chatSessionStatus: "active",
  paidMessageStatus: "locked",
  messageUnlockStatus: "locked",
  chatViewStatus: "list",
  activeChatThreadId: null,
  activePrivatePhotoMessageId: null,

  giftPanelStatus: "closed",
  selectedGiftId: null,
  giftSendStatus: "idle",

  photoUnlockStatus: "locked",
  unlockedPhotoIds: [],
  activePhotoUnlockSheet: {
    visible: false,
    messageId: null,
    unlockMode: null
  },
  selectedPhotoId: null,
  photoUnlockPrice: 99,

  bottomSheetStatus: "none",
  modalStatus: "none",
  toastStatus: "none",

  annotationStatus: "visible",
  annotationPanelStatus: "collapsed",
  annotationUserSegment: "all",
  activeAnnotationPage: "discover",
  activeModuleId: null,
  activeAnnotationTab: "notes",
  activeModuleState: "default",
  annotationReadOnly: false,
  annotationMode: "select",
  annotationSelectorStatus: "idle",
  annotationEditorPosition: {
    mode: "default",
    x: 0,
    y: 0
  },
  annotationNoteView: "current",
  annotationExportMode: "editable",
  trackingStatus: "hidden",
  chatEmojiPanelOpen: false,

  profileSheetUserId: null,
  profileSheetPhotoIndex: 0,

  discoverFilterGender: "women",
  discoverFilterAgeMin: 18,
  discoverFilterAgeMax: 40,
  discoverFilterDistance: 50,

  /* Entitlement / Usage Counter fields */
  activeEntitlementKey: "free_user",
  activePaywallType: null,

  dailyLikeCount: 0,
  dailySuperLikeCount: 0,
  dailyGiftCount: 0,
  dailyPhotoUnlockCount: 0,
  dailyMessageCount: 0,

  likeQuotaRemaining: 5,
  superLikeQuotaRemaining: 0,
  giftQuotaRemaining: 0,
  photoUnlockQuotaRemaining: 0,
  messageQuotaRemaining: 3,

  isLikeLimited: false,
  isSuperLikeLimited: true,
  isGiftLimited: true,
  isPhotoLimited: true,
  isMessageLimited: false,
  isLikesMeLocked: true,

  usageCounters: {
    swipe_limit: 0,
    like_action: 0,
    message_send: 0,
    likes_me: 0,
    visitor_view: 0,
    private_photo: 0,
    private_video: 0,
    advanced_filter: 0,
    boost_exposure: 0,
    paid_gift: 0,
    profile_enhance: 0
  }
};

const stateOptions = {
  currentPage: ["discover", "likes", "matches", "chat", "me", "profile", "discoverSettings"],
  subscriptionStatus: ["none", "active", "expired"],
  likesMePermissionStatus: ["locked", "partial_visible", "unlocked"],
  balanceStatus: ["no_balance", "low_balance", "enough_balance"],
  swipeStatus: ["ready", "liked", "passed", "super_liked", "empty", "limited"],
  likeStatus: ["not_liked", "liked", "liked_me", "mutual_match"],
  matchStatus: ["none", "matched"],
  likesViewStatus: ["liked", "matches"],
  chatPermissionStatus: ["limited_free", "paid_required", "coin_required", "blocked"],
  chatViewStatus: ["list", "detail"],
  paidMessageStatus: ["locked", "unlocked"],
  photoUnlockStatus: ["locked", "unlocking", "unlocked", "insufficient_balance"],
  giftSendStatus: ["idle", "success", "insufficient_balance"],
  bottomSheetStatus: [
    "none",
    "subscription_paywall",
    "coin_recharge",
    "photo_unlock",
    "gift_panel",
    "chat_paywall",
    "profile_sheet",
    "filter_confirm"
  ],
  modalStatus: ["none", "match_success", "payment_success", "unlock_success", "gift_success"],
  annotationStatus: ["hidden", "visible"],
  annotationPanelStatus: ["collapsed", "expanded"],
  activeEntitlementKey: ["new_user", "free_user", "paid_user", "subscriber", "renewal_user", "low_balance_user"],
  activeSwipeActionState: ["pass", "like", "like_match"],
  activeAnnotationTab: ["notes", "states", "tracking"],
  activeModuleState: [
    "default",
    "locked",
    "loading",
    "empty",
    "hidden",
    "unlocked",
    "insufficient_balance",
    "matched"
  ]
};

function updateState(partialState) {
  Object.assign(prototypeState, partialState);
  syncDerivedState();

  if (typeof renderApp === "function") {
    renderApp();
  }
}

function getCurrentActionPrice() {
  if (prototypeState.bottomSheetStatus === "photo_unlock") {
    return prototypeState.photoUnlockPrice;
  }

  if (prototypeState.bottomSheetStatus === "gift_panel") {
    const gift = giftCatalog.find(item => item.id === prototypeState.selectedGiftId);
    return gift ? gift.price : 0;
  }

  return prototypeState.photoUnlockPrice;
}

function syncDerivedState() {
  if (prototypeState.subscriptionStatus === "active") {
    prototypeState.likesMePermissionStatus = "unlocked";
    prototypeState.dailySwipeRemaining = "unlimited";
    prototypeState.superLikeRemaining = Math.max(Number(prototypeState.superLikeRemaining) || 0, 5);
  }

  if (prototypeState.subscriptionStatus !== "active") {
    if (prototypeState.likesMePermissionStatus === "unlocked") {
      prototypeState.likesMePermissionStatus = "locked";
    }
  }

  const actionPrice = getCurrentActionPrice();

  if (prototypeState.coinBalance <= 0) {
    prototypeState.balanceStatus = "no_balance";
  } else if (prototypeState.coinBalance < actionPrice) {
    prototypeState.balanceStatus = "low_balance";
  } else {
    prototypeState.balanceStatus = "enough_balance";
  }

  if (prototypeState.activeAnnotationPage !== prototypeState.currentPage) {
    prototypeState.activeAnnotationPage = prototypeState.currentPage;
    prototypeState.activeModuleId = null;
    prototypeState.activeAnnotationTab = "notes";
    prototypeState.activeModuleState = "default";
    prototypeState.annotationSelectorStatus = "idle";
  }

  /* ── Entitlement-derived state ── */
  var ent = entitlementRules[prototypeState.activeEntitlementKey];
  if (!ent) return;

  var quotaMappings = [
    { actionKey: "like",         quotaField: "likeQuotaRemaining",         counterField: "dailyLikeCount" },
    { actionKey: "superLike",    quotaField: "superLikeQuotaRemaining",    counterField: "dailySuperLikeCount" },
    { actionKey: "gift",         quotaField: "giftQuotaRemaining",         counterField: "dailyGiftCount" },
    { actionKey: "photoUnlock",  quotaField: "photoUnlockQuotaRemaining",  counterField: "dailyPhotoUnlockCount" },
    { actionKey: "chatMessage",  quotaField: "messageQuotaRemaining",      counterField: "dailyMessageCount" }
  ];

  quotaMappings.forEach(function(m) {
    var quota = (ent.quotas[m.actionKey] || {}).daily;
    if (quota === "unlimited") {
      prototypeState[m.quotaField] = "unlimited";
      return;
    }
    var used = prototypeState[m.counterField] || 0;
    var remaining = Math.max(0, (quota || 0) - used);
    prototypeState[m.quotaField] = remaining;
  });

  prototypeState.isLikeLimited = prototypeState.likeQuotaRemaining !== "unlimited" && prototypeState.likeQuotaRemaining <= 0;
  prototypeState.isSuperLikeLimited = prototypeState.superLikeQuotaRemaining !== "unlimited" && prototypeState.superLikeQuotaRemaining <= 0;
  prototypeState.isGiftLimited = prototypeState.giftQuotaRemaining !== "unlimited" && prototypeState.giftQuotaRemaining <= 0;
  prototypeState.isPhotoLimited = prototypeState.photoUnlockQuotaRemaining !== "unlimited" && prototypeState.photoUnlockQuotaRemaining <= 0;
  prototypeState.isMessageLimited = prototypeState.messageQuotaRemaining !== "unlimited" && prototypeState.messageQuotaRemaining <= 0;
  prototypeState.isLikesMeLocked = !(ent.quotas.likesMe || {}).visible;
}
