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
async function openRanch(key){const S=cafeStock(),d=dayKey(),ready=S.ranchDay!==d,g=(save.town.glv||{})[key]||0,n=2+g;
 const v=await dialog(`<div class="dlgArt big">${imgTag('bld_ranch')}</div><h2 class="dlgT">ぼくじょう</h2><div class="matRow48">${Object.entries(RMAT).map(([k,nm])=>`<span>${imgTag(k)}<b>${nm}</b><small>×${S[k]||0}</small></span>`).join('')}</div><p class="dlgP">${ready?'きょうの ざいりょうが できているよ！':'きょうの しゅうかくは おしまい。また あした！'}<br><small>グレードアップすると 1日に とれる かずが ふえるよ。<br>とれた ざいりょうは カフェの「メニューと ざいりょう」から のうひんしてね</small></p>`,(ready?[{label:`うけとる（各${n}こ）`,cls:'gold',v:'get'}]:[]).concat([{label:'⬆ グレードアップ',cls:'white',v:'grade'},{label:'とじる',v:null}]),'wide');
 if(v==='get'){Object.keys(RMAT).forEach(k=>S[k]=(S[k]||0)+n);S.ranchDay=d;persist();sound('fan');confetti(900);toast('ぼくじょうの ざいりょうを うけとった！');}
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
['beef_stew','ビーフシチュー','🥘',3,220,{cf_beef:2,f_carrot:1,f_tomato:1}],['curry','やさいカレー','🍛',3,190,{f_carrot:1,f_pumpkin:1,cf_pork:1}],['roast_chicken','ローストチキン','🍗',3,220,{cf_chicken:3}],['steak','ごほうびステーキ','🥩',3,250,{cf_beef:3}],['gratin','コーングラタン','🧀',3,200,{f_corn:2,cf_milk:2}],['fruit_tart','フルーツタルト','🥧',3,210,{f_apple:1,f_strawberry:1,cf_egg:1}],['pancake','ふわふわパンケーキ','🥞',3,190,{cf_egg:2,cf_milk:2}],['lunchbox','カフェおべんとう','🍱',3,230,{cf_chicken:1,cf_egg:1,f_carrot:1}],
['special_course','まなびスペシャル','👑',4,320,{cf_beef:2,cf_chicken:2,f_pumpkin:1}],['garden_plate','ガーデンプレート','🌿',4,270,{f_tomato:2,f_carrot:2,f_corn:2}],['royal_parfait','ロイヤルパフェ','✨',4,280,{f_strawberry:2,f_banana:1,cf_milk:2}],['family_set','なかよしファミリーセット','🍽️',4,300,{cf_pork:2,cf_egg:2,f_tomato:1}],['chef_stew','シェフのとくせいシチュー','🍲',4,310,{cf_beef:2,cf_milk:1,f_carrot:2}],['rainbow_cake','にじいろロイヤルデザート','🌈',4,600,{f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}]
].map(([id,n,i,lv,pt,req])=>({id,n,i,lv,pt,req}));
MENUS.forEach(m=>{ if(m.id==='pork_sand'){ m.n='ハムエッグサンド'; m.req={cf_pork:1,cf_egg:1}; }
 if(m.id==='rainbow_cake'){ m.n='にじいろロイヤルデザート'; m.pt=600; m.req={f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}; } });
