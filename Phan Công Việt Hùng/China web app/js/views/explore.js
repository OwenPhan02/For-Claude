import { esc, zhs } from '../util.js';

const ITEMS = [
  { href: '#/test', icon: '级', title: 'Bài test trình độ', desc: 'HSK 1 → 6: biết mình đang ở đâu, nên học bài nào.' },
  { href: '#/exam', icon: '考', title: 'Đề thi thử HSK', desc: 'Nghe – Đọc – Từ vựng, có tính giờ, mỗi lần một đề mới.' },
  { href: '#/radicals', icon: '部', title: '50 bộ thủ thường gặp', desc: 'Chìa khóa đoán nghĩa chữ Hán, kèm trò đoán bộ.' },
  { href: '#/culture', icon: '茶', title: 'Văn hóa Trung Hoa', desc: 'Tết, trà, ăn uống, phép lịch sự, con số may mắn…' },
  { href: '#/songs', icon: '歌', title: 'Học qua bài hát', desc: 'Đồng dao và bài hát thiếu nhi dân gian có pinyin.' },
  { href: '#/game/grab', icon: '听', title: 'Trò chơi: Nghe – giành thẻ', desc: 'Nghe đọc, nhanh tay chọn đúng chữ trước khi hết giờ.' },
  { href: '#/game/chain', icon: '龙', title: 'Trò chơi: Nối chữ 接龙', desc: 'Chữ cuối của từ trước là chữ đầu của từ sau.' },
];

export function render(el) {
  el.innerHTML = `
    <div class="eyebrow">Khám phá</div>
    <h1>🧭 Khám phá thêm</h1>
    <p class="muted">Ngoài bài học chính, đây là những cách học vui hơn và hiểu sâu hơn về tiếng Trung.</p>
    <div class="grid grid-2">
      ${ITEMS.map(it => `
        <a class="card tile" href="${it.href}" style="margin:0;color:inherit;text-decoration:none">
          <div class="tile-icon zh">${esc(zhs(it.icon))}</div>
          <div class="tile-body"><b>${esc(it.title)}</b><span class="muted small">${esc(it.desc)}</span></div>
        </a>`).join('')}
    </div>`;
}
