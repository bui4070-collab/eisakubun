/* =====================================================================
   まなびタウン v29.0：プレゼント（QRコードで おくる・うけとる）
   ・ショップ画面の「プレゼント」ボタンから ひらく
   ・おくれる もの：わたしの家の かぐ／ショップで 買える のりもの・たてもの・かざり
   ・おくると もちものから なくなる（ずかんは のこる）。うけとると ずかんに のる
   ・つかいかた：おくる人が QRコードを だして、うけとる人が カメラで よみとる
     （カメラが つかえない ときは「しゃしんで よむ」「あいことば」でも うけとれる）
   ※ qrlite.js のあとに 読みこむ。セーブは save.gift に 追加するだけ
   ===================================================================== */
(function(){
'use strict';

/* ---------- 画像（assets/images/gift/） ---------- */
const GI = './assets/images/gift/';
['gf_qr', 'gf_scan', 'gf_give', 'gf_get', 'gf_code'].forEach(k => { DEFAULT_ART[k] = GI + k + '.webp'; });
const ico = (k, cls = '') => { const s = artSrc(k); return s ? `<img class="${cls}" src="${esc(s)}" alt="">` : ''; };

/* ---------- セーブ ---------- */
function G(){
  const g = save.gift || (save.gift = {});
  g.out = g.out || []; g.got = g.got || {}; g.log = g.log || [];
  return g;
}
const now = () => Date.now();
const MAX_N = 5;

/* ---------- 種類ごとの あつかい（かぐ／のりもの／たてもの・かざり） ---------- */
const KIND = {fur:'f', veh:'v', bld:'b'}, KIND_R = {f:'fur', v:'veh', b:'bld'};
const TABS = [
  {id:'fur', n:'かぐ',     art:'ui_sofa',     k:'fur'},
  {id:'veh', n:'のりもの', art:'ui_car',      k:'veh'},
  {id:'bld', n:'たてもの', art:'ui_building', k:'bld', cat:'bld'},
  {id:'deco', n:'かざり',  art:'ui_deco',     k:'bld', cat:'deco'}
];
const defOf = (kind, id) => kind === 'fur' ? FUR(id) : ITEM(id);
/* おくれる ものか（ごほうび限定・イベント限定・0ptの ものは おくれない） */
function okDef(kind, id){
  const d = defOf(kind, id); if(!d || !((d.price || 0) > 0) || d.ev) return false;
  if(kind === 'fur') return true;
  if(kind === 'veh') return d.type === 'veh';
  return d.type === 'bld' && (d.cat === 'bld' || d.cat === 'deco');
}
function have(kind, id){
  const t = save.town; if(!t) return 0;
  if(kind === 'fur') return homeCount(id);
  if(kind === 'veh') return (t.veh || []).filter(x => x === id).length + garage().filter(x => x === id).length;
  return (t.inv || {})[id] || 0;
}
function take(kind, id, n){
  if(have(kind, id) < n) return false;
  const t = save.town;
  for(let i = 0; i < n; i++){
    if(kind === 'fur'){ if(!takeFurniture(id)) return false; }
    else if(kind === 'veh'){ let k = garage().indexOf(id); if(k >= 0) garage().splice(k, 1); else { k = t.veh.indexOf(id); if(k < 0) return false; t.veh.splice(k, 1); } }
    else { t.inv[id] = (t.inv[id] || 0) - 1; if(t.inv[id] <= 0) delete t.inv[id]; }
  }
  return true;
}
/* もどす・うけとる … かえす：しゃこに はいったか */
function put(kind, id, n){
  const t = save.town; let garaged = false;
  if(kind === 'fur'){ const H = ensureHome(); H.inv[id] = (H.inv[id] || 0) + n; }
  else if(kind === 'veh'){
    for(let i = 0; i < n; i++){ if(t.veh.length >= townCalc().vehCap){ garage().push(id); garaged = true; } else t.veh.push(id); }
  } else t.inv[id] = (t.inv[id] || 0) + n;
  return garaged;
}
function giftables(tab){
  ensureTown();
  const T = TABS.find(x => x.id === tab) || TABS[0], out = [];
  const list = T.k === 'fur' ? FURNITURE : TOWN_ITEMS.filter(i => T.k === 'veh' ? i.type === 'veh' : (i.type === 'bld' && (i.cat || 'bld') === T.cat));
  list.forEach(d => { if(!okDef(T.k, d.id)) return; const n = have(T.k, d.id); if(n > 0) out.push({id:d.id, kind:T.k, def:d, n}); });
  return out;
}

/* ---------- あいことば（QRの なかみ） ---------- */
function chk(s){ let h = 0x811c9dc5; s = s + '|manabi-gift-29'; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36).slice(-4).padStart(4, '0'); }
const cleanName = s => Array.from(String(s || '').replace(/[|\r\n\t]/g, '')).slice(0, 8).join('') || 'ともだち';
function makePayload(kind, id, n, gid){
  let nm = 'ともだち'; try{ nm = cleanName(townName()); }catch(e){}
  const body = ['MT1', gid, KIND[kind], id, n, nm].join('|');
  return body + '|' + chk(body);
}
function parsePayload(s){
  s = String(s || '').trim(); const p = s.split('|');
  if(p.length !== 7 || p[0] !== 'MT1') return null;
  if(chk(p.slice(0, 6).join('|')) !== p[6]) return {err:'bad'};
  const kind = KIND_R[p[2]], n = +p[4];
  if(!kind || !p[1] || !p[3] || !(n >= 1 && n <= MAX_N) || n !== Math.floor(n)) return {err:'bad'};
  return {gid:p[1], kind, id:p[3], n, from:p[5]};
}
const newGid = () => (now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6));

