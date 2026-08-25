# Skill 优化完整上下文

> 整理自 Claude Code 对话，供 Codex 读取后理解全部背景和决策。

---

## 一、问题起点

### 1.1 用户的核心痛症

- **现有 Skill 执行质量不够**：原型交付不对，需求存在边界情况未处理，产品逻辑有漏洞或互斥
- **Skill 堆积**：多个碎片化 Skill 导致执行速度慢，浪费 token，没达到预期效果
- **HTML 效果未达标**：现在的 HTML 只是原型的集合，缺少标注、自动标注、手动标注、版本追溯等功能
- **标注质量差**：Agent 自动标注的信息不全面，没有站在产品角色去输出需求标注说明，开发看了无法理解；标注排版也有问题（用户后续单独说）

### 1.2 用户对 Codex 的期望

- 原型交付正确
- 需求边界完整处理
- 产品逻辑无漏洞、无互斥
- HTML 不只是原型集合，要成为完整的产品文档
- 标注要站在产品角色视角，开发能看懂

---

## 二、角色分工模型

### 2.1 GPT Chat 负责

- 理解业务背景、用户问题和目标
- 帮助用户建立产品判断
- 从第一性原理判断需求是否值得做
- 分析用户行为、产品机制和商业价值
- 比较方案并说明推荐与放弃原因
- 主动发现需求边界、规则冲突和产品逻辑漏洞
- 补齐状态、权限、异常、时间、数据和存量处理规则
- 输出并自审 **Feature Contract**
- 输出可直接交给 Codex 的 **Codex 执行包**
- 每轮输出末尾附带 2-3 个引导性继续话题

### 2.2 Codex 负责

在同一工作环境内闭环完成：

```
读取项目 → 理解回显 → 修改计划 → 增量实现 → 本地预览
→ 契约一致性审查 → 状态、交互、视觉和回归测试
→ 自动修复明确偏差 → 重新验证 → 生成最终 delivery.html
```

### 2.3 用户负责

- 关键产品决策
- 不承担跨工具搬运信息
- 不在 ChatGPT 和 Codex 之间反复传递修复指令

### 2.4 关键边界

- GPT 不生成 HTML 原型，不维护本地项目，不默认重新介入审查
- Codex 不重新探索需求，不擅自修改 Feature Contract，不自定关键业务规则
- 用户不在两个工具间搬运信息

---

## 三、Skill 架构演变

### 3.1 从 5 个到 4 个

最初规划的 5 个 Skill：

```
pm-delivery-workflow → contract-review → ui-html-build → implementation-review → delivery-html
```

**contract-review 被合并**进 pm-delivery-workflow 第一步。原因：

- 检查逻辑只有 4 个维度（项目定位、修改范围、规则可执行、冲突检测）
- 编排 Skill 天然需要读 Contract 和执行包，上下文都在
- 不需要另起一个 Skill 传递，减少 token 开销

最终 4 个 Skill：

```
pm-delivery-workflow → ui-html-build → implementation-review → delivery-html
```

### 3.2 Skill 存放路径

**正确路径**: `/Users/shilv/Agent-Workspace/Agent-KB/skills/`

这是共享知识库，所有 agent 都能读取。旧路径 `~/.codex/skills/` 是个错误（我当时擅自写入了，用户随后纠正）。

### 3.3 与旧 Skill 的关系

新 4 个 Skill 替换了之前碎片化的体系：

| 新 | 旧（可归档） |
|---|---|
| pm-delivery-workflow | run-product-workflow |
| ui-html-build | html-prototype-skill, product-prd-writer |
| implementation-review | — |
| delivery-html | — |
| — | prototype-agent-annotation（保留作为标注 runtime） |
| — | mena-social-pm（不再引用） |

---

## 四、pm-delivery-workflow 详情

### 4.1 定位

轻量级流程编排器。只负责路由执行路径、调用专项 Skill、控制修复闭环。**不重复定义子 Skill 的检查清单**。

### 4.2 规则优先级

```
Feature Contract > 用户本轮确认 > Codex 执行包 > 项目规范 > 已有旧逻辑 > Codex 默认判断
```

已有旧逻辑在未被 Feature Contract 显式标记为废弃前，不得被覆盖。

### 4.3 第一步：Execution Readiness Check

