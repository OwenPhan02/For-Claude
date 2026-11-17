// Trang pháp lý: điều khoản, bảo mật, hoàn tiền, nguồn hình ảnh & thư viện.
import { t } from '../i18n.js';

const CONTACT = 'hungpcv02.work@gmail.com';
const UPDATED = '2026-11-17';
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`;

const DOCS = {
  terms: {
    title: 'Điều khoản sử dụng',
    body: `
      <h3>1. Giới thiệu</h3>
      <p>"Tự học Tiếng Trung" là ứng dụng web giúp người Việt tự học tiếng Trung theo chuẩn HSK 1–6. Khi sử dụng ứng dụng hoặc tạo tài khoản, bạn đồng ý với các điều khoản dưới đây.</p>
      <h3>2. Tài khoản</h3>
      <ul>
        <li>Bạn có thể học mà không cần tài khoản; tiến độ khi đó chỉ lưu trên trình duyệt của bạn.</li>
        <li>Khi đăng ký (bằng email hoặc Google), bạn cần cung cấp thông tin đúng và tự bảo mật mật khẩu của mình.</li>
        <li>Mỗi người nên dùng một tài khoản riêng; không dùng tài khoản của người khác.</li>
        <li>Tên hiển thị trên bảng xếp hạng không được mang nội dung xúc phạm, mạo danh hoặc quảng cáo. Chúng tôi có thể xóa tên hoặc tài khoản vi phạm.</li>
      </ul>
      <h3>3. Chi phí</h3>
      <p>Hiện toàn bộ bài học, bài kiểm tra, đề thi thử và trò chơi đều <b>miễn phí</b>. Nếu sau này có nội dung trả phí, giá và cách thanh toán sẽ được thông báo rõ trong ứng dụng trước khi áp dụng, và điều khoản này sẽ được cập nhật.</p>
      <h3>4. Nội dung học</h3>
      <ul>
        <li>Nội dung bài học do nhóm phát triển tự biên soạn theo danh sách từ vựng HSK 2.0 công khai; không sao chép giáo trình đã xuất bản.</li>
        <li>Đề thi thử chỉ <b>mô phỏng</b> dạng bài HSK, không phải đề thi chính thức và không bảo đảm kết quả thi thật.</li>
        <li>Chúng tôi cố gắng bảo đảm nội dung chính xác nhưng vẫn có thể có sai sót. Nếu phát hiện lỗi, hãy báo cho chúng tôi qua email bên dưới.</li>
      </ul>
      <h3>5. Bản quyền</h3>
      <p>Nội dung, giao diện và mã nguồn của ứng dụng thuộc về nhóm phát triển. Bạn được dùng để học cá nhân; không sao chép, bán lại hoặc phát tán lại khi chưa có sự đồng ý bằng văn bản. Các thư viện và phông chữ bên thứ ba tuân theo giấy phép riêng (xem mục "Nguồn hình ảnh & thư viện").</p>
      <h3>6. Hành vi bị cấm</h3>
      <p>Không can thiệp trái phép vào hệ thống, gian lận điểm XP / bảng xếp hạng, hoặc dùng ứng dụng vào mục đích vi phạm pháp luật.</p>
      <h3>7. Giới hạn trách nhiệm</h3>
      <p>Ứng dụng được cung cấp "như hiện có". Chúng tôi không chịu trách nhiệm cho thiệt hại phát sinh do gián đoạn dịch vụ hoặc mất dữ liệu lưu trên trình duyệt.</p>
      <h3>8. Thay đổi điều khoản</h3>
      <p>Điều khoản có thể được cập nhật; ngày cập nhật ghi ở đầu trang. Tiếp tục sử dụng sau khi cập nhật nghĩa là bạn đồng ý với nội dung mới.</p>
      <h3>9. Liên hệ</h3>
      <p>Email hỗ trợ: ${mail}</p>`,
  },
  privacy: {
    title: 'Chính sách bảo mật',
    body: `
      <h3>1. Dữ liệu chúng tôi thu thập</h3>
      <ul>
        <li><b>Không đăng nhập:</b> tiến độ học (bài đã học, XP, chuỗi ngày, thẻ ôn tập), cài đặt giao diện được lưu <b>trên trình duyệt của bạn</b> (localStorage). Chúng tôi không nhận được các dữ liệu này.</li>
        <li><b>Khi đăng nhập:</b> email, tên hiển thị (và ảnh đại diện nếu dùng Google) do Firebase Authentication quản lý; tiến độ học được đồng bộ lên Cloud Firestore để dùng trên nhiều thiết bị.</li>
        <li><b>Bảng xếp hạng tuần:</b> tên hiển thị và số XP trong tuần – <b>công khai</b> với người dùng khác.</li>
      </ul>
      <h3>2. Mục đích sử dụng</h3>
      <p>Chỉ để lưu và đồng bộ tiến độ học, hiển thị bảng xếp hạng và hỗ trợ khi bạn liên hệ. Chúng tôi <b>không bán</b> dữ liệu, không dùng cho quảng cáo nhắm mục tiêu.</p>
      <h3>3. Nơi lưu trữ & bảo vệ</h3>
      <p>Dữ liệu tài khoản được lưu trên Google Firebase (máy chủ Firestore đặt tại Singapore). Quy tắc bảo mật chỉ cho phép mỗi người đọc/ghi tiến độ của chính mình. Mật khẩu do Firebase mã hóa; chúng tôi không xem được mật khẩu của bạn.</p>
      <h3>4. Dịch vụ bên thứ ba</h3>
      <ul>
        <li>Google Firebase (đăng nhập, cơ sở dữ liệu, lưu trữ web).</li>
        <li>Google Fonts (tải phông chữ) và jsDelivr (tải thư viện viết chữ Hán) – các dịch vụ này có thể ghi nhận địa chỉ IP khi trình duyệt tải tệp.</li>
        <li>Phát âm dùng giọng đọc có sẵn của trình duyệt / hệ điều hành (Web Speech API).</li>
      </ul>
      <h3>5. Cookie</h3>
      <p>Ứng dụng không dùng cookie quảng cáo hay theo dõi. Firebase có thể lưu dữ liệu phiên đăng nhập trong trình duyệt.</p>
      <h3>6. Quyền của bạn</h3>
      <ul>
        <li>Xóa dữ liệu trên máy: xóa dữ liệu trang web trong cài đặt trình duyệt.</li>
        <li>Xem, sửa hoặc xóa tài khoản và dữ liệu đã đồng bộ: gửi yêu cầu đến ${mail}, chúng tôi xử lý trong vòng 30 ngày.</li>
      </ul>
      <h3>7. Trẻ em</h3>
      <p>Người dưới 13 tuổi nên dùng ứng dụng với sự đồng ý và giám sát của cha mẹ hoặc người giám hộ.</p>
      <h3>8. Liên hệ</h3>
      <p>Mọi câu hỏi về quyền riêng tư: ${mail}</p>`,
  },
  refund: {
    title: 'Chính sách hoàn tiền',
    body: `
      <h3>1. Hiện tại</h3>
      <p>Toàn bộ nội dung đang <b>miễn phí</b>; ứng dụng không thu bất kỳ khoản phí nào, vì vậy chưa phát sinh việc hoàn tiền.</p>
      <h3>2. Nếu có gói trả phí trong tương lai</h3>
      <ul>
        <li>Giá, quyền lợi và chính sách hoàn tiền cụ thể sẽ được công bố trước khi bán.</li>
        <li>Yêu cầu hoàn tiền do lỗi thanh toán (trừ tiền hai lần, trừ tiền nhưng không mở được nội dung) sẽ được xử lý ưu tiên.</li>
      </ul>
      <h3>3. Cảnh báo lừa đảo</h3>
      <p>Chúng tôi <b>không</b> yêu cầu chuyển khoản qua tin nhắn cá nhân. Nếu có ai thu tiền nhân danh "Tự học Tiếng Trung", hãy báo cho chúng tôi.</p>
      <h3>4. Liên hệ</h3>
      <p>${mail}</p>`,
  },
  credits: {
    title: 'Nguồn hình ảnh & thư viện',
    body: `
      <p>Biểu tượng trong ứng dụng là emoji hiển thị theo phông của thiết bị; hình minh họa và biểu đồ thanh điệu do nhóm phát triển tự vẽ bằng SVG/CSS.</p>
      <table class="simple">
        <tr><th>Thành phần</th><th>Dùng cho</th><th>Giấy phép</th></tr>
        <tr><td><a href="https://hanziwriter.org" target="_blank" rel="noopener">Hanzi Writer</a></td><td>Hoạt ảnh thứ tự nét, luyện viết chữ Hán</td><td>MIT</td></tr>
        <tr><td><a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noopener">Make Me a Hanzi</a></td><td>Dữ liệu nét chữ (qua Hanzi Writer)</td><td>LGPL / Arphic Public License</td></tr>
        <tr><td><a href="https://fonts.google.com/specimen/Be+Vietnam+Pro" target="_blank" rel="noopener">Be Vietnam Pro</a></td><td>Phông chữ giao diện</td><td>SIL Open Font License</td></tr>
        <tr><td><a href="https://fonts.google.com/noto" target="_blank" rel="noopener">Noto Sans SC / TC</a></td><td>Phông chữ Hán giản thể / phồn thể</td><td>SIL Open Font License</td></tr>
        <tr><td>Google Firebase</td><td>Đăng nhập, cơ sở dữ liệu, lưu trữ web</td><td>Điều khoản dịch vụ của Google</td></tr>
        <tr><td>Danh sách từ vựng HSK 2.0</td><td>Phạm vi từ vựng các bài học</td><td>Danh sách công khai của kỳ thi HSK</td></tr>
      </table>
      <p class="muted small">Nếu bạn là chủ sở hữu một tài nguyên và thấy ghi công chưa đúng, vui lòng liên hệ ${mail}.</p>`,
  },
};

export function render(el, { doc }) {
  const key = DOCS[doc] ? doc : 'terms';
  const d = DOCS[key];
  el.innerHTML = `
    <nav class="tabs">
      ${Object.entries(DOCS).map(([k, v]) => `<a href="#/legal/${k}" class="${k === key ? 'active' : ''}">${v.title}</a>`).join('')}
    </nav>
    <article class="card legal">
      <h1>${d.title}</h1>
      <p class="muted small">Cập nhật lần cuối: ${UPDATED}</p>
      ${t('legal.viOnly') ? `<p class="tipbox small">${t('legal.viOnly')}</p>` : ''}
      ${d.body}
      <p style="margin-top:20px"><a href="javascript:history.back()">← Quay lại</a></p>
    </article>`;
}
