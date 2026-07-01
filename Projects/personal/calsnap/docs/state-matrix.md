# CalSnap State Matrix

| State Key | Meaning | Values | Default | Affected UI | Trigger |
|---|---|---|---|---|---|
| `cameraState.file` | 当前待识别图片 | `File/null` | `null` | 拍照预览 | 拍照或选择相册 |
| `cameraState.mode` | 热量计算方式 | photo/weight | photo | 记录饮食页模式卡片 | 用户二选一 |
| `cameraState.manualFoods` | 手动食物与实际克重 | 1–10 项 | 1 个空项 | 克重输入表单 | 添加、删除或编辑食物 |
| `cameraState.result` | 百练计算结果 | analysis object/null | `null` | 结果卡片 | 图片识别或克重计算成功 |
| `cameraState.mealType` | 当前餐别 | breakfast/lunch/dinner/snack | breakfast | 餐别选择、保存记录 | 用户切换餐别 |
| analysis loading | 图片识别或克重计算中 | loading/success/error/cancelled | idle | 分阶段进度、错误卡片 | 发起请求/返回/取消 |
| editable foods | 用户核对后的食物列表 | 0–20 项 | AI 结果 | 名称、份量、热量、总计 | 编辑或删除 |
| record saving | 确认保存状态 | idle/saving/error/success | idle | 确认按钮、Toast | 点击确认 |
| service status | 后端连通状态 | online/offline | unknown | 设置页状态 | 健康检查 |
| `exerciseState.type` | 当前运动类型 | walking/running/cycling/strength/swimming/yoga/other | walking | 运动类型宫格、估算 | 用户选择 |
| `exerciseState.intensity` | 运动强度 | light/moderate/high | moderate | 分段控件、估算 | 用户选择 |
| `exerciseState.duration` | 运动时长 | 10–120 分钟（接口上限 600） | 40 | 滑杆、估算 | 用户拖动 |
| `exerciseState.calories` | 运动消耗 | 1–10000 kcal | MET 估算 | 预计消耗、首页 | 自动估算/手动修正 |
| daily energy balance | 每日热量差 | intake - baseline - exercise | 0 | 首页、记录、趋势 | 饮食或运动变化 |
| `bodyProjection.fat_change` | 热量差对应的脂肪能量等价 | today/week/month kg | 0 | 首页脂肪变化卡 | 首页数据刷新 |
| `bodyProjection.body_fat` | 当前、7 天、30 天体脂率模型预估 | percentage/null | `null` | 首页体脂趋势卡 | 个人资料或热量差变化 |
| `trendMetric` | 趋势页指标 | calorie/fat/bodyFat/weight | calorie | 指标 Tab、图表、摘要、解读 | 用户切换指标 |
| `trendRange` | 趋势页时间范围 | 7/30/90/365 | 7 | 时间分段、图表数据范围 | 用户切换周/月/3个月/年 |
| historical body projection | 基于历史热量差反推的身体趋势 | weight/body-fat series | profile anchored | 体脂率、体重趋势 | 统计或资料变化 |

## 保存规则

1. 图片识别或克重计算成功均不创建饮食记录。
2. 用户至少保留一项名称非空、热量有效的食物后才能确认。
3. `POST /api/records` 成功后才跳转首页并刷新统计。
4. 原始图片不进入 SQLite，也不写入服务器磁盘。
5. 基础日常消耗按久坐系数计算，单独记录的运动额外相减，避免与活动系数重复计算。
6. 体脂率仅在性别、身高、体重、年龄完整且年龄不少于 18 岁时生成；否则展示完善资料引导。
7. 周/月预测按当天热量差线性外推，属于趋势参考，不写入用户资料或历史数据。
