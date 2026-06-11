/* ========== Image Pools ========== */

function createFallbackSvg(initial, color1, color2) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">'
    + '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="' + color1 + '"/>'
    + '<stop offset="100%" stop-color="' + color2 + '"/>'
    + '</linearGradient></defs>'
    + '<rect width="400" height="400" fill="url(#g)"/>'
    + '<text x="200" y="200" font-family="Arial,sans-serif" font-size="160" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">'
    + initial + '</text></svg>';
  return 'data:image/svg+xml;base64,' + (typeof btoa === 'function' ? btoa(svg) : '');
}

var avatarPool = {
  u_001: {
    src: "./assets/avatars/avatar_01.jpg",
    fallback: createFallbackSvg("L", "#8B5CF6", "#D946EF"),
    initial: "L",
    name: "Layla"
  },
  u_002: {
    src: "./assets/avatars/avatar_02.jpg",
    fallback: createFallbackSvg("M", "#06B6D4", "#3B82F6"),
    initial: "M",
    name: "Mariam"
  },
  u_003: {
    src: "./assets/avatars/avatar_03.jpg",
    fallback: createFallbackSvg("N", "#F59E0B", "#EF4444"),
    initial: "N",
    name: "Noura"
  },
  me: {
    src: "./assets/avatars/avatar_me_male.jpg",
    fallback: createFallbackSvg("R", "#10B981", "#059669"),
    initial: "R",
    name: "Rui"
  },
  legacy_noor: {
    src: "./assets/avatars/avatar_05.jpeg",
    fallback: createFallbackSvg("N", "#F59E0B", "#EF4444"),
    initial: "N",
    name: "Noor"
  },
  legacy_amira: {
    src: "./assets/avatars/avatar_06.png",
    fallback: createFallbackSvg("A", "#EC4899", "#BE185D"),
    initial: "A",
    name: "Amira"
  },
  legacy_salma: {
    src: "./assets/avatars/avatar_07.png",
    fallback: createFallbackSvg("S", "#8B5CF6", "#7C3AED"),
    initial: "S",
    name: "Salma"
  },
  legacy_hala: {
    src: "./assets/avatars/avatar_08.png",
    fallback: createFallbackSvg("H", "#0EA5E9", "#0284C7"),
    initial: "H",
    name: "Hala"
  }
};

var discoverImagePool = {
  u_001: avatarPool.u_001,
  u_002: avatarPool.u_002,
  u_003: avatarPool.u_003
};

var photoPool = {
  photo_001: {
    src: "./assets/photos/discover_01.jpg",
    fallback: createFallbackSvg("P1", "#A855F7", "#7C3AED")
  },
  photo_002: {
    src: "./assets/photos/discover_02.jpg",
    fallback: createFallbackSvg("P2", "#EC4899", "#BE185D")
  },
  private_01: {
    src: "./assets/photos/discover_05.jpeg",
    fallback: createFallbackSvg("P1", "#A855F7", "#7C3AED")
  },
  private_02: {
    src: "./assets/photos/discover_06.png",
    fallback: createFallbackSvg("P2", "#EC4899", "#BE185D")
  },
  private_03: {
    src: "./assets/photos/discover_07.png",
    fallback: createFallbackSvg("P3", "#F59E0B", "#EF4444")
  }
};

var fallbackAvatar = {
  src: "",
  fallback: createFallbackSvg("?", "#A1A1AA", "#71717A"),
  initial: "?"
};

var fallbackImage = {
  src: "",
  fallback: createFallbackSvg("", "#E2E8F0", "#CBD5E1"),
  initial: ""
};

function getAvatar(userId) {
  return avatarPool[userId] || fallbackAvatar;
}

function getPhoto(photoId) {
  return photoPool[photoId] || fallbackImage;
}

const mockUsers = [
  {
    id: "u_001",
    name: "Layla",
    arabicName: "ليلى",
    age: 24,
    city: "Dubai",
    country: "UAE",
    distance: "4 km away",
    online: true,
    verified: true,
    avatar: "./assets/avatars/avatar_01.jpg",
    bio: "Coffee, beach walks, and late night conversations.",
    interests: ["Travel", "Coffee", "Music"],
    lifestyle: "Social drinker · Non-smoker · Travel often · Pet lover",
    likedMe: true,
    matched: false,
    matchOnLike: true
  },
  {
    id: "u_002",
    name: "Mariam",
    arabicName: "مريم",
    age: 26,
    city: "Riyadh",
    country: "Saudi Arabia",
    distance: "8 km away",
    online: true,
    verified: true,
    avatar: "./assets/avatars/avatar_02.jpg",
    bio: "Looking for someone kind, funny, and honest.",
    interests: ["Fashion", "Movies", "Food"],
    lifestyle: "Non-smoker · Fitness enthusiast · Foodie · Beach lover",
    likedMe: false,
    matched: true
  },
  {
    id: "u_003",
    name: "Noura",
    arabicName: "نورة",
    age: 23,
    city: "Doha",
    country: "Qatar",
    distance: "12 km away",
    online: false,
    verified: false,
    avatar: "./assets/avatars/avatar_03.jpg",
    bio: "Art, books, and meaningful talks.",
    interests: ["Art", "Books", "Design"],
    lifestyle: "Art lover · Bookworm · Coffee addict · Introvert",
    likedMe: true,
    matched: false
  }
];

const likedByMeUsers = [mockUsers[1], mockUsers[2]];

const likesMeUsers = [mockUsers[0], mockUsers[2]];

const swipeActionStates = [
  {
    key: "pass",
    label: "点击 X",
    action: "pass",
    result: "next_card",
    toast: "已跳过",
    tracking: ["swipe_pass_click"]
  },
  {
    key: "like",
    label: "点击爱心",
    action: "like",
    result: "next_card",
    toast: "已喜欢",
    tracking: ["swipe_like_click"]
  },
  {
    key: "like_match",
    label: "点击爱心并匹配",
    action: "like",
    result: "match_modal",
    modalType: "match_success",
    nextAction: "open_chat",
    tracking: ["swipe_like_click", "match_success_popup_show", "match_start_chat_click"]
  }
];

const annotationControlTypeLabels = {
  info: "说明型",
  state: "状态型",
  simulation: "模拟型",
  permission: "权限型",
  consumption: "消耗型",
  account: "账户型",
  export: "导出型"
};

const featureScenarioConfigs = {
  discover: [
    {
      id: "discover_swipe_page",
      title: "滑卡页面",
      controlType: "state",
      moduleId: "discover_card",
      notes: {
        business: "用于展示推荐用户卡片、Like / X 操作、剩余次数和匹配入口。",
        ui: "以大图滑卡为主，保留底部操作按钮和当前用户基础信息。",
        interaction: "用户可点击 Like / X 切换卡片，也可进入资料页查看更完整信息。",
        stateRules: "滑卡次数和喜欢次数应随用户类型和操作次数同步变化。",
        edgeCases: "无更多推荐、图片加载失败、次数用完时需要有明确反馈。",
        acceptance: "卡片清晰展示，Like / X 可点击，底部 Tab 不被遮挡。"
      },
      tracking: [
        { event: "swipe_card_expose", trigger: "滑卡首页展示", params: ["target_user_id", "card_index"] },
        { event: "swipe_like_click", trigger: "点击 Like", params: ["target_user_id"] }
      ]
    },
    {
      id: "discover_secondary_page",
      title: "二级页面",
      controlType: "simulation",
      moduleId: "discover_card",
      notes: {
        business: "用于展示单个用户的完整资料、私密内容入口和聊天入口。",
        ui: "资料页应突出头像、基础资料、兴趣标签、私密内容和行动入口。",
        interaction: "从滑卡点击进入，支持返回 Discover、发起聊天或触发私密内容解锁。",
        stateRules: "私密内容仍按金币消耗处理，不因为订阅状态默认免费。",
        edgeCases: "资料缺失、私密内容未解锁、金币不足时需要保持清晰路径。",
        acceptance: "二级页信息层级清楚，返回和主要入口可点击。"
      },
      tracking: [
        { event: "profile_view", trigger: "进入资料二级页", params: ["target_user_id"] },
        { event: "profile_chat_click", trigger: "点击聊天入口", params: ["target_user_id"] }
      ]
    }
  ],
  likes: [],
  chatList: [],
  chatDetail: [
    {
      id: "chat_private_photo_unlock",
      title: "私密照解锁",
      controlType: "consumption",
      moduleId: "chat_private_photo_unlock",
      notes: {
        business: "对方发送私密照后，用户通过单张或多张金币付费解锁。",
        ui: "未解锁时展示模糊卡片和解锁入口，解锁后展示高清图片。",
        interaction: "点击私密照打开解锁面板；金币足够扣费解锁，金币不足进入金币充值。",
        stateRules: "私密照不是订阅权益，subscriber 也不会默认免费看。",
        edgeCases: "重复点击已解锁图片不重复扣费；金币不足不得触发订阅弹窗。",
        acceptance: "locked / unlocked / insufficient_balance 三种状态展示清晰，付费链路只走金币。"
      },
      tracking: [
        { event: "private_photo_unlock_sheet_show", trigger: "点击未解锁私密照", params: ["thread_id", "photo_id"] },
        { event: "private_photo_unlock_success", trigger: "解锁成功", params: ["thread_id", "photo_id", "price"] }
      ]
    }
  ],
  me: []
};

