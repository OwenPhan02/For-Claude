import { store } from '../store.js';
import { ALL_LESSONS } from '../data/lessons.js';
import { CHAIN_EXTRA } from '../data/chain.js';
import { esc, hz, zhs, colorPinyin, shuffle, sample, toast, speakBtn } from '../util.js';
import { speak } from '../speech.js';

/** Từ của các bài đã học (chưa học bài nào thì lấy 3 bài đầu). */
function learnedWords() {
  const st = store.get();
  const ls = ALL_LESSONS.filter(l => Object.keys(st.lessons[l.id]?.parts || {}).length);
  return (ls.length ? ls : ALL_LESSONS.slice(0, 3)).flatMap(l => l.vocab);
}

export function render(el, { id }) {
  if (id === 'grab') return grab(el);
  if (id === 'chain') return chain(el);
  el.innerHTML = '<div class="card"><h2>Không có trò chơi này</h2><a href="#/explore">← Khám phá</a></div>';
}

// =============== Nghe – giành thẻ (đấu với gấu trúc) ===============
function grab(el) {
  const ROUNDS = 10;
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };

  const intro = () => {
    el.innerHTML = `
      <a href="#/explore" class="small">← Khám phá</a>
      <div class="card" style="margin-top:8px;text-align:center">
        <div style="font-size:3rem">🐼</div>
        <h1>Nghe – giành thẻ</h1>
        <p class="muted">Máy đọc một từ. Bạn và gấu trúc <span class="zh">${esc(zhs('熊猫'))}</span> cùng tranh thẻ đúng. Nhanh tay hơn gấu trúc để giành điểm! Chọn sai mất lượt.</p>
        <p class="small muted">Kỷ lục: <b>${store.get().games.grab || 0}</b>/${ROUNDS}</p>
        <div class="row" style="justify-content:center">
          <button type="button" class="btn" data-lv="easy">🐢 Gấu trúc chậm</button>
          <button type="button" class="btn primary" data-lv="normal">🐼 Bình thường</button>
          <button type="button" class="btn" data-lv="hard">⚡ Gấu trúc nhanh</button>
        </div>
      </div>`;
    el.querySelectorAll('[data-lv]').forEach(b => b.addEventListener('click', () => play(b.dataset.lv)));
  };

  const play = lv => {
    const speedMs = { easy: [4500, 7000], normal: [3000, 5000], hard: [1800, 3200] }[lv];
    const words = shuffle(learnedWords().filter((w, i, a) => a.findIndex(x => x.s === w.s) === i));
    let board = words.slice(0, 8), deck = words.slice(8), round = 0, me = 0, panda = 0, target, locked;

    const draw = msg => {
      el.innerHTML = `
        <div class="card" style="max-width:720px;margin:0 auto">
          <div class="row spread"><b>🙋 Bạn: ${me}</b><span class="muted small">Lượt ${Math.min(round + 1, ROUNDS)}/${ROUNDS}</span><b>🐼 ${panda}</b></div>
          <div class="row" style="justify-content:center;margin:12px 0">${speakBtn(target.s, 'Nghe lại')}<span class="small muted" id="msg">${msg || 'Nghe và chọn thẻ đúng!'}</span></div>
          <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px">
            ${board.map((w, k) => `<button type="button" class="opt zh" data-k="${k}" style="font-size:clamp(1.2rem,4vw,1.8rem);min-height:80px">${esc(hz(w))}</button>`).join('')}
          </div>
        </div>`;
      el.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => pick(+b.dataset.k, b)));
    };

    const next = () => {
      clear();
      if (round >= ROUNDS) return finish();
      locked = false;
      target = board[Math.floor(Math.random() * board.length)];
      draw();
      setTimeout(() => speak(target.s), 300);
      timers.push(setTimeout(() => { // gấu trúc giành thẻ
        if (locked) return;
        locked = true; panda++;
        const k = board.indexOf(target);
        const btn = el.querySelector(`[data-k="${k}"]`);
        btn?.classList.add('wrong');
        el.querySelector('#msg').innerHTML = `🐼 Gấu trúc giành được: <b class="zh">${esc(hz(target))}</b> ${esc(target.py)} – ${esc(target.vi)}`;
        replace(k);
        timers.push(setTimeout(next, 1800));
      }, speedMs[0] + Math.random() * (speedMs[1] - speedMs[0])));
    };

    const replace = k => { round++; board[k] = deck.shift() || board[k]; };

    const pick = (k, btn) => {
      if (locked) return;
      if (board[k] === target) {
        locked = true; clear(); me++;
        btn.classList.add('correct');
        el.querySelector('#msg').innerHTML = `✅ <b class="zh">${esc(hz(target))}</b> ${esc(target.py)} – ${esc(target.vi)}`;
        replace(k);
        timers.push(setTimeout(next, 1200));
      } else {
        btn.classList.add('wrong'); btn.disabled = true;
        el.querySelector('#msg').textContent = `❌ Sai rồi – đó là ${board[k].py}`;
      }
    };

    const finish = () => {
      const got = store.addXp(me);
      const rec = store.setGameBest('grab', me);
      el.innerHTML = `<div class="card result">
        <div style="font-size:3rem">${me > panda ? '🏆' : me === panda ? '🤝' : '🐼'}</div>
        <h2>${me > panda ? 'Bạn thắng!' : me === panda ? 'Hòa!' : 'Gấu trúc thắng!'}</h2>
        <div class="score">${me} : ${panda}</div>
        <p class="muted">+${got} XP${rec ? ' · 🎉 Kỷ lục mới!' : ''}</p>
        <button type="button" class="btn primary" id="again">↻ Chơi lại</button></div>`;
      el.querySelector('#again').addEventListener('click', intro);
    };
    next();
  };

  intro();
  return clear;
}

