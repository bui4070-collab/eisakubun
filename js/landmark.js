/* =====================================================================
   まなびタウン v31.0：ランドマークタワー STEP1＋STEP2（スカイラウンジ）
   ・STEP2：スカイラウンジ（★1）… ピアノ リクエスト／住民の 来店（1日3〜4人）／モクテルの ちゅうもん（わりあい・計算の 問題 1日3かい）
            BGM「夜空のピアノ」ラウンジ版（28小節・約60秒）
   ----------------------------------------------------------------------
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
['lm_tower','lm_tower_l','lm_lobby','lm_bird_wave','lm_bird_bow','lm_bird_gift','ic_lm_elev','ic_lm_music','ic_lm_camera','ic_lm_gift','ic_lm_lock',
  'lm_lounge','lm_bird_piano','lm_glass_lemon','lm_glass_orange','lm_glass_berry','lm_glass_grape','lm_fr_lemon','lm_fr_orange','lm_fr_berry','lm_fr_grape','lm_cup','ic_lm_score','ic_lm_shaker']
  .forEach(k => { try{ DEFAULT_ART[k] = im(k); }catch(e){} });

/* ---------- セーブ ---------- */
function D(){
  const d = save.lm || (save.lm = {});
  d.day = d.day || ''; d.talk = d.talk || {}; d.got = d.got || 0;
  if(d.day !== dayKey()){ d.day = dayKey(); d.talk = {}; d.gift = false; d.talkL = {}; d.mk = 0; }
  d.talkL = d.talkL || {}; d.mk = d.mk || 0; d.mkOk = d.mkOk || 0;
  return d;
}
const cellsOf = () => save.town ? Object.entries(save.town.cells).filter(([k, v]) => v === ID).map(([k]) => k) : [];
const grade = () => cellsOf().reduce((a, k) => Math.max(a, (save.town.glv || {})[k] || 0), 0);

