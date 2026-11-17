import { store, rankOf, DAILY_XP_CAP } from '../store.js';
import { esc, hz } from '../util.js';
import { HSK1 } from '../data/hsk1.js';

export function render(el) {
  const st = store.get();
  const rank = rankOf(st.xp);
  const l1 = HSK1[0];
  const l1p = st.lessons[l1.id]?.parts || {};
  const steps = [
    { done: st.toneBest > 0 || st.pinyinSeen.length >= 5, text: 'Nghe và phân biệt 4 thanh điệu', href: '#/pinyin' },
    { done: !!l1p.vocab, text: 'Học phần Từ vựng của HSK 1 · Bài 1', href: `#/lesson/${l1.id}/vocab` },
    { done: store.dailyDone(), text: 'Làm Thử thách 5 câu', href: '#/daily' },
  ];
  const dailyPct = Math.round((st.dailyXpToday / DAILY_XP_CAP) * 100);

  el.innerHTML = `
    <section class="hero">
      <div class="eyebrow">⚡ Miễn phí · khoảng 10–15 phút</div>
      <h1>Bạn đang ở trình độ nào?</h1>
      <p>Làm bài test năng lực HSK 1 → HSK 6: biết ngay trình độ hiện tại và nhận lộ trình học dành riêng cho bạn.</p>
      <div class="levels">${[1, 2, 3, 4, 5, 6].map(n => `<span>HSK ${n}</span>`).join('')}</div>
      <button class="btn" disabled title="Đang xây dựng">🧭 Làm bài test (sắp có)</button>
      <div class="hero-badge zh">${hz({ s: '级', t: '級' })}?</div>
    </section>

    <section class="card welcome">
      <div>
        <div class="eyebrow">Miễn phí</div>
        <h2 style="font-size:clamp(1.4rem,3vw,2rem)">Học thử miễn phí – bắt đầu ngay</h2>
        <p class="muted">Không cần đăng ký: Pinyin, HSK 1 bài 1 và thử thách mỗi ngày đã mở sẵn. Chữ Hán có cả giản thể / phồn thể (nút <b class="zh">简 / 繁</b> ở góc trên) và âm Hán Việt.</p>
        <div class="row">
          <a class="btn primary" href="#/pinyin">🔤 Bắt đầu từ Pinyin</a>
          <a class="btn" href="#/lesson/${l1.id}">📖 Vào bài 1</a>
        </div>
      </div>
      <div class="welcome-art" aria-hidden="true">${artSvg()}</div>
    </section>

    <section class="card">
      <div class="row spread" style="margin-bottom:10px">
        <div class="row"><b>Hôm nay</b><span class="pill red zh" title="${esc(rank.vi)}">${esc(rank.zh)}</span><span class="muted small">${esc(rank.vi)} · Tổng XP: ${st.xp}</span></div>
        <span class="pill gold">🔥 ${st.streak} ngày liên tiếp</span>
      </div>
      <div class="row spread small muted"><span>Thử thách hôm nay</span><span><b>${st.dailyXpToday}</b> / ${DAILY_XP_CAP} XP</span></div>
      <div class="xpbar" style="margin:4px 0 16px"><span style="width:${dailyPct}%"></span></div>
      <div class="grid grid-3">
        <div class="tile">
          <div class="tile-icon">⚡</div>
          <div class="tile-body"><b>Thử thách 5 câu hôm nay</b><span class="muted small">${store.dailyDone() ? 'Đã hoàn thành ✓ – làm lại để luyện thêm' : '5 câu trắc nghiệm, ~2 phút, tối đa +20 XP'}</span></div>
          <a class="btn small primary" href="#/daily">${store.dailyDone() ? 'Luyện' : 'Làm ngay'}</a>
        </div>
        <div class="tile">
          <div class="tile-icon zh">${hz({ s: '听', t: '聽' })}</div>
          <div class="tile-body"><b>Nghe – giành thẻ</b><span class="muted small">Nghe đọc, nhanh tay chọn đúng chữ</span></div>
          <span class="pill">Sắp có</span>
        </div>
        <div class="tile">
          <div class="tile-icon zh">${hz({ s: '龙', t: '龍' })}</div>
          <div class="tile-body"><b>Nối chữ 接龙</b><span class="muted small">Chữ cuối thành chữ đầu – nối càng dài càng tốt</span></div>
          <span class="pill">Sắp có</span>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;margin-top:10px"><a href="#/progress" class="small">Thành tích & huy hiệu →</a></div>
    </section>

    <section class="card">
      <h3>3 bước đầu tiên</h3>
      <ul class="steps">
        ${steps.map(s => `<li class="${s.done ? 'done' : ''}"><span class="check">${s.done ? '✓' : ''}</span><a href="${s.href}" style="color:inherit"><span>${esc(s.text)}</span></a></li>`).join('')}
      </ul>
    </section>

    <section class="grid grid-2" style="margin-bottom:20px">
      <a class="card tile" href="#/pinyin" style="margin:0;color:inherit;text-decoration:none">
        <div class="tile-icon" style="font-family:inherit">ā</div>
        <div class="tile-body"><span class="pill jade">Miễn phí</span> <span class="pill">Dành cho người mới</span>
          <b style="margin-top:4px">Pinyin & 4 thanh điệu</b><span class="muted small">Thanh mẫu, vận mẫu, mẹo phát âm cho người Việt, luyện nghe thanh điệu</span></div>
      </a>
      <a class="card tile" href="#/lesson/${l1.id}" style="margin:0;color:inherit;text-decoration:none">
        <div class="tile-icon">HSK<br>1</div>
        <div class="tile-body"><span class="pill jade">Miễn phí</span>
          <b style="margin-top:4px">HSK 1 · Bài 1 – <span class="zh">${esc(hz(l1.title))}</span> (${esc(l1.vi)})</b>
          <span class="muted small">Từ vựng, ngữ pháp, chữ Hán, đọc, nghe và 10 câu kiểm tra</span></div>
      </a>
    </section>

    <section class="card">
      <div class="row spread"><h3 style="margin:0">Văn hóa & bài hát</h3><span class="pill">Đang soạn</span></div>
      <p class="muted small">Sắp có: Tết Nguyên đán, văn hóa trà, phép lịch sự khi ăn uống… và học tiếng Trung qua các bài hát thiếu nhi dân gian như
        <span class="zh">${esc(hz({ s: '两只老虎', t: '兩隻老虎' }))}</span> (Hai con hổ), <span class="zh">${esc(hz({ s: '小星星' }))}</span> (Ngôi sao nhỏ).</p>
    </section>`;
}