目标：确认能不做开始做，不判断"产品应该怎么设计"。

**检查 1：项目定位** — 路径是否明确，能否定位相关页面/组件

**检查 2：修改范围明确** — 改什么、什么不变，优先通过读取现有项目自行判断

**检查 3：核心规则可执行** — 用户角色、入口、流程、权限、状态变化、验收标准。Codex 不得自行决定：谁可使用、触发条件、金额数量规则、权限范围、状态生命周期。关键规则缺失时：低风险采用最保守假设并记录，高风险暂停。

**检查 4：冲突检测** — Contract 内部规则是否冲突，是否破坏现有核心逻辑，是否影响不可修改模块

**结论输出**：Ready / Ready with Assumption / Blocked

### 4.4 第二阶段告知

每个阶段开始时必须输出告知块：

```
## 📋 [阶段名称]
**做什么**: 一句话说明
**预期产出**: 本阶段结束后用户能看到什么
```

借鉴 Ojo 工作流的设计——让用户始终知道当前进度和调用的 Skill。

### 4.5 需求等级路由

| 等级 | 路径 |
|---|---|
| L1 局部修改 | 直接编辑现有文件 → implementation-review → 修复（≤3轮）→ delivery-html（如执行包要求） |
| L2 中等功能 | ui-html-build → implementation-review → 修复（≤3轮）→ delivery-html |
| L3 复杂需求 | ui-html-build → implementation-review → 修复（≤3轮）→ delivery-html |

未标注时默认走 L2。

### 4.6 熔断机制

同一问题修复超过 3 轮仍不通过 → 暂停，报告原因和推荐方案。防止无限循环。

### 4.7 暂停条件

1. Feature Contract 内部存在无法兼容的规则
2. 必须改变已确认的产品规则
3. 必须删除核心旧功能
4. 缺少真实项目路径或关键文件
5. 同一问题经 3 轮修复仍无法解决
6. 操作可能造成不可逆的数据或项目损失

暂停时一次性输出：问题、为何不能自行决定、方案 A/B 及影响、推荐方案、一个关键决策。

---

## 五、ui-html-build 详情

### 5.1 定位

**原型构建工具**，不是真实项目开发工具。将 Feature Contract 的产品规则转换为可本地预览的 HTML 原型 + 产品标注。

### 5.2 三阶段构建流程

```
线框图确认 → 高保真静态 HTML → 按页面选择动态升级
```

每次只推进一个阶段，用户确认后进入下一阶段。**不跳步**。借鉴 Ojo 工作流的线框图先行模式。

### 5.3 阶段一：线框图

- 只展示页面骨架：区块划分、元素位置、信息层级、主按钮、导航
- 用灰色调、占位符文字、方框表示
- 标注每个区块对应的 Feature Contract 规则编号
- **不涉及**颜色、字号、圆角、图标、动效等视觉细节
- 所有计划页面必须覆盖
- 用户明确确认"线框图无误"后，进入阶段二

### 5.4 阶段二：高保真静态 HTML

**实现前确认（先输出再动手）**：

```
本次实现目标:
用户角色:
入口:
核心流程:
关键状态:
需要保持不变:

Will change:
Will not change:
Files affected:
Components reused:
Risks:
Validation method:
```

**5 个页面模板（选模板填空，不从零建）**：

| 模式 | 模板结构 |
|---|---|
| 列表页 | 搜索 + 筛选 + 列表 + 分页 + 空/加载/错误 |
| 详情页 | 头部信息 + 内容区 + 操作按钮 + 状态标签 |
| 表单页 | 字段组 + 验证规则 + 提交 + 防重提示 |
| 弹窗/Sheet | 标题 + 内容 + 主按钮 + 次按钮 + 关闭 |
| 个人/设置页 | 信息展示 + 编辑入口 + 权限条件 |

### 5.5 静态/动态决策

- **默认静态 HTML**
- 每种产品状态是独立区块（`data-annotation-id` + `data-state`），不建 JS 状态切换器
- **不需要**状态切换器（静态 HTML 每个状态就是一个独立区块/页面）
- **不需要**视图切换器（不要视觉控件）
- 只有用户明确要求动态时才做动态

### 5.6 阶段三：动态升级（可选）

列出所有页面，让用户**逐页**选择：

