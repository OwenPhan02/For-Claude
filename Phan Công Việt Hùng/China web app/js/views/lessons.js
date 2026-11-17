import { LEVELS } from '../data/lessons.js';
import { store } from '../store.js';
import { esc, hz } from '../util.js';
import { PARTS } from './lesson.js';

export function render(el) {
  const st = store.get();
  el.innerHTML = `
    <div class="eyebrow">Lộ trình HSK</div>
    <h1>Bài học</h1>
    <p class="muted">Mỗi bài gồm 6 phần: từ vựng, ngữ pháp, chữ Hán, đọc, nghe và 10 câu kiểm tra. Học xong phần nào được +5 XP.</p>
    ${LEVELS.map(lv => `
      <section class="card">
        <div class="row spread">
          <h2 style="margin:0">${lv.name}</h2>
          <span class="row"><span class="pill">${lv.words} từ</span>${lv.lessons.length ? `<a class="btn small" href="#/exam/${lv.level}">📝 Thi thử</a>` : ''}</span>
        </div>
        <p class="muted small">${esc(lv.desc)}</p>
        ${lv.lessons.length ? `<div class="grid grid-3">${lv.lessons.map(l => {
          const p = st.lessons[l.id]?.parts || {};
          const n = PARTS.filter(x => p[x.key]).length;
          return `
            <a class="tile lesson-card" href="#/lesson/${l.id}" style="color:inherit;text-decoration:none;align-items:stretch">
              <div class="row spread"><span class="pill red">Bài ${l.no}</span><span class="small muted">${n}/${PARTS.length} phần</span></div>
              <div class="zh zh-title">${esc(hz(l.title))}</div>
              <div><b>${esc(l.vi)}</b> <span class="muted small">· ${esc(l.title.py)}</span></div>
              <div class="xpbar"><span style="width:${(n / PARTS.length) * 100}%"></span></div>
            </a>`;
        }).join('')}</div>` : '<p class="pill">Đang soạn nội dung</p>'}
      </section>`).join('')}`;
}
