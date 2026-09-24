# SALFA VIP

## 需求状态

- 创建日期：2026-09-02
- 最近更新：2026-09-03
- 需求类型：VIP 体系前台原型 + 运营后台配置线框
- 关联模块：VIP
- 关联页面：Settings / VIP Center / Vip Center · Mine / VIP 转赠半屏 / 接收方 VIP Record / VIP Privilege Setting / 用户主页头像勋章 / 运营后台
- UI 基线：高保真以用户参考视觉为方向；后台为黑白静态线框
- 当前 UI 交付物：`index.html`（前台 + 运营后台统一评审入口）
- 文档状态：Ready for Delivery
- 产品状态：Approved（已交付评审并部署）

## 交付范围

- 前台：VIP1–VIP10 浏览、购买/续费/升级/赠送/充值活动获得、权益开关设置等关键画板（统一高保真深金风格）。
- 用户主页：按用户提供截图 1:1 还原独立页面，并在小圆头像最右侧叠加金紫 VIP 勋章；其他视觉内容保持不变。
- VIP 转赠：在第 39 页点击可转赠 VIP 的「转赠」后进入第 40 页半屏展开态；支持搜索用户 ID、自定义转赠天数和点击转赠按钮。
- Settings：在第 38 页前新增 `37A` 页面，在 Block list 下方增加 `VIP setting` 入口并定位第 38 页。
- 接收方记录：第 43 页仅展示 Collection、Record，默认定位 Record，展示我收到的 VIP 赠送与转赠记录。
- 业务口径：VIP1–VIP7 可购买/赠送；VIP8–VIP10 仅由充值活动获得。
- 运营后台（黑白线框 + 常驻字段解释）：
  - 等级与套餐（VIP1–VIP7，含售卖价格/折扣比例/有效期/关联权益道具/封面素材/排序）
  - 充值活动（VIP8–VIP10 周期档位与奖励）
  - VIP 等级记录（购买/赠送来源，赠送对象联动）
- 产品标注：已接入 `prototype-annotation` Runtime，公网只读、本地编辑。

## 公网部署

- Vercel 项目：`rui-25ac/20260902-salfa-vip`
- 部署环境：Production
- 公网地址：https://20260902-salfa-vip.vercel.app
- 访问范围：公开

## 本地入口

- 统一评审入口：`index.html`（前台 + 运营后台；右上角「App 前台 / 运营后台」切换）
- 标注数据：`annotations.json`；标注运行时：`.prototype-annotations/`
- 字段表 / 规则：`PRD.md`

## 未验证 / 待确认

- 目标访问地区（目标市场）实际访问未逐一验证。
- 套餐售卖价格、折扣比例、有效期示例值为演示数据，待真实定价确认后由运营侧配置。
