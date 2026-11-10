/* =====================================================================
   まなびタウン v4.2：たてものの きのう（v7.3：ホテル家具の 上から見た絵／ハナを 前面に）
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
  f.tour = f.tour || []; f.pals = f.pals || {}; f.htl = f.htl || {};
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
window.NOPARK623 = new Set(['fire','ambulance','police','whitebike','ladder','rescue','command','mixer','crane','excavator','dump','roller','forklift','snowplow','tow','tractor','sweeper','compactor','garbage','tanker','carriage','partybus','kart','bicycle']);   // v6.23：きんきゅう車・工事車・イベント車は パーキングに とまらない
const guestCars = () => TOWN_ITEMS.filter(it => it.type==='veh' && it.art && !it.ship && !it.air && (it.lv||1) <= save.town.lv + 3 && !NOPARK623.has(it.id));
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
   ホテル v7.0：豪華な外観 → 部屋 → 観光客と仲良くなる → レターで来やすく
   （仕様書 hotel_spec_v0.3：部屋8種・レア度別確率・おみやげ・ホテル限定品）
   ===================================================================== */
const TOUR_CD = 10*MIN, HIMG = './assets/images/hotel/';
const himg = n => HIMG + n + '.webp';
const hurl = n => { try{ return new URL(himg(n), location.href).href; }catch(e){ return himg(n); } };   // CSS変数用（絶対パス）
const isL = () => matchMedia('(orientation: landscape) and (min-width: 700px)').matches;
const hasHome = (s, ...h) => h.includes(s.home);
/* 部屋：g＝解放グレード／P＝[ふつう, ちょっとレア, レア, ちょうレア]（％） */
const ROOMS = [
  {id:'std',    n:'スタンダードルーム',   s:'スタンダード',     g:0, P:[70,25,5,0],     like:'家に住む動物',       pool:s => hasHome(s,'house')},
  {id:'wa',     n:'和室',                 s:'和室',             g:0, P:[65,28,7,0],     like:'和風の動物',         pool:s => hasHome(s,'bamboo') || ['tanuki','fox','frog','sparrow','hedgehog'].includes(s.id)},
  {id:'ocean',  n:'オーシャンビュールーム', s:'オーシャン', g:1, P:[62,28,9.5,0.5], like:'水辺の動物',         pool:s => hasHome(s,'water')},
  {id:'forest', n:'森のコテージルーム',   s:'森のコテージ',     g:1, P:[62,28,9.5,0.5], like:'森の動物',           pool:s => hasHome(s,'tree','log')},
  {id:'sky',    n:'スカイテラスルーム',   s:'スカイテラス',     g:2, P:[58,30,11,1],    like:'鳥のなかま',         pool:s => hasHome(s,'bird')},
  {id:'snow',   n:'雪見ルーム',           s:'雪見',             g:2, P:[58,30,11,1],    like:'寒い所の動物',       pool:s => ['penguin','seal','shima','bear','alpaca','owl'].includes(s.id)},
  {id:'suite',  n:'スイートルーム',       s:'スイート',         g:3, P:[45,35,18,2],    like:'いろいろな動物',     pool:() => true},
  {id:'royal',  n:'ロイヤルスイート',     s:'ロイヤル',         g:3, P:[30,40,27,3],    like:'すごいお客さんも…？', pool:() => true}
];
const ROOM = id => ROOMS.find(r => r.id===id);
/* 外観イラストの 窓の 位置（％：left, top, width, height） */
const SPOTS_P = {suite:[10.4,13.3,29,13], royal:[56.8,13.3,29,13], sky:[9.9,28.3,29,13.7], snow:[56.8,28.3,29,13.7],
  ocean:[9.9,44,29,13.6], forest:[56.8,44,29,13.6], std:[10,59.6,21,12.4], wa:[66,59.6,20,12.4]};
const SPOTS_L = {std:[19.7,22.8,12,15.7], wa:[35.6,22.8,12.2,15.7], ocean:[51.8,22.8,11.8,15.7], forest:[68,22.8,12.2,15.7],
  sky:[19.7,41.4,12,15.7], snow:[35.6,41.4,12.2,15.7], suite:[51.8,41.4,11.8,15.7], royal:[68,41.4,12.2,15.7]};
const FR_MAX = {1:3, 2:3, 3:4, 4:5};
const RAR_C = {1:'#B8A48C', 2:'#2F86C6', 3:'#9B4FD0', 4:'#E0A400'};
/* おみやげ（ホテル限定）。grp＝好きな物の グループ */
const SOUV = [
  {id:'sv_postcard',  n:'まちの絵はがき',     p:60,  grp:'scene'},
  {id:'sv_cookie',    n:'まちのクッキー',     p:80,  grp:'sweet'},
  {id:'sv_bouquet',   n:'花たば',             p:120, grp:'flower'},
  {id:'sv_keyholder', n:'ご当地キーホルダー', p:150, grp:'goods'},
  {id:'sv_cake',      n:'特製ケーキ',         p:250, grp:'sweet'},
  {id:'sv_omamori',   n:'金のおまもり',       p:600, grp:'all'}
];
const GRP = {scene:{h:'きれいな景色が好き',       i:'絵はがき'},
             sweet:{h:'甘い物が大好き',           i:'クッキー・ケーキ'},
             flower:{h:'お花が大好き',            i:'花たば'},
             goods:{h:'かわいい小物を集めてる',   i:'キーホルダー'}};
const SPECIAL = [
  {id:'itm_roomservice', n:'ルームサービス',           p:200,  g:0, d:'お客さん1人の仲良し度が＋1（1人1日1回）'},
  {id:'itm_goldbell',    n:'ゴールドベル',             p:1200, g:1, d:'24時間、レア以上のお客さんが来やすくなる（×1.5）'},
  {id:'itm_htlinvite',   n:'ホテルの招待状',           p:2000, g:2, d:'空いている部屋に、そうじ時間なしでお客さんを呼ぶ（その部屋の上位2段階のレア度だけ）'},
  {id:'itm_palletter',   n:'仲良しレター',             p:2500, g:3, d:'仲良しリストから1人選んで、必ず住民として来てもらう（住む家が必要）'}
];
const SV = id => SOUV.find(x => x.id===id) || SPECIAL.find(x => x.id===id);
/* ---------- ホテル限定の 家具・かざり（v7.1）：k='fur'＝わたしの家／k='deco'＝まち ---------- */
const HFUR = [
  {id:'htl_chandelier', art:'fur_htl_chandelier', n:'ゴールドシャンデリア',     k:'fur',  g:1, p:2000, sty:12, size:1.2, foot:[1,1], d:'キラキラ光る、ホテルの大シャンデリア'},
  {id:'htl_wagon',      art:'fur_htl_wagon',      n:'ルームサービスワゴン',     k:'fur',  g:1, p:1500, sty:8,  size:1.4, foot:[2,1], d:'お部屋にとどく、ごうかなワゴン'},
  {id:'htl_cart',       art:'fur_htl_cart',       n:'ベルボーイのにもつカート', k:'fur',  g:2, p:2500, sty:12, size:1.2, foot:[1,1], d:'旅行かばんがいっぱいの金色カート'},
  {id:'d_htlpenguin',   art:'dc_htl_penguin',     n:'ペンギンのドアマン像',     k:'deco', g:2, p:1800, dev:20, emoji:'🐧', d:'まちに置ける、ホテルのドアマンの像'},
  {id:'d_htlarch',      art:'dc_htl_arch',        n:'ホテルのバラのアーチ',     k:'deco', g:3, p:3000, dev:30, emoji:'🌹', d:'まちに置ける、赤いじゅうたんとバラのアーチ'}
];
/* 部屋の 記念家具：その部屋で はじめて 仲良しが できると お店に ならぶ */
const MEMO = [
  {id:'mm_std',    room:'std',    n:'ふかふかまくら',     p:1500, sty:8,  size:1.0, foot:[1,1]},
  {id:'mm_wa',     room:'wa',     n:'たたみの小上がり',   p:2000, sty:10, size:1.8, foot:[2,2]},
  {id:'mm_ocean',  room:'ocean',  n:'貝がらランプ',       p:2000, sty:10, size:1.0, foot:[1,1]},
  {id:'mm_forest', room:'forest', n:'きりかぶテーブル',   p:2000, sty:10, size:1.6, foot:[2,2]},
  {id:'mm_sky',    room:'sky',    n:'くものソファ',       p:2500, sty:12, size:1.6, foot:[2,1]},
  {id:'mm_snow',   room:'snow',   n:'雪の結晶ランプ',     p:2500, sty:12, size:1.1, foot:[1,1]},
  {id:'mm_suite',  room:'suite',  n:'ゴールドミラー',     p:3500, sty:16, size:1.3, foot:[2,1]},
  {id:'mm_royal',  room:'royal',  n:'おうかんのベッド',   p:5000, sty:25, size:1.8, foot:[2,2]}
].map(m => Object.assign({art:'fur_' + m.id, k:'fur', g:0, d:`${ROOM(m.room).n}の記念家具`}, m));
const HF = id => HFUR.find(x => x.id===id) || MEMO.find(x => x.id===id);
try{
  HFUR.concat(MEMO).forEach(f => {
    DEFAULT_ART[f.art] = himg(f.art); SHOP_ONLY[f.id] = 'hotel';
    if(f.k==='fur') DEFAULT_ART['ft_' + f.id] = himg('ft_' + f.id);   // 上から見た絵（v7.3）
    if(f.k==='fur'){
      if(!FURNITURE.some(x => x.id===f.id)) FURNITURE.push({id:f.id, name:f.n, art:f.art, type:'fur', price:f.p, lv:5, sty:f.sty, special:true, hotel:true});
      if(f.foot) FOOT[f.id] = f.foot;
      FUR_SIZE[f.id] = f.size || 1; SIDE_W[f.id] = f.foot ? f.foot[0]*0.95 + 0.1 : 1;
    } else if(!TOWN_ITEMS.some(x => x.id===f.id)){
      TOWN_ITEMS.push({id:f.id, type:'bld', cat:'deco', name:f.n, art:f.art, emoji:f.emoji, price:f.p, lv:5, dev:f.dev, ev:'hotel'});
    }
  });
}catch(e){ console.warn('hotel fur', e); }
const hOwned = f => f.k==='fur' ? (() => { const H = ensureHome(); return (H.inv[f.id]||0) + H.items.filter(i => i.id===f.id).length; })()
  : (save.town.inv[f.id]||0) + Object.values(save.town.cells).filter(v => v===f.id).length;
