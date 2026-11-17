import { TONES, INITIALS, FINALS, RULES, TONE_DRILL } from '../data/pinyin.js';
import { store } from '../store.js';
import { esc, speakBtn, shuffle, toast, colorPinyin } from '../util.js';
import { runQuiz } from '../quiz.js';
import { canSpeak, hasZhVoice } from '../speech.js';

const contourSvg = (pts, n) => `
  <svg viewBox="0 0 100 60" aria-hidden="true">
    ${[5, 17.5, 30, 42.5, 55].map(y => `<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width=".6"/>`).join('')}
    <polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--t${n})" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const chip = it => `
  <button type="button" class="chip" data-chip="${esc(it.p)}" data-say="${esc(it.say)}" title="${esc(it.tip)}">
    <b>${esc(it.p)}</b><small>${esc(it.ex)} <span class="zh">${esc(it.say)}</span></small>
  </button>`;

const section = (groups, id) => groups.map(g => `
  <div style="margin-bottom:14px">
    <div class="muted small" style="font-weight:700;margin-bottom:6px">${esc(g.group)}</div>
    <div class="chips">${g.items.map(chip).join('')}</div>
  </div>`).join('') + `<div class="tipbox" id="${id}-tip">👆 Bấm vào từng âm để nghe ví dụ và xem mẹo phát âm.</div>`;

export function render(el) {
  const voiceWarn = !canSpeak()
    ? '<div class="tipbox" style="margin-bottom:16px">⚠️ Trình duyệt này không hỗ trợ phát âm. Hãy dùng Chrome, Edge hoặc Safari.</div>'
    : '';

  el.innerHTML = `
    <div class="eyebrow">Nhập môn</div>
    <h1>Pinyin – cách đọc tiếng Trung</h1>
    <p class="muted">Pinyin (拼音) là bảng chữ Latin ghi lại cách đọc chữ Hán. Mỗi âm tiết = <b>thanh mẫu</b> (phụ âm đầu) + <b>vận mẫu</b> (vần) + <b>thanh điệu</b>.
      Ví dụ: <b>h</b> + <b>ǎo</b> = hǎo <span class="zh">好</span>. Tin vui cho người Việt: tiếng Việt cũng có thanh điệu và rất nhiều âm giống nhau!</p>
    ${voiceWarn}
    <div id="noVoice"></div>

    <section class="card">
      <h2>1. Bốn thanh điệu + thanh nhẹ</h2>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
        ${TONES.map(t => `
          <div class="tone-card">
            ${contourSvg(t.contour, t.n)}
            <div class="big tone-${t.n}">${t.mark}</div>
            <div class="small"><span class="zh">${t.say}</span> · ${esc(t.vi)}</div>
            <div class="small" style="font-weight:700;margin:6px 0">${esc(t.name)}</div>
            ${speakBtn(t.say)}
            <p class="small muted" style="margin:8px 0 0;text-align:left">${esc(t.tip)}</p>
          </div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:12px">Màu thanh điệu dùng trong cả app:
        <b class="tone-1">thanh 1</b> · <b class="tone-2">thanh 2</b> · <b class="tone-3">thanh 3</b> · <b class="tone-4">thanh 4</b> · <b class="tone-0">thanh nhẹ</b></p>
    </section>

    <section class="card">
      <div class="row spread"><h2 style="margin:0">2. Luyện nghe thanh điệu</h2><span class="pill gold">Kỷ lục: ${store.get().toneBest}/10</span></div>
      <p class="muted small">Máy đọc một chữ, bạn chọn đúng thanh. 10 câu, mỗi câu đúng +1 XP.</p>
      <div id="drill"><button type="button" class="btn primary" id="startDrill">▶ Bắt đầu luyện</button></div>
    </section>

    <section class="card">
      <h2>3. Thanh mẫu (phụ âm đầu)</h2>
      <p class="muted small">Cặp quan trọng nhất với người Việt: <b>không bật hơi</b> (b d g j zh z) và <b>bật hơi</b> (p t k q ch c). Đặt tờ giấy trước miệng: âm bật hơi làm giấy rung.</p>
      ${section(INITIALS, 'ini')}
    </section>

    <section class="card">
      <h2>4. Vận mẫu (vần)</h2>
      ${section(FINALS, 'fin')}
    </section>

    <section class="card">
      <h2>5. Quy tắc cần nhớ</h2>
      <div class="grid grid-2">
        ${RULES.map(r => `<div class="tipbox"><b>${esc(r.t)}</b><br>${esc(r.d)}</div>`).join('')}
      </div>
      <div class="row" style="margin-top:16px;justify-content:flex-end">
        <a class="btn primary" href="#/lesson/hsk1-1">Học HSK 1 · Bài 1 →</a>
      </div>
    </section>`;

  // Cảnh báo nếu máy chưa có giọng tiếng Trung
  setTimeout(() => {
    if (canSpeak() && !hasZhVoice()) {
      el.querySelector('#noVoice').innerHTML = `<div class="tipbox" style="margin-bottom:16px">⚠️ Máy của bạn chưa có giọng đọc tiếng Trung, âm thanh có thể sai.
        Trên Windows: Cài đặt → Thời gian & ngôn ngữ → Giọng nói → thêm giọng <b>Chinese (Simplified)</b>. Trên điện thoại thường đã có sẵn.</div>`;
    }
  }, 800);

  // Bấm chip: hiện mẹo + đánh dấu đã nghe
  el.querySelectorAll('[data-chip]').forEach(b => b.addEventListener('click', () => {
    const all = [...INITIALS, ...FINALS].flatMap(g => g.items);
    const it = all.find(x => x.p === b.dataset.chip);
    const box = b.closest('section').querySelector('.tipbox');
    box.innerHTML = `<b style="font-size:1.1rem">${esc(it.p)}</b> — ${esc(it.tip)}. Ví dụ: ${colorPinyin(it.ex)} <span class="zh">${esc(it.say)}</span>`;
    store.seePinyin(it.p);
  }));

  el.querySelector('#startDrill').addEventListener('click', () => startDrill(el.querySelector('#drill')));
}

function startDrill(box) {
  const names = ['Thanh 1 ˉ', 'Thanh 2 ˊ', 'Thanh 3 ˇ', 'Thanh 4 ˋ'];
  const qs = shuffle(TONE_DRILL).slice(0, 10).map(group => {
    const k = Math.floor(Math.random() * 4);
    const [ch, py] = group[k];
    return {
      label: 'Chữ này mang thanh mấy?', say: ch, autoplay: true,
      options: names, answer: k,
      explain: `<span class="zh">${ch}</span> ${colorPinyin(py)} · cả nhóm: ${group.map(([c, p]) => `<span class="zh">${c}</span> ${colorPinyin(p)}`).join(' · ')}`,
    };
  });
  // Giữ thứ tự đáp án Thanh 1→4 cho dễ chọn: chặn việc trộn bằng cách gắn cờ
  qs.forEach(q => (q.keepOrder = true));
  runQuiz(box, qs, {
    title: 'Luyện thanh điệu',
    onFinish(score) {
      store.setToneBest(score);
      const got = store.addXp(score);
      toast(`+${got} XP`);
      return `<p class="muted">+${got} XP</p>`;
    },
  });
}