const likedGridUsers = [
  { id: "lg_001", name: "Zara", age: 25, city: "Dubai", avatar: "./assets/avatars/avatar_01.jpg", active: true, nearby: true, isNew: false, popular: true, premium: true, likedAt: "1 day ago" },
  { id: "lg_002", name: "Aisha", age: 23, city: "Abu Dhabi", avatar: "./assets/avatars/avatar_02.jpg", active: true, nearby: true, isNew: true, popular: false, premium: false, likedAt: "3 hours ago" },
  { id: "lg_003", name: "Noura", age: 23, city: "Doha", avatar: "./assets/avatars/avatar_03.jpg", active: false, nearby: false, isNew: true, popular: true, premium: false, likedAt: "2 days ago" },
  { id: "lg_004", name: "Amira", age: 27, city: "Riyadh", avatar: "./assets/avatars/avatar_06.png", active: true, nearby: false, isNew: false, popular: true, premium: true, likedAt: "5 days ago" },
  { id: "lg_005", name: "Salma", age: 28, city: "Dubai", avatar: "./assets/avatars/avatar_07.png", active: false, nearby: true, isNew: true, popular: false, premium: false, likedAt: "1 week ago" },
  { id: "lg_006", name: "Hala", age: 24, city: "Sharjah", avatar: "./assets/avatars/avatar_08.png", active: true, nearby: true, isNew: false, popular: false, premium: false, likedAt: "just now" },
  { id: "lg_007", name: "Lina", age: 22, city: "Dubai", avatar: "./assets/avatars/avatar_04.jpg", active: true, nearby: true, isNew: true, popular: true, premium: true, likedAt: "10 minutes ago" },
  { id: "lg_008", name: "Yasmin", age: 30, city: "Muscat", avatar: "./assets/avatars/avatar_05.jpeg", active: false, nearby: false, isNew: false, popular: true, premium: false, likedAt: "6 days ago" },
  { id: "lg_009", name: "Dalia", age: 26, city: "Kuwait City", avatar: "./assets/avatars/avatar_09.png", active: true, nearby: false, isNew: false, popular: false, premium: true, likedAt: "4 hours ago" },
  { id: "lg_010", name: "Farah", age: 28, city: "Dubai", avatar: "./assets/avatars/avatar_10.png", active: false, nearby: true, isNew: false, popular: true, premium: true, likedAt: "2 days ago" }
];

const matchUsers = [
  {
    ...mockUsers[1],
    lastMatchTime: "Today",
    prompt: "You both liked each other"
  }
];

const chatThreads = [
  {
    id: "chat_001",
    userId: "u_002",
    name: "Mariam",
    avatar: mockUsers[1].avatar,
    lastMessage: "Hey, nice to meet you 😊",
    unreadCount: 2,
    paidMessage: false
  },
  {
    id: "chat_002",
    userId: "u_001",
    name: "Layla",
    avatar: mockUsers[0].avatar,
    lastMessage: "Unlock her message to continue chatting",
    unreadCount: 1,
    paidMessage: true
  }
];

const legacyMatchUsers = [
  {
    id: "legacy_match_001",
    name: "Noor",
    age: 29,
    avatar: mockUsers[2].avatar,
    initial: "N",
    status: "Matched 2 min ago · Online now",
    action: "Chat"
  },
  {
    id: "legacy_match_002",
    name: "Mariam",
    age: 26,
    avatar: mockUsers[1].avatar,
    initial: "M",
    status: "Sent a SuperCrush back",
    action: "Reply"
  },
  {
    id: "legacy_match_003",
    name: "Amira",
    age: 27,
    avatar: "./assets/avatars/avatar_06.png",
    initial: "A",
    status: "New match from Riyadh",
    action: "Chat"
  },
  {
    id: "legacy_match_004",
    name: "Layla",
    age: 25,
    avatar: mockUsers[0].avatar,
    initial: "L",
    status: "Liked your travel photo",
    action: "Reply"
  },
  {
    id: "legacy_match_005",
    name: "Salma",
    age: 28,
    avatar: "./assets/avatars/avatar_07.png",
    initial: "S",
    status: "Waiting for your first message",
    action: "Chat"
  },
  {
    id: "legacy_match_006",
    name: "Hala",
    age: 24,
    avatar: "./assets/avatars/avatar_08.png",
    initial: "H",
    status: "Flash Chat available",
    action: "Start"
  }
];

const legacyChatThreads = [
  {
    id: "legacy_chat_001",
    name: "Hala",
    age: 24,
    avatar: legacyMatchUsers[5].avatar,
    initial: "H",
    lastMessage: "Hey, I liked your profile 😊",
    time: "5:25",
    unreadCount: 1,
    locked: false,
    online: true,
    privatePhotoFlow: true
  },
  {
    id: "legacy_chat_002",
    name: "Noor",
    age: 29,
    avatar: legacyMatchUsers[0].avatar,
    initial: "N",
    lastMessage: "Matched today. Say hi before she goes offline.",
    time: "5:23",
    unreadCount: 0,
    locked: false,
    online: true
  },
  {
    id: "legacy_chat_003",
    userId: "u_002",
    name: "Mariam",
    age: 26,
    avatar: legacyMatchUsers[1].avatar,
    initial: "M",
    lastMessage: "Sent a private photo. Upgrade to unlock HD.",
    time: "5:07",
    unreadCount: 0,
    locked: true,
    online: false
  },
  {
    id: "legacy_chat_004",
    name: "Amira",
    age: 27,
    avatar: legacyMatchUsers[2].avatar,
    initial: "A",
    lastMessage: "Are you also in Riyadh this week?",
    time: "4:18",
    unreadCount: 0,
    locked: false,
    online: true
  },
  {
    id: "legacy_chat_005",
    userId: "u_001",
    name: "Layla",
    age: 25,
    avatar: legacyMatchUsers[3].avatar,
    initial: "L",
    lastMessage: "I liked your travel photo.",
    time: "2:41",
    unreadCount: 0,
    locked: false,
    online: false
  },
  {
    id: "legacy_chat_006",
    name: "Salma",
    age: 28,
    avatar: legacyMatchUsers[4].avatar,
    initial: "S",
    lastMessage: "Waiting for your first message.",
    time: "9:10",
    unreadCount: 0,
    locked: false,
    online: false
  }
];

const chatMessageHistory = {
  legacy_chat_001: [
    { type: "divider", label: "Today" },
    { type: "incoming", text: "Hey, I liked your profile 😊", time: "5:25" }
  ],
  legacy_chat_002: [
    { type: "divider", label: "Today" },
    { type: "incoming", text: "Matched today. Say hi before she goes offline.", time: "5:23" },
    { type: "outgoing", text: "Hi Noor! Nice to match with you 😊", time: "5:24" }
  ],
  legacy_chat_003: [
    { type: "divider", label: "Yesterday" },
    { type: "incoming", text: "Sent a private photo.", time: "5:07" },
    { type: "locked", title: "Private Moment", text: "Upgrade to unlock HD and continue chatting" }
  ],
  legacy_chat_004: [
    { type: "divider", label: "Today" },
    { type: "incoming", text: "Are you also in Riyadh this week?", time: "4:18" },
    { type: "outgoing", text: "Yes! Would love to meet up if you're free.", time: "4:20" },
    { type: "incoming", text: "Sounds great. Let's plan something.", time: "4:22" }
  ],
  legacy_chat_005: [
    { type: "divider", label: "Yesterday" },
    { type: "incoming", text: "I liked your travel photo.", time: "2:41" },
    { type: "outgoing", text: "Thanks! That was from my trip to Bali.", time: "2:43" },
    { type: "incoming", text: "Wow, I've always wanted to go there!", time: "2:45" }
  ],
  legacy_chat_006: [
    { type: "divider", label: "Monday" },
    { type: "incoming", text: "Waiting for your first message.", time: "9:10" }
  ]
};

const privatePhotoMessageTemplates = {
  legacy_chat_001: {
    id: "msg_private_photo_01",
    sender: "her",
    type: "private_photo",
    status: "locked",
    photoIds: ["private_01", "private_02", "private_03"],
    previewImage: "./assets/photos/discover_05.jpeg",
    unlockType: "single_photo",
    priceCoins: 120,
    bundlePriceCoins: 299,
    bundleCount: 3,
    copy: {
      lockedTitle: "Private photo",
      lockedDesc: "Unlock to view her private photo",
      singleCta: "Unlock 1 photo",
      bundleCta: "Unlock 3 photos"
    }
  }
};

const legacyMeBenefits = [
  { label: "Daily likes", free: "15", plus: "∞" },
  { label: "See who liked you", free: "▣", plus: "✓" },
  { label: "Daily Pokes", free: "▣", plus: "1" }
];

const subscriptionPackages = [
  {
    id: "sub_weekly",
    name: "Weekly Premium",
    price: "$4.99",
    tag: "Starter",
    benefits: ["See who liked you", "More daily swipes", "5 Super Likes"]
  },
  {
    id: "sub_monthly",
    name: "Monthly Premium",
    price: "$12.99",
    tag: "Best Value",
    benefits: ["Unlock all Likes", "Unlimited swipes", "Priority exposure"]
  },
  {
    id: "sub_quarterly",
    name: "3-Month Premium",
    price: "$29.99",
    tag: "Save More",
    benefits: ["All Premium features", "More visibility", "Better match chance"]
  }
];

const coinPackages = [
  {
    id: "coin_1200",
    coins: 1200,
    price: "$0.99",
    tag: "Basic"
  },
  {
    id: "coin_2500",
    coins: 2500,
    price: "$1.99",
    tag: "Starter"
  },
  {
    id: "coin_4500",
    coins: 4500,
    price: "$2.99",
    tag: "Value"
  },
  {
    id: "coin_7000",
    coins: 7000,
    price: "$4.99",
    tag: "Popular"
  },
  {
    id: "coin_11000",
    coins: 11000,
    price: "$7.99",
    tag: "Hot"
  },
  {
    id: "coin_16000",
    coins: 16000,
    price: "$9.99",
    tag: "Best Value"
  }
];

