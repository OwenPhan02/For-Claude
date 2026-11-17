// Đồng dao dân gian và thơ Đường (đều đã thuộc phạm vi công cộng).
// Mỗi dòng: 'tokens ;; nghĩa' (+ hv: âm Hán Việt với thơ)
import { parseTokens } from './build.js';

const RAW = [
  {
    id: 'liangzhilaohu', zh: '两只老虎', py: 'Liǎng zhī lǎohǔ', vi: 'Hai con hổ', type: 'Đồng dao', level: 'HSK 1',
    note: 'Bài đồng dao hát theo giai điệu quen thuộc (giống "Kìa con bướm vàng" của Việt Nam). Luyện lượng từ 只 và 没有.',
    lines: [
      '两只/liǎng_zhī 老虎/lǎohǔ ，/ 两只/liǎng_zhī 老虎/lǎohǔ ， ;; Hai con hổ, hai con hổ,',
      '跑得/pǎo_de 快/kuài ，/ 跑得/pǎo_de 快/kuài 。 ;; Chạy nhanh thế, chạy nhanh thế.',
      '一只/yì_zhī 没有/méiyǒu 眼睛/yǎnjing ， ;; Một con không có mắt,',
      '一只/yì_zhī 没有/méiyǒu 尾巴/wěiba ， ;; Một con không có đuôi,',
      '真/zhēn 奇怪/qíguài ！/ 真/zhēn 奇怪/qíguài ！ ;; Thật là lạ! Thật là lạ!',
    ],
    words: ['老虎|lǎohǔ|lão hổ|con hổ', '只|zhī|chích|con (lượng từ động vật)', '眼睛|yǎnjing|nhãn tình|mắt', '尾巴|wěiba|vĩ ba|đuôi', '奇怪|qíguài|kỳ quái|lạ'],
  },
  {
    id: 'zhaopengyou', zh: '找朋友', py: 'Zhǎo péngyou', vi: 'Tìm bạn', type: 'Đồng dao', level: 'HSK 1',
    note: 'Trò chơi của trẻ mẫu giáo: vừa hát vừa đi tìm bạn, chào và bắt tay. Luyện động từ lặp (握握手).',
    lines: [
      '找呀/zhǎo_ya 找呀/zhǎo_ya 找/zhǎo 朋友/péngyou ， ;; Tìm nào tìm nào tìm bạn,',
      '找到/zhǎodào 一个/yí_gè 好/hǎo 朋友/péngyou 。 ;; Tìm được một người bạn tốt.',
      '敬个礼/jìng_ge_lǐ ，/ 握握手/wò_wo_shǒu ， ;; Chào một cái, bắt tay nào,',
      '你/nǐ 是/shì 我/wǒ 的/de 好/hǎo 朋友/péngyou 。 ;; Bạn là bạn tốt của tôi.',
    ],
    words: ['找|zhǎo|trảo|tìm', '朋友|péngyou|bằng hữu|bạn bè', '敬礼|jìnglǐ|kính lễ|chào (giơ tay)', '握手|wòshǒu|ác thủ|bắt tay'],
  },
  {
    id: 'xiaotuzi', zh: '小兔子乖乖', py: 'Xiǎo tùzi guāiguāi', vi: 'Thỏ con ngoan', type: 'Đồng dao', level: 'HSK 2',
    note: 'Chuyện sói giả làm thỏ mẹ gọi cửa, thỏ con thông minh không mở. Luyện câu 把 và 没 + động từ.',
    lines: [
      '小/xiǎo 兔子/tùzi 乖乖/guāiguāi ，/ 把/bǎ 门儿/ménr 开开/kāikai ， ;; Thỏ con ngoan nào, mở cửa ra nào,',
      '快点儿/kuài_diǎnr 开开/kāikai ，/ 我/wǒ 要/yào 进来/jìnlái 。 ;; Mau mau mở ra, ta muốn vào nhà.',
      '不/bù 开/kāi 不/bù 开/kāi 我/wǒ 不/bù 开/kāi ， ;; Không mở, không mở, con không mở,',
      '妈妈/māma 没/méi 回来/huílái ，/ 谁/shéi 来/lái 也/yě 不/bù 开/kāi 。 ;; Mẹ chưa về nhà, ai đến cũng không mở.',
    ],
    words: ['兔子|tùzi|thố tử|con thỏ', '乖|guāi|quai|ngoan', '门|mén|môn|cửa', '开|kāi|khai|mở', '回来|huílai|hồi lai|quay về'],
  },
  {
    id: 'jingyesi', zh: '静夜思', py: 'Jìng yè sī', vi: 'Nỗi nhớ đêm thanh', type: 'Thơ Đường', author: 'Lý Bạch (李白, 701–762)', level: 'HSK 3',
    note: 'Bài thơ nổi tiếng nhất Trung Quốc – trẻ em nào cũng thuộc. Người Việt quen với tên Hán Việt "Tĩnh dạ tứ".',
    lines: [
      '床前/chuáng_qián 明月/míng_yuè 光/guāng ， ;; Ánh trăng sáng trước giường, || Sàng tiền minh nguyệt quang',
      '疑是/yí_shì 地上/dì_shàng 霜/shuāng 。 ;; Ngỡ là sương trên mặt đất. || Nghi thị địa thượng sương',
      '举头/jǔ_tóu 望/wàng 明月/míng_yuè ， ;; Ngẩng đầu ngắm trăng sáng, || Cử đầu vọng minh nguyệt',
      '低头/dī_tóu 思/sī 故乡/gù_xiāng 。 ;; Cúi đầu nhớ quê nhà. || Đê đầu tư cố hương',
    ],
    words: ['明月|míngyuè|minh nguyệt|trăng sáng', '地上|dìshang|địa thượng|trên mặt đất', '举头|jǔ tóu|cử đầu|ngẩng đầu (văn thơ; nay nói 抬头 táitóu)', '低头|dī tóu|đê đầu|cúi đầu', '故乡|gùxiāng|cố hương|quê nhà'],
  },
  {
    id: 'chunxiao', zh: '春晓', py: 'Chūn xiǎo', vi: 'Sáng mùa xuân', type: 'Thơ Đường', author: 'Mạnh Hạo Nhiên (孟浩然, 689–740)', level: 'HSK 3',
    note: 'Buổi sáng xuân ngủ quên, nghe chim hót, nhớ trận mưa gió đêm qua – không biết hoa rụng bao nhiêu.',
    lines: [
      '春眠/chūn_mián 不觉/bù_jué 晓/xiǎo ， ;; Giấc xuân say, chẳng biết trời đã sáng, || Xuân miên bất giác hiểu',
      '处处/chù_chù 闻/wén 啼鸟/tí_niǎo 。 ;; Khắp nơi nghe tiếng chim hót. || Xứ xứ văn đề điểu',
      '夜来/yè_lái 风雨/fēng_yǔ 声/shēng ， ;; Đêm qua tiếng mưa gió, || Dạ lai phong vũ thanh',
      '花落/huā_luò 知/zhī 多少/duō_shǎo 。 ;; Hoa rụng biết bao nhiêu. || Hoa lạc tri đa thiểu',
    ],
    words: ['春天|chūntiān|xuân thiên|mùa xuân', '鸟|niǎo|điểu|chim', '风雨|fēngyǔ|phong vũ|mưa gió', '花|huā|hoa|hoa', '多少|duōshao|đa thiểu|bao nhiêu'],
  },
  {
    id: 'yonge', zh: '咏鹅', py: 'Yǒng é', vi: 'Vịnh con ngỗng', type: 'Thơ Đường', author: 'Lạc Tân Vương (骆宾王), viết năm 7 tuổi', level: 'HSK 2',
    note: 'Tương truyền tác giả viết bài này khi mới 7 tuổi. Rất hợp để học màu sắc: 白 trắng, 绿 xanh lá, 红 đỏ.',
    lines: [
      '鹅/é ，/ 鹅/é ，/ 鹅/é ， ;; Ngỗng, ngỗng, ngỗng, || Nga, nga, nga',
      '曲项/qū_xiàng 向/xiàng 天/tiān 歌/gē 。 ;; Cong cổ hướng trời ca. || Khúc hạng hướng thiên ca',
      '白毛/bái_máo 浮/fú 绿水/lǜ_shuǐ ， ;; Lông trắng nổi trên nước xanh, || Bạch mao phù lục thủy',
      '红掌/hóng_zhǎng 拨/bō 清波/qīng_bō 。 ;; Chân hồng khua sóng trong. || Hồng chưởng bát thanh ba',
    ],
    words: ['鹅|é|nga|con ngỗng', '白|bái|bạch|trắng', '绿|lǜ|lục|xanh lá', '红|hóng|hồng|đỏ', '水|shuǐ|thủy|nước'],
  },
  {
    id: 'minnong', zh: '悯农', py: 'Mǐn nóng', vi: 'Thương người nông dân', type: 'Thơ Đường', author: 'Lý Thân (李绅, 772–846)', level: 'HSK 3',
    note: 'Bài thơ cha mẹ Trung Quốc hay đọc để dạy con không bỏ phí cơm – mỗi hạt gạo đều là mồ hôi người nông dân.',
    lines: [
      '锄禾/chú_hé 日/rì 当午/dāng_wǔ ， ;; Cày lúa giữa trưa nắng, || Sừ hòa nhật đương ngọ',
      '汗/hàn 滴/dī 禾/hé 下/xià 土/tǔ 。 ;; Mồ hôi rơi xuống đất dưới gốc lúa. || Hãn trích hòa hạ thổ',
      '谁知/shéi_zhī 盘中餐/pán_zhōng_cān ， ;; Ai biết bữa cơm trong mâm, || Thùy tri bàn trung xan',
      '粒粒/lì_lì 皆/jiē 辛苦/xīn_kǔ 。 ;; Mỗi hạt đều là vất vả. || Lạp lạp giai tân khổ',
    ],
    words: ['农民|nóngmín|nông dân|nông dân', '中午|zhōngwǔ|trung ngọ|buổi trưa', '汗|hàn|hãn|mồ hôi', '米饭|mǐfàn|mễ phạn|cơm', '辛苦|xīnkǔ|tân khổ|vất vả'],
  },
];

export const SONGS = RAW.map(s => ({
  ...s,
  lines: s.lines.map(l => {
    const [zh, rest = ''] = l.split(';;');
    const [vi, hv] = rest.split('||').map(x => x?.trim());
    return { tokens: parseTokens(zh), vi, hv };
  }),
}));
