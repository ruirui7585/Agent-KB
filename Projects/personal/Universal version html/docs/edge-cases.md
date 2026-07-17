# Edge Cases

| Scenario | Expected Behavior | Risk | Verification |
| --- | --- | --- | --- |
| 导入 HTML 前已有原型 | 二次确认覆盖 | 用户误覆盖 | 浏览器 confirm |
| 状态 JSON 非法 | 不调用原型，提示错误 | 场景无效 | 场景应用按钮 |
| 原型无 setPrototypeState | 展示友好提示 | 用户误以为失效 | 示例外 HTML |
| 标注未选择场景 | 提示先选择场景 | 标注无法归属 | 标注层点击 |
| 分享版含 `</script>` | JSON 转义避免截断 | 分享页损坏 | 导出器转义 |
| localStorage 被清空 | 显示空状态 | 数据丢失 | 清空项目按钮 |