| 页面 | 当前状态 | 升级动态？ |
|---|---|---|
| 详情页 | 静态（3 个状态区块） | 保持静态 / 升级动态 |
| 发包弹窗 | 静态（提交中/成功/失败） | 保持静态 / 升级动态 |

规则：
- 不因一个页面动态而全改
- 动态不改变标注数据结构
- 动态不引入真实 API 或后端依赖

### 5.7 标注数据规范（本次优化的核心）

**问题**：当前 Agent 自动标注不全面，没有站在产品角色输出，开发看了无法理解。

**解决**：标注数据从 Feature Contract 派生。12 个产品字段：

| 字段 | 说明 | 来源 |
|---|---|---|
| ruleId | 对应 Feature Contract 规则编号 | Contract |
| contractSection | 对应 Contract 章节 | Contract |
| triggerCondition | 触发条件 | Contract |
| judgmentLogic | 判断逻辑 | Contract |
| expectedOutcome | 预期结果 | Contract |
| dataSource | 数据来源（用户输入/系统计算/后台配置） | Contract |
| valueConstraint | 取值约束 | Contract |
| permissionCondition | 权限条件 | Contract |
| exceptionBehavior | 异常时的表现 | Contract |
| version | 规则版本号 | 递增 |
| decisionRef | 关联决策编号（如 D-008） | 决策日志 |

**Agent 的工作是填入字段值，不是即兴创作。** 禁止"这是一个按钮"式描述。

### 5.8 标注目录语义

按产品语义组织，不按技术结构：

```
需求背景 → 用户场景 → 页面流程 → 状态矩阵 → 权限规则 → 边界处理 → 验收标准
```

不是 Page1 → Page2 → Modal1。

### 5.9 标注 UI ≠ 原型 UI

这是本次一个重要决策：

- **原型 UI**：产品页面本身，按钮、列表、弹窗、状态区块
- **标注 UI**：覆盖层，marker 标记点、右侧面板、目录导航、编辑按钮

关系：

```
原型 HTML（业务元素 + data-annotation-id 锚点）
     +
标注 Runtime（读取标注数据，渲染 marker 和面板）
     =
完整产品文档
```

**好处**：关掉标注层，原型就是纯原型；标注 Runtime 换版本不影响原型。

### 5.10 可复用资产

不需要重造：

| 来源 | 可复用内容 |
|---|---|
| `prototype-agent-annotation/` | runtime JS/CSS、annotation-server、inject-runtime、validate-anchors、schema |
| `axhub-annotation-standalone/` | browser bundle、AnnotationSourceDocument 示例、HTML 接入示例 |

### 5.11 axhub 标注面板参考

- 右侧标注面板支持**缩放**和**展开**
- marker 用稳定选择器（`data-annotation-id`），不用脆弱的位置选择器
- controls 驱动页面状态切换
- directory 结构化导航：文件夹、路由、markdown、链接
- `aiPrompt` 字段告诉 Agent 标注要说什么

---

## 六、implementation-review 详情

### 6.1 审查维度（6 个）

1. 契约实现完整性
2. 交互有效性
3. 状态覆盖
4. 旧逻辑保护
5. 视觉一致性
6. 技术健康（控制台、资源路径）

### 6.2 问题分类

| 类型 | 严重程度 | 处理 |
|---|---|---|
| 契约实现偏差 | P0 | 必须修复 |
| 状态或边界遗漏 | P0 | 必须修复 |
| 交互无效 | P0 | 必须修复 |
| 控制台阻断错误 | P0 | 必须修复 |
| 旧功能回归 | P0 | 必须修复 |
| 视觉明显偏离 | P1 | 原则上修复 |
| 标注内容不准确 | P1 | 原则上修复 |
| 契约本身冲突 | P2 | 记录，暂停时提交用户 |
| 轻微样式差异 | P2 | 可记录不修复 |

### 6.3 自动修复

以下直接修复不询问：契约明确但未实现、状态缺失、交互无效、控制台错误、资源路径错误、旧逻辑被误改、标注与 Contract 不一致、交付内容缺失。

修复原则：局部修改，不重写页面，不扩大需求范围。

---

## 七、delivery-html 详情

### 7.1 定位

将 Feature Contract、本地实现、标注、决策和验证结果打包为一个可独立打开的 HTML 交付文档。

