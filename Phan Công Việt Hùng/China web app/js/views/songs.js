import { SONGS } from '../data/songs.js';
import { esc, zhs, speakBtn, rubyLine, plainLine, colorPinyin } from '../util.js';
import { amBoi } from '../ambo.js';
import { speak } from '../speech.js';
import { store } from '../store.js';

export function render(el, { id }) {
  const s = id && SONGS.find(x => x.id === id);
  if (!s) {
    el.innerHTML = `
      <a href="#/explore" class="small">← Khám phá</a>
      <div class="eyebrow" style="margin-top:6px">Học qua bài hát & thơ</div>
      <h1>🎵 Đồng dao & thơ Đường</h1>
      <p class="muted">Đồng dao giúp nhớ từ theo nhịp; thơ Đường thì người Việt có lợi thế lớn nhờ âm Hán Việt. Bấm ▶ để nghe đọc từng câu.</p>
      <div class="grid grid-3">
        ${SONGS.map(x => `
          <a class="card lesson-card" href="#/songs/${x.id}" style="margin:0;color:inherit;text-decoration:none">
            <div class="row spread"><span class="pill ${x.type === 'Thơ Đường' ? 'gold' : 'jade'}">${esc(x.type)}</span><span class="pill">${esc(x.level)}</span></div>
            <div class="zh zh-title">${esc(zhs(x.zh))}</div>
            <div><b>${esc(x.vi)}</b> <span class="muted small">· ${esc(x.py)}</span></div>
            ${x.author ? `<div class="small muted">${esc(x.author)}</div>` : ''}
          </a>`).join('')}
      </div>`;
    return;
  }

  store.seeSong(s.id);
  const st = store.get().settings;
  const hasHv = s.lines.some(l => l.hv);
  el.innerHTML = `
    <a href="#/songs" class="small">← Tất cả bài</a>
    <div class="card" style="margin-top:8px;max-width:760px">
      <div class="row spread">
        <div><span class="pill ${s.type === 'Thơ Đường' ? 'gold' : 'jade'}">${esc(s.type)}</span>
          <h1 style="margin:6px 0 0"><span class="zh">${esc(zhs(s.zh))}</span> <span class="muted" style="font-size:.55em">${esc(s.py)} · ${esc(s.vi)}</span></h1>
          ${s.author ? `<div class="small muted">${esc(s.author)}</div>` : ''}</div>
      </div>
      <p class="small">${esc(zhs(s.note))}</p>
      <div class="row" style="margin:10px 0">
        <button type="button" class="btn primary small" id="play">▶ Nghe cả bài</button>
        <button type="button" class="btn small" id="slow">🐢 Đọc chậm</button>
        <label class="small"><input type="checkbox" id="optPy" ${st.pinyin ? 'checked' : ''}> Pinyin</label>
        ${hasHv ? '<label class="small"><input type="checkbox" id="optHv" checked> Hán Việt</label>' : ''}
        <label class="small"><input type="checkbox" id="optTr" ${st.trans ? 'checked' : ''}> Dịch</label>
      </div>
      <div id="lyrics" class="${st.pinyin ? '' : 'no-pinyin'} ${st.trans ? '' : 'no-trans'}">
        ${s.lines.map((l, k) => `
          <div class="dialog-line" data-line="${k}" style="border-radius:12px;padding:8px 10px;transition:background .2s">
            <div style="flex:1">
              <div class="zh" style="font-size:1.45rem;line-height:2.2">${rubyLine(l.tokens)}</div>
              ${l.hv ? `<div class="hv hvline" style="text-transform:none;font-size:.9rem">${esc(l.hv)}</div>` : ''}
              <div class="small trans">${esc(l.vi)}</div>
            </div>
            ${speakBtn(plainLine(l.tokens))}
          </div>`).join('')}
      </div>
      <h3 style="margin-top:18px">Từ vựng trong bài</h3>
      <table class="simple">
        ${s.words.map(w => { const [zh, py, hv, vi] = w.split('|'); return `
          <tr><td style="width:40px">${speakBtn(zh)}</td><td class="zh" style="font-size:1.2rem">${esc(zhs(zh))}</td>
          <td>${colorPinyin(py)}<div class="ab" title="Âm bồi – đọc gần đúng">${esc(amBoi(py, zh))}</div></td><td>${esc(vi)}</td></tr>`; }).join('')}
      </table>
    </div>`;

  const ly = el.querySelector('#lyrics');
  el.querySelector('#optPy').addEventListener('change', e => { store.setSetting('pinyin', e.target.checked); ly.classList.toggle('no-pinyin', !e.target.checked); });
  el.querySelector('#optTr').addEventListener('change', e => { store.setSetting('trans', e.target.checked); ly.classList.toggle('no-trans', !e.target.checked); });
  el.querySelector('#optHv')?.addEventListener('change', e => ly.querySelectorAll('.hvline').forEach(n => n.classList.toggle('hidden', !e.target.checked)));

  let playing = 0;
  const play = async rate => {
    const run = ++playing;
    for (let k = 0; k < s.lines.length; k++) {
      if (run !== playing || !el.isConnected) break;
      ly.querySelectorAll('[data-line]').forEach(n => { n.style.background = +n.dataset.line === k ? 'var(--gold-soft)' : ''; });
      await speak(plainLine(s.lines[k].tokens), { rate });
    }
    ly.querySelectorAll('[data-line]').forEach(n => { n.style.background = ''; });
  };
  el.querySelector('#play').addEventListener('click', () => play(0.85));
  el.querySelector('#slow').addEventListener('click', () => play(0.55));
  return () => { playing++; };
}
