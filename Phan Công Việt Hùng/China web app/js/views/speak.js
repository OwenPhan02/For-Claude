// Phần "Luyện nói" của bài học: nghe mẫu → nói → chấm từng âm tiết + thanh điệu → mẹo sửa.
import { ALL_LESSONS } from '../data/lessons.js';
import { esc, hz, toast } from '../util.js';
import { speak } from '../speech.js';
import { listen, canRecognize, canRecord } from '../mic.js';
import { targetOf, buildReadings, grade, guessTones, spokenTones, tipsFor, withMark, TONE_SHAPE, readingsOfText } from '../pron.js';
import { burst, confetti } from '../fx.js';

const PASS = 80, NEED = 5;
let readingsReady = false;

function itemsOf(L) {
  const words = L.vocab.map(w => ({ zh: w.s, py: w.py, vi: w.vi, parts: [[w.s, w.py]] }));
  const lines = [
    ...L.grammar.flatMap(g => g.examples.map(e => ({ tokens: e.tokens, vi: e.vi }))),
    ...(L.reading?.lines || []).map(l => ({ tokens: l.tokens, vi: l.vi })),
  ];
  const sents = lines.map(l => ({
    zh: l.tokens.map(t => t[0]).join(''),
    py: l.tokens.map(t => t[2]).filter(Boolean).join(' '),
    vi: l.vi,
    parts: l.tokens.map(t => [t[0], t[2]]),
  })).filter(s => { const n = [...s.zh].filter(c => /[㐀-鿿]/.test(c)).length; return n >= 2 && n <= 14; });
  const seen = new Set();
  return { words, sents: sents.filter(s => !seen.has(s.zh) && seen.add(s.zh)).slice(0, 10) };
}

