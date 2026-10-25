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
  sigKeys().forEach(k => {
    const [x,y]=k.split(','), c=$(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(!c)return;
    c.querySelectorAll('.sigWrap,.overImg').forEach(e=>e.remove());
    const T=sigTopo(k); if(!T.ok){ if((save.town.over||{})[k]===SIG_ID){ delete save.town.over[k]; save.town.inv[SIG_ID]=(save.town.inv[SIG_ID]||0)+1; persist(); } return; }
    const dirs=T.n===4?['n','e','s','w']:T.n===3?Object.keys(T.a).filter(d=>T.a[d]):(T.a.e?['n','s']:['e','w']);
    dirs.forEach(d=>c.insertAdjacentHTML('beforeend',`<span class="sigWrap onRoad auto ${d} ${d==='n'||d==='s'?'fv':'fh'}">${sigSVG(d==='n'||d==='s'?0:1)}</span>`));
  }); paintSignals();
}
/* その マスの 信号が 車の すすむ むきに 「とまれ」か */
function redFor(x, y, axis){
  const t = save.town, p = phase(), col = axis==='v' ? p.v : p.h;
  if(col==='g') return false;
  const want = axis==='v' ? (d => d===0) : (d => d!==0);
  const check = k => (t.over||{})[k]===SIG_ID || t.cells[k]===SIG_ID ? want(sigDir(k)) : false;
  if(check(`${x},${y}`)) return true;
  return [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => { const k = `${x+dx},${y+dy}`; return t.cells[k]===SIG_ID && want(sigDir(k)); });
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
function fruitBag(){ const b = save.fruits || (save.fruits = {}); Object.keys(FRUITS).forEach(k => b[k] = b[k]||0); return b; }
function addFruit(k, n=1, why=''){ if(!FRUITS[k]) return; const B=fruitBag(); B[k]+=n; persist(); toast(`${FRUITS[k].i} ${FRUITS[k].n} ×${n}を てにいれた！${why?'（'+why+'）':''}`); }
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

function fruitPanel(r){ const B=fruitBag(); return `<div class="fruitPanel"><b>🌱 能力の実で そだてる</b><small>あげるたびに 能力が +1。何度でも そだつよ！</small><div class="fruitGrid">${ABILITIES.map(a=>{const f=FRUITS[a.id];return `<button data-feed="${r.id}|${a.id}" ${B[a.id]? '' : 'disabled'} style="--fc:${f.c}"><i>${f.i}</i><span>${f.n}</span><b>×${B[a.id]}</b><small>${a.i}${a.n} ${(r.ab[a.id]||0)} → ${(r.ab[a.id]||0)+1}</small></button>`;}).join('')}</div></div>`; }
function attachFruit(rid){ const r=save.town?.res.find(x=>x.id===rid); if(!r || SP(r.sp).human) return; const body=$('#dlgBody'); if(!body || body.querySelector('.fruitPanel')) return; body.insertAdjacentHTML('beforeend',fruitPanel(r)); }
/* 住民カードを ひらいた あとに 実の パネルを 追加 */
document.addEventListener('click', e=>{ const b=e.target.closest('#resGrid .resCard'); if(b) setTimeout(()=>attachFruit(b.dataset.id),30); }, true);
document.addEventListener('click', async e=>{ const b=e.target.closest('[data-feed]'); if(!b) return; e.stopImmediatePropagation(); const [rid,k]=b.dataset.feed.split('|'), r=save.town.res.find(x=>x.id===rid), B=fruitBag(); if(!r||!B[k]) return;
  B[k]--; r.ab[k]=(r.ab[k]||0)+1; persist(); sound('fan'); confetti(700); const f=FRUITS[k], a=ABILITIES.find(x=>x.id===k);
  await dialog(`<div class="fruitBig">${f.i}</div><h2 class="dlgT">${esc(r.name)}が ${f.n}を たべた！</h2><p class="dlgP">${a.i} ${a.n}が <b>${r.ab[k]}</b>に あがったよ！<br>そだてるほど、まちでの かつやくが 大きくなるよ。</p>`,[{label:'やったね！',cls:'gold',v:1}],'gold'); renderCurrent();
},true);

/* =====================================================================
   高層ビル：100かい タワー
   ===================================================================== */
const CROWN='sky_crown';
const crownArt='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 150"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff2a5"/><stop offset=".45" stop-color="#ffd43b"/><stop offset="1" stop-color="#e59917"/></linearGradient></defs><path d="M20 45l35 28 35-55 35 55 35-28-12 78H32z" fill="url(#g)" stroke="#b86f09" stroke-width="6"/><path d="M38 102h104v28H38z" rx="8" fill="#f8b81d" stroke="#b86f09" stroke-width="6"/><circle cx="90" cy="88" r="10" fill="#70d6ff"/><circle cx="52" cy="91" r="8" fill="#ff6b9b"/><circle cx="128" cy="91" r="8" fill="#9b75ff"/><path d="M38 137h104" stroke="#7a4a05" stroke-width="5" stroke-linecap="round"/></svg>');
DEFAULT_ART.sky_crown=crownArt;
if(!FURNITURE.some(f=>f.id===CROWN)) FURNITURE.push({id:CROWN,name:'天空の おうかん',art:'sky_crown',type:'fur',price:9999,lv:8,sty:20,special:true});
function towerData(){ return save.tower || (save.tower={floor:1,best:0,done:false,rewards:[]}); }
const towerRewarded=(T,n)=>T.rewards.includes(n);
function towerRewardHTML(f){ if(f===100) return '🌈 超レアかくていレター・天空の おうかん・ランクアップの本×3・能力の実 全5しゅるい×3'; if(f%25===0) return '✨ 能力の実 全5しゅるい×1・きらきらレター×1'; if(f%10===0) return '🌱 能力の実×2・ポイント'; if(f%5===0) return '🪙 ポイント'; return ''; }
function towerGive(f){ const T=towerData(); if(f!==100 && f%5!==0) return ''; if(towerRewarded(T,f)) return ''; T.rewards.push(f); const t=save.town; let msg='';
  if(f===100){ const H=ensureHome(); H.inv[CROWN]=(H.inv[CROWN]||0)+1; save.superLetter=(save.superLetter||0)+0; t.bag.rankbook=(t.bag.rankbook||0)+3; Object.keys(FRUITS).forEach(k=>fruitBag()[k]+=3); msg='天空の おうかん、きらきらレター×5、ランクアップの本×3、能力の実 全しゅるい×3'; }
  else if(f%25===0){ Object.keys(FRUITS).forEach(k=>fruitBag()[k]++); t.bag.goldletter=(t.bag.goldletter||0)+2; t.bag.rankbook=(t.bag.rankbook||0)+1; msg='能力の実 全しゅるい×1、きらきらレター×2、ランクアップの本×1'; }
  else if(f%10===0){ fruitBag()[randomFruit()]+=2; addPoints(50+f*2,`タワー ${f}かい とうたつ`,true); msg=`能力の実×2、${50+f*2}pt`; }
  else if(f%5===0){ addPoints(20+f,`タワー ${f}かい とうたつ`,true); msg=`${20+f}pt`; }
  persist(); return msg;
}
function towerView(){ const T=towerData(), f=Math.min(100,T.floor), pct=Math.max(1,(f-1)/99*100); return `<div class="towerHero"><img src="${esc(artSrc('bld_office'))}" alt=""><div><h2>🏙️ 100かい タワー</h2><b>${T.done?'100かい せいは！':`${f}かいから`}</b><small>さいこう：${T.best}かい</small></div></div><div class="towerMeter"><i style="height:${pct}%"></i><em style="bottom:calc(${pct}% - 13px)">🚪 ${T.done?'GOAL':f+'F'}</em></div><div class="towerMarks"><span>100F 👑</span><span>75F ✨</span><span>50F ✨</span><span>25F ✨</span><span>1F</span></div><p class="dlgP towerNote">1問 れんぞくせいかいするたび 1かい 上へ！<br>まちがえるか 時間切れで 1かいから やりなおし。途中で やめたときだけ つづきから できるよ。<br>5かいごとに ごほうびが あるよ。</p>`; }
async function towerLobby(key){ if(townLevel()<8){ await dialog(`<div class="dlgArt">${picHTML(ITEM('office'))}</div><h2 class="dlgT">🔒 タワーは まちLv8から</h2><p class="dlgP">まちを もっと 大きくすると シマくんが おしえてくれるよ！</p>`); return; }
  const T=towerData(); const main=T.done?[{label:'👑 ごほうびを みる',cls:'gold',v:'reward'}]:[{label:`🚪 ${T.floor}かいから のぼる`,cls:'gold',v:'start'}]; const v=await dialog(towerView(),main.concat(key?[{label:'⬆ ビルを グレードアップ',cls:'white',v:'grade'}]:[]).concat([{label:'とじる',v:null}]),'wide towerDlg');
  if(v==='start') towerRun(); if(v==='grade') openBuilding(key); if(v==='reward') dialog(`<div class="fruitBig">👑</div><h2 class="dlgT">天空の おうかん</h2><p class="dlgP">100かいを せいはした あかし！<br>わたしの家に かざれる、とても きちょうな アイテムだよ。</p>`);
}
function towerSec(f){ return f<=20?30:f<=40?27:f<=60?24:f<=80?21:18; }
function towerQ(f){
  const band=f<=25?1:f<=50?2:f<=75?3:4, cand=[];
  Object.entries(MATH_UNITS).forEach(([k,u])=>{ const lv=typeof u.g==='number'?Math.max(1,u.g-2):(SOC_LV[k]||SCI_LV[k]||EK_LV[k]||0); if(lv && (band===4?lv>=3:lv===band))cand.push(k); });
  for(let i=0;i<15;i++){ const k=choice(cand.length?cand:Object.keys(MATH_UNITS)), u=MATH_UNITS[k]; try{ const m=mqFromP(u.gen(),k); if(m)return m; }catch(e){} }
  return makeMQ({weakOnly:band===4&&Math.random()<.45});
}
async function towerAsk(m,f){
  const ans=m.ansF||m.ans, sec=towerSec(f), token='tw'+Date.now();
  const buttons=m.opts.map(o=>({label:esc(o),cls:'white big',v:o})).concat([{label:'ここで やめる',cls:'white',v:'__quit'}]);
  let left=sec, timer=null, done=false;
  const p=dialog(`<div class="towerFloor"><b>${f}F</b><span>むずかしさ ${'★'.repeat(Math.min(4,Math.ceil(f/25)))}　⏳ <strong id="${token}">${sec}</strong>びょう</span></div><div class="towerTime"><i id="${token}b"></i></div>${m.html}${m.say?sayBtn(m.say):''}`,buttons,'wide quiz towerQuiz');
  const timeout=new Promise(res=>{ timer=setInterval(()=>{ if(done)return; left--; const e=$('#'+token),b=$('#'+token+'b'); if(e)e.textContent=left; if(b)b.style.width=(left/sec*100)+'%'; if(left<=0){clearInterval(timer); $('#dlg')?.classList.remove('show');res('__time');}},1000); });
  const v=await Promise.race([p,timeout]); done=true; clearInterval(timer);
  if(v==='__quit'||v==null)return 'quit'; if(v==='__time'){sound('ng');return 'time';}
  const ok=v===ans;sound(ok?'ok':'ng');if(m.wk&&ok)delWeak(m.wk);if(m.kq)addStat(m.kq,'read',ok,1);persist();return ok;
}
async function towerRun(){
  const T=towerData(); if(T.done)return;
  while(!T.done){ const f=T.floor, m=towerQ(f), r=await towerAsk(m,f);
    if(r==='quit'){toast(`🏙️ ${f}かいで きろくを ほぞんしたよ`);return towerLobby();}
    if(r!==true){ const why=r==='time'?'じかんぎれ！':'おしい！'; T.floor=1; T.rewards=[]; persist(); await dialog(`<h2 class="dlgT">${why} ${f}かいで ストップ</h2><p class="dlgP">${r==='time'?'時間内に こたえられなかったよ。':`こたえは <b>${esc(m.ansF||m.ans)}</b> だったよ。`}<br><b>つぎは 1かいから やりなおし！</b><br>さいこうきろく ${T.best}かいは のこるよ。</p>`,[{label:'もういちど！',cls:'gold',v:1}]);return towerLobby();}
    T.best=Math.max(T.best,f);const rw=towerGive(f);
    if(f>=100){T.done=true;T.floor=100;save.superLetter=(save.superLetter||0)+1;persist();sound('fan');confetti(3500);await dialog(`<div class="fruitBig">🌈💌</div><h2 class="dlgT">100かい せいは！</h2><p class="dlgP">すごい！ タワーの てっぺんに とうちゃく！</p><div class="skillBox"><b>超レアかくていレター ×1</b><br>天空の おうかん・ランクアップの本×3・能力の実 全しゅるい×3</div>`,[{label:'うけとる！',cls:'gold',v:1}],'gold');renderCurrent();return;}
    T.floor=f+1;persist();if(rw){sound('fan');confetti(1000);const nx=await dialog(`<h2 class="dlgT">🎉 ${f}かい とうたつ！</h2><p class="dlgP">${rw}<br>つぎは ${T.floor}かい！</p>`,[{label:'つぎへ',cls:'gold',v:1},{label:'ここで やめる',cls:'white',v:'quit'}]);if(nx==='quit'){toast(`🏙️ ${T.floor}かいで きろくを ほぞんしたよ`);return towerLobby();}}
  }
}
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
renderResidents=function(){ const o=_renderResidents45.apply(this,arguments); const box=$('#resBag'); if(box){const B=fruitBag(); box.insertAdjacentHTML('beforeend',Object.entries(FRUITS).map(([k,f])=>`<div class="bagIt fruitBagIt"><i>${f.i}</i><div><b>${f.n} ×${B[k]}</b><small>${f.d}</small></div></div>`).join(''));} return o; };
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
renderResidents=function(){const o=_renderResidents46.apply(this,arguments),b=$('#resBag');if(b&&!b.querySelector('[data-superletter]'))b.insertAdjacentHTML('beforeend',`<button class="bagIt use superLetter" data-superletter><i>🌈💌</i><div><b>超レアかくていレター</b><small>超レアの住民が かならず来る</small></div><strong>×${save.superLetter||0}</strong></button>`);return o;};
document.addEventListener('click',e=>{if(e.target.closest('[data-superletter]')){e.stopImmediatePropagation();superInvite();}},true);

