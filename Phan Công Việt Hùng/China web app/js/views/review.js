import { store } from '../store.js';
import { ALL_LESSONS, getLesson } from '../data/lessons.js';
import { esc, hz, speakBtn, colorPinyin, shuffle, toast } from '../util.js';
import { speak } from '../speech.js';
import { loadWriter } from './lesson.js';
import { amBoi } from '../ambo.js';

const MODES = [
  { key: 'read', name: 'Nhìn chữ → nhớ nghĩa' },
  { key: 'listen', name: 'Nghe → nhớ chữ' },
  { key: 'recall', name: 'Nghĩa → nhớ chữ' },
];
const GRADES = [
  { g: 0, name: 'Quên', cls: 'primary' },
  { g: 1, name: 'Khó', cls: '' },
  { g: 2, name: 'Nhớ', cls: 'jade' },
  { g: 3, name: 'Dễ', cls: '' },
];

const findWord = key => {
  const i = key.indexOf(':');
  const L = getLesson(key.slice(0, i));
  return L?.vocab.find(w => w.s === key.slice(i + 1));
};

/** Thêm từ của các bài đã học xong phần Từ vựng (phòng khi thiếu). */
function syncLearned() {
  const st = store.get();
  const keys = ALL_LESSONS.filter(l => st.lessons[l.id]?.parts?.vocab).flatMap(l => l.vocab.map(w => `${l.id}:${w.s}`));
  return store.srsAdd(keys);
}

let mode = 'read';
let tab = 'cards';

export function render(el) {
  syncLearned();
  el.innerHTML = `
    <div class="eyebrow">Ôn tập</div>
    <h1>🔁 Ôn tập</h1>
    <nav class="tabs">
      <a href="#/review" data-tab="cards" class="${tab === 'cards' ? 'active' : ''}">🃏 Thẻ ôn từ vựng</a>
      <a href="#/review" data-tab="write" class="${tab === 'write' ? 'active' : ''}">🖌️ Luyện viết chữ Hán</a>
    </nav>
    <div id="rv"></div>`;
  el.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); tab = a.dataset.tab; render(el);
  }));
  const box = el.querySelector('#rv');
  return tab === 'cards' ? cards(box) : writing(box);
}

// ---------------- Thẻ ôn (SRS) ----------------
function cards(box) {
  const s = store.srsStats();
  box.innerHTML = `
    <div class="grid grid-3" style="margin-bottom:16px">
      <div class="card stat" style="margin:0"><b>${s.due}</b>Cần ôn hôm nay</div>
      <div class="card stat" style="margin:0"><b>${s.learning}</b>Đang học</div>
      <div class="card stat" style="margin:0"><b>${s.total}</b>Tổng số từ</div>
    </div>
    <div class="card">
      ${s.total === 0 ? `
        <p>Chưa có từ nào để ôn. Học xong phần <b>Từ vựng</b> của một bài (bấm "Đã học xong phần này"), từ sẽ tự vào đây.</p>
        <a class="btn primary" href="#/lesson/hsk1-1/vocab">📝 Học từ vựng bài 1</a>` : `
        <p class="muted small">Ôn đúng lúc sắp quên giúp nhớ lâu. Tự chấm mình: <b>Quên</b> (hỏi lại sau 10 phút) · <b>Khó</b> · <b>Nhớ</b> · <b>Dễ</b> (lâu hơn mới hỏi lại).</p>
        <div class="row" style="margin-bottom:12px">
          <span class="small muted">Kiểu ôn:</span>
          ${MODES.map(m => `<button type="button" class="btn small ${mode === m.key ? 'primary' : ''}" data-mode="${m.key}">${m.name}</button>`).join('')}
        </div>
        <div class="row">
          <button type="button" class="btn primary" id="start" ${s.due ? '' : 'disabled'}>▶ Ôn ${Math.min(s.due, 20)} thẻ đến hạn</button>
          <button type="button" class="btn" id="extra">➕ Ôn thêm 10 từ ngẫu nhiên</button>
        </div>`}
    </div>`;
  box.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; cards(box); }));
  box.querySelector('#start')?.addEventListener('click', () => session(box, shuffle(store.srsDue()).slice(0, 20)));
  box.querySelector('#extra')?.addEventListener('click', () => session(box, shuffle(Object.keys(store.get().srs)).slice(0, 10)));
}

