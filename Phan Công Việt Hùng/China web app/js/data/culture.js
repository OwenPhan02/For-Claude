// Bài văn hóa ngắn (tự soạn). words: 's|pinyin|hán việt|nghĩa'
export const CULTURE = [
  {
    id: 'chunjie', zh: '春节', py: 'Chūnjié', title: 'Tết Nguyên đán', icon: '🧧',
    summary: 'Giống mà khác: Tết của người Trung Quốc so với Tết Việt.',
    body: [
      'Tết Nguyên đán ở Trung Quốc gọi là <b>春节</b> (Xuân tiết) – lễ hội quan trọng nhất trong năm, rơi vào cùng ngày với Tết Việt vì cùng theo âm lịch.',
      'Đêm giao thừa (除夕 chúxī), cả nhà quây quần ăn bữa cơm đoàn viên (年夜饭). Ở miền Bắc Trung Quốc, món không thể thiếu là <b>bánh sủi cảo</b> (饺子 jiǎozi) vì hình giống thỏi bạc ngày xưa – tượng trưng cho tiền tài. Miền Nam thì hay ăn bánh tổ (年糕 niángāo), nghĩa là "năm sau cao hơn năm trước".',
      'Người lớn mừng tuổi trẻ em bằng <b>bao lì xì đỏ</b> (红包 hóngbāo). Ngày nay rất nhiều người gửi lì xì qua WeChat. Nhà nhà dán câu đối đỏ (春联) và chữ 福 (phúc) – thường dán <b>ngược</b>, vì "phúc ngược" (福倒了) đọc giống "phúc đến" (福到了).',
      'Câu chúc phổ biến nhất: <b>新年快乐！</b> (Chúc mừng năm mới!) và <b>恭喜发财！</b> (Cung hỷ phát tài!).',
    ],
    words: ['春节|Chūnjié|xuân tiết|Tết Nguyên đán', '饺子|jiǎozi|giảo tử|bánh sủi cảo', '红包|hóngbāo|hồng bao|bao lì xì', '新年快乐|xīnnián kuàilè|tân niên khoái lạc|Chúc mừng năm mới', '恭喜发财|gōngxǐ fācái|cung hỷ phát tài|Chúc phát tài'],
    tip: 'Người Trung Quốc gọi Tết là "Xuân tiết" chứ không nói "Nguyên đán". 元旦 (Nguyên đán) ở Trung Quốc là ngày 1/1 dương lịch!',
  },
  {
    id: 'tea', zh: '茶文化', py: 'chá wénhuà', title: 'Văn hóa trà', icon: '🍵',
    summary: 'Uống trà, mời trà và gõ ngón tay cảm ơn.',
    body: [
      'Trung Quốc là quê hương của cây trà. Có 6 nhóm trà chính, phân theo mức lên men: trà xanh (绿茶), trà trắng (白茶), trà vàng (黄茶), trà ô long (乌龙茶), trà đen – người Việt hay gọi là hồng trà (红茶) – và trà Phổ Nhĩ (普洱茶).',
      'Khi được rót trà, người Quảng Đông và nhiều vùng phía Nam có thói quen <b>gõ nhẹ hai ngón tay xuống bàn</b> để cảm ơn mà không cần ngắt lời câu chuyện.',
      'Chủ nhà rót trà <b>chỉ khoảng bảy phần chén</b> (茶七分满) – để khách cầm không bị bỏng và thể hiện sự tôn trọng. Ngược lại, rót rượu thì rót đầy.',
    ],
    words: ['茶|chá|trà|trà', '绿茶|lǜchá|lục trà|trà xanh', '红茶|hóngchá|hồng trà|trà đen', '乌龙茶|wūlóngchá|ô long trà|trà ô long', '请喝茶|qǐng hē chá|thỉnh hát trà|mời uống trà'],
    tip: '"Hồng trà" của tiếng Việt chính là 红茶 – nhưng tiếng Anh lại gọi là "black tea". Đừng dịch thành "trà đỏ" nhé!',
  },
  {
    id: 'table', zh: '餐桌礼仪', py: 'cānzhuō lǐyí', title: 'Phép lịch sự trên bàn ăn', icon: '🥢',
    summary: 'Đũa, gắp thức ăn và ai trả tiền.',
    body: [
      'Người Trung Quốc ăn chung, các món đặt giữa bàn (thường trên mâm xoay ở nhà hàng). Khách quý hoặc người lớn tuổi được mời gắp trước.',
      'Kiêng <b>cắm đũa thẳng đứng vào bát cơm</b> vì giống nén hương cúng người đã khuất – điều này giống hệt quan niệm của người Việt. Cũng không gõ đũa vào bát.',
      'Đi ăn với người Trung Quốc, mọi người thường <b>tranh nhau trả tiền</b> (抢着买单) để thể hiện sự hào phóng; chia đều tiền (AA制) phổ biến hơn trong giới trẻ.',
      'Khi chạm cốc, nói <b>干杯！</b> (cạn ly!). Người nhỏ tuổi nên chạm miệng cốc thấp hơn cốc của người lớn để tỏ lòng kính trọng.',
    ],
    words: ['筷子|kuàizi|khoái tử|đũa', '买单|mǎidān|mãi đơn|thanh toán (ở nhà hàng)', '干杯|gānbēi|can bôi|cạn ly', '好吃|hǎochī|hảo ngật|ngon', '我请客|wǒ qǐngkè|ngã thỉnh khách|tôi mời (tôi trả tiền)'],
    tip: 'Ở nhà hàng, gọi phục vụ trả tiền: "服务员，买单！" (Phục vụ ơi, tính tiền!).',
  },
  {
    id: 'numbers', zh: '吉利数字', py: 'jílì shùzì', title: 'Con số may mắn và kiêng kỵ', icon: '🔢',
    summary: 'Vì sao số 8 được yêu, số 4 bị tránh.',
    body: [
      'Số <b>8</b> (八 bā) đọc gần giống 发 (fā – phát, phát tài), nên rất được ưa chuộng: biển số xe, số điện thoại có nhiều số 8 rất đắt. Lễ khai mạc Olympic Bắc Kinh bắt đầu lúc 8 giờ 8 phút tối ngày 8/8/2008.',
      'Số <b>4</b> (四 sì) đọc gần giống 死 (sǐ – chết), nên nhiều tòa nhà không có tầng 4, giống quan niệm "tứ" của một số người Việt.',
      'Số <b>6</b> (六 liù) gợi 溜 (trơn tru): 66 = "lục lục đại thuận". Số <b>9</b> (九 jiǔ) đồng âm với 久 (lâu dài), hay dùng trong đám cưới.',
      'Giới trẻ còn nhắn tin bằng số: <b>520</b> (wǔ èr líng) nghe giống 我爱你 (anh yêu em), <b>88</b> = bye bye.',
    ],
    words: ['八|bā|bát|tám', '发财|fācái|phát tài|phát tài', '四|sì|tứ|bốn', '久|jiǔ|cửu|lâu dài', '我爱你|wǒ ài nǐ|ngã ái nhĩ|anh yêu em'],
    tip: 'Ngày 20/5 (520) ở Trung Quốc được coi như một "ngày lễ tình nhân" của giới trẻ.',
  },
  {
    id: 'midautumn', zh: '中秋节', py: 'Zhōngqiūjié', title: 'Tết Trung thu', icon: '🥮',
    summary: 'Đoàn viên dưới trăng rằm tháng Tám.',
    body: [
      'Trung thu (中秋节) vào ngày 15 tháng 8 âm lịch. Ở Việt Nam đây là "Tết thiếu nhi", còn ở Trung Quốc ý nghĩa chính là <b>đoàn viên gia đình</b> – người đi xa cố gắng về nhà, cả nhà ngắm trăng và ăn bánh.',
      'Bánh trung thu gọi là <b>月饼</b> (yuèbing – bánh trăng). Vỏ bánh và nhân rất đa dạng: hạt sen, đậu đỏ, thập cẩm, lòng đỏ trứng muối.',
      'Truyền thuyết nổi tiếng là chuyện <b>Hằng Nga bay lên cung trăng</b> (嫦娥奔月) – trong văn hóa Việt cũng có chị Hằng, chú Cuội.',
    ],
    words: ['中秋节|Zhōngqiūjié|Trung thu tiết|Tết Trung thu', '月饼|yuèbing|nguyệt bính|bánh trung thu', '月亮|yuèliang|nguyệt lượng|mặt trăng', '团圆|tuányuán|đoàn viên|đoàn viên', '中秋快乐|Zhōngqiū kuàilè|Trung thu khoái lạc|Trung thu vui vẻ'],
    tip: 'Trung thu là ngày nghỉ lễ chính thức ở Trung Quốc.',
  },
  {
    id: 'address', zh: '称呼', py: 'chēnghu', title: 'Cách xưng hô', icon: '🙋',
    summary: 'Gọi người khác thế nào cho đúng.',
    body: [
      'Tiếng Việt có rất nhiều đại từ xưng hô (anh, chị, em, cô, chú…), còn tiếng Trung đơn giản hơn: <b>我</b> (tôi) và <b>你 / 您</b> (bạn / ngài) dùng với hầu hết mọi người.',
      'Gọi người khác thường dùng <b>họ + chức danh</b>: 王老师 (thầy/cô Vương), 李医生 (bác sĩ Lý), 张经理 (giám đốc Trương). Gọi người lớn tuổi hơn mình kiểu thân mật: 老 + họ (老王), người nhỏ tuổi hơn: 小 + họ (小李).',
      'Gọi người lạ ngoài đường: 先生 (ông/anh), 女士 (bà/chị), gọi trẻ em là 小朋友. Ở nhà hàng gọi phục vụ là 服务员. Một số vùng gọi 帅哥 (anh đẹp trai) và 美女 (người đẹp) rất tự nhiên!',
    ],
    words: ['您|nín|nâm|ngài (kính trọng)', '老师|lǎoshī|lão sư|thầy/cô giáo', '先生|xiānsheng|tiên sinh|ông, anh', '女士|nǚshì|nữ sĩ|bà, chị', '小朋友|xiǎopéngyou|tiểu bằng hữu|bạn nhỏ'],
    tip: 'Đừng gọi phụ nữ là 小姐 trong mọi trường hợp – ở một số nơi từ này mang nghĩa không hay. Dùng 女士 an toàn hơn.',
  },
  {
    id: 'gifts', zh: '送礼', py: 'sòng lǐ', title: 'Tặng quà', icon: '🎁',
    summary: 'Những món quà nên và không nên tặng.',
    body: [
      'Khi tặng quà, người Trung Quốc thường đưa và nhận <b>bằng hai tay</b>. Người nhận hay từ chối vài lần cho lịch sự rồi mới nhận, và thường không mở quà trước mặt người tặng.',
      'Không tặng <b>đồng hồ để bàn</b>: 送钟 (sòng zhōng – tặng đồng hồ) đọc giống 送终 (lo tang lễ). Không tặng <b>ô (dù)</b>: 伞 (sǎn) gần âm 散 (chia ly). Không cắt <b>lê</b> chia nhau: 分梨 (chia lê) giống 分离 (chia lìa).',
      'Quà tốt: trà ngon, hoa quả, rượu, đặc sản quê hương. Phong bì tiền nên là số chẵn (trừ số 4) và đựng trong bao đỏ.',
    ],
    words: ['礼物|lǐwù|lễ vật|quà tặng', '送|sòng|tống|tặng; tiễn', '钟|zhōng|chung|đồng hồ (lớn)', '伞|sǎn|tản|cái ô', '谢谢你的礼物|xièxie nǐ de lǐwù|tạ tạ nhĩ đích lễ vật|cảm ơn món quà của bạn'],
    tip: 'Rất nhiều kiêng kỵ đến từ <b>chữ đồng âm</b> – một đặc điểm thú vị của tiếng Trung.',
  },
  {
    id: 'calligraphy', zh: '书法', py: 'shūfǎ', title: 'Thư pháp và "ông đồ"', icon: '🖌️',
    summary: 'Chữ Hán – nghệ thuật chung của Trung Quốc và Việt Nam xưa.',
    body: [
      'Thư pháp (书法) là nghệ thuật viết chữ Hán bằng bút lông. "Văn phòng tứ bảo" (文房四宝) gồm: bút (笔), mực (墨), giấy (纸), nghiên (砚).',
      'Người Việt cũng dùng chữ Hán (chữ Nho) suốt hơn một nghìn năm – vì vậy hình ảnh <b>ông đồ cho chữ ngày Tết</b> rất gần với tục xin chữ ở Trung Quốc. Đó cũng là lý do khoảng 60% từ vựng tiếng Việt là từ Hán Việt.',
      'Các chữ hay được xin dịp Tết: 福 (phúc), 寿 (thọ), 忍 (nhẫn), 德 (đức), 心 (tâm).',
    ],
    words: ['书法|shūfǎ|thư pháp|thư pháp', '毛笔|máobǐ|mao bút|bút lông', '福|fú|phúc|phúc, may mắn', '寿|shòu|thọ|sống lâu', '汉字|Hànzì|Hán tự|chữ Hán'],
    tip: 'Nhờ âm Hán Việt, nhìn chữ 学生 (học sinh), 老师 (lão sư), 图书馆 (đồ thư quán) bạn đã đoán được nghĩa – hãy tận dụng lợi thế này!',
  },
];

export const cultureOfDay = () => CULTURE[Math.floor(Date.now() / 864e5) % CULTURE.length];
