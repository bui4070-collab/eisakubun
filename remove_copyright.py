#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
remove_copyright.py ― まなびタウン：著作権のある 曲（lulu.・共犯）を ぜんぶ けす
つかいかた（公開するまえに 1回）:
    python remove_copyright.py            （この ファイルと おなじ フォルダの js/features.js を なおす）
    python remove_copyright.py path/to/js/features.js
やること:
  1) features.js の「★★★ [著作権あり …] ～ ★END」の ブロックを けす
  2) そのほかの つなぎの コード（[CR] の はいっていた ところ）を もとに もどす
  3) assets/audio/music/cr_lulu_chorus.mp3・cr_kyohan_chorus.mp3 を けす（あれば）
※ もとの features.js は features.js.bak に のこります。
※ トルコ行進曲・サビの きらきら えんしゅつ・ものがたりの おんがく（ぜんぶ オリジナル）は そのまま のこります。
"""
import sys, os, shutil, json
PAIRS = json.loads('[["const songOpen = s => { const L = SONGS.filter(x => x.d === s.d), i = L.indexOf(s);", "const songOpen = s => { if(s.free) return true; const L = SONGS.filter(x => x.d === s.d), i = L.indexOf(s);"], ["function bgStopAll(){ BGS.forEach(s => { try{ s.stop(); }catch(e){} }); BGS.clear(); }", "function bgStopAll(){ BGS.forEach(s => { try{ s.stop(); }catch(e){} }); BGS.clear(); try{ crAuStop(); }catch(e){} }     // [CR]"], ["  bgSchedule();\\n  if(G.clock < 0 && beat > G.tick", "  bgSchedule(); try{ crAuTick(); }catch(e){}     // [CR]\\n  if(G.clock < 0 && beat > G.tick"], ["function rgFinish(){\\n  cancelAnimationFrame(RAF); allOff(); const s = SONGS.find(x => x.id === G.id), N = G.notes.length; G.over = true; G.score = Math.round(G.score);", "function rgFinish(){\\n  cancelAnimationFrame(RAF); allOff(); try{ crAuStop(0.5); }catch(e){}     // [CR]\\n  const s = SONGS.find(x => x.id === G.id), N = G.notes.length; G.over = true; G.score = Math.round(G.score);"], ["  bgStopAll(); bgPreload(); G.bg = [-4, -3, -2, -1]", "  bgStopAll(); try{ crAuInit(s, o); }catch(e){}     // [CR]\\n  bgPreload(); G.bg = [-4, -3, -2, -1]"], ["  if(m.inst === \'pf\' && o.hd === \'lr\' && isTab() && CHORDS[id]){\\n    const C = CHORDS[id]", "  if(m.inst === \'pf\' && o.hd === \'lr\' && isTab() && s.lh){          // [CR] 楽譜どおりの 左手\\n    s.lh.forEach(n => G.notes.push({m:n.m, t:n.b * spb, b:n.b, dur:n.d * spb, db:n.d, j:null, el:null, lh:true}));\\n    G.notes.sort((a, b) => a.t - b.t || (a.lh ? -1 : 1)); G.lh = true;\\n  } else if(m.inst === \'pf\' && o.hd === \'lr\' && isTab() && CHORDS[id]){\\n    const C = CHORDS[id]"], ["canLH = m.inst === \'pf\' && tab && CHORDS[s.id];", "canLH = m.inst === \'pf\' && tab && (CHORDS[s.id] || s.lh);\\n  try{ crPre(s); }catch(e){}     // [CR]"], ["<div class=\\"rgbtns\\"><button class=\\"drnext white\\" data-a=\\"rgClose\\">やめる</button><button class=\\"drnext\\" data-a=\\"rgStart\\">スタート！</button></div>", "${s.au ? `<p class=\\"rgnote\\">🎵 本物の 音源つき（<b>はやさ 100%</b>の「ゲーム」「おてほん」で ながれるよ）${s.lh ? \'<br>🖐 いちばん むずかしい：iPad よこむきで「りょうて」も あそべるよ！\' : \'\'}</p>${auOffHTML(s)}` : \'\'}\\n    <div class=\\"rgbtns\\"><button class=\\"drnext white\\" data-a=\\"rgClose\\">やめる</button><button class=\\"drnext\\" data-a=\\"rgStart\\">スタート！</button></div>"]]')
BS = '/* =====================================================================================\n   \u2605\u2605\u2605 [\u8457\u4f5c\u6a29\u3042\u308a'
BE = '/* \u2605END [\u8457\u4f5c\u6a29\u3042\u308a] \u2605 */\n'
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'js', 'features.js')
s = open(path, encoding='utf-8').read()
a = s.find(BS); b = s.find(BE)
if a < 0 or b < 0:
    print('ブロックが みつかりません（もう けして あるかも）')
else:
    if a > 0 and s[a - 1] == '\n': a -= 1
    s = s[:a] + s[b + len(BE):]
n = 0
for orig, new in PAIRS[::-1]:
    if new in s: s = s.replace(new, orig); n += 1
shutil.copy(path, path + '.bak')
open(path, 'w', encoding='utf-8').write(s)
print('features.js を なおしました（つなぎ %d か所）。' % n)
base = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(path))), 'assets', 'audio', 'music')
found = False
for f in ('cr_lulu_chorus.mp3', 'cr_kyohan_chorus.mp3'):
    p = os.path.join(base, f)
    if os.path.exists(p): os.remove(p); print('音源も けしました:', p); found = True
if not found: print('音源ファイル（assets/audio/music/cr_lulu_chorus.mp3・cr_kyohan_chorus.mp3）は この フォルダには ありません。アップロード先の サーバーからも けしてください。')