const TOUR_LINES = ['この町、すてきだね！来てよかった〜','今日はどこを見に行こうかな？','この町のおすすめの場所、教えて！',
  'ホテルのベッド、ふかふかだったよ','町のみんな、やさしいね','写真をいっぱい撮っちゃった！','次のお休みも、また来たいなあ','このお部屋、とっても気に入ったよ'];

function HT(){
  const f = F(), h = f.htl || (f.htl = {});
  h.clean = h.clean || {}; h.bag = h.bag || {}; h.palList = h.palList || []; h.memo = h.memo || {}; h.bell = h.bell || 0;
  return h;
}
const hGrade = () => maxGlv('hotel');
const openRooms = () => ROOMS.filter(r => r.g <= hGrade());
const cleanMs = () => Math.max(0.4, 1 - 0.2*Math.max(0, cellsOf('hotel').length - 1)) * 30*MIN;
const guestIn = id => F().tour.find(t => t.room===id);
const frMax = t => FR_MAX[SP(t.sp).rar||1] || 3;
const rarOf = t => SP(t.sp).rar || 1;

/* レア度を 決める（ゴールドベル：レア以上×1.5、ちょうレアは 最大4.5％） */
function rollRar(room, top2){
  let P = room.P.slice();
  if(HT().bell > now()){ P[2] *= 1.5; P[3] = Math.min(4.5, P[3]*1.5); P[0] = Math.max(0, 100 - P[1] - P[2] - P[3]); }
  if(top2){ const idx = [0,1,2,3].filter(i => P[i] > 0).slice(-2); P = P.map((v,i) => idx.includes(i) ? v : 0); }
  let x = Math.random() * P.reduce((a,b) => a+b, 0);
  for(let i=0;i<4;i++){ x -= P[i]; if(x <= 0 && P[i] > 0) return i+1; }
  return 1;
}
function pickTourist(room, top2){
  const live = new Set(save.town.res.map(r => r.sp)), cur = new Set(F().tour.map(t => t.sp));
  const ok = s => !s.human && (s.w||0) > 0 && (s.rar||1) <= 4;
  let rar = rollRar(room, top2);
  for(; rar >= 1; rar--){
    const base = SPECIES.filter(s => ok(s) && (s.rar||1)===rar && !cur.has(s.id));
    const tries = [base.filter(s => room.pool(s) && !live.has(s.id)), base.filter(s => room.pool(s)), base.filter(s => !live.has(s.id)), base];
    const pool = tries.find(a => a.length);
    if(pool){ let x = Math.random() * pool.reduce((a,s) => a + (s.w||1), 0); for(const s of pool){ x -= (s.w||1); if(x <= 0) return s; } return pool[pool.length-1]; }
  }
  return null;
}
function newGuest(room, top2){
  const s = pickTourist(room, top2); if(!s) return null;
  const used = new Set(save.town.res.map(r => r.name).concat(F().tour.map(t => t.name)));
  const nm = NAMES.filter(n => !used.has(n));
  const grps = shuffle(Object.keys(GRP)).slice(0,2);
  const r4 = (s.rar||1) >= 4;
  const g = {id:'t'+now().toString(36)+rint(100,999), sp:s.id, name: nm.length ? choice(nm) : choice(NAMES), star:1, ab:{},
    room:room.id, fr:0, last:0, fav:grps, favKnown:[], gd:'', gn:0, rsd:'', until: now() + (r4 ? rint(6,10) : rint(8,14))*60*MIN, fresh: r4};
  F().tour.push(g); try{ discover(s.id); }catch(e){}
  return g;
}
function refreshTour(){
  const f = F(), h = HT(); let ch = false;
  f.tour.forEach(t => { if(!t.fav){ t.fav = shuffle(Object.keys(GRP)).slice(0,2); t.favKnown = []; ch = true; } });
  const gone = f.tour.filter(t => t.until <= now());
  if(gone.length){ gone.forEach(t => { if(t.room) h.clean[t.room] = t.until + cleanMs(); }); f.tour = f.tour.filter(t => t.until > now()); ch = true; }
  if(!has('hotel')) return ch;
  const open = openRooms();
  /* ロビーで 待っている お客さん（前の版から 引き継ぎ）を 空き部屋へ */
  f.tour.filter(t => !t.room || !ROOM(t.room) || ROOM(t.room).g > hGrade()).forEach(t => {
    const r = open.find(r => !guestIn(r.id)); if(r){ t.room = r.id; ch = true; } else if(t.room){ t.room = null; ch = true; } });
  open.forEach(r => { if(!guestIn(r.id) && (h.clean[r.id]||0) <= now()){ if(newGuest(r)) ch = true; } });
  return ch;
}
/* お客さんの絵：ふちの中に「縦横比を保って」おさめる（引き伸ばし防止） */
const gSrc = t => { const s = SP(t.sp); return s.img || artSrc(s.art) || ''; };
const gImg = (t, cls='') => { const s = SP(t.sp), src = gSrc(t);
  return src ? `<img class="hgImg ${cls}" src="${esc(src)}" alt="">` : `<span class="hgEmo ${cls}">${s.emoji||'🐾'}</span>`; };
const tourObj = t => ({id:t.id, sp:t.sp, name:t.name, star:1, ab:{}, pers:t.pers, hobby:t.hobby, kuchi:t.kuchi});
const vegIds = () => { const B = foodBag(); return Object.keys(B).filter(k => B[k] > 0 && /^f_(tomato|carrot|cabbage|eggplant|corn|daikon|pumpkin|apple|banana|grapes|strawberry|watermelon)$/.test(k)); };
const heartsT = t => t.pal ? '<span class="facHearts">💞 仲良し！</span>' : hearts(t.fr, frMax(t));
const rarTag = t => { const R = RARITY[rarOf(t)]; return `<span class="htlRar" style="background:${R.c}">${R.n}</span>`; };

/* ---------- 画面のわく ---------- */
let HV = null;   // {view, key, room, guest}
function hRoot(){
  let el = document.getElementById('htl');
  if(!el){ el = document.createElement('div'); el.id = 'htl'; document.body.appendChild(el);
    el.addEventListener('click', hClick);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(HV && el.classList.contains('show')) hRender(); }, 150); }); }
  return el;
}
function hBar(title){
  return `<div class="htlBar"><button class="htlBack" data-h="back">◀</button><b>${title}</b>
    <span class="htlPt"><span class="coin sm">P</span>${nf(save.points.bal)}</span><button class="htlX" data-h="close">✕</button></div>`;
}
function stage(img, ratio, inner, cls=''){
  return `<div class="htlStage ${cls}" style="aspect-ratio:${ratio}"><img class="htlBg" src="${img}" alt="" draggable="false">${inner||''}</div>`;
}
function hClose(){ const el = hRoot(); el.classList.remove('show'); el.innerHTML = ''; HV = null; try{ decorate(); }catch(e){} }
function hGo(view, o={}){ HV = Object.assign({}, HV, {view}, o); hRender(); }
function hRender(){
  if(!HV) return;
  const el = hRoot(), L = isL(); el.className = 'show ' + (L ? 'hL' : 'hP');
  const V = {top:vTop, room:vRoom, talk:vTalk, shop:vShop, grade:vGrade, pals:vPals}[HV.view] || vTop;
  el.innerHTML = V(L); el.scrollTop = 0;
}

