import { getLesson, ALL_LESSONS } from '../data/lessons.js';
import { store } from '../store.js';
import { esc, hz, speakBtn, rubyLine, plainLine, colorPinyin, toast } from '../util.js';
import { runQuiz, vocabQuestions } from '../quiz.js';
import { speak } from '../speech.js';

export const PARTS = [
  { key: 'vocab', name: 'Từ vựng', icon: '📝' },
  { key: 'grammar', name: 'Ngữ pháp', icon: '🧩' },
  { key: 'hanzi', name: 'Chữ Hán', icon: '🖌️' },
  { key: 'reading', name: 'Đọc', icon: '📖' },
  { key: 'listening', name: 'Nghe', icon: '🎧' },
  { key: 'quiz', name: 'Kiểm tra', icon: '✅' },
];
const PART_XP = 5;

export function render(el, { id, tab }) {
  const L = getLesson(id);
  if (!L) { el.innerHTML = '<div class="card"><h2>Không tìm thấy bài học</h2><a href="#/lessons">← Danh sách bài</a></div>'; return; }
  const part = PARTS.find(p => p.key === tab) ? tab : null;
  const done = store.get().lessons[L.id]?.parts || {};

  el.innerHTML = `
    <a href="#/lessons" class="small">← HSK ${L.level}</a>
    <div class="row spread" style="margin:6px 0 14px">
      <div>
        <div class="eyebrow">HSK ${L.level} · Bài ${L.no}</div>
        <h1 style="margin:0"><span class="zh">${esc(hz(L.title))}</span> <span class="muted" style="font-size:.6em">${esc(L.title.py)} · ${esc(L.vi)}</span></h1>
      </div>
      ${speakBtn(L.title.s)}
    </div>
    <nav class="tabs">
      <a href="#/lesson/${L.id}" class="${part ? '' : 'active'}">Tổng quan</a>
      ${PARTS.map(p => `<a href="#/lesson/${L.id}/${p.key}" class="${part === p.key ? 'active' : ''}">${p.icon} ${p.name}${done[p.key] ? ' ✓' : ''}</a>`).join('')}
    </nav>
    <div id="body"></div>
    <div class="row spread" id="pager" style="margin-top:16px"></div>`;

  const body = el.querySelector('#body');
  const views = { vocab, grammar, hanzi, reading, listening, quiz };
  if (!part) overview(body, L, done);
  else views[part](body, L);

  // Nút chuyển phần trước / sau
  const idx = part ? PARTS.findIndex(p => p.key === part) : -1;
  const prev = idx > 0 ? PARTS[idx - 1] : null;
  const next = PARTS[idx + 1];
  const nextLesson = ALL_LESSONS[ALL_LESSONS.indexOf(L) + 1];
  el.querySelector('#pager').innerHTML = `
    <span>${prev ? `<a class="btn small" href="#/lesson/${L.id}/${prev.key}">← ${prev.name}</a>` : ''}</span>
    <span>${next ? `<a class="btn small primary" href="#/lesson/${L.id}/${next.key}">${next.name} →</a>`
      : nextLesson ? `<a class="btn small primary" href="#/lesson/${nextLesson.id}">Bài ${nextLesson.no} →</a>` : ''}</span>`;
}

/** Đánh dấu hoàn thành một phần, cộng XP lần đầu. */
function complete(L, key) {
  if (store.markPart(L.id, key)) {
    store.addXp(PART_XP);
    toast(`Hoàn thành phần ${PARTS.find(p => p.key === key).name} · +${PART_XP} XP`);
    const a = document.querySelector(`.tabs a[href$="/${key}"]`);
    if (a && !a.textContent.includes('✓')) a.textContent += ' ✓';
  }
}
const doneBtn = (label = 'Đã học xong phần này') => `<div class="row" style="justify-content:center;margin-top:16px"><button type="button" class="btn jade" id="done">✓ ${label}</button></div>`;
const bindDone = (box, L, key) => box.querySelector('#done')?.addEventListener('click', () => complete(L, key));

