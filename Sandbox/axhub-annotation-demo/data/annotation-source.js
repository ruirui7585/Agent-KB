window.AXHUB_DEMO_SOURCE = {
  documentVersion: 1,
  format: "axhub-annotation-source",
  data: {
    version: 2,
    prototypeName: "atelier-product-demo",
    pageId: "product",
    updatedAt: 1784246400000,
    nodes: [
      {
        id: "product-gallery",
        index: 1,
        title: "商品视觉区",
        pageId: "product",
        locator: { selectors: ['[data-annotation-id="product-gallery"]'], fingerprint: "div|product-gallery", path: [] },
        aiPrompt: "解释商品主视觉区域的产品目标。",
        annotationText: "首屏承担产品质感表达；真实项目中可替换为图片轮播，并保留当前页码反馈。",
        hasMarkdown: false,
        color: "#C96E48",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "product-title",
        index: 2,
        title: "商品核心信息",
        pageId: "product",
        locator: { selectors: ['[data-annotation-id="product-title"]'], fingerprint: "h1|product-title", path: [] },
        aiPrompt: "说明商品标题和价格区的信息层级。",
        annotationText: "",
        hasMarkdown: true,
        color: "#5D7A6F",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "finish-picker",
        index: 3,
        title: "材质选择",
        pageId: "product",
        locator: { selectors: ['[data-annotation-id="finish-picker"]'], fingerprint: "fieldset|finish-picker", path: [] },
        aiPrompt: "说明材质选项的交互规则。",
        annotationText: "选择颜色后立即更新名称与选中态；始终保持单选，默认选择 Chalk。",
        hasMarkdown: false,
        color: "#D5A53D",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "add-to-bag",
        index: 4,
        title: "加入购物袋",
        pageId: "product",
        locator: { selectors: ['[data-annotation-id="add-to-bag"]'], fingerprint: "button|add-to-bag", path: [] },
        aiPrompt: "说明主操作按钮行为。",
        annotationText: "点击后购物袋数量增加，并显示轻量成功反馈；演示中按钮文字会短暂变为 Added。",
        hasMarkdown: false,
        color: "#B3504B",
        images: [],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      },
      {
        id: "delivery-card",
        index: 5,
        title: "订单进度状态",
        pageId: "delivery",
        locator: { selectors: ['[data-annotation-id="delivery-card"]'], fingerprint: "div|delivery-card", path: [] },
        aiPrompt: "演示 Axhub controls 如何驱动宿主页面状态。",
        annotationText: "在 Marker 面板中切换订单状态，卡片标题、说明、图标和进度条会同步变化。",
        hasMarkdown: false,
        color: "#5D7A6F",
        images: [],
        controls: [
          {
            type: "segmented",
            attributeId: "delivery_state",
            displayName: "订单状态",
            initialValue: "confirmed",
            options: [
              { label: "已确认", value: "confirmed" },
              { label: "运输中", value: "shipped" },
              { label: "异常", value: "exception" }
            ]
          }
        ],
        createdAt: 1784246400000,
        updatedAt: 1784246400000
      }
    ]
  },
  markdownMap: {
    "product-title": "# 商品信息层级\n\n标题用于快速识别商品，副标题补充材质与颜色，价格与税费说明保持在同一视觉组。\n\n## 验收标准\n\n- 标题在桌面端不超过两行\n- 价格必须和税费口径同时出现\n- 商品选项变化不改写基础标题"
  },
  assetMap: {},
  directory: {
    nodes: [
      {
        type: "folder",
        id: "demo-pages",
        title: "Atelier 商店演示",
        defaultExpanded: true,
        children: [
          { type: "route", id: "route-product", title: "商品详情", route: "product" },
          { type: "route", id: "route-delivery", title: "配送状态", route: "delivery" },
          {
            type: "markdown",
            id: "demo-guide",
            title: "如何体验",
            markdown: "# 如何体验\n\n1. 点击页面数字 Marker 查看标注。\n2. 打开配送状态页面。\n3. 点击订单状态 Marker，在面板里切换状态控件。\n4. 使用右侧工具栏的颜色筛选与主题切换。"
          },
          {
            type: "markdown",
            id: "demo-boundary",
            title: "能力边界",
            markdown: "# 能力边界\n\n本演示使用 `@axhub/annotation` 原生 browser runtime。它负责读取已有 JSON 并展示标注，不负责在页面里编辑或回写标注。"
          },
          { type: "link", id: "package-docs", title: "NPM 包说明", href: "https://www.npmjs.com/package/@axhub/annotation", target: "blank" }
        ]
      }
    ]
  }
};
