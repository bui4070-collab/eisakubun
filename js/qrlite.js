/* =====================================================================
   まなびタウン v29.0：QRコード（つくる・よむ） 小さな 自前ライブラリ（外部ファイル なし）
   ・つくる：QRLite.encode(text, 'M', 最小型番)   → {size, get(x,y)}   ※ 型番1〜10・バイトモード
   ・よむ  ：QRLite.decode(imageData)   → 文字列 または null  ※ ImageData（RGBA）をわたす
   ・かく  ：QRLite.draw(canvas, text, {px, quiet})
   ===================================================================== */
(function(root){
'use strict';

/* ---------- GF(256) ---------- */
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(function(){ let x = 1; for(let i = 0; i < 255; i++){ EXP[i] = x; LOG[x] = i; x <<= 1; if(x & 0x100) x ^= 0x11d; } for(let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
const inv = a => EXP[255 - LOG[a]];

function rsGen(n){
  let g = [1];
  for(let i = 0; i < n; i++){
    const ng = new Array(g.length + 1).fill(0);
    for(let j = 0; j < g.length; j++){ ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); }
    g = ng;
  }
  return g;   // 先頭が 最高次
}
function rsEncode(data, n){
  const g = rsGen(n), r = new Array(n).fill(0);
  for(const d of data){
    const f = d ^ r[0]; r.shift(); r.push(0);
    if(f) for(let i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f);
  }
  return r;
}

/* ---------- 規格の 表（型番1〜10） ---------- */
/* [ブロック数, 全体, データ, (ブロック数, 全体, データ)] ／ 順番：L, M, Q, H */
const RS_TABLE = {
  1:[[1,26,19],[1,26,16],[1,26,13],[1,26,9]], 2:[[1,44,34],[1,44,28],[1,44,22],[1,44,16]],
  3:[[1,70,55],[1,70,44],[2,35,17],[2,35,13]], 4:[[1,100,80],[2,50,32],[2,50,24],[4,25,9]],
  5:[[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12]], 6:[[2,86,68],[4,43,27],[4,43,19],[4,43,15]],
  7:[[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14]], 8:[[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15]],
  9:[[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13]], 10:[[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16]]
};
const ALIGN = {1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
const LV = {L:0, M:1, Q:2, H:3};
const LV_BITS = [1, 0, 3, 2];   // L=01, M=00, Q=11, H=10

function blocksOf(ver, lv){
  const a = RS_TABLE[ver][lv], out = [];
  for(let i = 0; i < a.length; i += 3) for(let j = 0; j < a[i]; j++) out.push({total:a[i + 1], data:a[i + 2]});
  return out;
}
const dataCap = (ver, lv) => blocksOf(ver, lv).reduce((s, b) => s + b.data, 0);

/* ---------- 形式情報・型番情報（BCH） ---------- */
function bchFormat(v){ let d = v << 10; for(let i = 14; i >= 10; i--) if(d >> i & 1) d ^= 0x537 << (i - 10); return ((v << 10) | d) ^ 0x5412; }
function bchVersion(v){ let d = v << 12; for(let i = 17; i >= 12; i--) if(d >> i & 1) d ^= 0x1f25 << (i - 12); return (v << 12) | d; }

/* ---------- 機能パターンの マスク ---------- */
function funcMask(ver){
  const n = 17 + 4 * ver, m = new Uint8Array(n * n);
  const set = (x, y) => { if(x >= 0 && y >= 0 && x < n && y < n) m[y * n + x] = 1; };
  for(let y = -1; y <= 7; y++) for(let x = -1; x <= 7; x++){ set(x, y); set(n - 1 - x, y); set(x, n - 1 - y); }   // ファインダー＋すきま
  for(let i = 0; i < n; i++){ set(i, 6); set(6, i); }                                                            // タイミング
  const p = ALIGN[ver];
  for(let a = 0; a < p.length; a++) for(let b = 0; b < p.length; b++){
    if((a === 0 && b === 0) || (a === 0 && b === p.length - 1) || (a === p.length - 1 && b === 0)) continue;
    for(let dy = -2; dy <= 2; dy++) for(let dx = -2; dx <= 2; dx++) set(p[a] + dx, p[b] + dy);
  }
  for(let i = 0; i < 9; i++){ set(i, 8); set(8, i); }                                                            // 形式情報
  for(let i = 0; i < 8; i++){ set(n - 1 - i, 8); set(8, n - 1 - i); }
  if(ver >= 7) for(let i = 0; i < 6; i++) for(let j = 0; j < 3; j++){ set(n - 11 + j, i); set(i, n - 11 + j); }  // 型番情報
  return m;
}
const MASKS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (((y >> 1) + Math.floor(x / 3)) % 2) === 0, (x, y) => ((x * y) % 2 + (x * y) % 3) === 0,
  (x, y) => (((x * y) % 2 + (x * y) % 3) % 2) === 0, (x, y) => (((x + y) % 2 + (x * y) % 3) % 2) === 0
];

/* ====================================================================
   つくる
   ==================================================================== */
function utf8(s){ return Array.from(new TextEncoder().encode(String(s))); }

function encode(text, level, minVer){
  const lv = LV[level || 'M'] ?? 1, bytes = utf8(text);
  let ver = 0;
  for(let v = Math.max(1, minVer | 0); v <= 10; v++){ const cc = v < 10 ? 8 : 16; if(4 + cc + bytes.length * 8 <= dataCap(v, lv) * 8){ ver = v; break; } }
  if(!ver) throw new Error('QR: データが 大きすぎます');
  const cap = dataCap(ver, lv), bits = [];
  const put = (val, len) => { for(let i = len - 1; i >= 0; i--) bits.push(val >> i & 1); };
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length)); while(bits.length % 8) bits.push(0);
  const cw = []; for(let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for(let p = 0; cw.length < cap; p++) cw.push(p % 2 ? 0x11 : 0xec);
  /* ブロックに わけて 誤り訂正を つける */
  const bl = blocksOf(ver, lv); let pos = 0; const dB = [], eB = [];
  bl.forEach(b => { const d = cw.slice(pos, pos + b.data); pos += b.data; dB.push(d); eB.push(rsEncode(d, b.total - b.data)); });
  const out = [], maxD = Math.max(...dB.map(a => a.length)), maxE = Math.max(...eB.map(a => a.length));
  for(let i = 0; i < maxD; i++) dB.forEach(a => { if(i < a.length) out.push(a[i]); });
  for(let i = 0; i < maxE; i++) eB.forEach(a => { if(i < a.length) out.push(a[i]); });
  /* 行列 */
  const n = 17 + 4 * ver, fm = funcMask(ver), base = new Uint8Array(n * n);
  const setB = (x, y, v) => { base[y * n + x] = v ? 1 : 0; };
  for(const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) for(let dy = -4; dy <= 4; dy++) for(let dx = -4; dx <= 4; dx++){
    const x = cx + dx, y = cy + dy; if(x < 0 || y < 0 || x >= n || y >= n) continue;
    const d = Math.max(Math.abs(dx), Math.abs(dy)); setB(x, y, d !== 4 && d !== 2);
  }
  for(let i = 8; i < n - 8; i++){ setB(i, 6, i % 2 === 0); setB(6, i, i % 2 === 0); }
  const p = ALIGN[ver];
  for(let a = 0; a < p.length; a++) for(let b = 0; b < p.length; b++){
    if((a === 0 && b === 0) || (a === 0 && b === p.length - 1) || (a === p.length - 1 && b === 0)) continue;
    for(let dy = -2; dy <= 2; dy++) for(let dx = -2; dx <= 2; dx++){ const d = Math.max(Math.abs(dx), Math.abs(dy)); setB(p[a] + dx, p[b] + dy, d !== 1); }
  }
  setB(8, n - 8, 1);   // 暗モジュール
  if(ver >= 7){ const vi = bchVersion(ver); for(let i = 0; i < 18; i++){ const b = vi >> i & 1, x = Math.floor(i / 3), y = i % 3; setB(x, n - 11 + y, b); setB(n - 11 + y, x, b); } }
  /* データを ジグザグに おく */
  const dbits = []; out.forEach(c => { for(let i = 7; i >= 0; i--) dbits.push(c >> i & 1); });
  const dm = new Uint8Array(n * n), isData = new Uint8Array(n * n); let bi = 0, up = true;
  for(let x = n - 1; x > 0; x -= 2){
    if(x === 6) x--;
    for(let k = 0; k < n; k++){
      const y = up ? n - 1 - k : k;
      for(let dx = 0; dx < 2; dx++){ const xx = x - dx, i = y * n + xx; if(fm[i] && !(xx === 8 && y === n - 8 && false)) continue; dm[i] = bi < dbits.length ? dbits[bi] : 0; isData[i] = 1; bi++; }
    }
    up = !up;
  }
  /* ふさわしい マスクを えらぶ */
  let best = null, bestS = 1e9;
  for(let mk = 0; mk < 8; mk++){
    const m = Uint8Array.from(base);
    for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){ const i = y * n + x; if(isData[i]) m[i] = dm[i] ^ (MASKS[mk](x, y) ? 1 : 0); }
    putFormat(m, n, lv, mk);
    const s = penalty(m, n); if(s < bestS){ bestS = s; best = m; }
  }
  return {size:n, version:ver, level:level || 'M', get:(x, y) => best[y * n + x] === 1, data:best};
}
function putFormat(m, n, lv, mk){
  const f = bchFormat((LV_BITS[lv] << 3) | mk);
  for(let i = 0; i < 15; i++){
    const b = f >> i & 1;
    if(i < 6) m[i * n + 8] = b; else if(i < 8) m[(i + 1) * n + 8] = b; else if(i < 9) m[8 * n + 7] = b; else m[8 * n + 14 - i] = b;
    if(i < 8) m[8 * n + n - 1 - i] = b; else m[(n - 15 + i) * n + 8] = b;
  }
  m[(n - 8) * n + 8] = 1;
}
function penalty(m, n){
  let s = 0;
  for(let pass = 0; pass < 2; pass++){
    for(let a = 0; a < n; a++){
      let run = 1, prev = -1;
      for(let b = 0; b < n; b++){
        const v = pass ? m[b * n + a] : m[a * n + b];
        if(v === prev){ run++; if(run === 5) s += 3; else if(run > 5) s++; } else { run = 1; prev = v; }
      }
    }
  }
  for(let y = 0; y < n - 1; y++) for(let x = 0; x < n - 1; x++){ const v = m[y * n + x]; if(v === m[y * n + x + 1] && v === m[(y + 1) * n + x] && v === m[(y + 1) * n + x + 1]) s += 3; }
  const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = pat.slice().reverse();
  for(let pass = 0; pass < 2; pass++) for(let a = 0; a < n; a++) for(let b = 0; b <= n - 11; b++){
    let ok1 = true, ok2 = true;
    for(let k = 0; k < 11; k++){ const v = pass ? m[(b + k) * n + a] : m[a * n + b + k]; if(v !== pat[k]) ok1 = false; if(v !== pat2[k]) ok2 = false; }
    if(ok1) s += 40; if(ok2) s += 40;
  }
  let dark = 0; for(let i = 0; i < n * n; i++) dark += m[i];
  s += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
  return s;
}

function draw(canvas, text, o){
  o = o || {}; const q = encode(text, o.level || 'M', o.minVer ?? 3), quiet = o.quiet ?? 4, px = o.px || 8, n = q.size, W = (n + quiet * 2) * px;
  canvas.width = canvas.height = W; const c = canvas.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, W); c.fillStyle = o.color || '#1b1b2f';
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++) if(q.get(x, y)) c.fillRect((x + quiet) * px, (y + quiet) * px, px, px);
  return q;
}