/* ---------- 画面（#gf） ---------- */
let V = null;     // {view:'top'|'send'|'qr'|'recv'|'pend'|'log', tab, sel, n, gid}
let cam = null;   // カメラ {stream, timer, pass, last}
function root(){
  let el = document.getElementById('gf');
  if(!el){ el = document.createElement('div'); el.id = 'gf'; document.body.appendChild(el); el.addEventListener('click', onClick); el.addEventListener('change', onChange); }
  return el;
}
function bar(title, back){
  return `<div class="gfBar"><button class="gfBtnR" data-g="${back ? 'back' : 'close'}">${back ? '‹ もどる' : '✕ とじる'}</button>
    <b class="gfTitle">${ico('x_gift', 'gfTi')}${title}</b>${back ? '<button class="gfBtnR x" data-g="close">✕</button>' : ''}</div>`;
}
function go(view, o){ stopCam(); V = Object.assign({}, V, o || {}, {view}); render(); }
function open(){
  ensureTown(); const el = root(); V = {view:'top', tab:'fur', sel:null, n:1}; el.classList.add('show');
  document.body.classList.add('gfOpen'); render(); try{ sound('tap'); }catch(e){}
}
function close(){
  stopCam(); const el = root(); el.classList.remove('show'); el.innerHTML = ''; V = null; document.body.classList.remove('gfOpen');
  try{ if(curScreen === 'shop') renderShop(); }catch(e){}
}
function render(){
  if(!V) return; const el = root();
  const f = {top:vTop, send:vSend, qr:vQr, recv:vRecv, pend:vPend, log:vLog}[V.view] || vTop;
  el.innerHTML = f(); el.scrollTop = 0;
  if(V.view === 'qr') drawQr();
  if(V.view === 'recv') startCam();
}

