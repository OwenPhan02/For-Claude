// Chấm phát âm: tách pinyin, đoán thanh điệu từ cao độ giọng, so sánh với đáp án, mẹo sửa cho người Việt.
// Không phụ thuộc trình duyệt → kiểm thử được bằng Node.

const MARKS = { ā: 'a1', á: 'a2', ǎ: 'a3', à: 'a4', ē: 'e1', é: 'e2', ě: 'e3', è: 'e4', ī: 'i1', í: 'i2', ǐ: 'i3', ì: 'i4',
  ō: 'o1', ó: 'o2', ǒ: 'o3', ò: 'o4', ū: 'u1', ú: 'u2', ǔ: 'u3', ù: 'u4', ǖ: 'ü1', ǘ: 'ü2', ǚ: 'ü3', ǜ: 'ü4', ń: 'n2', ň: 'n3', ǹ: 'n4' };
const SYL = /^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(iong|iang|iao|ian|ing|ie|iu|in|ia|i|uang|uai|uan|ueng|ui|un|uo|ua|u|üan|üe|ün|ü|ue|ong|ang|eng|ai|ei|ao|ou|an|en|a|o|e|er|n|ng|m|r)$/;
const isHan = c => /[㐀-鿿]/.test(c);

/** 'hǎo' → { base: 'hao', tone: 3 }  (thanh nhẹ = 0) */
export function parseSyl(s) {
  let base = '', tone = 0;
  for (const ch of s.toLowerCase().normalize('NFC')) {
    const m = MARKS[ch];
    if (m) { base += m[0]; tone = +m[1]; } else if (ch === 'v') base += 'ü'; else base += ch;
  }
  return { base, tone };
}
const valid = b => SYL.test(b) && !/^[bpmf](ü|ue|ün|üan)/.test(b);

/** Tách chuỗi pinyin thành đúng n âm tiết (n = số chữ Hán). Trả về null nếu không tách được. */
export function splitPy(py, n) {
  const clean = py.split('/')[0].toLowerCase().normalize('NFC').replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüvńňǹ' ]/g, ' ');
  const letters = []; const boundary = new Set();
  for (const ch of clean) {
    if (ch === ' ' || ch === "'") { boundary.add(letters.length); continue; }
    letters.push(ch);
  }
  const L = letters.length;
  const memo = new Map();
  const go = (pos, k) => {
    if (pos === L) return k === 0 ? [] : null;
    if (k === 0) return null;
    const key = pos * 64 + k;
    if (memo.has(key)) return memo.get(key);
    let res = null;
    for (let len = Math.min(6, L - pos); len >= 1 && !res; len--) {
      let crosses = false;
      for (let j = pos + 1; j < pos + len; j++) if (boundary.has(j)) { crosses = true; break; }
      if (crosses) continue;
      const piece = letters.slice(pos, pos + len).join('');
      const marks = [...piece].filter(c => MARKS[c]).length;
      if (marks > 1) continue;
      const p = parseSyl(piece);
      if (!valid(p.base)) continue;
      const rest = go(pos + len, k - 1);
      if (rest) res = [p, ...rest];
    }
    memo.set(key, res);
    return res;
  };
  return go(0, n);
}

/** Danh sách âm tiết đích cho một mục luyện nói: [{ ch, base, tone }] */
export function targetOf(item) {
  const out = [];
  for (const [zh, py] of item.parts) {
    const chars = [...zh].filter(isHan);
    if (!chars.length) continue;
    const syl = py ? splitPy(py, chars.length) : null;
    chars.forEach((ch, i) => out.push({ ch, base: syl?.[i]?.base || '', tone: syl?.[i]?.tone ?? -1 }));
  }
  return out;
}

/** Thanh thực tế khi nói (biến điệu 3-3 → 2-3) để so với cao độ. */
export function spokenTones(target) {
  const t = target.map(x => x.tone);
  for (let i = 0; i < t.length - 1; i++) if (t[i] === 3 && t[i + 1] === 3) t[i] = 2;
  return t;
}

// ---------------- Từ điển chữ → cách đọc (dựng từ từ vựng của app) ----------------
let READ = null;
export function buildReadings(allVocab) {
  READ = new Map();
  for (const w of allVocab) {
    const chars = [...w.s].filter(isHan);
    const syl = splitPy(w.py, chars.length);
    if (!syl) continue;
    chars.forEach((c, i) => {
      if (!READ.has(c)) READ.set(c, []);
      const list = READ.get(c);
      if (!list.some(r => r.base === syl[i].base && r.tone === syl[i].tone)) list.push(syl[i]);
    });
  }
  return READ;
}
const readingsOf = c => READ?.get(c) || [];