/* ====================================================================
   よむ
   ==================================================================== */
function rsCorrect(cw, nsym){
  const n = cw.length, S = new Array(nsym).fill(0); let any = false;
  for(let j = 0; j < nsym; j++){ let v = 0; for(let i = 0; i < n; i++) v = mul(v, EXP[j]) ^ cw[i]; S[j] = v; if(v) any = true; }
  if(!any) return cw;
  /* Berlekamp–Massey */
  let C = [1], B = [1], L = 0, m = 1, b = 1;
  for(let k = 0; k < nsym; k++){
    let d = S[k]; for(let i = 1; i <= L; i++) d ^= mul(C[i] || 0, S[k - i]);
    if(d === 0){ m++; continue; }
    const T = C.slice(), coef = mul(d, inv(b)), need = B.length + m;
    while(C.length < need) C.push(0);
    for(let i = 0; i < B.length; i++) C[i + m] ^= mul(coef, B[i]);
    if(2 * L <= k){ L = k + 1 - L; B = T; b = d; m = 1; } else m++;
  }
  while(C.length && C[C.length - 1] === 0) C.pop();
  if(L === 0 || L * 2 > nsym) return null;
  /* 場所を さがす（チェン探索） */
  const pos = [];
  for(let p = 0; p < n; p++){
    const k = n - 1 - p; let v = 0, xi = EXP[(255 - k) % 255], pw = 1;
    for(let i = 0; i < C.length; i++){ v ^= mul(C[i], pw); pw = mul(pw, xi); }
    if(v === 0) pos.push(p);
  }
  if(pos.length !== L) return null;
  /* 大きさ（フォーニー）… Ω = S·Λ mod x^nsym */
  const om = new Array(nsym).fill(0);
  for(let i = 0; i < nsym; i++) for(let j = 0; j < C.length && i + j < nsym; j++) om[i + j] ^= mul(S[i], C[j]);
  const out = cw.slice();
  for(const p of pos){
    const k = n - 1 - p, X = EXP[k % 255], xi = EXP[(255 - k) % 255];
    let ov = 0, pw = 1; for(let i = 0; i < om.length; i++){ ov ^= mul(om[i], pw); pw = mul(pw, xi); }
    let dv = 0; pw = 1; for(let i = 1; i < C.length; i += 2){ dv ^= mul(C[i], pw); pw = mul(pw, mul(xi, xi)); }
    if(dv === 0) return null;
    out[p] ^= mul(X, mul(ov, inv(dv)));
  }
  for(let j = 0; j < nsym; j++){ let v = 0; for(let i = 0; i < n; i++) v = mul(v, EXP[j]) ^ out[i]; if(v) return null; }
  return out;
}

