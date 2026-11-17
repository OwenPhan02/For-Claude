import { RADICALS } from '../data/radicals.js';
import { esc, zhs, colorPinyin, sample, toast } from '../util.js';
import { runQuiz } from '../quiz.js';
import { store } from '../store.js';

export function render(el) {
  el.innerHTML = `
    <a href="#/explore" class="small">← Khám phá</a>
    <div class="eyebrow" style="margin-top:6px">Nền tảng chữ Hán</div>
    <h1>部首 · 50 bộ thủ thường gặp</h1>
    <p class="muted">Bộ thủ là "viên gạch" tạo nên chữ Hán và thường gợi ý <b>nghĩa</b> của chữ. Biết bộ 氵 (nước) là đoán được 河 (sông), 海 (biển), 洗 (rửa) đều liên quan đến nước.
      Người Việt có lợi thế: tên bộ đọc theo âm Hán Việt (Nhân, Khẩu, Thủy…).</p>
    <div class="row" style="margin-bottom:16px">
      <button type="button" class="btn primary" id="quizBtn">🎯 Đoán bộ thủ (10 câu)</button>
      <input type="search" id="q" placeholder="Tìm: thủy, nước, 氵…" class="lang-sel" style="padding:8px 12px;min-width:200px;border-radius:12px">
    </div>
    <div id="quizBox"></div>
    <div class="grid" id="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))"></div>`;

  const grid = el.querySelector('#grid');
  const draw = (filter = '') => {
    const f = filter.trim().toLowerCase();
    const list = RADICALS.filter(r => !f || [r.r, r.v, r.py, r.hv, r.vi].join(' ').toLowerCase().includes(f) || r.ex.some(e => e.s === f));
    grid.innerHTML = list.map(r => `
      <div class="hanzi-card">
        <div class="hanzi-box zh" style="width:84px;height:84px;font-size:2.6rem">${esc(r.v || r.r)}</div>
        <div style="min-width:0;flex:1">
          <div class="row"><b class="hv" style="font-size:1rem">${esc(r.hv)}</b><span class="muted small">${colorPinyin(r.py)}${r.v ? ` · dạng đầy đủ <span class="zh">${esc(r.r)}</span>` : ''}</span></div>
          <div class="small">${esc(r.vi)}</div>
          <div class="chips" style="margin-top:6px">
            ${r.ex.map(e => `<button type="button" class="chip" data-say="${esc(e.s)}" style="min-width:0;padding:4px 8px"><b class="zh">${esc(zhs(e.s))}</b><small>${esc(e.py)} · ${esc(e.vi)}</small></button>`).join('')}
          </div>
        </div>
      </div>`).join('') || '<p class="muted">Không tìm thấy bộ nào.</p>';
  };
  draw();
  el.querySelector('#q').addEventListener('input', e => draw(e.target.value));

  el.querySelector('#quizBtn').addEventListener('click', () => {
    const box = el.querySelector('#quizBox');
    box.className = 'card';
    const qs = sample(RADICALS, 10).map(r => {
      const e = r.ex[Math.floor(Math.random() * r.ex.length)];
      const others = sample(RADICALS.filter(x => x !== r), 3);
      return {
        label: `Chữ này thuộc bộ nào? (${e.py} – ${e.vi})`, zh: { s: e.s }, say: e.s,
        options: [r, ...others].map(x => `${x.v || x.r} – ${x.hv} (${x.vi})`), answer: 0,
        explain: `<span class="zh">${esc(zhs(e.s))}</span> có bộ <span class="zh">${esc(r.v || r.r)}</span> ${esc(r.hv)} – ${esc(r.vi)}.`,
      };
    });
    runQuiz(box, qs, {
      title: 'Đoán bộ thủ',
      onFinish(score) { const got = store.addXp(score); toast(`+${got} XP`); return `<p class="muted">+${got} XP</p>`; },
    });
    box.scrollIntoView({ behavior: 'smooth' });
  });
}