// ---------------- So khớp lời nói nhận dạng được với đáp án ----------------
function cellScore(t, h) {
  if (t.ch === h) return { s: 3, st: 'ok' };
  const rs = readingsOf(h);
  if (rs.some(r => r.base === t.base && r.tone === t.tone)) return { s: 3, st: 'ok', homo: true };
  if (t.tone === 0 && rs.some(r => r.base === t.base)) return { s: 3, st: 'ok', homo: true }; // thanh nhẹ: chấp nhận
  const same = rs.find(r => r.base === t.base);
  if (same) return { s: 2, st: 'tone', heard: same };
  return { s: 0, st: 'sound', heard: rs[0] || null };
}

/** Căn hàng (DP) giữa âm tiết đích và chữ nghe được. */
function align(target, heard) {
  const n = target.length, m = heard.length;
  const S = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const B = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = S[i - 1][j - 1] + cellScore(target[i - 1], heard[j - 1]).s;
      const up = S[i - 1][j], left = S[i][j - 1];
      if (diag >= up && diag >= left) { S[i][j] = diag; B[i][j] = 1; }
      else if (up >= left) { S[i][j] = up; B[i][j] = 2; } else { S[i][j] = left; B[i][j] = 3; }
    }
    B[i][0] = 2;
  }
  const res = new Array(n).fill(null);
  let i = n, j = m;
  while (i > 0) {
    if (j > 0 && B[i][j] === 1) { res[i - 1] = { h: heard[j - 1], ...cellScore(target[i - 1], heard[j - 1]) }; i--; j--; }
    else if (j > 0 && B[i][j] === 3) j--;
    else { res[i - 1] = { h: '', s: 0, st: 'miss' }; i--; }
  }
  return { score: S[n][m], cells: res };
}

/**
 * Chấm một lần nói.
 * @param target  [{ch, base, tone}]
 * @param alts    các câu nhận dạng (chuỗi) – có thể rỗng nếu trình duyệt không hỗ trợ
 * @param toneGuess  thanh đoán từ cao độ cho từng âm tiết (mảng số hoặc null)
 */
export function grade(target, alts, toneGuess = null) {
  let best = null;
  for (const a of alts || []) {
    const heard = [...a].filter(isHan);
    const r = align(target, heard);
    if (!best || r.score > best.score) best = { ...r, text: a };
  }
  const cells = target.map((t, i) => {
    const c = best?.cells[i] || { h: '', st: alts?.length ? 'miss' : 'unk' };
    return { ...t, ...c, pitchTone: toneGuess?.[i] ?? null };
  });
  const pts = cells.reduce((s, c) => s + (c.st === 'ok' ? 1 : c.st === 'tone' ? .5 : 0), 0);
  const score = alts?.length ? Math.round((pts / Math.max(1, cells.length)) * 100) : null;
  return { cells, score, heardText: best?.text || '' };
}

// ---------------- Đoán thanh điệu từ đường cao độ ----------------
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };
const avg = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);

/** Làm sạch khung cao độ [{t, f}] (f = null nếu không có tiếng): lọc nhảy quãng tám + trung vị. */
export function cleanPitch(frames) {
  const v = frames.filter(x => x.f);
  if (v.length < 3) return [];
  const ref = median(v.map(x => x.f));
  const fixed = v.map(x => {
    let f = x.f;
    if (f > ref * 1.7) f /= 2; else if (f < ref / 1.7) f *= 2;
    return { t: x.t, f };
  });
  return fixed.map((x, i) => ({ t: x.t, f: median(fixed.slice(Math.max(0, i - 2), i + 3).map(y => y.f)) }));
}
export const toSemi = (f, ref) => 12 * Math.log2(f / ref);

/** Chia các khung có tiếng thành n đoạn (ưu tiên theo khoảng lặng giữa các âm tiết). */
export function segment(frames, n, gapMs = 70) {
  if (!frames.length || !n) return [];
  const runs = [[frames[0]]];
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].t - frames[i - 1].t > gapMs) runs.push([]);
    runs[runs.length - 1].push(frames[i]);
  }
  const big = runs.filter(r => r.length >= 3);
  if (big.length === n) return big;
  const t0 = frames[0].t, t1 = frames[frames.length - 1].t, step = (t1 - t0) / n || 1;
  return Array.from({ length: n }, (_, k) => frames.filter(x => x.t >= t0 + k * step && (k === n - 1 ? x.t <= t1 : x.t < t0 + (k + 1) * step)));
}