const giftCatalog = [
  {
    id: "gift_rose",
    name: "Rose",
    icon: "🌹",
    price: 30
  },
  {
    id: "gift_heart",
    name: "Heart",
    icon: "💖",
    price: 99
  },
  {
    id: "gift_crown",
    name: "Crown",
    icon: "👑",
    price: 299
  },
  {
    id: "gift_diamond",
    name: "Diamond",
    icon: "💎",
    price: 699
  },
  {
    id: "gift_teddy",
    name: "Teddy",
    icon: "🧸",
    price: 59
  },
  {
    id: "gift_chocolate",
    name: "Chocolate",
    icon: "🍫",
    price: 79
  },
  {
    id: "gift_perfume",
    name: "Perfume",
    icon: "🧴",
    price: 129
  },
  {
    id: "gift_ring",
    name: "Ring",
    icon: "💍",
    price: 399
  },
  {
    id: "gift_star",
    name: "Star",
    icon: "⭐",
    price: 49
  },
  {
    id: "gift_cake",
    name: "Cake",
    icon: "🎂",
    price: 89
  },
  {
    id: "gift_lipstick",
    name: "Lipstick",
    icon: "💄",
    price: 149
  },
  {
    id: "gift_car",
    name: "Sports Car",
    icon: "🏎️",
    price: 999
  },
  {
    id: "gift_moon",
    name: "Moon",
    icon: "🌙",
    price: 66
  },
  {
    id: "gift_flower",
    name: "Bouquet",
    icon: "💐",
    price: 188
  },
  {
    id: "gift_fireworks",
    name: "Fireworks",
    icon: "🎆",
    price: 259
  },
  {
    id: "gift_castle",
    name: "Castle",
    icon: "🏰",
    price: 1299
  }
];

const settingsMenuItems = [
  { id: "account", icon: "shield", label: "Account" },
  { id: "notifications", icon: "bell", label: "Notifications" },
  { id: "privacy", icon: "lock", label: "Privacy & Safety" },
  { id: "help", icon: "help", label: "Help & Support" },
  { id: "about", icon: "info", label: "About" },
  { id: "logout", icon: "logout", label: "Log Out" }
];

const editProfileDefaults = {
  photos: [
    "./assets/me-avatar.svg"
  ],
  fields: {
    work: "Product Manager",
    education: "King Saud University",
    bio: "I enjoy meaningful conversations, weekend coffee, and meeting people with a warm sense of humor.",
    height: "178 cm",
    weight: "76 kg",
    languages: "Arabic, English",
    relationshipStatus: "Single",
    religion: "Muslim",
    personality: "Calm, loyal, curious"
  }
};

const editProfileBasicDetailOptions = [
  { key: "height", label: "Height", options: ["165 cm", "170 cm", "175 cm", "178 cm", "180 cm", "185 cm"] },
  { key: "weight", label: "Weight", options: ["65 kg", "70 kg", "76 kg", "80 kg", "85 kg", "90 kg"] },
  { key: "languages", label: "Languages", options: ["Arabic", "English", "Arabic, English", "French", "Turkish"] },
  { key: "relationshipStatus", label: "Relationship status", options: ["Single", "Divorced", "Separated", "Complicated"] },
  { key: "religion", label: "Religion", options: ["Muslim", "Christian", "Spiritual", "Prefer not to say"] },
  { key: "personality", label: "Personality", options: ["Calm", "Loyal", "Curious", "Funny", "Ambitious", "Calm, loyal, curious"] }
];

const photoUnlockItems = [
  {
    id: "photo_001",
    userId: "u_001",
    image: "./assets/photos/discover_03.jpg",
    locked: true,
    price: 99
  },
  {
    id: "photo_002",
    userId: "u_001",
    image: "./assets/photos/discover_04.jpg",
    locked: true,
    price: 199
  },
  {
    id: "private_01",
    userId: "legacy_chat_001",
    image: "./assets/photos/discover_05.jpeg",
    locked: true,
    price: 120
  },
  {
    id: "private_02",
    userId: "legacy_chat_001",
    image: "./assets/photos/discover_06.png",
    locked: true,
    price: 120
  },
  {
    id: "private_03",
    userId: "legacy_chat_001",
    image: "./assets/photos/discover_07.png",
    locked: true,
    price: 120
  }
];

const annotations = {
  discover: [
    {
      title: "Swipe Entry",
      content: "Discover is the core entry. Like, Pass and Super Like should stay visible and easy to tap."
    },
    {
      title: "Monetization Timing",
      content: "Do not interrupt the first swipe too early. Subscription and coin paywalls should appear after intent."
    }
  ],
  likes: [
    {
      title: "Likes Structure",
      content: "Likes page contains Liked by Me and Likes Me. Likes Me should encourage Premium subscription."
    }
  ],
  matches: [
    {
      title: "Match Conversion",
      content: "Match success should guide users to start chat quickly."
    }
  ],
  chat: [
    {
      title: "Paid Chat",
      content: "Paid messages can be locked. Unlock should lead to chat paywall or coin recharge."
    }
  ],
  profile: [
    {
      title: "Single Photo Unlock",
      content: "Locked photos are direct coin monetization points."
    }
  ],
  me: [
    {
      title: "Profile & Membership",
      content: "Me page should expose Premium status, balance and profile management."
    }
  ]
};

const annotationStateActions = {
  default: { action: "none", text: "Default state" },
  locked: { action: "blur_and_lock", text: "Upgrade to Premium" },
  loading: { action: "skeleton", text: "Loading module" },
  empty: { action: "empty", text: "No content yet" },
  hidden: { action: "hide", text: "Hidden for this scenario" },
  unlocked: { action: "unlocked", text: "Unlocked" },
  insufficient_balance: { action: "disabled", text: "Not enough coins" },
  matched: { action: "matched", text: "Matched" }
};

