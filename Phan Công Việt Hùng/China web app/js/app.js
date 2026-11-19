import { store } from './store.js';
import { speak } from './speech.js';
import { t, LANGS, lang } from './i18n.js';
import { cloudEnabled, onUser } from './cloud.js';
import { petals } from './fx.js';
import { renderInstallBar } from './installbar.js';

// Mỗi trang là một module có hàm render(el, params). Tải khi cần.
const routes = [
  { re: /^\/?$/, nav: 'home', load: () => import('./views/home.js') },
  { re: /^\/try$/, nav: 'home', load: () => import('./views/home.js') },
  { re: /^\/pinyin$/, nav: 'pinyin', load: () => import('./views/pinyin.js') },
  { re: /^\/lessons$/, nav: 'lessons', load: () => import('./views/lessons.js') },
  { re: /^\/lesson\/([\w-]+)(?:\/(\w+))?$/, nav: 'lessons', load: () => import('./views/lesson.js'), keys: ['id', 'tab'] },
  { re: /^\/daily$/, nav: 'daily', load: () => import('./views/daily.js') },
  { re: /^\/progress$/, nav: 'progress', load: () => import('./views/progress.js') },
  { re: /^\/review$/, nav: 'review', load: () => import('./views/review.js') },
  { re: /^\/explore$/, nav: 'explore', load: () => import('./views/explore.js') },
  { re: /^\/test$/, nav: 'home', load: () => import('./views/test.js') },
  { re: /^\/game\/(\w+)$/, nav: 'explore', load: () => import('./views/game.js'), keys: ['id'] },
  { re: /^\/culture(?:\/([\w-]+))?$/, nav: 'explore', load: () => import('./views/culture.js'), keys: ['id'] },
  { re: /^\/songs(?:\/([\w-]+))?$/, nav: 'explore', load: () => import('./views/songs.js'), keys: ['id'] },
  { re: /^\/radicals$/, nav: 'explore', load: () => import('./views/radicals.js') },
  { re: /^\/account$/, nav: 'account', load: () => import('./views/account.js') },
  { re: /^\/exam(?:\/(\d))?$/, nav: 'explore', load: () => import('./views/exam.js'), keys: ['level'] },
  { re: /^\/legal(?:\/(\w+))?$/, nav: 'legal', load: () => import('./views/legal.js'), keys: ['doc'] },
];

const app = document.getElementById('app');
let cleanup = null;

