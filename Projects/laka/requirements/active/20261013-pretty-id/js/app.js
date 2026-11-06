const E = PrettyEngine;
let state;
try { state = E.createState(JSON.parse(localStorage.getItem('pretty-id-demo')) || {}); }
catch { state = E.createState(); }
state.route = 'wealth';
const staticPreviewType = new URLSearchParams(location.search).get('preview');
const staticRedeemed = staticPreviewType === 'redeemed';
const staticLevelLocked = staticPreviewType === 'level-locked';
const staticReview = staticRedeemed || staticLevelLocked;
if (staticRedeemed) state = E.createState({level:85,current:'8888',remaining:1,rewards:['A']});
if (staticLevelLocked) state = E.createState({level:24});
document.documentElement.dataset.preview = staticReview ? staticPreviewType : '';
let page = 'home', tab = 'A', svipTab = 'SS', keyboard = 'alpha', value = '', busy = false, network = 'normal', pending = null;
if (staticReview) value = '8888';
const navigation = [];
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save() { try { localStorage.setItem('pretty-id-demo', JSON.stringify(state)); } catch {} }
function closeModal() { $('#modal').close(); }
function modal(html) {
  $('#modal').innerHTML = `<button class="close" onclick="closeModal()" aria-label="Close">×</button>${html}`;
  if (!$('#modal').open) $('#modal').showModal();
}
function go(p) {
  if (p === page) return;
  if (p === 'home') navigation.length = 0;
  else navigation.push({page, scroll: window.scrollY});
  page = p; render(); window.scrollTo(0, 0);
}
function back() {
  const previous = navigation.pop(); page = previous ? previous.page : 'home';
  render(); window.scrollTo(0, previous ? previous.scroll : 0);
}
function changeRoute(route) { state.route = route; pending = null; save(); render(); }
function routeControls() {
  return `<div class="route-tabs" aria-label="Redemption route"><button class="${state.route === 'wealth' ? 'active' : ''}" onclick="changeRoute('wealth')">Wealth level</button><button class="${state.route === 'svip' ? 'active' : ''}" onclick="changeRoute('svip')">SVIP privilege</button></div>`;
}
function crest(label = 'ID', compact = false) {
  return `<svg class="crest ${compact ? 'compact' : ''}" viewBox="0 0 320 240" role="img" aria-label="${label} gold emblem"><defs><linearGradient id="metal-${label}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b7"/><stop offset=".28" stop-color="#dfb868"/><stop offset=".5" stop-color="#815327"/><stop offset=".72" stop-color="#f7d995"/><stop offset="1" stop-color="#bd8741"/></linearGradient></defs><g fill="url(#metal-${label})"><path d="M139 180C80 177 27 134 15 64c32 29 61 39 106 44l-7 15c-35-5-63-16-82-31 14 32 44 52 80 59l7 19c-35-7-63-24-78-43 24 34 58 50 98 53Z"/><path d="M181 180c59-3 112-46 124-116-32 29-61 39-106 44l7 15c35-5 63-16 82-31-14 32-44 52-80 59l-7 19c35-7 63-24 78-43-24 34-58 50-98 53Z"/><path d="m127 54-6-23 23 13 16-28 16 28 23-13-6 23Z"/><path d="M160 60 221 88l-10 73-51 46-51-46-10-73Z"/></g><path d="m160 69 50 24-9 63-41 37-41-37-9-63Z" fill="#641e20" stroke="#ffd48b" stroke-width="2"/><path d="m160 81 39 19-7 48-32 31-32-31-7-48Z" fill="#311314" stroke="#9c6b3c"/><text x="160" y="145" text-anchor="middle" fill="#f5d99a" font-family="Georgia" font-size="${label.length > 1 ? 45 : 54}" font-weight="bold">${label}</text><path d="m160 211 10 9-10 9-10-9Z" fill="#f1c16d"/></svg>`;
}
function hero(compact = false) {
  return `<div class="hero ${compact ? 'small-hero' : ''}"><div class="eyebrow">A SIGNATURE WORTH KEEPING</div>${crest(compact ? (state.route === 'svip' ? 'SS' : tab) : 'ID')}<h1>Make your mark.</h1><p>Your identity. A little more extraordinary.</p>${page === 'home' ? '<button class="hero-link" onclick="go(\'rewards\')">Rules & Rewards <span>↗</span></button>' : ''}</div>`;
}
function levelText(entry, route = state.route) { return route === 'svip' ? `SVIP${entry.level}` : `LV${entry.level}`; }
function unlocked(entry, route = state.route) { return route === 'svip' ? state.svipActive && state.svip >= entry.level : state.level >= entry.level; }
function rows(entries, route = state.route) {
  return entries.slice().sort((a,b) => a.level - b.level).map(c => `<div class="level-row"><div class="level-head"><strong>${levelText(c, route)}${route === 'wealth' ? '+' : ''}</strong><span class="${unlocked(c,route) ? 'available' : 'locked-label'}">${c.pending ? 'To be confirmed' : unlocked(c,route) ? 'Unlocked' : route === 'svip' && !state.svipActive ? 'Expired' : 'Locked'}</span></div>${c.patterns.length ? `<div class="patterns ${unlocked(c,route) ? '' : 'locked'}">${c.patterns.map(p => `<button onclick="pattern('${p}',${c.level},'${c.category}','${route}')"><b>${p}</b><small>${p.length} ${p.length === 1 ? 'character' : 'characters'}</small></button>`).join('')}</div>` : `<p class="pending">${route === 'svip' ? c.level === 6 ? '4-letter ID (XXXX). Exact matching rule to be confirmed.' : '3-letter ID (XXX). Exact matching rule to be confirmed.' : 'Templates and lengths to be confirmed.'}<br>Not available for redemption yet.</p>`}</div>`).join('');
}
function rewards(category, confirmed = true) {
  return `<section class="reward-section"><p class="muted">Users who successfully redeem an A-level pretty ID can<br>receive the following reward</p><div class="reward-grid">${['Profile Frame', category === 'SS' ? 'Identity Badge' : 'Chat Bubble'].map((r,i) => `<button class="reward" onclick="reward('${r}','${category}')">${i ? `<div class="reward-badge">${category}</div>` : `<div class="reward-avatar"><span>N</span></div>`}<strong>${r}</strong><small>Permanent</small></button>`).join('')}</div><p class="hint">${state.rewards.includes(category) ? '✓ This collection is already yours.' : 'Each category collection is awarded once.'}</p></section>`;
}
function home() {
  const entries = state.route === 'svip' ? E.svipConfig : E.config;
  const available = entries.filter(c => !c.pending && unlocked(c));
  return `${hero()}<section class="card profile-card"><div class="profile-card-title"><span aria-hidden="true">✦</span><h2>Pretty ID</h2><span aria-hidden="true">✦</span></div><div class="profile"><div class="avatar" aria-label="Noura avatar">N</div><div class="profile-details"><strong>Noura</strong><p>Wealth Level: <b>LV${state.level}</b></p><p>Pretty ID: <b>${esc(state.current||'–')}</b></p></div></div><p class="profile-unlock">${staticRedeemed ? 'Your new Pretty ID is ready to use.' : state.route==='svip'?(state.svipActive?'Reach <b>SVIP5</b> to unlock the confirmed SS patterns.':'Your SVIP privilege has expired. An active entitlement is required.'):'Reach <b>LV25</b> to enter the Pretty ID collection. Check Rules & Rewards for the patterns available at your level.'}</p></section><section class="claim-section"><h2 class="claim-title">Enter your lucky Pretty ID</h2><input id="number" ${staticReview ? 'readonly' : ''} maxlength="${E.maxLength}" autocomplete="off" value="${esc(value)}" placeholder="Enter letters or numbers" aria-label="Pretty ID">${staticRedeemed ? `<div class="redeemed-panel" role="status"><div class="redeemed-check" aria-hidden="true">✓</div><h3>Pretty ID Redeemed!</h3><p>Your new Pretty ID is ready to use.</p><div class="redeemed-detail"><span>Pretty ID</span><strong>8888</strong><span>Class A · Permanent</span></div><div class="redeemed-rewards"><span>✦ Profile Frame</span><span>✦ Chat Bubble</span></div><a class="redeemed-back" href="delivery.html">Back</a></div>` : staticLevelLocked ? `<div class="redeemed-panel level-locked-panel" role="status"><div class="redeemed-check" aria-hidden="true">!</div><h3 class="level-locked-message">Reach Wealth Lv85 to redeem this ID.</h3><a class="redeemed-back" href="delivery.html">Back</a></div>` : `<div class="keyboard ${keyboard === 'numeric' ? 'numeric' : ''}">${(keyboard === 'alpha' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '1234567890').split('').map(c=>`<button class="key" onclick="key('${c}')">${c}</button>`).join('')}<button class="key keyboard-switch" onclick="keyboard=keyboard==='alpha'?'numeric':'alpha';render()">${keyboard==='alpha'?'123':'ABC'}</button><button class="key keyboard-delete" onclick="key('delete')">Delete</button><button class="key gold keyboard-next" id="submit" onclick="check()" ${!value ? 'disabled' : ''}>Next ↗</button></div>`}</section><p class="foot">YOUR IDENTITY. YOUR SIGNATURE.</p>`;
}
function patternTable(entries) {
  const lengths = [7,6,5,4,3,2,1].filter(length => entries.some(e => e.patterns.some(p => p.length === length)));
  const body = entries.slice().sort((a,b)=>a.level-b.level).map(e => {
    const rows=e.tableRows.map(cells=>lengths.map(length=>cells[7-length]));
    return rows.map((cells,i)=>`<tr class="${unlocked(e,'wealth')?'':'table-locked'}">${i===0?`<th scope="rowgroup" rowspan="${rows.length}"><b>≥${e.level}</b><small>${unlocked(e,'wealth')?'Unlocked':'Locked'}</small></th>`:''}${cells.map(p=>`<td>${p?`<button onclick="pattern('${p}',${e.level},'${e.category}','wealth')">${p}</button>`:''}</td>`).join('')}</tr>`).join('');
  }).join('');
  return `<div class="pattern-table-scroll" tabindex="0" role="region" aria-label="Pretty ID level and character table"><table class="pattern-table" style="min-width:${82+lengths.length*80}px"><thead><tr><th scope="col">Wealth<br>Level</th>${lengths.map(l=>`<th scope="col">${l}<br>${l===1?'character':'characters'}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div><p class="table-scroll-hint">Swipe to view all character lengths ↔</p>`;
}
function collections() {
  const selected = tab;
  const entries = E.config.filter(c => c.category === selected);
  return `${hero(true)}<h2>Rules & Rewards</h2><p class="muted">Find your pattern. Discover what comes with it.</p><div class="tabs">${['A','B','C'].map(c => `<button class="${selected===c?'selected':''}" onclick="tab='${c}';render()">${c}</button>`).join('')}</div><div class="collection-heading"><p class="muted">The following are ${selected}-level premium numbers. Users who reach the corresponding SVIP level can unlock the corresponding series of premium numbers.</p></div><section class="card pattern-card table-card">${patternTable(entries)}</section>${rewards(selected)}<button class="rules-entry" onclick="go('rules')"><span>All levels & collection rules</span><span>↗</span></button>`;
}
function rulesPage() {
  return `<div class="rules-heading"><div class="eyebrow">YOUR GUIDE TO PRETTY ID</div><h2>Know your signature.</h2><p class="muted">Wealth milestones. One unique identity.</p></div><section class="card"><h2>Wealth level patterns</h2><p class="hint">Higher wealth levels inherit confirmed patterns from lower levels.</p>${['C','B','A'].map(c => `<div class="rule-category">Class ${c}</div>${rows(E.config.filter(e=>e.category===c),'wealth')}`).join('')}</section><section class="card"><h2>How patterns work</h2><div class="example"><b>AA</b><span>88 · KK<br><small>Same character twice</small></span></div><div class="example"><b>AB</b><span>89 · KL<br><small>Two different characters</small></span></div><div class="example"><b>ABA</b><span>898 · KLK<br><small>First and last match</small></span></div><p class="hint">Letters describe a structure, not a literal ID. Different letters must represent different characters. Use only numbers or only English letters.</p><p class="hint">Higher wealth levels inherit every lower-level pattern. Different placeholder letters must represent different characters.</p></section><h2>Collection rules</h2>${['Reach the required wealth level to unlock each pattern. For numbers outside the configured patterns, contact customer service.','After 90 consecutive days without login, or a suspected platform violation, the platform may reclaim your Pretty ID.','If a modified or reclaimed ID is assigned to another user, the original user cannot claim that ID again.','Redemptions are limited. Contact an administrator for additional opportunities.','Pretty IDs cannot be gifted or traded. Violations may result in an account ban.','Fraudulent activity may result in disqualification and cancellation of event data.'].map((r,i) => `<div class="rule"><span>${i+1}</span><div>${r}</div></div>`).join('')}<p class="foot">YOUR IDENTITY. YOUR SIGNATURE.</p>`;
}
function render() {
  $('#app').innerHTML = `<nav>${page==='home'?'<span style="width:44px" aria-hidden="true"></span>':'<button onclick="back()" aria-label="Back">‹</button>'}<strong>${page==='rules'?'Rules':page==='rewards'?'Rules & Rewards':'Pretty ID'}</strong>${page==='rules'?'<span style="width:44px" aria-hidden="true"></span>':'<button onclick="go(&quot;rules&quot;)" aria-label="Rules">☷</button>'}</nav>${page==='home'?home():page==='rewards'?collections():rulesPage()}`;
  if ($('#number') && !staticReview) $('#number').oninput = e => { value=e.target.value.toUpperCase(); e.target.value=value; $('#submit').disabled=!value; };
}
function key(c) { value = c==='delete' ? value.slice(0,-1) : (value+c).slice(0,E.maxLength); render(); }
function pattern(p,l,c,route) {
  const entry = {level:l}; const eligible=unlocked(entry,route);
  modal(`<div class="eyebrow">CLASS ${c} · ${p.length} CHARACTERS</div><h2>${p}</h2><p>Same letters mean the same character.<br>Different letters mean different characters.</p><div class="example"><b>${p}</b><span>${p.split('').map(x=>({A:'8',B:'9',C:'7'}[x]||'6')).join('')}</span></div><p>Required: ${levelText(entry,route)}<br>Your level: ${route==='svip'?'SVIP '+state.svip+' · '+(state.svipActive?'Active':'Expired'):'LV'+state.level}</p>${eligible?`<button class="gold full" onclick="tryPattern('${p}','${route}')">Try this pattern</button>`:`<p class="status">${route==='svip'&&!state.svipActive?'Your SVIP entitlement has expired.':'Unlock at '+levelText(entry,route)+'.'}</p>`}`);
}
function tryPattern(p,route) { state.route=route; value=''; keyboard='numeric'; save(); closeModal(); go('home'); $('#number').focus(); }
function reward(r,c) {
  modal(`<div class="eyebrow">CLASS ${c} REWARD</div><h2>${r}</h2>${crest(c,true)}<p>A permanent ${r.toLowerCase()}, awarded once on your first Class ${c} claim.</p><small>${c==='SS'?'Illustrated reward preview. Final item details to be confirmed.':'Visual preview only; no real inventory is connected.'}</small>`);
}
function fail(result) { modal(`<div class="eyebrow">LET’S TRY ANOTHER</div><h2>Unable to claim</h2><p>${esc(result.error || 'Please try again.')}</p><button class="full" onclick="closeModal()">Edit Pretty ID</button>`); }
async function check() {
  if (!value || busy) return;
  busy=true; modal('<h2>Checking your ID…</h2><p>Finding your place in the collection.</p>');
  await new Promise(r=>setTimeout(r,350)); busy=false;
  if (network!=='normal') { modal(`<h2>${network==='timeout'?'Request timed out':'Request failed'}</h2><p>Your ID and redemption opportunities are unchanged.</p><button class="gold full" onclick="network='normal';check()">Restore network & retry</button>`); return; }
  const r=E.validate(value,state); if (!r.ok) { fail(r); return; }
  pending={input:r.input,route:state.route,id:crypto.randomUUID?crypto.randomUUID():String(Date.now())};
  modal(`<h2 style="font-size:22px;margin:4px 0 12px">Redeem this Pretty ID?</h2><p style="font:30px Georgia,serif;letter-spacing:3px;color:var(--gold);overflow-wrap:anywhere;margin:12px 0 18px">${esc(r.input)}</p><div class="actions"><button onclick="closeModal()">Cancel</button><button class="gold" onclick="confirmClaim()">Redeem</button></div>`);
}
async function confirmClaim() {
  if (busy || !pending) return;
  busy=true; const attempt=pending;
  $('#modal').querySelectorAll('button').forEach(b=>b.disabled=true);
  await new Promise(r=>setTimeout(r,300));
  if (network!=='normal') { busy=false; modal('<h2>Request failed</h2><p>No changes were made. Restore the network in Test studio and try again.</p><button onclick="closeModal()">OK</button>'); return; }
  if (attempt.route!==state.route) { busy=false; fail({error:'Your redemption route changed. Check availability again.'}); return; }
  const r=E.redeem(attempt.input,state,attempt.id); busy=false;
  if (!r.ok) { fail(r); return; }
  state=r.state; pending=null; save(); render();
  modal(`<div class="success">${crest(r.category,true)}<h2>Pretty ID Redeemed!</h2><div class="number">${esc(state.current)}</div><small>Your new identity is saved.</small><button class="gold full" onclick="closeModal()">OK</button></div>`);
}
function openTest() {
  modal(`<div class="eyebrow">PROTOTYPE ONLY</div><h2>Test studio</h2><label>Wealth level<select id="test-level" onchange="state.level=Number(this.value);save();render()">${[1,24,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map(l=>`<option ${state.level===l?'selected':''}>${l}</option>`).join('')}</select></label><label>SVIP level<select id="test-svip" onchange="state.svip=Number(this.value);save();render()">${[0,1,2,3,4,5,6,7].map(l=>`<option ${state.svip===l?'selected':''}>${l}</option>`).join('')}</select></label><label>SVIP entitlement<select id="test-validity" onchange="state.svipActive=this.value==='active';save();render()"><option value="active" ${state.svipActive?'selected':''}>Active</option><option value="expired" ${!state.svipActive?'selected':''}>Expired</option></select></label><label>Remaining redemptions<input type="number" min="0" max="100" value="${state.remaining}" onchange="state.remaining=Math.max(0,Math.floor(Number(this.value)||0));save();render()"></label><label>Number availability<input id="occupied" placeholder="e.g. 88"></label><button onclick="setTaken(true)">Set Taken</button> <button onclick="setTaken(false)">Set Available</button><label style="margin-top:18px">Network<select onchange="network=this.value"><option value="normal" ${network==='normal'?'selected':''}>Available</option><option value="fail" ${network==='fail'?'selected':''}>Request failed</option><option value="timeout" ${network==='timeout'?'selected':''}>Timeout</option></select></label><p class="pending">Wealth templates follow the confirmed level table: Class C LV25–40, Class B LV45–75, Class A LV85–100. Default: LV100 and 2 claims.</p><button onclick="resetTest()">Reset test data</button><p><small>Current Pretty ID: ${esc(state.current||'None')}<br>Redemption records: ${state.records.length}<br>Reward classes: ${esc(state.rewards.join(', ')||'None')}</small></p>`);
}
function resetTest() { state=E.createState(); network='normal'; value=''; pending=null; save(); render(); openTest(); }
function setTaken(t) {
  const v=$('#occupied').value.toUpperCase();
  if (!/^[A-Z]+$|^[0-9]+$/.test(v)) { alert('Enter letters or numbers only.'); return; }
  if (v===state.current) { alert('The current ID cannot be released using an availability override.'); return; }
  if (t) state.owned[v]='other'; else delete state.owned[v];
  save(); $('#occupied').value=''; $('#occupied').placeholder=`${v}: ${t?'Taken':'Available'}`;
}
if (staticReview) document.body.insertAdjacentHTML('afterbegin', `<aside class="static-review-nav" aria-label="静态评审状态"><small>静态评审状态</small><a href="?preview=redeemed" ${staticRedeemed ? 'aria-current="page"' : ''}>兑换成功</a><a href="?preview=level-locked" ${staticLevelLocked ? 'aria-current="page"' : ''}>等级不足</a></aside>`);
render();
