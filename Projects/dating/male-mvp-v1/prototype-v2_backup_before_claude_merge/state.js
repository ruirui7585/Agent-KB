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

  chatPermissionStatus: "limited_free",
  chatSessionStatus: "active",
  paidMessageStatus: "locked",
  messageUnlockStatus: "locked",
  chatViewStatus: "list",
  activeChatThreadId: null,

  giftPanelStatus: "closed",
  selectedGiftId: null,
  giftSendStatus: "idle",

  photoUnlockStatus: "locked",
  selectedPhotoId: null,
  photoUnlockPrice: 99,

  bottomSheetStatus: "none",
  modalStatus: "none",
  toastStatus: "none",

  annotationStatus: "visible",
  annotationPanelStatus: "collapsed",
  activeAnnotationPage: "discover",
  activeModuleId: null,
  activeAnnotationTab: "notes",
  activeModuleState: "default",
  annotationReadOnly: false,
  annotationMode: "select",
  annotationSelectorStatus: "idle",
  trackingStatus: "hidden"
};

const stateOptions = {
  currentPage: ["discover", "likes", "matches", "chat", "me", "profile"],
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
  photoUnlockStatus: ["locked", "unlocked"],
  giftSendStatus: ["idle", "success", "insufficient_balance"],
  bottomSheetStatus: [
    "none",
    "subscription_paywall",
    "coin_recharge",
    "photo_unlock",
    "gift_panel",
    "chat_paywall"
  ],
  modalStatus: ["none", "match_success", "payment_success", "unlock_success", "gift_success"],
  annotationStatus: ["hidden", "visible"],
  annotationPanelStatus: ["collapsed", "expanded"],
  activeAnnotationTab: ["notes", "states", "matrix", "flow", "tracking"],
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
}
