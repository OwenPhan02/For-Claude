// Đề thi thử HSK: ghép ngẫu nhiên từ ngân hàng câu hỏi của các bài trong cấp đó.
import { LEVELS } from '../data/lessons.js';
import { runQuiz, vocabQuestions } from '../quiz.js';
import { store } from '../store.js';
import { esc, sample, toast } from '../util.js';

const PER = 10;          // số câu mỗi phần
const MINUTES = { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40, 6: 45 };

export function render(el, { level }) {
  const lv = LEVELS.find(l => l.level === +level);
  if (!lv) return list(el);
  if (!lv.lessons.length) {
    el.innerHTML = `<div class="card"><h2>Đề thi thử ${lv.name}</h2><p class="muted">Nội dung ${lv.name} đang được soạn – đề thi sẽ có khi xong bài học.</p><a href="#/exam">← Chọn cấp khác</a></div>`;
    return;
  }
  return intro(el, lv);
}

function list(el) {
  const best = store.get().exams || {};
  el.innerHTML = `
    <a href="#/explore" class="small">← Khám phá</a>
    <div class="eyebrow" style="margin-top:6px">Luyện thi</div>
    <h1>📝 Đề thi thử HSK</h1>
    <p class="muted">Mỗi đề gồm 3 phần: <b>Nghe</b>, <b>Đọc hiểu – Ngữ pháp</b>, <b>Từ vựng</b> (mỗi phần ${PER} câu), có tính giờ. Mỗi lần làm là một đề mới được trộn ngẫu nhiên. Đạt từ 60% là "đỗ".</p>
    <div class="grid grid-3">
      ${LEVELS.map(l => `
        <a class="card tile" href="#/exam/${l.level}" style="margin:0;color:inherit;text-decoration:none;${l.lessons.length ? '' : 'opacity:.55'}">
          <div class="tile-icon">${l.level}</div>
          <div class="tile-body"><b>${l.name}</b><span class="muted small">${l.lessons.length ? `${MINUTES[l.level]} phút · Kỷ lục: ${best[l.level] ?? '–'}%` : 'Sắp có'}</span></div>
        </a>`).join('')}
    </div>`;
}

function intro(el, lv) {
  el.innerHTML = `
    <a href="#/exam" class="small">← Chọn cấp</a>
    <div class="card" style="margin-top:8px;text-align:center">
      <div class="eyebrow">Đề thi thử</div>
      <h1>${lv.name}</h1>
      <p>3 phần × ${PER} câu · ${MINUTES[lv.level]} phút · đạt từ 60% là đỗ</p>
      <p class="muted small">Phần Nghe sẽ tự phát âm – hãy bật loa hoặc đeo tai nghe.</p>
      <button type="button" class="btn primary" id="go">▶ Bắt đầu làm bài</button>
    </div>`;
  el.querySelector('#go').addEventListener('click', () => start(el, lv));
}

function start(el, lv) {
  const L = lv.lessons;
  const words = L.flatMap(l => l.vocab);
  const sections = [
    { name: 'Phần 1 · Nghe', qs: sample(L.flatMap(l => l.listening), PER).map(q => ({ ...q, autoplay: true })) },
    { name: 'Phần 2 · Đọc hiểu & ngữ pháp', qs: sample([...L.flatMap(l => l.quiz), ...L.flatMap(l => l.reading.questions.map(q => ({ label: `${l.reading.title}: ${q.q}`, options: q.options, answer: q.answer })))], PER) },
    { name: 'Phần 3 · Từ vựng', qs: vocabQuestions(words, PER, words, ['zh2vi', 'vi2zh', 'py']) },
  ];
  const scores = [];
  const deadline = Date.now() + MINUTES[lv.level] * 60e3;

  el.innerHTML = `
    <div class="row spread card" style="position:sticky;top:64px;z-index:5;padding:10px 16px;margin-bottom:12px">
      <b>${lv.name} · <span id="sec"></span></b><span class="pill gold" id="clock"></span>
    </div>
    <div class="card" id="qbox"></div>`;
  const clock = el.querySelector('#clock');
  const tick = setInterval(() => {
    const left = Math.max(0, deadline - Date.now());
    if (!clock.isConnected) { clearInterval(tick); return; }
    clock.textContent = `⏱ ${Math.floor(left / 60e3)}:${String(Math.floor(left / 1e3) % 60).padStart(2, '0')}`;
    if (left <= 0) { clearInterval(tick); finish(true); }
  }, 500);

  const run = i => {
    el.querySelector('#sec').textContent = sections[i].name;
    const box = el.querySelector('#qbox');
    runQuiz(box, sections[i].qs, {
      title: sections[i].name, retry: false,
      onFinish(score) {
        scores[i] = score;
        const last = i === sections.length - 1;
        setTimeout(() => box.querySelector('#nx')?.addEventListener('click', () => (last ? finish(false) : run(i + 1))));
        return `<button type="button" class="btn primary" id="nx">${last ? 'Xem kết quả →' : `${sections[i + 1].name} →`}</button>`;
      },
    });
  };

  const finish = timeout => {
    clearInterval(tick);
    const total = sections.reduce((n, s) => n + s.qs.length, 0);
    const got = scores.reduce((a, b) => a + (b || 0), 0);
    const pct = Math.round((got / total) * 100);
    const pass = pct >= 60;
    const exams = { ...(store.get().exams || {}) };
    if (pct > (exams[lv.level] || 0)) exams[lv.level] = pct;
    store.setExams(exams);
    const xp = store.addXp(Math.round(got / 2));
    toast(`+${xp} XP`);
    el.innerHTML = `
      <div class="card result">
        <div class="eyebrow">${timeout ? 'Hết giờ!' : 'Kết quả'} · ${lv.name}</div>
        <div class="score">${pct}%</div>
        <h2>${pass ? '🎉 Đỗ!' : '💪 Chưa đỗ – cố lên!'}</h2>
        <table class="simple" style="max-width:420px;margin:0 auto 16px">
          ${sections.map((s, i) => `<tr><td>${esc(s.name)}</td><td style="text-align:right"><b>${scores[i] ?? 0}</b>/${s.qs.length}</td></tr>`).join('')}
        </table>
        <p class="muted small">+${xp} XP · Kỷ lục ${lv.name}: ${exams[lv.level]}%</p>
        <div class="row" style="justify-content:center">
          <button type="button" class="btn primary" id="again">↻ Làm đề khác</button>
          <a class="btn" href="#/lessons">📚 Ôn bài</a>
        </div>
      </div>`;
    el.querySelector('#again').addEventListener('click', () => intro(el, lv));
  };

  run(0);
  return () => clearInterval(tick);
}
