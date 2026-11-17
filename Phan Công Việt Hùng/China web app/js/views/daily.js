import { store, DAILY_XP_CAP } from '../store.js';
import { vocabPool, ALL_LESSONS } from '../data/lessons.js';
import { runQuiz, vocabQuestions } from '../quiz.js';
import { toast } from '../util.js';

const XP_PER = 4;

export function render(el) {
  const st = store.get();
  // Lấy từ các bài đã bắt đầu học; chưa học bài nào thì dùng bài 1
  const started = Object.keys(st.lessons);
  const pool = vocabPool(started.length ? started : [ALL_LESSONS[0].id]);
  const left = DAILY_XP_CAP - st.dailyXpToday;

  el.innerHTML = `
    <div class="eyebrow">Mỗi ngày một chút</div>
    <h1>⚡ Thử thách 5 câu hôm nay</h1>
    <p class="muted">Mỗi câu đúng +${XP_PER} XP, tối đa ${DAILY_XP_CAP} XP/ngày. ${left > 0 ? `Hôm nay còn nhận được <b>${left} XP</b>.` : 'Hôm nay bạn đã nhận đủ XP – vẫn có thể luyện thêm.'}
      Từ vựng lấy từ các bài bạn đã học (${pool.length} từ).</p>
    <div class="card"><div id="dq"></div></div>`;

  runQuiz(el.querySelector('#dq'), vocabQuestions(pool, 5), {
    title: 'Thử thách hôm nay',
    onFinish(score) {
      const got = store.addXp(score * XP_PER, { daily: true });
      store.markDaily();
      if (got) toast(`+${got} XP`);
      return `<p>${got ? `+${got} XP · ` : ''}🔥 Chuỗi: ${store.get().streak} ngày</p><p><a href="#/">← Về trang chủ</a></p>`;
    },
  });
}