/* --- トップ --- */
function vTop(){
  const pend = G().out.length;
  return bar('プレゼント', false) + `<div class="gfWrap gfTop">
    <div class="gfHero">${ico('gf_give', 'gfBird')}<div class="gfBub">おともだちと<br>プレゼントを<br>こうかん しよう！</div></div>
    <div class="gfBigRow">
      <button class="gfBig pink" data-g="send">${ico('gf_give', 'gfBigI')}<b>おくる</b><small>QRコードを つくるよ</small></button>
      <button class="gfBig blue" data-g="recv">${ico('gf_scan', 'gfBigI')}<b>うけとる</b><small>QRコードを よみとるよ</small></button>
    </div>
    <div class="gfSmRow">
      <button class="gfSm" data-g="pend">${ico('gf_qr', 'gfSmI')}<span>おくり ちゅう</span>${pend ? `<i class="gfBadge">${pend}</i>` : ''}</button>
      <button class="gfSm" data-g="log">${ico('ui_zukan', 'gfSmI')}<span>プレゼントの きろく</span></button>
    </div>
    <p class="gfNote">おくると、じぶんの もちものから なくなるよ。<br>でも「ずかん」には ずっと のこるよ。</p>
  </div>`;
}

/* --- おくる：えらぶ --- */
function vSend(){
  const L = giftables(V.tab), sel = L.find(x => x.id === V.sel && x.kind === (TABS.find(t => t.id === V.tab) || TABS[0]).k);
  if(!sel){ V.sel = null; }
  const n = sel ? Math.min(Math.max(1, V.n), Math.min(MAX_N, sel.n)) : 1; V.n = n;
  const tabs = TABS.map(t => `<button class="${t.id === V.tab ? 'on' : ''}" data-g="tab:${t.id}">${ico(t.art, 'gfTabI')}<span>${t.n}</span></button>`).join('');
  const grid = L.length ? L.map(x => `<button class="gfIt ${sel && sel.id === x.id ? 'on' : ''}" data-g="pick:${esc(x.id)}">${picHTML(x.def)}<b>${esc(x.def.name)}</b><i class="gfCnt">×${x.n}</i></button>`).join('')
    : `<div class="gfEmpty">${ico('bird_think', 'gfEmptyI')}<p>ここには おくれる ものが ないよ。<br><small>ショップで かうと ふえるよ。</small></p></div>`;
  const panel = sel ? `<div class="gfPanel"><div class="gfPanelPic">${picHTML(sel.def)}</div><div class="gfPanelTx"><b>${esc(sel.def.name)}</b>
      <div class="gfStep"><button data-g="dec" ${n <= 1 ? 'disabled' : ''}>−</button><span>${n}<small>こ</small></span><button data-g="inc" ${n >= Math.min(MAX_N, sel.n) ? 'disabled' : ''}>＋</button></div>
      <small>もっている かず：${sel.n}（いちどに ${MAX_N}こ まで）</small></div>
      <button class="btn gold gfMake" data-g="make">${ico('gf_qr', 'gfMakeI')}QRコードを つくる</button></div>`
    : `<div class="gfPanel idle">${ico('gf_give', 'gfPanelBird')}<p>おくりたい ものを えらんでね</p></div>`;
  const foot = V.tab === 'fur' ? 'わたしの家に おいてある かぐも おくれるよ（じどうで しまうよ）' : V.tab === 'veh' ? 'はしっている のりものも おくれるよ' : 'まちに おいてある ものは、「もようがえ」で しまうと おくれるよ';
  return bar('なにを おくる？', true) + `<div class="gfWrap gfSend"><div class="gfList"><div class="gfTabs">${tabs}</div><div class="gfGrid">${grid}</div><p class="gfNote left">${foot}</p></div>${panel}</div>`;
}

