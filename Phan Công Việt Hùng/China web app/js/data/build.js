// Chuyển bài học viết dạng gọn → dạng đầy đủ mà các trang dùng.
//
// Từ vựng:  's|pinyin|hán việt|nghĩa|từ loại'
// Câu:      '我/wǒ 是/shì 学生/xuésheng 。'  (pinyin có dấu cách thì viết _ : 不是/bú_shì)
//           thêm ' ;; nghĩa tiếng Việt' ở cuối để kèm bản dịch
// Đáp án:   chuỗi bắt đầu bằng '@' là chữ Hán (sẽ theo chế độ giản/phồn), còn lại là tiếng Việt/pinyin
// Chữ Hán:  's|pinyin|hán việt|nghĩa|số nét|bộ thủ|ghi chú'  (số nét phồn thể khác thì viết 8/16)

export function parseTokens(str) {
  return str.trim().split(/\s+/).map(tok => {
    const k = tok.indexOf('/');
    if (k < 0) return [tok, '', ''];
    return [tok.slice(0, k), '', tok.slice(k + 1).replace(/_/g, ' ')];
  });
}

export function sent(line) {
  const [zh, vi = ''] = line.split(';;');
  return { tokens: parseTokens(zh), vi: vi.trim() };
}

const opt = o => (typeof o === 'string' && o.startsWith('@') ? { s: o.slice(1) } : o);

function word(line) {
  const [s, py, hv, vi, pos = ''] = line.split('|');
  return { s, py, hv, vi, pos };
}

function char(line) {
  const [s, py, hv, vi, strokes, radical, note = ''] = line.split('|');
  const [n, nT] = strokes.split('/').map(Number);
  return { s, py, hv, vi, strokes: n, strokesT: nT || undefined, radical, note };
}

function question(q) {
  return { ...q, options: q.options.map(opt) };
}

export function lesson(raw) {
  const [ts, tpy] = raw.title.split('|');
  return {
    id: raw.id, level: raw.level, no: raw.no,
    title: { s: ts, py: tpy }, vi: raw.vi, goal: raw.goal,
    vocab: raw.vocab.map(word),
    grammar: raw.grammar.map(g => ({
      title: g.title, formula: g.formula, explain: g.explain,
      examples: g.ex.map(e => {
        // 'câu hỏi >> câu đáp ;; nghĩa'
        const [zh, vi = ''] = e.split(';;');
        const [a, b] = zh.split('>>');
        return { tokens: parseTokens(a), reply: b ? parseTokens(b) : undefined, vi: vi.trim() };
      }),
    })),
    hanzi: raw.hanzi.map(char),
    reading: {
      title: raw.reading.title,
      people: Object.fromEntries(Object.entries(raw.reading.people).map(([k, v]) => {
        const [s, py] = v.split('|');
        return [k, { s, py }];
      })),
      lines: raw.reading.lines.map(l => {
        const m = l.match(/^(\w):\s*(.*)$/);
        return { who: m[1], ...sent(m[2]) };
      }),
      newWords: raw.reading.newWords,
      questions: raw.reading.questions,
    },
    listening: raw.listening.map(question),
    quiz: raw.quiz.map(question),
  };
}