// ---------------- Tổng quan ----------------
function overview(box, L, done) {
  box.innerHTML = `
    <div class="card">
      <h3>🎯 Mục tiêu bài học</h3>
      <p>${esc(L.goal)}</p>
      <div class="grid grid-3">
        ${PARTS.map(p => `
          <a class="tile" href="#/lesson/${L.id}/${p.key}" style="color:inherit;text-decoration:none">
            <div class="tile-icon" style="font-family:inherit">${p.icon}</div>
            <div class="tile-body"><b>${p.name}</b><span class="muted small">${count(L, p.key)}</span></div>
            ${done[p.key] ? '<span class="pill jade">✓</span>' : ''}
          </a>`).join('')}
      </div>
    </div>`;
}
function count(L, key) {
  return {
    vocab: `${L.vocab.length} từ mới`, grammar: `${L.grammar.length} điểm ngữ pháp`, hanzi: `${L.hanzi.length} chữ, xem thứ tự nét`,
    reading: 'Hội thoại có pinyin', listening: `${L.listening.length} câu nghe`, quiz: '10 câu trắc nghiệm',
  }[key];
}

// ---------------- Từ vựng ----------------
function vocab(box, L) {
  let mode = 'list', i = 0;
  const draw = () => {
    box.innerHTML = `
      <div class="row spread" style="margin-bottom:12px">
        <div class="seg" role="group">
          <button type="button" data-mode="list" class="${mode === 'list' ? 'on' : ''}" style="font-family:inherit">Danh sách</button>
          <button type="button" data-mode="flash" class="${mode === 'flash' ? 'on' : ''}" style="font-family:inherit">Thẻ lật</button>
        </div>
        <span class="muted small">${L.vocab.length} từ · bấm 🔊 để nghe</span>
      </div>
      <div id="vbody"></div>
      ${doneBtn()}`;
    box.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; draw(); }));
    bindDone(box, L, 'vocab');
    const vb = box.querySelector('#vbody');
    if (mode === 'list') {
      vb.innerHTML = `<div class="vocab-list">${L.vocab.map(w => `
        <div class="vocab-item">
          <div class="hz zh">${esc(hz(w))}</div>
          <div class="meta">
            <div class="py">${colorPinyin(w.py)}</div>
            <div class="hv">${esc(w.hv)}</div>
            <div>${esc(w.vi)}</div>
            <div class="muted small">${esc(w.pos)}${w.t && w.t !== w.s ? ` · <span class="zh">${esc(store.get().settings.script === 't' ? w.s : w.t)}</span>` : ''}</div>
          </div>
          ${speakBtn(w.s)}
        </div>`).join('')}</div>`;
    } else {
      const w = L.vocab[i];
      vb.innerHTML = `
        <div class="flash-wrap">
          <button type="button" class="flash" id="card" aria-label="Lật thẻ">
            <div class="flash-face"><div class="hz zh">${esc(hz(w))}</div><div class="muted small">Bấm để lật thẻ</div></div>
            <div class="flash-face back">
              <div class="py">${colorPinyin(w.py)}</div><div class="hv">${esc(w.hv)}</div><div class="vi">${esc(w.vi)}</div>
              <div class="muted small">${esc(w.pos)}</div>
            </div>
          </button>
          <div class="row spread" style="margin-top:14px">
            <button type="button" class="btn small" id="prev" ${i === 0 ? 'disabled' : ''}>←</button>
            <span class="row">${speakBtn(w.s)}<span class="muted small">${i + 1} / ${L.vocab.length}</span></span>
            <button type="button" class="btn small" id="nxt" ${i === L.vocab.length - 1 ? 'disabled' : ''}>→</button>
          </div>
        </div>`;
      const card = vb.querySelector('#card');
      card.addEventListener('click', () => { card.classList.toggle('flipped'); if (card.classList.contains('flipped')) speak(w.s); });
      vb.querySelector('#prev').addEventListener('click', () => { i--; draw(); });
      vb.querySelector('#nxt').addEventListener('click', () => { i++; draw(); });
    }
  };
  draw();
}

