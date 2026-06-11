function createAvatarSvg(initial, color1, color2) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + '<stop offset="0" stop-color="' + color1 + '"/>'
    + '<stop offset="1" stop-color="' + color2 + '"/>'
    + '</linearGradient></defs>'
    + '<rect width="200" height="200" fill="url(#g)"/>'
    + '<text x="100" y="100" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">'
    + initial + '</text></svg>';
  return 'data:image/svg+xml,' + svg.replace(/#/g, '%23');
}

var avatarPool = {
  u_001: {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    fallback: createAvatarSvg("L", "#8B5CF6", "#D946EF"),
    initial: "L"
  },
  u_002: {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    fallback: createAvatarSvg("M", "#06B6D4", "#3B82F6"),
    initial: "M"
  },
  u_003: {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    fallback: createAvatarSvg("N", "#F59E0B", "#EF4444"),
    initial: "N"
  },
  me: {
    src: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80",
    fallback: createAvatarSvg("R", "#10B981", "#059669"),
    initial: "R"
  }
};

var photoPool = {
  photo_001: {
    src: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&q=80",
    fallback: createAvatarSvg("P1", "#A855F7", "#7C3AED")
  },
  photo_002: {
    src: "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=80",
    fallback: createAvatarSvg("P2", "#EC4899", "#BE185D")
  }
};

function getAvatar(userId) {
  return avatarPool[userId] || { src: "", fallback: createAvatarSvg("?", "#A1A1AA", "#71717A"), initial: "?" };
}

function getPhoto(photoId) {
  return photoPool[photoId] || { src: "", fallback: createAvatarSvg("?", "#A1A1AA", "#71717A"), initial: "?" };
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
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    bio: "Coffee, beach walks, and late night conversations.",
    interests: ["Travel", "Coffee", "Music"],
    likedMe: true,
    matched: false
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
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    bio: "Looking for someone kind, funny, and honest.",
    interests: ["Fashion", "Movies", "Food"],
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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    bio: "Art, books, and meaningful talks.",
    interests: ["Art", "Books", "Design"],
    likedMe: true,
    matched: false
  }
];

const likedByMeUsers = [mockUsers[1], mockUsers[2]];

const likesMeUsers = [mockUsers[0], mockUsers[2]];

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
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
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
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
    initial: "S",
    status: "Waiting for your first message",
    action: "Chat"
  },
  {
    id: "legacy_match_006",
    name: "Hala",
    age: 24,
    avatar: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=80",
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
    lastMessage: "That sounds sweet. I like respectful men.",
    time: "5:25",
    unreadCount: 1,
    locked: false,
    online: true
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
    id: "coin_7000",
    coins: 7000,
    price: "$4.99",
    tag: "Popular"
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
  }
];

const photoUnlockItems = [
  {
    id: "photo_001",
    userId: "u_001",
    image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&q=80",
    locked: true,
    price: 99
  },
  {
    id: "photo_002",
    userId: "u_001",
    image: "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=80",
    locked: true,
    price: 199
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
    description: "Chat list, paid message, and chat paywall entry.",
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
          business: "付费聊天是 Match 后的金币变现点。",
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