/* --- QRコード --- */
function vQr(){
  const o = G().out.find(x => x.id === V.gid); if(!o){ return vTop(); }
  const d = defOf(o.kind, o.item) || {name:o.item}, code = o.payload;
  return bar('QRコード', true) + `<div class="gfWrap gfQr">
    <div class="gfQrCard"><div class="gfQrHead">${ico('gf_qr', 'gfQrI')}<span>おともだちに この QRコードを<br>よみとって もらってね</span></div>
      <div class="gfQrBox"><canvas id="gfCanvas"></canvas></div>
      <div class="gfQrItem"><span class="gfQrPic">${defOf(o.kind, o.item) ? picHTML(defOf(o.kind, o.item)) : ''}</span><b>${esc(d.name)}</b><i>×${o.n}</i></div>
      <p class="gfTip">がめんを あかるく して、QRコードが ぜんぶ うつるように してね</p></div>
    <div class="gfQrSide">
      <button class="btn green big gfDone" data-g="done">わたせたよ！</button>
      <details class="gfCode"><summary>${ico('gf_code', 'gfCodeI')}<span>あいことばで おくる</span></summary>
        <p class="gfTip">カメラが つかえない ときは、この ことばを メッセージ などで おくってね。<br>うけとる 人は「あいことばを いれる」に はりつけるよ。</p>
        <textarea id="gfCodeTx" readonly rows="3">${esc(code)}</textarea>
        <button class="btn small white" data-g="copy">${ico('gf_code', 'gfCopyI')}コピーする</button></details>
      <div class="gfQrBtns"><button class="btn small white" data-g="later">あとで</button><button class="btn small white" data-g="back_item">やっぱり もどす</button></div>
      <p class="gfNote">「わたせたよ！」を おすと、おくり ちゅうの リストから きえるよ。<br>うけとって もらえなかったら「やっぱり もどす」で もちものに もどせるよ。</p>
    </div></div>`;
}
function drawQr(){
  const o = G().out.find(x => x.id === V.gid), c = document.getElementById('gfCanvas'); if(!o || !c) return;
  try{ QRLite.draw(c, o.payload, {px:10, level:'M', minVer:3, quiet:3}); }
  catch(e){ c.replaceWith(Object.assign(document.createElement('p'), {textContent:'QRコードを つくれませんでした'})); }
}

/* --- おくり ちゅう／きろく --- */
function vPend(){
  const L = G().out.slice().reverse();
  const rows = L.length ? L.map(o => { const d = defOf(o.kind, o.item) || {name:o.item};
    return `<div class="gfRow"><span class="gfRowPic">${defOf(o.kind, o.item) ? picHTML(defOf(o.kind, o.item)) : ''}</span><div class="gfRowTx"><b>${esc(d.name)} ×${o.n}</b><small>${fmtDate(o.at)}に つくったよ</small></div>
      <div class="gfRowBtns"><button class="btn small" data-g="show:${esc(o.id)}">QRを ひらく</button><button class="btn small white" data-g="ok:${esc(o.id)}">わたせた</button><button class="btn small white" data-g="undo:${esc(o.id)}">もどす</button></div></div>`; }).join('')
    : `<div class="gfEmpty">${ico('gf_give', 'gfEmptyI')}<p>いま おくり ちゅうの プレゼントは ないよ。</p></div>`;
  return bar('おくり ちゅう', true) + `<div class="gfWrap gfListV"><p class="gfNote left">QRコードを つくると、ここに のこるよ。わたせたら「わたせた」、わたせなかったら「もどす」を おしてね。</p>${rows}</div>`;
}
function vLog(){
  const L = G().log.slice().reverse().slice(0, 40);
  const rows = L.length ? L.map(e => { const d = defOf(e.kind, e.item) || {name:e.item};
    return `<div class="gfRow"><span class="gfRowPic">${defOf(e.kind, e.item) ? picHTML(defOf(e.kind, e.item)) : ''}</span><div class="gfRowTx"><b>${esc(d.name)} ×${e.n}</b><small>${fmtDate(e.at)}　${e.t === 'send' ? 'おくった' : esc((e.who || 'ともだち') + ' から もらった')}</small></div>
      <span class="gfTag ${e.t}">${e.t === 'send' ? 'おくった' : 'もらった'}</span></div>`; }).join('')
    : `<div class="gfEmpty">${ico('gf_get', 'gfEmptyI')}<p>まだ プレゼントの きろくは ないよ。</p></div>`;
  return bar('プレゼントの きろく', true) + `<div class="gfWrap gfListV">${rows}</div>`;
}
const fmtDate = t => { const d = new Date(t); return `${d.getMonth() + 1}がつ${d.getDate()}にち`; };

