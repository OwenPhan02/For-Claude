import { store } from './store.js';
import { speak } from './speech.js';

// Mỗi trang là một module có hàm render(el, params). Tải khi cần.
const routes = [
  { re: /^\/?$/, nav: 'home', load: () => import('./views/home.js') },
  { re: /^\/try$/, nav: 'home', load: () => import('./views/home.js') },
  { re: /^\/pinyin$/, nav: 'pinyin', load: () => import('./views/pinyin.js') },
  { re: /^\/lessons$/, nav: 'lessons', load: () => import('./views/lessons.js') },
  { re: /^\/lesson\/([\w-]+)(?:\/(\w+))?$/, nav: 'lessons', load: () => import('./views/lesson.js'), keys: ['id', 'tab'] },
  { re: /^\/daily$/, nav: 'daily', load: () => import('./views/daily.js') },
  { re: /^\/progress$/, nav: 'progress', load: () => import('./views/progress.js') },
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

  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === route?.nav));
  if (!route) {
    app.innerHTML = `<div class="card"><h2>Không tìm thấy trang</h2><p><a href="#/">← Về trang chủ</a></p></div>`;
    return;
  }
  const m = path.match(route.re);
  const params = {};
  (route.keys || []).forEach((k, i) => (params[k] = m[i + 1]));
  try {
    const mod = await route.load();
    cleanup = await mod.render(app, params);
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="card"><h2>Có lỗi khi tải trang</h2><pre class="small">${String(err.message)}</pre></div>`;
  }
  window.scrollTo(0, 0);
}

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
window.addEventListener('hashchange', router);
router();
