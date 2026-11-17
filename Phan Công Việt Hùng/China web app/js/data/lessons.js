import { HSK1 } from './hsk1.js';
import { HSK1B } from './hsk1b.js';
import { HSK1C } from './hsk1c.js';
import { HSK1D } from './hsk1d.js';
import { HSK2A } from './hsk2a.js';
import { HSK2B } from './hsk2b.js';
import { HSK3A } from './hsk3a.js';
import { HSK3B } from './hsk3b.js';
import { HSK3C } from './hsk3c.js';
import { HSK4A } from './hsk4a.js';
import { HSK4B } from './hsk4b.js';
import { HSK4C } from './hsk4c.js';
import { HSK4D } from './hsk4d.js';
import { HSK4E } from './hsk4e.js';
import { HSK4F } from './hsk4f.js';
import { HSK5A } from './hsk5a.js';
import { HSK5B } from './hsk5b.js';
import { HSK5C } from './hsk5c.js';
import { HSK5D } from './hsk5d.js';
import { HSK5E } from './hsk5e.js';

export const LEVELS = [
  { level: 1, name: 'HSK 1', words: 150, desc: 'Chào hỏi, số đếm, gia đình, thời gian – giao tiếp cơ bản nhất.', lessons: [...HSK1, ...HSK1B, ...HSK1C, ...HSK1D] },
  { level: 2, name: 'HSK 2', words: 300, desc: 'Sức khỏe, mua sắm, hỏi đường, du lịch, công việc – giao tiếp đời sống hằng ngày.', lessons: [...HSK2A, ...HSK2B] },
  { level: 3, name: 'HSK 3', words: 600, desc: 'Câu 把, 被, so sánh nâng cao; học tập, công việc, sức khỏe, thành phố – xử lý hầu hết tình huống đời sống.', lessons: [...HSK3A, ...HSK3B, ...HSK3C] },
  { level: 4, name: 'HSK 4', words: 1200, desc: 'Thảo luận nhiều chủ đề, nói chuyện trôi chảy với người bản xứ: tình cảm, du lịch, công việc, xã hội.', lessons: [...HSK4A, ...HSK4B, ...HSK4C, ...HSK4D, ...HSK4E, ...HSK4F] },
  { level: 5, name: 'HSK 5', words: 2500, desc: 'Đọc báo, xem phim, thuyết trình. Bài dạng gọn: 50 từ/bài, ngữ pháp trọng tâm, nghe và kiểm tra tự sinh.', lessons: [...HSK5A, ...HSK5B, ...HSK5C, ...HSK5D, ...HSK5E] },
  { level: 6, name: 'HSK 6', words: '5000+', desc: 'Hiểu và diễn đạt trôi chảy bằng nói và viết.', lessons: [] },
];

export const ALL_LESSONS = LEVELS.flatMap(l => l.lessons);
export const getLesson = id => ALL_LESSONS.find(l => l.id === id);

/** Từ vựng của các bài đã mở (để làm thử thách mỗi ngày). */
export function vocabPool(lessonIds) {
  const ls = lessonIds?.length ? ALL_LESSONS.filter(l => lessonIds.includes(l.id)) : ALL_LESSONS.slice(0, 1);
  return ls.flatMap(l => l.vocab);
}