const pageConfigs = {
  discover: {
    pageName: "Discover / Swipe",
    description: "Core swipe entry for user discovery and monetization intent.",
    modules: {
      discover_primary: {
        type: "Header",
        selector: "[data-module-id='discover_primary']",
        title: "Discover Header",
        notes: {
          business: "展示滑卡入口、剩余滑卡次数和金币余额，帮助 PM 判断权益消耗前置提示是否清晰。",
          ui: "顶部标题与轻量状态摘要，不应遮挡主卡片。",
          interaction: "点击 Me 可进入个人中心，状态变化后需要同步刷新数字。",
          stateRules: "subscriptionStatus = active 时 dailySwipeRemaining 可变为 unlimited。",
          edgeCases: "滑卡次数为 0、金币不足、订阅激活后文案过长。",
          acceptance: "标题、剩余次数、金币数可见；切换页面后注释器同步为当前页。"
        },
        relatedStates: ["currentPage", "dailySwipeRemaining", "coinBalance", "subscriptionStatus"],
        paywallRules: [{ condition: "dailySwipeRemaining = 0", action: "open subscription_paywall" }],
        matrix: [
          { state: "default", behavior: "展示 Discover 标题和权益摘要" },
          { state: "loading", behavior: "展示 header skeleton" },
          { state: "hidden", behavior: "隐藏 header 用于沉浸态检查" }
        ],
        flow: ["Discover → Me button → Me", "State Panel → subscriptionStatus active → Unlimited swipes"],
        tracking: [{ event: "discover_header_expose", trigger: "Header rendered", params: ["daily_swipe_remaining", "coin_balance"] }],
        states: annotationStateActions
      },
      discover_card: {
        type: "Swipe Card",
        selector: "[data-module-id='discover_card']",
        title: "Swipe Card",
        notes: {
          business: "核心滑卡入口，用于展示推荐用户并承接 Like / Pass / Super Like。",
          ui: "大图卡片，底部渐变展示姓名、年龄、城市、距离、在线状态。",
          interaction: "点击卡片进入 Profile；Like 后切换下一张；互相喜欢时触发 Match。",
          stateRules: "dailySwipeRemaining = 0 时触发 subscription_paywall；subscriptionStatus = active 时提升滑卡次数。",
          edgeCases: "图片加载失败、无更多用户、滑卡次数耗尽、按钮被底部 Tab 遮挡。",
          acceptance: "图片正常展示；按钮可点击；切卡后不残留爱心/X 动效。"
        },
        relatedStates: ["currentCardIndex", "swipeStatus", "likeStatus", "matchStatus", "matchModalStatus", "dailySwipeRemaining"],
        paywallRules: [{ condition: "dailySwipeRemaining = 0", action: "open subscription_paywall" }],
        matrix: [
          { state: "default", behavior: "展示当前推荐卡片" },
          { state: "loading", behavior: "展示 skeleton" },
          { state: "empty", behavior: "展示无更多用户空态" },
          { state: "locked", behavior: "模糊卡片并提示 Premium" }
        ],
        flow: ["Discover → Tap Card → Profile", "Discover → Like → Next Card / Match", "Discover → Super Like → Subscription Paywall if empty"],
        tracking: [
          { event: "swipe_card_expose", trigger: "Card rendered", params: ["target_user_id", "card_index"] },
          { event: "swipe_like_click", trigger: "Tap Like", params: ["target_user_id", "is_liked_me"] }
        ],
        states: annotationStateActions
      },
      discover_actions: {
        type: "Swipe Actions",
        selector: "[data-module-id='discover_actions']",
        title: "Swipe Actions",
        notes: {
          business: "Pass 和 Like 是 Discover 主转化按钮，必须保持在卡片上层且可点击。",
          ui: "圆形按钮悬浮在卡片底部附近，不能被 Bottom Tab 遮挡。",
          interaction: "Pass / Like 点击后切换下一张，不弹出无关 Toast 或 Modal。",
          stateRules: "superLikeRemaining = 0 时 Super Like 入口应触发订阅，当前版本仅保留 Pass / Like。",
          edgeCases: "按钮层级低于底部导航、切卡后反馈残留。",
          acceptance: "按钮处于最上层；点击后卡片切换且无残留反馈。"
        },
        relatedStates: ["passStatus", "likeStatus", "currentCardIndex", "swipeStatus"],
        paywallRules: [],
        matrix: [
          { state: "default", behavior: "展示 Pass / Like" },
          { state: "disabled", behavior: "按钮不可用" },
          { state: "hidden", behavior: "隐藏按钮用于截图对比" }
        ],
        swipeActionStates: [
          {
            key: "pass",
            description: "点击 X — 跳过当前用户，切换下一张",
            interaction: "无权益消耗；不触发 Match；currentCardIndex + 1；toast: 已跳过",
            tracking: ["swipe_pass_click"],
            acceptance: "卡片切换；无残留动效；不弹 Match"
          },
          {
            key: "like",
            description: "点击爱心 — 喜欢当前用户，切换下一张",
            interaction: "消耗 like 权益；未匹配时 currentCardIndex + 1；toast: 已喜欢",
            tracking: ["swipe_like_click"],
            acceptance: "卡片切换；toast 展示 1.5s 后消失"
          },
          {
            key: "like_match",
            description: "点击爱心并匹配 — 与当前用户互相喜欢",
            interaction: "消耗 like 权益；触发 Match Success Modal；可从弹窗进入 Chat",
            tracking: ["swipe_like_click", "match_success_popup_show", "match_start_chat_click"],
            acceptance: "弹窗展示头像/昵称；'开始聊天'进入 Chat；'继续滑卡'切下一张"
          }
        ],
        flow: ["Tap Pass → Next Card", "Tap Like → Next Card / Match"],
        tracking: [
          { event: "swipe_pass_click", trigger: "Tap Pass", params: ["target_user_id"] },
          { event: "swipe_like_click", trigger: "Tap Like", params: ["target_user_id"] }
        ],
        states: annotationStateActions
      }
    }
  },
  likes: {
    pageName: "Likes",
    description: "Liked-you monetization and Match secondary list.",
    modules: {
      likes_primary: {
        type: "Segment Tabs",
        selector: "[data-module-id='likes_primary']",
        title: "Likes Segment Tabs",
        notes: {
          business: "区分 Like you 和 Match，让未订阅用户先看到价值再进入付费。",
          ui: "胶囊二级 Tab，当前项高亮，文案居中。",
          interaction: "点击 Like you / Match 切换列表，不应刷新页面。",
          stateRules: "likesViewStatus 控制当前二级页。",
          edgeCases: "Tab 文案过长、切换后列表空白、注释器高亮影响点击。",
          acceptance: "两个 Tab 都能切换且内容非空。"
        },
        relatedStates: ["currentPage", "likesViewStatus", "likesMePermissionStatus"],
        paywallRules: [{ condition: "likesMePermissionStatus != unlocked", action: "show subscription CTA" }],
        matrix: [
          { state: "default", behavior: "展示 Like you / Match" },
          { state: "loading", behavior: "展示切换加载态" }
        ],
        flow: ["Likes → Like you", "Likes → Match → Chat"],
        tracking: [{ event: "likes_tab_click", trigger: "Tap secondary tab", params: ["tab_name"] }],
        states: annotationStateActions
      },
      likes_me_list: {
        type: "Likes Me Preview",
        selector: "[data-module-id='likes_me_list']",
        title: "Likes Me Preview",
        notes: {
          business: "未订阅时展示模糊喜欢你预览，推动 Premium 订阅。",
          ui: "图片卡片可模糊，CTA 固定在列表底部附近。",
          interaction: "点击预览或 CTA 打开 subscription_paywall。",
          stateRules: "subscriptionStatus = active 时 likesMePermissionStatus = unlocked。",
          edgeCases: "头像模糊仍需保留吸引力；无 Likes 时需要 empty 状态。",
          acceptance: "未订阅时模糊；订阅入口统一打开 subscription_paywall。"
        },
        relatedStates: ["subscriptionStatus", "likesMePermissionStatus", "paywallStatus", "bottomSheetStatus"],
        paywallRules: [{ condition: "subscriptionStatus != active", action: "open subscription_paywall" }],
        matrix: [
          { state: "locked", behavior: "模糊头像并展示订阅 CTA" },
          { state: "unlocked", behavior: "显示完整头像和资料入口" },
          { state: "empty", behavior: "展示暂无喜欢你的人" }
        ],
        flow: ["Likes Me Preview → CTA → Subscription Paywall", "Subscription Success → Preview Unlocked"],
        tracking: [{ event: "likes_me_paywall_show", trigger: "Tap locked preview", params: ["entry"] }],
        states: annotationStateActions
      }
    }
  },
  matches: {
    pageName: "Match",
    description: "Match list and chat entry after mutual like.",
    modules: {
      matches_primary: {
        type: "Match List",
        selector: "[data-module-id='matches_primary']",
        title: "Match List",
        notes: {
          business: "展示互相喜欢后的匹配关系，并推动及时开聊。",
          ui: "列表卡片包含头像、匹配状态和 Chat/Reply 行动。",
          interaction: "点击匹配项进入 Chat。",
          stateRules: "matchStatus = matched 时展示 Chat 入口。",
          edgeCases: "没有匹配时需要 empty 状态；Chat 权限不足时进入 chat_paywall。",
          acceptance: "匹配列表非空；点击 Chat 可进入聊天页。"
        },
        relatedStates: ["matchStatus", "chatPermissionStatus", "currentPage"],
        paywallRules: [{ condition: "chatPermissionStatus = pay_required", action: "open chat_paywall" }],
        matrix: [
          { state: "matched", behavior: "展示匹配列表" },
          { state: "empty", behavior: "展示暂无 Match" }
        ],
        flow: ["Discover → Like → Match", "Match → Chat"],
        tracking: [{ event: "match_list_expose", trigger: "Match page rendered", params: ["match_count"] }],
        states: annotationStateActions
      },
      matches_chat_entry: {
        type: "Chat Entry",
        selector: "[data-module-id='matches_chat_entry']",
        title: "Match Chat Entry",
        notes: {
          business: "匹配后的 Chat 入口是把关系转化为聊天的关键按钮。",
          ui: "按钮在列表右侧，文字短且清晰。",
          interaction: "点击进入 Chat；受限时打开 chat_paywall。",
          stateRules: "chatPermissionStatus 控制是否直接进入聊天。",
          edgeCases: "按钮过窄、重复点击、列表滚动时高亮错位。",
          acceptance: "点击 Chat 后 Chat 页非空。"
        },
        relatedStates: ["chatPermissionStatus", "chatSessionStatus"],
        paywallRules: [{ condition: "chatPermissionStatus = paid_required", action: "open chat_paywall" }],
        matrix: [
          { state: "default", behavior: "可点击进入 Chat" },
          { state: "locked", behavior: "显示聊天付费拦截" }
        ],
        flow: ["Match Row → Chat Entry → Chat Detail"],
        tracking: [{ event: "match_chat_click", trigger: "Tap Match chat button", params: ["match_user_id"] }],
        states: annotationStateActions
      }
    }
  },
  chat: {
    pageName: "Chat",
    description: "IM 对话、付费消息、私密照解锁和金币消耗链路。",
    modules: {
      chat_primary: {
        type: "Chat List",
        selector: "[data-module-id='chat_primary']",
        title: "Chat List / Messages",
        notes: {
          business: "承接 Match 后的聊天关系，并展示未读、在线和互动上下文。",
          ui: "会话列表或消息流需要保持纵向可扫读。",
          interaction: "点击普通会话进入详情；返回后保持列表可用。",
          stateRules: "chatViewStatus 控制 list/detail。",
          edgeCases: "详情页输入框不应被 Bottom Tab 遮挡；列表为空时显示 empty。",
          acceptance: "Chat 列表和详情都不空白，返回可用。"
        },
        relatedStates: ["chatViewStatus", "activeChatThreadId", "chatSessionStatus"],
        paywallRules: [],
        matrix: [
          { state: "default", behavior: "展示会话列表或消息详情" },
          { state: "loading", behavior: "展示聊天加载态" },
          { state: "empty", behavior: "展示暂无聊天" }
        ],
        flow: ["Chat List → Thread → Chat Detail", "Chat Detail → Back → Chat List"],
        tracking: [{ event: "chat_thread_open", trigger: "Tap chat row", params: ["thread_id"] }],
        states: annotationStateActions
      },
      chat_paid_message: {
        type: "Paid Message",
        selector: "[data-module-id='chat_paid_message']",
        title: "Paid Message Lock",
        notes: {
          business: "用于说明消息发送限制、付费消息和金币不足时的充值触发。",
          ui: "锁定消息应可识别，但不要像错误状态。",
          interaction: "点击锁定消息打开 chat_paywall 或 coin_recharge。",
          stateRules: "paidMessageStatus = locked 时展示锁定；coinBalance 不足时进入 coin_recharge。",
          edgeCases: "余额不足、重复点击、支付成功后未刷新。",
          acceptance: "锁定消息点击后打开统一 Bottom Sheet。"
        },
        relatedStates: ["paidMessageStatus", "messageUnlockStatus", "coinBalance", "bottomSheetStatus"],
        paywallRules: [{ condition: "coinBalance < message price", action: "open coin_recharge" }],
        matrix: [
          { state: "locked", behavior: "模糊消息并显示解锁入口" },
          { state: "unlocked", behavior: "展示完整消息内容" },
          { state: "insufficient_balance", behavior: "进入金币充值" }
        ],
        flow: ["Tap Locked Message → Chat Paywall", "Pay Success → Message Unlocked"],
        tracking: [{ event: "chat_paywall_show", trigger: "Tap locked message", params: ["thread_id"] }],
        states: annotationStateActions
      },
      chat_private_photo_unlock: {
        type: "Private Photo Unlock",
        selector: "[data-module-id='chat_private_photo_unlock']",
        title: "Private Photo Unlock",
        notes: {
          business: "用于说明对方发送私密照后的单张 / 多张付费解锁链路。",
          ui: "锁定态展示模糊预览、Lock 图标、单张与多张包价格。",
          interaction: "点击锁定私密照打开 photo_unlock；金币不足进入 coin_recharge；已解锁后点击查看高清预览。",
          stateRules: "unlockedPhotoIds 控制是否高清；coinBalance 足够才扣金币解锁，不足时 photoUnlockStatus = insufficient_balance。",
          edgeCases: "订阅用户不应默认免费查看；重复点击已解锁照片不能重复扣费；余额不足不能走 subscription_paywall。",
          acceptance: "单张/多张包解锁扣金币；不足只打开 coin_recharge；解锁后图片清晰。"
        },
        relatedStates: ["activePrivatePhotoMessageId", "photoUnlockStatus", "unlockedPhotoIds", "coinBalance", "bottomSheetStatus"],
        paywallRules: [
          { condition: "private photo locked", action: "open photo_unlock" },
          { condition: "coinBalance >= unlock price", action: "deduct coins and unlock" },
          { condition: "coinBalance < unlock price", action: "open coin_recharge, never subscription_paywall" }
        ],
        matrix: [
          { state: "locked", behavior: "模糊预览并显示解锁入口" },
          { state: "unlocked", behavior: "高清展示私密照" },
          { state: "insufficient_balance", behavior: "进入金币充值" }
        ],
        flow: ["Chat Thread → Reply → Her Private Photo", "Tap Locked Photo → Photo Unlock Sheet", "Unlock Success → View Private Photo"],
        tracking: [{ event: "private_photo_unlock_click", trigger: "Tap locked private photo", params: ["message_id", "price_coins", "bundle_price_coins"] }],
        states: annotationStateActions
      }
    }
  },
  me: {
    pageName: "Me",
    description: "Profile management, subscription status, and coin balance entry.",
    modules: {
      me_primary: {
        type: "Subscription Entry",
        selector: "[data-module-id='me_primary']",
        title: "Profile / Premium Entry",
        notes: {
          business: "展示个人资料与 PLUS 订阅入口，是稳定会员转化位置。",
          ui: "头像、昵称和会员卡分层展示，主色调不变。",
          interaction: "点击 PLUS 卡打开 subscription_paywall。",
          stateRules: "subscriptionStatus = active 时应避免重复强推。",
          edgeCases: "卡片过高导致金币入口不可见；按钮文案过长。",
          acceptance: "会员入口可点击，Paywall 使用统一 Bottom Sheet。"
        },
        relatedStates: ["subscriptionStatus", "subscriptionPlan", "paywallStatus"],
        paywallRules: [{ condition: "subscriptionStatus != active", action: "open subscription_paywall" }],
        matrix: [
          { state: "default", behavior: "展示个人资料和 PLUS 卡" },
          { state: "unlocked", behavior: "展示已订阅状态" }
        ],
        flow: ["Me → PLUS Card → Subscription Paywall", "Payment Success → Premium Active"],
        tracking: [{ event: "subscription_purchase_click", trigger: "Tap PLUS card", params: ["entry"] }],
        states: annotationStateActions
      },
      me_balance: {
        type: "Coin Balance",
        selector: "[data-module-id='me_balance']",
        title: "Coin Balance Entry",
        notes: {
          business: "展示金币余额，为礼物、付费聊天、单图解锁提供充值入口。",
          ui: "余额数字和 Recharge 按钮要清晰可扫读。",
          interaction: "点击 Recharge 打开 coin_recharge。",
          stateRules: "coinBalance <= 0 时 balanceStatus = no_balance。",
          edgeCases: "余额为 0、余额不足、充值后状态未同步。",
          acceptance: "充值入口打开统一 coin_recharge Bottom Sheet。"
        },
        relatedStates: ["coinBalance", "balanceStatus", "paymentStatus"],
        paywallRules: [{ condition: "balanceStatus = no_balance or low_balance", action: "open coin_recharge" }],
        matrix: [
          { state: "default", behavior: "展示当前余额" },
          { state: "insufficient_balance", behavior: "强调余额不足" }
        ],
        flow: ["Me → Recharge → Coin Recharge Sheet", "Payment Success → coinBalance Updated"],
        tracking: [{ event: "coin_recharge_click", trigger: "Tap Recharge", params: ["entry", "coin_balance"] }],
        states: annotationStateActions
      }
    }
  },
  profile: {
    pageName: "Profile",
    description: "Profile detail with gift, chat, and single photo unlock monetization.",
    modules: {
      profile_primary: {
        type: "Profile Hero",
        selector: "[data-module-id='profile_primary']",
        title: "Profile Hero",
        notes: {
          business: "承接 Discover 或列表点击后的资料详情，用于确认聊天/礼物/解锁意图。",
          ui: "照片、昵称、城市、距离和简介垂直展示。",
          interaction: "Back 返回 Discover；Gift 打开礼物 Bottom Sheet。",
          stateRules: "currentCardIndex 决定当前资料对象。",
          edgeCases: "图片加载失败、返回后卡片错位、资料文字过长。",
          acceptance: "资料页非空；Back、Gift、Start Chat 可用。"
        },
        relatedStates: ["currentCardIndex", "giftPanelStatus", "bottomSheetStatus"],
        paywallRules: [{ condition: "gift price > coinBalance", action: "open coin_recharge" }],
        matrix: [
          { state: "default", behavior: "展示用户资料" },
          { state: "loading", behavior: "资料加载 skeleton" }
        ],
        flow: ["Discover → Profile", "Profile → Gift Panel", "Profile → Chat"],
        tracking: [{ event: "profile_open", trigger: "Tap profile card", params: ["target_user_id"] }],
        states: annotationStateActions
      },
      profile_photos: {
        type: "Single Photo Unlock",
        selector: "[data-module-id='profile_photos']",
        title: "Private Photo Grid",
        notes: {
          business: "单图解锁是资料页内的直接金币消费点。",
          ui: "未解锁图片模糊并显示价格，解锁后清晰展示。",
          interaction: "点击锁图打开 photo_unlock；余额不足进入 coin_recharge。",
          stateRules: "photoUnlockStatus 控制 locked/unlocked，photoUnlockPrice 控制扣费。",
          edgeCases: "余额不足、重复解锁、解锁成功后仍模糊。",
          acceptance: "锁图点击打开 Bottom Sheet；支付成功后图片解锁。"
        },
        relatedStates: ["photoUnlockStatus", "selectedPhotoId", "photoUnlockPrice", "coinBalance"],
        paywallRules: [{ condition: "coinBalance < photoUnlockPrice", action: "open coin_recharge" }],
        matrix: [
          { state: "locked", behavior: "图片模糊并显示价格" },
          { state: "unlocked", behavior: "清晰展示图片" },
          { state: "insufficient_balance", behavior: "引导充值" }
        ],
        flow: ["Profile → Locked Photo → Photo Unlock Sheet", "Unlock Success → Photo Clear"],
        tracking: [{ event: "photo_unlock_click", trigger: "Tap locked photo", params: ["photo_id", "price"] }],
        states: annotationStateActions
      }
    }
  }
};