/** Đoán thanh (1–4, 0 = không chắc) của một đoạn, cao độ tính bằng nửa cung so với giọng người nói. */
export function classifyTone(semis) {
  if (semis.length < 4) return 0;
  const q = Math.max(1, Math.floor(semis.length / 5));
  const start = avg(semis.slice(0, q)), end = avg(semis.slice(-q));
  let min = Infinity, minI = 0, max = -Infinity;
  semis.forEach((x, i) => { if (x < min) { min = x; minI = i; } if (x > max) max = x; });
  const minPos = minI / (semis.length - 1);
  const range = max - min, mean = avg(semis);
  if (minPos > .2 && minPos < .8 && start - min >= 1.2 && end - min >= 0.8) return 3;
  if (end - start >= 1.8) return 2;
  if (start - end >= 2.2) return 4;
  if (range < 2.2) return mean < -2.2 ? 3 : 1;
  if (mean < -2.5) return 3;
  return 0;
}

/** Đoán thanh cho từng âm tiết từ khung cao độ thô. */
export function guessTones(frames, n) {
  const clean = cleanPitch(frames);
  if (!clean.length) return { tones: null, curve: [] };
  const ref = median(clean.map(x => x.f));
  const curve = clean.map(x => ({ t: x.t, s: toSemi(x.f, ref) }));
  const segs = segment(clean, n);
  const tones = segs.map(seg => classifyTone(seg.map(x => toSemi(x.f, ref))));
  return { tones, curve, segs: segs.map(s => [s[0]?.t, s[s.length - 1]?.t]) };
}

// Hình mẫu của từng thanh (0 = thấp, 1 = cao) để vẽ so sánh
export const TONE_SHAPE = { 1: [.85, .85], 2: [.4, .85], 3: [.35, .05, .3], 4: [.95, .1], 0: [.45, .35] };

// ---------------- Mẹo sửa cho người Việt ----------------
const TONE_TIP = {
  1: 'Thanh 1 (ā): giữ giọng <b>cao và phẳng</b> như ngân một nốt nhạc cao, kéo đều đến hết – không hạ giọng ở cuối như thanh ngang tiếng Việt.',
  2: 'Thanh 2 (á): bắt đầu từ giữa rồi <b>đi lên</b>, giống dấu sắc nhưng kéo dài hơn, như khi hỏi lại "Hả?".',
  3: 'Thanh 3 (ǎ): hạ giọng <b>xuống thật thấp</b> rồi mới hơi lên – khác dấu hỏi tiếng Việt. Trong câu thường chỉ cần hạ thấp (nửa thanh 3).',
  4: 'Thanh 4 (à): bắt đầu <b>cao</b> rồi <b>rơi mạnh, dứt khoát</b> xuống thấp – giống dấu huyền nhưng xuất phát cao và gắt hơn, như khi ra lệnh.',
  0: 'Thanh nhẹ: đọc <b>ngắn và nhẹ</b>, không nhấn.',
};
const PAIR_TIP = {
  '3>2': 'Bạn đang đi lên ngay như thanh 2 – hãy <b>xuống thấp trước</b> rồi mới lên.',
  '2>3': 'Đừng hạ giọng trước – thanh 2 <b>đi thẳng lên</b>.',
  '1>4': 'Giọng bị rơi xuống ở cuối – hãy <b>giữ cao đều</b>.',
  '4>1': 'Chưa đủ rơi – hãy <b>hạ giọng mạnh</b> ở cuối.',
  '1>2': 'Bắt đầu đã ở mức <b>cao</b> ngay từ đầu, không trượt lên.',
  '4>3': 'Thanh 4 không lên lại ở cuối – <b>rơi một mạch</b>.',
  '3>4': 'Thanh 3 là thấp – đừng bắt đầu cao như thanh 4.',
};
const INITIAL_TIP = [
  [/^(zh|ch|sh|r)/, '<b>zh / ch / sh / r</b>: <b>uốn đầu lưỡi lên</b> chạm gần vòm miệng (như "tr", "s" nặng của miền Bắc xưa). <b>ch</b> có bật hơi, <b>zh</b> không.'],
  [/^[zcs](?!h)/, '<b>z / c / s</b>: <b>đầu lưỡi thẳng</b>, chạm sau răng trên. <b>z</b> ≈ "ch" nhẹ không bật hơi, <b>c</b> ≈ "ts" có bật hơi mạnh.'],
  [/^[jqx]/, '<b>j / q / x</b>: mặt lưỡi áp vòm, <b>môi dẹt như cười</b>. <b>j</b> ≈ "ch", <b>q</b> ≈ "ch" bật hơi mạnh, <b>x</b> ≈ "x" nhẹ.'],
  [/^[ptk]/, '<b>p / t / k</b> là phụ âm <b>bật hơi</b>: đặt tay trước miệng phải thấy luồng hơi mạnh (p ≈ "ph" bật hơi, t ≈ "th", k ≈ "kh").'],
  [/^[bdg]/, '<b>b / d / g</b> <b>không bật hơi</b> và không rung như tiếng Việt: b ≈ "p" nhẹ, d ≈ "t", g ≈ "c/k".'],
  [/^h/, '<b>h</b>: hơi ra từ cuống lưỡi, hơi nhám (giống "kh" nhẹ).'],
  [/^[nl]/, 'Phân biệt <b>n</b> (hơi đi ra mũi) và <b>l</b> (hơi đi hai bên lưỡi).'],
  [/^f/, '<b>f</b> ≈ "ph" tiếng Việt: răng trên chạm môi dưới.'],
];
const FINAL_TIP = [
  [/ü|^[jqxy]u/, '<b>ü</b>: <b>chu tròn môi</b> như đọc "u" nhưng lưỡi đặt như "i". Sau j/q/x/y, chữ u thực chất là ü.'],
  [/ang|eng|ing|ong/, 'Vần <b>-ng</b> (ang, eng, ing, ong): hơi <b>đi ra mũi ở cuối</b>, miệng mở, như "ang" tiếng Việt.'],
  [/(an|en|in|un)$/, 'Vần <b>-n</b> (an, en, in): <b>đầu lưỡi chạm lợi trên</b> ở cuối, ngắn gọn – khác -ng.'],
  [/^(zh|ch|sh|r|z|c|s)i$/, 'Sau zh/ch/sh/r/z/c/s, chữ <b>i</b> không đọc là "i" mà giữ nguyên khẩu hình phụ âm, kéo dài (gần "ư").'],
  [/er$/, '<b>er</b>: đọc "ơ" rồi <b>uốn lưỡi lên</b>.'],
  [/e$/, '<b>e</b> đứng một mình đọc gần "ưa/ơ", không phải "e" tiếng Việt.'],
  [/ui$/, '<b>ui</b> đọc là "uây" (= uei).'],
  [/iu$/, '<b>iu</b> đọc là "yêu" (= iou).'],
];
const split = b => { const m = b.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(.*)$/); return { ini: m[1] || '', fin: m[2] }; };