/* 行列（暗＝1）から 文字列へ */
function readMatrix(get, n, tryFlip){
  const ver = (n - 17) / 4; if(!(ver >= 1 && ver <= 10) || ver !== Math.floor(ver)) return null;
  const g = tryFlip ? (x, y) => get(y, x) : get;   // 鏡うつしも ためす
  /* 形式情報（2か所）… 近い ものを さがす */
  const fa = [], fb = [];
  for(let i = 0; i < 15; i++){
    const a = i < 6 ? g(8, i) : i < 8 ? g(8, i + 1) : i < 9 ? g(7, 8) : g(14 - i, 8);
    const b = i < 8 ? g(n - 1 - i, 8) : g(8, n - 15 + i);
    fa.push(a ? 1 : 0); fb.push(b ? 1 : 0);
  }
  const toNum = a => a.reduce((s, v, i) => s | v << i, 0), A = toNum(fa), B = toNum(fb);
  let best = null, bd = 99;
  for(let v = 0; v < 32; v++){ const f = bchFormat(v), d = Math.min(popc(f ^ A), popc(f ^ B)); if(d < bd){ bd = d; best = v; } }
  if(bd > 3) return null;
  const lvBits = best >> 3, mk = best & 7, lv = LV_BITS.indexOf(lvBits);
  const fm = funcMask(ver), bits = [];
  let up = true;
  for(let x = n - 1; x > 0; x -= 2){
    if(x === 6) x--;
    for(let k = 0; k < n; k++){
      const y = up ? n - 1 - k : k;
      for(let dx = 0; dx < 2; dx++){ const xx = x - dx; if(fm[y * n + xx]) continue; bits.push((g(xx, y) ? 1 : 0) ^ (MASKS[mk](xx, y) ? 1 : 0)); }
    }
    up = !up;
  }
  const cw = []; for(let i = 0; i + 8 <= bits.length; i += 8){ let v = 0; for(let k = 0; k < 8; k++) v = v << 1 | bits[i + k]; cw.push(v); }
  const bl = blocksOf(ver, lv), total = bl.reduce((s, b) => s + b.total, 0);
  if(cw.length < total) return null;
  /* ばらして 戻す */
  const maxD = Math.max(...bl.map(b => b.data)), blk = bl.map(() => []);
  let p = 0;
  for(let i = 0; i < maxD; i++) bl.forEach((b, j) => { if(i < b.data) blk[j].push(cw[p++]); });
  const maxE = Math.max(...bl.map(b => b.total - b.data));
  for(let i = 0; i < maxE; i++) bl.forEach((b, j) => { if(i < b.total - b.data) blk[j].push(cw[p++]); });
  const data = [];
  for(let j = 0; j < bl.length; j++){
    const fixed = rsCorrect(blk[j], bl[j].total - bl[j].data); if(!fixed) return null;
    for(let i = 0; i < bl[j].data; i++) data.push(fixed[i]);
  }
  /* 中身を よむ */
  const bs = []; data.forEach(c => { for(let i = 7; i >= 0; i--) bs.push(c >> i & 1); });
  let q = 0; const take = k => { let v = 0; for(let i = 0; i < k; i++) v = v << 1 | (bs[q++] || 0); return v; };
  const bytes = [];
  while(q + 4 <= bs.length){
    const mode = take(4);
    if(mode === 0) break;
    if(mode === 4){ const len = take(ver < 10 ? 8 : 16); for(let i = 0; i < len; i++) bytes.push(take(8)); }
    else return null;
  }
  try{ return new TextDecoder('utf-8', {fatal:true}).decode(new Uint8Array(bytes)); }catch(e){ return null; }
}
const popc = v => { let c = 0; while(v){ c += v & 1; v >>= 1; } return c; };

