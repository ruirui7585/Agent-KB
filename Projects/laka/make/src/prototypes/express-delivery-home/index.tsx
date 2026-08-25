/**
 * @name 快递官网首页线框图
 */

import React, { useMemo } from 'react';
import {
  AnnotationViewer,
  type AnnotationDirectoryRouteNode,
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
  setProtoDevState,
  useProtoDevState,
} from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './style.css';

type ProtoState = {
  delivery_mode?: 'send' | 'track';
  form_state?: 'default' | 'success' | 'error';
};

const services = ['标准快递', '同城急送', '大件寄送', '生鲜冷链', '国际寄递', '文件专送'];

export default function ExpressDeliveryWireframe() {
  const protoState = useProtoDevState<ProtoState>();
  const mode = protoState.delivery_mode === 'track' ? 'track' : 'send';
  const formState = protoState.form_state === 'success' || protoState.form_state === 'error'
    ? protoState.form_state
    : 'default';

  const options = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    showThemeToggle: true,
    showColorFilter: true,
    toolbarEdge: 'right',
    emptyWhenNoData: false,
    currentPageId: 'home',
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      const payload = node.payload as ProtoState | undefined;
      if (payload) setProtoDevState(payload);
    },
  }), []);

  return (
    <>
      <div className="wireframe-page">
        <header className="wf-header" data-annotation-id="global-header">
          <div className="wf-logo"><span className="logo-box">LOGO</span><strong>迅达快递</strong></div>
          <nav><a href="#hero">首页</a><a href="#services">个人寄件</a><a href="#merchant">商家服务</a><a href="#support">服务支持</a></nav>
          <div className="header-buttons"><button>登录</button><button className="filled">注册</button></div>
        </header>

        <main>
          <section className="wf-hero" id="hero" data-annotation-id="hero-section">
            <div className="hero-copy">
              <span className="label">品牌主张</span>
              <h1>寄快递，<br />简单又可靠</h1>
              <p>覆盖全国 300+ 城市，专业快递员最快 1 小时上门。</p>
              <div className="trust-row"><span>✓ 实时追踪</span><span>✓ 隐私保护</span><span>✓ 安全保障</span></div>
            </div>
            <div className="hero-placeholder"><span>首屏品牌视觉占位</span><div className="route-line" /><div className="package-box">包裹</div></div>
            <div className="task-card" data-annotation-id="primary-task-card">
              <div className="task-tabs">
                <button className={mode === 'send' ? 'active' : ''} onClick={() => setProtoDevState({ delivery_mode: 'send', form_state: 'default' })}>寄快递</button>
                <button className={mode === 'track' ? 'active' : ''} onClick={() => setProtoDevState({ delivery_mode: 'track', form_state: 'default' })}>查快递</button>
              </div>
              {mode === 'send' ? (
                <div className="task-form"><label>从哪里寄</label><div className="fake-input">上海市⌄</div><label>寄到哪里</label><div className="fake-input muted">请输入收件城市</div></div>
              ) : (
                <div className="task-form"><label>运单号</label><div className="fake-input muted">请输入运单号</div><div className="form-spacer" /></div>
              )}
              <button className="main-action" onClick={() => setProtoDevState({ form_state: formState === 'success' ? 'error' : 'success' })}>{mode === 'send' ? '立即寄件' : '立即查询'} →</button>
              {formState !== 'default' && <div className={`state-message ${formState}`}>{formState === 'success' ? '✓ 操作成功状态' : '! 信息填写错误状态'}</div>}
              <button className="text-action">运费与时效查询</button>
            </div>
          </section>

          <section className="metric-row" aria-label="核心指标">
            <div><strong>300+</strong><span>覆盖城市</span></div><div><strong>1小时</strong><span>最快上门</span></div><div><strong>98.7%</strong><span>准时送达</span></div><div><strong>7×24</strong><span>客户服务</span></div>
          </section>

          <section className="wf-section" id="services" data-annotation-id="service-grid">
            <div className="section-heading"><span className="label">服务分类</span><h2>想怎么寄，都有合适的方式</h2><p>六类核心寄递服务，用统一卡片结构呈现。</p></div>
            <div className="service-grid">
              {services.map((service, index) => <article key={service}><span className="icon-placeholder">图标</span><strong>{service}</strong><small>服务说明文案</small><b>0{index + 1}</b></article>)}
            </div>
          </section>

          <section className="merchant-wireframe" id="merchant" data-annotation-id="merchant-section">
            <div><span className="label inverted">小商家专区</span><h2>小生意，也值得<br />更专业的物流</h2><p>批量下单、电子面单、订单管理、月结对账。</p><button>免费开通商家服务 →</button></div>
            <div className="dashboard-placeholder">
              <div className="dash-title"><strong>商家发货工作台</strong><span>日期</span></div>
              <div className="dash-cards"><div>待发货<br /><b>128</b></div><div>运输中<br /><b>856</b></div></div>
              <div className="dash-list"><span>订单行 01</span><span>订单行 02</span><span>订单行 03</span></div>
            </div>
          </section>

          <section className="wf-section" id="support" data-annotation-id="trust-section">
            <div className="section-heading"><span className="label">服务保障</span><h2>每一次托付，都认真对待</h2></div>
            <div className="trust-grid"><article>图标<h3>极速上门</h3><p>保障说明文案</p></article><article>图标<h3>全程可视</h3><p>保障说明文案</p></article><article>图标<h3>安心保障</h3><p>保障说明文案</p></article><article>图标<h3>随时在线</h3><p>保障说明文案</p></article></div>
          </section>
        </main>

        <footer><div className="wf-logo"><span className="logo-box">LOGO</span><strong>迅达快递</strong></div><div>个人服务　商家服务　帮助中心　关于我们</div><small>© 2026 迅达快递 · 线框原型</small></footer>
      </div>
      <AnnotationViewer
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={options}
      />
    </>
  );
}
