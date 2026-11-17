# 中文之路 – Lộ trình xây dựng web app học tiếng Trung

Mẫu tham khảo: https://wellcome-to-japan.web.app (học tiếng Nhật N5–N1).
Đối tượng: **người Việt mới học**. Giao diện tiếng Việt, mỗi chữ Hán có **âm Hán Việt**.
Chữ: **giản thể + phồn thể**, có nút chuyển. Cấp độ: **HSK 1 → HSK 6**.

## Công nghệ
- HTML + CSS + JavaScript thuần (ES modules), **không cần build**, nên không có `node_modules` trên Google Drive.
- Router dạng `#/...` giống trang mẫu.
- Phát âm: Web Speech API (giọng `zh-CN` có sẵn trong trình duyệt/điện thoại).
- Thứ tự nét chữ Hán: thư viện `hanzi-writer` (CDN jsdelivr).
- Lưu tiến độ: `localStorage` (giai đoạn 1–2), sau đó Firebase Auth + Firestore (giai đoạn 3).
- Chạy thử trên máy: `node server.mjs`, rồi mở http://localhost:5173

## Cấu trúc bài học (giống trang mẫu)
Mỗi bài gồm: **Từ vựng** (thẻ lật + phát âm), **Ngữ pháp**, **Chữ Hán** (thứ tự nét, bộ thủ, Hán Việt),
**Đọc** (đoạn hội thoại có pinyin bật/tắt), **Nghe** (câu hỏi nghe), **Kiểm tra** (10 câu).

## Checklist

### Giai đoạn 1 – Khung và nội dung nhập môn
- [x] Khung app: router, header, nút giản/phồn, giao diện sáng/tối, mobile
- [x] Lưu tiến độ: XP, XP hôm nay (tối đa 20/ngày từ thử thách), chuỗi ngày học, danh hiệu
- [x] Phát âm tiếng Trung (TTS)
- [x] Trang Pinyin: 4 thanh điệu + thanh nhẹ, 21 thanh mẫu, vận mẫu, mẹo phát âm cho người Việt, luyện nghe thanh điệu
- [x] HSK 1 – Bài 1 (chào hỏi) đầy đủ 6 phần
- [x] Thử thách 5 câu hôm nay
- [x] Trang chủ giống trang mẫu (hero, hôm nay, 3 bước đầu tiên, các khối học)

- [x] Trang Bài học, Thành tích (danh hiệu 新手 → 状元, 8 huy hiệu), server chạy thử `server.mjs`
- Đã kiểm tra trên Chrome (17/11/2026): các trang chạy được, không lỗi console, nút 简/繁 hoạt động.

### Giai đoạn 2 – Nội dung và tính năng học
- [x] HSK 1: bài 2–13 (13 bài, 228 từ – đủ 150 từ HSK 1 chuẩn + từ bổ trợ)
- [x] Đổi tên "Tự học Tiếng Trung", chọn ngôn ngữ giao diện vi/en/zh, tự chuyển phồn thể
- [x] Ôn tập theo lặp lại ngắt quãng (SRS) cho từ đã học – 3 kiểu ôn, phím tắt Space/1-4
- [x] Luyện viết chữ Hán (hanzi-writer quiz mode) – trong trang Ôn tập
- [x] 50 bộ thủ thường gặp + trò đoán bộ thủ
- [ ] Bài test trình độ HSK 1→6 (giống "Bạn đang ở trình độ nào?")
- [x] Văn hóa Trung Quốc: 8 bài (Tết, trà, bàn ăn, con số, Trung thu, xưng hô, tặng quà, thư pháp), "Văn hóa hôm nay" ở trang chủ
- [x] Học qua bài hát: 3 đồng dao dân gian + 4 bài thơ Đường (có âm Hán Việt), đọc theo từng dòng
- [x] Mini game 1: "Nghe – giành thẻ" đấu với gấu trúc 熊猫, 3 mức độ
- [x] Mini game 2: Nối chữ 接龙 (từ bài đã học + 70 từ bổ trợ), 12 giây/lượt
- [ ] Huy hiệu & trang thành tích
- [ ] HSK 2, HSK 3 (cùng khuôn bài)

### Giai đoạn 3 – Tài khoản và đưa lên mạng
- [ ] Firebase project + Hosting (cần bạn tạo tài khoản Firebase)
- [ ] Đăng ký / đăng nhập (email, Google)
- [ ] Đồng bộ tiến độ lên Firestore
- [ ] Bảng xếp hạng tuần
- [ ] Đề thi thử HSK 1–6
- [ ] HSK 4–6

## Câu hỏi cần hỏi bạn (khi tới nơi)
- Tên app chính thức? (tạm đặt: **中文之路 · Đường đến Trung văn**)
- Tài khoản Firebase/Google dùng để đưa app lên mạng
