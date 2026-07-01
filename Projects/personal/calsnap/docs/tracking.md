# CalSnap Tracking

| Event | Trigger | Params | Page | Deduplication |
|---|---|---|---|---|
| `quick_add_open` | 点击底部中央加号 | `source_page` | 全局 | 每次打开 |
| `food_entry_mode_select` | 切换拍照/克重方式 | `mode` | 记录饮食 | 每次切换 |
| `food_weight_calculate` | 点击计算本餐热量 | `food_count,total_weight_g,meal_type` | 记录饮食 | 每次请求 |
| `food_calculation_success` | 图片识别或克重计算成功 | `mode,food_count,total_calories` | 记录饮食 | 按当前请求 id |
| `exercise_form_view` | 进入记录运动页 | `default_type` | 运动 | 每次进入 |
| `exercise_type_select` | 选择运动类型 | `exercise_type` | 运动 | 每次选择 |
| `exercise_save_success` | 运动保存成功 | `exercise_type,duration,intensity,calories` | 运动 | 按 exercise id |
| `energy_balance_view` | 首页热量差展示 | `date,intake,baseline,exercise,balance` | 首页 | 每日每会话一次 |
| `fat_projection_view` | 首页脂肪等价与体脂预测曝光 | `date,calorie_delta,today_fat_kg,week_fat_kg,month_fat_kg,profile_complete` | 首页 | 每日每会话一次 |
| `trend_metric_change` | 切换趋势指标 | `metric: calorie/fat/body_fat/weight,range` | 趋势 | 每次切换 |
| `trend_range_change` | 切换周/月/3个月/年 | `range: 7/30/90/365,metric` | 趋势 | 每次切换 |

统计用户范围为当前服务实例的访问设备；热量指标以自然日为时间窗。