/* --- うけとる --- */
function vRecv(){
  return bar('うけとる', true) + `<div class="gfWrap gfRecv">
    <div class="gfCamBox"><video id="gfVideo" playsinline muted autoplay></video><canvas id="gfFrame" class="hidden"></canvas>
      <div class="gfFrame"><i></i><i></i><i></i><i></i></div>
      <div class="gfCamMsg" id="gfCamMsg">カメラを じゅんび ちゅう…</div></div>
    <div class="gfRecvSide">${ico('gf_scan', 'gfRecvI')}
      <p class="gfTip">おともだちの QRコードを わくの なかに うつしてね</p>
      <div class="gfRecvBtns">
        <label class="btn white gfFile">${ico('gf_scan', 'gfBtnI')}しゃしんで よむ<input type="file" accept="image/*" id="gfPhoto"></label>
        <button class="btn white" data-g="manual">${ico('gf_code', 'gfBtnI')}あいことばを いれる</button>
      </div>
      <div class="gfManual hidden" id="gfManual"><textarea id="gfManualTx" rows="3" placeholder="あいことばを ここに はりつけてね"></textarea>
        <button class="btn gold" data-g="manualOk">うけとる</button></div>
    </div></div>`;
}

/* ---------- カメラ ---------- */
const setMsg = t => { const m = document.getElementById('gfCamMsg'); if(m) m.textContent = t; };
async function startCam(){
  stopCam();
  const v = document.getElementById('gfVideo'); if(!v) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ setMsg('カメラが つかえないよ。「しゃしんで よむ」か「あいことば」を つかってね'); return; }
  const mine = {stream:null, timer:0, pass:0, last:'', lastAt:0, dead:false}; cam = mine;
  try{
    const st = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720}}, audio:false});
    if(mine.dead || cam !== mine){ st.getTracks().forEach(t => t.stop()); return; }
    mine.stream = st; v.srcObject = st; await v.play().catch(() => {});
    setMsg('QRコードを さがしているよ…');
  }catch(e){
    setMsg(e && e.name === 'NotAllowedError' ? 'カメラが ゆるされていないよ。せっていで カメラを ONに してね' : 'カメラが ひらけないよ。「しゃしんで よむ」か「あいことば」を つかってね'); return;
  }
  let BD = null; try{ if('BarcodeDetector' in window) BD = new BarcodeDetector({formats:['qr_code']}); }catch(e){}
  const tick = async () => {
    if(mine.dead || cam !== mine) return;
    const c = document.getElementById('gfFrame'), vv = document.getElementById('gfVideo');
    let text = null;
    if(c && vv && vv.readyState >= 2 && vv.videoWidth){
      if(BD){ try{ const r = await BD.detect(vv); if(r && r[0] && r[0].rawValue) text = r[0].rawValue; }catch(e){ BD = null; } }
      if(text == null){
        const k = Math.min(1, 640 / Math.max(vv.videoWidth, vv.videoHeight)), w = Math.round(vv.videoWidth * k), h = Math.round(vv.videoHeight * k);
        if(c.width !== w) c.width = w; if(c.height !== h) c.height = h;
        const x = c.getContext('2d', {willReadFrequently:true}); x.drawImage(vv, 0, 0, w, h);
        try{ text = QRLite.decodeOnce(x.getImageData(0, 0, w, h), mine.pass++); }catch(e){ text = null; }
      }
    }
    if(mine.dead || cam !== mine) return;
    if(text != null && !(text === mine.last && now() - mine.lastAt < 2500)){
      mine.last = text; mine.lastAt = now();
      const r = await receive(text);
      if(r === 'ok' || mine.dead || cam !== mine) return;
    }
    mine.timer = setTimeout(tick, 110);
  };
  mine.timer = setTimeout(tick, 400);
}
function stopCam(){
  if(!cam) return; cam.dead = true; clearTimeout(cam.timer);
  try{ if(cam.stream) cam.stream.getTracks().forEach(t => t.stop()); }catch(e){}
  const v = document.getElementById('gfVideo'); if(v){ try{ v.pause(); }catch(e){} v.srcObject = null; }
  cam = null;
}
document.addEventListener('visibilitychange', () => { if(document.hidden && cam) stopCam(); else if(!document.hidden && V && V.view === 'recv' && !cam) startCam(); });

