/* =====================================================================
   まなびタウン v34.0：ピアノ リクエストの ジャズ アレンジ／せっていで おんがく ぜんきょく クリア あつかい
   ※ v33.0：ランドマークタワー STEP1〜4（ぜんぶ）
   ・STEP4：ブティック（★0）… タワー限定の 家具（4しゅ）・衣装（2しゅ・住民の 着せかえ）・夜景フォト こうかん（5まい → 限定品）
            ★3 ライトアップ … タワーが 季節の 色で 光る（タワー画面・夜の まち）／ラウンジに キツネの サックス／BGM 豪華版（サビで 半音上げ）
   ----------------------------------------------------------------------
   ・STEP3：展望デッキ（★2）… 双眼鏡で まちさがし（60秒で 3もん・1日1かい）／夜景フォト（1日3まい・アルバム）／流れ星（夜だけ・1日3かい）
            BGM「夜空のピアノ」ほしぞら版（ハープ・ビブラフォン 多め）
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
  'lm_boutique','lm_fox_clerk','lm_fox_sax','ic_lm_hanger','ic_lm_ticket','bt_moonlamp','bt_starsofa','bt_minipiano','bt_nightart','bt_snowglobe','bt_towermini','wr_tux','wr_dress',
  'lm_deck','lm_townview','lm_bird_scope','lm_bird_cam','lm_bird_wish','ic_lm_scope','ic_lm_album','lm_shootstar','lm_polaroid','lm_wishmedal',
  'lm_lounge','lm_bird_piano','lm_glass_lemon','lm_glass_orange','lm_glass_berry','lm_glass_grape','lm_fr_lemon','lm_fr_orange','lm_fr_berry','lm_fr_grape','lm_cup','ic_lm_score','ic_lm_shaker']
  .forEach(k => { try{ DEFAULT_ART[k] = im(k); }catch(e){} });

/* ---------- セーブ ---------- */
function D(){
  const d = save.lm || (save.lm = {});
  d.day = d.day || ''; d.talk = d.talk || {}; d.got = d.got || 0;
  if(d.day !== dayKey()){ d.day = dayKey(); d.talk = {}; d.gift = false; d.talkL = {}; d.mk = 0; d.hunt = 0; d.shot = 0; d.wish = 0; }
  d.album = d.album || []; d.hunt = d.hunt || 0; d.shot = d.shot || 0; d.wish = d.wish || 0;
  d.talkL = d.talkL || {}; d.mk = d.mk || 0; d.mkOk = d.mkOk || 0;
  d.wear = d.wear || {}; d.wInv = d.wInv || {}; d.exN = d.exN || 0;
  return d;
}
const cellsOf = () => save.town ? Object.entries(save.town.cells).filter(([k, v]) => v === ID).map(([k]) => k) : [];
const grade = () => cellsOf().reduce((a, k) => Math.max(a, (save.town.glv || {})[k] || 0), 0);

