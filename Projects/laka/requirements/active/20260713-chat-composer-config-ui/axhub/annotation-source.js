window.LAKA_AXHUB_ANNOTATION_SOURCE = {
  documentVersion: 1,
  format: "axhub-annotation-source",
  data: {
    version: 2,
    prototypeName: "laka-chat-composer-config-ui",
    pageId: "chat",
    updatedAt: 1784246400000,
    nodes: [
      {
        id: "prototype-config",
        index: 1,
        title: "Prototype state controls",
        locator: { selectors: ['[data-annotation-id="prototype-config"]'], fingerprint: "section|prototype-config", path: [] },
        aiPrompt: "Control the active preview page, configured woman type, and call unlock status.",
        annotationText: "Use the State tab to switch the preview page, woman type, and unlock status without changing the underlying product interactions.",
        hasMarkdown: false,
        color: "#AB4DE1",
        images: [],
        controls: [
          {
            type: "segmented",
            attributeId: "preview_page",
            displayName: "Preview page",
            initialValue: "chat",
            options: [
              { label: "IM Chat", value: "chat" },
              { label: "User Profile", value: "profile" }
            ]
          },
          {
            type: "segmented",
            attributeId: "user_type",
            displayName: "User type",
            initialValue: "core",
            options: [
              { label: "Core woman", value: "core" },
              { label: "Blocked woman", value: "blocked" }
            ]
          },
          {
            type: "segmented",
            attributeId: "access_state",
            displayName: "Unlock status",
            initialValue: "locked",
            options: [
              { label: "Locked", value: "locked" },
              { label: "Unlocked", value: "unlocked" }
            ]
          }
        ],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "chat-composer",
        index: 2,
        title: "Chat composer layout",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="chat-composer"]'], fingerprint: "section|chat-composer", path: [] },
        aiPrompt: "Describe the configured chat composer layout.",
        annotationText: "Configured moves Emoji into the input and renders the lower toolbar from user type and unlock status.",
        hasMarkdown: false,
        color: "#AB4DE1",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "message-input",
        index: 3,
        title: "Message input",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="message-input"]'], fingerprint: "input|message-input", path: [] },
        aiPrompt: "Describe the message input dimensions and Emoji clearance.",
        annotationText: "The input keeps its original dimensions. Configured adds trailing padding so text does not overlap the Emoji icon.",
        hasMarkdown: false,
        color: "#5B8DEF",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-album",
        index: 4,
        title: "Album",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-album"]'], fingerprint: "button|tool-album", path: [] },
        aiPrompt: "Describe the Album toolbar placement.",
        annotationText: "Remains in its original lower-toolbar position in all configured combinations.",
        hasMarkdown: false,
        color: "#7C6FD0",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-voice",
        index: 5,
        title: "Voice",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-voice"]'], fingerprint: "button|tool-voice", path: [] },
        aiPrompt: "Describe the Voice toolbar placement.",
        annotationText: "Remains in its original lower-toolbar position in all configured combinations.",
        hasMarkdown: false,
        color: "#7C6FD0",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-gift",
        index: 6,
        title: "Gift",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-gift"]'], fingerprint: "button|tool-gift", path: [] },
        aiPrompt: "Describe the Gift toolbar emphasis.",
        annotationText: "Remains in its original lower-toolbar position and keeps the stronger pink emphasis from the current product UI.",
        hasMarkdown: false,
        color: "#F26FD7",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-emoji",
        index: 7,
        title: "Emoji",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-emoji"]'], fingerprint: "button|tool-emoji", path: [] },
        aiPrompt: "Describe the configured Emoji placement.",
        annotationText: "Configured places Emoji in the input's far-right trailing area before the Send button.",
        hasMarkdown: false,
        color: "#F26FD7",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-audio-call",
        index: 8,
        title: "Audio Call",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-audio-call"]'], fingerprint: "button|tool-audio-call", path: [] },
        aiPrompt: "Describe Audio Call visibility, lock state, and click behavior.",
        annotationText: "Core and Blocked women both show Audio Call. Locked displays the locked state; Unlocked opens the Audio call options.",
        hasMarkdown: false,
        color: "#11C99A",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "tool-video-call",
        index: 9,
        title: "Video Call",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="tool-video-call"]'], fingerprint: "button|tool-video-call", path: [] },
        aiPrompt: "Describe Video Call visibility, lock state, and click behavior.",
        annotationText: "Only Core women show Video Call. Locked displays the locked state; Unlocked opens the Video call options.",
        hasMarkdown: false,
        color: "#3F80ED",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "send-button",
        index: 10,
        title: "Send button",
        pageId: "chat",
        locator: { selectors: ['[data-spec-key="send-button"]'], fingerprint: "button|send-button", path: [] },
        aiPrompt: "Describe the Send button placement and behavior.",
        annotationText: "The Send button remains fixed at the far right. Empty submission prompts for text; a valid message clears the input.",
        hasMarkdown: false,
        color: "#AB4DE1",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "profile-call-entry",
        index: 12,
        title: "User Profile call entry",
        pageId: "profile",
        locator: { selectors: ['[data-spec-key="profile-call-entry"]'], fingerprint: "button|profile-call-entry", path: [] },
        aiPrompt: "Describe the User Profile call entry for each woman type and unlock state.",
        annotationText: "Core Locked keeps the original entry; Core Unlocked shows combined Video and Audio options. Blocked women show only Audio behavior.",
        hasMarkdown: false,
        color: "#11C99A",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "profile-video-permission",
        index: 13,
        title: "Video permission badge",
        pageId: "profile",
        locator: { selectors: ['[data-spec-key="profile-video-permission"]'], fingerprint: "button|profile-video-permission", path: [] },
        aiPrompt: "Describe the video permission badge visibility and click behavior.",
        annotationText: "Shown only for Core woman on User Profile. Tap displays Officially verified, independent of unlock status.",
        hasMarkdown: false,
        color: "#3F80ED",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      }
    ]
  },
  markdownMap: {},
  assetMap: {},
  directory: {
    nodes: [
      {
        type: "folder",
        id: "laka-config-ui",
        title: "Chat Composer Config UI",
        defaultExpanded: true,
        children: [
          { type: "route", id: "route-chat", title: "IM Chat", route: "chat" },
          { type: "route", id: "route-profile", title: "User Profile", route: "profile" },
          {
            type: "markdown",
            id: "requirement-summary",
            title: "Requirement summary",
            markdown: "# Requirement summary\n\nThis prototype reviews call-entry configuration for Core and Blocked women across IM Chat and User Profile.\n\n- Core woman: Audio and Video capability\n- Blocked woman: Audio only\n- Locked: show locked behavior\n- Unlocked: open the corresponding call options"
          },
          {
            type: "markdown",
            id: "prototype-pricing-note",
            title: "Pricing note",
            markdown: "# Prototype pricing note\n\nAll call prices displayed in this prototype are demonstration values only. They do not define production charging, earnings, settlement, or backend configuration."
          },
          {
            type: "markdown",
            id: "profile-baseline-note",
            title: "User Profile baseline",
            markdown: "# User Profile baseline\n\nThe profile uses the canonical iOS 1.4.7 other-woman baseline from M09. Only the lower-left call entry and the Core-woman video permission badge change with the configured state."
          }
        ]
      }
    ]
  }
};