function session(box, queue) {
  let i = 0, done = 0;
  const onKey = e => {
    if (!box.isConnected) { document.removeEventListener('keydown', onKey); return; }
    if (e.key === ' ' && box.querySelector('#show')) { e.preventDefault(); box.querySelector('#show').click(); }
    if (['1', '2', '3', '4'].includes(e.key)) box.querySelector(`[data-g="${+e.key - 1}"]`)?.click();
  };
  document.addEventListener('keydown', onKey);

  const draw = () => {
    if (i >= queue.length) {
      document.removeEventListener('keydown', onKey);
      const got = store.addXp(done);
      toast(`Ôn xong ${done} thẻ · +${got} XP`);
      box.innerHTML = `<div class="card result"><div style="font-size:2.5rem">🎉</div><h2>Ôn xong ${done} thẻ!</h2>
        <p class="muted">+${got} XP · Còn ${store.srsStats().due} thẻ đến hạn.</p>
        <button type="button" class="btn primary" id="back">← Quay lại</button></div>`;
      box.querySelector('#back').addEventListener('click', () => cards(box));
      return;
    }
    const key = queue[i];
    const w = findWord(key);
    if (!w) { i++; draw(); return; }
    const front = mode === 'read' ? `<div class="hz zh">${esc(hz(w))}</div>`
      : mode === 'listen' ? `<div style="font-size:3rem">🎧</div><div class="muted small">Nghe và nhớ lại chữ, nghĩa</div>`
      : `<div class="vi" style="font-size:1.4rem">${esc(w.vi)}</div><div class="muted small">Nhớ lại chữ Hán và pinyin</div>`;
    box.innerHTML = `
      <div class="card" style="max-width:520px;margin:0 auto">
        <div class="row spread small muted"><span>Thẻ ${i + 1}/${queue.length}</span>${speakBtn(w.s)}</div>
        <div class="q-prompt" style="min-height:140px;display:grid;place-items:center">${front}</div>
        <div id="back" class="hidden" style="text-align:center;border-top:1px dashed var(--line);padding-top:12px">
          <div class="zh" style="font-size:2.4rem;font-weight:700">${esc(hz(w))}</div>
          <div style="font-size:1.2rem;font-weight:700">${colorPinyin(w.py)}</div>
          <div class="ab" title="Âm bồi – đọc gần đúng">${esc(amBoi(w.py, w.s))}</div>
          <div>${esc(w.vi)}</div>
        </div>
        <div class="row" style="justify-content:center;margin-top:16px" id="actions">
          <button type="button" class="btn primary" id="show">Hiện đáp án <span class="small">(Space)</span></button>
        </div>
      </div>`;
    if (mode === 'listen') setTimeout(() => speak(w.s), 200);
    box.querySelector('#show').addEventListener('click', () => {
      box.querySelector('#back').classList.remove('hidden');
      if (mode !== 'listen') speak(w.s);
      const c = store.get().srs[key];
      box.querySelector('#actions').innerHTML = GRADES.map(g => `
        <button type="button" class="btn ${g.cls}" data-g="${g.g}">${g.name}<span class="small muted" style="display:block;font-weight:500">${preview(c, g.g)}</span></button>`).join('');
      box.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
        const g = +b.dataset.g;
        store.srsGrade(key, g);
        if (g === 0) queue.push(key); // quên thì hỏi lại cuối buổi
        else done++;
        i++; draw();
      }));
    });
  };
  draw();
}