/* ---------- 画像 → 白黒 ---------- */
function binarize(img, tPar){
  const w = img.width, h = img.height, d = img.data, gray = new Uint8Array(w * h);
  for(let i = 0, j = 0; i < gray.length; i++, j += 4) gray[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8;
  const ii = new Float64Array((w + 1) * (h + 1));
  for(let y = 0; y < h; y++){ let row = 0; for(let x = 0; x < w; x++){ row += gray[y * w + x]; ii[(y + 1) * (w + 1) + x + 1] = ii[y * (w + 1) + x + 1] + row; } }
  const s = Math.max(15, Math.round(Math.min(w, h) / 6)) | 1, hs = s >> 1, bw = new Uint8Array(w * h);
  for(let y = 0; y < h; y++){
    const y0 = Math.max(0, y - hs), y1 = Math.min(h - 1, y + hs);
    for(let x = 0; x < w; x++){
      const x0 = Math.max(0, x - hs), x1 = Math.min(w - 1, x + hs), cnt = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum = ii[(y1 + 1) * (w + 1) + x1 + 1] - ii[y0 * (w + 1) + x1 + 1] - ii[(y1 + 1) * (w + 1) + x0] + ii[y0 * (w + 1) + x0];
      bw[y * w + x] = gray[y * w + x] * cnt < sum * (1 - tPar) ? 1 : 0;
    }
  }
  return {w, h, bw, gray};
}

/* ---------- 白黒の ならび（ファインダー 1:1:3:1:1／アライメント 1:1:1:1:1）さがし ---------- */
function runsOf(line){
  const r = []; let cur = line[0], len = 1;
  for(let i = 1; i < line.length; i++){ if(line[i] === cur) len++; else { r.push([cur, len]); cur = line[i]; len = 1; } }
  r.push([cur, len]); return r;
}
function ratioOk(v, pat, tol){
  const tot = v.reduce((a, b) => a + b, 0), ptot = pat.reduce((a, b) => a + b, 0), u = tot / ptot;
  if(u < 1) return 0;
  for(let i = 0; i < pat.length; i++) if(Math.abs(v[i] - pat[i] * u) > Math.max(u * tol * pat[i], 1.2)) return 0;
  return u;
}
/* (x,y) を とおる 直線（向き dx,dy）で、まん中の 暗い ぶぶんを 中心に ならびを しらべる */
function crossCheck(B, x, y, dx, dy, pat, tol){
  const w = B.w, h = B.h, bw = B.bw, half = (pat.length - 1) / 2;
  const at = t => { const px = Math.round(x + dx * t), py = Math.round(y + dy * t); return (px < 0 || py < 0 || px >= w || py >= h) ? -1 : bw[py * w + px]; };
  if(at(0) !== 1) return null;
  let a = 0; while(at(-(a + 1)) === 1){ a++; if(a > 2000) return null; }
  let b = 0; while(at(b + 1) === 1){ b++; if(b > 2000) return null; }
  const outward = sgn => {
    const out = []; let pos = sgn > 0 ? b + 1 : -(a + 1);
    for(let k = 0; k < half; k++){
      const want = k % 2 === 0 ? 0 : 1; let l = 0;
      while(at(pos) === want){ l++; pos += sgn; if(l > 2000) return null; }
      if(l === 0) return null; out.push(l);
    }
    return out;
  };
  const L = outward(-1), R = outward(1); if(!L || !R) return null;
  const v = L.slice().reverse().concat([a + b + 1], R), u = ratioOk(v, pat, tol);
  return u ? {u, tc:(b - a) / 2} : null;
}
function scanPattern(B, pat, x0, y0, x1, y1, step, minN){
  const w = B.w, bw = B.bw, cand = [], np = pat.length;
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(w - 1, Math.ceil(x1)); y1 = Math.min(B.h - 1, Math.ceil(y1));
  for(let y = y0; y <= y1; y += step){
    const row = bw.subarray(y * w + x0, y * w + x1 + 1), runs = runsOf(row); let x = x0;
    const starts = []; runs.forEach(r => { starts.push(x); x += r[1]; });
    for(let i = 0; i + np - 1 < runs.length; i++){
      if(runs[i][0] !== 1) continue;
      const v = []; for(let k = 0; k < np; k++) v.push(runs[i + k][1]);
      const u = ratioOk(v, pat, 0.7); if(!u) continue;
      const mid = (np - 1) / 2, cx = starts[i + mid] + runs[i + mid][1] / 2;
      const vc = crossCheck(B, cx, y, 0, 1, pat, 0.8); if(!vc) continue;
      const cy = y + vc.tc, hc = crossCheck(B, cx, cy, 1, 0, pat, 0.8); if(!hc) continue;
      const ux = cx + hc.tc, uu = (u + vc.u + hc.u) / 3;
      let hit = null;
      for(const c of cand){ if(Math.abs(c.x - ux) < c.u * 2 && Math.abs(c.y - cy) < c.u * 2 && Math.abs(c.u - uu) < c.u * 0.6){ hit = c; break; } }
      if(hit){ hit.x = (hit.x * hit.n + ux) / (hit.n + 1); hit.y = (hit.y * hit.n + cy) / (hit.n + 1); hit.u = (hit.u * hit.n + uu) / (hit.n + 1); hit.n++; }
      else cand.push({x:ux, y:cy, u:uu, n:1});
    }
  }
  return cand.filter(c => c.n >= minN);
}
function findFinders(B){
  const step = Math.max(1, Math.floor(B.h / 240));
  return scanPattern(B, [1, 1, 3, 1, 1], 0, 0, B.w - 1, B.h - 1, step, 2).sort((a, b) => b.n - a.n).slice(0, 14);
}
/* 斜めに 回っていると、横に はかった 長さは 1/cos だけ のびる。回転角（90度ごと）を たたんで cos を かえす */
function foldCos(dx, dy){ const a = Math.atan2(dy, dx), r = a - Math.round(a / (Math.PI / 2)) * (Math.PI / 2); return Math.cos(r); }
function pickTriples(c){
  const list = [], d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  for(let i = 0; i < c.length; i++) for(let j = i + 1; j < c.length; j++) for(let k = j + 1; k < c.length; k++){
    const P = [c[i], c[j], c[k]];
    const ds = [[d(P[1], P[2]), 0], [d(P[0], P[2]), 1], [d(P[0], P[1]), 2]].sort((a, b) => a[0] - b[0]);
    const s1 = ds[0][0], s2 = ds[1][0], hy = ds[2][0], um = (P[0].u + P[1].u + P[2].u) / 3;
    if(Math.max(P[0].u, P[1].u, P[2].u) / Math.min(P[0].u, P[1].u, P[2].u) > 1.8) continue;
    if(s1 < um * 6) continue;
    let sc = Math.abs(s1 - s2) / Math.max(s1, s2) + Math.abs(hy - Math.SQRT2 * (s1 + s2) / 2) / hy;
    const tl = P[ds[2][1]], rest = P.filter((_, q) => q !== ds[2][1]);
    const est = (s1 + s2) / 2 / (um * foldCos(rest[0].x - tl.x, rest[0].y - tl.y)) + 7, near = Math.round((est - 17) / 4) * 4 + 17;
    if(near < 21 || near > 57) continue;
    sc += Math.abs(est - near) / 8;     // 一辺が「マスの 数」に あうか
    if(sc > 0.5) continue;
    let tr = rest[0], bl = rest[1];
    if((tr.x - tl.x) * (bl.y - tl.y) - (tr.y - tl.y) * (bl.x - tl.x) < 0){ const t = tr; tr = bl; bl = t; }
    list.push({tl, tr, bl, sc});
  }
  return list.sort((a, b) => a.sc - b.sc).slice(0, 6);
}

/* ---------- 位置あわせ（アライメント 5×5）… 型板（テンプレート）あわせ ---------- */
function findAlign(B, ex, ey, vx, vy){
  const w = B.w, h = B.h, bw = B.bw, u = Math.hypot(vx[0], vx[1]), R = Math.max(3, Math.round(u * 4));
  const cx0 = Math.round(ex), cy0 = Math.round(ey);
  let best = -1, list = [];
  for(let y = cy0 - R; y <= cy0 + R; y++) for(let x = cx0 - R; x <= cx0 + R; x++){
    let sc = 0;
    for(let j = -2; j <= 2; j++) for(let i = -2; i <= 2; i++){
      const d = Math.max(Math.abs(i), Math.abs(j)), want = d !== 1 ? 1 : 0;
      const px = Math.round(x + i * vx[0] + j * vy[0]), py = Math.round(y + i * vx[1] + j * vy[1]);
      if(px < 0 || py < 0 || px >= w || py >= h) continue;
      if(bw[py * w + px] === want) sc++;
    }
    if(sc > best){ best = sc; list = [[x, y]]; } else if(sc === best) list.push([x, y]);
  }
  if(best < 21) return null;
  let sx = 0, sy = 0; list.forEach(p => { sx += p[0]; sy += p[1]; });
  const mx = sx / list.length, my = sy / list.length;
  let c = 0, tx = 0, ty = 0; list.forEach(p => { if(Math.hypot(p[0] - mx, p[1] - my) <= u * 1.5){ tx += p[0]; ty += p[1]; c++; } });
  return c ? {x:tx / c, y:ty / c} : {x:mx, y:my};
}

/* ---------- ホモグラフィ ---------- */
function homography(src, dst){
  /* src(4点) → dst(4点)。8元一次方程式を ガウス消去 */
  const A = [], b = [];
  for(let i = 0; i < 4; i++){
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const n = 8;
  for(let i = 0; i < n; i++){
    let mx = i; for(let r = i + 1; r < n; r++) if(Math.abs(A[r][i]) > Math.abs(A[mx][i])) mx = r;
    [A[i], A[mx]] = [A[mx], A[i]]; [b[i], b[mx]] = [b[mx], b[i]];
    if(Math.abs(A[i][i]) < 1e-12) return null;
    for(let r = i + 1; r < n; r++){ const f = A[r][i] / A[i][i]; for(let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; }
  }
  const x = new Array(n).fill(0);
  for(let i = n - 1; i >= 0; i--){ let s = b[i]; for(let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; }
  return x;
}
const apply = (H, x, y) => { const d = H[6] * x + H[7] * y + 1; return [(H[0] * x + H[1] * y + H[2]) / d, (H[3] * x + H[4] * y + H[5]) / d]; };

function decodeBW(B){
  const f = findFinders(B); if(f.length < 3) return null;
  for(const T of pickTriples(f)){
    const r = decodeTriple(B, T); if(r != null) return r;
  }
  return null;
}
function decodeTriple(B, T){
  const {tl, tr, bl} = T, u = (tl.u + tr.u + bl.u) / 3 * foldCos(tr.x - tl.x, tr.y - tl.y);
  const dTR = Math.hypot(tr.x - tl.x, tr.y - tl.y), dBL = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const est = (dTR + dBL) / 2 / u + 7;
  const tried = new Set(), list = [];
  const base = Math.round((est - 17) / 4) * 4 + 17;
  [base, base - 4, base + 4].forEach(n => { if(n >= 21 && n <= 57 && !tried.has(n)){ tried.add(n); list.push(n); } });
  for(const n of list){
    const ver = (n - 17) / 4, span = n - 7;
    const vx = [(tr.x - tl.x) / span, (tr.y - tl.y) / span], vy = [(bl.x - tl.x) / span, (bl.y - tl.y) / span];
    const pts = [[3.5, 3.5], [n - 3.5, 3.5], [3.5, n - 3.5]], img = [[tl.x, tl.y], [tr.x, tr.y], [bl.x, bl.y]];
    /* 4つめ：右下（型番2いじょうは アライメントパターン） */
    let br = [tr.x + bl.x - tl.x, tr.y + bl.y - tl.y], bm = [n - 3.5, n - 3.5];
    if(ver >= 2){
      const ap = ALIGN[ver][ALIGN[ver].length - 1] + 0.5, ex = tl.x + (ap - 3.5) * vx[0] + (ap - 3.5) * vy[0], ey = tl.y + (ap - 3.5) * vx[1] + (ap - 3.5) * vy[1];   // ap：まん中の マスの 中心
      const a = findAlign(B, ex, ey, vx, vy);
      br = a ? [a.x, a.y] : [ex, ey]; bm = [ap, ap];
    }
    pts.push(bm); img.push(br);
    const H = homography(pts, img); if(!H) continue;
    const grid = new Uint8Array(n * n), w = B.w, h = B.h;
    const samp = (mx, my) => { const [px, py] = apply(H, mx, my), x = Math.round(px), y = Math.round(py); return (x < 0 || y < 0 || x >= w || y >= h) ? 0 : B.bw[y * w + x]; };
    for(let y = 0; y < n; y++) for(let x = 0; x < n; x++){
      const c = x + 0.5, d = y + 0.5, o = 0.22;
      const s = samp(c, d) * 2 + samp(c - o, d) + samp(c + o, d) + samp(c, d - o) + samp(c, d + o);
      grid[y * n + x] = s >= 4 ? 1 : 0;
    }
    const get = (x, y) => grid[y * n + x] === 1;
    const r = readMatrix(get, n, false) ?? readMatrix(get, n, true);
    if(r != null) return r;
  }
  return null;
}

/* 1かいぶん（カメラの 1コマごとに よぶ）：しきい値 3しゅ × 白黒はんてん 2しゅ の どれか 1つ（pass = 0〜5） */
const PASSES = [[0.12, false], [0.04, false], [0.22, false], [0.12, true], [0.06, true], [0.22, true]];
function decodeOnce(img, pass){
  const P = PASSES[(pass | 0) % PASSES.length];
  try{
    const B = binarize(img, P[0]);
    return decodeBW(P[1] ? {w:B.w, h:B.h, bw:B.bw.map(v => 1 - v)} : B);
  }catch(e){ return null; }
}
function decode(img){
  for(let p = 0; p < PASSES.length; p++){ const r = decodeOnce(img, p); if(r != null) return r; }
  return null;
}

root.QRLite = {encode, decode, decodeOnce, passes:PASSES.length, draw, _rsCorrect:rsCorrect, _rsEncode:rsEncode, _readMatrix:readMatrix};
if(typeof module !== 'undefined' && module.exports) module.exports = root.QRLite;
})(typeof window !== 'undefined' ? window : globalThis);