async function router() {
  const path = location.hash.replace(/^#/, '').split('?')[0] || '/';
  const route = routes.find(r => r.re.test(path));
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  window.speechSynthesis?.cancel();
  document.getElementById('mainnav').classList.remove('open');

  closeSheet();
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === route?.nav));
  // Nút "Thêm" sáng lên khi đang ở trang không có trên thanh dưới
  const shown = [...document.querySelectorAll('#tabbar [data-nav]')].filter(a => a.offsetParent).map(a => a.dataset.nav);
  document.getElementById('moreBtn').classList.toggle('active', !!route && !shown.includes(route.nav));
  if (!route) {
    app.innerHTML = `<div class="card"><h2>Không tìm thấy trang</h2><p><a href="#/">← Về trang chủ</a></p></div>`;
    return;
  }
  const m = path.match(route.re);
  const params = {};
  (route.keys || []).forEach((k, i) => (params[k] = m[i + 1]));
  // Chỉ chạy hiệu ứng khi đổi sang trang khác (đổi tab trong cùng bài thì nhẹ hơn)
  const pageKey = path.split('/').slice(0, 3).join('/');
  const newPage = pageKey !== lastPage;
  lastPage = pageKey;
  try {
    const modP = route.load();
    if (newPage && app.childElementCount && !reduceMotion()) {
      app.classList.add('page-leave');
      await new Promise(r => setTimeout(r, 140));
    }
    const mod = await modP;
    cleanup = await mod.render(app, params);
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="card"><h2>Có lỗi khi tải trang</h2><pre class="small">${String(err.message)}</pre></div>`;
  }
  app.classList.remove('page-leave');
  animateIn();
  if (newPage) window.scrollTo(0, 0);
}

// ----- Tự chọn bố cục theo khung máy -----
// Màn ≤1100px, màn cảm ứng, hoặc thanh trên không đủ chỗ cho menu → dùng thanh điều hướng dưới đáy.
const root = document.documentElement;
function fitLayout() {
  const want = innerWidth <= 1100 || matchMedia('(pointer: coarse)').matches;
  if (want) { root.classList.add('compact'); return; }
  root.classList.remove('compact');
  const bar = document.querySelector('.topbar');
  const name = bar.querySelector('.brand-name');
  if (bar.scrollWidth > bar.clientWidth + 1 || (name && name.scrollWidth > name.clientWidth + 1)) root.classList.add('compact');
}
let fitTimer;
const refit = () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitLayout, 80); };
addEventListener('resize', refit);
addEventListener('orientationchange', refit);
document.fonts?.ready.then(fitLayout);

// ----- Bảng "Thêm" (điện thoại / máy tính bảng): mục phụ + cài đặt -----
const sheet = document.getElementById('sheet');
function closeSheet() {
  if (sheet.hidden || sheet.classList.contains('closing')) return;
  sheet.classList.add('closing');
  setTimeout(() => { sheet.hidden = true; sheet.classList.remove('closing'); }, 220);
}
function syncSheet() {
  const st = store.get().settings;
  const sl = document.getElementById('sheetLang');
  if (!sl.options.length) sl.innerHTML = langSel.innerHTML;
  sl.value = langSel.value;
  sheet.querySelectorAll('[data-script2]').forEach(b => b.classList.toggle('on', b.dataset.script2 === st.script));
  document.getElementById('sheetPetal').classList.toggle('on', st.petals !== false);
  const dark = document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  document.getElementById('sheetTheme').classList.toggle('on', dark);
}
function openSheet(focusFont) {
  syncSheet();
  sheet.hidden = false;
  if (focusFont) requestAnimationFrame(() => {
    const row = document.getElementById('fontRow');
    row.scrollIntoView({ block: 'center' });
    row.classList.remove('flash-hint'); void row.offsetWidth; row.classList.add('flash-hint');
  });
}
document.getElementById('moreBtn').addEventListener('click', () => (sheet.hidden ? openSheet() : closeSheet()));
document.getElementById('fontBtn').addEventListener('click', () => (sheet.hidden ? openSheet(true) : closeSheet()));

// ----- Cỡ chữ (cho người lớn tuổi, mắt kém) -----
const FONT_STEPS = [1, 1.1875, 1.375, 1.5625, 1.75];      // 16 · 19 (mặc định) · 22 · 25 · 28 px
const OLD_STEPS = { 1: [1, 1.0625, 1.1875, 1.3125, 1.4375], 2: [1.0625, 1.1875, 1.375, 1.625, 1.875] };
function applyFont() {
  const st = store.get().settings;
  let v = st.fontScale || 1.1875;
  if (st.fontScale && st.fontV !== 3) {                                  // chuyển lựa chọn cũ sang mức mới tương ứng (1 lần)
    const i = (OLD_STEPS[st.fontV] || OLD_STEPS[1]).indexOf(v);
    v = i >= 0 ? FONT_STEPS[i] : 1.1875;
    store.setSetting('fontScale', v);
    store.setSetting('fontV', 3);
  }
  root.style.setProperty('--fs', v);
  const names = t('set.fs').split('|');
  const k = FONT_STEPS.indexOf(v);
  document.getElementById('fsOpts').innerHTML = FONT_STEPS.map((f, i) =>
    `<button type="button" data-fs="${f}" class="${f === v ? 'on' : ''}" style="font-size:${Math.round(13 + i * 3.5)}px" aria-label="${names[i]}" title="${names[i]}">A</button>`).join('');
  document.getElementById('fsLabel').textContent = names[k >= 0 ? k : 1];
  refit();
}
document.getElementById('fsOpts').addEventListener('click', e => {
  const b = e.target.closest('[data-fs]');
  if (!b) return;
  store.setSetting('fontScale', +b.dataset.fs);
  store.setSetting('fontV', 3);
  applyFont();
});
sheet.addEventListener('click', e => {
  if (e.target === sheet || e.target.closest('a')) return closeSheet();
  const sc = e.target.closest('[data-script2]');
  if (sc) document.querySelector(`button[data-script="${sc.dataset.script2}"]`).click();
  if (e.target.closest('#sheetPetal')) document.getElementById('petalBtn').click();
  if (e.target.closest('#sheetTheme')) document.getElementById('themeBtn').click();
  syncSheet();
});
document.getElementById('sheetLang').addEventListener('change', e => {
  langSel.value = e.target.value;
  langSel.dispatchEvent(new Event('change'));
  syncSheet();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

// ----- Hoạt ảnh chuyển trang -----
let lastPage = null;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAGGER = '.grid > *, .vocab-list > *, .badge-grid > *, .hanzi-grid > *';
function animateIn() {
  app.classList.remove('page-enter');
  void app.offsetWidth; // khởi động lại animation
  app.querySelectorAll(STAGGER).forEach((n, i) => n.style.setProperty('--i', Math.min(i, 14)));
  app.classList.add('page-enter');
}

// Gợn sóng khi bấm nút
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn, .opt, .tabs a');
  if (!b || b.disabled || reduceMotion()) return;
  const r = b.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  b.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
});

// ----- Ngôn ngữ giao diện (tên app đổi theo) -----
const langSel = document.getElementById('langSel');
langSel.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.label}</option>`).join('');
function applyLang() {
  const l = lang();
  langSel.value = l;
  document.documentElement.lang = l === 'zh' ? 'zh' : l;
  document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  document.title = `${t('appName')} – HSK 1–6`;
  document.getElementById('themeBtn').title = t('theme');
  document.querySelector('button[data-script="s"]').title = t('simp');
  document.querySelector('button[data-script="t"]').title = t('trad');
}
langSel.addEventListener('change', () => { store.setSetting('lang', langSel.value); applyLang(); applyFont(); renderInstallBar(); fitLayout(); router(); });

