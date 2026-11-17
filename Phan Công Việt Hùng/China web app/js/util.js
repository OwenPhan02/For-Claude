import { store } from './store.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Lấy chữ theo chế độ giản/phồn. obj có dạng { s, t } (t bỏ trống = giống s). */
export const hz = obj => (store.get().settings.script === 't' ? (obj.t || obj.s) : obj.s);

/** Nút loa: data-say chứa chữ giản thể để TTS đọc. */
export const speakBtn = (text, title = 'Nghe') =>
  `<button type="button" class="speak" data-say="${esc(text)}" title="${esc(title)}" aria-label="${esc(title)}">🔊</button>`;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const sample = (arr, n) => shuffle(arr).slice(0, n);

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

const TONE_MARKS = { 1: 'āēīōūǖĀĒĪŌŪǕ', 2: 'áéíóúǘÁÉÍÓÚǗ', 3: 'ǎěǐǒǔǚǍĚǏǑǓǙ', 4: 'àèìòùǜÀÈÌÒÙǛ' };
/** Đoán thanh điệu của một âm tiết pinyin có dấu (0 = thanh nhẹ). */
export function toneOf(syl) {
  for (const [t, marks] of Object.entries(TONE_MARKS)) if ([...syl].some(c => marks.includes(c))) return +t;
  return 0;
}
/** Tô màu từng âm tiết pinyin theo thanh điệu. */
export const colorPinyin = py => esc(py).split(/(\s+)/).map(p => (p.trim() ? `<span class="tone-${toneOf(p)}">${p}</span>` : p)).join('');

/**
 * Hiển thị câu có pinyin trên đầu bằng <ruby>.
 * tokens: [[s, t, py], ...] – mỗi phần là một từ; dấu câu để py rỗng.
 */
export function rubyLine(tokens) {
  const script = store.get().settings.script;
  return tokens.map(([s, t, py]) => {
    const text = script === 't' ? (t || s) : s;
    return py ? `<ruby>${esc(text)}<rt>${esc(py)}</rt></ruby>` : esc(text);
  }).join('');
}
export const plainLine = tokens => tokens.map(([s]) => s).join('');
