/* =====================================================================
   まなびタウン v4.3：えいご（子ども用）の 問題を ふやす
   ・単元は そのまま、それぞれの 単元の ことば・文・問題の かたちを ふやす
   ※ app.js の あとに 読みこむ
   ===================================================================== */
(function(){
'use strict';
const addUniq = (arr, items, key = x => String(x[0]).toLowerCase()) => {
  const have = new Set(arr.map(key)); items.forEach(it => { const k = key(it); if(!have.has(k)){ arr.push(it); have.add(k); } });
};

/* =====================================================================
   1. 絵の 単元（くだもの・どうぶつ・のりもの…）：絵文字の ことばを ついか
   ===================================================================== */
const EWE = {
  food:[['peach','もも','🍑'],['melon','メロン','🍈'],['cherry','さくらんぼ','🍒'],['lemon','レモン','🍋'],['pineapple','パイナップル','🍍'],['pear','なし','🍐'],
        ['kiwi fruit','キウイ','🥝'],['mango','マンゴー','🥭'],['coconut','ココナッツ','🥥'],['blueberry','ブルーベリー','🫐'],['tomato','トマト','🍅'],['chestnut','くり','🌰']],
  animal:[['lion','ライオン','🦁'],['tiger','トラ','🐯'],['bear','クマ','🐻'],['panda','パンダ','🐼'],['monkey','サル','🐵'],['pig','ブタ','🐷'],['cow','ウシ','🐮'],
          ['horse','ウマ','🐴'],['sheep','ヒツジ','🐑'],['mouse','ネズミ','🐭'],['frog','カエル','🐸'],['penguin','ペンギン','🐧'],['koala','コアラ','🐨'],['giraffe','キリン','🦒'],
          ['zebra','シマウマ','🦓'],['turtle','カメ','🐢'],['snake','ヘビ','🐍'],['owl','フクロウ','🦉'],['duck','アヒル','🦆'],['whale','クジラ','🐳'],['dolphin','イルカ','🐬'],['octopus','タコ','🐙']],
  vehicle:[['taxi','タクシー','🚕'],['truck','トラック','🚚'],['ship','ふね（大きい）','🚢'],['helicopter','ヘリコプター','🚁'],['rocket','ロケット','🚀'],['police car','パトカー','🚓'],
           ['ambulance','きゅうきゅうしゃ','🚑'],['fire engine','しょうぼうしゃ','🚒'],['subway','ちかてつ','🚇'],['tractor','トラクター','🚜'],['motorcycle','オートバイ','🏍️'],['scooter','キックスクーター','🛴'],['bullet train','しんかんせん','🚄']],
  things:[['pen','ペン','🖊️'],['scissors','はさみ','✂️'],['ruler','じょうぎ','📏'],['notebook','ノート','📓'],['key','かぎ','🔑'],
          ['glasses','めがね','👓'],['phone','でんわ','📱'],['cup','コップ','🥤'],['box','はこ','📦'],['ball','ボール','⚽'],['gift','プレゼント','🎁'],['letter','てがみ','✉️'],['camera','カメラ','📷']],
  nature:[['mountain','やま','⛰️'],['sea','うみ','🌊'],['cloud','くも','☁️'],['leaf','はっぱ','🍃'],['rock','いわ','🪨'],['fire','ひ','🔥'],['volcano','かざん','🌋'],['earth','ちきゅう','🌍'],['mushroom','きのこ','🍄'],['cactus','サボテン','🌵']],
  weather:[['stormy','あらし','⛈️'],['foggy','きり','🌫️'],['hot','あつい','🥵'],['cold','さむい','🥶'],['thunder','かみなり','⚡'],['typhoon','たいふう','🌀'],['warm','あたたかい','🌤️']],
  feel:[['tired','つかれた','😩'],['scared','こわい','😱'],['excited','わくわく','🤩'],['shy','はずかしい','☺️'],['sick','ぐあいが わるい','🤒'],['fine','げんき','😊'],['bored','たいくつ','🥱'],['proud','ほこらしい','😤'],['nervous','ドキドキ（きんちょう）','😬']],
  clothes:[['dress','ワンピース','👗'],['pants','ズボン','👖'],['jacket','ジャケット','🧥'],['hat','ぼうし（つばの ある）','👒'],['gloves','てぶくろ','🧤'],['scarf','マフラー','🧣'],
           ['boots','ブーツ','👢'],['shirt','シャツ','👔'],['swimsuit','みずぎ','🩱']],
  sports:[['volleyball','バレーボール','🏐'],['badminton','バドミントン','🏸'],['table tennis','たっきゅう','🏓'],['swimming','すいえい','🏊'],['skiing','スキー','⛷️'],['skating','スケート','⛸️'],
          ['rugby','ラグビー','🏉'],['golf','ゴルフ','⛳'],['trumpet','トランペット','🎺'],['drum','たいこ','🥁'],['violin','バイオリン','🎻']],
  action:[['walk','あるく','🚶'],['dance','おどる','💃'],['cook','りょうりする','🍳'],['write','かく（字を）','✍️'],['draw','えを かく','🎨'],
          ['listen','きく','👂'],['drink','のむ','🥛'],['climb','のぼる','🧗'],['ride','のる','🚴'],['fly','とぶ（そらを）','🕊️'],['study','べんきょうする','📚'],['wash','あらう','🧼'],['play','あそぶ','🎮']]
};
/* v4.8：追加英語は ことばごとの イラスト（assets/images/v48/en_〇〇.webp）。
   同じ ファイル名で 上書きすれば 絵を さしかえられる */
const EN_NEW = ['badminton','ball','blueberry','boots','bored','box','bullet_train','cactus','camera','cherry','chestnut','climb','cloud','coconut','cold','cook','cup','dance','draw','dress','drink','drum','earth','excited','fine','fire','fly','foggy','gift','glasses','gloves','golf','hat','helicopter','hot','jacket','key','kickscooter','kiwi_fruit','leaf','lemon','letter','listen','mango','melon','motorcycle','mountain','mushroom','nervous','notebook','pants','peach','pear','pen','phone','pineapple','play','proud','ride','rock','rocket','rugby','ruler','scared','scarf','scissors','sea','ship','shirt','shy','sick','skating','skiing','snake','stormy','study','subway','swimming','swimsuit','table_tennis','thunder','tired','trumpet','typhoon','violin','volcano','volleyball','walk','warm','wash','write'];
EN_NEW.forEach(k => { DEFAULT_ART['en_'+k] = './assets/images/v48/en_'+k+'.webp'; });
const EN_MAP = {tomato:'veg_tomato', lion:'res_lion', tiger:'res_tiger', bear:'res_bear', panda:'res_panda', monkey:'res_macaque', pig:'res_pig', cow:'res_cow',
  horse:'res_horse', sheep:'res_sheep', mouse:'res_mouse', frog:'res_frog', penguin:'res_penguin', koala:'res_koala', giraffe:'res_giraffe', zebra:'res_zebra',
  turtle:'res_turtle', owl:'res_owl', duck:'res_duck', whale:'res_whale', dolphin:'res_dolphin', octopus:'res_octopus',
  taxi:'veh_taxi', truck:'veh_truck', 'police car':'veh_police', ambulance:'veh_ambulance', 'fire engine':'veh_fire', tractor:'veh_tractor', scooter:'en_kickscooter',
  peaches:'en_peach', cherries:'en_cherry', lemons:'en_lemon', pineapples:'en_pineapple', melons:'en_melon', mangoes:'en_mango', lions:'res_lion', pandas:'res_panda',
  monkeys:'res_macaque', penguins:'res_penguin', koalas:'res_koala', giraffes:'res_giraffe', turtles:'res_turtle', dolphins:'res_dolphin', frogs:'res_frog', bears:'res_bear'};
const enKey = w => 'en_' + String(w).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
function engIll(word){
  const w = String(word).toLowerCase();
  if(EN_MAP[w] && artSrc(EN_MAP[w])) return artSrc(EN_MAP[w]);
  for(const c of [w, w.replace(/ies$/,'y'), w.replace(/es$/,''), w.replace(/s$/,'')]){ const a = artSrc(enKey(c)); if(a) return a; }
  return artSrc('ui_bulb');
}
const engImg=(src,cls='ekIll')=>`<img class="${cls}" src="${esc(src)}" alt="">`;
/* 絵の ことばと ぶつかる ものは のぞく */
Object.keys(EWE).forEach(c => { const have = new Set(Object.values(EW).filter(w => w[2]===c).map(w => w[0].toLowerCase())); EWE[c] = EWE[c].filter(w => !have.has(w[0].toLowerCase())); });
const ekEmo = (e, w, cat='food') => `<div class="ekPic">${engImg((String(e).startsWith('./')||String(e).startsWith('data:'))?e:engIll(w,cat))}${sayBtn(w)}</div>`;
function emoQ(cats){
  const pool = cats.flatMap(c => (EWE[c]||[]).map(w => ({en:w[0], ja:w[1], e:w[2], cat:c, img:engIll(w[0],c)})).concat(EWK(c).map(k => ({en:EW[k][0], ja:EW[k][1], art:k, cat:c, img:artSrc(k)}))));
  const L = cats.flatMap(c => (EWE[c]||[]).map(w => ({en:w[0], ja:w[1], e:w[2], cat:c, img:engIll(w[0],c)})));
  const w = choice(L), ens = pool.map(x => x.en), jas = pool.map(x => x.ja), t = ri(0,3);
  if(t===0) return {type:'choice', q:'この 絵は えいごで なんという？', disp:ekEmo(w.img, w.en, w.cat), ans:w.en, opts:optsFrom(w.en, ens), say:w.en, sub:'ee'+w.en, hint:`「${w.en[0]}」から はじまるよ`};
  if(t===1) return {type:'choice', q:`<b class="enW">${esc(w.en)}</b> は にほんごで？`, disp:sayBtn(w.en), ans:w.ja, opts:optsFrom(w.ja, jas), say:w.en, sub:'ej'+w.en};
  if(t===2){ const opts = optsFrom(w.en, ens), oh = {}; opts.forEach(o => { const x = pool.find(p => p.en===o); oh[o] = x ? engImg(x.img||artSrc(x.art),'ekOpt') : '';  });
    return {type:'choice', q:`<b class="enW">${esc(w.en)}</b> の 絵は どれ？`, disp:sayBtn(w.en), ans:w.en, opts, optHtml:oh, say:w.en, sub:'ep'+w.en}; }
  return {type:'choice', q:`「<b>${esc(w.ja)}</b>」は えいごで？`, disp:`<div class="ekPic">${engImg(w.img)}</div>`, ans:w.en, opts:optsFrom(w.en, ens), say:w.en, sub:'eq'+w.en};
}
const PIC_UNITS = {ek_food:['food'], ek_animal:['animal'], ek_vehicle:['vehicle'], ek_things:['things','nature'], ek_weather:['weather'], ek_feel:['feel'], ek_clothes:['clothes'], ek_sports:['sports'], ek_action:['action']};
Object.entries(PIC_UNITS).forEach(([k, cats]) => {
  const u = EKU[k]; if(!u) return; const g0 = u.gen, nNew = cats.reduce((a,c) => a + (EWE[c]||[]).length, 0), nOld = cats.reduce((a,c) => a + EWK(c).length, 0);
  const p = nNew / (nNew + nOld);
  u.gen = function(){ return Math.random() < p ? emoQ(cats) : g0.apply(this, arguments); };
});
/* リスニング：絵文字の ことばも */
if(EKU.ek_listen){ const g0 = EKU.ek_listen.gen;
  EKU.ek_listen.gen = function(){
    if(Math.random() < .55) return g0.apply(this, arguments);
    const c = choice(Object.keys(EWE)), L = EWE[c], w = choice(L), opts = optsFrom(w[0], L.map(x => x[0])), oh = {};
    opts.forEach(o => { { const z=L.find(x=>x[0]===o); oh[o]=engImg(engIll(z[0],c),'ekOpt'); } });
    return {type:'choice', q:'🔊 きこえた ことばの 絵は どれ？', disp:sayBtn(w[0]), ans:w[0], opts, optHtml:oh, say:w[0], sub:'el'+w[0], listen:1};
  };
}

/* =====================================================================
   2. ことばの 単元（EW2）：それぞれ ことばを ついか
   ===================================================================== */
const MORE = {
  family:[['parents','りょうしん'],['son','むすこ'],['daughter','むすめ'],['cousin','いとこ'],['husband','おっと'],['wife','つま'],['grandparents','そふぼ'],['twins','ふたご'],['neighbor','となりの 人'],['classmate','クラスメート'],['pet','ペット'],['best friend','いちばんの ともだち']],
  body:[['neck','くび'],['back','せなか'],['stomach','おなか'],['toe','あしの ゆび'],['elbow','ひじ'],['lip','くちびる'],['tongue','した（くちの 中）'],['cheek','ほお'],['chin','あご'],['heart','しんぞう・こころ'],['eyebrow','まゆげ'],['skin','はだ']],
  food2:[['coffee','コーヒー'],['hot dog','ホットドッグ'],['fruit','くだもの'],['meat','にく'],['fish','さかな（たべもの）'],['chicken','とりにく'],['beef','ぎゅうにく'],['pork','ぶたにく'],['breakfast','あさごはん'],['lunch','ひるごはん'],['dinner','ばんごはん'],['snack','おやつ'],['dessert','デザート'],['tofu','とうふ'],['natto','なっとう']],
  veg:[['lettuce','レタス'],['spinach','ほうれんそう'],['broccoli','ブロッコリー'],['eggplant','なす'],['radish','だいこん'],['mushroom','きのこ'],['garlic','にんにく'],['bean','まめ'],['pear','なし'],['plum','うめ・すもも'],['persimmon','かき（くだもの）'],['grapefruit','グレープフルーツ'],['avocado','アボカド']],
  animal2:[['rabbit','うさぎ'],['goat','ヤギ'],['raccoon','アライグマ'],['bat','コウモリ'],['crow','カラス'],['sparrow','スズメ'],['hamster','ハムスター'],['polar bear','ホッキョクグマ'],['cheetah','チーター'],['rhino','サイ'],['lizard','トカゲ'],['dinosaur','きょうりゅう']],
  school:[['teacher\'s room','しょくいんしつ'],['nurse\'s office','ほけんしつ'],['school bag','ランドセル'],['uniform','せいふく'],['homework','しゅくだい'],['test','テスト'],['lunch time','きゅうしょくの じかん'],['recess','やすみじかん'],['marker','マーカー'],['stapler','ホッチキス'],['chalk','チョーク'],['map','ちず'],['calendar','カレンダー'],['dictionary','じしょ']],
  subject:[['calligraphy','しょしゃ（しゅうじ）'],['history','れきし'],['geography','ちり'],['art','びじゅつ'],['programming','プログラミング'],['club activities','クラブかつどう']],
  town:[['school','がっこう'],['library','としょかん'],['shrine','じんじゃ'],['temple','おてら'],['department store','デパート'],['gas station','ガソリンスタンド'],['parking lot','ちゅうしゃじょう'],['traffic light','しんごう'],['crosswalk','おうだんほどう'],['bus stop','バスてい'],['city hall','しやくしょ'],['hotel','ホテル'],['road','みち'],['corner','まがりかど']],
  job:[['teacher','せんせい'],['bus driver','バスの うんてんしゅ'],['carpenter','だいく'],['artist','がか'],['writer','さっか'],['comedian','おわらい げいにん'],['YouTuber','ユーチューバー'],['programmer','プログラマー'],['flight attendant','きゃくしつじょうむいん'],['hairdresser','びようし'],['shopkeeper','てんいん'],['game creator','ゲームクリエイター'],['police officer','けいさつかん'],['mail carrier','ゆうびんやさん']],
  nature:[['star','ほし'],['moon','つき'],['sun','たいよう'],['wave','なみ'],['sand','すな'],['hill','おか'],['valley','たに'],['waterfall','たき'],['field','はらっぱ'],['pond','いけ'],['grass','くさ'],['desert','さばく'],['ice','こおり']],
  season:[['January','1がつ'],['August','8がつ'],['December','12がつ'],['noon','しょうご（ひる 12じ）'],['midnight','まよなか'],['weekend','しゅうまつ'],['holiday','やすみの ひ'],['summer vacation','なつやすみ'],['New Year\'s Day','がんじつ'],['month','つき（1かげつ）'],['hour','1じかん'],['minute','ふん'],['now','いま'],['every day','まいにち']],
  shape:[['cube','りっぽうたい'],['cone','えんすい'],['cylinder','えんちゅう'],['sphere','きゅう'],['pentagon','ごかくけい'],['hexagon','ろっかくけい'],['line','せん'],['dot','てん'],['arrow','やじるし'],['crescent','みかづき']],
  verb2:[['sleep','ねる'],['eat','たべる'],['read','よむ'],['sing','うたう'],['swim','およぐ'],['run','はしる'],['get up','おきる'],['brush','みがく'],['practice','れんしゅうする'],['enjoy','たのしむ'],['live','すむ'],['send','おくる']],
  adj:[['ugly','みにくい'],['rich','おかねもちの'],['poor','まずしい'],['young','わかい'],['cheap','やすい'],['expensive','（ねだんが）たかい'],['right','ただしい・みぎ'],['wrong','まちがった'],['dangerous','あぶない'],['safe','あんぜんな'],['special','とくべつな'],['great','すばらしい'],['nice','すてきな']],
  country:[['Mexico','メキシコ'],['Thailand','タイ'],['Vietnam','ベトナム'],['the Philippines','フィリピン'],['Singapore','シンガポール'],['New Zealand','ニュージーランド'],['Peru','ペルー'],['Argentina','アルゼンチン'],['Switzerland','スイス'],['Sweden','スウェーデン'],['Greece','ギリシャ'],['Turkey','トルコ'],['Indonesia','インドネシア'],['Finland','フィンランド']],
  house:[['living room','リビング'],['bedroom','しんしつ'],['toilet','トイレ'],['shower','シャワー'],['fridge','れいぞうこ'],['curtain','カーテン'],['closet','クローゼット'],['floor','ゆか'],['wall','かべ'],['ceiling','てんじょう'],['bookshelf','ほんだな'],['clock','とけい'],['fan','せんぷうき'],['vase','かびん']],
  toy:[['top','こま'],['marbles','ビー玉'],['stuffed animal','ぬいぐるみ'],['balloon','ふうせん'],['bubbles','シャボンだま'],['crayon','クレヨン'],['origami','おりがみ'],['cards','トランプ'],['swing','ブランコ'],['slide','すべりだい'],['seesaw','シーソー'],['sandbox','すなば'],['skateboard','スケートボード'],['video game','テレビゲーム']],
  animal3:[['mosquito','カ'],['fly','ハエ'],['cicada','セミ'],['firefly','ホタル'],['worm','ミミズ'],['caterpillar','いもむし'],['shrimp','エビ'],['squid','イカ'],['goldfish','きんぎょ'],['otter','カワウソ'],['sloth','ナマケモノ'],['flamingo','フラミンゴ'],['peacock','クジャク'],['ostrich','ダチョウ']],
  food3:[['curry and rice','カレーライス'],['fried rice','チャーハン'],['rice cake','おもち'],['miso soup','みそしる'],['tempura','てんぷら'],['grilled fish','やきざかな'],['dumplings','ぎょうざ'],['ramen','ラーメン'],['udon','うどん'],['hamburger steak','ハンバーグ'],['gratin','グラタン'],['shaved ice','かきごおり'],['jelly','ゼリー'],['potato chips','ポテトチップス']],
  verb3:[['buy','かう'],['sell','うる'],['find','みつける'],['lose','なくす'],['forget','わすれる'],['remember','おぼえている'],['choose','えらぶ'],['try','ためす'],['hurry','いそぐ'],['help','てつだう'],['borrow','かりる'],['lend','かす'],['arrive','つく（とうちゃく）'],['leave','でかける・はなれる']],
  adj2:[['angry','おこった'],['lucky','うんが いい'],['careful','ちゅういぶかい'],['gentle','やさしい（おだやかな）'],['brave','ゆうかんな'],['smart','かしこい'],['lazy','なまけた'],['honest','しょうじきな'],['healthy','けんこうな'],['empty','からっぽの'],['round','まるい'],['heavy','おもい'],['cute','かわいい'],['colorful','カラフルな']],
  ordinal:[['thirteenth','13ばんめ'],['fourteenth','14ばんめ'],['fifteenth','15ばんめ'],['twentieth','20ばんめ'],['twenty-first','21ばんめ'],['thirtieth','30ばんめ'],['last','さいご'],['next','つぎ']],
  place2:[['palace','きゅうでん'],['harbor','みなと'],['tunnel','トンネル'],['lighthouse','とうだい'],['island','しま'],['campsite','キャンプじょう'],['hot spring','おんせん'],['ski resort','スキーじょう'],['gym','たいいくかん'],['market','いちば'],['zoo','どうぶつえん'],['planetarium','プラネタリウム'],['bakery','パンや'],['bank','ぎんこう']]
};
Object.entries(MORE).forEach(([c, L]) => { if(EW2[c]) addUniq(EW2[c], L); });

/* =====================================================================
   3. あいさつ・かいわ・はんたいことば・しつもん・前置詞・文
   ===================================================================== */
addUniq(GREET, [
  ['Good afternoon.','こんにちは（ごご）'],['See you.','またね'],['See you later.','また あとでね'],['Welcome.','ようこそ・いらっしゃい'],['Congratulations!','おめでとう！'],
  ['Happy birthday!','おたんじょうび おめでとう！'],['Happy New Year!','あけまして おめでとう！'],['Merry Christmas!','メリークリスマス！'],['Take care.','気を つけてね'],['Good luck!','がんばってね！'],
  ['That was delicious.','おいしかったです'],['Here you are.','はい、どうぞ（わたす とき）'],['Are you OK?','だいじょうぶ？'],
  ['Me too.','わたしも'],['Nice job!','よく できたね！'],['Of course.','もちろん'],['Just a moment.','ちょっと まってね'],['I\'m home.','ただいま'],['Welcome home.','おかえりなさい']
]);
addUniq(TALKS, [
  ['Where do you live?','I live in Kyoto.'],['What fruit do you like?','I like peaches.'],['What animal do you like?','I like pandas.'],['What do you want to be?','I want to be a pilot.'],
  ['How many pencils do you have?','I have five pencils.'],['What\'s your favorite subject?','My favorite subject is P.E.'],['How much is this cap?','It\'s 500 yen.'],
  ['What did you do last Sunday?','I went to the zoo.'],['Where do you want to go?','I want to go to Italy.'],['Who is your hero?','My hero is my father.'],
  ['What time do you get up?','I get up at six thirty.'],['How do you go to school?','I walk to school.'],['What do you have on Monday?','I have math and music.'],
  ['What would you like?','I\'d like spaghetti, please.'],['Which season do you like?','I like winter.'],['How was your summer vacation?','It was great.'],
  ['Who is that girl?','She is my sister, Hana.'],['Whose bag is this?','It\'s Ken\'s bag.'],['Where is the station?','Go straight. It\'s on your right.'],['Can I have some water?','Sure. Here you are.']
], x => x[0]);
addUniq(OPP, [['tall','short'],['young','old'],['heavy','light'],['strong','weak'],['rich','poor'],['wet','dry'],['clean','dirty'],['full','empty'],['sweet','bitter'],
  ['hard','soft'],['quiet','noisy'],['light','dark'],['start','finish'],['give','take'],['push','pull'],['win','lose'],['inside','outside'],['before','after'],['same','different'],['cheap','expensive']], x => x.join('-'));
addUniq(WHQ, [
  ['___ is my pencil? — It\'s on the desk.','Where'],['___ is that man? — He is my uncle.','Who'],['___ do you get up? — At seven.','What time'],['___ brothers do you have? — I have two.','How many'],
  ['___ is this cake? — It\'s 300 yen.','How much'],['___ do you go to school? — By bus.','How'],['___ is the summer festival? — It\'s in August.','When'],['___ do you like, rice or bread?','Which'],
  ['___ do you study English? — Because I want to go to America.','Why'],['___ food do you like?','What'],['___ do you play soccer? — In the park.','Where'],['___ is your favorite singer?','Who'],
  ['___ is the weather today? — It\'s cloudy.','How'],['___ dogs do you see? — I see three dogs.','How many'],['___ color is your bag? — It\'s red.','What'],['___ is Children\'s Day? — It\'s May 5th.','When']
], x => x[0]);
addUniq(PREP, [
  ['The book is ___ the bag.（かばんの 中）','in'],['The cup is ___ the table.（テーブルの 上）','on'],['The cat is sleeping ___ the bed.（ベッドの 下）','under'],['My house is ___ the station.（えきの そば）','by'],
  ['I get up ___ 6:30.（6時半に）','at'],['We have a festival ___ summer.（なつに）','in'],['I have piano lessons ___ Friday.（金曜日に）','on'],['This letter is ___ my grandma.（おばあちゃんから）','from'],
  ['I made a cake ___ my mother.（おかあさんの ために）','for'],['I eat curry ___ a spoon.（スプーンで）','with'],['The ball is ___ the box.（はこの 上）','on'],['I was born ___ 2016.（2016年に）','in'],
  ['Let\'s meet ___ noon.（おひるに）','at'],['The bird is ___ the cage.（とりかごの 中）','in']
], x => x[0]);
addUniq(SENT, [
  ['I ___ TV after dinner.（テレビを みる）','watch',['watch','eat','go','read']],['I ___ a bath at eight.（おふろに 入る）','take',['take','make','eat','play']],
  ['I ___ my teeth.（はを みがく）','brush',['brush','wash','clean','cut']],['She ___ English well.（えいごを じょうずに はなす）','speaks',['speaks','speak','speaking','spoke']],
  ['We ___ in the pool.（プールで およぐ）','swim',['swim','swims','run','sing']],['I ___ my grandmother last week.（せんしゅう たずねた）','visited',['visited','visit','visits','visiting']],
  ['I ___ a nice cap.（すてきな ぼうしを もっている）','have',['have','has','am','is']],['He ___ a cat.（ねこを かっている）','has',['has','have','is','are']],
  ['___ is my mother.（こちらは わたしの おかあさん）','This',['This','He','I','You']],['I ___ to be a teacher.（せんせいに なりたい）','want',['want','wants','like','go']],
  ['It is ___ today.（きょうは あつい）','hot',['hot','big','tall','sad']],['I ___ sushi.（すしが すき）','like',['like','likes','am','go']],
  ['I can ___ the guitar.（ギターを ひける）','play',['play','plays','do','go']],['Ken ___ soccer every day.（ケンは まいにち サッカーを する）','plays',['plays','play','playing','played']],
  ['I ___ fun at the park.（こうえんで たのしんだ）','had',['had','have','has','having']],['I saw a ___ bird.（あおい とり）','blue',['blue','run','eat','happy']],
  ['We ___ to Okinawa this summer.（この なつ おきなわへ 行った）','went',['went','go','goes','going']],['___ you play tennis? — Yes, I can.','Can',['Can','Do','Are','Is']],
  ['___ is your name? — I\'m Mika.','What',['What','Who','Where','When']],['I ___ breakfast at seven.（7時に あさごはんを 食べる）','have',['have','has','am','go']]
], x => x[0]);
addUniq(COLORS, [['gray','はいいろ','#9AA0A6'],['gold','きんいろ','#D4A62A'],['silver','ぎんいろ','#C0C6CC'],['light blue','みずいろ','#8FD3FF'],['navy','こんいろ','#22337A'],['beige','ベージュ','#E8D8B8']]);

/* 文の いみ（ek_make）の かたちを ふやす */
const art = w => /^[aeiou]/i.test(w) ? 'an' : 'a';
SENT_T.push(
  () => { const L = EW2.job.filter(x => !/\s/.test(x[0]) || x[0]==='police officer'), w = choice(L); return {en:`I want to be ${art(w[0])} ${w[0]}.`, jp:`わたしは ${w[1]}に なりたいです。`, pool:L.map(x => `I want to be ${art(x[0])} ${x[0]}.`)}; },
  () => { const L = EW2.country, w = choice(L); return {en:`I want to go to ${w[0]}.`, jp:`わたしは ${w[1]}に 行きたいです。`, pool:L.map(x => `I want to go to ${x[0]}.`)}; },
  () => { const L = EW2.season.filter(x => /^(spring|summer|fall|winter)$/.test(x[0])), w = choice(L); return {en:`I like ${w[0]}.`, jp:`わたしは ${w[1]}が すきです。`, pool:['spring','summer','fall','winter'].map(x => `I like ${x}.`)}; },
  () => { const D = DAYS, w = choice(D); return {en:`I play soccer on ${w[0]}.`, jp:`わたしは ${w[1]}に サッカーを します。`, pool:D.map(x => `I play soccer on ${x[0]}.`)}; },
  () => { const L = [['went to the sea','うみに 行きました'],['ate shaved ice','かきごおりを 食べました'],['saw fireworks','はなびを 見ました'],['enjoyed camping','キャンプを たのしみました'],['went to the mountains','やまに 行きました'],['enjoyed swimming','すいえいを たのしみました']], w = choice(L);
    return {en:`I ${w[0]}.`, jp:`わたしは ${w[1]}。`, pool:L.map(x => `I ${x[0]}.`)}; },
  () => { const L = EW2.town.filter(x => !/s$/.test(x[0])), w = choice(L), d = choice([['Go straight.','まっすぐ 行ってください。'],['Turn right.','みぎに まがってください。'],['Turn left.','ひだりに まがってください。']]);
    return {en:`Where is the ${w[0]}? — ${d[0]}`, jp:`${w[1]}は どこですか？ — ${d[1]}`, pool:L.map(x => `Where is the ${x[0]}? — ${d[0]}`).concat(['Go straight.','Turn right.','Turn left.'].map(x => `Where is the ${w[0]}? — ${x}`))}; }
);

/* =====================================================================
   4. ABC・かず・ようびの 単元に 問題の かたちを ふやす
   ===================================================================== */
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', a = A.toLowerCase();
const wrapGen = (k, p, extra) => { const u = EKU[k]; if(!u) return; const g0 = u.gen; u.gen = function(){ return Math.random() < p ? extra() : g0.apply(this, arguments); }; };
wrapGen('ek_abc', .5, () => { const i = ri(1,24), t = ri(0,3);
  if(t===0){ const c = a[i]; return {type:'choice', q:`小文字 <b class="enW">${c}</b> の 大文字は？`, ans:c.toUpperCase(), opts:optsFrom(c.toUpperCase(), A.split('')), sub:'up'+c, say:c}; }
  if(t===1) return {type:'choice', q:`<b class="enW">？ ${A[i]} ${A[i+1]}</b>\u3000？に 入る 文字は？`, ans:A[i-1], opts:optsFrom(A[i-1], A.split('')), sub:'pv'+A[i], say:`${A[i-1]}, ${A[i]}, ${A[i+1]}`};
  if(t===2) return {type:'choice', q:`<b class="enW">${A[i-1]} ？ ${A[i+1]}</b>\u3000？に 入る 文字は？`, ans:A[i], opts:optsFrom(A[i], A.split('')), sub:'md'+A[i], say:`${A[i-1]}, ${A[i]}, ${A[i+1]}`};
  const c = A[ri(0,25)]; return {type:'choice', q:'🔊 きこえた アルファベットは どれ？', disp:sayBtn(c), ans:c, opts:optsFrom(c, A.split('')), sub:'al'+c, say:c, listen:1};
});
const CNT = [['🍎','apples'],['🐶','dogs'],['🌸','flowers'],['🚗','cars'],['⭐','stars'],['🐟','fish'],['🎈','balloons'],['📚','books'],['🍬','candies'],['🐱','cats']];
wrapGen('ek_num', .5, () => { const n = ri(2,10), o = choice(CNT), t = ri(0,2);
  if(t===0){ const s = `${NUMW[n]} ${o[1]}`; return {type:'choice', q:`<b class="enW">How many ${o[1]}?</b><br>かずを かぞえて えいごで こたえよう`, disp:`<div class="numDots">${o[0].repeat(n)}</div>`, ans:NUMW[n], opts:optsFrom(NUMW[n], NUMW.slice(1,11)), say:`How many ${o[1]}? ${s}.`, sub:'hm'+n+o[1]}; }
  if(t===1){ const x = ri(1,5), y = ri(1, 10-x); return {type:'choice', q:`<b class="enW">${NUMW[x]} + ${NUMW[y]} = ？</b>`, ans:NUMW[x+y], opts:optsFrom(NUMW[x+y], NUMW.slice(1,11)), say:`${NUMW[x]} plus ${NUMW[y]}`, sub:'pl'+x+'_'+y}; }
  return {type:'choice', q:'🔊 きこえた かずは いくつ？', disp:sayBtn(NUMW[n]), ans:String(n), opts:optsFrom(String(n), [...Array(10)].map((_,i)=>String(i+1))), say:NUMW[n], sub:'ln'+n, listen:1};
});
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const numW = n => n <= 20 ? NUMW[n] : n === 100 ? 'one hundred' : TENS[Math.floor(n/10)] + (n%10 ? '-' + NUMW[n%10] : '');
wrapGen('ek_num2', .5, () => { const n = ri(21,99), t = ri(0,2), near = () => { const s = new Set([n]); while(s.size < 12){ s.add(clamp(n + ri(-12,12), 21, 99)); } return [...s]; };
  if(t===0) return {type:'choice', q:`かずの <b>${n}</b> は えいごで？`, ans:numW(n), opts:optsFrom(numW(n), near().map(numW)), say:numW(n), sub:'nw'+n};
  if(t===1) return {type:'choice', q:`<b class="enW">${numW(n)}</b> は いくつ？`, disp:sayBtn(numW(n)), ans:String(n), opts:optsFrom(String(n), near().map(String)), say:numW(n), sub:'wn'+n};
  return {type:'choice', q:'🔊 きこえた かずは いくつ？', disp:sayBtn(numW(n)), ans:String(n), opts:optsFrom(String(n), near().map(String)), say:numW(n), sub:'nl'+n, listen:1};
});
wrapGen('ek_week', .45, () => { const t = ri(0,3);
  if(t===0){ const i = ri(0,6), nx = DAYS[(i+1)%7][0]; return {type:'choice', q:`<b class="enW">${DAYS[i][0]}</b> の つぎの ようびは？`, ans:nx, opts:optsFrom(nx, DAYS.map(x=>x[0])), say:`${DAYS[i][0]}, ${nx}`, sub:'dn'+i}; }
  if(t===1){ const i = ri(0,11), nx = MONTHS[(i+1)%12]; return {type:'choice', q:`<b class="enW">${MONTHS[i]}</b> の つぎの つきは？`, ans:nx, opts:optsFrom(nx, MONTHS), say:`${MONTHS[i]}, ${nx}`, sub:'mn'+i}; }
  if(t===2){ const i = ri(0,11); return {type:'choice', q:`<b class="enW">${MONTHS[i]}</b> は なんがつ？`, disp:sayBtn(MONTHS[i]), ans:`${i+1}がつ`, opts:optsFrom(`${i+1}がつ`, MONTHS.map((_,j) => `${j+1}がつ`)), say:MONTHS[i], sub:'mj'+i}; }
  const E = [['Children\'s Day','May'],['Christmas','December'],['New Year\'s Day','January'],['Star Festival（たなばた）','July'],['Halloween','October'],['Doll\'s Festival（ひなまつり）','March']], e = choice(E);
  return {type:'choice', q:`<b class="enW">${esc(e[0])}</b> は なんの つき？`, ans:e[1], opts:optsFrom(e[1], MONTHS), say:e[1], sub:'ev'+e[1]};
});
wrapGen('ek_sentence', .45, () => { const t = ri(0,2);
  if(t===0){ const L = [['🍑','peaches'],['🍒','cherries'],['🍋','lemons'],['🍍','pineapples'],['🍈','melons'],['🥭','mangoes'],['🦁','lions'],['🐼','pandas'],['🐵','monkeys'],['🐧','penguins'],['🐨','koalas'],['🦒','giraffes'],['🐢','turtles'],['🐬','dolphins'],['🐸','frogs'],['🐻','bears']], w = choice(L), s = `I like ${w[1]}.`;
    return {type:'choice', q:'絵に あう 文は どれ？', disp:ekEmo(engIll(w[1]), s), ans:s, opts:optsFrom(s, L.map(x => `I like ${x[1]}.`)), say:s, sub:'sl'+w[1]}; }
  if(t===1){ const L = EWE.action, w = choice(L), s = `I can ${w[0]}.`; return {type:'choice', q:'絵に あう 文は どれ？', disp:ekEmo(engIll(w[0],'action'), s), ans:s, opts:optsFrom(s, L.map(x => `I can ${x[0]}.`)), say:s, sub:'sc'+w[0]}; }
  const L = EWE.feel, w = choice(L), s = `I'm ${w[0]}.`; return {type:'choice', q:'絵に あう 文は どれ？', disp:ekEmo(engIll(w[0],'feel'), s), ans:s, opts:optsFrom(s, L.map(x => `I'm ${x[0]}.`)), say:s, sub:'sf'+w[0]};
});
/* いろ：まぜた いろ・もの の いろ */
wrapGen('ek_color', .35, () => { const O = [['banana','yellow'],['strawberry','red'],['frog','green'],['cloud','white'],['chestnut','brown'],['grapes','purple'],['sea','blue'],['orange','orange'],['peach','pink']], o = choice(O);
  return {type:'choice', q:`<b class="enW">What color is it?</b><br>この ものの いろは？`, disp:`<div class="ekPic">${engImg(engIll(o[0]))}</div>`, ans:o[1], opts:optsFrom(o[1], COLORS.slice(0,10).map(x=>x[0])), say:`It's ${o[1]}.`, sub:'oc'+o[0]}; });

/* ---------- ふえた 問題の かず（めやす） ---------- */
window.ENG_MORE_COUNT = Object.values(EWE).reduce((n,L) => n + L.length*4, 0) + Object.values(MORE).reduce((n,L) => n + L.length*4, 0);
})();
