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
['special_course','まなびスペシャル','👑',4,320,{cf_beef:2,cf_chicken:2,f_pumpkin:1}],['garden_plate','ガーデンプレート','🌿',4,270,{f_tomato:2,f_carrot:2,f_corn:2}],['royal_parfait','ロイヤルパフェ','✨',4,280,{f_strawberry:2,f_banana:1,cf_milk:2}],['family_set','なかよしファミリーセット','🍽️',4,300,{cf_pork:2,cf_egg:2,f_tomato:1}],['chef_stew','シェフのとくせいシチュー','🍲',4,310,{cf_beef:2,cf_milk:1,f_carrot:2}],['rainbow_cake','にじいろケーキ','🌈',4,300,{f_strawberry:2,cf_egg:2,cf_milk:2}]
].map(([id,n,i,lv,pt,req])=>({id,n,i,lv,pt,req}));
const EVENT_MENU={halloween:{id:'ev_pumpkin',n:'ハロウィンかぼちゃパイ',i:'🎃',lv:1,pt:350,req:{f_pumpkin:3,cf_egg:1}},christmas:{id:'ev_xmas',n:'クリスマスチキン',i:'🎄',lv:1,pt:380,req:{cf_chicken:3,f_carrot:1}},newyear:{id:'ev_osechi',n:'おしょうがつプレート',i:'🎍',lv:1,pt:380,req:{cf_egg:2,cf_beef:1,f_carrot:1}},summer:{id:'ev_summer',n:'なつのフルーツパフェ',i:'🌻',lv:1,pt:350,req:{f_watermelon:2,f_strawberry:1,cf_milk:1}}};
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
function menuHTML(){const c=C(),sel=new Set(c.menu);return `<div class="cafeMenus">${cafeMenus().map(m=>`<button data-cmenu="${m.id}" class="${sel.has(m.id)?'on':''}"><i>${m.i}</i><b>${m.n}</b><small>Lv${m.lv}・${m.pt}pt</small><em>${Object.entries(m.req).map(([k,n])=>`${matName(k)}×${n}`).join('・')}</em></button>`).join('')}</div>`;}
async function cafeOpen(){const c=C();if(!c.on){const v=await dialog(`<div class="fruitBig">☕</div><h2 class="dlgT">おうちを カフェにする？</h2><p class="dlgP">「わたしの家」の 1かいを カフェとして つかえるよ。<br>家具や かべ・ゆかは そのまま のこるよ。</p>`,[{label:'☕ 500ptで カフェを はじめる',cls:'gold',v:'yes'},{label:'やめる',v:null}]);if(v==='yes'){if(save.points.bal<500)return toast('ポイントが たりないよ');givePts(-500,'おうちカフェを はじめた');c.on=true;persist();cafeOpen();}return;}
 ensureCafeGuests();persist();const th=THEMES.find(x=>x[0]===c.theme)||THEMES[0];const v=await dialog(`<div class="cafeHead"><div><b>☕ おうちカフェ Lv${c.lv}</b><small>4人がけ ${c.lv}せき・さいだい ${cafeSeats()}人</small></div><strong>売上 ${nf(c.sales)}pt</strong></div>${seatsHTML()}<div class="cafeStat">🍽️ メニュー ${c.menu.length}こ　🐾 来店 ${c.served}人　🎨 ${th[1]}</div>`,[{label:'🍳 えいぎょうする',cls:'gold',v:'serve'},{label:'📖 メニューを かんがえる',cls:'white',v:'menu'},{label:'🎨 机・家具の ふんいき',cls:'white',v:'theme'},...(c.lv<4?[{label:`⬆ Lv${c.lv+1}へ（${c.lv*1200}pt）`,cls:'white',v:'up'}]:[]),{label:'とじる',v:null}],'wide cafeDlg');
 if(v==='serve')cafeServe();if(v==='menu')cafeMenu();if(v==='theme')cafeTheme();if(v==='up'){const p=c.lv*1200;if(save.points.bal<p)return toast('ポイントが たりないよ');givePts(-p,'カフェを グレードアップ');c.lv++;persist();sound('fan');cafeOpen();}}
