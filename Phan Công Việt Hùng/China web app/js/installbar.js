// Thanh "Học trên điện thoại / Cài app" ở đầu trang (PWA).
import { lang } from './i18n.js';

const SITE = 'https://welcome-to-china-vn.web.app';
const KEY = 'zwzl.installHide';
const QR_LIB = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';

const TXT = {
  vi: {
    desk: 'Học trên điện thoại: quét mã QR để mở <b>Tự học Tiếng Trung</b> và cài app.',
    mob: 'Cài <b>Tự học Tiếng Trung</b> lên điện thoại để mở nhanh như một app.',
    openPhone: 'Mở trên điện thoại', installPc: 'Cài lên máy tính', installApp: 'Cài app', close: 'Đóng',
    qrTitle: 'Quét mã để mở trên điện thoại',
    qrDesc: 'Mở camera điện thoại, hướng vào mã QR rồi bấm vào đường dẫn hiện ra. Sau đó chọn "Thêm vào màn hình chính" để cài app.',
    howTitle: 'Cách cài app',
    howPc: 'Trên Chrome / Edge: bấm biểu tượng cài đặt (⊕ hoặc 🖥️) ở cuối thanh địa chỉ, hoặc mở menu ⋮ → "Cài đặt Tự học Tiếng Trung".',
    howIos: 'Trên iPhone / iPad (Safari): bấm nút Chia sẻ <b>⬆︎</b> → "Thêm vào MH chính".',
    howAndroid: 'Trên Android (Chrome): mở menu ⋮ → "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".',
    done: 'Đã cài xong! Bạn có thể mở app từ màn hình chính.',
  },
  en: {
    desk: 'Learn on your phone: scan the QR code to open <b>Self-study Chinese</b> and install the app.',
    mob: 'Install <b>Self-study Chinese</b> on your phone to open it like an app.',
    openPhone: 'Open on phone', installPc: 'Install on computer', installApp: 'Install app', close: 'Close',
    qrTitle: 'Scan to open on your phone',
    qrDesc: 'Point your phone camera at the QR code and tap the link. Then choose "Add to Home Screen" to install.',
    howTitle: 'How to install',
    howPc: 'Chrome / Edge: click the install icon (⊕ or 🖥️) at the end of the address bar, or menu ⋮ → "Install Self-study Chinese".',
    howIos: 'iPhone / iPad (Safari): tap Share <b>⬆︎</b> → "Add to Home Screen".',
    howAndroid: 'Android (Chrome): menu ⋮ → "Install app" or "Add to Home screen".',
    done: 'Installed! Open the app from your home screen.',
  },
  zh: {
    desk: '在手机上学习：扫描二维码打开<b>自学中文</b>并安装应用。',
    mob: '把<b>自学中文</b>安装到手机上，像应用一样快速打开。',
    openPhone: '在手机上打开', installPc: '安装到电脑', installApp: '安装应用', close: '关闭',
    qrTitle: '扫码在手机上打开',
    qrDesc: '用手机相机对准二维码，点击出现的链接，然后选择"添加到主屏幕"即可安装。',
    howTitle: '安装方法',
    howPc: 'Chrome / Edge：点击地址栏末尾的安装图标（⊕ 或 🖥️），或菜单 ⋮ →"安装自学中文"。',
    howIos: 'iPhone / iPad（Safari）：点击分享 <b>⬆︎</b> →"添加到主屏幕"。',
    howAndroid: 'Android（Chrome）：菜单 ⋮ →"安装应用"或"添加到主屏幕"。',
    done: '安装完成！可以从主屏幕打开应用。',
  },
};
const tx = k => (TXT[lang()] || TXT.vi)[k];

let deferred = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { deferred = null; hideBar(true); });

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

function hidden() {
  try { return Date.now() < +(localStorage.getItem(KEY) || 0); } catch { return false; }
}
function hideBar(forever) {
  try { localStorage.setItem(KEY, String(Date.now() + (forever ? 3650 : 14) * 864e5)); } catch {}
  const bar = document.getElementById('installBar');
  if (!bar) return;
  bar.classList.add('closing');
  setTimeout(() => bar.remove(), 300);
}

function modal(html) {
  const m = document.createElement('div');
  m.className = 'modal-back';
  m.innerHTML = `<div class="modal card" role="dialog" aria-modal="true">${html}
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn" data-close>${tx('close')}</button></div></div>`;
  const close = () => { m.classList.add('closing'); setTimeout(() => m.remove(), 200); };
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  document.body.appendChild(m);
  return m;
}

function loadQr() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  return new Promise((ok, bad) => {
    const s = document.createElement('script');
    s.src = QR_LIB; s.onload = () => ok(window.qrcode); s.onerror = bad;
    document.head.appendChild(s);
  });
}

async function showQr() {
  const url = location.hostname === 'localhost' ? SITE : location.origin;
  const m = modal(`<h3>${tx('qrTitle')}</h3><div class="qr-box" id="qrBox">…</div>
    <p class="small muted" style="text-align:center;margin:6px 0 0"><a href="${url}" target="_blank" rel="noopener">${url.replace('https://', '')}</a></p>
    <p class="small">${tx('qrDesc')}</p>`);
  try {
    const qrcode = await loadQr();
    const q = qrcode(0, 'M'); q.addData(url); q.make();
    m.querySelector('#qrBox').innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  } catch { m.querySelector('#qrBox').textContent = url; }
}

function showHow() {
  modal(`<h3>${tx('howTitle')}</h3><ul class="small">
    ${isIOS() ? `<li>${tx('howIos')}</li>` : isMobile() ? `<li>${tx('howAndroid')}</li><li>${tx('howIos')}</li>` : `<li>${tx('howPc')}</li><li>${tx('howIos')}</li><li>${tx('howAndroid')}</li>`}
  </ul>`);
}

async function install() {
  if (deferred) {
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') hideBar(true);
  } else showHow();
}

/** Vẽ thanh cài đặt (gọi lại khi đổi ngôn ngữ). */
export function renderInstallBar() {
  document.getElementById('installBar')?.remove();
  if (isStandalone() || hidden()) return;
  const mob = isMobile();
  const bar = document.createElement('div');
  bar.id = 'installBar';
  bar.className = 'install-bar';
  bar.innerHTML = `
    <span class="ib-ico">${mob ? '📲' : '▦'}</span>
    <span class="ib-text">${mob ? tx('mob') : tx('desk')}</span>
    <span class="ib-actions">
      ${mob ? '' : `<button type="button" class="btn small jade" data-act="qr">${tx('openPhone')}</button>`}
      <button type="button" class="btn small ${mob ? 'jade' : 'ghost'}" data-act="install">${mob ? tx('installApp') : tx('installPc')}</button>
      <button type="button" class="icon-btn" data-act="close" aria-label="${tx('close')}">✕</button>
    </span>`;
  bar.addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'qr') showQr();
    else if (a === 'install') install();
    else if (a === 'close') hideBar(false);
  });
  document.body.prepend(bar);
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