/* ---------- H-01 トップ ---------- */
function spotHTML(r, sp){
  const [x,y,w,h] = sp[r.id], t = guestIn(r.id), lock = r.g > hGrade(), cl = HT().clean[r.id] || 0;
  let inner = '', cls = 'htlSpot';
  if(lock){ cls += ' hLock'; inner = `<img src="${himg('room_locked')}" alt=""><i>★${r.g}</i>`; }
  else if(t){ cls += ' hOn r' + rarOf(t);
    const ar = (w / h) * (sp===SPOTS_L ? 1.5 : 0.75), fh = 64, fw = Math.min(60, fh / ar);   // 窓の 実際の 縦横比から 正方形の 枠を 計算
    inner = `<span class="htlFace" style="width:${fw.toFixed(1)}%;height:${(fw * ar).toFixed(1)}%">${gImg(t)}</span>${t.pal ? '<i class="hPalI">💞</i>' : ''}`; }
  else { cls += ' hClean'; inner = `<img src="${himg('room_cleaning')}" alt=""><i>${cl > now() ? left(cl - now()) : '…'}</i>`; }
  return `<button class="${cls}" data-h="room:${r.id}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">${inner}</button>`;
}
function cardHTML(r){
  const t = guestIn(r.id), lock = r.g > hGrade(), cl = HT().clean[r.id] || 0;
  const st = lock ? `🔒 ★${r.g}で解放` : t ? `${esc(t.name)}${t.pal ? ' 💞' : ''}` : `🧹 そうじ中 ${cl > now() ? left(cl - now()) : ''}`;
  return `<button class="htlCard ${lock ? 'hLock' : t ? 'hOn r' + rarOf(t) : ''}" data-h="room:${r.id}"><img src="${himg('door_' + r.id)}" alt=""><span><b>${r.s}</b><small>${st}</small></span></button>`;
}
function concierge(){
  const T = F().tour.filter(t => t.room), rare = T.filter(t => rarOf(t) >= 3);
  if(HT().bell > now()) return `ゴールドベルが鳴っています！あと${left(HT().bell - now())}、レアなお客さんが来やすいですよ。`;
  if(rare.length) return `ただいま${RARITY[rarOf(rare[0])].n}のお客さま「${esc(rare[0].name)}」さんがお泊まり中です！`;
  if(!T.length) return 'ただいまお部屋のそうじ中です。少し待ってからまた来てくださいね。';
  return `ようこそ！ただいま${T.length}組のお客さまがお泊まりです。お部屋をタッチして会いに行きましょう。`;
}
function vTop(L){
  const sp = L ? SPOTS_L : SPOTS_P, g = hGrade();
  const front = L ? '' : `<img class="htlFront" src="${himg('htl_top_p')}" alt="" draggable="false">`;   // ハナを 窓より 前に
  const img = stage(himg(L ? 'htl_top_l' : 'htl_top_p'), L ? '3/2' : '3/4', ROOMS.map(r => spotHTML(r, sp)).join('') + front, 'hTopS');
  const side = `<div class="htlSay"><img src="${himg('htl_penguin_wave')}" alt=""><p>${concierge()}</p></div>
    <div class="htlGrid">${ROOMS.map(cardHTML).join('')}</div>
    <div class="htlBtns"><button class="htlB gold" data-h="shop">🛎️ ホテルのお店</button><button class="htlB" data-h="pals">💞 仲良し <small>${HT().palList.length}</small></button>
    <button class="htlB" data-h="grade">⬆ グレード <small>${'★'.repeat(g)}${'☆'.repeat(3-g)}</small></button><button class="htlB" data-h="close">とじる</button></div>`;
  return hBar('🏨 ホテル') + `<div class="htlBody topV">${img}<div class="htlSide">${side}</div></div>`;
}

/* ---------- H-02 部屋 ---------- */
function vRoom(L){
  const r = ROOM(HV.room), t = guestIn(r.id), lock = r.g > hGrade(), cl = HT().clean[r.id] || 0;
  let guest = '', panel = '';
  if(lock){
    panel = `<div class="htlInfo"><h3>🔒 ${r.n}</h3><p>ホテルを ★${r.g} にグレードアップすると泊まれるようになります。</p><p class="sub">来やすいお客さん：${r.like}</p>
      <div class="htlBtns"><button class="htlB gold" data-h="grade">⬆ グレードアップ</button></div></div>`;
  } else if(!t){
    panel = `<div class="htlInfo"><h3>🧹 ${r.n}</h3><p>ただいまおそうじ中です。${cl > now() ? `あと <b>${left(cl - now())}</b> で次のお客さんが来ます。` : 'もうすぐ次のお客さんが来ます。'}</p>
      <p class="sub">来やすいお客さん：${r.like}</p>${(HT().bag.itm_htlinvite||0) > 0 ? '<div class="htlBtns"><button class="htlB gold" data-h="invite">💌 招待状を使う</button></div>' : ''}</div>`;
  } else {
    const o = tourObj(t);
    guest = `<div class="htlGuest r${rarOf(t)}" data-h="talk">${gImg(t)}</div>`;
    panel = `<div class="htlInfo">${rarTag(t)}<h3>${esc(t.name)} <small>（${esc(SP(t.sp).name)}）</small></h3>
      <p>仲良し度 ${heartsT(t)}</p><p class="sub">あと ${left(t.until - now())} 泊まります ／ ${r.n}</p>
      ${t.favKnown && t.favKnown.length ? `<p class="sub">好きな物：${t.favKnown.map(k => GRP[k].i).join('、')}</p>` : ''}
      <div class="htlBtns"><button class="htlB gold" data-h="talk">💬 話しかける</button>${t.pal ? '' : '<button class="htlB" data-h="gift">🎁 おみやげ</button>'}</div></div>`;
  }
  const bg = stage(himg(`room_${r.id}_${L ? 'l' : 'p'}`), L ? '3/2' : '3/4', guest, 'hRoomS' + (lock ? ' hDim' : ''));
  return hBar(`${r.n}`) + `<div class="htlBody roomV">${bg}${panel}</div>`;
}

