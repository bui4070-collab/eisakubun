/* =====================================================================
   まなびタウン v4.2：たてものの きのう
   畑・公園・図書館・学校・パーキング・病院・市やくしょ・ホテル
   （おまけ：はくぶつかん・風車）
   ※ app.js の あとに 読みこむ。セーブは save.fac に 追加するだけ
   ===================================================================== */
(function(){
'use strict';

/* ---------- 画像 ---------- */
Object.assign(DEFAULT_ART, {
  fac_book_kanji:'./assets/images/fac/book_kanji.webp', fac_book_math:'./assets/images/fac/book_math.webp',
  fac_book_sci:'./assets/images/fac/book_sci.webp',     fac_book_soc:'./assets/images/fac/book_soc.webp',
  fac_book_eng:'./assets/images/fac/book_eng.webp',     fac_book_prog:'./assets/images/fac/book_prog.webp',
  fac_book_koku:'./assets/images/fac/book_koku.webp',   fac_book_all:'./assets/images/fac/book_all.webp'
});

/* ---------- セーブ ---------- */
function F(){
  const f = save.fac || (save.fac = {});
  f.farm = f.farm || {}; f.park = f.park || {ids:[], until:0, played:false};
  f.school = f.school || {day:'', ids:[], done:false, exp:{}};
  f.parking = f.parking || {}; f.books = f.books || []; f.hall = f.hall || 0;
  f.tour = f.tour || []; f.pals = f.pals || {};
  return f;
}
const MIN = 60000, now = () => Date.now();
const cellsOf = id => save.town ? Object.entries(save.town.cells).filter(([k,v]) => v===id).map(([k]) => k) : [];
const has = id => cellsOf(id).length > 0;
const hasC = () => has('clinic') || has('bg_hospital');                 // v6.13：そうごう びょういんも 病院
const glv = key => (save.town.glv||{})[key] || 0;
const maxGlv = id => cellsOf(id).reduce((a,k) => Math.max(a, glv(k)), 0);
const resBy = id => save.town.res.find(r => r.id===id);
const freeRes = () => nonHuman().filter(r => !isWorking(r) && r.id!==ghosted() && !r.hurt);
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.random()*(i+1)|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
const left = ms => { const m = Math.ceil(ms/MIN); if(m >= 24*60){ const d = Math.floor(m/1440), h = Math.floor((m%1440)/60); return `${d}日${h ? h+'時間' : ''}`; } return m >= 60 ? `${Math.floor(m/60)}時間${m%60 ? m%60+'分' : ''}` : `${m}分`; };
const hearts = (n, max) => `<span class="facHearts">${'💗'.repeat(n)}${'♡'.repeat(Math.max(0,max-n))}</span>`;
const head = (art, title, sub) => `<div class="facHead"><img src="${esc(artSrc(art))}" alt=""><div><h2 class="dlgT">${title}</h2>${sub ? `<small>${sub}</small>` : ''}</div></div>`;
const gradeBtn = {label:'⬆ グレードアップ', cls:'white', v:'grade'}, closeBtn = {label:'とじる', cls:'white', v:null};

/* 本文の 中の ボタン（data-pick）も えらべる ダイアログ */
function pickDialog(html, btns, cls){
  return new Promise(res => {
    let done = false;
    const end = v => { if(done) return; done = true; $('#dlgBody').onclick = null; res(v); };
    dialog(html, btns, cls).then(end);
    $('#dlgBody').onclick = e => {
      const b = e.target.closest('[data-pick]'); if(!b || b.disabled) return;
      $('#dlg').classList.remove('show'); end('pick:' + b.dataset.pick);
    };
  });
}

/* =====================================================================
   畑：たねを まいて そだてて しゅうかく
   ===================================================================== */
const CROPS = [
  {id:'carrot',     f:'f_carrot',     n:'にんじん',     seed:20,  min:15,  y:[2,3], lv:1},
  {id:'tomato',     f:'f_tomato',     n:'トマト',       seed:30,  min:30,  y:[2,3], lv:1},
  {id:'corn',       f:'f_corn',       n:'とうもろこし', seed:40,  min:45,  y:[2,3], lv:2},
  {id:'strawberry', f:'f_strawberry', n:'いちご',       seed:60,  min:60,  y:[2,4], lv:3},
  {id:'pumpkin',    f:'f_pumpkin',    n:'かぼちゃ',     seed:70,  min:90,  y:[1,3], lv:4},
  {id:'watermelon', f:'f_watermelon', n:'すいか',       seed:100, min:120, y:[1,2], lv:5},
  {id:'potato',     f:'f_potato',     n:'じゃがいも',   seed:35,  min:40,  y:[2,4], lv:2},              // v5.4
  {id:'coffee',     f:'f_coffee',     n:'コーヒーの木', got:'コーヒーまめ', seed:80, min:100, y:[2,3], lv:5}   // v5.4
];
/* v5.4：じゃがいも・コーヒーまめ（おやつ／カフェの ざいりょう） */
Object.assign(DEFAULT_ART, {doc_bunny:'./assets/images/v54/doc_bunny.webp', veg_potato:'./assets/images/v54/veg_potato.webp', veg_coffee:'./assets/images/v54/veg_coffee.webp'});
[{id:'f_potato', n:'じゃがいも', price:50, m:1.1, min:15, art:'veg_potato'}, {id:'f_coffee', n:'コーヒーまめ', price:90, m:1.2, min:15, art:'veg_coffee'}]
  .forEach(f => { if(!FD(f.id)) FOOD.push(f); });
try{ const M = SHOP_FOOD.market; if(!M.includes('f_potato')) M.splice(2, 0, 'f_potato'); if(!M.includes('f_coffee')) M.push('f_coffee'); }catch(e){}
/* v6.1：畑の グレード（★）で そだてられる やさいが ふえる。なす・キャベツを ついか */
CROPS.push({id:'cabbage', f:'f_cabbage', n:'キャベツ', seed:30, min:35, y:[1,3], lv:1}, {id:'eggplant', f:'f_eggplant', n:'なす', seed:40, min:50, y:[2,3], lv:2});
const CROP_G = {carrot:0, tomato:0, cabbage:0, potato:0, corn:1, eggplant:1, strawberry:1, pumpkin:2, coffee:2, watermelon:3};
CROPS.forEach(c => { c.g = CROP_G[c.id] || 0; });
CROPS.sort((a,b) => a.g - b.g || a.lv - b.lv);
const CROP = id => CROPS.find(c => c.id===id);
const cropArt = c => FD(c.f)?.art || 'bld_field';
const millRate = () => 1 - 0.15*Math.min(2, cellsOf('windmill').length);
const farmProg = p => clamp((now() - p.at) / p.need, 0, 1);

async function openField(key){
  const f = F(), p = f.farm[key], lv = save.town.lv + 1;
  if(!p){
    const v = await pickDialog(head('bld_field', '🥕 はたけ', 'たねを まいて やさいを そだてよう')
      + `<div class="facGrid">${CROPS.map(c => { const gl = c.g > glv(key), lock = c.lv > lv || gl, poor = save.points.bal < c.seed;
        return `<button class="facCard" data-pick="${c.id}" ${lock||poor ? 'disabled' : ''}><img src="${esc(artSrc(cropArt(c)))}" alt=""><b>${c.n}</b>
          <small>${c.lv > lv ? `🔒 まちLv${c.lv}` : gl ? `🔒 畑 ★${c.g}` : `⏱ ${left(c.min*MIN*millRate())}`}</small><small><span class="coin sm">P</span> ${c.seed}</small></button>`; }).join('')}</div>
        <p class="dlgP facNote">⬆ 畑を グレードアップすると そだてられる やさいが ふえるよ（いまの 畑：${'★'.repeat(glv(key))}${'☆'.repeat(Math.max(0,3-glv(key)))}）<br>しゅうかくした やさいは ホームの「おやつ」で たべられるよ。ホテルの おきゃくさんにも あげられるよ！${cellsOf('windmill').length ? '<br>🌬️ 風車の おかげで はやく そだつよ' : ''}</p>`,
      [gradeBtn, closeBtn], 'wide');
    if(v==='grade') return openBuilding(key);
    if(!v || !String(v).startsWith('pick:')) return;
    const c = CROP(v.slice(5)); if(!c || save.points.bal < c.seed) return;
    givePts(-c.seed, `畑に ${c.n}の たねを まいた`);
    f.farm[key] = {c:c.id, at:now(), need:Math.round(c.min*MIN*millRate()), w:false};
    persist(); sound('ok'); toast(`🌱 ${c.n}の たねを まいたよ！`); decorate(); return;
  }
  const c = CROP(p.c), pr = farmProg(p);
  if(pr >= 1){
    const n = rint(c.y[0], c.y[1]) + (glv(key) >= 2 ? 1 : 0) + (p.w ? 1 : 0), B = foodBag();
    B[c.f] = (B[c.f]||0) + n; delete f.farm[key]; persist(); sound('fan'); confetti(1400);
    await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(cropArt(c)))}" alt=""></div><h2 class="dlgT">🧺 しゅうかく！</h2>
      <p class="dlgP">${c.got||c.n}が <b>${n}こ</b> とれたよ！<br><small>ホームの「おやつ」で たべると ポイントが ふえるよ</small></p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
    decorate(); return;
  }
  const rest = p.need - (now() - p.at);
  const v = await dialog(head('bld_field', `🌱 ${c.n}を そだてているよ`, `あと ${left(rest)}`)
    + `<div class="facBar"><i style="width:${Math.round(pr*100)}%"></i></div>
       <p class="dlgP facNote">${p.w ? '💧 おみずは もう あげたよ。たくさん とれそう！' : '💧 おみずを あげると はやく そだって、とれる かずも ふえるよ'}</p>`,
    (p.w ? [] : [{label:'💧 おみずを あげる', cls:'gold', v:'water'}]).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='water'){ p.at -= Math.round(rest*0.3); p.w = true; persist(); sound('ok'); toast('💧 ぐんぐん そだってる！'); decorate(); }
  if(v==='grade') openBuilding(key);
}