/** Ước lượng khoảng ôn tiếp theo để hiện dưới nút. */
function preview(c, g) {
  if (!c || g === 0) return '10 phút';
  const ease = g === 1 ? Math.max(1.3, c.ease - 0.15) : g === 3 ? c.ease + 0.15 : c.ease;
  const d = c.reps === 0 ? (g === 3 ? 3 : 1) : c.reps === 1 ? (g === 1 ? 2 : g === 3 ? 7 : 4)
    : Math.round(c.ivl * (g === 1 ? 1.2 : g === 3 ? ease * 1.3 : ease));
  return d >= 30 ? `${Math.round(d / 30)} tháng` : `${d} ngày`;
}

// ---------------- Luyện viết ----------------
function writing(box) {
  const st = store.get();
  const learned = ALL_LESSONS.filter(l => Object.keys(st.lessons[l.id]?.parts || {}).length);
  const pool = (learned.length ? learned : ALL_LESSONS.slice(0, 1)).flatMap(l =>
    l.hanzi.map(c => ({ s: c.s, t: c.t, py: c.py, hv: c.hv, vi: c.vi })));
  const queue = shuffle(pool);
  let i = 0, total = 0;

  const draw = () => {
    const c = queue[i % queue.length];
    box.innerHTML = `
      <div class="card" style="max-width:520px;margin:0 auto;text-align:center">
        <p class="muted small">Viết chữ theo đúng thứ tự nét vào ô bên dưới (dùng chuột hoặc ngón tay). Sai 2 lần sẽ có gợi ý.</p>
        <div class="row" style="justify-content:center">
          <b style="font-size:1.3rem">${colorPinyin(c.py)}</b> <span class="ab">${esc(amBoi(c.py, c.s))}</span> · ${esc(c.vi)} ${speakBtn(c.s)}
        </div>
        <div id="pad" class="hanzi-box" style="width:260px;height:260px;margin:14px auto;cursor:crosshair;touch-action:none"></div>
        <div id="msg" class="small muted" style="min-height:1.5em"></div>
        <div class="row" style="justify-content:center;margin-top:10px">
          <button type="button" class="btn small" id="hint">👁 Xem mẫu</button>
          <button type="button" class="btn small primary" id="next">Chữ khác →</button>
        </div>
        <p class="small muted" style="margin-top:12px">Đã viết đúng: <b>${total}</b> chữ · Lấy chữ từ các bài bạn đã học</p>
      </div>`;
    box.querySelector('#next').addEventListener('click', () => { i++; draw(); });
    loadWriter().then(HW => {
      const pad = box.querySelector('#pad');
      if (!pad) return;
      const css = getComputedStyle(document.documentElement);
      const w = HW.create(pad, hz(c), {
        width: 260, height: 260, padding: 10, showCharacter: false, showOutline: true,
        strokeColor: css.getPropertyValue('--text').trim(), outlineColor: css.getPropertyValue('--line').trim(),
        drawingColor: css.getPropertyValue('--red').trim(), highlightColor: css.getPropertyValue('--gold').trim(),
        showHintAfterMisses: 2, drawingWidth: 18,
      });
      const msg = box.querySelector('#msg');
      w.quiz({
        onMistake: () => { msg.textContent = 'Chưa đúng nét, thử lại nhé'; },
        onCorrectStroke: d => { msg.textContent = `Đúng nét ${d.strokeNum + 1} ✓ · còn ${d.strokesRemaining} nét`; },
        onComplete: d => {
          total++;
          msg.innerHTML = `<b style="color:var(--ok)">✅ Hoàn thành!</b> Sai ${d.totalMistakes} lần.`;
          speak(c.s);
          if (d.totalMistakes === 0) { store.addXp(1); }
        },
      });
      box.querySelector('#hint').addEventListener('click', () => {
        w.cancelQuiz();
        w.animateCharacter({ onComplete: () => { w.hideCharacter(); w.quiz({ showHintAfterMisses: 2, onComplete: () => { msg.innerHTML = '<b style="color:var(--ok)">✅ Hoàn thành!</b>'; } }); } });
      });
    }).catch(() => {
      box.querySelector('#msg').textContent = 'Không tải được bộ luyện viết (cần kết nối mạng).';
    });
  };
  draw();
}
