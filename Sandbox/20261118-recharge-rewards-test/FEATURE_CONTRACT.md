# Feature Contract｜Recharge Rewards（Sandbox 流程实测）

> **来源抓取**：Chrome Tab 40（`https://chatgpt.com/g/g-p-69ef007bc3148191a67c1ebad6be8bdd-laka/c/6af14177-08c8-83ee-8f2e-645bec2ae4e9`，标题 `充值奖励页面设计`）  
> **抓取方式**：`chrome-devtools` MCP `evaluate_script` 仅读取最后 1 条 AI 回复（`4,045` 字符，未拉取前序 11 轮对话历史）  
> **规则仲裁说明**：原 ChatGPT 总结按旧流程要求输出 `delivery.html` 与交互式脚本；按工作区最新优先级（`用户当前明确要求 > 最新流程规范 > 旧聊天文本`），本次测试以 **`Mode = wireframe-only` + 唯一入口 `index.html` + 静态黑白线框 + 完整 `PRD.md` + 7 维边界自检** 执行，产物仅写入临时验证目录 [Sandbox/20261118-recharge-rewards-test/](file:///Users/shilv/Agent-Workspace/Sandbox/20261118-recharge-rewards-test/)，不修改正式 `Projects/laka/` 文件。

---

## 1. 交付模式与目标范围

- **需求名称**：`20261118-recharge-rewards-test`（Recharge Rewards 累计充值奖励 H5）
- **产物性质**：临时测试验证文件（位于 `Sandbox/`，验完可删）
- **交付模式（Mode）**：`wireframe-only`（默认基础交付：轻量契约 → 静态黑白线框 `index.html` → 完整 `PRD.md` + 7 维边界自检；不上色、不接重型标注、不部署 Vercel）
- **视觉来源**：无高保真视觉基线，纯概念黑白线框（仅验证结构与状态）
- **界面语言**：`en`（App 前台界面遵循 Laka 规范使用英文；画板外标注与 PRD 使用中文）
- **目标视口**：`440 × 956px`（Laka 主验收视口 iPhone 17 Pro）

---

## 2. 画板白名单（Screen & State Allowlist — 硬性锁定）

> **硬规则**：`index.html` **仅绘制**下表 3 个画板；未列入的页面、弹窗、后台视图与交互流程**严禁画进原型**。

| 编号 | 页面 / 画板名称 | 角色 / 端 | 页面状态 | 仅需包含的核心元素（精准罗列） |
|---|---|---|---|---|
| S01 | `Recharge Rewards` | 充值用户 · H5 | `Monthly` 默认态 + 档位核心状态 | 顶部导航（`Back` / `Recharge Rewards` / `Rules`）、活动 Banner 线框占位（`LAKA Recharge Rewards`）、周期切换（`Daily` / `Weekly` / `Monthly` 选中）、倒计时（`Days / Hours / Min / Sec`）、动态进度条（`$1,434` / 下一档 `$3,000` / 差额 `$1,566` / `47.8%`）、档位奖励列表（呈现 `Claimed`→`Received`、`Pending Fulfillment`→联系运营提示、`Available`→`Receive`、`Locked` 四种主状态，含档位金额/图标/名称/时长）、底部固定 `Recharge Now` 按钮 |
| S02 | `Recharge Rewards` | 充值用户 · H5 | `Weekly` 满档 100% + 领取成功 Toast + 过期态演示 | 同结构导航与 Banner、`Weekly` Tab 选中、倒计时、进度条 `100% Completed`（按规则隐藏“下一档金额”与“剩余金额”）、奖励列表展示 `Claimed`（`Received`）、`Pending Fulfillment`（`Contact Ops` 提示）与 `Expired` 状态卡片、页面内静态 Toast（`You have successfully claimed the rewards!`）、底部固定 `Recharge Now` |
| S03 | `Rules` | 充值用户 · H5 | 活动规则说明页 | 顶部导航（`Back` / `Rules`）、6 条明确规则正文：`Daily / Weekly / Monthly` 说明、USD 统一计价、三周期独立统计、档位与领取状态规则、奖励有效期说明、多靓号模板仅可兑换一个（含固定英文条款 + 运营协助分配说明）；无底部 `Recharge Now` |

---

## 3. 明确禁止擅自加戏清单（Strict Non-Goals）

- **禁止新增的文件/画板**：不生成 `delivery.html`；不画 `Recharge Now` 充值收银台页；不画联系运营 IM 聊天窗口；不画靓号模板选择弹窗；不画网络异常/加载骨架屏/空列表占位页；不额外生成运营后台 HTML 视图（后台字段要求统一先落 `PRD.md` 第 6 节待 PM 确认）。
- **禁止的交互实现**：`wireframe-only` 保持纯静态黑白线框，不写 Tab 动态切换 JS、倒计时 Timer JS、模拟充值或领取状态变更 JS。
- **不可改动区域**：不触碰工作区正式目录 [Projects/laka/](file:///Users/shilv/Agent-Workspace/Projects/laka/) 下的任何文件。

---

## 4. 核心业务规则与待确认项（`TBD`）

1. **周期与累计口径**（`Confirmed`）：支持 `Daily` / `Weekly` / `Monthly`，默认打开 `Monthly`；统一按 `USD` 计算；一笔成功充值同时计入符合范围的三个周期；周期结束后按自然周期重置。
2. **进度条与档位**（`Confirmed` + 存在矛盾待查）：进度公式 `min(当前累计 / 下一档, 1) * 100%`；达到最高档后显示 100% 完成，不再展示下一档；**下一档由服务端下发，H5 不自行推算**。
   - **已识别冲突**：原总结中 `$1,434` 示例的下一档写 `$3,000`，但同时提到月充存在 `$1,500` 档位（待 `PRD.md` P0 确认）。
3. **领取与发奖**：
   - 自动发放：`Available` 点击 `Receive` → `Claimed`（`Received`）+ Toast `You have successfully claimed the rewards!`。
   - 人工发放：生成记录 → `Pending Fulfillment` → 引导联系运营（实际渠道 `TBD`）。
4. **待确认项（`TBD` — 严禁 Agent 自行脑补画进原型，已移交 `PRD.md` 第 9 节）**：
   - `TBD-01`：`Daily / Weekly / Monthly` 完整档位表及 `$1,500` 档位与 `$3,000` 示例矛盾确认；
   - `TBD-02`：活动统计时区基准（UTC vs 运营/用户时区）与跨零点订单归属；
   - `TBD-03`：上线首周期起点（建议从生效时间起算，不追溯历史）；
   - `TBD-04`：未领取奖励失效时间（建议周期结束失效）与跨周期在途订单处理；
   - `TBD-05`：多靓号模板“仅能兑换一个”的作用范围（单周期 / 跨周期 / 整场活动）及先后锁定逻辑；
   - `TBD-06`：人工发放“联系运营”具体跳转入口；
   - `TBD-07`：退款 / 支付风控冲正时的进度与已发奖励回滚口径；
   - `TBD-08`：同档位混配“自动+人工”多奖励时的状态机拆解。