/* ---------- H-03 おはなし・おみやげ ---------- */
function giftGrid(t){
  const B = HT().bag, today = dayKey(), giftLeft = t.gd===today ? 2 - t.gn : 2, veg = vegIds();
  const items = SOUV.map(s => { const n = B[s.id]||0, dis = !n || giftLeft <= 0;
    return `<button class="htlItem" data-h="give:${s.id}" ${dis ? 'disabled' : ''}><img src="${himg(s.id)}" alt=""><b>${s.n}</b><small>${n}こ</small></button>`; }).join('');
  const rs = B.itm_roomservice||0, rsDis = !rs || t.rsd===today;
  return `<p class="sub">おみやげは 1日2回まで（今日はあと${Math.max(0,giftLeft)}回）</p><div class="htlItems">${items}
    <button class="htlItem" data-h="give:itm_roomservice" ${rsDis ? 'disabled' : ''}><img src="${himg('itm_roomservice')}" alt=""><b>ルームサービス</b><small>${rs}こ${t.rsd===today ? '・今日はずみ' : ''}</small></button>
    <button class="htlItem" data-h="give:veg" ${veg.length ? '' : 'disabled'}><span class="emo">🥕</span><b>畑のやさい</b><small>${veg.length ? 'あげられる' : 'なし'}</small></button></div>
    <div class="htlBtns"><button class="htlB" data-h="shop">🛎️ お店で買う</button></div>`;
}
function vTalk(L){
  const t = F().tour.find(x => x.id===HV.guest); if(!t){ HV.view = 'top'; return vTop(L); }
  const o = tourObj(t);
  const body = `<div class="htlTalkG r${rarOf(t)}">${gImg(t)}</div><div class="talkBubble htlBub"><b>${esc(t.name)}</b>${esc(speak(o, HV.line || '…'))}</div>`;
  const panel = `<div class="htlInfo">${rarTag(t)}<h3>${esc(t.name)}</h3><p>仲良し度 ${heartsT(t)}</p>
    ${t.pal ? '<p class="sub">レターを使うと、この町に住みに来てくれるかも！</p>' : giftGrid(t)}
    <div class="htlBtns"><button class="htlB" data-h="room:${t.room}">◀ 部屋にもどる</button></div></div>`;
  return hBar('💬 おはなし') + `<div class="htlBody talkV">${stage(himg(L ? 'htl_talk_l' : 'htl_talk_p'), L ? '3/2' : '3/4', body, 'hTalkS')}${panel}</div>`;
}
async function talkTo(t){
  const o = tourObj(t); persOf(o); Object.assign(t, {pers:o.pers, hobby:o.hobby, kuchi:o.kuchi});
  const cd = now() - (t.last||0) < TOUR_CD && !t.pal;
  let line;
  if(t.pal) line = 'きみと仲良くなれてうれしいな！この町に住みたくなっちゃった';
  else if(cd) line = 'さっきいっぱいお話ししたね。また後でお話ししよう！';
  else {
    t.fr = Math.min(frMax(t), t.fr + 1); t.last = now(); sound('ok');
    const unknown = (t.fav||[]).filter(k => !(t.favKnown||[]).includes(k));
    if(unknown.length && Math.random() < 0.5){ const k = choice(unknown); t.favKnown = (t.favKnown||[]).concat(k); line = `じつはね、${GRP[k].h}なんだ！`; }
    else line = choice(TOUR_LINES);
  }
  persist(); hGo('talk', {guest:t.id, line});
  if(!t.pal && t.fr >= frMax(t)) await becomePal(t);
}
async function give(t, id){
  const h = HT(), today = dayKey(); let line, up = 1, img;
  if(id==='veg'){
    const v = vegIds(); if(!v.length) return;
    const k = choice(v), B = foodBag(), fd = FD(k); B[k]--; if(!B[k]) delete B[k];
    line = `わあ！${fd?.n||'やさい'}だ！ありがとう〜とってもうれしい！`;
  } else if(id==='itm_roomservice'){
    if(!(h.bag[id] > 0) || t.rsd===today) return;
    h.bag[id]--; t.rsd = today; line = 'ルームサービス！？ぜいたくな気分〜ありがとう！';
  } else {
    const s = SV(id); if(!s || !(h.bag[id] > 0)) return;
    if(t.gd!==today){ t.gd = today; t.gn = 0; } if(t.gn >= 2){ toast('今日のおみやげはもう渡したよ'); return; }
    h.bag[id]--; t.gn++;
    const fav = s.grp==='all' || (t.fav||[]).includes(s.grp);
    if(fav){ up = 2; if(s.grp!=='all' && !(t.favKnown||[]).includes(s.grp)) t.favKnown = (t.favKnown||[]).concat(s.grp); }
    line = fav ? `${s.n}！これ、ずっとほしかったんだ！本当にありがとう！` : `${s.n}をくれるの？ありがとう！`;
  }
  t.fr = Math.min(frMax(t), t.fr + up); persist(); sound(up > 1 ? 'fan' : 'ok');
  if(up > 1) toast('💗💗 好きな物だった！仲良し度 ＋2'); else toast('💗 仲良し度 ＋1');
  hGo('talk', {guest:t.id, line});
  if(t.fr >= frMax(t)) await becomePal(t);
}
async function becomePal(t){
  const f = F(), h = HT(); if(t.pal) return;
  t.pal = true; f.pals[t.sp] = (f.pals[t.sp]||0) + 1;
  h.palList.push({id:t.id, sp:t.sp, name:t.name, room:t.room, at:now()});
  if(h.palList.length > 10){ const x = h.palList.shift(); if(f.pals[x.sp] > 0){ f.pals[x.sp]--; if(!f.pals[x.sp]) delete f.pals[x.sp]; } toast(`仲良しリストがいっぱいなので、${x.name}さんとはお別れしました`); }
  let newMemo = null;
  if(t.room && !h.memo[t.room]){ h.memo[t.room] = now(); newMemo = MEMO.find(m => m.room===t.room); }
  persist(); sound('fan'); confetti(2600);
  const sp = SP(t.sp), home = findHome(sp);
  await dialog(`<div class="htlFx" style="background-image:url('${hurl(isL() ? 'htl_pal_l' : 'htl_pal_p')}')"><div class="dlgArt big pop">${resPic(tourObj(t))}</div></div>
    <h2 class="dlgT">💞 ${esc(t.name)}と仲良しになった！</h2>
    <p class="dlgP">${esc(sp.name)}はこの町が気に入ったみたい！<br>「おまねきレター」「きらきらレター」を使うと<br><b>来てくれる確率がアップ</b>するよ！${home ? '' : `<br><small>※ 住む家「${esc(homeName(sp.home))}」に空きがあると来てくれるよ</small>`}</p>`,
    [{label:'やったー！', cls:'gold', v:1}], 'gold');
  if(newMemo){ sound('fan');
    await dialog(`<div class="dlgArt big pop"><img src="${himg(newMemo.art)}" alt=""></div><h2 class="dlgT">🎁 記念家具が登場！</h2>
      <p class="dlgP">${esc(ROOM(newMemo.room).n)}で はじめて 仲良しが できたので、<br>記念家具「<b>${esc(newMemo.n)}</b>」が<br>ホテルのお店に ならんだよ！</p>`, [{label:'見てみる', cls:'gold', v:1}], 'gold'); }
  hRender();
}
async function rareArrive(t){
  t.fresh = false; persist(); sound('fan'); confetti(3000);
  await dialog(`<div class="htlFx hRare" style="background-image:url('${hurl(isL() ? 'fx_rare_l' : 'fx_rare_p')}')"><div class="dlgArt big pop">${resPic(tourObj(t))}</div></div>
    <div class="rarTag" style="background:${RARITY[4].c}">${RARITY[4].n}</div><h2 class="dlgT">✨ すごいお客さんが来たよ！</h2>
    <p class="dlgP">${esc(ROOM(t.room)?.n || 'ホテル')}に <b>${esc(t.name)}（${esc(SP(t.sp).name)}）</b>が泊まっています！<br>会いに行ってみよう！</p>`, [{label:'会いに行く', cls:'gold', v:1}], 'gold');
}

