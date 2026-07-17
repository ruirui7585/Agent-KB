# Tracking

本地 MVP 未接入真实埋点。建议后续接入时至少覆盖：

| Event | Trigger | Params | Page | Notes |
| --- | --- | --- | --- | --- |
| html_imported | HTML 导入成功 | file_name, size | workspace | 不上传原文件内容 |
| project_saved | 点击保存项目 | project_id | workspace | 本地保存成功后触发 |
| scene_selected | 点击场景 | feature_id, scene_id, entry_type | workspace | 用于分析常用场景 |
| annotation_created | 新增标注 | scene_id, x_percent, y_percent | workspace | 不记录详细业务内容 |
| share_exported | 导出分享版 | project_id, scene_count, annotation_count | workspace | 评估分享能力使用 |
