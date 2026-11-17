// Dữ liệu Pinyin cho người Việt. `say` = chữ Hán để máy đọc mẫu.

export const TONES = [
  { n: 1, mark: 'mā', say: '妈', vi: 'mẹ', name: 'Thanh 1 – cao bằng', contour: [[5, 5], [95, 5]],
    tip: 'Giữ giọng cao và đều, như kéo dài thanh ngang của tiếng Việt nhưng cao hơn hẳn.' },
  { n: 2, mark: 'má', say: '麻', vi: 'cây gai', name: 'Thanh 2 – đi lên', contour: [[5, 35], [95, 5]],
    tip: 'Giọng đi từ trung lên cao, gần giống dấu sắc nhưng kéo dài hơn, như khi hỏi lại "Hả?".' },
  { n: 3, mark: 'mǎ', say: '马', vi: 'con ngựa', name: 'Thanh 3 – xuống rồi lên', contour: [[5, 25], [45, 55], [95, 15]],
    tip: 'Gần dấu hỏi. Khi nói nhanh hoặc đứng trước âm khác, thường chỉ đọc nửa đầu (xuống thấp, trầm giọng).' },
  { n: 4, mark: 'mà', say: '骂', vi: 'mắng', name: 'Thanh 4 – rơi mạnh', contour: [[5, 5], [95, 55]],
    tip: 'Từ cao rơi thẳng xuống thấp, dứt khoát như ra lệnh. Mạnh hơn dấu huyền, gần dấu nặng nhưng không bị tắc.' },
  { n: 0, mark: 'ma', say: '吗', vi: '(trợ từ hỏi)', name: 'Thanh nhẹ', contour: [[40, 35], [60, 35]],
    tip: 'Đọc ngắn và nhẹ, không nhấn. Không có dấu trên pinyin.' },
];

// Thanh mẫu (phụ âm đầu)
export const INITIALS = [
  { group: 'Môi', items: [
    { p: 'b', ex: 'bā', say: '八', tip: 'Như "p" không bật hơi (nhẹ hơn chữ "b" Việt)' },
    { p: 'p', ex: 'pà', say: '怕', tip: '"p" bật mạnh hơi ra (để tờ giấy trước miệng sẽ rung)' },
    { p: 'm', ex: 'mā', say: '妈', tip: 'Như "m"' },
    { p: 'f', ex: 'fēi', say: '飞', tip: 'Như "ph"' },
  ]},
  { group: 'Đầu lưỡi', items: [
    { p: 'd', ex: 'dà', say: '大', tip: 'Như "t" không bật hơi (gần "đ" nhưng không ồm)' },
    { p: 't', ex: 'tā', say: '他', tip: 'Như "th", bật hơi mạnh' },
    { p: 'n', ex: 'nǐ', say: '你', tip: 'Như "n"' },
    { p: 'l', ex: 'lái', say: '来', tip: 'Như "l"' },
  ]},
  { group: 'Cuống lưỡi', items: [
    { p: 'g', ex: 'gē', say: '哥', tip: 'Như "c/k" không bật hơi' },
    { p: 'k', ex: 'kě', say: '可', tip: '"k" bật mạnh hơi (khác "kh" Việt)' },
    { p: 'h', ex: 'hǎo', say: '好', tip: 'Gần "kh" Việt (hơi cọ ở cuống lưỡi)' },
  ]},
  { group: 'Mặt lưỡi', items: [
    { p: 'j', ex: 'jiā', say: '家', tip: 'Gần "ch" Việt, không bật hơi' },
    { p: 'q', ex: 'qī', say: '七', tip: '"ch" bật mạnh hơi' },
    { p: 'x', ex: 'xiè', say: '谢', tip: 'Gần "x" Việt, lưỡi bẹt, môi dẹt' },
  ]},
  { group: 'Cong lưỡi', items: [
    { p: 'zh', ex: 'zhōng', say: '中', tip: 'Gần "tr" Việt (cong lưỡi), không bật hơi' },
    { p: 'ch', ex: 'chī', say: '吃', tip: '"tr" cong lưỡi, bật mạnh hơi' },
    { p: 'sh', ex: 'shì', say: '是', tip: 'Gần "s" cong lưỡi (kiểu miền Nam/chuẩn)' },
    { p: 'r', ex: 'rè', say: '热', tip: 'Cong lưỡi như sh nhưng có rung, gần "r" nhẹ' },
  ]},
  { group: 'Đầu lưỡi – răng', items: [
    { p: 'z', ex: 'zài', say: '在', tip: 'Như "ts" (chạm đầu lưỡi sau răng), không bật hơi' },
    { p: 'c', ex: 'cài', say: '菜', tip: '"ts" bật mạnh hơi' },
    { p: 's', ex: 'sān', say: '三', tip: 'Như "x" Việt' },
  ]},
  { group: 'Bán nguyên âm', items: [
    { p: 'y', ex: 'yī', say: '一', tip: 'Viết thay cho i- đứng đầu: yi = i' },
    { p: 'w', ex: 'wǒ', say: '我', tip: 'Viết thay cho u- đứng đầu: wo = uo' },
  ]},
];

