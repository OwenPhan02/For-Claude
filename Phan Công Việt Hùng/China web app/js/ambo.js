// Âm bồi: cách đọc gần đúng tiếng Trung viết bằng chữ Việt (tạo tự động từ pinyin).
// Thanh 1 → không dấu · thanh 2 → sắc · thanh 3 → hỏi · thanh 4 → huyền · thanh nhẹ → không dấu.
// Chỉ để tham khảo cho người mới – luôn nghe giọng mẫu để đọc chuẩn.
import { splitPy, parseSyl } from './pron.js';

const INI = { b: 'b', p: 'p', m: 'm', f: 'ph', d: 't', t: 'th', n: 'n', l: 'l', g: 'c', k: 'kh', h: 'h',
  j: 'ch', q: 'ch', x: 'x', zh: 'tr', ch: 'tr', sh: 's', r: 'r', z: 'ch', c: 'x', s: 'x' };
const FIN = { a: 'a', o: 'ô', e: 'ơ', ai: 'ai', ei: 'ây', ao: 'ao', ou: 'âu', an: 'an', en: 'ân', ang: 'ang', eng: 'âng',
  ong: 'ung', er: 'ơ', i: 'i', ia: 'ia', ie: 'iê', iao: 'eo', iu: 'iêu', ian: 'iên', in: 'in', iang: 'iang', ing: 'inh',
  iong: 'iung', u: 'u', ua: 'oa', uo: 'ua', uai: 'oai', ui: 'uây', uan: 'oan', un: 'uân', uang: 'oang', ueng: 'uâng',
  ü: 'uy', üe: 'uê', ue: 'uê', üan: 'oen', ün: 'uyn' };
const Y = { a: 'da', e: 'dê', ao: 'dao', ou: 'dâu', an: 'den', ang: 'dang', ong: 'dung', i: 'i', in: 'in', ing: 'inh',
  u: 'duy', ue: 'duê', uan: 'doen', un: 'duyn', o: 'dô' };
const W = { u: 'u', a: 'oa', o: 'ua', ai: 'oai', ei: 'uây', an: 'oan', en: 'uân', ang: 'oang', eng: 'uâng' };
const RETRO = new Set(['zh', 'ch', 'sh', 'r', 'z', 'c', 's']);

/** Một âm tiết pinyin (dạng { base, tone }) → âm bồi. */
export function sylAmBoi({ base, tone }) {
  if (!base) return '';
  if (base === 'r') return 'r';
  if (/^(n|ng|m)$/.test(base)) return 'ừm';
  const m = base.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(.*)$/);
  const ini = m[1] || '', fin = m[2];
  let out;
  if (ini === 'y') out = Y[fin] ?? 'd' + (FIN[fin] || fin);
  else if (ini === 'w') out = W[fin] ?? 'u' + (FIN[fin] || fin);
  else {
    let f;
    if (fin === 'i' && RETRO.has(ini)) f = 'ư';                       // shi, zi, ci… → sư, chư, xư
    else if (/^[jqx]$/.test(ini) && /^u/.test(fin)) f = FIN['ü' + fin.slice(1)] || 'uy'; // ju, qu, xue… (u = ü)
    else f = FIN[fin] ?? fin;
    let i = INI[ini] ?? ini;
    if (i === 'c' && /^(oa|uâ)/.test(f)) { i = 'qu'; f = f.slice(1); }  // guā → qua, guì → quây
    else if (i === 'c' && /^[eêiy]/.test(f)) i = 'k';
    out = i + f;
  }
  return markTone(out, tone);
}

const VOW = 'aăâeêioôơuưy';
const SPECIAL = 'ăâêôơư';
const MARK = { 2: '́', 3: '̉', 4: '̀' };

/** Đặt dấu thanh tiếng Việt đúng vị trí nguyên âm. */
function markTone(w, tone) {
  const dia = MARK[tone];
  if (!dia) return w;
  const chars = [...w];
  let start = chars.findIndex((c, i) => VOW.includes(c) && !(c === 'u' && chars[i - 1] === 'q'));
  if (start < 0) return w;
  let end = start;
  while (end + 1 < chars.length && VOW.includes(chars[end + 1])) end++;
  const cluster = chars.slice(start, end + 1);
  const tail = end < chars.length - 1;
  let pos;
  const sp = cluster.map((c, i) => (SPECIAL.includes(c) ? i : -1)).filter(i => i >= 0);
  if (sp.length) pos = sp[sp.length - 1];
  else if (tail) pos = cluster.length - 1;
  else if (cluster.length === 3) pos = 1;
  else if (['oa', 'oe', 'uy'].includes(cluster.join(''))) pos = cluster.length - 1;
  else pos = 0;
  chars[start + pos] = (chars[start + pos] + dia).normalize('NFC');
  return chars.join('');
}

const cache = new Map();
/** Âm bồi cho cả từ / câu. py: pinyin; s: chữ Hán (để tách âm tiết chính xác). */
export function amBoi(py, s = '') {
  if (!py) return '';
  const key = py + '|' + s;
  if (cache.has(key)) return cache.get(key);
  const n = [...s].filter(c => /[㐀-鿿]/.test(c)).length;
  let syl = n ? splitPy(py, n) : null;
  if (!syl) {
    // Không biết số chữ: tách theo dấu cách, mỗi cụm thử 1–4 âm tiết
    syl = py.split('/')[0].trim().split(/[\s']+/).flatMap(chunk => {
      for (let k = 1; k <= 4; k++) { const r = splitPy(chunk, k); if (r) return r; }
      return [parseSyl(chunk)];
    });
  }
  const out = syl.map(sylAmBoi).join(' ').replace(/ r/g, 'r');
  cache.set(key, out);
  return out;
}
