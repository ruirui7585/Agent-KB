window.FEMALE_MVP_DATA = {
  staff: {
    staff_id: "staff_001",
    staff_name: "Maya Operator",
    avatar: "./assets/avatars/staff.svg",
    online_status: "Online",
    language: "English / Arabic",
    market: "MENA",
    bound_model_count: 3,
    today_conversations: 42,
    today_revenue: 386,
    pending_replies: 7
  },
  models: [
    {
      model_id: "model_001",
      display_name: "Layla",
      avatar: "./assets/avatars/model-layla.svg",
      age: 24,
      country: "UAE",
      city: "Dubai",
      bio: "Warm, stylish, and curious about travel, food, and late-night music.",
      tags: ["Warm", "Travel", "Lifestyle"],
      persona_note: {
        tone: "Soft, playful, and attentive.",
        allowed_topics: "Travel, food, music, daily mood, soft flirting.",
        blocked_topics: "Politics, explicit promises, personal payment details.",
        relationship_push: "Build comfort, then suggest private photo unlocks."
      },
      online_status: "Online",
      today_conversations: 18,
      today_revenue: 164,
      pending_replies: 3,
      content_pack: { public_photos: 8, private_photos: 12, private_videos: 3, scripts: 16 }
    },
    {
      model_id: "model_002",
      display_name: "Noor",
      avatar: "./assets/avatars/model-noor.svg",
      age: 27,
      country: "Saudi Arabia",
      city: "Riyadh",
      bio: "Calm, elegant profile with a thoughtful conversation style.",
      tags: ["Elegant", "Calm", "Premium"],
      persona_note: {
        tone: "Confident, gentle, and slightly mysterious.",
        allowed_topics: "Workday, style, culture, premium dating.",
        blocked_topics: "Real identity, off-platform contact, sensitive religion talk.",
        relationship_push: "Use exclusivity and VIP framing before private content."
      },
      online_status: "Online",
      today_conversations: 15,
      today_revenue: 172,
      pending_replies: 2,
      content_pack: { public_photos: 6, private_photos: 10, private_videos: 2, scripts: 12 }
    },
    {
      model_id: "model_003",
      display_name: "Amina",
      avatar: "./assets/avatars/model-amina.svg",
      age: 22,
      country: "Qatar",
      city: "Doha",
      bio: "Bright, friendly, and quick to turn short chats into warm replies.",
      tags: ["Friendly", "Fast Reply", "New"],
      persona_note: {
        tone: "Cheerful, direct, and supportive.",
        allowed_topics: "Weekend plans, fashion, photos, casual jokes.",
        blocked_topics: "Medical advice, financial requests, meeting guarantees.",
        relationship_push: "Ask simple questions, then invite a call when interest is high."
      },
      online_status: "Offline",
      today_conversations: 9,
      today_revenue: 50,
      pending_replies: 2,
      content_pack: { public_photos: 5, private_photos: 7, private_videos: 1, scripts: 9 }
    }
  ],
  maleUsers: [
    {
      male_user_id: "male_001",
      nickname: "Omar",
      avatar: "./assets/avatars/male-omar.svg",
      country: "UAE",
      payment_status: "Free",
      free_messages_left: 2,
      total_spend: 0,
      has_private_unlock: false,
      has_call_history: false,
      last_active_time: "2 min ago"
    },
    {
      male_user_id: "male_002",
      nickname: "Karim",
      avatar: "./assets/avatars/male-karim.svg",
      country: "Kuwait",
      payment_status: "Paid",
      free_messages_left: 0,
      total_spend: 48,
      has_private_unlock: true,
      has_call_history: false,
      last_active_time: "9 min ago"
    },
    {
      male_user_id: "male_003",
      nickname: "Fahad",
      avatar: "./assets/avatars/male-fahad.svg",
      country: "Saudi Arabia",
      payment_status: "VIP",
      free_messages_left: 0,
      total_spend: 210,
      has_private_unlock: true,
      has_call_history: true,
      last_active_time: "18 min ago"
    }
  ],
  conversations: [
    {
      conversation_id: "conv_001",
      male_user_id: "male_001",
      model_id: "model_001",
      staff_id: "staff_001",
      last_message: "Can I see another photo?",
      last_message_time: "14:22",
      unread_count: 2,
      reply_waiting_time: "6 min",
      suggested_action: "Send public photo, then suggest private unlock.",
      conversation_stage: "Paywall Near"
    },
    {
      conversation_id: "conv_002",
      male_user_id: "male_002",
      model_id: "model_002",
      staff_id: "staff_001",
      last_message: "That was sweet. What are you doing now?",
      last_message_time: "14:12",
      unread_count: 1,
      reply_waiting_time: "16 min",
      suggested_action: "Use warm quick reply and offer private video.",
      conversation_stage: "Paid"
    },
    {
      conversation_id: "conv_003",
      male_user_id: "male_003",
      model_id: "model_003",
      staff_id: "staff_001",
      last_message: "Call later?",
      last_message_time: "13:58",
      unread_count: 4,
      reply_waiting_time: "28 min",
      suggested_action: "Send call invite before timeout.",
      conversation_stage: "Timeout"
    }
  ],
  contents: [
    {
      content_id: "content_001",
      model_id: "model_001",
      content_type: "Public Photo",
      thumbnail: "Public Photo",
      content_url: "./assets/images/layla-public.svg",
      unlock_price: 0,
      send_status: "Ready",
      is_sent_to_current_user: false,
      conversion_tag: "Open with soft visual proof."
    },
    {
      content_id: "content_002",
      model_id: "model_001",
      content_type: "Private Photo",
      thumbnail: "Private Photo",
      content_url: "./assets/images/layla-private.svg",
      unlock_price: 12,
      send_status: "Ready",
      is_sent_to_current_user: true,
      conversion_tag: "Use when free messages are almost finished."
    },
    {
      content_id: "content_003",
      model_id: "model_002",
      content_type: "Private Video",
      thumbnail: "Private Video",
      content_url: "./assets/images/noor-video.svg",
      unlock_price: 25,
      send_status: "Ready",
      is_sent_to_current_user: false,
      conversion_tag: "Best for Paid or VIP users."
    },
    {
      content_id: "content_004",
      model_id: "model_003",
      content_type: "Script",
      thumbnail: "I was hoping you would ask me that.",
      content_url: "",
      unlock_price: 0,
      send_status: "Ready",
      is_sent_to_current_user: false,
      conversion_tag: "Warm reply for stalled chats."
    }
  ],
  messages: {
    conv_001: [
      { sender: "system", text: "Conversation assigned to Maya Operator." },
      { sender: "male", text: "Hi Layla, you look interesting." },
      { sender: "model", text: "Hi Omar, that made me smile. How is your evening?" },
      { sender: "male", text: "Can I see another photo?" }
    ],
    conv_002: [
      { sender: "male", text: "That was sweet. What are you doing now?" },
      { sender: "model", text: "Thinking about a quiet coffee and a nice conversation." }
    ],
    conv_003: [
      { sender: "male", text: "Call later?" },
      { sender: "system", text: "VIP user with call history." }
    ]
  }
};