// Vận mẫu (phần vần)
export const FINALS = [
  { group: 'Nguyên âm đơn', items: [
    { p: 'a', ex: 'ā', say: '啊', tip: 'Như "a"' },
    { p: 'o', ex: 'wǒ', say: '我', tip: 'Như "ua/uô" tròn môi (bo ≈ "pua")' },
    { p: 'e', ex: 'è', say: '饿', tip: 'Gần "ưa/ơ" – miệng hơi mở, không tròn môi' },
    { p: 'i', ex: 'yī', say: '一', tip: 'Như "i". Sau z c s zh ch sh r thì đọc như "ư"' },
    { p: 'u', ex: 'wǔ', say: '五', tip: 'Như "u"' },
    { p: 'ü', ex: 'yú', say: '鱼', tip: 'Đọc "i" nhưng tròn môi (gần "uy" ngắn)' },
  ]},
  { group: 'Nguyên âm kép', items: [
    { p: 'ai', ex: 'ài', say: '爱', tip: 'Như "ai"' },
    { p: 'ei', ex: 'hēi', say: '黑', tip: 'Như "ây"' },
    { p: 'ao', ex: 'hǎo', say: '好', tip: 'Như "ao"' },
    { p: 'ou', ex: 'gǒu', say: '狗', tip: 'Như "âu"' },
    { p: 'er', ex: 'èr', say: '二', tip: '"ơ" rồi cong lưỡi lên' },
  ]},
  { group: 'Vần mũi', items: [
    { p: 'an', ex: 'ān', say: '安', tip: 'Như "an"' },
    { p: 'en', ex: 'mén', say: '门', tip: 'Như "ân"' },
    { p: 'ang', ex: 'máng', say: '忙', tip: 'Như "ang"' },
    { p: 'eng', ex: 'lěng', say: '冷', tip: 'Như "âng"' },
    { p: 'ong', ex: 'zhōng', say: '中', tip: 'Như "ung"' },
  ]},
  { group: 'Bắt đầu bằng i', items: [
    { p: 'ia', ex: 'jiā', say: '家', tip: '"i-a" lướt nhanh' },
    { p: 'ie', ex: 'xiè', say: '谢', tip: 'Như "iê"' },
    { p: 'iao', ex: 'xiǎo', say: '小', tip: 'Như "eo/iao"' },
    { p: 'iu', ex: 'liù', say: '六', tip: 'Đầy đủ là iou ≈ "iêu"' },
    { p: 'ian', ex: 'tiān', say: '天', tip: 'Đọc "iên", không phải "i-an"!' },
    { p: 'in', ex: 'xīn', say: '新', tip: 'Như "in"' },
    { p: 'iang', ex: 'xiǎng', say: '想', tip: '"i-ang" ≈ "iang"' },
    { p: 'ing', ex: 'tīng', say: '听', tip: 'Như "inh"' },
    { p: 'iong', ex: 'xióng', say: '熊', tip: 'Như "i-ung"' },
  ]},
  { group: 'Bắt đầu bằng u', items: [
    { p: 'ua', ex: 'huā', say: '花', tip: 'Như "oa"' },
    { p: 'uo', ex: 'duō', say: '多', tip: 'Như "ua/uô"' },
    { p: 'uai', ex: 'kuài', say: '快', tip: 'Như "oai"' },
    { p: 'ui', ex: 'duì', say: '对', tip: 'Đầy đủ là uei ≈ "uây"' },
    { p: 'uan', ex: 'wǎn', say: '晚', tip: 'Như "oan"' },
    { p: 'un', ex: 'chūn', say: '春', tip: 'Đầy đủ là uen ≈ "uân"' },
    { p: 'uang', ex: 'huáng', say: '黄', tip: 'Như "oang"' },
  ]},
  { group: 'Bắt đầu bằng ü', items: [
    { p: 'üe', ex: 'yuè', say: '月', tip: 'Như "uyê"' },
    { p: 'üan', ex: 'yuǎn', say: '远', tip: 'Như "uyên"' },
    { p: 'ün', ex: 'yún', say: '云', tip: 'Như "uyn"' },
  ]},
];

