/* =====================================================================
   まなびタウン v30.0：ランドマークタワー STEP1
   ・まちの「ランドマークタワー」を タッチすると 専用画面（#lm）が ひらく
   ・タワートップ（スマホ縦：タワーが メニュー／iPad横：左 タワー・右 フロアガイド）
   ・ロビー（コンシェルジュ・きょうの ごほうび・ソファの 住民と おはなし）
   ・エレベーター（フロアを えらぶ。★が たりない 階は カギ。ラウンジ・デッキ・ブティックは STEP2〜4 で オープン）
   ・BGM「夜空のピアノ」しずか版（ピアノ・コントラバス・グロッケン・バイオリン。28小節の うち イントロ＋A の 12小節）
   ※ features.js・science.js の あとに 読みこむ。セーブは save.lm に 追加するだけ
   ===================================================================== */
(function(){
'use strict';
const ID = 'landmark', IMG = './assets/images/landmark/';
const im = n => IMG + n + '.webp';
const now = () => Date.now();
['lm_tower','lm_tower_l','lm_lobby','lm_bird_wave','lm_bird_bow','lm_bird_gift','ic_lm_elev','ic_lm_music','ic_lm_camera','ic_lm_gift','ic_lm_lock']
  .forEach(k => { try{ DEFAULT_ART[k] = im(k); }catch(e){} });

/* ---------- セーブ ---------- */
function D(){
  const d = save.lm || (save.lm = {});
  d.day = d.day || ''; d.talk = d.talk || {}; d.got = d.got || 0;
  if(d.day !== dayKey()){ d.day = dayKey(); d.talk = {}; d.gift = false; }
  return d;
}
const cellsOf = () => save.town ? Object.entries(save.town.cells).filter(([k, v]) => v === ID).map(([k]) => k) : [];
const grade = () => cellsOf().reduce((a, k) => Math.max(a, (save.town.glv || {})[k] || 0), 0);

/* ---------- フロア ---------- */
/* z：タワーの 絵の 上の タッチ範囲（％：left, top, width, height）… lm_tower.webp（2:3） */
const FLOORS = [
  {id:'deck',     n:'展望デッキ',     s:'屋上',  g:2, step:3, z:[24, 12, 52, 11], c:'#9FB8FF', d:'双眼鏡で まちさがし・夜景フォト・流れ星'},
  {id:'lounge',   n:'スカイラウンジ', s:'上層',  g:1, step:2, z:[29, 27, 42, 15], c:'#F3C76A', d:'ピアノ リクエスト・住民の 来店・モクテル'},
  {id:'boutique', n:'ブティック',     s:'中層',  g:0, step:4, z:[29, 47, 42, 14], c:'#F0A6C0', d:'タワー限定の 家具・衣装・フォト こうかん'},
  {id:'lobby',    n:'ロビー',         s:'1F',    g:0, step:1, z:[30, 66, 40, 21], c:'#E9D38E', d:'コンシェルジュ・きょうの ごほうび・住民と おはなし'}
];
const FL = id => FLOORS.find(f => f.id === id);
const isL = () => matchMedia('(orientation: landscape) and (min-width: 700px)').matches;
const ico = (k, cls = '') => `<img class="${cls}" src="${esc(im(k))}" alt="" draggable="false">`;
const tod = () => { const h = new Date().getHours(); return h >= 5 && h < 10 ? 'mor' : h >= 10 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'eve' : 'ngt'; };

/* ---------- コンシェルジュの ひとこと（同じ日は 3パターンを じゅんばんに） ---------- */
const SAY = {
  mor:['おはようございます。けさの まちは きらきら していますね。','あさの ロビーは しずかで きもちが いいですよ。','きょうも ようこそ。すてきな 1日に なりますように。'],
  day:['ようこそ ランドマークタワーへ。ごゆっくり どうぞ。','エレベーターで いろいろな 階へ 行けますよ。','ロビーの ソファで 住民の みなさんが まっていますよ。'],
  eve:['ゆうやけの まちが きれいな 時間ですね。','そろそろ まちの あかりが ともりはじめますよ。','夜の タワーは もっと すてきに なりますよ。'],
  ngt:['こんばんは。夜景が いちばん きれいな 時間です。','おほしさまが よく 見えますね。','夜の タワーへ ようこそ。ピアノの 音を どうぞ。']
};
let sayN = 0;
function sayLine(){
  const d = D(), L = SAY[tod()];
  if(!d.gift) return 'きょうの ごほうびが ロビーに とどいています。ギフトの ボタンを タッチしてね。';
  return L[(sayN++) % L.length];
}

/* ---------- ロビーの 住民（日替わり 2〜3人） ---------- */
function lobbyRes(){
  if(!save.town) return [];
  const L = nonHuman(); if(!L.length) return [];
  const seed = hashN(dayKey() + 'lm'), n = Math.min(L.length, 2 + (Math.abs(seed) % 2));
  const a = L.slice().sort((x, y) => Math.abs(hashN(x.id + dayKey())) - Math.abs(hashN(y.id + dayKey())));
  return a.slice(0, n);
}

/* ====================================================================
   BGM「夜空のピアノ」しずか版（Web Audio）
   ==================================================================== */
const SND = './assets/audio/music/', FN = ['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];
const SAMP = {pf:[48,51,54,57,60,63,66,69,72,75,78,81,84], cb:[30,31,34,36,38,40,42,44,45,49,52,56,59], gl:[79,84,91,96,103,108], vn:[57,60,64,67,69,72,76,79,81,84,88,91]};
const M = {ac:null, out:null, buf:{}, on:false, t0:0, bar:0, timer:0};
const BPM = 112, BEAT = 60 / BPM, BAR = BEAT * 4;
/* コード（ボイシング：MIDI）… オリジナル */
const CH = {
  'Ebmaj7':[51,55,58,62], 'Cm9':[51,55,58,62], 'Abmaj7':[51,55,56,60], 'Bb7sus4':[51,53,56,58], 'Bb7':[50,53,56,58],
  'Gm7':[50,53,55,58], 'Cm7':[51,55,58,60], 'F9':[51,55,57,60], 'Fm7':[51,53,56,60], 'Eb7':[49,51,55,58], 'C7':[48,52,55,58]
};
const ROOT = {Ebmaj7:39, Cm9:36, Abmaj7:44, Bb7sus4:46, Bb7:46, Gm7:43, Cm7:36, F9:41, Fm7:41, Eb7:39, C7:36};
/* 12小節：[コード（2つなら 2拍ずつ）, メロディー（[拍, MIDI, 長さ]）] */
const SONG = [
  [['Ebmaj7'], []], [['Cm9'], []], [['Abmaj7'], []], [['Bb7sus4','Bb7'], [[3,70,1]]],
  [['Ebmaj7','Gm7'], [[0,79,1.5],[1.5,77,.5],[2,75,1],[3,74,1]]],
  [['Cm7','F9'], [[0,75,1.5],[1.5,72,.5],[2,74,2]]],
  [['Fm7','Bb7'], [[0,72,1],[1,74,.5],[1.5,75,.5],[2,77,1],[3,79,1]]],
  [['Ebmaj7','Eb7'], [[0,79,2.5],[3,82,1]]],
  [['Abmaj7'], [[0,84,1.5],[1.5,82,.5],[2,80,1],[3,79,1]]],
  [['Gm7','C7'], [[0,77,1.5],[1.5,79,.5],[2,76,2]]],
  [['Fm7'], [[0,77,1],[1,75,1],[2,72,1],[3,74,1]]],
  [['Bb7sus4'], [[0,75,3],[3,70,1]]]
];
function mAC(){
  if(!M.ac){ const C = window.AudioContext || window.webkitAudioContext; if(!C) return null; M.ac = new C();
    const comp = M.ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(M.ac.destination);
    M.out = M.ac.createGain(); M.out.gain.value = 0; M.out.connect(comp);
    try{ const len = M.ac.sampleRate * 1.8, ir = M.ac.createBuffer(2, len, M.ac.sampleRate);
      for(let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
      M.rev = M.ac.createConvolver(); M.rev.buffer = ir; const rg = M.ac.createGain(); rg.gain.value = .28; M.out.connect(M.rev); M.rev.connect(rg); rg.connect(comp); }catch(e){} }
  if(M.ac.state === 'suspended') M.ac.resume().catch(() => {});
  return M.ac;
}
function load(k, m){
  const key = k + m; if(M.buf[key]) return M.buf[key];
  return M.buf[key] = fetch(`${SND}${k}_${FN[m % 12]}${Math.floor(m / 12) - 1}.mp3`).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
    .then(ab => new Promise((ok, ng) => { try{ const p = M.ac.decodeAudioData(ab, ok, ng); if(p && p.then) p.then(ok, ng); }catch(e){ ng(e); } })).catch(() => null);
}
const near = (k, m) => SAMP[k].reduce((a, c) => Math.abs(c - m) < Math.abs(a - m) ? c : a);
async function note(k, m, t, dur, vol){
  const b = near(k, m), buf = await load(k, b); if(!buf || !M.on) return;
  const s = M.ac.createBufferSource(), g = M.ac.createGain(); s.buffer = buf; s.playbackRate.value = Math.pow(2, (m - b) / 12);
  const st = Math.max(t, M.ac.currentTime + .01), rel = k === 'pf' ? .9 : k === 'gl' ? 1.6 : .4;
  g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(vol, st + (k === 'vn' ? .25 : .008));
  g.gain.setValueAtTime(vol, st + dur); g.gain.exponentialRampToValueAtTime(.0001, st + dur + rel);
  s.connect(g); g.connect(M.out); s.start(st); s.stop(st + dur + rel + .05);
}
function schedBar(i, t){
  const [chs, mel] = SONG[i], per = 4 / chs.length;
  chs.forEach((c, j) => {
    const v = CH[c], bt = t + j * per * BEAT;
    if(i < 4){ v.concat([v[0] + 12, v[1] + 12]).forEach((m, q) => note('pf', m, bt + q * BEAT / 2 * (per / 4), BEAT * 1.5, .16)); }   // イントロ：アルペジオ
    else {
      v.forEach(m => note('pf', m, bt, BEAT * .9, .10));                        // A：おしゃれな うらはく
      v.forEach(m => note('pf', m, bt + BEAT * 1.5, BEAT * .4, .07));
      note('cb', ROOT[c], bt, BEAT * .8, .38); note('cb', ROOT[c] + 7, bt + BEAT * (per > 2 ? 2 : 1), BEAT * .7, .28);
      if(i >= 8) note('vn', v[3] + 12, bt, per * BEAT, .05);                     // 後半：ストリングスが うすく
    }
  });
  mel.forEach(([b, m, l]) => note('pf', m, t + b * BEAT, l * BEAT, .30));
  if(i === 0 || i === 4 || i === 8) note('gl', 91 + (i === 8 ? 3 : 0), t, BEAT * 2, .06);   // キラッ
}
function tick(){
  if(!M.on || !M.ac) return;
  while(M.t0 < M.ac.currentTime + 1.2){ schedBar(M.bar, M.t0); M.t0 += BAR; M.bar = (M.bar + 1) % SONG.length; }
}
const bgmOK = () => save.settings && save.settings.bgm !== false && !(window.__ecoBgmOff && window.__ecoBgmOff()) && !(D().mute);
function bgmStart(){
  if(M.on || !bgmOK() || document.hidden) return; const ac = mAC(); if(!ac) return;
  Object.keys(SAMP).forEach(k => SAMP[k].forEach(m => load(k, m)));
  M.on = true; M.bar = 0; M.t0 = ac.currentTime + .25;
  M.out.gain.cancelScheduledValues(ac.currentTime); M.out.gain.setValueAtTime(0, ac.currentTime); M.out.gain.linearRampToValueAtTime(.55, ac.currentTime + 1.5);
  tick(); clearInterval(M.timer); M.timer = setInterval(tick, 250); paintMusic();
}
function bgmStop(){
  if(!M.on) return; M.on = false; clearInterval(M.timer);
  try{ const t = M.ac.currentTime; M.out.gain.cancelScheduledValues(t); M.out.gain.setValueAtTime(M.out.gain.value, t); M.out.gain.linearRampToValueAtTime(0, t + .4); }catch(e){}
  paintMusic();
}
document.addEventListener('visibilitychange', () => { if(!V) return; if(document.hidden) bgmStop(); else bgmStart(); });
/* まちの BGM は タワーの 中では ながさない */
try{ const W = window.__bgm643; if(W){ const t0 = W.target; W.target = () => document.querySelector('#lm.show') ? 0 : t0(); } }catch(e){}

/* ====================================================================
   画面
   ==================================================================== */
let V = null;   // {view:'top'|'lobby', key, elev}
function root(){
  let el = document.getElementById('lm');
  if(!el){ el = document.createElement('div'); el.id = 'lm'; document.body.appendChild(el); el.addEventListener('click', onClick);
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(V) render(); }, 150); }); }
  return el;
}
function bar(title, back){
  return `<div class="lmBar"><button class="lmBack" data-l="${back ? 'top' : 'close'}" aria-label="もどる"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <b class="lmTitle"><i></i><span>${title}</span><i></i></b>
    <span class="lmPt"><span class="coin sm">P</span>${nf(save.points.bal)}</span></div>`;
}
function stars(){ const g = grade(); return `<span class="lmStars">${'★'.repeat(g)}<em>${'★'.repeat(Math.max(0, 3 - g))}</em></span>`; }
function zone(f){
  const g = grade(), lock = f.g > g, soon = !lock && f.step > 1, [x, y, w, h] = f.z;
  return `<button class="lmZone ${lock ? 'lk' : soon ? 'soon' : 'on'}" data-l="floor:${f.id}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--fc:${f.c}" aria-label="${f.n}">
    <span class="lmTag">${lock ? ico('ic_lm_lock', 'lmLockI') : ''}<b>${f.n}</b>${lock ? `<small>★${f.g}</small>` : soon ? '<small>じゅんび中</small>' : ''}</span></button>`;
}
function stageTower(extra){
  return `<div class="lmStage t-${tod()}"><img class="lmBg" src="${esc(im('lm_tower'))}" alt="" draggable="false"><i class="lmSky"></i>
    ${FLOORS.map(zone).join('')}<i class="lmStar s1"></i><i class="lmStar s2"></i><i class="lmStar s3"></i>${extra || ''}</div>`;
}
function concierge(){
  const d = D();
  return `<div class="lmCon" data-l="say"><img src="${esc(im(d.gift ? 'lm_bird_wave' : 'lm_bird_gift'))}" alt="" draggable="false"><div class="lmBub" id="lmSay">${esc(sayLine())}</div></div>`;
}
function dock(){
  const d = D();
  const btn = (k, l, lab, on) => `<button class="lmDk ${on ? 'on' : ''}" data-l="${l}">${ico(k)}<span>${lab}</span></button>`;
  return `<div class="lmDock">${btn('ic_lm_elev', 'elev', 'エレベーター')}${btn('ic_lm_music', 'music', M.on ? 'BGM オン' : 'BGM オフ', M.on)}
    ${btn('ic_lm_camera', 'camera', 'カメラ')}${btn('ic_lm_gift', 'gift', d.gift ? 'もらったよ' : 'ごほうび', !d.gift)}</div>`;
}
function card(f){
  const g = grade(), lock = f.g > g, soon = !lock && f.step > 1, [x, y, w, h] = f.z;
  const pos = `background-size:${(100 / w * 100).toFixed(1)}% auto;background-position:${(x / (100 - w) * 100).toFixed(1)}% ${((y + h / 2 - 9) / (100 - 18) * 100).toFixed(1)}%`;
  return `<button class="lmCard ${lock ? 'lk' : soon ? 'soon' : 'on'}" data-l="floor:${f.id}">
    <span class="lmThumb" style="background-image:url('${esc(im('lm_tower'))}');${pos}"></span>
    <span class="lmCtx"><b>${f.n}</b><small>${lock ? `★${f.g}で ひらく` : soon ? 'もうすぐ オープン' : esc(f.d)}</small></span>
    ${lock ? ico('ic_lm_lock', 'lmCardLock') : '<i class="lmChev"></i>'}</button>`;
}
function player(){
  return `<div class="lmPlay"><button class="lmPB ${M.on ? 'on' : ''}" data-l="music" aria-label="BGM">${M.on ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>'}</button>
    <div><b>夜空のピアノ</b><small>しずかな バージョン</small></div><span class="lmEq ${M.on ? 'on' : ''}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>`;
}
function vTop(){
  const L = isL();
  if(!L) return bar('ランドマークタワー', false) + `<div class="lmBody topP">${stageTower(concierge() + `<div class="lmGrade">${stars()}</div>`)}</div>${dock()}`;
  return bar('ランドマークタワー', false) + `<div class="lmBody topL"><div class="lmLeft">${stageTower()}</div>
    <aside class="lmSide"><div class="lmSideHd">${ico('lm_bird_wave', 'lmSideBird')}<div><b>フロアガイド</b>${stars()}</div></div>
    <div class="lmSideSay" data-l="say" id="lmSay">${esc(sayLine())}</div>
    <div class="lmCards">${FLOORS.map(card).join('')}</div>
    <div class="lmSideBtns"><button class="lmSB" data-l="elev">${ico('ic_lm_elev')}<span>エレベーター</span></button><button class="lmSB" data-l="camera">${ico('ic_lm_camera')}<span>カメラ</span></button><button class="lmSB ${D().gift ? '' : 'on'}" data-l="gift">${ico('ic_lm_gift')}<span>${D().gift ? 'もらったよ' : 'ごほうび'}</span></button></div>
    ${player()}</aside></div>`;
}
/* ---------- ロビー ---------- */
const SEATS = [[50, 70, 17], [19, 80, 15], [82, 80, 15]];   // ソファ・ひじかけ いす（left, bottom位置％, 高さ％）
function vLobby(){
  const L = isL(), d = D(), rs = lobbyRes();
  const ppl = rs.map((r, i) => { const [x, y, h] = SEATS[i], done = d.talk[r.id];
    return `<button class="lmRes ${done ? 'done' : ''}" data-l="talk:${r.id}" style="left:${x}%;top:${y}%;height:${h}%">${resPic(r)}${done ? '' : '<i class="lmHeart"></i>'}<b class="lmNm">${esc(r.name)}</b></button>`; }).join('');
  const stage = `<div class="lmStage lobby"><img class="lmBg" src="${esc(im('lm_lobby'))}" alt="" draggable="false">
    <img class="lmDesk" src="${esc(im(d.gift ? 'lm_bird_bow' : 'lm_bird_gift'))}" alt="" data-l="say">${ppl}</div>`;
  const info = `<div class="lmInfo"><div class="lmInfoHd">${ico('lm_bird_wave', 'lmInfoBird')}<p id="lmSay">${esc(rs.length ? (d.gift ? 'ソファの みなさんを タッチすると おはなし できますよ。' : sayLine()) : 'きょうは ロビーが しずかですね。まちに 住民が ふえると あそびに 来ますよ。')}</p></div>
    <div class="lmRow">${rs.map(r => `<span class="${d.talk[r.id] ? 'ok' : ''}">${esc(r.name)}${d.talk[r.id] ? ' ♡' : ''}</span>`).join('')}</div>
    <div class="lmBtns"><button class="lmB gold" data-l="gift" ${d.gift ? 'disabled' : ''}>${ico('ic_lm_gift')}<span>${d.gift ? 'きょうは もらったよ' : 'きょうの ごほうび'}</span></button>
      <button class="lmB" data-l="elev">${ico('ic_lm_elev')}<span>エレベーター</span></button></div></div>`;
  return bar('ロビー（1F）', true) + `<div class="lmBody ${L ? 'lobL' : 'lobP'}">${stage}${info}</div>`;
}
/* ---------- エレベーター ---------- */
function vElev(){
  const g = grade(), cur = V.view === 'lobby' ? 'lobby' : '';
  const rows = FLOORS.map(f => { const lock = f.g > g, soon = !lock && f.step > 1;
    return `<button class="lmEl ${lock ? 'lk' : soon ? 'soon' : 'on'} ${cur === f.id ? 'cur' : ''}" data-l="go:${f.id}" ${lock || soon ? 'aria-disabled="true"' : ''}>
      <i class="lmElN">${f.s}</i><span><b>${f.n}</b><small>${lock ? `タワーを ★${f.g} に すると ひらくよ` : soon ? `STEP${f.step}で オープン予定` : esc(f.d)}</small></span>
      ${lock ? ico('ic_lm_lock', 'lmElLock') : cur === f.id ? '<em>いま ここ</em>' : soon ? '<em class="soon">じゅんび中</em>' : '<em>いく</em>'}</button>`; }).join('');
  return `<div class="lmOv" data-l="ovx"><div class="lmElev"><div class="lmElHd">${ico('ic_lm_elev', 'lmElIc')}<b>エレベーター</b><button class="lmX" data-l="ovx" aria-label="とじる">✕</button></div>
    ${rows}<p class="lmNote">タワーの ★は まちの「もようがえ」→ たてものを タッチ →「グレードアップ」で あがるよ（いま ${stars()}）</p>
    <button class="lmB wide" data-l="grade">⬆ グレードアップ</button></div></div>`;
}
function render(){
  if(!V) return; const el = root();
  el.className = 'show ' + (isL() ? 'lL' : 'lP');
  el.innerHTML = (V.view === 'lobby' ? vLobby() : vTop()) + (V.elev ? vElev() : '');
  document.body.classList.add('lmOpen');
}
function paintMusic(){ if(!V) return; const el = document.getElementById('lm'); if(!el) return;
  el.querySelectorAll('[data-l="music"]').forEach(b => { b.classList.toggle('on', M.on); const s = b.querySelector('span'); if(s && b.classList.contains('lmDk')) s.textContent = M.on ? 'BGM オン' : 'BGM オフ'; });
  const pb = el.querySelector('.lmPB'); if(pb) pb.innerHTML = M.on ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>';
  const eq = el.querySelector('.lmEq'); if(eq) eq.classList.toggle('on', M.on); }