const profileCarouselPhotos = {
  u_001: [
    { src: "./assets/avatars/avatar_01.jpg", fallback: createFallbackSvg("L", "#8B5CF6", "#D946EF") },
    { src: "./assets/photos/discover_01.jpg", fallback: createFallbackSvg("P1", "#A855F7", "#7C3AED") },
    { src: "./assets/photos/discover_03.jpg", fallback: createFallbackSvg("P3", "#F59E0B", "#EF4444") }
  ],
  u_002: [
    { src: "./assets/avatars/avatar_02.jpg", fallback: createFallbackSvg("M", "#06B6D4", "#3B82F6") },
    { src: "./assets/photos/discover_02.jpg", fallback: createFallbackSvg("P2", "#EC4899", "#BE185D") },
    { src: "./assets/photos/discover_04.jpg", fallback: createFallbackSvg("P4", "#10B981", "#059669") }
  ],
  u_003: [
    { src: "./assets/avatars/avatar_03.jpg", fallback: createFallbackSvg("N", "#F59E0B", "#EF4444") },
    { src: "./assets/photos/discover_01.jpg", fallback: createFallbackSvg("P1", "#A855F7", "#7C3AED") },
    { src: "./assets/photos/discover_02.jpg", fallback: createFallbackSvg("P2", "#EC4899", "#BE185D") }
  ]
};

const trackingEvents = {
  swipeCardExpose: "swipe_card_expose",
  swipeLikeClick: "swipe_like_click",
  swipePassClick: "swipe_pass_click",
  superLikeClick: "super_like_click",
  matchSuccessShow: "match_success_show",
  likesMePaywallShow: "likes_me_paywall_show",
  subscriptionPurchaseClick: "subscription_purchase_click",
  coinRechargeClick: "coin_recharge_click",
  photoUnlockClick: "photo_unlock_click",
  giftSendClick: "gift_send_click",
  chatPaywallShow: "chat_paywall_show"
};

/* ========== Entitlement Rules ========== */

var entitlementUserTypeKeys = [
  "new_user",
  "free_user",
  "paid_user",
  "subscriber",
  "renewal_user",
  "low_balance_user"
];

var entitlementPaywallPointKeys = [
  "swipe_limit",
  "like_action",
  "message_send",
  "likes_me",
  "visitor_view",
  "private_photo",
  "private_video",
  "advanced_filter",
  "boost_exposure",
  "paid_gift",
  "profile_enhance"
];

var entitlementPaymentModels = [
  { key: "subscription",         label: "订阅制" },
  { key: "one_time_package",     label: "一次性套餐" },
  { key: "coin_consumption",     label: "金币消耗" },
  { key: "free_preview_then_pay",label: "先免费后付费" }
];