### 7.2 结构

需求概览 → 用户场景与流程 → 页面与状态矩阵（嵌入最新截图）→ 产品规则标注 → 权限规则 → 边界与异常 → 埋点与指标 → 决策日志 → 验收结果 → 旧逻辑保护清单 → 未验证项 → 元信息

### 7.3 规则版本追溯

旧版本不删除，追加新版本，标记 `[已废弃]`：

```
FR-012 余额不足处理
├── v1.0 (2026-08-01) 弹窗引导充值 — [已废弃]
├── v1.1 (2026-08-05) 底部 Sheet + 优惠券入口 — [当前]
│   变更原因: 弹窗关闭率高 23%，决策 D-008
```

### 7.4 内部自检

- 文件独立可打开
- 内容来自最终本地实现
- 标注与 Feature Contract 一致
- 截图是本次验证的实际页面
- 无旧截图、旧规则、旧决策
- 无失效绝对路径
- 未验证项已如实披露

---

## 八、第一性原理推导的完整功能清单

（供未来参考，当前阶段不全部实现）

| 层级 | 功能 | 状态 |
|---|---|---|
| 原型 | 可交互页面 + 组件库 | 已有 |
| 标注 | 自动标注 + 手动标注面板 | 已有，需优化 |
| 状态 | 状态切换器 | 静态不需要 |
| 导出 | delivery.html | 已有 |
| **溯源** | 规则↔UI 双向绑定 | 标注数据模型已覆盖 |
| **版本** | 规则版本历史 + 旧逻辑追溯 | 已纳入 |
| **模板** | 页面模式工厂，填空式产出 | 已纳入（5 个模板） |
| **视图** | 多角色数据过滤（不做视觉切换器） | 不做 |
| **合规** | 契约一致性自动检查 | implementation-review 覆盖 |
| **决策** | 决策日志面板 | delivery-html 覆盖 |
| 搜索 | 全文搜索 | 未来 |

---

## 九、GPT 指令相关

### 9.1 GPT 输出引导话题

每轮讨论结束，输出末尾附带 2-3 个引导性继续话题：
- 必须来自当前讨论中已触及但未决定的产品边界
- 每个话题一句话说清为什么值得现在讨论
- 不能是泛泛的"还有什么需要补充"
- 格式：`📌 接下来可以讨论：- [话题] — [为什么值得现在讨论]`

借鉴 Ojo 工作流的设计。

### 9.2 Feature Contract 是唯一事实源

GPT 输出的 Feature Contract 决定"产品应该是什么"。Codex 不重新解读。

---

## 十、关键约束

### 10.1 AI 不能做的
- 重新探索或推翻已确认的产品方案
- 擅自修改 Feature Contract
- 自行猜测关键业务规则
- 生成第二套独立参考原型
- 跳过线框图直接出高保真
- 标注内容凭空创作
- 新建与当前项目平行的第二套原型

### 10.2 必须做的
- 每个阶段输出告知块
- 审查发现问题后必须修复（≤3 轮）
- 旧逻辑追加不覆盖
- 每条规则保留版本链
- 线框图阶段不引入视觉细节
- 静态默认，动态按页选择

---

## 十一、当前状态

| Skill | 路径 | 状态 |
|---|---|---|
| pm-delivery-workflow | Agent-KB/skills/pm-delivery-workflow/SKILL.md (158行) | 已确认 |
| ui-html-build | Agent-KB/skills/ui-html-build/SKILL.md (212行) | 已确认 |
| implementation-review | Agent-KB/skills/implementation-review/SKILL.md (91行) | 待 GPT 输出并审查 |
| delivery-html | Agent-KB/skills/delivery-html/SKILL.md (87行) | 待 GPT 输出并审查 |

## 十二、待处理事项

1. implementation-review — 等 GPT 产出版本后审查
2. delivery-html — 等 GPT 产出版本后审查
3. 标注排版问题 — 用户后续单独说明
4. 旧 Skill 清理 — Agent-KB 中仍有 html-prototype-skill、prd-skill、run-product-workflow 等旧 Skill 待归档
5. `.codex/skills/` 下有我误写入的旧副本，需手动删除
6. GPT 指令文件更新 — 引导话题规则待写入