export const RULES = [
  { t: 'Đặt dấu thanh ở đâu?', d: 'Có a thì đặt trên a; không có a thì đặt trên o hoặc e; gặp iu / ui thì đặt trên chữ cái đứng sau (liù, duì).' },
  { t: 'ü sau j, q, x, y', d: 'Viết thành u (bỏ 2 chấm) nhưng vẫn đọc là ü: ju, qu, xu, yu, juan, yue… Sau n, l thì giữ ü: nǚ, lǜ.' },
  { t: 'Âm "i" đặc biệt', d: 'Trong zi ci si zhi chi shi ri, chữ i không đọc là "i" mà kéo dài phụ âm, nghe gần như "ư": 四 sì ≈ "xư", 是 shì ≈ "sư".' },
  { t: 'Biến điệu thanh 3', d: 'Hai thanh 3 đứng liền nhau thì thanh 3 đầu đọc thành thanh 2: 你好 nǐ hǎo → ní hǎo. Pinyin vẫn viết dấu thanh 3.' },
  { t: 'Biến điệu 不 bù', d: '不 đứng trước thanh 4 thì đọc thành bú: 不是 bú shì, 不客气 bú kèqi.' },
  { t: 'Biến điệu 一 yī', d: '一 trước thanh 4 đọc yí (一个 yí gè); trước thanh 1, 2, 3 đọc yì (一天 yì tiān). Đếm số thì giữ yī.' },
];

// Bộ luyện nghe thanh điệu: mỗi nhóm cùng âm, khác thanh.
export const TONE_DRILL = [
  [['妈', 'mā'], ['麻', 'má'], ['马', 'mǎ'], ['骂', 'mà']],
  [['八', 'bā'], ['拔', 'bá'], ['把', 'bǎ'], ['爸', 'bà']],
  [['衣', 'yī'], ['姨', 'yí'], ['椅', 'yǐ'], ['意', 'yì']],
  [['汤', 'tāng'], ['糖', 'táng'], ['躺', 'tǎng'], ['烫', 'tàng']],
  [['书', 'shū'], ['熟', 'shú'], ['鼠', 'shǔ'], ['树', 'shù']],
  [['飞', 'fēi'], ['肥', 'féi'], ['匪', 'fěi'], ['费', 'fèi']],
  [['七', 'qī'], ['骑', 'qí'], ['起', 'qǐ'], ['气', 'qì']],
  [['通', 'tōng'], ['同', 'tóng'], ['桶', 'tǒng'], ['痛', 'tòng']],
  [['烟', 'yān'], ['盐', 'yán'], ['眼', 'yǎn'], ['燕', 'yàn']],
  [['诗', 'shī'], ['十', 'shí'], ['使', 'shǐ'], ['是', 'shì']],
  [['屋', 'wū'], ['无', 'wú'], ['五', 'wǔ'], ['雾', 'wù']],
];
