# CalSnap API Fields

## 通用安全

- 百练 Key 只存在服务器环境变量，任何接口都不得返回 Key。
- 当前公网接口不要求访问码；识别接口仍受 IP 频率限制。

## `POST /api/food/analyze`

请求为 `multipart/form-data`，字段 `image` 支持 JPEG、PNG、WebP，最大 8MB。

| Field | Type | Meaning | Required |
|---|---|---|---|
| `foods` | array | 所有识别到的食物 | Yes |
| `foods[].name` | string | 中文食物名 | Yes |
| `foods[].weight_g` | integer | 估算重量 | Yes |
| `foods[].calories` | integer | 估算热量 | Yes |
| `foods[].calorie_min/max` | integer | 估算区间 | Yes |
| `foods[].protein_g/fat_g/carbs_g` | integer | 三大营养素估值 | Yes |
| `foods[].confidence` | enum | high/medium/low | Yes |
| `total_calories` | integer | 食物热量合计 | Yes |
| `description` | string | 图片简述 | No |
| `caveat` | string | 主要不确定因素 | No |

## `POST /api/food/calculate`

按用户提供的实际克重计算热量，不上传图片，也不自动保存记录。

请求 JSON：

| Field | Type | Meaning | Required |
|---|---|---|---|
| `foods` | array | 待计算食物，1–10 项 | Yes |
| `foods[].name` | string | 食物名称，最长 80 字符 | Yes |
| `foods[].weight_g` | integer | 实际可食用重量，1–5000g | Yes |

返回结构与图片识别一致，并增加 `calculation_method: "manual_weight"`。服务端保持输入名称、克重和顺序不变。

## `POST /api/records`

| Field | Type | Meaning | Required |
|---|---|---|---|
| `meal_type` | enum | breakfast/lunch/dinner/snack | Yes |
| `foods` | array | 用户核对后的食物 | Yes |
| `foods[].name` | string | 最长 80 字符 | Yes |
| `foods[].weight_g` | integer | 0–5000 建议范围 | No |
| `foods[].calories` | integer | 单项不超过 10000 | Yes |

返回 `201`，包含记录 ID、日期、时间、食物列表和总热量。

## `POST /api/exercises`

| Field | Type | Meaning | Required |
|---|---|---|---|
| `exercise_type` | enum | walking/running/cycling/strength/swimming/yoga/other | Yes |
| `duration_minutes` | integer | 1–600 分钟 | Yes |
| `intensity` | enum | light/moderate/high | Yes |
| `calories` | integer | 可编辑消耗；不传则服务端按 MET 估算 | No |
| `note` | string | 最长 160 字符 | No |

`GET /api/exercises?date=YYYY-MM-DD` 返回当天运动列表和 `total_calories`。

## 每日能量字段

`GET /api/records` 与 `GET /api/stats` 增加：

| Field | Type | Meaning |
|---|---|---|
| `baseline_expenditure` | integer | 久坐口径的基础日常消耗 |
| `baseline_expenditure_is_manual` | boolean | 是否使用用户在“我的”页填写的基础消耗 |
| `exercise_total` | integer | 当天单独记录的运动消耗 |
| `total_expenditure` | integer | 基础日常消耗 + 运动消耗 |
| `calorie_delta` | integer | 摄入 - 基础日常消耗 - 运动消耗 |

`GET /api/stats?range=` 支持 `1–365` 天；趋势页使用 `7/30/90/365`。超出范围会被限制到 365 天，非法值回退为 7 天。

## 每日目标设置

`GET /api/settings` 返回每日热量和三大营养素目标；尚未保存营养目标时使用服务端默认值。

| Field | Type | Range | Default |
|---|---|---|---|
| `daily_cal_goal` | integer | 500–10000 kcal | 使用产品热量默认值 |
| `daily_protein_goal` | integer | 20–400 g | 80 g |
| `daily_carbs_goal` | integer | 20–800 g | 180 g |
| `daily_fat_goal` | integer | 10–300 g | 45 g |

`PUT /api/settings` 支持一次提交其中任意一项或多项，成功后返回 `updated` 字段列表及本次保存的数值。

## 错误码

| HTTP | Scenario |
|---|---|
| 400 | 参数、图片类型或记录内容无效 |
| 413 | 图片超过 8MB |
| 429 | 识别请求超过限额 |
| 502 | 百练调用或结构化解析失败 |