// ----- Hoa mai rơi (bật/tắt) -----
const petalBtn = document.getElementById('petalBtn');
function applyPetals() {
  const on = store.get().settings.petals !== false;
  petals(on);
  petalBtn.classList.toggle('off', !on);
  petalBtn.title = on ? 'Tắt hoa mai rơi' : 'Bật hoa mai rơi';
}
petalBtn.addEventListener('click', () => { store.setSetting('petals', store.get().settings.petals === false); applyPetals(); });

// ----- Giản thể / phồn thể -----
function applyScript() {
  const s = store.get().settings.script;
  document.documentElement.dataset.script = s;
  document.querySelectorAll('[data-script]').forEach(b => b.classList.toggle('on', b.dataset.script === s));
}
document.querySelectorAll('button[data-script]').forEach(b => b.addEventListener('click', () => {
  if (store.get().settings.script === b.dataset.script) return;
  store.setSetting('script', b.dataset.script);
  applyScript();
  applyLang();
  router(); // vẽ lại trang hiện tại với loại chữ mới
}));

// ----- Sáng / tối -----
function applyTheme() {
  const t = store.get().settings.theme;
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}
document.getElementById('themeBtn').addEventListener('click', () => {
  const cur = store.get().settings.theme;
  const dark = cur === 'dark' || (cur === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  store.setSetting('theme', dark ? 'light' : 'dark');
  applyTheme();
});

document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('mainnav').classList.toggle('open'));

// ----- Nút loa dùng chung -----
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.preventDefault(); e.stopPropagation(); speak(b.dataset.say, { rate: +(b.dataset.rate || 0.85) }); }
});

applyScript();
applyTheme();
applyLang();
applyPetals();
applyFont();
renderInstallBar();
fitLayout();

// Nút tài khoản (chỉ hiện khi đã cấu hình Firebase)
const acctBtn = document.getElementById('acctBtn');
if (cloudEnabled()) {
  acctBtn.classList.remove('hidden');
  onUser(u => {
    acctBtn.textContent = u ? `👤 ${(u.displayName || u.email || '').split('@')[0].slice(0, 14)}` : t('login');
    acctBtn.classList.toggle('primary', !u);
    refit();
  });
}
window.addEventListener('hashchange', router);
router();