// ---------------- Ngữ pháp ----------------
const exLine = ex => `
  <div class="ex">
    ${speakBtn(plainLine(ex.tokens) + (ex.reply ? plainLine(ex.reply) : ''))}
    <div>
      <div class="zh">${rubyLine(ex.tokens)}${ex.reply ? ` – ${rubyLine(ex.reply)}` : ''}</div>
      <div class="small trans">${esc(ex.vi)}</div>
    </div>
  </div>`;

function grammar(box, L) {
  box.innerHTML = `<div class="card">
    ${L.grammar.map((g, k) => `
      <div class="gpoint">
        <h3>${k + 1}. ${esc(g.title)}</h3>
        <div class="formula zh">${esc(g.formula)}</div>
        <p>${g.explain}</p>
        ${g.examples.map(exLine).join('')}
      </div>`).join('')}
    ${doneBtn()}
  </div>`;
  bindDone(box, L, 'grammar');
}

// ---------------- Chữ Hán ----------------
let writerLib;
function loadWriter() {
  writerLib ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
    s.onload = () => res(window.HanziWriter);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return writerLib;
}

function hanzi(box, L) {
  const trad = store.get().settings.script === 't';
  box.innerHTML = `
    <p class="muted small">Bấm vào ô chữ để xem lại thứ tự nét. Mẹo: viết theo quy tắc <b>trên trước dưới sau, trái trước phải sau, ngang trước sổ sau</b>.</p>
    <div class="hanzi-grid">
      ${L.hanzi.map((c, k) => `
        <div class="hanzi-card">
          <div class="hanzi-box zh" id="hw${k}" title="Xem thứ tự nét" style="cursor:pointer"></div>
          <div style="min-width:0">
            <div class="row"><b class="zh" style="font-size:1.6rem">${esc(hz(c))}</b>${speakBtn(c.s)}</div>
            <div class="py" style="color:var(--red);font-weight:700">${colorPinyin(c.py)} · <span class="hv">${esc(c.hv)}</span></div>
            <div class="small">${esc(c.vi)}</div>
            <div class="small muted">Bộ: <span class="zh">${esc(c.radical)}</span> · ${trad && c.strokesT ? c.strokesT : c.strokes} nét</div>
            <p class="small" style="margin:6px 0 0">${c.note}</p>
          </div>
        </div>`).join('')}
    </div>
    ${doneBtn()}`;
  bindDone(box, L, 'hanzi');

  loadWriter().then(HW => {
    L.hanzi.forEach((c, k) => {
      const target = box.querySelector(`#hw${k}`);
      if (!target) return;
      const w = HW.create(target, hz(c), {
        width: 110, height: 110, padding: 6, showOutline: true,
        strokeColor: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#333',
        radicalColor: getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#c8102e',
        strokeAnimationSpeed: 1.2, delayBetweenStrokes: 150,
      });
      target.addEventListener('click', () => w.animateCharacter());
      setTimeout(() => w.animateCharacter(), 300 + k * 400);
    });
  }).catch(() => {
    // Không tải được thư viện (mất mạng): hiện chữ tĩnh
    L.hanzi.forEach((c, k) => { const t = box.querySelector(`#hw${k}`); if (t) t.textContent = hz(c); });
  });
}

