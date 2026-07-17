# Axhub Annotation Standalone Demo

这是一个隔离的普通 HTML 演示，用于展示 `axhub-annotation-standalone` Skill 的实际接入效果。

## 展示能力

- 页面元素 Marker 与点击标注气泡
- 短标注和 Markdown 长说明
- 原型目录与页面切换
- 颜色筛选和主题切换
- Axhub controls 驱动宿主页面状态

## 本地预览

在本目录运行：

```bash
python3 -m http.server 4177 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:4177/
```

## 文件说明

- `index.html`：演示页面结构
- `css/styles.css`：页面视觉和响应式样式
- `js/app.js`：页面交互、路由与 Axhub runtime 初始化
- `data/annotation-source.js`：统一标注数据源
- `vendor/axhub-annotation.global.js`：官方 standalone browser bundle

## 限制

这是高保真交互参考，不是生产代码。Axhub runtime 在此演示中只读取并展示已有标注，不提供标注编辑或回写。