const EVENT_MENU={halloween:{id:'ev_pumpkin',n:'ハロウィンかぼちゃパイ',lv:1,pt:350,req:{f_pumpkin:3,cf_egg:1}},christmas:{id:'ev_xmas',n:'クリスマスチキン',lv:1,pt:380,req:{cf_chicken:3,f_carrot:1}},newyear:{id:'ev_osechi',n:'おしょうがつプレート',lv:1,pt:380,req:{cf_egg:2,cf_beef:1,f_carrot:1}},summer:{id:'ev_summer',n:'なつのフルーツパフェ',lv:1,pt:350,req:{f_watermelon:2,f_strawberry:1,cf_milk:1}}};
MENUS.forEach(m=>{ m.art=IMG48+'cm_'+m.id+'.webp'; m.mult=m.id==='rainbow_cake'?3:m.lv===4?2.5:m.lv===3?2:m.lv===2?1.5:1.2; m.min=m.id==='rainbow_cake'?35:15+m.lv*5; m.buy=Math.round(m.pt*(m.id==='rainbow_cake'?2.5:1.15)); });
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
function varietyBonus(c){const n=c.menu.map(menuById).filter(m=>m&&servings(m)>0).length;return Math.min(15,Math.max(0,n-1)*5);}
function cafeRound(c,rate){let sales=0,served=0,happy=0;
 c.guests=c.guests.filter(g=>{g.stay=(g.stay??1)-1;if(g.stay>0)return true;const m=menuById(g.dish);sales+=Math.round((m?.pt||60)*rate*(g.sat>=60?1:.8))+(g.tip||0);served++;if(g.sat>=60)happy++;return false;});
 const sel=c.menu.map(menuById).filter(Boolean),seats=tablesOpen()*4,used=new Set(c.guests.map(g=>g.seat)),free=[...Array(seats).keys()].filter(i=>!used.has(i)).sort(()=>Math.random()-.5);
 const pop=Math.min(.1,(c.happy||0)*.0008);
 free.forEach(seat=>{if(Math.random()>ARR_P+pop)return;const ok=sel.filter(m=>canMake(m,c.stock));if(!ok.length)return;const m=choice(ok);take(m,c.stock);
  const g=newGuest();Object.assign(g,{seat,dish:m.id,stay:rint(1,3),sat:rint(35,70)+varietyBonus(c),q:Math.random()<.65,qd:false});c.guests.push(g);});
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
const CAFE_UP=[null,{h:15,p:1200},{h:50,p:2400},{h:120,p:3600}];
async function cafeOpen(){const c=C();if(!c.on)return openCafeShop();cafeTick();
 const sel=c.menu.map(menuById).filter(Boolean),left=sel.reduce((a,m)=>a+Math.max(0,servings(m)),0),td=c.today&&c.today.d===dayKey()?c.today:{pt:0,n:0};
 const v=await dialog(`<div class="cafeHead48">${imgTag('cafe_sign')}<div><b>おうちカフェ Lv${c.lv}</b><small>4人がけの 机 ${tablesOpen()}つ（${tablesOpen()*4}せき）</small><small class="${left?'ok':'ng'}">${left?`えいぎょうちゅう・あと ${left}さら つくれる`:'ざいりょうぎれ（のうひんしてね）'}</small></div></div>
  <div class="cafeStats48"><span>きょうの うりあげ<b>${nf(td.pt)}pt</b></span><span>きょうの おきゃくさん<b>${td.n}人</b></span><span>まんぞくした おきゃくさん<b>${nf(c.happy||0)}人</b></span></div>${c.lv<4?(()=>{const U=CAFE_UP[c.lv],h=c.happy||0;return `<div class="up51"><small>Lv${c.lv+1}まで：まんぞく ${Math.min(h,U.h)}/${U.h}人 ・ ${nf(U.p)}pt</small><i><b style="width:${Math.min(100,h/U.h*100)}%"></b></i></div>`;})():''}
  <div class="cafeMenuNow48">${sel.length?sel.map(m=>`<span>${imgTag(m.art)}<small>${esc(m.n)}<br>あと${Math.max(0,servings(m))}</small></span>`).join(''):'<small>メニューを えらんでね</small>'}</div>
  <p class="dlgP facNote">カフェは いつも えいぎょうちゅう。おきゃくさんは すこしずつ 来るよ。<br>机（せき）が おおいほど たくさん 来るよ。<br><b>？の ふきだしの おきゃくさんを タッチすると 問題を 出してくれるよ。せいかいすると まんぞく＆チップ！</b></p>`,
  [{label:`${imgTag('cafe_crate','btnIc48')} メニューと ざいりょう`,cls:'gold',v:'menu'},{label:`${imgTag('cafe_coffee','btnIc48')} じぶんで 買って 食べる`,cls:'gold',v:'eat'},{label:'🎨 机の 柄',cls:'white',v:'theme'},...(c.lv<4?[{label:`⬆ Lv${c.lv+1}へ<span class="nw">（${nf(CAFE_UP[c.lv].p)}pt）</span>`,cls:(c.happy||0)>=CAFE_UP[c.lv].h&&save.points.bal>=CAFE_UP[c.lv].p?'gold':'white',v:'up'}]:[]),...(inCafe()&&curScreen==='myhome'?[]:[{label:'カフェの へやへ',cls:'white',v:'go'}]),{label:'とじる',v:null}],'wide cafeDlg48');
 if(v==='menu')cafeMenu();if(v==='eat')cafeBuy();if(v==='theme')cafeTheme();
 if(v==='go'){if(curScreen!=='myhome')show('myhome');if(homeEdit)endHomeEdit(true);switchRoom('cafe');}
 if(v==='up'){const U=CAFE_UP[c.lv],p=U.p;if((c.happy||0)<U.h){await dialog(`<div class="dlgArt">${imgTag('cafe_sign')}</div><h2 class="dlgT">まだ レベルアップ できないよ</h2><p class="dlgP">まんぞくして かえった おきゃくさんが <b>${U.h}人</b> ひつようだよ。<br>いまは <b>${c.happy||0}人</b>。あと ${U.h-(c.happy||0)}人！</p><p class="dlgP facNote">おきゃくさんの 問題に せいかいすると かならず まんぞくしてくれるよ。<br>メニューの しゅるいが おおいほど まんぞくしやすいよ。</p>`);return cafeOpen();}if(save.points.bal<p)return toast('ポイントが たりないよ');givePts(-p,'カフェを グレードアップ');c.lv++;persist();clearTableCells();sound('fan');confetti(1200);if(curScreen==='myhome')renderMyHome();cafeOpen();}}
/* ---------- メニューと ざいりょう（のうひん） ---------- */
function menuBody(){const c=C(),sel=new Set(c.menu),all=cafeMenus(true);
 const need=new Set();c.menu.map(menuById).filter(Boolean).forEach(m=>Object.keys(m.req).forEach(k=>need.add(k)));
 const mats=[...need];
 return `<h2 class="dlgT">メニューと ざいりょう</h2>
 <div class="secT48">① お店に だす メニュー（${sel.size}/6）</div>
 <div class="cafeMenus48">${all.map(m=>{const lock=!m.ev&&m.lv>c.lv;return `<button data-cmenu="${m.id}" class="${sel.has(m.id)?'on':''} ${lock?'lk48':''}" ${lock?'disabled':''}><img src="${esc(m.art)}" alt=""><b>${esc(m.n)}</b><small>${lock?`🔒 カフェLv${m.lv}`:`${m.pt}pt${m.ev?'・イベント':''}`}</small><span class="reqs48">${Object.entries(m.req).map(([k,n])=>`<i>${imgTag(matArt(k))}${n}</i>`).join('')}</span></button>`;}).join('')}</div>
 <div class="secT48">② ざいりょうを のうひんする</div>
 ${mats.length?`<div class="matList48">${mats.map(k=>{const have=handBag(k)[k]||0,st=c.stock[k]||0;return `<div class="matIt48 mat50" data-mk="${k}">${imgTag(matArt(k))}<div class="mName50"><b>${esc(matName(k))}</b><div class="cnt50"><span class="hv50"><small>てもち</small><em>${have}</em></span><i>▶</i><span class="st50"><small>カフェ</small><em>${st}</em></span></div></div><div class="mBtn50"><button data-cdel="${k}|1" ${have?'':'disabled'}>＋1</button><button data-cdel="${k}|all" ${have?'':'disabled'}>ぜんぶ</button></div></div>`;}).join('')}</div>
 <button class="btn gold delAll48" data-cdelall>まとめて ぜんぶ のうひん</button>`:'<p class="dlgP facNote">メニューを えらぶと ひつような ざいりょうが でるよ</p>'}
 <p class="dlgP facNote">やさい・くだものは 畑や 八百屋、ミルク・たまご・おにくは ぼくじょうで 手に入るよ。<br>ミルク・たまごは 八百屋、おにくは コンビニでも しいれられるよ。</p>`;}
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
 {fx:40,img:'c4_6',mood:'warm',who:'シマくん',txt:'あれが にがて大王の おしろだ……。まちを「ゆめの都」（Lv12）まで そだてたら、さいごの たたかいだ！ {kun}、いっしょに がんばろう！',fin:1}
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