/* ---------- フロア ---------- */
/* z：タワーの 絵の 上の タッチ範囲（％：left, top, width, height）… lm_tower.webp（2:3） */
const FLOORS = [
  {id:'deck',     n:'展望デッキ',     s:'屋上',  g:2, step:3, z:[24, 12, 52, 11], c:'#9FB8FF', d:'双眼鏡で まちさがし・夜景フォト・流れ星'},
  {id:'lounge',   n:'スカイラウンジ', s:'上層',  g:1, step:1, z:[29, 27, 42, 15], c:'#F3C76A', d:'ピアノ リクエスト・住民の 来店・モクテル'},
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

/* ---------- ラウンジの 住民（日替わり 3〜4人・なかよしが 高いほど 来やすい） ---------- */
function loungeRes(){
  if(!save.town) return [];
  const L = nonHuman(); if(!L.length) return [];
  const lob = new Set(lobbyRes().map(r => r.id)), pool = L.length > 6 ? L.filter(r => !lob.has(r.id)) : L;
  const n = Math.min(pool.length, 3 + (Math.abs(hashN(dayKey() + 'lng')) % 2));
  const sc = r => (r.fr || 0) * 2 + (Math.abs(hashN(r.id + dayKey() + 'l')) % 100) / 8;
  return pool.slice().sort((a, b) => sc(b) - sc(a)).slice(0, n);
}
/* ====================================================================
   BGM（Web Audio）… v31.0：曲を 「イベントの ならび」に して ループ
   ・quiet … 夜空のピアノ しずか版（イントロ＋A 12小節・約26秒）… ロビー・タワートップ
   ・full  … 夜空のピアノ ラウンジ版（28小節・約60秒）… スカイラウンジ
             イントロ → A → B（サビ前）→ サビ → アウトロ。サビで いろいろな 楽器が かさなる
   ・song:〈id〉 … ピアノ リクエスト（おんがくで ★1いじょうの 曲を ラウンジ風に）
   ==================================================================== */
const SND = './assets/audio/music/', FN = ['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];
const SAMP = {
  pf:[48,51,54,57,60,63,66,69,72,75,78,81,84], cb:[30,31,34,36,38,40,42,44,45,49,52,56,59],
  gl:[79,84,91,96,103,108], vn:[57,60,64,67,69,72,76,79,81,84,88,91], vc:[36,39,41,43,46,49,52,55,58,61,64,67,72],
  ep:[29,35,40,45,50,55,59,62,65,71,76,81,86,91,96], vb:[53,56,59,62,65,68,71,74,77,80,83,86,89],
  sx:[49,52,55,58,61,64,67,70,73,76,79,81], hn:[33,36,39,43,50,53,60,69,74,77], fl:[60,64,69,72,76,81,84,88,93,96],
  tp:[53,57,60,63,67,70,74,77,81,84], hp:[28,31,35,38,41,45,48,52,55,59,62,65,69,72,76,79,83,86,89,93,95,98,101]
};
const REL = {pf:.9, ep:.7, vb:1.4, gl:1.6, hp:1.2, cb:.35, vn:.5, vc:.5, hn:.4, sx:.25, fl:.3, tp:.25, dr:0};
const ATK = {vn:.25, vc:.3, hn:.12};
const M = {ac:null, out:null, buf:{}, on:false, tr:null, key:'', timer:0};
/* コード（ボイシング：MIDI）… オリジナル */
const CH = {
  'Ebmaj7':[51,55,58,62], 'Cm9':[51,55,58,62], 'Abmaj7':[51,55,56,60], 'Bb7sus4':[51,53,56,58], 'Bb7':[50,53,56,58],
  'Gm7':[50,53,55,58], 'Cm7':[51,55,58,60], 'F9':[51,55,57,60], 'Fm7':[51,53,56,60], 'Eb7':[49,51,55,58], 'C7':[48,52,55,58],
  'Bb':[50,53,58,62], 'Bb/Ab':[50,53,56,58], 'Eb6':[51,55,58,60], 'Ebmaj9':[53,55,58,62]
};
const ROOT = {Ebmaj7:39, Cm9:36, Abmaj7:44, Bb7sus4:46, Bb7:46, Gm7:43, Cm7:36, F9:41, Fm7:41, Eb7:39, C7:36, Bb:46, 'Bb/Ab':44, Eb6:39, Ebmaj9:39};
/* 小節：[セクション, コード（2つなら 2拍ずつ）, メロディー（[拍, MIDI, 長さ]）] */
const INTRO = [['in',['Ebmaj7'],[]], ['in',['Cm9'],[]], ['in',['Abmaj7'],[]], ['in',['Bb7sus4','Bb7'],[[3,70,1]]]];
const PART_A = [
  ['a',['Ebmaj7','Gm7'],[[0,79,1.5],[1.5,77,.5],[2,75,1],[3,74,1]]], ['a',['Cm7','F9'],[[0,75,1.5],[1.5,72,.5],[2,74,2]]],
  ['a',['Fm7','Bb7'],[[0,72,1],[1,74,.5],[1.5,75,.5],[2,77,1],[3,79,1]]], ['a',['Ebmaj7','Eb7'],[[0,79,2.5],[3,82,1]]],
  ['a2',['Abmaj7'],[[0,84,1.5],[1.5,82,.5],[2,80,1],[3,79,1]]], ['a2',['Gm7','C7'],[[0,77,1.5],[1.5,79,.5],[2,76,2]]],
  ['a2',['Fm7'],[[0,77,1],[1,75,1],[2,72,1],[3,74,1]]], ['a2',['Bb7sus4'],[[0,75,3],[3,70,1]]]
];
const PART_B = [
  ['b',['Abmaj7'],[[0,72,1],[1,75,1],[2,79,1.5],[3.5,77,.5]]], ['b',['Bb/Ab'],[[0,77,1],[1,74,1],[2,70,2]]],
  ['b',['Gm7','C7'],[[0,74,1],[1,77,1],[2,79,1],[3,82,1]]], ['b',['Fm7','Bb7'],[[0,80,1.5],[1.5,79,.5],[2,77,1],[3,82,1]]]
];
const PART_C = [
  ['c',['Abmaj7','Bb'],[[0,84,1.5],[1.5,82,.5],[2,82,1],[3,79,1]]], ['c',['Gm7','Cm7'],[[0,82,1.5],[1.5,79,.5],[2,79,1],[3,75,1]]],
  ['c',['Fm7','Bb7'],[[0,77,1],[1,79,.5],[1.5,80,.5],[2,82,1],[3,84,1]]], ['c',['Ebmaj7','Eb7'],[[0,87,2.5],[2.5,86,.5],[3,82,1]]],
  ['c',['Abmaj7','Bb/Ab'],[[0,84,1.5],[1.5,82,.5],[2,82,1],[3,86,1]]], ['c',['Gm7','C7'],[[0,87,1.5],[1.5,86,.5],[2,84,1],[3,82,1]]],
  ['c',['Fm7','Bb7'],[[0,80,1],[1,79,1],[2,77,1],[3,74,1]]], ['c',['Eb6'],[[0,75,3],[3,70,1]]]
];
const OUTRO = [['o',['Abmaj7'],[[0,79,2],[2,75,2]]], ['o',['Gm7'],[[0,77,2],[2,74,2]]], ['o',['Fm7','Bb7'],[[0,72,1],[1,74,1],[2,77,2]]], ['o',['Ebmaj9'],[[0,75,4]]]];
const TRACKS = {
  quiet:{t:'夜空のピアノ', sub:'しずかな バージョン', bpm:112, bars:INTRO.concat(PART_A)},
  full: {t:'夜空のピアノ', sub:'ラウンジ バージョン', bpm:112, bars:INTRO.concat(PART_A, PART_B, PART_C, OUTRO)}
};
/* 小節 → イベント */
function barsToEv(bars){
  const ev = [], E = (b, k, m, d, v) => ev.push({b, k, m, d, v});
  bars.forEach(([sec, chs, mel], i) => {
    const b0 = i * 4, per = 4 / chs.length, big = sec === 'c', mid = sec === 'b', aa = sec === 'a' || sec === 'a2';
    chs.forEach((c, j) => {
      const v = CH[c], r = ROOT[c], bt = b0 + j * per;
      if(sec === 'in' || sec === 'o'){
        v.concat([v[0] + 12, v[1] + 12]).forEach((m, q) => E(bt + q * .5 * (per / 4), 'pf', m, 1.5, sec === 'o' ? .12 : .15));
        if(j === 0) E(bt, 'vb', v[3] + 12, 2, .07);
        if(sec === 'o') E(bt, 'cb', r, per * .9, .22);
        return;
      }
      /* コード：A＝エレピ、B・サビ＝ピアノ＋エレピ */
      v.forEach(m => E(bt, 'ep', m, .9, aa ? .12 : .1));
      v.forEach(m => E(bt + 1.5, 'ep', m, .4, aa ? .08 : .07));
      if(!aa) v.forEach(m => E(bt, 'pf', m + 12, .6, big ? .07 : .05));
      /* ベース（ウォーキング ぎみ） */
      E(bt, 'cb', r, .8, big ? .46 : .4); E(bt + (per > 2 ? 2 : 1), 'cb', r + 7, .7, big ? .34 : .28);
      if(per > 2){ E(bt + 1, 'cb', r + 4, .6, .2); E(bt + 3, 'cb', r + 5, .6, .2); }
      /* のばす 音：A2 から ストリングス、サビで ホルン */
      if(sec === 'a2' || mid || big){ E(bt, 'vn', v[3] + 12, per, mid ? .07 : big ? .08 : .05); }
      if(mid || big) E(bt, 'vc', r + 12, per, .1);
      if(big) E(bt, 'hn', v[1] + 12, per * .9, .1);
    });
    /* メロディー */
    mel.forEach(([b, m, l]) => {
      E(b0 + b, 'pf', m, l, big ? .32 : .3);
      if(big){ E(b0 + b, 'fl', m, l, .12); E(b0 + b, 'sx', m - 12, l, .14); }
      if(sec === 'a2') E(b0 + b, 'vb', m, l, .06);
    });
    /* サビ前：サックスの 合いの手 */
    if(mid && i % 2 === 1){ [[2.5,82],[3,80],[3.5,79]].forEach(([b, m]) => E(b0 + b, 'sx', m - 12, .45, .16)); }
    /* サビ：トランペットの キメ・グロッケン */
    if(big){ if(i % 2 === 0) E(b0, 'gl', 91 + (i % 4 ? 0 : 3), 1, .07); if(i % 4 === 3){ E(b0 + 3, 'tp', 70, .5, .14); E(b0 + 3.5, 'tp', 75, .5, .16); } }
    /* ドラム：A＝ブラシ風（かるく）／B＝だんだん 強く／サビ＝スティック */
    if(aa || mid || big){
      for(let q = 0; q < 8; q++) E(b0 + q * .5, 'dr', q % 2 ? 'hhc' : 'hhc', 0, aa ? (q % 2 ? .07 : .11) : big ? (q % 2 ? .14 : .2) : .13);
      E(b0, 'dr', 'kick', 0, aa ? .25 : .5); E(b0 + 2, 'dr', 'kick', 0, aa ? .18 : .42);
      if(!aa){ E(b0 + 1, 'dr', 'snare', 0, mid ? .12 + .05 * (i % 4) : .3); E(b0 + 3, 'dr', 'snare', 0, mid ? .14 + .05 * (i % 4) : .32); }
      else E(b0 + 3, 'dr', 'stick', 0, .12);
      if(mid && i % 4 === 3){ [2.5, 3, 3.5].forEach(b => E(b0 + b, 'dr', 'snare', 0, .26)); }
      if(sec === 'c' && (i === INTRO.length + PART_A.length + PART_B.length)) E(b0, 'dr', 'crash', 0, .3);
    }
  });
  return ev;
}
/* リクエスト曲：メロディー（ピアノ）＋ ビブラフォン ＋ コード（エレピ）＋ ベース */
const PCN = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
function pcsOf(nm){
  const m = /^([A-G])([#b]?)(.*)$/.exec(nm); if(!m) return null;
  const r = (PCN[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12, q = m[3];
  const mi = /^m(?!aj)/.test(q), dim = /dim/.test(q);
  const a = [r, (r + (mi || dim ? 3 : 4)) % 12, (r + (dim ? 6 : 7)) % 12];
  if(/maj7/.test(q)) a.push((r + 11) % 12); else if(/7/.test(q)) a.push((r + 10) % 12); else if(/6/.test(q)) a.push((r + 9) % 12);
  return a;
}
const inR = (pc, lo) => { let m = lo - (lo % 12) + pc; if(m < lo) m += 12; return m; };
function songEv(s){
  const ev = [], E = (b, k, m, d, v) => ev.push({b, k, m, d, v});
  const lo = Math.min(...s.notes.map(n => n.m)), up = lo < 62 ? 12 : 0;
  s.notes.forEach(n => { E(n.b, 'pf', n.m + up, Math.max(.4, n.d * .95), .3); E(n.b, 'vb', n.m + up, n.d, .05); });
  const C = s.ch;
  if(C && C.c){
    const B = C.bt || 4, pk = C.pk || 0;
    C.c.split('|').map(x => x.trim().split(/\s+/)).forEach((chs, i) => {
      const b0 = pk + i * B; if(b0 >= s.beats) return; const per = B / chs.length;
      chs.forEach((c, j) => { const p = pcsOf(c); if(!p) return; const bt = b0 + j * per;
        const vo = p.map(pc => inR(pc, 52)).sort((a, b) => a - b);
        vo.forEach(m => E(bt, 'ep', m, per * .45, .09)); if(per >= 2) vo.forEach(m => E(bt + per / 2, 'ep', m, per * .35, .06));
        E(bt, 'cb', inR(p[0], 36), per * .8, .32); if(per >= 3) E(bt + per / 2, 'cb', inR(p[2], 36), per * .4, .2); });
    });
  } else {
    /* コードが ない 曲：ベースだけ（1小節 ごとに 最初の 音） */
    for(let b = 0; b < s.beats; b += 4){ const n = s.notes.find(x => x.b >= b && x.b < b + 4); if(n) E(b, 'cb', inR(n.m % 12, 36), 3, .26); }
  }
  return ev;
}
function trackOf(key){
  if(key.startsWith('song:')){
    const id = key.slice(5), s = songList().find(x => x.id === id); if(!s) return trackOf('full');
    const bpm = Math.max(72, Math.min(116, Math.round(s.bpm * .88)));
    return {t:s.t, sub:'ラウンジ風 アレンジ', bpm, beats:Math.ceil(s.beats) + 4, ev:songEv(s)};
  }
  const T = TRACKS[key] || TRACKS.quiet;
  return {t:T.t, sub:T.sub, bpm:T.bpm, beats:T.bars.length * 4, ev:barsToEv(T.bars).sort((a, b) => a.b - b.b)};
}
function mAC(){
  if(!M.ac){ const C = window.AudioContext || window.webkitAudioContext; if(!C) return null; M.ac = new C();
    const comp = M.ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(M.ac.destination);
    M.out = M.ac.createGain(); M.out.gain.value = .55; M.out.connect(comp);
    try{ const len = M.ac.sampleRate * 1.8, ir = M.ac.createBuffer(2, len, M.ac.sampleRate);
      for(let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
      M.rev = M.ac.createConvolver(); M.rev.buffer = ir; const rg = M.ac.createGain(); rg.gain.value = .26; M.out.connect(M.rev); M.rev.connect(rg); rg.connect(comp); }catch(e){} }
  if(M.ac.state === 'suspended') M.ac.resume().catch(() => {});
  return M.ac;
}
const fileOf = (k, m) => k === 'dr' ? `${SND}dr_${m}.mp3` : `${SND}${k}_${FN[m % 12]}${Math.floor(m / 12) - 1}.mp3`;
function load(k, m){
  const key = k + m; if(M.buf[key]) return M.buf[key];
  return M.buf[key] = fetch(fileOf(k, m)).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
    .then(ab => new Promise((ok, ng) => { try{ const p = M.ac.decodeAudioData(ab, ok, ng); if(p && p.then) p.then(ok, ng); }catch(e){ ng(e); } })).catch(() => null);
}
const near = (k, m) => k === 'dr' ? m : SAMP[k].reduce((a, c) => Math.abs(c - m) < Math.abs(a - m) ? c : a);
async function note(tr, k, m, t, dur, vol){
  const b = near(k, m), buf = await load(k, b); if(!buf || !M.on || M.tr !== tr) return;
  const s = M.ac.createBufferSource(), g = M.ac.createGain(); s.buffer = buf; if(k !== 'dr') s.playbackRate.value = Math.pow(2, (m - b) / 12);
  const st = Math.max(t, M.ac.currentTime + .01), rel = REL[k] ?? .5;
  if(k === 'dr'){ g.gain.value = vol; s.connect(g); g.connect(tr.g); s.start(st); return; }
  g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(vol, st + (ATK[k] || .008));
  g.gain.setValueAtTime(vol, st + dur); g.gain.exponentialRampToValueAtTime(.0001, st + dur + rel);
  s.connect(g); g.connect(tr.g); s.start(st); s.stop(st + dur + rel + .05);
}
function tick(){
  const tr = M.tr; if(!M.on || !tr) return;
  const spb = 60 / tr.bpm, end = M.ac.currentTime + 1.2;
  while(true){
    if(tr.i >= tr.ev.length){ tr.i = 0; tr.t0 += tr.beats * spb; }
    const e = tr.ev[tr.i], t = tr.t0 + e.b * spb; if(t > end) break;
    note(tr, e.k, e.m, t, e.d * spb, e.v); tr.i++;
  }
}
const bgmOK = () => save.settings && save.settings.bgm !== false && !(window.__ecoBgmOff && window.__ecoBgmOff()) && !(D().mute);
function startTrack(key){
  const ac = M.ac, T = trackOf(key), g = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(1, ac.currentTime + 1.2); g.connect(M.out);
  const seen = new Set(); T.ev.forEach(e => { const k = e.k + near(e.k, e.m); if(!seen.has(k)){ seen.add(k); load(e.k, near(e.k, e.m)); } });
  M.tr = Object.assign(T, {g, i:0, t0:ac.currentTime + .35}); M.key = key;
}
function dropTrack(){
  const tr = M.tr; M.tr = null; if(!tr || !M.ac) return;
  const t = M.ac.currentTime; try{ tr.g.gain.cancelScheduledValues(t); tr.g.gain.setValueAtTime(tr.g.gain.value, t); tr.g.gain.linearRampToValueAtTime(0, t + .45); }catch(e){}
  setTimeout(() => { try{ tr.g.disconnect(); }catch(e){} }, 3500);
}
function bgmStart(key){
  key = key || wantKey();
  if(!bgmOK() || document.hidden) return; const ac = mAC(); if(!ac) return;
  if(M.on && M.key === key) return;
  M.on = true; dropTrack(); startTrack(key);
  tick(); clearInterval(M.timer); M.timer = setInterval(tick, 250); paintMusic();
}
function bgmStop(){
  if(!M.on) return; M.on = false; clearInterval(M.timer); dropTrack(); M.key = ''; paintMusic();
}
function wantKey(){ if(!V) return 'quiet'; if(V.view === 'lounge') return V.req ? 'song:' + V.req : 'full'; return 'quiet'; }
function syncBgm(){ if(M.on && M.key !== wantKey()) bgmStart(wantKey()); }
document.addEventListener('visibilitychange', () => { if(!V) return; if(document.hidden) bgmStop(); else bgmStart(); });
/* まちの BGM は タワーの 中では ながさない */
try{ const W = window.__bgm643; if(W){ const t0 = W.target; W.target = () => document.querySelector('#lm.show') ? 0 : t0(); } }catch(e){}
/* リクエストできる 曲（おんがくの 曲） */
function songList(){ try{ return (window.__mu280 && window.__mu280.lounge) ? window.__mu280.lounge() : []; }catch(e){ return []; } }

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
    <div><b>${esc(M.tr ? M.tr.t : trackOf(wantKey()).t)}</b><small>${esc(M.tr ? M.tr.sub : trackOf(wantKey()).sub)}</small></div><span class="lmEq ${M.on ? 'on' : ''}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>`;
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
/* ---------- スカイラウンジ（★1） ---------- */
const LSEATS = [[25.9, 83.5, 15], [69.8, 83.5, 15], [10.7, 68.5, 12.5], [89.4, 67.8, 12.5]];
const MK_MAX = 3;
function vLounge(){
  const L = isL(), d = D(), rs = loungeRes(), playing = M.on;
  const ppl = rs.map((r, i) => { const [x, y, h] = LSEATS[i], done = d.talkL[r.id];
    return `<button class="lmRes ${done ? 'done' : ''}" data-l="talkL:${r.id}" style="left:${x}%;top:${y}%;height:${h}%">${resPic(r)}${done ? '' : '<i class="lmHeart"></i>'}<b class="lmNm">${esc(r.name)}</b></button>`; }).join('');
  const notes = playing ? '<i class="lmFloat n1"></i><i class="lmFloat n2"></i><i class="lmFloat n3"></i>' : '';
  const stage = `<div class="lmStage lounge ${playing ? 'play' : ''}"><img class="lmBg" src="${esc(im('lm_lounge'))}" alt="" draggable="false">
    <img class="lmPianist" src="${esc(im('lm_bird_piano'))}" alt="" data-l="req">${notes}${ppl}</div>`;
  const now = M.tr ? M.tr.t + (V.req ? '' : '（ラウンジ版）') : trackOf(wantKey()).t;
  const left = MK_MAX - d.mk;
  const say = rs.length ? (left > 0 ? `いらっしゃいませ。${esc(rs[0].name)}さんが モクテルを まっていますよ。` : 'きょうの モクテルは おしまい。ピアノを たのしんでくださいね。')
    : 'きょうの ラウンジは しずかですね。住民が ふえると あそびに 来ますよ。';
  const info = `<div class="lmInfo"><div class="lmInfoHd">${ico('lm_bird_wave', 'lmInfoBird')}<p id="lmSay">${say}</p></div>
    <div class="lmNow">${ico('ic_lm_score', 'lmNowI')}<span><small>いま ながれている 曲</small><b>${esc(now)}</b></span>${playing ? '<span class="lmEq on"><i></i><i></i><i></i><i></i><i></i></span>' : ''}</div>
    <div class="lmRow">${rs.map(r => `<span class="${d.talkL[r.id] ? 'ok' : ''}">${esc(r.name)}${d.talkL[r.id] ? ' ♡' : ''}</span>`).join('')}</div>
    <div class="lmBtns">
      <button class="lmB gold" data-l="req">${ico('ic_lm_score')}<span>リクエスト</span></button>
      <button class="lmB ${left > 0 && rs.length ? 'pink' : ''}" data-l="mk" ${left > 0 && rs.length ? '' : 'disabled'}>${ico('ic_lm_shaker')}<span>モクテル ${Math.max(0, left)}/${MK_MAX}</span></button>
      <button class="lmB" data-l="music">${ico('ic_lm_music')}<span>${M.on ? 'BGM オン' : 'BGM オフ'}</span></button>
      <button class="lmB" data-l="elev">${ico('ic_lm_elev')}<span>エレベーター</span></button></div></div>`;
  return bar('スカイラウンジ', true) + `<div class="lmBody ${L ? 'lobL' : 'lobP'} lng">${stage}${info}</div>`;
}
/* ---------- ピアノ リクエスト ---------- */
function vReq(){
  const L = songList(), cur = V.req || '';
  const row = (id, t, sub, ok) => `<button class="lmEl ${ok ? 'on' : 'lk'} ${cur === id ? 'cur' : ''}" data-l="${ok ? 'play:' + id : 'reqlk'}">
    ${ico(ok ? 'ic_lm_score' : 'ic_lm_lock', 'lmReqI')}<span><b>${esc(t)}</b><small>${esc(sub)}</small></span>${cur === id ? '<em>えんそう中</em>' : ok ? '<em>ひく</em>' : ''}</button>`;
  const got = L.filter(s => s.st >= 1), n = got.length;
  const rows = row('', '夜空のピアノ', 'ラウンジの テーマ（ラウンジ版）', true)
    + L.map(s => s.st >= 1 ? row(s.id, s.t, '★' + s.st + '　ラウンジ風に ひくよ', true) : row(s.id, '？？？', 'おんがくで ★1 いじょう クリアすると ひけるよ', false)).join('');
  return `<div class="lmOv" data-l="ovx"><div class="lmElev lmReq"><div class="lmElHd">${ico('lm_bird_piano', 'lmElIc')}<b>ピアノ リクエスト</b><button class="lmX" data-l="ovx" aria-label="とじる">✕</button></div>
    <p class="lmNote">おんがく（リズムゲーム）で クリアした 曲を シマエナガが ひいてくれるよ（${n} / ${L.length}きょく）</p><div class="lmReqList">${rows}</div></div></div>`;
}
/* ---------- モクテル（わりあい・計算の 問題） ---------- */
const FRUIT = [
  {k:'lemon',  n:'レモン',   g:'lm_glass_lemon',  f:'lm_fr_lemon'},
  {k:'orange', n:'オレンジ', g:'lm_glass_orange', f:'lm_fr_orange'},
  {k:'berry',  n:'いちご',   g:'lm_glass_berry',  f:'lm_fr_berry'},
  {k:'grape',  n:'ぶどう',   g:'lm_glass_grape',  f:'lm_fr_grape'}
];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
function opts(ans, cands, unit){
  const set = new Set([ans]); cands.filter(x => x > 0 && x !== ans).forEach(x => { if(set.size < 4) set.add(x); });
  let k = 1; while(set.size < 4){ const x = ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (ans >= 100 ? 50 : ans >= 20 ? 10 : 5); if(x > 0) set.add(x); k++; }
  return [...set].sort(() => Math.random() - .5).map(v => ({v, t:v + unit}));
}
function mkQuiz(){
  const A = pick(FRUIT), B = pick(FRUIT.filter(x => x !== A)), type = ri(0, 4);
  if(type === 0){   // 比
    const a = ri(1, 4), b = ri(1, 4), k = pick([20, 40, 50, 60, 100]), T = (a + b) * k, ans = a * k;
    return {A, B, q:`${A.n} と ${B.n} を <b>${a}：${b}</b> で まぜて、ぜんぶで <b>${T}mL</b> つくります。<br>${A.n}は なんmL？`, ans, unit:'mL',
      o:opts(ans, [b * k, T - ans + k, ans + k, Math.round(T / 2)], 'mL'), why:`${a}＋${b}＝${a + b}こぶん。1こぶんは ${T}÷${a + b}＝${k}mL。${A.n}は ${k}×${a}＝${ans}mL`};
  }
  if(type === 1){   // かけ算
    const x = pick([120, 150, 180, 200, 250]), n = ri(2, 6), ans = x * n;
    return {A, B:null, q:`${A.n}の モクテルは 1ぱい <b>${x}mL</b>。<br><b>${n}にんぶん</b> つくると ぜんぶで なんmL？`, ans, unit:'mL',
      o:opts(ans, [x * (n - 1), x * (n + 1), x + n * 10], 'mL'), why:`${x}mL × ${n}ぱい ＝ ${ans}mL`};
  }
  if(type === 2){   // わり算
    const x = pick([80, 120, 150, 160, 200, 250]), n = ri(2, 6), T = x * n;
    return {A, B:null, q:`${A.n}ジュースが <b>${T}mL</b> あります。<br><b>${n}にん</b>で おなじ りょうずつ わけると 1にん なんmL？`, ans:x, unit:'mL',
      o:opts(x, [x + 20, x - 20, Math.round(T / (n + 1) / 10) * 10], 'mL'), why:`${T}mL ÷ ${n}にん ＝ ${x}mL`};
  }
  if(type === 3){   // わりあい（％）
    const pr = pick([[1, 4], [1, 3], [2, 3], [3, 2], [1, 1], [3, 1], [4, 1], [2, 8], [1, 9]]), k = pick([50, 100]);
    const a = pr[0] * k, b = pr[1] * k, ans = Math.round(a / (a + b) * 100);
    return {A, B, q:`${A.n} <b>${a}mL</b> と ${B.n} <b>${b}mL</b> を まぜました。<br>${A.n}は ぜんたいの なん％？`, ans, unit:'%',
      o:opts(ans, [100 - ans, Math.round(a / b * 100) > 0 && Math.round(a / b * 100) <= 400 ? Math.round(a / b * 100) : ans + 10, ans + 10], '%'),
      why:`ぜんたいは ${a}＋${b}＝${a + b}mL。${a}÷${a + b}＝${(a / (a + b)).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} → ${ans}％`};
  }
  const x = pick([150, 180, 200, 250]), n = ri(2, 4), T = pick([1000, 1200, 1500]), ans = T - x * n;   // のこり
  return {A, B:null, q:`ポットに ${A.n}ジュースが <b>${T}mL</b>。<br><b>${x}mL</b> の グラスに <b>${n}ぱい</b> そそぐと、のこりは なんmL？`, ans, unit:'mL',
    o:opts(ans, [x * n, ans + x, ans - x], 'mL'), why:`${x}×${n}＝${x * n}mL つかう。${T}−${x * n}＝${ans}mL`};
}
function vMk(){
  const P = V.mk; if(!P) return '';
  const r = save.town.res.find(x => x.id === P.rid), Q = P.q;
  const head = `<div class="lmElHd">${ico('ic_lm_shaker', 'lmElIc')}<b>モクテルの ちゅうもん</b><button class="lmX" data-l="mkx" aria-label="とじる">✕</button></div>`;
  const who = r ? `<div class="lmMkWho"><span class="lmMkPic">${resPic(r)}</span><div class="lmMkBub"><b>${esc(r.name)}</b>${esc(speak(r, `${Q.A.n}の モクテルを ください！`))}</div>${ico(Q.A.g, 'lmMkGlass')}</div>` : '';
  const fr = `<div class="lmMkFr">${ico(Q.A.f, 'lmMkF')}${Q.B ? `<i>＋</i>${ico(Q.B.f, 'lmMkF')}` : ''}${ico('lm_cup', 'lmMkF')}</div>`;
  if(P.res){
    const ok = P.res === 'ok';
    return `<div class="lmOv"><div class="lmElev lmMk">${head}${who}
      <div class="lmMkRes ${ok ? 'ok' : 'ng'}">${ico(ok ? Q.A.g : 'lm_cup', 'lmMkBig')}<b>${ok ? 'せいかい！ おいしい モクテルが できたよ' : 'おしい！'}</b>
      <p>こたえ：<b>${Q.ans}${Q.unit}</b><br><small>${Q.why}</small></p>
      ${ok ? `<em><span class="coin sm">P</span> +60　なかよし度 +1</em>` : `<em><span class="coin sm">P</span> +10（ちょうせん）</em>`}</div>
      <button class="lmB gold wide" data-l="mkx">${ico('ic_lm_shaker')}<span>OK</span></button></div></div>`;
  }
  return `<div class="lmOv"><div class="lmElev lmMk">${head}${who}${fr}<p class="lmMkQ">${Q.q}</p>
    <div class="lmMkOpts">${Q.o.map((o, i) => `<button class="lmMkO" data-l="mka:${i}">${esc(o.t)}</button>`).join('')}</div>
    <p class="lmNote">きょう あと ${MK_MAX - D().mk}かい（せいかいで 60pt・なかよし度 +1）</p></div></div>`;
}
/* ---------- エレベーター ---------- */
function vElev(){
  const g = grade(), cur = V.view === 'lobby' || V.view === 'lounge' ? V.view : '';
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
  el.innerHTML = (V.view === 'lobby' ? vLobby() : V.view === 'lounge' ? vLounge() : vTop()) + (V.elev ? vElev() : V.reqOv ? vReq() : V.mk ? vMk() : '');
  document.body.classList.add('lmOpen');
}
function paintMusic(){ if(!V) return; const el = document.getElementById('lm'); if(!el) return;
  el.querySelectorAll('[data-l="music"]').forEach(b => { b.classList.toggle('on', M.on); const s = b.querySelector('span'); if(s && b.classList.contains('lmDk')) s.textContent = M.on ? 'BGM オン' : 'BGM オフ'; });
  const pb = el.querySelector('.lmPB'); if(pb) pb.innerHTML = M.on ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>';
  const eq = el.querySelector('.lmEq'); if(eq) eq.classList.toggle('on', M.on); }
function go(view, o){ V = Object.assign({}, V, o || {}, {view}); render(); syncBgm(); }
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
async function talkL(rid){
  const r = save.town.res.find(x => x.id === rid); if(!r) return;
  const d = D(), first = !d.talkL[rid];
  if(first){ d.talkL[rid] = 1; r.fr = (r.fr || 0) + 1; persist(); try{ sound('ok'); }catch(e){} }
  const L = ['ピアノの 音って こころが ふわっと するね。','ここから 見る 夜景、さいこう！','モクテル、おいしいんだよ。','きょうは ちょっと おしゃれして きたんだ。','シマエナガさんの ピアノ、だいすき！'];
  let line = ''; try{ line = talkLine(r, {}); }catch(e){ line = L[0]; }
  await dialog(`<div class="dlgArt big">${resPic(r)}</div><div class="talkBubble"><b>${esc(r.name)}</b>${esc(speak(r, first ? pick(L) : line))}</div>
    ${first ? '<p class="dlgP">なかよし度 💗+1</p>' : '<p class="dlgP facNote">きょうは もう いっぱい おはなし したね</p>'}`, [{label:'またね', cls:'gold', v:1}], 'wide');
  render();
}
function mkStart(){
  const d = D(), rs = loungeRes();
  if(!rs.length){ toast('いまは ラウンジに おきゃくさんが いないよ'); return; }
  if(d.mk >= MK_MAX){ toast('きょうの モクテルは おしまい。また あした！'); return; }
  V.mk = {rid:rs[d.mk % rs.length].id, q:mkQuiz(), res:null}; V.elev = false; V.reqOv = false;
  try{ sound('tap'); }catch(e){} render();
}
function mkAnswer(i){
  const P = V.mk; if(!P || P.res) return; const o = P.q.o[i]; if(!o) return;
  const d = D(), r = save.town.res.find(x => x.id === P.rid), ok = o.v === P.q.ans;
  d.mk++; P.res = ok ? 'ok' : 'ng';
  if(ok){ d.mkOk++; givePts(60, 'スカイラウンジで モクテルを つくった'); if(r) r.fr = (r.fr || 0) + 1; try{ sound('fan'); confetti(1200); }catch(e){} }
  else { givePts(10, 'スカイラウンジで モクテルに ちょうせん'); try{ sound('ng'); }catch(e){} }
  try{ window.recAns && recAns(ok, {src:'lounge'}); }catch(e){}
  persist(); render();
}
function floor(id){
  const f = FL(id), g = grade();
  if(f.g > g){ try{ sound('ng'); }catch(e){} toast(`🔒 ${f.n}は タワーを ★${f.g} に すると ひらくよ`); return; }
  if(f.step > 1){ toast(`✨ ${f.n}は もうすぐ オープン！（じゅんび中）`); return; }
  if(id === 'lobby'){ try{ sound('tap'); }catch(e){} V.elev = false; go('lobby'); }
  if(id === 'lounge'){ try{ sound('tap'); }catch(e){} V.elev = false; go('lounge'); }
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
    case 'ovx': V.elev = false; V.reqOv = false; return render();
    case 'go': V.elev = false; return floor(v);
    case 'grade': { const k = V.key; close(); try{ openBuilding(k); }catch(e){} return; }
    case 'music': { const d = D(); if(M.on){ d.mute = true; bgmStop(); } else { d.mute = false; persist(); if(save.settings && save.settings.bgm === false){ toast('せっていで BGM が オフに なっているよ'); return; } bgmStart(); } persist(); if(V && V.view === 'lounge') render(); return; }
    case 'camera': toast('📷 夜景フォトは 展望デッキ（★2）で とれるよ。もうすぐ オープン！'); return;
    case 'gift': return giveGift();
    case 'say': { const s = document.getElementById('lmSay'); if(s){ s.textContent = sayLine(); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } try{ sound('tap'); }catch(e){} return; }
    case 'talk': return talk(v);
    case 'talkL': return talkL(v);
    case 'req': V.reqOv = true; V.elev = false; try{ sound('tap'); }catch(e){} return render();
    case 'reqlk': toast('おんがく（リズムゲーム）で この 曲を ★1いじょう クリアすると ひけるよ'); return;
    case 'play': { V.req = v || ''; V.reqOv = false; persist(); render();
      if(!M.on){ D().mute = false; bgmStart(); } else syncBgm();
      if(!M.on && save.settings && save.settings.bgm === false) toast('せっていで BGM が オフに なっているよ');
      else toast(`🎹 「${(v ? (songList().find(s => s.id === v) || {}).t : '夜空のピアノ') || ''}」を ひくよ`); return; }
    case 'mk': return mkStart();
    case 'mka': return mkAnswer(+v);
    case 'mkx': V.mk = null; return render();
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
try{ const _ie = itemEffect; itemEffect = function(it){ const s = _ie.apply(this, arguments); return it && it.id === ID ? `${s}${s ? '・' : ''}🗼 タッチで タワーの 中へ（ロビー・★1 スカイラウンジ）` : s; }; }catch(e){}

window.__lm30 = {open, close, grade, bgmStart, bgmStop, FLOORS, mkQuiz, trackOf};
})();
