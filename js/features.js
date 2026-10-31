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
window.__cafe61={C:()=>C(),cafeXP:c=>cafeXP(c),addXP:(c,n)=>addXP(c,n),cafePerks:()=>cafePerks(),cafeOpen:()=>cafeOpen(),menus:()=>MENUS,menuMax:()=>menuMax(),tick:()=>cafeTick()};
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
 <p class="dlgP facNote">やさい・じゃがいも・コーヒーまめは 畑や 八百屋、りんご・バナナは 木、はちみつは みつばちの すばこ、たまごは にわとりごやでも とれるよ。ミルク・おにくは ぼくじょうで 手に入るよ。<br>ミルク・たまごは 八百屋、おにくは コンビニでも しいれられるよ。</p>`;}
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
function calcDepth(){
  const t = save.town, L = townCalc().L, D = {}, q = [];
  const W = (x,y) => x<0 || y<0 || x>=L.cols || y>=L.rows || isWater(t.cells[`${x},${y}`]);
  Object.entries(t.cells).forEach(([k,id]) => { if(id!==SEA) return; const [x,y] = k.split(',').map(Number);
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) if((dx||dy) && !W(x+dx,y+dy)){ if(D[k]==null){ D[k] = 1; q.push([x,y]); } } });
  while(q.length){ const [x,y] = q.shift(), d = D[`${x},${y}`];
    for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++){ const k = `${x+dx},${y+dy}`; if(t.cells[k]===SEA && D[k]==null){ D[k] = d + 1; q.push([x+dx,y+dy]); } } }
  Object.entries(t.cells).forEach(([k,id]) => { if(id===SEA && D[k]==null) D[k] = 9; });
  /* 川・みなと・はしの となりは「かこう」：すなはまに しないで 水に する（船が とおれる） */
  Object.keys(D).forEach(k => { if(D[k]!==1) return; const [x,y] = k.split(',').map(Number);
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => { const id = t.cells[`${x+dx},${y+dy}`]; return id===RIVER || id===HARBOR || id===BRIDGE; })) D[k] = 2; });
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
  /* v6.12：川が 海に そそぐ 河口（かこう）：川の はばから 海へ ひろがりながら 色が かわる */
  const MOUTH = {};
  for(let y=0; y<L.rows; y++) for(let x=0; x<L.cols; x++){ const id = cells[`${x},${y}`]; if(id!==RIVER && id!==BRIDGE) continue;
    const d = [[0,1],[1,0],[0,-1],[-1,0]].find(([dx,dy]) => cells[`${x+dx},${y+dy}`]===SEA); if(!d) continue;
    const isW = (a,b) => [RIVER,BRIDGE,HARBOR].includes(cells[`${a},${b}`]);
    const nb = [[0,1],[1,0],[0,-1],[-1,0]].filter(([dx,dy]) => isW(x+dx,y+dy)).length;
    if(isW(x-d[0], y-d[1]) || nb <= 1) MOUTH[y*L.cols + x] = d; }
  window.__mouth612 = MOUTH;
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
    const cx = Math.floor(u), cy = Math.floor(v), MD = MOUTH[cy*L.cols + cx];
    if(MD){ const fx = u - cx, fy = v - cy, [mx,my] = MD;
      const tt = mx===1 ? fx : mx===-1 ? 1-fx : my===1 ? fy : 1-fy, sa = Math.abs((mx ? fy : fx) - .5);
      const k = sst(.35, 1, tt), wH = .27 + .25*k*k, bH = wH + .06*(1 - k);
      if(sa >= bH + .04){ D[o+3] = 0; continue; }
      const wat = 1 - sst(wH - .05, wH + .01, sa), cw = mixc(RIVW, END, sst(.2, 1, tt)), cb = mixc(BANK, SAND, k);
      const c = mixc(cb, cw, wat), al = 1 - sst(bH - .02, bH + .04, sa);
      D[o] = c[0]; D[o+1] = c[1]; D[o+2] = c[2]; D[o+3] = Math.round(al*255); continue; }
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
  Object.entries(MOUTH).forEach(([i, [mx,my]]) => { const x = i % L.cols, y = Math.floor(i / L.cols), cc = map.querySelector(`.cell[data-x="${x}"][data-y="${y}"]:not(.cov64)`); if(!cc) return;
    const dir = mx===1 ? 'to left' : mx===-1 ? 'to right' : my===1 ? 'to top' : 'to bottom', mk = `linear-gradient(${dir}, transparent 0%, transparent 38%, #000 82%)`;
    cc.querySelectorAll('.rv52').forEach(e => { e.style.webkitMaskImage = mk; e.style.maskImage = mk; }); });
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
const water = (x,y) => { const L = townCalc().L; if(x<0 || y<0 || x>=L.cols || y>=L.rows) return false; const id = save.town.cells[`${x},${y}`]; return id===SEA ? (DEPTH[`${x},${y}`]||9) >= 2 : isWater(id); };
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
  const r = wo.getBoundingClientRect();
  P.on = true; P.d0 = dist(e.touches); P.z0 = save.town.zoom || 1; P.scale = 1;
  P.cx = (e.touches[0].clientX + e.touches[1].clientX)/2; P.cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
  P.ox = (P.cx - r.left) / r.width; P.oy = (P.cy - r.top) / r.height;           // ゆびの まんなかが まちの どこか（わりあい）
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
  save.town.zoom = z; persist(); renderMap();
  /* ゆびの まんなかに あった ところが おなじ ばしょに くるように スクロール */
  requestAnimationFrame(() => { const r = wo.getBoundingClientRect(), w = wrap();
    const dx = (r.left + P.ox * r.width) - P.cx, dy = (r.top + P.oy * r.height) - P.cy;
    if(w) w.scrollLeft += dx; window.scrollBy(0, dy); });
  toast(`🔍 ${Math.round(z*100)}%`);
}
document.addEventListener('touchstart', e => { if(e.target.closest && e.target.closest('#townMapWrap')) start(e); }, {passive:false});
document.addEventListener('touchmove', e => { if(P.on) move(e); }, {passive:false});
document.addEventListener('touchend', end, {passive:true});
document.addEventListener('touchcancel', end, {passive:true});
['gesturestart','gesturechange'].forEach(n => document.addEventListener(n, e => { if(curScreen==='town') e.preventDefault(); }, {passive:false}));
/* ＋－ボタンも おなじ はんいに */
setZoom = function(z){ save.town.zoom = Math.max(ZMIN, Math.min(ZMAX, Math.round(z*100)/100)); persist(); renderMap(); };
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
