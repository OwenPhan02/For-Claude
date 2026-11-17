// Thanh "Học trên điện thoại / Cài app" ở đầu trang (PWA) + hộp hướng dẫn cài chi tiết.
import { lang } from './i18n.js';
import { toast } from './util.js';

const SITE = 'https://welcome-to-china-vn.web.app';
const KEY = 'zwzl.installHide';
const QR_LIB = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';

const TXT = {
  vi: {
    desk: 'Học trên điện thoại: quét mã QR để mở <b>Tự học Tiếng Trung</b> và cài app.',
    mob: 'Cài <b>Tự học Tiếng Trung</b> lên điện thoại để mở nhanh như một app.',
    openPhone: 'Mở trên điện thoại', installPc: 'Cài lên máy tính', installApp: 'Cài app lên điện thoại', close: 'Đóng',
    scan: 'Mở camera điện thoại, hướng vào mã QR rồi bấm vào đường link hiện ra.',
    copy: 'Sao chép link', copied: 'Đã sao chép link!',
    installed: 'Cài xong, biểu tượng <b class="zh">中</b> nằm trên màn hình chính – bấm vào là học.',
    noPrompt: 'Trình duyệt chưa cho cài tự động – làm theo hướng dẫn bên dưới nhé.',
    secs: [
      { ico: '🤖', title: 'Điện thoại Android', steps: [
        'Mở link bằng <b>Chrome</b>.',
        'Bấm nút <b>⋮</b> (3 chấm) ở góc trên bên phải màn hình.',
        'Chọn “<b>Thêm vào màn hình chính</b>” hoặc “<b>Cài đặt ứng dụng</b>”, rồi bấm “<b>Cài đặt</b>”.',
        'Trình duyệt Samsung Internet: bấm <b>≡</b> → “<b>Thêm trang vào</b>” → “<b>Màn hình chính</b>”.',
      ] },
      { ico: '🍎', title: 'iPhone / iPad', steps: [
        'Mở link bằng <b>Safari</b> (hoặc Chrome trên iOS 16.4 trở lên).',
        'Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên) – ở thanh dưới của Safari hoặc cạnh thanh địa chỉ của Chrome.',
        'Kéo xuống, chọn “<b>Thêm vào MH chính</b>” rồi bấm “<b>Thêm</b>”.',
      ] },
      { ico: '💬', title: 'Đang mở trong Zalo / Facebook / Messenger', steps: [
        'Bấm nút <b>…</b> hoặc <b>⋮</b> ở góc trên màn hình.',
        'Chọn “<b>Mở bằng trình duyệt</b>” (hoặc “Mở trong Chrome/Safari”), rồi làm theo hướng dẫn ở trên.',
      ] },
      { ico: '💻', title: 'Máy tính (Chrome / Edge)', steps: [
        'Bấm nút “<b>Cài lên máy tính</b>” ở trên.',
        'Nếu không thấy hộp cài: bấm biểu tượng <b>cài đặt</b> (màn hình có mũi tên ⤓) ở cuối thanh địa chỉ.',
        'Hoặc mở menu <b>⋮</b> → “<b>Truyền, lưu và chia sẻ</b>” → “<b>Cài đặt trang dưới dạng ứng dụng</b>” (Edge: menu <b>…</b> → “<b>Ứng dụng</b>” → “<b>Cài đặt trang web này dưới dạng ứng dụng</b>”).',
        'Trên Mac dùng Safari: menu <b>Tệp</b> → “<b>Thêm vào Dock</b>”.',
      ] },
    ],
  },
  en: {
    desk: 'Learn on your phone: scan the QR code to open <b>Self-study Chinese</b> and install the app.',
    mob: 'Install <b>Self-study Chinese</b> on your phone to open it like an app.',
    openPhone: 'Open on phone', installPc: 'Install on computer', installApp: 'Install on phone', close: 'Close',
    scan: 'Open your phone camera, point it at the QR code and tap the link that appears.',
    copy: 'Copy link', copied: 'Link copied!',
    installed: 'Done! The <b class="zh">中</b> icon is on your home screen – tap it to study.',
    noPrompt: 'Your browser can’t install automatically – follow the steps below.',
    secs: [
      { ico: '🤖', title: 'Android phone', steps: [
        'Open the link in <b>Chrome</b>.',
        'Tap <b>⋮</b> (3 dots) at the top right.',
        'Choose “<b>Add to Home screen</b>” or “<b>Install app</b>”, then tap “<b>Install</b>”.',
        'Samsung Internet: tap <b>≡</b> → “<b>Add page to</b>” → “<b>Home screen</b>”.',
      ] },
      { ico: '🍎', title: 'iPhone / iPad', steps: [
        'Open the link in <b>Safari</b> (or Chrome on iOS 16.4+).',
        'Tap <b>Share</b> (square with an up arrow) – bottom bar in Safari, next to the address bar in Chrome.',
        'Scroll down, choose “<b>Add to Home Screen</b>”, then tap “<b>Add</b>”.',
      ] },
      { ico: '💬', title: 'Opened inside Zalo / Facebook / Messenger', steps: [
        'Tap <b>…</b> or <b>⋮</b> at the top of the screen.',
        'Choose “<b>Open in browser</b>” (or “Open in Chrome/Safari”), then follow the steps above.',
      ] },
      { ico: '💻', title: 'Computer (Chrome / Edge)', steps: [
        'Click “<b>Install on computer</b>” above.',
        'If nothing appears: click the <b>install</b> icon (screen with ⤓) at the end of the address bar.',
        'Or menu <b>⋮</b> → “<b>Cast, save and share</b>” → “<b>Install page as app</b>” (Edge: <b>…</b> → “<b>Apps</b>” → “<b>Install this site as an app</b>”).',
        'Safari on Mac: <b>File</b> → “<b>Add to Dock</b>”.',
      ] },
    ],
  },
  zh: {
    desk: '在手机上学习：扫描二维码打开<b>自学中文</b>并安装应用。',
    mob: '把<b>自学中文</b>安装到手机上，像应用一样快速打开。',
    openPhone: '在手机上打开', installPc: '安装到电脑', installApp: '安装到手机', close: '关闭',
    scan: '打开手机相机，对准二维码，点击出现的链接。',
    copy: '复制链接', copied: '链接已复制！',
    installed: '安装完成，<b class="zh">中</b> 图标就在主屏幕上——点一下就能学习。',
    noPrompt: '浏览器暂时不能自动安装——请按下面的步骤操作。',
    secs: [
      { ico: '🤖', title: '安卓手机', steps: [
        '用 <b>Chrome</b> 打开链接。',
        '点右上角的 <b>⋮</b>（三个点）。',
        '选择“<b>添加到主屏幕</b>”或“<b>安装应用</b>”，再点“<b>安装</b>”。',
        '三星浏览器：点 <b>≡</b> →“<b>添加页面到</b>”→“<b>主屏幕</b>”。',
      ] },
      { ico: '🍎', title: 'iPhone / iPad', steps: [
        '用 <b>Safari</b> 打开链接（iOS 16.4 以上也可用 Chrome）。',
        '点<b>分享</b>按钮（带向上箭头的方框）——Safari 在底栏，Chrome 在地址栏旁。',
        '向下滑，选择“<b>添加到主屏幕</b>”，再点“<b>添加</b>”。',
      ] },
      { ico: '💬', title: '在 Zalo / Facebook / Messenger 里打开', steps: [
        '点屏幕上方的 <b>…</b> 或 <b>⋮</b>。',
        '选择“<b>在浏览器中打开</b>”，再按上面的步骤操作。',
      ] },
      { ico: '💻', title: '电脑（Chrome / Edge）', steps: [
        '点上面的“<b>安装到电脑</b>”。',
        '如果没有弹出：点地址栏末尾的<b>安装</b>图标（带 ⤓ 的屏幕）。',
        '或菜单 <b>⋮</b> →“<b>投放、保存和分享</b>”→“<b>将网页作为应用安装</b>”（Edge：<b>…</b> →“<b>应用</b>”→“<b>将此站点作为应用安装</b>”）。',
        'Mac 上的 Safari：<b>文件</b> →“<b>添加到程序坞</b>”。',
      ] },
    ],
  },
};
const tx = k => (TXT[lang()] || TXT.vi)[k];