/* ---------- しゃしんから よむ ---------- */
async function readPhoto(file){
  toast('よみとっているよ…');
  let im; try{
    const url = URL.createObjectURL(file); im = new Image(); im.src = url; await im.decode(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  }catch(e){ toast('しゃしんが ひらけなかったよ'); return null; }
  const W = im.naturalWidth, H = im.naturalHeight; if(!W || !H) return null;
  const c = document.createElement('canvas'), x = c.getContext('2d', {willReadFrequently:true});
  for(const side of [1000, 700, 1400, 480]){
    const k = Math.min(1, side / Math.max(W, H)); c.width = Math.round(W * k); c.height = Math.round(H * k);
    x.drawImage(im, 0, 0, c.width, c.height);
    let r = null; try{ r = QRLite.decode(x.getImageData(0, 0, c.width, c.height)); }catch(e){}
    if(r != null) return r;
    await new Promise(r2 => setTimeout(r2, 0));
  }
  return null;
}

/* ---------- おくる ---------- */
function makeGift(){
  const T = TABS.find(t => t.id === V.tab) || TABS[0], id = V.sel, n = V.n;
  if(!id || !okDef(T.k, id) || !take(T.k, id, n)){ toast('おくれなかったよ'); return; }
  const gid = newGid(), g = G();
  g.out.push({id:gid, kind:T.k, item:id, n, at:now(), payload:makePayload(T.k, id, n, gid)});
  persist(); try{ sound('ok'); }catch(e){}
  go('qr', {gid, sel:null, n:1});
}
function finishGift(gid){
  const g = G(), o = g.out.find(x => x.id === gid); if(!o) return;
  g.out = g.out.filter(x => x.id !== gid); g.log.push({t:'send', kind:o.kind, item:o.item, n:o.n, at:now()}); g.log = g.log.slice(-60);
  persist();
}
function undoGift(gid){
  const g = G(), o = g.out.find(x => x.id === gid); if(!o) return false;
  const garaged = put(o.kind, o.item, o.n); g.out = g.out.filter(x => x.id !== gid); persist();
  try{ checkBadges(); }catch(e){}
  toast(garaged ? 'しゃこに もどしたよ' : 'もちものに もどしたよ'); return true;
}

/* ---------- うけとる ---------- */
async function receive(text){
  const P = parsePayload(text);
  if(!P){ toast('プレゼントの QRコードじゃ ないみたい'); return 'no'; }
  if(P.err){ toast('この QRコードは よめなかったよ'); return 'no'; }
  const g = G();
  if(g.out.some(x => x.id === P.gid)){ toast('これは じぶんで つくった QRコードだよ'); return 'mine'; }
  if(g.got[P.gid]){ toast('この プレゼントは もう うけとったよ'); return 'dup'; }
  if(!okDef(P.kind, P.id)){ toast('この プレゼントは まだ ひらけないみたい（アプリの バージョンが ちがうかも）'); return 'no'; }
  stopCam();
  const d = defOf(P.kind, P.id), who = esc(P.from);
  try{ sound('fan'); confetti(1800); }catch(e){}
  await dialog(`<div class="gfGot">${ico('gf_get', 'gfGotBird')}<h2 class="dlgT">${who}から<br>プレゼントが とどいたよ！</h2>
    <div class="gfGotItem"><span>${picHTML(d)}</span><b>${esc(d.name)}</b><i>×${P.n}</i></div></div>`, [{label:'ありがとう！', cls:'gold', v:1}], 'gold');
  g.got[P.gid] = now();
  const garaged = put(P.kind, P.id, P.n);
  g.log.push({t:'get', kind:P.kind, item:P.id, n:P.n, who:P.from, at:now()}); g.log = g.log.slice(-60);
  persist();
  if(P.kind !== 'fur'){ try{ discover(P.id); }catch(e){} }
  try{ checkBadges(); }catch(e){}
  const where = P.kind === 'fur' ? 'わたしの家の もちものに はいったよ' : P.kind === 'veh' ? (garaged ? 'しゃこに はいったよ（まちの 台数が いっぱい）' : 'まちを はしりだしたよ！') : 'もちものに はいったよ。まちで おいてみよう！';
  toast(`${d.name}を もらったよ！ ${where}`);
  if(V && V.view === 'recv') go('top');
  return 'ok';
}

/* ---------- タッチ ---------- */
function onClick(e){
  const b = e.target.closest('[data-g]'); if(!b || b.disabled || !V) return;
  const [a, v] = b.dataset.g.split(/:(.*)/s);
  switch(a){
    case 'close': return close();
    case 'back': return go('top');
    case 'send': return go('send');
    case 'recv': return go('recv');
    case 'pend': return go('pend');
    case 'log': return go('log');
    case 'tab': V.tab = v; V.sel = null; V.n = 1; return render();
    case 'pick': V.sel = v; V.n = 1; return render();
    case 'dec': V.n = Math.max(1, V.n - 1); return render();
    case 'inc': V.n = V.n + 1; return render();
    case 'make': return makeGift();
    case 'done': finishGift(V.gid); toast('プレゼントを わたせたね！'); try{ sound('fan'); confetti(1200); }catch(e){} return go('top');
    case 'later': return go('top');
    case 'back_item': if(confirm('プレゼントを やめて、もちものに もどす？')){ undoGift(V.gid); go('top'); } return;
    case 'show': return go('qr', {gid:v});
    case 'ok': finishGift(v); toast('わたせたね！'); return render();
    case 'undo': if(confirm('プレゼントを やめて、もちものに もどす？')){ undoGift(v); render(); } return;
    case 'copy': return copyCode();
    case 'manual': { const m = document.getElementById('gfManual'); if(m){ m.classList.toggle('hidden'); const t = document.getElementById('gfManualTx'); if(t && !m.classList.contains('hidden')) t.focus(); } return; }
    case 'manualOk': { const t = document.getElementById('gfManualTx'); if(t && t.value.trim()) receive(t.value); else toast('あいことばを いれてね'); return; }
  }
}
async function onChange(e){
  if(e.target.id !== 'gfPhoto') return;
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if(!f) return;
  const r = await readPhoto(f);
  if(r == null){ toast('QRコードが みつからなかったよ。もういちど とってみてね'); return; }
  receive(r);
}
async function copyCode(){
  const t = document.getElementById('gfCodeTx'); if(!t) return;
  try{ await navigator.clipboard.writeText(t.value); toast('コピーしたよ！'); }
  catch(e){ try{ t.removeAttribute('readonly'); t.select(); t.setSelectionRange(0, 9999); document.execCommand('copy'); t.setAttribute('readonly', ''); toast('コピーしたよ！'); }catch(e2){ toast('せんたくして コピーしてね'); } }
}

/* ---------- ショップ画面の ボタン ---------- */
function addButton(){
  const head = document.querySelector('#scr-shop .shopHead'); if(!head || document.getElementById('gfOpenBtn')) return;
  const b = document.createElement('button'); b.id = 'gfOpenBtn'; b.className = 'btn small pink gfOpenBtn';
  b.innerHTML = `${ico('x_gift', 'gfOpenI')}<span>プレゼント</span>`;
  b.addEventListener('click', open);
  const to = document.getElementById('shopToTown'); if(to) head.insertBefore(b, to); else head.appendChild(b);
}
addButton();

window.__gift29 = {open, close, parsePayload, makePayload, giftables, have, take, put, receive, okDef};
})();