var entitlementRules = {
  new_user: {
    name: "新用户",
    description: "注册后 7 天内，享有新手体验配额",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "每日免费滑卡 15 次，新手期额外赠送 20 次/日",
        paymentModel: "subscription",
        triggerScene: "当日滑卡达到免费上限后弹出订阅引导，新手期内首次超额展示「升级解锁无限滑卡」",
        limits: { free: 15, paid: "unlimited", trial_extra: 20 },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall", trial: "show_trial_upsell" },
        copy: { free: "今日剩余 {count} 次 · 新手福利 +20", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "新手每日 10 次 Like，超出提示升级",
        paymentModel: "subscription",
        triggerScene: "新手 Like 次数用完，点击 Like 按钮时弹出升级引导",
        limits: { free: 10, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 个 Like", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "新手可免费发送 5 条消息，超出后需订阅或消耗金币",
        paymentModel: "subscription",
        triggerScene: "发送第 6 条消息时弹出订阅引导或金币消耗确认",
        limits: { free: 5, paid: "unlimited" },
        permissions: { free: "limited", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall_or_coin_consume" },
        copy: { free: "剩余 {count} 条免费消息", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "新手 3 天免费预览，之后模糊锁定",
        paymentModel: "free_preview_then_pay",
        triggerScene: "新手免费预览到期后，点击 Likes Me 列表弹出订阅引导",
        limits: { free_preview_days: 3, paid: "unlimited" },
        permissions: { canViewLikesMe: false, free: "timed_preview", paid: "full_access" },
        actions: { preview_expired: "show_subscription_paywall" },
        copy: { free: "免费预览 {days} 天后需升级", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "新手 3 天免费预览，之后锁定",
        paymentModel: "free_preview_then_pay",
        triggerScene: "免费预览到期后点击访客入口弹出订阅引导",
        limits: { free_preview_days: 3, paid: "unlimited" },
        permissions: { free: "timed_preview", paid: "full_access" },
        actions: { preview_expired: "show_subscription_paywall" },
        copy: { free: "免费预览 {days} 天", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "新手首次免费解锁 1 张，后续 99 金币/张",
        paymentModel: "coin_consumption",
        triggerScene: "点击第二张私密照片时弹出金币消耗确认或充值引导",
        limits: { free_trial: 1, coin_per_unlock: 99 },
        permissions: { free: "first_free_then_pay", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "首次免费 · 后续 {price} 金币/张", paid: "{price} 金币解锁" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "锁定，299 金币/个",
        paymentModel: "coin_consumption",
        triggerScene: "点击私密视频时弹出金币消耗确认或充值引导",
        limits: { free: 0, coin_per_unlock: 299 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币解锁视频", paid: "{price} 金币解锁视频" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "基础筛选（性别、年龄、距离）免费，高级筛选锁定",
        paymentModel: "subscription",
        triggerScene: "在 Discover Settings 中点击高级筛选选项弹出订阅引导",
        limits: { free: "basic_only", paid: "full_filters" },
        permissions: { free: "basic_filters", paid: "advanced_filters" },
        actions: { click_advanced: "show_subscription_paywall" },
        copy: { free: "基础筛选免费 · 升级解锁高级筛选", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "新手首次 Boost 免费，后续 199 金币/次或购买 Boost 套餐",
        paymentModel: "one_time_package",
        triggerScene: "第二次点击 Boost 按钮时弹出套餐购买或金币消耗确认",
        limits: { free_trial: 1, coin_per_boost: 199 },
        permissions: { free: "first_free_then_pay", paid: "coin_or_package" },
        actions: { boost: "deduct_coins_or_package", insufficient: "show_boost_package" },
        copy: { free: "首次免费 Boost · 之后 {price} 金币", paid: "Boost 曝光 30 分钟" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "锁定，礼物价格 30-699 金币不等",
        paymentModel: "coin_consumption",
        triggerScene: "在资料页或聊天中点击礼物图标弹出金币消耗确认",
        limits: { min_coin: 30, max_coin: 699 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { send: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币发送礼物", paid: "{price} 金币发送礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "基础资料免费填写，补充项（语音介绍、视频介绍、详细背景）按次付费或订阅解锁",
        paymentModel: "one_time_package",
        triggerScene: "在 Profile 编辑页点击补充资料项弹出套餐引导",
        limits: { free_fields: ["photo", "name", "age", "bio"], paid_fields: ["voice_intro", "video_intro", "detailed_background"] },
        permissions: { free: "basic_profile", paid: "enhanced_profile" },
        actions: { click_enhance: "show_enhance_package" },
        copy: { free: "基础资料免费 · 升级补充更多", paid: "完整资料展示" }
      }
    }
  },

  free_user: {
    name: "免费用户",
    description: "超过新手期或未订阅的标准免费用户",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "每日免费滑卡 5 次",
        paymentModel: "subscription",
        triggerScene: "当日滑卡达到 5 次上限后弹出订阅引导",
        limits: { free: 5, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 次 · 升级无限滑卡", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "每日免费 5 次 Like",
        paymentModel: "subscription",
        triggerScene: "Like 次数用完点击 Like 按钮弹出订阅引导",
        limits: { free: 5, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 个 Like", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "免费 3 条消息/日，超出需订阅或消耗金币",
        paymentModel: "subscription",
        triggerScene: "发送第 4 条消息时弹出订阅引导",
        limits: { free: 3, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "剩余 {count} 条消息 · 升级无限聊天", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "模糊展示，点击弹出订阅引导",
        paymentModel: "subscription",
        triggerScene: "点击 Likes Me 模糊卡片或「查看全部」按钮弹出订阅引导",
        limits: { free: "blurred_preview", paid: "full_access" },
        permissions: { canViewLikesMe: false, free: "blurred", paid: "full_access" },
        actions: { click_blurred: "show_subscription_paywall" },
        copy: { free: "升级查看谁喜欢了你", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "锁定，不可查看",
        paymentModel: "subscription",
        triggerScene: "点击访客入口弹出订阅引导",
        limits: { free: 0, paid: "unlimited" },
        permissions: { free: "locked", paid: "full_access" },
        actions: { click_locked: "show_subscription_paywall" },
        copy: { free: "升级查看谁访问了你", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "锁定，99 金币/张",
        paymentModel: "coin_consumption",
        triggerScene: "点击锁定照片弹出金币消耗确认",
        limits: { free: 0, coin_per_unlock: 99 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币解锁照片", paid: "{price} 金币解锁照片" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "锁定，299 金币/个",
        paymentModel: "coin_consumption",
        triggerScene: "点击私密视频弹出金币消耗确认",
        limits: { free: 0, coin_per_unlock: 299 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币解锁视频", paid: "{price} 金币解锁视频" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "基础筛选免费，高级筛选锁定",
        paymentModel: "subscription",
        triggerScene: "点击高级筛选选项弹出订阅引导",
        limits: { free: "basic_only", paid: "full_filters" },
        permissions: { free: "basic_filters", paid: "advanced_filters" },
        actions: { click_advanced: "show_subscription_paywall" },
        copy: { free: "升级解锁高级筛选", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "锁定，199 金币/次或购买 Boost 套餐",
        paymentModel: "one_time_package",
        triggerScene: "点击 Boost 按钮弹出套餐购买引导",
        limits: { free: 0, coin_per_boost: 199 },
        permissions: { free: "locked", paid: "coin_or_package" },
        actions: { click_boost: "show_boost_package" },
        copy: { free: "199 金币或购买套餐 Boost", paid: "Boost 曝光 30 分钟" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "锁定，礼物价格 30-699 金币",
        paymentModel: "coin_consumption",
        triggerScene: "点击礼物图标弹出金币消耗确认",
        limits: { min_coin: 30, max_coin: 699 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { send: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币发送礼物", paid: "{price} 金币发送礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "基础资料免费，补充项付费",
        paymentModel: "one_time_package",
        triggerScene: "点击补充资料项弹出套餐引导",
        limits: { free_fields: ["photo", "name", "age", "bio"], paid_fields: ["voice_intro", "video_intro", "detailed_background"] },
        permissions: { free: "basic_profile", paid: "enhanced_profile" },
        actions: { click_enhance: "show_enhance_package" },
        copy: { free: "基础资料免费 · 升级补充更多", paid: "完整资料展示" }
      }
    }
  },

  paid_user: {
    name: "付费用户",
    description: "曾购买一次性套餐但未订阅的付费用户",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "每日滑卡 20 次（套餐权益）",
        paymentModel: "subscription",
        triggerScene: "当日滑卡达到 20 次上限后弹出订阅引导",
        limits: { free: 20, paid: "unlimited" },
        permissions: { free: "enhanced_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 次 · 订阅即无限", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "每日 Like 20 次",
        paymentModel: "subscription",
        triggerScene: "Like 次数用完弹出订阅引导",
        limits: { free: 20, paid: "unlimited" },
        permissions: { free: "enhanced_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 个 Like", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "每日 20 条消息，超出需订阅",
        paymentModel: "subscription",
        triggerScene: "消息数用完弹出订阅引导",
        limits: { free: 20, paid: "unlimited" },
        permissions: { free: "enhanced_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "剩余 {count} 条消息", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "模糊展示，付费用户未订阅仍需订阅解锁",
        paymentModel: "subscription",
        triggerScene: "点击模糊的 Likes Me 卡片弹出订阅引导",
        limits: { free: "blurred_preview", paid: "full_access" },
        permissions: { canViewLikesMe: false, free: "blurred", paid: "full_access" },
        actions: { click_blurred: "show_subscription_paywall" },
        copy: { free: "订阅即可查看全部", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "锁定，需订阅",
        paymentModel: "subscription",
        triggerScene: "点击访客入口弹出订阅引导",
        limits: { free: 0, paid: "unlimited" },
        permissions: { free: "locked", paid: "full_access" },
        actions: { click_locked: "show_subscription_paywall" },
        copy: { free: "订阅查看谁访问了你", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "99 金币/张，套餐用户享 8 折",
        paymentModel: "coin_consumption",
        triggerScene: "点击锁定照片弹出金币消耗确认",
        limits: { free: 0, coin_per_unlock: 79 },
        permissions: { free: "coin_consumption_discounted", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币解锁（套餐 8 折）", paid: "{price} 金币解锁" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "239 金币/个（套餐 8 折）",
        paymentModel: "coin_consumption",
        triggerScene: "点击私密视频弹出金币消耗确认",
        limits: { free: 0, coin_per_unlock: 239 },
        permissions: { free: "coin_consumption_discounted", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币解锁（套餐 8 折）", paid: "{price} 金币解锁" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "基础筛选免费，高级筛选需订阅",
        paymentModel: "subscription",
        triggerScene: "点击高级筛选选项弹出订阅引导",
        limits: { free: "basic_only", paid: "full_filters" },
        permissions: { free: "basic_filters", paid: "advanced_filters" },
        actions: { click_advanced: "show_subscription_paywall" },
        copy: { free: "订阅解锁高级筛选", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "159 金币/次（套餐 8 折）",
        paymentModel: "one_time_package",
        triggerScene: "点击 Boost 按钮弹出套餐购买引导或金币消耗",
        limits: { free: 0, coin_per_boost: 159 },
        permissions: { free: "coin_or_package_discounted", paid: "coin_or_package" },
        actions: { boost: "deduct_coins_or_package", insufficient: "show_boost_package" },
        copy: { free: "{price} 金币 Boost（8 折）", paid: "Boost 曝光 30 分钟" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "礼物解锁，30-699 金币",
        paymentModel: "coin_consumption",
        triggerScene: "点击礼物图标弹出金币消耗确认",
        limits: { min_coin: 30, max_coin: 699 },
        permissions: { free: "coin_consumption", paid: "coin_consumption" },
        actions: { send: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "{price} 金币发送礼物", paid: "{price} 金币发送礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "基础资料免费，补充项可单独购买",
        paymentModel: "one_time_package",
        triggerScene: "点击补充资料项弹出套餐引导",
        limits: { free_fields: ["photo", "name", "age", "bio"], paid_fields: ["voice_intro", "video_intro", "detailed_background"] },
        permissions: { free: "basic_profile", paid: "enhanced_profile" },
        actions: { click_enhance: "show_enhance_package" },
        copy: { free: "基础资料免费 · 补充资料套餐", paid: "完整资料展示" }
      }
    }
  },

  subscriber: {
    name: "订阅用户",
    description: "当前为 Premium 订阅生效中",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "无限滑卡（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "无限制，不触发",
        limits: { free: "unlimited", paid: "unlimited" },
        permissions: { free: "unlimited", paid: "unlimited" },
        actions: { exceed: null },
        copy: { free: "无限滑卡 · 已订阅", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "无限 Like（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "无限制，不触发",
        limits: { free: "unlimited", paid: "unlimited" },
        permissions: { free: "unlimited", paid: "unlimited" },
        actions: { exceed: null },
        copy: { free: "无限 Like · 已订阅", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "无限消息（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "无限制，不触发",
        limits: { free: "unlimited", paid: "unlimited" },
        permissions: { free: "unlimited", paid: "unlimited" },
        actions: { exceed: null },
        copy: { free: "无限消息 · 已订阅", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "完整查看（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "已解锁，不触发",
        limits: { free: "unlimited", paid: "unlimited" },
        permissions: { canViewLikesMe: true, free: "full_access", paid: "full_access" },
        actions: { click_blurred: null },
        copy: { free: "已解锁 · 查看全部", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "完整查看（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "已解锁，不触发",
        limits: { free: "unlimited", paid: "unlimited" },
        permissions: { free: "full_access", paid: "full_access" },
        actions: { click_locked: null },
        copy: { free: "已解锁 · 查看全部访客", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "订阅用户每月免费解锁 3 张，超出 99 金币/张",
        paymentModel: "coin_consumption",
        triggerScene: "当月免费次数用完，点击私密照片弹出金币消耗确认",
        limits: { free_monthly: 3, coin_per_unlock: 99 },
        permissions: { free: "monthly_quota_then_coin", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "本月剩余 {count} 次免费 · 之后 {price} 金币", paid: "{price} 金币解锁" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "订阅用户每月免费解锁 1 个，超出 299 金币/个",
        paymentModel: "coin_consumption",
        triggerScene: "当月免费次数用完弹出金币消耗确认",
        limits: { free_monthly: 1, coin_per_unlock: 299 },
        permissions: { free: "monthly_quota_then_coin", paid: "coin_consumption" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "本月剩余 {count} 次免费 · 之后 {price} 金币", paid: "{price} 金币解锁" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "全部筛选可用（订阅权益）",
        paymentModel: "subscription",
        triggerScene: "已解锁，不触发",
        limits: { free: "full_filters", paid: "full_filters" },
        permissions: { free: "advanced_filters", paid: "advanced_filters" },
        actions: { click_advanced: null },
        copy: { free: "全部筛选可用 · 已订阅", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "订阅用户每月免费 Boost 1 次，超出 199 金币/次",
        paymentModel: "one_time_package",
        triggerScene: "当月免费次数用完弹出套餐购买或金币消耗确认",
        limits: { free_monthly: 1, coin_per_boost: 199 },
        permissions: { free: "monthly_quota_then_coin", paid: "coin_or_package" },
        actions: { boost: "deduct_coins_or_package", insufficient: "show_boost_package" },
        copy: { free: "本月剩余 {count} 次免费 Boost", paid: "Boost 曝光 30 分钟" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "订阅用户每月免费礼物 1 个，超出 30-699 金币",
        paymentModel: "coin_consumption",
        triggerScene: "当月免费礼物用完弹出金币消耗确认",
        limits: { free_monthly_gifts: 1, min_coin: 30, max_coin: 699 },
        permissions: { free: "monthly_quota_then_coin", paid: "coin_consumption" },
        actions: { send: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "本月剩余 {count} 次免费礼物 · 之后 {price} 金币", paid: "{price} 金币发送礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "全部资料项可用（订阅权益）",
        paymentModel: "one_time_package",
        triggerScene: "已解锁，不触发",
        limits: { free_fields: "all", paid_fields: "all" },
        permissions: { free: "enhanced_profile", paid: "enhanced_profile" },
        actions: { click_enhance: null },
        copy: { free: "完整资料已解锁 · 已订阅", paid: "完整资料展示" }
      }
    }
  },

  renewal_user: {
    name: "续费用户",
    description: "订阅已过期，处于续费提醒期（过期 7 天内保留部分权益）",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "续费期内保留每日 10 次滑卡，逾期回到免费用户配额",
        paymentModel: "subscription",
        triggerScene: "续费期滑卡用完或续费期结束弹出续费引导",
        limits: { renewal_grace: 10, free_after: 5 },
        permissions: { free: "grace_period", paid: "unlimited" },
        actions: { exceed: "show_renewal_paywall", grace_expired: "show_renewal_urgent" },
        copy: { free: "续费期内剩余 {count} 次 · 续费即无限", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "续费期内每日 10 次 Like",
        paymentModel: "subscription",
        triggerScene: "Like 用完或续费期结束弹出续费引导",
        limits: { renewal_grace: 10, free_after: 5 },
        permissions: { free: "grace_period", paid: "unlimited" },
        actions: { exceed: "show_renewal_paywall" },
        copy: { free: "续费期内剩余 {count} 个 Like · 续费无限", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "续费期内每日 10 条消息",
        paymentModel: "subscription",
        triggerScene: "消息用完或续费期结束弹出续费引导",
        limits: { renewal_grace: 10, free_after: 3 },
        permissions: { free: "grace_period", paid: "unlimited" },
        actions: { exceed: "show_renewal_paywall" },
        copy: { free: "续费期内剩余 {count} 条 · 续费无限", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "续费期内保留完整查看，过期后模糊",
        paymentModel: "subscription",
        triggerScene: "续费期结束后点击 Likes Me 弹出续费引导",
        limits: { free_grace_days: 7, free_after: "blurred" },
        permissions: { canViewLikesMe: false, free: "grace_period_then_blurred", paid: "full_access" },
        actions: { grace_expired: "show_renewal_paywall" },
        copy: { free: "续费期 {days} 天后锁定 · 立即续费", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "续费期内保留完整查看，过期后锁定",
        paymentModel: "subscription",
        triggerScene: "续费期结束后点击访客入口弹出续费引导",
        limits: { free_grace_days: 7, free_after: "locked" },
        permissions: { free: "grace_period_then_locked", paid: "full_access" },
        actions: { grace_expired: "show_renewal_paywall" },
        copy: { free: "续费期 {days} 天后锁定 · 立即续费", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "续费期内保留每月 3 次免费解锁，过期后 99 金币/张",
        paymentModel: "coin_consumption",
        triggerScene: "续费期结束后弹出金币消耗或续费引导",
        limits: { grace_monthly: 3, coin_after: 99 },
        permissions: { free: "grace_period_then_coin", paid: "monthly_quota_then_coin" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge_or_renewal" },
        copy: { free: "续费期内剩余 {count} 次 · 续费保留特权", paid: "本月剩余 {count} 次免费" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "续费期内保留每月 1 次免费，过期后 299 金币/个",
        paymentModel: "coin_consumption",
        triggerScene: "续费期结束后弹出金币消耗或续费引导",
        limits: { grace_monthly: 1, coin_after: 299 },
        permissions: { free: "grace_period_then_coin", paid: "monthly_quota_then_coin" },
        actions: { unlock: "deduct_coins", insufficient: "show_coin_recharge_or_renewal" },
        copy: { free: "续费期内剩余 {count} 次 · 续费保留特权", paid: "本月剩余 {count} 次免费" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "续费期内保留高级筛选，过期后仅基础筛选",
        paymentModel: "subscription",
        triggerScene: "续费期结束后点击高级筛选弹出续费引导",
        limits: { grace_period: "full_filters", free_after: "basic_only" },
        permissions: { free: "grace_period_then_basic", paid: "advanced_filters" },
        actions: { grace_expired: "show_renewal_paywall" },
        copy: { free: "续费期 {days} 天后失效 · 立即续费", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "续费期内保留每月 1 次免费 Boost，过期后 199 金币/次",
        paymentModel: "one_time_package",
        triggerScene: "续费期结束后弹出金币消耗或续费引导",
        limits: { grace_monthly: 1, coin_after: 199 },
        permissions: { free: "grace_period_then_coin", paid: "monthly_quota_then_coin" },
        actions: { boost: "deduct_coins_or_package", insufficient: "show_boost_package_or_renewal" },
        copy: { free: "续费期内剩余 {count} 次 · 续费保留", paid: "本月剩余 {count} 次免费 Boost" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "续费期内保留每月 1 次免费礼物，过期后 30-699 金币",
        paymentModel: "coin_consumption",
        triggerScene: "续费期结束后弹出金币消耗确认",
        limits: { grace_monthly_gifts: 1, coin_after: { min: 30, max: 699 } },
        permissions: { free: "grace_period_then_coin", paid: "monthly_quota_then_coin" },
        actions: { send: "deduct_coins", insufficient: "show_coin_recharge" },
        copy: { free: "续费期内剩余 {count} 次 · 续费保留", paid: "本月剩余 {count} 次免费礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "续费期内保留完整资料补充权益，过期后锁定补充项",
        paymentModel: "one_time_package",
        triggerScene: "续费期结束后点击补充资料弹出续费引导",
        limits: { grace_period: "all_fields", free_after: "basic_only" },
        permissions: { free: "grace_period_then_basic", paid: "enhanced_profile" },
        actions: { grace_expired: "show_renewal_paywall" },
        copy: { free: "续费期 {days} 天后失效 · 立即续费", paid: "完整资料展示" }
      }
    }
  },

  low_balance_user: {
    name: "金币不足用户",
    description: "当前金币余额不足以完成下一个付费动作",
    paywallPoints: {
      swipe_limit: {
        label: "滑卡次数限制",
        category: "core_interaction",
        freeStrategy: "与当前订阅/免费身份一致，金币不影响滑卡",
        paymentModel: "subscription",
        triggerScene: "滑卡次数用完弹出订阅引导（不受金币影响）",
        limits: { free: 5, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 次", paid: "无限滑卡" }
      },
      like_action: {
        label: "点击 Like 动作",
        category: "core_interaction",
        freeStrategy: "与当前 Like 配额一致，不受金币影响",
        paymentModel: "subscription",
        triggerScene: "Like 次数用完弹出订阅引导",
        limits: { free: 5, paid: "unlimited" },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall" },
        copy: { free: "今日剩余 {count} 个 Like", paid: "无限 Like" }
      },
      message_send: {
        label: "消息发送限制",
        category: "communication",
        freeStrategy: "消息限制与其他用户一致，超出可消耗金币（但余额不足）",
        paymentModel: "subscription",
        triggerScene: "消息用完尝试金币发送 → 余额不足 → 弹出金币充值引导",
        limits: { free: 3, coin_per_extra: 50 },
        permissions: { free: "limited_daily", paid: "unlimited" },
        actions: { exceed: "show_subscription_paywall", coin_insufficient: "show_coin_recharge" },
        copy: { free: "剩余 {count} 条 · 余额不足请充值", paid: "无限消息" }
      },
      likes_me: {
        label: "查看谁喜欢我",
        entitlementType: "permission",
        category: "premium_access",
        freeStrategy: "与当前身份一致，需订阅解锁",
        paymentModel: "subscription",
        triggerScene: "点击模糊卡片弹出订阅引导",
        limits: { free: "blurred_preview", paid: "full_access" },
        permissions: { canViewLikesMe: false, free: "blurred", paid: "full_access" },
        actions: { click_blurred: "show_subscription_paywall" },
        copy: { free: "订阅查看谁喜欢了你", paid: "查看全部喜欢你的人" }
      },
      visitor_view: {
        label: "查看访客",
        category: "premium_access",
        freeStrategy: "锁定，需订阅",
        paymentModel: "subscription",
        triggerScene: "点击访客入口弹出订阅引导",
        limits: { free: 0, paid: "unlimited" },
        permissions: { free: "locked", paid: "full_access" },
        actions: { click_locked: "show_subscription_paywall" },
        copy: { free: "订阅查看谁访问了你", paid: "查看全部访客" }
      },
      private_photo: {
        label: "私密照片",
        category: "coin_consumption",
        freeStrategy: "锁定，99 金币/张，但余额不足直接弹出充值引导",
        paymentModel: "coin_consumption",
        triggerScene: "点击锁定照片 → 检测余额不足 → 弹出金币充值引导（跳过消耗确认）",
        limits: { free: 0, coin_per_unlock: 99 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { unlock: "check_balance_then_deduct", insufficient: "show_coin_recharge_direct" },
        copy: { free: "余额不足 · 充值 {price} 金币解锁", paid: "{price} 金币解锁" }
      },
      private_video: {
        label: "私密视频",
        category: "coin_consumption",
        freeStrategy: "锁定，299 金币/个，余额不足直接弹出充值引导",
        paymentModel: "coin_consumption",
        triggerScene: "点击私密视频 → 余额不足 → 弹出充值引导",
        limits: { free: 0, coin_per_unlock: 299 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { unlock: "check_balance_then_deduct", insufficient: "show_coin_recharge_direct" },
        copy: { free: "余额不足 · 充值 {price} 金币解锁", paid: "{price} 金币解锁" }
      },
      advanced_filter: {
        label: "高级筛选",
        category: "premium_access",
        freeStrategy: "需订阅解锁，不受金币影响",
        paymentModel: "subscription",
        triggerScene: "点击高级筛选弹出订阅引导",
        limits: { free: "basic_only", paid: "full_filters" },
        permissions: { free: "basic_filters", paid: "advanced_filters" },
        actions: { click_advanced: "show_subscription_paywall" },
        copy: { free: "订阅解锁高级筛选", paid: "全部筛选可用" }
      },
      boost_exposure: {
        label: "Boost 加速曝光",
        category: "one_time_consumption",
        freeStrategy: "锁定，199 金币/次，余额不足直接弹出充值引导",
        paymentModel: "one_time_package",
        triggerScene: "点击 Boost → 余额不足 → 弹出套餐购买或充值引导",
        limits: { free: 0, coin_per_boost: 199 },
        permissions: { free: "locked", paid: "coin_or_package" },
        actions: { boost: "check_balance_then_deduct", insufficient: "show_coin_recharge_or_package" },
        copy: { free: "余额不足 · 充值后 Boost", paid: "Boost 曝光 30 分钟" }
      },
      paid_gift: {
        label: "付费礼物",
        category: "coin_consumption",
        freeStrategy: "锁定，30-699 金币，余额不足直接弹出充值引导",
        paymentModel: "coin_consumption",
        triggerScene: "点击礼物 → 余额不足 → 弹出充值引导",
        limits: { min_coin: 30, max_coin: 699 },
        permissions: { free: "locked", paid: "coin_consumption" },
        actions: { send: "check_balance_then_deduct", insufficient: "show_coin_recharge_direct" },
        copy: { free: "余额不足 · 充值后发送礼物", paid: "{price} 金币发送礼物" }
      },
      profile_enhance: {
        label: "个人资料补充",
        category: "one_time_consumption",
        freeStrategy: "基础资料免费，补充项需购买套餐",
        paymentModel: "one_time_package",
        triggerScene: "点击补充资料弹出套餐购买引导",
        limits: { free_fields: ["photo", "name", "age", "bio"], paid_fields: ["voice_intro", "video_intro", "detailed_background"] },
        permissions: { free: "basic_profile", paid: "enhanced_profile" },
        actions: { click_enhance: "show_enhance_package" },
        copy: { free: "基础资料免费 · 购买补充资料套餐", paid: "完整资料展示" }
      }
    }
  }
};

var paywallPointPageMapping = {
  swipe_limit:     { applicablePages: ["discover"],                              applicableModules: ["discover_header", "discover_card", "discover_actions"] },
  like_action:     { applicablePages: ["discover", "matches"],                   applicableModules: ["discover_card", "discover_actions", "matches_chat_entry"] },
  message_send:    { applicablePages: ["chat"],                                  applicableModules: ["chat_primary", "chat_thread", "chat_paid_message"] },
  likes_me:        { applicablePages: ["likes"],                                 applicableModules: ["likes_primary"] },
  visitor_view:    { applicablePages: ["me"],                                    applicableModules: ["me_primary"] },
  private_photo:   { applicablePages: ["chat"],                                  applicableModules: ["chat_thread", "chat_private_photo_unlock", "chat_paid_message"] },
  private_video:   { applicablePages: ["chat", "profile", "me"],                 applicableModules: ["chat_thread", "profile_primary"] },
  advanced_filter: { applicablePages: ["profile", "me", "discoverSettings"], applicableModules: ["profile_primary", "me_primary"] },
  boost_exposure:  { applicablePages: ["profile", "me"],                       applicableModules: ["profile_primary", "me_primary"] },
  paid_gift:       { applicablePages: ["chat", "profile", "me"],                 applicableModules: ["chat_thread", "profile_primary"] },
  profile_enhance: { applicablePages: ["profile", "me"],                         applicableModules: ["profile_primary", "me_primary"] }
};
