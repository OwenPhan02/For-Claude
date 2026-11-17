import { PLACEMENT } from '../data/placement.js';
import { runQuiz } from '../quiz.js';
import { store } from '../store.js';
import { esc, toast } from '../util.js';
import { LEVELS } from '../data/lessons.js';

const PASS = 4; // đúng ≥ 4/6 thì lên cấp tiếp
const opt = o => (typeof o === 'string' && o.startsWith('@') ? { s: o.slice(1) } : o);

const ADVICE = [
  { title: 'Người mới bắt đầu', text: 'Hãy bắt đầu từ Pinyin và 4 thanh điệu, sau đó học HSK 1 từ bài 1.', href: '#/pinyin', btn: '🔤 Học Pinyin' },
  { title: 'Trình độ HSK 1', text: 'Bạn đã nắm được giao tiếp cơ bản. Hãy ôn lại HSK 1 và chuẩn bị lên HSK 2.', href: '#/lessons', btn: '📚 Xem bài học' },
  { title: 'Trình độ HSK 2', text: 'Bạn giao tiếp được các chủ đề quen thuộc. Mục tiêu tiếp theo: HSK 3 (câu 把, 被, bổ ngữ).', href: '#/lessons', btn: '📚 Xem bài học' },
  { title: 'Trình độ HSK 3', text: 'Bạn xử lý được hầu hết tình huống đời sống. Tiếp theo: liên từ và từ vựng trừu tượng của HSK 4.', href: '#/lessons', btn: '📚 Xem bài học' },
  { title: 'Trình độ HSK 4', text: 'Bạn nói chuyện khá trôi chảy. HSK 5 sẽ cần đọc báo, nghe tin tức và thành ngữ.', href: '#/lessons', btn: '📚 Xem bài học' },
  { title: 'Trình độ HSK 5', text: 'Rất tốt! HSK 6 tập trung vào văn viết trang trọng và thành ngữ nâng cao.', href: '#/lessons', btn: '📚 Xem bài học' },
  { title: 'Trình độ HSK 6', text: 'Xuất sắc! Bạn đã ở trình độ cao nhất của HSK 2.0. Hãy duy trì bằng đọc sách, xem phim không phụ đề.', href: '#/explore', btn: '🧭 Khám phá' },
];

export function render(el) {
  const last = store.get().test;
  el.innerHTML = `
    <section class="hero">
      <div class="eyebrow">⚡ Miễn phí · khoảng 10–15 phút</div>
      <h1>Bạn đang ở trình độ nào?</h1>
      <p>Mỗi cấp HSK có 6 câu (từ vựng, ngữ pháp, nghe). Đúng từ ${PASS} câu trở lên sẽ lên cấp tiếp theo; khi dừng lại, bạn biết ngay trình độ hiện tại và nên học gì tiếp.</p>
      <div class="levels">${PLACEMENT.map(p => `<span>HSK ${p.level}</span>`).join('')}</div>
      <button type="button" class="btn" id="start">🧭 Bắt đầu làm bài</button>
      ${last ? `<p class="small" style="margin-top:10px">Kết quả lần trước (${esc(last.date)}): <b>${last.level ? `HSK ${last.level}` : 'chưa đạt HSK 1'}</b></p>` : ''}
      <div class="hero-badge">N?</div>
    </section>
    <div id="box"></div>`;
  el.querySelector('.hero-badge').textContent = last?.level ? `${last.level}` : '?';
  el.querySelector('#start').addEventListener('click', () => {
    el.querySelector('.hero').classList.add('hidden');
    runLevel(el.querySelector('#box'), 0, []);
  });
}

function runLevel(box, idx, scores) {
  const L = PLACEMENT[idx];
  box.className = 'card';
  const qs = L.qs.map(q => ({ ...q, autoplay: !!q.say, options: q.options.map(opt) }));
  runQuiz(box, qs, {
    title: `HSK ${L.level} · ${idx + 1}/${PLACEMENT.length}`,
    retry: false,
    onFinish(score) {
      scores.push(score);
      const passed = score >= PASS;
      const more = passed && idx + 1 < PLACEMENT.length;
      setTimeout(() => {
        box.querySelector('#cont')?.addEventListener('click', () => (more ? runLevel(box, idx + 1, scores) : result(box, scores)));
      });
      return `<p>${passed ? `✅ Bạn đã vượt qua HSK ${L.level}!` : `Bạn chưa vượt qua HSK ${L.level} (cần ${PASS}/6).`}</p>
        <button type="button" class="btn primary" id="cont">${more ? `Tiếp tục HSK ${L.level + 1} →` : 'Xem kết quả →'}</button>`;
    },
  });
}

function result(box, scores) {
  const level = scores.filter(s => s >= PASS).length;
  const a = ADVICE[level];
  const d = new Date();
  store.setTest({ level, date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, scores });
  const got = store.addXp(10);
  toast(`+${got} XP`);
  box.className = 'card';
  box.innerHTML = `
    <div class="result">
      <div class="eyebrow">Kết quả</div>
      <div class="score">${level ? `HSK ${level}` : 'Mới bắt đầu'}</div>
      <h2>${esc(a.title)}</h2>
      <p>${esc(a.text)}</p>
      <div class="table-wrap" style="max-width:420px;margin:0 auto 16px">
        <table class="simple">
          <tr><th>Cấp</th><th>Điểm</th><th></th></tr>
          ${scores.map((s, i) => `<tr><td>HSK ${i + 1}</td><td>${s}/6</td><td>${s >= PASS ? '✅' : '❌'}</td></tr>`).join('')}
        </table>
      </div>
      ${level >= 1 && level < 6 && !LEVELS[level].lessons.length ? `<p class="small muted">Bài học HSK ${level + 1} đang được soạn – trong lúc chờ, hãy ôn tập và chơi trò chơi để giữ vốn từ.</p>` : ''}
      <div class="row" style="justify-content:center">
        <a class="btn primary" href="${a.href}">${a.btn}</a>
        <a class="btn" href="#/test" onclick="location.reload()">↻ Làm lại</a>
      </div>
    </div>`;
}