// ---------------- Đọc ----------------
function reading(box, L) {
  const R = L.reading;
  const st = store.get().settings;
  box.innerHTML = `
    <div class="card ${st.pinyin ? '' : 'no-pinyin'} ${st.trans ? '' : 'no-trans'}" id="rd">
      <div class="row spread">
        <h3 style="margin:0">${esc(R.title)}</h3>
        <div class="row">
          <label class="small"><input type="checkbox" id="optPy" ${st.pinyin ? 'checked' : ''}> Pinyin</label>
          <label class="small"><input type="checkbox" id="optTr" ${st.trans ? 'checked' : ''}> Dịch</label>
          <button type="button" class="btn small" id="playAll">▶ Nghe cả bài</button>
        </div>
      </div>
      <div style="margin-top:10px">
        ${R.lines.map(ln => {
          const p = R.people[ln.who];
          return `<div class="dialog-line">
            <div class="speaker ${ln.who === 'B' ? 'b' : ''}" title="${esc(p.py)}">${esc(p.s[p.s.length - 1])}</div>
            <div style="flex:1">
              <div class="small muted">${esc(p.py)}</div>
              <div class="zh" style="font-size:1.3rem;line-height:2.1">${rubyLine(ln.tokens)}</div>
              <div class="small trans">${esc(ln.vi)}</div>
            </div>
            ${speakBtn(plainLine(ln.tokens))}
          </div>`;
        }).join('')}
      </div>
      ${R.newWords ? `<p class="small muted">💡 ${esc(R.newWords)}</p>` : ''}
    </div>
    <div class="card">
      <h3>Câu hỏi đọc hiểu</h3>
      <div id="rq"></div>
    </div>`;

  const rd = box.querySelector('#rd');
  box.querySelector('#optPy').addEventListener('change', e => { store.setSetting('pinyin', e.target.checked); rd.classList.toggle('no-pinyin', !e.target.checked); });
  box.querySelector('#optTr').addEventListener('change', e => { store.setSetting('trans', e.target.checked); rd.classList.toggle('no-trans', !e.target.checked); });
  box.querySelector('#playAll').addEventListener('click', async () => {
    for (const ln of R.lines) {
      if (!box.isConnected) break;
      await speak(plainLine(ln.tokens));
    }
  });

  runQuiz(box.querySelector('#rq'), R.questions.map(q => ({ label: q.q, options: q.options, answer: q.answer })), {
    onFinish: score => { if (score === R.questions.length) complete(L, 'reading'); return score === R.questions.length ? '' : '<p class="small">Trả lời đúng hết để hoàn thành phần Đọc.</p>'; },
  });
}

// ---------------- Nghe ----------------
function listening(box, L) {
  box.innerHTML = '<div class="card"><p class="muted small">🎧 Đeo tai nghe. Có thể bấm 🔊 nghe lại hoặc 🐢 nghe chậm.</p><div id="lq"></div></div>';
  const qs = L.listening.map(q => ({ ...q, autoplay: true }));
  runQuiz(box.querySelector('#lq'), qs, {
    title: 'Luyện nghe',
    onFinish: (score, total) => { if (score / total >= 0.6) complete(L, 'listening'); return score / total >= 0.6 ? '' : '<p class="small">Đúng từ 60% để hoàn thành phần Nghe.</p>'; },
  });
}

// ---------------- Kiểm tra ----------------
function quiz(box, L) {
  const best = store.get().lessons[L.id]?.best || 0;
  box.innerHTML = `<div class="card">
    <p class="muted small">10 câu tổng hợp cả bài. Kỷ lục của bạn: <b>${best}/10</b>. Đúng từ 7 câu để hoàn thành bài.</p>
    <div id="qz"></div></div>`;
  const custom = L.quiz.slice(0, 10);
  const qs = [...custom, ...vocabQuestions(L.vocab, 10 - custom.length)];
  runQuiz(box.querySelector('#qz'), qs.sort(() => Math.random() - 0.5), {
    title: `Kiểm tra bài ${L.no}`,
    onFinish(score) {
      store.setBest(L.id, score);
      if (score >= 7) complete(L, 'quiz');
      return score >= 7 ? '<p>🎊 Bạn đã hoàn thành bài này!</p>' : '<p class="small">Cần đúng ít nhất 7/10 để hoàn thành bài.</p>';
    },
  });
}