async function cafeServe(){const c=C(),sel=cafeMenus().filter(m=>c.menu.includes(m.id)),S=allStock(),cook=sel.filter(m=>canCook(m,S));if(!cook.length){await dialog(`<h2 class="dlgT">ざいりょうが たりないよ</h2><p class="dlgP">畑で やさい・くだものを、牧場で ミルク・たまご・おにくを あつめよう！</p>${menuHTML()}`,[], 'wide');return;}
 ensureCafeGuests();let sales=0,served=0,used=[];for(const g of c.guests){const avail=sel.filter(m=>canCook(m));if(!avail.length)break;const m=choice(avail);useMat(m);sales+=m.pt;served++;used.push(m.i+esc(m.n));}
 if(!served)return toast('つくれる メニューが ないよ');const rate=1+(c.lv-1)*.1,s=Math.round(sales*rate);givePts(s,'おうちカフェの うりあげ');c.sales+=s;c.served+=served;c.last=Date.now();c.guests=[];persist();sound('fan');confetti(1200);await dialog(`<h2 class="dlgT">☕ えいぎょう だいせいこう！</h2><p class="dlgP">${served}人の おきゃくさんが 食べてくれたよ！<br><b>売上 ${s}pt</b></p><div class="usedMenu">${used.join('　')}</div>`,[{label:'やったー！',cls:'gold',v:1}],'gold');cafeOpen();}
async function cafeMenu(){const c=C(),v=await pickCafe(menuHTML()+`<p class="dlgP facNote">えらべるのは 6こまで。カフェLvで あたらしい メニューが かいほう！<br>イベント中は とくべつメニューも ならぶよ。</p>`);if(v)cafeMenu();}
function pickCafe(html){return new Promise(res=>{dialog(html,[{label:'できあがり',cls:'gold',v:null}],'wide').then(()=>res(null));$('#dlgBody').onclick=e=>{const b=e.target.closest('[data-cmenu]');if(!b)return;const c=C(),id=b.dataset.cmenu,i=c.menu.indexOf(id);if(i>=0)c.menu.splice(i,1);else if(c.menu.length<6)c.menu.push(id);else return toast('メニューは 6こまでだよ');persist();$('#dlg').classList.remove('show');res(id);};});}
async function cafeTheme(){const c=C(),v=await dialog(`<h2 class="dlgT">🎨 机の柄・家具の ふんいき</h2><div class="themeGrid">${THEMES.map(x=>`<button data-theme="${x[0]}" style="--a:${x[2]};--b:${x[3]}"><i></i><b>${x[1]}</b></button>`).join('')}</div><p class="dlgP">席の ばしょは きまっているけれど、机の柄と 家具の ふんいきを かえられるよ。</p>`,[{label:'とじる',v:null}],'wide');}
document.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(!b)return;e.stopImmediatePropagation();C().theme=b.dataset.theme;persist();$('#dlg').classList.remove('show');cafeOpen();},true);
document.addEventListener('click',async e=>{const b=e.target.closest('[data-cg]');if(!b)return;e.stopImmediatePropagation();const c=C(),g=c.guests.find(x=>x.id===b.dataset.cg);if(!g)return;g.talk++;const o=guestObj(g);persOf(o);await dialog(`<div class="dlgArt big">${resPic(o)}</div><h2 class="dlgT">${esc(g.name)}（${esc(SP(g.sp).name)}）</h2><div class="talkBubble"><b>${esc(g.name)}</b>${esc(speak(o,g.talk>=3?'この カフェ だいすき！ また 来たいな！':'とっても おいしそう！ おすすめは なあに？'))}</div><p class="dlgP">なかよし度 ${'💗'.repeat(Math.min(3,g.talk))}${'♡'.repeat(Math.max(0,3-g.talk))}</p>`,[{label:'また おはなししよう',cls:'gold',v:1}]);if(g.talk===3){save.fac=save.fac||{};save.fac.pals=save.fac.pals||{};save.fac.pals[g.sp]=(save.fac.pals[g.sp]||0)+1;toast('💞 レターを つかったとき 来やすくなった！');}persist();},true);
/* わたしの家にカフェボタン */
const _renderMyHome46=renderMyHome;renderMyHome=function(){const o=_renderMyHome46.apply(this,arguments);let b=$('#btnCafe46');if(!b){$('#btnHomeEdit').insertAdjacentHTML('afterend','<button class="btn orange" id="btnCafe46">☕ おうちカフェ</button>');b=$('#btnCafe46');b.onclick=cafeOpen;}b.textContent=C().on?`☕ おうちカフェ Lv${C().lv}`:'☕ おうちを カフェにする';return o;};
})();
