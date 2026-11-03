/* =====================================================================
   まなびタウン v4.3
   ・しんごうき（むきを かえられる・ほんとうに 色が かわる・車が とまる）
   ・コンビニ（お店）
   ・パーキング／ガソリンスタンドを 上から 見た イラストに。
     まちを 走る 車が 入ってきて とまる
   ※ app.js・facilities.js の あとに 読みこむ
   ===================================================================== */
(function(){
'use strict';
const IMG = './assets/images/v43/';

/* ---------- 絵文字を 絵として つかう（コンビニの 品物） ---------- */
const emojiArt = e => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="58" font-size="78" text-anchor="middle" dominant-baseline="middle">${e}</text></svg>`);

/* =====================================================================
   しんごうき
   ===================================================================== */
const SIG_ID = 'd_signal';
function sigSVG(dir){
  const lamps = [['lG',26],['lY',50],['lR',74]];
  const front = `
    <rect x="10" y="12" width="80" height="30" rx="8" fill="url(#sgBox)" stroke="#3b4048" stroke-width="2"/>
    ${lamps.map(([c,x]) => `<circle class="${c}" cx="${x}" cy="27" r="9"/><path d="M${x-12} 23 Q${x} 9 ${x+12} 23 L${x+10} 19 Q${x} 11 ${x-10} 19 Z" fill="#2c3036"/>`).join('')}`;
  const side = `
    <rect x="41" y="12" width="18" height="30" rx="5" fill="url(#sgBox)" stroke="#3b4048" stroke-width="2"/>
    <path d="M59 15 L74 12 L74 42 L59 39 Z" fill="#2c3036"/>
    <rect class="lS" x="70" y="17" width="5" height="20" rx="2.5"/>`;
  return `<svg class="sigSvg" viewBox="0 0 100 150" aria-hidden="true">
    <defs><linearGradient id="sgBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d96a3"/><stop offset="1" stop-color="#5d6570"/></linearGradient>
      <linearGradient id="sgPole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa3ad"/><stop offset=".5" stop-color="#d9dee3"/><stop offset="1" stop-color="#7f8892"/></linearGradient></defs>
    <ellipse cx="50" cy="141" rx="22" ry="7" fill="rgba(0,0,0,.18)"/>
    <rect x="34" y="128" width="32" height="12" rx="4" fill="#c9c3b8" stroke="#9c958a" stroke-width="1.5"/>
    <rect x="46" y="38" width="8" height="94" rx="3" fill="url(#sgPole)"/>
    <rect x="44" y="40" width="12" height="6" rx="2" fill="#6b737d"/>
    ${dir===0 ? front : side}
  </svg>`;
}
const SIG_STATIC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sigSVG(0)
  .replace('<svg class="sigSvg"', '<svg xmlns="http://www.w3.org/2000/svg"')
  .replace('class="lG"', 'fill="#1bc47d"').replace('class="lY"', 'fill="#4a4a3a"').replace('class="lR"', 'fill="#5a3030"'));
DEFAULT_ART.dc_signal = SIG_STATIC;
if(!TOWN_ITEMS.some(x => x.id===SIG_ID))
  TOWN_ITEMS.push({id:SIG_ID, type:'bld', cat:'deco', name:'しんごうき', art:'dc_signal', emoji:'🚦', price:150, lv:2, dev:6});
try{ ZUKAN_INFO[SIG_ID] = 'あお・きいろ・あかで 車に 「すすめ」「とまれ」を おしえる。まちの 画面で タッチすると むきが かわるよ。'; }catch(e){}

const sigDirs = () => save.town.sigDir || (save.town.sigDir = {});
const DIR_N = ['まえむき','よこむき（みぎ）','よこむき（ひだり）'];
const sigDir = k => sigDirs()[k] || 0;
function sigTopo(k){
  const [x,y]=k.split(',').map(Number), t=save.town, road=(a,b)=>isRoadId(t.cells[`${a},${b}`]);
  const a={n:road(x,y-1),e:road(x+1,y),s:road(x,y+1),w:road(x-1,y)}, n=Object.values(a).filter(Boolean).length;
  const zebra=isRoadId(t.cells[k]) && n===2 && ((a.e&&a.w)||(a.n&&a.s)) && ((x*7+y*3)%4===0);
  return {a,n,zebra,ok:n===4||n===3||zebra,count:n===4?4:n===3?3:zebra?2:0};
}
window.sigPlaceOK = k => sigTopo(k).ok;
function sigKeys(){
  const t = save.town, out = [];
  Object.entries(t.cells).forEach(([k,id]) => { if(id===SIG_ID) out.push(k); });
  Object.entries(t.over||{}).forEach(([k,id]) => { if(id===SIG_ID) out.push(k); });
  return out;
}
/* 色：14びょうで ひとまわり。まえむき（たての 車）と よこむき（よこの 車）は はんたい */
function phase(){
  const s = (Date.now() % 14000) / 1000;
  const v = s < 6 ? 'g' : s < 7.5 ? 'y' : 'r';
  const h = s < 7 ? 'r' : s < 12.5 ? 'g' : 'y';
  return {v, h};
}
function paintSignals(){
  const m = $('#townMap'); if(!m) return;
  const p = phase(); if(m.dataset.sv!==p.v) m.dataset.sv = p.v; if(m.dataset.sh!==p.h) m.dataset.sh = p.h;
}
setInterval(paintSignals, 400);
function drawSignals(){
  const map=$('#townMap'); if(!map) return; map.querySelectorAll('.sig49').forEach(e=>e.remove());
  const cs=parseFloat(map.style.getPropertyValue('--cell'))||60, O=0.07;
  sigKeys().forEach(k => {
    const [x,y]=k.split(',').map(Number), c=map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`); if(!c)return;
    c.querySelectorAll('.sigWrap,.overImg').forEach(e=>e.remove());
    const T=sigTopo(k); if(!T.ok){ if((save.town.over||{})[k]===SIG_ID){ delete save.town.over[k]; save.town.inv[SIG_ID]=(save.town.inv[SIG_ID]||0)+1; persist(); } return; }
    const A=T.a, P=[];   // [よこ, たて, むき(f=まえ / r=よこ右 / l=よこ左)]
    if(T.n===4){ P.push([-O,-O,'l'],[1+O,-O,'f'],[-O,1+O,'f'],[1+O,1+O,'r']); }
    else if(T.n===3){ const miss=['n','e','s','w'].find(d=>!A[d]);
      if(miss==='n') P.push([.82,-O,'f'],[-O,1+O,'l'],[1+O,1+O,'r']);
      if(miss==='s') P.push([.18,1+O,'f'],[-O,-O,'l'],[1+O,-O,'r']);
      if(miss==='w') P.push([-O,.82,'l'],[1+O,-O,'f'],[1+O,1+O,'f']);
      if(miss==='e') P.push([1+O,.18,'r'],[-O,-O,'f'],[-O,1+O,'f']); }
    else if(A.e&&A.w) P.push([.18,-O,'l'],[.82,1+O,'r']);
    else P.push([-O,.18,'f'],[1+O,.82,'f']);
    const w=cs*.4, h=w*1.5, L=c.offsetLeft, Tp=c.offsetTop;
    P.forEach(([fx,fy,d])=>{ const z=Math.floor(y+fy)*10+8;
      map.insertAdjacentHTML('beforeend',`<span class="sig49 ${d==='f'?'fv':'fh'} ${d==='l'?'flip':''}" style="left:${L+fx*cs-w/2}px;top:${Tp+fy*cs-h*.93}px;width:${w}px;height:${h}px;z-index:${z}">${sigSVG(d==='f'?0:1)}</span>`); });
  }); paintSignals();
}
/* その マスの 信号が 車の すすむ むきに 「とまれ」か */
function redFor(x, y, axis){
  const t = save.town, p = phase(), k = `${x},${y}`;
  if((t.over||{})[k]!==SIG_ID) return false;          // しんごうの ある こうさてん・おうだんほどう だけ
  const col = axis==='v' ? p.v : p.h;
  return col!=='g';
}

/* タッチで むきを かえる（まちの 画面・もようがえ 中は のぞく） */
window.addEventListener('click', e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker')) return;
  const k = `${c.dataset.x},${c.dataset.y}`, t = save.town;
  if(t.cells[k]!==SIG_ID && (t.over||{})[k]!==SIG_ID) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const T=sigTopo(k); if(!T.ok){ toast('🚦 十字路・T字路・横断歩道に おいてね'); return; } toast(`🚦 ${T.n===4?'十字路：4つ':T.n===3?'T字路：3つ':'横断歩道：2つ'}の 信号が じどうで つくよ`); return; const n = (sigDir(k) + 1) % 3; sigDirs()[k] = n; persist(); sound('tap');
  const w = c.querySelector('.sigWrap');
  if(w){ w.className = `sigWrap ${isRoadId(t.cells[k])?'onRoad':''} d${n} ${n===0?'fv':'fh'}`; w.innerHTML = sigSVG(n===0?0:1); }
  toast(`🚦 しんごうきを ${DIR_N[n]}に したよ（${n===0 ? 'たての 車' : 'よこの 車'}に あいずするよ）`);
}, true);

/* =====================================================================
   コンビニ
   ===================================================================== */
const KB = 'konbini';
DEFAULT_ART.bld_konbini = IMG + 'bld_konbini.webp';
if(!TOWN_ITEMS.some(x => x.id===KB))
  TOWN_ITEMS.push({id:KB, type:'bld', cat:'bld', name:'コンビニ', art:'bld_konbini', emoji:'🏪', price:1100, lv:3, dev:28, income:14});
const KB_FOOD = [
  ['onigiri','おにぎり','🍙',60,1.2,15], ['tea','おちゃ','🍵',50,1.1,20], ['karaage','からあげ','🍗',120,1.3,20],
  ['pudding','プリン','🍮',110,1.3,20], ['bento','おべんとう','🍱',200,1.5,30], ['oden','おでん','🍢',150,1.4,25],
  ['juice','ジュース','🧃',70,1.2,15], ['choco','チョコレート','🍫',90,1.2,20]
];
KB_FOOD.forEach(([id,n,e,price,m,min]) => { DEFAULT_ART['kb_'+id] = emojiArt(e); if(!FD('f_kb_'+id)) FOOD.push({id:'f_kb_'+id, n, price, m, min, art:'kb_'+id}); });
SHOP_FOOD[KB] = ['f_kb_onigiri','f_kb_tea','f_kb_juice','f_kb_choco','f_kb_pudding','f_kb_karaage','f_kb_oden','f_kb_bento','sand','donut'].filter(id => FD(id));
SHOPS[KB] = {n:'コンビニ', i:'🏪', greet:['いらっしゃいませ〜！','おにぎり あたためますか？','あたらしい プリン 入りましたよ！'], fur:[], only:[]};
try{ ACT_OF[KB] = 'shop'; ZUKAN_INFO[KB] = 'おにぎりや おべんとう、のみものが そろう べんりな お店。'; }catch(e){}

/* =====================================================================
   パーキング・ガソリンスタンド：上から 見た 絵 ＋ 車が とまる
   ===================================================================== */
DEFAULT_ART.lot_parking = IMG + 'lot_parking.webp';
DEFAULT_ART.lot_gas = IMG + 'lot_gas.webp';
const LOTS = {
  parking:   {art:'lot_parking', slots:[[0.43,0.40],[0.43,0.76]], min:25, max:60, rate:0.10},
  gasstation:{art:'lot_gas',     slots:[[0.50,0.31],[0.50,0.88]], min:8,  max:18, rate:0.08}
};
const FUEL = {}; // ガソリンスタンドの おかね（車ごとに 1かい）
function lotCars(){
  const L = {};
  CAR.list.forEach(c => { if(c.lot){ (L[c.lot.key] = L[c.lot.key] || [])[c.lot.slot] = {id:c.id, town:true}; } });
  try{ Object.entries((save.fac||{}).parking||{}).forEach(([k,p]) => { if(save.town.cells[k]!=='parking' || p.until < Date.now()) return;
    const a = L[k] = L[k] || []; const s = a[0] ? (a[1] ? -1 : 1) : 0; if(s >= 0) a[s] = {id:p.v, guest:true}; }); }catch(e){}
  return L;
}
/* v5.5：おなじ ばしょに 2台 とまらないように（かさなり ぼうし） */
const _lotCars55 = lotCars;
lotCars = function(){
  const L = {};
  CAR.list.forEach(c => { if(!c.lot) return; const D = LOTS[save.town.cells[c.lot.key]], a = L[c.lot.key] = L[c.lot.key] || [];
    if(!D){ c.lot = null; return; }
    if(a[c.lot.slot]){ const f = D.slots.findIndex((_,i) => !a[i]); if(f < 0){ c.lotT = 0; return; } c.lot.slot = f; }
    a[c.lot.slot] = {id:c.id, town:true}; });
  try{ Object.entries((save.fac||{}).parking||{}).forEach(([k,p]) => { if(save.town.cells[k]!=='parking' || p.until < Date.now()) return;
    const D = LOTS.parking, a = L[k] = L[k] || []; const f = D.slots.findIndex((_,i) => !a[i]); if(f >= 0) a[f] = {id:p.v, guest:true}; }); }catch(e){}
  return L;
}
function drawLots(){
  if(!save.town) return;
  const L = lotCars();
  Object.entries(save.town.cells).forEach(([k,id]) => {
    const D = LOTS[id]; if(!D) return;
    const [x,y] = k.split(','), c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(!c) return;
    c.classList.add('lotTop');
    const im = c.querySelector('.bimg'); if(im && im.tagName==='IMG' && !im.dataset.lot){ im.src = artSrc(D.art); im.dataset.lot = 1; }
    c.querySelectorAll('.lotCar').forEach(e => e.remove());
    (L[k]||[]).forEach((v, i) => { if(!v) return; const it = ITEM(v.id), sl = D.slots[i]; if(!it || !sl) return;
      const src = it.img || artSrc(it.art);
      c.insertAdjacentHTML('beforeend', src ? `<img class="lotCar ${i%2?'b':''}" style="left:${sl[0]*100}%;top:${sl[1]*100}%" src="${esc(src)}" alt="">`
        : `<span class="lotCar emo" style="left:${sl[0]*100}%;top:${sl[1]*100}%">${it.emoji||'🚗'}</span>`); });
    if(id==='gasstation' && (L[k]||[]).some(v => v && !FUEL[k+'|'+v.id])) c.insertAdjacentHTML('beforeend', '<span class="facOv ready lotCar coin">⛽</span>');
  });
}
function adjLot(c){
  const t = save.town;
  for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
    const k = `${c.x+dx},${c.y+dy}`, id = t.cells[k], D = LOTS[id]; if(!D) continue;
    const used = new Set(); (lotCars()[k]||[]).forEach((v,i) => { if(v) used.add(i); });
    const free = D.slots.map((_,i) => i).filter(i => !used.has(i));
    if(free.length) return {key:k, slot:free[0], D};
  }
  return null;
}
const _moveCars43 = moveCars;
moveCars = function(){
  if(!save.town || !CAR.list) return _moveCars43.apply(this, arguments);
  const all = CAR.list, parked = all.filter(c => c.lot), act = all.filter(c => !c.lot);
  let ch = false;
  // とまっていた 車が 出ていく
  parked.forEach(c => { if(--c.lotT > 0) return;
    const [lx,ly] = c.lot.key.split(',').map(Number), out = [[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy]) => [lx+dx, ly+dy]).find(([x,y]) => isRoadId(save.town.cells[`${x},${y}`]));
    if(out){ c.x = out[0]; c.y = out[1]; c.py = c.y; }
    delete FUEL[c.lot.key+'|'+c.id]; c.lot = null; c.cool = 25; c.wait = 1; if(c.el) c.el.style.visibility = ''; placeCar(c, true); ch = true; });
  // しんごう：すすむ 先が 赤なら まつ
  act.forEach(c => { if(c.wait > 0) return; const ax = c.dx ? 'h' : 'v'; if(redFor(c.x + c.dx, c.y + c.dy, ax) && !redFor(c.x, c.y, ax)) c.wait = 1; });
  CAR.list = act;
  try{ _moveCars43.apply(this, arguments); } finally { CAR.list = CAR.list.concat(parked.filter(c => c.lot)); parked.filter(c => !c.lot).forEach(c => { if(!CAR.list.includes(c)) CAR.list.push(c); }); }
  // パーキング・ガソリンスタンドに 入る
  act.forEach(c => { if(c.cool > 0){ c.cool--; return; } if(c.wait > 0) return;
    const L = adjLot(c); if(!L || Math.random() > L.D.rate) return;
    if(save.town.cells[L.key]==='parking' && (window.NOPARK623 && NOPARK623.has(c.id) || ITEM(c.id)?.ship || ITEM(c.id)?.air)) return;
    c.lot = {key:L.key, slot:L.slot}; c.lotT = rint(L.D.min, L.D.max); if(c.el) c.el.style.visibility = 'hidden'; ch = true; });
  if(ch) drawLots();
};
const _buildCars43 = buildCars;
buildCars = function(){ const o = _buildCars43.apply(this, arguments); CAR.list.forEach(c => { c.lot = null; c.cool = rint(0, 10); }); return o; };

/* ガソリンスタンドを タッチ */
async function openGas(key){
  const L = (lotCars()[key]||[]).filter(Boolean), g = (save.town.glv||{})[key] || 0;
  const due = L.filter(v => !FUEL[key+'|'+v.id]);
  const fee = v => Math.min(90, Math.round((15 + (ITEM(v.id)?.price||300)/25) * (1 + 0.25*g) / 5) * 5);
  const sum = due.reduce((a,v) => a + fee(v), 0);
  const v = await dialog(`<div class="facHead"><img src="${esc(artSrc('bld_gasstation'))}" alt=""><div><h2 class="dlgT">⛽ ガソリンスタンド</h2><small>${L.length ? `いま ${L.length}台が きゅうゆ ちゅう` : 'いまは 車が いないよ。まちを 走る 車が ときどき 入ってくるよ'}</small></div></div>`
    + (L.length ? `<div class="whoRow">${L.map(v => `<div class="whoIt">${picHTML(ITEM(v.id))}<span>${esc(ITEM(v.id)?.name||'')}</span><small>${FUEL[key+'|'+v.id] ? '✅ もらった' : '⛽ まんタン！'}</small></div>`).join('')}</div>` : '')
    + '<p class="dlgP facNote">車が とまったら タッチして りょうきんを もらおう！<br>グレードアップすると りょうきんが ふえるよ</p>',
    (due.length ? [{label:`🪙 りょうきんを もらう（+${sum}pt）`, cls:'gold', v:'fee'}] : []).concat([{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', cls:'white', v:null}]), 'wide');
  if(v==='fee'){ due.forEach(x => FUEL[key+'|'+x.id] = 1); givePts(sum, 'ガソリンスタンドの りょうきん'); persist(); sound('ok'); toast(`🪙 +${sum}pt もらったよ！`); drawLots(); }
  if(v==='grade') openBuilding(key);
}
window.addEventListener('click', async e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker')) return;
  const key = `${c.dataset.x},${c.dataset.y}`; if(save.town.cells[key]!=='gasstation') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(await tryScene('gasstation')) return;
  openGas(key);
}, true);

/* ---------- 描きなおし ---------- */
const _renderMap43 = renderMap;
renderMap = function(){ const o = _renderMap43.apply(this, arguments); try{ drawSignals(); drawLots(); }catch(err){ console.warn(err); } return o; };
setInterval(() => { if(curScreen==='town' && !document.hidden) try{ drawLots(); }catch(e){} }, 5000);
})();
/* =====================================================================
   まなびタウン v4.4
   ① トレイの「しまう」で かずが ふえる ふぐあいを なおす（まち・わたしの家）
   ② つかいかたの せつめい：ふきだしは 上か 下に こてい
   ③ 住民の 問題の ポイントは べんきょうより すくなめ
   ④ 住民・イベントの 問題：あまり やっていない 単元 ＞ にがて ＞ そのほか
   ※ app.js・facilities.js・v43.js・eng_more.js の あとに 読みこむ
   ===================================================================== */
(function(){
'use strict';

/* ---------- ① しまう ---------- */
$('#btnStore').onclick = () => {
  if(!hand) return; const t = save.town;
  if(hand.from==='map'){
    if(t.res.some(r => r.home===hand.key)){ toast('じゅうみんが すんでいるので しまえないよ'); return; }
    t.inv[hand.id] = (t.inv[hand.id]||0) + 1;          // マップから もった ものだけ もどす
  }                                                    // トレイから もった ものは まだ へっていないので そのまま
  hand = null; persist(); renderTray();
};
$('#btnHomeStore').onclick = () => {
  const H = ensureHome();
  if(homeHand){ if(homeHand.from==='map') H.inv[homeHand.id] = (H.inv[homeHand.id]||0) + 1; homeHand = null; }
  else if(H.items[homeSel]){ const it = H.items.splice(homeSel, 1)[0]; H.inv[it.id] = (H.inv[it.id]||0) + 1; homeSel = -1; }
  persist(); renderMyHome();
};

/* ---------- ② せつめいの ふきだしを こてい ---------- */
tutPlace = function(){
  const D = tutData(), s = TUT[D.i], L = $('#tutLayer'); if(!s || !L) return;
  const bub = L.querySelector('.tutBub'), hole = L.querySelector('.tutHole'); if(!bub) return;
  const tgt = $(s.sel); let r = tgt ? tgt.getBoundingClientRect() : null; if(r && (r.width < 2 || r.height < 2)) r = null;
  const pad = 8;
  if(hole && r) Object.assign(hole.style, {left:(r.left-pad)+'px', top:(r.top-pad)+'px', width:(r.width+pad*2)+'px', height:(r.height+pad*2)+'px'});
  if(bub.dataset.fix !== String(D.i)){            // ステップの はじめに 1かいだけ きめる（スクロールしても うごかない）
    bub.dataset.fix = String(D.i);
    const atTop = !r || (r.top + r.height/2) > innerHeight*0.5;
    bub.classList.remove('below','above'); bub.classList.toggle('fixTop', atTop); bub.classList.toggle('fixBot', !atTop);
    bub.style.top = ''; bub.style.bottom = '';
  }
  TU.rect = r;
};

/* ---------- ③ 住民の 問題の ポイント ---------- */
const RES_CH = /の (クイズ|もんだい)に ちょうせん$/, RES_OK = /の (クイズ|もんだい)に せいかい$/;
const _givePts44 = givePts;
givePts = function(p, why){
  const w = String(why||'');
  if(p > 0 && RES_CH.test(w)) p = Math.min(2, Math.max(1, Math.round(p/7)));       // 10〜15 → 2
  else if(p > 0 && RES_OK.test(w)) p = Math.min(7, Math.max(4, Math.round(p/7)));  // 40〜45 → 6
  return _givePts44.call(this, p, why);
};

/* ---------- ④ 住民・イベントの 問題の えらびかた ---------- */
const unitN = k => mSave().stats[k]?.n || 0;
const kanjiN = q => { const s = save.stats?.[q.id]; if(!s) return 0; return (s.r?.[0]||0) + (s.r?.[1]||0) + (s.w?.[0]||0) + (s.w?.[1]||0); };
const UNIT_NAME = k => MATH_UNITS[k]?.n || '';
function levelPool(lvMap, filter){
  const ks = Object.keys(lvMap).filter(k => MATH_UNITS[k] && (!filter || filter(k)));
  const played = ks.filter(k => unitN(k) > 0); const top = played.length ? Math.max(...played.map(k => lvMap[k])) : Math.min(...ks.map(k => lvMap[k]));
  return ks.filter(k => lvMap[k] <= top);
}
function rareCands(){
  const out = [];
  const mathLv = Object.fromEntries(Object.entries(MATH_UNITS).filter(([k,u]) => typeof u.g==='number').map(([k,u]) => [k, u.g]));
  levelPool(mathLv).forEach(k => out.push({kind:'math', u:k, n:unitN(k)}));
  levelPool(SOC_LV).forEach(k => out.push({kind:'soc', u:k, n:unitN(k)}));
  levelPool(SCI_LV).forEach(k => out.push({kind:'sci', u:k, n:unitN(k)}));
  levelPool(EK_LV).forEach(k => out.push({kind:'ek', u:k, n:unitN(k)}));
  // かんじは 学年ごとに 1つの 単元として あつかう（かずは 問題が こまかいので 1/3）
  const byG = {}; BUILTIN.concat(customQs||[]).forEach(q => { const g = q.grade || 0; (byG[g] = byG[g] || []).push(q); });
  Object.entries(byG).forEach(([g, L]) => out.push({kind:'kanji', u:'kanji'+g, n:Math.round(L.reduce((a,q) => a + kanjiN(q), 0)/3), list:L}));
  return out;
}
function pickRare(){
  const M = mqMem(), C = rareCands(); if(!C.length) return null;
  const minN = Math.min(...C.map(c => c.n));
  const wt = c => (1 / Math.pow(1 + c.n - minN, 1.4)) * (M.kinds[0]===c.kind ? 0.3 : M.kinds[1]===c.kind ? 0.7 : 1);
  for(let tries = 0; tries < 30; tries++){
    let x = Math.random() * C.reduce((a,c) => a + wt(c), 0), c = C[0];
    for(const it of C){ x -= wt(it); if(x <= 0){ c = it; break; } }
    let m = null;
    if(c.kind==='kanji'){ const L = c.list.slice().sort((a,b) => kanjiN(a) - kanjiN(b) || Math.random() - .5).slice(0, 12); m = kanjiMQ(choice(L), false); }
    else { try{ m = mqFromP(MATH_UNITS[c.u].gen(), c.u); }catch(e){ m = null; } }
    if(!m || M.recent.includes(m.key)) continue;
    const nm = c.kind==='kanji' ? 'かんじ' : UNIT_NAME(c.u);
    m.html = `<div class="weakTag rareTag">🌱 ひさしぶりの たんげん${nm ? '：' + esc(nm) : ''}</div>` + m.html;
    noteMQ(m, c.kind); return m;
  }
  return null;
}
function pickWeak(){
  const M = mqMem(), W = weakItems(); if(!W.length) return null;
  const sc = it => (M.seen[it.key]||0) + (M.kinds.slice(0,2).includes(it.kind) ? 3e12 : 0) + Math.random()*6e4;
  for(const it of W.sort((a,b) => sc(a) - sc(b)).slice(0, 5)){ const m = weakToMQ(it); if(m){ noteMQ(m, it.kind); return m; } }
  return null;
}
const _makeMQ44 = makeMQ;
makeMQ = function(opt={}){
  if(opt && opt.weakOnly) return _makeMQ44(opt);                // にがて ボスなどは いままで どおり
  const hasW = weakItems().length > 0;
  const x = Math.random();
  // あまり やっていない 単元 55% ＞ にがて 30% ＞ そのほか 15%（にがてが ない ときは 70% ／ 30%）
  const order = hasW ? (x < 0.55 ? ['rare','weak'] : x < 0.85 ? ['weak','rare'] : ['any'])
                     : (x < 0.70 ? ['rare'] : ['any']);
  for(const o of order){ const m = o==='rare' ? pickRare() : o==='weak' ? pickWeak() : null; if(m) return m; }
  // そのほか：いままでの えらびかた（にがては のぞく）
  const W = weakItems; let m;
  try{ weakItems = () => []; m = _makeMQ44(opt); } finally { weakItems = W; }
  return m;
};
})();
/* =====================================================================
   まなびタウン v4.5
   ・ハナは「わたしの家」の おきゃくさんに えらばない
   ・高層ビル：100かい タワー攻略（つづきから できる）
   ・運動会 Lv5／タワー Lv8、シマくんの かいほう説明
   ・能力の実：住民の 5つの 能力を 何度でも そだてる
   ===================================================================== */
(function(){
'use strict';
const townLevel = () => (save.town?.lv||0) + 1;

/* ---------- ハナは おきゃくさんに しない ---------- */
const _maybeVisit45 = maybeVisit;
maybeVisit = function(){
  const H = ensureHome();
  if(H.visit){ const old = save.town?.res.find(r => r.id===H.visit.id); if(old && SP(old.sp).human) H.visit = null; }
  const humans = (save.town?.res||[]).filter(r => SP(r.sp).human), hold = [];
  try{
    humans.forEach(r => { const i = save.town.res.indexOf(r); if(i>=0){ hold.push([i,r]); save.town.res.splice(i,1); } });
    return _maybeVisit45.apply(this, arguments);
  } finally { hold.sort((a,b)=>a[0]-b[0]).forEach(([i,r]) => save.town.res.splice(i,0,r)); }
};

/* =====================================================================
   能力の実
   ===================================================================== */
const FRUITS = {
  work: {n:'ちからの実', i:'🍎', c:'#E8505B', d:'はたらく能力 +1'},
  biz:  {n:'しょうばいの実', i:'🍊', c:'#F39B32', d:'しょうばい能力 +1'},
  know: {n:'ちしきの実', i:'🫐', c:'#5966C8', d:'ちしき能力 +1'},
  pop:  {n:'にんきの実', i:'🍑', c:'#F28EAE', d:'にんき能力 +1'},
  drive:{n:'うんてんの実', i:'🍋', c:'#E5C83D', d:'うんてん能力 +1'}
};
Object.keys(FRUITS).forEach(k=>{ FRUITS[k].art='fruit_'+k; DEFAULT_ART['fruit_'+k]='./assets/images/v49/fruit_'+k+'.webp'; });
const frImg=(k,cls='frIc')=>`<img class="${cls}" src="${esc(artSrc('fruit_'+k))}" alt="">`;
function fruitBag(){ const b = save.fruits || (save.fruits = {}); Object.keys(FRUITS).forEach(k => b[k] = b[k]||0); return b; }
function addFruit(k, n=1, why=''){ if(!FRUITS[k]) return; const B=fruitBag(); B[k]+=n; persist(); toast(`${FRUITS[k].n} ×${n}を てにいれた！${why?'（'+why+'）':''}`); }
const randomFruit = () => choice(Object.keys(FRUITS));
function fruitReason(why){
  const w=String(why||'');
  if(/学校|じゅぎょう/.test(w)) return ['know',.18];
  if(/公園|運動会/.test(w)) return ['work',.16];
  if(/ホテル|なかよし|ずかん/.test(w)) return ['pop',.15];
  if(/パーキング|ガソリン|こうつう/.test(w)) return ['drive',.16];
  if(/お店|しょうばい|うりあげ/.test(w)) return ['biz',.12];
  if(/しゅうかく|畑/.test(w)) return [randomFruit(),.17];
  if(/病院|けんこう/.test(w)) return [randomFruit(),.14];
  if(/イベント|ボス|クイズ|もんだい/.test(w)) return [randomFruit(),.08];
  return null;
}
const _givePts45 = givePts;
givePts = function(p, why){ const out=_givePts45.call(this,p,why); if(p>0){ const q=fruitReason(why); if(q && Math.random()<q[1]) setTimeout(()=>addFruit(q[0],1),350); } return out; };

function fruitPanel(r){ const B=fruitBag(); return `<div class="fruitPanel"><b>🌱 能力の実で そだてる</b><small>あげるたびに 能力が +1。何度でも そだつよ！</small><div class="fruitGrid">${ABILITIES.map(a=>{const f=FRUITS[a.id];return `<button data-feed="${r.id}|${a.id}" ${B[a.id]? '' : 'disabled'} style="--fc:${f.c}">${frImg(a.id)}<span>${f.n}</span><b>×${B[a.id]}</b><small>${a.i}${a.n} ${(r.ab[a.id]||0)} → ${(r.ab[a.id]||0)+1}</small></button>`;}).join('')}</div></div>`; }
function attachFruit(rid){ const r=save.town?.res.find(x=>x.id===rid); if(!r || SP(r.sp).human) return; const body=$('#dlgBody'); if(!body || body.querySelector('.fruitPanel')) return; body.insertAdjacentHTML('beforeend',fruitPanel(r)); }
/* 住民カードを ひらいた あとに 実の パネルを 追加 */
document.addEventListener('click', e=>{ const b=e.target.closest('#resGrid .resCard'); if(b) setTimeout(()=>attachFruit(b.dataset.id),30); }, true);
document.addEventListener('click', async e=>{ const b=e.target.closest('[data-feed]'); if(!b) return; e.stopImmediatePropagation(); const [rid,k]=b.dataset.feed.split('|'), r=save.town.res.find(x=>x.id===rid), B=fruitBag(); if(!r||!B[k]) return;
  B[k]--; r.ab[k]=(r.ab[k]||0)+1; persist(); sound('fan'); confetti(700); const f=FRUITS[k], a=ABILITIES.find(x=>x.id===k);
  await dialog(`<div class="dlgArt big">${frImg(k,'')}</div><h2 class="dlgT">${esc(r.name)}が ${f.n}を たべた！</h2><p class="dlgP">${a.i} ${a.n}が <b>${r.ab[k]}</b>に あがったよ！<br>そだてるほど、まちでの かつやくが 大きくなるよ。</p>`,[{label:'やったね！',cls:'gold',v:1}],'gold'); renderCurrent();
},true);

/* =====================================================================
   v4.9 高層ビル：100かい タワー（つくりなおし）
   ・1かい せいかい → 1かい 上へ。まちがい／じかんぎれ → 1かいから
   ・とちゅうで やめると その かいから つづき
   ・上の かいほど むずかしい 問題・みじかい じかん
   ・ふしめの ごほうびは はじめて とうたつした ときだけ（2かいめ からは すこし）
   ===================================================================== */
const IMG49='./assets/images/v49/';
const CROWN='sky_crown';
Object.assign(DEFAULT_ART,{sky_crown:IMG49+'sky_crown.webp',ft_sky_crown:IMG49+'sky_crown.webp',fs_sky_crown:IMG49+'sky_crown.webp',itm_superletter:IMG49+'itm_superletter.webp',tower_medal:IMG49+'tower_medal.webp',tower_big:IMG49+'tower_big.webp'});
if(!FURNITURE.some(f=>f.id===CROWN)) FURNITURE.push({id:CROWN,name:'天空の おうかん',art:'sky_crown',type:'fur',price:9999,lv:8,sty:40,special:true});
else { const f=FURNITURE.find(f=>f.id===CROWN); f.art='sky_crown'; f.sty=40; }
const TW_TOP=100;
function towerData(){ const T=save.tower||(save.tower={}); T.floor=Math.max(1,Math.min(TW_TOP,T.floor||1)); T.best=T.best||0; T.first=T.first||[]; T.clears=T.clears||0; T.tries=T.tries||0;
  if(T.done){ T.done=false; T.floor=1; if(!T.first.includes(100)) T.first.push(100); T.clears=Math.max(1,T.clears); }  // むかしの データ
  delete T.rewards; return T; }
const twImg=(k,cls='twIc')=>`<img class="${cls}" src="${esc(artSrc(k))}" alt="">`;
const twSec=f=>f<=20?30:f<=40?27:f<=60?24:f<=80?21:18;
const twBand=f=>f<=25?1:f<=50?2:f<=75?3:4;
/* ごほうび：[ばしょ, はじめて, 2かいめ いこう] */
function twReward(f){
  if(f===100) return {first:[['superletter',1],['crown',1],['rankbook',3],['fruitAll',3],['pt',1000]], again:[['superletter',1],['fruitAll',1],['pt',500]]};
  if(f%25===0) return {first:[['goldletter',2],['rankbook',1],['fruitAll',1],['pt',f*4]], again:[['fruit',2],['pt',f*2]]};
  if(f%10===0) return {first:[['fruit',2],['goldletter',f>=50?1:0],['pt',f*3]], again:[['fruit',1],['pt',f]]};
  if(f%5===0) return {first:[['pt',f*2]], again:[['pt',Math.round(f/2)]]};
  return null;
}
const RW_INFO={superletter:['itm_superletter','超レアかくていレター'],crown:['sky_crown','天空の おうかん'],rankbook:['itm_rankbook','ランクアップの本'],goldletter:['itm_goldletter','きらきらレター'],fruitAll:['fruit_know','能力の実 5しゅるい'],fruit:['fruit_work','能力の実'],pt:['tower_medal','ポイント']};
function rwHTML(list){ return `<div class="twRw">${list.filter(([k,n])=>n>0).map(([k,n])=>{const [a,nm]=RW_INFO[k];return `<span>${twImg(a)}<b>${nm}</b><small>${k==='pt'?`+${nf(n)}pt`:`×${n}`}</small></span>`;}).join('')}</div>`; }
function giveRw(list){ const t=save.town; let fr=[];
  list.forEach(([k,n])=>{ if(!n) return;
    if(k==='superletter') save.superLetter=(save.superLetter||0)+n;
    if(k==='crown'){ const H=ensureHome(); H.inv[CROWN]=(H.inv[CROWN]||0)+n; }
    if(k==='rankbook') t.bag.rankbook=(t.bag.rankbook||0)+n;
    if(k==='goldletter') t.bag.goldletter=(t.bag.goldletter||0)+n;
    if(k==='fruitAll') Object.keys(FRUITS).forEach(x=>fruitBag()[x]+=n);
    if(k==='fruit') for(let i=0;i<n;i++){ const x=randomFruit(); fruitBag()[x]++; fr.push(x); }
    if(k==='pt') addPoints(n,'100かいタワー ごほうび',true); });
  persist(); return fr; }
function nextRw(T){ for(let f=T.floor;f<=TW_TOP;f++){ const r=twReward(f); if(r) return [f,T.first.includes(f)?r.again:r.first,T.first.includes(f)]; } return null; }
/* ---------- もんだい ---------- */
const twUsed=new Set();
function towerQ(f){
  const band=twBand(f), cand=[];
  Object.entries(MATH_UNITS).forEach(([k,u])=>{ const lv=typeof u.g==='number'?u.g-2:(SOC_LV[k]||SCI_LV[k]||EK_LV[k]||0); if(lv<1) return;
    if(band===1?lv===1:band===2?lv<=2&&lv>=1:band===3?lv>=2:lv>=3) cand.push(k); });
  for(let i=0;i<40;i++){
    if(Math.random()<.18){ const L=BUILTIN.filter(q=>q.grade>=3); const q=choice(L); const m=kanjiMQ(q,false); if(!twUsed.has(m.key)){ twUsed.add(m.key); return m; } continue; }
    const k=choice(cand.length?cand:Object.keys(MATH_UNITS)); let m=null; try{ m=mqFromP(MATH_UNITS[k].gen(),k); }catch(e){}
    if(m && m.opts && m.opts.length>=2 && !twUsed.has(m.key)){ twUsed.add(m.key); return m; } }
  const m=makeMQ({}); return m;
}
function hisBonus(m){
  const h=String(m.html||''), t=h.replace(/<[^>]+>/g,' ');
  if(/class="hissan"/.test(h)) return 15;
  if(/\d{2,}\s*[×÷]\s*\d{2,}|\d{3,}\s*[×÷]\s*\d|\d{3,}\s*[＋+−\-]\s*\d{3,}|\d+\.\d+\s*[×÷＋+−\-]|[×÷＋+−\-]\s*\d+\.\d+/.test(t)) return 12;
  return 0;
}
function twAsk(m,f,resume){
  return new Promise(res=>{
    const hx=hisBonus(m), sec=twSec(f)+hx, ans=m.ansF||m.ans, id='tw'+Date.now(); let left=resume!=null?Math.max(3,Math.min(sec,resume)):sec, end=false;
    const fin=v=>{ if(end) return; end=true; clearInterval(tm); $('#dlg').classList.remove('show'); res(v); };
    dialog(`<div class="twQHead">${twImg('tower_big','twQTower')}<div><b>${f}<small>かい</small></b><span>${'★'.repeat(twBand(f))}${'☆'.repeat(4-twBand(f))}</span></div><div class="twTime"><i id="${id}b" style="width:${left/sec*100}%"></i><em id="${id}">${left}</em></div></div>${resume!=null?'<div class="hisTag51 resume61">⏸ やめた ときの 問題の つづきだよ（のこり じかんも そのまま）</div>':''}${hx?`<div class="hisTag51">✏️ ひっさん タイム ＋${hx}びょう</div>`:''}${m.html}${m.say&&!/data-say/.test(m.html)?sayBtn(m.say):''}`,
      m.opts.map(o=>({label:esc(o),cls:'white big',v:o})).concat([{label:'ここで やめる（つぎも この 問題から）',cls:'white twQuit',v:'__quit'}]),'wide quiz towerQuiz').then(v=>{ if(end) return; end=true; clearInterval(tm);
        if(v==='__quit'||v==null) return res('quit'); const ok=v===ans; sound(ok?'ok':'ng'); if(m.wk&&ok)delWeak(m.wk); if(m.kq)addStat(m.kq,'read',ok,1); persist(); res(ok?'ok':'ng'); });
    const tm=setInterval(()=>{ left--; try{ const P=save.tower&&save.tower.pend; if(P){ P.left=left; persist(); } }catch(e){} const e=$('#'+id), b=$('#'+id+'b'); if(e) e.textContent=Math.max(0,left); if(b){ b.style.width=Math.max(0,left/sec*100)+'%'; b.classList.toggle('hurry',left<=5); }
      if(left<=0){ sound('ng'); fin('time'); } },1000);
  });
}
/* ---------- ロビー ---------- */
function lobbyHTML(){
  const T=towerData(), pct=Math.round((T.floor-1)/(TW_TOP-1)*100), bp=Math.round(Math.max(0,T.best-1)/(TW_TOP-1)*100), nx=nextRw(T);
  return `<div class="twLobby"><div class="twBuild">${twImg('tower_big','twBig')}<div class="twMeter"><i class="best" style="height:${bp}%"></i><i class="now" style="height:${pct}%"></i><em style="bottom:${pct}%">${T.floor}F</em></div>
    <div class="twMarks">${[100,75,50,25].map(f=>`<span style="bottom:${(f-1)/(TW_TOP-1)*100}%" class="${T.first.includes(f)?'got':''}">${f}F</span>`).join('')}</div></div>
   <div class="twInfo"><h2>100かい タワー</h2><div class="twNow"><b>${T.floor}</b><small>かいから スタート</small></div>
    <div class="twStat"><span>さいこう<b>${T.best}F</b></span><span>せいは<b>${T.clears}回</b></span></div>
    ${nx?`<div class="twNext"><small>つぎの ごほうび：<b>${nx[0]}かい</b>${nx[2]?'（2かいめ）':''}</small>${rwHTML(nx[1])}</div>`:''}
   </div></div>
   <div class="twRule"><span>⏳ 1もん ${twSec(T.floor)}びょう（ひっさんは ＋15）</span><span>✔ せいかいで 1かい 上へ</span><span>✖ まちがい・じかんぎれは 1かいから</span><span>⏸ やめても つぎは 同じ 問題の つづきから</span></div>
   <div class="twGoal">${twImg('itm_superletter')}<div><b>100かいの ごほうび</b><small>超レアかくていレター（まいかい）・天空の おうかん（はじめて）</small></div></div>`;
}
async function towerLobby(key){
  if(townLevel()<8){ await dialog(`<div class="dlgArt big">${twImg('tower_big','twBigS')}</div><h2 class="dlgT">タワーは まちLv8から</h2><p class="dlgP">まちを もっと 大きくすると シマくんが おしえてくれるよ！</p>`); return; }
  const T=towerData();
  const v=await dialog(lobbyHTML(),[{label:`${T.floor}かいから のぼる！`,cls:'gold',v:'start'},...(T.floor>1?[{label:'1かいから やりなおす',cls:'white',v:'reset'}]:[]),...(key?[{label:'⬆ ビルを グレードアップ',cls:'white',v:'grade'}]:[]),{label:'とじる',v:null}],'wide towerDlg');
  if(v==='start') towerRun(key);
  if(v==='reset'){ T.floor=1; delete T.pend; persist(); towerLobby(key); }
  if(v==='grade') openBuilding(key);
}
async function towerRun(key){
  const T=towerData(); T.tries++; twUsed.clear(); persist();
  while(true){
    const f=T.floor; let m, rs=null;
    /* v6.1：とちゅうで やめても、つぎは かならず 同じ 問題から（とくいな 問題が 出るまで やりなおす ずるを ふせぐ） */
    if(T.pend && T.pend.f===f && T.pend.m && T.pend.m.opts){ m=T.pend.m; rs=T.pend.left; }
    else { m=towerQ(f); T.pend={f, m:JSON.parse(JSON.stringify(m)), left:null}; persist(); }
    const r=await twAsk(m,f,rs);
    if(r!=='quit'){ delete T.pend; persist(); }
    if(r==='quit'){ persist(); toast(`${f}かいで きろくを ほぞんしたよ`); return towerLobby(key); }
    if(r!=='ok'){ T.floor=1; persist();
      await dialog(`<div class="dlgArt">${twImg('tower_big','twBigS')}</div><h2 class="dlgT">${r==='time'?'じかんぎれ！':'おしい！'}　${f}かいで ストップ</h2><p class="dlgP">${r==='time'?'じかん ないに こたえられなかったよ。':`こたえは <b>${esc(m.ansF||m.ans)}</b> だったよ。`}<br><b>つぎは 1かいから ちょうせん！</b><br><small>さいこう きろく ${T.best}かいは のこるよ</small></p>`,[{label:'もういちど！',cls:'gold',v:1}]);
      return towerLobby(key); }
    T.best=Math.max(T.best,f); const R=twReward(f);
    if(f>=TW_TOP){ const first=!T.first.includes(100), list=first?R.first:R.again; if(first)T.first.push(100); T.clears++; T.floor=1; giveRw(list); persist(); await towerFinale(first,T.clears); confetti(3000);
      await dialog(`<div class="dlgArt big">${twImg('itm_superletter','twBigS')}</div><h2 class="dlgT">100かい せいは！</h2><p class="dlgP">すごい！ タワーの てっぺんに とうちゃく！${first?'<br><b>はじめての せいは ボーナス！</b>':''}</p>${rwHTML(list)}<p class="dlgP facNote">超レアかくていレターは「住民」の ページで つかえるよ。<br>${first?'天空の おうかんは わたしの家の「もようがえ」で かざれるよ。<br>':''}つぎは また 1かいから ちょうせんできるよ。</p>`,[{label:'うけとる！',cls:'gold',v:1}],'gold');
      return towerLobby(key); }
    T.floor=f+1; persist();
    if(R){ const first=!T.first.includes(f), list=first?R.first:R.again; if(first)T.first.push(f); giveRw(list); sound('fan'); confetti(first&&f%25===0?2000:900);
      const nx=await dialog(`<div class="dlgArt">${twImg('tower_medal','twBigS')}</div><h2 class="dlgT">${f}かい とうたつ！</h2>${first?'<p class="dlgP"><b>はじめて とうたつ ボーナス！</b></p>':''}${rwHTML(list)}<p class="dlgP">つぎは ${T.floor}かい！</p>`,[{label:'つぎへ のぼる',cls:'gold',v:1},{label:'ここで やめる',cls:'white',v:'quit'}]);
      if(nx==='quit'){ toast(`${T.floor}かいで きろくを ほぞんしたよ`); return towerLobby(key); } }
  }
}
/* ---------- 100かい せいはの ごうかな えんしゅつ ---------- */
function towerFinale(first,n){
  return new Promise(res=>{
    document.getElementById('fin51')?.remove();
    const stars=[...Array(26)].map((_,i)=>`<i class="fs51" style="left:${(i*37)%100}%;top:${(i*53)%90}%;animation-delay:${(i%9)*.18}s"></i>`).join('');
    const fw=[...Array(7)].map((_,i)=>`<b class="fw51" style="left:${10+i*13}%;top:${12+(i%3)*14}%;animation-delay:${1.2+i*.35}s;--h:${i*52}"></b>`).join('');
    document.body.insertAdjacentHTML('beforeend',`<div id="fin51"><div class="sky51"></div><div class="rays51"></div>${stars}${fw}
      <img class="tw51" src="${esc(artSrc('tower_big'))}" alt=""><div class="rain51"></div>
      <img class="lt51" src="${esc(artSrc('itm_superletter'))}" alt="">${first?`<img class="cr51" src="${esc(artSrc('sky_crown'))}" alt="">`:''}
      <div class="ttl51"><span>100かい</span><b>せいは！</b><small>${first?'はじめての てっぺん！':`${n}かいめの せいは！`}</small></div>
      <div class="cast51"><img src="${esc(artSrc('bird_cheer'))}" alt=""><img src="${esc(artSrc('res_girl'))}" alt=""></div>
      <div class="tap51">タッチして すすもう</div></div>`);
    const el=document.getElementById('fin51'); sound('fan'); confetti(2500);
    const t1=setTimeout(()=>{sound('fan');confetti(2500);},1800), t2=setTimeout(()=>{sound('fan');confetti(3000);},3600);
    let ok=false; setTimeout(()=>{ok=true; el.classList.add('done');},2600);
    el.addEventListener('click',()=>{ if(!ok) return; clearTimeout(t1); clearTimeout(t2); el.classList.add('out'); setTimeout(()=>{el.remove(); res();},450); });
  });
}
/* ---------- ホームに タワーの カード（高層ビルが できたら） ---------- */
const officeKey=()=>save.town&&Object.keys(save.town.cells).find(k=>save.town.cells[k]==='office');
const _renderHome51=renderHome;
renderHome=function(){ const o=_renderHome51.apply(this,arguments);
  try{ $('#btnTower51')?.remove(); const k=officeKey(); if(k && townLevel()>=8){ const T=towerData();
    const html=`<button class="card udCard twCard51" id="btnTower51"><img src="${esc(artSrc('tower_big'))}" alt=""><div><b>100かい タワー</b><small>${T.floor>1?`${T.floor}かいから つづき・`:''}さいこう ${T.best}かい${T.clears?`・せいは ${T.clears}回`:''}</small></div><span class="udGo">ちょうせん！</span></button>`;
    const ud=$('#btnUd'); if(ud) ud.insertAdjacentHTML('afterend',html); else $('#homeExtra')?.insertAdjacentHTML('afterbegin',html); } }catch(e){ console.warn(e); }
  return o; };
document.addEventListener('click',e=>{ if(!e.target.closest('#btnTower51')) return; e.stopImmediatePropagation(); towerLobby(officeKey()); },true);
/* 高層ビルを タッチ */
window.addEventListener('click',async e=>{ if(curScreen!=='town'||townEdit||!save.town)return; const c=e.target.closest('#townMap .cell'); if(!c)return; const k=`${c.dataset.x},${c.dataset.y}`; if(save.town.cells[k]!=='office')return; e.stopImmediatePropagation();e.preventDefault(); if(await tryScene('office'))return; towerLobby(k); },true);

/* =====================================================================
   Lv5／Lv8 かいほう
   ===================================================================== */
function unlocks(){ return save.unlock45 || (save.unlock45={}); }
let unlockBusy=false;
async function unlockCheck(){ if(unlockBusy||!save.town||$('#dlg')?.classList.contains('show'))return; const U=unlocks(),lv=townLevel(); unlockBusy=true;
  try{
    if(lv>=5&&!U.ud){ U.ud=1;persist();sound('fan');confetti(1200);await dialog(`<div class="dlgArt">${picHTML({art:'bird_wave',emoji:'🐦'})}</div><h2 class="dlgT">シマくんから おしらせ！</h2><p class="dlgP"><b>Lv5で「どうぶつ運動会」が かいほうされたよ！</b><br>ホームから 1日1かい さんかできるよ。種目ごとに 住民を えらんで、となり町の チームと しょうぶしよう！</p>`,[{label:'運動会へ！',cls:'gold',v:'go'},{label:'あとで',v:null}],'gold').then(v=>{if(v==='go')udOpen();}); }
    if(lv>=8&&!U.tower){ U.tower=1;persist();sound('fan');confetti(1600);await dialog(`<div class="dlgArt">${picHTML({art:'bird_cheer',emoji:'🐦'})}</div><h2 class="dlgT">シマくんから おしらせ！</h2><p class="dlgP"><b>Lv8で「100かい タワー」が かいほうされたよ！</b><br>まちにある「高層ビル」を タッチしてね。問題に れんぞくせいかいして 100かいを めざそう！ とちゅうで やめても、つづきから できるよ。</p>`,[{label:'わかった！',cls:'gold',v:1}],'gold'); }
  } finally {unlockBusy=false;}
}
const _renderHome45=renderHome; renderHome=function(){const o=_renderHome45.apply(this,arguments); setTimeout(unlockCheck,120); setTimeout(lockUd,10); return o;};
const _renderTown45=renderTown; renderTown=function(){const o=_renderTown45.apply(this,arguments); setTimeout(unlockCheck,120); return o;};
function lockUd(){ const b=$('#btnUd'); if(!b)return; const locked=townLevel()<5; b.classList.toggle('locked45',locked); if(locked){const s=b.querySelector('small');if(s)s.textContent='🔒 まちLv5で かいほう';} }
window.addEventListener('click',e=>{ if(!e.target.closest('#btnUd')||townLevel()>=5)return; e.stopImmediatePropagation();e.preventDefault(); dialog(`<div class="dlgArt">${picHTML({art:'ud_trophy',emoji:'🏅'})}</div><h2 class="dlgT">🔒 運動会は まちLv5から</h2><p class="dlgP">まちが Lv5に なると、シマくんが おしえてくれるよ！</p>`); },true);

/* 能力の実を バッグにも 表示 */
const _renderResidents45=renderResidents;
renderResidents=function(){ const o=_renderResidents45.apply(this,arguments); const box=$('#resBag'); if(box){const B=fruitBag();
  box.insertAdjacentHTML('beforeend',`<div class="bagIt fruitBag49"><div><b>能力の実</b><small>住民を タッチして あげると 能力が +1</small><div class="frRow49">${Object.entries(FRUITS).map(([k,f])=>`<span title="${f.n}">${frImg(k)}<em>×${B[k]}</em><i>${f.n.replace('の実','')}</i></span>`).join('')}</div></div></div>`);} return o; };
})();
/* =====================================================================
   まなびタウン v4.6
   ・車を ゆっくり（踏切でも 同じ速さ）
   ・超レアかくていレター
   ・おうちカフェ（固定席・模様・30メニュー・畑／牧場素材・動物客）
   ===================================================================== */
(function(){
'use strict';
/* ---------- 車：2回に1回だけ進む。踏切でも同じトランジション ---------- */
const _moveCars46=moveCars; let carSlow=0;
moveCars=function(){ carSlow^=1; if(carSlow)return; return _moveCars46.apply(this,arguments); };

/* ---------- 超レアかくていレター ---------- */
function superInvite(){
  if(!(save.superLetter>0)){toast('超レアかくていレターを もっていないよ');return;}
  const c=townCalc(); if(nonHuman().length>=c.maxRes){toast('じゅうみんが いっぱいだよ');return;}
  const pool=SPECIES.filter(s=>!s.human&&(s.rar||1)>=4&&(s.w||0)>0&&findHome(s));
  if(!pool.length){toast('超レア住民が すめる おうちに あきが ないよ');return;}
  const sp=choice(pool), r=newResident(sp); save.town.res.push(r); save.superLetter--; rehouse(); persist(); sound('fan'); confetti(3000);
  dialog(`<div class="rareIntro rk4"><div class="rays"></div>${resPic(r)}<b>🌈 超レアかくてい！ 🌈</b></div><h2 class="dlgT">${esc(r.name)}が ひっこしてきた！</h2><p class="dlgP">100かいタワーの とくべつな レターで 来てくれたよ！</p>`,[{label:'ようこそ！',cls:'gold',v:1}],'gold'); renderResidents();
}
const _renderResidents46=renderResidents;
renderResidents=function(){const o=_renderResidents46.apply(this,arguments),b=$('#resBag');if(b&&!b.querySelector('.superLetter49')){const n=save.superLetter||0;
 const html=`<div class="bagIt superLetter49"><img src="${esc(artSrc('itm_superletter'))}" alt=""><div><b>超レアかくていレター ×${n}</b><small>超レアの 住民が かならず 来る（100かいタワーの ごほうび）</small></div>${n?'<button class="btn small green" data-superletter>つかう</button>':''}</div>`;
 const gl=[...b.children].find(e=>e.querySelector('[data-use="goldletter"]')||/きらきらレター/.test(e.textContent));if(gl)gl.insertAdjacentHTML('afterend',html);else b.insertAdjacentHTML('afterbegin',html);}return o;};
document.addEventListener('click',e=>{if(e.target.closest('[data-superletter]')){e.stopImmediatePropagation();superInvite();}},true);

/* =====================================================================
   v4.8 牧場：カフェの 肉・たまご・ミルク（イラスト）
   ===================================================================== */
const IMG48='./assets/images/v48/';
const RANCH='ranch';
DEFAULT_ART.bld_ranch=IMG48+'bld_ranch2.webp';
['cf_milk','cf_egg','cf_beef','cf_chicken','cf_pork','cafe_table_top','cafe_table_side','cafe_coffee','cafe_crate','cafe_sign'].forEach(k=>DEFAULT_ART[k]=IMG48+k+'.webp');
if(!TOWN_ITEMS.some(x=>x.id===RANCH))TOWN_ITEMS.push({id:RANCH,type:'bld',cat:'bld',name:'ぼくじょう',art:'bld_ranch',emoji:'🐄',price:1400,lv:5,dev:38,income:8});
else { const it=ITEM(RANCH); it.art='bld_ranch'; }
try{ZUKAN_INFO[RANCH]='ミルク・たまご・おにくなど、カフェの ざいりょうを つくる。';}catch(e){}
const RMAT={cf_milk:'ミルク',cf_egg:'たまご',cf_beef:'ぎゅうにく',cf_chicken:'とりにく',cf_pork:'ぶたにく'};
/* v6.1：はちみつ（みつばちの すばこで とれる・カフェの ざいりょう） */
DEFAULT_ART.cf_honey=DEFAULT_ART.cf_honey||('data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="58" font-size="78" text-anchor="middle" dominant-baseline="middle">🍯</text></svg>'));
if(!FD('cf_honey')) FOOD.push({id:'cf_honey',n:'はちみつ',price:120,m:1.2,min:15,art:'cf_honey',mat61:1});
const imgTag=(k,cls='')=>`<img class="${cls}" src="${esc(artSrc(k)||k)}" alt="">`;
function cafeStock(){return save.cafeStock||(save.cafeStock={});}   // 手持ちの ぼくじょう ざいりょう
/* v5.5：ぼくじょうごとに 1日1かい しゅうかく（ふたつ あれば ふたつとも とれる） */
async function openRanch(key){const S=cafeStock(),d=dayKey(),RD=S.ranchDays||(S.ranchDays={});if(S.ranchDay){if(S.ranchDay===d&&!Object.keys(RD).length)RD[key]=d;delete S.ranchDay;}const ready=RD[key]!==d,g=(save.town.glv||{})[key]||0,n=2+g;
 const v=await dialog(`<div class="dlgArt big">${imgTag('bld_ranch')}</div><h2 class="dlgT">ぼくじょう</h2><div class="matRow48">${Object.entries(RMAT).map(([k,nm])=>`<span>${imgTag(k)}<b>${nm}</b><small>×${S[k]||0}</small></span>`).join('')}</div><p class="dlgP">${ready?'きょうの ざいりょうが できているよ！':'きょうの しゅうかくは おしまい。また あした！'}<br><small>グレードアップすると 1日に とれる かずが ふえるよ。<br>とれた ざいりょうは カフェの「メニューと ざいりょう」から のうひんしてね</small></p>`,(ready?[{label:`うけとる（各${n}こ）`,cls:'gold',v:'get'}]:[]).concat([{label:'⬆ グレードアップ',cls:'white',v:'grade'},{label:'とじる',v:null}]),'wide');
 if(v==='get'){Object.keys(RMAT).forEach(k=>S[k]=(S[k]||0)+n);RD[key]=d;persist();sound('fan');confetti(900);toast('ぼくじょうの ざいりょうを うけとった！');}
 if(v==='grade')openBuilding(key);
}
window.addEventListener('click',async e=>{if(curScreen!=='town'||townEdit)return;const c=e.target.closest('#townMap .cell');if(!c)return;const k=`${c.dataset.x},${c.dataset.y}`;if(save.town.cells[k]!==RANCH)return;e.stopImmediatePropagation();e.preventDefault();openRanch(k);},true);

/* =====================================================================
   v4.8 おうちカフェ
   ・わたしの家の 1へや（カフェ）。机と席は こてい、ほかは 家具を おける
   ・カフェを ひらいている あいだは いつも えいぎょう（のうひんした ざいりょうで 料理）
   ===================================================================== */
const MENUS=[
['carrot_soup','にんじんスープ','🥕',1,70,{f_carrot:2}],['tomato_soup','トマトスープ','🍅',1,70,{f_tomato:2}],['corn_soup','コーンスープ','🌽',1,80,{f_corn:2}],['fruit_plate','くだものプレート','🍎',1,90,{f_apple:1,f_banana:1}],['strawberry_milk','いちごミルク','🍓',1,90,{f_strawberry:1,cf_milk:1}],['egg_sand','たまごサンド','🥪',1,100,{cf_egg:1}],['pudding','ぼくじょうプリン','🍮',1,110,{cf_egg:1,cf_milk:1}],['veggie_salad','やさいサラダ','🥗',1,100,{f_tomato:1,f_carrot:1}],
['pumpkin_soup','かぼちゃスープ','🎃',2,120,{f_pumpkin:2,cf_milk:1}],['omelet','ふわふわオムレツ','🍳',2,140,{cf_egg:2,cf_milk:1}],['chicken_plate','チキンプレート','🍗',2,160,{cf_chicken:2,f_corn:1}],['pork_sand','ポークサンド','🥪',2,160,{cf_pork:2}],['hamburg','てづくりハンバーグ','🍖',2,180,{cf_beef:2,cf_egg:1}],['berry_parfait','ベリーパフェ','🍨',2,150,{f_strawberry:2,cf_milk:1}],['watermelon_juice','すいかジュース','🍉',2,110,{f_watermelon:2}],['banana_shake','バナナシェイク','🍌',2,120,{f_banana:2,cf_milk:1}],
['beef_stew','ビーフシチュー','🥘',3,230,{cf_beef:2,f_carrot:1,f_tomato:1,f_potato:1}],['curry','やさいカレー','🍛',3,200,{f_carrot:1,f_pumpkin:1,cf_pork:1,f_potato:1}],['roast_chicken','ローストチキン','🍗',3,220,{cf_chicken:3}],['steak','ごほうびステーキ','🥩',3,250,{cf_beef:3}],['gratin','コーングラタン','🧀',3,200,{f_corn:2,cf_milk:2}],['fruit_tart','フルーツタルト','🥧',3,210,{f_apple:1,f_strawberry:1,cf_egg:1}],['pancake','ふわふわパンケーキ','🥞',3,190,{cf_egg:2,cf_milk:2}],['lunchbox','カフェおべんとう','🍱',3,230,{cf_chicken:1,cf_egg:1,f_carrot:1}],
['special_course','まなびスペシャル','👑',4,320,{cf_beef:2,cf_chicken:2,f_pumpkin:1}],['garden_plate','ガーデンプレート','🌿',4,270,{f_tomato:2,f_carrot:2,f_corn:2}],['royal_parfait','ロイヤルパフェ','✨',4,280,{f_strawberry:2,f_banana:1,cf_milk:2}],['family_set','なかよしファミリーセット','🍽️',4,300,{cf_pork:2,cf_egg:2,f_tomato:1}],['chef_stew','シェフのとくせいシチュー','🍲',4,320,{cf_beef:2,cf_milk:1,f_carrot:2,f_potato:2}],['rainbow_cake','にじいろロイヤルデザート','🌈',4,600,{f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}]
].map(([id,n,i,lv,pt,req])=>({id,n,i,lv,pt,req}));
/* v5.4：ドリンク（コーヒー）と じゃがいもの メニュー */
const NEW54=[['blend_coffee','ブレンドコーヒー',1,80,{f_coffee:1},1],['french_fries','フライドポテト',1,80,{f_potato:2},0],
 ['cafe_latte','カフェラテ',2,120,{f_coffee:1,cf_milk:1},1],['coffee_jelly','コーヒーゼリー',2,140,{f_coffee:2,cf_milk:1},0],['potato_salad','ポテトサラダ',2,150,{f_potato:2,cf_egg:1,f_carrot:1},0],
 ['vienna_coffee','ウインナーコーヒー',3,190,{f_coffee:2,cf_milk:2},1]];
NEW54.forEach(([id,n,lv,pt,req,dr])=>{if(!MENUS.some(m=>m.id===id)){const at=MENUS.findIndex(m=>m.lv>lv);const o={id,n,i:'',lv,pt,req,drink:!!dr,v54:1};if(at<0)MENUS.push(o);else MENUS.splice(at,0,o);}});
/* v6.1：なす・キャベツ・はちみつの メニュー（Lv1〜8） */
[['coleslaw','コールスロー',1,80,{f_cabbage:2,f_carrot:1}],['yasai_itame','やさいいため',2,150,{f_cabbage:1,f_carrot:1,cf_pork:1}],['honey_milk','ハニーミルク',2,130,{cf_honey:1,cf_milk:1},1],
 ['nasu_gratin','なすの グラタン',3,210,{f_eggplant:2,f_tomato:1,cf_milk:2}],['honey_french','はちみつ フレンチトースト',4,260,{cf_honey:2,cf_egg:2,cf_milk:1}],['roll_cabbage','ロールキャベツ',5,340,{f_cabbage:2,cf_beef:2,f_tomato:2}],
 ['ratatouille','ラタトゥイユ',6,360,{f_eggplant:2,f_tomato:2,f_corn:1,f_potato:1}],['apple_honey_tart','りんごと はちみつの タルト',7,420,{f_apple:3,cf_honey:2,cf_egg:2,cf_milk:1}],['nasu_curry','なすと チキンの カレー',8,460,{f_eggplant:2,cf_chicken:2,f_potato:2,f_carrot:1}]]
 .forEach(([id,n,lv,pt,req,dr])=>{ if(MENUS.some(m=>m.id===id)) return; const o={id,n,i:'',lv,pt,req,drink:!!dr,v61:1}; const at=MENUS.findIndex(m=>m.lv>lv); if(at<0) MENUS.push(o); else MENUS.splice(at,0,o); });
MENUS.forEach(m=>{ if(m.id==='pork_sand'){ m.n='ハムエッグサンド'; m.req={cf_pork:1,cf_egg:1}; }
 if(m.id==='rainbow_cake'){ m.n='にじいろロイヤルデザート'; m.pt=600; m.req={f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}; } });
const EVENT_MENU={halloween:{id:'ev_pumpkin',n:'ハロウィンかぼちゃパイ',lv:1,pt:350,req:{f_pumpkin:3,cf_egg:1}},christmas:{id:'ev_xmas',n:'クリスマスチキン',lv:1,pt:380,req:{cf_chicken:3,f_carrot:1}},newyear:{id:'ev_osechi',n:'おしょうがつプレート',lv:1,pt:380,req:{cf_egg:2,cf_beef:1,f_carrot:1}},summer:{id:'ev_summer',n:'なつのフルーツパフェ',lv:1,pt:350,req:{f_watermelon:2,f_strawberry:1,cf_milk:1}}};
MENUS.forEach(m=>{ m.art=m.v61?'./assets/images/v61/cm_'+m.id+'.webp':m.v54?'./assets/images/v54/cm_'+m.id+'.webp':IMG48+'cm_'+m.id+'.webp'; m.mult=m.id==='rainbow_cake'?3:m.lv>=4?Math.min(3,+(2.5+(m.lv-4)*.08).toFixed(2)):m.lv===3?2:m.lv===2?1.5:1.2; m.min=m.id==='rainbow_cake'?35:15+m.lv*5; m.buy=Math.round(m.pt*(m.id==='rainbow_cake'?2.5:1.15)); });
Object.values(EVENT_MENU).forEach(m=>{ m.art=IMG48+'cm_'+m.id+'.webp'; m.mult=2.5; m.min=30; m.buy=Math.round(m.pt*1.4); m.ev=1; });
/* v6.42：つった 魚の メニュー・りんご／バナナの メニュー */
const FISH_N={aji:'アジ',iwashi:'イワシ',saba:'サバ',sanma:'サンマ',sake:'サケ',tako:'タコ',ika:'イカ',buri:'ブリ',madai:'マダイ',maguro:'マグロ'};
Object.entries(FISH_N).forEach(([k,n])=>{ RMAT['fi_'+k]=n; DEFAULT_ART['fi_'+k]='./assets/images/v615/fish_'+k+'.webp'; });
window.__fishUse642=new Set(Object.keys(FISH_N));
[['aji_fry','アジフライ',1,110,{fi_aji:2}],['apple_juice','りんごジュース',1,90,{f_apple:2},1],['tsumire','イワシの つみれじる',2,140,{fi_iwashi:2,f_carrot:1}],
 ['banana_muffin','バナナマフィン',2,140,{f_banana:2,cf_egg:1}],['apple_pie','アップルパイ',2,160,{f_apple:2,cf_egg:1,cf_milk:1}],['yaki_ringo','やきりんご',2,130,{f_apple:1,cf_honey:1}],
 ['saba_miso','サバの みそに',3,190,{fi_saba:2}],['sanma_yaki','サンマの しおやき',3,180,{fi_sanma:1}],['ika_ring','イカリング',3,200,{fi_ika:2}],
 ['banana_pancake','バナナパンケーキ',3,210,{f_banana:2,cf_egg:1,cf_milk:1,cf_honey:1}],['fruit_sand','フルーツサンド',3,220,{f_apple:1,f_banana:1,f_strawberry:1,cf_milk:1}],
 ['takoyaki','たこやき',4,280,{fi_tako:1,cf_egg:2,f_cabbage:1}],['sake_onigiri','サケの おにぎりセット',4,260,{fi_sake:1,cf_egg:1}],
 ['buri_teri','ブリの てりやき',5,360,{fi_buri:1,cf_honey:1}],['tai_meuniere','マダイの ムニエル',6,460,{fi_madai:1,cf_milk:1,f_potato:1}],['maguro_sushi','マグロの おすしセット',7,560,{fi_maguro:1,cf_egg:1}]]
 .forEach(([id,n,lv,pt,req,dr])=>{ if(MENUS.some(m=>m.id===id)) return; const o={id,n,i:'',lv,pt,req,drink:!!dr,v642:1,fish:Object.keys(req).some(k=>k.startsWith('fi_')),
   art:'./assets/images/v642/cm_'+id+'.webp',mult:lv>=4?Math.min(3,+(2.5+(lv-4)*.08).toFixed(2)):lv===3?2:lv===2?1.5:1.2,min:15+lv*5,buy:Math.round(pt*1.15)};
   const at=MENUS.findIndex(m=>m.lv>lv); if(at<0) MENUS.push(o); else MENUS.splice(at,0,o); });
const THEMES=[['wood','きの ぬくもり','#F2D9A8'],['cute','いちご','#FFC3D5'],['natural','もり','#C9EBBE'],['marine','うみ','#BDE6F7'],['luxury','ロイヤル','#DCCBFF']];
const ROUND_MS=2*60000, MAX_ROUNDS=60;
function C(){const c=save.cafe||(save.cafe={on:false,lv:1,theme:'wood',menu:['carrot_soup','tomato_soup','egg_sand'],guests:[],pals:{},sales:0,served:0,last:0});
 c.stock=c.stock||{}; c.guests=c.guests||[]; c.menu=c.menu||[]; return c;}
const matArt=k=>RMAT[k]?k:(FD(k)?.art||'ui_bulb');
const matName=k=>RMAT[k]||FD(k)?.n||k;
const fishBag=()=>save.fishBag||(save.fishBag={});
const handBag=k=>k.startsWith('cf_')?cafeStock():k.startsWith('fi_')?fishBag():foodBag();
function cafeMenus(all){const c=C(),L=MENUS.filter(m=>all||m.lv<=c.lv),ev=EVENT_MENU[typeof curEvent==='function'?curEvent():''];if(ev)L.push(ev);return L;}
const menuById=id=>MENUS.find(m=>m.id===id)||Object.values(EVENT_MENU).find(m=>m.id===id);
const canMake=(m,S)=>Object.entries(m.req).every(([k,n])=>(S[k]||0)>=n);
function take(m,S){Object.entries(m.req).forEach(([k,n])=>{S[k]=(S[k]||0)-n;if(S[k]<=0)delete S[k];});}
const servings=m=>{const S=C().stock;return Math.min(...Object.entries(m.req).map(([k,n])=>Math.floor((S[k]||0)/n)));};
/* ---------- 机の ばしょ（3×3 の まん中が 机、上下左右が いす） ---------- */
const TABLES=[[1,2],[6,2],[1,6],[6,6]];
const tablesOpen=()=>Math.min(4,C().lv);
function tableCells(){const out=[];TABLES.slice(0,tablesOpen()).forEach(([x,y])=>[[0,0],[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dy])=>out.push([x+dx,y+dy])));return out;}
const SEAT_OFF=[[0,-1],[1,0],[0,1],[-1,0]];
const inCafe=()=>roomData().roomCur==='cafe';
/* ---------- へやとして ついか ---------- */
if(!ROOMS.some(r=>r.id==='cafe')) ROOMS.splice(1,0,{id:'cafe',n:'カフェ',fl:1,rank:0,price:500,i:'☕'});
function syncCafeRoom(){const H=roomData(),c=C();if(c.on&&!H.roomOpen.includes('cafe')){H.roomOpen.push('cafe');persist();}if(H.roomOpen.includes('cafe')&&!c.on){c.on=true;c.last=Date.now();persist();}}
const _occGrid48=occGrid;
occGrid=function(skip){const g=_occGrid48.apply(this,arguments);if(inCafe())tableCells().forEach(([x,y])=>{g[`F${x},${y}`]=-1;g[`N${x},${y}`]=-1;});return g;};
function clearTableCells(){const H=roomData();const cells=new Set(tableCells().map(([x,y])=>x+','+y));const items=H.roomCur==='cafe'?H.items:(H.rooms.cafe?.items||[]);let n=0;
 for(let i=items.length-1;i>=0;i--){const it=items[i],f=FUR(it.id);if(!f)continue;const [w,h]=fpOf(it.id,it.r);let hit=false;for(let dx=0;dx<w;dx++)for(let dy=0;dy<h;dy++)if(cells.has((it.x+dx)+','+(it.y+dy)))hit=true;
  if(hit){items.splice(i,1);H.inv[it.id]=(H.inv[it.id]||0)+1;n++;}}
 if(n){persist();toast(`🪑 机の ばしょに あった 家具 ${n}こを しまったよ`);}}
/* ---------- いつも えいぎょう ---------- */
function newGuest(){const live=new Set((save.town?.res||[]).map(r=>r.sp)),pool=SPECIES.filter(s=>!s.human&&(s.w||0)>0&&!live.has(s.id));const sp=choice(pool.length?pool:SPECIES.filter(s=>!s.human));return{id:'cg'+Date.now().toString(36)+rint(100,999),sp:sp.id,name:choice(NAMES),talk:0};}
/* v5.1：おきゃくさんは すこしずつ 来る。机が おおいほど たくさん 来る。
   食べおわって かえる ときに「まんぞく」したら まんぞく人数が ふえる */
const ARR_P=.2;   // 1ラウンドに あいている せき 1つあたり 来る かくりつ
function cafeLeft(c){return c.menu.map(menuById).filter(Boolean).reduce((a,m)=>a+Math.max(0,servings(m)),0);}
function varietyBonus(c){const n=c.menu.map(menuById).filter(m=>m&&servings(m)>0).length;return Math.min(10,Math.max(0,n-1)*2);}
/* v5.4：まんぞく度は「メニューの むずかしさ」と「カフェの レベル」で きまる
   ・ざいりょうの かず・しゅるい・手に入れにくさ が 大きい メニューほど まんぞく しやすい
   ・カフェの レベルが 上がるほど、かんたんな メニューでは まんぞく しにくく なる */
const MAT_DIFF={f_cabbage:1,f_eggplant:2,cf_honey:3,f_carrot:1,f_tomato:1,f_corn:2,f_potato:2,f_apple:2,f_banana:2,f_strawberry:3,f_pumpkin:3,f_coffee:3,f_watermelon:4,cf_milk:2,cf_egg:2,cf_chicken:3,cf_pork:3,cf_beef:4};
function menuScore(m){if(!m)return 0;const e=Object.entries(m.req||{});const cx=e.reduce((a,[k,n])=>a+n*(MAT_DIFF[k]||2),0)+2*Math.max(0,e.length-1);return Math.min(1,cx/16);}
const LV_PEN=[0,0,10,20,30,32,34,36,38,40,42];
function satMean(m,lv,vb){const s=menuScore(m);return 52+36*s-(LV_PEN[lv]??30)*(1-s)+(vb||0);}
function rollSat(m,c){if(Math.random()<.08)return rint(60,75);return Math.round(satMean(m,c.lv,varietyBonus(c))+rint(-15,15));}
function satChance(m,c){const mu=satMean(m,c.lv,varietyBonus(c));return .08+.92*Math.max(0,Math.min(1,(mu+15-60)/30));}
function satStars(m,c){const p=satChance(m,c);return p>=.7?3:p>=.35?2:1;}
function cafeRound(c,rate){let sales=0,served=0,happy=0;
 c.guests=c.guests.filter(g=>{g.stay=(g.stay??1)-1;if(g.stay>0)return true;const m=menuById(g.dish);sales+=Math.round((m?.pt||60)*rate*(g.sat>=60?1:.8))+(g.tip||0)+(g.sat>=60&&c.lv>=6?10:0);served++;if(g.sat>=60)happy++;return false;});
 const sel=c.menu.map(menuById).filter(Boolean),seats=tablesOpen()*4,used=new Set(c.guests.map(g=>g.seat)),free=[...Array(seats).keys()].filter(i=>!used.has(i)).sort(()=>Math.random()-.5);
 const pop=Math.min(.1,(c.happy||0)*.0008);
 free.forEach(seat=>{if(Math.random()>ARR_P+pop+arrBonus(c))return;const ok=sel.filter(m=>canMake(m,c.stock));if(!ok.length)return;const m=choice(ok);take(m,c.stock);
  const g=newGuest();Object.assign(g,{seat,dish:m.id,stay:rint(1,3),sat:rollSat(m,c),q:Math.random()<.65,qd:false});c.guests.push(g);});
 return {sales,served,happy};}
function refreshGuests(){}
const _newGuest61=newGuest; newGuest=function(){ const c=C(); if(c.lv>=9&&Math.random()<.3){ const live=new Set((save.town?.res||[]).map(r=>r.sp)),R=SPECIES.filter(s=>!s.human&&(s.rar||1)>=3&&(s.w||0)>0&&!live.has(s.id)); if(R.length){ const sp=choice(R); return {id:'cg'+Date.now().toString(36)+rint(100,999),sp:sp.id,name:choice(NAMES),talk:0,rare61:1}; } } return _newGuest61(); };   // いぜんの「すぐ 来る」しくみは つかわない
function cafeTick(force){const c=C();if(!c.on)return null;const now=Date.now();if(!c.last)c.last=now;
 let rounds=Math.min(Math.floor((now-c.last)/ROUND_MS),MAX_ROUNDS);if(!rounds)return null;c.last=rounds>=MAX_ROUNDS?now:c.last+rounds*ROUND_MS;
 const rate=1+(c.lv-1)*.1;let sales=0,served=0,happy=0;
 for(let r=0;r<rounds;r++){const o=cafeRound(c,rate);sales+=o.sales;served+=o.served;happy+=o.happy;}
 if(served){c.sales+=sales;c.served+=served;c.happy=(c.happy||0)+happy;addXP(c,happy);c.today=c.today&&c.today.d===dayKey()?c.today:{d:dayKey(),pt:0,n:0,h:0};c.today.pt+=sales;c.today.n+=served;c.today.h=(c.today.h||0)+happy;givePts(sales,'おうちカフェの うりあげ');}
 persist();return served?{sales,served,happy}:null;}
setInterval(()=>{if(document.hidden)return;const r=cafeTick();if(r){toast(`☕ カフェで ${r.served}人が 食べて +${r.sales}pt！（まんぞく ${r.happy}人）`);if(curScreen==='myhome'&&inCafe()&&!homeEdit)renderMyHome();}},30000);
/* ---------- へやに 机・いす・おきゃくさんを かく ---------- */
function drawCafe(){if(!inCafe())return;const c=C(),box=$('#roomBox'),room=$('#room');if(!box||!room)return;const th=THEMES.find(x=>x[0]===c.theme)||THEMES[0];
 const gAt=s=>c.guests.find(g=>g.seat===s);let h='';
 if(homeView==='top'){const cs=parseFloat(box.style.getPropertyValue('--cs'))||room.clientWidth/ROOM.cols;
  TABLES.slice(0,tablesOpen()).forEach(([x,y],t)=>{const z=(y+2)*10+4;
   h+=`<div class="cafeTbl48" style="left:${(x-1)*cs}px;top:${(y-1)*cs}px;width:${3*cs}px;height:${3*cs}px;z-index:${z}"><img src="${esc(artSrc('cafe_table_top'))}" alt=""><i class="cloth48" style="background:${th[2]}"></i></div>`;
   SEAT_OFF.forEach(([dx,dy],q)=>{const g=gAt(t*4+q);if(!g)return;const m=menuById(g.dish);
    if(g.q&&!g.qd)h+=`<span class="qb51" style="left:${(x+dx+.5)*cs}px;top:${(y+dy-.15)*cs}px;z-index:${z+5}">？</span>`;h+=`<button class="cafeSeat48" data-cg="${g.id}" style="left:${(x+dx)*cs}px;top:${(y+dy)*cs}px;width:${cs}px;height:${cs}px;z-index:${z+2}">${resPic({id:g.id,sp:g.sp,name:g.name,star:1,ab:{}})}</button>`;
    if(m)h+=`<img class="cafeDish48" src="${esc(m.art)}" alt="" style="left:${(x+dx*.32+.5)*cs}px;top:${(y+dy*.32+.5)*cs}px;width:${cs*.42}px;z-index:${z+1}">`;});});
 }else{const W=box.clientWidth||roomSize(),wallH=Math.round(W*.36),depth=Math.round(W*.42),cw=W/ROOM.cols;
  TABLES.slice(0,tablesOpen()).forEach(([x,y],t)=>{const tt=(y+2)/ROOM.rows,s=.62+.38*tt,base=wallH+depth*tt,cx=(x+.5)*cw,wd=2.3*cw*s,z=Math.round(tt*100)+5;
   h+=`<img class="sItem cafeSide48" src="${esc(artSrc('cafe_table_side'))}" alt="" style="left:${cx}px;top:${base}px;width:${wd}px;z-index:${z}">`;
   [[-.85,3],[.85,1]].forEach(([ox,q])=>{const g=gAt(t*4+q)||gAt(t*4+(q+1)%4);if(!g)return;if(g.q&&!g.qd)h+=`<span class="qb51" style="left:${cx+ox*cw*s}px;top:${base-wd*.7}px;z-index:${z+5}">？</span>`;h+=`<button class="cafeSideG48" data-cg="${g.id}" style="left:${cx+ox*cw*s}px;top:${base-wd*.18}px;height:${wd*.55}px;z-index:${z+1}">${resPic({id:g.id,sp:g.sp,name:g.name,star:1,ab:{}})}</button>`;});});}
 const sel=c.menu.map(menuById).filter(Boolean),left=sel.reduce((a,m)=>a+Math.max(0,servings(m)),0);
 room.insertAdjacentHTML('beforeend',h);
 box.insertAdjacentHTML('beforeend',`<div class="cafeBadge48 ${left?'':'empty'}">${imgTag('cafe_sign')}<span>${left?`えいぎょうちゅう<br><b>あと ${left}さら</b>`:'ざいりょうが<br>ないよ'}</span></div>`);}
/* ---------- わたしの家の へんこう ---------- */
const _renderMyHome48=renderMyHome;
renderMyHome=function(){syncCafeRoom();if(C().on){const r=cafeTick();if(r)setTimeout(()=>toast(`☕ カフェで ${r.served}人が 食べて +${r.sales}pt！（まんぞく ${r.happy}人）`),300);}const o=_renderMyHome48.apply(this,arguments);
 let b=$('#btnCafe46');if(!b){$('#btnHomeEdit').insertAdjacentHTML('afterend','<button class="btn orange" id="btnCafe46"></button>');b=$('#btnCafe46');b.onclick=()=>cafeOpen();}
 b.innerHTML=`${imgTag('cafe_coffee','btnIc48')} ${C().on?`おうちカフェ Lv${C().lv}`:'おうちに カフェを つくる'}`;
 try{drawCafe();}catch(e){console.warn(e);}return o;};
/* カフェの へやを つくる（へやバーから えらんだ ときも） */
const _unlockRoom48=unlockRoom;
unlockRoom=async function(id){if(id!=='cafe')return _unlockRoom48.apply(this,arguments);return openCafeShop();};
async function openCafeShop(){const v=await dialog(`<div class="dlgArt big">${imgTag('cafe_sign')}</div><h2 class="dlgT">おうちに カフェを つくる？</h2><p class="dlgP">わたしの家に「カフェ」の へやが できるよ。<br>机と いすは きまった ばしょ。ほかは すきな 家具で かざれるよ！<br><span class="coin sm">P</span> <b>500</b>pt</p>`,[{label:'つくる！',cls:'gold',v:'yes'},{label:'やめる',v:null}]);
 if(v!=='yes')return;if(save.points.bal<500)return toast('ポイントが たりないよ');givePts(-500,'わたしの家：カフェを つくった');const c=C();c.on=true;c.last=Date.now();syncCafeRoom();persist();sound('fan');confetti(1800);
 if(homeEdit)endHomeEdit(true);switchRoom('cafe');clearTableCells();renderMyHome();}
/* ---------- カフェの メインがめん ---------- */
/* v6.1：カフェは Lv10まで。Lv10は 1年 まいにち がんばって やっと とどく（カフェポイントは 1日 25まで） */
const CAFE_MAX=10, XP_DAY=25;
const CAFE_UP=[null,{h:15,p:1200},{h:50,p:2400},{h:120,p:3600},{h:400,p:6000},{h:900,p:10000},{h:1700,p:15000},{h:3000,p:22000},{h:5000,p:32000},{h:8500,p:50000}];window.CAFE_UP=CAFE_UP;
const CAFE_PERK=[null,['机 1つ（4せき）','🪑'],['机が 2つに（8せき）','🪑'],['机が 3つに（12せき）','🪑'],['机が 4つに（16せき）','🪑'],['メニューを 7しゅるい だせる・おきゃくさんが 来やすい','📋'],['まんぞくした おきゃくさんが チップ +10pt','💰'],['メニューを 8しゅるい だせる・もっと 来やすい','📋'],['まいにち「ひょうばん ボーナス」（Lv×100pt）','🎁'],['めずらしい どうぶつの おきゃくさんが 来る','🦄'],['でんせつの カフェ！ きらきらレター 3まい・ひょうばん ボーナス 2ばい','👑']];
function cafeXP(c){ if(c.xp==null) c.xp=c.happy||0; return c.xp; }
function addXP(c,n){ const d=dayKey(); cafeXP(c); if(!c.xpd||c.xpd.d!==d) c.xpd={d,n:0}; const a=Math.max(0,Math.min(n,XP_DAY-c.xpd.n)); c.xp+=a; c.xpd.n+=a; return a; }
const xpToday=c=>c.xpd&&c.xpd.d===dayKey()?c.xpd.n:0;
const menuMax=()=>C().lv>=7?8:C().lv>=5?7:6;
const arrBonus=c=>c.lv>=7?.06:c.lv>=5?.03:0;
function cafePerks(){ const c=C();
 dialog(`<h2 class="dlgT">☕ カフェの レベルと とくてん</h2><div class="perk61">${CAFE_PERK.slice(1).map((p,i)=>{const lv=i+1,got=c.lv>=lv;return `<div class="${got?'got':''} ${c.lv===lv?'now':''}"><b>Lv${lv}</b><i>${p[1]}</i><span>${p[0]}${(()=>{const L=MENUS.filter(m=>m.lv===lv).map(m=>m.n);return L.length?`<small>メニュー：${L.slice(0,3).join('・')}${L.length>3?` ほか ${L.length-3}しゅるい`:''}</small>`:'';})()}</span>${lv>1?`<em>${got?'✔':`🔒 ${nf(CAFE_UP[lv-1].h)}`}</em>`:'<em>✔</em>'}</div>`;}).join('')}</div>
 <p class="dlgP facNote">レベルが 上がるたびに うりあげも +10%。<br>🔒の 数字は ひつような「カフェポイント」（まんぞくした おきゃくさん 1人で 1ポイント、1日 ${XP_DAY}ポイントまで）。<br>Lv10は 1年 まいにち つづけて やっと とどく でんせつの レベルだよ！</p>`,[{label:'とじる',v:null}],'wide cafeDlg48').then(()=>cafeOpen()); }
window.__cafe61={openMenu:()=>cafeMenu(),C:()=>C(),cafeXP:c=>cafeXP(c),addXP:(c,n)=>addXP(c,n),cafePerks:()=>cafePerks(),cafeOpen:()=>cafeOpen(),menus:()=>MENUS,menuMax:()=>menuMax(),tick:()=>cafeTick()};
function cafeLvBonus(c){ if(c.lv<8||c.bonusDay===dayKey()) return; c.bonusDay=dayKey(); const p=c.lv*100*(c.lv>=10?2:1); givePts(p,'カフェの ひょうばん ボーナス'); persist(); setTimeout(()=>toast(`🎁 カフェの ひょうばん ボーナス +${p}pt！`),400); }
function onCafeLv(c){ if(c.lv===10){ const t=save.town; t.bag.goldletter=(t.bag.goldletter||0)+3; persist(); setTimeout(()=>dialog(`<div class="dlgArt big">${imgTag('cafe_sign')}</div><h2 class="dlgT">👑 でんせつの カフェ！</h2><p class="dlgP">おうちカフェが Lv10に なった！<br>きらきらレターを <b>3まい</b> もらったよ！<br>ひょうばん ボーナスも 2ばいに！</p>`,[{label:'やったー！',cls:'gold',v:1}],'gold'),400); }
 else setTimeout(()=>toast(`☕ カフェ Lv${c.lv}！ ${CAFE_PERK[c.lv][0]}`),400); }
async function cafeOpen(){const c=C();if(!c.on)return openCafeShop();cafeTick();cafeLvBonus(c);
 const sel=c.menu.map(menuById).filter(Boolean),left=sel.reduce((a,m)=>a+Math.max(0,servings(m)),0),td=c.today&&c.today.d===dayKey()?c.today:{pt:0,n:0};
 const v=await dialog(`<div class="cafeHead48">${imgTag('cafe_sign')}<div><b>${c.lv>=10?'👑 でんせつの ':''}おうちカフェ Lv${c.lv}<small style="display:inline">/${CAFE_MAX}</small></b><small>4人がけの 机 ${tablesOpen()}つ（${tablesOpen()*4}せき）</small><small class="${left?'ok':'ng'}">${left?`えいぎょうちゅう・あと ${left}さら つくれる`:'ざいりょうぎれ（のうひんしてね）'}</small></div></div>
  <div class="cafeStats48"><span>きょうの うりあげ<b>${nf(td.pt)}pt</b></span><span>きょうの おきゃくさん<b>${td.n}人</b></span><span>まんぞくした おきゃくさん<b>${nf(c.happy||0)}人</b></span></div>${c.lv<CAFE_MAX?(()=>{const U=CAFE_UP[c.lv],h=cafeXP(c);return `<div class="up51"><small>Lv${c.lv+1}まで：カフェポイント ${nf(Math.min(h,U.h))}/${nf(U.h)}（きょう ${xpToday(c)}/${XP_DAY}） ・ ${nf(U.p)}pt</small><i><b style="width:${Math.min(100,h/U.h*100)}%"></b></i></div>`;})():''}
  <div class="cafeMenuNow48">${sel.length?sel.map(m=>`<span>${imgTag(m.art)}<small>${esc(m.n)}<br>あと${Math.max(0,servings(m))}</small></span>`).join(''):'<small>メニューを えらんでね</small>'}</div>
  <p class="dlgP facNote">カフェは いつも えいぎょうちゅう。おきゃくさんは すこしずつ 来るよ。<br>机（せき）が おおいほど たくさん 来るよ。<br><b>？の ふきだしの おきゃくさんを タッチすると 問題を 出してくれるよ。せいかいすると まんぞく＆チップ！</b></p>`,
  [{label:`${imgTag('cafe_crate','btnIc48')} メニューと ざいりょう`,cls:'gold',v:'menu'},{label:`${imgTag('cafe_coffee','btnIc48')} じぶんで 買って 食べる`,cls:'gold',v:'eat'},{label:'🎨 机の 柄',cls:'white',v:'theme'},{label:'🎁 レベルの とくてん',cls:'white',v:'perk'},...(c.lv<CAFE_MAX?[{label:`⬆ Lv${c.lv+1}へ<span class="nw">（${nf(CAFE_UP[c.lv].p)}pt）</span>`,cls:cafeXP(c)>=CAFE_UP[c.lv].h&&save.points.bal>=CAFE_UP[c.lv].p?'gold':'white',v:'up'}]:[]),...(inCafe()&&curScreen==='myhome'?[]:[{label:'カフェの へやへ',cls:'white',v:'go'}]),{label:'とじる',v:null}],'wide cafeDlg48');
 if(v==='menu')cafeMenu();if(v==='perk')cafePerks();if(v==='eat')cafeBuy();if(v==='theme')cafeTheme();
 if(v==='go'){if(curScreen!=='myhome')show('myhome');if(homeEdit)endHomeEdit(true);switchRoom('cafe');}
 if(v==='up'){const U=CAFE_UP[c.lv],p=U.p;if(cafeXP(c)<U.h){await dialog(`<div class="dlgArt">${imgTag('cafe_sign')}</div><h2 class="dlgT">まだ レベルアップ できないよ</h2><p class="dlgP">カフェポイントが <b>${nf(U.h)}</b> ひつようだよ。<br>いまは <b>${nf(cafeXP(c))}</b>。あと ${nf(U.h-cafeXP(c))}！<br><small>まんぞくした おきゃくさん 1人で 1ポイント（1日 ${XP_DAY}ポイントまで）</small></p><p class="dlgP facNote">おきゃくさんの 問題に せいかいすると かならず まんぞくしてくれるよ。<br>ざいりょうが おおくて むずかしい メニューほど まんぞくしやすいよ。<br>カフェの レベルが 上がると、かんたんな メニューでは まんぞく しにくく なるよ。</p>`);return cafeOpen();}if(save.points.bal<p)return toast('ポイントが たりないよ');givePts(-p,'カフェを グレードアップ');c.lv++;persist();clearTableCells();onCafeLv(c);sound('fan');confetti(1200);if(curScreen==='myhome')renderMyHome();cafeOpen();}}
/* ---------- メニューと ざいりょう（のうひん） ---------- */
function menuBody(){const c=C(),sel=new Set(c.menu),all=cafeMenus(true);
 const need=new Set();c.menu.map(menuById).filter(Boolean).forEach(m=>Object.keys(m.req).forEach(k=>need.add(k)));
 const mats=[...need];
 return `<h2 class="dlgT">メニューと ざいりょう</h2>
 <div class="secT48">① お店に だす メニュー（${sel.size}/${menuMax()}）</div>
 <div class="cafeMenus48">${all.map(m=>{const lock=!m.ev&&m.lv>c.lv;return `<button data-cmenu="${m.id}" class="${sel.has(m.id)?'on':''} ${lock?'lk48':''}" ${lock?'disabled':''}><img src="${esc(m.art)}" alt=""><b>${esc(m.n)}</b><small>${lock?`🔒 カフェLv${m.lv}`:`${m.pt}pt${m.ev?'・イベント':''}${m.drink?'・ドリンク':''}`}</small>${lock?'':(()=>{const st=satStars(m,c);return `<em class="sat54 s${st}">まんぞく ${'★'.repeat(st)}${'☆'.repeat(3-st)}</em>`;})()}<span class="reqs48">${Object.entries(m.req).map(([k,n])=>`<i>${imgTag(matArt(k))}${n}</i>`).join('')}</span></button>`;}).join('')}</div>
 <div class="secT48">② ざいりょうを のうひんする</div>
 ${mats.length?`<div class="matList48">${mats.map(k=>{const have=handBag(k)[k]||0,st=c.stock[k]||0;return `<div class="matIt48 mat50" data-mk="${k}">${imgTag(matArt(k))}<div class="mName50"><b>${esc(matName(k))}</b><div class="cnt50"><span class="hv50"><small>てもち</small><em>${have}</em></span><i>▶</i><span class="st50"><small>カフェ</small><em>${st}</em></span></div></div><div class="mBtn50"><button data-cdel="${k}|1" ${have?'':'disabled'}>＋1</button><button data-cdel="${k}|all" ${have?'':'disabled'}>ぜんぶ</button></div></div>`;}).join('')}</div>
 <button class="btn gold delAll48" data-cdelall>まとめて ぜんぶ のうひん</button>`:'<p class="dlgP facNote">メニューを えらぶと ひつような ざいりょうが でるよ</p>'}
 <p class="dlgP facNote">やさい・じゃがいも・コーヒーまめは 畑や 八百屋、りんご・バナナは 木、はちみつは みつばちの すばこ、たまごは にわとりごやでも とれるよ。ミルク・おにくは ぼくじょうで 手に入るよ。<br>ミルク・たまごは 八百屋、おにくは コンビニでも しいれられるよ。<br>魚の ざいりょうは みなとで つると てに はいるよ（つった 魚は じどうで カフェ用に なるよ）。</p>`;}
function cafeMenu(){dialog(menuBody(),[{label:'とじる',v:1}],'wide cafeDlg48').then(()=>{if(curScreen==='myhome')renderMyHome();});}
function deliver(k,n){const B=handBag(k),have=B[k]||0,q=n==='all'?have:Math.min(have,+n);if(!q)return 0;B[k]=have-q;if(B[k]<=0)delete B[k];C().stock[k]=(C().stock[k]||0)+q;return q;}
document.addEventListener('click',e=>{const t=e.target.closest('[data-cmenu],[data-cdel],[data-cdelall]');if(!t||!t.closest('#dlgBody'))return;e.stopImmediatePropagation();const c=C();c.__wasEmpty=!cafeLeft(c);
 if(t.dataset.cmenu){const id=t.dataset.cmenu,i=c.menu.indexOf(id);if(i>=0)c.menu.splice(i,1);else if(c.menu.length<menuMax())c.menu.push(id);else{toast(`メニューは ${menuMax()}こまで だよ`);return;}}
 else if(t.dataset.cdel){const [k,n]=t.dataset.cdel.split('|'),q=deliver(k,n);if(q){sound('tap');window.__matPop={k,q};}}
 else{let q=0;new Set(c.menu.map(menuById).filter(Boolean).flatMap(m=>Object.keys(m.req))).forEach(k=>{const d=deliver(k,'all');q+=d;if(d)(window.__matAll=window.__matAll||[]).push([k,d]);});if(q){sound('ok');toast(`ざいりょうを ${q}こ のうひんしたよ！`);}else toast('のうひんできる ざいりょうが ないよ');}
 if(!c.guests.length&&c.__wasEmpty)c.last=Date.now();delete c.__wasEmpty;persist();const sc=$('#dlgBody').scrollTop;$('#dlgBody').innerHTML=menuBody();$('#dlgBody').scrollTop=sc;matPop();(window.__matAll||[]).forEach(([k,q])=>{window.__matPop={k,q};matPop();});window.__matAll=null;},true);
function matPop(){const P=window.__matPop;window.__matPop=null;if(!P)return;const row=$(`#dlgBody .mat50[data-mk="${P.k}"]`);if(!row)return;
 const st=row.querySelector('.st50'),hv=row.querySelector('.hv50');[st,hv].forEach(e=>{e.classList.remove('pop50');void e.offsetWidth;e.classList.add('pop50');});
 st.insertAdjacentHTML('beforeend',`<b class="plus50">＋${P.q}</b>`);hv.insertAdjacentHTML('beforeend',`<b class="minus50">−${P.q}</b>`);row.classList.add('flash50');setTimeout(()=>row.classList.remove('flash50'),700);}
/* ---------- じぶんで 買って 食べる ---------- */
function eatBody(){const c=C(),list=cafeMenus();const both=k=>(c.stock[k]||0)+(handBag(k)[k]||0);
 return `<h2 class="dlgT">カフェの メニューを 食べよう</h2><p class="dlgP">食べると しばらく もらえる ポイントが ふえるよ。むずかしい 料理ほど 高い 倍率！<br><small>ざいりょうは カフェの ざいこ → てもち の じゅんに つかうよ</small></p>
 <div class="cafeBuyGrid">${list.map(m=>{const ok=Object.entries(m.req).every(([k,n])=>both(k)>=n)&&save.points.bal>=m.buy;return `<button data-cbuy="${m.id}" ${ok?'':'disabled'} class="${m.id==='rainbow_cake'?'top48':''}"><img src="${esc(m.art)}" alt=""><b>${esc(m.n)}</b><strong>×${m.mult}・${m.min}分</strong><small>${nf(m.buy)}pt</small><span class="reqs48">${Object.entries(m.req).map(([k,n])=>`<i class="${both(k)>=n?'':'short'}">${imgTag(matArt(k))}${n}</i>`).join('')}</span></button>`;}).join('')}</div>`;}
function cafeBuy(){dialog(eatBody(),[{label:'とじる',v:null}],'wide cafeDlg48');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cbuy]');if(!b||!b.closest('#dlgBody')||b.disabled)return;e.stopImmediatePropagation();const c=C(),m=menuById(b.dataset.cbuy);if(!m||save.points.bal<m.buy)return;
 const both=k=>(c.stock[k]||0)+(handBag(k)[k]||0);if(!Object.entries(m.req).every(([k,n])=>both(k)>=n))return;
 Object.entries(m.req).forEach(([k,n])=>{const a=Math.min(n,c.stock[k]||0);c.stock[k]=(c.stock[k]||0)-a;if(c.stock[k]<=0)delete c.stock[k];const r=n-a;if(r){const B=handBag(k);B[k]-=r;if(B[k]<=0)delete B[k];}});
 givePts(-m.buy,`カフェで ${m.n}を 食べた`);const now=Date.now(),cur=buffNow();
 save.buff=(cur&&cur.n===m.n)?Object.assign(cur,{until:cur.until+m.min*60000}):{m:m.mult,until:now+m.min*60000,n:m.n,art:m.art};persist();sound('fan');confetti(m.id==='rainbow_cake'?2500:800);
 $('#dlg').classList.remove('show');
 setTimeout(()=>dialog(`<div class="dlgArt big"><img src="${esc(m.art)}" alt=""></div><h2 class="dlgT">${esc(m.n)}を 食べた！</h2><p class="dlgP">${m.min}分の あいだ、もらえる ポイントが <b>×${m.mult}</b>！${m.id==='rainbow_cake'?'<br><b>さいこう なんいどの 3ばい ボーナス！</b>':''}</p>`,[{label:'おいしかった！',cls:'gold',v:1}],'gold'),60);},true);
/* ---------- 机の 柄 ---------- */
function cafeTheme(){const c=C();dialog(`<h2 class="dlgT">机の 柄</h2><div class="themeGrid48">${THEMES.map(x=>`<button data-theme48="${x[0]}" class="${c.theme===x[0]?'on':''}"><span class="tb48">${imgTag('cafe_table_top')}<i style="background:${x[2]}"></i></span><b>${x[1]}</b></button>`).join('')}</div><p class="dlgP facNote">机と いすの ばしょは きまっているよ。<br>まわりの かざりは「もようがえ」で すきな 家具を おいてね。</p>`,[{label:'とじる',v:null}],'wide');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-theme48]');if(!b)return;e.stopImmediatePropagation();C().theme=b.dataset.theme48;persist();$('#dlg').classList.remove('show');if(curScreen==='myhome')renderMyHome();toast('机の 柄を かえたよ');},true);
/* ---------- おきゃくさんと おはなし ---------- */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-cg]');if(!b||homeEdit)return;e.stopImmediatePropagation();const c=C(),g=c.guests.find(x=>x.id===b.dataset.cg);if(!g)return;
 g.talk=(g.talk||0)+1;const o={id:g.id,sp:g.sp,name:g.name,star:1,ab:{}};persOf(o);const m=menuById(g.dish),ask=g.q&&!g.qd;
 const face=g.sat>=90?'😊 だいまんぞく':g.sat>=60?'🙂 まんぞく':'😐 ふつう';
 const v=await dialog(`<div class="dlgArt big">${resPic(o)}</div><h2 class="dlgT">${esc(g.name)}（${esc(SP(g.sp).name)}）</h2><div class="talkBubble"><b>${esc(g.name)}</b>${esc(speak(o,ask?'ねえねえ、もんだいを 出しても いい？ こたえられたら うれしいな！':g.talk>=3?'この カフェ だいすき！ この まちに すんでみたいな！':m?`${m.n}、とっても おいしいよ！`:'すてきな カフェだね！'))}</div>${m?`<div class="dish51">${imgTag(m.art)}<span>${esc(m.n)}</span></div>`:''}<p class="dlgP">いまの きもち：<b>${face}</b><br>なかよし度 ${'💗'.repeat(Math.min(3,g.talk))}${'♡'.repeat(Math.max(0,3-g.talk))}</p>`,ask?[{label:'✏️ 問題に ちょうせん',cls:'gold',v:'q'},{label:'あとで',cls:'white',v:null}]:[{label:'また おはなし しよう',cls:'gold',v:1}]);
 if(g.talk===3){save.fac=save.fac||{};save.fac.pals=save.fac.pals||{};save.fac.pals[g.sp]=(save.fac.pals[g.sp]||0)+1;toast('💞 レターを つかった とき 来やすく なった！');}
 if(v==='q'){g.qd=true;persist();const r=await miniQuiz(o,`☕ ${g.name}からの もんだい`);
  if(r.ok){g.sat=Math.max(g.sat,95);g.tip=(g.tip||0)+5;givePts(3,`${g.name}の もんだいに せいかい`);sound('fan');confetti(700);
   await dialog(`<div class="dlgArt big">${resPic(o)}</div><h2 class="dlgT">せいかい！ だいまんぞく！</h2><div class="talkBubble"><b>${esc(g.name)}</b>${esc(speak(o,'すごい！ ものしりな 店長さんだね！ また 来るね！'))}</div><p class="dlgP">まんぞく度 アップ！ かえる ときに チップを くれるよ</p>`,[{label:'ありがとう！',cls:'gold',v:1}]);}
  else{g.sat=Math.max(0,g.sat-5);await dialog(`<h2 class="dlgT">おしい！</h2><p class="dlgP">こたえは <b>${esc(r.ans)}</b> だったよ。<br>つぎの おきゃくさんで がんばろう！</p>`);}
  if(curScreen==='myhome')renderMyHome();}
 persist();},true);

/* =====================================================================
   v4.8 のりもの：かったのに はしらない ふぐあい
   ・しゃこに 自動で 入った 車は わくが あけば 自動で はしる
   ・みちが つながっていない 1マスに いる 車は つながった みちへ
   ===================================================================== */
const roadNb=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>isRoadId(save.town.cells[`${x+dx},${y+dy}`])).length;
function autoRun(){const t=save.town;if(!t||!t.autoGar||!t.autoGar.length)return;const c=townCalc(),G=garage();let n=0;
 while(t.autoGar.length&&t.veh.length<c.vehCap){const id=t.autoGar.shift(),i=G.indexOf(id);if(i<0)continue;G.splice(i,1);t.veh.push(id);n++;}
 if(n){persist();setTimeout(()=>toast(`🚗 しゃこで まっていた のりもの ${n}台が はしりだしたよ！`),400);}}
const _buildCars48=buildCars;
buildCars=function(cs){autoRun();const o=_buildCars48.apply(this,arguments);
 const good=roadCells().filter(([x,y])=>roadNb(x,y)>0);
 if(good.length)CAR.list.forEach((c,i)=>{if(roadNb(c.x,c.y)>0)return;const [x,y]=good[(i*7+rint(0,good.length-1))%good.length];c.x=x;c.y=y;c.py=y;placeCar(c,true);});
 return o;};

/* =====================================================================
   v4.9 お店で カフェの ざいりょうを しいれる
   ・八百屋：やさい・くだもの（もとから）＋ミルク・たまご
   ・コンビニ：ミルク・たまご・とりにく・ぶたにく・ぎゅうにく
   ===================================================================== */
const CF_PRICE={cf_milk:40,cf_egg:40,cf_chicken:70,cf_pork:70,cf_beef:100};
const CF_SHOP={market:['cf_milk','cf_egg'],konbini:['cf_milk','cf_egg','cf_chicken','cf_pork','cf_beef']};
const _catalog49=catalog;
catalog=function(b){const L=_catalog49.apply(this,arguments);if(!CF_SHOP[b])return L;const g=(save.town.glv||{})[SHOP_KEY]||0;
 return L.concat(CF_SHOP[b].map((id,i)=>({id,kind:'cfm',name:`${RMAT[id]}（カフェよう）`,art:id,price:CF_PRICE[id],only:true,lockG:b==='konbini'&&i>=4?Math.max(0,1-g)&&1:0})));};
const _dialog49=dialog;
dialog=function(){const p=_dialog49.apply(this,arguments);try{$$('#dlgBody [data-sbuy^="cfm:"]').forEach(btn=>{const id=btn.dataset.sbuy.split(':')[1],sm=btn.closest('.siIt')?.querySelector('small');if(sm)sm.textContent=`もっている ${cafeStock()[id]||0}`;});}catch(e){}return p;};
window.addEventListener('click',e=>{const sb=e.target.closest('[data-sbuy^="cfm:"]');if(!sb)return;e.stopImmediatePropagation();e.preventDefault();
 const [,id,price]=sb.dataset.sbuy.split(':'),p=+price;if(save.points.bal<p){toast('ポイントが たりないよ');return;}
 const S=cafeStock();S[id]=(S[id]||0)+1;givePts(-p,`${SHOPS[save.town.cells[SHOP_KEY]]?.n||'お店'}で ${RMAT[id]}を かった`);persist();sound('ok');
 const card=sb.closest('.siIt');card.classList.add('bought');card.querySelector('small').textContent=`もっている ${S[id]}`;},true);

/* =====================================================================
   v5.0 カフェの かいほう：畑・八百屋・ぼくじょうが ぜんぶ おける Lv から
   シマくんが せつめい
   ===================================================================== */
const CAFE_NEED=['field','market','ranch'];
const cafeLv=()=>Math.max(...CAFE_NEED.map(id=>ITEM(id)?.lv||1));
const tLv=()=>(save.town?.lv||0)+1;
const cafeOK=()=>tLv()>=cafeLv()||C().on;
const needHTML=()=>`<div class="need50">${CAFE_NEED.map(id=>{const it=ITEM(id),ok=tLv()>=(it.lv||1);return `<span class="${ok?'ok':''}">${picHTML(it)}<b>${esc(it.name)}</b><small>${ok?'かいほう ずみ':`まちLv${it.lv}`}</small></span>`;}).join('')}</div>`;
const _openCafeShop50=openCafeShop;
openCafeShop=async function(){
 if(!cafeOK()){await dialog(`<div class="dlgArt">${imgTag('cafe_sign')}</div><h2 class="dlgT">カフェは まちLv${cafeLv()}から</h2><p class="dlgP">カフェの ざいりょうを つくる 畑・八百屋・ぼくじょうが<br>ぜんぶ おけるように なったら ひらけるよ！</p>${needHTML()}`,[{label:'わかった',cls:'gold',v:1}],'wide');return;}
 return _openCafeShop50.apply(this,arguments);};
const _renderMyHome50=renderMyHome;
renderMyHome=function(){const o=_renderMyHome50.apply(this,arguments);
 if(!cafeOK()){const b=$('#btnCafe46');if(b){b.innerHTML=`${imgTag('cafe_coffee','btnIc48')} カフェ（まちLv${cafeLv()}で かいほう）`;b.classList.add('lk50');}
  const r=$('#roomBarBox [data-room="cafe"]');if(r){r.classList.remove('rcan');r.classList.add('rlock');const i=r.querySelector('i');if(i)i.textContent='🔒';const sm=r.querySelector('small');if(sm)sm.textContent=`まちLv${cafeLv()}`;}}
 else $('#btnCafe46')?.classList.remove('lk50');
 return o;};
let cafeAnnBusy=false;
async function cafeAnnounce(){
 const U=save.unlock45||(save.unlock45={});if(U.cafe||cafeAnnBusy||!save.town)return;
 if(C().on){U.cafe=1;persist();return;}
 if(tLv()<cafeLv())return;
 if($('#dlg')?.classList.contains('show')||$('#story')?.classList.contains('show')||$('#loader')||(typeof TU!=='undefined'&&TU.on))return;
 cafeAnnBusy=true;U.cafe=1;persist();sound('fan');confetti(1400);
 try{const v=await dialog(`<div class="ann50">${picHTML({art:'bird_cheer',emoji:'🐦'})}<div class="talkBubble"><b>シマくん</b>${esc(pKun())}、畑・八百屋・ぼくじょうが ぜんぶ そろったね！ <span class="hl50">「おうちカフェ」</span>が ひらけるように なったよ！</div></div>
  <div class="annSteps50"><div><i>1</i>${imgTag('cafe_sign')}<span>「わたしの家」で<br>カフェの へやを つくる</span></div><div><i>2</i>${imgTag('cafe_crate')}<span>畑・八百屋・ぼくじょうの<br>ざいりょうを のうひん</span></div><div><i>3</i>${imgTag('cafe_coffee')}<span>どうぶつが 食べに 来て<br>うりあげが ポイントに！</span></div></div>
  <p class="dlgP facNote">机と いす いがいは すきな 家具で かざれるよ。メニューを じぶんで 食べると ポイントが ふえる ボーナスも！</p>`,[{label:'わたしの家へ いく',cls:'gold',v:'go'},{label:'あとで',v:null}],'wide gold');
  if(v==='go')show('myhome');}finally{cafeAnnBusy=false;}
}
setInterval(cafeAnnounce,2500);
const _doLevelUp50=doLevelUp;
doLevelUp=async function(){const o=await _doLevelUp50.apply(this,arguments);setTimeout(cafeAnnounce,1200);return o;};

/* =====================================================================
   v5.0 ものがたり だい3しょう（Lv7）・だい4しょう（Lv10）
   ===================================================================== */
const IMG50='./assets/images/v50/';
['c3_1','c3_2','c3_3','c3_4','c3_5','c3_6','c4_1','c4_2','c4_3','c4_4','c4_5','c4_6'].forEach(k=>DEFAULT_ART[k]=IMG50+k+'.jpg');
const chOptsN=(v,near)=>{const s=new Set([v]);let g=0;while(s.size<4&&g++<60){const w=near();if(w!==v&&w>0)s.add(w);}return shuffle([...s]);};
function ch3Q(k){
 if(k===0){const x=choice([20,30,40,50,60]),y=ri(2,5),v=x*y;return {html:`<small>きしゃは 1じかんに ${x}km はしるよ。</small>${y}じかんでは なんkm？`,v:v+'km',opts:chOptsN(v,()=>v+choice([-x,x,-10,10,x*2])).map(n=>n+'km')};}
 if(k===1){const n=ri(3,8),e=ri(3,9),t=n*e;return {html:`<small>きしゃの せきは ${t}こ。</small>${n}りょうに おなじ かずずつ。<br>1りょう なんせき？`,v:e+'せき',opts:chOptsN(e,()=>e+choice([-2,-1,1,2,3])).map(n=>n+'せき')};}
 const h=ri(1,10),m=choice([10,15,20,30,40]),add=choice([20,25,35,45,50]),tm=h*60+m+add,f=x=>`${Math.floor(x/60)}じ${x%60?`${x%60}ふん`:''}`;
 const opts=shuffle([...new Set([tm,tm+10,tm-10,tm+60].map(f))]);
 return {html:`<small>いまは ${h}じ${m}ふん。</small>${add}ぷん あとに しゅっぱつ！<br>しゅっぱつは なんじ なんぷん？`,v:f(tm),opts};
}
function ch4Q(k){
 const L=k===1?GREET.map(g=>[g[0],g[1]]):EW2[k===0?'nature':'town'];const w=choice(L);
 const opts=shuffle([...new Set([w[1],...shuffle(L.filter(x=>x[1]!==w[1]).map(x=>x[1])).slice(0,3)])]);
 return {html:`<small>ふねからの えいごの あいず</small><b class="enW">${esc(w[0])}</b><br>の いみは？`,v:w[1],opts};
}
CHAPTERS.ch3={no:3,lv:7,title:'トンネルの えきと まいごの きしゃ',cover:'c3_6',hp:'クラクラ 🌑',beat:'クラクラから ひかりを とりもどした',
 quiz(k){return ch3Q(k);},
 pages:[
 {fx:55,img:'c3_1',mood:'bright',who:'シマくん',txt:'{kun}、まちが とうとう「都市」に なったよ！ たかい ビルも いっぱいだね！'},
 {fx:80,img:'c3_1',mood:'warm',who:'ハナ',txt:'見て、たにの むこうの えき……。きしゃが トンネルに すいこまれたまま、出てこないの。'},
 {fx:70,img:'c3_2',mood:'dark',who:'ハナ',txt:'えきの とけいが とまってる！ トンネルから くらやみが あふれてきてる……！'},
 {fx:60,img:'c3_3',mood:'dark',sfx:'knock',txt:'「クラクラ～。ひかりも じかんも ぜーんぶ たべちゃうぞ～」 にがて大王の けらい、クラクラが あらわれました。'},
 {fx:40,img:'c3_3',mood:'dark',who:'シマくん',txt:'じかんと けいさんの もんだいで、トンネルに ひかりを とりもどそう！ {kun}、いくよ！',quiz:1},
 {fx:70,img:'c3_4',mood:'lively',sfx:'light',who:'シマくん',txt:'とどけ、まなびの ひかり～っ！ 「クラ～……め、めが まわる～っ!?」 トンネルの あかりが つぎつぎ ともったよ！'},
 {fx:55,img:'c3_5',mood:'bright',who:'モグ',txt:'たすかりました！ わたしは きしゃの うんてんし、モグラの モグです。くらくて すすめなかったんです。'},
 {fx:55,img:'c3_5',mood:'warm',who:'モグ',txt:'おれいに {kun}の 都市まで きしゃを はしらせますよ！ わたしも ひっこして いいですか？'},
 {fx:35,img:'c3_6',mood:'theme',who:'ハナ',txt:'きしゃが トンネルを ぬけたよ！ むこうに うみと みなとが 見える！'},
 {fx:85,img:'c3_6',mood:'warm',who:'シマくん',txt:'でも……みなとの とうだいの ひかりが きえてる。まちが「みなと大都市」（Lv10）に なったら、いってみよう！',fin:1}
 ]};
CHAPTERS.ch4={no:4,lv:10,title:'みなとの とうだいと えいごの ふね',cover:'c4_5',hp:'ザブザブ 🌊',beat:'ザブザブから とうだいの ひかりを とりもどした',
 quiz(k){return ch4Q(k);},
 pages:[
 {fx:30,img:'c4_1',mood:'bright',who:'ハナ',txt:'{kun}の まちが「みなと大都市」に なったね！ ふねも かもめも いっぱい！'},
 {fx:85,img:'c4_1',mood:'warm',who:'シマくん',txt:'でも あの とうだい、まだ くらいまま……。よるに なると ふねが まよっちゃうよ。'},
 {fx:40,img:'c4_2',mood:'dark',sfx:'knock',txt:'その よる。あらしの うみで、とおい くにから きた 大きな ふねが、きりの 中で まいごに なっていました。'},
 {fx:65,img:'c4_3',mood:'dark',txt:'「ザブザブ～！ この ひかりは ぼくの たからもの～。かえさないよ～」 にがて大王の けらい、ザブザブが とうだいの ランプを だきしめています。'},
 {fx:55,img:'c4_3',mood:'dark',who:'シマくん',txt:'ふねからの あいずは えいごだ！ いみを こたえて、ひかりを とどけよう！ {kun}、いくよ！',quiz:1},
 {fx:65,img:'c4_4',mood:'lively',sfx:'light',who:'シマくん',txt:'いっけ～！ {kun}の ひかり！ 「ザ、ザブ～～ん!?」 とうだいに ひかりが もどって、きりが はれていく！'},
 {fx:55,img:'c4_5',mood:'bright',who:'マリン',txt:'Thank you！ ありがとう！ わたしは せんちょうの アザラシ、マリン。ひかりの おかげで みなとに つけたよ。'},
 {fx:40,img:'c4_5',mood:'warm',who:'マリン',txt:'この まち、とっても すてき！ わたしも ここに すんで、みんなに えいごを おしえても いいかな？'},
 {fx:75,img:'c4_6',mood:'dark',who:'ハナ',txt:'見て！ とうだいの ひかりの さきに……そらに うかぶ おしろ！'},
 {fx:40,img:'c4_6',mood:'warm',who:'シマくん',txt:'あれが にがて大王の おしろだ……。まちを「ゆめの都」（Lv12）まで そだてたら、おしろへ のりこもう！ {kun}、いっしょに がんばろう！',fin:1}
 ]};
['ch3','ch4'].forEach(id=>{if(!CH_ORDER.includes(id))CH_ORDER.push(id);});
const CH_GIFT={ch3:{pt:200,sp:'mole',name:'モグ',star:2,line:'🚂 モグラの「モグ」が ひっこしてきたよ！'},ch4:{pt:300,sp:'seal',name:'マリン',star:3,line:'⚓ アザラシの「マリン」せんちょうが ひっこしてきたよ！'}};
const _chReward50=chReward;
chReward=function(id){const G=CH_GIFT[id];if(!G)return _chReward50.apply(this,arguments);
 save.story=save.story||{};const key=id+'gift';if(save.story[key])return '🎁 ごほうびは もう もらったよ';save.story[key]=1;
 let out=`🎁 ごほうび：${G.pt}pt`;addPoints(G.pt,`ものがたり だい${CHAPTERS[id].no}しょう`,true);
 const t=save.town,c=townCalc(),sp=SPECIES.find(s=>s.id===G.sp),h=sp&&findHome(sp);
 if(sp&&h&&nonHuman().length<c.maxRes){const r=newResident(sp);r.name=G.name;r.home=h.key;r.star=Math.max(r.star||1,G.star);t.res.push(r);discover(r.sp);out+='<br>'+G.line;}
 else{t.bag.goldletter=(t.bag.goldletter||0)+1;out+=`<br>✨ きらきらレター ×1（${sp?esc(homeName(sp.home)):'家'}が あいたら よんでね）`;}
 if(id==='ch4'){t.bag.rankbook=(t.bag.rankbook||0)+1;out+='<br>📘 ランクアップの本 ×1';}
 persist();try{updatePill();}catch(e){}return out;};
/* おしらせの ことば（章ごと） */
const LV_NAME={2:'村',5:'町',7:'都市',10:'みなと大都市'};
chOffer=async function(auto){
 const id=chNext();if(!id||CHS.id||$('#story')?.classList.contains('show')||(typeof TU!=='undefined'&&TU.on)||$('#dlg')?.classList.contains('show'))return;
 const Ch=CHAPTERS[id];
 const v=await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(Ch.cover))}" alt="" style="width:100%;border-radius:14px;object-fit:cover;height:150px"></div>
  <h2 class="dlgT">📜 ものがたりの つづきが とどいたよ！</h2><p class="dlgP">だい${Ch.no}しょう「<b>${esc(Ch.title)}</b>」<br>${auto?`「${LV_NAME[Ch.lv]||'まち'}」に なった おいわいに、シマくんが よんでるよ。`:''}</p>`,
  [{label:'あとで',cls:'white',v:false},{label:'📜 見る！',cls:'gold',v:true}],'wide');
 if(v)storyOpenCh(id,()=>{renderCurrent?.();});};

/* =====================================================================
   v5.1 信号機：ショップ・トレイでは イラスト（まちの 上は いままでどおり）
   ===================================================================== */
const IMG51='./assets/images/v51/';
DEFAULT_ART.dc_signal=IMG51+'shop_signal.webp';
['trn_3car','tq_ticket','tq_gate','tq_platform','tq_crossing','tq_driver','tq_inside','tq_clock','shop_signal'].forEach(k=>{if(k!=='trn_3car'||!DEFAULT_ART[k])DEFAULT_ART[k]=IMG51+k+'.webp';});

/* =====================================================================
   v5.1 3りょう へんせいの 電車 ＋ 電車を タッチすると 電車クイズ
   ===================================================================== */
if(!TOWN_ITEMS.some(x=>x.id==='train3'))TOWN_ITEMS.push({id:'train3',type:'train',name:'3りょう へんせいの 電車',art:'trn_3car',emoji:'🚃',price:1800,lv:5,traffic:28,income:8});
try{ZUKAN_INFO.train3='3りょう つながった 電車。たくさんの ひとを はこべるよ。';}catch(e){}
const TQ_KIND=[['trn_steam','SL（じょうき きかんしゃ）'],['trn_shinkansen','新かんせん'],['trn_tram','ろめん電車'],['trn_freight','かもつ列車'],['en_subway','ちかてつ'],['trn_3car','3りょう へんせいの 電車']];
const tqImg=k=>`<div class="tqPic"><img src="${esc(artSrc(k))}" alt=""></div>`;
const tqOpts=(a,pool)=>shuffle([a,...shuffle(pool.filter(x=>x!==a)).slice(0,3)]);
const TQ=[
 ()=>{const k=choice(TQ_KIND.filter(x=>artSrc(x[0])));return {img:k[0],q:'この のりものの なまえは？',a:k[1],o:tqOpts(k[1],TQ_KIND.map(x=>x[1]))};},
 ()=>{const n=ri(12,48),a=n*3;return {img:'trn_3car',q:`1りょうに ${n}人 のっています。<br>3りょう ぜんぶで なん人？`,a:a+'人',o:tqOpts(a+'人',[a+3,a-3,n*2,a+10,n+3].map(x=>x+'人'))};},
 ()=>{const n=ri(60,150),k=ri(2,4),c=choice([3,4,5]),a=n*k;return {img:'trn_3car',q:`ある えきで ${c}りょうの 電車から ${n}人ずつ、<br>${k}本ぶん おりました。（1本あたり ${n}人）<br>ぜんぶで なん人？`,a:a+'人',o:tqOpts(a+'人',[a+n,a-n,n*c,a+10].map(x=>x+'人'))};},
 ()=>{const v=choice([60,80,120,200,250]),h=ri(2,4),a=v*h;return {img:'trn_shinkansen',q:`1じかんに ${v}km すすむ 電車が<br>${h}じかん はしると なんkm？`,a:a+'km',o:tqOpts(a+'km',[a+v,a-v,v+h,a+50].map(x=>x+'km'))};},
 ()=>{const h=ri(6,9),m=choice([5,10,15,20,25,35]),d=choice([15,20,25,30,40,45]),t=h*60+m+d,f=x=>`${Math.floor(x/60)}じ${x%60?(x%60)+'ふん':''}`;return {img:'tq_clock',q:`${h}じ${m}ふんに しゅっぱつして、<br>${d}ぷん のると つくのは？`,a:f(t),o:tqOpts(f(t),[t+10,t-10,t+60,t-5,t+5].map(f))};},
 ()=>{const p=choice([140,160,200,240,280,320]);return {img:'tq_ticket',q:`おとなの きっぷが ${p}円。<br>こどもは おとなの はんぶん。こどもは なん円？`,a:p/2+'円',o:tqOpts(p/2+'円',[p,p/2+10,p/2-10,p*2,p/4].map(x=>x+'円'))};},
 ()=>({img:'tq_crossing',q:'ふみきりの かねが なって、<br>しゃだんきが おりてきた。どうする？',a:'とまって まつ',o:tqOpts('とまって まつ',['いそいで わたる','しゃだんきを くぐる','せんろで まつ'])}),
 ()=>({img:'tq_platform',q:'えきの ホームで 電車を まつ ときは？',a:'きいろい せんの うちがわで まつ',o:tqOpts('きいろい せんの うちがわで まつ',['きいろい せんの そとで まつ','ホームを はしって まつ','せんろを のぞいて まつ'])}),
 ()=>({img:'tq_gate',q:'きっぷや カードを タッチして<br>えきに 入る ところは？',a:'かいさつ',o:tqOpts('かいさつ',['ホーム','うんてんせき','ふみきり'])}),
 ()=>({img:'tq_driver',q:'電車を うんてんする 人を なんと いう？',a:'うんてんし',o:tqOpts('うんてんし',['えきいん','パイロット','しょうぼうし'])}),
 ()=>({img:'tq_inside',q:'電車の 中で よい マナーは？',a:'おとしよりに せきを ゆずる',o:tqOpts('おとしよりに せきを ゆずる',['大きな こえで さわぐ','ドアに もたれる','くつの まま せきに 立つ'])}),
 ()=>({img:'shop_signal',q:'せんろの しんごうが 赤の とき、<br>電車は どうする？',a:'とまる',o:tqOpts('とまる',['すすむ','いそぐ','バックする'])}),
 ()=>{const w=choice([['trn_3car','train','でんしゃ'],['tq_platform','station','えき'],['tq_ticket','ticket','きっぷ'],['tq_driver','driver','うんてんし']]);return {img:w[0],q:`「${w[2]}」は えいごで？`,a:w[1],o:tqOpts(w[1],['train','station','ticket','driver','bus','ship']),say:w[1]};},
 ()=>{const n=ri(3,6),m=ri(2,5);return {img:'trn_freight',q:`かもつ列車に はこが ${n}こずつ のった<br>しゃりょうが ${m}りょう。はこは ぜんぶで？`,a:n*m+'こ',o:tqOpts(n*m+'こ',[n+m,n*m+n,n*m-m,n*(m+1)].map(x=>x+'こ'))};}
];
let tqBusy=false;
async function trainQuiz(id){
 if(tqBusy)return;tqBusy=true;
 try{const it=ITEM(id),Q=choice(TQ)(),D=save.tq=save.tq&&save.tq.d===dayKey()?save.tq:{d:dayKey(),n:0};
  const v=await dialog(`<div class="tqHead">${picHTML(it)}<b>🚃 ${esc(it?.name||'電車')}の クイズ</b></div>${tqImg(Q.img)}<div class="tqQ">${Q.q}</div>${Q.say?sayBtn(Q.say):''}`,Q.o.map(o=>({label:esc(o),cls:'white big',v:o})).concat([{label:'やめる',cls:'white',v:null}]),'wide quiz tqDlg');
  if(v==null)return;const ok=v===Q.a;sound(ok?'ok':'ng');
  if(ok){const give=D.n<10;D.n++;persist();if(give)givePts(8,'電車クイズ せいかい');confetti(600);
   await dialog(`${tqImg(Q.img)}<h2 class="dlgT">せいかい！</h2><p class="dlgP">${give?'<span class="coin sm">P</span> ポイント ゲット！':'きょうの ポイントは おしまい。でも べんきょうに なったね！'}<br><small>電車を タッチすると また 出るよ（ポイントは 1日10回まで）</small></p>`,[{label:'やったー',cls:'gold',v:1}]);}
  else await dialog(`${tqImg(Q.img)}<h2 class="dlgT">おしい！</h2><p class="dlgP">こたえは <b>${esc(Q.a)}</b> だったよ。</p>`,[{label:'つぎは がんばる',cls:'gold',v:1}]);
 }finally{tqBusy=false;}
}
document.addEventListener('click',e=>{const b=e.target.closest('#railStrip .mover.train,.mover.train');if(!b||curScreen!=='town'||townEdit)return;e.stopImmediatePropagation();e.preventDefault();trainQuiz(b.dataset.id);},true);
})();


/* =====================================================================
   まなびタウン v5.2
   ① かわ・はし（かわは みちのように つながる／2×2で 池／はしの 上は 人も 車も OK）
   ② よこむきの 信号の 光の むきを なおす
   ③ 公園で あそぶ・学校で まなぶ 演出を ふやす
   ④ ずかん「ものがたりを 見る」で 画面が 白く なって とまる 不具合を なおす（CSS）
   ⑤ まちの 画面を かるく（ふってくる アイコンを とめる・うごきの さいてきか）
   ⑥ つかいかたの せつめい：ふきだしが さいしょから いい 場所に 出る（CSS）
   ===================================================================== */
(function(){
'use strict';
const VER52 = '5.2.0';
const D4 = [[0,-1,'n'],[1,0,'e'],[0,1,'s'],[-1,0,'w']];

/* =====================================================================
   ① かわ・はし
   ===================================================================== */
const RIVER = 'river', BRIDGE = 'road_bridge';
const RV = {L:null};
const curL = () => RV.L || (save.town ? townCalc().L : {cols:6, rows:6});
const isWaterId = id => id===RIVER || id===BRIDGE || id==='sea' || id==='harbor';   // v6.5：海・みなとも 水
window.isWaterId52 = isWaterId;

/* となりが 水か（画面の そとは「水が つづく」あつかい） */
function waterAt(x, y, L){
  if(x < 0 || y < 0 || x >= L.cols || y >= L.rows) return true;
  return isWaterId(save.town.cells[`${x},${y}`]);
}
/* n+e を きじゅんに かいて、rotate で ほかの むきへ */
const ROT = {n:0, e:90, s:180, w:270};
const PAIRS = [['n','e',1,-1,0],['e','s',1,1,90],['s','w',-1,1,180],['w','n',-1,-1,270]];
const ARM = {n:'M23 0H77V50H23Z', e:'M50 23H100V77H50Z', s:'M23 50H77V100H23Z', w:'M0 23H50V77H0Z'};
const ARC_NE = 'M23 0A77 77 0 0 0 100 77L100 23A23 23 0 0 1 77 0Z';      // R の まがりかど
const FILLET_NE = 'M77 9L77 23L91 23A14 14 0 0 1 77 9Z';                 // T字・十字の すみを まるく
const QUAD_NE = 'M50 0H100V50H50Z';                                      // 2×2 いじょうで 池に なる
const rot = (d, deg) => deg ? `<path d="${d}" transform="rotate(${deg} 50 50)"/>` : `<path d="${d}"/>`;
function waterShapes(x, y, L){
  const c = {}; D4.forEach(([dx,dy,d]) => c[d] = waterAt(x+dx, y+dy, L));
  const arms = D4.map(d => d[2]).filter(d => c[d]);
  let sh = '', quads = 0;
  if(!arms.length) return {sh:'<ellipse cx="50" cy="52" rx="34" ry="29"/>', arms, quads:0, pond:true};
  const pureL = arms.length===2 && !((c.n && c.s) || (c.e && c.w));
  PAIRS.forEach(([a,b,dx,dy,deg]) => {
    if(!c[a] || !c[b]) return;
    if(waterAt(x+dx, y+dy, L)){ sh += rot(QUAD_NE, deg); quads++; }
    else if(pureL) sh += rot(ARC_NE, deg);
    else sh += rot(FILLET_NE, deg);
  });
  if(!pureL || quads){ sh = '<circle cx="50" cy="50" r="27"/>' + arms.map(d => `<path d="${ARM[d]}"/>`).join('') + sh; }
  return {sh, arms, quads, pond:false};
}
const hash = (x, y, k=0) => ((x*73856093) ^ (y*19349663) ^ (k*83492791)) >>> 0;
function riverSVG(x, y, L, opt={}){
  const W = waterShapes(x, y, L), h = hash(x, y);
  // きらきら・なみ（水の 上だけ）
  let deco = '';
  const spots = [];
  if(W.pond) spots.push([40,46],[60,58]);
  else { spots.push([44,44]); W.arms.forEach(d => spots.push({n:[48,18],e:[80,47],s:[52,82],w:[18,53]}[d])); }
  spots.forEach(([sx,sy], i) => { if((h >> i) & 1 || i===0) deco += `<path class="wv" d="M${sx-7} ${sy}q3.5 -3.5 7 0t7 0"/>`; });
  if(W.pond && !opt.bridge && h % 3 !== 0) deco += `<g class="lily"><circle cx="${62 + h%7}" cy="${40 + h%9}" r="7"/><path d="M${62 + h%7} ${40 + h%9}l7 -2l-1 5z" class="cut"/></g>`;
  if(W.quads >= 3 && !opt.bridge && h % 4 === 1) deco += `<g class="lily"><circle cx="30" cy="66" r="6"/><path d="M30 66l6 -2l-1 4z" class="cut"/></g>`;
  if(W.pond || W.quads) deco += `<circle class="spk" cx="${30 + h%30}" cy="${30 + (h>>3)%30}" r="1.8"/>`;
  return `<svg class="rv52" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <g class="bank">${W.sh}</g><g class="rim">${W.sh}</g><g class="wat">${W.sh}</g>${deco}${opt.extra||''}</svg>`;
}
/* はし：ゆかの むき */
function bridgeAxis(x, y){
  const t = save.town.cells, L = curL();
  const road = (a,b) => isRoadId(t[`${a},${b}`]) && t[`${a},${b}`]!==BRIDGE;
  const wat = (a,b) => a>=0 && b>=0 && a<L.cols && b<L.rows && (t[`${a},${b}`]===RIVER || t[`${a},${b}`]==='sea');
  const hR = road(x-1,y) || road(x+1,y), vR = road(x,y-1) || road(x,y+1);
  const hW = wat(x-1,y) || wat(x+1,y), vW = wat(x,y-1) || wat(x,y+1);
  const hB = t[`${x-1},${y}`]===BRIDGE || t[`${x+1},${y}`]===BRIDGE, vB = t[`${x},${y-1}`]===BRIDGE || t[`${x},${y+1}`]===BRIDGE;
  if(hR && !vR) return 'h'; if(vR && !hR) return 'v';
  if(vW && !hW) return 'h'; if(hW && !vW) return 'v';
  if(hB && !vB) return 'h'; if(vB && !hB) return 'v';
  return 'h';
}
function deckSVG(ax){
  let planks = ''; for(let i=1;i<10;i++) planks += `<path d="M${i*10} 27V73"/>`;
  const posts = [6,28,50,72,94].map(px => `<rect x="${px-2.5}" y="17" width="5" height="10" rx="1.5"/><rect x="${px-2.5}" y="73" width="5" height="10" rx="1.5"/>`).join('');
  const g = `<g class="deck"><rect class="shadow" x="0" y="29" width="100" height="48"/><rect class="floor" x="0" y="25" width="100" height="50"/><g class="pl">${planks}</g>
    <g class="post">${posts}</g><path class="rail" d="M0 19H100M0 79H100"/></g>`;
  return ax==='v' ? `<g transform="rotate(90 50 50)">${g}</g>` : g;
}
function bridgeHTML(x, y){
  const L = curL(), ax = bridgeAxis(x, y);
  return `<div class="rd brg52 ax-${ax}">${riverSVG(x, y, L, {bridge:true, extra:deckSVG(ax)})}</div>`;
}

/* ---------- アイテム ---------- */
const tileSVG = inner => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect x="4" y="4" width="112" height="112" rx="22" fill="#A9DB86" stroke="#fff" stroke-width="5"/><g transform="translate(10 10)">${inner}</g></svg>`);
const ICON_WATER = (sh, extra='') => `<g fill="#E8D9A8" stroke="#E8D9A8" stroke-width="12" stroke-linejoin="round">${sh}</g>
  <g fill="#4FA9DA" stroke="#4FA9DA" stroke-width="5" stroke-linejoin="round">${sh}</g><g fill="#8AD3F3">${sh}</g>
  <g fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".85"><path d="M30 48q4 -4 8 0t8 0"/><path d="M55 74q4 -4 8 0t8 0"/></g>${extra}`;
const ICON_RIVER_SH = '<path d="M28 0H72V100H28Z"/>';
DEFAULT_ART.bld_river = tileSVG(`<svg viewBox="0 0 100 100" width="100" height="100" overflow="hidden">${ICON_WATER('<path d="M0 18C42 18 44 58 100 58V92C26 92 24 52 0 52Z"/>', '<g><circle cx="72" cy="28" r="8" fill="#67B85A"/><path d="M72 28l8 -2l-1 5z" fill="#A9DB86"/><circle cx="24" cy="80" r="5" fill="#FF9EBB"/><circle cx="24" cy="80" r="2" fill="#FFE27A"/></g>')}</svg>`);
DEFAULT_ART.bld_bridge = tileSVG(`<svg viewBox="0 0 100 100" width="100" height="100" overflow="hidden">${ICON_WATER(ICON_RIVER_SH)}
  <g><rect x="0" y="29" width="100" height="48" fill="rgba(0,0,0,.18)"/><rect x="0" y="25" width="100" height="50" fill="#D6A15F"/>
  <g stroke="#A8743B" stroke-width="2">${[1,2,3,4,5,6,7,8,9].map(i => `<path d="M${i*10} 27V73"/>`).join('')}</g>
  <g fill="#8A5A2B">${[6,28,50,72,94].map(px => `<rect x="${px-3}" y="16" width="6" height="11" rx="2"/><rect x="${px-3}" y="73" width="6" height="11" rx="2"/>`).join('')}</g>
  <path d="M0 19H100M0 79H100" stroke="#B8793A" stroke-width="5" stroke-linecap="round"/></g></svg>`);
if(!TOWN_ITEMS.some(x => x.id===RIVER))
  TOWN_ITEMS.push({id:RIVER, type:'bld', cat:'road', name:'かわ', art:'bld_river', emoji:'\uD83C\uDF0A', price:15, lv:1, dev:1,
    desc:'みちのように つながる・2×2で 池に なる・人も 車も わたれない'});
if(!TOWN_ITEMS.some(x => x.id===BRIDGE))
  TOWN_ITEMS.push({id:BRIDGE, type:'bld', cat:'road', name:'はし', art:'bld_bridge', emoji:'\uD83C\uDF09', price:60, lv:1, dev:3,
    desc:'かわの 上に かける みち・人も 車も わたれる'});
try{ ZUKAN_INFO[RIVER] = 'さらさら ながれる かわ。つなげると 水が つながり、4マス あつめると 池に なるよ。';
     ZUKAN_INFO[BRIDGE] = 'かわの 上を わたれる はし。車も 人も とおれるよ。'; }catch(e){}
try{ ACT_OF[RIVER] = 'fishing'; }catch(e){}
itemEffect = (orig => function(it){
  const s = orig.apply(this, arguments);
  if(it && it.id===RIVER) return `${s ? s + '・' : ''}\uD83C\uDF0A つなげると 水が ながれる・2×2で 池・人も 車も わたれない`;
  if(it && it.id===BRIDGE) return `${s ? s + '・' : ''}\uD83C\uDF09 かわの 上を 人も 車も わたれる`;
  return s;
})(itemEffect);
/* v5.4：かわは グレードアップ しない（タッチすると せつめいだけ） */
openBuilding = (orig => async function(key){
  const id = save.town?.cells?.[key];
  if(id===RIVER){ const it = ITEM(RIVER);
    await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">${esc(it.name)}</h2><p class="dlgP" style="font-size:14px">${esc(itemEffect(it))}</p>`, [{label:'とじる', cls:'white', v:null}], 'wide');
    return; }
  return orig.apply(this, arguments);
})(openBuilding);
picHTML = (orig => function(o, cls=''){
  if(o && o.id===BRIDGE) return `<img class="${cls}" src="${esc(artSrc('bld_bridge'))}" alt="">`;
  return orig(o, cls);
})(picHTML);

/* ---------- みちの 絵：はしは とくべつ・かわへは みちを のばさない ---------- */
roadHTML = (orig => function(x, y){
  const c = save.town.cells;
  if(c[`${x},${y}`]===BRIDGE) return bridgeHTML(x, y);
  let h = orig(x, y);
  D4.forEach(([dx,dy,d]) => { if(c[`${x+dx},${y+dy}`]===RIVER || c[`${x+dx},${y+dy}`]==='sea') h = h.replace(`<i class="x x-${d}"></i>`, ''); });
  return h;
})(roadHTML);

/* ---------- マップに かわを かく ---------- */
function drawRivers(){
  const map = $('#townMap'); if(!map || !save.town) return;
  const L = curL();
  Object.entries(save.town.cells).forEach(([k,id]) => {
    if(id!==RIVER) return; const [x,y] = k.split(',').map(Number);
    const cell = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`); if(!cell) return;
    cell.querySelectorAll('.bimg,.rv52').forEach(e => e.remove());
    cell.classList.add('river52'); cell.style.zIndex = 1;
    cell.insertAdjacentHTML('afterbegin', riverSVG(x, y, L));
  });
}

/* =====================================================================
   ② よこむきの 信号：光が 出る むきを はんたいに
   ===================================================================== */
// sig49 の「flip」は 左むき（'l'）に ついていた → 右むき（'r'）に つけかえる
function fixSignals(){
  $$('#townMap .sig49.fh').forEach(e => { if(e.dataset.f52) return; e.dataset.f52 = 1; e.classList.toggle('flip'); });
}

/* =====================================================================
   ③ 公園・学校の 演出
   ===================================================================== */
const GAME_KEY = {'おにごっこ':'tag','かくれんぼ':'hide','ブランコ':'swing','すべりだい':'slide','なわとび':'rope','ボールあそび':'ball'};
const gameKey = () => GAME_KEY[(save.fac?.park?.game||[])[0]] || 'ball';
const PROP = {
  ball:'<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#fff" stroke="#E8414B" stroke-width="1.6"/><path d="M3 8q7 3 14 0M4 13q6 -3 12 0" stroke="#E8414B" stroke-width="1.4" fill="none"/></svg>',
  rope:'<svg viewBox="0 0 40 30"><path d="M3 4Q20 34 37 4" fill="none" stroke="#E86AA0" stroke-width="2.4" stroke-linecap="round"/><rect x="0" y="0" width="6" height="7" rx="2" fill="#7A5BD6"/><rect x="34" y="0" width="6" height="7" rx="2" fill="#7A5BD6"/></svg>',
  swing:'<svg viewBox="0 0 40 40"><path d="M2 38L8 2H32L38 38" fill="none" stroke="#C0563F" stroke-width="3" stroke-linecap="round"/><g class="sw52"><path d="M14 3V30M26 3V30" stroke="#8A8F98" stroke-width="1.4"/><rect x="11" y="29" width="18" height="4" rx="2" fill="#F2B33D"/></g></svg>',
  slide:'<svg viewBox="0 0 40 40"><path d="M6 38V8H12V38" fill="none" stroke="#4E9BD6" stroke-width="2.4"/><path d="M8 12h2M8 18h2M8 24h2M8 30h2" stroke="#4E9BD6" stroke-width="2"/><path d="M12 8Q22 10 28 26T38 37" fill="none" stroke="#F06C5A" stroke-width="5" stroke-linecap="round"/></svg>',
  hide:'<svg viewBox="0 0 40 30"><ellipse cx="12" cy="20" rx="12" ry="10" fill="#5DB35A"/><ellipse cx="28" cy="19" rx="12" ry="11" fill="#6CC468"/><ellipse cx="20" cy="14" rx="10" ry="9" fill="#7BD176"/><circle cx="14" cy="16" r="1.6" fill="#FF8FB1"/><circle cx="28" cy="13" r="1.6" fill="#FFD84D"/></svg>',
  tag:'<svg viewBox="0 0 30 16"><path d="M2 12h8M4 7h10M2 2h7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".95"/></svg>'
};
const nextTo = (s, id) => { for(const [dx,dy] of D4){ const k = `${s.x+dx},${s.y+dy}`; if(save.town.cells[k]===id) return k; } return null; };
try{ ACTS.learned = {h:'\uD83D\uDCA1', cls:'jump'}; }catch(e){}

function fxWalker(s, a){
  const el = s.el; if(!el) return;
  el.querySelectorAll('.pp52').forEach(e => e.remove());
  if(a==='play' && nextTo(s, 'park')){
    const g = gameKey(); s.game52 = g;
    el.classList.add('pl52', 'pl-'+g);
    if(s.left < 9) s.left = rint(9, 14);
    if(PROP[g]) el.insertAdjacentHTML('beforeend', `<i class="pp52 pp-${g}">${PROP[g]}</i>`);
  } else if(a==='study' && nextTo(s, 'school')){
    if(s.left < 10) s.left = rint(10, 15); s.study52 = 1;
    setTimeout(() => { if(s.act==='study' && s.el===el){ el.classList.add('inSchool52'); liveSoon(); } }, 900);
  }
  liveSoon();
}
const _showAct52 = showAct;
showAct = function(s, a){ const o = _showAct52.apply(this, arguments); try{ fxWalker(s, a); }catch(e){ console.warn(e); } return o; };
const _clearAct52 = clearAct;
clearAct = function(s){
  const was = s.act, st = s.study52; s.study52 = 0; s.game52 = null;
  const o = _clearAct52.apply(this, arguments);
  try{
    if(s.el) s.el.querySelectorAll('.pp52').forEach(e => e.remove());
    if(was==='study' && st && s.el){ s.act = 'learned'; s.left = 3; showAct(s, 'learned'); if(Math.random() < 0.5) sfx52('ding'); }
    liveSoon();
  }catch(e){ console.warn(e); }
  return o;
};

/* まちの 上：公園で あそんでいる・学校で じゅぎょう中 */
const BOARD = [['1+2=3','あいう','ABC','3×4=12'],['にじ','かんじ','12÷3=4','Hello'],['🌱→🌻','100+50','みず H₂O','やま 山']];
let liveT = 0;
function liveSoon(){ clearTimeout(liveT); liveT = setTimeout(updateLive, 120); }
function updateLive(){
  if(curScreen!=='town' || !save.town) return;
  const map = $('#townMap'); if(!map) return;
  const play = {}, study = {};
  WK.st.forEach(s => {
    if(!s.el) return;
    if(s.act==='play'){ const k = nextTo(s, 'park'); if(k) play[k] = (play[k]||0) + 1; }
    if(s.act==='study' && s.el.classList.contains('inSchool52')){ const k = nextTo(s, 'school'); if(k) study[k] = (study[k]||0) + 1; }
  });
  Object.entries(save.town.cells).forEach(([k,id]) => {
    if(id!=='park' && id!=='school') return;
    const [x,y] = k.split(','), c = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`); if(!c) return;
    const n = (id==='park' ? play : study)[k] || 0, cur = c.querySelector('.live52');
    if(!n){ if(cur) cur.remove(); c.classList.remove('liveOn52'); return; }
    if(cur && +cur.dataset.n===n) return;
    if(cur) cur.remove();
    c.classList.add('liveOn52');
    if(id==='park'){
      const g = gameKey(), name = (save.fac?.park?.game||['あそび'])[0];
      c.insertAdjacentHTML('beforeend', `<div class="live52 pk52 g-${g}" data-n="${n}"><span class="tag52">${esc(name)}</span>
        <i class="nt52 a">♪</i><i class="nt52 b">♫</i><i class="nt52 c">♡</i></div>`);
    } else {
      const b = choice(BOARD);
      if(!cur) sfx52('chime');
      c.insertAdjacentHTML('beforeend', `<div class="live52 sc52" data-n="${n}"><div class="board52">${b.map((t,i) => `<b style="animation-delay:${i*2}s">${esc(t)}</b>`).join('')}</div>
        <span class="tag52">じゅぎょう中 ✏️${n}</span></div>`);
    }
  });
}

/* おと（おんがく せっていに したがう） */
function sfx52(k){
  try{
    if(!save.settings.sound) return; smCtx(); const t = SM.ctx.currentTime;
    SM.master.gain.cancelScheduledValues(t); SM.master.gain.setValueAtTime(Math.max(SM.master.gain.value, 0.6), t);
    if(k==='chime') [['E5',0],['C5',.42],['D5',.84],['G4',1.26],['G4',1.9],['D5',2.32],['E5',2.74],['C5',3.16]].forEach(([n,d]) => nt(NOTE(n), t+d, 0.9, 'sine', 0.05));
    if(k==='ding') nt(NOTE('A5'), t, 0.5, 'sine', 0.05);
    if(k==='play') [['C5',0],['E5',.12],['G5',.24],['E5',.36],['C6',.5]].forEach(([n,d]) => nt(NOTE(n), t+d, 0.25, 'triangle', 0.05));
  }catch(e){}
}

/* ダイアログの 中：公園・学校の ぶたい */
const PARK_BG = `<svg class="bg52" viewBox="0 0 300 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect width="300" height="120" fill="#CFEFFF"/><circle cx="262" cy="22" r="13" fill="#FFE27A"/>
  <ellipse cx="60" cy="24" rx="22" ry="8" fill="#fff" opacity=".9"/><ellipse cx="190" cy="16" rx="18" ry="6" fill="#fff" opacity=".85"/>
  <path d="M0 78Q75 62 150 74T300 70V120H0Z" fill="#9FD97C"/><path d="M0 96Q90 84 170 94T300 90V120H0Z" fill="#86CB66"/>
  <g transform="translate(18 40)"><rect x="9" y="22" width="6" height="22" fill="#9A6A3C"/><circle cx="12" cy="18" r="16" fill="#5DB35A"/><circle cx="4" cy="24" r="10" fill="#6CC468"/></g>
  <g transform="translate(250 44)"><rect x="9" y="20" width="6" height="22" fill="#9A6A3C"/><circle cx="12" cy="16" r="14" fill="#5DB35A"/></g>
  <g transform="translate(206 46)" fill="none" stroke-linecap="round"><path d="M2 34L8 2H30L36 34" stroke="#C0563F" stroke-width="3"/>
    <g class="sw52"><path d="M14 3V24M24 3V24" stroke="#8A8F98" stroke-width="1.2"/><rect x="11" y="23" width="16" height="3" rx="1.5" fill="#F2B33D" stroke="none"/></g></g>
  <g transform="translate(52 50)" fill="none" stroke-linecap="round"><path d="M4 32V6H9V32" stroke="#4E9BD6" stroke-width="2.4"/><path d="M9 6Q18 8 23 22T34 32" stroke="#F06C5A" stroke-width="5"/></g>
  <g fill="#FF8FB1"><circle cx="120" cy="100" r="2.4"/><circle cx="160" cy="106" r="2.4"/></g><g fill="#FFE27A"><circle cx="140" cy="104" r="2.4"/><circle cx="96" cy="108" r="2.4"/></g></svg>`;
const SCHOOL_BG = b => `<div class="bg52"><div class="cb52"><span>${b.map((t,i) => `<b style="animation-delay:${i*1.6}s">${esc(t)}</b>`).join('')}</span><i class="chalk52"></i></div>
  <img class="tch52" src="${esc(artSrc('bird_think') || '')}" alt=""><div class="win52"></div></div>`;
function stage52(html){
  if(typeof html !== 'string' || html.indexOf('whoRow') < 0) return html;
  const isPark = html.includes('公園</h2>') && !html.includes('病院');
  const parkDone = html.includes('たのしかった！</h2>');
  const isSchool = html.includes('学校</h2>');
  const schoolWin = html.includes('じゅぎょう だいせいこう！');
  if(isPark || parkDone){
    const g = gameKey();
    if(parkDone) sfx52('play');
    return html.replace('<div class="whoRow">', `<div class="whoRow stage52 pkS52 g-${g} ${parkDone ? 'done52' : ''}">${PARK_BG}<i class="gp52">${PROP[g]||''}</i>`);
  }
  if(isSchool || schoolWin){
    if(schoolWin) sfx52('chime');
    return html.replace('<div class="whoRow">', `<div class="whoRow stage52 scS52 ${schoolWin ? 'win52' : ''}">${SCHOOL_BG(choice(BOARD))}`);
  }
  return html;
}
const _dialog52 = dialog;
dialog = function(html, btns, cls){ try{ html = stage52(html); }catch(e){ console.warn(e); } return _dialog52.call(this, html, btns, cls); };

/* =====================================================================
   ⑤ かるく する
   ===================================================================== */
// イベントの ふってくる アイコンは まちの 画面では 出さない
evFx = (orig => function(){
  if(curScreen==='town'){ const b = $('#evFx'); if(b && b.innerHTML){ b.innerHTML = ''; } if(b) b.dataset.e = ''; return; }
  return orig.apply(this, arguments);
})(evFx);
// 住民の うごき：うごいている ときだけ かきなおす・みんな とまったら ループを やすむ
movLoop = function(t){
  const dt = Math.min(0.05, (t - MOV.last)/1000); MOV.last = t;
  const sp = WK.cs/0.66; let busy = false;
  WK.st.forEach(s => {
    if(!s.el || s.tx==null) return;
    const dx = s.tx - s.px, dy = s.ty - s.py, d = Math.hypot(dx, dy);
    if(d < 0.4){
      if(s.mvg){ s.mvg = false; s.el.classList.remove('moving'); }
      if(s.px !== s.tx || s.py !== s.ty){ s.px = s.tx; s.py = s.ty; paintW(s); }
    } else {
      busy = true; const st = Math.min(d, sp*dt); s.px += dx/d*st; s.py += dy/d*st;
      if(!s.mvg){ s.mvg = true; s.el.classList.add('moving'); }
      paintW(s);
    }
  });
  if(curScreen==='town' && busy && !document.hidden) MOV.raf = requestAnimationFrame(movLoop); else MOV.raf = 0;
};
// 車：left/top ではなく translate で うごかす（GPUで なめらか・かるい）
placeCar = (orig => function(c, instant){
  const r = orig.apply(this, arguments);
  const el = c && c.el; if(!el) return r;
  const L = parseFloat(el.style.left), T = parseFloat(el.style.top); if(isNaN(L) || isNaN(T)) return r;
  if(instant) el.style.setProperty('transition', 'none', 'important');
  el.style.translate = `${L.toFixed(1)}px ${T.toFixed(1)}px`; el.style.left = '0px'; el.style.top = '0px';
  if(instant){ void el.offsetWidth; el.style.removeProperty('transition'); }
  return r;
})(placeCar);

/* =====================================================================
   マップを かいた あとに まとめて
   ===================================================================== */
renderMap = (orig => function(){
  try{ RV.L = save.town ? townCalc().L : null; }catch(e){ RV.L = null; }
  const o = orig.apply(this, arguments);
  try{ drawRivers(); fixSignals(); updateLive(); }catch(e){ console.warn(e); }
  RV.L = null;
  return o;
})(renderMap);
// 信号は 5びょうごとなどに かきなおされる ことが あるので 見はる
(function(){
  const m = $('#townMap'); if(!m || !window.MutationObserver) return;
  new MutationObserver(muts => { if(muts.some(x => [...x.addedNodes].some(n => n.classList && n.classList.contains('sig49')))) fixSignals(); }).observe(m, {childList:true});
})();

/* バージョン ひょうじ */
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER52}`; return o; })(renderSettings);
})();


/* =====================================================================
   まなびタウン v5.3
   ① まちレベルを Lv30まで（ものがたりも Lv30まで つづく まえていで）
   ② ものがたり だい5しょう（Lv12）・だい6しょう（Lv15）
   ③ 住民 ひとりひとりの「せいかく」と「ものがたり」・その住民ならではの セリフ
   ④ ハナ（女の子）の セリフを ふやす・あたらしい イラスト
   ===================================================================== */
(function(){
'use strict';
const VER53 = '5.5.0';
const IMG53 = './assets/images/v53/';
const H53 = (s, k=0) => { let h = 2166136261 ^ k; for(const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h >>> 0; };
const pick53 = (L, seed) => L[(seed==null ? Math.random()*L.length : seed % L.length) | 0];
const split = s => s.split('|').map(x => x.trim()).filter(Boolean);

/* =====================================================================
   データ：どうぶつ ごとの セリフ（その どうぶつ ならでは）
   ===================================================================== */
const SPL = {
 cat:'ひなたぼっこの ベストスポットを 見つけたんだ。ないしょだよ|ねこじゃらしを 見ると、からだが かってに うごいちゃうんだよね|せまい はこに 入ると おちつくんだ。わかる？|しっぽで きもちが ばれちゃうの、ちょっと はずかしいな',
 dog:'さんぽの じかんが いちばん すき！ いっしょに いこうよ|においで だれが きたか わかっちゃうんだよ|ほめられると しっぽが とまらなくなるんだ！|ボールを なげてくれたら、どこまでも とってくるよ！',
 rabbit:'ぴょんって とぶと、くもに とどきそうな 気がするんだ|にんじんも すきだけど、じつは キャベツも 大すきなんだよ|ながい みみで、とおくの こえも きこえちゃうんだ|はやおきは とくいだよ。あさの くうき、おいしいよね',
 hamster:'ほっぺに ひまわりの たねを 10こ 入れられるんだよ！|よるに なると くるくる はしりたくなるんだ|ちいさいけど、ちからもちなんだよ。ほんとだよ！|たべものを かくす ばしょ、わすれちゃうことが あるんだ',
 pig:'はなが いいから、おいしい きのこを 見つけるのが とくいなんだ|どろあそびは おふろの かわりなんだよ。ほんとだよ|ブタって じつは きれいずきなんだよ。しってた？|おなかが なると、ブーって こえが でちゃうんだ',
 sheep:'けいとの セーター、じつは ぼくの けで できてるかも？|ふわふわの けが じまんなんだ。さわってみる？|ねむれない よるは、ヒツジを かぞえるんでしょ？ ぼくは なにを かぞえれば いいの？|むれで いると あんしんするんだ',
 sparrow:'あさの チュンチュンは、みんなへの おはようの あいさつなんだよ|おこめつぶ ひとつで おなか いっぱいに なるんだ|でんせんの 上から、まちが ぜんぶ 見えるんだよ',
 tanuki:'はっぱを あたまに のせると、へんしん できる 気がするんだ|おなかを たたくと いい おとが するんだよ。ポンポコ♪|ねたふりが とくいなんだ。ほんとうに ねちゃうけど',
 frog:'あめの ひは、うたいたくて たまらないんだ！|おたまじゃくしの ころは、しっぽが あったんだよ|ジャンプなら まけないよ。からだの 20ばいも とべるんだ',
 owl:'よるの ほうが あたまが さえるんだ。ホッホー|くびが くるっと まわるから、うしろも 見えるんだよ|もりの ことなら なんでも きいてね',
 squirrel:'どんぐりを 土に うめて、わすれちゃうと 木に なるんだよ|しっぽは、ねる ときの ふとんにも なるんだ|木から 木へ ジャンプするの、きもちいいよ！',
 bear:'はちみつの においが すると、ついつい ついていっちゃうんだ|ふゆは ながーい おひるねを するんだよ|こう 見えて、さかなとりの めいじんなんだ',
 fox:'しっぽの ふさふさは、さむい日の マフラーなんだよ|ゆきの 下の ネズミの おとも きこえちゃうんだ|いなりずしの ことを かんがえると、しあわせに なるんだ',
 hedgehog:'せなかの はりは、こわい ときだけ 立つんだよ|まるまると、ボールみたいに なれるんだ|はりが あっても、なかよく してくれる？',
 otter:'おきにいりの 石を、ずっと もちあるいてるんだ|ねる ときは ともだちと 手を つないで ながされないように するんだよ|およぐのが だいすき！ くるくる まわるの とくいなんだ',
 penguin:'そらは とべないけど、うみの 中なら とぶように およげるんだよ|ペタペタ あるくの、かわいいって よく いわれるんだ|さむいのは へっちゃら。あついのは ちょっと にがてかも',
 seal:'うみで ぷかぷか うかんで おひるねするのが すきなんだ|ひれで はくしゅするの、とくいなんだよ！|ひげで さかなの うごきが わかるんだ',
 koala:'ユーカリの はっぱしか たべないんだ。すききらいじゃないよ|1日 20じかんくらい ねむっちゃうんだ。ふぁ〜|木に だきついてると、いちばん おちつくんだよ',
 redpanda:'りょうてを あげて 立つと、つよそうに 見えるでしょ？|しましまの しっぽが じまんなんだ|竹の はっぱも、りんごも だいすきだよ',
 alpaca:'ふわふわの けで、マフラーが 10本 つくれるかも|おこると つばを とばしちゃうんだ。ないしょね|山の 上の すずしい ところで そだったんだよ',
 panda:'竹を たべてると、1日が あっというまなんだ|白と 黒の もよう、どっちが ほんとうの いろだと 思う？|ころころ ころがるの、たのしいよ！',
 shima:'ぼくたち シマエナガは、ゆきの ようせいって よばれてるんだ|ふわふわで まんまるなのは、さむさに まけない ためなんだよ|シマくんとは しんせきかも？ なんてね',
 mouse:'ちいさい あなでも すいすい とおれるんだよ|チーズの においには さからえないんだ|ちいさくても、ゆうきは 大きいんだよ',
 cow:'ぼくの ミルクで、カフェの ケーキが できるんだよ|もぐもぐ、なんかいも かみなおすのが ウシの たべかたなんだ|ゆったり のんびりが いちばんだよ',
 horse:'かぜを きって はしるの、さいこうなんだ！|立ったまま ねむれるんだよ。すごいでしょ|にんじんを くれる ひとは、みんな ともだちだよ',
 goat:'たかい いわの 上でも、へいきで のぼれるんだ|かみを たべちゃう って いわれるけど、もう たべないよ！|メェ〜って なくと、こだまが かえってくるんだ',
 hen:'まいあさ いちばんに おきて、みんなを おこすんだ|たまごを うむの、けっこう たいへんなんだよ|ちいさな すなあびが きもちいいんだ',
 duck:'あるく ときは いっしょうけんめい おしりを ふるんだ|みずの 上で すいすい 見えるけど、あしは がんばってるんだよ|あめの ひは うれしくて おどっちゃう！',
 donkey:'おもい にもつを はこぶのが とくいなんだ|がんこって いわれるけど、しんちょう なだけなんだよ|ながい みみが じまんなんだ',
 guinea:'うれしい ときは、ぴょんって とびはねちゃうんだ|キュイキュイって なくのは、おはなししてる しるしだよ|やさいの なかでは パセリが いちばん すき！',
 ferret:'せまい トンネルを くぐるのが だいすき！|うれしいと ダンスしちゃうんだ。イタチダンスって いうんだよ|くつしたを かくすの、ついつい やっちゃうんだ',
 parrot:'きいた ことばを まねするの、とくいなんだよ！|あざやかな はねが じまんなんだ|「おはよう」って 100かい いえるよ！',
 budgie:'あおい はねと きいろい はね、どっちが すき？|ちいさな こえで ずっと おしゃべり してたいんだ|かがみを 見ると、ともだちが いるみたいで たのしいの',
 turtle:'ゆっくり いけば、ちゃんと ゴールに つくんだよ|こうらは ぼくの おうち。どこでも ねられるんだ|100さいまで 生きる なかまも いるんだって',
 gecko:'かべも てんじょうも あるけちゃうんだよ|家を まもるから「やもり」って いうんだって|よるの まどの そとで、こっそり みんなを 見まもってるよ',
 chipmunk:'ほっぺに どんぐりを ためて はこぶんだ|せなかの しましまは、リスの なかでも とくべつなんだよ|ふゆの ために たべものを ためておくの、だいじだよね',
 mole:'土の 中なら どこへでも トンネルを ほれるんだ|目は ちょっと よわいけど、はなと ひげで わかるんだよ|まっくらでも、まいごに ならないのが とくぎなんだ',
 bat:'さかさまに ぶらさがると、せかいが ちがって 見えるんだ|こえの はねかえりで、くらやみでも ものが わかるんだよ|よるの そらは、ぼくの あそびばなんだ',
 raccoon:'たべものを あらってから たべるのが ぼくの こだわりなんだ|しましまの しっぽ、タヌキと まちがえないでね|てさきが きようだから、なんでも つくれるよ',
 skunk:'だいじょうぶ、ともだちには においを 出さないよ！|しろい ラインが ぼくの トレードマークなんだ|こわい ときは さかだちして おどかすんだよ',
 beaver:'えだと どろで ダムを つくるのが とくいなんだ|はが どんどん のびるから、木を かじらないと いけないんだよ|川の けんちくかって よばれてるんだ',
 porcupine:'はりが 3まんぼんも あるんだよ。かぞえた ことは ないけど|あるくと はりが カサカサ なるんだ|はりは じぶんを まもる ためで、こうげきは しないよ',
 deer:'つのは まいとし はえかわるんだよ|はなの おくから、もりの けはいを かんじるんだ|おじぎを すると、ごあいさつ できるんだよ',
 boar:'まっすぐ はしるのは だれにも まけないよ！|はなで 土を ほって、おいしい ねっこを さがすんだ|うりぼうの ころは しましまだったんだよ',
 wolf:'まんげつの よるは、つい とおぼえ したくなるんだ|なかまを たいせつに するのが オオカミの きまりなんだよ|こわそうに 見える？ ほんとうは やさしいんだ',
 lynx:'みみの さきの ふさふさは、アンテナなんだよ|ゆきの 上でも しずまない 大きな あしなんだ|しずかに まって、チャンスを 見のがさないんだ',
 badger:'あなほりなら、モグラにも まけないよ|しましまの かおは、もりの マスクなんだ|おうちを ずっと きれいに するのが すきなんだよ',
 macaque:'ふゆは おんせんに つかるのが さいこうなんだ|けづくろいは、なかよしの しるしなんだよ|ゆきだまを つくって あそぶのが とくいなんだ',
 gorilla:'むねを たたくのは、こんにちはの あいずなんだよ|こう 見えて、はっぱや くだものが 大すきなんだ|ちからもちだけど、こころは とっても やさしいんだよ',
 orangutan:'はっぱの かさを つくるのが とくいなんだ|うでを ひろげると、きみの 2ばいくらい あるんだよ|もりの ひとって いう いみの なまえなんだ',
 lemur:'あさは みんなで おひさまに むかって ひなたぼっこするんだ|しましまの しっぽを ふって、おはなし するんだよ|ぴょんぴょん よこっとびが とくいなんだ',
 sloth:'ゆっくり でも いいんだよ。すすんで いれば だいじょうぶ|1しゅうかんに 1かいしか 木から おりないんだ|あわてないのが ぼくの ルールなんだよ〜',
 armadillo:'まるまると、かたい ボールに なれるんだよ|こうらの よろいが じまんなんだ|あなを ほるのも とくいなんだよ',
 opossum:'びっくりすると、しんだふりを しちゃうんだ。くせなんだよ|しっぽで えだに ぶらさがれるんだ|こどもを せなかに のせて はこぶんだよ',
 moose:'ぼくの つのは、せかいで いちばん 大きいんだ|およぐのも とくいなんだよ。いがいでしょ|みずうみの くさを たべるのが すきなんだ',
 bison:'ゆきの 日でも、あたまで ゆきを かきわけて すすむんだ|むかしは 草原に たくさんの なかまが いたんだよ|ちからづよさなら まかせてね',
 reindeer:'クリスマスの そりを ひくのは、ぼくたちの しごとなんだ|ゆきの 下の こけを さがすのが とくいなんだよ|あしおとが カチカチって なるんだ',
 polarbear:'しろく 見えるけど、ほんとうは けが すきとおってるんだよ|こおりの 上で ねころぶの、きもちいいんだ|およぎなら、とおくまで いけるよ',
 fennec:'大きな みみで、すなの 下の むしの おとも きこえるんだ|さばくの あつさも、みみで にがすんだよ|よるの さばくは ほしが きれいなんだ',
 arcticfox:'ふゆは まっしろ、なつは ちゃいろに きがえるんだ|ゆきの 中に ジャンプして えものを とるんだよ|しっぽを まいて ねると あったかいんだ',
 mongoose:'すばやさなら だれにも まけないよ！|みんなで 見はりを して、なかまを まもるんだ|ちいさくても、ゆうかんなんだよ',
 sunbear:'むねの 月の もようが じまんなんだ|ながい したで、はちみつを ぺろっと とれるんだよ|クマの なかでは いちばん ちいさいんだ',
 lion:'がおーって ほえると、とおくまで きこえるんだ|ほんとうは ひるねが だいすきなんだよ。1日 15じかんくらい|たてがみの おていれ、けっこう たいへんなんだ',
 tiger:'しましまは、ひとりひとり ちがう もようなんだよ|じつは みずあびが だいすきなんだ|しずかに あるくのが とくいなんだ',
 cheetah:'はしる はやさは せかい いちだよ！|すごく はやいけど、ながくは はしれないんだ。てへへ|目の 下の くろい せんは、まぶしさよけなんだよ',
 leopard:'木の 上で おひるね するのが すきなんだ|うめの はなみたいな もようが じまんなんだよ|しずかに、でも すばやく が モットーなんだ',
 giraffe:'たかい ところの はっぱは、ぜんぶ ぼくの ものなんだ|くびは ながいけど、ほねの かずは きみと おなじ 7こなんだよ|まちの いちばん とおくまで 見えるよ',
 elephant:'はなで みずを すって、シャワーが できるんだよ|むかしの ことを よく おぼえてるのが とくいなんだ|あしの うらで、とおくの なかまの こえを かんじるんだ',
 zebra:'しましまの もようは、ひとりずつ ちがうんだよ|むれで はしると、しましまで めが まわるでしょ？|しまうま だけに、しましまの ふくが すきなんだ',
 hippo:'ひるは みずの 中で のんびり するんだ|口を 大きく あけるのは、あくびじゃなくて つよさの アピールなんだよ|みずの 中を あるくのが とくいなんだ',
 rhino:'はなの 上の つのが じまんなんだ|からだは おおきいけど、くさしか たべないんだよ|どろあびで、ひやけ どめを してるんだ',
 camel:'せなかの こぶには、えいようが つまってるんだよ|さばくの すなあらしも、ながい まつげで へっちゃらなんだ|みずを いっきに たくさん のめるんだよ',
 kangaroo:'おなかの ポケットで あかちゃんを そだてるんだ|しっぽで バランスを とって、ぴょーんと とぶんだよ|ボクシングが とくいなんだ。やってみる？',
 wallaby:'カンガルーの いとこなんだよ。ちょっと 小さいけどね|ぴょこぴょこ はねるの、たのしいよ|ポケットに なにが 入ってるかは ひみつだよ',
 meerkat:'うしろあしで 立って、まわりを 見はるのが しごとなんだ|あさは みんなで ひなたぼっこ するんだよ|かぞくが たくさんで、いつも にぎやかなんだ',
 hyena:'わらってるみたいな こえだけど、おはなし してるんだよ|はなが いいから、おそうじやさんが できるんだ|なかまとの チームワークが じまんなんだ',
 warthog:'ひざを ついて くさを たべるのが ぼくの スタイルなんだ|しっぽを ピンと 立てて はしるんだよ|かおの いぼいぼ、かっこいいでしょ？',
 ostrich:'とべないけど、はしるのは とっても はやいんだよ|たまごが せかいで いちばん 大きいんだ|目が 大きくて、とおくまで 見えるんだよ',
 flamingo:'かたあしで 立つのが いちばん らくなんだ|ピンクの いろは、たべものの おかげなんだよ|みんなで そろって おどるのが すきなんだ',
 toucan:'くちばしが 大きいけど、とっても かるいんだよ|くだものを ぽいって なげて たべるんだ|カラフルな くちばしが じまんなんだ',
 peacock:'はねを ひろげると、目の もようが 100こくらい あるんだよ|きらきらの はねは、おしゃれの ひみつなんだ|はねを ひろげる ときは、ちょっと ドキドキするんだ',
 gazelle:'はねるように はしるのが とくいなんだよ|大きな 目で、草原の とおくまで 見えるんだ|すらっとした あしが じまんなんだ',
 dolphin:'なかまと ことばで おはなし してるんだよ|ジャンプして くるっと まわるのが とくいなんだ|ねてる ときも、あたまの はんぶんは おきてるんだよ',
 whale:'うたで、とおくの なかまと おはなし するんだ|しおふきは、いきつぎなんだよ|せかいで いちばん 大きな どうぶつなんだ。えへん',
 shark:'こわく 見えるけど、ともだちには やさしいよ|はが なんども はえかわるんだ|およぎつづけるのが とくいなんだよ',
 octopus:'うでが 8本 あるから、いろんな ことが いっぺんに できるんだ|すみを はいて、すがたを かくせるんだよ|からだの いろを かえられるんだ',
 squid:'ひかる なかまも いるんだよ。きれいでしょ|すいすい うしろむきに およぐのが とくいなんだ|足が 10本 あるんだよ。タコより 2本 おおいんだ',
 crab:'よこあるきの スピードなら、だれにも まけないよ|はさみで チョキチョキ、なんでも きれちゃうんだ|あわを ぶくぶく ふくのが くせなんだ',
 lobster:'こしを まげて、ピョーンと うしろに にげるんだよ|ながい ひげで、まわりを さぐるんだ|ゆでると あかく なるけど、もとは あおっぽいんだよ',
 jelly:'ふわふわ ただよってるのが いちばん すきなんだ|からだの ほとんどが みずなんだよ|くらい うみで ひかる なかまも いるんだ',
 starfish:'うでが なくなっても、また はえてくるんだよ|うらに ちいさな あしが たくさん あるんだ|ほしみたいって よく いわれるんだ。うれしいな',
 seaturtle:'うまれた はまべに、たまごを うみに かえってくるんだ|とおい うみまで たびを するんだよ|ひれで そらを とぶように およぐんだ',
 clownfish:'イソギンチャクの 中が ぼくの おうちなんだ|オレンジと しろの しましまが じまんなんだよ|えいがの しゅやくに にてるって いわれるんだ',
 puffer:'びっくりすると、ぷくーって ふくらんじゃうんだ|まんまるに なると、ころころ ながされちゃう|すなの 上に もようを えがくのが とくいなんだよ',
 seahorse:'およぐ ときは、まっすぐ 立ったままなんだ|おとうさんが あかちゃんを うむんだよ。ふしぎでしょ|しっぽで かいそうに つかまって やすむんだ',
 walrus:'ながい きばで、こおりの 上に よじのぼるんだ|ひげで うみの そこの かいを さがすんだよ|ぶあつい しぼうで、さむさも へっちゃら',
 sealion:'みみが ちょこんと あるのが、アザラシとの ちがいなんだ|ボールを はなに のせるの、とくいなんだよ|うしろあしで あるけるんだ',
 manatee:'うみの くさを もぐもぐ たべるのが すきなんだ|のんびり おっとりが ぼくの いいところ|にんぎょの モデルって いわれてるんだよ',
 axolotl:'いつも にこにこ してる かおだって いわれるんだ|えらの ふさふさは、こきゅうの ためなんだよ|けがを しても なおるのが はやいんだ',
 hermit:'からだが 大きく なったら、おうちの かいを ひっこすんだ|すてきな かいがらを 見つけるのが しゅみなんだよ|はさみで とびらを しめて ねるんだ',
 narwhal:'ながい つのは、じつは はなんだよ|うみの ユニコーンって よばれてるんだ|こおりの うみで くらしてるんだよ',
 beluga:'うみの カナリアって よばれるくらい うたが すきなんだ|あたまの かたちを かえて、おとを だすんだよ|まっしろな からだが じまんなんだ',
 eagle:'そらの たかい ところから、ちいさな ものも 見えるんだ|つばさを ひろげると、きみより 大きいんだよ|かぜに のって とぶのが とくいなんだ',
 hawk:'すばやく おりるのが とくいなんだ|目が とっても いいんだよ。なんでも 見えちゃう|そらの パトロールは まかせてね',
 crow:'ピカピカした ものを あつめるのが しゅみなんだ|カラスは とっても かしこいんだよ。かずも かぞえられるんだ|ひとの かおを おぼえるのが とくいなんだよ',
 pigeon:'とおくからでも、おうちに かえってこられるんだよ|クルックーって いうのは、ごきげんな しるしなんだ|むかしは てがみを はこんでたんだって',
 swallow:'はるに なると、とおい くにから かえってくるんだ|ひくく とぶと、あめが ふる しるしなんだよ|のきしたに おうちを つくるのが とくいなんだ',
 robin:'むねの オレンジいろが じまんなんだ|あさいちばんに うたうのが すきなんだよ|はるを つげる 小鳥って いわれてるんだ',
 bluebird:'あおい とりは しあわせの しるしって いうでしょ？|うたうと、もりが あかるく なる 気がするんだ|そらの いろを はねに もらったんだよ',
 hummingbird:'1びょうに 50かいも はばたいてるんだ！|うしろむきにも とべるんだよ|花の みつが だいこうぶつなんだ',
 woodpecker:'木を コンコン たたくのは、ごはんを さがしてるんだ|ずつうに ならない ひみつの あたまなんだよ|もりの ドラマーって よばれてるんだ',
 kingfisher:'みずに とびこんで さかなを とるのが とくいなんだ|そらいろの はねは、川の ほうせきって いわれるんだよ|しんかんせんの はなの かたちは、ぼくが モデルなんだって',
 crane:'つるの おんがえしって おはなし、しってる？|かたあしで ずっと 立って いられるんだよ|あたまの あかい ところが じまんなんだ',
 swan:'みずの 上では ゆうがだけど、あしは いっしょうけんめいなんだ|さむい くにから わたってきたんだよ|こどもの ころは はいいろだったんだ',
 stork:'あかちゃんを はこんでくる って いわれてるんだ|くちばしを カタカタ ならして おはなし するんだよ|やねの 上に おうちを つくるんだ',
 cockatoo:'あたまの かざりばねを ひろげると、きぶんが わかるんだよ|おしゃべりと ダンスが だいすきなんだ|ながいきで、80さいの なかまも いるんだって',
 cardinal:'まっかな はねが じまんなんだ|きれいな こえで うたうのが すきなんだよ|ゆきの 日に 見つけると、ラッキーなんだって',
 mejiro:'目の まわりの しろい わっかが トレードマークなんだ|うめの 花の みつが だいすきなんだよ|みんなで くっついて ならぶのを「めじろおし」って いうんだ',
 bunchou:'てのりに なるのが とくいなんだよ|おもちみたいに まるく なって ねるんだ|ピッピッて なくのは、ごきげんな しるしなんだよ',
 snowyowl:'ゆきの せかいで くらしてたんだ|まっしろな はねは、ゆきの カモフラージュなんだよ|ひるまでも かりが できるんだ',
 puffin:'カラフルな くちばしが じまんなんだ|さかなを 10ぴき いっぺんに くわえられるんだよ|うみの ピエロって よばれてるんだ',
 pelican:'くちばしの ふくろは、さかなを すくう あみなんだ|みんなで いっしょに さかなを おいこむんだよ|大きな つばさで ゆったり とぶんだ',
 capybara:'おんせんに つかると、こころまで ぽかぽかに なるんだ|だれとでも なかよく なれるのが とくぎなんだよ|せかいで いちばん 大きな ネズミの なかまなんだ',
 tapir:'ゆめを たべるって いわれる バクとは、ちょっと ちがうんだよ|はなが すこし ながいのが じまんなんだ|こどもの ころは うりぼうみたいな もようなんだよ',
 okapi:'キリンの しんせきなんだよ。いがいでしょ|あしの しましまが じまんなんだ|ながい したで、みみの そうじも できるんだ',
 pangolin:'うろこの よろいで まるまれるんだ|アリが だいこうぶつなんだよ|あるく ときは うしろあしで 立つことも あるんだ',
 quokka:'せかいで いちばん しあわせな どうぶつって いわれてるんだ|いつも にこにこ してるでしょ？|ちいさな カンガルーの なかまなんだよ',
 wombat:'まいにち あなを ほるのが しごとなんだ|しかくい うんちを するんだよ。ないしょね|おしりが かたくて じょうぶなんだ',
 platypus:'くちばしが あるけど、とりじゃないんだよ|たまごを うむ ほにゅうるいなんだ。めずらしいでしょ|みずの 中で、でんきを かんじて えさを さがすんだ',
 kiwi:'とべない とりだけど、はなが いいんだよ|くちばしの さきに はなの あなが あるんだ|くだものの キウイと おなじ なまえなんだよ',
 sugarglider:'まくを ひろげて、木から 木へ とべるんだ|あまい ものが だいすきなんだよ|ポケットに 入るくらい ちいさいんだ',
 chinchilla:'けが せかいで いちばん ふわふわなんだって|すなあびで からだを きれいに するんだよ|山の 上の さむい ところで そだったんだ',
 tasdevil:'こえは こわいけど、ほんとうは こわがりなんだ|あごの ちからが とっても つよいんだよ|よるに なると げんきに なるんだ',
 binturong:'ポップコーンの においが するって いわれるんだ|しっぽで 木に つかまれるんだよ|のんびり 木の 上で くらしてるんだ',
 whitetiger:'まっしろな しましまは、とっても めずらしいんだよ|ゆきの 中では かくれんぼが とくいなんだ|こう 見えて、ひとみしり なんだ',
 snowleopard:'ながい しっぽを マフラーに して ねるんだ|山の 上の いわばを、かるがる とびうつるんだよ|ゆきやまの まぼろしって よばれてるんだ',
 goldmonkey:'きんいろの けが じまんなんだ|はなが ちょこんと 上を むいてるでしょ？|さむい 山の もりで くらしてたんだよ',
 anteater:'ながい したで、アリを 1分に 150ぴき たべるんだ|ふさふさの しっぽを かさに して ねるんだよ|はが ないけど、だいじょうぶなんだ',
 corgi:'あしは みじかいけど、はしるのは はやいんだよ！|ぷりっとした おしりが チャームポイントなんだ|むかしは ひつじを まとめる しごとを してたんだよ',
 poodle:'くるくるの けが じまんなんだ。セットに 1じかん かかるの|およぐのが とくいなんだよ。いがいでしょ|あたまが いいって よく いわれるんだ',
 mike:'3しょくの けは、ちょっと めずらしいんだよ|まねきねこの モデルは、わたしかも？|ねこの しゅうかいに よく いくんだ',
 kuroneko:'くろねこは しあわせを はこぶって いわれてるんだよ|よるの やみに まぎれるのが とくいなんだ|きんいろの 目が じまんなんだ',
 orca:'うみの おうさまって よばれてるけど、なかまおもいなんだよ|かぞくで ずっと いっしょに くらすんだ|しろと くろの もようが じまんなんだ',
 namazu:'ひげで、じしんを よちできるって いわれてるんだよ|どろの そこで のんびり するのが すきなんだ|なまずの ひげは、アンテナなんだよ'
};
/* すむ 家 ごとの セリフ（どうぶつの セリフが ない ときの ほじゅう） */
const HOMEL = {
 house:'おうちの まどから 見える けしき、すきなんだ|へやの もようがえを かんがえるの、たのしいよね',
 bird:'とりの おうちは、たかい ところに あるから ながめが いいんだよ|すだちの きせつは、ちょっと そわそわ するんだ',
 log:'まるたの おうちは、木の いい においが するんだよ|だんろの まえで、ぬくぬく するのが すきなんだ',
 water:'みずべの おうちは、すずしくて きもちいいんだ|みずの おとを きいてると ねむくなっちゃう',
 tree:'木の 上の おうちは、かぜで ゆらゆら ゆれるんだよ|はっぱの すきまから、ほしが 見えるんだ',
 bamboo:'たけの はっぱが さらさら なるのが すきなんだ|たけやぶの おうち、すずしくて さいこうだよ'
};

/* =====================================================================
   データ：せいかく（14しゅるい）× 場面
   town：まちで ／ home：その住民の 家で ／ visit：わたしの家に あそびに 来た とき ／ cafe：カフェで
   ok・ng・combo：勉強の おうえん ／ hint：ヒントの まえの ひとこと ／ quiz：問題を 出す とき
   ===================================================================== */
const TRAITS = [
 {id:'kuishinbo', n:'くいしんぼう', i:'🍙',
  town:'さっき パンやさんの まえを とおったら、おなかが ぐ〜って なったよ|きょうの ごはん、なにかなあ。それを かんがえると がんばれるんだ|おいしい ものを たべると、あたまも よく なる 気がするよね|{kun}の すきな たべものって なあに？ わたしは ぜんぶ！|ねえ、こんど カフェで いっしょに ケーキ たべようよ',
  home:'いらっしゃい！ ちょうど おやつを やいてたんだ。いい においでしょ？|きてくれて うれしい！ れいぞうこの プリン、はんぶんこ しよ！|おきゃくさん だ！ おちゃと おかし、どっちが いい？ りょうほう？',
  visit:'{kun}の おうち、なんだか おいしそうな においが するね|おじゃまします！ おみやげ もってくれば よかったなあ|この へやで パーティーしたら たのしそう！ おかしは わたしが もってくるね',
  cafe:'メニューを 見てるだけで しあわせ〜！ ぜんぶ たのみたいな|この あじ、ほっぺが おちそう！ おかわりって できる？|つぎは なにを たべようかなあ。まよっちゃう〜',
  ok:'せいかい！ おいわいに おやつ たべよ！|すごい！ ごほうびの ケーキ よういしなきゃ！|やったね！ あたまを つかうと おなか すくよね',
  ng:'だいじょうぶ！ おやつ たべたら げんき でるよ|おなか すいてると まちがえちゃうよね。ひと休み しよ|ドンマイ！ つぎは きっと おいしい せいかいだよ',
  combo:'れんぞく せいかい！ ごちそうさまって かんじだね！|とまらないね！ まるで おかわり し放題だよ',
  hint:'おなかの へった あたまで かんがえた ヒントだよ|ヒント、ひとくち どうぞ',
  quiz:'もんだいに こたえられたら、いっしょに おやつ たべよ！'},
 {id:'shinpai', n:'しんぱいしょう', i:'😟',
  town:'ちゃんと ねられてる？ むりしないでね|きょう、わすれものは ない？ だいじょうぶ？|あめが ふりそうで ちょっと しんぱい… かさ もってる？|まちの みんなが げんきか、つい 見まわっちゃうんだ|{kun}が がんばりすぎてないか、ちょっと しんぱいなんだよ',
  home:'き、きてくれたの！？ へや、ちらかってない？ だいじょうぶ？|あっ、いらっしゃい！ ころばなかった？ みち、まよわなかった？|ゆっくり していってね。さむくない？ あつくない？',
  visit:'おじゃまして だいじょうぶだった？ いそがしく なかった？|{kun}の おうち、あんしんする においが するね|かぎ、ちゃんと しめてる？ わたし、そういうの 気に なっちゃうんだ',
  cafe:'この ケーキ、ほんとうに たべて いいの？ たかくない？|おいしい！ …けど、たべすぎて ないかな？|おみせ、いそがしそう。てつだえる ことある？',
  ok:'よかった〜！ ほっと したよ！|せいかい！ しんぱい して そんした〜|すごい！ きみなら できるって しってたよ',
  ng:'だいじょうぶ？ おちこまないでね。わたしも よく まちがえるよ|まちがえても へいき へいき。いっしょに おぼえよ|むりしないで、ゆっくりで いいからね',
  combo:'すごすぎて、ぎゃくに しんぱい なくらいだよ！|れんぞく せいかい！ むりは してない？',
  hint:'まちがえないか しんぱいだから、ヒント おしえるね',
  quiz:'む、むずかしすぎたら ごめんね？ もんだい 出すよ'},
 {id:'monoshiri', n:'ものしり', i:'📚',
  town:'しってる？ はちみつは くさらないんだって。ずっと ずっと たべられるんだよ|きのう よんだ 本に、ほしの はなしが のってたんだ|まちの としょかんの 本、はんぶんは よんだかな|ふしぎに 思ったら、すぐ しらべるのが すきなんだ|「なぜ？」って 思うことが、べんきょうの はじまりなんだよ',
  home:'ようこそ！ 本だらけで ごめんね。すきな 本、かしてあげるよ|いらっしゃい。きょうは なにを しらべに きたの？|ちょうど おもしろい 本を よんでたんだ。きいて きいて！',
  visit:'{kun}の 本だな、すてきだね。おすすめは どれ？|この へやの かぐの ならべかた、きのうの 本に のってた いい ならべかただよ|あそびに きたけど、ちょっと 本の はなし してもいい？',
  cafe:'コーヒーって、もともとは 木の みの たねなんだよ|この ケーキの いちごは、じつは みじゃなくて …あっ、ながく なるから またね|カフェで 本を よむのが いちばん すきなんだ',
  ok:'せいかい！ ものしりなかま だね！|すばらしい！ その ちしき、本に のせたいくらいだよ|そのとおり！ よく しってるね',
  ng:'まちがいは、あたらしく しれる チャンスだよ|おしい！ こたえを おぼえれば、また ひとつ ものしりだね|わたしも むかし、まったく おなじ まちがいを したよ',
  combo:'れんぞく せいかい！ はかせに なれるよ！|その ちょうしで、ちしきの たからばこを いっぱいに しよう！',
  hint:'ものしりの わたしから、ちょっとだけ ヒントだよ|本に こんなことが 書いてあったよ',
  quiz:'さいきん しらべた ことから もんだいを 出すね'},
 {id:'occhoko', n:'おっちょこちょい', i:'🤭',
  town:'さっき かぎを なくしたと 思ったら、ポケットに 入ってたよ。えへへ|くつを はんたいに はいて きちゃった！ …あれ、ちがった？|きょうは 2かい ころんだけど、げんきだよ！|あわてんぼうって いわれるけど、げんきなら まけないよ|あれ、なにを しに きたんだっけ…？ まあ いっか！',
  home:'いらっしゃーい！ あっ、スリッパ はんたいだった！|きてくれたの！？ ちょっと まってね、いま かたづける… わわっ|ようこそ！ おちゃ いれるね。…あれ、おさとうと しお どっちだっけ？',
  visit:'おじゃましまーす！ あっ、くつ ぬぐの わすれてた！|{kun}の おうち、ひろいね！ まいごに なりそう|あそびに きたよ！ …おみやげ、わすれちゃった。ごめんね！',
  cafe:'あっ、ストローで はなを ついちゃった！ でも おいしい！|クリームが はなに ついてる？ えへへ|メニュー、さかさまに もってた！',
  ok:'せいかい！ わたしより しっかり してるね！|すごい！ わたし あわてて まちがえちゃう もんだいだよ|やった〜！ …あれ、わたしが こたえたんだっけ？ ちがうか！',
  ng:'わかる わかる！ わたしも しょっちゅう だよ|あわてなくて いいよ。わたしが いい れいだよ！|ドンマイ！ まちがえたら わらって つぎ つぎ！',
  combo:'れんぞく せいかい！ わたしにも その おちつき わけて〜|すごい！ いちども ころばない かんじだね！',
  hint:'えっと、ヒントは… あっ、これだ！',
  quiz:'もんだい 出すね！ …こたえ、わすれてないよね、わたし'},
 {id:'romantic', n:'ロマンチスト', i:'🌙',
  town:'ゆうやけって、まいにち ちがう いろなんだよ。きょうの は もも いろだった|ほしに おねがいごとを するなら、なにを ねがう？|この まちの よるの あかり、ほうせきばこ みたいだね|かぜの においで、きせつが かわるのが わかるんだ|まいにちが ものがたりの 1ページなんだよ',
  home:'ようこそ。まどべの はなが ちょうど さいたところなんだ|きてくれて うれしい。きょうは どんな ものがたりを はなそうか|いらっしゃい。キャンドルを ともすね。すてきな ひかりでしょ',
  visit:'{kun}の へやの まど、ほしが よく 見えそうだね|この へやに、はなを 1りん かざったら もっと すてきに なるよ|あそびに こられて うれしいな。きょうは とくべつな 日だね',
  cafe:'この カップの もよう、ちいさな ほしみたい|あまい かおりで ゆめの 中に いる 気分だよ|まどの そとの けしきを 見ながら のむ ココア、さいこうだね',
  ok:'せいかい！ ほしみたいに きらきら してるよ|すてき！ きみの あたまの 中は うちゅうみたいだね|まるで ものがたりの ヒーローだよ！',
  ng:'まちがいも、ものがたりの だいじな シーンなんだよ|くもりの 日の つぎは はれるからね|だいじょうぶ。ほしは くもの うえで ずっと ひかってるよ',
  combo:'れんぞく せいかい！ ながれぼしが ふりそそいでる みたいだよ！|かがやいてるね！ まるで おうじさま・おひめさま！',
  hint:'ひとつだけ、ひみつの ヒントを ささやくね',
  quiz:'ほしの したで、もんだいを ひとつ。いいかな？'},
 {id:'ganbari', n:'がんばりや', i:'🔥',
  town:'まいあさ、まちを 3しゅう はしってるんだ！|きのうの じぶんより ちょっとだけ がんばる、それが わたしの モットーなんだよ|{kun}も がんばってるから、わたしも まけてられないな！|つかれた ときは、すこし やすんで また スタートだよ|コツコツ つづけると、いつか おおきな ちからに なるんだ',
  home:'いらっしゃい！ いま きんトレ してたところなんだ！|ようこそ！ きょうも いっしょに がんばろう！|きてくれた！ よーし、げんき 100ばいだ！',
  visit:'{kun}の つくえ、べんきょうした あとが いっぱいだね。すごい！|あそびに きたけど、ついでに いっしょに べんきょう しない？|この へや、がんばる パワーが あふれてるね！',
  cafe:'しっかり たべて、また がんばるぞ！|あまい ものは、がんばった あとの ごほうびだよね|ここで ひと休みしたら、もう ひとがんばり！',
  ok:'せいかい！ その いきだよ！|やったね！ コツコツの せいかだね！|すばらしい！ わたしも もっと がんばらなきゃ！',
  ng:'まだまだ これから！ つぎこそ！|しっぱいは せいこうの もとだよ！|くやしい きもちが、つぎの ちからに なるんだ！',
  combo:'れんぞく せいかい！ もえてきたね〜っ！|とまらない！ いっしょに てっぺん めざそう！',
  hint:'がんばってる きみに、とっておきの ヒントだよ',
  quiz:'しょうぶだ！ もんだいを 出すよ！'},
 {id:'hazukashi', n:'はずかしがりや', i:'☺️',
  town:'あ、あの… こんにちは。はなしかけて くれて うれしいな|みんなの まえだと きんちょう しちゃうけど、{kun}とは はなせるよ|ちょっとずつ ともだちが ふえて、うれしいんだ|…なんでも ないよ。えへへ|ほんとうは もっと おしゃべり したいんだ',
  home:'き、きてくれたの…？ ど、どうぞ…|あの… ゆっくり していってね。わたし、うれしいんだ|へや、見られるの ちょっと はずかしいけど… ようこそ',
  visit:'お、おじゃまします… {kun}の へや、すてきだね|あそびに きちゃった… めいわく じゃなかった？|ここ、なんだか おちつくな…',
  cafe:'ひとが おおくて どきどき… でも ケーキは おいしい|…この のみもの、すき。おしえてくれて ありがとう|おきにいりの せき、すみっこなんだ',
  ok:'す、すごい… せいかいだね…！|…かっこよかったよ|せいかい…！ わたしまで うれしく なっちゃった',
  ng:'…だいじょうぶ。わたしも まちがえるよ|げんき だして… ね？|つぎは きっと できるよ… おうえん してる',
  combo:'れんぞく…！ す、すごすぎて こえが でないよ|…ほんとうに すごい。こころの 中で はくしゅ してるよ',
  hint:'あの… ヒント、こっそり おしえるね',
  quiz:'…もんだい、出しても いい？'},
 {id:'itazura', n:'いたずらずき', i:'😜',
  town:'さっき、ねてる クマさんの あたまに はっぱ のせてきちゃった。しーっ！|ねえねえ、なぞなぞ だすよ！ …って、やっぱり ひみつ！|この まちの ひみつの ぬけみち、しってる？|びっくり ばこ つくったんだ。{kun}にも あげようかな|わらってる かおが 見たくて、いたずら しちゃうんだよね',
  home:'いらっしゃい！ あ、その いす、ブーブー なるかもよ？ なんてね！|ようこそ！ この へやの どこかに おかしを かくしたよ。さがして みて！|きてくれた！ じつは まってたんだ。えへへ',
  visit:'{kun}の へやの どこかに、いたずら しかけちゃおうかな〜|おじゃまします！ ねえ、かくれんぼ しない？|この へやの ひみつ、見つけちゃった！ …うそ！',
  cafe:'クリームで ひげを つけてみた！ にあう？|おさとう、こっそり 2こ いれちゃった|この ストロー、ぶくぶく するの たのしいよね',
  ok:'せいかい！ ひっかからなかったね〜！|やるね！ わたしの いたずらより すごいよ！|すごい！ ちょっと くやしい！',
  ng:'あはは、ひっかかったね！ …じゃなくて、ドンマイ！|まちがいは、いたずらみたいな もんだよ。わらって つぎ！|へいき へいき！ つぎは びっくり させちゃえ！',
  combo:'れんぞく せいかい！ いたずらも できないくらい すごい！|これは もう、まちの でんせつだね！',
  hint:'とくべつに、たねあかし しちゃおうかな',
  quiz:'ひっかけもんだいかも？ ふふふ、いくよ！'},
 {id:'osekkai', n:'おせわずき', i:'🧺',
  town:'こまってる ひとが いたら、ほうっておけないんだ|さっき、まいごの こを おうちまで おくってきたよ|{kun}、ハンカチ もってる？ かしてあげるね|みんなの たんじょうびを ぜんぶ おぼえてるんだ|だれかの えがおを 見るのが いちばん すきなんだよ',
  home:'いらっしゃい！ さむかったでしょ。ひざかけ どうぞ|ようこそ！ おなか すいてない？ スープ あるよ|きてくれて ありがとう！ ゆっくり やすんでいってね',
  visit:'{kun}の へや、ちょっと かたづけて あげようか？|おじゃまします！ なにか てつだう ことある？|この はな、おみずが ほしそう。あげておくね',
  cafe:'となりの せきの こ、ナプキン おとしたよ！ ひろってくるね|おみせの ひと いそがしそう。おさら はこぼうか？|この ケーキ、はんぶん どうぞ！',
  ok:'せいかい！ よく がんばったね|すごい！ ほめて あげる！ いいこ いいこ|えらい！ ちゃんと おぼえてたね',
  ng:'だいじょうぶ、つぎは いっしょに やろうね|まちがえても いいの。わたしが ついてるよ|ひと休み する？ おちゃ いれようか',
  combo:'れんぞく せいかい！ がんばりやさんだね！|こんなに がんばって… えらいよ〜！',
  hint:'こまったときは おたがいさま。ヒントだよ',
  quiz:'いっしょに かんがえよう。もんだい 出すね'},
 {id:'yumemi', n:'ゆめみがち', i:'☁️',
  town:'くもの かたち、さっきは ウサギだったのに いまは ケーキだよ|ねえ、そらを とべたら どこに いく？|きのうの ゆめで、まちが ぜんぶ おかしで できてたんだ|ぼーっと してたら、もう ゆうがたに なってた|しょうらいの ゆめを かんがえるだけで、わくわく するんだ',
  home:'いらっしゃい… あ、ゆめじゃ ないよね？ ほんものだ！|ようこそ。いま、うちゅうりょこうの けいかくを たててたんだ|きてくれた！ この へや、わたしの ゆめの おしろなんだよ',
  visit:'{kun}の へや、ゆめの 中みたいに すてきだね|ここで ねむったら、どんな ゆめを 見るかなあ|あそびに きた… つもりが、ぼーっと しちゃってた',
  cafe:'この ココアの あわ、くもみたい〜|ケーキの おしろに すみたいなあ|まどの そとを 見てたら、ゆめの つづきが 見えそう',
  ok:'せいかい！ ゆめの 中でも こたえられそうだね|すごい！ きみの あたまの 中、たのしそう！|やった〜！ ふわふわ うれしい！',
  ng:'まちがいも ゆめの つづきだよ。つぎを 見よう|だいじょうぶ、あしたの ゆめは もっと いい ゆめだよ|おしい！ ゆめで れんしゅう しよう',
  combo:'れんぞく せいかい！ ゆめみたい！|そらまで とどきそうな いきおいだね！',
  hint:'ゆめの 中で ひらめいた ヒントだよ',
  quiz:'ゆめで 見た もんだい、出してもいい？'},
 {id:'majime', n:'まじめ', i:'📏',
  town:'きょうの よていは ぜんぶ メモしてあるよ|じかんを まもるのは、あいての ことを だいじに する ことなんだ|まいにち 10ぷんずつ ふくしゅう してるよ|ルールを まもると、みんなが きもちよく すごせるよね|{kun}も けいかくを たてて べんきょう してる？',
  home:'ようこそ。くつは そろえて おいてね。…ありがとう|いらっしゃい。じかん ぴったりだね|どうぞ。へやは まいにち そうじ してるんだ',
  visit:'おじゃまします。きちんと した へやだね|あそびに きました。ごあいさつが おくれて ごめんなさい|{kun}の つくえの うえ、せいりされてて いいね',
  cafe:'メニューを ぜんぶ よんでから えらぶ ことに してるんだ|おいしい。ていねいに つくられた あじが するね|きょうの カフェ、きのうより 3ぷん はやく ついたよ',
  ok:'せいかい。かんぺきだね|ただしい！ よく べんきょう してるね|そのとおり。すばらしいよ',
  ng:'まちがいを なおせば、つぎは ただしく できるよ|ノートに 書いて、もういちど たしかめよう|あせらず、ひとつずつ かくにん しようね',
  combo:'れんぞく せいかい。けいかくてきな べんきょうの せいかだね！|ミス なし！ すばらしい しゅうちゅうりょく！',
  hint:'じゅんばんに かんがえる ための ヒントだよ',
  quiz:'ふくしゅうの もんだいを ひとつ 出すね'},
 {id:'nonki', n:'マイペース', i:'🌿',
  town:'いそがなくても、まちは にげないよ〜|きょうは なにも しない 日に しようと 思ってたけど、きみに あえて よかった|おひさまの 下で ごろごろ、さいこうだよ|みんな それぞれの スピードで いいんだよ|のんびり あるくと、いろんな ものが 見えるんだ',
  home:'あ〜、いらっしゃい。すきな ところに すわってね|ようこそ〜。おちゃ、ゆっくり いれるね|きてくれたんだ〜。ちょうど ひるね から おきたところだよ',
  visit:'{kun}の へや、ここちいいね〜。ねむくなっちゃう|あそびに きたよ〜。ゆっくり していい？|この クッション、ふかふかだね〜',
  cafe:'ゆっくり のむ コーヒーが いちばん おいしいんだ|ケーキは ひとくちずつ、あじわって たべるよ|ここの じかんは、ゆっくり ながれてる 気がするね',
  ok:'せいかい〜。いい かんじだね|おお〜、すごいね〜|やったね〜。その ちょうしで のんびり いこう',
  ng:'まあまあ、あせらない あせらない|だいじょうぶ〜。ゆっくりで いいんだよ|まちがえても、せかいは ちゃんと まわってるよ〜',
  combo:'れんぞく せいかい〜。すごいねえ〜|おお〜、はやい はやい〜',
  hint:'ゆっくり かんがえれば だいじょうぶ。ヒントだよ〜',
  quiz:'のんびり こたえて いいからね〜。もんだいだよ'},
 {id:'genkikko', n:'にぎやか', i:'🎉',
  town:'ねえねえ きいて！ きょう、すっごく いい ことが あったんだ！|みんなで うたったら、もっと たのしいよ！ ラララ〜♪|おまつりの 日が まちどおしいな！|{kun}と はなすと、げんきが 100ばいに なるよ！|まちの みんなを あつめて パーティー したいな！',
  home:'いらっしゃーい！ まってたよ〜！|ようこそ！ きょうは パーティーだ〜！|きてくれた！ ねえねえ、なにして あそぶ？',
  visit:'やっほー！ {kun}の おうちに とうちゃーく！|おじゃましまーす！ この へや、パーティーに ぴったりだね！|あそびに きたよ！ ねえ、ダンス しよう！',
  cafe:'カンパーイ！ ジュースで カンパイ！|この カフェ、たのしい おんがくが ながれてるね！|みんなで たべると、もっと おいしいね！',
  ok:'せいかーい！ イェーイ！|すごいすごい！ ハイタッチ！|やったー！ おまつりだ〜！',
  ng:'ドンマイ ドンマイ！ わらって いこう！|へっちゃら！ つぎ いこう、つぎ！|まちがえても たのしければ OK！',
  combo:'れんぞく せいかーい！ ヒューヒュー！|とまらなーい！ パレードだ〜！',
  hint:'とくべつ ヒント、はっぴょーう！',
  quiz:'クイズ たいかい、はじまるよ〜！'},
 {id:'cool', n:'クールだけど やさしい', i:'🕶',
  town:'…べつに、まってた わけじゃないけど|この まち、わるくないと 思ってる|{kun}が がんばってるのは、ちゃんと 見てるよ|ひとりの じかんも すきだけど、みんなと いるのも きらいじゃない|こまったら いえよ。てつだうから',
  home:'…きたのか。まあ、あがって|いらっしゃい。…おちゃ くらいなら いれる|べつに かたづけて まってた わけじゃないけど… どうぞ',
  visit:'…わるくない へやだな|あそびに きた。…ちょっとだけな|{kun}らしい へやだと 思う',
  cafe:'…ここの コーヒーは、うまい|あまい ものも、たまには いい|この せき、おちつくんだ',
  ok:'…やるじゃん|せいかい。さすがだな|…すごいと 思う。ほんとに',
  ng:'気に するな。つぎ だ|まちがえるのは、ちょうせん した しょうこ だろ|…おうえん してる',
  combo:'れんぞく せいかい… ふっ、たいした もんだ|…まけて られないな',
  hint:'…しかたないな。ヒントだけ',
  quiz:'…もんだい、とけるかな？'}
];

/* =====================================================================
   データ：しゅみ ごとの セリフ
   ===================================================================== */
const HOBL = {
 'つり':'きのう、川で こんなに 大きな さかなが つれたんだよ！ …ほんとだよ|つりは まつのが だいじなんだ。べんきょうと にてるね|あたらしい かわが できたら、つりに いきたいな',
 'おりょうり':'こんど とくせい オムライスを つくってあげるね|りょうりは かがくなんだよ。はかるのが だいじなんだ|カフェの メニュー、わたしも かんがえて みたいな',
 'サッカー':'リフティング、きのう 20かい できたんだ！|サッカーは チームワークが だいじなんだよ|こうえんで いっしょに ボール けろうよ！',
 'ピアノ':'まいにち 30ぷん ピアノを れんしゅう してるんだ|ドレミの うたなら、目を つぶっても ひけるよ|おんがくって、さんすうと にてるって しってた？',
 'おえかき':'{kun}の にがおえ、かいてみたんだ。こんど 見せるね|いろえんぴつの 24しょく、ぜんぶ つかいきりたいな|まちの けしきを スケッチするのが すきなんだ',
 '読書':'いま よんでる 本、つづきが 気に なって ねむれないんだ|としょかんの 本、こんしゅうは 5さつ かりたよ|ものがたりの 中の せかいに いくのが すきなんだ',
 'むしとり':'きのう、めずらしい チョウを 見つけたんだ！|むしは あしが 6本なんだよ。クモは 8本だから ちがうんだ|こうえんの くさむら、むしの たからばこなんだよ',
 'ダンス':'あたらしい ステップ、おぼえたんだ。見てて！|おんがくが きこえると、からだが うごいちゃう|みんなで おどる ダンス、こんど つくりたいな',
 'ガーデニング':'わたしの はちうえ、きのう つぼみが ついたんだ|はなに みずを あげる じかんが いちばん すき|はたけの やさいも、そだてて みたいな',
 'てつどう':'でんしゃの おとで、なんの でんしゃか わかるんだよ|3りょう へんせいの でんしゃ、かっこいいよね！|えきの なまえ、ぜんぶ いえるように れんしゅう ちゅう',
 '星を 見ること':'こんやは はれそうだから、ほしが よく 見えるよ|オリオンざの 3つぼし、見つけられる？|ながれぼしに 3かい ねがいごと、まだ できたこと ないんだ',
 'おかしづくり':'きのう クッキーを やいたんだ。ちょっと こげたけど|おかしづくりは、はかりが いのちなんだよ|こんど カフェで だす ケーキ、かんがえて みたいな',
 'しょうぎ':'しょうぎは、なん手も さきを よむのが だいじなんだ|はかせと しょうぎ したら、まけちゃった|こんど いっしょに しょうぎ しない？',
 'おさんぽ':'まちの おさんぽ コース、3つ もってるんだ|あるいてると、あたらしい はっけんが あるよね|かわぞいの みちを あるくのが すきなんだ',
 'カラオケ':'こんど みんなで うたいたいな！ マイク もってる？|おきにいりの うた、100かいは うたったよ|おおきな こえで うたうと すっきり するんだ',
 'キャンプ':'たきびの まえで、ほしを 見ながら おはなし したいな|テントを ひとりで たてられるように なったんだ|キャンプの カレーは、とくべつ おいしいんだよ',
 'パズル':'1000ピースの パズル、あと すこしで かんせい なんだ|むずかしい パズルほど、とけたとき うれしいよね|さんすうの もんだいも、パズルみたいで すきなんだ',
 'おしゃれ':'きょうの リボン、あたらしいんだ。きづいた？|いろの くみあわせを かんがえるのが すきなんだよ|ショップの あたらしい ふく、見に いこうよ',
 'かいもの':'ショップの あたらしい しなもの、もう 見た？|おこづかいを ためて、ほしい ものを かうんだ|おみせやさんの おつりけいさん、とくいなんだよ',
 'ひるね':'おひさまの においの おふとんで ひるね、さいこう|ひるねの ゆめで、いい アイデアが うかんだんだ|15ふんの ひるねで、あたまが すっきり するんだよ',
 'うんどう':'まいあさ たいそう してるんだ。いっしょに やる？|うんどうかいで 1とうに なりたいな|からだを うごかすと、きもちも げんきに なるね',
 'こうさく':'ダンボールで おうちを つくったんだ|はさみと のりが あれば、なんでも つくれるよ|こんど {kun}にも なにか つくってあげるね',
 'しゃしん':'まちの すてきな ばしょ、しゃしんに とってるんだ|ゆうやけの しゃしん、うまく とれたんだよ|みんなの えがおの しゃしん、アルバムに したいな',
 'めいろ あそび':'めいろを かくのも とくのも すきなんだ|まちの みちも、めいろみたいで たのしいね|こんど とくせい めいろを つくって あげるね'
};

/* =====================================================================
   データ：ひとりひとりの「ものがたり」（なかよし度で すこしずつ はなしてくれる）
   ===================================================================== */
const ORIGIN = [
 ['となりの 山の ふもと','あさは きりが うみみたいに ひろがるんだ'],['とおい みなみの しま','ずっと なつみたいに あったかいんだよ'],
 ['きたの ゆきぐに','ふゆは ゆきが やねまで つもるんだ'],['大きな 川の ほとり','まいにち 水の おとを ききながら ねてたよ'],
 ['にぎやかな みなと町','ふねの きてきが めざましどけい だったんだ'],['ひろい 草原','かぜが ふくと 草が なみみたいに うごくんだよ'],
 ['ふかい もりの おく','木の 上に ひみつきちが あったんだ'],['さばくの オアシス','よるの ほしが すっごく きれいなんだ'],
 ['花ばたけの 村','はるは いちめん ピンクいろに なるんだよ'],['くもの 上の 小さな 村','くもが あしもとに 見えるんだ'],
 ['かいがんの どうくつ','なみの おとが こだま するんだよ'],['りんごの 木が いっぱいの 里','あきは あまい においで いっぱいなんだ'],
 ['ビルが いっぱいの 大きな 都会','にぎやかすぎて ちょっと つかれちゃった'],['むかしの おしろの 町','いしがきの 上で よく あそんだんだ'],
 ['おんせんの わく 谷','ゆげで いつも ぽかぽか だったよ'],['ほしが よく 見える 高原','ながれぼしを 100こ 見たことが あるんだ']
];
const WHY = [
 'わすれんぼうの きりで みちが わからなく なって、まよってたら この まちの ひかりが 見えたんだ',
 'きりの せいで、ともだちの なまえを わすれちゃって… ここに くれば 思い出せる 気がしたの',
 'おまねきレターが とどいて、ドキドキしながら やってきたんだよ',
 'うわさで「まなびの ひかりの まち」の ことを きいて、ずっと きたかったんだ',
 'たびの とちゅうで 雨やどり したら、すっかり この まちが すきに なっちゃったんだ',
 'ふるさとで「にがて」を わらわれて、にげるように たびに でたんだ。でも ここは ちがった'
];
const WORRY = [
 'じつは くらい ところが ちょっと こわいんだ','かけざんの 7のだんが にがてなんだ…','はじめての ひとと はなすのが はずかしいんだ',
 'あわてんぼうで、よく ものを なくしちゃうの','ふるさとの かぞくに てがみを 書きたいけど、字に じしんが なくて…','みんなより あしが おそいのを 気に してるんだ',
 'ねぼすけで、あさ ぜんぜん おきられないんだ…','すききらいが あって、にんじんが たべられないの','大きな おとが すると、びっくりして うごけなくなるんだ',
 'うたが すきだけど、ひとまえだと こえが でないんだ','きりの せいか、ちいさい ころの ことが ちょっと 思い出せないんだ','すぐに ないちゃうのが なやみなんだ'
];
const GROWTH = [
 'くらい ところも、みんなと いっしょなら へいきに なったよ','7のだんも、まいにち となえて いえるように なったんだ','はなしかけるのが ちょっとずつ こわくなく なったよ',
 'ものを しまう ばしょを きめたら、なくさなく なったんだ','字の れんしゅうを して、かぞくに てがみを だせたんだよ','はやさより、さいごまで はしるのが だいじって わかったんだ',
 'はやねを したら、あさ おきられるように なったよ','カフェの にんじんケーキで、にんじんが すきに なっちゃった','びっくりしても、しんこきゅう すれば だいじょうぶに なったんだ',
 '{kun}の まえなら、うたえるように なったよ','この まちで、すこしずつ 思い出せて きたんだ','ないても いいって わかったら、まえより つよく なれたよ'
];
const TREASURE = [
 ['おばあちゃんに もらった 小さな すず','ならすと げんきが でるんだ'],['ふるさとの 石','ひかりに すかすと にじいろに 見えるの'],
 ['ともだちと とった しゃしん','いつか また みんなで とりたいな'],['ぼろぼろの ずかん','なんかいも よんだから ぜんぶ おぼえてるよ'],
 ['手づくりの マフラー','ちょっと まがってるけど、あったかいんだ'],['はじめて 100てんを とった テスト','くじけそうな とき 見るんだよ'],
 ['きらきらの ビーだま','のぞくと せかいが さかさまに 見えるの'],['おとうさんの ふるい コンパス','まよった ときの おまもりなんだ'],
 ['かいがらの ネックレス','みみに あてると うみの おとが するんだよ'],['シマくんから もらった はね','ふわふわで あったかいんだ'],
 ['よつばの クローバーの しおり','ラッキーが つづきますように！'],['にっきちょう','まいにち この まちの ことを 書いてるんだ']
];
const DREAM = [
 'この まちで いちばんの パンやさん','せかいじゅうを たびする たんけんか','みんなに べんきょうを おしえる せんせい','おいしゃさん。けがした ともだちを なおしたいんだ',
 'うちゅうひこうし','本を 書く さっか','ゆうめいな シェフ','この まちの ちょうちょう','やさしい おまわりさん','花やさん',
 'でんしゃの うんてんし','とけいを つくる しょくにん','えかき','うたの スター','だいくさん。みんなの 家を つくるんだ','はかせ。わからない ことを ぜんぶ しらべたいんだ'
];
const FAV = ['こくご','さんすう','りか','しゃかい','えいご','プログラミング','かんじ','たいいく','おんがく','ずこう'];

/* ものがたりの ストーリー（5つ）。なかよし度 1〜5で ひらく */
function storySteps(r){
  const N = NAMED[r.name + '|' + r.sp]; if(N && N.story) return N.story;
  const b = backOf(r);
  return [
    `じつは わたし、${b.origin[0]}から きたんだ。${b.origin[1]}。${b.why}`,
    `ないしょの はなし、してもいい？ …${b.worry}`,
    `わたしの たからもの、見せてあげる！ ${b.treasure[0]}だよ。${b.treasure[1]}`,
    `しょうらいの ゆめはね、${b.dream}に なること！ …わらわないでね`,
    `{kun}、ありがとう。${b.growth}。この まちに きて、ほんとうに よかった！`
  ];
}
function backOf(r){
  const h = H53(r.id, 53), w = (h >>> 3) % WORRY.length;
  return {origin:ORIGIN[h % ORIGIN.length], why:WHY[(h >>> 7) % WHY.length], worry:WORRY[w], growth:GROWTH[w],
    treasure:TREASURE[(h >>> 11) % TREASURE.length], dream:DREAM[(h >>> 15) % DREAM.length], fav:FAV[(h >>> 19) % FAV.length]};
}
const STEP_T = ['ふるさとの こと','ないしょの なやみ','たからもの','しょうらいの ゆめ','ありがとう'];

/* =====================================================================
   データ：ものがたりに でてきた 住民（とくべつな セリフ）
   ===================================================================== */
const NAMED = {
 'ミミ|rabbit': {
  town:'{kun}が きりの はしで たすけてくれた こと、ずっと わすれないよ|あの ときの にじ、また 見たいなあ|わたし、もう まいごに ならないように、まちの ちずを おぼえたんだ|ねえ、こんど あの はしまで おさんぽ しよ？|ぴょんぴょん はねると、きりの こわさも とんでいくんだ|モヤモヤくん、いまごろ どうしてるかな。ちょっと 気に なるんだ',
  home:'いらっしゃい！ {kun}が きてくれると、みみが ぴーんって なっちゃう！|ようこそ！ にんじんクッキー やいたよ。いっしょに たべよ！|きてくれた！ この へや、にじいろに かざったんだよ',
  visit:'{kun}の おうち、はじめて この まちに きた 日みたいに ドキドキする！|あそびに きたよ！ あの 日の おれい、まだまだ たりないもん',
  cheer:'がんばれ〜！ {kun}の ひかりで、わたし たすかったんだもん！|だいじょうぶ！ きりは かならず はれるよ！',
  story:['わたしね、きりの はしで ずっと ないてたの。だれも きてくれないと 思ってた','でも {kun}の ひかりが とどいて、きりが はれたとき… にじが すっごく きれいだった','いまは、まいごの こを 見つけたら、わたしが 手を つないで あげるんだ','しょうらいは、この まちの「あんないがかり」に なりたいな','{kun}、あの 日 たすけてくれて ほんとうに ありがとう。だいすきな まちに すめて しあわせだよ！']},
 'はかせ|owl': {
  town:'ホッホー、{kun}。きょうは なにを まなんだかの？|ことばの もりの ちょうちょたちは、いまも げんきに とんでおるぞ|わからない ことは はずかしくない。しらない ままが もったいないのじゃ|かんじは ぶひんの くみあわせ。おぼえかたにも コツが あるのじゃよ|まなびの ひかりは、だれかに おしえると もっと つよく なるんじゃ|わしも むかしは、ことばが にがてだったんじゃよ。ホッホッ',
  home:'ホッホー、ようこそ わしの けんきゅうしつへ。本だらけで すまんのう|よく きたのう。きょうは どの 本を よもうか|おお、{kun}。ちょうど おもしろい ことばを 見つけたところじゃ',
  visit:'ホッホー、{kun}の へやは まなびの においが するのう|おじゃまするぞ。ほう、よく べんきょう しておるな',
  cheer:'ホッホー！ あっぱれじゃ！|まちがいは まなびの たね。そだてれば 花が さくぞ',
  story:['わしは ながいこと、ことばの もりの もりばんを しておった','ケシケシに ことばを うばわれた とき、わしは なにも できなかった… くやしかったのう','{kun}が ことばを とりもどしてくれて、わしは きめたんじゃ。この まちで おしえようと','わしの ゆめは、この まちの みんなが 本を すきに なること。としょかんは わしの たからものじゃ','{kun}よ、まなぶ すがたを 見せてくれて ありがとう。おしえる つもりが、わしが まなんでおったわい']},
 'モグ|mole': {
  town:'きしゃは きょうも じかん どおりに はしってますよ！|トンネルの 中は、もう まっくらじゃ ありません。{kun}の おかげです|じかんを まもるのは、うんてんしの ほこりなんです|はやく じこくひょうを よめるように なると、たのしいですよ|クラクラに たべられた じかん、ちゃんと とりもどせて よかった|せんろの 点検、きょうも ばっちりです！',
  home:'ようこそ、わたしの 土の 中の おうちへ。あしもとに 気を つけて|いらっしゃい！ でんしゃの もけい、見ていきますか？|きてくれたんですね。トンネルの はなし、ききます？',
  visit:'{kun}の おうちは あかるいですね。トンネルの そとは いいなあ|おじゃまします。じかん どおりに とうちゃく です！',
  cheer:'しゅっぱつ しんこう！ その ちょうしです！|ていしゃ しても だいじょうぶ。また はしりだせば いいんです',
  story:['わたしは もともと、トンネルを ほる しごとを していました','あの えきの とけいが とまったとき、きしゃごと くらやみに とじこめられて しまって…','{kun}の ひかりで トンネルが あかるく なったとき、なみだが とまりませんでした','ゆめは、この まちから せかいじゅうへ せんろを のばす ことです','{kun}、ありがとう。きょうも あなたの まちの ために、じかん どおりに はしりますよ！']},
 'マリン|seal': {
  town:'Hello！ きょうも げんき？ えいごで あいさつ してみよう！|みなとの とうだいは、こんやも ぴかぴか だよ|Thank you は「ありがとう」。いちばん すきな えいごなんだ|せかいには、いろんな ことばが あるんだよ。わくわく しない？|ふねの たびの はなし、きかせて あげようか？|See you！ は「またね」だよ。いってみて！',
  home:'Welcome！ ようこそ、わたしの みなとの おうちへ！|Hi, {kun}！ きてくれて うれしいな！|Come in！ はいって はいって！',
  visit:'Nice room！ すてきな へやだね！|Hello！ あそびに きたよ。Thank you for inviting me！',
  cheer:'Great job！ すごいよ！|Don\'t worry！ だいじょうぶ、つぎは できるよ！',
  story:['わたしは とおい くにから、ふねで たびを してきた せんちょうなんだ','あらしの よる、とうだいの ひかりが きえて、ほんとうに こわかった…','{kun}の ひかりが とうだいに ともったとき、Thank you って さけんだんだよ','ゆめは、この まちの みんなと、せかいの いろんな くにへ いく こと！','{kun}、Thank you so much！ あなたは わたしの ヒーローだよ']},
 'ツバサ|swallow': {
  town:'てがみの はいたつ、きょうも ばっちり！ そらの ゆうびんやさんだよ|{kun}あての てがみ、こんど とどけに いくね|そらの 上から 見ると、この まち すっごく きれいなんだよ|おまねきレターは、わすれんぼうの きりで まいごに なった みんなへの「思い出しの てがみ」なんだ|はるに なると、とおくの なかまに あいに いくんだ|ゴロゴロに とじこめられてた とき、てがみが ぬれないか しんぱいだったよ',
  home:'いらっしゃい！ のきしたの おうちへ ようこそ！|ようこそ！ てがみの しわけ ちゅう だけど、ゆっくり していってね|きてくれた！ そらの はなし、きかせて あげる！',
  visit:'{kun}の おうちの ポスト、すてきだね！|おじゃまします！ てがみを とどけに きた ついでに、あそびに きたよ',
  cheer:'その こたえ、ちゃんと とどいたよ！|だいじょうぶ！ てがみも こたえも、なんかいでも だしなおせるよ',
  story:['わたしは そらの おしろで、みんなの てがみを はこんでいたんだ','ゴロゴロに もんを とじられて、てがみが だれにも とどかなく なっちゃった…','{kun}が かみなりぐもを はらってくれて、てがみが また とべるように なったんだ','ゆめは、せかいじゅうの「ありがとう」を とどける こと！','{kun}への てがみ、いつか かくね。「ありがとう、だいすきな まちの {kun}へ」って']},
 'ラクタ|camel': {
  town:'ちずは、だれかの「ここに いたよ」の しるしなんだ|きょうも あたらしい ちずを かいてるよ。{kun}の まちの ちずさ|ほういじしんの 北は、いつも おなじ ほうを むいてるんだよ|すなあらしの 中でも、ほしを 見れば みちが わかるんだ|にほんの 47の 都道府県、ぜんぶ いえるかい？|たびは、まいごに なっても たのしいもんだよ',
  home:'ようこそ、たびびとの テントへ！ ちずが いっぱいだろう？|いらっしゃい。さばくの おちゃ、のんでいくかい？|きてくれたね。きょうは どこの ちずを 見る？',
  visit:'{kun}の へやの ちずも、こんど かいて あげよう|おじゃまするよ。この まちは、どこを あるいても たのしいね',
  cheer:'その こたえ、ちずに のせて おきたいね！|まいごに なっても、ひきかえせば いいのさ',
  story:['わたしは、ちずの ない くにを たびする ちずかきなんだ','マヨマヨに ちずを まっしろに されて、ずっと さばくを さまよっていた…','{kun}の ひかりが ほしを ともして、みちを おしえてくれたんだ','ゆめは、せかいじゅうの ちずを かいて、まいごの いない せかいに する こと','{kun}、ありがとう。わたしの ちずの まん中には、いつも この まちを かくよ']}
};

/* =====================================================================
   データ：ハナ（女の子）の セリフ
   kind：talk・think（ひらめき）・read（本）・cafe・night・cheer
   ===================================================================== */
const HANA = {
 talk:'ねえ {kun}、きょうは どんな 一日だった？|わたしね、{kun}と であえて ほんとうに よかったって 思ってるんだ|まちが ひろく なるたびに、むねが わくわく するの|きのう、ミミちゃんと おはなし してたら、あっというまに ゆうがたに なっちゃった|シマくんって、ねてる とき ちょっと いびき かくんだよ。ないしょね|こんど、みんなで おべんとう もって ピクニック しようよ！|この まちの いちばん すきな ばしょ？ えーっと… {kun}の となり かな。えへへ|あたらしい ふく、きてみたいなあ。どれが にあうと 思う？|まちの みんなの なまえ、ぜんぶ おぼえたよ！|わすれんぼうの きりに まけないように、たのしい 思い出を いっぱい つくろうね|{kun}が いない あいだ、まちの おそうじ しておいたよ|ねえ、手、つないでも いい？ なんてね|ゆうびんやさんが くると、なにが とどいたか ドキドキするよね|ハナって なまえ、はなが さくみたいで すきなんだ|つかれた ときは、いっしょに ひと休み しよ。はい、おちゃ|まちの みんな、{kun}の こと「ひかりの ヒーロー」って よんでるんだよ',
 think:'あっ、いいこと 思いついた！ まちがえた もんだいを 「たからもの ノート」に まとめよう！|かんじは、ぶひんに わけると おぼえやすいんだって。「休」は 人が 木で やすんでる んだよ|ひっさんの コツはね、くらいを たてに そろえること！|えいごの たんごは、こえに だして おぼえると わすれにくいよ|わからない ときは、まず もんだいを ゆっくり 2かい よむの。わたしの ひみつの ワザだよ|けいさんの あとは、たしかめざん！ これで まちがいが へるんだよ|おぼえたことを だれかに はなすと、もっと わすれなく なるんだって|ねる まえに ふくしゅう すると、あたまに のこりやすいらしいよ',
 read:'いま よんでる 本、ドラゴンと パンやさんの おはなし なんだ！|としょかんで、{kun}に にあいそうな 本 見つけたよ|本を よむと、いろんな せかいに いけるよね|はかせに すすめられた ずかん、すっごく おもしろいの|ものがたりの さいごって、いつも ドキドキしちゃう|しってる？ この まちの としょかんの 本、みんなが すこしずつ ふやしてるんだよ',
 cafe:'いらっしゃいませ！ なーんてね。カフェの おてつだい、たのしいんだ|きょうの おすすめは、いちごの ショートケーキだよ！|おきゃくさんが「おいしい」って いってくれると、むねが あったかく なるの|{kun}の カフェ、どんどん にんきに なってるね！|ココアの あわで、ハートを かくのが とくいなんだよ|カフェの メニュー、いっしょに かんがえよう！',
 night:'よるの まちって、まどの あかりが ほしみたいで きれいだね|ねえ、ながれぼし 見えた？ わたしは {kun}と ずっと いっしょに いられますようにって ねがったよ|きょうも おつかれさま。ゆっくり ねてね|ねる まえに、シマくんと きょうの ことを はなすのが すきなんだ|おやすみ、{kun}。あしたも いっぱい わらおうね|つきが まあるいと、なんだか うれしく なるの',
 cheer:'がんばれ〜 {kun}！ わたし、いちばん まえで おうえん してるよ！|だいじょうぶ！ {kun}なら できる！ フレー フレー！|いっしょに がんばろう！ わたしも となりで べんきょう するね|まちがえても、おうえんは とまらないよ！'
};
const HANA_OK = 'すごーい！ さすが {kun}！|せいかい！ ハイタッチ！|やったね！ わたしまで うれしい！|その ちょうし！ ぐんぐん いこう！';
const HANA_NG = 'だいじょうぶ！ まちがえた もんだいは たからものだよ|おしい！ いっしょに もういちど おぼえよう|ドンマイ！ わたし、ずっと おうえん してるからね|まちがえても いいんだよ。そこから つよく なれるんだ';
const HANA_COMBO = 'れんぞく せいかい！ すごすぎるよ {kun}！|とまらないね！ まちの みんなも びっくりだよ！';

/* =====================================================================
   イラスト
   ===================================================================== */
['gt_wave','gt_think','gt_cheer','gt_read','gt_cafe','gt_night'].forEach(k => { DEFAULT_ART[k] = IMG53 + k + '.webp'; });
try{ GIRL_ART.talk.push('gt_wave','gt_read'); GIRL_ART.quiz.push('gt_think'); }catch(e){}
/* だい5・6しょうの さしえ：せんようの 絵が できるまでは いまある 絵で 代用（キーは そのまま） */
const CH_ART_TMP = {c5_1:'c4_6', c5_2:'c1_5', c5_3:'c1_3', c5_4:'c1_4', c5_5:'gt_wave', c5_6:'gt_read',
                    c6_1:'c4_1', c6_2:'c3_2', c6_3:'c3_3', c6_4:'c3_4', c6_5:'gt_think', c6_6:'gt_night'};
Object.keys(CH_ART_TMP).forEach(k => { DEFAULT_ART[k] = IMG53 + k + '.jpg'; });   // v5.3.1：せんようの さしえ

/* =====================================================================
   ① まちレベルを Lv30まで
   ===================================================================== */
const LV_MORE = [
 ['にじの都',          300000,  12000, 340], ['ひかりの都',      360000,  14500, 380], ['そらの王国',      430000,  17000, 420],
 ['ほしぞらの王国',    520000,  20000, 460], ['つきの王国',      620000,  23000, 500], ['からくりの王国',  740000,  26500, 540],
 ['はなざかりの王国',  890000,  30000, 580], ['せかいの まち',  1070000,  34000, 620], ['ちきゅうの まち',1280000,  38000, 660],
 ['ほしの まち',      1540000,  42500, 700], ['ぎんがの まち',  1850000,  47000, 740], ['たいようの まち',2200000,  52000, 780],
 ['でんせつの まち',  2650000,  57000, 820], ['しんわの まち',  3200000,  62500, 860], ['えいえんの まち',3800000,  68000, 900],
 ['きぼうの まち',    4600000,  74000, 940], ['まなびの らくえん',5500000, 80000, 980], ['まなびの ユートピア',6600000,87000,1020]
];
(function(){
  if(TOWN_LEVELS.length >= 30) return;
  const last = TOWN_LEVELS[TOWN_LEVELS.length-1];
  LV_MORE.forEach((d, j) => {
    const i = TOWN_LEVELS.length; if(i >= 30) return;
    const s = i - 11;                                  // Lv13 → 1
    TOWN_LEVELS.push({name:d[0], earned:d[1], dev:d[2], traffic:d[3],
      cols:Math.min(28, (last.cols||22) + Math.ceil(s/3)), rows:Math.min(20, (last.rows||16) + Math.ceil(s/4)),
      maxRes:Math.min(104, (last.maxRes||50) + s*3), maxVeh:Math.min(29, (last.maxVeh||20) + Math.ceil(s/2))});
  });
})();
const lvName = lv => TOWN_LEVELS[lv-1]?.name || 'まち';

/* =====================================================================
   ② ものがたり だい5しょう（Lv12）・だい6しょう（Lv15）
   ===================================================================== */
['c5_1','c5_2','c5_3','c5_4','c5_5','c5_6','c6_1','c6_2','c6_3','c6_4','c6_5','c6_6'].forEach(k => { const f = IMG53 + k + '.jpg'; if(window.CH_IMG53_READY) DEFAULT_ART[k] = f; });
const qOpts = (a, L) => shuffle([...new Set([a, ...shuffle(L.filter(x => x!==a)).slice(0, 3)])]);
function ch5Q(k){
  const used = CHS.usedK || (CHS.usedK = new Set());
  const keys = [['weather','そらの なぞ（てんき）'],['sky','そらの なぞ（ほし・たいよう）'],['moonsun','そらの なぞ（月と たいよう）']];
  const [key, cap] = keys[k % keys.length]; let L = (SCI_BANK[key] || []).filter(x => !used.has(x[0]) && (key!=='weather' || /雲|天気|雨|台風|晴|気温|風|雪|空|かみなり|雷|天/.test(x[0] + x[1])));
  if(!L.length) L = SCI_BANK.weather || SCI_BANK.sky || [];
  const q = choice(L); used.add(q[0]);
  return {html:`<small>${esc(cap)}</small>${esc(q[0])}`, v:q[1], opts:shuffle([q[1], q[2], q[3], q[4]].filter(Boolean))};
}
function ch6Q(k){
  const P = PREF.filter(p => p[1] && p[0]);
  if(k===0){ const p = choice(P.filter(p => p[1].replace(/市$/,'') !== p[0].replace(/[都道府県]$/,''))); return {html:`<small>ちずの なぞ（県庁所在地）</small>${esc(p[0])}の 県庁所在地は？`, v:p[1], opts:qOpts(p[1], P.map(x => x[1]))}; }
  if(k===1){ const p = choice(P.filter(p => p[5] && p[5][0])), m = choice(p[5]); return {html:`<small>ちずの なぞ（めいぶつ）</small>「${esc(m)}」で ゆうめいな<br>都道府県は？`, v:p[0], opts:qOpts(p[0], P.filter(x => x[2]===p[2] || Math.random() < .2).map(x => x[0]))}; }
  const J = (SOC_QA && SOC_QA.japan) || []; const q = choice(J);
  if(q) return {html:`<small>ちずの なぞ（にほん）</small>${esc(q[0])}`, v:q[1], opts:shuffle(q[2].slice(0,4))};
  const d = choice([['ちずで 上は どの ほうい？','北'],['ちずで 右は どの ほうい？','東'],['ちずで 下は どの ほうい？','南'],['ちずで 左は どの ほうい？','西']]);
  return {html:`<small>ちずの なぞ（ほうい）</small>${d[0]}`, v:d[1], opts:shuffle(['北','南','東','西'])};
}
CHAPTERS.ch5 = {no:5, lv:12, title:'そらの おしろと かみなりの もん', cover:'c5_5', hp:'ゴロゴロ ⛈', beat:'ゴロゴロから そらの てがみを とりもどした',
 quiz(k){ return ch5Q(k); },
 pages:[
  {fx:50, img:'c5_1', mood:'bright', who:'ハナ',     txt:'{kun}の まちが「ゆめの都」に なったよ！ 見て、ひかりの とうの あかりが そらまで とどいてる！'},
  {fx:60, img:'c5_1', mood:'warm',   who:'シマくん', txt:'あの とうは「ひかりの とう」だったんだ。まなびの ひかりが あつまって、そらの おしろへの みちに なるよ！'},
  {fx:45, img:'c5_2', mood:'lively', who:'ハナ',     txt:'にじいろの はしだ！ …あれ？ たくさんの てがみが、まいごみたいに そらを ただよってる。'},
  {fx:55, img:'c5_2', mood:'warm',   who:'シマくん', txt:'あれは「思い出しの てがみ」。わすれんぼうの きりで、とどけさきが わからなく なっちゃったんだ。'},
  {fx:62, img:'c5_3', mood:'dark', sfx:'knock', txt:'「ゴロゴロ〜！ この もんは とおさないぞ。そらの『なぜ？』は ぜーんぶ くもで かくしてやる〜」 にがて大王の けらい、ゴロゴロが あらわれました。'},
  {fx:40, img:'c5_3', mood:'dark',   who:'シマくん', txt:'そらの ふしぎを とけば、くもは はれる！ てんきや ほしの もんだいだ。{kun}、いくよ！', quiz:1},
  {fx:50, img:'c5_4', mood:'lively', sfx:'light', who:'シマくん', txt:'まなびの ひかり、とどけ〜っ！ 「ゴロ……ゴロ〜ん!? め、めが まわる〜」 あめが きらきらの にじに かわったよ！'},
  {fx:50, img:'c5_5', mood:'bright', who:'ツバサ',   txt:'たすかった〜！ ぼくは そらの ゆうびんやさん、ツバメの ツバサ！ もんが しまって、てがみを とどけられなかったんだ。'},
  {fx:50, img:'c5_5', mood:'warm',   who:'ツバサ',   txt:'これからは {kun}の まちに すんで、みんなに てがみを とどけるよ！ おまねきレターも まかせてね！'},
  {fx:50, img:'c5_6', mood:'dark',   who:'ハナ',     txt:'おしろの 中には…だれも いない。いすの 上に、ふるい にっきの 1ページが のこってる。'},
  {fx:50, img:'c5_6', mood:'warm',   who:'ハナ',     txt:'「ぼくは にがてを わらわれた。だから ぜんぶ わすれさせたかった」…にがて大王さんの にっき、なのかな。'},
  {fx:50, img:'c5_6', mood:'warm',   who:'シマくん', txt:'まどの むこうに、ちずの ない くにが 見える…。まちを「そらの王国」（Lv15）に したら、たしかめに いこう！', fin:1}
 ]};
CHAPTERS.ch6 = {no:6, lv:15, title:'ちずの ない くにと まよいの すなあらし', cover:'c6_5', hp:'マヨマヨ 🌪', beat:'マヨマヨから ちずを とりもどした',
 quiz(k){ return ch6Q(k); },
 pages:[
  {fx:50, img:'c6_1', mood:'bright', who:'ツバサ',   txt:'{kun}、おめでとう！「そらの王国」だ！ きょうも てがみが いっぱいだよ。'},
  {fx:50, img:'c6_1', mood:'warm',   who:'ハナ',     txt:'でも、この 1つうだけ あてさきが まっしろ…。ちずの ない くにから とどいたみたい。'},
  {fx:50, img:'c6_2', mood:'dark',   who:'シマくん', txt:'すなあらしだ！ みちしるべの 字も、ちずも、ぜんぶ きえてる…。どっちへ いけば いいか わからないよ！'},
  {fx:55, img:'c6_3', mood:'dark', sfx:'knock', txt:'「マヨマヨ〜！ ばしょも みちも ぜーんぶ わすれて、みんな まいごに なっちゃえ〜」 にがて大王の けらい、マヨマヨが あらわれました。'},
  {fx:45, img:'c6_3', mood:'dark',   who:'シマくん', txt:'ちずの ちしきで、みちを とりもどそう！ 都道府県や ほういの もんだいだ。{kun}、いくよ！', quiz:1},
  {fx:50, img:'c6_4', mood:'lively', sfx:'light', who:'シマくん', txt:'ひかりよ、ほしに なれ〜っ！ 「マヨ〜〜っ!? ぐるぐる〜」 すなあらしが やんで、よぞらに ほしの みちが うかんだよ！'},
  {fx:50, img:'c6_5', mood:'bright', who:'ラクタ',   txt:'ありがとう！ わたしは ちずかきの たびびと、ラクダの ラクタ。ちずを まっしろに されて、ずっと まよっていたんだ。'},
  {fx:50, img:'c6_5', mood:'warm',   who:'ラクタ',   txt:'{kun}の まちの ちずを かかせて くれないか？ わたしも ひっこして、みんなに ちずの よみかたを おしえるよ。'},
  {fx:50, img:'c6_6', mood:'warm',   who:'ハナ',     txt:'たきびの そばに、また にっきの ページが…。「ちずが よめなくて、ひとりで まいごに なった。だれも さがしに きてくれなかった」'},
  {fx:50, img:'c6_6', mood:'warm',   who:'ハナ',     txt:'にがて大王さん、ほんとうは さみしかったのかも…。わたし、いつか おはなし してみたいな。'},
  {fx:50, img:'c6_6', mood:'warm',   who:'シマくん', txt:'ちへいせんの むこうで、はぐるまの おとが する…「からくりの くに」だ。まちを「からくりの王国」（Lv18）に したら いってみよう！', fin:1}
 ]};
['ch5','ch6'].forEach(id => { if(!CH_ORDER.includes(id)) CH_ORDER.push(id); });
/* これからの 予定（Lv30まで）。ずかんでは つぎの 章だけ「？？？」で 見せる */
const CH_PLAN = [
 {lv:18, t:'からくりの くにと わすれんぼうマシン', s:'プログラミング'}, {lv:20, t:'おとの ない もりと ハーモニー', s:'おんがく・えいご'},
 {lv:22, t:'ほしぞらの としょかん', s:'りか'}, {lv:25, t:'にがて大王の ふるさと', s:'こくご・しゃかい'},
 {lv:28, t:'わすれんぼうの きりの みなもと', s:'ぜんぶの きょうか'}, {lv:30, t:'まなびの 木と にがて大王（さいしゅうしょう）', s:'ぜんぶの きょうか'}
];
window.CH_PLAN53 = CH_PLAN;
const CH_GIFT53 = {ch5:{pt:400, sp:'swallow', name:'ツバサ', star:3, line:'✉️ ツバメの「ツバサ」が ひっこしてきたよ！', extra:'letter'},
                   ch6:{pt:500, sp:'camel',   name:'ラクタ', star:3, line:'🧭 ラクダの「ラクタ」が ひっこしてきたよ！', extra:'rankbook'}};
chReward = (orig => function(id){
  const G = CH_GIFT53[id]; if(!G) return orig.apply(this, arguments);
  save.story = save.story || {}; const key = id + 'gift';
  if(save.story[key]) return '🎁 ごほうびは もう もらったよ';
  save.story[key] = 1;
  let out = `🎁 ごほうび：${G.pt}pt`; addPoints(G.pt, `ものがたり だい${CHAPTERS[id].no}しょう`, true);
  const t = save.town, c = townCalc(), sp = SPECIES.find(s => s.id===G.sp), h = sp && findHome(sp);
  if(sp && h && nonHuman().length < c.maxRes){ const r = newResident(sp); r.name = G.name; r.home = h.key; r.star = Math.max(r.star||1, G.star); t.res.push(r); discover(r.sp); out += '<br>' + G.line; }
  else { t.bag.goldletter = (t.bag.goldletter||0) + 1; out += `<br>✨ きらきらレター ×1（${sp ? esc(homeName(sp.home)) : '家'}が あいたら よんでね）`; }
  if(G.extra==='letter'){ t.bag.letter = (t.bag.letter||0) + 2; out += '<br>✉️ おまねきレター ×2'; }
  if(G.extra==='rankbook'){ t.bag.rankbook = (t.bag.rankbook||0) + 1; out += '<br>📘 ランクアップの本 ×1'; }
  persist(); try{ updatePill(); }catch(e){}
  return out;
})(chReward);
chOffer = async function(auto){
  const id = chNext(); if(!id || CHS.id || $('#story')?.classList.contains('show') || (typeof TU!=='undefined' && TU.on) || $('#dlg')?.classList.contains('show')) return;
  const Ch = CHAPTERS[id];
  const v = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(Ch.cover))}" alt="" style="width:100%;border-radius:14px;object-fit:cover;height:150px"></div>
    <h2 class="dlgT">📜 ものがたりの つづきが とどいたよ！</h2><p class="dlgP">だい${Ch.no}しょう「<b>${esc(Ch.title)}</b>」<br>${auto ? `「${esc(lvName(Ch.lv))}」に なった おいわいに、シマくんが よんでるよ。` : ''}</p>`,
    [{label:'あとで', cls:'white', v:false}, {label:'📜 見る！', cls:'gold', v:true}], 'wide');
  if(v) storyOpenCh(id, () => { renderCurrent?.(); });
};
storyChooser = async function(){
  const lv = (save.town?.lv||0) + 1;
  const list = CH_ORDER.map(id => {
    const C = CHAPTERS[id], ok = chOpen(id);
    return `<button class="chItem ${ok?'':'lock'}" data-ch="${ok?id:''}"><img src="${esc(artSrc(C.cover))}" alt=""><span><small>だい${C.no}しょう</small>${ok ? esc(C.title) : `？？？（Lv${C.lv}で ひらくよ）`}</span></button>`;
  }).join('');
  const lastLv = Math.max(...CH_ORDER.map(id => CHAPTERS[id].lv)), nx = CH_PLAN.find(p => p.lv > lastLv);
  const teaser = nx ? `<button class="chItem lock plan53" data-ch=""><span class="q53">？</span><span><small>だい${CH_ORDER.length+1}しょう</small>？？？（Lv${nx.lv}・じゅんびちゅう）</span></button>` : '';
  await dialog(`<h2 class="dlgT">📜 ものがたり</h2><div class="chList">
    <button class="chItem" data-ch="pro"><img src="${esc(artSrc('st_1'))}" alt=""><span><small>プロローグ</small>まなびの ひかり</span></button>${list}${teaser}</div>
    <p class="dlgP facNote">ものがたりは まちLv30まで つづくよ（いま Lv${lv}）</p>`, [{label:'とじる', cls:'white', v:null}], 'wide');
};

/* =====================================================================
   ③ 住民 ひとりひとりの せいかく・ものがたり・セリフ
   ===================================================================== */
const CTX = {host:null, tr:null, mq:null, gArt:null};
const isHuman = r => !!(r && SP(r.sp)?.human);
const named = r => r && NAMED[r.name + '|' + r.sp];
const traitOf = r => TRAITS[H53(r.id, 7) % TRAITS.length];
const fill = (s, r) => String(s).replace(/\{kun\}/g, pKun()).replace(/\{name\}/g, r?.name || '').replace(/\{hobby\}/g, r?.hobby || 'さんぽ');
const P = s => s ? split(s) : [];
const others = r => (save.town?.res || []).filter(x => x.id!==r.id && !isHuman(x));
function townBits(r){
  const t = save.town, c = t ? Object.values(t.cells) : [], out = [];
  if(!t) return out;
  if(c.includes('river')) out.push('かわの みずの おとを きいてると、こころが しずかに なるね','はしの 上から かわを のぞくと、さかなが 見えるんだよ');
  if(c.includes('park')) out.push('こうえんで あそぶの、だいすき！ こんど いっしょに いこうよ');
  if(c.includes('school')) out.push(save.fac?.school?.ids?.includes(r.id) ? 'きょうは 学校で べんきょう したんだ。ちょっと かしこく なったかも！' : '学校に かよってる こたちが、ちょっと うらやましいな');
  if(c.includes('library')) out.push('としょかんで かりた 本、もうすぐ よみおわるんだ');
  if(c.includes('office')) out.push('タワーの てっぺんって、どんな けしきなんだろう');
  if(c.includes('clinic')) out.push('びょういんの せんせい、とっても やさしいんだよ');
  const L = TOWN_LEVELS[t.lv]; if(L) out.push(`この まちが「${L.name}」に なるなんて、すごいよね`);
  if(t.res.length >= 10) out.push(`この まちも なかまが ${t.res.length}人に なったね。にぎやかで うれしい！`);
  return out;
}
function socialBits(r){
  const o = others(r); if(!o.length) return [];
  const f = choice(o).name, b = backOf(r);
  return [`きのう ${f}と ${r.hobby||'おさんぽ'}を したんだ。たのしかった！`, `${f}って、じつは とっても やさしいんだよ`,
    `${f}と ちょっと けんか しちゃったけど、もう なかなおり したよ`, `${f}に ${b.fav}を おしえて もらったんだ`,
    `${f}の いえの まえを とおると、いい においが するんだよ`];
}
function selfBits(r){
  const b = backOf(r);
  const L = [`すきな きょうかは ${b.fav}なんだ。{kun}は？`, `${b.fav}の もんだいなら、ちょっと じしん あるよ`];
  const told = Math.min(5, frLv(r));
  if(told >= 1) L.push(`ときどき ${b.origin[0]}の ことを 思い出すんだ`);
  if(told >= 3) L.push(`${b.treasure[0]}、きょうも ちゃんと もってるよ`);
  if(told >= 4) L.push(`${b.dream}に なるために、きょうも ちょっとだけ がんばったんだ`);
  return L;
}
function personalLine(r, c){
  const N = named(r), T = traitOf(r), pool = [];
  const add = (L, w=1) => { for(let i=0;i<w;i++) pool.push(...L); };
  if(c==='home'){ if(N) add(P(N.home), 3); add(P(T.home), 2); add(P(SPL[r.sp]).slice(0,2)); return choice(pool); }
  if(c==='visit'){ if(N) add(P(N.visit), 3); add(P(T.visit), 2); add(P(HOBL[r.hobby])); return choice(pool); }
  if(c==='cafe'){ const b = backOf(r);
    add(P(T.cafe), 2); add(P(SPL[r.sp]));
    add([`「${lvName((save.town?.lv||0)+1)}」の うわさを きいて、とおくから きたんだよ`, 'この まちの みんな、やさしいね。すんでみたく なっちゃう', `わたしの ふるさとは ${b.origin[0]}なんだ。${b.origin[1]}`, 'カフェの なかの かざりつけ、すてきだね']);
    return choice(pool); }
  if(N) add(P(N.town), 4);
  add(P(T.town), 2); add(P(SPL[r.sp]), 2); add(P(HOMEL[SP(r.sp).home])); add(P(HOBL[r.hobby]));
  add(townBits(r)); add(socialBits(r)); add(selfBits(r));
  return choice(pool);
}
/* ものがたりの つづきを はなす */
function nextStep(r){
  const told = r.st53 || 0, can = Math.min(5, frLv(r));
  return told < can ? told : -1;
}
talkLine = (orig => function(r, ctx){
  if(!r || isHuman(r)) return orig.apply(this, arguments);
  try{
    persOf(r);
    const c = ctx==='visit' ? 'visit' : ctx==='home' ? 'home' : 'town';
    const i = nextStep(r);
    if(i >= 0 && c!=='visit' && Math.random() < 0.6){
      r.st53 = i + 1; persist();
      setTimeout(() => toast(`📖 ${r.name}の ものがたり その${i+1}「${STEP_T[i]}」が ひらいたよ`), 500);
      const s = fill(storySteps(r)[i], r);
      return `📖 ${named(r) ? s : speak(r, s)}`;
    }
    if(Math.random() < 0.75){ const s = fill(personalLine(r, c), r); return named(r) ? s : speak(r, s); }
  }catch(e){ console.warn(e); }
  return orig.apply(this, arguments);
})(talkLine);
/* くわしく：せいかく・ものがたり */
persHTML = (orig => function(r){
  try{
    if(isHuman(r)) return hanaStoryHTML(r);
    const base = orig(r), T = traitOf(r), N = named(r), can = Math.min(5, frLv(r)), steps = storySteps(r);
    const chip = `<span>${N ? '🌟 とくべつな なかま' : `${T.i} せいかく：<b>${esc(T.n)}</b>`}</span>`;
    return base.replace('<div class="persBox">', `<div class="persBox">${chip}`) + storyBox(r, steps, can);
  }catch(e){ console.warn(e); return orig(r); }
})(persHTML);
function storyBox(r, steps, can){
  return `<div class="st53"><b class="st53T">📖 ${esc(r.name)}の ものがたり <small>${can}/5</small></b>${steps.map((s, i) => i < can
    ? `<p><i>その${i+1}「${STEP_T[i]}」</i>${esc(isHuman(r) || named(r) ? fill(s, r) : speak(r, fill(s, r)))}</p>`
    : `<p class="lk"><i>その${i+1}</i>🔒 なかよし ${'💗'.repeat(i+1)} で きけるよ</p>`).join('')}</div>`;
}
/* その住民の 家に あそびに いった とき */
visitHouse = (orig => async function(key, hostId){
  CTX.host = (save.town?.res || []).find(r => r.id===hostId && r.home===key && !isHuman(r)) || (save.town?.res || []).find(r => r.home===key && !isHuman(r)) || null;
  try{ return await orig.apply(this, arguments); } finally { setTimeout(() => { CTX.host = null; }, 50); }
})(visitHouse);
talkTo = (orig => async function(id, ctx){
  CTX.tr = (save.town?.res || []).find(r => r.id===id) || null;
  try{ return await orig.apply(this, arguments); } finally { CTX.tr = null; }
})(talkTo);
miniQuiz = (orig => async function(who, title){
  CTX.mq = who || null;
  try{ return await orig.apply(this, arguments); } finally { CTX.mq = null; }
})(miniQuiz);

/* 住民ならではの ヒントの ひとこと */
function hintIntro(r){
  if(!r) return '';
  if(isHuman(r)) return choice(['わたしの ひらめき、きいてね！','ここが ポイントだよ！','いっしょに かんがえよ！']);
  const N = named(r); if(N && N.cheer) return choice({'はかせ':['ホッホー、ヒントじゃ'],'マリン':['Here is a hint！ ヒントだよ'],'モグ':['ていしゃえきの あんないです'],'ツバサ':['ヒントの てがみを どうぞ'],'ラクタ':['ちずの ヒントを あげよう'],'ミミ':['ぴょんっと ヒントだよ']}[r.name] || ['ヒントだよ']);
  return speak(r, fill(choice(P(traitOf(r).hint)), r));
}
const _dialog53 = dialog;
dialog = function(html, btns, cls){
  try{
    if(typeof html === 'string'){
      // 住民の 家
      if(CTX.host && html.includes('class="vroom"')){
        const r = CTX.host, line = fill(personalLine(r, 'home'), r);
        html = html.replace(/(<div class="talkBubble"[^>]*><b>[^<]*<\/b>)([^<]*)(<\/div>)/, (m, a, b, c) => a + esc(line) + c);
      }
      // 問題を 出してもいい？
      if(CTX.tr && !isHuman(CTX.tr) && html.includes('ねえねえ！ 問題を 出してもいい？')){
        const r = CTX.tr, N = named(r);
        html = html.replace('ねえねえ！ 問題を 出してもいい？', esc(N ? 'ねえ、もんだいを 出しても いい？' : fill(choice(P(traitOf(r).quiz)), r)));
      }
      // ヒント
      if(CTX.mq && html.includes('<div class="mqHint">')){
        html = html.replace('<div class="mqHint">', `<div class="mqHint"><span class="hw53"><b>${esc(CTX.mq.name)}</b>「${esc(hintIntro(CTX.mq))}」</span>`);
      }
      // かんじの ヒント（住民が おしえてくれる）
      if(Array.isArray(btns) && btns.length===1 && btns[0]?.label==='ありがとう！' && html.includes('class="talkBubble"') && !html.includes('frRow')){
        const nm = (html.match(/<div class="talkBubble"><b>([^<]+)<\/b>/) || [])[1], r = nm && (save.town?.res || []).find(x => x.name===nm);
        if(r) html = html.replace(`<b>${nm}</b>`, `<b>${nm}</b>${esc(hintIntro(r))} `);
      }
    }
  }catch(e){ console.warn(e); }
  return _dialog53.call(this, html, btns, cls);
};
/* カフェの おきゃくさん・勉強の おうえん：その どうぶつ／せいかく ならではの ことばに */
const CHEER_KIND = new Map(); try{ Object.entries(CHEER).forEach(([k, L]) => L.forEach(s => CHEER_KIND.set(s, k))); }catch(e){}
const CAFE_RX = /^(すてきな カフェだね！|.+、とっても おいしいよ！|この カフェ だいすき！ この まちに すんでみたいな！)$/;
const CAFE_ASK = 'ねえねえ、もんだいを 出しても いい？ こたえられたら うれしいな！';
speak = (orig => function(r, line){
  try{
    if(r && !isHuman(r) && typeof line === 'string'){
      const k = CHEER_KIND.get(line);
      if(k && Math.random() < 0.8){ const N = named(r); if(N && N.cheer && k!=='combo') return fill(choice(P(N.cheer)), r); line = fill(choice(P(traitOf(r)[k])), r); }
      else if(String(r.id).startsWith('cg')){
        if(line===CAFE_ASK) line = fill(choice(P(traitOf(r).quiz)), r);
        else if(CAFE_RX.test(line) && !(line.startsWith('この カフェ だいすき') && Math.random() < 0.4) && Math.random() < 0.8) line = fill(personalLine(r, 'cafe'), r);
      }
    }
  }catch(e){ console.warn(e); }
  return orig.call(this, r, line);
})(speak);

/* =====================================================================
   ④ ハナ（女の子）
   ===================================================================== */
const HANA_ART = {talk:null, think:'gt_think', read:'gt_read', cafe:'gt_cafe', night:'gt_night', cheer:'gt_cheer'};
const HANA_STORY = [
  'わたしね、ちいさい ころから パンやさんの においが だいすきなの。あさ、パンの においで 目が さめるのが ゆめ',
  'じつは わたし、さんすうが にがてだったんだ。でも {kun}と いっしょに とくと、ふしぎと たのしいの',
  'わたしの たからものは、{kun}と はじめて いっしょに といた もんだいの ノート。ずっと とってあるんだ',
  'ゆめはね、みんなが にこにこ できる「パンやさん カフェ」を この まちに ひらくこと！',
  '{kun}、いつも となりに いてくれて ありがとう。わたし、{kun}の あいぼうで ほんとうに よかった！'
];
const HANA_STEP_T = ['すきな もの','ないしょの はなし','たからもの','ゆめ','ありがとう'];
function hanaStoryHTML(r){
  const can = Math.min(5, frLv(r));
  return `<div class="st53 hana"><b class="st53T">📖 ${esc(r.name)}の ものがたり <small>${can}/5</small></b>${HANA_STORY.map((s, i) => i < can
    ? `<p><i>その${i+1}「${HANA_STEP_T[i]}」</i>${esc(fill(s, r))}</p>` : `<p class="lk"><i>その${i+1}</i>🔒 なかよし ${'💗'.repeat(i+1)} で きけるよ</p>`).join('')}</div>`;
}
function hanaExtra(r){
  const t = save.town, L = [], m = new Date().getMonth() + 1, st = save.story || {};
  L.push(m>=3&&m<=5 ? 'さくらの はなびらって、ハートの かたちに 見えない？' : m>=6&&m<=8 ? 'あつい 日は、かわで みずあそび したいなあ' : m>=9&&m<=11 ? 'あきは どんぐりひろいの きせつだね。おいもも おいしい！' : 'さむい 日は、ココアを のんで あったまろうね');
  if(t){ const Lv = TOWN_LEVELS[t.lv]; if(Lv) L.push(`まちが「${Lv.name}」に なったね！ つぎは どんな まちに なるかな`);
    const o = t.res.filter(x => !isHuman(x)); if(o.length){ const f = choice(o); L.push(`${f.name}の しゅみは ${f.hobby || 'おさんぽ'}なんだって。こんど いっしょに 見に いこうよ`, `${f.name}、さいきん {kun}の はなしばかり してるんだよ`); } }
  if(st.ch1) L.push('ミミちゃん、すっかり この まちの にんきものだね');
  if(st.ch2) L.push('はかせの じゅぎょう、むずかしいけど おもしろいの');
  if(st.ch3) L.push('モグさんの きしゃ、きょうも ぴったり じかん どおりだったよ');
  if(st.ch4) L.push('マリンさんに「Good morning」の はつおん、ほめられたんだ！');
  if(st.ch5) L.push('ツバサさんが、わたしにも てがみを とどけてくれたの！', 'にがて大王さんの にっき… ずっと 気に なってるんだ');
  if(st.ch6) L.push('ラクタさんが、この まちの ちずを かいてくれたよ。わたしの 家も のってた！', 'にがて大王さんと、いつか ともだちに なれるかな');
  return L;
}
girlLine = (orig => function(r){
  try{
    const h = new Date().getHours(), night = h >= 19 || h < 5, cafe = !!save.unlock45?.cafe;
    const i = Math.min(5, frLv(r)), told = r.st53 || 0;
    if(told < i && Math.random() < 0.5){ r.st53 = told + 1; persist(); setTimeout(() => toast(`📖 ${r.name}の ものがたり その${told+1}が ひらいたよ`), 500); CTX.gArt = null; return '📖 ' + fill(HANA_STORY[told], r); }
    if(Math.random() < 0.3){ CTX.gArt = null; return orig.apply(this, arguments); }
    const kinds = ['talk','talk','talk','think','read','extra','extra'].concat(night ? ['night','night','night'] : []).concat(cafe ? ['cafe'] : []);
    const k = choice(kinds);
    if(k==='extra'){ CTX.gArt = Math.random() < .6 ? 'gt_wave' : null; return fill(choice(hanaExtra(r)), r); }
    CTX.gArt = HANA_ART[k] || (night ? 'gt_night' : null);
    return fill(choice(P(HANA[k])), r);
  }catch(e){ console.warn(e); return orig.apply(this, arguments); }
})(girlLine);
girlArt = (orig => function(kind){
  if(kind==='talk' && CTX.gArt && artSrc(CTX.gArt)){ const a = CTX.gArt; CTX.gArt = null; return a; }
  if(kind==='quiz' && artSrc('gt_think') && Math.random() < 0.6) return 'gt_think';
  return orig.apply(this, arguments);
})(girlArt);
/* 勉強中に ハナも おうえん */
cheer = (orig => function(kind){
  try{
    const g = typeof girl==='function' && girl(), now = Date.now();
    if(g && now - cheerLast >= 9000 && Math.random() < (kind==='ng' ? .22 : kind==='combo' ? .3 : .05)){
      cheerLast = now;
      const line = fill(choice(P(kind==='ng' ? HANA_NG : kind==='combo' ? HANA_COMBO : HANA_OK)), g);
      let el = $('#cheerBox'); if(!el){ document.body.insertAdjacentHTML('beforeend', '<div id="cheerBox"></div>'); el = $('#cheerBox'); }
      el.className = 'show hana53';
      el.innerHTML = `<span class="chPic"><img class="hc53" src="${esc(artSrc('gt_cheer') || artSrc(g.outfit || 'res_girl'))}" alt=""></span><div class="chMsg"><b>${esc(g.name)}</b>${esc(line)}</div>`;
      clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2800);
      return;
    }
  }catch(e){ console.warn(e); }
  return orig.apply(this, arguments);
})(cheer);

/* バージョン ひょうじ */
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER53}`; return o; })(renderSettings);
window.__v53 = {TRAITS, SPL, NAMED, personalLine, storySteps, traitOf, backOf, HANA};
})();

/* =====================================================================
   まなびタウン v5.5：プログラミング 高学年チャレンジ（小学5・6年）
   ・じゅんじ／くりかえし／じょうけんぶんき／へんすう／フローチャート／
     デバッグ／2しんすう／アルゴリズム／ことば
   ・さんすうと おなじ もんだい画面（ポイント・ボーナス・にがて きろく）を つかう
   ===================================================================== */
(function(){
'use strict';
const IMG55 = './assets/images/v55/';
['pr_seq','pr_loop','pr_if','pr_var','pr_flow','pr_bug','pr_bin','pr_algo','pr_word'].forEach(k => { DEFAULT_ART['ic_'+k] = IMG55 + 'ic_' + k + '.webp'; });

/* ---------- 絵（SVG） ---------- */
const COL = {ev:'#F2B33D', mv:'#4C97FF', ctl:'#FFAB19', op:'#59C059', vr:'#FF8C1A', look:'#9966FF', pen:'#0FBD8C'};
const X = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
/* ブロックの ならび。items: {t:'テキスト', c:'色'} または {loop:'n かい', body:[...]} または {ifc:'じょうけん', yes:[...], no:[...]} */
function blocks(items, title){
  let y = 8, out = '';
  const W = 270, BH = 30, IND = 18;
  const draw = (list, x) => list.forEach(it => {
    if(it.loop || it.ifc){
      const head = it.loop ? `🔁 ${it.loop}` : `もし ${it.ifc} なら`, c = it.loop ? COL.ctl : '#E6A100';
      const y0 = y; out += `<rect x="${x}" y="${y}" width="${W-x}" height="${BH}" rx="7" fill="${c}"/><text x="${x+10}" y="${y+20}" class="t55">${X(head)}</text>`; y += BH + 2;
      draw(it.loop ? it.body : it.yes, x + IND);
      if(it.ifc && it.no){ out += `<rect x="${x}" y="${y}" width="${W-x}" height="24" rx="6" fill="${c}"/><text x="${x+10}" y="${y+17}" class="t55">でなければ</text>`; y += 26; draw(it.no, x + IND); }
      out += `<rect x="${x}" y="${y0}" width="${IND-4}" height="${y - y0 + 12}" rx="5" fill="${c}"/><rect x="${x}" y="${y}" width="${W-x}" height="12" rx="5" fill="${c}"/>`; y += 16;
      return; }
    out += `<rect x="${x}" y="${y}" width="${W-x}" height="${BH}" rx="7" fill="${it.c||COL.mv}"/><text x="${x+10}" y="${y+20}" class="t55">${X(it.t)}</text>`; y += BH + 2;
  });
  const top = title ? `<rect x="0" y="${y}" width="150" height="30" rx="14" fill="${COL.ev}"/><text x="10" y="${y+20}" class="t55">🚩 ${X(title)}</text>` : '';
  if(title) y += 34;
  draw(items, 0);
  return `<svg class="pr55 blk55" viewBox="-2 0 ${W+4} ${y+6}" width="${W+4}">${top}${out}</svg>`;
}
/* 正多角形を かく ロボット */
function turtleSVG(n){
  const r = 52, pts = [...Array(n)].map((_,i) => { const a = -Math.PI/2 + i*2*Math.PI/n; return [70 + r*Math.cos(a), 70 + r*Math.sin(a)]; });
  return pts;
}
/* フローチャート */
function flowSVG(a, lim, op, k){
  const opT = op==='*' ? `x を x×${k} にする` : `x を x＋${k} にする`;
  return `<svg class="pr55 flow55" viewBox="0 0 300 330" width="300">
  <defs><marker id="ar55" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7A5A3A"/></marker></defs>
  <g stroke="#7A5A3A" stroke-width="2.5" fill="none" marker-end="url(#ar55)">
   <path d="M120 40V60"/><path d="M120 96V116"/><path d="M120 176V200"/><path d="M120 236V250H40V146H66"/><path d="M174 146H230V266"/></g>
  <rect x="70" y="8" width="100" height="32" rx="16" fill="#FFE29A" stroke="#C9963A" stroke-width="2.5"/><text x="120" y="29" class="f55">はじめ</text>
  <rect x="45" y="62" width="150" height="34" rx="4" fill="#CFE6FF" stroke="#4C97FF" stroke-width="2.5"/><text x="120" y="84" class="f55">x を ${a} にする</text>
  <path d="M120 116L176 146L120 176L64 146Z" fill="#FFE7C7" stroke="#FFAB19" stroke-width="2.5"/><text x="120" y="151" class="f55 sm">x &lt; ${lim} ？</text>
  <text x="100" y="194" class="f55 sm g">はい</text><text x="200" y="138" class="f55 sm r">いいえ</text>
  <rect x="45" y="202" width="150" height="34" rx="4" fill="#D7F2D1" stroke="#59C059" stroke-width="2.5"/><text x="120" y="224" class="f55">${X(opT)}</text>
  <rect x="180" y="268" width="100" height="34" rx="4" fill="#E9DDFF" stroke="#9966FF" stroke-width="2.5"/><text x="230" y="290" class="f55">x を 見せる</text>
  <rect x="180" y="306" width="100" height="0"/></svg>`;
}
/* マスの ちず ＋ とおりたい みち */
function gridSVG(w, h, s, g, path){
  const cs = 40, W = w*cs, H = h*cs; let o = '';
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) o += `<rect x="${x*cs}" y="${y*cs}" width="${cs}" height="${cs}" fill="${(x+y)%2?'#E3F4D7':'#F1FAE9'}"/>`;
  const pl = path.map(([x,y]) => `${x*cs+cs/2},${y*cs+cs/2}`).join(' ');
  o += `<polyline points="${pl}" fill="none" stroke="#FF8FB1" stroke-width="5" stroke-dasharray="2 8" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<text x="${g[0]*cs+cs/2}" y="${g[1]*cs+cs/2+9}" font-size="26" text-anchor="middle">🏁</text>`;
  o += `<image href="${X(artSrc('bird_wave')||'')}" x="${s[0]*cs+2}" y="${s[1]*cs+2}" width="${cs-4}" height="${cs-4}"/>`;
  return `<svg class="pr55 grid55" viewBox="0 0 ${W} ${H}" width="${W}"><rect width="${W}" height="${H}" rx="6" fill="none" stroke="#9CC98A" stroke-width="3"/>${o}</svg>`;
}
/* 2しんすうの カード（16・8・4・2・1） */
function binCards(bits){
  const v = [16,8,4,2,1];
  return `<svg class="pr55 bin55" viewBox="0 0 300 96" width="300">${v.map((n,i) => { const x = i*60 + 4, on = bits[i];
    if(!on) return `<rect x="${x}" y="6" width="52" height="78" rx="7" fill="#7A8CA8" stroke="#56647A" stroke-width="2.5"/><path d="M${x+8} 14l36 62M${x+44} 14l-36 62" stroke="#93A3BC" stroke-width="2"/>`;
    const dots = [], cols = n >= 8 ? 4 : n >= 4 ? 2 : n; const rows = Math.ceil(n/cols);
    for(let d=0; d<n; d++){ const cx = x + 26 + ((d%cols) - (cols-1)/2)*11, cy = 45 + (Math.floor(d/cols) - (rows-1)/2)*11; dots.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="#E8414B"/>`); }
    return `<rect x="${x}" y="6" width="52" height="78" rx="7" fill="#fff" stroke="#C9963A" stroke-width="2.5"/>${dots.join('')}`; }).join('')}
    ${v.map((n,i) => `<text x="${i*60+30}" y="95" class="f55 sm">${n}</text>`).join('')}</svg>`;
}
/* カードの ならび */
function cardsSVG(a){
  return `<svg class="pr55 cards55" viewBox="0 0 ${a.length*52} 64" width="${a.length*52}">${a.map((n,i) => `<rect x="${i*52+3}" y="4" width="44" height="56" rx="7" fill="#FFF8E7" stroke="#C99A63" stroke-width="2.5"/><text x="${i*52+25}" y="41" class="f55 big">${n}</text>`).join('')}</svg>`;
}

/* ---------- もんだい ---------- */
const opt4 = (ans, cands) => { const a = String(ans); const s = new Set([a]); shuffle(cands.map(String)).forEach(c => { if(s.size < 4 && c !== a) s.add(c); }); let k = 1; while(s.size < 4){ s.add(String(Number(a) + k*(k%2?1:-1)*(1+Math.floor(k/2)))); k++; } return shuffle([...s]); };
const pick4 = (ans, list) => { const a = String(ans), r = uniq(list.map(String).filter(v => v!==a)); return shuffle([a, ...shuffle(r).slice(0,3)]); };
const near = (n, sp=[1,2,3,5,10]) => sp.flatMap(d => [n+d, n-d]).filter(v => v >= 0);
const Q = (q, disp, ans, opts, hint, dk) => ({type:'choice', q, disp:`<div class="pr55Box">${disp||''}</div>`, ans:String(ans), opts, hint, dk});
const DIRJ = {U:'うえ', D:'した', L:'ひだり', R:'みぎ'}, DV = {U:[0,-1], D:[0,1], L:[-1,0], R:[1,0]}, ARW = {U:'⬆',D:'⬇',L:'⬅',R:'➡'};

const G = {};
/* じゅんじ */
G.pr_seq = () => {
  const a = rint(2,9), b = rint(2,9), c = rint(2,4), t = rint(0,2);
  let ans, items, h;
  if(t===0){ items = [{t:`x を ${a} にする`, c:COL.vr}, {t:`x を x＋${b} にする`, c:COL.op}, {t:`x を x×${c} にする`, c:COL.op}]; ans = (a+b)*c; h = `まず ${a}＋${b}、その あとで ×${c}`; }
  else if(t===1){ items = [{t:`x を ${a} にする`, c:COL.vr}, {t:`x を x×${c} にする`, c:COL.op}, {t:`x を x＋${b} にする`, c:COL.op}]; ans = a*c + b; h = `じゅんばんが 大事！ さきに ×${c}`; }
  else { const d = rint(1, a); items = [{t:`x を ${a} にする`, c:COL.vr}, {t:`x を x×${c} にする`, c:COL.op}, {t:`x を x－${d} にする`, c:COL.op}, {t:`x を x＋${b} にする`, c:COL.op}]; ans = a*c - d + b; h = '上から じゅんばんに 1つずつ'; }
  return Q('プログラムを 上から じゅんに 実行したよ。<br>さいごの <b>x</b> は いくつ？', blocks(items, 'スタート'), ans, opt4(ans, near(ans).concat([(a+b)*c, a*c+b])), h);
};
/* くりかえし */
G.pr_loop = () => {
  const t = rint(0,3);
  if(t===0){ const s = rint(0,10), n = rint(3,8), d = rint(2,6), ans = s + n*d;
    return Q(`<b>スコア</b>は さいごに いくつ？`, blocks([{t:`スコア を ${s} にする`, c:COL.vr}, {loop:`${n} かい くりかえす`, body:[{t:`スコア を ${d} ふやす`, c:COL.vr}]}], 'スタート'), ans, opt4(ans, near(ans).concat([s+d, n*d, s+(n-1)*d])), `${d}が ${n}かい ふえるよ`); }
  if(t===1){ const a = rint(2,5), b = rint(2,6), ans = a*b;
    return Q('⭐は ぜんぶで いくつ かかれる？', blocks([{loop:`${a} かい くりかえす`, body:[{loop:`${b} かい くりかえす`, body:[{t:'⭐ を 1こ かく', c:COL.pen}]}]}], 'スタート'), ans, opt4(ans, [a+b, ans+a, ans-b, ans+b]), `中の くりかえしが ${a}セット → ${a}×${b}`); }
  if(t===2){ const n = choice([3,4,5,6,8]), ang = 360/n, nm = {3:'正三角形',4:'正方形',5:'正五角形',6:'正六角形',8:'正八角形'};
    return Q('ロボットが ペンで せんを かくよ。<br>どんな 形が かける？', blocks([{t:'ペンを おろす', c:COL.pen}, {loop:`${n} かい くりかえす`, body:[{t:'50 ほ すすむ', c:COL.mv}, {t:`みぎに ${ang}ど まわる`, c:COL.mv}]}], 'スタート'),
      nm[n], shuffle([nm[n], ...shuffle(Object.values(nm).filter(x => x!==nm[n])).slice(0,3)]), `${n}かい まがって もとに もどるよ（${n}×${ang}＝360ど）`); }
  const n = choice([3,4,5,6,8,9,10,12]), ang = 360/n;
  return Q(`ロボットで <b>正${n}角形</b>を かきたい。<br>□ に 入る まわる 角度は？`, blocks([{t:'ペンを おろす', c:COL.pen}, {loop:`${n} かい くりかえす`, body:[{t:'50 ほ すすむ', c:COL.mv}, {t:'みぎに □ ど まわる', c:COL.mv}]}], 'スタート'),
    ang, opt4(ang, [180 - ang, 180, 90, 60, 45, 30, 72, 120].filter(v => v > 0 && v !== ang)), '1しゅう（360ど）を かいすうで わろう');
};
/* じょうけんぶんき */
G.pr_if = () => {
  const t = rint(0,2);
  if(t===0){ const T = rint(15,34), ans = T >= 25 ? 'はんそで' : 'ながそで';
    return Q(`きょうの 気温は <b>${T}ど</b>。<br>ロボットが えらぶ ふくは？`, blocks([{ifc:'気温 ≧ 25', yes:[{t:'はんそで を きる', c:COL.look}], no:[{t:'ながそで を きる', c:COL.look}]}], 'スタート'), ans, shuffle(['はんそで','ながそで','どちらも きる','なにも きない']), '25いじょう かな？'); }
  if(t===1){ const x = rint(1,20), lim = rint(6,14), a = rint(2,9), b = rint(2,5), ans = x > lim ? x - a : x * b;
    return Q(`x が <b>${x}</b> の とき、さいごの x は？`, blocks([{t:`x を ${x} にする`, c:COL.vr}, {ifc:`x ＞ ${lim}`, yes:[{t:`x を x－${a} にする`, c:COL.op}], no:[{t:`x を x×${b} にする`, c:COL.op}]}], 'スタート'),
      ans, opt4(ans, near(ans).concat([x-a, x*b])), `${x} は ${lim} より 大きい？`); }
  const n = rint(1,30), f = n%15===0 ? 'フィズバズ' : n%3===0 ? 'フィズ' : n%5===0 ? 'バズ' : String(n);
  return Q(`かず が <b>${n}</b> の とき、ロボットは なんと いう？`, blocks([{ifc:'かず が 15で わりきれる', yes:[{t:'「フィズバズ」と いう', c:COL.look}], no:[{ifc:'かず が 3で わりきれる', yes:[{t:'「フィズ」と いう', c:COL.look}], no:[{ifc:'かず が 5で わりきれる', yes:[{t:'「バズ」と いう', c:COL.look}], no:[{t:'かず を いう', c:COL.look}]}]}]}]),
    f, pick4(f, ['フィズ','バズ','フィズバズ',String(n)]), '上の じょうけんから じゅんに しらべるよ');
};
/* へんすう */
G.pr_var = () => {
  const t = rint(0,2), a = rint(1,9); let b = rint(1,9); if(b===a) b = a%9 + 1;
  if(t===0){ const ans = `a=${b}, b=${b}`;
    return Q('a と b を いれかえたかったのに…<br>さいごは どうなった？', blocks([{t:`a を ${a} にする`, c:COL.vr}, {t:`b を ${b} にする`, c:COL.vr}, {t:'a を b にする', c:COL.vr}, {t:'b を a にする', c:COL.vr}], 'スタート'),
      ans, shuffle([ans, `a=${b}, b=${a}`, `a=${a}, b=${a}`, `a=${a}, b=${b}`]), 'a に b を 入れた とき、もとの a は きえちゃうよ'); }
  if(t===1){ const ans = `a=${b}, b=${a}`;
    return Q('「とっておく はこ」c を つかったよ。<br>さいごは どうなった？', blocks([{t:`a を ${a} にする`, c:COL.vr}, {t:`b を ${b} にする`, c:COL.vr}, {t:'c を a にする', c:COL.vr}, {t:'a を b にする', c:COL.vr}, {t:'b を c にする', c:COL.vr}], 'スタート'),
      ans, shuffle([ans, `a=${b}, b=${b}`, `a=${a}, b=${a}`, `a=${a}, b=${b}`]), 'c に もとの a を とっておけるね'); }
  const n = rint(3,6), s = rint(1,3); let x = s, sum = 0; for(let i=0;i<n;i++){ sum += x; x += 1; }
  return Q('<b>ごうけい</b> は さいごに いくつ？', blocks([{t:'ごうけい を 0 にする', c:COL.vr}, {t:`i を ${s} にする`, c:COL.vr}, {loop:`${n} かい くりかえす`, body:[{t:'ごうけい を i ふやす', c:COL.vr}, {t:'i を 1 ふやす', c:COL.vr}]}], 'スタート'),
    sum, opt4(sum, near(sum).concat([n*s, sum + x])), `${s}から ${s+n-1}まで たしてみよう`);
};
/* フローチャート */
G.pr_flow = () => {
  for(let t=0;t<30;t++){
    const op = Math.random() < .5 ? '*' : '+', k = op==='*' ? rint(2,3) : rint(3,9), a = rint(1,6), lim = rint(15,60);
    let x = a, n = 0; while(x < lim && n < 8){ x = op==='*' ? x*k : x+k; n++; }
    if(n < 2 || n > 6) continue;
    const prev = op==='*' ? x/k : x-k;
    return Q('フローチャートの とおりに すすむと、<br>さいごに 見せる x は？', flowSVG(a, lim, op, k), x, opt4(x, near(x).concat([prev, op==='*' ? x*k : x+k])), `「はい」の あいだは ぐるぐる まわるよ（${lim}いじょうで ぬける）`);
  }
  return G.pr_seq();
};
/* デバッグ */
G.pr_bug = () => {
  const w = 5, h = 4;
  for(let t=0;t<60;t++){
    const n = rint(5,7), s = [rint(0,w-1), rint(0,h-1)], path = [s.slice()], prog = [];
    let [x,y] = s, ok = true;
    for(let i=0;i<n;i++){ const ds = shuffle(['U','D','L','R']).filter(d => { const nx = x+DV[d][0], ny = y+DV[d][1]; return nx>=0 && ny>=0 && nx<w && ny<h && !path.some(p => p[0]===nx && p[1]===ny); });
      if(!ds.length){ ok = false; break; } const d = ds[0]; x += DV[d][0]; y += DV[d][1]; prog.push(d); path.push([x,y]); }
    if(!ok) continue;
    const bad = rint(0, n-1), wrong = choice(['U','D','L','R'].filter(d => d!==prog[bad])), shown = prog.slice(); shown[bad] = wrong;
    return Q('ピンクの みちを とおって 🏁 に 行きたい。<br>プログラムの <b>なんばんめ</b>が まちがっている？',
      gridSVG(w, h, s, [x,y], path) + blocks(shown.map((d,i) => ({t:`${i+1}．${ARW[d]} ${DIRJ[d]}へ 1マス`, c:COL.mv})), 'スタート'),
      `${bad+1}ばんめ`, shuffle(uniq([`${bad+1}ばんめ`, ...shuffle([...Array(n).keys()].filter(i => i!==bad)).slice(0,3).map(i => `${i+1}ばんめ`)])), 'みちを 1マスずつ ゆびで たどってみよう', prog.join('')+bad);
  }
  return G.pr_seq();
};
/* 2しんすう */
G.pr_bin = () => {
  const t = rint(0,2);
  if(t===0){ let n = rint(1,31); const bits = [16,8,4,2,1].map(v => n & v ? 1 : 0);
    return Q('うらがえしの カードは 0、おもての カードは 1。<br>おもての 点を ぜんぶ たすと いくつ？', binCards(bits), n, opt4(n, near(n,[1,2,4,8,16])), 'おもての カードの 数を たそう'); }
  if(t===1){ const n = rint(3,31), bits = [16,8,4,2,1].map(v => n & v ? 1 : 0), s = bits.join('');
    const cands = [16,8,4,2,1].map(v => (n ^ v)).filter(v => v > 0).map(v => [16,8,4,2,1].map(b => v & b ? 1 : 0).join(''));
    return Q(`<b>${n}</b> を 2しんすう（0と1）で あらわすと？`, binCards(bits.map(() => 1)), s, shuffle([s, ...shuffle(cands).slice(0,3)]), '16・8・4・2・1 の どれを つかうか かんがえよう'); }
  const k = choice([2,3,4,5,6,8]), ans = 2**k;
  return Q(`0 と 1 の ランプが <b>${k}こ</b> あるよ。<br>ぜんぶで なんとおりの あらわしかたが できる？`, `<div class="lamp55">${'<i></i>'.repeat(k)}</div>`, ans, opt4(ans, [k*2, k*k, ans*2, ans/2, ans-1, ans+1]), '1こ ふえるごとに 2ばいに なるよ');
};
/* アルゴリズム */
G.pr_algo = () => {
  const t = rint(0,2);
  if(t===0){ const k = rint(3,7), N = 2**k;
    return Q(`1〜${N} の かずあて。「もっと 大きい？」と きいて<br>のこりを <b>はんぶんずつ</b> へらすと、<br>なんかいで 1つに しぼれる？`, `<div class="half55">${[...Array(Math.min(k,5)+1)].map((_,i) => `<span style="width:${100/2**i}%">${N/2**i}</span>`).join('')}</div>`,
      k, opt4(k, [N/2, N, k+1, k-1, k+2, Math.ceil(N/4)]), `${N} → ${N/2} → ${N/4} … と へっていくよ`); }
  if(t===1){ const n = rint(4,5); let a, b; for(let z=0;z<50;z++){ a = shuffle([...Array(9).keys()].map(i => i+1)).slice(0,n); b = a.slice();
    for(let i=0;i<n-1;i++) if(b[i] > b[i+1]){ [b[i], b[i+1]] = [b[i+1], b[i]]; }
    if(b.join()!==a.join() && b.join()!==a.slice().sort((x,y)=>x-y).join()) break; }
    const ans = b.join(' '), sorted = a.slice().sort((x,y) => x-y).join(' '), c2 = a.slice(); [c2[0], c2[1]] = [c2[1], c2[0]];
    const c3 = a.slice().reverse().join(' ');
    return Q('となりどうしを くらべて、<b>左が 大きければ いれかえる</b>。<br>左から 右へ 1かい とおりおわった ならびは？', cardsSVG(a), ans, pick4(ans, [sorted, c2.join(' '), c3, a.join(' ')]), 'いちばん 大きい カードが 右はしまで うごくよ');
  }
  const L = rint(4,8), arr = shuffle([...Array(20).keys()].map(i => i+1)).slice(0,L), pos = rint(1,L), tgt = arr[pos-1];
  return Q(`カードを <b>左から じゅんに</b> 1まいずつ 見て <b>${tgt}</b> を さがす。<br>なんまい 見たら 見つかる？`, cardsSVG(arr), pos, opt4(pos, [1,2,3,4,5,6,7,8,L].filter(v => v!==pos)), 'ひだりから 1まいずつ かぞえよう');
};
/* ことば */
const WORDS = [
  ['プログラムの まちがいの ことを なんと いう？','バグ',['バグ','ノイズ','エラー音','ウイルス']],
  ['プログラムの まちがいを 見つけて なおすことは？','デバッグ',['デバッグ','ダウンロード','ログイン','コピー']],
  ['もんだいを とくための 手じゅんや やりかたの ことは？','アルゴリズム',['アルゴリズム','アプリ','データ','ネットワーク']],
  ['めいれいを 上から じゅんばんに 実行することを なんと いう？','じゅんじ',['じゅんじ','くりかえし','ぶんき','へんすう']],
  ['「もし 〜なら」で 動きを かえることを なんと いう？','じょうけんぶんき',['じょうけんぶんき','じゅんじ','くりかえし','せいれつ']],
  ['かずや ことばを 入れておく「はこ」の ようなものは？','へんすう',['へんすう','かんすう','ていすう','ふごう']],
  ['あかるさや 温度を はかって コンピュータに つたえる ぶひんは？','センサー',['センサー','モーター','スピーカー','バッテリー']],
  ['コンピュータが 中で つかっている 0と1だけの かずは？','2しんすう',['2しんすう','10しんすう','ローマすうじ','かんすうじ']],
  ['人の ことばを コンピュータが わかる ように 書いた ものは？','プログラム',['プログラム','パスワード','フォルダ','アイコン']],
  ['じどうドアが「人が 来たら ひらく」のは どの しくみ？','じょうけんぶんき',['じょうけんぶんき','くりかえし','じゅんじ','へんすう']],
  ['しんごうきが 青→黄→赤 を ずっと つづけるのは どの しくみ？','くりかえし',['くりかえし','じょうけんぶんき','へんすう','じゅんじ']],
  ['パスワードの つくりかたで よいのは？','ながくて よそうしにくい もの',['ながくて よそうしにくい もの','じぶんの たんじょうび','1234','なまえ そのまま']],
  ['ネットで 知らない 人に おしえて よいのは？','どれも おしえない',['どれも おしえない','じゅうしょ','がっこうの なまえ','でんわばんごう']],
  ['プログラムを 書く ための ことばを なんと いう？','プログラミングげんご',['プログラミングげんご','がいこくご','てんじ','しゅわ']]
];
const WORD_ART = {'センサー':'🌡️','バグ':'🐛','デバッグ':'🔧','アルゴリズム':'🗺️','くりかえし':'🚦','じょうけんぶんき':'🚪'};
G.pr_word = () => { const [q, a, o] = choice(WORDS); const ic = WORD_ART[a];
  return Q(q, ic ? `<div class="word55">${ic}</div>` : '', a, shuffle(o.slice()), 'ことばの いみを 思い出そう'); };

/* ---------- たんげんの とうろく ---------- */
const UNITS55 = [
  ['pr_seq','じゅんじ（じゅんばん）',1,'🧱 きほん'], ['pr_loop','くりかえし・図形',1,'🧱 きほん'], ['pr_if','じょうけんぶんき',1,'🧱 きほん'], ['pr_word','プログラミングの ことば',1,'🧱 きほん'],
  ['pr_var','へんすう',2,'🧠 おうよう'], ['pr_bug','デバッグ（まちがい さがし）',2,'🧠 おうよう'], ['pr_bin','2しんすう',2,'🧠 おうよう'],
  ['pr_flow','フローチャート',3,'🏆 チャレンジ'], ['pr_algo','アルゴリズム（さがす・ならべる）',3,'🏆 チャレンジ']
];
UNITS55.forEach(([k, n, lv]) => { MATH_UNITS[k] = {n, g:'prog', lv, art:'ic_'+k, gen:G[k]}; });
const KEYS55 = UNITS55.map(u => u[0]);
const PRS = {units:['pr_seq','pr_loop','pr_if'], count:10};

/* ---------- がめん（プログラミングの ステージえらびの 上） ---------- */
function prHTML(){
  const M = mSave(), st = k => M.stats?.[k] || {n:0, c:0}, cats = uniq(UNITS55.map(u => u[3]));
  return `<div class="pr55Menu"><div class="pr55Hd"><img src="${esc(artSrc('bird_think')||'')}" alt=""><div><b>🎓 高学年チャレンジ</b><small>小学5・6年の プログラミングの かんがえかた</small></div></div>
    ${cats.map(c => `<h4 class="sGrp">${c}</h4><div class="sGrid">${UNITS55.filter(u => u[3]===c).map(([k, n]) => { const s = st(k), on = PRS.units.includes(k);
      return `<button class="mUnit soc pr55U ${on?'on':''}" data-pr55="${k}"><img class="mIco" src="${esc(artSrc('ic_'+k))}" alt=""><span class="mTxt"><b>${n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small></span>${on?'<span class="mChk">✓</span>':''}</button>`; }).join('')}</div>`).join('')}
    <div class="row"><div class="lab">問題の かず</div><div class="seg" id="pr55Count">${[5,10].map(v => `<button data-v="${v}" class="${PRS.count===v?'on':''}">${v}問</button>`).join('')}</div>
      <button class="btn small white" data-pr55all>ぜんぶ えらぶ</button></div>
    <button class="btn big pink" id="pr55Start" style="width:100%">はじめる！（${PRS.units.length}たんげん）</button>
    <h4 class="sGrp">🗺️ めいろ ステージ</h4></div>`;
}
renderProgSel = (orig => function(){ const o = orig.apply(this, arguments); try{ $('#pView').insertAdjacentHTML('afterbegin', prHTML()); }catch(e){ console.warn(e); } return o; })(renderProgSel);
function prStart(){
  if(!PRS.units.length){ toast('たんげんを えらんでね'); return; }
  const list = buildSet(PRS.units, PRS.count);
  window.MQREV = false; window.MQSOC = true; window.MQSCI = false; window.MQEK = false; window.MQBUN = false; window.MQPRG = true;
  $('#mPlayTag').textContent = 'プログラミング'; $('#mPlayTag').style.background = '#4C97FF';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:true}; show('mathplay'); mRender();
}
document.addEventListener('click', e => {
  if(curScreen!=='prog') return;
  const u = e.target.closest('[data-pr55]');
  if(u){ e.stopImmediatePropagation(); const k = u.dataset.pr55, i = PRS.units.indexOf(k); if(i >= 0){ if(PRS.units.length > 1) PRS.units.splice(i,1); } else PRS.units.push(k); sound('tap'); renderProgSel(); return; }
  if(e.target.closest('[data-pr55all]')){ e.stopImmediatePropagation(); PRS.units = PRS.units.length===KEYS55.length ? ['pr_seq'] : KEYS55.slice(); sound('tap'); renderProgSel(); return; }
  const c = e.target.closest('#pr55Count [data-v]'); if(c){ e.stopImmediatePropagation(); PRS.count = +c.dataset.v; renderProgSel(); return; }
  if(e.target.closest('#pr55Start')){ e.stopImmediatePropagation(); sound('tap'); prStart(); }
}, true);
/* おわった あと・やめた ときは プログラミングへ もどる */
show = (orig => function(name){
  if(name!=='mathplay'){ if(window.MQPRG && curScreen==='mathplay'){ markHist(); if(name==='soc') name = 'prog'; } window.MQPRG = false; }
  const o = orig.apply(this, [name]);
  if(name==='prog') try{ renderProgSel(); }catch(e){}
  return o;
})(show);
socStart = (orig => function(){ if(window.MQPRG && curScreen==='mathplay'){ markHist(); return prStart(); } window.MQPRG = false; return orig.apply(this, arguments); })(socStart);
/* ボーナスは プログラミングの むずかしい たんげんから */
pickHardQ = (orig => function(units, soc){
  if(!window.MQPRG) return orig.apply(this, arguments);
  const lv = Math.max(...PRS.units.map(k => MATH_UNITS[k].lv || 1)), pool = KEYS55.filter(k => (MATH_UNITS[k].lv||1) >= Math.min(3, lv + 1));
  const ks = pool.length ? pool : PRS.units, used = new Set(MQ.list.map(qKeyOf));
  for(let t=0;t<20;t++){ const k = choice(ks), c = {u:k, ...MATH_UNITS[k].gen()}; if(!used.has(qKeyOf(c))) return c; }
  return null;
})(pickHardQ);
/* きろく：プログラミングとして のこす */
try{ if(typeof HIST_LBL==='object') HIST_LBL.prg5 = '🤖 プログラミング（高学年）'; }catch(e){}
function markHist(){ try{ const H = save.history, h = H && H[H.length-1]; if(h && h.subj==='soc' && MQ && MQ.list && MQ.list.every(p => KEYS55.includes(p.u)) && Date.now() - h.d < 6*3600e3){ h.subj = 'prg5'; persist(); } }catch(e){} }
})();

/* =====================================================================
   まなびタウン v5.6
   ① まちがえた 問題の 手あつい かいせつ（図解つき）：さんすう・りか・しゃかい・こくご
   ② ものがたりが すすむと ものの ねだんが 上がる
   ③ れんぞく せいかい ボーナス
   ④ 学年の せってい（住民・カフェなどの とつぜんの 問題が 学年に あう）
   ⑤ 大きな まちの「かるい 表示」
   ===================================================================== */
(function(){
'use strict';
const VER56 = '5.6.0';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nf2 = n => { const v = Math.round(Number(n)*1e6)/1e6; return Number.isInteger(v) ? v.toLocaleString('ja-JP') : String(v); };
const gcd = (a,b) => { a = Math.abs(a); b = Math.abs(b); while(b){ [a,b] = [b, a%b]; } return a || 1; };
const lcm = (a,b) => a / gcd(a,b) * b;
/* 問題文 → ふつうの 文字（分数は a/b） */
const plain = h => String(h||'').replace(/<span class="frac"><b>(\d+)<\/b><b>(\d+)<\/b><\/span>/g, ' $1/$2 ').replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,'')
  .replace(/&nbsp;/g,' ').replace(/(\d),(\d{3})/g,'$1$2').replace(/＋/g,'+').replace(/[−－]/g,'-').replace(/\u3000/g,' ').replace(/\s+/g,' ').trim();
const boldNums = h => { const out = []; String(h||'').replace(/<b>([^<]*)<\/b>/g, (_, t) => { (t.replace(/(\d),(\d{3})/g,'$1$2').match(/\d+(?:\.\d+)?/g)||[]).forEach(n => out.push(Number(n))); }); return out; };
const allNums = t => (t.match(/\d+(?:\.\d+)?/g)||[]).map(Number);

/* =====================================================================
   図の パーツ
   ===================================================================== */
/* 筆算（たし算・ひき算） */
function colAddSub(a, b, op){
  const dec = Math.max((String(a).split('.')[1]||'').length, (String(b).split('.')[1]||'').length);
  const A = Math.round(a*10**dec), B = Math.round(b*10**dec), R = op==='+' ? A+B : A-B;
  const W = Math.max(String(A).length, String(B).length, String(R).length) + (op==='+' ? 0 : 0);
  const da = String(A).padStart(W,' ').split(''), db = String(B).padStart(W,' ').split(''), dr = String(R).padStart(W,' ').split('');
  const ann = Array(W).fill(''), strike = Array(W).fill(false); let carry = 0, lend = 0, carries = 0;
  for(let i=W-1;i>=0;i--){
    const x = da[i]===' ' ? 0 : +da[i], y = db[i]===' ' ? 0 : +db[i];
    if(op==='+'){ const s = x + y + carry; if(carry) ann[i] = '1'; carry = s >= 10 ? 1 : 0; if(carry) carries++; }
    else { let cur = x - lend; let borrowed = false; if(cur < y){ cur += 10; borrowed = true; carries++; }
      if(cur !== x){ ann[i] = String(cur); strike[i] = true; } lend = borrowed ? 1 : 0; }
  }
  const pt = dec ? W - dec : -1;
  const cell = (d, i, cls='') => `<i class="${cls}${i===pt-1 && dec ? ' dp' : ''}">${d===' ' ? '' : d}</i>`;
  const row = (arr, cls, pre='') => `<div class="ca56 ${cls}"><i class="op">${pre}</i>${arr.map((d,i) => cell(d, i, strike[i] && cls==='a' ? 'st' : '')).join('')}</div>`;
  const deco = arr => dec ? arr.map((d,i) => d) : arr;
  return { html:`<div class="col56">${`<div class="ca56 ann ${op==='+'?'cy':'bw'}"><i class="op"></i>${ann.map(d => `<i>${d}</i>`).join('')}</div>`}${row(deco(da),'a')}${row(deco(db),'b', op==='+'?'＋':'－')}<div class="ln56"></div>${row(deco(dr),'r')}${dec ? `<div class="dpNote">・は 小数点の いち</div>` : ''}</div>`,
    carries, R:R/10**dec, dec };
}
/* 筆算（かけ算） */
function colMul(a, b){
  const ds = String(b).split('').reverse(), parts = ds.map((d,i) => a*Number(d)*10**i), R = a*b;
  const W = String(R).length + 1;
  const pad = s => String(s).padStart(W,' ').split('');
  const row = (s, cls, pre='') => `<div class="ca56 ${cls}"><i class="op">${pre}</i>${pad(s).map(d => `<i>${d===' '?'':d}</i>`).join('')}</div>`;
  let h = `<div class="col56">${row(a,'a')}${row(b,'b','×')}<div class="ln56"></div>`;
  if(ds.length > 1){ ds.forEach((d,i) => { const v = a*Number(d); h += `<div class="ca56 p"><i class="op"></i>${pad(String(v) + ' '.repeat(i)).map((c,j) => `<i class="${j >= W-i ? 'sh' : ''}">${c===' '?'':c}</i>`).join('')}</div>`; }); h += '<div class="ln56"></div>'; }
  h += row(R,'r') + '</div>';
  const steps = ds.length > 1 ? ds.map((d,i) => `${a} × ${Number(d)*10**i} = <b>${nf2(parts[i])}</b>${i ? `（${a}×${d} の こたえを <b>${i}けた 左</b>に ずらす）` : ''}`).concat([`ぜんぶ たして <b>${nf2(R)}</b>`])
    : [`一の位から じゅんに：${String(a).split('').reverse().map((d,i) => `${d}×${b}`).join('、')}（くり上がりを わすれずに）`];
  return {html:h, steps};
}
/* わり算の 筆算（手じゅん） */
function longDivSteps(a, b){
  const s = String(a); let r = 0, q = '', out = [], started = false;
  for(let i=0;i<s.length;i++){
    const cur = r*10 + Number(s[i]), d = Math.floor(cur/b);
    if(!started && d===0 && i < s.length-1){ r = cur; continue; }
    started = true; q += d;
    out.push(`<span class="ld56"><b class="c1">たてる</b> ${cur} ÷ ${b} → <b>${d}</b>　<b class="c2">かける</b> ${b}×${d}=${b*d}　<b class="c3">ひく</b> ${cur}−${b*d}=${cur-b*d}${i < s.length-1 ? `　<b class="c4">おろす</b> つぎの ${s[i+1]}` : ''}</span>`);
    r = cur - b*d;
  }
  return {steps:out, q:Number(q||0), r};
}
/* まとまりの 絵（わり算・かけ算） */
function groupsSVG(total, per, opt={}){
  const n = Math.floor(total/per), rem = total - n*per, cols = Math.min(5, per), rowsPer = Math.ceil(per/cols);
  const gw = cols*14 + 10, gh = rowsPer*14 + 10, perRow = Math.max(1, Math.floor(300/(gw+6)));
  let h = '', k = 0;
  for(let g=0; g<n+(rem?1:0); g++){
    const gx = (g % perRow)*(gw+6), gy = Math.floor(g/perRow)*(gh+6), isRem = g===n, cnt = isRem ? rem : per;
    h += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="8" fill="${isRem?'#FFF1F1':'#EEF7FF'}" stroke="${isRem?'#E8414B':'#7FB6E6'}" stroke-dasharray="${isRem?'4 3':''}" stroke-width="2"/>`;
    for(let i=0;i<cnt;i++){ h += `<circle cx="${gx+12+(i%cols)*14}" cy="${gy+12+Math.floor(i/cols)*14}" r="5.2" fill="${isRem?'#E8414B':opt.col||'#F2A33A'}"/>`; k++; }
  }
  const W = Math.min(n+(rem?1:0), perRow)*(gw+6), H = Math.ceil((n+(rem?1:0))/perRow)*(gh+6);
  return `<svg class="fig56" viewBox="-2 -2 ${W+4} ${H+4}" width="${Math.min(320, W+4)}">${h}</svg>`;
}
/* 分数の 帯 */
function fracBar(n, d, opt={}){
  const bars = Math.max(1, Math.ceil(n/d)), W = 240, H = 26; let h = '';
  for(let b=0;b<bars;b++){ for(let i=0;i<d;i++){ const on = b*d + i < n;
      h += `<rect x="${i*W/d}" y="${b*(H+6)}" width="${W/d}" height="${H}" fill="${on ? (opt.col||'#FF9EB5') : '#fff'}" stroke="#B88A5A" stroke-width="1.5"/>`; }
    h += `<text x="${W+8}" y="${b*(H+6)+18}" class="tx56">${b < bars-1 || n%d===0 && n>0 ? '1' : ''}</text>`; }
  return `<div class="fb56"><span>${opt.label ?? `${n}/${d}`}</span><svg class="fig56" viewBox="-2 -2 ${W+26} ${bars*(H+6)}" width="${W+28}">${h}</svg></div>`;
}
/* 位の ひょう */
const PL = ['一','十','百','千','一万','十万','百万','千万','一億','十億','百億','千億','一兆','十兆','百兆','千兆'];
function placeTable(n, hiIdx){
  const s = String(n), L = s.length;
  const cols = [...Array(L)].map((_,i) => L-1-i);
  return `<div class="pt56"><table><tr>${cols.map(p => `<th class="${p%4===0 && p>0 ? 'grp' : ''} ${p===hiIdx?'hi':''}">${PL[p]}</th>`).join('')}</tr><tr>${s.split('').map((d,i) => `<td class="${cols[i]%4===0 && cols[i]>0 ? 'grp' : ''} ${cols[i]===hiIdx?'hi':''}">${d}</td>`).join('')}</tr></table><small>4けたごとに「万」「億」「兆」が かわるよ</small></div>`;
}
/* テープ図 */
function tape(segs, opt={}){
  const W = 280, tot = segs.reduce((a,s) => a + s.w, 0) || 1; let x = 0, h = '';
  segs.forEach(s => { const w = Math.max(18, s.w/tot*W);
    h += `<rect x="${x}" y="14" width="${w}" height="26" rx="4" fill="${s.col||'#BDE3FF'}" stroke="#5C88B5" stroke-width="1.5"/><text x="${x+w/2}" y="32" class="tx56 c">${X(s.t)}</text>`; x += w; });
  if(opt.top) h += `<path d="M0 10 Q0 3 8 3 H${x-8} Q${x} 3 ${x} 10" fill="none" stroke="#E8414B" stroke-width="2"/><text x="${x/2}" y="0" class="tx56 c r">${X(opt.top)}</text>`;
  if(opt.bot) h += `<path d="M0 44 Q0 51 8 51 H${x-8} Q${x} 51 ${x} 44" fill="none" stroke="#1C6AAE" stroke-width="2"/><text x="${x/2}" y="66" class="tx56 c b">${X(opt.bot)}</text>`;
  return `<svg class="fig56" viewBox="-4 -14 ${x+8} ${opt.bot?84:60}" width="${Math.min(330, x+8)}">${h}</svg>`;
}
/* 数直線 */
function numLine56(lo, hi, marks){
  const W = 280, P = v => 10 + (v-lo)/(hi-lo)*W; let h = `<line x1="10" y1="34" x2="${W+10}" y2="34" stroke="#555" stroke-width="2"/>`;
  for(let i=0;i<=10;i++){ const v = lo + (hi-lo)*i/10; h += `<line x1="${P(v)}" y1="${i%5?29:25}" x2="${P(v)}" y2="${i%5?39:43}" stroke="#555" stroke-width="${i%5?1:2}"/>`; }
  marks.forEach(m => { h += `<circle cx="${P(m.v)}" cy="34" r="6" fill="${m.col}"/><text x="${P(m.v)}" y="${m.up?16:62}" class="tx56 c" fill="${m.col}">${X(m.t)}</text>`; });
  h += `<text x="10" y="62" class="tx56 c">${nf2(lo)}</text><text x="${W+10}" y="62" class="tx56 c">${nf2(hi)}</text>`;
  return `<svg class="fig56" viewBox="-24 0 ${W+60} 70" width="320">${h}</svg>`;
}
/* 長方形・直方体 */
function rectFig(w, hgt, uw, uh){
  const s = Math.min(200/w, 110/hgt, 24), W = Math.max(40, w*s), H = Math.max(30, hgt*s);
  let g = ''; if(w*hgt <= 160) for(let i=1;i<w;i++) g += `<line x1="${i*W/w}" y1="0" x2="${i*W/w}" y2="${H}" stroke="#9CC3E6" stroke-width="1"/>`;
  if(w*hgt <= 160) for(let j=1;j<hgt;j++) g += `<line x1="0" y1="${j*H/hgt}" x2="${W}" y2="${j*H/hgt}" stroke="#9CC3E6" stroke-width="1"/>`;
  return `<svg class="fig56" viewBox="-60 -24 ${W+80} ${H+40}" width="${Math.min(320, W+80)}"><rect width="${W}" height="${H}" fill="#E7F3FF" stroke="#2F6DB5" stroke-width="2.5"/>${g}
    <text x="${W/2}" y="-8" class="tx56 c">${X(uw)}</text><text x="-8" y="${H/2+5}" class="tx56" text-anchor="end">${X(uh)}</text></svg>`;
}
function boxFig(a, b, c){
  return `<svg class="fig56" viewBox="0 0 260 160" width="260"><path d="M40 60 L150 60 L150 140 L40 140 Z" fill="#E7F3FF" stroke="#2F6DB5" stroke-width="2.5"/>
    <path d="M40 60 L80 25 L190 25 L150 60 Z" fill="#CFE6FF" stroke="#2F6DB5" stroke-width="2.5"/><path d="M150 60 L190 25 L190 105 L150 140 Z" fill="#B9DAFB" stroke="#2F6DB5" stroke-width="2.5"/>
    <text x="95" y="156" class="tx56 c">よこ ${X(b)}</text><text x="34" y="104" class="tx56" text-anchor="end">高さ ${X(c)}</text><text x="196" y="72" class="tx56">たて ${X(a)}</text></svg>`;
}
/* へいきんの ぼう */
function aveBars(vals){
  const mx = Math.max(...vals), av = vals.reduce((a,b)=>a+b,0)/vals.length, W = 34, H = 110;
  let h = vals.map((v,i) => `<rect x="${i*(W+10)}" y="${H - v/mx*H}" width="${W}" height="${v/mx*H}" rx="4" fill="#9ED3A0"/><text x="${i*(W+10)+W/2}" y="${H - v/mx*H - 4}" class="tx56 c">${v}</text>`).join('');
  const y = H - av/mx*H; h += `<line x1="-4" y1="${y}" x2="${vals.length*(W+10)}" y2="${y}" stroke="#E8414B" stroke-width="2.5" stroke-dasharray="6 4"/><text x="${vals.length*(W+10)+2}" y="${y+5}" class="tx56 r">へいきん ${nf2(av)}</text>`;
  return `<svg class="fig56" viewBox="-6 -16 ${vals.length*(W+10)+110} ${H+22}" width="${Math.min(330, vals.length*(W+10)+116)}">${h}</svg>`;
}
/* 時こくの 線 */
function timeLine(h1, m1, add){
  const t0 = h1*60 + m1, t1 = t0 + add, nextH = Math.ceil((t0+0.01)/60)*60, W = 280, P = t => 10 + (t - t0)/(Math.max(add, 1))*W;
  let h = `<line x1="10" y1="30" x2="${W+10}" y2="30" stroke="#555" stroke-width="2"/>`;
  const fm = t => `${Math.floor(t/60)}時${t%60 ? (t%60)+'分' : ''}`;
  h += `<circle cx="${P(t0)}" cy="30" r="6" fill="#1C6AAE"/><text x="${P(t0)}" y="56" class="tx56 c b">${fm(t0)}</text><circle cx="${P(t1)}" cy="30" r="6" fill="#E8414B"/><text x="${P(t1)}" y="56" class="tx56 c r">${fm(t1)}</text>`;
  if(nextH > t0 && nextH < t1){ h += `<line x1="${P(nextH)}" y1="20" x2="${P(nextH)}" y2="40" stroke="#555" stroke-width="2"/><text x="${P(nextH)}" y="14" class="tx56 c">${fm(nextH)}</text>`
    + `<text x="${(P(t0)+P(nextH))/2}" y="25" class="tx56 c g">${nextH-t0}分</text><text x="${(P(nextH)+P(t1))/2}" y="25" class="tx56 c g">${t1-nextH}分</text>`; }
  return `<svg class="fig56" viewBox="-30 0 ${W+70} 64" width="320">${h}</svg>`;
}

/* =====================================================================
   しきの 計算（じゅんばん つき）
   ===================================================================== */
function tokenize(s){ return (s.replace(/（/g,'(').replace(/）/g,')').match(/\d+(?:\.\d+)?|[+\-×÷()]/g)||[]); }
function evalSteps(s){
  let tk = tokenize(s); const steps = [];
  const show = (arr, a, b) => arr.map((t,i) => i>=a && i<=b ? `<u>${t}</u>` : t).join(' ');
  const calc = (x, o, y) => o==='+' ? x+y : o==='-' ? x-y : o==='×' ? x*y : x/y;
  for(let guard=0; guard<20 && tk.length>1; guard++){
    let lo = 0, hi = tk.length-1;
    const op = tk.lastIndexOf('('); if(op >= 0){ lo = op+1; hi = tk.indexOf(')', op) - 1; }
    let i = -1; for(let k=lo+1;k<=hi;k+=2) if(tk[k]==='×'||tk[k]==='÷'){ i = k; break; }
    if(i < 0) i = lo+1;
    if(lo===hi){ steps.push(show(tk, lo-1, hi+1) + '　（かっこを はずす）'); tk.splice(lo-1, 3, tk[lo]); continue; }
    const v = calc(Number(tk[i-1]), tk[i], Number(tk[i+1])), r = Math.round(v*1e6)/1e6;
    steps.push(`${show(tk, i-1, i+1)}　→　${tk[i-1]} ${tk[i]} ${tk[i+1]} = <b>${r}</b>`);
    tk.splice(i-1, 3, String(r));
  }
  return {steps, v:Number(tk[0])};
}
/* 文章題：数を くみあわせて こたえに なる 式を さがす */
function findExpr(ns, ans){
  const A = Number(ans); if(!isFinite(A)) return null;
  const ops = ['+','-','×','÷'], c = (x,o,y) => o==='+' ? x+y : o==='-' ? x-y : o==='×' ? x*y : y ? x/y : NaN, eq = v => Math.abs(v - A) < 1e-6;
  for(let i=0;i<ns.length;i++) for(let j=0;j<ns.length;j++){ if(i===j) continue; for(const o of ops) if(eq(c(ns[i],o,ns[j]))) return {e:`${nf2(ns[i])} ${o} ${nf2(ns[j])}`, a:ns[i], b:ns[j], o}; }
  for(let i=0;i<ns.length;i++) for(let j=0;j<ns.length;j++) for(let k=0;k<ns.length;k++){ if(i===j||j===k||i===k) continue;
    for(const o1 of ops) for(const o2 of ops){
      if(eq(c(c(ns[i],o1,ns[j]),o2,ns[k]))) return {e:`${(o2==='×'||o2==='÷') && (o1==='+'||o1==='-') ? '(' : ''}${nf2(ns[i])} ${o1} ${nf2(ns[j])}${(o2==='×'||o2==='÷') && (o1==='+'||o1==='-') ? ')' : ''} ${o2} ${nf2(ns[k])}`};
      if(eq(c(ns[i],o1,c(ns[j],o2,ns[k])))) return {e:`${nf2(ns[i])} ${o1} ${(o1==='×'||o1==='÷'||o1==='-') && (o2==='+'||o2==='-') ? '(' : ''}${nf2(ns[j])} ${o2} ${nf2(ns[k])}${(o1==='×'||o1==='÷'||o1==='-') && (o2==='+'||o2==='-') ? ')' : ''}`}; } }
  return null;
}
const UNIT_F = [[/km/,'m',1000,'1km = 1000m'],[/kg/,'g',1000,'1kg = 1000g'],[/(\d)t\b|\dt /,'kg',1000,'1t = 1000kg'],[/\dm(?!m|²|³)/,'cm',100,'1m = 100cm'],[/cm(?!²|³)/,'mm',10,'1cm = 10mm'],
  [/時間/,'分',60,'1時間 = 60分'],[/分.*びょう|びょう/,'分',60,'1分 = 60びょう'],[/\dL/,'cm³',1000,'1L = 1000cm³'],[/m²/,'cm²',10000,'1m² = 10000cm²'],[/dL/,'',10,'1L = 10dL']];
function convFacts(t){ return UNIT_F.filter(([re]) => re.test(t)).map(f => f[3]); }
function convNums(t){ const o = []; UNIT_F.forEach(([re,,f]) => { if(re.test(t)) o.push(f); }); return o; }
/* 文章題の テープ図 */
function tapeFor(f, t){
  if(!f || f.o==null) return '';
  const a = f.a, b = f.b;
  if(f.o==='+') return tape([{w:a, t:nf2(a)}, {w:b, t:nf2(b), col:'#FFD9A8'}], {top:'あわせて ？'});
  if(f.o==='-') return tape([{w:Math.max(a-b,0.0001), t:'？', col:'#FFE3E8'}, {w:b, t:nf2(b), col:'#FFD9A8'}], {top:`ぜんぶ ${nf2(a)}`});
  if(f.o==='×'){ if(!Number.isInteger(b) || b < 1) return ''; const n = Math.min(b, 8), segs = [...Array(n)].map((_,i) => ({w:1, t:i===0 ? nf2(a) : i===n-1 && b>8 ? '…' : ''})); return tape(segs, {top:`${nf2(a)} が ${nf2(b)}こ分 → ？`}); }
  if(f.o==='÷') return tape([...Array(Math.min(8, Math.max(2, Math.round(Number(a)/Math.max(b,1e-9)) || 2)))].map((_,i) => ({w:1, t:i===0 ? nf2(b) : ''})), {top:`ぜんぶ ${nf2(a)}`, bot:`${nf2(b)} ずつ → いくつ分？`});
  return '';
}

/* =====================================================================
   さんすうの かいせつ
   ===================================================================== */
function mathExp(p, v){
  const u = p.u, t = plain(p.q), ans = String(p.ans), out = {figs:[], steps:[], tip:'', why:''};
  const bn = boldNums(p.q), an = Number(String(ans).replace(/,/g,''));
  const exprM = t.replace(/□は？|（[^）]*）$/g,'').match(/^\s*([\d.\s+\-×÷()（）/]+)\s*$/);
  const expr = exprM && /[+\-×÷]/.test(exprM[1]) ? exprM[1].trim() : null;
  const hasFrac = /\d+\/\d+/.test(t);
  const userN = Number(String(v||'').replace(/,/g,'').replace(/[^\d.\-]/g,''));

  /* ---- 分数 ---- */
  if(hasFrac || /等分|分数|仮分数|帯分数/.test(t)){
    const fr = [...t.matchAll(/(?:(\d+)\s*(?=\d+\/))?(\d+)\/(\d+)/g)].map(m => ({n:Number(m[2]), d:Number(m[3])}));
    const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)/);
    if(/仮分数に/.test(t) && mixed){ const w = +mixed[1], n = +mixed[2], d = +mixed[3];
      out.steps.push(`「${w}と${n}/${d}」は 1が ${w}こ と ${n}/${d}`, `1 = ${d}/${d} だから、${w} = ${w*d}/${d}`, `${w*d}/${d} ＋ ${n}/${d} = <b>${w*d+n}/${d}</b>`);
      out.figs.push(fracBar(w*d+n, d, {label:`${w}と${n}/${d}`})); out.tip = '帯分数 → 仮分数：せいすう × 分母 ＋ 分子'; return out; }
    if(/帯分数に/.test(t) && fr[0]){ const {n, d} = fr[0], w = Math.floor(n/d), r = n % d;
      out.steps.push(`${n} ÷ ${d} = ${w} あまり ${r}`, `${d}/${d} が ${w}こ（＝${w}）と、あまり ${r}/${d}`, `こたえ <b>${w}と${r}/${d}</b>`);
      out.figs.push(fracBar(n, d, {label:`${n}/${d}`})); out.tip = '仮分数 → 帯分数：分子 ÷ 分母 の しょうと あまり'; return out; }
    if(fr.length >= 2 && (/[+\-]/.test(t) || /あわせて|ぜんぶで|のこり|ちがい/.test(t))){
      const A = fr[0], B = fr[1], op = /\d\/\d+\s*-\s*\d/.test(t) || /のこり|ちがい/.test(t) ? '-' : '+';
      if(A.d === B.d){ const r = op==='+' ? A.n+B.n : A.n-B.n;
        out.steps.push(`分母は どちらも ${A.d}（${A.d}こに 分けた 1つ分が 同じ 大きさ）`, `分子だけ ${op==='+'?'たす':'ひく'}：${A.n} ${op==='+'?'＋':'－'} ${B.n} = ${r}`, `こたえ <b>${r}/${A.d}</b>（分母は そのまま！）`);
        out.figs.push(fracBar(A.n, A.d), fracBar(B.n, B.d, {col:'#FFD27A'}), fracBar(r, A.d, {col:'#9ED3A0', label:`= ${r}/${A.d}`}));
        if(userN && String(v).includes('/') && Number(String(v).split('/')[1]) === A.d*2) out.why = '分母どうしも たしちゃったかも？ 分母は そのままだよ';
        out.tip = '分母が 同じ 分数の たし算・ひき算は、分子だけ 計算する'; return out; }
      const L = lcm(A.d, B.d), a2 = A.n*L/A.d, b2 = B.n*L/B.d, r = op==='+' ? a2+b2 : a2-b2, g = gcd(r, L);
      out.steps.push(`分母が ちがうので <b>通分</b>：${A.d} と ${B.d} の 最小公倍数は ${L}`, `${A.n}/${A.d} = ${a2}/${L}、${B.n}/${B.d} = ${b2}/${L}`, `${a2}/${L} ${op==='+'?'＋':'－'} ${b2}/${L} = <b>${r}/${L}</b>${g>1 ? `（約分すると ${r/g}/${L/g}）` : ''}`);
      out.figs.push(fracBar(a2, L, {label:`${A.n}/${A.d}=${a2}/${L}`}), fracBar(b2, L, {col:'#FFD27A', label:`${B.n}/${B.d}=${b2}/${L}`}));
      out.tip = '分母を そろえて（通分）から 分子を 計算しよう'; return out; }
    if(/1\s*-\s*\d+\/\d+/.test(t) && fr[0]){ const {n,d} = fr[0];
      out.steps.push(`1 を 分数に すると ${d}/${d}`, `${d}/${d} − ${n}/${d} = <b>${d-n}/${d}</b>`); out.figs.push(fracBar(d, d, {label:'1'}), fracBar(d-n, d, {col:'#9ED3A0', label:`のこり ${d-n}/${d}`})); return out; }
    const eq = t.match(/(\d+)等分.*?(\d+)(?:こ分|まい)/);
    if(eq){ const d = +eq[1], n = +eq[2]; out.steps.push(`${d}等分 → 分母は ${d}`, `${n}こ分 → 分子は ${n}`, `こたえ <b>${n}/${d}</b>`); out.figs.push(fracBar(n, d)); out.tip = '分母＝いくつに 分けたか、分子＝その いくつ分'; return out; }
    if(p.type==='cmp' && fr.length >= 2){ out.figs.push(fracBar(fr[0].n, fr[0].d), fracBar(fr[1].n, fr[1].d, {col:'#FFD27A'})); out.steps.push('分母が 同じなら、分子が 大きい ほうが 大きい'); return out; }
  }
  /* ---- 大小（cmp） ---- */
  if(p.type==='cmp'){
    const d = plain(p.disp||''); const sides = d.split('□'); 
    if(sides.length===2){ const L = sides[0].trim(), R = sides[1].trim();
      const term = x => { x = x.trim(); const f = x.match(/^(\d+)\/(\d+)$/); if(f) return f[1]/f[2]; const m = x.match(/^(?:(\d+)兆)?(?:(\d+)億)?(?:(\d+)万)?(\d+(?:\.\d+)?)?$/); if(!m || !x) return NaN; return (+(m[1]||0))*1e12 + (+(m[2]||0))*1e8 + (+(m[3]||0))*1e4 + (+(m[4]||0)); };
      const val = s => { const parts = s.replace(/\s/g,'').split(/(?=[+\-])/); let tot = 0; for(const pt of parts){ const sg = pt[0]==='-' ? -1 : 1, v2 = term(pt.replace(/^[+\-]/,'')); if(!isFinite(v2)) return NaN; tot += sg*v2; } return tot; };
      const lv = val(L), rv = val(R);
      out.steps.push(`左：${X(L)}${isFinite(lv) && String(lv)!==L ? ` → ${nf2(lv)}` : ''}`, `右：${X(R)}${isFinite(rv) && String(rv)!==R ? ` → ${nf2(rv)}` : ''}`, `大きい ほうに ひらく：<b>${X(L)} ${ans} ${X(R)}</b>`);
      out.tip = '「＞」「＜」は 大きい ほうに 口を ひらく ワニの 口！'; return out; }
  }
  /* ---- 位・大きな数 ---- */
  if(u==='big' || u==='oku'){
    const pm = t.match(/(\d{5,})\s*の\s*(\S+?)の位/);
    if(pm){ const idx = PL.indexOf(pm[2]); out.figs.push(placeTable(pm[1], idx)); out.steps.push(`右から 一・十・百・千・一万… と 数えて「${pm[2]}の位」を さがす`, `${pm[2]}の位の 数字は <b>${ans}</b>`); return out; }
    if(/数字で/.test(t) && /^\d+$/.test(ans)){ out.figs.push(placeTable(ans)); out.steps.push('「兆」「億」「万」で 区切って、それぞれ 4けたで 書く', 'ない 位には <b>0</b> を 書く のを わすれずに'); out.tip = '「万」の 前と 後ろで 分けて 考えよう'; return out; }
    if(/読み方/.test(t)){ const n = (t.match(/\d{5,}/)||[''])[0]; out.figs.push(placeTable(n)); out.steps.push('右から 4けたずつ 区切って、「万」「億」を つけて 読む', `こたえ <b>${X(ans)}</b>`); return out; }
    const m = t.match(/(\d+)\s*を\s*(\d+)倍/); if(m){ const z = String(m[2]).length-1; out.steps.push(`${m[2]}倍 → 右に 0を <b>${z}こ</b> つける`, `${nf2(m[1])} → <b>${X(ans)}</b>`); out.figs.push(placeTable(String(an).length ? String(Math.round(an)) : ans)); return out; }
    const c = t.match(/(\d+)\s*を\s*(\d+)こ\s*集め/); if(c){ out.steps.push(`${nf2(c[1])} が ${c[2]}こ → ${nf2(c[1])} × ${c[2]}`, `= <b>${nf2(an)}</b>`); out.figs.push(placeTable(String(an))); return out; }
  }
  /* ---- がい数 ---- */
  if(u==='gaisu'){
    const n = Number((t.match(/\d{3,}/)||[0])[0]); const pm = t.match(/(十|百|千|一万|万)の位まで|上から\s*(\d)けた/);
    let unit = 10; if(pm){ if(pm[2]) unit = 10**(String(n).length - Number(pm[2])); else unit = {'十':10,'百':100,'千':1000,'一万':10000,'万':10000}[pm[1]] || 10; }
    const lo = Math.floor(n/unit)*unit, hi = lo + unit, mid = lo + unit/2, look = Math.floor(n % unit / (unit/10));
    out.figs.push(numLine56(lo, hi, [{v:n, t:nf2(n), col:'#1C6AAE', up:true}, {v:mid, t:'まんなか', col:'#999'}]));
    out.steps.push(`${nf2(unit)}の まとまりで 考える：${nf2(lo)} と ${nf2(hi)} の あいだ`, `1つ 下の 位の 数字は <b>${look}</b> → ${look >= 5 ? '5〜9 なので 切り上げ' : '0〜4 なので 切りすて'}`, `こたえ <b>${nf2(an)}</b>`);
    out.tip = '四捨五入：すぐ 下の 位が 0〜4 なら 切りすて、5〜9 なら 切り上げ'; return out;
  }
  /* ---- 時こく ---- */
  if(u==='time' && /時/.test(ans)){
    const m = t.match(/(\d+)時(\d+)?分?.*?(\d+)分\s*(?:歩い|後|前)/), back = /前/.test(t);
    if(m){ const h = +m[1], mi = +(m[2]||0), d = +m[3];
      if(!back){ out.figs.push(timeLine(h, mi, d)); const toH = 60 - mi; if(d >= toH && mi) out.steps.push(`${h}時${mi}分 から ${h+1}時 までは ${toH}分`, `のこり ${d} − ${toH} = ${d-toH}分 → ${h+1}時${d-toH ? (d-toH)+'分' : ''}`); else out.steps.push(`${mi} ＋ ${d} = ${mi+d}分`); out.steps.push(`こたえ <b>${X(ans)}</b>`); }
      else out.steps.push(`${h}時${mi}分 から ${d}分 もどる`, `こたえ <b>${X(ans)}</b>`);
      out.tip = '「ちょうど ○時」で いったん 区切ると まちがえにくいよ'; return out; }
  }
  /* ---- 面積・体積 ---- */
  if(u==='area'){
    const w = t.match(/たて\s*(\d+)(\w*)、\s*よこ\s*(\d+)(c?m)/), s = t.match(/1辺\s*(\d+)(c?m)/), inv = t.match(/面積が\s*(\d+).*たてが\s*(\d+)/);
    if(w){ out.figs.push(rectFig(+w[3], +w[1], `よこ ${w[3]}${w[4]}`, `たて ${w[1]}${w[4]}`)); out.steps.push(`長方形の 面積 ＝ たて × よこ`, `${w[1]} × ${w[3]} = <b>${an}</b>`); return out; }
    if(s){ out.figs.push(rectFig(+s[1], +s[1], `${s[1]}${s[2]}`, `${s[1]}${s[2]}`)); out.steps.push('正方形の 面積 ＝ 1辺 × 1辺', `${s[1]} × ${s[1]} = <b>${an}</b>`); return out; }
    if(inv){ out.figs.push(rectFig(an||1, +inv[2], 'よこ ？', `たて ${inv[2]}`)); out.steps.push('たて × よこ ＝ 面積 だから、よこ ＝ 面積 ÷ たて', `${inv[1]} ÷ ${inv[2]} = <b>${an}</b>`); return out; }
  }
  if(u==='vol'){
    const w = t.match(/たて\s*(\d+)\S*、\s*よこ\s*(\d+)\S*、\s*高さ\s*(\d+)/), s = t.match(/1辺\s*(\d+)/);
    if(w){ out.figs.push(boxFig(w[1], w[2], w[3])); out.steps.push('直方体の 体積 ＝ たて × よこ × 高さ', `${w[1]} × ${w[2]} × ${w[3]} = <b>${an}</b>`); return out; }
    if(s){ out.figs.push(boxFig(s[1], s[1], s[1])); out.steps.push('立方体の 体積 ＝ 1辺 × 1辺 × 1辺', `${s[1]} × ${s[1]} × ${s[1]} = <b>${an}</b>`); return out; }
  }
  /* ---- 平均 ---- */
  if(u==='ave'){ const vals = bn.length >= 2 ? bn : allNums(t); const sum = vals.reduce((a,b)=>a+b,0);
    out.figs.push(aveBars(vals)); out.steps.push(`ぜんぶ たす：${vals.join(' ＋ ')} = ${sum}`, `こ数で わる：${sum} ÷ ${vals.length} = <b>${nf2(sum/vals.length)}</b>`); out.tip = '平均 ＝ ごうけい ÷ こ数（でこぼこを ならした 高さ）'; return out; }
  /* ---- 割合 ---- */
  if(u==='ratio'){
    const m1 = t.match(/(\d+)人?\s*の\s*うち\s*(\d+)/), m2 = t.match(/(\d+)円?\s*の\s*(\d+)%\s*は/), m3 = t.match(/(\d+)円の.*?(\d+)%引き/), m4 = t.match(/定員\s*(\d+).*?(\d+)人\s*乗/), m5 = t.match(/(\d+)%\s*を\s*小数/);
    if(m1||m4){ const base = m1 ? +m1[1] : +m4[1], part = m1 ? +m1[2] : +m4[2]; out.figs.push(tape([{w:part, t:`${part}`, col:'#FFB3C1'}, {w:Math.max(base-part, 0.001), t:''}], {top:`もとに する量 ${base} ＝ 100%`}));
      out.steps.push('割合 ＝ くらべる量 ÷ もとに する量', `${part} ÷ ${base} = ${nf2(part/base)}`, `百分率に すると × 100 → <b>${nf2(part/base*100)}%</b>`); }
    else if(m2){ out.steps.push('くらべる量 ＝ もとに する量 × 割合', `${m2[2]}% ＝ ${nf2(+m2[2]/100)}`, `${m2[1]} × ${nf2(+m2[2]/100)} = <b>${nf2(an)}</b>`); out.figs.push(tape([{w:+m2[2], t:`${m2[2]}%`, col:'#FFB3C1'}, {w:100-m2[2], t:''}], {top:`${m2[1]} ＝ 100%`})); }
    else if(m3){ out.steps.push(`${m3[2]}%引き → のこりは ${100 - m3[2]}%`, `${m3[1]} × ${nf2((100-m3[2])/100)} = <b>${nf2(an)}</b>`); out.figs.push(tape([{w:100-m3[2], t:`はらう ${100-m3[2]}%`, col:'#9ED3A0'}, {w:+m3[2], t:`${m3[2]}%`, col:'#FFE3E8'}], {top:`${m3[1]}円 ＝ 100%`})); }
    else if(m5){ out.steps.push('100% ＝ 1', `${m5[1]}% → ${m5[1]} ÷ 100 = <b>${nf2(an)}</b>`); }
    out.tip = '100% が「もとに する量」。くらべる量 ÷ もとに する量 で 割合'; return out;
  }
  /* ---- 約数・倍数 ---- */
  if(u==='divisor'){
    const ns = bn.length ? bn : allNums(t);
    if(/約数は\s*ぜんぶで/.test(t)){ const n = ns[0], ds = []; for(let i=1;i<=n;i++) if(n%i===0) ds.push(i);
      const pairs = ds.filter(d => d*d <= n).map(d => `${d} × ${n/d}`); out.steps.push(`かけて ${n} に なる ペアを さがす：${pairs.join('、')}`, `約数：${ds.join('・')} → <b>${ds.length}こ</b>`); out.tip = '1 と じぶん自身も 約数だよ'; return out; }
    if(/公倍数|同時/.test(t)){ const [a, b] = ns, la = [...Array(6)].map((_,i) => a*(i+1)), lb = [...Array(6)].map((_,i) => b*(i+1));
      out.steps.push(`${a}の 倍数：${la.join('、')}…`, `${b}の 倍数：${lb.join('、')}…`, `はじめて 同じに なるのは <b>${lcm(a,b)}</b>`); out.tip = '最小公倍数：両方の 倍数で いちばん 小さい 数'; return out; }
    if(/公約数|分け/.test(t)){ const [a, b] = ns, da = [], db = []; for(let i=1;i<=a;i++) if(a%i===0) da.push(i); for(let i=1;i<=b;i++) if(b%i===0) db.push(i);
      out.steps.push(`${a}の 約数：${da.join('・')}`, `${b}の 約数：${db.join('・')}`, `両方に ある いちばん 大きい 数は <b>${gcd(a,b)}</b>`); out.tip = '最大公約数：両方を わりきれる いちばん 大きい 数'; return out; }
  }
  /* ---- □を つかった 式 ---- */
  if(u==='box'){
    const m = t.match(/□\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)/);
    if(m){ const inv = {'+':'-','-':'+','×':'÷','÷':'×'}[m[1]]; out.steps.push(`□ ${m[1]} ${m[2]} = ${m[3]} の □を もとめるには「ぎゃくの 計算」`, `□ = ${m[3]} ${inv} ${m[2]} = <b>${ans}</b>`, `たしかめ：${ans} ${m[1]} ${m[2]} = ${m[3]} ✔`);
      out.figs.push(m[1]==='+' ? tape([{w:+ans, t:'□', col:'#FFE3E8'}, {w:+m[2], t:m[2], col:'#FFD9A8'}], {top:`ぜんぶ ${m[3]}`}) : m[1]==='-' ? tape([{w:+m[3], t:m[3]}, {w:+m[2], t:m[2], col:'#FFD9A8'}], {top:'□（はじめ）'}) : '');
      out.tip = 'たし算 ⇔ ひき算、かけ算 ⇔ わり算 は ぎゃくの 計算'; return out; }
  }
  /* ---- わり算（あまり） ---- */
  if(p.type==='rem' || u==='div' || u==='div2'){
    const m = t.match(/(\d+)\s*÷\s*(\d+)/), q = ans.split('|');
    if(m){ const a = +m[1], b = +m[2];
      if(a <= 60 && b <= 9){ out.figs.push(groupsSVG(a, b)); out.steps.push(`${a}こを ${b}こずつ まとめる → <b>${Math.floor(a/b)}</b>まとまり`, `あまりは <b>${a%b}</b>こ（あまりは わる数 ${b} より 小さい）`); }
      else { const L = longDivSteps(a, b); out.steps.push(...L.steps, `こたえ <b>${L.q}</b>${L.r ? ` あまり <b>${L.r}</b>` : ''}`); }
      out.steps.push(`たしかめ：${b} × ${Math.floor(a/b)}${a%b ? ` ＋ ${a%b}` : ''} = ${a} ✔`);
      if(q[1]!=null && userN && Number(String(v).split(/あまり|\|/)[1]) >= b) out.why = 'あまりが わる数より 大きく なっているよ';
      return out; }
  }
  /* ---- しき だけの 計算 ---- */
  if(expr){
    const tk = tokenize(expr), ops = tk.filter(x => /[+\-×÷]/.test(x));
    if(ops.length===1 && tk.length===3){
      const a = Number(tk[0]), b = Number(tk[2]), o = tk[1];
      if(o==='+' || o==='-'){ const c = colAddSub(a, b, o); out.figs.push(c.html);
        out.steps.push(o==='+' ? '位を そろえて、一の位から じゅんに たす' : '位を そろえて、一の位から じゅんに ひく', c.carries ? (o==='+' ? `くり上がりが <b>${c.carries}かい</b> あるよ（小さい 1）` : `くり下がりが <b>${c.carries}かい</b> あるよ（となりから 10 かりる）`) : 'くり上がり・くり下がりは ないよ');
        if(isFinite(userN) && c.carries){ const nc = o==='+' ? Number(String(a).split('').reverse().map((d,i) => (Number(d) + Number(String(b).split('').reverse()[i]||0)) % 10).reverse().join('')) : NaN; if(userN === nc) out.why = 'くり上がりを たすのを わすれたかも！'; }
        if(c.dec) out.tip = '小数の 筆算は 小数点の 位置を そろえるのが ポイント'; return out; }
      if(o==='×' && Number.isInteger(a) && Number.isInteger(b) && a >= 10){ const c = colMul(a, b); out.figs.push(c.html); out.steps.push(...c.steps); out.tip = 'かけ算の 筆算：かける数の 位ごとに かけて、さいごに たす'; return out; }
      if(o==='×' || o==='÷'){ const da = (String(a).split('.')[1]||'').length, db = (String(b).split('.')[1]||'').length;
        if(o==='×' && (da||db)){ out.steps.push(`小数点を 気に しないで 整数で 計算：${Math.round(a*10**da)} × ${Math.round(b*10**db)} = ${Math.round(a*10**da)*Math.round(b*10**db)}`, `小数点の 下の けた数は あわせて ${da+db}けた → <b>${nf2(an)}</b>`); out.tip = 'かけ算は「小数点の 下の けた数の 合計」だけ 小数点を うつ'; return out; }
        if(o==='÷' && db){ const k = 10**db; out.steps.push(`わる数を 整数に するため、両方を ${k}倍：${a} ÷ ${b} → ${nf2(a*k)} ÷ ${nf2(b*k)}`, `${nf2(a*k)} ÷ ${nf2(b*k)} = <b>${nf2(an)}</b>`); out.tip = 'わる数と わられる数に 同じ 数を かけても こたえは かわらない'; return out; }
        if(o==='×' && a <= 9 && b <= 9){ out.figs.push(groupsSVG(a*b, a)); out.steps.push(`${a} が ${b}こ分 → ${a}の だん：${[...Array(b)].map((_,i)=>a*(i+1)).join('、')}`, `こたえ <b>${a*b}</b>`); return out; }
        if(o==='÷'){ out.steps.push(`${b} × □ = ${a} の □を さがす（${b}の だん）`, `こたえ <b>${nf2(an)}</b>`); return out; }
      }
    }
    const E = evalSteps(expr); out.steps.push('<b>計算の じゅんばん</b>：①（ ）の 中 → ② × ÷ → ③ ＋ −', ...E.steps);
    out.tip = '左から じゅんに 計算しない！ かけ算・わり算が さき'; return out;
  }
  /* ---- 文章題 ---- */
  const facts = hasFrac ? [] : convFacts(t), ns = (bn.length ? bn : allNums(t)).concat(convNums(t));
  const f = findExpr(uniq(ns), ans);
  if(facts.length) out.steps.push('たんいの きまり：' + facts.join('、'));
  if(f){ out.steps.push(`しき：<b>${f.e} = ${nf2(an)}</b>`); const tp = tapeFor(f, t); if(tp) out.figs.push(tp);
    if(f.o==='+' || f.o==='-'){ const c = Number.isInteger(f.a) && Number.isInteger(f.b) && f.a >= 10 ? colAddSub(f.a, f.b, f.o) : null; if(c && f.a < 1e6) out.figs.push(c.html); }
    if(f.o==='×' && Number.isInteger(f.a) && f.a >= 10 && Number.isInteger(f.b) && f.b < 100){ out.figs.push(colMul(f.a, f.b).html); }
    const kw = /あわせて|ぜんぶで|合わせ|ふえ|もらう/.test(t) ? 'たし算' : /のこり|ちがい|使い|つかい|切りとる/.test(t) ? 'ひき算' : /ずつ.*何(ふくろ|本|人|たば)|分けると|1人/.test(t) ? 'わり算' : /1(こ|まい|本|日|列|はこ|ふくろ).*ずつ|1(こ|まい|本|日|列|はこ|ふくろ)/.test(t) ? 'かけ算' : '';
    if(kw) out.tip = `ことばに 注目：この 問題は「${kw}」の 合図が あるよ`;
  } else out.steps.push(`こたえは <b>${X(ans)}</b>`);
  if(u==='div' && /何きゃく|いる/.test(t)) out.tip = 'あまった 人も すわれるように、あまりが あれば +1 するよ';
  return out;
}
window.__mathExp56 = mathExp;

/* =====================================================================
   しゃかいの かいせつ
   ===================================================================== */
const PREF_BY = n => PREF.find(p => p[0]===n || p[0].replace(/[都道府県]$/,'')===String(n).replace(/[都道府県]$/,''));
const PREF_OF_CAP = n => PREF.find(p => p[1]===n);
const PREF_OF_THING = n => PREF.find(p => (p[5]||[]).includes(n));
const REG_NAMES = ['北海道','東北','関東','中部','近畿','中国','四国','九州'];
const regOf = n => { const s = String(n).replace(/地方$/,''); return REG_NAMES.includes(s) ? s : null; };
const CTRY = n => COUNTRIES.find(c => c[1]===n || c[0]===n);
const JPP = n => JP_PEOPLE.find(p => p[0]===n), WPP = n => W_PEOPLE.find(p => p[0]===n);
const EVT = n => J_EVENTS.find(e => e[0]===n || String(n).includes(e[0]));
const ERA_ALL = ['縄文','弥生','古墳','飛鳥','奈良','平安','鎌倉','室町','安土桃山','江戸','明治','大正','昭和','平成','令和'];
const ERA_Y = {縄文:'〜前4c',弥生:'前4c〜',古墳:'3c〜',飛鳥:'592〜',奈良:'710〜',平安:'794〜',鎌倉:'1185〜',室町:'1336〜',安土桃山:'1573〜',江戸:'1603〜',明治:'1868〜',大正:'1912〜',昭和:'1926〜',平成:'1989〜',令和:'2019〜'};
const ERA_S = {飛鳥:592,奈良:710,平安:794,鎌倉:1185,室町:1336,安土桃山:1573,江戸:1603,明治:1868,大正:1912,昭和:1926,平成:1989,令和:2019};
const eraOfYear = y => { let e = '弥生'; Object.entries(ERA_S).forEach(([k,s]) => { if(y >= s) e = k; }); return e; };
/* 日本地図：正しい ばしょ（赤）・きみの こたえ（青）・地方（オレンジ） */
function jpMap2(ok, ng, region){
  const dots = region ? PREF.filter(p => p[2]===region).map(p => { const [x,y] = prefXY(p); return `<circle cx="${x}" cy="${y}" r="6" fill="#FF9F43" stroke="#fff" stroke-width="1.5"/>`; }).join('') : '';
  const pin = (p, col) => { if(!p) return ''; const [x,y] = prefXY(p), dn = col!=='#E8414B'; return pinSVG(x, y, col) + `<text x="${x+11}" y="${dn ? y+22 : y-9}" font-size="15" font-weight="900" fill="${col}" stroke="#fff" stroke-width="3.5" paint-order="stroke">${X(p[0])}</text>`; };
  const pts = [ok, ng].filter(Boolean).map(prefXY).concat(region ? PREF.filter(p => p[2]===region).map(prefXY) : []);
  let vb = '0 0 400 440';
  if(pts.length){ const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); let x0 = Math.min(...xs)-60, x1 = Math.max(...xs)+70, y0 = Math.min(...ys)-60, y1 = Math.max(...ys)+60;
    let W = Math.max(x1-x0, 200), H = Math.max(y1-y0, 200); const S2 = Math.max(W, H); W = H = S2; const cx = (x0+x1)/2, cy = (y0+y1)/2;
    if(S2 < 400){ vb = `${clamp(cx-W/2, 0, 400-W).toFixed(0)} ${clamp(cy-H/2, 0, 440-H).toFixed(0)} ${W.toFixed(0)} ${H.toFixed(0)}`; } }
  return `<svg class="jpMap ex56Map" viewBox="${vb}">${jpBase()}${dots}${pin(ng,'#1C6AAE')}${pin(ok,'#E8414B')}</svg>`;
}
function worldMap2(ok, ng){
  const L = [ok, ng].filter(Boolean); let s = '';
  try{ s = worldSVG(L, {nopin:true}); }catch(e){ return ''; }
  if(ng && WORLD[ng]) s = s.replace(`<path d="${WORLD[ng][0]}" fill="#E8414B" stroke="#9C1F28"`, `<path d="${WORLD[ng][0]}" fill="#4C97FF" stroke="#1C5A99"`);
  try{ const bs = L.map(n => wbox(n)); const x0 = Math.min(...bs.map(b => b.x0)), x1 = Math.max(...bs.map(b => b.x1)), y0 = Math.min(...bs.map(b => b.y0)), y1 = Math.max(...bs.map(b => b.y1)), AR = 1.76;
    let W = Math.min(720, Math.max((x1-x0)*1.8, (y1-y0)*1.8*AR, 140)); const H = Math.min(300, W/AR); W = H*AR; const cx = (x0+x1)/2, cy = (y0+y1)/2;
    s = s.replace('viewBox="0 0 720 300"', `viewBox="${clamp(cx-W/2,0,720-W).toFixed(1)} ${clamp(cy-H/2,0,300-H).toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}"`); }catch(e){}
  return s;
}
function prefCard(p, ng){
  if(!p) return '';
  return `<div class="pc56 ${ng?'ng':''}"><b>${ng ? '🔵 きみの こたえ' : '🔴 正しい こたえ'}：${X(p[0])}</b><small>${X(p[2])}地方・県庁所在地 ${X(p[1])}${(p[5]||[]).length ? `・有名：${X(p[5].join('、'))}` : ''}</small></div>`;
}
function eraLine(hits){
  const eras = ERA_ALL.slice(1, 13);
  const W = 28, H = 110; let h = '';
  eras.forEach((e,i) => { const hit = hits.find(x => x.era===e);
    h += `<rect x="${i*W}" y="20" width="${W-2}" height="44" rx="4" fill="${hit ? hit.col : (i%2?'#F4EADB':'#FBF4E8')}" stroke="${hit ? '#7A3A10' : '#D9C4A3'}"/>`
      + `<text x="${i*W+W/2-1}" y="${e.length>2?36:44}" class="tx56 c v" font-size="${e.length>2?9.5:12}">${e.length>2 ? e.slice(0,2) : e}</text>${e.length>2 ? `<text x="${i*W+W/2-1}" y="50" class="tx56 c v" font-size="9.5">${e.slice(2)}</text>` : ''}`
      + (hit ? `<text x="${i*W+W/2-1}" y="76" class="tx56 c" font-size="9" fill="#9B8366">${ERA_Y[e]||''}</text>` : ''); });
  hits.forEach((x,k) => { const i = eras.indexOf(x.era); if(i < 0) return; h += `<path d="M${i*W+W/2-1} ${k%2 ? 90 : 16} l-6 ${k%2 ? 8 : -8} h12z" fill="${x.col}"/><text x="${Math.min(Math.max(i*W+W/2, 40), eras.length*W-40)}" y="${k%2 ? 108 : 0}" class="tx56 c" font-size="11" fill="${x.tcol||'#333'}">${X(x.t)}</text>`; });
  return `<svg class="fig56" viewBox="-4 -18 ${eras.length*W+8} ${H+30}" width="340">${h}</svg>`;
}
const SYM_NOTE = {'小・中学校':'「文」の 字の 形（文ぼうぐ・学ぶ）','高等学校':'「文」を ○で かこむ','ゆうびん局':'〒（ていしん しょうの マーク）を ○で かこむ','お寺':'卍（まんじ）は お寺の しるし','神社':'神社の 入り口の とりいの 形',
  '交番':'けいぼう 2本を ×に 組んだ 形','警察署':'交番の × を ○で かこむ','市役所':'二重丸 ◎','町や村の 役場':'丸 ○ ひとつ','温泉':'おゆから ゆげが 3本','工場':'きかいの はぐるま','図書館':'本を ひらいた 形','博物館':'たてものの 形（はしらと やね）'};

/* =====================================================================
   v5.9：しゃかいの かいせつ（問題ごとの せつめい・えらんだ ことばの いみ・図）
   ===================================================================== */
const SOCX = {}; "スーパーの 品物に ついている、ねだんが 書かれた ものは？|ねふだ|品物に ついている 小さな 紙や シールが「ねふだ」。ねだんや 名前が 書いてあるよ。\n安い 品物などを お客さんに 知らせる 紙は？|ちらし|新聞に はさんだり 配ったり して、安売りの 品物を 知らせる 紙が「ちらし」だよ。\nまちの 交番で はたらく 人は？|けいさつかん|交番には けいさつかんが いて、道あんないや まちの 見回りを しているよ。\n田や 畑が 多い ところは、まちの どこに 多い？|まわりの ほう（こうがい）|駅の まわりは 店や 家が 多く、田や 畑は まちの まわり（こうがい）に 多いよ。\nまちの あんぜんを まもる 仕事を する 人は？|けいさつかん|けいさつかんは じこや じけんを ふせぎ、まちの あんぜんを まもるよ。火事は しょうぼうしの 仕事。\n海で 魚を とる 仕事を する 人は？|漁師|船で 海に 出て 魚を とるのが 漁師（りょうし）の 仕事だよ。\nじけんや じこの ときに かける 電話番号は？|110|じけん・じこは けいさつの 110番。火事・きゅうきゅうは 119番だよ。\n品物が どこで とれたかを しめす ものは？|産地の ひょうじ|「〇〇県産」のように、どこで とれたかを 書いたものが 産地の ひょうじだよ。\n野さいや 米を そだてる 仕事を する 人は？|農家|田や 畑で 米や 野さいを そだてるのが 農家の 仕事だよ。\n工場で 品物を つくる 仕事を する 人は？|工場で はたらく人|工場では きかいを 使って たくさんの 品物を つくっているよ。\nお店で 買い物を するとき、ふくろを もっていくと へらせる ものは？|ごみ|マイバッグを もっていくと レジぶくろが いらなくなり、ごみが へるよ。\n野さいや お米を そだてる 仕事を する 人は？|農家|田や 畑で 米や 野さいを そだてるのが 農家の 仕事だよ。\n工場で 品物を つくることを 何という？|生産|ものを つくることを「生産」。運ぶことを「ゆそう」、売ることを「はんばい」と いうよ。\nけいさつしょと しょうぼうしょ、119番の 電話を うけるのは？|しょうぼう（通信指令センター）|119番の 電話は しょうぼうの 通信指令センターに つながり、しょうぼう車や きゅうきゅう車に 出動を 知らせるよ。110番は けいさつ。\n火事を ふせぐために まちに ある、水を とりだす せつびは？|消火せん|道に ある 消火せんから 水を とって、しょうぼう車が 火を けすよ。\n火事を けしたり、きゅうきゅうで 人を たすける 仕事を する 人は？|しょうぼうし|しょうぼうしは 火事を けすだけでなく、きゅうきゅう車で けが人を はこぶ 仕事も するよ。\n火事の とき 火を けすために 出動する 車は？|しょうぼう車|火事の ときは 赤い しょうぼう車が 出動するよ。パトカーは けいさつの 車。\n火事や きゅうきゅうの ときに かける 電話番号は？|119|火事・きゅうきゅうは 119番。じけん・じこは 110番だよ。\n魚を とる 仕事を する 人は？|漁師|船で 海に 出て 魚を とるのが 漁師（りょうし）の 仕事だよ。\n「都」が つくのは どこ？|東京都|1都1道2府43県。「都」は 東京都、「道」は 北海道、「府」は 京都府と 大阪府だよ。\n日本で いちばん 大きな 湖は？|琵琶湖|滋賀県の 琵琶湖が 日本一 大きな 湖。県の 面積の 約6分の1も あるよ。\n日本の まわりの 海で、北海道の 北に ある 海は？|オホーツク海|北海道の 北が オホーツク海、西が 日本海、東が 太平洋、九州の 西が 東シナ海だよ。\n「府」が つく 都道府県は 京都府と どこ？|大阪府|「府」が つくのは 京都府と 大阪府の 2つだけだよ。\n日本の 首都は？|東京|国会や 内閣など 国の 中心が ある 東京が 首都だよ。\n日本の 東がわに 広がる 大きな 海は？|太平洋|日本の 東（太平洋がわ）には 世界一 広い 太平洋が あるよ。\n都道府県は ぜんぶで いくつ？|47|1都（東京）・1道（北海道）・2府（京都・大阪）・43県で 合わせて 47だよ。\nお米づくりが さかんで「米どころ」と よばれる 県は？|新潟県|新潟県は 越後平野で コシヒカリを たくさん つくる、日本一の 米どころだよ。\n日本で いちばん 長い 川は？|信濃川|長野県から 新潟県へ 流れる 信濃川（約367km）が 日本一 長い 川。流域面積は 利根川が 日本一。\n日本で いちばん 面積が 小さい 都道府県は？|香川県|四国の 香川県が いちばん 小さい。大阪府が 2番目だよ。\n日本で いちばん 高い 山は？|富士山|静岡県と 山梨県に またがる 富士山（3776m）が 日本一 高い 山だよ。\n日本で いちばん 面積が 大きい 都道府県は？|北海道|北海道は 日本の 面積の 約5分の1。2番目は 岩手県だよ。\nりんごの 生産量 日本一の 県は？|青森県|すずしい 気候の 青森県が りんごの 日本一。2位は 長野県だよ。\n日本で いちばん 人口が 少ない 都道府県は？|鳥取県|鳥取県が いちばん 人口が 少ない（約54万人）。2番目は 島根県だよ。\n火山の 熱を 利用する 発電は？|地熱発電|地下の マグマの 熱で できた 蒸気で タービンを 回すのが 地熱発電。火山の 多い 九州や 東北に 多いよ。\nたまごから 育てた 稚魚を 川や 海に 放す 漁業は？|栽培漁業|稚魚を 育てて 海に 放し、大きく なってから とるのが 栽培漁業。最後まで いけすで 育てるのは 養殖業だよ。\n入り組んだ 海岸線で 三陸海岸などに 見られる 地形は？|リアス海岸|山が しずんで できた ギザギザの 海岸が リアス海岸。波が おだやかで 養殖に むいているよ。\n自動車の 生産が さかんな 工業地帯は？|中京工業地帯|愛知県を 中心と する 中京工業地帯は 自動車づくりが さかん（豊田市など）だよ。\n夏から 秋に 沖縄や 九州に 多く くる ものは？|台風|南の 海で 生まれた 台風は 夏から 秋に 沖縄や 九州に 多く 近づくよ。\n北海道の オホーツク海に 冬に やってくる ものは？|流氷|冬に 北の 海から 氷が 流れてきて、オホーツク海の 沿岸に とどくのが 流氷だよ。\n東北地方を 南北に はしる 山脈は？|奥羽山脈|東北地方の まん中を 南北に のびる 日本一 長い 山脈が 奥羽山脈だよ。\n米の 生産量が 多い 地方は？|東北地方|東北地方は 広い 平野と 夏の 日照で 米づくりが さかん。日本の 米の 約4分の1を つくるよ。\n川が 山から 平地に 出る ところに できる 地形は？|扇状地|山から 出た 川が 石や 砂を 扇の 形に つもらせたのが 扇状地。水はけが よく 果物畑に むくよ。\n日本が 多く 輸入している 燃料は？|原油|日本は 原油の ほとんどを 輸入している（サウジアラビアなど 中東から）。\n「日本の 屋根」と よばれる 山脈の あつまりは？|日本アルプス|中部地方の 飛騨・木曽・赤石山脈を まとめて 日本アルプス（日本の 屋根）と いうよ。\nダムの 水の 力で 電気を つくる 発電は？|水力発電|ダムに ためた 水を 落として 水車を 回すのが 水力発電だよ。\n日本海側の 冬に 多い 天気は？|雪が 多い|冬の 北西の 季節風が 日本海で 水じょう気を ふくみ、山に ぶつかって 日本海側に 雪を ふらせるよ。\n日本の 最も 北に ある 島は？|択捉島|北の はしは 択捉島、南は 沖ノ鳥島、東は 南鳥島、西は 与那国島だよ。\n日本で いちばん 広い 平野は？|関東平野|東京などが ある 関東平野が 日本一 広い 平野だよ。\n川の 河口に できる 三角形の 地形は？|三角州|川が 海に 出る ところで 砂や どろが つもって できた 三角形の 土地が 三角州（広島市など）だよ。\n日本の 最も 東に ある 島は？|南鳥島|東の はしは 南鳥島、西は 与那国島、南は 沖ノ鳥島、北は 択捉島だよ。\nまわりを 山に かこまれた 平らな 土地は？|盆地|山に かこまれた 平らな 土地が 盆地（甲府盆地など）。夏は 暑く 冬は 寒いよ。\n茶の 生産量が 多い 県は？|静岡県|水はけの よい 牧之原台地などで 茶づくりが さかんな 静岡県が 日本一だよ。\n日本で いちばん 人口が 多い 都道府県は？|東京都|東京都が 約1400万人で 日本一。2位は 神奈川県だよ。\n海に かこまれた 日本の まわりの 浅い 海底を 何という？|大陸だな|陸の まわりの 深さ 約200mまでの 浅い 海底が 大陸だな。魚が 多く 集まるよ。深い みぞは 海溝。\n日本の 最も 西に ある 島は？|与那国島|西の はしは 沖縄県の 与那国島。台湾が 見えることも あるよ。\n日本の 国土の 約何割が 森林？|約7割|日本は 山が 多く、国土の 約3分の2（約7割）が 森林だよ。\n日本三景に ふくまれる ものは？|天橋立|日本三景は 天橋立（京都）・松島（宮城）・宮島（広島）の 3つだよ。\n日本の 輸出品で 多い ものは？|自動車|日本は 自動車や 機械を 多く 輸出し、原油や 鉄鉱石などの 資源を 輸入しているよ。\n日本の 最も 南に ある 島は？|沖ノ鳥島|南の はしは 東京都の 沖ノ鳥島。しずまないように 護岸工事を しているよ。\n北海道で 牛を 育て 牛乳を つくる 農業は？|酪農|牛を 育てて 牛乳や チーズを つくるのが 酪農。北海道の 根釧台地などで さかんだよ。\n世界遺産 屋久島が ある 県は？|鹿児島県|屋久島は 鹿児島県の 島。樹齢数千年の 縄文杉が あるよ。\n太平洋ベルトに ふくまれない 地域は？|北海道の 内陸|太平洋ベルトは 関東から 九州北部まで 帯のように 工業地帯・地域が ならぶ ところ。北海道は ふくまれないよ。\n冬でも あたたかく ビニールハウスで 野菜を つくる 方法は？|促成栽培|あたたかい 気候と ビニールハウスで 早く 育てて 出荷するのが 促成栽培（高知・宮崎）。おそく するのは 抑制栽培。\n世界遺産 白神山地が ある 地方は？|東北地方|白神山地は 青森県と 秋田県に またがる ブナの 森。東北地方だよ。\n日本の 発電で いちばん 多い 方法は？|火力発電|石油・石炭・天然ガスを 燃やす 火力発電が 日本の 発電の 大部分を しめるよ。\n魚や 貝を 育てて とる 漁業は？|養殖業|いけすなどで 出荷まで 育てるのが 養殖業（かき・ほたて・はまち）。途中で 放すのは 栽培漁業。\n原爆ドームが ある 県は？|広島県|1945年8月6日に 原子爆弾が 落とされた 広島市に 原爆ドームが あるよ。\n日本で いちばん 深い 湖は？|田沢湖|秋田県の 田沢湖が 日本一 深い（423m）。いちばん 大きいのは 琵琶湖。\n太平洋側の 冬の 天気の とくちょうは？|かんそうして 晴れが 多い|季節風が 山を こえて かわいた 風に なるので、太平洋側の 冬は 晴れて かんそうするよ。\nみかんの 生産量が 多い 県は？|和歌山県|あたたかい 和歌山県が みかんの 日本一。愛媛県・静岡県も 多いよ。\n日本の 標準時子午線が 通る 市は？|明石市|東経135度の 線が 兵庫県 明石市を 通り、ここが 日本の 時刻の きじゅんだよ。\n日本最大の 工業地帯（出荷額）は？|中京工業地帯|自動車工業が さかんな 中京工業地帯が 出荷額 日本一だよ。\n日本の 人口は おおよそ 何人？|約1億2千万人|日本の 人口は 約1億2千万人。少しずつ へっているよ。\n日本で いちばん 流域面積が 広い 川は？|利根川|流域面積は 関東を 流れる 利根川が 日本一。長さは 信濃川が 日本一。\n夏でも すずしい 高原で レタスなどを つくる 方法は？|抑制栽培|すずしい 高原で ほかの 産地より おそく 出荷するのが 抑制栽培（長野の レタス）。早めるのが 促成栽培。\n地球の 気温が 上がる 問題は？|地球温暖化|二酸化炭素などが ふえて 地球の 気温が 上がるのが 地球温暖化。海面が 上がるなどの えいきょうが あるよ。\n温室効果ガスの 代表は？|二酸化炭素|石油や 石炭を 燃やすと 出る 二酸化炭素が 温室効果ガスの 代表だよ。\n選挙で 投票できる 年れいは？|18さい以上|2016年から 18さい以上が 投票できるように なったよ。\n災害の ときに 危険な 場所を しめした 地図は？|ハザードマップ|洪水や 土砂災害の きけんな 場所や ひなん場所を しめした 地図が ハザードマップだよ。\n国際連合の 本部が ある 都市は？|ニューヨーク|国際連合（国連）の 本部は アメリカの ニューヨークに あるよ。\n日本国憲法が 公布された 日（11月3日）は 今の 何の 日？|文化の日|1946年11月3日に 公布 → 今の 文化の日。施行（1947年5月3日）が 憲法記念日だよ。\n憲法で 子どもに 教育を 受けさせる ことは 国民の？|義務|国民の 三大義務は「教育を 受けさせる」「勤労」「納税」だよ。\nごみを へらす 3Rに ふくまれる ものは？|リデュース|3R＝リデュース（へらす）・リユース（くりかえし 使う）・リサイクル（しげんに もどす）。\n地震の あとに 海から おしよせる 大波は？|津波|海底で 地震が おこると 海水が もちあがり、大きな 津波が おしよせるよ。高い ところへ にげよう。\n争いごとや 犯罪を 法律に もとづいて 判断する ところは？|裁判所|裁判所は 司法（法律に もとづいて 判断）。国会は 立法、内閣は 行政だよ。\n国会・内閣・裁判所に 国の 力を 分ける しくみは？|三権分立|立法（国会）・行政（内閣）・司法（裁判所）に 力を 分けて、おたがいを チェックするのが 三権分立。\n国の 政治の 主人公は 国民で あるという 考えは？|国民主権|国の 政治を 決める 力は 国民に あるという 考えが 国民主権。憲法の 三大原則の 1つだよ。\n天皇は 日本国の 何と 定められている？|象徴|日本国憲法で 天皇は「日本国と 日本国民統合の 象徴」と されているよ。\n世界の 平和を 守るために つくられた 国際機関は？|国際連合|第二次世界大戦の あと 1945年に できたのが 国際連合。国際連盟は その 前の 組織だよ。\n災害の ときに 地域で 助け合うことを 何という？|共助|自分で 守る＝自助、地域で 助け合う＝共助、国や 市が 助ける＝公助。\n日本国憲法が 施行された 日（5月3日）は 何の 日？|憲法記念日|1947年5月3日に 施行 → 憲法記念日。公布（11月3日）は 文化の日。\n国民の 三大義務に ふくまれない ものは？|選挙に 行く 義務|三大義務は 教育を 受けさせる・勤労・納税。選挙は「権利」だよ。\n国会に ある 2つの 議院は 衆議院と？|参議院|国会は 衆議院と 参議院の 二院制。貴族院は 明治の 帝国議会に あったよ。\n国の 法律を つくる ところは？|国会|法律を つくる（立法）のは 国会。内閣は 政治を 行い、裁判所は 裁判を するよ。\n税金の うち 買い物の ときに はらう 税は？|消費税|買い物の ときに ねだんに ふくまれて はらうのが 消費税（今は 10%、食品は 8%）。\n食料の うち 国内で つくられる 割合を 何という？|食料自給率|食べる 量の うち、国内で つくった 割合が 食料自給率。日本は 約4割と ひくいよ。\n国の 政治を 実際に 行う ところは？|内閣|法律や 予算に もとづいて 実際に 政治を 行う（行政）のが 内閣だよ。\nユニセフ（UNICEF）は 何を する 機関？|子どもを 守る|ユニセフ（国連児童基金）は 世界の 子どもの 命や 健康を 守る 活動を しているよ。\n子どもの 権利を 守る 国際的な 約束は？|子どもの権利条約|子どもの 生きる・育つ・守られる・参加する 権利を さだめた 約束が 子どもの権利条約だよ。\n日本国憲法の 三つの 原則に ふくまれる ものは？|平和主義|三原則は 国民主権・基本的人権の尊重・平和主義だよ。\n日本の 食料自給率（カロリー）は およそ？|約4割|日本の 食料自給率（カロリーで 計算）は 約4割（38%前後）。多くを 輸入しているよ。\n内閣の 長は？|内閣総理大臣|内閣の 長が 内閣総理大臣（首相）。国会議員の 中から 国会が 指名するよ。\n市や 町が 住民の ために 行う 政治は？|地方自治|住民が 自分たちの 地域の ことを 決めて 行う 政治が 地方自治だよ。\n訪問販売などで 一定期間 契約を 解除できる 制度は？|クーリング・オフ|訪問販売などで 契約しても、8日以内なら 取り消せる しくみが クーリング・オフだよ。\n法律が 憲法に 違反して いないかを 判断する 権限は？|違憲審査権|裁判所が 法律などが 憲法に 合っているかを 判断する 力が 違憲審査権。最高裁判所は「憲法の 番人」。\n地方公共団体が 定める きまりは？|条例|都道府県や 市町村が つくる きまりが 条例。国の きまりは 法律だよ。\n安全保障理事会の 常任理事国に ふくまれない 国は？|日本|常任理事国は アメリカ・イギリス・フランス・ロシア・中国の 5か国だよ。\n物価が 上がり続ける 現象は？|インフレーション|物価が 上がり続け、お金の 価値が 下がるのが インフレ。反対は デフレだよ。\n社会保障の 4つの 柱に ふくまれない ものは？|防衛|社会保障の 4つの 柱は 社会保険・公的扶助・社会福祉・公衆衛生だよ。\n裁判を 3回まで 受けられる しくみは？|三審制|判決に 不満なら 上の 裁判所に うったえて、3回まで 裁判を 受けられるのが 三審制だよ。\n需要が 供給より 多いと 価格は ふつう どうなる？|上がる|買いたい 量（需要）が 売りたい 量（供給）より 多いと、価格は 上がるよ。\n政府の 開発援助の 略称は？|ODA|ODA＝政府開発援助。お金や 技術で 発展途上国を 助けるよ。\n所得が 多いほど 税率が 高くなる しくみは？|累進課税|所得が 多い 人ほど 高い 税率に なる しくみが 累進課税（所得税など）だよ。\n衆議院議員の 任期は？|4年|衆議院は 任期 4年で 解散が ある。参議院は 6年で 3年ごとに 半分ずつ 選挙だよ。\n東南アジアの 国々の 協力組織は？|ASEAN|ASEAN＝東南アジア諸国連合。EUは ヨーロッパの 組織だよ。\n参議院議員の 任期は？|6年|参議院は 任期 6年で 解散が ない。3年ごとに 半分ずつ 選挙するよ。\n働く 人の 権利を 守る 法律で 労働時間などを 定めたものは？|労働基準法|1日8時間などの 労働時間や 休日を 定めた 法律が 労働基準法だよ。\n物価が 下がり続ける 現象は？|デフレーション|物価が 下がり続けるのが デフレ。上がり続けるのが インフレだよ。\n自分の 情報を 守る 権利は？|プライバシーの権利|自分の 生活や 個人情報を かってに 公開されない 権利が プライバシーの権利（新しい人権）。\n新しい 人権に ふくまれる ものは？|環境権|憲法に 書かれていないが 新しく みとめられた 人権が 環境権・知る権利・プライバシーの権利だよ。\n日本の 中央銀行は？|日本銀行|お札を 発行し「銀行の 銀行」「政府の 銀行」と よばれるのが 日本銀行だよ。\nすべての 国民に 健康で 文化的な 最低限度の 生活を 保障する 権利は？|生存権|憲法25条の「健康で 文化的な 最低限度の 生活」を 送る 権利が 生存権だよ。\n国連の 安全保障理事会で 常任理事国が もつ 権限は？|拒否権|常任理事国が 1か国でも 反対すると 決められない 力が 拒否権だよ。\n国の 収入と 支出の 計画は？|予算|1年間の 国の 収入（歳入）と 支出（歳出）の 計画が 予算。結果を まとめたものが 決算。\n憲法 第9条に 定められている ことは？|戦争の 放棄|憲法9条は 戦争の 放棄・戦力を もたない・交戦権を みとめない ことを 定めているよ。\n企業どうしの 不公正な 競争を ふせぐ 法律は？|独占禁止法|大きな 企業が 市場を ひとりじめして 価格を 決めないように する 法律が 独占禁止法。公正取引委員会が 運用するよ。\n商品の 欠陥で けがを したとき 製造者に 責任を 問える 法律は？|製造物責任法|商品の 欠陥で 被害を うけたら、つくった 会社に 責任を 問える 法律が 製造物責任法（PL法）。\n国会で 予算を 先に 審議する 議院は？|衆議院|予算は 衆議院が 先に 審議する（衆議院の 優越）。\n円の 価値が 上がる ことを 何という？|円高|1ドル＝150円 → 100円の ように 円の 価値が 上がるのが 円高。輸入品が 安く なるよ。\n住民が 首長の 解職を 求める ことを 何という？|リコール|住民が 署名を 集めて 知事や 市長の 解職を 求めるのが リコール（直接請求権）。\nヨーロッパの 国々が つくる 共同体は？|EU|EU（ヨーロッパ連合）は 多くの 国が 共通通貨 ユーロを 使っているよ。\n持続可能な 開発目標の 略称は？|SDGs|2030年までに 世界が 達成を めざす 17の 目標が SDGs（持続可能な開発目標）。\n憲法改正に 必要な 国民の 手続きは？|国民投票|国会が 発議した 憲法改正案は、国民投票で 過半数の 賛成が 必要だよ。\n国民が 裁判に 参加する 日本の 制度は？|裁判員制度|くじで えらばれた 国民が 裁判官と いっしょに 重い 刑事裁判を 行うのが 裁判員制度。\n日本国憲法の 基本原理に ふくまれない ものは？|天皇主権|日本国憲法は 国民主権。天皇主権は 明治時代の 大日本帝国憲法の 考えだよ。\n最高裁判所の 裁判官を 国民が 審査する しくみは？|国民審査|衆議院選挙の ときに 最高裁判所の 裁判官が ふさわしいか 投票するのが 国民審査だよ。\n内閣が 国会に 対して 責任を もつ しくみは？|議院内閣制|内閣は 国会の 信任の うえに 成り立ち、国会に 責任を もつ。これが 議院内閣制。アメリカは 大統領制。\n世界で いちばん 面積が 大きい 国は？|ロシア|ロシアが 世界一 広い（日本の 約45倍）。2位は カナダだよ。\n中国で 外国企業を まねくために つくった 地区は？|経済特区|中国は シェンチェンなどを 経済特区に して、外国の 会社や 技術を まねいたよ。\n世界で いちばん 人口が 多い 国（2023年〜）は？|インド|2023年に インドが 中国を ぬいて 人口 世界一に なったよ（約14億人）。\nアフリカで 多く 産出する レアメタルなどの 鉱産資源を 何という？|レアメタル|コバルトや プラチナなど、量が 少なく めずらしい 金属を レアメタルと いう。スマホなどに 使うよ。\nアフリカなどで とれる、コバルトや プラチナのように 量が 少なく めずらしい 金属を 何という？|レアメタル|コバルトや プラチナなど、量が 少なく めずらしい 金属を レアメタルと いう。スマホなどに 使うよ。\n世界で いちばん 長い 川は？|ナイル川|アフリカの ナイル川が 世界一 長い（約6700km）。流域面積は アマゾン川が 世界一。\n南アメリカで 多く 話される 言語は？|スペイン語|南アメリカの 多くの 国は スペイン語。ブラジルだけは ポルトガル語だよ。\n経度 15度で 何時間の 時差？|1時間|地球は 24時間で 360度 回るので、360÷24＝15度で 1時間の 時差だよ。\n北極に 近い 地域で 見られる 白夜とは？|夏に 夜も 暗くならない|北極や 南極に 近い 地域では、夏に 太陽が しずまず 夜も 明るい「白夜」に なるよ。\nインドで 多くの 人が 信仰する 宗教は？|ヒンドゥー教|インドの 約8割の 人が ヒンドゥー教。牛を 神聖な 動物と して 大切に するよ。\n世界で いちばん 小さな 大陸は？|オーストラリア大陸|6大陸で いちばん 小さいのが オーストラリア大陸。いちばん 大きいのは ユーラシア大陸。\nブラジルで 主に 話される 言語は？|ポルトガル語|ブラジルは むかし ポルトガルの 植民地だったので ポルトガル語を 話すよ。\n本初子午線が 通る 都市は？|ロンドン|経度0度の 本初子午線は イギリスの ロンドン（グリニッジ天文台）を 通るよ。\n世界で いちばん 面積が 小さい 国は？|バチカン市国|イタリアの ローマの 中に ある バチカン市国が 世界一 小さい国。2番目は モナコ。\n世界で いちばん 流域面積が 広い 川は？|アマゾン川|南アメリカの アマゾン川が 流域面積 世界一。長さは ナイル川が 世界一。\n日本と 時差が 約14時間ある 都市は？|ニューヨーク|ニューヨークは 日本より 約14時間 おそい（夏時間は 13時間）。ロンドンは 9時間、北京は 1時間。\nイスラム教の 聖地が ある 国は？|サウジアラビア|イスラム教の 聖地 メッカは サウジアラビアに あるよ。\nヨーロッパで 多く 使われる 共通通貨は？|ユーロ|EUの 多くの 国が 共通通貨 ユーロを 使っているよ。イギリスは ポンド。\n世界で いちばん 大きな 大陸は？|ユーラシア大陸|アジアと ヨーロッパが ある ユーラシア大陸が 世界一 大きいよ。\nオーストラリアで 多く 産出し 日本が 輸入する 資源は？|鉄鉱石|日本は 鉄鉱石の 多くを オーストラリアから 輸入しているよ。石炭も 多いよ。\n世界で いちばん 大きな 砂漠は（極地を のぞく）？|サハラ砂漠|アフリカ北部の サハラ砂漠が 世界一 大きい 砂漠だよ。\n赤道が 通らない 国は？|日本|赤道は ケニア・インドネシア・ブラジルなどを 通る。日本は 北半球に あり 通らないよ。\nアメリカで 大規模に 行われる 農業の 特色は？|適地適作|アメリカは 気候や 土に あった 作物を 広い 土地で つくる「適地適作」が 特色だよ。\n世界で いちばん 広い 海洋は？|太平洋|3大洋で いちばん 広いのが 太平洋。次が 大西洋、インド洋だよ。\n世界で いちばん 高い 山は？|エベレスト|ヒマラヤ山脈の エベレスト（8848m）が 世界一 高い 山だよ。".split('\n').forEach(l => { const a = l.split('|'); if(a.length >= 3) SOCX[a[0] + '|' + a[1]] = a.slice(2).join('|'); });
const JOBS = {'けいさつかん':['まちの あんぜんを まもる','交番や パトカーで 見回り。じけん・じこは 110番'],'しょうぼうし':['火事を けし、けが人を たすける','しょうぼう車・きゅうきゅう車で 出動。119番'],
 '農家':['田や 畑で 米や 野さいを そだてる','まちの まわり（こうがい）に 田畑が 多い'],'漁師':['海で 魚を とる','船で 海に 出る'],'工場で はたらく人':['工場で 品物を つくる（生産）','きかいを 使って たくさん つくる'],
 'かんごし':['病院で かんじゃの せわを する',''],'うんてんし':['バスや 電車を うんてんする',''],'大工':['家を たてる',''],'店員':['店で 品物を 売る',''],'パン屋':['パンを つくって 売る','']};
const TOOLS = {'せんたくいた':['でこぼこの 板で こすって せんたく','せんたくき'],'かまど':['まきを もやして ごはんを たく','すいはんき・ガスコンロ'],'ひばち':['炭を 入れて へやを あたためる','ストーブ・エアコン'],
 '炭の アイロン':['中に 炭を 入れて ふくの しわを のばす','電気アイロン'],'黒電話':['ダイヤルを 回して 電話を かける','スマートフォン'],'ちゃぶだい':['家族で すわって ごはんを 食べる','ダイニングテーブル'],
 'そろばん':['玉を うごかして 計算を する','電たく'],'氷の れいぞうこ':['上の だんに 氷を 入れて 食べものを ひやす','電気れいぞうこ']};
const GLS = {'110':'じけん・じこの ときの けいさつの 番号','119':'火事・きゅうきゅうの ときの 番号','117':'時刻を 知らせる 番号','177':'天気予報の 番号','104':'電話番号を 調べる 番号',
 'パトカー':'けいさつの 車','ゴミ収集車':'ごみを 集める 車','レシート':'買ったあとに もらう 紙','かんばん':'店の 名前を 書いた 板','ポスター':'かべに はる おしらせ','バーコード':'レジで 読み取る しましまの しるし',
 'しょうひ':'ものを 使うこと','ゆそう':'ものを 運ぶこと','はんばい':'ものを 売ること','信号':'車や 人の 進む・止まるを 知らせる','マンホール':'地下の 下水道への 入り口','ガードレール':'車が 道から 出ないための さく',
 '京都府':'「府」が つく','北海道':'「道」が つく','大阪府':'「府」が つく','東京都':'「都」が つく','京都':'むかしの 都（平安京）','十和田湖':'青森・秋田の 湖','霞ヶ浦':'2番目に 大きい 湖（茨城）','猪苗代湖':'福島県の 湖',
 '日本海':'日本の 西がわの 海','東シナ海':'九州の 西の 海','石狩川':'北海道の 川','利根川':'流域面積が 日本一の 川','木曽川':'中部地方の 川','浅間山':'長野・群馬の 火山','北岳':'2番目に 高い 山（3193m）','阿蘇山':'熊本県の 大きな 火山',
 '長野県':'面積 4位','岩手県':'面積 2位','新潟県':'面積 5位','山形県':'さくらんぼが 日本一','火力発電':'石油・石炭・天然ガスを 燃やす','原子力発電':'ウランの 核分裂の 熱を 使う','風力発電':'風で 風車を 回す','地熱発電':'火山の 熱を 使う','水力発電':'ダムの 水の 力を 使う',
 '遠洋漁業':'遠い 海で 長い 期間 漁を する','沖合漁業':'日本の 近くの 海で 数日 漁を する','沿岸漁業':'海岸の 近くで 日帰りの 漁','養殖業':'いけすで 出荷まで 育てる','栽培漁業':'稚魚を 放して 育ってから とる',
 '砂浜海岸':'なだらかな 砂の 海岸','三角州':'河口に できる 三角形の 土地','扇状地':'山の 出口に できる 扇形の 土地','カルデラ':'火山の 大きな くぼみ','盆地':'山に かこまれた 平地','台地':'まわりより 高く 平らな 土地','半島':'海に つき出た 陸','平野':'広く 平らな 低い 土地','海溝':'海底の 深い みぞ',
 '北九州工業地帯':'福岡県。鉄鋼が 中心だった','京浜工業地帯':'東京・神奈川','阪神工業地帯':'大阪・兵庫','京葉工業地域':'千葉県。石油化学','北陸工業地域':'新潟・富山など',
 'やませ':'東北の 夏に ふく 冷たい 風','流氷':'冬に オホーツク海に 来る 氷','黄砂':'春に 中国から 飛んでくる 砂','梅雨前線':'6〜7月の 長雨の 前線','台風':'夏〜秋に 南から 来る',
 '日高山脈':'北海道の 山脈','飛騨山脈':'北アルプス（中部）','鈴鹿山脈':'三重・滋賀の 山脈','四国山地':'四国の 山地','中国山地':'中国地方の 山地','越後平野':'新潟県の 米どころ','濃尾平野':'愛知・岐阜','石狩平野':'北海道',
 '沖ノ鳥島':'日本の 南の はし','南鳥島':'日本の 東の はし','与那国島':'日本の 西の はし','択捉島':'日本の 北の はし','摩周湖':'とうめい度が 高い 北海道の 湖',
 '輪作':'年ごとに ちがう 作物を つくる','二毛作':'同じ 畑で 1年に 2種類','二期作':'同じ 田で 1年に 2回 米','促成栽培':'早く 育てて 出荷','抑制栽培':'おそく 育てて 出荷','養蚕':'かいこを 育てて まゆを とる','稲作':'米づくり','果樹栽培':'果物づくり',
 '天橋立':'京都府（日本三景）','松島':'宮城県（日本三景）','宮島':'広島県（日本三景）',
 '鉄鉱石':'鉄の 原料（輸入）','石炭':'燃料（輸入）','原油':'石油の もと（輸入）','木材だけ':'木材も 輸入するが 燃料ではない',
 '二酸化炭素':'温室効果ガスの 代表','ちっ素':'空気の 約78%','流氷の 増加':'温暖化では 流氷は へる','オゾン層の 増加':'オゾン層は へるのが 問題','酸性雨だけ':'酸性雨は べつの 環境問題',
 '観光マップ':'観光地を しめす 地図','天気図':'気圧や 前線を しめす 地図','路線図':'電車や バスの 地図','ジュネーブ':'国連の 機関が 多い スイスの 都市',
 '勤労感謝の日':'11月23日','憲法記念日':'5月3日（施行）','文化の日':'11月3日（公布）','建国記念の日':'2月11日','みどりの日':'5月4日','こどもの日':'5月5日',
 '権利だけ':'教育を 受けさせるのは 義務','自由':'義務ではない','リターン':'3Rではない','リセット':'3Rではない','リメイク':'3Rではない','高潮':'台風などで 海面が 上がる','竜巻':'うずまく 強い 風',
 '税務署':'税金の 仕事を する 役所','国会':'法律を つくる（立法）','内閣':'政治を 行う（行政）','裁判所':'裁判を する（司法）','市役所':'市の 仕事を する','警察':'まちの あんぜんを まもる',
 '議院内閣制':'内閣が 国会に 責任を もつ','国民主権':'政治を 決めるのは 国民','地方自治':'地域の ことは 住民が 決める','平和主義':'戦争を しない','三権分立':'力を 3つに 分ける','象徴':'天皇の 地位',
 '首相':'内閣総理大臣','元首':'国の 代表','国王':'王さま','NATO':'北大西洋条約機構（軍事同盟）','国際連盟':'第一次世界大戦後の 組織（今は ない）','EU':'ヨーロッパ連合','自助':'自分で 守る','公助':'国や 市が 助ける','共助':'地域で 助け合う',
 '納税の 義務':'三大義務の 1つ','勤労の 義務':'三大義務の 1つ','教育を 受けさせる 義務':'三大義務の 1つ','選挙に 行く 義務':'選挙は 権利','貴族院':'明治の 帝国議会に あった','市議会':'市の 議会','県議会':'県の 議会',
 '法人税':'会社に かかる 税','住民税':'住む 市などに はらう 税','所得税':'収入に かかる 税','消費税':'買い物で はらう 税','失業率':'仕事を さがしている 人の 割合','人口密度':'1km²あたりの 人口','出生率':'生まれる 子どもの 割合',
 '天皇主権':'明治の 憲法の 考え','身分制度':'江戸時代などの 制度','鎖国':'江戸時代の 外国との つきあい制限',
 '衆議院議長':'衆議院の 長','最高裁判所長官':'最高裁判所の 長','インフォームド・コンセント':'医者の 十分な 説明と 同意','リコール':'解職請求 または 製品の 回収','セーフガード':'輸入を 一時的に 制限',
 '条例制定権':'地方が きまりを つくる 権限','弾劾裁判':'裁判官を やめさせるかの 裁判（国会）','国政調査権':'国会が 政治を 調べる 権限','政令':'内閣が 定める きまり','条約':'国どうしの 約束','法律':'国会が つくる きまり','条例':'地方の きまり',
 'バブル':'株や 土地の 値段が 実力以上に 上がる','リセッション':'景気後退','デフレーション':'物価が 下がり続ける','インフレーション':'物価が 上がり続ける','円安':'円の 価値が 下がる','円高':'円の 価値が 上がる','好景気':'景気が よい','デフレ':'物価が 下がり続ける','インフレ':'物価が 上がり続ける',
 '公的扶助':'生活保護など','公衆衛生':'感染症の 予防など','社会保険':'年金・医療保険など','陪審制':'アメリカなどの 制度','三審制':'裁判を 3回まで',
 'WHO':'世界保健機関','NGO':'非政府組織','PKO':'国連平和維持活動','ODA':'政府開発援助','間接税':'消費税など','関税':'輸入品に かかる 税','累進課税':'所得が 多いほど 税率が 高い',
 'OPEC':'石油輸出国機構','ASEAN':'東南アジア諸国連合','NAFTA':'北米の 貿易協定','APEC':'アジア太平洋経済協力',
 '消費者契約法':'消費者を 守る 法律','独占禁止法':'不公正な 競争を ふせぐ','製造物責任法':'PL法','刑法':'犯罪と 刑罰を 定める','労働基準法':'労働時間などを 定める','民法':'個人どうしの きまり','労働組合法':'労働組合の 法律','消費税法':'消費税の 法律',
 '参政権':'政治に 参加する 権利','知る権利':'情報を 知る 権利（新しい人権）','労働基本権':'働く 人の 権利','選挙権':'選挙で 投票する 権利','財産権':'財産を もつ 権利','請願権':'国や 地方に 願いを 出す 権利','自由権':'自由に 考え 行動する 権利','請求権':'国に 求める 権利','黙秘権':'言いたくない ことを 言わない 権利',
 'ゆうちょ銀行':'ゆうびん局の 銀行','世界銀行':'国際的な 開発の 銀行','国際通貨基金':'IMF','条例':'地方の きまり','税制':'税の しくみ','決算':'1年の 結果の まとめ',
 '表現の 自由':'21条','戦争の 放棄':'9条','ロビー活動':'政治家に はたらきかける','イニシアティブ':'住民発案','レファレンダム':'住民投票',
 '世論調査':'意見の アンケート','住民投票':'地域の 投票','国民審査':'最高裁の 裁判官を 審査','国民投票':'憲法改正の 投票','陪審員制度':'アメリカなどの 制度','直接請求':'住民が 地方に 求める','大統領制':'アメリカなど',
 'ポツダム宣言':'1945年 日本の 降伏を 求めた','下関条約':'日清戦争の 講和条約','日米安保条約':'日米の 安全保障の 約束',
 '中国':'面積 4位・人口 2位','カナダ':'面積 2位','アメリカ':'面積 3位','インドネシア':'人口 4位','自治区':'少数民族の 地区','保護区':'自然などを 守る 地区','特別区':'東京の 23区など',
 '長江':'中国の 川（アジアで 一番 長い）','ミシシッピ川':'アメリカの 川','アマゾン川':'流域面積が 世界一','ボルガ川':'ヨーロッパで 一番 長い 川','中国語':'中国','英語':'アメリカ・イギリスなど','ロシア語':'ロシア','フランス語':'フランスなど','スペイン語':'南アメリカの 多くの 国',
 '神道':'日本の 宗教','仏教':'東南アジア・日本などに 多い','キリスト教':'ヨーロッパ・アメリカに 多い','南極大陸':'2番目に 小さい 大陸','アフリカ大陸':'2番目に 大きい 大陸','北アメリカ大陸':'3番目に 大きい','南アメリカ大陸':'4番目に 大きい',
 'シンガポール':'小さい 国だが 世界一ではない','ルクセンブルク':'ヨーロッパの 小さな 国','モナコ':'2番目に 小さい 国','シドニー':'時差 約1〜2時間','北京':'時差 1時間','ロンドン':'時差 9時間','パリ':'時差 8時間','ニューヨーク':'時差 約14時間',
 'タイ':'仏教の 国','イタリア':'キリスト教（バチカン）','インド':'ヒンドゥー教が 多い','ポンド':'イギリスの お金','元':'中国の お金','ドル':'アメリカの お金',
 '綿花':'アメリカ・インドなど','米':'アジアで 多く つくる','カラハリ砂漠':'アフリカ南部','アタカマ砂漠':'南アメリカ（世界一 雨が 少ない）','ゴビ砂漠':'モンゴル・中国',
 'ケニア':'赤道が 通る','ブラジル':'赤道が 通る','焼畑農業':'森を 焼いて 畑に する','遊牧':'家畜と 移動する','二期作だけ':'アジアの 米づくり',
 '大西洋':'2番目に 広い 海','インド洋':'3番目に 広い 海','北極海':'北極の まわりの 海','キリマンジャロ':'アフリカで 一番 高い 山','マッキンリー':'北アメリカで 一番 高い 山（デナリ）','富士山':'日本一 高い 山',
 '1時間':'15度で 1時間','2時間':'30度で 2時間','15時間':'225度で 15時間','30分':'7.5度で 30分',
 '冬に 雨が 多い':'地中海性気候などの こと','雪が ふらない':'白夜とは 関係ない','一日中 暑い':'熱帯の こと'};
const PREF_RX = /(都|道|府|県)$/;
const HERJ = n => J_HER.find(h => h[0]===n), HERW = n => W_HER.find(h => h[0]===n);
const herCard = (h, i, kind, cls) => h ? `<div class="ft58 ${cls}"><div class="ftPic">${img59((kind==='j' ? 'jh_' : 'wh_') + i)}</div><div><b>${cls==='ok' ? '🔴 正しい こたえ' : '🔵 きみの こたえ'}：${X(h[0])}</b><ul><li>ある ところ：${X(h[1])}</li><li>${X(h[2])}</li></ul></div></div>` : '';
const img59 = k => `<img src="${X(artSrc(k)||'')}" alt="" style="width:74px;height:74px;object-fit:contain;background:#fff;border-radius:8px">`;
const flagBox = (n, cls) => { let f = ''; try{ f = flagSVG(n, 'opt'); }catch(e){} const c = CTRY(n); return `<div class="fl59 ${cls}">${f}<b>${cls==='ok' ? '🔴' : '🔵'} ${X(n)}</b>${c ? `<small>${X(c[3])}・首都 ${X(c[2])}</small>` : ''}</div>`; };
const CONT_NOTE = {'アジア':'ユーラシア大陸の 東がわ。日本・中国・インドなど','ヨーロッパ':'ユーラシア大陸の 西がわ。フランス・ドイツなど','アフリカ':'赤道を はさむ 大陸。エジプト・ケニアなど','北アメリカ':'アメリカ・カナダ・メキシコなど','南アメリカ':'ブラジル・アルゼンチンなど','オセアニア':'オーストラリア大陸と 太平洋の 島々'};
const OCEAN_NOTE = {'太平洋':'日本と アメリカの 間。世界一 広い','大西洋':'ヨーロッパ・アフリカと アメリカ大陸の 間','インド洋':'アフリカと オーストラリアの 間。インドの 南','北極海':'北極の まわり。冬は こおる'};

const LAND59 = {
 '扇状地':`<rect width="120" height="95" fill="#F4F1E6"/><path d="M0 32 L18 6 L36 26 L60 0 L84 26 L102 6 L120 32Z" fill="#7FB36A"/><path d="M60 30 L20 90 H100 Z" fill="#E8D39C"/><path d="M60 0 V30 M60 30 L40 85 M60 30 L60 88 M60 30 L80 85" stroke="#4C97FF" stroke-width="2.5" fill="none"/>`,
 '三角州':`<rect width="120" height="95" fill="#BFE3FB"/><path d="M0 0 H120 V35 L60 80 L0 35Z" fill="#A9C98A"/><path d="M60 0 V50 M60 50 L40 80 M60 50 L80 80" stroke="#4C97FF" stroke-width="2.5" fill="none"/><path d="M40 50 L60 80 L80 50Z" fill="#E8D39C"/>`,
 '盆地':`<path d="M0 90 L0 30 L25 10 L40 55 H80 L95 10 L120 30 V90Z" fill="#A9C98A"/><rect x="40" y="55" width="40" height="35" fill="#E8D39C"/>`,
 '台地':`<path d="M0 90 V60 H25 L35 30 H85 L95 60 H120 V90Z" fill="#A9C98A"/><path d="M35 30 H85" stroke="#2E7D32" stroke-width="3"/>`,
 'リアス海岸':`<rect width="120" height="95" fill="#BFE3FB"/><path d="M0 0 H70 L60 15 L75 22 L55 35 L72 45 L50 58 L68 70 L45 82 L60 95 H0Z" fill="#A9C98A"/>`,
 '大陸だな':`<rect width="120" height="95" fill="#BFE3FB"/><path d="M0 20 H25 L70 35 L85 90 H0Z" fill="#E8D39C"/><path d="M0 0 H25 V20 H0Z" fill="#A9C98A"/><path d="M25 20 L70 35" stroke="#E8414B" stroke-width="3"/>`,
 '海溝':`<rect width="120" height="95" fill="#BFE3FB"/><path d="M0 40 H40 L55 88 L70 45 H120 V95 H0Z" fill="#E8D39C"/>`,
 'カルデラ':`<path d="M0 90 L30 30 L45 45 H75 L90 30 L120 90Z" fill="#A9C98A"/><path d="M45 45 H75" stroke="#4C97FF" stroke-width="4"/>`};
const landFig = (a, v) => { const L = [a].concat(v && v!==a && LAND59[v] ? [v] : []); return `<div class="ld59">${L.map((k,i) => `<figure class="${i ? 'ng' : 'ok'}"><svg viewBox="0 0 120 95" width="140">${LAND59[k]}</svg><figcaption>${i ? '🔵' : '🔴'} ${X(k)}</figcaption></figure>`).join('')}</div>`; };
function soc59(p, v, u, t, ans){
  const out = {figs:[], steps:[], tip:'', why:''};
  const gl = x => GLS[x] || (JOBS[x] ? JOBS[x][0] : '') || (TOOLS[x] ? `むかしの 道具：${TOOLS[x][0]}` : '');
  const addWhy = () => { if(v && v!==ans){ const g = gl(v); if(g) out.why = `きみが えらんだ「${X(v)}」は：${X(g)}`; } };
  const prefFig = () => { const a = PREF_BY(ans), b = v ? PREF_BY(v) : null; if(a && PREF_RX.test(ans)) out.figs.push(jpMap2(a, b && b!==a ? b : null)); const r = regOf(String(ans).replace(/地方$/,'')); if(r && /地方$/.test(ans)) out.figs.push(jpMap2(null, null, r)); };
  /* 1) 問題ごとの せつめい */
  const key = String(p.q).replace(/<[^>]+>/g,'') + '|' + ans, ex = SOCX[key];
  if(ex){ { const il = window.__ill60q ? window.__ill60q(p.q, ans, v) : ''; if(il) out.figs.push(il); } if(LAND59[ans]) out.figs.push(landFig(ans, v)); out.steps.push(`<b>${X(stripQ(String(p.q).replace(/<[^>]+>/g,'')))}</b> → <b class="okc">${X(ans)}</b>`, ex); addWhy(); prefFig(); if(p.disp && /qPic|<img/.test(p.disp) && !out.figs.length) out.figs.push(`<div class="dp56">${p.disp}</div>`); return out; }
  /* 2) 絵の 仕事 */
  if(u==='s_life' && JOBS[ans]){ const J = JOBS[ans]; out.steps.push(`絵の 人は <b>${X(ans)}</b>：${X(J[0])}`); if(J[1]) out.steps.push(X(J[1])); if(p.disp) out.figs.push(`<div class="dp56">${p.disp}</div>`); if(v && JOBS[v]) out.why = `「${X(v)}」は：${X(JOBS[v][0])}`; out.tip = 'どうぐや ふく・のりものを 見ると 仕事が わかるよ'; return out; }
  /* 3) むかしの 道具 */
  if(u==='s_old'){ const name = Object.keys(TOOLS).find(k => ans===k || String(p.q).includes(k)), T2 = TOOLS[name];
    if(T2){ out.steps.push(`<b>${X(name)}</b>：${X(T2[0])}`, `今は <b>${X(T2[1])}</b> を 使うよ`); if(p.disp) out.figs.push(`<div class="dp56">${p.disp}</div>`);
      const vn = TOOLS[v] ? v : Object.keys(TOOLS).find(k => TOOLS[k][1]===v); if(v && v!==ans && vn) out.why = TOOLS[v] ? `「${X(v)}」は：${X(TOOLS[v][0])}` : `「${X(v)}」は ${X(vn)}の かわりに 今 使う もの`; else addWhy();
      out.tip = 'むかしの 道具 → 今の 道具 を セットで おぼえよう'; return out; } }
  /* 4) 世界遺産 */
  if(u==='j_her' || u==='w_her'){ const kind = u==='j_her' ? 'j' : 'w', L = kind==='j' ? J_HER : W_HER, H = kind==='j' ? HERJ : HERW;
    const h = H(p.sub) || H(ans), i = L.indexOf(h); if(!h) return null;
    const hv = H(v), iv = L.indexOf(hv);
    out.figs.push(`<div class="ftw58">${herCard(h, i, kind, 'ok')}${hv && hv!==h ? herCard(hv, iv, kind, 'ng') : ''}</div>`);
    out.steps.push(`<b>${X(h[0])}</b> は ${X(h[1])} に ある。${X(h[2])}`);
    if(ans===h[1] && v && v!==ans){ const others = L.filter(x => x[1]===v).map(x => x[0]); out.why = others.length ? `${X(v)}に ある 世界遺産は ${others.map(X).join('・')} だよ` : `${X(v)}では ないよ`; }
    if(kind==='j'){ const pf = PREF_BY(String(h[1]).replace(/など$/,'').split('・')[0]), pv = hv && hv!==h ? PREF_BY(String(hv[1]).replace(/など$/,'').split('・')[0]) : (ans===h[1] && v ? PREF_BY(v) : null); if(pf) out.figs.push(jpMap2(pf, pv && pv!==pf ? pv : null)); } else { const c = CTRY(h[1]); if(c) out.figs.push(worldMap2(c[0])); }
    out.tip = '建物や 自然の 形と、ある 場所を セットで おぼえよう'; return out; }
  /* 5) 国旗 */
  if(u==='w_flag'){ out.figs.push(`<div class="fl59w">${flagBox(ans,'ok')}${v && v!==ans ? flagBox(v,'ng') : ''}</div>`); const c = CTRY(ans), cv = CTRY(v);
    if(c) out.figs.push(worldMap2(c[0], cv && cv!==c ? cv[0] : null));
    out.steps.push(`<b>${X(ans)}</b> の 国旗だよ（${X(c ? c[3] : '')}）`); if(v && v!==ans) out.why = `色の ならびや マークの ちがいを 見くらべよう`; out.tip = '色・もようの 向き（たて／よこ）・星や 月の マークに 注目'; return out; }
  /* 6) 大陸・海 */
  if(u==='w_cont'){ if(p.disp) out.figs.push(`<div class="dp56">${p.disp}</div>`);
    if(OCEAN_NOTE[ans]){ try{ let m = worldSVG(null, {}); const seen = {}; OCEANS.forEach(([n,[lo,la]]) => { if(seen[n]) return; seen[n] = 1; const [x,y] = wxy(lo,la); const c = n===ans ? '#E8414B' : n===v ? '#1C6AAE' : '#4F7896'; m = m.replace('</svg>', `<text x="${x}" y="${y}" text-anchor="middle" font-size="${n===ans||n===v?36:26}" font-weight="900" fill="${c}" stroke="#fff" stroke-width="4" paint-order="stroke">${n===ans?'🔴':n===v?'🔵':''}${n}</text></svg>`); }); out.figs = [m]; }catch(e){} out.steps.push(`<b>${X(ans)}</b>：${X(OCEAN_NOTE[ans])}`); if(OCEAN_NOTE[v]) out.why = `「${X(v)}」は：${X(OCEAN_NOTE[v])}`; out.tip = '3大洋：太平洋（いちばん 広い）・大西洋・インド洋'; return out; }
    if(CONT_NOTE[ans]){ const sub = String(p.sub||''); out.steps.push(sub && sub!==ans ? `<b>${X(sub)}</b> は <b>${X(ans)}</b> の 国` : `オレンジ色は <b>${X(ans)}</b>`, `${X(ans)}：${X(CONT_NOTE[ans])}`); if(CONT_NOTE[v]) out.why = `「${X(v)}」は：${X(CONT_NOTE[v])}`; out.tip = '6大陸：ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極'; return out; } }
  /* 7) となりの 都道府県 */
  if(u==='s_neigh'){ const name = Object.keys(NEIGH).find(n => String(p.sub||'').includes(n) && String(p.q).includes(n)) || Object.keys(NEIGH).find(n => String(p.q).includes(n)); if(!name) return null;
    const nb = NEIGH[name], P0 = PREF_BY(name); let FS = 11;
    out.figs.push(`<svg class="jpMap ex56Map" viewBox="${(() => { const pts = [P0].concat(nb.map(PREF_BY)).filter(Boolean).map(prefXY); const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); const S2 = Math.max(Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys)) + 70; FS = Math.max(4.5, S2/400*15); const cx = (Math.max(...xs)+Math.min(...xs))/2, cy = (Math.max(...ys)+Math.min(...ys))/2; return `${clamp(cx-S2/2,0,400-S2).toFixed(0)} ${clamp(cy-S2/2,0,440-S2).toFixed(0)} ${S2.toFixed(0)} ${S2.toFixed(0)}`; })()}">${jpBase()}${nb.map(n => { const q = PREF_BY(n); if(!q) return ''; const [x,y] = prefXY(q); return `<circle cx="${x}" cy="${y}" r="${FS*0.45}" fill="#FF9F43" stroke="#fff" stroke-width="${FS*0.12}"/><text x="${x+FS*0.6}" y="${y+FS*0.35}" font-size="${FS}" font-weight="900" fill="#B35C00" stroke="#fff" stroke-width="${FS*0.28}" paint-order="stroke">${X(n.replace(/(県|府|都)$/,''))}</text>`; }).join('')}${(() => { const [x,y] = prefXY(P0); return `<circle cx="${x}" cy="${y}" r="${FS*0.6}" fill="#E8414B" stroke="#fff" stroke-width="${FS*0.15}"/><text x="${x+FS*0.7}" y="${y-FS*0.5}" font-size="${FS*1.15}" font-weight="900" fill="#E8414B" stroke="#fff" stroke-width="${FS*0.3}" paint-order="stroke">${X(name.replace(/(県|府|都)$/,''))}</text>`; })()}</svg>`);
    out.steps.push(`<b>${X(name)}</b> と 陸で となりあっているのは：${nb.map(X).join('・')}（<b>${nb.length}</b>つ）`);
    if(v && v!==ans){ if(/^\d+$/.test(ans)) out.why = `オレンジの ● を 数えると ${nb.length}こ だよ`; else { const q = PREF_BY(v); out.why = `${X(v)}は ${X(name)}と となりあって いないよ${q ? `（${X(q[2])}地方）` : ''}`; } }
    out.tip = '地図で まわりを ぐるっと 一周して 数えよう'; return out; }
  return null;
}
function socExp(p, v){
  const u = p.u, t = plain(p.q), ans = String(p.ans), out = {figs:[], steps:[], tip:'', why:''};

  /* ===== v5.9：しゃかいの かいせつを 問題ごとに ===== */
  { const r59 = soc59(p, v, u, t, ans); if(r59) return r59; }
  const okP = PREF_BY(ans) || PREF_OF_CAP(ans) || PREF_OF_THING(ans) || (u==='s_loc'||u==='s_food'||u==='s_cap'||u==='s_read'||u==='s_neigh' ? PREF_BY(p.sub) : null);
  const ngP = v ? (PREF_BY(v) || PREF_OF_CAP(v) || PREF_OF_THING(v)) : null;
  /* 都道府県 */
  if(/^s_(loc|cap|food|read|neigh|pref2|region)$/.test(u) || u==='j_her' && (okP || /県|府|都|道/.test(ans))){
    const reg = regOf(ans);
    if(reg){ const ng = regOf(v); out.figs.push(jpMap2(null, null, reg)); out.steps.push(`オレンジの ● が <b>${reg}地方</b>`, `${reg}地方：${PREF.filter(p => p[2]===reg).map(p => p[0]).join('・')}`); if(ng) out.why = `${ng}地方は ${PREF.filter(p => p[2]===ng).slice(0,4).map(p=>p[0]).join('・')}… の あたりだよ`; out.tip = '日本は 北海道・東北・関東・中部・近畿・中国・四国・九州の 8地方'; return out; }
    if(u==='s_neigh'){ const base = PREF_BY(String(p.sub||'').replace(ans,'')) || PREF_BY((t.match(/^(\S+?[都道府県])/)||[])[1]); out.figs.push(jpMap2(okP, base, null)); out.steps.push(`${X(base?.[0]||'')} と <b>${X(ans)}</b> は さかいを せっしているよ`); if(ngP) out.why = `${ngP[0]}は ${ngP[2]}地方。はなれているね`; return out; }
    const multi = ans.includes('・') ? ans.split('・').map(PREF_BY).filter(Boolean) : [];
    if(multi.length > 1){ out.figs.push(`<svg class="jpMap ex56Map" viewBox="0 0 400 440">${jpBase()}${multi.map(q => { const [x,y] = prefXY(q); return pinSVG(x, y) + `<text x="${x+11}" y="${y-9}" font-size="15" font-weight="900" fill="#E8414B" stroke="#fff" stroke-width="3.5" paint-order="stroke">${X(q[0])}</text>`; }).join('')}</svg>`); out.steps.push(`<b>${X(p.sub||'')}</b> は ${multi.map(q => q[0]).join('と ')}に またがっているよ`); return out; }
    const rq = t.match(/(\S+?)地方には 都道府県が いくつ/); if(rq){ const r2 = regOf(rq[1]); if(r2){ out.figs.push(jpMap2(null, null, r2)); out.steps.push(`${r2}地方：${PREF.filter(q => q[2]===r2).map(q => q[0]).join('・')}`, `ぜんぶで <b>${ans}</b>`); return out; } }
    if(!okP) out.steps.push(`こたえ <b class="okc">${X(ans)}</b>${p.sub && !/^(rg|ll|nd)/.test(p.sub) ? `（${X(p.sub)}）` : ''}`);
    if(okP){ out.figs.push(jpMap2(okP, ngP && ngP!==okP ? ngP : null)); out.steps.push(prefCard(okP)); if(ngP && ngP!==okP) out.steps.push(prefCard(ngP, true)); }
    if(u==='s_cap') out.tip = okP && okP[0].replace(/[県府都]$/,'') + '市' !== okP[1] ? `${okP[0]}の 県庁所在地は 県名と ちがう「${okP[1]}」！ 注意しよう` : '県名と 同じ 名前の 県庁所在地が 多いよ';
    else if(u==='s_read') out.tip = `${X(okP?.[0]||'')} は「${X(ans)}」と 読む`;
    else if(u==='s_pref2'){ const k = String(p.sub||'').slice(0,2); out.tip = k==='ll' ? '海に 面して いない 県：栃木・群馬・埼玉・山梨・長野・岐阜・滋賀・奈良' : k==='nd' ? '県名と 県庁所在地が ちがう：北海道(札幌)・岩手(盛岡)・宮城(仙台)・茨城(水戸)・栃木(宇都宮)・群馬(前橋)・埼玉(さいたま)・神奈川(横浜)・山梨(甲府)・石川(金沢)・愛知(名古屋)・三重(津)・滋賀(大津)・兵庫(神戸)・島根(松江)・香川(高松)・愛媛(松山)・沖縄(那覇) など' : ''; }
    return out;
  }
  if(u==='s_sym'){ out.steps.push(`<b>${X(ans)}</b>：${X(SYM_NOTE[ans]||'')}`); if(v && SYM_NOTE[v]) out.steps.push(`🔵 ${X(v)} は：${X(SYM_NOTE[v])}`);
    out.figs.push(`<div class="sym56">${MAPSYM.map(([s,n]) => `<span class="${n===ans?'ok':n===v?'ng':''}"><i>${s}</i><small>${X(n)}</small></span>`).join('')}</div>`); out.tip = '地図記号は「もとに なった もの」の 形を 思い出そう'; return out; }
  if(u==='s_dir'){ const i = DIR8.indexOf(ans), j = DIR8.indexOf(v);
    out.figs.push(`<svg class="fig56" viewBox="0 0 160 160" width="190"><circle cx="80" cy="80" r="72" fill="#FFF8E7" stroke="#C99A63" stroke-width="3"/>${DIR8.map((d,k) => { const a = k*45*Math.PI/180, x = 80+Math.sin(a)*56, y = 80-Math.cos(a)*56; return `<line x1="80" y1="80" x2="${80+Math.sin(a)*40}" y2="${80-Math.cos(a)*40}" stroke="${k===i?'#E8414B':k===j?'#1C6AAE':'#D8C3A0'}" stroke-width="${k===i||k===j?4:2}"/><text x="${x}" y="${y+5}" class="tx56 c" font-size="${d.length>1?12:15}" fill="${k===i?'#E8414B':k===j?'#1C6AAE':k===0?'#C0392B':'#5A4632'}">${d}</text>`; }).join('')}</svg>`);
    out.steps.push('上が 北。時計まわりに 北 → 北東 → 東 → 南東 → 南 → 南西 → 西 → 北西', `こたえ <b>${X(ans)}</b>`); out.tip = '「北」「南」を さきに、「東」「西」を あとに いう（北東・南西）'; return out; }
  /* 世界 */
  if(/^w_(loc|cap|cont|flag)$/.test(u) || u==='w_her'){
    const okC = CTRY(ans) || CTRY(p.sub) || COUNTRIES.find(c => c[2]===ans), ngC = v ? (CTRY(v) || COUNTRIES.find(c => c[2]===v)) : null;
    if(okC){ out.figs.push(worldMap2(okC[0], ngC && ngC!==okC ? ngC[0] : null));
      out.steps.push(`🔴 <b>${X(okC[1])}</b>（${X(okC[3])}）首都：${X(okC[2])}`); if(ngC && ngC!==okC) out.steps.push(`🔵 きみの こたえ ${X(ngC[1])} は ${X(ngC[3])}の 国（首都 ${X(ngC[2])}）`); }
    if(u==='w_her'){ const H = W_HER.find(h => h[0]===ans || h[0]===p.sub); if(H) out.steps.push(`<b>${X(H[0])}</b>（${X(H[1])}）：${X(H[2])}`); }
    if(u==='w_cont'){ out.tip = '6大陸：ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極　3大洋：太平洋・大西洋・インド洋'; if(p.disp) out.figs.push(`<div class="dp56">${p.disp}</div>`); out.steps.push(`こたえ <b class="okc">${X(ans)}</b>${v ? `（${X(v)} では ないよ）` : ''}`); }
    if(!out.steps.length) out.steps.push(`こたえ <b class="okc">${X(ans)}</b>`);
    return out;
  }
  /* 歴史 */
  if(/^j_(era|year|order|person|person2|face)$/.test(u)){
    const hits = [];
    if(u==='j_era'){ const e = EVT(p.sub||t); hits.push({era:ans, col:'#FFB3B3', t:`🔴 ${p.sub||''}`}); if(v && v!==ans && ERA_ALL.includes(v)) hits.push({era:v, col:'#BFD9F5', t:`🔵 きみ：${v}`, tcol:'#1C6AAE'});
      out.steps.push(`「${X(p.sub)}」は <b>${X(ans)}時代</b>${e && e[2] ? `（${e[2]}年）` : ''}`); out.tip = 'じだいの じゅんばん：弥生・古墳・飛鳥・奈良・平安・鎌倉・室町・安土桃山・江戸・明治・大正・昭和'; }
    else if(u==='j_year'){ const e = EVT(p.sub||t), y = parseInt(ans), vy = parseInt(v); hits.push({era:e ? e[1] : eraOfYear(y), col:'#FFB3B3', t:`🔴 ${y}年`});
      if(vy && vy!==y) hits.push({era:eraOfYear(vy), col:'#BFD9F5', t:`🔵 ${vy}年`, tcol:'#1C6AAE'});
      out.steps.push(`「${X(p.sub)}」は <b>${y}年</b>（${X(e ? e[1] : eraOfYear(y))}時代）`); if(vy && vy!==y) out.why = `${vy}年は ${eraOfYear(vy)}時代。${Math.abs(vy-y)}年も ずれているよ`; out.tip = 'ごろあわせで おぼえると わすれにくいよ'; }
    else if(u==='j_order'){ const evs = String(p.q).replace(/<[^>]+>/g,'').split(/ と |、先に/).slice(0,2).map(s => EVT(s.trim())).filter(Boolean);
      evs.sort((a,b) => (a[2]||0)-(b[2]||0)).forEach((e,i) => hits.push({era:e[1], col:i===0?'#FFB3B3':'#FFE2A8', t:`${i===0?'①':'②'} ${e[0]}`}));
      out.steps.push(...evs.map((e,i) => `${i===0?'① さき':'② あと'}：${X(e[0])}（${X(e[1])}時代${e[2] ? `・${e[2]}年` : ''}）`)); out.tip = 'じだいの じゅんばんを 思い出して くらべよう'; }
    else { const P = JPP(p.sub) || JPP(ans) || JP_PEOPLE.find(x => x[1]===ans); const Pv = v ? (JPP(v) || JP_PEOPLE.find(x => x[1]===v)) : null;
      if(P){ hits.push({era:P[2], col:'#FFB3B3', t:`🔴 ${P[0]}`}); out.steps.push(`<b>${X(P[0])}</b>：${X(P[1])}（${X(P[2])}時代）`); }
      if(Pv && Pv!==P){ hits.push({era:Pv[2], col:'#BFD9F5', t:`🔵 ${Pv[0]}`, tcol:'#1C6AAE'}); out.steps.push(`🔵 きみの こたえ：${X(Pv[0])} ：${X(Pv[1])}（${X(Pv[2])}時代）`); }
      else if(v && ERA_ALL.includes(v) && P){ hits.push({era:v, col:'#BFD9F5', t:`🔵 ${v}`, tcol:'#1C6AAE'}); } }
    if(hits.length) out.figs.unshift(eraLine(hits));
    return out;
  }
  if(u==='w_person' || u==='w_face'){ const P = WPP(p.sub) || WPP(ans) || W_PEOPLE.find(x => x[1]===ans), Pv = v ? (WPP(v) || W_PEOPLE.find(x => x[1]===v)) : null;
    if(P){ out.steps.push(`<b>${X(P[0])}</b>：${X(P[1])}${P[2] ? `（${X(P[2])}）` : ''}`); const c = CTRY(P[2]); if(c) out.figs.push(worldMap2(c[0])); }
    if(Pv && Pv!==P) out.steps.push(`🔵 きみの こたえ：${X(Pv[0])} ：${X(Pv[1])}`); return out; }
  /* こうみん：図 */
  if(/国会|内閣|裁判所|違憲|弾劾|三権|国政調査/.test(t + ans)){
    out.figs.push(`<svg class="fig56" viewBox="0 0 300 200" width="300"><g class="tx56 c" font-size="13"><circle cx="150" cy="40" r="34" fill="#FFE2A8"/><text x="150" y="38">国会</text><text x="150" y="54" font-size="10">立法</text>
      <circle cx="60" cy="150" r="34" fill="#BFD9F5"/><text x="60" y="148">内閣</text><text x="60" y="164" font-size="10">行政</text><circle cx="240" cy="150" r="34" fill="#D7F2D1"/><text x="240" y="148">裁判所</text><text x="240" y="164" font-size="10">司法</text></g>
      <g stroke="#7A5A3A" stroke-width="2" marker-end="url(#a56)" fill="none"><path d="M125 65 L80 120"/><path d="M175 65 L220 120"/><path d="M95 150 H205"/></g>
      <defs><marker id="a56" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7A5A3A"/></marker></defs>
      <text x="80" y="92" class="tx56" font-size="10">不信任決議</text><text x="200" y="92" class="tx56" font-size="10">弾劾裁判</text><text x="150" y="144" class="tx56 c" font-size="10">違憲審査</text></svg>`);
    out.tip = '三権分立：国会・内閣・裁判所が おたがいを チェックしあう';
  }
  if(!out.steps.length) out.steps.push(`<b>${X(stripQ(t))}</b> → <b class="okc">${X(ans)}</b>`);
  if(!out.figs.length && p.disp && !/<svg class="jpMap|qPic big/.test('')) out.figs.push(`<div class="dp56">${p.disp}</div>`);
  if(u==='s_old' && v){ const r = (SOC_QA.old||[]).find(x => x[1]===v); if(r) out.why = `「${v}」は：${r[0].replace(/は？$|？$/,'')}`; }
  if(u==='s_life' && v){ const r = (SOC_QA.life||[]).find(x => x[1]===v); if(r) out.why = `「${v}」は：${r[0].replace(/は？$|？$/,'')}`; }
  if(u==='w_cont') out.tip = '6大陸：ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極　3大洋：太平洋・大西洋・インド洋';
  if(/自助|共助|公助/.test(t + ans)) out.tip = '自助＝じぶんで まもる、共助＝地域で 助け合う、公助＝国や 市が 助ける';
  if(/リデュース|リユース|リサイクル|3R/.test(t + ans)) out.tip = '3R：リデュース（へらす）・リユース（くりかえし つかう）・リサイクル（しげんに もどす）';
  if(/円高|円安/.test(t + ans)) out.tip = '円高＝円の ねうちが 上がる（1ドル 150円 → 100円）。外国の ものが 安く 買える';
  return out;
}

/* =====================================================================
   りかの かいせつ（まとめ図）
   ===================================================================== */
const S_TXT = (x,y,s,o='') => `<text x="${x}" y="${y}" class="tx56 c" ${o}>${s}</text>`;
const SCI_FIG = {
  bug:`<svg class="fig56" viewBox="0 0 300 150" width="300"><ellipse cx="80" cy="70" rx="24" ry="22" fill="#FFD27A"/><ellipse cx="130" cy="70" rx="28" ry="24" fill="#9ED3A0"/><ellipse cx="200" cy="70" rx="44" ry="28" fill="#BFD9F5"/>
    <g stroke="#555" stroke-width="3">${[110,130,150].map(x => `<path d="M${x} 90 l-12 30"/><path d="M${x} 50 l-12 -30"/>`).join('')}<path d="M70 52 l-14 -26"/><path d="M84 50 l4 -28"/></g>
    ${S_TXT(80,140,'あたま')}${S_TXT(130,140,'むね')}${S_TXT(200,140,'はら')}${S_TXT(240,20,'あし 6本は むねに','font-size="11"')}${S_TXT(56,16,'目・しょっかく','font-size="10"')}</svg>`,
  plant:`<svg class="fig56" viewBox="0 0 260 170" width="260"><path d="M130 150 V60" stroke="#4E9A47" stroke-width="5"/><ellipse cx="102" cy="90" rx="26" ry="10" fill="#7CC36E" transform="rotate(-20 102 90)"/><ellipse cx="158" cy="80" rx="26" ry="10" fill="#7CC36E" transform="rotate(20 158 80)"/>
    <circle cx="130" cy="48" r="16" fill="#FFB3C1"/><circle cx="130" cy="48" r="6" fill="#FFD27A"/><path d="M130 150 l-20 14 M130 150 l20 14 M130 150 v16" stroke="#A0703C" stroke-width="3"/><path d="M40 150 H220" stroke="#B0855A" stroke-width="2"/>
    ${S_TXT(200,50,'花')}${S_TXT(210,90,'葉')}${S_TXT(92,125,'くき')}${S_TXT(180,166,'根')}</svg>`,
  flower:`<svg class="fig56" viewBox="0 0 280 150" width="280"><ellipse cx="140" cy="80" rx="80" ry="58" fill="#FFE3EC"/><path d="M140 120 V40" stroke="#4E9A47" stroke-width="5"/><circle cx="140" cy="38" r="9" fill="#9ED3A0"/>
    <path d="M110 120 V60" stroke="#E0A030" stroke-width="3"/><circle cx="110" cy="58" r="7" fill="#FFD27A"/><path d="M170 120 V60" stroke="#E0A030" stroke-width="3"/><circle cx="170" cy="58" r="7" fill="#FFD27A"/><ellipse cx="140" cy="128" rx="40" ry="12" fill="#9ED3A0"/>
    ${S_TXT(140,20,'めしべ（先に 花粉が つく）','font-size="11"')}${S_TXT(70,62,'おしべ','font-size="11"')}${S_TXT(240,62,'花びら','font-size="11"')}${S_TXT(140,147,'がく','font-size="11"')}</svg>`,
  moon:`<svg class="fig56" viewBox="0 0 320 110" width="320">${[['新月',0],['三日月',.25],['半月',.5],['満月',1]].map(([n,f],i) => { const x = 40 + i*80; return `<circle cx="${x}" cy="45" r="26" fill="#3B4366"/>${f===1 ? `<circle cx="${x}" cy="45" r="26" fill="#FFE27A"/>` : f ? `<path d="M${x} 19 A26 26 0 0 1 ${x} 71 A${26*(1-2*f)} 26 0 0 ${f>.5?1:0} ${x} 19Z" fill="#FFE27A"/>` : ''}${S_TXT(x,92,n)}`; }).join('')}</svg>`,
  mag:`<svg class="fig56" viewBox="0 0 300 100" width="300"><rect x="20" y="30" width="60" height="30" fill="#E8414B"/><rect x="80" y="30" width="60" height="30" fill="#4C97FF"/>${S_TXT(50,50,'N','fill="#fff"')}${S_TXT(110,50,'S','fill="#fff"')}
    ${S_TXT(80,85,'力が 強いのは 両はし','font-size="11"')}<g transform="translate(160 0)">${S_TXT(70,20,'同じ きょく → しりぞけあう','font-size="11"')}${S_TXT(70,50,'ちがう きょく → 引きあう','font-size="11"')}${S_TXT(70,80,'鉄は つく／アルミ・銅は つかない','font-size="11"')}</g></svg>`,
  lever:null,
  water:`<svg class="fig56" viewBox="0 0 300 100" width="300">${[['こおり（固体）','#CFE8FF','0℃'],['水（液体）','#7FB6E6','100℃'],['水じょう気（気体）','#EAF4FF','']].map(([n,c,tmp],i) => `<rect x="${10+i*100}" y="20" width="80" height="44" rx="8" fill="${c}" stroke="#5C88B5"/>${S_TXT(50+i*100,46,n,'font-size="10"')}${tmp ? `<path d="M${90+i*100} 42 h20" stroke="#E8414B" stroke-width="2"/>${S_TXT(100+i*100,82,tmp,'font-size="11" fill="#E8414B"')}` : ''}`).join('')}</svg>`,
  burn:`<svg class="fig56" viewBox="0 0 280 140" width="280"><rect x="125" y="70" width="30" height="60" fill="#FFF1C9" stroke="#B88A5A"/><path d="M140 70 q-14 -22 0 -44 q14 22 0 44z" fill="#FFB347"/>
    ${S_TXT(60,40,'酸素が 使われる','font-size="11" fill="#1C6AAE"')}${S_TXT(220,40,'二酸化炭素が できる','font-size="11" fill="#E8414B"')}${S_TXT(140,138,'空気が 入れかわると よく 燃える','font-size="11"')}</svg>`,
  land:`<svg class="fig56" viewBox="0 0 320 120" width="320"><path d="M10 30 Q120 40 160 70 T310 100" stroke="#7FB6E6" stroke-width="14" fill="none"/>${S_TXT(50,16,'上流：流れが 速い・石は 大きく ごつごつ','font-size="10"')}${S_TXT(230,70,'下流：流れが ゆるやか','font-size="10"')}${S_TXT(230,84,'石は 小さく 丸い','font-size="10"')}
    ${S_TXT(110,112,'曲がった ところ：外がわは けずられ、内がわに つもる','font-size="10"')}</svg>`,
  body:`<svg class="fig56" viewBox="0 0 280 150" width="280"><circle cx="70" cy="30" r="18" fill="#FFE3C7"/><rect x="50" y="50" width="40" height="55" rx="10" fill="#FFE3C7"/><path d="M58 60 h24 M58 70 h24 M58 80 h24" stroke="#C99A63" stroke-width="2"/>
    ${S_TXT(190,30,'頭のほね：のうを まもる','font-size="11"')}${S_TXT(190,60,'ろっ骨：心ぞう・はいを まもる','font-size="11"')}${S_TXT(190,90,'関節：ほねと ほねの つなぎめで 曲がる','font-size="11"')}${S_TXT(190,120,'筋肉：ちぢんだり ゆるんだりして 動かす','font-size="11"')}</svg>`,
  hbody:`<svg class="fig56" viewBox="0 0 300 150" width="300">${[['心ぞう','血液を 全身に 送る','#FFB3B3'],['はい','酸素を とりこみ 二酸化炭素を 出す','#BFD9F5'],['胃・小腸','食べ物を 消化・吸収','#FFE2A8'],['じん臓','血液から 不要な ものを こしとる','#D7F2D1']].map(([a,b,c],i) => `<rect x="10" y="${8+i*35}" width="70" height="28" rx="8" fill="${c}"/>${S_TXT(45,27+i*35,a,'font-size="12"')}<text x="90" y="${27+i*35}" class="tx56" font-size="11">${b}</text>`).join('')}</svg>`,
  sol:`<svg class="fig56" viewBox="0 0 300 130" width="300"><path d="M30 110 H280 M30 110 V10" stroke="#555" stroke-width="2"/><path d="M30 80 Q150 74 280 70" stroke="#E8414B" stroke-width="3" fill="none"/><path d="M30 100 Q160 90 280 25" stroke="#4C97FF" stroke-width="3" fill="none"/>
    ${S_TXT(240,62,'食塩：あまり かわらない','font-size="10" fill="#E8414B"')}${S_TXT(220,22,'ミョウバン：ふえる','font-size="10" fill="#4C97FF"')}${S_TXT(160,126,'水の 温度 →','font-size="10"')}${S_TXT(12,60,'とける量','font-size="10" transform="rotate(-90 12 60)"')}</svg>`,
  emag:`<svg class="fig56" viewBox="0 0 300 110" width="300"><rect x="40" y="40" width="110" height="26" rx="6" fill="#C9C9C9"/>${[...Array(8)].map((_,i) => `<path d="M${50+i*13} 34 v38" stroke="#C0763A" stroke-width="4"/>`).join('')}
    ${S_TXT(95,96,'コイル＋鉄しん','font-size="11"')}${S_TXT(230,30,'強くするには：','font-size="11"')}${S_TXT(230,55,'電流を 大きく','font-size="11"')}${S_TXT(230,80,'まき数を ふやす','font-size="11"')}</svg>`
};
const SCI_TIP = {r_bug:'こん虫：からだが あたま・むね・はらの 3つ、あしは むねから 6本', r_bugpic:'あしの 数と からだの 分かれ方を 見よう（クモは 8本で こん虫では ない）', r_plant:'植物は 根・くき・葉で できている。たね → め → 花 → 実 → たね',
  r_plantpic:'花の さく 季節：春（チューリップ・タンポポ）、夏（アサガオ・ヒマワリ）、秋（イネが みのる）', r_sun:'かげは 太陽の 反対がわに できる。太陽は 東 → 南 → 西 へ うごく', r_mag:'じしゃくは N と S。同じ きょくは しりぞけあい、ちがう きょくは 引きあう',
  r_sky:'月は 形が かわって 見える（新月 → 三日月 → 半月 → 満月）。星には 明るさや 色の ちがいが ある', r_body:'ほねは 体を ささえ、中の だいじな ものを まもる。筋肉で 関節が 曲がる', r_water:'水は 0℃で こおり、100℃で ふっとうする。あたためると 体積が ふえる',
  r_flower:'受粉すると めしべの もとが 実に なる', r_life:'メダカ・人などの たんじょう：受精卵 → 育つ → たんじょう', r_sol:'水よう液は すきとおっている。食塩は 温度を 上げても あまり とけない', r_lever:'てこが つり合う：左の（重さ × きょり）＝ 右の（重さ × きょり）',
  r_emag:'電磁石は 電流を ながした ときだけ じしゃくに なる', r_land:'流れる 水の はたらき：しん食（けずる）・運ぱん（はこぶ）・たい積（つもらせる）', r_burn:'ものが 燃えると 酸素が へり、二酸化炭素が ふえる',
  r_hbody:'血液は 心ぞうから 全身へ。はいで 酸素を とりいれる', r_moon:'月は 太陽の 光を はんしゃして 光る。月と 太陽の いちで 形が かわる',
  r_bio:'生物の なかま分け：せきつい動物（魚・両生・は虫・鳥・ほにゅう）と 無せきつい動物', r_chem:'化学変化では 原子の 組み合わせが かわる。質量の 合計は かわらない（質量保存）',
  r_phys:'直列回路：電流は どこも 同じ。並列回路：電圧が どこも 同じ', r_earth:'火山岩は 急に 冷えて できる（小さな つぶ）、深成岩は ゆっくり 冷えて できる（大きな つぶ）'};
const SCI_FIGK = {r_bug:'bug', r_bugpic:'bug', r_plant:'plant', r_plantpic:'plant', r_flower:'flower', r_sky:'moon', r_moon:'moon', r_mag:'mag', r_emag:'emag', r_water:'water', r_burn:'burn', r_land:'land', r_body:'body', r_hbody:'hbody', r_sol:'sol'};
function sciExp(p, v){
  if(window.__sciExp58){ try{ window.__fig58(null, k => SCI_FIG[k] || ''); const r58 = window.__sciExp58(p, v); if(r58) return r58; }catch(e){ console.warn(e); } }
  const u = p.u, t = plain(p.q), ans = String(p.ans), out = {figs:[], steps:[], tip:SCI_TIP[u]||'', why:''};
  if(u==='r_lever' && p.type==='num'){ const m = t.match(/(\d+)g\s*を\s*支点から\s*(\d+).*?(\d+)\s*の\s*位置/);
    if(m){ const w = +m[1], d1 = +m[2], d2 = +m[3];
      out.figs.push(`<svg class="fig56" viewBox="0 0 300 120" width="300"><path d="M20 60 H280" stroke="#8A5A2B" stroke-width="6"/><path d="M150 62 l-14 30 h28z" fill="#999"/>${[...Array(13)].map((_,i) => `<path d="M${30+i*20} 54 v12" stroke="#fff" stroke-width="1.5"/>`).join('')}
        <path d="M${150-d1*20} 62 v18" stroke="#555"/><rect x="${150-d1*20-14}" y="80" width="28" height="20" fill="#FFB347"/>${S_TXT(150-d1*20,95,w+'g','font-size="11"')}
        <path d="M${150+d2*20} 62 v18" stroke="#555"/><rect x="${150+d2*20-14}" y="80" width="28" height="20" fill="#9ED3A0"/>${S_TXT(150+d2*20,95,'？','font-size="12"')}${S_TXT(150-d1*10,50,d1,'font-size="11"')}${S_TXT(150+d2*10,50,d2,'font-size="11"')}</svg>`);
      out.steps.push('つり合う とき：左の（重さ × きょり）＝ 右の（重さ × きょり）', `${w} × ${d1} = ${w*d1}`, `□ × ${d2} = ${w*d1} → □ = ${w*d1} ÷ ${d2} = <b>${ans}</b>`); return out; } }
  if(u==='r_calc'){ const h = p.hint || ''; out.steps.push(`こうしき：<b>${X(h)}</b>`); const f = findExpr(boldNums(p.q), ans); if(f) out.steps.push(`しき：${f.e} = <b>${X(ans)}</b>`); out.tip = 'こうしきを 書いてから 数を あてはめよう'; return out; }
  const fk = SCI_FIGK[u]; if(fk && SCI_FIG[fk]) out.figs.push(SCI_FIG[fk]);
  /* 絵の 問題：正しい 絵と えらんだ 絵 */
  const PICS = (BUGS||[]).concat(PLANTS||[], SKY||[]); const pa = PICS.find(x => x[1]===ans), pv = v ? PICS.find(x => x[1]===v) : null;
  if((u==='r_bugpic' || u==='r_plantpic' || u==='r_sky' || u==='r_moon') && pa) out.figs.unshift(`<div class="pp56"><span class="ok">${SPIC(pa[0])}<b>🔴 ${X(pa[1])}</b></span>${pv && pv!==pa ? `<span class="ng">${SPIC(pv[0])}<b>🔵 ${X(pv[1])}</b></span>` : ''}</div>`);
  if(/こん虫/.test(t) && /こん虫/.test(ans)) out.steps.push(ans==='こん虫' ? `${X(p.sub||'')}は あしが 6本・からだが 3つ → こん虫` : `${X(p.sub||'')}は あしが 8本 → こん虫では ない`);
  out.steps.push(`<b>${X(stripQ(t))}</b> → <b class="okc">${X(ans)}</b>`);
  if(!out.figs.length && p.disp) out.figs.push(`<div class="dp56">${p.disp}</div>`);
  return out;
}
const stripQ = t => t.replace(/[？?]\s*$/,'').replace(/は$/,'');

/* =====================================================================
   こくごの かいせつ
   ===================================================================== */
const JOSHI = {'は':'話の テーマ（〜について いうと）','が':'だれが・なにが（主語）を はっきり しめす','を':'うごきの あいて（〜を する）','に':'行き先・時・あいて（〜に 行く・〜に あげる）','へ':'むかう ほうこう（〜へ 行く）',
  'で':'ばしょ・どうぐ（〜で あそぶ・〜で 書く）','と':'いっしょに する あいて・ならべる（友だちと）','も':'ほかと 同じ（ぼくも）','から':'はじまり（〜から）','まで':'おわり（〜まで）','の':'もちぬし（〜の 本）','や':'いくつか ならべる（〜や 〜）'};
const SETSU = [['順接（だから）','前の ことが りゆうで、思った とおりの けっか','だから・それで・すると・そこで','#9ED3A0'],['逆接（でも）','前の ことから 思うのと はんたいの けっか','でも・しかし・けれども・ところが','#FFB3B3'],
  ['並列・添加（そして）','つけたす・ならべる','そして・それから・しかも・また','#BFD9F5'],['選択（それとも）','どちらかを えらぶ','それとも・または','#FFE2A8'],['説明・例示（なぜなら・たとえば）','りゆうや れいを いう','なぜなら・たとえば・つまり','#E3D3FF'],['転換（ところで）','話を かえる','ところで・さて','#E0E0E0']];
function bunExp(p, v){
  const u = p.u, ans = String(p.ans), out = {figs:[], steps:[], tip:'', why:''}, sub = String(p.sub||'');
  const filled = sub.replace(/\[([^\]]+)\]/g, '<b class="fill56">$1</b>');
  if(u==='b_joshi'){ out.steps.push(`正しい 文：${filled}`); if(JOSHI[ans]) out.steps.push(`「<b>${X(ans)}</b>」＝ ${X(JOSHI[ans])}`); if(v && JOSHI[v] && v!==ans) out.steps.push(`🔵 きみが えらんだ「${X(v)}」＝ ${X(JOSHI[v])}`);
    out.figs.push(`<div class="jo56">${Object.entries(JOSHI).slice(0,8).map(([k,d]) => `<span class="${k===ans?'ok':k===v?'ng':''}"><b>${k}</b><small>${X(d)}</small></span>`).join('')}</div>`);
    out.tip = 'こえに 出して 読んで、しぜんに きこえるか たしかめよう'; return out; }
  if(u==='b_setsu'){ const g = SETSU.find(s => s[2].split('・').includes(ans)), gv = SETSU.find(s => s[2].split('・').includes(v));
    out.steps.push(`正しい 文：${filled}`); if(g) out.steps.push(`「<b>${X(ans)}</b>」は <b>${g[0]}</b>：${g[1]}`); if(gv && gv!==g) out.why = `「${v}」は ${gv[0]}。${gv[1]} ときに つかうよ`;
    out.figs.push(`<div class="st56">${SETSU.map(s => `<span style="background:${s[3]}" class="${s===g?'ok':s===gv?'ng':''}"><b>${s[0]}</b><small>${s[2]}</small></span>`).join('')}</div>`);
    out.tip = '前の 文と 後ろの 文が「思った とおり」か「はんたい」かを 考えよう'; return out; }
  if(u==='b_svo'){ const isP = /述語/.test(p.q), s = sub; const hl = s.replace(ans, `<b class="${isP?'pr56':'sj56'}">${X(ans)}</b>`);
    out.steps.push(`文：${hl}`, isP ? '述語は「どうする・どんなだ・なんだ」に あたる ことば。文の <b>さいご</b>に あることが 多い' : '主語は「だれが・なにが（は）」に あたる ことば。「〜が」「〜は」が ついているよ');
    out.figs.push(`<div class="svo56"><span class="sj56">だれが（は）<br><small>主語</small></span><i>→</i><span class="pr56">どうする<br><small>述語</small></span></div>`); out.tip = 'まず 述語（さいごの ことば）を 見つけてから、「だれが？」と 聞いて 主語を さがそう'; return out; }
  if(u==='b_ten'){ out.steps.push(`正しい：<b>${X(ans)}</b>`, '「。」（句点）は 文の おわり', '「、」（読点）は いみの 切れめ・読みやすく する ところ', '会話の「 」の 中の おわりにも「。」を つける'); return out; }
  if(u==='b_tsunagu'){ const k = ans.match(/ので|から|けれど|が、|て、|てから|し、/); const kind = !k ? '' : /ので|から/.test(k[0]) ? 'りゆう → けっか（ので・から）' : /けれど|が、/.test(k[0]) ? 'はんたいの けっか（けれど・が）' : /てから/.test(k[0]) ? 'じゅんばん（〜してから）' : 'つづけて（て）';
    out.steps.push(`正しい 文：<b>${X(ans)}</b>`, kind ? `つなぎかた：${kind}` : ''); if(v) out.why = '前と 後ろの つながり（りゆう？ はんたい？ じゅんばん？）を たしかめよう'; return out; }
  return out;
}
function kanjiExp(q, kind){
  const ks = String(q.word).split('').filter(c => /[\u4E00-\u9FFF]/.test(c));
  const more = ks.map(k => { const L = BUILTIN.filter(x => x!==q && x.word.includes(k)).slice(0,3); return L.length ? `<div class="kx56"><b>${k}</b>${L.map(x => `<span>${X(x.word)}（${X(x.reading)}）</span>`).join('')}</div>` : ''; }).join('');
  return {figs:[`<div class="kc56"><ruby>${X(q.word)}<rt>${X(q.reading)}</rt></ruby><p>${X(q.pre||'')}<u>${X(q.word)}</u>${X(q.post||'')}</p></div>`], steps:[kind==='write' ? `「${X(q.reading)}${X((q.post||'').match(/^[ぁ-ん]*/)[0])}」は「<b>${X(q.word)}</b>」と 書くよ。一画ずつ ていねいに なぞってみよう` : `「${X(q.word)}」は「<b>${X(q.reading)}</b>」と 読むよ`].concat(more ? [`同じ 漢字を つかう ことば：${more}`] : []), tip:'声に 出して 読み、ゆびで 空中に 書くと おぼえやすいよ', why:''};
}

/* =====================================================================
   かいせつカード
   ===================================================================== */
const SUBJ = u => { const g = MATH_UNITS[u]?.g; return typeof g==='number' || g==='now' || g==='next' || g==='low' ? 'math' : g==='sci' ? 'sci' : g==='soc' ? 'soc' : g==='bun' ? 'bun' : null; };
const SUBJ_N = {math:'さんすう', sci:'りか', soc:'しゃかい', bun:'こくご', kanji:'こくご（漢字）'};
function explain(p, v, opt={}){
  let r = null; const s = opt.kq ? 'kanji' : SUBJ(p?.u);
  if(!s) return '';
  try{ r = (!opt.kq && window.__unitExp66 && window.__unitExp66(p, v)) || null; if(!r) r = s==='kanji' ? kanjiExp(opt.kq, opt.kind) : s==='math' ? mathExp(p, v) : s==='soc' ? socExp(p, v) : s==='sci' ? sciExp(p, v) : bunExp(p, v); }catch(e){ console.warn('explain', e); r = null; }
  if(!r) r = {figs:[], steps:[], tip:'', why:''};
  const shw = s==='kanji' ? '' : p.type==='rem' ? String(p.ans).replace('|',' あまり ') : String(p.ans);
  const vv = v==null || v==='' ? '' : String(v).replace('|',' あまり ');
  const head = s==='kanji' ? '' : `<div class="ex56Ans"><span class="ok">⭕ 正しい こたえ <b>${X(shw)}</b></span>${vv ? `<span class="ng">❌ きみの こたえ <b>${X(vv)}</b></span>` : ''}</div>`;
  const fast = opt.sec != null && opt.sec < 3 ? '<div class="ex56Fast">⏱ こたえるのが はやすぎたかも？ もんだいを さいごまで 読んでから えらぼう</div>' : '';
  const H56 = `<div class="ex56 s-${s}"><div class="ex56Hd"><img src="${X(artSrc('bird_think')||'')}" alt=""><b>📖 シマくんの かいせつ</b><small>${SUBJ_N[s]||''}</small></div>${fast}${head}
    ${r.why ? `<div class="ex56Why">🔍 ${r.why}</div>` : ''}
    ${r.figs.filter(Boolean).length ? `<div class="ex56Fig">${r.figs.filter(Boolean).join('')}</div>` : ''}
    ${r.steps.filter(Boolean).length ? `<ol class="ex56Steps">${r.steps.filter(Boolean).map(x => `<li>${x}</li>`).join('')}</ol>` : ''}
    ${r.tip ? `<div class="ex56Tip">💡 ${r.tip}</div>` : ''}</div>`;
  return window.__ruby60 ? window.__ruby60(H56, s) : H56;
}
window.__explain56 = explain;
/* よむ 時間：つぎへ ボタンを すこし まつ */
function holdBtn(btn, sec=3){
  if(!btn) return; const base = btn.textContent; let n = sec; btn.disabled = true; btn.classList.add('hold56'); btn.textContent = `📖 かいせつを よもう… ${n}`;
  const iv = setInterval(() => { n--; if(n <= 0 || !document.body.contains(btn)){ clearInterval(iv); btn.disabled = false; btn.classList.remove('hold56'); btn.textContent = base; return; } btn.textContent = `📖 かいせつを よもう… ${n}`; }, 1000);
}
/* さんすう・りか・しゃかい・こくご（MQ） */
mJudge = (orig => function(v){
  const was = MQ && MQ.done, p = MQ && MQ.list[MQ.i], sec = MQ ? (Date.now() - MQ.qt)/1000 : 99;
  const out = orig.apply(this, arguments);
  if(was || !p) return out;
  const last = MQ.res[MQ.res.length-1];
  if(last && !last.ok && SUBJ(p.u)){
    const uv = v ?? MQ.inp;
    $('#mFb').insertAdjacentHTML('beforeend', explain(p, uv, {sec}));
    holdBtn($('#mNext'), 3);
    setTimeout(() => { const e = $('#mFb .ex56'); if(e) e.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 120);
  }
  return out;
})(mJudge);
/* 漢字（れんしゅう） */
finalize = (orig => function(correct, opt={}){
  const was = !cur || cur.done, q = cur?.q, kind = S?.kind;
  const out = orig.apply(this, arguments);
  try{ if(!was && !correct && S && S.mode!=='test' && q && q.word){ $('#qFeedback').insertAdjacentHTML('beforeend', explain({}, '', {kq:q, kind})); } }catch(e){ console.warn(e); }
  return out;
})(finalize);
/* 住民・カフェなどの 問題：まちがえたら かいせつ */
let LASTPICK = null;
document.addEventListener('click', e => { const b = e.target.closest('#dlgBtns button'); if(b) LASTPICK = b.textContent.trim(); }, true);
mqFromP = (orig => function(p, u){ const m = orig.apply(this, arguments); if(m && p){ m.p56 = Object.assign({}, p, {u: u || p.u}); } return m; })(mqFromP);
weakToMQ = (orig => function(it){ const m = orig.apply(this, arguments); if(m && it && it.w && m.p56) m.p56.u = it.w.u || m.p56.u; return m; })(weakToMQ);
kanjiMQ = (orig => function(q, weak){ const m = orig.apply(this, arguments); if(m) m.kq56 = q; return m; })(kanjiMQ);
miniQuiz = (orig => async function(who, title){
  LASTPICK = null; const t0 = Date.now();
  const res = await orig.apply(this, arguments);
  try{
    const m = LASTMQ;
    if(res && !res.ok && m){
      const html = m.kq56 ? explain({}, '', {kq:m.kq56, kind:'read'}) : m.p56 && SUBJ(m.p56.u) ? explain(m.p56, LASTPICK, {sec:(Date.now()-t0)/1000}) : '';
      if(html){ const pr = dialog(`${who ? `<div class="mqHead"><span class="mqWho">${resPic(who)}</span><b>${X(who.name||'')}「いっしょに たしかめよう！」</b></div>` : ''}${html}`, [{label:'わかった！', cls:'gold', v:1}], 'wide ex56Dlg');
        setTimeout(() => holdBtn($('#dlgBtns button'), 2), 30); await pr; }
    }
  }catch(e){ console.warn(e); }
  return res;
})(miniQuiz);

/* =====================================================================
   ③ れんぞく せいかい ボーナス
   ===================================================================== */
const STREAK = n => n===3 ? 5 : n===5 ? 15 : n===7 ? 20 : n===10 ? 50 : n > 10 && n % 5===0 ? 50 : 0;
function streakFx(n, pt, host){
  if(!host) return;
  host.insertAdjacentHTML('beforeend', `<div class="stk56"><b>🔥 ${n}れんぞく せいかい！</b>${pt ? `<span>れんぞくボーナス +${pt}pt</span>` : ''}</div>`);
  if(pt){ sound('fan'); if(n >= 10) confetti(1400); const b = document.createElement('div'); b.className = 'stkPop56'; b.innerHTML = `🔥<b>${n}</b><small>れんぞく！</small>`; document.body.appendChild(b); setTimeout(() => b.remove(), 1500); }
  const st = save.streak56 || (save.streak56 = {best:0}); if(n > st.best){ st.best = n; persist(); }
}
mJudge = (orig => function(v){
  const was = MQ && MQ.done; const out = orig.apply(this, arguments);
  if(!was && MQ){ const ok = MQ.res[MQ.res.length-1]?.ok, n = MQ.combo || 0;
    if(ok && n >= 2){ const b = STREAK(n); let got = 0; if(b){ got = givePts(b, `${n}れんぞく せいかい ボーナス`); MQ.pts += got; } streakFx(n, got, $('#mFb')); }
    MQ.best56 = Math.max(MQ.best56||0, n); }
  return out;
})(mJudge);
finalize = (orig => function(correct, opt={}){
  const was = !cur || cur.done; const out = orig.apply(this, arguments);
  try{ if(!was && correct && S && S.mode==='practice' && !S.inBonus && S.combo >= 2){ const n = S.combo, b = STREAK(n); let got = 0; if(b){ got = givePts(b, `${n}れんぞく せいかい ボーナス`); } streakFx(n, got, $('#qFeedback')); } }catch(e){ console.warn(e); }
  return out;
})(finalize);
try{ engJudge = (orig => function(r){
  const q = ES?.qs?.[ES.i], ph = ES?.phase; const res = orig.apply(this, arguments);
  try{ if(q && ph==='judge'){ ES.cmb56 = r==='o' ? (ES.cmb56||0) + 1 : 0; const n = ES.cmb56, b = STREAK(n); if(r==='o' && n >= 3){ let got = 0; if(b) got = givePts(b, `えいご ${n}れんぞく ボーナス`); toast(`🔥 ${n}れんぞく！${got ? ` +${got}pt` : ''}`); } } }catch(e){}
  return res;
})(engJudge); }catch(e){}

/* =====================================================================
   ② ものがたりが すすむと ねだんが 上がる
   ===================================================================== */
const chDone = () => (typeof CH_ORDER!=='undefined' ? CH_ORDER : []).filter(id => save.story && save.story[id]).length;
function inflRate(){ const n = chDone(); const T = [1, 1, 1.15, 1.35, 1.6, 1.9, 2.25]; return n < T.length ? T[n] : 2.25 + 0.35*(n - 6); }
const nice = v => v < 50 ? Math.round(v/5)*5 : v < 1000 ? Math.round(v/10)*10 : Math.round(v/50)*50;
let INF_NOW = 0;
function applyInfl(){
  const m = inflRate(); if(m === INF_NOW) return; INF_NOW = m;
  const sc = (o, key='price', soft) => { if(!o || typeof o[key]!=='number' && o[key+'0']==null) return; if(o[key+'0']==null) o[key+'0'] = o[key]; const k = soft ? 1 + (m-1)*0.5 : m; o[key] = o[key+'0'] ? nice(o[key+'0'] * k) : 0; };
  try{ TOWN_ITEMS.forEach(it => sc(it, 'price', it.cat==='road' || it.cat==='rail' || /^road|^rail/.test(it.id))); }catch(e){}
  try{ FURNITURE.forEach(f => sc(f)); }catch(e){}
  try{ ROOMS.forEach(r => sc(r)); }catch(e){}
  try{ (typeof WALLS!=='undefined' ? WALLS : []).forEach(w => sc(w)); (typeof FLOORS!=='undefined' ? FLOORS : []).forEach(w => sc(w)); }catch(e){}
  try{ (window.CAFE_UP||[]).forEach(c => c && sc(c, 'p')); }catch(e){}
}
function inflNotice(){
  const m = inflRate(); const S2 = save.infl56 || (save.infl56 = {m:1});
  if(m > S2.m + 1e-9 && !$('#dlg').classList.contains('show') && !$('#story')?.classList.contains('show')){
    S2.m = m; persist();
    dialog(`<div class="dlgArt big"><img src="${X(artSrc('bird_think')||'')}" alt=""></div><h2 class="dlgT">📈 まちの ねだんが 上がったよ</h2>
      <p class="dlgP">ものがたりが すすんで まちが にぎやかに なったので、<br>たてもの・かぐ・へや・カフェの グレードアップの ねだんが<br><b>はじめの ${m.toFixed(2).replace(/0$/,'')}ばい</b> に なったよ。</p>
      <p class="dlgP facNote">みちと せんろは すこしだけ 上がるよ。<br>カフェや べんきょうで ポイントを ためよう！</p>`, [{label:'わかった！', cls:'gold', v:1}], 'wide');
  } else if(m < S2.m) { S2.m = m; persist(); }
}
applyInfl();
setInterval(() => { applyInfl(); if(curScreen==='town' || curScreen==='home') inflNotice(); }, 4000);

/* =====================================================================
   ④ 学年の せってい
   ===================================================================== */
const gradeNow = () => Number(save.settings?.grade56 || 0);   // 0：せってい しない、1〜6：小学、7：中学生
const GN = g => g===7 ? '中学生' : `小学${g}年`;
/* 1・2年生むけの かんたんな さんすう（とつぜんの 問題だけで つかう） */
const LOWU = {
  low1:{n:'1年の さんすう', g:'low', art:'mi_blocks', gen(){ const k = ri(0,3);
    if(k===0){ const a = ri(1,9), b = ri(1,9); return {type:'num', q:`<b>${a} ＋ ${b}</b>`, ans:String(a+b), hint:'10の まとまりを つくろう'}; }
    if(k===1){ const a = ri(6,18), b = ri(1, Math.min(9,a)); return {type:'num', q:`<b>${a} − ${b}</b>`, ans:String(a-b), hint:'10から ひいても いいよ'}; }
    if(k===2){ const a = ri(2,9), b = ri(1,9-1); return {type:'num', q:`あめが <b>${a}こ</b> あります。<b>${b}こ</b> もらうと ぜんぶで 何こ？`, ans:String(a+b), hint:'あわせると'}; }
    const t = ri(1,9); return {type:'num', q:`10が 1こと 1が <b>${t}こ</b>で いくつ？`, ans:String(10+t), hint:'10と いくつ'}; }},
  low2:{n:'2年の さんすう', g:'low', art:'mi_mul', gen(){ const k = ri(0,3);
    if(k===0){ const a = ri(2,9), b = ri(1,9); return {type:'num', q:`<b>${a} × ${b}</b>`, ans:String(a*b), hint:`${a}の だんの 九九`}; }
    if(k===1){ const a = ri(12,78), b = ri(11,99-a); return {type:'num', q:`<b>${a} ＋ ${b}</b>`, ans:String(a+b), hint:'一の位から たそう'}; }
    if(k===2){ const a = ri(40,99), b = ri(11,a-10); return {type:'num', q:`<b>${a} − ${b}</b>`, ans:String(a-b), hint:'一の位から ひこう'}; }
    const a = ri(2,9), b = ri(2,5); return {type:'num', q:`1ふくろ <b>${a}こ</b>いりの あめが <b>${b}ふくろ</b>。ぜんぶで 何こ？`, ans:String(a*b), hint:`${a}が ${b}こ分`}; }}
};
Object.entries(LOWU).forEach(([k,u]) => { if(!MATH_UNITS[k]) MATH_UNITS[k] = u; });
function gradePools(g){
  const mathNum = Object.keys(MATH_UNITS).filter(k => typeof MATH_UNITS[k].g==='number');
  const mg = (lo, hi) => mathNum.filter(k => MATH_UNITS[k].g >= lo && MATH_UNITS[k].g <= hi);
  const lv = (map, ls) => Object.keys(map).filter(k => MATH_UNITS[k] && ls.includes(map[k]));
  const P = {};
  P.math = g===1 ? ['low1'] : g===2 ? ['low2','low1'] : g===3 ? mg(3,3).concat('low2') : g===4 ? mg(3,4) : g===5 ? mg(4,5) : mg(5,5).concat(mg(4,4));
  P.sci = g<=2 ? ['r_bugpic','r_plantpic'] : g<=4 ? lv(SCI_LV,[1]) : g<=6 ? lv(SCI_LV,[1,2]).filter(k => SCI_LV[k]===2 || Math.random() < .3) : lv(SCI_LV,[2,3]);
  P.soc = g<=2 ? ['s_life','s_old'] : g<=4 ? lv(SOC_LV,[1]) : g<=6 ? lv(SOC_LV,[1,2]).filter(k => SOC_LV[k]===2 || Math.random() < .3) : lv(SOC_LV,[2,3]);
  P.bun = g<=2 ? ['b_joshi'] : g<=4 ? ['b_joshi','b_setsu','b_svo','b_ten'] : Object.keys(BUN_LV);
  P.ek = g<=2 ? lv(EK_LV,[1]) : g<=4 ? lv(EK_LV,[1,2]) : lv(EK_LV,[2,3]);
  P.prog = g>=5 ? Object.keys(MATH_UNITS).filter(k => k.startsWith('pr_') && (MATH_UNITS[k].lv||1) <= (g>=7 ? 3 : 2)) : [];
  Object.keys(P).forEach(k => { P[k] = P[k].filter(u => MATH_UNITS[u]); });
  const KQ = BUILTIN.concat(typeof customQs!=='undefined' ? customQs : []);
  P.kanji = KQ.filter(q => g>=7 ? true : (q.grade||3) <= g && (q.grade||3) >= Math.max(1, g-1));
  if(!P.kanji.length) P.kanji = KQ.filter(q => (q.grade||3) <= g);
  return P;
}
const KW = g => g<=2 ? [['kanji',1.3],['math',1.5],['bun',.6],['sci',.4],['soc',.3],['ek',.5]] : g<=4 ? [['kanji',1.1],['math',1.2],['sci',1],['soc',1],['bun',.6],['ek',.6]] : [['kanji',1],['math',1.2],['sci',1],['soc',1],['bun',.5],['ek',.6],['prog',.4]];
function fitsGrade(m, g, P){
  if(m.kq56 || m.kq) { const q = m.kq56 || m.kq; return g>=7 || (q.grade||1) <= g; }
  const u = m.p56?.u; if(!u) return true;
  if(Object.values(P).some(L => Array.isArray(L) && L.includes(u))) return true;
  const ug = MATH_UNITS[u]?.g; return typeof ug==='number' && g >= 3 && ug <= g && ug >= g - 2;
}
makeMQ = (orig => function(opt={}){
  const g = gradeNow();
  if(!g || opt && opt.weakOnly) return orig.apply(this, arguments);
  const P = gradePools(g), M = mqMem();
  if(Math.random() < 0.3){ try{ const W = weakItems(); for(const it of shuffle(W).slice(0,6)){ const m = weakToMQ(it); if(m && fitsGrade(m, g, P)){ noteMQ(m, it.kind); return m; } } }catch(e){} }
  const kinds = KW(g).filter(([k]) => k==='kanji' ? P.kanji.length : (P[k]||[]).length).map(([k,w]) => [k, w * (M.kinds[0]===k ? 0.15 : M.kinds[1]===k ? 0.5 : 1)]);
  for(let tries=0; tries<40; tries++){
    let r = Math.random()*kinds.reduce((a,[,w])=>a+w,0), kind = kinds[0][0];
    for(const [k,w] of kinds){ r -= w; if(r<=0){ kind = k; break; } }
    let m = null;
    if(kind==='kanji') m = kanjiMQ(choice(P.kanji), false);
    else { const u = choice(P[kind]); try{ m = mqFromP(MATH_UNITS[u].gen(), u); }catch(e){ m = null; } }
    if(!m || M.recent.includes(m.key)) continue;
    noteMQ(m, kind==='bun' || kind==='prog' ? 'math' : kind); return m;
  }
  return orig.apply(this, arguments);
})(makeMQ);

/* =====================================================================
   ⑤ 大きな まちの「かるい 表示」
   ===================================================================== */
const LITE_LV = 10, LITE_ZOOM = 0.85, LITE_WALK = 16, LITE_CAR = 8;
function liteOn(){
  const s = save.settings?.lite56 || 'auto';
  if(s==='on') return true; if(s==='off') return false;
  return !!save.town && (save.town.lv||0) + 1 >= LITE_LV && (save.town.zoom||1) <= LITE_ZOOM;
}
function applyLite(){
  const m = $('#townMap'); if(!m) return;
  const on = liteOn(); m.classList.toggle('lite56', on);
  if(on){ m.querySelectorAll('.walker').forEach((e,i) => { e.dataset.off56 = i >= LITE_WALK ? 1 : 0; }); m.querySelectorAll('.car2').forEach((e,i) => { e.dataset.off56 = i >= LITE_CAR ? 1 : 0; }); }
  else m.querySelectorAll('[data-off56]').forEach(e => { e.dataset.off56 = 0; });
  const bar = $('.zoomBar'); if(bar){ let c = bar.querySelector('.lite56Tag'); if(on && !c){ bar.insertAdjacentHTML('beforeend', '<span class="lite56Tag" title="まちが 大きいので、うごきを へらして かるく しているよ">🍃 かるい表示</span>'); } else if(!on && c) c.remove(); }
}
renderMap = (orig => function(){ const o = orig.apply(this, arguments); try{ applyLite(); }catch(e){} return o; })(renderMap);
setInterval(() => { if(curScreen==='town' && !document.hidden) try{ applyLite(); }catch(e){} }, 3000);

/* =====================================================================
   せってい：学年・まちの 表示
   ===================================================================== */
renderSettings = (orig => function(){
  const o = orig.apply(this, arguments);
  try{
    const host = $('#segBonus')?.closest('.setSec') || $('#segBonus')?.parentElement;
    let box = $('#set56');
    if(!box && host){ host.insertAdjacentHTML('afterend', `<div class="setSec" id="set56"><h3>🎒 学年と まちの 表示</h3>
      <div class="row"><div class="lab">いまの 学年<br><small>住民・カフェ・おばけなどの とつぜんの 問題が この 学年に あわせて 出るよ</small></div><div class="seg wrap56" id="segGrade56">${[0,1,2,3,4,5,6,7].map(g => `<button data-v="${g}">${g ? (g===7 ? '中学' : g+'年') : 'なし'}</button>`).join('')}</div></div>
      <div class="row"><div class="lab">まちの 表示<br><small>「じどう」：まちLv10いじょうで ちいさく 見ている とき、うごきを へらして かるく するよ</small></div><div class="seg" id="segLite56"><button data-v="auto">じどう</button><button data-v="off">きれい</button><button data-v="on">かるい</button></div></div>
      <div class="note" id="infl56Note"></div></div>`); box = $('#set56');
      $('#segGrade56').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; save.settings.grade56 = Number(b.dataset.v); persist(); sound('tap'); renderSettings(); toast(save.settings.grade56 ? `🎒 ${GN(save.settings.grade56)}に あわせるよ` : '🎒 学年の せっていを はずしたよ'); });
      $('#segLite56').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; save.settings.lite56 = b.dataset.v; persist(); sound('tap'); renderSettings(); }); }
    syncSeg('segGrade56', String(save.settings.grade56||0)); syncSeg('segLite56', save.settings.lite56||'auto');
    const n = $('#infl56Note'); if(n) n.innerHTML = `📈 いまの ねだん：はじめの <b>${inflRate().toFixed(2).replace(/0$/,'')}ばい</b>（ものがたり ${chDone()}しょう まで よんだ）　🔥 れんぞく せいかい さいこう記録：<b>${save.streak56?.best||0}</b>`;
    const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER56}`;
  }catch(e){ console.warn(e); }
  return o;
})(renderSettings);
window.__v56 = {explain, mathExp, socExp, sciExp, bunExp, gradePools, inflRate, applyInfl, liteOn, STREAK};
})();

/* =====================================================================
   まなびタウン v5.7
   ① 4・5・6年生の 漢字（各学年の 配当漢字 ぜんぶ）を ついか
   ② せってい学年より 下の 学年の 問題は、せいかいしても ポイントが ひくめ
   ===================================================================== */
(function(){
'use strict';
const VER57 = '5.7.0';
const K456 = `#4
愛|ペットを [愛]する。|あい
案|いい [案]が うかんだ。|あん
以|十さい [以上]の 人。|いじょう
衣|[衣服]を たたむ。|いふく
位|[位]を そろえて 計算する。|くらい
茨|[茨城]県に 行く。|いばらき
印|地図に [印]を つける。|しるし
英|[英語]を 学ぶ。|えいご
栄|町が [栄]える。|さか
媛|[愛媛]県の みかん。|えひめ
塩|スープに [塩]を 入れる。|しお
岡|[静岡]県の お茶。|しずおか
億|一[億]円の たからもの。|おく
加|なかまに [加]わる。|くわ
果|[果物]を 食べる。|くだもの
貨|[金貨]を 見つけた。|きんか
課|[放課後]に あそぶ。|ほうかご
芽|たねから [芽]が 出た。|め
賀|[年賀]じょうを 書く。|ねんが
改|きまりを [改]める。|あらた
械|[機械]を 動かす。|きかい
害|虫の [害]を ふせぐ。|がい
街|[街]の あかりが きれいだ。|まち
各|[各地]で 雨が ふる。|かくち
覚|九九を [覚]える。|おぼ
潟|[新潟]県の お米。|にいがた
完|絵が [完成]した。|かんせい
官|[警官]に 道を 聞く。|けいかん
管|[管]で 水を 通す。|くだ
関|[玄関]で くつを ぬぐ。|げんかん
観|[観光]バスに のる。|かんこう
願|ゆめが かなうように [願]う。|ねが
岐|[岐阜]県の 川。|ぎふ
希|[希望]を もつ。|きぼう
季|[季節]が かわる。|きせつ
旗|[旗]を ふって おうえんする。|はた
器|[食器]を あらう。|しょっき
機|ひこう[機]に のる。|き
議|[会議]が はじまる。|かいぎ
求|たすけを [求]める。|もと
泣|赤ちゃんが [泣]く。|な
給|[給食]の 時間。|きゅうしょく
挙|手を [挙]げる。|あ
漁|[漁師]が 魚を とる。|りょうし
共|[共]に がんばろう。|とも
協|みんなで [協力]する。|きょうりょく
鏡|[鏡]を 見る。|かがみ
競|かけっこで [競]う。|きそ
極|[北極]の しろくま。|ほっきょく
熊|[熊本]県の おしろ。|くまもと
訓|ひなん[訓練]を する。|くんれん
軍|[軍手]を はめる。|ぐんて
郡|県の 中に 町や [郡]が ある。|ぐん
群|ひつじの [群]れ。|む
径|円の [直径]を はかる。|ちょっけい
景|きれいな [景色]。|けしき
芸|さるが [芸]を する。|げい
欠|かぜで 学校を [欠席]した。|けっせき
結|ひもを [結]ぶ。|むす
建|家を [建]てる。|た
健|[健]やかに そだつ。|すこ
験|理科の [実験]。|じっけん
固|ねんどが [固]まる。|かた
功|[成功]を いわう。|せいこう
好|ねこが [好]きだ。|す
香|花の [香]り。|かお
候|[天候]が わるい。|てんこう
康|[健康]に 気を つける。|けんこう
佐|[佐賀]県の やきもの。|さが
差|ねだんの [差]を くらべる。|さ
菜|[野菜]を 食べる。|やさい
最|[最後]まで はしる。|さいご
埼|[埼玉]県に すむ。|さいたま
材|[材料]を そろえる。|ざいりょう
崎|[長崎]県の しま。|ながさき
昨|[昨年]の 夏。|さくねん
札|お[札]で はらう。|さつ
刷|ポスターを [印刷]する。|いんさつ
察|あさがおの [観察]日記。|かんさつ
参|おまつりに [参加]する。|さんか
産|お米の [産地]を しらべる。|さんち
散|花びらが [散]る。|ち
残|きゅうしょくを [残]さない。|のこ
氏|[氏名]を 書く。|しめい
司|会の [司会]を する。|しかい
試|[試合]に かつ。|しあい
児|[児童]会の しごと。|じどう
治|けがが [治]る。|なお
滋|[滋賀]県の みずうみ。|しが
辞|[辞書]を ひく。|じしょ
鹿|[鹿]が 草を 食べる。|しか
失|だいじな ものを [失]う。|うしな
借|図書館で 本を [借]りる。|か
種|花の [種]を まく。|たね
周|池の [周]りを あるく。|まわ
祝|たん生日を [祝]う。|いわ
順|[順番]に ならぶ。|じゅんばん
初|[初]めて 海を 見た。|はじ
松|[松]の 木。|まつ
笑|みんなで [笑]う。|わら
唱|クラスで [合唱]を する。|がっしょう
焼|パンを [焼]く。|や
照|日が [照]る。|て
城|お[城]を 見に 行く。|しろ
縄|[縄]とびを する。|なわ
臣|[大臣]が 話す。|だいじん
信|友だちを [信]じる。|しん
井|[井戸]の 水。|いど
成|[成長]を よろこぶ。|せいちょう
省|むだを [省]く。|はぶ
清|[清]らかな 川。|きよ
静|[静]かに する。|しず
席|自分の [席]に すわる。|せき
積|雪が [積]もる。|つ
折|紙を [折]る。|お
節|[節分]に 豆を まく。|せつぶん
説|先生の [説明]を 聞く。|せつめい
浅|[浅]い 川で あそぶ。|あさ
戦|[作戦]を 立てる。|さくせん
選|すきな 本を [選]ぶ。|えら
然|[自然]を まもる。|しぜん
争|かけっこで [競争]する。|きょうそう
倉|[倉庫]に しまう。|そうこ
巣|鳥の [巣]。|す
束|[花束]を おくる。|はなたば
側|道の [右側]を あるく。|みぎがわ
続|雨の 日が [続]く。|つづ
卒|[卒業]しきに 出る。|そつぎょう
孫|おばあちゃんの [孫]。|まご
帯|ゆかたの [帯]を しめる。|おび
隊|たんけんたいの [隊長]に なる。|たいちょう
達|[友達]と あそぶ。|ともだち
単|英語の [単語]を おぼえる。|たんご
置|つくえに 本を [置]く。|お
仲|[仲]よく あそぶ。|なか
沖|[沖縄]県の 海。|おきなわ
兆|一[兆]円。|ちょう
低|[低]い 山。|ひく
底|海の [底]。|そこ
的|[的]に あてる。|まと
典|[辞典]で ことばを しらべる。|じてん
伝|気もちを [伝]える。|つた
徒|[生徒]が あつまる。|せいと
努|毎日 [努力]する。|どりょく
灯|[電灯]を つける。|でんとう
働|[働]く 人。|はたら
特|[特別]な 日。|とくべつ
徳|[道徳]の じゅぎょう。|どうとく
栃|[栃木]県の いちご。|とちぎ
奈|[奈良]県の 大ぶつ。|なら
梨|[山梨]県の ぶどう。|やまなし
熱|[熱]い スープ。|あつ
念|[記念]しゃしんを とる。|きねん
敗|しあいに [敗]れる。|やぶ
梅|[梅]の 花が さく。|うめ
博|[博物館]に 行く。|はくぶつかん
阪|[大阪]の たこやき。|おおさか
飯|朝ご[飯]を 食べる。|はん
飛|鳥が [飛]ぶ。|と
必|[必]ず 来てね。|かなら
票|学級委員を [投票]で きめる。|とうひょう
標|[目標]を きめる。|もくひょう
不|[不思議]な 話。|ふしぎ
夫|[夫]と つま。|おっと
付|名前を [付]ける。|つ
府|[京都府]に 行く。|きょうとふ
阜|[岐阜]県の ちょうちん。|ぎふ
富|[富士山]に のぼる。|ふじさん
副|[副会長]に えらばれた。|ふくかいちょう
兵|[兵庫]県の みなと。|ひょうご
別|友だちと [別]れる。|わか
辺|この [辺]りに ある。|あた
変|天気が [変]わる。|か
便|[便利]な どうぐ。|べんり
包|プレゼントを [包]む。|つつ
法|いい [方法]を 考える。|ほうほう
望|[望遠鏡]で 星を 見る。|ぼうえんきょう
牧|[牧場]の 牛。|ぼくじょう
末|[週末]に 出かける。|しゅうまつ
満|[満月]が きれいだ。|まんげつ
未|[未来]の 町。|みらい
民|[市民]の ひろば。|しみん
無|[無理]を しない。|むり
約|[約束]を まもる。|やくそく
勇|[勇気]を 出す。|ゆうき
要|[必要]な もの。|ひつよう
養|[栄養]を とる。|えいよう
浴|日光を [浴]びる。|あ
利|図書館を [利用]する。|りよう
陸|[大陸]を わたる。|たいりく
良|二人は なかが [良]い。|よ
料|[料理]を する。|りょうり
量|水の [量]を はかる。|りょう
輪|[車輪]が まわる。|しゃりん
類|[人類]の れきし。|じんるい
令|[号令]を かける。|ごうれい
冷|[冷]たい 水。|つめ
例|[例]を あげる。|れい
連|犬を [連]れて いく。|つ
老|[老人]ホーム。|ろうじん
労|[苦労]して 作った。|くろう
録|[記録]を とる。|きろく
#5
圧|台風で [気圧]が 下がる。|きあつ
囲|テーブルを [囲]む。|かこ
移|となりの 席に [移]る。|うつ
因|[原因]を さがす。|げんいん
永|[永遠]の 友だち。|えいえん
営|お店を [営]む。|いとな
衛|[衛生]に 気を つける。|えいせい
易|[易]しい 問題。|やさ
益|[利益]を 出す。|りえき
液|[液体]と 気体。|えきたい
演|げきで [演技]を する。|えんぎ
応|よびかけに [反応]する。|はんのう
往|[往復]の きっぷ。|おうふく
桜|[桜]が さく。|さくら
可|[可能]に する。|かのう
仮|[仮]の 名前。|かり
価|[物価]が 上がる。|ぶっか
河|[河口]に 鳥が いる。|かこう
過|時間が [過]ぎる。|す
快|[快]い 風。|こころよ
解|問題を [解]く。|と
格|しけんに [合格]する。|ごうかく
確|答えを [確]かめる。|たし
額|[金額]を 計算する。|きんがく
刊|[週刊]の ざっし。|しゅうかん
幹|木の [幹]。|みき
慣|新しい 学校に [慣]れる。|な
眼|[眼科]に 行く。|がんか
紀|二十一[世紀]。|せいき
基|[基本]を 学ぶ。|きほん
寄|友だちの 家に [寄]る。|よ
規|[規則]を まもる。|きそく
喜|みんなが [喜]ぶ。|よろこ
技|[技]を みがく。|わざ
義|[義務]を はたす。|ぎむ
逆|[逆]さまに する。|さか
久|[久]しぶりに 会う。|ひさ
旧|[旧友]に 会う。|きゅうゆう
救|人を [救]う。|すく
居|ねこが [居間]で ねる。|いま
許|ごめんね、[許]して。|ゆる
境|[国境]を こえる。|こっきょう
均|テストの [平均]点。|へいきん
禁|[禁止]の マーク。|きんし
句|[文句]を 言わない。|もんく
型|[大型]の トラック。|おおがた
経|時間が [経]つ。|た
潔|[清潔]な ハンカチ。|せいけつ
件|[事件]が おきた。|じけん
険|[危険]な 場所。|きけん
検|体の [検査]を うける。|けんさ
限|[限]られた 時間。|かぎ
現|すがたを [現]す。|あらわ
減|人数が [減]る。|へ
故|[故障]した テレビ。|こしょう
個|りんご 三[個]。|こ
護|動物を [保護]する。|ほご
効|くすりが [効]く。|き
厚|[厚]い 本。|あつ
耕|畑を [耕]す。|たがや
航|[航海]に 出る。|こうかい
鉱|[鉱石]を ほる。|こうせき
構|カメラを [構]える。|かま
興|虫に [興味]を もつ。|きょうみ
講|[講堂]に あつまる。|こうどう
告|先生に [報告]する。|ほうこく
混|絵の具を [混]ぜる。|ま
査|川の 水を [調査]する。|ちょうさ
再|[再]び 会う。|ふたた
災|[災害]に そなえる。|さいがい
妻|[妻]と 夫。|つま
採|こん虫を [採集]する。|さいしゅう
際|[国際]こうりゅう。|こくさい
在|[現在]の 気温。|げんざい
財|[財布]を おとした。|さいふ
罪|[罪]を つぐなう。|つみ
殺|足音を [殺]して あるく。|ころ
雑|[雑誌]を 読む。|ざっし
酸|[酸素]を すう。|さんそ
賛|その いけんに [賛成]する。|さんせい
士|[消防士]の しごと。|しょうぼうし
支|ぼうで [支]える。|ささ
史|日本の [歴史]を 学ぶ。|れきし
志|大きな [志]を もつ。|こころざし
枝|木の [枝]。|えだ
師|[教師]に なりたい。|きょうし
資|[資料]を あつめる。|しりょう
飼|犬を [飼]う。|か
示|道を [示]す。|しめ
似|母に [似]ている。|に
識|[知識]を ふやす。|ちしき
質|先生に [質問]する。|しつもん
舎|[校舎]の まど。|こうしゃ
謝|[感謝]の 気もち。|かんしゃ
授|[授業]が はじまる。|じゅぎょう
修|自転車を [修理]する。|しゅうり
述|いけんを [述]べる。|の
術|[美術]の 時間。|びじゅつ
準|遠足の [準備]を する。|じゅんび
序|[順序]よく ならべる。|じゅんじょ
招|友だちを [招]く。|まね
証|正しい ことを [証明]する。|しょうめい
象|動物園の [象]。|ぞう
賞|コンクールで [賞]を もらう。|しょう
条|[条件]を みたす。|じょうけん
状|[年賀状]を 書く。|ねんがじょう
常|[非常口]を たしかめる。|ひじょうぐち
情|[友情]を たいせつに する。|ゆうじょう
織|ぬのを [織]る。|お
職|[職員]室に 行く。|しょくいん
制|学校の [制服]。|せいふく
性|[性格]が やさしい。|せいかく
政|[政治]の しくみ。|せいじ
勢|[大勢]の 人。|おおぜい
精|[精]いっぱい がんばる。|せい
製|工場で [製品]を つくる。|せいひん
税|[税金]を はらう。|ぜいきん
責|[責任]を もつ。|せきにん
績|[成績]が 上がる。|せいせき
接|[直接]話す。|ちょくせつ
設|家の [設計]図を かく。|せっけい
絶|[絶対]に まけない。|ぜったい
祖|[祖母]の 家。|そぼ
素|[素直]な 子。|すなお
総|[総合]の 時間。|そうごう
造|船を [造]る。|つく
像|公園の [銅像]。|どうぞう
増|人が [増]える。|ふ
則|[反則]を しない。|はんそく
測|長さを [測]る。|はか
属|サッカー部に [所属]する。|しょぞく
率|[確率]を 計算する。|かくりつ
損|[損]を する。|そん
貸|本を [貸]す。|か
態|[態度]が よい。|たいど
団|[団体]で 行動する。|だんたい
断|さそいを [断]る。|ことわ
築|[建築]の 仕事。|けんちく
貯|お金を [貯]める。|た
張|ひもを [張]る。|は
停|[停電]に なる。|ていでん
提|しゅくだいを [提出]する。|ていしゅつ
程|[程度]を 考える。|ていど
適|ちょうど [適]した 場所。|てき
統|[伝統]の おまつり。|でんとう
堂|[食堂]で 食べる。|しょくどう
銅|[銅]メダル。|どう
導|先生の [指導]を うける。|しどう
得|[得意]な 教科。|とくい
毒|[毒]きのこに 気を つける。|どく
独|[独]りで 行く。|ひと
任|仕事を [任]せる。|まか
燃|木が [燃]える。|も
能|[能力]を いかす。|のうりょく
破|紙を [破]る。|やぶ
犯|[犯人]を つかまえる。|はんにん
判|正しく [判断]する。|はんだん
版|本を [出版]する。|しゅっぱん
比|せの 高さを [比]べる。|くら
肥|畑に [肥料]を まく。|ひりょう
非|[非常]ベルが なる。|ひじょう
費|旅行の [費用]。|ひよう
備|地しんに [備]える。|そな
評|[評判]の お店。|ひょうばん
貧|[貧]しい くらし。|まず
布|[布]で ふく。|ぬの
婦|[夫婦]で 出かける。|ふうふ
武|[武士]の 時代。|ぶし
復|[復習]を する。|ふくしゅう
複|[複雑]な 問題。|ふくざつ
仏|奈良の [大仏]。|だいぶつ
粉|[小麦粉]で パンを つくる。|こむぎこ
編|毛糸で セーターを [編]む。|あ
弁|お[弁当]を 食べる。|べんとう
保|[保健室]に 行く。|ほけんしつ
墓|お[墓]まいり。|はか
報|[天気予報]を 見る。|てんきよほう
豊|[豊]かな 自然。|ゆた
防|かぜを [予防]する。|よぼう
貿|[貿易]が さかんな 国。|ぼうえき
暴|[暴]れる 馬。|あば
脈|[脈]を はかる。|みゃく
務|[事務]の 仕事。|じむ
夢|ゆかいな [夢]を 見る。|ゆめ
迷|道に [迷]う。|まよ
綿|[綿]あめを 食べる。|わた
輸|外国から [輸入]する。|ゆにゅう
余|[余]った おかし。|あま
容|話の [内容]を まとめる。|ないよう
略|くわしい 説明を [省略]する。|しょうりゃく
留|[留守]番を する。|るす
領|アメリカの [大統領]。|だいとうりょう
歴|[歴代]の チャンピオン。|れきだい
#6
胃|[胃]が いたい。|い
異|二人の いけんが [異]なる。|こと
遺|[世界遺産]を 見に 行く。|せかいいさん
域|[地域]の おまつり。|ちいき
宇|[宇宙]に 行きたい。|うちゅう
映|[映画]を 見る。|えいが
延|しあいが [延]びる。|の
沿|川に [沿]って あるく。|そ
恩|先生の [恩]を わすれない。|おん
我|[我]が家の ルール。|わ
灰|[灰色]の 雲。|はいいろ
拡|写真を [拡大]する。|かくだい
革|[革]の くつ。|かわ
閣|[内閣]の 大臣。|ないかく
割|おさらを [割]る。|わ
株|木の [株]。|かぶ
干|ふとんを [干]す。|ほ
巻|糸を [巻]く。|ま
看|かぜの 弟を [看病]する。|かんびょう
簡|[簡単]な 問題。|かんたん
危|[危]ない！ 気を つけて。|あぶ
机|[机]の 上を かたづける。|つくえ
揮|合唱の [指揮]を する。|しき
貴|[貴重]な しりょう。|きちょう
疑|[疑問]に 思う。|ぎもん
吸|いきを [吸]う。|す
供|[子供]の 本。|こども
胸|[胸]を はる。|むね
郷|[故郷]に かえる。|こきょう
勤|会社に [勤]める。|つと
筋|[筋肉]を きたえる。|きんにく
系|[太陽系]の わく星。|たいようけい
敬|[敬語]を つかう。|けいご
警|[警察]に 電話する。|けいさつ
劇|学芸会で [劇]を する。|げき
激|[激]しい 雨。|はげ
穴|[穴]を ほる。|あな
券|[乗車券]を 買う。|じょうしゃけん
絹|[絹]の ハンカチ。|きぬ
権|みんなの [権利]を まもる。|けんり
憲|日本国[憲法]。|けんぽう
源|川の [水源]。|すいげん
厳|[厳]しい れんしゅう。|きび
己|[自己]しょうかいを する。|じこ
呼|名前を [呼]ぶ。|よ
誤|[誤]りを なおす。|あやま
后|[皇后]さま。|こうごう
孝|親[孝行]を する。|こうこう
皇|[天皇]の しごと。|てんのう
紅|山の [紅葉]が きれいだ。|こうよう
降|雨が [降]る。|ふ
鋼|[鉄鋼]の 工場。|てっこう
刻|[時刻]を たしかめる。|じこく
穀|米や 麦などの [穀物]。|こくもつ
骨|[骨]を おる。|ほね
困|[困]った ときは そうだんしよう。|こま
砂|[砂]はまで あそぶ。|すな
座|いすに [座]る。|すわ
済|しゅくだいが [済]む。|す
裁|[裁判]所で 話を 聞く。|さいばん
策|あつさ [対策]を 考える。|たいさく
冊|本を 三[冊] 読む。|さつ
蚕|[蚕]を そだてる。|かいこ
至|[冬至]の ゆず湯。|とうじ
私|[私]は 小学生です。|わたし
姿|[姿]を 見せる。|すがた
視|[視力]を はかる。|しりょく
詞|歌の [歌詞]を おぼえる。|かし
誌|[日誌]を 書く。|にっし
磁|[磁石]で あそぶ。|じしゃく
射|光が [反射]する。|はんしゃ
捨|ごみを [捨]てる。|す
尺|[尺八]を ふく。|しゃくはち
若|[若]い 人。|わか
樹|[樹木]を まもる。|じゅもく
収|お店の [収入]が ふえる。|しゅうにゅう
宗|[宗教]の れきし。|しゅうきょう
就|会社に [就職]する。|しゅうしょく
衆|[観衆]が わく。|かんしゅう
従|きまりに [従]う。|したが
縦|[縦]に ならぶ。|たて
縮|セーターが [縮]む。|ちぢ
熟|かきが [熟]す。|じゅく
純|[単純]な しくみ。|たんじゅん
処|ごみを [処理]する。|しょり
署|[消防署]の 見学。|しょうぼうしょ
諸|[諸国]を たびする。|しょこく
除|一つを [除]いて ぜんぶ 正しい。|のぞ
承|わかりました、[承知]しました。|しょうち
将|[将来]の ゆめ。|しょうらい
傷|[傷]が なおる。|きず
障|[障子]を はる。|しょうじ
蒸|[蒸気]きかん車。|じょうき
針|[針]と 糸。|はり
仁|お寺の [仁王]ぞう。|におう
垂|[垂直]な 線を ひく。|すいちょく
推|はんにんを [推理]する。|すいり
寸|服の [寸法]を はかる。|すんぽう
盛|ごはんを [盛]る。|も
聖|[聖火]ランナー。|せいか
誠|[誠実]な 人。|せいじつ
舌|[舌]を 出す。|した
宣|[宣言]する。|せんげん
専|[専門]の 先生。|せんもん
泉|[温泉]に 入る。|おんせん
洗|手を [洗]う。|あら
染|ぬのを [染]める。|そ
銭|[小銭]入れ。|こぜに
善|[善]い おこないを する。|よ
奏|ピアノを [演奏]する。|えんそう
窓|[窓]を あける。|まど
創|[創作]ダンス。|そうさく
装|[服装]を ととのえる。|ふくそう
層|[地層]を しらべる。|ちそう
操|[体操]を する。|たいそう
蔵|[冷蔵庫]に 入れる。|れいぞうこ
臓|[心臓]が どきどきする。|しんぞう
存|その ことは よく ご[存]じです。|ぞん
尊|[尊敬]する 人。|そんけい
退|[退場]する。|たいじょう
宅|[自宅]に もどる。|じたく
担|[担任]の 先生。|たんにん
探|たからものを [探]す。|さが
誕|[誕生日]おめでとう。|たんじょうび
段|[階段]を のぼる。|かいだん
暖|[暖]かい へや。|あたた
値|[値段]を 見る。|ねだん
宙|ボールが [宙]に うく。|ちゅう
忠|[忠実]な 犬。|ちゅうじつ
著|本の [著者]。|ちょしゃ
庁|[県庁]に 行く。|けんちょう
頂|山の [頂上]に つく。|ちょうじょう
腸|[大腸]の はたらき。|だいちょう
潮|[潮]が みちる。|しお
賃|[電車賃]を はらう。|でんしゃちん
痛|頭が [痛]い。|いた
敵|[敵]を たおす。|てき
展|[展覧会]に 行く。|てんらんかい
討|クラスで [討論]する。|とうろん
党|[政党]の 名前。|せいとう
糖|[砂糖]を 入れる。|さとう
届|手紙が [届]く。|とど
難|[難]しい 問題。|むずか
乳|[牛乳]を のむ。|ぎゅうにゅう
認|まちがいを [認]める。|みと
納|せつめいを 聞いて [納得]する。|なっとく
脳|[脳]の はたらき。|のう
派|[派手]な ふく。|はで
拝|手を あわせて [拝]む。|おが
背|[背]が のびる。|せ
肺|[肺]で いきを する。|はい
俳|[俳句]を つくる。|はいく
班|[班長]を きめる。|はんちょう
晩|[今晩]の ごはん。|こんばん
否|うわさを [否定]する。|ひてい
批|人の いけんを [批判]する。|ひはん
秘|[秘密]の 話。|ひみつ
俵|[米俵]を はこぶ。|こめだわら
腹|[腹]が へった。|はら
奮|しあいの 前に [興奮]する。|こうふん
並|[並]んで まつ。|なら
陛|天皇[陛下]。|へいか
閉|ドアを [閉]める。|し
片|おもちゃを [片]づける。|かた
補|足りない ぶんを [補]う。|おぎな
暮|いなかで [暮]らす。|く
宝|[宝]さがし。|たから
訪|友だちの 家を [訪]ねる。|たず
亡|ペットが [亡]くなる。|な
忘|[忘]れ物を する。|わす
棒|[鉄棒]で あそぶ。|てつぼう
枚|紙 三[枚]。|まい
幕|オリンピックが [開幕]する。|かいまく
密|ジャングルの [密林]。|みつりん
盟|[同盟]を むすぶ。|どうめい
模|船の [模型]を つくる。|もけい
訳|英語を [通訳]する。|つうやく
郵|[郵便]局に 行く。|ゆうびん
優|[優]しい 人。|やさ
預|お金を [預]ける。|あず
幼|[幼]い 弟。|おさな
欲|[欲]しい もの。|ほ
翌|遠足の [翌日]。|よくじつ
乱|かみが [乱]れる。|みだ
卵|[卵]を わる。|たまご
覧|[回覧]板を まわす。|かいらん
裏|紙の [裏]に 書く。|うら
律|[法律]を まもる。|ほうりつ
臨|[臨時]の 休み。|りんじ
朗|本を [朗読]する。|ろうどく
論|二人で [議論]する。|ぎろん`;
let g = 0; const seq = {};
K456.trim().split('\n').forEach(line => {
  if(line[0]==='#'){ g = Number(line.slice(1)); return; }
  const [k, t, r] = line.split('|'); seq[g] = (seq[g]||0) + 1;
  const id = 'K'+g+'-'+String(seq[g]).padStart(3,'0');
  if(BUILTIN.some(q => q.id===id)) return;
  const q = buildQ({id, grade:g, kanji:k, text:t, reading:r, type:'両方'}); if(q) BUILTIN.push(q);
});

/* ---------- 問題の 学年 ---------- */
const userG = () => Number(save.settings?.grade56 || 0);       // 0：せってい なし、7：中学生
const LVG = {soc:{1:3.5,2:5.5,3:7}, sci:{1:3.5,2:5.5,3:7}, ek:{1:2,2:3.5,3:5.5}, bun:{1:2.5,2:3.5,3:4.5}, prog:{1:5,2:5.5,3:6}};
function unitGrade(u){
  const U = MATH_UNITS[u]; if(!U) return 0;
  if(u==='low1') return 1; if(u==='low2') return 2;
  if(typeof U.g==='number') return U.g >= 5 ? 5.5 : U.g;            // 5年の たんげんは 5・6年 あつかい
  const lv = U.g==='soc' ? (SOC_LV[u]||U.lv) : U.g==='sci' ? (SCI_LV[u]||U.lv) : U.g==='ek' ? (EK_LV[u]||U.lv) : U.g==='bun' ? (BUN_LV[u]||U.lv) : U.lv;
  return (LVG[U.g]||{})[lv] || 0;
}
function multFor(qg){
  const ug = userG(); if(!ug || !qg) return 1;
  const d = ug - qg;
  return d <= 0.5 ? 1 : d <= 1.5 ? 0.7 : d <= 2.5 ? 0.5 : 0.3;
}
const gName = qg => qg >= 7 ? '中学生' : qg===5.5 ? '5・6年' : qg===3.5 ? '3・4年' : qg===2.5 ? '1・2年' : `${Math.floor(qg)}年`;
const lowTag = (qg, m) => `<span class="low57">📉 ${gName(qg)}の 問題なので ポイント ×${m}</span>`;

/* ---------- ポイントを へらす しくみ ---------- */
let PM = 1;
addPoints = (orig => function(pt, reason, silent){
  if(PM < 1 && pt > 0) pt = Math.max(1, Math.round(pt * PM));
  return orig.call(this, pt, reason, silent);
})(addPoints);
const holdPM = m => { PM = m; setTimeout(() => { PM = 1; }, 0); };

/* さんすう・りか・しゃかい・こくご・えいご・プログラミング */
mJudge = (orig => function(v){
  const was = MQ && MQ.done, p = MQ && MQ.list[MQ.i];
  if(was || !p) return orig.apply(this, arguments);
  const qg = unitGrade(p.u), m = multFor(qg);
  PM = m; let out;
  try{ out = orig.apply(this, arguments); } finally { PM = 1; }
  if(m < 1 && MQ.res[MQ.res.length-1]?.ok){ const fb = $('#mFb'); const pf = fb.querySelector('.ptFloat'); (pf || fb.firstElementChild || fb).insertAdjacentHTML('afterend', lowTag(qg, m)); }
  return out;
})(mJudge);
/* 漢字 */
finalize = (orig => function(correct, opt={}){
  const was = !cur || cur.done; if(was) return orig.apply(this, arguments);
  const qg = cur.q?.grade || 0, m = multFor(qg);
  PM = m; let out;
  try{ out = orig.apply(this, arguments); } finally { PM = 1; }
  try{ if(m < 1 && correct && S && S.mode!=='test') $('#qFeedback').insertAdjacentHTML('beforeend', lowTag(qg, m)); }catch(e){}
  return out;
})(finalize);
/* 住民・カフェ・おばけなどの 問題（こたえた すぐ あとの ポイントに かける） */
const mqGrade = m => m ? (m.kq56 ? m.kq56.grade : m.kq ? m.kq.grade : m.p56 ? unitGrade(m.p56.u) : 0) : 0;
miniQuiz = (orig => async function(){
  const res = await orig.apply(this, arguments);
  const m = multFor(mqGrade(LASTMQ)); if(m < 1 && res && res.ok){ holdPM(m); setTimeout(() => toast(`📉 ${gName(mqGrade(LASTMQ))}の 問題なので ポイント ×${m}`), 900); }
  return res;
})(miniQuiz);
askMQ = (orig => async function(mq){
  const res = await orig.apply(this, arguments);
  const m = multFor(mqGrade(mq)); if(m < 1 && res && res.ok) holdPM(m);
  return res;
})(askMQ);

/* ---------- 学年を えらんだら 漢字の 学年も あわせる ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('#segGrade56 button'); if(!b) return;
  const gg = Number(b.dataset.v);
  setTimeout(() => { if(gg >= 3 && gg <= 6 && BUILTIN.some(q => q.grade===gg)){ save.menu.grade = String(gg); persist(); } }, 0);
});
renderSettings = (orig => function(){
  const o = orig.apply(this, arguments);
  try{
    const n = $('#infl56Note');
    if(n && !n.querySelector('.low57n')) n.insertAdjacentHTML('beforeend', `<div class="low57n">📉 せってい学年より 下の 学年の 問題は、せいかいしても ポイントが へるよ（1学年下 ×0.7、2学年下 ×0.5、3学年いじょう下 ×0.3）</div>`);
    $('#importLog') && ($('#importLog').textContent = `いまの問題数：${allQs().length}問（初期 ${BUILTIN.length}問：3〜6年の 漢字 ＋ 追加 ${customQs.length}問）`);
    const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER57}`;
  }catch(e){}
  return o;
})(renderSettings);
window.__v57 = {unitGrade, multFor};
})();

/* =====================================================================
   まなびタウン v5.8：りかの かいせつを 問題ごとに
   ・294問 ぜんぶに その問題 専用の かいせつ
   ・絵で 答える 問題は 生き物・植物・天体ごとの 特ちょうと「見分けポイント」
   ・まちがえて えらんだ ことばの いみも 説明
   ・こん虫の 説明は イラスト、それ以外は 図
   ===================================================================== */
(function(){
'use strict';
const VER58 = '5.8.1';
const IL = './assets/images/v58/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const img = (k, cls='') => `<img class="il58 ${cls}" src="${X(k.startsWith('il_') ? IL + k + '.webp' : artSrc(k))}" alt="">`;
const EXP = {};   // 'unit|idx' → [fig, text]
"bug|0|il_ant_body|こん虫の からだは「あたま・むね・はら」の 3つに 分かれているよ。アリは くびれが はっきりしていて 見分けやすいね。\nbug|1|il_ant_body|こん虫の あしは かならず 6本（3対）。8本なら クモ、14本なら ダンゴムシの なかまだよ。\nbug|2|il_ant_body|6本の あしは ぜんぶ「むね」から 出ているよ。はねも むねに ついているんだ。\nbug|3|il_ant_body|目・しょっ角・口は「あたま」に あるよ。しょっ角で においを かいだり、まわりを さぐったり するんだ。\nbug|4|il_spider_ant|クモは あしが 8本で、からだは 2つに 分かれている。しょっ角も ない。だから こん虫では ないよ。\nbug|5|cyc_butterfly|チョウは たまご → よう虫（アオムシ） → さなぎ → せい虫 の じゅんに 育つ。さなぎの 時期が あるのが ポイント（完全変態）。\nbug|6|il_grass_cycle|バッタは たまご → よう虫 → せい虫。よう虫が そのまま 大きく なり、さなぎに ならない（不完全変態）。トンボ・セミ・カマキリも さなぎに ならないよ。\nbug|7|il_dragon_cycle|トンボの よう虫は 水の 中で くらす「ヤゴ」。水の 中で 小さな 生き物を 食べて 育ち、草に のぼって せい虫に なるよ。\nbug|8|il_cabbage|モンシロチョウは キャベツや アブラナの 葉に 1つずつ たまごを うむ。生まれた アオムシが その 葉を 食べて 育つからだよ。\nbug|9|il_underground|カブトムシの よう虫は 落ち葉が くさった やわらかい 土（ふよう土）の 中で、その 土を 食べて 育つよ。\nbug|10|il_underground|セミの よう虫は 土の 中で 木の 根から しるを すって、何年も かけて 育つ。夏に 地上に 出て きて せい虫に なるよ。\nbug|11|il_ant_body|はらの よこに「気門」という 小さな あなが ならんでいて、そこから 空気を 出し入れ しているよ。\nbug|12|il_winter|カマキリは 秋に えだに あわの ような「らんのう」を つくり、その 中の たまごで 冬を こすよ。\nbug|13|il_winter|テントウムシは せい虫の まま、落ち葉の 下などに あつまって じっと 冬を こすよ。\nbug|14||春は あたたかく なり、草花が そだち、こん虫も 活動を はじめる。生き物の 活動は さかんに なるよ。\nbug|15||ツバメは 春に 日本に 来て 子育てを し、秋に あたたかい 南の 国へ わたって いくよ。\nbug|16|il_dango|ダンゴムシは あしが 14本で、からだも 3つに 分かれていない。エビや カニに 近い なかまで、こん虫では ないよ。\nbug|17|il_ant_body|アリも こん虫なので あしは 6本。ぜんぶ むねから 出ているよ。\nplant|0|plantgrow|たねから 最初に 出る 葉は「子葉」。その あとに 出る ギザギザの 葉が「本葉」だよ。\nplant|1|roots|ホウセンカは 太い「主根」から 細い「側根」が 出る。イネや トウモロコシは ひげのような「ひげ根」だよ。\nplant|2|plant|植物の からだは 根・くき・葉で できている。「あし」は 動物の からだの 部分だよ。\nplant|3|plantgrow|花が さいて、花が かれた あとに たねが できる。ヒマワリは 花の まん中に たくさんの たねが できるよ。\nplant|4||ヘチマや ヒョウタンは あたたかい 夏に ぐんぐん くきを のばし、秋には かれて たねを のこすよ。\nplant|5|cherry|サクラの 葉は 秋に 赤や 黄色に なり、冬の 前に おちる。寒い 冬を 葉なしで こすためだよ。\nplant|6|cherry|冬の サクラの えだには、春に 花や 葉に なる「芽」が ついているよ。\nplant|7||植物は 日光を あびて 葉で 養分（でんぷん）を つくる。日光は 育つのに ひつようだよ。\nplant|8||アサガオの つるは ぼうや ネットに まきつきながら 上へ のびるよ。\nplant|9|rp_tulip|チューリップは 春に さく 花。ナノハナや サクラも 春だよ。ヒマワリ・アサガオは 夏、コスモスは 秋。\nplant|10|ri_sunflower|ヒマワリは 夏に 大きな 黄色い 花を さかせるよ。\nplant|11||コスモスは 秋に さく 花。ヒガンバナや キクも 秋の 花だよ。\nplant|12|rp_dandelion|タンポポの たねには わた毛が ついていて、風に のって 遠くへ とんでいくよ。\nplant|13|plant|根から 水を すい上げて、くきを 通って 葉まで 運ぶよ。\nsunlight|0|shadow|光は まっすぐ すすむので、ものに さえぎられた 太陽の 反対がわに かげが できるよ。\nsunlight|1|sunpath|太陽は 東から のぼり、南の 空を 通って、西に しずむよ。\nsunlight|2|sunpath|太陽は 東から のぼり、南を 通って 西に しずむよ。\nsunlight|3|sunpath|太陽は 昼ごろ（正午ごろ）、南の 空で いちばん 高く なるよ。\nsunlight|4|shadow|太陽が 東 → 南 → 西と 動くので、かげは 西 → 北 → 東へと 向きを かえるよ。\nsunlight|5||日光が 当たる 日なたの 地面は あたためられて、日かげより 温度が 高いよ。\nsunlight|6||虫めがね（とつレンズ）は 日光を 1か所に あつめられるよ。\nsunlight|7||光を 小さく あつめるほど、その ところは 明るく、あつく なるよ。こげる ことも あるので 注意！\nsunlight|8||かがみで はね返した 日光も まっすぐ すすむよ。\nsunlight|9||光が 当たった ものは、あたたかく なるよ。\nsunlight|10||方位じしんの 色の ついた はりは 北を さすよ。\nsunlight|11||音が 出ている ものは ふるえている。たいこや 声を 出す のどを さわると わかるよ。\nsunlight|12||大きい 音ほど、ふるえ方が 大きいよ。\nsunlight|13||糸電話は 声の ふるえが 糸を つたわって 相手に とどくよ。糸を つまむと ふるえが 止まり 聞こえなく なるよ。\nmagelec|0|mag|じしゃくに つくのは 鉄。アルミ・銅（10円玉）・プラスチックは つかないよ。\nmagelec|1|mag|じしゃくの 力は 両はしの「きょく（N極・S極）」が いちばん 強いよ。\nmagelec|2|mag|同じ きょくどうし（NとN、SとS）は しりぞけ合うよ。\nmagelec|3|mag|ちがう きょくどうし（NとS）は 引き合うよ。\nmagelec|4|mag|じしゃくに ついた 鉄は、それ自体が じしゃくに なり、ほかの 鉄を 引きつけるよ。\nmagelec|5|mag|地球は 大きな じしゃく。自由に 動く じしゃくの N極は 北を さすよ。\nmagelec|6|circuit|電気を 通すのは 金ぞく（鉄・銅・アルミなど）。紙・ゴム・木・プラスチックは 通さないよ。\nmagelec|7|circuit|プラスチックは 電気を 通さない。金ぞくは 通すよ。\nmagelec|8|circuit|かん電池の でっぱりが ある ほうが ＋極、平らな ほうが −極だよ。\nmagelec|9|circuit|＋極 → 豆電球 → −極 と「わ」の ように つながると 電気が 流れて 明かりが つくよ。\nmagelec|10|circuit|電気の 通り道を「回路」と いうよ。\nmagelec|11|series|直列つなぎは 電流が 大きく なるので、モーターは 速く 回り、豆電球は 明るく なるよ。\nmagelec|12|series|へい列つなぎは 電流の 大きさが 1この ときと ほぼ 同じ。明るさも 同じくらいで、長もち するよ。\nmagelec|13|circuit|電流の 向きを 反対に すると、モーターの 回る 向きも 反対に なるよ。\nmagelec|14||光電池は 当たる 光が 強いほど、大きな 電流が 流れるよ。\nmagelec|15||ゴムは 長く のばすほど、もとに もどろうとする 力が 大きく なるよ。\nmagelec|16||風が 強いほど、風車を おす 力が 大きく、速く 回るよ。\nsky|0|moon|月は 自分では 光らない。太陽の 光を はね返して 光って 見えるよ。\nsky|1|sunpath|月も 太陽と 同じく 東から のぼり、南を 通って、西に しずむよ。\nsky|2|moonorbit|満月は 太陽の 反対がわに あるので、夕方に 東から のぼり、真夜中に 南、朝に 西に しずむよ。\nsky|3|moon|月の 形は 約1週間ごとに 新月 → 半月 → 満月 → 半月 と かわるよ。\nsky|4||星の 明るさは 星に よって ちがう。明るい じゅんに 1等星・2等星… と よぶよ。\nsky|5|tri_summer|夏の 大三角は こと座の ベガ、わし座の アルタイル、はくちょう座の デネブ だよ。\nsky|6|tri_winter|冬の 大三角は おおいぬ座の シリウス、オリオン座の ベテルギウス、こいぬ座の プロキオン だよ。\nsky|7|dipper|北斗七星の ひしゃくの 先の 2つの 星を 5ばい のばすと 北極星が 見つかるよ。\nsky|8||星座の 星の ならび方は、時間が たっても かわらないよ。\nsky|9||時間が たつと 星座の 位置は 東から 西へ 動いて いくよ（ならび方は そのまま）。\nsky|10||ベテルギウスは オリオン座の 赤い 星。リゲルや シリウスは 白っぽい 星だよ。\nsky|11|moonorbit|月は 太陽の 光が 当たっている 半分だけ 光る。地球から 見える 光る 部分の 形が 日に よって かわるよ。\nbody|0|body|ほねは 体を ささえ、のうや 心ぞうなど だいじな ところを 守るよ。\nbody|1|body|ほねと ほねの つなぎめで、曲がる ところを「関節」と いうよ。\nbody|2|arm|うでを 曲げると うちがわの 筋肉が ちぢみ、そとがわの 筋肉は ゆるむよ。のばすと その 反対。\nbody|3|body|頭の ほね（頭がいこつ）は かたい 入れものの ように のうを 守っているよ。\nbody|4|body|ろっ骨は かごの ように、心ぞうや はいを 守っているよ。\nbody|5|body|大人の 体には 約200この ほねが あるよ。\nbody|6|arm|筋肉が ちぢんだり ゆるんだり して、関節の ところで 体が 曲がり、動くよ。\nwater|0|water|水は 0℃で こおって 氷に なるよ。\nwater|1|water|水は 約100℃で ふっとう するよ。\nwater|2|water|水は こおると 体積が 約1.1ばいに ふえる。だから 氷は 水に うくんだよ。\nwater|3|water|ふっとうした ときの あわは、水が 気体に なった「水じょう気」だよ。\nwater|4||空気は 温めると 体積が ふえ、冷やすと へるよ。へこんだ ピンポン玉を お湯に つけると もどるのは この ため。\nwater|5||金ぞくも 温めると 体積が ふえるけど、空気や 水より ずっと 少しだよ。\nwater|6||とじこめた 空気は おすと ちぢんで 体積が 小さく なり、もとに もどろうと おし返すよ。\nwater|7||とじこめた 水は おしても ほとんど ちぢまないよ。\nwater|8||金ぞくは 熱した ところから じゅんに 熱が つたわって いくよ。\nwater|9||水や 空気は 温められた ものが 上へ 動き、全体が 温まって いくよ。\nwater|10|water|水が 表面から 水じょう気に なって 出ていく ことを「じょう発」と いうよ。\nwater|11||空気中の 水じょう気が 冷やされて 水てきに なることを「けつろ」と いう。つめたい コップの まわりに つく 水てきが そうだよ。\nwater|12||晴れの 日は 気温の 変化が 大きく、くもりや 雨の 日は 小さいよ。\nwater|13||太陽が いちばん 高いのは 正午ごろ だけど、地面が 温まって 気温が 一番 高く なるのは 午後2時ごろだよ。\nwater|14||気温は 風通しの よい 日かげで、地面から 1.2〜1.5mの 高さで はかるよ。\nwater|15||雨水は 高い ところから ひくい ところへ 流れ、ひくい ところに たまるよ。\nflower|0|flower|おしべで できた 花粉が、めしべの 先に つくことを「受粉」と いうよ。\nflower|1|flower|受粉すると、めしべの もと（子房）が ふくらんで 実に なり、中に たねが できるよ。\nflower|2|hechima|ヘチマには おばなと めばなが ある。めばなには めしべが あり、その 下に 小さな 実が ついているよ。\nflower|3|flower|花粉は おしべの 先の ふくろ（やく）で つくられるよ。\nflower|4|germ|発芽には「水・空気・適当な 温度」の 3つが ひつよう。日光や 肥料は 発芽には なくても よいよ（育つのには ひつよう）。\nflower|5|germ|でんぷんが あるかは ヨウ素液で 調べるよ。でんぷんが あると 青むらさき色に なるよ。\nflower|6||ヨウ素液は でんぷんに ふれると 青むらさき色に かわるよ。\nflower|7||発芽した あと よく 育つには、日光と 肥料が ひつようだよ。\nflower|8||葉に 日光が 当たると、でんぷんが つくられるよ（光合成）。\nflower|9||根から すった 水が、葉から 水じょう気と なって 出ていく ことを「じょう散」と いうよ。\nflower|10||葉の うらに 多い 小さな あな「気こう」から 水じょう気が 出ていくよ。\nlife|0|medaka|おすの せびれには 切れこみが あり、しりびれは 平行四辺形で 大きい。めすは せびれに 切れこみが なく、しりびれは 小さいよ。\nlife|1||メダカの たまごの 中には 養分が あり、子メダカは その 養分を つかって 育つよ。\nlife|2||人の 子どもは 母親の おなかの「子宮」の 中で 育つよ。\nlife|3||たい児は へそのお で 母親の たいばんと つながり、養分や 酸素を もらい、いらない ものを わたしているよ。\nlife|4||人の 子どもは 受せいしてから 約38週（約9か月）で 生まれるよ。\nlife|5||たまご（らん）と せい子が むすびつく ことを「受せい」と いう。受せいした たまごだけが 育つよ。\nlife|6||カエルの 子どもは オタマジャクシ。水の 中で えらで 呼吸し、あしが 生えて カエルに なるよ。\nlife|7||水中の 小さな 生き物は けんび鏡で 大きく して 観察するよ。\nlife|8||けんび鏡は まず 低い ばいりつで 見たい ものを さがし、それから 高い ばいりつに するよ。\nsol|0|sol|ものを 水に とかしても、重さは なくならない。全体の 重さは「水 ＋ とかした もの」に なるよ。\nsol|1|sol|ミョウバンは 水の 温度を 上げると、とける 量が 大きく ふえるよ。\nsol|2|sol|食塩は 水の 温度を 上げても、とける 量が あまり かわらないよ。\nsol|3||水よう液は とけた ものが 全体に 広がり、すきとおっている。色が ついていても すきとおっていれば 水よう液だよ。\nsol|4|filter|ろ紙で こして、とけ残りを 取り出す 方法を「ろ過」と いうよ。\nsol|5||水よう液の 水を じょう発させると、とけていた ものが 出てくるよ（食塩水なら 食塩）。\nsol|6|litmus|青色リトマス紙を 赤く するのは 酸性。赤色リトマス紙を 青く するのは アルカリ性。どちらも かわらなければ 中性だよ。\nsol|7|litmus|赤色リトマス紙を 青く かえるのは アルカリ性だよ。\nsol|8|litmus|食塩水は リトマス紙の 色が かわらない 中性だよ。\nsol|9|litmus|塩酸は 青色リトマス紙を 赤く する 酸性だよ。\nsol|10|litmus|石灰水は 赤色リトマス紙を 青く する アルカリ性だよ。\nsol|11||炭酸水は 二酸化炭素が 水に とけた もの。ふると あわが 出てくるよ。\nsol|12||塩酸に アルミニウムや 鉄を 入れると、あわを 出して とけ、水素が 出るよ。\nsol|13||石灰水に 二酸化炭素を 通すと、白く にごるよ。二酸化炭素が あるかの 調べ方だよ。\nsol|14|litmus|アンモニア水は 赤色リトマス紙を 青く する アルカリ性だよ。\nsol|15|litmus|酢は 青色リトマス紙を 赤く する 酸性だよ。\npend|0|pend|ふりこの 1往復の 時間は ふりこの 長さだけで きまる。おもりの 重さや ふれはばでは かわらないよ。\npend|1|pend|ふりこを 長く するほど、1往復の 時間は 長く なるよ。\npend|2|pend|おもりを 重く しても、1往復の 時間は かわらないよ。\npend|3|lever3|てこで 力を 加える ところが「力点」だよ。\npend|4|lever3|てこを 支える ところが「支点」だよ。\npend|5|lever3|ものに 力が はたらく ところが「作用点」だよ。\npend|6|lever3|力点を 支点から 遠ざけるほど、小さな 力で 持ち上げられるよ。\npend|7|lever3|はさみは まん中の じくが 支点、持つ ところが 力点、切る ところが 作用点だよ。\npend|8|lever3|てこは 左右の「おもりの 重さ × 支点からの きょり」が 等しい とき 水平に つり合うよ。\npend|9|lever3|はさみや くぎぬきは 支点が 力点と 作用点の 間に ある。せんぬきは 作用点が 間、ピンセットは 力点が 間だよ。\nemag|0|emag|電磁石は「コイルの まき数を ふやす」「電流を 大きく する」と 強く なるよ。\nemag|1|emag|電流の 向きを 反対に すると、電磁石の N極と S極も 入れかわるよ。\nemag|2|emag|電磁石は 電流を 流している ときだけ じしゃくに なる。電流を 止めると ただの 鉄に もどるよ。\nemag|3||電流の 強さは 電流計で はかるよ。回路に 直列に つなぐんだ。\nemag|4||発電機（手回し発電機）を 回すと 電気が 作られるよ。\nemag|5||コンデンサーは 電気を ためて おける 道具だよ。\nemag|6||LED（発光ダイオード）は 電気を 光に かえるよ。\nemag|7||スピーカーは 電気を 音に かえるよ。\nemag|8||LEDは 豆電球より 少ない 電気で 同じくらい 明るく 光るよ。\nemag|9||電熱線は 電気を 熱に かえるよ。ドライヤーや トースターに 使われているよ。\nweather|0||日本の 上空には 西から 東へ ふく 風（へん西風）が あるので、天気は 西から 東へ うつりかわるよ。\nweather|1||台風は 南の 海で 生まれ、夏から 秋に 日本へ 多く 近づくよ。\nweather|2||気象衛星（ひまわり）は 宇宙から 雲の ようすを 写して いるよ。\nweather|3||アメダスは 全国の 雨量・気温・風などを 自動で はかる しくみだよ。\nweather|4|river|流れる 水が 地面を けずる はたらきを「しん食」と いうよ。\nweather|5|river|流れる 水が 土や 石を 運ぶ はたらきを「運ぱん」と いうよ。\nweather|6|river|流れる 水が 土や 石を つもらせる はたらきを「たい積」と いうよ。\nweather|7|river|川の 曲がった ところでは 外がわの 流れが 速く、岸が けずられて がけに なる。内がわは ゆるやかで 川原が できるよ。\nweather|8|river|上流の 石は 運ばれた きょりが 短いので、大きく 角ばっているよ。\nweather|9|river|下流の 石は 長い きょりを 流される 間に ぶつかって けずられ、小さく 丸く なるよ。\nweather|10|strata|れき・砂・どろが 水の はたらきで 運ばれ、つぶの 大きさごとに 何回も つもって しま模様の 地層に なるよ。\nweather|11|strata|大昔の 生き物の からだや あしあとが 地層の 中に のこった ものを「化石」と いうよ。\nweather|12|strata|火山灰の つぶは 水で 運ばれて いないので、角ばって いるよ。\nweather|13|strata|大きな 地しんで 土地に 力が はたらき、地層が ずれた ものを「断層」と いうよ。\nburn|0|burn|ものが 燃えるには 酸素が ひつよう。酸素が なくなると 火は 消えるよ。\nburn|1|burn|ものが 燃えると 酸素が 使われ、二酸化炭素が ふえるよ。\nburn|2|air|空気の 約78%は ちっ素、約21%が 酸素、二酸化炭素は 約0.04%だよ。\nburn|3|air|空気中の 酸素は 約21%（約5分の1）だよ。\nburn|4|burn|下から 新しい 空気が 入り、上から 出ていくと、ろうそくは よく 燃え続けるよ。\nburn|5|burn|酸素だけの 中では、ろうそくは 空気中より 激しく 明るく 燃えるよ。\nburn|6||はく 息は すう 息より 酸素が へり、二酸化炭素が ふえているよ。\nburn|7||気体検知管で 酸素や 二酸化炭素の 割合を はかれるよ。\nhbody|0|hbody|口・胃・小腸などで 出される「消化液」が、食べものを 吸収しやすい ものに かえるよ。\nhbody|1|hbody|だ液は ごはんの でんぷんを あまい ものに かえる。よく かむと あまく 感じるのは この ため。\nhbody|2|hbody|消化された 養分は おもに 小腸で 吸収され、血液で 全身に 運ばれるよ。\nhbody|3|hbody|心ぞうは ポンプの ように はたらいて、血液を 全身に 送り出すよ。\nhbody|4|hbody|はいで 空気中の 酸素を 血液に とり入れ、二酸化炭素を 出すよ。\nhbody|5|hbody|じん臓は 血液から いらない ものを こし出して にょうを つくるよ。\nhbody|6|hbody|かん臓は 小腸で 吸収した 養分の 一部を たくわえるよ。\nhbody|7||心ぞうの どきどき（はく動）が 血管に つたわった ものが「脈はく」。手首で さわれるよ。\nhbody|8|hbody|食べものは 口 → 食道 → 胃 → 小腸 → 大腸 の じゅんに 通るよ。\nhbody|9||「食べる・食べられる」の つながりを 食物連さと いうよ。草 → バッタ → カエル → ヘビ のように つながるよ。\nmoonsun|0|moonorbit|月の 光る 側は いつも 太陽の 方を 向いている。月と 太陽の 位置関係が かわると、見える 形が かわるよ。\nmoonsun|1|moonorbit|満月は 地球を はさんで 太陽の 反対がわに あるよ。\nmoonsun|2|moonorbit|新月は 太陽と 同じ がわに あり、光る 面が 地球から 見えないよ。\nmoonsun|3||月の 表面の 丸い くぼみは「クレーター」。いん石が ぶつかって できたと 考えられているよ。\nmoonsun|4|moon|夕方 西の 空に 見え、右がわが 細く 光るのは 三日月だよ。\nmoonsun|5|moon|月は 自分では 光らず、太陽の 光を はね返して 光って 見えるよ。\nbio|0|cell|植物の 細胞には 細胞かべ・葉緑体・大きな 液ほうが ある。動物の 細胞には ないよ。\nbio|1|cell|葉緑体は 植物の 細胞の 中の 緑色の つぶで、光合成を するよ。\nbio|2||遺伝子の 本体は DNA（デオキシリボ核酸）という 物質だよ。\nbio|3||被子植物は 胚珠が 子房の 中に ある。裸子植物（マツなど）は 胚珠が むき出しだよ。\nbio|4||マツや イチョウは 子房が なく 胚珠が むき出しの 裸子植物だよ。\nbio|5||シダ植物や コケ植物は 種子を つくらず、胞子で ふえるよ。\nbio|6||単子葉類（イネ・ユリなど）の 葉脈は 平行脈、双子葉類は 網状脈だよ。\nbio|7|roots|双子葉類の 根は 主根と 側根。単子葉類は ひげ根だよ。\nbio|8||背骨（セキツイ）の ある 動物を セキツイ動物と いう。魚類・両生類・は虫類・鳥類・ほ乳類だよ。\nbio|9||魚類は 一生 えらで 呼吸する。両生類は 子は えら、親は はいと 皮ふで 呼吸するよ。\nbio|10||ほ乳類は 母親の 体内で 子を 育ててから うむ（胎生）。ほかの セキツイ動物は たまごを うむ（卵生）よ。\nbio|11||イカや タコ、貝の なかまは 背骨も 節も ない 軟体動物だよ。\nbio|12||だ液に ふくまれる アミラーゼは、でんぷんを 分解するよ。\nbio|13||たんぱく質は 胃液や すい液で 分解され、さいごに アミノ酸に なるよ。\nbio|14||小腸の かべには 柔毛という 小さな 突起が たくさん あり、表面積を 広くして 養分を 吸収しやすく しているよ。\nbio|15||赤血球の ヘモグロビンが 酸素を 運ぶよ。白血球は 細菌と たたかい、血小板は 血を 固めるよ。\nbio|16||熱い ものに さわって 思わず 手を 引っこめる ような、無意識の 反応を「反射」と いうよ。\nbio|17||体細胞分裂では 染色体が 複製されてから 分かれるので、数は もとと 同じだよ。\nbio|18||生殖細胞（卵・精子）が できる ときは 減数分裂で、染色体の 数が 半分に なるよ。\nbio|19||親の からだの 一部から 子が できる 無性生殖では、子は 親と 同じ 遺伝子を もつよ。\nbio|20||メンデルは エンドウの 種子の 形や 色を 使って 遺伝の きまりを 見つけたよ。\nbio|21||光合成で 養分を つくる 植物は「生産者」。それを 食べる 動物は 消費者だよ。\nbio|22||落ち葉や 死がいを 分解する 菌類・細菌類・ミミズなどは「分解者」だよ。\nchem|0||密度 ＝ 質量 ÷ 体積。1cm³あたりの 質量で、物質を 見分ける 手がかりに なるよ。\nchem|1||水素は とても 軽く、火を 近づけると ポンと 燃えて 水が できるよ。\nchem|2|gas|二酸化マンガンに オキシドール（うすい 過酸化水素水）を 加えると 酸素が 発生するよ。\nchem|3|gas|石灰石に うすい 塩酸を 加えると 二酸化炭素が 発生するよ。\nchem|4|gas|水に とけやすく 空気より 軽い 気体（アンモニアなど）は、上方置換法で 集めるよ。\nchem|5|gas|水に とけにくい 気体（酸素・水素など）は、水上置換法で 集めるよ。\nchem|6||固体が とけて 液体に なる 温度を「融点」と いうよ。\nchem|7||液体が ふっとうして 気体に なる 温度を「沸点」と いうよ。\nchem|8||液体の 混合物を 熱し、沸点の ちがいを 利用して 分ける 方法を「蒸留」と いうよ。\nchem|9||物質が 酸素と 結びつく 化学変化を「酸化」、はげしく 光や 熱を 出す 酸化を「燃焼」と いうよ。\nchem|10||酸化物から 酸素を うばう 化学変化を「還元」と いうよ。\nchem|11||化学変化の 前後で、原子の 組み合わせは かわるが 原子の 数は かわらない。だから 全体の 質量は かわらないよ（質量保存の法則）。\nchem|12||物質を つくる いちばん 小さな つぶを「原子」と いうよ。\nchem|13||水は 水素原子2こと 酸素原子1こで できているので H₂O だよ。\nchem|14||二酸化炭素は 炭素原子1こと 酸素原子2こで CO₂ だよ。\nchem|15||塩化ナトリウム（食塩）は ナトリウム Na と 塩素 Cl で NaCl だよ。\nchem|16||炭酸水素ナトリウムを 加熱すると、炭酸ナトリウム・水・二酸化炭素に 分解されるよ。\nchem|17||鉄と 硫黄を 加熱すると 結びついて 硫化鉄が できる。もとの 鉄とは ちがう 性質に なるよ。\nchem|18|litmus|酸と アルカリが たがいの 性質を 打ち消し合う 反応を「中和」と いうよ。\nchem|19||中和では 水と「塩（えん）」が できるよ。塩酸＋水酸化ナトリウム → 食塩＋水。\nchem|20|btb|BTB液は 酸性で 黄色、中性で 緑色、アルカリ性で 青色だよ。\nchem|21|btb|BTB液は アルカリ性で 青色に なるよ。\nchem|22||原子が 電子を 失ったり 受け取ったり して 電気を 帯びた ものを「イオン」と いうよ。\nchem|23||水を 電気分解すると、陰極（−）に 水素、陽極（＋）に 酸素が 2：1の 体積で 出るよ。\nchem|24||原子の 中心には ＋の 電気を もつ 原子核が あり、その まわりに −の 電子が あるよ。\nchem|25||酸性の 水溶液には 水素イオン（H⁺）が、アルカリ性には 水酸化物イオン（OH⁻）が ふくまれるよ。\nchem|26|gas|アンモニアは 水に とても とけやすく 空気より 軽いので、上方置換法で 集めるよ。\nphys|0||光が 鏡などの 表面で はね返る ことを「反射」と いうよ。\nphys|1||光が ちがう 物質の さかい目を ななめに 進むとき、折れ曲がる ことを「屈折」と いうよ。\nphys|2||反射の 法則：入射角と 反射角は いつも 等しいよ。\nphys|3||物体が 凸レンズの 焦点より 外側に あると、スクリーンに 上下左右 逆の「実像」が できるよ。\nphys|4||物体が 焦点より 内側に あると、レンズを のぞくと 大きく 見える「虚像」が 見えるよ。虫めがねは これだよ。\nphys|5||1秒間に ふるえる 回数（振動数）が 多いほど 高い 音に なるよ。\nphys|6||ふるえる はば（振幅）が 大きいほど 大きい 音に なるよ。\nphys|7||空気中の 音の 速さは 約340m/秒。光（約30万km/秒）より ずっと おそいので、かみなりは 光ってから 音が 聞こえるよ。\nphys|8||音は 空気などの ものが ふるえて 伝わるので、何も ない 真空中では 伝わらないよ。\nphys|9||ばねの のびは 加えた 力の 大きさに 比例する。これを フックの法則と いうよ。\nphys|10||力の 単位は N（ニュートン）。約100gの ものに はたらく 重力が 約1Nだよ。\nphys|11||圧力 ＝ 力 ÷ 面積。単位は Pa（パスカル）だよ。\nphys|12||電圧の 単位は V（ボルト）、電流は A（アンペア）、抵抗は Ω（オーム）だよ。\nphys|13||電気抵抗の 単位は Ω（オーム）だよ。\nphys|14||電流は 電圧に 比例する（電圧 ＝ 抵抗 × 電流）。これを オームの法則と いうよ。\nphys|15|series|直列回路では 電流の 通り道が 1本なので、どこでも 電流は 等しいよ。\nphys|16|series|並列回路では それぞれの 部分に かかる 電圧が 電源の 電圧と 等しいよ。\nphys|17||電力の 単位は W（ワット）。電力 ＝ 電圧 × 電流 だよ。\nphys|18||磁界の 中で 電流が 力を 受ける ことを 利用して 回るのが モーターだよ。\nphys|19||コイルの 中の 磁界を 変化させると 電流が 流れる。これを 電磁誘導と いい、発電機に 使われているよ。\nphys|20||物体が 今の 運動を 続けようと する 性質を「慣性」と いうよ。バスが 急に 止まると 前に たおれそうに なるよね。\nphys|21||水中の 物体は 上向きの 浮力を 受けるよ。だから 水中では 体が 軽く 感じるんだ。\nphys|22||仕事 ＝ 力 × 動かした きょり。単位は J（ジュール）だよ。\nphys|23||てこや 滑車を 使うと 力は 小さく できるが、動かす きょりが 長く なり、仕事の 量は かわらない（仕事の原理）。\nearth|0|quake|地下で 地震が 発生した 場所を「震源」と いうよ。\nearth|1|quake|震源の 真上の 地表の 地点を「震央」と いうよ。\nearth|2||ある 場所での ゆれの 大きさは「震度」（0〜7の 10段階）で あらわすよ。\nearth|3||地震そのものの 規模（エネルギー）は「マグニチュード」で あらわすよ。\nearth|4||はじめの 小さな ゆれが 初期微動（P波）、あとから くる 大きな ゆれが 主要動（S波）だよ。\nearth|5||P波は S波より 速く 伝わる。だから 小さな ゆれが 先に とどくよ。\nearth|6|rock2|マグマが 地表付近で 急に 冷えると、小さな つぶの 中に 大きな 結晶が ちらばる 火山岩に なるよ。\nearth|7|rock2|マグマが 地下深くで ゆっくり 冷えると、大きな 結晶が そろった 深成岩に なるよ。\nearth|8|rock2|花こう岩は 白っぽい 深成岩。大きな 結晶が ぎっしり ならんで いるよ。\nearth|9|rock2|安山岩は 火山岩。こまかい つぶの 中に 大きめの 結晶が 見えるよ。\nearth|10||石灰岩は 貝がらや サンゴが つもった 堆積岩で、塩酸を かけると 二酸化炭素の あわが 出るよ。\nearth|11|strata|火山灰が つもって 固まった 岩石を「凝灰岩」と いうよ。\nearth|12||限られた 時代に 広く 栄えた 生物の 化石を 示準化石と いう（三葉虫・アンモナイト・恐竜など）。\nearth|13||限られた 環境に すむ 生物の 化石を 示相化石と いう（サンゴ → あたたかく 浅い 海）。\nearth|14||恐竜や アンモナイトが 栄えたのは 中生代だよ。\nearth|15||上昇した 空気は 気圧が 下がって ふくらみ、気温が 下がるよ（100mで 約1℃）。\nearth|16||上昇気流で 空気が 冷え、水じょう気が 水てきに なって 雲が できるよ。\nearth|17|front|寒冷前線が 通過すると、つめたい 空気に 入れかわるので 気温が 下がるよ。\nearth|18|front|温暖前線の 前方には 乱層雲などが 広がり、長時間 おだやかな 雨が ふるよ。\nearth|19|front|積乱雲は 寒冷前線などで 発達し、短時間に 強い 雨や かみなりを もたらすよ。\nearth|20||高気圧の 中心では 下降気流が 起こるので 雲が できにくく、晴れやすいよ。\nearth|21||冬は 西の 大陸に 高気圧、東の 海に 低気圧が ある「西高東低」の 気圧配置に なるよ。\nearth|22||地球が 1日に 1回 自転する ので、昼と 夜が くり返されるよ。\nearth|23||地軸が かたむいた まま 地球が 公転するので、季節が かわるよ。\nearth|24|planets|木星は 太陽系で いちばん 大きい 惑星。地球の 約11ばいの 直径だよ。\nearth|25|planets|太陽に 近い じゅんに 水星・金星・地球・火星・木星・土星・天王星・海王星 だよ。\nearth|26|planets|金星は 明け方の 東の 空や 夕方の 西の 空に 明るく かがやくよ。\nearth|27||太陽のように 自ら 光を 出す 天体を 恒星と いう。惑星や 衛星は 光を はね返して 光るよ。".split('\n').forEach(l => { const a = l.split('|'); if(a.length >= 4) EXP[a[0]+'|'+a[1]] = [a[2], a.slice(3).join('|')]; });
const BY_Q = {}; Object.entries(SCI_BANK).forEach(([k, L]) => L.forEach((r, i) => { BY_Q[r[0]] = k + '|' + i; }));

/* ---------- ことばの いみ（えらんだ こたえの せつめい） ---------- */
const GL = {
'3つ':'あたま・むね・はら','2つ':'クモは からだが 2つ','あたま':'目・しょっ角・口が ある','むね':'あし6本と はねが ついている','はら':'気門（いきの あな）が ある',
'よう虫':'たまごから かえった 子ども','さなぎ':'よう虫から せい虫に かわる 時期（何も 食べない）','せい虫':'おとなの こん虫',
'チョウ':'たまご→よう虫→さなぎ→せい虫（さなぎに なる）','カブトムシ':'さなぎに なる こん虫。よう虫は 土の 中','テントウムシ':'さなぎに なる。冬は せい虫で こす','カマキリ':'さなぎに ならない。冬は たまごで こす','セミ':'さなぎに ならない。よう虫は 土の 中',
'アオムシ':'モンシロチョウの よう虫','イモムシ':'ガや チョウの よう虫の よび名','ボウフラ':'カの よう虫（水の 中）','ヤゴ':'トンボの よう虫（水の 中）','オタマジャクシ':'カエルの 子ども',
'子葉':'たねから 最初に 出る 葉','本葉':'子葉の あとに 出る ふつうの 葉','がく':'花の いちばん 外がわで 花を ささえる 部分','花びら':'花の まわりの 色の ついた 部分',
'じょう発':'水が 表面から 水じょう気に なる こと','ふっとう':'水が 中からも あわを 出して 水じょう気に なる こと（約100℃）','ぎょう固':'液体が 固体に なる こと','ゆう解':'固体が とけて 液体に なる こと','けつろ':'水じょう気が 冷えて 水てきに なる こと',
'受粉':'花粉が めしべの 先に つく こと','発芽':'たねから 芽が 出る こと','光合成':'葉で 日光を 使って でんぷんを つくる こと','じょう散':'葉から 水が 水じょう気で 出ていく こと','呼吸':'酸素を とり入れ 二酸化炭素を 出す こと','受せい':'たまごと せい子が むすびつく こと',
'気こう':'葉の 表面の 小さな あな','根毛':'根の 先の 細かい 毛。水を すう','道管':'根から すった 水の 通り道','花粉':'おしべで できる こな',
'おしべ':'花粉を つくる','めしべ':'先に 花粉が つくと、もとが 実に なる',
'ヨウ素液':'でんぷんを 調べる（青むらさき色）','石灰水':'二酸化炭素を 調べる（白く にごる）','リトマス紙':'酸性・アルカリ性を 調べる','BTB液':'酸性 黄・中性 緑・アルカリ性 青',
'酸性':'青色リトマス紙が 赤く なる（塩酸・酢・炭酸水）','アルカリ性':'赤色リトマス紙が 青く なる（石灰水・アンモニア水）','中性':'リトマス紙の 色が かわらない（食塩水・さとう水）',
'ろ過':'ろ紙で こして とけ残りを 分ける','ミョウバン':'温度を 上げると よく とける','食塩':'温度を 上げても とける 量が あまり かわらない','ホウ酸':'温度を 上げると よく とける',
'酸素':'ものを 燃やす はたらきが ある 気体（空気の 約21%）','二酸化炭素':'石灰水を 白く にごらせる 気体','ちっ素':'空気の 約78%。ものを 燃やさない','水素':'いちばん 軽い 気体。燃えると 水が できる','アンモニア':'鼻を さす においの 気体。アルカリ性',
'力点':'力を 加える ところ','支点':'てこを 支える ところ','作用点':'ものに 力が はたらく ところ','ふりこの 長さ':'1往復の 時間を きめる ただ1つの もの','おもりの 重さ':'ふりこの 1往復の 時間には 関係ない','ふれはば':'ふりこの 1往復の 時間には 関係ない',
'電磁石':'電流が 流れる ときだけ じしゃくに なる','ぼうじしゃく':'いつも じしゃく','方位じしん':'北を しらべる 道具','電流計':'電流の 強さを はかる','電圧計':'電圧を はかる',
'LED':'電気 → 光（少ない 電気で 明るい）','モーター':'電気 → 回る 動き','スピーカー':'電気 → 音','ヒーター':'電気 → 熱','電熱線':'電気 → 熱','発電機':'回すと 電気を つくる','コンデンサー':'電気を ためる','豆電球':'電気 → 光（LEDより 電気を 多く 使う）',
'しん食':'流れる 水が けずる','運ぱん':'流れる 水が 運ぶ','たい積':'流れる 水が つもらせる','化石':'大昔の 生き物の あと','断層':'地層の ずれ','地層':'れき・砂・どろなどが 重なった しま模様','台地':'まわりより 高く 平らな 土地',
'気象衛星':'宇宙から 雲を 写す','アメダス':'雨量・気温などを 自動で はかる','ひゃくよう箱':'気温を はかる 白い 箱',
'消化液':'食べものを 消化する 液','血液':'酸素や 養分を 運ぶ','小腸':'養分を 吸収する','胃':'胃液で 食べものを 消化する','大腸':'水分を 吸収する','食道':'口から 胃への 通り道',
'心ぞう':'血液を 全身に 送る ポンプ','はい':'酸素を とり入れ 二酸化炭素を 出す','かん臓':'養分を たくわえる','じん臓':'血液から いらない ものを こし出す','ぼうこう':'にょうを ためる',
'脈はく':'心ぞうの はく動が 血管に つたわった もの','食物連さ':'食べる・食べられるの つながり','子宮':'子どもが 育つ ところ','へそのお':'たい児と 母親を つなぐ',
'関節':'ほねと ほねの つなぎめ','筋肉':'ちぢんだり ゆるんだり して 体を 動かす','けん':'筋肉と ほねを つなぐ','ろっ骨':'心ぞう・はいを 守る','頭の ほね':'のうを 守る','せぼね':'体を ささえる',
'三日月':'夕方 西の 空。右が 細く 光る','半月':'右半分（上弦）や 左半分（下弦）が 光る','満月':'まるい 月。太陽の 反対がわ','新月':'光る 面が 見えない 月','下弦の 月':'明け方に 見える 左半分の 月','クレーター':'月の 丸い くぼみ',
'ベガ':'夏の 大三角（こと座）','アルタイル':'夏の 大三角（わし座）','デネブ':'夏の 大三角（はくちょう座）','シリウス':'冬の 大三角（おおいぬ座）。いちばん 明るい 恒星','ベテルギウス':'冬の 大三角（オリオン座）。赤い','プロキオン':'冬の 大三角（こいぬ座）','リゲル':'オリオン座の 白い 星','北極星':'北の 空で ほとんど 動かない 星',
'北斗七星':'ひしゃくの 形の 7つの 星','オリオン座':'冬の 星座。ベテルギウスと リゲル','さそり座':'夏の 星座。赤い アンタレス','はくちょう座':'夏の 星座。デネブ',
'細胞かべ':'植物の 細胞の じょうぶな かべ','核':'細胞の 中心。遺伝子が ある','細胞まく':'細胞を つつむ まく','葉緑体':'光合成を する 緑の つぶ','液ほう':'植物の 細胞の 液の ふくろ',
'被子植物':'胚珠が 子房に つつまれている','裸子植物':'胚珠が むき出し（マツ・イチョウ）','シダ植物':'胞子で ふえる（根・くき・葉が ある）','コケ植物':'胞子で ふえる（根・くき・葉の 区別が ない）','単子葉類':'子葉1まい。平行脈・ひげ根',
'平行脈':'すじが 平行（単子葉類）','網状脈':'すじが あみの 目（双子葉類）','ひげ根':'単子葉類の 根','主根と 側根':'双子葉類の 根',
'セキツイ動物':'背骨が ある','無セキツイ動物':'背骨が ない','節足動物':'からだと あしに 節が ある（こん虫・エビ）','軟体動物':'イカ・タコ・貝',
'魚類':'一生 えら呼吸','両生類':'子は えら、親は はいと 皮ふ','は虫類':'うろこ。陸に からの ある たまご','鳥類':'羽毛。からの ある たまご','ほ乳類':'子を うんで 乳で 育てる（胎生）',
'アミラーゼ':'だ液。でんぷんを 分解','ペプシン':'胃液。たんぱく質を 分解','リパーゼ':'すい液。脂肪を 分解','トリプシン':'すい液。たんぱく質を 分解',
'柔毛':'小腸の ひだの 突起','肺ほう':'はいの 小さな ふくろ','赤血球':'酸素を 運ぶ','白血球':'細菌と たたかう','血小板':'血を 固める','血しょう':'養分や 不要物を とかして 運ぶ 液',
'反射':'無意識に おこる 反応','減数分裂':'生殖細胞を つくる 分裂（染色体が 半分）','体細胞分裂':'からだを 大きく する 分裂（染色体の 数は 同じ）','無性生殖':'親の 一部から 子が できる','有性生殖':'受精で 子が できる',
'生産者':'光合成で 養分を つくる（植物）','消費者':'ほかの 生物を 食べる（動物）','分解者':'死がいなどを 分解する（菌類・細菌類）',
'密度':'1cm³あたりの 質量','溶解度':'水100gに とける 最大の 量','濃度':'とけている ものの 割合',
'上方置換法':'水に とけやすく 空気より 軽い 気体','下方置換法':'水に とけやすく 空気より 重い 気体','水上置換法':'水に とけにくい 気体',
'融点':'固体が 液体に なる 温度','沸点':'液体が ふっとうする 温度','露点':'水じょう気が 水てきに なり はじめる 温度','凝固点':'液体が 固体に なる 温度','蒸留':'沸点の ちがいで 分ける','再結晶':'溶解度の ちがいで 結晶を とり出す',
'酸化':'酸素と 結びつく','還元':'酸素を うばう','中和':'酸と アルカリが 打ち消し合う','分解':'1つの 物質が 2つ以上に 分かれる','燃焼':'光や 熱を 出す 激しい 酸化','電気分解':'電流で 物質を 分解する',
'原子':'物質を つくる いちばん 小さな つぶ','分子':'原子が 結びついた つぶ','イオン':'電気を 帯びた 原子','電子':'−の 電気を もつ つぶ','原子核':'原子の 中心',
'反射':'光が はね返る','屈折':'光が 折れ曲がる','実像':'スクリーンに うつる 逆さの 像','虚像':'レンズを のぞいて 見える 像','振動数':'音の 高さを きめる','振幅':'音の 大きさを きめる',
'フックの法則':'ばねの のびは 力に 比例','オームの法則':'電圧 ＝ 抵抗 × 電流','慣性の法則':'物体は 運動を 続けようと する','作用反作用':'おしたら おし返される','アルキメデスの原理':'浮力は おしのけた 水の 重さ',
'慣性':'運動を 続けようと する 性質','摩擦':'動きを じゃまする 力','重力':'地球が 引く 力','浮力':'水中で 上向きに はたらく 力','磁力':'じしゃくの 力',
'電磁誘導':'磁界の 変化で 電流が 流れる','静電気':'こすると たまる 電気',
'震源':'地震が 発生した 地下の 場所','震央':'震源の 真上の 地表','震度':'ある 場所の ゆれの 大きさ','マグニチュード':'地震の 規模','初期微動':'はじめの 小さな ゆれ（P波）','主要動':'あとの 大きな ゆれ（S波）','余震':'大きな 地震の あとに 続く 地震','津波':'海底の 地震で 起こる 大きな 波',
'火山岩':'地表近くで 急に 冷えた 岩石','深成岩':'地下深くで ゆっくり 冷えた 岩石','堆積岩':'つもった ものが 固まった 岩石','変成岩':'熱や 圧力で 性質が かわった 岩石',
'石灰岩':'塩酸で 二酸化炭素が 出る','チャート':'とても かたい。塩酸で あわが 出ない','凝灰岩':'火山灰が 固まった','花こう岩':'白っぽい 深成岩','玄武岩':'黒っぽい 火山岩',
'示準化石':'時代を 知る 化石','示相化石':'環境を 知る 化石','古生代':'三葉虫の 時代','中生代':'恐竜・アンモナイトの 時代','新生代':'ほ乳類が 栄えた 時代（マンモス）',
'上昇気流':'上へ 動く 空気（雲が できる）','下降気流':'下へ 動く 空気（晴れやすい）','乱層雲':'温暖前線の 雲。長い 雨','積乱雲':'寒冷前線の 雲。強い 雨','積雲':'もくもくした わた雲',
'西高東低':'冬の 気圧配置','南高北低':'夏の 気圧配置',
'恒星':'自ら 光る（太陽）','惑星':'恒星の まわりを 回る（地球）','衛星':'惑星の まわりを 回る（月）','すい星':'長い 尾を 引く 天体',
'木星':'いちばん 大きい 惑星','土星':'わの ある 惑星','水星':'太陽に いちばん 近い 惑星','金星':'明けの 明星・よいの 明星','火星':'赤い 惑星','海王星':'いちばん 外がわの 惑星',
'東':'太陽・月が のぼる','西':'太陽・月が しずむ','南':'太陽が 一番 高く なる','北':'方位じしんの 色つきの はりが さす'
};

Object.entries({"4本": "こん虫は 6本。4本の こん虫は いない", "8本": "クモの あしの 数", "10本": "エビや カニの あしの 数", "せなか": "こん虫の せなかには はねが ある ことが 多い", "はね": "はねは むねに ついている。気門は はらに ある", "たまご→よう虫→せい虫": "バッタや トンボの 育ち方（さなぎが ない）", "ヒマワリ": "夏に 花が さく。モンシロチョウは たまごを うまない", "イネ": "秋に 実る 植物。モンシロチョウは たまごを うまない", "サクラ": "春に 花が さく 木", "アゲハ（さなぎ）": "アゲハは さなぎで 冬を こす", "モンシロチョウ": "さなぎで 冬を こす", "こん虫": "あし6本・からだ3つ・しょっ角2本の 生き物", "チョウの なかま": "はねが あり、あし6本。ダンゴムシとは ちがう", "トンボの なかま": "はねが あり、あし6本。ダンゴムシとは ちがう", "根": "水や 養分を すう。からだを ささえる", "くき": "水や 養分の 通り道", "葉": "日光を うけて 養分を つくる", "アサガオ": "夏に 花が さく", "コスモス": "秋に 花が さく", "チューリップ": "春に 花が さく", "ナノハナ": "春に 花が さく", "動物に くっつく": "オナモミや ヌスビトハギの たね", "はじけて とぶ": "ホウセンカや カタバミの たね", "水に うく": "ハスや ヤシの 実", "温度計": "温度を はかる 道具", "ものさし": "長さを はかる 道具", "アルミかん": "アルミニウムは じしゃくに つかない（電気は 通す）", "10円玉": "銅で できている。じしゃくに つかない", "プラスチック": "じしゃくに つかず、電気も 通さない", "紙": "電気を 通さない", "ゴム": "電気を 通さない", "木": "電気を 通さない", "アルミニウム": "金ぞくなので 電気を 通す", "銅": "金ぞくなので 電気を 通す（導線に 使う）", "鉄": "金ぞくなので 電気を 通し、じしゃくにも つく", "引き合う": "N極と S極（ちがう きょく）", "しりぞけ合う": "N極と N極（同じ きょく）", "−極": "かん電池の 平らな ほう", "線路": "電車の 通る 道", "約1か月": "新月から 次の 新月まで（約29.5日）", "約1日": "月が 東から のぼって また のぼるまで", "約1年": "地球が 太陽の まわりを 1周する 時間", "かみの毛": "頭を 守るが、体を ささえない", "皮ふ": "体の 表面を おおう", "こつばん": "こしの ほね。内ぞうを 下から ささえる", "せぼね": "体の 中心で 体を ささえる", "100℃": "水が ふっとう する 温度", "0℃": "水が こおる 温度", "けむり": "ものが 燃えた ときに 出る つぶ。ふっとうの あわでは ない", "空気": "ちっ素や 酸素の まざった もの", "赤色": "ヨウ素液は でんぷんで 赤には ならない", "でんぷん": "ヨウ素液で 青むらさき色に なる 養分", "脂肪": "油の なかま", "たんぱく質": "肉や 魚・豆に 多い 養分", "望遠鏡": "遠くの 星などを 見る 道具", "さとう": "温度を 上げると よく とける", "食塩水": "中性。リトマス紙の 色は かわらない", "塩酸": "酸性", "アンモニア水": "アルカリ性", "重心": "ものの 重さが 集まる 点", "ピンセット": "力点が 間に ある てこ", "せんぬき": "作用点が 間に ある てこ", "トング": "力点が 間に ある てこ", "U字じしゃく": "いつも じしゃく（電磁石では ない）", "ばねばかり": "重さ（力）を はかる", "手回し発電機": "回すと 電気を つくる", "東から 西": "天気は 西から 東へ うつる（へん西風）", "てんびん": "重さを くらべる 道具", "ふん火": "火山が マグマを ふき出す こと", "内がわ": "川の 曲がった ところの 内がわは 流れが ゆるやか", "小さく 丸い": "下流の 石", "大きく 角ばっている": "上流の 石", "岩石": "鉱物が 集まった かたまり", "鉱物": "岩石を つくる つぶ", "約78%": "空気中の ちっ素の 割合", "約0.04%": "空気中の 二酸化炭素の 割合", "なみだ": "目を 守る 液", "真夜中に 見える": "満月は 真夜中に 南に 見える", "火山": "月にも 昔の 火山の あとが あるが、丸い くぼみは クレーター", "海": "月の 黒っぽい 平らな ところを「海」と よぶ", "細胞質": "核の まわりの 部分（植物にも 動物にも ある）", "ATP": "生き物が エネルギーを 使う ときの 物質", "ブドウ糖": "でんぷんが 分解されて できる", "気根": "空気中に 出る 根（トウモロコシなど）", "脂肪酸": "脂肪が 分解されて できる", "ネフロン": "じん臓の 単位", "二分裂": "からだが 2つに 分かれて ふえる（ゾウリムシ）", "出芽": "からだの 一部が ふくらんで ふえる（酵母）", "受精": "卵と 精子が 合体する", "交配": "親を かけ合わせる", "捕食者": "ほかの 動物を 食べる 動物", "寄生者": "ほかの 生き物に すみつく 生き物", "体積": "ものが しめる 大きさ", "石灰石＋塩酸": "二酸化炭素が 出る", "亜鉛＋塩酸": "水素が 出る", "塩化アンモニウム＋水酸化カルシウム": "アンモニアが 出る", "二酸化マンガン＋オキシドール": "酸素が 出る", "鉄＋硫黄": "加熱すると 硫化鉄が できる", "H₂O": "水", "CO₂": "二酸化炭素", "O₂": "酸素", "CO": "一酸化炭素", "NaCl": "塩化ナトリウム（食塩）", "HCl": "塩化水素（塩酸）", "NaOH": "水酸化ナトリウム", "CaCO₃": "炭酸カルシウム（石灰石）", "酸化鉄": "鉄と 酸素が 結びついた もの（さび）", "塩化鉄": "鉄と 塩素が 結びついた もの", "青色": "BTB液の アルカリ性の 色", "緑色": "BTB液の 中性の 色", "黄色": "BTB液の 酸性の 色", "中性子": "原子核の 中の 電気を もたない つぶ", "塩素": "プールの においの 気体", "水酸化物イオン": "アルカリ性に ふくまれる OH⁻", "分散": "白い 光が 色に 分かれる こと", "吸収": "光が 物に すいこまれる こと", "回折": "光や 音が かげに 回りこむ こと", "音色": "楽器ごとの 音の ちがい", "J（ジュール）": "仕事・エネルギーの 単位", "W（ワット）": "電力の 単位", "N（ニュートン）": "力の 単位", "Pa（パスカル）": "圧力の 単位", "A（アンペア）": "電流の 単位", "V（ボルト）": "電圧の 単位", "Ω（オーム）": "抵抗の 単位", "オームの法則": "電圧 ＝ 抵抗 × 電流", "エネルギー保存": "エネルギーの 合計は かわらない", "発電機": "電磁誘導で 電気を つくる", "P波": "速い 波。初期微動を 起こす", "S波": "おそい 波。主要動を 起こす"}).forEach(([k,v]) => { if(!GL[k]) GL[k] = v; });
/* ---------- 絵の 問題：生き物・植物・天体の データ ---------- */
const BI = {
 'ミツバチ':{p:['からだに 毛が 多く、黄色と 黒の しま','花の みつと 花粉を あつめる','はねは 4まい、あしは 6本'], k:'こん虫', g:'たまご → よう虫 → さなぎ → せい虫'},
 'アリ':{p:['あたま・むね・はらの くびれが はっきり','はねが ない（はたらきアリ）','土の 中に 巣を つくって なかまと くらす'], k:'こん虫', g:'たまご → よう虫 → さなぎ → せい虫', il:'il_ant_body'},
 'トンボ':{p:['大きな 目と、すきとおった 細長い はね 4まい','細長い はら','よう虫は 水の 中の「ヤゴ」'], k:'こん虫', g:'たまご → よう虫（ヤゴ） → せい虫（さなぎに ならない）', il:'il_dragon_cycle'},
 'バッタ':{p:['うしろあしが 太くて 長い → 大ジャンプ','草を 食べる','よう虫も せい虫と にた 形'], k:'こん虫', g:'たまご → よう虫 → せい虫（さなぎに ならない）', il:'il_grass_cycle'},
 'クモ':{p:['あしが 8本','からだは 2つ（あたまむね・はら）','しょっ角が なく、糸で あみを はる'], k:'こん虫では ない', g:'こん虫では ない（ダニや サソリの なかま）', il:'il_spider_ant'},
 'カブトムシ':{p:['おすは あたまに 大きな つの','かたい はねで からだを 守る','木の しるを すう'], k:'こん虫', g:'たまご → よう虫（土の 中） → さなぎ → せい虫', il:'il_underground'},
 'セミ':{p:['すきとおった はねを 屋根の ように たたむ','おすは はらで 大きな 音を 出して なく','ストローの ような 口で 木の しるを すう'], k:'こん虫', g:'たまご → よう虫（土の 中で 何年も） → せい虫（さなぎに ならない）', il:'il_underground'},
 'カマキリ':{p:['前あしが「かま」の 形で、虫を つかまえる','三角の 頭で、首を よく 動かせる','ほかの 虫を 食べる 肉食'], k:'こん虫', g:'たまご（らんのうで 冬を こす） → よう虫 → せい虫（さなぎに ならない）'},
 'アオムシ（よう虫）':{p:['モンシロチョウの よう虫','緑色で キャベツの 葉を 食べる','このあと さなぎに なる'], k:'こん虫（の よう虫）', g:'たまご → よう虫 → さなぎ → せい虫', il:'cyc_butterfly'},
 'さなぎ':{p:['よう虫と せい虫の 間の すがた','何も 食べず、ほとんど 動かない','中で からだが せい虫に 作りかわる'], k:'こん虫（の さなぎ）', g:'たまご → よう虫 → さなぎ → せい虫', il:'cyc_butterfly'}
};
const PI = {
 'チューリップ':{p:['春に さく','球根から 育つ','赤・黄・白など 色が いろいろ'], s:'春'},
 'タンポポ':{p:['春に 黄色い 花','花の あと わた毛の たね','わた毛は 風で とぶ'], s:'春'},
 'アサガオ':{p:['夏の 朝に さく','つるが ぼうに まきつく','ラッパの 形の 花'], s:'夏'},
 'ミニトマト':{p:['夏に 赤い 実が なる','花は 黄色くて 小さい','実の 中に たねが ある'], s:'夏'},
 'イネ':{p:['秋に 実（お米）が みのる','細長い 葉（平行脈）','田んぼで 育てる'], s:'秋'},
 'ヒマワリ':{p:['夏に 大きな 黄色い 花','花の 中心に たくさんの たね','せが 高く なる'], s:'夏'}
};
const SI = {
 '満月':{p:['まんまるに 光る','太陽の 反対がわに ある','夕方 東から のぼる']},
 '半月':{p:['半分だけ 光る','右半分は 上弦の 月（夕方 南）','満月の 約1週間 前・後']},
 '三日月':{p:['細い 弓の 形','夕方 西の 空に 見える','右がわが 光る']},
 '新月':{p:['光る 面が 見えない','太陽と 同じ がわに ある']},
 '土星':{p:['大きな わ（リング）が ある','太陽系で 2番目に 大きい 惑星']},
 '北斗七星':{p:['ひしゃくの 形の 7つの 星','北の 空に 見える','北極星を さがす 手がかり']},
 'オリオン座':{p:['冬の 星座','赤い ベテルギウスと 白い リゲル','まん中に 3つ ならんだ 星']}
};
const picOf = n => { const a = BUGS.concat(PLANTS, SKY).find(x => x[1]===n); return a ? a[0] : null; };

/* ---------- 図 ---------- */
const T = (x,y,s,o='') => `<text x="${x}" y="${y}" class="tx56 c" ${o.replace(/fill="([^"]+)"/, 'style="fill:$1"')}>${s}</text>`;
const svg = (vb, w, h) => `<svg class="fig56" viewBox="${vb}" width="${w}">${h}</svg>`;
const panels = (pics, caps) => `<div class="pn58">${pics.map((p,i) => `<figure>${p}<figcaption>${caps[i]}</figcaption></figure>`).join('<i>→</i>')}</div>`;
const ilCap = (k, caps) => `<figure class="ilw58">${img(k)}<div class="cap58" style="grid-template-columns:repeat(${caps.length},1fr)">${caps.map(c => `<span>${c}</span>`).join('')}</div></figure>`;
const FIG = {
 il_ant_body:() => `<figure class="ilw58 lab58">${img('il_ant_body')}<b style="left:22%;top:12%">あたま<small>目・しょっ角</small></b><b style="left:46%;top:20%">むね<small>あし6本</small></b><b style="left:78%;top:12%">はら<small>気門</small></b></figure>`,
 il_spider_ant:() => ilCap('il_spider_ant', ['クモ：あし8本・からだ2つ・しょっ角なし','アリ：あし6本・からだ3つ・しょっ角あり']),
 il_grass_cycle:() => ilCap('il_grass_cycle', ['① たまご（土の中）','② よう虫（はねが ない）','③ せい虫']),
 il_dragon_cycle:() => ilCap('il_dragon_cycle', ['① たまご（水の中）','② ヤゴ（水の中）','③ せい虫']),
 il_winter:() => ilCap('il_winter', ['カマキリ：たまご','テントウムシ：せい虫','アゲハ：さなぎ','カブトムシ：よう虫']),
 il_underground:() => ilCap('il_underground', ['セミ：よう虫は 根の しるを すう','カブトムシ：よう虫は ふよう土を 食べる']),
 il_cabbage:() => ilCap('il_cabbage', ['キャベツの 葉に たまごを うむ → アオムシが その 葉を 食べる']),
 il_dango:() => ilCap('il_dango', ['あし 14本・からだが 3つに 分かれない → こん虫では ない']),
 cyc_butterfly:() => panels([img('il_cabbage','sq'), img('rp_caterpillar','sq'), img('rp_pupa','sq'), img('ri_butterfly','sq')], ['① たまご','② よう虫','③ さなぎ','④ せい虫']),
 plantgrow:() => svg('0 0 330 120', 330, [0,1,2,3].map(i => { const x = 40 + i*82; return `<path d="M${x-30} 96 H${x+30}" stroke="#B0855A" stroke-width="3"/>` + (i===0 ? `<ellipse cx="${x}" cy="104" rx="8" ry="5" fill="#8A5A2B"/>` : `<path d="M${x} 96 V${96-i*18}" stroke="#4E9A47" stroke-width="3"/><ellipse cx="${x-9}" cy="${96-i*18+(i>1?14:0)}" rx="9" ry="5" fill="#9ED3A0"/><ellipse cx="${x+9}" cy="${96-i*18+(i>1?14:0)}" rx="9" ry="5" fill="#9ED3A0"/>` + (i>=2 ? `<path d="M${x} ${96-i*18+8} l-14 -8 l4 8 l-6 2z M${x} ${96-i*18+4} l14 -8 l-4 8 l6 2z" fill="#4E9A47"/>` : '') + (i===3 ? `<circle cx="${x}" cy="${96-54}" r="9" fill="#FFB3C1"/><circle cx="${x}" cy="${96-54}" r="3.5" fill="#FFD27A"/>` : '')) + T(x, 118, ['たね','子葉','本葉','花 → たね'][i], 'font-size="11"'); }).join('')),
 roots:() => svg('0 0 300 130', 300, `<path d="M70 20 V40" stroke="#4E9A47" stroke-width="4"/><ellipse cx="60" cy="18" rx="10" ry="5" fill="#9ED3A0"/><ellipse cx="80" cy="18" rx="10" ry="5" fill="#9ED3A0"/><path d="M70 40 V110" stroke="#A0703C" stroke-width="5"/>${[55,70,85,100].map((y,i) => `<path d="M70 ${y} l${i%2?18:-18} 10" stroke="#A0703C" stroke-width="2"/><path d="M70 ${y+5} l${i%2?-15:15} 9" stroke="#A0703C" stroke-width="2"/>`).join('')}${T(70,122,'主根と 側根','font-size="11"')}${T(70,135,'（ホウセンカ）','font-size="9.5"')}
   <path d="M220 10 V40" stroke="#4E9A47" stroke-width="3"/><path d="M220 10 l-12 -6 M220 16 l12 -8" stroke="#4E9A47" stroke-width="3"/>${[-30,-18,-6,6,18,30].map(d => `<path d="M220 40 Q${220+d*0.6} 75 ${220+d} 108" stroke="#A0703C" stroke-width="2" fill="none"/>`).join('')}${T(220,122,'ひげ根','font-size="11"')}${T(220,135,'（イネ・トウモロコシ）','font-size="9.5"')}`).replace('0 0 300 130','0 0 300 140'),
 cherry:() => svg('0 0 320 110', 320, [['春','#FFC4D6'],['夏','#7CC36E'],['秋','#F2A33A'],['冬','']].map(([s,c],i) => { const x = 40 + i*80; return `<path d="M${x} 95 V55 M${x} 65 l-16 -14 M${x} 60 l14 -16" stroke="#8A5A2B" stroke-width="4"/>` + (c ? `<circle cx="${x-8}" cy="45" r="18" fill="${c}"/><circle cx="${x+10}" cy="40" r="18" fill="${c}"/><circle cx="${x}" cy="30" r="16" fill="${c}"/>` : `<circle cx="${x-16}" cy="50" r="3" fill="#C07A50"/><circle cx="${x+14}" cy="43" r="3" fill="#C07A50"/><circle cx="${x}" cy="54" r="3" fill="#C07A50"/>`) + (i===2 ? `<ellipse cx="${x+20}" cy="88" rx="5" ry="3" fill="#E8414B"/>` : '') + T(x, 108, ['春：花','夏：葉','秋：紅葉','冬：芽'][i], 'font-size="11"'); }).join('')),
 hechima:() => svg('0 0 300 120', 300, `<circle cx="80" cy="45" r="28" fill="#FFE27A"/><circle cx="80" cy="45" r="9" fill="#E0A030"/><path d="M80 73 V110" stroke="#4E9A47" stroke-width="3"/>${T(80,118,'おばな：おしべ','font-size="11"')}<circle cx="220" cy="35" r="26" fill="#FFE27A"/><circle cx="220" cy="35" r="7" fill="#9ED3A0"/><ellipse cx="220" cy="80" rx="8" ry="18" fill="#7CC36E"/>${T(220,118,'めばな：めしべ＋下に 実','font-size="11"')}${T(258,82,'← 実に なる','font-size="10" fill="#E8414B"')}`),
 germ:() => svg('0 0 320 120', 320, [['水・空気・温度',1],['水が ない',0],['水の 中（空気が ない）',0],['冷ぞう庫（冷たい）',0]].map(([s,ok],i) => { const x = 40 + i*80; return `<path d="M${x-26} 50 V95 H${x+26} V50" fill="${i===2?'#BFE3FB':'#fff'}" stroke="#8A9BB0" stroke-width="2"/>${i!==1 ? `<rect x="${x-24}" y="${i===2?52:82}" width="48" height="${i===2?42:12}" fill="#BFE3FB" opacity=".8"/>` : ''}<ellipse cx="${x}" cy="${i===2?75:80}" rx="9" ry="6" fill="#C9A16A"/>${ok ? `<path d="M${x} 78 q0 -20 -6 -30" stroke="#4E9A47" stroke-width="3" fill="none"/><ellipse cx="${x-9}" cy="47" rx="7" ry="4" fill="#9ED3A0"/>` : ''}${i===3 ? T(x, 42, '❄','font-size="16"') : ''}${T(x, 18, ok ? '⭕ 発芽' : '❌', `font-size="13" fill="${ok?'#2E7D32':'#C0392B'}"`)}${T(x, 112, s, 'font-size="9.5"')}`; }).join('')),
 medaka:() => svg('0 0 320 110', 320, [0,1].map(i => { const x = 80 + i*160; return `<path d="M${x-55} 50 Q${x-10} 20 ${x+45} 45 L${x+60} 35 L${x+60} 65 L${x+45} 55 Q${x-10} 80 ${x-55} 50z" fill="#F4C46A" stroke="#B0855A"/><circle cx="${x-40}" cy="47" r="4" fill="#333"/>`
   + (i===0 ? `<path d="M${x+5} 33 l12 -12 l4 10 l6 -8 l2 12z" fill="#E8B04B" stroke="#B0855A"/><path d="M${x-10} 63 h40 l-8 14 h-40z" fill="#E8B04B" stroke="#B0855A"/>` : `<path d="M${x+5} 33 l16 -12 l8 14z" fill="#E8B04B" stroke="#B0855A"/><path d="M${x+5} 63 l20 0 l-8 10z" fill="#E8B04B" stroke="#B0855A"/>`)
   + T(x, 100, i===0 ? 'おす：せびれに 切れこみ・しりびれ 大きい' : 'めす：切れこみなし・しりびれ 小さい', 'font-size="10"'); }).join('')),
 shadow:() => svg('0 0 300 120', 300, `<circle cx="40" cy="30" r="16" fill="#FFD54A"/><path d="M40 30 L150 60" stroke="#FFC107" stroke-width="2" stroke-dasharray="4 3"/><rect x="146" y="40" width="8" height="55" fill="#8A5A2B"/><path d="M150 95 L270 95 L270 100 L150 100z" fill="#7A7A7A" opacity=".5"/><path d="M20 98 H290" stroke="#B0855A" stroke-width="2"/>${T(40,62,'太陽','font-size="11"')}${T(220,115,'かげ（太陽の 反対がわ）','font-size="11"')}`),
 sunpath:() => svg('0 0 300 130', 300, `<path d="M30 110 Q150 -10 270 110" fill="none" stroke="#FFB347" stroke-width="3" stroke-dasharray="6 4"/><circle cx="40" cy="95" r="10" fill="#FFD54A"/><circle cx="150" cy="40" r="12" fill="#FFC107"/><circle cx="260" cy="95" r="10" fill="#FF9F43"/><path d="M10 112 H290" stroke="#7CC36E" stroke-width="4"/>${T(30,128,'東（のぼる）','font-size="11"')}${T(150,128,'南（一番 高い）','font-size="11"')}${T(270,128,'西（しずむ）','font-size="11"')}`),
 circuit:() => svg('0 0 300 120', 300, `<rect x="40" y="70" width="60" height="26" rx="4" fill="#E8C468" stroke="#8A6A2A"/><rect x="100" y="76" width="6" height="14" fill="#8A6A2A"/>${T(56,88,'−','font-size="14"')}${T(90,88,'＋','font-size="14"')}<path d="M106 83 H230 V30 H70 V70" fill="none" stroke="#C0763A" stroke-width="3"/><circle cx="150" cy="30" r="14" fill="#FFF3B0" stroke="#C9A100" stroke-width="2"/>${T(150,12,'豆電球','font-size="11"')}${T(160,112,'＋極 → 豆電球 → −極 の「わ」＝ 回路','font-size="11"')}`),
 series:() => svg('0 0 320 130', 320, `<g transform="translate(10 0)"><path d="M20 40 H130 V100 H20 Z" fill="none" stroke="#C0763A" stroke-width="2.5"/><rect x="40" y="92" width="24" height="16" fill="#E8C468"/><rect x="70" y="92" width="24" height="16" fill="#E8C468"/><circle cx="75" cy="40" r="10" fill="#FFF3B0" stroke="#C9A100"/>${T(75,125,'直列：電流が 大きい → 明るい・速い','font-size="10"')}</g>
   <g transform="translate(170 0)"><path d="M20 40 H130 V100 H20 Z M20 70 H130" fill="none" stroke="#C0763A" stroke-width="2.5"/><rect x="60" y="62" width="24" height="16" fill="#E8C468"/><rect x="60" y="92" width="24" height="16" fill="#E8C468"/><circle cx="75" cy="40" r="10" fill="#FFF3B0" stroke="#C9A100"/>${T(75,125,'へい列：1この ときと 同じ・長もち','font-size="10"')}</g>`),
 moonorbit:() => svg('0 0 300 170', 300, `<circle cx="20" cy="85" r="14" fill="#FFD54A"/>${T(20,112,'太陽','font-size="10"')}<path d="M30 85 H70" stroke="#FFC107" stroke-width="2" marker-end=""/><circle cx="170" cy="85" r="14" fill="#4C97FF"/>${T(170,89,'地球','font-size="9" fill="#fff"')}<circle cx="170" cy="85" r="62" fill="none" stroke="#ccc" stroke-dasharray="3 3"/>
   ${[['新月',108,85],['上弦',170,23],['満月',232,85],['下弦',170,147]].map(([n,x,y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#3B4366"/><path d="M${x} ${y-11} A11 11 0 0 0 ${x} ${y+11}Z" fill="#FFE27A"/><text x="${x}" y="${y + (y<85?-15:y>85?24:-15)}" class="tx56 c" font-size="10">${n}</text>`).join('')}${T(240,165,'光る 面は いつも 太陽がわ','font-size="10"')}`),
 tri_summer:() => svg('0 0 260 130', 260, `<rect width="260" height="130" rx="10" fill="#22305A"/><path d="M60 30 L200 40 L150 110 Z" fill="none" stroke="#FFE27A" stroke-dasharray="4 3"/>${[[60,30,'ベガ'],[200,40,'デネブ'],[150,110,'アルタイル']].map(([x,y,n]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/><text x="${x}" y="${y+18}" class="tx56 c" font-size="11" style="fill:#FFE27A">${n}</text>`).join('')}`),
 tri_winter:() => svg('0 0 260 130', 260, `<rect width="260" height="130" rx="10" fill="#22305A"/><path d="M70 30 L200 45 L120 110 Z" fill="none" stroke="#FFE27A" stroke-dasharray="4 3"/>${[[70,30,'ベテルギウス','#FF8A65'],[200,45,'プロキオン','#fff'],[120,110,'シリウス','#fff']].map(([x,y,n,c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/><text x="${x}" y="${y+18}" class="tx56 c" font-size="11" style="fill:#FFE27A">${n}</text>`).join('')}`),
 dipper:() => svg('0 0 280 130', 280, `<rect width="280" height="130" rx="10" fill="#22305A"/>${[[30,90],[60,95],[85,85],[110,75],[140,70],[150,40],[118,35]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff"/>`).join('')}<path d="M30 90 L60 95 L85 85 L110 75 L140 70 L150 40 L118 35 L110 75" fill="none" stroke="#9FB4E6"/><path d="M150 40 L235 25" stroke="#FFE27A" stroke-dasharray="4 3"/><circle cx="240" cy="24" r="6" fill="#FFE27A"/>${T(240,48,'北極星','font-size="11" fill="#FFE27A"')}${T(70,120,'北斗七星','font-size="11" fill="#9FB4E6"')}${T(195,20,'×5','font-size="10" fill="#FFE27A"')}`),
 arm:() => svg('0 0 300 120', 300, `<path d="M40 40 L130 40 L200 100" stroke="#F2D2B0" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M40 40 L130 40 L200 100" stroke="#E0B890" stroke-width="2" fill="none"/><ellipse cx="85" cy="30" rx="34" ry="11" fill="#E8414B" opacity=".75"/><ellipse cx="85" cy="52" rx="34" ry="7" fill="#4C97FF" opacity=".6"/><circle cx="130" cy="40" r="7" fill="#fff" stroke="#999"/>${T(85,12,'うちがわ：ちぢむ','font-size="11" fill="#C0392B"')}${T(85,75,'そとがわ：ゆるむ','font-size="11" fill="#1C6AAE"')}${T(160,30,'関節','font-size="11"')}`),
 pend:() => svg('0 0 300 130', 300, `<path d="M20 10 H280" stroke="#8A5A2B" stroke-width="4"/><path d="M80 10 L60 70" stroke="#555"/><circle cx="60" cy="70" r="9" fill="#4C97FF"/><path d="M80 10 L100 70" stroke="#bbb" stroke-dasharray="3 3"/>${T(80,95,'短い → 速く ゆれる','font-size="11"')}<path d="M210 10 L180 110" stroke="#555"/><circle cx="180" cy="110" r="9" fill="#E8414B"/><path d="M210 10 L240 110" stroke="#bbb" stroke-dasharray="3 3"/>${T(210,126,'長い → ゆっくり','font-size="11"')}`),
 lever3:() => svg('0 0 300 110', 300, `<path d="M20 60 H280" stroke="#8A5A2B" stroke-width="7"/><path d="M110 64 l-14 30 h28z" fill="#999"/><rect x="30" y="34" width="30" height="24" fill="#FFB347"/><path d="M265 30 v26" stroke="#E8414B" stroke-width="3"/><path d="M258 48 l7 10 l7 -10" fill="#E8414B"/>${T(45,28,'作用点','font-size="11"')}${T(110,108,'支点','font-size="11"')}${T(265,22,'力点','font-size="11" fill="#C0392B"')}${T(190,85,'支点から 遠いほど 小さい 力で 上がる','font-size="10"')}`),
 filter:() => svg('0 0 200 140', 200, `<path d="M70 20 L130 20 L105 60 L95 60Z" fill="#fff" stroke="#999"/><path d="M100 60 V110" stroke="#999" stroke-width="3"/><rect x="70" y="95" width="60" height="40" rx="4" fill="#DDF2FF" stroke="#7FB6E6"/><path d="M50 10 L80 30" stroke="#7FB6E6" stroke-width="5"/>${T(150,40,'ろ紙に 残る','font-size="11"')}${T(160,120,'とけた ものは 通る','font-size="11"')}`),
 litmus:() => svg('0 0 300 110', 300, [['酸性','#E8414B','#E8414B','塩酸・酢・炭酸水'],['中性','#4C97FF','#E8414B','食塩水・さとう水'],['アルカリ性','#4C97FF','#4C97FF','石灰水・アンモニア水']].map(([n,b,r,e],i) => { const x = 50 + i*100; return `<rect x="${x-26}" y="20" width="18" height="44" rx="3" fill="${b}"/><rect x="${x+6}" y="20" width="18" height="44" rx="3" fill="${r}"/>${T(x,14,n,'font-size="12"')}${T(x,82,'青紙　赤紙','font-size="9"')}${T(x,100,e,'font-size="9"')}`; }).join('')),
 btb:() => svg('0 0 300 90', 300, [['酸性','#F2D33A'],['中性','#59C059'],['アルカリ性','#4C97FF']].map(([n,c],i) => { const x = 50 + i*100; return `<path d="M${x-18} 15 V60 Q${x} 75 ${x+18} 60 V15" fill="${c}" stroke="#888"/>${T(x,86,n,'font-size="12"')}`; }).join('')),
 gas:() => svg('0 0 330 120', 330, [['水上置換','水に とけにくい（酸素・水素）'],['上方置換','とけやすく 軽い（アンモニア）'],['下方置換','とけやすく 重い（二酸化炭素も 可）']].map(([n,e],i) => { const x = 55 + i*110; return (i===0 ? `<rect x="${x-35}" y="55" width="70" height="35" fill="#BFE3FB"/><rect x="${x-10}" y="30" width="20" height="45" fill="#fff" stroke="#888"/>` : i===1 ? `<rect x="${x-10}" y="25" width="20" height="45" fill="#fff" stroke="#888"/><path d="M${x} 90 V40" stroke="#C0763A" stroke-width="3"/>` : `<rect x="${x-10}" y="40" width="20" height="45" fill="#fff" stroke="#888"/><path d="M${x} 15 V80" stroke="#C0763A" stroke-width="3"/>`) + T(x, 104, n, 'font-size="11"') + T(x, 117, e, 'font-size="8.5"'); }).join('')),
 air:() => svg('0 0 300 50', 300, `<rect x="10" y="10" width="${280*0.78}" height="24" fill="#BFD9F5"/><rect x="${10+280*0.78}" y="10" width="${280*0.21}" height="24" fill="#FFB3B3"/><rect x="${10+280*0.99}" y="10" width="3" height="24" fill="#555"/>${T(10+140*0.78,27,'ちっ素 約78%','font-size="11"')}${T(10+280*0.78+280*0.105,27,'酸素 21%','font-size="10"')}${T(260,48,'その他（二酸化炭素など）1%','font-size="9"')}`),
 strata:() => svg('0 0 300 130', 300, [['れき','#C9A16A'],['砂','#EAD39C'],['どろ','#A8876A'],['火山灰','#D9D9D9'],['砂','#EAD39C']].map(([n,c],i) => `<rect x="20" y="${10+i*22}" width="200" height="22" fill="${c}" stroke="#fff"/>${T(255,26+i*22,n,'font-size="11"')}`).join('') + `<path d="M60 76 q6 -8 12 0 q-6 6 -12 0" fill="#fff" stroke="#8A6A4A"/>${T(120,125,'つぶの 大きさごとに つもって しま模様に','font-size="10"')}`),
 river:() => FIG_OLD('land'),
 quake:() => svg('0 0 300 120', 300, `<rect x="10" y="40" width="280" height="75" fill="#D8C3A0"/><path d="M10 40 H290" stroke="#7CC36E" stroke-width="4"/><circle cx="150" cy="95" r="8" fill="#E8414B"/>${[16,28,40].map(r => `<circle cx="150" cy="95" r="${r}" fill="none" stroke="#E8414B" opacity=".4"/>`).join('')}<path d="M150 87 V42" stroke="#555" stroke-dasharray="4 3"/><path d="M143 36 l7 -10 l7 10z" fill="#1C6AAE"/>${T(185,99,'震源','font-size="12" fill="#C0392B"')}${T(150,20,'震央（震源の 真上）','font-size="12" fill="#1C6AAE"')}`),
 rock2:() => svg('0 0 300 120', 300, `<rect x="20" y="15" width="110" height="80" rx="8" fill="#9A9A9A"/>${[...Array(40)].map((_,i) => `<circle cx="${28+(i*37)%96}" cy="${22+(i*53)%66}" r="1.3" fill="#666"/>`).join('')}${[[45,35],[90,55],[60,75],[105,30]].map(([x,y]) => `<rect x="${x}" y="${y}" width="12" height="8" fill="#F2F2F2" transform="rotate(20 ${x} ${y})"/>`).join('')}${T(75,110,'火山岩','font-size="11"')}${T(75,124,'こまかい つぶ＋大きな 結晶','font-size="9"')}
   <rect x="170" y="15" width="110" height="80" rx="8" fill="#E9E1D6"/>${[...Array(18)].map((_,i) => `<rect x="${172+(i%6)*18}" y="${18+Math.floor(i/6)*25}" width="16" height="22" fill="${['#F5F1EA','#D6CFC4','#3A3A3A','#F0D9C8'][i%4]}"/>`).join('')}${T(225,110,'深成岩','font-size="11"')}${T(225,124,'大きな 結晶が そろう','font-size="9"')}`).replace('0 0 300 120','0 0 300 130'),
 front:() => svg('0 0 300 110', 300, `<path d="M20 90 Q100 40 150 60 T280 50" fill="none" stroke="#4C97FF" stroke-width="4"/>${[60,110,160].map(x => `<path d="M${x} 72 l8 -14 l8 14z" fill="#4C97FF"/>`).join('')}${T(90,105,'寒冷前線：積乱雲・短く 強い 雨 → 気温 下がる','font-size="10"')}<path d="M190 30 l60 0" stroke="#E8414B" stroke-width="4"/>${[200,230].map(x => `<path d="M${x} 30 a8 8 0 0 1 16 0" fill="#E8414B"/>`).join('')}${T(220,20,'温暖前線：乱層雲・長い 雨','font-size="10"')}`),
 planets:() => svg('0 0 330 80', 330, [['水',3,'#B0A090'],['金',6,'#E8C468'],['地',6.5,'#4C97FF'],['火',4,'#E8714B'],['木',18,'#D9A066'],['土',15,'#E8D08A'],['天',10,'#9ED3E0'],['海',10,'#4C6FE0']].reduce((a,[n,r,c]) => { const x = a.x + r + 6; a.h += `<circle cx="${x}" cy="40" r="${r}" fill="${c}"/>${n==='土' ? `<ellipse cx="${x}" cy="40" rx="${r+8}" ry="3" fill="none" stroke="#B89A5A" stroke-width="2"/>` : ''}<text x="${x}" y="74" class="tx56 c" font-size="10">${n}星</text>`; a.x = x + r + 6; return a; }, {x:4, h:'<circle cx="-30" cy="40" r="38" fill="#FFD54A"/>'}).h),
 mag:() => svg('0 0 320 120', 320, `<rect x="20" y="20" width="60" height="30" fill="#E8414B"/><rect x="80" y="20" width="60" height="30" fill="#4C97FF"/>${T(50,40,'N','fill="#fff"')}${T(110,40,'S','fill="#fff"')}${T(80,68,'力が 強いのは 両はし','font-size="10"')}<rect x="175" y="18" width="14" height="34" rx="2" fill="#9AA3AE"/>${T(182,64,'鉄 ⭕','font-size="10"')}<rect x="215" y="18" width="22" height="34" rx="4" fill="#D8DDE3"/>${T(226,64,'アルミ ❌','font-size="10"')}<circle cx="275" cy="35" r="16" fill="#C77D4A"/>${T(275,64,'銅 ❌','font-size="10"')}${T(160,92,'同じ きょく → しりぞけ合う','font-size="10.5"')}${T(160,110,'ちがう きょく → 引き合う','font-size="10.5"')}`),
 cell:() => svg('0 0 300 120', 300, `<rect x="20" y="15" width="110" height="80" rx="6" fill="#DFF2D3" stroke="#3C8A2E" stroke-width="5"/><rect x="40" y="35" width="70" height="40" rx="8" fill="#E3F4FF"/><circle cx="105" cy="30" r="8" fill="#B39DDB"/>${[[35,85],[60,25],[120,80],[30,50]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#4E9A47"/>`).join('')}${T(75,112,'植物：細胞かべ・葉緑体・液ほう','font-size="10"')}
   <ellipse cx="225" cy="55" rx="55" ry="40" fill="#FFE9E0" stroke="#E0A080" stroke-width="2"/><circle cx="225" cy="55" r="10" fill="#B39DDB"/>${T(225,112,'動物：細胞まく・核','font-size="10"')}`)
};
const T2 = (x,y,a,b,fs=10) => T(x,y,a,`font-size="${fs+1}"`) + (b ? T(x,y+13,b,`font-size="${fs-0.5}"`) : '');
Object.assign(FIG, {
 germ:() => svg('0 0 330 135', 330, [['水・空気','・温度',1],['水が','ない',0],['水の中','（空気なし）',0],['冷ぞう庫','（冷たい）',0]].map(([a,b,ok],i) => { const x = 42 + i*82; return `<path d="M${x-26} 50 V95 H${x+26} V50" fill="${i===2?'#BFE3FB':'#fff'}" stroke="#8A9BB0" stroke-width="2"/>${i!==1 ? `<rect x="${x-24}" y="${i===2?52:82}" width="48" height="${i===2?42:12}" fill="#BFE3FB" opacity=".8"/>` : ''}<ellipse cx="${x}" cy="${i===2?75:80}" rx="9" ry="6" fill="#C9A16A"/>${ok ? `<path d="M${x} 78 q0 -20 -6 -30" stroke="#4E9A47" stroke-width="3" fill="none"/><ellipse cx="${x-9}" cy="47" rx="7" ry="4" fill="#9ED3A0"/>` : ''}${i===3 ? `<circle cx="${x}" cy="38" r="5" fill="#9FD0F5"/>` : ''}${T(x, 18, ok ? '発芽する' : '発芽しない', `font-size="11" fill="${ok?'#2E7D32':'#C0392B'}"`)}${T2(x, 112, a, b)}`; }).join('')),
 medaka:() => svg('0 0 330 125', 330, [0,1].map(i => { const x = 85 + i*160; return `<path d="M${x-55} 50 Q${x-10} 20 ${x+45} 45 L${x+60} 35 L${x+60} 65 L${x+45} 55 Q${x-10} 80 ${x-55} 50z" fill="#F4C46A" stroke="#B0855A"/><circle cx="${x-40}" cy="47" r="4" fill="#333"/>`
   + (i===0 ? `<path d="M${x+5} 33 l12 -12 l4 10 l6 -8 l2 12z" fill="#E8B04B" stroke="#B0855A"/><path d="M${x-10} 63 h40 l-8 14 h-40z" fill="#E8B04B" stroke="#B0855A"/>` : `<path d="M${x+5} 33 l16 -12 l8 14z" fill="#E8B04B" stroke="#B0855A"/><path d="M${x+5} 63 l20 0 l-8 10z" fill="#E8B04B" stroke="#B0855A"/>`)
   + T2(x, 96, i===0 ? 'おす：せびれに 切れこみ' : 'めす：切れこみ なし', i===0 ? 'しりびれが 大きい' : 'しりびれが 小さい', 9.5); }).join('')),
 sunpath:() => svg('-20 0 340 135', 320, `<path d="M30 110 Q150 -10 270 110" fill="none" stroke="#FFB347" stroke-width="3" stroke-dasharray="6 4"/><circle cx="40" cy="95" r="10" fill="#FFD54A"/><circle cx="150" cy="40" r="12" fill="#FFC107"/><circle cx="260" cy="95" r="10" fill="#FF9F43"/><path d="M0 112 H300" stroke="#7CC36E" stroke-width="4"/>${T2(30,126,'東','のぼる')}${T2(150,126,'南','一番 高い')}${T2(270,126,'西','しずむ')}`.replace(/126/g,'124')).replace('0 340 135','0 340 150'),
 series:() => svg('0 0 320 145', 320, `<g transform="translate(10 0)"><path d="M20 40 H130 V100 H20 Z" fill="none" stroke="#C0763A" stroke-width="2.5"/><rect x="40" y="92" width="24" height="16" fill="#E8C468"/><rect x="70" y="92" width="24" height="16" fill="#E8C468"/><circle cx="75" cy="40" r="10" fill="#FFF3B0" stroke="#C9A100"/>${T2(75,124,'直列つなぎ','電流が 大きい（明るい）')}</g>
   <g transform="translate(170 0)"><path d="M20 40 H130 V100 H20 Z M20 70 H130" fill="none" stroke="#C0763A" stroke-width="2.5"/><rect x="60" y="62" width="24" height="16" fill="#E8C468"/><rect x="60" y="92" width="24" height="16" fill="#E8C468"/><circle cx="75" cy="40" r="10" fill="#FFF3B0" stroke="#C9A100"/>${T2(75,124,'へい列つなぎ','1この ときと 同じ・長もち')}</g>`),
 moonorbit:() => svg('0 0 300 190', 300, `<circle cx="22" cy="95" r="14" fill="#FFD54A"/>${T(22,122,'太陽','font-size="10"')}<path d="M40 95 H90" stroke="#FFC107" stroke-width="2" stroke-dasharray="4 3"/><circle cx="180" cy="95" r="14" fill="#4C97FF"/>${T(180,99,'地球','font-size="9" fill="#fff"')}<circle cx="180" cy="95" r="62" fill="none" stroke="#ccc" stroke-dasharray="3 3"/>
   ${[['新月',118,95,0,-18],['上弦',180,33,30,4],['満月',242,95,0,-18],['下弦',180,157,30,4]].map(([n,x,y,dx,dy]) => `<circle cx="${x}" cy="${y}" r="11" fill="#3B4366"/><path d="M${x} ${y-11} A11 11 0 0 0 ${x} ${y+11}Z" fill="#FFE27A"/>${T(x+dx, y+dy, n, 'font-size="10.5"')}`).join('')}${T(150,185,'光る 面は いつも 太陽の がわ','font-size="10.5"')}`),
 lever3:() => svg('0 0 300 125', 300, `<path d="M20 60 H280" stroke="#8A5A2B" stroke-width="7"/><path d="M110 64 l-14 30 h28z" fill="#999"/><rect x="30" y="34" width="30" height="24" fill="#FFB347"/><path d="M265 30 v26" stroke="#E8414B" stroke-width="3"/><path d="M258 48 l7 10 l7 -10" fill="#E8414B"/>${T(45,28,'作用点','font-size="11"')}${T(110,108,'支点','font-size="11"')}${T(265,22,'力点','font-size="11" fill="#C0392B"')}${T(200,88,'支点から 遠いほど','font-size="10"')}${T(200,101,'小さい 力で 上がる','font-size="10"')}`),
 filter:() => svg('0 0 260 140', 260, `<path d="M70 20 L130 20 L105 60 L95 60Z" fill="#fff" stroke="#999"/><path d="M100 60 V110" stroke="#999" stroke-width="3"/><rect x="70" y="95" width="60" height="40" rx="4" fill="#DDF2FF" stroke="#7FB6E6"/><path d="M50 8 L78 26" stroke="#7FB6E6" stroke-width="5"/>${T(195,34,'とけ残りは','font-size="11"')}${T(195,47,'ろ紙に 残る','font-size="11"')}${T(195,112,'とけた ものは','font-size="11"')}${T(195,125,'通りぬける','font-size="11"')}`),
 litmus:() => svg('0 0 300 125', 300, [['酸性','#E8414B','#E8414B','塩酸・酢','炭酸水'],['中性','#4C97FF','#E8414B','食塩水','さとう水'],['アルカリ性','#4C97FF','#4C97FF','石灰水','アンモニア水']].map(([n,b,r,e1,e2],i) => { const x = 50 + i*100; return `<rect x="${x-26}" y="20" width="18" height="44" rx="3" fill="${b}"/><rect x="${x+6}" y="20" width="18" height="44" rx="3" fill="${r}"/>${T(x,14,n,'font-size="12"')}${T(x,80,'青紙　赤紙','font-size="9"')}${T(x,98,e1,'font-size="9.5"')}${T(x,111,e2,'font-size="9.5"')}`; }).join('')),
 gas:() => svg('0 0 330 135', 330, [['水上置換','水に とけにくい','酸素・水素'],['上方置換','とけやすく 軽い','アンモニア'],['下方置換','とけやすく 重い','二酸化炭素']].map(([n,a,b],i) => { const x = 55 + i*110; return (i===0 ? `<rect x="${x-35}" y="55" width="70" height="35" fill="#BFE3FB"/><rect x="${x-10}" y="30" width="20" height="45" fill="#fff" stroke="#888"/>` : i===1 ? `<rect x="${x-10}" y="25" width="20" height="45" fill="#fff" stroke="#888"/><path d="M${x} 90 V40" stroke="#C0763A" stroke-width="3"/>` : `<rect x="${x-10}" y="40" width="20" height="45" fill="#fff" stroke="#888"/><path d="M${x} 15 V80" stroke="#C0763A" stroke-width="3"/>`) + T(x, 104, n, 'font-size="11.5"') + T(x, 118, a, 'font-size="9"') + T(x, 130, b, 'font-size="9"'); }).join('')),
 air:() => svg('0 0 300 62', 300, `<rect x="10" y="10" width="${280*0.78}" height="24" fill="#BFD9F5"/><rect x="${10+280*0.78}" y="10" width="${280*0.21}" height="24" fill="#FFB3B3"/><rect x="${10+280*0.99}" y="10" width="3" height="24" fill="#555"/>${T(10+140*0.78,27,'ちっ素 約78%','font-size="11"')}${T(10+280*0.78+280*0.105,27,'酸素21%','font-size="9.5"')}${T(205,52,'のこり 約1%（二酸化炭素は 約0.04%）','font-size="9.5"')}`),
 strata:() => svg('0 0 300 140', 300, [['れき','#C9A16A'],['砂','#EAD39C'],['どろ','#A8876A'],['火山灰','#D9D9D9'],['砂','#EAD39C']].map(([n,c],i) => `<rect x="20" y="${10+i*22}" width="200" height="22" fill="${c}" stroke="#fff"/>${T(255,26+i*22,n,'font-size="11"')}`).join('') + `<path d="M60 76 q6 -8 12 0 q-6 6 -12 0" fill="#fff" stroke="#8A6A4A"/>${T(150,135,'つぶの 大きさごとに つもって しま模様に なる','font-size="10"')}`),
 front:() => svg('0 0 300 135', 300, `<path d="M20 70 Q100 30 150 45 T280 40" fill="none" stroke="#4C97FF" stroke-width="4"/>${[60,110,160].map(x => `<path d="M${x} 56 l8 -14 l8 14z" fill="#4C97FF"/>`).join('')}${T(150,95,'寒冷前線：積乱雲・短く 強い 雨','font-size="10.5"')}${T(150,109,'通過後 気温が 下がる','font-size="10"')}<path d="M190 18 h70" stroke="#E8414B" stroke-width="4"/>${[200,232].map(x => `<path d="M${x} 18 a8 8 0 0 1 16 0" fill="#E8414B"/>`).join('')}${T(150,126,'温暖前線：乱層雲・長い おだやかな 雨','font-size="10.5" fill="#C0392B"')}`),
 planets:() => svg('-40 0 380 95', 330, [['水',3,'#B0A090'],['金',6,'#E8C468'],['地',6.5,'#4C97FF'],['火',4,'#E8714B'],['木',18,'#D9A066'],['土',15,'#E8D08A'],['天',10,'#9ED3E0'],['海',10,'#4C6FE0']].reduce((a,[n,r,c],i) => { const x = a.x + Math.max(r, 8) + 7; a.h += `<circle cx="${x}" cy="40" r="${r}" fill="${c}"/>${n==='土' ? `<ellipse cx="${x}" cy="40" rx="${r+8}" ry="3" fill="none" stroke="#B89A5A" stroke-width="2"/>` : ''}<text x="${x}" y="${i%2 ? 88 : 74}" class="tx56 c" font-size="10">${n}星</text>`; a.x = x + Math.max(r, 8) + 7; return a; }, {x:4, h:'<circle cx="-30" cy="40" r="32" fill="#FFD54A"/><text x="-26" y="44" class="tx56 c" font-size="10">太陽</text>'}).h),
 cell:() => svg('0 0 300 135', 300, `<rect x="20" y="15" width="110" height="80" rx="6" fill="#DFF2D3" stroke="#3C8A2E" stroke-width="5"/><rect x="40" y="35" width="70" height="40" rx="8" fill="#E3F4FF"/><circle cx="105" cy="30" r="8" fill="#B39DDB"/>${[[35,85],[60,25],[120,80],[30,50]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#4E9A47"/>`).join('')}${T2(75,112,'植物の 細胞','細胞かべ・葉緑体・液ほう')}
   <ellipse cx="225" cy="55" rx="55" ry="40" fill="#FFE9E0" stroke="#E0A080" stroke-width="2"/><circle cx="225" cy="55" r="10" fill="#B39DDB"/>${T2(225,112,'動物の 細胞','細胞まく・核')}`)
});
/* v5.8.1：植物まわりも イラストに */
const LB = (k, labs) => `<figure class="ilw58 lab58">${img(k)}${labs.map(([t,s,x,y]) => `<b style="left:${x}%;top:${y}%">${t}${s ? `<small>${s}</small>` : ''}</b>`).join('')}</figure>`;
Object.assign(FIG, {
 cyc_butterfly:() => ilCap('il_butterfly_cycle', ['① たまご','② よう虫','③ さなぎ','④ せい虫']),
 plantgrow:() => ilCap('il_plantgrow', ['① たね','② 子葉','③ 本葉','④ 花']),
 roots:() => ilCap('il_roots', ['主根と 側根（ホウセンカ）','ひげ根（トウモロコシ・イネ）']),
 cherry:() => ilCap('il_cherry', ['春：花','夏：葉','秋：紅葉・落葉','冬：芽']),
 hechima:() => ilCap('il_hechima', ['おばな：おしべ','めばな：めしべ・下に 実']),
 flower:() => LB('il_flower_cut', [['めしべ','先に 花粉が つく',50,2],['おしべ','花粉を つくる',22,14],['花びら','',86,30],['がく','',20,66],['子房','実に なる',50,82]]),
 plant:() => LB('il_sunflower', [['花','',72,10],['葉','',78,30],['くき','',40,55],['根','水を すう',66,82]]),
 il_seeds:() => ilCap('il_seeds', ['風で とぶ（タンポポ）','動物に くっつく','はじけて とぶ','回って 落ちる（カエデ）']),
 il_bee:() => ilCap('il_bee_pollen', ['こん虫が 花粉を はこび、めしべの 先に つける（受粉）'])
});
Object.assign(EXP, {});
[['plant|12','il_seeds'],['plant|3','plant'],['flower|0','il_bee'],['flower|3','flower'],['bug|5','cyc_butterfly']].forEach(([k,f]) => { if(EXP[k]) EXP[k][0] = f; });
BI['アオムシ（よう虫）'].il = 'cyc_butterfly'; BI['さなぎ'].il = 'cyc_butterfly'; BI['ミツバチ'].il = 'il_bee';
PI['タンポポ'].il = 'il_seeds'; PI['ヒマワリ'].il = 'plant'; PI['チューリップ'].il = 'plantgrow'; PI['アサガオ'].il = 'plantgrow'; PI['ミニトマト'].il = 'flower'; PI['イネ'].il = 'roots';
let FIG_OLD = () => '';
const figHTML = k => { if(!k) return ''; if(FIG[k]) return FIG[k](); if(/^(rp_|ri_)/.test(k)) return `<div class="pp56"><span class="ok">${img(k)}</span></div>`; return FIG_OLD(k); };

/* ---------- 絵の 問題 ---------- */
const featBox = (n, D, cls) => D ? `<div class="ft58 ${cls}"><div class="ftPic">${picOf(n) ? img(picOf(n)) : ''}</div><div><b>${cls==='ok' ? '🔴 正しい こたえ' : '🔵 きみの こたえ'}：${X(n)}</b><ul>${D.p.map(x => `<li>${X(x)}</li>`).join('')}</ul>${D.g ? `<small>育ち方：${X(D.g)}</small>` : D.s ? `<small>花・実の 季節：${X(D.s)}</small>` : ''}</div></div>` : '';
function picExp(p, v){
  const ans = String(p.ans), sub = String(p.sub||''), out = {figs:[], steps:[], tip:'', why:''};
  const D = BI[ans] || PI[ans] || SI[ans];
  if(D){   // なまえを 当てる 問題
    out.figs.push(`<div class="ftw58">${featBox(ans, D, 'ok')}${v && v!==ans ? featBox(v, BI[v] || PI[v] || SI[v], 'ng') : ''}</div>`);
    const Dv = BI[v] || PI[v] || SI[v];
    if(Dv && v!==ans) out.why = `見分けポイント：${X(ans)}は「${X(D.p[0])}」、${X(v)}は「${X(Dv.p[0])}」`;
    if(D.il && FIG[D.il]) out.figs.push(FIG[D.il]());
    out.steps.push(`<b>${X(ans)}</b> の いちばんの 目じるしは「${X(D.p[0])}」だよ`);
    out.tip = BI[ans] ? 'あしの 数・からだの 分かれ方・はねや 口の 形を よく 見よう' : PI[ans] ? '花の 形・葉の 形・さく 季節を セットで おぼえよう' : '形と 見える 方角・時こくを セットで おぼえよう';
    return out;
  }
  const B = BI[sub], P = PI[sub];
  if(B){   // こん虫？
    const insect = !/ない/.test(B.k);
    out.figs.push(`<div class="ftw58">${featBox(sub, B, 'ok')}</div>`);
    out.steps.push(insect ? `${X(sub)}は あしが 6本・からだが あたま・むね・はら の 3つ → <b>こん虫</b>` : `${X(sub)}は あしが 8本・からだが 2つ・しょっ角が ない → <b>こん虫では ない</b>`);
    if(sub==='アオムシ（よう虫）' || sub==='さなぎ') out.steps.push('よう虫や さなぎは とちゅうの すがた。育つと 6本あしの チョウに なるので こん虫だよ');
    out.figs.push(FIG[insect ? (B.il && B.il!=='il_spider_ant' ? B.il : 'il_ant_body') : 'il_spider_ant']());
    out.tip = 'こん虫の 3つの きまり：① あし6本 ② からだが 3つ ③ しょっ角2本'; return out;
  }
  if(P){   // 季節
    out.figs.push(`<div class="ftw58">${featBox(sub, P, 'ok')}</div>`); out.figs.push(FIG.cherry());
    out.steps.push(`${X(sub)}は <b>${X(P.s)}</b> に ${sub==='イネ' || sub==='ミニトマト' ? '実が みのる' : '花が さく'}よ`);
    if(v && v!==ans){ const o = Object.entries(PI).filter(([,d]) => d.s===v).map(([k]) => k); if(o.length) out.why = `${X(v)}に さくのは ${o.map(X).join('・')} などだよ`; }
    out.tip = '春：チューリップ・タンポポ　夏：アサガオ・ヒマワリ　秋：コスモス・イネ'; return out;
  }
  return null;
}

/* ---------- メイン ---------- */
window.__sciExp58 = function(p, v){
  const u = p.u; if(!u || !String(u).startsWith('r_')) return null;
  if(u==='r_bugpic' || u==='r_plantpic' || (u==='r_sky' || u==='r_moon') && /絵の/.test(String(p.q))){ const r = picExp(p, v); if(r) return r; }
  const key = BY_Q[p.sub] || BY_Q[String(p.q||'').replace(/<[^>]+>/g,'')]; const E = key && EXP[key]; if(!E) return null;
  const out = {figs:[], steps:[], tip:'', why:''}, ans = String(p.ans);
  out.steps.push(`<b>${X(String(p.q).replace(/<[^>]+>/g,''))}</b> → <b class="okc">${X(ans)}</b>`);
  out.steps.push(E[1]);
  if(v && v!==ans){ const g = GL[v] || GL[String(v).replace(/（.*）/,'')]; if(g) out.why = `きみが えらんだ「${X(v)}」は：${X(g)}`; }
  const f = figHTML(E[0]); if(f) out.figs.push(f);
  const g2 = GL[ans]; if(g2 && !E[1].includes(g2)) out.tip = `「${X(ans)}」＝ ${X(g2)}`;
  return out;
};
window.__fig58 = (k, old) => { FIG_OLD = old; return figHTML(k); };
window.__v58 = {EXP, BY_Q, GL, BI, PI, SI, FIG, VER58};
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER58}`; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   v5.9：しゃかいの 問題文の ことばを なおす
   ===================================================================== */
(function(){
'use strict';
const VER59 = '5.9.0';
const fixQ = (u, f) => { const U = MATH_UNITS[u]; if(!U) return; const g = U.gen; U.gen = function(){ const p = g.apply(this, arguments); try{ f(p); }catch(e){} return p; }; };
/* 「たけくらべを 書いた 女性作家 人物は？」→「たけくらべを 書いた 女性作家は だれ？」 */
const who = p => { p.q = String(p.q).replace(/<b>([^<]+)<\/b> 人物は？/, (m, s) => /(た|だ|る|い)$/.test(s) ? `<b>${s}</b> 人物は？` : `<b>${s}</b> は だれ？`); };
fixQ('j_person', who); fixQ('w_person', who);
/* 世界遺産：「海に 立つ 大鳥居 世界遺産は？」→「「海に 立つ 大鳥居」の 世界遺産は どれ？」 */
const her = p => { p.q = String(p.q).replace(/^<b>([^<]+)<\/b> 世界遺産は？$/, (m, t) => { t = t.replace(/^「(.*)」$/, '$1').replace(/「/g,'『').replace(/」/g,'』'); return `ヒント「<b>${t}</b>」<br>この 世界遺産は どれ？`; }); };
fixQ('j_her', her); fixQ('w_her', her);
/* こたえが 問題文に 書いてあった 問題 */
fixQ('w_geo', p => { if(/レアメタルなどの 鉱産資源/.test(p.q)) p.q = 'アフリカなどで とれる、コバルトや プラチナのように 量が 少なく めずらしい 金属を 何という？'; });
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER59}`; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   まなびタウン v6.0
   ・しゃかい（地形・季節風）と りか（人の 体）の かいせつに イラスト
   ・むずかしい ことばに ルビ（読みがな）
   ===================================================================== */
(function(){
'use strict';
const VER60 = '6.0.0';
const IL = './assets/images/v58/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
/* イラスト＋ひきだし線つきの ラベル  L: [文字, 小さい文字, ラベルx%, ラベルy%, 指す点x%, 指す点y%] */
function lab(k, L, cap){
  const lines = L.filter(l => l[4] != null).map(l => `<line x1="${l[2]}" y1="${l[3]}" x2="${l[4]}" y2="${l[5]}" stroke="#E8414B" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${l[4]}" cy="${l[5]}" r=".9" fill="#E8414B"/>`).join('');
  return `<figure class="il60"><div class="il60w"><img src="${IL + k}.webp" alt=""><svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${L.map(l => `<b style="left:${l[2]}%;top:${l[3]}%">${l[0]}${l[1] ? `<small>${l[1]}</small>` : ''}</b>`).join('')}</div>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
}
const ILL = {
 '扇状地':() => lab('il_fan', [['扇状地','石や 砂が 扇の 形に つもる',72,30,56,47],['果樹園','水はけが よい',18,90,22,68],['山から 出る 川','',30,10,47,22]], '川が 山から 平地に 出る ところに できる'),
 '三角州':() => lab('il_delta', [['三角州','砂や どろが つもった 平らな 土地',28,90,50,62],['河口','川が 海に 出る ところ',82,92,64,80],['川が 分かれる','',80,12,57,32]], '川が 海に 出る ところに できる 三角形の 土地'),
 '盆地':() => lab('il_basin', [['盆地','山に かこまれた 平らな 土地',50,52,null,null],['山','',14,22,22,40],['山','',86,24,80,40]], '夏は 暑く、冬は 寒く なりやすい'),
 'リアス海岸':() => lab('il_ria', [['リアス海岸','入り組んだ ギザギザの 海岸',72,14,55,26],['養殖の いかだ','波が おだやか',26,93,33,73]], '山が 海に しずんで できた。三陸海岸・志摩半島など'),
 '養殖業':() => lab('il_ria', [['養殖の いかだ','出荷まで 育てる',26,93,33,73],['港','',80,92,78,72]], 'かき・ほたて・わかめ などを 育てる'),
 'monsoon':() => lab('il_monsoon', [['北西の 季節風','',16,10,10,24],['日本海側：雪','しめった 風が 山に ぶつかる',22,92,30,70],['山脈','',58,8,53,25],['太平洋側：晴れ','かわいた 風が ふく',80,92,82,68]], '冬は 日本海側に 雪が 多く、太平洋側は 晴れて かんそうする'),
 'skeleton':() => lab('il_skeleton', [['頭の ほね','のうを 守る',18,8,48,12],['ろっ骨','心ぞう・はいを 守る',84,26,54,34],['せぼね','体を ささえる',16,38,49,42],['こつばん','',16,54,45,50],['関節','曲がる ところ',84,64,54,70]], ''),
 'organs':() => lab('il_organs', [['はい','',12,34,39,40],['心ぞう','',88,30,51,43],['かん臓','',12,50,42,56],['胃','',88,48,56,56],['じん臓','',12,64,37,65],['小腸','',12,84,47,76],['大腸','',88,72,59,73]], '食べものの 通り道：口 → 食道 → 胃 → 小腸 → 大腸'),
 'circ':() => lab('il_circ', [['心ぞう','血液を 送る ポンプ',80,26,51,43],['はい','酸素を とり入れる',18,28,43,42],['赤い 血管','心ぞうから 全身へ',82,62,60,58],['青い 血管','全身から 心ぞうへ',18,68,42,62]], '血液は 心ぞうから 全身を 回って もどってくる'),
 'arm':() => lab('il_arm', [['ちぢむ','',36,8,24,36],['ゆるむ','',8,92,10,50],['関節','',40,94,26,76],['ちぢむ','',56,94,60,40],['ゆるむ','',88,10,70,36]], '左：うでを 曲げる（内がわが ちぢむ）　右：うでを のばす（外がわが ちぢむ）')
};
window.__ill60q = function(q, ans, v){
  q = String(q).replace(/<[^>]+>/g,'');
  if(/日本海側の 冬|太平洋側の 冬/.test(q)) return ILL.monsoon();
  if(ILL[ans]) return ILL[ans]();
  if(/扇状地|三角州|盆地|リアス海岸/.test(q)){ const k = q.match(/扇状地|三角州|盆地|リアス海岸/)[0]; return ILL[k](); }
  return '';
};
/* りか：人の 体 */
try{
  const V = window.__v58; Object.assign(V.FIG, {body:ILL.skeleton, arm:ILL.arm, hbody:ILL.organs, circ:ILL.circ});
  [['hbody|3','circ'],['hbody|4','circ'],['hbody|7','circ'],['bio|15','circ'],['bio|14','hbody'],['hbody|8','hbody'],['body|2','arm'],['body|6','arm'],['body|1','body']].forEach(([k,f]) => { if(V.EXP[k]) V.EXP[k][0] = f; });
}catch(e){ console.warn(e); }

/* ---------- ルビ ---------- */
const RB = {
'扇状地':'せんじょうち','三角州':'さんかくす','盆地':'ぼんち','台地':'だいち','平野':'へいや','半島':'はんとう','海溝':'かいこう','河口':'かこう','流域面積':'りゅういきめんせき','山脈':'さんみゃく','山地':'さんち','季節風':'きせつふう',
'養殖業':'ようしょくぎょう','養殖':'ようしょく','栽培漁業':'さいばいぎょぎょう','遠洋漁業':'えんようぎょぎょう','沖合漁業':'おきあいぎょぎょう','沿岸漁業':'えんがんぎょぎょう','稚魚':'ちぎょ','酪農':'らくのう','促成栽培':'そくせいさいばい','抑制栽培':'よくせいさいばい','果樹園':'かじゅえん',
'工業地帯':'こうぎょうちたい','工業地域':'こうぎょうちいき','輸入':'ゆにゅう','輸出':'ゆしゅつ','原油':'げんゆ','鉄鉱石':'てっこうせき','地熱発電':'ちねつはつでん','火力発電':'かりょくはつでん','水力発電':'すいりょくはつでん',
'県庁所在地':'けんちょうしょざいち','都道府県':'とどうふけん','標準時子午線':'ひょうじゅんじしごせん','本初子午線':'ほんしょしごせん','赤道':'せきどう','経度':'けいど','緯度':'いど','時差':'じさ','流氷':'りゅうひょう',
'三権分立':'さんけんぶんりつ','立法':'りっぽう','行政':'ぎょうせい','司法':'しほう','国会':'こっかい','内閣':'ないかく','裁判所':'さいばんしょ','憲法':'けんぽう','公布':'こうふ','施行':'しこう','象徴':'しょうちょう','国民主権':'こくみんしゅけん','平和主義':'へいわしゅぎ',
'基本的人権':'きほんてきじんけん','納税':'のうぜい','勤労':'きんろう','義務':'ぎむ','権利':'けんり','選挙':'せんきょ','地方自治':'ちほうじち','条例':'じょうれい','消費税':'しょうひぜい','衆議院':'しゅうぎいん','参議院':'さんぎいん','内閣総理大臣':'ないかくそうりだいじん',
'世界遺産':'せかいいさん','前方後円墳':'ぜんぽうこうえんふん','貿易':'ぼうえき','食料自給率':'しょくりょうじきゅうりつ','温暖化':'おんだんか','共助':'きょうじょ','自助':'じじょ','公助':'こうじょ','漁師':'りょうし','消火せん':'しょうかせん',
'関節':'かんせつ','筋肉':'きんにく','ろっ骨':'ろっこつ','心ぞう':'しんぞう','心臓':'しんぞう','胃液':'いえき','胃':'い','小腸':'しょうちょう','大腸':'だいちょう','食道':'しょくどう','かん臓':'かんぞう','じん臓':'じんぞう','消化液':'しょうかえき','消化':'しょうか','吸収':'きゅうしゅう',
'血液':'けつえき','血管':'けっかん','酸素':'さんそ','二酸化炭素':'にさんかたんそ','呼吸':'こきゅう','脈はく':'みゃくはく','養分':'ようぶん','全身':'ぜんしん','子宮':'しきゅう','受精':'じゅせい','受せい':'じゅせい','受粉':'じゅふん','子葉':'しよう','本葉':'ほんば','子房':'しぼう','発芽':'はつが',
'光合成':'こうごうせい','水じょう気':'すいじょうき','電磁石':'でんじしゃく','回路':'かいろ','支点':'してん','力点':'りきてん','作用点':'さようてん','地層':'ちそう','化石':'かせき','震源':'しんげん','震央':'しんおう','火山岩':'かざんがん','深成岩':'しんせいがん','結晶':'けっしょう',
'惑星':'わくせい','恒星':'こうせい','衛星':'えいせい','星座':'せいざ','北極星':'ほっきょくせい','葉緑体':'ようりょくたい','細胞':'さいぼう','気門':'きもん','しょっ角':'しょっかく','完全変態':'かんぜんへんたい','不完全変態':'ふかんぜんへんたい'
};
const RX = new RegExp(Object.keys(RB).sort((a,b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'g');
function ruby(html){
  let svg = 0, rb = 0;
  return String(html).split(/(<[^>]+>)/).map(t => {
    if(t[0]==='<'){ if(/^<svg/i.test(t)) svg++; else if(/^<\/svg/i.test(t)) svg--; else if(/^<ruby/i.test(t)) rb++; else if(/^<\/ruby/i.test(t)) rb--; return t; }
    if(svg > 0 || rb > 0 || !t) return t;
    return t.replace(RX, m => `<ruby>${m}<rt>${RB[m]}</rt></ruby>`);
  }).join('');
}
window.__ruby60 = (html, s) => (s==='soc' || s==='sci') ? ruby(html) : html;
/* 問題文と えらぶ ボタンにも ルビ */
const subj = u => { const g = MATH_UNITS[u]?.g; return g==='soc' || g==='sci'; };
mRender = (orig => function(){
  const o = orig.apply(this, arguments);
  try{ const p = MQ && MQ.list[MQ.i]; if(p && subj(p.u)){ const q = $('#mQ'); if(q) q.innerHTML = ruby(q.innerHTML);
    $$('#mPad .mk.opt').forEach(b => { if(!b.classList.contains('flagOpt') && !b.querySelector('img,svg')) b.innerHTML = ruby(b.innerHTML); }); } }catch(e){}
  return o;
})(mRender);
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER60}`; }catch(e){} return o; })(renderSettings);
window.__v60 = {ILL, ruby, RB};
})();

/* =====================================================================
   まなびタウン v6.1
   ④ のりものの 大きさ（げんじつに ちかく）
   ⑤ テントに ときどき しらない どうぶつが あそびに 来る
   ⑥ みつばちの すばこ → はちみつ　⑦ にわとりごや → たまご
   ② りんごの 木・バナナの 木
   ⑧ むじんの お店（やさいの むじんはんばい・じどうはんばいき・アイス・たこやき・クレープ・おみくじ）
   ⑨ ほしぞら デッキ：ハナと ほしぞら かんさつ
   ⑩ てんもんだい：ほしの クイズ 3もん れんぞく せいかいで 水晶（1日1回）
   ===================================================================== */
(function(){
'use strict';
const VER61 = '6.1.0';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const svgArt = body => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${body}</svg>`);
const emo = e => svgArt(`<text x="60" y="68" font-size="88" text-anchor="middle" dominant-baseline="middle">${e}</text>`);
const gl = key => (save.town.glv||{})[key] || 0;
const P61 = () => save.prod61 || (save.prod61 = {});
const cellsOf = id => save.town ? Object.keys(save.town.cells).filter(k => save.town.cells[k]===id) : [];
const hashS = s => { let h = 2166136261; for(const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };

/* ---------- ④ のりものの 大きさ ---------- */
const VSIZE = {};
[['bicycle','scooter','retroscoot','whitebike','kart','baketrike'], .32,
 ['kei','sedan','crossover','taxi','ev','sports','convert','beetle','blacktaxi','wagon','rally','police','limo'], .42,
 ['minivan','luxvan','vanblue','mail','pickup','jeep','camperbus','ambulance','tow','icecream','foodtruck','tractor','forklift','roller','sweeper','command','carriage'], .48,
 ['truck','garbage','compactor','mixer','dump','tanker','fire','ladder','rescue','crane','excavator','snowplow','camper'], .56,
 ['bus','schoolbus','shuttle','sightbus','partybus'], .62,
 ['trolley'], .68, ['doubledecker'], .76].forEach((v,i,a) => { if(i%2===0) v.forEach(id => { VSIZE[id] = a[i+1]; }); });
buildCars = (orig => function(cs){
  const o = orig.apply(this, arguments);
  try{ const c0 = CAR.cs || cs || 60; CAR.list.forEach(c => { const f = VSIZE[c.id]; if(f && c.el){ c.el.style.height = Math.round(c0 * f) + 'px'; c.el.dataset.sz61 = f >= .6 ? 'big' : f >= .5 ? 'large' : f <= .32 ? 'small' : 'mid'; } }); }catch(e){}
  return o;
})(buildCars);

/* ---------- ② りんごの 木・バナナの 木（かりの 絵） ---------- */
const TREE_ART = {
  dc_appletree: svgArt(`<path d="M60 92 L112 66 L60 40 L8 66Z" fill="#9BD37A"/><path d="M8 66 L60 92 L60 98 L8 72Z" fill="#7DB85E"/><path d="M60 92 L112 66 L112 72 L60 98Z" fill="#6AA44E"/>
    <rect x="54" y="48" width="12" height="34" rx="4" fill="#9A6A3C"/><circle cx="60" cy="38" r="30" fill="#5DB35A"/><circle cx="40" cy="46" r="18" fill="#6CC468"/><circle cx="80" cy="46" r="18" fill="#6CC468"/><circle cx="60" cy="24" r="18" fill="#72CB6D"/>
    ${[[44,34],[70,28],[58,50],[82,48],[38,52],[64,38]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#E8414B"/><circle cx="${x-1.6}" cy="${y-1.8}" r="1.6" fill="#fff" opacity=".7"/>`).join('')}<circle cx="80" cy="78" r="5" fill="#E8414B"/>`),
  dc_bananatree: svgArt(`<path d="M60 92 L112 66 L60 40 L8 66Z" fill="#9BD37A"/><path d="M8 66 L60 92 L60 98 L8 72Z" fill="#7DB85E"/><path d="M60 92 L112 66 L112 72 L60 98Z" fill="#6AA44E"/>
    <path d="M56 82 Q54 50 60 26 Q66 50 64 82Z" fill="#8FBF5A"/><g fill="#4FAE4A">${[[-60,-34],[-30,-46],[10,-48],[40,-36],[56,-18]].map(([dx,dy]) => `<path d="M60 26 Q${60+dx/2} ${26+dy/2-8} ${60+dx} ${26+dy+20} Q${60+dx/2} ${26+dy/2+6} 60 30Z"/>`).join('')}</g>
    <g fill="#F7D84A" stroke="#C9A100" stroke-width="1">${[0,1,2,3].map(i => `<path d="M${66+i*3} ${40+i*5} q10 2 12 10 q-6 -3 -12 -4z"/>`).join('')}</g>`)
};
Object.assign(DEFAULT_ART, TREE_ART);
const NEW_ITEMS = [
  {id:'d_appletree', type:'bld', cat:'deco', name:'りんごの 木', art:'dc_appletree', emoji:'🍎', price:350, lv:3, dev:14},
  {id:'d_bananatree', type:'bld', cat:'deco', name:'バナナの 木', art:'dc_bananatree', emoji:'🍌', price:450, lv:4, dev:16}
];
NEW_ITEMS.forEach(it => { if(!TOWN_ITEMS.some(x => x.id===it.id)) TOWN_ITEMS.push(it); });
try{ ZUKAN_INFO.d_appletree = 'りんごが みのる 木。ときどき しゅうかく できるよ。'; ZUKAN_INFO.d_bananatree = 'バナナが みのる 木。ときどき しゅうかく できるよ。'; }catch(e){}

/* ---------- しゅうかく できる もの ---------- */
const HRS = 3600000;
const PROD = {
  d_beehive:{n:'はちみつ', mat:'cf_honey', bag:'cafe', base:1, every:24, art:'cf_honey', msg:'みつばちが あつめた はちみつ'},
  d_coop:{n:'たまご', mat:'cf_egg', bag:'cafe', base:2, every:24, art:'cf_egg', msg:'にわとりが うんだ たまご'},
  d_appletree:{n:'りんご', mat:'f_apple', bag:'food', base:2, every:12, art:'veg_apple', msg:'あかく みのった りんご'},
  d_bananatree:{n:'バナナ', mat:'f_banana', bag:'food', base:2, every:12, art:'veg_banana', msg:'あまく みのった バナナ'}
};
const bagOf = P => P.bag==='cafe' ? (save.cafeStock || (save.cafeStock = {})) : foodBag();
const readyAt = (key, P) => (P61()[key] || 0) + P.every*HRS;
const isReady = (key, id) => { const P = PROD[id]; return P && Date.now() >= readyAt(key, P); };
const leftStr = ms => { const m = Math.ceil(ms/60000); return m >= 60 ? `${Math.floor(m/60)}じかん${m%60 ? (m%60)+'ぷん' : ''}` : `${m}ぷん`; };
async function openProd(key, id){
  const P = PROD[id], it = ITEM(id), B = bagOf(P), n = P.base + gl(key);
  if(isReady(key, id)){
    B[P.mat] = (B[P.mat]||0) + n; P61()[key] = Date.now(); persist(); sound('fan'); confetti(1000); drawOv();
    const v = await dialog(`<div class="dlgArt big"><img src="${X(artSrc(P.art))}" alt=""></div><h2 class="dlgT">🧺 ${P.n}が とれた！</h2>
      <p class="dlgP">${X(P.msg)}が <b>${n}こ</b> とれたよ！（もっている：${B[P.mat]}こ）<br><small>${P.bag==='cafe' ? 'カフェの「メニューと ざいりょう」から のうひんしてね' : 'カフェの ざいりょうや「おやつ」に つかえるよ'}</small></p>
      <p class="dlgP facNote">つぎは ${P.every}じかん ごに とれるよ。グレードアップすると とれる かずが ふえるよ（いま ${n}こ）。</p>`,
      [{label:'やったー！', cls:'gold', v:1}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}], 'wide');
    if(v==='grade') openBuilding(key); return;
  }
  const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">${X(it.name)}</h2>
    <p class="dlgP">${X(P.n)}は まだ できていないよ。<br>あと <b>${leftStr(readyAt(key, P) - Date.now())}</b>で とれるよ。</p>
    <p class="dlgP facNote">${P.every}じかんごとに ${P.n}が ${n}こ とれるよ。グレードアップすると ふえるよ。</p>`,
    [{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='grade') openBuilding(key);
}

/* ---------- ⑤ テントに あそびに 来る どうぶつ ---------- */
const TENT_SLOT = 20*60000;
function tentGuest(key){
  const slot = Math.floor(Date.now()/TENT_SLOT), h = hashS(key + '|' + slot);
  if(h % 100 >= 40) return null;
  const live = new Set((save.town?.res||[]).map(r => r.sp)), pool = SPECIES.filter(s => !s.human && (s.w||0) > 0 && !live.has(s.id) && s.home!=='water');
  if(!pool.length) return null;
  const sp = pool[(h >>> 7) % pool.length];
  return {id:'tv'+slot, sp:sp.id, name:NAMES[(h >>> 3) % NAMES.length], star:1, ab:{}, slot};
}
const TENT_LINES = ['キャンプって たのしいね！ この まち、すてきだなあ','たびの とちゅうで よったんだ。ここの ほしぞら、きれいだね','たきびの においが すき！ また あそびに 来ても いい？','この まちに すんでる みんな、なかよしだね','テントで おひるね しちゃった。きもちいい〜'];
async function openTent(key){
  const g = tentGuest(key), it = ITEM('d_tent');
  if(!g){ const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">テント</h2><p class="dlgP">いまは だれも いないみたい。<br><small>ときどき まちに すんでいない どうぶつが あそびに 来るよ</small></p>`, [{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide'); if(v==='grade') openBuilding(key); return; }
  const S = save.tent61 || (save.tent61 = {}), first = S[key] !== g.slot; persOf && persOf(g);
  const sp = SP(g.sp);
  if(first){ S[key] = g.slot; givePts(15, `テントに 来た ${sp.name}と おはなし`); save.fac = save.fac || {}; save.fac.pals = save.fac.pals || {}; save.fac.pals[g.sp] = (save.fac.pals[g.sp]||0) + 1; persist(); sound('fan'); }
  await dialog(`<div class="tentScene61"><div class="tsBg"></div><div class="tsTent">${picHTML(it)}</div><div class="tsChar">${resPic(g)}</div></div>
    <h2 class="dlgT">🏕 ${X(g.name)}（${X(sp.name)}）が あそびに 来ているよ！</h2>
    <div class="talkBubble"><b>${X(g.name)}</b>${X(speak(g, choice(TENT_LINES)))}</div>
    ${first ? `<p class="dlgP"><span class="coin sm">P</span> +15　💞 レターを つかった とき ${X(sp.name)}が 来やすく なったよ</p>` : '<p class="dlgP facNote">しばらく したら かえっちゃうよ</p>'}`, [{label:'またね！', cls:'gold', v:1}], 'wide');
}

/* ---------- ⑧ むじんの お店 ---------- */
const STALL = {
  d_vegstand:{n:'やさいの むじんはんばい', items:['f_carrot','f_cabbage','f_eggplant'], disc:.9, line:'とれたての やさい。おかねは はこに いれてね'},
  d_vending:{n:'じどうはんばいき', items:['f_kb_juice','f_kb_tea'], disc:1, line:'ピッ！ ガコン！'},
  d_icestand:{n:'アイスやさん', items:['f_icecream'], disc:1, line:'つめたくて おいしいよ'},
  d_takoyaki:{n:'たこやきやさん', items:['f_takoyaki'], disc:1, line:'あつあつの たこやき！'},
  d_crepe:{n:'クレープやさん', items:['f_crepe','f_crepe_ba'], disc:1, line:'あまい クレープ いかが？'}
};
const priceOf61 = (id, S) => Math.max(10, Math.round((FD(id)?.price||50) * S.disc / 5) * 5);
function stallBody(id){
  const S = STALL[id], B = foodBag();
  return `<div class="stall61"><div class="dlgArt">${picHTML(ITEM(id))}</div><h2 class="dlgT">${X(S.n)}</h2><p class="dlgP facNote">${X(S.line)}<br>だれも はたらかなくても かえる お店だよ（しゅるいは すくなめ）</p>
    <div class="stGrid61">${S.items.filter(FD).map(f => { const F = FD(f), p = priceOf61(f, S); return `<button data-b61="${id}|${f}" ${save.points.bal >= p ? '' : 'disabled'}><img src="${X(artSrc(F.art))}" alt=""><b>${X(F.n)}</b><small><span class="coin sm">P</span> ${p}</small><em>もっている ${B[f]||0}</em></button>`; }).join('')}</div>
    <p class="dlgP facNote">かった ものは ホームの「おやつ」で たべられるよ</p></div>`;
}
async function openStall(key, id){ const v = await dialog(stallBody(id), [{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide'); if(v==='grade') openBuilding(key); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-b61]'); if(!b || !b.closest('#dlgBody') || b.disabled) return; e.stopImmediatePropagation();
  const [id, f] = b.dataset.b61.split('|'), S = STALL[id], p = priceOf61(f, S); if(save.points.bal < p){ toast('ポイントが たりないよ'); return; }
  const B = foodBag(); B[f] = (B[f]||0) + 1; givePts(-p, `${S.n}で ${FD(f).n}を かった`); persist(); sound('ok');
  $('#dlgBody').innerHTML = stallBody(id); toast(`${FD(f).n}を かったよ！`);
}, true);
/* おみくじ */
const KUJI = [['大吉',100,'さいこうの 一日に なるよ！ べんきょうも ばっちり！',8],['中吉',60,'いいこと ありそう！ ちょうせんすると ◎',18],['小吉',40,'こつこつ がんばると いいことが あるよ',26],['吉',30,'にこにこ すごせば いいことが あるよ',30],['末吉',20,'これから だんだん よくなるよ！',18]];
async function openKuji(key){
  const it = ITEM('d_omikuji'), K = save.kuji61 || (save.kuji61 = {}), done = K.d===dayKey(), cost = 30;
  const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">🎋 おみくじ</h2><p class="dlgP">${done ? `きょうは もう ひいたよ：<b>${X(K.r)}</b><br>また あした ひいてね` : `1日 1かい ひけるよ（<span class="coin sm">P</span> ${cost}）<br>けっかに よって ポイントが もらえるよ`}</p>`,
    (done ? [] : [{label:`🎋 ひく（${cost}pt）`, cls:'gold', v:'draw'}]).concat([{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='draw') return; if(save.points.bal < cost){ toast('ポイントが たりないよ'); return; }
  givePts(-cost, 'おみくじを ひいた'); let r = Math.random()*100, k = KUJI[KUJI.length-1]; for(const x of KUJI){ r -= x[3]; if(r <= 0){ k = x; break; } }
  K.d = dayKey(); K.r = k[0]; const p = givePts(k[1], `おみくじ ${k[0]}`); persist(); sound('fan'); if(k[0]==='大吉') confetti(2000);
  await dialog(`<div class="kuji61"><span>${X(k[0])}</span></div><h2 class="dlgT">${X(k[0])}！</h2><p class="dlgP">${X(k[2])}<br><span class="coin sm">P</span> +${p}</p>`, [{label:'ありがとう！', cls:'gold', v:1}], k[0]==='大吉' ? 'gold' : '');
}

/* ---------- ⑨ ほしぞら デッキ ---------- */
const STAR_LINES = ['あの 明るい 3つの 星が「夏の 大三角」だよ。ベガ・アルタイル・デネブ！','北斗七星の さきを 5ばい のばすと 北極星が 見つかるんだって','ぼうえんきょうで 見ると、月の クレーターが はっきり 見えるね！','オリオン座の 赤い 星は ベテルギウス。白い 星は リゲルだよ','ながれぼしだ！ ねがいごと、まにあった？','土星の わっか、ぼうえんきょうで 見えるかな？','星の 色が ちがうのは、温度が ちがうからなんだって'];
async function openStarDeck(key){
  const g = (typeof girl==='function' && girl()) || {id:'hana', sp:'girl', name:'ハナ', star:1, ab:{}, outfit:'res_girl'};
  sound('fan');
  const v = await dialog(`<div class="star62"><img src="./assets/images/v62/sc_hana_stars.webp" alt=""><div class="st62t">⭐ ほしぞら かんさつ</div></div>
      <div class="talkBubble" style="margin:8px auto 0"><b>${X(g.name||'ハナ')}</b>${X(choice(STAR_LINES))}</div>`,
    [{label:'もっと 見る ⭐', cls:'gold', v:'more'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='more') return openStarDeck(key);
  if(v==='grade') openBuilding(key);
}

/* ---------- ⑩ てんもんだい：ほしの クイズ ---------- */
function starPool(){ return [].concat((SCI_BANK.sky||[]).map(r => ['r_sky', r]), (SCI_BANK.moonsun||[]).map(r => ['r_moon', r]), (SCI_BANK.earth||[]).slice(22).map(r => ['r_earth', r])); }
const crystals = () => save.crystal || 0;
const CRY = emo('💎');
DEFAULT_ART.itm_crystal = DEFAULT_ART.itm_crystal || CRY;
async function openObservatory(key){
  const it = ITEM('observatory'), O = save.obs61 || (save.obs61 = {}), done = O.d===dayKey();
  const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">🔭 てんもんだい</h2>
    <p class="dlgP">ほしの クイズに <b>3もん れんぞく</b>で せいかいすると<br><b>水晶</b>が もらえるよ（1日 1かい）</p>
    <div class="cry61"><img src="${X(artSrc('itm_crystal'))}" alt=""><b>水晶 ×${crystals()}</b><small>${done ? 'きょうの 水晶は もらったよ' : 'きょうは まだ もらっていないよ'}</small></div>${done ? '<div class="done66">✅ きょうの 水晶は もう もらったよ<br><small>水晶は 1日1回。いまは れんしゅう（水晶・ポイントなし）だよ</small></div>' : ''}`,
    [{label: done ? '⭐ れんしゅう する（水晶なし）' : '⭐ ほしの クイズに ちょうせん（水晶 1こ）', cls: done ? 'white' : 'gold', v:'quiz'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='quiz') return;
  const L = shuffle(starPool().slice()).slice(0, 3);
  for(let i=0; i<3; i++){
    const [u, r] = L[i], opts = shuffle(r.slice(1));
    const m = {html:`<div class="obsQ61">${'⭐'.repeat(i+1)}${'☆'.repeat(2-i)}</div><div class="mqSent math">${X(r[0])}</div>`, ans:r[1], opts, key:'obs|'+r[0]};
    const res = await askMQ(m, `<b>🔭 ほしの クイズ（${i+1}/3）</b>`);
    if(!res.ok){
      let ex = ''; try{ ex = window.__explain56 ? window.__explain56({u, type:'choice', q:r[0], ans:r[1], sub:r[0], opts}, '', {}) : ''; }catch(e){}
      await dialog(`<h2 class="dlgT">おしい！ ${i}もん れんぞく</h2><p class="dlgP">こたえは <b>${X(r[1])}</b> だったよ。</p>${ex}`, [{label:'また ちょうせんする', cls:'gold', v:1}], 'wide');
      return;
    }
    sound('ok');
  }
  const give = O.d !== dayKey();
  if(give){ O.d = dayKey(); save.crystal = crystals() + 1; const p = givePts(30, 'てんもんだい ほしの クイズ 3もん れんぞく'); persist(); sound('fan'); confetti(1800);
    await dialog(`<div class="cry61 big"><img src="${X(artSrc('itm_crystal'))}" alt=""></div><h2 class="dlgT">3もん れんぞく せいかい！</h2>
    <p class="dlgP"><b>水晶を 1こ</b> もらったよ！<br><span class="coin sm">P</span> +${p}<br>水晶 ×${crystals()}</p><p class="dlgP facNote">水晶は 1日1回。あしたも ちょうせんしてね！</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold'); }
  else { persist(); sound('ok');
    await dialog(`<div class="done66 big">✅ れんしゅう クリア！</div><h2 class="dlgT">3もん れんぞく せいかい！</h2><p class="dlgP">きょうの 水晶は もう もらっているので、<b>水晶は ふえないよ</b>。<br>つぎに もらえるのは <b>あした</b>。<br>水晶 ×${crystals()}（かわらず）</p>`, [{label:'OK', cls:'white', v:1}]); }
}
/* 住民の ページに 水晶を ひょうじ */
renderResidents = (orig => function(){ const o = orig.apply(this, arguments); try{ const b = $('#resBag'); if(b && !b.querySelector('.cry61b')) b.insertAdjacentHTML('beforeend', `<div class="bagIt cry61b"><img src="${X(artSrc('itm_crystal'))}" alt=""><div><b>水晶 ×${crystals()}</b><small>てんもんだいの ほしの クイズで もらえる</small></div></div>`); }catch(e){} return o; })(renderResidents);

/* ---------- まちの 上の ひょうじ ---------- */
function drawOv(){
  if(curScreen!=='town' || !save.town) return;
  const map = $('#townMap'); if(!map) return; map.querySelectorAll('.ov61').forEach(e => e.remove());
  Object.entries(save.town.cells).forEach(([k,id]) => {
    let h = '';
    if(PROD[id] && isReady(k, id)) h = `<span class="facOv ready ov61">!</span><img class="ov61 prodIc61" src="${X(artSrc(PROD[id].art))}" alt="">`;
    if(id==='d_tent'){ const g = tentGuest(k); if(g) h = `<span class="ov61 tentVis61">${resPic(g)}</span>`; }
    if(id==='observatory' && (save.obs61||{}).d!==dayKey()) h = '<span class="facOv ready ov61">⭐</span>';
    if(!h) return; const [x,y] = k.split(','); const c = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', h);
  });
}
renderMap = (orig => function(){ const o = orig.apply(this, arguments); try{ drawOv(); }catch(e){ console.warn(e); } return o; })(renderMap);
setInterval(() => { if(!document.hidden) try{ drawOv(); }catch(e){} }, 15000);

/* ---------- タッチ ---------- */
const TAP = {d_tent:openTent, d_omikuji:openKuji, d_stardeck:openStarDeck, observatory:openObservatory};
Object.keys(PROD).forEach(id => { TAP[id] = k => openProd(k, id); });
Object.keys(STALL).forEach(id => { TAP[id] = k => openStall(k, id); });
const FEST = new Set(['d_takoyaki','d_crepe','d_icestand','d_omikuji']);
window.addEventListener('click', async e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker,.car2')) return;
  const key = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[key], fn = TAP[id]; if(!fn) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(FEST.has(id) && await tryScene(id)) return;
  fn(key);
}, true);

renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER61}`; }catch(e){} return o; })(renderSettings);
window.__v61 = {PROD, STALL, tentGuest, openObservatory, openStarDeck, drawOv, VSIZE};
})();

/* v6.2：かりの 絵を イラストに さしかえ */
(function(){
'use strict';
const I = './assets/images/v62/';
['itm_crystal','cf_honey','dc_bananatree','dc_appletree'].forEach(k => { DEFAULT_ART[k] = I + k + '.webp'; });
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = 'まなびタウン v6.2.0'; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   まなびタウン v6.3
   ⑪ どうぶつえん：りくの どうぶつクイズ 3もん れんぞくで 水晶（1日1回）
   ⑫ すいぞくかん：水の 生き物クイズ 3もん れんぞくで 水晶（1日1回）
   ⑬ クリスタルタワー：ときどき 水晶（1日3回）。水晶 3こ → おまねきレター、10こ → きらきらレター
   ⑭ ちいさな おしろ：ハナと シマエナガの アフタヌーンティー
   ⑮ シマエナガの ぞう：シマエナガと おしゃべり（せんようの 絵 3まい）
   ===================================================================== */
(function(){
'use strict';
const VER63 = '6.3.0', IMG = './assets/images/v63/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const crystals = () => save.crystal || 0;
const cryImg = () => `<img src="${X(artSrc('itm_crystal'))}" alt="">`;

/* ---------- クイズの もんだい ---------- */
const LAND = [
 ['首が いちばん 長い どうぶつは？','キリン','ゾウ','ラクダ','シマウマ','キリンは 首が 長く、高い 木の 葉を 食べられるよ'],
 ['陸に すむ どうぶつで いちばん 大きいのは？','アフリカゾウ','キリン','サイ','カバ','アフリカゾウは 体重が 6トン いじょうにも なるよ'],
 ['「百獣の王」と よばれる どうぶつは？','ライオン','トラ','ゴリラ','クマ','おすの ライオンには りっぱな たてがみが あるよ'],
 ['おなかの ふくろで 子どもを 育てる どうぶつは？','カンガルー','パンダ','サル','ウサギ','カンガルーや コアラは「有袋類（ゆうたいるい）」の なかま'],
 ['ジャイアントパンダが おもに 食べるものは？','ササ（竹）','魚','肉','くだもの','パンダは 1日に 10kg いじょう ササを 食べるよ'],
 ['せなかに こぶが ある どうぶつは？','ラクダ','ウマ','ウシ','ヤギ','こぶには あぶらが たくわえられ、食べものが ない ときに つかうよ'],
 ['いちばん 足が 速い 陸の どうぶつは？','チーター','ライオン','ウマ','シマウマ','チーターは 時速 100km いじょうで 走れるよ'],
 ['コアラが 食べる 葉っぱは？','ユーカリ','ササ','クワ','サクラ','コアラは ユーカリの 葉を 食べて 1日 20時間くらい ねるよ'],
 ['しろと くろの しま もようの どうぶつは？','シマウマ','パンダ','トラ','キリン','しま もようは 1頭ずつ ちがうんだよ'],
 ['オランウータンが すんでいる ところは？','森の 木の 上','さばく','南極','海','オランウータンは 東南アジアの 森で 木の 上に すむよ'],
 ['ゾウの 鼻は 何に つかう？','水を すう・ものを つかむ','空を とぶ','音を 出すだけ','つかわない','ゾウの 鼻は 手の ように 器用に うごくよ'],
 ['冬に 冬眠する どうぶつは？','クマ','ライオン','キリン','シマウマ','クマは 冬の あいだ 巣穴で ねむって すごすよ'],
 ['夜に 活動する（夜行性の）鳥は？','フクロウ','ニワトリ','スズメ','ハト','フクロウは 夜でも よく 見える 大きな 目を もっているよ'],
 ['とべない 大きな 鳥は？','ダチョウ','ワシ','ツバメ','カラス','ダチョウは とべないけど 時速 70kmで 走るよ'],
 ['カバが 昼間 すごす ところは？','水の 中','木の 上','さばくの 砂','雪の 中','カバは 昼は 水に つかり、夜に 草を 食べに 陸に 上がるよ'],
 ['サイの 鼻の 上に ある ものは？','つの','耳','きば','はね','サイの つのは 毛と 同じ なかまで できているよ'],
 ['ナマケモノの とくちょうは？','とても ゆっくり うごく','とても 速く 走る','水の 中に すむ','空を とぶ','ナマケモノは 木に ぶら下がって ゆっくり くらすよ'],
 ['トラの とくちょうは？','黄色に 黒の しま もよう','首が 長い','ふくろが ある','はねが ある','トラは ネコの なかまで いちばん 大きいよ'],
 ['ヒトに いちばん 近い なかまの どうぶつは？','チンパンジー','イヌ','ネコ','ウマ','チンパンジーは どうぐを つかうことも できるよ'],
 ['レッサーパンダの しっぽの もようは？','しま もよう','水玉','まっ白','まっ黒','ふさふさの しっぽに 赤茶色と こげ茶の しまが あるよ'],
 ['ペンギンは 何の なかま？','鳥','魚','ほ乳類','は虫類','ペンギンは 空は とべないけど、羽が ある 鳥の なかまだよ'],
 ['ワニは 何の なかま？','は虫類','両生類','魚','ほ乳類','ワニ・ヘビ・トカゲ・カメは は虫類の なかまだよ'],
 ['たまごを うむ ほ乳類は？','カモノハシ','イヌ','ウシ','ゾウ','カモノハシは ほ乳類なのに たまごを うむ めずらしい どうぶつ'],
 ['ラッコと ちがって 陸に すむ どうぶつは？','タヌキ','アザラシ','イルカ','クジラ','タヌキは 日本の 山や 町の 近くにも すんでいるよ']
];
const WATER = [
 ['世界で いちばん 大きな 生き物は？','シロナガスクジラ','ジンベエザメ','アフリカゾウ','マッコウクジラ','シロナガスクジラは 体長 30m 近くにも なるよ'],
 ['イルカは 何の なかま？','ほ乳類','魚','両生類','は虫類','イルカや クジラは 肺で こきゅうする ほ乳類だよ'],
 ['魚が 水の 中で こきゅうする ところは？','えら','肺','ひれ','うろこ','えらで 水に とけた 酸素を とりこむよ'],
 ['足が 8本 ある 海の 生き物は？','タコ','イカ','カニ','エビ','タコは 8本、イカは 10本の 足（うで）が あるよ'],
 ['足が 10本 ある 海の 生き物は？','イカ','タコ','ヒトデ','クラゲ','イカは 10本の うでの うち 2本が 長いよ'],
 ['すみを はいて にげる 生き物は？','タコ','クラゲ','ウニ','カメ','タコや イカは すみを はいて 敵の 目を くらませるよ'],
 ['ラッコが おなかの 上で つかう 道具は？','石','木の 枝','貝がら','海そう','ラッコは おなかに のせた 石で 貝を わって 食べるよ'],
 ['魚で いちばん 大きいのは？','ジンベエザメ','マグロ','シロナガスクジラ','サケ','ジンベエザメは 大きいけど、小さな プランクトンを 食べる'],
 ['川で 生まれて 海で 育ち、また 川に もどる 魚は？','サケ','マグロ','タイ','イワシ','サケは 生まれた 川に もどって たまごを うむよ'],
 ['クマノミが いっしょに くらす 生き物は？','イソギンチャク','サメ','ウニ','クラゲ','イソギンチャクの 毒の 手が クマノミを 守るよ'],
 ['ふくらんで まるく なる 魚は？','フグ','マグロ','カツオ','サンマ','フグは 水を すいこんで ふくらみ、身を 守るよ'],
 ['ほとんどが 水で できていて ふわふわ ただよう 生き物は？','クラゲ','カニ','ウニ','ヒトデ','クラゲの 体は 95% いじょうが 水だよ'],
 ['ヒトデの 腕は ふつう 何本？','5本','4本','6本','8本','ヒトデは 腕が 切れても また 生えてくるよ'],
 ['ウミガメが たまごを うむ ところは？','すなはま','海の そこ','川','岩の 上','夜に すなはまに あがって あなを ほり、たまごを うむよ'],
 ['ペンギンが すんでいるのは おもに？','南半球','北極','さばく','熱帯の 森','ペンギンは 南極や 南半球の 海に すむよ。北極には いない'],
 ['アザラシと アシカの ちがいは？','アシカには 耳たぶが ある','アザラシは 魚','アシカは 鳥','ちがいは ない','アシカは 耳たぶが あり、前あしで 体を ささえて 歩けるよ'],
 ['タツノオトシゴの おもしろい ところは？','おすが おなかで 子を 育てる','空を とぶ','足が ある','肺で こきゅうする','おすの おなかの ふくろで たまごが かえるよ'],
 ['チンアナゴが すんでいる ところは？','すなの 中から 顔を 出す','木の 上','川の 石の 下','クジラの 背中','チンアナゴは すなに あなを ほって 顔だけ 出しているよ'],
 ['深い 海に すみ、頭の ちょうちんを 光らせる 魚は？','チョウチンアンコウ','マグロ','サンマ','クマノミ','光で 小さな 魚を さそって 食べるよ'],
 ['カニの 歩きかたの とくちょうは？','よこに 歩く','うしろだけ','とぶ','歩かない','カニは あしの 関節の しくみで よこに 歩くよ'],
 ['ジュゴンや マナティーが 食べる ものは？','海草','魚','貝','クラゲ','ジュゴンは 海の 草を 食べる おとなしい ほ乳類'],
 ['シャチは 何の なかま？','クジラ（ほ乳類）','サメ（魚）','アザラシ','ペンギン','シャチは イルカに 近い クジラの なかまだよ'],
 ['ウニの 体の まわりに ある ものは？','とげ','うろこ','毛','はね','とげで 身を 守り、とげを うごかして 歩くよ'],
 ['メダカの たまごが かえるまで（水温 25℃）の 日数は？','約11日','約1日','約3か月','約1年','メダカの たまごは 約11日で かえるよ']
];
function qChallenge(o){
  return (async () => {
    const it = ITEM(o.id), S = save[o.save] || (save[o.save] = {}), done = S.d===dayKey();
    const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">${o.icon} ${X(it?.name||o.name)}</h2>
      <p class="dlgP">${o.desc}<br>クイズに <b>3もん れんぞく</b>で せいかいすると<br><b>水晶</b>が もらえるよ（1日 1かい）</p>
      <div class="cry61">${cryImg()}<b>水晶 ×${crystals()}</b><small>${done ? 'きょうの 水晶は もらったよ' : 'きょうは まだ もらっていないよ'}</small></div>
      ${done ? '<div class="done66">✅ きょうの 水晶は もう もらったよ<br><small>水晶は 1日1回。つぎは あした もらえるよ。いまは れんしゅう（水晶・ポイントなし）だよ</small></div>' : ''}`,
      [{label: done ? `${o.icon} れんしゅう する（水晶なし）` : `${o.icon} クイズに ちょうせん（水晶 1こ）`, cls: done ? 'white' : 'gold', v:'quiz'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
    if(v==='grade') return openBuilding(o.key);
    if(v!=='quiz') return;
    const L = shuffle(o.bank.slice()).slice(0, 3);
    for(let i=0; i<3; i++){
      const r = L[i], opts = shuffle(r.slice(1, 5));
      const res = await askMQ({html:`<div class="obsQ61">${o.icon.repeat(i+1)}${'・'.repeat(2-i)}</div><div class="mqSent math">${X(r[0])}</div>`, ans:r[1], opts, key:o.save+'|'+r[0]}, `<b>${o.icon} ${X(o.qname)}（${i+1}/3）</b>`);
      if(!res.ok){
        await dialog(`<h2 class="dlgT">おしい！ ${i}もん れんぞく</h2><div class="ex56"><div class="ex56Ans"><span class="ok">⭕ 正しい こたえ <b>${X(r[1])}</b></span></div><ol class="ex56Steps"><li>${X(r[5])}</li></ol></div>`, [{label:'また ちょうせんする', cls:'gold', v:1}], 'wide');
        return;
      }
      await dialog(`<h2 class="dlgT">⭕ せいかい！</h2><p class="dlgP">${X(r[5])}</p>`, [{label: i<2 ? 'つぎの もんだい ▶' : 'けっかを 見る ▶', cls:'gold', v:1}]);
    }
    const give = S.d !== dayKey(); if(give){ S.d = dayKey(); save.crystal = crystals() + 1; }
    if(give){ const p = givePts(30, `${o.qname} 3もん れんぞく`); persist(); sound('fan'); confetti(1800);
      await dialog(`<div class="cry61 big">${cryImg()}</div><h2 class="dlgT">3もん れんぞく せいかい！</h2>
        <p class="dlgP"><b>水晶を 1こ</b> もらったよ！<br><span class="coin sm">P</span> +${p}<br>水晶 ×${crystals()}</p><p class="dlgP facNote">水晶は 1日1回。あしたも ちょうせんしてね！</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold'); }
    else { persist(); sound('ok');
      await dialog(`<div class="done66 big">✅ れんしゅう クリア！</div><h2 class="dlgT">3もん れんぞく せいかい！</h2>
        <p class="dlgP">きょうの 水晶は もう もらっているので、<b>水晶は ふえないよ</b>。<br>つぎに 水晶が もらえるのは <b>あした</b>。<br>水晶 ×${crystals()}（かわらず）</p>`, [{label:'OK', cls:'white', v:1}]); }
  })();
}
const openZoo = key => qChallenge({key, id:'zoo', name:'どうぶつえん', icon:'🦒', qname:'りくの どうぶつクイズ', desc:'ここでは りくの どうぶつに ついて まなべるよ。', bank:LAND, save:'zoo63'});
const openAqua = key => qChallenge({key, id:'aquarium', name:'すいぞくかん', icon:'🐬', qname:'水の 生き物クイズ', desc:'ここでは 水の 中の 生き物に ついて まなべるよ。', bank:WATER, save:'aqua63'});

/* ---------- ⑬ クリスタルタワー・水晶の こうかん ---------- */
const EX = [{id:'letter', n:'おまねきレター', cost:3}, {id:'goldletter', n:'きらきらレター', cost:10}];
function exHTML(){ return `<div class="cry61">${cryImg()}<b>水晶 ×${crystals()}</b></div><div class="ex63">${EX.map(e => `<button data-ex63="${e.id}" ${crystals() >= e.cost ? '' : 'disabled'}><img src="${X(artSrc(ITEM(e.id)?.art))}" alt=""><b>${e.n}</b><small>水晶 ${e.cost}こ と こうかん</small><em>もっている ${save.town.bag[e.id]||0}まい</em></button>`).join('')}</div>`; }
async function openExchange(){ await dialog(`<h2 class="dlgT">💎 水晶の こうかん</h2>${exHTML()}<p class="dlgP facNote">水晶は てんもんだい・どうぶつえん・すいぞくかんの クイズや、クリスタルタワーで あつめられるよ</p>`, [{label:'とじる', v:null}], 'wide'); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ex63]'); if(!b || b.disabled || !b.closest('#dlgBody')) return; e.stopImmediatePropagation();
  const E = EX.find(x => x.id===b.dataset.ex63); if(crystals() < E.cost) return;
  save.crystal = crystals() - E.cost; const t = save.town; t.bag[E.id] = (t.bag[E.id]||0) + 1; persist(); sound('fan'); confetti(1200);
  const body = b.closest('#dlgBody'); body.querySelectorAll('.cry61,.ex63').forEach(x => x.remove()); body.querySelector('.dlgT').insertAdjacentHTML('afterend', exHTML());
  toast(`💌 ${E.n}を 1まい もらったよ！`);
}, true);
async function openCrystalTower(key){
  const it = ITEM('d_crystaltower'), C = save.ct63 && save.ct63.d===dayKey() ? save.ct63 : (save.ct63 = {d:dayKey(), n:0}), left = 3 - C.n;
  const v = await dialog(`<div class="dlgArt big ctGlow63">${picHTML(it)}</div><h2 class="dlgT">💎 クリスタルタワー</h2>
    <p class="dlgP">タワーに さわると ときどき 水晶が 見つかるよ<br>きょう さわれるのは あと <b>${left}かい</b></p><div class="cry61">${cryImg()}<b>水晶 ×${crystals()}</b></div>`,
    (left > 0 ? [{label:'✨ タワーに さわる', cls:'gold', v:'touch'}] : []).concat([{label:'💎 水晶を こうかん', cls:'pink', v:'ex'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v==='ex') return openExchange();
  if(v!=='touch') return;
  C.n++; const chance = 0.35 + 0.1*((save.town.glv||{})[key]||0), hit = Math.random() < chance;
  if(hit) save.crystal = crystals() + 1; persist(); sound(hit ? 'fan' : 'tap'); if(hit) confetti(1200);
  await dialog(hit ? `<div class="cry61 big">${cryImg()}</div><h2 class="dlgT">水晶を 見つけた！</h2><p class="dlgP">水晶 ×${crystals()}<br><small>きょうは あと ${3-C.n}かい</small></p>`
    : `<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">きらきら…</h2><p class="dlgP">こんどは 見つからなかった。<br><small>きょうは あと ${3-C.n}かい</small></p>`, [{label:'OK', cls:'gold', v:1}]);
  if(3 - C.n > 0) openCrystalTower(key);
}

/* ---------- ⑭ ちいさな おしろ ---------- */
const TEA = ['この スコーン、まだ あったかいね！','シマくん、ジャムと クリーム どっちから のせる？','おしろで おちゃなんて、おひめさまみたい！','この マカロン、いちご あじだ〜','つぎは みんなも よぼうね！'];
async function openTea(key){
  const v = await dialog(`<div class="star62"><img src="${IMG}sc_tea.webp" alt=""><div class="st62t">☕ おしろの アフタヌーンティー</div></div>
    <div class="talkBubble" style="margin:8px auto 0"><b>ハナ</b>${X(choice(TEA))}</div>`,
    [{label:'もっと 見る ☕', cls:'gold', v:'more'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='more') return openTea(key); if(v==='grade') openBuilding(key);
}

/* ---------- ⑮ シマエナガの ぞう ---------- */
const SHIMA = [
 ['shima_wave','やあ！ ぼくの ぞうを つくってくれて ありがとう！'],['shima_wave','きょうも べんきょう がんばってる？ ぼく、ちゃんと 見てるよ！'],['shima_wave','まちが どんどん にぎやかに なってきたね！'],
 ['shima_think','うーん… つぎは どんな たてものが いいかなあ？'],['shima_think','まちがえた 問題は、もういちど とくと しっかり おぼえられるんだって'],['shima_think','シマエナガって、ふゆに なると もっと まるく なるんだよ。しってた？'],['shima_think','にがてな 問題、いっしょに やっつけよう！'],
 ['shima_jump','わーい！ きみと いっしょだと たのしいな！'],['shima_jump','れんぞく せいかい、すごかったね！ ぼくも うれしい！'],['shima_jump','この まち、だいすき！ ずっと いっしょに つくっていこうね！']];
async function openShima(key){
  const S = save.shima63 || (save.shima63 = {}), first = S.d !== dayKey(), L = choice(SHIMA);
  if(first){ S.d = dayKey(); givePts(10, 'シマエナガの ぞうと おしゃべり'); persist(); }
  const v = await dialog(`<div class="star62"><img src="${IMG}${L[0]}.webp" alt=""></div>
    <div class="talkBubble" style="margin:8px auto 0"><b>シマくん</b>${X(L[1])}</div>${first ? '<p class="dlgP"><span class="coin sm">P</span> +10（1日1かい）</p>' : ''}`,
    [{label:'💬 もっと はなす', cls:'gold', v:'more'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='more') return openShima(key); if(v==='grade') openBuilding(key);
}

/* ---------- まちの 上の ひょうじ・タッチ ---------- */
function drawOv63(){
  if(curScreen!=='town' || !save.town) return; const map = $('#townMap'); if(!map) return; map.querySelectorAll('.ov63').forEach(e => e.remove());
  const ct = save.ct63 && save.ct63.d===dayKey() ? save.ct63.n : 0;
  Object.entries(save.town.cells).forEach(([k,id]) => {
    let h = '';
    if(id==='zoo' && (save.zoo63||{}).d!==dayKey()) h = '🦒'; if(id==='aquarium' && (save.aqua63||{}).d!==dayKey()) h = '🐬';
    if(id==='d_crystaltower' && ct < 3) h = '💎';
    if(!h) return; const [x,y] = k.split(','); const c = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', `<span class="facOv ready ov63">${h}</span>`);
  });
}
renderMap = (orig => function(){ const o = orig.apply(this, arguments); try{ drawOv63(); }catch(e){} return o; })(renderMap);
const TAP = {zoo:openZoo, aquarium:openAqua, d_crystaltower:openCrystalTower, d_minicastle:openTea, d_shimastatue:openShima};
window.addEventListener('click', e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker,.car2')) return;
  const key = `${c.dataset.x},${c.dataset.y}`, fn = TAP[save.town.cells[key]]; if(!fn) return;
  e.stopImmediatePropagation(); e.preventDefault(); fn(key).then(() => { try{ drawOv63(); }catch(e){} });
}, true);
/* バッグの 水晶：タッチで こうかん */
document.addEventListener('click', e => { if(e.target.closest('.cry61b')){ e.stopImmediatePropagation(); openExchange(); } }, true);
renderResidents = (orig => function(){ const o = orig.apply(this, arguments); try{ const b = $('.cry61b small'); if(b) b.textContent = 'タッチで レターと こうかん（3こ → おまねき、10こ → きらきら）'; }catch(e){} return o; })(renderResidents);
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER63}`; }catch(e){} return o; })(renderSettings);
window.__v63 = {openZoo, openAqua, openCrystalTower, openTea, openShima, openExchange};
})();

/* =====================================================================
   まなびタウン v6.4：2マス・4マスの 大きな たてもの
   ・どうぶつえん・すいぞくかん・ゆうえんち・くうこう・スタジアム・おしろ・うちゅうセンター は 2×2マス
   ・ランドマークタワー・デパート は 2×1マス
   ・Lv12から 大きな たてものを 8しゅるい ついか
   ・まえから おいてあった たてものは いちど トレイに しまう（★グレードは のこる）
   ===================================================================== */
(function(){
'use strict';
const VER64 = '6.4.0', IMG = './assets/images/v64/';
const SZ = {zoo:[2,2], aquarium:[2,2], ferris:[2,2], airport:[2,2], stadium:[2,2], castle:[2,2], space:[2,2], landmark:[2,1], dept:[2,1]};
const NEW = [
  {id:'bg_hospital',   name:'そうごう びょういん', emoji:'🏥', lv:12, price:16000, dev:240, income:60,  sz:[2,1], info:'たくさんの おいしゃさんが いる 大きな びょういん。'},
  {id:'bg_university', name:'だいがく',           emoji:'🎓', lv:12, price:20000, dev:280, know:0.10, sz:[2,2], info:'いろいろな ことを ふかく まなべる ところ。ちしきが ぐんと ふえる。'},
  {id:'bg_science',    name:'かがくかん',         emoji:'🚀', lv:13, price:22000, dev:300, know:0.08, sz:[2,1], info:'プラネタリウムや ロケットの もけいが ある。'},
  {id:'bg_botanical',  name:'しょくぶつえん',     emoji:'🌺', lv:13, price:24000, dev:320, pop:0.04,  sz:[2,2], info:'ガラスの おんしつで せかいの しょくぶつが そだつ。'},
  {id:'bg_onsen',      name:'おんせん りょかん',  emoji:'♨️', lv:14, price:26000, dev:330, income:120, pop:0.03, sz:[2,1], info:'ろてんぶろが ある おやど。かんこうきゃくに 大人気。'},
  {id:'bg_mall',       name:'ショッピングモール', emoji:'🛍️', lv:14, price:30000, dev:360, income:180, sz:[2,2], info:'たくさんの お店が あつまった 大きな しょうてんがい。'},
  {id:'bg_concert',    name:'コンサートホール',   emoji:'🎼', lv:15, price:32000, dev:380, pop:0.05,  sz:[2,1], info:'すてきな おんがくが ひびく ホール。'},
  {id:'bg_plaza',      name:'ふんすい ひろば',    emoji:'⛲', lv:15, price:28000, dev:350, pop:0.03,  sz:[2,2], info:'大きな ふんすいの ある まちの まんなかの ひろば。'}
];
const rate = () => { try{ return window.__v56 ? window.__v56.inflRate() : 1; }catch(e){ return 1; } };
NEW.forEach(n => {
  DEFAULT_ART[n.id] = IMG + n.id + '.webp';
  if(TOWN_ITEMS.some(x => x.id===n.id)) return;
  const it = Object.assign({type:'bld', cat:'bld', art:n.id}, n); delete it.info;
  it.price0 = n.price; it.price = Math.round(n.price * rate() / 50) * 50;
  TOWN_ITEMS.push(it);
  try{ ZUKAN_INFO[n.id] = n.info; }catch(e){}
});
Object.entries(SZ).forEach(([id, s]) => { const it = ITEM(id); if(it) it.sz = s; });
const sz = id => { const it = id && ITEM(id); return it && it.sz ? it.sz : null; };
window.__big64 = {SZ, NEW, sz};

/* ---------- おおきさの マス ---------- */
let COV = {};
function covMap(){
  const m = {}, t = save.town; if(!t) return m;
  Object.entries(t.cells).forEach(([k, id]) => { const s = sz(id); if(!s) return; const [x, y] = k.split(',').map(Number);
    for(let dy=0; dy<s[1]; dy++) for(let dx=0; dx<s[0]; dx++) if(dx || dy) m[`${x+dx},${y+dy}`] = k; });
  return m;
}
const _isWalk64 = isWalk;
isWalk = function(x, y){ return _isWalk64(x, y) && !COV[`${x},${y}`]; };

/* ---------- まえから おいてあった たてもの → トレイへ ---------- */
function migrate(){
  const t = save.town; if(!t || t.big64) return;
  const moved = [];
  Object.keys(t.cells).forEach(k => { const id = t.cells[k]; if(!SZ[id]) return;
    t.inv[id] = (t.inv[id]||0) + 1;
    const g = (t.glv||{})[k]; if(g){ t.glvKeep = t.glvKeep || {}; (t.glvKeep[id] = t.glvKeep[id] || []).push(g); delete t.glv[k]; }
    delete t.cells[k]; moved.push(id); });
  t.big64 = 1; if(moved.length) t.big64msg = moved; persist();
}
async function notice(){
  const t = save.town; if(!t || !t.big64msg || $('#dlg').classList.contains('show')) return;
  const L = t.big64msg; delete t.big64msg; persist();
  const names = [...new Set(L)].map(id => { const it = ITEM(id), s = sz(id); return `<li>${picHTML(it)}<b>${esc(it.name)}</b><small>${s[0]}×${s[1]}マス</small></li>`; }).join('');
  await dialog(`<h2 class="dlgT">📐 大きな たてものが できたよ！</h2>
    <p class="dlgP">アップデートで、つぎの たてものが <b>2マスや 4マスの 大きな たてもの</b>に なったよ。<br>おいてあった たてものは いちど <b>トレイ（もようがえ）</b>に しまったので、ひろい ところに おきなおしてね。</p>
    <ul class="big64List">${names}</ul>
    <p class="dlgP facNote">★グレードは そのまま のこっているよ。おきなおすと もとに もどるよ。<br>まちLv12からは あたらしい 大きな たてものも かえるように なるよ！</p>`, [{label:'わかった！', cls:'gold', v:1}], 'wide');
}

/* ---------- まちの 表示 ---------- */
renderMap = (orig => function(){
  migrate(); COV = covMap();
  const o = orig.apply(this, arguments);
  try{
    const t = save.town, map = $('#townMap'), cols = townCalc().L.cols, kids = map.children;
    const cellAt = (x, y) => { const c = kids[y*cols + x]; return c && c.classList.contains('cell') && c.style.getPropertyValue('--cx')==String(x) ? c : map.querySelector(`.cell[style*="--cx:${x};--cy:${y};"]`); };
    Object.entries(t.cells).forEach(([k, id]) => { const s = sz(id); if(!s) return; const [x, y] = k.split(',').map(Number), c = cellAt(x, y); if(!c) return;
      c.classList.add('big64'); c.style.setProperty('--bw', s[0]); c.style.setProperty('--bh', s[1]); c.style.zIndex = (y + s[1] - 1)*10 + 3; });
    Object.entries(COV).forEach(([ck, ak]) => { const [x, y] = ck.split(',').map(Number), c = cellAt(x, y); if(!c) return; const [ax, ay] = ak.split(',');
      c.classList.add('cov64'); c.dataset.x = ax; c.dataset.y = ay; c.innerHTML = ''; });
  }catch(e){ console.warn(e); }
  return o;
})(renderMap);

/* ---------- おくとき：ぜんぶの マスが あいているか ---------- */
window.addEventListener('click', e => {
  if(!townEdit || !hand) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const s = sz(hand.id); if(!s) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const t = save.town, L = townCalc().L, x = +c.dataset.x, y = +c.dataset.y, key = `${x},${y}`, it = ITEM(hand.id);
  for(let dy=0; dy<s[1]; dy++) for(let dx=0; dx<s[0]; dx++){
    const nx = x+dx, ny = y+dy, k = `${nx},${ny}`;
    if(nx >= L.cols || ny >= L.rows){ toast(`📐 ${it.name}は ${s[0]}×${s[1]}マス。はみだしちゃうよ（タッチした マスが 左上に なるよ）`); return; }
    if(t.cells[k] || COV[k]){ toast(`📐 ${it.name}は ${s[0]}×${s[1]}マス あいている ところに おいてね（タッチした マスが 左上）`); return; }
  }
  t.cells[key] = hand.id; sound('tap');
  if(hand.from==='map'){ if(t.glv && t.glv[hand.key]){ t.glv[key] = t.glv[hand.key]; delete t.glv[hand.key]; } hand = null; }
  else {
    const K = t.glvKeep && t.glvKeep[hand.id]; if(K && K.length){ t.glv = t.glv || {}; t.glv[key] = K.shift(); if(!K.length) delete t.glvKeep[hand.id]; }
    t.inv[hand.id]--; if(t.inv[hand.id] <= 0){ delete t.inv[hand.id]; hand = null; }
  }
  persist(); renderTown();
}, true);

/* ---------- せつめい ---------- */
itemEffect = (orig => function(it){ const s0 = orig.apply(this, arguments), s = it && it.sz; return s ? `📐 ${s[0]}×${s[1]}マス・${s0}` : s0; })(itemEffect);
show = (orig => function(name){ const o = orig.apply(this, arguments); if(name==='town') setTimeout(() => { try{ migrate(); notice(); }catch(e){} }, 600); return o; })(show);
try{ migrate(); }catch(e){}
setInterval(() => { if(curScreen==='town' && save.town && save.town.big64msg && !document.hidden) notice(); }, 3000);
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER64}`; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   まなびタウン v6.5
   ⑰ ヘリコプター（ヘリポートが ひつよう）・ひこうき（くうこうが ひつよう）
   ⑱ 海（Lv10）：りくの となりは すなはま → 1マス はなれると 青い 海。グラデーションで なじむ
      みなと：まちでは 上から 見た 絵。川・海と つながる
      船（Lv10・みなとが ひつよう）：海・川を すすむ。はしの 下を くぐる
   ＋ ポイントの ところに 水晶の かず（タッチで こうかんじょ）
   ===================================================================== */
(function(){
'use strict';
const VER65 = '6.5.0', IMG = './assets/images/v65/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SEA = 'sea', HARBOR = 'harbor', BRIDGE = 'road_bridge', RIVER = 'river';

/* ---------- アイテム ---------- */
const tileIcon = inner => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8DC86"/><stop offset=".22" stop-color="#F3E0A8"/><stop offset=".45" stop-color="#F3E0A8"/><stop offset=".62" stop-color="#74D2DB"/><stop offset="1" stop-color="#3AA2DA"/></linearGradient></defs><rect x="4" y="4" width="112" height="112" rx="22" fill="url(#g)" stroke="#fff" stroke-width="5"/>${inner}</svg>`);
DEFAULT_ART.bld_sea = tileIcon('<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M66 40q6 -6 12 0t12 0"/><path d="M74 78q6 -6 12 0t12 0"/></g><circle cx="38" cy="78" r="4" fill="#F6B4A0"/><path d="M34 46l4 -8l4 8l-8 -5h8z" fill="#F28C6A"/>');
Object.assign(DEFAULT_ART, {veh_heli:IMG+'veh_heli.webp', veh_plane:IMG+'veh_plane.webp', veh_yacht:IMG+'veh_yacht.webp', veh_fishboat:IMG+'veh_fishboat.webp', veh_ferry:IMG+'veh_ferry.webp', harbor_top:IMG+'harbor_top.webp'});
const ADD = [
  {id:SEA, type:'bld', cat:'road', name:'うみ', art:'bld_sea', emoji:'🌊', price:20, lv:10, dev:1, desc:'りくの となりは すなはま・1マス はなれると 青い 海・船が とおれる'},
  {id:'heli',     type:'veh', name:'ヘリコプター', art:'veh_heli',     emoji:'🚁', price:3500,  lv:7,  traffic:6,  pop:0.02, air:'heli',  req:{has:{heliport:1}}},
  {id:'plane',    type:'veh', name:'ひこうき',     art:'veh_plane',    emoji:'✈️', price:9000,  lv:11, traffic:12, pop:0.05, air:'plane', req:{has:{airport:1}}},
  {id:'yacht',    type:'veh', name:'ヨット',       art:'veh_yacht',    emoji:'⛵', price:2500,  lv:10, traffic:4,  pop:0.02, ship:.62, req:{has:{harbor:1}}},
  {id:'fishboat', type:'veh', name:'りょうせん',   art:'veh_fishboat', emoji:'🚤', price:3000,  lv:10, traffic:5,  income:20, ship:.62, req:{has:{harbor:1}}},
  {id:'ferry',    type:'veh', name:'フェリー',     art:'veh_ferry',    emoji:'⛴️', price:6000,  lv:10, traffic:10, pop:0.03, ship:.82, req:{has:{harbor:1}}}
];
const rate = () => { try{ return window.__v56 ? window.__v56.inflRate() : 1; }catch(e){ return 1; } };
ADD.forEach(a => { if(TOWN_ITEMS.some(x => x.id===a.id)) return; const it = Object.assign({}, a); it.price0 = a.price; const v = a.price * rate(); it.price = v < 100 ? Math.max(5, Math.round(v/5)*5) : Math.round(v/50)*50; TOWN_ITEMS.push(it); });
try{ Object.assign(ZUKAN_INFO, {sea:'しおかぜの ふく 海。りくの となりは すなはまに なるよ。', heli:'ヘリポートから まちの 空を とびまわる。', plane:'くうこうから とびたって とおくの まちへ。',
  yacht:'風を うけて すすむ 白い ヨット。', fishboat:'海で 魚を とる 船。', ferry:'人や 車を のせて はこぶ 大きな 船。'}); }catch(e){}
const isShip = id => !!ITEM(id)?.ship, isAir = id => !!ITEM(id)?.air;
itemEffect = (orig => function(it){
  const s = orig.apply(this, arguments);
  if(it && it.id===HARBOR) return `${s}・⛵ 船が でいりする（川や 海と つながる）`;
  if(it && it.ship) return `${s}・⛵ 海や 川を すすむ（みなとが ひつよう）`;
  if(it && it.air==='heli') return `${s}・🚁 まちの 空を とぶ（ヘリポートが ひつよう）`;
  if(it && it.air==='plane') return `${s}・✈️ くうこうから とびたつ（くうこうが ひつよう）`;
  return s;
})(itemEffect);
openBuilding = (orig => async function(key){
  if(save.town?.cells?.[key]===SEA){ const it = ITEM(SEA); await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">うみ</h2><p class="dlgP" style="font-size:14px">${esc(itemEffect(it))}</p>`, [{label:'とじる', cls:'white', v:null}], 'wide'); return; }
  return orig.apply(this, arguments);
})(openBuilding);

/* ---------- 海の 色（りくからの きょり） ---------- */
const C = {land:[168,220,134], sand:[243,224,168], sea:[77,187,224], sea2:[58,162,218], deep:[44,140,203]};
const hex = c => `rgb(${c.map(Math.round).join(',')})`, mix = (a,b,t=.5) => a.map((v,i) => v + (b[i]-v)*t);
const rgba = (c,a) => `rgba(${c.map(Math.round).join(',')},${a})`;
const isWater = id => id===SEA || id===RIVER || id===HARBOR || id===BRIDGE;
let DEPTH = {};
let CHAN613 = {};
/* v6.23：川が 海に 入る ところ（河口）を さがす。1つの 河口は 1つの むきだけ（まっすぐ 海へ） */
function mouths623(D){
  const t = save.town, L = townCalc().L, c = (x,y) => t.cells[`${x},${y}`], D4 = [[0,1],[1,0],[0,-1],[-1,0]];
  const isRv = id => id===RIVER || id===BRIDGE, isW = id => isRv(id) || id===HARBOR, out = [];
  for(let y=0; y<L.rows; y++) for(let x=0; x<L.cols; x++){
    if(!isRv(c(x,y))) continue;
    const sea = D4.filter(([dx,dy]) => c(x+dx,y+dy)===SEA); if(!sea.length) continue;
    const rv = D4.filter(([dx,dy]) => isW(c(x+dx,y+dy)));
    let dir = sea.find(([dx,dy]) => rv.some(([ex,ey]) => ex===-dx && ey===-dy));          // まっすぐ 海へ
    if(!dir && rv.length <= 1) dir = sea[0];                                             // 川の おわり
    if(!dir) continue;                                                                   // 海ぞいを ながれる 川は そのまま
    const path = []; let px = x + dir[0], py = y + dir[1];
    for(let i=0; i<4 && c(px,py)===SEA && (D ? (D[`${px},${py}`]||9) : 1) <= 1; i++){ path.push([px,py]); px += dir[0]; py += dir[1]; }
    out.push({x, y, dx:dir[0], dy:dir[1], path, end:[px,py]});
  }
  return out;
}
function calcDepth(){ CHAN613 = {};
  const t = save.town, L = townCalc().L, D = {}, q = [];
  const W = (x,y) => x<0 || y<0 || x>=L.cols || y>=L.rows || isWater(t.cells[`${x},${y}`]);
  Object.entries(t.cells).forEach(([k,id]) => { if(id!==SEA) return; const [x,y] = k.split(',').map(Number);
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) if((dx||dy) && !W(x+dx,y+dy)){ if(D[k]==null){ D[k] = 1; q.push([x,y]); } } });
  while(q.length){ const [x,y] = q.shift(), d = D[`${x},${y}`];
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++){ const k = `${x+dx},${y+dy}`; if(t.cells[k]===SEA && D[k]==null){ D[k] = d + 1; q.push([x+dx,y+dy]); } } }
  Object.entries(t.cells).forEach(([k,id]) => { if(id===SEA && D[k]==null) D[k] = 9; });
  /* 川・みなと・はしの となりは「かこう」：すなはまに しないで 水に する（船が とおれる） */
  /* 河口の すなはまは すなの まま（船は とおれる）・みなとの となりは 水 */
  mouths623(D).forEach(m => m.path.forEach(([x,y]) => { CHAN613[`${x},${y}`] = 1; }));
  Object.keys(D).forEach(k => { if(D[k]!==1) return; const [x,y] = k.split(',').map(Number);
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => t.cells[`${x+dx},${y+dy}`]===HARBOR)){ CHAN613[k] = 1; D[k] = 2; } });
  return D;
}
const colOf = d => d===1 ? C.sand : d===2 ? C.sea : d<=4 ? C.sea2 : C.deep;
const SIDES = [['n',0,-1,'to bottom'],['s',0,1,'to top'],['w',-1,0,'to right'],['e',1,0,'to left']];
function seaStyle(x, y, d){
  const t = save.town, L = townCalc().L, me = colOf(d), layers = [], foam = [];
  const nb = (a,b) => { if(a<0||b<0||a>=L.cols||b>=L.rows) return 'out'; const id = t.cells[`${a},${b}`]; return id===SEA ? colOf(DEPTH[`${a},${b}`]) : isWater(id) ? 'water' : 'land'; };
  SIDES.forEach(([s,dx,dy,dir]) => { const n = nb(x+dx, y+dy); if(n==='out' || n==='water') return;
    if(n==='land'){ layers.push(`linear-gradient(${dir}, ${hex(C.land)} 0%, ${rgba(me,0)} 42%)`); return; }
    if(n!==me){ const m = mix(me, n); layers.push(`linear-gradient(${dir}, ${hex(m)} 0%, ${rgba(m,0)} 50%)`); if(d>=2 && n===C.sand) foam.push(s); } });
  [[-1,-1,'0% 0%'],[1,-1,'100% 0%'],[-1,1,'0% 100%'],[1,1,'100% 100%']].forEach(([dx,dy,pos]) => {
    if(nb(x+dx,y+dy)==='land' && nb(x+dx,y)!=='land' && nb(x,y+dy)!=='land') layers.push(`radial-gradient(circle at ${pos}, ${hex(C.land)} 0%, ${rgba(C.sand,0)} 46%)`);
    if(d>=2 && nb(x+dx,y+dy)===C.sand && nb(x+dx,y)!==C.sand && nb(x,y+dy)!==C.sand && nb(x+dx,y)!=='land' && nb(x,y+dy)!=='land') layers.push(`radial-gradient(circle at ${pos}, ${hex(mix(me,C.sand))} 0%, ${rgba(me,0)} 48%)`); });
  return {bg:`background-color:${hex(me)};${layers.length ? `background-image:${layers.join(',')};` : ''}`, foam};
}
const FOAM_ROT = {n:0, e:90, s:180, w:270};
const hash = (x,y,k=0) => ((x*73856093) ^ (y*19349663) ^ (k*83492791)) >>> 0;
function seaDeco(x, y, d, foam){
  const h = hash(x,y), parts = [];
  foam.forEach(s => parts.push(`<g transform="rotate(${FOAM_ROT[s]} 50 50)"><path class="fm65" d="M-2 9q7 -6 13 0t13 0t13 0t13 0t13 0t13 0t13 0t13 0"/><path class="fm65 b" d="M-2 17q7 -5 13 0t13 0t13 0t13 0t13 0t13 0t13 0t13 0"/></g>`));
  if(d===1){ if(h%5===0) parts.push(`<path d="M${30+h%40} ${30+(h>>4)%40}l3.5 -7l3.5 7l-7 -4.5h7z" fill="#F28C6A"/>`); if(h%7===1) parts.push(`<ellipse cx="${25+h%50}" cy="${60+(h>>3)%25}" rx="4" ry="3" fill="#F7C6B6"/>`);
    for(let i=0;i<5;i++){ const hh = hash(x,y,i); parts.push(`<circle cx="${hh%100}" cy="${(hh>>7)%100}" r="1.1" fill="#D9C08A" opacity=".6"/>`); } }
  else { if(h%2===0) parts.push(`<path class="wv65" d="M${22+h%40} ${30+(h>>3)%40}q4 -4 8 0t8 0"/>`); if(h%3===0) parts.push(`<circle class="spk65" cx="${20+(h>>2)%60}" cy="${20+(h>>5)%60}" r="1.6"/>`); }
  return parts.length ? `<svg class="sea65svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${parts.join('')}</svg>` : '';
}
function harborStyle(x, y){
  const t = save.town, L = townCalc().L, m = [];
  const land = (a,b) => a>=0 && b>=0 && a<L.cols && b<L.rows && !isWater(t.cells[`${a},${b}`]);
  /* v6.8：海がわも ふちを ぼかして、下に かいた 海と なじませる */
  SIDES.forEach(([s,dx,dy,dir]) => { m.push(land(x+dx,y+dy) ? `linear-gradient(${dir}, transparent 0%, transparent 6%, #000 30%)` : `linear-gradient(${dir}, transparent 0%, rgba(0,0,0,.35) 9%, #000 22%)`); });
  return `-webkit-mask-image:${m.join(',')};mask-image:${m.join(',')};-webkit-mask-composite:source-in;mask-composite:intersect;`;
}
function drawSea(){
  const map = $('#townMap'); if(!map || !save.town) return;
  DEPTH = calcDepth();
  const cellAt = (x,y) => map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]:not(.cov64)`);
  Object.entries(save.town.cells).forEach(([k,id]) => {
    if(id!==SEA && id!==HARBOR) return; const [x,y] = k.split(',').map(Number), c = cellAt(x,y); if(!c) return;
    c.querySelectorAll('.bimg,.sea65svg,.hb65').forEach(e => e.remove()); c.style.zIndex = 1;
    if(id===SEA){ const d = DEPTH[k]; c.classList.add('sea65', d===1 ? 'beach65' : 'water65'); c.insertAdjacentHTML('afterbegin', seaDeco(x,y,d,[])); }
    else { c.classList.add('harbor65'); c.insertAdjacentHTML('afterbegin', `<img class="hb65" src="${X(artSrc('harbor_top'))}" alt="" style="${harborStyle(x,y)}">`); }
  });
  seaCanvas(map);
}
/* v6.7：海を 1まいの 絵として かく（マスの つなぎめが 出ない・しぜんな グラデーション） */
function seaCanvas(map){
  map.querySelectorAll('.seaCv67').forEach(e => e.remove());
  const t = save.town, L = townCalc().L, cells = t.cells;
  if(!Object.values(cells).some(id => id===SEA)) return;
  /* v6.10：じっさいの 海の マスを きじゅんに 位置を きめる（1マス ずれない）。画面の 細かさに あわせて こまかく かく */
  const seaKeys = Object.keys(cells).filter(k => cells[k]===SEA), [ax, ay] = seaKeys[0].split(',').map(Number);
  const c0 = map.querySelector(`.cell[data-x="${ax}"][data-y="${ay}"]:not(.cov64)`); if(!c0) return;
  const cs = c0.offsetWidth, R = Math.max(24, Math.min(72, Math.round(cs * (window.devicePixelRatio||1))));
  let bx0 = L.cols, by0 = L.rows, bx1 = 0, by1 = 0;
  seaKeys.forEach(k => { const [x,y] = k.split(',').map(Number); bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); });
  bx0 = Math.max(0, bx0-1); by0 = Math.max(0, by0-1); bx1 = Math.min(L.cols-1, bx1+1); by1 = Math.min(L.rows-1, by1+1);
  const W = (bx1-bx0+1)*R, H = (by1-by0+1)*R;
  const DD = [], MK = [];
  for(let y=0; y<L.rows; y++) for(let x=0; x<L.cols; x++){ const k = `${x},${y}`, id = cells[k], i = y*L.cols + x;
    if(id===SEA){ DD[i] = Math.min(5, DEPTH[k]||5); MK[i] = 1; }
    else if(id===HARBOR){ DD[i] = 2.05; MK[i] = 1; }
    else if(id===RIVER || id===BRIDGE){ DD[i] = 2.0; MK[i] = 0; }
    else { DD[i] = 0; MK[i] = 0; } }
  /* v6.13：河口は「水の すじ（チャンネル）」として かく。いくつの 方向から つながっても 1つの 水に まとまる */
  const isRv = id => id===RIVER || id===BRIDGE, D4 = [[0,1],[1,0],[0,-1],[-1,0]], cid = (x,y) => cells[`${x},${y}`];
  const EST = {}, SEG = [];
  mouths623(DEPTH).forEach(m => { EST[m.y*L.cols + m.x] = 1; const cx = m.x + .5, cy = m.y + .5;
    SEG.push([cx, cy, m.end[0] + .5 + m.dx*.3, m.end[1] + .5 + m.dy*.3]);   // まっすぐな 1本の すじ
    D4.forEach(([ex,ey]) => { const n = cid(m.x+ex, m.y+ey); if(isRv(n) || n===HARBOR) SEG.push([cx, cy, cx + ex*.5, cy + ey*.5]); }); });
  const segAt = {}; SEG.forEach(sg => { const x0 = Math.floor(Math.min(sg[0],sg[2]))-1, x1 = Math.floor(Math.max(sg[0],sg[2]))+1, y0 = Math.floor(Math.min(sg[1],sg[3]))-1, y1 = Math.floor(Math.max(sg[1],sg[3]))+1;
    for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) (segAt[y*L.cols + x] = segAt[y*L.cols + x] || []).push(sg); });
  const segD = (u, v, L2) => { let sum = 0, mn = 9; for(const [x1,y1,x2,y2] of L2){ const dx = x2-x1, dy = y2-y1, l = dx*dx + dy*dy, t = l ? Math.max(0, Math.min(1, ((u-x1)*dx + (v-y1)*dy)/l)) : 0, ex = x1 + t*dx - u, ey = y1 + t*dy - v, d = Math.sqrt(ex*ex + ey*ey); mn = Math.min(mn, d); sum += Math.exp(-7*d); } return mn; };
  const segS = (u, v, L2, k) => { let sum = 0, mn = 9; for(const [x1,y1,x2,y2] of L2){ const dx = x2-x1, dy = y2-y1, l = dx*dx + dy*dy, t = l ? Math.max(0, Math.min(1, ((u-x1)*dx + (v-y1)*dy)/l)) : 0, ex = x1 + t*dx - u, ey = y1 + t*dy - v, d = Math.sqrt(ex*ex + ey*ey); mn = Math.min(mn, d); sum += Math.exp(-7*d); }
    const sm = Math.min(mn, -Math.log(sum)/7 + .02); return mn + (sm - mn)*sst(.02, .35, k); };   // うみに ちかい ところだけ なめらかに くっつける
  for(let y=0; y<L.rows; y++) for(let x=0; x<L.cols; x++) if(EST[y*L.cols + x]) DD[y*L.cols + x] = 1.0;
  window.__est613 = EST;
  const at = (A, x, y) => A[Math.max(0, Math.min(L.rows-1, y))*L.cols + Math.max(0, Math.min(L.cols-1, x))];
  const bil = (A, u, v) => { const x = u - .5, y = v - .5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    return (at(A,x0,y0)*(1-fx) + at(A,x0+1,y0)*fx)*(1-fy) + (at(A,x0,y0+1)*(1-fx) + at(A,x0+1,y0+1)*fx)*fy; };
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'seaCv67';
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), D = img.data;
  const SAND = [243,226,172], WET = [222,204,150], SHAL = [124,214,222], MID = [74,184,226], DEEP = [40,132,200], FOAM = [255,255,255];
  const mixc = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
  const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x-a)/(b-a))); return t*t*(3-2*t); };
  const RIVW = [138,211,243], BANK = [230,214,162], END = mixc(SHAL, MID, sst(1.62, 2.6, 2.0));
  for(let py=0; py<H; py++) for(let px=0; px<W; px++){
    const u = bx0 + (px+.5)/R, v = by0 + (py+.5)/R; const o = (py*W + px)*4;
    const ci = Math.floor(v)*L.cols + Math.floor(u), SG = segAt[ci];
    /* 1) うみの そう */
    let r = 0, g = 0, b = 0, a = 0, ddH = 0;
    { const m = bil(MK, u, v), al = sst(.4, .6, m);
      if(al > 0){ const dd = ddH = bil(DD, u, v) + .07*Math.sin(u*5.1 + v*2.3) + .05*Math.sin(v*6.7 - u*1.9); let c;
        if(dd < 1.32) c = mixc(SAND, WET, sst(1.1, 1.32, dd));
        else if(dd < 1.62){ c = mixc(WET, SHAL, sst(1.38, 1.62, dd)); const f = 1 - Math.abs(dd - 1.42)/.06; if(f > 0 && !SG) c = mixc(c, FOAM, Math.min(.9, f)); }
        else if(dd < 2.6) c = mixc(SHAL, MID, sst(1.62, 2.6, dd)); else c = mixc(MID, DEEP, sst(2.6, 4.5, dd));
        if(EST[ci] && dd < 1.62) c = SAND;
        [r,g,b] = c; a = al; } }
    /* 2) 川の すじ（うえに かさねる） */
    if(SG){ const k = sst(.1, .8, bil(MK, u, v)), sd = segD(u, v, SG), w = .27 + .08*k, rim = .025*(1-k), bank = .06*(1-k) + .015;
      if(sd < w + rim + bank + .02){
        const ddv = Math.max(1.75, bil(DD, u, v)), seaW = ddv < 2.6 ? mixc(SHAL, MID, sst(1.62, 2.6, ddv)) : mixc(MID, DEEP, sst(2.6, 4.5, ddv));
        const cw = mixc(RIVW, SHAL, sst(.1, 1, k)), crim = mixc([79,169,218], cw, k), cbank = mixc(BANK, SAND, k);
        const tw = 1 - sst(w - .012, w + .008, sd), tr = 1 - sst(w + rim - .01, w + rim + .008, sd), tb = 1 - sst(w + rim + bank - .015, w + rim + bank + .015, sd);
        let c = mixc(cbank, crim, tr); c = mixc(c, cw, tw);
        const t2 = (a > 0 ? tw + (tb - tw)*(1 - k) : tb) * (a > 0 ? 1 - sst(1.5, 1.85, ddH) : 1);   // うみの 上では 岸を かかない・ふかい 水では 海と なじませる
        if(t2 > 0){ if(a <= 0){ r = c[0]; g = c[1]; b = c[2]; } else { r = r*(1-t2) + c[0]*t2; g = g*(1-t2) + c[1]*t2; b = b*(1-t2) + c[2]*t2; } a = Math.max(a, t2); } } }
    if(a <= 0){ D[o+3] = 0; continue; }
    D[o] = r; D[o+1] = g; D[o+2] = b; D[o+3] = Math.round(a*255); continue;
    const m = bil(MK, u, v);
    const al = sst(.4, .6, m); if(al <= 0){ D[o+3] = 0; continue; }
    const dd = bil(DD, u, v) + .07*Math.sin(u*5.1 + v*2.3) + .05*Math.sin(v*6.7 - u*1.9);
    let c;
    if(dd < 1.32) c = mixc(SAND, WET, sst(1.1, 1.32, dd));
    else if(dd < 1.62){ c = mixc(WET, SHAL, sst(1.38, 1.62, dd)); const f = 1 - Math.abs(dd - 1.42)/.06; if(f > 0) c = mixc(c, FOAM, Math.min(.9, f)); }
    else if(dd < 2.6) c = mixc(SHAL, MID, sst(1.62, 2.6, dd));
    else c = mixc(MID, DEEP, sst(2.6, 4.5, dd));
    D[o] = c[0]; D[o+1] = c[1]; D[o+2] = c[2]; D[o+3] = Math.round(al*255);
  }
  ctx.putImageData(img, 0, 0);
  Object.keys(EST).forEach(i => { i = +i; const x = i % L.cols, y = Math.floor(i / L.cols), cc = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]:not(.cov64)`); if(!cc) return;
    cc.querySelectorAll('.rv52').forEach(e => { e.style.visibility = 'hidden'; }); });
  Object.assign(cv.style, {left:(c0.offsetLeft + (bx0-ax)*cs)+'px', top:(c0.offsetTop + (by0-ay)*cs)+'px', width:((bx1-bx0+1)*cs)+'px', height:((by1-by0+1)*cs)+'px'});
  map.insertBefore(cv, map.firstChild);
}

/* ---------- はしの ゆか（船が 下を くぐる） ---------- */
function drawDecks(){
  const map = $('#townMap'); if(!map) return; map.querySelectorAll('.deck65').forEach(e => e.remove());
  map.querySelectorAll('.cell .brg52').forEach(b => { const c = b.closest('.cell'), y = +c.dataset.y;
    const d = document.createElement('div'); d.className = 'deck65'; d.innerHTML = b.outerHTML;
    Object.assign(d.style, {left:c.offsetLeft+'px', top:c.offsetTop+'px', width:c.offsetWidth+'px', height:c.offsetHeight+'px', zIndex:y*10+3}); map.appendChild(d); });
}

/* ---------- 船 ---------- */
const SH = {list:[], timer:null};
const water = (x,y) => { const L = townCalc().L; if(x<0 || y<0 || x>=L.cols || y>=L.rows) return false; const id = save.town.cells[`${x},${y}`]; return id===SEA ? ((DEPTH[`${x},${y}`]||9) >= 2 || !!CHAN613[`${x},${y}`]) : isWater(id); };
function cellXY(x, y){ const map = $('#townMap'), c = map && map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]:not(.cov64)`); return c ? [c.offsetLeft + c.offsetWidth/2, c.offsetTop + c.offsetHeight*0.62, c.offsetWidth] : null; }
function placeMover(m, instant){
  const p = cellXY(m.x, m.y); if(!p || !m.el) return; const [px,py,cs] = p;
  if(instant) m.el.style.transition = 'none';
  const hh = Math.round(cs * m.h); m.el.style.left = px + 'px'; m.el.style.top = py + 'px'; m.el.style.height = hh + 'px'; m.el.style.width = Math.round(hh * (m.ratio || 1.2)) + 'px';
  m.el.style.zIndex = Math.max(m.y, m.py ?? m.y)*10 + 2; m.el.classList.toggle('flip', !!m.flip);
  if(instant){ void m.el.offsetWidth; m.el.style.transition = ''; }
}
function buildShips(){
  const map = $('#townMap'); SH.list.forEach(s => s.el && s.el.remove()); SH.list = [];
  const t = save.town, hb = Object.keys(t.cells).filter(k => t.cells[k]===HARBOR); if(!hb.length) return;
  const old = SH.keep || {}; SH.keep = {};
  t.veh.filter(isShip).slice(0, 8).forEach((id, i) => {
    let [x,y] = hb[i % hb.length].split(',').map(Number); const el = document.createElement('button');
    el.className = 'ship65'; el.dataset.id = id; el.innerHTML = `<img src="${X(artSrc(ITEM(id).art))}" alt="">`; map.appendChild(el);
    const o = old[id+'#'+i], m = o && water(o.x, o.y) ? Object.assign(o, {el, py:o.y}) : {id, x, y, px:x, py:y, dx:0, dy:0, h:ITEM(id).ship, el, wait:i*2};
    SH.keep[id+'#'+i] = m; SH.list.push(m); placeMover(m, true);
    const im = el.querySelector('img'), fit = () => { if(im.naturalWidth){ m.ratio = im.naturalWidth / im.naturalHeight; placeMover(m, true); } };
    if(im.complete) fit(); else im.onload = fit;
  });
}
function stepShips(){
  SH.list.forEach(m => {
    if(m.wait > 0){ m.wait--; return; }
    const opts = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => water(m.x+dx, m.y+dy));
    if(!opts.length) return;
    let ch = opts.filter(([dx,dy]) => !(dx===-m.dx && dy===-m.dy)); if(!ch.length) ch = opts;
    const st = ch.find(([dx,dy]) => dx===m.dx && dy===m.dy); const [dx,dy] = st && Math.random() < .7 ? st : choice(ch);
    m.px = m.x; m.py = m.y; m.x += dx; m.y += dy; m.dx = dx; m.dy = dy; if(dx) m.flip = dx < 0;
    if(save.town.cells[`${m.x},${m.y}`]===HARBOR && Math.random() < .5) m.wait = rint(2,4);
    placeMover(m);
  });
}

/* ---------- ヘリコプター・ひこうき ---------- */
const AIR = {list:[]};
function buildAir(){
  const map = $('#townMap'), old = AIR.keep || {}; AIR.keep = {}; AIR.list = [];
  const t = save.town, L = townCalc().L, cells = t.cells;
  const base = id => Object.keys(cells).filter(k => cells[k]===id);
  const hp = base('heliport'), ap = base('airport');
  t.veh.filter(isAir).slice(0, 4).forEach((id, i) => {
    const kind = ITEM(id).air, homes = kind==='heli' ? hp : ap; if(!homes.length) return;
    const [hx,hy] = homes[i % homes.length].split(',').map(Number), el = document.createElement('button'), sh = document.createElement('i');
    el.className = `air65 ${kind}`; el.dataset.id = id; el.innerHTML = `<img src="${X(artSrc(ITEM(id).art))}" alt="">`; sh.className = 'airSh65';
    map.appendChild(sh); map.appendChild(el);
    const k = id+'#'+i, o = old[k]; delete old[k];
    const a = o || {id, kind}; Object.assign(a, {hx:hx + (kind==='plane' ? 1 : 0), hy:hy + (kind==='plane' ? 1 : 0), el, sh});
    AIR.keep[k] = a; AIR.list.push(a);
    { const im = el.querySelector('img'), fit = () => { if(im.naturalWidth){ a.ratio = im.naturalWidth / im.naturalHeight; if(a.last) airPos(a, ...a.last, 0); } }; if(im.complete) fit(); else im.onload = fit; }
    if(o && o.last){ if(o.fly) el.classList.add('fly'); if(o.flip) el.classList.add('flip'); airPos(a, ...o.last, 0); }
    else { airHome(a, true); a.to = setTimeout(() => airGo(a), 2500 + i*4000); }
  });
  Object.values(old).forEach(a => clearTimeout(a.to));
}
function airPos(a, gx, gy, alt, dur){
  a.last = [gx, gy, alt]; a.fly = a.el.classList.contains('fly'); a.flip = a.el.classList.contains('flip');
  const cs = cellSize(), x = gx*cs + cs/2, y = gy*cs + cs*0.6;
  a.el.style.transition = dur ? `left ${dur}ms ease-in-out, top ${dur}ms ease-in-out, transform ${dur}ms ease-in-out` : 'none';
  a.sh.style.transition = a.el.style.transition;
  const ah = Math.round(cs * (a.kind==='plane' ? .95 : .7) * (1 + alt*.25)); a.el.style.left = x + 'px'; a.el.style.top = (y - alt*cs) + 'px'; a.el.style.height = ah + 'px'; a.el.style.width = Math.round(ah * (a.ratio || 1.1)) + 'px';
  a.sh.style.left = x + 'px'; a.sh.style.top = y + 'px'; a.sh.style.width = Math.round(cs*(a.kind==='plane' ? .8 : .55)) + 'px'; a.sh.style.opacity = alt ? .22 : .32;
}
function airHome(a, instant){ a.el.classList.remove('fly'); airPos(a, a.hx, a.hy, 0, instant ? 0 : 2600); }
function airGo(a){
  if(!a.el.isConnected) return; const L = townCalc().L;
  if(a.kind==='heli'){
    let n = rint(2,4); a.el.classList.add('fly'); airPos(a, a.hx, a.hy, .8, 1600);
    const hop = () => { if(!a.el.isConnected) return; if(n-- <= 0){ airHome(a); a.to = setTimeout(() => airGo(a), rint(9000,16000)); return; }
      const gx = rint(0, L.cols-1), gy = rint(0, L.rows-1); a.el.classList.toggle('flip', gx < parseFloat(a.el.style.left)/(cellSize())); airPos(a, gx, gy, 1.1, 3800); a.to = setTimeout(hop, 4200); };
    a.to = setTimeout(hop, 1700);
  } else {
    const dir = Math.random() < .5 ? 1 : -1, ox = dir > 0 ? L.cols + 2 : -3, oy = clamp(a.hy + rint(-3,3), -2, L.rows + 1);
    a.el.classList.add('fly'); a.el.classList.toggle('flip', dir < 0);
    airPos(a, a.hx + dir*1.5, a.hy, .3, 2200);
    a.to = setTimeout(() => { airPos(a, ox, oy, 2, 5200); a.to = setTimeout(() => {
      a.el.classList.toggle('flip', dir > 0); a.to = setTimeout(() => { airPos(a, a.hx - dir*1.5, a.hy, .3, 5200); a.to = setTimeout(() => { airHome(a); a.to = setTimeout(() => airGo(a), rint(12000,20000)); }, 5300); }, rint(6000,10000));
    }, 5300); }, 2300);
  }
}

/* ---------- 道を はしる 車から 船・ひこうきを のぞく ---------- */
buildCars = (orig => function(){
  const o = orig.apply(this, arguments);
  try{ CAR.list = CAR.list.filter(c => { if(isShip(c.id) || isAir(c.id)){ c.el && c.el.remove(); return false; } return true; }); }catch(e){}
  return o;
})(buildCars);
renderMap = (orig => function(){
  const o = orig.apply(this, arguments);
  try{ drawSea(); drawDecks(); buildShips(); buildAir(); }catch(e){ console.warn(e); }
  return o;
})(renderMap);
setInterval(() => { if(curScreen==='town' && !document.hidden && !townEdit) try{ stepShips(); }catch(e){} }, 1700);
document.addEventListener('click', e => {
  const b = e.target.closest('.ship65,.air65'); if(!b || curScreen!=='town' || townEdit) return;
  e.stopImmediatePropagation(); e.preventDefault(); const it = ITEM(b.dataset.id); sound('tap');
  toast(`${it.emoji||''} ${it.name}：${b.classList.contains('ship65') ? 'ゆらゆら 海を すすんでいるよ' : b.classList.contains('heli') ? 'まちを 空から 見まもっているよ' : 'とおくの まちへ ひとっとび！'}`);
}, true);

/* ---------- 水晶の かず（ポイントの ところ） ---------- */
function cryPill(){
  const p = $('#ptPill'); if(!p) return;
  let c = p.querySelector('.cryIn65');
  if(!c){ p.insertAdjacentHTML('beforeend', `<span class="cryIn65" title="水晶の こうかんじょ"><img src="${X(artSrc('itm_crystal'))}" alt=""><b id="cryNum65">0</b></span>`); c = p.querySelector('.cryIn65'); }
  const n = save.crystal || 0, el = c.querySelector('b'); if(el.textContent !== String(n)) el.textContent = n;
}
updatePill = (orig => function(){ const o = orig.apply(this, arguments); try{ cryPill(); }catch(e){} return o; })(updatePill);
setInterval(() => { try{ cryPill(); }catch(e){} }, 1500);
document.addEventListener('click', e => {
  if(!e.target.closest('#ptPill .cryIn65')) return; e.stopImmediatePropagation(); e.preventDefault(); sound('tap');
  if(window.__v63 && window.__v63.openExchange) window.__v63.openExchange().then(() => cryPill());
}, true);
try{ cryPill(); }catch(e){}

renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER65}`; }catch(e){} return o; })(renderSettings);
window.__v65 = {calcDepth, SH, AIR, stepShips, cryPill};
})();

/* =====================================================================
   まなびタウン v6.6
   ・しゃかい：中学地理（雨温図と気候・世界の地域・日本の地域・地理の ぎのう）
   ・りか：元素（元素記号・周期表と なかま・元素の 使われかた／分子の モデル）
   ・みなとは 水べにしか おけない
   ・どうぶつえん／すいぞくかん／てんもんだい：水晶は 1日1回が わかりやすく
   ・超レア：ユニコーン ついか。超レアの 能力は ふつうの 住民より ずっと 高い
   ===================================================================== */
(function(){
'use strict';
const VER66 = '6.6.0', IMG = './assets/images/v66/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip = h => String(h||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const pick4 = (ans, pool) => { const a = String(ans), s = new Set([a]); shuffle(pool.map(String).filter(x => x!==a)).forEach(x => { if(s.size < 4) s.add(x); }); return shuffle([...s]); };
Object.assign(DEFAULT_ART, {ic_chugeo:IMG+'ic_chugeo.webp', ic_elements:IMG+'ic_elements.webp', res_unicorn:IMG+'res_unicorn.webp'});

/* =====================================================================
   1) 雨温図
   ===================================================================== */
const CLIM = {
 '熱帯雨林気候':{z:'熱帯', city:'シンガポール', t:[26.5,27.1,27.6,28,28.3,28.3,27.9,27.9,27.6,27.6,27,26.4], p:[222,115,170,165,164,135,147,146,124,165,254,288], n:['1年中 気温が 高い（どの 月も 25℃くらい）','1年中 雨が 多い。夕方に スコールが ふる','うっそうとした 熱帯雨林が 広がる']},
 'サバナ気候':{z:'熱帯', city:'ダーウィン（オーストラリア）', t:[28.6,28.4,28.5,28.2,26.9,25.2,24.8,25.7,27.5,28.9,29.3,29], p:[427,374,317,102,21,1,1,5,15,70,142,248], n:['1年中 気温が 高い','雨季（雨が 多い 時期）と 乾季（ほとんど ふらない 時期）が はっきり','たけの 高い 草原に 木が まばらに 生える']},
 '砂漠気候':{z:'乾燥帯', city:'リヤド（サウジアラビア）', t:[14.6,17.4,21.5,26.9,32.6,35.3,36.6,36.4,33.2,27.6,20.8,16], p:[14,7,22,25,5,0,0,0,0,1,7,13], n:['雨が ほとんど ふらない（棒グラフが ほぼ 0）','夏は とても 暑い','砂や 岩の 砂漠。水が わく オアシスに 人が すむ']},
 '地中海性気候':{z:'温帯', city:'ローマ（イタリア）', t:[8,8.7,11,13.5,17.8,21.8,24.8,25,21.5,17.2,12.5,9], p:[67,73,58,81,53,34,19,37,73,113,111,90], n:['夏は 雨が 少なく 乾燥する','冬に 雨が 多い','オリーブ・ぶどう・オレンジを 育てる']},
 '西岸海洋性気候':{z:'温帯', city:'ロンドン（イギリス）', t:[5.8,6.2,8.3,10.4,13.6,16.6,18.9,18.6,16,12.5,8.7,6.2], p:[55,41,42,44,49,45,45,50,49,69,59,55], n:['1年中 同じくらいの 雨が ふる','緯度が 高い わりに 冬が あたたかい（偏西風と 暖流の おかげ）','夏は すずしい']},
 '温暖湿潤気候':{z:'温帯', city:'東京', t:[5.4,6.1,9.4,14.3,18.8,21.9,25.7,26.9,23.3,18,12.5,7.7], p:[60,56,117,125,138,168,154,168,210,198,93,58], n:['四季が はっきり している','夏は 暑くて 雨が 多い（梅雨・台風）','冬は 気温が 下がり 雨が 少ない']},
 '冷帯（亜寒帯）気候':{z:'冷帯', city:'モスクワ（ロシア）', t:[-6.5,-6.7,-1,6.7,13.2,17,19.2,17,11.3,5.6,-0.4,-4.5], p:[53,44,39,37,61,77,84,78,66,70,52,51], n:['冬は 0℃を 下回り 寒さが きびしい','夏は 気温が 上がる（気温の 差が 大きい）','針葉樹林（タイガ）が 広がる']},
 'ツンドラ気候':{z:'寒帯', city:'ウトキアグヴィク（アラスカ）', t:[-25,-26,-25,-17,-6,1.8,4.7,3.4,-0.6,-9,-17,-23], p:[4,4,3,4,4,9,24,26,17,10,5,4], n:['1年の ほとんどが 0℃いか','夏の みじかい あいだだけ 0℃を こえる','こけ類が 育つ。地面が こおった まま（永久凍土）']}
};
const JCLIM = {
 '北海道の気候':{city:'札幌', t:[-3.2,-2.7,1.1,7.3,13,17,21.1,22.3,18.6,12.1,5.2,-0.9], p:[108,92,78,55,56,60,91,127,142,110,114,115], n:['冬の 寒さが きびしい（0℃いか）','梅雨が ない（6月の 雨が 少ない）','夏は すずしい'], r:'北海道'},
 '日本海側の気候':{city:'上越（新潟県）', t:[2,2.1,5,10.8,16.2,20.4,24.4,25.9,21.9,16,10,4.8], p:[425,272,192,99,92,129,206,154,188,192,310,438], n:['冬（12〜2月）に 雪や 雨が とても 多い','北西の 季節風が 日本海で しめって 山に ぶつかる','夏は 晴れて 暑い'], r:'中部'},
 '太平洋側の気候':{city:'東京', t:JCLIM_T('東京'), p:[60,56,117,125,138,168,154,168,210,198,93,58], n:['夏に 雨が 多い（梅雨・台風）','冬は 晴れて 乾燥する','南東の 季節風が 夏に 雨を もたらす'], r:'関東'},
 '中央高地（内陸）の気候':{city:'松本（長野県）', t:[-0.4,0.2,3.9,10.3,15.8,19.6,23.6,24.7,20.3,13.6,7.4,2.1], p:[36,44,80,75,100,126,138,92,130,95,52,30], n:['1年中 雨が 少ない','夏と 冬の 気温の 差が 大きい','冬は 寒い（山に かこまれた 内陸）'], r:'中部'},
 '瀬戸内の気候':{city:'岡山', t:[4.9,5.5,8.9,14.3,19.1,22.9,27,28.3,24.4,18.3,12.5,7.3], p:[35,46,82,90,113,170,177,98,141,87,53,39], n:['1年中 雨が 少なく 晴れが 多い','中国山地と 四国山地が 季節風を さえぎる','水不足に そなえて ため池が 多い'], r:'中国'},
 '南西諸島の気候':{city:'那覇（沖縄県）', t:[17.3,17.5,19.1,21.5,24.2,27.1,29,28.9,27.9,25.5,22.5,19], p:[101,115,142,161,232,247,141,241,261,153,111,103], n:['冬でも あたたかい（15℃いじょう）','1年中 雨が 多い','台風が よく 来る'], r:'九州'}
};
function JCLIM_T(){ return [5.4,6.1,9.4,14.3,18.8,21.9,25.7,26.9,23.3,18,12.5,7.7]; }
function chartSVG(t, p, opt={}){
  const W = 300, H = 190, x0 = 34, x1 = 268, y0 = 16, y1 = 156, Tmin = -30, Tmax = 40, Pmax = 500;
  const ty = v => y1 - (v - Tmin) / (Tmax - Tmin) * (y1 - y0), py = v => y1 - Math.min(v, Pmax) / Pmax * (y1 - y0), bw = (x1 - x0) / 12;
  let g = '';
  for(let v = -30; v <= 40; v += 10) g += `<line x1="${x0}" y1="${ty(v)}" x2="${x1}" y2="${ty(v)}" stroke="${v===0?'#B9A58A':'#EEE4D3'}" stroke-width="${v===0?1.4:1}"/><text x="${x0-4}" y="${ty(v)+3.5}" font-size="9" text-anchor="end" fill="#C0392B">${v}</text>`;
  for(let v = 0; v <= 500; v += 100) g += `<text x="${x1+4}" y="${py(v)+3.5}" font-size="9" fill="#1C6AAE">${v}</text>`;
  p.forEach((v,i) => { g += `<rect x="${x0 + i*bw + bw*.18}" y="${py(v)}" width="${bw*.64}" height="${y1 - py(v)}" fill="#7FB6E6"/>`; if(v > Pmax) g += `<text x="${x0 + i*bw + bw/2}" y="${y0-2}" font-size="7" text-anchor="middle" fill="#1C6AAE">${v}</text>`; });
  g += `<polyline points="${t.map((v,i) => `${x0 + i*bw + bw/2},${ty(v)}`).join(' ')}" fill="none" stroke="#E8414B" stroke-width="2.4"/>` + t.map((v,i) => `<circle cx="${x0 + i*bw + bw/2}" cy="${ty(v)}" r="2.6" fill="#E8414B"/>`).join('');
  for(let i=0;i<12;i++) g += `<text x="${x0 + i*bw + bw/2}" y="${y1+12}" font-size="9" text-anchor="middle" fill="#6B5540">${i+1}</text>`;
  const avg = t.reduce((a,b) => a+b, 0)/12, sum = p.reduce((a,b) => a+b, 0);
  g += `<text x="${x0-4}" y="10" font-size="9" text-anchor="end" fill="#C0392B">℃</text><text x="${x1+4}" y="10" font-size="9" fill="#1C6AAE">mm</text><text x="${x1+12}" y="${y1+12}" font-size="9" text-anchor="middle" fill="#6B5540">月</text>`;
  g += `<text x="${(x0+x1)/2}" y="${H}" font-size="${opt.city && opt.city.length > 9 ? 8.5 : 10}" text-anchor="middle" font-weight="700" fill="#4A3A2A">年平均気温 ${avg.toFixed(1)}℃　年降水量 ${Math.round(sum).toLocaleString()}mm${opt.city ? `（${opt.city}）` : ''}</text>`;
  return `<svg class="fig56 chart66" viewBox="0 0 ${W} ${H+4}" width="${W}"><rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" fill="#FFFDF6" stroke="#D9C9AE"/>${g}</svg>`;
}
const legend = '<div class="lg66"><span class="t">● 気温（左・℃）</span><span class="p">■ 降水量（右・mm）</span></div>';

/* =====================================================================
   2) 世界の 地域・日本の 地域（ことばの 問題）
   [問題, 答え, まちがい3, かいせつ, 図（w:国 / j:都道府県 / r:地方 / c:気候）, 問題にも 図を 出すか]
   ===================================================================== */
const WR = [
 ['赤道付近で、1年中 暑くて 雨が 多い 気候帯は？','熱帯','乾燥帯/温帯/寒帯','熱帯は 赤道の まわり。熱帯雨林や サバナが 広がるよ。','c:熱帯雨林気候'],
 ['雨が とても 少なく、砂漠や ステップ（たけの 短い 草原）が 広がる 気候帯は？','乾燥帯','熱帯/冷帯/寒帯','乾燥帯は 雨より 蒸発する 水の ほうが 多い。','c:砂漠気候'],
 ['夏に 乾燥し、冬に 雨が 多い 地中海沿岸の 気候は？','地中海性気候','西岸海洋性気候/温暖湿潤気候/ステップ気候','夏の 乾燥に 強い オリーブや ぶどうを 育てるよ。','c:地中海性気候'],
 ['偏西風と 暖流の えいきょうで、緯度が 高い わりに 冬が あたたかい 西ヨーロッパの 気候は？','西岸海洋性気候','地中海性気候/冷帯（亜寒帯）気候/サバナ気候','大西洋を 流れる 暖流（北大西洋海流）の 上を 偏西風が ふいて くるよ。','c:西岸海洋性気候'],
 ['冬の 寒さが きびしく、タイガと よばれる 針葉樹林が 広がる 気候帯は？','冷帯（亜寒帯）','熱帯/乾燥帯/温帯','シベリアや カナダに 広がる。冬は −20℃いかに なることも。','c:冷帯（亜寒帯）気候'],
 ['1年の ほとんどが こおっていて、夏の 短い あいだだけ こけ類が 育つ 気候は？','ツンドラ気候','サバナ気候/ステップ気候/地中海性気候','地面の 下が 1年中 こおっている「永久凍土」が あるよ。','c:ツンドラ気候'],
 ['1年中 気温が 高く、雨季と 乾季が はっきりして、たけの 高い 草原が 広がる 気候は？','サバナ気候','熱帯雨林気候/砂漠気候/西岸海洋性気候','アフリカの サバナには キリンや ゾウが くらす。','c:サバナ気候'],
 ['アンデス山脈など 標高の 高い ところで 見られる、昼と 夜の 気温差が 大きい 気候は？','高山気候','ツンドラ気候/砂漠気候/地中海性気候','標高が 100m 上がるごとに 気温は 約0.6℃ 下がる。赤道ちかくでも すずしいよ。','w:Peru'],
 ['緯度0度の 線を 何という？','赤道','本初子午線/日付変更線/北回帰線','赤道は 地球を 北半球と 南半球に 分ける 線。','w:Ecuador'],
 ['ほぼ 経度180度に そって 引かれ、ここを こえると 日付を 調整する 線は？','日付変更線','本初子午線/赤道/北回帰線','西から 東へ こえると 日付を 1日 もどし、東から 西へ こえると 1日 すすめる。',''],
 ['正距方位図法の 地図で 正しく 表されるのは？','中心からの 距離と 方位','すべての 面積/すべての 形/緯線と 経線の 角度だけ','航空図に 使われる。中心いがいの 2点の 距離や 方位は 正しくない。',''],
 ['メルカトル図法の 地図の とくちょうは？','高緯度ほど 面積が 大きく 表される','面積が 正しい/中心からの 距離が 正しい/まるい 形の 地図','角度が 正しいので 航海図に 使われた。グリーンランドが 大きく 見えるよ。',''],
 ['世界を 6つの 州に 分けたとき、ふくまれないのは？','南極州','アジア州/アフリカ州/オセアニア州','6つの 州：アジア・ヨーロッパ・アフリカ・北アメリカ・南アメリカ・オセアニア。',''],
 ['ノルウェーの 海岸に 見られる、氷河に けずられた 細長く 奥行きの ある 湾は？','フィヨルド','リアス海岸/三角州/扇状地','氷河が けずった 谷に 海水が 入りこんで できたよ。','w:Norway',1],
 ['ヨーロッパで、小麦などの 栽培と ぶた・牛などの 家畜の 飼育を 組み合わせた 農業は？','混合農業','地中海式農業/焼畑農業/遊牧','ドイツや フランスで さかん。','w:Germany',1],
 ['地中海沿岸で、夏に オリーブや ぶどう、冬に 小麦を つくる 農業は？','地中海式農業','混合農業/酪農/焼畑農業','夏の 乾燥に 強い 作物を 育てる くふう。','w:Italy',1],
 ['EUの 多くの 国で 国境を こえる ときの ようすは？','パスポートなしで 行き来 できる','かならず ビザが いる/国境が 閉じている/船でしか こえられない','EUは 人・もの・お金の 移動を 自由に して、経済の 結びつきを 強めているよ。',''],
 ['中国で 人口の 約9割を しめる 民族は？','漢民族','モンゴル族/チベット族/ウイグル族','中国には 50 いじょうの 少数民族も くらしている。','w:China',1],
 ['中国で 人口の 増えすぎを おさえるため 2015年まで 行われていた 政策は？','一人っ子政策','減反政策/白豪主義/ニューディール政策','いまは 少子高齢化が 問題に なっている。','w:China',1],
 ['中国で、沿岸部と 内陸部の あいだで 問題に なっている ことは？','経済格差（収入の 差）','人口が 少なすぎる/雨が ふらない/ことばが 通じない','工業が 発展した 沿岸部と 内陸部で 収入の 差が 大きい。','w:China',1],
 ['東南アジアで、同じ 田で 米を 1年に 2回 つくることを 何という？','二期作','二毛作/輪作/混合農業','1年に ちがう 作物を 2回 つくるのは「二毛作」。','w:Thailand',1],
 ['東南アジアで、ヨーロッパ人が 開いた、天然ゴムや 油やしを 大規模に 育てる 農園は？','プランテーション','オアシス/フィヨルド/パンパ','マレーシアや インドネシアに 多い。','w:Malaysia',1],
 ['インド南部の ベンガルールなどで 発展している 産業は？','ICT（情報通信技術）産業','鉄鋼業/造船業/石炭産業','英語を 話せる 技術者が 多く、アメリカと 時差を いかして 仕事を しているよ。','w:India',1],
 ['インドで 多くの 人が 信仰し、牛を 神聖な 動物と する 宗教は？','ヒンドゥー教','イスラム教/キリスト教/仏教','ガンジス川で 身を 清める 人も 多い。','w:India',1],
 ['西アジアの ペルシア湾岸で 多く とれる 資源は？','石油（原油）','鉄鉱石/金/天然ゴム','日本は 原油の ほとんどを 西アジアから 輸入している。','w:Saudi Arabia',1],
 ['イスラム教で 食べることが 禁じられている 肉は？','ぶた肉','牛肉/とり肉/羊肉','イスラム教の 人は 1日5回、聖地メッカの 方向に いのりを ささげる。','w:Saudi Arabia',1],
 ['アフリカの 多くの 国のように、特定の 農産物や 鉱産資源の 輸出に たよる 経済は？','モノカルチャー経済','計画経済/バブル経済/循環型経済','ねだんが 下がると 国全体の 収入が へって しまうのが 問題。',''],
 ['ガーナや コートジボワールで 多く 生産される、チョコレートの 原料は？','カカオ','コーヒー/茶/綿花','カカオ豆は 赤道ちかくの 暑い 地域で 育つ。','w:Ghana',1],
 ['サハラ砂漠の 南の ふちで、砂漠化が すすんでいる 地域は？','サヘル','パンパ/タイガ/プレーリー','木の 切りすぎや 家畜の 放牧しすぎも 原因の 1つ。','w:Niger',1],
 ['アメリカの 北緯37度より 南の、あたたかく ICT産業などが 発展した 地域は？','サンベルト','ラストベルト/シリコンバレー/グレートプレーンズ','土地が 広く 安く、気候が あたたかいので 工場が 集まった。','w:United States of America',1],
 ['アメリカの サンフランシスコ近くに ある、ICT企業が 集まる 地域は？','シリコンバレー','サンベルト/ウォール街/ハリウッド','半導体の 材料「シリコン」から 名前が ついた。','w:United States of America',1],
 ['アメリカで、メキシコなどから 移り住んだ スペイン語を 話す 人々は？','ヒスパニック','アボリジニ/マオリ/イヌイット','農場や 工事現場などで はたらく 人が 多い。','w:United States of America',1],
 ['アマゾン川流域で、森林を 焼いて その灰を 肥料に する 農業は？','焼畑農業','混合農業/地中海式農業/酪農','森林が へることが 問題に なっている。','w:Brazil',1],
 ['ブラジルで、さとうきびから つくられ 自動車の 燃料に 使われる ものは？','バイオエタノール','天然ガス/石炭/軽油','植物から つくる 燃料で、二酸化炭素の 増加を おさえると 考えられている。','w:Brazil',1],
 ['アルゼンチンの ラプラタ川流域に 広がる 草原は？','パンパ','サバナ/タイガ/ステップ','小麦の 栽培や 牛の 放牧が さかん。','w:Argentina',1],
 ['オーストラリアの 先住民は？','アボリジニ','マオリ/イヌイット/ヒスパニック','ニュージーランドの 先住民は マオリ。','w:Australia',1],
 ['ニュージーランドの 先住民は？','マオリ','アボリジニ/イヌイット/ヒスパニック','ラグビーの 試合前の ハカは マオリの おどりが もと。','w:New Zealand',1],
 ['オーストラリアが かつて とっていた、ヨーロッパ系 以外の 移民を 制限する 政策は？','白豪主義','多文化主義/一人っ子政策/アパルトヘイト','いまは さまざまな 文化を 認めあう 多文化主義を すすめている。','w:Australia',1],
 ['オーストラリアで、地面を 直接 けずって 鉄鉱石や 石炭を ほる 方法は？','露天掘り','坑道掘り/焼畑/棚田','日本は 鉄鉱石や 石炭を オーストラリアから 多く 輸入している。','w:Australia',1],
 ['ロシアの ヨーロッパ側と アジア側を 分ける 山脈は？','ウラル山脈','アルプス山脈/アンデス山脈/ロッキー山脈','ウラル山脈の 東側は シベリアと よばれる。','w:Russia',1],
 ['南アメリカ大陸の 西側を 南北に 走る 山脈は？','アンデス山脈','ロッキー山脈/ウラル山脈/ヒマラヤ山脈','世界で いちばん 長い 山脈。','w:Peru',1],
 ['北アメリカ大陸の 西側を 南北に 走る 山脈は？','ロッキー山脈','アンデス山脈/アパラチア山脈/ウラル山脈','東側には なだらかな アパラチア山脈が ある。','w:Canada',1]
];
const JR = [
 ['九州南部に 広がる、火山の 噴出物が つもって できた 台地は？','シラス台地','根釧台地/牧ノ原/秋吉台','水を 通しやすく 稲作に むかないので、さつまいもや 畜産が さかん。','j:鹿児島県',1],
 ['明治時代に つくられ、北九州工業地域の 発展の きっかけに なった 製鉄所は？','八幡製鉄所','富岡製糸場/釜石製鉄所/佐渡金山','中国から 鉄鉱石、筑豊から 石炭が 手に 入りやすかった。','j:福岡県',1],
 ['熊本県 水俣市で 発生した、工場の はいすいが 原因の 公害病は？','水俣病','イタイイタイ病/四日市ぜんそく/新潟水俣病','四大公害病：水俣病・新潟水俣病・イタイイタイ病・四日市ぜんそく。','j:熊本県',1],
 ['富山県の 神通川 流域で 発生した 公害病は？','イタイイタイ病','水俣病/四日市ぜんそく/新潟水俣病','鉱山から 流れた カドミウムが 原因。','j:富山県',1],
 ['岡山県の 児島と 香川県の 坂出を 結ぶ 本州四国連絡橋は？','瀬戸大橋','明石海峡大橋/しまなみ海道/レインボーブリッジ','鉄道と 自動車の 両方が 通れる。','j:香川県',1],
 ['山あいの 地域などで 人口が へり、くらしを 続けるのが むずかしく なる ことを 何という？','過疎','過密/ドーナツ化現象/ヒートアイランド現象','人が 集まりすぎる ことは「過密」。',''],
 ['高知平野で ビニールハウスを 使って なすや ピーマンの 出荷を 早める 栽培は？','促成栽培','抑制栽培/輪作/混合農業','冬でも あたたかい 気候を いかしているよ。','j:高知県',1],
 ['鳥取県の 日本海沿岸に 広がる、日本 最大級の 砂丘は？','鳥取砂丘','九十九里浜/天橋立/秋吉台','らっきょうや ながいもの 栽培も さかん。','j:鳥取県'],
 ['大阪府や 兵庫県の 大阪湾沿岸に 広がる 工業地帯は？','阪神工業地帯','京浜工業地帯/中京工業地帯/北九州工業地域','中小工場が 多いのが とくちょう。','j:大阪府',1],
 ['京都市で、古い 町並みや けしきを 守るために 定めている きまりは？','景観条例','環境基本法/建築基準法/ハザードマップ','建物の 高さや かんばんの 色などを 制限しているよ。','j:京都府',1],
 ['紀伊山地で さかんな、すぎや ひのきを 育てる 産業は？','林業','漁業/酪農/鉄鋼業','「吉野すぎ」「尾鷲ひのき」が 有名。','j:奈良県',1],
 ['琵琶湖で、プランクトンが 大量に ふえて 水が 赤く にごる 現象は？','赤潮','黒潮/親潮/やませ','合成洗剤を 使わない 運動で 水質を よくしようと した。','j:滋賀県',1],
 ['中部地方を 3つに 分けたとき、日本海側の 地域は？','北陸','東海/中央高地/山陰','北陸・中央高地・東海に 分けられる。','r:中部'],
 ['北陸で、冬の 農作業が できない 時期の 副業から 発達した 輪島塗などの 産業は？','地場産業（伝統産業）','重化学工業/酪農/ICT産業','雪で 外に 出られない 冬に 家の 中で 作業したのが はじまり。','j:石川県',1],
 ['愛知県 豊田市を 中心に さかんな 工業は？','自動車工業','鉄鋼業/造船業/繊維工業','中京工業地帯は 工業出荷額が 日本一。','j:愛知県',1],
 ['静岡県 浜松市などで オートバイや 楽器の 生産が さかんな 工業地域は？','東海工業地域','京葉工業地域/北陸工業地域/瀬戸内工業地域','ピアノや 楽器の 工場が 多い。','j:静岡県',1],
 ['甲府盆地の 扇状地で 栽培が さかんな くだものは？','ぶどう・もも','りんご・さくらんぼ/みかん・びわ/パイナップル','水はけが よく、昼と 夜の 気温差が 大きいので あまく なる。','j:山梨県',1],
 ['長野県の 八ヶ岳の ふもとで、夏の すずしさを いかして つくる 高原野菜は？','レタス','さつまいも/ピーマン/さとうきび','ほかの 産地が 少ない 夏に 出荷する「抑制栽培」。','j:長野県',1],
 ['群馬県 嬬恋村で 多く つくられる 高原野菜は？','キャベツ','なす/さつまいも/トマト','夏に すずしい 高原で 育てて 出荷する。','j:群馬県',1],
 ['大都市の 中心部の 気温が まわりより 高く なる 現象は？','ヒートアイランド現象','ドーナツ化現象/過疎/やませ','アスファルトや エアコンの 熱が 原因。','j:東京都'],
 ['東京都心のように、昼間の 人口が 夜間の 人口より 多く なるのは なぜ？','通勤・通学で 人が 集まるから','観光客が 夜に 帰るから/夜に 停電するから/夜は 外出禁止だから','まわりの 県から 毎日 多くの 人が 通ってくる。','j:東京都'],
 ['千葉県の 東京湾岸に 広がる、石油化学工業が さかんな 工業地域は？','京葉工業地域','京浜工業地帯/北関東工業地域/東海工業地域','うめ立て地に 石油化学コンビナートが 並ぶ。','j:千葉県',1],
 ['東北地方の 太平洋側に 夏に ふく、冷たく しめった 北東の 風は？','やませ','からっ風/偏西風/フェーン','やませが 続くと 気温が 上がらず 冷害が おこる。','r:東北'],
 ['やませが ふき続けると おこりやすい 災害は？','冷害','干害/雪害/高潮','稲が じゅうぶんに 育たず、米の 収穫が へる。','r:東北'],
 ['青森県で 毎年 夏に 行われる 祭りは？','ねぶた祭','竿燈まつり/七夕まつり/花笠まつり','秋田＝竿燈まつり、仙台＝七夕まつり、山形＝花笠まつり。','j:青森県',1],
 ['岩手県の 伝統的工芸品は？','南部鉄器','天童将棋駒/会津塗/輪島塗','天童将棋駒は 山形県、会津塗は 福島県、輪島塗は 石川県。','j:岩手県',1],
 ['山形盆地で 生産量が 多い くだものは？','さくらんぼ','みかん/パイナップル/マンゴー','山形県は さくらんぼの 生産量が 日本一。','j:山形県',1],
 ['北海道の 先住民族は？','アイヌの 人々','琉球の 人々/マオリ/アボリジニ','「サッポロ」など、アイヌ語が もとの 地名が 多い。','r:北海道'],
 ['北海道の 十勝平野で 行われる、いくつかの 作物を 年ごとに 順番に つくる 農業は？','輪作','二期作/焼畑農業/促成栽培','同じ 作物を つくり続けると 土地が やせるのを ふせぐ。','j:北海道'],
 ['北海道の 石狩平野は、もともと どんな 土地だった？','泥炭地（水はけの 悪い しっち）','砂漠/火山灰の 台地/扇状地','客土（ほかから よい 土を 運ぶ）で 米どころに なった。','j:北海道'],
 ['沖縄県で 多く 栽培される、砂糖の 原料に なる 作物は？','さとうきび','てんさい/小麦/茶','北海道では「てんさい」から 砂糖を つくる。','j:沖縄県',1],
 ['沖縄の 伝統的な 家で、台風に そなえる くふうは？','家を 石垣で かこむ','屋根に 雪止めを つける/まどを 二重に する/家を 高い 木の 上に つくる','かわらを しっくいで とめる くふうも ある。','j:沖縄県',1],
 ['日本列島の 太平洋側を 南から 北へ 流れる 暖流は？','黒潮（日本海流）','親潮（千島海流）/リマン海流/対馬海流','北から 南へ 流れる 寒流は 親潮（千島海流）。',''],
 ['日本列島の 太平洋側を 北から 南へ 流れる 寒流は？','親潮（千島海流）','黒潮（日本海流）/対馬海流/北大西洋海流','栄養が 豊富で 魚の えさに なる プランクトンが 多い。',''],
 ['原子力発電所が 多く つくられているのは どんな ところ？','海ぞい（冷却水が 得やすい）','大都市の 中心/山の 上/内陸の 盆地','福井県の 若狭湾ぞいに 多い。',''],
 ['火力発電所が 多く つくられているのは どんな ところ？','大都市に 近い 海ぞい','山あいの ダム/内陸の 盆地/島の 山の 上','燃料を 船で 運びやすく、電気を 使う 都市に 近い。',''],
 ['水力発電所が 多く つくられているのは どんな ところ？','山あい（ダムが つくれる）','大都市の 海ぞい/平野の まんなか/砂浜','水の 落ちる 力を 使う ので 山の 中に つくる。',''],
 ['いまの 日本の 人口ピラミッドの 形に 近いのは？','つぼ型','富士山型/つりがね型/ピラミッド型','子どもが 少なく、お年寄りが 多い 少子高齢化の 形。','',0,'pyr']
];

/* ---------- 図 ---------- */
const wmap = n => { try{ return worldSVG(n, {zoom:true}); }catch(e){ return ''; } };
const PB = n => PREF.find(p => p[0]===n);
function jmap(n, hl){
  const p = PB(n); if(!p) return ''; const [x,y] = prefXY(p);
  return `<svg class="jpMap ex56Map" viewBox="${Math.max(0,Math.min(200,x-100)).toFixed(0)} ${Math.max(0,Math.min(240,y-100)).toFixed(0)} 200 200">${jpBase()}${pinSVG(x,y)}<text x="${x+11}" y="${y-9}" font-size="13" font-weight="900" fill="#E8414B" stroke="#fff" stroke-width="3.5" paint-order="stroke">${X(n)}</text></svg>`;
}
function rmap(r){ return `<svg class="jpMap ex56Map" viewBox="0 0 400 440">${jpBase()}${PREF.filter(p => p[2]===r).map(p => { const [x,y] = prefXY(p); return `<circle cx="${x}" cy="${y}" r="7" fill="#FF9F43" stroke="#fff" stroke-width="2"/>`; }).join('')}</svg>`; }
function pyrSVG(){
  const rows = [[2.0,2.1],[2.3,2.4],[2.5,2.6],[2.7,2.8],[3.0,3.1],[3.3,3.4],[3.6,3.7],[4.0,4.0],[4.6,4.6],[4.1,4.2],[3.6,3.7],[3.6,3.7],[3.9,4.2],[3.6,4.1],[3.1,3.7],[2.4,3.2],[1.6,2.7],[0.9,2.0]];
  let g = ''; rows.forEach(([m,f],i) => { const y = 170 - i*9; g += `<rect x="${130 - m*22}" y="${y}" width="${m*22}" height="8" fill="#7FB6E6"/><rect x="${134}" y="${y}" width="${f*22}" height="8" fill="#FFB3C1"/>`; });
  return `<svg class="fig56" viewBox="0 0 270 200" width="270">${g}<text x="70" y="194" font-size="11" text-anchor="middle" fill="#1C6AAE">男</text><text x="200" y="194" font-size="11" text-anchor="middle" fill="#C0392B">女</text><text x="132" y="12" font-size="10" text-anchor="middle" fill="#6B5540">高齢</text><text x="132" y="190" font-size="10" text-anchor="middle" fill="#6B5540">子ども</text></svg>`;
}
const CL_IMG = z => ({'熱帯':'🌴','乾燥帯':'🏜️','温帯':'🌸','冷帯':'🌲','寒帯':'🧊'})[z] || '';
function figOf(k){
  if(!k) return ''; const [t, n] = [k.slice(0,1), k.slice(2)];
  if(t==='w') return wmap(n); if(t==='j') return jmap(n); if(t==='r') return rmap(n);
  if(t==='c'){ const C = CLIM[n]; return C ? chartSVG(C.t, C.p, {city:C.city}) + legend : ''; }
  return '';
}
const GLG = {'熱帯':'赤道ちかく。1年中 暑い','乾燥帯':'雨が とても 少ない','温帯':'四季が ある。日本の 多くの 地域','冷帯（亜寒帯）':'冬が とても 寒い。針葉樹林','寒帯':'1年中 とても 寒い',
 '二毛作':'1年に ちがう 作物を 2回','輪作':'年ごとに ちがう 作物を 順番に','促成栽培':'早く 育てて 出荷','抑制栽培':'おそく 育てて 出荷','混合農業':'作物＋家畜','地中海式農業':'夏は オリーブ・ぶどう、冬は 小麦','焼畑農業':'森を 焼いて 畑に','酪農':'牛を 育てて 牛乳・チーズ',
 '過密':'人が 集まりすぎる','ドーナツ化現象':'都心の 人口が へり、まわりが ふえる','ヒートアイランド現象':'都市の 中心の 気温が 高く なる','黒潮（日本海流）':'南から 北へ 流れる 暖流','親潮（千島海流）':'北から 南へ 流れる 寒流',
 '京浜工業地帯':'東京・神奈川','中京工業地帯':'愛知・三重（自動車）','阪神工業地帯':'大阪・兵庫','北九州工業地域':'福岡（八幡製鉄所）','京葉工業地域':'千葉（石油化学）','東海工業地域':'静岡（オートバイ・楽器）','瀬戸内工業地域':'岡山・広島・山口・香川・愛媛',
 '水俣病':'熊本県（水銀）','新潟水俣病':'新潟県 阿賀野川（水銀）','イタイイタイ病':'富山県（カドミウム）','四日市ぜんそく':'三重県（大気汚染）',
 'アボリジニ':'オーストラリアの 先住民','マオリ':'ニュージーランドの 先住民','イヌイット':'北アメリカの 北極ちかくの 先住民','ヒスパニック':'スペイン語を 話す 移民',
 'パンパ':'アルゼンチンの 草原','サバナ':'熱帯の 草原','タイガ':'冷帯の 針葉樹林','ステップ':'乾燥帯の たけの 短い 草原','プレーリー':'北アメリカの 草原',
 'リアス海岸':'山が しずんだ ギザギザの 海岸','三角州':'河口の 三角形の 土地','扇状地':'山の 出口の 扇形の 土地','本初子午線':'経度0度（ロンドン）','北回帰線':'北緯23.4度',
 'ラストベルト':'アメリカ北東部の 古い 工業地帯','シリコンバレー':'ICT企業が 集まる','サンベルト':'北緯37度より 南',
 '竿燈まつり':'秋田県','七夕まつり':'宮城県 仙台','花笠まつり':'山形県','天童将棋駒':'山形県','会津塗':'福島県','輪島塗':'石川県','ねぶた祭':'青森県','南部鉄器':'岩手県'};
function bankRow(L, q){ const s = strip(q); return L.find(r => s.includes(strip(r[0]))); }
function bankGen(L){ return function(){ const r = choice(L), f = figOf(r[4]); return {type:'choice', q:r[0], ans:r[1], opts:shuffle([r[1]].concat(r[2].split('/'))), disp: r[5] && f ? `<div class="qfig66">${f}</div>` : (r[6]==='pyr' ? pyrSVG() : ''), hint:'', sub:r[0]}; }; }
function bankExp(L){ return function(p, v){
  const r = bankRow(L, p.q); if(!r) return null;
  const out = {figs:[], steps:[`<b>${X(r[0])}</b> → <b class="okc">${X(r[1])}</b>`, X(r[3])], tip:'', why:''};
  const f = r[6]==='pyr' ? pyrSVG() : figOf(r[4]); if(f) out.figs.push(f);
  if(r[4] && r[4].startsWith('c:')){ const C = CLIM[r[4].slice(2)]; if(C) out.steps.push(`雨温図の 読み方：${C.n.map(X).join('／')}`); }
  if(v && v!==r[1]){ const g = GLG[v]; out.why = g ? `きみが えらんだ「${X(v)}」は：${X(g)}` : `「${X(v)}」では ないよ`; }
  return out; }; }

/* ---------- 雨温図の 問題 ---------- */
function climGen(){
  if(Math.random() < .5){
    const k = choice(Object.keys(CLIM)), C = CLIM[k];
    return {type:'choice', q:'この 雨温図に あてはまる 気候は？', disp:`<div class="qfig66">${chartSVG(C.t, C.p)}${legend}</div>`, ans:k, opts:pick4(k, Object.keys(CLIM)), hint:'気温の 線と 雨の 棒の 両方を 見よう', sub:'clim|'+k};
  }
  const k = choice(Object.keys(JCLIM)), C = JCLIM[k];
  return {type:'choice', q:'この 雨温図に あてはまる 日本の 気候区分は？', disp:`<div class="qfig66">${chartSVG(C.t, C.p)}${legend}</div>`, ans:k, opts:pick4(k, Object.keys(JCLIM)), hint:'冬と 夏の 雨の 量に 注目', sub:'jclim|'+k};
}
function climExp(p, v){
  const W = CLIM[p.ans], J = JCLIM[p.ans], C = W || J; if(!C) return null;
  const out = {figs:[chartSVG(C.t, C.p, {city:C.city}) + legend], steps:[], tip:'', why:''};
  out.steps.push(`この 雨温図は <b>${X(C.city)}</b> → <b class="okc">${X(p.ans)}</b>${W ? `（${X(W.z)}）` : ''}`);
  C.n.forEach(s => out.steps.push(X(s)));
  const V = CLIM[v] || JCLIM[v];
  if(V && v!==p.ans){ out.figs.push(`<div class="cmp66"><b>🔵 きみの こたえ「${X(v)}」は こんな グラフ（${X(V.city)}）</b>${chartSVG(V.t, V.p)}</div>`); out.why = `「${X(v)}」の とくちょう：${X(V.n[0])}`; }
  if(J) out.figs.push(rmap(J.r));
  out.tip = W ? '見る ポイント：① 気温の 線の 高さ（暑い？寒い？） ② 気温の 上がり下がりの 大きさ ③ 雨の 棒が 多い 季節' : '日本の 気候：冬の 雨が 多い→日本海側、夏の 雨が 多い→太平洋側、1年中 少ない→中央高地・瀬戸内';
  return out;
}

/* ---------- 地理の ぎのう（時差・縮尺・等高線） ---------- */
const TZ = [['ロンドン',0],['パリ',15],['カイロ',30],['ペキン',120],['シドニー',150],['ニューヨーク',-75],['ロサンゼルス',-120],['リオデジャネイロ',-45]];
const lonT = l => l===0 ? '経度0度' : l > 0 ? `東経${l}度` : `西経${-l}度`;
function fmtT(d, h){ const ap = h < 12 ? '午前' : '午後', hh = h % 12; return `1月${d}日 ${ap}${hh}時`; }
function tzSVG(city, lon){
  const L = [-120,-75,-45,0,15,30,120,135,150], xs = l => 20 + (l + 130)/290*260;
  let g = `<line x1="10" y1="40" x2="290" y2="40" stroke="#8A7560" stroke-width="2"/>`;
  [-120,-60,0,60,120].forEach(l => { g += `<line x1="${xs(l)}" y1="34" x2="${xs(l)}" y2="46" stroke="#8A7560"/><text x="${xs(l)}" y="60" font-size="9" text-anchor="middle" fill="#6B5540">${l===0?'0':l>0?`東${l}`:`西${-l}`}</text>`; });
  [[135,'東京','#E8414B'],[lon,city,'#1C6AAE']].forEach(([l,n,c],i) => { g += `<circle cx="${xs(l)}" cy="40" r="6" fill="${c}"/><text x="${xs(l)}" y="${i ? 24 : 24}" font-size="11" font-weight="900" text-anchor="middle" fill="${c}" dy="${i && Math.abs(xs(l)-xs(135)) < 40 ? -12 : 0}">${n}</text>`; });
  g += `<text x="150" y="80" font-size="10" text-anchor="middle" fill="#4A3A2A">東へ 行くほど 時こくが すすむ（15度で 1時間）</text>`;
  return `<svg class="fig56" viewBox="0 0 300 88" width="300">${g}</svg>`;
}
function ctrSVG(steepLeft, mark, sn='A'){
  let g = '', cx = steepLeft ? 85 : 215;
  for(let i=0;i<7;i++){ const rx = 18 + i*20, ry = 12 + i*11, shift = (steepLeft ? 1 : -1) * i * 11; g += `<ellipse cx="${cx + shift}" cy="${100}" rx="${rx}" ry="${ry}" fill="none" stroke="${i===4?'#8A5A2B':'#B88A5A'}" stroke-width="${i===4?2:1.2}"/>`; }
  if(mark){ const on = sn==='A' ? 'B' : 'A'; g += `<text x="${steepLeft ? 8 : 292}" y="70" font-size="16" font-weight="900" text-anchor="middle" fill="#6B3A1A">${sn}</text><text x="${steepLeft ? 292 : 8}" y="70" font-size="16" font-weight="900" text-anchor="middle" fill="#6B3A1A">${on}</text>`; }
  return `<svg class="fig56" viewBox="0 0 300 200" width="300"><rect width="300" height="200" rx="8" fill="#F5F9EE"/>${g}<text x="150" y="194" font-size="9" text-anchor="middle" fill="#6B5540">等高線（同じ 高さを 結んだ 線）</text></svg>`;
}
function hillSVG(n){
  let g = ''; for(let i=0;i<5;i++){ g += `<ellipse cx="150" cy="95" rx="${130 - i*24}" ry="${80 - i*15}" fill="none" stroke="#B88A5A" stroke-width="${i===0?2:1.2}"/>`; }
  g += `<text x="150" y="${95-80+12}" font-size="10" text-anchor="middle" fill="#8A5A2B">100</text><text x="150" y="96" font-size="10" text-anchor="middle" fill="#8A5A2B">▲</text>`;
  const ry = 80 - n*15, px = 150 + (130 - n*24) * 0.70711, py = 95 + ry * 0.70711;
  g += `<circle cx="${px}" cy="${py}" r="5" fill="#E8414B"/><text x="${px+8}" y="${py+4}" font-size="13" font-weight="900" fill="#E8414B">P</text>`;
  return `<svg class="fig56" viewBox="0 0 300 190" width="300"><rect width="300" height="190" rx="8" fill="#F5F9EE"/>${g}<text x="150" y="186" font-size="9" text-anchor="middle" fill="#6B5540">2万5千分の1（主曲線は 10mごと）・いちばん 外が 100m</text></svg>`;
}
function rulerSVG(cm){ let g = ''; for(let i=0;i<=cm;i++) g += `<line x1="${20+i*30}" y1="30" x2="${20+i*30}" y2="${i%1?38:42}" stroke="#555"/><text x="${20+i*30}" y="54" font-size="9" text-anchor="middle">${i}</text>`;
  return `<svg class="fig56" viewBox="0 0 ${40+cm*30} 62" width="${Math.min(300, 40+cm*30)}"><circle cx="20" cy="18" r="5" fill="#E8414B"/><circle cx="${20+cm*30}" cy="18" r="5" fill="#1C6AAE"/><line x1="20" y1="18" x2="${20+cm*30}" y2="18" stroke="#E8414B" stroke-width="2" stroke-dasharray="4 3"/><rect x="14" y="28" width="${12+cm*30}" height="18" fill="#FFF3C9" stroke="#C9A100"/>${g}<text x="${30+cm*30}" y="54" font-size="9">cm</text></svg>`; }
function skillGen(){
  const k = rint(0, 4);
  if(k===0){ const [c, l] = choice(TZ), h0 = rint(8, 20), d0 = 10, diff = (l - 135)/15, tt = h0 + diff, d = d0 + Math.floor(tt/24), h = ((tt % 24) + 24) % 24;
    const ans = fmtT(d, h), wrong = []; [h0 - diff, tt + 1, tt - 1, tt + 12].forEach(x => { const dd = d0 + Math.floor(x/24), hh = ((x % 24) + 24) % 24; wrong.push(fmtT(dd, hh)); });
    return {type:'choice', q:`東京（東経135度）が <b>${fmtT(d0, h0)}</b> の とき、<b>${c}</b>（${lonT(l)}が 基準）は 何日の 何時？`, ans, opts:pick4(ans, wrong), hint:'経度の 差 ÷ 15 ＝ 時差', disp:'', sub:`tz|${c}|${l}|${h0}`}; }
  if(k===1){ const sc = choice([25000, 50000]), cm = rint(2, 8), m = sc*cm/100, ans = m >= 1000 ? `${m/1000}km` : `${m}m`;
    const f = v => v >= 1000 ? `${v/1000}km` : `${v}m`;
    return {type:'choice', q:`${sc===25000 ? '2万5千' : '5万'}分の1の 地形図で、2つの 地点の あいだが <b>${cm}cm</b> だった。実際の きょりは？`, ans, opts:pick4(ans, [f(m*10), f(m/10), f(sc===25000 ? m*2 : m/2), f(m+500)]), disp:rulerSVG(cm), hint:'地図上の 長さ × 縮尺の 分母', sub:`sc|${sc}|${cm}`}; }
  if(k===2){ const left = Math.random() < .5, sn = Math.random() < .5 ? 'A' : 'B', ask = Math.random() < .5 ? 'steep' : 'gentle', ans = ask==='steep' ? sn : (sn==='A' ? 'B' : 'A');
    return {type:'choice', q:`A・Bの がわの 斜面の うち、かたむき（傾斜）が <b>${ask==='steep' ? '急' : 'ゆるやか'}</b>なのは どちら？`, ans, opts:['A','B','同じ','わからない'], disp:ctrSVG(left, true, sn), hint:'等高線の 間かくに 注目', sub:`ctr|${left?1:0}|${sn}|${ask}`}; }
  if(k===3){ const n = rint(1, 4), h = 100 + n*10, ans = `${h}m`;
    return {type:'choice', q:'この 地形図（2万5千分の1）で、地点Pの 標高は？', ans, opts:pick4(ans, [`${h+10}m`, `${h-10}m`, `${100+n*20}m`, `${h+20}m`]), disp:hillSVG(n), hint:'いちばん 外の 線が 100m。内がわへ 1本ごとに +10m', sub:`hill|${n}`}; }
  const sc = choice([25000, 50000]), ans = sc===25000 ? '10mごと' : '20mごと';
  return {type:'choice', q:`${sc===25000 ? '2万5千' : '5万'}分の1の 地形図で、主曲線（細い 等高線）は 何mごとに 引かれる？`, ans, opts:['10mごと','20mごと','50mごと','100mごと'], disp:'', hint:'縮尺が 大きい（くわしい）ほど こまかい', sub:`ci|${sc}`};
}
function skillExp(p, v){
  const s = String(p.sub||''), out = {figs:[], steps:[], tip:'', why:''}, a = s.split('|');
  if(a[0]==='tz'){ const c = a[1], l = +a[2], h0 = +a[3], diff = (l - 135)/15;
    out.figs.push(tzSVG(c, l));
    out.steps.push(`経度の 差：135度 と ${lonT(l)} → <b>${Math.abs(135 - l)}度</b>`, `時差：${Math.abs(135 - l)} ÷ 15 ＝ <b>${Math.abs(diff)}時間</b>`, `${c}は 東京より ${diff < 0 ? '西' : '東'}に あるので、時こくは ${Math.abs(diff)}時間 ${diff < 0 ? 'おくれる' : 'すすむ'}`, `答え：<b class="okc">${X(p.ans)}</b>`);
    out.tip = '日付が かわる ときは 0時を こえたかに 注意！ 東京は 世界の 中でも 時こくが 早い ほう'; return out; }
  if(a[0]==='sc'){ const sc = +a[1], cm = +a[2]; out.figs.push(rulerSVG(cm));
    out.steps.push(`地図上の 長さ × 縮尺の 分母 ＝ 実際の 長さ`, `${cm}cm × ${sc.toLocaleString()} ＝ ${(cm*sc).toLocaleString()}cm`, `cm → m は ÷100 → <b class="okc">${X(p.ans)}</b>`);
    out.tip = '2万5千分の1 では 4cm ＝ 1km、5万分の1 では 2cm ＝ 1km'; return out; }
  if(a[0]==='ctr'){ const sn = a[2]||'A', on = sn==='A' ? 'B' : 'A'; out.figs.push(ctrSVG(a[1]==='1', true, sn)); out.steps.push('等高線の 間かくが <b>せまい</b> ところ → 傾斜が 急', '等高線の 間かくが <b>広い</b> ところ → 傾斜が ゆるやか', `${sn} がわは 線が こみあっているので 急、${on} がわは 間かくが 広いので ゆるやか`, `答え：<b class="okc">${X(p.ans)}</b>`); out.tip = '登山では 等高線が こみあった ところは きつい 登り坂'; return out; }
  if(a[0]==='hill'){ const n = +a[1]; out.figs.push(hillSVG(n)); out.steps.push('いちばん 外の 等高線が 100m', `内がわへ 1本 すすむごとに +10m（2万5千分の1 の 主曲線）`, `P は 外から ${n+1}本めの 線の 上 → 100 ＋ 10 × ${n} ＝ <b class="okc">${100+n*10}m</b>`); return out; }
  if(a[0]==='ci'){ out.steps.push('2万5千分の1：主曲線 10mごと・計曲線（太い 線）50mごと', '5万分の1：主曲線 20mごと・計曲線 100mごと', `答え：<b class="okc">${X(p.ans)}</b>`); out.figs.push(ctrSVG(true, false)); return out; }
  return null;
}

/* ---------- 単元の とうろく ---------- */
const SOCU = {
  cg_clim:{n:'雨温図と 世界・日本の 気候', gen:climGen, exp:climExp},
  cg_world:{n:'世界の 地域（中学）', gen:bankGen(WR), exp:bankExp(WR)},
  cg_japan:{n:'日本の 地域（中学）', gen:bankGen(JR), exp:bankExp(JR)},
  cg_skill:{n:'地理の ぎのう（時差・縮尺・等高線）', gen:skillGen, exp:skillExp}
};
Object.entries(SOCU).forEach(([k, u]) => { MATH_UNITS[k] = {n:u.n, g:'soc', lv:3, art:'ic_chugeo', gen:u.gen, exp:u.exp}; SOC_LV[k] = 3; SOC_CAT[k] = '🗺️ 中学地理'; });
window.__geo66 = {CLIM, JCLIM, WR, JR, chartSVG};

/* =====================================================================
   2) りか：元素
   ===================================================================== */
// [記号, 名前, 原子番号, 周期, 族, 金属?, 常温の すがた, ひとこと]
const EL = [
 ['H','水素',1,1,1,0,'気体','いちばん 軽い 元素。燃えると 水が できる'],['He','ヘリウム',2,1,18,0,'気体','空気より 軽く 風船に 使う。ほとんど 反応しない'],
 ['Li','リチウム',3,2,1,1,'固体','スマホの 電池（リチウムイオン電池）に 使う'],['Be','ベリリウム',4,2,2,1,'固体','軽くて かたい 金属'],
 ['B','ホウ素',5,2,13,0,'固体','ホウ酸に ふくまれる'],['C','炭素',6,2,14,0,'固体','ダイヤモンドも えんぴつの しんも 炭素。有機物に かならず ふくまれる'],
 ['N','窒素',7,2,15,0,'気体','空気の 約78%を しめる'],['O','酸素',8,2,16,0,'気体','空気の 約21%。ものを 燃やす はたらき'],
 ['F','フッ素',9,2,17,0,'気体','歯みがき粉に 入れて むし歯を ふせぐ'],['Ne','ネオン',10,2,18,0,'気体','ネオンサインで 赤く 光る'],
 ['Na','ナトリウム',11,3,1,1,'固体','食塩（塩化ナトリウム）に ふくまれる。水と はげしく 反応'],['Mg','マグネシウム',12,3,2,1,'固体','燃やすと まぶしい 白い 光を 出す'],
 ['Al','アルミニウム',13,3,13,1,'固体','軽い 金属。1円玉や アルミかんに 使う'],['Si','ケイ素',14,3,14,0,'固体','コンピュータの 半導体や 太陽電池に 使う'],
 ['P','リン',15,3,15,0,'固体','マッチの 箱の 側面や 肥料に 使う'],['S','硫黄',16,3,16,0,'固体','黄色い 固体。火山の まわりで とれる'],
 ['Cl','塩素',17,3,17,0,'気体','黄緑色の 気体。プールや 水道水の 消毒に 使う'],['Ar','アルゴン',18,3,18,0,'気体','空気に 約1% ふくまれる'],
 ['K','カリウム',19,4,1,1,'固体','バナナや 肥料に 多く ふくまれる'],['Ca','カルシウム',20,4,2,1,'固体','ほねや 歯、貝がらに ふくまれる'],
 ['Mn','マンガン',25,4,7,1,'固体','乾電池（二酸化マンガン）に 使う'],['Fe','鉄',26,4,8,1,'固体','いちばん 多く 使われる 金属。じしゃくに つく'],
 ['Ni','ニッケル',28,4,10,1,'固体','100円玉や 50円玉に ふくまれる。じしゃくに つく'],['Cu','銅',29,4,11,1,'固体','10円玉の おもな 成分。電気を よく 通し 電線に 使う'],
 ['Zn','亜鉛',30,4,12,1,'固体','トタン板の めっきや 電池に 使う'],['Ag','銀',47,5,11,1,'固体','電気と 熱を いちばん よく 通す 金属'],
 ['Sn','スズ',50,5,14,1,'固体','ブリキの めっきや はんだに 使う'],['I','ヨウ素',53,5,17,0,'固体','ヨウ素液に 使い、でんぷんで 青むらさき色に なる'],
 ['Ba','バリウム',56,6,2,1,'固体','レントゲン検査で のむ 白い 薬に 使う'],['Pt','白金',78,6,10,1,'固体','さびにくく 実験器具や アクセサリーに 使う（プラチナ）'],
 ['Au','金',79,6,11,1,'固体','さびにくく、とても うすく のばせる'],['Hg','水銀',80,6,12,1,'液体','ふつうの 温度で 液体の ただ1つの 金属'],
 ['Pb','鉛',82,6,14,1,'固体','とても 重く やわらかい 金属。放射線を さえぎる']
];
const ES = s => EL.find(e => e[0]===s), EN = n => EL.find(e => e[1]===n);
const BASIC = EL.filter(e => e[2] <= 20 || ['Fe','Cu','Zn','Ag','Au','Hg','Mn','Ba','I','Pb'].includes(e[0]));
const kindCol = e => e[4]===18 ? '#E6DAFF' : e[5] ? '#D9ECFF' : '#FFF1C2';
function tileSVG(e, hide){
  const c = kindCol(e);
  return `<svg class="fig56 tile66" viewBox="0 0 120 130" width="120"><rect x="4" y="4" width="112" height="122" rx="12" fill="${c}" stroke="#8A7560" stroke-width="2.5"/>
    <text x="14" y="26" font-size="16" font-weight="900" fill="#6B5540">${e[2]}</text>
    <text x="60" y="78" font-size="44" font-weight="900" text-anchor="middle" fill="${hide==='sym' ? '#E8414B' : '#2C2C2C'}">${hide==='sym' ? '？' : e[0]}</text>
    <text x="60" y="108" font-size="15" font-weight="900" text-anchor="middle" fill="${hide==='name' ? '#E8414B' : '#4A3A2A'}">${hide==='name' ? '？？？' : e[1]}</text>
    <text x="106" y="22" font-size="10" text-anchor="end" fill="#8A7560">${e[5] ? '金属' : '非金属'}</text></svg>`;
}
/* 周期表（1〜6周期）。ok=赤、ng=青、star=かくして ★ */
function ptSVG(ok, ng, star){
  const cs = 17, W = 18*cs + 8, H = 6*cs + 24; let g = '';
  const exist = (p, gr) => p===1 ? (gr===1 || gr===18) : p<=3 ? (gr<=2 || gr>=13) : true;
  for(let p=1; p<=6; p++) for(let gr=1; gr<=18; gr++){ if(!exist(p, gr)) continue;
    const x = 4 + (gr-1)*cs, y = 4 + (p-1)*cs, e = EL.find(z => z[3]===p && z[4]===gr), isOk = e && ok && e[0]===ok, isNg = e && ng && e[0]===ng;
    const fill = isOk ? '#FFB3B3' : isNg ? '#BFD9F5' : e ? kindCol(e) : '#F6F1E8';
    g += `<rect x="${x}" y="${y}" width="${cs-1.5}" height="${cs-1.5}" rx="2" fill="${fill}" stroke="${isOk ? '#E8414B' : isNg ? '#1C6AAE' : '#D9C9AE'}" stroke-width="${isOk||isNg ? 2 : .8}"/>`;
    if(e) g += `<text x="${x + cs/2 - .8}" y="${y + cs*.68}" font-size="${e[0].length>1 ? 7 : 8.5}" font-weight="900" text-anchor="middle" fill="#3A3A3A">${star && isOk ? '★' : e[0]}</text>`; }
  g += `<rect x="4" y="${H-14}" width="9" height="9" fill="#D9ECFF"/><text x="16" y="${H-6}" font-size="8" fill="#4A3A2A">金属</text><rect x="44" y="${H-14}" width="9" height="9" fill="#FFF1C2"/><text x="56" y="${H-6}" font-size="8" fill="#4A3A2A">非金属</text><rect x="96" y="${H-14}" width="9" height="9" fill="#E6DAFF"/><text x="108" y="${H-6}" font-size="8" fill="#4A3A2A">貴ガス（18族）</text><text x="${W-4}" y="${H-6}" font-size="8" text-anchor="end" fill="#8A7560">← 族（たて）／周期（よこ）</text>`;
  return `<svg class="fig56 pt66" viewBox="0 0 ${W} ${H}" width="${Math.min(330, W*1.08)}">${g}</svg>`;
}
/* 分子の モデル */
const ATOM = {H:['#FFFFFF',9],O:['#E8414B',13],C:['#3A3A3A',13],N:['#4C97FF',13],Cl:['#59C059',14]};
const MOL = [
 ['H₂O','水',[['O',60,40],['H',36,58],['H',84,58]],'酸素原子1こ と 水素原子2こ'],
 ['CO₂','二酸化炭素',[['O',30,45],['C',60,45],['O',90,45]],'炭素原子1こ と 酸素原子2こ'],
 ['O₂','酸素',[['O',47,45],['O',73,45]],'酸素原子2こが 結びついた 分子'],
 ['H₂','水素',[['H',52,45],['H',68,45]],'水素原子2こが 結びついた 分子'],
 ['N₂','窒素',[['N',47,45],['N',73,45]],'窒素原子2こ。空気の 約78%'],
 ['NH₃','アンモニア',[['N',60,40],['H',38,58],['H',60,66],['H',82,58]],'窒素原子1こ と 水素原子3こ'],
 ['CH₄','メタン',[['C',60,45],['H',38,30],['H',82,30],['H',38,62],['H',82,62]],'炭素原子1こ と 水素原子4こ（都市ガスの 主成分）'],
 ['HCl','塩化水素',[['Cl',66,45],['H',43,45]],'水素原子1こ と 塩素原子1こ（水に とかすと 塩酸）']
];
function molSVG(m, hideF){
  const at = m[2]; let bonds = '', balls = '';
  const c0 = at[0]; at.slice(1).forEach(a => { bonds += `<line x1="${c0[1]}" y1="${c0[2]}" x2="${a[1]}" y2="${a[2]}" stroke="#8A7560" stroke-width="4"/>`; });
  if(at.length===3 && m[0]==='CO₂') bonds = `<line x1="30" y1="45" x2="90" y2="45" stroke="#8A7560" stroke-width="4"/>`;
  at.forEach(([s,x,y]) => { const [c,r] = ATOM[s]; balls += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#4A3A2A" stroke-width="1.6"/><text x="${x}" y="${y+4}" font-size="${r>10?11:9}" font-weight="900" text-anchor="middle" fill="${s==='C' ? '#fff' : '#2C2C2C'}">${s}</text>`; });
  const xs = at.map(a => a[1]), ys = at.map(a => a[2]), x0 = Math.min(...xs) - 18, x1 = Math.max(...xs) + 18, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18 + (hideF ? 0 : 14), cx = (x0+x1)/2;
  const w = Math.max(x1 - x0, 60), vx = cx - w/2;
  return `<svg class="fig56 mol66" viewBox="${vx} ${y0} ${w} ${y1-y0}" width="${Math.round(w*1.9)}"><rect x="${vx}" y="${y0}" width="${w}" height="${y1-y0}" rx="8" fill="#FFFDF6" stroke="#E6D3B3"/>${bonds}${balls}<text x="${cx}" y="${y1-5}" font-size="11" font-weight="900" text-anchor="middle" fill="#6B5540">${hideF ? '' : m[0]}</text></svg>`;
}
const elOpt = (ans, key, pool) => pick4(ans, (pool||BASIC).map(e => e[key]));
function el1Gen(){
  const e = choice(BASIC);
  if(Math.random() < .5) return {type:'choice', q:`元素記号 <b>${e[0]}</b> は どの 元素？`, ans:e[1], opts:elOpt(e[1], 1), disp:tileSVG(e, 'name'), hint:'記号の 1文字めは 大文字、2文字めは 小文字', sub:'el|'+e[0]};
  return {type:'choice', q:`<b>${e[1]}</b> の 元素記号は？`, ans:e[0], opts:elOpt(e[0], 0, BASIC.filter(z => z[0][0]===e[0][0] || Math.random() < .5)), disp:tileSVG(e, 'sym'), hint:'大文字・小文字の ちがいにも 注意', sub:'el|'+e[0]};
}
function el2Gen(){
  const k = rint(0, 5), L20 = EL.filter(e => e[2] <= 20);
  if(k===0){ const e = choice(L20); return {type:'choice', q:'周期表の ★の 位置に ある 元素は？', ans:e[1], opts:elOpt(e[1], 1, L20), disp:ptSVG(e[0], null, true), hint:'たての 列（族）は 性質が にている', sub:'el|'+e[0]}; }
  if(k===1){ const e = choice(L20); return {type:'choice', q:`原子番号 <b>${e[2]}</b> の 元素は？`, ans:e[1], opts:elOpt(e[1], 1, L20.filter(z => Math.abs(z[2]-e[2]) <= 4)), disp:'', hint:'原子番号は 原子核の 中の 陽子の 数', sub:'el|'+e[0]}; }
  if(k===2){ const m = choice(BASIC.filter(e => e[5])), nm = shuffle(BASIC.filter(e => !e[5])).slice(0,3); return {type:'choice', q:'次の うち <b>金属</b> の 元素は？', ans:m[1], opts:shuffle([m[1]].concat(nm.map(e => e[1]))), disp:'', hint:'金属：電気を 通す・みがくと 光る・たたくと のびる', sub:'el|'+m[0]}; }
  if(k===3){ const gs = choice([['気体', 'ふつうの 温度（20℃くらい）で <b>気体</b> の 元素は？'], ['液体', 'ふつうの 温度で <b>液体</b> の 金属は？']]);
    const a = choice(BASIC.filter(e => e[6]===gs[0] && (gs[0]!=='液体' || e[5]))), w = shuffle(BASIC.filter(e => e[6]==='固体')).slice(0,3);
    return {type:'choice', q:gs[1], ans:a[1], opts:shuffle([a[1]].concat(w.map(e => e[1]))), disp:'', hint:'', sub:'el|'+a[0]}; }
  if(k===4){ const grp = choice([[1,'ナトリウム'],[2,'カルシウム'],[17,'塩素'],[18,'ネオン']]), base = EN(grp[1]), same = EL.filter(e => e[4]===grp[0] && e!==base && e[2]<=56), a = choice(same), w = shuffle(L20.filter(e => e[4]!==grp[0])).slice(0,3);
    return {type:'choice', q:`周期表で <b>${grp[1]}</b> と 同じ たての 列（族）に ある 元素は？`, ans:a[1], opts:shuffle([a[1]].concat(w.map(e => e[1]))), disp:'', hint:'同じ 族の 元素は 性質が にている', sub:'el|'+a[0]+'|'+base[0]}; }
  const Q = choice([['周期表で、たての 列を 何という？','族','周期/原子番号/分子'],['周期表で、よこの 行を 何という？','周期','族/原子番号/質量'],['周期表は 元素を 何の 順に ならべた もの？','原子番号','元素の 名前の あいうえお/発見された 年/重さの 大きい 順'],['周期表を はじめて つくった 科学者は？','メンデレーエフ','メンデル/ニュートン/エジソン'],['18族の 元素（ヘリウム・ネオンなど）の 性質は？','ほかの 物質と ほとんど 反応しない','水と はげしく 反応する/すべて 金属/じしゃくに つく']]);
  return {type:'choice', q:Q[0], ans:Q[1], opts:shuffle([Q[1]].concat(Q[2].split('/'))), disp:ptSVG(null,null,false), hint:'', sub:'pt|'+Q[0]};
}
function el3Gen(){
  if(Math.random() < .45){ const m = choice(MOL), byF = Math.random() < .5;
    if(byF) return {type:'choice', q:'この モデルで 表される 物質は？', ans:m[1], opts:pick4(m[1], MOL.map(z => z[1])), disp:`${molSVG(m, true)}<div class="atomLg66">${Object.entries(ATOM).map(([s,[c]]) => `<span><i style="background:${c}"></i>${s}：${ES(s)[1]}</span>`).join('')}</div>`, hint:'ボールの 色と 数を 数えよう', sub:'mol|'+m[0]};
    return {type:'choice', q:`<b>${m[1]}</b> の 化学式は？`, ans:m[0], opts:pick4(m[0], MOL.map(z => z[0])), disp:'', hint:'原子の 数は 右下の 小さい 数字', sub:'mol|'+m[0]}; }
  const e = choice(EL.filter(z => z[7]));
  return {type:'choice', q:`「${e[7]}」<br>この 元素は どれ？`, ans:e[1], opts:elOpt(e[1], 1, EL), disp:'', hint:'', sub:'el|'+e[0]};
}
const ELN = n => EN(n) || ES(n);
function elExp(p, v){
  const s = String(p.sub||'').split('|'), out = {figs:[], steps:[], tip:'', why:''};
  if(s[0]==='el'){ const e = ES(s[1]); if(!e) return null; const ve = v ? ELN(v) : null;
    out.figs.push(`<div class="tiles66">${tileSVG(e)}${ve && ve!==e ? tileSVG(ve).replace('class="fig56 tile66"','class="fig56 tile66 ng66"') : ''}</div>`, ptSVG(e[0], ve && ve!==e ? ve[0] : null));
    out.steps.push(`<b class="okc">${X(e[1])}（${e[0]}）</b>：原子番号 ${e[2]}・第${e[3]}周期・${e[4]}族・${e[5] ? '金属' : '非金属'}・ふつうの 温度で ${e[6]}`, X(e[7]));
    if(s[2]){ const b = ES(s[2]); out.steps.push(`${X(b[1])}（${b[0]}）も ${b[4]}族。同じ 族は 性質が にているよ`); }
    if(ve && ve!==e) out.why = `きみが えらんだ「${X(ve[1])}（${ve[0]}）」は：${X(ve[7])}`;
    out.tip = '元素記号は 1文字めが 大文字、2文字めが 小文字（例：Na・Cl・Cu）。'; return out; }
  if(s[0]==='mol'){ const m = MOL.find(z => z[0]===s[1]); if(!m) return null; const vm = MOL.find(z => z[1]===v || z[0]===v);
    out.figs.push(`<div class="tiles66">${molSVG(m)}${vm && vm!==m ? molSVG(vm).replace('class="fig56 mol66"','class="fig56 mol66 ng66"') : ''}</div>`);
    out.steps.push(`<b class="okc">${X(m[1])}</b> の 化学式は <b>${m[0]}</b>`, X(m[3]), '化学式の 右下の 小さい 数字は 原子の 数（1は 書かない）');
    if(vm && vm!==m) out.why = `「${X(vm[1])}（${vm[0]}）」は：${X(vm[3])}`; return out; }
  if(s[0]==='pt'){ out.figs.push(ptSVG(null,null,false)); out.steps.push(`<b>${X(strip(p.q))}</b> → <b class="okc">${X(p.ans)}</b>`, '周期表は 原子番号の 順に ならび、たての 列を「族」、よこの 行を「周期」という', '同じ 族の 元素は 性質が にている（1族：水と はげしく 反応、17族：ハロゲン、18族：貴ガス）'); return out; }
  return null;
}
const SCIU = {
  r_el1:{n:'元素記号', gen:el1Gen},
  r_el2:{n:'周期表と 元素の なかま', gen:el2Gen},
  r_el3:{n:'元素の 使われかた・分子の モデル', gen:el3Gen}
};
Object.entries(SCIU).forEach(([k, u]) => { const U = {n:u.n, lv:3, cat:'⚛️ 元素', art:'ic_elements', gen:u.gen, exp:elExp, g:'sci'}; RI[k] = U; MATH_UNITS[k] = U; SCI_LV[k] = 3; });
window.__el66 = {EL, MOL, ptSVG, tileSVG, molSVG};

/* ---------- かいせつの つなぎこみ ---------- */
window.__unitExp66 = (p, v) => { const U = p && MATH_UNITS[p.u]; if(!U || !U.exp) return null; try{ return U.exp(p, v); }catch(e){ console.warn(e); return null; } };

/* =====================================================================
   3) みなとは 水べだけ
   ===================================================================== */
const WATER = new Set(['sea','river','road_bridge','harbor']);
window.addEventListener('click', e => {
  if(!townEdit || !hand || hand.id!=='harbor') return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const t = save.town, x = +c.dataset.x, y = +c.dataset.y;
  if(t.cells[`${x},${y}`]) return;
  const ok = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => WATER.has(t.cells[`${x+dx},${y+dy}`]));
  if(!ok){ e.stopImmediatePropagation(); e.preventDefault(); sound('ng'); toast('⚓ みなとは 海や 川の となりに しか おけないよ'); }
}, true);
itemEffect = (orig => function(it){ const s = orig.apply(this, arguments); return it && it.id==='harbor' ? s.replace('（川や 海と つながる）', '（海や 川の となりに おく）') : s; })(itemEffect);

/* =====================================================================
   4) 超レア：ユニコーン・とくべつな 能力
   ===================================================================== */
if(!SPECIES.some(s => s.id==='unicorn')) SPECIES.push({id:'unicorn', name:'ユニコーン', art:'res_unicorn', emoji:'🦄', rar:4, w:0.5, bias:'pop', home:'house'});
try{ const V = window.__v53; if(V && V.SPL) V.SPL.unicorn = 'にじいろの たてがみ、きれいでしょ？|この つのには ふしぎな ちからが あるんだって|ほしの かがやく よるが いちばん すき|みんなが なかよく なれるように、まほうを かけておくね|ゆめの なかでも あえたら いいな'; }catch(e){}
try{ ZUKAN_INFO.unicorn = '伝説の どうぶつ。にじいろの たてがみと 金の つのを もつ。'; }catch(e){}
const isUR = r => r && !SP(r.sp).human && (SP(r.sp).rar||1) >= 4;
function urAb(sp){
  const ab = {};
  ABILITIES.forEach(a => { ab[a.id] = sp.bias==='all' ? rint(28, 34) : sp.bias===a.id ? rint(38, 44) : rint(20, 27); });
  if(sp.bias==='all'){ const k = choice(ABILITIES).id; ab[k] = rint(36, 40); }
  return ab;
}
newResident = (orig => function(sp){ const r = orig.apply(this, arguments); if(sp && (sp.rar||1) >= 4 && !sp.human){ r.ab = urAb(sp); r.ur66 = 1; } return r; })(newResident);
function upgradeUR(){
  const t = save.town; if(!t) return; let n = 0;
  t.res.forEach(r => { if(!isUR(r) || r.ur66) return; const A = urAb(SP(r.sp)); ABILITIES.forEach(a => { r.ab[a.id] = Math.max(A[a.id], (r.ab[a.id]||0) + 18); }); r.ur66 = 1; n++; });
  if(n){ persist(); setTimeout(() => toast(`🌈 超レア住民 ${n}人の 能力が とくべつに パワーアップ！`), 1200); }
}
abBars = function(r){
  const mx = isUR(r) ? 48 : 15;
  return ABILITIES.map(a => { const v = effAb(r, a.id); return `<div class="abRow ${isUR(r) ? 'ur66' : ''}"><span>${a.i} ${a.n}</span><div class="abBar"><i style="width:${clamp(v/mx*100, 4, 100)}%"></i></div><b>${Math.round(v*10)/10}</b></div>`; }).join('');
};
try{ upgradeUR(); }catch(e){}
show = (orig => function(name){ const o = orig.apply(this, arguments); if(name==='town' || name==='residents') try{ upgradeUR(); }catch(e){} return o; })(show);

renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER66}`; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   まなびタウン v6.7：まちを 2本ゆびで ひろげる・ちぢめる（ピンチ）
   ===================================================================== */
(function(){
'use strict';
const VER67 = '6.7.0', ZMIN = 0.35, ZMAX = 2;
const P = {on:false, d0:0, z0:1, cx:0, cy:0, sx:0, sy:0, scale:1};
const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
const wrap = () => $('#townMapWrap'), world = () => $('#townWorld');
function start(e){
  if(curScreen!=='town' || e.touches.length!==2) return;
  const w = wrap(), wo = world(); if(!w || !wo) return;
  e.preventDefault();
  const r = wo.getBoundingClientRect(), mr = ($('#townMap') || wo).getBoundingClientRect();
  P.on = true; P.d0 = dist(e.touches); P.z0 = save.town.zoom || 1; P.scale = 1;
  P.cx = (e.touches[0].clientX + e.touches[1].clientX)/2; P.cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
  P.ox = (P.cx - mr.left) / mr.width; P.oy = (P.cy - mr.top) / mr.height;        // ゆびの まんなかが まちの どこか（わりあい・v6.30：まちの マス目で はかる）
  wo.style.transformOrigin = `${(P.cx - r.left)}px ${(P.cy - r.top)}px`;
  wo.style.willChange = 'transform';
}
function move(e){
  if(!P.on || e.touches.length!==2) return;
  e.preventDefault();
  const z = Math.max(ZMIN, Math.min(ZMAX, P.z0 * dist(e.touches) / P.d0));
  P.scale = z / P.z0; world().style.transform = `scale(${P.scale})`;
}
function end(e){
  if(!P.on || (e.touches && e.touches.length >= 2)) return;
  P.on = false; const wo = world(), z = Math.round(Math.max(ZMIN, Math.min(ZMAX, P.z0 * P.scale)) * 100) / 100;
  wo.style.transform = ''; wo.style.transformOrigin = ''; wo.style.willChange = '';
  if(Math.abs(z - P.z0) < 0.02) return;
  const sy = window.scrollY;
  save.town.zoom = z; persist(); renderMap();
  /* ゆびの まんなかに あった ところが おなじ ばしょに くるように スクロール（v6.30：がめん全体は うごかさない） */
  keepAt(P.ox, P.oy, P.cx, P.cy, sy);
  toast(`🔍 ${Math.round(z*100)}%`);
}
document.addEventListener('touchstart', e => { if(e.target.closest && e.target.closest('#townMapWrap')) start(e); }, {passive:false});
document.addEventListener('touchmove', e => { if(P.on) move(e); }, {passive:false});
document.addEventListener('touchend', end, {passive:true});
document.addEventListener('touchcancel', end, {passive:true});
['gesturestart','gesturechange'].forEach(n => document.addEventListener(n, e => { if(curScreen==='town') e.preventDefault(); }, {passive:false}));
/* ＋－ボタンも おなじ はんいに */
/* v6.30：ズームしても 見ている ばしょが ずれない */
function keepAt(ox, oy, cx, cy, sy){
  const fix = () => { const w = wrap(), m = $('#townMap'); if(!w || !m) return; const r = m.getBoundingClientRect();
    w.scrollLeft += (r.left + ox * r.width) - cx; w.scrollTop += (r.top + oy * r.height) - cy;
    if(Math.abs(window.scrollY - sy) > 1) window.scrollTo(window.scrollX, sy); };
  fix(); requestAnimationFrame(fix);
}
setZoom = function(z){
  const nz = Math.max(ZMIN, Math.min(ZMAX, Math.round(z*100)/100)), w = wrap(), m = $('#townMap'), sy = window.scrollY;
  let a = null;
  if(w && m){ const wr = w.getBoundingClientRect(), mr = m.getBoundingClientRect(); const cx = wr.left + w.clientWidth/2, cy = wr.top + w.clientHeight/2;
    a = [(cx - mr.left)/mr.width, (cy - mr.top)/mr.height, cx, cy]; }
  save.town.zoom = nz; persist(); renderMap();
  if(a) keepAt(a[0], a[1], a[2], a[3], sy);
};
try{ const sm = $('.zoomBar small'); if(sm) sm.textContent = '2本ゆびで ひろげたり ちぢめたり できるよ'; }catch(e){}
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER67}`; }catch(e){} return o; })(renderSettings);
window.__v67 = {P};
})();

/* =====================================================================
   まなびタウン v6.8：高層ビルを 2×1マスに・港を 海に なじませる
   ===================================================================== */
(function(){
'use strict';
const VER68 = '6.8.0', BIG = {office:[2,1]};
Object.entries(BIG).forEach(([id, s]) => { const it = ITEM(id); if(it) it.sz = s; try{ window.__big64.SZ[id] = s; }catch(e){} });
function migrate(){
  const t = save.town; if(!t || t.big68) return;
  const moved = [];
  Object.keys(t.cells).forEach(k => { const id = t.cells[k]; if(!BIG[id]) return;
    t.inv[id] = (t.inv[id]||0) + 1;
    const g = (t.glv||{})[k]; if(g){ t.glvKeep = t.glvKeep || {}; (t.glvKeep[id] = t.glvKeep[id] || []).push(g); delete t.glv[k]; }
    delete t.cells[k]; moved.push(id); });
  t.big68 = 1; if(moved.length) t.big68msg = moved; persist();
}
async function notice(){
  const t = save.town; if(!t || !t.big68msg || $('#dlg').classList.contains('show')) return;
  delete t.big68msg; persist(); const it = ITEM('office');
  await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">🏢 高層ビルが 大きく なったよ！</h2>
    <p class="dlgP">高層ビルが <b>2×1マス</b>の 大きな たてものに なったよ。<br>おいてあった 高層ビルは いちど <b>トレイ（もようがえ）</b>に しまったので、2マス あいている ところに おきなおしてね。</p>
    <p class="dlgP facNote">★グレードは そのまま のこっているよ。<br>100かいタワーは 高層ビルを おきなおすと また あそべるよ。</p>`, [{label:'わかった！', cls:'gold', v:1}], 'wide');
}
renderMap = (orig => function(){ try{ migrate(); }catch(e){} return orig.apply(this, arguments); })(renderMap);
try{ migrate(); }catch(e){}
setInterval(() => { if(curScreen==='town' && save.town && save.town.big68msg && !document.hidden) notice(); }, 3000);
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER68}`; }catch(e){} return o; })(renderSettings);
})();

/* v6.9：ユニコーン（超レア）の 専用イラスト 5まい */
(function(){
'use strict';
['onsen','library','pond','tree','festival'].forEach(k => { DEFAULT_ART['scu_unicorn_'+k] = './assets/images/v69/scu_unicorn_'+k+'.webp'; });
renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = 'まなびタウン v6.11.0'; }catch(e){} return o; })(renderSettings);
})();

/* =====================================================================
   まなびタウン v6.11：元素 118こ（オガネソンまで）・なかまごとの 色分け
   ※ index.html で features.js の あとに 読みこむ
   ===================================================================== */
(function(){
'use strict';
const VER = '6.11.0';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip = h => String(h||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const pick4 = (ans, pool) => { const a = String(ans), s = new Set([a]); shuffle(pool.map(String).filter(x => x!==a)).forEach(x => { if(s.size < 4) s.add(x); }); return shuffle([...s]); };

/* ---------- 118この 元素 ---------- */
const RAW = 'H水素 Heヘリウム Liリチウム Beベリリウム Bホウ素 C炭素 N窒素 O酸素 Fフッ素 Neネオン Naナトリウム Mgマグネシウム Alアルミニウム Siケイ素 Pリン S硫黄 Cl塩素 Arアルゴン Kカリウム Caカルシウム '
 + 'Scスカンジウム Tiチタン Vバナジウム Crクロム Mnマンガン Fe鉄 Coコバルト Niニッケル Cu銅 Zn亜鉛 Gaガリウム Geゲルマニウム Asヒ素 Seセレン Br臭素 Krクリプトン Rbルビジウム Srストロンチウム Yイットリウム Zrジルコニウム '
 + 'Nbニオブ Moモリブデン Tcテクネチウム Ruルテニウム Rhロジウム Pdパラジウム Ag銀 Cdカドミウム Inインジウム SnスズSbアンチモン Teテルル Iヨウ素 Xeキセノン Csセシウム Baバリウム Laランタン Ceセリウム Prプラセオジム Ndネオジム '
 + 'Pmプロメチウム Smサマリウム Euユウロピウム Gdガドリニウム Tbテルビウム Dyジスプロシウム Hoホルミウム Erエルビウム Tmツリウム Ybイッテルビウム Luルテチウム Hfハフニウム Taタンタル Wタングステン Reレニウム Osオスミウム Irイリジウム Pt白金 Au金 Hg水銀 '
 + 'Tlタリウム Pb鉛 Biビスマス Poポロニウム Atアスタチン Rnラドン Frフランシウム Raラジウム Acアクチニウム Thトリウム Paプロトアクチニウム Uウラン Npネプツニウム Puプルトニウム Amアメリシウム Cmキュリウム Bkバークリウム Cfカリホルニウム Esアインスタイニウム Fmフェルミウム '
 + 'Mdメンデレビウム Noノーベリウム Lrローレンシウム Rfラザホージウム Dbドブニウム Sgシーボーギウム Bhボーリウム Hsハッシウム Mtマイトネリウム Dsダームスタチウム Rgレントゲニウム Cnコペルニシウム Nhニホニウム Flフレロビウム Mcモスコビウム Lvリバモリウム Tsテネシン Ogオガネソン';
const ALL = RAW.replace('スズSb','スズ Sb').split(' ').map((t, i) => { const m = t.match(/^([A-Z][a-z]?)(.+)$/); return {s:m[1], n:m[2], z:i+1}; });

/* しゅうき・ぞく（ランタノイド・アクチノイドは 下の 2れつ） */
function place(z){
  if(z<=2) return [1, z===1 ? 1 : 18];
  if(z<=10) return [2, z<=4 ? z-2 : z+8];
  if(z<=18) return [3, z<=12 ? z-10 : z];
  if(z<=36) return [4, z-18];
  if(z<=54) return [5, z-36];
  if(z<=86) return z<=56 ? [6, z-54] : z<=71 ? [6, null] : [6, z-68];
  return z<=88 ? [7, z-86] : z<=103 ? [7, null] : [7, z-100];
}
/* なかま */
const CAT = {
  h:{n:'水素', c:'#D3D6DB'}, alk:{n:'アルカリ金属', c:'#D6B08A'}, noble:{n:'希ガス', c:'#8ED9CF'}, non:{n:'非金属', c:'#A6DE8E'},
  semi:{n:'半金属', c:'#D7EB7A'}, base:{n:'卑金属', c:'#A9DCF5'}, tr:{n:'遷移金属', c:'#FFE27A'}, lan:{n:'ランタノイド', c:'#FFBF80'}, act:{n:'アクチノイド', c:'#CDB4F2'}
};
const SEMI = new Set(['B','Si','Ge','As','Sb','Te','At','Ts']), NON = new Set(['C','N','O','F','P','S','Cl','Se','Br','I']);
const NOBLE = new Set(['He','Ne','Ar','Kr','Xe','Rn','Og']), ALK = new Set(['Li','Na','K','Rb','Cs','Fr']);
function catOf(e){
  if(e.s==='H') return 'h'; if(ALK.has(e.s)) return 'alk'; if(NOBLE.has(e.s)) return 'noble'; if(NON.has(e.s)) return 'non'; if(SEMI.has(e.s)) return 'semi';
  if(e.z>=57 && e.z<=71) return 'lan'; if(e.z>=89 && e.z<=103) return 'act';
  if(e.g>=3 && e.g<=12) return 'tr';
  return 'base';   // アルカリ土類金属・アルミニウム・スズ・鉛など
}
const GAS = new Set(['H','He','N','O','F','Ne','Cl','Ar','Kr','Xe','Rn']), LIQ = new Set(['Br','Hg']);
const OLD = {}; try{ (window.__el66 && window.__el66.EL || []).forEach(r => { OLD[r[0]] = r[7]; }); }catch(e){}
const NOTE = Object.assign({}, OLD, {
  Ti:'軽くて じょうぶ。めがねの フレームや 飛行機に 使う', Cr:'さびを ふせぐ めっき（クロムめっき）に 使う', Co:'青い 色の ガラスや 電池に 使う',
  Kr:'ヘッドライトなどの 電球に 使う 希ガス', Sr:'花火の 赤い 色を 出す', W:'電球の フィラメントに 使われた とけにくい 金属',
  U:'原子力発電の 燃料', Pu:'原子力に 関係する 人工の 元素', Nh:'日本の 研究チームが 見つけ、日本の 名前が ついた 元素（ニホニウム）',
  Og:'いまの 周期表で いちばん 最後の 118番の 元素', Ne:'ネオンサインで 赤く 光る', Rn:'放射線を 出す 希ガス。ラドン温泉で 知られる',
  Li:'スマホの 電池（リチウムイオン電池）に 使う', Ga:'手の 温度でも とける 金属', Nd:'とても 強い じしゃく（ネオジム磁石）に 使う',
  Eu:'お札の 光る インクに 使われる', Cs:'正確な 時計（原子時計）に 使う', Am:'けむり感知器に 使われることが ある', Ge:'半導体に 使われた 半金属', As:'毒が あることで 知られる 半金属'
});
ALL.forEach(e => { const [p, g] = place(e.z); e.p = p; e.g = g; e.cat = catOf(e); e.st = GAS.has(e.s) ? '気体' : LIQ.has(e.s) ? '液体' : '固体'; e.note = NOTE[e.s] || ''; });
const BYS = s => ALL.find(e => e.s===s), BYN = n => ALL.find(e => e.n===n);
const COMMON = ALL.filter(e => e.z<=36 || ['Ag','Sn','I','Xe','Ba','Pt','Au','Hg','Pb','U','Rn','Cs','Nh','Og','W','Sr'].includes(e.s));
const posTxt = e => e.g ? `第${e.p}周期・${e.g}族` : `第${e.p}周期（${CAT[e.cat].n}）`;

/* ---------- 絵 ---------- */
function tileSVG(e, hide, ng){
  const C = CAT[e.cat];
  return `<svg class="fig56 tile66 ${ng ? 'ng66' : ''}" viewBox="0 0 120 134" width="120"><rect x="4" y="4" width="112" height="126" rx="12" fill="${C.c}" stroke="${ng ? '#4C97FF' : hide ? '#8A7560' : '#E8414B'}" stroke-width="${hide ? 2.5 : 4}"/>
    <text x="14" y="26" font-size="16" font-weight="900" fill="#4A3A2A">${e.z}</text>
    <text x="60" y="78" font-size="${e.s.length>1 ? 40 : 46}" font-weight="900" text-anchor="middle" fill="${hide==='sym' ? '#E8414B' : '#2C2C2C'}">${hide==='sym' ? '？' : e.s}</text>
    <text x="60" y="104" font-size="${e.n.length>7 ? 11 : e.n.length>5 ? 13 : 15}" font-weight="900" text-anchor="middle" fill="${hide==='name' ? '#E8414B' : '#4A3A2A'}">${hide==='name' ? '？？？' : e.n}</text>
    <rect x="16" y="111" width="88" height="14" rx="7" fill="rgba(255,255,255,.75)"/><text x="60" y="122" font-size="9.5" font-weight="900" text-anchor="middle" fill="#4A3A2A">${C.n}</text></svg>`;
}
function ptSVG(ok, ng, star){
  const cs = 17, W = 18*cs + 8, fy = 7*cs + 14, H = fy + 2*cs + 34; let g = '';
  const cell = (e, x, y) => { const isOk = ok && e.s===ok, isNg = ng && e.s===ng;
    return `<rect x="${x}" y="${y}" width="${cs-1.5}" height="${cs-1.5}" rx="2" fill="${CAT[e.cat].c}" stroke="${isOk ? '#E8414B' : isNg ? '#1C6AAE' : 'rgba(0,0,0,.12)'}" stroke-width="${isOk||isNg ? 2.2 : .6}"/>`
      + `<text x="${x + cs/2 - .8}" y="${y + cs*.68}" font-size="${e.s.length>1 ? 7 : 8.5}" font-weight="900" text-anchor="middle" fill="#2C2C2C">${star && isOk ? '★' : e.s}</text>`; };
  ALL.forEach(e => {
    if(e.g){ g += cell(e, 4 + (e.g-1)*cs, 4 + (e.p-1)*cs); return; }
    const row = e.p===6 ? 0 : 1, i = e.z - (e.p===6 ? 57 : 89); g += cell(e, 4 + (i+2)*cs, fy + row*cs);
  });
  [[6,'lan'],[7,'act']].forEach(([p,k]) => { g += `<rect x="${4+2*cs}" y="${4+(p-1)*cs}" width="${cs-1.5}" height="${cs-1.5}" rx="2" fill="${CAT[k].c}" opacity=".6"/><text x="${4+2.5*cs-.8}" y="${4+(p-1)*cs+cs*.7}" font-size="8" text-anchor="middle" fill="#6B5540">${p===6?'*':'**'}</text>`; });
  g += `<text x="${4+1.5*cs}" y="${fy+cs*.7}" font-size="8" text-anchor="middle" fill="#6B5540">*</text><text x="${4+1.5*cs}" y="${fy+cs*1.7}" font-size="8" text-anchor="middle" fill="#6B5540">**</text>`;
  let lx = 4, ly = H - 18;
  Object.values(CAT).forEach((c, i) => { if(i===5){ lx = 4; ly += 11; } const w = c.n.length*8 + 16; g += `<rect x="${lx}" y="${ly-7}" width="8" height="8" rx="1.5" fill="${c.c}" stroke="rgba(0,0,0,.2)" stroke-width=".5"/><text x="${lx+10}" y="${ly}" font-size="7.5" fill="#4A3A2A">${c.n}</text>`; lx += w; });
  return `<svg class="fig56 pt66" viewBox="0 0 ${W} ${H}" width="${Math.min(340, W*1.1)}">${g}</svg>`;
}
const legendHTML = cats => `<div class="catLg611">${cats.map(k => `<span><i style="background:${CAT[k].c}"></i>${CAT[k].n}</span>`).join('')}</div>`;

/* ---------- 問題 ---------- */
const pickEl = () => Math.random() < .55 ? choice(ALL) : choice(COMMON);
function symOpts(e){ const same = ALL.filter(z => z!==e && (z.s[0]===e.s[0] || z.n[0]===e.n[0])); return pick4(e.s, same.length >= 3 ? same.map(z => z.s) : ALL.filter(z => Math.abs(z.z-e.z) <= 6).map(z => z.s)); }
function nameOpts(e){ const near = ALL.filter(z => z!==e && (z.cat===e.cat || Math.abs(z.z-e.z) <= 4)); return pick4(e.n, near.map(z => z.n)); }
function el1Gen(){
  const e = pickEl(), k = rint(0, 4);
  if(k<=1) return {type:'choice', q:`元素記号 <b>${e.s}</b> は どの 元素？`, ans:e.n, opts:nameOpts(e), disp:tileSVG(e, 'name'), hint:'色で なかまが わかるよ', sub:'e|'+e.s};
  if(k<=3) return {type:'choice', q:`<b>${e.n}</b> の 元素記号は？`, ans:e.s, opts:symOpts(e), disp:tileSVG(e, 'sym'), hint:'1文字めは 大文字、2文字めは 小文字', sub:'e|'+e.s};
  return {type:'choice', q:`原子番号 <b>${e.z}</b> の 元素記号は？`, ans:e.s, opts:pick4(e.s, ALL.filter(z => z!==e && Math.abs(z.z-e.z) <= 5).map(z => z.s)), disp:tileSVG(e, 'sym'), hint:'原子番号は 陽子の 数', sub:'e|'+e.s};
}
function el2Gen(){
  const k = rint(0, 6);
  if(k===0){ const e = Math.random() < .6 ? choice(ALL.filter(z => z.z<=36)) : choice(ALL); return {type:'choice', q:'周期表の ★の 位置に ある 元素は？', ans:e.n, opts:nameOpts(e), disp:ptSVG(e.s, null, true), hint:'たての 列（族）は 性質が にている', sub:'e|'+e.s}; }
  if(k===1){ const e = choice(ALL.filter(z => z.z<=54)); return {type:'choice', q:`原子番号 <b>${e.z}</b> の 元素は？`, ans:e.n, opts:pick4(e.n, ALL.filter(z => z!==e && Math.abs(z.z-e.z) <= 4).map(z => z.n)), disp:'', hint:'原子番号は 陽子の 数', sub:'e|'+e.s}; }
  if(k===2){ const e = pickEl(), ans = CAT[e.cat].n; return {type:'choice', q:`<b>${e.n}（${e.s}）</b> は どの なかま？`, ans, opts:pick4(ans, Object.values(CAT).map(c => c.n)), disp:legendHTML(Object.keys(CAT)), hint:'周期表の どこに あるか 考えよう', sub:'e|'+e.s}; }
  if(k===3){ const c = choice(['alk','noble','non','semi','tr','lan','act','base']), a = choice(ALL.filter(e => e.cat===c)), w = shuffle(ALL.filter(e => e.cat!==c)).slice(0,3);
    return {type:'choice', q:`次の うち <b>${CAT[c].n}</b> の なかまは？`, ans:a.n, opts:shuffle([a.n].concat(w.map(e => e.n))), disp:legendHTML([c]), hint:'', sub:'e|'+a.s}; }
  if(k===4){ const gs = choice([['気体','ふつうの 温度（20℃くらい）で <b>気体</b> の 元素は？'],['液体','ふつうの 温度で <b>液体</b> の 元素は？']]), a = choice(ALL.filter(e => e.st===gs[0])), w = shuffle(ALL.filter(e => e.st==='固体' && e.z<=56)).slice(0,3);
    return {type:'choice', q:gs[1], ans:a.n, opts:shuffle([a.n].concat(w.map(e => e.n))), disp:'', hint:'', sub:'e|'+a.s}; }
  if(k===5){ const base = choice(ALL.filter(e => e.g && [1,2,17,18,11,14].includes(e.g) && e.z<=54)), same = ALL.filter(e => e.g===base.g && e!==base), a = choice(same), w = shuffle(ALL.filter(e => e.g && e.g!==base.g && e.z<=54)).slice(0,3);
    return {type:'choice', q:`周期表で <b>${base.n}</b> と 同じ たての 列（族）に ある 元素は？`, ans:a.n, opts:shuffle([a.n].concat(w.map(e => e.n))), disp:'', hint:'同じ 族の 元素は 性質が にている', sub:'e|'+a.s+'|'+base.s}; }
  const Q = choice([['周期表で、たての 列を 何という？','族','周期/原子番号/分子'],['周期表で、よこの 行を 何という？','周期','族/原子番号/質量'],['周期表は 元素を 何の 順に ならべた もの？','原子番号','名前の あいうえお/発見された 年/重さの 大きい 順'],['周期表を はじめて つくった 科学者は？','メンデレーエフ','メンデル/ニュートン/エジソン'],['希ガス（ヘリウム・ネオンなど）の 性質は？','ほかの 物質と ほとんど 反応しない','水と はげしく 反応する/すべて 液体/じしゃくに つく'],['アルカリ金属（ナトリウムなど）の 性質は？','水と はげしく 反応する','ほとんど 反応しない/すべて 気体/電気を 通さない'],['周期表の 下に 2列 ならんでいる なかまは？','ランタノイドと アクチノイド','希ガスと 非金属/アルカリ金属と 水素/半金属と 卑金属'],['日本の 研究チームが 見つけ、名前を つけた 113番の 元素は？','ニホニウム','オガネソン/テネシン/モスコビウム']]);
  return {type:'choice', q:Q[0], ans:Q[1], opts:shuffle([Q[1]].concat(Q[2].split('/'))), disp:ptSVG(null,null,false), hint:'', sub:'pt|'};
}
function elExp(p, v){
  const s = String(p.sub||'').split('|'), out = {figs:[], steps:[], tip:'', why:''};
  if(s[0]==='e'){ const e = BYS(s[1]); if(!e) return null; const ve = v ? (BYN(v) || BYS(v)) : null;
    out.figs.push(`<div class="tiles66">${tileSVG(e)}${ve && ve!==e ? tileSVG(ve, null, true) : ''}</div>`, ptSVG(e.s, ve && ve!==e ? ve.s : null));
    out.steps.push(`<b class="okc">${X(e.n)}（${e.s}）</b>：原子番号 ${e.z}・${posTxt(e)}・<b>${CAT[e.cat].n}</b>・ふつうの 温度で ${e.st}`);
    if(e.note) out.steps.push(X(e.note));
    if(s[2]){ const b = BYS(s[2]); out.steps.push(`${X(b.n)}（${b.s}）も ${b.g}族。同じ 族は 性質が にているよ`); }
    if(ve && ve!==e) out.why = `きみが えらんだ「${X(ve.n)}（${ve.s}）」は 原子番号 ${ve.z}・${CAT[ve.cat].n}${ve.note ? '：' + X(ve.note) : ''}`;
    else if(v && CAT[Object.keys(CAT).find(k => CAT[k].n===v)]) out.why = `「${X(v)}」では なく、${X(e.n)}は ${CAT[e.cat].n}の なかまだよ`;
    out.tip = '元素記号は 1文字めが 大文字、2文字めが 小文字（例：Na・Cl・Cu）。周期表の 色で なかまを おぼえよう'; return out; }
  if(s[0]==='pt'){ out.figs.push(ptSVG(null,null,false)); out.steps.push(`<b>${X(strip(p.q))}</b> → <b class="okc">${X(p.ans)}</b>`, '周期表は 原子番号の 順に ならび、たての 列を「族」、よこの 行を「周期」という', '1族（水素いがい）＝アルカリ金属、18族＝希ガス、3〜12族＝遷移金属'); return out; }
  return null;
}

/* ---------- とうろく ---------- */
function setUnit(k, gen){ const U = (window.RI && RI[k]) || MATH_UNITS[k]; if(!U) return; const oldExp = U.exp; U.gen = gen;
  U.exp = function(p, v){ const r = elExp(p, v); return r || (oldExp ? oldExp(p, v) : null); }; MATH_UNITS[k] = U; }
setUnit('r_el1', el1Gen); setUnit('r_el2', el2Gen);
try{ const U3 = MATH_UNITS.r_el3, o3 = U3.exp; U3.exp = function(p, v){ const s = String(p.sub||''); if(s.startsWith('el|')){ const q = Object.assign({}, p, {sub:'e|'+s.split('|')[1]}); return elExp(q, v); } return o3 ? o3(p, v) : null; }; }catch(e){}
try{ MATH_UNITS.r_el1.n = '元素記号（118こ）'; }catch(e){}

/* ---------- 見た目 ---------- */
const css = document.createElement('style');
css.textContent = `.catLg611{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:4px auto;max-width:330px}
.catLg611 span{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:800;color:#4A3A2A;background:#fff;border-radius:8px;padding:1px 6px}
.catLg611 i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid rgba(0,0,0,.2)}
.tiles66{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.pt66{max-width:100%;height:auto}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__genso611 = {ALL, CAT, tileSVG, ptSVG, el1Gen, el2Gen, elExp};
})();

/* =====================================================================
   まなびタウン v6.12
   ・お店の 品ぞろえを 総点検（その お店らしい ものだけ）
   ・コンビニの 食べものを イラストに
   ・パーキングに 船・ひこうきが とまらない
   ・たてものの 上の アイコン：じどう／表示／非表示
   ===================================================================== */
(function(){
'use strict';
const VER = '6.12.0', I = './assets/images/v612/';
/* ---------- イラスト ---------- */
['onigiri','tea','pudding','bento','oden','juice','choco'].forEach(k => { DEFAULT_ART['kb_'+k] = I + 'kb_' + k + '.webp'; });
DEFAULT_ART.kb_karaage = './assets/images/v48/cm_roast_chicken.webp';
/* ---------- お店の 品ぞろえ ---------- */
const BREAD = ['melon','anpan','croissant','curry','choco','sand','baguette','donut','cream','cinna','cake','toast'].filter(id => FD(id));
SHOP_FOOD.bakery = BREAD;
SHOP_FOOD.market = (SHOP_FOOD.market || []).filter(id => id!=='f_coffee');
if(SHOP_FOOD.konbini && FD('f_coffee') && !SHOP_FOOD.konbini.includes('f_coffee')) SHOP_FOOD.konbini.push('f_coffee');
const NOT_IN = {market:['cf_milk'], konbini:['cf_chicken','cf_pork','cf_beef']};
catalog = (orig => function(b){ const L = orig.apply(this, arguments); const ng = NOT_IN[b]; return ng ? L.filter(c => !ng.includes(c.id)) : L; })(catalog);
/* ---------- パーキング ---------- */
function cleanLots(){ try{ const P = (save.fac||{}).parking || {}; let ch = false; Object.keys(P).forEach(k => { const it = ITEM(P[k].v); if(it && (it.ship || it.air)){ delete P[k]; ch = true; } }); if(ch) persist(); }catch(e){} }
cleanLots();
/* ---------- アイコンの 表示 ---------- */
const ICON_CS = 44;                                     // これより マスが 小さいと「じどう」で かくす
const mode = () => (save.settings && save.settings.icon612) || 'auto';
const MODES = {auto:['🏷','じどう'], on:['🏷','表示'], off:['🚫','非表示']};
function iconsHidden(){ const m = mode(); if(m==='on') return false; if(m==='off') return true; try{ return cellSize() < ICON_CS; }catch(e){ return false; } }
function applyIcons(){
  const map = $('#townMap'); if(!map) return; map.classList.toggle('noIcon612', iconsHidden());
  const bar = $('.zoomBar'); if(!bar) return; let b = bar.querySelector('.icBtn612');
  if(!b){ bar.insertAdjacentHTML('beforeend', '<button class="roundBtn icBtn612" type="button"></button>'); b = bar.querySelector('.icBtn612'); }
  if(window.__v613 && window.__v613.tidyBar){ b.classList.toggle('hid', iconsHidden()); window.__v613.tidyBar(); return; }   // v6.14：イラストの まま 切りかえ（ちらつかない）
  const [ic, n] = MODES[mode()]; b.innerHTML = `${ic}<small>アイコン<br>${n}</small>`; b.classList.toggle('hid', iconsHidden());
}
document.addEventListener('click', e => { if(!e.target.closest('.icBtn612')) return; e.stopImmediatePropagation(); e.preventDefault();
  save.settings = save.settings || {}; const order = ['auto','on','off'], m = order[(order.indexOf(mode()) + 1) % 3]; save.settings.icon612 = m; persist(); applyIcons(); sound('tap');
  toast(m==='auto' ? '🏷 アイコン：じどう（ちいさく 見る ときは かくす）' : m==='on' ? '🏷 アイコン：いつも 表示' : '🚫 アイコン：いつも 非表示'); }, true);
renderMap = (orig => function(){ const o = orig.apply(this, arguments); try{ applyIcons(); cleanLots(); }catch(e){} return o; })(renderMap);
setTimeout(() => { try{ applyIcons(); }catch(e){} }, 800);
const css = document.createElement('style');
css.textContent = `#townMap.noIcon612 :is(.inHome,.glvBadge,.facOv,.ov61:not(.tentVis61),.ov63,.shopSign,.shopWorker,.reqMark,.facHurt,.wact){display:none!important}
.zoomBar .icBtn612{width:auto!important;min-width:44px;padding:0 8px!important;display:inline-flex;align-items:center;gap:4px;font-size:15px;line-height:1}
.zoomBar .icBtn612 small{font-size:9px;font-weight:800;line-height:1.15;text-align:left;color:#6B5540}
.zoomBar .icBtn612.hid{opacity:.7}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__v612 = {applyIcons, iconsHidden};
})();

/* =====================================================================
   まなびタウン v6.13
   ・河口：いくつの 方向から 海と つながっても しぜんに（seaCanvas）
   ・ズームの まわりを すっきり（アイコンの 切りかえを イラストに）
   ・大きな たてもの：大学・科学館・植物園・コンサートホール（3もん れんぞくで 水晶）
     温泉旅館（ハナと シマくん）・ショッピングモール（いろいろな お店）・ふんすい広場（ねがいの コイン）
   ===================================================================== */
(function(){
'use strict';
const VER = '6.13.2', IMG = './assets/images/v613/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const crystals = () => save.crystal || 0;
const cryImg = () => `<img src="${X(artSrc('itm_crystal'))}" alt="">`;
DEFAULT_ART.kb_karaage = './assets/images/v612/kb_karaage.webp';

/* =====================================================================
   1) ズームの まわり
   ===================================================================== */
const ICON_SVG = st => `<svg viewBox="0 0 48 48" class="ic613" aria-hidden="true">
  <path d="M8 10h32a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H22l-8 7v-7H8a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z" fill="${st==='off' ? '#E9E4DC' : '#FFFDF5'}" stroke="#9B7A55" stroke-width="2.4"/>
  <g transform="translate(24 22)" ${st==='off' ? 'opacity=".45"' : ''}><circle r="7.5" fill="#FFD84A" stroke="#C9961A" stroke-width="1.8"/><rect x="-3.6" y="6.2" width="7.2" height="5" rx="1.4" fill="#B9B2A6" stroke="#8A8278" stroke-width="1.2"/>
  <path d="M-2.5 -1.5l2.5 3l2.5 -3" fill="none" stroke="#C9961A" stroke-width="1.4" stroke-linecap="round"/><path d="M-11 -9l-3 -3M11 -9l3 -3M0 -11v-4" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/></g>
  ${st==='off' ? '<path d="M9 40L40 9" stroke="#E8414B" stroke-width="4.2" stroke-linecap="round"/>' : ''}
  ${st==='auto' ? '<circle cx="39" cy="38" r="8" fill="#5BBF6A" stroke="#fff" stroke-width="2"/><text x="39" y="42.2" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">A</text>' : ''}</svg>`;
const LEAF_SVG = `<svg viewBox="0 0 24 24" class="lf613" aria-hidden="true"><path d="M5 19C4 11 9 5 20 4c0 10-6 16-14 15z" fill="#8FD07A" stroke="#3C8A2E" stroke-width="1.6"/><path d="M6 18c4-5 7-8 11-11" stroke="#3C8A2E" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;
const ST_TXT = {auto:'じどう', on:'表示', off:'非表示'};
function tidyBar(){
  const bar = $('.zoomBar'); if(!bar) return;
  bar.querySelectorAll(':scope > small').forEach(e => e.remove());
  const b = bar.querySelector('.icBtn612');
  if(b){ const m = (save.settings && save.settings.icon612) || 'auto'; const html = `${ICON_SVG(m)}<span>${ST_TXT[m]}</span>`; if(b.dataset.st !== m || !b.querySelector('.ic613')){ b.innerHTML = html; b.dataset.st = m; b.title = 'たてものの 上の アイコン'; } }
  const lt = bar.querySelector('.lite56Tag'); if(lt && !lt.dataset.v613){ lt.dataset.v613 = 1; lt.innerHTML = `${LEAF_SVG}<span>かるい</span>`; }
}
renderMap = (orig => function(){ const o = orig.apply(this, arguments); try{ tidyBar(); }catch(e){} return o; })(renderMap);
document.addEventListener('click', e => { if(e.target.closest('.icBtn612')) setTimeout(tidyBar, 0); }, true);
setInterval(() => { if(curScreen==='town') try{ tidyBar(); }catch(e){} }, 1500);

/* =====================================================================
   2) 3もん れんぞくで 水晶（大学・科学館・植物園・コンサートホール）
   ===================================================================== */
let PICK = null;
document.addEventListener('click', e => { const b = e.target.closest('#dlgBtns button'); if(b) PICK = b.textContent.trim(); }, true);
function numOpts(a){
  const n = Number(a); if(!isFinite(n)) return null;
  const d = String(a).includes('.') ? (String(a).split('.')[1]||'').length : 0, f = v => d ? v.toFixed(d).replace(/\.?0+$/,'') : String(Math.round(v));
  const c = [n+1, n-1, n*2, n/2, n+10, n-10, n*10, n/10, n+5].filter(v => v > 0 && f(v) !== f(n)).map(f);
  const s = new Set([f(n)]); shuffle(c).forEach(v => { if(s.size < 4) s.add(v); }); return s.size===4 ? shuffle([...s]) : null;
}
function fromUnits(units){
  for(let t=0; t<40; t++){
    const u = choice(units); if(!MATH_UNITS[u]) continue;
    let p; try{ p = Object.assign({u}, MATH_UNITS[u].gen()); }catch(e){ continue; }
    let opts = null, ans = String(p.ans);
    if(p.type==='choice' && p.opts && p.opts.length >= 2) opts = p.opts.slice();
    else if(p.type==='num') opts = numOpts(p.ans);
    if(!opts) continue;
    return {html:`<div class="mqSent math">${p.q}</div>${p.disp||''}`, ans, opts, exp:v => { try{ return window.__explain56 ? window.__explain56(p, v, {}) : ''; }catch(e){ return ''; } }};
  }
  return null;
}
/* 音楽の 問題 */
const NOTE = {
  whole:`<ellipse cx="30" cy="40" rx="10" ry="7" fill="none" stroke="#2C2C2C" stroke-width="3.2" transform="rotate(-20 30 40)"/>`,
  half:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="none" stroke="#2C2C2C" stroke-width="3" transform="rotate(-20 26 46)"/><path d="M34 44V10" stroke="#2C2C2C" stroke-width="2.6"/>`,
  dhalf:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="none" stroke="#2C2C2C" stroke-width="3" transform="rotate(-20 26 46)"/><path d="M34 44V10" stroke="#2C2C2C" stroke-width="2.6"/><circle cx="44" cy="46" r="3" fill="#2C2C2C"/>`,
  quarter:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="#2C2C2C" transform="rotate(-20 26 46)"/><path d="M34 44V10" stroke="#2C2C2C" stroke-width="2.6"/>`,
  eighth:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="#2C2C2C" transform="rotate(-20 26 46)"/><path d="M34 44V10" stroke="#2C2C2C" stroke-width="2.6"/><path d="M34 10q12 8 8 22q0-10-8-14" fill="#2C2C2C"/>`,
  dquarter:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="#2C2C2C" transform="rotate(-20 26 46)"/><path d="M34 44V10" stroke="#2C2C2C" stroke-width="2.6"/><circle cx="44" cy="46" r="3" fill="#2C2C2C"/>`
};
const sym = t => `<text x="30" y="44" font-size="30" font-weight="900" font-style="italic" font-family="Georgia,serif" text-anchor="middle" fill="#2C2C2C">${t}</text>`;
const SYMS = {
  p:sym('p'), f:sym('f'), mp:sym('mp'), mf:sym('mf'), pp:sym('pp'), ff:sym('ff'),
  cresc:`<path d="M54 22L8 32L54 42" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-linecap="round"/>`.replace('M54 22L8 32L54 42','M8 22L54 32L8 42').replace('M8 22L54 32L8 42','M54 22L8 32L54 42'),
  decresc:`<path d="M8 22L54 32L8 42" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-linecap="round"/>`,
  sharp:`<g stroke="#2C2C2C" stroke-width="2.6"><path d="M24 12V54M36 8V50"/><path d="M16 28L44 22M16 40L44 34" stroke-width="5"/></g>`,
  flat:`<path d="M24 8V52q16-4 16-14q0-8-8-8q-5 0-8 5" fill="none" stroke="#2C2C2C" stroke-width="3"/>`,
  fermata:`<path d="M10 40q20-30 40 0" fill="none" stroke="#2C2C2C" stroke-width="3.4"/><circle cx="30" cy="36" r="3.4" fill="#2C2C2C"/>`,
  staccato:`<ellipse cx="26" cy="46" rx="9" ry="6.5" fill="#2C2C2C" transform="rotate(-20 26 46)"/><path d="M34 44V14" stroke="#2C2C2C" stroke-width="2.6"/><circle cx="25" cy="30" r="3" fill="#2C2C2C"/>`,
  repeat:`<g fill="#2C2C2C"><rect x="40" y="10" width="3" height="44"/><rect x="47" y="10" width="7" height="44"/><circle cx="32" cy="26" r="3.4"/><circle cx="32" cy="38" r="3.4"/></g>`
};
SYMS.cresc = `<path d="M54 20L8 32L54 44" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-linecap="round"/>`;
SYMS.decresc = `<path d="M8 20L54 32L8 44" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-linecap="round"/>`;
const msvg = k => `<svg viewBox="0 0 62 62" class="mus613"><rect x="1" y="1" width="60" height="60" rx="10" fill="#FFFDF6" stroke="#E6D3B3"/>${NOTE[k] || SYMS[k] || ''}</svg>`;
const MUSIC = [
 ['この 音符（おんぷ）は 何拍？','1拍','2拍/4拍/半拍','4分音符は 1拍。黒い たまに ぼうが 1本。','quarter'],
 ['この 音符は 何拍？','2拍','1拍/4拍/3拍','2分音符は 2拍。白い たまに ぼう。','half'],
 ['この 音符は 何拍？','4拍','2拍/1拍/3拍','全音符は 4拍。ぼうが ない 白い たま。','whole'],
 ['この 音符は 何拍？','半拍','1拍/2拍/4拍','8分音符は 半拍（4分音符の 半分）。はたが 1本 つく。','eighth'],
 ['この 音符（てんの ついた 2分音符）は 何拍？','3拍','2拍/4拍/2拍半','付点（ふてん）は もとの 半分を たす。2 ＋ 1 ＝ 3拍。','dhalf'],
 ['この 音符（てんの ついた 4分音符）は 何拍？','1拍半','1拍/2拍/3拍','付点4分音符は 1 ＋ 半分 ＝ 1拍半。','dquarter'],
 ['この 記号の いみは？','弱く','強く/少し強く/とても強く','p（ピアノ）は「弱く」。','p'],
 ['この 記号の いみは？','強く','弱く/少し弱く/とても弱く','f（フォルテ）は「強く」。','f'],
 ['この 記号の いみは？','少し強く','少し弱く/とても強く/弱く','mf（メゾフォルテ）は「少し強く」。','mf'],
 ['この 記号の いみは？','少し弱く','少し強く/とても弱く/強く','mp（メゾピアノ）は「少し弱く」。','mp'],
 ['この 記号の いみは？','とても弱く','とても強く/少し弱く/強く','pp（ピアニッシモ）は「とても弱く」。','pp'],
 ['この 記号の いみは？','とても強く','とても弱く/少し強く/弱く','ff（フォルティッシモ）は「とても強く」。','ff'],
 ['この 記号の いみは？','だんだん強く','だんだん弱く/急に強く/くりかえす','クレシェンド：口が ひらく ほうへ だんだん 強く。','cresc'],
 ['この 記号の いみは？','だんだん弱く','だんだん強く/急に弱く/のばす','デクレシェンド：だんだん 弱く。','decresc'],
 ['この 記号の いみは？','半音 上げる','半音 下げる/もとの 高さに もどす/くりかえす','♯（シャープ）は 半音 上げる。','sharp'],
 ['この 記号の いみは？','半音 下げる','半音 上げる/もとの 高さに もどす/のばす','♭（フラット）は 半音 下げる。','flat'],
 ['この 記号の いみは？','ほどよく のばす','短く 切る/だんだん 弱く/くりかえす','フェルマータ：その 音を ほどよく のばす。','fermata'],
 ['音符の 上や 下の 点（てん）の いみは？','短く 切って','ほどよく のばす/強く/なめらかに','スタッカート：音を 短く 切って えんそうする。','staccato'],
 ['この 記号の いみは？','くりかえす','おわり/のばす/強く','反復記号（はんぷくきごう）：前に もどって くりかえす。','repeat'],
 ['バイオリンは 何の なかまの 楽器？','弦楽器','金管楽器/木管楽器/打楽器','弦（げん）を 弓で こすって 音を 出す。',''],
 ['トランペットは 何の なかまの 楽器？','金管楽器','弦楽器/木管楽器/打楽器','くちびるを ふるわせて 音を 出す 金属の 楽器。',''],
 ['フルートは 何の なかまの 楽器？','木管楽器','金管楽器/弦楽器/打楽器','金属で できているが、木管楽器の なかま。',''],
 ['ティンパニは 何の なかまの 楽器？','打楽器','弦楽器/金管楽器/木管楽器','大きな たいこ。たたいて 音を 出す。',''],
 ['日本の 楽器で、13本の 弦が ある ものは？','こと（箏）','しゃくはち（尺八）/しゃみせん（三味線）/たいこ','琴（箏）は ことじで 音の 高さを きめる。三味線は 3本、尺八は 竹の ふえ。',''],
 ['交響曲 第5番「運命」を つくった 作曲家は？','ベートーベン','モーツァルト/バッハ/ショパン','「ジャジャジャジャーン」で 有名。',''],
 ['「音楽の 父」と よばれる 作曲家は？','バッハ','ベートーベン/モーツァルト/ヘンデル','ドイツの 作曲家。「G線上の アリア」など。',''],
 ['「魔王（まおう）」を つくった 作曲家は？','シューベルト','バッハ/ショパン/ヴィヴァルディ','「歌曲の 王」と よばれる。',''],
 ['バイオリン協奏曲「四季（しき）」を つくった 作曲家は？','ヴィヴァルディ','バッハ/ベートーベン/シューベルト','「春」「夏」「秋」「冬」の 4曲。',''],
 ['「春の海」を つくった 日本の 作曲家・箏曲家は？','宮城道雄','滝廉太郎/山田耕筰/武満徹','箏と 尺八の ための 曲。お正月に よく 流れる。',''],
 ['「荒城の月（こうじょうの つき）」を つくった 作曲家は？','滝廉太郎','宮城道雄/山田耕筰/中田喜直','「花」「お正月」も 滝廉太郎の 曲。',''],
 ['ワルツは ふつう 何拍子？','3拍子','2拍子/4拍子/6拍子','「ズン・チャッ・チャッ」の 3拍子。',''],
 ['ハ長調の「ド」の 英語の 音名は？','C','A/D/G','C（ド）D（レ）E（ミ）F（ファ）G（ソ）A（ラ）B（シ）。','']
];
function musicQ(){ const r = choice(MUSIC), opts = shuffle([r[1]].concat(r[2].split('/')));
  return {html:`${r[4] ? `<div class="musQ613">${msvg(r[4])}</div>` : ''}<div class="mqSent math">${X(r[0])}</div>`, ans:r[1], opts,
    exp:v => `<div class="ex56"><div class="ex56Hd"><b>📖 かいせつ</b><small>おんがく</small></div><div class="ex56Ans"><span class="ok">⭕ 正しい こたえ <b>${X(r[1])}</b></span>${v && v!==r[1] ? `<span class="ng">❌ きみの こたえ <b>${X(v)}</b></span>` : ''}</div>${r[4] ? `<div class="ex56Fig">${msvg(r[4])}</div>` : ''}<ol class="ex56Steps"><li>${X(r[3])}</li></ol></div>`}; }

const UNI_U = ['decmd','divisor','ave','ratio','vol','cg_clim','cg_world','cg_japan','cg_skill','civ2','w_geo','j_year','j_order','r_bio','r_chem','r_phys','r_earth','r_calc','r_el1','r_el2','r_el3'];
const SCI_U = ['r_sun','r_mag','r_sky','r_water','r_sol','r_lever','r_emag','r_land','r_burn','r_moon','r_chem','r_phys','r_earth','r_el1','r_el2','r_el3','r_calc'];
const BOT_U = ['r_plantpic','r_plant','r_flower'];
const QB = {
  bg_university:{icon:'🎓', name:'だいがく', save:'uni613', qname:'だいがくの むずかしい 問題', desc:'ふつうの 学校より むずかしい 問題が 出るよ。', make:() => fromUnits(UNI_U)},
  bg_science:{icon:'🔬', name:'かがくかん', save:'sci613', qname:'かがくの 問題', desc:'りか・かがくの 問題が 出るよ。', make:() => fromUnits(SCI_U)},
  bg_botanical:{icon:'🌺', name:'しょくぶつえん', save:'bot613', qname:'しょくぶつの 問題', desc:'しょくぶつの 問題が 出るよ。', make:() => fromUnits(BOT_U)},
  bg_concert:{icon:'🎼', name:'コンサートホール', save:'con613', qname:'おんがくの 問題', desc:'おんがくの 問題が 出るよ。', make:musicQ}
};
async function challenge(key, id){
  const o = QB[id], it = ITEM(id), S = save[o.save] || (save[o.save] = {}), done = S.d===dayKey();
  const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">${o.icon} ${X(it?.name||o.name)}</h2>
    <p class="dlgP">${o.desc}<br>クイズに <b>3もん れんぞく</b>で せいかいすると<br><b>水晶</b>が もらえるよ（1日 1かい）</p>
    <div class="cry61">${cryImg()}<b>水晶 ×${crystals()}</b><small>${done ? 'きょうの 水晶は もらったよ' : 'きょうは まだ もらっていないよ'}</small></div>
    ${done ? '<div class="done66">✅ きょうの 水晶は もう もらったよ<br><small>水晶は 1日1回。いまは れんしゅう（水晶・ポイントなし）だよ</small></div>' : ''}`,
    [{label: done ? `${o.icon} れんしゅう する（水晶なし）` : `${o.icon} クイズに ちょうせん（水晶 1こ）`, cls: done ? 'white' : 'gold', v:'quiz'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='quiz') return;
  for(let i=0; i<3; i++){
    const q = o.make(); if(!q){ toast('問題が つくれなかったよ'); return; }
    PICK = null;
    const res = await askMQ({html:`<div class="obsQ61">${o.icon.repeat(i+1)}${'・'.repeat(2-i)}</div>${q.html}`, ans:q.ans, opts:q.opts, key:o.save+'|'+i+'|'+Date.now()}, `<b>${o.icon} ${X(o.qname)}（${i+1}/3）</b>`);
    if(!res.ok){
      await dialog(`<h2 class="dlgT">おしい！ ${i}もん れんぞく</h2>${q.exp(PICK) || `<p class="dlgP">こたえは <b>${X(q.ans)}</b></p>`}`, [{label:'また ちょうせんする', cls:'gold', v:1}], 'wide ex56Dlg');
      return;
    }
    await dialog(`<h2 class="dlgT">⭕ せいかい！</h2><p class="dlgP">${i < 2 ? `あと ${2-i}もん！` : 'さいごの 問題も せいかい！'}</p>`, [{label: i<2 ? 'つぎの もんだい ▶' : 'けっかを 見る ▶', cls:'gold', v:1}]);
  }
  const give = S.d !== dayKey();
  if(give){ S.d = dayKey(); save.crystal = crystals() + 1; const p = givePts(30, `${o.qname} 3もん れんぞく`); persist(); sound('fan'); confetti(1800);
    await dialog(`<div class="cry61 big">${cryImg()}</div><h2 class="dlgT">3もん れんぞく せいかい！</h2><p class="dlgP"><b>水晶を 1こ</b> もらったよ！<br><span class="coin sm">P</span> +${p}<br>水晶 ×${crystals()}</p><p class="dlgP facNote">水晶は 1日1回。あしたも ちょうせんしてね！</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold'); }
  else { persist(); sound('ok');
    await dialog(`<div class="done66 big">✅ れんしゅう クリア！</div><h2 class="dlgT">3もん れんぞく せいかい！</h2><p class="dlgP">きょうの 水晶は もう もらっているので、<b>水晶は ふえないよ</b>。<br>つぎに もらえるのは <b>あした</b>。</p>`, [{label:'OK', cls:'white', v:1}]); }
}

/* =====================================================================
   3) 温泉旅館
   ===================================================================== */
const ONSEN = [['onsen_1','いただきまーす！ おんせんの あとの ごはんは さいこう！'],['onsen_1','ゆうやけの 山、きれいだね〜'],['onsen_2','おふろあがりの ぎゅうにゅう、ぷはーっ！'],['onsen_2','シマくんも こしに 手を あてて のむの？'],['onsen_3','あしゆ、ぽかぽか〜。もみじが きれいだね'],['onsen_3','シマくんも あしゆ きもちいい？']];
async function openOnsen(key){
  const L = choice(ONSEN);
  const v = await dialog(`<div class="star62"><img src="${IMG}${L[0]}.webp" alt=""><div class="st62t">♨️ おんせん りょかん</div></div><div class="talkBubble" style="margin:8px auto 0"><b>ハナ</b>${X(L[1])}</div>`,
    [{label:'もっと 見る ♨️', cls:'gold', v:'more'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='more') return openOnsen(key); if(v==='grade') openBuilding(key);
}

/* =====================================================================
   4) ショッピングモール
   ===================================================================== */
function pickDialog(html, btns, cls){
  return new Promise(res => { let done = false; const end = v => { if(done) return; done = true; $('#dlgBody').onclick = null; res(v); };
    dialog(html, btns, cls).then(end);
    $('#dlgBody').onclick = e => { const b = e.target.closest('[data-pick]'); if(!b || b.disabled) return; $('#dlg').classList.remove('show'); end('pick:' + b.dataset.pick); }; });
}
const MALL_ORDER = ['bakery','market','konbini','dept','library','hotel','dealer','post','takoyaki','crepe','icecream','ramen'];
const mallShops = () => MALL_ORDER.filter(b => SHOPS[b]);
function mallStaff(key){
  const M = save.mall613 || (save.mall613 = {}), S = M[key] || (M[key] = {}), res = save.town.res.filter(r => !SP(r.sp).human);
  const used = new Set(Object.values(workers()));
  mallShops().forEach(b => { if(S[b] && res.some(r => r.id===S[b])) return; const free = res.filter(r => !used.has(r.id) && !Object.values(S).includes(r.id)); const r = (free.length ? choice(free) : choice(res)); if(r) S[b] = r.id; });
  return S;
}
function cleanMall(){ const t = save.town; if(!t) return; let ch = false;
  Object.keys(t.cells).forEach(k => { if(k.startsWith('mall|')){ delete t.cells[k]; ch = true; } });
  Object.keys(workers()).forEach(k => { if(k.startsWith('mall|')){ delete workers()[k]; ch = true; } });
  Object.keys(t.glv||{}).forEach(k => { if(k.startsWith('mall|')){ delete t.glv[k]; ch = true; } });
  if(ch) persist(); }
let MALL_ON = 0;
const inMallShop = () => !!document.querySelector('#dlg.show .shopIn, #dlg.show .pickW');
setInterval(() => { if(!MALL_ON) return; if(!inMallShop()){ if(++MALL_ON > 3){ MALL_ON = 0; cleanMall(); } } else MALL_ON = 1; }, 600);
async function openMall(key){
  cleanMall(); const S = mallStaff(key); persist();
  const by = id => save.town.res.find(r => r.id===id);
  const v = await pickDialog(`<div class="facHead"><img src="${X(artSrc('bg_mall'))}" alt=""><div><h2 class="dlgT">🛍️ ショッピングモール</h2><small>いろいろな お店が 入っているよ。どこに 行く？</small></div></div>
    <div class="mall613">${mallShops().map(b => { const r = by(S[b]), it = ITEM(b);
      return `<button class="facCard" data-pick="${b}"><img src="${X(artSrc(it?.art||''))}" alt=""><b>${SHOPS[b].i} ${X(SHOPS[b].n)}</b><span class="mw613">${r ? `<img src="${X(SP(r.sp).img || artSrc(SP(r.sp).art))}" alt="">` : ''}<small>${r ? X(r.name) : ''}</small></span></button>`; }).join('')}</div>
    <p class="dlgP facNote">モールの お店は ぜんぶ ★3（品ぞろえ さいだい）。はたらいている 住民は 日に よって かわるよ。</p>`,
    [{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}], 'wide');
  if(v==='grade') return openBuilding(key);
  if(!v || !String(v).startsWith('pick:')) return;
  const b = v.slice(5), vk = `mall|${key}|${b}`, t = save.town;
  t.cells[vk] = b; workers()[vk] = S[b]; t.glv = t.glv || {}; t.glv[vk] = 3; MALL_ON = 1;
  SHOP_KEY = vk; window.__noScene613 = 1; try{ await openShop(vk); }finally{ window.__noScene613 = 0; setTimeout(() => { if(!inMallShop()){ MALL_ON = 0; cleanMall(); } }, 400); }
}
openBuilding = (orig => function(key){ if(String(key).startsWith('mall|')){ const real = key.split('|')[1]; cleanMall(); return orig.call(this, real); } return orig.apply(this, arguments); })(openBuilding);
try{ cleanMall(); }catch(e){}
tryScene = (orig => async function(){ if(window.__noScene613) return false; return orig.apply(this, arguments); })(tryScene);

/* =====================================================================
   5) ふんすい広場：ねがいの コイン（1日1かい）
   ===================================================================== */
const WISH = [[55,'pt'],[20,'food'],[15,'crystal'],[8,'letter'],[2,'gold']];
async function openPlaza(key){
  const W = save.wish613 || (save.wish613 = {}), done = W.d===dayKey(), cost = 10, it = ITEM('bg_plaza');
  const v = await dialog(`<div class="dlgArt big">${picHTML(it)}</div><h2 class="dlgT">⛲ ふんすい ひろば</h2>
    <p class="dlgP">${done ? `きょうの ねがいごとは もう したよ<br><small>また あした コインを なげてね</small>` : `ふんすいに コインを なげて ねがいごとを しよう！<br><span class="coin sm">P</span> ${cost}で 1日 1かい。<br><small>ポイント・おやつ・水晶・レターが もらえるかも？</small>`}</p>`,
    (done ? [] : [{label:'🪙 コインを なげる', cls:'gold', v:'toss'}]).concat([{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='toss') return; if(save.points.bal < cost){ toast('ポイントが たりないよ'); return; }
  givePts(-cost, 'ふんすいに コインを なげた'); W.d = dayKey();
  let r = Math.random()*100, kind = 'pt'; for(const [w,k] of WISH){ r -= w; if(r <= 0){ kind = k; break; } }
  let got = '';
  if(kind==='pt'){ const p = givePts(rint(5,15)*10, 'ふんすいの ねがいごと'); got = `<span class="coin sm">P</span> <b>+${p}</b>`; }
  if(kind==='food'){ const L = (SHOP_FOOD.bakery||[]).map(FD).filter(Boolean), f = choice(L); const B = foodBag(); B[f.id] = (B[f.id]||0) + 1; got = `<img src="${X(artSrc(f.art))}" alt="" style="width:64px;height:64px;object-fit:contain"><br><b>${X(f.n)}</b>`; }
  if(kind==='crystal'){ save.crystal = crystals() + 1; got = `${cryImg().replace('<img','<img style="width:64px;height:64px"')}<br><b>水晶 1こ</b>`; }
  if(kind==='letter' || kind==='gold'){ const id = kind==='gold' ? 'goldletter' : 'letter', t = save.town; t.bag[id] = (t.bag[id]||0) + 1; got = `<img src="${X(artSrc(ITEM(id).art))}" alt="" style="width:64px;height:64px;object-fit:contain"><br><b>${X(ITEM(id).name)}</b>`; }
  persist(); sound('fan'); confetti(kind==='gold' ? 2600 : 1300);
  await dialog(`<div class="wish613"><span>🪙</span><i>✨</i></div><h2 class="dlgT">ねがいごとが とどいた！</h2><p class="dlgP">${got}</p>`, [{label:'ありがとう！', cls:'gold', v:1}], kind==='gold' ? 'gold' : '');
}

/* =====================================================================
   タッチ
   ===================================================================== */
const TAP = {bg_university:k => challenge(k,'bg_university'), bg_science:k => challenge(k,'bg_science'), bg_botanical:k => challenge(k,'bg_botanical'), bg_concert:k => challenge(k,'bg_concert'),
  bg_onsen:openOnsen, bg_mall:openMall, bg_plaza:openPlaza};
window.addEventListener('click', e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker,.car2,.ship65,.air65')) return;
  const key = `${c.dataset.x},${c.dataset.y}`, fn = TAP[save.town.cells[key]]; if(!fn) return;
  e.stopImmediatePropagation(); e.preventDefault(); fn(key);
}, true);
try{ Object.assign(ZUKAN_INFO, {bg_hospital:'けがを した 住民が たくさん 来る 大きな びょういん。', bg_university:'むずかしい 問題に ちょうせんできる。3もん れんぞくで 水晶。', bg_science:'かがくの 問題で 水晶が もらえる。', bg_botanical:'しょくぶつの 問題で 水晶が もらえる。',
  bg_onsen:'ハナと シマくんが くつろぐ おやど。', bg_mall:'いろいろな お店が 入っていて、ほとんど なんでも かえる。', bg_concert:'おんがくの 問題で 水晶が もらえる。', bg_plaza:'ふんすいに コインを なげて ねがいごと。'}); }catch(e){}
itemEffect = (orig => function(it){ const s = orig.apply(this, arguments), D = {bg_hospital:'🏥 けがを した 住民が ふえる（なおすと なかよし）', bg_university:'🎓 むずかしい 問題 3もんで 水晶', bg_science:'🔬 かがくの 問題 3もんで 水晶', bg_botanical:'🌺 しょくぶつの 問題 3もんで 水晶', bg_concert:'🎼 おんがくの 問題 3もんで 水晶', bg_onsen:'♨️ ハナと シマくんの おんせん', bg_mall:'🛍️ いろいろな お店で かいもの', bg_plaza:'⛲ 1日1かい ねがいの コイン'};
  return it && D[it.id] ? `${s}・${D[it.id]}` : s; })(itemEffect);

const css = document.createElement('style');
css.textContent = `.zoomBar{display:flex!important;align-items:center;gap:8px;flex-wrap:nowrap!important}
.zoomBar>small{display:none!important}
.zoomBar .icBtn612{display:inline-flex!important;align-items:center;gap:4px;height:40px;padding:0 10px 0 6px!important;border-radius:999px!important;white-space:nowrap;font-size:12px;font-weight:900;color:#6B5540;min-width:0!important;width:auto!important}
.zoomBar .icBtn612 .ic613{width:30px;height:30px;flex:none}
.zoomBar .icBtn612 span{font-size:12px;line-height:1;white-space:nowrap}
.zoomBar .icBtn612.hid{opacity:1}
.zoomBar .lite56Tag{display:inline-flex!important;align-items:center;gap:3px;white-space:nowrap!important;padding:4px 9px!important;font-size:12px!important;line-height:1!important;border-radius:999px!important;margin-left:0!important;flex:none}
.zoomBar .lite56Tag .lf613{width:16px;height:16px;flex:none}
.musQ613{display:flex;justify-content:center;margin:2px 0}.mus613{width:80px;height:80px}.ex56Fig .mus613{width:96px;height:96px}
.mall613{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.mall613 .facCard{position:relative;padding-bottom:22px}.mall613 .facCard img{width:58px;height:58px;object-fit:contain}.mall613 .facCard b{font-size:11.5px}
.mw613{position:absolute;left:4px;right:4px;bottom:3px;display:flex;align-items:center;gap:3px;justify-content:center}.mw613 img{width:22px!important;height:22px!important;object-fit:contain}.mw613 small{font-size:10px;color:#7A5A3A}
.wish613{position:relative;height:90px;display:flex;justify-content:center;align-items:center;font-size:56px}.wish613 span{animation:wish613 1.1s ease-out}.wish613 i{position:absolute;font-style:normal;font-size:30px;top:4px;right:38%;animation:spk65 1.2s ease-in-out infinite}
@keyframes wish613{0%{transform:translateY(40px) scale(.4) rotate(0);opacity:0}60%{transform:translateY(-10px) scale(1.1) rotate(540deg);opacity:1}100%{transform:none}}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__v613 = {challenge, openMall, openPlaza, openOnsen, QB, MUSIC, tidyBar, cleanMall};
})();

/* =====================================================================
   まなびタウン v6.14
   ・みなとで つり（うきが ちょんちょん → ぐいっ！の しゅんかんに タッチ → 魚の クイズ）
   ・食べものの こうか表示の 絵（カフェメニューの 絵が □ に なる）を なおす
   ===================================================================== */
(function(){
'use strict';
const VER = '6.17.2', IMG = './assets/images/v614/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- artSrc：ファイルの パスを そのまま 使えるように（□ の 原因） ---------- */
artSrc = (orig => function(key){ const v = orig.apply(this, arguments); if(v) return v; const k = String(key||''); return /^(\.\/|\/|data:|https?:)/.test(k) ? k : ''; })(artSrc);

/* ---------- 魚 ---------- */
const FISH = [
  {id:'aji',   n:'アジ',   w:30, c1:'#9FB8CC', c2:'#E7EEF3', sp:0, size:'20〜30cm', note:'からだの よこに「ぜいご」と いう かたい うろこが ならぶ。'},
  {id:'iwashi',n:'イワシ', w:30, c1:'#5E86B5', c2:'#E9EEF2', sp:1, size:'15〜20cm', note:'大きな むれで 泳ぐ。からだの よこに 黒い てんてんが ある。'},
  {id:'saba',  n:'サバ',   w:20, c1:'#3E8F86', c2:'#EAF2EF', sp:2, size:'30〜40cm', note:'せなかに くねくねした しまもようが ある 青魚。'},
  {id:'kasago',n:'カサゴ', w:10, c1:'#C0583B', c2:'#F1C7A8', sp:3, size:'20〜30cm', note:'岩の すきまに かくれて すむ。ひれに するどい トゲが ある。'},
  {id:'fugu',  n:'フグ',   w:6,  c1:'#D9C36A', c2:'#F7F2DC', sp:4, size:'20〜40cm', note:'おどろくと 水を すって ふくらむ。毒を もつ ものが 多い。'},
  {id:'madai', n:'マダイ', w:4,  c1:'#E86A86', c2:'#FBD7DF', sp:5, size:'40〜80cm', note:'あざやかな 赤色で「魚の 王さま」と よばれる。おいわいに 食べる。'}
];
const FIMG = {aji:1, iwashi:1, saba:1, kasago:1, fugu:1, madai:1};
const fishSVG = (f, w=90, mode='') => {
  if(FIMG[f.id]) return `<img class="fishIc614 ${mode}" src="${IMG.replace('v614','v615')}fish_${f.id}.webp" alt="" style="width:${w}px;height:auto">`;
  const body = f.id==='fugu' ? `<ellipse cx="54" cy="40" rx="30" ry="26" fill="${f.c1}"/><ellipse cx="56" cy="50" rx="24" ry="14" fill="${f.c2}"/>${[...Array(9)].map((_,i) => `<circle cx="${36+(i%3)*14}" cy="${26+Math.floor(i/3)*8}" r="2.4" fill="#6B5A2A" opacity=".55"/>`).join('')}`
    : `<path d="M20 40Q40 ${f.id==='kasago'?12:18} 72 24Q90 30 92 40Q90 50 72 56Q40 ${f.id==='kasago'?66:62} 20 40Z" fill="${f.c1}"/><path d="M24 42Q46 58 74 52Q88 48 90 42Q70 46 24 42Z" fill="${f.c2}"/>`
      + (f.id==='aji' ? '<path d="M36 38Q56 36 80 40" stroke="#E8EEF2" stroke-width="2.4" fill="none" stroke-dasharray="3 2"/>' : '')
      + (f.id==='iwashi' ? [0,1,2,3,4,5].map(i => `<circle cx="${36+i*8}" cy="39" r="1.8" fill="#2B3A52"/>`).join('') : '')
      + (f.id==='saba' ? '<path d="M34 28q6 6 12 0t12 0t12 0" stroke="#24564F" stroke-width="2.4" fill="none"/>' : '')
      + (f.id==='kasago' ? '<path d="M38 24l4-10l4 9l4-10l4 9l4-9l4 10" stroke="#9A3B23" stroke-width="2" fill="#D9714F"/><circle cx="50" cy="40" r="3" fill="#8A3A24" opacity=".5"/><circle cx="62" cy="46" r="2.4" fill="#8A3A24" opacity=".5"/>' : '')
      + (f.id==='madai' ? [0,1,2,3].map(i => `<circle cx="${40+i*10}" cy="${34+(i%2)*4}" r="1.6" fill="#7FC8F0"/>`).join('') : '');
  const tail = f.id==='fugu' ? `<path d="M24 40L8 30L10 50Z" fill="${f.c1}"/>` : `<path d="M22 40L4 26L8 40L4 54Z" fill="${f.c1}"/>`;
  return `<svg viewBox="0 0 100 80" width="${w}" class="fishIc614">${tail}${body}<circle cx="${f.id==='fugu'?72:80}" cy="${f.id==='fugu'?34:37}" r="5" fill="#fff"/><circle cx="${f.id==='fugu'?73:81}" cy="${f.id==='fugu'?34:37}" r="2.8" fill="#2C2C2C"/><circle cx="${f.id==='fugu'?74:82}" cy="${f.id==='fugu'?33:36}" r="1" fill="#fff"/></svg>`;
};
const FQ = {
  aji:[['アジの からだの よこに ある、かたい うろこの ことを 何という？','ぜいご','ひれ/えら/うろこ玉'],['アジを 開いて ほした 食べものは？','アジの ひもの','かまぼこ/ちくわ/つくだに']],
  iwashi:[['イワシが 大きな むれで 泳ぐのは なぜ？','敵から 身を 守るため','あそびたいから/ねむるため/たまごを かくすため'],['イワシの こどもを ゆでて ほした ものは？','しらす（ちりめんじゃこ）','かつおぶし/するめ/いくら']],
  saba:[['サバのように せなかが 青い 魚を 何という？','青魚（あおざかな）','白身魚/赤身魚/深海魚'],['サバの せなかの もようは？','くねくねした しまもよう','水玉もよう/もようなし/たての しま']],
  kasago:[['カサゴが よく かくれている ところは？','岩の すきま','すなはまの 上/川の 上流/木の 上'],['カサゴの ひれの とくちょうは？','するどい トゲが ある','やわらかくて 長い/光る/ない']],
  fugu:[['フグが おどろいた ときに する ことは？','水を すって ふくらむ','色が 青く なる/空を とぶ/すなに もぐる'],['フグを 料理するのに ひつような ものは？','専門の しかく（免許）','とくべつな なべ/大きな 包丁だけ/なにも いらない']],
  madai:[['マダイが「めでたい」魚と されるのは なぜ？','あざやかな 赤色で 名前も めでたいから','いちばん 小さいから/夜に 光るから/川に すむから'],['マダイの からだの 色は？','赤（さくら色）','青/黒/みどり']]
};
const GQ = [
  ['魚が 水の 中で こきゅうする ところは？','えら','はい/ひれ/うろこ'],['魚の からだを おおっている うすい 板のような ものは？','うろこ','えら/ひれ/こうら'],
  ['魚が 泳ぐ むきを かえる ときに おもに 使うのは？','ひれ','えら/目/うろこ'],['つりで 魚が えさに かかった ことを 何という？','アタリ（ヒット）','ボウズ/スカ/ネガカリ'],
  ['つり糸に つける、うかんで アタリを 知らせる ものは？','うき','おもり/はり/リール'],['海水と 川の 水が まざる ところに すむ 魚も いる。この 水を 何という？','汽水（きすい）','真水/塩水/温水']
];

/* v6.17：魚 20しゅるい・問題 200もん */
FISH.splice(0, FISH.length,
  {id:'aji',    n:'アジ',     w:30, c1:'#9FB8CC', c2:'#E7EEF3', size:'20〜30cm', note:'からだの よこに「ぜいご」と いう かたい うろこが ならぶ。'},
  {id:'iwashi', n:'イワシ',   w:30, c1:'#5E86B5', c2:'#E9EEF2', size:'15〜20cm', note:'大きな むれで 泳ぐ。からだの よこに 黒い てんてんが ある。'},
  {id:'saba',   n:'サバ',     w:20, c1:'#3E8F86', c2:'#EAF2EF', size:'30〜40cm', note:'せなかに くねくねした しまもようが ある 青魚。'},
  {id:'sanma',  n:'サンマ',   w:18, c1:'#4E6FA8', c2:'#E9EEF2', size:'30cmくらい', note:'細長い からだで、秋に よく 食べられる。口の 先が 黄色い。'},
  {id:'haze',   n:'ハゼ',     w:18, c1:'#B39A72', c2:'#EDE3CF', size:'10〜20cm', note:'海と 川の まざる ところの 底に すむ。むなびれで 底に とまる。'},
  {id:'kisu',   n:'キス',     w:15, c1:'#E2CFA8', c2:'#FAF5EA', size:'15〜25cm', note:'すなはまの 近くに すむ 白っぽい 魚。てんぷらで 人気。'},
  {id:'mebaru',  n:'メバル',  w:12, c1:'#8C6B55', c2:'#E8D8C8', size:'20〜30cm', note:'目が とても 大きい。岩場に すみ、夜に えさを さがす。'},
  {id:'kasago', n:'カサゴ',   w:10, c1:'#C0583B', c2:'#F1C7A8', size:'20〜30cm', note:'岩の すきまに かくれて すむ。ひれに するどい トゲが ある。'},
  {id:'ika',    n:'イカ',     w:10, c1:'#F1D7CF', c2:'#FBEFEA', size:'20〜40cm', note:'10本の うで（足）を もつ。すみを はいて にげる。'},
  {id:'tako',   n:'タコ',     w:8,  c1:'#E8644A', c2:'#F7C3B4', size:'30〜60cm', note:'8本の うでに きゅうばんが ある。とても かしこい。'},
  {id:'suzuki', n:'スズキ',   w:8,  c1:'#8EA3B5', c2:'#EEF2F5', size:'40〜90cm', note:'大きく なると 名前が かわる「出世魚」。セイゴ→フッコ→スズキ。'},
  {id:'ayu',    n:'アユ',     w:7,  c1:'#9AA866', c2:'#EEF0E2', size:'15〜30cm', note:'きれいな 川に すみ、石の コケを 食べる。「香魚」とも よばれる。'},
  {id:'fugu',   n:'フグ',     w:6,  c1:'#D9C36A', c2:'#F7F2DC', size:'20〜40cm', note:'おどろくと 水を すって ふくらむ。毒を もつ ものが 多い。'},
  {id:'katsuo', n:'カツオ',   w:6,  c1:'#2F4E8C', c2:'#E7ECF3', size:'40〜90cm', note:'はらに たての しまもようが 出る。かつおぶしの 原料。'},
  {id:'hirame', n:'ヒラメ',   w:5,  c1:'#9A7752', c2:'#E7D7BF', size:'40〜80cm', note:'からだが 平たく、目は 2つとも からだの 左がわに ある。'},
  {id:'unagi',  n:'ウナギ',   w:5,  c1:'#6E6A3E', c2:'#E5E0C4', size:'40〜100cm', note:'ヘビのように 細長い。海で 生まれて 川で 育つ。'},
  {id:'sake',   n:'サケ',     w:4,  c1:'#9AA9B5', c2:'#F4E2E2', size:'60〜80cm', note:'川で 生まれて 海で 育ち、生まれた 川に もどって くる。'},
  {id:'buri',   n:'ブリ',     w:4,  c1:'#3F7FA0', c2:'#EEF3F5', size:'60〜100cm', note:'からだの よこに 黄色い すじ。大きく なると 名前が かわる 出世魚。'},
  {id:'madai',  n:'マダイ',   w:3,  c1:'#E86A86', c2:'#FBD7DF', size:'40〜80cm', note:'あざやかな 赤色で「魚の 王さま」と よばれる。おいわいに 食べる。'},
  {id:'maguro', n:'マグロ',   w:2,  c1:'#24407A', c2:'#E6EBF2', size:'1〜3m', note:'とても 大きく、泳ぐのが 速い。泳ぐのを やめると 息が できない。'}
);
['sanma','katsuo','maguro','sake','hirame','buri','ayu','unagi','tako','haze','kisu','mebaru','ika','suzuki'].forEach(k => { FIMG[k] = 1; });
const FQ20 = {
 aji:[
  ['アジの からだの よこに ある、かたい うろこを 何という？','ぜいご','ひれ/えら/うろこ玉'],['アジを 開いて ほした 食べものは？','アジの ひもの','かまぼこ/ちくわ/つくだに'],
  ['アジは 何の なかまの 魚？','青魚','深海魚/川魚/貝の なかま'],['アジを 細かく きざんで みそなどと たたいた 料理は？','なめろう','すきやき/おでん/やきとり'],
  ['アジの しっぽの 色は どんな 色が 多い？','黄色っぽい','まっ赤/まっ黒/むらさき'],['アジを パン粉を つけて あげた 料理は？','アジフライ','アジの すし/アジの 煮つけ/アジの 塩焼き'],
  ['アジの 名前の ゆらいと いわれる ことは？','味が よいから','足が あるから/あじさいの 色だから/朝に とれるから'],['アジが くらす ところは？','海','川の 上流/池/みずうみ']],
 iwashi:[
  ['イワシが 大きな むれで 泳ぐのは なぜ？','敵から 身を 守るため','あそびたいから/ねむるため/たまごを かくすため'],['イワシの こどもを ゆでて ほした ものは？','しらす（ちりめんじゃこ）','かつおぶし/するめ/いくら'],
  ['イワシの からだの よこに ある もようは？','黒い てんてんが ならぶ','赤い しま/金色の わ/もようは ない'],['イワシを 開いて 油で あげた 料理は？','イワシフライ','イワシの おしるこ/イワシの パフェ/イワシの アイス'],
  ['イワシを 食べる 大きな 生き物は？','クジラや カツオなど','ネコだけ/何も 食べない/木'],['イワシの うろこの とくちょうは？','はがれやすい','とても かたい/トゲに なっている/金色'],
  ['イワシは「弱い 魚」と 書いて 何と 読む 漢字？','鰯','鯛/鯖/鮭'],['かんづめに よく される イワシの 料理は？','オイルサーディン','ジャム/ゼリー/プリン']],
 saba:[
  ['サバのように せなかが 青い 魚を 何という？','青魚（あおざかな）','白身魚/赤身魚/深海魚'],['サバの せなかの もようは？','くねくねした しまもよう','水玉もよう/もようなし/たての しま'],
  ['サバを みそで 煮た 料理は？','サバの みそ煮','サバの しおから/サバの ぜんざい/サバの みそしる'],['サバを 塩と 酢で しめた 料理は？','しめさば','やきさば/さばかん/さばずし'],
  ['青魚に 多く ふくまれる、体に よい あぶらは？','DHAや EPA','砂糖/でんぷん/ビタミンCだけ'],['サバが「生き腐れ」と いわれる りゆうは？','いたむのが とても 早いから','くさった ものを 食べるから/においが ないから/まずいから'],
  ['サバの なかまで、とれる 時期が ちがう ものは？','ゴマサバ','ゴマアジ/ゴマイワシ/ゴマタイ'],['秋から 冬に あぶらが のった サバを 何という？','寒サバ','夏サバ/春サバ/雨サバ']],
 sanma:[
  ['サンマが いちばん おいしい 季節は？','秋','春/夏/冬'],['サンマの 口の 先は 何色？','黄色','青/赤/むらさき'],
  ['サンマを 漢字で 書くと？','秋刀魚','春刀魚/夏刀魚/冬刀魚'],['サンマの からだの 形は？','細長い','まるい/平たい/四角い'],
  ['サンマの 塩焼きに よく そえる ものは？','だいこんおろし','ケチャップ/ジャム/生クリーム'],['サンマを とる りょうで 使う、光で 魚を あつめる 方法は？','棒受け網（ぼううけあみ）','一本づり/たこつぼ/はえなわ'],
  ['サンマの 名産地として 知られる 地方は？','北海道・東北','沖縄/九州南部/四国'],['「目黒の さんま」は 何の お話？','落語','童話/ことわざ/お祭り']],
 haze:[
  ['ハゼが すむ ところは？','海と 川が まざる 浅い 水の 底','深い 海の 中/山の 上の みずうみ/木の 上'],['ハゼが 底に とまるときに つかう ひれは？','むなびれ（吸ばんのように）','せびれ/しっぽ/口'],
  ['ハゼつりが さかんな 季節は？','夏から 秋','冬だけ/春だけ/1年中 できない'],['ハゼの てんぷらは どんな 味？','あっさりした 白身','とても からい/あまい/すっぱい'],
  ['ハゼの なかまで、ひがたを はねまわる 魚は？','ムツゴロウ','マグロ/サンマ/タイ'],['海水と 川の 水が まざる 水を 何という？','汽水','真水/塩水/温水'],
  ['ハゼの 目は どこに ついている？','頭の 上の ほう','おなか/しっぽ/せなかの まんなか'],['ハゼを 小さい 子でも つりやすい りゆうは？','岸の 近くで つれるから','空を とぶから/夜しか いないから/とても 大きいから']],
 kisu:[
  ['キスが すんでいる ところは？','すなはまの 近くの すなぞこ','岩の あな/深い 海/川の 上流'],['キスの からだの 色は？','白っぽい すきとおった 色','まっ黒/まっ赤/みどり'],
  ['キスの 料理で 有名な ものは？','てんぷら','ステーキ/カレー/ケーキ'],['キスを つる ために、えさを 遠くに なげる つりは？','なげづり','たこつぼ/一本づり/トローリング'],
  ['キスの すがたから つけられた よび名は？','「海の 女王」','「海の 王さま」/「川の 忍者」/「空の 魚」'],['キスが あぶないと すなに する ことは？','すなに もぐる','空に とぶ/ふくらむ/すみを はく'],
  ['キスは どんな 味の 魚？','くせの ない 白身','とても あぶらっこい/からい/にがい'],['キスつりの えさに よく 使う ものは？','ゴカイ（虫）','パン/チーズ/くだもの']],
 mebaru:[
  ['メバルの 名前の ゆらいは？','目が 大きく はりだしているから','耳が 大きいから/しっぽが 長いから/歯が 多いから'],['メバルが すむ ところは？','岩場や 海そうの 近く','すなはま/川の 上流/深海'],
  ['メバルが よく えさを さがす 時間は？','夜','昼だけ/朝だけ/1日中 ねている'],['メバルは 何で 子どもを うむ？','おなかの 中で かえして 子どもを うむ','たまごを 木に うむ/たまごを 空に うむ/うまない'],
  ['メバルの 煮つけは どんな 料理？','しょうゆと さとうで 煮る','あげる/生で 食べる/こおらせる'],['メバルが 海の 中で する くせは？','頭を 上に むけて うかぶ','さかさまで ねる/ジャンプする/すなに もぐる'],
  ['メバルの なかまで 赤っぽい 魚は？','カサゴ','サンマ/イワシ/アジ'],['春に よく つれることから 何と よばれる？','春告魚（はるつげうお）','冬眠魚/夏祭魚/秋風魚']],
 kasago:[
  ['カサゴが よく かくれている ところは？','岩の すきま','すなはまの 上/川の 上流/木の 上'],['カサゴの ひれの とくちょうは？','するどい トゲが ある','やわらかくて 長い/光る/ない'],
  ['カサゴの からだの 色は？','赤っぽい まだら','まっ白/すきとおっている/青'],['カサゴの 頭の 大きさは？','からだに くらべて 大きい','とても 小さい/ない/しっぽより 小さい'],
  ['カサゴを まるごと あげた 料理は？','からあげ','アイス/ゼリー/ジュース'],['カサゴは えさを どうやって とる？','岩かげで まちぶせする','空を とぶ/草を 食べる/えさを 食べない'],
  ['カサゴの トゲに さされると？','いたい（少し 毒が ある）','くすぐったい/いいにおいが する/なにも おきない'],['カサゴと にた なかまで 毒の ある 魚は？','オニカサゴ','マダイ/サンマ/キス']],
 ika:[
  ['イカの うで（足）は 何本？','10本','8本/6本/4本'],['イカが にげるときに はく ものは？','すみ','火/あわ/すな'],
  ['イカの 心ぞうの 数は？','3つ','1つ/2つ/ない'],['イカを ほした 食べものは？','するめ','かつおぶし/にぼし/いりこ'],
  ['イカの 血の 色は？','青っぽい','赤/黄色/みどり'],['イカが 夜に 光に あつまる ことを 使った りょうは？','いさりび（集魚灯）を つかう りょう','あみを 空に はる/水を ぬく/音で よぶ'],
  ['イカの 長い 2本の うでを 何という？','しょく腕（しょくわん）','しっぽ/ひれ/つの'],['イカの からだの 色が かわるのは なぜ？','皮ふの 色の つぶで 色を かえるから','ペンキを ぬるから/日やけ/海の 色が うつるだけ']],
 tako:[
  ['タコの うで（足）は 何本？','8本','10本/6本/12本'],['タコの うでに ついている ものは？','きゅうばん','トゲ/うろこ/はね'],
  ['タコの 心ぞうの 数は？','3つ','1つ/2つ/5つ'],['タコを 使った 大阪の 名物は？','たこやき','たこあげ/たこぶね/たこいす'],
  ['タコを つる ための つぼを 使う りょうは？','たこつぼりょう','たこあみ/たこさお/たこばこ'],['タコは とても かしこく、何が できる？','びんの ふたを あけられる','字を 書ける/空を とべる/歌を うたえる'],
  ['タコが 敵に あったら はく ものは？','すみ','火/電気/あわ'],['タコの からだは どうなっている？','ほねが なく やわらかい','かたい こうらが ある/ほねだらけ/毛で おおわれている']],
 suzuki:[
  ['スズキのように 大きく なると 名前が かわる 魚を 何という？','出世魚（しゅっせうお）','変身魚/成長魚/改名魚'],['スズキの 名前の かわる じゅんばんは？','セイゴ → フッコ → スズキ','スズキ → フッコ → セイゴ/フッコ → スズキ → セイゴ/ハマチ → ブリ → スズキ'],
  ['スズキが すむ ところは？','海や 川の 河口ふきん','山の 池だけ/深海だけ/空'],['スズキの 味は？','白身で あっさり','まっ赤で からい/あまい/にがい'],
  ['スズキの うろこや ひれの とくちょうは？','ひれの トゲが するどい','やわらかい 毛/うろこが ない/光る'],['夏に 冷たい 水で しめる スズキの 料理は？','あらい','すきやき/おでん/なべ'],
  ['スズキつりで 使う、小魚の 形の ぎじえは？','ルアー','チーズ/パン/えんぴつ'],['スズキの 大きさは いちばん 大きいと？','1mちかく','5cm/10cm/20cm']],
 ayu:[
  ['アユが すむ ところは？','きれいな 川','海の 深い ところ/池/ぬまち'],['アユが 食べる ものは？','石に ついた コケ','ほかの 魚/木の み/パン'],
  ['アユは どんな においが する 魚？','すいかのような いいにおい','とても くさい/においが ない/花の においだけ'],['アユの いのちは ふつう 何年？','1年','10年/50年/100年'],
  ['アユを なわばりの せいしつを 使って つる 方法は？','友づり','一本づり/なげづり/たこつぼ'],['アユを 使った 鳥の りょうは？','鵜飼い（うかい）','たか狩り/すずめ追い/からす寄せ'],
  ['アユの 塩焼きの 食べかたで 多いのは？','くしに さして 焼く','生で まるのみ/こおらせる/ゆでて つぶす'],['アユは「香魚」とも 書く。その わけは？','いい においが するから','かおが 大きいから/香川に すむから/かおりの ない 魚だから']],
 fugu:[
  ['フグが おどろいた ときに する ことは？','水を すって ふくらむ','色が 青く なる/空を とぶ/すなに もぐる'],['フグを 料理するのに ひつような ものは？','専門の しかく（免許）','とくべつな なべ/大きな 包丁だけ/なにも いらない'],
  ['フグの 毒の 名前は？','テトロドトキシン','ビタミン/カルシウム/アミノ酸'],['フグの 料理で 有名な 県は？','山口県','北海道/長野県/群馬県'],
  ['山口県では フグを 何と よぶ ことが 多い？','ふく','ぶく/ぷく/はく'],['フグの 歯の とくちょうは？','つよい 歯で 貝も かみくだく','歯が ない/やわらかい/毒の 歯'],
  ['フグの うすい さしみを 何という？','てっさ','てっちり/てっか/てっぱん'],['フグの なべを 何という？','てっちり','てっさ/すきやき/しゃぶしゃぶ']],
 katsuo:[
  ['カツオから つくる だしの もとは？','かつおぶし','こんぶ/しいたけ/にぼし'],['カツオの 表面を あぶった 料理は？','カツオの たたき','カツオの あめ/カツオの パン/カツオの ジャム'],
  ['カツオの たたきで 有名な 県は？','高知県','長野県/岐阜県/奈良県'],['春に 南から 北へ のぼって くる カツオを 何という？','初ガツオ','もどりガツオ/冬ガツオ/川ガツオ'],
  ['秋に 北から 南へ もどる カツオを 何という？','もどりガツオ','初ガツオ/春ガツオ/山ガツオ'],['カツオを 1ぴきずつ さおで つる りょうは？','一本づり','たこつぼ/あみで すくう/もりで つく'],
  ['カツオの はらに 出る もようは？','たての しま','水玉/ハート/もようなし'],['カツオは 泳ぐのを やめると どうなる？','息が できなくなる','ねむる/ふくらむ/色が かわるだけ']],
 hirame:[
  ['ヒラメの 目は どちらに ある？','からだの 左がわ','からだの 右がわ/両がわ/おなか'],['「左ヒラメに 右○○」。○○に 入る 魚は？','カレイ','サバ/タイ/マグロ'],
  ['ヒラメの こどもの 目は？','はじめは 両がわに ある','はじめから 左だけ/目が ない/3つ ある'],['ヒラメが 敵から かくれる 方法は？','すなに もぐって 色を かえる','空を とぶ/ふくらむ/すみを はく'],
  ['ヒラメの ひれの 根もとの 部分で 人気の ところは？','えんがわ','トロ/カマ/ほほ'],['ヒラメの からだの 形は？','平たい','まるい/細長い/四角い'],
  ['ヒラメは 何を 食べる？','小魚','海そうだけ/すなだけ/何も 食べない'],['ヒラメの 色が かわるのは なぜ？','まわりの 色に あわせて かくれるため','おこっているから/ねむいから/おなかが すいたから']],
 unagi:[
  ['ウナギは どこで 生まれる？','海','山の 上の 池/田んぼ/川の 上流'],['ウナギを 食べる 日として 知られるのは？','土用の 丑の日','こどもの日/七夕/節分'],
  ['ウナギの からだの とくちょうは？','ヘビのように 細長く ぬるぬる','まるくて トゲだらけ/平たい/毛が ある'],['ウナギを 焼いて ごはんに のせた 料理は？','うな丼','天丼/牛丼/親子丼'],
  ['ウナギの たまごが 見つかった 海は？','マリアナ諸島の 近くの 海','日本海/琵琶湖/北極海'],['ウナギの こどもで すきとおった ものを 何という？','シラスウナギ','ちりめん/いくら/たらこ'],
  ['ウナギの 養殖で 有名な 県は？','静岡県・鹿児島県など','長野県・山梨県/北海道だけ/沖縄県だけ'],['ウナギの 血の とくちょうは？','生だと 毒が あるので 火を とおす','あまい/青い/ない']],
 sake:[
  ['サケが たまごを うむ ために もどる ところは？','生まれた 川','深い 海/みずうみ/南の 島'],['サケの たまごを 何という？','いくら','たらこ/かずのこ/からすみ'],
  ['サケの 身の 色は？','オレンジ色っぽい','まっ白/まっ黒/青'],['サケが 川を のぼる 季節は？','秋','春/夏/1年中'],
  ['サケの 身の 色の もとは？','食べた エビなどの 色素','もとから 赤い 血/ペンキ/日やけ'],['サケを 塩で つけた ものを 何という？','塩ザケ','あまザケ/すザケ/みそザケ'],
  ['サケが 川を のぼる すがたが 見られる ことで 有名な 地方は？','北海道','沖縄/九州南部/四国'],['サケの うまれた 川を 何で おぼえていると いわれる？','においで おぼえている','音楽で/色で/何も おぼえていない']],
 buri:[
  ['ブリのように 大きく なると 名前が かわる 魚を 何という？','出世魚','変身魚/成長魚/改名魚'],['関東での ブリの よび名の じゅんばんは？','ワカシ → イナダ → ワラサ → ブリ','ブリ → ワラサ → イナダ → ワカシ/イナダ → ブリ → ワカシ/ハマチ → スズキ → ブリ'],
  ['関西で ブリの 若い ときの よび名は？','ハマチ','セイゴ/フッコ/シラス'],['冬に とれる あぶらの のった ブリを 何という？','寒ブリ','夏ブリ/春ブリ/川ブリ'],
  ['ブリと だいこんを 煮た 料理は？','ぶりだいこん','ぶりカレー/ぶりパフェ/ぶりあめ'],['寒ブリで 有名な 富山県の まちは？','氷見（ひみ）','横浜/神戸/札幌'],
  ['ブリの からだの よこの すじの 色は？','黄色','赤/むらさき/白'],['お正月に ブリを 食べる りゆうは？','出世魚で えんぎが いいから','いちばん 安いから/いちばん 小さいから/赤いから']],
 madai:[
  ['マダイが「めでたい」魚と されるのは なぜ？','あざやかな 赤色で 名前も めでたいから','いちばん 小さいから/夜に 光るから/川に すむから'],['マダイの からだの 色は？','赤（さくら色）','青/黒/みどり'],
  ['マダイを まるごと ごはんと たいた 料理は？','たいめし','たいやき/たい焼きそば/たいプリン'],['お祝いの ときに 焼いて 出す マダイの 料理は？','タイの 塩焼き（尾頭つき）','タイの アイス/タイの ジャム/タイの ジュース'],
  ['「くさっても ○○」。○○に 入る 魚は？','鯛（たい）','鯖（さば）/鰯（いわし）/鯵（あじ）'],['マダイの からだに ある 小さな 点の 色は？','青','黒/金/むらさき'],
  ['マダイは 何年くらい 生きる？','20年いじょう','1年/3年/半年'],['マダイの 歯の とくちょうは？','つよい 歯で 貝や カニを かむ','歯が ない/やわらかい 歯/毒の 歯']],
 maguro:[
  ['マグロが 泳ぐのを やめると どうなる？','息が できなくなる','ねむる/ふくらむ/色が かわるだけ'],['マグロの あぶらの 多い 部分を 何という？','トロ','えんがわ/カマ/ほほ'],
  ['マグロの 中で いちばん 大きく なる 種類は？','クロマグロ（本マグロ）','キハダ/メバチ/ビンナガ'],['マグロが 泳ぐ 速さは 最高で 時速 どれくらい？','80kmくらい','5kmくらい/10kmくらい/500kmくらい'],
  ['マグロの 一本づりで 有名な 青森県の まちは？','大間（おおま）','横浜/神戸/那覇'],['マグロの 赤い 身の 部分を 何という？','赤身','白身/黄身/青身'],
  ['マグロの 大きさは 大きい もので？','3mいじょう','30cm/50cm/1m'],['マグロの なかまで、ツナかんに よく 使われる ものは？','ビンナガ（ビンチョウ）','クロマグロ/サンマ/タイ']]
};
const GQ20 = [
  ['魚が 水の 中で こきゅうする ところは？','えら','はい/ひれ/うろこ'],['魚の からだを おおっている うすい 板のような ものは？','うろこ','えら/ひれ/こうら'],
  ['魚が 泳ぐ むきを かえる ときに おもに 使うのは？','ひれ','えら/目/うろこ'],['つりで 魚が えさに かかった ことを 何という？','アタリ（ヒット）','ボウズ/スカ/ネガカリ'],
  ['つり糸に つける、うかんで アタリを 知らせる ものは？','うき','おもり/はり/リール'],['海水と 川の 水が まざる ところの 水を 何という？','汽水（きすい）','真水/塩水/温水'],
  ['つり糸を まきとる 道具は？','リール','うき/おもり/たも'],['つり糸を しずめる ための 重りを 何という？','おもり（しずめ）','うき/えさ/ルアー'],
  ['つった 魚を すくう あみを 何という？','たも（たもあみ）','うき/さお/リール'],['つりで 1ぴきも つれない ことを 何という？','ボウズ','大漁/ヒット/アタリ'],
  ['たくさん 魚が とれる ことを 何という？','大漁','不漁/ボウズ/ネガカリ'],['魚の 年れいが わかるのは どこの もよう？','うろこの わ（年輪）','目の 色/ひれの 長さ/歯の 数'],
  ['魚の からだの よこに ある、水の 動きを 感じる 線は？','側線（そくせん）','背線/赤線/水線'],['魚の うきぶくろの はたらきは？','水の 中で うき・しずみを 調節する','においを かぐ/音を 出すだけ/えさを ためる'],
  ['魚は どの なかまの 動物？','セキツイ動物（背骨が ある）','こん虫/貝の なかま/ほ乳類'],['魚の 体温の とくちょうは？','まわりの 水温に よって かわる','いつも 37℃/いつも 0℃/とても 熱い'],
  ['クジラは 魚？','ほ乳類で 魚では ない','魚の なかま/貝の なかま/鳥の なかま'],['エビや カニは 何の なかま？','こうかく類（節足動物）','魚の なかま/貝の なかま/ほ乳類'],
  ['いけすなどで 魚を 育てて 出荷する 漁業は？','養殖業','栽培漁業/遠洋漁業/沖合漁業'],['稚魚を 育てて 海に 放し、大きく なってから とる 漁業は？','栽培漁業','養殖業/遠洋漁業/沿岸漁業'],
  ['遠くの 海で 長い あいだ 魚を とる 漁業は？','遠洋漁業','沿岸漁業/養殖業/沖合漁業'],['魚の あぶらに 多い、頭に いいと いわれる 成分は？','DHA','カフェイン/でんぷん/さとう'],
  ['魚を 生で うすく 切った 料理を 何という？','さしみ','てんぷら/やきざかな/にもの'],['すしの「ネタ」とは 何の こと？','ごはんの 上に のせる 具','おこめ/しょうゆ/おさら'],
  ['魚の たまごを ほぐして 塩づけした ものの 例は？','いくら（サケ）','かまぼこ/ちくわ/はんぺん'],['すり身から つくる 食べもので ちがう ものは？','さしみ','かまぼこ/ちくわ/はんぺん'],
  ['寒流と 暖流が ぶつかる ところを 何という？','潮目（しおめ）','海溝/大陸だな/河口'],['日本の 太平洋がわを 北へ 流れる 暖流は？','黒潮','親潮/リマン海流/対馬海流'],
  ['プランクトンが 多く、魚の えさが 豊富な 寒流は？','親潮','黒潮/対馬海流/赤道海流'],['深い 海に すみ、光を 出す 魚は？','チョウチンアンコウ','マグロ/アジ/キス'],
  ['川で すむ 魚の なかまで ちがう ものは？','マグロ','アユ/コイ/フナ'],['金魚の もとに なった 魚は？','フナ','コイ/メダカ/サケ'],
  ['日本の 川や 田んぼに すむ 小さな 魚で、学校で よく 育てるのは？','メダカ','マグロ/サバ/ブリ'],['魚つりで 使う 小魚や 虫の 形の ぎじえは？','ルアー','うき/おもり/たも'],
  ['魚が 口から 水を すって えらから 出す ことで 何を している？','こきゅう（酸素を とりこむ）','食事/ねむる/泳ぐ 速さを きめる'],['魚の 目の とくちょうは？','まぶたが ない','まぶたが 2まい/目が 4つ/目を とじて ねる'],
  ['魚の ひれで、せなかに ある ものは？','せびれ','むなびれ/はらびれ/しりびれ'],['つり人が まもる マナーとして 正しいのは？','ごみや つり糸を もちかえる','ごみを 海に すてる/ほかの 人の そばで さおを ふる/立ち入り禁止に 入る'],
  ['ライフジャケットを 着る りゆうは？','海に おちた とき うくため','おしゃれ/魚を あつめるため/さむいから'],['小さな 魚が つれた ときに よいのは？','海に もどして あげる','かならず 持って かえる/すてる/ほうっておく']
];
Object.keys(FQ).forEach(k => delete FQ[k]); Object.assign(FQ, FQ20);
GQ.splice(0, GQ.length, ...GQ20);


/* ---------- だれが つりを するか（日ごとに きまる） ---------- */
const S = () => save.fish70 || (save.fish70 = {caught:{}, day:'', pt:0});
/* v6.16：つり人は タンチョウ・カモノハシ・クマの 3にん（日がわり。ボタンで こうたい） */
const ANGLERS = [{sp:'crane', n:'タンチョウ'}, {sp:'platypus', n:'カモノハシ'}, {sp:'bear', n:'クマ'}];
function angler(){
  const st = S(); if(st.angDay !== dayKey()){ st.angDay = dayKey(); st.ang = [...dayKey()].reduce((a,c) => a + c.charCodeAt(0), 0) % ANGLERS.length; persist(); }
  const A = ANGLERS[st.ang % ANGLERS.length], r = (save.town?.res||[]).find(x => x.sp===A.sp);
  return {sp:A.sp, name: r ? r.name : A.n, title: r ? 'つり名人' : `つり名人の ${A.n}`, res:r};
}

/* ---------- 画面 ---------- */
const VB = {w:160, h:107};
const BASE = {x:44, y:56}, TIP0 = {x:88, y:12}, BOB = {x:104, y:78};
let F = null;
function rodPath(b){   // v6.25：竿は もとが 上へ のび、先が 下へ しずむ アーチに しなる
  b = Math.max(0, Math.min(1.1, b));
  const L = (a, c, k) => a + (c - a)*k;
  const tip = {x:L(TIP0.x, 97, b), y:L(TIP0.y, 46, b)};
  const c1 = {x:L(BASE.x + 14.7, BASE.x + 15, b), y:L(BASE.y - 14.7, BASE.y - 38, b)};
  const c2 = {x:L(BASE.x + 29.3, 92, b), y:L(BASE.y - 29.3, 10, b)};
  return {d:`M${BASE.x} ${BASE.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${tip.x} ${tip.y}`, tip};
}
function draw(){
  if(!F) return; const {b, sink, fx, fy, fa, fdir} = F, r = rodPath(b), by = BOB.y + sink;
  F.rod.setAttribute('d', r.d); F.rod2.setAttribute('d', r.d);
  F.line.setAttribute('d', `M${r.tip.x} ${r.tip.y}Q${(r.tip.x + BOB.x)/2 + 2} ${(r.tip.y + by)/2 + 6 - 8*b} ${BOB.x} ${by - 2.4}`);
  F.bob.setAttribute('transform', `translate(${BOB.x} ${by})`);
  F.ex.setAttribute('transform', `translate(${r.tip.x + 4} ${r.tip.y - 7})`);
  F.fish.setAttribute('transform', `translate(${fx} ${fy}) scale(${fdir} 1)`); F.fish.setAttribute('opacity', fa);
}
function tween(ms, fn){ return new Promise(res => { const t0 = performance.now(); const step = t => { if(!F){ res(); return; } const k = Math.min(1, (t - t0)/ms); fn(k); draw(); if(k < 1) F.raf = requestAnimationFrame(step); else res(); }; F.raf = requestAnimationFrame(step); }); }
const wait = ms => new Promise(r => { F && (F.to = setTimeout(r, ms)); });
const ease = k => k<.5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2;
function setMsg(t){ if(F) F.root.querySelector('.fMsg614 span').textContent = t; }

async function openFishing(key){
  if(F) return; const who = angler();
  const root = document.createElement('div'); root.id = 'fish614';
  root.innerHTML = `<div class="fScene614">
      <img class="fBg614" src="${IMG}fish_bg.webp" alt="">
      <div class="fWho614 sp-${who.sp}"><img src="${IMG.replace('v614','v615')}angler_${who.sp}.webp" alt=""><b>${X(who.res ? `${who.title} ${who.name}` : who.title)}</b></div>
      <svg class="fSvg614" viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid slice">
        <defs><radialGradient id="fgN630" cx="60%" cy="50%" r="60%"><stop offset="0" stop-color="#2A5E8E"/><stop offset=".7" stop-color="#123A63"/><stop offset="1" stop-color="#0A2A4A"/></radialGradient><radialGradient id="fgR630" cx="60%" cy="45%" r="60%"><stop offset="0" stop-color="#FFF6C2"/><stop offset=".55" stop-color="#FFD84A"/><stop offset="1" stop-color="#E09A00"/></radialGradient><filter id="fsBlur630" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation=".35"/></filter></defs><g class="fFish614"><g class="fsW630" filter="url(#fsBlur630)"><g class="fsN630"><path class="fTail630" d="M-11.5 0C-13.5 -1.2 -15.5 -4 -18.6 -5.8C-17.6 -2.4 -17.6 2.4 -18.6 5.8C-15.5 4 -13.5 1.2 -11.5 0Z" fill="#0E3158"/><path d="M4.6 -3.4C3.2 -6.8 .6 -8.6 -1.8 -8.4C-.4 -6.6 .8 -5 2 -3.7Z" fill="#0E3158"/><path d="M4.6 3.4C3.2 6.8 .6 8.6 -1.8 8.4C-.4 6.6 .8 5 2 3.7Z" fill="#0E3158"/><path d="M-4.6 -4.2C-6.2 -6.4 -8.2 -6.8 -9.4 -6.4C-8 -5.4 -7.2 -4.6 -6.8 -3.6Z" fill="#0E3158"/><path d="M-4.6 4.2C-6.2 6.4 -8.2 6.8 -9.4 6.4C-8 5.4 -7.2 4.6 -6.8 3.6Z" fill="#0E3158"/><path d="M13.4 0C12 -3.9 7 -5.6 1 -5.3C-5 -5 -9.5 -3 -12.2 0C-9.5 3 -5 5 1 5.3C7 5.6 12 3.9 13.4 0Z" fill="url(#fgN630)"/><path d="M-9 0Q0 -.9 10 0" stroke="#5D8CC0" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".55"/><path d="M-5 -2.6Q2 -4.4 9 -2.4" stroke="#fff" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".32"/><circle cx="9.6" cy="-2.3" r=".75" fill="#06182C"/><circle cx="9.6" cy="2.3" r=".75" fill="#06182C"/></g><g class="fsR630"><path class="fTail630" d="M-11.5 0C-13.5 -1.2 -15.5 -4 -18.6 -5.8C-17.6 -2.4 -17.6 2.4 -18.6 5.8C-15.5 4 -13.5 1.2 -11.5 0Z" fill="#F2B514"/><path d="M4.6 -3.4C3.2 -6.8 .6 -8.6 -1.8 -8.4C-.4 -6.6 .8 -5 2 -3.7Z" fill="#F2B514"/><path d="M4.6 3.4C3.2 6.8 .6 8.6 -1.8 8.4C-.4 6.6 .8 5 2 3.7Z" fill="#F2B514"/><path d="M-4.6 -4.2C-6.2 -6.4 -8.2 -6.8 -9.4 -6.4C-8 -5.4 -7.2 -4.6 -6.8 -3.6Z" fill="#F2B514"/><path d="M-4.6 4.2C-6.2 6.4 -8.2 6.8 -9.4 6.4C-8 5.4 -7.2 4.6 -6.8 3.6Z" fill="#F2B514"/><path d="M13.4 0C12 -3.9 7 -5.6 1 -5.3C-5 -5 -9.5 -3 -12.2 0C-9.5 3 -5 5 1 5.3C7 5.6 12 3.9 13.4 0Z" fill="url(#fgR630)"/><path d="M-9 0Q0 -.9 10 0" stroke="#FFF3B0" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".55"/><path d="M-5 -2.6Q2 -4.4 9 -2.4" stroke="#fff" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".32"/><circle cx="9.6" cy="-2.3" r=".75" fill="#8A5A00"/><circle cx="9.6" cy="2.3" r=".75" fill="#8A5A00"/></g></g><g class="fsR630 spkG630"><path class="spk630" style="animation-delay:0s" d="M-14 -8.8L-13.55 -7.45L-12.2 -7L-13.55 -6.55L-14 -5.2L-14.45 -6.55L-15.8 -7L-14.45 -7.45Z" fill="#fff"/><path class="spk630" style="animation-delay:0.4s" d="M6 -10.3L6.45 -8.95L7.8 -8.5L6.45 -8.05L6 -6.7L5.55 -8.05L4.2 -8.5L5.55 -8.95Z" fill="#fff"/><path class="spk630" style="animation-delay:0.8s" d="M14 3.2L14.45 4.55L15.8 5L14.45 5.45L14 6.8L13.55 5.45L12.2 5L13.55 4.55Z" fill="#fff"/><path class="spk630" style="animation-delay:1.2s" d="M-6 6.2L-5.55 7.55L-4.2 8L-5.55 8.45L-6 9.8L-6.45 8.45L-7.8 8L-6.45 7.55Z" fill="#fff"/></g></g>
        <g class="rip614"><ellipse cx="${BOB.x}" cy="${BOB.y+1}" rx="4" ry="1.4" fill="none" stroke="#fff" stroke-width=".6"/></g>
        <path class="fRod2" stroke="#4A2C14" stroke-width="2.6" fill="none" stroke-linecap="round"/><path class="fRod" stroke="#A0662E" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path class="fLine" stroke="#fff" stroke-width=".45" fill="none" opacity=".95"/>
        <g class="fBob"><ellipse cx="0" cy="1.6" rx="3" ry="1" fill="#000" opacity=".15"/><path d="M-2.6 0a2.6 2.6 0 0 1 5.2 0z" fill="#E8414B"/><path d="M-2.6 0a2.6 2.6 0 0 0 5.2 0z" fill="#fff"/><rect x="-.4" y="-4.4" width=".8" height="2" fill="#E8414B"/></g>
        <g class="fEx" opacity="0"><circle r="5" fill="#FFD84A" stroke="#E8414B" stroke-width=".9"/><text y="2.6" font-size="7.5" font-weight="900" text-anchor="middle" fill="#E8414B">！</text></g>
      </svg>
      <div class="fMsg614"><i>🐟</i><span>うきを なげたよ…</span></div>
      <div class="fHit614">タッチ！</div>
    </div>
    <div class="fBtns614">
      <button data-f="quit"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="13" width="34" height="26" rx="5" fill="#7FB6E6" stroke="#2F6DB5" stroke-width="2.4"/><path d="M7 21h34" stroke="#2F6DB5" stroke-width="2.4"/><rect x="18" y="9" width="12" height="6" rx="2" fill="#F2A33A" stroke="#B5701C" stroke-width="2"/><path d="M14 31q5-5 10 0t10 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="37" cy="37" r="9" fill="#E8414B" stroke="#fff" stroke-width="2.4"/><path d="M33 33l8 8M41 33l-8 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg><span>やめる</span></button>
      <button data-f="zukan"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 10q9-3 18 2q9-5 18-2v28q-9-3-18 2q-9-5-18-2z" fill="#FFF3D6" stroke="#B5701C" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 12v28" stroke="#B5701C" stroke-width="2"/><path d="M10 25q5-5 10 0q-5 5-10 0z" fill="#7FB6E6" stroke="#2F6DB5" stroke-width="1.6"/><path d="M10 25l-3-3v6z" fill="#2F6DB5"/><path d="M28 25q5-5 10 0q-5 5-10 0z" fill="#FF9EB5" stroke="#C0392B" stroke-width="1.6"/><path d="M38 25l3-3v6z" fill="#C0392B"/></svg><span>ずかん</span></button>
      <button data-f="swap"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="16" cy="20" r="8" fill="#FFE2A8" stroke="#B5701C" stroke-width="2.2"/><path d="M5 38q11-14 22 0" fill="#BFD9F5" stroke="#2F6DB5" stroke-width="2.2"/><path d="M28 12a12 12 0 0 1 12 12" fill="none" stroke="#59C059" stroke-width="3.2" stroke-linecap="round"/><path d="M36 22l4 5 4-5" fill="#59C059" stroke="#59C059" stroke-width="1.5" stroke-linejoin="round"/><path d="M40 32a12 12 0 0 1-10 7" fill="none" stroke="#59C059" stroke-width="3.2" stroke-linecap="round"/><path d="M32 35l-4 4 5 2" fill="#59C059" stroke="#59C059" stroke-width="1.5" stroke-linejoin="round"/></svg><span>こうたい</span></button>
    </div>`;
  document.body.appendChild(root);
  const $q = s => root.querySelector(s);
  F = {root, key, b:0, sink:0, fx:170, fy:90, fa:0, fdir:-1, state:'idle', rod:$q('.fRod'), rod2:$q('.fRod2'), line:$q('.fLine'), bob:$q('.fBob'), ex:$q('.fEx'), fish:$q('.fFish614')};
  draw(); requestAnimationFrame(() => root.classList.add('on'));
  root.addEventListener('click', onTap);
  loop();
}
function closeFishing(){ if(!F) return; cancelAnimationFrame(F.raf); clearTimeout(F.to); const r = F.root; F = null; r.classList.remove('on'); setTimeout(() => r.remove(), 250); }

async function loop(){
  if(!F) return; const me = F; me.state = 'cast'; me.b = .55; me.sink = -14; draw();
  await tween(500, k => { me.b = .55*(1-ease(k)); me.sink = -14*(1-ease(k)); });
  if(F!==me) return; me.state = 'wait'; setMsg('魚が くるのを まっています…');
  await wait(rint(900, 2200)); if(F!==me) return;
  /* 魚が ちかづく */
  const fromR = Math.random() < .6; me.fdir = fromR ? -1 : 1; const sx = fromR ? 170 : 60, sy = rint(86, 100);
  me.fishPick = pickFish(); me.rare = me.fishPick.w <= 5; me.root.classList.toggle('rare625', me.rare);
  if(me.rare) setMsg('✨ きんいろの 魚影…！ レアな 魚かも！');
  await tween(rint(1600, 2600), k => { const e = ease(k); me.fx = sx + (BOB.x + (fromR ? 6 : -6) - sx)*e; me.fy = sy + (BOB.y + 5 - sy)*e; me.fa = Math.min(1, k*2); });
  if(F!==me) return;
  /* ちょんちょん */
  const n = rint(1, 3); me.state = 'nibble'; setMsg('…ちょん、ちょん');
  const hx = me.fx, hy = me.fy, dir = fromR ? -1 : 1;
  for(let i=0; i<n; i++){ if(F!==me) return;
    /* さかなが えさを つつく：すっと よって（竿が ぴくっ・うきが ちょん）→ もどる */
    await tween(170, k => { const e = ease(k); me.fx = hx + dir*5*e; me.fy = hy - 1.5*e; me.b = .34*e; me.sink = 3*e; });
    await tween(260, k => { const e = ease(k); me.fx = hx + dir*5*(1-e); me.fy = hy - 1.5*(1-e); me.b = .34*(1-e) + .05*Math.sin(k*Math.PI*3)*(1-k); me.sink = 3*(1-e); });
    await tween(rint(500, 1000), k => { me.fx = hx + Math.sin(k*Math.PI*2)*1.2; me.fy = hy + Math.sin(k*Math.PI*4)*.5; }); }
  if(F!==me) return;
  /* ヒット！ */
  me.state = 'hit'; setMsg(me.rare ? '✨ いまだ！ すばやく タッチ！' : 'いまだ！ タッチ！'); me.ex.setAttribute('opacity', 1); me.root.classList.add('hit'); SFX625('hit');
  const win = me.rare ? 620 : 1100; me.hitAt = performance.now();   // レアは タッチできる 時間が みじかい
  await tween(win, k => { me.b = .95 + .05*Math.sin(k*Math.PI*8); me.sink = 4 + Math.sin(k*Math.PI*10); });
  if(F!==me || me.state!=='hit') return;
  missed('にげられちゃった… もう いちど！');
}
async function missed(t){ if(!F) return; const me = F; me.state = 'miss'; me.ex.setAttribute('opacity', 0); me.root.classList.remove('hit'); setMsg(t); sound && sound('tap');
  await tween(500, k => { me.b *= .8; me.sink *= .8; me.fa = 1 - k; me.fx += me.fdir * -1.2; }); if(F!==me) return; await wait(700); if(F===me) loop(); }

async function onTap(e){
  if(!F) return;
  const bt = e.target.closest('[data-f]');
  if(bt){ e.stopPropagation(); if(bt.dataset.f==='quit') return closeFishing(); if(bt.dataset.f==='zukan') return fishZukan(); if(bt.dataset.f==='swap'){ const st = S(); st.ang = ((st.ang||0) + 1) % ANGLERS.length; persist(); const k = F.key; closeFishing(); setTimeout(() => openFishing(k), 280); return; } }
  if(!e.target.closest('.fScene614')) return;
  const me = F;
  if(me.state==='nibble' || me.state==='wait'){ cancelAnimationFrame(me.raf); clearTimeout(me.to); return missed(me.state==='nibble' ? 'はやすぎた！ ぐいっと しなるまで まとう' : 'まだ 魚が きていないよ'); }
  if(me.state!=='hit') return;
  cancelAnimationFrame(me.raf); me.state = 'quiz'; me.ex.setAttribute('opacity', 0); me.root.classList.remove('hit'); sound && sound('ok');
  setMsg('かかった！ 魚の 問題に こたえて つりあげよう！');
  await tween(350, k => { me.b = 1 - .3*k; });
  const f = me.fishPick || pickFish(), rare = !!me.rare;
  const st0 = S(), RQ = st0.recentQ || (st0.recentQ = []);
  const pickQ = () => { const own = FQ[f.id]||[], pool = Math.random() < .7 ? own : own.concat(GQ), fresh = pool.filter(q => !RQ.includes(q[0])); const q = choice(fresh.length ? fresh : pool); RQ.unshift(q[0]); if(RQ.length > 30) RQ.length = 30; persist(); return q; };
  const N = rare ? 2 : 1; let res = {ok:true}, Q = null;
  for(let qi=0; qi<N && res.ok; qi++){
    Q = pickQ();
    res = await askMQ({html:`<div class="fQ614 ${rare ? 'rareQ625' : ''}">${(FIMG[f.id] ? fishSVG(f, 70, 'shadow') : fishSVG({...f, c1:'#3A6E9E', c2:'#5B8DBA'}, 70).replace('class="fishIc614"','class="fishIc614 shadow"'))}<small>${rare ? `✨ レアな 魚！ ${qi+1}/${N}もん れんぞくで せいかいしよう` : 'どんな 魚かな…？'}</small></div><div class="mqSent math">${X(Q[0])}</div>`, ans:Q[1], opts:shuffle([Q[1]].concat(Q[2].split('/'))), key:'fish|'+Q[0]+'|'+Date.now()}, rare ? '<b>✨ レアな 魚の クイズ</b>' : '<b>🎣 さかなの クイズ</b>');
    if(F!==me) return;
  }
  if(F!==me) return;
  if(res.ok){
    const st = S(), first = !st.caught[f.id]; st.caught[f.id] = (st.caught[f.id]||0) + 1;
    const use = window.__fishUse642 && window.__fishUse642.has(f.id), fb = save.fishBag || (save.fishBag = {}), fk = 'fi_' + f.id;
    if(use) fb[fk] = (fb[fk]||0) + 1; else { st.keep = st.keep || {}; st.keep[f.id] = (st.keep[f.id]||0) + 1; }
    if(st.day!==dayKey()){ st.day = dayKey(); st.pt = 0; } let p = 0; if(st.pt < 10){ st.pt++; p = givePts(rare ? (first ? 250 : 100) : (first ? 40 : 15), `つりで ${f.n}を つりあげた`); }
    persist();
    if(rare){ SFX625('fanfare'); confetti(3200); await rareFx(f); if(F!==me) return; } else { confetti(first ? 1800 : 900); sound && sound('fan'); }
    await dialog(`<div class="fGot614 ${rare ? 'rare' : ''}">${fishSVG(f, 150)}${first ? '<b class="new614">NEW!</b>' : ''}${rare ? '<b class="rare625b">✨ レア</b>' : ''}</div><h2 class="dlgT">${X(f.n)}を つりあげた！</h2>
      <p class="dlgP">${X(f.note)}<br><small>おおきさ：${X(f.size)}</small><br>${p ? `<span class="coin sm">P</span> +${p}` : '<small>きょうの ポイントは おしまい（つりは まだ できるよ）</small>'}</p>
      ${use ? `<p class="dlgP fUse642">🍽 カフェの ざいりょうに なったよ！（てもち ${fb[fk]}ひき）</p>` : `<p class="dlgP fUse642 s">この 魚は うると <b>${fishPrice(f)}ポイント</b> に なるよ</p>`}`,
      use ? [{label:'つづける 🎣', cls:'gold', v:1}] : [{label:`うる（+${fishPrice(f)}）`, cls:'gold', v:'sell'}, {label:'とっておく', cls:'white', v:1}], 'wide').then(v => { if(v==='sell') sellFish(f.id, 1, true); });
  } else {
    await dialog(`<h2 class="dlgT">あっ… 糸が きれちゃった</h2><p class="dlgP">こたえは <b>${X(Q[1])}</b> だったよ。<br><small>${X(f.n)}だったみたい。${X(f.note)}</small></p>`, [{label:'もう いちど 🎣', cls:'gold', v:1}], 'wide');
  }
  if(F===me){ me.fa = 0; me.fx = 170; loop(); }
}
/* レアの 演出 */
function rareFx(f){ return new Promise(res => { const o = document.createElement('div'); o.className = 'rfx625'; o.innerHTML = `<div class="rays625"></div>${fishSVG(f, 220)}<b>✨ レア ゲット！ ✨</b>`; document.body.appendChild(o); setTimeout(() => { o.classList.add('out'); setTimeout(() => { o.remove(); res(); }, 350); }, 2000); }); }
function pickFish(){ let r = Math.random()*FISH.reduce((a,f) => a + f.w, 0); for(const f of FISH){ r -= f.w; if(r <= 0) return f; } return FISH[0]; }
async function fishZukan(){
  const st = S(), got = FISH.filter(f => st.caught[f.id]).length;
  await dialog(`<h2 class="dlgT">🐟 さかなずかん（${got}/${FISH.length}）</h2><div class="fz614">${FISH.map(f => { const n = st.caught[f.id]||0;
    return `<div class="${n ? '' : 'nf615'}">${n ? fishSVG(f, 70) : (FIMG[f.id] ? fishSVG(f, 70, 'fl615') : fishSVG({...f, c1:'#B9B2A6', c2:'#D9D4CB'}, 70))}<b>${f.w <= 5 ? '✨' : ''}${n ? X(f.n) : '？？？'}</b><small>${n ? `${n}ひき` : 'まだ つっていない'}</small></div>`; }).join('')}</div>
    <p class="dlgP facNote">✨は レアな 魚（きんいろの 魚影）</p>`, [{label:'いけす（うる）', cls:'gold', v:'ike'}, {label:'とじる', v:null}], 'wide fz625').then(v => { if(v==='ike') ikesu(); });
}
/* v6.42：うれる 魚（カフェで つかわない 魚） */
const SELL_DAY = 30;
function fishPrice(f){ return Math.min(400, Math.max(20, Math.round(600 / Math.max(1, f.w)))); }
function sellLeft(){ const st = S(), d = dayKey(); if(st.sellDay !== d){ st.sellDay = d; st.sold = 0; } return SELL_DAY - (st.sold||0); }
function sellFish(id, n, quiet){
  const st = S(), f = FISH.find(x => x.id===id); st.keep = st.keep || {}; n = Math.min(n, st.keep[id]||0, sellLeft()); if(!f || n <= 0){ if(!quiet) toast('きょうは もう うれないよ'); return 0; }
  st.keep[id] -= n; if(!st.keep[id]) delete st.keep[id]; st.sold = (st.sold||0) + n;
  const p = givePts(fishPrice(f) * n, `${f.n}を うった`); persist(); sound && sound('ok'); toast(`${f.n} ×${n} → +${p}ポイント`); return p;
}
async function ikesu(){
  const st = S(); st.keep = st.keep || {}; const L = FISH.filter(f => st.keep[f.id] > 0), fb = save.fishBag || {};
  const use = FISH.filter(f => window.__fishUse642 && window.__fishUse642.has(f.id) && fb['fi_' + f.id] > 0);
  const tot = L.reduce((a, f) => a + fishPrice(f) * st.keep[f.id], 0), left = sellLeft();
  const v = await dialog(`<h2 class="dlgT ik642t">${fishSVG(FISH[0], 40)} いけす</h2>
    <div class="ik642h">うれる 魚<small>（きょう あと ${left}ひき うれるよ）</small></div>
    ${L.length ? `<div class="ik642">${L.map(f => `<div>${fishSVG(f, 56)}<b>${X(f.n)} ×${st.keep[f.id]}</b><small>1ぴき ${fishPrice(f)}pt</small><button type="button" class="btn small gold" data-sell="${f.id}" ${left ? '' : 'disabled'}>1ぴき うる</button></div>`).join('')}</div>` : '<p class="dlgP facNote">うれる 魚は いないよ。つりに いこう！</p>'}
    <div class="ik642h">カフェの ざいりょう<small>（メニューに つかうよ）</small></div>
    ${use.length ? `<div class="ik642 u">${use.map(f => `<div>${fishSVG(f, 46)}<b>${X(f.n)} ×${fb['fi_' + f.id]}</b></div>`).join('')}</div>` : '<p class="dlgP facNote">アジ・イワシ・サバ・サンマ・イカ・タコ・サケ・ブリ・マダイ・マグロは カフェの ざいりょうに なるよ</p>'}`,
    (L.length && left ? [{label:`ぜんぶ うる（+${tot}）`, cls:'gold', v:'all'}] : []).concat([{label:'とじる', v:null}]), 'wide');
  if(v==='all'){ let p = 0; L.forEach(f => { p += sellFish(f.id, st.keep[f.id], true); }); if(p) toast(`ぜんぶ うって +${p}ポイント`); ikesu(); }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-sell]'); if(!b || !b.closest('#dlgBody')) return; e.stopImmediatePropagation(); sellFish(b.dataset.sell, 1); document.querySelector('#dlg')?.classList.remove('show'); setTimeout(ikesu, 150); }, true);

/* ---------- みなとを タッチ ---------- */
window.addEventListener('click', e => {
  if(curScreen!=='town' || townEdit || !save.town || F) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker,.car2,.ship65,.air65')) return;
  const key = `${c.dataset.x},${c.dataset.y}`; if(save.town.cells[key]!=='harbor') return;
  e.stopImmediatePropagation(); e.preventDefault(); openFishing(key);
}, true);
try{ ZUKAN_INFO.harbor = '船が でいりする みなと。タッチすると つりが できるよ。'; }catch(e){}
itemEffect = (orig => function(it){ const s = orig.apply(this, arguments); return it && it.id==='harbor' && !s.includes('つり') ? `${s}・🎣 タッチで つり` : s; })(itemEffect);

const css = document.createElement('style');
css.textContent = `#fish614{position:fixed;inset:0;z-index:66;background:rgba(20,40,70,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;transition:opacity .25s;padding:10px}
#fish614.on{opacity:1}
.fScene614{position:relative;width:min(96vw,720px);aspect-ratio:3/2;border-radius:20px;overflow:hidden;border:4px solid #fff;box-shadow:0 8px 30px rgba(0,0,0,.35);touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent}
.fBg614{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.fSvg614{position:absolute;inset:0;width:100%;height:100%}
.fWho614{position:absolute;left:8.9%;top:29%;height:38%;display:flex;flex-direction:column;align-items:center;z-index:2;pointer-events:none}
.fWho614.sp-bear{left:10.5%;top:27%;height:40%}.fWho614.sp-platypus{left:7%;top:35%;height:32%}
.fWho614>img{height:100%;width:auto;filter:drop-shadow(0 3px 2px rgba(0,0,0,.25))}
.fWho614 b{position:absolute;left:0;bottom:-16%;white-space:nowrap;background:rgba(255,255,255,.9);border-radius:10px;padding:0 8px;font-size:12px;color:#6B5540}
.fSvg614 .fBob{transition:none}
.rip614 ellipse{animation:rip614 2.2s ease-out infinite;transform-origin:${BOB.x}px ${BOB.y+1}px}
@keyframes rip614{0%{transform:scale(.5);opacity:.9}100%{transform:scale(2.4);opacity:0}}
.fScene614.hit{animation:shake614 .12s linear infinite}
@keyframes shake614{0%,100%{transform:translate(0,0)}25%{transform:translate(1.5px,-1px)}75%{transform:translate(-1.5px,1px)}}
.fEx{transition:opacity .1s}
.fHit614{position:absolute;right:6%;top:8%;background:#E8414B;color:#fff;font-weight:900;font-size:18px;border-radius:999px;padding:4px 14px;border:3px solid #fff;opacity:0;transform:scale(.6);transition:all .15s;pointer-events:none}
.fScene614.hit .fHit614{opacity:1;transform:scale(1)}
.fMsg614{position:absolute;left:3%;bottom:4%;right:30%;display:flex;align-items:center;gap:8px;background:rgba(24,48,80,.82);color:#fff;border-radius:999px;padding:6px 14px;font-weight:900;font-size:14px;pointer-events:none}
.fMsg614 i{font-style:normal}
.fBtns614{display:flex;gap:8px;flex-wrap:nowrap;justify-content:center;width:min(96vw,720px)}
.fBtns614 button{flex:1 1 0;min-width:0;max-width:200px;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;border:3px solid #fff;background:#FFF8EA;border-radius:16px;padding:6px 8px;font:inherit;font-size:14px;font-weight:900;color:#6B5540;box-shadow:0 3px 0 #D9C3A0;cursor:pointer}
.fBtns614 button svg{width:30px;height:30px;flex:none}
@media (max-width:400px){.fBtns614 button{font-size:12px;gap:3px;padding:5px 4px}.fBtns614 button svg{width:24px;height:24px}}
.fQ614{display:flex;flex-direction:column;align-items:center}.fishIc614.shadow{opacity:.75;filter:blur(1px)}.fQ614 small{font-size:11px;color:#6B5540}
.fGot614{position:relative;display:flex;justify-content:center;animation:bump .6s}.new614{position:absolute;right:22%;top:0;background:#E8414B;color:#fff;border-radius:10px;padding:0 8px;font-size:12px}
.fz614{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;max-height:58vh;overflow-y:auto;overflow-x:hidden}.fz614 img,.fz614 svg{max-width:100%;height:auto}.fz614 b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.rare625 .fFish614>ellipse,.rare625 .fFish614>path{fill:#FFD84A!important;opacity:.95!important}
.rare625 .fFish614{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #FFC400)}
.rare625 .fScene614{box-shadow:0 0 0 4px #FFD84A,0 8px 30px rgba(0,0,0,.35)}
.rareQ625 small{color:#B5701C!important;font-weight:900}.rareQ625 .fishIc614.shadow{filter:brightness(0) sepia(1) saturate(6) hue-rotate(5deg) brightness(1.4)!important;opacity:.9}
.fGot614.rare img{filter:drop-shadow(0 0 10px #FFD84A)}.rare625b{position:absolute;left:20%;top:0;background:linear-gradient(90deg,#FFD84A,#FF9EB5);color:#7A3A00;border-radius:10px;padding:0 8px;font-size:13px}
.rfx625{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(20,10,40,.55);animation:fadeIn .2s}
.rfx625 img{position:relative;z-index:1;animation:bump .8s;filter:drop-shadow(0 0 16px #FFD84A)}
.rfx625 b{position:relative;z-index:1;margin-top:10px;font-size:30px;font-weight:900;color:#FFE27A;-webkit-text-stroke:2px #8A4A00;paint-order:stroke}
.rays625{position:absolute;width:160vmax;height:160vmax;background:repeating-conic-gradient(rgba(255,226,122,.35) 0 10deg,transparent 10deg 20deg);animation:spin625 6s linear infinite}
@keyframes spin625{to{transform:rotate(360deg)}}.rfx625.out{opacity:0;transition:opacity .35s}
.dlgCard.fz625{overflow-x:hidden;max-width:min(96vw,560px)}
.fz614>div{display:flex;flex-direction:column;align-items:center;background:#F3FAFF;border:2px solid #BFE3FB;border-radius:12px;padding:4px}
.fishIc614.fl615{filter:brightness(0) opacity(.25)}.fishIc614.shadow{filter:brightness(0) opacity(.45) blur(1px)!important}
.fz614>div.nf615{background:#F2EFEA;border-color:#E3DDD2}.fz614 b{font-size:13px}.fz614 small{font-size:10px;color:#6B5540}
@media (max-width:600px){.fMsg614{font-size:12px;right:4%}.fWho614 b{font-size:10px}}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__v614 = {ikesu, sellFish, openFishing, closeFishing, FISH, fishSVG, get F(){ return F; }};
})();

/* =====================================================================
   まなびタウン v6.18：まなびスタジアム（STEP1・STEP2）
   STEP1：スタジアムを タッチ → チーム紹介 → 背景に 住民が 守備位置に ならぶ
   STEP2：投球＝1問。正解の はやさで 打球が きまる（HR/三塁打/二塁打/単打）、不正解・時間切れは ストライク
          3ストライクで 三振、3アウトで 交代、3イニング（攻撃のみ）。あいての 点は 各回の「表」で 発表
   ===================================================================== */
(function(){
'use strict';
const VER = '6.22.0', IMG = './assets/images/v618/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const W = ms => new Promise(r => setTimeout(r, ms));
try{ const it = ITEM('stadium'); if(it){ it.lv = 8; it.price0 = it.price0 || 4500; } ZUKAN_INFO.stadium = '住民たちと 野球の ミニゲームが できる。投球は 1問、はやく 答えるほど 遠くへ 飛ぶ！'; }catch(e){}

/* ---------- 座標（背景に たいする %） ---------- */
const FIELD_POS = {P:[50.9,57.5], C:[50.9,86], '1B':[63.5,56], '2B':[57.5,46], SS:[44.3,46], '3B':[38.3,56], LF:[36,33], CF:[50.9,27], RF:[65.8,33]};
const BASE = {0:[50.9,78], 1:[62.4,59.8], 2:[51.1,47.6], 3:[39.4,59.8]};
const BAT = [46.6,79.5], FENCE_Y = 22;
const ST = () => save.stadium || (save.stadium = {level:1, wins:0, games:0, homeRuns:0, crystalsToday:0, lastPlayDate:'', decorations:[]});
const picSrc = s => s.img || artSrc(s.art) || '';
const resImg = r => `<img src="${X(picSrc(SP(r.sp)))}" alt="">`;

/* ---------- チーム ---------- */
function team(){
  { const all = (save.town?.res||[]), ids = (save.bbPick||[]).filter(id => all.some(r => r.id===id)); if(ids.length >= 3){ const L = ids.map(id => all.find(r => r.id===id)), used = new Set(ids);
    const rest = shuffle(all.filter(r => !used.has(r.id) && !SP(r.sp).human && (SP(r.sp).img || artSrc(SP(r.sp).art)))); while(L.length < 9 && rest.length) L.push(rest.shift());   // 9人に たりない ぶんは じどうで おぎなう
    return L; } }
  const L = (save.town?.res||[]).filter(r => picSrc(SP(r.sp)));
  const hana = L.find(r => SP(r.sp).human), others = L.filter(r => !SP(r.sp).human);
  const lineup = shuffle(others.slice()).slice(0, 8); if(hana) lineup.unshift(hana); else if(others[8]) lineup.push(others[8]);
  return lineup;
}
function fielders(lineup){
  const used = new Set(lineup.map(r => r.id)), pool = (save.town?.res||[]).filter(r => !used.has(r.id) && !SP(r.sp).human && picSrc(SP(r.sp)));
  const sp = shuffle(SPECIES.filter(s => !s.human && (s.rar||1) <= 2 && picSrc(s)).slice());
  return Object.keys(FIELD_POS).map((pos, i) => { const r = pool[i]; return r ? {pos, name:r.name, src:picSrc(SP(r.sp))} : {pos, name:sp[i].name, src:picSrc(sp[i])}; });
}

/* ---------- 問題 ---------- */
/* ===== STEP3：球種・得意教科・にがてノート ===== */
const SUBJ = {math:'さんすう', jp:'こくご', sci:'りか', soc:'しゃかい', en:'えいご'};
const SUBJ_IC = {math:'🔢', jp:'📖', sci:'🔬', soc:'🗾', en:'🔤'};
const subjOf = u => { const g = MATH_UNITS[u]?.g; return typeof g==='number' || g==='low' ? 'math' : g==='sci' ? 'sci' : g==='soc' ? 'soc' : g==='bun' ? 'jp' : g==='ek' ? 'en' : null; };
function fav(r){ if(!r.favSubject){ r.favSubject = choice(Object.keys(SUBJ)); persist(); } return r.favSubject; }
const userG = () => Number(save.settings?.grade56 || 0) || 3;
const gName = g => g >= 7 ? '中学' : `${Math.round(g)}年`;
const PITCH = {st:{n:'ストレート', mul:.5, d:-1, cls:'st'}, cv:{n:'カーブ', mul:1, d:0, cls:'cv'}, mk:{n:'まきゅう', mul:2, d:1, cls:'mk'}};
const ug = u => { try{ return window.__v57 ? window.__v57.unitGrade(u) : 0; }catch(e){ return 0; } };
let POOLU = null;
const poolU = () => POOLU || (POOLU = Object.keys(MATH_UNITS).filter(u => subjOf(u) && ug(u) > 0));
function unitsFor(T, subj){ for(const tol of [.6, 1.1, 1.6, 2.6, 9]){ const L = poolU().filter(u => Math.abs(ug(u) - T) <= tol && (!subj || subjOf(u)===subj)); if(L.length) return L; } return []; }
const kanjiFor = T => BUILTIN.filter(q => Math.abs((q.grade||3) - T) <= .6);
function genFromUnit(u){ for(let t=0; t<8; t++){ let m = null; try{ m = mqFromP(MATH_UNITS[u].gen(), u); }catch(e){} if(m && m.opts && m.opts.length >= 2){ m.u = u; return m; } } return null; }
function kanjiQ(q){ const m = kanjiMQ(q, false); if(m){ m.u = 'kanji'; m.kid = q.id; } return m; }
function pickPitch(){ const g = userG(), r = Math.random(); if(g <= 1) return r < .65 ? 'cv' : 'mk'; if(g >= 7) return r < .35 ? 'st' : 'cv'; return r < .3 ? 'st' : r < .8 ? 'cv' : 'mk'; }
function question(br){
  const S = ST(), WN = S.weak || (S.weak = []), g = userG(); let m = null;
  if(G.revenge){ const R = G.revenge; m = R.u==='kanji' ? kanjiQ(choice(kanjiFor(R.qg).length ? kanjiFor(R.qg) : BUILTIN)) : genFromUnit(R.u); if(m) m.isRev = 1; }
  if(!m && WN.length && Math.random() < .3){ const w = choice(WN); m = w.u==='kanji' ? kanjiQ(BUILTIN.find(q => q.id===w.id) || choice(BUILTIN)) : (MATH_UNITS[w.u] ? genFromUnit(w.u) : null); if(m) m.weak = w; }
  if(!m){ const T = Math.max(1, Math.min(7, g + PITCH[pickPitch()].d)), subj = Math.random() < .4 ? fav(br) : choice(Object.keys(SUBJ));
    if(subj==='jp' && kanjiFor(T).length && Math.random() < .5) m = kanjiQ(choice(kanjiFor(T)));
    if(!m){ const near = (sb, tol) => poolU().filter(u => Math.abs(ug(u) - T) <= tol && (!sb || subjOf(u)===sb));
      let L = near(subj, .6); if(!L.length) L = near(null, .6); if(!L.length) L = near(subj, 1.1); if(!L.length) L = near(null, 1.1); if(!L.length) L = unitsFor(T);      // その学年に ない 教科は ほかの 教科に かえる
      for(let t=0; t<6 && !m; t++) m = genFromUnit(choice(L)); } }
  if(!m){ m = makeMQ({}); m.u = m.kq56 ? 'kanji' : m.p56?.u; }
  m.subj = m.u==='kanji' || m.kq56 ? 'jp' : subjOf(m.u) || 'math';
  m.qg = m.kq56 ? (m.kq56.grade||3) : (ug(m.u) || g);
  m.pitch = m.qg < g - .5 ? 'st' : m.qg > g + .5 ? 'mk' : 'cv';
  const txt = String(m.html).replace(/<[^>]+>/g,''), hard = /[×÷]/.test(txt) && /\d{3,}/.test(txt) || /\d{2,}\s*[×÷]\s*\d{2,}/.test(txt);
  m.timeLimit = (hard ? 22 : /<svg|<img/.test(m.html) ? 15 : 12) + (m.pitch==='mk' ? 3 : 0);
  return m;
}
window.__q619 = br => question(br);
function noteMiss(m){ const S = ST(), WN = S.weak || (S.weak = []), k = m.u==='kanji' ? 'k:' + (m.kid || m.kq56?.id) : 'u:' + m.u;
  let w = WN.find(x => x.key===k); if(!w){ w = {key:k, u:m.u, id:m.kid || m.kq56?.id || null, missCount:0}; WN.unshift(w); }
  w.missCount++; w.lastMiss = Date.now(); if(WN.length > 40) WN.length = 40; persist(); }
function clearMiss(w){ const S = ST(); S.weak = (S.weak||[]).filter(x => x.key!==w.key); persist(); }
function explainHTML(m, v){
  try{ if(m.kq56) return window.__explain56({}, '', {kq:m.kq56, kind:'read'}); if(m.p56) return window.__explain56(m.p56, v, {}); }catch(e){}
  return `<p class="dlgP">こたえは <b>${X(m.ansF || m.ans)}</b></p>`;
}

/* ---------- 試合の じょうたい ---------- */
let G = null;
const HIT = [[.25,4,'ホームラン！','hr'],[.5,3,'スリーベース！','t3'],[.75,2,'ツーベース！','t2'],[1.01,1,'ヒット！','t1']];

/* ===== STEP4：ゾーン・チャンス・成長・観客・ボス・改装・水晶 ===== */
const STREAK_PT = n => n===3 ? 5 : n===5 ? 15 : n===7 ? 20 : n===10 ? 50 : n > 10 && n % 5===0 ? 50 : 0;   // 既存の 連続正解ボーナスと おなじ
const CRY_MAX = 3;
function cryToday(){ const S = ST(); if(S.cryDay !== dayKey()){ S.cryDay = dayKey(); S.crystalsToday = 0; } return S.crystalsToday; }
const DECOS = [
  {id:'light', n:'ナイター照明', w:1, ic:'💡', css:'d-light'}, {id:'flag', n:'チームの 旗', w:3, ic:'🚩', css:'d-flag'},
  {id:'turf', n:'あざやかな 芝', w:5, ic:'🌱', css:'d-turf'}, {id:'board', n:'でんこう 掲示板', w:8, ic:'📺', css:'d-board'},
  {id:'fire', n:'花火', w:12, ic:'🎆', css:'d-fire'}, {id:'gold', n:'金の 照明', w:20, ic:'✨', css:'d-gold'}];
const FORGOT = [['🎵','まちの うた'],['🎨','いろえんぴつの 色'],['📚','としょかんの 本の なまえ'],['🌸','さくらの 名所'],['⏰','時計台の かね'],['🍞','パン屋の レシピ'],['🎐','夏まつりの おはやし'],['⭐','星座の なまえ']];
function unlockDecos(){ const S = ST(), D = S.decorations || (S.decorations = []), got = []; DECOS.forEach(d => { if((S.wins||0) >= d.w && !D.includes(d.id)){ D.push(d.id); got.push(d); } }); return got; }
const bossReady = () => (save.story && Object.keys(save.story).length >= 2) && ((ST().games||0) >= 2) && ((ST().bossWins||0) < FORGOT.length);
const pw = r => r.bbPower || 1;
function growth(r){ r.bbExp = (r.bbExp||0) + 1; const need = 3 + pw(r)*2; if(r.bbExp >= need){ r.bbExp -= need; r.bbPower = pw(r) + 1; return true; } return false; }
const crowdN = () => (save.town?.res||[]).length;
const MVP_LINES = ['きょうの ヒーローは きみだ！','バットが ひかってたよ！','べんきょうの せいかが 出たね！','あしたも いっしょに がんばろう！'];
async function openStadium(key){
  if(G) return; unlockDecos(); persist(); const lineup = team();
  if(lineup.length < 3){ await dialog(`<div class="dlgArt big">${picHTML(ITEM('stadium'))}</div><h2 class="dlgT">⚾ まなびスタジアム</h2><p class="dlgP">野球を するには 住民が <b>3人いじょう</b> ひつようだよ。<br>おまねきレターで なかまを ふやそう！</p>`, [{label:'とじる', v:null}], 'wide'); return; }
  const S = ST();
  const v = await dialog(`<h2 class="dlgT">⚾ まなびスタジアム</h2>
    <p class="dlgP">正解で ヒット！ はやいほど 遠くへ 飛ぶよ</p>
    <div class="bbLine618 sm623">${lineup.map((r,i) => `<span><i>${i+1}</i>${resImg(r)}<em>${SUBJ_IC[fav(r)]}</em></span>`).join('')}</div>
    <p class="dlgP facNote">${S.wins||0}しょう／${S.games||0}しあい　💎 きょう ${cryToday()}/${CRY_MAX}</p>
    ${bossReady() ? `<div class="boss620"><b>👑 にがて大王チームが あらわれた！</b><small>かつと まちの わすれものを 1つ とりもどせる（${S.bossWins||0}/${FORGOT.length}）</small></div>` : ''}`,
    (bossReady() ? [{label:'👑 にがて大王と たいせん！', cls:'pink', v:'boss'}] : []).concat([{label:'⚾ プレイボール！', cls:'gold', v:'play'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', v:null}]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v==='play' || v==='boss') startGame(key, lineup, v==='boss');
}
function startGame(key, lineup, boss){
  const opp = [0,0,0]; let tot = boss ? rint(4, 7) : rint(2, 6); opp[2] = 1; tot--; while(tot-- > 0) opp[rint(0,2)]++;   // 最終回にも 点を 入れて ぎゃくてんの 場面を つくる
  G = {key, lineup, field:fielders(lineup), inning:0, outs:0, strikes:0, bases:[null,null,null], score:0, opp, oppShown:0, bat:0, stats:{}, busy:false, boss:!!boss, combo:0, zone:false, cry:0, grow:[]};
  const el = document.createElement('div'); el.id = 'bb618';
  const D = ST().decorations || [], crowd = Math.min(1, crowdN()/40);
  el.innerHTML = `<div class="bbWrap618"><div class="bbScene618 ${D.map(d => 'd-' + d).join(' ')} ${G.boss ? 'boss' : ''}" style="--crowd:${crowd.toFixed(2)}"><img class="bbBg618" src="${IMG}stadium_bg.webp" alt=""><div class="crowd620"></div>${D.includes('flag') ? '<div class="flags620">🚩<span>🚩</span></div>' : ''}${D.includes('board') ? '<div class="board620">📺 まなびタウン</div>' : ''}
      ${G.field.map(f => `<div class="bbF618" data-pos="${f.pos}" style="left:${FIELD_POS[f.pos][0]}%;top:${FIELD_POS[f.pos][1]}%"><img src="${X(f.src)}" alt=""></div>`).join('')}
      <div class="bbRun618"></div><div class="bbBat618" style="left:${BAT[0]}%;top:${BAT[1]}%"></div>
      <div class="bbBall618"></div><div class="bbBoard618"></div><div class="bbMsg618"></div></div>
    <div class="bbPanel618"></div></div>
    <div class="bbBtns618"><button data-bb="quit">✕ しあいを やめる</button></div>`;
  document.body.appendChild(el); G.el = el; G.$ = s => el.querySelector(s);
  el.addEventListener('click', onClick);
  requestAnimationFrame(() => el.classList.add('on'));
  board(); nextInning();
}
const batter = () => G.lineup[G.bat % G.lineup.length];
function board(){
  const dots = (n, max, c) => [...Array(max)].map((_,i) => `<i class="${i < n ? c : ''}"></i>`).join('');
  G.$('.bbBoard618').innerHTML = `<b>${G.inning+1}回うら${G.zone ? ' 🔥ゾーン' : ''}</b><small class="cap621">この回 ${G.innRuns||0}/${RUN_CAP}点</small><span>${G.boss ? '👑大王' : 'あいて'} <em>${G.opp.slice(0, G.oppShown).reduce((a,b) => a+b, 0)}</em> − <em class="me">${G.score}</em> じぶん</span>
    <div><small>S</small>${dots(G.strikes, 3, 'y')}<small>O</small>${dots(G.outs, 3, 'r')}</div>`;
  G.$('.bbRun618').innerHTML = [1,2,3].map(b => { const r = G.bases[b-1]; return r ? `<div class="bbR618" style="left:${BASE[b][0]}%;top:${BASE[b][1]}%">${resImg(r)}</div>` : ''; }).join('');
  const r = batter(); G.$('.bbBat618').innerHTML = `${resImg(r)}<svg class="bbBatBat618" viewBox="0 0 20 60"><path d="M8 58h4l3-44q1-10-5-12q-6 2-5 12z" fill="#D9A066" stroke="#8A5A2B" stroke-width="1.6"/><rect x="7" y="50" width="6" height="8" rx="1" fill="#4A3A2A"/></svg><small>${X(r.name)}</small>`;
}
function msg(t, cls=''){ const m = G.$('.bbMsg618'); m.className = 'bbMsg618 ' + cls; m.innerHTML = t; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show'); }
async function nextInning(){
  if(!G) return;
  if(G.inning >= 3) return endGame();
  if(G.inning >= 2 && G.score - oppNow() >= COLD){ G.cold = true; msg(`⚡ ${COLD}点さで コールドゲーム！`, 'hr'); confetti(2400); sound('fan'); await W(1700); return G && endGame(); }
  G.pa = 0; G.innRuns = 0; G.qAt = rint(1, 3);   // v6.22：問題が 出るのは 1回に 1打席だけ（2〜4番め）
  G.oppShown = G.inning + 1; G.outs = 0; G.strikes = 0; G.bases = [null,null,null]; board();
  msg(`${G.inning+1}回おもて：あいてが <b>${G.opp[G.inning]}点</b> とったよ`, 'big'); await W(1700); if(!G) return;
  msg(`${G.inning+1}回うら：きみの こうげき！`, 'big'); await W(1300); if(!G) return;
  if(G.inning===2 && G.score < G.opp.reduce((a,b) => a+b, 0)){ G.chance = true; G.bases = [G.lineup[(G.bat+6)%G.lineup.length], G.lineup[(G.bat+7)%G.lineup.length], null]; board(); G.el.querySelector('.bbScene618').classList.add('chance'); msg('🔥 チャンス打席！ ランナー1・2るい！', 'hr'); sound('fan'); await W(1700); if(!G) return; }
  nextPA();
}
/* ===== v6.21：1回の 得点上限・コールド・おまかせ打席 ===== */
const RUN_CAP = 5, COLD = 7;
const oppNow = () => G.opp.slice(0, G.oppShown).reduce((a,b) => a+b, 0);
function nextPA(){
  if(!G) return;
  const q = (G.chance && G.inning===2) ? G.pa===0 : G.pa===G.qAt;
  G.pa++;
  if(q) pitch(); else autoBat();
}
const abOf = (r, k) => { try{ return effAb(r, k); }catch(e){ return (r.ab||{})[k] || 3; } };
async function autoBat(){
  if(!G) return; G.busy = true; G.q = null; clearTimeout(TIMER); board();
  const r = batter(), st = G.stats[r.id] || (G.stats[r.id] = {hits:0, rbi:0, hr:0});
  const power = pw(r), skill = (abOf(r,'work') + abOf(r,'know') + abOf(r,'drive'))/3;   // 住民の 能力で きまる
  const pHit = Math.max(.18, Math.min(.45, .20 + skill*.008 + power*.015));
  G.$('.bbPanel618').innerHTML = `<div class="auto621"><b>🤖 おまかせ打席</b><div>${resImg(r)}<span><b>${X(r.name)}</b><small>💪パワー ${power}・🔨${Math.round(abOf(r,'work'))} 📘${Math.round(abOf(r,'know'))}</small></span></div><i style="--p:${Math.round(pHit*100)}%"></i><small>ヒットの かくりつ 約${Math.round(pHit*100)}%</small><em>つぎの 問題の 打席を まってね…</em></div>`;
  const ball = G.$('.bbBall618'); ball.className = 'bbBall618'; ball.style.transition = 'none';
  Object.assign(ball.style, {left:FIELD_POS.P[0]+'%', top:(FIELD_POS.P[1]-1)+'%', transform:'translate(-50%,-50%) scale(.7)', opacity:1});
  const pEl = G.el.querySelector('.bbF618[data-pos="P"]'); pEl.classList.remove('throw'); void pEl.offsetWidth; pEl.classList.add('throw');
  void ball.offsetWidth; ball.style.transition = 'left .7s linear, top .7s linear, transform .7s linear';
  Object.assign(ball.style, {left:BASE[0][0]+'%', top:(BASE[0][1]-1)+'%', transform:'translate(-50%,-50%) scale(1.15)'});
  await W(800); if(!G) return;
  if(Math.random() < pHit){
    const pHR = Math.min(.12, .03 + power*.01 + skill*.002), x = Math.random();
    const frac = x < pHR ? .1 : x < pHR + .05 ? .4 : x < pHR + .25 ? .6 : .9;
    return hit(frac, r, st, null, false);
  }
  /* アウト */
  const bat = G.$('.bbBat618'); bat.classList.remove('swing'); void bat.offsetWidth; bat.classList.add('swing'); try{ SFX625('swing'); }catch(e){}
  const pos = choice(['1B','2B','SS','3B','LF','CF','RF','P']), tg = FIELD_POS[pos];
  ball.style.transition = 'left .7s ease-out, top .7s ease-out'; Object.assign(ball.style, {left:tg[0]+'%', top:(tg[1]-3)+'%'});
  await W(700); if(!G) return; const f = G.el.querySelector(`.bbF618[data-pos="${pos}"]`); if(f){ f.classList.remove('hop'); void f.offsetWidth; f.classList.add('hop'); }
  G.outs++; G.strikes = 0; G.bat++; board(); msg(choice(['フライ アウト','ゴロで アウト','ライナー アウト']), 'k'); await W(1100); if(!G) return;
  if(G.outs >= 3){ msg('スリーアウト チェンジ！', 'big'); await W(1300); if(!G) return; G.inning++; return nextInning(); }
  nextPA();
}
/* ---------- 投球 ---------- */
let TIMER = null;
function pitch(){
  if(!G) return; G.busy = false; const m = question(batter()); G.q = m; G.t0 = performance.now(); board(); pitchTag(m);
  const ball = G.$('.bbBall618'); ball.className = 'bbBall618 p-' + m.pitch; ball.style.transition = 'none';
  Object.assign(ball.style, {left:FIELD_POS.P[0]+'%', top:(FIELD_POS.P[1]-1)+'%', transform:'translate(-50%,-50%) scale(.7)', opacity:1});
  void ball.offsetWidth; ball.style.transition = `left ${m.timeLimit}s linear, top ${m.timeLimit}s linear, transform ${m.timeLimit}s linear`;
  Object.assign(ball.style, {left:BASE[0][0]+'%', top:(BASE[0][1]-1)+'%', transform:'translate(-50%,-50%) scale(1.15)'});
  const pEl = G.el.querySelector('.bbF618[data-pos="P"]'); pEl.classList.remove('throw'); void pEl.offsetWidth; pEl.classList.add('throw');
  const opts = m.optHtml ? m.opts : m.opts;
  const P = PITCH[m.pitch], fv = fav(batter())===m.subj;
  G.$('.bbPanel618').innerHTML = `<div class="bbPt619 ${P.cls}"><b>${P.n}</b><small>${gName(m.qg)}の ${SUBJ_IC[m.subj]}${SUBJ[m.subj]}・とくてん ×${P.mul}</small>${fv ? '<em>とくい教科！</em>' : ''}${m.isRev ? '<em class="rv">リベンジ打席</em>' : m.weak ? '<em class="wk">にがてノート</em>' : ''}</div><div class="bbQ618">${m.html}</div><div class="bbOpts618">${opts.map((o,i) => `<button data-a="${X(o)}" class="c${i%4}">${m.optHtml && m.optHtml[o] ? m.optHtml[o] : X(o)}</button>`).join('')}</div>
    <div class="bbTime618"><i></i><span>はやく 答えるほど 大きく 飛ぶ！</span></div>`;
  const bar = G.$('.bbTime618 i'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = `width ${m.timeLimit}s linear`; bar.style.width = '0%';
  clearTimeout(TIMER); TIMER = setTimeout(() => answer(null), m.timeLimit*1000);
}
async function answer(v){
  if(!G || G.busy) return; G.busy = true; clearTimeout(TIMER); const wasZone = G.zone;
  const m = G.q, ok = v!=null && String(v)===String(m.ansF || m.ans), frac = Math.min(1, (performance.now() - G.t0)/1000/m.timeLimit);
  const ball = G.$('.bbBall618'), cs = getComputedStyle(ball); ball.style.transition = 'none'; ball.style.left = cs.left; ball.style.top = cs.top; ball.style.transform = cs.transform;
  G.$('.bbPanel618').querySelectorAll('button').forEach(b => { b.disabled = true; if(b.dataset.a===String(m.ansF || m.ans)) b.classList.add('ok'); else if(b.dataset.a===String(v)) b.classList.add('ng'); });
  const r = batter(), st = G.stats[r.id] || (G.stats[r.id] = {hits:0, rbi:0, hr:0});
  if(ok){ sound('ok'); G.combo++; const sp = STREAK_PT(G.combo); if(sp) G.pts = (G.pts||0) + sp, G.streakPt = (G.streakPt||0) + sp;
    if(growth(r)) G.grow.push(r); persist();
    if(G.combo >= 5 && !G.zone){ G.zone = true; G.el.querySelector('.bbScene618').classList.add('zone'); setTimeout(() => G && msg('🔥 ゾーン！ つぎの 打席は かならず 長打！', 'hr'), 900); }
    if(m.weak){ clearMiss(m.weak); G.revHits = (G.revHits||0) + 1; G.pts = (G.pts||0) + 20; } const rev = !!m.isRev; G.revenge = null; await hit(wasZone ? Math.min(frac, .49) : frac, r, st, m, rev); }
  else { sound('ng'); G.combo = 0; if(G.zone){ G.zone = false; G.el.querySelector('.bbScene618').classList.remove('zone'); } noteMiss(m); G.revenge = null; await missOut(m, v); }
}
async function hit(frac, r, st, m, rev){
  let [, n, label, cls] = HIT.find(h => frac < h[0]); const fv = m && fav(r)===m.subj;
  if(fv && n < 4){ n++; [, , label, cls] = HIT.find(h => h[1]===n); }
  const P = PITCH[m?.pitch || 'cv'], pt = m ? Math.max(1, Math.round(n*10*P.mul)) : 0; G.pts = (G.pts||0) + pt;
  if(fv) setTimeout(() => G && msg(`とくい教科で パワーアップ！ ${SUBJ_IC[m.subj]}`, 'run'), 1000);
  if(rev) label = 'リベンジ ' + label; else if(m?.weak) label = 'にがて こくふく！ ' + label;
  const bat = G.$('.bbBat618'); bat.classList.remove('swing'); void bat.offsetWidth; bat.classList.add('swing'); try{ SFX625('bat'); }catch(e){}
  const ball = G.$('.bbBall618'), side = Math.random()*2 - 1;
  const tgt = n===4 ? [50.9 + side*16, 8] : n===3 ? [50.9 + side*14, 26] : n===2 ? [50.9 + side*15, 33] : [50.9 + side*12, 42];
  ball.classList.add(n===4 ? 'hr' : 'fly'); void ball.offsetWidth;
  ball.style.transition = `left .9s cubic-bezier(.2,.7,.4,1), top .9s cubic-bezier(.2,.7,.4,1), transform .9s ease-out`;
  Object.assign(ball.style, {left:tgt[0]+'%', top:tgt[1]+'%', transform:`translate(-50%,-50%) scale(${n===4 ? 1.9 : 1.3})`});
  if(G.chance && n){ label = '🔥 ' + label; }
  msg(label, cls); cheer(n); if(n===4){ confetti(1800); sound('fan'); await homerun(); if(!G) return; } else await W(950); if(!G) return;
  ball.style.opacity = n===4 ? 0 : 1;
  /* 近くの 守備が とりに いく */
  if(n < 4){ let best = null, bd = 1e9; G.el.querySelectorAll('.bbF618').forEach(f => { const p = FIELD_POS[f.dataset.pos], d = (p[0]-tgt[0])**2 + (p[1]-tgt[1])**2; if(d < bd){ bd = d; best = f; } }); if(best){ best.classList.remove('hop'); void best.offsetWidth; best.classList.add('hop'); } }
  /* 進塁 */
  let runs = 0; const nb = [null,null,null];
  for(let b=3; b>=1; b--){ const rr = G.bases[b-1]; if(!rr) continue; const to = b + n; if(to >= 4) runs++; else nb[to-1] = rr; }
  if(n >= 4) runs++; else nb[n-1] = r;
  runs = Math.min(runs, RUN_CAP - (G.innRuns||0)); G.innRuns = (G.innRuns||0) + runs;   // 1回の 得点は 5点まで
  G.bases = nb; G.score += runs; st.hits++; st.rbi += runs; if(n===4){ st.hr++; }
  G.strikes = 0; G.bat++; board();
  if(runs) { await W(300); const opp = G.opp.reduce((a,b) => a+b, 0), lead = G.score - runs <= opp && G.score > opp;
    if(G.inning===2 && lead){ msg(G.chance ? '⚡ ぎゃくてん サヨナラ！' : '⚡ ぎゃくてん！', 'hr'); confetti(2600); sound('fan'); G.walkoff = true; await W(1500); if(G){ G.inning = 3; return endGame(); } return; }
    msg(`${runs}点 はいった！`, 'run'); sound('fan'); }
  await W(1300); if(!G) return;
  if(G.inning >= 1 && G.score - oppNow() >= 10){ G.cold = true; msg('⚡ 10点さで コールドゲーム！', 'hr'); confetti(2400); sound('fan'); await W(1700); return G && endGame(); }
  if(G.innRuns >= RUN_CAP){ msg(`この回の 得点は ${RUN_CAP}点まで！ チェンジ`, 'big'); await W(1600); if(!G) return; G.inning++; return nextInning(); }
  nextPA();
}
function cheer(n){ const c = G && G.el.querySelector('.crowd620'); if(!c) return; c.classList.remove('wave'); void c.offsetWidth; c.classList.add('wave'); c.style.setProperty('--loud', n===4 ? 1 : .55); }
async function homerun(){
  const S = ST(), left = CRY_MAX - cryToday(), give = left > 0; if(give){ S.crystalsToday++; save.crystal = (save.crystal||0) + 1; G.cry++; persist(); }
  const ov = document.createElement('div'); ov.className = 'hr620'; ov.innerHTML = `<img src="${IMG}hana_hr.webp" alt=""><b>ホームラン！</b><small>${give ? `💎 水晶 +1（きょう ${S.crystalsToday}/${CRY_MAX}）` : '💎 水晶は きょうは おしまい（1日3こまで）'}</small>`;
  G.el.querySelector('.bbScene618').appendChild(ov); await W(2200); ov.classList.add('out'); await W(300); ov.remove();
}
async function strike(m, v){
  const ball = G.$('.bbBall618'); ball.style.transition = 'left .35s linear, top .35s linear'; Object.assign(ball.style, {left:FIELD_POS.C[0]+'%', top:(FIELD_POS.C[1]-2)+'%'}); setTimeout(() => { try{ SFX625('mitt'); }catch(e){} }, 320);
  G.strikes++; board(); msg(v==null ? '時間切れ… ストライク！' : 'ストライク！', 'k'); await W(900); if(!G) return;
  if(G.strikes < 3){ pitch(); return; }
  msg('さんしん…', 'k'); board(); await W(700); if(!G) return;
  await dialog(`<h2 class="dlgT">⚾ さんしん… いっしょに たしかめよう</h2>${explainHTML(m, v)}<p class="dlgP facNote">つぎは <b>リベンジ打席</b>！ 同じ タイプの 問題が 出るよ。正解すれば アウトに ならない！</p>`, [{label:'🔥 リベンジ打席へ', cls:'gold', v:1}], 'wide ex56Dlg');
  if(!G) return;
  G.revenge = {u:m.u, qg:m.qg}; G.strikes = 2; board(); msg('リベンジ打席！', 'big'); await W(1100); if(G) pitch();
}
async function revengeOut(m, v){
  const ball = G.$('.bbBall618'); ball.style.transition = 'left .35s linear, top .35s linear'; Object.assign(ball.style, {left:FIELD_POS.C[0]+'%', top:(FIELD_POS.C[1]-2)+'%'}); setTimeout(() => { try{ SFX625('mitt'); }catch(e){} }, 320);
  G.outs++; G.strikes = 0; G.bat++; board(); msg('アウト…', 'k'); await W(900); if(!G) return;
  await dialog(`<h2 class="dlgT">おしい！ こたえは <b>${X(m.ansF || m.ans)}</b></h2><p class="dlgP">この タイプの 問題は「にがてノート」に のこしたよ。<br>つぎの 試合で また 出るから、こんどこそ 打とう！</p>`, [{label:'つぎの バッターへ', cls:'gold', v:1}], 'wide');
  if(!G) return;
  if(G.outs >= 3){ msg('スリーアウト チェンジ！', 'big'); await W(1300); G.inning++; return nextInning(); }
  nextPA();
}
async function missOut(m, v){   // v6.22：問題は 1打席 1問。まちがえたら アウト（解説つき）
  const ball = G.$('.bbBall618'); ball.style.transition = 'left .35s linear, top .35s linear'; Object.assign(ball.style, {left:FIELD_POS.C[0]+'%', top:(FIELD_POS.C[1]-2)+'%'}); setTimeout(() => { try{ SFX625('mitt'); }catch(e){} }, 320);
  G.outs++; G.strikes = 0; G.bat++; board(); msg(v==null ? '時間切れ… アウト' : 'さんしん… アウト', 'k'); await W(900); if(!G) return;
  await dialog(`<h2 class="dlgT">⚾ おしい！ いっしょに たしかめよう</h2>${explainHTML(m, v)}<p class="dlgP facNote">この 問題は「にがてノート」に のこしたよ。つぎの 試合で 出たら リベンジしよう！</p>`, [{label:'つぎへ', cls:'gold', v:1}], 'wide ex56Dlg');
  if(!G) return;
  if(G.outs >= 3){ msg('スリーアウト チェンジ！', 'big'); await W(1300); G.inning++; return nextInning(); }
  nextPA();
}
function pitchTag(m){ const P = PITCH[m.pitch]; msg(`${P.n}！`, 'pt-' + P.cls); }
async function endGame(){
  const opp = G.cold ? oppNow() : G.opp.reduce((a,b) => a+b, 0), win = G.score > opp, draw = G.score === opp, S = ST();
  S.games = (S.games||0) + 1; if(win) S.wins = (S.wins||0) + 1;
  const hrs = Object.values(G.stats).reduce((a,s) => a + s.hr, 0); S.homeRuns = (S.homeRuns||0) + hrs; S.lastPlayDate = dayKey();
  const mul = (window.__v56 ? window.__v56.inflRate() : 1) * (G.boss ? 2 : 1), base = Math.round((win ? 40 + G.score*10 : 10 + G.score*5) * mul), hp = G.pts||0, p = givePts(base + hp, win ? 'まなびスタジアムで かった' : 'まなびスタジアムで しあい'); persist(); LAST_EXTRA = {hp, rev:G.revHits||0, weak:(S.weak||[]).length, cry:G.cry, sp:G.streakPt||0, grow:G.grow.slice(), boss:G.boss, walk:G.walkoff, cold:G.cold};
  if(G.boss && win){ S.bossWins = (S.bossWins||0) + 1; LAST_EXTRA.forgot = FORGOT[S.bossWins - 1]; persist(); }
  LAST_EXTRA.decos = win ? unlockDecos() : []; persist();
  if(win){ confetti(2500); sound('fan'); }
  const mvp = G.lineup.slice().sort((a,b) => { const sa = G.stats[a.id]||{hits:0,rbi:0}, sb = G.stats[b.id]||{hits:0,rbi:0}; return (sb.rbi*2 + sb.hits) - (sa.rbi*2 + sa.hits); })[0];
  const key = G.key; closeGame();
  await dialog(`<h2 class="dlgT">${LAST_EXTRA.boss ? '👑 ' : ''}${win ? '🎉 しょうり！' : draw ? '🤝 ひきわけ' : '😢 まけちゃった…'}</h2>
    <div class="bbScore618"><span>あいて<b>${opp}</b></span><i>−</i><span class="me">じぶん<b>${LAST_SCORE}</b></span></div>
    <p class="dlgP">ホームラン ${hrs}本　<span class="coin sm">P</span> +${p}<br><small>（ヒットの とくてん ${LAST_EXTRA.hp}pt ふくむ・下の学年の 問題は ×0.5、上の学年は ×2）</small>${LAST_EXTRA.rev ? `<br>📒 にがて こくふく ${LAST_EXTRA.rev}こ！` : ''}</p>${LAST_EXTRA.weak ? `<p class="dlgP facNote">にがてノート：のこり ${LAST_EXTRA.weak}こ（つぎの 試合で 出るよ）</p>` : ''}
    ${LAST_EXTRA.walk ? '<p class="dlgP"><b>⚡ ぎゃくてん しょうり！</b></p>' : ''}${LAST_EXTRA.cold ? '<p class="dlgP"><b>⚡ コールド しょうり！</b></p>' : ''}
    ${LAST_EXTRA.cry ? `<p class="dlgP">💎 ホームランで 水晶 +${LAST_EXTRA.cry}</p>` : ''}${LAST_EXTRA.sp ? `<p class="dlgP facNote">🔥 れんぞく せいかい ボーナス +${LAST_EXTRA.sp}pt（ふくむ）</p>` : ''}
    ${LAST_EXTRA.forgot ? `<div class="boss620 got"><b>${LAST_EXTRA.forgot[0]} にがて大王から「${LAST_EXTRA.forgot[1]}」を とりもどした！</b><small>まちの みんなが 思い出したよ（${ST().bossWins}/${FORGOT.length}）</small></div>` : ''}
    ${(LAST_EXTRA.decos||[]).map(d => `<p class="dlgP">🏟 改装パーツ「${d.ic} ${d.n}」を ゲット！</p>`).join('')}
    ${LAST_EXTRA.grow.length ? `<p class="dlgP facNote">💪 パワーアップ：${[...new Set(LAST_EXTRA.grow.map(r => r.name))].map(X).join('・')}</p>` : ''}
    ${mvp && G_STATS(mvp) ? `<div class="mvp620">${resImg(mvp)}<b>MVP</b><span>${X(mvp.name)}</span><small>${G_STATS(mvp)}・パワー ${pw(mvp)}</small><div class="talkBubble"><b>シマくん</b>${X(mvp.name)}、${choice(MVP_LINES)}</div></div>` : ''}`, [{label:'もう いちど ⚾', cls:'gold', v:'again'}, {label:'まちへ もどる', v:null}], win ? 'gold' : 'wide').then(v => { if(v==='again') openStadium(key); });
}
let LAST_STATS = {}, LAST_SCORE = 0, LAST_EXTRA = {hp:0, rev:0, weak:0, grow:[], decos:[]};
const G_STATS = r => { const s = LAST_STATS[r.id]; return s && (s.hits || s.rbi) ? `ヒット ${s.hits}本・打点 ${s.rbi}${s.hr ? `・ホームラン ${s.hr}本` : ''}` : ''; };
function closeGame(){ if(!G) return; clearTimeout(TIMER); LAST_STATS = G.stats; LAST_SCORE = G.score; const el = G.el; G = null; el.classList.remove('on'); setTimeout(() => el.remove(), 250); }
async function onClick(e){
  const b = e.target.closest('[data-a]'); if(b && !b.disabled){ e.stopPropagation(); return answer(b.dataset.a); }
  const q = e.target.closest('[data-bb="quit"]'); if(q){ e.stopPropagation(); const v = await dialog('<h2 class="dlgT">しあいを やめる？</h2><p class="dlgP">とちゅうで やめると ポイントは もらえないよ。</p>', [{label:'やめる', cls:'white', v:1}, {label:'つづける', cls:'gold', v:null}]); if(v){ closeGame(); } else if(G && !G.busy){ /* つづき */ } }
}

/* ---------- タッチ ---------- */
window.addEventListener('click', e => {
  if(curScreen!=='town' || townEdit || !save.town || G) return;
  const c = e.target.closest('#townMap .cell'); if(!c || e.target.closest('.walker,.car2,.ship65,.air65')) return;
  const key = `${c.dataset.x},${c.dataset.y}`; if(save.town.cells[key]!=='stadium') return;
  e.stopImmediatePropagation(); e.preventDefault(); openStadium(key);
}, true);
itemEffect = (orig => function(it){ const s = orig.apply(this, arguments); return it && it.id==='stadium' ? `${s}・⚾ タッチで 野球の ミニゲーム` : s; })(itemEffect);

const css = document.createElement('style');
css.textContent = `#bb618{position:fixed;inset:0;z-index:66;background:rgba(18,40,70,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;transition:opacity .25s;padding:8px}
#bb618.on{opacity:1}
.bbWrap618{display:flex;gap:8px;align-items:stretch;width:min(98vw,1000px)}
.bbScene618{position:relative;flex:1 1 auto;aspect-ratio:3/2;border-radius:18px;overflow:hidden;border:4px solid #fff;box-shadow:0 8px 30px rgba(0,0,0,.35)}
.bbBg618{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bbF618,.bbR618,.bbBat618{position:absolute;transform:translate(-50%,-88%);height:11%;z-index:2;pointer-events:none}
.bbF618 img,.bbR618 img,.bbBat618 img{height:100%;width:auto;display:block;filter:drop-shadow(0 3px 2px rgba(0,0,0,.3))}
.bbF618::after,.bbR618::after,.bbBat618::after{content:"";position:absolute;left:15%;right:15%;bottom:-6%;height:14%;border-radius:50%;background:rgba(0,0,0,.22);z-index:-1}
.bbF618.throw{animation:throw618 .5s ease-out}.bbF618.hop{animation:hop618 .6s ease-out}
@keyframes throw618{0%{transform:translate(-50%,-88%)}40%{transform:translate(-50%,-100%) rotate(-12deg)}100%{transform:translate(-50%,-88%)}}
@keyframes hop618{0%,100%{transform:translate(-50%,-88%)}50%{transform:translate(-50%,-125%)}}
.bbR618{height:9%;transition:left .6s,top .6s}
.bbBat618{height:13%;z-index:3}
.bbBat618 small{position:absolute;left:50%;bottom:-30%;transform:translateX(-50%);white-space:nowrap;font-size:10px;font-weight:900;background:rgba(255,255,255,.9);border-radius:8px;padding:0 6px;color:#6B5540}
.bbBatBat618{position:absolute;right:-22%;top:0;height:80%;width:auto;transform-origin:50% 95%;transform:rotate(-35deg)}
.bbBat618.swing{animation:swing618 .6s ease-out}.bbBat618.swing .bbBatBat618{animation:bat618 .4s ease-out}
@keyframes swing618{0%{transform:translate(-50%,-88%)}30%{transform:translate(-40%,-100%) rotate(12deg)}100%{transform:translate(-50%,-88%)}}
@keyframes bat618{0%{transform:rotate(-30deg)}100%{transform:rotate(200deg)}}
.bbBall618{position:absolute;width:2.4%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#E6E1D8);border:1px solid #C9C2B4;box-shadow:0 2px 3px rgba(0,0,0,.3);z-index:4;transform:translate(-50%,-50%)}
.bbBall618.hr{box-shadow:0 0 12px 4px #FFE27A}
.bbBall618.p-cv{animation:cv619 1.2s ease-in-out infinite alternate}@keyframes cv619{from{margin-left:-1.2%}to{margin-left:1.2%}}
.bbBall618.p-mk{background:radial-gradient(circle at 35% 35%,#fff,#FFE27A);box-shadow:0 0 10px 5px #FFB3F0,0 0 18px 8px #B39DFF;animation:mk619 .18s linear infinite}@keyframes mk619{0%,100%{margin-left:-.5%;margin-top:0}50%{margin-left:.5%;margin-top:-.4%}}
.bbPt619{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;justify-content:center;border-radius:12px;padding:3px 8px;background:#EEF4FF;border:2px solid #9FC3F0}
.bbPt619 b{font-size:15px;color:#1C5A99}.bbPt619 small{font-size:11px;font-weight:800;color:#4A3A2A}.bbPt619 em{font-style:normal;font-size:11px;font-weight:900;background:#FFE27A;color:#B5701C;border-radius:8px;padding:0 6px}
.bbPt619 em.rv{background:#FFB3B3;color:#C0392B}.bbPt619 em.wk{background:#E3D3FF;color:#5B3BA8}
.bbPt619.st{background:#F2F2F2;border-color:#C9C9C9}.bbPt619.st b{color:#666}
.bbPt619.mk{background:linear-gradient(90deg,#FFE9FB,#EDE6FF);border-color:#C9A8FF}.bbPt619.mk b{color:#8A3BC4}
.bbMsg618.pt-st{border-color:#AAA;color:#666}.bbMsg618.pt-cv{border-color:#4C97FF;color:#1C5A99}.bbMsg618.pt-mk{border-color:#B39DFF;color:#8A3BC4;background:linear-gradient(90deg,#FFF7FE,#F3EEFF)}
.bbScene618.zone{box-shadow:0 0 0 4px #FFD84A,0 0 26px 8px #FF9A3D inset,0 8px 30px rgba(0,0,0,.35);animation:zone620 .9s ease-in-out infinite alternate}
@keyframes zone620{to{box-shadow:0 0 0 4px #FF8A3D,0 0 40px 14px #FFD84A inset,0 8px 30px rgba(0,0,0,.35)}}
.bbScene618.chance{outline:4px solid #E8414B;outline-offset:-4px}
.bbScene618.boss .bbBg618{filter:saturate(.75) hue-rotate(-12deg) brightness(.92)}
.bbScene618.d-turf .bbBg618{filter:saturate(1.25)}.bbScene618.d-light::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 12%,rgba(255,250,200,.45),transparent 22%),radial-gradient(circle at 82% 12%,rgba(255,250,200,.45),transparent 22%);pointer-events:none;z-index:1}
.bbScene618.d-gold::after{background:radial-gradient(circle at 18% 12%,rgba(255,215,90,.55),transparent 24%),radial-gradient(circle at 82% 12%,rgba(255,215,90,.55),transparent 24%)}
.crowd620{position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse 46% 44% at 51% 52%,transparent 86%,rgba(255,230,140,calc(var(--crowd)*.35)) 90%,transparent 100%)}
.crowd620.wave{animation:wave620 1s ease-out}@keyframes wave620{0%{filter:brightness(1)}30%{filter:brightness(calc(1 + var(--loud,.5)))}100%{filter:brightness(1)}}
.flags620{position:absolute;left:47%;top:2%;font-size:clamp(10px,2vw,18px);z-index:2;animation:facBob 1.4s ease-in-out infinite}.flags620 span{margin-left:.6em}
.board620{position:absolute;left:40%;top:9%;font-size:clamp(8px,1.5vw,12px);font-weight:900;background:#1C2B4A;color:#8FE3FF;border-radius:4px;padding:0 6px;z-index:2}
.hr620{position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,.35);animation:hrin620 .35s ease-out}
.hr620 img{width:82%;max-height:78%;object-fit:cover;border-radius:16px;border:4px solid #fff;box-shadow:0 6px 20px rgba(0,0,0,.35)}
.hr620 b{margin-top:-8%;font-size:clamp(20px,5vw,40px);font-weight:900;color:#E8414B;-webkit-text-stroke:2px #fff;paint-order:stroke}
.hr620 small{background:#fff;border-radius:10px;padding:2px 10px;font-weight:900;color:#5B4BC4;font-size:clamp(10px,2vw,14px)}
.hr620.out{opacity:0;transition:opacity .3s}@keyframes hrin620{from{transform:scale(.6);opacity:0}}
.boss620{background:linear-gradient(90deg,#3B2A5A,#6B3B8A);color:#fff;border-radius:12px;padding:6px 10px;margin:6px auto;max-width:330px;text-align:center}.boss620 b{display:block;font-size:14px}.boss620 small{font-size:11px;color:#E6D6FF}
.boss620.got{background:linear-gradient(90deg,#FFE27A,#FFB3C1);color:#6B3A1A}.boss620.got small{color:#7A4A2A}
.mvp620{display:flex;flex-direction:column;align-items:center;background:radial-gradient(circle at 50% 30%,#FFF6D8,#FFE7A8);border:3px solid #F2C94C;border-radius:16px;padding:8px;margin:6px auto;max-width:320px}
.mvp620 img{width:150px;height:150px;object-fit:contain;animation:bump .8s;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))}
.mvp620>b{font-size:20px;color:#E8414B;letter-spacing:4px}.mvp620 span{font-size:16px;font-weight:900}.mvp620 small{font-size:11.5px}.mvp620 .talkBubble{margin-top:6px;font-size:13px}
.auto621{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.auto621>b{color:#1C5A99;font-size:15px}
.auto621>div{display:flex;align-items:center;gap:8px}.auto621 img{width:64px;height:64px;object-fit:contain}.auto621 span{display:flex;flex-direction:column;align-items:flex-start}.auto621 span small{font-size:11px}
.auto621>i{width:90%;height:10px;border-radius:5px;background:linear-gradient(90deg,#59C059 var(--p),#E9E4DC var(--p))}.auto621>small{font-size:11px}.auto621 em{font-style:normal;font-size:11px;color:#8A7560}
.cap621{display:block;font-size:.75em;color:#FFD84A}
.bbLine618.sm623 span{width:40px;padding:1px}.bbLine618.sm623 img{width:32px;height:32px}.bbLine618.sm623 em{font-size:12px}
.bbLine618 u{text-decoration:none;font-size:8.5px;font-weight:900;color:#C66F0A}
.bbLine618 em{font-style:normal;font-size:8.5px;font-weight:800;color:#6B5540;white-space:nowrap}
.bbBoard618{position:absolute;left:2%;top:3%;z-index:6;background:rgba(24,36,70,.88);color:#fff;border-radius:12px;padding:4px 10px;font-weight:900;font-size:clamp(10px,2.2vw,15px);line-height:1.35}
.bbBoard618 span{display:block}.bbBoard618 em{font-style:normal;font-size:1.25em;color:#FFD84A}.bbBoard618 em.me{color:#8FE3FF}
.bbBoard618 div{display:flex;align-items:center;gap:3px}.bbBoard618 small{font-size:.8em;margin-left:4px}.bbBoard618 div i{width:.8em;height:.8em;border-radius:50%;border:1.5px solid #fff}
.bbBoard618 div i.y{background:#FFD84A;border-color:#FFD84A}.bbBoard618 div i.r{background:#E8414B;border-color:#E8414B}
.bbMsg618{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.6);z-index:7;opacity:0;pointer-events:none;background:rgba(255,255,255,.95);border:3px solid #F2A33A;color:#B5701C;border-radius:16px;padding:6px 16px;font-weight:900;font-size:clamp(14px,3.6vw,26px);white-space:nowrap}
.bbMsg618.show{animation:msg618 1.6s ease-out forwards}
.bbMsg618.big{font-size:clamp(12px,2.8vw,20px);border-color:#4C97FF;color:#1C5A99}
.bbMsg618.hr{background:linear-gradient(90deg,#FFE27A,#FF9EB5);color:#C0392B;border-color:#fff;font-size:clamp(18px,5vw,36px)}
.bbMsg618.k{border-color:#E8414B;color:#C0392B}.bbMsg618.run{border-color:#59C059;color:#2E7D32;top:28%}
@keyframes msg618{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}25%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(1)}}
.bbPanel618{flex:0 0 300px;background:#FFFDF6;border:4px solid #fff;border-radius:18px;padding:10px;display:flex;flex-direction:column;gap:8px;box-shadow:0 8px 30px rgba(0,0,0,.3);overflow:auto;max-height:min(70vh,640px)}
.bbQ618{font-weight:900;color:#4A3A2A;font-size:16px;text-align:center}.bbQ618 .mqSent{font-size:20px!important;margin:4px 0}.bbQ618 svg,.bbQ618 img{max-width:100%;height:auto;max-height:140px;object-fit:contain}
.bbOpts618{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bbOpts618 button{border:none;border-radius:12px;padding:10px 4px;font:inherit;font-weight:900;font-size:16px;color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.18);cursor:pointer;min-height:48px;word-break:break-word}
.bbOpts618 button.c0{background:#5B9BE6}.bbOpts618 button.c1{background:#E8606A}.bbOpts618 button.c2{background:#4FB57A}.bbOpts618 button.c3{background:#F2A33A}
.bbOpts618 button:disabled{opacity:.45}.bbOpts618 button.ok{opacity:1;outline:4px solid #FFD84A}.bbOpts618 button.ng{opacity:1;filter:grayscale(.6)}
.bbOpts618 button img,.bbOpts618 button svg{max-height:44px;max-width:100%}
.bbTime618{position:relative;height:26px;background:#FFF0B8;border-radius:999px;overflow:hidden}
.bbTime618 i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#FF8A3D,#FFB347)}
.bbTime618 span{position:relative;display:block;text-align:center;font-size:12px;font-weight:900;color:#6B3A1A;line-height:26px}
.bbBtns618 button{border:3px solid #fff;background:#FFF8EA;border-radius:14px;padding:6px 14px;font:inherit;font-weight:900;color:#6B5540;box-shadow:0 3px 0 #D9C3A0}
.bbLine618{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:6px 0}
.bbLine618 span{position:relative;width:58px;display:flex;flex-direction:column;align-items:center;background:#F3FAFF;border:2px solid #BFE3FB;border-radius:10px;padding:2px}
.bbLine618 img{width:42px;height:42px;object-fit:contain}.bbLine618 small{font-size:9.5px;font-weight:800;white-space:nowrap;overflow:hidden;max-width:54px}
.bbLine618 i{position:absolute;left:2px;top:0;font-style:normal;font-size:10px;font-weight:900;color:#1C6AAE}
.bbScore618{display:flex;justify-content:center;align-items:center;gap:10px;font-weight:900}.bbScore618 span{display:flex;flex-direction:column;align-items:center;font-size:12px}.bbScore618 b{font-size:36px;color:#C0392B}.bbScore618 .me b{color:#1C6AAE}.bbScore618 i{font-style:normal;font-size:28px}
.bbMvp618{display:flex;align-items:center;gap:10px;justify-content:center;background:#FFF6D8;border:2px solid #F4D58D;border-radius:14px;padding:6px 10px;margin:6px auto;max-width:320px}
.bbMvp618 img{width:90px;height:90px;object-fit:contain;animation:bump .8s}.bbMvp618 b{display:block;font-size:15px;color:#B5701C}.bbMvp618 small{font-size:12px}
@media (max-width:760px){.bbWrap618{flex-direction:column}.bbPanel618{flex:0 0 auto;max-height:none}.bbOpts618 button{min-height:44px;font-size:15px}}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__v618 = {openStadium, get G(){ return G; }, FIELD_POS, answer};
})();

/* =====================================================================
   v6.23：テレビとうを 2×1マスに（おいてあったら トレイへ）・パーキングの そうじ
   ===================================================================== */
(function(){
'use strict';
const VER = '6.23.0', BIG = {tower:[2,1]};
Object.entries(BIG).forEach(([id, sz]) => { const it = ITEM(id); if(it) it.sz = sz; try{ window.__big64.SZ[id] = sz; }catch(e){} });
function migrate(){
  const t = save.town; if(!t || t.big623) return; let n = 0;
  Object.keys(t.cells).forEach(k => { const id = t.cells[k]; if(!BIG[id]) return;
    t.inv[id] = (t.inv[id]||0) + 1; const g = (t.glv||{})[k]; if(g){ t.glvKeep = t.glvKeep || {}; (t.glvKeep[id] = t.glvKeep[id] || []).push(g); delete t.glv[k]; }
    delete t.cells[k]; n++; });
  t.big623 = 1; if(n) t.big623msg = 1; persist();
}
function cleanLots(){ try{ const P = (save.fac||{}).parking || {}; let ch = false; Object.keys(P).forEach(k => { if(window.NOPARK623 && NOPARK623.has(P[k].v)){ delete P[k]; ch = true; } }); if(ch) persist(); }catch(e){} }
renderMap = (orig => function(){ try{ migrate(); cleanLots(); }catch(e){} return orig.apply(this, arguments); })(renderMap);
try{ migrate(); cleanLots(); }catch(e){}
setInterval(() => { const t = save.town; if(curScreen==='town' && t && t.big623msg && !$('#dlg').classList.contains('show') && !document.hidden){ delete t.big623msg; persist();
  dialog(`<div class="dlgArt big">${picHTML(ITEM('tower'))}</div><h2 class="dlgT">📡 テレビとうが 大きく なったよ！</h2><p class="dlgP"><b>2×1マス</b>に なったので、いちど トレイ（もようがえ）に しまったよ。<br>2マス あいている ところに おきなおしてね（★は のこっているよ）。</p>`, [{label:'わかった！', cls:'gold', v:1}], 'wide'); } }, 3000);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   v6.25：効果音（WebAudio で つくる）・選択肢の はみだし・ショップの タブ・しゃかい3・4年 マスターの ごほうび
   ===================================================================== */
(function(){
'use strict';
const VER = '6.25.0';
let AC = null; const ac = () => { if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; } } if(AC.state==='suspended') AC.resume(); return AC; };
const muted = () => !!(save.settings && (save.settings.mute || save.settings.sound===false || save.settings.se===false));
function noise(c, t, dur, f, q, gain){ const n = c.createBuffer(1, Math.ceil(c.sampleRate*dur), c.sampleRate), d = n.getChannelData(0); for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 3);
  const s = c.createBufferSource(); s.buffer = n; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; const g = c.createGain(); g.gain.value = gain; s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); }
function tone(c, t, f, dur, type='sine', gain=.2, f2){ const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .02); }
window.SFX625 = function(kind){
  if(muted()) return; const c = ac(); if(!c) return; const t = c.currentTime + .01;
  if(kind==='bat'){ noise(c, t, .09, 2600, 1.2, 1.4); tone(c, t, 1200, .07, 'square', .12, 500); noise(c, t + .01, .25, 900, .8, .5); }      // カキーン
  else if(kind==='swing'){ noise(c, t, .18, 1200, .7, .5); }
  else if(kind==='mitt'){ noise(c, t, .06, 420, 1.5, 1.6); tone(c, t, 160, .09, 'sine', .35, 70); }                                        // バシッ
  else if(kind==='hit'){ tone(c, t, 880, .08, 'triangle', .2); tone(c, t + .06, 1320, .1, 'triangle', .2); }
  else if(kind==='fanfare'){ [[523,0],[659,.12],[784,.24],[1047,.38],[784,.56],[1047,.68]].forEach(([f,d]) => { tone(c, t + d, f, .3, 'triangle', .22); tone(c, t + d, f/2, .3, 'sine', .12); }); }
};

/* ---------- 選択肢の 文字が はみださない ---------- */
const css = document.createElement('style');
css.textContent = `.dlgCard #dlgBtns .btn{white-space:normal!important;word-break:normal;overflow-wrap:anywhere;line-height:1.25;min-width:0;max-width:100%;box-sizing:border-box}
.dlgCard.quiz #dlgBtns .btn{font-size:clamp(13px,4.4vw,20px);padding:10px 6px}
.dlgCard.quiz #dlgBtns .btn.long625{font-size:clamp(12px,3.6vw,16px)}
.bbOpts618 button{overflow-wrap:anywhere;line-height:1.25}.bbOpts618 button.long625{font-size:13px}
@media (max-width:600px){
  #shopTabs{flex-wrap:nowrap!important;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;padding:4px!important;margin-bottom:8px!important}
  #shopTabs::-webkit-scrollbar{display:none}
  #shopTabs button{flex:none;font-size:0!important;padding:5px 7px!important;gap:0!important;flex-direction:column}
  #shopTabs button img{width:30px!important;height:30px!important;margin:0!important}
  #shopTabs button.on{font-size:10px!important;padding:5px 9px!important}
  #shopTabs button[data-v="ev"]{font-size:22px!important;line-height:30px}
  #shopTabs button[data-v="ev"].on{font-size:10px!important;line-height:1.2}
}`;
document.head.appendChild(css);
const longify = () => document.querySelectorAll('.dlgCard.quiz #dlgBtns .btn, .bbOpts618 button').forEach(b => b.classList.toggle('long625', (b.textContent||'').trim().length > 9));
new MutationObserver(longify).observe(document.body, {childList:true, subtree:true});

/* ---------- しゃかい 3・4年を ぜんぶ マスター → 超レアかくていレター＋10,000pt ---------- */
async function checkSoc34(){
  if(!save || save.socMaster34) return;
  const ks = Object.keys(SOC_LV).filter(k => SOC_LV[k]===1 && MATH_UNITS[k]); if(!ks.length) return;
  if(!ks.every(k => unitStar(k) >= 3)) return;
  save.socMaster34 = dayKey(); save.superLetter = (save.superLetter||0) + 1; const p = givePts(10000, 'しゃかい 3・4年 ぜんぶ マスター'); persist();
  confetti(3500); SFX625('fanfare');
  await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('itm_superletter'))}" alt=""></div><h2 class="dlgT">🗾 しゃかい 3・4年 ぜんぶ マスター！</h2>
    <p class="dlgP">${ks.length}この たんげんを ぜんぶ マスターしたよ！<br><b>超レアかくていレター 1まい</b> と <span class="coin sm">P</span> <b>${nf(p)}</b> を もらったよ！</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
}
window.__soc34 = checkSoc34;
show = (orig => function(name){ const o = orig.apply(this, arguments); if(name==='soc' || name==='home' || name==='subject') setTimeout(() => { try{ checkSoc34(); }catch(e){} }, 600); return o; })(show);
try{ renderSoc = (orig => function(){ const o = orig.apply(this, arguments); try{ const ks = Object.keys(SOC_LV).filter(k => SOC_LV[k]===1 && MATH_UNITS[k]), n = ks.filter(k => unitStar(k) >= 3).length;
  if(!save.socMaster34 && $('#sUnits') && !$('#sUnits .soc34')) $('#sUnits').insertAdjacentHTML('afterbegin', `<div class="soc34 note">🎁 3・4年の たんげんを ぜんぶ ★3（マスター）に すると 超レアかくていレター＋10,000pt！（${n}/${ks.length}）</div>`); }catch(e){} return o; })(renderSoc); }catch(e){}
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.26：スマホの 画面を すっきり（まち・わたしの家・ずかん・ショップ）
   ・まち：ロゴを ちいさく、まち地図を いちばん 上に、数字や お願いは 下へ
   ・わたしの家／ずかん：ロゴを ちいさく、よけいな 余白を へらす
   ・ショップ：タブが はみださない
   ===================================================================== */
(function(){
'use strict';
const VER = '6.26.0';
const css = document.createElement('style');
css.textContent = `
@media (max-width:700px){
  /* ---- ロゴは ちいさく ---- */
  .scrLogo{width:min(34%,150px)!important;margin:-2px auto 2px!important}
  #scr-shop .scrLogo,#scr-record .scrLogo,#scr-zukan .scrLogo,#scr-subject .scrLogo{width:min(30%,130px)!important;margin:-2px auto 0!important}
  .screen>.card:first-of-type{margin-top:4px}
  .screen{gap:8px}

  /* ---- まち：ならびかえ ---- */
  #scr-town.active{display:flex;flex-direction:column;gap:6px}
  #scr-town>.scrLogo{display:none!important}
  #scr-town .townTop{display:contents}
  #scr-town #townHead{order:1;padding:6px 10px!important;gap:8px!important;flex-wrap:nowrap!important;align-items:center}
  #scr-town #townHead .lvBadge{width:46px!important;height:46px!important;flex:none}
  #scr-town #townHead .lvBadge small{font-size:9px}#scr-town #townHead .lvBadge b{font-size:20px}
  #scr-town #townHead{flex-wrap:wrap!important}
  #scr-town #townHead .tInfo{min-width:0;flex:1 1 0}
  #scr-town #townHead .townName{display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
  #scr-town #townHead .townName span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}
  #scr-town #townHead .tName{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #scr-town #townHead .tSize{white-space:nowrap}
  #scr-town #townHead .ghostBtn{flex:1 1 100%!important;order:5;padding:4px 8px!important;font-size:12px!important;margin:0!important}
  #scr-town #townHead .lvUpBtn{order:4}
  #scr-town #townHead .tName{font-size:15px!important;line-height:1.2}
  #scr-town #townHead .townName{font-size:11px}
  #scr-town #townHead .tprog{margin-top:2px}
  #scr-town #townHead .tprog>span,#scr-town #townHead .tprog small{display:none}
  #scr-town #townHead .tprog .pr{display:none}
  #scr-town #townHead .tprog .pr:first-of-type{display:flex!important;font-size:10px;margin:0}
  #scr-town #townHead .lvUpBtn{flex:none;padding:6px 10px!important;font-size:12px!important}
  #scr-town .zoomBar{order:2;margin:0!important}
  #scr-town #townMapWrap{order:3}
  #scr-town #townTray{order:4}
  #scr-town .townBtns{order:5;display:grid!important;grid-template-columns:repeat(4,1fr);gap:6px!important;margin:0!important}
  #scr-town .townBtns .btn{font-size:11px!important;padding:6px 2px!important;flex-direction:column;gap:0;line-height:1.15;min-width:0;white-space:normal}
  #scr-town .townBtns .btn img{width:26px!important;height:26px!important;margin:0!important}
  #scr-town .townBtns #btnHarvest{grid-column:1 / -1;order:5;font-size:11px!important;padding:4px 8px!important;flex-direction:row;min-height:0}
  #scr-town .townBtns{gap:4px!important}
  #scr-town .townBtns .btn{min-height:0}
  #scr-town #reqPanel{order:6}
  #scr-town #townStats{order:7;grid-template-columns:repeat(3,1fr)!important;gap:5px!important;padding:6px!important}
  #scr-town #townStats .tstat{padding:4px 6px!important;border-radius:12px!important}
  #scr-town #townStats .tstat span{font-size:10px!important;line-height:1.2}
  #scr-town #townStats .tstat b{font-size:13px!important}
  #scr-town #reqPanel .card,#scr-town #reqPanel>*{margin:0}
  #scr-town #townMapWrap{max-height:calc(100vh - 56px - 66px - 94px - 46px - 108px)!important;min-height:300px;overflow:auto!important;touch-action:pan-x pan-y!important;-webkit-overflow-scrolling:touch}   /* ヘッダー・タブ・ボタンぶんを ひいた 高さ。まちの なかだけ スクロール */
  #scr-town .townBtns{margin-top:2px!important}
  .zoomBar small{display:none!important}

  /* ---- わたしの家 ---- */
  #scr-myhome>.card:first-of-type{padding:8px 12px!important}
  #scr-myhome .scrLogo{display:none!important}
  #scr-myhome .homeLogo{width:min(34%,140px)!important;max-width:140px!important;margin:0 auto 2px!important;display:block}
  #homeHead>*{margin-top:4px!important;margin-bottom:4px!important}
  #scr-myhome .townBtns{display:grid!important;grid-template-columns:1fr 1fr;gap:6px!important;margin:0!important}
  #scr-myhome .townBtns .btn{padding:8px 6px!important;font-size:14px!important}
  #scr-myhome #viewSeg{margin:0!important}
  #scr-myhome .homeStat,#scr-myhome .hmStats{gap:4px!important}

  /* ---- ずかん ---- */
  #scr-zukan>.card{padding:8px 10px!important}
  #zukanHead{gap:6px}
  #zukanHead .zkRing{width:62px!important;height:62px!important}
  #zukanHead .btn{font-size:12px!important;padding:6px 8px!important}
  .zkTabs{gap:5px!important}.zkTabs button{padding:4px 6px!important;font-size:12px}
  #zukanNote{margin:2px 0!important;font-size:11px}
  .zkGrid{gap:8px!important}

  /* ---- ショップ ---- */
  #shopTabs{max-width:100%;box-sizing:border-box}
  #scr-shop .card{max-width:100%;overflow:hidden}
  #scr-shop #shopTabs{width:100%;margin-left:0;margin-right:0;position:relative;scroll-snap-type:x proximity;mask-image:linear-gradient(90deg,#000 88%,transparent 100%);-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent 100%)}
  #scr-shop #shopTabs button{scroll-snap-align:start}
  #scr-shop #shopTabs button img{width:26px!important;height:26px!important}
  #scr-shop #shopTabs button{padding:4px 5px!important}
  #scr-shop #shopTabs button.on{padding:4px 8px!important}
}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.26（つづき）
   ・ずかんに「さかな」タブ（釣った 魚が のる）
   ・やきゅう：選手を 住民から えらべる／おんがく（BGM・最終回の 逆転チャンスは もりあがる 曲）
   ===================================================================== */
(function(){
'use strict';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- ずかん：さかな ---------- */
try{
  const FISHES = (window.__v614 && window.__v614.FISH) || [];
  if(FISHES.length && !ZUKAN_CATS.some(c => c.id==='fish')){
    ZUKAN_CATS.splice(ZUKAN_CATS.length - 1, 0, {id:'fish', n:'さかな', i:'🐟', list:() => FISHES.map(f => ({id:'fsh_' + f.id, name:f.n, fish:f, art:null, lv:1, rar:f.w <= 5 ? 3 : 1}))});
  }
  const _zs = zukanSync;
  zukanSync = function(){ try{ const z = zk(), C = (save.fish70 && save.fish70.caught) || {}; FISHES.forEach(f => { if(C[f.id] && !z.f['fsh_' + f.id]) z.f['fsh_' + f.id] = Date.now(); }); }catch(e){} return _zs.apply(this, arguments); };
  picHTML = (orig => function(o, cls){ if(o && o.fish){ const f = o.fish; return window.__v614 ? window.__v614.fishSVG(f, 70) : ''; } return orig.apply(this, arguments); })(picHTML);
  renderZukan = (orig => function(){ try{ zukanSync(); }catch(e){} const r = orig.apply(this, arguments);
    try{ if(zukanTab==='fish'){ $('#zukanNote').textContent = '港で つりあげると ずかんに のるよ。✨は レアな 魚！'; $$('#zukanGrid .zkCard').forEach(b => { const f = FISHES.find(x => 'fsh_' + x.id === b.dataset.id); if(!f) return; const got = b.classList.contains('got'), n = ((save.fish70||{}).caught||{})[f.id]||0;
        const im = b.querySelector('.zkImg svg, .zkImg img'); if(im && !got) im.style.filter = 'brightness(0) opacity(.25)';
        const r2 = b.querySelector('.zkRar'); if(r2) r2.textContent = got ? `${f.w <= 5 ? '✨レア ' : ''}${n}ひき` : (f.w <= 5 ? '✨ レア' : 'ふつう'); }); } }catch(e){}
    return r; })(renderZukan);
}catch(e){ console.warn('zukan fish', e); }
document.addEventListener('click', async e => {
  if(curScreen!=='zukan' || zukanTab!=='fish') return; const b = e.target.closest('.zkCard'); if(!b) return;
  const f = ((window.__v614 && window.__v614.FISH) || []).find(x => 'fsh_' + x.id === b.dataset.id); if(!f) return; e.stopImmediatePropagation();
  const n = ((save.fish70||{}).caught||{})[f.id]||0;
  await dialog(n ? `<div class="dlgArt">${window.__v614.fishSVG(f, 160)}</div><h2 class="dlgT">${f.w <= 5 ? '✨ ' : ''}${X(f.n)}</h2><p class="dlgP">${X(f.note)}<br><small>おおきさ：${X(f.size)}　つった かず：${n}ひき</small></p>` : `<div class="dlgArt"><div style="filter:brightness(0) opacity(.25)">${window.__v614.fishSVG(f, 160)}</div></div><h2 class="dlgT">？？？</h2><p class="dlgP">みなとで つりあげると わかるよ。${f.w <= 5 ? '<br>✨ レアな 魚だよ！' : ''}</p>`, [{label:'とじる', v:1}]);
}, true);

/* ---------- やきゅう：選手を えらぶ ---------- */
const BB = () => save.bbPick || (save.bbPick = []);
async function pickPlayers(){
  const all = (save.town?.res||[]).filter(r => { const s = SP(r.sp); return s.img || artSrc(s.art); });
  const sel = new Set(BB().filter(id => all.some(r => r.id===id)));
  const draw = () => `<h2 class="dlgT">⚾ 出る 選手を えらぶ</h2><p class="dlgP facNote">9人まで（1ばんから じゅんばん）。えらばないと じどうで きまるよ</p>
    <div class="pick621">${all.map(r => { const s = SP(r.sp), i = [...sel].indexOf(r.id); return `<button data-pk="${r.id}" class="${i>=0 ? 'on' : ''}"><img src="${X(s.img || artSrc(s.art))}" alt=""><b>${X(r.name)}</b><small>💪${r.bbPower||1}</small>${i>=0 ? `<i>${i+1}</i>` : ''}</button>`; }).join('')}</div>
    <p class="dlgP facNote">${sel.size} / 9人</p>`;
  return new Promise(res => { let done = false;
    dialog(draw(), [{label:'⚾ これで いく！', cls:'gold', v:'ok'}, {label:'じどうに もどす', cls:'white', v:'auto'}], 'wide').then(v => { done = true; document.removeEventListener('click', onPk, true); if(v==='auto'){ save.bbPick = []; persist(); } else if(v==='ok'){ save.bbPick = [...sel]; persist(); } res(v); });
    function onPk(ev){ const b = ev.target.closest('#dlgBody [data-pk]'); if(!b || done) return; ev.stopImmediatePropagation(); ev.preventDefault(); const id = b.dataset.pk;
      if(sel.has(id)) sel.delete(id); else if(sel.size < 9) sel.add(id); else toast('9人までだよ');
      const sc = $('#dlgBody .pick621'); const top = sc ? sc.scrollTop : 0; $('#dlgBody').innerHTML = draw(); const n = $('#dlgBody .pick621'); if(n) n.scrollTop = top; }
    document.addEventListener('click', onPk, true);
  });
}
window.__bbPick = pickPlayers;
/* ロビーに「選手を えらぶ」ボタンを たす */
dialog = (orig => function(html, btns, cls){
  try{ if(typeof html==='string' && html.includes('まなびスタジアム</h2>') && Array.isArray(btns) && !btns.some(b => b.v==='pick')){ btns = btns.slice(); btns.splice(btns.findIndex(b => b.v==='play') + 1, 0, {label:'👥 選手を えらぶ', cls:'white', v:'pick'}); } }catch(e){}
  return orig.call(this, html, btns, cls); })(dialog);
document.addEventListener('click', async e => {
  const b = e.target.closest('#dlgBtns button'); if(!b || !/選手を えらぶ/.test(b.textContent)) return; e.stopImmediatePropagation(); e.preventDefault();
  $('#dlg').classList.remove('show'); const key = Object.keys(save.town.cells).find(k => save.town.cells[k]==='stadium') || '0,0';
  await W(120); await pickPlayers(); await W(120); window.__v618.openStadium(key);
}, true);
const W = ms => new Promise(r => setTimeout(r, ms));

/* ---------- やきゅう：おんがく ---------- */
let AC = null, MUS = null;
const ac = () => { if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; } } if(AC.state==='suspended') AC.resume(); return AC; };
const muted = () => !!(save.settings && (save.settings.mute || save.settings.sound===false || save.settings.bgm===false));
const N = {C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,C3:130.81,G3:196,F3:174.61,E3:164.81,A3:220,D3:146.83,B3:246.94,R:0};
const SONGS = {
  play:{bpm:132, lead:'C5 E5 G5 E5 C5 E5 G5 R  D5 F5 A5 F5 D5 F5 A5 R  E5 G5 C5 G5 E5 G5 C5 R  D5 B4 G4 B4 D5 R C5 R'.split(' '), bass:'C3 R G3 R C3 R G3 R  D3 R A3 R D3 R A3 R  E3 R G3 R E3 R G3 R  G3 R G3 R C3 R C3 R'.split(' '), gain:.07},
  chance:{bpm:164, lead:'E5 E5 G5 E5 C5 E5 G5 A5  G5 E5 G5 A5 C5 C5 A5 G5  F5 F5 A5 F5 D5 F5 A5 C5  B4 D5 G5 B4 D5 G5 C5 R'.split(' '), bass:'C3 C3 G3 G3 C3 C3 G3 G3  F3 F3 C3 C3 F3 F3 C3 C3  D3 D3 A3 A3 D3 D3 A3 A3  G3 G3 G3 G3 C3 C3 C3 C3'.split(' '), gain:.095},
  win:{bpm:150, lead:'C5 E5 G5 C5 E5 G5 C5 E5 G5 C5 R R'.split(' '), bass:'C3 G3 C3 G3 C3 G3 C3 G3 C3 R R R'.split(' '), gain:.09, once:true}
};
function startBGM(name){
  stopBGM(); if(muted()) return; const c = ac(); if(!c) return; const S = SONGS[name]; if(!S) return;
  const dur = 60/S.bpm/2, master = c.createGain(); master.gain.value = 1; master.connect(c.destination);
  let step = 0, nextT = c.currentTime + .05, timer = null; const m = {name, master, stop:false};
  const note = (f, t, d, type, g) => { if(!f) return; const o = c.createOscillator(), gg = c.createGain(); o.type = type; o.frequency.value = f; gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(g, t + .01); gg.gain.exponentialRampToValueAtTime(.0008, t + d*.92); o.connect(gg); gg.connect(master); o.start(t); o.stop(t + d); };
  const sched = () => { if(m.stop) return; while(nextT < c.currentTime + .4){ const i = step % S.lead.length;
      note(N[S.lead[i]], nextT, dur, 'square', S.gain); note(N[S.bass[i]], nextT, dur, 'triangle', S.gain*1.4);
      if(name==='chance' && i % 2===0){ const o = c.createOscillator(), g2 = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, nextT); o.frequency.exponentialRampToValueAtTime(50, nextT + .12); g2.gain.setValueAtTime(S.gain*3, nextT); g2.gain.exponentialRampToValueAtTime(.001, nextT + .13); o.connect(g2); g2.connect(master); o.start(nextT); o.stop(nextT + .14); }
      step++; nextT += dur; if(S.once && step >= S.lead.length){ m.stop = true; clearInterval(timer); break; } } };
  timer = setInterval(sched, 120); sched(); m.timer = timer; MUS = m;
}
function stopBGM(){ if(!MUS) return; const m = MUS; MUS = null; m.stop = true; clearInterval(m.timer); try{ m.master.gain.setTargetAtTime(0, ac().currentTime, .08); }catch(e){} }
window.__bgm = {startBGM, stopBGM};

/* 試合に あわせて 曲を きりかえる */
const watch = () => {
  const G = window.__v618 && window.__v618.G;
  if(!G){ if(MUS && MUS.name!=='win') stopBGM(); return; }
  const want = G.chance && G.inning===2 ? 'chance' : 'play';
  if(!MUS || (MUS.name!==want && MUS.name!=='win')) startBGM(want);
};
setInterval(watch, 500);
/* しょうりの ファンファーレ：試合が おわった しゅんかんに かった ときだけ */
let lastG = null;
setInterval(() => { const G = window.__v618 && window.__v618.G; if(G){ lastG = {score:G.score, opp:G.cold ? G.opp.slice(0, G.oppShown).reduce((a,b) => a+b, 0) : G.opp.reduce((a,b) => a+b, 0), walk:G.walkoff}; return; }
  if(lastG){ const L = lastG; lastG = null; stopBGM(); if(L.score > L.opp || L.walk) setTimeout(() => startBGM('win'), 150); } }, 300);
window.addEventListener('pagehide', stopBGM); document.addEventListener('visibilitychange', () => { if(document.hidden) stopBGM(); });

const css = document.createElement('style');
css.textContent = `.pick621{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:46vh;overflow-y:auto;overflow-x:hidden;margin:6px 0}
.pick621 button{position:relative;display:flex;flex-direction:column;align-items:center;background:#F3FAFF;border:2.5px solid #BFE3FB;border-radius:12px;padding:3px 2px;font:inherit;color:inherit;cursor:pointer;min-width:0}
.pick621 button.on{border-color:#F2A33A;background:#FFF3D6}.pick621 img{width:100%;max-width:52px;height:52px;object-fit:contain}
.pick621 b{font-size:10.5px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pick621 small{font-size:10px;color:#C66F0A}
.pick621 i{position:absolute;right:2px;top:1px;font-style:normal;font-size:11px;font-weight:900;background:#F2A33A;color:#fff;border-radius:50%;width:17px;height:17px;line-height:17px;text-align:center}`;
document.head.appendChild(css);
})();

/* =====================================================================
   まなびタウン v6.27：ショップの「イベント」・わたしの家（ボタンと 枠の かさなり・部屋えらびを コンパクトに）
   ===================================================================== */
(function(){
'use strict';
const VER = '6.27.0';
const css = document.createElement('style');
css.textContent = `
@media (max-width:700px){
  /* ---- ショップ：イベントの 文字を おさえる ---- */
  #shopTabs button[data-v="ev"]{font-size:0!important;line-height:0!important;padding:4px 6px!important;width:auto;min-width:36px;gap:0!important;justify-content:center;align-items:center}
  #shopTabs button[data-v="ev"]::before{content:"🎉";font-size:20px;line-height:26px;width:26px;height:26px;text-align:center;display:block}
  #shopTabs button[data-v="ev"].on{font-size:10px!important;line-height:1.2!important;flex-direction:column;padding:4px 8px!important;white-space:nowrap}
  #shopTabs button[data-v="ev"].on::before{content:none}
  #shopTabs button[data-v="ev"] *{font-size:0!important}

  /* ---- わたしの家：ボタンと 枠の かさなりを なくす ---- */
  #scr-myhome.active{display:flex;flex-direction:column;gap:10px}
  #scr-myhome .townBtns{margin:4px 0 6px!important;gap:8px!important;position:relative;z-index:1}
  #scr-myhome #homeHead{margin-bottom:2px}
  #scr-myhome .townBtns .btn{box-shadow:0 3px 0 rgba(0,0,0,.12)!important;margin:0!important}
  #scr-myhome .townBtns #btnCafe46{grid-column:1 / -1;width:100%;min-height:0;padding:8px 6px!important}
  #scr-myhome #roomBarBox{margin-top:4px;position:relative;z-index:0}

  /* ---- 1F・2F・3Fの 部屋えらび：コンパクトに ---- */
  .roomBar{margin:0 0 6px!important}
  .roomBar .rbHouse{gap:4px!important;padding:6px!important;border-radius:14px!important}
  .rbFloor{gap:4px!important}
  .rbF{width:24px!important;font-size:11px!important;border-radius:8px!important}
  .rbRoom{padding:2px 3px!important;border-radius:9px!important;flex-direction:row!important;flex-wrap:wrap;justify-content:center;align-items:center;gap:0 3px!important;font-size:11px!important;min-height:0;line-height:1.15}
  .rbRoom i{font-size:15px!important}
  .rbRoom span{font-size:11px;max-width:calc(100% - 20px)}
  .rbRoom small{display:none!important}
  .rbRoom.rcan small{display:inline!important;font-size:9px;flex:1 1 100%;text-align:center}

  /* ---- 「すてき度を 上げるには？」は なくす ---- */
  #btnHomeTips{display:none!important}
  #scr-myhome .hBtns{grid-template-columns:1fr!important}
  #scr-myhome .hBtns .btn{width:100%}
}`;
document.head.appendChild(css);
/* 説明ボタンの クリックも むこうに */
document.addEventListener('click', e => { if(e.target.closest('#btnHomeTips')){ e.stopImmediatePropagation(); e.preventDefault(); } }, true);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.28：まち画面の つかいやすさ・ショップの イベントを イラストに
   ・まち：ボタンを まちの 上へ（スクロールしなくても とどく）・「わたしの家」ボタンは なし
           まちを たてに 広く・もようがえの トレーは ついてこない（まちの すぐ上に おく）
           「⬇」ボタンで おねがい・じょうほうへ ひとっとび
   ===================================================================== */
(function(){
'use strict';
const VER = '6.28.0';
DEFAULT_ART.ui_event = './assets/images/v628/ui_event.webp';
function evIcon(){ const b = document.querySelector('#shopTabs button[data-v="ev"]'); if(!b || b.querySelector('img')) return; b.innerHTML = `<img alt="" data-art="ui_event" src="${DEFAULT_ART.ui_event}">イベント`; }
evIcon(); renderShop = (orig => function(){ evIcon(); return orig.apply(this, arguments); })(renderShop);
/* したへ とぶ ボタン */
function addJump(){ const z = document.querySelector('#scr-town .zoomBar'); if(!z || z.querySelector('.jump628')) return;
  z.insertAdjacentHTML('beforeend', '<button class="roundBtn jump628" type="button" title="おねがい・じょうほうへ">⬇</button>'); }
document.addEventListener('click', e => { const b = e.target.closest('.jump628'); if(!b) return; e.preventDefault();
  const t = document.querySelector('#reqPanel'); const top = (t && t.offsetHeight ? t : document.querySelector('#townStats')).getBoundingClientRect().top + scrollY - 64; window.scrollTo({top, behavior:'smooth'}); }, true);
function harvestProxy(){ const h = document.querySelector('#btnHarvest'), sc = document.querySelector('#scr-town'); if(!h || !sc) return; let p = document.querySelector('#btnHarvest628');
  if(!p){ sc.insertAdjacentHTML('beforeend', '<button class="btn green" id="btnHarvest628" type="button"></button>'); p = document.querySelector('#btnHarvest628'); p.onclick = () => { const H = document.querySelector('#btnHarvest'); if(H && !H.disabled) H.click(); setTimeout(harvestProxy, 200); }; }
  p.innerHTML = h.innerHTML; p.disabled = h.disabled; }
renderTown = (orig => function(){ const o = orig.apply(this, arguments); try{ addJump(); harvestProxy(); }catch(e){} return o; })(renderTown);
const css = document.createElement('style');
css.textContent = `
#shopTabs button[data-v="ev"]::before{content:none!important;display:none!important}
#shopTabs button[data-v="ev"] img{width:28px;height:28px;object-fit:contain;vertical-align:middle;margin-right:2px}
@media (max-width:700px){
  #shopTabs button[data-v="ev"]{line-height:normal!important}
  #shopTabs button[data-v="ev"] img{width:26px!important;height:26px!important;margin:0!important;font-size:initial}
  #shopTabs button[data-v="ev"].on{font-size:10px!important}

  /* ---- まち：ボタンを 上へ ---- */
  #scr-town #btnToHome{display:none!important}
  #scr-town .townBtns{order:2!important;grid-template-columns:repeat(3,1fr)!important}
  #scr-town .zoomBar{order:3!important}
  #scr-town #townTray{order:4!important}
  #scr-town #townMapWrap{order:5!important;height:calc(100vh - 262px - 66px)!important;max-height:none!important;min-height:330px;overscroll-behavior:auto}
  #scr-town #reqPanel{order:6!important}#scr-town #townStats{order:7!important}
  #scr-town .townBtns #btnHarvest{display:none!important}
  #scr-town #btnHarvest628{order:6;width:100%;font-size:12px!important;padding:6px 8px!important;margin:0!important}
  .jump628{margin-left:auto!important;font-size:16px!important}

  /* ---- もようがえの トレー：ついてこない ---- */
  #scr-town #townTray{position:static!important;bottom:auto!important;margin:0!important;border-radius:16px!important;max-height:none!important;box-shadow:0 2px 8px rgba(0,0,0,.08)!important;padding:6px 8px!important}
}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.29：まち画面の 調整・ロゴを もどす・イベントの イラスト
   ===================================================================== */
(function(){
'use strict';
const VER = '6.29.0';
DEFAULT_ART.ui_event = './assets/images/v629/ui_event.webp';
/* ---------- ショップの イベント：ほかの タブと おなじ 高さ・おなじ 位置 ---------- */
function evIcon(){ const b = document.querySelector('#shopTabs button[data-v="ev"]'); if(!b) return; const im = b.querySelector('img'); if(im && im.dataset.art==='ui_event' && im.src.includes('v629')) return;
  b.innerHTML = `<img alt="" data-art="ui_event" src="${DEFAULT_ART.ui_event}">イベント`; }
evIcon(); renderShop = (orig => function(){ const o = orig.apply(this, arguments); try{ evIcon(); }catch(e){} return o; })(renderShop);

/* ---------- まち：ロゴを もどす（村の名前の みぎの すきま） ---------- */
function townLogo(){ const h = document.querySelector('#townHead'); if(!h) return; let l = h.querySelector('.tlogo629');
  if(!l){ h.insertAdjacentHTML('afterbegin', `<img class="tlogo629" alt="まちづくり" src="${artSrc('logo_town') || './assets/images/image_875_582e8701.webp'}">`); } }
renderTown = (orig => function(){ const o = orig.apply(this, arguments); try{ townLogo(); }catch(e){} return o; })(renderTown);

const css = document.createElement('style');
css.textContent = `
/* ---- ショップ：イベントを ほかの タブと そろえる ---- */
#shopTabs button[data-v="ev"]{width:auto;min-width:0;padding:4px 5px!important}
#shopTabs button[data-v="ev"] img{width:26px!important;height:26px!important;object-fit:contain;margin:0!important;display:block;flex:none}
@media (max-width:700px){
  #shopTabs button{display:inline-flex!important;flex-direction:column;align-items:center;justify-content:flex-start;height:46px;box-sizing:border-box;padding-top:4px!important}
  #shopTabs button img{height:26px!important;width:26px!important;object-fit:contain}
  #shopTabs button[data-v="ev"]{font-size:0!important;line-height:0!important}
  #shopTabs button[data-v="ev"].on{font-size:10px!important;line-height:1.2!important}

  /* ---- まち ---- */
  #scr-town #townHead{position:relative;padding:6px 10px 6px 10px!important;min-height:0}
  #scr-town #townHead .tlogo629{display:block;position:absolute;right:8px;top:4px;height:48px;width:auto;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.15))}
  #scr-town #townHead .tInfo{padding-right:104px}
  #scr-town #townHead .lvUpBtn{margin-right:0}
  #scr-town #townHead .ghostBtn{padding:3px 8px!important;font-size:11px!important}
  /* ボタンと ズーム行の すきま */
  #scr-town{gap:10px!important}
  #scr-town .townBtns{margin-bottom:2px!important}
  #scr-town .zoomBar{margin-top:2px!important;padding:2px 0!important;gap:10px!important}
  /* まちを たてに ひろく（400px ぐらい）。がめん ぜんたいで スクロールする */
  #scr-town #townMapWrap{height:max(400px,calc(100vh - 262px - 66px))!important;min-height:400px!important}
  /* もようがえの トレー：ついてくる。ただし ちいさく */
  #scr-town #townTray{position:fixed!important;left:8px!important;right:8px!important;bottom:calc(66px + env(safe-area-inset-bottom))!important;top:auto!important;margin:0!important;max-height:104px!important;overflow-y:auto;padding:3px 8px 4px!important;border-radius:14px!important;z-index:45!important;box-shadow:0 -2px 10px rgba(0,0,0,.18)!important;order:9}
  #scr-town.active:has(#townTray:not(.hidden)){padding-bottom:116px}
  #scr-town #townTray .trayTop{margin-bottom:2px!important;font-size:10.5px!important;line-height:1.25}
  #scr-town #townTray .trayTop .btn{padding:3px 8px!important;font-size:11px!important;min-height:0}
  #scr-town #townTray #trayItems,#scr-town #townTray .trayRow{gap:4px!important}
  #scr-town #townTray .trayIt{padding:2px!important;border-radius:10px!important}
  #scr-town #townTray .trayIt img,#scr-town #townTray .trayIt .bimg{max-height:36px!important;width:auto!important;max-width:100%}
  #scr-town #townTray .trayIt small,#scr-town #townTray .trayIt b{font-size:9px!important;line-height:1.1}
  #scr-town #townTray .trayGrip{padding:0!important;font-size:10px}
  #scr-town #townTray.mini{max-height:44px!important}
}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.30：まち画面を すっきり・ズームで ずれない・わたしの家の アイコン・電車
   ・まち：レベルアップまでの「勉強ポイント・発展度・こうつう」を あと いくつ で 見せる
           じゅうみん／のりものの かずは まちづくりから はずす（ショップ・じゅうみん画面で 見られる）
           住民の おねがいは まちの 下に かさねて 出す（たためる）
           きょうの うりあげは うけとれる ときだけ まちの 上に 出す
           まちは いちばん 下・たてに もっと ながく
   ・学校の 上の「じゅぎょう中」は 出さない
   ・「かるい表示」の ときも 電車は はしる
   ・わたしの家：ちしき／家具／おきゃくさん と 部屋の アイコンを イラストに
   ・ショップ：イベントの アイコンを すこし 上に
   ===================================================================== */
(function(){
'use strict';
const VER = '6.30.0', IMG = './assets/images/v630/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const N = s => +(String(s||'').replace(/[^\d.]/g,'')) || 0;
const fmt = n => (typeof nf==='function' ? nf(n) : String(n));
const mobile = () => innerWidth <= 700;
const LS = 'mt_req630';

/* ---------- まち：上の じょうほう（レベルアップまで あと いくつ） ---------- */
function head630(){
  const h = document.querySelector('#townHead'); if(!h) return;
  const tp = h.querySelector('.tprog');
  if(tp && tp.parentElement!==h){ const ti = h.querySelector('.tInfo'); ti ? ti.after(tp) : h.appendChild(tp); }
  if(tp) tp.querySelectorAll('.pr').forEach(pr => {
    const em = pr.querySelector('em'); if(!em || em.dataset.v630) return;
    const m = em.textContent.split('/'); if(m.length < 2) return;
    const a = N(m[0]), b = N(m[1]), left = Math.max(0, b - a);
    em.dataset.v630 = 1; em.title = em.textContent;
    em.innerHTML = left > 0 ? `あと <b>${fmt(left)}</b>` : '✔ OK！';
    pr.classList.toggle('ok630', left <= 0);
  });
  /* のこりの じょうほう（ちしき・うりあげ・まなびの力）は 小さな チップに */
  const st = document.querySelector('#townStats'); let ch = h.querySelector('.chips630');
  if(!ch){ h.insertAdjacentHTML('beforeend', '<div class="chips630"></div>'); ch = h.querySelector('.chips630'); }
  const hasPr = !!(tp && tp.querySelector('.pr'));
  const items = st ? [...st.querySelectorAll('.tstat')].filter(e => { const t = e.textContent;
    if(/じゅうみん|のりもの/.test(t)) return false; if(hasPr && /発展度|こうつう/.test(t)) return false; return true; }) : [];
  ch.innerHTML = items.map(e => { const sp = e.querySelector('span'), b = e.querySelector('b'); return `<span class="chip630">${sp ? sp.innerHTML.replace('ちしき ボーナス', 'ちしき') : ''}<b>${b ? b.innerHTML : ''}</b></span>`; }).join('');
  ch.classList.toggle('hidden', !items.length);
}

/* ---------- まちの わく（うりあげ・おねがいを かさねる） ---------- */
function box630(){
  const wrap = document.querySelector('#townMapWrap'); if(!wrap) return null;
  let box = document.querySelector('#mapBox630');
  if(!box){
    box = document.createElement('div'); box.id = 'mapBox630';
    wrap.parentNode.insertBefore(box, wrap);
    box.insertAdjacentHTML('afterbegin', '<div id="harv630" class="hidden"><div class="in630"><button type="button" class="btn green harvBtn630"></button></div></div>');
    box.appendChild(wrap);
    box.insertAdjacentHTML('beforeend', '<div id="req630" class="hidden"><div class="in630"><button type="button" class="reqHd630"></button><div class="reqBody630"></div></div></div>');
    const rp = document.querySelector('#reqPanel'); if(rp) box.querySelector('.reqBody630').appendChild(rp);
    box.querySelector('.harvBtn630').addEventListener('click', e => { e.preventDefault(); const H = document.querySelector('#btnHarvest'); if(H && !H.disabled) H.click(); setTimeout(harv630, 120); });
    box.querySelector('.reqHd630').addEventListener('click', e => { e.preventDefault(); const open = localStorage.getItem(LS)!=='0'; localStorage.setItem(LS, open ? '0' : '1'); req630(); });
    if(window.MutationObserver && rp) new MutationObserver(() => req630()).observe(rp, {childList:true, subtree:true});
  }
  return box;
}
function harv630(){
  const box = box630(); if(!box) return; const H = document.querySelector('#btnHarvest'), el = box.querySelector('#harv630');
  const on = !!(H && !H.disabled && !(typeof townEdit!=='undefined' && townEdit));
  el.classList.toggle('hidden', !on);
  if(on){ const b = el.querySelector('.harvBtn630'), t = H.textContent.replace(/^\s*🎁\s*/, '').trim(); b.innerHTML = `<span class="gift630">🎁</span><span>きょうの ${X(t)}</span>`; }
}
function req630(){
  const box = box630(); if(!box) return; const el = box.querySelector('#req630'), rp = document.querySelector('#reqPanel'); if(!el || !rp) return;
  const rows = rp.querySelectorAll('.reqRow'), done = rp.querySelectorAll('.reqRow.done').length;
  /* 1行目：だれ・おねがい（…で きる）／2行目：すすみぐあい */
  rp.querySelectorAll('.reqRow .reqT').forEach(t => { if(t.querySelector('.l1-630')) return; const bar = t.querySelector('.misBar'), sm = t.querySelector('small');
    const l1 = document.createElement('span'); l1.className = 'l1-630'; [...t.childNodes].filter(n => n!==bar && n!==sm).forEach(n => l1.appendChild(n));
    const l2 = document.createElement('span'); l2.className = 'l2-630'; if(bar) l2.appendChild(bar); if(sm) l2.appendChild(sm);
    t.appendChild(l1); t.appendChild(l2); });
  const on = rows.length > 0 && !(typeof townEdit!=='undefined' && townEdit);
  el.classList.toggle('hidden', !on); if(!on) return;
  const open = localStorage.getItem(LS)!=='0';
  el.classList.toggle('closed', !open);
  const ic = typeof artSrc==='function' ? artSrc('ui_letter') : '';
  el.querySelector('.reqHd630').innerHTML = `${ic ? `<img src="${X(ic)}" alt="">` : '💌'}<span>じゅうみんの おねがい</span><b class="n630">${rows.length}</b>${done ? '<em class="done630">🎁 ほうこく できるよ</em>' : ''}<i class="arw630">${open ? '▼' : '▲'}</i>`;
}

/* ---------- まちの 高さ：がめんの 下まで（さいてい 480px） ---------- */
let lastH = 0;
function fit630(force){
  const wrap = document.querySelector('#townMapWrap'), box = document.querySelector('#mapBox630');
  if(!wrap || !box || typeof curScreen==='undefined' || curScreen!=='town') return;
  const nav = document.querySelector('#bnav'), navH = nav && getComputedStyle(nav).display!=='none' ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty('--nav630', navH + 'px');
  if(!mobile()){ wrap.style.removeProperty('height'); wrap.style.removeProperty('min-height'); lastH = 0; return; }
  const top = box.getBoundingClientRect().top + scrollY;
  const H = Math.round(Math.max(480, innerHeight - top - navH - 10));
  if(!force && Math.abs(H - lastH) < 24) return;
  lastH = H; wrap.style.setProperty('height', H + 'px', 'important'); wrap.style.setProperty('min-height', H + 'px', 'important'); wrap.style.setProperty('max-height', 'none', 'important');
}

function all630(){ try{ box630(); head630(); harv630(); req630(); fit630(true); }catch(e){ console.warn('v6.30', e); } }
renderTown = (orig => function(){ const o = orig.apply(this, arguments); all630(); requestAnimationFrame(() => fit630(true)); return o; })(renderTown);
try{ renderReqPanel = (orig => function(){ const o = orig.apply(this, arguments); try{ req630(); }catch(e){} return o; })(renderReqPanel); }catch(e){}
addEventListener('resize', () => fit630(false));
addEventListener('orientationchange', () => setTimeout(() => fit630(true), 400));
/* もようがえ 中は かさねない */
document.addEventListener('click', e => { if(e.target.closest('#btnEdit')) setTimeout(() => { harv630(); req630(); }, 60); });
/* うりあげの じょうけん（あと ○問）が かわったら 出す */
setInterval(() => { if(typeof curScreen!=='undefined' && curScreen==='town' && !document.hidden){ harv630(); } }, 2500);

/* ---------- 電車：かるい表示でも はしる（ずれ時間は 変数で わたす） ---------- */
try{ renderStrips = (orig => function(){ const o = orig.apply(this, arguments);
  try{ document.querySelectorAll('#railStrip .mover.train').forEach(el => { const d = el.style.animationDelay || '0s'; el.style.setProperty('--d630', d); }); }catch(e){}
  return o; })(renderStrips); }catch(e){ console.warn('rail630', e); }

/* ---------- わたしの家：アイコンを イラストに ---------- */
const HM = [[/ちしき/, 'hm_know'], [/家具/, 'hm_fur'], [/おきゃくさん/, 'hm_guest']];
const RM = {living:'rm_living', cafe:'rm_cafe', kids:'rm_kids', bed:'rm_bed', hobby:'rm_hobby', attic:'rm_attic'};
Object.entries(Object.assign({}, ...HM.map(([,k]) => ({[k]:k})), Object.fromEntries(Object.values(RM).map(k => [k,k])))).forEach(([k]) => { DEFAULT_ART['v630_' + k] = IMG + k + '.webp'; });
const src = k => (typeof artSrc==='function' && artSrc('v630_' + k)) || IMG + k + '.webp';
function home630(){
  document.querySelectorAll('.hmStats span').forEach(sp => { if(sp.querySelector('img.ic630')) return; const hit = HM.find(([re]) => re.test(sp.textContent)); if(!hit) return;
    const tn = [...sp.childNodes].find(n => n.nodeType===3 && n.textContent.trim()); if(tn) tn.textContent = tn.textContent.replace(/^[^\u3040-\u30FF\u4E00-\u9FFFA-Za-z0-9]+/, ' ');
    sp.insertAdjacentHTML('afterbegin', `<img class="ic630" src="${X(src(hit[1]))}" alt="">`); });
  document.querySelectorAll('.rbRoom[data-room]').forEach(b => { const k = RM[b.dataset.room]; if(!k || b.classList.contains('rlock')) return; const i = b.querySelector('i'); if(!i || i.querySelector('img')) return;
    i.innerHTML = `<img class="rmIc630" src="${X(src(k))}" alt="">`; });
}
try{ renderMyHome = (orig => function(){ const o = orig.apply(this, arguments); try{ home630(); }catch(e){} return o; })(renderMyHome); }catch(e){}
if(window.MutationObserver){ let t = 0; new MutationObserver(() => { if(typeof curScreen!=='undefined' && curScreen==='myhome'){ clearTimeout(t); t = setTimeout(home630, 30); } }).observe(document.body, {childList:true, subtree:true}); }

const css = document.createElement('style');
css.textContent = `
/* ---- まち：わく・かさねる パーツ ---- */
#mapBox630{position:relative;order:5}
#scr-town #townStats{display:none!important}
#scr-town .jump628,#scr-town #btnHarvest628{display:none!important}
#harv630{position:sticky;top:62px;height:0;z-index:43}
#harv630 .in630{position:absolute;left:0;right:0;top:8px;display:flex;justify-content:center;pointer-events:none}
#harv630 .harvBtn630{pointer-events:auto;display:inline-flex;align-items:center;gap:6px;padding:7px 14px!important;font-size:13px!important;border-radius:999px!important;box-shadow:0 4px 0 #2E8B57,0 6px 14px rgba(0,0,0,.25)!important;animation:harv630 1.6s ease-in-out infinite;white-space:nowrap;max-width:calc(100% - 20px)}
#harv630 .gift630{font-size:18px;line-height:1}
@keyframes harv630{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
#req630{position:sticky;bottom:calc(var(--nav630,66px) + 8px);height:0;z-index:42}
#req630 .in630{position:absolute;left:6px;right:6px;bottom:6px;background:rgba(255,253,246,.96);border:2.5px solid #F2C46B;border-radius:16px;box-shadow:0 4px 14px rgba(0,0,0,.22);overflow:hidden}
#req630 .reqHd630{display:flex;align-items:center;gap:6px;width:100%;border:none;background:linear-gradient(180deg,#FFF3D2,#FFE7AE);padding:5px 10px;font:inherit;font-weight:900;font-size:13px;color:#7A4A12;cursor:pointer;text-align:left}
#req630 .reqHd630 img{width:22px;height:22px;object-fit:contain;flex:none}
#req630 .reqHd630 .n630{background:#E8414B;color:#fff;border-radius:999px;min-width:20px;height:20px;line-height:20px;text-align:center;font-size:12px;padding:0 5px}
#req630 .reqHd630 .done630{font-style:normal;font-size:11px;color:#C66F0A;background:#fff;border-radius:999px;padding:1px 7px;border:1.5px solid #F2A33A;white-space:nowrap;animation:harv630 1.4s ease-in-out infinite}
#req630 .reqHd630 .arw630{margin-left:auto;font-style:normal;font-size:12px;color:#B5701C}
#req630 .reqBody630{max-height:min(26vh,128px);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px 6px 6px}
#req630.closed .reqBody630{display:none}
#req630 #reqPanel{margin:0!important;padding:0!important;background:none!important;border:none!important;box-shadow:none!important}
#req630 #reqPanel .reqTitle,#req630 #reqPanel .reqEmpty{display:none!important}
#req630 #reqPanel .reqRow{display:flex!important;align-items:center;gap:6px;margin:4px 0 0!important;padding:3px 6px!important;min-height:0!important;border-radius:12px!important;font-size:12px;cursor:pointer}
#req630 #reqPanel .reqRow .reqWho{flex:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;overflow:hidden}
#req630 #reqPanel .reqRow .reqWho img,#req630 #reqPanel .reqRow .reqWho .rpic{max-width:30px!important;max-height:30px!important;width:auto!important;height:auto}
#req630 #reqPanel .reqRow .reqT{flex:1 1 auto;min-width:0;font-size:12px!important;line-height:1.3;display:flex;flex-direction:column;gap:1px}
#req630 #reqPanel .reqRow .reqT .l1-630{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#req630 #reqPanel .reqRow .reqT .l2-630{display:flex;align-items:center;gap:6px;white-space:nowrap}
#req630 #reqPanel .reqRow .reqT .misBar{flex:1 1 auto;min-width:30px;max-width:110px;height:6px!important;margin:0!important}
#req630 #reqPanel .reqRow .reqT small{font-size:10.5px!important}
#req630 #reqPanel .reqRow .reqIt{flex:none;width:28px;height:28px;display:flex;align-items:center;justify-content:center;overflow:hidden}
#req630 #reqPanel .reqRow .reqIt img{max-width:28px!important;max-height:28px!important;width:auto!important;height:auto!important}
#req630 #reqPanel .reqRow .btn{flex:none;padding:4px 8px!important;font-size:11.5px!important;min-height:0!important}
body:not(.scr-town) #req630,body:not(.scr-town) #harv630{display:none}

/* ---- まち：上の じょうほう ---- */
#scr-town #townHead div.tprog{flex:1 1 100%;order:3;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin:2px 0 0!important}
#scr-town #townHead div.tprog>span{display:block!important;grid-column:1/-1;font-size:10.5px;font-weight:800;color:#8A6A45;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#scr-town #townHead .tprog .pr{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:2px!important;margin:0!important;padding:3px 6px 4px!important;background:#FFF8EA;border:1.5px solid #F1E2C4;border-radius:10px;min-width:0;grid-template-columns:none!important}
#scr-town #townHead .tprog .pr b{display:flex!important;align-items:center;gap:2px;font-size:10px!important;line-height:1.15;white-space:nowrap;overflow:hidden;min-width:0;color:#6B4A2A}
#scr-town #townHead .tprog .pr b img{width:14px!important;height:14px!important;flex:none}
#scr-town #townHead .tprog .pr .tbar{height:6px!important;width:100%!important;margin:0!important;grid-column:auto!important;grid-row:auto!important}
#scr-town #townHead .tprog .pr em{display:block!important;font-style:normal;font-size:10.5px!important;font-weight:800;color:#8A6A45;text-align:right;white-space:nowrap;line-height:1.15;margin:0!important}
#scr-town #townHead .tprog .pr em b{display:inline!important;font-size:12px!important;color:#D2691E}
#scr-town #townHead .tprog .pr.ok630{background:#EAF8EC;border-color:#BFE6C6}
#scr-town #townHead .tprog .pr.ok630 em{color:#2E8B57}
#scr-town #townHead .chips630{flex:1 1 100%;order:4;display:flex;flex-wrap:nowrap;gap:4px;margin-top:1px;overflow:hidden;min-width:0}
#scr-town #townHead .chip630{display:inline-flex;align-items:center;gap:2px;background:#F3FAFF;border:1.5px solid #CFE6F7;border-radius:999px;padding:1px 7px 1px 3px;font-size:10px;flex:0 1 auto;min-width:0;font-weight:800;color:#4A6A85;white-space:nowrap}
#scr-town #townHead .chip630 img{width:15px;height:15px;object-fit:contain}
#scr-town #townHead .chip630 b{color:#2F6DB5;font-size:11.5px;margin-left:2px}
#scr-town #townHead .lvUpBtn{order:5}
#scr-town #townHead .ghostBtn{order:6}

/* ---- 学校の「じゅぎょう中」は 出さない ---- */
.sc52 .tag52{display:none!important}

/* ---- かるい表示でも 電車は はしる ---- */
#townMap.lite56 #railStrip .mover.train{animation:drive 22s linear infinite!important;animation-delay:var(--d630,0s)!important}
#townMap.lite56 #railStrip .mover.train.lane1{animation-name:driveRev!important}
@supports (container-type:inline-size){
  #townMap.lite56 #railStrip .mover.train{animation-name:drive52!important}
  #townMap.lite56 #railStrip .mover.train.lane1{animation-name:driveRev52!important}
}

/* ---- 魚影（イラスト） ---- */
#fish614 .fsN630{opacity:.8}
#fish614 .fsR630{display:none}
#fish614.rare625 .fsN630{display:none}
#fish614.rare625 .fsR630{display:inline}
#fish614 .fTail630{transform-box:fill-box;transform-origin:100% 50%;animation:wag630 .55s ease-in-out infinite alternate}
@keyframes wag630{from{transform:skewY(-10deg) scaleY(.88)}to{transform:skewY(10deg) scaleY(1)}}
#fish614 .spk630{transform-box:fill-box;transform-origin:50% 50%;animation:spk630 1.6s ease-in-out infinite}
@keyframes spk630{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1)}}

/* ---- わたしの家：アイコン ---- */
.hmStats span{display:inline-flex;align-items:center;gap:3px}
.hmStats img.ic630{width:22px;height:22px;object-fit:contain;flex:none}
.rbRoom i img.rmIc630{width:20px;height:20px;object-fit:contain;display:block}
@media (max-width:700px){ .rbRoom i img.rmIc630{width:18px;height:18px} .hmStats{flex-wrap:nowrap!important} .hmStats span{padding:2px 7px 2px 3px!important;font-size:11.5px!important;min-width:0;flex:0 1 auto} .hmStats img.ic630{width:20px;height:20px} }

@media (max-width:700px){
  /* ---- まち：ならび（まちが いちばん 下） ---- */
  #scr-town .townBtns{order:2!important}
  #scr-town .zoomBar{order:3!important}
  #scr-town #townTray{order:4}
  #scr-town #mapBox630{order:5!important}
  #scr-town.active{padding-bottom:calc(var(--nav630,66px) + 12px)!important}
  #scr-town.active:has(#townTray:not(.hidden)){padding-bottom:calc(var(--nav630,66px) + 116px)!important}
  #scr-town #townMapWrap{min-height:480px!important;max-height:none!important}
  #scr-town #townHead{row-gap:4px!important}

  /* ---- ショップ：イベントの アイコンを すこし 上に ---- */
  #shopTabs button[data-v="ev"] img{transform:translateY(-6px)}
}`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
try{ if(typeof curScreen!=='undefined' && curScreen==='town') renderTown(); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.31：がっこう・だいがく（仕様書 v0.2 の STEP1〜3）
   ・がっこう：1じゅぎょう5問（かんたん／ふつう／むずかしい）、ヒントで さいちょうせん、
              「わかった！」、★、ほうしゅうの 上限、ミッション、スタンプ・かいきん賞・ふくびき、
              しゅっせき・お休みチケット、つうしんぼ、にがてノート、バッジ、きずな・おねがい、こんしゅうの 目標
   ・だいがく：体験入学、入学試験、9テーマ（いまの 問題を つかう）、3ステージの 研究、
              ひらめきライフ、レベル（ベーシック／アドバンス／マスター）、学位、チェイン、おすすめテーマ
   ※ 研究ノート（カード）・レシピ・ひみつ報酬・がっかい・新しい問題は STEP4〜5 で ついか
   ===================================================================== */
(function(){
'use strict';
const resBy = id => (save.town?.res || []).find(r => r.id===id);
const VER = '6.36.0', IMG = './assets/images/v631/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt = n => (typeof nf==='function' ? nf(n) : String(n));
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 調整用パラメータ（6-2） ---------- */
const CFG = {
  dayHour:4, cryDay:3,
  coin:{easy:5, normal:10, hard:15}, mul:{easy:.5, normal:1, hard:1.5},
  fullClass:3, overMul:.2, hintMul:.5, wakatta:2, revenge:20,
  kaikin:50, mission:10, chest:40, ticketMax:2,
  badge:[{n:'ブロンズ', ic:'🥉'}, {n:'シルバー', ic:'🥈', st:60, d:7, rew:300}, {n:'ゴールド', ic:'🥇', st:250, d:30, each:20, rew:1000}, {n:'にじいろ', ic:'🌈', st:800, d:100, each:100, rew:0}],
  attendRew:{3:{pt:30}, 7:{pt:100, cry:1, b:'いっしゅうかん'}, 14:{pt:150, fuku:1}, 30:{pt:500, deco:1, b:'ひとつき'}, 50:{pt:800, fuku:3}, 100:{deco:1, t:'かいきん', b:'ひゃくにち'}},
  bondLv:[0,10,30,60,100],
  fullRes:3, life:3, degPt:[10,20,40], resCoin:[30,60,120], resCry:[.1,.3,1], noMiss:1.5, daiP:.05, chain:[1,1.1,1.2], recoMul:1.3,
  adv:{n:5, days:3, wait:7}, mas:{n:10, days:10, wait:30},
  degree:[{n:'がくせい'}, {n:'学士', pt:150, d:7, rew:500}, {n:'修士', pt:800, d:30, adv:1, rew:2000}, {n:'博士', pt:3000, d:100, mas:3, rew:0}],
  stageSec:[60,50,40]
};

/* ---------- 日づけ（午前4時で きりかえ） ---------- */
const D4 = () => dayKey(new Date(Date.now() - CFG.dayHour*3600e3));
const dnum = d => Math.round(new Date(d + 'T12:00:00').getTime() / 864e5);
const addDay = (d, n) => { const t = new Date(d + 'T12:00:00'); t.setDate(t.getDate() + n); return dayKey(t); };
const wkOf = d => { const t = new Date(d + 'T12:00:00'); t.setDate(t.getDate() - (t.getDay() + 6) % 7); return dayKey(t); };
const wday = d => new Date(d + 'T12:00:00').getDay();

/* ---------- セーブ ---------- */
function SV(){
  const s = save.sch631 || (save.sch631 = {});
  s.stars = s.stars || {}; s.wk = s.wk || {}; s.acc = s.acc || {}; s.bond = s.bond || {}; s.notes = s.notes || [];
  s.recent = s.recent || {}; s.got = s.got || {}; s.titles = s.titles || []; s.badges = s.badges || [];
  if(s.attend==null){ s.attend = 0; s.streak = 0; s.last = ''; s.tickets = 0; s.badge = 0; s.grad = 0; s.fuku = 0; s.wkDays = {}; s.gradWk = {}; }
  return s;
}
function UV(){
  const u = save.uni631 || (save.uni631 = {});
  if(u.th == null){ u.th = {}; u.enrolled = 0; u.degPt = 0; u.degree = 0; u.days = 0; u.lastDay = ''; u.frag = 0; u.tickets = 0; u.total = 0; u.partner = ''; }
  return u;
}
function DL(){
  const d = D4(); let L = save.dl631;
  if(!L || L.d !== d){ L = save.dl631 = {d, cry:0, cnt:{}, best:{}, bond:{}, res:0, chain:[], trial:0, exam:0, mis:null, kaikin:0, friend:0, combo3:0, rev:0, wak:0}; }
  return L;
}
/* 日づけを もどしても 二重に もらえない */
function dayOK(){ const s = SV(), d = D4(); if(s.maxDay && d < s.maxDay) return false; s.maxDay = d; return true; }
function giveCry(){ const L = DL(); if(L.cry >= CFG.cryDay) return false; L.cry++; save.crystal = (save.crystal||0) + 1; return true; }
const pts = (p, why) => p > 0 ? givePts(Math.round(p), why) : 0;

/* ---------- 教科 ---------- */
const SUBJ = {jp:'こくご', math:'さんすう', sci:'りか', soc:'しゃかい', en:'えいご'};
const SUBJ_IC = {jp:'📖', math:'🔢', sci:'🔬', soc:'🗾', en:'🔤'};
const IMG633 = './assets/images/v633/';
const SUBJ_ART = {jp:'icon_kokugo', math:'icon_sansu', sci:'icon_rika', soc:'icon_shakai', en:'icon_write'};
const subjImg = k => `<img class="sic633" src="${X(artSrc(SUBJ_ART[k]) || '')}" alt="">`;
const chestImg = () => `<img class="chi633" src="${X(artSrc('ui_chest') || '')}" alt="">`;
const IC635 = {streak:'ic_streak', ticket:'ic_ticket', fuku:'ic_fuku', nigate:'ic_nigate', goal:'ic_goal', grad:'ic_grad', pals:'ic_pals', frag:'ic_frag', rnote:'ic_rnote', mission:'ic_mission'};
const ART635 = {letter:'ui_letter', building:'ui_building', school:'bld_school', write:'icon_write', study:'ui_study', chest:'ui_chest'};
const ic = (k, cls='') => `<img class="ii635 ${cls}" src="${X(IC635[k] ? './assets/images/v635/' + IC635[k] + '.webp' : (artSrc(ART635[k]) || ''))}" alt="">`;
const MEDAL_F = ['', 'sepia(1) saturate(1.6) hue-rotate(-15deg) brightness(.85)', 'grayscale(1) brightness(1.25)', 'saturate(1.3)', 'hue-rotate(260deg) saturate(1.6) drop-shadow(0 0 3px #FFD24A)'];
const medal = (i, cls='') => i ? `<img class="md636 ${cls}" src="${X(artSrc('mi_medal')||'')}" style="filter:${MEDAL_F[i]}" alt="">` : `<span class="md636 none ${cls}"></span>`;
let QUITFN = null, QUITOK = false, QUITMSG = '';
const SUBJ_C = {jp:'#E8606A', math:'#3D8BE0', sci:'#3BAF6A', soc:'#E79A2B', en:'#9A6AD8'};
const SK = Object.keys(SUBJ);
const userG = () => Number(save.settings?.grade56 || 0) || 3;
const ug = u => { try{ return window.__v57 ? window.__v57.unitGrade(u) : 0; }catch(e){ return 0; } };
const subjOf = u => { const g = MATH_UNITS[u]?.g; return typeof g==='number' || g==='low' ? 'math' : g==='sci' ? 'sci' : g==='soc' ? 'soc' : g==='bun' ? 'jp' : g==='ek' ? 'en' : g==='prog' ? 'prog' : null; };
let POOL = null;
const pool = () => POOL || (POOL = Object.keys(MATH_UNITS).filter(u => subjOf(u) && subjOf(u)!=='prog' && ug(u) > 0 && u!=='ek_listen'));
function near(subj, T, hard){
  for(const tol of [.6, 1.1, 1.6, 2.6, 9]){
    const L = pool().filter(u => subjOf(u)===subj && Math.abs(ug(u) - T) <= tol && (!hard || ug(u) >= T - .6));
    if(L.length) return L;
  }
  return pool().filter(u => subjOf(u)===subj);
}
function genU(u){
  for(let t=0; t<8; t++){ let m = null; try{ m = mqFromP(MATH_UNITS[u].gen(), u); }catch(e){}
    if(m && m.opts && m.opts.length >= 2){ m.u = u; m.qg = ug(u); m.subj = subjOf(u); return m; } }
  return null;
}
function genK(q){ const m = kanjiMQ(q, false); if(!m) return null; m.u = 'kanji'; m.kid = q.id; m.kq = q; m.qg = q.grade || 3; m.subj = 'jp'; m.key = 'k:' + q.id; return m; }
const kanjiNear = T => { for(const tol of [.6, 1.1, 2.1, 9]){ const L = BUILTIN.filter(q => Math.abs((q.grade||3) - T) <= tol); if(L.length) return L; } return BUILTIN; };
const isRecent = (k, used) => { if(!k) return false; if(used && used.has(k)) return true; const d = SV().recent[k]; return d && dnum(D4()) - dnum(d) < 3; };
const rich = m => /<svg|<img|<table/.test(m.html) || String(m.html).replace(/<[^>]+>/g,'').length > 38;
function subjQ(subj, T, used, hard){
  let best = null;
  for(let t=0; t<30; t++){
    let m = null;
    if(subj==='jp' && (Math.random() < .55 || !near('jp', T).length)) m = genK(choice(kanjiNear(T)));
    else { const L = near(subj, T, hard); if(L.length) m = genU(choice(L)); }
    if(!m) continue;
    if(isRecent(m.key, used) && t < 24) continue;
    if(hard && !rich(m) && t < 12){ best = best || m; continue; }
    return m;
  }
  return best || genK(choice(BUILTIN));
}
function expl(m, v){
  if(m.ex632){ const E = m.ex632;
    return `<div class="ex56 s-sci"><div class="ex56Hd"><img src="${X(artSrc('bird_think')||'')}" alt=""><b>📖 シマくんの かいせつ</b><small>だいがく</small></div>
      <div class="ex56Ans"><span class="ok">⭕ 正しい こたえ <b>${X(E.a)}</b></span>${v ? `<span class="ng">❌ きみの こたえ <b>${X(v)}</b></span>` : ''}</div>
      ${E.fig && FIG632[E.fig] ? `<div class="ex56Fig">${FIG632[E.fig]}</div>` : ''}<div class="ex56Why">🔍 ${X(E.ex)}</div></div>`; }
  try{ if(m.kq) return window.__explain56({}, '', {kq:m.kq, kind:'read'}); if(m.p56) return window.__explain56(m.p56, v, {}); }catch(e){}
  return `<p class="dlgP">こたえは <b>${X(m.ansF || m.ans)}</b></p>`;
}
function noteRecent(m){ const s = SV(); if(m.key) s.recent[m.key] = D4();
  const lim = dnum(D4()) - 4; Object.keys(s.recent).forEach(k => { if(dnum(s.recent[k]) < lim) delete s.recent[k]; }); }

/* ---------- 住民 ---------- */
const RES = () => (save.town?.res || []).filter(r => !SP(r.sp).human && (SP(r.sp).img || artSrc(SP(r.sp).art)));
const rsrc = r => SP(r.sp).img || artSrc(SP(r.sp).art) || '';
function fav(r){ if(!r.favSubject || !SUBJ[r.favSubject]){ r.favSubject = choice(SK); } return r.favSubject; }
const bondPt = id => SV().bond[id] || 0;
const bondLv = id => { const p = bondPt(id); let l = 1; CFG.bondLv.forEach((v,i) => { if(p >= v) l = i + 1; }); return l; };
function addBond(id, n, capDay){
  const s = SV(), L = DL(); const before = bondLv(id);
  if(capDay){ const c = L.bond[id] || 0; n = Math.max(0, Math.min(n, 2 - c)); L.bond[id] = c + n; }
  s.bond[id] = (s.bond[id]||0) + n;
  const after = bondLv(id), out = [];
  if(after >= 3 && !s.got['g3_'+id]){ s.got['g3_'+id] = 1; out.push({id, gift:50}); }
  if(after > before) out.push({id, lv:after});
  return out;
}
function mates(){
  const L = DL(), all = RES();
  if(!L.mates || L.mates.some(id => !all.some(r => r.id===id))){
    const n = Math.min(all.length, 3 + (Math.random() < .5 ? 1 : 0) + (all.length >= 8 ? 1 : 0));
    const top = all.slice().sort((a,b) => bondPt(b.id) - bondPt(a.id)).filter(r => bondPt(r.id) > 0).slice(0, 2);
    const rest = shuffle(all.filter(r => !top.includes(r)));
    L.mates = top.concat(rest).slice(0, n).map(r => r.id);
  }
  return L.mates.map(resBy).filter(Boolean);
}
function teacherFor(subj){
  const all = RES(); if(!all.length) return null;
  const f = all.filter(r => fav(r)===subj), p = f.filter(r => bondLv(r.id) >= 4);
  return choice(p.length ? p : f.length ? f : all);
}
const LINES = {
  1:['きょうも がんばろうね！','いっしょに まなぼう','どの きょうかから やる？'],
  2:['きみと いっしょだと たのしいな','この まえの もんだい むずかしかったね','ノート みせっこ しよう！'],
  3:['きみの おかげで わかるように なったよ','せきがえで となりに なれたね！','あしたも いっしょに こようね'],
  4:['せんせいやく、まかせて！','きみの ★の かず、すごいね','わからない ところ おしえてあげる'],
  5:['ずっと ともだちだよ！','まちで おれいを わたすね','きみと まなぶのが いちばん たのしい！']
};
const sayOf = r => speak(r, choice(LINES[bondLv(r.id)] || LINES[1]));

/* ---------- がっこう：毎日の しかけ ---------- */
function special(d){ const w = wday(d); if(w>=1 && w<=5) return ['jp','math','sci','soc','en'][w-1];
  const s = SV(), pw = s.wk[addDay(wkOf(d), -7)] || {}; return SK.slice().sort((a,b) => (pw[a]||0) - (pw[b]||0))[0]; }
function missions(){
  const L = DL(); if(L.mis) return L.mis;
  const sp = special(L.d), hasN = SV().notes.length > 0;
  L.mis = {list:[{id:'sp', t:`${SUBJ[sp]}で ★2を とろう`}, hasN ? {id:'rev', t:'にがてリベンジを 1もん せいかい'} : {id:'c3', t:'れんぞくで 3もん せいかい'}, {id:'two', t:'2つの きょうかで じゅぎょう'}], done:[0,0,0], chest:0};
  return L.mis;
}
function checkMissions(){
  const L = DL(), M = missions(), sp = special(L.d), got = [];
  M.list.forEach((m, i) => { if(M.done[i]) return;
    const ok = m.id==='sp' ? (L.best[sp]||0) >= 2 : m.id==='rev' ? L.rev > 0 : m.id==='c3' ? L.combo3 > 0 : Object.keys(L.cnt).length >= 2;
    if(ok){ M.done[i] = 1; got.push(m); } });
  return got;
}
function weekTick(){
  const s = SV(), w = wkOf(D4());
  if(s.tkWk !== w){ s.tkWk = w; s.tickets = Math.min(CFG.ticketMax, (s.tickets||0) + 1); }
  if(!s.goal || s.goal.wk !== w) s.goal = {wk:w, g:'', done:0};
  if(!s.req || s.req.wk !== w){ const r = choice(RES()); if(r){ const sb = choice(SK.filter(k => k !== fav(r))); s.req = {wk:w, rid:r.id, subj:sb, done:0}; } }
}
const wkStars = (w) => SK.reduce((a,k) => a + ((SV().wk[w]||{})[k]||0), 0);
function goalProg(){
  const s = SV(), G = s.goal; if(!G || !G.g) return null; const w = G.wk;
  if(G.g==='days') return [Object.keys(s.wkDays).filter(d => wkOf(d)===w).length, 5, 'きょうしつに くる', 'にち'];
  if(G.g==='stars') return [wkStars(w), 15, '★を あつめる', 'こ'];
  return [(s.gradWk[w]||0), 3, 'にがてを そつぎょう', 'こ'];
}
function checkGoal(){ const s = SV(), G = s.goal, p = goalProg(); if(!G || G.done || !p || p[0] < p[1]) return false; G.done = 1; return true; }
function attend(){
  const s = SV(), d = D4(); if(s.last === d) return null;
  let msg = '';
  if(s.last){ const gap = dnum(d) - dnum(s.last) - 1;
    if(gap <= 0) s.streak++;
    else if(gap <= (s.tickets||0)){ s.tickets -= gap; s.streak++; msg = 'おかえり！ チケットで れんぞくを まもったよ'; }
    else s.streak = 1;
  } else s.streak = 1;
  s.last = d; s.attend++; s.wkDays[d] = 1;
  Object.keys(s.wkDays).forEach(k => { if(dnum(d) - dnum(k) > 21) delete s.wkDays[k]; });
  const R = CFG.attendRew[s.attend]; return {msg, rew:R ? Object.assign({n:s.attend}, R) : null};
}
function decoItem(rainbow){
  const lv = (save.town?.lv||0) + 1;
  const L = TOWN_ITEMS.filter(i => i.cat==='deco' && !i.ev && (i.lv||1) <= lv + 2 && (i.price||0) >= (rainbow ? 600 : 150));
  const it = choice(L.length ? L : TOWN_ITEMS.filter(i => i.cat==='deco' && !i.ev)); if(!it) return null;
  save.town.inv[it.id] = (save.town.inv[it.id]||0) + 1; return it;
}
function badgeNext(){
  const s = SV(), b = CFG.badge[s.badge + 1]; if(!b) return null;
  const tot = SK.reduce((a,k) => a + (s.stars[k]||0), 0);
  const each = b.each ? SK.filter(k => (s.stars[k]||0) < b.each) : [];
  return {b, tot, needSt:Math.max(0, b.st - tot), needD:Math.max(0, b.d - s.attend), each, ok:tot >= b.st && s.attend >= b.d && !each.length};
}
function fukubiki(){
  const r = Math.random(); let out;
  if(r < .5) out = {t:'コイン 100', pt:100};
  else if(r < .8) out = {t:'コイン 200', pt:200};
  else if(r < .95){ const it = decoItem(false); out = it ? {t:`まちの かざり「${it.name}」`, it} : {t:'コイン 200', pt:200}; }
  else out = giveCry() ? {t:'すいしょう 1こ', cry:1} : {t:'コイン 200', pt:200};
  if(out.pt) pts(out.pt, 'がっこうの ふくびき');
  return out;
}

/* ---------- にがてノート ---------- */
function addNote(m, mark){
  const s = SV(), k = m.u==='kanji' ? 'k:' + m.kid : 'u:' + m.u;
  let n = s.notes.find(x => x.key===k);
  if(!n){ n = {key:k, subj:m.subj, u:m.u, kid:m.kid||null, ok:[], add:D4()}; s.notes.unshift(n); if(s.notes.length > 100) s.notes.length = 100; }
  n.mark = mark || n.mark || 'u'; n.add = D4();
  return n;
}
function pickNote(subj){
  const s = SV(), d = D4();
  const L = s.notes.filter(n => n.subj===subj && n.add !== d && !n.ok.includes(d));
  if(!L.length) return null;
  return L.sort((a,b) => (b.mark==='k') - (a.mark==='k') || a.ok.length - b.ok.length)[0];
}
function noteQ(n){ if(n.u==='kanji'){ const q = BUILTIN.find(x => x.id===n.kid); return q ? genK(q) : null; } return MATH_UNITS[n.u] ? genU(n.u) : null; }
function noteOK(n){
  const s = SV(), d = D4(); if(!n.ok.includes(d)) n.ok.push(d);
  if(n.ok.length >= 3){ s.notes = s.notes.filter(x => x !== n); s.grad = (s.grad||0) + 1; const w = wkOf(d); s.gradWk[w] = (s.gradWk[w]||0) + 1;
    const M = {10:100, 50:500, 100:1000}[s.grad]; return {grad:true, mile:M ? {n:s.grad, pt:M} : null}; }
  return {grad:false};
}

/* =====================================================================
   画面（オーバーレイ）
   ===================================================================== */
let ROOT = null, CUR = null, KEY = null, busy = false;
function root(){
  if(ROOT && document.body.contains(ROOT)) return ROOT;
  ROOT = document.createElement('div'); ROOT.id = 'sc631'; document.body.appendChild(ROOT);
  ROOT.addEventListener('click', onClick);
  return ROOT;
}
function close(){ QUITOK = false; QUITFN = null; if(ROOT){ ROOT.classList.remove('show'); setTimeout(() => { if(ROOT && !ROOT.classList.contains('show')){ ROOT.remove(); ROOT = null; } }, 250); } CUR = null; document.body.classList.remove('sc631on'); try{ persist(); }catch(e){} }
const GUIDE = {
  school:[['bird_wave','ようこそ「がっこう」へ！','ここでは まちの なかまと いっしょに<br><b>こくご・さんすう・りか・しゃかい・えいご</b>の じゅぎょうが うけられるよ。'],
    ['bird_think','じゅぎょうの うけかた','① きょうかを えらぶ<br>② かんたん／ふつう／むずかしい を えらぶ<br>③ 5もん とくと、はなまるの かずで <b>★</b>が もらえるよ。<br>まちがえても <b>ヒント</b>で もういちど ちょうせん できるよ！'],
    ['bird_thumb','まいにちの おたのしみ','<b>きょうの ミッション</b>を 3つ クリアすると たからばこ。<br>5きょうか ぜんぶで <b>かいきん賞</b>と ふくびき券！<br>まいにち くると <b>れんぞく しゅっせき</b>が のびるよ。'],
    ['bird_cheer','めざせ だいがく！','★を あつめて バッジを <b>ゴールド</b>に すると、<br>「だいがく」の 入学試験に ちょうせん できるよ。<br>さあ、はじめよう！']],
  uni:[['bird_wave','ここは「だいがく」！','がっこうより <b>むずかしい</b> けど、<br>ごほうびも ずっと 大きいよ。'],
    ['bird_think','入学するには？','がっこうで <b>ゴールドバッジ</b>に なると 入学試験（10もん中 7もん）に ちょうせん できるよ。<br>それまでは <b>体験入学</b>で 1日1もん ためせるよ。'],
    ['bird_think','けんきゅうの しかた','テーマと レベルを えらんで けんきゅう スタート！<br><b>しらべる → かんがえる → はっぴょう</b>。<br>♥が 3つ なくなると しっぱいだよ。'],
    ['bird_thumb','あつめて たのしい','せいこうすると <b>はっけんカード</b>が もらえるよ。研究ノートを うめよう！<br>テーマを マスターすると カフェの <b>とくべつ レシピ</b>。<br>ぜんぶ マスターすると…<b>ひみつ</b>が わかるかも？']]
};
async function guide(kind, force){
  const g = save.guide635 || (save.guide635 = {}); if(g[kind] && !force) return false;
  g[kind] = 1; persist();
  const P = GUIDE[kind];
  for(let i=0; i<P.length; i++){
    const [art, t, body] = P[i], last = i === P.length - 1;
    const v = await dialog(`<div class="gd635"><div class="gdb635"><img src="${X(artSrc(art)||'')}" alt=""></div><div class="gdt635"><b>シマくん</b><h3>${t}</h3><p>${body}</p></div></div>
      <div class="gdd635">${P.map((_, k) => `<i class="${k===i ? 'on' : ''}"></i>`).join('')}</div>`,
      last ? [{label:'わかった！', cls:'gold', v:1}] : [{label:'つぎへ ▶', cls:'gold', v:1}, {label:'スキップ', cls:'white', v:0}], 'wide gdw635');
    if(!v) break;
  }
  return true;
}
function open(kind, key){ KEY = key; CUR = kind; root(); ROOT.classList.toggle('bgS633', kind==='school'); ROOT.classList.toggle('bgU634', kind!=='school'); document.body.classList.add('sc631on'); requestAnimationFrame(() => ROOT.classList.add('show')); kind==='school' ? schoolMain() : uniMain();
  const gk = kind==='school' ? 'school' : 'uni';
  if(!(save.guide635||{})[gk]){ busy = true; setTimeout(() => guide(gk).finally(() => { busy = false; if(CUR==='school') schoolMain(); else if(CUR) uniMain(); }), 450); } }
function stage(bg, list, opt={}){
  const pos = opt.pos || [[14,88],[33,95],[67,95],[86,88],[50,82]];
  return `<div class="stg631 ${opt.cls||''}"><img class="bg" src="${IMG}${bg}.webp" alt="">
    ${list.slice(0, pos.length).map((r, i) => `<button type="button" class="who631 ${opt.bounce ? 'hop' : ''}" data-who="${X(r.id)}" style="left:${pos[i][0]}%;top:${pos[i][1]}%;animation-delay:${(i*.37).toFixed(2)}s">
      <img src="${X(rsrc(r))}" alt="">${opt.prop ? `<i class="prop631">${opt.prop(r, i)}</i>` : ''}${bondLv(r.id) >= 2 && !opt.noLv ? `<em class="bl631">💗${bondLv(r.id)}</em>` : ''}</button>`).join('')}
    ${opt.extra || ''}</div>`;
}
function bubble(el, txt){
  ROOT.querySelectorAll('.bub631').forEach(b => b.remove());
  el.insertAdjacentHTML('beforeend', `<span class="bub631">${X(txt)}</span>`);
  setTimeout(() => el.querySelector('.bub631')?.remove(), 2600);
}
const stars = (n, max=3) => '<span class="st631">' + Array.from({length:max}, (_, i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('') + '</span>';
const bar = (a, b, cls='') => `<span class="bar631 ${cls}"><i style="width:${Math.min(100, b ? a/b*100 : 100)}%"></i></span>`;

/* ---------- クリック ---------- */
let ST = {subj:null, diff:null};
async function onClick(e){
  const t = e.target.closest('[data-a],[data-who],[data-subj],[data-diff],[data-th],[data-lv],[data-pal]'); if(!t || busy) return;
  if(e.target.closest('[data-pal]') && CUR==='school'){ const k = e.target.closest('[data-pal]').dataset.pal, b = ROOT.querySelector(`.pb639[data-pal="${k}"]`);
    const OW = ['いっしょに 学ぼう！','どの きょうかに する？','★を あつめよう！','わからなくても だいじょうぶ！','きょうも えらいね！'], SE = ['きっと できるよ！','ミッション がんばろ！','れんぞくで せいかい めざそう！','たからばこ あけたいな〜','ぼくも おうえん してるよ！'];
    if(b){ const L2 = k==='0' ? OW : SE; let v; do{ v = choice(L2); }while(v===b.textContent && L2.length > 1); b.textContent = v; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); sound('tap'); } return; }
  if(t.dataset.who && t.classList.contains('pl639')){ const r = resBy(t.dataset.who), b = t.querySelector('.bb639'); if(r && b){ b.textContent = sayOf(r); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; sound('tap'); } return; }
  if(t.dataset.who){ const r = resBy(t.dataset.who); if(r) bubble(t, CUR==='uni' ? speak(r, choice(['この データ、おもしろい！','つぎの はっけんは なにかな','いっしょに けんきゅう しよう！','ひらめいた かも…！'])) : sayOf(r)); return; }
  if(t.dataset.subj){ ST.subj = t.dataset.subj; sound('ok'); schoolMain(); return; }
  if(t.dataset.diff){ ST.diff = t.dataset.diff; SV().lastDiff = ST.diff; sound('ok'); schoolMain(); return; }
  if(t.dataset.th){ UT.th = t.dataset.th; sound('ok'); uniMain(); return; }
  if(t.dataset.lv){ UT.lv = +t.dataset.lv; sound('ok'); uniMain(); return; }
  const a = t.dataset.a;
  busy = true;
  try{
    if(a==='close') close();
    else if(a==='start') await runClass(ST.subj, ST.diff);
    else if(a==='pick') await pickDiff(t.dataset.k);
    else if(a==='pickth') await pickTheme(t.dataset.k);
    else if(a==='thlock') await dialog('<h2 class="dlgT">まだ ひらいて いないよ</h2><p class="dlgP">けんきゅうの かいすうが ふえると あたらしい こうざが ひらくよ。</p>', [{label:'わかった', cls:'gold', v:1}]);
    else if(a==='uchest'){ const L = DL(); L.umis = L.umis || {chest:0}; if(L.umis.chest) toast('きょうの ごほうびは もらったよ'); else if(!UMIS.every(m => m.ok(L))) toast('ミッションを ぜんぶ クリアしてね'); else if(dayOK()){ L.umis.chest = 1; const u = UV(); pts(80, 'だいがく ミッション'); u.frag++; if(u.frag >= 5){ u.frag -= 5; u.tickets++; } persist(); sound('fan'); confetti(1500); await dialog(`<div class="dlgArt"><img src="${IMG634}th_space.webp" alt="" style="height:90px"></div><h2 class="dlgT">すてきな ごほうび！</h2><p class="dlgP">コイン +80<br>${ic('frag')} ひらめきの かけら +1</p>`, [{label:'やったー！', cls:'gold', v:1}]); uniMain(); } }
    else if(a==='cal') await calendar();
    else if(a==='mis') await misInfo();
    else if(a==='chest') await openChest();
    else if(a==='fuku') await doFuku();
    else if(a==='notes') await notesView();
    else if(a==='goal') await goalView();
    else if(a==='req') await reqView();
    else if(a==='badge') await badgeView();
    else if(a==='grade'){ const k = KEY; close(); setTimeout(() => openBuilding(k), 300); }
    else if(a==='touni'){ const k = (save.town && Object.keys(save.town.cells).find(k => save.town.cells[k]==='bg_university')); if(k){ KEY = k; CUR = 'uni'; uniMain(); } else await dialog(`<h2 class="dlgT">🎓 だいがく</h2><p class="dlgP">まちに「だいがく」を たてると かよえるよ。<br>（ショップ → たてもの、まちレベル12から）</p>`, [{label:'わかった', cls:'gold', v:1}]); }
    else if(a==='toschool'){ CUR = 'school'; schoolMain(); }
    else if(a==='trial') await trial();
    else if(a==='exam') await exam();
    else if(a==='rstart') await runResearch(UT.th, UT.lv);
    else if(a==='deg') await degreeView();
    else if(a==='partner') await pickPartner();
    else if(a==='note') noteBook(UT.th);
    else if(a==='help') await guide(CUR==='school' ? 'school' : 'uni', true);
    else if(a==='secret') await secretView();
  } finally { busy = false; }
}

/* ---------- がっこう：メイン ---------- */
function schoolMain(){
  if(!ROOT) return; ROOT.classList.add('bgS633'); ROOT.classList.remove('bgU634'); const s = SV(), L = DL(); weekTick(); missions(); checkMissions();
  const sp = special(L.d), M = missions(), bn = badgeNext();
  if(!ST.diff) ST.diff = s.lastDiff || 'normal';
  const stamps = SK.filter(k => (L.best[k]||0) >= 1).length;
  const rec = {easy:'normal', normal:'hard'};
  const recoDiff = ST.subj && (L.best[ST.subj]||0) >= 3 && rec[s.lastDiff] ? rec[s.lastDiff] : null;
  const ml = mates();
  /* 友だち（きずなLv5）の おれい */
  if(!L.friend){ const fr = RES().filter(r => bondLv(r.id) >= 5); L.friend = 1; if(fr.length){ pts(20 * fr.length, 'ともだちの おれい'); setTimeout(() => toast(`💗 ともだちから おれい +${20*fr.length}`), 400); } }
  const subjBtn = k => { const b = L.best[k]||0, n = L.cnt[k]||0, glow = stamps===4 && b < 1;
    return `<button type="button" class="sb631 ${ST.subj===k ? 'on' : ''} ${glow ? 'glow' : ''}" data-subj="${k}" style="--c:${SUBJ_C[k]}">
      ${k===sp ? '<em class="rib631">×1.5</em>' : ''}<span class="ic">${subjImg(k)}</span><b>${SUBJ[k]}</b>${stars(b)}<small>${n >= CFG.fullClass ? 'れんしゅう' : `${n}/${CFG.fullClass}`}</small>${b >= 1 ? '<i class="stamp631">✔</i>' : ''}</button>`; };
  const D = {easy:['かんたん','df_easy'], normal:['ふつう','df_normal'], hard:['むずかしい','df_hard']};
  const base = CFG.coin[ST.diff] || 10, mul = (ST.subj===sp ? 1.5 : 1);
  const pm = ST.subj && (L.cnt[ST.subj]||0) >= CFG.fullClass;
  const tot = SK.reduce((a,k) => a + (s.stars[k]||0), 0);
  const MIC = {sp:subjImg(sp), rev:ic('nigate'), c3:ic('streak'), two:ic('mission')};
  const MCOL = ['#FDE3E6','#DDEBFB','#FFF1C9'];
  const tile = (a, img, n, badge, extra='') => `<button type="button" class="tl639" data-a="${a}"><span class="ti">${img}</span><b>${n}</b>${badge ? `<i class="bd639 ${badge==='!' ? 'red' : ''}">${badge}</i>` : ''}${extra}</button>`;
  ROOT.innerHTML = `<div class="wrap631 school s639">
    <div class="tp639"><header class="hd639">
      <button type="button" class="bk639" data-a="close"><svg viewBox="0 0 24 24"><path d="M14 5L7 12L14 19" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H20" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg><b>まちへ</b></button>
      <img class="lg639" src="./assets/images/v639/logo_school.webp" alt="がっこう">
      <button type="button" class="st639" data-a="cal"><span>${ic('streak')} れんぞく <em>${s.streak||0}</em> にち</span><span><i class="sx639">★</i> <em class="g">${tot}</em></span></button>
    </header>
    <div class="cp639"><span>＼ ${dayOK() ? `きょうは ${SUBJ[sp]}の とくべつじゅぎょう！` : '日づけが もどっているよ'} ／</span></div>
    <button type="button" class="pal639 ow" data-pal="0" aria-label="フクロウせんせい"></button><button type="button" class="pal639 se" data-pal="1" aria-label="アザラシくん"></button>
    <span class="pb639 ow" data-pal="0">いっしょに 学ぼう！</span><span class="pb639 se" data-pal="1">きっと できるよ！</span></div>
    <section class="pn639 ms639"><div class="ph639">${ic('mission')}<b>きょうの ミッション</b><span class="ct639">${M.done.filter(Boolean).length}/3</span></div>
      <div class="mw639"><ol data-a="mis">${M.list.map((m,i) => `<li class="${M.done[i] ? 'ok' : ''}" style="--bg:${MCOL[i]}"><i class="ck639">${M.done[i] ? '<svg viewBox="0 0 20 20"><path d="M4 10.5L8.5 15L16 6" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</i><span class="mi639">${MIC[m.id]||ic('mission')}</span><span class="mt639">${X(m.t)}</span></li>`).join('')}</ol>
      <button type="button" class="cs639 ${M.done.every(Boolean) && !M.chest ? 'glow' : ''} ${M.chest ? 'got' : ''}" data-a="chest">${chestImg()}<small>${M.chest ? 'もらったよ！' : M.done.every(Boolean) ? 'タッチで あける！' : 'ぜんぶ できたら<br>ごほうびが もらえるよ！'}</small></button></div></section>
    <section class="pn639"><div class="ph639"><img class="pi639" src="${X(artSrc('ui_study')||'')}" alt=""><b>きょうの じゅぎょう</b><span class="hint639">＼ すきな きょうかから はじめよう！ ／</span></div>
      <div class="sj639">${SK.map(k => { const bb = L.best[k]||0, n = L.cnt[k]||0, glow = stamps===4 && bb < 1;
        return `<button type="button" class="sb639 ${glow ? 'glow' : ''}" data-a="pick" data-k="${k}" style="--c:${SUBJ_C[k]}">${k===sp ? '<em class="x15">×1.5</em>' : ''}${bb >= 1 ? '<i class="sp639">✔</i>' : ''}<span class="si">${subjImg(k)}</span><b>${SUBJ[k]}</b>${stars(bb)}<small>${n >= CFG.fullClass ? 'れんしゅう' : `きょう ${n}/${CFG.fullClass}`}</small></button>`; }).join('')}</div>
      <div class="stp639">スタンプ ${stamps}/5 ${'<i class="on"></i>'.repeat(stamps)}${'<i></i>'.repeat(5-stamps)} ${stamps===4 ? '<b>あと1つで かいきん賞！</b>' : stamps===5 ? '<b>かいきん賞！</b>' : ''}</div></section>
    <section class="pn639"><div class="ph639"><svg class="pi639" viewBox="0 0 32 32"><path d="M4 24L6 10L12 16L16 6L20 16L26 10L28 24Z" fill="#FFD24A" stroke="#B5701C" stroke-width="2" stroke-linejoin="round"/><rect x="4" y="24" width="24" height="4" rx="1.5" fill="#F2A33A" stroke="#B5701C" stroke-width="2"/></svg><b>これまでの きろく</b><span class="dl639"></span></div>
      <div class="tls639">
        ${tile('badge', medal(s.badge+1), 'バッジ', '', bn ? `<span class="mb639"><i style="width:${Math.min(100, bn.tot/bn.b.st*100)}%"></i></span>` : '')}
        ${tile('fuku', ic('fuku'), 'ふくびき', s.fuku ? s.fuku : '')}
        ${tile('notes', ic('nigate'), 'にがて', s.notes.length ? s.notes.length : '')}
        ${tile('goal', ic('goal'), 'しゅうの<br>目標', s.goal?.done ? '✓' : !s.goal?.g ? '!' : '')}
      </div>
      <div class="sub639">
        <button type="button" data-a="req">${ic('letter')} おねがい${s.req && !s.req.done ? '<i class="bd639 red">!</i>' : ''}</button>
        <button type="button" data-a="touni">${ic('grad')} だいがく</button>
        <button type="button" data-a="grade">${ic('building')} たてもの</button>
        <button type="button" data-a="help"><img src="${X(artSrc('bird_think')||'')}" alt=""> せつめい</button>
      </div></section>
  </div>`;
  persist();
  /* 週の はじめ：つうしんぼ・目標 */
  if(!busy) setTimeout(weekStart, 350);
}
async function weekStart(){
  const s = SV(), w = wkOf(D4()); if(busy || CUR!=='school' || !(save.guide635||{}).school) return;
  const pw = addDay(w, -7);
  if(s.repWk !== w && (s.wk[pw] || s.acc[pw])){ s.repWk = w; busy = true; try{ await report(pw); } finally { busy = false; } }
  else s.repWk = s.repWk || w;
  if(s.goal && !s.goal.g && !s.goal.asked){ s.goal.asked = 1; persist(); busy = true; try{ await goalView(); } finally { busy = false; } }
}
async function report(pw){
  const s = SV(), cur = s.wk[pw] || {}, prev = s.wk[addDay(pw, -7)] || {};
  const lab = n => n >= 9 ? 'たいへん よくできました' : n >= 4 ? 'よくできました' : 'がんばろう';
  const acc = k => { const a = (s.acc[pw]||{})[k], b4 = [14,21,28].map(n => (s.acc[addDay(pw, -n)]||{})[k]).find(Boolean); return a && a[1] && b4 && b4[1] ? `${Math.round(b4[0]/b4[1]*100)}% → ${Math.round(a[0]/a[1]*100)}%` : ''; };
  const t = teacherFor(SK.slice().sort((a,b) => ((cur[b]||0)-(prev[b]||0)) - ((cur[a]||0)-(prev[a]||0)))[0]);
  const rows = SK.map(k => { const n = cur[k]||0, up = n - (prev[k]||0);
    return `<tr><th>${subjImg(k)} ${SUBJ[k]}</th><td>★${n}</td><td>${lab(n)}${up > 0 ? `<b class="up631">+${up} ふえたよ！</b>` : ''}${acc(k) ? `<small>${acc(k)}</small>` : ''}</td></tr>`; }).join('');
  await dialog(`<h2 class="dlgT">📗 つうしんぼ</h2><table class="rep631">${rows}</table>
    ${t ? `<div class="talkBubble"><b>${X(t.name)}せんせい</b>${X(speak(t, 'こんしゅうも いっしょに がんばろうね！'))}</div>` : ''}`, [{label:'こんしゅうも がんばる！', cls:'gold', v:1}], 'wide');
}

/* ---------- じゅぎょう ---------- */
function qPanel(head, body){
  const p = ROOT.querySelector('.qz631') || (() => { ROOT.innerHTML = `<div class="wrap631 quiz ${ROOT.classList.contains('bgS633') || ROOT.classList.contains('bgU634') ? 'card633' : ''}"><div class="qz631"></div></div>`; return ROOT.querySelector('.qz631'); })();
  p.innerHTML = (QUITOK ? '<button type="button" class="quit633">✕ やめる</button>' : '') + head + body; ROOT.scrollTop = 0;
  const q = p.querySelector('.quit633'); if(q) q.onclick = async e => { e.stopPropagation(); const fn = QUITFN; if(!fn) return;
    const v = await dialog(`<h2 class="dlgT">${CUR==='uni' ? 'やめる？' : 'じゅぎょうを やめる？'}</h2><p class="dlgP">${QUITMSG || 'とちゅうで やめると この じゅぎょうの ★と ごほうびは もらえないよ。<br>（にがてノートに のせた もんだいは のこるよ）'}</p>`, [{label:'つづける', cls:'gold', v:0}, {label:'やめる', cls:'white', v:1}]);
    if(v && QUITFN===fn) fn(); };
  return p;
}
/* 1もん：mode 'school'（ヒントで もういちど）／'one'（1かいだけ） */
function askQ(m, head, mode, opt={}){
  return new Promise(res => {
    const ans = m.ansF || m.ans; let tries = 0, removed = new Set(opt.removed || []), timer = null, left = opt.sec || 0;
    const draw = (hint) => {
      const p = qPanel(head, `<div class="qq631">${m.html}</div>${m.say && typeof sayBtn==='function' ? sayBtn(m.say) : ''}
        ${hint ? `<div class="hint631">💡 ${hint}</div>` : ''}
        ${opt.sec ? `<div class="tm631"><i style="width:${left/opt.sec*100}%"></i><b>⏱ ${left}びょう</b></div>` : ''}
        <div class="ops631">${m.opts.map(o => `<button type="button" class="op631" data-o="${X(o)}" ${removed.has(o) ? 'disabled' : ''}>${X(o)}</button>`).join('')}</div>
        ${opt.tool ? `<div class="qt631">${opt.tool()}</div>` : ''}`);
      p.querySelectorAll('.op631').forEach(b => b.onclick = () => pick(b.dataset.o, b));
      p.querySelectorAll('[data-qt]').forEach(b => b.onclick = () => { const r = opt.onTool && opt.onTool(b.dataset.qt, m); if(r){ r.forEach(o => removed.add(o)); draw(hint); } });
    };
    const finish = (out) => { clearInterval(timer); QUITFN = null; res(out); };
    QUITFN = QUITOK ? () => finish({quit:true}) : null;
    let lock = false;
    const pick = (v, btn) => {
      if(lock) return; lock = true;
      if(v==null){ sound('ng'); return finish({ok:false, timeout:true, v:''}); }
      const ok = v===ans; tries++;
      const tr = tries;
      if(ok){ sound('ok'); btn && btn.classList.add('ok'); setTimeout(() => finish({ok:true, tries:tr, v}), 450); clearInterval(timer); return; }
      sound('ng'); btn && btn.classList.add('ng');
      if(mode==='school' && tries===1){ removed.add(v);
        const h = m.hint || 'もんだいを もういちど ゆっくり よんでみよう。こたえの こうほが 1つ へったよ';
        setTimeout(() => { lock = false; draw(`おしい！ ヒントを みて もういちど かんがえてみよう<br><small>${X(h)}</small>`)}, 500); return; }
      clearInterval(timer); setTimeout(() => finish({ok:false, tries:tr, v}), 450);
    };
    draw('');
    if(opt.sec){ timer = setInterval(() => { left--; const tm = ROOT && ROOT.querySelector('.tm631'); if(tm){ tm.querySelector('i').style.width = (left/opt.sec*100) + '%'; tm.querySelector('b').textContent = `⏱ ${Math.max(0,left)}びょう`; } if(left <= 0) pick(null); }, 1000); }
  });
}
function explainStep(m, v, head, btns){
  return new Promise(res => {
    QUITFN = QUITOK ? () => { QUITFN = null; res('__quit'); } : null;
    const p = qPanel(head, `<div class="exw631">${expl(m, v)}</div><div class="exb631">${btns.map(b => `<button type="button" class="btn ${b.cls||'white'}" data-v="${X(b.v)}">${b.label}</button>`).join('')}</div>`);
    p.querySelectorAll('.exb631 [data-v]').forEach(b => b.onclick = () => res(b.dataset.v));
  });
}
async function runClass(subj, diff){
  if(!subj || !diff) return;
  const s = SV(), L = DL(), g = userG(), sp = special(L.d), practice = (L.cnt[subj]||0) >= CFG.fullClass, good = dayOK();
  const teacher = teacherFor(subj), ml = mates();
  const used = new Set(); let combo = 0, maxCombo = 0, coin = 0, hana = 0, wak = 0, revOK = 0, grads = [], first = 0, n = 5;
  const revSlot = diff==='normal' ? ri(1, 4) : -1;
  const T = diff==='easy' ? Math.max(1, g - (Math.random() < .5 ? 1 : 2)) : g;
  if(teacher) await dialog(`<div class="dlgArt"><img src="${X(rsrc(teacher))}" alt="" style="height:90px"></div><div class="talkBubble"><b>${X(teacher.name)}せんせい</b>${X(speak(teacher, sp===subj ? `きょうは ${SUBJ[subj]}の とくべつじゅぎょう！ コインが 1.5ばいだよ` : `${SUBJ[subj]}の じゅぎょうを はじめるよ！ おちついて かんがえてね`))}</div>${practice ? '<p class="dlgP facNote">きょうの まんがくは おわったので「れんしゅうモード」（コイン ×0.2）だよ</p>' : ''}`, [{label:'はーい！', cls:'gold', v:1}], 'wide');
  QUITOK = true; QUITMSG = '';
  const quitOut = () => { QUITOK = false; QUITFN = null; toast('じゅぎょうを やめたよ'); schoolMain(); };
  for(let i=0; i<n; i++){
    let m = null, note = null;
    if(i===revSlot){ note = pickNote(subj); if(note) m = noteQ(note); if(m) m.rev = 1; }
    if(!m) m = subjQ(subj, T, used, diff==='hard');
    used.add(m.key); noteRecent(m);
    const head = `<div class="qh631" style="--c:${SUBJ_C[subj]}"><span>${subjImg(subj)} ${SUBJ[subj]}・${{easy:'かんたん',normal:'ふつう',hard:'むずかしい'}[diff]}</span>
      <span class="dots631">${Array.from({length:n}, (_, k) => `<i class="${k < i ? 'd' : k===i ? 'c' : ''}"></i>`).join('')}</span>
      ${combo >= 2 ? `<b class="cb631">れんぞく！ ${combo}もん</b>` : ''}${teacher ? `<img class="tc631" src="${X(rsrc(teacher))}" alt="">` : ''}</div>
      ${m.rev ? '<div class="revt631">🔥 にがて リベンジ！</div>' : ''}${i===n-1 && hana===2 && diff!=='easy' ? '' : ''}${diff!=='easy' && hana + (n - i) >= 3 && hana >= 2 && i===n-1 && hana===4 ? '<div class="near631">あと1もんで ★3！</div>' : ''}`;
    const r = await askQ(m, head, 'school');
    if(r.quit) return quitOut();
    if(r.ok && r.tries===1){
      hana++; first++; combo++; maxCombo = Math.max(maxCombo, combo);
      coin += CFG.coin[diff] + (combo >= 2 ? combo - 1 : 0);
      if(combo >= 3) L.combo3 = 1;
      if(m.rev && note){ revOK++; L.rev++; const g2 = noteOK(note); if(g2.grad) grads.push(g2); }
      await pop('💮', combo >= 2 ? `れんぞく！ ${combo}もん` : 'はなまる！');
    } else if(r.ok){
      combo = 0; coin += CFG.coin[diff] * CFG.hintMul;
      await pop('⭕', 'ヒントで せいかい！ つぎは ヒントなしで いけるかな？');
    } else {
      combo = 0;
      const v = await explainStep(m, r.v, head, [{label:'✅ わかった！（うっかり）', cls:'gold', v:'u'}, {label:'✅ わかった！（わからなかった）', cls:'gold', v:'k'}]);
      if(v==='__quit') return quitOut();
      addNote(m, v); wak++; L.wak++;
      await pop('📒', 'えらい！ にがてノートに のせたよ');
    }
    const a = s.acc[wkOf(L.d)] || (s.acc[wkOf(L.d)] = {}); const aa = a[subj] || (a[subj] = [0,0]); aa[1]++; if(r.ok && r.tries===1) aa[0]++;
  }
  QUITOK = false; QUITFN = null;
  /* けっか */
  const star = diff==='easy' ? (hana >= 3 ? 1 : 0) : hana >= 5 ? 3 : hana >= 4 ? 2 : hana >= 3 ? 1 : 0;
  const lines = []; let total = 0, cry = 0;
  if(good){
    let c = coin * (sp===subj ? 1.5 : 1) * (s.streak >= 30 ? 1.2 : s.streak >= 7 ? 1.1 : 1);
    if(practice) c *= CFG.overMul;
    c = Math.round(c); total += c; lines.push(`🪙 じゅぎょう +${c}${sp===subj ? '（とくべつ ×1.5）' : ''}${practice ? '（れんしゅう）' : ''}`);
    if(wak){ total += wak * CFG.wakatta; lines.push(`📒 わかった！ +${wak * CFG.wakatta}`); }
    if(revOK){ total += revOK * CFG.revenge; lines.push(`🔥 リベンジせいこう！ +${revOK * CFG.revenge}`); }
    if(!practice && star===3 && diff==='hard'){ total += 30; lines.push('🏆 ちょうせん成功 +30'); }
    if(!practice && star===3 && diff!=='easy' && Math.random() < (diff==='hard' ? .5 : .2)){ if(giveCry()){ cry++; lines.push('💎 すいしょう 1こ！'); } }
    grads.forEach(g2 => { lines.push('🎓 にがて そつぎょう！'); if(g2.mile){ total += g2.mile.pt; lines.push(`🏅 そつぎょう ${g2.mile.n}もん たっせい +${g2.mile.pt}`); } });
  }
  /* ★・スタンプ */
  const oldB = L.best[subj] || 0, wk = wkOf(L.d);
  if(good && star > oldB){ const up = star - oldB; L.best[subj] = star; s.stars[subj] = (s.stars[subj]||0) + up; const W = s.wk[wk] || (s.wk[wk] = {}); W[subj] = (W[subj]||0) + up; }
  const stampNew = good && oldB < 1 && star >= 1;
  L.cnt[subj] = (L.cnt[subj]||0) + 1;
  /* しゅっせき */
  const at = good ? attend() : null;
  if(at && at.msg) lines.unshift(`🎫 ${at.msg}`);
  if(at && at.rew){ const R = at.rew; let t = `🎉 つうさん しゅっせき ${R.n}にち！`;
    if(R.pt){ total += R.pt; t += ` +${R.pt}`; } if(R.cry && giveCry()){ cry++; t += '・💎1'; } if(R.fuku){ s.fuku += R.fuku; t += `・ふくびき×${R.fuku}`; }
    if(R.deco){ const it = decoItem(R.n >= 100); if(it) t += `・かざり「${it.name}」`; } if(R.b && !s.badges.includes(R.b)){ s.badges.push(R.b); t += `・「${R.b}」バッジ`; } if(R.t && !s.titles.includes(R.t)){ s.titles.push(R.t); t += `・しょうごう「${R.t}」`; }
    lines.push(t); }
  /* かいきん賞 */
  if(good && !L.kaikin && SK.every(k => (L.best[k]||0) >= 1)){ L.kaikin = 1; total += CFG.kaikin; s.fuku++; lines.push(`🏅 かいきん賞！ +${CFG.kaikin}・ふくびき券 1まい`); }
  /* きずな */
  const bondEv = [];
  if(good){ ml.forEach(r => bondEv.push(...addBond(r.id, 1, true))); }
  if(good && s.req && !s.req.done && s.req.subj===subj){ s.req.done = 1; const r = resBy(s.req.rid); if(r){ bondEv.push(...addBond(r.id, 3, false)); total += 50; lines.push(`💌 ${r.name}の おねがい たっせい！ +50・きずな+3`); } }
  bondEv.forEach(ev => { const r = resBy(ev.id); if(!r) return; if(ev.gift){ total += ev.gift; lines.push(`🎁 ${r.name}から おれいの しな +${ev.gift}`); } if(ev.lv) lines.push(`💗 ${r.name}と きずな Lv${ev.lv}！`); });
  /* ミッション・目標 */
  if(good){ checkMissions().forEach(mi => { total += CFG.mission; lines.push(`✅ ミッション「${mi.t}」 +${CFG.mission}`); });
    if(checkGoal()){ total += 100; const r = choice(ml); if(r) addBond(r.id, 2, false); lines.push('🎯 こんしゅうの 目標 たっせい！ +100・しゅうかんバッジ'); } }
  /* バッジ */
  let badgeUp = null; const bn = badgeNext();
  if(good && bn && bn.ok){ s.badge++; badgeUp = bn.b; if(bn.b.rew){ total += bn.b.rew; } if(s.badge===3){ decoItem(true); if(!s.titles.includes('にじいろの がくしゅうしゃ')) s.titles.push('にじいろの がくしゅうしゃ'); }
    lines.push(`🏅 ${bn.b.n}バッジに しょうかく！${bn.b.rew ? ` +${bn.b.rew}` : ''}${s.badge===2 ? '・だいがく 入学試験に ちょうせん できるよ' : ''}`); }
  if(total) pts(total, `がっこう ${SUBJ[subj]}の じゅぎょう`);
  persist();
  /* けっか がめん */
  const nb = badgeNext(), least = SK.filter(k => k!==subj).sort((a,b) => (L.best[a]||0) - (L.best[b]||0) || (L.cnt[a]||0) - (L.cnt[b]||0))[0];
  const stamps = SK.filter(k => (L.best[k]||0) >= 1).length;
  const limit = SK.every(k => (L.cnt[k]||0) >= CFG.fullClass);
  ROOT.innerHTML = `<div class="wrap631 result"><div class="res631">
    ${stage('bg_school', ml, {bounce: star===3, noLv:true, cls:'mini clear633'})}
    <h2>じゅぎょう おしまい！</h2><div class="bigst631">${Array.from({length: diff==='easy' ? 1 : 3}, (_, i) => `<i class="${i < star ? 'on' : ''}" style="animation-delay:${.25 + i*.35}s">★</i>`).join('')}</div>
    <p class="hn631">💮 はなまる ${hana}/5${maxCombo >= 2 ? `　さいだい れんぞく ${maxCombo}` : ''}</p>
    ${!good ? '<p class="warn631">⚠️ 端末の 日づけが もどっているので ごほうびは ありません</p>' : ''}
    <ul class="ln631">${lines.map(l => `<li>${X(l)}</li>`).join('')}</ul>
    ${total ? `<div class="tot631">ごうけい <b>+${fmt(total)}</b> pt${cry ? '　💎×' + cry : ''}</div>` : ''}
    ${stampNew ? `<div class="stp631">スタンプ ${stamps}/5 ${stamps===4 ? '<b>あと1つで かいきん賞！</b>' : ''}</div>` : ''}
    ${nb ? `<div class="nx631">つぎの ${nb.b.n}まで：${nb.needSt ? `★あと${nb.needSt}こ` : '★OK'}／${nb.needD ? `あと${nb.needD}にち` : '日数OK'}${bar(nb.tot, nb.b.st)}</div>` : ''}
    ${limit ? `<p class="tmr631">きょうは いっぱい がんばったね！ あしたは ${SUBJ[special(addDay(L.d,1))]}の とくべつじゅぎょうが まってるよ</p>` : `<p class="tmr631">つぎは <b>${SUBJ[least]}</b>が いいかも？</p>`}
    <div class="rb631"><button type="button" class="btn gold" data-a="again">✏️ もう1じゅぎょう（${SUBJ[least]}）</button><button type="button" class="btn white" data-a="back">がっこうに もどる</button></div>
  </div></div>`;
  if(star === 3){ confetti(1800); sound('fan'); } else sound(star ? 'ok' : 'ng');
  if(badgeUp) setTimeout(() => confetti(2500), 900);
  ROOT.querySelector('[data-a="again"]').onclick = e => { e.stopPropagation(); ST.subj = least; schoolMain(); };
  ROOT.querySelector('[data-a="back"]').onclick = e => { e.stopPropagation(); schoolMain(); };
}
function pop(ic, txt){
  return new Promise(res => { const p = ROOT.querySelector('.qz631'); if(!p) return res();
    p.insertAdjacentHTML('beforeend', `<div class="pop631"><span>${ic}</span><b>${X(txt)}</b></div>`); setTimeout(res, 900); });
}

/* ---------- がっこう：サブ がめん ---------- */
async function calendar(){
  const s = SV(), next = Object.keys(CFG.attendRew).map(Number).find(n => n > s.attend);
  const d = D4(), cells = Array.from({length:14}, (_, i) => addDay(d, i - 13));
  await dialog(`<h2 class="dlgT">${ic('streak','h')} しゅっせき</h2>
    <div class="cal631">${cells.map(c => `<span class="${s.wkDays[c] ? 'on' : ''} ${c===d ? 'td' : ''}"><small>${+c.slice(8)}</small>${s.wkDays[c] ? '🌸' : ''}</span>`).join('')}</div>
    <p class="dlgP">つうさん <b>${s.attend}にち</b>／れんぞく <b>${s.streak||0}にち</b><br>🎫 お休みチケット ${s.tickets||0}まい（まいしゅう月曜に 1まい・さいだい2まい）</p>
    ${next ? `<p class="dlgP facNote">つぎの おめでとうは ${next}にち（あと ${next - s.attend}にち）</p>` : ''}
    ${s.titles.length ? `<p class="dlgP">しょうごう：${s.titles.map(X).join('・')}</p>` : ''}`, [{label:'とじる', cls:'gold', v:1}], 'wide');
}
async function misInfo(){
  const M = missions(); await dialog(`<h2 class="dlgT">${ic('mission','h')} きょうの ミッション</h2><ul class="mi631">${M.list.map((m,i) => `<li class="${M.done[i] ? 'ok' : ''}">${M.done[i] ? '✅' : '⬜'} ${X(m.t)} <small>+${CFG.mission}</small></li>`).join('')}</ul>
    <p class="dlgP facNote">3つ ぜんぶで 🎁たからばこ（コイン+${CFG.chest}・きずな+1）。まいあさ 4じに かわるよ</p>`, [{label:'とじる', cls:'gold', v:1}], 'wide');
}
async function openChest(){
  const M = missions(); if(M.chest) return toast('きょうの たからばこは あけたよ');
  if(!M.done.every(Boolean)) return misInfo();
  if(!dayOK()) return; M.chest = 1; pts(CFG.chest, 'がっこう ミッション たからばこ'); const r = choice(mates()); if(r) addBond(r.id, 1, false);
  persist(); sound('fan'); confetti(1500);
  await dialog(`<div class="big631">${ic('chest','xl')}</div><h2 class="dlgT">たからばこ ゲット！</h2><p class="dlgP">コイン +${CFG.chest}${r ? `<br>💗 ${X(r.name)}と きずな +1` : ''}</p>`, [{label:'やったー！', cls:'gold', v:1}]);
  schoolMain();
}
async function doFuku(){
  const s = SV(); if(!s.fuku) return dialog(`<h2 class="dlgT">${ic('fuku','h')} ふくびき</h2><p class="dlgP">かいきん賞（5きょうか スタンプ）で ふくびき券が もらえるよ。<br>ハズレなし！</p>`, [{label:'とじる', cls:'gold', v:1}]);
  s.fuku--; const o = fukubiki(); persist(); sound('fan'); confetti(1200);
  await dialog(`<div class="big631 spin631">${ic('fuku','xl')}</div><h2 class="dlgT">あたり！</h2><p class="dlgP"><b>${X(o.t)}</b></p><p class="dlgP facNote">のこり ふくびき券 ${s.fuku}まい</p>`, [{label:'やったー！', cls:'gold', v:1}]);
  schoolMain();
}
async function notesView(){
  const s = SV(); const by = SK.map(k => [k, s.notes.filter(n => n.subj===k)]);
  await dialog(`<h2 class="dlgT">${ic('nigate','h')} にがてノート</h2><p class="dlgP">いま <b>${s.notes.length}こ</b>　そつぎょう <b>${s.grad||0}こ</b></p>
    <div class="nt631">${by.map(([k, L]) => `<div><b style="color:${SUBJ_C[k]}">${subjImg(k)} ${SUBJ[k]}</b><span>${L.length}こ</span><small>${L.slice(0,4).map(n => (n.u==='kanji' ? (BUILTIN.find(q => q.id===n.kid)?.word || '漢字') : (MATH_UNITS[n.u]?.name || n.u)) + ' ' + '●'.repeat(n.ok.length) + '○'.repeat(3 - n.ok.length)).map(X).join('<br>')}</small></div>`).join('')}</div>
    <p class="dlgP facNote">「ふつう」の じゅぎょうで リベンジ（+${CFG.revenge}）。べつべつの 日に 3かい せいかいで そつぎょう！</p>`, [{label:'とじる', cls:'gold', v:1}], 'wide');
}
async function goalView(){
  const s = SV(), G = s.goal;
  if(G && G.g){ const p = goalProg(); return dialog(`<h2 class="dlgT">${ic('goal','h')} こんしゅうの 目標</h2><p class="dlgP"><b>${X(p[2])}</b>：${p[0]} / ${p[1]}${p[3]}</p>${bar(p[0], p[1])}<p class="dlgP facNote">${G.done ? '✅ たっせい！ しゅうかんバッジ ゲット' : 'たっせいで コイン+100・きずな+2'}</p>`, [{label:'とじる', cls:'gold', v:1}], 'wide'); }
  const v = await dialog(`<h2 class="dlgT">${ic('goal','h')} こんしゅうの 目標を えらぼう</h2><p class="dlgP">じぶんで 1つ えらんでね（たっせいで コイン+100・きずな+2）</p>`,
    [{label:'📅 5にち きょうしつに くる', cls:'white big', v:'days'}, {label:'⭐ ★を 15こ あつめる', cls:'white big', v:'stars'}, {label:'📒 にがてを 3つ そつぎょう', cls:'white big', v:'grad'}, {label:'あとで', cls:'', v:''}], 'wide');
  if(v){ G.g = v; persist(); toast('目標を きめたよ！'); schoolMain(); }
}
async function reqView(){
  const s = SV(), R = s.req, r = R && resBy(R.rid);
  if(!r) return dialog(`<h2 class="dlgT">💌 おねがい</h2><p class="dlgP">いまは おねがいは ないよ</p>`, [{label:'とじる', cls:'gold', v:1}]);
  const v = await dialog(`<div class="dlgArt"><img src="${X(rsrc(r))}" alt="" style="height:90px"></div><div class="talkBubble"><b>${X(r.name)}</b>${X(speak(r, R.done ? 'てつだって くれて ありがとう！' : `${SUBJ[R.subj]}の しゅくだい てつだって！`))}</div>
    <p class="dlgP facNote">${R.done ? '✅ たっせい ずみ（また らいしゅう）' : `${SUBJ[R.subj]}の じゅぎょうを 1かい うけると たっせい（きずな+3・コイン+50）`}</p>`, R.done ? [{label:'とじる', cls:'gold', v:0}] : [{label:`${subjImg(R.subj)} ${SUBJ[R.subj]}を えらぶ`, cls:'gold', v:1}, {label:'あとで', v:0}], 'wide');
  if(v){ ST.subj = R.subj; schoolMain(); }
}
async function pickDiff(k){
  const s = SV(), L = DL(), sp = special(L.d), n = L.cnt[k]||0;
  const rec = (L.best[k]||0) >= 3 && {easy:'normal', normal:'hard'}[s.lastDiff];
  const D = [['easy','かんたん','df_easy','★1まで'],['normal','ふつう','df_normal','★3まで'],['hard','むずかしい','df_hard','★3＋ボーナス']];
  sound('ok');
  const v = await dialog(`<div class="pk639" style="--c:${SUBJ_C[k]}"><span class="pki">${subjImg(k)}</span><div><b>${SUBJ[k]}</b>${k===sp ? '<em>とくべつ ×1.5！</em>' : ''}<small>${n >= CFG.fullClass ? 'きょうは れんしゅうモード（コイン×0.2）' : `きょう ${n}/${CFG.fullClass}かい`}</small></div></div><p class="dlgP">どの もんだいに ちょうせん する？</p>`,
    D.map(([d, nm, im, sub]) => ({label:`<img src="${IMG633}${im}.webp" alt=""><b>${nm}</b><small>${sub}</small>${rec===d ? '<em>おすすめ</em>' : ''}${(s.lastDiff||'normal')===d ? '<i>まえかい</i>' : ''}`, cls:`white df639 ${d}`, v:d})).concat([{label:'やめる', cls:'white cancel639', v:''}]), 'wide dfw639');
  if(!v) return;
  ST.subj = k; ST.diff = v; s.lastDiff = v; persist();
  await runClass(k, v);
}
async function badgeView(){
  const s = SV(), tot = SK.reduce((a,k) => a + (s.stars[k]||0), 0);
  await dialog(`<h2 class="dlgT">${medal(s.badge+1,'h')} がっこうバッジ</h2><p class="dlgP">★ ごうけい <b>${tot}</b>　つうさん しゅっせき <b>${s.attend}にち</b></p>
    <table class="rep631">${CFG.badge.slice(1).map((b, i) => `<tr class="${s.badge >= i+1 ? 'got' : ''}"><th>${medal(i+2)} ${b.n}</th><td>★${b.st}・${b.d}にち${b.each ? `・5きょうか ★${b.each}いじょう` : ''}</td><td>${s.badge >= i+1 ? '✅' : ''}</td></tr>`).join('')}</table>
    <div class="sbst631">${SK.map(k => `<span>${subjImg(k)} ★${s.stars[k]||0}</span>`).join('')}</div>
    ${(() => { const bn = badgeNext(); return bn ? `<div class="bdb639"><b>つぎの ${medal(s.badge+2,'s')}${bn.b.n}まで</b><div class="bb636"><small>★ ${bn.tot}/${bn.b.st}</small><span class="bar631"><i style="width:${Math.min(100, bn.tot/bn.b.st*100)}%"></i></span></div><div class="bb636"><small>しゅっせき ${s.attend}/${bn.b.d}日</small><span class="bar631 d"><i style="width:${Math.min(100, s.attend/bn.b.d*100)}%"></i></span></div>${bn.each.length ? `<div class="bb636 e"><small>5きょうか ★${bn.b.each}ずつ：あと ${bn.each.map(k => SUBJ[k]).join('・')}</small></div>` : ''}</div>` : ''; })()}
    <p class="dlgP facNote">ゴールドで だいがくの 入学試験に ちょうせん できるよ</p>`, [{label:'とじる', cls:'gold', v:1}], 'wide');
}

/* =====================================================================
   だいがく
   ===================================================================== */
const TH = [
  {id:'env',  n:'かんきょう',        ic:'🌍', mul:1.5, need:0,  u:['r_bug','r_bugpic','r_plant','r_plantpic','r_water','r_land','r_flower','r_earth','cg_clim','w_cont','s_jp'], prop:'🌱'},
  {id:'life', n:'いのち・けんこう',  ic:'❤️', mul:1.5, need:0,  u:['r_body','r_hbody','r_life','r_bio'], prop:'🩺'},
  {id:'soc',  n:'しゃかい・けいざい', ic:'🏛️', mul:1.5, need:0,  u:['cg_world','cg_japan','cg_skill','civ1','civ2','w_geo','j_geo','w_cap'], prop:'📊'},
  {id:'tech', n:'テクノロジー',      ic:'💻', mul:2,   need:5,  u:['pr_seq','pr_loop','pr_if','pr_word','pr_var','pr_bug','pr_bin','pr_flow','pr_algo'], prop:'💻'},
  {id:'space',n:'うちゅう',          ic:'🪐', mul:2,   need:5,  u:['r_sky','r_moon','r_earth','r_sun'], prop:'🔭'},
  {id:'chem', n:'かがく（元素）',    ic:'⚗️', mul:2,   need:15, u:['r_el1','r_el2','r_el3','r_chem','r_sol','r_burn'], prop:'🧪'},
  {id:'lang', n:'ことばと えいご',   ic:'🔠', mul:2,   need:15, u:['ek_sent2','ek_make','ek_wh','ek_prep','ek_spell','ek_opp','b_tsunagu','kanji'], prop:'📚'},
  {id:'math', n:'すうがく',          ic:'📐', mul:2.5, need:30, u:['ratio','ave','divisor','fracadd','vol','decmd','r_calc'], prop:'📐'},
  {id:'logic',n:'ろんり パズル',     ic:'🧩', mul:2.5, need:30, u:['pr_algo','pr_flow','pr_bin','pr_bug','rules','box'], prop:'🧩'}
];
const THM = id => TH.find(t => t.id===id);
const LV = ['ベーシック','アドバンス','マスター'];
let UT = {th:null, lv:0};
const thData = id => { const u = UV(); return u.th[id] || (u.th[id] = {lv:0, s:[0,0,0], days:[[],[],[]], first:'', adv:'', mas:''}); };
const thOpen = t => UV().total >= t.need;
function lvCheck(id){
  const d = thData(id), today = D4(), out = [];
  if(d.lv < 1){ const ok = d.s[0] >= CFG.adv.n && d.days[0].length >= CFG.adv.days && d.first && dnum(today) - dnum(d.first) >= CFG.adv.wait; if(ok){ d.lv = 1; d.adv = today; out.push(1); } }
  if(d.lv === 1){ const ok = d.s[1] >= CFG.mas.n && d.days[1].length >= CFG.mas.days && d.adv && dnum(today) - dnum(d.adv) >= CFG.mas.wait; if(ok){ d.lv = 2; d.mas = today; out.push(2); } }
  return out;
}
function lvNeed(id){
  const d = thData(id), today = D4();
  if(d.lv === 0){ const w = d.first ? Math.max(0, CFG.adv.wait - (dnum(today) - dnum(d.first))) : CFG.adv.wait; return {n:Math.max(0, CFG.adv.n - d.s[0]), d:Math.max(0, CFG.adv.days - d.days[0].length), w, tot:CFG.adv.n, cur:d.s[0]}; }
  if(d.lv === 1){ const w = Math.max(0, CFG.mas.wait - (dnum(today) - dnum(d.adv))); return {n:Math.max(0, CFG.mas.n - d.s[1]), d:Math.max(0, CFG.mas.days - d.days[1].length), w, tot:CFG.mas.n, cur:d.s[1]}; }
  return null;
}
function recoTheme(){
  const u = UV(), w = wkOf(D4());
  if(u.recoWk !== w){ const L = TH.filter(thOpen); const un = L.filter(t => !(thData(t.id).s[0])); u.reco = (choice(un.length ? un : L) || TH[0]).id; u.recoWk = w; }
  return u.reco;
}
function degNext(){
  const u = UV(), D = CFG.degree[u.degree + 1]; if(!D) return null;
  const advN = TH.filter(t => thData(t.id).lv >= 1).length, masN = TH.filter(t => thData(t.id).lv >= 2).length;
  return {D, needP:Math.max(0, D.pt - u.degPt), needD:Math.max(0, D.d - u.days), needA:D.adv ? Math.max(0, D.adv - advN) : 0, needM:D.mas ? Math.max(0, D.mas - masN) : 0,
    ok:u.degPt >= D.pt && u.days >= D.d && (!D.adv || advN >= D.adv) && (!D.mas || masN >= D.mas)};
}
/* ---------- v6.32（STEP4）：だいがくの 挑戦教科の 問題（テーマごと ベーシック／アドバンス／マスター 各10もん） ---------- */
const BANK632 = {"space": [[["太陽に いちばん 近い わくせいは？", "水星", ["金星", "火星", "地球"], "水星は 太陽に いちばん 近い わくせい。太陽の まわりを 約88日で 1しゅう する。", "planets"], ["地球の まわりを まわっている 天体は？", "月", ["太陽", "火星", "金星"], "月は 地球の ただ1つの 衛星。約27日で 地球の まわりを 1しゅう する。", ""], ["太陽系で いちばん 大きい わくせいは？", "木星", ["土星", "地球", "海王星"], "木星の 直径は 地球の 約11倍。大きな うずの「大赤斑」が ある。", "planets"], ["きれいな 輪（リング）で 有名な わくせいは？", "土星", ["火星", "水星", "金星"], "土星の 輪は 氷や 岩の つぶが あつまって できている。", "planets"], ["「赤い わくせい」と よばれるのは？", "火星", ["木星", "金星", "天王星"], "火星の 地面には さびた 鉄を ふくむ すなが 多く、赤っぽく 見える。", "planets"], ["太陽のように 自分で 光る 天体を なんという？", "恒星", ["わくせい", "衛星", "すい星"], "恒星は 自分で 光と 熱を 出す。わくせいや 月は 太陽の 光を はね返して 光って 見える。", ""], ["夏の 大三角を つくる 星で ないのは？", "シリウス", ["ベガ", "デネブ", "アルタイル"], "夏の 大三角は ベガ・アルタイル・デネブ。シリウスは 冬の 星。", ""], ["北の 空で ほとんど うごかない 星は？", "北極星", ["シリウス", "ベテルギウス", "すばる"], "北極星は 地球の 自転の 軸の 先に あるので、ほとんど 位置が かわらない。方角の 目じるしに なる。", ""], ["地球が 太陽の まわりを 1しゅう する 時間は？", "約1年", ["約1日", "約1か月", "約10年"], "地球の 公転は 約365日。1日は 地球が 自分で 1回転（自転）する 時間。", ""], ["月の 形が 毎日 かわって 見える 理由は？", "太陽に てらされた 部分の 見え方が かわるから", ["月が 毎日 形を かえるから", "雲に かくれるから", "地球の かげが うつるから"], "月は 太陽の 光が あたった 半分だけ 光る。地球からの 見え方が かわるので 満ち欠けする。", ""]], [["わくせいを 太陽に 近い じゅんに ならべた とき 4番目は？", "火星", ["地球", "木星", "金星"], "「すい・きん・ち・か・もく・ど・てん・かい」。水星・金星・地球・火星・木星・土星・天王星・海王星。", "planets"], ["太陽の 光が 地球まで とどく 時間は およそ？", "約8分", ["約8秒", "約8時間", "約8日"], "光は 1秒に 約30万km すすむ。太陽まで 約1億5000万kmなので 約500秒＝約8分。", ""], ["1光年とは 何を あらわす 単位？", "光が 1年で すすむ きょり", ["光が 1年で へる 明るさ", "1年の 長さ", "星の 重さ"], "1光年は 約9兆5000億km。とても 遠い 星までの きょりに つかう。", ""], ["金星が 明け方か 夕方にしか 見えない 理由は？", "地球より 内側を まわっているから", ["自分で 光るから", "夜は ねむっているから", "月に かくれるから"], "金星は 地球より 内側を まわるので、いつも 太陽の 近くに 見える。だから 真夜中には 見えない。", ""], ["太陽の 表面温度は およそ？", "約6000℃", ["約600℃", "約60℃", "約60万℃"], "太陽の 表面は 約6000℃。黒点は まわりより ひくい 約4000℃なので 黒く 見える。", ""], ["月食が おこるのは どんな ならび方の とき？", "太陽・地球・月が 一直線", ["太陽・月・地球が 一直線", "月と 火星が 重なる", "地球と 金星が 重なる"], "月食は 地球の かげに 月が 入る 現象で、満月の ときに おこる。太陽・月・地球の じゅんに ならぶと 日食。", "eclipse"], ["太陽を のぞいて 地球に いちばん 近い 恒星は？", "ケンタウルス座の 星", ["シリウス", "北極星", "ベガ"], "ケンタウルス座の プロキシマ星は 約4.2光年。光でも 4年以上 かかる。", ""], ["岩で できた「地球型わくせい」の 組み合わせは？", "水星・金星・地球・火星", ["木星・土星・天王星・海王星", "地球と 木星だけ", "すべての わくせい"], "内側の 4つは 岩で できた 小さく 重い わくせい。外側の 4つは ガスや 氷が 多い 大きな わくせい。", "planets"], ["オリオン座の 赤い 1等星は？", "ベテルギウス", ["リゲル", "シリウス", "アンタレス"], "ベテルギウスは 赤い 1等星、リゲルは 青白い 1等星。どちらも オリオン座。", ""], ["すい星（ほうき星）に 尾が できる 理由は？", "太陽に 近づくと 氷や ちりが ふき出すから", ["燃えているから", "月の 光を うけるから", "地球の 空気に ふれるから"], "すい星は 氷と ちりの かたまり。太陽に 近づくと ガスや ちりが 出て、太陽と はんたいがわに 尾が のびる。", ""]], [["天王星の とくちょうとして 正しいのは？", "自転の 軸が 横だおしに なっている", ["太陽系で いちばん あつい", "輪が まったく ない", "太陽に いちばん 近い"], "天王星は 自転軸が 約98度 かたむき、横だおしの ような かっこうで まわっている。", "planets"], ["金星が 水星より 遠いのに 表面温度が 高い 理由は？", "二酸化炭素の あつい 大気の 温室効果", ["自分で 光っているから", "火山が ないから", "自転が はやいから"], "金星の 大気は ほとんど 二酸化炭素で 熱が にげにくい。表面は 約460℃にも なる。", ""], ["夏至の 日、太陽の 南中高度は 1年の 中で どうなる？", "いちばん 高い", ["いちばん ひくい", "春分と 同じ", "0度に なる"], "地球の 軸が かたむいているので、夏至は 太陽が いちばん 高く のぼり、昼が いちばん 長い。", ""], ["季節が うまれる いちばんの 理由は？", "地球の 軸が かたむいたまま 公転するから", ["夏は 太陽に 近いから", "月の 引力", "太陽の 明るさが かわるから"], "軸の かたむき（約23.4度）で 太陽の 高さと 昼の 長さが かわり、季節が できる。", ""], ["恒星の 色が 青白いほど 表面温度は？", "高い", ["ひくい", "色と 温度は 関係ない", "0℃"], "恒星は 温度が 高いほど 青白く、ひくいほど 赤く 見える。", ""], ["月が いつも 同じ 面を 地球に むけている 理由は？", "月の 自転と 公転の 周期が 同じだから", ["月は 自転しないから", "地球の かげの せい", "月の うらは 光らないから"], "月は 約27.3日で 1回 自転し、同じ 時間で 地球を 1しゅう する。だから 同じ 面を むけつづける。", ""], ["天の川銀河について 正しいのは？", "1000億こ以上の 恒星が あつまっている", ["太陽が 中心に ある", "恒星は 100こ くらい", "天の川は 雲の 帯"], "太陽は 銀河の 中心から はなれた ところに ある。天の川は 銀河を 内側から 見た すがた。", ""], ["北の 空の 星が 北極星を 中心に まわって 見える 角度は 1時間に およそ？", "15度", ["1度", "30度", "90度"], "地球は 24時間で 360度 自転する。360÷24＝15度。", ""], ["ブラックホールの せつめいで 正しいのは？", "重力が とても 強く 光も ぬけ出せない", ["とても 明るく 光る 星", "中が からっぽの 穴", "太陽系の 中に ある"], "大きな 恒星が 一生を 終えて つぶれると できる ことが ある。光も にげられないので 直接は 見えない。", ""], ["太陽の エネルギーの みなもとは？", "水素が ヘリウムに かわる 核融合", ["石炭が 燃えている", "電気", "地球の 光の 反射"], "太陽の 中心では 約1500万℃で 水素の 原子核が くっつき、ばく大な エネルギーが 出る。", ""]]], "chem": [[["水の 化学式は？", "H₂O", ["CO₂", "O₂", "NaCl"], "水は 水素原子 2こと 酸素原子 1こで できている。", ""], ["二酸化炭素の 化学式は？", "CO₂", ["CO", "H₂O", "O₂"], "炭素（C）1こと 酸素（O）2こ。ものが 燃えたり 生き物が 呼吸すると 出る。", ""], ["食塩（塩化ナトリウム）の 化学式は？", "NaCl", ["KCl", "NaOH", "HCl"], "ナトリウム（Na）と 塩素（Cl）が 1：1で 結びついている。", ""], ["ものが 燃えるのを 助ける 気体は？", "酸素", ["窒素", "二酸化炭素", "水素"], "酸素には ものを 燃やす はたらきが ある。酸素 自体は 燃えない。", ""], ["空気中に いちばん 多く ふくまれる 気体は？", "窒素", ["酸素", "二酸化炭素", "アルゴン"], "空気の 約78%が 窒素、約21%が 酸素。", "air"], ["石灰水を 白く にごらせる 気体は？", "二酸化炭素", ["酸素", "水素", "窒素"], "二酸化炭素を 石灰水に 通すと 炭酸カルシウムが できて 白く にごる。", ""], ["火を 近づけると ポンと 音を 立てて 燃える 気体は？", "水素", ["酸素", "二酸化炭素", "窒素"], "水素は 燃えると 酸素と 結びついて 水に なる。", ""], ["元素記号「Fe」は 何？", "鉄", ["フッ素", "金", "銀"], "Fe は ラテン語の ferrum（鉄）から。フッ素は F。", ""], ["元素記号「Au」は 何？", "金", ["銀", "アルミニウム", "銅"], "Au は ラテン語の aurum（金）から。銀は Ag、銅は Cu、アルミニウムは Al。", ""], ["固体→液体→気体と すがたが かわることを 何という？", "状態変化", ["化学変化", "中和", "ろ過"], "すがたが かわっても 物質そのものは かわらない。これが 状態変化。", ""]], [["酸性の 水よう液に 青い リトマス紙を つけると？", "赤く なる", ["青の まま", "白く なる", "黄色に なる"], "酸性は 青→赤、アルカリ性は 赤→青。中性は どちらも かわらない。", ""], ["BTB液が 黄色に なるのは 何性？", "酸性", ["中性", "アルカリ性", "どれでも ない"], "BTB液は 酸性で 黄色、中性で 緑、アルカリ性で 青。", "btb"], ["塩酸と 水酸化ナトリウム水よう液を まぜると できる 塩は？", "塩化ナトリウム", ["炭酸カルシウム", "硫酸銅", "塩化カリウム"], "酸と アルカリが 打ち消しあう 中和で、水と 塩（ここでは 食塩）が できる。", ""], ["鉄が さびる とき 結びつく 気体は？", "酸素", ["窒素", "水素", "ヘリウム"], "鉄の さびは 鉄が 酸素と 結びついた もの。このような 変化を 酸化という。", ""], ["物質が 酸素と 結びつくことを 何という？", "酸化", ["還元", "中和", "ろ過"], "燃焼は はげしい 酸化。反対に 酸素を うばわれる ことを 還元という。", ""], ["原子の 中心に ある ものは？", "原子核", ["電子", "分子", "イオン"], "原子は 中心の 原子核（陽子と 中性子）と、そのまわりの 電子で できている。", "atom"], ["周期表で いちばん 右の 列（18族）の なかまは？", "貴ガス（希ガス）", ["アルカリ金属", "ハロゲン", "遷移金属"], "ヘリウム・ネオン・アルゴンなど。ほかの 物質と ほとんど 反応しない。", ""], ["水を 電気分解すると −極（陰極）に 出る 気体は？", "水素", ["酸素", "二酸化炭素", "塩素"], "水 → 水素 ＋ 酸素。体積は 水素：酸素＝2：1。水素は −極、酸素は ＋極に 出る。", ""], ["炭酸水素ナトリウムを 加熱すると 出てくる 気体は？", "二酸化炭素", ["酸素", "水素", "アンモニア"], "重そうを 熱すると 炭酸ナトリウム・水・二酸化炭素に 分かれる（分解）。", ""], ["水に よく とけて アルカリ性を しめし、つんとした においの 気体は？", "アンモニア", ["塩化水素", "二酸化炭素", "酸素"], "アンモニアは 水に とても よく とけ、アルカリ性。においが 強い。", ""]], [["質量保存の 法則とは？", "化学変化の 前後で 全体の 質量は かわらない", ["気体には 重さが ない", "水に とかすと 重さが へる", "加熱すると 必ず 重くなる"], "原子の 組み合わせが かわるだけで、原子の 数と 種類は かわらない。だから 全体の 質量は 同じ。", ""], ["銅 4.0g を 完全に 酸化させると 酸化銅 5.0g。結びついた 酸素は？", "1.0g", ["4.0g", "5.0g", "9.0g"], "5.0−4.0＝1.0g。銅と 酸素は 4：1の 質量の わりあいで 結びつく。", ""], ["銅 8.0g が 完全に 酸化すると 酸化銅は 何g？（銅：酸素＝4：1）", "10.0g", ["9.0g", "12.0g", "8.0g"], "酸素は 8.0÷4＝2.0g。酸化銅は 8.0＋2.0＝10.0g。", ""], ["原子の 陽子の 数で 決まるのは？", "元素の 種類（原子番号）", ["原子の 色", "分子の 形", "電子の 重さ"], "原子番号＝陽子の 数。陽子 1こなら 水素、6こなら 炭素、8こなら 酸素。", "atom"], ["原子番号 11 の 元素は？", "ナトリウム", ["マグネシウム", "ネオン", "アルミニウム"], "10 ネオン、11 ナトリウム、12 マグネシウム、13 アルミニウム。", ""], ["イオンについて 正しいのは？", "電子を 失うと 陽イオンに なる", ["電子を 失うと 陰イオンに なる", "陽子が ふえると イオンに なる", "イオンは 電気を おびない"], "電子（−）を 失うと ＋の 陽イオン、電子を うけとると −の 陰イオン。", ""], ["2H₂ ＋ O₂ → 2H₂O で、水素分子 4こと 反応する 酸素分子は？", "2こ", ["1こ", "4こ", "8こ"], "式から 水素分子：酸素分子＝2：1。4こなら 酸素は 2こ。", ""], ["10%の 食塩水 200g に ふくまれる 食塩は？", "20g", ["10g", "2g", "180g"], "200×0.1＝20g。濃度（%）＝とけている ものの 質量 ÷ 水よう液の 質量 ×100。", ""], ["密度 2.7g/cm³ の アルミニウム 10cm³ の 質量は？", "27g", ["2.7g", "270g", "12.7g"], "質量＝密度×体積＝2.7×10＝27g。", ""], ["マグネシウムを 燃やすと できる 物質は？", "酸化マグネシウム", ["炭酸マグネシウム", "水酸化マグネシウム", "塩化マグネシウム"], "2Mg＋O₂→2MgO。強い 光を 出して 燃え、白い 酸化マグネシウムに なる。", ""]]], "lang": [[["「I ___ a student.」の ___ に 入るのは？", "am", ["is", "are", "be"], "I には am、you と 複数には are、he・she・it には is。", ""], ["「He ___ soccer every day.」の ___ は？", "plays", ["play", "playing", "played"], "主語が 3人称単数（He）で 今の ことなので 動詞に s を つける。", ""], ["「さるも 木から 落ちる」の いみは？", "名人でも 失敗する ことが ある", ["さるは 木登りが へた", "高い ところは 危ない", "練習が 大事"], "上手な 人でも ときには 失敗する、という いみ。にた ことわざに「かっぱの 川流れ」。", ""], ["「石の 上にも 三年」の いみは？", "がまんして 続ければ いつか 報われる", ["石は つめたい", "3年で 石が あたたまる", "いそいでは いけない"], "つらくても しんぼうして 続ければ 成果が 出る、という いみ。", ""], ["「一石二鳥」の いみは？", "1つの ことで 2つの 得を する", ["鳥を 2わ つかまえる", "石を 2つ なげる", "一度に 2回 失敗する"], "1つの 石で 2わの 鳥を 落とす ことから。にた ことばに「一挙両得」。", ""], ["「What ___ you like?」の ___ は？", "do", ["does", "are", "is"], "一般動詞（like）の 疑問文。主語が you なので do を つかう。", ""], ["「Thank you.」への 返事として ふさわしいのは？", "You're welcome.", ["I'm sorry.", "Good night.", "See you."], "You're welcome.＝どういたしまして。", ""], ["「It's ___ apple.」の ___ は？", "an", ["a", "the", "two"], "a・i・u・e・o の 音で はじまる 名詞の 前は an。", ""], ["「十人十色」の いみは？", "考えや 好みは 人それぞれ ちがう", ["10人で 色を ぬる", "みんな 同じ 色が 好き", "色は 10色ある"], "人が 10人 いれば 10の 色（個性）が ある、という いみ。", ""], ["「She ___ my sister.」の ___ は？", "is", ["am", "are", "be"], "She（3人称単数）には is。", ""]], [["「I ___ to the park yesterday.」の ___ は？", "went", ["go", "goes", "going"], "yesterday（きのう）なので 過去形。go の 過去形は went。", ""], ["「Are you a teacher?」「No, I ___.」の ___ は？", "'m not", ["am", "don't", "isn't"], "Are you 〜? には Yes, I am. / No, I'm not. で 答える。", ""], ["「I am ___ TV now.」の ___ は？", "watching", ["watch", "watches", "watched"], "be動詞＋〜ing で「〜しているところ」（現在進行形）。", ""], ["「急がば 回れ」の いみは？", "急ぐ ときほど 確実な 方法を えらぶ ほうが よい", ["急いで 遠回りする", "回りながら 走る", "急ぐと 目が 回る"], "危ない 近道より、遠くても 確実な 道の ほうが けっきょく 早い、という 教え。", ""], ["「温故知新」の いみは？", "古い ことを 学んで 新しい 考えを 見つける", ["あたたかい 服を 新しく する", "昔は よかった", "新しい ものだけ 大事"], "「故きを 温ねて 新しきを 知る」（論語）から。", ""], ["「Can you swim?」の いみは？", "あなたは 泳げますか", ["あなたは 泳ぎましたか", "泳ぎに 行きましょう", "泳いでいますか"], "can＝〜できる。疑問文は Can を 前に 出す。", ""], ["「三日坊主」の いみは？", "あきっぽくて 長続きしない", ["3日 おぼうさんに なる", "3日で 終わる 仕事", "3日 休む"], "はじめても すぐ やめてしまう ことの たとえ。", ""], ["「This book is ___ than that one.」の ___ は？", "bigger", ["big", "biggest", "more big"], "2つを くらべる ときは 比較級。big → bigger（g を 重ねる）。", ""], ["「Mt. Fuji is the ___ mountain in Japan.」の ___ は？", "highest", ["higher", "high", "most high"], "3つ以上の 中で いちばん＝最上級。the highest。", ""], ["「花より 団子」の いみは？", "見た目より 実際に 役立つ ものを えらぶ", ["花が きらい", "団子は 花の 形", "花見で 団子を 食べては いけない"], "ながめて 楽しむ ことより、実際の 得を とる こと。", ""]], [["「I have ___ in Kyoto for three years.」の ___ は？", "lived", ["live", "living", "lives"], "have＋過去分詞で「ずっと〜している」（現在完了の 継続）。", ""], ["「This letter was ___ by Ken.」の ___ は？", "written", ["wrote", "write", "writing"], "be動詞＋過去分詞で 受け身「〜された」。write – wrote – written。", ""], ["「I want ___ a doctor.」の ___ は？", "to be", ["be", "being", "to being"], "want to＋動詞の 原形で「〜したい」（不定詞）。", ""], ["「The boy ___ is running is Tom.」の ___ は？", "who", ["which", "what", "where"], "人を 説明する 関係代名詞は who（または that）。", ""], ["「Do you know ___ he lives?」の ___ は？", "where", ["what", "who", "which"], "「彼が どこに 住んでいるか」＝ where he lives。文の 中の 疑問文は 主語＋動詞の じゅん。", ""], ["「He is good at ___ the piano.」の ___ は？", "playing", ["play", "to play", "plays"], "前置詞（at）の あとに 動詞を おく ときは 〜ing（動名詞）。", ""], ["「臥薪嘗胆」の いみは？", "目的の ために 長い あいだ 苦労に たえる", ["まきの 上で ねむる 健康法", "苦い ものを 食べる 習慣", "すぐに 仕返しする"], "中国の 故事から。目的を わすれない ため、わざと つらい 思いを して 心を ふるい立たせた。", ""], ["「漁夫の利」の いみは？", "2人が 争っている すきに 別の 人が 得を する", ["漁師が もうける", "魚が たくさん とれる", "がんばった 人が 得を する"], "シギと ハマグリが 争っている あいだに、漁師が 両方 とってしまった 故事から。", ""], ["「If I ___ a bird, I could fly.」の ___ は？", "were", ["am", "is", "be"], "現実と ちがう ことを 想像する 仮定法過去。be動詞は 主語に 関係なく were が 基本。", ""], ["「She has ___ finished her homework.」の ___ は？", "already", ["yet", "ever", "ago"], "already＝もう〜した（ふつうの 文）。yet は 疑問文・否定文で つかう。", ""]]], "math": [[["(−3)＋(−5) は？", "−8", ["8", "−2", "2"], "同じ 符号どうしの たし算は、数を たして 符号は そのまま。3＋5＝8 で −8。", "numline"], ["(−7)＋4 は？", "−3", ["3", "−11", "11"], "ちがう 符号どうしは 大きい ほうから 小さい ほうを ひく（7−4＝3）。符号は 大きい ほうの −。", "numline"], ["5−(−2) は？", "7", ["3", "−7", "−3"], "−2 を ひく ことは 2 を たす ことと 同じ。5＋2＝7。", "numline"], ["(−4)×(−3) は？", "12", ["−12", "7", "−7"], "−×− ＝ ＋。4×3＝12。", ""], ["(−18)÷6 は？", "−3", ["3", "−12", "−24"], "−÷＋ ＝ −。18÷6＝3 で −3。", ""], ["x＋5＝12 の x は？", "7", ["17", "−7", "60"], "両辺から 5を ひく。x＝12−5＝7。", ""], ["3x＝21 の x は？", "7", ["18", "24", "63"], "両辺を 3で わる。x＝21÷3＝7。", ""], ["x＝4 の とき 2x＋3 の 値は？", "11", ["9", "24", "14"], "2×4＋3＝8＋3＝11。", ""], ["−2 と −5、大きいのは？", "−2", ["−5", "同じ", "くらべられない"], "数直線では 右に あるほど 大きい。−2 の ほうが 右に ある。", "numline"], ["3a＋5a を 計算すると？", "8a", ["15a", "8", "8a²"], "同じ 文字の 項は 数（係数）どうしを たす。3＋5＝8 で 8a。", ""]], [["2x−3＝11 の x は？", "7", ["4", "8", "−7"], "両辺に 3を たして 2x＝14、x＝7。", ""], ["5x＝3x＋8 の x は？", "4", ["8", "1", "−4"], "5x−3x＝8、2x＝8、x＝4。", ""], ["2(x＋3)＝14 の x は？", "4", ["5.5", "8", "7"], "かっこを はずして 2x＋6＝14、2x＝8、x＝4。", ""], ["(−2)³ は？", "−8", ["8", "−6", "6"], "(−2)×(−2)×(−2)＝4×(−2)＝−8。− を 奇数回 かけると −。", ""], ["三角形の 3つの 角を たすと？", "180°", ["360°", "90°", "270°"], "どんな 三角形でも 内角の 和は 180°。", "tri"], ["四角形の 4つの 角を たすと？", "360°", ["180°", "540°", "720°"], "対角線で 三角形 2つに 分けられるので 180°×2＝360°。", ""], ["y は x に 比例し、x＝2 の とき y＝6。式は？", "y＝3x", ["y＝6x", "y＝x＋4", "y＝12/x"], "y＝ax に 代入。6＝2a、a＝3。", ""], ["y は x に 反比例し、x＝3 の とき y＝4。式は？", "y＝12/x", ["y＝4x/3", "y＝x＋1", "y＝3/x"], "y＝a/x に 代入。a＝3×4＝12。", ""], ["2(3a−1)−(a＋4) を 計算すると？", "5a−6", ["5a−2", "7a−6", "5a＋2"], "6a−2−a−4＝5a−6。−( ) を はずすと 中の 符号が すべて かわる。", ""], ["正六角形の 1つの 角の 大きさは？", "120°", ["108°", "135°", "60°"], "六角形の 内角の 和は 180×(6−2)＝720°。720÷6＝120°。", ""]], [["x＋y＝10、x−y＝4 の とき x は？", "7", ["3", "6", "14"], "2つの 式を たすと 2x＝14、x＝7（y＝3）。", ""], ["x＋y＝7、2x＋y＝11 の とき y は？", "3", ["4", "7", "1"], "下の 式から 上の 式を ひくと x＝4。y＝7−4＝3。", ""], ["y＝2x＋1 の グラフの 切片は？", "1", ["2", "−1", "0.5"], "y＝ax＋b の b が 切片（グラフが y軸と 交わる ところ）。", ""], ["y＝−3x＋5 で x が 2 ふえると y は？", "6 へる", ["6 ふえる", "3 へる", "5 ふえる"], "変化の 割合は −3。x が 2 ふえると y は −3×2＝−6。", ""], ["n角形の 内角の 和を あらわす 式は？", "180×(n−2)", ["180×n", "360×n", "180×(n−1)"], "n角形は 1つの 頂点からの 対角線で (n−2)この 三角形に 分けられる。", ""], ["正八角形の 外角 1つの 大きさは？", "45°", ["135°", "60°", "40°"], "多角形の 外角の 和は いつも 360°。360÷8＝45°。", ""], ["2本の 平行線に 直線が 交わる とき、錯角は？", "大きさが 等しい", ["和が 180°", "和が 90°", "いつも 直角"], "平行線なら 錯角も 同位角も 等しい。", ""], ["(x＋3)(x−3) を 展開すると？", "x²−9", ["x²＋9", "x²−6x−9", "x²＋6"], "(a＋b)(a−b)＝a²−b² の 公式。", ""], ["x²＝49 の x は？", "±7", ["7", "−7", "24.5"], "2乗して 49 に なる 数は 7 と −7 の 2つ。", ""], ["2つの さいころを なげて 目の 和が 7に なる 確率は？", "1/6", ["1/12", "7/36", "1/36"], "全部で 6×6＝36通り。和が 7 は 6通り。6/36＝1/6。", ""]]], "logic": [[["2, 4, 6, 8, □ の □は？", "10", ["9", "12", "16"], "2ずつ ふえている。", ""], ["1, 3, 9, 27, □ の □は？", "81", ["36", "54", "30"], "3倍ずつ ふえている。27×3＝81。", ""], ["○△○△○□ の □に 入るのは？", "△", ["○", "□", "☆"], "○ と △ が こうごに くりかえされている。", ""], ["A は B より 背が 高い。B は C より 高い。いちばん 高いのは？", "A", ["B", "C", "わからない"], "A＞B、B＞C なので A＞B＞C。", ""], ["10, 7, 4, □ の □は？", "1", ["0", "2", "3"], "3ずつ へっている。", ""], ["今日が 水曜日なら 10日後は？", "土曜日", ["金曜日", "日曜日", "木曜日"], "7日後は 同じ 水曜日。あと 3日 すすんで 土曜日。", ""], ["1, 1, 2, 3, 5, 8, □ の □は？", "13", ["11", "10", "16"], "前の 2つを たすと つぎの 数（フィボナッチ数列）。5＋8＝13。", ""], ["けんは りんごでも みかんでもない。りんご・みかん・ぶどうの どれ？", "ぶどう", ["りんご", "みかん", "わからない"], "のこりは ぶどうだけ。", ""], ["「すべての ねこは 動物」が 正しい とき、必ず 正しいのは？", "ねこの タマは 動物", ["すべての 動物は ねこ", "動物でない ねこが いる", "犬は ねこ"], "ねこは ぜんぶ 動物の なかま。逆の「動物なら ねこ」は 正しいとは かぎらない。", ""], ["時計の 長い はりが 1周すると 何分？", "60分", ["12分", "30分", "24分"], "長い はりは 1時間＝60分で 1周する。", ""]], [["2, 5, 10, 17, □ の □は？", "26", ["24", "25", "27"], "ふえ方が 3, 5, 7, 9 と 2ずつ 大きくなる。17＋9＝26。", ""], ["3人が 1回ずつ あくしゅすると 全部で 何回？", "3回", ["6回", "9回", "2回"], "AとB・AとC・BとC の 3回。", ""], ["4人が 1回ずつ あくしゅすると 全部で 何回？", "6回", ["4回", "8回", "12回"], "4×3÷2＝6回。同じ ペアを 2回 数えないように 2で わる。", ""], ["1, 4, 9, 16, □ の □は？", "25", ["20", "24", "32"], "1×1, 2×2, 3×3, 4×4…。つぎは 5×5＝25。", ""], ["A・B・C・D の 4人を 1列に ならべる ならべ方は？", "24通り", ["12通り", "16通り", "4通り"], "1番目 4通り×2番目 3通り×3番目 2通り×4番目 1通り＝24通り。", ""], ["いつも うそを つく 人が「わたしは 正直者」と 言った。この 発言は？", "うそ", ["本当", "どちらとも いえない", "意味が ない"], "うそつきは かならず うそを 言うので、この 発言は うそ。", ""], ["立方体（さいころの 形）の 面の 数は？", "6", ["8", "12", "4"], "立方体は 面6・頂点8・辺12。", ""], ["立方体の 辺の 数は？", "12", ["6", "8", "24"], "上の 面に 4本、下の 面に 4本、たてに 4本で 12本。", ""], ["100円玉と 50円玉が あわせて 7まいで 500円。100円玉は？", "3まい", ["2まい", "4まい", "5まい"], "ぜんぶ 50円玉なら 350円。足りない 150円 ÷（100−50）＝3まい。", ""], ["ある数を 2倍して 3を たすと 15。ある数は？", "6", ["9", "7.5", "5"], "逆に たどる。15−3＝12、12÷2＝6。", ""]], [["2, 6, 12, 20, 30, □ の □は？", "42", ["40", "36", "44"], "1×2, 2×3, 3×4, 4×5, 5×6…。つぎは 6×7＝42。", ""], ["5人から 2人の 代表を えらぶ えらび方は？", "10通り", ["20通り", "25通り", "5通り"], "5×4÷2＝10通り（じゅんばんは 関係ない）。", ""], ["つるとかめが あわせて 10ぴき、足は 28本。かめは？", "4ひき", ["6ぴき", "3びき", "5ひき"], "ぜんぶ つるなら 20本。28−20＝8、8÷(4−2)＝4ひき。", ""], ["A「Bは うそつき」B「Cは うそつき」C「AもBも うそつき」。正直者が 1人だけなら だれ？", "B", ["A", "C", "わからない"], "Bが 正直なら、Cは うそつき。Aの「Bは うそつき」も うそ。Cの 発言も うそで、すべて 合う。", ""], ["1から 100までの 整数を ぜんぶ たすと？", "5050", ["5000", "10000", "4950"], "1＋100、2＋99…と 101の 組が 50組。101×50＝5050。", ""], ["3時 ちょうどの 長い はりと 短い はりの 角度は？", "90°", ["60°", "120°", "45°"], "1時間ぶんは 360÷12＝30°。3時間ぶんで 90°。", ""], ["2進数の 1011 を ふつうの 数（10進数）に すると？", "11", ["13", "9", "1011"], "8＋0＋2＋1＝11。", ""], ["6チームで 総当たり戦を すると 試合数は？", "15試合", ["30試合", "12試合", "36試合"], "6×5÷2＝15試合。", ""], ["あたりは 1つ。「Aは あたり」「Bは はずれ」「Aは はずれ」の うち 本当は 1つだけ。あたりは？", "B", ["A", "C", "わからない"], "「Aは あたり」と「Aは はずれ」は どちらかが 必ず 本当。だから「Bは はずれ」は うそ → Bが あたり。", ""], ["正方形の 紙を 半分に 3回 おって ひらくと、いくつの 部分に 分かれる？", "8こ", ["6こ", "9こ", "16こ"], "おる たびに 2倍。2×2×2＝8こ。", ""]]]};
const FIG632 = {
planets:`<svg viewBox="0 0 340 92" width="320" class="fig632"><rect width="340" height="92" rx="10" fill="#14213D"/><circle cx="-6" cy="46" r="34" fill="#FFC93C"/><text x="6" y="88" fill="#FFE08A" font-size="9">太陽</text>
${[[42,4,'#B8B0A6','水星'],[66,6,'#E8C27A','金星'],[92,6.5,'#4C9BE8','地球'],[116,5,'#D9603B','火星'],[154,15,'#D9A066','木星'],[204,12,'#E8CF8E','土星'],[248,9,'#8FD6E0','天王星'],[288,9,'#4E6FD8','海王星']].map(([x,r,c,n])=>`<circle cx="${x}" cy="40" r="${r}" fill="${c}"/>${n==='土星'?`<ellipse cx="${x}" cy="40" rx="${r*1.8}" ry="${r*.45}" fill="none" stroke="#C9B07A" stroke-width="2"/>`:''}<text x="${x}" y="76" fill="#fff" font-size="9.5" text-anchor="middle">${n}</text>`).join('')}</svg>`,
eclipse:`<svg viewBox="0 0 320 110" width="310" class="fig632"><rect width="320" height="110" rx="10" fill="#14213D"/><circle cx="30" cy="55" r="24" fill="#FFC93C"/><text x="30" y="100" fill="#FFE08A" font-size="10" text-anchor="middle">太陽</text>
<polygon points="168,40 300,48 300,62 168,70" fill="#000" opacity=".55"/><circle cx="168" cy="55" r="15" fill="#4C9BE8"/><text x="168" y="100" fill="#fff" font-size="10" text-anchor="middle">地球</text><circle cx="270" cy="55" r="7" fill="#9A8F86"/><text x="270" y="100" fill="#fff" font-size="10" text-anchor="middle">月（かげの中）</text><text x="160" y="18" fill="#FFE08A" font-size="11" text-anchor="middle">月食：太陽 → 地球 → 月</text></svg>`,
air:`<svg viewBox="0 0 220 110" width="220" class="fig632"><circle cx="60" cy="55" r="45" fill="#8EC5FF"/><path d="M60 55 L60 10 A45 45 0 0 1 102 67 Z" fill="#FF9E7A"/><path d="M60 55 L102 67 A45 45 0 0 1 98 79 Z" fill="#ccc"/><text x="120" y="35" font-size="12" fill="#2B6CB0">■ 窒素 約78%</text><text x="120" y="58" font-size="12" fill="#D2601E">■ 酸素 約21%</text><text x="120" y="81" font-size="12" fill="#777">■ その他 約1%</text></svg>`,
btb:`<svg viewBox="0 0 240 90" width="240" class="fig632">${[['#F2D23B','酸性','黄'],['#4CB86A','中性','緑'],['#3B6FD8','アルカリ性','青']].map(([c,n,k],i)=>`<g transform="translate(${20+i*75} 6)"><rect x="10" y="0" width="30" height="58" rx="6" fill="#fff" stroke="#888"/><rect x="11" y="22" width="28" height="35" rx="5" fill="${c}"/><text x="25" y="74" font-size="11" text-anchor="middle">${n}</text><text x="25" y="16" font-size="10" text-anchor="middle" fill="#555">${k}</text></g>`).join('')}</svg>`,
atom:`<svg viewBox="0 0 200 120" width="200" class="fig632"><ellipse cx="100" cy="60" rx="80" ry="28" fill="none" stroke="#9AA"/><ellipse cx="100" cy="60" rx="80" ry="28" fill="none" stroke="#9AA" transform="rotate(60 100 60)"/><ellipse cx="100" cy="60" rx="80" ry="28" fill="none" stroke="#9AA" transform="rotate(-60 100 60)"/><circle cx="94" cy="56" r="8" fill="#E8606A"/><circle cx="106" cy="56" r="8" fill="#9AA0AA"/><circle cx="100" cy="66" r="8" fill="#E8606A"/><circle cx="180" cy="60" r="5" fill="#3D8BE0"/><circle cx="60" cy="25" r="5" fill="#3D8BE0"/><text x="100" y="114" font-size="10" text-anchor="middle">●陽子(+) ●中性子 ●電子(−)</text></svg>`,
numline:`<svg viewBox="0 0 320 60" width="320" class="fig632"><line x1="10" y1="28" x2="310" y2="28" stroke="#555" stroke-width="2"/><polygon points="310,28 302,23 302,33" fill="#555"/>${Array.from({length:17},(_,i)=>i-8).map(n=>`<line x1="${160+n*18}" y1="22" x2="${160+n*18}" y2="34" stroke="#555"/><text x="${160+n*18}" y="50" font-size="10" text-anchor="middle" fill="${n<0?'#3D6FD8':n>0?'#D2601E':'#000'}">${n<0?'−'+(-n):n}</text>`).join('')}<text x="40" y="14" font-size="10" fill="#3D6FD8">← 小さい</text><text x="250" y="14" font-size="10" fill="#D2601E">大きい →</text></svg>`,
tri:`<svg viewBox="0 0 240 100" width="240" class="fig632"><polygon points="20,90 120,10 220,90" fill="#FFF3D6" stroke="#B5701C" stroke-width="2"/><text x="40" y="84" font-size="13" fill="#E8606A">a</text><text x="115" y="34" font-size="13" fill="#3D8BE0">b</text><text x="192" y="84" font-size="13" fill="#3BAF6A">c</text><text x="120" y="70" font-size="13" text-anchor="middle">a＋b＋c＝180°</text></svg>`
};

const BANK_RATE = {space:.8, chem:.7, lang:.75, math:.85, logic:.9};
function bankQ(id, lv, used){
  const B = BANK632[id]; if(!B) return null;
  const L = (B[lv] || []).concat(lv > 0 ? (B[lv-1] || []).filter(() => Math.random() < .25) : []);
  const fresh = L.filter(x => !isRecent('b632:' + id + ':' + x[0], used));
  const it = choice(fresh.length ? fresh : L); if(!it) return null;
  const [q, a, w, ex, fig] = it;
  const qh = String(q).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  return {html:`<div class="mqSent">${qh}</div>`, ans:a, opts:shuffle([a, ...w]), key:'b632:' + id + ':' + q, ex632:{ex, fig, a}, u:'bank632', subj:'sci', qg:7};
}
function themeQ(t, lv, used, stage){
  if(BANK632[t.id] && Math.random() < (BANK_RATE[t.id] || .8)){ const bq = bankQ(t.id, lv, used); if(bq) return bq; }
  const units = t.u.filter(u => u==='kanji' || MATH_UNITS[u]);
  const sorted = units.slice().sort((a,b) => (a==='kanji' ? 6 : ug(a)) - (b==='kanji' ? 6 : ug(b)));
  const k = sorted.length, lo = lv===0 ? 0 : lv===1 ? Math.floor(k/3) : Math.floor(k/2), hi = lv===0 ? Math.max(1, Math.ceil(k*.67)) : k;
  const L = sorted.slice(lo, hi).length ? sorted.slice(lo, hi) : sorted;
  let best = null;
  for(let i=0; i<24; i++){
    const u = choice(L); const m = u==='kanji' ? genK(choice(BUILTIN.filter(q => (q.grade||3) >= 5).length ? BUILTIN.filter(q => (q.grade||3) >= 5) : BUILTIN)) : genU(u);
    if(!m) continue; if(isRecent(m.key, used) && i < 18) continue;
    if(stage===2 && !rich(m) && i < 10){ best = best || m; continue; }
    return m;
  }
  return best || subjQ('math', userG(), used, false);
}
/* ===== v6.34（STEP5）：研究ノート・レシピ・ひみつ・がっかい ===== */
const IMG634 = './assets/images/v634/';
const thImg = (id, cls='thi634') => `<img class="${cls}" src="${IMG634}th_${id}.webp" alt="">`;
const CARDS = {"env": ["森は 雨水を たくわえるので「緑のダム」と よばれる。", "植物は 光を つかって 二酸化炭素から 養分と 酸素を つくる（光合成）。", "こん虫の からだは あたま・むね・はらの 3つ。あしは 6本。", "川の 水は 海から 蒸発して 雲に なり、雨と なって もどってくる。", "ペットボトルは リサイクルすると 服や たまごパックに 生まれかわる。", "日本の 国土の 約3分の2は 森林。世界でも 森の 多い 国。", "川の 上流の 石は 大きく 角ばり、下流の 石は 小さく 丸い。", "メダカの たまごは 約11日で かえる（水温 25℃くらい）。", "地球の 平均気温が 上がる ことを 地球温暖化という。", "食べる・食べられるの つながりを「食物連鎖」という。", "サンゴは 植物ではなく 動物の なかま。", "1本の 大きな 木は 1年に 数十kgの 二酸化炭素を すいこむ。", "海の プラスチックごみは 細かく くだけて 魚の おなかに 入る ことも ある。", "北極の 氷が へると、ホッキョクグマが えさを とりにくくなる。", "生き物の しゅるいが 多い ことを「生物多様性」という。"], "life": ["人の 心臓は 1日に 約10万回 ドクンと うつ。", "血液は 酸素や 養分を からだじゅうに とどける。", "大人の 骨は 約200こ。赤ちゃんは 約300こ あって くっついていく。", "食べた ものは 胃や 小腸で 消化されて 吸収される。", "ねむっている あいだに 成長ホルモンが 出て からだが 育つ。", "小腸の かべの ひだを 広げると テニスコートくらいの 広さに なる。", "肺の 中には ぶどうの ような「肺ほう」が たくさん ある。", "手あらいの とき、せっけんで 20びょう あらうと ばいきんが へる。", "人の からだの 約60%は 水で できている。", "メダカも 人も、心臓が 血液を おくり出す ポンプの はたらきを する。", "脳は からだの 重さの 約2%なのに エネルギーを 約20% つかう。", "ワクチンは からだに「てきの おぼえがき」を 先に つくる しくみ。", "じん臓は 血液から いらない ものを こし出して にょうを つくる。", "DNAには からだの つくり方の 設計図が 書かれている。", "白血球は からだに 入った ばいきんと たたかう 血液の せいぶん。"], "soc": ["日本で いちばん 高い 山は 富士山（3776m）。", "日本で いちばん 長い 川は 信濃川（約367km）。", "日本で いちばん 大きい 湖は 琵琶湖（滋賀県）。", "都道府県は 47。1都・1道・2府・43県。", "国会は 法律を つくる ところ。衆議院と 参議院が ある。", "お金を 銀行に あずけると 利子が つく ことが ある。", "日本の 食料自給率は（カロリーで）約4割。半分以上を 輸入に たよっている。", "税金は 学校・道路・病院など みんなの ために つかわれる。", "世界で いちばん 人口が 多い 国は インド（2023年から）。", "日本国憲法の 三つの 原則は 国民主権・平和主義・基本的人権の 尊重。", "ものの ねだんは ほしい 人と 売りたい 人の バランスで きまる。", "選挙で 投票できるのは 18さい から。", "三権分立：立法（国会）・行政（内閣）・司法（裁判所）が おたがいを チェックする。", "世界には 190以上の 国が ある。", "SDGsは 2030年までに 世界で めざす 17の 目標。"], "tech": ["コンピューターは 0と 1だけで すべての 情報を あらわす。", "プログラムは コンピューターへの「命令の ならび」。", "同じ ことを くりかえす 命令を「ループ（くりかえし）」という。", "「もし〜なら」で 動きを かえる 命令を「条件分岐」という。", "プログラムの まちがいを「バグ」、なおす ことを「デバッグ」という。", "世界で 最初の プログラマーは エイダ・ラブレス（1800年代）と いわれる。", "インターネットは 世界じゅうの コンピューターを つなぐ あみの め。", "パスワードは 長く、だれにも 教えない ことが 大事。", "ロボットは センサーで まわりを 知り、モーターで うごく。", "人工知能（AI）は たくさんの データから きまりを 見つけて 学ぶ。", "2進数の 1010 は ふつうの 数で 10。", "プログラムで 数を おぼえておく 箱を「変数」という。", "手じゅんを くふうすると、同じ 答えでも ずっと はやく 計算できる（アルゴリズム）。", "QRコードは 日本で 生まれた。少し よごれても 読みとれる。", "スマートフォン 1台は、むかしの 月ロケットの コンピューターより ずっと 高性能。"], "space": ["太陽系の わくせいは 8こ。すい・きん・ち・か・もく・ど・てん・かい。", "月は 地球の まわりを 約27日で 1しゅう する。", "太陽は 地球の 約109倍の 大きさ。", "光は 1びょうで 地球を 約7しゅう半 する。", "夏の 大三角は ベガ・アルタイル・デネブ。", "木星には 90こ以上の 衛星が ある。", "月の 表面の でこぼこは いん石が ぶつかった あと（クレーター）。", "金星は 自転の 向きが 地球と 反対。", "国際宇宙ステーションは 約90分で 地球を 1しゅう する。", "北極星は 1年じゅう ほぼ 真北に 見える。", "土星は 密度が 水より 小さい。大きな プールが あれば うかぶ ほど。", "1光年は 約9兆5000億km。", "太陽の 光は 地球まで 約8分20びょう かかる。", "天の川銀河には 1000億こ以上の 星が ある。", "宇宙は 約138億年前の ビッグバンで はじまったと 考えられている。"], "chem": ["水は H₂O。水素 2こと 酸素 1こで できている。", "空気の 約78%は 窒素、約21%は 酸素。", "元素は 118しゅるい 見つかっている。", "金は さびにくく、ずっと ぴかぴかの まま。", "氷が 水に うくのは、水より 密度が 小さいから。", "リトマス紙は 酸性で 青→赤、アルカリ性で 赤→青。", "鉄が さびるのは 空気中の 酸素と 結びつくから。", "ダイヤモンドと えんぴつの しんは どちらも 炭素で できている。", "食塩水を 熱すると 水が 蒸発して 食塩が のこる。", "ヘリウムは 空気より かるいので 風船が うかぶ。", "元素記号の Na は ナトリウム、K は カリウム。", "化学変化の 前と あとで 全体の 重さは かわらない（質量保存の 法則）。", "いちばん かるい 元素は 水素。宇宙で いちばん 多い 元素でも ある。", "周期表は メンデレーエフが 考えた。", "ドライアイスは 二酸化炭素の 固体。とけると 気体に なる。"], "lang": ["英語の アルファベットは 26文字。", "ひらがなは 漢字を くずして つくられた。", "世界で いちばん 話されている 言葉の 一つは 英語。", "「Hello」は「こんにちは」。「Thank you」は「ありがとう」。", "日本語には ひらがな・カタカナ・漢字の 3しゅるいの 文字が ある。", "「十人十色」は 人それぞれ ちがう という いみ。", "英語の 文は ふつう「だれが・する・何を」の じゅんばん。", "カステラ・パン・テンプラは ポルトガル語から きた ことば。", "漢字は 5万字以上 あると いわれる。", "「いろはうた」は かなを 1回ずつ つかった うた。", "英語の 曜日は Sunday（日）から Saturday（土）。", "「温故知新」は 昔の ことから 新しい ことを 学ぶ こと。", "英語の 過去形は ふつう ed を つける（play → played）。", "世界には 約7000の 言語が ある。", "ことわざ「急がば回れ」は 確実な 方法が けっきょく はやい という いみ。"], "math": ["0は インドで 考え出された 数。", "円周率 π は 3.14159… と ずっと つづく。", "三角形の 角を ぜんぶ たすと 180°。", "1から 10まで たすと 55。", "九九の 答えを ぜんぶ たすと 2025。", "正方形は 4つの 辺も 4つの 角も 等しい。", "素数は 1と その数でしか われない 数（2, 3, 5, 7…）。", "マイナスの 数どうしを かけると プラスに なる。", "四角形の 角を ぜんぶ たすと 360°。", "ハチの すは 正六角形。すき間なく ならべられて 強い。", "フィボナッチ数列 1,1,2,3,5,8… は 花びらの 数にも あらわれる。", "円の 面積は 半径×半径×円周率。", "ピタゴラスの 定理：直角三角形で a²＋b²＝c²。", "1／3 を 小数に すると 0.333… と ずっと つづく。", "さいころの 向かいあう 面を たすと かならず 7。"], "logic": ["数の ならびの きまりを 見つけると、つぎの 数が わかる。", "「すべての AはB」でも「すべての BはA」とは かぎらない。", "4人の ならび方は 4×3×2×1＝24通り。", "あくしゅの 回数は 人数×（人数−1）÷2。", "つるかめ算は「ぜんぶ つるだったら」と 考えると とける。", "うそつき問題は「もし Aが 本当なら」と 1つずつ ためす。", "立方体の 面は 6、辺は 12、頂点は 8。", "紙を 半分に おる たびに 部分の 数は 2倍に なる。", "ハノイの とうは 円ばんが n まいなら 2ⁿ−1 回で うつせる。", "迷路は 左手を かべに つけて すすむと いつか 出口に つく（つながった 迷路なら）。", "ぎゃくから 考えると とける 問題も 多い。", "数独は 1〜9を たて・よこ・ブロックに 1回ずつ 入れる パズル。", "5人から 2人 えらぶ えらび方は 10通り。", "ひとふで書きは 線が 奇数本 あつまる 点が 0か 2こなら できる。", "とけない 問題も「とけない ことを 証明する」ことが できる。"]};
const TH_C = {env:'#3BAF6A', life:'#E8606A', soc:'#E79A2B', tech:'#3D8BE0', space:'#7A5CD6', chem:'#26A69A', lang:'#9A6AD8', math:'#D4A017', logic:'#F07B3F'};
const isKira = i => i % 5 === 0;
const cardsOf = id => { const u = UV(); u.cards = u.cards || {}; return u.cards[id] || (u.cards[id] = []); };
const nCards = id => cardsOf(id).length;
const RECIPE = {
  env:['mori_salad','もりの グリーンサラダ','veggie_salad',{f_cabbage:2,f_tomato:1,f_carrot:1}],
  life:['genki_soup','げんき いっぱい スープ','pumpkin_soup',{f_pumpkin:1,f_carrot:1,cf_chicken:1}],
  soc:['sekai_plate','せかい いっしゅう プレート','lunchbox',{cf_pork:1,cf_egg:1,f_tomato:1,f_potato:1}],
  tech:['robo_pancake','ロボット パンケーキ','pancake',{cf_egg:2,cf_milk:2,cf_honey:1}],
  space:['hoshi_parfait','ほしぞら パフェ','royal_parfait',{f_strawberry:2,f_banana:1,cf_milk:2}],
  chem:['fushigi_soda','ふしぎな ソーダ','watermelon_juice',{f_watermelon:1,f_apple:1,cf_honey:1}],
  lang:['abc_cookie','ABC クッキー','fruit_tart',{cf_egg:1,cf_milk:1,cf_honey:1}],
  math:['pi_pie','パイの パイ（π）','apple_honey_tart',{f_apple:3,cf_egg:2,cf_milk:1}],
  logic:['puzzle_cake','パズル ケーキ','rainbow_cake',{f_strawberry:2,f_banana:1,cf_egg:2,cf_milk:2}],
  deg:['gakui_cake','がくい おいわい ケーキ','fruit_tart',{f_strawberry:2,cf_egg:2,cf_milk:2}]
};
function addRecipeMenus(){
  try{ const M = window.__cafe61 && window.__cafe61.menus(); if(!M) return; const u = UV(); (u.recipes||[]).forEach(k => { const R0 = RECIPE[k]; if(!R0 || M.some(m => m.id==='rc_'+R0[0])) return;
    const base = M.find(m => m.id===R0[2]) || M[0], pt = 380;
    M.push({id:'rc_'+R0[0], n:'🎓 '+R0[1], i:'', lv:1, pt, req:R0[3], art:base.art, mult:2.6, min:30, buy:Math.round(pt*1.4), rc:1}); }); }catch(e){ console.warn('recipe634', e); }
}
function giveRecipe(k){ const u = UV(); u.recipes = u.recipes || []; if(u.recipes.includes(k)) return null; u.recipes.push(k); addRecipeMenus(); return RECIPE[k]; }
setTimeout(addRecipeMenus, 0);
const masters = () => TH.filter(t => thData(t.id).lv >= 2).length;
function secretChip(){ const n = masters(), pct = Math.round(n/9*100), done = UV().secret;
  return `<button type="button" class="sec634 ${done ? 'open' : ''}" data-a="secret"><span class="sil634"><img src="${X(artSrc('itm_superletter')||'')}" alt="" style="--r:${100-pct}%"></span><b>${done ? 'ひみつ' : '？？？'}</b><small>${n}/9</small></button>`; }
/* 月ごとの きろく */
const ym = d => d.slice(0,7);
function monRec(){ const u = UV(); u.mon = u.mon || {}; const k = ym(D4()); return u.mon[k] || (u.mon[k] = {res:0, cards:0, th:{}}); }
function uniMates(n){
  const all = RES(), u = UV(), p = u.partner && resBy(u.partner);
  const L = shuffle(all.filter(r => r !== p)).slice(0, p ? n - 1 : n); if(p) L.unshift(p); return L;
}
const UMIS = [
  {id:'res1', t:'けんきゅうを 1かい せいこう', ic:'rnote', ok:L => L.res >= 1},
  {id:'two',  t:'2つの テーマで けんきゅう', ic:'pals', ok:L => L.chain.length >= 2},
  {id:'reco', t:'おすすめ テーマに ちょうせん', ic:'grad', ok:L => L.chain.includes(recoTheme())}
];
const UMC = ['#FDE3E6','#DDEBFB','#E3F5E1'];
function uTop(sub){
  const u = UV(), s = SV(), D = CFG.degree[u.degree];
  return `<div class="tp639 tpu641"><header class="hd639">
      <button type="button" class="bk639" data-a="close"><svg viewBox="0 0 24 24"><path d="M14 5L7 12L14 19" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H20" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg><b>まちへ</b></button>
      <img class="lg639" src="${IMG634}logo_univ.webp" alt="だいがく">
      <button type="button" class="st639" data-a="${u.enrolled ? 'deg' : 'cal'}"><span>${ic('streak')} れんぞく <em>${s.streak||0}</em> にち</span><span>${u.enrolled ? `${ic('grad')} <em class="g">${fmt(u.degPt)}</em>` : `<i class="sx639">★</i> <em class="g">${SK.reduce((a,k) => a + (s.stars[k]||0), 0)}</em>`}</span></button>
    </header>
    <div class="cp639"><span>＼ ${sub} ／</span></div>
    <button type="button" class="pal639 u1" data-upal="0" aria-label="ハナ"></button><button type="button" class="pal639 u2" data-upal="1" aria-label="フクロウ"></button><button type="button" class="pal639 u3" data-upal="2" aria-label="アザラシ"></button>
    <span class="pb639 u1" data-upal="0">もっと しりたい！</span><span class="pb639 u2" data-upal="1">まなびは みらいを ひろげるよ！</span><span class="pb639 u3" data-upal="2">いっしょに たのしく まなぼう！</span></div>`;
}
const UPAL = [['もっと しりたい！','はっけん したい！','カード あつめよう！','つぎは どの こうざ？'],
  ['まなびは みらいを ひろげるよ！','しらべて かんがえて はっぴょう！','まちがえても ひらめきの かけらに なるよ','おすすめは ×1.3 だよ'],
  ['いっしょに たのしく まなぼう！','レシピ ふえたら カフェに いこう！','ノーミスだと キラカード！','きょうも けんきゅう がんばろ〜']];
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-upal]'); if(!t || !ROOT || !ROOT.contains(t)) return; e.stopPropagation();
  const k = t.dataset.upal, b = ROOT.querySelector(`.pb639[data-upal="${k}"]`); if(!b) return; const L2 = UPAL[k]; let v; do{ v = choice(L2); }while(v===b.textContent);
  b.textContent = v; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); sound('tap'); }, true);
function uniMain(){
  if(!ROOT) return; ROOT.classList.remove('bgS633'); ROOT.classList.add('bgU634'); addRecipeMenus(); setTimeout(gakkai, 400); const u = UV(), s = SV(), L = DL();
  if(!u.enrolled) return uniLocked();
  const reco = recoTheme(); if(!UT.th || !thOpen(THM(UT.th))) UT.th = reco;
  const dn = degNext(), D = CFG.degree[u.degree], p = u.partner && resBy(u.partner);
  L.umis = L.umis || {chest:0}; const done = UMIS.map(m => m.ok(L)), all = done.every(Boolean);
  const tile = (a, img, n, badge, extra='') => `<button type="button" class="tl639" data-a="${a}"><span class="ti">${img}</span><b>${n}</b>${badge ? `<i class="bd639 ${badge==='!' ? 'red' : ''}">${badge}</i>` : ''}${extra}</button>`;
  const stars3 = id => { const d = thData(id), n = d.s.some(Boolean) ? d.lv + 1 : 0; return stars(n); };
  ROOT.innerHTML = `<div class="wrap631 uni s639 u641">${uTop('しらべて かんがえて せかいを ひろげよう！')}
    <section class="pn639 pu641 ms639"><div class="ph639">${ic('grad')}<b>だいがくの ミッション</b><span class="ct639">${done.filter(Boolean).length}/3</span></div>
      <div class="mw639"><ol>${UMIS.map((m,i) => `<li class="${done[i] ? 'ok' : ''}" style="--bg:${UMC[i]}"><i class="ck639 n">${done[i] ? '<svg viewBox="0 0 20 20"><path d="M4 10.5L8.5 15L16 6" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : i+1}</i><span class="mi639">${ic(m.ic)}</span><span class="mt639">${m.id==='reco' ? `おすすめ「${X(THM(reco).n)}」に ちょうせん` : X(m.t)}</span></li>`).join('')}</ol>
      <button type="button" class="cs639 ${all && !L.umis.chest ? 'glow' : ''} ${L.umis.chest ? 'got' : ''}" data-a="uchest"><img class="chi633" src="${IMG634}th_space.webp" alt=""><small>${L.umis.chest ? 'もらったよ！' : all ? 'タッチで うけとる！' : 'ぜんぶ できたら<br>すてきな ごほうび！'}</small></button></div></section>
    <section class="pn639 pu641"><div class="ph639">${ic('rnote')}<b>まなべる こうざ</b><span class="hint639">＼ すきな こうざを えらんで まなぼう！ ／</span></div>
      <div class="tg641">${TH.map(x => { const open = thOpen(x);
        return `<button type="button" class="tc641 ${open ? '' : 'lk'}" ${open ? `data-a="pickth" data-k="${x.id}"` : 'data-a="thlock"'} style="--c:${TH_C[x.id]}">${x.id===reco && open ? '<em class="x15">×1.3</em>' : ''}${L.chain.includes(x.id) ? '<i class="sp639">✔</i>' : ''}${open && nCards(x.id)===14 ? '<em class="last634">あと1まい</em>' : ''}
          <span class="si">${thImg(x.id)}${open ? '' : '<i class="lk641"><svg viewBox="0 0 20 22"><rect x="2.5" y="9" width="15" height="11.5" rx="3" fill="#F2C14E" stroke="#7A5634" stroke-width="1.6"/><path d="M6 9V6.5a4 4 0 0 1 8 0V9" fill="none" stroke="#7A5634" stroke-width="2"/></svg></i>'}</span>
          <b>${x.n.replace(/（.*）/,'')}</b>${open ? stars3(x.id) : `<small>あと ${x.need - u.total}かい</small>`}${open ? `<small>カード ${nCards(x.id)}/15</small>` : ''}</button>`; }).join('')}</div>
      <div class="stp639">きょうの けんきゅう ${Math.min(L.res, CFG.fullRes)}/${CFG.fullRes} ${'<i class="on"></i>'.repeat(Math.min(L.res, CFG.fullRes))}${'<i></i>'.repeat(Math.max(0, CFG.fullRes - L.res))} ${L.res >= CFG.fullRes ? '<b>まんかい！</b>' : ''}</div></section>
    <section class="pn639 pu641"><div class="ph639"><svg class="pi639" viewBox="0 0 32 32"><path d="M4 24L6 10L12 16L16 6L20 16L26 10L28 24Z" fill="#FFD24A" stroke="#B5701C" stroke-width="2" stroke-linejoin="round"/><rect x="4" y="24" width="24" height="4" rx="1.5" fill="#F2A33A" stroke="#B5701C" stroke-width="2"/></svg><b>これまでの きろく</b><span class="dl639"></span></div>
      <div class="tls639">
        ${tile('deg', ic('grad'), D.n, '', dn ? `<span class="mb639"><i style="width:${Math.min(100, u.degPt/dn.D.pt*100)}%"></i></span>` : '')}
        ${tile('note', ic('rnote'), '研究ノート', TH.reduce((a,t) => a + nCards(t.id), 0) || '')}
        ${tile('partner', ic('pals'), 'なかま', '', p ? `<small class="nm641">${X(p.name)}</small>` : '')}
        ${tile('secret', `<span class="sil634"><img src="${X(artSrc('itm_superletter')||'')}" alt="" style="--r:${100 - Math.round(masters()/9*100)}%"></span>`, u.secret ? 'ひみつ' : '？？？', `${masters()}/9`)}
      </div>
      <div class="sub639">
        <span class="chip641">${ic('frag')} かけら ${u.frag}/5</span><span class="chip641">${ic('ticket')} ヒント ${u.tickets}</span>
        <button type="button" data-a="toschool">${ic('school')} がっこう</button>
        <button type="button" data-a="help"><img src="${X(artSrc('bird_think')||'')}" alt=""> せつめい</button>
      </div></section>
  </div>`;
  persist();
}
async function pickTheme(id){
  const t = THM(id), d = thData(id), reco = recoTheme() === id, L = DL(); sound('ok');
  const btns = LV.map((n, i) => { const on = i <= d.lv, nd = i === d.lv + 1 ? lvNeed(id) : null;
    return {label:`<b>${on ? '' : '<svg viewBox="0 0 20 22" width="14" height="15"><rect x="2.5" y="9" width="15" height="11.5" rx="3" fill="#F2C14E" stroke="#7A5634" stroke-width="1.6"/><path d="M6 9V6.5a4 4 0 0 1 8 0V9" fill="none" stroke="#7A5634" stroke-width="2"/></svg>'}${n}</b>${stars(i+1)}<small>${on ? `せいこう ${d.s[i]}かい` : nd ? `あと${nd.n}かい・${Math.max(nd.d, nd.w)}にち` : 'まだ'}</small>${(UT.lv===i && on) ? '<i>まえかい</i>' : ''}`, cls:`white lv641 l${i} ${on ? '' : 'off'}`, v:on ? 'L'+i : ''}; });
  const v = await dialog(`<div class="pk639" style="--c:${TH_C[id]}"><span class="pki">${thImg(id)}</span><div><b>${X(t.n)}</b>${reco ? '<em>おすすめ ×1.3！</em>' : ''}<small>${L.res >= CFG.fullRes ? 'きょうは れんしゅうモード' : `カード ${nCards(id)}/15・きょう ${L.res}/${CFG.fullRes}かい`}</small></div></div>
    <p class="dlgP">どの レベルで けんきゅう する？<br><small>しらべる3もん → かんがえる3もん → はっぴょう1もん　♥×3</small></p>`, btns.concat([{label:'やめる', cls:'white cancel639', v:''}]), 'wide dfw639');
  if(!v || v[0] !== 'L') return;
  UT.th = id; UT.lv = +v.slice(1); await runResearch(id, UT.lv);
}
function uniLocked(){
  const s = SV(), L = DL(), gold = s.badge >= 2;
  const b2 = CFG.badge[2], tot = SK.reduce((a,k) => a + (s.stars[k]||0), 0);
  ROOT.innerHTML = `<div class="wrap631 uni s639 u641">${uTop('がっこうで ゴールドバッジを めざそう！')}
    <section class="pn639 pu641"><div class="ph639"><svg class="pi639" viewBox="0 0 20 22"><rect x="2.5" y="9" width="15" height="11.5" rx="3" fill="#F2C14E" stroke="#7A5634" stroke-width="1.6"/><path d="M6 9V6.5a4 4 0 0 1 8 0V9" fill="none" stroke="#7A5634" stroke-width="2"/></svg><b>入学まで</b></div>
      ${gold ? '<p class="lk641p">🥇 ゴールド たっせい！ 入学試験に ちょうせん できるよ</p>' : `<div class="bdb639"><b>${medal(3,'s')} ゴールドバッジまで</b><div class="bb636"><small>★ ${tot}/${b2.st}</small><span class="bar631"><i style="width:${Math.min(100, tot/b2.st*100)}%"></i></span></div><div class="bb636"><small>しゅっせき ${s.attend}/${b2.d}日</small><span class="bar631 d"><i style="width:${Math.min(100, s.attend/b2.d*100)}%"></i></span></div></div>`}
      <p class="lk641p sm">入学試験：10もん中 7もん せいかいで ごうかく（5きょうか 2もんずつ）</p>
      <button type="button" class="go631 uni" data-a="exam" ${gold && L.exam < 1 ? '' : 'disabled'}>${gold ? (L.exam ? '入学試験は あした また ちょうせん' : `${ic('write','big')} 入学試験に ちょうせん！`) : `${ic('write','big')} 入学試験（ゴールドで かいほう）`}</button>
      <button type="button" class="go631 sub" data-a="trial" ${L.trial ? 'disabled' : ''}>${L.trial ? '体験入学は また あした' : `${ic('study','big')} 体験入学（1日1もん・せいかいで +10）`}</button></section>
    <section class="pn639 pu641"><div class="ph639">${ic('rnote')}<b>まなべる こうざ</b><span class="hint639">＼ 入学すると えらべるよ ／</span></div>
      <div class="tg641">${TH.map(x => `<span class="tc641 lk" style="--c:${TH_C[x.id]}"><span class="si">${thImg(x.id)}</span><b>${x.n.replace(/（.*）/,'')}</b></span>`).join('')}</div>
      <div class="sub639"><button type="button" data-a="toschool">${ic('school')} がっこうへ</button><button type="button" data-a="help"><img src="${X(artSrc('bird_think')||'')}" alt=""> せつめい</button></div></section>
  </div>`;
}
async function trial(){
  const L = DL(); if(L.trial) return; L.trial = 1;
  const t = choice(TH.slice(0, 3)), m = themeQ(t, 0, new Set(), 1);
  const r = await askQ(m, `<div class="qh631 uni"><span>🎒 体験入学：${thImg(t.id,'ii635')} ${t.n}</span></div>`, 'one');
  if(r.ok){ if(dayOK()) pts(10, 'だいがく 体験入学'); await pop('🎉', 'せいかい！ +10　だいがくって おもしろいね！'); }
  else await explainStep(m, r.v, `<div class="qh631 uni"><span>🎒 体験入学</span></div>`, [{label:'わかった！', cls:'gold', v:1}]);
  persist(); uniMain();
}
async function exam(){
  const L = DL(), s = SV(); if(L.exam || s.badge < 2) return; L.exam = 1; persist();
  const g = userG(), used = new Set(), list = []; SK.forEach(k => { list.push(k, k); });
  QUITOK = true; QUITMSG = 'とちゅうで やめると きょうの 入学試験は おしまいに なるよ。<br>あした また ちょうせん できるよ';
  const quitOut = () => { QUITOK = false; QUITFN = null; toast('入学試験を やめたよ'); uniMain(); };
  let ok = 0, miss = [];
  for(let i=0; i<10; i++){
    const subj = list[i], m = subjQ(subj, g, used, true); used.add(m.key);
    const head = `<div class="qh631 uni"><span>📝 入学試験 ${i+1}/10</span><b class="cb631">${ok >= 7 ? 'ごうかく ライン こえた！' : `あと ${7 - ok}もんで ごうかく`}</b></div>`;
    const r = await askQ(m, head, 'one');
    if(r.quit) return quitOut();
    if(r.ok){ ok++; await pop('⭕', 'せいかい！'); }
    else { miss.push(subj); addNote(m, 'k'); const ev = await explainStep(m, r.v, head, [{label:'つぎへ', cls:'gold', v:1}]); if(ev==='__quit') return quitOut(); }
  }
  QUITOK = false; QUITFN = null;
  if(ok >= 7 && dayOK()){
    const u = UV(); u.enrolled = 1; u.enrollDay = D4(); pts(500, 'だいがく 入学'); persist();
    const all = RES().slice(0, 12);
    ROOT.innerHTML = `<div class="wrap631 result"><div class="res631 ent631"><img class="bgE" src="${IMG}bg_univ.webp" alt=""><h2>🌸 ごうかく！ 入学 おめでとう！</h2>
      <div class="clap631">${all.map((r,i) => `<span style="animation-delay:${(i*.12).toFixed(2)}s"><img src="${X(rsrc(r))}" alt=""><i>👏</i></span>`).join('')}</div>
      <p class="hn631">${ok}/10 せいかい</p><ul class="ln631"><li>🪙 入学の ごほうび +500</li><li>🔓 かんきょう・いのち・しゃかい の 3テーマ かいほう</li><li>🎓 しょうごう「がくせい」</li></ul>
      <div class="rb631"><button type="button" class="btn gold" data-a="toU">🎓 だいがくへ</button></div></div></div>`;
    confetti(3500); sound('fan');
    ROOT.querySelector('[data-a="toU"]').onclick = e => { e.stopPropagation(); uniMain(); };
  } else {
    const ms = [...new Set(miss)];
    ROOT.innerHTML = `<div class="wrap631 result"><div class="res631"><h2>ざんねん… ${ok}/10</h2><p class="hn631">7もん せいかいで ごうかく。あした（あさ4じ いこう）また ちょうせん できるよ</p>
      ${ms.length ? `<p class="tmr631">がっこうで <b>${ms.map(k => SUBJ[k]).join('・')}</b> の じゅぎょうを うけると いいかも！</p>` : ''}
      <div class="rb631"><button type="button" class="btn gold" data-a="toS">🏫 ${ms.length ? SUBJ[ms[0]] + 'の じゅぎょうへ' : 'がっこうへ'}</button><button type="button" class="btn white" data-a="toU">もどる</button></div></div></div>`;
    sound('ng');
    ROOT.querySelector('[data-a="toS"]').onclick = e => { e.stopPropagation(); CUR = 'school'; if(ms[0]) ST.subj = ms[0]; schoolMain(); };
    ROOT.querySelector('[data-a="toU"]').onclick = e => { e.stopPropagation(); uniMain(); };
  }
}
async function pickPartner(){
  const u = UV(), all = RES(), t = THM(UT.th);
  if(!all.length) return;
  const v = await dialog(`<h2 class="dlgT">${ic('pals','h')} 研究なかまを えらぶ</h2><p class="dlgP facNote">とくいな きょうかが テーマと あうと ヒントが 1かい むりょう（きずなLv3いじょうで +1）</p>
    <div class="pp631">${all.slice(0, 24).map(r => `<button type="button" class="ppb631 ${u.partner===r.id ? 'on' : ''}" data-pp="${X(r.id)}"><img src="${X(rsrc(r))}" alt=""><b>${X(r.name)}</b><small>${subjImg(fav(r))}${SUBJ[fav(r)]}${bondLv(r.id) >= 2 ? ` 💗${bondLv(r.id)}` : ''}</small></button>`).join('')}</div>`, [{label:'とじる', v:''}], 'wide');
  void v;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pp]'); if(!b) return; UV().partner = b.dataset.pp; persist(); document.querySelectorAll('.ppb631').forEach(x => x.classList.toggle('on', x===b)); toast('なかまを きめたよ'); if(CUR==='uni') uniMain(); }, true);
const TH_SUBJ = {env:'sci', life:'sci', soc:'soc', tech:'math', space:'sci', chem:'sci', lang:'en', math:'math', logic:'math'};
async function runResearch(id, lv){
  const t = THM(id); if(!t || !thOpen(t)) return;
  const u = UV(), L = DL(), d = thData(id), good = dayOK(), practice = L.res >= CFG.fullRes;
  const p = u.partner && resBy(u.partner);
  let free = p && fav(p)===TH_SUBJ[id] ? 1 + (bondLv(p.id) >= 3 ? 1 : 0) : 0;
  let life = CFG.life, miss = 0; const used = new Set();
  const stages = [['しらべる', 3, 1], ['かんがえる', 3, 2], ['はっぴょう', 1, 3]];
  const tool = () => `<button type="button" class="btn small white" data-qt="h" ${free || u.tickets ? '' : 'disabled'}>💡 ヒント（${free ? `なかま ${free}` : `券 ${u.tickets}`}）</button>`;
  const onTool = (k, m) => { if(!free && !u.tickets) return null; if(free) free--; else u.tickets--; const ans = m.ansF || m.ans; return shuffle(m.opts.filter(o => o!==ans)).slice(0, 2); };
  let qi = 0, failed = false, lastM = null, lastV = '';
  QUITOK = true; QUITMSG = 'とちゅうで やめると この けんきゅうの ごほうびは もらえないよ。<br>（♥は へらないよ）';
  const quitOut = () => { QUITOK = false; QUITFN = null; toast('けんきゅうを やめたよ'); uniMain(); };
  outer: for(const [sn, cnt, sk] of stages){
    for(let i=0; i<cnt; i++){
      const m = themeQ(t, lv, used, sk); used.add(m.key); noteRecent(m); qi++;
      const head = `<div class="qh631 uni"><span>${thImg(t.id,'ii635')} ${t.n}・${LV[lv]}</span><span class="stg2">ステージ${sk}「${sn}」</span>${practice ? '<b class="cb631">れんしゅう</b>' : `<b class="lf631">${'♥'.repeat(life)}${'♡'.repeat(CFG.life - life)}</b>`}</div>
        <div class="nb631">📓 ${Array.from({length:7}, (_, k) => `<i class="${k < qi - 1 ? 'on' : ''}"></i>`).join('')}</div>`;
      const r = await askQ(m, head, 'one', {sec: sk===3 ? CFG.stageSec[lv] : 0, tool, onTool});
      if(r.quit) return quitOut();
      if(r.ok){ await pop('📝', sk===3 ? 'はっぴょう だいせいこう！' : 'ノートが 1ぎょう うまった！'); continue; }
      miss++; lastM = m; lastV = r.v;
      if(!practice){ life--; }
      if(!practice && life <= 0){ failed = true; break outer; }
      const ev = await explainStep(m, r.v, head.replace(/<b class="lf631">[^<]*<\/b>/, `<b class="lf631">${'♥'.repeat(life)}${'♡'.repeat(CFG.life - life)}</b>`) + (r.timeout ? '<div class="revt631">⏱ じかんぎれ…</div>' : ''), [{label:'つぎへ', cls:'gold', v:1}]);
      if(ev==='__quit') return quitOut();
    }
  }
  QUITOK = false; QUITFN = null;
  if(failed){
    const v = await explainStep(lastM, lastV, `<div class="qh631 uni"><span>${thImg(t.id,'ii635')} ${t.n}</span><b class="lf631">♡♡♡</b></div><div class="revt631">けんきゅうは しっぱい… でも かいせつを よめば まえに すすめるよ</div>`, [{label:'✅ わかった！', cls:'gold', v:'w'}]);
    if(v==='w'){ u.frag++; if(u.frag >= 5){ u.frag -= 5; u.tickets++; toast('✨ かけら 5こで ヒント券 1まい！'); } }
    persist();
    ROOT.innerHTML = `<div class="wrap631 result"><div class="res631"><h2>けんきゅう しっぱい…</h2><p class="hn631">✨ ひらめきの かけら +1（${u.frag}/5）</p><p class="tmr631">おなじ テーマで もういちど ちょうせん できるよ</p>
      <div class="rb631"><button type="button" class="btn gold" data-a="re">🔬 もういちど</button><button type="button" class="btn white" data-a="bk">もどる</button></div></div></div>`;
    ROOT.querySelector('[data-a="re"]').onclick = e => { e.stopPropagation(); busy = true; runResearch(id, lv).finally(() => { busy = false; }); };
    ROOT.querySelector('[data-a="bk"]').onclick = e => { e.stopPropagation(); uniMain(); };
    return;
  }
  /* せいこう */
  const lines = []; let coin = 0, dp = 0, cry = 0, dai = false, card = null, secretPending = false;
  const today = D4();
  if(good && !practice){
    L.res++;
    const chainN = L.chain.includes(id) ? L.chain.length - 1 : L.chain.length; if(!L.chain.includes(id)) L.chain.push(id);
    const reco = recoTheme() === id, nomiss = miss === 0;
    dai = lv===2 && nomiss && Math.random() < CFG.daiP;
    dp = CFG.degPt[lv] * t.mul * (nomiss ? CFG.noMiss : 1) * CFG.chain[Math.min(2, chainN)] * (reco ? CFG.recoMul : 1) * (dai ? 3 : 1);
    coin = CFG.resCoin[lv] * t.mul * (dai ? 3 : 1);
    dp = Math.round(dp); coin = Math.round(coin);
    u.degPt += dp; lines.push(`🎓 学位ポイント +${dp}${nomiss ? '（ノーミス×1.5）' : ''}${chainN ? `（チェイン +${chainN*10}%）` : ''}${reco ? '（おすすめ×1.3）' : ''}`);
    lines.push(`🪙 コイン +${coin}`);
    if(Math.random() < CFG.resCry[lv]){ if(giveCry()){ cry = 1; lines.push('💎 すいしょう 1こ！'); } else if(lv===2){ coin += 100; lines.push('🪙 すいしょうの かわりに +100'); } }
    d.s[lv]++; if(!d.days[lv].includes(today)) d.days[lv].push(today); if(lv===0 && !d.first) d.first = today;
    u.total++;
    if(u.lastDay !== today){ u.lastDay = today; u.days++; }
    if(p) { addBond(p.id, 1, true); lines.push(`🤝 ${p.name}と きずな +1`); }
    const mr = monRec(); mr.res++; mr.th[id] = (mr.th[id]||0) + 1;
    card = drawCard(id, lv, nomiss, dai);
    if(card && card.dup){ coin += 20; u.frag++; if(u.frag >= 5){ u.frag -= 5; u.tickets++; } lines.push('🃏 カードは ぜんぶ もっているよ → コイン+20・かけら+1'); }
    else if(card){ mr.cards++; lines.push(`🃏 はっけんカード ${card.kira ? '✨キラ' : ''}ゲット！（${t.n} ${nCards(id)}/15）`);
      if(nCards(id)===15){ coin += 1000; const tt = t.n.replace(/（.*）/,'') + 'はかせ'; u.titles = u.titles || []; if(!u.titles.includes(tt)) u.titles.push(tt); u.title = tt; lines.push(`👑 コンプリート！ しょうごう「${tt}」 +1000`);
        if(TH.every(x => nCards(x.id)===15) && !u.titles.includes('だいはかせ')){ u.titles.push('だいはかせ'); u.title = 'だいはかせ'; lines.push('🌟 ぜんぶの テーマを コンプリート！ しょうごう「だいはかせ」'); } } }
    lvCheck(id).forEach(l => { lines.push(`⬆ ${t.n}の ${LV[l]}が かいほう！`);
      if(l===2){ const rc = giveRecipe(id); if(rc) lines.push(`🍰 カフェの とくべつ レシピ「${rc[1]}」を おぼえた！`); lines.push(`❓ ひみつの シルエットが すこし 見えた（${masters()}/9）`);
        if(masters()===9 && !u.secret) secretPending = true; } });
    TH.forEach(x => { if(x.need && u.total === x.need) lines.push(`🔓 あたらしい テーマ「${x.n}」が かいほう！`); });
    const dn = degNext(); if(dn && dn.ok){ u.degree++; if(dn.D.rew){ coin += dn.D.rew; } lines.push(`🎓 しょうごう「${dn.D.n}」に なった！${dn.D.rew ? ` +${dn.D.rew}` : ''}`);
      if(dn.D.n==='修士'){ const rc = giveRecipe('deg'); if(rc) lines.push(`🍰 とくべつ レシピ「${rc[1]}」を おぼえた！`); } }
  } else if(good){ coin = Math.round(CFG.resCoin[lv] * t.mul * CFG.overMul); lines.push(`🪙 れんしゅうモード +${coin}`); }
  if(coin) pts(coin, `だいがく ${t.n}の けんきゅう`);
  persist();
  const dn = degNext();
  ROOT.innerHTML = `<div class="wrap631 result"><div class="res631">${stage('bg_univ', uniMates(4), {pos:[[16,90],[38,96],[62,96],[84,90]], prop:() => t.prop, bounce:true, noLv:true, cls:'mini clear633'})}
    <h2 class="hk631">${dai ? '🌟 だいはっけん！！' : '💡 はっけん！'}</h2>
    ${card && !card.dup ? cardHTML(id, card.i, true) : ''}
    <ul class="ln631">${lines.map(l => `<li>${X(l)}</li>`).join('')}</ul>
    ${dn ? `<div class="nx631">つぎの「${dn.D.n}」まで：学位 あと${fmt(dn.needP)}・あと${dn.needD}にち${dn.needA ? `・アドバンス ${dn.needA}テーマ` : ''}${dn.needM ? `・マスター ${dn.needM}テーマ` : ''}${bar(u.degPt, dn.D.pt)}</div>` : ''}
    ${L.res >= CFG.fullRes ? `<p class="tmr631">きょうの けんきゅうは まんかい！ あしたも まってるよ</p>` : `<p class="tmr631">べつの テーマに ちょうせんすると 学位ポイントが ふえるよ（チェイン）</p>`}
    <div class="rb631"><button type="button" class="btn gold" data-a="bk">🎓 だいがくに もどる</button></div></div></div>`;
  confetti(dai ? 3500 : 2000); sound('fan');
  ROOT.querySelector('[data-a="bk"]').onclick = e => { e.stopPropagation(); uniMain(); };
  if(secretPending) setTimeout(() => { busy = true; secretOpen().finally(() => { busy = false; }); }, 1600);
}
function drawCard(id, lv, nomiss, dai){
  const own = cardsOf(id); if(own.length >= 15) return {dup:true};
  const range = k => [0,1,2,3,4].map(j => k*5 + j).filter(i => !own.includes(i));
  let pool = range(lv); if(!pool.length) for(let k=0; k<=2 && !pool.length; k++) pool = range(k);
  if(!pool.length) return {dup:true};
  const kira = pool.filter(isKira), norm = pool.filter(i => !isKira(i));
  let i;
  if(dai && kira.length) i = kira[0];
  else if(nomiss && kira.length && Math.random() < .2) i = kira[0];
  else i = norm.length ? choice(norm) : kira[0];
  own.push(i); own.sort((a,b) => a-b); return {i, kira:isKira(i)};
}
function cardHTML(id, i, flip){
  const t = THM(id), k = isKira(i);
  return `<div class="cd634 ${k ? 'kira' : ''} ${flip ? 'flip' : ''}" style="--tc:${TH_C[id]}"><div class="in634"><div class="bk634">🎓</div><div class="fr634">
    <div class="ct634"><span>${t.n}</span><em>${LV[Math.floor(i/5)]} No.${i+1}</em></div>${thImg(id, 'ci634')}<p>${X(CARDS[id][i])}</p>${k ? '<i class="kr634">✨キラ</i>' : ''}</div></div></div>`;
}
function noteBook(th){
  if(!ROOT) return; th = th && THM(th) ? th : TH[0].id; const own = cardsOf(th), tot = TH.reduce((a,t) => a + nCards(t.id), 0);
  ROOT.innerHTML = `<div class="wrap631 nb634w"><header class="hd631"><button type="button" class="back631" data-nb="back">‹ だいがく</button><div class="tt631"><b class="nbt634">${ic('rnote')} 研究ノート</b><small>はっけんカード ${tot}/135</small></div><span></span></header>
    <div class="nbt634s">${TH.map(t => `<button type="button" class="nbtab634 ${t.id===th ? 'on' : ''}" data-nb="${t.id}" style="--tc:${TH_C[t.id]}">${thImg(t.id)}<small>${nCards(t.id)}/15</small>${nCards(t.id)===14 ? '<em class="last634">あと1まい</em>' : ''}</button>`).join('')}</div>
    <div class="nbp634" style="--tc:${TH_C[th]}"><div class="nbh634">${thImg(th)}<b>${THM(th).n}</b><span>${own.length}/15${own.length===15 ? ' 👑 コンプリート' : ''}</span></div>
      ${LV.map((n, k) => `<div class="nbl634">${n}</div><div class="nbg634">${[0,1,2,3,4].map(j => { const i = k*5+j; return own.includes(i) ? `<button type="button" class="mini634 ${isKira(i) ? 'kira' : ''}" data-cd="${th}|${i}">${thImg(th,'ci634')}<small>No.${i+1}</small></button>` : `<span class="mini634 off">${isKira(i) ? '✨' : ''}？</span>`; }).join('')}</div>`).join('')}
      <p class="nbn634">けんきゅうに せいこうすると カードが 1まい もらえるよ。ノーミスだと キラカードが 出やすい！</p></div></div>`;
  ROOT.scrollTop = 0;
  ROOT.querySelectorAll('[data-nb]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = b.dataset.nb; if(v==='back') uniMain(); else noteBook(v); });
  ROOT.querySelectorAll('[data-cd]').forEach(b => b.onclick = e => { e.stopPropagation(); const [id, i] = b.dataset.cd.split('|'); dialog(`<div class="cdw634">${cardHTML(id, +i, false)}</div>`, [{label:'とじる', cls:'gold', v:1}]); });
}
async function secretView(){
  const u = UV(), n = masters();
  if(u.secret) return dialog(`<div class="dlgArt"><img src="${X(artSrc('itm_superletter')||'')}" alt="" style="height:110px"></div><h2 class="dlgT">🌈 ひみつの ほうしゅう</h2><p class="dlgP">ぜんぶの テーマを マスターして <b>超レアかくていレター</b> を 手に入れたよ！</p>`, [{label:'とじる', cls:'gold', v:1}]);
  await dialog(`<div class="dlgArt"><span class="sil634 big"><img src="${X(artSrc('itm_superletter')||'')}" alt="" style="--r:${100 - Math.round(n/9*100)}%"></span></div><h2 class="dlgT">❓ ？？？の ひみつ</h2>
    <p class="dlgP">テーマを 1つ「マスター」に するたびに シルエットが 9分の1ずつ 見えてくるよ。<br>ぜんぶ マスターすると ひみつが あきらかに！</p><p class="dlgP facNote">いま ${n}/9 テーマ</p>`, [{label:'とじる', cls:'gold', v:1}]);
}
async function secretOpen(){
  const u = UV(); if(u.secret || masters() < 9) return; u.secret = 1;
  save.superLetter = (save.superLetter||0) + 3; save.crystal = (save.crystal||0) + 10; u.titles = u.titles || []; if(!u.titles.includes('でんせつの けんきゅうしゃ')) u.titles.push('でんせつの けんきゅうしゃ'); u.title = 'でんせつの けんきゅうしゃ';
  persist(); confetti(4000); sound('fan');
  await dialog(`<div class="rareIntro rk4"><div class="rays"></div><img src="${X(artSrc('itm_superletter')||'')}" alt="" style="height:120px;position:relative"></div><h2 class="dlgT">🌈 ひみつが あきらかに！</h2>
    <p class="dlgP">9つの テーマを ぜんぶ マスター！<br><b>超レアかくていレター ×3</b>・<b>すいしょう ×10</b><br>しょうごう「でんせつの けんきゅうしゃ」</p><p class="dlgP facNote">レターは もちものから つかうと 超レアの 住民が かならず 来るよ</p>`, [{label:'すごい！', cls:'gold', v:1}], 'wide');
}
/* がっかい（月1回） */
let gkBusy = false;
async function gakkai(){
  if(gkBusy || !save.uni631 || !UV().enrolled) return; const u = UV(), cur = ym(D4());
  if(u.gkLast === cur) return; if(document.querySelector('#dlg.show') || busy) return;
  const keys = Object.keys(u.mon || {}).filter(k => k < cur).sort(), pk = keys[keys.length-1];
  u.gkLast = cur; persist(); if(!pk) return; const M = u.mon[pk]; if(!M || !M.res) return;
  gkBusy = true;
  try{
    const mvp = Object.entries(M.th).sort((a,b) => b[1]-a[1])[0], t = mvp && THM(mvp[0]);
    save.crystal = (save.crystal||0) + 1; const it = decoItem(true); persist(); confetti(2500); sound('fan');
    const cl = RES().slice(0, 8);
    await dialog(`<div class="gk634"><div class="gkt634">📜 ${+pk.slice(5)}月の がっかい はっぴょう</div>
      <div class="gkb634">${t ? `<div class="gkm634">${thImg(t.id)}<div><small>こんげつの MVP テーマ</small><b>${t.n}</b><span>${mvp[1]}かい けんきゅう</span></div></div>` : ''}
      <div class="gks634"><span>🔬 けんきゅう<b>${M.res}かい</b></span><span>🃏 カード<b>${M.cards}まい</b></span><span>📓 ぜんぶで<b>${TH.reduce((a,x) => a + nCards(x.id), 0)}/135</b></span></div></div>
      <div class="clap631">${cl.map((r,i) => `<span style="animation-delay:${(i*.12).toFixed(2)}s"><img src="${X(rsrc(r))}" alt=""><i>👏</i></span>`).join('')}</div>
      <p class="dlgP">MVPの ごほうび：💎 すいしょう 1こ${it ? `・とくべつ かざり「${X(it.name)}」` : ''}</p></div>`, [{label:'こんげつも がんばる！', cls:'gold', v:1}], 'wide');
  } finally { gkBusy = false; }
}
setInterval(() => { if(document.hidden || CUR || typeof curScreen==='undefined' || !['town','home','myhome'].includes(curScreen)) return; gakkai(); }, 5000);
async function degreeView(){
  const u = UV();
  await dialog(`<h2 class="dlgT">${ic('grad','h')} 学位</h2><p class="dlgP">いま：<b>${CFG.degree[u.degree].n}</b>　学位ポイント <b>${fmt(u.degPt)}</b>　けんきゅうした日 <b>${u.days}にち</b></p>
    ${(UV().titles||[]).length ? `<p class="dlgP">しょうごう：${UV().titles.map(X).join('・')}</p>` : ''}${(UV().recipes||[]).length ? `<p class="dlgP facNote">🍰 おぼえた レシピ：${UV().recipes.map(k => RECIPE[k] ? RECIPE[k][1] : '').join('・')}（カフェの メニューに あるよ）</p>` : ''}
    <table class="rep631">${CFG.degree.slice(1).map((D, i) => `<tr class="${u.degree >= i+1 ? 'got' : ''}"><th>${D.n}</th><td>${fmt(D.pt)}pt・${D.d}にち${D.adv ? '・アドバンス1テーマ' : ''}${D.mas ? `・マスター${D.mas}テーマ` : ''}</td><td>${u.degree >= i+1 ? '✅' : ''}</td></tr>`).join('')}</table>`, [{label:'とじる', cls:'gold', v:1}], 'wide');
}

/* ---------- まちの たてものに つなぐ ---------- */
/* facilities.js の FAC は 中に かくれているので、タップの しゅんかんだけ セルの id を すりかえて こちらで うけとる */
const HOOK = {school:'school', bg_university:'uni'}; let swap = null;
const restore = () => { if(swap && save.town && save.town.cells[swap.k]==='__sch631') save.town.cells[swap.k] = swap.id; swap = null; };
window.addEventListener('pointerup', e => {
  if(typeof curScreen==='undefined' || curScreen!=='town' || townEdit || !save.town) return;
  if(e.target.closest('#townMap .walker,.car2,.ship65,.air65')) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const k = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[k]; if(!HOOK[id]) return;
  restore(); swap = {k, id}; save.town.cells[k] = '__sch631'; setTimeout(restore, 600);
}, true);
window.addEventListener('click', e => {
  if(!swap) return; const c = e.target.closest && e.target.closest('#townMap .cell'); const s = swap; restore();
  if(!c || `${c.dataset.x},${c.dataset.y}` !== s.k) return;
  e.stopImmediatePropagation(); e.preventDefault(); open(HOOK[s.id], s.k);
}, true);
document.addEventListener('keydown', e => { if(e.key==='Escape' && CUR && !document.querySelector('#dlg.show')) close(); });
const _show631 = show; show = function(){ if(CUR) close(); return _show631.apply(this, arguments); };
/* じゅぎょう中の 文字は 出さない（v6.30）／だいがくの 上の アイコンは そのまま */
window.__sch631 = {open, close, SV, UV, DL, CFG, TH, special};

const css = document.createElement('style');
css.textContent = `
#sc631{position:fixed;inset:0;z-index:66;background:linear-gradient(180deg,#FFF9EE,#FDF2DF);overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;opacity:0;transition:opacity .22s;overscroll-behavior:contain}
#sc631.show{opacity:1}
body.sc631on{overflow:hidden}
.wrap631{max-width:560px;margin:0 auto;padding:0 8px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:7px}
.wrap631.uni{--main:#5A6FD6}
.hd631{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px;padding:calc(6px + env(safe-area-inset-top)) 2px 6px;background:linear-gradient(180deg,#FFF9EE 80%,rgba(255,249,238,0))}
.back631{border:none;background:#fff;border-radius:999px;padding:6px 11px;font:inherit;font-weight:900;font-size:13px;color:#7A5634;box-shadow:0 2px 0 #E6D6BB;white-space:nowrap}
.tt631{min-width:0;text-align:center;line-height:1.15}.tt631 b{display:block;font-size:17px;color:#6B4A2A}.tt631 small{display:block;font-size:10.5px;color:#C0702A;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stk631{border:2px solid #F7C35F;background:#FFF5D9;border-radius:12px;padding:3px 8px;font:inherit;line-height:1.15;text-align:center}.stk631 b{display:block;font-size:11.5px;color:#D2601E;white-space:nowrap}.stk631 small{font-size:10.5px;color:#8A6A45;font-weight:800}
.stk631.deg{border-color:#9DB0F2;background:#EEF2FF}.stk631.deg b{color:#3F55C4}
.stg631{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:3/1.4;box-shadow:0 3px 10px rgba(0,0,0,.12);border:3px solid #fff;flex:none}
.stg631.mini{aspect-ratio:3/1.25}
.stg631 .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%}
.stg631.locked .bg{filter:saturate(.7) brightness(.95)}
.who631{position:absolute;transform:translate(-50%,-100%);width:19%;max-width:96px;border:none;background:none;padding:0;cursor:pointer;animation:sway631 2.6s ease-in-out infinite alternate}
.who631 img{width:100%;height:auto;display:block;filter:drop-shadow(0 3px 2px rgba(0,0,0,.18))}
.who631::after{content:"";position:absolute;left:18%;right:18%;bottom:-2%;height:8%;border-radius:50%;background:rgba(80,50,20,.22);z-index:-1}
.who631.hop{animation:hop631 .6s ease-in-out infinite alternate}
@keyframes sway631{from{rotate:-2.5deg}to{rotate:2.5deg}}
@keyframes hop631{from{translate:0 0}to{translate:0 -10%}}
.prop631{position:absolute;right:-14%;bottom:4%;font-style:normal;font-size:clamp(14px,4.5vw,22px);filter:drop-shadow(0 2px 1px rgba(0,0,0,.2))}
.bl631{position:absolute;left:-6%;top:0;font-style:normal;font-size:10px;font-weight:900;background:#fff;border-radius:999px;padding:0 4px;color:#E05A7A;box-shadow:0 1px 2px rgba(0,0,0,.15)}
.bub631{position:absolute;left:50%;bottom:102%;transform:translateX(-50%);background:#fff;border:2px solid #E8D3B0;border-radius:12px;padding:3px 8px;font-size:11px;font-weight:800;color:#6B4A2A;white-space:nowrap;z-index:3;animation:pop631 .25s}
.mis631{display:flex;align-items:stretch;gap:4px;background:#fff;border-radius:14px;padding:5px;box-shadow:0 2px 0 #EADCC4;cursor:pointer}
.mis631>span{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:3px;font-size:10px;font-weight:800;color:#7A5634;line-height:1.2;background:#FFF8EA;border-radius:9px;padding:3px 4px}
.mis631>span i{flex:none;width:15px;height:15px;border:2px solid #D9C29A;border-radius:4px;font-style:normal;font-size:11px;line-height:11px;text-align:center;color:#fff;background:#fff}
.mis631>span.ok{background:#EAF8EC;color:#2E8B57}.mis631>span.ok i{background:#3BAF6A;border-color:#3BAF6A}
.chest631{flex:none;width:40px;border:none;background:#FFF1C9;border-radius:10px;font-size:22px;padding:0}
.chest631.glow{animation:glow631 1s ease-in-out infinite alternate;background:#FFE08A}.chest631.got{opacity:.55}
@keyframes glow631{from{box-shadow:0 0 0 0 rgba(255,190,0,.0);transform:scale(1)}to{box-shadow:0 0 12px 4px rgba(255,190,0,.7);transform:scale(1.08)}}
.sec631{background:#fff;border-radius:14px;padding:6px;box-shadow:0 2px 0 #EADCC4}
.h631{font-size:12.5px;font-weight:900;color:#6B4A2A;margin:0 2px 5px;display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}.h631 small{font-size:10.5px;color:#8A6A45}.h631 .hot{color:#E8414B;animation:harv630 1.2s infinite}
.sbs631{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.sb631{position:relative;border:2.5px solid color-mix(in srgb,var(--c) 35%,#fff);background:color-mix(in srgb,var(--c) 9%,#fff);border-radius:12px;padding:5px 1px 3px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}
.sb631 .ic{font-size:20px;line-height:1}.sb631 b{font-size:11.5px;color:var(--c);white-space:nowrap}.sb631 small{font-size:9.5px;color:#8A6A45;font-weight:800;white-space:nowrap}
.sb631.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 22%,#fff);box-shadow:0 3px 0 color-mix(in srgb,var(--c) 60%,#000 0%)}
.sb631.glow{animation:glow631 1.4s ease-in-out infinite alternate}
.stamp631{position:absolute;right:-3px;top:-5px;width:18px;height:18px;border-radius:50%;background:#E8414B;color:#fff;font-style:normal;font-size:11px;line-height:18px;text-align:center;font-weight:900;rotate:-12deg;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.rib631{position:absolute;left:-3px;top:-7px;font-style:normal;font-size:9px;font-weight:900;background:#FF7A45;color:#fff;border-radius:6px;padding:0 4px;white-space:nowrap;z-index:1}.rib631.g{background:#3BAF6A}
.st631{display:flex;gap:0;font-size:12px;line-height:1}.st631 i{font-style:normal;color:#DDD3C3}.st631 i.on{color:#FFB400;text-shadow:0 0 2px #fff}
.dfs631,.lvs631{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.df631,.lv631{position:relative;border:2.5px solid #EADCC4;background:#FFFBF2;border-radius:12px;padding:5px 2px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}
.df631 span{font-size:17px;line-height:1}.df631 b,.lv631 b{font-size:12px;color:#6B4A2A;white-space:nowrap}.df631 small,.lv631 small{font-size:9.5px;color:#8A6A45;font-weight:800;white-space:nowrap}
.df631.on{border-color:#F2A33A;background:#FFF0D2;box-shadow:0 3px 0 #E8A03A}.lv631.on{border-color:#5A6FD6;background:#EEF1FF;box-shadow:0 3px 0 #5A6FD6}
.lv631.lock{opacity:.7}.lv631 .bar631{width:90%;margin-top:2px}
.rw631{font-size:11px;font-weight:800;color:#7A5634;background:#FFF5DE;border-radius:10px;padding:4px 8px;text-align:center;line-height:1.35}.rw631.sm{font-size:10px;background:#F3F5FF;color:#4A5AA8}
.bdg631{border:none;font:inherit;font-size:11px;font-weight:800;color:#6B4A2A;background:#fff;border-radius:10px;padding:5px 8px;text-align:left;box-shadow:0 2px 0 #EADCC4;line-height:1.3}
.go631{border:none;font:inherit;font-weight:900;font-size:16px;color:#fff;background:linear-gradient(180deg,#FF8A5B,#F2663A);border-radius:16px;padding:11px 8px;box-shadow:0 4px 0 #C94A22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.go631.uni{background:linear-gradient(180deg,#7B8CF0,#5A6FD6);box-shadow:0 4px 0 #3F51B0}.go631.sub{background:linear-gradient(180deg,#7FCB8E,#4CAF6A);box-shadow:0 4px 0 #2E8B57;font-size:14px}
.go631:disabled{background:#CFC6B8;box-shadow:0 4px 0 #A99F90}
.tools631{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}
.tools631 button,.chip631{position:relative;border:none;background:#fff;border-radius:999px;padding:5px 9px;font:inherit;font-size:11.5px;font-weight:800;color:#6B4A2A;box-shadow:0 2px 0 #EADCC4;white-space:nowrap}
.tools631 button.off{opacity:.6}.tools631 b{margin-left:3px;background:#F2A33A;color:#fff;border-radius:999px;padding:0 5px;font-size:10.5px}.tools631 b.red{background:#E8414B}.tools631 b.nm{background:#5A6FD6;max-width:70px;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:middle}
.bar631{display:block;height:6px;border-radius:99px;background:#EFE5D3;overflow:hidden;margin-top:3px}.bar631 i{display:block;height:100%;background:linear-gradient(90deg,#FFD25A,#F2A33A);border-radius:99px}
.ths631{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.th631{position:relative;border:2.5px solid #DCE1F7;background:#F7F8FF;border-radius:12px;padding:6px 2px 4px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}
.th631 .ic{font-size:20px;line-height:1}.th631 b{font-size:11px;color:#3F4E9E;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.th631 small{font-size:9px;color:#6A74A8;font-weight:800;white-space:nowrap}
.th631.on{border-color:#5A6FD6;background:#E6EAFF;box-shadow:0 3px 0 #5A6FD6}.th631.lock{opacity:.6;background:#F1F1F1;border-color:#E2E2E2}
.ck631{position:absolute;right:3px;top:2px;font-style:normal;font-size:10px;color:#3BAF6A;font-weight:900}
.lock631{background:#fff;border-radius:14px;padding:8px 10px;box-shadow:0 2px 0 #E1E4F2;font-size:12.5px;color:#3F4E9E;font-weight:800}.lock631 p{margin:4px 0 0}.lock631 .sm{font-size:10.5px;color:#6A74A8}
/* もんだい */
.qz631{display:flex;flex-direction:column;gap:7px;padding-top:calc(8px + env(safe-area-inset-top));position:relative;min-height:60vh}
.qh631{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#fff;border-radius:12px;padding:6px 8px;box-shadow:0 2px 0 #EADCC4;border-left:6px solid var(--c,#5A6FD6);font-size:12.5px;font-weight:900;color:#6B4A2A}
.qh631.uni{--c:#5A6FD6}.qh631 .stg2{font-size:11px;color:#5A6FD6}
.dots631{display:flex;gap:3px}.dots631 i{width:9px;height:9px;border-radius:50%;background:#E8DCC8}.dots631 i.d{background:#F2A33A}.dots631 i.c{background:#fff;border:2px solid #F2A33A}
.cb631{margin-left:auto;background:#FF7A45;color:#fff;border-radius:999px;padding:1px 8px;font-size:11px;animation:pop631 .3s}
.lf631{margin-left:auto;color:#E8414B;font-size:15px;letter-spacing:1px}
.tc631{height:34px;width:auto;margin-left:auto}
.cb631+.tc631{margin-left:4px}
.nb631{display:flex;align-items:center;gap:3px;font-size:12px}.nb631 i{flex:1;height:5px;border-radius:3px;background:#E1E4F2}.nb631 i.on{background:#5A6FD6}
.revt631,.near631{text-align:center;font-weight:900;font-size:12.5px;color:#D2601E;background:#FFF0D9;border-radius:10px;padding:3px}
.qq631{background:#fff;border-radius:14px;padding:10px;box-shadow:0 2px 0 #EADCC4;font-size:16px;overflow-x:auto}
.qq631 img,.qq631 svg{max-width:100%;height:auto}
.hint631{background:#FFFBE0;border:2px dashed #F2C94C;border-radius:12px;padding:6px 9px;font-size:13px;font-weight:800;color:#8A5A00;line-height:1.4}.hint631 small{font-weight:700;color:#6B5540}
.ops631{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.op631{border:2.5px solid #E6D6BB;background:#fff;border-radius:14px;padding:11px 6px;font:inherit;font-weight:900;font-size:15px;color:#4A3A2A;min-height:50px;word-break:break-word;overflow-wrap:anywhere;line-height:1.25;box-shadow:0 3px 0 #E6D6BB}
.op631:disabled{opacity:.35;text-decoration:line-through}
.op631.ok{background:#E3F7E8;border-color:#3BAF6A;box-shadow:0 3px 0 #3BAF6A}.op631.ng{background:#FFE7E7;border-color:#E8414B;box-shadow:0 3px 0 #E8414B;animation:shake631 .3s}
@keyframes shake631{25%{translate:-4px 0}75%{translate:4px 0}}
.qt631{display:flex;justify-content:center}
.tm631{position:relative;height:16px;border-radius:99px;background:#EEE;overflow:hidden}.tm631 i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#FF7A45,#FFC24A);transition:width 1s linear}.tm631 b{position:relative;display:block;text-align:center;font-size:11px;line-height:16px;color:#6B4A2A}
.exw631{background:#fff;border-radius:14px;padding:6px;box-shadow:0 2px 0 #EADCC4;max-height:none}
.exb631{display:flex;flex-direction:column;gap:6px}.exb631 .btn{width:100%}
.pop631{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);background:rgba(255,255,255,.96);border:3px solid #FFC94D;border-radius:18px;padding:10px 16px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.18);animation:pop631 .3s;z-index:4;max-width:88%}
.pop631 span{display:block;font-size:44px;line-height:1.1}.pop631 b{font-size:14px;color:#D2601E}
@keyframes pop631{from{transform:translate(-50%,-50%) scale(.5);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
.bub631{animation:none}
/* けっか */
.res631{display:flex;flex-direction:column;gap:7px;padding-top:calc(8px + env(safe-area-inset-top));text-align:center}
.res631 h2{margin:2px 0 0;font-size:20px;color:#6B4A2A}.res631 h2.hk631{font-size:26px;color:#3F55C4;animation:pop2 .5s}
@keyframes pop2{from{scale:.4}to{scale:1}}
.bigst631{display:flex;justify-content:center;gap:6px;font-size:46px;line-height:1}.bigst631 i{font-style:normal;color:#E3D9C8;scale:.2;animation:star631 .4s forwards}.bigst631 i.on{color:#FFB400;text-shadow:0 2px 0 #E08A00}
@keyframes star631{to{scale:1}}
.hn631{margin:0;font-weight:900;color:#7A5634;font-size:13px}
.ln631{list-style:none;margin:0;padding:6px 8px;background:#fff;border-radius:14px;box-shadow:0 2px 0 #EADCC4;text-align:left;font-size:12.5px;font-weight:800;color:#5A4430;display:flex;flex-direction:column;gap:3px}
.tot631{font-weight:900;color:#D2601E;font-size:15px}.tot631 b{font-size:22px}
.stp631,.nx631{font-size:12px;font-weight:800;color:#6B4A2A;background:#FFF5DE;border-radius:10px;padding:5px 8px;text-align:left}.stp631 b{color:#E8414B}
.tmr631{margin:0;font-size:12.5px;font-weight:800;color:#3F4E9E;background:#EEF1FF;border-radius:10px;padding:5px 8px}
.warn631{margin:0;color:#C0392B;font-weight:900;font-size:12px}
.rb631{display:flex;flex-direction:column;gap:6px}.rb631 .btn{width:100%}
.ent631{position:relative}.ent631 .bgE{width:100%;border-radius:16px;aspect-ratio:3/1.4;object-fit:cover}
.clap631{display:flex;flex-wrap:wrap;justify-content:center;gap:2px}.clap631 span{position:relative;width:15%;max-width:70px;animation:hop631 .5s ease-in-out infinite alternate}.clap631 img{width:100%}.clap631 i{position:absolute;right:-4px;top:-4px;font-style:normal;font-size:16px}
/* ダイアログの なかみ */
.rep631{width:100%;border-collapse:collapse;font-size:12.5px}.rep631 th,.rep631 td{padding:4px 5px;border-bottom:1px solid #F0E6D6;text-align:left;vertical-align:top}.rep631 th{white-space:nowrap;color:#6B4A2A}.rep631 td small{display:block;color:#3F55C4;font-weight:800}.rep631 tr.got{background:#EAF8EC}
.up631{display:block;color:#E8414B;font-size:12px}
.cal631{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:6px 0}.cal631 span{background:#F6EFE2;border-radius:8px;min-height:36px;display:flex;flex-direction:column;align-items:center;font-size:14px}.cal631 span small{font-size:9px;color:#8A6A45}.cal631 span.on{background:#FFE3EC}.cal631 span.td{outline:2px solid #F2A33A}
.mi631{list-style:none;padding:0;margin:6px 0;text-align:left;font-weight:800;font-size:13px;display:flex;flex-direction:column;gap:4px}.mi631 li.ok{color:#2E8B57}
.big631{font-size:64px;text-align:center;line-height:1.1}.spin631{animation:spin631 .8s ease-out}@keyframes spin631{from{rotate:-200deg;scale:.3}to{rotate:0;scale:1}}
.nt631{display:grid;grid-template-columns:1fr 1fr;gap:5px;text-align:left}.nt631>div{background:#FFF8EA;border-radius:10px;padding:5px 7px;font-size:12px}.nt631 span{float:right;font-weight:900}.nt631 small{display:block;color:#7A5634;font-size:10.5px;line-height:1.35;margin-top:2px}
.sbst631{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:6px 0;font-size:12px;font-weight:800}.sbst631 span{background:#FFF5DE;border-radius:999px;padding:1px 8px}
.fig632{max-width:100%;height:auto;display:block}
/* v6.33 がっこう */
#sc631.bgS633{background:#F6E9C8}
#sc631.bgS633::before{content:"";position:fixed;inset:0;background:url(./assets/images/v631/bg_school.webp) center top/cover no-repeat;z-index:0;pointer-events:none}
#sc631.bgS633>*{position:relative;z-index:1}
#sc631.bgS633 .hd631{background:none!important;position:relative}
.logo633{height:62px;width:auto;max-width:100%;display:block;margin:0 auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.2))}
#sc631.bgS633 .tt631 small{background:rgba(255,255,255,.85);border-radius:99px;padding:0 6px;display:inline-block;max-width:100%}
.stg631.clear633{background:none;border:none;box-shadow:none;aspect-ratio:3/1.15}
.stg631.clear633 .bg{display:none}
#sc631.bgS633 .sec631,#sc631.bgS633 .bdg631,#sc631.bgS633 .mis633{background:rgba(255,255,255,.92)}
.sic633{width:34px;height:34px;object-fit:contain;display:block}
.sb631 .ic{height:34px}
.dfi633{width:38px;height:38px;object-fit:contain;display:block}
.df631 span{height:38px}
.mis633{border-radius:14px;padding:6px 8px;box-shadow:0 2px 0 #EADCC4}
.mh633{display:flex;align-items:center;gap:6px;cursor:pointer}.mh633 b{font-size:12.5px;color:#6B4A2A}.mc633{margin-left:auto;background:#F2A33A;color:#fff;border-radius:99px;font-size:11px;font-weight:900;padding:0 8px}
.mb633{display:flex;align-items:center;gap:6px;margin-top:4px}
.mb633 ol{list-style:none;margin:0;padding:0;flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;cursor:pointer}
.mb633 li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:#6B4A2A;background:#FFF8EA;border-radius:9px;padding:3px 7px}
.mb633 li i{flex:none;width:18px;height:18px;border-radius:50%;background:#E8D7B8;color:#fff;font-style:normal;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center}
.mb633 li.ok{background:#EAF8EC;color:#2E8B57}.mb633 li.ok i{background:#3BAF6A}.mb633 li.ok span{text-decoration:line-through;text-decoration-color:rgba(46,139,87,.5)}
.chest633{flex:none;width:66px;border:none;background:#FFF4D6;border-radius:12px;padding:4px 2px;display:flex;flex-direction:column;align-items:center;font:inherit}
.chest633 small{font-size:9.5px;font-weight:900;color:#B5701C;white-space:nowrap}
.chi633{width:46px;height:46px;object-fit:contain}
.chest633.glow{animation:glow631 1s ease-in-out infinite alternate;background:#FFE08A}.chest633.got{opacity:.5}
/* じゅぎょうは カード */
.wrap631.card633{min-height:100%;justify-content:center;padding-top:calc(14px + env(safe-area-inset-top));padding-bottom:20px}
.card633 .qz631{min-height:0;background:rgba(255,251,242,.97);border-radius:22px;padding:12px 10px 12px;box-shadow:0 8px 28px rgba(60,40,10,.35);border:3px solid #fff;margin:0 2px}
.quit633{align-self:flex-end;border:none;background:#fff;border-radius:999px;padding:4px 11px;font:inherit;font-size:12px;font-weight:900;color:#8A6A45;box-shadow:0 2px 0 #E6D6BB;margin-bottom:-2px}
.card633 .pop631{top:45%}
/* ===== v6.41 だいがく ===== */
#sc631.bgU634{background:#EADFC4}
#sc631.bgU634::before{background:url(./assets/images/v641/bg_univ_pals.webp) center top/cover no-repeat!important;filter:blur(6px);opacity:.55}
.s639.u641{container-type:inline-size;background:#EADFC4 url(./assets/images/v641/bg_univ_pals.webp) center top/100% auto no-repeat}
.tp639.tpu641{min-height:86cqw}
.tpu641 .lg639{max-width:170px}
.tpu641 .cp639 span{font-size:11.5px}
.pal639.u1{left:19%;width:24%;top:42cqw;height:40cqw}.pal639.u2{left:43%;width:22%;top:44cqw;height:38cqw}.pal639.u3{left:65%;width:28%;top:51cqw;height:31cqw}
.pb639.u1,.pb639.u2,.pb639.u3{max-width:29cqw;line-height:1.25;font-size:clamp(11px,3.2cqw,15px);padding:5px 8px}
.pb639.u1{left:1cqw;top:32cqw}.pb639.u1::after{left:66%}
.pb639.u2{left:37cqw;top:31cqw;animation-delay:.9s}.pb639.u2::after{left:44%}
.pb639.u3{right:1cqw;top:37cqw;animation-delay:1.8s}.pb639.u3::after{right:58%}
.pu641{background:rgba(250,251,255,.97);border-color:#C9D3F2;box-shadow:0 4px 0 #AFBDE8,0 6px 14px rgba(40,50,120,.15)}
.pu641 .ph639 b{color:#33407A}
.ck639.n{font-style:normal;font-size:12px;font-weight:900;color:#fff;background:#8C9AD6;border-color:#8C9AD6}
.u641 .cs639{background:#EEF1FF}.u641 .cs639 small{color:#3F4E9E}
.tg641{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.tc641{position:relative;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 10%,#fff);border-radius:16px;padding:6px 2px 5px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0;box-shadow:0 3px 0 color-mix(in srgb,var(--c) 40%,#fff)}
.tc641:active{transform:translateY(2px)}
.tc641 .si{position:relative;height:42px}.tc641 .si .thi634{width:42px;height:42px}
.tc641 b{font-size:12.5px;color:color-mix(in srgb,var(--c) 75%,#000);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.tc641 small{font-size:9px;color:#6A74A8;font-weight:800;white-space:nowrap}
.tc641 .st631{font-size:13px}
.tc641.lk{filter:grayscale(.75);opacity:.7}
.lk641{position:absolute;right:-8px;bottom:-4px;width:18px;height:20px}.lk641 svg{width:100%;height:100%}
.tc641 .last634{left:50%;right:auto;transform:translateX(-50%);bottom:-8px}
.u641 .stp639 i{border-color:#AFBDE8}.u641 .stp639 i.on{background:#5A6FD6;border-color:#5A6FD6}.u641 .stp639 b{color:#3F55C4}
.nm641{font-size:9.5px;color:#5A6FD6;font-weight:900;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tl639 .sil634{width:40px;height:40px;border-radius:12px}
.chip641{display:inline-flex;align-items:center;gap:3px;background:#EEF1FF;border-radius:99px;padding:4px 10px;font-size:11.5px;font-weight:900;color:#3F4E9E}.chip641 .ii635{width:20px;height:20px;margin:0}
.lk641p{margin:4px 2px;font-size:13px;font-weight:900;color:#33407A}.lk641p.sm{font-size:11px;color:#6A74A8}
.pu641 .go631{width:100%;margin-top:6px}
.btn.lv641{position:relative;display:flex!important;flex-direction:column;align-items:center;gap:1px;padding:8px 2px!important;border:2px solid #C9D3F2!important;border-radius:16px!important;min-width:0;background:#F6F8FF!important}
.btn.lv641 b{font-size:13px;color:#33407A;display:flex;align-items:center;gap:2px}.btn.lv641 small{font-size:9.5px;color:#6A74A8}.btn.lv641 .st631{font-size:13px}
.btn.lv641.l1{border-color:#9DB0F2!important}.btn.lv641.l2{border-color:#B79AF0!important;background:#F7F2FF!important}
.btn.lv641.off{opacity:.55;pointer-events:none}
.btn.lv641 i{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);font-style:normal;font-size:9px;font-weight:900;background:#fff;color:#6A74A8;border:1.5px solid #C9D3F2;border-radius:8px;padding:0 5px;white-space:nowrap}

/* ===== v6.40 がっこう：フクロウ＆アザラシの 背景・ロゴ ===== */
#sc631.bgS633{background:#F3DCAB}
#sc631.bgS633::before{background:url(./assets/images/v639/bg_school_pals.webp) center top/cover no-repeat!important;filter:blur(6px) saturate(1.1);opacity:.6}
.s639{container-type:inline-size;background:#F3DCAB url(./assets/images/v639/bg_school_pals.webp) center top/100% auto no-repeat;padding-left:8px;padding-right:8px;box-shadow:0 0 30px rgba(0,0,0,.15)}
.tp639{position:relative;min-height:88cqw}
.lg639{justify-self:center;width:100%;max-width:200px;height:auto;display:block;margin-top:-4px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.18));animation:sg639 3s ease-in-out infinite}
.hd639{grid-template-columns:auto minmax(0,1fr) auto!important}
.cp639{position:relative;z-index:2}
.pal639{position:absolute;top:48cqw;height:38cqw;border:none;background:none;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.pal639.ow{left:18%;width:33%}.pal639.se{left:51%;width:33%}
.pb639{position:absolute;top:31cqw;z-index:3;max-width:40cqw;background:#fff;border:3px solid #6B4A2A;border-radius:20px;padding:6px 11px;font-size:clamp(12px,3.6cqw,17px);line-height:1.35;font-weight:900;color:#4A3420;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.12);cursor:pointer;animation:bub639 2.6s ease-in-out infinite}
.pb639.ow{left:4cqw;transform-origin:70% 100%}.pb639.se{right:4cqw;transform-origin:30% 100%;animation-delay:1.3s}
.pb639::after{content:"";position:absolute;bottom:-13px;border:7px solid transparent;border-top:10px solid #6B4A2A}
.pb639.ow::after{left:70%}.pb639.se::after{right:62%}
.pb639.pop{animation:pbp639 .35s ease-out, bub639 2.6s ease-in-out .35s infinite}
@keyframes pbp639{from{transform:scale(.6)}to{transform:scale(1)}}

/* ===== v6.39 がっこう（テンション UP） ===== */
#sc631.bgS633::before{background:url(./assets/images/v639/bg_school_gate.webp) center top/cover no-repeat!important}
.s639{gap:9px;padding-bottom:calc(20px + env(safe-area-inset-bottom))}
.hd639{display:grid;grid-template-columns:auto 1fr auto;align-items:start;gap:6px;padding:calc(8px + env(safe-area-inset-top)) 0 0}
.bk639{display:flex;align-items:center;gap:2px;border:3px solid #fff;background:linear-gradient(180deg,#FFF6E2,#F7E3BE);border-radius:18px;padding:5px 7px 5px 4px;font:inherit;box-shadow:0 3px 0 #C9A36A,0 4px 8px rgba(0,0,0,.15)}
.bk639 svg{width:24px;height:24px;background:#F07B54;border-radius:50%;padding:3px}.bk639 b{font-size:12.5px;color:#6B3A12;white-space:nowrap}
.sg639{position:relative;justify-self:center;display:flex;align-items:center;gap:4px;padding:5px 10px 6px 6px;background:linear-gradient(180deg,#F8DCA8,#E9BC78);border:3.5px solid #8A5A2B;border-radius:16px;box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 4px 0 #6B4220,0 6px 10px rgba(0,0,0,.18);transform:rotate(-1.5deg);animation:sg639 3s ease-in-out infinite}
@keyframes sg639{50%{transform:rotate(1deg) translateY(-2px)}}
.sg639::before{content:"";position:absolute;inset:3px;border-radius:11px;background:repeating-linear-gradient(175deg,rgba(150,90,30,.08) 0 3px,transparent 3px 9px);pointer-events:none}
.sg639 img{width:30px;height:30px;object-fit:contain;flex:none}
.sg639 div{display:flex;flex-direction:column;line-height:1;white-space:nowrap;word-break:keep-all}
.sg639 small{font-size:10.5px;font-weight:900;color:#7A4A1A;letter-spacing:1px}
.sg639 b{font-size:27px;font-weight:900;color:#5A2E0C;letter-spacing:2px;text-shadow:0 2px 0 #FFF2D6}
.sg639 .lf{position:absolute;top:-11px;width:18px;height:22px;background:radial-gradient(ellipse at 40% 40%,#9BE07A,#4CAF50);border-radius:0 80% 0 80%;border:2px solid #2E7D32}
.sg639 .lf.l{left:-6px;transform:rotate(-30deg)}.sg639 .lf.r{right:-6px;transform:rotate(60deg) scaleX(-1)}
.st639{display:flex;flex-direction:column;align-items:center;gap:1px;border:3px solid #F7C35F;background:#FFFBEF;border-radius:16px;padding:3px 6px;font:inherit;box-shadow:0 3px 0 #E8B04A}
.st639 span{display:flex;align-items:center;gap:1px;font-size:10px;font-weight:900;color:#6B4A2A;white-space:nowrap}
.st639 em{font-style:normal;font-size:20px;color:#E8414B;line-height:1}.st639 em.g{color:#6B4A2A}
.st639 .ii635{width:18px;height:18px;margin:0}.sx639{font-style:normal;color:#FFB400;font-size:22px;line-height:1;text-shadow:0 1px 0 #C98A00}
.cp639{text-align:center;margin-top:-2px}
.cp639 span{display:inline-block;font-size:13px;font-weight:900;color:#6B3A12;background:rgba(255,255,255,.85);border-radius:99px;padding:2px 12px;box-shadow:0 2px 4px rgba(0,0,0,.1)}
.sc639{position:relative;height:205px;margin:0 -4px}
.pl639{position:absolute;bottom:0;transform:translateX(-50%);width:38%;max-width:170px;border:none;background:none;padding:0;animation:hop639 1.6s ease-in-out infinite}
@keyframes hop639{0%,100%{translate:0 0}50%{translate:0 -7px}}
.pl639 img{width:100%;height:150px;object-fit:contain;object-position:bottom;display:block;filter:drop-shadow(0 5px 4px rgba(0,0,0,.25))}
.pl639 em{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);font-style:normal;font-size:10.5px;font-weight:900;background:#fff;border-radius:99px;padding:0 8px;color:#6B4A2A;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.bb639{position:absolute;bottom:150px;width:max-content;max-width:128px;background:#fff;border:3px solid #6B4A2A;border-radius:18px;padding:5px 9px;font-size:12.5px;line-height:1.35;font-weight:900;color:#4A3420;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.12);animation:bub639 2.4s ease-in-out infinite}
.pl639.l .bb639{left:-4%}.pl639.r .bb639{right:-4%}
.bb639::after{content:"";position:absolute;bottom:-12px;border:7px solid transparent;border-top:9px solid #6B4A2A}
.pl639.l .bb639::after{left:60%}.pl639.r .bb639::after{right:60%}
@keyframes bub639{50%{transform:scale(1.05) rotate(-2deg)}}
.pn639{background:rgba(255,253,246,.97);border:3px solid #F1D9AA;border-radius:22px;padding:9px 9px 10px;box-shadow:0 4px 0 #E3C489,0 6px 14px rgba(120,80,20,.15)}
.ph639{display:flex;align-items:center;gap:6px;margin:0 2px 7px}
.ph639 b{font-size:16px;color:#5A3A1A;letter-spacing:1px;white-space:nowrap}
.ph639 .ii635,.pi639{width:28px;height:28px;margin:0;object-fit:contain;flex:none}
.ct639{margin-left:auto;background:#F2A33A;color:#fff;border-radius:99px;padding:1px 10px;font-weight:900;font-size:13px}
.hint639{margin-left:auto;font-size:9.5px;font-weight:900;color:#B5701C;white-space:nowrap}@media (max-width:430px){.hint639{display:none}}
.dl639{flex:1;height:0;border-bottom:3px dotted #E3C489;margin-left:4px}
.mw639{display:flex;gap:7px;align-items:stretch}
.mw639 ol{list-style:none;margin:0;padding:0;flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.mw639 li{display:flex;align-items:center;gap:6px;background:var(--bg);border-radius:14px;padding:5px 8px;min-height:36px}
.ck639{flex:none;width:22px;height:22px;border-radius:50%;background:#fff;border:2.5px solid #CFC2AA;display:flex;align-items:center;justify-content:center}
.ck639 svg{width:15px;height:15px}
.mw639 li.ok .ck639{background:#3BAF6A;border-color:#3BAF6A;animation:pop2 .4s}
.mi639 .ii635,.mi639 .sic633{width:24px;height:24px;margin:0}
.mt639{font-size:13px;font-weight:900;color:#5A4430;line-height:1.25}
.mw639 li.ok .mt639{color:#3B8F5A;text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:rgba(59,143,90,.55)}
.cs639{flex:none;width:30%;max-width:130px;border:none;background:#FFF4D2;border-radius:16px;padding:6px 4px;font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
.cs639 .chi633{width:62px;height:62px}
.cs639 small{font-size:10px;font-weight:900;color:#8A5A12;line-height:1.35;text-align:center}
.cs639.glow{animation:glow631 .9s ease-in-out infinite alternate;background:#FFE08A}.cs639.got{opacity:.6}
.sj639{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
.sb639{position:relative;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 12%,#fff);border-radius:16px;padding:7px 1px 5px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;box-shadow:0 3px 0 color-mix(in srgb,var(--c) 40%,#fff);transition:transform .1s}
.sb639:active{transform:translateY(3px);box-shadow:0 1px 0 color-mix(in srgb,var(--c) 55%,#fff)}
.sb639 .si .sic633{width:46px;height:46px;display:block;margin:0}
.sb639 b{font-size:14px;color:var(--c);white-space:nowrap;filter:brightness(.85)}
.sb639 .st631{font-size:14px}
.sb639 small{font-size:9px;color:#8A6A45;font-weight:800;white-space:nowrap}
.sb639.glow{animation:glow631 1.2s ease-in-out infinite alternate}
.x15{position:absolute;left:-4px;top:-9px;font-style:normal;font-size:10px;font-weight:900;background:#FF6B4A;color:#fff;border-radius:8px;padding:0 5px;transform:rotate(-8deg);box-shadow:0 2px 0 #C94A22;z-index:1}
.sp639{position:absolute;right:3px;top:3px;width:17px;height:17px;border-radius:50%;background:#fff;border:2px solid #5BBF6A;color:#3BAF6A;font-style:normal;font-size:10px;line-height:13px;text-align:center;font-weight:900;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.stp639{display:flex;align-items:center;gap:4px;justify-content:center;margin-top:7px;font-size:11.5px;font-weight:900;color:#7A5634}
.stp639 i{width:13px;height:13px;border-radius:50%;border:2px solid #A8D8B0;background:#fff}.stp639 i.on{background:#5BBF6A;border-color:#5BBF6A}
.stp639 b{color:#3B9F5A;animation:blink634 .8s ease-in-out infinite alternate}
.tls639{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.tl639{position:relative;border:2.5px solid #EADCC4;background:#fff;border-radius:16px;padding:6px 2px 5px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0;box-shadow:0 3px 0 #E3D3B4}
.tl639 .ti{height:40px;display:flex;align-items:center}
.tl639 .ti .ii635,.tl639 .ti .md636{width:40px;height:40px;margin:0}
.tl639 b{font-size:11.5px;color:#5A4430;line-height:1.2;text-align:center}
.bd639{position:absolute;right:-5px;top:-7px;min-width:22px;height:22px;border-radius:99px;background:#F2A33A;color:#fff;font-style:normal;font-weight:900;font-size:12px;line-height:22px;padding:0 5px;border:2px solid #fff;box-shadow:0 2px 3px rgba(0,0,0,.2)}
.bd639.red{background:#E8414B;animation:hop639 1s ease-in-out infinite}
.mb639{display:block;width:80%;height:6px;border-radius:99px;background:#EFE5D3;overflow:hidden}.mb639 i{display:block;height:100%;background:linear-gradient(90deg,#FFD25A,#F2A33A)}
.sub639{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:8px}
.sub639 button{position:relative;display:inline-flex;align-items:center;gap:3px;border:none;background:#FFF6E4;border-radius:99px;padding:4px 10px;font:inherit;font-size:11.5px;font-weight:900;color:#6B4A2A}
.sub639 img{width:20px;height:20px;object-fit:contain}.sub639 .ii635{width:20px;height:20px;margin:0}
.sub639 .bd639{position:static;min-width:16px;height:16px;line-height:16px;font-size:10px;padding:0 4px;border:none}
/* むずかしさ えらび */
.pk639{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--c) 12%,#fff);border:3px solid var(--c);border-radius:16px;padding:6px 10px}
.pk639 .pki .sic633{width:56px;height:56px;margin:0}
.pk639 div{display:flex;flex-direction:column;text-align:left}.pk639 b{font-size:22px;color:var(--c);filter:brightness(.85)}.pk639 small{font-size:11px;color:#7A5634;font-weight:800}
.pk639 em{font-style:normal;font-size:11px;font-weight:900;color:#fff;background:#FF6B4A;border-radius:8px;padding:0 6px;align-self:flex-start}
.dfw639 #dlgBtns{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.btn.df639{position:relative;display:flex!important;flex-direction:column;align-items:center;gap:1px;padding:8px 2px!important;border:3px solid #EADCC4!important;border-radius:16px!important;min-width:0}
.btn.df639 img{width:52px;height:52px;object-fit:contain}.btn.df639 b{font-size:15px;color:#5A4430}.btn.df639 small{font-size:10px;color:#8A6A45}
.btn.df639.easy{border-color:#9BD58A!important;background:#F2FBEE!important}.btn.df639.normal{border-color:#FFD25A!important;background:#FFFAE6!important}.btn.df639.hard{border-color:#F59AB0!important;background:#FFF0F4!important}
.btn.df639 em{position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-style:normal;font-size:10px;font-weight:900;background:#3BAF6A;color:#fff;border-radius:8px;padding:0 6px;white-space:nowrap}
.btn.df639 i{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);font-style:normal;font-size:9px;font-weight:900;background:#fff;color:#8A6A45;border:1.5px solid #EADCC4;border-radius:8px;padding:0 5px;white-space:nowrap}
.dfw639 .btn.cancel639{grid-column:1/-1;margin-top:6px}
.bdb639{background:#FFF8EA;border-radius:12px;padding:6px 8px;margin:6px 0;text-align:left}.bdb639>b{font-size:12.5px;color:#6B4A2A;display:flex;align-items:center;gap:3px;margin-bottom:3px}
@media (max-width:360px){ .sg639 b{font-size:26px} .ph639 b{font-size:15px} .hint639{display:none} }
.sg639{min-width:0}

.md636{width:1.6em;height:1.6em;object-fit:contain;vertical-align:middle;display:inline-block}.md636.s{width:1.3em;height:1.3em}.md636.h{width:1.5em;height:1.5em}.md636.none{width:0}
.b636{display:flex!important;flex-direction:column;gap:3px}
.bt636{display:flex;align-items:center;gap:4px}.bt636 b{font-size:12.5px;color:#6B4A2A}.bt636 span{margin-left:auto;font-size:11px;color:#8A6A45;display:flex;align-items:center;gap:2px}
.bb636{display:grid;grid-template-columns:96px 1fr;align-items:center;gap:6px}.bb636 small{font-size:10.5px;color:#7A5634;white-space:nowrap}.bb636 .bar631{margin:0;height:8px}.bb636 .bar631.d i{background:linear-gradient(90deg,#9BE0AE,#3BAF6A)}
.bb636.e{display:block}.bb636.e small{color:#D2601E;white-space:normal}

/* v6.35 アイコン・ナビ */
.ii635{width:1.45em;height:1.45em;object-fit:contain;display:inline-block;vertical-align:middle;margin:-3px 1px 0 0}
.ii635.big{width:1.6em;height:1.6em;filter:drop-shadow(0 1px 1px rgba(0,0,0,.25))}
.ii635.h{width:1.5em;height:1.5em}
.ii635.xl{width:84px;height:84px}
.sic633{width:1.45em;height:1.45em;object-fit:contain;display:inline-block;vertical-align:middle;margin-top:-3px}
.sb631 .sic633{width:34px;height:34px;display:block;margin:0}
.tools631 button,.chip631{display:inline-flex;align-items:center;gap:2px}
.stk631 b,.stk631 small{display:flex!important;align-items:center;justify-content:center;gap:2px}
.stk631 .ii635{width:18px;height:18px;margin:0}
.hp635 img{width:20px;height:20px;object-fit:contain}
.gd635{display:flex;gap:10px;align-items:flex-end;text-align:left}
.gdb635{flex:none;width:96px;animation:hop631 .8s ease-in-out infinite alternate}.gdb635 img{width:100%;height:auto;display:block}
.gdt635{position:relative;flex:1;min-width:0;background:#FFFDF4;border:3px solid #F2C94C;border-radius:16px;padding:8px 10px}
.gdt635::before{content:"";position:absolute;left:-12px;bottom:18px;border:8px solid transparent;border-right:10px solid #F2C94C}
.gdt635>b{display:inline-block;background:#5BB0E8;color:#fff;border-radius:99px;font-size:11px;padding:0 8px;margin-bottom:2px}
.gdt635 h3{margin:2px 0 4px;font-size:16px;color:#6B4A2A}
.gdt635 p{margin:0;font-size:13.5px;line-height:1.6;color:#4A3A2A}
.gdd635{display:flex;justify-content:center;gap:5px;margin-top:8px}.gdd635 i{width:8px;height:8px;border-radius:50%;background:#E3D6BE}.gdd635 i.on{background:#F2A33A;width:18px;border-radius:99px}

/* v6.34 だいがく */
#sc631.bgU634{background:#EEF1E4}
#sc631.bgU634::before{content:"";position:fixed;inset:0;background:url(./assets/images/v631/bg_univ.webp) center top/cover no-repeat;z-index:0;pointer-events:none}
#sc631.bgU634>*{position:relative;z-index:1}
#sc631.bgU634 .hd631{background:none!important;position:relative}
#sc631.bgU634 .tt631 small{background:rgba(255,255,255,.85);border-radius:99px;padding:0 6px;display:inline-block;max-width:100%;color:#3F55C4}
#sc631.bgU634 .sec631,#sc631.bgU634 .lock631,#sc631.bgU634 .rw631{background:rgba(255,255,255,.92)}
#sc631.bgU634 .wrap631.result{min-height:100%;justify-content:flex-end}
#sc631.bgU634 .res631{background:rgba(250,251,255,.96);border-radius:22px;padding:10px 10px 12px;margin-top:calc(10px + env(safe-area-inset-top));box-shadow:0 8px 28px rgba(20,30,80,.3);border:3px solid #fff}
#sc631.bgU634 .res631 .stg631.mini{aspect-ratio:3/.9;margin:-4px 0 -6px}
#sc631.bgU634 .ent631 .bgE{display:none}
.thi634{width:36px;height:36px;object-fit:contain;display:block}
.th631 .ic{position:relative;height:36px}.th631.lock .thi634{filter:grayscale(1) opacity(.5)}
.lk634{position:absolute;right:-8px;bottom:-4px;font-style:normal;font-size:14px}
.last634{position:absolute;right:-4px;bottom:-8px;font-style:normal;font-size:9px;font-weight:900;color:#fff;background:#E8414B;border-radius:6px;padding:0 4px;animation:blink634 .8s ease-in-out infinite alternate;white-space:nowrap}
@keyframes blink634{from{opacity:1}to{opacity:.35}}
.sec634{position:relative;border:none;background:#2E2A4A!important;color:#fff!important;border-radius:999px;padding:3px 10px 3px 4px!important;display:inline-flex;align-items:center;gap:4px;font:inherit;font-size:11.5px;font-weight:900;box-shadow:0 2px 0 #19162E!important}
.sec634 small{font-size:10px;opacity:.85}.sec634.open{background:linear-gradient(90deg,#FF8AD8,#8AB4FF)!important}
.sil634{position:relative;display:inline-block;width:26px;height:26px;border-radius:50%;background:#46406E;overflow:hidden}
.sil634 img{width:100%;height:100%;object-fit:contain;filter:brightness(0) invert(1);opacity:.95;clip-path:inset(var(--r,100%) 0 0 0)}
.sil634.big{width:120px;height:120px;border-radius:24px}
/* カード */
.cd634{perspective:900px;width:min(62vw,230px);margin:4px auto}
.cd634 .in634{position:relative;transform-style:preserve-3d;transition:transform .8s}
.cd634.flip .in634{animation:flip634 1.1s ease-out both}
@keyframes flip634{0%{transform:rotateY(180deg) scale(.6)}60%{transform:rotateY(-10deg) scale(1.05)}100%{transform:rotateY(0) scale(1)}}
.cd634 .bk634,.cd634 .fr634{backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:16px}
.cd634 .bk634{position:absolute;inset:0;transform:rotateY(180deg);background:repeating-linear-gradient(45deg,var(--tc),var(--tc) 10px,color-mix(in srgb,var(--tc) 70%,#fff) 10px 20px);display:flex;align-items:center;justify-content:center;font-size:52px;border:4px solid #fff}
.cd634 .fr634{position:relative;background:#fff;border:5px solid var(--tc);padding:8px 10px 10px;box-shadow:0 6px 16px rgba(0,0,0,.2);text-align:center}
.cd634.kira .fr634{background:linear-gradient(135deg,#FFF6D0,#E8F4FF 35%,#FFE3F4 65%,#E9FFE8);border-image:linear-gradient(135deg,#FFD24A,#FF8AD8,#8AB4FF,#7CE0A0) 1;border-radius:0}
.cd634.kira .fr634::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.75) 45%,transparent 60%);background-size:250% 100%;animation:shine634 2.4s linear infinite;pointer-events:none}
@keyframes shine634{from{background-position:150% 0}to{background-position:-100% 0}}
.ct634{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:900;color:var(--tc)}.ct634 em{font-style:normal;color:#8A8A9A;font-size:10px}
.ci634{width:72px;height:72px;object-fit:contain;display:block;margin:4px auto}
.cd634 p{margin:2px 0 0;font-size:13px;font-weight:800;color:#3A3A4A;line-height:1.5;text-align:left}
.kr634{position:absolute;left:8px;bottom:-10px;font-style:normal;font-size:10px;font-weight:900;color:#fff;background:linear-gradient(90deg,#FFB400,#FF6FB5);border-radius:99px;padding:1px 7px}
.cdw634 .cd634{width:min(72vw,260px)}
/* ノート */
.nbt634{font-size:17px;color:#3F4E9E}
.nbt634s{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:3px;background:rgba(255,255,255,.92);border-radius:14px;padding:5px}
.nbtab634{position:relative;border:2px solid transparent;background:#F6F7FF;border-radius:10px;padding:3px 0 1px;display:flex;flex-direction:column;align-items:center;font:inherit;min-width:0}
.nbtab634 .thi634{width:28px;height:28px}.nbtab634 small{font-size:9px;font-weight:900;color:#5A6080}
.nbtab634.on{border-color:var(--tc);background:color-mix(in srgb,var(--tc) 14%,#fff)}
.nbtab634 .last634{font-size:8px;bottom:-6px;right:-2px}
.nbp634{background:rgba(255,255,255,.95);border-radius:16px;padding:8px;border:3px solid var(--tc)}
.nbh634{display:flex;align-items:center;gap:6px;font-weight:900;color:var(--tc)}.nbh634 b{font-size:15px}.nbh634 span{margin-left:auto;font-size:12px;color:#5A6080}
.nbl634{font-size:11px;font-weight:900;color:#6A74A8;margin:6px 0 3px}
.nbg634{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.mini634{aspect-ratio:3/4;border:2.5px solid var(--tc);background:#fff;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:inherit;padding:0;min-width:0}
.mini634 .ci634{width:80%;height:auto;margin:0}.mini634 small{font-size:9px;color:#8A8A9A;font-weight:800}
.mini634.kira{background:linear-gradient(135deg,#FFF6D0,#E8F4FF,#FFE3F4);box-shadow:0 0 6px rgba(255,190,0,.6)}
.mini634.off{border-style:dashed;border-color:#C9CCE0;background:#F3F4FA;color:#B0B4CC;font-weight:900;font-size:16px}
.nbn634{font-size:11px;color:#6A74A8;font-weight:800;margin:8px 0 0}
/* がっかい */
.gk634{text-align:center}
.gkt634{display:inline-block;background:linear-gradient(90deg,#3F55C4,#7A5CD6);color:#fff;font-weight:900;font-size:16px;border-radius:12px;padding:5px 14px;box-shadow:0 3px 0 #2A3A8E}
.gkb634{margin:8px 0;background:#FFFDF4;border:3px double #C9A55A;border-radius:12px;padding:8px}
.gkm634{display:flex;align-items:center;gap:8px;justify-content:center}.gkm634 .thi634{width:60px;height:60px}.gkm634 div{display:flex;flex-direction:column;text-align:left}.gkm634 small{font-size:10.5px;color:#B5701C;font-weight:900}.gkm634 b{font-size:18px;color:#3F4E9E}.gkm634 span{font-size:12px;font-weight:800}
.gks634{display:flex;gap:4px;justify-content:center;margin-top:6px;flex-wrap:wrap}.gks634 span{background:#EEF1FF;border-radius:10px;padding:3px 8px;font-size:11px;font-weight:800;display:flex;flex-direction:column}.gks634 b{font-size:14px;color:#3F55C4}

#sc631.bgS633 .wrap631.result{min-height:100%;justify-content:flex-end}
#sc631.bgS633 .res631{background:rgba(255,251,242,.96);border-radius:22px;padding:10px 10px 12px;margin-top:calc(10px + env(safe-area-inset-top));box-shadow:0 8px 28px rgba(60,40,10,.3);border:3px solid #fff}
#sc631.bgS633 .res631 .stg631.mini{aspect-ratio:3/.9;margin:-4px 0 -6px}

.pp631{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;max-height:50vh;overflow-y:auto}
.ppb631{border:2px solid #E6D6BB;background:#fff;border-radius:12px;padding:4px 2px;font:inherit;display:flex;flex-direction:column;align-items:center;min-width:0}.ppb631 img{height:46px;width:auto}.ppb631 b{font-size:11px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.ppb631 small{font-size:9.5px;color:#8A6A45}.ppb631.on{border-color:#5A6FD6;background:#EEF1FF}
@media (min-width:600px){ .stg631{aspect-ratio:3/1.3} .op631{font-size:17px} }
`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();


/* =====================================================================
   まなびタウン v6.36：大きな えき（仕様書 v0.1 STEP1〜5）
   えきクイズ（たびクイズ 4コース＋ひみつの えき）・きっぷ・ちず・たびの きろく・ずかん・ランク
   ===================================================================== */
(function(){
'use strict';
const VER = '6.42.0', IMG = './assets/images/v636/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const A = k => X(artSrc(k) || '');
const resBy = id => (save.town?.res || []).find(r => r.id===id);

/* ---------- 駅データ（付録A：59駅）[id, 駅名, よみ, 県, ★, まちがい, 解説, おぼえかた] ---------- */
const STN = [["st001", "秋葉原", "あきはばら", "東京都", 1, ["あきばはら", "あきはら", "しゅうようげん"], "「秋葉」は 火の神さまを まつる 秋葉神社から。むかしは「あきばはら」とも よばれた。", "あき・は・ばら と 3つに 分けて よもう。"], ["st002", "国立", "くにたち", "東京都", 1, ["こくりつ", "くにだち", "こくりゅう"], "国分寺（こくぶんじ）と 立川（たちかわ）の あいだに できたので 1文字ずつ とって「国立」。", "国＋立（たち）かわ ＝ くにたち。"], ["st003", "吉祥寺", "きちじょうじ", "東京都", 1, ["よししょうじ", "きっしょうじ", "きちしょうてら"], "「吉祥」は めでたい という いみ。むかし あった お寺の 名前から。", "「きちじょう」＝ 縁起が いい。"], ["st004", "麻布十番", "あざぶじゅうばん", "東京都", 1, ["まぬのじゅうばん", "あさぬのじゅうばん", "あざぶとおばん"], "「麻布」は 麻（あさ）の ぬのから。「十番」は 工事の 区わりの 番号から。", "あさ ぬの → あざぶ と よむ とくべつな 読み。"], ["st005", "十日市場", "とおかいちば", "神奈川県", 1, ["じゅうにちいちば", "とおかしじょう", "とおひいちば"], "むかし 毎月 10日に 市（いち）が ひらかれた 場所。", "10日は「とおか」。"], ["st006", "白老", "しらおい", "北海道", 1, ["はくろう", "しろおい", "しらろう"], "アイヌ語の「シラウオイ（アブが 多い ところ）」に 漢字を あてた。", "北海道の 駅は アイヌ語が もとの ことが 多いよ。"], ["st007", "御徒町", "おかちまち", "東京都", 2, ["おとちょう", "ごとまち", "みとまち"], "江戸時代、歩いて 将軍の おともを する「御徒（おかち）」の 武士が 住んだ 町。", "徒歩の「徒」は「かち（歩くこと）」。"], ["st008", "日暮里", "にっぽり", "東京都", 2, ["ひぐれさと", "にちぼり", "ひくれり"], "もとは「新堀（にいぼり）」。日が 暮れるのも わすれる 里、という 字を あてた。", "日（にっ）＋ 暮里（ぽり）。"], ["st009", "鶯谷", "うぐいすだに", "東京都", 2, ["おうこく", "うぐいすたに", "おうだに"], "「鶯」は 鳥の ウグイス。ウグイスが たくさん いた 谷から。", "鳥の 名前を 思い出そう。"], ["st010", "市ヶ谷", "いちがや", "東京都", 2, ["いちかたに", "しがや", "いちがたに"], "「ヶ」は「が」と よむ 小さな 字。「谷」を「や」と よむのは 関東に 多い。", "渋谷（しぶや）と 同じ「や」。"], ["st011", "神保町", "じんぼうちょう", "東京都", 2, ["かみほまち", "しんぽちょう", "かみやすちょう"], "江戸時代の 武士「神保（じんぼう）さん」の 屋敷が あった 町。本屋さんの 町で 有名。", "人の 名字が 町の 名前に なった。"], ["st012", "要町", "かなめちょう", "東京都", 2, ["ようまち", "いりちょう", "かなめまち"], "「要（かなめ）」は だいじな ところ という いみ。", "おうぎの「かなめ」と 同じ 読み。"], ["st013", "我孫子", "あびこ", "千葉県", 2, ["がそんし", "わがまごこ", "あそんし"], "むかしの 豪族の 名前に 漢字を あてたと いわれる。大阪にも 我孫子（あびこ）が ある。", "我（あ）孫（び）子（こ）と 1字ずつ。"], ["st014", "蘇我", "そが", "千葉県", 2, ["そうが", "すが", "そわれ"], "むかしの 豪族「蘇我氏」と ゆかりが あると いわれる 地名。", "歴史で ならう「蘇我氏」と 同じ よみ。"], ["st015", "烏丸", "からすま", "京都府", 2, ["うがん", "からすまる", "とりまる"], "「烏（からす）」＋「丸（ま）」。京都の 大きな 通りの 名前。", "「丸」を「ま」と よむのが ポイント。"], ["st016", "太秦", "うずまさ", "京都府", 2, ["たいしん", "ふとはた", "おおはた"], "むかし 秦（はた）氏が 絹を うず高く つんで 天皇に ささげた 話から。", "太（うず）秦（まさ）。映画の 村で 有名。"], ["st017", "香椎", "かしい", "福岡県", 2, ["こうしい", "かおりしい", "こうつい"], "香椎宮（かしいぐう）という 神社が ある 町。", "椎（しい）の 木の 香り。"], ["st018", "牧志", "まきし", "沖縄県", 2, ["ぼくし", "まきこころざし", "もくし"], "那覇の 国際通りの 近く。ゆいレールの 駅。", "牧（まき）＋志（し）。"], ["st019", "尾久", "おぐ", "東京都", 3, ["おく", "びきゅう", "おひさ"], "「おく」と よむ 地名が 多い 中、駅は「おぐ」。にごるのが ポイント。", "駅は「おぐ」、町は「おく」と よむ。"], ["st020", "馬喰町", "ばくろちょう", "東京都", 3, ["うまくいまち", "ばくいちょう", "まぐいちょう"], "「馬喰（ばくろう）」は 馬を 売り買いする 人。その 人たちの 町。", "馬（ば）喰（くろ）。"], ["st021", "雑司が谷", "ぞうしがや", "東京都", 3, ["ざつじがたに", "ざっしがや", "ぞうじがだに"], "むかし 寺の 雑用を する「雑司（ぞうし）」が 住んだ 谷。", "「雑」を「ぞう」と よむ 古い よみかた。"], ["st022", "茗荷谷", "みょうがだに", "東京都", 3, ["めいかや", "みょうかや", "めいにだに"], "むかし ミョウガの 畑が あった 谷。", "食べもの の ミョウガ。"], ["st023", "御成門", "おなりもん", "東京都", 3, ["ごせいもん", "みなりかど", "おなりかど"], "将軍が お寺に「お成り（おでかけ）」する ときに とおった 門。", "「お成り」は えらい人が 来ること。"], ["st024", "立会川", "たちあいがわ", "東京都", 3, ["りっかいがわ", "たちあいかわ", "たてあいがわ"], "川の 名前から。坂本龍馬の 像が ある。", "立（たち）会（あい）川（がわ）。"], ["st025", "鮫洲", "さめず", "東京都", 3, ["こうしゅう", "さめしま", "さめす"], "むかし 海で サメが とれた という 話から。運転免許の 試験場が 有名。", "鮫（さめ）洲（ず）。"], ["st026", "保谷", "ほうや", "東京都", 3, ["ほたに", "ほや", "ほうだに"], "「谷」を「や」と よむ 関東の 地名。", "保（ほう）谷（や）。"], ["st027", "石神井公園", "しゃくじいこうえん", "東京都", 3, ["いしがみいこうえん", "せきじんいこうえん", "いしかみいこうえん"], "石の 神さまを まつる「石神井（しゃくじい）」から。", "「石」を「しゃく」と よむ めずらしい 読み。"], ["st028", "行徳", "ぎょうとく", "千葉県", 3, ["こうとく", "ゆきとく", "いきとく"], "むかし えらい お坊さん「行徳さま」が いたと いわれる 地名。", "行（ぎょう）徳（とく）。"], ["st029", "生麦", "なまむぎ", "神奈川県", 3, ["せいばく", "いきむぎ", "なまばく"], "「生麦事件」で 歴史の 教科書にも 出る 地名。", "早口言葉「なまむぎ なまごめ…」と 同じ。"], ["st030", "弘明寺", "ぐみょうじ", "神奈川県", 3, ["こうみょうじ", "ひろあけじ", "こうめいじ"], "横浜で いちばん 古い お寺「弘明寺」から。", "「弘」を「ぐ」と よむ 仏教の 読み。"], ["st031", "安里", "あさと", "沖縄県", 3, ["やすさと", "あんり", "あざと"], "沖縄の 地名。ゆいレールの 駅。", "安（あ）里（さと）。"], ["st032", "美栄橋", "みえばし", "沖縄県", 3, ["びえいきょう", "うつくさかえばし", "みさかばし"], "那覇の まちなかに ある ゆいレールの 駅。", "美（み）栄（え）橋（ばし）。"], ["st033", "御器所", "ごきそ", "愛知県", 3, ["おきどころ", "ぎょきしょ", "みきしょ"], "むかし 神社の 器（うつわ）を つくった 所から。", "御（ご）器（き）所（そ）。"], ["st034", "十三", "じゅうそう", "大阪府", 3, ["じゅうさん", "とみ", "とおさ"], "淀川の 13番目の 渡し場が あった という 話から。", "「三」を「そう」と よむ。"], ["st035", "長万部", "おしゃまんべ", "北海道", 3, ["ちょうまんぶ", "ながまんべ", "おさまんぶ"], "アイヌ語の「オシャマムペ（カレイが いる ところ）」から。かにめしで 有名。", "北海道の アイヌ語 地名。"], ["st036", "倶知安", "くっちゃん", "北海道", 3, ["ぐちあん", "くちやす", "ともちあん"], "アイヌ語の「クッシャニ（くだの ような 川）」から。スキーで 有名。", "倶（くっ）知（ちゃ）安（ん）。"], ["st037", "厚岸", "あっけし", "北海道", 3, ["こうがん", "あつぎし", "あつきし"], "アイヌ語の「アッケウシ（ニレの 皮を はぐ ところ）」から。カキで 有名。", "厚（あっ）岸（けし）。"], ["st038", "発寒", "はっさむ", "北海道", 3, ["はつかん", "ほっかん", "はっかん"], "アイヌ語の「ハッサム」に 漢字を あてた。札幌の 駅。", "寒（さむ）い を つかった 字。"], ["st039", "分倍河原", "ぶばいがわら", "東京都", 4, ["ぶんばいかわら", "わけばいがわら", "ぶんぺいかわら"], "鎌倉時代の「分倍河原の 戦い」で 有名な 地名。", "分（ぶ）倍（ばい）河原（がわら）。"], ["st040", "千歳烏山", "ちとせからすやま", "東京都", 4, ["せんさいうやま", "ちとせうさん", "せんざいからすやま"], "千歳村と 烏山村の 名前を あわせた 駅名。", "烏（からす）は 黒い 鳥。"], ["st041", "九品仏", "くほんぶつ", "東京都", 4, ["きゅうひんぶつ", "くひんぼとけ", "ここのしなぶつ"], "お寺に 9体の 仏さま（九品仏）が あることから。", "九（く）品（ほん）仏（ぶつ）は 仏教の よみ。"], ["st042", "等々力", "とどろき", "東京都", 4, ["とうとうりき", "などなどちから", "ひとしりき"], "谷の 滝の 音が「とどろく」ように ひびいた ことから。", "「々」は 前の 字を くりかえす しるし。"], ["st043", "溜池山王", "ためいけさんのう", "東京都", 4, ["りゅうちさんおう", "たまりいけさんのう", "ためいけやまおう"], "むかしの「溜池（ためいけ）」と 日枝神社の「山王（さんのう）」から。", "山王は「さんのう」と よむ。"], ["st044", "外川", "とかわ", "千葉県", 4, ["そとがわ", "がいせん", "ほかがわ"], "銚子電鉄の 終点。海の 近くの 漁師町。", "「外」を「と」と よむ。"], ["st045", "八幡宿", "やわたじゅく", "千葉県", 4, ["はちまんやど", "はちまんじゅく", "やはたやど"], "八幡神社の 門前に できた 宿場町。", "八幡は「やわた」とも よむ。"], ["st046", "八丁畷", "はっちょうなわて", "神奈川県", 4, ["はっちょうあぜ", "やつちょうなわて", "はちちょうて"], "8丁（約870m）の まっすぐな あぜ道（畷）が あった ことから。", "「畷（なわて）」は 田んぼの まっすぐな 道。"], ["st047", "追浜", "おっぱま", "神奈川県", 4, ["おいはま", "ついひん", "おいがはま"], "「おいはま」が かわって「おっぱま」に なった。", "追（おっ）浜（ぱま）。"], ["st048", "逸見", "へみ", "神奈川県", 4, ["いつみ", "いっけん", "はやみ"], "むかしの 武士「逸見（へみ）氏」から。", "2文字で「へみ」。とても みじかい！"], ["st049", "四方津", "しおつ", "山梨県", 4, ["よもつ", "しほうづ", "よかたつ"], "まわり（四方）を 山に かこまれた 船着き場（津）。", "四方（しお）津（つ）。"], ["st050", "左沢", "あてらざわ", "山形県", 4, ["ひだりさわ", "さざわ", "ひだりざわ"], "川の 左がわ（あちら側）の 沢、という 意味から と いわれる。", "「左」を「あてら」と よむ とくべつな 読み。"], ["st051", "放出", "はなてん", "大阪府", 4, ["ほうしゅつ", "はなしで", "ほうで"], "むかし 池の 水を「放ち出す」場所 だった ことから。", "放（はな）出（てん）。"], ["st052", "栄生", "さこう", "愛知県", 4, ["えいせい", "さかお", "えいしょう"], "名古屋の 名鉄の 駅。", "栄（さ）生（こう）。"], ["st053", "祖師ヶ谷大蔵", "そしがやおおくら", "東京都", 5, ["そしがたにだいぞう", "そしかやだいぞう", "そしがやたいぞう"], "「祖師谷」と「大蔵」の 2つの 地名を あわせた 駅名。", "ウルトラマンの 町としても 有名。"], ["st054", "音威子府", "おといねっぷ", "北海道", 5, ["おんいしふ", "おといこふ", "ねいしふ"], "アイヌ語の「オトイネプ（にごった 川）」から。", "北海道で いちばん 人口が 少ない 村の 駅。"], ["st055", "小幌", "こぼろ", "北海道", 5, ["しょうこう", "おほろ", "こほろ"], "まわりに 道が なく、電車でしか 行けない「秘境駅」。", "小（こ）幌（ぼろ）。"], ["st056", "喜連瓜破", "きれうりわり", "大阪府", 5, ["きれんかは", "よろこれんうりやぶ", "きれんうりは"], "「喜連」と「瓜破」の 2つの 地名を あわせた 駅名。", "瓜（うり）を 破（わ）る ＝ うりわり。"], ["st057", "雑餉隈", "ざっしょのくま", "福岡県", 5, ["ざつしょうぐう", "ぞうしょうくま", "ざっしょうすみ"], "むかし 旅人に 食べ物（雑餉）を 出した 隈（すみっこ）から と いわれる。", "「の」が かくれている！"], ["st058", "帷子ノ辻", "かたびらのつじ", "京都府", 5, ["いしのつじ", "かたびらのみち", "いのこのつじ"], "「帷子（かたびら）」は うすい 着物。京福電車（らんでん）の 駅。", "ノ が 入っているのが ヒント。"], ["st059", "杁中", "いりなか", "愛知県", 5, ["えぶりなか", "いりちゅう", "かいなか"], "「杁（いり）」は 田んぼに 水を 入れる しかけ。名古屋の 地下鉄の 駅。", "「杁」は 日本で 作られた 漢字。"]];
const SI = id => STN.find(s => s[0]===id);
const prefOf = name => PREF.find(p => p[0]===name);

/* ---------- 調整用パラメータ ---------- */
const CFG = {free:3, buyMax:17, buyPt:30, tripMax:20, pt:{1:2,2:3,3:5,4:8,5:12}, perfect:20, combo3:5, secretP:.15, secretMul:3,
  rank:[{n:'えきいん', d:0, s:0}, {n:'しゃしょう', d:7, s:10}, {n:'うんてんし', d:30, s:30}, {n:'えきちょう', d:60, s:50}, {n:'でんせつの えきちょう', d:100, s:59}]};
const COURSE = [
  {id:'mirai', n:'みらいタウン', pl:1, t:'10:08', c:'#F2A33A', lv:[1,2], mix:['yomi','yomi','soc','math'], rank:0},
  {id:'umi',   n:'うみのまち',   pl:2, t:'10:15', c:'#3DA0E0', lv:[2,3], mix:['yomi','kaki','rail','en'], rank:0},
  {id:'yama',  n:'やまのまち',   pl:3, t:'10:24', c:'#3BAF6A', lv:[3,4], mix:['yomi','yomi','pref','sci'], rank:1},
  {id:'gaku',  n:'がくえんタウン', pl:4, t:'10:37', c:'#E8606A', lv:null, mix:['jp','math','sci','soc'], rank:2}
];

/* ---------- セーブ（save.town.station） ---------- */
function S(){
  const t = save.town || (save.town = {}); const s = t.station || (t.station = {});
  s.tickets = s.tickets || {date:'', free:CFG.free, bought:0, trips:0};
  s.trips = s.trips || {n:0, days:[]}; s.seen = s.seen || {}; s.stamps = s.stamps || {run:0, perfect:0, gold:0, list:[]};
  s.rank = s.rank || 0; s.bestCombo = s.bestCombo || 0; s.streak = s.streak || {n:0, last:''};
  return s;
}
function TK(){ const s = S(), d = dayKey(); if(s.tickets.date !== d){ s.tickets = {date:d, free:CFG.free, bought:0, trips:0, cry:0}; } return s.tickets; }
const ticketsLeft = () => TK().free;
const readOK = id => (S().seen[id]?.ok || 0) > 0;
const nRead = () => STN.filter(x => readOK(x[0])).length;
const tripDays = () => S().trips.days.length;
const userStar = () => { const g = Number(save.settings?.grade56 || 0) || 3; return g <= 2 ? 1 : g <= 4 ? 2 : g <= 6 ? 3 : 4; };
function rankUp(){
  const s = S(), out = [];
  while(s.rank < CFG.rank.length - 1){ const R = CFG.rank[s.rank + 1]; if(tripDays() >= R.d && nRead() >= R.s){ s.rank++; out.push(R.n); } else break; }
  return out;
}
const courseOpen = c => S().rank >= c.rank;

/* ---------- 問題づくり ---------- */
const SOC = [
  ['東海道新幹線は 東京と どこを むすんでいる？','新大阪',['名古屋','博多','仙台'],'東京〜名古屋〜京都〜新大阪を むすぶ、日本で 最初の 新幹線（1964年）。'],
  ['岩手県の 県庁所在地は？','盛岡市',['岩手市','仙台市','青森市'],'岩手県の 県庁所在地は 盛岡市。県の 名前と ちがう ので 注意！'],
  ['愛知県の 県庁所在地は？','名古屋市',['愛知市','豊田市','岡崎市'],'愛知県の 県庁所在地は 名古屋市。'],
  ['北海道新幹線は 本州と 北海道を 何で つないでいる？','青函トンネル',['瀬戸大橋','関門橋','明石海峡大橋'],'海の 下を とおる 青函トンネル（約54km）。'],
  ['九州新幹線の 終点は どこ？','鹿児島中央',['熊本','長崎','宮崎'],'博多〜熊本〜鹿児島中央を むすぶ。'],
  ['日本で いちばん 乗る人が 多い 駅は？','新宿駅',['東京駅','大阪駅','名古屋駅'],'新宿駅は 1日に 数百万人が 使う、世界でも いちばん 大きな 駅。'],
  ['山手線は どんな 形に はしる？','輪（わ）の ように ぐるっと 1周',['まっすぐ 1本','Uの字','8の字'],'東京の まんなかを ぐるっと まわる 環状線。'],
  ['沖縄県を はしる モノレールの 名前は？','ゆいレール',['ゆりかもめ','ポートライナー','ちんちん電車'],'那覇空港から 首里・てだこ浦西まで はしる。'],
  ['「東京駅」の 赤レンガの 駅舎を 設計した 人は？','辰野金吾',['野口英世','福沢諭吉','伊能忠敬'],'1914年に 完成。2012年に もとの 姿に もどされた。'],
  ['「のぞみ」「ひかり」「こだま」が はしるのは？','東海道新幹線',['東北新幹線','上越新幹線','北陸新幹線'],'いちばん はやいのが のぞみ、各駅に とまるのが こだま。']
];
const SCI = [
  ['電車の 屋根の パンタグラフは なにから 電気を もらう？','架線（でんせん）',['レール','空気','太陽'],'屋根の 上の 電線（架線）に パンタグラフを おしあてて 電気を とる。','panta'],
  ['レールの つなぎ目に すきまが あるのは なぜ？','夏に 鉄が のびても まがらないように',['音を 出すため','水を ながすため','軽くするため'],'金属は あたためると のびる。夏の 暑さで のびても ぶつからない ように すきまを あける。','rail'],
  ['電車が ブレーキを かけると、モーターは なにに かわる？','発電機（電気を つくる）',['ヒーター','スピーカー','ポンプ'],'回生ブレーキ：モーターを 回されて 電気を つくり、ほかの 電車に おくる。',''],
  ['リニアモーターカーが うくのに つかう ものは？','磁石の 力',['風の 力','水の 力','ばねの 力'],'つよい 磁石の 力で 車体を うかせて すすむ。',''],
  ['電車の 中で ジャンプしても 同じ ところに おちるのは なぜ？','体も 電車と 同じ はやさで うごいているから',['電車が とまるから','空気が おすから','重力が ないから'],'うごいている ものは、そのまま うごき続けようと する（慣性）。',''],
  ['電気を よく 通すのは どれ？','銅',['ゴム','ガラス','木'],'電線には 電気を 通しやすい 銅が つかわれる。ゴムや ガラスは 通さない。','']
];
const EN = [
  ['Which ____ does the train leave from?（のりば）','platform',['ticket','exit','station'],'platform ＝ のりば・ホーム。'],
  ['きっぷは えいごで？','ticket',['train','gate','map'],'ticket ＝ きっぷ。'],
  ['でぐち は えいごで？','exit',['entrance','stairs','left'],'exit ＝ でぐち、entrance ＝ いりぐち。'],
  ['えき は えいごで？','station',['street','school','stadium'],'station ＝ えき。'],
  ['「つぎは 東京です」 Next stop is ____.','Tokyo',['train','stop','next'],'Next stop is 〜. ＝ つぎは 〜です。'],
  ['かいだん は えいごで？','stairs',['elevator','door','seat'],'stairs ＝ かいだん。'],
  ['のりかえ は えいごで？','transfer',['ticket','return','wait'],'transfer ＝ のりかえ。'],
  ['せき（すわる ところ） は えいごで？','seat',['sheet','set','sit'],'seat ＝ せき。sit は「すわる」。']
];
function mathQ(){
  const k = ri(0, 2);
  if(k===0){ const h = ri(9, 17), m = ri(0, 5)*10 + choice([0,2,5,8]), d = choice([15,25,35,40,50]); const tm = h*60 + m + d, ans = `${Math.floor(tm/60)}:${String(tm%60).padStart(2,'0')}`;
    const f = v => `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`;
    return {kind:'math', html:`<div class="sq636">${h}:${String(m).padStart(2,'0')} に でる でんしゃで ${d}ふん かかるよ。<br>つくのは なんじ なんぷん？</div>`, ans, opts:shuffle([ans, f(tm+10), f(tm-10), f(tm+60)]), ex:`${h}:${String(m).padStart(2,'0')} から ${d}ふん すすめると ${ans}。60ぷんで 1じかん くりあがるよ。`, fig:'clock', lv:2}; }
  if(k===1){ const p = choice([120,140,150,160,170,190,210]), n = ri(2,4), tot = p*n, pay = tot < 500 ? 500 : 1000, ans = pay - tot;
    const o = [...new Set([ans, ans+100, ans+10, ans>=20 ? ans-10 : ans+50])].slice(0,4);
    return {kind:'math', html:`<div class="sq636">${p}円の きっぷを ${n}まい かって、${pay}円 だしたよ。<br>おつりは？</div>`, ans:ans+'円', opts:shuffle(o.map(v => v+'円')),
      ex:`きっぷ代は ${p}×${n}＝${tot}円。おつりは ${pay}−${tot}＝${ans}円。`, lv:2}; }
  const a = ri(1,2), am = ri(1,9)*100, b = ri(2,9)*50, tot = a*1000 + am + b, ans = `${Math.floor(tot/1000)}km${tot%1000}m`;
  return {kind:'math', html:`<div class="sq636">えきから こうえんまで ${a}km${am}m、こうえんから がっこうまで ${b}m。<br>あわせて？</div>`, ans,
    opts:shuffle([ans, `${Math.floor((tot+100)/1000)}km${(tot+100)%1000}m`, `${a}km${am+b-50}m`, `${a+1}km${(am+b)%1000}m`]).filter((v,i,a)=>a.indexOf(v)===i), ex:`m を そろえる：${a*1000+am}m ＋ ${b}m ＝ ${tot}m ＝ ${ans}。`, lv:3};
}
function fixedQ(list, kind){ const it = choice(list); return {kind, html:`<div class="sq636">${X(it[0])}</div>`, ans:it[1], opts:shuffle([it[1], ...it[2]]), ex:it[3], fig:it[4]||'', lv:2}; }
/* 駅の えらびかた：★の めやす 70%／ひとつ上 20%／ひとつ下 10%、まちがえた 駅は 出やすい */
function pickStation(lvRange, used){
  const s = S(), d = dayKey();
  let lv;
  if(lvRange) lv = choice(lvRange);
  else { const u = userStar(), r = Math.random(); lv = Math.max(1, Math.min(5, r < .7 ? u : r < .9 ? u + 1 : u - 1)); }
  let L = STN.filter(x => x[4]===lv && !used.has(x[0]));
  if(!L.length) L = STN.filter(x => Math.abs(x[4]-lv) <= 1 && !used.has(x[0]));
  const w = L.map(x => { const q = s.seen[x[0]] || {}; let v = 1; if(q.ng > (q.ok||0)) v = 3; if(q.last===d) v *= .2; if(!q.ok) v *= 1.5; return v; });
  let r = Math.random() * w.reduce((a,b) => a+b, 0); for(let i=0; i<L.length; i++){ r -= w[i]; if(r <= 0) return L[i]; } return L[0];
}
const kakiAlt = {秋:'穐',葉:'羽',原:'腹',国:'固',立:'竜',吉:'告',祥:'詳',寺:'時',麻:'摩',布:'怖',十:'重',番:'晩',日:'火',市:'志',場:'馬',白:'百',老:'郎',御:'語',徒:'途',町:'待',暮:'墓',里:'理',鶯:'桜',谷:'屋',神:'紳',保:'宝',要:'用',我:'画',孫:'損',子:'小',蘇:'祖',烏:'鳥',丸:'円',太:'大',秦:'泰',香:'高',椎:'推',牧:'枚',志:'士',尾:'美',久:'九',馬:'間',喰:'食',雑:'座',司:'士',茗:'名',荷:'加',成:'生',門:'問',会:'回',川:'河',鮫:'交',洲:'州',石:'岩',井:'居',公:'工',園:'円',行:'業',徳:'得',生:'正',麦:'莫',弘:'広',明:'名',安:'案',美:'見',栄:'英',橋:'端',器:'気',所:'処',三:'山',長:'永',万:'満',部:'辺',倶:'具',知:'千',厚:'暑',岸:'崖',発:'初',寒:'佐',分:'文',倍:'培',河:'川',歳:'才',山:'三',九:'久',品:'本',仏:'物',等:'到',力:'利',溜:'留',池:'地',王:'皇',外:'戸',八:'鉢',幡:'旗',宿:'祝',丁:'町',畷:'縄',追:'押',浜:'濱',逸:'一',見:'海',四:'志',方:'保',津:'塩',左:'阿',沢:'寺',放:'花',出:'天',祖:'素',師:'志',大:'太',蔵:'倉',音:'乙',威:'井',府:'布',小:'古',幌:'保',喜:'切',連:'恋',瓜:'宇',破:'割',餉:'所',隈:'熊',帷:'片',辻:'通',杁:'入',中:'仲'};
function stationQ(st, mode){
  const [id, nm, yo, pf, lv, dm] = st;
  if(mode==='kaki' && lv >= 2){
    const chars = [...nm].map((c,i) => [c,i]).filter(([c]) => kakiAlt[c]); const wrong = new Set();
    for(let t=0; t<20 && wrong.size < 3; t++){ const [c,i] = choice(chars.length ? chars : [[nm[0],0]]); const a = [...nm]; a[i] = kakiAlt[c] || '田'; const w = a.join(''); if(w !== nm) wrong.add(w); }
    if(wrong.size >= 3) return {kind:'kaki', st:id, html:`<div class="sq636">「<b class="yo636">${X(yo)}</b>」の 駅名は どれ？</div>`, ans:nm, opts:shuffle([nm, ...[...wrong].slice(0,3)]), lv};
  }
  if(mode==='pref'){ const p = prefOf(pf); const same = PREF.filter(x => x[2]===p[2] && x!==p); const opts = shuffle([pf, ...shuffle(same).slice(0,1).map(x=>x[0]), ...shuffle(PREF.filter(x => x!==p && x[2]!==p[2])).slice(0,2).map(x=>x[0])]);
    return {kind:'pref', st:id, html:`<div class="sign636"><b>${X(nm)}</b><small>${X(yo)}</small></div><div class="sq636">この 駅が ある 都道府県は？</div>`, ans:pf, opts, lv}; }
  return {kind:'yomi', st:id, html:`<div class="sign636"><b>${X(nm)}</b><small class="fu636">${X(yo)}</small></div><div class="sq636">この 駅名の よみかたは？</div>`, ans:yo, opts:shuffle([yo, ...dm]), lv};
}
function buildTrip(course, secret){
  const used = new Set(), Q = [];
  if(secret){ shuffle(STN.filter(x => x[4]===5)).slice(0,3).forEach(st => { used.add(st[0]); Q.push(stationQ(st, 'yomi')); }); return Q; }
  const mix = shuffle(course.mix.slice());
  mix.forEach(k => {
    if(k==='yomi' || k==='kaki' || k==='pref'){ const st = pickStation(course.lv, used); used.add(st[0]); Q.push(stationQ(st, k)); }
    else if(k==='soc' || k==='rail') Q.push(fixedQ(SOC, 'soc'));
    else if(k==='sci') Q.push(fixedQ(SCI, 'sci'));
    else if(k==='en') Q.push(fixedQ(EN, 'en'));
    else if(k==='math') Q.push(mathQ());
    else if(k==='jp'){ const st = pickStation(null, used); used.add(st[0]); Q.push(stationQ(st, Math.random() < .5 ? 'kaki' : 'yomi')); }
  });
  const last = pickStation(course.lv, used); Q.push(stationQ(last, 'yomi')); Q[Q.length-1].final = 1;
  return Q;
}

/* ---------- 画面 ---------- */
let ROOT = null, KEY = null, busy = false, Hline = '';
function root(){ if(ROOT && document.body.contains(ROOT)) return ROOT; ROOT = document.createElement('div'); ROOT.id = 'stn636'; document.body.appendChild(ROOT); ROOT.addEventListener('click', onClick); return ROOT; }
function close(){ if(!ROOT) return; ROOT.classList.remove('show'); document.body.classList.remove('stn636on'); setTimeout(() => { ROOT?.remove(); ROOT = null; }, 250); try{ persist(); }catch(e){} }
function open(key){ KEY = key; root(); document.body.classList.add('stn636on'); requestAnimationFrame(() => ROOT.classList.add('show')); Hline = ''; main(); if(!(save.guide635||{}).station){ busy = true; setTimeout(() => guideStn().finally(() => { busy = false; main(); }), 450); } }
const HANA = () => artSrc('res_girl'), OTTER = () => artSrc('res_otter');
const ticketDots = () => { const t = TK(), n = Math.max(CFG.free, t.free); return `<span class="tkd636">${Array.from({length:Math.min(n, CFG.free)}, (_, i) => `<i class="${i < t.free ? 'on' : 'used'}"></i>`).join('')}${t.free > CFG.free ? `<b>+${t.free - CFG.free}</b>` : ''}<small>たび ${t.trips}/${CFG.tripMax}</small></span>`; };
function hanaSay(){
  const t = TK(), s = S();
  if(Hline) return Hline;
  if(secretToday()) return 'あれ？ いちばん 下の 行… なにか あるよ…！';
  if(!t.free) return t.bought < CFG.buyMax ? 'きっぷが ないね。らっこさんに ポイントで かえるよ' : 'きょうは おやすみ かな？ また あした でかけよう！';
  if(t.trips >= CFG.tripMax) return 'きょうは たくさん たびを したね！';
  return choice(['いろいろな まちに でかけて みよう！','むずかしい 駅名、よめるかな？','きょうは どこに いく？','ちずが どんどん 色づくよ！']);
}
function secretToday(){ const s = S(), d = dayKey(); if(s.rank < 3) return false;
  if(s.secretDate !== d){ s.secretDate = d; s.secretOn = Math.random() < CFG.secretP ? 1 : 0; s.secretDone = 0; persist(); }
  return s.secretOn && !s.secretDone; }
function main(){
  if(!ROOT) return; const s = S(), t = TK(), sec = secretToday();
  ROOT.innerHTML = `<div class="w636">
    <div class="top636"><div class="sgn636"><span class="tr636"><img src="${A('trn_shinkansen')}" alt=""></span><div><b><ruby>大<rt>おお</rt></ruby>きな<ruby>駅<rt>えき</rt></ruby></b><small>いろいろな ところへ でかけよう！</small></div></div>
      <button type="button" class="x636" data-a="close" aria-label="とじる"><svg viewBox="0 0 16 16"><path d="M3 3L13 13M13 3L3 13" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg></button></div>
    <div class="brd636"><div class="bh636"><span class="clk636"></span>でんしゃの ごあんない<em>${ticketDots()}</em></div>
      ${COURSE.map(c => { const op = courseOpen(c);
        return `<button type="button" class="row636 ${op ? '' : 'lk'}" ${op ? `data-go="${c.id}"` : 'data-a="locked"'} style="--c:${c.c}"><span class="tm">${c.t}</span><b>${op ? c.n : '？？？'}</b><span class="pl">${op ? `のりば ${c.pl}` : `${lockSVG()} ${CFG.rank[c.rank].n}`}</span></button>`; }).join('')}
      ${sec ? `<button type="button" class="row636 gold" data-go="secret"><span class="tm">??:??</span><b>ひみつの えき</b><span class="pl">★5</span></button>` : ''}</div>
    <div class="stg636">
      <div class="bub636" data-a="hana">${X(hanaSay())}</div>
      <button type="button" class="ch636 hana" data-a="hana"><img src="${X(HANA())}" alt=""></button>
      <button type="button" class="ch636 otter" data-a="otter"><img src="${X(OTTER())}" alt=""><i class="tkp636"><img src="${A('itm_ticket')}" alt=""></i></button>
      <button type="button" class="ch636 bird" data-a="bird"><img src="${A('bird_wave')}" alt=""><i class="mpp636"><img src="${A('so_map')}" alt=""></i></button>
    </div>
    <div class="btn636s">
      <button type="button" data-a="go"><img src="${A('trn_local')}" alt=""><b>まちに いく</b></button>
      <button type="button" data-a="ticket"><img src="${A('itm_ticket')}" alt=""><b>きっぷを かう</b></button>
      <button type="button" data-a="map"><img src="${A('so_map')}" alt=""><b>ちずを みる</b></button>
      <button type="button" data-a="rec"><img src="${A('ui_record')}" alt=""><b>たびの きろく</b></button>
    </div>
    <div class="sub636"><span>${rankBadge()} ${CFG.rank[s.rank].n}</span><span>よめた駅 ${nRead()}/${STN.length}</span><button type="button" data-a="grade">⬆ グレードアップ</button><button type="button" data-a="help"><img src="${A('bird_think')}" alt=""> せつめい</button></div>
  </div>`;
}
const lockSVG = () => `<svg class="lk636" viewBox="0 0 20 22"><rect x="2.5" y="9" width="15" height="11.5" rx="3" fill="#F2C14E" stroke="#7A5634" stroke-width="1.6"/><path d="M6 9V6.5a4 4 0 0 1 8 0V9" fill="none" stroke="#7A5634" stroke-width="2"/><circle cx="10" cy="14.5" r="1.7" fill="#7A5634"/></svg>`;
const rankBadge = (r = S().rank) => `<img class="rk636 r${r}" src="${A('mi_medal')}" alt="">`;

async function onClick(e){
  const t = e.target.closest('[data-a],[data-go]'); if(!t || busy) return;
  if(t.dataset.go){ busy = true; try{ await startTrip(t.dataset.go); } finally { busy = false; } return; }
  const a = t.dataset.a;
  if(a==='close') return close();
  if(a==='hana'){ Hline = choice(['駅名には その 土地の むかしの お話が かくれているよ','北海道の 駅は アイヌ語から きた 名前が 多いんだ','「谷」を「や」と よむ 駅、いくつ しってる？','まちがえた 駅は また 出てくるよ。リベンジしよう！']); return main(); }
  if(a==='otter'){ const k = TK(); Hline = ''; toast(`らっこ：「きっぷは あと ${k.free}まい だよ！」`); return; }
  if(a==='bird'){ toast('シマエナガ：「ちずを みてみよう！ よめた 駅の 県に 色が つくよ」'); return; }
  busy = true;
  try{
    if(a==='go') await pickCourse();
    else if(a==='ticket') await ticketView();
    else if(a==='map') mapView();
    else if(a==='rec') recView();
    else if(a==='locked') await dialog(`<h2 class="dlgT">${lockSVG()} まだ いけないよ</h2><p class="dlgP">ランクが 上がると いける まちが ふえるよ。<br>「たびの きろく」で つぎの ランクを みてみよう。</p>`, [{label:'わかった', cls:'gold', v:1}]);
    else if(a==='grade'){ const k = KEY; close(); setTimeout(() => openBuilding(k), 300); }
    else if(a==='help') await guideStn(true);
  } finally { busy = false; }
}
async function pickCourse(){
  const v = await dialog(`<h2 class="dlgT">どこに いく？</h2><div class="pc636">${COURSE.map(c => courseOpen(c) ? `<button type="button" class="btn white big" data-pc="${c.id}" style="border-color:${c.c}">のりば${c.pl}　${c.n}　<small>${c.lv ? '★' + c.lv.join('〜') : '学年に あわせる'}</small></button>` : `<button type="button" class="btn white big" disabled>${lockSVG()} ？？？（${CFG.rank[c.rank].n}で かいほう）</button>`).join('')}</div>`, [{label:'やめる', v:''}], 'wide');
  void v;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pc]'); if(!b) return; e.stopImmediatePropagation(); const id = b.dataset.pc; document.querySelector('#dlg')?.classList.remove('show'); setTimeout(() => { busy = true; startTrip(id).finally(() => { busy = false; }); }, 120); }, true);

/* ---------- きっぷ ---------- */
async function ticketView(){
  const t = TK(), can = !t.free && t.bought < CFG.buyMax && t.trips < CFG.tripMax;
  const v = await dialog(`<div class="dlgArt"><img src="${X(OTTER())}" alt="" style="height:86px"><img src="${A('itm_ticket')}" alt="" style="height:64px"></div><h2 class="dlgT">きっぷうりば</h2>
    <p class="dlgP">きょうの きっぷ ${ticketDots()}<br>のこり <b>${t.free}まい</b>（まいにち ${CFG.free}まい むりょう）</p>
    <p class="dlgP facNote">つかいきったら ${CFG.buyPt}ポイントで かえるよ（1日 ${CFG.buyMax}まいまで）。<br>きょうの たび ${t.trips}/${CFG.tripMax}かい</p>`,
    can ? [{label:`${CFG.buyPt}ポイントで かう`, cls:'gold', v:1}, {label:'とじる', v:0}] : [{label:'とじる', cls:'gold', v:0}], 'wide');
  if(!v) return main();
  if((save.points?.bal||0) < CFG.buyPt){ toast('ポイントが たりないよ'); return main(); }
  addPoints(-CFG.buyPt, 'きっぷを かった', true); t.free++; t.bought++; persist(); sound('ok'); toast('らっこ：「まいど ありがとう！」'); main();
}

/* ---------- たびクイズ ---------- */
let QUIT = null;
async function startTrip(cid){
  const t = TK(), secret = cid==='secret', c = secret ? {id:'secret', n:'ひみつの えき', c:'#D4A017', pl:'？'} : COURSE.find(x => x.id===cid);
  if(!c) return;
  if(!secret && !courseOpen(c)) return;
  if(t.trips >= CFG.tripMax){ await dialog(`<h2 class="dlgT">きょうは おしまい</h2><p class="dlgP">1日の たびは ${CFG.tripMax}かい まで。また あした！</p>`, [{label:'わかった', cls:'gold', v:1}]); return main(); }
  if(!secret && !t.free){ Hline = t.bought < CFG.buyMax ? 'きっぷが ないね。らっこさんに ポイントで かえるよ' : 'きょうは おやすみ かな？'; main(); return ticketView(); }
  if(!secret) t.free--;
  t.trips++; if(secret){ S().secretDone = 1; } persist();
  const Q = buildTrip(c, secret), s = S();
  /* 発車演出 */
  ROOT.innerHTML = `<div class="dep636" data-skip="1" style="--c:${c.c}"><div class="win636"><div class="scn636"></div><img class="trn636" src="${A(secret ? 'trn_steam' : 'trn_express')}" alt=""></div>
    <b>${X(c.n)} ゆき　はっしゃ します！</b><small>らっこ：「きっぷ、おあずかりします！」　（タッチで スキップ）</small></div>`;
  sound('fan');
  await Promise.race([sleep(1800), new Promise(r => ROOT.querySelector('[data-skip]').addEventListener('click', r, {once:true}))]);
  let got = 0, ok = 0, combo = 0, best = 0, quit = false, news = [];
  const ug = userStar();
  for(let i=0; i<Q.length; i++){
    const q = Q[i]; let hinted = false, removed = new Set();
    const route = `<div class="rt636" style="--c:${c.c}">${Q.map((_, k) => `<i class="${k < i ? 'd' : k===i ? 'c' : ''} ${k===Q.length-1 ? 'f' : ''}">${k===Q.length-1 ? '★' : ''}</i>`).join('<b></b>')}<img class="tri636" src="${A('trn_local')}" alt="" style="left:calc(${(i/(Q.length-1))*100}% - 14px)"></div>`;
    const r = await new Promise(res => {
      QUIT = () => res({quit:true});
      const draw = (msg) => {
        ROOT.innerHTML = `<div class="w636 qz636"><div class="qc636">
          <div class="qh636"><span>${secret ? '✨' : ''}${X(c.n)}ゆき　${i+1}/${Q.length}${q.final ? '　しゅうてん！' : ''}</span>${combo >= 2 ? `<b class="cb636">れんぞく ${combo}</b>` : ''}<button type="button" class="qt636" data-q="quit">とちゅうで おりる</button></div>
          ${route}<div class="qb636">${q.html}</div>
          ${msg ? `<div class="hn636"><img src="${A('bird_think')}" alt="">${msg}</div>` : ''}
          <div class="ops636">${q.opts.map(o => `<button type="button" class="op636" data-o="${X(o)}" ${removed.has(o) ? 'disabled' : ''}>${X(o)}</button>`).join('')}</div>
          ${q.st && !hinted ? `<button type="button" class="hb636" data-q="hint"><img src="${X(HANA())}" alt=""> ヒント（ポイント はんぶん）</button>` : ''}
        </div></div>`;
        ROOT.querySelectorAll('.op636').forEach(b => b.onclick = () => { const v = b.dataset.o, good = v===q.ans; b.classList.add(good ? 'ok' : 'ng'); ROOT.querySelectorAll('.op636').forEach(x => x.disabled = true); setTimeout(() => res({ok:good, v}), good ? 650 : 450); sound(good ? 'ok' : 'ng'); if(good){ const f = ROOT.querySelector('.fu636'); if(f) f.classList.add('show'); } });
        const qb = ROOT.querySelector('[data-q="quit"]'); if(qb) qb.onclick = async () => { const v = await dialog('<h2 class="dlgT">とちゅうで おりる？</h2><p class="dlgP">ここまでの ポイントは もらえるよ。<br>（きっぷは もどらないよ）</p>', [{label:'のりつづける', cls:'gold', v:0}, {label:'おりる', cls:'white', v:1}]); if(v) res({quit:true}); };
        const hb = ROOT.querySelector('[data-q="hint"]'); if(hb) hb.onclick = () => { hinted = true; const st = SI(q.st); let m;
          if(q.kind==='pref' || Math.random() < .5){ const wrong = q.opts.filter(o => o!==q.ans); shuffle(wrong).slice(0,2).forEach(o => removed.add(o)); m = 'こたえを 2つに しぼったよ'; }
          else m = `この 駅は <b>${X(st[3])}</b> に あるよ`; draw(m); };
      };
      draw('');
    });
    QUIT = null;
    if(r.quit){ quit = true; break; }
    const st = q.st && SI(q.st);
    if(st){ const sv = s.seen[st[0]] || (s.seen[st[0]] = {ok:0, ng:0, last:''}); sv.last = dayKey(); if(r.ok){ if(!sv.ok) news.push(st); sv.ok++; } else sv.ng++; }
    if(r.ok){
      ok++; combo++; best = Math.max(best, combo);
      let p = CFG.pt[q.lv] || 3; if(q.lv <= ug - 2) p = Math.max(1, Math.round(p*.5)); if(q.lv > ug) p = Math.round(p*1.5);
      if(hinted) p = Math.max(1, Math.round(p/2)); if(secret) p *= CFG.secretMul;
      if(combo > 0 && combo % 3 === 0) p += CFG.combo3;
      got += p;
      await popMsg(r.ok, combo >= 3 && combo % 3 === 0 ? `3れんぞく！ +${p}` : `やったね！ +${p}`);
    } else {
      combo = 0;
      const v = await explain(q, r.v, c);
      if(v==='quit'){ quit = true; break; }
    }
  }
  s.bestCombo = Math.max(s.bestCombo, best);
  /* とうちゃく */
  const done = !quit, perfect = done && ok===Q.length, lines = []; let cry = 0;
  if(done){
    const d = dayKey(); s.trips.n++; if(!s.trips.days.includes(d)) s.trips.days.push(d);
    if(s.streak.last !== d){ const y = new Date(); y.setDate(y.getDate()-1); s.streak.n = s.streak.last === dayKey(y) ? s.streak.n + 1 : 1; s.streak.last = d; }
    const kind = secret ? (ok===Q.length ? 'gold' : 'run') : perfect ? 'perfect' : 'run';
    s.stamps[kind==='gold' ? 'gold' : kind==='perfect' ? 'perfect' : 'run']++; s.stamps.list.push({d, c:c.id, k:kind}); if(s.stamps.list.length > 120) s.stamps.list.shift();
    if(perfect){ got += secret ? CFG.perfect*3 : CFG.perfect; lines.push(`🌟 パーフェクト！ ボーナス +${secret ? CFG.perfect*3 : CFG.perfect}`); }
    const tk = TK(); if(ok >= Math.min(4, Q.length) && !tk.cry){ tk.cry = 1; save.crystal = (save.crystal||0) + 1; cry = 1; lines.push('💎 すいしょう +1（きょうの 水晶は もらったよ）'); }
    else if(tk.cry) lines.push('💎 きょうの 水晶は もう もらったよ');
  }
  if(got) addPoints(got, `大きな えき ${c.n}`, true);
  const ups = rankUp();
  persist();
  ROOT.innerHTML = `<div class="w636 qz636"><div class="qc636 arr636">
    <h2>${quit ? 'とちゅうで おりたよ' : secret && perfect ? '✨ ひみつの えきに とうちゃく！' : 'とうちゃく！'}</h2>
    <div class="arc636">${done ? `<div class="stp636 ${secret && perfect ? 'gold' : perfect ? 'pf' : ''}">${stampSVG(c, secret && perfect ? 'gold' : perfect ? 'pf' : '')}</div>` : ''}
      <img class="ah636" src="${X(HANA())}" alt=""><img class="ao636" src="${X(OTTER())}" alt=""><img class="ab636" src="${A('bird_cheer')}" alt=""></div>
    <p class="sc636">${ok}/${Q.length} せいかい　${best >= 2 ? `さいだい れんぞく ${best}` : ''}</p>
    <div class="tot636">+${got} ポイント</div>
    ${lines.length ? `<ul class="ln636">${lines.map(l => `<li>${X(l)}</li>`).join('')}</ul>` : ''}
    ${news.length ? `<div class="nw636"><b>ずかんに とうろく！</b>${news.map(st => `<span><ruby>${X(st[1])}<rt>${X(st[2])}</rt></ruby></span>`).join('')}</div>` : ''}
    ${ups.map(n => `<div class="up636">${rankBadge(CFG.rank.findIndex(x => x.n===n))} ランクアップ！「${X(n)}」</div>`).join('')}
    <button type="button" class="btn gold" data-a="back">えきに もどる</button></div></div>`;
  if(done){ confetti(perfect ? 2500 : 1200); sound('fan'); }
  if(secret && perfect) setTimeout(() => confetti(3000), 600);
  ROOT.querySelector('[data-a="back"]').onclick = e => { e.stopPropagation(); Hline = done ? 'とうちゃく！ たのしかったね' : ''; main(); };
}
function popMsg(ok, txt){ return new Promise(r => { const p = ROOT.querySelector('.qc636'); if(!p) return r(); p.insertAdjacentHTML('beforeend', `<div class="pop636"><img src="${X(HANA())}" alt=""><b>${X(txt)}</b></div>`); setTimeout(r, 850); }); }
function explain(q, v, c){
  return new Promise(res => {
    const st = q.st && SI(q.st); let body = '';
    if(st){ const p = prefOf(st[3]);
      body = `<div class="ex636"><div class="sign636 big"><b>${X(st[1])}</b><small class="fu636 show">${X(st[2])}</small></div>
        <div class="exr636"><div class="exm636">${p ? jpMapFull(p) : ''}<small>${X(st[3])}</small></div>
        <div class="ext636"><p><b>① 正しい よみ：</b>${X(st[1])}（${X(st[2])}）</p><p><b>② 場所：</b>${X(st[3])}</p><p><b>③ 漢字：</b>${X(st[6])}</p><p class="tip"><b>④ おぼえかた：</b>${X(st[7])}</p></div></div>
        ${v ? `<p class="yv636">きみの こたえ：${X(v)}</p>` : ''}</div>`; }
    else body = `<div class="ex636"><p class="ans636">こたえ：<b>${X(q.ans)}</b></p>${q.fig ? figSVG(q.fig) : ''}<p>${X(q.ex || '')}</p>${v ? `<p class="yv636">きみの こたえ：${X(v)}</p>` : ''}</div>`;
    ROOT.innerHTML = `<div class="w636 qz636"><div class="qc636"><div class="hn636 ng"><img src="${X(HANA())}" alt="">だいじょうぶ、いっしょに みてみよう</div>${body}
      <div class="exb636"><button type="button" class="btn gold" data-x="next">わかった！ つぎへ</button><button type="button" class="btn white" data-x="quit">とちゅうで おりる</button></div></div></div>`;
    ROOT.querySelector('[data-x="next"]').onclick = () => res('next');
    ROOT.querySelector('[data-x="quit"]').onclick = () => res('quit');
  });
}
function figSVG(k){
  if(k==='rail') return `<svg viewBox="0 0 300 90" class="fg636"><text x="10" y="18" font-size="12">ふゆ</text><rect x="40" y="8" width="110" height="14" fill="#9AA4B0"/><rect x="160" y="8" width="110" height="14" fill="#9AA4B0"/><text x="10" y="70" font-size="12">なつ</text><rect x="40" y="58" width="117" height="14" fill="#E07A5F"/><rect x="153" y="58" width="117" height="14" fill="#E07A5F"/><text x="150" y="46" font-size="11" text-anchor="middle" fill="#C0392B">あたたまると のびて すきまが へる</text></svg>`;
  if(k==='panta') return `<svg viewBox="0 0 300 110" class="fg636"><line x1="0" y1="12" x2="300" y2="12" stroke="#555" stroke-width="2"/><text x="230" y="9" font-size="10">架線</text><path d="M110 14 L150 50 L190 14" fill="none" stroke="#333" stroke-width="3"/><rect x="60" y="50" width="180" height="40" rx="8" fill="#5BA3E0"/><text x="150" y="76" font-size="12" fill="#fff" text-anchor="middle">電車</text><text x="200" y="40" font-size="10" fill="#C0392B">パンタグラフ ⚡</text></svg>`;
  if(k==='clock') return '';
  return '';
}
const stampSVG = (c, k) => `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="${k==='gold' ? '#D4A017' : '#D9363E'}" stroke-width="6"/><circle cx="60" cy="60" r="44" fill="none" stroke="${k==='gold' ? '#D4A017' : '#D9363E'}" stroke-width="2"/>
  <rect x="34" y="48" width="52" height="22" rx="6" fill="${k==='gold' ? '#D4A017' : '#D9363E'}"/><circle cx="44" cy="74" r="4" fill="${k==='gold' ? '#D4A017' : '#D9363E'}"/><circle cx="76" cy="74" r="4" fill="${k==='gold' ? '#D4A017' : '#D9363E'}"/>
  <text x="60" y="38" font-size="13" font-weight="900" text-anchor="middle" fill="${k==='gold' ? '#D4A017' : '#D9363E'}">${X(c.n).slice(0,7)}</text><text x="60" y="96" font-size="11" font-weight="900" text-anchor="middle" fill="${k==='gold' ? '#D4A017' : '#D9363E'}">${k==='gold' ? 'ひみつ' : k==='pf' ? 'パーフェクト' : dayKey().slice(5).replace('-','/')}</text></svg>`;

/* ---------- ちず ---------- */
const MV = {x:0, y:0, w:400};
const clampMV = () => { MV.w = Math.max(100, Math.min(400, MV.w)); const h = MV.w*1.1; MV.x = Math.max(0, Math.min(400 - MV.w, MV.x)); MV.y = Math.max(0, Math.min(440 - h, MV.y)); };
function mapDots(){
  const cnt = {}; STN.forEach(x => { if(readOK(x[0])) cnt[x[3]] = (cnt[x[3]]||0) + 1; });
  const col = n => n >= 5 ? '#E8414B' : n >= 2 ? '#FF8A65' : '#FFC1A6', k = Math.max(.32, MV.w/400);
  return PREF.map(p => { const n = cnt[p[0]] || 0, [x,y] = prefXY(p), has = STN.some(st => st[3]===p[0]);
    const r = (n ? 9 : 5) * k, lab = MV.w <= 200 && (has || n) ? `<text x="${x}" y="${y + r + 9*k}" font-size="${(8.5*k).toFixed(2)}" font-weight="900" text-anchor="middle" fill="#3A4A3A" stroke="#fff" stroke-width="${(2.4*k).toFixed(2)}" paint-order="stroke" pointer-events="none">${X(p[0].replace(/[都府県]$/,''))}</text>` : '';
    return `<circle class="pd636" data-pf="${X(p[0])}" cx="${x}" cy="${y}" r="${Math.max(r, 7*k).toFixed(2)}" fill="transparent"/><circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="${n ? col(n) : has ? '#fff' : '#C9D3C4'}" stroke="${n ? '#fff' : '#8AA'}" stroke-width="${(2*k).toFixed(2)}" pointer-events="none"/>${n ? `<text x="${x}" y="${y + 3.5*k}" font-size="${(10*k).toFixed(2)}" font-weight="900" text-anchor="middle" fill="#fff" pointer-events="none">${n}</text>` : ''}${lab}`; }).join('');
}
function mapView(pick){
  const sel = pick && STN.filter(st => st[3]===pick); clampMV();
  ROOT.innerHTML = `<div class="w636 qz636"><div class="qc636 mp636"><div class="qh636"><span><img class="hi636" src="${A('so_map')}" alt=""> ちずを みる</span><button type="button" class="qt636" data-m="back">もどる</button></div>
    <div class="mpw636"><svg class="jpMap" viewBox="${MV.x} ${MV.y} ${MV.w} ${MV.w*1.1}"><g class="base636">${jpBase()}</g><g class="dots636">${mapDots()}</g></svg>
      <div class="zm636"><button type="button" data-z="in">＋</button><button type="button" data-z="out">－</button><button type="button" data-z="all" class="sm">ぜんぶ</button></div></div>
    <div class="lg636"><span><i style="background:#FFC1A6"></i>1</span><span><i style="background:#FF8A65"></i>2〜4</span><span><i style="background:#E8414B"></i>5〜</span><span><i style="background:#fff;border:1.5px solid #8AA"></i>まだ</span></div>
    <div class="hn636"><img src="${A('bird_think')}" alt="">${sel ? `<div><b>${X(pick)}</b>：${sel.filter(st => readOK(st[0])).map(st => `<ruby>${X(st[1])}<rt>${X(st[2])}</rt></ruby>`).join('・') || 'まだ よめた 駅が ないよ'}${sel.some(st => !readOK(st[0])) ? `<small>（まだ ${sel.filter(st => !readOK(st[0])).length}駅 あるよ）</small>` : ''}</div>` : 'ゆび 2本や ＋で ひろげて、まるを タッチすると その 県の 駅が 見られるよ'}</div></div></div>`;
  ROOT.querySelector('[data-m="back"]').onclick = e => { e.stopPropagation(); main(); };
  const svg = ROOT.querySelector('.mpw636 svg'), wrap = ROOT.querySelector('.mpw636');
  const apply = () => { clampMV(); svg.setAttribute('viewBox', `${MV.x} ${MV.y} ${MV.w} ${MV.w*1.1}`); svg.querySelector('.dots636').innerHTML = mapDots(); };
  const zoomAt = (f, fx=.5, fy=.5) => { const cx = MV.x + MV.w*fx, cy = MV.y + MV.w*1.1*fy; MV.w *= f; MV.x = cx - MV.w*fx; MV.y = cy - MV.w*1.1*fy; apply(); };
  ROOT.querySelectorAll('[data-z]').forEach(b => b.onclick = e => { e.stopPropagation(); const z = b.dataset.z; if(z==='all'){ MV.x = 0; MV.y = 0; MV.w = 400; apply(); } else zoomAt(z==='in' ? .6 : 1/.6); });
  /* ゆびで うごかす・2本で ひろげる */
  const pts = new Map(); let moved = 0, last = null, d0 = 0, w0 = 0, wx = 0, wy = 0;
  const rel = (cx, cy) => { const r = svg.getBoundingClientRect(); return [(cx - r.left)/r.width, (cy - r.top)/r.height]; };
  svg.addEventListener('pointerdown', e => { pts.set(e.pointerId, [e.clientX, e.clientY]); svg.setPointerCapture(e.pointerId); moved = 0; last = [e.clientX, e.clientY];
    if(pts.size===2){ const [a, b2] = [...pts.values()]; d0 = Math.hypot(a[0]-b2[0], a[1]-b2[1]); w0 = MV.w; const [fx, fy] = rel((a[0]+b2[0])/2, (a[1]+b2[1])/2); wx = MV.x + fx*MV.w; wy = MV.y + fy*MV.w*1.1; } });
  svg.addEventListener('pointermove', e => { if(!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]); const r = svg.getBoundingClientRect();
    if(pts.size===2){ const [a, b2] = [...pts.values()], d = Math.hypot(a[0]-b2[0], a[1]-b2[1]); if(d0 > 10){ const [fx, fy] = rel((a[0]+b2[0])/2, (a[1]+b2[1])/2); MV.w = Math.max(100, Math.min(400, w0 * d0 / d)); MV.x = wx - fx*MV.w; MV.y = wy - fy*MV.w*1.1; apply(); } moved = 99; return; }
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY]; moved += Math.abs(dx) + Math.abs(dy);
    if(moved > 6 && MV.w < 400){ MV.x -= dx * MV.w / r.width; MV.y -= dy * MV.w / r.width; apply(); } });
  const up = e => { pts.delete(e.pointerId); if(pts.size < 2) d0 = 0; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', e => { e.preventDefault(); const [fx, fy] = rel(e.clientX, e.clientY); zoomAt(e.deltaY < 0 ? .85 : 1/.85, fx, fy); }, {passive:false});
  svg.addEventListener('click', e => { if(moved > 6) return; const c = e.target.closest('[data-pf]'); if(!c) return; e.stopPropagation(); mapView(c.dataset.pf); });
  void wrap;
}
/* ---------- たびの きろく・ずかん ---------- */
function recView(tab='rank'){
  const s = S(), nx = CFG.rank[s.rank + 1];
  const bar = (a, b) => `<span class="br636"><i style="width:${Math.min(100, b ? a/b*100 : 100)}%"></i></span>`;
  let body = '';
  if(tab==='rank') body = `<div class="rkb636">${CFG.rank.map((R, i) => `<div class="${i <= s.rank ? 'got' : ''} ${i===s.rank ? 'now' : ''}">${rankBadge(i)}<b>${R.n}</b><small>${i ? `${R.d}日・${R.s===59 ? '全' : R.s}駅` : 'はじめ'}</small></div>`).join('')}</div>
    ${nx ? `<div class="nxt636"><b>つぎの「${nx.n}」まで</b><p>たびを した日 ${tripDays()}/${nx.d}日 ${bar(tripDays(), nx.d)}</p><p>よめた駅 ${nRead()}/${nx.s}駅 ${bar(nRead(), nx.s)}</p></div>` : '<div class="nxt636"><b>さいこうの ランク！</b></div>'}
    <div class="sts636"><span>たびの かいすう<b>${s.trips.n}</b></span><span>れんぞく<b>${s.streak.n}日</b></span><span>さいこう れんぞく正解<b>${s.bestCombo}</b></span></div>`;
  if(tab==='stamp') body = `<div class="sts636"><span>かんそう<b>${s.stamps.run}</b></span><span>パーフェクト<b>${s.stamps.perfect}</b></span><span>きんいろ<b>${s.stamps.gold}</b></span></div>
    <div class="stl636">${s.stamps.list.slice().reverse().slice(0,24).map(x => { const c = COURSE.find(y => y.id===x.c) || {n:'ひみつの えき'}; return `<div class="${x.k}">${stampSVG(c, x.k==='gold' ? 'gold' : x.k==='perfect' ? 'pf' : '')}</div>`; }).join('') || '<p class="dlgP">まだ スタンプが ないよ。たびに でかけよう！</p>'}</div>`;
  if(tab==='zukan') body = `<p class="zk636h">よめた駅 ${nRead()}/${STN.length}　✿＝にがて</p><div class="zk636">${STN.map(st => { const q = s.seen[st[0]] || {}, okk = q.ok > 0, weak = q.ng > (q.ok||0);
    return `<div class="${okk ? 'ok' : ''}">${okk ? `<ruby>${X(st[1])}<rt>${X(st[2])}</rt></ruby><small>${X(st[3])}　${'★'.repeat(st[4])}</small>` : `<b>？？？</b><small>${X(st[3])}　${'★'.repeat(st[4])}</small>`}${weak ? '<i>✿</i>' : ''}</div>`; }).join('')}</div>`;
  ROOT.innerHTML = `<div class="w636 qz636"><div class="qc636 rc636"><div class="qh636"><span><img class="hi636" src="${A('ui_record')}" alt=""> たびの きろく</span><button type="button" class="qt636" data-r="back">もどる</button></div>
    <div class="tb636">${[['rank','ランク'],['stamp','スタンプ帳'],['zukan','駅名ずかん']].map(([k,n]) => `<button type="button" class="${tab===k ? 'on' : ''}" data-r="${k}">${n}</button>`).join('')}</div>${body}</div></div>`;
  ROOT.querySelectorAll('[data-r]').forEach(b => b.onclick = e => { e.stopPropagation(); b.dataset.r==='back' ? main() : recView(b.dataset.r); });
}
/* ---------- シマくんの せつめい ---------- */
async function guideStn(force){
  const g = save.guide635 || (save.guide635 = {}); if(g.station && !force) return; g.station = 1; persist();
  const P = [['bird_wave','ようこそ「大きな えき」へ！','電車に のって いろいろな まちへ おでかけ！<br>とちゅうの 駅で <b>クイズ</b>が 出るよ。'],
    ['bird_think','むずかしい 駅名に ちょうせん','「御徒町」「日暮里」… 日本には よみにくい 駅名が いっぱい！<br>まちがえても、ちずと 漢字の おはなしで おしえるよ。'],
    ['bird_thumb','きっぷと ごほうび','きっぷは まいにち <b>3まい</b>。5もん とくと とうちゃく！<br>ポイント・すいしょう・スタンプが もらえるよ。'],
    ['bird_cheer','めざせ えきちょう！','たびを した日と よめた駅が ふえると ランクアップ。<br>あたらしい まちに 行けるように なるよ。えきちょうに なると…？']];
  for(let i=0; i<P.length; i++){ const [art, t, b] = P[i], last = i===P.length-1;
    const v = await dialog(`<div class="gd635"><div class="gdb635"><img src="${A(art)}" alt=""></div><div class="gdt635"><b>シマくん</b><h3>${t}</h3><p>${b}</p></div></div><div class="gdd635">${P.map((_, k) => `<i class="${k===i ? 'on' : ''}"></i>`).join('')}</div>`,
      last ? [{label:'わかった！', cls:'gold', v:1}] : [{label:'つぎへ ▶', cls:'gold', v:1}, {label:'スキップ', cls:'white', v:0}], 'wide gdw635');
    if(!v) break; }
}

/* ---------- まちの「大きな えき」を タッチ ---------- */
let swap = null;
const restore = () => { if(swap && save.town && save.town.cells[swap.k]==='__stn636') save.town.cells[swap.k] = swap.id; swap = null; };
window.addEventListener('pointerup', e => {
  if(typeof curScreen==='undefined' || curScreen!=='town' || townEdit || !save.town) return;
  if(e.target.closest('#townMap .walker,.car2')) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const k = `${c.dataset.x},${c.dataset.y}`; if(save.town.cells[k] !== 'bigstation') return;
  restore(); swap = {k, id:'bigstation'}; save.town.cells[k] = '__stn636'; setTimeout(restore, 600);
}, true);
window.addEventListener('click', e => {
  if(!swap) return; const c = e.target.closest && e.target.closest('#townMap .cell'); const s = swap; restore();
  if(!c || `${c.dataset.x},${c.dataset.y}` !== s.k) return;
  e.stopImmediatePropagation(); e.preventDefault(); open(s.k);
}, true);
const _show636 = show; show = function(){ if(ROOT) close(); return _show636.apply(this, arguments); };
window.__stn636 = {open, close, S, STN, buildTrip, COURSE, CFG};

const css = document.createElement('style');
css.textContent = `
#stn636{position:fixed;inset:0;z-index:66;background:#F3EFE4;overflow-y:auto;overflow-x:hidden;opacity:0;transition:opacity .22s;overscroll-behavior:contain}
#stn636.show{opacity:1}
#stn636::before{content:"";position:fixed;inset:0;background:url(${IMG}bg_bigstation.webp) center top/cover no-repeat;z-index:0}
#stn636>*{position:relative;z-index:1}
body.stn636on{overflow:hidden}
.w636{max-width:520px;margin:0 auto;min-height:100%;display:flex;flex-direction:column;gap:6px;padding:calc(6px + env(safe-area-inset-top)) 8px calc(10px + env(safe-area-inset-bottom))}
.top636{display:flex;align-items:flex-start;gap:6px}
.sgn636{flex:1;display:flex;align-items:center;gap:8px;background:linear-gradient(180deg,#FFF8E8,#F6E5C2);border:3px solid #8A5A2B;border-radius:14px;padding:4px 10px;box-shadow:0 3px 0 #6B4220}
.sgn636 .tr636 img{height:30px;width:auto;display:block}
.sgn636 b{display:block;font-size:22px;color:#6B3A12;line-height:1.3}.sgn636 rt{font-size:9px}.sgn636 small{font-size:10.5px;font-weight:800;color:#8A5A2B}
.x636{flex:none;width:40px;height:40px;border-radius:50%;border:3px solid #fff;background:#E8606A;padding:0;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #B5434C;line-height:0}.x636 svg{width:16px;height:16px;display:block}
.brd636{background:#1E2430;border:4px solid #4A5160;border-radius:12px;padding:5px 6px 6px;box-shadow:0 4px 10px rgba(0,0,0,.25)}
.bh636{display:flex;align-items:center;gap:6px;color:#fff;font-weight:900;font-size:13px;padding:0 2px 4px;border-bottom:1px dashed #4A5160;margin-bottom:3px}
.bh636 em{margin-left:auto;font-style:normal}
.clk636{width:16px;height:16px;border-radius:50%;background:#fff;position:relative}.clk636::after{content:"";position:absolute;left:7px;top:3px;width:2px;height:6px;background:#333;box-shadow:2px 4px 0 -0px #333}
.tkd636{display:inline-flex;align-items:center;gap:3px}.tkd636 b{color:#FFC94D;font-size:12px}.tkd636 small{color:#ccc;font-size:10.5px;margin-left:4px;font-weight:800}.tkd636 i{width:10px;height:10px;border-radius:50%;border:2px solid #FFC94D}.tkd636 i.on{background:#FFC94D}.tkd636 i.used{border-color:#666}
.row636{display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:6px;width:100%;border:none;background:none;padding:4px 2px;font:inherit;font-family:ui-monospace,monospace;border-bottom:1px solid #2E3542;text-align:left}
.row636 .tm{color:#FFD24A;font-weight:900;font-size:15px}.row636 b{color:var(--c);font-size:15px;font-family:'Zen Maru Gothic',sans-serif;filter:brightness(1.35)}.row636 .pl{color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;gap:3px;font-family:'Zen Maru Gothic',sans-serif}
.row636.lk b,.row636.lk .tm{color:#777!important;filter:none}.row636.lk .pl{color:#999}
.row636.gold{background:linear-gradient(90deg,rgba(255,210,74,.25),rgba(255,210,74,.05));animation:gl636 1.2s ease-in-out infinite alternate}.row636.gold b,.row636.gold .tm{color:#FFD24A;filter:none}
@keyframes gl636{to{background:rgba(255,210,74,.4)}}
.lk636{width:14px;height:15px}
.stg636{position:relative;flex:1;min-height:215px}
.bub636{position:absolute;left:4%;top:4px;max-width:60%;background:#fff;border:3px solid #F2A33A;border-radius:16px;padding:6px 10px;font-weight:900;font-size:13px;color:#6B4A2A;line-height:1.45;box-shadow:0 3px 0 rgba(0,0,0,.1);cursor:pointer}
.bub636::after{content:"";position:absolute;left:24px;bottom:-14px;border:8px solid transparent;border-top:10px solid #F2A33A}
.ch636{position:absolute;bottom:0;border:none;background:none;padding:0;cursor:pointer}
.ch636 img{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 3px rgba(0,0,0,.2))}
.ch636.hana{left:2%;width:33%;animation:sway631 2.4s ease-in-out infinite alternate}
.ch636.otter{left:36%;width:29%;animation:sway631 2.8s ease-in-out infinite alternate-reverse}
.ch636.bird{right:2%;width:26%;animation:sway631 2.2s ease-in-out infinite alternate}
.tkp636,.mpp636{position:absolute;font-style:normal;width:40%;right:-6%;bottom:12%}.mpp636{left:-10%;right:auto}
.btn636s{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
.btn636s button{border:3px solid #fff;background:linear-gradient(180deg,#FFFDF5,#F3E7CF);border-radius:16px;padding:4px 2px 5px;font:inherit;display:flex;flex-direction:column;align-items:center;gap:1px;box-shadow:0 4px 0 #CDB48C;min-width:0}
.btn636s img{height:44px;width:auto;max-width:100%;object-fit:contain}
.btn636s b{font-size:11.5px;color:#6B4A2A;white-space:nowrap}
.sub636{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;font-size:11px;font-weight:800;color:#6B4A2A}
.sub636 span,.sub636 button{background:rgba(255,255,255,.9);border:none;border-radius:99px;padding:3px 9px;font:inherit;display:inline-flex;align-items:center;gap:3px}
.sub636 button img{width:18px;height:18px}
.rk636{width:20px;height:20px;object-fit:contain;vertical-align:middle}
.rk636.r0{filter:sepia(1) saturate(1.6) hue-rotate(-15deg) brightness(.85)}.rk636.r1{filter:grayscale(1) brightness(1.25)}.rk636.r2{filter:saturate(1.3)}.rk636.r3{filter:hue-rotate(160deg) saturate(1.4)}.rk636.r4{filter:hue-rotate(260deg) saturate(1.6) drop-shadow(0 0 3px #FFD24A)}
/* 発車 */
.dep636{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(30,36,48,.8);color:#fff;text-align:center;padding:20px}
.dep636 b{font-size:18px}.dep636 small{font-size:12px;opacity:.85}
.win636{position:relative;width:min(88vw,420px);aspect-ratio:2/1;border:8px solid #DDE3EA;border-radius:22px;overflow:hidden;background:linear-gradient(#9FD6FF,#E6F5FF)}
.scn636{position:absolute;inset:0;background:repeating-linear-gradient(90deg,#7CC47A 0 40px,#5DAE5B 40px 70px,#9AD08F 70px 120px);top:55%;animation:scn636 .6s linear infinite}
.scn636::before{content:"";position:absolute;left:0;right:0;top:-40px;height:40px;background:repeating-linear-gradient(90deg,transparent 0 60px,#BFD8E8 60px 90px,transparent 90px 150px);animation:scn636 1.4s linear infinite}
@keyframes scn636{from{background-position:0 0}to{background-position:-240px 0}}
.trn636{position:absolute;left:50%;bottom:6%;height:42%;transform:translateX(-50%);animation:hop631 .25s ease-in-out infinite alternate}
/* もんだい */
.qz636{justify-content:center}
.qc636{position:relative;background:rgba(255,252,244,.97);border-radius:22px;padding:10px;box-shadow:0 8px 28px rgba(30,30,50,.35);border:3px solid #fff;display:flex;flex-direction:column;gap:7px}
.qh636{display:flex;align-items:center;gap:6px;font-weight:900;font-size:13px;color:#6B4A2A}
.qt636{margin-left:auto;border:none;background:#fff;border-radius:99px;padding:4px 10px;font:inherit;font-size:11.5px;font-weight:900;color:#8A6A45;box-shadow:0 2px 0 #E6D6BB;white-space:nowrap}
.cb636{background:#FF7A45;color:#fff;border-radius:99px;padding:0 8px;font-size:11px}
.rt636{position:relative;display:flex;align-items:center;padding:12px 14px 4px}
.rt636 i{flex:none;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #C9C2B4;font-style:normal;font-size:10px;line-height:10px;text-align:center;color:#C9A000}
.rt636 i.d{background:var(--c);border-color:var(--c)}.rt636 i.c{border-color:var(--c);box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 30%,transparent)}.rt636 i.f{width:20px;height:20px;line-height:14px;font-size:13px}
.rt636 b{flex:1;height:4px;background:#C9C2B4}
.tri636{position:absolute;top:-6px;height:22px;width:auto;transition:left .6s;margin-left:14px}
.qb636{background:#fff;border-radius:16px;padding:10px;box-shadow:0 2px 0 #EADCC4;text-align:center}
.sign636{display:inline-flex;flex-direction:column;align-items:center;min-width:70%;background:#fff;border:3px solid #2F6FA3;border-radius:10px;padding:6px 14px 4px;box-shadow:0 4px 0 #2F6FA3;margin:2px auto 8px;position:relative}
.sign636::after{content:"";position:absolute;left:0;right:0;bottom:0;height:7px;background:#2F6FA3;border-radius:0 0 6px 6px}
.sign636 b{font-size:34px;letter-spacing:4px;color:#1D2A36;line-height:1.2}
.sign636 small{font-size:14px;font-weight:800;color:#2F6FA3;margin-bottom:8px;min-height:1.2em}
.sign636 .fu636{opacity:0;transform:translateY(6px);transition:all .5s}.sign636 .fu636.show{opacity:1;transform:none}
.sign636.big b{font-size:30px}
.sq636{font-size:15.5px;font-weight:800;color:#4A3A2A;line-height:1.6}.yo636{font-size:20px;color:#2F6FA3}
.ops636{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.op636{border:2.5px solid #D6C9B0;background:#fff;border-radius:14px;padding:11px 4px;font:inherit;font-weight:900;font-size:16px;color:#3A2E22;min-height:52px;box-shadow:0 3px 0 #D6C9B0;word-break:break-all}
.op636:disabled{opacity:.45}.op636.ok{background:#E3F7E8;border-color:#3BAF6A;opacity:1}.op636.ng{background:#FFE7E7;border-color:#E8414B;opacity:1}
.hb636{align-self:center;display:inline-flex;align-items:center;gap:4px;border:none;background:#FFF3D2;border-radius:99px;padding:3px 12px 3px 3px;font:inherit;font-size:12px;font-weight:900;color:#B5701C}
.hb636 img{width:30px;height:30px;object-fit:contain;border-radius:50%;background:#fff}
.hn636{display:flex;align-items:center;gap:6px;background:#FFFBE0;border:2px dashed #F2C94C;border-radius:12px;padding:5px 8px;font-size:13px;font-weight:800;color:#8A5A00}
.hn636.ng{background:#EEF6FF;border-color:#8AB4E0;color:#2F5A86}
.hn636 img{width:40px;height:40px;object-fit:contain;flex:none}
.pop636{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);background:#fff;border:3px solid #FFC94D;border-radius:18px;padding:8px 14px;display:flex;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,.2);animation:pop631 .3s}
.pop636 img{height:56px}.pop636 b{font-size:16px;color:#D2601E;white-space:nowrap}
.ex636{text-align:left}.ex636 .sign636{display:flex;margin:0 auto 6px;width:max-content}
.exr636{display:flex;gap:8px;align-items:flex-start}
.exm636{flex:none;width:42%;text-align:center}.exm636 svg{width:100%;height:auto}.exm636 small{font-weight:900;color:#C0392B}
.ext636{flex:1;min-width:0;font-size:13px;line-height:1.55}.ext636 p{margin:0 0 4px}.ext636 .tip{background:#EFFAEA;border-radius:8px;padding:3px 6px;color:#2E7D32}
.yv636{font-size:12px;color:#B23;margin:4px 0 0}.ans636{font-size:16px}
.fg636{width:100%;max-width:300px;display:block;margin:4px auto}
.exb636{display:flex;flex-direction:column;gap:6px}.exb636 .btn{width:100%}
/* とうちゃく */
.arr636{text-align:center}.arr636 h2{margin:2px 0;color:#2F6FA3;font-size:22px}
.arc636{position:relative;height:130px}
.arc636 .ah636{position:absolute;left:0;bottom:0;height:120px;animation:hop631 .5s ease-in-out infinite alternate}
.arc636 .ao636{position:absolute;right:22%;bottom:0;height:100px;animation:hop631 .45s ease-in-out infinite alternate-reverse}
.arc636 .ab636{position:absolute;right:0;bottom:0;height:80px;animation:hop631 .55s ease-in-out infinite alternate}
.stp636{position:absolute;left:50%;top:0;width:110px;transform:translateX(-50%) rotate(-10deg);animation:stamp636 .5s cubic-bezier(.3,1.6,.6,1) .3s both}
.stp636 svg{width:100%;height:auto}
@keyframes stamp636{from{transform:translateX(-50%) scale(2.2) rotate(-25deg);opacity:0}to{transform:translateX(-50%) scale(1) rotate(-10deg);opacity:1}}
.sc636{margin:0;font-weight:900;color:#6B4A2A}.tot636{font-size:24px;font-weight:900;color:#D2601E}
.ln636{list-style:none;margin:0;padding:6px 8px;background:#FFF8EA;border-radius:12px;text-align:left;font-size:12.5px;font-weight:800}
.nw636{background:#EEF6FF;border-radius:12px;padding:6px;font-size:13px}.nw636 b{display:block;color:#2F6FA3}.nw636 span{display:inline-block;margin:4px 6px 0;font-size:16px;font-weight:900}.nw636 rt{font-size:9px}
.up636{background:linear-gradient(90deg,#FFE08A,#FFF3C4);border-radius:12px;padding:6px;font-weight:900;color:#8A5A00;animation:pop2 .5s}
.up636 .rk636{width:28px;height:28px}
/* ちず・きろく */
.mpw636{position:relative;background:#CFEBFF;border-radius:14px;overflow:hidden;touch-action:none}.mpw636 svg{touch-action:none}.mpw636 .base636 *{vector-effect:non-scaling-stroke}
.zm636{position:absolute;right:6px;top:6px;display:flex;flex-direction:column;gap:5px}.zm636 button{width:38px;height:38px;border-radius:50%;border:2.5px solid #fff;background:#2F6FA3;color:#fff;font:inherit;font-size:22px;font-weight:900;line-height:1;padding:0;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.25)}.zm636 button.sm{font-size:10px;background:#5A8FBF}.mpw636 svg{width:100%;height:auto;display:block}
.pd636{cursor:pointer}
.lg636{display:flex;justify-content:center;gap:8px;font-size:11px;font-weight:800}.lg636 i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:2px;vertical-align:middle}
.hn636 rt{font-size:8px}
.hi636{width:24px;height:24px;vertical-align:middle}
.tb636{display:flex;gap:4px}.tb636 button{flex:1;border:2px solid #E6D6BB;background:#fff;border-radius:10px;padding:5px;font:inherit;font-weight:900;font-size:12.5px;color:#7A5634}.tb636 button.on{background:#2F6FA3;color:#fff;border-color:#2F6FA3}
.rkb636{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px}
.rkb636>div{background:#F3F0E8;border-radius:10px;padding:4px 1px;text-align:center;opacity:.55;display:flex;flex-direction:column;align-items:center}
.rkb636>div.got{opacity:1;background:#FFF6DA}.rkb636>div.now{outline:3px solid #F2A33A}
.rkb636 .rk636{width:34px;height:34px}.rkb636 b{font-size:10px;line-height:1.2;color:#6B4A2A}.rkb636 small{font-size:9px;color:#8A6A45}
.nxt636{background:#fff;border-radius:12px;padding:6px 10px;font-size:12.5px;font-weight:800;color:#6B4A2A}.nxt636 p{margin:4px 0 0}
.br636{display:block;height:8px;border-radius:99px;background:#EFE5D3;overflow:hidden;margin-top:2px}.br636 i{display:block;height:100%;background:linear-gradient(90deg,#8FD0F7,#2F6FA3)}
.sts636{display:flex;gap:4px}.sts636 span{flex:1;background:#EEF6FF;border-radius:10px;padding:4px;text-align:center;font-size:10.5px;font-weight:800;display:flex;flex-direction:column}.sts636 b{font-size:16px;color:#2F6FA3}
.stl636{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.stl636>div{background:#fff;border-radius:10px;padding:3px}.stl636 svg{width:100%;height:auto;display:block}
.zk636h{margin:0;font-size:12px;font-weight:800;color:#6B4A2A}
.zk636{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;max-height:52vh;overflow-y:auto}
.zk636>div{position:relative;background:#F3F0E8;border-radius:10px;padding:4px;text-align:center;font-weight:900;font-size:14px;color:#999}
.zk636>div.ok{background:#fff;color:#1D2A36;border:2px solid #2F6FA3}.zk636 rt{font-size:8.5px;color:#2F6FA3}.zk636 small{display:block;font-size:9px;color:#8A6A45;font-weight:800}
.zk636 i{position:absolute;right:3px;top:1px;font-style:normal;color:#E8606A;font-size:13px}
.pc636{display:flex;flex-direction:column;gap:6px}.pc636 .btn{border-left:8px solid}
@media (max-height:640px){ .stg636{min-height:170px} .btn636s img{height:36px} }
`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

(function(){ const st = document.createElement('style'); st.textContent = `
/* v6.42 カフェ メニュー：スマホでも 3れつ */
@media(max-width:520px){ .cafeMenus48{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px!important}
  .cafeMenus48 button{padding:4px 2px!important;border-radius:11px!important;min-width:0}
  .cafeMenus48 img{width:54px!important;height:46px!important}
  .cafeMenus48 b{font-size:10.5px!important;line-height:1.2;word-break:keep-all;overflow-wrap:anywhere}
  .cafeMenus48 small{font-size:8.5px!important}
  .cafeMenus48 .sat54{font-size:8px!important;padding:0 3px!important}
  .cafeMenus48 .reqs48{gap:2px!important;flex-wrap:wrap;justify-content:center}
  .cafeMenus48 .reqs48 i{font-size:9px!important}.cafeMenus48 .reqs48 img{width:16px!important;height:16px!important} }
@media(min-width:600px){ .cafeMenus48{grid-template-columns:repeat(4,minmax(0,1fr))!important} }
.fsh642{font-style:normal;font-size:.9em;margin-right:1px}
.fUse642{background:#E6F4FF;border-radius:10px;padding:4px 8px;font-weight:800;color:#2F6FA3}.fUse642.s{background:#FFF5DE;color:#8A5A12}
.ik642t{display:flex;align-items:center;justify-content:center;gap:6px}.ik642t img{height:auto}
.ik642h{font-weight:900;color:#6B4A2A;margin:8px 0 4px;font-size:13px}.ik642h small{font-size:10.5px;color:#8A6A45;margin-left:4px}
.ik642{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;max-height:38vh;overflow-y:auto}
.ik642>div{background:#F3F9FF;border:2px solid #CFE4F5;border-radius:12px;padding:4px 2px;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}
.ik642 b{font-size:11px;white-space:nowrap}.ik642 small{font-size:9.5px;color:#6A7A8A}.ik642 .btn{padding:3px 6px!important;font-size:10.5px!important;margin-top:2px}
.ik642.u>div{background:#FFF8EA;border-color:#F1DDB5}
`; document.head.appendChild(st); })();

/* =====================================================================
   まなびタウン v6.43：BGM（assets/audio/BGM.mp3）
   ・ふだんは ひかえめな 音量で ループ
   ・問題を とく とき・野球・運動会・つり などは 音量を さげる
   ・ものがたり／運動会の 音楽が ながれている ときは とめる
   ・上の バーと せっていで オン／オフ（save.settings.bgm）
   ===================================================================== */
(function(){
'use strict';
const VER = '6.43.0', SRC = './assets/audio/BGM.mp3';
const VOL = {base:.22, low:.07, quiet:.12, off:0};      // あまり 目立たない 音量
const B = {el:null, ctx:null, gain:null, ok:false, cur:-1, err:false};
const on = () => save.settings && save.settings.bgm !== false;

function init(){
  if(B.el || B.err) return;
  const a = new Audio(); a.src = SRC; a.loop = true; a.preload = 'auto'; a.setAttribute('playsinline', '');
  a.addEventListener('error', () => { B.err = true; console.warn('BGM: ' + SRC + ' が よみこめません'); });
  B.el = a;
  try{
    B.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const s = B.ctx.createMediaElementSource(a); B.gain = B.ctx.createGain(); B.gain.gain.value = 0;
    s.connect(B.gain).connect(B.ctx.destination);      // iPhone は audio.volume が きかないので GainNode で 音量を かえる
  }catch(e){ B.ctx = null; a.volume = 0; }
}
/* いま どの くらいの 音量に するか */
function target(){
  if(!on() || document.hidden) return VOL.off;
  const b = document.body, q = s => document.querySelector(s);
  try{ if(typeof SM!=='undefined' && SM.timer) return VOL.off; }catch(e){}
  try{ if(typeof UDM!=='undefined' && UDM.timer) return VOL.off; }catch(e){}
  if(q('#story.show')) return VOL.off;
  if(b.classList.contains('scr-quiz') || b.classList.contains('scr-mathplay') || b.classList.contains('scr-engplay') || b.classList.contains('scr-ud')) return VOL.low;
  if(q('#dlg.show .mqHead') || q('#dlg.show .dlgCard.quiz')) return VOL.low;                // まちの いろいろな 問題
  if(q('#sc631 .qz631') || q('#sc631 .exw631')) return VOL.low;                              // がっこう・だいがくの じゅぎょう／けんきゅう
  if(q('#stn636 .qb636') || q('#stn636 .ex636') || q('#stn636 .dep636')) return VOL.low;    // 大きな えきの たびクイズ
  if(q('#bb618')) return VOL.low;                                                              // 野球
  if(q('#fish614')) return VOL.quiet;                                                          // つり
  if(q('.tour') && q('.tour.show')) return VOL.quiet;
  return VOL.base;
}
function apply(force){
  if(!B.el){ if(!on()) return paint(); init(); }
  if(B.err) return paint();
  const v = target();
  if(v > 0){
    if(B.ctx && B.ctx.state === 'suspended') B.ctx.resume().catch(() => {});
    if(B.el.paused && B.ok) B.el.play().catch(() => {});
  }
  if(v !== B.cur || force){
    B.cur = v;
    if(B.gain){ const g = B.gain.gain, t = B.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(v, t, v > g.value ? .6 : .25); }
    else B.el.volume = v;
    clearTimeout(B.pt);
    if(v === 0) B.pt = setTimeout(() => { if(B.cur === 0 && B.el && !B.el.paused) B.el.pause(); }, 1500);
  }
  paint();
}
/* さいしょに タッチした ときに 再生（ブラウザの きまり） */
function unlock(){
  if(B.ok) return; init(); if(B.err) return;
  B.ok = true;
  if(B.ctx && B.ctx.state === 'suspended') B.ctx.resume().catch(() => {});
  if(on()) B.el.play().catch(() => { B.ok = false; });
  apply(true);
}
['pointerdown','touchend','keydown'].forEach(n => document.addEventListener(n, unlock, {capture:true, passive:true}));
document.addEventListener('visibilitychange', () => apply());
setInterval(() => { if(B.ok || !on()) apply(); }, 400);

/* ---------- オン／オフ ---------- */
const ICON = o => `<svg viewBox="0 0 32 32" class="bgmI643"><path d="M12 22.5V8.5l12-3v13" fill="none" stroke="${o ? '#E07A3F' : '#A89A88'}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="9" cy="22.5" rx="3.6" ry="2.9" fill="${o ? '#F2A33A' : '#C9BEB0'}"/><ellipse cx="21" cy="19" rx="3.6" ry="2.9" fill="${o ? '#F2A33A' : '#C9BEB0'}"/>
  ${o ? '<path d="M26.5 8.5q2 2 0 4M28.5 6.5q3.5 4 0 8" fill="none" stroke="#F2A33A" stroke-width="1.8" stroke-linecap="round"/>' : '<path d="M5 5L27 27" stroke="#E8414B" stroke-width="3" stroke-linecap="round"/>'}</svg>`;
function setOn(v){ save.settings.bgm = !!v; persist(); if(v) unlock(); apply(true); toast(v ? 'BGM オン' : 'BGM オフ'); }
function paint(){
  const o = on(), b = document.querySelector('#btnBgm643');
  if(b){ b.innerHTML = ICON(o); b.classList.toggle('off', !o); b.title = o ? 'BGM：オン' : 'BGM：オフ'; }
  document.querySelectorAll('#segBgm643 button').forEach(x => x.classList.toggle('on', (x.dataset.v === 'true') === o));
}
function mount(){
  const set = document.querySelector('#btnSettings');
  if(set && !document.querySelector('#btnBgm643')){
    set.insertAdjacentHTML('beforebegin', '<button class="roundBtn" id="btnBgm643" type="button" aria-label="BGM"></button>');
    document.querySelector('#btnBgm643').addEventListener('click', e => { e.stopPropagation(); setOn(!on()); });
  }
  const row = document.querySelector('#segSound')?.closest('.row');
  if(row && !document.querySelector('#segBgm643')){
    row.insertAdjacentHTML('afterend', '<div class="row"><div class="lab">BGM（おんがく）</div><div class="seg" id="segBgm643"><button data-v="true">オン</button><button data-v="false">オフ</button></div></div>');
    document.querySelector('#segBgm643').addEventListener('click', e => { const x = e.target.closest('button'); if(x) setOn(x.dataset.v === 'true'); });
  }
  paint();
}
mount(); setTimeout(mount, 800);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ mount(); const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__bgm643 = {B, target, apply, setOn};

const css = document.createElement('style');
css.textContent = `
#btnBgm643{display:flex;align-items:center;justify-content:center;padding:0}
#btnBgm643 .bgmI643{width:62%;height:62%;display:block}
#btnBgm643.off{opacity:.8}
body.scr-quiz #btnBgm643{display:none}
`;
document.head.appendChild(css);
})();


/* =====================================================================
   まなびタウン v6.44：どうぶつえん・すいぞくかん（仕様書 v0.1）
   トップ → あるく（ハナが よこむきで あるく・「！」）→ クイズ → ごほうび → 5ひきで おわり
   ずかん（しゃしんカード／かいがらカード）・レア・パーフェクト・1日の じょうげん
   ===================================================================== */
(function(){
'use strict';
const VER = '6.46.0', IMG = './assets/images/v644/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const wait = ms => new Promise(r => setTimeout(r, ms));
/* [id, なまえ, エリア, 絵（あたらしい 水彩 → なければ 住民の 絵）, まめちしき, [もんだい, せいかい, まちがい1, まちがい2, ★, かいせつ]...] */
const ZOO_AREAS = [['sav','サバンナの ひろば'],['forest','もりの みち'],['north','きたの くに'],['bird','とりの いけ']];
const AQ_AREAS = [['coral','さんごの うみ'],['tunnel','だいすいそうの トンネル'],['jelly','くらげの へや'],['shore','いそべの ひろば']];
const ZOO_AN = [
 ['lion','ライオン','sav','res_lion','オスには りっぱな たてがみが ある。むれで くらす。',[
  ['たてがみが あるのは？','オス','メス','あかちゃん',1,'たてがみは オスだけ。つよさを みせる しるしだよ。'],
  ['ライオンが すんでいる ところは？','サバンナ','こおりの うみ','ふかい うみの そこ',1,'くさはらが ひろがる サバンナで くらしているよ。'],
  ['かりを する ことが おおいのは？','メス','オス','こども',2,'むれの メスたちが きょうりょくして かりを することが おおいよ。'],
  ['ライオンの むれの なまえは？','プライド','チーム','クラブ',3,'ライオンの むれは「プライド」と よばれるよ。']]],
 ['giraffe','キリン','sav','res_giraffe','せかいで いちばん せが たかい どうぶつ。',[
  ['キリンが よく たべるのは？','きの はっぱ','にく','さかな',1,'たかい きの はっぱを ながい したで まきとって たべるよ。'],
  ['キリンの くびの ほねは なんこ？','7こ','14こ','30こ',2,'ひとと おなじ 7こ。1つ1つが とても ながいんだ。'],
  ['キリンの したの いろは？','こい むらさき','ピンク','みどり',3,'こい むらさきいろで、ひやけを ふせぐと いわれているよ。']]],
 ['elephant','ゾウ','sav','v644:an_elephant','りくで いちばん おもい どうぶつ。',[
  ['ゾウの ながい はなで できるのは？','みずを すって あびる','そらを とぶ','ひかる',1,'はなで みずを すったり、ものを つかんだり できるよ。'],
  ['ゾウの おおきな みみは なんの やくに たつ？','あつさを にがす','おとを とめる','とぶ ため',3,'みみを パタパタ うごかして、からだを ひやしているよ。'],
  ['ゾウの きばは なにが のびた もの？','は（まえば）','つの','はなの ほね',3,'きばは まえばが ながく のびた ものだよ。']]],
 ['zebra','シマウマ','sav','v644:an_zebra','しまもようは 1とうずつ ちがう。',[
  ['シマウマは なんの なかま？','ウマ','ウシ','シカ',1,'ウマの なかまだよ。はしるのが とくい！'],
  ['シマウマの おもな たべものは？','くさ','にく','さかな',1,'サバンナの くさを たべて くらしているよ。'],
  ['シマウマの しまもようは？','1とうずつ ちがう','みんな おなじ','おとなに なると きえる',2,'ひとの しもんの ように、1とうずつ もようが ちがうよ。']]],
 ['camel','ラクダ','sav','res_camel','あつい さばくでも げんきに あるける。',[
  ['ラクダが すんでいる ところは？','さばく','うみの なか','こおりの うえ',1,'すなの おおい さばくで くらしているよ。'],
  ['ラクダの まつげが ながいのは なぜ？','すなから めを まもる','かざり','よく ねむる ため',2,'ながい まつげで、すなが めに はいるのを ふせいでいるよ。'],
  ['ラクダの こぶの なかみは？','しぼう','みず','ほね',2,'こぶには えいようの しぼうが たまっているよ。']]],
 ['panda','パンダ','forest','res_panda','ジャイアントパンダの ふるさとは ちゅうごく。',[
  ['パンダが いちばん よく たべるのは？','ささ・たけ','にく','さかな',1,'たけや ささが しゅしょく。1日の ほとんどを たべて すごすよ。'],
  ['ジャイアントパンダの ふるさとの くには？','ちゅうごく','オーストラリア','ブラジル',2,'ちゅうごくの やまおくの たけやぶに すんでいるよ。'],
  ['パンダが たけを つかむ ときに つかうのは？','ゆびの ような でっぱり','しっぽ','みみ',3,'てくびの ほねの でっぱりを 6ばんめの ゆびの ように つかうよ。']]],
 ['redpanda','レッサーパンダ','forest','res_redpanda','しましまの しっぽが ふわふわ。',[
  ['レッサーパンダの しっぽの もようは？','しましま','みずたま','もようなし',1,'あかちゃいろと うすい いろの しましまだよ。'],
  ['レッサーパンダが おもに たべるのは？','たけ・ささ','さかな','いし',2,'たけや ささの ほか、くだものも たべるよ。'],
  ['びっくりした とき どうする ことが ある？','たちあがって おおきく みせる','とぶ','すみを はく',2,'うしろあしで たって、からだを おおきく みせるよ。']]],
 ['koala','コアラ','forest','v644:an_koala','1日の ほとんどを ねて すごす。',[
  ['コアラが たべる はっぱは？','ユーカリ','ささ','キャベツ',1,'ユーカリの はっぱだけを たべるよ。'],
  ['コアラの ふるさとは？','オーストラリア','アフリカ','なんきょく',1,'オーストラリアの もりに すんでいるよ。'],
  ['コアラが あかちゃんを そだてる ところは？','おなかの ふくろ','すの なか','たまごの なか',2,'カンガルーと おなじ、おなかの ふくろで そだてるよ。'],
  ['コアラが 1日に ねる じかんは？','20じかん くらい','2じかん くらい','8じかん くらい',3,'ユーカリは えいようが すくないので、たくさん ねて つかれない ように しているよ。']]],
 ['monkey','ニホンザル','forest','res_goldmonkey','せかいで いちばん きたに すむ サル。',[
  ['ニホンザルの かおの いろは？','あか','あお','きいろ',1,'あかい かおと おしりが とくちょうだよ。'],
  ['さむい ひに はいる ことで ゆうめいなのは？','おんせん','プール','こたつ',2,'ながのけんの おんせんに はいる サルが ゆうめいだよ。'],
  ['ニホンザルは せかいの サルの なかで…？','いちばん きたに すむ','いちばん おおきい','いちばん はやい',3,'ひと いがいの サルで、いちばん きたに すんでいるよ。']]],
 ['penguin','ペンギン','north','res_penguin','とべないけれど およぐのが とくい。',[
  ['ペンギンは そらを とべる？','とべない','とべる','たまに とべる',1,'とべない かわりに、うみの なかを はやく およげるよ。'],
  ['いちばん おおきい ペンギンは？','コウテイペンギン','ケープペンギン','フンボルトペンギン',2,'コウテイペンギンは せの たかさが 1mを こえる ことも あるよ。'],
  ['コウテイペンギンの たまごを あたためるのは？','オス','メス','りょうほう こうたいで',3,'オスが あしの うえに たまごを のせて、さむい ふゆを たえるよ。']]],
 ['polarbear','ホッキョクグマ','north','res_polarbear','しろく みえる けは じつは とうめい。',[
  ['ホッキョクグマが すんでいる ところは？','ほっきょく','なんきょく','さばく',1,'こおりの うみが ひろがる ほっきょくに すんでいるよ。'],
  ['ホッキョクグマの おもな たべものは？','アザラシ','ささ','くだもの',2,'こおりの うえで アザラシを まって つかまえるよ。'],
  ['ホッキョクグマの ひふの いろは？','くろ','しろ','ピンク',3,'けは とうめいで しろく みえる。くろい ひふで ねつを ためるよ。']]],
 ['seal','アザラシ','north','res_seal','ぶあつい しぼうで さむさに つよい。',[
  ['アザラシは なにで いきを する？','はい','えら','ひふ',2,'はいで いきを するので、ときどき すいめんに かおを だすよ。'],
  ['アザラシの からだを あたたかく するのは？','ぶあつい しぼう','ふわふわの はね','かたい こうら',2,'ひふの したの ぶあつい しぼうが さむさを ふせぐよ。'],
  ['アザラシが りくで あるくのが にがてな わけは？','うしろあしが まえに まがらない','あしが ない','おもすぎる',3,'うしろあしが うしろを むいたまま なので、おなかで はって すすむよ。']]],
 ['flamingo','フラミンゴ','bird','res_flamingo','かたあしで たって やすむ ことが おおい。',[
  ['フラミンゴは かたあしで たつ ことが？','よく ある','ぜったい ない','とぶ ときだけ',1,'かたあしで たって やすむ すがたが よく みられるよ。'],
  ['フラミンゴが ピンクいろなのは なぜ？','たべものの いろ','うまれつき ぜんぶ','ぬっている',3,'たべものに ふくまれる いろの もとで ピンクに なるよ。'],
  ['フラミンゴは えさを たべる とき くちばしを どうする？','さかさまに して みずを こす','くるくる まわす','つかわない',3,'あたまを さかさまに して、みずの なかの えさを こしとるよ。']]],
 ['pelican','ペリカン','bird','res_pelican','くちばしの したに おおきな ふくろが ある。',[
  ['ペリカンが よく たべるのは？','さかな','くさ','ささ',1,'みずの なかの さかなを たべるよ。'],
  ['くちばしの したの ふくろの やくわりは？','さかなを すくう','たまごを いれる','うたを うたう',2,'ふくろを あみの ように つかって さかなを すくうよ。'],
  ['ペリカンは そらを とべる？','とべる','とべない','みずの なかだけ',2,'おおきな つばさで そらを とぶ ことが できるよ。']]],
 ['parrot','インコ','bird','res_parrot','ことばや おとの まねが じょうず。',[
  ['インコの なかまが とくいなのは？','ことばや おとの まね','みずの なかで ねる','いろを かえる',1,'ひとの ことばや いろいろな おとを まねできるよ。'],
  ['かたい きのみを わるのに つかうのは？','つよい くちばし','はね','しっぽ',2,'かぎの ような つよい くちばしで、かたい からも わるよ。'],
  ['インコの あしの ゆびは まえに なんぼん？','2ほん','4ほん','1ぽん',3,'まえに 2ほん、うしろに 2ほん。えだを しっかり つかめるよ。']]]
];
const ZOO_RARE = ['whitetiger','ホワイトタイガー','rare','res_whitetiger','しろい けの トラ。めったに あえない！',[
  ['ホワイトタイガーは なんの なかま？','ベンガルトラ','ライオン','ユキヒョウ',3,'ベンガルトラの なかで、しろい けで うまれた トラだよ。'],
  ['トラの しまもようは ひふにも ある？','ある','ない','おとなだけ',3,'けを そっても、ひふに しまもようが あるよ。'],
  ['トラは みずが すき？','すきで およぐのが とくい','にがてで はいらない','のめない',3,'トラは みずあびや およぐのが すきな どうぶつだよ。']]];
const AQ_AN = [
 ['clownfish','クマノミ','coral','res_clownfish','イソギンチャクと なかよく くらす。',[
  ['クマノミは なにと いっしょに くらす？','イソギンチャク','サメ','ウニ',1,'イソギンチャクの しょくしゅに まもられて くらしているよ。'],
  ['イソギンチャクに さされない わけは？','からだの ねんえきで まもられている','かたい うろこ','しびれない から',3,'からだの ぬるぬる（ねんえき）が どくばりから まもるよ。'],
  ['クマノミの むれで いちばん おおきい 1ぴきは？','メス','オス','あかちゃん',3,'いちばん おおきい クマノミが メスに なるよ。']]],
 ['gardeneel','チンアナゴ','coral','v644:an_gardeneel','すなから かおを だして ゆらゆら。',[
  ['チンアナゴは どこで くらす？','すなの あな','いわの うえ','そこを あるいて',1,'すなに あなを ほって、からだを だして くらしているよ。'],
  ['びっくりすると どうする？','すなに ひっこむ','ふくらむ','すみを はく',1,'あぶないと すぐに すなの なかへ ひっこむよ。'],
  ['チンアナゴは なんの なかま？','アナゴ・ウナギ','ヘビ','ミミズ',2,'アナゴの なかまの さかなだよ。']]],
 ['puffer','フグ','coral','v644:an_puffer','おどろくと ぷくっと ふくらむ。',[
  ['フグは おどろくと どうなる？','みずを すって ふくらむ','いろが きえる','とぶ',1,'みずを すって ふくらみ、てきに たべられない ように するよ。'],
  ['フグの なかまの おおくが からだに もつのは？','どく','でんき','ひかり',2,'どくを もつ フグが おおいので、りょうりには しかくが いるよ。'],
  ['フグの つよい はで かみくだく ものは？','かいや カニの から','いわ','てつ',3,'くちばしの ような つよい はで、かたい からも わるよ。']]],
 ['seahorse','タツノオトシゴ','coral','res_seahorse','たてに なって およぐ ふしぎな さかな。',[
  ['タツノオトシゴは なんの なかま？','さかな','エビ','ヘビ',2,'すがたは ふしぎだけど、れっきとした さかなだよ。'],
  ['しっぽの やくわりは？','かいそうに まきつく','はやく およぐ','えさを とる',2,'しっぽを まきつけて、ながされない ように しているよ。'],
  ['あかちゃんを おなかで そだてるのは？','オス','メス','りょうほう',3,'オスの おなかの ふくろで たまごを そだてるよ。']]],
 ['turtle','ウミガメ','tunnel','res_seaturtle','すなはまに たまごを うみに くる。',[
  ['ウミガメが たまごを うむ ところは？','すなはま','うみの そこ','いわの あな',1,'よるに すなはまへ あがって、あなを ほって うむよ。'],
  ['ウミガメは なにで いきを する？','はい','えら','ひれ',2,'はいで いきを するので、ときどき すいめんに でるよ。'],
  ['アオウミガメが おとなに なって おもに たべるのは？','かいそう','さかな','クラゲ だけ',3,'おとなの アオウミガメは かいそうを たべるよ。']]],
 ['manta','マンタ','tunnel','res_shark','つばさの ような ひれで ゆうがに およぐ。',[
  ['マンタは なんの なかま？','エイ','クジラ','カメ',1,'マンタは おおきな エイの なかまだよ。'],
  ['マンタが たべるのは？','プランクトン','さかな','カニ',3,'くちを あけて、ちいさな いきものを こしとって たべるよ。'],
  ['マンタの はばは おおきい もので？','5m いじょう','50cm','10cm',3,'おおきな ものは はばが 5mを こえるよ。']]],
 ['shark','サメ','tunnel','res_shark','はは なんども はえかわる。',[
  ['サメは なんの なかま？','さかな','ほにゅうるい','はちゅうるい',1,'えらで いきを する さかなの なかまだよ。'],
  ['サメの はは？','なんども はえかわる','1どだけ はえる','はえない',2,'ぬけても うしろから つぎの はが でてくるよ。'],
  ['サメの ほねは なにで できている？','なんこつ','かたい ほね','てつ',3,'やわらかい なんこつで できているよ。']]],
 ['jelly','ミズクラゲ','jelly','v644:an_jelly','4つの わの もようが ある。',[
  ['クラゲは どうやって およぐ？','かさを ひらいたり とじたり','ひれで','あしで',1,'かさを ひらいたり とじたり して すすむよ。'],
  ['クラゲの からだの ほとんどは？','みず','ほね','にく',2,'からだの やく 95%が みずで できているよ。'],
  ['ミズクラゲに ないものは？','のう','しょくしゅ','かさ',3,'のうは ないけれど、からだじゅうの しんけいで うごいているよ。']]],
 ['starfish','ヒトデ','jelly','v644:an_starfish','うでが きれても また はえてくる。',[
  ['ヒトデの うでは ふつう なんぼん？','5ほん','8ほん','3ぼん',1,'5ほんの ものが おおいけれど、もっと おおい なかまも いるよ。'],
  ['ヒトデの くちは どこに ある？','からだの うらの まんなか','うでの さき','せなか',2,'うらがわの まんなかに くちが あるよ。'],
  ['ヒトデの うでが きれると？','また はえてくる','そのまま なくなる','かたく なる',2,'さいせいする ちからが あって、うでが また はえてくるよ。']]],
 ['octopus','タコ','jelly','res_octopus','すみを はいて にげる。かしこい いきもの。',[
  ['タコの あしは なんぼん？','8ほん','10ぽん','6ぽん',1,'8ほんの あし（うで）に きゅうばんが ならんでいるよ。'],
  ['てきから にげる とき はくのは？','すみ','みず','あわ',1,'すみを はいて、てきの めを くらませるよ。'],
  ['タコの しんぞうは いくつ？','3つ','1つ','2つ',3,'えらに 2つ、からだに 1つ。ぜんぶで 3つ あるよ。']]],
 ['crab','カニ','shore','res_crab','よこに あるく ことが おおい。',[
  ['カニは どっちに あるく ことが おおい？','よこ','まえ','うしろ',1,'あしの つくりの ため、よこに あるく ことが おおいよ。'],
  ['はさみも いれた カニの あしの かずは？','10ぽん','8ほん','6ぽん',2,'はさみ 2ほんと あし 8ほんで、ぜんぶで 10ぽんだよ。'],
  ['カニは そだつ とき どうする？','からを ぬいで おおきく なる','からが のびる','からを たべる',3,'「だっぴ」を して、ひとまわり おおきく なるよ。']]],
 ['hermit','ヤドカリ','shore','res_hermit','まきがいの からを おうちに する。',[
  ['ヤドカリが せおって いるのは？','まきがいの から','じぶんの ほね','いし',1,'まきがいの からを おうちに して、やわらかい からだを まもるよ。'],
  ['ヤドカリは おおきく なると どうする？','おおきな からに ひっこす','からを のばす','からを すてて くらす',2,'からだに あう おおきな からを さがして ひっこすよ。'],
  ['ヤドカリは なんの なかま？','エビ・カニ','かい','さかな',2,'エビや カニに ちかい なかまだよ。']]],
 ['penguin2','フンボルトペンギン','shore','res_penguin','みなみアメリカの うみべに すむ ペンギン。',[
  ['ペンギンは なんの なかま？','とり','さかな','ほにゅうるい',1,'とべないけれど、はねの ある とりの なかまだよ。'],
  ['ペンギンが およぐ ときに つかうのは？','つばさ','あし だけ','くちばし',2,'つばさを ひれの ように うごかして およぐよ。'],
  ['ペンギンが いちばん おおく すむのは？','みなみはんきゅう','ほっきょく','さばく',2,'ほとんどの ペンギンは ちきゅうの みなみがわに すんでいるよ。']]]
];
const AQ_RARE = ['whaleshark','ジンベエザメ','rare','res_shark','せかいで いちばん おおきな さかな！',[
  ['ジンベエザメは せかいで いちばん おおきい…？','さかな','クジラ','カメ',3,'ジンベエザメは さかなの なかで いちばん おおきいよ。'],
  ['ジンベエザメの おもな たべものは？','プランクトンや ちいさな さかな','クジラ','いわ',3,'おおきな くちで、ちいさな いきものを まとめて すいこむよ。'],
  ['ジンベエザメの からだの もようは？','しろい てんてん','あかい しま','もようなし',3,'こい あおの からだに、しろい てんてんが ならんでいるよ。']]];

const CFG = {walk:5, perDay:5, ptCap:300, cry:3, rareP:.15, rareMul:3, perfect:10, complete:500, star:{1:2,2:4,3:6}, gap:520};
const PLACE = {
  zoo:{key:'zoo', n:'どうぶつえん', card:'しゃしんカード', areas:ZOO_AREAS, an:ZOO_AN, rare:ZOO_RARE, logo:'./assets/images/v645/logo_zoo.webp', guides:['res_panda','res_redpanda'],
    say:['いっしょに みて まわろう！','どの どうぶつに あえるかな？','わからない ときは ぼくを タッチしてね','ささ、おいしいよ〜'], hello:n => `${n}さんだ！ ちかづいて みよう！`},
  aq:{key:'aq', n:'すいぞくかん', card:'かいがらカード', areas:AQ_AREAS, an:AQ_AN, rare:AQ_RARE, logo:IMG+'logo_aquarium.webp', guides:['res_dolphin'],
    say:['うみの ふしぎに であおう！','きょうは だれに あえるかな？','こまったら ぼくを タッチしてね','キュイ〜！'], hello:n => `${n}だ！ ちかづいて みよう！`}
};
const all = P => P.an.concat([P.rare]);
const anBy = (P, id) => all(P).find(a => a[0]===id);
const NEW645 = {giraffe:'an_giraffe', panda:'an_panda', penguin:'an_penguin', penguin2:'an_penguin', turtle:'an_turtle', clownfish:'an_clownfish', octopus:'an_octopus'};
const SC648 = {monkey:.55, redpanda:.55, koala:.55, penguin:.6, penguin2:.6, panda:.72, lion:.85, zebra:.85, whitetiger:.85, polarbear:.8, seal:.5, pelican:.7, parrot:.55, flamingo:.9, giraffe:1.15, elephant:1.05, crab:.42, hermit:.42, starfish:.42, gardeneel:.6, clownfish:.45, seahorse:.5, puffer:.5, jelly:.7, octopus:.65, turtle:.8, shark:.9, manta:.95, whaleshark:1.1};
const NEW646 = {lion:1, camel:1, redpanda:1, monkey:1, polarbear:1, seal:1, flamingo:1, whitetiger:1, seahorse:1, manta:1, shark:1, whaleshark:1};
const artOf = a => a[3].startsWith('v647:') ? './assets/images/v647/' + a[3].slice(5) + '.webp' : NEW646[a[0]] ? './assets/images/v646/an_' + a[0] + '.webp' : NEW645[a[0]] ? './assets/images/v645/' + NEW645[a[0]] + '.webp' : a[3].startsWith('v644:') ? IMG + a[3].slice(5) + '.webp' : (artSrc(a[3]) || '');
const isNew = a => a[3].startsWith('v647:') || !!NEW646[a[0]] || !!NEW645[a[0]] || a[3].startsWith('v644:');

/* ---------- セーブ ---------- */
function SV(P){ const k = P.key==='zoo' ? 'zoo644' : 'aq644'; const s = save[k] || (save[k] = {seen:{}, perfect:0, complete:0});
  const d = dayKey(); if(!s.daily || s.daily.d !== d) s.daily = {d, walks:0}; if(!s.rare || s.rare.d !== d) s.rare = {d, done:0}; return s; }
function SH(){ const d = dayKey(); let s = save.zaq644; if(!s || s.d !== d) s = save.zaq644 = {d, cry:0, pt:0}; return s; }
const userStar = () => { const g = Number(save.settings?.grade56 || 0); return !g ? 0 : g <= 2 ? 1 : g <= 4 ? 2 : 3; };
function pickQ(P, a){
  const s = SV(P), sv = s.seen[a[0]] || {}, us = userStar();
  let L = a[5].map((q, i) => [q, i]).filter(([, i]) => i !== sv.lastQ);
  if(us){ const best = Math.min(...L.map(([q]) => Math.abs(q[4] - us))); const M = L.filter(([q]) => Math.abs(q[4] - us) === best); if(M.length) L = Math.random() < .75 ? M : L; }
  return choice(L);
}

/* ---------- 画面 ---------- */
let ROOT = null, P = null, KEY = null, W = null, busy = false;
function root(){ if(ROOT && document.body.contains(ROOT)) return ROOT; ROOT = document.createElement('div'); ROOT.id = 'zq644'; document.body.appendChild(ROOT); return ROOT; }
function open(kind, key){ P = PLACE[kind]; KEY = key; W = null; root(); ROOT.className = P.key; document.body.classList.add('zq644on'); requestAnimationFrame(() => ROOT.classList.add('show')); top(); }
function close(){ stopLoop(); if(!ROOT) return; ROOT.classList.remove('show'); document.body.classList.remove('zq644on'); const r = ROOT; ROOT = null; setTimeout(() => r.remove(), 250); try{ persist(); }catch(e){} }
const cryChip = () => { const s = SH(), left = CFG.cry - s.cry; return `<button type="button" class="cy644 ${left ? '' : 'got'}" data-z="cry"><img src="${X(artSrc('itm_crystal') || artSrc('ui_bulb') || '')}" alt="" onerror="this.style.display='none'"><b>${left}/${CFG.cry}</b></button>`; };
const backBtn = (a='town') => `<button type="button" class="bk644" data-z="${a}"><svg viewBox="0 0 24 24"><path d="M14 5L7 12L14 19" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H20" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg><b>${a==='town' ? 'まちへ' : 'もどる'}</b></button>`;
const logo = () => P.logo ? `<img class="lg644" src="${P.logo}" alt="${P.n}">` : `<div class="lgt644"><small>まなびタウンの</small><b>${P.n}</b></div>`;
const hanaStand = (cls='') => `<div class="hn644 ${cls}"><i style="background-image:url(${IMG}hana_walk.webp)"></i></div>`;

function top(){
  if(!ROOT) return; stopLoop(); const s = SV(P), left = CFG.perDay - s.daily.walks, I6 = './assets/images/v646/';
  const zones = P.key==='zoo' ? [[0,40,66,18,22],[1,66,68,25,22]] : [[0,56,42,38,32]];
  ROOT.innerHTML = `<div class="w644 tp t646"><div class="tbg646" style="background-image:url(${I6}top_${P.key}.webp)"></div>
    <div class="tim646"><img src="${I6}top_${P.key}.webp" alt="">
      ${zones.map(([i,x,y,w,h]) => `<button type="button" class="gz646" data-z="guide" data-i="${i}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" aria-label="ガイド"></button>`).join('')}
      <span class="bb644 hidden"></span></div>
    <header class="hd644">${backBtn()}${logo()}${cryChip()}</header>
    <div class="ts644"></div>
    <div class="tb644"><button type="button" class="go644 g646 ${P.key}" data-z="walk" ${left > 0 ? '' : 'disabled'} style="background-image:url(${I6}btn_${P.key}.webp)"><span>${left > 0 ? `${P.n}を<br>あるく` : 'きょうは<br>もう おしまい'}</span><small>${left > 0 ? `きょう あと ${left}かい` : 'また あした あそぼう！'}</small></button>
      <button type="button" class="zk644 z646 ${P.key}" data-z="zukan"><img src="${X(artSrc('ui_zukan') || '')}" alt=""><b>ずかん</b></button></div>
  </div>`;
  setTimeout(() => { const z = ROOT && ROOT.querySelector('.gz646'); if(z) say(z, P.key==='zoo' ? 'いっしょに みて まわろう！' : 'うみの ふしぎに であおう！'); }, 450);
}
function say(el, t){ const b = ROOT.querySelector('.bb644'); if(!b) return; b.textContent = t; b.classList.remove('hidden', 'pop'); void b.offsetWidth; b.classList.add('pop');
  const r = el.getBoundingClientRect(), pr = b.parentElement.getBoundingClientRect(); b.style.left = Math.max(4, Math.min(pr.width - 170, r.left - pr.left + r.width/2 - 80)) + 'px'; b.style.top = Math.max(0, r.top - pr.top - 54 - (el.classList.contains('gz646') && P.key==='zoo' ? 92 : 0)) + 'px'; }

/* ---------- あるく ---------- */
function startWalk(){
  const s = SV(P); if(s.daily.walks >= CFG.perDay){ toast('きょうの けんがくは おしまい'); return; }
  s.daily.walks++; persist();
  const order = P.areas.map(a => a[0]);
  let pick = shuffle(P.an.slice()).slice(0, CFG.walk).sort((a, b) => order.indexOf(a[2]) - order.indexOf(b[2]));
  let rare = false;
  if(!s.rare.done){ s.rare.done = 1; if(Math.random() < CFG.rareP){ rare = true; pick[2] = P.rare; } persist(); }
  W = {list:pick, i:0, x:0, dir:0, moving:false, stop:false, got:0, ok:0, pt:0, cards:[], rare, last:0, frame:0, perfect:true};
  drawWalk(); startLoop();
}
const posOf = i => 420 + i * CFG.gap;
function areaAt(i){ const a = W.list[Math.min(i, W.list.length-1)]; return a[2]==='rare' ? (W.list[Math.max(0, i-1)] || a)[2] : a[2]; }
function drawWalk(){
  if(!ROOT) return; const a = areaAt(W.i), an = P.areas.find(x => x[0]===a);
  ROOT.innerHTML = `<div class="w644 wk"><header class="hd644">${backBtn()}<div class="as644"><b>${X(an ? an[1] : '')}</b></div>${cryChip()}</header>
    <div class="sc644" data-z="scene"><div class="bg644 ${a}"><i class="l1"></i><i class="l2"></i><i class="l3"></i>${P.key==='aq' ? '<i class="ray"></i><i class="bub"></i>' : ''}</div>
      <div class="wd644">${W.list.map((x, i) => `<div class="an644 ${x[2]==='rare' ? 'gold' : ''} ${i < W.i ? 'done' : ''}" data-i="${i}" style="left:${posOf(i)}px"><div style="--sc:${SC648[x[0]]||1}" class="ai644 ${P.key==='aq' && !['crab','hermit','penguin2','starfish','gardeneel'].includes(x[0]) ? 'sw' : ''}"><img src="${X(artOf(x))}" alt="" class="${isNew(x) ? 'wc' : 'tmp'}"><button type="button" class="ex644 hidden" data-z="ex">！</button></div></div>`).join('')}
        <div class="end644" style="left:${posOf(W.list.length) - 80}px"><b>ゴール</b></div></div>
      <div class="hw644"><i style="background-image:url(${IMG}hana_walk.webp)"></i><span class="hb644 hidden"></span></div>
      <div class="tip644"><span>◀ ひだり</span><b>がめんを タッチしている あいだ あるくよ</b><span>みぎ ▶</span></div>
    </div>
    <div class="rt644">${W.list.map((x, i) => `<span class="${i < W.i ? 'd' : i===W.i ? 'c' : ''} ${x[2]==='rare' ? 'g' : ''}"><img src="${X(artOf(x))}" alt=""></span>`).join('<i></i>')}<b>${W.i}/${W.list.length}ひき</b></div>
  </div>`;
  const sc = ROOT.querySelector('.sc644');
  const set = e => { if(W.stop || busy) return; const r = sc.getBoundingClientRect(); W.dir = (e.clientX - r.left) < r.width * .4 ? -1 : 1; };
  sc.addEventListener('pointerdown', e => { if(e.target.closest('.ex644')) return; sc.setPointerCapture(e.pointerId); set(e); });
  sc.addEventListener('pointermove', e => { if(W.dir) set(e); });
  ['pointerup','pointercancel','pointerleave'].forEach(n => sc.addEventListener(n, () => { W.dir = 0; }));
  place();
}
let RAF = 0, LT = 0;
function startLoop(){ cancelAnimationFrame(RAF); LT = performance.now(); const f = t => { const dt = Math.min(50, t - LT); LT = t; tick(dt); RAF = requestAnimationFrame(f); }; RAF = requestAnimationFrame(f); }
function stopLoop(){ cancelAnimationFrame(RAF); RAF = 0; }
function tick(dt){
  if(!W || !ROOT || !ROOT.querySelector('.wd644')) return;
  const target = posOf(W.i) - 205;
  if(W.dir && !W.stop){
    W.x += W.dir * dt * .26; W.x = Math.max(0, W.x);
    if(W.i < W.list.length && W.x >= target){ W.x = target; arrive(); }
    if(W.i >= W.list.length && W.x >= posOf(W.list.length) - 160){ W.x = posOf(W.list.length) - 160; W.dir = 0; finish(); }
    W.frame += dt / 95;
  }
  place();
}
function place(){
  const wd = ROOT && ROOT.querySelector('.wd644'); if(!wd) return; const sc = ROOT.querySelector('.sc644'), hx = sc.clientWidth * .22;
  const off = hx - W.x - 60; wd.style.transform = `translateX(${off}px)`;
  sc.style.setProperty('--px', off + 'px');
  const h = ROOT.querySelector('.hw644 i'); if(h){ const moving = W.dir && !W.stop; const fr = moving ? Math.floor(W.frame) % 6 : 2; h.style.backgroundPositionX = `${fr * 20}%`; h.parentElement.classList.toggle('flip', W.dir < 0); h.parentElement.classList.toggle('mv', !!moving); }
  /* エリアの かんばん */
  const k = Math.max(0, Math.min(W.list.length - 1, Math.round((W.x + 205 - 420) / CFG.gap))), a = areaAt(k), bgs = ROOT.querySelectorAll('.sc644 .bg644'), bg = bgs[bgs.length - 1];
  if(bg && !bg.classList.contains(a)){ const nb = bg.cloneNode(true); nb.className = `bg644 ${a} fade648`; bg.after(nb); requestAnimationFrame(() => nb.classList.add('in')); setTimeout(() => { bgs.forEach(x => x.remove()); nb.classList.remove('fade648','in'); }, 900); const an = P.areas.find(x => x[0]===a) || ['', P.rare[1]]; const as = ROOT.querySelector('.as644 b'); if(as){ as.textContent = a==='rare' ? '？？？' : an[1]; as.parentElement.classList.remove('pop'); void as.offsetWidth; as.parentElement.classList.add('pop'); } }
}
function arrive(){
  W.stop = true; W.dir = 0; const a = W.list[W.i], el = ROOT.querySelector(`.an644[data-i="${W.i}"]`);
  if(el){ const ex = el.querySelector('.ex644'); ex.classList.remove('hidden'); if(a[2]==='rare'){ ex.classList.add('gold'); sound('fan'); } else sound('tap'); }
  const hb = ROOT.querySelector('.hb644'); if(hb){ hb.textContent = a[2]==='rare' ? `わあ！ ${a[1]}だ！ めずらしい！` : P.hello(a[1]); hb.classList.remove('hidden'); }
}
async function finish(){
  if(busy || !W || W.done) return; W.done = true; stopLoop();
  const s = SV(P), sh = SH(), lines = [];
  const perfect = W.ok === W.list.length;
  if(perfect){ s.perfect = (s.perfect||0) + 1; const p = addCapped(CFG.perfect); W.pt += p; W.list.forEach(a => { const v = s.seen[a[0]]; if(v && v.card) v.gold = 1; }); }
  let cry = false; if(W.ok >= 3 && sh.cry < CFG.cry){ sh.cry++; save.crystal = (save.crystal||0) + 1; cry = true; }
  persist();
  ROOT.innerHTML = `<div class="w644 rs"><div class="bg644 ${P.key==='zoo' ? 'sav' : 'coral'} top"><i class="l1"></i><i class="l2"></i><i class="l3"></i></div>
    <div class="rc644"><h2>${perfect ? '🌟 パーフェクト！' : 'けんがく おしまい！'}</h2>
      ${hanaStand('rs')}
      <p class="sc644t">${W.ok}/${W.list.length}もん せいかい</p>
      <div class="pt644">+${W.pt} ポイント</div>
      ${W.cards.length ? `<div class="cg644"><b>あたらしい ${P.card}</b><div>${W.cards.map(a => card(a, s.seen[a[0]], true)).join('')}</div></div>` : ''}
      <p class="cr644 ${cry ? 'ok' : ''}">${cry ? `すいしょう +1 ゲット！（きょう あと ${CFG.cry - sh.cry}こ）` : sh.cry >= CFG.cry ? 'きょうの すいしょうは もらったよ' : '3もん いじょう せいかいで すいしょうが もらえるよ'}</p>
      ${perfect ? '<p class="pf644">5もん ぜんぶ せいかい！ カードが きんいろに なったよ</p>' : ''}
      <div class="rb644">${CFG.perDay - s.daily.walks > 0 ? `<button type="button" class="btn gold" data-z="walk">もういちど あるく（あと ${CFG.perDay - s.daily.walks}かい）</button>` : ''}<button type="button" class="btn white" data-z="top">トップへ</button></div></div></div>`;
  confetti(perfect ? 2600 : 1200); sound('fan');
  checkComplete();
}
function addCapped(p){ const sh = SH(); const g = Math.max(0, Math.min(p, CFG.ptCap - sh.pt)); if(g > 0){ sh.pt += g; addPoints(g, `${P.n}の けんがく`, true); } return g; }

/* ---------- クイズ ---------- */
async function quiz(){
  if(busy || !W || !W.stop) return; busy = true;
  const a = W.list[W.i], [q, qi] = pickQ(P, a), rare = a[2]==='rare', s = SV(P);
  const sv = s.seen[a[0]] || (s.seen[a[0]] = {n:0, ok:0, card:0}); sv.n++; sv.lastQ = qi;
  const opts = shuffle([q[1], q[2], q[3]]); let removed = new Set(), hinted = false;
  const r = await new Promise(res => {
    const draw = () => {
      ROOT.innerHTML = `<div class="w644 qz"><header class="hd644">${backBtn()}<div class="as644 sm"><b>${W.i+1}/${W.list.length}ひきめ</b></div>${cryChip()}</header>
        <div class="qs644 ${rare ? 'gold' : ''}"><div class="bg644 ${areaAt(W.i)} q"><i class="l1"></i><i class="l2"></i><i class="l3"></i>${P.key==='aq' ? '<i class="ray"></i>' : ''}</div>
          <img class="qa644 ${isNew(a) ? 'wc' : 'tmp'}" src="${X(artOf(a))}" alt="">${hanaStand('q')}
          <span class="qb644">${X(rare ? 'きんいろに ひかってる…！' : choice(['わあ！ ちかくで みると すごい！','どんな いきものかな？','よく みてみよう！']))}</span>
          <div class="pv644"><span>${sv.card ? 'もってる カード' : `せいかいすると<br>${P.card}が もらえる！`}</span>${card(a, sv, false, 'mini')}</div></div>
        <div class="qc644"><div class="qh644"><span class="nm644">${X(a[1])}</span><span class="st644">${'★'.repeat(q[4])}</span></div>
          <div class="qt644">${X(q[0])}</div>
          <div class="op644">${opts.map(o => `<button type="button" data-o="${X(o)}" ${removed.has(o) ? 'disabled' : ''}>${X(o)}</button>`).join('')}</div>
          ${hinted ? '' : `<button type="button" class="ht644" data-z="hint">${P.guides.map(g => `<img src="${X(artSrc(g)||'')}" alt="">`).join('')}<span>ヒント（ポイント はんぶん）</span></button>`}</div></div>`;
      ROOT.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const ok = b.dataset.o === q[1]; b.classList.add(ok ? 'ok' : 'ng'); ROOT.querySelectorAll('[data-o]').forEach(x => x.disabled = true); sound(ok ? 'ok' : 'ng'); setTimeout(() => res({ok, v:b.dataset.o}), ok ? 600 : 450); });
      const h = ROOT.querySelector('[data-z="hint"]'); if(h) h.onclick = () => { hinted = true; removed.add(choice([q[2], q[3]])); sound('tap'); draw(); };
      ROOT.querySelector('[data-z="town"]').onclick = () => res({quit:true});
    };
    draw();
  });
  if(r.quit){ busy = false; return quitWalk(); }
  if(r.ok){
    W.ok++; sv.ok++;
    let p = CFG.star[q[4]] || 2; if(hinted) p = Math.max(1, Math.round(p/2)); if(rare) p *= CFG.rareMul;
    const g = addCapped(p); W.pt += g;
    let newCard = false; if(!sv.card){ sv.card = 1; newCard = true; W.cards.push(a); } if(rare) sv.gold = 1;
    persist();
    await reward(a, sv, g, p, newCard, rare);
  } else {
    W.perfect = false; persist();
    await explain(a, q, r.v);
  }
  W.i++; W.stop = false; busy = false;
  if(!ROOT) return;
  drawWalk(); startLoop();
  const hb = ROOT.querySelector('.hb644'); if(hb){ hb.textContent = W.i >= W.list.length ? 'これで ぜんぶ！ ゴールへ いこう！' : 'つぎは だれに あえるかな？'; hb.classList.remove('hidden'); }
}
function reward(a, sv, g, p, newCard, rare){
  return new Promise(res => {
    ROOT.querySelector('.qc644').innerHTML = `<div class="rw644 ${rare ? 'gold' : ''}"><h3>${rare ? '✨ だいせいかい！ ✨' : 'せいかい！'}</h3>
      ${newCard ? `<div class="nc644"><b>${P.card} ゲット！</b>${card(a, sv, true)}</div>` : `<p class="mm644">${X(a[4])}</p>`}
      <p class="gp644">${g ? `+${g} ポイント${rare ? '（3ばい！）' : ''}` : 'きょうの ポイントは じょうげんに なったよ'}</p>
      <button type="button" class="btn gold" data-z="next">つぎへ</button></div>`;
    if(rare || newCard) confetti(rare ? 2400 : 900); if(rare) sound('fan');
    ROOT.querySelector('[data-z="next"]').onclick = res;
  });
}
function explain(a, q, v){
  return new Promise(res => {
    ROOT.querySelector('.qc644').innerHTML = `<div class="xp644"><div class="xh644">${P.guides.slice(0,1).map(g => `<img src="${X(artSrc(g)||'')}" alt="">`).join('')}<b>おしい！ こたえは「${X(q[1])}」だよ</b></div>
      <p>${X(q[5])}</p>${v ? `<small>きみの こたえ：${X(v)}</small>` : ''}<button type="button" class="btn gold" data-z="next">わかった！ つぎへ</button></div>`;
    ROOT.querySelector('[data-z="next"]').onclick = res;
  });
}
async function quitWalk(){
  const v = await dialog(`<h2 class="dlgT">まちへ もどる？</h2><p class="dlgP">ここまでに もらった ポイントと カードは もらえるよ。<br>（すいしょうは さいごまで あるくと もらえるよ）</p>`, [{label:'けんがくを つづける', cls:'gold', v:0}, {label:'まちへ もどる', cls:'white', v:1}]);
  if(v){ close(); return; }
  if(W && W.stop){ drawWalk(); arrive(); startLoop(); } else if(W){ drawWalk(); startLoop(); }
}

/* ---------- カード・ずかん ---------- */
function card(a, sv, show, cls=''){
  const has = sv && sv.card, gold = sv && sv.gold;
  return `<div class="cd644 ${P.key} ${cls} ${has || show ? '' : 'sh'} ${gold ? 'gold' : ''}"><div class="ci644"><img class="${isNew(a) ? 'wc' : 'tmp'}" src="${X(artOf(a))}" alt=""></div>
    ${cls==='mini' ? '' : `<b>${has || show ? X(a[1]) : '？？？'}</b>${has || show ? `<small>${X(a[4])}</small>` : ''}${sv && sv.n ? `<em>あった かず ${sv.n}</em>` : ''}`}</div>`;
}
function zukan(){
  stopLoop(); const s = SV(P), L = all(P), got = L.filter(a => (s.seen[a[0]]||{}).card).length;
  ROOT.innerHTML = `<div class="w644 zk"><div class="bg644 ${P.key==='zoo' ? 'forest' : 'jelly'} top"><i class="l1"></i><i class="l2"></i><i class="l3"></i></div>
    <header class="hd644">${backBtn('top')}<div class="as644"><b>${P.key==='zoo' ? 'しゃしんずかん' : 'かいがらずかん'}　${got}/${L.length}</b></div><span></span></header>
    <div class="zg644">${P.areas.concat([['rare','とくべつな いきもの']]).map(ar => `<h4>${X(ar[1])}</h4><div>${L.filter(a => a[2]===ar[0]).map(a => card(a, s.seen[a[0]], false)).join('')}</div>`).join('')}</div>
    ${s.complete ? '<p class="zc644">ぜんぶ そろった！ きんいろの わくを ゲット！</p>' : `<p class="zc644 s">ぜんぶ そろえると とくべつな ごほうび！</p>`}</div>`;
}
async function checkComplete(){
  const s = SV(P); if(s.complete) return; if(!P.an.every(a => (s.seen[a[0]]||{}).card)) return;
  s.complete = 1; P.an.forEach(a => { s.seen[a[0]].gold = 1; }); addPoints(CFG.complete, `${P.n} ずかん コンプリート`); persist();
  await dialog(`<h2 class="dlgT">🌟 ずかん コンプリート！</h2><p class="dlgP">${P.n}の ${P.card}が ぜんぶ そろったよ！<br>+${CFG.complete} ポイント・カードが ぜんぶ きんいろに！</p>`, [{label:'やったー！', cls:'gold', v:1}]);
}

/* ---------- タッチ ---------- */
document.addEventListener('click', async e => {
  if(!ROOT || !ROOT.contains(e.target)) return; const t = e.target.closest('[data-z]'); if(!t) return; const z = t.dataset.z;
  if(z==='scene') return;
  if(busy && z!=='town') return;
  if(z==='town'){ if(W && !W.done && ROOT.querySelector('.wk')) return quitWalk(); return close(); }
  if(z==='top'){ W = null; return top(); }
  if(z==='walk') return startWalk();
  if(z==='zukan') return zukan();
  if(z==='guide'){ sound('tap'); return say(t, choice(P.say)); }
  if(z==='cry'){ const sh = SH(); return toast(sh.cry >= CFG.cry ? 'きょうの すいしょうは もらったよ' : `すいしょう：きょう あと ${CFG.cry - sh.cry}こ（どうぶつえん・すいぞくかん あわせて）`); }
  if(z==='ex') return quiz();
}, true);
document.addEventListener('click', e => { if(!ROOT || !W || !W.stop || busy) return; const a = e.target.closest && e.target.closest('.an644'); if(a && +a.dataset.i === W.i) quiz(); });

/* ---------- まちの たてものに つなぐ ---------- */
const HOOK = {zoo:'zoo', aquarium:'aq'}; let swap = null;
const restore = () => { if(swap && save.town && save.town.cells[swap.k]==='__zq644') save.town.cells[swap.k] = swap.id; swap = null; };
window.addEventListener('pointerup', e => {
  if(typeof curScreen==='undefined' || curScreen!=='town' || townEdit || !save.town) return;
  if(e.target.closest('#townMap .walker,.car2')) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const k = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[k]; if(!HOOK[id]) return;
  restore(); swap = {k, id}; save.town.cells[k] = '__zq644'; setTimeout(restore, 600);
}, true);
window.addEventListener('click', e => {
  if(!swap) return; const c = e.target.closest && e.target.closest('#townMap .cell'); const s = swap; restore();
  if(!c || `${c.dataset.x},${c.dataset.y}` !== s.k) return;
  e.stopImmediatePropagation(); e.preventDefault(); open(HOOK[s.id], s.k);
}, true);
const _show644 = show; show = function(){ if(ROOT) close(); return _show644.apply(this, arguments); };
window.__zq644 = {open, close, PLACE, SV, SH, get W(){ return W; }, quiz, finish, drawWalk:() => drawWalk()};

/* ---------- BGM：クイズ中は さげる・すいぞくかんは ひかえめ ---------- */
try{ const B = window.__bgm643; if(B){ const t0 = B.target; B.target = () => { const v = t0(); if(!document.querySelector('#zq644') || v === 0) return v; return document.querySelector('#zq644 .qz') ? .07 : document.querySelector('#zq644.aq') ? .14 : v; }; } }catch(e){}

const css = document.createElement('style');
css.textContent = `
#zq644{position:fixed;inset:0;z-index:66;overflow:hidden;opacity:0;transition:opacity .22s;background:#CFE9F7;touch-action:manipulation}
#zq644.show{opacity:1}
body.zq644on{overflow:hidden}
.w644{position:relative;max-width:560px;height:100%;margin:0 auto;display:flex;flex-direction:column;overflow:hidden}
.w644.zk,.w644.rs{overflow-y:auto}
/* 背景（かりの え：つぎの こうしんで イラストに さしかえ） */
.bg644{position:absolute;inset:0;z-index:0;overflow:hidden}
.bg644 i{position:absolute;left:-50%;right:-50%;display:block}
.bg644 .l1{top:0;height:62%;background:linear-gradient(#9FD8F5,#DDF2FF)}
.bg644 .l2{top:30%;height:40%;background:radial-gradient(60px 40px at 10% 80%,#7FBF6A 98%,transparent),radial-gradient(90px 55px at 35% 85%,#6FB35C 98%,transparent),radial-gradient(70px 45px at 62% 82%,#86C673 98%,transparent),radial-gradient(100px 60px at 88% 86%,#74B862 98%,transparent);background-size:420px 100%;background-position-x:calc(var(--px,0px) * .35)}
.bg644 .l3{bottom:0;height:42%;background:linear-gradient(#E9D3A2,#D9BC82);background-size:240px 100%;background-position-x:var(--px,0px)}
.bg644.sav .l1{background:linear-gradient(#FFD9A0,#FFF1D6)}.bg644.sav .l3{background:repeating-linear-gradient(90deg,#E5C98F 0 120px,#DDBF84 120px 240px)}
.bg644.forest .l1{background:linear-gradient(#BFE6C2,#E9F7E4)}.bg644.forest .l2{filter:saturate(1.3) brightness(.85)}.bg644.forest .l3{background:repeating-linear-gradient(90deg,#B99A6A 0 120px,#B08F5F 120px 240px)}
.bg644.north .l1{background:linear-gradient(#BFDDF2,#F2FAFF)}.bg644.north .l2{filter:grayscale(.85) brightness(1.45)}.bg644.north .l3{background:repeating-linear-gradient(90deg,#EEF6FB 0 120px,#E3EEF6 120px 240px)}
.bg644.bird .l1{background:linear-gradient(#A9DDF2,#EAF8FF)}.bg644.bird .l3{background:repeating-linear-gradient(90deg,#7FC6DE 0 120px,#76BDD6 120px 240px)}
.bg644.rare .l1{background:linear-gradient(#FFE9A8,#FFF8DC)}.bg644.rare .l3{background:repeating-linear-gradient(90deg,#F2D98A 0 120px,#EBCF7A 120px 240px)}
#zq644.aq .bg644 .l1{height:100%;background:linear-gradient(#4FB4E0,#1F6FA8 70%,#164E86)}
#zq644.aq .bg644 .l2{top:auto;bottom:22%;height:30%;background:radial-gradient(30px 60px at 12% 100%,#F07B8A 96%,transparent),radial-gradient(22px 44px at 30% 100%,#FFB15C 96%,transparent),radial-gradient(34px 70px at 58% 100%,#E86AA8 96%,transparent),radial-gradient(26px 50px at 82% 100%,#5CC9A6 96%,transparent);background-size:360px 100%;background-position-x:calc(var(--px,0px) * .5);filter:none}
#zq644.aq .bg644 .l3{height:24%;background:repeating-linear-gradient(90deg,#E8D6A8 0 120px,#DFCB98 120px 240px);background-position-x:var(--px,0px)}
#zq644.aq .bg644.tunnel .l1{background:radial-gradient(120% 90% at 50% 100%,#2C8FC9 50%,#174E86 51%,#174E86 54%,#3DA3D8 55%,#1A5E99)}
#zq644.aq .bg644.jelly .l1{background:linear-gradient(#2A2F6E,#1B1D4A 70%,#13153A)}#zq644.aq .bg644.jelly .l2{filter:hue-rotate(200deg) brightness(.8)}#zq644.aq .bg644.jelly .l3{background:repeating-linear-gradient(90deg,#3A3F7A 0 120px,#343873 120px 240px)}
#zq644.aq .bg644.shore .l1{background:linear-gradient(#8FD6F2,#CFEFFA 60%,#FFF2D6)}
#zq644.aq .bg644.rare .l1{background:linear-gradient(#1B4F86,#0E2F5A)}
#zq644.aq .bg644 .ray{top:0;height:70%;background:repeating-linear-gradient(100deg,rgba(255,255,255,.12) 0 18px,transparent 18px 80px);animation:ray644 8s linear infinite;mix-blend-mode:screen}
@keyframes ray644{to{background-position-x:160px}}
#zq644.aq .bg644 .bub{top:0;height:80%;background:radial-gradient(4px 4px at 20% 80%,rgba(255,255,255,.7) 98%,transparent),radial-gradient(3px 3px at 60% 60%,rgba(255,255,255,.6) 98%,transparent),radial-gradient(5px 5px at 80% 90%,rgba(255,255,255,.6) 98%,transparent);background-size:200px 300px;animation:bub644 7s linear infinite}
@keyframes bub644{to{background-position-y:-300px}}
/* ヘッダー */
.hd644{position:relative;z-index:5;display:grid;grid-template-columns:auto 1fr auto;align-items:start;gap:6px;padding:calc(8px + env(safe-area-inset-top)) 8px 0}
.bk644{display:flex;align-items:center;gap:2px;border:3px solid #fff;background:linear-gradient(180deg,#FFF6E2,#F7E3BE);border-radius:18px;padding:5px 8px 5px 4px;font:inherit;box-shadow:0 3px 0 #C9A36A}
.bk644 svg{width:24px;height:24px;background:#F07B54;border-radius:50%;padding:3px}.bk644 b{font-size:12.5px;color:#6B3A12;white-space:nowrap}
.lg644{justify-self:center;width:100%;max-width:220px;height:auto;filter:drop-shadow(0 3px 4px rgba(0,0,0,.2))}
.lgt644{justify-self:center;display:flex;flex-direction:column;align-items:center;background:linear-gradient(180deg,#FFF3D2,#F7D99A);border:3.5px solid #8A5A2B;border-radius:16px;padding:3px 14px 5px;box-shadow:0 4px 0 #6B4220;line-height:1.1}
.lgt644 small{font-size:10.5px;font-weight:900;color:#7A4A1A}.lgt644 b{font-size:24px;font-weight:900;color:#5A2E0C;letter-spacing:1px;white-space:nowrap}
.cy644{display:flex;align-items:center;gap:3px;border:3px solid #fff;background:#fff;border-radius:16px;padding:4px 8px;font:inherit;box-shadow:0 3px 0 #BFD3E6}
.cy644 img{width:22px;height:22px;object-fit:contain}.cy644 b{font-size:14px;color:#2F6FA3}.cy644.got{filter:grayscale(1);opacity:.7}
.as644{justify-self:center;background:linear-gradient(180deg,#FFF8E6,#F2DDAE);border:3px solid #9A6A34;border-radius:14px;padding:4px 14px;box-shadow:0 3px 0 #7A4E22}
#zq644.aq .as644{background:linear-gradient(180deg,#EAF8FF,#BFE6F7);border-color:#2F6FA3;box-shadow:0 3px 0 #1F4F7A}
.as644 b{font-size:15px;color:#5A3A1A;white-space:nowrap}#zq644.aq .as644 b{color:#1F4F7A}.as644.sm b{font-size:13px}
.as644.pop{animation:pbp639 .4s}
/* トップ */
.ts644{position:relative;z-index:2;flex:1;min-height:0}
.tz644{position:absolute;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,.15))}
.tz644.a{right:-4%;bottom:34%;height:52%}.tz644.b{left:-6%;bottom:38%;height:30%;opacity:.95}
.tz644.c{right:4%;top:6%;height:30%;opacity:.9;animation:fl644 5s ease-in-out infinite alternate}.tz644.d{left:6%;top:12%;height:16%;animation:fl644 4s ease-in-out infinite alternate-reverse}
@keyframes fl644{to{transform:translate(10px,-10px)}}
.hn644{position:absolute;width:110px;aspect-ratio:154/270}
.hn644 i,.hw644 i{display:block;width:100%;height:100%;background-size:600% 100%;background-repeat:no-repeat;background-position:40% 0}
.hn644.top{left:16%;bottom:14%;width:30%;max-width:150px}
.gd644{position:absolute;bottom:12%;border:none;background:none;padding:0;animation:hop639 1.8s ease-in-out infinite}
.gd644 img{width:100%;height:auto;filter:drop-shadow(0 4px 3px rgba(0,0,0,.2))}
.gd644.g0{left:48%;width:28%;max-width:140px}.gd644.g1{left:72%;width:24%;max-width:120px;animation-delay:.6s}
#zq644.aq .gd644.g0{left:52%;width:40%;max-width:190px;bottom:22%}
.bb644{position:absolute;z-index:4;width:160px;background:#fff;border:3px solid #6B4A2A;border-radius:16px;padding:5px 8px;font-size:13px;font-weight:900;color:#4A3420;text-align:center}
.bb644.pop{animation:pbp639 .35s}
.tb644{position:relative;z-index:3;display:flex;gap:8px;padding:0 10px calc(14px + env(safe-area-inset-bottom))}
.go644{flex:1;display:flex;flex-direction:column;align-items:center;border:4px solid #fff;border-radius:22px;padding:10px 6px;font:inherit;background:linear-gradient(180deg,#FFC65A,#F29A2E);box-shadow:0 5px 0 #B5651C,0 8px 14px rgba(0,0,0,.2);color:#fff;text-shadow:0 2px 0 rgba(120,60,0,.4)}
#zq644.aq .go644{background:linear-gradient(180deg,#6FD0F5,#2C8FD0);box-shadow:0 5px 0 #1F5F95,0 8px 14px rgba(0,0,0,.2);text-shadow:0 2px 0 rgba(0,40,90,.4)}
.go644 span{font-size:20px;font-weight:900}.go644 small{font-size:11px;font-weight:800;opacity:.95}
.go644:disabled{filter:grayscale(.8);opacity:.8}
.zk644{flex:none;width:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px solid #fff;border-radius:22px;background:#FFF8EA;font:inherit;box-shadow:0 5px 0 #CDB48C}
.zk644 img{width:46px;height:46px;object-fit:contain}.zk644 b{font-size:12px;color:#6B4A2A}
/* あるく */
.sc644{position:relative;flex:1;min-height:0;z-index:1;user-select:none;-webkit-user-select:none;cursor:pointer}
.wd644{position:absolute;left:0;bottom:21%;height:58%;width:10px;will-change:transform}
.an644{position:absolute;bottom:0;width:190px;height:100%;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center}
.ai644{position:relative;display:flex;align-items:flex-end;justify-content:center;max-width:100%}.ai644.sw{margin-bottom:13vh;animation:fl644 3.6s ease-in-out infinite alternate}
.an644 img{max-width:100%;max-height:min(250px,36vh);object-fit:contain;filter:drop-shadow(0 6px 4px rgba(0,0,0,.18))}
.an644 img.tmp{max-height:min(170px,25vh)}.ai644.sw img{max-height:min(170px,25vh)}
.an644.done img{opacity:.9}
.an644.gold img{filter:drop-shadow(0 0 8px #FFD24A) drop-shadow(0 0 16px #FFC400)}
.ex644{position:absolute;top:-6px;left:50%;margin-top:-58px;transform:translateX(-50%);width:54px;height:54px;border-radius:50%;border:4px solid #fff;background:#FF7A45;color:#fff;font:inherit;font-size:30px;font-weight:900;box-shadow:0 4px 0 #C94A22,0 0 0 6px rgba(255,122,69,.3);animation:ex644 .8s ease-in-out infinite alternate;z-index:3}
.ex644.gold{background:linear-gradient(#FFE27A,#F2B514);box-shadow:0 4px 0 #B5800C,0 0 18px 6px rgba(255,210,74,.8)}
@keyframes ex644{to{transform:translateX(-50%) translateY(-8px) scale(1.08)}}
.end644{position:absolute;bottom:0;transform:translateX(-50%);background:#fff;border:3px solid #6B4A2A;border-radius:12px;padding:6px 12px;font-weight:900;color:#6B4A2A}
.hw644{position:absolute;left:22%;bottom:12%;width:24%;max-width:120px;aspect-ratio:154/270;transform:translateX(-50%);z-index:3;pointer-events:none}
.hw644.flip i{transform:scaleX(-1)}
.hw644.mv{animation:bob644 .38s ease-in-out infinite alternate}
@keyframes bob644{to{translate:0 -3px}}
.hb644{position:absolute;bottom:102%;left:20%;width:max-content;max-width:180px;background:#fff;border:3px solid #6B4A2A;border-radius:16px;padding:5px 10px;font-size:13px;font-weight:900;color:#4A3420;animation:pbp639 .35s}
.hb644::after{content:"";position:absolute;bottom:-12px;left:22%;border:7px solid transparent;border-top:9px solid #6B4A2A}
.tip644{position:absolute;left:8px;right:8px;bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:4px;font-size:10.5px;font-weight:900;color:#6B4A2A;pointer-events:none}
.tip644 span{background:rgba(255,255,255,.85);border-radius:99px;padding:3px 9px}.tip644 b{background:rgba(255,255,255,.7);border-radius:99px;padding:2px 8px;font-size:9.5px;text-align:center}
.rt644{position:relative;z-index:3;display:flex;align-items:center;justify-content:center;gap:2px;background:rgba(255,253,246,.96);border-top:3px solid #F1D9AA;padding:6px 8px calc(8px + env(safe-area-inset-bottom))}
.rt644 span{width:46px;height:46px;border-radius:50%;background:#fff;border:3px solid #E6D6BB;display:flex;align-items:center;justify-content:center;overflow:hidden}
.rt644 span img{width:90%;height:90%;object-fit:contain;filter:brightness(0) opacity(.25)}
.rt644 span.d img,.rt644 span.c img{filter:none}.rt644 span.c{border-color:#F2A33A;box-shadow:0 0 0 3px rgba(242,163,58,.3)}
.rt644 span.g{border-color:#FFD24A}.rt644 span.g img{filter:brightness(0) sepia(1) saturate(5) hue-rotate(5deg) opacity(.6)}.rt644 span.g.d img,.rt644 span.g.c img{filter:drop-shadow(0 0 3px #FFC400)}
.rt644 i{width:8px;height:3px;background:#E6D6BB}
.rt644 b{margin-left:6px;font-size:12px;color:#6B4A2A;white-space:nowrap}
/* クイズ */
.qs644{position:relative;flex:1;min-height:200px;z-index:1}
.qa644{position:absolute;right:2%;bottom:6%;height:86%;max-width:68%;object-fit:contain;filter:drop-shadow(0 6px 5px rgba(0,0,0,.2));animation:fl644 4s ease-in-out infinite alternate}
.qa644.tmp{height:62%}
.qs644.gold .qa644{filter:drop-shadow(0 0 10px #FFD24A) drop-shadow(0 0 22px #FFC400)}
.hn644.q{left:2%;bottom:2%;width:28%;max-width:120px}
.qb644{position:absolute;left:4%;top:8%;max-width:44%;background:#fff;border:3px solid #6B4A2A;border-radius:16px;padding:5px 9px;font-size:12.5px;font-weight:900;color:#4A3420}
.pv644{position:absolute;right:8px;top:6px;display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.92);border-radius:12px;padding:4px 6px;box-shadow:0 2px 6px rgba(0,0,0,.15)}
.pv644 span{font-size:9.5px;font-weight:900;color:#8A5A12;line-height:1.3}
.qc644{position:relative;z-index:2;background:rgba(255,252,242,.98);border-top:4px solid #F1D9AA;border-radius:22px 22px 0 0;padding:10px 10px calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;box-shadow:0 -6px 16px rgba(0,0,0,.12)}
#zq644.aq .qc644{border-top-color:#9FD3EE;background:rgba(244,251,255,.98)}
.qh644{display:flex;align-items:center;gap:6px}.nm644{background:#F2A33A;color:#fff;border-radius:99px;padding:2px 12px;font-weight:900;font-size:13px}#zq644.aq .nm644{background:#2F8FD0}
.st644{color:#FFB400;font-size:14px;letter-spacing:1px}
.qt644{font-size:19px;font-weight:900;color:#3A2E22;text-align:center;line-height:1.45;padding:2px 4px}
.op644{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.op644 button{min-height:64px;border:3px solid #fff;border-radius:16px;font:inherit;font-weight:900;font-size:15px;line-height:1.25;color:#3A2E22;padding:6px 4px;word-break:keep-all;overflow-wrap:anywhere;box-shadow:0 4px 0 rgba(0,0,0,.12)}
.op644 button:nth-child(1){background:#FFE1E8}.op644 button:nth-child(2){background:#DDEFFF}.op644 button:nth-child(3){background:#E2F6DC}
.op644 button:disabled{opacity:.4}.op644 button.ok{opacity:1;outline:4px solid #3BAF6A;background:#C9F0D2}.op644 button.ng{opacity:1;outline:4px solid #E8414B}
.ht644{align-self:center;display:flex;align-items:center;gap:2px;border:none;background:#FFF3D2;border-radius:99px;padding:3px 12px 3px 4px;font:inherit;font-size:12px;font-weight:900;color:#B5701C}
.ht644 img{width:34px;height:34px;object-fit:contain}
.rw644,.xp644{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.rw644 h3{margin:0;font-size:24px;color:#E8604A}.rw644.gold h3{color:#D4A017}
.mm644{margin:0;font-size:13px;font-weight:800;color:#5A4430}.gp644{margin:0;font-size:18px;font-weight:900;color:#D2601E}
.nc644{display:flex;flex-direction:column;align-items:center;gap:4px}.nc644>b{color:#B5701C}
.xh644{display:flex;align-items:center;gap:6px}.xh644 img{width:48px;height:48px;object-fit:contain}.xh644 b{font-size:16px;color:#2F6FA3}
.xp644 p{margin:0;font-size:14px;font-weight:800;line-height:1.6;color:#3A2E22}.xp644 small{color:#B23}
.rw644 .btn,.xp644 .btn{width:100%}
/* カード */
.cd644{position:relative;width:118px;background:#fff;border:4px solid #F2C46B;border-radius:14px;padding:5px 5px 6px;display:flex;flex-direction:column;align-items:center;gap:2px;box-shadow:0 3px 6px rgba(0,0,0,.12)}
.cd644.aq{border-color:#8FD0EE;background:linear-gradient(#FFFFFF,#EEF9FF)}
.cd644.aq::before{content:"";position:absolute;right:-8px;top:-9px;width:22px;height:20px;background:radial-gradient(circle at 50% 100%,#FFC6CF 0 60%,transparent 62%),repeating-conic-gradient(from -60deg at 50% 100%,#F79AAE 0 6deg,#FFD9E0 6deg 14deg);border-radius:50% 50% 4px 4px;clip-path:polygon(50% 100%,0 20%,20% 0,80% 0,100% 20%)}
.ci644{width:100%;aspect-ratio:4/3;border-radius:9px;background:linear-gradient(#EAF6E3,#F9F3E3);display:flex;align-items:center;justify-content:center;overflow:hidden}
.cd644.aq .ci644{background:linear-gradient(#CDEBFA,#EAF8FF)}
.ci644 img{max-width:92%;max-height:92%;object-fit:contain}
.cd644 b{font-size:12.5px;color:#4A3420}.cd644 small{font-size:9.5px;color:#6B5540;line-height:1.35;text-align:center}.cd644 em{font-style:normal;font-size:9px;color:#8A8A8A}
.cd644.sh .ci644 img{filter:brightness(0) opacity(.22)}
.cd644.gold{border-color:#FFD24A;background:linear-gradient(135deg,#FFF6D0,#FFFDF2 40%,#FFF0B8);box-shadow:0 0 0 2px #FFF2B0,0 0 12px rgba(255,200,0,.6)}
.cd644.gold::after{content:"";position:absolute;inset:0;border-radius:10px;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.7) 45%,transparent 60%);background-size:250% 100%;animation:shine634 2.6s linear infinite;pointer-events:none}
.cd644.mini{width:58px;padding:3px;border-width:3px}
/* けっか・ずかん */
.rc644,.zg644{position:relative;z-index:2;margin:calc(10px + env(safe-area-inset-top)) 10px 14px;background:rgba(255,252,244,.97);border-radius:22px;padding:12px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.rc644 h2{margin:0;color:#E8604A;font-size:24px}
.hn644.rs{position:relative;margin:0 auto;width:90px}
.sc644t{margin:4px 0 0;font-weight:900;color:#6B4A2A}.pt644{font-size:26px;font-weight:900;color:#D2601E}
.cg644>b{display:block;color:#B5701C;margin:4px 0}.cg644>div{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.cr644{margin:8px 0 0;font-size:12.5px;font-weight:900;color:#8A8A8A}.cr644.ok{color:#2F6FA3}.pf644{margin:4px 0 0;font-weight:900;color:#D4A017}
.rb644{display:flex;flex-direction:column;gap:6px;margin-top:10px}.rb644 .btn{width:100%}
.zg644{margin-top:8px;text-align:left}.zg644 h4{margin:8px 2px 4px;color:#6B4A2A;font-size:13px}.zg644>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.zg644 .cd644{width:auto}
.zc644{position:relative;z-index:2;text-align:center;font-weight:900;color:#D4A017;margin:0 10px 14px}.zc644.s{color:#6B4A2A}

/* v6.45：エリアの はいけい（イラスト） */
.bg644 .l1,.bg644 .l2,.bg644 .l3{display:none!important}
.bg644{background-color:#CFE9F7;background-repeat:repeat-x;background-size:auto 100%;background-position:calc(var(--px,0px) * .8) 100%}
.bg644.top,.bg644.q{background-size:cover;background-position:50% 100%;background-repeat:no-repeat}
.bg644.sav{background-image:url(./assets/images/v645/tile_sav.webp)}.bg644.sav.top,.bg644.sav.q{background-image:url(./assets/images/v645/bg_sav.webp)}
.bg644.forest{background-image:url(./assets/images/v645/tile_forest.webp)}.bg644.forest.top,.bg644.forest.q{background-image:url(./assets/images/v645/bg_forest.webp)}
.bg644.north{background-image:url(./assets/images/v645/tile_north.webp)}.bg644.north.top,.bg644.north.q{background-image:url(./assets/images/v645/bg_north.webp)}
.bg644.bird{background-image:url(./assets/images/v645/tile_bird.webp)}.bg644.bird.top,.bg644.bird.q{background-image:url(./assets/images/v645/bg_bird.webp)}
.bg644.coral{background-image:url(./assets/images/v645/tile_coral.webp)}.bg644.coral.top,.bg644.coral.q{background-image:url(./assets/images/v645/bg_coral.webp)}
.bg644.tunnel{background-image:url(./assets/images/v645/tile_tunnel.webp)}.bg644.tunnel.top,.bg644.tunnel.q{background-image:url(./assets/images/v645/bg_tunnel.webp)}
.bg644.jelly{background-image:url(./assets/images/v645/tile_jelly.webp)}.bg644.jelly.top,.bg644.jelly.q{background-image:url(./assets/images/v645/bg_jelly.webp)}
.bg644.shore{background-image:url(./assets/images/v645/tile_shore.webp)}.bg644.shore.top,.bg644.shore.q{background-image:url(./assets/images/v645/bg_shore.webp)}

#zq644.zoo .bg644.rare{background-image:url(./assets/images/v645/tile_sav.webp);filter:sepia(.35) saturate(1.3) brightness(1.08)}#zq644.zoo .bg644.rare.q{background-image:url(./assets/images/v645/bg_sav.webp)}
#zq644.aq .bg644.rare{background-image:url(./assets/images/v645/tile_tunnel.webp);filter:hue-rotate(-20deg) saturate(1.2)}#zq644.aq .bg644.rare.q{background-image:url(./assets/images/v645/bg_tunnel.webp)}
#zq644.aq .bg644 .ray{opacity:.6}
.w644.zk .bg644,.w644.rs .bg644{filter:blur(2px) brightness(1.05)}
.lg644{max-width:230px}

/* v6.46：トップの イラスト・ボタン */
.t646{background:#9FD3EA}
.tbg646{position:absolute;inset:-20px;background-size:cover;background-position:center;filter:blur(14px) brightness(1.05);z-index:0}
.tim646{position:absolute;left:50%;top:0;height:100%;aspect-ratio:2/3;transform:translateX(-50%);z-index:1}
.tim646>img{width:100%;height:100%;object-fit:cover;display:block}
.gz646{position:absolute;border:none;background:none;padding:0;border-radius:40%;-webkit-tap-highlight-color:transparent;cursor:pointer}
.gz646:active{background:rgba(255,255,255,.18)}
.t646 .hd644,.t646 .tb644{z-index:3}
.t646 .ts644{z-index:2;pointer-events:none}
.t646 .bb644{z-index:4}
.go644.g646{position:relative;background-color:transparent!important;background-position:center!important;background-size:100% 100%!important;background-repeat:no-repeat!important;border:none!important;box-shadow:none!important;aspect-ratio:720/220;padding:0 22% 2px 21%!important;justify-content:center;filter:drop-shadow(0 6px 6px rgba(0,0,0,.25));transition:transform .1s}
.go644.g646:active{transform:translateY(3px) scale(.98)}
.go644.g646 span{font-size:clamp(15px,5vw,21px);line-height:1.15;white-space:nowrap}
.go644.g646 small{font-size:clamp(9px,2.8vw,11.5px)}
.go644.g646.zoo{color:#6B3A12;text-shadow:0 2px 0 #FFF3D2}
.go644.g646.aq{color:#fff;text-shadow:0 2px 0 #1F5F95,0 0 6px #2C8FD0}
.go644.g646:disabled{filter:grayscale(.7) opacity(.85)}
.zk644.z646{align-self:center;width:76px;height:76px;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 0 #CDB48C,0 6px 10px rgba(0,0,0,.2)}
.zk644.z646.aq{background:#EAF8FF;box-shadow:0 4px 0 #8FBFE0,0 6px 10px rgba(0,0,0,.2)}
.zk644.z646 img{width:38px;height:38px}
.t646 .tb644{align-items:center;padding-bottom:calc(10px + env(safe-area-inset-bottom))}
.t646 .tb644{gap:6px;padding-left:6px;padding-right:6px}.go644.g646{flex:1 1 0!important;min-width:0;width:auto;padding:0 20% 2px 23%!important}.go644.g646 span{font-size:clamp(15px,4.6vw,20px)!important;line-height:1.1;text-align:center}.go644.g646 small{margin-top:1px}.zk644.z646{flex:none!important;width:68px!important;height:68px!important}
@media (max-height:640px){ .qt644{font-size:16px} .op644 button{min-height:54px;font-size:14px} }
`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();

/* =====================================================================
   まなびタウン v6.47
   ・どうぶつえん／すいぞくかん：のこり 4しゅるいの 水彩・「！」の いち・ゴールの かんばん
   ・ホームの ロゴを 大きく
   ・能力の実：のうりょくの すぐ下に だす／あげても がめんが もどらない
   ・住民の おねがい：12じかんで きえる（かなえられる おねがいは のこす）
   ===================================================================== */
(function(){
'use strict';
const VER = '6.48.0', I7 = './assets/images/v647/';
/* ---------- どうぶつ ---------- */
try{ const Z = window.__zq644; if(Z){ const add = {pelican:'an_pelican', parrot:'an_parrot', crab:'an_crab', hermit:'an_hermit'};
  [Z.PLACE.zoo, Z.PLACE.aq].forEach(P => P.an.forEach(a => { if(add[a[0]]) a[3] = 'v647:' + add[a[0]]; })); } }catch(e){ console.warn(e); }
/* ---------- 能力の実 ---------- */
const FB = () => save.fruits || {};
function placeFruit(){
  const body = document.querySelector('#dlgBody'); if(!body) return; const fp = body.querySelector('.fruitPanel'); if(!fp || fp.dataset.v647) return;
  fp.dataset.v647 = 1; const ab = body.querySelector('.abList'); if(ab) ab.after(fp);
  fp.querySelectorAll('[data-feed] small').forEach(sm => { const m = sm.textContent.match(/(\d+)\s*→\s*(\d+)/); if(m) sm.textContent = `${m[1]}→${m[2]}`; });
}
new MutationObserver(() => placeFruit()).observe(document.body, {childList:true, subtree:true});
window.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-feed]'); if(!b || !b.closest('#dlgBody')) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const [rid, k] = b.dataset.feed.split('|'), r = save.town.res.find(x => x.id===rid), B = FB(); if(!r || !B[k]) return;
  B[k]--; r.ab[k] = (r.ab[k]||0) + 1; persist(); sound('ok');
  const body = document.querySelector('#dlgBody'), ab = body.querySelector('.abList'); if(ab) ab.innerHTML = abBars(r);
  const fp = body.querySelector('.fruitPanel'); if(fp){ fp.querySelectorAll('[data-feed]').forEach(x => { const kk = x.dataset.feed.split('|')[1], a2 = ABILITIES.find(q => q.id===kk), n = B[kk]||0;
      const bb = x.querySelector('b'); if(bb) bb.textContent = '×' + n; const sm = x.querySelector('small'); if(sm && a2) sm.textContent = `${r.ab[kk]||0}→${(r.ab[kk]||0)+1}`; x.disabled = !n; });
    b.classList.remove('fed647'); void b.offsetWidth; b.classList.add('fed647'); b.querySelector('.up647')?.remove(); b.insertAdjacentHTML('beforeend', '<i class="up647">+1</i>'); }
  const ai = ABILITIES.findIndex(a => a.id===k), row = ab && ab.querySelectorAll('.abRow')[ai]; if(row){ row.classList.add('fed647'); }
  toast(`${r.name}の ${ABILITIES[ai] ? ABILITIES[ai].n : ''}が ${r.ab[k]}に あがった！`);
  try{ renderCurrent(); }catch(_){}
}, true);
/* ---------- 住民の おねがい：じかんぎれ ---------- */
const REQ_LIFE = 12*60*60*1000;
const leftOf = q => (q.at||Date.now()) + REQ_LIFE - Date.now();
try{
  reqTick = (orig => function(){
    try{ const D = reqData(), t = save.town; const gone = [];
      D.list = D.list.filter(q => { if(!q.at){ q.at = Date.now(); return true; } let done = false; try{ done = reqDone(q); }catch(_){} if(done || leftOf(q) > 0) return true; gone.push(q); return false; });
      if(gone.length){ persist(); const r = t && t.res.find(x => x.id===gone[0].rid); setTimeout(() => toast(`${r ? r.name + 'の ' : ''}おねがいは おわったよ。また たのみに くるかも！`), 600); }
    }catch(e){ console.warn(e); }
    return orig.apply(this, arguments);
  })(reqTick);
}catch(e){ console.warn('req647', e); }
const hrs = ms => ms >= 3600e3 ? `あと ${Math.ceil(ms/3600e3)}じかん` : `あと ${Math.max(1, Math.ceil(ms/60e3))}ぷん`;
function stampReq(){
  try{ const D = reqData(); document.querySelectorAll('[data-reqrow]').forEach(row => { const q = D.list.find(x => x.rid===row.dataset.reqrow); if(!q || row.querySelector('.tl647')) return;
    let done = false; try{ done = reqDone(q); }catch(_){} if(done) return;
    const ms = leftOf(q), sm = row.querySelector('.reqT small'); if(sm) sm.insertAdjacentHTML('beforeend', `<em class="tl647 ${ms < 2*3600e3 ? 'soon' : ''}">⏳${hrs(ms)}</em>`); }); }catch(e){}
}
try{ renderReqPanel = (orig => function(){ const o = orig.apply(this, arguments); stampReq(); return o; })(renderReqPanel); }catch(e){}
setInterval(() => { if(typeof curScreen!=='undefined' && curScreen==='town' && !document.hidden){ try{ const D = reqData(), n = D.list.length; reqTick(); if(D.list.length !== n){ renderReqPanel(); try{ markRequests(); }catch(_){} } }catch(_){} } }, 60000);

const css = document.createElement('style');
css.textContent = `

/* v6.48 */
.an644 img{max-height:calc(min(250px,36vh) * var(--sc,1))!important}
.an644 img.tmp,.ai644.sw img{max-height:calc(min(170px,25vh) * var(--sc,1) * 1.4)!important}
.ai644{--sc:1}
.bg644.fade648{opacity:0;transition:opacity .85s ease}.bg644.fade648.in{opacity:1}
.zk644.z646 b{white-space:nowrap;font-size:11.5px;letter-spacing:0;line-height:1.1}
.zk644.z646{padding:0!important}
/* ！を まるの まんなかに */
.ex644{display:flex!important;align-items:center;justify-content:center;padding:0!important;line-height:1!important;font-size:0!important}
.ex644::before{content:"";width:8px;height:22px;border-radius:4px;background:#fff;margin-top:-8px;box-shadow:0 1px 0 rgba(0,0,0,.15)}
.ex644::after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#fff;transform:translate(-50%,11px)}
/* ゴール */
.end644{background:url(${I7}goal.webp) center/contain no-repeat!important;border:none!important;width:150px;height:150px;padding:0!important;display:flex;align-items:center;justify-content:center;border-radius:0!important}
.end644 b{display:block;white-space:nowrap;font-size:22px;color:#6B3A12;text-shadow:0 2px 0 #FFF3D2;margin-top:6px;letter-spacing:2px}
/* ホームの ロゴ */
body.scr-home #btnBack{display:none!important}
body.scr-home #topbar .sign.logo img.mainLogo{max-height:88px!important;height:88px!important;max-width:min(58vw,300px)!important}
body.scr-home #topbar{min-height:96px;align-items:center}
@media (max-width:360px){ body.scr-home #topbar .sign.logo img.mainLogo{max-height:72px!important;height:72px!important} }
/* 能力の実 */
#dlgBody .fruitPanel{margin:8px 0 4px}
#dlgBody .fruitPanel .fruitGrid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important}
#dlgBody .fruitPanel .fruitGrid button{position:relative;padding:4px 1px!important;min-width:0}
#dlgBody .fruitPanel .fruitGrid button span{font-size:9.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#dlgBody .fruitPanel .fruitGrid button small{font-size:9px!important;white-space:nowrap}
#dlgBody .fruitPanel .fruitGrid img{width:34px!important;height:34px!important}
.fed647{animation:fed647 .6s ease-out}
@keyframes fed647{0%{transform:scale(1)}40%{transform:scale(1.12);background:#FFF3C4}100%{transform:scale(1)}}
.up647{position:absolute;left:50%;top:-4px;transform:translateX(-50%);font-style:normal;font-weight:900;color:#E8604A;font-size:15px;animation:up647 .9s ease-out forwards;pointer-events:none}
@keyframes up647{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-24px)}}
.abRow.fed647{border-radius:8px}
/* おねがいの のこり じかん */
.tl647{font-style:normal;margin-left:6px;color:#7A8A9A;font-weight:800}.tl647.soon{color:#E8604A}
`;
document.head.appendChild(css);
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
})();