function artSvg() {
  // Tranh minh họa đơn giản: cổng đình, mặt trời, đèn lồng
  return `<svg viewBox="0 0 320 200" width="100%" height="100%" role="img" aria-label="Minh họa">
    <circle cx="250" cy="55" r="28" fill="var(--gold)" opacity=".85"/>
    <path d="M0 170 Q80 120 160 165 T320 150 V200 H0Z" fill="var(--jade)" opacity=".35"/>
    <g fill="var(--red)">
      <rect x="70" y="70" width="180" height="12" rx="4"/>
      <path d="M55 64 Q160 40 265 64 L258 72 Q160 52 62 72Z"/>
      <rect x="95" y="82" width="12" height="90"/><rect x="213" y="82" width="12" height="90"/>
      <rect x="88" y="100" width="144" height="8" rx="3"/>
    </g>
    <g>
      <line x1="40" y1="0" x2="40" y2="30" stroke="var(--muted)"/>
      <ellipse cx="40" cy="48" rx="16" ry="20" fill="var(--red)"/>
      <rect x="34" y="66" width="12" height="5" fill="var(--gold)"/>
      <text x="40" y="54" font-size="16" text-anchor="middle" fill="#ffd166" font-family="Noto Sans SC">福</text>
    </g>
  </svg>`;
}