/* =====================================================================
   公園：住民が あそびに 来る
   ===================================================================== */
const GAMES = [['おにごっこ','🏃'],['かくれんぼ','🙈'],['ブランコ','🎠'],['すべりだい','🛝'],['なわとび','🪢'],['ボールあそび','⚽']];
function refreshPark(){
  const f = F(), P = f.park; if(!has('park')){ if(P.ids.length){ P.ids = []; return true; } return false; }
  P.ids = P.ids.filter(id => { const r = resBy(id); return r && !r.hurt; });
  if(P.until > now() && P.ids.length) return false;
  const n = Math.min(2 + cellsOf('park').length + maxGlv('park'), 6);
  P.ids = shuffle(freeRes()).slice(0, n).map(r => r.id); P.until = now() + rint(12,20)*MIN; P.played = false; P.game = choice(GAMES);
  return true;
}
async function openPark(key){
  refreshPark(); const P = F().park, list = P.ids.map(resBy).filter(Boolean);
  const v = await dialog(head('bld_park', '🛝 公園', list.length ? `いま ${list.length}人が ${P.game[0]}を しているよ ${P.game[1]}` : '')
    + (list.length ? `<div class="whoRow">${list.map(r => `<div class="whoIt">${resPic(r)}<span>${esc(r.name)}</span></div>`).join('')}</div>`
      : '<p class="dlgP">いまは だれも いないみたい…<br>しばらく すると あそびに 来るよ</p>')
    + (P.played ? '<p class="dlgP facNote">いっぱい あそんだね！ また こんど あそぼう</p>' : ''),
    (list.length && !P.played ? [{label:`${P.game[1]} いっしょに あそぶ`, cls:'gold', v:'play'}] : []).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='play') return;
  P.played = true; list.forEach(r => r.fr = (r.fr||0) + 1);
  const pt = 10 + list.length*8; givePts(pt, `公園で ${P.game[0]}を した`); persist(); sound('fan'); confetti(1500);
  const r = choice(list);
  await dialog(`<div class="whoRow">${list.map(x => `<div class="whoIt">${resPic(x)}</div>`).join('')}</div><h2 class="dlgT">${P.game[1]} ${P.game[0]}、たのしかった！</h2>
    <div class="talkBubble"><b>${esc(r.name)}</b>${esc(speak(r, 'また いっしょに あそぼうね！'))}</div>
    <p class="dlgP">みんなと なかよく なったよ 💗<br><span class="coin sm">P</span> +${pt}</p>`, [{label:'たのしかった！', cls:'gold', v:1}], 'wide');
}