/* ---------- H-05 お店 ---------- */
function vShop(L){
  const tab = HV.tab || 'sv', h = HT(), g = hGrade();
  const list = tab==='sv' ? SOUV.map(s => Object.assign({d:`好きな物グループ：${s.grp==='all' ? 'だれでも好物（＋2）' : GRP[s.grp].i}`}, s)) : SPECIAL;
  const furCard = f => { const lk = (f.g||0) > g, memo = f.room && !h.memo[f.room], can = save.points.bal >= f.p && !lk && !memo, own = hOwned(f);
    if(memo) return `<div class="htlSCard hLock hMemo"><img src="${himg(f.art)}" alt=""><div><b>？？？</b><span class="htlLim">記念家具</span>
      <small>${esc(ROOM(f.room).n)}で はじめて 仲良しが できると ならびます</small></div><div class="htlSBtns"><button class="htlB" disabled>🔒 まだ</button></div></div>`;
    return `<div class="htlSCard ${lk ? 'hLock' : ''}"><img src="${himg(f.art)}" alt=""><div><b>${esc(f.n)}</b><span class="htlLim">${f.room ? '記念家具' : 'ホテル限定'}</span>
      <small>${esc(f.d)}${f.k==='deco' ? '（まちの かざり）' : '（わたしの家の 家具）'}</small><small>持っている数：${own}</small></div>
      <div class="htlSBtns"><button class="htlB ${can ? 'gold' : ''}" data-h="fbuy:${f.id}" ${lk ? 'disabled' : ''}>${lk ? `★${f.g}で解放` : `<span class="coin sm">P</span>${nf(f.p)}`}</button></div></div>`; };
  const cards = tab==='fur' ? `<p class="htlCap">✨ ホテル限定の 家具・かざり</p><div class="htlShop">${HFUR.map(furCard).join('')}</div>
      <p class="htlCap">🎁 お部屋の 記念家具（${MEMO.filter(m => h.memo[m.room]).length} / ${MEMO.length}）</p><div class="htlShop">${MEMO.map(furCard).join('')}</div>
      <div class="htlFur"><img src="${himg('htl_penguin_think')}" alt=""><p>バスタブやシャンデリアなど、いつもの ホテルの家具は「家具のお店」で 買えます。</p>
      <button class="htlB gold" data-h="furshop">🛋️ 家具のお店へ</button></div>`
    : `<div class="htlShop">${list.map(s => { const lk = (s.g||0) > g, can = save.points.bal >= s.p && !lk;
      return `<div class="htlSCard ${lk ? 'hLock' : ''}"><img src="${himg(s.id)}" alt=""><div><b>${s.n}</b><span class="htlLim">ホテル限定</span><small>${s.d}</small>
        <small>持っている数：${h.bag[s.id]||0}${s.id==='itm_goldbell' && h.bell > now() ? `（使用中 あと${left(h.bell - now())}）` : ''}</small></div>
        <div class="htlSBtns"><button class="htlB ${can ? 'gold' : ''}" data-h="buy:${s.id}" ${lk ? 'disabled' : ''}>${lk ? `★${s.g}で解放` : `<span class="coin sm">P</span>${nf(s.p)}`}</button>
        ${['itm_goldbell','itm_htlinvite','itm_palletter'].includes(s.id) && (h.bag[s.id]||0) > 0 ? `<button class="htlB" data-h="use:${s.id}">使う</button>` : ''}</div></div>`; }).join('')}</div>`;
  const tabs = `<div class="htlTabs">${[['sv','🎁 おみやげ'],['sp','✨ スペシャル'],['fur','🛋️ 家具・かざり']].map(([k,n]) => `<button class="${k===tab ? 'hOn' : ''}" data-h="tab:${k}">${n}</button>`).join('')}</div>`;
  return hBar('🛎️ ホテルのお店') + `<div class="htlBody listV hShopV" style="--bg:url('${hurl(L ? 'htl_shop_l' : 'htl_shop_p')}')">${tabs}${cards}</div>`;
}
async function buy(id){
  const s = SV(id); if(!s) return;
  if((s.g||0) > hGrade()){ toast(`ホテルを★${s.g}にすると買えるよ`); return; }
  if(save.points.bal < s.p){ toast('ポイントが足りないよ'); return; }
  givePts(-s.p, `ホテルのお店で ${s.n}`); const h = HT(); h.bag[id] = (h.bag[id]||0) + 1; persist(); sound('ok');
  toast(`${s.n}を買ったよ！`); hRender();
}
async function fbuy(id){
  const f = HF(id); if(!f) return;
  if((f.g||0) > hGrade()){ toast(`ホテルを★${f.g}にすると買えるよ`); return; }
  if(f.room && !HT().memo[f.room]){ toast('まだ ならんで いないよ'); return; }
  if(save.points.bal < f.p){ toast('ポイントが足りないよ'); return; }
  givePts(-f.p, `ホテルのお店で ${f.n}`);
  if(f.k==='fur'){ const H = ensureHome(); H.inv[f.id] = (H.inv[f.id]||0) + 1; }
  else { const t = save.town; t.inv[f.id] = (t.inv[f.id]||0) + 1; }
  if(f.k==='deco'){ try{ discover(f.id); }catch(e){} }
  persist(); sound('ok'); confetti(900);
  toast(f.k==='fur' ? `${f.n}を買ったよ！「わたしの家」の もようがえで おけるよ` : `${f.n}を買ったよ！まちの もようがえで おけるよ`);
  try{ checkBadges(); }catch(e){}
  hRender();
}
async function useItem(id){
  const h = HT(); if(!(h.bag[id] > 0)) return;
  if(id==='itm_goldbell'){
    h.bag[id]--; h.bell = Math.max(now(), h.bell) + 24*60*MIN; persist(); sound('fan'); confetti(1400);
    toast('🔔 ゴールドベルを鳴らしたよ！24時間レアなお客さんが来やすい'); hRender(); return;
  }
  if(id==='itm_htlinvite'){
    const r = openRooms().find(r => !guestIn(r.id));
    if(!r){ toast('空いている部屋がないよ'); return; }
    return useInvite(r.id);
  }
  if(id==='itm_palletter'){ hGo('pals', {pick:true}); }
}
async function useInvite(roomId){
  const h = HT(), r = ROOM(roomId); if(!(h.bag.itm_htlinvite > 0) || guestIn(roomId)) return;
  h.bag.itm_htlinvite--; delete h.clean[roomId];
  const g = newGuest(r, true); persist();
  if(!g){ h.bag.itm_htlinvite++; persist(); toast('今は呼べるお客さんがいないみたい'); return; }
  sound('fan'); toast(`💌 ${r.n}に ${g.name}さんが来たよ！`);
  if(g.fresh) await rareArrive(g);
  hGo('room', {room:roomId});
}

/* ---------- H-06 グレード ---------- */
function vGrade(L){
  const g = hGrade(), nx = ROOMS.filter(r => r.g===g+1);
  const rows = [0,1,2,3].map(n => `<div class="htlGRow ${n<=g ? 'hOn' : ''}"><b>${'★'.repeat(n) || '☆0'}</b>${ROOMS.filter(r => r.g===n).map(r => `<span><img src="${himg('door_' + r.id)}" alt="">${r.s}</span>`).join('')}</div>`).join('');
  return hBar('⬆ ホテルのグレード') + `<div class="htlBody listV" style="--bg:url('${hurl(L ? 'htl_grade_l' : 'htl_grade_p')}')">
    <div class="htlPanel"><img class="htlBanner" src="${himg(L ? 'htl_grade_l' : 'htl_grade_p')}" alt=""><div class="htlSay"><img src="${himg('htl_penguin_cheer')}" alt=""><p>${g >= 3 ? '最高のホテルになりました！すべてのお部屋が使えます。' : `グレードアップすると「${nx.map(r => r.s).join('」「')}」のお部屋が増えます！`}</p></div>
    ${rows}<p class="sub">グレードアップは、建物のメニューから行います（費用はいつもと同じです）。</p>
    <div class="htlBtns">${g < 3 ? '<button class="htlB gold" data-h="dograde">⬆ グレードアップする</button>' : ''}<button class="htlB" data-h="top">◀ ホテルにもどる</button></div></div></div>`;
}

/* ---------- H-07 仲良しリスト ---------- */
function vPals(L){
  const h = HT(), pick = HV.pick && (h.bag.itm_palletter||0) > 0;
  const list = h.palList.slice().reverse().map(p => { const sp = SP(p.sp), home = findHome(sp);
    return `<div class="htlPal r${sp.rar||1}">${resPic({id:p.id, sp:p.sp, name:p.name, star:1, ab:{}})}<div><b>${esc(p.name)}</b> <small>${esc(sp.name)}／${esc(ROOM(p.room)?.s || '')}</small>
      <small>${home ? '🏠 住む家あり：レターで来てくれるかも' : `🏠 「${esc(homeName(sp.home))}」が必要`}</small></div>
      ${pick ? `<button class="htlB gold" data-h="palcall:${p.id}" ${home ? '' : 'disabled'}>来てもらう</button>` : ''}</div>`; }).join('');
  return hBar('💞 仲良しリスト') + `<div class="htlBody listV" style="--bg:url('${hurl(L ? 'htl_palbook_l' : 'htl_palbook_p')}')"><div class="htlPanel"><img class="htlBanner" src="${himg(L ? 'htl_palbook_l' : 'htl_palbook_p')}" alt="">
    <div class="htlSay"><img src="${himg('htl_penguin_wave')}" alt=""><p>${pick ? '仲良しレターで来てもらうお客さんを選んでください。' : '仲良しになったお客さんです。レターを使うと、町に住みに来てくれる確率が上がります（最大10人）。'}</p></div>
    ${list || '<p class="sub">まだ仲良しのお客さんはいません。お部屋をたずねて話しかけてみよう！</p>'}
    <div class="htlBtns"><button class="htlB" data-h="top">◀ ホテルにもどる</button></div></div></div>`;
}
async function palCall(pid){
  const h = HT(), f = F(), p = h.palList.find(x => x.id===pid); if(!p || !(h.bag.itm_palletter > 0)) return;
  const t = save.town, sp = SP(p.sp), home = findHome(sp);
  if(t.res.length >= townCalc().maxRes){ toast('町がいっぱいで、もう住めないよ'); return; }
  if(!home){ toast('住む家が足りないよ'); return; }
  h.bag.itm_palletter--; h.palList = h.palList.filter(x => x.id!==pid);
  if(f.pals[p.sp] > 0){ f.pals[p.sp]--; if(!f.pals[p.sp]) delete f.pals[p.sp]; }
  const r = newResident(sp); r.home = home.key; t.res.push(r); persist(); discover(r.sp);
  hClose(); await arrival(r, `ホテルで仲良くなった${p.name}が来てくれた！`); try{ checkBadges(); renderCurrent(); }catch(e){}
}

