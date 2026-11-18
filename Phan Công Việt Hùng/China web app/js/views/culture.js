import { CULTURE } from '../data/culture.js';
import { esc, zhs, speakBtn, colorPinyin } from '../util.js';
import { amBoi } from '../ambo.js';
import { store } from '../store.js';

export function render(el, { id }) {
  const a = id && CULTURE.find(x => x.id === id);
  if (!a) {
    el.innerHTML = `
      <a href="#/explore" class="small">← Khám phá</a>
      <div class="eyebrow" style="margin-top:6px">Văn hóa</div>
      <h1>🏮 Văn hóa Trung Hoa</h1>
      <p class="muted">Hiểu văn hóa giúp bạn dùng tiếng Trung tự nhiên và tránh những tình huống khó xử. Mỗi bài đều so sánh với văn hóa Việt.</p>
      <div class="grid grid-2">
        ${CULTURE.map(c => `
          <a class="card tile" href="#/culture/${c.id}" style="margin:0;color:inherit;text-decoration:none">
            <div class="tile-icon" style="font-family:inherit">${c.icon}</div>
            <div class="tile-body"><b>${esc(c.title)} · <span class="zh">${esc(zhs(c.zh))}</span></b><span class="muted small">${esc(c.summary)}</span></div>
          </a>`).join('')}
      </div>`;
    return;
  }
  const i = CULTURE.indexOf(a);
  const next = CULTURE[(i + 1) % CULTURE.length];
  el.innerHTML = `
    <a href="#/culture" class="small">← Tất cả bài văn hóa</a>
    <article class="card" style="margin-top:8px;max-width:760px">
      <div class="row spread">
        <div><div class="eyebrow">Văn hóa</div><h1 style="margin:0">${a.icon} ${esc(a.title)}</h1></div>
        <div class="row"><span class="zh" style="font-size:1.6rem;font-weight:700">${esc(zhs(a.zh))}</span>${speakBtn(a.zh)}</div>
      </div>
      <p class="muted small">${colorPinyin(a.py)}</p>
      ${a.body.map(p => `<p>${zhs(p)}</p>`).join('')}
      <h3>Từ vựng liên quan</h3>
      <table class="simple">
        ${a.words.map(w => { const [s, py, hv, vi] = w.split('|'); return `
          <tr><td style="width:40px">${speakBtn(s)}</td><td class="zh" style="font-size:1.2rem">${esc(zhs(s))}</td>
          <td>${colorPinyin(py)}<div class="ab" title="Âm bồi – đọc gần đúng">${esc(amBoi(py, s))}</div></td><td>${esc(vi)}</td></tr>`; }).join('')}
      </table>
      <div class="tipbox" style="margin-top:16px">💡 ${zhs(a.tip)}</div>
    </article>
    <div class="row" style="justify-content:flex-end"><a class="btn small primary" href="#/culture/${next.id}">${esc(next.title)} →</a></div>`;
  store.seeCulture?.(a.id);
}