// =============== Nối chữ 接龙 ===============
function chain(el) {
  const extra = CHAIN_EXTRA.map(l => { const [s, py, vi] = l.split('|'); return { s, py, vi }; });
  const pool = [...learnedWords().filter(w => [...w.s].length >= 2), ...extra]
    .filter((w, i, a) => a.findIndex(x => x.s === w.s) === i);
  const startsWith = ch => pool.filter(w => w.s[0] === ch);
  let timer;

  const intro = () => {
    el.innerHTML = `
      <a href="#/explore" class="small">← Khám phá</a>
      <div class="card" style="margin-top:8px;text-align:center">
        <div class="zh" style="font-size:3rem;color:var(--red)">${esc(zhs('接龙'))}</div>
        <h1>Nối chữ</h1>
        <p class="muted">Chữ <b>cuối</b> của từ trước là chữ <b>đầu</b> của từ sau. Ví dụ: <span class="zh">${esc(zhs('学生 → 生日 → 日本 → 本子'))}</span>…
          Mỗi lượt có 12 giây. Nối càng dài càng được nhiều XP!</p>
        <p class="small muted">Kỷ lục: chuỗi <b>${store.get().games.chain || 0}</b> từ</p>
        <button type="button" class="btn primary" id="go">▶ Bắt đầu</button>
      </div>`;
    el.querySelector('#go').addEventListener('click', play);
  };

  const play = () => {
    const starts = pool.filter(w => startsWith(w.s[w.s.length - 1]).length);
    let cur = starts[Math.floor(Math.random() * starts.length)];
    const used = new Set([cur.s]);
    let len = 0;

    const turn = () => {
      clearInterval(timer);
      const last = cur.s[cur.s.length - 1];
      const nexts = startsWith(last).filter(w => !used.has(w.s));
      if (!nexts.length) return finish(true);
      const right = nexts[Math.floor(Math.random() * nexts.length)];
      const wrong = sample(pool.filter(w => w.s[0] !== last && !used.has(w.s)), 3);
      const opts = shuffle([right, ...wrong]);
      let left = 12;
      el.innerHTML = `
        <div class="card quiz" style="text-align:center">
          <div class="row spread"><b>🐉 Chuỗi: ${len}</b><span class="pill gold" id="t">⏱ ${left}s</span></div>
          <p class="muted small" style="margin-top:12px">Từ hiện tại</p>
          <div class="zh" style="font-size:2.8rem;font-weight:700">${esc(zhs(cur.s.slice(0, -1)))}<span style="color:var(--red)">${esc(zhs(last))}</span></div>
          <div>${colorPinyin(cur.py)} · ${esc(cur.vi)}</div>
          <p style="margin:14px 0 8px">Chọn từ bắt đầu bằng <b class="zh" style="color:var(--red);font-size:1.3rem">${esc(zhs(last))}</b>:</p>
          <div class="options">${opts.map((w, k) => `<button type="button" class="opt zh" data-k="${k}">${esc(zhs(w.s))}</button>`).join('')}</div>
          <div class="feedback" id="fb"></div>
        </div>`;
      speak(cur.s);
      timer = setInterval(() => {
        left--;
        const t = el.querySelector('#t');
        if (t) t.textContent = `⏱ ${left}s`;
        if (left <= 0) { clearInterval(timer); finish(false, `Hết giờ! Đáp án: ${zhs(right.s)} (${right.py} – ${right.vi})`); }
      }, 1000);
      el.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
        clearInterval(timer);
        const w = opts[+b.dataset.k];
        if (w === right || w.s[0] === last) {
          b.classList.add('correct');
          used.add(w.s); cur = w; len++;
          speak(w.s);
          setTimeout(turn, 700);
        } else {
          b.classList.add('wrong');
          finish(false, `${zhs(w.s)} không bắt đầu bằng ${zhs(last)}. Đáp án: ${zhs(right.s)} (${right.py} – ${right.vi})`);
        }
      }));
    };

    const finish = (complete, why = '') => {
      clearInterval(timer);
      const got = store.addXp(Math.min(len * 2, 30));
      const rec = store.setGameBest('chain', len);
      setTimeout(() => {
        el.innerHTML = `<div class="card result">
          <div style="font-size:3rem">🐉</div>
          <h2>${complete ? 'Hết từ để nối – bạn thắng!' : 'Kết thúc!'}</h2>
          ${why ? `<p class="zh">${esc(why)}</p>` : ''}
          <div class="score">${len} từ</div>
          <p class="muted">+${got} XP${rec ? ' · 🎉 Kỷ lục mới!' : ''}</p>
          <button type="button" class="btn primary" id="again">↻ Chơi lại</button></div>`;
        el.querySelector('#again').addEventListener('click', play);
      }, complete ? 0 : 900);
    };
    turn();
  };

  intro();
  return () => clearInterval(timer);
}
