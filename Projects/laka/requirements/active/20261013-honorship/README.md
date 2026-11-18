# 荣誉中心（Your Honorship）

## 需求信息

- 需求名称：荣誉中心（Your Honorship — Medal Center & Title Center）
- 创建日期：2026-10-13
- 当前版本：v1.0
- 需求类型：用户身份荣誉 / 个人主页与语音房外显
- 关联业务模块：My（个人中心）、Your Honorship（荣誉中心）、Medal Center（勋章中心）、Title Center（称号中心）、User Profile（个人主页）、Voice Room（语音房）
- 关联页面：My、Your Honorship、Medal Center、Title Center、User Profile（主态/客态）、Voice Room（迷你资料卡与公屏消息）
- UI 基线来源：`ui/screens/user-profile/`、`ui/screens/voice-room/` 及用户提供的 My / Medal Center 截图
- 当前有效 PRD：`delivery-report.md`（含完整业务状态、迁移规则与验收说明）
- 当前有效 UI 交付物：`delivery.html`（单文件内嵌 CSS、JS 与 15 个截图素材，通过 `delivery-checks.cjs` 28/28 项自动验收）
- 文档状态：Ready for Delivery
- 产品状态：Proposed
- 最近更新时间：2026-11-18

## 目录结构

```text
20261013-honorship/
├── README.md                  # 需求说明与目录索引
├── delivery.html              # 唯一正式可交互评审原型（内嵌全部样式、脚本与图片素材）
├── delivery-report.md         # 交付说明、状态机规则与 28 项验收报告
├── delivery-checks.cjs        # Playwright 自动化验收脚本（28/28 通过）
└── assets/
    └── delivery-preview.png   # 四页面视觉审查参考图
```

## 待解决问题

- 与线上正式代码及原 Medal Center 隐藏管理流程进行最终逐项核对。
- 语音房公屏历史消息的称号快照策略与后端正式实现方案确认。
