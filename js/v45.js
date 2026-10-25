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
function towerRewardHTML(f){ if(f===100) return '👑 天空の おうかん・きらきらレター×5・ランクアップの本×3・能力の実 全5しゅるい×3'; if(f%25===0) return '✨ 能力の実 全5しゅるい×1・きらきらレター×1'; if(f%10===0) return '🌱 能力の実×2・ポイント'; if(f%5===0) return '🪙 ポイント'; return ''; }
function towerGive(f){ const T=towerData(); if(f!==100 && f%5!==0) return ''; if(towerRewarded(T,f)) return ''; T.rewards.push(f); const t=save.town; let msg='';
  if(f===100){ const H=ensureHome(); H.inv[CROWN]=(H.inv[CROWN]||0)+1; t.bag.goldletter=(t.bag.goldletter||0)+5; t.bag.rankbook=(t.bag.rankbook||0)+3; Object.keys(FRUITS).forEach(k=>fruitBag()[k]+=3); msg='天空の おうかん、きらきらレター×5、ランクアップの本×3、能力の実 全しゅるい×3'; }
  else if(f%25===0){ Object.keys(FRUITS).forEach(k=>fruitBag()[k]++); t.bag.goldletter=(t.bag.goldletter||0)+1; msg='能力の実 全しゅるい×1、きらきらレター×1'; }
  else if(f%10===0){ fruitBag()[randomFruit()]+=2; addPoints(50+f*2,`タワー ${f}かい とうたつ`,true); msg=`能力の実×2、${50+f*2}pt`; }
  else if(f%5===0){ addPoints(20+f,`タワー ${f}かい とうたつ`,true); msg=`${20+f}pt`; }
  persist(); return msg;
}
function towerView(){ const T=towerData(), f=Math.min(100,T.floor), pct=Math.max(1,(f-1)/99*100); return `<div class="towerHero"><img src="${esc(artSrc('bld_office'))}" alt=""><div><h2>🏙️ 100かい タワー</h2><b>${T.done?'100かい せいは！':`${f}かいから`}</b><small>さいこう：${T.best}かい</small></div></div><div class="towerMeter"><i style="height:${pct}%"></i><em style="bottom:calc(${pct}% - 13px)">🚪 ${T.done?'GOAL':f+'F'}</em></div><div class="towerMarks"><span>100F 👑</span><span>75F ✨</span><span>50F ✨</span><span>25F ✨</span><span>1F</span></div><p class="dlgP towerNote">1問 れんぞくせいかいするたび 1かい 上へ！<br>まちがえると そのかいで ストップ。つぎは 同じかいから ちょうせんできるよ。<br>5かいごとに ごほうびが あるよ。</p>`; }
async function towerLobby(key){ if(townLevel()<8){ await dialog(`<div class="dlgArt">${picHTML(ITEM('office'))}</div><h2 class="dlgT">🔒 タワーは まちLv8から</h2><p class="dlgP">まちを もっと 大きくすると シマくんが おしえてくれるよ！</p>`); return; }
  const T=towerData(); const main=T.done?[{label:'👑 ごほうびを みる',cls:'gold',v:'reward'}]:[{label:`🚪 ${T.floor}かいから のぼる`,cls:'gold',v:'start'}]; const v=await dialog(towerView(),main.concat(key?[{label:'⬆ ビルを グレードアップ',cls:'white',v:'grade'}]:[]).concat([{label:'とじる',v:null}]),'wide towerDlg');
  if(v==='start') towerRun(); if(v==='grade') openBuilding(key); if(v==='reward') dialog(`<div class="fruitBig">👑</div><h2 class="dlgT">天空の おうかん</h2><p class="dlgP">100かいを せいはした あかし！<br>わたしの家に かざれる、とても きちょうな アイテムだよ。</p>`);
}
async function towerAsk(m,f){ const ans=m.ansF||m.ans; const v=await dialog(`<div class="towerFloor"><b>${f}F</b><span>れんぞくせいかいで 上へ！</span></div>${m.html}${m.say?sayBtn(m.say):''}`,m.opts.map(o=>({label:esc(o),cls:'white big',v:o})).concat([{label:'ここで やめる',cls:'white',v:'__quit'}]),'wide quiz towerQuiz'); if(v==='__quit'||v==null) return 'quit'; const ok=v===ans; sound(ok?'ok':'ng'); if(m.wk&&ok)delWeak(m.wk); if(m.kq)addStat(m.kq,'read',ok,1); persist(); return ok; }
async function towerRun(){ const T=towerData(); while(!T.done){ const f=T.floor, m=makeMQ({weakOnly:f>80&&Math.random()<.35}); const r=await towerAsk(m,f); if(r==='quit'){ toast(`🏙️ ${f}かいで きろくを ほぞんしたよ`); return towerLobby(); }
    if(!r){ await dialog(`<h2 class="dlgT">おしい！ ${f}かいで ストップ</h2><p class="dlgP">こたえは <b>${esc(m.ansF||m.ans)}</b> だったよ。<br>つぎも ${f}かいから はじめられるよ！</p>`,[{label:'また ちょうせん！',cls:'gold',v:1}]); return towerLobby(); }
    T.best=Math.max(T.best,f); const rw=towerGive(f); if(f>=100){ T.done=true; T.floor=100; persist(); sound('fan'); confetti(3500); await dialog(`<div class="fruitBig">👑</div><h2 class="dlgT">100かい せいは！</h2><p class="dlgP">すごい！ タワーの てっぺんに とうちゃく！</p><div class="skillBox"><b>とくべつな ごほうび</b><br>${towerRewardHTML(100)}</div>`,[{label:'うけとる！',cls:'gold',v:1}],'gold'); renderCurrent(); return; }
    T.floor=f+1; persist(); if(rw){ sound('fan'); confetti(1000); const nx=await dialog(`<h2 class="dlgT">🎉 ${f}かい とうたつ！</h2><p class="dlgP">${rw}を てにいれた！<br>つぎは ${T.floor}かい！</p>`,[{label:'つぎへ',cls:'gold',v:1},{label:'ここで やめる',cls:'white',v:'quit'}]); if(nx==='quit'){ toast(`🏙️ ${T.floor}かいで きろくを ほぞんしたよ`); return towerLobby(); } }
  } }
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