/* ---------- フロア ---------- */
/* z：タワーの 絵の 上の タッチ範囲（％：left, top, width, height）… lm_tower.webp（2:3） */
const FLOORS = [
  {id:'deck',     n:'展望デッキ',     s:'屋上',  g:2, step:1, z:[24, 12, 52, 11], c:'#9FB8FF', d:'双眼鏡で まちさがし・夜景フォト・流れ星'},
  {id:'lounge',   n:'スカイラウンジ', s:'上層',  g:1, step:1, z:[29, 27, 42, 15], c:'#F3C76A', d:'ピアノ リクエスト・住民の 来店・モクテル'},
  {id:'boutique', n:'ブティック',     s:'中層',  g:0, step:1, z:[29, 47, 42, 14], c:'#F0A6C0', d:'タワー限定の 家具・衣装・フォト こうかん'},
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
   STEP4：ブティックの 商品
   ・家具（わたしの家）… ポイントで 買う
   ・衣装（住民の 着せかえ）… ポイントで 買って、住民に 着せる（1人 1つ。ぬぐと もどる）
   ・フォト こうかん … 夜景フォト 5まい → 限定品（スノードーム＝家具／タワーの ミニチュア＝まちの かざり）
   ==================================================================== */
const BT_FUR = [
  {id:'lm_moonlamp',  art:'bt_moonlamp',  n:'三日月ランプ',     p:2000, sty:8,  size:1.05, d:'金の 三日月が やさしく 光る ランプ'},
  {id:'lm_nightart',  art:'bt_nightart',  n:'夜景アート',       p:2500, sty:9,  size:1.0,  d:'タワーから 見た 夜景の 絵'},
  {id:'lm_starsofa',  art:'bt_starsofa',  n:'星のソファ',       p:3500, sty:12, size:1.6, foot:[2,1], d:'星の クッションが のった ベルベットの ソファ'},
  {id:'lm_minipiano', art:'bt_minipiano', n:'ミニグランドピアノ', p:6000, sty:20, size:1.5, foot:[2,1], d:'ラウンジと おなじ 金の ふちどりの ピアノ'}
];
const BT_WEAR = [
  {id:'tux',   art:'wr_tux',   n:'タキシード',     p:3000, d:'蝶ネクタイと えりで ちょっと おとなの きぶん'},
  {id:'dress', art:'wr_dress', n:'きらきらドレス', p:3000, d:'星の ジュエルが ついた リボンの カチューシャ'}
];
const BT_EX = [
  {id:'lm_snowglobe', art:'bt_snowglobe', n:'タワーのスノードーム', k:'fur',  sty:14, size:1.0, d:'夜景フォト 5まいで こうかん（わたしの家の 家具）'},
  {id:'d_lmtower',    art:'bt_towermini', n:'タワーのミニチュア',   k:'deco', dev:30, d:'夜景フォト 5まいで こうかん（まちの かざり）'}
];
const EX_N = 5;
try{
  BT_FUR.concat(BT_EX.filter(x => x.k === 'fur')).forEach(f => {
    if(!FURNITURE.some(x => x.id === f.id)) FURNITURE.push({id:f.id, name:f.n, art:f.art, type:'fur', price:f.p || 0, lv:1, sty:f.sty, special:true});
    try{ SHOP_ONLY[f.id] = 'landmark'; }catch(e){}
    try{ FUR_SIZE[f.id] = f.size || 1; if(f.foot) FOOT[f.id] = f.foot; SIDE_W[f.id] = f.foot ? f.foot[0] * 0.95 + 0.1 : 1; }catch(e){}
  });
  BT_EX.filter(x => x.k === 'deco').forEach(f => {
    if(!TOWN_ITEMS.some(x => x.id === f.id)) TOWN_ITEMS.push({id:f.id, type:'bld', cat:'deco', name:f.n, art:f.art, emoji:'\uD83D\uDDFC', price:4000, lv:1, dev:f.dev, ev:'landmark'});
    try{ SHOP_ONLY[f.id] = 'landmark'; }catch(e){}
  });
}catch(e){ console.warn('lm boutique items', e); }
const furN = id => { try{ return homeCount(id); }catch(e){ return 0; } };
const decoN = id => { const t = save.town; if(!t) return 0; return ((t.inv || {})[id] || 0) + Object.values(t.cells).filter(v => v === id).length; };
/* 衣装：住民の 絵に かさねる（ランク専用イラストの ときも 消えない クラス名） */
try{
  const _rp = resPic;
  resPic = function(r){
    let h = _rp.apply(this, arguments);
    try{
      const w = r && save.lm && save.lm.wear && save.lm.wear[r.id]; if(!w) return h;
      const s = SP(r.sp); if(s.human) return h;
      const H = Object.assign({top:.05, hw:.7, cx:.5, dy:.10, hs:.62}, (typeof HEADS !== 'undefined' && HEADS[s.art]) || {});
      const ov = w === 'tux'
        ? `<img class="lmWear tux" src="${esc(im('wr_tux'))}" alt="" style="left:${H.cx * 100}%;top:${(H.medY || .6) * 100}%;width:${Math.max(30, H.hw * 46)}%">`
        : `<img class="lmWear dress" src="${esc(im('wr_dress'))}" alt="" style="left:${H.cx * 100}%;top:${(H.top + H.dy * .4) * 100}%;width:${Math.max(36, H.hw * H.hs * 120)}%">`;
      const i = h.lastIndexOf('</span>'); if(i > 0) h = h.slice(0, i) + ov + h.slice(i);
    }catch(e){}
    return h;
  };
}catch(e){ console.warn('lm wear', e); }
/* ★3 ライトアップの 季節の 色 */
const SEASON = () => { const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? 'spr' : m >= 6 && m <= 8 ? 'sum' : m >= 9 && m <= 11 ? 'aut' : 'win'; };
const SEASON_N = {spr:'さくら色', sum:'マリンブルー', aut:'もみじ色', win:'スノーホワイト'};
const lit = () => grade() >= 3;

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
  full: {t:'夜空のピアノ', sub:'ラウンジ バージョン', bpm:112, bars:INTRO.concat(PART_A, PART_B, PART_C, OUTRO)},
  deck: {t:'夜空のピアノ', sub:'ほしぞら バージョン', bpm:96, bars:INTRO.concat(PART_A, OUTRO), dk:1},
  full3:{t:'夜空のピアノ', sub:'ライトアップ バージョン', bpm:112, bars:INTRO.concat(PART_A, PART_B, PART_C, OUTRO), up:1}
};
/* 小節 → イベント */
function barsToEv(bars, dk, up){
  const ev = [], E = (b, k, m, d, v) => ev.push({b, k, m, d, v});
  bars.forEach(([sec, chs, mel], i) => {
    const b0 = i * 4, per = 4 / chs.length, big = sec === 'c', mid = sec === 'b', aa = sec === 'a' || sec === 'a2';
    chs.forEach((c, j) => {
      const v = CH[c], r = ROOT[c], bt = b0 + j * per;
      if(sec === 'in' || sec === 'o'){
        v.concat([v[0] + 12, v[1] + 12]).forEach((m, q) => E(bt + q * .5 * (per / 4), dk ? 'hp' : 'pf', m, 1.5, sec === 'o' ? .12 : dk ? .18 : .15));
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
      if(sec === 'a2' || mid || big || dk){ E(bt, 'vn', v[3] + 12, per, mid ? .07 : big ? .08 : .05); }
      if(dk) v.concat([v[0] + 12]).forEach((m, q) => E(bt + q * (per / 5), 'hp', m + 12, 1, .08));
      if(mid || big) E(bt, 'vc', r + 12, per, .1);
      if(big) E(bt, 'hn', v[1] + 12, per * .9, .1);
    });
    /* メロディー */
    mel.forEach(([b, m, l]) => {
      E(b0 + b, 'pf', m, l, dk ? .2 : big ? .32 : .3); if(dk){ E(b0 + b, 'vb', m, l, .1); }
      if(big){ E(b0 + b, 'fl', m, l, .12); E(b0 + b, 'sx', m - 12, l, .14); }
      if(sec === 'a2') E(b0 + b, 'vb', m, l, .06);
      if(up && aa) E(b0 + b, 'sx', m - 12, l, .1);   /* ★3：キツネの サックスが A から いっしょに 　ふく */
    });
    /* サビ前：サックスの 合いの手 */
    if(mid && i % 2 === 1){ [[2.5,82],[3,80],[3.5,79]].forEach(([b, m]) => E(b0 + b, 'sx', m - 12, .45, .16)); }
    /* サビ：トランペットの キメ・グロッケン */
    if(big){ if(i % 2 === 0) E(b0, 'gl', 91 + (i % 4 ? 0 : 3), 1, .07); if(i % 4 === 3){ E(b0 + 3, 'tp', 70, .5, .14); E(b0 + 3.5, 'tp', 75, .5, .16); } }
    /* ドラム：A＝ブラシ風（かるく）／B＝だんだん 強く／サビ＝スティック */
    if((aa || mid || big) && !dk){
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
/* ====================================================================
   v34.0：ピアノ リクエストの ジャズ アレンジ（jazz_test v5 と おなじ ないよう）
   ・JAZZ_REHARM に ある 19きょくは ジャズ（イントロ 5しゅ → テーマ → サックス → テーマ → エンディング）
   ・それ いがい（あの雲のように・カノン・トルコ行進曲 など）は これまでの ラウンジ風
   ・くり返す たびに イントロ・強弱を 作りなおす
   ==================================================================== */
const JZ = (function(){
const PCN = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
function parseSong(s){
  if(s.notes) return s.notes; let t = 0; const a = [];
  s.n.trim().split(/\s+/).forEach(x => { const [nm, b] = x.split(':'), d = +b;
    if(nm !== 'R') a.push({m:12 * (+nm.slice(-1) + 1) + PCN[nm[0]] + (nm[1] === '#' ? 1 : 0), b:t, d});
    t += d; });
  s.beats = t; return s.notes = a;
}

/* =====================================================================
   ジャズ アレンジャー（jazz_test v5 と おなじ）
   ・JAZZ_REHARM … 参考音源の 解析から 作った 曲ごとの コード（1小節ずつ。2つなら 半分ずつ）
     bt＝1小節の 拍、key＝主音、mi＝短調、soft＝しずかな 曲
     弱起（pk）の 曲は、拍の 位置を ずらして 0小節目を「弱起の 小節」に する
   ===================================================================== */
const JAZZ_REHARM = {
  kira:     {bpm:112, key:0, c:'C6 A7|Dm7 C6|Fmaj7 Em7|G7 C6|C6 Dm7|Cmaj7 G7|Em7 Dm7|Em7 G7|C6 A7|Dm7 C6|Fmaj7 Em7|G7 C6'},
  kaeru:    {bpm:128, key:0, c:'Cmaj7 Dm7|Em7 A7|Cmaj7 F7|Em7 A7|Fmaj7 Fm6|Cmaj7 A7|Dm7 G7|G7 C6'},
  mary:     {bpm:124, key:0, c:'C6 Am7|Dm7 G7|Bm7b5 E7|Am7 G7|C6 Am7|Em7 A7|Dm7 G7|C69'},
  chou:     {bpm:120, key:0, c:'C6 Am7|Dm7 G7|C6 Dm7|Em7 A7|Dm7 G7|Bm7b5 E7|Am7 G7|C6|G7|Dm7 G7|Cmaj7 Am7|Fmaj7 Fm6|Em7 A7|Dm7 G7|Dm7 G7|C69'},
  london:   {bpm:116, key:0, c:'C6 G7|Cmaj7 A7|Dm7 G7|Em7 A7|Dm7 G7|Cmaj7 A7|Dm7 G7|C69'},
  acha:     {bpm:136, key:7, c:'G6 Em7|Am7 D7|Bm7 D7|G6 B7|Em7 A7|Dm7 G7|Cmaj7 Cm6|Am7 D7|G6 Em7|Am7 D7|Bm7 D7|G69'},
  hotcross: {bpm:108, key:0, c:'Cmaj7 Am7|Em7 Ebdim7|Dm7 G7|G7 C6|Cmaj7 Am7|Fmaj7 Fm6|Am7 D7|G7 C69'},
  frere:    {bpm:112, key:0, c:'Cmaj7 Am7|Dm7 G7|Cmaj7 Em7|Fmaj7 Fm6|C6 Am7|G7 C6|Am7 D7|Dm7 G7sus|Cmaj7 Am7|Dm7 G7|Cmaj7 Em7|Fmaj7 Fm6|C6 Am7|G7 C6|Am7 D7|Dm7 G7sus'},
  oldmac:   {bpm:120, key:0, c:'Cmaj7 A7|Dm7 G7|C6 G7|C6|C6 Am7|Fmaj7 Em7|Dm7 G7|C6|Cmaj7 C7|Fmaj7 Bb7|Dm7 G7|C69'},
  /* ---- ついかした 10きょく ---- */
  row:      {bpm:120, key:0, bt:3, c:'C6|Am7|Dm7 G7|Cmaj7|C6|Am7|Dm7 G7|C6|C6|Am7|Dm7 G7|Cmaj7|C6|Am7|Dm7 G7|C69'},
  joy:      {bpm:112, key:0, c:'Cmaj7 Fmaj7|Dm7 G7|C6 Em7|Dm7 G7|Cmaj7 Fmaj7|Dm7 G7|C6 Em7|G7sus C6|Dm7 Cmaj7|G7 Am7|Dm7 G7|Am7 G7|Cmaj7 Fmaj7|Dm7 G7|C6 Em7|G7sus C69'},
  saints:   {bpm:116, key:0, pk:3, c:'Dm7 G7|C6|C6 Dm7|C6|C6 Dm7|C6 A7|Dm7 G7|Dm7|G7|C6 C7|Fmaj7|F6 Fm6|Cmaj7 Dm7|Em7 A7|Dm7 G7|C69'},
  happy:    {bpm:100, key:0, bt:3, pk:1, c:'G7|C6|G7|Dm7 G7|C6 C7|Fmaj7|Dm7 G7|C6 G7|C6 G7|C6|G7|Dm7 G7|C6 C7|Fmaj7|Dm7 G7|C6 G7|C69'},
  fate:     {bpm:120, key:0, mi:1, long:1, c:'Cm6|G7|Cm6|Fm7 G7|Cm7|G7|Fm6 G7|G7|Cm7|Bb7|Abmaj7|G7|Cm6|G7|Bb7 Ebmaj7|Fm7 Bb7|Cm6|G7|G7|Cm6',
    n:'R:.5 G4:.5 G4:.5 G4:.5 D#4:2 R:.5 F4:.5 F4:.5 F4:.5 D4:2 R:.5 G4:.5 G4:.5 G4:.5 D#4:2 R:.5 G#4:.5 G#4:.5 G#4:.5 G4:2 R:.5 D#5:.5 D#5:.5 D#5:.5 C5:2 R:.5 G4:.5 G4:.5 G4:.5 D4:2 R:.5 G#4:.5 G#4:.5 G#4:.5 G4:2 R:.5 F5:.5 F5:.5 F5:.5 D5:2 R:.5 G5:.5 G5:.5 F5:.5 D#5:2 R:.5 F5:.5 F5:.5 D#5:.5 D5:2 R:.5 D#5:.5 D#5:.5 D5:.5 C5:2 R:.5 D5:.5 D5:.5 C5:.5 B4:2 R:.5 G4:.5 G4:.5 G4:.5 D#4:2 R:.5 F4:.5 F4:.5 F4:.5 D4:2 R:.5 A#4:.5 A#4:.5 A#4:.5 D#5:2 F5:2 A#4:2 R:.5 G4:.5 G4:.5 G4:.5 D#4:2 R:.5 F4:.5 F4:.5 F4:.5 D4:2 R:.5 G4:.5 G4:.5 G4:.5 B3:2 C4:4'},
  elise:    {bpm:126, key:9, mi:1, bt:3, pk:1, long:1, c:'E7|E7|Am7|E7|Am6|E7|Am7|Dm7 E7|Am6 E7|E7|Am7|E7|Am6|E7|Am7|Dm7 E7|Am7 G7|Cmaj7|G7|Am7|E7|Emaj7|E7|Am7|E7|Am6|E7|Am7|Dm7 E7|Am6',
    n:'E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 G#4:.5 B4:.5 C5:1 R:.5 E4:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 C5:.5 B4:.5 A4:2 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 G#4:.5 B4:.5 C5:1 R:.5 E4:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 C5:.5 B4:.5 A4:1 R:.5 B4:.5 C5:.5 D5:.5 E5:1.5 G4:.5 F5:.5 E5:.5 D5:1.5 F4:.5 E5:.5 D5:.5 C5:1.5 E4:.5 D5:.5 C5:.5 B4:.5 R:.5 E4:.5 E5:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 G#4:.5 B4:.5 C5:1 R:.5 E4:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1 R:.5 C4:.5 E4:.5 A4:.5 B4:1 R:.5 E4:.5 C5:.5 B4:.5 A4:3'},

  minuet:   {bpm:120, key:7, bt:3, long:1, c:'G6|Em7|Cmaj7|G6|Am7|Gmaj7|D7|Am7 D7|G6|Gmaj7 Em7|Am7 D7|G6 Em7|Am7|Gmaj7|Am7 D7|G6|Gmaj7|Am7 D7|Em7|A7|A7|Em7 A7|D6 A7|Dmaj7|Gmaj7|Cmaj7|Am7|D7|G6|Am7|G6 D7|G69',
    n:'D5:1 G4:.5 A4:.5 B4:.5 C5:.5 D5:1 G4:1 G4:1 E5:1 C5:.5 D5:.5 E5:.5 F#5:.5 G5:1 G4:1 G4:1 C5:1 D5:.5 C5:.5 B4:.5 A4:.5 B4:1 C5:.5 B4:.5 A4:.5 G4:.5 F#4:1 G4:.5 A4:.5 B4:.5 G4:.5 A4:3 D5:1 G4:.5 A4:.5 B4:.5 C5:.5 D5:1 G4:1 G4:1 E5:1 C5:.5 D5:.5 E5:.5 F#5:.5 G5:1 G4:1 G4:1 C5:1 D5:.5 C5:.5 B4:.5 A4:.5 B4:1 C5:.5 B4:.5 A4:.5 G4:.5 A4:1 B4:.5 A4:.5 G4:.5 F#4:.5 G4:3 B5:1 G5:.5 A5:.5 B5:.5 G5:.5 A5:1 D5:.5 E5:.5 F#5:.5 D5:.5 G5:1 E5:.5 F#5:.5 G5:.5 D5:.5 C#5:1 B4:.5 C#5:.5 A4:1 A4:.5 B4:.5 C#5:.5 D5:.5 E5:.5 F#5:.5 G5:1 F#5:1 E5:1 F#5:1 A4:1 C#5:1 D5:3 D5:1 G4:.5 F#4:.5 G4:1 E5:1 G4:.5 F#4:.5 G4:1 D5:1 C5:1 B4:1 A4:.5 G4:.5 F#4:.5 G4:.5 A4:1 D4:.5 E4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 C5:1 B4:1 A4:1 B4:.5 D5:.5 G4:1 F#4:1 G4:3'},
  xm_jingle:{bpm:116, key:7, c:'G6|Gmaj7 A7|Am7 D7|Am7 D7|G6|G6 E7|Am7 D7|D7 G6|G6 Em7|Am7 D7|C6 Bm7|Am7 D7|G6 Em7|Am7 D7|C6 E7|D7 G69'},
  xm_silent:{bpm:72, key:10, bt:3, soft:1, c:'Bb6|Gm7|Cm7 F7|Bb6|Ebmaj7|Bb6 G7|Cm7|Bb6 G7|Cm7 F7|Bb6 Gm7|Cm7 F7|Bb69'},
  xm_wish:  {bpm:116, key:9, bt:3, pk:3, c:'E7|Amaj7|Dmaj7|B7|E7|C#7|F#m7|Bm7 E7|A6|F#m7|C#m7|F#m7 B7|E7|Amaj7 F#7|Bm7 E7|Dmaj7 E7|A69'}
};
const NOTE_PC = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const NN = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
/* コード名 → {r:根音, iv:[構成音], g:[左手の 根音なし ボイシング（3・7・9／13）]} */
function chordOf(nm){
  const m = /^([A-G](?:#|b)?)(.*)$/.exec(nm); if(!m) return null;
  const r = NOTE_PC[m[1]], q = m[2];
  let iv, g;
  if(q === 'maj7')      { iv = [0,4,7,11]; g = [4,11,14,19]; }
  else if(q === '6')    { iv = [0,4,7,9];  g = [4,9,14,19]; }
  else if(q === '69')   { iv = [0,4,7,9,14]; g = [4,9,14,19]; }
  else if(q === 'm7')   { iv = [0,3,7,10]; g = [3,10,14,19]; }
  else if(q === 'm6')   { iv = [0,3,7,9];  g = [3,9,14,19]; }
  else if(q === '7')    { iv = [0,4,7,10]; g = [4,10,14,21]; }
  else if(q === '7sus') { iv = [0,5,7,10]; g = [5,10,14,19]; }
  else if(q === 'm7b5') { iv = [0,3,6,10]; g = [3,10,13,18]; }
  else if(q === 'dim7') { iv = [0,3,6,9];  g = [3,9,12,18]; }
  else if(q === 'm')    { iv = [0,3,7,10]; g = [3,10,14,19]; }
  else                  { iv = [0,4,7,9];  g = [4,9,14,19]; }   // 三和音 → 6th
  return {nm, r, iv, g, pcs:iv.map(x => (r + x) % 12)};
}
const nearPc = (pc, lo) => { let m = lo - (((lo % 12) + 12) % 12) + pc; if(m < lo) m += 12; return m; };
let BT = 4;   // いま アレンジ中の 曲の 1小節の 拍
/* 小節ごとの コード表（拍 → コード） */
function chartOf(chStr, beats, bt){
  bt = bt || BT;
  const bars = chStr.split('|').map(x => x.trim().split(/\s+/).map(chordOf)), seg = [];
  bars.forEach((cs, i) => { const per = bt / cs.length; cs.forEach((c, j) => seg.push({b:i * bt + j * per, d:per, c})); });
  const at = b => { let s = seg[0]; for(const x of seg){ if(x.b <= b + 1e-6) s = x; else break; } return s.c; };
  return {seg, at, bars:bars.length};
}
/* スウィング：8分の ウラ（.5）を うしろに ずらす */
const swingB = (b, r) => { const i = Math.floor(b + 1e-6), f = b - i; return Math.abs(f - .5) < 1e-6 ? i + r : b; };

/* ---------- 強弱 ---------- */
/* 拍の 強さ：1拍目 ＞ （4拍子なら 3拍目）＞ ほかの 拍 ＞ ウラ */
const metric = b => { const f = b - Math.floor(b + 1e-6), bb = ((Math.floor(b + 1e-6) % BT) + BT) % BT;
  if(f > .01) return .78; return bb === 0 ? 1 : (BT === 4 && bb === 2) ? .9 : .84; };
/* フレーズの 山：2小節の なかで ふくらんで しぼむ */
const arc = (b, len) => { const p = ((b % len) + len) % len / len; return .86 + .24 * Math.sin(Math.PI * Math.min(1, p * 1.15)); };
let RND = Math.random;
const jit = a => 1 + (RND() * 2 - 1) * a;

/* ---------- パートを つくる ---------- */
/* 右手：ブロックコード（メロディー＋下に コードの 音）。メロディーを 強く、内声は よわく */
function rhBlock(E, notes, chart, off, inst, vol, opt){
  const hi = Math.max(...notes.map(n => n.m)), lo = Math.min(...notes.map(n => n.m)), rng = Math.max(1, hi - lo);
  notes.forEach(n => {
    const c = chart.at(n.b), top = n.m + opt.up;
    const dv = vol * metric(n.b) * arc(n.b, 2 * BT) * (.9 + .2 * (n.m - lo) / rng) * jit(.07) * (n.d >= 2 ? 1.05 : 1);
    E(off + n.b, inst, top, Math.max(.35, n.d * .92), dv);
    if(!c || n.d < .5 - 1e-6 || opt.single) return;
    const cand = [];
    for(let m = top - 1; m >= top - 11; m--) if(c.pcs.includes(((m % 12) + 12) % 12) && top - m >= 2) cand.push(m);
    const pick = cand.filter((m, i) => i === 0 || cand[i - 1] - m >= 2).slice(0, n.d >= 1 ? 3 : 2);
    pick.forEach((m, k) => E(off + n.b + (k + 1) * .006, inst, m, Math.max(.3, n.d * .85), dv * (k === 0 ? .48 : .38) * jit(.08)));
  });
}
/* 左手：低い ルート（ベースの かわり）＋ ジャズ ボイシング
   4拍子＝チャールストン（1拍目＋2拍目ウラ）／3拍子＝ジャズワルツ（1拍目＋2拍目ウラ）。ウラは よわく */
function lhComp(E, chart, off, beats, vol, alt, root){
  chart.seg.forEach(s => {
    if(s.b >= beats) return;
    const c = s.c; if(!c) return;
    let base = nearPc((c.r + c.g[0]) % 12, 52); if(base > 60) base -= 12;
    const v = c.g.map(x => base + (x - c.g[0]));
    const voi = [...new Set(v.map(m => m > 70 ? m - 12 : m))].sort((x, y) => x - y);
    let hits;
    if(s.d >= 4) hits = alt ? [[0,1.4],[2.5,.6],[3.5,.4]] : [[0,1.3],[1.5,.5]];
    else if(s.d >= 3) hits = alt ? [[0,1.1],[1.5,.5],[2.5,.35]] : [[0,1.1],[1.5,.5]];
    else hits = [[0, s.d > 1 ? .9 : .5], ...(s.d >= 2 ? [[1.5, .4]] : [])];
    hits.forEach(([h, d], k) => { const dv = vol * (k ? .62 : 1) * jit(.1);
      voi.forEach((m, j) => E(off + s.b + h + j * .008, 'pf', m, d, dv * (j === voi.length - 1 ? 1.08 : .92))); });
    if(root !== false){ let r = nearPc(c.r, 36); if(r > 45) r -= 12; E(off + s.b, 'pf', r, Math.min(s.d, 2) * .9, vol * 1.05 * jit(.06)); }
  });
}
/* ドラム：4拍子＝ライドの スウィング＋ハイハット 2・4／3拍子＝ジャズワルツ（ライド 1・2・3、2拍目ウラ） */
function drums(E, off, beats, vol, soft){
  for(let b = 0; b < beats; b++){
    const bb = b % BT;
    if(BT === 3){
      E(off + b, 'dr', 'ride', 0, vol * (bb === 0 ? .5 : .4) * jit(.12));
      if(bb === 1) E(off + b + .5, 'dr', 'ride', 0, vol * .26 * jit(.15));
      if(bb !== 0){ E(off + b, 'dr', 'hhc', 0, vol * .36 * jit(.1)); E(off + b, 'dr', 'stick', 0, vol * (soft ? .08 : .13) * jit(.15)); }
      if(bb === 0) E(off + b, 'dr', 'kick', 0, vol * .15 * jit(.1));
    } else {
      E(off + b, 'dr', 'ride', 0, vol * (bb % 2 ? .55 : .42) * jit(.12));
      if(bb === 1 || bb === 3){ E(off + b + .5, 'dr', 'ride', 0, vol * .28 * jit(.15)); E(off + b, 'dr', 'hhc', 0, vol * .5 * jit(.1)); E(off + b, 'dr', 'stick', 0, vol * (soft ? .13 : .2) * jit(.15)); }
      if(bb === 0) E(off + b, 'dr', 'kick', 0, vol * .14 * jit(.1));
    }
    if(RND() < .12) E(off + b + .5, 'dr', 'snare', 0, vol * .06);   // ゴーストノート
  }
}
/* 2コーラス目：サックスの フェイク
   ・長い 音の あとの すきまは 音階に そって なめらかに（大きな 跳躍なし）
   ・すこし 下へ ふくらんで、次の 音の となりから そっと つなぐ／つなぎの 音は だんだん 弱く */
function saxFake(E, notes, chart, off, vol, key, mi){
  const SC = (mi ? [0,2,3,5,7,8,11] : [0,2,4,5,7,9,11]).map(x => (x + (key || 0)) % 12);
  const inSc = m => SC.includes(((m % 12) + 12) % 12);
  const snap = (p, c, strong) => {
    let best = null, bd = 99;
    for(let m = Math.floor(p) - 3; m <= Math.ceil(p) + 3; m++){
      if(!inSc(m) && !(c && c.pcs.includes(((m % 12) + 12) % 12))) continue;
      const d = Math.abs(m - p) - (strong && c && c.pcs.includes(((m % 12) + 12) % 12) ? .6 : 0);
      if(d < bd){ bd = d; best = m; } }
    return best;
  };
  const scNb = (g, dir) => { let m = g + dir, k = 0; while(!inSc(m) && k++ < 3) m += dir; return m; };
  notes.forEach((n, i) => {
    const nx = notes[i + 1], c = chart.at(n.b), dv = vol * metric(n.b) * arc(n.b, 2 * BT) * jit(.06);
    if(n.d >= 2 && c){
      E(off + n.b, 'sx', n.m, 1.15, dv * 1.06);
      const steps = Math.round((n.d - 1) * 2), goal = nx ? nx.m : n.m;
      const apr = goal > n.m + 2 ? scNb(goal, -1) : scNb(goal, +1);
      const dip = steps >= 4 ? 3 : steps >= 2 ? 1.5 : 0;
      let prev = n.m;
      for(let k = 0; k < steps; k++){
        const x = (k + 1) / steps, last = k === steps - 1;
        let m = last ? apr : snap(n.m + (apr - n.m) * x - dip * Math.sin(Math.PI * x), chart.at(n.b + 1 + k * .5), k % 2 === 0);
        if(!last && m === prev) m = snap(m + (apr < prev ? -1.2 : 1.2), null, false);
        if(Math.abs(m - prev) > 5) m = snap(prev + Math.sign(m - prev) * 3, null, false);
        E(off + n.b + 1 + k * .5, 'sx', m, last ? .55 : .45, vol * (k % 2 ? .58 : .7) * (1 - .35 * x) * jit(.06));
        prev = m;
      }
    } else if(n.d >= 1 && nx && Math.abs(nx.m - n.m) >= 3 && RND() < .4){
      E(off + n.b, 'sx', n.m, .45, dv); E(off + n.b + .5, 'sx', scNb(nx.m, nx.m > n.m ? -1 : 1), .4, dv * .55);
    } else E(off + n.b, 'sx', n.m, Math.max(.35, n.d * .9), dv);
  });
}

/* ---------- イントロ（5パターン・4小節。短調・3拍子にも 対応） ---------- */
const INTROS = {turn:{n:'ii–V の まわし'}, vamp:{n:'ゆらゆら ヴァンプ'}, solo:{n:'ピアノ ソロの アルペジオ'}, tail:{n:'さいごの フレーズから'}, drum:{n:'ドラムから'}};
const INTRO_ORDER = ['turn','vamp','solo','tail','drum'];
const SONG_INTRO = {kira:'solo', kaeru:'vamp', mary:'turn', chou:'solo', london:'drum', acha:'vamp', hotcross:'tail', frere:'tail', oldmac:'drum',
  row:'vamp', joy:'turn', saints:'drum', happy:'solo', fate:'drum', elise:'solo', minuet:'turn', xm_jingle:'drum', xm_silent:'solo', xm_wish:'vamp'};
function introChart(type, key, mi){
  const k = n => NN[(key + n) % 12], I = mi ? k(0) + 'm6' : k(0) + '6', iiV = mi ? `${k(2)}m7b5 ${k(7)}7` : `${k(2)}m7 ${k(7)}7`;
  if(type === 'turn') return mi ? `${iiV}|${I} ${k(5)}m7|${iiV}|${iiV}` : `${k(4)}m7 ${k(9)}7|${iiV}|${k(4)}m7 ${k(9)}7|${iiV}`;
  if(type === 'vamp') return mi ? `${I}|${k(5)}m7|${I}|${iiV}` : `${I}|${k(9)}m7|${I}|${iiV}`;
  if(type === 'solo') return mi ? `${I}|${k(8)}maj7|${iiV}|${k(2)}m7b5 ${k(7)}7sus` : `${k(0)}maj7|${k(5)}maj7|${k(4)}m7 ${k(9)}7|${k(2)}m7 ${k(7)}7sus`;
  return `${I}|${I}|${iiV}|${iiV}`;
}
function makeIntro(type, E, key, mi, notes, chart, up, P, total){
  const L = 4 * BT;
  if(type === 'turn'){
    const c = chartOf(introChart('turn', key, mi), L);
    if(P.comp) lhComp(E, c, 0, L, .15, true); drums(E, 0, L, .42, true);
    c.seg.forEach((s, i) => { if(P.mel && i % 2 === 1){ const x = s.c; [x.g[2], x.g[3]].forEach((g, j) => E(s.b + Math.min(1.5, s.d - .5) * .5 + j * .5, 'pf', nearPc((x.r + g) % 12, 72), .45, (.16 + i * .012) * jit(.1))); } });
    return {len:L, chart:c};
  }
  if(type === 'vamp'){
    const c = chartOf(introChart('vamp', key, mi), L);
    if(P.comp) lhComp(E, c, 0, L, .14, false); drums(E, 0, L, .36, true);
    if(P.mel) c.seg.forEach((s, i) => { const x = s.c; [s.d - 1.5, s.d - .5].forEach((h, j) => { if(h < .5) return;
      const tops = x.g.map(g => nearPc((x.r + g) % 12, 70)).sort((a, b) => a - b).slice(-3);
      tops.forEach((m, q) => E(s.b + h, 'pf', m, .35, (.11 + i * .02) * (q === 2 ? 1.1 : .8) * (j ? .8 : 1) * jit(.1))); }); });
    return {len:L, chart:c};
  }
  if(type === 'solo'){
    const c = chartOf(introChart('solo', key, mi), L);
    c.seg.forEach((s, i) => { const x = s.c, r = nearPc(x.r, 36);
      const arp = [r, r + 7, ...x.g.map(g => r + 12 + g)].filter(m => m < 86);
      const step = s.d >= 3 ? .5 : .25;
      arp.forEach((m, j) => { if(j * step < s.d) E(s.b + j * step, 'pf', m, s.d - j * step + .2, (.1 + .1 * j / arp.length) * (.85 + i * .05) * jit(.08)); });
      if(P.mel && s.d >= 3) E(s.b + s.d - 1.5, 'pf', nearPc((x.r + x.g[3]) % 12, 76), 1.4, .17 * jit(.1)); });
    return {len:L, chart:c};
  }
  if(type === 'tail'){   // 曲の さいご 2小節を ピアノだけで → ii–V
    const from = total - 2 * BT;
    const tail = notes.filter(n => n.b >= from).map(n => ({m:n.m, b:n.b - from, d:n.d}));
    const k = n => NN[(key + n) % 12], iiV = mi ? `${k(2)}m7b5 ${k(7)}7` : `${k(2)}m7 ${k(7)}7`;
    const barStr = i => chart.seg.filter(s => s.b >= from + i * BT - 1e-6 && s.b < from + (i + 1) * BT - 1e-6).map(s => s.c.nm).join(' ') || (mi ? k(0) + 'm6' : k(0) + '6');
    const c = chartOf(`${barStr(0)}|${barStr(1)}|${iiV}|${iiV}`, L);
    if(P.mel) rhBlock(E, tail, c, 0, 'pf', .2, {up});
    if(P.comp) lhComp(E, c, 0, L, .12, false);
    drums(E, 2 * BT, 2 * BT, .36, true);
    return {len:L, chart:c};
  }
  /* drum：ブラシだけ 2小節 → ii–V に ピアノが 入る */
  const c = chartOf(introChart('drum', key, mi), L);
  drums(E, 0, L, .46, true); E(2 * BT - 2, 'dr', 'snare', 0, .1); E(2 * BT - 1, 'dr', 'snare', 0, .14); E(2 * BT - .5, 'dr', 'toml', 0, .16);
  const k = n => NN[(key + n) % 12], iiV = mi ? `${k(2)}m7b5 ${k(7)}7` : `${k(2)}m7 ${k(7)}7`;
  if(P.comp) lhComp(E, chartOf(`${iiV}|${iiV}`, 2 * BT), 2 * BT, 2 * BT, .15, true);
  return {len:L, chart:c};
}

/* ---------- かえるのうた：輪唱（2小節ずつ おくれて パート2・3） ---------- */
function roundSection(E, notes, up, P){
  const len = Math.ceil(Math.max(...notes.map(n => n.b + n.d)) / 4) * 4, total = len + 16;
  const bars = total / 4, cs = [];
  for(let i = 0; i < bars; i++) cs.push(i === bars - 1 ? 'C69' : i % 4 === 3 ? 'Dm7 G7' : i % 2 ? 'Am7' : 'Cmaj7');
  const c = chartOf(cs.join('|'), total);
  const VO = [{inst:'pf', d:0, v:.3, up, n:'パート1（ピアノ）'}, {inst:'vb', d:8, v:.2, up, n:'パート2（ビブラフォン）'}, {inst:'sx', d:16, v:.22, up:0, n:'パート3（サックス）'}];
  VO.forEach((vo, i) => { if(!P.mel) return;
    const sh = notes.map(n => ({m:n.m, b:n.b + vo.d, d:n.d}));
    rhBlock(E, sh, c, 0, vo.inst, vo.v, {up:vo.up, single:i > 0}); });
  if(P.comp) lhComp(E, c, 0, total, .12, false);
  drums(E, 0, total, .44, true);
  return {len:total, chart:c, voices:VO.map(vo => ({n:vo.n, b:vo.d, e:vo.d + len}))};
}
/* ---------- 2コーラス目 → 3コーラス目の 余韻 ---------- */
function tailOver(E, notes, chart, len, P, round){
  if(!P.mel) return;
  const last = notes[notes.length - 1], c = chart.at(len - 1);
  if(!round) E(last.b, 'sx', last.m, last.d + 2.5, .14);
  if(c){ const vo = c.pcs.map(pc => nearPc(pc, 62)).sort((a, b) => a - b);
    vo.forEach((m, j) => E(len - 2 + j * .04, 'vb', m, 4.5, .06 * (j === vo.length - 1 ? 1.2 : .9))); }
  E(len - .5, 'dr', 'ride', 0, .1); E(len, 'dr', 'crash', 0, .08);
}

/* ---------- 曲 ぜんたい ---------- */
let PLAYN = {};
function jazzArrange(s, o){
  o = Object.assign({form:'full', swing:.62, intro:'auto', parts:{mel:1, comp:1, drum:1, sax:1}}, o || {});
  const R = JAZZ_REHARM[s.id]; BT = R.bt || 4;
  const pk = R.pk || 0, sh = (BT - pk % BT) % BT;   // 弱起：0小節目の おわりに くるように ずらす
  /* long：参考音源に あわせて ながく した メロディー（リズムゲームの 曲は そのまま） */
  const src = R.n ? (R._s || (R._s = {n:R.n})) : s;
  const notes = parseSong(src).map(n => ({m:n.m, b:n.b + sh, d:n.d}));
  const beats = Math.ceil((src.beats + sh) / BT - 1e-6) * BT;
  const key = R.key || 0, mi = !!R.mi, chart = chartOf(R.c, beats), ev = [], P = o.parts;
  let off = 0, sd = 1;
  const E = (b, k, m, d, v) => { if(k === 'dr' && !P.drum) return; ev.push({b:off + b, k, m, d, v:v * sd * (R.soft && k === 'dr' ? .7 : 1)}); };
  const lo = Math.min(...notes.map(n => n.m)), hi = Math.max(...notes.map(n => n.m)), up = lo < 70 && hi + 12 <= 90 ? 12 : 0;
  const secs = []; let t = 0;
  const sec = (n, len, ch, extra) => { secs.push(Object.assign({b:t, n, len, chart:ch}, extra || {})); };
  if(o.form === 'full'){
    const n = PLAYN[s.id] = (PLAYN[s.id] || 0) + 1;
    const type = o.intro === 'auto' ? INTRO_ORDER[(INTRO_ORDER.indexOf(SONG_INTRO[s.id]) + n - 1) % 5] : o.intro;
    off = t; sd = .8;
    const I = makeIntro(type, E, key, mi, notes, chart, up, P, beats);
    sec('イントロ：' + INTROS[type].n, I.len, I.chart); t += I.len;
  }
  const choruses = o.form === 'full' ? 3 : 1, SD = [1, 1.14, .96];
  for(let ch = 0; ch < choruses; ch++){
    off = t; sd = SD[ch];
    if(ch === 1 && s.id === 'kaeru'){
      const Rd = roundSection(E, notes, up, P);
      E(0, 'dr', 'crash', 0, .14); tailOver(E, notes, Rd.chart, Rd.len, P, true);
      sec('輪唱（3パート）', Rd.len, Rd.chart, {voices:Rd.voices}); t += Rd.len; continue;
    }
    const sax = ch === 1 && P.sax;
    if(P.mel){
      if(sax){ saxFake(E, notes, chart, 0, .26, key, mi); rhBlock(E, notes.filter(n => n.d >= 2), chart, 0, 'vb', .07, {up}); }
      else rhBlock(E, notes, chart, 0, 'pf', .3, {up});
    }
    if(P.comp) lhComp(E, chart, 0, beats, sax ? .16 : .13, sax);
    drums(E, 0, beats, ch === 1 ? .56 : .46, ch !== 1);
    if(ch === 1){ E(0, 'dr', 'crash', 0, .16); tailOver(E, notes, chart, beats, P); }
    sec(ch === 1 ? (sax ? '2コーラス目（サックス）' : '2コーラス目') : ch === 2 ? 'テーマ（もういちど）' : 'テーマ', beats, chart);
    t += beats;
  }
  if(o.form === 'full'){
    off = t; sd = .9;
    const tn = NN[key] + (mi ? 'm6' : '69'); sec('エンディング', 2 * BT, chartOf(tn + '|' + tn, 2 * BT));
    const b0 = 60 + key - (key > 5 ? 12 : 0);
    E(0, 'pf', b0 - 24, 6, .3);
    (mi ? [0,3,7,9,14] : [0,4,7,9,14,16]).forEach((x, i) => E(i * .12, 'pf', b0 + x, 6, .14 + i * .015));
    E(0, 'vb', b0 + (mi ? 26 : 26), 6, .07); E(0, 'dr', 'crash', 0, .2);
    E(6, 'dr', 'ride', 0, .0001); t += Math.max(8, 2 * BT + 2);
  }
  ev.forEach(e => { e.b = swingB(e.b, o.swing); });
  return {t:s.t, bpm:R.bpm, beats:t, ev:ev.sort((a, b) => a.b - b.b), secs, chStr:R.c, bt:BT};
}


return {has:id => !!JAZZ_REHARM[id], arrange:jazzArrange};
})();
function trackOf(key){
  if(key.startsWith('song:')){
    const id = key.slice(5), s = songList().find(x => x.id === id); if(!s) return trackOf('full');
    if(JZ.has(id)){ try{ const T = JZ.arrange(s, {}); return {t:s.t, sub:'ジャズ アレンジ', bpm:T.bpm, beats:T.beats, ev:T.ev, jz:1, regen:() => JZ.arrange(s, {})}; }catch(e){ console.warn('jazz', e); } }
    const bpm = Math.max(72, Math.min(116, Math.round(s.bpm * .88)));
    return {t:s.t, sub:'ラウンジ風 アレンジ', bpm, beats:Math.ceil(s.beats) + 4, ev:songEv(s)};
  }
  const T = TRACKS[key] || TRACKS.quiet;
  let ev = barsToEv(T.bars, T.dk, T.up);
  if(T.up){   /* ★3：サビ（PART_C）だけ 半音 上げて もりあげる */
    const c0 = (INTRO.length + PART_A.length + PART_B.length) * 4, c1 = c0 + PART_C.length * 4;
    ev = ev.map(e => e.k !== 'dr' && e.b >= c0 && e.b < c1 ? Object.assign({}, e, {m:e.m + 1}) : e);
  }
  return {t:T.t, sub:T.sub, bpm:T.bpm, beats:T.bars.length * 4, ev:ev.sort((a, b) => a.b - b.b)};
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
  const st = Math.max(t, M.ac.currentTime + .01), rel = tr.jz && k === 'sx' ? .45 : (REL[k] ?? .5);
  if(k === 'dr'){ g.gain.value = vol; s.connect(g); g.connect(tr.g); s.start(st); return; }
  g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(vol, st + (ATK[k] || .008));
  g.gain.setValueAtTime(vol, st + dur); g.gain.exponentialRampToValueAtTime(.0001, st + dur + rel);
  if(tr.jz && (k === 'pf' || k === 'vb' || k === 'sx')){   /* ジャズ：強い 音ほど 明るい 音色 */
    const ref = k === 'sx' ? .26 : k === 'vb' ? .2 : .3, f = M.ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.value = 1400 + 11000 * Math.pow(Math.min(1.3, vol / ref), 1.6); f.Q.value = .5;
    s.connect(f); f.connect(g);
  } else s.connect(g);
  g.connect(tr.g); s.start(st); s.stop(st + dur + rel + .05);
}
function tick(){
  const tr = M.tr; if(!M.on || !tr) return;
  const spb = 60 / tr.bpm, end = M.ac.currentTime + 1.2;
  while(true){
    if(tr.i >= tr.ev.length){ tr.i = 0; tr.t0 += tr.beats * spb;
      if(tr.regen){ try{ const N = tr.regen(); tr.ev = N.ev; tr.beats = N.beats; }catch(e){} } }   /* ジャズ：くり返す たびに イントロを かえる */
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
function wantKey(){ if(!V) return 'quiet'; if(V.view === 'lounge') return V.req ? 'song:' + V.req : (lit() ? 'full3' : 'full'); if(V.view === 'deck') return 'deck'; return 'quiet'; }
function syncBgm(){ if(M.on && M.key !== wantKey()) bgmStart(wantKey()); }
document.addEventListener('visibilitychange', () => { if(!V) return; if(document.hidden) bgmStop(); else bgmStart(); });
/* まちの BGM は タワーの 中では ながさない */
try{ const W = window.__bgm643; if(W){ const t0 = W.target; W.target = () => document.querySelector('#lm.show') ? 0 : t0(); } }catch(e){}
/* リクエストできる 曲（おんがくの 曲） */
function songList(){ try{ return (window.__mu280 && window.__mu280.lounge) ? window.__mu280.lounge() : []; }catch(e){ return []; } }
/* v34.0：せってい（おうちの人）で「おんがく ぜんきょく クリア あつかい」… features.js の songRec も これを 見る */
window.__allSongs = () => !!(save && save.lm && save.lm.allSongs);
function allSongsSec(){
  const box = document.querySelector('#scr-settings .card'); if(!box) return;
  let sec = document.getElementById('lmAllSongs');
  if(!sec){
    sec = document.createElement('div'); sec.className = 'setSec'; sec.id = 'lmAllSongs';
    const ref = document.getElementById('adminRes'), after = ref && ref.closest('.setSec');
    if(after && after.nextSibling) box.insertBefore(sec, after.nextSibling); else box.appendChild(sec);
    sec.addEventListener('click', e => { const b = e.target.closest('[data-allsongs]'); if(!b) return;
      const d = save.lm || (save.lm = {}); d.allSongs = b.dataset.allsongs === '1'; persist(); allSongsSec();
      try{ toast(d.allSongs ? '🎵 おんがくの 曲を ぜんぶ クリア あつかいに したよ' : '🎵 クリア あつかいを もとに もどしたよ'); }catch(_){} });
  }
  const on = window.__allSongs();
  sec.innerHTML = `<h3>🎵 おんがく：ぜんきょく クリア あつかい（おとな用）</h3>
    <div class="seg"><button data-allsongs="0" class="${on ? '' : 'on'}">オフ</button><button data-allsongs="1" class="${on ? 'on' : ''}">オン</button></div>
    <p class="note">オンに すると、おんがく（リズムゲーム）の 曲が ぜんぶ ★1 クリア あつかいに なり、すべての 曲で あそべます。ランドマークタワーの ピアノ リクエストでも ぜんきょく えらべます。<br>オフに すると もとに もどります（ほんとうの きろく・★・ごほうびは かわりません）。</p>`;
}
try{ const _sh34 = show; show = function(name){ const o = _sh34.apply(this, arguments); if(name === 'settings') setTimeout(allSongsSec, 0); return o; }; }catch(e){}
setTimeout(allSongsSec, 1500);

/* ====================================================================
   画面
   ==================================================================== */
let V = null;   // {view:'top'|'lobby', key, elev}
function root(){
  let el = document.getElementById('lm');
  if(!el){ el = document.createElement('div'); el.id = 'lm'; document.body.appendChild(el); el.addEventListener('click', onClick);
    el.addEventListener('pointerdown', e => { if(e.target.closest('#lmHuntMap') && !e.target.closest('.lmHuntP')) huntMove(e); });
    el.addEventListener('pointermove', e => { if(e.target.closest('#lmHuntMap') && (e.buttons || e.pointerType === 'touch')) huntMove(e); });
    el.addEventListener('touchmove', e => { if(e.target.closest('#lmHuntMap')){ e.preventDefault(); huntMove(e); } }, {passive:false});
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
  return `<div class="lmStage t-${tod()} ${lit() ? 'lit s-' + SEASON() : ''}"><img class="lmBg" src="${esc(im('lm_tower'))}" alt="" draggable="false"><i class="lmSky"></i>${lit() ? '<i class="lmLit"></i><i class="lmBeam b1"></i><i class="lmBeam b2"></i>' : ''}
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
    <img class="lmPianist" src="${esc(im('lm_bird_piano'))}" alt="" data-l="req">${lit() ? `<img class="lmSax" src="${esc(im('lm_fox_sax'))}" alt="" data-l="req">` : ''}${notes}${ppl}</div>`;
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
  const got = L.filter(s => s.st >= 1), n = got.length, rs = s => JZ.has(s.id) ? 'ジャズ アレンジで ひくよ' : 'ラウンジ風に ひくよ';
  const rows = row('', '夜空のピアノ', 'ラウンジの テーマ（ラウンジ版）', true)
    + L.map(s => s.st >= 1 ? row(s.id, s.t, (s.all ? '' : '★' + s.st + '　') + rs(s), true) : row(s.id, '？？？', 'おんがくで ★1 いじょう クリアすると ひけるよ', false)).join('');
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
/* ====================================================================
   展望デッキ（★2）
   ==================================================================== */
const HUNT_SEC = 60, HUNT_Q = 3, SHOT_MAX = 3, WISH_MAX = 3, ALBUM_MAX = 60;
/* まちの 絵（lm_townview・2:3）の 上の 場所（％） */
const SPOTS = [
  {n:'えき',         x:22, y:22}, {n:'かんらんしゃ', x:66, y:15}, {n:'池の はし',   x:66, y:27},
  {n:'びょういん',   x:86, y:31}, {n:'がっこう',     x:47, y:41}, {n:'ゆうびんきょく', x:82, y:52},
  {n:'パンやさん',   x:17, y:58}, {n:'ふんすい',     x:51, y:67}, {n:'はなやさん', x:84, y:65},
  {n:'カフェ',       x:30, y:92}, {n:'としょかん',   x:72, y:89}, {n:'こうえんの ベンチ', x:38, y:71}
];
const isNight = () => tod() === 'ngt' || tod() === 'eve';
function vDeck(){
  const L = isL(), d = D();
  const stars = isNight() && d.wish < WISH_MAX ? '<div class="lmSkyFx" id="lmSkyFx"></div>' : '';
  const stage = `<div class="lmStage deck t-${tod()}"><img class="lmBg" src="${esc(im('lm_deck'))}" alt="" draggable="false"><i class="lmSky"></i>${stars}
    <img class="lmDeckBird" src="${esc(im('lm_bird_scope'))}" alt="" data-l="hunt"></div>`;
  const huntLeft = d.hunt ? 0 : 1, shotLeft = SHOT_MAX - d.shot, wishLeft = WISH_MAX - d.wish;
  const say = !d.hunt ? '双眼鏡で まちを のぞいて、住民を さがしてみませんか？'
    : isNight() ? (wishLeft > 0 ? '夜空を 見ていてね。流れ星が 来たら すぐ タッチ！' : 'きょうは たくさん ねがいごとが できましたね。')
    : '夜（ゆうがた〜あさ）に 来ると、流れ星が 見られるかも しれませんよ。';
  const card = (ic, t, sub, l, on, cls = '') => `<button class="lmDkCard ${on ? 'on' : 'off'} ${cls}" data-l="${l}">${ico(ic)}<span><b>${t}</b><small>${sub}</small></span></button>`;
  const info = `<div class="lmInfo"><div class="lmInfoHd">${ico('lm_bird_scope', 'lmInfoBird')}<p id="lmSay">${say}</p></div>
    <div class="lmDkCards">
      ${card('ic_lm_scope', '双眼鏡で まちさがし', huntLeft ? `${HUNT_SEC}びょうで ${HUNT_Q}もん・1日1かい` : 'きょうは おしまい（また あした）', 'hunt', huntLeft)}
      ${card('ic_lm_camera', '夜景フォト', `パシャ！ きょう あと ${Math.max(0, shotLeft)}まい`, 'shoot', shotLeft > 0)}
      ${card('ic_lm_album', 'アルバム', `${d.album.length}まい あつめたよ`, 'album', true)}
      ${card('lm_shootstar', '流れ星', isNight() ? `ねがいごと あと ${Math.max(0, wishLeft)}かい` : '夜だけ 見られるよ', 'wishInfo', isNight() && wishLeft > 0, 'star')}
    </div>
    <div class="lmBtns"><button class="lmB" data-l="music">${ico('ic_lm_music')}<span>${M.on ? 'BGM オン' : 'BGM オフ'}</span></button>
      <button class="lmB" data-l="elev">${ico('ic_lm_elev')}<span>エレベーター</span></button></div></div>`;
  return bar('展望デッキ', true) + `<div class="lmBody ${L ? 'lobL' : 'lobP'} dck">${stage}${info}</div>`;
}
/* ---------- 流れ星 ---------- */
let starT = 0;
function starLoop(){
  clearTimeout(starT);
  if(!V || V.view !== 'deck' || !isNight() || D().wish >= WISH_MAX) return;
  starT = setTimeout(() => {
    const fx = document.getElementById('lmSkyFx'); if(!fx || V.huntOn || V.wishOn) return starLoop();
    if(Math.random() < .6){
      const b = document.createElement('button'); b.className = 'lmStarFall'; b.dataset.l = 'wish';
      b.style.left = (40 + Math.random() * 45) + '%'; b.style.top = (4 + Math.random() * 22) + '%';
      b.innerHTML = `<img src="${esc(im('lm_shootstar'))}" alt="流れ星">`;
      fx.appendChild(b); setTimeout(() => b.remove(), 3200);
    }
    starLoop();
  }, 5000 + Math.random() * 7000);
}
async function wish(){
  const d = D(); if(d.wish >= WISH_MAX) return;
  document.querySelectorAll('.lmStarFall').forEach(e => e.remove());
  d.wish++; V.wishOn = true; const pt = 30 + Math.round(Math.random() * 7) * 10;
  givePts(pt, '展望デッキで 流れ星に ねがいごと'); persist();
  try{ sound('fan'); confetti(1200); }catch(e){}
  const W = ['あした いい てんきに なりますように','みんなが なかよく くらせますように','テストで 100てん とれますように','まちが もっと すてきに なりますように','おいしい パンが たべられますように'];
  await dialog(`<div class="lmWishDlg"><img src="${esc(im('lm_bird_wish'))}" alt=""><h2 class="dlgT">流れ星に ねがいごと</h2>
    <p class="dlgP">「${esc(pick(W))}」<br><span class="coin sm">P</span> <b>+${pt}</b></p><small>きょう あと ${WISH_MAX - d.wish}かい</small></div>`, [{label:'かなうと いいな', cls:'gold', v:1}], 'gold');
  V.wishOn = false; render(); starLoop();
}
/* ---------- 夜景フォト・アルバム ---------- */
const TOD_N = {mor:'あさ', day:'ひる', eve:'ゆうがた', ngt:'よる'};
function photoHTML(p, big){
  const pos = `${p.px}% ${p.py}%`;
  return `<span class="lmPhoto ${big ? 'big' : ''}"><img class="lmPolF" src="${esc(im('lm_polaroid'))}" alt=""><span class="lmPhIn t-${p.t}" style="background-image:url('${esc(im(p.v === 'town' ? 'lm_townview' : 'lm_deck'))}');background-position:${pos};background-size:${p.z}% auto">${p.s ? `<img class="lmPhStar" src="${esc(im('lm_shootstar'))}" alt="">` : ''}</span>
    <small>${esc(p.d)}　${TOD_N[p.t] || ''}</small></span>`;
}
async function shoot(){
  const d = D(); if(d.shot >= SHOT_MAX){ toast('きょうの フォトは おしまい。また あした！'); return; }
  const t = tod(), v = Math.random() < .35 ? 'town' : 'deck';
  const p = {at:now(), d:dayKey().slice(5).replace('-', '/'), t, v, px:Math.round(v === 'town' ? Math.random() * 100 : 20 + Math.random() * 60), py:Math.round(v === 'town' ? Math.random() * 100 : 30 + Math.random() * 40), z:v === 'town' ? 260 : 200, s:isNight() && Math.random() < .3};
  d.shot++; d.album.unshift(p); if(d.album.length > ALBUM_MAX) d.album.length = ALBUM_MAX; persist();
  const el = document.getElementById('lm'); if(el){ el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  try{ sound('ok'); }catch(e){}
  await dialog(`<div class="lmShotDlg">${photoHTML(p, true)}<h2 class="dlgT">パシャ！</h2><p class="dlgP">アルバムに 入れたよ（${d.album.length}まい）<br><small>きょう あと ${SHOT_MAX - d.shot}まい</small></p></div>`, [{label:'すてき！', cls:'gold', v:1}], 'gold');
  render();
}
function vAlbum(){
  const A = D().album;
  return `<div class="lmOv" data-l="ovx"><div class="lmElev lmAlb"><div class="lmElHd">${ico('ic_lm_album', 'lmElIc')}<b>夜景アルバム</b><button class="lmX" data-l="ovx" aria-label="とじる">✕</button></div>
    ${A.length ? `<div class="lmAlbGrid">${A.map(p => photoHTML(p)).join('')}</div>` : `<div class="lmAlbEmpty">${ico('lm_bird_cam')}<p>まだ しゃしんが ないよ。<br>「夜景フォト」で パシャ！</p></div>`}
    <p class="lmNote">あさ・ひる・ゆうがた・よるで 色が かわるよ。夜は 流れ星が うつることも！（ブティックで 限定品と こうかん できるように なる予定）</p></div></div>`;
}
/* ---------- 双眼鏡で まちさがし ---------- */
function huntStart(){
  const d = D(); if(d.hunt){ toast('まちさがしは 1日1かい。また あした！'); return; }
  const rs = nonHuman(); if(rs.length < 2){ toast('住民が 2人いじょう いると あそべるよ'); return; }
  const qs = [];
  const sp = SPOTS.slice().sort(() => Math.random() - .5);
  for(let i = 0; i < HUNT_Q; i++){
    const who = rs.slice().sort(() => Math.random() - .5).slice(0, Math.min(5, rs.length));
    const places = sp.slice().sort(() => Math.random() - .5).slice(0, who.length);
    qs.push({tg:0, ppl:who.map((r, j) => ({id:r.id, x:places[j].x, y:places[j].y, n:places[j].n}))});
  }
  V.hunt = {qs, i:0, ok:0, t0:now(), lx:50, ly:50, done:false}; V.huntOn = true;
  try{ sound('tap'); }catch(e){} render(); huntTick();
}
let huntTimer = 0;
function huntTick(){
  clearInterval(huntTimer);
  huntTimer = setInterval(() => {
    const H = V && V.hunt; if(!H || H.done){ clearInterval(huntTimer); return; }
    const left = Math.max(0, HUNT_SEC - (now() - H.t0) / 1000);
    const b = document.querySelector('.lmHuntTime b'), i = document.querySelector('.lmHuntTime i');
    if(b) b.textContent = Math.ceil(left); if(i) i.style.width = (left / HUNT_SEC * 100) + '%';
    if(left <= 0) huntEnd();
  }, 250);
}
function vHunt(){
  const H = V.hunt; if(!H) return '';
  if(H.done) return '';
  const Q = H.qs[H.i], tg = Q.ppl[Q.tg], r = save.town.res.find(x => x.id === tg.id) || {};
  const ppl = Q.ppl.map((p, j) => { const rr = save.town.res.find(x => x.id === p.id); return rr ? `<button class="lmHuntP" data-l="hp:${j}" style="left:${p.x}%;top:${p.y}%">${resPic(rr)}</button>` : ''; }).join('');
  return `<div class="lmOv lmHuntOv"><div class="lmHunt">
    <div class="lmHuntHd">${ico('ic_lm_scope', 'lmElIc')}<div class="lmHuntQ"><small>もんだい ${H.i + 1} / ${HUNT_Q}</small><b>「${esc(tg.n)}」の ちかくに いる <em>${esc(r.name || '')}</em> を さがせ！</b></div>
      <span class="lmHuntWho">${r.id ? resPic(r) : ''}</span></div>
    <div class="lmHuntTime"><i></i><b>${HUNT_SEC}</b></div>
    <div class="lmHuntMap" id="lmHuntMap" style="--x:${H.lx}%;--y:${H.ly}%"><img src="${esc(im('lm_townview'))}" alt="" draggable="false">${ppl}<i class="lmLens"></i></div>
    <p class="lmNote">ゆびで うごかして 双眼鏡で のぞいてね。見つけたら タッチ！</p>
    <button class="lmB wide" data-l="huntx">やめる</button></div></div>`;
}
function huntMove(e){
  const H = V && V.hunt; if(!H || H.done) return;
  const m = document.getElementById('lmHuntMap'); if(!m) return;
  const r = m.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
  H.lx = Math.max(0, Math.min(100, (p.clientX - r.left) / r.width * 100)); H.ly = Math.max(0, Math.min(100, (p.clientY - r.top) / r.height * 100));
  m.style.setProperty('--x', H.lx + '%'); m.style.setProperty('--y', H.ly + '%');
}
function inLens(px, py){
  const m = document.getElementById('lmHuntMap'); if(!m) return true;
  const r = m.getBoundingClientRect(), H = V.hunt, R = Math.min(r.width, r.height) * .2;
  const dx = (px - H.lx) / 100 * r.width, dy = (py - H.ly) / 100 * r.height;
  return Math.hypot(dx, dy) <= R * 1.1;
}
function huntPick(j){
  const H = V.hunt; if(!H || H.done) return; const Q = H.qs[H.i], p = Q.ppl[j];
  if(!inLens(p.x, p.y)){ toast('双眼鏡で のぞいてから タッチしてね'); return; }
  if(j === Q.tg){ H.ok++; try{ sound('ok'); }catch(e){} toast('みつけた！');
    const rr = save.town.res.find(x => x.id === p.id); if(rr) rr.fr = (rr.fr || 0) + 1;
    H.i++; if(H.i >= HUNT_Q) return huntEnd(); H.lx = 50; H.ly = 50; render(); }
  else { try{ sound('ng'); }catch(e){} const rr = save.town.res.find(x => x.id === p.id); toast(`それは ${rr ? rr.name : 'ちがう 住民'}だよ`); }
}
async function huntEnd(){
  const H = V.hunt; if(!H || H.done) return; H.done = true; clearInterval(huntTimer);
  const d = D(); d.hunt = 1; const all = H.ok >= HUNT_Q, pt = all ? 200 : H.ok * 50;
  if(pt) givePts(pt, '展望デッキで まちさがし');
  let ph = null;
  if(all){ ph = {at:now(), d:dayKey().slice(5).replace('-', '/'), t:tod(), v:'town', px:Math.round(Math.random() * 100), py:Math.round(Math.random() * 100), z:240, s:false};
    d.album.unshift(ph); if(d.album.length > ALBUM_MAX) d.album.length = ALBUM_MAX; }
  persist(); V.hunt = null; V.huntOn = false; render();
  try{ sound(all ? 'fan' : 'ok'); if(all) confetti(1600); }catch(e){}
  await dialog(`<div class="lmShotDlg">${ph ? photoHTML(ph, true) : ico('lm_bird_scope', 'lmHuntEndI')}<h2 class="dlgT">${all ? 'ぜんぶ みつけた！' : `${H.ok}にん みつけたよ`}</h2>
    <p class="dlgP">${pt ? `<span class="coin sm">P</span> <b>+${pt}</b>` : 'また あした ちょうせん してね'}${all ? '<br>夜景フォトも アルバムに 入ったよ' : ''}<br><small>見つけた 住民と なかよし度 +1</small></p></div>`, [{label:'OK', cls:'gold', v:1}], 'gold');
  render();
}
/* ====================================================================
   ブティック（★0）
   ==================================================================== */
function vBoutique(){
  const L = isL(), d = D(), tab = V.btab || 'fur';
  const stage = `<div class="lmStage bout ${lit() ? 'lit s-' + SEASON() : ''}"><img class="lmBg" src="${esc(im('lm_boutique'))}" alt="" draggable="false">
    <img class="btDisp" src="${esc(im('bt_moonlamp'))}" style="left:13.5%;top:33.6%;height:9%" alt="">
    <img class="btDisp" src="${esc(im('bt_nightart'))}" style="left:13.5%;top:48.2%;height:8%" alt="">
    <img class="btDisp" src="${esc(im('bt_snowglobe'))}" style="left:86.5%;top:33.6%;height:8%" alt="">
    <img class="btDisp" src="${esc(im('bt_towermini'))}" style="left:86.5%;top:48.2%;height:9%" alt="">
    <img class="btDisp" src="${esc(im('bt_minipiano'))}" style="left:50%;top:84%;height:15%" alt="">
    <img class="btDisp" src="${esc(im('bt_starsofa'))}" style="left:19%;top:80%;height:9%" alt="">
    <img class="btClerk" src="${esc(im('lm_fox_clerk'))}" alt="" data-l="clerk"></div>`;
  const tabs = [['fur', 'bt_starsofa', '家具'], ['wear', 'ic_lm_hanger', '衣装'], ['ex', 'ic_lm_ticket', 'こうかん']]
    .map(([k, ic, n]) => `<button class="btTab ${tab === k ? 'on' : ''}" data-l="btab:${k}">${ico(ic)}<span>${n}</span></button>`).join('');
  let list = '';
  if(tab === 'fur') list = BT_FUR.map(f => { const n = furN(f.id), can = save.points.bal >= f.p;
    return `<div class="btCard">${ico(f.art, 'btPic')}<div class="btTx"><b>${f.n}</b><small>${f.d}</small><small>もっている：${n}</small></div>
      <button class="lmB ${can ? 'gold' : ''} btBuy" data-l="buyf:${f.id}"><span class="coin sm">P</span><span>${nf(f.p)}</span></button></div>`; }).join('')
    + `<p class="lmNote">買った 家具は「わたしの家」の もようがえで おけるよ</p>`;
  if(tab === 'wear') list = BT_WEAR.map(w => { const have = d.wInv[w.id] || 0, on = Object.values(d.wear).filter(x => x === w.id).length, can = save.points.bal >= w.p;
    return `<div class="btCard">${ico(w.art, 'btPic')}<div class="btTx"><b>${w.n}</b><small>${w.d}</small><small>もっている：${have}　きている 住民：${on}</small></div>
      <div class="btBtns"><button class="lmB ${can ? 'gold' : ''} btBuy" data-l="buyw:${w.id}"><span class="coin sm">P</span><span>${nf(w.p)}</span></button>
      <button class="lmB pink btBuy" data-l="wearpick:${w.id}" ${have ? '' : 'disabled'}><span>着せる</span></button></div></div>`; }).join('')
    + `<button class="lmB wide" data-l="wearpick:">${ico('ic_lm_hanger')}<span>着ている 住民を 見る・ぬがせる</span></button>`;
  if(tab === 'ex') list = `<div class="btExHd">${ico('ic_lm_album', 'btExI')}<span><b>夜景フォト ${d.album.length}まい</b><small>${EX_N}まいで 限定品 1つと こうかん（ふるい しゃしんから つかうよ）</small></span></div>`
    + BT_EX.map(x => { const n = x.k === 'fur' ? furN(x.id) : decoN(x.id), can = d.album.length >= EX_N;
      return `<div class="btCard">${ico(x.art, 'btPic')}<div class="btTx"><b>${x.n}</b><small>${x.d}</small><small>もっている：${n}</small></div>
        <button class="lmB ${can ? 'gold' : ''} btBuy" data-l="exch:${x.id}" ${can ? '' : 'disabled'}>${ico('ic_lm_ticket')}<span>${EX_N}まい</span></button></div>`; }).join('')
    + (grade() < 2 ? '<p class="lmNote">夜景フォトは 展望デッキ（★2）で とれるよ</p>' : '');
  const say = tab === 'ex' ? 'すてきな 夜景フォトを 5まい あつめると、ここでしか 手に はいらない 品と こうかん できますよ。'
    : tab === 'wear' ? '住民の みなさんに 着せてあげると、まちでも その すがたで あるきますよ。' : 'いらっしゃいませ。タワーでしか 買えない 品を そろえております。';
  const info = `<div class="lmInfo btInfo"><div class="lmInfoHd">${ico('lm_fox_clerk', 'lmInfoBird')}<p id="lmSay">${say}</p></div>
    <div class="btTabs">${tabs}</div><div class="btList">${list}</div>
    <div class="lmBtns"><button class="lmB" data-l="music">${ico('ic_lm_music')}<span>${M.on ? 'BGM オン' : 'BGM オフ'}</span></button>
      <button class="lmB" data-l="elev">${ico('ic_lm_elev')}<span>エレベーター</span></button></div></div>`;
  return bar('ブティック', true) + `<div class="lmBody ${L ? 'lobL' : 'lobP'} btq">${stage}${info}</div>`;
}
function vWear(){
  const d = D(), w = V.wearOv, rs = nonHuman();
  const W = BT_WEAR.find(x => x.id === w);
  const rows = rs.map(r => { const cur = d.wear[r.id], cw = BT_WEAR.find(x => x.id === cur);
    return `<div class="btWr"><span class="btWrPic">${resPic(r)}</span><span class="btWrTx"><b>${esc(r.name)}</b><small>${cw ? cw.n + 'を きているよ' : 'なにも きていないよ'}</small></span>
      ${W && cur !== w ? `<button class="lmB gold" data-l="wearon:${r.id}" ${(d.wInv[w] || 0) ? '' : 'disabled'}><span>着せる</span></button>` : ''}
      ${cur ? `<button class="lmB" data-l="wearoff:${r.id}"><span>ぬぐ</span></button>` : ''}</div>`; }).join('');
  return `<div class="lmOv" data-l="ovx"><div class="lmElev btWear"><div class="lmElHd">${ico(W ? W.art : 'ic_lm_hanger', 'lmElIc')}<b>${W ? W.n + 'を 着せる' : '衣装'}</b><button class="lmX" data-l="ovx" aria-label="とじる">✕</button></div>
    <p class="lmNote">${W ? `のこり ${d.wInv[w] || 0}着。ぬぐと もちものに もどるよ` : '着ている 衣装を ぬがせると もちものに もどるよ'}</p>
    <div class="lmReqList">${rows || '<p class="lmNote">住民が まだ いないよ</p>'}</div></div></div>`;
}
function buyFur(id){
  const f = BT_FUR.find(x => x.id === id); if(!f) return;
  if(save.points.bal < f.p){ toast('ポイントが たりないよ'); return; }
  givePts(-f.p, `ブティックで ${f.n}`); const H = ensureHome(); H.inv[id] = (H.inv[id] || 0) + 1; persist();
  try{ sound('ok'); confetti(900); checkBadges(); }catch(e){}
  toast(`${f.n}を 買ったよ！「わたしの家」の もようがえで おけるよ`); render();
}
function buyWear(id){
  const w = BT_WEAR.find(x => x.id === id); if(!w) return; const d = D();
  if(save.points.bal < w.p){ toast('ポイントが たりないよ'); return; }
  givePts(-w.p, `ブティックで ${w.n}`); d.wInv[id] = (d.wInv[id] || 0) + 1; persist();
  try{ sound('ok'); }catch(e){} toast(`${w.n}を 買ったよ！「着せる」で 住民に 着せてね`); render();
}
function wearOn(rid){
  const d = D(), w = V.wearOv; if(!w || !(d.wInv[w] > 0)) return;
  const old = d.wear[rid]; if(old) d.wInv[old] = (d.wInv[old] || 0) + 1;
  d.wear[rid] = w; d.wInv[w]--; const r = save.town.res.find(x => x.id === rid); if(r) r.fr = (r.fr || 0) + 1; persist();
  try{ sound('fan'); }catch(e){} toast(`${r ? r.name : ''}が ${BT_WEAR.find(x => x.id === w).n}を 着たよ！（なかよし +1）`); render();
}
function wearOff(rid){
  const d = D(), old = d.wear[rid]; if(!old) return;
  delete d.wear[rid]; d.wInv[old] = (d.wInv[old] || 0) + 1; persist(); try{ sound('tap'); }catch(e){} render();
}
async function exch(id){
  const x = BT_EX.find(y => y.id === id), d = D(); if(!x) return;
  if(d.album.length < EX_N){ toast(`夜景フォトが ${EX_N}まい いるよ`); return; }
  d.album.splice(d.album.length - EX_N, EX_N); d.exN++;
  if(x.k === 'fur'){ const H = ensureHome(); H.inv[id] = (H.inv[id] || 0) + 1; }
  else { const t = save.town; t.inv[id] = (t.inv[id] || 0) + 1; try{ discover(id); }catch(e){} }
  persist(); try{ sound('fan'); confetti(1600); checkBadges(); }catch(e){}
  await dialog(`<div class="lmGiftDlg"><img src="${esc(im(x.art))}" alt=""><h2 class="dlgT">こうかん できたよ！</h2>
    <p class="dlgP">${x.n}<br><small>${x.k === 'fur' ? '「わたしの家」の もようがえで おけるよ' : 'まちの もようがえで おけるよ'}</small></p></div>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
  render();
}
/* ---------- まちの タワー：★3 の 夜は ライトアップ ---------- */
function townGlow(){
  try{
    if(typeof curScreen === 'undefined' || curScreen !== 'town' || !save.town) return;
    document.querySelectorAll('#townMap .lmTownLit').forEach(e => e.remove());
    if(!lit() || tod() === 'day' || tod() === 'mor') return;
    cellsOf().forEach(k => { const [x, y] = k.split(','); const c = document.querySelector(`#townMap .cell[data-x="${x}"][data-y="${y}"]`);
      if(c) c.insertAdjacentHTML('beforeend', `<i class="lmTownLit s-${SEASON()}"></i>`); });
  }catch(e){}
}
try{ const _rm = renderMap; renderMap = function(){ const o = _rm.apply(this, arguments); townGlow(); return o; }; }catch(e){}
setInterval(() => { if(!document.hidden) townGlow(); }, 60000);
/* ---------- エレベーター ---------- */
function vElev(){
  const g = grade(), cur = ['lobby', 'lounge', 'deck', 'boutique'].includes(V.view) ? V.view : '';
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
  el.innerHTML = (V.view === 'lobby' ? vLobby() : V.view === 'lounge' ? vLounge() : V.view === 'deck' ? vDeck() : V.view === 'boutique' ? vBoutique() : vTop()) + (V.elev ? vElev() : V.reqOv ? vReq() : V.mk ? vMk() : V.hunt ? vHunt() : V.alb ? vAlbum() : V.wearOv != null ? vWear() : '');
  if(V.view === 'deck' && !V.hunt) starLoop();
  if(V.hunt){ const m = document.getElementById('lmHuntMap'); if(m){ const fit = () => { const r = m.getBoundingClientRect(); m.style.setProperty('--r', Math.round(Math.min(r.width, r.height) * .2) + 'px'); }; fit(); requestAnimationFrame(fit); } }
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
function close(){ bgmStop(); clearTimeout(starT); clearInterval(huntTimer); const el = root(); el.className = ''; el.innerHTML = ''; V = null; document.body.classList.remove('lmOpen'); try{ renderCurrent(); }catch(e){} }

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
  if(id === 'deck'){ try{ sound('tap'); }catch(e){} V.elev = false; go('deck'); }
  if(id === 'boutique'){ try{ sound('tap'); }catch(e){} V.elev = false; go('boutique'); }
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
    case 'ovx': V.elev = false; V.reqOv = false; V.alb = false; V.wearOv = null; return render();
    case 'btab': V.btab = v; try{ sound('tap'); }catch(e){} return render();
    case 'buyf': return buyFur(v);
    case 'buyw': return buyWear(v);
    case 'wearpick': V.wearOv = v || ''; try{ sound('tap'); }catch(e){} return render();
    case 'wearon': return wearOn(v);
    case 'wearoff': return wearOff(v);
    case 'exch': return exch(v);
    case 'clerk': { const s = document.getElementById('lmSay'); if(s){ s.textContent = pick(['いらっしゃいませ。ごゆっくり ご覧ください。','夜景フォトの こうかんも うけたまわっております。','タキシード、とても よく おにあいですよ。']); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } try{ sound('tap'); }catch(e){} return; }
    case 'go': V.elev = false; return floor(v);
    case 'grade': { const k = V.key; close(); try{ openBuilding(k); }catch(e){} return; }
    case 'music': { const d = D(); if(M.on){ d.mute = true; bgmStop(); } else { d.mute = false; persist(); if(save.settings && save.settings.bgm === false){ toast('せっていで BGM が オフに なっているよ'); return; } bgmStart(); } persist(); if(V && V.view === 'lounge') render(); return; }
    case 'camera': if(grade() < 2){ toast('夜景フォトは 展望デッキ（★2）で とれるよ'); return; } V.elev = false; go('deck'); return shoot();
    case 'shoot': return shoot();
    case 'album': V.alb = true; try{ sound('tap'); }catch(e){} return render();
    case 'hunt': return huntStart();
    case 'hp': return huntPick(+v);
    case 'huntx': if(V.hunt){ return huntEnd(); } return;
    case 'wish': return wish();
    case 'wishInfo': toast(isNight() ? '夜空を 見ていてね。流れ星が 来たら タッチ！' : '流れ星は 夜（ゆうがた〜あさ）だけ 見られるよ'); return;
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
try{ const _ie = itemEffect; itemEffect = function(it){ const s = _ie.apply(this, arguments); return it && it.id === ID ? `${s}${s ? '・' : ''}🗼 タッチで タワーの 中へ（ロビー・ブティック・★1 スカイラウンジ・★2 展望デッキ・★3 ライトアップ）` : s; }; }catch(e){}

window.__lm30 = {open, close, grade, bgmStart, bgmStop, FLOORS, mkQuiz, trackOf, shoot, huntStart, BT_FUR, BT_WEAR, BT_EX};
})();
