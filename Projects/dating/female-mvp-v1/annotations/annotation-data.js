window.FEMALE_MVP_ANNOTATIONS = {
  login: {
    title: "Login",
    goal: "Simulate staff login for the female operator workspace.",
    fields: ["Female Operator mark", "Staff Account", "Password", "Demo Login"],
    interactions: ["Demo Login enters Inbox."],
    rules: ["Only staff operators use this app.", "No real authentication in MVP."]
  },
  inbox: {
    title: "Inbox",
    goal: "Aggregate conversations across bound models so staff can prioritize replies.",
    fields: ["Current staff", "Online status", "Today chats", "Today revenue", "Conversation cards"],
    interactions: ["Tap a conversation card to open Chat Detail.", "Bottom tabs switch primary pages."],
    rules: ["Inbox shows all model identities.", "Free users must show free messages left."]
  },
  chat_detail: {
    title: "Chat Detail",
    goal: "Reply as the selected model and drive content or call conversion.",
    fields: ["Male user", "Payment status", "Free messages left", "Current model", "Suggested action", "Message stream"],
    interactions: ["Back returns to Inbox.", "Quick Reply, Translate, Photo, Private, Call, and Send insert or route actions."],
    rules: ["Private content must go through Content Picker.", "Call only simulates an invitation."]
  },
  models: {
    title: "Models",
    goal: "Show all backend-configured model profiles bound to the staff operator.",
    fields: ["Bound model count", "Online model count", "Model cards"],
    interactions: ["Tap model card to open Model Detail."],
    rules: ["One staff can bind multiple models.", "Profiles are read-only for operators."]
  },
  model_detail: {
    title: "Model Detail",
    goal: "Review model profile, persona notes, content pack, and today data.",
    fields: ["Profile Preview", "Persona Notes", "Content Pack", "Today Data"],
    interactions: ["Back returns to Models."],
    rules: ["Configured by backend. Operator can view only."]
  },
  content: {
    title: "Content",
    goal: "Browse reusable public, private, video, and script assets.",
    fields: ["Content type", "Model owner", "Unlock price", "Sent status", "Recommended scenario"],
    interactions: ["Tap content card to open Content Picker / Send Preview."],
    rules: ["Content belongs to a model.", "Already sent content must be visible."]
  },
  content_picker: {
    title: "Content Picker / Send Preview",
    goal: "Confirm content before sending and avoid duplicate sends.",
    fields: ["Preview", "Content type", "Model", "Unlock price", "Already sent status", "Current conversation"],
    interactions: ["Send as Public or Private returns to Chat Detail.", "Cancel returns to source page."],
    rules: ["Warn if content was sent to current user.", "Private content is sent only after preview."]
  },
  me: {
    title: "Me",
    goal: "Show staff profile, daily summary, and work information.",
    fields: ["Staff profile", "Today summary", "Work info", "Work Status", "Logout"],
    interactions: ["Work Status opens Work Status page.", "Logout returns to Login."],
    rules: ["Me page must remain available.", "Status reflects Work Status changes."]
  },
  work_status: {
    title: "Work Status",
    goal: "Lightweight online/offline control for receiving new conversations.",
    fields: ["Current status", "Online explanation", "Offline explanation", "Switch buttons"],
    interactions: ["Switch Online and Offline update staff status.", "Back returns to Me."],
    rules: ["Offline blocks new assignment only.", "Historical chats remain visible."]
  }
};
