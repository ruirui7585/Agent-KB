# 点击诊断和回归

## 常见点击失效原因

- overlay / mask 拦截
- annotation highlight 拦截
- `pointer-events` 错误
- `z-index` 层级错误
- click handler 丢失
- handler 绑定到错误元素
- `stopPropagation` 错用
- 状态更新后 render 没切页面

## 排查顺序

1. 点击是否进入全局 capture click。
2. 目标元素是否有 data 标识。
3. handler 是否绑定。
4. handler 是否调用路由函数。
5. 状态是否更新。
6. render 是否切到目标页面。
7. 是否有 TypeError 中断。

## 临时诊断

必要时添加临时日志：

- `[global-click-debug]`
- `[click-debug]`
- `[route-debug]`
- `[render-debug]`

诊断不应引发 render 循环。

## CSS 层规则

非交互型层必须：

```css
pointer-events: none;
```

包括：

- annotation outline
- module highlight
- selected target overlay
- toast

Modal / Sheet mask 只在打开时拦截点击。
