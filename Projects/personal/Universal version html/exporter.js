export function downloadJson(project) {
  downloadFile("prototype-project.json", JSON.stringify(project, null, 2), "application/json");
}

export function exportShareHtml(project) {
  const dataScript = safeJsonForScript(project);
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(project.project.name)} - 分享版</title>
  <link rel="icon" href="data:," />
  <style>
    *{box-sizing:border-box} body{margin:0;background:#f4f6f8;color:#17202c;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .share{min-width:1024px;min-height:100vh;display:grid;grid-template-rows:64px 1fr}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 18px;background:#fff;border-bottom:1px solid #d8dee7}
    .top h1{font-size:18px;margin:0}.top p{margin:2px 0 0;color:#687386;font-size:12px}.toggle{display:flex;gap:8px}.toggle button,.tree button{border:1px solid #d8dee7;background:#fff;border-radius:8px;padding:7px 10px;font-weight:700}
    .toggle button.active{background:#176b87;color:#fff;border-color:#176b87}.layout{display:grid;grid-template-columns:280px minmax(420px,1fr)340px;gap:14px;padding:14px}
    aside,.stage-wrap{background:#fff;border:1px solid #d8dee7;border-radius:8px;overflow:auto}.panel-title{padding:14px;border-bottom:1px solid #d8dee7;font-weight:800}.tree{padding:10px}.feature{margin:8px 0 12px}.feature>strong{display:block;margin:0 0 6px}.group{margin-left:10px;color:#687386;font-size:13px}.scene{width:100%;text-align:left;margin:3px 0}.scene.active{background:#edf6f8;color:#176b87}
    .stage-wrap{display:grid;grid-template-rows:auto 1fr;overflow:hidden}.scene-head{padding:12px 14px;border-bottom:1px solid #d8dee7}.scene-head strong{display:block}.scene-head span{color:#687386;font-size:12px}.stage{position:relative;margin:14px auto;width:min(100%,960px);height:calc(100vh - 150px);background:#dfe5ed;border-radius:8px;overflow:auto;border:1px solid #c8d1dc}.stage.phone{width:430px}.stage iframe{width:100%;height:100%;border:0;background:#fff}.stage.experience .layer{display:none}.layer{position:absolute;inset:0;pointer-events:none}.dot{position:absolute;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#d94862;color:#fff;border:2px solid #fff;font-size:12px;font-weight:900;box-shadow:0 6px 16px rgba(217,72,98,.35);pointer-events:auto}.dot.active{background:#176b87;outline:3px solid rgba(23,107,135,.28)}
    .detail{padding:14px}.detail h2{font-size:16px;margin:0 0 8px}.detail h3{font-size:13px;margin:16px 0 6px;color:#687386}.detail p{line-height:1.65;margin:0;white-space:pre-line}.guide{margin:12px 14px 0;padding:10px;border:1px solid #e1c48a;background:#fff8e8;border-radius:8px;color:#8a5400;white-space:pre-line}
  </style>
</head>
<body>
  <div class="share">
    <header class="top"><div><h1 id="name"></h1><p>单文件分享版，不依赖编辑器、本地存储或 npm 包</p></div><div class="toggle"><button id="explainBtn" class="active">讲解模式</button><button id="experienceBtn">体验模式</button><button id="phoneBtn">手机尺寸</button><button id="webBtn">Web 尺寸</button></div></header>
    <main class="layout"><aside><div class="panel-title">功能与场景</div><div id="tree" class="tree"></div></aside><section class="stage-wrap"><div class="scene-head"><strong id="sceneName"></strong><span id="sceneDesc"></span></div><div id="guide" class="guide" hidden></div><div id="stage" class="stage phone"><iframe id="frame" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-same-origin"></iframe><div id="layer" class="layer"></div></div></section><aside><div class="panel-title">标注说明</div><div id="detail" class="detail"></div></aside></main>
  </div>
  <script>window.PROTOTYPE_PROJECT_DATA=${dataScript};</script>
  <script>
    const project=window.PROTOTYPE_PROJECT_DATA;let selectedSceneId=project.settings.selectedSceneId||project.scenes[0]?.id||"";let selectedAnnotationId="";let objectUrl="";const frame=document.getElementById("frame"),stage=document.getElementById("stage"),layer=document.getElementById("layer"),detail=document.getElementById("detail"),guide=document.getElementById("guide");
    function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;"}[m]))}
    function renderTree(){document.getElementById("name").textContent=project.project.name;tree.innerHTML=project.functions.map(f=>'<div class="feature"><strong>'+esc(f.name)+'</strong>'+project.sceneGroups.filter(g=>g.featureId===f.id).map(g=>'<div class="group">'+esc(g.name)+project.scenes.filter(s=>s.groupId===g.id).map(sceneBtn).join("")+'</div>').join("")+project.scenes.filter(s=>s.featureId===f.id&&!s.groupId).map(sceneBtn).join("")+'</div>').join("");tree.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>selectScene(b.dataset.scene))}
    function sceneBtn(s){return '<button class="scene '+(s.id===selectedSceneId?'active':'')+'" data-scene="'+s.id+'">'+esc(s.name)+'</button>'}
    function renderFrame(){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(new Blob([project.sourceHtml||"<p style='padding:24px'>未导入原型 HTML</p>"],{type:"text/html"}));frame.removeAttribute("srcdoc");frame.src=objectUrl}
    function applyScene(scene){if(!scene)return;guide.hidden=true;guide.textContent="";if(scene.entryType==="state"){try{const fn=frame.contentWindow&&frame.contentWindow.setPrototypeState;if(typeof fn==="function")fn(JSON.parse(scene.stateJson||"{}"));else showGuide("当前原型不支持自动状态切换，请使用操作指引或说明模式。")}catch(e){showGuide("状态切换失败："+e.message)}}else if(scene.entryType==="guide")showGuide(scene.guide||"请按操作指引操作原型。");else if(scene.entryType==="url")showGuide(scene.guide||"分享版已保留 URL 参数说明，请在编辑器中验证自动重载。")}
    function showGuide(t){guide.hidden=false;guide.textContent=t}
    function selectScene(id){selectedSceneId=id;selectedAnnotationId="";const scene=project.scenes.find(s=>s.id===id);sceneName.textContent=scene?.name||"未选择场景";sceneDesc.textContent=scene?.description||"";renderTree();renderDots();applyScene(scene);renderDetail()}
    function renderDots(){const dots=project.annotations.filter(a=>a.sceneId===selectedSceneId);layer.innerHTML=dots.map((a,i)=>'<button class="dot '+(a.id===selectedAnnotationId?'active':'')+'" style="left:'+a.xPercent+'%;top:'+a.yPercent+'%" data-ann="'+a.id+'">'+(i+1)+'</button>').join("");layer.querySelectorAll("[data-ann]").forEach(d=>d.onclick=()=>{selectedAnnotationId=d.dataset.ann;renderDots();renderDetail()})}
    function renderDetail(){const scene=project.scenes.find(s=>s.id===selectedSceneId);const ann=project.annotations.find(a=>a.id===selectedAnnotationId)||project.annotations.find(a=>a.sceneId===selectedSceneId);if(!ann){detail.innerHTML='<h2>'+esc(scene?.name||"说明")+'</h2><p>'+esc(scene?.description||"暂无标注，仍可体验原型。")+'</p>';return}selectedAnnotationId=ann.id;detail.innerHTML='<h2>'+esc(ann.title)+'</h2><h3>人工事实</h3><p>'+esc(ann.manualFact)+'</p><h3>功能说明</h3><p>'+esc(ann.functionDescription)+'</p><h3>展示条件</h3><p>'+esc(ann.displayCondition)+'</p><h3>交互规则</h3><p>'+esc(ann.interactionRule)+'</p><h3>注意事项</h3><p>'+esc(ann.notes)+'</p>'}
    explainBtn.onclick=()=>{stage.classList.remove("experience");explainBtn.classList.add("active");experienceBtn.classList.remove("active")};experienceBtn.onclick=()=>{stage.classList.add("experience");experienceBtn.classList.add("active");explainBtn.classList.remove("active")};phoneBtn.onclick=()=>stage.classList.add("phone");webBtn.onclick=()=>stage.classList.remove("phone");
    frame.addEventListener("load",()=>applyScene(project.scenes.find(s=>s.id===selectedSceneId)));renderFrame();renderTree();selectScene(selectedSceneId);
  </script>
</body>
</html>`;
  downloadFile(`${slugify(project.project.name)}-share.html`, html, "text/html");
  return html;
}

export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function slugify(value) {
  return String(value || "prototype").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "prototype";
}