/* ---------- タッチ ---------- */
async function hClick(e){
  const b = e.target.closest('[data-h]'); if(!b || b.disabled || !HV) return;
  const [a, v] = b.dataset.h.split(':');
  const t = HV.room ? guestIn(HV.room) : null;
  switch(a){
    case 'close': hClose(); return;
    case 'back': if(HV.view==='talk'){ const g = F().tour.find(x => x.id===HV.guest); return hGo('room', {room:g?.room || HV.room}); }
                 if(HV.view==='top') return hClose(); return hGo('top', {pick:false});
    case 'top': return hGo('top', {pick:false});
    case 'room': return hGo('room', {room:v});
    case 'talk': if(t) return talkTo(t); return;
    case 'gift': if(t) return hGo('talk', {guest:t.id, line:'わあ、何かくれるの？'}); return;
    case 'give': { const g = F().tour.find(x => x.id===HV.guest); if(g) return give(g, v); return; }
    case 'shop': return hGo('shop', {tab:HV.tab || 'sv'});
    case 'tab': return hGo('shop', {tab:v});
    case 'buy': return buy(v);
    case 'fbuy': return fbuy(v);
    case 'use': return useItem(v);
    case 'invite': return useInvite(HV.room);
    case 'furshop': { const k = HV.key; hClose(); SHOP_KEY = k; return openShop(k); }
    case 'grade': return hGo('grade');
    case 'dograde': { const k = HV.key; hClose(); return openBuilding(k); }
    case 'pals': return hGo('pals', {pick:false});
    case 'palcall': return palCall(v);
  }
}
async function openHotel(key){
  if(refreshTour()) persist();
  HV = {view:'top', key}; hRoot(); hRender(); sound('ok');
  const fresh = F().tour.find(t => t.fresh && t.room);
  if(fresh) await rareArrive(fresh);
}

/* ---------- レター：仲良しの 種類が 来やすい（レア度別の 確率） ---------- */
const PAL_P = {letter:{1:.60, 2:.50, 3:.35, 4:.10}, gold:{2:.70, 3:.60, 4:.45}};
const _pickSpeciesFac = pickSpecies;
pickSpecies = function(o={}){
  try{
    const P = F().pals, ks = Object.keys(P).filter(k => P[k] > 0);
    if(o.needHome && ks.length){
      const gold = (o.minRar||1) >= 2, T = gold ? PAL_P.gold : PAL_P.letter;
      const pool = SPECIES.filter(s => ks.includes(s.id) && (s.w||0) > 0 && (s.rar||1) >= (o.minRar||1) && (s.rar||1) <= (o.maxRar||9) && findHome(s))
        .sort((a,b) => (b.rar||1) - (a.rar||1));
      for(const s of pool){ if(Math.random() < (T[s.rar||1]||0)) return s; }
    }
  }catch(e){}
  return _pickSpeciesFac.apply(this, arguments);
};
const _inviteFac = inviteResident;
inviteResident = async function(){
  const before = new Set(save.town.res.map(r => r.id));
  const out = await _inviteFac.apply(this, arguments);
  try{ const P = F().pals, h = HT(); save.town.res.filter(r => !before.has(r.id) && P[r.sp] > 0).forEach(r => {
    P[r.sp]--; if(!P[r.sp]) delete P[r.sp];
    const i = h.palList.findIndex(x => x.sp===r.sp); if(i >= 0) h.palList.splice(i, 1);
    persist(); toast(`🏨 ホテルで仲良くなった ${SP(r.sp).name}が来てくれたよ！`); }); }catch(e){}
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
  parking:'🚗 たまに 車が とまって りょうきんが もらえる', clinic:'🏥 けがを した 住民を なおす', cityhall:'🏛️ 住民わくを ふやせる', hotel:'🧳 部屋を たずねて 観光客と なかよく なれる',
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
  if(id==='hotel' && f.tour.length){ const r4 = f.tour.some(t => t.room && (SP(t.sp).rar||1) >= 4); return `<span class="facOv badge">${r4 ? '✨' : '🧳'}${f.tour.filter(t => t.room).length}</span>`; }
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
  if(ch){ persist(); if(!quiet) decorate(); try{ if(HV && HV.view==='top' && !$('#dlg').classList.contains('show')) hRender(); }catch(e){} }
  else if(!quiet && curScreen==='town') decorate();   // 畑の そだち ぐあい
}
setInterval(() => { if(!document.hidden && !$('#dlg').classList.contains('show')) facTick(false); }, 20000);
})();


/* =====================================================================
   v7.2：ゆうえんち ミニパレードの キャラクターが 縦長に 引き伸ばされる 問題の 修正
   （iPad横などで 画像の 幅が 正しく 計算されない ことが あるため、画像の 本当の 縦横比から 幅と 高さを 直接 決める）
   ===================================================================== */
(function(){
  try{
    const st = document.createElement('style');
    st.textContent = `#yu659 .ypd .ln{align-items:flex-end!important}
#yu659 .ypd .ln img{aspect-ratio:auto!important;flex:none!important;align-self:flex-end!important;object-fit:contain!important;min-width:0!important;min-height:0!important}`;
    document.head.appendChild(st);
    const fit = img => {
      const go = () => {
        if(!img.naturalWidth || !img.naturalHeight) return;
        const vh = innerHeight / 100, sp = img.classList.contains('sp');
        const hgt = Math.round(sp ? Math.min(18*vh, 130) : Math.min(34*vh, 250));
        img.style.setProperty('height', hgt + 'px', 'important');
        img.style.setProperty('width', Math.round(hgt * img.naturalWidth / img.naturalHeight) + 'px', 'important');
      };
      if(img.complete) go(); else img.addEventListener('load', go, {once:true});
    };
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if(n.nodeType !== 1) return;
      const L = n.matches && n.matches('.ypd') ? [n] : (n.querySelectorAll ? [...n.querySelectorAll('.ypd')] : []);
      L.forEach(p => p.querySelectorAll('.ln img').forEach(fit));
    }))).observe(document.body, {childList:true, subtree:true});
  }catch(e){ console.warn('parade fix', e); }
})();


/* =====================================================================
   v7.4：新しい 超レア 3体（ピヨまる・モッチー・プルリン）
   ・画像は ./assets/images/chara/（立ち絵 res_〈id〉、特別イラスト scu_〈id〉_〈場面〉）
   ・特別イラストは いまの「とくべつな 1まい」と 同じ しくみ（町に 住んでいる 時に 建物・かざりを タッチ）
   ===================================================================== */
