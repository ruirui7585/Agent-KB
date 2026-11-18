# Modal / Bottom Sheet / Toast

## Bottom Sheet

Bottom Sheet 用于：

- 收银台
- 充值
- 选择器
- 临时操作面板
- 媒体选择

同一类入口复用同一套 Sheet，不要每个页面写一套样式。

切换内部 Tab 时，Sheet 高度应保持稳定，除非用户明确要求自适应。

## Modal

Modal 用于高注意反馈，例如：

- 匹配成功
- 支付成功
- 解锁成功

不要在普通切换、普通点击、普通滑卡中滥用 Modal。

## Toast

Toast 用于轻提示：

- 已保存
- 已发送
- 金币不足
- 已上传

规则：

- 默认 3000ms 自动消失。
- 不遮挡底部 Tab 或主要按钮。
- 不拦截点击，设置 `pointer-events: none`。
- 新 toast 应清理旧 timer。

## 遮罩

Modal / Sheet 关闭后不能残留遮罩。

非交互高亮层、outline、annotation overlay 必须：

```css
pointer-events: none;
```