/* =====================================================================
   牧場：カフェの 肉・たまご・ミルク
   ===================================================================== */
const RANCH='ranch';
const ranchArt='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180"><path fill="#8ed264" d="M5 115h210v60H5z"/><path fill="#fff4df" stroke="#bd7750" stroke-width="6" d="M35 70h145v88H35z"/><path fill="#e75a4f" stroke="#9f3e38" stroke-width="6" d="M24 76L108 18l84 58z"/><path fill="#6d4330" d="M83 100h50v58H83z"/><path fill="#bfe7ff" stroke="#5e8caf" stroke-width="5" d="M46 94h25v25H46zm99 0h25v25h-25z"/><circle cx="52" cy="145" r="20" fill="#fff"/><path d="M38 137q14-20 28 0v20H38z" fill="#5a4035"/><circle cx="169" cy="145" r="19" fill="#fff"/><circle cx="161" cy="140" r="4"/><circle cx="177" cy="140" r="4"/><path d="M85 161h48" stroke="#f4ce43" stroke-width="7"/></svg>');
DEFAULT_ART.bld_ranch=ranchArt;
if(!TOWN_ITEMS.some(x=>x.id===RANCH))TOWN_ITEMS.push({id:RANCH,type:'bld',cat:'bld',name:'ぼくじょう',art:'bld_ranch',emoji:'🐄',price:1400,lv:5,dev:38,income:8});
try{ZUKAN_INFO[RANCH]='ミルク・たまご・おにくなど、カフェの ざいりょうを つくる。';}catch(e){}
const RMAT={cf_milk:['🥛','ミルク'],cf_egg:['🥚','たまご'],cf_beef:['🥩','ぎゅうにく'],cf_chicken:['🍗','とりにく'],cf_pork:['🥓','ぶたにく']};
function cafeStock(){return save.cafeStock||(save.cafeStock={});}
async function openRanch(key){const S=cafeStock(),d=dayKey(),ready=S.ranchDay!==d,g=(save.town.glv||{})[key]||0,n=2+g;
 const v=await dialog(`<div class="dlgArt">${picHTML(ITEM(RANCH))}</div><h2 class="dlgT">🐄 ぼくじょう</h2><div class="matRow">${Object.entries(RMAT).map(([k,x])=>`<span>${x[0]} ${x[1]} <b>×${S[k]||0}</b></span>`).join('')}</div><p class="dlgP">${ready?'きょうの ざいりょうが できているよ！':'きょうの しゅうかくは おしまい。また あした！'}<br><small>グレードアップすると 1日に とれる かずが ふえるよ</small></p>`,(ready?[{label:`🧺 ざいりょうを うけとる（各${n}こ）`,cls:'gold',v:'get'}]:[]).concat([{label:'⬆ グレードアップ',cls:'white',v:'grade'},{label:'とじる',v:null}]),'wide');
 if(v==='get'){Object.keys(RMAT).forEach(k=>S[k]=(S[k]||0)+n);S.ranchDay=d;persist();sound('fan');confetti(900);toast('🐄 カフェの ざいりょうを うけとった！');}
 if(v==='grade')openBuilding(key);
}
window.addEventListener('click',async e=>{if(curScreen!=='town'||townEdit)return;const c=e.target.closest('#townMap .cell');if(!c)return;const k=`${c.dataset.x},${c.dataset.y}`;if(save.town.cells[k]!==RANCH)return;e.stopImmediatePropagation();e.preventDefault();openRanch(k);},true);

