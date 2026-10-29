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
function twAsk(m,f){
  return new Promise(res=>{
    const hx=hisBonus(m), sec=twSec(f)+hx, ans=m.ansF||m.ans, id='tw'+Date.now(); let left=sec, end=false;
    const fin=v=>{ if(end) return; end=true; clearInterval(tm); $('#dlg').classList.remove('show'); res(v); };
    dialog(`<div class="twQHead">${twImg('tower_big','twQTower')}<div><b>${f}<small>かい</small></b><span>${'★'.repeat(twBand(f))}${'☆'.repeat(4-twBand(f))}</span></div><div class="twTime"><i id="${id}b"></i><em id="${id}">${sec}</em></div></div>${hx?`<div class="hisTag51">✏️ ひっさん タイム ＋${hx}びょう</div>`:''}${m.html}${m.say&&!/data-say/.test(m.html)?sayBtn(m.say):''}`,
      m.opts.map(o=>({label:esc(o),cls:'white big',v:o})).concat([{label:'ここで やめる（つづきから できる）',cls:'white twQuit',v:'__quit'}]),'wide quiz towerQuiz').then(v=>{ if(end) return; end=true; clearInterval(tm);
        if(v==='__quit'||v==null) return res('quit'); const ok=v===ans; sound(ok?'ok':'ng'); if(m.wk&&ok)delWeak(m.wk); if(m.kq)addStat(m.kq,'read',ok,1); persist(); res(ok?'ok':'ng'); });
    const tm=setInterval(()=>{ left--; const e=$('#'+id), b=$('#'+id+'b'); if(e) e.textContent=Math.max(0,left); if(b){ b.style.width=Math.max(0,left/sec*100)+'%'; b.classList.toggle('hurry',left<=5); }
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
   <div class="twRule"><span>⏳ 1もん ${twSec(T.floor)}びょう（ひっさんは ＋15）</span><span>✔ せいかいで 1かい 上へ</span><span>✖ まちがい・じかんぎれは 1かいから</span><span>⏸ やめた ときは つづきから</span></div>
   <div class="twGoal">${twImg('itm_superletter')}<div><b>100かいの ごほうび</b><small>超レアかくていレター（まいかい）・天空の おうかん（はじめて）</small></div></div>`;
}
async function towerLobby(key){
  if(townLevel()<8){ await dialog(`<div class="dlgArt big">${twImg('tower_big','twBigS')}</div><h2 class="dlgT">タワーは まちLv8から</h2><p class="dlgP">まちを もっと 大きくすると シマくんが おしえてくれるよ！</p>`); return; }
  const T=towerData();
  const v=await dialog(lobbyHTML(),[{label:`${T.floor}かいから のぼる！`,cls:'gold',v:'start'},...(T.floor>1?[{label:'1かいから やりなおす',cls:'white',v:'reset'}]:[]),...(key?[{label:'⬆ ビルを グレードアップ',cls:'white',v:'grade'}]:[]),{label:'とじる',v:null}],'wide towerDlg');
  if(v==='start') towerRun(key);
  if(v==='reset'){ T.floor=1; persist(); towerLobby(key); }
  if(v==='grade') openBuilding(key);
}
async function towerRun(key){
  const T=towerData(); T.tries++; twUsed.clear(); persist();
  while(true){
    const f=T.floor, m=towerQ(f), r=await twAsk(m,f);
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
MENUS.forEach(m=>{ if(m.id==='pork_sand'){ m.n='ハムエッグサンド'; m.req={cf_pork:1,cf_egg:1}; }
 if(m.id==='rainbow_cake'){ m.n='にじいろロイヤルデザート'; m.pt=600; m.req={f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}; } });
const EVENT_MENU={halloween:{id:'ev_pumpkin',n:'ハロウィンかぼちゃパイ',lv:1,pt:350,req:{f_pumpkin:3,cf_egg:1}},christmas:{id:'ev_xmas',n:'クリスマスチキン',lv:1,pt:380,req:{cf_chicken:3,f_carrot:1}},newyear:{id:'ev_osechi',n:'おしょうがつプレート',lv:1,pt:380,req:{cf_egg:2,cf_beef:1,f_carrot:1}},summer:{id:'ev_summer',n:'なつのフルーツパフェ',lv:1,pt:350,req:{f_watermelon:2,f_strawberry:1,cf_milk:1}}};
MENUS.forEach(m=>{ m.art=m.v54?'./assets/images/v54/cm_'+m.id+'.webp':IMG48+'cm_'+m.id+'.webp'; m.mult=m.id==='rainbow_cake'?3:m.lv===4?2.5:m.lv===3?2:m.lv===2?1.5:1.2; m.min=m.id==='rainbow_cake'?35:15+m.lv*5; m.buy=Math.round(m.pt*(m.id==='rainbow_cake'?2.5:1.15)); });
Object.values(EVENT_MENU).forEach(m=>{ m.art=IMG48+'cm_'+m.id+'.webp'; m.mult=2.5; m.min=30; m.buy=Math.round(m.pt*1.4); m.ev=1; });
const THEMES=[['wood','きの ぬくもり','#F2D9A8'],['cute','いちご','#FFC3D5'],['natural','もり','#C9EBBE'],['marine','うみ','#BDE6F7'],['luxury','ロイヤル','#DCCBFF']];
const ROUND_MS=2*60000, MAX_ROUNDS=60;
function C(){const c=save.cafe||(save.cafe={on:false,lv:1,theme:'wood',menu:['carrot_soup','tomato_soup','egg_sand'],guests:[],pals:{},sales:0,served:0,last:0});
 c.stock=c.stock||{}; c.guests=c.guests||[]; c.menu=c.menu||[]; return c;}
const matArt=k=>RMAT[k]?k:(FD(k)?.art||'ui_bulb');
const matName=k=>RMAT[k]||FD(k)?.n||k;
const handBag=k=>k.startsWith('cf_')?cafeStock():foodBag();
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
const MAT_DIFF={f_carrot:1,f_tomato:1,f_corn:2,f_potato:2,f_apple:2,f_banana:2,f_strawberry:3,f_pumpkin:3,f_coffee:3,f_watermelon:4,cf_milk:2,cf_egg:2,cf_chicken:3,cf_pork:3,cf_beef:4};
function menuScore(m){if(!m)return 0;const e=Object.entries(m.req||{});const cx=e.reduce((a,[k,n])=>a+n*(MAT_DIFF[k]||2),0)+2*Math.max(0,e.length-1);return Math.min(1,cx/16);}
const LV_PEN=[0,0,10,20,30];
function satMean(m,lv,vb){const s=menuScore(m);return 52+36*s-(LV_PEN[lv]??30)*(1-s)+(vb||0);}
function rollSat(m,c){if(Math.random()<.08)return rint(60,75);return Math.round(satMean(m,c.lv,varietyBonus(c))+rint(-15,15));}
function satChance(m,c){const mu=satMean(m,c.lv,varietyBonus(c));return .08+.92*Math.max(0,Math.min(1,(mu+15-60)/30));}
function satStars(m,c){const p=satChance(m,c);return p>=.7?3:p>=.35?2:1;}
function cafeRound(c,rate){let sales=0,served=0,happy=0;
 c.guests=c.guests.filter(g=>{g.stay=(g.stay??1)-1;if(g.stay>0)return true;const m=menuById(g.dish);sales+=Math.round((m?.pt||60)*rate*(g.sat>=60?1:.8))+(g.tip||0);served++;if(g.sat>=60)happy++;return false;});
 const sel=c.menu.map(menuById).filter(Boolean),seats=tablesOpen()*4,used=new Set(c.guests.map(g=>g.seat)),free=[...Array(seats).keys()].filter(i=>!used.has(i)).sort(()=>Math.random()-.5);
 const pop=Math.min(.1,(c.happy||0)*.0008);
 free.forEach(seat=>{if(Math.random()>ARR_P+pop)return;const ok=sel.filter(m=>canMake(m,c.stock));if(!ok.length)return;const m=choice(ok);take(m,c.stock);
  const g=newGuest();Object.assign(g,{seat,dish:m.id,stay:rint(1,3),sat:rollSat(m,c),q:Math.random()<.65,qd:false});c.guests.push(g);});
 return {sales,served,happy};}
function refreshGuests(){}   // いぜんの「すぐ 来る」しくみは つかわない
function cafeTick(force){const c=C();if(!c.on)return null;const now=Date.now();if(!c.last)c.last=now;
 let rounds=Math.min(Math.floor((now-c.last)/ROUND_MS),MAX_ROUNDS);if(!rounds)return null;c.last=rounds>=MAX_ROUNDS?now:c.last+rounds*ROUND_MS;
 const rate=1+(c.lv-1)*.1;let sales=0,served=0,happy=0;
 for(let r=0;r<rounds;r++){const o=cafeRound(c,rate);sales+=o.sales;served+=o.served;happy+=o.happy;}
 if(served){c.sales+=sales;c.served+=served;c.happy=(c.happy||0)+happy;c.today=c.today&&c.today.d===dayKey()?c.today:{d:dayKey(),pt:0,n:0,h:0};c.today.pt+=sales;c.today.n+=served;c.today.h=(c.today.h||0)+happy;givePts(sales,'おうちカフェの うりあげ');}
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
const CAFE_UP=[null,{h:15,p:1200},{h:50,p:2400},{h:120,p:3600}];window.CAFE_UP=CAFE_UP;
async function cafeOpen(){const c=C();if(!c.on)return openCafeShop();cafeTick();
 const sel=c.menu.map(menuById).filter(Boolean),left=sel.reduce((a,m)=>a+Math.max(0,servings(m)),0),td=c.today&&c.today.d===dayKey()?c.today:{pt:0,n:0};
 const v=await dialog(`<div class="cafeHead48">${imgTag('cafe_sign')}<div><b>おうちカフェ Lv${c.lv}</b><small>4人がけの 机 ${tablesOpen()}つ（${tablesOpen()*4}せき）</small><small class="${left?'ok':'ng'}">${left?`えいぎょうちゅう・あと ${left}さら つくれる`:'ざいりょうぎれ（のうひんしてね）'}</small></div></div>
  <div class="cafeStats48"><span>きょうの うりあげ<b>${nf(td.pt)}pt</b></span><span>きょうの おきゃくさん<b>${td.n}人</b></span><span>まんぞくした おきゃくさん<b>${nf(c.happy||0)}人</b></span></div>${c.lv<4?(()=>{const U=CAFE_UP[c.lv],h=c.happy||0;return `<div class="up51"><small>Lv${c.lv+1}まで：まんぞく ${Math.min(h,U.h)}/${U.h}人 ・ ${nf(U.p)}pt</small><i><b style="width:${Math.min(100,h/U.h*100)}%"></b></i></div>`;})():''}
  <div class="cafeMenuNow48">${sel.length?sel.map(m=>`<span>${imgTag(m.art)}<small>${esc(m.n)}<br>あと${Math.max(0,servings(m))}</small></span>`).join(''):'<small>メニューを えらんでね</small>'}</div>
  <p class="dlgP facNote">カフェは いつも えいぎょうちゅう。おきゃくさんは すこしずつ 来るよ。<br>机（せき）が おおいほど たくさん 来るよ。<br><b>？の ふきだしの おきゃくさんを タッチすると 問題を 出してくれるよ。せいかいすると まんぞく＆チップ！</b></p>`,
  [{label:`${imgTag('cafe_crate','btnIc48')} メニューと ざいりょう`,cls:'gold',v:'menu'},{label:`${imgTag('cafe_coffee','btnIc48')} じぶんで 買って 食べる`,cls:'gold',v:'eat'},{label:'🎨 机の 柄',cls:'white',v:'theme'},...(c.lv<4?[{label:`⬆ Lv${c.lv+1}へ<span class="nw">（${nf(CAFE_UP[c.lv].p)}pt）</span>`,cls:(c.happy||0)>=CAFE_UP[c.lv].h&&save.points.bal>=CAFE_UP[c.lv].p?'gold':'white',v:'up'}]:[]),...(inCafe()&&curScreen==='myhome'?[]:[{label:'カフェの へやへ',cls:'white',v:'go'}]),{label:'とじる',v:null}],'wide cafeDlg48');
 if(v==='menu')cafeMenu();if(v==='eat')cafeBuy();if(v==='theme')cafeTheme();
 if(v==='go'){if(curScreen!=='myhome')show('myhome');if(homeEdit)endHomeEdit(true);switchRoom('cafe');}
 if(v==='up'){const U=CAFE_UP[c.lv],p=U.p;if((c.happy||0)<U.h){await dialog(`<div class="dlgArt">${imgTag('cafe_sign')}</div><h2 class="dlgT">まだ レベルアップ できないよ</h2><p class="dlgP">まんぞくして かえった おきゃくさんが <b>${U.h}人</b> ひつようだよ。<br>いまは <b>${c.happy||0}人</b>。あと ${U.h-(c.happy||0)}人！</p><p class="dlgP facNote">おきゃくさんの 問題に せいかいすると かならず まんぞくしてくれるよ。<br>ざいりょうが おおくて むずかしい メニューほど まんぞくしやすいよ。<br>カフェの レベルが 上がると、かんたんな メニューでは まんぞく しにくく なるよ。</p>`);return cafeOpen();}if(save.points.bal<p)return toast('ポイントが たりないよ');givePts(-p,'カフェを グレードアップ');c.lv++;persist();clearTableCells();sound('fan');confetti(1200);if(curScreen==='myhome')renderMyHome();cafeOpen();}}
/* ---------- メニューと ざいりょう（のうひん） ---------- */
function menuBody(){const c=C(),sel=new Set(c.menu),all=cafeMenus(true);
 const need=new Set();c.menu.map(menuById).filter(Boolean).forEach(m=>Object.keys(m.req).forEach(k=>need.add(k)));
 const mats=[...need];
 return `<h2 class="dlgT">メニューと ざいりょう</h2>
 <div class="secT48">① お店に だす メニュー（${sel.size}/6）</div>
 <div class="cafeMenus48">${all.map(m=>{const lock=!m.ev&&m.lv>c.lv;return `<button data-cmenu="${m.id}" class="${sel.has(m.id)?'on':''} ${lock?'lk48':''}" ${lock?'disabled':''}><img src="${esc(m.art)}" alt=""><b>${esc(m.n)}</b><small>${lock?`🔒 カフェLv${m.lv}`:`${m.pt}pt${m.ev?'・イベント':''}${m.drink?'・ドリンク':''}`}</small>${lock?'':(()=>{const st=satStars(m,c);return `<em class="sat54 s${st}">まんぞく ${'★'.repeat(st)}${'☆'.repeat(3-st)}</em>`;})()}<span class="reqs48">${Object.entries(m.req).map(([k,n])=>`<i>${imgTag(matArt(k))}${n}</i>`).join('')}</span></button>`;}).join('')}</div>
 <div class="secT48">② ざいりょうを のうひんする</div>
 ${mats.length?`<div class="matList48">${mats.map(k=>{const have=handBag(k)[k]||0,st=c.stock[k]||0;return `<div class="matIt48 mat50" data-mk="${k}">${imgTag(matArt(k))}<div class="mName50"><b>${esc(matName(k))}</b><div class="cnt50"><span class="hv50"><small>てもち</small><em>${have}</em></span><i>▶</i><span class="st50"><small>カフェ</small><em>${st}</em></span></div></div><div class="mBtn50"><button data-cdel="${k}|1" ${have?'':'disabled'}>＋1</button><button data-cdel="${k}|all" ${have?'':'disabled'}>ぜんぶ</button></div></div>`;}).join('')}</div>
 <button class="btn gold delAll48" data-cdelall>まとめて ぜんぶ のうひん</button>`:'<p class="dlgP facNote">メニューを えらぶと ひつような ざいりょうが でるよ</p>'}
 <p class="dlgP facNote">やさい・くだもの・じゃがいも・コーヒーまめは 畑や 八百屋、ミルク・たまご・おにくは ぼくじょうで 手に入るよ。<br>ミルク・たまごは 八百屋、おにくは コンビニでも しいれられるよ。</p>`;}
function cafeMenu(){dialog(menuBody(),[{label:'とじる',v:1}],'wide cafeDlg48').then(()=>{if(curScreen==='myhome')renderMyHome();});}
function deliver(k,n){const B=handBag(k),have=B[k]||0,q=n==='all'?have:Math.min(have,+n);if(!q)return 0;B[k]=have-q;if(B[k]<=0)delete B[k];C().stock[k]=(C().stock[k]||0)+q;return q;}
document.addEventListener('click',e=>{const t=e.target.closest('[data-cmenu],[data-cdel],[data-cdelall]');if(!t||!t.closest('#dlgBody'))return;e.stopImmediatePropagation();const c=C();c.__wasEmpty=!cafeLeft(c);
 if(t.dataset.cmenu){const id=t.dataset.cmenu,i=c.menu.indexOf(id);if(i>=0)c.menu.splice(i,1);else if(c.menu.length<6)c.menu.push(id);else{toast('メニューは 6こまで だよ');return;}}
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
const isWaterId = id => id===RIVER || id===BRIDGE;
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
  const wat = (a,b) => a>=0 && b>=0 && a<L.cols && b<L.rows && t[`${a},${b}`]===RIVER;
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
  D4.forEach(([dx,dy,d]) => { if(c[`${x+dx},${y+dy}`]===RIVER) h = h.replace(`<i class="x x-${d}"></i>`, ''); });
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
  const pin = (p, col) => { if(!p) return ''; const [x,y] = prefXY(p); return pinSVG(x, y, col) + `<text x="${x+11}" y="${y-9}" font-size="15" font-weight="900" fill="${col}" stroke="#fff" stroke-width="3.5" paint-order="stroke">${X(p[0])}</text>`; };
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
  return `<svg class="fig56" viewBox="-4 -18 ${eras.length*W+8} ${H+16}" width="340">${h}</svg>`;
}
const SYM_NOTE = {'小・中学校':'「文」の 字の 形（文ぼうぐ・学ぶ）','高等学校':'「文」を ○で かこむ','ゆうびん局':'〒（ていしん しょうの マーク）を ○で かこむ','お寺':'卍（まんじ）は お寺の しるし','神社':'神社の 入り口の とりいの 形',
  '交番':'けいぼう 2本を ×に 組んだ 形','警察署':'交番の × を ○で かこむ','市役所':'二重丸 ◎','町や村の 役場':'丸 ○ ひとつ','温泉':'おゆから ゆげが 3本','工場':'きかいの はぐるま','図書館':'本を ひらいた 形','博物館':'たてものの 形（はしらと やね）'};
function socExp(p, v){
  const u = p.u, t = plain(p.q), ans = String(p.ans), out = {figs:[], steps:[], tip:'', why:''};
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
      if(Pv && Pv!==P){ hits.push({era:Pv[2], col:'#BFD9F5', t:`🔵 ${Pv[0]}`, tcol:'#1C6AAE'}); out.steps.push(`🔵 きみの こたえ：${X(Pv[0])} は「${X(Pv[1])}」人（${X(Pv[2])}時代）`); }
      else if(v && ERA_ALL.includes(v) && P){ hits.push({era:v, col:'#BFD9F5', t:`🔵 ${v}`, tcol:'#1C6AAE'}); } }
    if(hits.length) out.figs.unshift(eraLine(hits));
    return out;
  }
  if(u==='w_person' || u==='w_face'){ const P = WPP(p.sub) || WPP(ans) || W_PEOPLE.find(x => x[1]===ans), Pv = v ? (WPP(v) || W_PEOPLE.find(x => x[1]===v)) : null;
    if(P){ out.steps.push(`<b>${X(P[0])}</b>：${X(P[1])}${P[2] ? `（${X(P[2])}）` : ''}`); const c = CTRY(P[2]); if(c) out.figs.push(worldMap2(c[0])); }
    if(Pv && Pv!==P) out.steps.push(`🔵 きみの こたえ：${X(Pv[0])} は「${X(Pv[1])}」人`); return out; }
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
  try{ r = s==='kanji' ? kanjiExp(opt.kq, opt.kind) : s==='math' ? mathExp(p, v) : s==='soc' ? socExp(p, v) : s==='sci' ? sciExp(p, v) : bunExp(p, v); }catch(e){ console.warn('explain', e); r = null; }
  if(!r) r = {figs:[], steps:[], tip:'', why:''};
  const shw = s==='kanji' ? '' : p.type==='rem' ? String(p.ans).replace('|',' あまり ') : String(p.ans);
  const vv = v==null || v==='' ? '' : String(v).replace('|',' あまり ');
  const head = s==='kanji' ? '' : `<div class="ex56Ans"><span class="ok">⭕ 正しい こたえ <b>${X(shw)}</b></span>${vv ? `<span class="ng">❌ きみの こたえ <b>${X(vv)}</b></span>` : ''}</div>`;
  const fast = opt.sec != null && opt.sec < 3 ? '<div class="ex56Fast">⏱ こたえるのが はやすぎたかも？ もんだいを さいごまで 読んでから えらぼう</div>' : '';
  return `<div class="ex56 s-${s}"><div class="ex56Hd"><img src="${X(artSrc('bird_think')||'')}" alt=""><b>📖 シマくんの かいせつ</b><small>${SUBJ_N[s]||''}</small></div>${fast}${head}
    ${r.why ? `<div class="ex56Why">🔍 ${r.why}</div>` : ''}
    ${r.figs.filter(Boolean).length ? `<div class="ex56Fig">${r.figs.filter(Boolean).join('')}</div>` : ''}
    ${r.steps.filter(Boolean).length ? `<ol class="ex56Steps">${r.steps.filter(Boolean).map(x => `<li>${x}</li>`).join('')}</ol>` : ''}
    ${r.tip ? `<div class="ex56Tip">💡 ${r.tip}</div>` : ''}</div>`;
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