/* =====================================================================
   学校：住民が かよう・じゅぎょうで かしこく なる
   ===================================================================== */
function refreshSchool(){
  const S = F().school, d = dayKey(); if(!has('school')) return false;
  if(S.day===d && S.ids.length) return false;
  const n = Math.min(3 + cellsOf('school').length - 1 + maxGlv('school'), 6);
  S.day = d; S.ids = shuffle(freeRes()).slice(0, n).map(r => r.id); S.done = false; return true;
}
async function openSchool(key){
  refreshSchool(); const S = F().school, list = S.ids.map(resBy).filter(Boolean);
  const v = await dialog(head('bld_school', '🏫 学校', `きょうは ${list.length}人が かよっているよ`)
    + `<div class="whoRow">${list.map(r => `<div class="whoIt">${resPic(r)}<span>${esc(r.name)}</span><small>✏️ ${S.exp[r.id]||0}/3</small></div>`).join('')}</div>`
    + `<p class="dlgP facNote">${S.done ? '📖 きょうの じゅぎょうは おしまい！ また あした' : 'みんなの まえで 問題を といて お手本を 見せよう！<br>せいかいすると 住民が かしこく なるよ（✏️3つで ちしき+1）'}</p>`,
    (!S.done && list.length ? [{label:'✏️ じゅぎょうを する', cls:'gold', v:'class'}] : []).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='class') return;
  const q = await miniQuiz(choice(list), '🏫 じゅぎょう：お手本を 見せて！');
  if(!q.ok){ givePts(10, '学校で じゅぎょう（チャレンジ）'); persist();
    await dialog(`<h2 class="dlgT">おしい！</h2><p class="dlgP">こたえは <b>${esc(q.ans)}</b> だったよ。<br>もう いちど チャレンジ できるよ！</p>`); return; }
  S.done = true; const up = [];
  list.forEach(r => { S.exp[r.id] = (S.exp[r.id]||0) + 1;
    if(S.exp[r.id] >= 3){ S.exp[r.id] = 0; if((r.ab.know||0) < 10){ r.ab.know = (r.ab.know||0) + 1; up.push(r); } } });
  givePts(40, '学校で じゅぎょう'); persist(); sound('fan'); confetti(1500);
  await dialog(`<div class="whoRow">${list.map(r => `<div class="whoIt">${resPic(r)}</div>`).join('')}</div><h2 class="dlgT">📖 じゅぎょう だいせいこう！</h2>
    <p class="dlgP">みんな「なるほど〜！」って うなずいているよ<br><span class="coin sm">P</span> +40</p>
    ${up.length ? `<div class="skillBox"><b>📘 ちしきが あがった！</b><div>${up.map(r => esc(r.name)).join('・')}</div></div>` : ''}`, [{label:'よかった！', cls:'gold', v:1}], 'wide');
}

/* =====================================================================
   パーキング：たまに 車が とまりに 来る
   ===================================================================== */
const guestCars = () => TOWN_ITEMS.filter(it => it.type==='veh' && it.art && !it.ship && !it.air && (it.lv||1) <= save.town.lv + 3 && !['bicycle','tractor'].includes(it.id));
function refreshParking(){
  const P = F().parking; let ch = false;
  Object.keys(P).forEach(k => { if(save.town.cells[k]!=='parking' || P[k].until < now()){ delete P[k]; ch = true; } });
  cellsOf('parking').forEach(k => { const busy = (typeof CAR!=='undefined' && CAR.list || []).filter(c => c.lot && c.lot.key===k).length; if(!P[k] && busy < 2 && Math.random() < 0.35){ const L = guestCars(); if(L.length){ P[k] = {v:choice(L).id, until:now() + rint(4,12)*MIN, paid:false}; ch = true; } } });
  return ch;
}
async function openParking(key){
  const p = F().parking[key], it = p && ITEM(p.v);
  if(!it){
    const v = await dialog(head('bld_parking', '🅿️ パーキング', 'いまは からっぽ'), [gradeBtn, closeBtn], 'wide');
    if(v==='grade') openBuilding(key); return;
  }
  const fee = Math.min(80, Math.round((10 + (it.price||100)/20) * (1 + 0.25*glv(key)) / 5) * 5);
  const v = await dialog(`<div class="dlgArt"><img src="${esc(artSrc(it.art))}" alt=""></div><h2 class="dlgT">🅿️ ${esc(it.name)}が とまっているよ</h2>
    <p class="dlgP">${p.paid ? 'ちゅうしゃりょうきんは もう もらったよ' : 'まちに あそびに 来た おきゃくさんの 車みたい！'}<br><small>あと ${left(p.until - now())}ぐらい とまっているよ</small></p>`,
    (p.paid ? [] : [{label:`🪙 ちゅうしゃりょうきん（+${fee}pt）`, cls:'gold', v:'fee'}]).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='fee' && !p.paid){ p.paid = true; givePts(fee, `パーキングの ちゅうしゃりょうきん`); persist(); sound('ok'); toast(`🪙 +${fee}pt もらったよ！`); }
  if(v==='grade') openBuilding(key);
}

/* =====================================================================
   病院：けがを した 住民を つれていくと なおしてくれる
   ===================================================================== */
