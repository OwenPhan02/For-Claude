# Kế hoạch HSK 5 – HSK 6 (khuôn bài gọn)

- HSK 5: 1300 từ mới (`docs/data/hsk5-official.txt`, theo thứ tự pinyin), chia **26 bài × 50 từ** theo đúng thứ tự danh sách.
  - Bài N = từ thứ (N−1)×50+1 đến N×50. In nhóm: `node -e "const w=require('fs').readFileSync('docs/data/hsk5-official.txt','utf8').trim().split(/\s+/);console.log(w.slice((N-1)*50,N*50).join(' '))"`
  - File: `js/data/hsk5a.js` (bài 1–4), `hsk5b.js` (5–8), `hsk5c.js` (9–12), `hsk5d.js` (13–16), `hsk5e.js` (17–20), `hsk5f.js` (21–24), `hsk5g.js` (25–26).
- Mỗi bài: `vocab` (50 từ, có Hán Việt), `grammar` (2–3 điểm lấy từ chính các từ trong bài, ưu tiên bẫy Hán Việt), `quiz` (2 câu riêng). Không có `hanzi` / `reading` / `listening` – app tự ẩn tab và tự sinh câu nghe.
- HSK 6: 2500 từ, làm tương tự sau khi xong HSK 5 (cần lấy danh sách chính thức trước).

## HSK 6 (đã có danh sách)
- `docs/data/hsk6-official.txt` (2499 từ) → `docs/data/hsk6-new.txt` (2498 từ chưa có ở HSK 1–5, thứ tự pinyin).
- Chia **50 bài × 50 từ** (bài 50 có 48 từ). In nhóm N: `node -e "const w=require('fs').readFileSync('docs/data/hsk6-new.txt','utf8').trim().split(/\s+/);console.log(w.slice((N-1)*50,N*50).join(' '))"`
- File: `js/data/hsk6a.js` (bài 1–4), `hsk6b.js` (5–8), … mỗi file 4 bài. Khuôn bài gọn như HSK 5; ưu tiên thành ngữ (成语) và bẫy Hán Việt trong phần ngữ pháp.