export function renderSpeak(box, L, onComplete) {
  if (!readingsReady) { buildReadings(ALL_LESSONS.flatMap(l => l.vocab)); readingsReady = true; }
  const { words, sents } = itemsOf(L);
  const best = new Map();            // "w3" → điểm cao nhất
  let mode = 'w', idx = 0, session = null, lastAudio = '';
  const list = () => (mode === 'w' ? words : sents);
  const passed = () => [...best.values()].filter(s => s >= PASS).length;

  if (!canRecord()) {
    box.innerHTML = `<div class="card"><h3>🗣️ Luyện nói</h3><p>Trình duyệt này không cho dùng micro. Hãy mở app bằng <b>Chrome</b> (Android, máy tính) hoặc <b>Safari</b> (iPhone/iPad).</p></div>`;
    return;
  }

  box.innerHTML = `
    <div class="card speak-card">
      <div class="row spread">
        <div class="seg sp-mode">
          <button type="button" data-mode="w" class="on">Từ vựng (${words.length})</button>
          ${sents.length ? `<button type="button" data-mode="s">Câu mẫu (${sents.length})</button>` : ''}
        </div>
        <span class="small muted" id="spCount"></span>
      </div>
      ${canRecognize() ? '' : '<p class="tipbox small" style="margin-top:12px">Trình duyệt này chưa nhận dạng được giọng nói nên chỉ chấm được <b>thanh điệu</b>. Dùng Chrome hoặc Safari để chấm đầy đủ từng âm.</p>'}
      <div class="sp-stage">
        <div class="sp-text zh" id="spText"></div>
        <div class="sp-vi" id="spVi"></div>
        <div class="sp-actions">
          <button type="button" class="btn" id="spPlay">🔊 Nghe mẫu</button>
          <button type="button" class="btn" id="spSlow">🐢 Chậm</button>
        </div>
        <button type="button" class="sp-mic" id="spMic" aria-label="Bấm để nói"><span class="sp-ring"></span><span class="sp-ico">🎤</span></button>
        <div class="sp-hint" id="spHint">Bấm micro rồi đọc to, rõ ràng</div>
        <div class="sp-level"><span id="spLevel"></span></div>
        <button type="button" class="btn small hidden" id="spMine">▶ Nghe lại giọng tôi</button>
      </div>
      <div id="spResult"></div>
      <div class="row spread" style="margin-top:14px">
        <button type="button" class="btn small" id="spPrev">← Trước</button>
        <button type="button" class="btn small primary" id="spNext">Tiếp →</button>
      </div>
      <p class="small muted" style="text-align:center;margin:12px 0 0" id="spGoal"></p>
    </div>
    <p class="small muted">🔒 Lần đầu bấm 🎤, trình duyệt sẽ hỏi quyền dùng micro – chọn <b>Cho phép</b>. Giọng nói được trình duyệt (Google / Apple) nhận dạng để chấm; app không lưu bản ghi của bạn.</p>`;

  const $ = s => box.querySelector(s);
  const mic = $('#spMic');

  function draw() {
    const it = list()[idx];
    const tgt = targetOf(it);
    let k = 0;
    $('#spText').innerHTML = it.parts.map(([zh]) => [...hz({ s: zh })].map((c, i) => {
      if (!/[㐀-鿿]/.test([...zh][i] || c)) return `<span class="sp-punct">${esc(c)}</span>`;
      const t = tgt[k];
      return `<span class="sp-syl" data-k="${k++}"><small>${t?.base ? withMark(t.base, t.tone) : ''}</small>${esc(c)}</span>`;
    }).join('')).join('');
    $('#spText').classList.toggle('long', tgt.length > 5);
    $('#spVi').textContent = it.vi || '';
    $('#spCount').textContent = `${idx + 1} / ${list().length}`;
    $('#spResult').innerHTML = '';
    $('#spMine').classList.add('hidden');
    $('#spPrev').disabled = idx === 0;
    $('#spNext').disabled = idx === list().length - 1;
    $('#spGoal').innerHTML = `Đạt từ <b>${PASS}%</b> ở <b>${NEED}</b> mục để hoàn thành phần này · đã đạt <b>${Math.min(passed(), NEED)}/${NEED}</b>`;
    lastAudio = '';
  }

  const play = rate => { const it = list()[idx]; speak(it.zh, { rate }); };
  $('#spPlay').addEventListener('click', () => play(0.8));
  $('#spSlow').addEventListener('click', () => play(0.5));
  $('#spMine').addEventListener('click', () => { if (lastAudio) new Audio(lastAudio).play(); });
  $('#spPrev').addEventListener('click', () => { if (idx > 0) { idx--; draw(); } });
  $('#spNext').addEventListener('click', () => { if (idx < list().length - 1) { idx++; draw(); } });
  box.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode; idx = 0;
    box.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
    draw();
  }));

  mic.addEventListener('click', async () => {
    if (session) { session.stop(); return; }
    window.speechSynthesis?.cancel();
    const it = list()[idx];
    const tgt = targetOf(it);
    mic.classList.add('rec');
    $('#spHint').textContent = 'Đang nghe… đọc xong sẽ tự dừng (hoặc bấm lại)';
    $('#spResult').innerHTML = '';
    session = listen({
      maxMs: 2500 + tgt.length * 700,
      onLevel: v => { $('#spLevel').style.width = `${Math.min(100, v * 260)}%`; },
    });
    const r = await session.done;
    session = null;
    mic.classList.remove('rec');
    $('#spLevel').style.width = '0';
    $('#spHint').textContent = 'Bấm micro để nói lại';
    if (r.error === 'denied') return showMsg('🎤 Micro đang bị chặn. Hãy bấm biểu tượng ổ khóa / micro trên thanh địa chỉ → <b>Cho phép micro</b>, rồi thử lại.');
    if (r.error === 'nomic') return showMsg('Không tìm thấy micro trên máy này.');
    if (r.error === 'silent') return showMsg('Chưa nghe thấy tiếng. Hãy nói <b>to hơn</b> và đưa máy gần miệng hơn một chút.');
    if (r.audioUrl) { lastAudio = r.audioUrl; $('#spMine').classList.remove('hidden'); }
    const pitch = guessTones(r.frames, tgt.length);
    const res = grade(tgt, canRecognize() && r.error !== 'network' ? r.alts : [], pitch.tones);
    showResult(it, tgt, res, pitch, r);
  });

  function showMsg(html) { $('#spResult').innerHTML = `<div class="sp-res"><p style="margin:0">${html}</p></div>`; }

  function showResult(it, tgt, res, pitch, r) {
    // Tô màu từng âm tiết
    box.querySelectorAll('.sp-syl').forEach(el => {
      const c = res.cells[+el.dataset.k];
      el.className = `sp-syl ${c ? `st-${c.st}` : ''}`;
    });
    const key = mode + idx;
    let score = res.score;
    if (score === null) { // không nhận dạng được → chấm bằng thanh điệu
      const want = spokenTones(tgt);
      const ok = res.cells.filter((c, i) => c.pitchTone && (c.pitchTone === want[i] || want[i] === 0)).length;
      score = pitch.tones ? Math.round((ok / tgt.length) * 100) : 0;
    }
    best.set(key, Math.max(best.get(key) || 0, score));
    const tips = tipsFor(res);
    const heardPy = res.heardText ? readingsOfText(res.heardText) : '';
    const msg = score >= 95 ? '太棒了！Hoàn hảo!' : score >= PASS ? '很好！Đạt rồi, rất tốt!' : score >= 50 ? 'Gần đúng rồi – sửa theo gợi ý và thử lại nhé.' : 'Nghe lại mẫu thật kỹ rồi đọc chậm từng chữ nhé.';
    $('#spResult').innerHTML = `
      <div class="sp-res">
        <div class="sp-score ${score >= PASS ? 'good' : score >= 50 ? 'mid' : 'low'}"><b>${score}</b><small>điểm</small></div>
        <div class="sp-res-body">
          <p style="margin:0 0 6px"><b>${msg}</b></p>
          ${res.heardText ? `<p class="small" style="margin:0">Máy nghe được: <span class="zh">${esc(res.heardText)}</span> <span class="muted">(${esc(heardPy)})</span></p>`
            : canRecognize() ? '<p class="small muted" style="margin:0">Máy chưa nhận ra chữ nào – thử nói to, rõ hơn.</p>' : ''}
          <div class="sp-legend small"><span class="st-ok">● đúng</span><span class="st-tone">● sai thanh</span><span class="st-sound">● sai âm</span><span class="st-miss">● thiếu</span></div>
        </div>
      </div>
      ${pitch.curve.length ? toneChart(tgt, pitch) : ''}
      ${tips.length ? `<div class="sp-tips"><b>💡 Cách sửa</b><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}`;
    if (score >= PASS) {
      burst(mic, 16);
      if (passed() === NEED) { confetti(120); onComplete?.(); toast('🎉 Hoàn thành phần Luyện nói!'); }
    }
    $('#spGoal').innerHTML = `Đạt từ <b>${PASS}%</b> ở <b>${NEED}</b> mục để hoàn thành phần này · đã đạt <b>${Math.min(passed(), NEED)}/${NEED}</b>`;
  }

  draw();
  return () => session?.stop();
}

/** Biểu đồ: đường cao độ của bạn (đỏ) so với hình mẫu từng thanh (nét đứt). */
function toneChart(tgt, pitch) {
  const W = 600, H = 150, pad = 18;
  const pts = pitch.curve;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t || t0 + 1;
  const lo = Math.min(...pts.map(p => p.s)) - 1, hi = Math.max(...pts.map(p => p.s)) + 1;
  const X = t => pad + ((t - t0) / (t1 - t0 || 1)) * (W - 2 * pad);
  const Y = s => pad + (1 - (s - lo) / (hi - lo || 1)) * (H - 2 * pad - 16);
  const want = spokenTones(tgt);
  const segs = pitch.segs?.length === tgt.length ? pitch.segs : tgt.map((_, i) => [t0 + (i * (t1 - t0)) / tgt.length, t0 + ((i + 1) * (t1 - t0)) / tgt.length]);
  const tpl = segs.map(([a, b], i) => {
    const shape = TONE_SHAPE[want[i]] || TONE_SHAPE[0];
    const xa = X(a ?? t0), xb = X(b ?? t1);
    const d = shape.map((v, j) => `${(xa + (j / (shape.length - 1)) * (xb - xa)).toFixed(1)},${(pad + (1 - v) * (H - 2 * pad - 16)).toFixed(1)}`).join(' ');
    const g = pitch.tones?.[i];
    return `<polyline points="${d}" class="tpl"/><text x="${((xa + xb) / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" class="lbl ${g && g !== want[i] && want[i] ? 'bad' : ''}">${withMark(tgt[i].base, tgt[i].tone)}${g ? ` · bạn: T${g}` : ''}</text>`;
  }).join('');
  const user = pts.map(p => `${X(p.t).toFixed(1)},${Y(p.s).toFixed(1)}`).join(' ');
  return `<div class="sp-chart"><div class="small muted">Đường giọng của bạn <span style="color:var(--red)">━</span> so với thanh chuẩn <span>┅</span></div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Biểu đồ thanh điệu">${tpl}<polyline points="${user}" class="usr"/></svg></div>`;
}