const HURT_LINES = ['いたたた… ころんで ひざを すりむいちゃった…','あいたた… かいだんで 足を ひねっちゃった…','うう… ボールが あたって おでこが いたい…','いたた… 木から おちちゃった…'];
const hurtList = () => (save.town?.res||[]).filter(r => r.hurt);
function hurtCheck(){
  const f = F(), t = save.town, d = dayKey(); let ch = false;
  if(f.hurtDay!==d){ f.hurtDay = d; f.hurtN = 0; }
  hurtList().forEach(r => { if(now() - r.hurt.at > 24*60*MIN){ delete r.hurt; ch = true; } });   // 1日で しぜんに なおる
  const able = hasC() || t.lv >= 5;
  const hosp = cellsOf('bg_hospital').length, maxNow = hosp ? 1 + Math.min(2, hosp) : 1, maxDay = hosp ? 4 + 2*hosp : 2, rate = hosp ? 0.06 : 0.025;   // そうごう病院：かんじゃが ふえる
  if(able && hurtList().length < maxNow && f.hurtN < maxDay && Math.random() < rate){
    const c = freeRes(); if(c.length){ const r = choice(c); r.hurt = {at:now(), line:choice(HURT_LINES)}; f.hurtN++; ch = true;
      setTimeout(() => toast(`🤕 ${r.name}が けがを しちゃった！ タッチして ${hasC() ? '病院へ つれていこう' : 'ようすを 見よう'}`), 300); }
  }
  return ch;
}
async function heal(r){
  if(!hasC()){ toast('🏥 病院が ないよ。ショップで「病院」を おこう'); return; }
  sound('tap');
  /* v5.4：だれが はなしているか わかるように、せんせいと 住民を わけて ひょうじ */
  await dialog(head('bld_clinic', '🏥 病院に ついたよ', '') + `<div class="docTalk54">
      <div class="dt54 pat"><div class="dt54Pic">${resPic(r)}<span>${esc(r.name)}</span></div><div class="talkBubble"><b>${esc(r.name)}</b>${esc(speak(r, 'せんせい… いたいところを みてください…'))}</div></div>
      <div class="dt54 doc"><div class="talkBubble"><b>うさぎせんせい</b>だいじょうぶ！ すぐに なおるからね。はい、ばんそうこう ぺたっ🩹</div><div class="dt54Pic"><img src="${esc(artSrc('doc_bunny'))}" alt=""><span>せんせい</span></div></div>
    </div>`, [{label:'おねがいします！', cls:'gold', v:1}], 'wide');
  delete r.hurt; r.fr = (r.fr||0) + 2; givePts(30, `${r.name}を 病院へ つれていった`); persist(); sound('fan'); confetti(1500);
  await dialog(`<div class="dlgArt big">${resPic(r)}</div><h2 class="dlgT">✨ なおった！</h2>
    <div class="talkBubble"><b>${esc(r.name)}</b>${esc(speak(r, 'つれてきてくれて ありがとう！ きみって やさしいね'))}</div>
    <p class="dlgP">なかよし度 💗+2　<span class="coin sm">P</span> +30</p>`, [{label:'よかったね！', cls:'gold', v:1}], 'wide');
  decorate();
}
async function hurtTap(r){
  const v = await dialog(`<div class="dlgArt big">${resPic(r)}</div><h2 class="dlgT">🤕 ${esc(r.name)}が けがを しているよ</h2>
    <div class="talkBubble"><b>${esc(r.name)}</b>${esc(r.hurt.line || HURT_LINES[0])}</div>
    ${hasC() ? '' : '<p class="dlgP facNote">まちに 病院が あれば なおして もらえるのに…<br>（ショップで「病院」を おこう。1日 たつと しぜんに なおるよ）</p>'}`,
    (hasC() ? [{label:'🏥 病院へ つれていく', cls:'gold', v:'go'}] : []).concat([{label:'💬 はなす', cls:'white', v:'talk'}, closeBtn]), 'wide');
  if(v==='go') heal(r);
  if(v==='talk') talkTo(r.id);
}
async function openClinic(key){
  const f = F(), L = hurtList(), done = f.checkDay===dayKey();
  const isH = save.town.cells[key]==='bg_hospital'; const v = await pickDialog(head(isH ? 'bg_hospital' : 'bld_clinic', isH ? '🏥 そうごう びょういん' : '🏥 病院', L.length ? `けがを している 住民が ${L.length}人 いるよ` : 'みんな げんき！')
    + (L.length ? `<div class="facGrid">${L.map(r => `<button class="facCard" data-pick="${r.id}">${resPic(r)}<b>${esc(r.name)}</b><small>🩹 なおしてもらう</small></button>`).join('')}</div>` : '')
    + `<p class="dlgP facNote">${done ? '🩺 きょうの けんこうしんだんは おわったよ' : '🩺 1日1かい みんなの けんこうしんだんが できるよ'}</p>`,
    (done ? [] : [{label:'🩺 けんこうしんだん', cls:'gold', v:'check'}]).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v==='check'){ f.checkDay = dayKey(); givePts(30, '病院で けんこうしんだん'); persist(); sound('fan');
    await dialog(head('bld_clinic', '🩺 けんこうしんだん', '') + `<p class="dlgP">みんな げんき いっぱい！<br>はやね はやおき あさごはん で きょうも がんばろう<br><span class="coin sm">P</span> +30</p>`); return; }
  if(v && v.startsWith('pick:')){ const r = resBy(v.slice(5)); if(r && r.hurt) heal(r); }
}

/* =====================================================================
   市やくしょ：住民わくを ふやす
   ===================================================================== */
const hallMax = () => cellsOf('cityhall').length * 5;
const hallN = () => Math.min(F().hall, hallMax());
const hallCost = n => 800 + 600*n;
const _townCalcFac = townCalc;
townCalc = function(){ const c = _townCalcFac.apply(this, arguments); try{ const n = hallN(); c.hallAdd = n*2; c.maxRes += n*2; }catch(e){} return c; };
async function openHall(key){
  const n = hallN(), c = townCalc(), cost = hallCost(n), can = n < hallMax();
  const v = await dialog(head('bld_cityhall', '🏛️ 市やくしょ', 'まちの 住民わくを ふやせるよ')
    + `<div class="skillBox"><div>🐾 じゅうみん：<b>${nonHuman().length} / ${c.maxRes}人</b></div><div>📝 市やくしょで ふやした わく：<b>+${n*2}人</b>（さいだい +${hallMax()*2}）</div></div>
       <p class="dlgP facNote">${can ? 'わくを ふやしたら、すむ 家も わすれずに よういしてね！' : '🏛️ これいじょう ふやすには 市やくしょを もう1つ おこう'}</p>`,
    (can ? [{label:`📝 住民わく +2（${nf(cost)}pt）`, cls: save.points.bal >= cost ? 'gold' : 'white', v:'up'}] : []).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='up') return;
  if(save.points.bal < cost){ toast('ポイントが たりないよ'); return; }
  F().hall = n + 1; givePts(-cost, '市やくしょで 住民わくを ふやした'); persist(); sound('fan'); confetti(1400);
  toast(`🏛️ 住民わくが +2 ふえたよ！（${townCalc().maxRes}人まで）`); renderTown();
}