/* =====================================================================
   おうちカフェ
   ===================================================================== */
const MENUS=[
['carrot_soup','にんじんスープ','🥕',1,70,{f_carrot:2}],['tomato_soup','トマトスープ','🍅',1,70,{f_tomato:2}],['corn_soup','コーンスープ','🌽',1,80,{f_corn:2}],['fruit_plate','くだものプレート','🍎',1,90,{f_apple:1,f_banana:1}],['strawberry_milk','いちごミルク','🍓',1,90,{f_strawberry:1,cf_milk:1}],['egg_sand','たまごサンド','🥪',1,100,{cf_egg:1}],['pudding','ぼくじょうプリン','🍮',1,110,{cf_egg:1,cf_milk:1}],['veggie_salad','やさいサラダ','🥗',1,100,{f_tomato:1,f_carrot:1}],
['pumpkin_soup','かぼちゃスープ','🎃',2,120,{f_pumpkin:2,cf_milk:1}],['omelet','ふわふわオムレツ','🍳',2,140,{cf_egg:2,cf_milk:1}],['chicken_plate','チキンプレート','🍗',2,160,{cf_chicken:2,f_corn:1}],['pork_sand','ポークサンド','🥪',2,160,{cf_pork:2}],['hamburg','てづくりハンバーグ','🍖',2,180,{cf_beef:2,cf_egg:1}],['berry_parfait','ベリーパフェ','🍨',2,150,{f_strawberry:2,cf_milk:1}],['watermelon_juice','すいかジュース','🍉',2,110,{f_watermelon:2}],['banana_shake','バナナシェイク','🍌',2,120,{f_banana:2,cf_milk:1}],
['beef_stew','ビーフシチュー','🥘',3,220,{cf_beef:2,f_carrot:1,f_tomato:1}],['curry','やさいカレー','🍛',3,190,{f_carrot:1,f_pumpkin:1,cf_pork:1}],['roast_chicken','ローストチキン','🍗',3,220,{cf_chicken:3}],['steak','ごほうびステーキ','🥩',3,250,{cf_beef:3}],['gratin','コーングラタン','🧀',3,200,{f_corn:2,cf_milk:2}],['fruit_tart','フルーツタルト','🥧',3,210,{f_apple:1,f_strawberry:1,cf_egg:1}],['pancake','ふわふわパンケーキ','🥞',3,190,{cf_egg:2,cf_milk:2}],['lunchbox','カフェおべんとう','🍱',3,230,{cf_chicken:1,cf_egg:1,f_carrot:1}],
['special_course','まなびスペシャル','👑',4,320,{cf_beef:2,cf_chicken:2,f_pumpkin:1}],['garden_plate','ガーデンプレート','🌿',4,270,{f_tomato:2,f_carrot:2,f_corn:2}],['royal_parfait','ロイヤルパフェ','✨',4,280,{f_strawberry:2,f_banana:1,cf_milk:2}],['family_set','なかよしファミリーセット','🍽️',4,300,{cf_pork:2,cf_egg:2,f_tomato:1}],['chef_stew','シェフのとくせいシチュー','🍲',4,310,{cf_beef:2,cf_milk:1,f_carrot:2}],['rainbow_cake','にじいろロイヤルデザート','🌈',4,600,{f_strawberry:5,f_banana:3,f_apple:3,f_watermelon:2,cf_egg:5,cf_milk:5}]
].map(([id,n,i,lv,pt,req])=>({id,n,i,lv,pt,req}));
/* v4.7：全カフェメニューを絵本イラスト化。難しい料理ほど高倍率 */
const CAFE_IMG_BASE='./assets/images/v47/';
const CAFE_ART_INDEX={
 carrot_soup:1,tomato_soup:1,corn_soup:2,fruit_plate:9,strawberry_milk:29,egg_sand:10,pudding:30,veggie_salad:7,
 pumpkin_soup:3,omelet:13,chicken_plate:16,pork_sand:11,hamburg:14,berry_parfait:25,watermelon_juice:28,banana_shake:29,
 beef_stew:5,curry:19,roast_chicken:17,steak:15,gratin:21,fruit_tart:27,pancake:25,lunchbox:9,
 special_course:30,garden_plate:8,royal_parfait:26,family_set:18,chef_stew:5,rainbow_cake:30
};
MENUS.forEach(m=>{
 m.art=`${CAFE_IMG_BASE}cafe_${String(CAFE_ART_INDEX[m.id]||1).padStart(2,'0')}.webp`;
 m.mult=m.id==='rainbow_cake'?3:m.lv===4?2.5:m.lv===3?2:m.lv===2?1.5:1.2;
 m.min=m.id==='rainbow_cake'?35:15+m.lv*5;
 m.buy=Math.round(m.pt*(m.id==='rainbow_cake'?2.5:1.15));
});
const EVENT_MENU={halloween:{id:'ev_pumpkin',n:'ハロウィンかぼちゃパイ',i:'🎃',lv:1,pt:350,req:{f_pumpkin:3,cf_egg:1}},christmas:{id:'ev_xmas',n:'クリスマスチキン',i:'🎄',lv:1,pt:380,req:{cf_chicken:3,f_carrot:1}},newyear:{id:'ev_osechi',n:'おしょうがつプレート',i:'🎍',lv:1,pt:380,req:{cf_egg:2,cf_beef:1,f_carrot:1}},summer:{id:'ev_summer',n:'なつのフルーツパフェ',i:'🌻',lv:1,pt:350,req:{f_watermelon:2,f_strawberry:1,cf_milk:1}}};
Object.values(EVENT_MENU).forEach((m,i)=>{m.art=`${CAFE_IMG_BASE}cafe_${String([3,17,9,26][i]||30).padStart(2,'0')}.webp`;m.mult=2.5;m.min=30;m.buy=Math.round(m.pt*1.4);});
const THEMES=[['wood','きの ぬくもり','#B87945','#F6E0B8'],['cute','いちご','#E87998','#FFE4ED'],['natural','もり','#65A66E','#DDF1D7'],['marine','うみ','#4E9DB8','#DDF5FA'],['luxury','ロイヤル','#7558A6','#EEE4FF']];
function C(){return save.cafe||(save.cafe={on:false,lv:1,theme:'wood',menu:['carrot_soup','tomato_soup','egg_sand'],guests:[],pals:{},sales:0,served:0,last:0});}
function allStock(){return Object.assign({},foodBag(),cafeStock());}
function matName(k){return RMAT[k]?.[1]||FD(k)?.n||k;}
function canCook(m,S=allStock()){return Object.entries(m.req).every(([k,n])=>(S[k]||0)>=n);}
function useMat(m){const F=foodBag(),R=cafeStock();Object.entries(m.req).forEach(([k,n])=>{const B=k.startsWith('cf_')?R:F;B[k]=(B[k]||0)-n;if(B[k]<=0)delete B[k];});}
function cafeMenus(){const c=C(),L=MENUS.filter(m=>m.lv<=c.lv),ev=EVENT_MENU[curEvent?.()];if(ev)L.push(ev);return L;}
function cafeSeats(){return C().lv*4;}
function cafeGuest(){const live=new Set((save.town.res||[]).map(r=>r.sp)),pool=SPECIES.filter(s=>!s.human&&(s.w||0)>0&&!live.has(s.id));const sp=choice(pool.length?pool:SPECIES.filter(s=>!s.human));return{id:'cg'+Date.now().toString(36)+rint(10,99),sp:sp.id,name:choice(NAMES),talk:0,seat:0};}
function guestObj(g){return{id:g.id,sp:g.sp,name:g.name,star:1,ab:{}};}
function ensureCafeGuests(){const c=C(),n=Math.min(cafeSeats(),Math.max(2,c.lv*2));while(c.guests.length<n){const g=cafeGuest();g.seat=c.guests.length;c.guests.push(g);}c.guests=c.guests.slice(0,cafeSeats());}
function seatsHTML(){const c=C(),th=THEMES.find(x=>x[0]===c.theme)||THEMES[0],tables=c.lv;return `<div class="cafeRoom" style="--wood:${th[2]};--cloth:${th[3]}">${[...Array(4)].map((_,t)=>`<div class="cafeTable ${t<tables?'open':'lock'}"><i>🍽️</i>${[0,1,2,3].map(q=>{const g=c.guests.find(x=>x.seat===t*4+q);return `<span class="chair q${q}"${g?` data-cg="${g.id}"`:''}>${g?resPic(guestObj(g)):'🪑'}</span>`;}).join('')}${t>=tables?`<b>🔒 Lv${t+1}</b>`:''}</div>`).join('')}</div>`;}
function menuHTML(){const c=C(),sel=new Set(c.menu);return `<div class="cafeMenus">${cafeMenus().map(m=>`<button data-cmenu="${m.id}" class="${sel.has(m.id)?'on':''}"><img class="cafeMenuArt" src="${esc(m.art)}" alt=""><b>${m.n}</b><small>Lv${m.lv}・${m.pt}pt・食べると×${m.mult}</small><em>${Object.entries(m.req).map(([k,n])=>`${matName(k)}×${n}`).join('・')}</em></button>`).join('')}</div>`;}
async function cafeOpen(){const c=C();if(!c.on){const v=await dialog(`<div class="fruitBig">☕</div><h2 class="dlgT">おうちを カフェにする？</h2><p class="dlgP">「わたしの家」の 1かいを カフェとして つかえるよ。<br>家具や かべ・ゆかは そのまま のこるよ。</p>`,[{label:'☕ 500ptで カフェを はじめる',cls:'gold',v:'yes'},{label:'やめる',v:null}]);if(v==='yes'){if(save.points.bal<500)return toast('ポイントが たりないよ');givePts(-500,'おうちカフェを はじめた');c.on=true;persist();cafeOpen();}return;}
 ensureCafeGuests();persist();const th=THEMES.find(x=>x[0]===c.theme)||THEMES[0];const v=await dialog(`<div class="cafeHead"><div><b>☕ おうちカフェ Lv${c.lv}</b><small>4人がけ ${c.lv}せき・さいだい ${cafeSeats()}人</small></div><strong>売上 ${nf(c.sales)}pt</strong></div>${seatsHTML()}<div class="cafeStat">🍽️ メニュー ${c.menu.length}こ　🐾 来店 ${c.served}人　🎨 ${th[1]}</div>`,[{label:'🍳 えいぎょうする',cls:'gold',v:'serve'},{label:'🛍️ 自分で買って食べる',cls:'gold',v:'eat'},{label:'📖 メニューを かんがえる',cls:'white',v:'menu'},{label:'🎨 机・家具の ふんいき',cls:'white',v:'theme'},...(c.lv<4?[{label:`⬆ Lv${c.lv+1}へ（${c.lv*1200}pt）`,cls:'white',v:'up'}]:[]),{label:'とじる',v:null}],'wide cafeDlg');
 if(v==='serve')cafeServe();if(v==='eat')cafeBuy();if(v==='menu')cafeMenu();if(v==='theme')cafeTheme();if(v==='up'){const p=c.lv*1200;if(save.points.bal<p)return toast('ポイントが たりないよ');givePts(-p,'カフェを グレードアップ');c.lv++;persist();sound('fan');cafeOpen();}}
