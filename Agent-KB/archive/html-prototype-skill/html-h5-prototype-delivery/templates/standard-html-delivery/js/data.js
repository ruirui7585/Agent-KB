(function () {
  window.ProductPrototypeData = {
    navItems: [
      { key: "home", label: "Home", icon: "⌂" },
      { key: "list", label: "List", icon: "◇" },
      { key: "messages", label: "Messages", icon: "●" },
      { key: "profile", label: "Profile", icon: "◯" }
    ],
    pages: {
      home: {
        title: "Home",
        subtitle: "Product prototype entry",
        description: "Use this page to preview the main user journey."
      },
      list: {
        title: "List",
        subtitle: "Browse and compare items",
        description: "Use this page to review list, filter, and empty states."
      },
      messages: {
        title: "Messages",
        subtitle: "Conversation entry",
        description: "Use this page to review message and notification states."
      },
      profile: {
        title: "Profile",
        subtitle: "Account and settings",
        description: "Use this page to review user profile and account states."
      }
    },
    cards: [
      {
        id: "card_01",
        title: "Primary Journey",
        body: "Replace this mock card with the product's key entry module.",
        tag: "Core"
      },
      {
        id: "card_02",
        title: "State Example",
        body: "Use states to demonstrate loading, empty, locked, and success behavior.",
        tag: "State"
      }
    ],
    annotations: {
      home: {
        pageName: "Home",
        scenarioName: "Overview",
        notes: {
          business: "Describe the business purpose of this page.",
          interaction: "Describe primary user actions and navigation.",
          state: "Describe key states and state transitions.",
          acceptance: "Describe the acceptance criteria for handoff."
        }
      },
      list: {
        pageName: "List",
        scenarioName: "Browse",
        notes: {
          business: "Describe how list content supports the user task.",
          interaction: "Describe filtering, sorting, selection, and pagination.",
          state: "Describe loading, empty, and permission states.",
          acceptance: "Describe expected behavior under normal and edge cases."
        }
      },
      messages: {
        pageName: "Messages",
        scenarioName: "Conversation",
        notes: {
          business: "Describe communication or notification value.",
          interaction: "Describe send, receive, unread, and error interactions.",
          state: "Describe limits, disabled states, and success states.",
          acceptance: "Describe how reviewers should verify the flow."
        }
      },
      profile: {
        pageName: "Profile",
        scenarioName: "Account",
        notes: {
          business: "Describe user identity, account, and settings purpose.",
          interaction: "Describe account entry actions and secondary pages.",
          state: "Describe account status, permission, and edit states.",
          acceptance: "Describe profile page handoff criteria."
        }
      }
    }
  };
})();