/* =====================================================================
   ホテル：かんこうきゃくと なかよく なる → レターで 来やすく
   ===================================================================== */
const TOUR_MAX = 12, TOUR_CD = 10*MIN;
const TOUR_LINES = ['この まち すてきだね！ 来て よかった〜','きょうは どこを 見に いこうかな？','おみやげ なにが いいと おもう？','この まちの おすすめの ばしょ おしえて！',
  'ホテルの ベッド ふかふかだったよ','まちの みんな やさしいね','しゃしん いっぱい とっちゃった！','つぎの おやすみも また 来たいなあ'];
const tourCount = () => Math.min(TOUR_MAX, cellsOf('hotel').reduce((n,k) => n + 1 + Math.min(3, glv(k)), 0));
function pickTourist(){
  const live = new Set(save.town.res.map(r => r.sp)), cur = new Set(F().tour.map(t => t.sp));
  const W = {1:1, 2:0.8, 3:0.35, 4:0.12};
  let pool = SPECIES.filter(s => !s.human && (s.w||0) > 0 && !cur.has(s.id) && !live.has(s.id));
  if(!pool.length) pool = SPECIES.filter(s => !s.human && (s.w||0) > 0 && !cur.has(s.id));
  if(!pool.length) return null;
  let x = Math.random() * pool.reduce((a,s) => a + (W[s.rar||1]||0.1), 0);
  for(const s of pool){ x -= (W[s.rar||1]||0.1); if(x <= 0) return s; }
  return pool[pool.length-1];
}
function refreshTour(){
  const f = F(); let ch = false;
  const keep = f.tour.filter(t => t.until > now()); if(keep.length !== f.tour.length){ f.tour = keep; ch = true; }
  if(!has('hotel')) return ch;
  while(f.tour.length < tourCount()){
    const s = pickTourist(); if(!s) break;
    const used = new Set(save.town.res.map(r => r.name).concat(f.tour.map(t => t.name)));
    const nm = NAMES.filter(n => !used.has(n)); 
    f.tour.push({id:'t'+now().toString(36)+rint(100,999), sp:s.id, name: nm.length ? choice(nm) : choice(NAMES), star:1, ab:{}, fr:0, last:0, until:now() + rint(8,14)*60*MIN});
    ch = true;
  }
  return ch;
}
const tourObj = t => ({id:t.id, sp:t.sp, name:t.name, star:1, ab:{}, pers:t.pers, hobby:t.hobby, kuchi:t.kuchi});
const vegIds = () => { const B = foodBag(); return Object.keys(B).filter(k => B[k] > 0 && /^f_(tomato|carrot|cabbage|eggplant|corn|daikon|pumpkin|apple|banana|grapes|strawberry|watermelon)$/.test(k)); };
async function becomePal(t){
  const f = F(); t.pal = true; f.pals[t.sp] = (f.pals[t.sp]||0) + 1; persist(); sound('fan'); confetti(2600);
  await dialog(`<div class="dlgArt big">${resPic(tourObj(t))}</div><h2 class="dlgT">💞 ${esc(t.name)}と なかよしに なった！</h2>
    <p class="dlgP">${esc(SP(t.sp).name)}は この まちが 気に入ったみたい！<br>「おまねきレター」「きらきらレター」を つかうと<br><b>来てくれる かくりつが アップ</b> するよ！${findHome(SP(t.sp)) ? '' : `<br><small>※ すむ 家「${esc(homeName(SP(t.sp).home))}」に あきが あると 来てくれるよ</small>`}</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
}
async function talkTourist(t){
  const o = tourObj(t); persOf(o); Object.assign(t, {pers:o.pers, hobby:o.hobby, kuchi:o.kuchi});
  const cd = now() - (t.last||0) < TOUR_CD && !t.pal;
  let line = cd ? 'さっき いっぱい おはなし したね。また あとで おはなし しよう！' : t.pal ? 'きみと なかよく なれて うれしいな！ この まちに すみたく なっちゃった' : choice(TOUR_LINES);
  if(!cd && !t.pal){ t.fr = Math.min(3, t.fr + 1); t.last = now(); persist(); sound('ok'); }
  const R = RARITY[SP(t.sp).rar||1], veg = vegIds();
  const v = await dialog(`<div class="dlgArt big">${resPic(o)}</div><div class="rarTag" style="background:${R.c}">${R.n}</div>
    <h2 class="dlgT">🧳 ${esc(t.name)}（${esc(SP(t.sp).name)}）</h2>
    <div class="talkBubble"><b>${esc(t.name)}</b>${esc(speak(o, line))}</div>
    <p class="dlgP">${t.pal ? '💞 なかよし！' : `なかよし度 ${hearts(t.fr, 3)}`}<br><small>あと ${left(t.until - now())} この まちに いるよ</small></p>`,
    (!t.pal && veg.length ? [{label:'🎁 やさいを あげる', cls:'gold', v:'gift'}] : []).concat([closeBtn]), 'wide');
  if(!t.pal && t.fr >= 3 && v!=='gift'){ await becomePal(t); return; }
  if(v==='gift'){
    const id = choice(veg), B = foodBag(), fd = FD(id); B[id]--; if(!B[id]) delete B[id];
    t.fr = Math.min(3, t.fr + 1); persist(); sound('fan');
    await dialog(`<div class="dlgArt"><img src="${esc(artSrc(fd?.art))}" alt=""></div><div class="talkBubble"><b>${esc(t.name)}</b>${esc(speak(o, `わあ！ ${fd?.n||'やさい'}だ！ ありがとう〜 とっても うれしい！`))}</div>
      <p class="dlgP">なかよし度 ${hearts(t.fr, 3)}</p>`, [{label:'どういたしまして', cls:'gold', v:1}], 'wide');
    if(t.fr >= 3) await becomePal(t);
  }
}
async function openHotel(key){
  refreshTour(); const L = F().tour;
  const v = await pickDialog(head('bld_hotel', '🏨 ホテル', L.length ? 'かんこうに 来た おきゃくさんが とまっているよ' : '')
    + (L.length ? `<div class="facGrid">${L.map(t => `<button class="facCard ${t.pal?'on':''}" data-pick="${t.id}">${resPic(tourObj(t))}<b>${esc(t.name)}</b><small>${esc(SP(t.sp).name)}</small>${t.pal ? '<small>💞 なかよし</small>' : hearts(t.fr, 3)}</button>`).join('')}</div>
      <p class="dlgP facNote">おはなし したり やさいを あげたり して なかよく なると、<br>レターを つかった ときに その 住民が 来やすく なるよ！</p>`
      : '<p class="dlgP">いまは おきゃくさんが いないよ。また あとで 来てみてね</p>'),
    [{label:'🛎️ ホテルの お店', cls:'white', v:'shop'}, gradeBtn, closeBtn], 'wide');
  if(v==='shop'){ SHOP_KEY = key; return openShop(key); }
  if(v==='grade') return openBuilding(key);
  if(v && v.startsWith('pick:')){ const t = L.find(x => x.id===v.slice(5)); if(t) talkTourist(t); }
}
/* レター：なかよしの 種類が 来やすい */
const _pickSpeciesFac = pickSpecies;
pickSpecies = function(o={}){
  try{
    const P = F().pals, ks = Object.keys(P).filter(k => P[k] > 0);
    if(o.needHome && ks.length){
      const pool = SPECIES.filter(s => ks.includes(s.id) && (s.w||0) > 0 && (s.rar||1) >= (o.minRar||1) && (s.rar||1) <= (o.maxRar||9) && findHome(s));
      if(pool.length && Math.random() < Math.min(0.6, 0.3*pool.length)) return choice(pool);
    }
  }catch(e){}
  return _pickSpeciesFac.apply(this, arguments);
};
const _inviteFac = inviteResident;
inviteResident = async function(){
  const before = new Set(save.town.res.map(r => r.id));
  const out = await _inviteFac.apply(this, arguments);
  try{ const P = F().pals; save.town.res.filter(r => !before.has(r.id) && P[r.sp] > 0).forEach(r => {
    P[r.sp]--; if(!P[r.sp]) delete P[r.sp]; persist(); toast(`🏨 ホテルで なかよく なった ${SP(r.sp).name}が 来てくれたよ！`); }); }catch(e){}
  return out;
};

/* =====================================================================
   図書館：教科の こうりゃく本を かりる
   ===================================================================== */
const BOOKS = [
  {id:'kanji', n:'かんじ こうりゃく本', subj:'kanji', s:'かんじ', tips:['かきじゅんは「上から 下へ」「左から 右へ」が きほんだよ。','「へん」や「つくり」に ちゅうもく！ さんずい（氵）は 水に かんけいする かんじが おおいよ。','音読みと 訓読みを セットで 声に 出して おぼえよう。','まちがえた かんじは、ことばの 中で 3かい かくと わすれにくいよ。']},
  {id:'koku', n:'こくご 読みとき本', subj:'koku', s:'こくご', tips:['文章は「いつ・どこで・だれが・なにを したか」を さがしながら 読もう。','「だから」「しかし」などの つなぎことばの あとは、話の ながれが かわる サイン！','気もちは「〜と おもった」「〜が うれしかった」などの ことばに かくれているよ。','こたえは 文章の 中の ことばを つかって かくと せいかいに なりやすいよ。']},
  {id:'math', n:'さんすう ひっしょう本', subj:'math', s:'さんすう', tips:['ひっさんは「くらいを たてに そろえる」のが いちばん だいじ！','文章題は 絵や 図に かくと、たし算か ひき算か わかりやすいよ。','こたえが 出たら、ぎゃくの 計算で たしかめよう（たし算 ⇔ ひき算）。','九九は 声に 出して リズムで となえると はやく おもいだせるよ。']},
  {id:'sci', n:'りか じっけん図かん', subj:'sci', s:'りか', tips:['りかは「よそう → じっけん → けっか → かんがえ」の じゅんばんで すすめるよ。','しょくぶつが そだつには「日光・水・空気・ちょうどいい あたたかさ」が いるよ。','じしゃくは 鉄を ひきつける。N極と S極は ひきあい、おなじ極は しりぞけあうよ。','雲の ようすを 見ると 天気が よそう できるよ。くろい 雲は 雨の サイン！']},
  {id:'soc', n:'しゃかい ちず博士', subj:'soc', s:'しゃかい', tips:['地図は ふつう 上が 北。「北・南・東・西」を まず たしかめよう。','都道府県は「かたち」と「めいぶつ」を セットで おぼえると わすれにくいよ。','れきしは 年表に して、できごとを じゅんばんに ならべてみよう。','地図記号は もとに なった ものを そうぞうすると おぼえやすいよ。']},
  {id:'eng', n:'えいご はじめて本', subj:'eng', s:'えいご', tips:['えいごは「だれが（主語）＋ どうする（動詞）」の じゅんばん。I play soccer.','a と an：あいうえおの 音で はじまる ことばの まえは an に なるよ（an apple）。','たずねる ときは Do you 〜? こたえは Yes, I do. / No, I don\'t.','まねして 声に 出すのが いちばんの ちかみち！ はずかしがらずに いってみよう。']},
  {id:'prog', n:'プログラミング 入門', subj:'prog', s:'プログラミング', tips:['プログラムは「じゅんばん」「くりかえし」「もし〜なら」の 3つで できているよ。','おなじ うごきが つづく ときは「くりかえし」で まとめると すっきり！','うまく いかない ときは 1つずつ うごかして、どこで まちがえたか しらべよう（デバッグ）。','おおきな もんだいは、小さく わけて かんがえると とけるよ。']},
  {id:'all', n:'まなびの ひみつ大百科', subj:'all', s:'ぜんぶの 教科', need:2, tips:['まいにち すこしずつ が いちばん つよい！ 10分でも つづけよう。','まちがいは たからもの。どうして まちがえたか しらべると ぐんと のびるよ。','ねる まえに きょう ならった ことを 1つ おもいだすと、おぼえやすく なるよ。','じかんを きめて しゅうちゅう → ちょっと やすむ、を くりかえそう。']}
];
const BOOK = id => BOOKS.find(b => b.id===id);
const BOOK_DAYS = 3, bookArt = b => 'fac_book_' + b.id;
const bookLimit = () => 1 + Math.min(3, maxGlv('library'));
const borrowed = id => F().books.find(x => x.id===id);
let lastSubj = null;
const SUBJ_OF = {kmode:'kanji', ksetup:'kanji', tsel:'kanji', math:'math', mathplay:'math', sci:'sci', soc:'soc', ekid:'eng', eng:'eng', engplay:'eng', prog:'prog', bun:'koku', home:null, town:null};
const _showFac = show;
show = function(name){ if(name in SUBJ_OF) lastSubj = SUBJ_OF[name]; return _showFac.apply(this, arguments); };
function bookRate(){ let m = 0; if(lastSubj && borrowed(lastSubj)) m += 0.2; if(borrowed('all')) m += 0.1; return m; }
const _addPointsFac = addPoints;
addPoints = function(pt, reason, silent){
  try{ if(pt > 0 && STUDY_RX.test(String(reason||''))){ const m = bookRate(), ex = Math.round(pt*m); if(ex > 0){ pt += ex; reason = `${reason}（📚+${Math.round(m*100)}%）`; } } }catch(e){}
  return _addPointsFac.call(this, pt, reason, silent);
};
function refreshBooks(){
  const f = F(), keep = f.books.filter(x => x.until > now());
  if(keep.length === f.books.length) return false;
  f.books.filter(x => x.until <= now()).forEach(x => setTimeout(() => toast(`📚 「${BOOK(x.id)?.n}」を 図書館に かえしたよ`), 500));
  f.books = keep; return true;
}
async function readBook(b){
  for(let i=0; i<b.tips.length; i++){
    const last = i===b.tips.length-1;
    const v = await dialog(`<div class="facBook"><img src="${esc(artSrc(bookArt(b)))}" alt=""><div><b>${esc(b.n)}</b><small>${i+1} / ${b.tips.length} ページ</small></div></div>
      <div class="facTip">💡 ${esc(b.tips[i])}</div>`, [{label: last ? 'よみおわった！' : 'つぎの ページ ▶', cls: last ? 'gold' : '', v:'next'}, {label:'とじる', cls:'white', v:null}], 'wide');
    if(v!=='next') return;
  }
  sound('ok');
}
async function openLibrary(key){
  refreshBooks(); const f = F(), lim = bookLimit(), lg = maxGlv('library');
  const v = await pickDialog(head('bld_library', '📚 図書館', `こうりゃく本を かりられるよ（${f.books.length} / ${lim}さつ）`)
    + `<div class="facGrid">${BOOKS.map(b => { const x = borrowed(b.id), lock = (b.need||0) > lg, full = !x && f.books.length >= lim;
      return `<button class="facCard ${x?'on':''}" data-pick="${b.id}" ${lock ? 'disabled' : ''}><img src="${esc(artSrc(bookArt(b)))}" alt=""><b>${esc(b.n)}</b>
        <small>${lock ? `🔒 図書館★${b.need}` : x ? `📖 よむ（あと ${left(x.until - now())}）` : full ? 'いっぱい' : 'かりる'}</small></button>`; }).join('')}</div>
      <p class="dlgP facNote">かりている あいだ、その 教科で もらえる ポイントが <b>+20%</b>！（ひみつ大百科は ぜんぶ +10%）<br>${BOOK_DAYS}日で かえすよ。図書館を グレードアップすると たくさん かりられるよ</p>`,
    [{label:'🏪 図書館の お店', cls:'white', v:'shop'}, gradeBtn, closeBtn], 'wide');
  if(v==='shop'){ SHOP_KEY = key; return openShop(key); }
  if(v==='grade') return openBuilding(key);
  if(!v || !v.startsWith('pick:')) return;
  const b = BOOK(v.slice(5)); if(!b) return;
  if(borrowed(b.id)){
    const w = await dialog(`<div class="dlgArt"><img src="${esc(artSrc(bookArt(b)))}" alt=""></div><h2 class="dlgT">${esc(b.n)}</h2><p class="dlgP">${esc(b.s)}の ポイント アップちゅう！<br><small>あと ${left(borrowed(b.id).until - now())}</small></p>`,
      [{label:'📖 よむ', cls:'gold', v:'read'}, {label:'かえす', cls:'white', v:'ret'}, closeBtn]);
    if(w==='read') await readBook(b);
    if(w==='ret'){ f.books = f.books.filter(x => x.id!==b.id); persist(); toast('📚 本を かえしたよ'); }
    return openLibrary(key);
  }
  if(f.books.length >= lim){ toast('📚 もう かりられないよ。どれか かえしてね'); return openLibrary(key); }
  f.books.push({id:b.id, until:now() + BOOK_DAYS*24*60*MIN}); persist(); sound('fan'); confetti(1000);
  toast(`📚 「${b.n}」を かりたよ！ ${b.s}の ポイント アップ`);
  await readBook(b);
}

/* =====================================================================
   おまけ：はくぶつかん（1日1かい てんじクイズ）
   ===================================================================== */
const EXHIBITS = ['きょうりゅうの 化石','むかしの 土器','うちゅうから おちてきた 石','むかしの おかね','大きな くじらの ほね','むかしの きもの','からくり人形','せかいの ちきゅうぎ'];
async function openMuseum(key){
  const f = F(), done = f.museum===dayKey(), ex = EXHIBITS[Math.abs(hashN(dayKey())) % EXHIBITS.length];
  const v = await dialog(head('bld_museum', '🏛️ はくぶつかん', `きょうの てんじ：${ex}`)
    + `<p class="dlgP facNote">${done ? 'きょうの てんじクイズは おわったよ。また あした！' : 'てんじを 見たら クイズに ちょうせん！ 1日1かい'}</p>`,
    (done ? [] : [{label:'❓ てんじクイズ', cls:'gold', v:'quiz'}]).concat([gradeBtn, closeBtn]), 'wide');
  if(v==='grade') return openBuilding(key);
  if(v!=='quiz') return;
  const q = await miniQuiz(null, `🏛️ はくぶつかん クイズ（${ex}）`);
  if(q.ok){ f.museum = dayKey(); givePts(60, 'はくぶつかんの てんじクイズ せいかい'); persist(); confetti(1200);
    await dialog('<h2 class="dlgT">🎉 せいかい！</h2><p class="dlgP">はかせ みたい！<br><span class="coin sm">P</span> +60</p>'); }
  else await dialog(`<h2 class="dlgT">おしい！</h2><p class="dlgP">こたえは <b>${esc(q.ans)}</b>。もう いちど ちょうせん できるよ</p>`);
}

/* ---------- ショップの せつめいにも のせる ---------- */
const FAC_DESC = {field:'🌱 やさいを そだてて しゅうかく', park:'🛝 住民が あそびに 来る', library:'📚 こうりゃく本を かりられる', school:'🏫 住民が かよって かしこく なる',
  parking:'🚗 たまに 車が とまって りょうきんが もらえる', clinic:'🏥 けがを した 住民を なおす', cityhall:'🏛️ 住民わくを ふやせる', hotel:'🧳 かんこうきゃくと なかよく なれる',
  museum:'❓ 1日1かい てんじクイズ', windmill:'🌬️ 畑の やさいが はやく そだつ'};
const _itemEffectFac = itemEffect;
itemEffect = function(it){ const s = _itemEffectFac.apply(this, arguments); return it && FAC_DESC[it.id] ? `${s}${s ? '・' : ''}${FAC_DESC[it.id]}` : s; };

/* =====================================================================
   まちの 上の 表示
   ===================================================================== */
function ovHTML(k, id){
  const f = F();
  if(id==='field'){ const p = f.farm[k]; if(!p) return '';
    const c = CROP(p.c), pr = farmProg(p);
    return pr >= 1 ? `<img class="facOv crop" src="${esc(artSrc(cropArt(c)))}" alt=""><span class="facOv ready">!</span>` : `<span class="facOv sprout">${pr < 0.5 ? '🌱' : '🌿'}</span>`; }
  if(id==='parking'){ const p = f.parking[k], it = p && ITEM(p.v); return it && !p.paid ? '<span class="facOv ready">🪙</span>' : ''; }   // v5.5：車の 絵は drawLots だけ（2重に ならない）
  if(id==='park' && f.park.ids.length) return `<span class="facOv badge">${f.park.game ? f.park.game[1] : '🎵'}${f.park.ids.length}</span>`;
  if(id==='school' && f.school.day===dayKey() && f.school.ids.length) return `<span class="facOv badge">✏️${f.school.ids.length}</span>`;
  if(id==='hotel' && f.tour.length) return `<span class="facOv badge">🧳${f.tour.length}</span>`;
  if(id==='clinic' && hurtList().length) return '<span class="facOv ready">🩹</span>';
  if(id==='library' && f.books.length) return `<span class="facOv badge">📖${f.books.length}</span>`;
  return '';
}
function decorate(){
  if(curScreen!=='town' || !save.town) return;
  $$('#townMap .facOv').forEach(e => e.remove());
  Object.entries(save.town.cells).forEach(([k,id]) => { const h = ovHTML(k, id); if(!h) return; const [x,y] = k.split(',');
    const c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', h); });
  WK.st.forEach((s, id) => { if(!s.el) return; const r = resBy(id), h = !!(r && r.hurt), b = s.el.querySelector('.facHurt');
    s.el.classList.toggle('facHurtW', h); if(h && !b) s.el.insertAdjacentHTML('beforeend', '<i class="facHurt">🩹</i>'); if(!h && b) b.remove(); });
}
const _renderMapFac = renderMap;
renderMap = function(){ const o = _renderMapFac.apply(this, arguments); try{ facTick(true); decorate(); }catch(e){ console.warn(e); } return o; };

/* 住民の うごき：公園・学校へ むかう／けがを していると ゆっくり */
const _chooseGoalFac = chooseGoal;
chooseGoal = function(s, r){
  try{ if(!r.hurt){ const f = F(); let tgt = null, act = null;
    if(f.park.ids.includes(r.id) && Math.random() < 0.55){ tgt = choice(cellsOf('park')); act = 'play'; }
    else if(f.school.day===dayKey() && f.school.ids.includes(r.id) && Math.random() < 0.5){ tgt = choice(cellsOf('school')); act = 'study'; }
    if(tgt){ const [bx,by] = tgt.split(',').map(Number), path = bfs(s.x, s.y, (x,y) => Math.abs(x-bx)+Math.abs(y-by)===1);
      if(path && path.length){ s.path = path; s.pend = {a:act, fx:bx}; return; } } } }catch(e){}
  return _chooseGoalFac.apply(this, arguments);
};
const _walkTickFac = walkTick;
walkTick = function(){
  const o = _walkTickFac.apply(this, arguments);
  try{ hurtList().forEach(r => { const s = WK.st.get(r.id); if(!s) return; if(s.path.length > 3) s.path = s.path.slice(0,3); if(!s.wait && Math.random() < 0.6) s.wait = 1; }); }catch(e){}
  return o;
};

/* ---------- タッチ ---------- */
const FAC = {bg_hospital:openClinic, field:openField, park:openPark, school:openSchool, parking:openParking, clinic:openClinic, cityhall:openHall, hotel:openHotel, library:openLibrary, museum:openMuseum};
window.addEventListener('click', async e => {
  if(curScreen!=='town' || townEdit || !save.town) return;
  const w = e.target.closest('#townMap .walker');
  if(w){ const r = resBy(w.dataset.id); if(r && r.hurt && r.id!==ghosted()){ e.stopImmediatePropagation(); e.preventDefault(); hurtTap(r); } return; }
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const key = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[key], fn = FAC[id]; if(!fn) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(await tryScene(id)) return;
  fn(key);
}, true);

/* ---------- ときどき まちが うごく ---------- */
function facTick(quiet){
  if(!save.town) return;
  let ch = false;
  [refreshParking, refreshPark, refreshSchool, refreshTour, refreshBooks, hurtCheck].forEach(fn => { try{ if(fn()) ch = true; }catch(e){ console.warn(e); } });
  if(ch){ persist(); if(!quiet) decorate(); }
  else if(!quiet && curScreen==='town') decorate();   // 畑の そだち ぐあい
}
setInterval(() => { if(!document.hidden && !$('#dlg').classList.contains('show')) facTick(false); }, 20000);
})();