/** Danh sách mẹo (HTML) cho kết quả chấm. */
export function tipsFor(result) {
  const out = [];
  const seen = new Set();
  const add = t => { if (t && !seen.has(t)) { seen.add(t); out.push(t); } };
  for (const c of result.cells) {
    if (c.st === 'tone' || (c.st !== 'sound' && c.pitchTone && c.tone > 0 && c.pitchTone !== c.tone && c.st !== 'ok')) {
      const heard = c.heard?.tone ?? c.pitchTone;
      add(`<span class="zh">${c.ch}</span> <b>${withMark(c.base, c.tone)}</b>: ${PAIR_TIP[`${c.tone}>${heard}`] || ''} ${TONE_TIP[c.tone] || ''}`);
    } else if (c.st === 'sound' && c.base) {
      const want = split(c.base), got = c.heard ? split(c.heard.base) : null;
      if (got) {
        if (want.ini !== got.ini) { const r = INITIAL_TIP.find(([re]) => re.test(c.base)); if (r) add(r[1]); }
        if (want.fin !== got.fin) { const r = FINAL_TIP.find(([re]) => re.test(c.base)); if (r) add(r[1]); }
      } else if (c.h) {
        add(`Chữ <span class="zh">${c.ch}</span> (<b>${withMark(c.base, c.tone)}</b>) bị nghe thành chữ khác – nghe lại mẫu, đọc <b>chậm và rõ từng âm</b>.`);
      }
      if (!out.length) add(`Nghe kỹ giọng mẫu chữ <span class="zh">${c.ch}</span> (<b>${c.base}</b>) và đọc chậm từng âm.`);
    } else if (c.st === 'miss') {
      add('Có âm bị thiếu – hãy đọc <b>rõ và đủ từng chữ</b>, nói to hơn một chút, đưa điện thoại gần miệng.');
    }
  }
  return out.slice(0, 4);
}

/** Ghép âm tiết + số thanh thành pinyin có dấu (để hiển thị cái máy nghe được). */
export function withMark(base, tone) {
  if (!tone) return base;
  const pos = /a|e/.test(base) ? base.search(/a|e/) : base.includes('ou') ? base.indexOf('o') : (() => {
    let p = -1; [...base].forEach((c, i) => { if ('iouü'.includes(c)) p = i; }); return p;
  })();
  if (pos < 0) return base + tone;
  const v = base[pos];
  const tbl = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
  return base.slice(0, pos) + (tbl[v]?.[tone - 1] || v) + base.slice(pos + 1);
}

/** Pinyin (có dấu) của một chuỗi chữ Hán nghe được – dùng để hiển thị. */
export function readingsOfText(text) {
  return [...text].filter(isHan).map(c => { const r = readingsOf(c)[0]; return r ? withMark(r.base, r.tone) : '?'; }).join(' ');
}
