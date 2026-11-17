import { store, rankOf, RANKS } from '../store.js';
import { ALL_LESSONS } from '../data/lessons.js';
import { PARTS } from './lesson.js';
import { esc } from '../util.js';

export function render(el) {
  const st = store.get();
  const r = rankOf(st.xp);
  const words = ALL_LESSONS.filter(l => st.lessons[l.id]?.parts?.vocab).reduce((n, l) => n + l.vocab.length, 0);
  const lessonsDone = ALL_LESSONS.filter(l => st.lessons[l.id]?.parts?.quiz).length;
  const pct = r.next ? Math.round(((st.xp - r.xp) / (r.next.xp - r.xp)) * 100) : 100;

  const badges = [
    { ico: '🔤', name: 'Làm quen Pinyin', how: 'Nghe 10 âm pinyin', ok: st.pinyinSeen.length >= 10 },
    { ico: '🎵', name: 'Tai thính', how: 'Luyện thanh điệu đạt 8/10', ok: st.toneBest >= 8 },
    { ico: '📝', name: 'Bài đầu tiên', how: 'Hoàn thành 1 bài', ok: lessonsDone >= 1 },
    { ico: '⚡', name: 'Khởi động', how: 'Làm thử thách mỗi ngày', ok: !!st.dailyDoneOn },
    { ico: '🔥', name: 'Bền bỉ', how: 'Học 7 ngày liên tiếp', ok: st.streak >= 7 },
    { ico: '📚', name: '100 từ', how: 'Học 100 từ vựng', ok: words >= 100 },
    { ico: '🏯', name: 'Tú tài', how: 'Đạt 150 XP', ok: st.xp >= 150 },
    { ico: '🧭', name: 'Biết mình biết ta', how: 'Làm bài test trình độ', ok: !!st.test },
    { ico: '🔁', name: 'Chăm ôn', how: 'Ôn 100 thẻ', ok: (st.reviewed || 0) >= 100 },
    { ico: '🏮', name: 'Hiểu văn hóa', how: 'Đọc 5 bài văn hóa', ok: (st.cultureSeen || []).length >= 5 },
    { ico: '🎵', name: 'Ngâm thơ', how: 'Học 3 bài hát / bài thơ', ok: (st.songsSeen || []).length >= 3 },
    { ico: '🐼', name: 'Nhanh hơn gấu trúc', how: 'Đạt 7 điểm trò Nghe – giành thẻ', ok: (st.games?.grab || 0) >= 7 },
    { ico: '🐉', name: 'Rồng dài', how: 'Nối chuỗi 10 từ', ok: (st.games?.chain || 0) >= 10 },
    { ico: '🎓', name: 'Tốt nghiệp HSK 1', how: 'Hoàn thành cả 13 bài HSK 1', ok: ALL_LESSONS.filter(l => l.level === 1).every(l => st.lessons[l.id]?.parts?.quiz) },
    { ico: '👑', name: 'Trạng nguyên', how: 'Đạt 3500 XP', ok: st.xp >= 3500 },
  ];

  el.innerHTML = `
    <div class="eyebrow">Thành tích</div>
    <h1>🏆 Tiến độ của bạn</h1>
    <div class="card">
      <div class="row spread">
        <div class="row"><span class="zh" style="font-size:2rem;font-weight:700;color:var(--red)">${esc(r.zh)}</span>
          <div><b>${esc(r.vi)}</b><div class="muted small">${esc(r.py)}</div></div></div>
        <span class="muted small">${r.next ? `Còn ${r.next.xp - st.xp} XP lên <b class="zh">${esc(r.next.zh)}</b> (${esc(r.next.vi)})` : 'Cấp cao nhất!'}</span>
      </div>
      <div class="xpbar" style="margin-top:10px"><span style="width:${pct}%"></span></div>
      <p class="small muted" style="margin-bottom:0">Các cấp: ${RANKS.map(x => `<span class="zh">${x.zh}</span> ${x.vi} (${x.xp})`).join(' → ')}</p>
    </div>
    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="card stat" style="margin:0"><b>${st.xp}</b>Tổng XP</div>
      <div class="card stat" style="margin:0"><b>${st.streak}</b>Ngày liên tiếp</div>
      <div class="card stat" style="margin:0"><b>${words}</b>Từ đã học</div>
    </div>
    <div class="card">
      <h3>Bài học</h3>
      <table class="simple">
        <tr><th>Bài</th><th>Phần đã xong</th><th>Kiểm tra</th></tr>
        ${ALL_LESSONS.map(l => {
          const p = st.lessons[l.id];
          return `<tr><td><a href="#/lesson/${l.id}">HSK ${l.level} · Bài ${l.no} – ${esc(l.vi)}</a></td>
            <td>${PARTS.filter(x => p?.parts?.[x.key]).length}/${PARTS.length}</td><td>${p?.best ?? 0}/10</td></tr>`;
        }).join('')}
      </table>
    </div>
    <div class="card">
      <h3>Huy hiệu</h3>
      <div class="badge-grid">
        ${badges.map(b => `<div class="badge ${b.ok ? '' : 'locked'}"><div class="ico">${b.ico}</div><b>${esc(b.name)}</b><div class="small muted">${esc(b.how)}</div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <h3>Dữ liệu</h3>
      <p class="small muted">Tiến độ đang lưu trên trình duyệt này. Sau khi có tính năng đăng nhập, tiến độ sẽ đồng bộ giữa các thiết bị.</p>
      <button type="button" class="btn small" id="reset">Xóa toàn bộ tiến độ</button>
      <span id="confirmBox"></span>
    </div>`;

  // Xác nhận ngay trên trang, không dùng hộp thoại confirm()
  el.querySelector('#reset').addEventListener('click', () => {
    el.querySelector('#confirmBox').innerHTML = ' <span class="small">Chắc chắn?</span> <button type="button" class="btn small primary" id="yes">Xóa</button>';
    el.querySelector('#yes').addEventListener('click', () => { store.reset(); render(el); });
  });
}