function go(view, o){ V = Object.assign({}, V, o || {}, {view}); render(); }
function open(key){
  D(); V = {view:'top', key, elev:false}; render(); try{ sound('ok'); }catch(e){}
  bgmStart();
}
function close(){ bgmStop(); const el = root(); el.className = ''; el.innerHTML = ''; V = null; document.body.classList.remove('lmOpen'); try{ renderCurrent(); }catch(e){} }

/* ---------- できごと ---------- */
async function giveGift(){
  const d = D(); if(d.gift){ toast('きょうの ごほうびは もう もらったよ'); return; }
  d.gift = true; d.got++; const pt = 100 + 20 * grade(); givePts(pt, 'ランドマークタワーの きょうの ごほうび'); persist();
  try{ sound('fan'); confetti(1400); }catch(e){}
  await dialog(`<div class="lmGiftDlg"><img src="${esc(im('lm_bird_gift'))}" alt=""><h2 class="dlgT">きょうの ごほうび</h2>
    <p class="dlgP">コンシェルジュから プレゼント！<br><span class="coin sm">P</span> <b>+${pt}</b></p><small>★が あがると ふえるよ（★1つで +20pt）</small></div>`, [{label:'ありがとう！', cls:'gold', v:1}], 'gold');
  render();
}
async function talk(rid){
  const r = save.town.res.find(x => x.id === rid); if(!r) return;
  const d = D(), first = !d.talk[rid];
  if(first){ d.talk[rid] = 1; r.fr = (r.fr || 0) + 1; persist(); try{ sound('ok'); }catch(e){} }
  let line = ''; try{ line = talkLine(r, {}); }catch(e){ line = 'タワーの ロビーって すてきだね！'; }
  const extra = ['タワーの ロビーって ちょっと おとなの きぶん！','ここから エレベーターで 上の 階へ 行けるんだって。','夜景が きれいだから また 来たいな。'];
  await dialog(`<div class="dlgArt big">${resPic(r)}</div><div class="talkBubble"><b>${esc(r.name)}</b>${esc(speak(r, first ? choice(extra) : line))}</div>
    ${first ? '<p class="dlgP">なかよし度 💗+1</p>' : '<p class="dlgP facNote">きょうは もう いっぱい おはなし したね</p>'}`, [{label:'またね', cls:'gold', v:1}], 'wide');
  render();
}
function floor(id){
  const f = FL(id), g = grade();
  if(f.g > g){ try{ sound('ng'); }catch(e){} toast(`🔒 ${f.n}は タワーを ★${f.g} に すると ひらくよ`); return; }
  if(f.step > 1){ toast(`✨ ${f.n}は もうすぐ オープン！（じゅんび中）`); return; }
  if(id === 'lobby'){ try{ sound('tap'); }catch(e){} V.elev = false; go('lobby'); }
}
function onClick(e){
  const b = e.target.closest('[data-l]'); if(!b || !V) return;
  const [a, v] = b.dataset.l.split(':');
  if(a === 'ovx' && e.target !== b && b.classList.contains('lmOv')) return;   // パネルの 中の タッチは とじない
  switch(a){
    case 'close': return close();
    case 'top': V.elev = false; return go('top');
    case 'floor': return floor(v);
    case 'elev': V.elev = true; try{ sound('tap'); }catch(e){} return render();
    case 'ovx': V.elev = false; return render();
    case 'go': V.elev = false; return floor(v);
    case 'grade': { const k = V.key; close(); try{ openBuilding(k); }catch(e){} return; }
    case 'music': { const d = D(); if(M.on){ d.mute = true; bgmStop(); } else { d.mute = false; persist(); if(save.settings && save.settings.bgm === false){ toast('せっていで BGM が オフに なっているよ'); return; } bgmStart(); } persist(); return; }
    case 'camera': toast('📷 夜景フォトは 展望デッキ（★2）で とれるよ。もうすぐ オープン！'); return;
    case 'gift': return giveGift();
    case 'say': { const s = document.getElementById('lmSay'); if(s){ s.textContent = sayLine(); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } try{ sound('tap'); }catch(e){} return; }
    case 'talk': return talk(v);
  }
}

/* ---------- まちの タワーを タッチ ---------- */
window.addEventListener('click', async e => {
  if(typeof curScreen === 'undefined' || curScreen !== 'town' || (typeof townEdit !== 'undefined' && townEdit) || !save.town) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const key = `${c.dataset.x},${c.dataset.y}`; if(save.town.cells[key] !== ID) return;
  e.stopImmediatePropagation(); e.preventDefault();
  try{ if(typeof tryScene === 'function' && await tryScene(ID)) return; }catch(err){}
  open(key);
}, true);
/* ショップの せつめい */
try{ const _ie = itemEffect; itemEffect = function(it){ const s = _ie.apply(this, arguments); return it && it.id === ID ? `${s}${s ? '・' : ''}🗼 タッチで タワーの 中へ（ロビー・エレベーター）` : s; }; }catch(e){}

window.__lm30 = {open, close, grade, bgmStart, bgmStop, FLOORS};
})();