let deferred = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { deferred = null; hideBar(true); });

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /Android/i.test(navigator.userAgent);
const inAppBrowser = () => /Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\//i.test(navigator.userAgent);

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

function loadQr() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  return new Promise((ok, bad) => {
    const s = document.createElement('script');
    s.src = QR_LIB; s.onload = () => ok(window.qrcode); s.onerror = bad;
    document.head.appendChild(s);
  });
}

async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  if (outcome === 'accepted') hideBar(true);
  return true;
}

/** Hộp hướng dẫn cài app (mã QR + nút cài + các bước theo thiết bị). */
async function showGuide(focus) {
  const url = location.hostname === 'localhost' ? SITE + '/' : location.origin + '/';
  const mob = isMobile();
  // Đưa hướng dẫn hợp với thiết bị đang dùng lên đầu
  let secs = [...tx('secs')];
  const first = inAppBrowser() ? 2 : isIOS() ? 1 : isAndroid() ? 0 : 3;
  secs = [secs[first], ...secs.filter((_, i) => i !== first)];

  const m = document.createElement('div');
  m.className = 'modal-back';
  m.innerHTML = `
    <div class="modal guide" role="dialog" aria-modal="true" aria-label="${tx('installPc')}">
      <button type="button" class="icon-btn guide-x" data-close aria-label="${tx('close')}">✕</button>
      ${mob ? '' : `
      <div class="guide-qr">
        <div class="qr-box" id="qrBox"></div>
        <div class="guide-qr-text">
          <p>${tx('scan')}</p>
          <div class="guide-url">${url}</div>
          <button type="button" class="btn small soft" data-copy>📋 ${tx('copy')}</button>
        </div>
      </div>`}
      <button type="button" class="btn primary guide-install" data-install>⤓ ${mob ? tx('installApp') : tx('installPc')}</button>
      <p class="guide-note hidden" id="noPrompt">${tx('noPrompt')}</p>
      ${secs.map(s => `
        <section class="guide-sec">
          <h4><span>${s.ico}</span> ${s.title}</h4>
          <ol>${s.steps.map(st => `<li>${st}</li>`).join('')}</ol>
        </section>`).join('')}
      <div class="guide-done">✅ ${tx('installed')}</div>
    </div>`;
  const close = () => { m.classList.add('closing'); setTimeout(() => m.remove(), 200); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  m.addEventListener('click', async e => {
    if (e.target === m || e.target.closest('[data-close]')) return close();
    if (e.target.closest('[data-copy]')) {
      try { await navigator.clipboard.writeText(url); } catch { /* trình duyệt chặn */ }
      toast(tx('copied'));
    }
    if (e.target.closest('[data-install]')) {
      if (!(await promptInstall())) {
        const note = m.querySelector('#noPrompt');
        note.classList.remove('hidden');
        note.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else close();
    }
  });
  document.body.appendChild(m);
  if (focus === 'install') m.querySelector('[data-install]').focus();

  if (!mob) {
    try {
      const qrcode = await loadQr();
      const q = qrcode(0, 'M'); q.addData(url); q.make();
      m.querySelector('#qrBox').innerHTML = q.createSvgTag({ cellSize: 6, margin: 1, scalable: true });
    } catch { m.querySelector('#qrBox').textContent = url; }
  }
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
      ${mob ? '' : `<button type="button" class="btn small primary" data-act="qr">${tx('openPhone')}</button>`}
      <button type="button" class="btn small ${mob ? 'primary' : 'ghost'}" data-act="install">${mob ? tx('installApp') : tx('installPc')}</button>
      <button type="button" class="icon-btn" data-act="close" aria-label="${tx('close')}">✕</button>
    </span>`;
  bar.addEventListener('click', async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'qr') showGuide();
    else if (a === 'install') { if (!(await promptInstall())) showGuide('install'); }
    else if (a === 'close') hideBar(false);
  });
  document.body.prepend(bar);
}

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
