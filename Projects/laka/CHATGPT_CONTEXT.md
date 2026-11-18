# Laka ChatGPT Context Summary

> 本文件是 Laka 项目的公共上下文汇总镜像（由 `PROJECT_CONTEXT.md`、`UI_SYSTEM.md` 与 `REQUIREMENTS_INDEX.md` 同步生成），不是独立事实源。

## 1. 产品核心事实

- **产品定位**：面向海外市场（以中东 SA、IQ、JO、LB、EG 为核心）的 18+ 陌生人社交 App（支持 iOS 与 Android），主打即时文字聊天、情绪陪伴、一对一音视频与多人语音房。
- **核心角色与资产闭环**：
  - **男性用户（消费侧）**：使用国家配置的免费聊天卡破冰，耗尽后充值并消费**金币（Coins）**进行文字聊天、送礼、解锁一对一音视频及参与语音房互动。
  - **女性用户（供给侧）**：由 BD 拓展工会长招募管理，通过有效社交互动获得**钻石（Diamonds）**（基础计量 1 金币 = 1 钻石），每周可在移动端发起一次提现申请，由运营后台审核。
- **平台差异**：iOS 需先发起连接请求并获接受后建联；Android 可直接打招呼聊天。
- **核心竞品**：SUGO（第一核心竞品）、Timo。

## 2. 项目目录与内容分类

1. **全局规则与公共上下文（根目录）**：`AGENTS.md`、`PROJECT_CONTEXT.md`、`DECISIONS.md`、`REQUIREMENTS_INDEX.md`、`CHATGPT_CONTEXT.md`。
2. **活跃产品需求（`requirements/active/`）**：
   - **首页与推荐**：`20260710-for-you-news-banner`（首页 For You 关系新闻墙）
   - **礼物与打赏**：`20260710-wishlist-gift`（心愿单礼物）、`20260720-gift-system-optimization`（礼物系统配置优化）
   - **VIP 与身份荣誉**：`20260902-salfa-vip`（SALFA VIP 体系与运营后台）、`20261013-honorship`（Your Honorship 荣誉/勋章/称号中心）、`20261013-pretty-id`（Pretty ID 靓号兑换）
   - **1v1 聊天与语音房**：`20260713-chat-composer-config-ui`（聊天输入区与个人主页配置化 UI）、`20261014-salfa-room-pk`（语音房 22 屏 PK）、`20261105-room-lock`（语音房锁房功能 PRD）
3. **真实产品 UI 基线（`ui/`）**：`ui/UI_SYSTEM.md`、`ui/references/`（34 张去重真机截图）及 `ui/screens/` 下的 8 个核心页面基线（`home-for-you`、`im-chat`、`conversation-list`、`user-profile`、`voice-room`、`cp-relationship`、`private-content`、`checkout`；`guardian` 待补充）。
4. **公共视觉素材（`assets/`）**：`asset-manifest.md`、`lanhu/`（40 张蓝湖封面参考；正式切图目录待补充）。
5. **竞品监控（`agents/competitor-analysis/`）**：竞品池、产品注册表与定期监控报告。
6. **业务数据（`data/`）**：`laka-ad-daily-report-20260715.xlsx`。
7. **原型工程工作台（`make/`）**：Axhub Make（React + Vite）工程、Excalidraw 线框与主题库。

最后同步时间：2026-11-18
