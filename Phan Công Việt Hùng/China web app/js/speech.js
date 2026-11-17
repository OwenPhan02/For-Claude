// Phát âm tiếng Trung bằng Web Speech API có sẵn trong trình duyệt.
let voices = [];
const pick = () => {
  voices = window.speechSynthesis?.getVoices() || [];
};
if ('speechSynthesis' in window) {
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
}

function zhVoice() {
  const zh = voices.filter(v => /^zh[-_](CN|Hans)/i.test(v.lang) || v.lang === 'zh');
  // Ưu tiên giọng chất lượng cao nếu có (Google / Microsoft Online / natural)
  return zh.find(v => /natural|online|google/i.test(v.name)) || zh[0]
    || voices.find(v => v.lang.toLowerCase().startsWith('zh')) || null;
}

export const canSpeak = () => 'speechSynthesis' in window;

/** Đọc một đoạn tiếng Trung. rate < 1 là đọc chậm. */
export function speak(text, { rate = 0.85 } = {}) {
  if (!canSpeak() || !text) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    const v = zhVoice();
    if (v) u.voice = v;
    u.rate = rate;
    u.onend = u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export const hasZhVoice = () => !!zhVoice();
