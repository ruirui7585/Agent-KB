# 媒体内容状态

## 媒体 item 规范

每个媒体 item 必须有稳定身份：

- `mediaId`
- `type`: `photo` / `video`
- `thumbUrl`
- `fullUrl`

用户选择什么，发送后就展示什么。

不要：

- 随机取图
- 用 placeholder 替代真实选择
- 只按数量生成假图
- opened 状态换成另一张图

## 选中内容

多选内容应保存：

- `selectedMediaIds`
- `mediaItems`
- `photosCount`
- `videosCount`

发送到 IM 或卡片后，应把本次选择的完整 `mediaItems` 写入消息或内容组。

## 私密内容状态机

通用状态：

- `not_sent`：未发送
- `sent_unopened`：已发送未查看
- `opened_countdown`：已查看倒计时中
- `destroyed`：已销毁

## 展示规则

`sent_unopened`：
- 可以模糊
- 可以有 lock / private 标识
- 底图必须仍是用户选中的内容

`opened_countdown`：
- 必须高清展示本次选中的原图 / 视频缩略图
- 不允许 blur
- 不允许遮罩覆盖内容
- 显示倒计时

`destroyed`：
- 不展示原图
- 显示销毁图标
- 文案说明内容已销毁
- 不可再次查看

## 单选 / 多选

- 1 张图：只展示 1 张图，文案 `1 photo`。
- 3 张图：展示 3 张图，文案 `3 photos`。
- 1 个视频：展示视频缩略图，文案 `1 video`。
- 2 图 1 视频：展示全部选中项，文案 `2 photos · 1 video`。
