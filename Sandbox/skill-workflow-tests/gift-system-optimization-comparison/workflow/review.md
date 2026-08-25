# Laka 礼物系统配置优化：Sandbox Review

## Review Scope

本 review 仅覆盖当前 workflow 目录内的 Sandbox 草稿：`route.json`、`tickets.md`、`SPEC.md`、`prototype/index.html`、`prototype/announcement.html`、`../common/input.md`。未读取 `../baseline`。未修改 HTML、Axhub 或 SPEC 文件。

## Evidence Status

| Evidence type | Status | 内容 |
| --- | --- | --- |
| Verified | 已验证 | 必读文件可读取；`SPEC.md` 为 307 行，后台原型 155 行，公告原型 70 行；`prototype/axhub/` 支持文件存在；两个 HTML 均已在本地浏览器加载，控制台无 error/warn；后台导航与玩法弹窗、公告切换与房间跳转 Toast 已通过。 |
| Static-only | 已静态检查 | 文档规则、表格字段、页面导航、modal 模板、事件名、前端公告结构、脚本入口与相对资源引用。 |
| Not-run | 未运行 | 未执行完整按钮回归、RTL/阿语长文本、移动端截图对比、HTML validator、build 或自动化测试。 |

## Axis 1: Requirement Coverage

**Pass with non-blockers.**

Verified/static-only coverage:

- `SPEC.md` 覆盖保留礼物资源库、Tab、面板投放、角标素材库、单一主玩法、玩法附加条件、Banner、前台公告、字段、埋点、迁移和验收。
- 后台原型包含礼物资源配置（已有）、礼物 Tab 配置、礼物面板配置、礼物角标配置、礼物玩法配置、礼物说明 Banner 配置。
- 公告原型覆盖礼物赠送公告和 Lucky 中奖公告，并提供 view switcher 与 room jump toast。
- 全服礼物使用“单次赠送金额 >= N Coins”，Lucky 使用“中奖金额 >= N Coins”的产品口径已在 SPEC 和后台原型中出现。
- `gift_announcement_generated`、`gift_announcement_dropped`、`gift_announcement_impression`、`gift_announcement_click`、`gift_banner_click` 已定义。

Non-blockers:

- `SPEC.md` 的待确认问题未显式列出“礼物详情媒体支持”，但 `route.json` 和 `../common/input.md` 要求保留该 TBD。
- 公告原型主要呈现线框和字段，不覆盖过期、重复、图片失败、长文案等状态的可交互演示。
- 模板 Banner 与定制 Banner 的最终资产限制仍是 TBD，不能进入生产验收。

Blockers:

- 无 Sandbox draft blocker。生产 blocker 是所有 Explicit TBD 未关闭。

## Axis 2: Product / UI Coherence

**Pass with non-blockers.**

Verified/static-only coherence:

- IA 与产品边界一致：资源库只读引用，面板管投放，玩法管主玩法/附加条件/角标/Banner 关联，Banner 页管说明内容。
- 后台没有独立“全服公告配置”导航项；公告能力被放在玩法配置和系统固定处理说明中。
- 玩法配置 modal 根据玩法类型切换 global/lucky 金额条件，其他玩法隐藏对应条件，符合“附加条件随玩法联动”。
- Banner modal 将“绑定礼物”调整为只读回显，符合“绑定关系在玩法配置维护”的边界。
- 前端公告放在语音房顶部 safe area，不挤压房间主体结构；礼物赠送和 Lucky 中奖有独立视觉形态。

Non-blockers:

- 后台原型为黑白线框，不能验证最终 Laka UI 视觉规范、颜色、图标、间距和组件可用性。
- 公告原型的 Lucky 文案为线框演示句式，和 SPEC 中 `{winner} won {win_amount} Coins from {gift}` 的模板口径不完全一致，需要后续统一 copy。
- 阿语 RTL 只在需求中定义，未在原型中实际呈现。

Blockers:

- 无 Sandbox draft blocker。

## Axis 3: Engineering Feasibility

**Pass with non-blockers.**

Verified/static-only feasibility:

- 数据模型边界清晰：`primary_play_type`、`global_min_send_amount`、`lucky_min_win_amount`、`badge_codes`、`is_banner_linked`、`banner_id` 足以支撑核心后台配置。
- 公告事件字段包含 `event_id`、`event_type`、`region_code`、用户、礼物、房间、模板变量、创建与过期时间，能支撑客户端队列、去重和曝光。
- 迁移方案包含旧分组到 Tab、旧类型到玩法、角标去重、公告门槛迁移、删除独立公告入口、灰度对比和旧读回退。
- 原型使用相对 Axhub 资源路径，当前静态文件清单显示所引用的 Axhub 文件存在。

Non-blockers:

- 已验证两个 HTML 可加载且控制台无 error/warn；后台导航、玩法弹窗、公告切换和 room-jump toast 可点击。
- 尚未完整验证所有 modal、play type switching、Badge 多选、Banner association 与所有 Toast。
- 缓存刷新、灰度对比、回滚和监控只是产品/工程口径，尚未拆到接口、任务或发布脚本级别。
- 事件去重、频控、过期、风控、异常兜底由固定代码策略承接，但没有生产参数、SLO 或报警阈值。

Blockers:

- 无 Sandbox draft blocker。生产 blocker 是接口契约、运行验证、灰度监控和回滚演练未完成。

## Axis 4: Evidence Quality

**Fail for production, pass for Sandbox draft.**

Verified:

- 已读取指定 workflow 输入与 `../common/input.md`。
- 已静态确认 source/reuse/gate 约束：Sandbox-only、禁止读取 `../baseline`、不得编辑源需求或 HTML、保留 TBD。
- 已静态确认两个 HTML 文件存在且核心页面/事件结构可见。
- 已通过本地浏览器验证两个 HTML page-load，控制台无 error/warn。
- 已验证后台导航到玩法配置、打开玩法 modal、公告切换至 Lucky 场景与 room-jump Toast。

Static-only:

- `rg` 检查确认 `SPEC.md` 中明确“不新增独立全服公告配置页面”，后台导航未出现独立全服公告页面。
- `rg` 检查确认后台页面和 modal 入口覆盖 Tab、placement、badge、play、banner。
- `wc -l` 确认当前工作流输入规模，作为 review 来源完整性证据。

Not-run:

- 未执行全部按钮和全部状态的完整回归。
- 未执行移动端截图对比或 RTL/阿语长文本检查。
- 未执行 HTML validator、JS lint、build 或 automated tests。

Blockers:

- 对生产发布而言，证据质量仍不足：已有基础 runtime、console 和部分交互证据，但没有完整视觉、RTL、状态矩阵和自动化回归。

Non-blockers:

- 对本次 Sandbox draft 而言，静态证据足以支持“可评审草稿”结论，因为用户明确禁止编辑 HTML/SPEC，且本轮目标是生成 `product-analysis.md` 与 `review.md`。

## Final Conclusion

Sandbox draft: **PASS**.

Production readiness: **FAIL** until TBDs are closed and runtime evidence is collected.

Required next validation before production or stakeholder sign-off:

- Complete main click-path regression: all modal open/close, play type switching, badge multi-select, Banner association, and all Toast states.
- Mobile viewport screenshot check for announcement safe-area placement.
- English/Arabic and RTL long-text checks.
- Engineering review of API contract, cache invalidation, gray release comparison, rollback, monitoring, and event deduplication.
