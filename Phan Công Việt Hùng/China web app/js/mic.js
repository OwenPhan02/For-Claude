// Thu giọng nói: nhận dạng tiếng Trung (Web Speech API) + đo cao độ (Web Audio) + bản ghi để nghe lại.
// Âm thanh chỉ giữ trong bộ nhớ trình duyệt; phần nhận dạng do trình duyệt (Google / Apple) xử lý.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canRecognize = () => !!SR;
export const canRecord = () => !!navigator.mediaDevices?.getUserMedia;

/** Cao độ cơ bản (Hz) của một khung bằng tự tương quan; null nếu không rõ. */
function detectPitch(full, fullRate) {
  // Giảm mẫu 1/2 cho nhẹ máy (giọng người < 500 Hz nên vẫn đủ)
  const buf = new Float32Array(full.length >> 1);
  for (let i = 0; i < buf.length; i++) buf[i] = (full[2 * i] + full[2 * i + 1]) / 2;
  const rate = fullRate / 2;
  let rms = 0;
  for (const x of buf) rms += x * x;
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.012) return null;
  const minLag = Math.floor(rate / 450), maxLag = Math.floor(rate / 70);
  const n = buf.length - maxLag;
  let best = -1, bestLag = 0;
  const corr = new Float32Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    let s = 0, e1 = 0, e2 = 0;
    for (let i = 0; i < n; i++) { s += buf[i] * buf[i + lag]; e1 += buf[i] * buf[i]; e2 += buf[i + lag] * buf[i + lag]; }
    corr[lag] = s / Math.sqrt(e1 * e2 || 1);
    if (corr[lag] > best) { best = corr[lag]; bestLag = lag; }
  }
  if (best < 0.75) return null;
  // Lấy đỉnh mạnh ĐẦU TIÊN (tránh bắt nhầm bội số chu kỳ → cao độ thấp hơn thật)
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    if (corr[lag] >= best * 0.9 && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) { bestLag = lag; break; }
  }
  if (bestLag <= minLag || bestLag > maxLag) return null;
  // Nội suy parabol cho chính xác hơn
  const a = corr[bestLag - 1], b = corr[bestLag], c = corr[bestLag + 1];
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
  return rate / (bestLag + (Number.isFinite(shift) ? shift : 0));
}

/**
 * Bắt đầu một lần nói. Trả về { stop(), done: Promise<{alts, frames, audioUrl, error}> }.
 * Tự dừng khi im lặng sau khi đã nói, hoặc hết maxMs.
 */
export function listen({ maxMs = 6000, onLevel } = {}) {
  let stopFn = () => {};
  const done = (async () => {
    const out = { alts: [], frames: [], audioUrl: '', error: '' };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      out.error = e.name === 'NotAllowedError' ? 'denied' : 'nomic';
      return out;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);

    // Bản ghi để nghe lại
    let rec = null; const chunks = [];
    try { rec = new MediaRecorder(stream); rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.start(); } catch { rec = null; }

    // Nhận dạng giọng nói
    let recog = null, recogDone = Promise.resolve();
    if (SR) {
      recog = new SR();
      recog.lang = 'zh-CN';
      recog.interimResults = false;
      recog.maxAlternatives = 5;
      recog.continuous = false;
      recogDone = new Promise(res => {
        recog.onresult = e => {
          for (const r of e.results) for (const alt of r) if (alt.transcript) out.alts.push(alt.transcript.trim());
        };
        recog.onerror = e => { if (e.error === 'not-allowed') out.error = 'denied'; else if (e.error === 'network') out.error = 'network'; };
        recog.onend = res;
      });
      try { recog.start(); } catch { recog = null; }
    }

    const t0 = performance.now();
    let spoke = false, lastVoice = t0, finished = false;
    await new Promise(resolve => {
      const tick = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        const f = detectPitch(buf, ctx.sampleRate);
        const now = performance.now();
        out.frames.push({ t: now - t0, f });
        let lvl = 0; for (let i = 0; i < buf.length; i += 16) lvl = Math.max(lvl, Math.abs(buf[i]));
        onLevel?.(lvl);
        if (f) { spoke = true; lastVoice = now; }
        if ((spoke && now - lastVoice > 1100) || now - t0 > maxMs) finish();
      }, 20);
      function finish() {
        if (finished) return;
        finished = true;
        clearInterval(tick);
        resolve();
      }
      stopFn = finish;
    });

    try { recog?.stop(); } catch {}
    const stopped = rec ? new Promise(r => { rec.onstop = r; }) : Promise.resolve();
    try { rec?.stop(); } catch {}
    await Promise.race([Promise.all([recogDone, stopped]), new Promise(r => setTimeout(r, 4000))]);
    stream.getTracks().forEach(t => t.stop());
    ctx.close?.();
    if (chunks.length) out.audioUrl = URL.createObjectURL(new Blob(chunks, { type: chunks[0].type || 'audio/webm' }));
    if (!spoke && !out.alts.length && !out.error) out.error = 'silent';
    return out;
  })();
  return { stop: () => stopFn(), done };
}
