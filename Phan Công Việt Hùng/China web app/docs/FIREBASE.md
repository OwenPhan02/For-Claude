# Kích hoạt tài khoản và đưa app lên mạng (Firebase)

Code đã sẵn sàng. Chỉ còn các bước cần tài khoản Google của chủ app.

## 1. Tạo dự án (chủ app tự làm, khoảng 5 phút)
1. Vào https://console.firebase.google.com và đăng nhập Gmail.
2. **Create a project**: đặt tên (ví dụ `tu-hoc-tieng-trung`), tắt Google Analytics.
3. Bấm biểu tượng **`</>`** (Web app), đặt tên, bấm Register, rồi copy đoạn `firebaseConfig`.
4. **Build → Authentication → Get started**: bật *Email/Password* và *Google*.
5. **Build → Firestore Database → Create database**: chọn vùng `asia-southeast1`, chế độ *production*.

## 2. Gắn cấu hình (Claude làm)
- Dán `firebaseConfig` vào `js/firebase-config.js`.
- Đưa luật bảo mật `firestore.rules` lên Firebase.

## 3. Đưa lên mạng (Claude làm, chủ app xác nhận đăng nhập trên trình duyệt)
```
npx firebase-tools login
npx firebase-tools use --add          # chọn dự án vừa tạo
npx firebase-tools deploy --only hosting,firestore:rules
```
Sau khi deploy xong, app có địa chỉ dạng `https://<tên-dự-án>.web.app`.

## Chi phí
Gói Spark miễn phí, không cần thẻ ngân hàng. Khi vượt hạn mức miễn phí, dịch vụ tạm dừng chứ không tự trừ tiền.
