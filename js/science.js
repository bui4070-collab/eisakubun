/* =====================================================================
   まなびタウン v6.70：科学館（かがくかん）
   ・町の「かがくかん」をタッチ → 町の前面に科学館が開く（スマホ縦／iPad横）
   ・6つのゾーン（ばけがく／でんき／くるま／ひかり・おと／うちゅう／いのち）
   ・実験（炎色反応・車の組立・エンジン・回路 ほか）／もんだい ★1〜★6／はっけんカード／ごほうび
   ・ごほうび：まちの しせつ・のりもの（花火台・ロケット台・はつでんしょ・にじ・ふんすい・ながれぼし台・じぶんの車）
              わたしの家の 家具（上から見た絵つき）
   ・画像はすべて ./assets/images/science/
   ※ features.js の あとに 読みこむ（index.html に <script src="./js/science.js"> を 追加）
   ===================================================================== */
(function(){
'use strict';
const VER = '6.72.0', IMG = './assets/images/science/';
const X = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pick = a => a[Math.random() * a.length | 0];
const shuf = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const today = () => (typeof dayKey === 'function' ? dayKey() : new Date().toISOString().slice(0, 10));
const snd = t => { try{ sound(t); }catch(e){} };
const IC = n => `${IMG}${n}.webp`;
const art = k => { try{ return artSrc(k) || ''; }catch(e){ return ''; } };
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v * 10) / 10;
const KJ = /[\u4E00-\u9FFF々〆]/;
const isTab = () => innerWidth >= 900 && innerWidth >= innerHeight;

/* ---------- 数値（すべて 暫定。調整は ここだけ） ---------- */
const CFG = {
  tixExp:2, tixQ:1,                                     /* チケット：実験 2まい／もんだい1セット(5もん) 1まい */
  expPt:{1:40, 2:70, 3:110, 4:160, 5:240, 6:360},       /* 実験1かい */
  qPt:{1:6, 2:10, 3:16, 4:24, 5:36, 6:60},              /* もんだい1もん */
  firstX:2, dailyX:2,                                   /* はじめて クリア ×2／きょうの ふしぎ ×2 */
  perfect:0.3, combo:6, comboMax:30, lvFirst:50,        /* ぜんもん正解 +30%／2もん連続ごと +6／ゾーン×レベル はじめて +50 */
  clearRate:0.6,                                        /* クリア（6わり いじょう正解） */
  qTime:{1:0, 2:0, 3:90, 4:90, 5:120, 6:120},           /* 制限時間（秒）0＝なし */
  unlock5:3, unlock6:1,                                 /* ★5：★4を 3かい クリア／★6：★5を 1かい クリア */
  fireBase:30, rocketBase:50, meteorBase:15, meteorDay:3
};
const RANKS = [
  {n:'かがく見習い',   m:0,     b:0,   tix:12, c:['#CD7F32', '#8A4B12'], open:'ようこそ！ はじめての 実験に ちょうせん'},
  {n:'かがく研究員',   m:1500,  b:.10, tix:14, c:['#B7BEC8', '#6B7480'], open:'ポイント +10%・チケット 14まい'},
  {n:'かがく博士',     m:6000,  b:.20, tix:16, c:['#F2B33D', '#B5701C'], open:'ポイント +20%・チケット 16まい'},
  {n:'大博士',         m:15000, b:.30, tix:18, c:['#7FD0E6', '#2C8FD0'], open:'ポイント +30%・チケット 18まい'},
  {n:'ノーベル級',     m:40000, b:.40, tix:20, c:['#C58CF0', '#7445C0'], open:'ポイント +40%・チケット 20まい。金の博士ぞうが もらえる'}
];
const LVS = [
  {n:1, name:'ひよこ',       age:'小1〜2',            c:'#8ED081'},
  {n:2, name:'みならい',     age:'小3〜4',            c:'#5BC0EB'},
  {n:3, name:'けんきゅういん', age:'小5〜6',          c:'#F2A33A'},
  {n:4, name:'はかせ',       age:'中学',              c:'#F0709A'},
  {n:5, name:'大博士',       age:'高校〜大学入門',     c:'#9B6CE0'},
  {n:6, name:'ノーベル級',   age:'大人でも なやむ！', c:'#2B2B33'}
];

/* ---------- ゾーン ---------- */
const ZONES = [
  {id:'chem',  n:'ばけがくラボ',       sh:'ばけがく',  c:'#F0653C', bg:'zone_chem',  fx:'58% 46%', ch:'res_hedgehog', chn:'ハリー博士',  ic:'card_chem_burner',
   say:['炎の 色って ふしぎだよね！', '混ぜると 色が かわるよ。', '実験は 安全が いちばん！', 'ビーカーの 目もりは 真横から 読もう。']},
  {id:'elec',  n:'でんき・じしゃく',   sh:'でんき',    c:'#E7A800', bg:'zone_elec',  fx:'46% 50%', ch:'res_squirrel', chn:'ビリーくん',  ic:'card_elec_bulb',
   say:['ピカッと ひからせよう！', '電気の 通り道は ひとつの 輪だよ。', '磁石の 力は 目に 見えないんだ。', '電池を つなぐと パワーが 上がるよ。']},
  {id:'car',   n:'くるまこうぼう',     sh:'くるま',    c:'#3C82E0', bg:'zone_car',   fx:'34% 60%', ch:'res_raccoon',  chn:'ギアくん',    ic:'card_car_gears',
   say:['自分の 車を つくろう！', 'ギアは 歯の 数が だいじ。', 'エンジンは 空気と 燃料で うごくよ。', '部品は 順番どおりに はめよう。']},
  {id:'light', n:'ひかり・おと',       sh:'ひかり',    c:'#9B6CE0', bg:'zone_light', fx:'50% 55%', ch:'res_otter',    chn:'ナミちゃん',  ic:'card_light_prism',
   say:['にじの ひみつを さぐろう！', '音は 空気の ふるえなんだよ。', '光は まっすぐ すすむよ。', '高い音は ふるえる 回数が 多いんだ。']},
  {id:'space', n:'うちゅう・ちきゅう', sh:'うちゅう',  c:'#3A4FB5', bg:'zone_space', fx:'38% 50%', ch:'res_penguin',  chn:'スターくん',  ic:'card_space_telescope',
   say:['ほしぞらへ 出発！', '地球は 1日で 1回転 するよ。', '地震の 波は 2しゅるい あるんだ。', 'ロケットは 重いほど 燃料が いるよ。']},
  {id:'life',  n:'いのち・からだ',     sh:'いのち',    c:'#3FA55A', bg:'zone_life',  fx:'40% 55%', ch:'res_rabbit',   chn:'ミクロちゃん', ic:'card_life_microscope',
   say:['ミクロの せかいを のぞこう！', '植物は 光で 養分を つくるよ。', '細胞は 生き物の 小さな 部屋。', 'ピントは ゆっくり あわせてね。']}
];
const ZN = id => ZONES.find(z => z.id === id);

/* ---------- 実験（impl＝あそべる／のこりは じゅんびちゅう） ---------- */
const EXPS = [
  {id:'flame',   z:'chem',  n:'ほのおの 色あて',      d:'炎色反応。炎の 色から 金属を 見やぶろう',            st:[2, 5], ic:'card_chem_burner', impl:1},
  {id:'balloon', z:'chem',  n:'もこもこ ふうせん',     d:'重曹と クエン酸で 風船を ふくらませよう',            st:[2, 4], ic:'card_chem_balloon', impl:1},
  {id:'indic',   z:'chem',  n:'色が かわる 水',        d:'酸性・アルカリ性。指示薬の 色の ひみつ',            st:[1, 4], ic:'card_chem_litmus'},
  {id:'crystal', z:'chem',  n:'けっしょうを そだてる', d:'とけた ものの ゆくえ。結晶を そだてよう',            st:[3, 5], ic:'card_chem_crystal'},
  {id:'circuit', z:'elec',  n:'でんきの かいろ',       d:'直列・並列。つなぎかたで 明るさが かわる',          st:[1, 5], ic:'card_elec_bulb', impl:1},
  {id:'emag',    z:'elec',  n:'でんじしゃくを つくろう', d:'コイルの 巻き数と 電池で 磁力が かわる',            st:[2, 4], ic:'card_elec_coil', impl:1},
  {id:'gener',   z:'elec',  n:'てまわし はつでん',     d:'ハンドルを 回して 電気を つくろう',                st:[1, 3], ic:'card_elec_generator', impl:1},
  {id:'plasma',  z:'elec',  n:'プラズマボール',        d:'静電気と 放電',                                    st:[1, 3], ic:'card_elec_plasma'},
  {id:'assemble',z:'car',   n:'車を くみたてよう',     d:'順番どおりに 部品を はめて 自分の 車を つくる',    st:[2, 6], ic:'card_car_wheel', impl:1},
  {id:'engine',  z:'car',   n:'エンジンの ひみつ',     d:'4ストロークを 動かして しくみを 学ぼう',            st:[3, 6], ic:'card_car_engine', impl:1},
  {id:'gear',    z:'car',   n:'ギアめいじん',          d:'歯の 数を えらんで 回転を かえよう',                st:[2, 5], ic:'card_car_gears', impl:1},
  {id:'evgas',   z:'car',   n:'でんき車 vs ガソリン車', d:'エネルギーの 使われかたを くらべよう',             st:[4, 6], ic:'card_car_plug'},
  {id:'prism',   z:'light', n:'プリズムで にじ',       d:'光の 分散と 色の まざりかた',                      st:[1, 4], ic:'card_light_prism', impl:1},
  {id:'lens',    z:'light', n:'レンズの ふしぎ',       d:'焦点と 像の できかた',                              st:[3, 5], ic:'card_light_lens'},
  {id:'wave',    z:'light', n:'おとの なみ',           d:'波の 形と 音の 高さ・大きさ',                      st:[2, 5], ic:'card_light_fork', impl:1},
  {id:'mirror',  z:'light', n:'かがみ めいろ',         d:'光の 反射を 使って ゴールへ',                      st:[2, 6], ic:'card_light_mirror'},
  {id:'rocket',  z:'space', n:'ロケット はっしゃ',     d:'燃料と 重さで 速さが きまる',                      st:[2, 6], ic:'card_space_rocket', impl:1},
  {id:'planet',  z:'space', n:'プラネタリウム',        d:'星座・月の みちかけ・季節',                        st:[1, 5], ic:'card_space_starchart'},
  {id:'quake',   z:'space', n:'じしん ハンター',       d:'P波と S波で しんげんまでの きょりを さがす',      st:[3, 6], ic:'card_space_seismo', impl:1},
  {id:'weather', z:'space', n:'てんきの ふしぎ',       d:'前線・雲・気圧',                                    st:[2, 5], ic:'card_space_earth'},
  {id:'micro',   z:'life',  n:'けんびきょうで のぞこう', d:'ピントを あわせて ミクロの 世界を 見つけよう',     st:[2, 5], ic:'card_life_microscope', impl:1},
  {id:'photo',   z:'life',  n:'こうごうせい たんけん', d:'光・水・二酸化炭素と 酸素の あわ',                  st:[3, 5], ic:'card_life_leaf', impl:1},
  {id:'gene',    z:'life',  n:'いでんの ふしぎ',       d:'メンデルの 法則と DNA',                            st:[3, 6], ic:'card_life_dna'},
  {id:'body',    z:'life',  n:'からだの しくみ',       d:'消化・循環・呼吸',                                  st:[1, 5], ic:'card_life_heart'}
];
const EX = id => EXPS.find(e => e.id === id);

/* ---------- はっけんカード（ゾーン12まい：最後の1まいは レア） ---------- */
const CARDS = {
  chem:[['burner','バーナー','ガスバーナーの 炎は、うすい 青い ところが いちばん 熱いよ。'],['tubes','しけんかん','しけんかんを 熱するときは、口を 人に 向けないでね。'],['crystal','けっしょう','とけた ものが ゆっくり 冷えると、大きな 結晶に なるよ。'],['molecule','ぶんしもけい','水の 分子は、酸素1つと 水素2つが くっついて できているよ。'],
        ['jars','ひょうほんびん','岩石や 鉱物を 集めて、名前を しらべるのが 鉱物ずかん。'],['flask','フラスコ','丸い 底の フラスコは、液体を 均一に 熱しやすいよ。'],['beaker','ビーカー','ビーカーの 目もりは おおよその 量。正確には 別の 器具を 使うよ。'],['mortar','にゅうばち','ごりごり すりつぶして、粉に する 道具だよ。'],
        ['litmus','リトマスし','青い 紙が 赤に なれば 酸性、赤い 紙が 青に なれば アルカリ性。'],['balloon','ふうせん じっけん','重曹と クエン酸が 反応すると 二酸化炭素が 出て、風船が ふくらむよ。'],['balance','てんびん','質量を くらべる 道具。月に 持っていっても 質量は かわらないよ。'],['gold','金の フラスコ','ばけがくラボ マスターの あかし。かがやく ふしぎな 液体が 入っているよ。']],
  elec:[['battery','でんち','かん電池を 直列に つなぐと、電圧が 足し算に なるよ。'],['switch','スイッチ','スイッチを 切ると、電気の 通り道が とぎれて 電流が 止まるよ。'],['bulb','でんきゅう','白熱電球は 電気の 多くを 熱に かえてしまうよ。'],['motor','モーター','電流と 磁石の 力で 回る しくみ。'],
        ['magnet','じしゃく','N極と S極は ひきあい、同じ 極どうしは しりぞけあうよ。'],['coil','コイル','導線を 巻いて 電流を 流すと、電磁石に なるよ。'],['plasma','プラズマボール','中の ガスが 電気で 光る 放電を 見せてくれるよ。'],['tesla','テスラコイル','とても 高い 電圧を つくる 装置。'],
        ['cable','でんせん','導線の 中の 金属は 電気を 通しやすい 銅が よく 使われるよ。'],['generator','てまわし はつでん機','回す 力を 電気に かえる。速く 回すほど 明るくなるよ。'],['turbine','風力はつでん','風の 力で 羽根が 回り、発電するよ。'],['gold','金の でんきゅう','でんき・じしゃくラボ マスターの あかし。ずっと 光りつづけるよ。']],
  car:[['engine','エンジン','ガソリンを 燃やして、ピストンを 動かす 機械だよ。'],['piston','ピストン','シリンダーの 中を 上下に 動いて、力を 回転に かえるよ。'],['gears','ギア','歯車の 歯の 数の 比で、回転の 速さと 力が かわるよ。'],['tire','タイヤ','みぞは 水を にがして、すべりにくく する はたらき。'],
        ['wheel','ハンドル','ハンドルを 切ると、前の タイヤの 向きが かわるよ。'],['plug','点火プラグ','火花を とばして、ガソリンに 火を つけるよ。'],['tools','こうぐ','ボルトと ナットは、ねじの 力で しっかり 部品を とめるよ。'],['jack','ジャッキ','小さな 力で 重い 車を 持ち上げられる 道具。'],
        ['oilcan','オイルさし','オイルは 部品の すれあいを へらして、熱も にがすよ。'],['helmet','ヘルメット','レースでは 頭を 守る ヘルメットが 必ず 必要だよ。'],['light','ヘッドライト','夜の 道を 照らして、まわりの 人にも 車を 知らせるよ。'],['gold','金の ギア','くるまこうぼう マスターの あかし。ぴかぴかで まわりつづけるよ。']],
  light:[['prism','プリズム','白い 光は、プリズムで 7色に 分かれるよ。'],['loupe','虫めがね','凸レンズを 使って、小さな ものを 大きく 見せるよ。'],['lens','凸レンズ','光を 1点に あつめる レンズ。あつめた 点が 焦点だよ。'],['glasses','メガネ','近視の 人は 光を ひろげる 凹レンズの メガネを 使うよ。'],
        ['mirror','かがみ','光は 鏡で はねかえる。入る 角と 出る 角は 同じ（反射の法則）。'],['rainbow','にじ','空気中の 水滴で 光が 分かれて、にじが 見えるよ。'],['fork','おんさ','たたくと 一定の 高さの 音を 出す。ラの 音は 440Hz。'],['guitar','ギター','弦が 短いほど 振動が 速く なって、高い 音に なるよ。'],
        ['speaker','スピーカー','紙の 振動板が 空気を ふるわせて、音を 出すよ。'],['mic','マイク','空気の ふるえを 電気の 信号に かえる 機械。'],['phones','ヘッドホン','耳の すぐ そばで 音を 出すから、小さな 音でも よく 聞こえる。'],['gold','金の すいしょう玉','ひかり・おとラボ マスターの あかし。のぞくと にじ色に ゆれるよ。']],
  space:[['telescope','望遠鏡','ガリレオは 望遠鏡で 木星の 衛星を 見つけたよ。'],['rocket','ロケット','ロケットは 燃料を 後ろへ 出した 反動で 前に すすむよ。'],['satellite','人工衛星','地球の まわりを 回りながら、天気や 通信に 役立っているよ。'],['moon','月','月は 地球の まわりを 約27日で 1周するよ。'],
        ['saturn','土星','土星の 輪は、氷の つぶが たくさん あつまって できているよ。'],['earth','地球','地球は 1日で 1回転（自転）して、1年で 太陽を 1周（公転）するよ。'],['starchart','星座早見盤','日づけと 時こくを あわせると、その 夜の 星空が わかるよ。'],['helmet','宇宙ヘルメット','宇宙服は 空気も 温度も 守ってくれる 小さな 宇宙船。'],
        ['meteor','隕石','宇宙から 落ちてきた 石。地上に 落ちる 前に ほとんど 燃えつきるよ。'],['shooting','ながれ星','小さな ちりが 空気と こすれて 光るよ。'],['seismo','地震計','地面の ゆれを 針で 記録する 装置。'],['gold','金の 星','うちゅう・ちきゅうドーム マスターの あかし。夜空で いちばん かがやくよ。']],
  life:[['microscope','けんびきょう','レンズを 2まい 使って、小さな ものを 大きく 見るよ。'],['cells','さいぼう','生き物の からだは、細胞という 小さな 部屋で できているよ。'],['dna','DNA','生き物の 設計図。らせん階段の ような 形を しているよ。'],['skeleton','ほねの もけい','おとなの ほねは 約206本。赤ちゃんは もっと 多いよ。'],
        ['heart','しんぞう','心臓は 1日に 約10万回 動いて、血液を 全身に おくるよ。'],['leaf','はっぱ','葉は 光を 受けて、二酸化炭素と 水から 養分と 酸素を つくるよ（光合成）。'],['sprout','はつが','種は 水・空気・ちょうどよい 温度で 芽を 出すよ。'],['plankton','ミジンコ','水の 中の 小さな 生き物。けんびきょうで 心臓が 動くのが 見えるよ。'],
        ['ammonite','アンモナイト','大昔の 海に いた 生き物の 化石。らせん形の からを 持っているよ。'],['brain','のう','脳は 体重の 約2%なのに、エネルギーは 約20%も 使うよ。'],['butterfly','こんちゅう ひょうほん','チョウは たまご→よう虫→さなぎ→成虫と 姿を かえるよ（完全変態）。'],['gold','金の アンモナイト','いのち・からだラボ マスターの あかし。ぴかぴかの 化石だよ。']]
};
const CARD_IDS = []; ZONES.forEach(z => CARDS[z.id].forEach((c, i) => CARD_IDS.push({id:`${z.id}_${c[0]}`, z:z.id, k:c[0], n:c[1], t:c[2], rare:i === 11, img:`card_${z.id}_${c[0]}`})));
const CD = id => CARD_IDS.find(c => c.id === id);

/* ---------- 炎色反応 ---------- */
const FLAME = [
  {k:'Li', n:'リチウム',       col:'#E5183A', cn:'赤',           mix:'#FF5A6E'},
  {k:'Na', n:'ナトリウム',     col:'#FFD21A', cn:'黄',           mix:'#FFE45C'},
  {k:'K',  n:'カリウム',       col:'#C79BFF', cn:'うすい 赤紫',   mix:'#D9B8FF'},
  {k:'Ca', n:'カルシウム',     col:'#FF8A1F', cn:'だいだい',      mix:'#FFA84D'},
  {k:'Sr', n:'ストロンチウム', col:'#D3002B', cn:'べに色（深い 赤）', mix:'#E8456B'},
  {k:'Ba', n:'バリウム',       col:'#B6E03A', cn:'黄緑',         mix:'#C9EE63'},
  {k:'Cu', n:'銅（どう）',     col:'#2FD9B5', cn:'青緑',         mix:'#5BE8C8'}
];

/* ---------- セーブ（save.town.sci） ---------- */
function SC(){
  try{ if(typeof ensureTown === 'function') ensureTown(); }catch(e){}
  const t = save.town || (save.town = {});
  const s = t.sci || (t.sci = {});
  s.hira = s.hira || 0; s.exp = s.exp || {}; s.zl = s.zl || {}; s.lvc = s.lvc || {}; s.qs = s.qs || {};
  s.cards = s.cards || {}; s.got = s.got || {}; s.flame = s.flame || {}; s.cars = s.cars || []; s.recent = s.recent || [];
  s.settings = s.settings || {ruby:'hard'}; s.n = s.n || {q:0, ok:0};
  if(!s.d || s.d.d !== today()) s.d = {d:today(), used:0, fu:{}, dayEx:false, fire:0, rocket:0, meteor:0};
  return s;
}
const rankNo = () => { const h = SC().hira; let n = 0; RANKS.forEach((r, i) => { if(h >= r.m) n = i; }); return n; };
const RK = () => RANKS[rankNo()];
const tixMax = () => RK().tix;
const tixLeft = () => Math.max(0, tixMax() - SC().d.used);
const expClear = (id, st) => { const e = SC().exp[id]; return e ? (st == null ? Object.values(e.cl || {}).reduce((a, b) => a + b, 0) : (e.cl || {})[st] || 0) : 0; };
const expMaxStar = id => { const e = SC().exp[id]; return e ? Math.max(0, ...Object.keys(e.cl || {}).filter(k => e.cl[k] > 0).map(Number)) : 0; };
const zoneExps = z => EXPS.filter(e => e.z === z);
const zoneImpl = z => zoneExps(z).filter(e => e.impl);
const zoneClears = z => zoneImpl(z).filter(e => expClear(e.id) > 0).length;
const zoneMaster = z => zoneImpl(z).length > 0 && zoneClears(z) >= zoneImpl(z).length;
const zoneStar = z => Math.max(0, ...zoneExps(z).map(e => expMaxStar(e.id)), ...[1, 2, 3, 4, 5, 6].filter(l => (SC().zl[`${z}:${l}`] || 0) > 0));
const cardsOf = z => CARD_IDS.filter(c => c.z === z);
const cardN = z => cardsOf(z).filter(c => SC().cards[c.id]).length;
const lvOpen = l => l <= 4 || (l === 5 && (SC().lvc[4] || 0) >= CFG.unlock5) || (l === 6 && (SC().lvc[5] || 0) >= CFG.unlock6);
const lvHint = l => l === 5 ? `★4を ${CFG.unlock5}かい クリアで かいほう（いま ${Math.min(CFG.unlock5, SC().lvc[4] || 0)}/${CFG.unlock5}）` : l === 6 ? '★5を クリアで かいほう' : '';
const dailyExp = () => { const L = EXPS.filter(e => e.impl); return L[(Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5)) % L.length]; };
function award(base, reason, o = {}){
  const s = SC(); let m = 1 + RK().b; if(o.x) m *= o.x;
  const pt = Math.round(base * m);
  try{ givePts(pt, reason); }catch(e){ try{ addPoints(pt, reason); }catch(e2){} }
  const before = rankNo(); s.hira += pt; persist();
  if(rankNo() > before) s.rankUp = rankNo();
  return pt;
}

/* =====================================================================
   ふりがな（科学館 用の 辞書つき）。学校・空港の 辞書も いっしょに 使う
   書きかた：{漢字|よみ} と 書くと その ぶぶんだけ ふりがなが つく
   ===================================================================== */
const SCI_RBD = {
"上下":"じょうげ","上下左右":"じょうげさゆう","上死点":"じょうしてん","下死点":"げしてん","下降気流":"かこうきりゅう","上昇気流":"じょうしょうきりゅう","一次消費者":"いちじしょうひしゃ","一気":"いっき","三原色":"さんげんしょく","両親":"りょうしん","両方":"りょうほう",
"主要動":"しゅようどう","乱層雲":"らんそううん","二重":"にじゅう","二酸化炭素":"にさんかたんそ","交換":"こうかん","交流":"こうりゅう","交配":"こうはい","人気":"にんき","任意":"にんい","低気圧":"ていきあつ","体内":"たいない","体温":"たいおん","何匹":"なんびき","何極":"なんきょく",
"作用":"さよう","作用点":"さようてん","保管":"ほかん","倍率":"ばいりつ","倒立":"とうりつ","偏光板":"へんこうばん","優性":"ゆうせい","充電":"じゅうでん","光電効果":"こうでんこうか","入射角":"にゅうしゃかく","全反射":"ぜんはんしゃ","全身":"ぜんしん","内部抵抗":"ないぶていこう","冷却":"れいきゃく","出題":"しゅつだい",
"分解者":"ぶんかいしゃ","分離":"ぶんり","初期微動":"しょきびどう","初期微動継続時間":"しょきびどうけいぞくじかん","制動距離":"せいどうきょり","制御":"せいぎょ","制限時間":"せいげんじかん","加法混色":"かほうこんしょく","加速":"かそく","加速度":"かそくど","劣性":"れっせい","動滑車":"どうかっしゃ","動脈":"どうみゃく",
"北極側":"ほっきょくがわ","南高北低":"なんこうほくてい","東高西低":"とうこうせいてい","西高東低":"せいこうとうてい","北高南低":"ほっこうなんてい","区別":"くべつ","半回転":"はんかいてん","半波長":"はんはちょう","単気筒":"たんきとう","反作用":"はんさよう","反動":"はんどう","反対側":"はんたいがわ","反射":"はんしゃ","反射光":"はんしゃこう","反射角":"はんしゃかく","反時計回り":"はんとけいまわり","反転":"はんてん",
"口金":"くちがね","各抵抗":"かくていこう","各枝":"かくえだ","合成抵抗":"ごうせいていこう","同圧":"どうあつ","同温":"どうおん","向心力":"こうしんりょく","吸気":"きゅうき","周波数":"しゅうはすう","器具":"きぐ","回巻き":"かいまき","回折":"かいせつ","回生":"かいせい","圧縮着火":"あっしゅくちゃっか",
"地上":"ちじょう","地下":"ちか","地図":"ちず","地域":"ちいき","地層":"ちそう","地軸":"ちじく","地震":"じしん","地震計":"じしんけい","地面":"じめん","均一":"きんいつ","垂直":"すいちょく","基質特異性":"きしつとくいせい","堆積岩":"たいせきがん","境目":"さかいめ","声帯":"せいたい","変圧器":"へんあつき","変成岩":"へんせいがん",
"夕方":"ゆうがた","夕焼け":"ゆうやけ","大学入門":"だいがくにゅうもん","太鼓":"たいこ","奥行き":"おくゆき","始点":"してん","子房":"しぼう","子葉":"しよう","完全変態":"かんぜんへんたい","定滑車":"ていかっしゃ","定規":"じょうぎ","実像":"じつぞう","実効値":"じっこうち","実験":"じっけん","家具":"かぐ","家庭用":"かていよう","導線":"どうせん","屈折率":"くっせつりつ","岩石":"がんせき","工事":"こうじ","干渉":"かんしょう","平方":"へいほう","幼虫":"ようちゅう","役立つ":"やくだつ",
"心室":"しんしつ","心房":"しんぼう","恐竜":"きょうりゅう","想像":"そうぞう","感知":"かんち","慣性":"かんせい","成虫":"せいちゅう","抵抗":"ていこう","拍動":"はくどう","振動":"しんどう","振動数":"しんどうすう","振動板":"しんどうばん","振幅":"しんぷく","排気":"はいき","放電":"ほうでん","救急車":"きゅうきゅうしゃ","散乱":"さんらん","斜面":"しゃめん","新月":"しんげつ","方位磁針":"ほういじしん",
"明星":"みょうじょう","明暗":"めいあん","星座":"せいざ","星座早見盤":"せいざそうけんばん","時刻":"じこく","時間内":"じかんない","暫定":"ざんてい","最適温度":"さいてきおんど","朔望月":"さくぼうげつ","木片":"もくへん","析出":"せきしゅつ","標識再捕獲法":"ひょうしきさいほかくほう","標高":"ひょうこう","次側":"じがわ","正極":"せいきょく","正立":"せいりつ","歯数":"はすう","歯車":"はぐるま","毎分":"まいふん","毎秒":"まいびょう",
"毛細血管":"もうさいけっかん","気圧":"きあつ","気圧配置":"きあつはいち","気泡":"きほう","気筒":"きとう","気管":"きかん","気象":"きしょう","水平":"すいへい","水滴":"すいてき","永久磁石":"えいきゅうじしゃく","波長":"はちょう","注意":"ちゅうい","津波":"つなみ","消費電力":"しょうひでんりょく","液胞":"えきほう","深成岩":"しんせいがん","減速":"げんそく","湿度":"しつど","満月":"まんげつ","準備":"じゅんび",
"火山岩":"かざんがん","火花":"ひばな","灰色":"はいいろ","炎色反応":"えんしょくはんのう","点火":"てんか","点火回数":"てんかかいすう","無色":"むしょく","無重力":"むじゅうりょく","無風":"むふう","焦点":"しょうてん","焦点距離":"しょうてんきょり","片方":"かたほう","特定":"とくてい","環境省":"かんきょうしょう","生産者":"せいさんしゃ","甲殻類":"こうかくるい","画面":"がめん",
"発射":"はっしゃ","発芽":"はつが","発電":"はつでん","発電所":"はつでんしょ","発電機":"はつでんき","白熱電球":"はくねつでんきゅう","皮膚":"ひふ","直列":"ちょくれつ","直後":"ちょくご","直線":"ちょくせん","直線形":"ちょくせんけい","直線電流":"ちょくせんでんりゅう","着火":"ちゃっか","石灰水":"せっかいすい","研究員":"けんきゅういん","磁気誘導":"じきゆうどう","磁界":"じかい","磁石":"じしゃく","示準化石":"しじゅんかせき","示相化石":"しそうかせき",
"科学館":"かがくかん","積乱雲":"せきらんうん","空気抵抗":"くうきていこう","第二宇宙速度":"だいにうちゅうそくど","等星":"とうせい","等級":"とうきゅう","糸電話":"いとでんわ","純系":"じゅんけい","給油":"きゅうゆ","絶縁体":"ぜつえんたい","総排気量":"そうはいきりょう","総量":"そうりょう","羽根":"はね","肉食動物":"にくしょくどうぶつ","脂肪":"しぼう","脱出":"だっしゅつ","臓器":"ぞうき","自動生成":"じどうせいせい","自動車":"じどうしゃ","自由落下":"じゆうらっか","興奮":"こうふん",
"花火":"はなび","花火台":"はなびだい","花火大会":"はなびたいかい","草食動物":"そうしょくどうぶつ","葉緑体":"ようりょくたい","蒸留水":"じょうりゅうすい","虚像":"きょぞう","血小板":"けっしょうばん","血液型":"けつえきがた","血管":"けっかん","行程":"こうてい","衝突":"しょうとつ","表面波":"ひょうめんは","装置":"そうち","見習い":"みならい","観察":"かんさつ","証拠":"しょうこ","豆電球":"まめでんきゅう","貯蔵":"ちょぞう","赤紫":"あかむらさき","起電力":"きでんりょく","近視":"きんし","通過":"つうか","道具":"どうぐ","遠心力":"えんしんりょく","適当":"てきとう","遺伝子型":"いでんしがた","部品":"ぶひん",
"重力加速度":"じゅうりょくかそくど","重心":"じゅうしん","重曹":"じゅうそう","鉄心":"てっしん","鉱物":"こうぶつ","銀鏡反応":"ぎんきょうはんのう","限定要因":"げんていよういん","陰極":"いんきょく","陽極":"ようきょく","階段":"かいだん","電力":"でんりょく","電力量":"でんりょくりょう","電圧":"でんあつ","電圧計":"でんあつけい","電場":"でんば","電極":"でんきょく","電気自動車":"でんきじどうしゃ","電流":"でんりゅう","電流計":"でんりゅうけい","電源":"でんげん","電源電圧":"でんげんでんあつ","電熱器":"でんねつき","電熱線":"でんねつせん","電球":"でんきゅう","電磁石":"でんじしゃく","電磁誘導":"でんじゆうどう",
"震度":"しんど","震源":"しんげん","青虫":"あおむし","静脈":"じょうみゃく","静電気":"せいでんき","非共有電子対":"ひきょうゆうでんしつい","音源":"おんげん","館内":"かんない","高気圧":"こうきあつ","麦芽糖":"ばくがとう",
"外部抵抗":"がいぶていこう","凸レンズ":"とつレンズ","凹レンズ":"おうレンズ","保存":"ほぞん","保つ":"たもつ","小さ":"ちいさ","平ら":"たいら","明る":"あかる","正し":"ただし","必ず":"かならず","必要":"ひつよう","感じ":"かんじ","最も":"もっとも","燃え":"もえ","燃や":"もや","等し":"ひとし","答え":"こたえ","終わ":"おわ","細か":"こまか","生ま":"うま","生き":"いき","代わり":"かわり",
"吸":"す","固":"かた","太":"ふと","弁":"べん","所":"ところ","極":"きょく","欠":"か","歯":"は","母":"はは","毎":"まい","気":"き","液":"えき","済":"す","父":"ちち","知":"し","管":"かん","級":"きゅう","臓":"ぞう","身":"み","通":"とお","過":"す","等":"ひと","細":"こま","終":"お","絵":"え","答":"こた","加":"くわ","勢":"いきお","匹":"ひき","印":"しるし","厚":"あつ","保":"たも","像":"ぞう","凸":"とつ","凹":"おう","下":"した","両":"りょう","低":"ひく","夕焼":"ゆうや","奥行":"おくゆ","役立":"やくだ","見習":"みなら",
"傷":"きず","傾":"かたむ","届":"とど","巻":"ま","弱":"よわ","底":"そこ","求":"もと","泳":"およ","浅":"あさ","深":"ふか","混":"ま","満":"み","落":"お","縮":"ちぢ","曲":"ま","暗":"くら","晴":"は","遠":"とお","進":"すす","短":"みじか","軽":"かる","伝":"つた","打":"う","折":"お","散":"ち","失":"うしな","姿":"すがた","息":"いき","声":"こえ","毛":"け","油":"あぶら","波":"なみ","夜":"よる","耳":"みみ","口":"くち","皮":"かわ","糸":"いと","粉":"こな","玉":"たま","枝":"えだ","根":"ね","葉":"は","芽":"め","虫":"むし","血":"ち","坂":"さか","机":"つくえ","鏡":"かがみ","針":"はり","岩":"いわ","酢":"す","塩":"しお","谷":"たに","紫":"むらさき","橙":"だいだい","藍":"あい","灰":"はい","炎":"ほのお","火":"ひ","点":"てん","板":"いた","弦":"げん","穴":"あな","端":"はし","輪":"わ","軸":"じく","壁":"かべ","型":"かた","式":"しき"
};
const RBD = Object.assign({}, (window.__sch66 && window.__sch66.RBD) || {}, (window.__ap662 && window.__ap662.RBD) || {}, SCI_RBD);
const RBMAX = Math.max(1, ...Object.keys(RBD).map(k => k.length));
const KANA_RX = /[\u3040-\u30FFー]/, RBC = {'人':'にん', '回':'かい', '枚':'まい', '問':'もん', '秒':'びょう', '度':'ど', '万':'まん', '日':'にち', '時':'じ', '年':'ねん', '個':'こ', '本':'ほん', '台':'だい', '匹':'ひき', '倍':'ばい', '歯':'し', '気':'き'};
const hardW = k => { try{ const w = window.__yu659; return w && w.hardWord ? w.hardWord(k) : true; }catch(e){ return true; } };
function rbMake(key, rd, mode){
  let base = key, r = rd, tail = '';
  while(base.length > 1 && KANA_RX.test(base[base.length - 1]) && r.length > 1 && r[r.length - 1] === base[base.length - 1]){ tail = base[base.length - 1] + tail; base = base.slice(0, -1); r = r.slice(0, -1); }
  if(mode === 'none' || (mode === 'hard' && !hardW(base))) return X(key);
  return `<ruby>${X(base)}<rt>${X(r)}</rt></ruby>${X(tail)}`;
}
function RB(text, modeIn){
  const mode = modeIn || (typeof SC === 'function' ? (SC().settings.ruby || 'hard') : 'hard'); text = String(text ?? '');
  return text.split(/(\{[^|{}]+\|[^{}]+\})/).map(seg => {
    const m = seg.match(/^\{([^|{}]+)\|([^{}]+)\}$/); if(m) return rbMake(m[1], m[2], mode);
    if(mode === 'none') return X(seg);
    let out = '', i = 0;
    while(i < seg.length){
      if(!KJ.test(seg[i])){ out += X(seg[i]); i++; continue; }
      if(i > 0 && /[0-9０-９]/.test(seg[i - 1])){
        const c = seg[i];
        if(c === '分'){ const rd = '134680'.includes(seg[i - 1]) ? 'ぷん' : 'ふん'; if(seg[i + 1] === '間'){ out += rbMake('分間', rd + 'かん', mode); i += 2; } else { out += rbMake('分', rd, mode); i++; } continue; }
        if(RBC[c] && !(RBD[seg.substr(i, 2)] !== undefined)){ out += rbMake(c, RBC[c], mode); i++; continue; }
      }
      let hit = null;
      for(let L = Math.min(RBMAX, seg.length - i); L >= 1; L--){ const k = seg.substr(i, L); if(RBD[k] !== undefined){ hit = k; break; } }
      if(hit){ out += rbMake(hit, RBD[hit], mode); i += hit.length; } else { out += X(seg[i]); i++; }
    }
    return out;
  }).join('');
}

/* ---------- ごほうび（まち） ---------- */
const CARS = [{k:'red', n:'あか'}, {k:'orange', n:'オレンジ'}, {k:'yellow', n:'きいろ'}, {k:'green', n:'みどり'}, {k:'blue', n:'あお'}, {k:'purple', n:'むらさき'}];
const allStar = n => ZONES.every(z => zoneStar(z.id) >= n);
const allStarN = n => ZONES.filter(z => zoneStar(z.id) >= n).length;
const TOWNR = [
  {id:'sci_fireworks', n:'花火大会の だい', img:'town_fireworks', condT:'ばけがくラボ マスター', cond:() => zoneMaster('chem'), prog:() => [zoneClears('chem'), zoneImpl('chem').length],
   eff:'タッチすると 花火を うちあげる（1日1かい）。見つけた 炎の 色で 花火が 上がるよ！住民の なかよしも アップ', o:{dev:40, pop:0.02}},
  {id:'sci_power', n:'はつでんしょ', img:'town_power', condT:'でんき・じしゃくラボ マスター', cond:() => zoneMaster('elec'), prog:() => [zoneClears('elec'), zoneImpl('elec').length],
   eff:'まちの うりあげ（収入）が ふえる 発電所', o:{dev:60, income:40}},
  {id:'sci_rainbow', n:'にじの アーチ', img:'town_rainbow', condT:'ひかり・おとラボ マスター', cond:() => zoneMaster('light'), prog:() => [zoneClears('light'), zoneImpl('light').length],
   eff:'まちの 人気が 上がる、にじ色の アーチ', o:{dev:30, pop:0.03}},
  {id:'sci_rocket', n:'ロケットはっしゃだい', img:'town_rocket', condT:'うちゅう・ちきゅう ★4 クリア', cond:() => zoneStar('space') >= 4, prog:() => [Math.min(4, zoneStar('space')), 4],
   eff:'タッチすると ロケットが 発射！（1日1かい ポイント）', o:{dev:50, pop:0.02}},
  {id:'sci_stardeck', n:'ながれぼしだい', img:'town_stardeck', condT:'うちゅう・ちきゅうドーム マスター', cond:() => zoneMaster('space'), prog:() => [zoneClears('space'), zoneImpl('space').length],
   eff:'タッチすると ながれ星を さがす ミニゲーム（1日3かい）', o:{dev:30, pop:0.02}},
  {id:'sci_fountain', n:'かがくの ふんすい', img:'town_fountain', condT:'ぜんぶの ゾーンで ★3 クリア', cond:() => allStar(3), prog:() => [allStarN(3), 6],
   eff:'まちの ランドマーク。人気が ぐんと 上がるよ', o:{dev:50, pop:0.04}}
];
/* ---------- ごほうび（わたしの家：上から見た絵つき） ---------- */
const HOMER = [
  {id:'sci_plasma',    n:'プラズマボール',       img:'fur_plasma',    top:'top_plasma',    sty:8,  condT:'でんき・じしゃくラボ 2つ クリア', cond:() => zoneClears('elec') >= 2, prog:() => [Math.min(2, zoneClears('elec')), 2], eff:'さわると 光が よってくる。部屋の すてき度が 上がる'},
  {id:'sci_desk',      n:'けんびきょうの つくえ', img:'fur_desk',      top:'top_desk',      sty:10, foot:[2, 1], condT:'いのち・からだラボ 2つ クリア', cond:() => zoneClears('life') >= 2, prog:() => [Math.min(2, zoneClears('life')), 2], eff:'けんびきょうコーナー。ちしきも ちょっと アップ', know:0.01},
  {id:'sci_starlight', n:'ほしぞら プロジェクター', img:'fur_starlight', top:'top_starlight', sty:9,  condT:'うちゅう・ちきゅうドーム 2つ クリア', cond:() => zoneClears('space') >= 2, prog:() => [Math.min(2, zoneClears('space')), 2], eff:'夜の 部屋に 星空を うつす ライト'},
  {id:'sci_rocketm',   n:'ロケットの もけい',     img:'fur_rocket',    top:'top_rocket',    sty:8,  condT:'うちゅう・ちきゅう ★3 クリア', cond:() => zoneStar('space') >= 3, prog:() => [Math.min(3, zoneStar('space')), 3], eff:'たなに かざれる ロケットの もけい'},
  {id:'sci_gears',     n:'ギアの かざり',         img:'fur_gears',     top:'top_gears',     sty:8,  condT:'くるまこうぼう ★3 クリア', cond:() => zoneStar('car') >= 3, prog:() => [Math.min(3, zoneStar('car')), 3], eff:'3つの ギアが かみあった かざり'},
  {id:'sci_prism',     n:'プリズムの ライト',     img:'fur_prism',     top:'top_prism',     sty:9,  condT:'ひかり・おとラボ 2つ クリア', cond:() => zoneClears('light') >= 2, prog:() => [Math.min(2, zoneClears('light')), 2], eff:'光を 7色に 分ける ふしぎな ライト'},
  {id:'sci_fossil',    n:'かせきの ケース',       img:'fur_fossil',    top:'top_fossil',    sty:12, foot:[2, 1], condT:'ぜんぶの ゾーンで ★2 クリア', cond:() => allStar(2), prog:() => [allStarN(2), 6], eff:'恐竜と アンモナイトの 化石を かざる ガラスケース', know:0.01},
  {id:'sci_owl',       n:'金の はかせぞう',       img:'fur_owl',       top:'top_owl',       sty:20, condT:'科学館ランク「ノーベル級」', cond:() => rankNo() >= 4, prog:() => [rankNo() + 1, 5], eff:'いちばんの ごほうび。ぴかぴかの フクロウ博士の ぞう', know:0.02}
];
const REWARDS = TOWNR.map(r => Object.assign({t:'town'}, r)).concat(HOMER.map(r => Object.assign({t:'home'}, r)));
const rwState = r => SC().got[r.id] ? 'got' : r.cond() ? 'ready' : (r.prog && r.prog()[0] > 0) ? 'prog' : 'xLk';

/* ---------- アイテム登録（まち／のりもの／家具） ---------- */
function register(){
  try{
    TOWNR.forEach(r => {
      DEFAULT_ART[r.id] = IC(r.img);
      if(!ITEM(r.id)) TOWN_ITEMS.push(Object.assign({id:r.id, type:'bld', cat:'deco', name:r.n, art:r.id, emoji:'🔬', price:0, lv:1, ev:'science'}, r.o));
      try{ ZUKAN_INFO[r.id] = r.eff; }catch(e){}
    });
    CARS.forEach(c => {
      const id = 'sci_car_' + c.k; DEFAULT_ART[id] = IC('car_' + c.k);
      if(!ITEM(id)) TOWN_ITEMS.push({id, type:'veh', name:`じぶんの くるま（${c.n}）`, art:id, emoji:'🚗', price:0, lv:1, traffic:3, income:6, pop:0.01, ev:'science'});
      try{ ZUKAN_INFO[id] = '科学館の くるまこうぼうで つくった オリジナルの 車。'; }catch(e){}
    });
    HOMER.forEach(r => {
      DEFAULT_ART[r.id] = IC(r.img); DEFAULT_ART['ft_' + r.id] = IC(r.top);
      if(!FURNITURE.some(f => f.id === r.id)) FURNITURE.push({id:r.id, name:r.n, art:r.id, type:'fur', price:0, lv:1, sty:r.sty, know:r.know, special:true, ev:'science'});
      if(r.foot){ try{ FOOT[r.id] = r.foot; }catch(e){} }
    });
  }catch(e){ console.warn('science register', e); }
}
register();

/* ---------- ごほうびを うけとる ---------- */
function giveReward(r){
  const s = SC(); if(s.got[r.id]) return false;
  s.got[r.id] = 1;
  if(r.t === 'town'){ const t = save.town; t.inv = t.inv || {}; t.inv[r.id] = (t.inv[r.id] || 0) + 1; try{ discover(r.id); }catch(e){} }
  else { const H = ensureHome(); H.inv[r.id] = (H.inv[r.id] || 0) + 1; }
  persist(); return true;
}
function giveCar(color){
  const t = save.town, id = 'sci_car_' + color, s = SC();
  const mine = (t.veh || []).filter(x => String(x).startsWith('sci_car_')).length;
  let c = 0; try{ c = townCalc().vehCap; }catch(e){ c = 99; }
  if(mine >= 3) return 'max';
  if((t.veh || []).length >= c) return 'full';
  t.veh.push(id); try{ discover(id); }catch(e){}
  s.cars.push(color); persist(); return 'ok';
}

/* =====================================================================
   画面の しくみ
   ===================================================================== */
let ROOT = null, VIEW = null, MHOST = null, V = {s:'top'}, Q = null, R = null, KEY = null, TM = 0, LABS = null;
const SCREENS = {};
const MODE = () => SC().settings.ruby || 'hard';
const plain = t => String(t ?? '').replace(/\{([^|{}]+)\|[^{}]+\}/g, '$1');
function rubify(root){
  if(!root || MODE() === 'none') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: n => (KJ.test(n.nodeValue) && n.parentElement && !n.parentElement.closest('ruby,rt,script,style,textarea,canvas,svg,input,[data-norb]')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT});
  const L = []; while(w.nextNode()) L.push(w.currentNode);
  L.forEach(n => { const h = RB(n.nodeValue, MODE()); if(h.indexOf('<ruby>') < 0) return; const t = document.createElement('template'); t.innerHTML = h; n.replaceWith(t.content); });
}
const stopTimers = () => { clearInterval(TM); TM = 0; if(LABS && LABS.raf) cancelAnimationFrame(LABS.raf); };

/* ---------- 小さな イラスト（SVG） ---------- */
const SVGI = {
  back:`<svg viewBox="0 0 24 24"><path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  lock:`<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="12" rx="3" fill="#8A7A65"/><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="#8A7A65" stroke-width="3"/></svg>`,
  check:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#4CB84C"/><path d="M6.5 12.5l4 4 7-8" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart:`<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.6A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z" fill="#F0709A"/></svg>`,
  ticket:`<svg viewBox="0 0 28 20"><path d="M2 3h24v5a2 2 0 000 4v5H2v-5a2 2 0 000-4z" fill="#FFB347" stroke="#C27A1C" stroke-width="1.6"/><path d="M10 4v12" stroke="#C27A1C" stroke-width="1.4" stroke-dasharray="2 2"/></svg>`,
  star:`<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.2.8-5.4 4.8 1.6 7.1L12 17.6 5.6 21.3l1.6-7.1L1.8 9.4 9 8.6z" fill="#FFC93C" stroke="#E0A000" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  bulb:`<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill="#FFD84A" stroke="#C98A12" stroke-width="1.5"/><rect x="9" y="18" width="6" height="3" rx="1.5" fill="#8A7A65"/></svg>`,
  hint:`<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill="#FFD84A" stroke="#C98A12" stroke-width="1.5"/><rect x="9" y="18" width="6" height="3" rx="1.5" fill="#8A7A65"/></svg>`,
  rank:(c, w = 46) => `<svg viewBox="0 0 48 56" width="${w}" height="${Math.round(w * 56 / 48)}"><path d="M12 0h10l4 16h-10z" fill="#3C93DC"/><path d="M36 0H26l-4 16h10z" fill="#E8414B"/><circle cx="24" cy="34" r="17" fill="${c[0]}" stroke="${c[1]}" stroke-width="3"/><circle cx="24" cy="34" r="11" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/><path d="M24 24l3 7 7 .6-5.3 4.7 1.7 7-6.4-3.8-6.4 3.8 1.7-7L14 31.6l7-.6z" fill="#fff" fill-opacity=".9"/></svg>`,
  lvIcon:(n, c, w = 46) => `<span class="sxLvI" style="width:${w}px;height:${w}px;background:${c};color:${n === 6 ? '#FFD84A' : '#fff'}"><i>★</i><b>${n}</b></span>`
};
const stars = (n, tot = 5) => `<span class="sxSt">${'★'.repeat(n)}<u>${'★'.repeat(Math.max(0, tot - n))}</u></span>`;
const bar = (p, cls = '') => `<div class="sxBar2 ${cls}"><i style="width:${clampN(p, 0, 100)}%"></i></div>`;
const ptTxt = n => `<span class="sxPtT"><i class="sxCoin">P</i>${n}</span>`;
const tixChip = () => `<span class="sxTix">${SVGI.ticket}<b>${tixLeft()}</b><small>/${tixMax()}</small></span>`;

/* ---------- モーダル（画面の 中の ダイアログ） ---------- */
function modal(html, btns = [{t:'OK', c:'', v:true}], cls = ''){
  return new Promise(res => {
    if(!MHOST) return res(null);
    MHOST.innerHTML = `<div class="sxMod ${cls}"><div class="sxMCard">${html}<div class="sxMBtns">${btns.map((b, i) => `<button class="sxBtn ${b.c || ''}" data-i="${i}">${b.t}</button>`).join('')}</div></div></div>`;
    MHOST.classList.add('on'); rubify(MHOST);
    MHOST.onclick = e => {
      const b = e.target.closest('.sxMBtns button');
      const o = e.target.closest('[data-pick]');
      if(o){ MHOST.classList.remove('on'); MHOST.innerHTML = ''; res({pick:o.dataset.pick}); return; }
      if(!b) return; MHOST.classList.remove('on'); MHOST.innerHTML = ''; res(btns[+b.dataset.i].v);
    };
  });
}
const closeModal = () => { if(MHOST){ MHOST.classList.remove('on'); MHOST.innerHTML = ''; } };

/* ---------- 開く／閉じる ---------- */
function root(){
  if(ROOT && document.body.contains(ROOT)) return ROOT;
  ROOT = document.createElement('div'); ROOT.id = 'sc700';
  ROOT.innerHTML = `<div id="sxView"></div><div id="sxModal"></div>`;
  document.body.appendChild(ROOT); VIEW = ROOT.querySelector('#sxView'); MHOST = ROOT.querySelector('#sxModal'); bind(ROOT);
  return ROOT;
}
function open(key){
  KEY = key; SC(); V = {s:'top'}; Q = null; R = null;
  root(); document.body.classList.add('sc700on');
  render(); requestAnimationFrame(() => ROOT && ROOT.classList.add('show'));
  try{ if(typeof discover === 'function') discover('bg_science'); }catch(e){}
}
function close(){
  stopTimers(); if(!ROOT) return; ROOT.classList.remove('show'); document.body.classList.remove('sc700on'); const r = ROOT; ROOT = null; VIEW = null; MHOST = null; V = {s:'top'}; Q = null;
  setTimeout(() => r.remove(), 240); try{ persist(); }catch(e){} try{ if(typeof renderTown === 'function' && typeof curScreen !== 'undefined' && curScreen === 'town') renderTown(); }catch(e){}
}
function go(s, o){ stopTimers(); closeModal(); V = Object.assign({s}, o || {}); render(); if(VIEW){ const m = VIEW.querySelector('.sxMain'); if(m) m.scrollTop = 0; } }
const BACKTO = {zone:'top', qsel:'top', cards:'top', rew:'top', res:'top', exp:'zone', quiz:'qsel'};
async function back(){
  if(V.s === 'top') return close();
  if(V.s === 'exp' || V.s === 'quiz'){
    const ok = await modal(`<h3 class="sxMT">やめる？</h3><p class="sxMP">ここで やめると、つかった チケットは もどらないよ。</p>`, [{t:'つづける', c:'w', v:false}, {t:'やめる', c:'', v:true}]);
    if(!ok) return;
  }
  if(V.s === 'res') return go(R && R.back ? R.back : 'top', R && R.backO);
  go(BACKTO[V.s] || 'top', V.s === 'exp' ? {z:V.z} : V.s === 'quiz' ? {z:V.qz} : {});
}

/* ---------- 画面の 共通わく ---------- */
const TITLES = {top:'かがくかん', zone:'', qsel:'もんだい', quiz:'もんだい', res:'けっか', cards:'はっけんカード', rew:'ごほうび', exp:''};
function render(){
  if(!ROOT || !VIEW) return;
  stopTimers();
  const tab = isTab(); ROOT.classList.toggle('tab', tab); ROOT.classList.toggle('ph', !tab);
  const f = SCREENS[V.s] || SCREENS.top, r = f(tab);
  ROOT.style.setProperty('--zc', r.zc || '#F2A33A');
  const rbm = {hard:'ふりがな：一部', all:'ふりがな：全部', none:'ふりがな：なし'}[MODE()];
  const ttl = r.title || TITLES[V.s] || '';
  const keepY = (VIEW.querySelector('.sxMain') || {}).scrollTop || 0, same = VIEW.dataset.s === V.s;
  VIEW.dataset.s = V.s;
  VIEW.innerHTML = `<header class="sxBarT"><button class="sxBack" data-a="back">${SVGI.back}<span>${V.s === 'top' ? 'まちへ' : 'もどる'}</span></button>
    <div class="sxTtl">${V.s === 'top' && !tab ? '' : `<span>${X(ttl)}</span>`}</div>
    ${V.s === 'top' ? `<button class="sxRb" data-a="ruby">${rbm}</button>` : ''}
    <div class="sxPt"><i class="sxCoin">P</i><b>${nf(save.points.bal)}</b><small>pt</small></div></header>
    <main class="sxMain ${r.cls || ''}">${r.html}</main>`;
  rubify(VIEW);
  const m = VIEW.querySelector('.sxMain'); if(m && same && r.keep) m.scrollTop = keepY;
  if(r.after) r.after(VIEW);
}
window.addEventListener('resize', () => { if(ROOT && !(LABS && LABS.noResize)) render(); });

/* =====================================================================
   K-01 館内トップ
   ===================================================================== */
SCREENS.top = function(tab){
  const s = SC(), rk = RK(), nx = RANKS[rankNo() + 1], pct = nx ? (s.hira - rk.m) / (nx.m - rk.m) * 100 : 100, de = dailyExp();
  const rdy = REWARDS.filter(r => rwState(r) === 'ready').length;
  const z0 = pick(ZONES);
  const hero = `<div class="sxHero"><img class="sxHeroBg" src="${IC('sci_top')}" alt=""><img class="sxOwl" data-art="res_owl" src="${art('res_owl')}" alt=""><img class="sxHana" src="${art('res_girl')}" alt="">
      <div class="sxBub" data-a="talk"><b>フクロウ博士</b>${RB(pick(['ようこそ！ 科学館へ！', 'きょうも ふしぎを さがそう！', '実験と もんだいで ひらめきを ためよう！', 'ひらめきを ためると ランクが 上がるよ。', z0.say[0]]))}</div></div>`;
  const rank = `<div class="sxCard sxRank" data-a="rank">${SVGI.rank(rk.c, 52)}<div class="sxRk"><div class="sxRkN">${rk.n}${nx ? `<small>つぎ：${nx.n}</small>` : '<small>さいこう ランク！</small>'}</div>${bar(pct, 'bl')}
      <div class="sxRkS">${nx ? `あと ${nf(nx.m - s.hira)} ひらめき` : 'おめでとう！'}　${tixChip()}</div></div></div>`;
  const daily = `<button class="sxDaily" data-a="exp" data-v="${de.id}" data-daily="1"><img src="${IC(de.ic)}" alt=""><div><small>きょうの ふしぎ</small><b>${X(de.n)}</b></div><span class="sxX2">ポイント ×${CFG.dailyX}</span></button>`;
  const zs = ZONES.map(z => { const imp = zoneImpl(z.id).length, cl = zoneClears(z.id); return `<button class="sxZc" data-a="zone" data-v="${z.id}" style="--zc:${z.c}"><span class="sxZi" style="background-image:url(${IC(z.bg)});background-position:${z.fx}"></span>
      <b>${X(z.n)}</b><i>${'●'.repeat(cl)}${'○'.repeat(Math.max(0, imp - cl))}${zoneMaster(z.id) ? ' ★' : ''}</i></button>`; }).join('');
  const nav = `<div class="sxNav"><button class="sxBtn b" data-a="qsel">${SVGI.bulb}もんだい</button><button class="sxBtn p" data-a="cards">カード<small>${Object.keys(s.cards).length}/72</small></button><button class="sxBtn g" data-a="rew">ごほうび${rdy ? `<i class="sxDot">${rdy}</i>` : ''}</button></div>`;
  return {title:'かがくかん', cls:'top', html: tab
    ? `<div class="sxTabL">${hero}</div><div class="sxTabR">${rank}${daily}<div class="sxZg">${zs}</div>${nav}</div>`
    : `${hero}<div class="sxPh">${rank}${daily}<div class="sxZg">${zs}</div>${nav}</div>`};
};

/* =====================================================================
   K-02 ゾーン
   ===================================================================== */
function expCard(e){
  const z = ZN(e.z), cl = expClear(e.id), mx = expMaxStar(e.id);
  const st = e.impl ? (cl ? `<span class="sxOk">${SVGI.check}<small>クリア済み ★${mx}</small></span>` : '<span class="sxNew">NEW</span>') : `<span class="sxSoon">${SVGI.lock}<small>じゅんびちゅう</small></span>`;
  return `<button class="sxEx ${e.impl ? '' : 'isSoon'}" data-a="exp" data-v="${e.id}"><img src="${IC(e.ic)}" alt=""><div class="sxExT"><b>${X(e.n)}</b><em>${RB(e.d)}</em>
    <div class="sxExM">${stars(e.st[1] - e.st[0] + 1, 4)}<span>★${e.st[0]}〜★${e.st[1]}</span>${ptTxt('+' + CFG.expPt[e.st[0]] + '〜')}</div></div>${st}</button>`;
}
SCREENS.zone = function(tab){
  const z = ZN(V.z) || ZONES[0], ex = zoneExps(z.id), imp = zoneImpl(z.id).length, cl = zoneClears(z.id);
  const rw = REWARDS.find(r => r.t === 'town' && ({chem:'sci_fireworks', elec:'sci_power', light:'sci_rainbow', space:'sci_stardeck'})[z.id] === r.id);
  const hero = `<div class="sxZHero"><img src="${IC(z.bg)}" style="object-position:${z.fx}" alt=""><div class="sxZName" style="--zc:${z.c}">${X(z.n)}</div></div>`;
  const say = `<div class="sxSay"><img src="${art(z.ch)}" alt=""><div class="sxBub2"><b>${X(z.chn)}</b>${RB(pick(z.say))}</div></div>`;
  const tabs = `<div class="sxTabs"><button class="on">じっけん</button><button data-a="qsel" data-v="${z.id}">もんだい</button><button data-a="cards" data-v="${z.id}">ずかん</button></div>`;
  const master = `<div class="sxMaster"><div><b>${X(z.sh)} マスターまで</b>${bar(imp ? cl / imp * 100 : 0)}</div><span>${zoneMaster(z.id) ? 'マスター！' : `${cl}/${imp}`}${rw ? `<small>ごほうび：${X(rw.n)}</small>` : ''}</span></div>`;
  return {title:tab ? z.n : z.sh, zc:z.c, cls:'zone', html: tab
    ? `<div class="sxTabL">${hero}${say}</div><div class="sxTabR">${tabs}<div class="sxExL">${ex.map(expCard).join('')}</div>${master}</div>`
    : `${hero}<div class="sxPh">${say}${tabs}<div class="sxExL">${ex.map(expCard).join('')}</div>${master}</div>`};
};

/* =====================================================================
   K-10 はっけんカード
   ===================================================================== */
SCREENS.cards = function(tab){
  const zid = V.z || 'chem', z = ZN(zid), L = cardsOf(zid), n = cardN(zid), s = SC();
  const tabs = ZONES.map(x => `<button class="sxCz ${x.id === zid ? 'on' : ''}" data-a="cardz" data-v="${x.id}" style="--zc:${x.c}"><img src="${IC(x.ic)}" alt=""><small>${cardN(x.id)}/12</small></button>`).join('');
  const badge = n >= 12 ? '金' : n >= 8 ? '銀' : n >= 4 ? '銅' : '—', nextN = n < 4 ? 4 : n < 8 ? 8 : 12;
  const grid = L.map(c => { const got = s.cards[c.id]; return `<button class="sxCd ${got ? '' : 'no'} ${c.rare ? 'rare' : ''}" data-a="card" data-v="${c.id}"><span class="sxCdI"><img src="${IC(c.img)}" alt="">${got ? '' : '<em>？</em>'}</span><b>${got ? X(c.n) : '？？？'}</b>${c.rare ? '<u>レア</u>' : ''}</button>`; }).join('');
  const head = `<div class="sxCH" style="--zc:${z.c}"><b>${X(z.n)}</b><div>${bar(n / 12 * 100)}</div><span>${n}/12</span></div>
    <div class="sxCB">バッジ：<b>${badge}</b>${n < 12 ? `　あと ${nextN - n}まいで つぎの バッジ` : '　コンプリート！'}</div>`;
  return {title:tab ? 'はっけんカード' : 'カード', zc:z.c, cls:'cards', html:`<div class="sxCZ">${tabs}</div>${head}<div class="sxCg">${grid}</div>
    <div class="sxNote">実験・もんだいを クリアすると カードが もらえるよ。レアカードは ゾーンの 11まいを あつめると ねらえるよ。</div>`, keep:1};
};

/* =====================================================================
   K-11 ごほうび
   ===================================================================== */
function rwCard(r){
  const st = rwState(r), p = r.prog ? r.prog() : null;
  const act = st === 'ready' ? `<button class="sxBtn g sm" data-a="claim" data-v="${r.id}">もらう！</button>` : st === 'got' ? `<span class="sxOk">${SVGI.check}<small>もらった</small></span>`
    : `<div class="sxRP">${p ? bar(p[0] / p[1] * 100) : ''}<small>${SVGI.lock}${X(r.condT)}${p ? `（${p[0]}/${p[1]}）` : ''}</small></div>`;
  const top = r.t === 'home' ? `<img class="sxRwT" src="${IC(r.top)}" alt=""><i class="sxRwTL">うえから</i>` : '';
  return `<div class="sxRw ${st}"><div class="sxRwI"><img src="${IC(r.img)}" alt="">${top}</div><b>${X(r.n)}</b><em>${RB(r.eff)}</em><div class="sxRwA">${act}</div></div>`;
}
SCREENS.rew = function(tab){
  const tb = V.t || 'town', s = SC();
  const tabs = `<div class="sxTabs">${[['town', 'まち'], ['home', 'わたしの家'], ['rank', 'ランク']].map(([k, n]) => `<button class="${tb === k ? 'on' : ''}" data-a="rewt" data-v="${k}">${n}${k !== 'rank' && REWARDS.some(r => r.t === k && rwState(r) === 'ready') ? '<i class="sxDot">!</i>' : ''}</button>`).join('')}</div>`;
  let body;
  if(tb === 'rank'){
    body = `<div class="sxRkL">${RANKS.map((r, i) => `<div class="sxCard sxRkR ${i <= rankNo() ? 'on' : ''}">${SVGI.rank(r.c, 44)}<div><b>${r.n}</b><small>ひつよう ひらめき：${nf(r.m)}</small><em>${RB(r.open)}</em></div>${i <= rankNo() ? SVGI.check : SVGI.lock}</div>`).join('')}</div>
      <div class="sxNote">ひらめきは、実験・もんだいで もらった ポイントと おなじ だけ たまるよ。ランクが 上がると、ポイントが ふえて、チケットも ふえるよ。</div>`;
  } else {
    const L = REWARDS.filter(r => r.t === tb);
    const cars = tb === 'town' ? `<div class="sxRw ${s.cars.length ? 'got' : 'xLk'}"><div class="sxRwI"><img src="${IC('car_red')}" alt=""></div><b>じぶんの くるま</b><em>くるまこうぼうで 車を くみたてると、まちを 走るよ（さいだい 3台）</em><div class="sxRwA"><div class="sxRP">${bar(s.cars.length / 3 * 100)}<small>いま ${s.cars.length}/3台</small></div></div></div>` : '';
    body = `<div class="sxRwG">${L.map(rwCard).join('')}${cars}</div><div class="sxNote">${tb === 'town' ? 'もらったら「まち」の「もようがえ」で おいてね。' : 'もらったら「わたしの家」の「もようがえ」で かざってね（上から見た絵も あるよ）。'}</div>`;
  }
  return {title:'ごほうび', cls:'rew', html:`${tabs}${body}`, keep:1};
};

/* =====================================================================
   カード・バッジ・つぎの ごほうび
   ===================================================================== */
const clamp01 = v => Math.max(0, Math.min(1, v));
function dropCard(z, ch){
  const s = SC(); if(Math.random() > ch) return null;
  const L = cardsOf(z).filter(c => !s.cards[c.id]), normal = L.filter(c => !c.rare), rare = L.find(c => c.rare);
  let c = null; if(normal.length) c = pick(normal); else if(rare) c = rare; if(!c) return null;
  s.cards[c.id] = Date.now(); persist(); return c;
}
function badgeBonus(z){
  const s = SC(), n = cardN(z), B = {4:100, 8:200, 12:400}; s.badge = s.badge || {};
  if(B[n] && !s.badge[z + n]){ s.badge[z + n] = 1; const pt = award(B[n], 'かがくかん バッジ'); return {n, pt, name:n === 12 ? '金' : n === 8 ? '銀' : '銅', z}; }
  return null;
}
function nextReward(){
  const L = REWARDS.filter(r => rwState(r) === 'prog' || rwState(r) === 'xLk').map(r => { const p = r.prog ? r.prog() : [0, 1]; return {r, f:p[0] / p[1], rest:p[1] - p[0]}; }).sort((a, b) => b.f - a.f);
  const x = L[0]; return x ? `「${x.r.n}」まで あと ${x.rest}（${x.r.condT}）` : '';
}

/* =====================================================================
   K-07 もんだい：レベルえらび
   ===================================================================== */
const QSEL = {z:'all', lv:3, n:5};
function accOf(l){ const a = SC().qs['l' + l]; return a && a.n ? Math.round(a.ok / a.n * 100) : 0; }
SCREENS.qsel = function(tab){
  if(V.v) QSEL.z = V.v; if(!lvOpen(QSEL.lv)) QSEL.lv = 3;
  const cols = [{id:'all', sh:'ぜんぶ', c:'#F2A33A'}].concat(ZONES);
  const chips = cols.map(z => `<button class="sxChip ${QSEL.z === z.id ? 'on' : ''}" data-a="qz" data-v="${z.id}" style="--zc:${z.c}">${X(z.sh)}</button>`).join('');
  const rows = LVS.map(l => { const open = lvOpen(l.n), sel = QSEL.lv === l.n;
    return `<button class="sxLv ${sel ? 'sel' : ''} ${open ? '' : 'xLk'}" data-a="qlv" data-v="${l.n}">${SVGI.lvIcon(l.n, l.c, tab ? 54 : 46)}
      <div class="sxLvT"><b>${l.name}<small>${l.age}</small></b>${open ? bar(accOf(l.n)) : `<small class="sxLvH">${SVGI.lock}${X(lvHint(l.n))}</small>`}</div>
      <div class="sxLvP">${open ? ptTxt(CFG.qPt[l.n]) + '<small>/もん</small>' : SVGI.lock}</div></button>`; }).join('');
  const lv = LVS[QSEL.lv - 1], cost = CFG.tixQ * QSEL.n / 5;
  const head = `<div class="sxQHead"><img src="${art('res_owl')}" alt=""><div class="sxBub2"><b>フクロウ博士</b>${RB('どの レベルに ちょうせんする？ むずかしいほど ポイントが おおいよ！')}</div></div>`;
  const foot = `<div class="sxCard sxQN"><span>もんだいの かず</span><button class="sxBtn sm ${QSEL.n === 5 ? '' : 'w'}" data-a="qn" data-v="5">5もん</button><button class="sxBtn sm ${QSEL.n === 10 ? '' : 'w'}" data-a="qn" data-v="10">10もん</button><span class="sxQT">${SVGI.ticket}×${cost}（のこり ${tixLeft()}）</span></div>
    <button class="sxBtn big" data-a="qgo" style="--bc:${lv.c}">はじめる！　★${lv.n} ${lv.name}</button>`;
  return {title:'もんだい', cls:'qsel', html: tab ? `<div class="sxTabL qh">${head}</div><div class="sxTabR"><div class="sxChips">${chips}</div><div class="sxLvG">${rows}</div>${foot}</div>` : `${head}<div class="sxChips">${chips}</div><div class="sxLvG">${rows}</div>${foot}`, keep:1};
};

/* =====================================================================
   K-08 もんだい：出題
   ===================================================================== */
async function qStart(){
  const s = SC(), cost = CFG.tixQ * QSEL.n / 5;
  if(tixLeft() < cost){ await modal(`<h3 class="sxMT">チケットが たりないよ</h3><p class="sxMP">ひらめきチケットは 1日 ${tixMax()}まい。あした また あそぼう！<br>ランクが 上がると ふえるよ。</p>`, [{t:'わかった', c:'', v:1}]); return; }
  const items = getSet(QSEL.z, QSEL.lv, QSEL.n);
  s.d.used += cost; persist();
  Q = {items, i:0, ok:0, hints:0, combo:0, streak:0, bestStreak:0, base:0, comboPt:0, lv:QSEL.lv, z:QSEL.z, n:items.length, ans:null, hint:false, t0:Date.now(), res:[]};
  s.recent = (s.recent || []).concat(items.map(x => x.id)).slice(-60); persist();
  qPrep(); go('quiz', {qz:QSEL.z});
}
function qPrep(){ const it = Q.items[Q.i]; Q.ch = shuf([it.a].concat(it.w)); Q.ans = null; Q.hint = false; Q.hide = []; Q.t0 = Date.now(); }
SCREENS.quiz = function(tab){
  const it = Q.items[Q.i], lv = LVS[Q.lv - 1], z = ZN(it.z) || ZONES[0], done = Q.ans !== null, T = CFG.qTime[Q.lv];
  const ch = Q.ch.map((c, i) => { let cl = ''; if(done){ if(c === it.a) cl = 'ok'; else if(i === Q.ans) cl = 'ng'; else cl = 'dim'; } else if(Q.hide.includes(i)) cl = 'hid';
    return `<button class="sxCh ${cl}" data-a="qa" data-v="${i}" ${done || Q.hide.includes(i) ? 'disabled' : ''}>${RB(c)}${cl === 'ok' ? SVGI.check : ''}</button>`; }).join('');
  const fig = it.fig ? `<div class="sxFig">${typeof it.fig === 'function' ? it.fig() : (FIGS[it.fig] ? FIGS[it.fig]() : '')}</div>` : `<div class="sxFig z" style="background-image:url(${IC(z.bg)});background-position:${z.fx}"></div>`;
  const fb = done ? `<div class="sxFb ${Q.ok2 ? 'ok' : 'ng'}"><b>${Q.ans === -1 ? '時間ぎれ！' : Q.ans === -2 ? 'こたえは これ！' : Q.ok2 ? 'せいかい！' : 'ざんねん…'}</b><span>こたえ：${RB(it.a)}</span><p>${RB(it.e)}</p></div>` : '';
  const acts = done ? `<button class="sxBtn big" data-a="qnext">${Q.i + 1 >= Q.n ? 'けっかを 見る' : 'つぎへ ▶'}</button>`
    : `<div class="sxQAct"><button class="sxBtn v sm" data-a="qhint" ${Q.hint ? 'disabled' : ''}>${SVGI.hint}ヒント（−½）</button><button class="sxBtn w sm" data-a="qdk">わからない</button></div>`;
  const tm = T ? `<div class="sxTimer"><span>のこり <b id="sxTL">${T}</b> びょう</span><div class="sxBar2 bl"><i id="sxTF" style="width:100%"></i></div></div>` : '';
  const top = `<div class="sxQTop"><span class="sxLvTag" style="background:${lv.c}">★${lv.n} ${lv.name}</span><div class="sxBar2"><i style="width:${(Q.i + (done ? 1 : 0)) / Q.n * 100}%"></i></div><b>${Q.i + 1} / ${Q.n}</b></div>`;
  const mascot = `<div class="sxMas"><img src="${art(z.ch)}" alt=""><div class="sxBub2">${RB(done ? (Q.ok2 ? pick(['すごい！ その ちょうし！', 'さすがだね！', 'かっこいい〜！']) : pick(['ドンマイ！ おぼえれば 強くなる！', 'おしい！ つぎは できるよ']))
      : Q.lv >= 5 ? 'むずかしいぞ…！ じっくり 考えよう' : Q.lv >= 3 ? 'よく 読んで 考えよう' : 'おちついて えらんでね')}</div></div>`;
  const qbox = `<div class="sxCard sxQBox"><span class="sxQZ" style="background:${z.c}">${X(z.sh)}</span><p>${RB(it.q)}</p></div>`;
  return {title:isTab() ? z.n : z.sh, zc:z.c, cls:'quiz', html:`${top}${tm}` + (tab
    ? `<div class="sxQG"><div class="sxQL">${fig}${mascot}</div><div class="sxQR">${qbox}<div class="sxChG">${ch}</div>${fb}${acts}</div></div>`
    : `${fig}${qbox}<div class="sxChG">${ch}</div>${fb}${acts}${mascot}`),
    after(){ if(T && !done){ TM = setInterval(() => { const left = Math.max(0, T - (Date.now() - Q.t0) / 1000), f = document.getElementById('sxTF'), l = document.getElementById('sxTL'); if(f) f.style.width = left / T * 100 + '%'; if(l) l.textContent = Math.ceil(left); if(left <= 0){ clearInterval(TM); TM = 0; qAnswer(-1); } }, 250); } }};
};
function qAnswer(i){
  if(!Q || Q.ans !== null) return; stopTimers();
  const it = Q.items[Q.i]; Q.ans = i; const ok = i >= 0 && Q.ch[i] === it.a; Q.ok2 = ok;
  if(ok){ Q.ok++; Q.streak++; Q.bestStreak = Math.max(Q.bestStreak, Q.streak); const p = CFG.qPt[Q.lv] * (Q.hint ? CFG.hintHalf : 1); Q.base += p; if(Q.streak % 2 === 0) Q.comboPt = Math.min(CFG.comboMax, Q.comboPt + CFG.combo); snd('ok'); }
  else { Q.streak = 0; snd('ng'); }
  Q.res.push({id:it.id, ok, hint:Q.hint}); render();
}
CFG.hintHalf = 0.5;
function qHint(){ if(!Q || Q.ans !== null || Q.hint) return; const it = Q.items[Q.i]; const wi = Q.ch.map((c, i) => [c, i]).filter(x => x[0] !== it.a); Q.hide = shuf(wi).slice(0, 2).map(x => x[1]); Q.hint = true; Q.hints++; snd('tap'); render(); }
function qNext(){ if(Q.i + 1 >= Q.n) return qFinish(); Q.i++; qPrep(); render(); }
function qFinish(){
  const s = SC(), n = Q.n, ok = Q.ok, rate = ok / n, clear = rate >= CFG.clearRate && ok >= Math.ceil(n * CFG.clearRate);
  const lines = []; let base = Q.base;
  lines.push([`もんだい ${ok}もん せいかい（★${Q.lv}：1もん ${CFG.qPt[Q.lv]}）`, Math.round(Q.base)]);
  if(Q.comboPt) lines.push(['れんぞく せいかい ボーナス', Q.comboPt]);
  let extra = Q.comboPt;
  if(ok === n){ const p = Math.round(Q.base * CFG.perfect); lines.push(['ぜんもん せいかい ボーナス（+30%）', p]); extra += p; }
  const zk = (Q.z === 'all' ? 'all' : Q.z) + ':' + Q.lv; let first = false;
  if(clear && !s.zl[zk]){ first = true; lines.push([`★${Q.lv} はじめて クリア ボーナス`, CFG.lvFirst]); extra += CFG.lvFirst; }
  let sub = base + extra; const rb = RK().b;
  if(rb) lines.push([`ランク ボーナス（+${Math.round(rb * 100)}%）`, Math.round(sub * rb)]);
  const rkBefore = rankNo(), pt = sub > 0 ? award(sub, 'かがくかん もんだい') : 0;
  s.n.q += n; s.n.ok += ok; const a = s.qs['l' + Q.lv] || (s.qs['l' + Q.lv] = {ok:0, n:0}); a.ok += ok; a.n += n;
  if(clear){ s.zl[zk] = (s.zl[zk] || 0) + 1; s.lvc[Q.lv] = (s.lvc[Q.lv] || 0) + 1; }
  const zc = Q.z === 'all' ? pick(ZONES).id : Q.z;
  const card = clear ? dropCard(zc, clamp01(0.45 + Q.lv * 0.08)) : null, badge = card ? badgeBonus(zc) : null;
  persist();
  R = {kind:'q', zc:ZN(zc).c, title:ok === n ? 'パーフェクト！' : clear ? 'よく できました！' : 'もう ちょっと！', sub:`★${Q.lv} ${LVS[Q.lv - 1].name}　${ok} / ${n} もん せいかい`, lines, pt, card, badge, rankUp:rankNo() > rkBefore ? rankNo() : 0,
       again:{a:'qagain'}, back:'qsel', next:nextReward(), clear, first};
  go('res');
}

/* =====================================================================
   K-09 けっか
   ===================================================================== */
SCREENS.res = function(tab){
  const r = R || {lines:[], pt:0, title:'けっか'}, s = SC(), rk = RK(), nx = RANKS[rankNo() + 1], pct = nx ? (s.hira - rk.m) / (nx.m - rk.m) * 100 : 100;
  const rows = r.lines.map(l => `<div class="sxResRow"><span>${RB(l[0])}</span><b>+${nf(l[1])}</b></div>`).join('') + `<div class="sxResTot"><span>ごうけい</span>${ptTxt('+' + nf(r.pt))}</div>`;
  const card = r.card ? `<div class="sxCard sxResCard" data-a="card" data-v="${r.card.id}"><div class="sxCdI big"><img src="${IC(r.card.img)}" alt=""><span class="sxNewT">NEW</span></div><div><small>はっけんカード ゲット！</small><b>${X(r.card.n)}</b><em>${ZN(r.card.z).n} ${cardN(r.card.z)} / 12</em></div></div>` : (r.clear === false ? '<div class="sxNote">6わり（5もんなら 4もん）いじょう せいかいで クリア！ もういちど ちょうせん しよう。</div>' : '');
  const badge = r.badge ? `<div class="sxCard sxBadgeN"><b>${r.badge.name}バッジ ゲット！</b>　${ZN(r.badge.z).n}　${ptTxt('+' + r.badge.pt)}</div>` : '';
  const rank = `<div class="sxCard sxRank">${SVGI.rank(rk.c, 40)}<div class="sxRk"><div class="sxRkN">${rk.n}${nx ? `<small>あと ${nf(nx.m - s.hira)} で ${nx.n}</small>` : ''}</div>${bar(pct, 'bl')}</div></div>`;
  const up = r.rankUp ? `<div class="sxCard sxRankUp">${SVGI.rank(RANKS[r.rankUp].c, 48)}<div><small>ランクアップ！</small><b>${RANKS[r.rankUp].n}</b><em>${RB(RANKS[r.rankUp].open)}</em></div></div>` : '';
  const note = r.next ? `<div class="sxInfo"><b>おしらせ</b>　${RB(r.next)}</div>` : '';
  const btns = `<div class="sxResB"><button class="sxBtn" data-a="${r.again ? r.again.a : 'qsel'}"${r.again && r.again.id ? ` data-v="${r.again.id}"` : ''}>${r.kind === 'e' ? 'もういちど' : 'つぎの もんだい'}</button><button class="sxBtn g" data-a="rew">ごほうび</button><button class="sxBtn w" data-a="top">ホール</button></div>`;
  const head = `<div class="sxResH"><span class="sxRibbon">${RB(r.title)}</span><div class="sxResS">${RB(r.sub || '')}</div></div>`;
  const art1 = `<div class="sxResArt"><img src="${art('res_owl')}" alt=""><div class="sxBub2">${RB(r.clear === false ? 'つぎは できるよ！' : 'ぴかぴか ひらめいたね！')}</div></div>`;
  return {title:'けっか', zc:r.zc, cls:'res', html: tab
    ? `<div class="sxTabL resL">${head}${art1}</div><div class="sxTabR"><div class="sxCard sxResT">${rows}</div>${card}${badge}${up}${rank}${note}${btns}</div>`
    : `${head}<div class="sxPh"><div class="sxCard sxResT">${rows}</div>${card}${badge}${up}${rank}${note}${art1}${btns}</div>`};
};

/* =====================================================================
   もんだい データ（★1〜★6）  形式：もんだい｜こたえ｜まちがい1｜まちがい2｜まちがい3｜かいせつ｜図(任意)
   ===================================================================== */
const QBANK = [];
function Qs(z, lv, text){
  text.trim().split('\n').forEach((ln, i) => {
    const p = ln.split('｜').map(s => s.trim()); if(p.length < 6) { console.warn('bad q', z, lv, ln); return; }
    QBANK.push({id:`${z}${lv}_${i}_${QBANK.length}`, z, lv, q:p[0], a:p[1], w:[p[2], p[3], p[4]], e:p[5], fig:p[6] || ''});
  });
}
const FIGS = {
  ser:() => `<svg viewBox="0 0 380 210"><g fill="none" stroke="#4A3420" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M44 120V50H96M164 50H216M284 50H336V120V180H44V120"/></g>
    <rect x="14" y="96" width="60" height="48" rx="8" fill="#fff" stroke="#4A3420" stroke-width="4"/><text x="44" y="127" font-size="20" font-weight="900" text-anchor="middle" fill="#4A3420">100V</text>
    <circle cx="130" cy="50" r="34" fill="#FFF3B0" stroke="#4A3420" stroke-width="4"/><text x="130" y="57" font-size="20" font-weight="900" text-anchor="middle" fill="#4A3420">100W</text>
    <circle cx="250" cy="50" r="34" fill="#FFF3B0" stroke="#4A3420" stroke-width="4"/><text x="250" y="57" font-size="20" font-weight="900" text-anchor="middle" fill="#4A3420">60W</text>
    <text x="190" y="205" font-size="15" font-weight="900" text-anchor="middle" fill="#8A7A65">ちょくれつ（どちらも 100V用）</text></svg>`,
  gear2:() => `<svg viewBox="0 0 380 200"><g>${gearSVG(20, 36, 100, 100, 0, '#3C93DC', false)}${gearSVG(60, 78, 100 + 36 + 78 + 2, 100, 0, '#F2A33A', false)}</g>
    <text x="100" y="105" font-size="20" font-weight="900" text-anchor="middle" fill="#fff">A 20</text><text x="216" y="105" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">B 60</text></svg>`,
  quakeg:() => `<svg viewBox="0 0 380 170"><rect x="4" y="4" width="372" height="162" rx="12" fill="#fff" stroke="#9FD3EE" stroke-width="3"/><path d="M14 90H90l8-14 8 28 8-34 8 40 8-28 8 18 8-8H190l10-38 10 70 10-60 10 46 10-30 10 22 8-10H366" fill="none" stroke="#4A3420" stroke-width="3" stroke-linejoin="round"/>
    <text x="96" y="130" font-size="13" font-weight="900" fill="#E8414B">P波</text><text x="196" y="130" font-size="13" font-weight="900" fill="#3C82E0">S波</text><path d="M96 140H196" stroke="#4A3420" stroke-width="2"/><text x="146" y="158" font-size="13" font-weight="900" text-anchor="middle">10 びょう</text></svg>`
};
/* ===== ばけがく ===== */
Qs('chem', 1, `
ものが もえる ために いる 空気の 成分は？｜酸素｜ちっ素｜二酸化炭素｜ヘリウム｜ものが もえるには 酸素が いるよ。
氷が とけると 何に なる？｜水｜空気｜砂｜油｜氷は とけると 水に なるよ。
水を ぐらぐら 熱すると、あわと なって 出てくる 目に 見えない ものは？｜水蒸気｜酸素｜ちっ素｜砂｜水が 熱で 水蒸気に かわるよ。
さとうを 水に 入れて かきまぜると どうなる？｜とけて 見えなく なる｜ぜんぶ 水に うく｜ふえて 2ばいに なる｜ガラスに なる｜さとうは 水に とけるよ。とけても なくなった わけでは ないよ。
ろうそくの 火に ガラスの コップを かぶせると どうなる？｜火が きえる｜火が 大きくなる｜青く かわる｜かわらない｜中の 酸素が へって 火が きえるよ。
どれが 燃える もの？｜紙｜石｜ガラス｜金属の くぎ｜紙は 燃えるけれど、石や ガラスは 燃えないよ。
水が こおると どうなる？｜かたい 氷に なる｜ガスに なる｜こなに なる｜かわらない｜0℃で 氷に なるよ。
つめたい 水を 入れた コップの 外側に つく しずくは？｜空気中の 水蒸気が 冷えて できた 水｜コップから しみ出た 水｜ほこり｜氷の かけら｜空気中の 水蒸気が 冷やされて 水に もどるよ。
`);
Qs('chem', 2, `
石灰水を 白く にごらせる 気体は？｜二酸化炭素｜酸素｜水素｜ちっ素｜二酸化炭素を 石灰水に 通すと 白く にごるよ。
空気の 中で いちばん 多く ふくまれている 気体は？｜ちっ素｜酸素｜二酸化炭素｜水素｜ちっ素が 約78%、酸素が 約21%だよ。
水100gに 食塩10gを とかすと、全体の 重さは？｜110 g｜90 g｜100 g｜1000 g｜とけても 重さは なくならない。100＋10＝110 g。
酢や レモンの しるは 何性？｜酸性｜アルカリ性｜中性｜どれでもない｜すっぱい ものは 酸性だよ。
赤い リトマス紙が 青く かわる のは、どんな 水よう液？｜アルカリ性｜酸性｜中性｜どれでもない｜アルカリ性で 赤い 紙が 青に なるよ。
水を あたためた ときの 水の 体積は？｜ふえる｜へる｜かわらない｜なくなる｜水は あたためると 少し ふくらむよ。
ミョウバンは 水の 温度が 高いほど どうなる？｜たくさん とける｜とけにくい｜かわらない｜ぜんぜん とけない｜ミョウバンは 温度が 高いほど たくさん とけるよ。
鉄が さびる ために いる ものは？｜酸素と 水｜光だけ｜音｜磁石｜さびは 鉄が 酸素と 水と ゆっくり 反応して できるよ。
`);
Qs('chem', 3, `
BTB液を 入れると 黄色に なる 水よう液は？｜酸性｜中性｜アルカリ性｜どれでもない｜BTB液は 酸性で 黄、中性で 緑、アルカリ性で 青。
食塩水から 食塩を とり出す 方法は？｜水を 蒸発させる｜ろ過する｜磁石を 使う｜ふっとう石を 入れる｜食塩は ろ紙を 通りぬけるので、水を 蒸発させて とり出すよ。
水よう液を ろ紙で ろ過した とき、ろ紙に のこる ものは？｜とけて いない つぶ｜とけた 食塩｜水｜とけた さとう｜とけて いない 固体が ろ紙に のこるよ。
うすい 塩酸に 鉄を 入れると 出る 気体は？｜水素｜酸素｜二酸化炭素｜塩素｜鉄が とけて 水素が 出るよ。
炭酸水に ふくまれて いる 気体は？｜二酸化炭素｜酸素｜水素｜アンモニア｜炭酸水は 二酸化炭素が とけた 水だよ。
50gの 水に 食塩が 最大 18g とける。100gの 水には 最大 何g まで とける？｜36 g｜9 g｜18 g｜72 g｜水の 量に 比例する。18×2＝36 g。
水が 水蒸気に なると、体積は およそ どうなる？｜約1700倍に なる｜約2倍に なる｜かわらない｜半分に なる｜水が 水蒸気に なると 体積は 約1700倍にも なるよ。
ものが とけて 見えなく なった 液体が すき通って いる とき、ふくまれる 食塩の 重さは？｜とかす 前と 同じ｜なくなる｜2倍に なる｜半分に なる｜とけても 物質は なくならず、重さも 保存される。
`);
Qs('chem', 4, `
水を 電気分解すると、陰極（−極）に 出る 気体は？｜水素｜酸素｜二酸化炭素｜塩素｜陰極で 水素、陽極で 酸素。体積の 比は 水素：酸素＝2：1。
炭酸水素ナトリウム（重曹）を 加熱すると 出る 気体は？｜二酸化炭素｜酸素｜水素｜アンモニア｜2NaHCO₃ → Na₂CO₃ ＋ H₂O ＋ CO₂。
酸化銅と 炭素を 混ぜて 加熱すると できる 物質は？｜銅と 二酸化炭素｜酸化銅と 水素｜炭酸銅｜水と 酸素｜炭素が 酸素を うばって 二酸化炭素に なり、酸化銅は 銅に 還元されるよ。
原子の 種類を 区別する もの は？｜陽子の 数｜中性子の 数だけ｜電子の 色｜原子の 大きさだけ｜陽子の 数（原子番号）が 元素を きめるよ。
フェノールフタレイン液を アルカリ性の 水よう液に 加えると？｜赤色（赤むらさき）に なる｜黄色に なる｜無色のまま｜青色に なる｜アルカリ性で 赤色に なるよ。
塩酸と 水酸化ナトリウムが ちょうど 中和した とき、できる 塩（えん）は？｜塩化ナトリウム（食塩）｜塩化カリウム｜炭酸ナトリウム｜硫酸ナトリウム｜HCl ＋ NaOH → NaCl ＋ H₂O。
密度の 求め方は？｜質量 ÷ 体積｜体積 ÷ 質量｜質量 × 体積｜質量 − 体積｜密度＝質量÷体積。
質量 54 g、体積 20 cm³ の 金属の 密度は？｜2.7 g/cm³｜1.08 g/cm³｜0.37 g/cm³｜34 g/cm³｜54÷20＝2.7。アルミニウムの 密度だよ。
`);
Qs('chem', 5, `
0.010 mol/L の 塩酸の pH は？｜2｜1｜3｜12｜塩酸は 強酸で ほぼ 完全に 電離する。[H⁺]＝1.0×10⁻² mol/L なので pH＝2。
水（H₂O）1 mol の 質量は？（H＝1、O＝16）｜18 g｜17 g｜16 g｜20 g｜1×2＋16＝18 g/mol。
標準状態（0℃、1気圧）で、気体 1 mol の 体積は？｜22.4 L｜11.2 L｜24.0 L｜44.8 L｜標準状態の 気体 1 mol は 22.4 L。
メタン CH₄ 1 mol が 完全燃焼すると、生じる CO₂ は 何 mol？｜1 mol｜2 mol｜0.5 mol｜4 mol｜CH₄ ＋ 2O₂ → CO₂ ＋ 2H₂O。係数の 比から 1 mol。
電池で、酸化（電子を 失う 反応）が 起きる 電極は？｜負極（−極）｜正極（＋極）｜どちらも｜どちらでも ない｜負極で 酸化（電子を 放出）、正極で 還元が 起きるよ。
平衡状態の 反応で、温度を 上げると 平衡は どちらに かたよる？（ルシャトリエの 原理）｜吸熱の 向き｜発熱の 向き｜かたよらない｜圧力の 向き｜温度を 上げると、熱を 吸収する 向きへ 平衡が 移動する。
アンモニア NH₃ の 分子の 形は？｜三角すい形｜直線形｜正四面体形｜折れ線形｜窒素に 3つの H と 1つの 非共有電子対 → 三角すい形。
pH 3 の 水よう液は、pH 5 の 水よう液の 何倍 こい 酸性？（[H⁺]の 比）｜100倍｜2倍｜10倍｜1000倍｜pH が 2 ちがう → 10² ＝ 100倍。
`);
Qs('chem', 6, `
pH 6 の 塩酸を 水で 1000倍に うすめた。pH は？｜7に ごく近いが わずかに 酸性｜9｜3｜ちょうど 7｜計算だけだと 10⁻⁹ mol/L（pH 9）に 見えるが、水自身の 電離（10⁻⁷ mol/L）が あるので 約 6.998。酸を うすめても アルカリ性には ならないよ。
コップの 水に 浮かぶ 氷が ぜんぶ とけたら、水面は？｜かわらない｜上がる｜下がる｜あふれる｜氷は 自分の 重さと 同じ 重さの 水を おしのけて 浮く。とけた 水の 体積が ちょうど その ぶんに なる。
同じ 温度・同じ 圧力で、気体 1 mol の 体積を くらべる（H₂、N₂、CO₂、He）。いちばん 大きい のは？｜どれも 同じ｜H₂｜CO₂｜He｜アボガドロの 法則：同温・同圧・同じ 物質量なら、気体の 種類に よらず 体積は 同じ。
食塩水を 炭素 電極で 電気分解すると、陽極で 発生する 気体は？｜塩素｜酸素｜水素｜ナトリウム｜陽極で 2Cl⁻ → Cl₂ ＋ 2e⁻。食塩水では 酸素より 塩素が 出やすい。
同位体（アイソトープ）の 説明として 正しい のは？｜陽子の 数が 同じで 中性子の 数が ちがう｜中性子の 数が 同じで 陽子の 数が ちがう｜電子の 数だけが ちがう｜質量数が 同じ｜同位体は 原子番号が 同じで、質量数が ちがう。
炭素14 の 半減期は 約 5700年。ある 木片の 炭素14 が、もとの 1/4 に へっていた。この 木が 切られて から 何年？｜約 11400年｜約 5700年｜約 17100年｜約 22800年｜半減期 2回ぶん。5700×2＝11400年。
水素 4 g と 酸素 16 g を 完全に 反応させる と、水は 何 g できる？（H＝1、O＝16）｜18 g｜20 g｜36 g｜9 g｜2H₂ ＋ O₂ → 2H₂O。酸素 16 g＝0.5 mol が 足りなく なるので、水は 1 mol＝18 g。
銀の かがみ反応が 起きる ことで 見分けられる 物質の なかま は？｜アルデヒド（還元性の ある 物質）｜アルコールだけ｜アルカンだけ｜どんな 物質でも｜銀鏡反応は、アルデヒド基を もつ 還元性の 物質で 銀が 析出して 鏡のように なる。
`);
/* ===== でんき・じしゃく ===== */
Qs('elec', 1, `
じしゃくに くっつく ものは？｜鉄の くぎ｜ガラスの コップ｜ゴムの ボール｜紙｜じしゃくは 鉄を ひきつけるよ。
豆電球が ひかるのは、どんな とき？｜電気の 通り道が 輪に なっている とき｜電池だけが ある とき｜スイッチが 切れて いる とき｜豆電球だけが ある とき｜電気が 輪のように ぐるっと 流れると ひかるよ。
電気を 通す ものは？｜銅（どう）の はり金｜木の ぼう｜プラスチックの 定規｜ゴムの 消しゴム｜金属は 電気を 通すよ。
じしゃくの 力が いちばん 強い 場所は？｜両はしの 極｜まん中｜どこも 同じ｜外がわ｜磁石の 力は 両はしの 極が いちばん 強いよ。
電池の 向きを はんたいに すると、モーターの 回る 向きは？｜はんたいに なる｜かわらない｜止まる｜速くなる｜電流の 向きが 逆に なるから、回る 向きも 逆に なるよ。
金属で できて いなくて 電気を 通さない ものは？｜ゴムの 手ぶくろ｜はさみ｜銅線｜アルミホイル｜ゴムは 電気を 通さないよ。
N極と S極を 近づけると どうなる？｜ひきあう｜しりぞけあう｜何も 起きない｜燃える｜ちがう 極どうしは ひきあうよ。
かみなりの 光は 何が 起きて いる？｜大きな 電気が 空気中を 流れる｜火山が ふんかする｜星が 落ちる｜月が 光る｜雲の 電気が 一気に 流れる 放電だよ。
`);
Qs('elec', 2, `
かん電池 2こを 直列に つなぐと、1この ときより モーターは？｜速く 回る｜おそく 回る｜かわらない｜止まる｜直列に すると 電圧が 2倍に なるよ。
電流が 流れない ものは？｜ガラスの ぼう｜銅線｜アルミはく｜鉄の くぎ｜ガラスは 電気を 通さない（絶縁体）よ。
電磁石の 力を 強く する 方法は？｜コイルの 巻き数を ふやす｜巻き数を へらす｜電池を はずす｜コイルを 短くする｜巻き数と 電流が 大きい ほど 強い。
電流の 単位は？｜アンペア（A）｜ボルト（V）｜ワット（W）｜オーム（Ω）｜電流は アンペア。電圧は ボルト だよ。
電池の 電圧の 単位は？｜ボルト（V）｜アンペア（A）｜ワット（W）｜オーム（Ω）｜電圧の 単位は ボルト。
磁石を 2つに 切ると どうなる？｜それぞれに N極と S極が できる｜N極だけと S極だけに なる｜力が なくなる｜片方は 鉄に なる｜磁石は どこで 切っても、N極と S極が 両方 できるよ。
電気を よく 通す 液体は？｜食塩水｜さとう水｜蒸留水｜サラダ油｜食塩は 水中で イオンに なって 電気を 運ぶよ。
豆電球と 電池を つなぐ とき、導線を つなぐ 場所は？｜口金と 底の 金属の 2か所｜ガラスの 部分｜どこでも よい｜つなぐ 必要は ない｜口金（ねじの 部分）と 底に つなぐと 回路が できるよ。
`);
Qs('elec', 3, `
10Ωの 抵抗に 3Vの 電圧を かけると、流れる 電流は？｜0.3 A｜3 A｜30 A｜13 A｜オームの 法則 I＝V÷R＝3÷10＝0.3 A。
同じ 豆電球 2こを 並列に つなぐと、1こあたりの 明るさは、1この ときと くらべて？｜かわらない｜暗くなる｜明るくなる｜消える｜並列は それぞれの 豆電球に 同じ 電圧が かかるので、明るさは かわらないよ。
同じ 豆電球 2こを 直列に つなぐと、1こあたりの 明るさは？｜暗くなる｜明るくなる｜かわらない｜消える｜電圧を 2こで 分け合うので 暗くなる。
電流計は 回路に どう つなぐ？｜直列｜並列｜どちらでも よい｜つながない｜電流計は 直列、電圧計は 並列に つなぐよ。
電圧計は はかりたい 部分に どう つなぐ？｜並列｜直列｜どちらでも よい｜つながない｜電圧計は 並列に つなぐよ。
かん電池（1.5V）2こを 逆向きに 直列に つなぐと、全体の 電圧は？｜0 V｜3 V｜1.5 V｜0.75 V｜逆向きの 直列は 打ち消しあって 0 V。
100Vで 使う 500Wの ドライヤーに 流れる 電流は？｜5 A｜50 A｜0.2 A｜500 A｜P＝VI より I＝500÷100＝5 A。
鉄心に 導線を まいて 電流を 流すと できる ものは？｜電磁石｜永久磁石｜電池｜発電機｜電流が つくる 磁力を 使った 電磁石だよ。
`);
Qs('elec', 4, `
10Ωの 抵抗に 3Vの 電圧を かけた ときの 電力は？｜0.9 W｜30 W｜3 W｜13 W｜P＝V²÷R＝9÷10＝0.9 W。
電熱線に 流す 電流を 2倍に すると、同じ 時間の 発熱量は？（抵抗は 同じ）｜4倍｜2倍｜8倍｜1/2倍｜ジュール熱 Q＝I²Rt。電流の 2乗に 比例するので 4倍。
6Ω と 3Ω の 抵抗を 並列に つないだ 合成抵抗は？｜2 Ω｜9 Ω｜4.5 Ω｜18 Ω｜1/R＝1/6＋1/3＝1/2 なので R＝2 Ω。
コイルに 磁石を 近づけると 電流が 流れる 現象は？｜電磁誘導｜静電気｜電気分解｜光電効果｜電磁誘導。発電機の 原理だよ。
1000W の 電気ストーブを 3時間 使った。使った 電力量は？｜3 kWh｜1 kWh｜300 Wh｜3 W｜1 kW×3 h＝3 kWh。
並列つなぎの 回路で、全体を 流れる 電流は？｜各枝の 電流の 和｜各枝の 電流の 平均｜どの 枝とも 同じ｜いちばん 大きい 枝の 電流｜並列は 電流が 分かれて、合計が 全体の 電流に なる。
直列つなぎで、各抵抗に かかる 電圧を ぜんぶ たすと？｜電源の 電圧と 等しい｜電源の 電圧より 大きい｜0 V｜電源の 半分｜直列では 電圧を 分けあい、合計は 電源電圧に なる。
日本の 家庭の コンセントの 電圧は？｜100 V｜1.5 V｜12 V｜1000 V｜日本の 家庭用は 100 V（交流）だよ。
`);
Qs('elec', 5, `
抵抗 10Ω と 15Ω を 並列に つないだ 合成抵抗は？｜6 Ω｜25 Ω｜12.5 Ω｜5 Ω｜10×15÷(10＋15)＝6 Ω。
電気容量 100 μF の コンデンサーに 10 V を かけて 充電した。たくわえた 電気量は？｜1.0×10⁻³ C｜1.0×10⁻⁶ C｜1.0×10⁻¹ C｜1.0 C｜Q＝CV＝100×10⁻⁶×10＝1.0×10⁻³ C。
直線電流の まわりに できる 磁界の 向きを 決める 法則は？｜右ねじの 法則｜フレミングの 左手の 法則｜レンツの 法則｜クーロンの 法則｜電流の 向きに 右ねじを 進めると、ねじを 回す 向きが 磁界の 向き。
交流 100 V（実効値）の 最大値は 約？｜141 V｜100 V｜200 V｜71 V｜最大値＝実効値×√2 ≒ 141 V。
起電力 6 V、内部抵抗 1 Ω の 電池に、外部抵抗 5 Ω を つなぐと 流れる 電流は？｜1 A｜1.2 A｜6 A｜0.5 A｜I＝6÷(5＋1)＝1 A。
磁界の 中の 導線に 電流を 流すと 力が はたらく。力の 向きを 決める 法則は？｜フレミングの 左手の 法則｜フレミングの 右手の 法則｜右ねじの 法則｜アンペールの 法則｜電流・磁界・力の 関係は 左手（モーターの 原理）。
変圧器で、1次コイルの 巻き数 100、2次コイルの 巻き数 500。1次側に 100 V を かけると 2次側は？｜500 V｜20 V｜100 V｜5 V｜V₂＝V₁×N₂÷N₁＝500 V。
同じ 電気容量 C の コンデンサー 2つを 並列に つなぐと、全体の 電気容量は？｜2C｜C÷2｜C｜C²｜並列つなぎの コンデンサーは 電気容量を たし算する。
`);
Qs('elec', 6, `
100W と 60W の 白熱電球（どちらも 100V用）を 直列に つないで 100V の 電源に つなぐ。明るいのは？｜60W の ほう｜100W の ほう｜同じ 明るさ｜どちらも 光らない｜抵抗は 100W が 100Ω、60W が 約167Ω。直列は 同じ 電流 I なので、P＝I²R が 大きい 60W の ほうが 明るい。｜ser
100V・100W の 電球を 50V の 電源に つないだ。消費電力は？（抵抗は 一定と する）｜25 W｜50 W｜100 W｜12.5 W｜R＝100V²÷100W＝100Ω。P＝V²÷R＝2500÷100＝25 W。
家の ブレーカーが 落ちるのは、どんな とき？｜同時に 使う 電気の 電流が 大きく なりすぎた とき｜電圧が 下がった とき｜電気を 使わない とき｜外が 暗い とき｜大きな 電流を 感知して、回路を 切るよ。
電池に 豆電球を つないだら 光った。同じ 電池に 同じ 豆電球を もう1つ 並列に つなぐ と、電池の もちは？｜短く なる｜長く なる｜かわらない｜2倍に なる｜流れる 電流の 合計が 2倍に なるので、電池は はやく なくなる。
磁石の N極に 鉄の くぎを くっつけた。くぎの 先（磁石と 反対がわ）は 何極に なる？｜N極｜S極｜極は できない｜日に よって かわる｜磁石に ついた 端が S極、反対の 先が N極に なる（磁気誘導）。
100V の コンセントに、電熱器（800W）と ドライヤー（1200W）を 同時に つないだ。全体で 流れる 電流は？｜20 A｜8 A｜12 A｜10 A｜(800＋1200)÷100＝20 A。
スイッチを 入れた 直後に すぐ 豆電球が 光る のは、なぜ？｜導線の 電場の 変化が ほぼ 光の 速さで 伝わり、全体の 電子が いっせいに 動き出す から｜電子が 光の 速さで 導線を 走る から｜電池から 電子が とび出す から｜電球が 先に 電気を ためて いる から｜電子 そのものの 速さは ミリ毎秒で とても おそい。でも 電場が ほぼ 光速で 伝わる。
1.5 V の 電池に 1 Ω の 抵抗を つないだ。1分間の 発熱量は？｜135 J｜1.5 J｜90 J｜225 J｜P＝V²÷R＝2.25 W。2.25×60＝135 J。
`);
/* ===== くるまこうぼう ===== */
Qs('car', 1, `
くるまの ブレーキを ふむと、光る ランプの 色は？｜赤｜青｜緑｜紫｜うしろの 人に 知らせる ために 赤く 光るよ。
信号が 青の とき、車は どうする？｜すすんで よい｜止まる｜バックする｜ゆっくり 止まる｜青は すすんで よい 合図だよ。
自転車の ペダルを こぐと、チェーンで 何が 回る？｜うしろの 車輪｜ライト｜ベル｜かご｜チェーンが うしろの 車輪を 回すよ。
工事で 土を ほる はたらく 車は？｜ショベルカー｜消防車｜救急車｜パトカー｜ショベルカーは アームで 土を ほるよ。
夜の 道を 前から てらす 車の ライトは？｜ヘッドライト｜ブレーキランプ｜ワイパー｜クラクション｜ヘッドライトが 前を てらすよ。
くるまの タイヤに ゴムが 使われる 理由は？｜すべりにくく、ゆれを 吸収する から｜ひかる から｜おいしい から｜かるい から｜ゴムは すべりにくく、ゆれも やわらげる。
くるまが 走る ために、ガソリンを 入れる 場所は？｜ガソリンスタンド｜パン屋｜図書館｜公園｜ガソリンスタンドで 給油するよ。
ななめの 坂（スロープ）を 使うと、重い ものを どう できる？｜小さな 力で 上げられる｜もっと 重くなる｜力が いらなく なる｜上がらなく なる｜坂を 使うと 少ない 力で 上げられるよ。
`);
Qs('car', 2, `
2つの 歯車が かみあって いる とき、回る 向きは？｜ぎゃく向き｜同じ向き｜止まる｜ばらばら｜かみあう 歯車は おたがいに 反対向きに 回るよ。
ブレーキを かけると 車が 止まる わけは？｜まさつで 運動の エネルギーを 熱に かえる から｜車が 軽くなる から｜空気が 入る から｜重さが きえる から｜ブレーキは まさつで 熱を 出して 車を 止める。
てこで 重い ものを 小さな 力で 上げる とき、力を 加える 点（力点）は？｜支点から 遠く｜支点の すぐ そば｜重い ものの 真上｜どこでも 同じ｜力点が 支点から 遠いほど 小さな 力で すむ。
ガソリンの かわりに 電気で 走る 車は？｜電気自動車｜ガス自動車｜水車｜風車｜電気自動車は モーターで 走るよ。
ハサミは 何の 原理を 使って いる？｜てこ｜かっ車｜ねじ｜斜面｜ハサミは 支点が ある 2つの てこが 組み合わさって いるよ。
自転車の ギアを 軽くすると、ペダルは？｜軽く こげるが 進む きょりは 短い｜重く なるが すごく 進む｜かわらない｜こげなくなる｜軽い ギアは 少ない 力で こげる 代わり、1回転で 進む きょりが 短い。
くるまの 速さの 単位「km/h」の 読み方は？｜キロメートル 毎 時｜キログラム 毎 時｜キロワット 毎 時｜キロ 毎 分｜km/h は 1時間に 進む きょり（キロメートル）。
てこで、重い もの が 乗る 場所を 何という？｜作用点｜支点｜力点｜重心｜てこには 支点・力点・作用点の 3つが あるよ。
`);
Qs('car', 3, `
てこで 力点を 支点から 2倍 遠くに すると、必要な 力は？｜半分｜2倍｜4倍｜かわらない｜力×支点からの きょり が つりあう ので、きょりが 2倍なら 力は 半分。
定滑車 1つで 10 kg の 荷物を 持ち上げる のに 必要な 力は？｜10 kg分の 力｜5 kg分｜20 kg分｜2.5 kg分｜定滑車は 力の 向きを かえる だけ。
動滑車 1つで 10 kg の 荷物を 持ち上げる のに 必要な 力は？｜5 kg分｜10 kg分｜20 kg分｜2.5 kg分｜動滑車は 力が 半分で すむ 代わりに、ひく きょりが 2倍に なる。
斜面を 使って 荷物を 持ち上げると、仕事の 大きさは？（まさつ なし）｜まっすぐ 持ち上げる のと 同じ｜半分に なる｜2倍に なる｜0に なる｜力は 小さく なるが ひく きょりが 長く なり、仕事の 大きさは 同じ（仕事の 原理）。
4ストロークエンジンの 4つの 行程の 順番は？｜吸気→圧縮→燃焼→排気｜吸気→燃焼→圧縮→排気｜圧縮→吸気→排気→燃焼｜排気→圧縮→吸気→燃焼｜空気を 吸って、ちぢめて、火を つけて、はき出す。
エンジンの 動力を タイヤに 伝えて 速さを かえる 装置は？｜トランスミッション（変速機）｜マフラー｜ワイパー｜バッテリー｜変速機で ギアを かえて 力と 速さを 調整する。
ブレーキを かけた とき、モーターを 発電機に して 電気を もどす 電気自動車の しくみは？｜回生ブレーキ｜ターボ｜ノッキング｜ドリフト｜止まる ときの エネルギーを 電気に して バッテリーに もどす。
時速 36 km を 秒速に すると？｜10 m/秒｜36 m/秒｜3.6 m/秒｜100 m/秒｜36000 m ÷ 3600 秒＝10 m/秒。
`);
Qs('car', 4, `
歯数 20 の 歯車A が 歯数 60 の 歯車B を 回す。A が 3回転 すると、B は？｜1回転｜3回転｜9回転｜6回転｜20歯×3回転＝60歯。B は 60歯なので 1回転。｜gear2
時速 72 km で 走る 車が ブレーキを かけて 5秒で 止まった。平均の 加速度の 大きさは？｜4 m/s²｜14.4 m/s²｜2 m/s²｜20 m/s²｜72 km/h＝20 m/s。20÷5＝4 m/s²。
圧力の 式は？｜力 ÷ 面積｜力 × 面積｜面積 ÷ 力｜力 − 面積｜圧力 P＝F÷S。
同じ 力で おすとき、細い タイヤの 自転車は、太い タイヤより 地面に かかる 圧力が？｜大きい｜小さい｜同じ｜0｜面積が 小さい ほど 圧力は 大きく なる。
ガソリンエンジンで、ガソリンに 火を つける 部品は？｜点火プラグ｜ピストン｜クランク｜バルブ｜点火プラグが 火花を とばす。
質量 1000 kg の 車が 時速 36 km（10 m/s）で 走る。運動エネルギーは？｜50000 J｜10000 J｜100000 J｜5000 J｜½mv²＝0.5×1000×10²＝50000 J。
ディーゼルエンジンに 点火プラグが いらない 理由は？｜空気を 強く 圧縮して 高温に なり、燃料が 自然に 着火する から｜電気で 燃やす から｜火花が いらない 燃料だから｜エンジンが 小さい から｜圧縮着火。圧縮で 空気が 高温に なる。
車の 速さが 2倍に なると、ブレーキを かけてから 止まる までの きょり（制動距離）は およそ？｜4倍｜2倍｜8倍｜かわらない｜制動距離は 速さの 2乗に 比例する。
`);
Qs('car', 5, `
歯数 20 の 歯車A（毎分 600回転）が 歯数 40 の 歯車B を 回す。B の 回転数は 毎分？｜300回転｜1200回転｜600回転｜150回転｜歯の 数の 比 1：2 なので、回転数は 半分。
4気筒 4ストロークエンジンが 毎分 3000回転 で 回っている。1秒間に、エンジン全体で 燃焼（点火）は 何回？｜100回｜25回｜50回｜200回｜3000回転/分＝50回転/秒。1気筒は 2回転に 1回 燃焼 → 25回/秒。×4気筒＝100回/秒。
停止していた 車が 一定の 加速度 3 m/s² で 10秒間 加速した。走った 距離は？｜150 m｜30 m｜300 m｜15 m｜x＝½at²＝0.5×3×10²＝150 m。
熱効率 30% の エンジン。ガソリン 1 L から 得られる 熱量が 3.4×10⁷ J。仕事に かわる のは およそ？｜1.0×10⁷ J｜3.4×10⁷ J｜1.0×10⁶ J｜3.0×10⁷ J｜0.30×3.4×10⁷ ≒ 1.0×10⁷ J。のこりは 熱として にげる。
カーブを 曲がる 車の 速さを 2倍に した。同じ 半径で 曲がる ために 必要な 向心力は？｜4倍｜2倍｜8倍｜かわらない｜向心力 F＝mv²÷r は 速さの 2乗に 比例する。
電気自動車の モーターの 回転数を 変える ために よく 使われる 装置は？｜インバーター｜ラジエーター｜スパークプラグ｜キャブレター｜インバーターで 電圧と 周波数を 制御する。
車の エアバッグを ふくらませる きっかけに なる センサーは？｜加速度センサー｜温度センサー｜光センサー｜音センサー｜衝突の 急な 減速を 検出する。
斜面に 置かれた 質量 m の 車が すべり下りる 加速度は？（角度 θ、まさつなし、重力加速度 g）｜g sinθ｜g cosθ｜g｜g tanθ｜斜面に そった 重力の 成分は mg sinθ。a＝g sinθ。
`);
Qs('car', 6, `
車の 空気抵抗は 速さの 2乗に 比例する。時速 100 km から 時速 50 km に 下げると、空気抵抗は？｜4分の1｜2分の1｜8分の1｜かわらない｜F ∝ v²。速さが 半分なら 空気抵抗は 1/4。
回生ブレーキを 使っても、電気自動車が 100% の エネルギーを もどせ ない 理由は？｜一部が 熱や まさつ、空気抵抗などで 失われる から｜バッテリーが こわれる から｜ブレーキが 弱い から｜電気が 光に なる から｜エネルギーの 総量は 保存されるが、熱として にげる 分が ある。
上り坂を 一定の 速さで のぼる 車の エンジンの 出力が 2倍に なるのは？（坂の 傾きは 同じ）｜速さが 2倍の とき｜坂の 長さが 2倍の とき｜時間が 2倍の とき｜車の 色が かわる とき｜出力 P＝Fv。力 F が 同じなら、出力は 速さに 比例。
同じ 質量の 車 2台。1台は 時速 20 km、もう1台は 止まっている。ぶつかって 一体に なった。ぶつかった あとの 速さは？｜時速 10 km｜時速 20 km｜時速 5 km｜時速 40 km｜運動量保存：m×20＝2m×v → v＝10 km/h。
ガソリン 1 L を 燃やすと、出る CO₂ は およそ 何 kg？｜約 2.3 kg｜約 0.23 kg｜約 23 kg｜約 0.023 kg｜ガソリン 1 L の 炭素が すべて CO₂ に なると 約 2.3 kg（環境省の 目安）。
同じ 歯数の 歯車 3つ（A→C→B）を 一列に かみ合わせた。A と B の 回転の 向きは？｜同じ｜逆｜止まる｜ときどき かわる｜A→C で 逆、C→B で もう一度 逆に なるので、A と B は 同じ 向き（C は アイドラーギア）。
車が カーブで 外側に ふくらむ 感じが する 本当の 理由は？｜慣性（まっすぐ 進もうと する 性質）｜外向きの 本当の 力が はたらく から｜タイヤが 大きい から｜空気が おす から｜慣性の 法則。遠心力は 回る がわから 見た 見かけの 力だよ。
4ストローク エンジン（総排気量 2 L）が 毎分 6000回転 で 回る。吸う 空気は 理論上 1秒あたり およそ？｜100 L｜50 L｜200 L｜25 L｜6000回転/分＝100回転/秒。4ストロークは 2回転で 1サイクル → 50サイクル/秒。×2 L＝100 L/秒。
`);
/* ===== ひかり・おと ===== */
Qs('light', 1, `
日本で いう、にじの 色の 数は？｜7色｜3色｜5色｜10色｜赤・橙・黄・緑・青・藍・紫の 7色だよ。
光は どう すすむ？｜まっすぐ｜ぐねぐね｜ぐるぐる｜止まっている｜光は まっすぐ すすむよ。
音を 出している 太鼓の 皮は どう なっている？｜ふるえている｜止まっている｜光っている｜冷たくなっている｜音は ものの ふるえで 出るよ。
かげが できる わけは？｜光が ものに さえぎられる から｜ものが 光る から｜音が 出る から｜風が ふく から｜光が とどかない ところが かげに なる。
太鼓を つよく たたくと、音は？｜大きくなる｜小さくなる｜かわらない｜止まる｜つよく たたくと ふるえが 大きく なり、音も 大きく なるよ。
虫めがねで 日光を 集めて 黒い 紙に 当てると？｜こげる｜こおる｜光らなくなる｜ぬれる｜光を 1点に 集めると 熱が 集まって 紙が こげる。（目を 傷める ので 太陽は 見ないでね）
音が 聞こえる のは、何が 伝わる から？｜空気（ものの ふるえ）｜光｜におい｜かげ｜音は 空気などの ふるえとして 耳に とどくよ。
かがみに うつった 文字は？｜左右が ぎゃくに 見える｜上下が ぎゃくに 見える｜そのまま｜見えなくなる｜かがみでは 左右が ぎゃくに 見えるよ。
`);
Qs('light', 2, `
月の かたちが 変わって 見える のは なぜ？｜太陽に 照らされた 部分の 見え方が 変わる から｜月が ちぢむ から｜雲が かくす から｜月が 光を 出す から｜月は 地球の まわりを 回って いて、光って 見える 部分が かわる。
光が 水に 入る とき、ストローが 曲がって 見える のは？｜屈折｜反射｜分散｜吸収｜光が 空気と 水の さかいで 曲がる 屈折だよ。
平らな かがみに 光を 当てる。入射角が 30° なら、反射角は？｜30°｜60°｜15°｜90°｜反射の 法則：入射角＝反射角。
音の 高さを きめる もの は？｜ふるえる 回数（振動数）｜ふるえる 大きさ｜かげの 長さ｜色｜ふるえる 回数が 多い ほど 高い 音に なるよ。
音の 大きさを きめる もの は？｜ふるえの 大きさ（振幅）｜ふるえる 回数｜光の 強さ｜温度｜ふるえが 大きい ほど 大きな 音に なるよ。
光の 三原色は？｜赤・緑・青｜赤・黄・青｜赤・黄・緑｜白・黒・灰色｜テレビや ディスプレイは 赤・緑・青の 3つの 光で いろいろな 色を つくる。
糸電話で 声が 伝わる のは、何が ふるえる から？｜糸｜光｜かげ｜におい｜声の ふるえが 糸を 伝わって 相手に とどく。
虫めがね（凸レンズ）に ものを 近づけて 見ると？｜大きく 見える｜小さく 見える｜見えなく なる｜色が かわる｜焦点の 内側に ものを おくと、大きな 像が 見える。
`);
Qs('light', 3, `
かみなりの 光が 見えてから 3秒後に 音が 聞こえた。きょりは およそ？（音速 340 m/秒）｜約 1 km｜約 100 m｜約 10 km｜約 340 km｜340×3＝1020 m。光は ほぼ 一しゅんで とどく。
凸レンズで、物体を 焦点より 遠くに おくと、スクリーンに うつる 像は？｜上下左右が 逆の 実像｜正立の 虚像｜像は できない｜同じ 向きの 実像｜焦点より 遠くの 物体は、倒立（さかさま）の 実像を つくる。
太陽の 光を プリズムに 通すと 7色に 分かれる。この ことを 何という？｜分散｜反射｜吸収｜干渉｜光が 色ごとに 曲がる 角度が ちがう ことを 分散と いう。
水中の 魚は、実際の 位置より？｜浅い ところに 見える｜深い ところに 見える｜同じ 位置に 見える｜見えない｜屈折で 浅い ところに あるように 見える。
赤い 光と 緑の 光を 重ねる と、何色に 見える？｜黄色｜白｜青｜紫｜光の 色は 重ねると 明るく なる（加法混色）。赤＋緑＝黄。
光の 速さは 秒速 約 何 km？｜30万 km｜340 m｜3万 km｜3 km｜光は 1秒間に 地球を 約7周半 する 速さ。
真空の 中では、音は？｜伝わらない｜光と 同じ 速さで 伝わる｜もっと 速く 伝わる｜小さく 伝わる｜音は 空気などの ものの ふるえで 伝わる。真空では 伝わらない。
ピアノの 高い 音は、低い 音より？｜ふるえる 回数が 多い｜ふるえる 回数が 少ない｜ふるえが 大きい｜ふるえが 小さい｜高い 音ほど 振動数が 大きい。
`);
Qs('light', 4, `
音が 空気中（15℃）を 伝わる 速さは、およそ 何 m/秒？｜約 340｜約 34｜約 3400｜約 34000｜音速は 約 340 m/秒。光よりも ずっと おそい。
かみなりの 光が 見えて 6秒後に 音が 聞こえた。音速 340 m/秒 として、かみなりまでの きょりは？｜約 2.0 km｜約 570 m｜約 1.2 km｜約 20 km｜340×6＝2040 m ≒ 2.0 km。
焦点距離 10 cm の 凸レンズの 前 20 cm に 物体を おいた。像が できる 位置は？｜レンズの 反対側 20 cm｜30 cm｜10 cm｜像は できない｜物体を 焦点距離の 2倍の 位置に おくと、反対側の 2倍の 位置に 同じ 大きさの 実像が できる。
光ファイバーの 中を 光が 進める 理由（原理）は？｜全反射｜光の 分散｜光の 吸収｜音の 反射｜ある 角度より 大きく 入ると、境目で すべて 反射する（全反射）。
1秒間に 440回 ふるえる 音の 振動数は？｜440 Hz｜44 Hz｜4400 Hz｜0.44 Hz｜Hz（ヘルツ）は 1秒間の ふるえの 回数。ラの 音は 440 Hz。
音の 波長が 2 m、振動数が 170 Hz の とき、音の 速さは？｜340 m/s｜85 m/s｜172 m/s｜680 m/s｜v＝fλ＝170×2＝340 m/s。
白い 光の 中で、いちばん 大きく 曲がる（屈折する）色は？｜紫｜赤｜緑｜黄｜波長が 短い 光ほど 大きく 曲がる。
光が 太陽から 地球まで とどく のに かかる 時間は およそ？｜約 8分｜約 8秒｜約 80分｜約 8時間｜1.5億 km ÷ 30万 km/s ＝ 約 500秒 ≒ 8分。
`);
Qs('light', 5, `
同じ 弦の 長さを 半分に すると、音の 振動数は？（ほかの 条件は 同じ）｜2倍｜半分｜4倍｜かわらない｜弦が 短いほど 高い 音。長さが 半分で 振動数は 2倍（1オクターブ 上）。
屈折率 1.5 の ガラスの 中の 光の 速さは？（真空中 3.0×10⁸ m/s）｜2.0×10⁸ m/s｜4.5×10⁸ m/s｜3.0×10⁸ m/s｜1.5×10⁸ m/s｜v＝c÷n＝3.0×10⁸÷1.5＝2.0×10⁸ m/s。
救急車が 近づくとき、サイレンの 音が 高く 聞こえる 現象は？｜ドップラー効果｜干渉｜回折｜共鳴｜音源が 近づくと 波が 縮まって 高い 音に 聞こえる。
二重スリットの 実験で 観察される ものは？｜明暗の しま（干渉しま）｜1本の 明るい 線だけ｜影だけ｜色の うず｜光が 波である ことの 証拠だよ。
焦点距離 15 cm の 凸レンズの 前 30 cm に 物体。像の 倍率は？｜1倍｜2倍｜0.5倍｜3倍｜1/a＋1/b＝1/f から b＝30 cm。倍率＝b÷a＝1。
偏光サングラスで 水面の まぶしさが へるのは なぜ？｜水面の 反射光は 特定の 方向に かたよって いる から｜サングラスが 暗い だけ｜水面が 光らなく なる から｜音が 消える から｜反射光は 偏光して いて、偏光板で カットできる。
音の 強さが 10 倍に なると、デシベル（dB）は？｜10 dB ふえる｜10倍に なる｜1 dB ふえる｜100 dB ふえる｜dB は 対数。強さ 10倍で 10 dB。
2つの スピーカーから 同じ 音が 出ている。ある 場所で 音が 打ち消しあう のは、2つの 音の 道のりの 差が？｜半波長｜1波長｜0｜2波長｜半波長 ずれると 山と 谷が 重なって 弱めあう。
`);
Qs('light', 6, `
鏡の 中の 自分は 左右が 逆に 見えるが、上下は 逆に ならない。鏡が じっさいに 反転させている 方向は？｜前後（鏡に 垂直な 方向）｜左右｜上下｜どれも 反転しない｜鏡は 奥行き（前後）を 反転する。左右が 逆に 見えるのは、自分が 後ろに 回って むかい合った 別人を 想像して 左右を おきかえて 考える から。
空が 青く、夕焼けが 赤い 理由は？｜短い 波長の 光ほど 空気の つぶで 散乱されやすい から｜海の 色が うつる から｜太陽が 色を かえる から｜雲が 色を つける から｜レイリー散乱。夕方は 光の 道のりが 長く、青が 散って 赤が のこる。
強い 光を 当て つづけた とき、黒い 紙と 白い 紙の どちらが 熱くなる？｜黒い 紙｜白い 紙｜同じ｜どちらも 冷える｜黒は 光を よく 吸収して 熱に かえる。
虫めがねで 日光を 小さな 点に 集めた。光の エネルギーの 総量は？｜ふえて いない（同じ）｜2倍に なる｜0に なる｜10倍に なる｜レンズは 光を 集める だけで、エネルギーの 総量は ふえない。面積が 小さく なるので 熱く なる。
音の 速さは、空気の 温度が 上がると？｜速く なる｜おそく なる｜かわらない｜止まる｜温度が 1℃ 上がるごとに、音速は 約 0.6 m/s ずつ 速くなる。
ヘリウムを 吸うと 声が 高く なる のは なぜ？｜ヘリウム中は 音速が 大きく、のどの 共鳴の 周波数が 上がる から｜声帯が ふるえる 回数が ふえる から｜ヘリウムが 声を 出す から｜のどが ちぢむ から｜声帯の 振動数は ほぼ 同じ だが、音の 速さが 約3倍に なり、共鳴が 高くなる。
光と 音が 同時に 3 km 先で 発生した。音は 光より およそ 何秒 おくれて とどく？（音速 340 m/s）｜約 8.8秒｜約 3秒｜約 0.9秒｜約 88秒｜3000÷340 ≒ 8.8秒。光は ほぼ 一しゅんで とどく。
光が 1年 かけて 進む きょりは およそ？｜約 9.5兆 km｜約 9.5億 km｜約 950万 km｜約 95万 km｜1光年は 約 9.46兆 km。宇宙の きょりを 表す 単位だよ。
`);
/* ===== うちゅう・ちきゅう ===== */
Qs('space', 1, `
太陽が のぼる 方角は？｜東｜西｜南｜北｜太陽は 東から のぼって 西へ しずむよ。
夜に 空で 光って 見える 星の うち、自分で 光って いるのは？｜恒星（太陽の ような 星）｜惑星｜月｜人工衛星｜恒星は 自分で 光る 星。月や 惑星は 太陽の 光を 反射して 光って 見える。
地球の 形は？｜ほぼ 丸い 球｜平ら｜四角｜三角｜地球は ほぼ 丸い 球の 形を して いる。
満月から 次の 満月までは 約 何日？｜約 30日｜約 7日｜約 100日｜約 365日｜月の 満ち欠けは 約 29.5日で 一回り。
雨を ふらせる のは 空の 何？｜雲｜にじ｜星｜月｜雲の 中の 水の つぶが 大きく なって 雨と なって 落ちる。
地震が 起きたら、まず どうする？｜頭を 守って 机の 下などに かくれる｜外へ とび出す｜エレベーターに 乗る｜窓に 近づく｜まず 身を 守る ことが だいじ。
夕方の 空が 赤っぽく 見える 色は？｜赤・オレンジ｜緑｜紫｜黒｜夕焼けの 赤い 色が 見える。
宇宙飛行士が 宇宙へ 行く とき 乗る 乗り物は？｜ロケット｜ヨット｜バス｜列車｜ロケットで 宇宙へ 飛び立つよ。
`);
Qs('space', 2, `
北の 空で ほとんど 動かない 星は？｜北極星｜シリウス｜ベガ｜金星｜北極星は 地球の 自転の 軸の 先に あるので、ほとんど 動かないよ。
太陽系で いちばん 大きい 惑星は？｜木星｜土星｜地球｜海王星｜木星が 太陽系で 最大の 惑星。
太陽系で 太陽に いちばん 近い 惑星は？｜水星｜金星｜地球｜火星｜水星が 太陽に いちばん 近い。
昼と 夜が できる のは なぜ？｜地球が 自転して いる から｜太陽が 回る から｜月が 動く から｜雲が かくす から｜地球が 1日に 1回 自転して いる。
地震の ゆれの 大きさを 表す 数字は？（日本）｜震度｜気温｜湿度｜標高｜震度は 場所ごとの ゆれの 強さを 表す。
月の 表面に ある 丸い くぼみは？｜クレーター｜クレバス｜カルデラ｜プール｜クレーターは 隕石が ぶつかって できた くぼみ。
夏と 冬で 季節が ちがう のは なぜ？｜地球の 地軸が かたむいて いる から｜太陽が 近づく から｜月が 遠ざかる から｜雲が ふえる から｜地軸が かたむいて いる ので、太陽の 光の 当たり方が 季節で かわる。
雨雲の 動きを 見る のに 使う ものは？｜気象レーダー｜虫めがね｜方位磁針｜定規｜気象レーダーは 雨の 強さと 動きを 調べる。
`);
Qs('space', 3, `
雲が できる とき、空気の 動きは？｜上昇気流｜下降気流｜水平の 風｜無風｜空気が 上へ 上がる と 冷えて 水蒸気が 水の つぶに なる。
北半球で、夏の 昼が 長い のは なぜ？｜太陽の 通り道が 高く なる から｜地球が 太陽に 近い から｜月が 小さい から｜風が 強い から｜夏は 太陽の 高度が 高く、昼が 長く なる。
金星が 夕方に 西の 空に 見える とき、何と いう？｜よいの 明星｜明けの 明星｜北極星｜すい星｜夕方の 金星は よいの 明星、明け方は 明けの 明星。
地震で 最初に 来る 小さな ゆれ（初期微動）を おこす 波は？｜P波｜S波｜表面波だけ｜津波｜P波が 先に 来て 初期微動、あとから S波が 来て 主要動。
地震の P波と S波、速いのは？｜P波｜S波｜同じ｜場合による｜P波の ほうが 速い。
天気図で、まわりより 気圧が 高い 場所の 中心付近の 天気は？｜晴れやすい｜雨が 多い｜台風になる｜雪｜高気圧の 中では 下降気流で 晴れやすい。
日本の 冬に よく 見られる 気圧配置は？｜西高東低｜南高北低｜東高西低｜北高南低｜西に 高気圧、東に 低気圧。冬の 季節風が 吹く。
太陽の 高度が いちばん 高く なる 時刻を？｜南中｜日の出｜日の入り｜夕焼け｜南中の ときに 太陽の 高度が 最大。
`);
Qs('space', 4, `
地震で、P波と S波の 到着時間の 差（初期微動継続時間）が 長いほど、震源は？｜遠い｜近い｜かわらない｜関係ない｜差が 長い ほど 震源までの きょりが 遠い。｜quakeg
大森公式：初期微動継続時間が 10秒 の とき、震源までの きょりは？（係数 8 km/秒）｜約 80 km｜約 8 km｜約 800 km｜約 18 km｜距離 ≒ 8 × 10 ＝ 約 80 km。｜quakeg
寒冷前線が 通過した あとの 気温は？｜下がる｜上がる｜かわらない｜急に 30℃ になる｜寒冷前線の あとは 冷たい 空気に おおわれる。
温暖前線の 前に 広がる 雲は？｜乱層雲｜積乱雲｜積雲｜雲は できない｜温暖前線の 前に 乱層雲が 広がり、長く しとしと 降る。
太陽系の 惑星で、地球より 外側を 回って いる のは？｜火星｜金星｜水星｜どれも 内側｜地球の すぐ 外側に 火星が ある。
月食が おきる とき、太陽・地球・月の 並び方は？｜太陽・地球・月｜太陽・月・地球｜地球・太陽・月｜どれでも｜月が 地球の かげに 入る のが 月食。
マグマが 地表付近で 急に 冷えて できる 岩石は？｜火山岩｜深成岩｜堆積岩｜変成岩｜地表で 急に 冷える と 火山岩、地下で ゆっくり 冷えると 深成岩。
地層が できた 時代を 知る 化石を 何という？｜示準化石｜示相化石｜生きた 化石｜化石燃料｜示準化石は 時代、示相化石は 環境を 知る 手がかり。
`);
Qs('space', 5, `
地球の 表面すれすれを まわる 人工衛星の 速さ（第一宇宙速度）は 約？｜7.9 km/秒｜0.34 km/秒｜11.2 km/秒｜42 km/秒｜第一宇宙速度は 約 7.9 km/秒。11.2 km/秒 は 地球を 脱出する 第二宇宙速度。
月の 地球の まわりを 一周する 時間（恒星月）は 約？｜約 27.3日｜約 29.5日｜約 365日｜約 7日｜満ち欠けの 周期（朔望月）は 約 29.5日、地球の まわりを 一周は 約 27.3日。
太陽から 地球に とどく 光の エネルギー（太陽定数）は 約？｜約 1.4 kW/m²｜約 140 W/m²｜約 14 kW/m²｜約 1.4 W/m²｜太陽定数は 約 1.4 kW/m²（1平方メートルあたり）。
1等星は 6等星の 約 何倍 明るい？｜約 100倍｜約 6倍｜約 10倍｜約 1000倍｜5等級の 差で ちょうど 100倍。
ケプラーの 第3法則 は？｜公転周期の 2乗は 軌道の 長半径の 3乗に 比例｜周期は 距離に 比例｜周期の 3乗は 距離の 2乗に 比例｜周期は 距離に 関係ない｜T² ∝ a³。
地球を 北極の 上から 見ると、自転の 向きは？｜反時計回り｜時計回り｜回らない｜日に よって ちがう｜地球は 西から 東へ 自転。北極側から 見ると 反時計回り。
ブラックホールの 説明で 正しい のは？｜光も にげ出せない ほど 重力が 強い 天体｜光を 出す 星｜空間に あいた 穴｜太陽の 反対側の 星｜ブラックホールは 重力が 強すぎて 光も 出られない。
星座を つくる 星は、地球から の きょりが？｜バラバラ｜すべて 同じ｜ほぼ 同じ｜すべて 太陽の となり｜星座の 星は 見かけだけ 近く、じっさいの きょりは バラバラ。
`);
Qs('space', 6, `
国際宇宙ステーション（高度 約 400 km）の 宇宙飛行士が ふわふわ 浮く のは なぜ？｜地球を 回りながら 自由落下して いる から｜高度 400 km では 重力が ほぼ 0 だから｜宇宙には 空気が ない から｜太陽の 引力が 打ち消す から｜ISS の 高度でも 重力は 地上の 約9割。おちつづけて いる ので 無重力に 感じる。
月は いつも 同じ 面を 地球に 向けている。これは？｜自転周期と 公転周期が 同じ だから｜月が 自転して いない から｜月の 裏が 暗い から｜地球が 回って いない から｜月は ちゃんと 自転して いる。自転と 公転の 周期が 同じ なので いつも 同じ 面が 見える。
ロケットが 空気の ない 宇宙で 進める のは なぜ？｜燃焼ガスを 後ろへ 出す 反作用を 使う から｜空気を けって 進む から｜太陽風に おされる から｜磁石の 力を 使う から｜作用・反作用の 法則（運動量保存）で 進む。
地球の 公転の 速さは およそ？｜約 30 km/秒｜約 0.3 km/秒｜約 300 km/秒｜約 3 km/秒｜1年で 約 9.4億 km を 進むので、約 30 km/秒。
夜空の 星の 光は？｜ずっと 昔に 出た 光｜今 出た 光｜未来の 光｜太陽光の 反射｜星の 光は 何年も かかって とどく。
太陽が とつぜん 消えたとして、地球で 気づく のは およそ 何分後？｜約 8分後｜すぐ｜約 1時間後｜約 1日後｜光が 約 8分 かかる。重力の 変化も 光速で 伝わる。
金星の 表面温度が 水星より 高い 理由は？｜厚い 二酸化炭素の 大気の 温室効果｜太陽に 近い から｜自転が 速い から｜火山が ない から｜金星の 地表は 約 460℃。二酸化炭素の 温室効果が 強い。
新月の 月は、空の どこに ある？｜太陽と 同じ 方向（昼の 空）｜真夜中の 空｜夕方の 西の 空｜地球の 反対がわ｜新月は 太陽と 同じ 方向に ある。昼の 空に あるので、夜は 見えない。
`);
/* ===== いのち・からだ ===== */
Qs('life', 1, `
アサガオの たねから 最初に 出る 葉は？｜ふたば（子葉）｜ほんば｜つる｜つぼみ｜最初に 出るのが 子葉（ふたば）だよ。
ヒトの ほねの 数は おとなで 約？｜206本｜20本｜1000本｜50本｜おとなの ほねは 約 206本。
人が 息を すう とき、体に とり入れる 空気の 成分は？｜酸素｜二酸化炭素｜ちっ素｜水素｜酸素を とりこんで 二酸化炭素を はき出す。
チョウの 幼虫を 何と いう？｜青虫（あおむし）｜さなぎ｜成虫｜たまご｜チョウは たまご→よう虫→さなぎ→成虫と かわる。
植物が 水を 吸い上げる のは？｜根｜花｜葉｜つぼみ｜根から 水を 吸い上げる。
ヒトの 心臓の はたらきは？｜血液を 全身に おくる｜食べ物を くだく｜息を する｜考える｜心臓は ポンプの ように 血液を おくる。
植物の たねが 芽を 出す ために 必要な ものは？｜水・空気・ちょうどよい 温度｜光だけ｜土だけ｜肥料だけ｜発芽には 水・空気・ちょうどよい 温度が いる。
メダカの おすと めすの ちがいが わかる ところは？｜ひれの 形｜目の 数｜口の 数｜しっぽの 数｜せびれ・しりびれの 形が ちがう。
`);
Qs('life', 2, `
だ液は 何を 別の ものに かえる？｜でんぷん｜たんぱく質｜脂肪｜水｜だ液は でんぷんを 糖に かえる はたらきが ある。
ヒトの 血液の 赤い 色の もとに なる 成分は？｜赤血球｜白血球｜血小板｜血しょう｜赤血球の ヘモグロビンが 赤い 色。
花の 中で、実に なる 部分は？｜子房（めしべの 根もと）｜花びら｜がく｜おしべ｜めしべの 根もとの 子房が 実に なる。
こん虫の からだは いくつの 部分に 分かれる？｜頭・胸・腹の 3つ｜2つ｜4つ｜5つ｜こん虫の からだは 頭・胸・腹の 3つ。
こん虫の 足は 何本？｜6本｜8本｜4本｜10本｜こん虫の 足は 6本、胸に ついて いる。
光合成で 植物が つくる ものは？｜養分（でんぷん）と 酸素｜二酸化炭素｜水だけ｜光｜光を 使って 二酸化炭素と 水から 養分と 酸素を つくる。
食べ物の 栄養分を おもに 吸収する 場所は？｜小腸｜胃｜大腸｜食道｜小腸の 壁から 栄養を 吸収する。
種子が 発芽する とき、多くの 種で いらない ものは？｜光｜水｜空気｜適当な 温度｜多くの 種は 暗くても 発芽する。
`);
Qs('life', 3, `
だ液の はたらきで、でんぷんが かわる もの は？｜糖（麦芽糖）｜たんぱく質｜脂肪｜水｜だ液の アミラーゼが でんぷんを 糖に 分ける。
光合成が 行われる 細胞の 小さな 部分は？｜葉緑体｜核｜ミトコンドリア｜液胞｜葉緑体で 光を 使って 養分を つくる。
ヒトの 心臓は いくつの 部屋？｜2心房 2心室（4つ）｜1つ｜3つ｜6つ｜心臓は 2つの 心房と 2つの 心室で できて いる。
心臓から 血液を おくり出す 血管は？｜動脈｜静脈｜毛細血管だけ｜リンパ管｜心臓から 出る 血管が 動脈、もどる 血管が 静脈。
全身から 心臓へ もどる 血液が 流れる 血管は？｜静脈｜動脈｜気管｜食道｜静脈には 逆流を ふせぐ 弁が ある。
オオカナダモの 葉の 細胞を けんびきょうで 見ると 見える 緑色の つぶは？｜葉緑体｜核｜気泡｜細胞壁だけ｜緑色の つぶが 葉緑体。
食物連鎖で、植物を 食べる 動物は？｜草食動物（一次消費者）｜肉食動物｜分解者｜生産者｜植物（生産者）を 食べる のが 草食動物。
肺で ガス交換が 行われる 小さな ふくろは？｜肺胞｜気管｜胃｜食道｜肺胞で 酸素を とり入れ、二酸化炭素を 出す。
`);
Qs('life', 4, `
DNAは どんな 形？｜二重らせん｜1本の 直線｜球｜四角い 板｜DNAは ねじれた はしごの ような 二重らせん 構造。
丸い 種（RR）と しわの 種（rr）の 純系を かけあわせると、子（F1）は？｜すべて 丸い 種｜すべて しわ｜丸：しわ＝1：1｜丸：しわ＝3：1｜優性の 法則。F1 は すべて 優性の 形質（丸）に なる。
F1 どうしを かけあわせた F2 の「丸：しわ」の 比は？｜3：1｜1：1｜1：3｜2：1｜分離の 法則。丸：しわ＝3：1。
体細胞分裂の あと、できた 2つの 細胞の 染色体の 数は？｜もとの 細胞と 同じ｜半分｜2倍｜ばらばら｜体細胞分裂では 染色体の 数が かわらない。
植物の 細胞に あって 動物の 細胞に ない ものは？｜細胞壁｜核｜細胞膜｜ミトコンドリア｜植物の 細胞には 細胞壁と 葉緑体が ある。
赤血球の はたらきは？｜酸素を 運ぶ｜細菌を 食べる｜血を 固める｜栄養を 分解する｜赤血球の ヘモグロビンが 酸素を 運ぶ。
光合成の 原料に なる ものは？｜二酸化炭素と 水｜酸素と 水｜酸素と 二酸化炭素｜水素と ちっ素｜二酸化炭素と 水から 養分（でんぷん）と 酸素を つくる。
ヒトの 体で、いちばん 大きい 臓器と いわれる のは？｜皮膚｜肝臓｜小腸｜肺｜皮膚は 体を おおう もっとも 大きな 臓器。
`);
Qs('life', 5, `
DNAで アデニン（A）と 対に なる 塩基は？｜チミン（T）｜グアニン（G）｜シトシン（C）｜ウラシル（U）｜A と T、G と C が 対。ウラシルは RNA の 塩基。
ミトコンドリアの おもな はたらきは？｜ATP を つくる（呼吸）｜光合成｜DNA の 保管｜水の 貯蔵｜ミトコンドリアで 呼吸が 行われ、エネルギー（ATP）が つくられる。
タンパク質を つくる 場所は？｜リボソーム｜核｜ゴルジ体｜ミトコンドリア｜リボソームで mRNA の 情報から タンパク質が 合成される（翻訳）。
酵素の 性質として 正しい のは？｜特定の 物質（基質）にだけ はたらく｜どんな 物質にも はたらく｜高温ほど よく はたらく｜反応で なくなる｜基質特異性。最適温度が ある。
血糖値を 下げる ホルモンは？｜インスリン｜アドレナリン｜グルカゴン｜チロキシン｜すい臓から 出る インスリンが 血糖値を 下げる。
遺伝子型 Aa どうしを 交配。子が aa（劣性ホモ）に なる 確率は？｜1/4｜1/2｜3/4｜0｜AA：Aa：aa＝1：2：1。aa は 1/4。
光合成で 光を 強くしても、ある ところから 光合成速度が 上がらなくなる のは なぜ？｜二酸化炭素などの ほかの 条件が 限定要因 に なる から｜植物が つかれる から｜光が 消える から｜葉が 小さい から｜限定要因。いちばん 足りない 条件で 速さが きまる。
神経の 興奮を 次の 神経に 伝える 物質は？｜神経伝達物質｜ホルモン｜酵素｜血しょう｜シナプスで 神経伝達物質が 放出される。
`);
Qs('life', 6, `
A型の 父と B型の 母。生まれる 子の 血液型に ついて 正しい のは？｜両親の 遺伝子型しだいで、A・B・AB・O の どれも あり得る｜AB型 だけ｜A型か B型 だけ｜O型 だけ｜父が AO、母が BO なら 子は A・B・AB・O の どれにも なれる。
ヒトの 細胞 1個の 核の DNA を ぜんぶ のばして つなぐと、およそ どれくらい？｜約 2 m｜約 2 mm｜約 2 cm｜約 2 km｜ヒトの DNA は 1セットで 約 1 m。体細胞は 2セット あるので 約 2 m。
ヒトの 心臓は 1日に およそ 何回 拍動する？｜約 10万回｜約 1万回｜約 100万回｜約 1000回｜1分に 約 70回 × 1440分 ＝ 約 10万回。
ヒトの 体を つくる 細胞の 数は およそ？｜約 37兆個｜約 37万個｜約 37億個｜約 3700兆個｜約 37兆個と いわれる。
池の 魚を 100匹 つかまえて 印を つけ、もどした。後日 200匹 つかまえたら、印つきが 10匹 だった。池の 魚は およそ 何匹？｜約 2000匹｜約 1000匹｜約 200匹｜約 20000匹｜標識再捕獲法：N＝100×200÷10＝2000匹。
「生きた 化石」と よばれる 生き物は？｜シーラカンス｜ティラノサウルス｜マンモス｜アンモナイト｜シーラカンスは 大昔から ほとんど 姿を かえずに 今も 生きて いる。
ミツバチが 巣に もどって 行う ダンス（8の字ダンス）が 伝える ことは？｜花の 方向と きょり｜天気｜敵の 数｜あいさつ｜太陽の 方向を 基準に、花の 方角と きょりを 仲間に 伝える。
酵素が はたらく のに 最も よい 温度（最適温度）は、ヒトの 体内の 酵素では？｜体温（約 36〜37℃）付近｜0℃｜100℃｜どんな 温度でも 同じ｜ヒトの 酵素は 体温付近で 最もよく はたらく。高温では 形が こわれて はたらけない。
`);

/* ---------- 自動生成の もんだい（数値を かえて いくらでも 出せる） ---------- */
function numQ(z, lv, id, q, ans, unit, e, fig){
  const fmt = v => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('ja-JP') : String(Math.round(v * 100) / 100)) + unit;
  const mul = shuf([0.5, 2, 10, 0.1, 1.5, 3, 0.25, 4]); const set = new Set([fmt(ans)]); const w = [];
  for(const m of mul){ const v = ans * m; if(v > 0 && !set.has(fmt(v)) && w.length < 3){ set.add(fmt(v)); w.push(fmt(v)); } }
  while(w.length < 3){ const v = ans + w.length + 1; if(!set.has(fmt(v))){ set.add(fmt(v)); w.push(fmt(v)); } }
  return {id:`g_${id}_${Math.random().toString(36).slice(2, 7)}`, z, lv, q, a:fmt(ans), w, e, fig:fig || ''};
}
const GENS = [
  [['elec', 3], () => { const R = pick([5, 10, 20, 30, 40, 50]), V = pick([3, 6, 9, 12, 15]); return numQ('elec', 3, 'ohm', `${R}Ω の 抵抗に ${V}V の 電圧を かけた。流れる 電流は？`, V / R, ' A', `I＝V÷R＝${V}÷${R}＝${Math.round(V / R * 100) / 100} A。`); }],
  [['elec', 4], () => { const R = pick([2, 4, 5, 8, 10, 20]), V = pick([4, 6, 8, 10, 12]); return numQ('elec', 4, 'pw', `${R}Ω の 電熱線に ${V}V を かけた。消費電力は？`, V * V / R, ' W', `P＝V²÷R＝${V*V}÷${R}＝${Math.round(V * V / R * 100) / 100} W。`); }],
  [['elec', 5], () => { const a = pick([2, 3, 4, 6, 12]), b = pick([3, 4, 6, 12, 15, 20]); if(a === b) return null; return numQ('elec', 5, 'par', `${a}Ω と ${b}Ω の 抵抗を 並列に つないだ。合成抵抗は？`, a * b / (a + b), ' Ω', `1/R＝1/${a}＋1/${b}。R＝${a}×${b}÷(${a}＋${b})＝${Math.round(a * b / (a + b) * 100) / 100} Ω。`); }],
  [['elec', 5], () => { const n1 = pick([100, 200, 400]), k = pick([2, 3, 5, 10]), V = pick([50, 100, 200]); return numQ('elec', 5, 'tr', `変圧器の 1次コイルは ${n1}回巻き、2次コイルは ${n1 * k}回巻き。1次側に ${V}V を かけると 2次側は？`, V * k, ' V', `V₂＝V₁×N₂÷N₁＝${V}×${k}＝${V * k} V。`); }],
  [['car', 3], () => { const v = pick([18, 36, 54, 72, 90, 108]); return numQ('car', 3, 'kmh', `時速 ${v} km は 秒速 何 m？`, v / 3.6, ' m/秒', `${v}×1000÷3600＝${v / 3.6} m/秒。`); }],
  [['car', 4], () => { const a = pick([10, 12, 15, 20]), k = pick([2, 3, 4]), rot = pick([60, 120, 180, 240]); return numQ('car', 4, 'gr', `歯数 ${a} の 歯車A が 歯数 ${a * k} の 歯車B を 回す。A が ${rot * k}回転すると、B は 何回転？`, rot, ' 回転', `歯の 数の 比 ${a}：${a * k}。B の 回転数は A の 1/${k}＝${rot} 回転。`); }],
  [['car', 5], () => { const a = pick([2, 3, 4, 5]), t = pick([4, 6, 8, 10]); return numQ('car', 5, 'acc', `止まって いた 車が 一定の 加速度 ${a} m/s² で ${t}秒 走った。進んだ きょりは？`, 0.5 * a * t * t, ' m', `x＝½at²＝0.5×${a}×${t}²＝${0.5 * a * t * t} m。`); }],
  [['light', 3], () => { const s = pick([2, 3, 4, 5, 6, 8]); return numQ('light', 3, 'thun', `かみなりの 光が 見えて ${s}秒 後に 音が 聞こえた。かみなりまでの きょりは？（音速 340 m/秒）`, 340 * s, ' m', `きょり＝速さ×時間＝340×${s}＝${340 * s} m。`); }],
  [['light', 4], () => { const f = pick([170, 340, 425, 680]), l = 340 / f; return numQ('light', 4, 'wv', `振動数 ${f} Hz の 音の 波長は？（音速 340 m/s）`, l, ' m', `λ＝v÷f＝340÷${f}＝${l} m。`); }],
  [['light', 5], () => { const n = pick([1.2, 1.33, 1.5, 2.0]); return numQ('light', 5, 'ref', `屈折率 ${n} の 物質の 中の 光の 速さは？（真空中 3.0×10⁸ m/s）`, 3.0 / n, '×10⁸ m/s', `v＝c÷n＝3.0×10⁸÷${n}＝${Math.round(3 / n * 100) / 100}×10⁸ m/s。`); }],
  [['space', 4], () => { const t = pick([5, 8, 10, 12, 15]); return numQ('space', 4, 'omori', `初期微動継続時間が ${t}秒の とき、震源までの きょりは およそ？（大森公式 係数 8 km/秒）`, 8 * t, ' km', `距離 ≒ 8×${t}＝${8 * t} km。`, 'quakeg'); }],
  [['space', 5], () => { const o = pick([['月', 38.4, 384000, 1.28, ' 秒'], ['太陽', 14960, 149600000, 498.7, ' 秒']]); return numQ('space', 5, 'lt', `地球から ${o[0]}まで 約 ${o[0] === '月' ? '38.4万' : '1.5億'} km。光の 速さを 30万 km/秒 として、光が とどく までの 時間は？`, o[3], o[4], `${o[2]}÷300000＝約 ${o[3]} 秒。`); }],
  [['chem', 4], () => { const m = pick([27, 54, 78, 135, 108]), v = pick([10, 20, 30, 50]); return numQ('chem', 4, 'dens', `質量 ${m} g、体積 ${v} cm³ の 物質の 密度は？`, m / v, ' g/cm³', `密度＝質量÷体積＝${m}÷${v}＝${Math.round(m / v * 100) / 100} g/cm³。`); }],
  [['chem', 5], () => { const c = pick([0.1, 0.01, 0.001]), ph = Math.round(-Math.log10(c)); return numQ('chem', 5, 'ph', `${c} mol/L の 塩酸（強酸）の pH は？`, ph, '', `[H⁺]＝${c} mol/L → pH＝−log₁₀ ${c}＝${ph}。`); }],
  [['chem', 5], () => { const n = pick([0.5, 2, 3]); return numQ('chem', 5, 'mol', `標準状態で ${n} mol の 気体の 体積は？（1 mol＝22.4 L）`, n * 22.4, ' L', `22.4×${n}＝${Math.round(n * 22.4 * 100) / 100} L。`); }]
];
const ZIDS = ZONES.map(z => z.id);
function getSet(z, lv, n){
  const s = SC(), recent = new Set(s.recent || []);
  let pool = QBANK.filter(q => q.lv === lv && (z === 'all' || q.z === z));
  const gens = GENS.filter(g => g[0][1] === lv && (z === 'all' || g[0][0] === z));
  let out = []; const gen = [];
  for(let i = 0; i < Math.min(n, 4) && gens.length; i++){ const q = pick(gens)[1](); if(q) gen.push(q); }
  let fresh = pool.filter(q => !recent.has(q.id));
  if(fresh.length < n) fresh = pool;
  out = shuf(fresh);
  if(z === 'all'){ const by = {}; shuf(out).forEach(q => { (by[q.z] = by[q.z] || []).push(q); }); out = []; let k = 0; const zs = shuf(ZIDS); while(out.length < n * 2 && k < 40){ const zz = zs[k % zs.length], arr = by[zz]; if(arr && arr.length) out.push(arr.shift()); k++; } }
  const nGen = Math.min(gen.length, n >= 10 ? 2 : 1), res = out.slice(0, n - nGen).concat(gen.slice(0, nGen));
  return shuf(res).slice(0, n);
}

/* =====================================================================
   実験：共通（イラスト部品）
   ===================================================================== */
function gearSVG(N, r, cx, cy, rot, col, anim, dir = 1, rpm = 0){
  const ro = r * 1.16, ri = r * 0.92, w = 2 * Math.PI / N; let d = '';
  for(let i = 0; i < N; i++){
    const a = i * w, P = (rad, k) => `${(cx + rad * Math.cos(a + w * k)).toFixed(1)} ${(cy + rad * Math.sin(a + w * k)).toFixed(1)}`;
    d += (i ? 'L' : 'M') + P(ri, 0) + 'L' + P(ro, 0.13) + 'L' + P(ro, 0.37) + 'L' + P(ri, 0.5);
  }
  d += 'Z';
  const an = anim && rpm > 0 ? `<animateTransform attributeName="transform" type="rotate" from="${rot} ${cx} ${cy}" to="${rot + 360 * dir} ${cx} ${cy}" dur="${(120 / rpm).toFixed(2)}s" repeatCount="indefinite"/>` : '';
  return `<g transform="rotate(${rot} ${cx} ${cy})">${an}<path d="${d}" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="rgba(255,255,255,.25)"/><circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#6B7480" stroke="#3A3F47" stroke-width="2"/>
    <line x1="${cx}" y1="${cy - r * 0.55}" x2="${cx}" y2="${cy + r * 0.55}" stroke="rgba(0,0,0,.25)" stroke-width="3"/></g>`;
}
function bulbSVG(x, y, lv, s = 1){
  const g = clampN(lv, 0, 1), col = g > 0.02 ? `rgb(255,${Math.round(235 - (1 - g) * 40)},${Math.round(150 - g * 90)})` : '#EFEFEA';
  return `<g transform="translate(${x} ${y}) scale(${s})">${g > .02 ? `<circle r="${30 + g * 22}" cy="-4" fill="#FFE98A" fill-opacity="${(0.15 + g * 0.45).toFixed(2)}"/>` : ''}
    <path d="M0 -26a22 22 0 00-13 40v8h26v-8A22 22 0 000 -26z" fill="${col}" stroke="#B5701C" stroke-width="3"/><path d="M-8 12V-4a8 8 0 0116 0V12" fill="none" stroke="#B5701C" stroke-width="3" stroke-linecap="round"/>
    <rect x="-11" y="22" width="22" height="9" rx="2" fill="#8A929C"/><rect x="-8" y="31" width="16" height="6" rx="2" fill="#565E69"/></g>`;
}
function batterySVG(x, y, n = 1, w = 56){
  let s = ''; for(let i = 0; i < n; i++) s += `<rect x="${x + i * (w + 6)}" y="${y}" width="${w}" height="34" rx="6" fill="#3A3F47" stroke="#1E2126" stroke-width="3"/><rect x="${x + 6 + i * (w + 6)}" y="${y + 6}" width="14" height="22" rx="2" fill="#F2A33A"/><rect x="${x + w + i * (w + 6)}" y="${y + 10}" width="6" height="14" rx="2" fill="#C9CED6"/><path d="M${x + w - 18 + i * (w + 6)} ${y + 17}h10M${x + w - 13 + i * (w + 6)} ${y + 12}v10" stroke="#fff" stroke-width="3"/>`;
  return s;
}
const SVGW = (w, h, inner, cls = '') => `<svg class="sxSvg ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
const gauge = (p, label, col = '#F2A33A') => `<div class="sxG"><span>${label}</span><div class="sxBar2"><i style="width:${clampN(p, 0, 100)}%;background:${col}"></i></div></div>`;
function beep(f, amp = 5){
  try{ if(!save.settings.sound) return; const A = window.__scAC || (window.__scAC = new (window.AudioContext || window.webkitAudioContext)()); if(A.state === 'suspended') A.resume();
    const o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, A.currentTime);
    g.gain.exponentialRampToValueAtTime(0.02 + amp * 0.012, A.currentTime + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + 1.0); o.connect(g).connect(A.destination); o.start(); o.stop(A.currentTime + 1.05); }catch(e){}
}

/* =====================================================================
   実験の 共通 しくみ
   ===================================================================== */
let E = null;
const EXRUN = {};         /* 実験ごとの 画面：{html(tab), after(root)} */
const LABDEF = {};        /* かんたん 実験（ミッション形式）：star → ミッション3つ */

async function expStart(id, daily){
  const e = EX(id); if(!e) return;
  if(!e.impl){ try{ toast('この 実験は つぎの アップデートで あそべるよ！'); }catch(er){} return; }
  const s = SC();
  if(tixLeft() < CFG.tixExp){ await modal(`<h3 class="sxMT">チケットが たりないよ</h3><p class="sxMP">ひらめきチケットは 1日 ${tixMax()}まい。あした また あそぼう！<br>ランクが 上がると ふえるよ。</p>`, [{t:'わかった', c:'', v:1}]); return; }
  const mx = expMaxStar(id), z = ZN(e.z);
  const btns = []; for(let st = e.st[0]; st <= e.st[1]; st++){ const open = st <= Math.max(e.st[0], mx + 1);
    btns.push(`<button class="sxPickB ${open ? '' : 'xLk'}" ${open ? `data-pick="${st}"` : 'disabled'}><b>★${st}</b><small>${open ? ptTxt('+' + CFG.expPt[st]) : '★' + (st - 1) + 'を クリア'}</small></button>`); }
  const r = await modal(`<div class="sxPickH"><img src="${IC(e.ic)}" alt=""><div><b>${X(e.n)}</b><small>${RB(e.d)}</small></div></div>
    <p class="sxMP">むずかしさを えらんでね（チケット ${CFG.tixExp}まい つかうよ）${daily ? '<br><b class="sxX2">きょうの ふしぎ：ポイント ×2！</b>' : ''}</p><div class="sxPick">${btns.join('')}</div>`, [{t:'やめる', c:'w', v:null}]);
  if(!r || !r.pick) return;
  s.d.used += CFG.tixExp; persist();
  const star = +r.pick; E = {id, star, daily:!!daily, kind:EXRUN[id] ? 'x' : 'lab', i:0, ok:0, tries:0, done:false, msg:null};
  if(!EXRUN[id]){ E.ms = LABDEF[id](star); E.ms.forEach(m => { if(m.choices){ const ca = m.choices[m.ans]; m.choices = shuf(m.choices); m.ans = m.choices.indexOf(ca); } }); E.vals = labVals(E.ms[0]); }
  else EXRUN[id].init(E);
  go('exp', {e:id, z:e.z});
}
SCREENS.exp = function(tab){
  const e = EX(V.e), z = ZN(e.z);
  if(!E) return {title:e.n, zc:z.c, cls:'exp', html:'<div class="sxNote">もういちど えらんでね</div>'};
  const inner = EXRUN[e.id] ? EXRUN[e.id].html(tab) : labHTML(tab);
  const tag = `<div class="sxExTop"><span class="sxLvTag" style="background:${z.c}">★${E.star}</span><b>${X(e.n)}</b>${E.daily ? '<span class="sxX2">×2</span>' : ''}</div>`;
  return {title:tab ? z.n : z.sh, zc:z.c, cls:'exp ' + e.id, html:tag + inner, after(root){ if(EXRUN[e.id] && EXRUN[e.id].after) EXRUN[e.id].after(root); }};
};
function expFinish(ok, total, note){
  const e = EX(E.id), s = SC(), star = E.star, need = Math.ceil(total * CFG.clearRate), clear = ok >= need;
  const lines = []; let base = CFG.expPt[star];
  const first = clear && !expClear(e.id, star);
  let sub = clear ? base : Math.round(base * 0.25);
  lines.push([clear ? `じっけん クリア（★${star}）` : `じっけん ちょうせん（★${star}）`, sub]);
  let x = 1;
  if(first){ const p = Math.round(sub * (CFG.firstX - 1)); lines.push([`はじめて クリア ボーナス（×${CFG.firstX}）`, p]); x += CFG.firstX - 1; }
  if(clear && E.daily && !s.d.dayEx){ const p = Math.round(sub * (CFG.dailyX - 1)); lines.push([`きょうの ふしぎ ボーナス（×${CFG.dailyX}）`, p]); x += CFG.dailyX - 1; s.d.dayEx = true; }
  const tot = sub * x, rb = RK().b; if(rb) lines.push([`ランク ボーナス（+${Math.round(rb * 100)}%）`, Math.round(tot * rb)]);
  const rkBefore = rankNo(), pt = award(tot, 'かがくかん じっけん');
  if(clear){ const rec = s.exp[e.id] || (s.exp[e.id] = {cl:{}}); rec.cl[star] = (rec.cl[star] || 0) + 1; }
  const card = clear ? dropCard(e.z, clamp01(0.7 + star * 0.04)) : null, badge = card ? badgeBonus(e.z) : null;
  persist();
  R = {kind:'e', zc:ZN(e.z).c, title:clear ? (ok === total ? 'パーフェクト！' : 'じっけん せいこう！') : 'もう すこし！', sub:`${e.n}　★${star}　${note || (ok + ' / ' + total)}`, lines, pt, card, badge, rankUp:rankNo() > rkBefore ? rankNo() : 0,
       again:{a:'expagain', id:e.id}, back:'zone', backO:{z:e.z}, next:nextReward(), clear, first};
  go('res');
}

/* ---------- かんたん 実験（ミッション形式） ---------- */
const labVals = m => { const v = {}; (m.ctrl || []).forEach(c => { v[c.k] = c.v; }); return v; };
function ctrlHTML(m, vals){
  return (m.ctrl || []).map(c => {
    if(c.type === 'tog') return `<div class="sxTg"><span>${c.l}</span><div class="sxSeg">${c.opts.map(o => `<button class="sxBtn sm ${vals[c.k] === o[0] ? '' : 'w'}" data-a="labt" data-k="${c.k}" data-v="${o[0]}" ${c.lock ? 'disabled' : ''}>${o[1]}</button>`).join('')}</div></div>`;
    return `<label class="sxSl"><span>${c.l}</span><input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${vals[c.k]}" ${c.lock ? 'disabled' : ''}><b data-kv="${c.k}">${c.fmt ? c.fmt(vals[c.k]) : vals[c.k]}${c.u || ''}</b></label>`;
  }).join('');
}
function labHTML(tab){
  const m = E.ms[E.i], vals = E.vals;
  const stage = `<div class="sxStage" id="sxStage">${m.view(vals, m)}</div>`;
  const head = `<div class="sxMis"><span class="sxMisN">ミッション ${E.i + 1} / ${E.ms.length}</span><p>${RB(m.text)}</p></div>`;
  const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいこう！' : E.done ? 'こたえは これ！' : 'おしい！'}</b><p>${RB(E.msg.t)}</p></div>` : '';
  const ch = m.choices ? `<div class="sxChG">${m.choices.map((c, i) => `<button class="sxCh ${E.picked === i ? (i === m.ans ? 'ok' : 'ng') : ''} ${E.done && i === m.ans ? 'ok' : ''}" data-a="labc" data-v="${i}" ${E.done ? 'disabled' : ''}>${RB(c)}</button>`).join('')}</div>` : '';
  const listen = m.listen ? `<button class="sxBtn v sm" data-a="lablisten">♪ おとを きく</button>` : '';
  const acts = E.done ? `<button class="sxBtn big" data-a="labnext">${E.i + 1 >= E.ms.length ? 'けっかへ' : 'つぎへ ▶'}</button>` : (m.choices ? '' : `<button class="sxBtn big" data-a="labgo">${m.go || 'けってい！'}</button>`);
  const ctl = `<div class="sxCtl" id="sxCtl">${ctrlHTML(m, vals)}</div>`;
  return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${head}${ctl}${listen}${ch}${fb}${acts}</div></div>` : `${stage}${head}${ctl}${listen}${ch}${fb}${acts}`;
}
function labRefresh(){ const m = E.ms[E.i], st = document.getElementById('sxStage'); if(st) st.innerHTML = m.view(E.vals, m);
  (m.ctrl || []).forEach(c => { const b = document.querySelector(`[data-kv="${c.k}"]`); if(b && c.type !== 'tog') b.textContent = (c.fmt ? c.fmt(E.vals[c.k]) : E.vals[c.k]) + (c.u || ''); }); }
function labGo(){
  const m = E.ms[E.i]; if(E.done) return; const r = m.check(E.vals);
  if(r.ok){ E.ok++; E.done = true; E.msg = {ok:true, t:m.explain}; snd('ok'); }
  else { E.tries++; if(E.tries >= 2){ E.done = true; E.msg = {ok:false, t:`${m.answer || ''}${m.explain || ''}`}; snd('ng'); } else { E.msg = {ok:false, t:r.msg || 'もう いちど ためして みよう！'}; snd('ng'); } }
  render();
}
function labChoice(i){
  const m = E.ms[E.i]; if(E.done) return;
  if(m.need){ const n = m.need(E.vals); if(n){ E.msg = {ok:false, t:n}; snd('ng'); return render(); } }
  E.picked = i; if(i === m.ans){ E.ok++; E.done = true; E.msg = {ok:true, t:m.explain}; snd('ok'); }
  else { E.tries++; if(E.tries >= 2){ E.done = true; E.msg = {ok:false, t:`こたえ：${m.choices[m.ans]}。${m.explain}`}; } else E.msg = {ok:false, t:m.hintNG || 'もう いちど 考えて みよう！'}; snd('ng'); }
  render();
}
function labNext(){
  if(E.i + 1 >= E.ms.length) return expFinish(E.ok, E.ms.length);
  E.i++; E.tries = 0; E.done = false; E.msg = null; E.picked = null; E.vals = labVals(E.ms[E.i]); render();
}

/* ===================== ばけがく：もこもこ ふうせん ===================== */
const gasOf = (soda, cit) => 3 * Math.min(soda / 252, cit / 192);       /* mol（重曹 84 g/mol・クエン酸 192 g/mol、3:1で 反応） */
function balloonView(v){
  const gas = gasOf(v.soda, v.cit), size = clampN(gas / 0.24 * 100, 0, 100), rad = 18 + Math.sqrt(size / 100) * 56;
  const leftS = Math.max(0, v.soda - gas / 3 * 252) , leftC = Math.max(0, v.cit - gas / 3 * 192);
  const fizz = size > 1 ? Array.from({length:6}, (_, i) => `<circle cx="${112 + i * 16}" cy="${236 - (i % 3) * 16}" r="${3 + i % 3}" fill="#fff" fill-opacity=".8"><animate attributeName="cy" from="244" to="204" dur="${(1 + i * .2).toFixed(1)}s" repeatCount="indefinite"/></circle>`).join('') : '';
  return SVGW(300, 300, `<rect x="2" y="2" width="296" height="296" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/>
    <ellipse cx="150" cy="${128 - rad * 0.55}" rx="${rad * 0.86}" ry="${rad}" fill="#F0709A" stroke="#C0457A" stroke-width="3"/><ellipse cx="${150 - rad * 0.3}" cy="${118 - rad * 0.75}" rx="${rad * 0.14}" ry="${rad * 0.26}" fill="#fff" fill-opacity=".55"/>
    <path d="M136 132h28v16h-28z" fill="#F0709A"/><rect x="132" y="146" width="36" height="12" rx="4" fill="#C9CED6" stroke="#8A929C" stroke-width="2"/>
    <path d="M118 158h64v14q0 10 10 18v70q0 22-22 22h-40q-22 0-22-22v-70q10-8 10-18z" fill="#DDF1FF" stroke="#7FB6E6" stroke-width="3"/>
    <path d="M100 232q0 20 22 20h56q22 0 22-20z" fill="${size > 1 ? '#CFEFFF' : '#E6F4FF'}"/>${fizz}`) +
    `<div class="sxGs">${gauge(size, 'ふくらみ', size > 92 ? '#E8414B' : '#F0709A')}<div class="sxLeft">のこり：重曹 ${r1(leftS)} g　クエン酸 ${r1(leftC)} g</div></div>`;
}
const BAL_SIZE = v => clampN(gasOf(v.soda, v.cit) / 0.24 * 100, 0, 100);
LABDEF.balloon = star => {
  const ms = [], sl = (k, l, mx, v = 0, st = 1, lock) => ({k, l, min:0, max:mx, step:st, v, u:' g', lock});
  const T = () => { const a = pick([30, 40, 50, 60]); return [a, a + 20]; };
  for(let n = 0; n < 3; n++){
    if(star === 2){ const [lo, hi] = T(); ms.push({text:`風船を ${lo}〜${hi}% の ふくらみに しよう。重曹と クエン酸の 量を えらんでね`, ctrl:[sl('soda', '重曹', 20), sl('cit', 'クエン酸', 20)], view:balloonView, check:v => { const s = BAL_SIZE(v); return s >= lo && s <= hi ? {ok:true} : {ok:false, msg:`いまは ${Math.round(s)}%。${s < lo ? 'もっと ふやして' : '少し へらして'} みよう`}; }, explain:`重曹と クエン酸が 反応して 二酸化炭素が 出る。量を ふやすと たくさん ふくらむよ。`, answer:'' }); }
    else if(star === 3){ const tot = pick([16, 20, 24]); const xs = tot * 252 / 444; const best = gasOf(xs, tot - xs);
      ms.push({text:`重曹と クエン酸を あわせて ${tot} g に する。いちばん 大きく ふくらむ わりあいを さがそう（さいだいの 92% いじょう）`, ctrl:[sl('soda', '重曹', tot, 2), sl('cit', 'クエン酸', tot, 2)], view:balloonView, check:v => v.soda + v.cit !== tot ? {ok:false, msg:`あわせて ${tot} g に しよう。いまは ${v.soda + v.cit} g`} : gasOf(v.soda, v.cit) >= best * 0.92 ? {ok:true} : {ok:false, msg:'どちらかが あまって いるよ。のこりが 少なく なる わりあいを さがそう'}, explain:`ちょうど 反応しきる 割合は 重曹：クエン酸 ≒ 252：192（約 1.3：1）。どちらも あまらない ところが 最大。`, answer:`重曹 ${r1(xs)} g、クエン酸 ${r1(tot - xs)} g の あたり。` }); }
    else { const c = pick([4, 6, 8, 10]), need = c / 192 * 252; ms.push({text:`クエン酸は ${c} g に きまって いる。重曹を ちょうど 使いきる（のこりが 出ない）量に しよう（±0.6 g）`, ctrl:[sl('soda', '重曹', 20, 0, .5), sl('cit', 'クエン酸', 20, c, 1, true)], view:balloonView, check:v => Math.abs(v.soda - need) <= 0.6 ? {ok:true} : {ok:false, msg:`重曹の のこりが ${r1(Math.max(0, v.soda - need))} g くらい ${v.soda > need ? 'あまって' : '足りなく'} いるよ`}, explain:`クエン酸 ${c} g と ちょうど 反応する 重曹は ${c}×252÷192 ≒ ${r1(need)} g。`, answer:`重曹 ${r1(need)} g。` }); }
  }
  return ms;
};

/* ===================== でんき：でんじしゃくを つくろう ===================== */
const CLIPS = (t, b) => Math.min(24, Math.floor(0.06 * t * b));
function emagView(v){
  const n = CLIPS(v.turns, v.batt), coils = Math.round(v.turns / 100 * 14);
  let c = ''; for(let i = 0; i < coils; i++) c += `<path d="M${76 + i * 9} 128q4-20 8 0" fill="none" stroke="#E08A2E" stroke-width="5" stroke-linecap="round"/>`;
  let clips = ''; for(let i = 0; i < n; i++){ const col = i % 8, row = Math.floor(i / 8); clips += `<g transform="translate(${96 + col * 18 - (row % 2) * 6} ${160 + row * 22})"><path d="M0 0v12a4 4 0 008 0V2" fill="none" stroke="#9AA3AE" stroke-width="3" stroke-linecap="round"/></g>`; }
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/>
    <rect x="60" y="112" width="190" height="22" rx="8" fill="#8A929C" stroke="#565E69" stroke-width="3"/>${c}<path d="M70 128H40V190" fill="none" stroke="#E8414B" stroke-width="4"/><path d="M250 128h26V190" fill="none" stroke="#3C93DC" stroke-width="4"/>${clips}
    ${batterySVG(20, 205, v.batt, 34)}`) + `<div class="sxGs">${gauge(n / 24 * 100, `もちあげた クリップ：${n}こ`, '#9B6CE0')}</div>`;
}
LABDEF.emag = star => {
  const ms = [], sl = (k, l, mn, mx, st, v, u, lock) => ({k, l, min:mn, max:mx, step:st, v, u, lock});
  const EXP = `クリップの 数は「まき数 × 電池の 数」に 比例する。どちらを ふやしても 磁力は 強く なるよ。`;
  for(let n = 0; n < 3; n++){
    if(star === 2){ const t = pick([8, 10, 12]); ms.push({text:`クリップを ${t}こ いじょう つり上げよう`, ctrl:[sl('turns', 'まき数', 0, 100, 10, 0, '回'), sl('batt', '電池', 1, 4, 1, 1, 'こ')], view:emagView, check:v => CLIPS(v.turns, v.batt) >= t ? {ok:true} : {ok:false, msg:`いまは ${CLIPS(v.turns, v.batt)}こ。まき数か 電池を ふやそう`}, explain:EXP, answer:''}); }
    else if(star === 3){ const lo = pick([6, 9, 12]), hi = lo + 2; ms.push({text:`クリップを ちょうど ${lo}〜${hi}こ つり上げよう（多すぎても ダメ！）`, ctrl:[sl('turns', 'まき数', 0, 100, 10, 0, '回'), sl('batt', '電池', 1, 4, 1, 1, 'こ')], view:emagView, check:v => { const c = CLIPS(v.turns, v.batt); return c >= lo && c <= hi ? {ok:true} : {ok:false, msg:`いまは ${c}こ。${c < lo ? 'もう少し 強く' : '少し 弱く'} しよう`}; }, explain:EXP, answer:''}); }
    else { const b = pick([2, 3]), lo = b === 2 ? pick([6, 9]) : pick([9, 12, 15]); ms.push({text:`電池は ${b}こ に きまって いる。まき数を かえて クリップを ${lo}〜${lo + 2}こ に しよう`, ctrl:[sl('turns', 'まき数', 0, 100, 10, 0, '回'), sl('batt', '電池', 1, 4, 1, b, 'こ', true)], view:emagView, check:v => { const c = CLIPS(v.turns, v.batt); return c >= lo && c <= lo + 2 ? {ok:true} : {ok:false, msg:`いまは ${c}こ`}; }, explain:EXP, answer:''}); }
  }
  return ms;
};

/* ===================== でんき：てまわし はつでん ===================== */
function generView(v){
  const rpm = v.rpm, bulb = clampN((rpm - 45) / 60, 0, 1), led = rpm >= 15 ? clampN(0.35 + rpm / 150, 0, 1) : 0, dur = rpm > 0 ? (120 / rpm).toFixed(2) : 0;
  const crank = `<g transform="translate(70 150)"><circle r="40" fill="#C9CED6" stroke="#565E69" stroke-width="4"/><circle r="8" fill="#565E69"/>${rpm > 0 ? `<animateTransform attributeName="transform" additive="sum" type="rotate" from="0" to="360" dur="${dur}s" repeatCount="indefinite"/>` : ''}<rect x="-6" y="-58" width="12" height="52" rx="5" fill="#B9773A" stroke="#7A4A1E" stroke-width="3"/><circle cy="-58" r="12" fill="#F2A33A" stroke="#B5701C" stroke-width="3"/></g>`;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/><rect x="26" y="196" width="90" height="26" rx="8" fill="#B9773A" stroke="#7A4A1E" stroke-width="3"/>${crank}
    <path d="M110 150H170M170 150V80H210M170 150V190H210" fill="none" stroke="#E8414B" stroke-width="5" stroke-linecap="round"/>${bulbSVG(236, 76, bulb, 1.3)}
    <circle cx="236" cy="188" r="${14 + led * 8}" fill="#7CFF9B" fill-opacity="${led * 0.5}"/><circle cx="236" cy="188" r="12" fill="${led ? '#4CE06A' : '#C8D8CC'}" stroke="#2F8A2F" stroke-width="3"/><text x="236" y="226" font-size="14" font-weight="900" text-anchor="middle" fill="#6B5A44">LED</text><text x="236" y="136" font-size="14" font-weight="900" text-anchor="middle" fill="#6B5A44">電球</text>`) +
    `<div class="sxGs">${gauge(rpm / 120 * 100, `ハンドルの はやさ：${rpm}`, '#F2A33A')}${gauge(bulb * 100, '電球の 明るさ', '#FFC93C')}${gauge(led * 100, 'LEDの 明るさ', '#4CB84C')}</div>`;
}
LABDEF.gener = star => {
  const rp = {k:'rpm', l:'ハンドルを 回す はやさ', min:0, max:120, step:5, v:0, u:' かい/分'};
  const Ms = {
    1:[{text:'ハンドルを 回して 電球を ひからせよう', check:v => v.rpm >= 45 ? {ok:true} : {ok:false, msg:'電球は ある 速さ いじょうで ひかるよ。もっと 速く！'}, explain:'速く 回すほど 電気が たくさん できる。電球は LEDより たくさん 必要。'}],
    2:[{text:'LEDだけ ひかって、電球は ひからない 速さに しよう', check:v => v.rpm >= 15 && v.rpm < 45 ? {ok:true} : {ok:false, msg:v.rpm < 15 ? 'LEDも まだ ひかって いないよ' : '電球まで ひかって しまった。少し ゆっくり'}, explain:'LEDは 少ない 電気でも ひかる。電球は 熱で 光るので たくさん 必要。'}],
    3:[{text:'電球を ちょうど いい 明るさ（50〜70%）に しよう', check:v => { const b = (v.rpm - 45) / 60 * 100; return b >= 50 && b <= 70 ? {ok:true} : {ok:false, msg:`いまは ${Math.max(0, Math.round(b))}%`}; }, explain:'回す 速さで 明るさを 調整 できる。電気を つくる 量が かわる から。'}]
  };
  return [0, 1, 2].map(i => Object.assign({ctrl:[Object.assign({}, rp)], view:generView, answer:''}, Ms[star][0], i ? {text:Ms[star][0].text + '（もう1かい！）'} : {}));
};

/* ===================== でんき：でんきの かいろ ===================== */
function ckSVG(v, m){
  const par = v.mode === 'p', on = v.sw === 1 && (v.wire !== 0);
  let lvA, lvB;
  if(m.single) { lvA = on ? 1 : 0; lvB = 0; } else { lvA = lvB = on ? (par ? 1 : 0.25) : 0; }
  const wire = (d, o = '') => `<path d="${d}" fill="none" stroke="${on ? '#E8414B' : '#B9A8A0'}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" ${o}/>`;
  let body;
  if(m.single){
    body = wire('M50 150V50H130M200 50H280V150V210H50V150') + (v.wire === 0 ? `<rect x="136" y="38" width="58" height="24" fill="#F4FBFF"/><path d="M130 50l10 0M194 50l10 0" stroke="#E8414B" stroke-width="6"/>` : '') + bulbSVG(165, 60, lvA, 1.5);
  } else if(par){
    body = wire('M50 150V50H280V210H50V150M120 50V90M120 150V210M210 50V90M210 150V210') + bulbSVG(120, 110, lvA, 1.1) + bulbSVG(210, 110, lvB, 1.1);
  } else {
    body = wire('M50 150V50H100M150 50H190M240 50H280V210H50V150') + bulbSVG(125, 56, lvA, 1.1) + bulbSVG(215, 56, lvB, 1.1);
  }
  const sw = `<g transform="translate(58 190)"><rect x="0" y="12" width="44" height="12" rx="4" fill="#9AA3AE" stroke="#565E69" stroke-width="2.5"/><line x1="6" y1="14" x2="${v.sw ? 38 : 34}" y2="${v.sw ? 14 : -6}" stroke="#3A3F47" stroke-width="5" stroke-linecap="round"/></g>`;
  return `<rect x="2" y="2" width="326" height="246" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/>${body}${sw}${batterySVG(30, 120, 1, 40)}`;
}
function ammeter(I){ const a = clampN(I / 1.5, 0, 1) * 180 - 90; return `<g transform="translate(250 190)"><path d="M-50 0A50 50 0 0150 0" fill="#fff" stroke="#4A3420" stroke-width="4"/><line x1="0" y1="0" x2="${Math.sin(a * Math.PI / 180) * 40}" y2="${-Math.cos(a * Math.PI / 180) * 40}" stroke="#E8414B" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#4A3420"/><rect x="-34" y="8" width="68" height="24" rx="6" fill="#222"/><text y="26" font-size="16" font-weight="900" text-anchor="middle" fill="#7CFF9B">${(Math.round(I * 100) / 100).toFixed(2)}A</text></g>`; }
function ckView(v, m){
  if(m.calc){ const Rt = m.calc(v), I = (v.sw ? 1 : 0) * (1.5 * v.bat) / Rt;
    const rs = m.res(v);
    return SVGW(330, 250, `<rect x="2" y="2" width="326" height="246" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/>${batterySVG(26, 20, v.bat || 1, 34)}<text x="30" y="82" font-size="15" font-weight="900" fill="#6B5A44">電池 ${(1.5 * (v.bat || 1)).toFixed(1)} V</text>
      ${rs}${ammeter(I)}`);
  }
  return SVGW(330, 250, ckSVG(v, m));
}
let resBox = (x, y, r, lab) => `<g transform="translate(${x} ${y})"><path d="M0 14h14l5-12 8 24 8-24 8 24 8-24 5 12h14" fill="none" stroke="#9B6CE0" stroke-width="4" stroke-linejoin="round"/><text x="35" y="46" font-size="15" font-weight="900" text-anchor="middle" fill="#4A3420">${lab || r + 'Ω'}</text></g>`;
LABDEF.circuit = star => {
  const swc = {type:'tog', k:'sw', l:'スイッチ', opts:[[0, 'OFF'], [1, 'ON']], v:0}, mod = {type:'tog', k:'mode', l:'つなぎかた', opts:[['s', 'ちょくれつ'], ['p', 'へいれつ']], v:'s'};
  const ms = [];
  if(star === 1){
    const W = {type:'tog', k:'wire', l:'どうせん', opts:[[0, 'はずす'], [1, 'つなぐ']], v:0};
    for(let i = 0; i < 3; i++) ms.push({single:1, text:'どうせんを つないで、スイッチを ONに して 豆電球を ひからせよう', ctrl:[W, swc], view:ckView, check:v => v.wire === 1 && v.sw === 1 ? {ok:true} : {ok:false, msg:v.wire === 0 ? 'どうせんが とぎれて いるよ。つなごう' : 'スイッチを ONに しよう'}, explain:'電気の 通り道が ぐるっと 1つの 輪に なると 電流が 流れて ひかる。', answer:''});
  } else if(star === 2){
    for(let i = 0; i < 3; i++) ms.push({text:'2この 豆電球を どちらも 明るく ひからせよう（つなぎかたを えらんで ON）', ctrl:[mod, swc], view:ckView, check:v => v.mode === 'p' && v.sw ? {ok:true} : {ok:false, msg:!v.sw ? 'スイッチを ONに しよう' : '直列だと 暗いね。つなぎかたを かえて みよう'}, explain:'へいれつ つなぎは 電球ごとに 電池の 力が そのまま かかるので 明るい。', answer:'へいれつ に して ON。'});
  } else if(star === 3){
    const Q = [['ちょくれつ と へいれつ。電球が 明るいのは どっち？（つなぎかたを かえて ONで くらべよう）', ['へいれつ', 'ちょくれつ', 'おなじ'], 0, '同じ 電池・同じ 電球なら、へいれつの ほうが 明るい。直列は 電圧を 2こで 分けあう。'],
      ['電池の もちが よいのは、ちょくれつ と へいれつの どっち？（ヒント：電池から 流れる 電流の 大きさ）', ['ちょくれつ', 'へいれつ', 'おなじ'], 0, '直列は 電流が 小さい ので 電池が 長持ちする。並列は 電流が 2倍に なって 早く なくなる。'],
      ['直列に つないだ とき、1この 電球を はずすと もう1こは？', ['消える', '明るくなる', 'かわらない'], 0, '直列は 輪が とぎれる ので 全部 消える。並列は 1この ほうが ついたまま。']];
    Q.forEach(q => ms.push({text:q[0], ctrl:[mod, swc], view:ckView, choices:q[1], ans:q[2], explain:q[3], hintNG:'つなぎかたを かえて、くらべて みよう！'}));
  } else if(star === 4){
    for(let i = 0; i < 3; i++){ const nb = ri(1, 4), R = pick([5, 10, 15, 20, 30]), tgt = Math.round(1.5 * nb / R * 1000) / 1000;
      ms.push({calc:v => v.R, res:v => resBox(120, 60, v.R), text:`電流計が ${tgt.toFixed(2)} A（±0.02）を さす ように、電池の 数と 抵抗を えらぼう。スイッチは ON！`, ctrl:[{k:'bat', l:'電池（1.5V）', min:1, max:4, step:1, v:1, u:'こ'}, {k:'R', l:'抵抗', min:5, max:30, step:5, v:30, u:' Ω'}, {type:'tog', k:'sw', l:'スイッチ', opts:[[0, 'OFF'], [1, 'ON']], v:1}], view:ckView, check:v => { const I = 1.5 * v.bat / v.R; return Math.abs(I - tgt) <= 0.021 ? {ok:true} : {ok:false, msg:`いまは ${I.toFixed(2)} A。${I < tgt ? '電池を ふやすか 抵抗を へらす' : '電池を へらすか 抵抗を ふやす'} と どうかな？`}; }, explain:`オームの 法則 I＝V÷R。たとえば ${nb}こ（${1.5 * nb} V）と ${R} Ω なら I＝${1.5 * nb}÷${R}＝${tgt.toFixed(2)} A。`, answer:`たとえば 電池 ${nb}こ と ${R} Ω。`}); }
  } else {
    for(let i = 0; i < 3; i++){ const mode = pick(['s', 'p']), R2 = pick([3, 6, 12, 15, 30]), r1v = 6, Rt = mode === 's' ? r1v + R2 : r1v * R2 / (r1v + R2), tgt = Math.round(6 / Rt * 100) / 100;
      ms.push({calc:v => v.mode === 's' ? 6 + v.R2 : 6 * v.R2 / (6 + v.R2), res:v => `<text x="30" y="110" font-size="14" font-weight="900" fill="#6B5A44">${v.mode === 's' ? 'ちょくれつ' : 'へいれつ'}</text>${v.mode === 's' ? resBox(20, 120, 6) + resBox(110, 120, v.R2) : `<path d="M20 124H90" stroke="#E8414B" stroke-width="3"/>` + resBox(20, 90, 6) + resBox(20, 150, v.R2)}`,
        text:`電池 6V（4こ）に、6Ω と もう1つの 抵抗 R を つなぐ。電流計が ${tgt.toFixed(2)} A（±0.05）に なる ように、つなぎかたと R を えらぼう`, ctrl:[{type:'tog', k:'mode', l:'つなぎかた', opts:[['s', 'ちょくれつ'], ['p', 'へいれつ']], v:'s'}, {k:'R2', l:'抵抗 R', min:3, max:30, step:3, v:3, u:' Ω'}, {k:'bat', l:'電池', min:4, max:4, step:1, v:4, lock:true, u:'こ'}, {type:'tog', k:'sw', l:'スイッチ', opts:[[1, 'ON']], v:1}], view:ckView,
        check:v => { const Rt2 = v.mode === 's' ? 6 + v.R2 : 6 * v.R2 / (6 + v.R2), I = 6 / Rt2; return Math.abs(I - tgt) <= 0.051 ? {ok:true} : {ok:false, msg:`いまは ${I.toFixed(2)} A`}; }, explain:`${mode === 's' ? '直列：R合計＝6＋' + R2 : '並列：1/R合計＝1/6＋1/' + R2}。I＝6V÷R合計＝${tgt.toFixed(2)} A。`, answer:`たとえば ${mode === 's' ? 'ちょくれつ' : 'へいれつ'}・R＝${R2} Ω。`});
    }
  }
  return ms;
};

/* ===================== くるま：ギアめいじん ===================== */
function gearView(v, m){
  const inRpm = m.rpm || 60, out = inRpm * v.a / v.b, r1p = 14 + v.a * 1.7, r2p = 14 + v.b * 1.7, cx1 = 20 + r1p * 1.16, cx2 = cx1 + r1p * 1.16 + r2p * 1.16 - 4;
  const W = cx2 + r2p * 1.16 + 20, H = Math.max(r1p, r2p) * 2.4 + 30, cy = H / 2;
  const half = Math.PI / v.b * 180 / Math.PI;
  return SVGW(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/>${gearSVG(v.a, r1p, cx1, cy, 0, '#3C93DC', true, 1, inRpm)}${gearSVG(v.b, r2p, cx2, cy, half, '#F2A33A', true, -1, out)}`) +
    `<div class="sxGs"><div class="sxGg"><b>入力（青）</b>${v.a}歯　${inRpm} 回転/分</div><div class="sxGg"><b>出力（オレンジ）</b>${v.b}歯　${r1(out)} 回転/分</div><div class="sxGg">力（トルク）は 入力の ${r1(v.b / v.a)}倍</div></div>`;
}
LABDEF.gear = star => {
  const ctl = () => [{k:'a', l:'入力ギア（青）の 歯の数', min:8, max:40, step:2, v:20, u:'歯'}, {k:'b', l:'出力ギア（オレンジ）の 歯の数', min:8, max:60, step:2, v:20, u:'歯'}];
  const ms = [];
  for(let i = 0; i < 3; i++){
    if(star === 2) ms.push({rpm:60, text:'出力ギアを 入力ギアより「速く」回そう（出力の 回転数 ＞ 入力）', ctrl:ctl(), view:gearView, check:v => v.a > v.b ? {ok:true} : {ok:false, msg:'出力ギアの 歯を 入力より 少なく すると 速く 回るよ'}, explain:'歯が 少ない ほうが 速く 回る。出力＝入力×（入力の 歯 ÷ 出力の 歯）。', answer:''});
    else if(star === 3){ const o = pick([[2, 120], [3, 180], [0.5, 30]]); ms.push({rpm:60, text:`入力 60回転/分 で、出力を ${o[1]}回転/分（±5）に しよう`, ctrl:ctl(), view:gearView, check:v => Math.abs(60 * v.a / v.b - o[1]) <= 5 ? {ok:true} : {ok:false, msg:`いまは ${r1(60 * v.a / v.b)}回転/分`}, explain:`出力＝入力×（入力の 歯÷出力の 歯）。${o[1]}÷60＝${o[1] / 60} なので 歯の 比は 入力：出力＝${o[1] / 60}：1 の 逆。`, answer:`入力の 歯 ÷ 出力の 歯 ＝ ${o[1] / 60} に しよう。`}); }
    else if(star === 4){ const k = pick([2, 3, 4]); ms.push({rpm:60, text:`力（トルク）を 入力の ${k}倍に したい。出力の 回転は ${60 / k}回転/分（±3）に なるよ。歯の 数を えらぼう`, ctrl:ctl(), view:gearView, check:v => Math.abs(v.b / v.a - k) < 0.08 ? {ok:true} : {ok:false, msg:`いまの 力は ${r1(v.b / v.a)}倍`}, explain:'出力の 歯が 入力の k倍 だと、力は k倍、回転は 1/k倍に なる。', answer:`出力の 歯を 入力の ${k}倍に しよう。`}); }
    else { const lim = pick([40, 44, 48]); ms.push({rpm:90, text:`入力 90回転/分 を、出力 45回転/分 に したい。ただし 2つの ギアの 歯の 合計は ${lim}歯 いかに しよう（場所が せまい！）`, ctrl:ctl(), view:gearView, check:v => Math.abs(90 * v.a / v.b - 45) <= 2 && v.a + v.b <= lim ? {ok:true} : {ok:false, msg:v.a + v.b > lim ? `合計が ${v.a + v.b}歯。おおきすぎるよ` : `いまの 出力は ${r1(90 * v.a / v.b)}回転/分`}, explain:'出力の 歯が 入力の 2倍 なら 回転は 半分。小さな ギアで 作れば 合計の 歯数も おさえられる。', answer:'たとえば 入力 12歯・出力 24歯。'}); }
  }
  return ms;
};

/* ===================== ひかり：プリズムで にじ ===================== */
const SPEC = [['#E5183A', '赤'], ['#FF8A1F', '橙'], ['#FFD21A', '黄'], ['#4CB84C', '緑'], ['#2FB6E8', '水色'], ['#3C5BE0', '青'], ['#9B4FD6', '紫']];
function prismView(v, m){
  if(m.mix){ const on = c => v[c] ? 1 : 0, R = on('r'), G = on('g'), B = on('b');
    const circ = (x, y, c, a) => `<circle cx="${x}" cy="${y}" r="62" fill="${c}" opacity="${a}" style="mix-blend-mode:screen"/>`;
    return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#10121C"/>${R ? circ(118, 100, '#FF0000', 1) : ''}${G ? circ(182, 100, '#00FF00', 1) : ''}${B ? circ(150, 156, '#0000FF', 1) : ''}
      <text x="150" y="246" font-size="15" font-weight="900" text-anchor="middle" fill="#fff">${R && G && B ? 'まんなか：白！' : (R && G ? '重なり：黄色' : G && B ? '重なり：水色（シアン）' : R && B ? '重なり：赤むらさき（マゼンタ）' : '')}</text>`); }
  const ang = v.ang, spread = 14 + Math.min(1, ang / 45) * 74, full = ang >= 30 && ang <= 60;
  const fil = v.f, show = SPEC.map((c, i) => (!fil || fil === 'none') ? true : fil === 'r' ? i <= 1 : fil === 'g' ? i === 3 : i >= 5);
  let bands = ''; SPEC.forEach((c, i) => { const y = 120 - spread / 2 + (i + .5) * spread / 7, vis = show[i] && (full || Math.abs(i - 3) <= 1 + (ang > 20 ? 1 : 0)); if(vis) bands += `<path d="M168 128L292 ${y - 5}L292 ${y + 5}Z" fill="${c[0]}" opacity=".95"/>`; });
  const beamY = 128 + (ang - 45) * 0.6;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#10121C"/><rect x="14" y="${beamY - 5}" width="30" height="10" rx="4" fill="#C9CED6"/><path d="M44 ${beamY}L150 128" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path d="M150 74L190 150H110z" fill="#BFE7FF" fill-opacity=".55" stroke="#fff" stroke-width="3"/>${bands}${fil && fil !== 'none' ? `<rect x="64" y="${beamY - 14}" width="8" height="28" fill="${fil === 'r' ? '#E5183A' : fil === 'g' ? '#4CB84C' : '#3C5BE0'}" opacity=".8"/>` : ''}
    <text x="150" y="240" font-size="14" font-weight="900" text-anchor="middle" fill="#fff">${full ? '7色 ぜんぶ 見える！' : 'まだ 一部 しか 見えない'}</text>`);
}
LABDEF.prism = star => {
  const ang = {k:'ang', l:'光を 当てる 角度', min:10, max:80, step:5, v:10, u:'°'}, flt = {type:'tog', k:'f', l:'フィルター', opts:[['none', 'なし'], ['r', '赤'], ['g', '緑'], ['b', '青']], v:'none'};
  const ms = [];
  const tgl = (c, n) => ({type:'tog', k:c, l:n, opts:[[0, 'OFF'], [1, 'ON']], v:0});
  for(let i = 0; i < 3; i++){
    if(star === 1) ms.push({text:'角度を かえて、にじを 7色 ぜんぶ 見えるように しよう', ctrl:[ang], view:prismView, check:v => v.ang >= 30 && v.ang <= 60 ? {ok:true} : {ok:false, msg:'角度を もう少し かえて みよう'}, explain:'白い 光は 7色の 光が まざった もの。プリズムに ちょうどよい 角度で 入ると ひろく 分かれる。', answer:'30〜60° くらい。'});
    else if(star === 2){ const q = [['赤い フィルターを 通すと、スクリーンに のこる 色は？（フィルターを かえて ためそう）', {r:['赤っぽい 色だけ', '7色ぜんぶ', '青だけ', '白']}], ['緑の フィルターを 通すと、のこる 色は？', {g:['緑だけ', '赤だけ', '7色ぜんぶ', '紫だけ']}], ['青い フィルターを 通すと、のこる 色は？', {b:['青っぽい 色だけ', '赤だけ', '7色ぜんぶ', '黄色だけ']}]][i]; const k = Object.keys(q[1])[0];
      ms.push({text:q[0], ctrl:[{k:'ang', l:'光を 当てる 角度', min:10, max:80, step:5, v:45, u:'°'}, flt], view:prismView, choices:q[1][k], ans:0, explain:'色フィルターは その 色の 光だけを 通す。赤い フィルターには 赤っぽい 光だけ。', hintNG:'フィルターを かえて スクリーンを 見て みよう！'}); }
    else if(star === 3) ms.push({mix:1, text:'光の 三原色（赤・緑・青）の ライトを ぜんぶ ONに して、白い 光に しよう', ctrl:[tgl('r', '赤ライト'), tgl('g', '緑ライト'), tgl('b', '青ライト')], view:prismView, check:v => v.r && v.g && v.b ? {ok:true} : {ok:false, msg:'3つ ぜんぶ ONに して 重ねて みよう'}, explain:'赤・緑・青の 光を 全部 重ねると 白に なる（光の 加法混色）。', answer:'3つ ぜんぶ ON。'});
    else { const Q = [['赤と 緑の ライトを 重ねると？', ['黄色', '白', '青', 'むらさき'], 0, 'r', 'g'], ['緑と 青を 重ねると？', ['水色（シアン）', '黄色', '赤', '白'], 0, 'g', 'b'], ['赤と 青を 重ねると？', ['赤むらさき（マゼンタ）', '緑', '黄色', '白'], 0, 'r', 'b']][i];
      ms.push({mix:1, text:Q[0] + '（ライトを ONに して たしかめよう）', ctrl:[tgl('r', '赤ライト'), tgl('g', '緑ライト'), tgl('b', '青ライト')], view:prismView, choices:Q[1], ans:Q[2], explain:'光は 重ねるほど 明るく なる。赤＋緑＝黄、緑＋青＝水色、青＋赤＝赤むらさき。', hintNG:'ライトを ONに して 重なりの 色を 見よう！'}); }
  }
  return ms;
};

/* ===================== ひかり：おとの なみ ===================== */
function waveView(v, m){
  const f = v.f, A = v.A, cyc = f * 0.01, H = 24 + A * 7; let d = 'M0 130';
  for(let x = 0; x <= 300; x += 3) d += `L${x} ${130 - Math.sin(x / 300 * cyc * 2 * Math.PI) * H}`;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#10121C"/><line x1="0" y1="130" x2="300" y2="130" stroke="#4A5470" stroke-width="2" stroke-dasharray="6 6"/><path d="${d}" fill="none" stroke="#7CE3FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="150" y="30" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" opacity=".85">↓ 10ミリ秒（0.01秒）ぶんの 波 ↓</text>${m.showT ? `<text x="150" y="238" font-size="16" font-weight="900" text-anchor="middle" fill="#FFE08A">1回の ふるえ（周期）＝ ${m.period} ミリ秒</text>` : `<text x="150" y="238" font-size="16" font-weight="900" text-anchor="middle" fill="#FFE08A">${f} Hz</text>`}`) +
    `<div class="sxGs">${gauge((f - 100) / 900 * 100, `音の 高さ：${f} Hz`, '#7CE3FF')}${gauge(A * 10, '音の 大きさ', '#FFC93C')}</div>`;
}
LABDEF.wave = star => {
  const ctl = (lockA) => [{k:'f', l:'振動数（音の 高さ）', min:100, max:1000, step:10, v:300, u:' Hz'}, {k:'A', l:'振幅（音の 大きさ）', min:1, max:10, step:1, v:5, lock:lockA}];
  const ms = [];
  for(let i = 0; i < 3; i++){
    if(star === 2) ms.push({text:i === 1 ? '低い 音（400Hz いか）に しよう' : '高い 音（600Hz いじょう）に しよう', listen:1, ctrl:ctl(), view:waveView, check:v => i === 1 ? (v.f <= 400 ? {ok:true} : {ok:false, msg:'もっと 低く！'}) : (v.f >= 600 ? {ok:true} : {ok:false, msg:'もっと 高く！'}), explain:'波の 山が 多いほど（振動数が 大きい ほど）高い 音に なる。', answer:''});
    else if(star === 3) ms.push({text:'「ラ」の 音（440Hz・±25）に しよう。おとを きいて たしかめて みよう', listen:1, ctrl:ctl(), view:waveView, check:v => Math.abs(v.f - 440) <= 25 ? {ok:true} : {ok:false, msg:`いまは ${v.f}Hz`}, explain:'ラの 音は 1秒に 440回 ふるえる 音（440Hz）。', answer:'440Hz。'});
    else if(star === 4){ const b = pick([220, 300, 400, 440]); ms.push({text:`${b}Hz の 1オクターブ 上の 音（${b * 2}Hz・±${Math.max(20, b * 0.05 | 0)}）に しよう`, listen:1, ctrl:ctl(), view:waveView, check:v => Math.abs(v.f - b * 2) <= Math.max(20, b * 0.05 | 0) ? {ok:true} : {ok:false, msg:`いまは ${v.f}Hz`}, explain:'1オクターブ 上は 振動数が 2倍。波の 山が ちょうど 2倍に ふえる。', answer:`${b * 2}Hz。`}); }
    else { const Hz = pick([200, 250, 400, 500]), T = Math.round(1000 / Hz * 10) / 10; ms.push({showT:1, period:T, text:`1回の ふるえ（周期）が ${T}ミリ秒（${T / 1000}秒）の 音に しよう。振動数は 1÷周期`, listen:1, ctrl:ctl(), view:waveView, check:v => Math.abs(v.f - Hz) <= Math.max(10, Hz * 0.04) ? {ok:true} : {ok:false, msg:`いまは ${v.f}Hz。1÷${T / 1000}秒 を 計算しよう`}, explain:`振動数＝1÷周期＝1÷${T / 1000}＝${Hz}Hz。`, answer:`${Hz}Hz。`}); }
  }
  return ms;
};

/* ===================== うちゅう：ロケット はっしゃ ===================== */
const VE = 4.0, DRY = 20, dvOf = (f, p) => VE * Math.log((DRY + p + f) / (DRY + p));
function rocketView(v){
  const dv = dvOf(v.fuel, v.pay), h = clampN(dv / 12, 0, 1);
  const mark = (x, t) => `<line x1="${x}" y1="22" x2="${x}" y2="238" stroke="#FFC93C" stroke-width="2" stroke-dasharray="5 4"/><text x="${x}" y="16" font-size="11" font-weight="900" text-anchor="middle" fill="#FFE08A">${t}</text>`;
  const x = 20 + h * 250;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0E1530"/>${[...Array(18)].map((_, i) => `<circle cx="${(i * 53) % 290 + 5}" cy="${(i * 37) % 230 + 14}" r="1.6" fill="#fff" opacity=".7"/>`).join('')}
    ${mark(20 + 7.9 / 12 * 250, '7.9')}${mark(20 + 11.2 / 12 * 250, '11.2')}
    <g transform="translate(${x} 150)"><path d="M0 -12L34 0L0 12L-26 12L-26 -12Z" fill="#fff" stroke="#8A929C" stroke-width="2"/><path d="M34 0L18 -8V8z" fill="#E8414B"/><path d="M-26 -12l-16 -10v44l16 -10z" fill="#E8414B"/><circle cx="6" cy="0" r="5" fill="#3C93DC"/>${dv > 0.2 ? `<path d="M-26 -8L-52 0L-26 8z" fill="#FFB02E"><animate attributeName="d" values="M-26 -8L-52 0L-26 8z;M-26 -8L-64 0L-26 8z;M-26 -8L-52 0L-26 8z" dur=".3s" repeatCount="indefinite"/></path>` : ''}</g>
    <text x="150" y="250" font-size="14" font-weight="900" text-anchor="middle" fill="#fff">速さの ふえかた：${r1(dv)} km/秒</text>`) +
    `<div class="sxGs"><div class="sxGg">ロケット（空）20 t ＋ ペイロード ${v.pay} t ＋ 燃料 ${v.fuel} t ＝ ${20 + v.pay + v.fuel} t</div></div>`;
}
LABDEF.rocket = star => {
  const ctl = (pay, lockP, maxP = 20, maxF = 500) => [{k:'fuel', l:'燃料', min:0, max:maxF, step:5, v:0, u:' t'}, {k:'pay', l:'ペイロード（荷物）', min:0, max:maxP, step:1, v:pay, u:' t', lock:lockP}];
  const ms = [], pmax = f => { const r = Math.exp(7.9 / VE); return Math.floor((DRY + f - r * DRY) / (r - 1)); };
  for(let i = 0; i < 3; i++){
    if(star === 2){ const p = [5, 8, 10][i], need = (DRY + p) * (Math.exp(7.9 / VE) - 1); ms.push({text:`ペイロード ${p} t を のせて、地球の まわりを まわる 速さ（第一宇宙速度 7.9 km/秒）に 届かせよう`, ctrl:ctl(p, true), view:rocketView, check:v => dvOf(v.fuel, v.pay) >= 7.9 ? {ok:true} : {ok:false, msg:`いまは ${r1(dvOf(v.fuel, v.pay))} km/秒。燃料が たりないよ`}, explain:'ロケットの 速さは 燃料が 多いほど、荷物が 軽いほど 大きく なる（ロケット方程式）。', answer:`燃料は ${Math.ceil(need)} t くらい 必要。`}); }
    else if(star === 3){ const p = [15, 12, 18][i], need = (DRY + p) * (Math.exp(7.9 / VE) - 1); ms.push({text:`ペイロードが ${p} t と 重い！ それでも 7.9 km/秒 に 届かせよう`, ctrl:ctl(p, true), view:rocketView, check:v => dvOf(v.fuel, v.pay) >= 7.9 ? {ok:true} : {ok:false, msg:`いまは ${r1(dvOf(v.fuel, v.pay))} km/秒`}, explain:'荷物が 重いと その ぶん 燃料も たくさん いる。', answer:`燃料は ${Math.ceil(need)} t くらい。`}); }
    else if(star === 4){ const p = [5, 3, 8][i], need = (DRY + p) * (Math.exp(11.2 / VE) - 1); ms.push({text:`ペイロード ${p} t。こんどは 地球を 脱出する 速さ（第二宇宙速度 11.2 km/秒）に 届かせよう`, ctrl:ctl(p, true), view:rocketView, check:v => dvOf(v.fuel, v.pay) >= 11.2 ? {ok:true} : {ok:false, msg:`いまは ${r1(dvOf(v.fuel, v.pay))} km/秒`}, explain:'速さを 上げるほど 必要な 燃料は ぐんぐん ふえる（対数の 関係）。', answer:`燃料は ${Math.ceil(need)} t くらい。`}); }
    else if(star === 5){ const p = [10, 6, 14][i], need = (DRY + p) * (Math.exp(7.9 / VE) - 1); ms.push({text:`ペイロード ${p} t。7.9 km/秒 に 届く、いちばん 少ない 燃料（＋10 t いない）に しよう`, ctrl:ctl(p, true), view:rocketView, check:v => dvOf(v.fuel, v.pay) >= 7.9 && v.fuel <= need + 10 ? {ok:true} : {ok:false, msg:dvOf(v.fuel, v.pay) < 7.9 ? `いまは ${r1(dvOf(v.fuel, v.pay))} km/秒。足りない` : '燃料が 多すぎる！ 重くなる ぶん むだだよ'}, explain:'燃料が 多すぎても 重く なって むだに なる。ちょうど いい 量を さがそう。', answer:`燃料は ${Math.ceil(need)}〜${Math.ceil(need) + 10} t。`}); }
    else { const F = [400, 300, 350][i], pm = pmax(F); ms.push({text:`燃料は ${F} t しか つめない。7.9 km/秒に 届く ままで、ペイロードを いちばん 重く しよう！`, ctrl:ctl(0, false, 80, F).map(c => c.k === 'fuel' ? Object.assign(c, {v:F, lock:true}) : c), view:rocketView, check:v => dvOf(v.fuel, v.pay) >= 7.9 && v.pay >= pm ? {ok:true} : {ok:false, msg:dvOf(v.fuel, v.pay) < 7.9 ? '重すぎて 7.9 km/秒に 届かないよ' : 'まだ 荷物を ふやせるよ'}, explain:'速さの 式 Δv＝ve×ln(はじめの 質量÷おわりの 質量) から、荷物の 上限が きまる。', answer:`ペイロードは ${pm} t。`}); }
  }
  return ms;
};

/* ===================== うちゅう：じしん ハンター ===================== */
function quakeView(v, m){
  const d = v.d, R = d / 200 * 105;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#EAF6FF" stroke="#BFDDEE" stroke-width="3"/><path d="M30 190q60-40 120-10t120-40v90H30z" fill="#BFE8B0"/>
    ${[40, 80, 120, 160, 200].map(k => `<circle cx="150" cy="120" r="${k / 200 * 105}" fill="none" stroke="#9FD3EE" stroke-width="1.5" stroke-dasharray="4 4"/><text x="${150 + k / 200 * 105 * 0.71}" y="${120 - k / 200 * 105 * 0.71}" font-size="10" fill="#6B8CA8">${k}km</text>`).join('')}
    <circle cx="150" cy="120" r="${R}" fill="#E8414B" fill-opacity=".14" stroke="#E8414B" stroke-width="4"/><g transform="translate(150 120)"><path d="M-8 10L0 -12L8 10z" fill="#3C93DC" stroke="#1F5FAE" stroke-width="2"/></g><text x="150" y="148" font-size="12" font-weight="900" text-anchor="middle" fill="#1F5FAE">観測点</text>
    <g transform="translate(${150 + R * 0.71} ${120 + R * 0.71})"><circle r="9" fill="#E8414B" stroke="#fff" stroke-width="3"/><path d="M-14 0l-6-6M14 0l6-6M0 -14v-8" stroke="#E8414B" stroke-width="3"/></g>
    <text x="150" y="246" font-size="14" font-weight="900" text-anchor="middle" fill="#4A3420">しんげんまでの きょり（予想）：${d} km</text>`) + (m.dt ? `<div class="sxGs"><div class="sxGg">観測点で P波が 来て から S波が 来る までの 時間（初期微動継続時間）＝ <b>${m.dt}秒</b>　${m.k ? `（この 地域：P波 6 km/秒・S波 3 km/秒）` : ''}</div></div>` : '');
}
LABDEF.quake = star => {
  const ms = [], ctl = [{k:'d', l:'しんげんまでの きょり', min:0, max:200, step:2, v:0, u:' km'}];
  for(let i = 0; i < 3; i++){
    if(star === 3){ const dt = [10, 6, 14][i]; ms.push({dt, text:`初期微動継続時間が ${dt}秒 だった。大森公式（きょり ≒ 8 km/秒 × 時間）で しんげんまでの きょりを 予想しよう（±10 km）`, ctrl:ctl, view:quakeView, check:v => Math.abs(v.d - 8 * dt) <= 10 ? {ok:true} : {ok:false, msg:`いまは ${v.d} km。8 × ${dt} を 計算しよう`}, explain:`きょり ≒ 8 × ${dt}＝${8 * dt} km。`, answer:`${8 * dt} km。`}); }
    else if(star === 4){ const dt = ri(5, 18); ms.push({dt, text:`S－P時間が ${dt}秒。しんげんまでの きょりを 予想しよう（±8 km）`, ctrl:ctl, view:quakeView, check:v => Math.abs(v.d - 8 * dt) <= 8 ? {ok:true} : {ok:false, msg:`いまは ${v.d} km`}, explain:`きょり ≒ 8 × ${dt}＝${8 * dt} km。`, answer:`${8 * dt} km。`}); }
    else if(star === 5){ const d = pick([48, 72, 96, 120, 144]), dt = d / 8, ch = shuf([dt, dt * 2, dt / 2, dt + 6]).map(x => r1(x) + '秒'); ms.push({dt:0, d0:d, text:`しんげんから ${d} km の 観測点で、S－P時間は およそ 何秒？（大森公式 8 km/秒）。地図で きょりを たしかめよう`, ctrl:[{k:'d', l:'しんげんまでの きょり', min:0, max:200, step:2, v:d, u:' km', lock:true}], view:quakeView, choices:ch, ans:ch.indexOf(r1(dt) + '秒'), explain:`時間 ≒ きょり ÷ 8 ＝ ${d} ÷ 8 ＝ ${dt}秒。`, hintNG:'きょり ÷ 8 を 計算しよう！'}); }
    else { const dt = pick([8, 10, 12, 15]); ms.push({dt, k:1, text:`この 地域の P波は 6 km/秒、S波は 3 km/秒。初期微動継続時間が ${dt}秒 なら しんげんまでの きょりは？（±4 km）。ヒント：きょり×(1/3 − 1/6)＝時間`, ctrl:ctl, view:quakeView, check:v => Math.abs(v.d - 6 * dt) <= 4 ? {ok:true} : {ok:false, msg:`いまは ${v.d} km`}, explain:`S波は きょり÷3、P波は きょり÷6 かかる。差＝きょり÷6 ＝ ${dt} より きょり＝${6 * dt} km。`, answer:`${6 * dt} km。`}); }
  }
  return ms;
};

/* ===================== いのち：こうごうせい たんけん ===================== */
const PH = v => Math.min(v.light, v.co2, v.water * 1.5) / 10;
function photoView(v){
  const n = Math.round(PH(v)), lim = v.light <= v.co2 && v.light <= v.water * 1.5 ? '光' : v.co2 <= v.water * 1.5 ? '二酸化炭素' : '水';
  const bub = Array.from({length:Math.min(10, n)}, (_, i) => `<circle cx="${120 + (i * 17) % 70}" cy="150" r="${4 + i % 3}" fill="#fff" fill-opacity=".85"><animate attributeName="cy" from="${190 - (i % 4) * 6}" to="${96 + (i % 3) * 8}" dur="${(1.2 + i * .13).toFixed(2)}s" repeatCount="indefinite"/></circle>`).join('');
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/><circle cx="${40 + v.light * 0.9}" cy="34" r="${10 + v.light * 0.12}" fill="#FFD84A" opacity="${0.35 + v.light / 160}"/>
    <rect x="90" y="86" width="120" height="150" rx="14" fill="#CFEFFF" fill-opacity="${0.4 + v.water / 200}" stroke="#7FB6E6" stroke-width="3"/>${bub}
    <path d="M150 232V150" stroke="#4CB84C" stroke-width="6" stroke-linecap="round"/><path d="M150 190q-34-6-40-36q34 0 40 36zM150 168q30-4 38-32q-32 0-38 32z" fill="#4CB84C" stroke="#2F8A2F" stroke-width="2"/>
    <text x="150" y="252" font-size="13" font-weight="900" text-anchor="middle" fill="#4A3420">あわの 数：1分に ${n}こ</text>`) +
    `<div class="sxGs">${gauge(n * 10, `あわ（酸素）：${n} こ/分`, '#4CB84C')}<div class="sxGg">いちばん 足りない 条件（限定要因）：<b>${n >= 10 ? '（ぜんぶ たっぷり）' : lim}</b></div></div>`;
}
LABDEF.photo = star => {
  const ctl = (l, w, c, lk) => [{k:'light', l:'光の 強さ', min:0, max:100, step:10, v:l, lock:lk && lk.includes('l')}, {k:'water', l:'水の 量', min:0, max:100, step:10, v:w, lock:lk && lk.includes('w')}, {k:'co2', l:'二酸化炭素', min:0, max:100, step:10, v:c, lock:lk && lk.includes('c')}];
  const ms = [];
  for(let i = 0; i < 3; i++){
    if(star === 3){ const t = [6, 8, 5][i]; ms.push({text:`あわ（酸素）が 1分に ${t}こ いじょう 出る ように、光・水・二酸化炭素を 調整しよう`, ctrl:ctl(0, 0, 0), view:photoView, check:v => PH(v) >= t ? {ok:true} : {ok:false, msg:`いまは ${Math.round(PH(v))}こ。いちばん 足りない 条件を ふやそう`}, explain:'光合成は 光・水・二酸化炭素が そろって はじめて たくさん 進む。', answer:''}); }
    else if(star === 4){ const t = [8, 7, 9][i]; ms.push({text:`光は 90、水は 70 に 固定。あわを ${t}こ/分 いじょうに するには、何を ふやせば よいかな？`, ctrl:ctl(90, 70, 20 + i * 10, 'lw'), view:photoView, check:v => PH(v) >= t ? {ok:true} : {ok:false, msg:`いまは ${Math.round(PH(v))}こ。光や 水を ふやしても あわは ふえないよ。足りないのは？`}, explain:'いちばん 足りない 条件（限定要因）を ふやさないと、ほかを ふやしても 光合成は 速く ならない。', answer:'二酸化炭素を ふやす。'}); }
    else { const Q = [['光を いくら 強くしても あわが ふえない（光100、二酸化炭素20、水80）。その 理由は？', ['二酸化炭素が 足りなくて それが 限定要因だから', '光が 強すぎて 葉が 休むから', '水が 多すぎるから', '酸素が 多すぎるから'], 0], ['光 20、二酸化炭素 90、水 80。あわを ふやすには？', ['光を 強くする', '二酸化炭素を ふやす', '水を ふやす', 'どれでも 同じ'], 0], ['水 10、光 80、二酸化炭素 80 の とき、いちばん 足りない 条件は？', ['水', '光', '二酸化炭素', 'ない'], 0]][i];
      const init = [[100, 80, 20], [20, 80, 90], [80, 10, 80]][i];
      ms.push({text:Q[0] + '（スライダーで たしかめて 答えよう）', ctrl:ctl(init[0], init[1], init[2]), view:photoView, choices:Q[1], ans:Q[2], explain:'光合成の 速さは、いちばん 足りない 条件（限定要因）で きまる。', hintNG:'スライダーを うごかして あわの 数を くらべて みよう！'}); }
  }
  return ms;
};

/* ===================== いのち：けんびきょうで のぞこう ===================== */
const SAMPLES = {
  onion:{n:'タマネギの 皮', e:'れんがの ように ならんだ 細胞。1つ1つに 核が あるよ。', ds:['オオカナダモの 葉', 'ゾウリムシ', 'ミジンコ']},
  elodea:{n:'オオカナダモの 葉', e:'緑の つぶ（葉緑体）が たくさん 見える 植物の 細胞。', ds:['タマネギの 皮', 'ゾウリムシ', 'ミジンコ']},
  paramecium:{n:'ゾウリムシ', e:'くつの ような 形で、毛（せん毛）で 泳ぐ 1つの 細胞の 生き物。', ds:['タマネギの 皮', 'ミジンコ', 'オオカナダモの 葉']},
  daphnia:{n:'ミジンコ', e:'体が すけて いて 心臓が 動くのが 見える 小さな 甲殻類。', ds:['ゾウリムシ', 'タマネギの 皮', 'オオカナダモの 葉']}
};
function sampleSVG(k, mag){
  const z = mag / 100; let s = '';
  if(k === 'onion'){ for(let r = 0; r < 6; r++) for(let c = 0; c < 6; c++){ const x = 18 + c * 44 * z + (r % 2) * 22 * z, y = 18 + r * 28 * z; s += `<rect x="${x}" y="${y}" width="${42 * z}" height="${26 * z}" rx="3" fill="#EBDCF5" stroke="#9B6CE0" stroke-width="2"/><circle cx="${x + 24 * z}" cy="${y + 13 * z}" r="${4 * z}" fill="#7A4FB8"/>`; } }
  else if(k === 'elodea'){ for(let r = 0; r < 5; r++) for(let c = 0; c < 6; c++){ const x = 14 + c * 46 * z, y = 14 + r * 36 * z; s += `<rect x="${x}" y="${y}" width="${44 * z}" height="${34 * z}" rx="6" fill="#D9F2C8" stroke="#4CB84C" stroke-width="2"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${x + (8 + (i * 9) % 30) * z}" cy="${y + (8 + (i * 7) % 20) * z}" r="${3.5 * z}" fill="#2F9A4C"/>`).join('')}`; } }
  else if(k === 'paramecium'){ s = `<g transform="translate(150 125) rotate(-18) scale(${z * 1.4})"><ellipse rx="86" ry="34" fill="#E8F2DA" stroke="#7BA05A" stroke-width="3"/>${[...Array(24)].map((_, i) => { const a = i / 24 * Math.PI * 2; return `<line x1="${Math.cos(a) * 86}" y1="${Math.sin(a) * 34}" x2="${Math.cos(a) * 96}" y2="${Math.sin(a) * 40}" stroke="#7BA05A" stroke-width="2"/>`; }).join('')}<circle cx="-14" cy="0" r="14" fill="#F2D27A" stroke="#C98A12" stroke-width="2"/><ellipse cx="34" cy="2" rx="14" ry="9" fill="#C9E0F0" stroke="#6B9DC0" stroke-width="2"/></g>`; }
  else { s = `<g transform="translate(150 125) scale(${z * 1.2})"><ellipse rx="70" ry="46" fill="#EAF6FF" stroke="#6B9DC0" stroke-width="3"/><circle cx="-38" cy="-12" r="9" fill="#222"/><ellipse cx="6" cy="2" rx="14" ry="12" fill="#E8414B" opacity=".85"><animate attributeName="ry" values="12;8;12" dur=".6s" repeatCount="indefinite"/></ellipse><path d="M-60 -20q-50-26-70-4M-60 -26q-40-34-62-22" fill="none" stroke="#6B9DC0" stroke-width="3"/><ellipse cx="-30" cy="22" rx="30" ry="10" fill="#F2D27A" opacity=".8"/></g>`; }
  return s;
}
function microView(v, m){
  const blur = Math.abs(v.focus - m.best) / 100 * 9, id = 'f' + Math.random().toString(36).slice(2, 6);
  return SVGW(300, 260, `<defs><filter id="${id}"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter><clipPath id="c${id}"><circle cx="150" cy="125" r="112"/></clipPath></defs><rect x="2" y="2" width="296" height="256" rx="22" fill="#10121C"/>
    <g clip-path="url(#c${id})"><rect x="38" y="13" width="224" height="224" fill="#F8F8EC"/><g filter="url(#${id})">${sampleSVG(m.sample, v.mag)}</g></g><circle cx="150" cy="125" r="112" fill="none" stroke="#9AA3AE" stroke-width="8"/>
    <text x="150" y="252" font-size="13" font-weight="900" text-anchor="middle" fill="#fff">${blur < 1.2 ? 'くっきり 見える！' : 'ぼやけて いる…（ピントを あわせよう）'}</text>`);
}
LABDEF.micro = star => {
  const keys = shuf(Object.keys(SAMPLES)), ms = [];
  for(let i = 0; i < 3; i++){
    const k = star === 2 ? ['onion', 'paramecium', 'daphnia'][i] : keys[i], S = SAMPLES[k], ch = shuf([S.n].concat(S.ds));
    const ctl = [{k:'focus', l:'ピント', min:0, max:100, step:1, v:ri(0, 20)}, {type:'tog', k:'mag', l:'倍率', opts:[[60, '×40'], [100, '×100'], [160, '×400']], v:100}];
    ms.push({sample:k, best:ri(40, 85), text:star >= 4 ? 'ピントを あわせて、倍率を ×100 に して、なにを 見て いるか 当てよう' : 'ピントを あわせて、なにを 見て いるか 当てよう', ctrl:ctl, view:microView, choices:ch, ans:ch.indexOf(S.n), explain:S.e,
      need:v => Math.abs(v.focus - ms[i].best) > 12 ? 'ぼやけて いて よく 見えないよ。ピントを あわせて みよう' : (star >= 4 && v.mag !== 100 ? '倍率を ×100 に しよう' : null)});
  }
  return ms;
};

/* =====================================================================
   実験：ほのおの 色あて（炎色反応）
   ===================================================================== */
function burnerSVG(color, lit, w = 190){
  const lt = c => { const h = c.replace('#', ''), r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return `rgb(${Math.round(r + (255 - r) * .6)},${Math.round(g + (255 - g) * .6)},${Math.round(b + (255 - b) * .6)})`; };
  const flame = lit ? `<ellipse cx="100" cy="110" rx="100" ry="120" fill="${color}" fill-opacity=".28"/><path class="sxFl" d="M100 12C124 60 156 92 150 140C145 180 118 196 100 196C82 196 55 180 50 140C44 92 76 60 100 12Z" fill="${color}" style="transition:fill .6s"/><path d="M100 66C116 98 134 118 130 150C127 174 112 186 100 186C88 186 73 174 70 150C66 118 84 98 100 66Z" fill="${lt(color)}"/><path d="M100 122C108 140 116 150 113 166C111 178 105 184 100 184C95 184 89 178 87 166C84 150 92 140 100 122Z" fill="#7FB8FF" fill-opacity=".85"/>` : `<path d="M100 130C108 146 114 156 112 170C110 180 105 186 100 186C95 186 90 180 88 170C86 156 92 146 100 130Z" fill="#4A9CFF" fill-opacity=".9"/>`;
  return `<svg class="sxBurner" viewBox="-30 -24 260 354" width="${w}">${flame}<rect x="86" y="196" width="28" height="22" rx="4" fill="#B7BDC6" stroke="#6B7480" stroke-width="3"/><rect x="80" y="216" width="40" height="64" rx="8" fill="#9AA3AE" stroke="#6B7480" stroke-width="3"/><rect x="74" y="238" width="52" height="12" rx="4" fill="#E8414B"/>
    <ellipse cx="100" cy="296" rx="62" ry="18" fill="#7B848F" stroke="#565E69" stroke-width="3"/><rect x="38" y="286" width="124" height="10" fill="#7B848F"/><ellipse cx="100" cy="286" rx="62" ry="16" fill="#9AA3AE" stroke="#565E69" stroke-width="3"/></svg>`;
}
const dishSVG = (col, w = 84) => `<svg viewBox="0 0 80 50" width="${w}"><ellipse cx="40" cy="38" rx="34" ry="9" fill="#D9DDE3"/><path d="M6 30h68q-4 16-34 16T6 30z" fill="#fff" stroke="#9AA3AE" stroke-width="2.5"/><path d="M18 30q22-26 44 0z" fill="${col}" stroke="#fff" stroke-width="1.5"/></svg>`;
const LOOK = {Li:['Sr', 'Ca'], Sr:['Li', 'Ca'], Na:['Ca', 'Ba'], Ca:['Na', 'Li'], Ba:['Na', 'Cu'], Cu:['Ba', 'K'], K:['Cu', 'Li']};
const FK = k => FLAME.find(f => f.k === k);
EXRUN.flame = {
  init(E){
    const ms = shuf(FLAME).slice(0, 5), star = E.star;
    E.rounds = ms.map(m => {
      const type = star === 4 ? 'B' : 'A'; let pool;
      if(type === 'A') pool = star >= 3 ? [m.k].concat(LOOK[m.k]).concat([pick(FLAME.filter(f => f.k !== m.k && !LOOK[m.k].includes(f.k)).map(f => f.k))]) : shuf(FLAME.map(f => f.k).filter(k => k !== m.k)).slice(0, 3).concat([m.k]);
      else pool = [m.k].concat(shuf(FLAME.filter(f => f.k !== m.k)).slice(0, 3).map(f => f.k));
      return {k:m.k, type, ch:shuf(pool)};
    });
    E.on = false; E.picked = null; E.done = false; E.msg = null;
  },
  html(tab){
    const r = E.rounds[E.i], m = FK(r.k), star = E.star, lit = E.on || (r.type === 'B' && E.done);
    const dishCol = r.type === 'A' ? '#E8E4D8' : m.col, flameCol = lit ? m.col : '#4A9CFF';
    const found = SC().flame;
    const stage = `<div class="sxStage fl"><div class="sxFlW">${burnerSVG(flameCol, lit, tab ? 210 : 170)}<div class="sxFlD">${dishSVG(dishCol)}<b>${r.type === 'A' ? 'ようき A' : X(m.n)}</b></div></div>
      ${r.type === 'A' && !E.on && !E.done ? `<button class="sxBtn big go" data-a="flput">金属の 粉を 炎に 入れる！</button>` : ''}</div>`;
    const notes = star <= 4 ? `<div class="sxNotes"><b>ノート</b><div>${FLAME.map(f => `<span class="sxNt ${found[f.k] ? 'on' : ''}" style="--fc:${f.col}"><i>${found[f.k] ? f.k : '?'}</i><small>${found[f.k] ? f.n + '：' + f.cn : '？？？'}</small></span>`).join('')}</div></div>` : '<div class="sxNotes"><b>ノートは 見られない！</b> 色を よく おぼえよう</div>';
    const q = r.type === 'A' ? 'この 炎の 色は、どの 金属 かな？' : `${m.n} の 炎の 色は？`;
    const choice = r.type === 'A' ? r.ch.map((k, i) => `<button class="sxCh ${E.done ? (k === r.k ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="flc" data-v="${i}" ${E.done || (!E.on && !E.flash) ? 'disabled' : ''}>${RB(FK(k).n)}</button>`).join('')
      : r.ch.map((k, i) => `<button class="sxCh sw ${E.done ? (k === r.k ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="flc" data-v="${i}" ${E.done ? 'disabled' : ''}><i style="background:${FK(k).col}"></i></button>`).join('');
    const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいかい！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
    const side = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / ${E.rounds.length}</span><p>${RB(r.type === 'A' && !E.on && !E.done && !E.flash ? 'ようき A の 粉を 炎に 入れると、炎の 色が かわるよ。ためして みよう！' : q)}</p></div><div class="sxChG ${r.type === 'B' ? 'sw' : ''}">${choice}</div>${fb}${E.done ? `<button class="sxBtn big" data-a="flnext">${E.i + 1 >= E.rounds.length ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}${notes}
      <div class="sxNote">※ ほんものの 炎色反応は 先生と いっしょに！ アプリの 中だけで あんぜんに 体験しよう。</div>`;
    return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`;
  },
  put(){ const r = E.rounds[E.i]; E.on = true; SC().flame[r.k] = 1; persist(); snd('tap'); render(); if(E.star >= 5){ const i = E.i; setTimeout(() => { if(E && E.id === 'flame' && E.i === i && !E.done){ E.on = false; E.flash = true; render(); } }, 1300); } },
  pick(i){ const r = E.rounds[E.i]; if(E.done || (r.type === 'A' && !E.on && !E.flash)) return; E.picked = i; E.done = true; const ok = r.ch[i] === r.k, m = FK(r.k);
    if(ok){ E.ok++; snd('ok'); } else snd('ng'); SC().flame[r.k] = 1; persist(); E.msg = {ok, t:`${m.n} の 炎の 色は ${m.cn}。${m.k === 'Na' ? '黄色は とても 目立つ 色だよ。' : m.k === 'Cu' ? '花火の 青緑にも 使われるよ。' : m.k === 'Sr' ? '花火の 赤に 使われるよ。' : m.k === 'Ba' ? '花火の 緑に 使われるよ。' : ''}`}; render(); },
  next(){ if(E.i + 1 >= E.rounds.length) return expFinish(E.ok, E.rounds.length); E.i++; E.on = false; E.flash = false; E.picked = null; E.done = false; E.msg = null; render(); }
};

/* =====================================================================
   実験：車を くみたてよう
   ===================================================================== */
const PARTS = [['engine', 'エンジン', 'card_car_engine'], ['tire', 'タイヤ', 'card_car_tire'], ['body', 'ボディ', ''], ['seat', 'シート', ''], ['wheel', 'ハンドル', 'card_car_wheel']];
const DECOY = [['brake', 'ブレーキ', 'card_car_jack'], ['light', 'ライト', 'card_car_light']];
const CCOL = {red:'#E8414B', orange:'#F2A33A', yellow:'#F7D548', green:'#4CB84C', blue:'#3C93DC', purple:'#9B6CE0'};
function asmSVG(step, col, w = 320){
  const c = CCOL[col] || '#E8414B';
  let s = `<rect x="8" y="104" width="224" height="16" rx="7" fill="#6B7480"/><rect x="8" y="104" width="224" height="6" rx="3" fill="#8A929C"/>`;
  if(step >= 1) s += `<rect x="168" y="78" width="52" height="28" rx="6" fill="#9AA3AE" stroke="#565E69" stroke-width="3"/><rect x="176" y="68" width="10" height="12" fill="#E8414B"/><rect x="194" y="68" width="10" height="12" fill="#E8414B"/>`;
  if(step >= 2) s += [56, 184].map(x => `<circle cx="${x}" cy="118" r="20" fill="#2B2B33"/><circle cx="${x}" cy="118" r="9" fill="#C9CED6"/>`).join('');
  if(step >= 3) s += `<path d="M14 104V76q0-10 12-13l30-8q16-20 40-20h50q22 0 36 20l30 8q18 4 18 18v23z" fill="${c}" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><path d="M82 52q10-14 30-14h44q16 0 28 14z" fill="#CDEBFA" stroke="#fff" stroke-width="2"/><path d="M134 38v14" stroke="#fff" stroke-width="3"/><circle cx="226" cy="80" r="7" fill="#FFE98A"/>`;
  if(step >= 4) s += `<rect x="96" y="56" width="26" height="18" rx="6" fill="#8A5A2B" opacity=".9"/>`;
  if(step >= 5) s += `<circle cx="150" cy="64" r="9" fill="none" stroke="#2B2B33" stroke-width="4"/>`;
  return `<svg class="sxAsm" viewBox="0 0 240 150" width="${w}"><rect x="0" y="132" width="240" height="14" rx="6" fill="#5A626D"/>${s}</svg>`;
}
function asmTimer(){
  clearInterval(TM); TM = setInterval(() => { if(!E || E.id !== 'assemble' || E.phase !== 'build'){ clearInterval(TM); return; }
    const left = Math.max(0, E.limit - (Date.now() - E.t0) / 1000), f = document.getElementById('sxTF'), l = document.getElementById('sxTL');
    if(f) f.style.width = left / E.limit * 100 + '%'; if(l) l.textContent = Math.ceil(left);
    if(left <= 0){ clearInterval(TM); TM = 0; EXRUN.assemble.end(false, 'じかんぎれ…'); } }, 200);
}
EXRUN.assemble = {
  init(E){
    const st = E.star; E.limit = {2:45, 3:35, 4:30, 5:28, 6:70}[st]; E.maxMiss = st === 2 ? 3 : 2; E.target = st === 6 ? 3 : 1; E.cnt = 0; E.step = 0; E.miss = 0; E.color = 'red'; E.eng = 'gas';
    E.phase = 'build'; E.t0 = Date.now(); E.decoy = st >= 4; E.hint = st === 2; E.tray = st === 2 ? PARTS.slice() : shuf(PARTS.concat(E.decoy ? DECOY : [])); E.shake = null;
  },
  html(tab){
    const st = E.star, next = PARTS[E.step] && PARTS[E.step][0];
    if(E.phase === 'inspect') return this.inspHTML(tab);
    const tray = E.tray.map(p => `<button class="sxPart ${E.hint && p[0] === next ? 'hint' : ''}" data-a="asm" data-v="${p[0]}"><span>${p[2] ? `<img src="${IC(p[2])}" alt="">` : (p[0] === 'body' ? `<i class="sxBody" style="background:${CCOL[E.color]}"></i>` : `<i class="sxSeat"></i>`)}</span><b>${p[1]}</b></button>`).join('');
    const sw = Object.keys(CCOL).map(k => `<button class="sxSw ${E.color === k ? 'on' : ''}" data-a="asmc" data-v="${k}" style="background:${CCOL[k]}"></button>`).join('');
    const tg = [['gas', 'ガソリン'], ['ev', 'でんき'], ['hyb', 'ハイブリッド']].map(o => `<button class="sxBtn sm ${E.eng === o[0] ? '' : 'w'}" data-a="asme" data-v="${o[0]}">${o[1]}</button>`).join('');
    const perf = { gas:[60, 55, 40], ev:[50, 60, 85], hyb:[55, 50, 70] }[E.eng];
    const stage = `<div class="sxStage asm"><div class="sxAsmW ${E.shake ? 'shake' : ''}">${asmSVG(E.step, E.color, tab ? 400 : 330)}<div class="sxGhost">${E.step < 5 ? `つぎ：${PARTS[E.step][1]}` : 'かんせい！'}</div></div>
      <div class="sxConv"></div><div class="sxAsmMeta">車 ${E.cnt + 1} / ${E.target}　ミス ${'♥'.repeat(Math.max(0, E.maxMiss - E.miss))}${'♡'.repeat(E.miss)}</div></div>`;
    const tm = `<div class="sxTimer"><span>のこり <b id="sxTL">${Math.ceil(Math.max(0, E.limit - (Date.now() - E.t0) / 1000))}</b> びょう</span><div class="sxBar2 bl"><i id="sxTF" style="width:${Math.max(0, 100 - (Date.now() - E.t0) / 10 / E.limit)}%"></i></div></div>`;
    const side = `<div class="sxMis"><span class="sxMisN">${st === 6 ? '3台を 時間内に！' : 'じゅんばんどおりに！'}</span><p>${RB(E.hint ? '光って いる 部品を じゅんばんに タッチしよう。' : '正しい じゅんばん（エンジン→タイヤ→ボディ→シート→ハンドル）で 部品を はめよう。')}</p></div>
      <div class="sxTray">${tray}</div><div class="sxAsmOpt"><div><span>ボディの 色</span>${sw}</div><div><span>エンジン</span>${tg}</div>
      <div class="sxPerf">${gauge(perf[0], 'パワー', '#F2A33A')}${gauge(perf[1], 'スピード', '#3C93DC')}${gauge(perf[2], 'エコ', '#4CB84C')}</div></div>`;
    return `${tm}` + (tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`);
  },
  after(){ if(E.phase === 'build') asmTimer(); },
  tap(k){
    if(E.phase !== 'build') return; const need = PARTS[E.step][0];
    if(k === need){ E.step++; snd('tap'); if(E.step >= 5){ E.cnt++; if(E.cnt >= E.target){ clearInterval(TM); return E.star >= 5 ? this.startInspect() : this.end(true); } E.step = 0; } render(); }
    else { E.miss++; snd('ng'); E.shake = 1; render(); setTimeout(() => { if(E){ E.shake = null; } }, 300); if(E.miss > E.maxMiss){ clearInterval(TM); this.end(false, 'ミスが おおすぎた…'); } }
  },
  startInspect(){
    const n = 4, bad = shuf([0, 1, 2, 3]).slice(0, ri(1, 2)); E.phase = 'inspect'; E.insp = {bad, sel:[], cars:Array.from({length:n}, (_, i) => ({bad:bad.includes(i), miss:pick(['tire', 'door'])}))}; E.t0 = Date.now(); render();
  },
  inspHTML(tab){
    const I = E.insp, cars = I.cars.map((c, i) => { const col = ['red', 'blue', 'green', 'yellow'][i];
      return `<button class="sxInsp ${I.sel.includes(i) ? 'sel' : ''}" data-a="asmi" data-v="${i}">${this.carFinal(c, col)}<i>${I.sel.includes(i) ? 'ふりょう！' : ''}</i></button>`; }).join('');
    return `<div class="sxMis"><span class="sxMisN">けんさ</span><p>${RB('ラインを 流れてきた 車の 中から、ふりょうひん（タイヤが 足りない・ドアが ない 車）を 全部 えらぼう！')}</p></div><div class="sxInspG">${cars}</div><button class="sxBtn big" data-a="asmicheck">けんさ かんりょう！</button>`;
  },
  carFinal(c, col){ let s = asmSVG(5, col, 160); if(c.bad && c.miss === 'tire') s = s.replace(/<circle cx="184" cy="118" r="20"[^>]*\/><circle cx="184" cy="118" r="9"[^>]*\/>/, ''); if(c.bad && c.miss === 'door') s = s.replace(/<path d="M82 52[^>]*\/><path d="M134 38[^>]*\/>/, '<rect x="82" y="40" width="100" height="26" fill="#2B2B33" opacity=".55"/>'); return s; },
  inspTog(i){ const I = E.insp, p = I.sel.indexOf(i); if(p >= 0) I.sel.splice(p, 1); else I.sel.push(i); snd('tap'); render(); },
  inspCheck(){ const I = E.insp, a = I.bad.slice().sort().join(), b = I.sel.slice().sort().join(); this.end(a === b, a === b ? '' : 'ふりょうひんを まちがえた…'); },
  async end(ok, why){
    clearInterval(TM); TM = 0; E.phase = 'done';
    if(ok){ const r = giveCar(E.color), cn = CARS.find(c => c.k === E.color).n;
      await modal(`<div class="sxMArt"><img src="${IC('car_' + E.color)}" alt=""></div><h3 class="sxMT">車が かんせい！</h3><p class="sxMP">${r === 'ok' ? `あたらしい「じぶんの くるま（${cn}）」が まちを 走るよ！` : r === 'max' ? 'じぶんの くるまは 3台まで。いっぱい つくった ね！ ポイントは もらえるよ' : 'まちの のりもの わくが いっぱい。まちを おおきく すると 走れるよ'}</p>`, [{t:'やったー！', c:'', v:1}]); snd('fan'); try{ confetti(1600); }catch(e){} }
    else { await modal(`<h3 class="sxMT">ざんねん…</h3><p class="sxMP">${why || ''}<br>もういちど ちょうせん しよう！</p>`, [{t:'OK', c:'', v:1}]); }
    expFinish(ok ? 1 : 0, 1, ok ? '車が かんせい！' : '');
  }
};

/* =====================================================================
   実験：エンジンの ひみつ
   ===================================================================== */
const pistonYFor = deg => { const a = deg * Math.PI / 180, r = 28, L = 156, cy = 320, pin = cy - r * Math.cos(a), dx = r * Math.sin(a); return pin - Math.sqrt(L * L - dx * dx) - 36; };
function engineSVG(deg, mode, w = 300){
  const d = ((deg % 720) + 720) % 720, stroke = Math.floor(d / 180), py = pistonYFor(d), a = (d - 90) * Math.PI / 180, pc = [150, 320], r = 28, px = pc[0] + r * Math.cos(a), pyy = pc[1] + r * Math.sin(a);
  if(mode === 'ev'){ const rot = d / 720 * 360 * 2;
    return `<svg viewBox="0 0 300 400" width="${w}"><rect x="40" y="40" width="220" height="150" rx="14" fill="#3A3F47" stroke="#1E2126" stroke-width="4"/><text x="150" y="70" font-size="20" font-weight="900" text-anchor="middle" fill="#7CFF9B">バッテリー</text><path d="M150 190V240" stroke="#E8414B" stroke-width="8"/>
      <circle cx="150" cy="300" r="64" fill="#C9CED6" stroke="#565E69" stroke-width="5"/><g transform="rotate(${rot} 150 300)"><circle cx="150" cy="300" r="40" fill="#E8EAF0" stroke="#8A929C" stroke-width="3"/><rect x="140" y="262" width="20" height="26" fill="#E8414B"/><rect x="140" y="312" width="20" height="26" fill="#3C93DC"/><circle cx="150" cy="300" r="8" fill="#565E69"/></g><text x="150" y="392" font-size="15" font-weight="900" text-anchor="middle" fill="#fff">モーター：ピストンも バルブも ないよ</text></svg>`; }
  const iv = stroke === 0 ? 92 : 82, ev = stroke === 3 ? 92 : 82, burn = stroke === 2, fl = burn ? Math.max(0.35, 1 - (d - 360) / 220) : 0, spark = (d >= 350 && d <= 385) && mode === 'gas';
  const topWord = ['吸気', '圧縮', '燃焼', '排気'][stroke];
  return `<svg viewBox="0 0 300 400" width="${w}"><rect x="70" y="52" width="160" height="214" rx="10" fill="#CBD3DC" stroke="#6B7A88" stroke-width="4"/><rect x="90" y="86" width="120" height="180" fill="#F3F8FC" stroke="#6B7A88" stroke-width="3"/>
    ${stroke === 0 ? '<rect x="90" y="90" width="120" height="170" fill="#BFE8FF" opacity=".55"/>' : ''}${stroke === 3 ? '<rect x="90" y="90" width="120" height="170" fill="#B9B9C2" opacity=".5"/>' : ''}
    <rect x="70" y="40" width="160" height="50" rx="10" fill="#9AA7B4" stroke="#6B7A88" stroke-width="4"/>
    <path d="M70 70H20" stroke="#7FC8F8" stroke-width="16" stroke-linecap="round"/><path d="M230 70h50" stroke="#B9B9C2" stroke-width="16" stroke-linecap="round"/>
    <rect x="106" y="${iv - 30}" width="8" height="30" fill="#3C93DC"/><rect x="96" y="${iv}" width="28" height="6" rx="3" fill="#3C93DC"/><rect x="186" y="${ev - 30}" width="8" height="30" fill="#E8414B"/><rect x="176" y="${ev}" width="28" height="6" rx="3" fill="#E8414B"/>
    ${mode === 'diesel' ? `<path d="M143 14h14v38l-7 14l-7-14z" fill="#E8414B" stroke="#A82A33" stroke-width="2.5"/>${stroke === 1 && d > 300 ? '<path d="M150 66v10" stroke="#FFB02E" stroke-width="3"/>' : ''}` : `<rect x="143" y="14" width="14" height="44" rx="3" fill="#E7E2D3" stroke="#8A7A65" stroke-width="2.5"/><rect x="147" y="58" width="6" height="30" fill="#6B7480"/>`}
    ${spark ? `<path d="M150 80l6 12 12 2-9 8 3 12-12-6-12 6 3-12-9-8 12-2z" fill="#FFD84A" stroke="#E8801A" stroke-width="2"/>` : ''}
    ${burn ? `<path d="M150 92C170 100 196 112 194 ${Math.max(py - 4, 126)}H106C104 112 130 100 150 92Z" fill="#FFB02E" opacity="${fl}"/><path d="M150 104C162 112 178 120 176 ${Math.max(py - 4, 126)}H124C122 120 138 112 150 104Z" fill="#FFE04A" opacity="${fl}"/>` : ''}
    <line x1="150" y1="${py + 36}" x2="${px}" y2="${pyy}" stroke="#6B7480" stroke-width="12" stroke-linecap="round"/><rect x="92" y="${py}" width="116" height="40" rx="6" fill="#AEB8C4" stroke="#6B7A88" stroke-width="3.5"/>
    ${[8, 16].map(k => `<line x1="92" y1="${py + k}" x2="208" y2="${py + k}" stroke="#6B7A88" stroke-width="3"/>`).join('')}<circle cx="150" cy="${py + 26}" r="6" fill="#6B7A88"/>
    <circle cx="${pc[0]}" cy="${pc[1]}" r="46" fill="#E4E8EE" stroke="#6B7A88" stroke-width="4"/><circle cx="${px}" cy="${pyy}" r="9" fill="#F2A33A" stroke="#B5701C" stroke-width="3"/><circle cx="${pc[0]}" cy="${pc[1]}" r="8" fill="#6B7A88"/>
    <text x="150" y="394" font-size="17" font-weight="900" text-anchor="middle" fill="#FFE08A">いま：${topWord}の 行程（${Math.round(d)}°）</text></svg>`;
}
const ENQ = {
  3:[['ばくはつ（燃焼）の とき、ピストンは どちらへ 動く？', '下へ', ['上へ', 'とまる', 'よこへ'], '燃焼の 圧力で ピストンが 下へ おし下げられるよ。'],
     ['吸気の とき、開いて いる バルブは？', '吸気バルブ', ['排気バルブ', '両方', 'どちらも 閉じている'], '吸気の ときは 吸気バルブが 開いて 空気を 吸いこむよ。'],
     ['圧縮の とき、2つの バルブは？', '両方 閉じている', ['両方 開いている', '吸気だけ 開く', '排気だけ 開く'], '空気を ぎゅっと ちぢめる ために ぜんぶ 閉じるよ。'],
     ['排気の とき、ピストンは？', '上へ 動いて ガスを おし出す', ['下へ 動く', 'とまる', 'よこへ 動く'], '排気バルブが 開いて、上がる ピストンが ガスを おし出す。']],
  4:[['1サイクルで クランクは 何回転？', '2回転', ['1回転', '4回転', '半回転'], '4つの 行程 × 半回転（180°）＝ 720° ＝ 2回転。'],
     ['ガソリンエンジンで 点火プラグが 火花を 出すのは？', '圧縮の 終わりごろ（上死点の 少し 手前）', ['吸気の はじめ', '排気の おわり', 'いつでも'], '圧縮して から 火花で 燃やす。'],
     ['ディーゼルエンジンが 着火する しくみは？', '空気を 強く 圧縮して 高温に する', ['点火プラグの 火花', '電気の 熱', '太陽の 熱'], '圧縮着火。ディーゼルには 点火プラグが ないよ。'],
     ['4つの 行程の うち、動力（仕事）を 生むのは？', '燃焼（膨張）', ['吸気', '圧縮', '排気'], 'ほかの 3つは 次の 燃焼の 準備。クランクの はずみ車が 勢いを 保つよ。']],
  5:[['ピストンが いちばん 上に 来る 位置を 何という？', '上死点', ['下死点', '中立点', '始点'], '上は 上死点、下は 下死点。'],
     ['1サイクル（0〜720°）の 間に、ピストンが 上死点に 来る のは 何回？（720°は 次の サイクルの 0°）', '2回', ['1回', '4回', '0回'], '0°（排気の おわり）と 360°（圧縮の おわり）の 2回。'],
     ['電気自動車の モーターは、ガソリンエンジンと くらべて エネルギーの 効率が？', '高い（約90%）', ['低い（約30%）', 'まったく 同じ', 'ゼロ'], 'モーターは 約9割、ガソリンエンジンは 約3割が 動力に なる。'],
     ['ガソリンエンジンの 圧縮比を 高くすると？', '熱効率が 上がるが、ノッキングに 注意', ['効率が 下がる', '燃料が いらなく なる', '音が しなく なる'], '圧縮比が 高いと 効率は 上がるが、異常燃焼（ノッキング）が おきやすい。']],
  6:[['4気筒 4ストロークエンジンが 毎分 3000回転。1秒間の エンジン全体の 点火回数は？', '100回', ['25回', '50回', '200回'], '3000÷60＝50回転/秒。1気筒は 2回転に 1回 → 25回/秒。×4気筒＝100回/秒。'],
     ['6000 回転/分 で 回る 4ストローク 単気筒エンジン。1秒間の 点火回数は？', '50回', ['100回', '25回', '200回'], '6000÷60＝100回転/秒。2回転に 1回 点火するので 50回/秒。'],
     ['熱効率が 30% の エンジン。ガソリンの 熱エネルギーの うち 熱として すてられる 割合は およそ？', '約 70%', ['約 30%', '約 10%', '約 100%'], '動力に なるのは 30%、のこり 約 70% は 排気や 冷却で 熱として にげる。'],
     ['ディーゼルの 圧縮比が ガソリンより 高い 理由は？', '空気を 高温に して 自然に 着火 させる 必要が ある から', ['音を 小さく する ため', '燃料が 軽い から', '点火プラグが 重い から'], '圧縮して 高温に しないと、燃料が 自然に 燃えないから。']]
};
const ENA = {
  3:[['クランクを まわして「吸気」の 行程に しよう', 0, 180], ['クランクを まわして「圧縮」の 行程に しよう', 180, 360], ['クランクを まわして「燃焼（ばくはつ）」の 行程に しよう', 360, 540], ['クランクを まわして「排気」の 行程に しよう', 540, 720]],
  4:[['吸気バルブが 開いて いる 行程に しよう', 0, 180], ['排気バルブが 開いて いる 行程に しよう', 540, 720], ['火花（点火）が 出る 位置（360°の まわり 350〜380°）に しよう', 350, 380], ['ピストンが いちばん 下に 来る 吸気の おわり（180°の まわり 165〜195°）に しよう', 165, 195]],
  5:[['燃焼（膨張）の おわり ＝ ピストンが 下死点に 来る 位置（540°の まわり 525〜555°）に しよう', 525, 555], ['圧縮の おわり ＝ ピストンが 上死点に 来る 位置（360°の まわり 345〜375°）に しよう', 345, 375], ['1サイクルが おわる 位置（705〜720°）に しよう', 705, 720]],
  6:[['ピストンが 吸気の 下死点から 上に 向かう 圧縮の 中ごろ（270°の まわり 250〜290°）に しよう', 250, 290], ['燃焼が はじまった ばかり（360〜400°）に しよう', 360, 400]]
};
EXRUN.engine = {
  init(E){
    const st = E.star, na = {3:3, 4:2, 5:2, 6:1}[st], nc = 5 - na, A = shuf(ENA[st]).slice(0, na).map(a => ({t:'a', q:a[0], lo:a[1], hi:a[2]})), C = shuf(ENQ[st]).slice(0, nc).map(c => ({t:'c', q:c[0], a:c[1], ch:shuf([c[1]].concat(c[2])), e:c[3]}));
    E.rounds = shuf(A.concat(C)); E.angle = 0; E.mode = 'gas'; E.done = false; E.msg = null; E.picked = null; E.tries = 0;
  },
  html(tab){
    const r = E.rounds[E.i], stage = `<div class="sxStage eng">${engineSVG(E.angle, E.mode, tab ? 300 : 250)}</div>`;
    const crank = `<label class="sxSl big"><span>クランクを まわそう</span><input type="range" id="sxCrank" min="0" max="720" step="5" value="${E.angle}"><b data-kv="crank">${E.angle}°</b></label>`;
    const mode = `<div class="sxTg"><span>エンジンの しゅるい</span><div class="sxSeg">${[['gas', 'ガソリン'], ['diesel', 'ディーゼル'], ['ev', 'でんき']].map(o => `<button class="sxBtn sm ${E.mode === o[0] ? '' : 'w'}" data-a="enm" data-v="${o[0]}">${o[1]}</button>`).join('')}</div></div>`;
    const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいかい！' : E.done ? 'こたえは これ！' : 'おしい！'}</b><p>${RB(E.msg.t)}</p></div>` : '';
    let body;
    if(r.t === 'a') body = `<div class="sxMis"><span class="sxMisN">ミッション ${E.i + 1} / 5</span><p>${RB(r.q)}</p></div>${crank}${mode}${fb}${E.done ? `<button class="sxBtn big" data-a="ennext">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : `<button class="sxBtn big" data-a="enok">これで いい！</button>`}`;
    else body = `<div class="sxMis"><span class="sxMisN">クイズ ${E.i + 1} / 5</span><p>${RB(r.q)}</p></div>${crank}${mode}<div class="sxChG">${r.ch.map((c, i) => `<button class="sxCh ${E.done ? (c === r.a ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="enc" data-v="${i}" ${E.done ? 'disabled' : ''}>${RB(c)}</button>`).join('')}</div>${fb}${E.done ? `<button class="sxBtn big" data-a="ennext">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}`;
    return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${body}</div></div>` : `${stage}${body}`;
  },
  after(){ LABS = LABS || {}; LABS.noResize = false; },
  crank(v){ E.angle = v; const st = document.querySelector('.sxStage.eng'); if(st) st.innerHTML = engineSVG(E.angle, E.mode, isTab() ? 300 : 250); const b = document.querySelector('[data-kv="crank"]'); if(b) b.textContent = v + '°'; },
  ok(){ const r = E.rounds[E.i]; if(E.done) return; const d = ((E.angle % 720) + 720) % 720, ok = d >= r.lo && d <= r.hi;
    if(ok){ E.ok++; E.done = true; E.msg = {ok:true, t:'ぴったり！ ピストンと バルブの うごきを よく 見て おぼえよう。'}; snd('ok'); }
    else { E.tries++; if(E.tries >= 2){ E.done = true; E.msg = {ok:false, t:`ここ（${r.lo}〜${r.hi}°）だよ。クランクを うごかして たしかめよう。`}; } else E.msg = {ok:false, t:'もうちょっと ちがうよ。クランクを まわして ピストンと バルブを 見てみよう'}; snd('ng'); }
    render(); },
  pick(i){ const r = E.rounds[E.i]; if(E.done) return; E.picked = i; const ok = r.ch[i] === r.a; if(ok) E.ok++; E.done = true; E.msg = {ok, t:r.e}; snd(ok ? 'ok' : 'ng'); render(); },
  next(){ if(E.i + 1 >= 5) return expFinish(E.ok, 5); E.i++; E.done = false; E.msg = null; E.picked = null; E.tries = 0; render(); }
};

/* =====================================================================
   タッチの うごき（まとめ）
   ===================================================================== */
function bind(el){
  el.addEventListener('click', onClick);
  el.addEventListener('input', onInput);
}
function onInput(e){
  const t = e.target; if(!t || t.type !== 'range') return;
  if(t.id === 'sxCrank' && E && E.id === 'engine'){ EXRUN.engine.crank(+t.value); return; }
  if(t.dataset.k && E && E.kind === 'lab'){ E.vals[t.dataset.k] = +t.value; labRefresh(); }
}
async function cardModal(id){
  const c = CD(id); if(!c) return; const got = SC().cards[id], z = ZN(c.z);
  await modal(`<div class="sxMArt xcard ${c.rare ? 'rare' : ''}" style="--zc:${z.c}"><img src="${IC(c.img)}" alt="" style="${got ? '' : 'filter:grayscale(1) brightness(.4) blur(3px)'}">${got ? '' : '<em>？</em>'}</div><h3 class="sxMT">${got ? X(c.n) : '？？？'}${c.rare ? '　<span class="sxRare">レア</span>' : ''}</h3>
    <p class="sxMP">${got ? RB(c.t) : 'まだ 見つけて いないよ。実験や もんだいを クリアして さがそう！'}</p><p class="sxMS">${X(z.n)}</p>`, [{t:'とじる', c:'w', v:1}], 'card');
}
async function rankModal(){
  const rk = rankNo();
  await modal(`<h3 class="sxMT">かがくかん ランク</h3><div class="sxRkL m">${RANKS.map((r, i) => `<div class="sxRkR ${i <= rk ? 'on' : ''}">${SVGI.rank(r.c, 36)}<div><b>${r.n}</b><small>ひらめき ${nf(r.m)}〜</small><em>${RB(r.open)}</em></div></div>`).join('')}</div><p class="sxMS">ひらめき＝実験・もんだいで もらった ポイントの ごうけい。いま ${nf(SC().hira)}</p>`, [{t:'とじる', c:'w', v:1}]);
}
async function claim(id){
  const r = REWARDS.find(x => x.id === id); if(!r || rwState(r) !== 'ready') return;
  if(!giveReward(r)) return; snd('fan'); try{ confetti(2000); }catch(e){}
  await modal(`<div class="sxMArt"><img src="${IC(r.img)}" alt=""></div><h3 class="sxMT">ごほうび ゲット！</h3><p class="sxMP"><b>${X(r.n)}</b><br>${RB(r.eff)}</p>
    <p class="sxMS">${r.t === 'town' ? '「まち」の「もようがえ」で おいてね' : '「わたしの家」の「もようがえ」で かざってね（上から見た絵も あるよ）'}</p>`, [{t:'やったー！', c:'g', v:1}], 'gold');
  render();
}
function onClick(e){
  const t = e.target.closest('[data-a]'); if(!t || !ROOT || !ROOT.contains(t)) return;
  const a = t.dataset.a, v = t.dataset.v; if(t.disabled) return;
  switch(a){
    case 'back': return back();
    case 'top': return go('top');
    case 'ruby': { const o = ['hard', 'all', 'none'], s = SC(); s.settings.ruby = o[(o.indexOf(s.settings.ruby || 'hard') + 1) % 3]; persist(); return render(); }
    case 'talk': V.say = hallSay(); return render();
    case 'rank': return rankModal();
    case 'zone': snd('tap'); return go('zone', {z:v});
    case 'exp': return expStart(v, !!t.dataset.daily);
    case 'qsel': snd('tap'); return go('qsel', {v:v});
    case 'cards': snd('tap'); return go('cards', {z:v || V.z || 'chem'});
    case 'cardz': V.z = v; return render();
    case 'card': return cardModal(v);
    case 'rew': snd('tap'); return go('rew', {t:V.t || 'town'});
    case 'rewt': V.t = v; return render();
    case 'claim': return claim(v);
    case 'qz': QSEL.z = v; return render();
    case 'qlv': if(lvOpen(+v)){ QSEL.lv = +v; return render(); } try{ toast(lvHint(+v)); }catch(er){} return snd('ng');
    case 'qn': QSEL.n = +v; return render();
    case 'qgo': return qStart();
    case 'qa': return qAnswer(+v);
    case 'qhint': return qHint();
    case 'qdk': return qAnswer(-2);
    case 'qnext': return qNext();
    case 'qagain': return go('qsel');
    case 'expagain': return expStart(v, false);
    /* かんたん 実験 */
    case 'labt': { const m = E.ms[E.i], c = (m.ctrl || []).find(x => x.k === t.dataset.k); const o = c.opts.find(x => String(x[0]) === v); E.vals[c.k] = o[0]; return render(); }
    case 'labc': return labChoice(+v);
    case 'labgo': return labGo();
    case 'labnext': return labNext();
    case 'lablisten': return beep(E.vals.f, E.vals.A);
    /* 炎色反応 */
    case 'flput': return EXRUN.flame.put();
    case 'flc': return EXRUN.flame.pick(+v);
    case 'flnext': return EXRUN.flame.next();
    /* 車 */
    case 'asm': return EXRUN.assemble.tap(v);
    case 'asmc': E.color = v; return render();
    case 'asme': E.eng = v; return render();
    case 'asmi': return EXRUN.assemble.inspTog(+v);
    case 'asmicheck': return EXRUN.assemble.inspCheck();
    /* エンジン */
    case 'enm': E.mode = v; return render();
    case 'enc': return EXRUN.engine.pick(+v);
    case 'enok': return EXRUN.engine.ok();
    case 'ennext': return EXRUN.engine.next();
    default: return extClick(a, v, t);
  }
}

/* =====================================================================
   まちの ごほうび：花火・ロケット・ながれ星（タッチで イベント）
   ===================================================================== */
const TOWNEV = new Set(['sci_fireworks', 'sci_rocket', 'sci_stardeck']);
function fxLayer(id, html, ms){
  const old = document.getElementById(id); if(old) old.remove();
  const d = document.createElement('div'); d.id = id; d.className = 'sxFx'; d.innerHTML = html; document.body.appendChild(d); if(ms) setTimeout(() => d.remove(), ms); return d;
}
async function townEvent(id){
  const s = SC(), tst = m => { try{ toast(m); }catch(e){} };
  if(id === 'sci_fireworks'){
    if(s.d.fire >= 1){ tst('花火は きょうは もう うちあげたよ。また あした！'); return; }
    s.d.fire = 1; const cols = Object.keys(s.flame).map(k => FK(k).col); const pal = cols.length ? cols : ['#FF5A6E', '#FFD21A', '#4A9CFF'];
    const cv = document.createElement('canvas'); cv.id = 'sxFw'; cv.className = 'sxFx fw'; document.body.appendChild(cv);
    const dpr = devicePixelRatio || 1, W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const ps = []; let t0 = performance.now(), nextB = 0;
    (function f(t){
      const e = t - t0; g.fillStyle = 'rgba(10,14,40,.28)'; g.fillRect(0, 0, W, H);
      if(e > nextB && e < 6200){ nextB = e + 380 + Math.random() * 380; const cx = W * (.15 + Math.random() * .7), cy = H * (.12 + Math.random() * .38), col = pick(pal), n = 70; for(let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, sp = 2 + Math.random() * 3.4; ps.push({x:cx, y:cy, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp, l:1, c:col}); } try{ snd('tap'); }catch(er){} }
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= .985; p.l -= 0.012; if(p.l > 0){ g.globalAlpha = Math.max(0, p.l); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, 2.6, 0, 7); g.fill(); } });
      g.globalAlpha = 1;
      if(e < 7600) requestAnimationFrame(f); else cv.remove();
    })(t0);
    const pt = award(CFG.fireBase, 'かがくかん 花火たいかい');
    try{ (save.town.res || []).forEach(r => { r.fr = (r.fr || 0) + 1; }); }catch(e){}
    persist(); setTimeout(() => { tst(`🎆 花火 きれい！ +${pt}pt　住民の なかよしも アップ！`); try{ renderTown(); }catch(e){} }, 1800);
  } else if(id === 'sci_rocket'){
    if(s.d.rocket >= 1){ tst('ロケットは きょうは もう 発射したよ。また あした！'); return; }
    s.d.rocket = 1; const pt = award(CFG.rocketBase, 'かがくかん ロケット発射');
    fxLayer('sxRk', `<div class="sxRkSky"><div class="sxRkCount">3…2…1…</div><img class="sxRkImg" src="${IC('card_space_rocket')}" alt=""><i class="sxRkSm"></i></div>`, 5200);
    setTimeout(() => { const c = document.querySelector('.sxRkCount'); if(c) c.textContent = '発射！'; snd('fan'); }, 1500);
    setTimeout(() => { tst(`🚀 ロケット 発射 せいこう！ +${pt}pt`); try{ renderTown(); }catch(e){} }, 3600);
  } else if(id === 'sci_stardeck'){
    if(s.d.meteor >= CFG.meteorDay){ tst('きょうの ながれぼしは おしまい。また あした！'); return; }
    s.d.meteor++; persist(); let got = 0;
    const L = fxLayer('sxMt', `<div class="sxMtSky"><b>ながれ星を タッチ！</b><span id="sxMtN">0</span></div>` + [0, 1, 2].map(i => `<button class="sxMtS" style="top:${14 + i * 22 + Math.random() * 10}%;animation-delay:${.6 + i * 2.2 + Math.random()}s"><img src="${IC('card_space_shooting')}" alt=""></button>`).join(''));
    L.addEventListener('click', ev => { const b = ev.target.closest('.sxMtS'); if(!b || b.dataset.d) return; b.dataset.d = 1; b.classList.add('got'); got++; snd('ok'); const n = document.getElementById('sxMtN'); if(n) n.textContent = got; });
    setTimeout(() => { L.remove(); if(got){ const pt = award(CFG.meteorBase * got, 'かがくかん ながれ星'); tst(`🌠 ながれ星 ${got}こ ゲット！ +${pt}pt`); } else tst('ながれ星は にげちゃった…'); try{ renderTown(); }catch(e){} }, 9500);
  }
}

/* ---------- 町の「かがくかん」「ごほうびの たてもの」をタッチ ---------- */
let swap = null;
const restore = () => { if(swap && save.town && save.town.cells[swap.k] === '__sc700') save.town.cells[swap.k] = swap.id; swap = null; };
const TAPIDS = new Set(['bg_science', ...TOWNEV]);
window.addEventListener('pointerup', e => {
  if(typeof curScreen === 'undefined' || curScreen !== 'town' || (typeof townEdit !== 'undefined' && townEdit) || !save.town) return;
  if(e.target.closest('#townMap .walker,.car2')) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const k = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[k]; if(!TAPIDS.has(id)) return;
  restore(); swap = {k, id}; save.town.cells[k] = '__sc700'; setTimeout(restore, 600);
}, true);
window.addEventListener('click', e => {
  if(!swap) return; const c = e.target.closest && e.target.closest('#townMap .cell'); const s = swap; restore();
  if(!c || `${c.dataset.x},${c.dataset.y}` !== s.k) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(s.id === 'bg_science'){ snd('fan'); open(s.k); } else townEvent(s.id);
}, true);
try{ const _show = show; show = function(){ if(ROOT) close(); return _show.apply(this, arguments); }; }catch(e){}
try{ const B = window.__bgm643; if(B){ const t0 = B.target; B.target = () => { const v = t0(); if(!document.querySelector('#sc700') || v === 0) return v; return (Q && V.s === 'quiz') ? Math.min(v, .07) : Math.min(v, .12); }; } }catch(e){}
try{ renderSettings = (orig => function(){ const o = orig.apply(this, arguments); try{ const v = $('#verNote'); if(v) v.textContent = `まなびタウン v${VER}`; }catch(e){} return o; })(renderSettings); }catch(e){}
window.__sci700 = {RB, open, close, SC, CFG, ZONES, EXPS, CARD_IDS, REWARDS, QBANK, GENS, getSet, award, go, render, get V(){ return V; }, get E(){ return E; }, get Q(){ return Q; }, RANKS, townEvent, EXRUN, LABDEF, FLAME, rankNo, rwState, giveReward, giveCar, expStart, QSEL};



/* =====================================================================
   v6.71 追加：のこり 10この 実験
   ばけがく：色が かわる 水／けっしょうを そだてる
   でんき　：プラズマボール（静電気）
   くるま　：でんき車 vs ガソリン車
   ひかり　：レンズの ふしぎ／かがみ めいろ
   うちゅう：プラネタリウム／てんきの ふしぎ
   いのち　：いでんの ふしぎ／からだの しくみ
   ===================================================================== */
const tgl = (k, l, opts, v) => ({type:'tog', k, l, opts, v});
const slid = (k, l, min, max, step, v, u, lock) => ({k, l, min, max, step, v, u, lock});
const frame = (w, h, fill = '#F4FBFF', stroke = '#BFDDEE') => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
const T = (x, y, t, fs = 14, col = '#4A3420', anchor = 'middle', w = 900) => `<text x="${x}" y="${y}" font-size="${fs}" font-weight="${w}" text-anchor="${anchor}" fill="${col}">${t}</text>`;

/* ===================== ばけがく：色が かわる 水 ===================== */
const LIQ = {
  lemon:{n:'レモン水', ph:2.5}, vinegar:{n:'す', ph:3}, soda:{n:'炭酸水', ph:4.5}, water:{n:'水', ph:7}, salt:{n:'食塩水', ph:7}, sugar:{n:'さとう水', ph:7},
  baking:{n:'重そう水', ph:8.3}, soap:{n:'せっけん水', ph:10}, hcl:{n:'塩酸', ph:1}, naoh:{n:'水酸化ナトリウム水', ph:13}
};
const phKind = ph => ph < 6 ? 'acid' : ph > 7.6 ? 'alk' : 'neu';
const btbCol = ph => ph < 6 ? '#F6D93A' : ph <= 7.6 ? '#4CB84C' : '#3C6FE0';
const btbName = ph => ph < 6 ? '黄色' : ph <= 7.6 ? '緑色' : '青色';
const cabCol = ph => ph < 3.5 ? '#E0364A' : ph < 5.5 ? '#C95AA5' : ph < 7.5 ? '#8A5CC6' : ph < 9 ? '#4A6FD6' : ph < 11.5 ? '#2FA89A' : '#C9C94A';
const cabName = ph => ph < 3.5 ? '赤' : ph < 5.5 ? 'ピンク' : ph < 7.5 ? 'むらさき' : ph < 9 ? '青' : ph < 11.5 ? '青緑' : '黄緑';
const litRed = ph => ph > 8 ? '#3C6FE0' : '#E0364A';        /* 赤い リトマス紙 */
const litBlue = ph => ph < 5 ? '#E0364A' : '#3C6FE0';       /* 青い リトマス紙 */
function beakerSVG(x, y, col, w = 90, h = 110, fillPct = .68){
  const lv = h * fillPct;
  return `<path d="M${x} ${y}h${w}v${h - 12}q0 12 -12 12h${-(w - 24)}q-12 0 -12 -12z" fill="#fff" fill-opacity=".55" stroke="#7FB6E6" stroke-width="3"/><path d="M${x + 2} ${y + h - lv}h${w - 4}v${lv - 12}q0 10 -10 10h${-(w - 24)}q-10 0 -10 -10z" fill="${col}" fill-opacity=".9"/>
    <path d="M${x - 4} ${y}h${w + 8}" stroke="#7FB6E6" stroke-width="3" stroke-linecap="round"/>`;
}
function indicView(v, m){
  if(m.mode === 'neu'){
    const nA = m.va * m.ca, nB = v.nv * m.cb, tot = m.va + v.nv, d = nA - nB;
    const conc = Math.abs(d) / tot, ph = Math.abs(d) < 1e-9 ? 7 : (d > 0 ? -Math.log10(conc) : 14 + Math.log10(conc));
    const col = btbCol(ph), fillP = clampN(tot / 80, .3, .95);
    return SVGW(300, 260, `${frame(300, 260)}${beakerSVG(100, 60, col, 100, 140, fillP)}${T(150, 36, `さん ${m.va} mL ＋ アルカリ ${v.nv} mL`, 14)}${T(150, 230, `BTB液：${btbName(ph)}　pH ≒ ${r1(ph)}`, 15, '#4A3420')}
      <path d="M232 70v30M222 92l10 12 10-12" stroke="#3C93DC" stroke-width="5" fill="none" stroke-linecap="round"/>${T(232, 56, 'アルカリ', 11, '#3C93DC')}`)
      + `<div class="sxGs"><div class="sxGg">さん：${m.ca} mol/L　${m.va} mL ／ アルカリ：${m.cb} mol/L（${m.cb > .1 ? '濃い' : m.cb < .1 ? 'うすい' : '同じ'}）</div></div>`;
  }
  const L = LIQ[v.liq], ph = L.ph;
  let body = '';
  if(m.mode === 'litmus'){
    body = `${beakerSVG(100, 60, '#D9ECFF', 100, 140)}${T(150, 36, L.n, 16)}
      <g transform="translate(118 20)"><rect x="0" y="0" width="22" height="110" rx="3" fill="${litRed(ph)}" stroke="#fff" stroke-width="2"/></g><g transform="translate(160 20)"><rect x="0" y="0" width="22" height="110" rx="3" fill="${litBlue(ph)}" stroke="#fff" stroke-width="2"/></g>
      ${T(129, 236, '赤い 紙', 12)}${T(171, 236, '青い 紙', 12)}${T(150, 252, `赤い 紙 → ${litRed(ph) === '#3C6FE0' ? '青' : '赤のまま'}　青い 紙 → ${litBlue(ph) === '#E0364A' ? '赤' : '青のまま'}`, 11, '#6B5A44')}`;
  } else if(m.mode === 'btb'){
    body = `${beakerSVG(100, 60, btbCol(ph), 100, 140)}${T(150, 36, L.n + ' ＋ BTB液', 16)}${T(150, 236, `BTB液：${btbName(ph)}`, 16)}`;
  } else {
    body = `${beakerSVG(100, 60, cabCol(ph), 100, 140)}${T(150, 36, L.n + ' ＋ むらさきキャベツ液', 15)}${T(150, 236, `いろ：${cabName(ph)}`, 16)}
      <g transform="translate(228 70)">${[['#E0364A', '強い さん'], ['#C95AA5', 'さん'], ['#8A5CC6', '中性'], ['#4A6FD6', 'アルカリ'], ['#2FA89A', '強い アルカリ']].map((c, i) => `<rect x="0" y="${i * 24}" width="16" height="16" rx="4" fill="${c[0]}"/>${T(22, i * 24 + 13, c[1], 10, '#6B5A44', 'start')}`).join('')}</g>`;
  }
  return SVGW(300, 260, frame(300, 260) + body);
}
LABDEF.indic = star => {
  const O = (a, b, c) => [['lemon', 'レモン水'], ['salt', '食塩水'], ['soap', 'せっけん水']];
  const liqTog = keys => tgl('liq', 'しらべる 水', keys.map(k => [k, LIQ[k].n]), keys[0]);
  const ms = [];
  if(star === 1){
    const Q = [['lemon', 'レモン水', '酸性', '青い リトマス紙が 赤に かわる のは 酸性。'], ['soap', 'せっけん水', 'アルカリ性', '赤い リトマス紙が 青に かわる のは アルカリ性。'], ['salt', '食塩水', '中性', 'どちらの 紙も 色が かわらない のは 中性。']];
    shuf(Q).forEach(q => ms.push({mode:'litmus', text:`リトマス紙で しらべよう。${q[1]}は 何性かな？（まず ${q[1]}を えらんでね）`, ctrl:[liqTog(['lemon', 'salt', 'soap'])], view:indicView, choices:['酸性', '中性', 'アルカリ性'], ans:['酸性', '中性', 'アルカリ性'].indexOf(q[2]), need:v => v.liq === q[0] ? null : `まず ${q[1]}を えらんで、紙の 色を 見て みよう`, explain:q[3], hintNG:'赤い 紙と 青い 紙の 色の かわりかたを 見よう！'}));
  } else if(star === 2){
    const Q = [['acid', '黄色', ['vinegar', 'water', 'baking', 'soap']], ['neu', '緑色', ['lemon', 'water', 'soap', 'soda']], ['alk', '青色', ['salt', 'baking', 'vinegar', 'sugar']]];
    Q.forEach(q => ms.push({mode:'btb', text:`BTB液を 入れて「${q[1]}」に なる 水を えらぼう（えらんだら「けってい！」）`, ctrl:[liqTog(q[2])], view:indicView, check:v => phKind(LIQ[v.liq].ph) === q[0] ? {ok:true} : {ok:false, msg:`${LIQ[v.liq].n}は ${btbName(LIQ[v.liq].ph)}だよ。ほかの 水を ためして みよう`}, explain:'BTB液は 酸性で 黄色、中性で 緑色、アルカリ性で 青色に なる。', answer:`こたえ：${LIQ[q[2].find(k => phKind(LIQ[k].ph) === q[0])].n}。`}));
  } else if(star === 3){
    const Q = [['むらさきキャベツ液が「赤」に なる のは どの 水？', '塩酸', ['せっけん水', '食塩水', '重そう水'], ['hcl', 'soap', 'salt', 'baking'], '強い 酸性では 赤に なる。'],
      ['むらさきキャベツ液が「青〜青緑」に なる のは どの 水？', 'せっけん水', ['レモン水', '食塩水', 'す'], ['lemon', 'soap', 'salt', 'vinegar'], 'アルカリ性が 強く なるほど 青 → 青緑 → 黄緑に かわる。'],
      ['むらさきキャベツ液が「むらさき」の まま なのは どの 水？', '食塩水', ['レモン水', 'せっけん水', '塩酸'], ['lemon', 'salt', 'soap', 'hcl'], '中性の 水は むらさきの まま。']];
    Q.forEach(q => ms.push({mode:'cab', text:q[0] + '（水を 切りかえて ためそう）', ctrl:[liqTog(q[3])], view:indicView, choices:[q[1]].concat(q[2]), ans:0, explain:q[4], hintNG:'水を 切りかえて、色を 見くらべて みよう！'}));
  } else {
    [[20, .1, .1, 20], [20, .1, .2, 10], [10, .2, .1, 20], [20, .1, .05, 40], [15, .2, .1, 30]].sort(() => Math.random() - .5).slice(0, 3).forEach(p => {
      const [va, ca, cb, ans] = p;
      ms.push({mode:'neu', va, ca, cb, text:`${ca} mol/L の さん ${va} mL に、${cb} mol/L の アルカリを 少しずつ 入れる。BTB液が「緑色」（ちょうど 中和）に なる ように 量を えらぼう`, ctrl:[slid('nv', 'アルカリの 量', 0, 60, 1, 0, ' mL')], view:indicView,
        check:v => v.nv === ans ? {ok:true} : {ok:false, msg:`いまは ${v.nv} mL。${v.nv * cb > va * ca ? 'アルカリが 多すぎて 青く なって いるよ' : 'まだ さんが のこって 黄色いよ'}`}, explain:`中和は「さんの 物質量 ＝ アルカリの 物質量」。${va}×${ca}＝${r1(va * ca)}、アルカリは ${cb} mol/L なので ${r1(va * ca)}÷${cb}＝${ans} mL。`, answer:`こたえ：${ans} mL。`});
    });
  }
  return ms;
};

/* ===================== ばけがく：けっしょうを そだてる ===================== */
const SOL = {alum:{n:'ミョウバン', pts:[[0, 3], [20, 6], [40, 12], [60, 25], [80, 71]]}, salt:{n:'食塩', pts:[[0, 35.7], [20, 35.8], [40, 36.3], [60, 37.1], [80, 38.0]]}};
function solCap(sub, t){
  const P = SOL[sub].pts; for(let i = 0; i < P.length - 1; i++){ if(t <= P[i + 1][0]) return P[i][1] + (P[i + 1][1] - P[i][1]) * (t - P[i][0]) / (P[i + 1][0] - P[i][0]); }
  return P[P.length - 1][1];
}
function crystalView(v, m){
  const sub = m.sub || 'alum', W = m.water || 100, cap = solCap(sub, v.T) * W / 100, amt = m.amt, cryst = Math.max(0, amt - cap), pct = clampN(v.T / 80, 0, 1);
  const nC = Math.min(16, Math.round(cryst / Math.max(amt, 1) * 24));
  const cs = Array.from({length:nC}, (_, i) => `<path d="M${112 + (i * 17) % 78} ${196 - (i % 3) * 8}l7 -10l8 4l-2 10z" fill="#BFE8FF" stroke="#5FA8D8" stroke-width="1.5"/>`).join('');
  const dots = Array.from({length:Math.min(18, Math.round(Math.min(amt, cap) / Math.max(amt, 1) * 18))}, (_, i) => `<circle cx="${112 + (i * 23) % 80}" cy="${100 + (i * 29) % 80}" r="2.5" fill="#fff" fill-opacity=".8"/>`).join('');
  return SVGW(300, 260, `${frame(300, 260)}<path d="M96 52h108v150q0 14 -14 14h-80q-14 0 -14 -14z" fill="#fff" fill-opacity=".55" stroke="#7FB6E6" stroke-width="3"/><path d="M99 84h102v118q0 11 -11 11h-80q-11 0 -11 -11z" fill="rgb(${Math.round(150 + pct * 90)},${Math.round(210 - pct * 20)},${Math.round(250 - pct * 120)})" fill-opacity=".75"/>${dots}${cs}
    <g transform="translate(240 50)"><rect x="0" y="0" width="14" height="120" rx="7" fill="#fff" stroke="#8A929C" stroke-width="2"/><rect x="3" y="${120 - pct * 114}" width="8" height="${pct * 114 + 3}" rx="4" fill="#E8414B"/>${T(7, 142, v.T + '℃', 14)}</g>
    ${T(150, 32, `${SOL[sub].n} ${amt} g を 水 ${W} g に`, 14)}${T(150, 238, `とける 限界：${r1(cap)} g　→ 結晶：${r1(cryst)} g`, 14, cryst > 0 ? '#2C6FB0' : '#4A3420')}`)
    + `<div class="sxGs">${gauge(cap / Math.max(amt, 1) * 100 > 100 ? 100 : cap / Math.max(amt, 1) * 100, 'とけている わりあい', '#3C93DC')}</div>`;
}
LABDEF.crystal = star => {
  const ctl = (lock, v0 = 80) => [slid('T', '水の 温度', 0, 80, 5, v0, '℃', lock)];
  const ms = [];
  if(star === 3){
    [[6, 20], [12, 40], [25, 60]].sort(() => Math.random() - .5).forEach(([a, tmin]) => ms.push({sub:'alum', amt:a, text:`ミョウバン ${a} g を 水 100 g に ぜんぶ とかしたい。いちばん 低い 温度（±5℃）に しよう（20℃ のとき 6 g、40℃ のとき 12 g、60℃ のとき 25 g まで とけるよ）`, ctrl:ctl(false, 0), view:crystalView,
      check:v => v.T >= tmin && v.T <= tmin + 5 ? {ok:true} : {ok:false, msg:v.T < tmin ? '結晶が まだ のこって いるよ。もう少し 温度を 上げよう' : '高すぎ！ もっと 低い 温度でも とけるよ'}, explain:`水の 温度が 高いほど たくさん とける。${a} g が ちょうど とける のは およそ ${tmin}℃。`, answer:`${tmin}℃ くらい。`}));
  } else if(star === 4){
    [[25, 60, 20], [25, 60, 0], [71, 80, 40]].forEach(([a, t0, t1]) => { const ans = Math.round(a - solCap('alum', t1)), ch = [ans, a, Math.round(solCap('alum', t1)), ans + 8].map(x => r1(x) + ' g');
      ms.push({sub:'alum', amt:a, text:`${t0}℃ の 水 100 g に ミョウバン ${a} g を ちょうど とかした。${t1}℃ まで 冷やすと、何 g の 結晶が 出る？（温度を うごかして たしかめよう）`, ctrl:ctl(false, t0), view:crystalView, choices:ch, ans:0, need:v => v.T === t1 ? null : `まず 温度を ${t1}℃ に して たしかめよう`, explain:`${t1}℃ では ${r1(solCap('alum', t1))} g までしか とけない。${a} − ${r1(solCap('alum', t1))} ＝ ${ans} g が 結晶に なる。`, hintNG:'とける 限界と 入れた 量の さを 計算しよう！'}); });
  } else {
    ms.push({sub:'alum', amt:50, water:200, text:'60℃ の 水 200 g に ミョウバン 50 g を とかした（60℃ では 水 200 g に 50 g まで とける）。20℃ まで 冷やすと 何 g の 結晶が 出る？', ctrl:ctl(false, 60), view:crystalView, choices:['38 g', '50 g', '12 g', '44 g'], ans:0, need:v => v.T === 20 ? null : 'まず 温度を 20℃ に して たしかめよう', explain:'20℃ では 水 200 g に 12 g（100 g に 6 g の 2ばい）しか とけない。50 − 12 ＝ 38 g。'});
    ms.push({sub:'salt', amt:30, text:'食塩は 水の 温度を 変えても とける 量が ほとんど 同じ（100 g に 約 36 g）。食塩水から 食塩の 結晶を とり出す には どうする？（温度を うごかして たしかめよう）', ctrl:ctl(false, 80), view:crystalView, choices:['水を 蒸発させる', 'ゆっくり 冷やす', 'さらに 熱する', '氷を 入れる'], ans:0, explain:'食塩は 冷やしても ほとんど 結晶が 出ない。水を 蒸発させて とり出す。', hintNG:'温度を 下げても 結晶が 出ない ことに 注目！'});
    ms.push({sub:'alum', amt:71, text:'80℃ の 水 100 g に ミョウバン 71 g を ちょうど とかした。40℃ まで 冷やすと 何 g の 結晶が 出る？（温度を うごかして たしかめよう）', ctrl:ctl(false, 80), view:crystalView, choices:['59 g', '71 g', '12 g', '65 g'], ans:0, need:v => v.T === 40 ? null : 'まず 温度を 40℃ に して たしかめよう', explain:'40℃ では 12 g まで。71 − 12 ＝ 59 g が 結晶に なる。'});
  }
  return ms;
};

/* ===================== でんき：プラズマボール（静電気） ===================== */
function staticView(v, m){
  if(m.kind === 'balloon'){
    const q = v.rub, lift = q >= 20 ? 2 : q >= 10 ? 1 : 0;
    const charges = Array.from({length:Math.min(14, Math.round(q / 2))}, (_, i) => `<text x="${96 + (i * 11) % 66}" y="${100 + (i * 17) % 50}" font-size="14" font-weight="900" fill="#3C6FE0" text-anchor="middle">−</text>`).join('');
    const bits = [0, 1, 2, 3, 4].map(i => `<rect x="${84 + i * 24}" y="${lift ? 150 - (lift === 2 ? 28 : 10) - (i % 2) * 6 : 214}" width="14" height="8" rx="2" fill="#F0709A" transform="rotate(${(i - 2) * 14} ${91 + i * 24} 200)"/>`).join('');
    return SVGW(300, 260, `${frame(300, 260)}<ellipse cx="130" cy="108" rx="${50 + q * .3}" ry="${60 + q * .3}" fill="#F2A33A" stroke="#C27A1C" stroke-width="3"/><ellipse cx="108" cy="82" rx="10" ry="18" fill="#fff" fill-opacity=".5"/>${charges}<path d="M130 168v12l-6 8h12z" fill="#F2A33A"/>
      <path d="M60 226h140" stroke="#8A7A65" stroke-width="5" stroke-linecap="round"/>${bits}${T(150, 250, lift === 2 ? '紙が ぴったり くっつく！' : lift === 1 ? '紙が すこし うく' : '紙は うごかない', 14)}
      <g transform="translate(232 70)"><path d="M0 0l30 10-4 30" fill="none" stroke="#8A5A2B" stroke-width="10" stroke-linecap="round"/>${T(14, 70, 'ぬの', 12, '#6B5A44')}</g>`)
      + `<div class="sxGs">${gauge(q / 30 * 100, `こすった 回数：${q}`, '#F2A33A')}${gauge(Math.min(100, q * 3.4), 'たまった 静電気（−）', '#3C6FE0')}</div>`;
  }
  const d = v.dist, near = d <= 3, arcs = Array.from({length:8}, (_, i) => { const a = i / 8 * Math.PI * 2, tx = near && i === 0 ? 150 + 78 + (3 - d) * 0 : null;
    return `<path d="M150 130Q${150 + Math.cos(a + .6) * 36} ${130 + Math.sin(a + .6) * 36} ${150 + Math.cos(a) * 80} ${130 + Math.sin(a) * 80}" fill="none" stroke="${near ? '#E8A0FF' : '#B58CFF'}" stroke-opacity="${near ? .6 : .85}" stroke-width="${near ? 2 : 2.6}"/>`; }).join('');
  const fx = 230 + d * 6;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#14102A"/><circle cx="150" cy="130" r="84" fill="#2A1F55" fill-opacity=".55" stroke="#B9A8E8" stroke-width="3"/>${arcs}
    ${near ? `<path d="M150 130Q${(150 + fx) / 2} ${130 - 24} ${fx - 14} 140" fill="none" stroke="#FFE6FF" stroke-width="${6 - d}" stroke-linecap="round"/><circle cx="150" cy="130" r="16" fill="#FFD0FF" fill-opacity=".9"/>` : `<circle cx="150" cy="130" r="10" fill="#E8C0FF" fill-opacity=".9"/>`}
    <rect x="124" y="212" width="52" height="22" rx="8" fill="#3A3F47"/><g transform="translate(${fx} 150)"><rect x="-8" y="0" width="16" height="80" rx="8" fill="#F2C49B" stroke="#C98A5B" stroke-width="2"/><rect x="-7" y="-26" width="14" height="30" rx="7" fill="#F2C49B" stroke="#C98A5B" stroke-width="2"/></g>
    ${T(150, 252, near ? '光が ゆびの ほうへ あつまる！' : '光は ぜんたいに ひろがる', 13, '#fff')}`)
    + `<div class="sxGs">${gauge(100 - d * 10, '光が ゆびに あつまる 強さ', '#B58CFF')}</div>`;
}
LABDEF.plasma = star => {
  const bal = [slid('rub', 'ふうせんを こする 回数', 0, 30, 1, 0, ' かい')], fin = [slid('dist', 'ゆびと ガラスの きょり', 0, 10, 1, 8, ' cm')];
  const ms = [];
  if(star === 1){
    ms.push({kind:'balloon', text:'ふうせんを ぬので こすって、紙きれを 持ち上げよう（10回 いじょう）', ctrl:bal, view:staticView, check:v => v.rub >= 10 ? {ok:true} : {ok:false, msg:`いまは ${v.rub}回。もっと こすろう`}, explain:'こすると マイナスの 電気（静電気）が ふうせんに たまり、紙を ひきつける。', answer:'10回 いじょう。'});
    ms.push({kind:'balloon', text:'もっと 強く こすって、紙が ぴったり くっつく ように しよう（20回 いじょう）', ctrl:bal, view:staticView, check:v => v.rub >= 20 ? {ok:true} : {ok:false, msg:`いまは ${v.rub}回`}, explain:'こする 回数が ふえるほど たまる 電気も ふえる。', answer:'20回 いじょう。'});
    ms.push({kind:'balloon', text:'ふうせんを こすると、ふうせんに たまる ものは？', ctrl:bal, view:staticView, choices:['静電気（電気）', '音', '熱だけ', '磁石の 力'], ans:0, explain:'ものを こすり あわせると 静電気が うまれる。冬に ドアノブで パチッと するのも 同じ。', hintNG:'こすって 紙が くっつく ようすを 思い出そう！'});
  } else if(star === 2){
    ms.push({kind:'ball', text:'ゆびを ガラスに ちかづけて、光を ゆびに あつめよう（きょり 3 cm いか）', ctrl:fin, view:staticView, check:v => v.dist <= 3 ? {ok:true} : {ok:false, msg:`いまは ${v.dist} cm。もっと ちかづけよう`}, explain:'ゆびは 電気を にがす 通り道に なる。だから 光が ゆびの ほうへ あつまる。', answer:'3 cm いか。'});
    ms.push({kind:'ball', text:'ゆびを はなして、光が ぜんたいに ひろがる ように しよう（8 cm いじょう）', ctrl:[slid('dist', 'ゆびと ガラスの きょり', 0, 10, 1, 1, ' cm')], view:staticView, check:v => v.dist >= 8 ? {ok:true} : {ok:false, msg:`いまは ${v.dist} cm`}, explain:'ゆびが とおいと、電気は まわり ぜんたいに ひろがる。', answer:'8 cm いじょう。'});
    ms.push({kind:'ball', text:'プラズマボールの 中で 光って 見える のは、何が おきて いる から？', ctrl:fin, view:staticView, choices:['ガスの 中を 電気が 流れる（放電）', '電球が 入って いる', '光る 水が 入って いる', '太陽の 光を ためて いる'], ans:0, explain:'ガラスの 中の うすい ガスに 高い 電圧を かけると、電気が 流れて 光る（放電）。', hintNG:'ゆびを ちかづけると どうなったかな？'});
  } else {
    const Q = [['ふうせんを 2こ 同じ ように こすって ちかづけると、2この ふうせんは？', 'しりぞけあう', ['ひきあう', 'くっつく', '何も おきない'], '同じ 種類の 電気（−と −）は しりぞけあう。', 'balloon'],
      ['かみなりは、何が おきて いる？', '雲の 大きな 静電気が 一気に 流れる（放電）', ['雲が ぶつかって 光る', '太陽の 光が 反射する', '空気が 燃える'], '雲の 中の 氷の つぶが こすれて 静電気が たまり、大きな 放電が おきる。', 'ball'],
      ['冬の かわいた 日に ドアノブで パチッと する のは？', '体に たまった 静電気が 放電する から', ['ドアノブが 熱い から', '磁石が 入って いる から', '電池が 入って いる から'], 'かわいた 冬は 静電気が にげにくく、たまりやすい。', 'ball']];
    Q.forEach(q => ms.push({kind:q[4], text:q[0], ctrl:q[4] === 'balloon' ? bal : fin, view:staticView, choices:[q[1]].concat(q[2]), ans:0, explain:q[3], hintNG:'ふうせんや プラズマボールの ようすを 思い出そう！'}));
  }
  return ms;
};

/* ===================== くるま：でんき車 vs ガソリン車 ===================== */
function evView(v, m){
  const bar = (x, label, eta, col) => `<rect x="${x}" y="40" width="64" height="150" rx="10" fill="#fff" stroke="#BFDDEE" stroke-width="3"/><rect x="${x + 3}" y="${40 + 150 * (1 - eta) + 3}" width="58" height="${150 * eta - 6}" rx="8" fill="${col}"/><rect x="${x + 3}" y="43" width="58" height="${150 * (1 - eta) - 3}" rx="8" fill="#F2A3A3" fill-opacity=".7"/>
    ${T(x + 32, 40 + 150 * (1 - eta) + (150 * eta) / 2 + 5, `${Math.round(eta * 100)}%`, 16, '#fff')}${T(x + 32, 212, label, 12)}${T(x + 32, 228, `動力 ${Math.round(eta * 100)}% ／ 熱 ${Math.round((1 - eta) * 100)}%`, 10, '#6B5A44')}`;
  if(m.chain){
    const ch = m.chain; let acc = 1;
    const boxes = ch.map((c, i) => { acc *= c[1]; const x = 8 + i * (284 / ch.length); return `<rect x="${x + 3}" y="70" width="${284 / ch.length - 8}" height="64" rx="10" fill="#fff" stroke="#BFDDEE" stroke-width="3"/>${T(x + 3 + (284 / ch.length - 8) / 2, 94, c[0], 12)}${T(x + 3 + (284 / ch.length - 8) / 2, 120, Math.round(c[1] * 100) + '%', 18, '#C27A1C')}${i < ch.length - 1 ? T(x + 284 / ch.length - 2, 106, '×', 16, '#8A7A65') : ''}`; }).join('');
    return SVGW(300, 260, `${frame(300, 260)}${T(150, 34, m.title || 'エネルギーの 流れ', 14)}${boxes}${T(150, 168, 'ぜんぶ かけあわせた 効率', 13)}<rect x="30" y="180" width="240" height="26" rx="13" fill="#EFE5D3"/><rect x="30" y="180" width="${240 * clampN(v.eta / 100, 0, 1)}" height="26" rx="13" fill="#4CB84C"/>${T(150, 199, `あなたの こたえ：${v.eta}%`, 14, '#fff')}${T(150, 238, '発電 → 送電 → 充電 → モーター', 12, '#6B5A44')}`);
  }
  return SVGW(300, 260, `${frame(300, 260)}${bar(42, 'ガソリン車', m.etaG || .3, '#E8803A')}${bar(190, 'でんき車', m.etaE || .9, '#3C93DC')}${T(150, 24, 'エネルギーの ゆくえ（赤＝むだな 熱）', 12, '#6B5A44')}`)
    + (m.showAns ? `<div class="sxGs">${gauge(clampN(v.ans / m.max * 100, 0, 100), `あなたの こたえ：${r1(v.ans)}${m.u || ''}`, '#4CB84C')}</div>` : '');
}
LABDEF.evgas = star => {
  const ms = [];
  if(star === 4){
    ms.push({showAns:1, max:9, u:' kWh', text:'ガソリン 1 L は 約 9 kWh の エネルギー。熱効率 30% の エンジンで、動力に なる のは 何 kWh？', ctrl:[slid('ans', '動力に なる 量', 0, 9, .1, 0, ' kWh')], view:evView, check:v => Math.abs(v.ans - 2.7) <= .3 ? {ok:true} : {ok:false, msg:`いまは ${r1(v.ans)} kWh。9 × 0.3 を 計算しよう`}, explain:'9 × 0.3 ＝ 2.7 kWh。のこり 6.3 kWh は 熱として すてられる。', answer:'2.7 kWh。'});
    ms.push({showAns:1, max:10, u:' kWh', text:'バッテリー 10 kWh の でんき車。モーターの 効率 90% なら、動力に なる のは 何 kWh？', ctrl:[slid('ans', '動力に なる 量', 0, 10, .1, 0, ' kWh')], view:evView, check:v => Math.abs(v.ans - 9) <= .4 ? {ok:true} : {ok:false, msg:`いまは ${r1(v.ans)} kWh`}, explain:'10 × 0.9 ＝ 9 kWh。モーターは 熱に なる むだが 少ない。', answer:'9 kWh。'});
    ms.push({text:'同じ エネルギーを つかった とき、走る ための 動力に かえる わりあいが 大きい のは？', showAns:0, ctrl:[], view:evView, choices:['でんき車（モーター）', 'ガソリン車（エンジン）', 'どちらも 同じ', 'ガソリン車の ほうが 2ばい'], ans:0, explain:'モーターは 約 9割、ガソリンエンジンは 約 3割 が 動力に なる。'});
  } else if(star === 5){
    [[15, .15], [30, .15], [48, .12]].forEach(([B, e]) => { const km = Math.round(B / e);
      ms.push({showAns:1, max:500, u:' km', etaG:.3, etaE:.9, text:`バッテリー ${B} kWh、1 km 走る のに 電気 ${e} kWh（電費）を つかう 車。満充電で 走れる きょりは？`, ctrl:[slid('ans', '走れる きょり', 0, 500, 5, 0, ' km')], view:evView, check:v => Math.abs(v.ans - km) <= Math.max(10, km * .05) ? {ok:true} : {ok:false, msg:`いまは ${v.ans} km。${B} ÷ ${e} を 計算しよう`}, explain:`きょり ＝ 電気の 量 ÷ 電費 ＝ ${B} ÷ ${e} ＝ 約 ${km} km。`, answer:`約 ${km} km。`}); });
  } else {
    const chainE = [['発電所', .4], ['送電', .95], ['充電', .9], ['モーター', .9]];
    const tot = Math.round(.4 * .95 * .9 * .9 * 1000) / 10;
    ms.push({chain:chainE, title:'でんき車の 総合効率（火力発電の 電気）', text:'火力発電（効率 40%）の 電気で 走る でんき車。発電 → 送電 → 充電 → モーター の 効率を ぜんぶ かけた 総合効率は？（±2%）', ctrl:[slid('eta', 'あなたの こたえ', 0, 100, 1, 10, '%')], view:evView, check:v => Math.abs(v.eta - tot) <= 2 ? {ok:true} : {ok:false, msg:`いまは ${v.eta}%。0.40 × 0.95 × 0.90 × 0.90 を 計算しよう`}, explain:`0.40 × 0.95 × 0.90 × 0.90 ＝ 約 ${tot}%。ガソリン車の 熱効率（約 30%）と それほど かわらない！`, answer:`約 ${tot}%。`});
    const chain2 = [['発電所', .6], ['送電', .95], ['充電', .9], ['モーター', .9]], tot2 = Math.round(.6 * .95 * .9 * .9 * 1000) / 10;
    ms.push({chain:chain2, title:'最新の 火力発電（効率 60%）の 場合', text:'最新の 発電所（効率 60%）に すると、でんき車の 総合効率は？（±2%）', ctrl:[slid('eta', 'あなたの こたえ', 0, 100, 1, 10, '%')], view:evView, check:v => Math.abs(v.eta - tot2) <= 2 ? {ok:true} : {ok:false, msg:`いまは ${v.eta}%`}, explain:`0.60 × 0.95 × 0.90 × 0.90 ＝ 約 ${tot2}%。発電所が よく なる ほど でんき車の 総合効率も 上がる。`, answer:`約 ${tot2}%。`});
    ms.push({chain:chainE, title:'総合効率で かんがえよう', text:'総合効率だけ 見ると、でんき車と ガソリン車が ほぼ 同じ に なる 場合が ある。それでも でんき車が CO₂ を へらす ために 役立つ のは どんな とき？', ctrl:[slid('eta', '', 0, 100, 1, tot, '%', true)], view:evView, choices:['太陽光など 再生可能エネルギーで 発電した 電気を 使う とき', '夜に 充電 すれば かならず', 'タイヤを 大きく した とき', 'ガソリンを まぜた とき'], ans:0, explain:'再生可能エネルギーの 電気なら 発電で CO₂ が ほとんど 出ない。どんな 電気を 使うか が だいじ。'});
  }
  return ms;
};

/* ===================== ひかり：レンズの ふしぎ ===================== */
function lensView(v, m){
  const f = m.f, a = v.a, scl = 2.4, X0 = 150, Y0 = 118, h0 = 34;
  const bv = a === f ? Infinity : a * f / (a - f), real = a > f, mag = bv === Infinity ? 0 : Math.abs(bv) / a;
  const ox = X0 - a * scl, ix = Math.min(308, X0 + bv * scl);   /* 虚像は bv<0 → 左側 */
  const ih = bv === Infinity ? 0 : Math.min(92, h0 * mag);
  const sx = m.screen ? X0 + v.s * scl : null;
  const blur = m.screen ? Math.min(8, Math.abs(v.s - bv) * .35) : 0, filt = `lf${Math.round(Math.abs(v.s || 0))}`;
  let rays = '', img = '';
  if(real && isFinite(bv)){
    rays = `<path d="M${ox} ${Y0 - h0}H${X0}L${ix} ${Y0 + ih}" fill="none" stroke="#E8414B" stroke-width="2"/><path d="M${ox} ${Y0 - h0}L${X0} ${Y0}L${ix} ${Y0 + ih}" fill="none" stroke="#F2A33A" stroke-width="2"/>`;
    img = `<path d="M${ix} ${Y0}v${ih}" stroke="#2C6FB0" stroke-width="5"/><path d="M${ix - 5} ${Y0 + ih - 6}l5 7l5 -7" fill="none" stroke="#2C6FB0" stroke-width="3"/>`;
  } else if(!real && a < f){
    const vx = ix; rays = `<path d="M${ox} ${Y0 - h0}H${X0}L${X0 + 60} ${Y0 - h0 + 60 * h0 / (f * scl)}" fill="none" stroke="#E8414B" stroke-width="2"/><path d="M${ox} ${Y0 - h0}L${X0} ${Y0}L${X0 + 70} ${Y0 + 70 * h0 / (X0 - ox)}" fill="none" stroke="#F2A33A" stroke-width="2"/>
      <path d="M${X0} ${Y0 - h0}L${vx} ${Y0 - ih}" stroke="#E8414B" stroke-width="2" stroke-dasharray="4 4"/><path d="M${X0} ${Y0}L${vx} ${Y0 - ih}" stroke="#F2A33A" stroke-width="2" stroke-dasharray="4 4"/>`;
    img = `<path d="M${vx} ${Y0}v${-ih}" stroke="#2C6FB0" stroke-width="5" stroke-dasharray="5 4" opacity=".8"/><path d="M${vx - 5} ${Y0 - ih + 6}l5 -7l5 7" fill="none" stroke="#2C6FB0" stroke-width="3"/>`;
  }
  const info = a === f ? '焦点の 上：像は できない（光が 平行に なる）' : real ? `実像：${r1(bv)} cm ／ 大きさ ${r1(mag)} 倍（さかさま）` : `虚像：レンズの 手前 ${r1(-bv)} cm ／ ${r1(mag)} 倍（正立）`;
  return SVGW(320, 240, `<rect x="2" y="2" width="316" height="236" rx="22" fill="#F4FBFF" stroke="#BFDDEE" stroke-width="3"/><path d="M10 ${Y0}H310" stroke="#8A929C" stroke-width="2"/>
    <path d="M${X0} ${Y0 - 70}C${X0 + 14} ${Y0 - 30} ${X0 + 14} ${Y0 + 30} ${X0} ${Y0 + 70}C${X0 - 14} ${Y0 + 30} ${X0 - 14} ${Y0 - 30} ${X0} ${Y0 - 70}z" fill="#BFE7FF" fill-opacity=".7" stroke="#2C6FB0" stroke-width="2.5"/>
    ${[-1, 1].map(s => `<circle cx="${X0 + s * f * scl}" cy="${Y0}" r="4" fill="#9B6CE0"/>${T(X0 + s * f * scl, Y0 + 18, 'F', 12, '#9B6CE0')}`).join('')}
    ${rays}<path d="M${ox} ${Y0}v${-h0}" stroke="#4A3420" stroke-width="5"/><path d="M${ox - 5} ${Y0 - h0 + 6}l5 -7l5 7" fill="none" stroke="#4A3420" stroke-width="3"/>${img}
    ${m.screen ? `<rect x="${sx - 3}" y="${Y0 - 60}" width="6" height="120" rx="3" fill="#fff" stroke="#8A929C" stroke-width="2"/>${isFinite(bv) && real ? `<g opacity="${Math.max(.15, 1 - blur / 8)}"><path d="M${sx} ${Y0}v${ih}" stroke="#2C6FB0" stroke-width="${5 + blur * 2}" stroke-linecap="round"/></g>` : ''}` : ''}
    ${T(160, 214, info, 11, '#4A3420')}${T(160, 232, `焦点距離 f ＝ ${f} cm ／ 物体 a ＝ ${a} cm`, 11, '#6B5A44')}`);
}
LABDEF.lens = star => {
  const aCtl = (v0 = 30, lock) => [slid('a', 'ものの 位置（レンズから）', 5, 45, 1, v0, ' cm', lock)];
  const ms = [];
  if(star === 3){
    ms.push({f:10, text:'焦点距離 10 cm の とつレンズ。スクリーンに うつる「実像」が できる 位置に ものを おこう（焦点より 遠く）', ctrl:aCtl(8), view:lensView, check:v => v.a > 10 ? {ok:true} : {ok:false, msg:'焦点より 近いと 実像は できないよ'}, explain:'ものが 焦点より 遠い とき、スクリーンに さかさまの 実像が できる。'});
    ms.push({f:10, text:'実像が ものより「大きく」なる 位置に しよう（焦点と 焦点距離の 2ばいの 間）', ctrl:aCtl(30), view:lensView, check:v => v.a > 10 && v.a < 20 ? {ok:true} : {ok:false, msg:v.a >= 20 ? 'まだ 遠いよ。もう少し ちかづけよう' : '焦点より 遠く しよう'}, explain:'f ＜ a ＜ 2f の とき、像は ものより 大きい 実像に なる。'});
    ms.push({f:10, text:'ものを 焦点より「近く」に おくと、レンズを のぞいた とき どう 見える？（位置を うごかして たしかめよう）', ctrl:aCtl(30), view:lensView, choices:['大きく 正立（同じ 向き）の 虚像', '小さく さかさま', '見えなく なる', '色が かわる'], ans:0, need:v => v.a < 10 ? null : 'まず ものを 焦点（10 cm）より 近づけて みよう', explain:'a ＜ f の とき、虚像が 大きく 見える。虫めがねの しくみ！'});
  } else if(star === 4){
    ms.push({f:10, text:'ものと 同じ 大きさの 実像（さかさま）が できる 位置に しよう（焦点距離の 2ばい ±1 cm）', ctrl:aCtl(30), view:lensView, check:v => Math.abs(v.a - 20) <= 1 ? {ok:true} : {ok:false, msg:`いまは ${v.a} cm。像の 大きさを 見くらべよう`}, explain:'a ＝ 2f の とき、像は 同じ 大きさ（1倍）で、レンズから 2f の 位置に できる。'});
    ms.push({f:10, text:'ものより「小さい」実像に するには、ものを どう する？（位置を うごかして たしかめよう）', ctrl:aCtl(14), view:lensView, choices:['2f より 遠くに おく', 'f と 2f の 間に おく', '焦点より 近く', 'レンズに くっつける'], ans:0, need:v => v.a > 20 ? null : 'まず ものを 遠ざけて みよう', explain:'a ＞ 2f の とき、像は 小さく なる（カメラの しくみ）。'});
    ms.push({f:10, text:'f ＝ 10 cm の レンズの 前 15 cm に もの。像は レンズの 何 cm うしろに できる？（式：1/a ＋ 1/b ＝ 1/f）', ctrl:aCtl(15, true), view:lensView, choices:['30 cm', '15 cm', '6 cm', '25 cm'], ans:0, explain:'1/b ＝ 1/10 − 1/15 ＝ 1/30。b ＝ 30 cm。'});
  } else {
    [[10, 15], [10, 30], [15, 30]].forEach(([f, a]) => { const b = a * f / (a - f);
      ms.push({f, screen:1, text:`f ＝ ${f} cm の レンズ。ものは ${a} cm の 位置。スクリーンを ずらして、像が くっきり うつる 位置を さがそう（±2 cm）`, ctrl:aCtl(a, true).concat([slid('s', 'スクリーンの 位置（レンズから）', 5, 65, 1, 8, ' cm')]), view:lensView, check:v => Math.abs(v.s - b) <= 2 ? {ok:true} : {ok:false, msg:`いまは ${v.s} cm。像が ぼやけて いるよ。1/a ＋ 1/b ＝ 1/f を 使おう`}, explain:`1/b ＝ 1/${f} − 1/${a}。b ＝ ${r1(b)} cm。`, answer:`スクリーンは ${r1(b)} cm の ところ。`}); });
  }
  return ms;
};

/* ===================== うちゅう：プラネタリウム ===================== */
function moonSVG(age, R = 54, cx = 0, cy = 0){
  const th = 2 * Math.PI * age / 29.53, c = Math.cos(th), rx = Math.abs(c) * R, wax = age <= 14.765;
  const sw1 = wax ? 1 : 0, sw2 = wax ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0);
  return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2C3558" stroke="#8A9AC8" stroke-width="2"/><path d="M${cx} ${cy - R}A${R} ${R} 0 0 ${sw1} ${cx} ${cy + R}A${rx} ${R} 0 0 ${sw2} ${cx} ${cy - R}Z" fill="#FFF4C2"/>`;
}
const phaseName = age => age < 1 || age > 28.5 ? '新月' : age < 6.4 ? '三日月' : age < 8.4 ? '上弦の月' : age < 13.8 ? '満ちて いく 月' : age < 15.8 ? '満月' : age < 21 ? '欠けて いく 月' : age < 23 ? '下弦の月' : '細い 月';
const SKY = {
  winter:{n:'冬', stars:[[-60,-50,'ベテルギウス',2],[40,-50,'',1],[-30,0,'',1],[0,0,'',1],[30,0,'',1],[-50,55,'',1],[50,55,'リゲル',2],[-110,40,'シリウス',3],[10,-95,'プロキオン',2]], lines:[[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]], label:'オリオン座・冬の 大三角'},
  spring:{n:'春', stars:[[-80,-40,'',1],[-40,-60,'',1],[0,-40,'',1],[30,-10,'デネボラ',2],[-20,10,'',1],[-90,10,'',1],[40,70,'スピカ',2],[-50,95,'アルクトゥルス',3]], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]], label:'しし座・春の 大曲線'},
  summer:{n:'夏', stars:[[-70,-70,'デネブ',3],[20,-20,'ベガ',3],[70,40,'アルタイル',3],[-40,70,'',1],[-10,95,'アンタレス',2]], lines:[[0,1],[1,2],[2,0],[3,4]], label:'夏の 大三角'},
  autumn:{n:'秋', stars:[[-60,-40,'',1],[40,-40,'',1],[40,40,'',1],[-60,40,'',1],[-100,-95,'',1],[-70,-85,'',1],[-45,-100,'',1]], lines:[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6]], label:'ペガスス座の 秋の 四辺形'}
};
const seasonOf = mo => mo <= 2 || mo === 12 ? 'winter' : mo <= 5 ? 'spring' : mo <= 8 ? 'summer' : 'autumn';
function planetView(v, m){
  if(m.kind === 'moon'){
    return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0E1530"/>${[...Array(16)].map((_, i) => `<circle cx="${(i * 61) % 290 + 5}" cy="${(i * 43) % 150 + 10}" r="1.5" fill="#fff" opacity=".7"/>`).join('')}${moonSVG(v.age, 62, 150, 98)}
      ${T(150, 196, `${phaseName(v.age)}（${r1(v.age)} 日め）`, 16, '#fff')}${m.rise ? T(150, 222, `月が のぼる 時刻 ≒ ${String(Math.floor((6 + v.age / 29.53 * 24) % 24)).padStart(2, '0')}時ごろ`, 14, '#FFE08A') : T(150, 222, '新月 → 満月 → 新月 で 約 29.5日', 12, '#9AA8D8')}`);
  }
  if(m.kind === 'season'){
    const S = SKY[seasonOf(v.mo)];
    return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0E1530"/><g transform="translate(150 128)">${S.lines.map(l => `<path d="M${S.stars[l[0]][0]} ${S.stars[l[0]][1]}L${S.stars[l[1]][0]} ${S.stars[l[1]][1]}" stroke="#8FB4FF" stroke-width="1.6" opacity=".7"/>`).join('')}${S.stars.map(s => `<circle cx="${s[0]}" cy="${s[1]}" r="${2 + s[3] * 1.4}" fill="#FFF4C2"/>${s[2] ? T(s[0], s[1] - 8, s[2], 8, '#CFE0FF') : ''}`).join('')}</g>
      ${T(150, 26, `${v.mo}月 夜9時ごろの 南の 空`, 14, '#fff')}${T(150, 244, S.label, 13, '#FFE08A')}`);
  }
  if(m.kind === 'rot'){
    const ang = v.h * 15, rot = a => `rotate(${-ang} 150 128)`;
    const dipper = [[-30,-62],[-18,-70],[-6,-72],[8,-66],[16,-52],[42,-50],[48,-70]], cas = [[-70,28],[-52,48],[-34,30],[-18,50],[0,30]];
    const grp = (pts, col) => `<g transform="${rot()}"><path d="M${pts.map(p => (150 + p[0]) + ' ' + (128 + p[1])).join('L')}" fill="none" stroke="${col}" stroke-width="1.6" opacity=".8"/>${pts.map(p => `<circle cx="${150 + p[0]}" cy="${128 + p[1]}" r="3" fill="#FFF4C2"/>`).join('')}</g>`;
    return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0E1530"/><circle cx="150" cy="128" r="104" fill="none" stroke="#2A3A7A" stroke-width="1.5" stroke-dasharray="4 5"/>${grp(dipper, '#8FB4FF')}${grp(cas, '#FFB08F')}
      <circle cx="150" cy="128" r="4.5" fill="#FFE08A"/>${T(150, 118, '北極星', 10, '#FFE08A')}${T(150, 22, `${v.h} 時間 たった（回った 角度 ${ang}°）`, 14, '#fff')}${T(150, 246, '北の 空：北極星の まわりを 反時計回りに 回る', 11, '#9AA8D8')}`);
  }
  /* top：太陽・地球・月 を 上から */
  const a = v.ang, rad = a * Math.PI / 180, mx = 150 + Math.cos(rad - Math.PI) * 74, my = 128 + Math.sin(rad - Math.PI) * 74 * -1;
  const age = a / 360 * 29.53, ecl = Math.abs(a - 0) <= 8 || Math.abs(a - 360) <= 8 ? '日食（太陽が かくれる）' : Math.abs(a - 180) <= 8 ? '月食（月が 地球の かげに 入る）' : '';
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0E1530"/><circle cx="22" cy="128" r="30" fill="#FFB02E"/><path d="M52 90H100M52 128H100M52 166H100" stroke="#FFE08A" stroke-width="2" opacity=".6"/>${T(24, 178, '太陽', 12, '#FFE08A')}
    <circle cx="150" cy="128" r="74" fill="none" stroke="#3A4A8A" stroke-dasharray="4 5"/><circle cx="150" cy="128" r="16" fill="#3C93DC"/>${T(150, 133, '地球', 10, '#fff')}<circle cx="${mx}" cy="${my}" r="9" fill="#FFF4C2" stroke="#8A9AC8" stroke-width="2"/>
    <g transform="translate(246 60)">${moonSVG(age, 22, 0, 0)}${T(0, 40, phaseName(age), 10, '#fff')}</g>${T(150, 232, ecl || `月の ち位置：${a}°`, 13, ecl ? '#FFE08A' : '#fff')}`);
}
LABDEF.planet = star => {
  const ms = [];
  if(star === 1){
    [['新月', 0, 1.2], ['三日月', 3.5, 1.5], ['上弦の月（半月）', 7.4, 1.3], ['満月', 14.8, 1.3], ['下弦の月（半月）', 22.1, 1.3]].sort(() => Math.random() - .5).slice(0, 3).forEach(([n, a0, tol]) =>
      ms.push({kind:'moon', text:`月の 日づけ（月齢）を うごかして「${n}」に しよう`, ctrl:[slid('age', '月齢（日）', 0, 29, .5, 10, ' 日')], view:planetView, check:v => Math.abs(v.age - a0) <= tol || (a0 === 0 && v.age >= 28.5) ? {ok:true} : {ok:false, msg:`いまは ${phaseName(v.age)}。もう少し うごかそう`}, explain:`月は 地球の まわりを 回る ため、太陽に 照らされる 部分の 見え方が 約 29.5日で かわる。${n}は 月齢 ${r1(a0)} 日ごろ。`, answer:`月齢 ${r1(a0)} 日 くらい。`}));
  } else if(star === 2){
    [['winter', 'オリオン座が 見える「冬」の 空（12・1・2月）'], ['summer', '夏の 大三角が 見える「夏」の 空（6〜8月）'], ['autumn', 'ペガスス座の 四辺形が 見える「秋」の 空（9〜11月）'], ['spring', 'しし座が 見える「春」の 空（3〜5月）']].sort(() => Math.random() - .5).slice(0, 3).forEach(([s, t]) =>
      ms.push({kind:'season', text:`月を えらんで、夜9時の 空に ${t}に しよう`, ctrl:[slid('mo', '月', 1, 12, 1, 4, '月')], view:planetView, check:v => seasonOf(v.mo) === s ? {ok:true} : {ok:false, msg:`${v.mo}月の 空は ${SKY[seasonOf(v.mo)].n}の 星座だよ`}, explain:'地球が 太陽の まわりを 回る ため、季節ごとに 夜に 見える 星座が かわる。', answer:`${SKY[s].n}の 月に しよう。`}));
  } else if(star === 3){
    ms.push({kind:'rot', text:'北の 空の 星は 北極星を 中心に 回る。ちょうど 90° 回った 時刻（何時間後？）に しよう', ctrl:[slid('h', '時間（じかん）', 0, 12, 1, 0, ' 時間')], view:planetView, check:v => v.h === 6 ? {ok:true} : {ok:false, msg:`いまは ${v.h * 15}°`}, explain:'地球が 1日（24時間）で 1回転 する ので、星は 1時間に 15° 動く。90°÷15°＝6時間。', answer:'6 時間。'});
    ms.push({kind:'rot', text:'星は 1時間に 何度 動いて 見える？（時間を うごかして たしかめよう）', ctrl:[slid('h', '時間（じかん）', 0, 12, 1, 0, ' 時間')], view:planetView, choices:['15°', '30°', '5°', '60°'], ans:0, need:v => v.h > 0 ? null : '時間を うごかして 角度を 見て みよう', explain:'360° ÷ 24時間 ＝ 15°/時間。'});
    ms.push({kind:'rot', text:'北極星は ほとんど 動かない のは なぜ？', ctrl:[slid('h', '時間（じかん）', 0, 12, 1, 0, ' 時間')], view:planetView, choices:['地球の 自転の 軸の ほぼ 真上に ある から', '地球に いちばん 近い から', '星が 止まって いる から', '月と 同じ 動きを する から'], ans:0, explain:'自転の 軸の 延長線上 だから、地球が 回っても ほとんど 位置が かわらない。'});
  } else if(star === 4){
    ms.push({kind:'moon', rise:1, text:'満月は 何時ごろ 東の 空から のぼる？（月齢を うごかして「月が のぼる 時刻」を 見よう）', ctrl:[slid('age', '月齢（日）', 0, 29, .5, 0, ' 日')], view:planetView, choices:['夕方 6時ごろ', '朝 6時ごろ', '正午ごろ', '真夜中'], ans:0, need:v => Math.abs(v.age - 14.8) <= 1.5 ? null : 'まず 満月（月齢 15日ごろ）に して 見よう', explain:'満月は 太陽と 反対がわに ある ので、夕方 のぼって 明け方 しずむ。'});
    ms.push({kind:'moon', rise:1, text:'新月に 近い 月は、いつ ごろ 空に あって 見えにくい？', ctrl:[slid('age', '月齢（日）', 0, 29, .5, 8, ' 日')], view:planetView, choices:['昼間（太陽と 同じ 方向）', '真夜中', '夕方だけ', '朝だけ'], ans:0, explain:'新月は 太陽と 同じ 方向に ある ので、昼の 空に あって 夜は 見えない。'});
    ms.push({kind:'moon', rise:1, text:'月が のぼる 時刻が 夜12時ごろ に なる のは、どの 月？（月齢を うごかして さがそう）', ctrl:[slid('age', '月齢（日）', 0, 29, .5, 3, ' 日')], view:planetView, check:v => { const t = (6 + v.age / 29.53 * 24) % 24; return Math.min(Math.abs(t - 0), Math.abs(t - 24)) <= 1.2 ? {ok:true} : {ok:false, msg:`いまは ${Math.floor(t)}時ごろ`}; }, explain:'月は 1日に 約 50分ずつ おそく のぼる。下弦の月（月齢 22日ごろ）が 夜12時ごろ。', answer:'月齢 22 日ごろ（下弦の月）。'});
  } else {
    ms.push({kind:'top', text:'太陽・地球・月が 一直線に なって、月が 地球の かげに 入る「月食」の 位置に しよう（±8°）', ctrl:[slid('ang', '月の 位置（°）', 0, 360, 2, 90, '°')], view:planetView, check:v => Math.abs(v.ang - 180) <= 8 ? {ok:true} : {ok:false, msg:`いまは ${v.ang}°`}, explain:'月食は 太陽 → 地球 → 月 の じゅんに 並び、満月の ときに おきる。', answer:'180° ごろ。'});
    ms.push({kind:'top', text:'月が 太陽を かくす「日食」の 位置に しよう（±8°）', ctrl:[slid('ang', '月の 位置（°）', 0, 360, 2, 90, '°')], view:planetView, check:v => Math.abs(v.ang) <= 8 || Math.abs(v.ang - 360) <= 8 ? {ok:true} : {ok:false, msg:`いまは ${v.ang}°`}, explain:'日食は 太陽 → 月 → 地球 の じゅんに 並び、新月の ときに おきる。', answer:'0° ごろ。'});
    ms.push({kind:'top', text:'毎月 新月と 満月が あるのに、日食・月食が 毎月は おきない のは なぜ？', ctrl:[slid('ang', '月の 位置（°）', 0, 360, 2, 90, '°')], view:planetView, choices:['月の 軌道が 地球の 軌道（黄道）に 対して 少し かたむいて いる から', '月が 毎月 小さく なる から', '地球が かげを つくらない から', '太陽が 動く から'], ans:0, explain:'月の 軌道は 約 5° かたむいて いる ので、新月・満月でも 3つが 一直線に ならない ことが 多い。'});
  }
  return ms;
};

/* ===================== うちゅう：てんきの ふしぎ ===================== */
function weatherView(v, m){
  if(m.kind === 'press'){
    const P = v.p, hi = P >= 1013, rings = [1, 2, 3, 4].map(i => `<circle cx="150" cy="120" r="${i * 24}" fill="none" stroke="${hi ? '#E8414B' : '#3C6FE0'}" stroke-width="2" opacity=".6"/>`).join('');
    const wx = P >= 1018 ? '晴れ' : P >= 1006 ? 'くもり' : 'あめ';
    const icon = wx === '晴れ' ? `<circle cx="150" cy="225" r="14" fill="#FFB02E"/>` : wx === 'くもり' ? `<ellipse cx="150" cy="226" rx="22" ry="11" fill="#B9C2CF"/>` : `<ellipse cx="150" cy="220" rx="22" ry="10" fill="#8A929C"/><path d="M140 232l-3 10M152 232l-3 10M164 232l-3 10" stroke="#3C6FE0" stroke-width="3" stroke-linecap="round"/>`;
    return SVGW(300, 260, `${frame(300, 260)}${rings}<circle cx="150" cy="120" r="26" fill="${hi ? '#FFE0E0' : '#E0E8FF'}" stroke="${hi ? '#E8414B' : '#3C6FE0'}" stroke-width="3"/>${T(150, 128, hi ? '高' : '低', 24, hi ? '#E8414B' : '#3C6FE0')}${T(150, 28, `中心の 気圧：${P} hPa`, 14)}
      ${hi ? '<path d="M60 120h-24M240 120h24M150 30v-12M150 210v12" stroke="#E8414B" stroke-width="4" stroke-linecap="round"/>' : '<path d="M36 120h24M264 120h-24M150 18v12M150 222v-12" stroke="#3C6FE0" stroke-width="4" stroke-linecap="round"/>'}
      ${icon}${T(150, 254, `天気：${wx}　${hi ? '（下りてくる 空気）' : '（のぼって いく 空気）'}`, 12, '#6B5A44')}`);
  }
  if(m.kind === 'front'){
    const cold = v.type === 'cold', h = v.h;
    const rain = cold ? (h >= -1 && h <= 2) : (h >= -6 && h <= 0), strong = cold && rain;
    const temp = cold ? (h < 0 ? 24 : 24 - Math.min(8, h * 4 + 2)) : (h < 0 ? 14 : 14 + Math.min(6, h * 2 + 1));
    const xf = 150 + h * 14;
    const wedge = cold ? `<path d="M${xf} 120L${xf - 18} 40L${xf + 48} 120z" fill="#3C6FE0" fill-opacity=".35" stroke="#3C6FE0" stroke-width="2"/><path d="M${xf - 18} 40q18-22 42-6q20-14 24 10q-26 4-66-4z" fill="#8A929C"/>` : `<path d="M${xf} 120L${xf - 120} 62L${xf - 120} 120z" fill="#E8414B" fill-opacity=".3" stroke="#E8414B" stroke-width="2"/><path d="M${xf - 110} 62h92v18h-92z" fill="#B9C2CF"/>`;
    const drops = rain ? Array.from({length:cold ? 7 : 9}, (_, i) => { const x = cold ? xf - 14 + i * 7 : xf - 100 + i * 12; return `<path d="M${x} ${96 + (i % 2) * 8}l-3 ${cold ? 18 : 10}" stroke="#3C6FE0" stroke-width="${cold ? 3 : 1.6}" stroke-linecap="round"/>`; }).join('') : '';
    return SVGW(300, 260, `${frame(300, 260)}<rect x="10" y="30" width="280" height="96" rx="10" fill="#EAF6FF"/><rect x="10" y="120" width="280" height="12" fill="#BFE8B0"/>${wedge}${drops}
      <path d="M${150 + h * 14} 132v-12" stroke="#8A7A65" stroke-width="2"/><g transform="translate(150 150)"><circle r="6" fill="#4A3420"/>${T(0, 22, 'あなたの 町', 11, '#4A3420')}</g>
      ${T(150, 24, cold ? '寒冷前線（つめたい 空気が もぐりこむ）' : '温暖前線（あたたかい 空気が はいあがる）', 13)}${T(150, 192, `前線が 通る 時刻から ${h >= 0 ? '+' : ''}${h} 時間`, 13)}${T(60, 220, `気温 ${Math.round(temp)}℃`, 14, '#C2541F')}${T(190, 220, rain ? (strong ? 'はげしい 雨（せまい はんい）' : 'しとしと 雨（ひろい はんい）') : '雨は ふって いない', 12, '#2C6FB0')}`);
  }
  if(m.kind === 'iso'){
    const sp = v.sp, wind = Math.round(48 / sp), lines = [0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * sp * 13} 30Q${60 + i * sp * 13} 120 ${40 + i * sp * 13} 214" fill="none" stroke="#6B7AA8" stroke-width="2"/>`).join('');
    const arrows = [0, 1, 2].map(i => `<path d="M${54 + i * 6} ${70 + i * 54}h${Math.min(60, wind * 3)}l-8 -6m8 6l-8 6" stroke="#E8414B" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    return SVGW(300, 260, `${frame(300, 260)}${lines}${arrows}${T(150, 24, `等圧線の 間隔：${sp}（×100 km）`, 13)}${T(150, 246, `ふく 風の 速さ ≒ ${wind} m/秒`, 15, '#E8414B')}`) + `<div class="sxGs">${gauge(wind / 24 * 100, '風の 強さ', '#E8414B')}</div>`;
  }
  /* pat：気圧配置 */
  const P = m.pat;
  let body = '';
  if(P === 'winter') body = `${[0, 1, 2, 3, 4].map(i => `<path d="M${180 + i * 12} 30Q${196 + i * 12} 120 ${180 + i * 12} 220" fill="none" stroke="#6B7AA8" stroke-width="2"/>`).join('')}${T(70, 120, '高', 34, '#E8414B')}${T(250, 120, '低', 34, '#3C6FE0')}<path d="M130 70l-40 20M136 110l-40 14M130 150l-40 14" stroke="#E8414B" stroke-width="3" opacity=".5"/>`;
  else if(P === 'baiu') body = `<path d="M20 124H280" stroke="#3C6FE0" stroke-width="5" stroke-dasharray="14 10"/><path d="M20 124H280" stroke="#E8414B" stroke-width="5" stroke-dasharray="10 14" stroke-dashoffset="12"/>${T(80, 70, '高', 28, '#E8414B')}${T(220, 190, '高', 28, '#E8414B')}${T(150, 150, '停滞前線', 14, '#6B5A44')}`;
  else if(P === 'summer') body = `${[1, 2, 3].map(i => `<circle cx="210" cy="170" r="${i * 30}" fill="none" stroke="#E8414B" stroke-width="2" opacity=".6"/>`).join('')}${T(210, 180, '高', 32, '#E8414B')}${T(60, 60, '低', 20, '#3C6FE0')}`;
  else body = `${[1, 2, 3].map(i => `<circle cx="150" cy="120" r="${i * 24}" fill="none" stroke="#3C6FE0" stroke-width="2" opacity=".6"/>`).join('')}${T(150, 130, '低', 34, '#3C6FE0')}<path d="M232 120a82 82 0 0 0-30-60M68 120a82 82 0 0 0 30 60" stroke="#E8414B" stroke-width="3" fill="none"/><path d="M206 66l-4-8 9 1M94 174l4 8-9-1" stroke="#E8414B" stroke-width="3" fill="none"/>`;
  return SVGW(300, 260, `${frame(300, 260)}${body}${T(150, 250, m.cap || '', 12, '#6B5A44')}`);
}
LABDEF.weather = star => {
  const ms = [];
  if(star === 2){
    ms.push({kind:'press', text:'中心の 気圧を かえて、天気を「晴れ」に しよう（1018 hPa いじょう）', ctrl:[slid('p', '中心の 気圧', 980, 1040, 2, 1010, ' hPa')], view:weatherView, check:v => v.p >= 1018 ? {ok:true} : {ok:false, msg:`いまは ${v.p} hPa`}, explain:'高気圧の 中心では 空気が 下りてきて 雲が できにくい ので 晴れる。', answer:'1018 hPa いじょう。'});
    ms.push({kind:'press', text:'こんどは「あめ」に しよう（1004 hPa いか）', ctrl:[slid('p', '中心の 気圧', 980, 1040, 2, 1020, ' hPa')], view:weatherView, check:v => v.p < 1006 ? {ok:true} : {ok:false, msg:`いまは ${v.p} hPa`}, explain:'低気圧の 中心では 空気が 上へ のぼり、雲が できて 雨が ふりやすい。', answer:'1004 hPa いか。'});
    ms.push({kind:'press', text:'低気圧の 中心 付近では、空気は どう 動く？（気圧を かえて ようすを 見よう）', ctrl:[slid('p', '中心の 気圧', 980, 1040, 2, 1010, ' hPa')], view:weatherView, choices:['上へ のぼって いく（上昇気流）', '下へ おりて くる', '動かない', '地面に そって まわるだけ'], ans:0, explain:'低気圧では 中心に 向かって 風が ふきこみ、上昇気流に なる。'});
  } else if(star === 3){
    const fr = [tgl('type', '前線の しゅるい', [['cold', '寒冷前線'], ['warm', '温暖前線']], 'cold'), slid('h', '時刻（前線が 通る のが 0）', -6, 6, 1, -3, ' 時間')];
    ms.push({kind:'front', text:'せまい はんいで「はげしい 雨」が ふる 前線に しよう（種類を えらんで「けってい！」）', ctrl:fr, view:weatherView, check:v => v.type === 'cold' ? {ok:true} : {ok:false, msg:'温暖前線は ひろい はんいに しとしと 雨だよ'}, explain:'寒冷前線は つめたい 空気が 暖かい 空気の 下へ もぐり、積乱雲が できる。', answer:'寒冷前線。'});
    ms.push({kind:'front', text:'ひろい はんいで 長い 間「しとしと 雨」が つづく 前線に しよう', ctrl:fr, view:weatherView, check:v => v.type === 'warm' ? {ok:true} : {ok:false, msg:'寒冷前線は せまく はげしいよ'}, explain:'温暖前線は 暖かい 空気が ゆるやかに はいあがり、乱層雲が ひろがる。', answer:'温暖前線。'});
    ms.push({kind:'front', text:'前線が 通った あと、気温が 急に 下がる のは どちら？（時刻を うごかして たしかめよう）', ctrl:fr, view:weatherView, choices:['寒冷前線', '温暖前線', 'どちらも 同じ', 'どちらも 上がる'], ans:0, explain:'寒冷前線の あとは つめたい 空気に おおわれる ので 気温が 下がる。温暖前線の あとは 上がる。'});
  } else if(star === 4){
    ms.push({kind:'iso', text:'等圧線の 間隔を かえて、強い 風（20 m/秒 いじょう）に しよう', ctrl:[slid('sp', '等圧線の 間隔', 1, 8, 1, 6, '')], view:weatherView, check:v => 48 / v.sp >= 20 ? {ok:true} : {ok:false, msg:`いまは ${Math.round(48 / v.sp)} m/秒`}, explain:'等圧線の 間隔が せまい ほど 気圧の ちがいが 大きく、風が 強く なる。', answer:'間隔 2 いか。'});
    ms.push({kind:'iso', text:'おだやかな 風（8 m/秒 いか）に しよう', ctrl:[slid('sp', '等圧線の 間隔', 1, 8, 1, 2, '')], view:weatherView, check:v => 48 / v.sp <= 8 ? {ok:true} : {ok:false, msg:`いまは ${Math.round(48 / v.sp)} m/秒`}, explain:'等圧線の 間隔が ひろい ところは 風が 弱い。', answer:'間隔 6 いじょう。'});
    ms.push({kind:'iso', text:'天気図で 等圧線の 間隔が せまい ところは、風が どう なる？', ctrl:[slid('sp', '等圧線の 間隔', 1, 8, 1, 4, '')], view:weatherView, choices:['強い', '弱い', 'ほとんど ない', '同じ'], ans:0, explain:'間隔が せまい ＝ 気圧の かたむきが 大きい ＝ 風が 強い。'});
  } else {
    ms.push({kind:'pat', pat:'winter', cap:'日本の ある 季節の 気圧配置', text:'左（西）に 高気圧、右（東）に 低気圧。等圧線が 東がわに 集まって いる。この 気圧配置を 何という？', ctrl:[], view:weatherView, choices:['西高東低（冬）', '南高北低（夏）', '梅雨', '台風'], ans:0, explain:'冬は ユーラシア大陸の 高気圧と 日本の 東の 低気圧で 西高東低。北西の 強い 季節風が ふき、日本海側は 雪が 多い。'});
    ms.push({kind:'pat', pat:'baiu', cap:'ほぼ 動かない 前線', text:'東西に のびて ほとんど 動かない 前線が ある。この 前線の 名前は？', ctrl:[], view:weatherView, choices:['停滞前線（梅雨前線）', '寒冷前線', '温暖前線', '閉そく前線'], ans:0, explain:'北の つめたい 空気と 南の 暖かい 空気が ぶつかり あって 動かない のが 停滞前線。梅雨や 秋雨の 原因。'});
    ms.push({kind:'pat', pat:'typhoon', cap:'台風（北半球）', text:'北半球の 台風（低気圧）では、風は 中心に 向かって どう ふきこむ？', ctrl:[], view:weatherView, choices:['反時計回りに ふきこむ', '時計回りに ふきこむ', 'まっすぐ 外へ ふき出す', '上から ふきおろす'], ans:0, explain:'北半球では 地球の 自転の えいきょう（転向力）で、低気圧の まわりを 反時計回りに 風が ふきこむ。'});
  }
  return ms;
};

/* ===================== いのち：いでんの ふしぎ ===================== */
function seedSVG(x, y, r, wr, col){
  return wr ? `<path d="M${x - r} ${y}q${r * .3} ${-r * .9} ${r} ${-r * .8}q${r * .8} ${r * .2} ${r * .8} ${r * .8}q${-r * .2} ${r * .9} ${-r * .8} ${r * .9}q${-r} ${r * .1} ${-r} ${-r}z" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M${x - r * .4} ${y - r * .3}l${r * .5} ${r * .3}m${-r * .1} ${-r * .4}l${r * .5} ${r * .4}" stroke="rgba(0,0,0,.3)" stroke-width="1.6" fill="none"/>`
    : `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="2"/><ellipse cx="${x - r * .3}" cy="${y - r * .35}" rx="${r * .25}" ry="${r * .15}" fill="#fff" fill-opacity=".6"/>`;
}
const gam = g => g.split('');
const GENO = ['RR', 'Rr', 'rr'];
function geneView(v, m){
  if(m.kind === 'di'){
    const G = ['RY', 'Ry', 'rY', 'ry'], cell = 50, x0 = 52, y0 = 52; let cnt = {ry:0, rY:0, Ry:0, RY:0}, out = '';
    out += G.map((g, i) => T(x0 + i * cell + cell / 2, y0 - 8, g, 12) + T(x0 - 22, y0 + i * cell + cell / 2 + 4, g, 12)).join('');
    G.forEach((a, i) => G.forEach((b, j) => { const A = a[0] + b[0], Bb = a[1] + b[1], rd = /R/.test(A), yl = /Y/.test(Bb), col = yl ? '#E5D47A' : '#7FBF5A'; cnt[(rd ? 'R' : 'r') + (yl ? 'Y' : 'y')]++; out += `<rect x="${x0 + j * cell}" y="${y0 + i * cell}" width="${cell}" height="${cell}" fill="#fff" stroke="#BFDDEE" stroke-width="2"/>${seedSVG(x0 + j * cell + cell / 2, y0 + i * cell + cell / 2, 15, !rd, col)}`; }));
    return SVGW(300, 290, `${frame(300, 290)}${out}${T(150, 28, 'RrYy × RrYy（丸・黄色が 優性）', 13)}${T(150, 276, `丸黄 ${cnt.RY}／丸緑 ${cnt.Ry}／しわ黄 ${cnt.rY}／しわ緑 ${cnt.ry}`, 13, '#4A3420')}`);
  }
  if(m.kind === 'sex'){
    const mo = v.mom, fa = v.dad, ga = mo.split('|'), gb = fa.split('|');
    const lab = g => g === 'Xc' ? 'Xc' : g === 'XC' ? 'X' : g, col = c => c === 'Y' ? '#8FB4FF' : '#F0A0C0';
    const kids = ga.map(a => gb.map(b => [a, b]));
    let out = '';
    ga.forEach((a, i) => { out += T(116 + i * 80, 78, a === 'Xc' ? 'Xᶜ' : a, 15, a === 'Xc' ? '#E8414B' : '#4A3420'); });
    gb.forEach((b, j) => { out += T(60, 118 + j * 70, b === 'Xc' ? 'Xᶜ' : b, 15, b === 'Xc' ? '#E8414B' : '#4A3420'); });
    let aff = 0;
    ga.forEach((a, i) => gb.forEach((b, j) => { const boy = b === 'Y', cc = boy ? a === 'Xc' : (a === 'Xc' && b === 'Xc'), car = !boy && (a === 'Xc') !== (b === 'Xc'); if(cc) aff++;
      out += `<rect x="${78 + i * 80}" y="${90 + j * 70}" width="76" height="64" rx="10" fill="${boy ? '#E6F0FF' : '#FFE6F0'}" stroke="${cc ? '#E8414B' : '#BFDDEE'}" stroke-width="${cc ? 4 : 2}"/>${T(116 + i * 80, 118 + j * 70, boy ? '男の子' : '女の子', 12)}${T(116 + i * 80, 138 + j * 70, cc ? '色覚異常' : car ? '保因者' : 'ふつう', 12, cc ? '#E8414B' : '#6B5A44')}`; }));
    return SVGW(300, 250, `${frame(300, 250)}${T(150, 26, '色覚異常の 遺伝（Xᶜ の 遺伝子）', 13)}${T(150, 46, `母：${mo.replace('|', ' ')}　父：${fa.replace('|', ' ')}`, 12, '#6B5A44')}${out}`);
  }
  const p1 = v.p1, p2 = v.p2, g1 = gam(p1), g2 = gam(p2), cell = 62, x0 = 100, y0 = 70;
  let out = '', n = {R:0, r:0};
  g1.forEach((a, i) => { out += T(x0 + i * cell + cell / 2, y0 - 10, a, 18, a === 'R' ? '#2F8A2F' : '#C2541F'); });
  g2.forEach((b, j) => { out += T(x0 - 22, y0 + j * cell + cell / 2 + 6, b, 18, b === 'R' ? '#2F8A2F' : '#C2541F'); });
  g1.forEach((a, i) => g2.forEach((b, j) => { const g = [a, b].sort().join(''), wr = g === 'rr'; wr ? n.r++ : n.R++; out += `<rect x="${x0 + i * cell}" y="${y0 + j * cell}" width="${cell}" height="${cell}" fill="#fff" stroke="#BFDDEE" stroke-width="2"/>${seedSVG(x0 + i * cell + cell / 2, y0 + j * cell + cell / 2 - 6, 17, wr, wr ? '#C9A855' : '#E5D47A')}${T(x0 + i * cell + cell / 2, y0 + j * cell + cell - 8, g, 12)}`; }));
  return SVGW(300, 250, `${frame(300, 250)}${T(150, 24, `親：${p1} × ${p2}（丸 R が 優性）`, 13)}${out}${T(150, 238, `丸 ${n.R} ： しわ ${n.r}`, 15, '#4A3420')}`);
}
LABDEF.gene = star => {
  const par = [tgl('p1', '親Aの 遺伝子', GENO.map(g => [g, g]), 'RR'), tgl('p2', '親Bの 遺伝子', GENO.map(g => [g, g]), 'rr')];
  const ms = [];
  const has = (v, f) => { const g1 = gam(v.p1), g2 = gam(v.p2); const res = []; g1.forEach(a => g2.forEach(b => res.push([a, b].sort().join('')))); return f(res); };
  if(star === 3){
    ms.push({kind:'one', text:'純系の 丸（RR）と しわ（rr）を かけあわせると、子（F1）は？（親を RR と rr に して ためそう）', ctrl:par, view:geneView, choices:['すべて 丸', 'すべて しわ', '丸：しわ ＝ 1：1', '丸：しわ ＝ 3：1'], ans:0, need:v => (v.p1 === 'RR' && v.p2 === 'rr') || (v.p1 === 'rr' && v.p2 === 'RR') ? null : 'まず 親を RR と rr に して ようすを 見よう', explain:'F1 は ぜんぶ Rr。丸（R）が 優性 なので すべて 丸い 種。（優性の 法則）'});
    ms.push({kind:'one', text:'子の 半分（50%）が「しわ」に なる 組み合わせを 作ろう（親を えらんで「けってい！」）', ctrl:par, view:geneView, check:v => has(v, r => r.filter(x => x === 'rr').length === 2 && r.length === 4) ? {ok:true} : {ok:false, msg:'子の 4つの うち 2つが rr に なる 組み合わせを さがそう'}, explain:'Rr × rr だと、子は Rr と rr が 1：1。しわ（rr）が 半分。', answer:'Rr × rr。'});
    ms.push({kind:'one', text:'子が ぜったいに「しわ」に ならない 組み合わせを 1つ 作ろう', ctrl:par, view:geneView, check:v => has(v, r => !r.includes('rr')) ? {ok:true} : {ok:false, msg:'rr が 1つでも できて しまうよ。親の どちらかを RR に しよう'}, explain:'どちらかの 親が RR なら、子は かならず R を もらう ので しわ（rr）には ならない。', answer:'RR × なんでも。'});
  } else if(star === 4){
    const par2 = [tgl('p1', '親Aの 遺伝子', GENO.map(g => [g, g]), 'Rr'), tgl('p2', '親Bの 遺伝子', GENO.map(g => [g, g]), 'Rr')];
    ms.push({kind:'one', text:'Rr × Rr の 子（F2）の「丸：しわ」の 比は？', ctrl:par2, view:geneView, choices:['3：1', '1：1', '1：3', '2：1'], ans:0, explain:'RR：Rr：rr ＝ 1：2：1。丸（RR・Rr）3 に 対して しわ（rr）1。（分離の 法則）'});
    ms.push({kind:'one', text:'Rr × Rr の 種を 400こ まいた。しわの 種は およそ 何こ 生まれる？', ctrl:par2, view:geneView, choices:['約 100こ', '約 200こ', '約 300こ', '約 400こ'], ans:0, explain:'しわの わりあいは 1/4。400 × 1/4 ＝ 100 こ。'});
    ms.push({kind:'one', text:'丸い 種の 親（遺伝子型が わからない）に しわ（rr）を かけたら、子に しわが 出た。丸い 親の 遺伝子型は？', ctrl:[tgl('p1', '親Aの 遺伝子', GENO.map(g => [g, g]), 'RR'), tgl('p2', '親Bの 遺伝子', [['rr', 'rr']], 'rr')], view:geneView, choices:['Rr', 'RR', 'rr', 'どれでも'], ans:0, explain:'子に しわ（rr）が 出た なら、丸い 親は r を もって いる ので Rr。（検定交雑）'});
  } else if(star === 5){
    ms.push({kind:'di', text:'RrYy × RrYy の 子の「丸黄 : 丸緑 : しわ黄 : しわ緑」の 比は？', ctrl:[], view:geneView, choices:['9：3：3：1', '1：1：1：1', '3：1：3：1', '12：4：0：0'], ans:0, explain:'独立の 法則。丸と しわ（3：1）、黄と 緑（3：1）が 別々に 分かれる ので 3×3＝9、3×1＝3、1×3＝3、1×1＝1。'});
    ms.push({kind:'di', text:'この 16この 中で「しわで 緑」の 種は 何分の いくつ？', ctrl:[], view:geneView, choices:['1/16', '3/16', '9/16', '1/4'], ans:0, explain:'しわ（rr）は 1/4、緑（yy）も 1/4 なので 1/4 × 1/4 ＝ 1/16。'});
    ms.push({kind:'di', text:'丸い 種（丸黄＋丸緑）の わりあいは？', ctrl:[], view:geneView, choices:['3/4（12/16）', '9/16', '1/2', '1/4'], ans:0, explain:'丸黄 9 ＋ 丸緑 3 ＝ 12。12/16 ＝ 3/4。'});
  } else {
    const sx = [tgl('mom', '母', [['X|X', 'ふつう'], ['X|Xc', '保因者'], ['Xc|Xc', '色覚異常']], 'X|Xc'), tgl('dad', '父', [['X|Y', 'ふつう'], ['Xc|Y', '色覚異常']], 'X|Y')];
    ms.push({kind:'sex', text:'母が 保因者（X Xᶜ）、父が ふつう（X Y）。男の子が 色覚異常に なる 確率は？（母と 父を えらんで たしかめよう）', ctrl:sx, view:geneView, choices:['1/2（50%）', '0', '1/4', '1（100%）'], ans:0, need:v => v.mom === 'X|Xc' && v.dad === 'X|Y' ? null : '母を「保因者」、父を「ふつう」に して みよう', explain:'男の子は 母から X か Xᶜ を もらう。Xᶜ を もらうと 色覚異常（Y には 打ち消す 遺伝子が ない）。1/2。'});
    ms.push({kind:'sex', text:'母が 保因者、父が ふつう。女の子が 色覚異常に なる 確率は？', ctrl:sx, view:geneView, choices:['0', '1/2', '1/4', '1'], ans:0, need:v => v.mom === 'X|Xc' && v.dad === 'X|Y' ? null : '母を「保因者」、父を「ふつう」に して みよう', explain:'女の子は 父から かならず ふつうの X を もらう ので 色覚異常に ならない（保因者に なる ことは ある）。'});
    ms.push({kind:'sex', text:'母が 色覚異常（Xᶜ Xᶜ）、父が ふつう（X Y）。子は どう なる？', ctrl:sx, view:geneView, choices:['男の子は 全員 色覚異常、女の子は 全員 保因者', '全員 ふつう', '男女とも 全員 色覚異常', '女の子だけ 色覚異常'], ans:0, need:v => v.mom === 'Xc|Xc' && v.dad === 'X|Y' ? null : '母を「色覚異常」、父を「ふつう」に して みよう', explain:'男の子は 母の Xᶜ を もらい 全員 色覚異常。女の子は 母から Xᶜ、父から X で 保因者。'});
  }
  return ms;
};

/* ===================== くるま：かがみ めいろ ===================== */
const MIR_CFG = {2:{n:4, k:1, rock:0, stars:0, lim:99}, 3:{n:5, k:2, rock:0, stars:0, lim:99}, 4:{n:6, k:3, rock:0, stars:1, lim:99}, 5:{n:6, k:3, rock:4, stars:1, lim:4}, 6:{n:7, k:4, rock:5, stars:2, lim:4}};
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];    /* 右・下・左・上 */
function mirGen(star){
  const C = MIR_CFG[star];
  for(let tries = 0; tries < 400; tries++){
    const n = C.n, r0 = ri(0, n - 1); let r = r0, c = 0, d = 0; const used = new Set([r + ',' + c]), path = [[r, c]], mir = {};
    let ok = true;
    for(let t = 0; t < C.k && ok; t++){
      /* 進める 長さ（0 以上） */
      const maxS = d === 0 ? n - 1 - c : d === 2 ? c : d === 1 ? n - 1 - r : r, s = ri(t === 0 ? 1 : 1, Math.max(1, maxS));
      if(maxS < 1){ ok = false; break; }
      for(let i = 0; i < s; i++){ r += DIRS[d][1]; c += DIRS[d][0]; if(used.has(r + ',' + c)){ ok = false; break; } used.add(r + ',' + c); path.push([r, c]); }
      if(!ok) break;
      const nd = (d + (Math.random() < .5 ? 1 : 3)) % 4, room = nd === 0 ? n - 1 - c : nd === 2 ? c : nd === 1 ? n - 1 - r : r;
      if(room < 0) { ok = false; break; }
      mir[r + ',' + c] = (d === 0 && nd === 3) || (d === 3 && nd === 0) || (d === 2 && nd === 1) || (d === 1 && nd === 2) ? '/' : '\\';
      d = nd;
    }
    if(!ok) continue;
    /* まっすぐ 出口まで */
    let guard = 0; while(guard++ < 20){ const nr = r + DIRS[d][1], nc = c + DIRS[d][0]; if(nr < 0 || nc < 0 || nr >= n || nc >= n) break; r = nr; c = nc; if(used.has(r + ',' + c)){ ok = false; break; } used.add(r + ',' + c); path.push([r, c]); }
    if(!ok) continue;
    if(Object.keys(mir).length !== C.k) continue;
    const exit = {r, c, d};
    const free = []; for(let y = 0; y < n; y++) for(let x = 0; x < n; x++) if(!used.has(y + ',' + x)) free.push([y, x]);
    const rocks = shuf(free).slice(0, C.rock);
    const cand = path.filter(p => !mir[p[0] + ',' + p[1]] && !(p[0] === r0 && p[1] === 0) && !(p[0] === r && p[1] === c)); const stars = shuf(cand).slice(0, C.stars);
    if(stars.length < C.stars) continue;
    return {n, r0, mir, exit, rocks:rocks.map(x => x.join(',')), stars:stars.map(x => x.join(',')), lim:C.lim, k:C.k};
  }
  return mirGen(2);
}
function mirTrace(P, pl){
  const n = P.n; let r = P.r0, c = 0, d = 0, steps = 0; const pts = [[-0.5, r + .5]], hit = new Set(); let blocked = false, exit = null;
  const rocks = new Set(P.rocks);
  while(steps++ < 200){
    if(rocks.has(r + ',' + c)){ blocked = true; pts.push([c + .5, r + .5]); break; }
    hit.add(r + ',' + c);
    const m = pl[r + ',' + c];
    if(m){ pts.push([c + .5, r + .5]); d = m === '/' ? (d === 0 ? 3 : d === 3 ? 0 : d === 2 ? 1 : 2) : (d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2); }
    const nr = r + DIRS[d][1], nc = c + DIRS[d][0];
    if(nr < 0 || nc < 0 || nr >= n || nc >= n){ pts.push([c + .5 + DIRS[d][0] * .5, r + .5 + DIRS[d][1] * .5]); exit = {r, c, d}; break; }
    r = nr; c = nc;
  }
  return {pts, hit, blocked, exit};
}
const mirSolved = (P, pl) => { const t = mirTrace(P, pl); return !t.blocked && t.exit && t.exit.r === P.exit.r && t.exit.c === P.exit.c && t.exit.d === P.exit.d && P.stars.every(s => t.hit.has(s)); };
EXRUN.mirror = {
  init(E){ E.rounds = [0, 1, 2].map(() => mirGen(E.star)); E.pl = {}; E.done = false; E.msg = null; E.hintN = 0; E.show = false; },
  html(tab){
    const P = E.rounds[E.i], n = P.n, cs = 46, pad = 34, W = n * cs + pad * 2, H = n * cs + pad * 2;
    const tr = mirTrace(P, E.pl), solved = E.done && E.msg && E.msg.ok;
    let g = '';
    for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){
      const key = y + ',' + x, m = E.pl[key], isRock = P.rocks.includes(key), isStar = P.stars.includes(key), X0 = pad + x * cs, Y0 = pad + y * cs, sol = E.show && P.mir[key];
      g += `<g data-a="mrc" data-v="${key}" style="cursor:pointer"><rect x="${X0}" y="${Y0}" width="${cs}" height="${cs}" fill="${isRock ? '#B9AFA0' : '#fff'}" stroke="#BFDDEE" stroke-width="2"/>`;
      if(isRock) g += `<path d="M${X0 + 8} ${Y0 + 34}l8 -20l12 -4l10 14l-2 12z" fill="#8A7A65" stroke="#6B5A44" stroke-width="2"/>`;
      if(isStar) g += `<path d="M${X0 + 23} ${Y0 + 6}l5 11l12 1l-9 8l3 12l-11 -6l-11 6l3 -12l-9 -8l12 -1z" fill="${tr.hit.has(key) ? '#FFC93C' : '#FFE9A8'}" stroke="#E0A000" stroke-width="2"/>`;
      if(sol && !m) g += `<line x1="${X0 + 8}" y1="${P.mir[key] === '/' ? Y0 + 38 : Y0 + 8}" x2="${X0 + 38}" y2="${P.mir[key] === '/' ? Y0 + 8 : Y0 + 38}" stroke="#4CB84C" stroke-width="6" stroke-linecap="round" stroke-dasharray="3 7"/>`;
      if(m) g += `<line x1="${X0 + 8}" y1="${m === '/' ? Y0 + 38 : Y0 + 8}" x2="${X0 + 38}" y2="${m === '/' ? Y0 + 8 : Y0 + 38}" stroke="#2C6FB0" stroke-width="7" stroke-linecap="round"/>`;
      g += `</g>`;
    }
    const line = `<polyline points="${tr.pts.map(p => (pad + p[0] * cs).toFixed(1) + ',' + (pad + p[1] * cs).toFixed(1)).join(' ')}" fill="none" stroke="#E8414B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".85" pointer-events="none"/>`;
    const ex = P.exit, ed = DIRS[ex.d], gx = pad + (ex.c + .5 + ed[0] * .5) * cs, gy = pad + (ex.r + .5 + ed[1] * .5) * cs;
    const goal = `<g transform="translate(${gx + ed[0] * 14} ${gy + ed[1] * 14})"><circle r="13" fill="#4CB84C" stroke="#fff" stroke-width="3"/><path d="M-6 0l4 5l8 -10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    const src = `<g transform="translate(${pad - 20} ${pad + (P.r0 + .5) * cs})"><rect x="-16" y="-12" width="26" height="24" rx="6" fill="#4A3420"/><path d="M10 0h10" stroke="#FFD84A" stroke-width="4"/></g>`;
    const svg = SVGW(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="22" fill="#EAF6FF" stroke="#BFDDEE" stroke-width="3"/>${g}${line}${goal}${src}`);
    const used = Object.keys(E.pl).length, lim = P.lim < 99 ? `　つかえる かがみ：${used} / ${P.lim}` : '';
    const stage = `<div class="sxStage">${svg}</div>`;
    const stars = P.stars.length ? `<br>★の マスを ぜんぶ 通って ゴールへ！（${P.stars.filter(s => tr.hit.has(s)).length}/${P.stars.length}）` : '';
    const info = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / 3</span><p>${RB('光を ゴール（緑の ○）に とどけよう。マスを タッチすると かがみ（／ ＼ なし）が きりかわるよ。岩には 光が とどかない。' + lim + stars.replace('<br>', '　')).replace('　', '<br>')}</p><p style="font-size:.82em;color:#8A7A65;margin-top:4px">${RB('かがみで はねかえる とき、入る 角と 出る 角は 同じ（反射の 法則）。')}</p></div>`;
    const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいこう！' : 'こたえは これ！'}</b><p>${RB(E.msg.t)}</p></div>` : '';
    const acts = E.done ? `<button class="sxBtn big" data-a="mrn">${E.i + 1 >= 3 ? 'けっかへ' : 'つぎへ ▶'}</button>` : `<div class="sxQAct"><button class="sxBtn v sm" data-a="mrh">ヒント</button><button class="sxBtn w sm" data-a="mrg">わからない</button></div>`;
    const side = `${info}${fb}${acts}`;
    return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`;
  },
  tap(key){
    if(E.done) return; const P = E.rounds[E.i]; if(P.rocks.includes(key)) return;
    const cur = E.pl[key]; if(!cur){ if(Object.keys(E.pl).length >= P.lim){ try{ toast('かがみは ' + P.lim + 'こ まで！'); }catch(e){} snd('ng'); return; } E.pl[key] = '/'; } else if(cur === '/') E.pl[key] = '\\'; else delete E.pl[key];
    snd('tap');
    if(mirSolved(P, E.pl)){ E.done = true; E.ok++; E.msg = {ok:true, t:'光が ゴールに とどいたよ！ 反射の 法則を うまく 使えたね。'}; snd('ok'); }
    render();
  },
  hint(){ const P = E.rounds[E.i]; const need = Object.keys(P.mir).find(k => E.pl[k] !== P.mir[k]); if(need){ E.pl[need] = P.mir[need]; E.hintN++; snd('tap'); if(mirSolved(P, E.pl)){ E.done = true; E.msg = {ok:false, t:'ヒントで 正解に なったよ。つぎは じぶんの 力で！'}; } } render(); },
  give(){ const P = E.rounds[E.i]; E.show = true; E.done = true; E.pl = Object.assign({}, P.mir); E.msg = {ok:false, t:'この ように かがみを おくと、光が ゴールに とどくよ。'}; render(); },
  next(){ if(E.i + 1 >= 3) return expFinish(E.ok, 3); E.i++; E.pl = {}; E.done = false; E.msg = null; E.show = false; render(); }
};

/* ===================== いのち：からだの しくみ ===================== */
const ORD = {
  digest:{t:'食べ物が 口から こうもんまで 通る じゅんばんに タッチ！', cap:'しょうか（食べ物の 通り道）', nodes:[['口', 50, 12], ['食道', 50, 27], ['胃', 36, 44], ['小腸', 50, 62], ['大腸', 50, 78], ['肛門', 50, 92]]},
  circ:{t:'からだから もどった 血液が 通る じゅんばんに タッチ！（さいしょは 右心房）', cap:'血液の 流れ', nodes:[['右心房', 28, 36], ['右心室', 28, 62], ['肺', 50, 12], ['左心房', 72, 36], ['左心室', 72, 62], ['全身', 50, 90]], order:[0, 1, 2, 3, 4, 5]},
  circ2:{t:'血液が 大静脈から 大動脈まで 通る じゅんばんに タッチ！', cap:'血液の 流れ（くわしく）', nodes:[['大静脈', 18, 78], ['右心房', 26, 46], ['右心室', 26, 66], ['肺動脈', 22, 22], ['肺', 50, 8], ['肺静脈', 78, 22], ['左心房', 74, 46], ['左心室', 74, 66], ['大動脈', 82, 86]]},
  resp:{t:'空気が 鼻から 血液まで 通る じゅんばんに タッチ！', cap:'こきゅう（空気の 通り道）', nodes:[['鼻', 50, 8], ['気管', 50, 28], ['気管支', 50, 48], ['肺胞', 50, 68], ['毛細血管', 50, 90]]},
  kidney:{t:'尿が つくられて 体の 外へ 出る じゅんばんに タッチ！', cap:'はいせつ（尿の 通り道）', nodes:[['腎臓', 50, 14], ['輸尿管', 50, 38], ['ぼうこう', 50, 64], ['尿道', 50, 88]]}
};
const BQ = {
  1:[['食べ物を こまかく くだく のは どこ？', '口（歯）', ['胃だけ', '小腸', '大腸'], '口で かみくだいて、だ液と まぜる。'], ['心臓の はたらきは？', '血液を 全身に おくる ポンプ', ['食べ物を とかす', '空気を すう', '考える'], '心臓は 血液を おくり出す ポンプの はたらき。'],
     ['息を すうと、空気が まず 入る のは？', '鼻や 口から 気管', ['胃', '心臓', '大腸'], '空気は 鼻・口 → 気管 → 肺へ 進む。'], ['栄養を おもに 吸収する のは？', '小腸', ['胃', '大腸', '口'], '小腸の かべから 栄養が 血液に とりこまれる。'],
     ['ほねの はたらきは？', 'からだを ささえ、内ぞうを 守る', ['空気を すう', '食べ物を こなに する', '電気を おくる'], 'ほねは からだを ささえ、脳や 心臓を 守る。'], ['筋肉が ほねを 動かす とき、筋肉は どうなる？', '縮む（ちぢむ）', ['のびるだけ', '固まる', '消える'], '筋肉が 縮む ことで ほねが 動く。']],
  2:[['だ液の はたらきは？', 'でんぷんを 糖に 分ける', ['たんぱく質を 分ける', '脂肪を 分ける', '空気を きれいに する'], 'だ液に ふくまれる アミラーゼが でんぷんを 分ける。'], ['胃液に ふくまれ、たんぱく質を 分ける 酵素は？', 'ペプシン', ['アミラーゼ', 'リパーゼ', 'インスリン'], '胃液の ペプシンが たんぱく質を 分ける。'],
     ['酸素を 運ぶ のは 血液の 何？', '赤血球', ['白血球', '血小板', '血しょう'], '赤血球の ヘモグロビンが 酸素と むすびつく。'], ['体に 入った ばい菌を 食べる のは？', '白血球', ['赤血球', '血小板', '血しょう'], '白血球が 細菌などを とりこんで 体を 守る。'],
     ['血が 出た とき、固めて 止める のは？', '血小板', ['赤血球', '白血球', '血しょう'], '血小板が 集まって 傷口を ふさぐ。'], ['肝臓の はたらきとして 正しい のは？', '栄養の たくわえ・有害な ものの 分解', ['空気を すう', '尿を つくる', '血を 固める だけ'], '肝臓は 栄養を たくわえ、有害な ものを 分解する。']],
  3:[['肺で 行われる ガス交換 とは？', '酸素を とり入れ、二酸化炭素を 出す', ['栄養を 吸収する', '尿を つくる', '血を 固める'], '肺胞で 血液と 空気の 間で ガスが 交換される。'], ['肺に 空気が 入る とき、横隔膜は？', '下がる', ['上がる', '動かない', 'ふくらむ'], '横隔膜が 下がり、あばら骨が 上がって 胸が ひろがる。'],
     ['動脈には どんな 血液が 流れて いる？（肺動脈 以外）', '酸素の 多い 血液（動脈血）', ['酸素の 少ない 血液', '栄養だけ', '尿'], '心臓から 全身へ 向かう 動脈には 酸素の 多い 血液。'], ['静脈には ある しくみが ある。それは？', '血液の 逆流を ふせぐ 弁', ['酸素を ためる 袋', '血を 固める 弁', '音を 出す しくみ'], '静脈には 逆流を ふせぐ 弁が ある。'],
     ['小腸の かべに ある 小さな でっぱり は？', '柔毛（じゅうもう）。表面積を ふやす', ['空気を ためる', '血を 固める', '音を 聞く'], '柔毛で 表面積が 大きく なり、栄養を 吸収しやすい。'], ['心臓の 部屋の 数は？', '2心房 2心室（4つ）', ['1つ', '2つ', '6つ'], '心臓は 心房 2つ・心室 2つの 4部屋。']],
  4:[['1回の 拍動で 心臓が おくり出す 血液が 70 mL、1分間に 70回 拍動。1分間に おくり出す 血液は？', '約 4.9 L', ['約 0.49 L', '約 49 L', '約 140 mL'], '70 mL × 70回 ＝ 4900 mL ＝ 約 4.9 L。'], ['ヒトの 血液は 体重の 約 何%？', '約 8%', ['約 1%', '約 25%', '約 50%'], '体重の 約 1/13（約 8%）が 血液。'],
     ['1分間に 18回 呼吸、1回 に 0.5 L の 空気を すう。1分間に すう 空気は？', '9 L', ['0.9 L', '90 L', '36 L'], '0.5 L × 18回 ＝ 9 L。'], ['腎臓で 血液から 尿を つくる とき、からだに 必要な ものを 血液に もどす のは？', '再吸収', ['ろ過', '分泌', '消化'], '腎臓は 血液を ろ過し、ブドウ糖や 水など 必要な ものを 再吸収する。'],
     ['空気を すったとき、吸う 空気より はく 息に ふえる 気体は？', '二酸化炭素', ['酸素', 'ちっ素', 'ヘリウム'], '体内で 酸素が 使われ、二酸化炭素が 出る。'], ['血液の 成分の うち、いちばん 多い（液体の）成分は？', '血しょう（約 55%）', ['赤血球', '白血球', '血小板'], '血しょうが 約 55%、血球が のこり。']],
  5:[['ヘモグロビンが 酸素と むすびつく のは 酸素が どんな 場所？', '酸素が 多い 場所（肺）', ['酸素が 少ない 場所（筋肉）', '二酸化炭素が 多い 場所', 'どこでも 同じ'], '肺では 酸素と むすびつき、筋肉では 酸素を はなす。'], ['運動して 筋肉が 酸素を たくさん 使う と、心拍数は？', '上がる', ['下がる', '変わらない', '止まる'], '酸素を 多く 運ぶ ために 心拍数と 呼吸数が 上がる。'],
     ['血液型 A型は 赤血球に どんな 物質（抗原）を もつ？', 'A抗原', ['B抗原', '抗原なし', 'A・B 両方'], 'A型は A抗原、B型は B抗原、AB型は 両方、O型は なし。'], ['インスリンを 出す 臓器は？', 'すい臓', ['肝臓', '腎臓', '胃'], 'すい臓から 出る インスリンが 血糖値を 下げる。'],
     ['神経の 反射（熱い ものから 手を 引く）で、信号を 判断する のは？', 'せきずい', ['大脳', '小脳', '心臓'], '反射は せきずいが 命令を 出す ので、速く 動ける。'], ['体の 水分を 調節 して いる おもな 臓器は？', '腎臓', ['肝臓', '胃', '肺'], '腎臓が 水分と 塩分の 量を 調節して 尿を つくる。']]
};
EXRUN.body = {
  init(E){
    const st = E.star, SET = {1:['digest'], 2:['circ', 'digest'], 3:['resp', 'circ'], 4:['kidney', 'resp'], 5:['kidney', 'circ2']}[st];
    const ch = shuf(BQ[st]).slice(0, 5 - SET.length).map(q => ({t:'c', q:q[0], a:q[1], ch:shuf([q[1]].concat(q[2])), e:q[3]}));
    E.rounds = shuf(SET.map(s => ({t:'o', set:s})).concat(ch)); E.seq = []; E.miss = 0; E.done = false; E.msg = null; E.picked = null;
  },
  html(tab){
    const r = E.rounds[E.i]; let stage = '', body = '';
    if(r.t === 'o'){
      const S = ORD[r.set], nodes = S.nodes.map((nd, i) => { const k = E.seq.indexOf(i);
        return `<button class="sxBo ${k >= 0 ? 'on' : ''}" data-a="bdo" data-v="${i}" style="left:${nd[1]}%;top:${nd[2]}%" ${E.done ? 'disabled' : ''}>${k >= 0 ? `<i>${k + 1}</i>` : ''}${nd[0]}</button>`; }).join('');
      const pts = E.seq.map(i => S.nodes[i]), line = `<svg class="sxBoSvg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.map(p => p[1] + ',' + p[2]).join(' ')}" fill="none" stroke="#4CB84C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
      stage = `<div class="sxStage"><div class="sxBoW"><div class="sxBoCap">${S.cap}</div>${line}${nodes}</div></div>`;
      const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいこう！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
      body = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / 5</span><p>${RB(S.t)}　ミス ${'♥'.repeat(Math.max(0, 3 - E.miss))}${'♡'.repeat(Math.min(3, E.miss))}</p></div>${fb}${E.done ? `<button class="sxBtn big" data-a="bdn">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}`;
    } else {
      stage = `<div class="sxStage"><div class="sxBoQ"><img src="${IC(({1:'card_life_skeleton', 2:'card_life_heart', 3:'card_life_brain', 4:'card_life_heart', 5:'card_life_brain'})[E.star])}" alt=""></div></div>`;
      const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいかい！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
      body = `<div class="sxMis"><span class="sxMisN">クイズ ${E.i + 1} / 5</span><p>${RB(r.q)}</p></div><div class="sxChG">${r.ch.map((c, i) => `<button class="sxCh ${E.done ? (c === r.a ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="bdc" data-v="${i}" ${E.done ? 'disabled' : ''}>${RB(c)}</button>`).join('')}</div>${fb}${E.done ? `<button class="sxBtn big" data-a="bdn">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}`;
    }
    return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${body}</div></div>` : `${stage}${body}`;
  },
  tapO(i){
    const r = E.rounds[E.i]; if(E.done || r.t !== 'o' || E.seq.includes(i)) return; const S = ORD[r.set];
    if(i === E.seq.length){ E.seq.push(i); snd('tap'); if(E.seq.length >= S.nodes.length){ E.done = true; E.ok++; E.msg = {ok:true, t:`正しい じゅんばん！ ${S.nodes.map(n => n[0]).join(' → ')}`}; snd('ok'); } }
    else { E.miss++; snd('ng'); if(E.miss >= 3){ E.done = true; E.msg = {ok:false, t:`こたえ：${S.nodes.map(n => n[0]).join(' → ')}`}; E.seq = S.nodes.map((_, k) => k); } }
    render();
  },
  pick(i){ const r = E.rounds[E.i]; if(E.done || r.t !== 'c') return; E.picked = i; const ok = r.ch[i] === r.a; if(ok) E.ok++; E.done = true; E.msg = {ok, t:r.e}; snd(ok ? 'ok' : 'ng'); render(); },
  next(){ if(E.i + 1 >= 5) return expFinish(E.ok, 5); E.i++; E.seq = []; E.miss = 0; E.done = false; E.msg = null; E.picked = null; render(); }
};

/* ---------- 新しい ボタンの うごき ---------- */
function extClick(a, v, t){
  switch(a){
    case 'mrc': return EXRUN.mirror.tap(v);
    case 'mrh': return EXRUN.mirror.hint();
    case 'mrg': return EXRUN.mirror.give();
    case 'mrn': return EXRUN.mirror.next();
    case 'bdo': return EXRUN.body.tapO(+v);
    case 'bdc': return EXRUN.body.pick(+v);
    case 'bdn': return EXRUN.body.next();
  }
}
/* 新しい 実験を「あそべる」に する */
['indic', 'crystal', 'plasma', 'evgas', 'lens', 'mirror', 'planet', 'weather', 'gene', 'body'].forEach(id => { const e = EX(id); if(e) e.impl = 1; });
const MOREC = {
  mirror:{st:[2, 6]}
};
/* 追加の ふりがな */
Object.assign(RBD, {
  "酸性":"さんせい","中性":"ちゅうせい","性質":"せいしつ","塩酸":"えんさん","水酸化":"すいさんか","指示薬":"しじやく","中和":"ちゅうわ","溶解度":"ようかいど","結晶":"けっしょう","蒸発":"じょうはつ","温度":"おんど","静電気":"せいでんき","放電":"ほうでん","電費":"でんぴ","動力":"どうりょく","熱効率":"ねつこうりつ","総合効率":"そうごうこうりつ","再生可能":"さいせいかのう","焦点":"しょうてん","実像":"じつぞう","虚像":"きょぞう","月齢":"げつれい","上弦":"じょうげん","下弦":"かげん","満月":"まんげつ","新月":"しんげつ","三日月":"みかづき","月食":"げっしょく","日食":"にっしょく","北極星":"ほっきょくせい","気圧":"きあつ","高気圧":"こうきあつ","低気圧":"ていきあつ","寒冷前線":"かんれいぜんせん","温暖前線":"おんだんぜんせん","停滞前線":"ていたいぜんせん","梅雨":"つゆ","前線":"ぜんせん","等圧線":"とうあつせん","転向力":"てんこうりょく","優性":"ゆうせい","劣性":"れっせい","遺伝子":"いでんし","遺伝":"いでん","色覚異常":"しきかくいじょう","保因者":"ほいんしゃ","右心房":"みぎしんぼう","右心室":"みぎしんしつ","左心房":"ひだりしんぼう","左心室":"ひだりしんしつ","肺":"はい","全身":"ぜんしん","食道":"しょくどう","小腸":"しょうちょう","大腸":"だいちょう","肛門":"こうもん","気管":"きかん","気管支":"きかんし","肺胞":"はいほう","毛細血管":"もうさいけっかん","腎臓":"じんぞう","輸尿管":"ゆにょうかん","尿道":"にょうどう","大静脈":"だいじょうみゃく","大動脈":"だいどうみゃく","肺動脈":"はいどうみゃく","肺静脈":"はいじょうみゃく","赤血球":"せっけっきゅう","白血球":"はっけっきゅう","血小板":"けっしょうばん","血しょう":"けっしょう","横隔膜":"おうかくまく","柔毛":"じゅうもう","再吸収":"さいきゅうしゅう","心拍数":"しんぱくすう","反射":"はんしゃ","口":"くち","胃":"い","鼻":"はな","胃液":"いえき","酵素":"こうそ","肝臓":"かんぞう","筋肉":"きんにく","心臓":"しんぞう","酸素":"さんそ","二酸化炭素":"にさんかたんそ","呼吸":"こきゅう","栄養":"えいよう"
});



/* =====================================================================
   v6.72：イラスト版（館内トップ・実験の 図を ぜんぶ イラストに）
   ===================================================================== */
const SPD = {"tk_earth":[288,280],"bd_lab":[750,494],"op_prism":[231,248],"fx_plasma_burst":[341,326],"tk_star":[249,242],"lf_elodea":[265,300],"lab_spoon_citric":[300,165],"fx_plasma_beam":[358,318],"en_valve_ex":[141,296],"el_sw_off":[246,237],"em_plasma":[243,340],"cr_robot":[269,304],"em_crank":[306,191],"bd_factory":[750,494],"sci_hall_tab":[1536,1024],"el_led_on":[161,284],"cr_chassis":[367,134],"fx_flame_Cu":[142,307],"bd_map":[750,494],"bd_night":[750,494],"em_hand":[340,213],"og_small":[226,260],"bd_pond":[750,494],"tx_orange":[276,268],"op_spot_g":[242,285],"cr_crate":[364,290],"fx_flame_Li":[154,310],"og_nose":[228,260],"em_balloon":[221,273],"op_spot_b":[248,288],"op_filter_g":[227,263],"em_nail5":[316,198],"op_fork":[239,297],"lab_burner":[227,299],"bk_teal":[258,283],"el_sw_on":[239,300],"tk_raincloud":[300,244],"el_resistor":[300,81],"tk_rock":[269,258],"el_bulb_on":[237,300],"fx_rocketflame":[197,360],"en_piston":[192,307],"em_paper":[340,239],"em_nail25":[340,185],"el_led_off":[129,279],"lab_beaker_empty":[231,290],"tk_sun":[280,282],"bd_work":[750,494],"lab_flask_fizz":[201,300],"bk_green":[259,283],"tk_mirror":[238,246],"tk_laser":[300,115],"em_gener":[339,282],"lf_pod":[300,234],"en_air":[340,255],"tk_moon":[264,261],"lf_bunny_girl":[164,300],"bk_red":[259,283],"og_stomach":[239,260],"el_ammeter":[300,240],"en_ev":[340,207],"og_esoph":[86,260],"mc_paramecium":[384,384],"bd_sky":[750,494],"op_magnifier":[276,274],"mc_elodea":[384,384],"mc_daphnia":[384,384],"bk_pink":[259,283],"en_smoke":[330,257],"op_lens":[219,284],"og_large":[260,255],"op_filter_b":[224,262],"cr_seat":[182,266],"og_lungs":[260,257],"bk_blue":[258,283],"cr_bad_window_yellow":[362,229],"tk_epicenter":[255,253],"lf_bunny_boy":[178,300],"en_crank":[340,238],"el_wire_blue":[300,238],"op_candle":[222,292],"tk_cloud":[300,226],"lf_pea_wg":[231,228],"lab_beaker_few":[248,295],"lab_loop":[300,274],"en_block":[260,321],"lab_spoon_soda":[300,155],"lf_pea_wy":[233,227],"og_bladder":[236,260],"bk_lime":[259,282],"em_clips":[340,189],"tk_station":[199,233],"hall_src1":[1536,1024],"el_bulb_off":[211,300],"el_battery":[126,300],"og_bronchi":[260,250],"lab_beaker_crystal":[260,300],"op_screen":[253,290],"bd_dark":[750,494],"bk_yellow":[259,283],"op_lightbox":[156,195],"fx_fireball":[360,321],"cr_conveyor":[420,152],"fx_flame_K":[147,307],"fx_flame_Ca":[152,306],"em_cloth":[340,281],"fx_flame_Sr":[155,311],"og_kidney":[260,250],"mc_onion":[384,384],"cr_engine":[363,150],"bk_litmus_blue":[291,231],"bk_purple":[260,284],"lf_co2":[165,300],"cr_bad_wheel_blue":[363,222],"en_valve_in":[143,305],"bk_water":[259,283],"el_motor":[300,179],"tx_blue":[275,268],"lab_flask":[221,300],"lab_dish":[300,205],"lab_thermo":[161,300],"fx_flame_Ba":[143,302],"og_mouth":[254,260],"em_nail12":[340,200],"cr_bad_wheel_red":[368,221],"op_spot_r":[244,287],"lab_balloon":[184,300],"fx_flame_blue":[146,306],"lf_slide":[300,165],"cr_wheels":[363,184],"fx_flame_Na":[148,304],"op_scope":[300,225],"bk_litmus_red":[292,229],"en_plug":[125,315],"lf_pea_ry":[224,219],"tk_goal":[268,259],"og_alveoli":[260,258],"en_injector":[137,309],"lf_pea_rg":[231,227],"sci_hall_ph":[780,1688],"op_filter_r":[228,263],"lf_lamp":[300,295],"lf_can":[300,225],"op_hand_mirror":[177,293],"og_heart":[191,260],"cr_seal":[250,252],"el_wire_red":[300,246],"bk_dropper":[126,300],"em_clip":[247,195],"cr_bad_window_green":[374,228],"town_rocket":[451,457],"card_life_heart":[231,300],"town_rainbow":[465,371],"card_life_leaf":[276,300],"card_life_cells":[299,297],"card_space_rocket":[189,300],"sci_top":[1280,853],"card_car_gears":[287,300],"card_elec_cable":[300,265],"card_elec_switch":[251,263],"card_space_saturn":[300,180],"top_fossil":[399,273],"card_chem_tubes":[300,242],"card_chem_burner":[178,300],"card_space_moon":[261,261],"top_prism":[298,300],"town_fireworks":[450,459],"card_space_telescope":[249,300],"car_red":[475,314],"zone_life":[1280,853],"card_chem_crystal":[266,300],"card_space_seismo":[300,195],"card_light_gold":[230,300],"card_car_light":[300,187],"card_life_dna":[162,300],"card_car_helmet":[300,280],"card_car_piston":[138,300],"card_space_gold":[265,266],"card_elec_magnet":[286,292],"card_light_glasses":[300,146],"card_life_gold":[300,265],"card_life_plankton":[226,300],"card_car_oilcan":[300,267],"card_elec_turbine":[215,300],"card_elec_bulb":[214,300],"zone_car":[1280,853],"card_light_prism":[300,194],"card_space_satellite":[300,205],"fur_rocket":[222,431],"card_light_rainbow":[300,190],"card_light_mic":[215,300],"card_light_mirror":[222,300],"car_green":[476,315],"card_chem_mortar":[300,261],"town_stardeck":[481,387],"card_elec_plasma":[254,300],"top_gears":[289,294],"car_purple":[475,315],"card_life_microscope":[187,300],"car_yellow":[475,314],"card_elec_gold":[300,269],"card_life_ammonite":[288,300],"card_chem_jars":[219,291],"top_rocket":[334,350],"card_light_phones":[300,295],"top_desk":[408,314],"card_life_sprout":[280,291],"fur_plasma":[286,388],"card_chem_litmus":[300,270],"top_owl":[339,307],"fur_fossil":[397,395],"town_power":[452,459],"fur_gears":[325,383],"card_light_fork":[163,300],"zone_light":[1280,853],"card_car_tools":[300,263],"card_chem_balance":[300,248],"card_light_lens":[230,300],"card_elec_tesla":[300,299],"fur_owl":[285,443],"card_elec_coil":[202,300],"card_space_starchart":[288,300],"card_chem_beaker":[250,270],"card_elec_generator":[300,203],"town_fountain":[443,406],"card_space_shooting":[300,237],"card_light_guitar":[300,276],"zone_chem":[1280,853],"card_chem_flask":[221,291],"card_chem_molecule":[300,269],"card_car_wheel":[300,295],"fur_desk":[407,391],"card_space_earth":[281,279],"card_chem_gold":[220,299],"card_elec_battery":[188,299],"top_plasma":[286,347],"top_starlight":[297,314],"card_light_loupe":[286,285],"card_car_tire":[277,300],"card_chem_balloon":[149,300],"card_light_speaker":[300,233],"card_life_brain":[300,267],"fur_starlight":[303,312],"fur_prism":[390,362],"car_orange":[474,314],"card_car_plug":[177,300],"zone_space":[1280,853],"card_space_meteor":[274,277],"zone_elec":[1280,853],"car_blue":[474,315],"card_life_skeleton":[142,300],"card_car_gold":[300,258],"card_car_jack":[300,247],"card_elec_motor":[300,232],"card_life_butterfly":[300,280],"card_space_helmet":[300,281],"card_car_engine":[300,270]};
const sd = n => SPD[n] || [100, 100];
/* スプライト（イラスト）を SVG に おく。a：基準点  tl=ひだり上 / c=中心 / bc=下の まん中 / tc=上の まん中 */
function SI(n, x, y, w, o = {}){
  const [iw, ih] = sd(n), h = o.h || w * ih / iw; let X = x, Y = y; const a = o.a || 'tl';
  if(a === 'c'){ X = x - w / 2; Y = y - h / 2; } else if(a === 'bc'){ X = x - w / 2; Y = y - h; } else if(a === 'tc'){ X = x - w / 2; } else if(a === 'cl'){ Y = y - h / 2; } else if(a === 'cr'){ X = x - w; Y = y - h / 2; }
  let tr = '';
  if(o.rot) tr += `rotate(${o.rot} ${(o.px ?? (X + w / 2)).toFixed(1)} ${(o.py ?? (Y + h / 2)).toFixed(1)}) `;
  if(o.fx) tr += `translate(${(2 * X + w).toFixed(1)} 0) scale(-1 1) `;
  return `<image href="${IC(n)}" x="${X.toFixed(1)}" y="${Y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"${o.op != null ? ` opacity="${o.op}"` : ''}${tr ? ` transform="${tr.trim()}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}${o.f ? ` filter="${o.f}"` : ''}/>`;
}
const spH = (n, w) => w * sd(n)[1] / sd(n)[0];
/* たかさ ぎめで スプライトを おく */
const SIH = (n, x, y, h, o = {}) => SI(n, x, y, h * sd(n)[0] / sd(n)[1], o);
let _cpn = 0;
/* ぜんめんの はいけい（イラスト）＋ ふち */
function BGI(n, W, H, o = {}){
  const id = 'cpx' + (++_cpn), rx = o.rx ?? 22;
  return `<defs><clipPath id="${id}"><rect x="0" y="0" width="${W}" height="${H}" rx="${rx}"/></clipPath></defs><image href="${IC(n)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="${o.par || 'xMidYMid slice'}" clip-path="url(#${id})"/>${o.dim ? `<rect width="${W}" height="${H}" rx="${rx}" fill="rgba(8,10,30,${o.dim})"/>` : ''}<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${rx}" fill="none" stroke="${o.stroke || '#fff'}" stroke-width="3"/>`;
}
/* 小さな ラベル（こたえ・数字 など） */
const TAG = (x, y, t, o = {}) => { const fs = o.fs || 13, w = (o.w || (String(t).length * fs * 0.95 + 14)); return `<g><rect x="${(x - w / 2).toFixed(1)}" y="${(y - fs - 1).toFixed(1)}" width="${w.toFixed(1)}" height="${fs + 9}" rx="${(fs + 9) / 2}" fill="${o.bg || 'rgba(255,255,255,.92)'}" stroke="${o.st || '#EADFCF'}" stroke-width="2"/><text x="${x}" y="${(y + 3).toFixed(1)}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${o.col || '#4A3420'}">${t}</text></g>`; };
/* 画像パターン（金属の ざい質など） */
let _pn = 0;
const PAT = (n, sz = 120) => { const id = 'ptx' + (++_pn); return {id, def: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${sz}" height="${sz}"><image href="${IC(n)}" width="${sz}" height="${sz}" preserveAspectRatio="xMidYMid slice"/></pattern>`}; };

/* =====================================================================
   K-01 館内トップ：専用イラスト（スマホ縦／iPad横）
   ===================================================================== */
const HALLS = {
  tab:{img:'sci_hall_tab', W:1536, H:1024,
    doors:[[545, 195, 245, 245, 574, 436, 187, 33], [858, 195, 275, 245, 892, 436, 205, 33], [1205, 195, 245, 245, 1236, 436, 185, 33], [545, 494, 245, 245, 578, 737, 180, 33], [858, 494, 275, 245, 915, 737, 175, 33], [1205, 494, 245, 245, 1240, 737, 182, 33]],
    props:{qsel:[788, 740, 140, 240, '', 856, 990], cards:[942, 790, 355, 190, '', 1118, 996], rew:[1296, 815, 236, 190, '', 1400, 996]},
    owl:[30, 560, 300, 400, 40, 470, 300], rank:[34, 22, 480, 150], daily:[560, 146, 700, 44], fs:1},
  ph:{img:'sci_hall_ph', W:780, H:1688,
    doors:[[28, 364, 346, 298, 36, 620, 330, 36], [406, 364, 346, 298, 414, 620, 330, 36], [28, 676, 346, 298, 36, 932, 330, 36], [406, 676, 346, 298, 414, 932, 330, 36], [28, 988, 346, 298, 36, 1244, 330, 36], [406, 988, 346, 298, 414, 1244, 330, 36]],
    props:{qsel:[560, 1296, 92, 92, '', 606, 1405], cards:[560, 1424, 92, 92, '', 606, 1533], rew:[560, 1552, 92, 92, '', 606, 1661]},
    owl:[10, 1300, 250, 380, 30, 1290, 300], rank:[22, 108, 736, 150], daily:[22, 266, 736, 82], fs:2}
};
function hallHTML(tab){
  const Hh = HALLS[tab ? 'tab' : 'ph'], iw = innerWidth, ih = innerHeight, sc = Math.max(iw / Hh.W, ih / Hh.H), cw = Hh.W * sc, ch = Hh.H * sc;
  const P = (x, y, w, h) => `left:${(x / Hh.W * 100).toFixed(3)}%;top:${(y / Hh.H * 100).toFixed(3)}%;width:${(w / Hh.W * 100).toFixed(3)}%;height:${(h / Hh.H * 100).toFixed(3)}%`;
  const s = SC(), rk = RK(), nx = RANKS[rankNo() + 1], pct = nx ? (s.hira - rk.m) / (nx.m - rk.m) * 100 : 100, de = dailyExp();
  const rdy = REWARDS.filter(r => rwState(r) === 'ready').length;
  const say = V.say || (tab ? (V.say = hallSay()) : '');
  let h = `<div class="sxHall" style="width:${cw.toFixed(1)}px;height:${ch.toFixed(1)}px;left:${((iw - cw) / 2).toFixed(1)}px;top:${((ih - ch) / 2).toFixed(1)}px;--k:${sc.toFixed(4)};--f:${tab ? 15 : 12}px"><img class="sxHallBg" src="${IC(Hh.img)}" alt="">`;
  ZONES.forEach((z, i) => {
    const d = Hh.doors[i], imp = zoneImpl(z.id).length, cl = zoneClears(z.id);
    h += `<button class="sxHd" data-a="zone" data-v="${z.id}" style="${P(d[0], d[1], d[2], d[3])};--zc:${z.c}" aria-label="${X(z.n)}"></button>`;
    h += `<div class="sxHl" style="${P(d[4], d[5], d[6], d[7])}"><b>${X(z.sh)}</b><i>${'●'.repeat(cl)}${'○'.repeat(Math.max(0, imp - cl))}${zoneMaster(z.id) ? '★' : ''}</i></div>`;
  });
  const pr = Hh.props, pl = {qsel:'もんだい', cards:'カード', rew:'ごほうび'}, cnt = {qsel:'', cards:`${Object.keys(s.cards).length}/72`, rew:rdy ? `${rdy}` : ''};
  Object.keys(pr).forEach(k => { const p = pr[k];
    h += `<button class="sxHp" data-a="${k}" style="${P(p[0], p[1], p[2], p[3])}" aria-label="${pl[k]}">${k === 'rew' && rdy ? `<i class="sxDot">${rdy}</i>` : ''}</button><div class="sxHpl" style="left:${(p[5] / Hh.W * 100).toFixed(3)}%;top:${(p[6] / Hh.H * 100).toFixed(3)}%">${pl[k]}${k === 'cards' ? `<small>${cnt.cards}</small>` : ''}</div>`; });
  const o = Hh.owl;
  h += `<button class="sxHo" data-a="talk" style="${P(o[0], o[1], o[2], o[3])}" aria-label="フクロウはかせ"></button>${say ? `<div class="sxHb" style="left:${(o[4] / Hh.W * 100).toFixed(3)}%;top:${(o[5] / Hh.H * 100).toFixed(3)}%;width:${(o[6] / Hh.W * 100).toFixed(3)}%"><b>フクロウ はかせ</b>${RB(say)}</div>` : ''}`;
  const rkp = Hh.rank, dp = Hh.daily;
  h += `<div class="sxHrank" data-a="rank" style="${P(rkp[0], rkp[1], rkp[2], rkp[3])}">${SVGI.rank(rk.c, 40)}<div class="sxHrk"><div class="sxRkN">${rk.n}${nx ? `<small>つぎ：${nx.n}</small>` : '<small>さいこう！</small>'}</div>${bar(pct, 'bl')}<div class="sxRkS">${nx ? `あと ${nf(nx.m - s.hira)} ひらめき` : 'おめでとう！'}${tixChip()}</div></div></div>`;
  h += `<button class="sxHdaily" data-a="exp" data-v="${de.id}" data-daily="1" style="${P(dp[0], dp[1], dp[2], dp[3])}"><img src="${IC(de.ic)}" alt=""><span><small>きょうの ふしぎ</small><b>${X(de.n)}</b></span><em>ポイント ×${CFG.dailyX}</em></button>`;
  return h + '</div>';
}
const HALL_SAY = ['ようこそ！ 科学館へ！', 'きょうも ふしぎを さがそう！', '実験と もんだいで ひらめきを ためよう！', 'ひらめきを ためると ランクが 上がるよ。', '好きな へやの とびらを タッチしてね！', 'へやごとに ちがう 実験が あるよ！'];
const hallSay = () => pick(HALL_SAY);
SCREENS.top = function(tab){ return {title:'かがくかん', cls:'top hallscreen', html:hallHTML(tab)}; };


/* =====================================================================
   ばけがく
   ===================================================================== */
/* ---- 炎色反応 ---- */
function flameStage(key, lit, lbl){
  const W = 300, H = 300, fl = lit && key ? 'fx_flame_' + key : 'fx_flame_blue', col = lit && key ? FK(key).col : '#4A9CFF';
  const bw = 104, bh = spH('lab_burner', bw), bx = 150 - 103 / 227 * bw, by = 270 - bh, tubeY = by + 6 / 299 * bh;
  return SVGW(W, H, `${BGI('bd_dark', W, H, {dim:.12})}<defs><radialGradient id="gFl"><stop offset="0" stop-color="${col}" stop-opacity=".6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>
    ${lit ? `<circle cx="150" cy="${tubeY - 40}" r="${key ? 120 : 64}" fill="url(#gFl)"/>` : ''}${SI('lab_loop', 214, 196, 78, {rot:-8})}${SI('lab_dish', 14, 216, 96)}
    ${SI('lab_burner', bx, by, bw)}${SI(fl, 150, tubeY + 8, 66, {a:'bc', cls:'sxFlk'})}${TAG(62, 294, lbl, {fs:13})}`);
}
EXRUN.flame.html = function(tab){
  const r = E.rounds[E.i], m = FK(r.k), star = E.star, lit = E.on || (r.type === 'B' && E.done);
  const found = SC().flame;
  const stage = `<div class="sxStage fl">${flameStage(lit ? r.k : null, lit, r.type === 'A' ? 'ようき A' : m.n)}${r.type === 'A' && !E.on && !E.done ? `<button class="sxBtn big go" data-a="flput">金属の 粉を 炎に 入れる！</button>` : ''}</div>`;
  const notes = star <= 4 ? `<div class="sxNotes"><b>ノート</b><div>${FLAME.map(f => `<span class="sxNt ${found[f.k] ? 'on' : ''}" style="--fc:${f.col}"><i>${found[f.k] ? `<img src="${IC('fx_flame_' + f.k)}" alt="">` : '?'}</i><small>${found[f.k] ? f.n + '：' + f.cn : '？？？'}</small></span>`).join('')}</div></div>` : '<div class="sxNotes"><b>ノートは 見られない！</b> 色を よく おぼえよう</div>';
  const q = r.type === 'A' ? 'この 炎の 色は、どの 金属 かな？' : `${m.n} の 炎の 色は？`;
  const choice = r.type === 'A' ? r.ch.map((k, i) => `<button class="sxCh ${E.done ? (k === r.k ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="flc" data-v="${i}" ${E.done || (!E.on && !E.flash) ? 'disabled' : ''}>${RB(FK(k).n)}</button>`).join('')
    : r.ch.map((k, i) => `<button class="sxCh sw ${E.done ? (k === r.k ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="flc" data-v="${i}" ${E.done ? 'disabled' : ''}><img src="${IC('fx_flame_' + k)}" alt=""></button>`).join('');
  const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいかい！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
  const side = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / ${E.rounds.length}</span><p>${RB(r.type === 'A' && !E.on && !E.done && !E.flash ? 'ようき A の 粉を 炎に 入れると、炎の 色が かわるよ。ためして みよう！' : q)}</p></div><div class="sxChG ${r.type === 'B' ? 'sw' : ''}">${choice}</div>${fb}${E.done ? `<button class="sxBtn big" data-a="flnext">${E.i + 1 >= E.rounds.length ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}${notes}
    <div class="sxNote">※ ほんものの 炎色反応は 先生と いっしょに！ アプリの 中だけで あんぜんに 体験しよう。</div>`;
  return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`;
};

/* ---- もこもこ ふうせん ---- */
function balloonView(v){
  const gas = gasOf(v.soda, v.cit), size = clampN(gas / 0.24 * 100, 0, 100);
  const leftS = Math.max(0, v.soda - gas / 3 * 252), leftC = Math.max(0, v.cit - gas / 3 * 192);
  const fz = size > 1, fw = 100, fn = fz ? 'lab_flask_fizz' : 'lab_flask', fh = spH(fn, fw), fy = 272 - fh, neckY = fy + 12;
  const bw = 24 + Math.sqrt(size / 100) * 60;
  return SVGW(300, 300, `${BGI('bd_lab', 300, 300)}${SI(fn, 150, 272, fw, {a:'bc'})}${SI('lab_balloon', 150, neckY + spH('lab_balloon', bw) * .1, bw, {a:'bc', op:size > 0 ? 1 : .55})}
    ${SI('lab_spoon_soda', 6, 214, 78)}${SI('lab_spoon_citric', 216, 214, 78)}${TAG(44, 262, `重曹 ${v.soda} g`, {fs:12})}${TAG(256, 262, `クエン酸 ${v.cit} g`, {fs:12, w:84})}`)
    + `<div class="sxGs">${gauge(size, 'ふくらみ', size > 92 ? '#E8414B' : '#F0709A')}<div class="sxLeft">のこり：重曹 ${r1(leftS)} g　クエン酸 ${r1(leftC)} g</div></div>`;
}

/* ---- 色が かわる 水 ---- */
const cabSprite = ph => ph < 3.5 ? 'bk_red' : ph < 5.5 ? 'bk_pink' : ph < 7.5 ? 'bk_purple' : ph < 9 ? 'bk_blue' : ph < 11.5 ? 'bk_teal' : 'bk_lime';
const btbSprite = ph => ph < 6 ? 'bk_yellow' : ph <= 7.6 ? 'bk_green' : 'bk_blue';
function indicView(v, m){
  const W = 300, H = 260; let body = '', cap = '';
  if(m.mode === 'neu'){
    const nA = m.va * m.ca, nB = v.nv * m.cb, tot = m.va + v.nv, d = nA - nB, conc = Math.abs(d) / tot, ph = Math.abs(d) < 1e-9 ? 7 : (d > 0 ? -Math.log10(conc) : 14 + Math.log10(conc));
    body = SI(btbSprite(ph), 120, 238, 112, {a:'bc'}) + SI('bk_dropper', 226, 120, 44, {a:'bc', rot:8}) + `<path d="M231 126v26" stroke="#3C93DC" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>` + TAG(226, 54, `アルカリ ${v.nv} mL`, {fs:12, w:100}) + TAG(120, 28, `さん ${m.va} mL`, {fs:13}) + TAG(150, 252, `BTB液：${btbName(ph)}　pH ≒ ${r1(ph)}`, {fs:14, w:210});
    return SVGW(W, H, BGI('bd_lab', W, H) + body) + `<div class="sxGs"><div class="sxGg">さん：${m.ca} mol/L　${m.va} mL ／ アルカリ：${m.cb} mol/L（${m.cb > .1 ? '濃い' : m.cb < .1 ? 'うすい' : '同じ'}）</div></div>`;
  }
  const L = LIQ[v.liq], ph = L.ph;
  if(m.mode === 'litmus'){
    const redTurns = litRed(ph) === '#3C6FE0', blueTurns = litBlue(ph) === '#E0364A';
    body = SI('bk_water', 150, 236, 112, {a:'bc'}) + SI(redTurns ? 'bk_litmus_blue' : 'bk_litmus_red', 124, 132, 96, {a:'c', rot:-62}) + SI(blueTurns ? 'bk_litmus_red' : 'bk_litmus_blue', 178, 132, 96, {a:'c', rot:-48})
      + TAG(150, 28, L.n, {fs:15}) + TAG(150, 252, `赤い 紙 → ${redTurns ? '青' : '赤のまま'}　青い 紙 → ${blueTurns ? '赤' : '青のまま'}`, {fs:12, w:230});
  } else if(m.mode === 'btb'){
    body = SI(btbSprite(ph), 150, 238, 120, {a:'bc'}) + SI('bk_dropper', 232, 112, 44, {a:'bc', rot:10}) + TAG(150, 28, L.n + ' ＋ BTB液', {fs:14, w:200}) + TAG(150, 252, `BTB液：${btbName(ph)}`, {fs:15});
  } else {
    const leg = ['bk_red', 'bk_pink', 'bk_purple', 'bk_blue', 'bk_teal', 'bk_lime'], ln = ['強い さん', 'さん', '中性', 'アルカリ', '強い ア.', 'とても 強い'];
    body = SI(cabSprite(ph), 118, 238, 116, {a:'bc'}) + TAG(130, 28, L.n + ' ＋ むらさきキャベツ液', {fs:13, w:232}) + TAG(118, 252, `いろ：${cabName(ph)}`, {fs:15})
      + leg.map((n, i) => SI(n, 258, 52 + i * 34, 28, {a:'c', op:cabSprite(ph) === n ? 1 : .55}) + `<text x="244" y="${57 + i * 34}" font-size="9" font-weight="900" text-anchor="end" fill="#fff" stroke="#4A3420" stroke-width="2.4" paint-order="stroke">${ln[i]}</text>`).join('');
  }
  return SVGW(W, H, BGI('bd_lab', W, H) + body);
}

/* ---- けっしょうを そだてる ---- */
function crystalView(v, m){
  const sub = m.sub || 'alum', W0 = m.water || 100, cap = solCap(sub, v.T) * W0 / 100, amt = m.amt, cryst = Math.max(0, amt - cap), f = cryst / Math.max(amt, 1);
  const bsp = f <= 0.001 ? 'bk_water' : f < .4 ? 'lab_beaker_few' : 'lab_beaker_crystal', hot = v.T >= 40;
  return SVGW(300, 260, `${BGI('bd_lab', 300, 260)}${SI(bsp, 112, 238, 124, {a:'bc'})}${SI('lab_thermo', 240, 238, 46, {a:'bc'})}
    ${hot ? SI('lab_burner', 196, 262, 44, {a:'bc', op:.9}) + SI('fx_flame_blue', 218, 224, 22, {a:'bc', cls:'sxFlk'}) : ''}
    ${TAG(112, 26, `${SOL[sub].n} ${amt} g を 水 ${W0} g に`, {fs:13, w:220})}${TAG(240, 70, v.T + '℃', {fs:15, bg:hot ? '#FFD9C9' : '#D9EEFF'})}${TAG(150, 254, `とける 限界：${r1(cap)} g　→ 結晶：${r1(cryst)} g`, {fs:13, w:252, col:cryst > 0 ? '#2C6FB0' : '#4A3420'})}`)
    + `<div class="sxGs">${gauge(clampN(cap / Math.max(amt, 1) * 100, 0, 100), 'とけている わりあい', '#3C93DC')}</div>`;
}

/* =====================================================================
   でんき
   ===================================================================== */
const bulbSp = (x, y, w, lv) => `${lv > .02 ? `<circle cx="${x}" cy="${y - w * .05}" r="${w * (.55 + lv * .35)}" fill="#FFE98A" opacity="${(0.12 + lv * 0.38).toFixed(2)}"/>` : ''}${SI('el_bulb_off', x, y, w, {a:'c'})}${lv > .02 ? SI('el_bulb_on', x, y, w, {a:'c', op:clampN(lv, 0, 1)}) : ''}`;
const cable = (d, on, col = '#E8414B') => `<path d="${d}" fill="none" stroke="#3a2a22" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".35" transform="translate(0 3)"/><path d="${d}" fill="none" stroke="${on ? col : '#B9A8A0'}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1.5 -1.5)"/>`;
/* 電流計（ふちは イラスト、メーターの はりだけ プログラム） */
function ammeterSVG(x, y, w, I){
  const s = w / 300, a = clampN(I / 1.5, 0, 1) * 100 - 50, ar = a * Math.PI / 180;
  let ticks = ''; for(let k = -50; k <= 50; k += 5){ const r = k * Math.PI / 180, l = k % 25 === 0 ? 16 : 9; ticks += `<line x1="${150 + Math.sin(r) * 112}" y1="${172 - Math.cos(r) * 112}" x2="${150 + Math.sin(r) * (112 - l)}" y2="${172 - Math.cos(r) * (112 - l)}" stroke="#4A3420" stroke-width="2.4"/>`; }
  return `${SI('el_ammeter', x, y, w)}<g transform="translate(${x} ${y}) scale(${s})"><path d="M24 30h248q4 0 4 4v130q0 6-6 6H26q-6 0-6-6V34q0-4 4-4z" fill="#F7F4EA"/>${ticks}<text x="150" y="112" font-size="34" font-weight="900" text-anchor="middle" fill="#4A3420">A</text>
    <line x1="150" y1="172" x2="${150 + Math.sin(ar) * 104}" y2="${172 - Math.cos(ar) * 104}" stroke="#E8414B" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="172" r="15" fill="#2B2B33"/><rect x="104" y="150" width="92" height="22" rx="8" fill="#10131A"/><text x="150" y="167" font-size="17" font-weight="900" text-anchor="middle" fill="#7CFF9B">${(Math.round(I * 100) / 100).toFixed(2)}A</text></g>`;
}
function ckSVG(v, m){
  const par = v.mode === 'p', on = v.sw === 1 && (v.wire !== 0);
  let lvA, lvB; if(m.single){ lvA = on ? 1 : 0; lvB = 0; } else { lvA = lvB = on ? (par ? 1 : 0.25) : 0; }
  let body;
  if(m.single) body = cable('M50 150V52H130M200 52H280V150V210H50V150', on) + (v.wire === 0 ? `<rect x="136" y="38" width="58" height="26" fill="#9a7440" opacity=".0"/>` : '') + bulbSp(165, 70, 66, lvA);
  else if(par) body = cable('M50 150V50H280V210H50V150M120 50V90M120 150V210M210 50V90M210 150V210', on) + bulbSp(120, 118, 54, lvA) + bulbSp(210, 118, 54, lvB);
  else body = cable('M50 150V50H100M150 50H190M240 50H280V210H50V150', on) + bulbSp(125, 64, 54, lvA) + bulbSp(215, 64, 54, lvB);
  return `${BGI('bd_work', 330, 250)}${body}${SI(v.sw ? 'el_sw_on' : 'el_sw_off', 82, 214, 54, {a:'bc'})}${SI('el_battery', 50, 188, 34, {a:'bc'})}`;
}
function ckView(v, m){
  if(m.calc){
    const Rt = m.calc(v), I = (v.sw ? 1 : 0) * (1.5 * v.bat) / Rt;
    let bats = ''; for(let i = 0; i < (v.bat || 1); i++) bats += SI('el_battery', 38 + i * 34, 92, 30, {a:'bc'});
    return SVGW(330, 250, `${BGI('bd_work', 330, 250)}${bats}${TAG(90, 112, `電池 ${(1.5 * (v.bat || 1)).toFixed(1)} V`, {fs:13, w:104})}${m.res(v)}${ammeterSVG(176, 140, 134, I)}`);
  }
  return SVGW(330, 250, ckSVG(v, m));
}
resBox = (x, y, r, lab) => `${SI('el_resistor', x, y, 74)}${TAG(x + 37, y + 40, lab || r + 'Ω', {fs:13, w:60})}`;

/* ---- でんじしゃくを つくろう ---- */
function emagView(v){
  const n = CLIPS(v.turns, v.batt), sp = v.turns <= 30 ? 'em_nail5' : v.turns <= 70 ? 'em_nail12' : 'em_nail25', nw = 214, nx = 22, ny = 38;
  let clips = ''; for(let i = 0; i < n; i++){ const col = i % 6, row = Math.floor(i / 6); clips += SI('em_clip', 226 + (col - 2.5) * 13 + (row % 2) * 5, 92 + row * 17, 34, {a:'c', rot:((i * 37) % 60) - 30}); }
  let bats = ''; for(let i = 0; i < v.batt; i++) bats += SI('el_battery', 40 + i * 36, 244, 30, {a:'bc'});
  return SVGW(300, 260, `${BGI('bd_work', 300, 260)}${SI(sp, nx, ny, nw, {op:v.turns === 0 ? .5 : 1})}${clips}${bats}${cable('M50 146V196H70', true, '#E8414B')}${cable('M118 142V176H40V204', true, '#3C93DC')}${TAG(150, 24, `まき数 ${v.turns}回 ／ 電池 ${v.batt}こ`, {fs:13, w:190})}`)
    + `<div class="sxGs">${gauge(n / 24 * 100, `もちあげた クリップ：${n}こ`, '#9B6CE0')}</div>`;
}

/* ---- てまわし はつでん ---- */
function generView(v){
  const rpm = v.rpm, bulb = clampN((rpm - 45) / 60, 0, 1), led = rpm >= 15 ? clampN(0.35 + rpm / 150, 0, 1) : 0, dur = rpm > 0 ? (120 / rpm).toFixed(2) : 0;
  const gw = 150, gh = spH('em_gener', gw), gx = 8, gy = 232 - gh, shx = gx + 305 / 339 * gw, shy = gy + 112 / 282 * gh;
  const cw = 82, ch = spH('em_crank', cw), crank = `<g>${SI('em_crank', shx - 20 / 306 * cw, shy - 150 / 191 * ch, cw)}${rpm > 0 ? `<animateTransform attributeName="transform" type="rotate" from="0 ${shx.toFixed(1)} ${shy.toFixed(1)}" to="360 ${shx.toFixed(1)} ${shy.toFixed(1)}" dur="${dur}s" repeatCount="indefinite"/>` : ''}</g>`;
  return SVGW(300, 260, `${BGI('bd_work', 300, 260)}${cable(`M${gx + 70} ${gy + gh - 8}V248H190V128`, rpm > 0)}${cable('M190 128V84', bulb > .02 || led > 0)}${SI('em_gener', gx, gy, gw)}${crank}${bulbSp(222, 76, 76, bulb)}
    ${SI('el_led_off', 262, 196, 40, {a:'c'})}${led > 0 ? SI('el_led_on', 262, 196, 40, {a:'c', op:clampN(led, 0, 1)}) : ''}${TAG(222, 134, '電球', {fs:12, w:46})}${TAG(262, 232, 'LED', {fs:12, w:46})}`)
    + `<div class="sxGs">${gauge(rpm / 120 * 100, `ハンドルの はやさ：${rpm}`, '#F2A33A')}${gauge(bulb * 100, '電球の 明るさ', '#FFC93C')}${gauge(led * 100, 'LEDの 明るさ', '#4CB84C')}</div>`;
}

/* ---- プラズマボール／静電気 ---- */
function staticView(v, m){
  if(m.kind === 'balloon'){
    const q = v.rub, lift = q >= 20 ? 2 : q >= 10 ? 1 : 0, bw = 84 + q * .9, wig = (q % 2 ? 4 : -4);
    let bits = ''; for(let i = 0; i < 7; i++) bits += SI('em_paper', 70 + i * 22, lift === 2 ? 118 - (i % 3) * 6 : lift === 1 ? 164 - (i % 3) * 5 : 232, 34, {a:'c', rot:(i - 3) * 14});
    return SVGW(300, 260, `${BGI('bd_lab', 300, 260)}${lift === 0 ? SI('em_paper', 150, 232, 130, {a:'c'}) : bits}${SI('em_balloon', 150 + wig, 78, bw, {a:'c'})}${SI('em_cloth', 232 + wig, 120, 74, {a:'c', rot:-12})}
      ${TAG(150, 250, lift === 2 ? '紙が ぴったり くっつく！' : lift === 1 ? '紙が すこし うく' : '紙は うごかない', {fs:13, w:190})}`)
      + `<div class="sxGs">${gauge(q / 30 * 100, `こすった 回数：${q}`, '#F2A33A')}${gauge(Math.min(100, q * 3.4), 'たまった 静電気（−）', '#3C6FE0')}</div>`;
  }
  const d = v.dist, near = d <= 3, bx = 84, by = 118, br = 96, fx = 166 + d * 12;
  return SVGW(300, 260, `${BGI('bd_dark', 300, 260, {dim:.3})}${SI('em_plasma', bx, 242, 142, {a:'bc'})}${near ? SI('fx_plasma_beam', bx, by, 150, {a:'cl', op:.95}) : SI('fx_plasma_burst', bx, by, 150, {a:'c', op:.9})}
    ${SI('em_hand', fx, 134, 128, {a:'cl'})}${TAG(150, 252, near ? '光が ゆびの ほうへ あつまる！' : '光は ぜんたいに ひろがる', {fs:13, w:210})}`)
    + `<div class="sxGs">${gauge(100 - d * 10, '光が ゆびに あつまる 強さ', '#B58CFF')}</div>`;
}

/* ---- でんき車 vs ガソリン車 ---- */
function evView(v, m){
  const bar = (x, label, eta, col, car) => `<defs><linearGradient id="evg${x}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${col}"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>${SI(car, x + 36, 70, 96, {a:'bc'})}<rect x="${x}" y="82" width="72" height="116" rx="12" fill="#fff" fill-opacity=".85" stroke="#BFDDEE" stroke-width="3"/><rect x="${x + 4}" y="${82 + 4 + 108 * (1 - eta)}" width="64" height="${108 * eta}" rx="9" fill="url(#evg${x})"/><rect x="${x + 4}" y="86" width="64" height="${108 * (1 - eta)}" rx="9" fill="#F2A3A3" fill-opacity=".6"/>
    ${TAG(x + 36, 82 + 4 + 108 * (1 - eta) + 54 * eta + 6, `${Math.round(eta * 100)}%`, {fs:16, w:52, bg:'rgba(255,255,255,.85)'})}${TAG(x + 36, 218, label, {fs:12, w:84})}${T(x + 36, 236, `動力 ${Math.round(eta * 100)}% ／ 熱 ${Math.round((1 - eta) * 100)}%`, 10, '#6B5A44')}`;
  if(m.chain){
    const ch = m.chain, n = ch.length, icons = {'発電所':'tk_station', '送電':'el_wire_blue', '充電':'el_battery', 'モーター':'el_motor'}, cw = 284 / n;
    const boxes = ch.map((c, i) => { const x = 8 + i * cw; return `<rect x="${x + 3}" y="56" width="${cw - 8}" height="84" rx="12" fill="#fff" fill-opacity=".92" stroke="#BFDDEE" stroke-width="3"/>${SIH(icons[c[0]] || 'el_battery', x + 3 + (cw - 8) / 2, 60, 40, {a:'tc'})}${T(x + 3 + (cw - 8) / 2, 114, c[0], 11)}${T(x + 3 + (cw - 8) / 2, 133, Math.round(c[1] * 100) + '%', 16, '#C27A1C')}${i < n - 1 ? T(x + cw - 2, 104, '×', 15, '#8A7A65') : ''}`; }).join('');
    return SVGW(300, 260, `${BGI('bd_factory', 300, 260, {dim:.15})}${TAG(150, 34, m.title || 'エネルギーの 流れ', {fs:13, w:250})}${boxes}${T(150, 170, 'ぜんぶ かけあわせた 効率', 13, '#fff')}<rect x="30" y="180" width="240" height="26" rx="13" fill="#EFE5D3"/><rect x="30" y="180" width="${240 * clampN(v.eta / 100, 0, 1)}" height="26" rx="13" fill="#4CB84C"/>${T(150, 199, `あなたの こたえ：${v.eta}%`, 14, '#fff')}${T(150, 238, '発電 → 送電 → 充電 → モーター', 12, '#fff')}`);
  }
  return SVGW(300, 260, `${BGI('bd_factory', 300, 260, {dim:.22})}${bar(40, 'ガソリン車', m.etaG || .3, '#E8803A', 'car_red')}${bar(188, 'でんき車', m.etaE || .9, '#3C93DC', 'car_blue')}${TAG(150, 22, 'エネルギーの ゆくえ（赤＝むだな 熱）', {fs:11, w:250})}`)
    + (m.showAns ? `<div class="sxGs">${gauge(clampN(v.ans / m.max * 100, 0, 100), `あなたの こたえ：${r1(v.ans)}${m.u || ''}`, '#4CB84C')}</div>` : '');
}


/* =====================================================================
   くるま
   ===================================================================== */
/* ---- ぎあ（ざい質は イラストの 金属） ---- */
function gearSVG(N, r, cx, cy, rot, col, anim, dir = 1, rpm = 0){
  const ro = r * 1.16, ri = r * 0.92, w = 2 * Math.PI / N; let d = '';
  for(let i = 0; i < N; i++){
    const a = i * w, P = (rad, k) => `${(cx + rad * Math.cos(a + w * k)).toFixed(1)} ${(cy + rad * Math.sin(a + w * k)).toFixed(1)}`;
    d += (i ? 'L' : 'M') + P(ri, 0) + 'L' + P(ro, 0.13) + 'L' + P(ro, 0.37) + 'L' + P(ri, 0.5);
  }
  d += 'Z';
  const tex = col === '#3C93DC' ? 'tx_blue' : 'tx_orange', p = PAT(tex, Math.max(70, r * 3.2)), gid = 'gg' + (++_pn);
  const an = anim && rpm > 0 ? `<animateTransform attributeName="transform" type="rotate" from="${rot} ${cx} ${cy}" to="${rot + 360 * dir} ${cx} ${cy}" dur="${(120 / rpm).toFixed(2)}s" repeatCount="indefinite"/>` : '';
  const bolts = [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${(cx + Math.cos(i * 1.0472) * r * .56).toFixed(1)}" cy="${(cy + Math.sin(i * 1.0472) * r * .56).toFixed(1)}" r="${Math.max(2, r * .07).toFixed(1)}" fill="#E8EDF3" stroke="#6B7480" stroke-width="1.4"/>`).join('');
  return `<defs>${p.def}<radialGradient id="${gid}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient></defs>
    <g transform="rotate(${rot} ${cx} ${cy})">${an}<path d="${d}" fill="url(#${p.id})" stroke="rgba(0,0,0,.5)" stroke-width="2.4" stroke-linejoin="round"/><path d="${d}" fill="url(#${gid})"/><circle cx="${cx}" cy="${cy}" r="${r * .66}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>${bolts}<circle cx="${cx}" cy="${cy}" r="${r * .22}" fill="#B9C2CF" stroke="#3A3F47" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * .08}" fill="#3A3F47"/></g>`;
}
function gearView(v, m){
  const inRpm = m.rpm || 60, out = inRpm * v.a / v.b, r1p = 14 + v.a * 1.7, r2p = 14 + v.b * 1.7, cx1 = 20 + r1p * 1.16, cx2 = cx1 + r1p * 1.16 + r2p * 1.16 - 4;
  const W = cx2 + r2p * 1.16 + 20, H = Math.max(r1p, r2p) * 2.4 + 30, cy = H / 2, half = Math.PI / v.b * 180 / Math.PI;
  return SVGW(W, H, `${BGI('bd_work', W, H)}${gearSVG(v.a, r1p, cx1, cy, 0, '#3C93DC', true, 1, inRpm)}${gearSVG(v.b, r2p, cx2, cy, half, '#F2A33A', true, -1, out)}`) +
    `<div class="sxGs"><div class="sxGg"><b>入力（青）</b>${v.a}歯　${inRpm} 回転/分</div><div class="sxGg"><b>出力（オレンジ）</b>${v.b}歯　${r1(out)} 回転/分</div><div class="sxGg">力（トルク）は 入力の ${r1(v.b / v.a)}倍</div></div>`;
}
FIGS.gear2 = () => `<svg viewBox="0 0 380 200">${BGI('bd_work', 380, 200, {rx:14})}${gearSVG(20, 36, 110, 100, 0, '#3C93DC', false)}${gearSVG(60, 78, 100 + 36 + 78 + 22, 100, 0, '#F2A33A', false)}${TAG(110, 176, 'A 20歯', {fs:14})}${TAG(238, 190, 'B 60歯', {fs:14})}</svg>`;
FIGS.ser = () => `<svg viewBox="0 0 380 210">${BGI('bd_work', 380, 210, {rx:14})}${cable('M70 150V58H120M184 58H256M320 58H350V150V178H70V150', true)}${SI('el_battery', 70, 150, 40, {a:'c'})}${bulbSp(150, 72, 66, .55)}${bulbSp(290, 72, 66, .8)}${TAG(150, 118, '100W', {fs:15})}${TAG(290, 118, '60W', {fs:15})}${TAG(70, 192, '100V', {fs:15})}${T(215, 204, 'ちょくれつ（どちらも 100V用）', 12, '#fff')}</svg>`;
FIGS.quakeg = () => `<svg viewBox="0 0 380 170">${BGI('bd_map', 380, 170, {rx:14})}<rect x="10" y="10" width="360" height="150" rx="10" fill="#fff" fill-opacity=".72"/><path d="M20 90H90l8-14 8 28 8-34 8 40 8-28 8 18 8-8H190l10-38 10 70 10-60 10 46 10-30 10 22 8-10H366" fill="none" stroke="#4A3420" stroke-width="3" stroke-linejoin="round"/>
  <text x="96" y="130" font-size="13" font-weight="900" fill="#E8414B">P波</text><text x="196" y="130" font-size="13" font-weight="900" fill="#3C82E0">S波</text><path d="M96 140H196" stroke="#4A3420" stroke-width="2"/><text x="146" y="157" font-size="13" font-weight="900" text-anchor="middle">10 びょう</text>${SI('card_space_seismo', 318, 40, 44, {a:'c'})}</svg>`;

/* ---- 車の 組立ライン ---- */
function asmSVG(step, col, w = 320){
  const cw = 120; let car;
  if(step <= 0) car = SI('cr_chassis', 118, 99, cw, {a:'bc'});
  else if(step === 1) car = SI('cr_engine', 118, 99, cw, {a:'bc'});
  else if(step === 2) car = SI('cr_wheels', 118, 100, cw, {a:'bc'});
  else car = SI('car_' + col, 118, 102, cw + 8, {a:'bc'});
  return `<svg class="sxAsm" viewBox="0 0 240 150" width="${w}">${BGI('bd_factory', 240, 150, {rx:14})}${SI('cr_robot', 180, 14, 52)}${SI('cr_conveyor', 0, 84, 240)}${car}${step >= 4 ? SI('cr_seat', 118, 44, 24, {a:'c'}) : ''}${step >= 5 ? SI('cr_seal', 214, 40, 30, {a:'c'}) : ''}</svg>`;
}
EXRUN.assemble.html = function(tab){
  const st = E.star, next = PARTS[E.step] && PARTS[E.step][0];
  if(E.phase === 'inspect') return this.inspHTML(tab);
  const ico = p => p[0] === 'body' ? `<img src="${IC('car_' + E.color)}" alt="">` : p[0] === 'seat' ? `<img src="${IC('cr_seat')}" alt="">` : `<img src="${IC(p[2])}" alt="">`;
  const tray = E.tray.map(p => `<button class="sxPart ${E.hint && p[0] === next ? 'hint' : ''}" data-a="asm" data-v="${p[0]}"><span>${ico(p)}</span><b>${p[1]}</b></button>`).join('');
  const sw = Object.keys(CCOL).map(k => `<button class="sxSw ${E.color === k ? 'on' : ''}" data-a="asmc" data-v="${k}" style="background:${CCOL[k]}"></button>`).join('');
  const tg = [['gas', 'ガソリン'], ['ev', 'でんき'], ['hyb', 'ハイブリッド']].map(o => `<button class="sxBtn sm ${E.eng === o[0] ? '' : 'w'}" data-a="asme" data-v="${o[0]}">${o[1]}</button>`).join('');
  const perf = {gas:[60, 55, 40], ev:[50, 60, 85], hyb:[55, 50, 70]}[E.eng];
  const stage = `<div class="sxStage asm"><div class="sxAsmW ${E.shake ? 'shake' : ''}">${asmSVG(E.step, E.color, tab ? 400 : 330)}<div class="sxGhost">${E.step < 5 ? `つぎ：${PARTS[E.step][1]}` : 'かんせい！'}</div></div>
    <div class="sxConv"></div><div class="sxAsmMeta">車 ${E.cnt + 1} / ${E.target}　ミス ${'♥'.repeat(Math.max(0, E.maxMiss - E.miss))}${'♡'.repeat(E.miss)}</div></div>`;
  const tm = `<div class="sxTimer"><span>のこり <b id="sxTL">${Math.ceil(Math.max(0, E.limit - (Date.now() - E.t0) / 1000))}</b> びょう</span><div class="sxBar2 bl"><i id="sxTF" style="width:${Math.max(0, 100 - (Date.now() - E.t0) / 10 / E.limit)}%"></i></div></div>`;
  const side = `<div class="sxMis"><span class="sxMisN">${st === 6 ? '3台を 時間内に！' : 'じゅんばんどおりに！'}</span><p>${RB(E.hint ? '光って いる 部品を じゅんばんに タッチしよう。' : '正しい じゅんばん（エンジン→タイヤ→ボディ→シート→ハンドル）で 部品を はめよう。')}</p></div>
    <div class="sxTray">${tray}</div><div class="sxAsmOpt"><div><span>ボディの 色</span>${sw}</div><div><span>エンジン</span>${tg}</div>
    <div class="sxPerf">${gauge(perf[0], 'パワー', '#F2A33A')}${gauge(perf[1], 'スピード', '#3C93DC')}${gauge(perf[2], 'エコ', '#4CB84C')}</div></div>`;
  return `${tm}` + (tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`);
};
EXRUN.assemble.carFinal = function(c, col){
  const sp = c.bad ? ((col === 'red' || col === 'blue') ? 'cr_bad_wheel_' + col : 'cr_bad_window_' + col) : 'car_' + col;
  return `<img class="sxInspImg" src="${IC(sp)}" alt="">`;
};
EXRUN.assemble.inspHTML = function(tab){
  const I = E.insp, cars = I.cars.map((c, i) => { const col = ['red', 'blue', 'green', 'yellow'][i];
    return `<button class="sxInsp ${I.sel.includes(i) ? 'sel' : ''}" data-a="asmi" data-v="${i}">${this.carFinal(c, col)}<i>${I.sel.includes(i) ? 'ふりょう！' : ''}</i></button>`; }).join('');
  return `<div class="sxMis"><span class="sxMisN">けんさ</span><p>${RB('ラインを 流れてきた 車の 中から、ふりょうひん（タイヤが 足りない・まどが ない 車）を 全部 えらぼう！')}</p></div><div class="sxInspG">${cars}</div><button class="sxBtn big" data-a="asmicheck">けんさ かんりょう！</button>`;
};

/* ---- エンジン ---- */
function engineSVG(deg, mode, w = 300){
  const d = ((deg % 720) + 720) % 720, stroke = Math.floor(d / 180), a = (d - 90) * Math.PI / 180;
  if(mode === 'ev'){ const rot = d / 720 * 360 * 2;
    return `<svg viewBox="0 0 300 400" width="${w}">${BGI('bd_factory', 300, 400, {dim:.45})}${SI('en_ev', 150, 190, 260, {a:'c'})}<g transform="rotate(${rot} 98 200)"><circle cx="98" cy="200" r="3" fill="none"/></g>${TAG(150, 360, 'モーター：ピストンも バルブも ないよ', {fs:14, w:280})}</svg>`;
  }
  const k = 200 / 260, bx = 50, by = 34, boreX = bx + 131 * k, boreTop = by + 105 * k, kp = 80 / 192, headH = 142 * kp, pinOff = 102 * kp;
  const r = 18, L = 100, pinTDC = boreTop + 6 + pinOff, cx = boreX, cy = pinTDC + L + r;
  const pinY = cy - r * Math.cos(d * Math.PI / 180) - Math.sqrt(L * L - Math.pow(r * Math.sin(d * Math.PI / 180), 2));
  const pinX = boreX, qx = cx + r * Math.cos(a), qy = cy + r * Math.sin(a), len = Math.hypot(qx - pinX, qy - pinY), phi = Math.atan2(-(qx - pinX), (qy - pinY)) * 180 / Math.PI;
  const burn = stroke === 2, fl = burn ? Math.max(0.3, 1 - (d - 360) / 220) : 0, spark = (d >= 350 && d <= 385) && mode === 'gas';
  const topWord = ['吸気', '圧縮', '燃焼', '排気'][stroke], cid = 'ec' + (++_cpn), crk = PAT('tx_orange', 80), cr = 36;
  const hid = 'ed' + _cpn;
  return `<svg viewBox="0 0 300 400" width="${w}">${BGI('bd_factory', 300, 400, {dim:.5})}<defs>${crk.def}<clipPath id="${cid}"><rect x="0" y="100" width="192" height="207"/></clipPath>
    <radialGradient id="${hid}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>
    <svg x="${bx}" y="${by}" width="${200}" height="${262 * k}" viewBox="0 0 260 262" overflow="hidden"><image href="${IC('en_block')}" width="260" height="321"/></svg>
    ${stroke === 0 ? SI('en_air', 60, 62, 62, {a:'c', op:.95}) : ''}${stroke === 3 ? SI('en_smoke', 244, 62, 64, {a:'c', op:.95}) : ''}
    ${mode === 'diesel' ? SI('en_injector', 150, 96, 30, {a:'bc'}) : ''}
    ${burn ? SI('fx_fireball', boreX, boreTop + 40, 96, {a:'c', op:fl}) : ''}${spark ? SI('fx_fireball', boreX, boreTop + 10, 40, {a:'c', op:1}) : ''}
    <g transform="translate(${pinX.toFixed(1)} ${pinY.toFixed(1)}) rotate(${phi.toFixed(2)}) scale(${kp.toFixed(4)} ${(len / 155).toFixed(4)}) translate(-100 -100)"><g clip-path="url(#${cid})"><image href="${IC('en_piston')}" width="192" height="307"/></g></g>
    <svg x="${(boreX - 100 * kp).toFixed(1)}" y="${(pinY - pinOff).toFixed(1)}" width="${(192 * kp).toFixed(1)}" height="${headH.toFixed(1)}" viewBox="0 0 192 142" overflow="hidden"><image href="${IC('en_piston')}" width="192" height="307"/></svg>
    <g transform="rotate(${d} ${cx.toFixed(1)} ${cy.toFixed(1)})"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${cr}" fill="url(#${crk.id})" stroke="#8A4B12" stroke-width="3"/><path d="M${(cx - cr).toFixed(1)} ${cy.toFixed(1)}A${cr} ${cr} 0 0 0 ${(cx + cr).toFixed(1)} ${cy.toFixed(1)}Z" fill="#3A3F47" opacity=".55"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${cr}" fill="url(#${hid})"/><circle cx="${cx.toFixed(1)}" cy="${(cy - r).toFixed(1)}" r="8" fill="#E4E8EE" stroke="#565E69" stroke-width="2.5"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7" fill="#9AA3AE" stroke="#3A3F47" stroke-width="2"/></g>
    ${['吸気', '圧縮', '燃焼', '排気'].map((t, i) => TAG(46 + i * 69, 352, t, {fs:13, w:60, bg:i === stroke ? '#FFE08A' : 'rgba(255,255,255,.55)', st:i === stroke ? '#F2A33A' : '#fff'})).join('')}
    ${TAG(150, 384, `いま：${topWord}の 行程（${Math.round(d)}°）`, {fs:14, w:230, bg:'#10162E', col:'#FFE08A', st:'#3A4780'})}</svg>`;
}

/* =====================================================================
   ひかり・おと
   ===================================================================== */
/* ---- プリズムで にじ ---- */
function prismView(v, m){
  if(m.mix){
    const on = c => v[c] ? 1 : 0, R = on('r'), G = on('g'), B = on('b'), circ = (x, y, c) => `<circle cx="${x}" cy="${y}" r="58" fill="${c}" style="mix-blend-mode:screen"/>`;
    return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#10121C"/>${R ? circ(168, 100, '#FF0000') : ''}${G ? circ(232, 100, '#00FF00') : ''}${B ? circ(200, 156, '#0000FF') : ''}
      ${SI('op_spot_r', 34, 64, 58, {a:'c', op:R ? 1 : .55})}${SI('op_spot_g', 34, 130, 58, {a:'c', op:G ? 1 : .55})}${SI('op_spot_b', 34, 196, 58, {a:'c', op:B ? 1 : .55})}
      ${R ? `<path d="M62 64L140 96" stroke="#FF6060" stroke-opacity=".5" stroke-width="3"/>` : ''}${G ? `<path d="M62 130L204 100" stroke="#60FF60" stroke-opacity=".5" stroke-width="3"/>` : ''}${B ? `<path d="M62 196L172 156" stroke="#6080FF" stroke-opacity=".5" stroke-width="3"/>` : ''}
      ${TAG(200, 246, R && G && B ? 'まんなか：白！' : (R && G ? '重なり：黄色' : G && B ? '重なり：水色（シアン）' : R && B ? '重なり：赤むらさき（マゼンタ）' : '3つの ライトを ためそう'), {fs:13, w:230})}`);
  }
  const ang = v.ang, spread = 14 + Math.min(1, ang / 45) * 74, full = ang >= 30 && ang <= 60, fil = v.f;
  const show = SPEC.map((c, i) => (!fil || fil === 'none') ? true : fil === 'r' ? i <= 1 : fil === 'g' ? i === 3 : i >= 5);
  let bands = ''; SPEC.forEach((c, i) => { const y = 120 - spread / 2 + (i + .5) * spread / 7, vis = show[i] && (full || Math.abs(i - 3) <= 1 + (ang > 20 ? 1 : 0)); if(vis) bands += `<path d="M176 126L262 ${y - 5}L262 ${y + 5}Z" fill="${c[0]}" opacity=".95"/>`; });
  const beamY = 128 + (ang - 45) * 0.6, fsp = {r:'op_filter_r', g:'op_filter_g', b:'op_filter_b'}[fil];
  return SVGW(300, 260, `${BGI('bd_dark', 300, 260, {dim:.3})}${SI('op_screen', 276, 170, 46, {a:'bc'})}${SI('op_lightbox', 6, 160, 62, {a:'bc', rot:(ang - 45) * .3})}<path d="M60 ${beamY - 3}L150 126L150 132L60 ${beamY + 3}Z" fill="#fff" opacity=".85"/>
    ${fsp ? SI(fsp, 98, 156, 40, {a:'bc'}) : ''}${SI('op_prism', 150, 188, 92, {a:'bc'})}${bands}${TAG(150, 246, full ? '7色 ぜんぶ 見える！' : 'まだ 一部 しか 見えない', {fs:13, w:210})}`);
}

/* ---- おとの なみ ---- */
function waveView(v, m){
  const f = v.f, A = v.A, cyc = f * 0.01, sx = 26, sw = 146, sy = 48, sh = 124, cyl = sy + sh / 2, H = 10 + A * 4.6;
  let d = `M${sx} ${cyl}`; for(let x = 0; x <= sw; x += 2) d += `L${sx + x} ${(cyl - Math.sin(x / sw * cyc * 2 * Math.PI) * H).toFixed(1)}`;
  return SVGW(300, 260, `${BGI('bd_dark', 300, 260, {dim:.35})}${SI('op_scope', 5, 16, 290)}<path d="${d}" fill="none" stroke="#9BFFC9" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#wglow)"/><defs><filter id="wglow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${SI('op_fork', 244, 252, 48, {a:'bc'})}${TAG(100, 246, m.showT ? `1回の ふるえ（周期）＝ ${m.period} ミリ秒` : `${f} Hz`, {fs:14, w:m.showT ? 246 : 90, bg:'rgba(16,18,28,.8)', col:'#FFE08A', st:'#3A4780'})}${TAG(98, 30, '10ミリ秒（0.01秒）ぶんの 波', {fs:11, w:180, bg:'rgba(16,18,28,.8)', col:'#CFE0FF', st:'#3A4780'})}`)
    + `<div class="sxGs">${gauge((f - 100) / 900 * 100, `音の 高さ：${f} Hz`, '#7CE3FF')}${gauge(A * 10, '音の 大きさ', '#FFC93C')}</div>`;
}

/* ---- レンズの ふしぎ ---- */
function lensView(v, m){
  const f = m.f, a = v.a, scl = 2.4, X0 = 150, Y0 = 118, h0 = 34, W = 320, H = 240;
  const bv = a === f ? Infinity : a * f / (a - f), real = a > f, mag = bv === Infinity ? 0 : Math.abs(bv) / a;
  const ox = X0 - a * scl, ix = Math.min(308, X0 + bv * scl), ih = bv === Infinity ? 0 : Math.min(92, h0 * mag), cwid = 30;
  let rays = '', img = '';
  if(real && isFinite(bv)){
    rays = `<path d="M${ox} ${Y0 - h0}H${X0}L${ix} ${Y0 + ih}" fill="none" stroke="#FFB0B0" stroke-width="2" opacity=".9"/><path d="M${ox} ${Y0 - h0}L${X0} ${Y0}L${ix} ${Y0 + ih}" fill="none" stroke="#FFD28A" stroke-width="2" opacity=".9"/>`;
    img = SI('op_candle', ix, Y0, clampN(cwid * mag * .9, 12, 64), {a:'tc', rot:180});
  } else if(!real && a < f){
    rays = `<path d="M${ox} ${Y0 - h0}H${X0}L${X0 + 60} ${Y0 - h0 + 60 * h0 / (f * scl)}" fill="none" stroke="#FFB0B0" stroke-width="2"/><path d="M${ox} ${Y0 - h0}L${X0} ${Y0}L${X0 + 70} ${Y0 + 70 * h0 / (X0 - ox)}" fill="none" stroke="#FFD28A" stroke-width="2"/><path d="M${X0} ${Y0 - h0}L${ix} ${Y0 - ih}" stroke="#FFB0B0" stroke-width="2" stroke-dasharray="4 4"/><path d="M${X0} ${Y0}L${ix} ${Y0 - ih}" stroke="#FFD28A" stroke-width="2" stroke-dasharray="4 4"/>`;
    img = SI('op_candle', ix, Y0, clampN(cwid * mag * .9, 12, 64), {a:'bc', op:.55});
  }
  const sx = m.screen ? X0 + v.s * scl : null, blur = m.screen ? Math.min(6, Math.abs(v.s - bv) * .3) : 0;
  const info = a === f ? '焦点の 上：像は できない（光が 平行に なる）' : real ? `実像：${r1(bv)} cm ／ 大きさ ${r1(mag)} 倍（さかさま）` : `虚像：レンズの 手前 ${r1(-bv)} cm ／ ${r1(mag)} 倍（正立）`;
  const lw = 54, lh = spH('op_lens', lw);
  return SVGW(W, H, `${BGI('bd_dark', W, H, {dim:.3})}<path d="M10 ${Y0}H310" stroke="#9AA8D8" stroke-width="1.5" stroke-dasharray="6 5"/>${rays}
    ${[-1, 1].map(s => `<circle cx="${X0 + s * f * scl}" cy="${Y0}" r="4" fill="#C9A8FF"/>${T(X0 + s * f * scl, Y0 + 18, 'F', 12, '#C9A8FF')}`).join('')}
    ${SI('op_lens', X0, Y0 + lh * .614, lw, {a:'bc', op:.97})}${SI('op_candle', ox, Y0 + 2, cwid * .9, {a:'bc'})}${img}
    ${m.screen ? `${SI('op_screen', sx, Y0 + 66, 54, {a:'bc', op:1})}${isFinite(bv) && real ? `<g opacity="${Math.max(.15, 1 - blur / 6)}"><ellipse cx="${sx}" cy="${Y0 + ih / 2}" rx="${3 + blur * 1.4}" ry="${Math.max(6, ih / 2)}" fill="#FFD28A" opacity=".55"/></g>` : ''}` : ''}
    ${TAG(160, 214, info, {fs:11, w:290, bg:'rgba(16,18,28,.8)', col:'#fff', st:'#3A4780'})}${TAG(160, 232, `焦点距離 f ＝ ${f} cm ／ 物体 a ＝ ${a} cm`, {fs:11, w:260, bg:'rgba(16,18,28,.7)', col:'#CFE0FF', st:'#3A4780'})}`);
}

/* ---- かがみ めいろ ---- */
EXRUN.mirror.html = function(tab){
  const P = E.rounds[E.i], n = P.n, cs = 46, pad = 34, W = n * cs + pad * 2, H = n * cs + pad * 2;
  const tr = mirTrace(P, E.pl);
  let g = '';
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){
    const key = y + ',' + x, m = E.pl[key], isRock = P.rocks.includes(key), isStar = P.stars.includes(key), X0 = pad + x * cs, Y0 = pad + y * cs, sol = E.show && P.mir[key];
    g += `<g data-a="mrc" data-v="${key}" style="cursor:pointer"><rect x="${X0}" y="${Y0}" width="${cs}" height="${cs}" fill="rgba(255,255,255,${(x + y) % 2 ? .5 : .66})" stroke="rgba(120,90,50,.45)" stroke-width="1.5"/>`;
    if(isRock) g += SI('tk_rock', X0 + cs / 2, Y0 + cs / 2, cs - 4, {a:'c'});
    if(isStar) g += SI('tk_star', X0 + cs / 2, Y0 + cs / 2, cs - 14, {a:'c', op:tr.hit.has(key) ? 1 : .5});
    if(sol && !m) g += SI('tk_mirror', X0 + cs / 2, Y0 + cs / 2, cs - 4, {a:'c', op:.45, fx:P.mir[key] === '\\'});
    if(m) g += SI('tk_mirror', X0 + cs / 2, Y0 + cs / 2, cs - 3, {a:'c', fx:m === '\\'});
    g += `</g>`;
  }
  const line = `<polyline points="${tr.pts.map(p => (pad + p[0] * cs).toFixed(1) + ',' + (pad + p[1] * cs).toFixed(1)).join(' ')}" fill="none" stroke="#FF5A5A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".3" pointer-events="none"/><polyline points="${tr.pts.map(p => (pad + p[0] * cs).toFixed(1) + ',' + (pad + p[1] * cs).toFixed(1)).join(' ')}" fill="none" stroke="#FF2A2A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>`;
  const ex = P.exit, ed = DIRS[ex.d], gx = pad + (ex.c + .5 + ed[0] * .5) * cs, gy = pad + (ex.r + .5 + ed[1] * .5) * cs;
  const goal = SI('tk_goal', gx + ed[0] * 16, gy + ed[1] * 16, 34, {a:'c'});
  const src = `<svg x="${pad - 46}" y="${pad + (P.r0 + .5) * cs - 15}" width="46" height="30" viewBox="0 0 135 115" preserveAspectRatio="xMidYMid meet" overflow="hidden"><image href="${IC('tk_laser')}" width="300" height="115"/></svg>`;
  const svg = SVGW(W, H, `${BGI('bd_map', W, H, {dim:0, rx:22})}${g}${line}${goal}${src}`);
  const used = Object.keys(E.pl).length, lim = P.lim < 99 ? `　つかえる かがみ：${used} / ${P.lim}` : '';
  const stage = `<div class="sxStage">${svg}</div>`;
  const stars = P.stars.length ? `<br>★の マスを ぜんぶ 通って ゴールへ！（${P.stars.filter(s => tr.hit.has(s)).length}/${P.stars.length}）` : '';
  const info = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / 3</span><p>${RB('光を ゴール（緑の ○）に とどけよう。マスを タッチすると かがみ（／ ＼ なし）が きりかわるよ。岩には 光が とどかない。' + lim + stars.replace('<br>', '　')).replace('　', '<br>')}</p><p style="font-size:.82em;color:#8A7A65;margin-top:4px">${RB('かがみで はねかえる とき、入る 角と 出る 角は 同じ（反射の 法則）。')}</p></div>`;
  const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいこう！' : 'こたえは これ！'}</b><p>${RB(E.msg.t)}</p></div>` : '';
  const acts = E.done ? `<button class="sxBtn big" data-a="mrn">${E.i + 1 >= 3 ? 'けっかへ' : 'つぎへ ▶'}</button>` : `<div class="sxQAct"><button class="sxBtn v sm" data-a="mrh">ヒント</button><button class="sxBtn w sm" data-a="mrg">わからない</button></div>`;
  const side = `${info}${fb}${acts}`;
  return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${side}</div></div>` : `${stage}${side}`;
};


/* =====================================================================
   うちゅう・ちきゅう
   ===================================================================== */
function moonSVG(age, R = 54, cx = 0, cy = 0){
  const th = 2 * Math.PI * age / 29.53, c = Math.cos(th), rx = Math.abs(c) * R, wax = age <= 14.765, sw1 = wax ? 1 : 0, sw2 = wax ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0), id = 'mn' + (++_cpn);
  const lit = `M${cx} ${cy - R}A${R} ${R} 0 0 ${sw1} ${cx} ${cy + R}A${rx} ${R} 0 0 ${sw2} ${cx} ${cy - R}Z`;
  return `<defs><clipPath id="${id}"><path d="${lit}"/></clipPath></defs><circle cx="${cx}" cy="${cy}" r="${R}" fill="#1D2548" stroke="#8A9AC8" stroke-width="2"/><g clip-path="url(#${id})">${SI('tk_moon', cx, cy, R * 2.02, {a:'c'})}</g>`;
}
const starDefs = `<defs><radialGradient id="stg"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#FFF4C2"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient></defs>`;
const starDot = (x, y, s) => `<circle cx="${x}" cy="${y}" r="${(2 + s * 2.4).toFixed(1)}" fill="url(#stg)"/>`;
function planetView(v, m){
  const W = 300, H = 260;
  if(m.kind === 'moon'){
    return SVGW(W, H, `${BGI('bd_night', W, H)}${moonSVG(v.age, 62, 150, 98)}${TAG(150, 196, `${phaseName(v.age)}（${r1(v.age)} 日め）`, {fs:16, w:240})}${m.rise ? TAG(150, 226, `月が のぼる 時刻 ≒ ${String(Math.floor((6 + v.age / 29.53 * 24) % 24)).padStart(2, '0')}時ごろ`, {fs:14, w:240, bg:'#FFE08A'}) : TAG(150, 226, '新月 → 満月 → 新月 で 約 29.5日', {fs:12, w:240, bg:'rgba(16,24,58,.8)', col:'#CFE0FF', st:'#3A4780'})}`);
  }
  if(m.kind === 'season'){
    const S = SKY[seasonOf(v.mo)];
    return SVGW(W, H, `${BGI('bd_night', W, H, {dim:.2})}${starDefs}<g transform="translate(150 128)">${S.lines.map(l => `<path d="M${S.stars[l[0]][0]} ${S.stars[l[0]][1]}L${S.stars[l[1]][0]} ${S.stars[l[1]][1]}" stroke="#8FB4FF" stroke-width="1.6" opacity=".7"/>`).join('')}${S.stars.map(s => `${starDot(s[0], s[1], s[3])}${s[2] ? T(s[0], s[1] - 10, s[2], 8, '#CFE0FF') : ''}`).join('')}</g>${TAG(150, 30, `${v.mo}月 夜9時ごろの 南の 空`, {fs:14, w:210, bg:'rgba(16,24,58,.85)', col:'#fff', st:'#3A4780'})}${TAG(150, 244, S.label, {fs:13, w:230, bg:'#FFE08A'})}`);
  }
  if(m.kind === 'rot'){
    const ang = v.h * 15, rot = `rotate(${-ang} 150 128)`;
    const dipper = [[-30, -62], [-18, -70], [-6, -72], [8, -66], [16, -52], [42, -50], [48, -70]], cas = [[-70, 28], [-52, 48], [-34, 30], [-18, 50], [0, 30]];
    const grp = (pts, col) => `<g transform="${rot}"><path d="M${pts.map(p => (150 + p[0]) + ' ' + (128 + p[1])).join('L')}" fill="none" stroke="${col}" stroke-width="1.6" opacity=".8"/>${pts.map(p => starDot(150 + p[0], 128 + p[1], 1.2)).join('')}</g>`;
    return SVGW(W, H, `${BGI('bd_night', W, H, {dim:.2})}${starDefs}<circle cx="150" cy="128" r="104" fill="none" stroke="#2A3A7A" stroke-width="1.5" stroke-dasharray="4 5"/>${grp(dipper, '#8FB4FF')}${grp(cas, '#FFB08F')}${starDot(150, 128, 2)}${T(150, 118, '北極星', 10, '#FFE08A')}${TAG(150, 30, `${v.h} 時間 たった（回った 角度 ${ang}°）`, {fs:14, w:250, bg:'rgba(16,24,58,.85)', col:'#fff', st:'#3A4780'})}${TAG(150, 246, '北の 空：北極星の まわりを 反時計回りに 回る', {fs:11, w:270, bg:'rgba(16,24,58,.8)', col:'#CFE0FF', st:'#3A4780'})}`);
  }
  const a = v.ang, rad = a * Math.PI / 180, mx = 150 + Math.cos(rad - Math.PI) * 74, my = 128 + Math.sin(rad - Math.PI) * 74 * -1, age = a / 360 * 29.53;
  const ecl = Math.abs(a) <= 8 || Math.abs(a - 360) <= 8 ? '日食（太陽が かくれる）' : Math.abs(a - 180) <= 8 ? '月食（月が 地球の かげに 入る）' : '';
  return SVGW(W, H, `${BGI('bd_night', W, H, {dim:.25})}${SI('tk_sun', 26, 128, 76, {a:'c'})}<path d="M62 92H108M62 128H108M62 164H108" stroke="#FFE08A" stroke-width="2" opacity=".5"/>
    <circle cx="150" cy="128" r="74" fill="none" stroke="#3A4A8A" stroke-dasharray="4 5"/>${SI('tk_earth', 150, 128, 34, {a:'c'})}${SI('tk_moon', mx, my, 20, {a:'c'})}
    <g transform="translate(250 56)">${moonSVG(age, 22, 0, 0)}${T(0, 40, phaseName(age), 10, '#fff')}</g>${TAG(150, 236, ecl || `月の ち位置：${a}°`, {fs:13, w:240, bg:ecl ? '#FFE08A' : 'rgba(16,24,58,.85)', col:ecl ? '#4A3420' : '#fff', st:'#3A4780'})}`);
}

/* ---- ロケット ---- */
function rocketView(v){
  const dv = dvOf(v.fuel, v.pay), h = clampN(dv / 12, 0, 1), x = 40 + h * 226, y = 150;
  const mark = (xx, t) => `<line x1="${xx}" y1="40" x2="${xx}" y2="238" stroke="#FFC93C" stroke-width="2" stroke-dasharray="5 4"/>${TAG(xx, 30, t, {fs:11, w:56, bg:'#FFE08A'})}`;
  const rw = 34, rh = spH('card_space_rocket', rw);
  return SVGW(300, 260, `${BGI('bd_night', 300, 260, {dim:.05})}${SI('tk_earth', 20, 240, 150, {a:'c'})}${mark(20 + 7.9 / 12 * 250, '7.9')}${mark(20 + 11.2 / 12 * 250, '11.2')}
    ${dv > 0.2 ? `<g transform="rotate(90 ${(x - rh / 2 - 6).toFixed(1)} ${y})">${SI('fx_rocketflame', x - rh / 2 - 6, y, 36, {a:'c', op:.95, cls:'sxFlk'})}</g>` : ''}${SI('card_space_rocket', x, y, rw, {a:'c', rot:90})}
    ${TAG(150, 248, `速さの ふえかた：${r1(dv)} km/秒`, {fs:14, w:230, bg:'rgba(16,24,58,.85)', col:'#fff', st:'#3A4780'})}`)
    + `<div class="sxGs"><div class="sxGg">ロケット（空）20 t ＋ ペイロード ${v.pay} t ＋ 燃料 ${v.fuel} t ＝ ${20 + v.pay + v.fuel} t</div></div>`;
}

/* ---- じしん ハンター ---- */
function quakeView(v, m){
  const d = v.d, R = d / 200 * 105;
  return SVGW(300, 260, `${BGI('bd_map', 300, 260, {dim:0})}${[40, 80, 120, 160, 200].map(k => `<circle cx="150" cy="120" r="${k / 200 * 105}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2" stroke-dasharray="5 5"/><text x="${150 + k / 200 * 105 * 0.71}" y="${120 - k / 200 * 105 * 0.71}" font-size="10" font-weight="900" fill="#3A2A1A" stroke="#fff" stroke-width="2.4" paint-order="stroke">${k}km</text>`).join('')}
    <circle cx="150" cy="120" r="${R}" fill="#E8414B" fill-opacity=".14" stroke="#E8414B" stroke-width="4"/>${SI('tk_station', 150, 126, 38, {a:'bc'})}${SI('tk_epicenter', 150 + R * 0.71, 124 + R * 0.71, 40, {a:'bc'})}
    ${TAG(150, 150, '観測点', {fs:11, w:54})}${TAG(150, 246, `しんげんまでの きょり（予想）：${d} km`, {fs:13, w:250})}`) + (m.dt ? `<div class="sxGs"><div class="sxGg">観測点で P波が 来て から S波が 来る までの 時間（初期微動継続時間）＝ <b>${m.dt}秒</b>　${m.k ? `（この 地域：P波 6 km/秒・S波 3 km/秒）` : ''}</div></div>` : '');
}

/* ---- てんきの ふしぎ ---- */
function weatherView(v, m){
  const W = 300, H = 260;
  if(m.kind === 'press'){
    const P = v.p, hi = P >= 1013, wx = P >= 1018 ? '晴れ' : P >= 1006 ? 'くもり' : 'あめ', ic = P >= 1018 ? 'tk_sun' : P >= 1006 ? 'tk_cloud' : 'tk_raincloud';
    return SVGW(W, H, `${BGI('bd_sky', W, H)}${[1, 2, 3, 4].map(i => `<circle cx="150" cy="108" r="${i * 22}" fill="none" stroke="${hi ? '#E8414B' : '#3C6FE0'}" stroke-width="2.5" opacity=".7"/>`).join('')}<circle cx="150" cy="108" r="24" fill="${hi ? '#FFE0E0' : '#E0E8FF'}" stroke="${hi ? '#E8414B' : '#3C6FE0'}" stroke-width="3"/>${T(150, 117, hi ? '高' : '低', 24, hi ? '#E8414B' : '#3C6FE0')}
      ${hi ? '<path d="M150 20v18M150 196v-18M40 108h18M260 108h-18" stroke="#E8414B" stroke-width="4" stroke-linecap="round"/>' : '<path d="M150 38v-18M150 178v18M58 108h-18M242 108h18" stroke="#3C6FE0" stroke-width="4" stroke-linecap="round"/>'}
      ${SI(ic, 150, 238, 74, {a:'bc'})}${TAG(150, 22, `中心の 気圧：${P} hPa`, {fs:14, w:220})}${TAG(60, 244, `天気：${wx}`, {fs:13, w:92})}${TAG(240, 244, hi ? '下りてくる 空気' : 'のぼって いく 空気', {fs:11, w:112})}`);
  }
  if(m.kind === 'front'){
    const cold = v.type === 'cold', h = v.h, rain = cold ? (h >= -1 && h <= 2) : (h >= -6 && h <= 0), strong = cold && rain;
    const temp = cold ? (h < 0 ? 24 : 24 - Math.min(8, h * 4 + 2)) : (h < 0 ? 14 : 14 + Math.min(6, h * 2 + 1)), xf = 150 + h * 14;
    const wedge = cold ? `<path d="M${xf} 150L${xf - 18} 60L${xf + 52} 150z" fill="#3C6FE0" fill-opacity=".38" stroke="#3C6FE0" stroke-width="2"/>${SI('tk_raincloud', xf + 10, 66, 70, {a:'c'})}` : `<path d="M${xf} 150L${xf - 120} 78L${xf - 120} 150z" fill="#E8414B" fill-opacity=".3" stroke="#E8414B" stroke-width="2"/>${SI('tk_cloud', xf - 70, 70, 84, {a:'c'})}`;
    const drops = rain ? Array.from({length:cold ? 7 : 9}, (_, i) => { const x = cold ? xf - 14 + i * 8 : xf - 100 + i * 12; return `<path d="M${x} ${110 + (i % 2) * 8}l-3 ${cold ? 20 : 12}" stroke="#3C93DC" stroke-width="${cold ? 3 : 2}" stroke-linecap="round"/>`; }).join('') : '';
    return SVGW(W, H, `${BGI('bd_sky', W, H)}${wedge}${drops}${SI('lf_bunny_boy', 150, 176, 26, {a:'bc'})}${TAG(150, 28, cold ? '寒冷前線（つめたい 空気が もぐりこむ）' : '温暖前線（あたたかい 空気が はいあがる）', {fs:12, w:290})}${TAG(150, 204, `前線が 通る 時刻から ${h >= 0 ? '+' : ''}${h} 時間`, {fs:13, w:210})}${TAG(66, 238, `気温 ${Math.round(temp)}℃`, {fs:14, w:96, bg:'#FFE3D6'})}${TAG(212, 238, rain ? (strong ? 'はげしい 雨（せまい）' : 'しとしと 雨（ひろい）') : '雨は ふって いない', {fs:12, w:150, bg:'#DDEEFF'})}`);
  }
  if(m.kind === 'iso'){
    const sp = v.sp, wind = Math.round(48 / sp), lines = [0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * sp * 13} 30Q${60 + i * sp * 13} 120 ${40 + i * sp * 13} 214" fill="none" stroke="#5A4A8A" stroke-width="2.4"/>`).join('');
    const arrows = [0, 1, 2].map(i => `<path d="M${54 + i * 6} ${70 + i * 54}h${Math.min(60, wind * 3)}l-8 -6m8 6l-8 6" stroke="#E8414B" stroke-width="3.4" fill="none" stroke-linecap="round"/>`).join('');
    return SVGW(W, H, `${BGI('bd_map', W, H, {dim:0})}<rect x="8" y="8" width="284" height="244" rx="16" fill="#fff" fill-opacity=".45"/>${lines}${arrows}${TAG(150, 26, `等圧線の 間隔：${sp}（×100 km）`, {fs:13, w:220})}${TAG(150, 246, `ふく 風の 速さ ≒ ${wind} m/秒`, {fs:15, w:210, bg:'#FFE3E3', col:'#E8414B'})}`) + `<div class="sxGs">${gauge(wind / 24 * 100, '風の 強さ', '#E8414B')}</div>`;
  }
  const P = m.pat; let body = '';
  if(P === 'winter') body = `${[0, 1, 2, 3, 4].map(i => `<path d="M${180 + i * 12} 30Q${196 + i * 12} 120 ${180 + i * 12} 220" fill="none" stroke="#5A4A8A" stroke-width="2.4"/>`).join('')}${T(70, 128, '高', 40, '#E8414B')}${T(250, 128, '低', 40, '#3C6FE0')}<path d="M130 70l-40 20M136 110l-40 14M130 150l-40 14" stroke="#E8414B" stroke-width="3" opacity=".55"/>`;
  else if(P === 'baiu') body = `<path d="M20 124H280" stroke="#3C6FE0" stroke-width="6" stroke-dasharray="14 10"/><path d="M20 124H280" stroke="#E8414B" stroke-width="6" stroke-dasharray="10 14" stroke-dashoffset="12"/>${T(80, 78, '高', 32, '#E8414B')}${T(220, 196, '高', 32, '#E8414B')}${TAG(150, 160, '停滞前線', {fs:14, w:100})}`;
  else if(P === 'summer') body = `${[1, 2, 3].map(i => `<circle cx="210" cy="170" r="${i * 30}" fill="none" stroke="#E8414B" stroke-width="2.4" opacity=".7"/>`).join('')}${T(210, 184, '高', 38, '#E8414B')}${T(60, 64, '低', 24, '#3C6FE0')}`;
  else body = `${[1, 2, 3].map(i => `<circle cx="150" cy="120" r="${i * 24}" fill="none" stroke="#3C6FE0" stroke-width="2.4" opacity=".7"/>`).join('')}${T(150, 134, '低', 38, '#3C6FE0')}<path d="M232 120a82 82 0 0 0-30-60M68 120a82 82 0 0 0 30 60" stroke="#E8414B" stroke-width="3.4" fill="none"/><path d="M206 66l-4-8 9 1M94 174l4 8-9-1" stroke="#E8414B" stroke-width="3.4" fill="none"/>${SI('tk_cloud', 236, 60, 50, {a:'c'})}`;
  return SVGW(W, H, `${BGI('bd_map', W, H, {dim:0})}<rect x="8" y="8" width="284" height="244" rx="16" fill="#fff" fill-opacity=".45"/>${body}${m.cap ? TAG(150, 246, m.cap, {fs:12, w:230}) : ''}`);
}

/* =====================================================================
   いのち・からだ
   ===================================================================== */
/* ---- こうごうせい ---- */
function photoView(v){
  const n = Math.round(PH(v)), lim = v.light <= v.co2 && v.light <= v.water * 1.5 ? '光' : v.co2 <= v.water * 1.5 ? '二酸化炭素' : '水';
  const bub = Array.from({length:Math.min(10, n)}, (_, i) => `<circle cx="${126 + (i * 17) % 60}" cy="150" r="${3 + i % 3}" fill="#fff" fill-opacity=".9" stroke="#9FD3EE" stroke-width="1"><animate attributeName="cy" from="${200 - (i % 4) * 6}" to="${104 + (i % 3) * 8}" dur="${(1.2 + i * .13).toFixed(2)}s" repeatCount="indefinite"/></circle>`).join('');
  return SVGW(300, 260, `${BGI('bd_pond', 300, 260)}<defs><radialGradient id="lg"><stop offset="0" stop-color="#FFF3A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3A0" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="96" cy="130" rx="${50 + v.light * .5}" ry="${60 + v.light * .5}" fill="url(#lg)" opacity="${(v.light / 100).toFixed(2)}"/>${SI('lf_lamp', 6, 8, 104)}${SI('lf_elodea', 150, 238, 124, {a:'bc'})}${bub}
    ${SI('lf_can', 264, 140, 74, {a:'c', op:.45 + v.water / 200})}${Array.from({length:Math.round(v.water / 25)}, (_, i) => `<path d="M${236 - i * 4} ${160 + i * 9}l-2 7" stroke="#3C93DC" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${SI('lf_co2', 22, 238, 44, {a:'bc', op:.45 + v.co2 / 200})}${TAG(150, 22, `光 ${v.light} ／ 水 ${v.water} ／ 二酸化炭素 ${v.co2}`, {fs:12, w:262})}${TAG(150, 252, `あわの 数：1分に ${n}こ`, {fs:13, w:170})}`)
    + `<div class="sxGs">${gauge(n * 10, `あわ（酸素）：${n} こ/分`, '#4CB84C')}<div class="sxGg">いちばん 足りない 条件（限定要因）：<b>${n >= 10 ? '（ぜんぶ たっぷり）' : lim}</b></div></div>`;
}

/* ---- けんびきょう ---- */
function microView(v, m){
  const blur = Math.abs(v.focus - m.best) / 100 * 9, id = 'mf' + (++_cpn), zs = {60:1, 100:1.5, 160:2.4}[v.mag] || 1.5, iw = 360 * zs;
  return SVGW(300, 260, `<rect x="2" y="2" width="296" height="256" rx="22" fill="#0B0D16"/><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter><clipPath id="c${id}"><circle cx="150" cy="125" r="112"/></clipPath><radialGradient id="v${id}"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <linearGradient id="r${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8EDF3"/><stop offset=".5" stop-color="#6B7480"/><stop offset="1" stop-color="#C9CED6"/></linearGradient></defs>
    <g clip-path="url(#c${id})"><g filter="url(#${id})">${SI('mc_' + m.sample, 150, 125, iw, {a:'c'})}</g><circle cx="150" cy="125" r="112" fill="url(#v${id})"/></g><circle cx="150" cy="125" r="116" fill="none" stroke="url(#r${id})" stroke-width="9"/>
    ${TAG(150, 252, blur < 1.2 ? 'くっきり 見える！' : 'ぼやけて いる…（ピントを あわせよう）', {fs:13, w:250, bg:'rgba(16,18,28,.85)', col:'#fff', st:'#3A4780'})}`);
}
const MCN = {onion:'onion', elodea:'elodea', paramecium:'paramecium', daphnia:'daphnia'};

/* ---- いでんの ふしぎ ---- */
function seedSVG(x, y, r, wr, col){
  const green = /7FBF5A|green/i.test(col || ''), sp = wr ? (green ? 'lf_pea_wg' : 'lf_pea_wy') : (green ? 'lf_pea_rg' : 'lf_pea_ry');
  return SI(sp, x, y, r * 2.3, {a:'c'});
}
function geneView(v, m){
  if(m.kind === 'di'){
    const G = ['RY', 'Ry', 'rY', 'ry'], cell = 48, x0 = 56, y0 = 74; let cnt = {ry:0, rY:0, Ry:0, RY:0}, out = '';
    out += G.map((g, i) => T(x0 + i * cell + cell / 2, y0 - 8, g, 12) + T(x0 - 24, y0 + i * cell + cell / 2 + 4, g, 12)).join('');
    G.forEach((a, i) => G.forEach((b, j) => { const A = a[0] + b[0], Bb = a[1] + b[1], rd = /R/.test(A), yl = /Y/.test(Bb); cnt[(rd ? 'R' : 'r') + (yl ? 'Y' : 'y')]++; out += `<rect x="${x0 + j * cell}" y="${y0 + i * cell}" width="${cell}" height="${cell}" fill="#fff" fill-opacity=".85" stroke="#BFDDEE" stroke-width="2"/>${seedSVG(x0 + j * cell + cell / 2, y0 + i * cell + cell / 2, 15, !rd, yl ? '#E5D47A' : '#7FBF5A')}`; }));
    return SVGW(300, 290, `${BGI('bd_pond', 300, 290, {dim:.0})}<rect x="8" y="8" width="284" height="274" rx="18" fill="#fff" fill-opacity=".62"/>${out}${TAG(150, 30, 'RrYy × RrYy（丸・黄色が 優性）', {fs:13, w:250})}${TAG(150, 276, `丸黄 ${cnt.RY}／丸緑 ${cnt.Ry}／しわ黄 ${cnt.rY}／しわ緑 ${cnt.ry}`, {fs:12, w:270})}`);
  }
  if(m.kind === 'sex'){
    const mo = v.mom, fa = v.dad, ga = mo.split('|'), gb = fa.split('|'); let out = '';
    ga.forEach((a, i) => { out += T(116 + i * 80, 78, a === 'Xc' ? 'Xᶜ' : a, 15, a === 'Xc' ? '#E8414B' : '#4A3420'); });
    gb.forEach((b, j) => { out += T(60, 118 + j * 70, b === 'Xc' ? 'Xᶜ' : b, 15, b === 'Xc' ? '#E8414B' : '#4A3420'); });
    ga.forEach((a, i) => gb.forEach((b, j) => { const boy = b === 'Y', cc = boy ? a === 'Xc' : (a === 'Xc' && b === 'Xc'), car = !boy && (a === 'Xc') !== (b === 'Xc');
      out += `<rect x="${78 + i * 80}" y="${90 + j * 70}" width="76" height="64" rx="10" fill="${boy ? '#E6F0FF' : '#FFE6F0'}" stroke="${cc ? '#E8414B' : '#BFDDEE'}" stroke-width="${cc ? 4 : 2}"/>${SIH(boy ? 'lf_bunny_boy' : 'lf_bunny_girl', 78 + i * 80 + 22, 90 + j * 70 + 32, 52, {a:'c'})}${T(78 + i * 80 + 40, 90 + j * 70 + 26, boy ? '男の子' : '女の子', 10.5, '#4A3420', 'start')}${T(78 + i * 80 + 40, 90 + j * 70 + 48, cc ? '色覚異常' : car ? '保因者' : 'ふつう', 10, cc ? '#E8414B' : '#6B5A44', 'start')}`; }));
    return SVGW(300, 250, `${BGI('bd_pond', 300, 250)}<rect x="8" y="8" width="284" height="234" rx="18" fill="#fff" fill-opacity=".62"/>${TAG(150, 28, '色覚異常の 遺伝（Xᶜ の 遺伝子）', {fs:13, w:250})}${T(150, 54, `母：${mo.replace('|', ' ')}　父：${fa.replace('|', ' ')}`, 12, '#6B5A44')}${out}`);
  }
  const p1 = v.p1, p2 = v.p2, g1 = gam(p1), g2 = gam(p2), cell = 62, x0 = 100, y0 = 70; let out = '', n = {R:0, r:0};
  g1.forEach((a, i) => { out += T(x0 + i * cell + cell / 2, y0 - 10, a, 18, a === 'R' ? '#2F8A2F' : '#C2541F'); });
  g2.forEach((b, j) => { out += T(x0 - 22, y0 + j * cell + cell / 2 + 6, b, 18, b === 'R' ? '#2F8A2F' : '#C2541F'); });
  g1.forEach((a, i) => g2.forEach((b, j) => { const g = [a, b].sort().join(''), wr = g === 'rr'; wr ? n.r++ : n.R++; out += `<rect x="${x0 + i * cell}" y="${y0 + j * cell}" width="${cell}" height="${cell}" fill="#fff" fill-opacity=".85" stroke="#BFDDEE" stroke-width="2"/>${seedSVG(x0 + i * cell + cell / 2, y0 + j * cell + cell / 2 - 6, 17, wr, '#E5D47A')}${T(x0 + i * cell + cell / 2, y0 + j * cell + cell - 8, g, 12)}`; }));
  return SVGW(300, 250, `${BGI('bd_pond', 300, 250)}<rect x="8" y="8" width="284" height="234" rx="18" fill="#fff" fill-opacity=".62"/>${TAG(150, 28, `親：${p1} × ${p2}（丸 R が 優性）`, {fs:13, w:240})}${out}${TAG(150, 238, `丸 ${n.R} ： しわ ${n.r}`, {fs:15, w:150})}`);
}

/* ---- からだの しくみ ---- */
const OGI = {'口':'og_mouth', '食道':'og_esoph', '胃':'og_stomach', '小腸':'og_small', '大腸':'og_large', '肛門':'og_large', '右心房':'og_heart', '右心室':'og_heart', '左心房':'og_heart', '左心室':'og_heart', '肺':'og_lungs', '全身':'lf_bunny_boy', '鼻':'og_nose', '気管':'og_esoph', '気管支':'og_bronchi', '肺胞':'og_alveoli', '毛細血管':'og_alveoli', '腎臓':'og_kidney', '輸尿管':'og_kidney', 'ぼうこう':'og_bladder', '尿道':'og_bladder', '大静脈':'og_heart', '肺動脈':'og_lungs', '肺静脈':'og_lungs', '大動脈':'og_heart'};
EXRUN.body.html = function(tab){
  const r = E.rounds[E.i]; let stage = '', body = '';
  if(r.t === 'o'){
    const S = ORD[r.set], nodes = S.nodes.map((nd, i) => { const k = E.seq.indexOf(i);
      return `<button class="sxBo ${k >= 0 ? 'on' : ''}" data-a="bdo" data-v="${i}" style="left:${nd[1]}%;top:${nd[2]}%" ${E.done ? 'disabled' : ''}>${k >= 0 ? `<i>${k + 1}</i>` : ''}${OGI[nd[0]] ? `<img src="${IC(OGI[nd[0]])}" alt="">` : ''}<span>${nd[0]}</span></button>`; }).join('');
    const pts = E.seq.map(i => S.nodes[i]), line = `<svg class="sxBoSvg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.map(p => p[1] + ',' + p[2]).join(' ')}" fill="none" stroke="#4CB84C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    stage = `<div class="sxStage"><div class="sxBoW"><div class="sxBoCap">${S.cap}</div>${line}${nodes}</div></div>`;
    const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいこう！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
    body = `<div class="sxMis"><span class="sxMisN">もんだい ${E.i + 1} / 5</span><p>${RB(S.t)}　ミス ${'♥'.repeat(Math.max(0, 3 - E.miss))}${'♡'.repeat(Math.min(3, E.miss))}</p></div>${fb}${E.done ? `<button class="sxBtn big" data-a="bdn">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}`;
  } else {
    stage = `<div class="sxStage"><div class="sxBoQ"><img src="${IC(({1:'card_life_skeleton', 2:'og_heart', 3:'og_lungs', 4:'og_kidney', 5:'card_life_brain'})[E.star])}" alt=""></div></div>`;
    const fb = E.msg ? `<div class="sxFb ${E.msg.ok ? 'ok' : 'ng'}"><b>${E.msg.ok ? 'せいかい！' : 'ざんねん…'}</b><p>${RB(E.msg.t)}</p></div>` : '';
    body = `<div class="sxMis"><span class="sxMisN">クイズ ${E.i + 1} / 5</span><p>${RB(r.q)}</p></div><div class="sxChG">${r.ch.map((c, i) => `<button class="sxCh ${E.done ? (c === r.a ? 'ok' : (E.picked === i ? 'ng' : 'dim')) : ''}" data-a="bdc" data-v="${i}" ${E.done ? 'disabled' : ''}>${RB(c)}</button>`).join('')}</div>${fb}${E.done ? `<button class="sxBtn big" data-a="bdn">${E.i + 1 >= 5 ? 'けっかへ' : 'つぎへ ▶'}</button>` : ''}`;
  }
  return tab ? `<div class="sxLabG"><div class="sxLabL">${stage}</div><div class="sxLabR">${body}</div></div>` : `${stage}${body}`;
};

/* =====================================================================
   render（トップ画面は 全面イラスト）
   ===================================================================== */
function render(){
  if(!ROOT || !VIEW) return;
  stopTimers();
  const tab = isTab(); ROOT.classList.toggle('tab', tab); ROOT.classList.toggle('ph', !tab); ROOT.classList.toggle('sxTopFull', V.s === 'top');
  const f = SCREENS[V.s] || SCREENS.top, r = f(tab);
  ROOT.classList.toggle('sxZoneBg', !!r.bg); if(r.bg){ ROOT.style.setProperty('--zbg', `url(${r.bg})`); ROOT.style.setProperty('--zpos', r.bgpos || '50% 40%'); }
  ROOT.style.setProperty('--zc', r.zc || '#F2A33A');
  const rbm = {hard:'ふりがな：一部', all:'ふりがな：全部', none:'ふりがな：なし'}[MODE()];
  const ttl = r.title || TITLES[V.s] || '';
  const keepY = (VIEW.querySelector('.sxMain') || {}).scrollTop || 0, same = VIEW.dataset.s === V.s;
  VIEW.dataset.s = V.s;
  VIEW.innerHTML = `<header class="sxBarT"><button class="sxBack" data-a="back">${SVGI.back}<span>${V.s === 'top' ? 'まちへ' : 'もどる'}</span></button>
    <div class="sxTtl">${V.s === 'top' ? '' : `<span>${X(ttl)}</span>`}</div>
    ${V.s === 'top' ? `<button class="sxRb" data-a="ruby">${rbm}</button>` : ''}
    <div class="sxPt"><i class="sxCoin">P</i><b>${nf(save.points.bal)}</b><small>pt</small></div></header>
    <main class="sxMain ${r.cls || ''}">${r.html}</main>`;
  rubify(VIEW);
  const m = VIEW.querySelector('.sxMain'); if(m && same && r.keep) m.scrollTop = keepY;
  if(r.after) r.after(VIEW);
}

/* ---- K-02 ゾーン：画面ぜんたいが イラスト ---- */
SCREENS.zone = function(tab){
  const z = ZN(V.z) || ZONES[0], ex = zoneExps(z.id), imp = zoneImpl(z.id).length, cl = zoneClears(z.id);
  const rw = REWARDS.find(r => r.t === 'town' && ({chem:'sci_fireworks', elec:'sci_power', light:'sci_rainbow', space:'sci_stardeck'})[z.id] === r.id);
  const name = `<div class="sxZName" style="--zc:${z.c}">${X(z.n)}</div>`;
  const say = `<div class="sxSay"><img src="${art(z.ch)}" alt=""><div class="sxBub2"><b>${X(z.chn)}</b>${RB(pick(z.say))}</div></div>`;
  const tabs = `<div class="sxTabs"><button class="on">じっけん</button><button data-a="qsel" data-v="${z.id}">もんだい</button><button data-a="cards" data-v="${z.id}">ずかん</button></div>`;
  const master = `<div class="sxMaster"><div><b>${X(z.sh)} マスターまで</b>${bar(imp ? cl / imp * 100 : 0)}</div><span>${zoneMaster(z.id) ? 'マスター！' : `${cl}/${imp}`}${rw ? `<small>ごほうび：${X(rw.n)}</small>` : ''}</span></div>`;
  const list = `<div class="sxExL">${ex.map(expCard).join('')}</div>`;
  return {title:tab ? z.n : z.sh, zc:z.c, cls:'zone', bg:IC(z.bg), bgpos:z.fx, html: tab
    ? `<div class="sxTabL sxZL"><div class="sxZSpace">${name}${say}</div></div><div class="sxTabR sxZR">${tabs}${list}${master}</div>`
    : `<div class="sxZSpace">${name}${say}</div><div class="sxPh sxZP">${tabs}${list}${master}</div>`};
};

/* ---------- CSS ---------- */
const css = document.createElement('style'); css.id = 'sc700css';
css.textContent = "#sc700{position:fixed;inset:0;z-index:66;opacity:0;transition:opacity .22s;background:linear-gradient(180deg,#DDF1FF,#FFF8E8 60%);overflow:hidden;color:#4A3420;font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}\n#sc700.show{opacity:1}\nbody.sc700on{overflow:hidden}\n#sc700 *{box-sizing:border-box;min-width:0}\n:where(#sc700) button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}\n:where(#sc700) button:disabled{cursor:default}\n#sxView{position:absolute;inset:0;display:flex;flex-direction:column}\nbody.sc700on #toast{z-index:90}\n/* ---- 上の バー ---- */\n.sxBarT{flex:none;display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;position:relative;z-index:6;background:linear-gradient(#fff 55%,rgba(255,255,255,0))}\n.sxBack{display:flex;align-items:center;background:#fff;border:3px solid #fff;border-radius:99px;padding:2px 14px 2px 6px;font-weight:900;font-size:15px;color:#2E6FB5;box-shadow:0 3px 6px rgba(0,0,0,.25);white-space:nowrap;flex:none}\n.sxBack svg{width:22px;height:22px}\n.sxTtl{flex:1;text-align:center;overflow:hidden}\n.sxTtl span{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(#FFE08A,#F6B93B);border:3px solid #fff;border-radius:99px;padding:3px 16px;font-size:17px;font-weight:900;color:#6B3E0A;box-shadow:0 3px 6px rgba(0,0,0,.25);white-space:nowrap}\n.sxRb{background:#fff;border-radius:99px;padding:4px 10px;font-weight:900;font-size:11px;color:#6B5A44;box-shadow:0 2px 4px rgba(0,0,0,.2);flex:none;white-space:nowrap}\n.sxPt{display:flex;align-items:center;gap:4px;background:#fff;border-radius:99px;padding:3px 12px 3px 4px;font-weight:900;font-size:15px;box-shadow:0 3px 6px rgba(0,0,0,.25);white-space:nowrap;flex:none}\n.sxPt small{font-size:11px;color:#8A7A65}\n.sxCoin{display:inline-flex;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE98A,#F2B33D);border:2px solid #C98A12;color:#8A5A00;font-size:12px;font-weight:900;align-items:center;justify-content:center;font-style:normal;flex:none}\n.sxMain{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;position:relative;padding-bottom:calc(14px + env(safe-area-inset-bottom))}\n.sxPh{padding:10px 12px;display:flex;flex-direction:column;gap:10px}\n.tab .sxBarT{padding:calc(10px + env(safe-area-inset-top)) 18px 8px}\n.tab .sxBack{font-size:19px;padding:3px 18px 3px 8px}\n.tab .sxTtl span{font-size:21px;padding:4px 24px}\n.tab .sxPt{font-size:18px}\n.tab .sxRb{font-size:14px;padding:6px 14px}\n/* タブレット：左右2分割 */\n.tab .sxMain.top,.tab .sxMain.zone,.tab .sxMain.qsel,.tab .sxMain.res{display:grid;grid-template-columns:57% 43%;overflow:hidden;padding:0}\n.tab .sxTabL{position:relative;overflow:hidden;min-height:0}\n.tab .sxTabR{overflow-y:auto;overflow-x:hidden;padding:6px 16px 16px;display:flex;flex-direction:column;gap:10px;min-height:0;border-left:6px solid #F1D9AA;background:#FFF8E8}\n/* ---- ボタン・カード ---- */\n.sxBtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:99px;font-weight:900;color:#fff;background:#F2A33A;box-shadow:0 5px 0 #C27A1C;padding:9px 18px;font-size:16px;position:relative;white-space:nowrap}\n.sxBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #C27A1C}\n.sxBtn.b{background:#3C93DC;box-shadow:0 5px 0 #2569A6}.sxBtn.p{background:#F0709A;box-shadow:0 5px 0 #BE4570}.sxBtn.g{background:#4CB84C;box-shadow:0 5px 0 #2F8A2F}.sxBtn.v{background:#9B6CE0;box-shadow:0 5px 0 #6F45B3}\n.sxBtn.w{background:#fff;color:#4A3420;box-shadow:0 5px 0 #CFC3AE;border:2px solid #EADFCF}\n.sxBtn.sm{padding:6px 14px;font-size:14px}.sxBtn.big{font-size:19px;padding:12px 22px;width:100%}\n.sxBtn:disabled{opacity:.5}\n.sxBtn svg,.sxBtn img{width:22px;height:22px}\n.sxBtn small{font-size:11px;opacity:.9}\n.tab .sxBtn{font-size:19px}.tab .sxBtn.sm{font-size:16px}.tab .sxBtn.big{font-size:22px;padding:14px}\n.sxCard{background:#fff;border:3px solid #F1D9AA;border-radius:22px;box-shadow:0 4px 0 #EADCC4;position:relative;padding:8px 12px}\n.sxDot{position:absolute;right:-4px;top:-8px;min-width:22px;height:22px;border-radius:99px;background:#E8414B;color:#fff;font-size:13px;font-weight:900;font-style:normal;display:flex;align-items:center;justify-content:center;border:2px solid #fff;padding:0 4px}\n.sxBar2{height:13px;border-radius:99px;background:#EFE5D3;overflow:hidden;position:relative}\n.sxBar2 i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#FFD25A,#F2A33A);transition:width .4s}\n.sxBar2.bl i{background:linear-gradient(90deg,#8FDDF7,#2C8FD0)}\n.sxSt{color:#F2A33A;letter-spacing:1px}.sxSt u{text-decoration:none;color:#E0D6C2}\n.sxX2{display:inline-block;background:#fff;color:#E8414B;border-radius:99px;padding:2px 10px;font-size:13px;font-weight:900;white-space:nowrap}\n.sxPtT{display:inline-flex;align-items:center;gap:3px;font-weight:900;color:#C27A1C}.sxPtT .sxCoin{width:18px;height:18px;font-size:10px}\n.sxTix{display:inline-flex;align-items:center;gap:3px;background:#FFF3D6;border-radius:99px;padding:1px 8px;font-weight:900;font-size:13px}.sxTix svg{width:22px;height:16px}.sxTix small{font-size:11px;color:#8A7A65}\n.sxOk{display:inline-flex;flex-direction:column;align-items:center;gap:1px;font-weight:900;color:#2F8A2F}.sxOk svg{width:24px;height:24px}.sxOk small{font-size:11px}\n.sxNew{display:inline-block;background:#E8414B;color:#fff;border-radius:8px;padding:1px 8px;font-size:12px;font-weight:900}\n.sxSoon{display:inline-flex;flex-direction:column;align-items:center;font-size:11px;color:#8A7A65;font-weight:900}.sxSoon svg{width:22px;height:22px}\n.sxNote{font-size:12.5px;color:#8A7A65;line-height:1.6;padding:2px 6px}\n.sxBub2{position:relative;background:#fff;border:3px solid #E8B04A;border-radius:16px;padding:6px 12px;font-weight:900;font-size:14px;line-height:1.45;box-shadow:0 3px 6px rgba(0,0,0,.18)}\n.sxBub2 b{display:block;font-size:11px;color:#C27A1C}\n.sxBub2:before{content:\"\";position:absolute;left:-11px;top:50%;margin-top:-8px;border:8px solid transparent;border-right-color:#E8B04A;border-left:0}\n.tab .sxBub2{font-size:18px;padding:10px 16px}\n/* ---- トップ ---- */\n.sxHero{position:relative;height:300px;overflow:hidden;border-radius:0 0 26px 26px}\n.sxHeroBg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%}\n.sxOwl{position:absolute;left:3%;bottom:-6px;height:62%;max-height:210px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}\n.sxHana{position:absolute;right:5%;bottom:-6px;height:58%;max-height:195px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))}\n.sxBub{position:absolute;left:12px;top:10px;max-width:62%;background:#fff;border:3px solid #E8B04A;border-radius:16px;padding:5px 12px;font-weight:900;font-size:13px;line-height:1.4;box-shadow:0 3px 6px rgba(0,0,0,.25);cursor:pointer}\n.sxBub b{display:block;font-size:11px;color:#C27A1C}\n.tab .sxMain.top .sxTabL{height:100%}.tab .sxHero{height:100%;border-radius:0}.tab .sxBub{font-size:19px;padding:10px 18px;top:18px;left:18px}.tab .sxBub b{font-size:14px}\n.tab .sxOwl{max-height:none;height:50%}.tab .sxHana{max-height:none;height:46%}\n.sxRank{display:flex;align-items:center;gap:10px;cursor:pointer}\n.sxRk{flex:1}.sxRkN{font-size:16px;font-weight:900}.sxRkN small{font-size:11px;color:#8A7A65;margin-left:8px}\n.sxRkS{font-size:12px;color:#8A7A65;margin-top:3px;display:flex;justify-content:space-between;align-items:center;gap:6px}\n.sxDaily{display:flex;align-items:center;gap:10px;width:100%;border-radius:20px;background:linear-gradient(90deg,#F7B733,#F0653C);border:3px solid #fff;box-shadow:0 4px 0 #C2541F;padding:6px 10px 6px 6px;color:#fff;text-align:left}\n.sxDaily img{width:46px;height:46px;border-radius:12px;background:#fff;border:2px solid #fff;object-fit:contain;padding:2px;flex:none}\n.sxDaily div{flex:1;line-height:1.25}.sxDaily small{font-size:12px;display:block}.sxDaily b{font-size:17px}\n.sxZg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px 8px}\n.sxZc{position:relative;background:#fff;border:3px solid var(--zc);border-radius:18px;overflow:hidden;text-align:left;box-shadow:0 3px 0 rgba(0,0,0,.12);display:flex;flex-direction:column}\n.sxZi{display:block;width:100%;height:70px;background-size:cover}\n.sxZc b{display:flex;align-items:center;padding:3px 6px 0;font-size:11.5px;line-height:1.2;min-height:2.5em}\n.sxZc i{font-style:normal;padding:0 6px 4px;font-size:11px;color:var(--zc);letter-spacing:1px;min-height:18px}\n.tab .sxZg{grid-template-columns:repeat(2,1fr);gap:10px}.tab .sxZi{height:84px}.tab .sxZc b{font-size:15px;padding:4px 10px 0;min-height:0}.tab .sxZc i{font-size:14px;padding:0 10px 6px}\n.sxNav{display:flex;gap:8px}.sxNav .sxBtn{flex:1;padding:10px 4px}\n/* ---- ゾーン ---- */\n.sxZHero{position:relative;height:230px;overflow:hidden;border-radius:0 0 26px 26px}\n.sxZHero img{width:100%;height:100%;object-fit:cover;display:block}\n.sxZName{position:absolute;left:12px;bottom:10px;background:var(--zc);color:#fff;border:3px solid #fff;border-radius:99px;padding:3px 16px;font-weight:900;font-size:16px;box-shadow:0 3px 6px rgba(0,0,0,.3)}\n.tab .sxMain.zone .sxTabL{display:flex;flex-direction:column}.tab .sxZHero{height:100%;flex:1;border-radius:0}.tab .sxZName{font-size:22px;padding:5px 24px}\n.sxSay{display:flex;align-items:center;gap:8px}.sxSay img{width:54px;height:54px;object-fit:contain;flex:none}\n.tab .sxMain.zone .sxSay{position:absolute;left:14px;right:14px;bottom:62px}.tab .sxSay img{width:86px;height:86px}\n.sxTabs{display:flex;gap:6px}\n.sxTabs button{flex:1;border-radius:99px;padding:7px 4px;font-weight:900;font-size:15px;background:#fff;border:3px solid #fff;box-shadow:0 3px 0 #CFC3AE;position:relative}\n.sxTabs button.on{background:var(--zc);color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.25)}\n.tab .sxTabs button{font-size:18px;padding:9px 4px}\n.sxExL{display:flex;flex-direction:column;gap:9px}\n.sxEx{display:flex;align-items:center;gap:10px;background:#fff;border:3px solid #F1D9AA;border-radius:20px;padding:7px 10px 7px 7px;text-align:left;box-shadow:0 4px 0 #EADCC4;width:100%}\n.sxEx.isSoon{opacity:.55;filter:grayscale(.5)}\n.sxEx>img{width:62px;height:62px;border-radius:14px;background:radial-gradient(#fff,#EAF6FF);border:3px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.2);object-fit:contain;flex:none;padding:3px}\n.sxExT{flex:1;line-height:1.3}.sxExT b{font-size:16px;display:block}.sxExT em{font-style:normal;font-size:11.5px;color:#8A7A65;font-weight:700;display:block}\n.sxExM{display:flex;align-items:center;gap:8px;font-size:12px;margin-top:2px;flex-wrap:wrap}.sxExM span:nth-child(2){color:#8A7A65;font-weight:900}\n.tab .sxEx>img{width:78px;height:78px}.tab .sxExT b{font-size:20px}.tab .sxExT em{font-size:14px}.tab .sxExM{font-size:14px}\n.sxMaster{display:flex;align-items:center;gap:10px;background:#fff;border:3px solid #F1D9AA;border-radius:20px;padding:6px 12px}\n.sxMaster>div{flex:1;font-size:13px;font-weight:900}.sxMaster .sxBar2{margin-top:3px}.sxMaster>span{font-size:13px;font-weight:900;color:#C27A1C;text-align:center;line-height:1.2}.sxMaster small{display:block;font-size:11px;color:#8A7A65}\n/* ---- カード ---- */\n.sxCZ{display:flex;gap:6px;padding:4px 12px;overflow-x:auto}.sxCz{flex:none;width:58px;border:3px solid #fff;background:#fff;border-radius:16px;box-shadow:0 2px 4px rgba(0,0,0,.2);padding:2px;text-align:center;opacity:.75}\n.sxCz.on{border-color:var(--zc);opacity:1}.sxCz img{width:100%;height:40px;object-fit:contain}.sxCz small{font-size:10px;font-weight:900}\n.sxCH{display:flex;align-items:center;gap:10px;padding:6px 14px}.sxCH b{color:var(--zc);font-size:17px}.sxCH>div{flex:1}.sxCH span{font-weight:900}\n.sxCB{padding:0 14px 6px;font-size:13px;font-weight:900;color:#6B5A44}.sxCB b{color:#C27A1C}\n.sxCg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:4px 12px}\n.sxCd{position:relative;background:#fff;border:3px solid #fff;border-radius:18px;box-shadow:0 3px 0 #EADCC4,0 0 0 2px #F1D9AA;padding:6px;text-align:center}\n.sxCd.rare{background:#FFF8DD;box-shadow:0 3px 0 #E0B94A,0 0 0 3px #F2B33D}\n.sxCdI{position:relative;display:block;aspect-ratio:1;border-radius:12px;background:radial-gradient(#fff,#EAF6FF);overflow:hidden}.sxCdI img{width:100%;height:100%;object-fit:contain;padding:6px}\n.sxCd.no .sxCdI img{filter:grayscale(1) brightness(.4) blur(3px);opacity:.5}.sxCdI em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-style:normal;font-weight:900;color:#8A7A65}\n.sxCd b{display:block;font-size:12px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.sxCd u{position:absolute;left:-4px;top:-6px;background:#F2B33D;color:#fff;border-radius:8px;padding:0 8px;font-size:11px;text-decoration:none;font-weight:900}\n.tab .sxCg{grid-template-columns:repeat(4,1fr);gap:14px;padding:6px 22px}.tab .sxCd b{font-size:15px}.tab .sxCz{width:84px}.tab .sxCz img{height:56px}.tab .sxCH b{font-size:22px}\n/* ---- ごほうび ---- */\n.sxRwG{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:8px 12px}\n.sxRw{background:#fff;border:3px solid #F1D9AA;border-radius:20px;padding:6px 6px 8px;text-align:center;box-shadow:0 3px 0 #EADCC4;display:flex;flex-direction:column;gap:2px}\n.sxRw.ready{border-color:#4CB84C;background:#F4FFF0}.sxRw.xLk .sxRwI img{filter:grayscale(.85) brightness(.85)}\n.sxRwI{position:relative;height:120px;border-radius:14px;background:radial-gradient(#fff,#EAF6FF);display:flex;align-items:center;justify-content:center}.sxRwI>img{max-width:100%;max-height:100%;object-fit:contain}\n.sxRwT{position:absolute;right:4px;bottom:4px;width:44px;height:44px;border-radius:10px;border:2px solid #fff;background:#fff;object-fit:contain;box-shadow:0 2px 4px rgba(0,0,0,.25)}\n.sxRwTL{position:absolute;right:4px;bottom:46px;font-size:9px;font-style:normal;background:#4A3420;color:#fff;border-radius:6px;padding:0 4px}\n.sxRw b{font-size:14px;line-height:1.25}.sxRw em{font-style:normal;font-size:11px;color:#8A7A65;font-weight:700;line-height:1.35;min-height:2.7em}\n.sxRwA{margin-top:auto;padding-top:4px}.sxRP{display:flex;flex-direction:column;gap:3px}.sxRP small{font-size:10.5px;color:#8A7A65;font-weight:900;display:flex;align-items:center;gap:3px;justify-content:center;line-height:1.3}.sxRP small svg{width:14px;height:14px;flex:none}\n.tab .sxRwG{grid-template-columns:repeat(4,1fr);gap:14px;padding:10px 22px}.tab .sxRwI{height:150px}.tab .sxRw b{font-size:17px}.tab .sxRw em{font-size:13px}.tab .sxRP small{font-size:12px}\n.sxRkL{display:flex;flex-direction:column;gap:8px;padding:8px 12px}.sxRkR{display:flex;align-items:center;gap:10px;opacity:.6}.sxRkR.on{opacity:1}.sxRkR b{display:block;font-size:15px}.sxRkR small{display:block;font-size:11px;color:#8A7A65}.sxRkR em{display:block;font-style:normal;font-size:12px;color:#2F8A2F;font-weight:900}.sxRkR>div{flex:1}.sxRkR>svg{width:24px;height:24px}\n.sxRkL.m{padding:0}.sxRkL.m .sxRkR{padding:4px 0}\n.sxMain.rew .sxTabs{padding:6px 12px 0}.sxMain.rew .sxTabs button.on{background:#4CB84C}\n/* ---- もんだい：レベル ---- */\n.sxQHead{display:flex;align-items:flex-end;gap:10px;padding:6px 12px 0}.sxQHead img{width:74px;height:100px;object-fit:contain;flex:none}.sxQHead .sxBub2{flex:1;margin-bottom:22px}\n.tab .sxMain.qsel .sxTabL.qh{display:flex;align-items:center;justify-content:center;background:linear-gradient(#DDF1FF,#FFF8E8)}.tab .sxQHead{flex-direction:column;align-items:center;padding:0 30px}.tab .sxQHead img{width:210px;height:280px}.tab .sxQHead .sxBub2{margin:0 0 20px}.tab .sxQHead .sxBub2:before{display:none}\n.sxChips{display:flex;gap:6px;padding:4px 12px;overflow-x:auto;flex:none}.sxChip{flex:none;border-radius:99px;padding:4px 12px;font-weight:900;font-size:13px;background:#fff;border:3px solid var(--zc);color:#4A3420;white-space:nowrap}.sxChip.on{background:var(--zc);color:#fff}\n.tab .sxChips{padding:2px 0;flex-wrap:wrap}.tab .sxChip{font-size:16px;padding:5px 16px}\n.sxLvG{display:flex;flex-direction:column;gap:7px;padding:4px 12px}\n.tab .sxLvG{padding:0}\n.sxLv{display:flex;align-items:center;gap:10px;background:#fff;border:3px solid #F1D9AA;border-radius:20px;padding:6px 12px 6px 8px;text-align:left;width:100%;box-shadow:0 3px 0 #EADCC4}\n.sxLv.sel{border-color:#F2A33A;background:#FFF8DD}.sxLv.xLk{opacity:.55}\n.sxLvI{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.3);line-height:1;flex:none}.sxLvI i{font-style:normal;font-size:11px}.sxLvI b{font-size:17px}\n.sxLvT{flex:1}.sxLvT b{font-size:16px;display:block;line-height:1.25}.sxLvT b small{display:block;font-size:11px;color:#8A7A65;font-weight:700}.sxLvT .sxBar2{height:9px;margin-top:4px}.sxLvH{display:flex;align-items:center;gap:3px;font-size:11px;color:#8A7A65;font-weight:900;margin-top:3px}.sxLvH svg{width:14px;height:14px;flex:none}\n.sxLvP{text-align:right;font-size:11px;color:#8A7A65}.sxLvP svg{width:22px;height:22px}\n.tab .sxLvT b{font-size:20px}.tab .sxLvT b small{font-size:13px;display:inline;margin-left:6px}\n.sxQN{display:flex;align-items:center;gap:8px;margin:2px 12px;flex-wrap:wrap}.sxQN>span:first-child{font-size:13px;font-weight:900}.sxQT{margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;color:#8A7A65;font-weight:900}.sxQT svg{width:24px;height:17px}\n.tab .sxQN{margin:0}\n.sxMain.qsel>.sxBtn.big,.sxMain.qsel .sxBtn.big{background:var(--bc,#F2A33A);margin:4px 12px 0;width:calc(100% - 24px)}.tab .sxMain.qsel .sxBtn.big{margin:4px 0 0;width:100%}\n/* ---- もんだい：出題 ---- */\n.sxQTop{display:flex;align-items:center;gap:8px;padding:2px 14px}.sxQTop .sxBar2{flex:1;height:14px}.sxQTop b{font-size:14px}\n.sxLvTag{display:inline-block;color:#fff;border-radius:99px;padding:1px 12px;font-size:13px;font-weight:900;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2)}\n.sxTimer{display:flex;align-items:center;gap:8px;padding:4px 14px;font-size:13px;font-weight:900}.sxTimer .sxBar2{flex:1;height:11px}.sxTimer b{font-size:18px;color:#E8414B}\n.sxMain.quiz,.sxMain.exp{padding-top:2px}\n.sxFig{margin:6px 14px;background:#fff;border:3px solid #F1D9AA;border-radius:20px;height:150px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:6px}.sxFig svg{max-height:100%;max-width:100%;width:auto;height:100%}\n.sxFig.z{background-size:cover;padding:0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.2)}\n.sxQBox{margin:6px 14px;padding:10px 14px;font-size:16.5px;line-height:1.65;font-weight:800;position:relative}.sxQBox p{margin:0}\n.sxQZ{position:absolute;left:12px;top:-10px;color:#fff;border-radius:99px;padding:0 10px;font-size:11px;font-weight:900}\n.sxChG{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:6px 14px}\n.sxCh{position:relative;background:#fff;border:3px solid #F1D9AA;border-radius:18px;padding:10px 8px;font-weight:900;font-size:15px;line-height:1.35;box-shadow:0 4px 0 #EADCC4;min-height:54px;display:flex;align-items:center;justify-content:center;text-align:center}\n.sxCh svg{position:absolute;right:6px;top:6px;width:22px;height:22px}\n.sxCh.ok{background:#E8FAE0;border-color:#4CB84C;box-shadow:0 4px 0 #2F8A2F}.sxCh.ng{background:#FFE6E6;border-color:#E8414B;box-shadow:0 4px 0 #A82A33}.sxCh.dim{opacity:.5}.sxCh.hid{opacity:.22}\n.sxCh.sw i{display:block;width:46px;height:46px;border-radius:50%;border:4px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)}\n.sxChG.sw{grid-template-columns:repeat(4,1fr)}\n.sxFb{margin:6px 14px;border-radius:18px;padding:8px 14px;font-size:14px;line-height:1.55}.sxFb b{display:block;font-size:17px}.sxFb span{display:block;font-weight:900}.sxFb p{margin:2px 0 0;font-weight:700}\n.sxFb.ok{background:#E8FAE0;border:3px solid #4CB84C}.sxFb.ng{background:#FFF0E0;border:3px solid #F2A33A}.sxFb.ok b{color:#2F8A2F}.sxFb.ng b{color:#C2541F}\n.sxQAct{display:flex;gap:10px;padding:4px 14px}.sxQAct .sxBtn{flex:1}\n.sxMain.quiz>.sxBtn.big,.sxMain.exp>.sxBtn.big{margin:6px 14px;width:calc(100% - 28px)}\n.sxMas{display:flex;align-items:flex-end;gap:8px;padding:4px 14px}.sxMas img{width:70px;height:84px;object-fit:contain;flex:none}.sxMas .sxBub2{margin-bottom:14px}\n.tab .sxQG{display:grid;grid-template-columns:40% 60%;gap:12px;padding:6px 18px;height:calc(100% - 70px)}.tab .sxQL{display:flex;flex-direction:column;justify-content:space-between;min-height:0}.tab .sxQL .sxFig{margin:0;height:auto;flex:1;min-height:0}.tab .sxQL .sxMas{padding:6px 0 0}.tab .sxQL .sxMas img{width:110px;height:140px}\n.tab .sxQR{overflow-y:auto;display:flex;flex-direction:column;gap:6px}.tab .sxQBox{margin:8px 0 6px;font-size:22px}.tab .sxChG{padding:4px 0}.tab .sxCh{font-size:20px;min-height:76px}.tab .sxFb{margin:4px 0}.tab .sxQAct{padding:4px 0}.tab .sxMain.quiz .sxQR>.sxBtn.big{margin:4px 0}\n.tab .sxQTop{padding:4px 18px}.tab .sxTimer{padding:2px 18px}\n/* ---- けっか ---- */\n.sxResH{text-align:center;padding:10px 14px 2px}.sxRibbon{display:inline-block;background:linear-gradient(#FF8E8E,#E8414B);color:#fff;font-size:21px;font-weight:900;padding:5px 26px;border-radius:12px;border:3px solid #fff;box-shadow:0 4px 0 #A82A33}.sxResS{font-size:15px;font-weight:900;margin-top:8px}\n.sxResT{padding:6px 14px}.sxResRow{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;padding:5px 0;border-bottom:2px dashed #F1D9AA}.sxResRow b{color:#C27A1C;white-space:nowrap}\n.sxResTot{display:flex;justify-content:space-between;align-items:center;padding-top:6px;font-weight:900}.sxResTot .sxPtT{font-size:26px;color:#E8414B}.sxResTot .sxCoin{width:26px;height:26px;font-size:14px}\n.sxResCard{display:flex;align-items:center;gap:12px;background:#FFF8DD;border-color:#F2A33A;cursor:pointer}.sxResCard .sxCdI.big{width:90px;flex:none;border:4px solid #F2B33D}.sxResCard small{font-size:12px;color:#8A7A65;display:block}.sxResCard b{font-size:19px;display:block}.sxResCard em{font-style:normal;font-size:12px;color:#8A7A65}\n.sxNewT{position:absolute;left:-2px;top:-2px;background:#E8414B;color:#fff;font-size:11px;font-weight:900;border-radius:8px;padding:0 6px;z-index:2}\n.sxBadgeN{background:#FFF8DD;font-weight:900;font-size:14px}.sxRankUp{display:flex;align-items:center;gap:10px;background:#EAF6FF;border-color:#3C93DC}.sxRankUp small{font-size:12px;color:#3C93DC;font-weight:900;display:block}.sxRankUp b{font-size:19px;display:block}.sxRankUp em{font-style:normal;font-size:12px;color:#6B5A44}\n.sxInfo{background:rgba(60,147,220,.92);color:#fff;border-radius:16px;padding:8px 14px;font-size:13px;line-height:1.55;border:3px solid #fff}\n.sxResB{display:flex;gap:8px}.sxResB .sxBtn{flex:1;padding:10px 4px;font-size:15px}\n.sxResArt{display:flex;align-items:flex-end;gap:8px}.sxResArt img{width:74px;height:90px;object-fit:contain}.sxResArt .sxBub2{margin-bottom:18px}\n.tab .sxMain.res .sxTabL.resL{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:linear-gradient(#DDF1FF,#FFF8E8)}.tab .sxResH{padding-top:0}.tab .sxRibbon{font-size:34px;padding:8px 36px}.tab .sxResS{font-size:22px}.tab .sxResArt img{width:200px;height:250px}.tab .sxResRow{font-size:17px}.tab .sxResTot .sxPtT{font-size:34px}\n/* ---- モーダル ---- */\n#sxModal{position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(74,63,53,.5);padding:14px}\n#sxModal.on{display:flex}\n.sxMCard{background:#FFFDF8;border:4px solid #F1D9AA;border-radius:26px;padding:16px 16px 14px;width:min(440px,100%);max-height:100%;overflow-y:auto;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.35)}\n.sxMod.gold .sxMCard{border-color:#F2B33D;background:linear-gradient(#FFF8DD,#fff)}\n.sxMT{font-size:20px;margin:6px 0}.sxMP{font-size:14.5px;line-height:1.65;margin:4px 0 8px}.sxMS{font-size:12px;color:#8A7A65;margin:2px 0}\n.sxMArt{margin:0 auto 4px;width:150px;height:130px;display:flex;align-items:center;justify-content:center;position:relative}.sxMArt img{max-width:100%;max-height:100%;object-fit:contain}\n.sxMArt.xcard{width:170px;height:170px;border-radius:24px;background:radial-gradient(#fff,#EAF6FF);border:5px solid var(--zc);box-shadow:0 4px 10px rgba(0,0,0,.25)}.sxMArt.xcard.rare{border-color:#F2B33D;background:radial-gradient(#fff,#FFF1B8)}.sxMArt.xcard img{padding:10px}.sxMArt em{position:absolute;font-size:60px;font-style:normal;font-weight:900;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.4)}\n.sxRare{background:#F2B33D;color:#fff;border-radius:8px;padding:0 8px;font-size:13px}\n.sxMBtns{display:flex;gap:10px;justify-content:center;margin-top:8px}.sxMBtns .sxBtn{flex:1;max-width:210px}\n.sxPickH{display:flex;align-items:center;gap:10px;text-align:left}.sxPickH img{width:64px;height:64px;object-fit:contain;flex:none}.sxPickH b{font-size:18px;display:block}.sxPickH small{font-size:12px;color:#8A7A65;font-weight:700;display:block}\n.sxPick{display:grid;grid-template-columns:repeat(auto-fit,minmax(84px,1fr));gap:8px;margin:6px 0}\n.sxPickB{border-radius:18px;background:#fff;border:3px solid #F2A33A;box-shadow:0 4px 0 #C27A1C;padding:6px 4px;display:flex;flex-direction:column;align-items:center;gap:1px}.sxPickB b{font-size:19px;color:#E0A000}.sxPickB small{font-size:11px}.sxPickB.xLk{border-color:#EADFCF;box-shadow:0 4px 0 #CFC3AE;opacity:.6}.sxPickB.xLk b{color:#8A7A65}\n/* ---- 実験 ---- */\n.sxExTop{display:flex;align-items:center;gap:8px;padding:2px 14px 4px}.sxExTop b{font-size:16px}\n.sxStage{margin:4px 14px;background:transparent;border:0;border-radius:22px;padding:0;display:flex;align-items:center;justify-content:center;position:relative;flex-direction:column}\n.sxStage .sxSvg{width:100%;max-height:300px;height:auto}\n.sxGs{width:100%;padding:4px 6px 2px;display:flex;flex-direction:column;gap:4px}.sxG{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:900}.sxG span{width:130px;flex:none}.sxG .sxBar2{flex:1}\n.sxGg{font-size:12.5px;font-weight:800;line-height:1.5}.sxLeft{font-size:12px;font-weight:800;color:#6B5A44}\n.sxMis{margin:4px 14px;padding:8px 12px;background:#FFF3D6;border-radius:16px;font-size:14.5px;line-height:1.6;font-weight:800}.sxMis p{margin:2px 0 0}.sxMisN{display:inline-block;background:#F2A33A;color:#fff;border-radius:99px;padding:0 10px;font-size:11px;font-weight:900}\n.sxCtl{display:flex;flex-direction:column;gap:8px;padding:4px 14px}\n.sxSl{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:900}.sxSl>span{width:44%;flex:none;line-height:1.3}.sxSl b{width:62px;text-align:right;flex:none;font-size:14px;color:#C27A1C}.sxSl.big{padding:4px 14px}\n.sxSl input[type=range]{flex:1;height:34px;accent-color:var(--zc);-webkit-appearance:none;appearance:none;background:transparent}\n.sxSl input[type=range]::-webkit-slider-runnable-track{height:12px;border-radius:99px;background:#E6D9C2}.sxSl input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:#fff;border:5px solid var(--zc);margin-top:-10px;box-shadow:0 2px 5px rgba(0,0,0,.35)}\n.sxSl input[type=range]:disabled{opacity:.5}\n.sxTg{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:900;padding:2px 14px}.sxTg>span{width:30%;flex:none}.sxTg .sxSeg{display:flex;gap:6px;flex:1;flex-wrap:wrap}.sxCtl .sxTg{padding:0}.sxCtl .sxSl{padding:0}\n.sxMain.exp>.sxBtn,.sxMain.exp .sxBtn.v.sm{margin:4px 14px}.sxMain.exp>.sxChG,.sxMain.exp>.sxFb,.sxMain.exp>.sxTray,.sxMain.exp>.sxAsmOpt,.sxMain.exp>.sxNotes{margin-left:14px;margin-right:14px}\n.tab .sxLabG{display:grid;grid-template-columns:50% 50%;gap:14px;padding:6px 18px;height:calc(100% - 44px)}.tab .sxLabL{display:flex;flex-direction:column;min-height:0}.tab .sxLabL .sxStage{margin:0;flex:1;min-height:0}.tab .sxLabR{overflow-y:auto;display:flex;flex-direction:column;gap:8px;min-height:0;padding-bottom:10px}\n.tab .sxLabR .sxMis,.tab .sxLabR .sxChG,.tab .sxLabR .sxFb,.tab .sxLabR .sxCtl,.tab .sxLabR .sxTg,.tab .sxLabR .sxTray,.tab .sxLabR .sxAsmOpt,.tab .sxLabR .sxNotes,.tab .sxLabR .sxSl.big{margin-left:0;margin-right:0;padding-left:0;padding-right:0}\n.tab .sxLabR .sxMis{padding:10px 14px;font-size:18px}.tab .sxLabR .sxBtn.v.sm,.tab .sxLabR .sxBtn.big{margin:0;width:100%}.tab .sxSl,.tab .sxTg{font-size:16px}.tab .sxG,.tab .sxGg{font-size:15px}.tab .sxSl b{font-size:17px;width:84px}\n.tab .sxStage .sxSvg{max-height:none;height:100%}.tab .sxExTop{padding:4px 18px}.tab .sxExTop b{font-size:20px}\n.tab .sxMain.exp .sxLabR .sxFb{margin:0}\n.sxMain.exp .sxTimer{padding:2px 14px}\n/* 炎色反応 */\n.sxStage.fl{background:linear-gradient(#1B1F3A,#2D2250);border:3px solid #5B4B8A;padding:6px}\n.sxFlW{position:relative;display:flex;flex-direction:column;align-items:center}.sxBurner{filter:drop-shadow(0 0 16px rgba(255,255,255,.12))}.sxFl{transform-origin:50% 90%;animation:sxFlick .5s ease-in-out infinite alternate}\n@keyframes sxFlick{from{transform:scale(1,1)}to{transform:scale(.96,1.05)}}\n.sxFlD{position:absolute;left:-6px;top:56px;text-align:center;color:#fff;font-size:12px;font-weight:900;display:flex;flex-direction:column;align-items:center}\n.sxStage.fl .sxBtn.go{margin-top:8px;width:auto}\n.sxNotes{background:#fff;border:3px solid #F1D9AA;border-radius:18px;padding:6px 10px;font-size:12.5px;font-weight:800}.sxNotes>div{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}\n.sxNt{display:inline-flex;align-items:center;gap:4px;background:#F4F0E6;border-radius:99px;padding:2px 8px 2px 2px;font-size:11px;color:#8A7A65}.sxNt i{display:inline-flex;width:22px;height:22px;border-radius:50%;background:#D9D0BE;color:#fff;font-style:normal;font-weight:900;align-items:center;justify-content:center;font-size:11px}.sxNt.on{background:#fff;color:#4A3420;box-shadow:inset 0 0 0 2px var(--fc)}.sxNt.on i{background:var(--fc);text-shadow:0 1px 2px rgba(0,0,0,.5)}\n/* 車 */\n.sxStage.asm{background:linear-gradient(#DDF1FF,#EEF6FA);border:3px solid #fff;padding:6px}.sxAsmW{position:relative;display:flex;justify-content:center;width:100%}.sxAsmW.shake{animation:sxShk .3s}@keyframes sxShk{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}\n.sxAsm{width:100%;max-width:640px;height:auto}.sxGhost{position:absolute;right:6px;top:2px;background:#fff;border:3px solid #F2A33A;border-radius:99px;padding:1px 12px;font-size:13px;font-weight:900}\n.sxAsmMeta{font-size:13px;font-weight:900;color:#6B5A44;margin-top:2px}\n.sxTray{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));gap:7px;padding:4px 14px}\n.sxPart{background:#fff;border:3px solid #F1D9AA;border-radius:16px;box-shadow:0 3px 0 #EADCC4;padding:4px 2px;display:flex;flex-direction:column;align-items:center;gap:2px}.sxPart span{width:44px;height:40px;display:flex;align-items:center;justify-content:center}.sxPart img{max-width:100%;max-height:100%;object-fit:contain}.sxPart b{font-size:11px;white-space:nowrap}\n.sxPart.hint{border-color:#F2A33A;background:#FFF3C8;animation:sxGlow .8s infinite alternate}@keyframes sxGlow{to{box-shadow:0 0 0 4px rgba(242,163,58,.45)}}\n.sxBody{display:block;width:44px;height:26px;border-radius:12px 12px 6px 6px;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)}.sxSeat{display:block;width:30px;height:34px;border-radius:10px;background:#B9773A;border:3px solid #7A4A1E}\n.sxAsmOpt{display:flex;flex-direction:column;gap:6px;padding:2px 14px;font-size:13px;font-weight:900}.sxAsmOpt>div{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.sxAsmOpt>div>span{width:78px;flex:none}\n.sxAsmOpt>div.sxPerf{flex-direction:column;align-items:stretch;flex-wrap:nowrap;gap:4px}.sxPerf .sxG{width:100%}\n.sxSw{width:30px;height:30px;border-radius:50%;border:3px solid rgba(255,255,255,.8);box-shadow:0 2px 4px rgba(0,0,0,.35)}.sxSw.on{border-color:#4A3420}\n.sxPerf{display:flex;flex-direction:column;gap:3px;margin-top:2px}.sxPerf .sxG span{width:64px}\n.sxInspG{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:6px 14px}.sxInsp{position:relative;background:#E6EEF3;border:4px solid #fff;border-radius:18px;padding:4px;box-shadow:0 3px 0 #BFD0DA}.sxInsp.sel{border-color:#E8414B;background:#FFE6E6}.sxInsp svg{width:100%;height:auto}.sxInsp i{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:13px;color:#E8414B;font-style:normal;font-weight:900}\n/* エンジン */\n.sxStage.eng{background:linear-gradient(#10162E,#1F2A50);border:3px solid #3A4780;padding:6px}.sxStage.eng svg{max-height:380px;width:100%;height:auto}.tab .sxStage.eng svg{max-height:none;height:100%;width:100%}\n/* ---- 画面の 演出 ---- */\n.sxFx{position:fixed;inset:0;z-index:92}\n.sxFx.fw{pointer-events:none;background:transparent}\n#sxFw{background:rgba(10,14,40,.0)}\n.sxRkSky{position:absolute;inset:0;background:linear-gradient(#0E1530,#4A7BD6 70%,#BFE5FA);overflow:hidden;display:flex;justify-content:center}.sxRkCount{position:absolute;top:18%;left:0;right:0;text-align:center;color:#fff;font-size:44px;font-weight:900;text-shadow:0 3px 8px rgba(0,0,0,.5);z-index:2}\n.sxRkImg{position:absolute;bottom:-20%;height:38%;animation:sxUp 3.8s 1.5s ease-in forwards}.sxRkSm{position:absolute;bottom:-4%;width:160px;height:120px;border-radius:50%;background:radial-gradient(#fff,rgba(255,255,255,0) 70%);animation:sxSm 4s 1.4s ease-out forwards;opacity:0}\n@keyframes sxUp{to{bottom:130%}}@keyframes sxSm{20%{opacity:1}to{opacity:0;transform:scale(3)}}\n.sxMtSky{position:absolute;inset:0;background:linear-gradient(#050A24,#1B2A6B);color:#fff;padding-top:calc(24px + env(safe-area-inset-top));text-align:center}.sxMtSky b{font-size:22px;display:block}.sxMtSky span{font-size:30px;font-weight:900;color:#FFD84A}\n.sxMtS{position:absolute;right:-90px;width:80px;height:80px;animation:sxFly 5.2s linear both;z-index:3}.sxMtS img{width:100%;height:100%;object-fit:contain;transform:scaleX(-1)}.sxMtS.got{animation-play-state:paused;opacity:0;transform:scale(2);transition:.4s}\n@keyframes sxFly{from{right:-90px;transform:translateY(0)}to{right:110%;transform:translateY(120px)}}\n@media (prefers-reduced-motion:reduce){.sxFl,.sxMtS{animation:none}}\n#sc700 .sxPh>*,#sc700 .sxTabR>*,#sc700 .sxExL>*,#sc700 .sxLvG>*,#sc700 .sxLabR>*,#sc700 .sxQR>*,#sc700 .sxRkL>*,#sc700 .sxCtl>*{flex-shrink:0}\n";
document.head.appendChild(css);
{ const css2 = document.createElement('style'); css2.id = 'sc700css2'; css2.textContent = "\n/* v6.71 からだの しくみ */\n.sxBoW{position:relative;width:100%;max-width:380px;aspect-ratio:1/1.02;margin:0 auto;background:linear-gradient(#FFF8E8,#EAF6FF);border-radius:18px;overflow:hidden}\n.sxBoSvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}\n.sxBoCap{position:absolute;left:0;right:0;top:2px;text-align:center;font-size:12px;font-weight:900;color:#8A7A65;z-index:2;pointer-events:none}\n.sxBo{position:absolute;transform:translate(-50%,-50%);background:#fff;border:3px solid #F2A33A;border-radius:99px;padding:5px 12px;font-weight:900;font-size:14px;white-space:nowrap;box-shadow:0 3px 0 #C27A1C;z-index:3;display:flex;align-items:center;gap:4px}\n.sxBo.on{background:#E8FAE0;border-color:#4CB84C;box-shadow:0 3px 0 #2F8A2F}\n.sxBo i{display:inline-flex;width:20px;height:20px;border-radius:50%;background:#4CB84C;color:#fff;font-style:normal;font-size:12px;align-items:center;justify-content:center}\n.sxBoQ{display:flex;align-items:center;justify-content:center;padding:16px}.sxBoQ img{width:150px;height:150px;object-fit:contain}\n.tab .sxBo{font-size:17px;padding:7px 16px}.tab .sxBoQ img{width:220px;height:220px}\n"; document.head.appendChild(css2); }
{ const css3 = document.createElement('style'); css3.id = 'sc700css3'; css3.textContent = "/* v6.72 イラスト版 */\n#sc700 .sxMain.hallscreen{position:absolute;inset:0;padding:0;overflow:hidden;display:block;background:#1a2040}\n#sc700.sxTopFull .sxBarT{position:absolute;left:0;right:0;top:0;background:linear-gradient(rgba(10,14,40,.62),rgba(10,14,40,0));padding-bottom:22px;z-index:8}\n.sxHall{position:absolute}\n.sxHallBg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none;user-select:none}\n.sxHall button{position:absolute;margin:0;padding:0;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}\n.sxHd{border-radius:calc(var(--k)*34px)}\n.sxHd:active,.sxHp:active{background:rgba(255,236,150,.28);box-shadow:inset 0 0 0 3px rgba(255,255,255,.8)}\n.sxHp{border-radius:50%}\n.sxHl{position:absolute;display:flex;align-items:center;justify-content:center;gap:.4em;pointer-events:none;font-weight:900;color:#FFF8E0;text-shadow:0 1px 0 #5a3410,0 0 4px rgba(60,30,0,.9);font-size:var(--f);line-height:1;white-space:nowrap}\n.sxHl i{font-style:normal;font-size:.74em;letter-spacing:1px;color:#FFE08A}\n.sxHpl{position:absolute;transform:translate(-50%,-50%);background:rgba(255,255,255,.94);border:calc(var(--k)*5px) solid #F2B33D;border-radius:99px;padding:.12em .7em;font-weight:900;font-size:var(--f);color:#4A3420;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3);line-height:1.25}\n.sxHpl small{font-size:.74em;color:#8A7A65;margin-left:.3em}\n.sxHo{border-radius:30%}\n.sxHb{position:absolute;background:#fff;border:3px solid #E8B04A;border-radius:16px;padding:.3em .8em;font-weight:900;font-size:var(--f);line-height:1.4;box-shadow:0 3px 6px rgba(0,0,0,.3);pointer-events:none;transform:translateY(-100%)}\n.sxHb b{display:block;font-size:.72em;color:#C27A1C}\n.sxHb:after{content:\"\";position:absolute;left:26%;bottom:-11px;border:9px solid transparent;border-top-color:#E8B04A;border-bottom:0}\n.sxHrank{position:absolute;display:flex;align-items:center;gap:.6em;padding:.25em .7em;border-radius:18px;background:rgba(255,253,246,.94);border:3px solid #F1D9AA;box-shadow:0 4px 10px rgba(0,0,0,.25);cursor:pointer;font-size:var(--f);overflow:hidden}\n.sxHrank>svg{flex:none;height:78%;width:auto}.sxHrank .sxTix svg{width:22px;height:16px}\n.sxHrk{flex:1;min-width:0}\n.sxHrank .sxRkN{font-size:1.08em}.sxHrank .sxRkN small{font-size:.72em}.sxHrank .sxRkS{font-size:.78em;margin-top:2px}\n.sxHrank .sxBar2{height:.75em;margin-top:2px}\n.sxHall .sxHdaily{position:absolute;display:flex;align-items:center;gap:.6em;padding:0 .9em 0 .35em;border-radius:99px;background:linear-gradient(90deg,#F7B733,#F0653C);border:3px solid #fff;box-shadow:0 3px 0 #C2541F,0 4px 10px rgba(0,0,0,.25);color:#fff;font-size:calc(var(--f)*.92);font-weight:900;text-align:left;white-space:nowrap}\n.sxHdaily img{height:84%;aspect-ratio:1;object-fit:contain;background:#fff;border-radius:50%;padding:2px;flex:none}\n.sxHdaily span{flex:1;line-height:1.12;overflow:hidden;text-overflow:ellipsis}.sxHdaily small{display:block;font-size:.72em;opacity:.95;font-weight:800}\n.sxHdaily em{font-style:normal;background:#fff;color:#E8414B;border-radius:99px;padding:.05em .6em;font-size:.82em;flex:none}\n/* 炎・図 */\n.sxFlk{transform-box:fill-box;transform-origin:50% 100%;animation:sxFlick .55s ease-in-out infinite alternate}\n@keyframes sxFlick{from{transform:scale(1,1)}to{transform:scale(.95,1.05)}}\n.sxStage.fl{background:#0b0d16;padding:0;border:3px solid #5B4B8A;overflow:hidden}\n.sxStage.fl .sxSvg{max-height:none}\n.sxNt i{background:transparent!important;box-shadow:none}.sxNt i img{width:100%;height:100%;object-fit:contain}\n.sxNt.on{box-shadow:inset 0 0 0 2px var(--fc)}\n.sxCh.sw{min-height:74px}.sxCh.sw img{height:62px;width:auto;object-fit:contain}\n.sxInspImg{width:100%;height:auto;display:block}\n.sxBo{padding:3px 12px 3px 5px}.sxBo img{height:2.3em;width:auto;max-width:3.2em;object-fit:contain;flex:none}.sxBo span{white-space:nowrap}\n.sxBoQ img{width:170px;height:170px}\n.sxStage .sxSvg{border-radius:20px}\n.sxStage.asm .sxAsm{border-radius:14px}\n.sxHrank .sxTix{white-space:nowrap;font-size:.8em;padding:0 .5em}.sxHrank .sxTix small{white-space:nowrap}\n.sxHrank{font-size:calc(var(--f)*.92)}\n.sxHall .sxHrank .sxRkS{display:flex;justify-content:space-between;align-items:center;gap:.4em}\n\n/* ゾーン：ぜんめん イラスト */\n#sc700.sxZoneBg{background:#1a1a22 var(--zbg) var(--zpos,50% 40%)/cover no-repeat}\n#sc700.sxZoneBg .sxBarT{background:linear-gradient(rgba(10,14,40,.6),rgba(10,14,40,0));padding-bottom:18px}\n.sxZSpace{position:relative;height:215px}\n.sxZSpace .sxZName{position:absolute;left:12px;top:62px;background:var(--zc);color:#fff;border:3px solid #fff;border-radius:99px;padding:3px 16px;font-weight:900;font-size:16px;box-shadow:0 3px 6px rgba(0,0,0,.3)}\n.sxZSpace .sxSay{position:absolute;left:10px;right:10px;bottom:4px;margin:0}\n.sxZSpace .sxSay img{width:50px;height:50px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}\n.sxZP{background:linear-gradient(rgba(255,248,232,0),rgba(255,248,232,.6) 22px);padding-top:18px;min-height:calc(100% - 215px)}\n.sxZP .sxEx,.sxZR .sxEx,.sxZP .sxMaster,.sxZR .sxMaster{background:rgba(255,255,255,.93)}\n.sxZP .sxTabs button.on{background:var(--zc)}\n.tab #sc700 .sxZSpace,.tab .sxZSpace{position:absolute;inset:0;height:auto}\n.tab .sxZSpace .sxZName{left:18px;top:auto;bottom:18px;font-size:22px;padding:5px 24px}\n.tab .sxZSpace .sxSay{left:14px;right:14px;bottom:78px}\n.tab .sxZSpace .sxSay img{width:96px;height:96px}\n.tab .sxZL{background:transparent}\n.tab .sxMain.zone .sxZR{background:rgba(255,248,232,.9);border-left:6px solid rgba(241,217,170,.9)}\n.tab .sxMain.zone .sxSay{position:absolute}\n.sxHrank .sxRkS{font-size:.72em}.sxHrank .sxTix{padding:0 .3em;flex:none}.sxHrk{overflow:hidden}\n"; document.head.appendChild(css3); }
})();
