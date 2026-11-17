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
  srs: {},             // 'bài:từ' -> { due, ivl (ngày), ease, reps, lapses }
  reviewed: 0,          // tổng số thẻ đã ôn
  cultureSeen: [], songsSeen: [], games: {},
  test: null,           // kết quả test trình độ gần nhất
  exams: {},            // cấp HSK -> % cao nhất của đề thi thử
  week: null, weekXp: 0, // XP trong tuần (bảng xếp hạng)
  updatedAt: 0,
  settings: { script: 's', theme: 'auto', pinyin: true, trans: true, lang: 'vi' },
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
  state.updatedAt = Date.now();
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
    const wk = weekId();
    if (state.week !== wk) { state.week = wk; state.weekXp = 0; }
    state.xp += n; state.xpToday += n; state.weekXp += n;
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
  seeCulture(id) { if (!state.cultureSeen.includes(id)) { state.cultureSeen.push(id); save(); } },
  seeSong(id) { if (!state.songsSeen.includes(id)) { state.songsSeen.push(id); save(); } },
  setGameBest(id, n) { if (n > (state.games[id] || 0)) { state.games[id] = n; save(); return true; } return false; },
  setTest(r) { state.test = r; save(); },
  setExams(e) { state.exams = e; save(); },
  setToneBest(n) { if (n > state.toneBest) { state.toneBest = n; save(); } },
  // ----- Ôn tập lặp lại ngắt quãng (kiểu SM-2 rút gọn) -----
  srsAdd(keys) {
    let n = 0;
    for (const k of keys) if (!state.srs[k]) { state.srs[k] = { due: Date.now(), ivl: 0, ease: 2.5, reps: 0, lapses: 0 }; n++; }
    if (n) save();
    return n;
  },
  /** g: 0 = Quên, 1 = Khó, 2 = Nhớ, 3 = Dễ. Trả về số ngày tới lần ôn sau. */
  srsGrade(key, g) {
    const c = state.srs[key];
    if (!c) return 0;
    const DAY = 864e5;
    if (g === 0) {
      c.lapses++; c.reps = 0; c.ivl = 0; c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = Date.now() + 10 * 60e3; // 10 phút sau hỏi lại
    } else {
      if (g === 1) c.ease = Math.max(1.3, c.ease - 0.15);
      if (g === 3) c.ease += 0.15;
      c.ivl = c.reps === 0 ? (g === 3 ? 3 : 1)
        : c.reps === 1 ? (g === 1 ? 2 : g === 3 ? 7 : 4)
        : Math.round(c.ivl * (g === 1 ? 1.2 : g === 3 ? c.ease * 1.3 : c.ease));
      c.reps++;
      c.due = Date.now() + c.ivl * DAY;
    }
    state.reviewed++;
    touchStreak();
    save();
    return c.ivl;
  },
  srsDue: () => Object.entries(state.srs).filter(([, c]) => c.due <= Date.now()).map(([k]) => k),
  srsStats() {
    const cards = Object.values(state.srs);
    return {
      total: cards.length,
      due: cards.filter(c => c.due <= Date.now()).length,
      learning: cards.filter(c => c.ivl < 7).length,
      mature: cards.filter(c => c.ivl >= 21).length,
    };
  },
  /** Thay toàn bộ dữ liệu (dùng khi tải tiến độ từ tài khoản). */
  replace(data) { state = { ...defaults(), ...data, settings: { ...state.settings } }; rollDay(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bỏ qua */ } listeners.forEach(fn => fn(state)); },
  snapshot: () => JSON.parse(JSON.stringify(state)),
  reset() { state = defaults(); save(); },
};

function touchStreak() {
  const t = today();
  if (state.lastActive === t) return;
  state.streak = state.lastActive === yesterday() ? state.streak + 1 : 1;
  state.lastActive = t;
}

/** Mã tuần dạng 2026-W47 (tuần bắt đầu thứ Hai). */
export function weekId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}

export function rankOf(xp) {
  let r = RANKS[0];
  for (const x of RANKS) if (xp >= x.xp) r = x;
  const next = RANKS[RANKS.indexOf(r) + 1];
  return { ...r, next };
}
