export function createDemoHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IM Chat Demo</title>
  <style>
    *{box-sizing:border-box} body{margin:0;background:#f3f6f8;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17202c}
    .phone{min-height:100vh;background:#f9fbfc;display:flex;flex-direction:column}
    .top{padding:18px 18px 12px;background:#fff;border-bottom:1px solid #e2e8ef;display:flex;align-items:center;justify-content:space-between}
    .avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#d9eef2,#f5d3da);display:grid;place-items:center;font-weight:800;color:#176b87}
    .profile{display:flex;align-items:center;gap:10px}.profile h1{font-size:16px;margin:0}.profile p{font-size:12px;color:#667085;margin:2px 0 0}
    .status{font-size:12px;padding:5px 8px;border-radius:999px;background:#eef7f1;color:#247a51}
    .request{margin:14px;padding:12px;border:1px solid #dbe4ec;border-radius:14px;background:#fff;box-shadow:0 8px 24px rgba(15,30,45,.06)}
    .request strong{display:block;margin-bottom:6px}.request p{font-size:13px;color:#667085;line-height:1.5;margin:0 0 10px}.request .actions{display:flex;gap:8px}
    button{border:1px solid #ccd6e1;background:#fff;border-radius:10px;padding:8px 11px;font-weight:700}.primary{background:#176b87;color:#fff;border-color:#176b87}.danger{color:#a51d32}
    .messages{flex:1;padding:0 14px 12px;display:flex;flex-direction:column;gap:10px}.msg{max-width:82%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45}.me{align-self:flex-end;background:#176b87;color:#fff}.them{align-self:flex-start;background:#fff;border:1px solid #e0e7ef}
    .quota,.balance{margin:0 14px 10px;padding:10px;border-radius:12px;font-size:13px;background:#fff8e8;color:#8a5400;border:1px solid #ebd7a8}.balance{background:#fff0f3;color:#9d1f36;border-color:#f2c6cf}
    .composer{padding:12px;background:#fff;border-top:1px solid #e2e8ef;display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}
    .composer input{border:1px solid #d9e1ea;border-radius:999px;padding:10px 12px;min-width:0}.video.locked{opacity:.42}.toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);background:#17202c;color:#fff;padding:10px 12px;border-radius:999px;font-size:13px;display:none}.toast.show{display:block}
    .panel{position:fixed;right:10px;top:72px;background:#fff;border:1px solid #d9e1ea;border-radius:12px;padding:8px;box-shadow:0 8px 20px rgba(0,0,0,.08);display:grid;gap:6px}
    .panel select{border:1px solid #d9e1ea;border-radius:8px;padding:5px}
  </style>
</head>
<body>
  <div class="phone">
    <div class="top"><div class="profile"><div class="avatar">N</div><div><h1>Noura</h1><p id="sub">消息请求待接受</p></div></div><span id="status" class="status">待接受</span></div>
    <div id="request" class="request"><strong>消息请求卡片</strong><p>接受后可以进入正式聊天；拒绝后当前会话不可继续。</p><div class="actions"><button class="primary" onclick="acceptReq()">接受</button><button class="danger" onclick="rejectReq()">拒绝</button></div></div>
    <div id="quota" class="quota">免费消息额度剩余：3</div>
    <div id="balance" class="balance" hidden>余额不足，请先充值后继续发送。</div>
    <div class="messages"><div class="msg them">Hi, nice to meet you.</div><div class="msg me">Hello Noura!</div><div id="systemMsg" class="msg them">当前场景可继续体验。</div></div>
    <div class="composer"><input id="textInput" placeholder="输入消息..." /><button onclick="sendMsg()">发送</button><button id="videoBtn" class="video" onclick="startVideo()">视频</button></div>
  </div>
  <div class="panel"><select id="quick" onchange="setPrototypeState(JSON.parse(this.value))"><option value='{"acceptStatus":"pending","chatType":"free","messageLeft":3,"userLevel":"S"}'>待接受</option><option value='{"acceptStatus":"accepted","chatType":"free","messageLeft":0,"userLevel":"S"}'>免费用尽</option><option value='{"acceptStatus":"accepted","chatType":"paid","balance":0,"userLevel":"D"}'>付费余额不足</option></select></div>
  <div id="toast" class="toast"></div>
  <script>
    window.PROTOTYPE_CONFIG={name:"IM Chat Prototype",states:{chatType:["free","paid"],acceptStatus:["pending","accepted","rejected"],userLevel:["S","A","B","C","D"],messageLeft:[0,1,3],balance:[0,20,100]}};
    let state={chatType:"free",acceptStatus:"pending",messageLeft:3,balance:20,userLevel:"S"};
    function showToast(t){const el=document.getElementById("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
    function render(){status.textContent=state.acceptStatus==="accepted"?"已接受":state.acceptStatus==="rejected"?"已拒绝":"待接受";sub.textContent="消息请求"+status.textContent;request.hidden=state.acceptStatus!=="pending";quota.hidden=state.chatType!=="free";quota.textContent="免费消息额度剩余："+(state.messageLeft??0);balance.hidden=!(state.chatType==="paid"&&(state.balance??0)<=0);videoBtn.classList.toggle("locked",!["S","A","B"].includes(state.userLevel));systemMsg.textContent=state.acceptStatus==="rejected"?"会话已拒绝，不可继续。":state.chatType==="free"&&(state.messageLeft??0)<=0?"免费额度已用尽。":balance.hidden?"当前场景可继续体验。":"余额不足，无法发送付费消息。"}
    window.setPrototypeState=function(next){state={...state,...next};render();showToast("已切换原型状态")}
    function acceptReq(){setPrototypeState({acceptStatus:"accepted"})} function rejectReq(){setPrototypeState({acceptStatus:"rejected"})}
    function sendMsg(){if(state.acceptStatus!=="accepted")return showToast("请先接受消息请求");if(state.chatType==="free"&&state.messageLeft<=0)return showToast("免费额度已用尽");if(state.chatType==="paid"&&state.balance<=0)return showToast("余额不足");showToast("消息已发送")}
    function startVideo(){if(!["S","A","B"].includes(state.userLevel))return showToast("当前等级暂不可用视频通话");showToast("正在发起视频通话")}
    render();
  </script>
</body>
</html>`;
}

export function createDemoProject() {
  const now = new Date().toISOString();
  const featureChat = crypto.randomUUID();
  const featureVideo = crypto.randomUUID();
  const groupRequest = crypto.randomUUID();
  const groupFree = crypto.randomUUID();
  const groupPaid = crypto.randomUUID();
  const groupVideo = crypto.randomUUID();
  const scenes = [
    ["消息请求待接受", groupRequest, { acceptStatus: "pending", chatType: "free", messageLeft: 3, userLevel: "S" }, "用户收到陌生人消息请求但尚未处理。"],
    ["消息请求已接受", groupRequest, { acceptStatus: "accepted", chatType: "free", messageLeft: 3, userLevel: "S" }, "接受后可进入正式聊天。"],
    ["消息请求已拒绝", groupRequest, { acceptStatus: "rejected", chatType: "free", messageLeft: 3, userLevel: "S" }, "拒绝后会话不可继续。"],
    ["免费聊天额度剩余", groupFree, { acceptStatus: "accepted", chatType: "free", messageLeft: 3, userLevel: "S" }, "免费用户仍可发送消息。"],
    ["免费聊天额度用尽", groupFree, { acceptStatus: "accepted", chatType: "free", messageLeft: 0, userLevel: "S" }, "免费额度用尽后发送受限。"],
    ["付费聊天余额充足", groupPaid, { acceptStatus: "accepted", chatType: "paid", balance: 100, userLevel: "A" }, "付费聊天余额足够时可继续发送。"],
    ["付费聊天余额不足", groupPaid, { acceptStatus: "accepted", chatType: "paid", balance: 0, userLevel: "A" }, "余额不足时提示充值。"],
    ["S/A/B等级视频可用", groupVideo, { acceptStatus: "accepted", chatType: "paid", balance: 100, userLevel: "S" }, "高等级用户可以发起视频。"],
    ["C/D等级视频不可用", groupVideo, { acceptStatus: "accepted", chatType: "paid", balance: 100, userLevel: "D" }, "低等级用户点击视频后提示不可用。"]
  ].map(([name, groupId, state, description]) => ({
    id: crypto.randomUUID(),
    featureId: groupId === groupVideo ? featureVideo : featureChat,
    groupId,
    name,
    description,
    entryType: "state",
    stateJson: JSON.stringify(state, null, 2),
    urlParams: "",
    guide: "1. 在左侧点击场景\n2. 观察原型状态变化\n3. 点击输入框、发送或视频按钮验证反馈",
    recommendedAction: "按场景说明操作核心按钮。",
    expectedResult: description,
    createdAt: now,
    updatedAt: now
  }));
  const sceneByName = Object.fromEntries(scenes.map((scene) => [scene.name, scene.id]));
  return {
    version: "1.0",
    project: {
      id: crypto.randomUUID(),
      name: "IM 聊天讲解示例",
      description: "用于演示功能树、场景切换、标注和分享导出。",
      createdAt: now,
      updatedAt: now
    },
    sourceHtml: createDemoHtml(),
    sourceUrl: "",
    sourceFileName: "",
    prototypeId: "",
    entryFile: "",
    sourceKind: "html",
    fileCount: 1,
    htmlFiles: ["index.html"],
    functions: [
      { id: featureChat, name: "IM聊天", description: "用于承载消息发送、消息请求、免费聊天和付费聊天等交互。", pageName: "聊天页", createdAt: now, updatedAt: now },
      { id: featureVideo, name: "视频通话", description: "用于说明不同等级用户的视频通话可用性。", pageName: "聊天页", createdAt: now, updatedAt: now }
    ],
    sceneGroups: [
      { id: groupRequest, featureId: featureChat, name: "消息请求", createdAt: now, updatedAt: now },
      { id: groupFree, featureId: featureChat, name: "免费聊天", createdAt: now, updatedAt: now },
      { id: groupPaid, featureId: featureChat, name: "付费聊天", createdAt: now, updatedAt: now },
      { id: groupVideo, featureId: featureVideo, name: "视频等级", createdAt: now, updatedAt: now }
    ],
    scenes,
    annotations: [
      createAnnotation(featureChat, sceneByName["消息请求待接受"], 34, 25, "消息请求卡片", "接受前锁定聊天，接受后 SAB 可以继续，拒绝后不可继续。"),
      createAnnotation(featureChat, sceneByName["免费聊天额度剩余"], 22, 42, "免费消息额度提示", "免费用户显示剩余条数，用尽后发送按钮触发 toast。"),
      createAnnotation(featureChat, sceneByName["免费聊天额度用尽"], 50, 91, "输入框", "额度用尽时输入框仍可见，但发送动作被拦截并提示。"),
      createAnnotation(featureVideo, sceneByName["S/A/B等级视频可用"], 88, 91, "视频通话按钮", "S/A/B 等级可发起视频通话。"),
      createAnnotation(featureChat, sceneByName["付费聊天余额不足"], 44, 45, "余额不足提示", "余额不足时展示充值提示，发送付费消息被拦截。")
    ],
    settings: {
      mode: "annotate",
      viewport: "original",
      prototypeWidth: 430,
      prototypeHeight: 760,
      selectedFeatureId: featureChat,
      selectedSceneId: sceneByName["消息请求待接受"],
      selectedAnnotationId: ""
    }
  };
}

function createAnnotation(featureId, sceneId, xPercent, yPercent, title, fact) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    featureId,
    sceneId,
    xPercent,
    yPercent,
    title,
    manualFact: fact,
    functionDescription: "该标注解释当前区域的产品规则和用户反馈。",
    displayCondition: "当前场景命中时展示。",
    interactionRule: "点击相关控件后根据场景状态给出反馈。",
    notes: "示例标注，可继续编辑。",
    createdAt: now,
    updatedAt: now
  };
}
