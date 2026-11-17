// Lưu tiến độ học trong localStorage (sau này sẽ đồng bộ Firebase).
const KEY = 'zwzl.v1';
export const DAILY_XP_CAP = 20;

// Danh hiệu theo tổng XP (giống "見習い" của trang mẫu)
export const RANKS = [
  { xp: 0, zh: '新手', py: 'xīnshǒu', vi: 'Tân thủ' },
  { xp: 50, zh: '学徒', py: 'xuétú', vi: 'Học trò' },
  { xp: 150, zh: '秀才', py: 'xiùcai', vi: 'Tú tài' },
  { xp: 400, zh: '举人', py: 'jǔrén', vi: 'Cử nhân' },
  { xp: 900, zh: '进士', py: 'jìnshì', vi: 'Tiến sĩ' },
  { xp: 1800, zh: '翰林', py: 'hànlín', vi: 'Hàn lâm' },
  { xp: 3500, zh: '状元', py: 'zhuàngyuan', vi: 'Trạng nguyên' },
];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const defaults = () => ({
  xp: 0,
  day: today(), xpToday: 0, dailyXpToday: 0,
  streak: 0, lastActive: null,
  dailyDoneOn: null,
  lessons: {},          // id -> { parts: {vocab:true,...}, best: 0..10 }
  pinyinSeen: [],       // các âm đã bấm nghe
  toneBest: 0,
  settings: { script: 's', theme: 'auto', pinyin: true, trans: true },
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw), settings: { ...defaults().settings, ...JSON.parse(raw).settings } };
  } catch { /* trình duyệt chặn lưu trữ */ }
  return defaults();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bỏ qua */ }
  listeners.forEach(fn => fn(state));
}
function rollDay() {
  if (state.day !== today()) { state.day = today(); state.xpToday = 0; state.dailyXpToday = 0; }
}

export const store = {
  get: () => { rollDay(); return state; },
  subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
  setSetting(k, v) { state.settings[k] = v; save(); },

  /** Cộng XP và cập nhật chuỗi ngày học. Trả về số XP thực cộng. */
  addXp(n, { daily = false } = {}) {
    rollDay();
    if (daily) {
      n = Math.max(0, Math.min(n, DAILY_XP_CAP - state.dailyXpToday));
      state.dailyXpToday += n;
    }
    state.xp += n; state.xpToday += n;
    touchStreak();
    save();
    return n;
  },
  markPart(lessonId, part) {
    const l = state.lessons[lessonId] ||= { parts: {}, best: 0 };
    if (!l.parts[part]) { l.parts[part] = true; touchStreak(); save(); return true; }
    return false;
  },
  setBest(lessonId, score) {
    const l = state.lessons[lessonId] ||= { parts: {}, best: 0 };
    if (score > l.best) { l.best = score; save(); }
  },
  markDaily() { state.dailyDoneOn = today(); save(); },
  dailyDone: () => state.dailyDoneOn === today(),
  seePinyin(key) { if (!state.pinyinSeen.includes(key)) { state.pinyinSeen.push(key); save(); } },
  setToneBest(n) { if (n > state.toneBest) { state.toneBest = n; save(); } },
  reset() { state = defaults(); save(); },
};

function touchStreak() {
  const t = today();
  if (state.lastActive === t) return;
  state.streak = state.lastActive === yesterday() ? state.streak + 1 : 1;
  state.lastActive = t;
}

export function rankOf(xp) {
  let r = RANKS[0];
  for (const x of RANKS) if (xp >= x.xp) r = x;
  const next = RANKS[RANKS.indexOf(r) + 1];
  return { ...r, next };
}
