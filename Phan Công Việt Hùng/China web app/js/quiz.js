// Bộ máy trắc nghiệm dùng chung.
// Câu hỏi: { label, zh?: {s,t}, py? (hiện dưới chữ Hán), vi?, say?, autoplay?, options: [ {s,t} | 'chuỗi' ], answer, explain? }
import { esc, hz, zhs, speakBtn, shuffle, sample, colorPinyin } from './util.js';
import { speak } from './speech.js';
import { burst, floatText, confetti } from './fx.js';
import { amBoi } from './ambo.js';

const optHtml = o => (typeof o === 'string' ? esc(zhs(o)) : `<span class="zh">${esc(hz(o))}</span>`);
const optKey = o => (typeof o === 'string' ? o : o.s);

/** Trộn thứ tự đáp án nhưng giữ đúng chỉ số đáp án đúng. */
function shuffleOptions(q) {
  if (q.keepOrder) return q;
  const idx = shuffle(q.options.map((_, i) => i));
  return { ...q, options: idx.map(i => q.options[i]), answer: idx.indexOf(q.answer) };
}

/** Sinh câu hỏi từ vựng. types: zh2vi, vi2zh, listen, py */
export function vocabQuestions(words, n, pool = words, types = ['zh2vi', 'vi2zh', 'listen', 'py']) {
  const picks = sample(words, Math.min(n, words.length));
  return picks.map((w, i) => {
    const type = types[i % types.length];
    const others = sample(pool.filter(x => x.s !== w.s && x.vi !== w.vi), 3);
    const opts = [w, ...others];
    let q;
    if (type === 'zh2vi') q = { label: 'Từ này nghĩa là gì?', zh: w, py: w.py, say: w.s, options: opts.map(o => o.vi) };
    else if (type === 'vi2zh') q = { label: 'Chọn chữ Hán đúng với nghĩa:', vi: w.vi, options: opts.map(o => ({ s: o.s, t: o.t })) };
    else if (type === 'listen') q = { label: 'Nghe và chọn từ đúng', say: w.s, autoplay: true, options: opts.map(o => ({ s: o.s, t: o.t })) };
    else q = { label: 'Chọn pinyin đúng:', zh: w, options: opts.map(o => o.py) };
    q.answer = 0;
    q.explain = `<span class="zh">${esc(hz(w))}</span> · ${esc(w.py)} · <span class="ab">${esc(amBoi(w.py, w.s))}</span> — ${esc(w.vi)}`;
    return q;
  });
}

/**
 * Chạy bài trắc nghiệm trong `el`.
 * onFinish(score, total) có thể trả về HTML bổ sung cho màn kết quả.
 */
export function runQuiz(el, questions, { title = '', onFinish, retry = true } = {}) {
  const qs = questions.map(shuffleOptions);
  const marks = qs.map(() => '');
  let i = 0, score = 0;

  function draw() {
    const q = qs[i];
    el.innerHTML = `
      <div class="quiz">
        ${title ? `<div class="row spread"><b>${esc(title)}</b><span class="muted small">Câu ${i + 1}/${qs.length}</span></div>` : ''}
        <div class="q-progress">${marks.map((m, k) => `<span class="${m || (k === i ? 'cur' : '')}"></span>`).join('')}</div>
        <div class="q-prompt">
          <div class="label">${esc(zhs(q.label))}</div>
          ${q.zh ? `<div class="hz zh">${esc(hz(q.zh))}</div>` : ''}
          ${q.py ? `<div style="font-size:1.2rem;font-weight:700">${colorPinyin(q.py)}</div>` : ''}
          ${q.vi ? `<div style="font-size:1.3rem;font-weight:700">${esc(zhs(q.vi))}</div>` : ''}
          ${q.say ? `<div style="margin-top:8px">${speakBtn(q.say)} <button type="button" class="btn small" data-say="${esc(q.say)}" data-rate="0.6">🐢 Chậm</button></div>` : ''}
        </div>
        <div class="options">
          ${q.options.map((o, k) => `<button type="button" class="opt ${typeof o === 'string' ? '' : 'zh'}" data-k="${k}">${optHtml(o)}</button>`).join('')}
        </div>
        <div class="feedback" id="fb"></div>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button type="button" class="btn primary hidden" id="next">${i + 1 < qs.length ? 'Câu tiếp →' : 'Xem kết quả'}</button>
        </div>
      </div>`;
    if (q.autoplay && q.say) setTimeout(() => speak(q.say), 250);

    el.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k, ok = k === q.answer;
      el.querySelectorAll('.opt').forEach(x => { x.disabled = true; });
      b.classList.add(ok ? 'correct' : 'wrong');
      el.querySelector(`.opt[data-k="${q.answer}"]`).classList.add('correct');
      marks[i] = ok ? 'ok' : 'bad';
      if (ok) { score++; burst(b); floatText(b, ['对!', '好!', '+1', '棒!'][score % 4]); }
      const fb = el.querySelector('#fb');
      fb.className = `feedback show ${ok ? 'ok' : 'bad'}`;
      fb.innerHTML = `<b>${ok ? '✅ Chính xác!' : '❌ Chưa đúng.'}</b> ${zhs(q.explain || '')}`;
      const next = el.querySelector('#next');
      next.classList.remove('hidden');
      next.focus();
      // Câu có chữ Hán: đọc mẫu đáp án đúng
      const right = q.options[q.answer];
      if (!q.say && typeof right !== 'string') speak(optKey(right));
    }));
    el.querySelector('#next').addEventListener('click', () => {
      if (++i < qs.length) draw(); else finish();
    });
  }

  function finish() {
    const extra = onFinish ? onFinish(score, qs.length) || '' : '';
    const pct = score / qs.length;
    el.innerHTML = `
      <div class="quiz result">
        <div style="font-size:2.5rem">${pct === 1 ? '🏆' : pct >= .7 ? '🎉' : '💪'}</div>
        <div class="score">${score}/${qs.length}</div>
        <p>${pct === 1 ? '太棒了！Tuyệt vời, đúng hết!' : pct >= .7 ? '很好！Rất tốt!' : '加油！Cố lên, làm lại để nhớ chắc hơn nhé.'}</p>
        ${extra}
        ${retry ? '<button type="button" class="btn" id="again">↻ Làm lại</button>' : ''}
      </div>`;
    if (pct >= .7) confetti(pct === 1 ? 140 : 80);
    el.querySelector('#again')?.addEventListener('click', () => runQuiz(el, questions, { title, onFinish, retry }));
  }

  draw();
}
