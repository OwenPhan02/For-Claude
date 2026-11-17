import { cloudEnabled, onUser, signInGoogle, signInEmail, signUpEmail, resetPassword, signOut, leaderboard, currentUser } from '../cloud.js';
import { store } from '../store.js';
import { esc, toast } from '../util.js';

const ERR = {
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/invalid-credential': 'Sai email hoặc mật khẩu.',
  'auth/wrong-password': 'Sai mật khẩu.',
  'auth/user-not-found': 'Chưa có tài khoản với email này.',
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
  'auth/too-many-requests': 'Thử quá nhiều lần, vui lòng đợi một lát.',
};
const msg = e => ERR[e?.code] || e?.message || 'Có lỗi xảy ra.';

export function render(el) {
  if (!cloudEnabled()) {
    el.innerHTML = `
      <div class="card" style="max-width:560px;margin:0 auto">
        <h1>👤 Tài khoản</h1>
        <p>Tính năng đăng nhập và bảng xếp hạng <b>đang được chuẩn bị</b>.</p>
        <p class="muted small">Hiện tại tiến độ của bạn (XP, bài đã học, thẻ ôn tập) được lưu ngay trên trình duyệt này. Khi có đăng nhập, tiến độ sẽ tự đồng bộ lên tài khoản.</p>
        <a class="btn primary" href="#/">← Về trang chủ</a>
      </div>`;
    return;
  }
  let mode = 'login';
  const unsub = onUser(u => draw(u));

  function draw(u) {
    if (u) return drawUser(u);
    el.innerHTML = `
      <div class="card" style="max-width:440px;margin:0 auto">
        <h1 style="text-align:center">${mode === 'login' ? 'Đăng nhập' : 'Đăng ký miễn phí'}</h1>
        <p class="muted small" style="text-align:center">Lưu tiến độ lên mạng để học trên nhiều thiết bị và vào bảng xếp hạng tuần.</p>
        <button type="button" class="btn" id="google" style="width:100%;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>
          Tiếp tục với Google</button>
        <div class="row" style="margin:14px 0;color:var(--muted);font-size:.8rem"><hr style="flex:1;border:0;border-top:1px solid var(--line)">hoặc<hr style="flex:1;border:0;border-top:1px solid var(--line)"></div>
        <form id="f" class="grid" style="gap:10px">
          ${mode === 'signup' ? '<input class="lang-sel" style="padding:10px 12px;border-radius:12px" name="name" placeholder="Tên hiển thị" maxlength="30" required>' : ''}
          <input class="lang-sel" style="padding:10px 12px;border-radius:12px" type="email" name="email" placeholder="Email" autocomplete="email" required>
          <input class="lang-sel" style="padding:10px 12px;border-radius:12px" type="password" name="pass" placeholder="Mật khẩu (ít nhất 6 ký tự)" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="6" required>
          <button class="btn primary" style="justify-content:center">${mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
        </form>
        <p class="small" id="err" style="color:var(--bad);min-height:1.2em"></p>
        <p class="small" style="text-align:center">
          ${mode === 'login'
            ? 'Chưa có tài khoản? <a href="#" id="sw">Đăng ký miễn phí</a> · <a href="#" id="forgot">Quên mật khẩu</a>'
            : 'Đã có tài khoản? <a href="#" id="sw">Đăng nhập</a>'}
        </p>
        <p class="muted small" style="text-align:center">Tiến độ hiện có trên máy này sẽ được giữ và đưa lên tài khoản.</p>
      </div>`;
    const err = el.querySelector('#err');
    el.querySelector('#google').addEventListener('click', () => signInGoogle().catch(e => { err.textContent = msg(e); }));
    el.querySelector('#sw').addEventListener('click', e => { e.preventDefault(); mode = mode === 'login' ? 'signup' : 'login'; draw(null); });
    el.querySelector('#forgot')?.addEventListener('click', e => {
      e.preventDefault();
      const email = el.querySelector('[name=email]').value.trim();
      if (!email) { err.textContent = 'Nhập email trước, rồi bấm "Quên mật khẩu".'; return; }
      resetPassword(email).then(() => toast('Đã gửi email đặt lại mật khẩu')).catch(e2 => { err.textContent = msg(e2); });
    });
    el.querySelector('#f').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const p = mode === 'login'
        ? signInEmail(fd.get('email'), fd.get('pass'))
        : signUpEmail(fd.get('email'), fd.get('pass'), String(fd.get('name') || '').trim());
      p.then(() => toast('Đăng nhập thành công')).catch(e2 => { err.textContent = msg(e2); });
    });
  }

  async function drawUser(u) {
    const st = store.get();
    const name = u.displayName || (u.email || '').split('@')[0];
    el.innerHTML = `
      <div class="card" style="max-width:640px;margin:0 auto">
        <div class="row spread">
          <div><h1 style="margin:0">👤 ${esc(name)}</h1><div class="muted small">${esc(u.email || '')}</div></div>
          <button type="button" class="btn small" id="out">Đăng xuất</button>
        </div>
        <p class="small muted">✓ Tiến độ đang được đồng bộ với tài khoản.</p>
      </div>
      <div class="card" style="max-width:640px;margin:0 auto">
        <div class="row spread"><h2 style="margin:0">🏆 Bảng xếp hạng tuần</h2><span class="pill gold">XP tuần này: ${st.weekXp || 0}</span></div>
        <p class="muted small">Xếp theo XP kiếm được từ thứ Hai đến Chủ nhật. Mỗi tuần làm lại từ đầu.</p>
        <div id="lb" class="muted">Đang tải…</div>
      </div>`;
    el.querySelector('#out').addEventListener('click', () => signOut().then(() => toast('Đã đăng xuất')));
    try {
      const rows = await leaderboard(20);
      const lb = el.querySelector('#lb');
      if (!lb) return;
      lb.className = '';
      lb.innerHTML = rows.length ? `<table class="simple">${rows.map((r, i) => `
        <tr style="${r.uid === currentUser()?.uid ? 'background:var(--gold-soft)' : ''}">
          <td style="width:40px;font-weight:800">${['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${esc(r.name)}</td><td style="text-align:right"><b>${r.xp}</b> XP</td></tr>`).join('')}</table>`
        : '<p class="muted">Tuần này chưa có ai – hãy là người đầu tiên!</p>';
    } catch (e) {
      const lb = el.querySelector('#lb');
      if (lb) lb.textContent = 'Không tải được bảng xếp hạng.';
      console.error(e);
    }
  }

  return unsub;
}
