# foryou-newsbanner 项目长期笔记

## 项目概况
- 名称：Laka 关系新闻墙（News Wall）
- 类型：Laka 社交 App 首页关系事件聚合功能
- 目标市场：MENA（中东及北非）
- 目标设备：iPhone 16（393×852pt）
- prototypeId：`homepage-news-wall-v1`

## 文件结构
- `newsbanner.html` — 高保真原型（单页三状态：show-home / show-highlights / show-rank）+ 原型注释交付工具
- `REQUIREMENTS.md` — 需求规格文档（2026-07-07 基于 HTML 反推产出）

## 三级页面结构
1. Home 首页：状态栏 + For You 顶部栏(🏆排行榜入口，点奖杯进排行榜) + Laka News Banner(轮播，点击进 Highlights) + 用户信息流 + 底部导航
2. Laka Highlights 关系动态流：顶部导航(返回/标题/帮助) + Tab栏(All/Relationships/Gifts/Lucky) + Trending Now + 三类卡片(CP升级/奢华礼物/幸运中奖)；CP卡"View Relationship"可进排行榜
3. 关系排行榜：周期切换(Daily/Weekly/Monthly) + 倒计时 + Top3领奖台(2-1-3) + 列表 + 自己状态行

## 关系类型
- CP（💞，粉紫渐变）
- Guardian（🛡️）

## 关键技术细节
- Banner 轮播间隔 2500ms，idx 循环
- 视图栈 viewStack 支持逐级返回
- 原型注释系统是交付工具，非产品功能，正式开发需剥离
- 主色 #6237ee，标题色 #211139，背景 #f4f3f6

## 工作区规则（来自 /Users/shilv/Agent-Workspace/）
- 修改前必须声明：任务类型/目标项目/允许改文件/禁止改文件/验证方案
- 优先原地修改，不新建重复文件
- HTML 原型默认英文 UI、高保真、改完验证不白屏/无报错/主流程可点
- 用户是 PM + 代码初学者，给命令先给精确路径再解释

## 用户偏好（重要）
- **输出前必须做对抗性审查（adversarial review）**：每次交付前主动找 bug、断链、不可达页面、CSS 语法错误、交互死路、失效的旧状态类。不要只说"看起来没问题"，要真的去 grep/验证。用户原话："你自己对抗性审查现在页面是有效的? 以后给我输出前都对抗性审查下"
- 审查重点清单：① 初始视图类是否正确（避免首页被 CSS 隐藏）② 每个功能入口是否真的绑了事件（防止死页）③ CSS 是否有非法值被浏览器丢弃 ④ 旧状态类/旧元素引用是否残留导致冲突