(function(){
  const CIMG = './assets/images/chara/';
  const NC = [
    {id:'piyomaru', name:'ピヨまる', emoji:'🐤', home:'bird',  bias:'pop',
      ab:{work:22, biz:24, know:24, pop:44, drive:23}, skill:['bonus','hint'], kuchi:'ぴよ',
      sc:['sakura','flowers','park','tree','stars'],
      info:'小さいけれど 元気いっぱいの ひよこ。どこにでも ちょこちょこ ついていく 町の 人気者。',
      lines:'きょうも げんき いっぱいだぴよ！|ちっちゃくても いっぱい あるけるぴよ|みんなの あとを ついていくの、だいすきぴよ|さくらの はなびら、ぼうしに したぴよ|おほしさまに おねがいごと したぴよ'},
    {id:'mocchi', name:'モッチー', emoji:'🍡', home:'house', bias:'drive',
      ab:{work:24, biz:23, know:25, pop:26, drive:43}, skill:['gift','guard'], kuchi:'もち',
      sc:['fountain','festival','snow','onsen','library'],
      info:'おもちみたいに まっ白で ふわふわ。ぼーっと しているけど、乗り物に 乗るのが 大すき。',
      lines:'でんしゃの まどから 見る けしき、すきだもち|ふわぁ… ちょっと ぼーっと してたもち|この おだんご、ぼくに にてるもち…？|ゆきだるま、ぼくに そっくりに できたもち|おんせん、ぽかぽかだもち'},
    {id:'pururin', name:'プルリン', emoji:'🍮', home:'house', bias:'pop',
      ab:{work:23, biz:30, know:26, pop:42, drive:20}, skill:['mult','bonus'], kuchi:'ぷる',
      sc:['bakery','castle','festival','park','pond'],
      info:'プリンの 国から 来た、ぷるぷるの 人気者。あまい においで みんなを 笑顔に する。',
      lines:'ぷるぷる ゆれるのは うれしい しるしだぷる|カラメルの ところが いちばん じまんぷる|みんなで いっしょに おどるぷる！|あまい においで みんな 笑顔に なるぷる|おしろの パーティー、たのしみぷる'}
  ];
  const NCM = Object.fromEntries(NC.map(c => [c.id, c]));
  try{
    NC.forEach(c => {
      DEFAULT_ART['res_' + c.id] = CIMG + 'res_' + c.id + '.webp';
      c.sc.forEach(k => { DEFAULT_ART[`scu_${c.id}_${k}`] = CIMG + `scu_${c.id}_${k}.webp`; });
      if(!SPECIES.some(s => s.id===c.id)) SPECIES.push({id:c.id, name:c.name, art:'res_' + c.id, emoji:c.emoji, rar:4, w:0.5, bias:c.bias, home:c.home});
      try{ ZUKAN_INFO[c.id] = c.info; }catch(e){}
      try{ KUCHI[c.id] = c.kuchi; }catch(e){}
      try{ SP_SKILL[c.id] = c.skill; }catch(e){}
    });
    /* 特別イラストの 場面を 固定（5まい） */
    const _ss74 = speciesScenes;
    speciesScenes = function(sp){ return NCM[sp] ? NCM[sp].sc.slice() : _ss74.apply(this, arguments); };
  }catch(e){ console.warn('new chara', e); }

  /* features.js（超レアの 能力）より あとで 上書きするため、全部 読みこんだ あとに 設定 */
  const late = () => {
    try{ const V = window.__v53; if(V && V.SPL) NC.forEach(c => { V.SPL[c.id] = c.lines; }); }catch(e){}
    try{
      const _nr74 = newResident;
      newResident = function(sp){ const r = _nr74.apply(this, arguments); const c = sp && NCM[sp.id]; if(c){ r.ab = Object.assign({}, c.ab); r.ur66 = 1; } return r; };
    }catch(e){ console.warn('new chara ab', e); }
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', late); else setTimeout(late, 0);
})();


/* =====================================================================
   v7.5：キャラクター画像を assets/images/chara/ に集約 ＋ ランクアップ専用イラスト
   ・res_〈キー〉／scu_〈キー〉／acc_〈キー〉 の画像は すべて ./assets/images/chara/〈キー〉.〈かくちょうし〉
     （tools/move_chara_images.ps1 で 今の 画像を ひっこし → 名前も 〈キー〉に そろう）
   ・ランク専用イラスト：res_〈id〉_r3.webp（★3〜4）／res_〈id〉_r5.webp（★5）＋ 大きさ補正（RANK_ART）
       ふつう ：★1〜2 = もとの絵、★3〜4 = _r3、★5 = _r5
       超レア ：★3〜4 = _r3、★5 = _r5（もとの絵は ずかん 用）
   ・RANK_ART に 書いた しゅだけ 新イラストに なる。書いていない 子は これまで通り（もとの絵＋かざり）
   ・ステップごとに RANK_ART の 行を ふやして このファイルを 上書きするだけ（.js は ふやさない）
   ===================================================================== */
(function(){
  const CH = './assets/images/chara/';
  const MOVED = 'res_cat,res_dog,res_sparrow,res_rabbit,res_tanuki,res_bear,res_squirrel,res_fox,res_panda,res_hamster,res_penguin,res_sheep,res_pig,res_frog,res_owl,res_koala,res_seal,res_hedgehog,res_otter,res_redpanda,res_alpaca,acc_gradcap,acc_hardhat,acc_tophat,acc_flowercrown,acc_drivercap,acc_crown,acc_tiara,acc_glasses,acc_bowtie,acc_medal,acc_cape,acc_star,res_mouse,res_cow,res_horse,res_goat,res_hen,res_duck,res_donkey,res_guinea,res_ferret,res_parrot,res_budgie,res_turtle,res_gecko,res_chipmunk,res_mole,res_bat,res_raccoon,res_skunk,res_beaver,res_porcupine,res_deer,res_boar,res_wolf,res_lynx,res_badger,res_macaque,res_gorilla,res_orangutan,res_lemur,res_sloth,res_armadillo,res_opossum,res_moose,res_bison,res_reindeer,res_polarbear,res_fennec,res_arcticfox,res_mongoose,res_sunbear,res_lion,res_tiger,res_cheetah,res_leopard,res_giraffe,res_elephant,res_zebra,res_hippo,res_rhino,res_camel,res_kangaroo,res_wallaby,res_meerkat,res_hyena,res_warthog,res_ostrich,res_flamingo,res_toucan,res_peacock,res_gazelle,res_dolphin,res_whale,res_shark,res_octopus,res_squid,res_crab,res_lobster,res_jelly,res_starfish,res_seaturtle,res_clownfish,res_puffer,res_seahorse,res_walrus,res_sealion,res_manatee,res_axolotl,res_hermit,res_narwhal,res_beluga,res_eagle,res_hawk,res_crow,res_pigeon,res_swallow,res_robin,res_bluebird,res_hummingbird,res_woodpecker,res_kingfisher,res_crane,res_swan,res_stork,res_cockatoo,res_cardinal,res_mejiro,res_bunchou,res_snowyowl,res_puffin,res_pelican,res_capybara,res_tapir,res_okapi,res_pangolin,res_quokka,res_wombat,res_platypus,res_kiwi,res_sugarglider,res_chinchilla,res_tasdevil,res_binturong,res_whitetiger,res_snowleopard,res_goldmonkey,res_anteater,res_corgi,res_poodle,res_mike,res_kuroneko,res_orca,res_namazu,res_girl,res_girl_party,res_girl_explore,res_girl_pajama,scu_redpanda_park,scu_redpanda_fountain,scu_redpanda_library,scu_redpanda_festival,scu_redpanda_onsen,scu_shima_tree,scu_shima_library,scu_shima_festival,scu_shima_pond,scu_shima_onsen,scu_whitetiger_onsen,scu_whitetiger_festival,scu_whitetiger_pond,scu_whitetiger_library,scu_whitetiger_tree,scu_girl_sakura,scu_girl_festival,scu_girl_bakery,scu_girl_stars,scu_girl_snow,scu_koala_park,scu_koala_festival,scu_koala_pond,scu_alpaca_library,scu_alpaca_onsen,scu_alpaca_festival,scu_panda_onsen,scu_panda_fountain,scu_panda_tree,scu_peacock_stars,scu_peacock_library,scu_peacock_tree,scu_narwhal_harbor,scu_narwhal_library,scu_narwhal_tree,scu_crane_pond,scu_crane_harbor,scu_crane_fountain,scu_snowyowl_sakura,scu_snowyowl_library,scu_snowyowl_harbor,scu_okapi_park,scu_okapi_pond,scu_okapi_library,scu_quokka_pond,scu_quokka_library,scu_quokka_tree,scu_platypus_onsen,scu_platypus_fountain,scu_platypus_tree,scu_snowleopard_tree,scu_snowleopard_fountain,scu_snowleopard_onsen,scu_goldmonkey_park,scu_goldmonkey_fountain,scu_goldmonkey_festival,scu_orca_onsen,scu_orca_library,scu_orca_tree,scu_namazu_pond,scu_namazu_fountain,scu_namazu_library,res_unicorn,scu_unicorn_onsen,scu_unicorn_library,scu_unicorn_pond,scu_unicorn_tree,scu_unicorn_festival'.split(',');

  /* ★ レア度ごとの ゴージャスさ（STEP7 から）
       超レア    ：★5 がいちばん ゴージャス（大きな ひかり・オーラ・たくさんの キラキラ）
       レア      ：★5 は 大きめの ひかり ＋ テーマの かざり ＋ キラキラ
       ちょっとレア：★5 は ひかえめ（キラキラ 数こ ＋ 小さな ひかり ＋ ワンポイント）  ← STEP6 までの 12しゅは すこし 派手め
       ふつう    ：★5 は ごく ひかえめ（キラキラ 2〜3こ ＋ うっすら ひかり）
       ★3 は どのレア度も ワンポイントの かざりだけ（レア度が 高いほど ちょっと 凝った かざり） */
  /* ★ ランク専用イラストが できている しゅ：id → {ランク:大きさ補正}
       大きさ補正＝ 絵に キラキラ・ぼうし等で 余白が ふえた ぶんを 拡大して、からだの 大きさを そろえる数
       （1 ＝ そのまま。★5 の 絵だけ ちょっと 大きく したい時は 5 の 数を ふやす） */
  const RANK_ART = {
    cat:{3:1.2, 5:1},
    piyomaru:{3:1.018, 5:1.263},
    mocchi:{3:1.12, 5:1},
    pururin:{3:1, 5:1.175},
    shima:{3:1, 5:1.28},
    unicorn:{3:1, 5:1.04},
    whitetiger:{3:1, 5:1.008},
    /* STEP4：レア */
    koala:{3:1, 5:1.15},
    redpanda:{3:1, 5:1.25},
    alpaca:{3:1, 5:1.12},
    panda:{3:1, 5:1.2},
    peacock:{3:1, 5:1.12},
    narwhal:{3:1, 5:1.1},
    snowyowl:{3:1, 5:1.25},
    /* STEP5：レア（のこり） */
    crane:{3:1, 5:1.1},
    okapi:{3:1, 5:1.1},
    quokka:{3:1, 5:1.12},
    platypus:{3:1, 5:1.1},
    snowleopard:{3:1, 5:1.12},
    goldmonkey:{3:1, 5:1.12},
    orca:{3:1, 5:1.1},
    namazu:{3:1, 5:1.18},
    /* STEP6：ちょっとレア（1） */
    owl:{3:1, 5:1.15},
    squirrel:{3:1, 5:1.1},
    bear:{3:1, 5:1.12},
    fox:{3:1, 5:1.1},
    hedgehog:{3:1, 5:1.18},
    otter:{3:1, 5:1.15},
    penguin:{3:1, 5:1.18},
    seal:{3:1, 5:1.12},
    mole:{3:1, 5:1.12},
    bat:{3:1, 5:1.12},
    skunk:{3:1, 5:1.12},
    beaver:{3:1, 5:1.18},
    /* STEP7：ちょっとレア（2）… ★5 は「ひかえめ」なので 補正は ほぼ 1 */
    porcupine:{3:1, 5:1},
    wolf:{3:1, 5:1},
    lynx:{3:1, 5:1},
    gorilla:{3:1, 5:1},
    orangutan:{3:1, 5:1},
    lemur:{3:1, 5:1.01},
    sloth:{3:1, 5:1},
    armadillo:{3:1, 5:1},
    moose:{3:1, 5:1},
    reindeer:{3:1, 5:1},
    polarbear:{3:1, 5:1},
    fennec:{3:1, 5:1},
    /* STEP8：ちょっとレア（3） */
    arcticfox:{3:1, 5:1},
    sunbear:{3:1, 5:1},
    lion:{3:1, 5:1},
    tiger:{3:1, 5:1},
    cheetah:{3:1, 5:1},
    leopard:{3:1, 5:1},
    giraffe:{3:1, 5:1.05},
    elephant:{3:1, 5:1.15},
    flamingo:{3:1, 5:1},
    toucan:{3:1, 5:1},
    dolphin:{3:1, 5:1.05},
    whale:{3:1, 5:1.18},
    /* STEP9：ちょっとレア（4） */
    shark:{3:1, 5:1},
    seaturtle:{3:1, 5:1},
    seahorse:{3:1, 5:1},
    manatee:{3:1, 5:1},
    axolotl:{3:1, 5:1},
    beluga:{3:1, 5:1},
    eagle:{3:1, 5:1},
    hawk:{3:1, 5:1},
    hummingbird:{3:1, 5:1.05},
    kingfisher:{3:1, 5:1},
    swan:{3:1, 5:1},
    stork:{3:1, 5:1},
    /* STEP10：ちょっとレア（5） */
    cockatoo:{3:1, 5:1},
    cardinal:{3:1, 5:1},
    puffin:{3:1, 5:1},
    capybara:{3:1, 5:1},
    tapir:{3:1, 5:1},
    pangolin:{3:1, 5:1},
    wombat:{3:1, 5:1},
    kiwi:{3:1, 5:1.02},
    sugarglider:{3:1, 5:1.01},
    chinchilla:{3:1, 5:1},
    tasdevil:{3:1, 5:1},
    binturong:{3:1, 5:1},
    /* STEP11：ちょっとレア（最後の1しゅ）… これで ちょっとレア 全61しゅ 完了 */
    anteater:{3:1, 5:1},
    /* STEP12：ふつう（1）… ★5 は ごく ひかえめ（キラキラ 2〜3こ ＋ うっすら ひかり） */
    dog:{3:1, 5:1},
    rabbit:{3:1, 5:1},
    hamster:{3:1, 5:1},
    pig:{3:1, 5:1},
    sheep:{3:1, 5:1},
    sparrow:{3:1, 5:1},
    tanuki:{3:1, 5:1},
    frog:{3:1, 5:1},
    mouse:{3:1, 5:1},
    cow:{3:1, 5:1},
    horse:{3:1, 5:1},
    goat:{3:1, 5:1},
    /* STEP13：ふつう（2） */
    donkey:{3:1, 5:1},
    guinea:{3:1, 5:1},
    ferret:{3:1, 5:1},
    parrot:{3:1, 5:1.02},
    budgie:{3:1, 5:1},
    turtle:{3:1, 5:1},
    gecko:{3:1, 5:1},
    chipmunk:{3:1, 5:1},
    raccoon:{3:1, 5:1},
    deer:{3:1, 5:1},
    boar:{3:1, 5:1},
    badger:{3:1, 5:1.02},
    /* STEP14：ふつう（3） */
    macaque:{3:1, 5:1},
    opossum:{3:1, 5:1},
    bison:{3:1, 5:1},
    mongoose:{3:1, 5:1},
    zebra:{3:1, 5:1},
    hippo:{3:1, 5:1},
    rhino:{3:1, 5:1},
    camel:{3:1, 5:1},
    kangaroo:{3:1, 5:1},
    wallaby:{3:1, 5:1},
    meerkat:{3:1, 5:1},
    hyena:{3:1, 5:1},
    /* STEP15：ふつう（4） */
    hen:{3:1, 5:1},
    duck:{3:1, 5:1},
    warthog:{3:1, 5:1},
    ostrich:{3:1, 5:1},
    gazelle:{3:1, 5:1},
    octopus:{3:1, 5:1},
    squid:{3:1, 5:1},
    crab:{3:1, 5:1.01},
    lobster:{3:1.07, 5:1.14},
    jelly:{3:1, 5:1.01},
    starfish:{3:1, 5:1},
    clownfish:{3:1, 5:1},
    /* STEP16：ふつう（5） */
    puffer:{3:1, 5:1},
    walrus:{3:1, 5:1},
    sealion:{3:1, 5:1},
    hermit:{3:1, 5:1},
    crow:{3:1, 5:1},
    pigeon:{3:1, 5:1},
    swallow:{3:1, 5:1},
    robin:{3:1, 5:1},
    bluebird:{3:1, 5:1},
    woodpecker:{3:1, 5:1},
    mejiro:{3:1, 5:1},
    bunchou:{3:1, 5:1},
    /* STEP17：ふつう（6）… これで 全66しゅ 完了 */
    pelican:{3:1, 5:1.01},
    corgi:{3:1, 5:1},
    poodle:{3:1, 5:1},
    mike:{3:1, 5:1},
    kuroneko:{3:1, 5:1}
  };

  /* ---------- 1) 画像の 場所を chara に そろえる ---------- */
  const remap = () => {
    MOVED.forEach(k => {
      const o = DEFAULT_ART[k]; if(!o || o.indexOf(CH) === 0) return;
      const m = /\.(webp|jpg|jpeg|png)$/i.exec(o);
      DEFAULT_ART[k] = CH + k + '.' + (m ? m[1].toLowerCase() : 'webp');
    });
  };
  const regRank = () => {
    Object.keys(RANK_ART).forEach(id => Object.keys(RANK_ART[id]).forEach(t => {
      const k = 'res_' + id + '_r' + t; DEFAULT_ART[k] = CH + k + '.webp';
    }));
  };
  remap(); regRank();
  const late = () => {
    remap(); regRank();                      /* features.js で あとから 入る ユニコーン分も そろえる */
    try{ applyArt(); }catch(e){}
    try{ renderCurrent(); }catch(e){}
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', late); else setTimeout(late, 0);

  /* ---------- 2) ランクで 絵を 切りかえる ---------- */
  try{
    RANK_LOOK[4] = 'もっと りっぱに なったよ！ あと ★1つで ゴージャス！';
  }catch(e){}
  const _rp75 = resPic;
  resPic = function(r, cls){
    let h = _rp75.apply(this, arguments);
    try{
      if(!r) return h;
      const s = SP(r.sp), have = RANK_ART[r.sp];
      if(!have || s.human) return h;
      const st = r.star || 1, want = st >= 5 ? 5 : st >= 3 ? 3 : 1;
      let t = 1; Object.keys(have).forEach(k => { const x = +k; if(x <= want && x > t) t = x; });
      if(t === 1) return h;
      const src = artSrc('res_' + r.sp + '_r' + t); if(!src) return h;
      const sc = have[t] || 1, sty = sc > 1.005 ? 'scale:' + sc + ';transform-origin:50% 100%' : '';
      h = h.replace(/<img class="acc[^>]*>/g, '')
           .replace(/(<img class="rb"[^>]*?\ssrc=")[^"]*(")/, (m, a, b) => a + esc(src) + b)
           .replace('class="rpic', 'class="rpic art75 ');
      if(sty) h = h.replace(/<img class="rb"([^>]*)>/, (m, a) => '<img class="rb"' + (/\sstyle="/.test(a) ? a.replace(/style="([^"]*)"/, (mm, v) => 'style="' + v + ';' + sty + '"') : a + ' style="' + sty + '"') + '>');
    }catch(e){ console.warn('rank art', e); }
    return h;
  };
})();