async function cafeServe(){const c=C(),sel=cafeMenus().filter(m=>c.menu.includes(m.id)),S=allStock(),cook=sel.filter(m=>canCook(m,S));if(!cook.length){await dialog(`<h2 class="dlgT">ざいりょうが たりないよ</h2><p class="dlgP">畑で やさい・くだものを、牧場で ミルク・たまご・おにくを あつめよう！</p>${menuHTML()}`,[], 'wide');return;}
 ensureCafeGuests();let sales=0,served=0,used=[];for(const g of c.guests){const avail=sel.filter(m=>canCook(m));if(!avail.length)break;const m=choice(avail);useMat(m);sales+=m.pt;served++;used.push(`<span><img src="${esc(m.art)}" alt="">${esc(m.n)}</span>`);}
 if(!served)return toast('つくれる メニューが ないよ');const rate=1+(c.lv-1)*.1,s=Math.round(sales*rate);givePts(s,'おうちカフェの うりあげ');c.sales+=s;c.served+=served;c.last=Date.now();c.guests=[];persist();sound('fan');confetti(1200);await dialog(`<h2 class="dlgT">☕ えいぎょう だいせいこう！</h2><p class="dlgP">${served}人の おきゃくさんが 食べてくれたよ！<br><b>売上 ${s}pt</b></p><div class="usedMenu">${used.join('　')}</div>`,[{label:'やったー！',cls:'gold',v:1}],'gold');cafeOpen();}
