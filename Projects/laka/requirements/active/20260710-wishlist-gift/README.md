# 心愿单礼物（Wishlist Gift）

## 需求信息

- 需求名称：心愿单礼物（Wishlist Gift）
- 创建日期：2026-07-10
- 当前版本：v0.2
- 需求类型：商业化 / 一对一私聊打赏 / 运营后台配置
- 关联业务模块：1v1 IM 聊天、礼物面板、个人心愿单、运营管理后台
- 关联页面：IM Chat（送礼方与接收方聊天页）、个人心愿单管理页、心愿单礼物运营后台
- UI 基线来源：`ui/screens/im-chat/baseline.html`、`ui/screens/im-chat/reference.png` 及 `assets/` 竞品参考图
- 当前有效 PRD：后台逻辑与字段文档位于 `docs/product_logic_wish_gift_admin.md`、`docs/field_definitions_wish_gift_admin.md`、`docs/adversarial_review_wish_gift.md`（待合并为统一 `PRD.md`）
- 当前有效 UI 交付物：
  - 单页聊天卡片入口：`index.html`（样式 `css/style.css`、逻辑 `js/app.js`）
  - 完整全链路原型：`prototype/index.html`
  - 接收方心愿管理页：`prototype/my_wish_gifts.html`
  - 运营后台页面：`prototype/admin_wish_gift.html`
- 文档状态：Draft
- 产品状态：Proposed
- 最近更新时间：2026-11-18

## 目录结构

```text
20260710-wishlist-gift/
├── README.md                  # 需求说明与目录索引
├── index.html                 # 1v1 聊天资料卡心愿礼物入口原型
├── css/
│   └── style.css              # 入口原型样式
├── js/
│   └── app.js                 # 入口原型交互与轮播逻辑
├── prototype/
│   ├── index.html             # 送礼方/接收方完整链路画板原型
│   ├── my_wish_gifts.html     # 接收方心愿单配置与管理页
│   └── admin_wish_gift.html   # 运营后台心愿单礼物管理页
├── docs/
│   ├── product_logic_wish_gift_admin.md     # 后台产品逻辑说明
│   ├── field_definitions_wish_gift_admin.md # 后台字段定义表
│   └── adversarial_review_wish_gift.md      # 边界与异常对抗审查记录
└── assets/                    # 头像、参考截图及后台渲染参考
```

## 待解决问题

- 普通礼物面板赠送是否计入心愿进度与后台统计口径统一（避免完成率 > 100%）。
- 每日清零的时区基准、跨日订单、异步结算及退款日期归属口径确认。
- 前台与后台规则合并输出为统一 `PRD.md`。