async function cafeBuy(){
 const c=C(), list=cafeMenus();
 const v=await pickCafeBuy(`<h2 class="dlgT">🛍️ カフェの メニューを 買って食べよう</h2><p class="dlgP">料理にはポイント倍率がつくよ。むずかしい料理ほど高倍率！<br><small>素材はカフェ側で使い、代金をポイントで払います。</small></p><div class="cafeBuyGrid">${list.map(m=>`<button data-cbuy="${m.id}" ${(!canCook(m)||save.points.bal<m.buy)?'disabled':''}><img src="${esc(m.art)}" alt=""><b>${esc(m.n)}</b><strong>×${m.mult}・${m.min}分</strong><small>${m.buy}pt<br>${Object.entries(m.req).map(([k,n])=>`${matName(k)}×${n}`).join('・')}</small></button>`).join('')}</div>`);
 if(v)cafeBuy();
}
function pickCafeBuy(html){return new Promise(res=>{dialog(html,[{label:'とじる',v:null}],'wide').then(()=>res(null));$('#dlgBody').onclick=e=>{const b=e.target.closest('[data-cbuy]');if(!b||b.disabled)return;const m=cafeMenus().find(x=>x.id===b.dataset.cbuy);if(!m||!canCook(m)||save.points.bal<m.buy)return;useMat(m);givePts(-m.buy,`カフェで ${m.n}を かった`);const now=Date.now(),cur=buffNow();save.buff=(cur&&cur.n===m.n)?Object.assign(cur,{until:cur.until+m.min*60000}):{m:m.mult,until:now+m.min*60000,n:m.n,art:m.art};persist();sound('fan');confetti(800);$('#dlg').classList.remove('show');dialog(`<div class="dlgArt big"><img src="${esc(m.art)}" alt=""></div><h2 class="dlgT">${esc(m.n)}を たべた！</h2><p class="dlgP">${m.min}分のあいだ、もらえるポイントが <b>×${m.mult}</b>！${m.id==='rainbow_cake'?'<br><b>🌈 最高難度メニューの3倍ボーナス！</b>':''}</p>`,[{label:'おいしかった！',cls:'gold',v:1}],'gold');res(m.id);};});}
async function cafeMenu(){const c=C(),v=await pickCafe(menuHTML()+`<p class="dlgP facNote">えらべるのは 6こまで。カフェLvで あたらしい メニューが かいほう！<br>イベント中は とくべつメニューも ならぶよ。</p>`);if(v)cafeMenu();}
function pickCafe(html){return new Promise(res=>{dialog(html,[{label:'できあがり',cls:'gold',v:null}],'wide').then(()=>res(null));$('#dlgBody').onclick=e=>{const b=e.target.closest('[data-cmenu]');if(!b)return;const c=C(),id=b.dataset.cmenu,i=c.menu.indexOf(id);if(i>=0)c.menu.splice(i,1);else if(c.menu.length<6)c.menu.push(id);else return toast('メニューは 6こまでだよ');persist();$('#dlg').classList.remove('show');res(id);};});}
async function cafeTheme(){const c=C(),v=await dialog(`<h2 class="dlgT">🎨 机の柄・家具の ふんいき</h2><div class="themeGrid">${THEMES.map(x=>`<button data-theme="${x[0]}" style="--a:${x[2]};--b:${x[3]}"><i></i><b>${x[1]}</b></button>`).join('')}</div><p class="dlgP">席の ばしょは きまっているけれど、机の柄と 家具の ふんいきを かえられるよ。</p>`,[{label:'とじる',v:null}],'wide');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(!b)return;e.stopImmediatePropagation();C().theme=b.dataset.theme;persist();$('#dlg').classList.remove('show');cafeOpen();},true);
document.addEventListener('click',async e=>{const b=e.target.closest('[data-cg]');if(!b)return;e.stopImmediatePropagation();const c=C(),g=c.guests.find(x=>x.id===b.dataset.cg);if(!g)return;g.talk++;const o=guestObj(g);persOf(o);await dialog(`<div class="dlgArt big">${resPic(o)}</div><h2 class="dlgT">${esc(g.name)}（${esc(SP(g.sp).name)}）</h2><div class="talkBubble"><b>${esc(g.name)}</b>${esc(speak(o,g.talk>=3?'この カフェ だいすき！ また 来たいな！':'とっても おいしそう！ おすすめは なあに？'))}</div><p class="dlgP">なかよし度 ${'💗'.repeat(Math.min(3,g.talk))}${'♡'.repeat(Math.max(0,3-g.talk))}</p>`,[{label:'また おはなししよう',cls:'gold',v:1}]);if(g.talk===3){save.fac=save.fac||{};save.fac.pals=save.fac.pals||{};save.fac.pals[g.sp]=(save.fac.pals[g.sp]||0)+1;toast('💞 レターを つかったとき 来やすくなった！');}persist();},true);
/* わたしの家にカフェボタン */
const _renderMyHome46=renderMyHome;renderMyHome=function(){const o=_renderMyHome46.apply(this,arguments);let b=$('#btnCafe46');if(!b){$('#btnHomeEdit').insertAdjacentHTML('afterend','<button class="btn orange" id="btnCafe46">☕ おうちカフェ</button>');b=$('#btnCafe46');b.onclick=cafeOpen;}b.textContent=C().on?`☕ おうちカフェ Lv${C().lv}`:'☕ おうちを カフェにする';return o;};
})();
