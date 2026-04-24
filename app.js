/**
 * World History Timeline — The Illuminated Chronicle
 * 3000 BC — 2000 AD · Eight regions · Five millennia
 * Interactive, bilingual, museum-quality visualization.
 */

const CONFIG = {
    timelineStart: -3000,
    timelineEnd: 2000,
    yearHeight: 0.25,
    baseColumnWidth: 56,
    // Visual bounds for block widths so very small / very large polities stay legible
    // and don't dominate. Width still scales with territorial extent (slot count),
    // but with sqrt-style compression past the soft max.
    minBlockWidth: 42,
    softMaxBlockWidth: 150,   // beyond this we begin gentle compression
    hardMaxBlockWidth: 240,   // absolute cap (block won't exceed slot extent either)
    language: 'en',
    showEvents: true,
    showConnections: true,
    showEraBackgrounds: true,
    showNumberedMarkers: true,
    compareMode: false,
    compareRegions: [],
    searchQuery: '',
    categoryFilter: null,
    visibleRegions: {
        eastAsia: true,
        europe: true,
        middleEast: true,
        southAsia: true,
        centralAsia: true,
        africa: true,
        americas: true,
        southeastAsia: true
    }
};

/**
 * Compute the rendered pixel width of a block given its territorial slot extent.
 *
 * The width is proportional to territorial area (slot count) with three
 * adjustments to keep the visualization balanced:
 *   1. A hard MIN so single-slot polities (or fractional ones like North/South
 *      Korea) don't shrink below readability.
 *   2. A SOFT MAX past which growth slows (sqrt compression) so empires
 *      spanning 4+ slots don't overpower neighbors but still read as wider.
 *   3. A hard MAX absolute cap.
 *
 * Returns pixels.
 */
function computeBlockWidth(slotCount) {
    const base = CONFIG.baseColumnWidth;
    const linear = slotCount * base;            // raw territorial extent (px)
    const soft = CONFIG.softMaxBlockWidth;
    const hard = CONFIG.hardMaxBlockWidth;
    const min = CONFIG.minBlockWidth;

    let visual;
    if (linear <= soft) {
        visual = linear;
    } else {
        // Above the soft max, compress with a square-root-like curve so
        // each extra slot of territory adds progressively less visual width.
        const excess = linear - soft;
        visual = soft + Math.sqrt(excess) * 6.5;
    }
    // Never exceed the actual slot extent (would cause overlap) or the hard cap.
    visual = Math.min(visual, linear, hard);
    // Apply readability floor — but never wider than the slot extent itself,
    // so fractional-slot polities (e.g. North/South Korea split) stay aligned.
    const effectiveMin = Math.min(min, linear);
    return Math.max(effectiveMin, visual);
}

// Entity categories for legend grouping
const ENTITY_CATEGORIES = {
    empire: { label: 'Empire', labelCN: '帝国', color: '#9B7B6B' },
    kingdom: { label: 'Kingdom', labelCN: '王国', color: '#7B9EB9' },
    republic: { label: 'Republic', labelCN: '共和国', color: '#8BA98B' },
    dynasty: { label: 'Dynasty', labelCN: '王朝', color: '#C9B896' },
    confederation: { label: 'Confederation', labelCN: '联邦', color: '#9B9BAB' },
    colonial: { label: 'Colonial', labelCN: '殖民地', color: '#B98B8B' },
    nomadic: { label: 'Nomadic', labelCN: '游牧', color: '#A89080' },
    caliphate: { label: 'Caliphate', labelCN: '哈里发国', color: '#8BAA8B' }
};

// Historical descriptions for key entities
const HISTORICAL_DESCRIPTIONS = {
    // East Asia
    qin: { en: "The Qin dynasty unified China for the first time, establishing a centralized bureaucratic system, standardizing weights, measures, and writing. The Great Wall was connected, and the famous Terracotta Army was created. Despite its short duration, it laid the foundation for imperial China.", cn: "秦朝首次统一中国，建立中央集权的官僚制度，统一度量衡和文字。连接了长城，创造了著名的兵马俑。尽管存在时间短暂，却奠定了帝制中国的基础。" },
    han_west: { en: "The Western Han established the Silk Road, expanded Chinese territory, and developed Confucianism as state ideology. This era saw advances in technology, including paper-making and the seismograph. It's considered a golden age of Chinese civilization.", cn: "西汉开辟丝绸之路，扩大中国版图，确立儒学为国家意识形态。这个时代科技进步显著，包括造纸术和地动仪。被视为中华文明的黄金时代。" },
    han_east: { en: "The Eastern Han continued Han cultural achievements, saw Buddhism enter China, and produced great historians and scientists. It ended with the Yellow Turban Rebellion and fragmentation into the Three Kingdoms.", cn: "东汉延续了汉朝的文化成就，佛教传入中国，产生了伟大的历史学家和科学家。以黄巾起义告终，分裂为三国。" },
    tang: { en: "The Tang dynasty is considered the pinnacle of Chinese civilization, renowned for poetry, art, and cosmopolitan culture. The capital Chang'an was the world's largest city. Tang influence spread across Asia through trade and cultural exchange.", cn: "唐朝被认为是中华文明的巅峰，以诗歌、艺术和国际化文化闻名。首都长安是当时世界最大的城市。唐朝影响通过贸易和文化交流传播到整个亚洲。" },
    n_song: { en: "The Northern Song saw remarkable advances in technology, including movable type printing, gunpowder weapons, and the compass. The economy flourished with paper money and maritime trade. Neo-Confucianism emerged as a major philosophical movement.", cn: "北宋科技进步显著，包括活字印刷术、火药武器和指南针。经济繁荣，出现纸币和海上贸易。新儒学成为主要的哲学运动。" },
    yuan: { en: "The Yuan dynasty, established by Kublai Khan, was part of the vast Mongol Empire. It promoted trade across Eurasia, welcomed foreigners like Marco Polo, and saw advances in drama and painting. The Grand Canal was extended and Beijing became the capital.", cn: "元朝由忽必烈建立，是蒙古帝国的一部分。促进了欧亚大陆的贸易，欢迎马可·波罗等外国人，戏剧和绘画取得进步。大运河得到延伸，北京成为首都。" },
    ming: { en: "The Ming dynasty rebuilt Chinese rule after Mongol domination, constructing the Forbidden City and launching Zheng He's maritime expeditions. It was known for porcelain production, literature, and philosophy. The Great Wall was extensively rebuilt.", cn: "明朝在蒙古统治后重建中国政权，建造紫禁城并发起郑和的航海远征。以瓷器生产、文学和哲学著称。长城得到大规模重建。" },
    qing: { en: "The Qing dynasty, founded by the Manchu, was China's last imperial dynasty. At its height, it ruled the largest territory in Chinese history. It saw population growth, territorial expansion, and later struggled with Western imperialism and internal rebellions.", cn: "清朝由满族建立，是中国最后一个帝制王朝。鼎盛时期统治着中国历史上最大的疆域。经历了人口增长、领土扩张，后期与西方帝国主义和内部叛乱斗争。" },
    // Europe
    roman_republic: { en: "The Roman Republic developed representative government, law codes, and military innovations that conquered the Mediterranean. Roman citizenship, engineering, and Latin language spread throughout the empire, leaving lasting influence on Western civilization.", cn: "罗马共和国发展了代议制政府、法典和军事创新，征服了地中海地区。罗马公民身份、工程技术和拉丁语传播到整个帝国，对西方文明产生了持久影响。" },
    roman_empire: { en: "The Roman Empire at its height controlled the entire Mediterranean, Western Europe, and beyond. Roman law, roads, aqueducts, and architecture shaped European civilization. The Pax Romana brought unprecedented peace and prosperity.", cn: "罗马帝国鼎盛时期控制整个地中海、西欧及更远地区。罗马法律、道路、输水道和建筑塑造了欧洲文明。罗马和平带来了前所未有的和平与繁荣。" },
    byzantine: { en: "The Byzantine Empire preserved Roman and Greek culture for a millennium after Rome fell. Constantinople was the largest and wealthiest European city. Byzantine art, Orthodox Christianity, and Justinian's law code influenced Eastern Europe profoundly.", cn: "拜占庭帝国在罗马陷落后保存了罗马和希腊文化一千年。君士坦丁堡是欧洲最大最富有的城市。拜占庭艺术、东正教和查士丁尼法典深刻影响了东欧。" },
    carolingian: { en: "The Carolingian Empire under Charlemagne briefly reunited Western Europe, promoting education and Christianity. The Carolingian Renaissance preserved classical knowledge. Its division created the foundations of modern France and Germany.", cn: "加洛林帝国在查理大帝统治下短暂统一西欧，推动教育和基督教。加洛林文艺复兴保存了古典知识。其分裂奠定了现代法国和德国的基础。" },
    ottoman_peak: { en: "The Ottoman Empire at its peak controlled Southeast Europe, the Middle East, and North Africa. Istanbul was a center of culture and commerce. Ottoman architecture, administration, and military innovations influenced three continents.", cn: "奥斯曼帝国鼎盛时期控制东南欧、中东和北非。伊斯坦布尔是文化和商业中心。奥斯曼建筑、行政管理和军事创新影响了三大洲。" },
    // Middle East
    achaemenid: { en: "The Achaemenid Persian Empire was the largest empire the world had yet seen, stretching from Egypt to India. It pioneered religious tolerance, postal systems, and road networks. The Royal Road facilitated trade and communication.", cn: "阿契美尼德波斯帝国是当时世界上最大的帝国，从埃及延伸到印度。开创了宗教宽容、邮政系统和道路网络。御道促进了贸易和通信。" },
    rashidun: { en: "The Rashidun Caliphate rapidly expanded from Arabia to create one of history's largest empires. It preserved and transmitted Greek and Persian knowledge. Islamic law and Arabic became unifying forces across the Middle East and North Africa.", cn: "正统哈里发从阿拉伯半岛迅速扩张，创建了历史上最大的帝国之一。保存和传播了希腊和波斯知识。伊斯兰法律和阿拉伯语成为中东和北非的统一力量。" },
    abbasid: { en: "The Abbasid Caliphate presided over the Islamic Golden Age, with Baghdad as a center of learning. Advances in mathematics, astronomy, medicine, and philosophy transformed human knowledge. The House of Wisdom translated and preserved classical texts.", cn: "阿拔斯哈里发统治期间是伊斯兰黄金时代，巴格达是学术中心。数学、天文学、医学和哲学的进步改变了人类知识。智慧宫翻译和保存了古典文献。" },
    // South Asia
    maurya: { en: "The Maurya Empire was India's first great empire, unifying most of the subcontinent. Under Ashoka, Buddhism spread widely and non-violent principles were promoted through rock edicts. Mauryan administration influenced later Indian states.", cn: "孔雀帝国是印度第一个伟大帝国，统一了次大陆大部分地区。在阿育王统治下，佛教广泛传播，通过石刻敕令推广非暴力原则。孔雀王朝的行政管理影响了后来的印度国家。" },
    gupta: { en: "The Gupta Empire presided over India's Classical Age, with advances in mathematics (including zero), astronomy, art, and literature. Sanskrit flourished, and Hindu temple architecture developed. This era is considered the golden age of Indian culture.", cn: "笈多帝国统治期间是印度的古典时代，数学（包括零）、天文学、艺术和文学取得进步。梵语繁荣，印度教寺庙建筑发展。这个时代被认为是印度文化的黄金时代。" },
    mughal_peak: { en: "The Mughal Empire created a synthesis of Persian and Indian culture, producing architectural masterpieces like the Taj Mahal. Mughal painting, cuisine, and administrative systems profoundly influenced South Asian civilization.", cn: "莫卧儿帝国创造了波斯和印度文化的融合，产生了泰姬陵等建筑杰作。莫卧儿绘画、美食和行政制度深刻影响了南亚文明。" },
    // Mongolia
    mongol_emp: { en: "The Mongol Empire was the largest contiguous land empire in history, connecting East and West through the Pax Mongolica. Trade, technology, and ideas flowed across Eurasia. Though destructive in conquest, Mongol rule promoted exchange between civilizations.", cn: "蒙古帝国是历史上最大的连续陆地帝国，通过蒙古和平连接东西方。贸易、技术和思想在欧亚大陆流通。尽管征服过程中具有破坏性，但蒙古统治促进了文明之间的交流。" },
    // Japan
    heian: { en: "The Heian period saw the flourishing of Japanese court culture, producing classics like The Tale of Genji. Japanese writing systems developed, and Buddhism merged with native beliefs. This era established many enduring Japanese aesthetic principles.", cn: "平安时代日本宫廷文化繁荣，产生了《源氏物语》等经典作品。日本书写系统发展，佛教与本土信仰融合。这个时代确立了许多持久的日本审美原则。" },
    edo: { en: "The Edo period brought over 250 years of peace under Tokugawa rule. Urban culture flourished with kabuki, ukiyo-e, and haiku. Japan's isolation allowed unique cultural development, while internal trade and education expanded.", cn: "江户时代在德川统治下带来了250多年的和平。城市文化繁荣，包括歌舞伎、浮世绘和俳句。日本的闭关锁国允许独特的文化发展，同时国内贸易和教育扩展。" },
    meiji: { en: "The Meiji Restoration transformed Japan from a feudal society into a modern industrial power in just decades. Western technology, education, and institutions were adopted while maintaining Japanese identity. Japan became Asia's first industrialized nation.", cn: "明治维新在短短几十年内将日本从封建社会转变为现代工业强国。在保持日本特色的同时采用西方技术、教育和制度。日本成为亚洲第一个工业化国家。" },
    // Korea
    joseon: { en: "The Joseon dynasty, Korea's longest-ruling, developed hangul (the Korean alphabet) and Neo-Confucian governance. Distinctive Korean arts, architecture, and cuisine flourished. Joseon scholarship produced advances in science and technology.", cn: "朝鲜王朝是韩国统治时间最长的王朝，发展了韩文（朝鲜字母）和新儒家治理。独特的韩国艺术、建筑和美食繁荣发展。朝鲜学术在科学技术方面取得进步。" },
    // Americas
    maya_classic: { en: "The Maya Classic period saw the height of Maya civilization with advanced mathematics, astronomy, and hieroglyphic writing. Magnificent temple-pyramids were built. The Maya developed the most sophisticated writing system in pre-Columbian Americas.", cn: "玛雅古典时期是玛雅文明的鼎盛时期，拥有先进的数学、天文学和象形文字。建造了宏伟的神庙金字塔。玛雅人发展了前哥伦布美洲最复杂的书写系统。" },
    aztec: { en: "The Aztec Empire built the magnificent city of Tenochtitlan on a lake, with advanced agriculture and engineering. Aztec art, calendar systems, and religious practices were highly developed. At its height, it dominated Mesoamerica through tribute and trade.", cn: "阿兹特克帝国在湖上建造了宏伟的特诺奇蒂特兰城，拥有先进的农业和工程技术。阿兹特克艺术、历法系统和宗教习俗高度发达。鼎盛时期通过贡品和贸易主导中美洲。" },
    inca: { en: "The Inca Empire built an extensive road system through the Andes and developed sophisticated administration without writing. Machu Picchu exemplifies Inca engineering. They created the largest empire in pre-Columbian Americas.", cn: "印加帝国在安第斯山脉建造了广泛的道路系统，在没有文字的情况下发展了复杂的行政管理。马丘比丘是印加工程的典范。他们创建了前哥伦布美洲最大的帝国。" },

    // Additional European entities
    hre: { en: "The Holy Roman Empire was a multi-ethnic complex of territories in Western and Central Europe that developed during the Early Middle Ages. Neither holy, nor Roman, nor an empire according to Voltaire, it nonetheless shaped European politics for nearly a millennium.", cn: "神圣罗马帝国是中世纪早期在西欧和中欧发展起来的多民族领土复合体。按伏尔泰的说法，它既不神圣，也不罗马，更非帝国，但它塑造了欧洲近千年的政治格局。" },
    visigoth: { en: "The Visigothic Kingdom ruled the Iberian Peninsula after the fall of Rome, blending Roman and Germanic traditions. Their law codes influenced medieval European legal systems, and their conversion to Catholicism shaped Spanish religious identity.", cn: "西哥特王国在罗马帝国灭亡后统治伊比利亚半岛，融合了罗马和日耳曼传统。他们的法典影响了中世纪欧洲的法律体系，皈依天主教塑造了西班牙的宗教认同。" },
    frankish: { en: "The Frankish Kingdom united much of Western Europe under the Merovingian and later Carolingian dynasties. The Franks converted to Christianity early, making their kingdom a defender of the Catholic faith and laying foundations for France and Germany.", cn: "法兰克王国在墨洛温王朝和后来的加洛林王朝统治下统一了西欧大部分地区。法兰克人早期皈依基督教，使其王国成为天主教的守护者，奠定了法国和德国的基础。" },

    // Southeast Asian entities
    khmer: { en: "The Khmer Empire built Angkor Wat, the world's largest religious monument, and developed sophisticated water management systems. At its height, it dominated mainland Southeast Asia and produced remarkable art and architecture influenced by Hinduism and Buddhism.", cn: "高棉帝国建造了世界上最大的宗教建筑吴哥窟，发展了复杂的水资源管理系统。鼎盛时期主导东南亚大陆，创造了受印度教和佛教影响的杰出艺术和建筑。" },
    srivijaya: { en: "Srivijaya was a maritime empire that controlled trade through the Strait of Malacca for centuries. It spread Buddhism throughout Southeast Asia and was a major center of Buddhist learning, attracting scholars from China and India.", cn: "室利佛逝是一个海上帝国，数个世纪以来控制着马六甲海峡的贸易。它在东南亚传播佛教，是佛教学术的主要中心，吸引了来自中国和印度的学者。" },
    majapahit: { en: "Majapahit was the last major Hindu-Buddhist empire in the Indonesian archipelago. It controlled much of maritime Southeast Asia and is remembered in Indonesia as a golden age of art, literature, and regional influence.", cn: "满者伯夷是印度尼西亚群岛最后一个主要的印度教-佛教帝国。它控制了东南亚海域的大部分地区，在印度尼西亚被视为艺术、文学和区域影响力的黄金时代。" },
    dai_viet: { en: "Đại Việt was the name of Vietnam during its imperial period. It developed a distinct culture blending Chinese Confucian influences with indigenous traditions, and successfully resisted Mongol invasions three times.", cn: "大越是越南帝国时期的国名。它发展了独特的文化，融合了中国儒家影响和本土传统，并成功抵抗了三次蒙古入侵。" },

    // African entities
    egypt_old: { en: "The Old Kingdom of Egypt, known as the 'Age of the Pyramids', saw the construction of the Great Pyramid of Giza. This era established many of ancient Egypt's cultural and religious foundations that would persist for millennia.", cn: "埃及古王国被称为'金字塔时代'，建造了吉萨大金字塔。这个时代确立了古埃及许多文化和宗教基础，这些基础延续了数千年。" },
    egypt_new: { en: "The New Kingdom was ancient Egypt's most prosperous era, producing famous pharaohs like Tutankhamun and Ramesses II. Egypt reached its greatest territorial extent and created magnificent temples at Karnak and Luxor.", cn: "新王国是古埃及最繁荣的时代，产生了图坦卡蒙和拉美西斯二世等著名法老。埃及达到了最大的领土范围，在卡纳克和卢克索建造了宏伟的神庙。" },
    kush: { en: "The Kingdom of Kush, south of Egypt in Nubia, developed its own pyramid-building tradition and briefly conquered Egypt, establishing the 25th Dynasty. Kush was a major iron-producing center and controlled trade routes between Africa and the Mediterranean.", cn: "库什王国位于埃及以南的努比亚，发展了自己的金字塔建造传统，曾短暂征服埃及，建立了第二十五王朝。库什是主要的铁器生产中心，控制着非洲与地中海之间的贸易路线。" },
    aksum: { en: "The Kingdom of Aksum was one of the great civilizations of the ancient world, controlling trade between Rome and India. It was among the first states to adopt Christianity and developed its own alphabet, Ge'ez, still used in Ethiopia today.", cn: "阿克苏姆王国是古代世界伟大文明之一，控制着罗马与印度之间的贸易。它是最早采用基督教的国家之一，发展了自己的字母吉兹文，至今仍在埃塞俄比亚使用。" },
    mali: { en: "The Mali Empire was one of the largest and wealthiest African empires, famous for Mansa Musa's legendary pilgrimage to Mecca that displayed its immense gold wealth. Timbuktu became a major center of Islamic learning and trade.", cn: "马里帝国是最大、最富有的非洲帝国之一，以曼萨·穆萨的传奇麦加朝圣之旅闻名，展示了其巨大的黄金财富。廷巴克图成为伊斯兰学术和贸易的主要中心。" },
    songhai: { en: "The Songhai Empire succeeded Mali as West Africa's dominant power, controlling trans-Saharan trade routes. Under Askia Muhammad, it developed an efficient bureaucracy and made Timbuktu a renowned center of Islamic scholarship.", cn: "桑海帝国继马里之后成为西非的主导力量，控制着跨撒哈拉贸易路线。在阿斯基亚·穆罕默德统治下，发展了高效的官僚体系，使廷巴克图成为著名的伊斯兰学术中心。" },

    // Central Asian entities
    parthia: { en: "The Parthian Empire rivaled Rome for centuries, famous for its mounted archers and the 'Parthian shot'. It controlled the Silk Road trade and blended Greek and Persian cultures, serving as a bridge between East and West.", cn: "帕提亚帝国与罗马帝国对峙数个世纪，以骑射和'帕提亚回射'闻名。它控制丝绸之路贸易，融合希腊和波斯文化，成为东西方之间的桥梁。" },
    sassanid: { en: "The Sasanian Empire was the last great Persian empire before Islam, rivaling Rome and Byzantium. It saw a revival of Persian culture, Zoroastrianism, and art. Many Sasanian traditions were adopted by later Islamic civilization.", cn: "萨珊帝国是伊斯兰教之前最后一个伟大的波斯帝国，与罗马和拜占庭对峙。它见证了波斯文化、琐罗亚斯德教和艺术的复兴。许多萨珊传统被后来的伊斯兰文明采用。" },
    kushan: { en: "The Kushan Empire controlled the central Silk Road, facilitating trade between Rome, Persia, China, and India. Under Kanishka, it became a major patron of Buddhism, spreading the faith throughout Central Asia.", cn: "贵霜帝国控制着丝绸之路中段，促进了罗马、波斯、中国和印度之间的贸易。在迦腻色伽统治下，成为佛教的主要赞助者，在中亚传播佛教。" },
    timurid: { en: "The Timurid Empire, founded by Timur (Tamerlane), created a cultural renaissance in Central Asia and Persia. Samarkand became a center of art and learning. The Timurids later founded the Mughal Empire in India.", cn: "帖木儿帝国由帖木儿（跛子帖木儿）创建，在中亚和波斯创造了文化复兴。撒马尔罕成为艺术和学术中心。帖木儿的后裔后来在印度建立了莫卧儿帝国。" },

    // Additional South Asian entities
    delhi: { en: "The Delhi Sultanate introduced Islam to the Indian subcontinent on a large scale and established Persian as the court language. Despite Mongol threats, it laid foundations for Indo-Islamic architecture and culture.", cn: "德里苏丹国大规模地将伊斯兰教引入印度次大陆，并确立波斯语为宫廷语言。尽管面临蒙古威胁，它奠定了印度-伊斯兰建筑和文化的基础。" },
    chola: { en: "The Chola dynasty built one of India's greatest maritime empires, with naval expeditions reaching Southeast Asia. Their bronze sculptures and temple architecture, especially at Thanjavur, represent pinnacles of South Indian art.", cn: "朱罗王朝建立了印度最伟大的海上帝国之一，海军远征到达东南亚。他们的青铜雕塑和神庙建筑，特别是坦贾武尔的，代表了南印度艺术的巅峰。" },

    // Greek and Hellenistic
    greek_classical: { en: "Classical Greece produced democracy, philosophy, drama, and art that formed the foundation of Western civilization. Athens and Sparta led the Greek world, while thinkers like Socrates, Plato, and Aristotle shaped human thought forever.", cn: "古典希腊产生了民主制、哲学、戏剧和艺术，这些构成了西方文明的基础。雅典和斯巴达领导希腊世界，苏格拉底、柏拉图和亚里士多德等思想家永远地塑造了人类思想。" },
    macedon: { en: "The Kingdom of Macedon under Philip II and Alexander the Great conquered the Persian Empire and spread Greek culture from Egypt to India. Alexander's empire was the largest the world had seen, and Hellenistic culture flourished in his wake.", cn: "马其顿王国在腓力二世和亚历山大大帝统治下征服了波斯帝国，将希腊文化从埃及传播到印度。亚历山大的帝国是当时世界上最大的，希腊化文化在他之后繁荣发展。" },
    ptolemaic: { en: "Ptolemaic Egypt, ruled by Alexander's general Ptolemy and his descendants, made Alexandria the intellectual center of the ancient world. The Library of Alexandria and the Lighthouse were among the Seven Wonders. Cleopatra was its last ruler.", cn: "托勒密埃及由亚历山大的将军托勒密及其后裔统治，使亚历山大港成为古代世界的知识中心。亚历山大图书馆和灯塔是世界七大奇迹之一。克利奥帕特拉是其最后一位统治者。" },
    seleucid: { en: "The Seleucid Empire inherited the eastern portion of Alexander's conquests, ruling from Syria to Central Asia. It spread Greek culture throughout the Near East and maintained Hellenistic traditions for centuries.", cn: "塞琉古帝国继承了亚历山大征服的东部领土，从叙利亚统治到中亚。它在近东传播希腊文化，数个世纪以来保持了希腊化传统。" },

    // More Chinese dynasties
    shang: { en: "The Shang dynasty was China's first historically verified dynasty, known for bronze casting, oracle bone inscriptions (the earliest Chinese writing), and ancestor worship. The capital at Yin has yielded remarkable archaeological finds.", cn: "商朝是中国第一个有史料证实的王朝，以青铜铸造、甲骨文（最早的中国文字）和祖先崇拜闻名。殷墟出土了大量考古发现。" },
    zhou_west: { en: "The Western Zhou established the Mandate of Heaven concept, justifying dynastic change. The feudal system developed, and classical Chinese philosophy began to emerge. This era laid cultural foundations for Chinese civilization.", cn: "西周确立了天命观念，为王朝更替提供了合法性。封建制度发展起来，中国古典哲学开始萌芽。这个时代奠定了中华文明的文化基础。" },
    zhou_east: { en: "The Eastern Zhou encompassed the Spring and Autumn and Warring States periods, an era of political fragmentation but intellectual flourishing. Confucius, Laozi, and other philosophers founded schools of thought that still influence East Asia.", cn: "东周包含春秋和战国时期，是政治分裂但思想繁荣的时代。孔子、老子等哲学家创立的学派至今仍影响东亚。" },
    sui: { en: "The Sui dynasty reunified China after centuries of division, rebuilt the Great Wall, and constructed the Grand Canal connecting north and south. Though short-lived, it set the stage for the Tang dynasty's golden age.", cn: "隋朝在数百年分裂后重新统一中国，重建长城，修建了连接南北的大运河。尽管存在时间短暂，却为唐朝的黄金时代奠定了基础。" },

    // Steppe empires
    xiongnu: { en: "The Xiongnu were a powerful nomadic confederation that dominated the Central Asian steppes and posed a major threat to Han China. Their raids prompted the construction of the Great Wall and influenced Chinese foreign policy for centuries.", cn: "匈奴是一个强大的游牧联盟，统治着中亚草原，对汉朝构成重大威胁。他们的袭击促使了长城的修建，影响了中国数百年的外交政策。" },
    gokturk: { en: "The Göktürk Khaganate was the first Turkic state to use that name, controlling the Silk Road from Mongolia to the Black Sea. They developed the earliest known Turkic writing system and influenced all later Turkic peoples.", cn: "突厥汗国是第一个使用该名称的突厥国家，控制着从蒙古到黑海的丝绸之路。他们发展了已知最早的突厥文字系统，影响了后来所有突厥民族。" },
    liao: { en: "The Liao dynasty, founded by the Khitan people, created a dual administration system governing both nomadic and sedentary populations. They influenced later dynasties and gave their name to China in Russian (Китай/Kitay).", cn: "辽朝由契丹人建立，创造了同时管理游牧和定居人口的双轨行政系统。他们影响了后来的王朝，俄语中的中国名称（Китай）就来源于契丹。" },

    // Japanese periods
    nara: { en: "The Nara period saw the establishment of Japan's first permanent capital and the adoption of Chinese-style government. Buddhism flourished, and great temples were built. The oldest Japanese histories and poetry collections date from this era.", cn: "奈良时代见证了日本第一个永久首都的建立和中国式政府的采用。佛教繁荣，建造了大型寺庙。日本最古老的历史著作和诗歌集都出自这个时代。" },
    kamakura: { en: "The Kamakura period established Japan's first military government (shogunate). Zen Buddhism spread among the warrior class, and Japan twice repelled Mongol invasions. The samurai code began to take shape during this era.", cn: "镰仓时代建立了日本第一个军事政府（幕府）。禅宗在武士阶层中传播，日本两次击退蒙古入侵。武士道精神在这个时代开始形成。" },
    muromachi: { en: "The Muromachi period, despite civil wars, saw the flowering of Japanese culture including tea ceremony, Noh theater, and ink painting. Zen aesthetics shaped Japanese art, and trade with China brought new cultural influences.", cn: "室町时代尽管经历了内战，却见证了日本文化的繁荣，包括茶道、能剧和水墨画。禅宗美学塑造了日本艺术，与中国的贸易带来了新的文化影响。" },

    // Korean history
    gojoseon: { en: "Gojoseon is considered the first Korean kingdom, traditionally founded by the legendary Dangun. It developed bronze and iron technologies and had significant cultural exchange with China before falling to Han dynasty conquest.", cn: "古朝鲜被认为是第一个朝鲜王国，传统上由传说中的檀君建立。它发展了青铜和铁器技术，在被汉朝征服之前与中国有着重要的文化交流。" },
    goryeo: { en: "Goryeo unified the Korean peninsula and gave Korea its English name. It is known for celadon pottery, the Tripitaka Koreana (Buddhist scriptures carved on woodblocks), and the invention of metal movable type printing.", cn: "高丽统一了朝鲜半岛，Korea这个英文名称就来源于此。高丽以青瓷、高丽大藏经（雕刻在木版上的佛经）和金属活字印刷的发明闻名。" },

    // Additional enrichment — newly added entries
    xia: { en: "Traditionally regarded as China's first dynasty, the Xia is known largely through later historical texts. Archaeological sites like Erlitou suggest a complex Bronze-Age polity in the Yellow River basin, marking China's transition from Neolithic chiefdoms to organized kingship.", cn: "夏朝传统上被视为中国第一个王朝，主要通过后世史籍记载。二里头等考古遗址揭示出黄河流域一个复杂的青铜时代政体，标志着中国从新石器酋邦向有组织王权的过渡。" },
    zhou_east: { en: "The Eastern Zhou spanned the tumultuous Spring-and-Autumn and Warring States periods. Amid constant warfare the Hundred Schools of Thought arose — Confucius, Mozi, Laozi, Mencius and Xunzi laying the philosophical bedrock of East Asian civilization.", cn: "东周贯穿动荡的春秋与战国时期。在连绵的战乱中，诸子百家兴起——孔子、墨子、老子、孟子、荀子为东亚文明奠定了哲学基石。" },
    warring_states: { en: "The Warring States period saw seven major powers struggle for supremacy. Iron tools, crossbows, mass infantry and canal building transformed warfare and agriculture, culminating in Qin's unification of China in 221 BC.", cn: "战国时代七雄争霸。铁器、弩机、大规模步兵与运河建设改变了战争与农业形态，最终在公元前221年以秦统一中国而告终。" },
    jin_west: { en: "The Western Jin briefly reunified China after the Three Kingdoms period. Intrigue among the imperial family — the War of the Eight Princes — weakened the dynasty, inviting the catastrophic Uprising of the Five Barbarians that fragmented the north.", cn: "西晋短暂结束三国分裂局面。皇族内斗——八王之乱——削弱了王朝，最终引发五胡乱华，导致北方再度陷入分裂。" },
    sui: { en: "The short-lived Sui dynasty reunified China after centuries of division, rebuilt the Great Wall, and excavated the Grand Canal that still defines the nation's trade geography. Its reforms and infrastructure laid the foundations for the Tang golden age.", cn: "短命的隋朝结束数百年分裂，重建长城，开凿了至今仍塑造中国贸易地理的大运河。其改革与基础建设为唐代盛世奠定了基础。" },
    jin_jurchen: { en: "The Jurchen Jin conquered Northern Song in 1127 — the Jingkang Incident — and controlled much of north China. Their rule ended under relentless Mongol pressure in 1234, setting the stage for Mongol domination of all East Asia.", cn: "女真金朝于1127年灭北宋（靖康之变），统治中国北方大部分地区。面对蒙古持续压力，1234年被灭，为蒙古统治整个东亚奠定基础。" },
    khitan_early: { en: "The Khitan people emerged from the steppe in Manchuria and founded the Liao dynasty, whose name — Kitay — became the Russian word for China itself. They pioneered a dual-administration system governing nomads and farmers separately.", cn: "契丹人兴起于满洲草原，建立辽朝——俄语中的'中国'一词即源于'Kitay'。他们开创了分别管理游牧民与农耕民的二元行政体系。" },
    heian: { en: "The Heian period is Japan's classical age, when aristocratic court culture produced The Tale of Genji — arguably the world's first novel — and defined enduring Japanese aesthetics of miyabi (courtly elegance) and mono no aware (poignant impermanence).", cn: "平安时代是日本的古典时代，贵族宫廷文化孕育了《源氏物语》——或许是世界上第一部小说——并定义了延续至今的'雅'与'物哀'美学。" },
    kamakura: { en: "Power shifted from the emperor's court to the samurai under the Kamakura shogunate. Zen Buddhism flourished, and Japan twice repelled Mongol invasions (1274, 1281) — the kamikaze (divine wind) storms entering national memory.", cn: "镰仓幕府的建立使权力从天皇朝廷转移至武士阶层。禅宗兴盛，日本两次抵御元朝入侵（1274、1281年）——'神风'由此进入民族记忆。" },
    muromachi: { en: "Despite civil wars, the Muromachi period produced some of Japan's most enduring art: Noh theatre, ink-painting, the tea ceremony, karesansui gardens, and the rise of the samurai warlord class that shaped the Sengoku era.", cn: "尽管战乱频繁，室町时代却孕育出日本最持久的艺术：能剧、水墨画、茶道、枯山水园林，以及塑造战国时代的武士大名阶层。" },
    edo: { en: "Edo Japan experienced over 250 years of Tokugawa peace under strict social order and isolation from the outside world. Urban merchant culture flourished — kabuki, ukiyo-e, haiku, sushi — while literacy rates rose to among the highest in the world.", cn: "江户日本在德川幕府治下享有逾250年的和平，社会秩序严密，闭关锁国。都市町人文化繁荣——歌舞伎、浮世绘、俳句、寿司——识字率位居世界前列。" },
    joseon: { en: "The Joseon dynasty, Korea's longest-ruling, lasted over 500 years. King Sejong the Great commissioned Hangul — a phonetic alphabet designed specifically for the Korean language — and Confucian scholarship defined governance, art and daily life.", cn: "朝鲜王朝是韩国统治最长的王朝，延续500余年。世宗大王创制专为朝鲜语设计的表音字母'韩文'，儒家学问塑造了治理、艺术与日常生活。" },
    // Southeast Asia
    dai_viet: { en: "Đại Việt (Great Viet) was the imperial name of Vietnam during the Lý, Trần, Lê and Nguyễn dynasties. It developed a culture blending indigenous traditions with Chinese Confucian influences and thrice repelled Mongol invasions in the 13th century.", cn: "大越是越南李、陈、黎、阮等朝代的帝国国号。融合本土传统与中华儒家影响，形成独特文化，并在13世纪三度击退蒙古入侵。" },
    champa: { en: "Champa was a maritime-trading Hindu-Buddhist civilization along central Vietnam's coast. Its brick temple towers (My Son) rival Angkor; gradual absorption by Đại Việt (1471) ended an independent Cham state, though Cham communities persist today.", cn: "占婆是中越海岸的海上贸易印度教-佛教文明。其砖石塔寺（美山）可与吴哥媲美；1471年被大越吞并结束独立政体，但占族社群延续至今。" },
    pagan: { en: "The Pagan Kingdom unified the lands that became Burma (Myanmar) and adopted Theravada Buddhism as its state religion. Some 10,000 temples were built on the plain of Bagan; only Mongol invasions (1287) broke its centuries-long dominance.", cn: "蒲甘王国统一了后来的缅甸地区，以上座部佛教为国教。蒲甘平原上建造了约一万座佛塔；蒙古入侵（1287年）才终结其数百年的霸权。" },
    ayutthaya: { en: "Ayutthaya was one of Southeast Asia's wealthiest kingdoms, a cosmopolitan trade hub where Portuguese, Dutch, Japanese and Persian merchants lived side by side. Its sack by the Burmese in 1767 still defines Thai historical memory.", cn: "阿瑜陀耶曾是东南亚最富有的王国，葡萄牙、荷兰、日本与波斯商人云集的国际贸易中心。1767年被缅甸洗劫的记忆至今塑造着泰国民族意识。" },
    // Europe
    byzantine: { en: "The Byzantine Empire preserved Roman and Greek heritage for a thousand years after the Western fall. Constantinople was Europe's largest city, its Hagia Sophia the greatest dome in Christendom. Byzantine law, liturgy and diplomacy still echo through Eastern Europe.", cn: "拜占庭帝国在西罗马灭亡后保存了罗马与希腊遗产逾千年。君士坦丁堡是欧洲最大的城市，圣索菲亚大教堂是基督教世界最宏伟的穹顶。拜占庭的法律、礼仪与外交至今回响于东欧。" },
    carolingian: { en: "Charlemagne was crowned emperor in 800, symbolically reviving the Western Roman Empire. His court at Aachen sponsored the Carolingian Renaissance — preserving classical manuscripts, standardizing handwriting, and establishing the intellectual foundations of medieval Europe.", cn: "查理曼于800年加冕为帝，象征着西罗马帝国的复兴。其阿亨宫廷赞助了加洛林文艺复兴——保存古典手稿、规范字体，为中世纪欧洲奠定知识基础。" },
    hre: { en: "The Holy Roman Empire — famously dismissed by Voltaire as 'neither holy, nor Roman, nor an empire' — was nonetheless the political framework of Central Europe for a millennium. Its fragmentation shaped the modern map from Switzerland to the Netherlands.", cn: "神圣罗马帝国被伏尔泰讽刺为'既不神圣，也不罗马，更非帝国'，却成为中欧千年的政治框架。其分裂塑造了从瑞士到荷兰的现代欧洲版图。" },
    england_medieval: { en: "Medieval England was shaped by the Norman Conquest of 1066, which fused Anglo-Saxon, Danish and Norman cultures. Magna Carta (1215), common law, parliamentary government, and the English language itself emerged from this turbulent era.", cn: "中世纪英格兰由1066年的诺曼征服塑造，融合了盎格鲁-撒克逊、丹麦与诺曼文化。《大宪章》（1215）、普通法、议会制政府与英语本身均诞生于这一动荡时代。" },
    napoleon: { en: "At its zenith (1812) the Napoleonic Empire stretched from Spain to Moscow. Napoleon's Civil Code, metric system, and administrative reforms outlasted his defeat — modern Europe is in many ways still shaped by his brief reign.", cn: "拿破仑帝国于1812年达到顶峰，版图从西班牙延伸到莫斯科。其民法典、公制度量衡与行政改革比他的失败更为持久——现代欧洲仍深受其短暂统治的塑造。" },
    russia_empire: { en: "The Russian Empire was the largest contiguous state in Europe, spanning eleven time zones. Peter the Great westernized its elite; Catherine expanded south; by 1900 it produced Tolstoy, Tchaikovsky, Mendeleev — before revolution swept it away in 1917.", cn: "俄罗斯帝国是欧洲最大的连续疆域国家，横跨11个时区。彼得大帝推行西化改革；叶卡捷琳娜南扩版图；至1900年孕育出托尔斯泰、柴可夫斯基、门捷列夫——1917年革命终结其命运。" },
    ussr: { en: "The Soviet Union was the first socialist state — industrial powerhouse, superpower, and Cold War antagonist of the United States. Collapsing in 1991, it left fifteen successor states and a geopolitical shockwave that still reverberates today.", cn: "苏联是首个社会主义国家——工业强国、超级大国、美国冷战对手。1991年解体，留下15个继承国及至今仍在回响的地缘政治冲击。" },
    // Middle East
    sumer: { en: "Sumer was the world's first urban civilization — inventing cuneiform writing, the wheel, the sailboat, and mathematics. Uruk, Eridu, and Ur were the first cities; Gilgamesh, legendary king of Uruk, is the oldest hero in world literature.", cn: "苏美尔是世界首个城市文明——发明楔形文字、车轮、帆船与数学。乌鲁克、埃里都、乌尔是人类最早的城市；乌鲁克传奇之王吉尔伽美什是世界文学中最古老的英雄。" },
    akkad: { en: "Sargon of Akkad welded the Sumerian city-states into history's first multi-ethnic empire. Akkadian displaced Sumerian as the spoken tongue across Mesopotamia, and the Akkadian imperial model would be imitated by every successor for two millennia.", cn: "阿卡德的萨尔贡将苏美尔城邦铸成史上首个多民族帝国。阿卡德语取代苏美尔语成为美索不达米亚的通用口语，阿卡德的帝国模式为此后两千年的继承者所效仿。" },
    hittite: { en: "The Hittites were pioneers of iron metallurgy and master diplomats — the Treaty of Kadesh (1259 BC) with Egypt's Ramesses II is history's oldest surviving peace treaty. Their Indo-European language decoded in 1915 revolutionized comparative linguistics.", cn: "赫梯人是铁器冶金的先驱和外交大师——与埃及拉美西斯二世签订的卡迭石和约（前1259年）是现存最古老的和平条约。1915年破译的赫梯语（印欧语系）革新了比较语言学。" },
    assyria: { en: "The Neo-Assyrian Empire perfected brutal but effective imperial governance — standing armies, siege engineering, mass deportations. The Library of Ashurbanipal at Nineveh preserved the Epic of Gilgamesh and much of Mesopotamia's literary heritage.", cn: "新亚述帝国将残酷但高效的帝国治理推向极致——常备军、攻城工程、大规模流放。尼尼微亚述巴尼拔图书馆保存了《吉尔伽美什史诗》及美索不达米亚大量文学遗产。" },
    neo_babylon: { en: "The Neo-Babylonian Empire under Nebuchadnezzar II rebuilt Babylon into the world's most dazzling city — the Hanging Gardens, the Ishtar Gate, the ziggurat Etemenanki (perhaps the original Tower of Babel). It fell to Cyrus the Great's Persians in 539 BC.", cn: "新巴比伦帝国在尼布甲尼撒二世治下将巴比伦重建为当时最辉煌的城市——空中花园、伊什塔尔门、埃特曼安吉塔庙（或即'巴别塔'原型）。公元前539年被居鲁士大帝的波斯灭亡。" },
    sasanian: { en: "The Sasanian Empire was late antiquity's other superpower, rivalling Rome and Byzantium for four centuries. Zoroastrianism became state religion; chess, polo, and royal protocol spread westward; its fall to Arab armies (651) reshaped Eurasia.", cn: "萨珊帝国是古典晚期的另一超级大国，与罗马/拜占庭对峙四百年。琐罗亚斯德教定为国教；国际象棋、马球与宫廷礼仪西传；公元651年亡于阿拉伯，重塑欧亚。" },
    umayyad: { en: "The Umayyad Caliphate expanded Islam from Atlantic to Indus — the largest empire the world had yet seen. Damascus was their capital; Arabic became a world language; the Dome of the Rock remains one of humanity's most beautiful buildings.", cn: "倭马亚哈里发将伊斯兰疆域从大西洋扩展至印度河，是当时世界最大的帝国。大马士革为都；阿拉伯语成为世界语言；圆顶清真寺至今是人类最美的建筑之一。" },
    fatimid: { en: "The Shia Fatimid Caliphate founded Cairo (969) and al-Azhar University — the world's longest continuously operating university. They controlled the Red Sea trade and nurtured a brilliant scholarly culture in medicine, astronomy and philosophy.", cn: "什叶派法蒂玛哈里发建立开罗（969年）与艾资哈尔大学——世界上持续运作时间最长的大学。他们掌控红海贸易，在医学、天文学、哲学上孕育出辉煌的学术文化。" },
    safavid: { en: "The Safavid Empire made Twelver Shia Islam Iran's state religion — an identity that endures today. Shah Abbas I's Isfahan was nicknamed 'Half the World'; Persian miniature painting, carpet-weaving, and architecture reached their peak.", cn: "萨法维帝国将十二伊玛目什叶派立为伊朗国教——这一身份延续至今。阿拔斯大帝的伊斯法罕被誉为'半个世界'；波斯细密画、地毯织造与建筑艺术达到顶峰。" },
    ottoman_peak: { en: "At its zenith under Suleiman the Magnificent, the Ottoman Empire stretched from Vienna to Yemen, Algiers to Baghdad. Istanbul's skyline was defined by Sinan's mosques. The millet system allowed religious communities extraordinary autonomy for centuries.", cn: "奥斯曼帝国在苏莱曼大帝治下达到鼎盛，版图从维也纳到也门、从阿尔及尔到巴格达。伊斯坦布尔天际线由锡南的清真寺定义。米利特制度使宗教社群数个世纪以来享有非凡自治权。" },
    // South Asia
    indus_valley: { en: "The Indus Valley Civilization rivalled Egypt and Mesopotamia in scale, with planned cities (Harappa, Mohenjo-daro), standardized weights, advanced sanitation, and an undeciphered script. Its sudden decline around 1500 BC remains one of archaeology's great mysteries.", cn: "印度河流域文明规模可与埃及、美索不达米亚比肩——规划城市（哈拉帕、摩亨佐-达罗）、标准化度量衡、先进卫生系统，以及至今未解读的文字。约公元前1500年的骤衰至今是考古学最大谜题之一。" },
    maurya: { en: "Under Ashoka the Great, the Maurya Empire unified most of the Indian subcontinent and embraced Buddhism after witnessing the horrors of the Kalinga War. Ashoka's rock edicts — ethical proclamations in multiple scripts — are among history's earliest public moral documents.", cn: "孔雀帝国在阿育王治下统一印度次大陆大部分地区，他见证羯陵伽之战的惨状后皈依佛教。阿育王石刻敕令——多种文字的道德宣告——是史上最早的公开伦理文献。" },
    kushan: { en: "The Kushan Empire ruled a Silk Road crossroads where Greek, Persian, Indian and Chinese ideas fused. Under Kanishka, Mahayana Buddhism and the Gandharan art style — Greek-influenced Buddhist sculpture — spread across Central Asia to China.", cn: "贵霜帝国统治着丝绸之路的十字路口，希腊、波斯、印度与中国思想在此交融。在迦腻色伽王治下，大乘佛教与犍陀罗艺术——受希腊影响的佛教雕塑——经中亚传入中国。" },
    gupta: { en: "The Gupta Empire was India's Classical Age — decimal numerals, zero, astronomy (Aryabhata calculated pi), Kalidasa's drama, and the consolidation of Hindu temple architecture all flourished. Sanskrit reached its literary zenith.", cn: "笈多帝国是印度的古典时代——十进制数字、零的概念、天文学（阿耶波多计算圆周率）、迦梨陀娑的戏剧、印度教神庙建筑的成熟皆在此时兴盛。梵语文学达到巅峰。" },
    chola: { en: "The Chola dynasty built one of the only genuinely maritime Indian empires, with naval expeditions reaching Sumatra and Sri Lanka. Thanjavur's Brihadisvara Temple and the bronze Nataraja (Dancing Shiva) figurines represent the pinnacle of South Indian art.", cn: "朱罗王朝建立了印度罕见的真正海上帝国，海军远征至苏门答腊与斯里兰卡。坦贾武尔的布里哈迪斯瓦拉神庙与青铜纳塔罗阇（舞蹈湿婆）像代表南印度艺术的顶峰。" },
    mughal: { en: "The Mughal Empire combined Persian culture, Turko-Mongol statecraft, and Indian resources into one of history's wealthiest empires. The Taj Mahal, the Peacock Throne, Urdu language, and mughlai cuisine are all its legacies.", cn: "莫卧儿帝国融合波斯文化、突厥-蒙古治术与印度资源，缔造史上最富有的帝国之一。泰姬陵、孔雀宝座、乌尔都语与莫卧儿菜肴皆为其遗产。" },
    mughal_max: { en: "Under Aurangzeb (1687-1707), Mughal territory reached its greatest extent — nearly the entire subcontinent. Yet his intolerance of Hindus, endless Deccan wars, and imperial overextension planted the seeds of rapid 18th-century collapse.", cn: "奥朗则布治下（1687-1707）莫卧儿疆域达极盛——几乎覆盖整个次大陆。然其对印度教徒的不宽容、旷日持久的德干战争、帝国过度扩张，为18世纪迅速崩溃埋下伏笔。" },
    british_raj: { en: "The British Raj (1858-1947) united India politically under a single administration while extracting its wealth. Railways, English-language education, modern nationalism, cricket, and ultimately Gandhi's nonviolent movement all emerged from this colonial period.", cn: "英属印度（1858-1947）在单一行政下政治统一印度，同时攫取其财富。铁路、英语教育、现代民族主义、板球，以及最终甘地的非暴力运动，都诞生于这一殖民时期。" },
    // Central Asia
    timurid: { en: "Timur the Lame (Tamerlane) forged an empire from Delhi to Damascus through unparalleled destruction, yet his capital Samarkand became a jewel of Islamic civilization. Timurid art, the Registan, and his descendant Babur's founding of the Mughals are his lasting legacy.", cn: "跛子帖木儿以无与伦比的破坏缔造了从德里到大马士革的帝国，但其首都撒马尔罕却成为伊斯兰文明的明珠。帖木儿艺术、雷吉斯坦广场，以及其后裔巴布尔创建莫卧儿帝国，是他持久的遗产。" },
    parthia: { en: "The Parthian Empire rivalled Rome for nearly five centuries, famous for the 'Parthian shot' — firing arrows backward at full gallop. Controlling the Silk Road, they grew immensely wealthy by bridging East and West in trade and ideas.", cn: "帕提亚帝国与罗马对峙近五百年，以'帕提亚回射'——疾驰中回身射箭——闻名。掌控丝绸之路，在东西方贸易与思想的桥梁中积聚巨大财富。" },
    // Africa
    egypt_old: { en: "Old Kingdom Egypt — the Age of Pyramids — built the Great Pyramid of Giza, one of the Seven Wonders and the tallest human structure for 3,800 years. Pharaonic ideology, hieroglyphs, and the vast administrative bureaucracy were perfected here.", cn: "埃及古王国——金字塔时代——建造吉萨大金字塔，七大奇迹之一，3800年间人类最高建筑。法老意识形态、象形文字与庞大的行政官僚体系皆在此完善。" },
    egypt_new: { en: "New Kingdom Egypt reached its military and cultural zenith under Ramesses II and Thutmose III. Karnak and Luxor temples, the Valley of the Kings, Akhenaten's monotheism experiment, and Tutankhamun's tomb all date from this brilliant era.", cn: "新王国埃及在拉美西斯二世与图特摩斯三世治下达到军事与文化的顶峰。卡纳克与卢克索神庙、帝王谷、阿肯那顿的一神教实验与图坦卡蒙墓皆出自这一辉煌时代。" },
    aksum: { en: "The Kingdom of Aksum, in what is now Ethiopia, was counted by Manichaean sources among the four great powers of the 3rd century (alongside Rome, Persia, China). It was among the earliest states to adopt Christianity (c. 340 AD).", cn: "阿克苏姆王国（今埃塞俄比亚）在3世纪摩尼教文献中被列为与罗马、波斯、中国并称的四大强国之一。是最早采用基督教（约340年）的国家之一。" },
    mali: { en: "The Mali Empire's Mansa Musa undertook a 1324 pilgrimage to Mecca so lavish it crashed the gold economy of Egypt for a decade. Timbuktu under Mali became a world center of Islamic scholarship; Mali's wealth drew Europeans to explore West Africa.", cn: "马里帝国曼萨·穆萨1324年的麦加朝圣极尽奢华，使埃及黄金经济崩溃十年。马里治下的廷巴克图成为伊斯兰学术的世界中心；马里的富庶吸引欧洲人探索西非。" },
    songhai: { en: "The Songhai Empire at its peak was the largest African empire in history, dominating trans-Saharan trade. Timbuktu and Djenné flourished as centers of learning; the Moroccan invasion of 1591 ended the era of great Sahelian empires.", cn: "桑海帝国鼎盛时是历史上最大的非洲帝国，主导跨撒哈拉贸易。廷巴克图与杰内成为繁荣的学术中心；1591年摩洛哥入侵结束了萨赫勒伟大帝国的时代。" },
    // Americas
    olmec: { en: "The Olmec are regarded as Mesoamerica's 'mother civilization' — the first to build pyramids, carve colossal heads, develop calendars, and play the ballgame. Later Mesoamerican cultures (Maya, Aztec) inherited their religious and artistic vocabulary.", cn: "奥尔梅克被视为中美洲'母文明'——最早建造金字塔、雕刻巨型头像、发展历法、举行球赛。后来的中美洲文化（玛雅、阿兹特克）继承其宗教与艺术词汇。" },
    teotihuacan: { en: "Teotihuacan was one of the largest cities in the world around 500 AD, rivalling Rome. Its builders' identity remains a mystery, as does the cause of its sudden collapse — but its Pyramids of the Sun and Moon awed later Aztecs, who named it 'Place Where Gods Were Born'.", cn: "特奥蒂瓦坎约在公元500年是世界上最大的城市之一，可与罗马媲美。其建造者身份与骤然崩溃的原因至今成谜——但日月金字塔令后来的阿兹特克人惊叹，将其命名为'众神降生之地'。" },
    maya_classic: { en: "The Classic Maya (AD 250-900) developed the Americas' most sophisticated writing system, a 365-day calendar accurate within hours, elaborate mathematics including zero, and astronomical knowledge rivalling Ptolemy's Greece. Their collapse remains partly mysterious.", cn: "古典玛雅（250-900年）发展出美洲最复杂的文字系统、精确到小时的365日历法、包含零的复杂数学，以及可与托勒密希腊媲美的天文知识。其崩溃至今仍部分成谜。" },
    aztec: { en: "The Aztec Triple Alliance built Tenochtitlan — a city of 200,000 on a lake, with aqueducts, floating gardens, and causeways — the wonder of the Americas. Their empire fell in two years to Cortés (1519-21) amid smallpox, civil war, and Spanish alliances with subject peoples.", cn: "阿兹特克三国同盟建造了特诺奇蒂特兰——湖上20万人口的城市，拥有水道、浮动花园与堤道——美洲的奇迹。1519-21年两年间亡于科尔特斯，其败因包括天花、内战与西班牙与被统治民族的同盟。" },
    inca: { en: "The Inca Empire was the largest in pre-Columbian America, administered without writing using the khipu (knotted cords) for records, and connected by 40,000 km of roads through the Andes. Machu Picchu, their royal retreat, was never found by the Spanish.", cn: "印加帝国是前哥伦布时代美洲最大的帝国，以结绳（奇普）代替文字进行管理，安第斯山脉上修筑了4万公里道路。皇家秘所马丘比丘从未被西班牙人发现。" },
    // More context entries
    han_west: { en: "The Western Han consolidated China's imperial identity — Confucianism became state orthodoxy, paper was invented, the Silk Road opened, and Emperor Wu pushed borders deep into Central Asia. The term 'Han Chinese' comes from this dynasty.", cn: "西汉巩固了中国的帝国身份——儒学成为官方正统，造纸术发明，丝绸之路开通，汉武帝将疆域深推入中亚。'汉人'之称源于此朝。" },
    tang: { en: "The Tang dynasty is often called China's golden age. Chang'an was the world's largest city, drawing merchants, monks, and diplomats from across Eurasia. Poetry (Li Bai, Du Fu, Wang Wei), woodblock printing, the civil-service exam and Buddhist art all flourished.", cn: "唐朝常被称为中国的黄金时代。长安是当时世界最大的城市，吸引欧亚大陆各地的商人、僧侣与使节。诗歌（李白、杜甫、王维）、雕版印刷、科举与佛教艺术皆在此时兴盛。" },
    n_song: { en: "The Northern Song saw an astonishing flowering of technology — printing, gunpowder, the compass, paper money, blast furnaces — and commerce that supported the world's first urban bourgeois culture. Kaifeng's markets rivalled anything in medieval Europe.", cn: "北宋科技迎来惊人绽放——印刷术、火药、指南针、纸币、高炉炼铁——商业繁荣支撑起世界上首个城市市民文化。开封的市井可与中世纪欧洲任何城市匹敌。" },
    yuan: { en: "The Yuan dynasty, founded by Kublai Khan, integrated China into the Mongol world system. Under Pax Mongolica, Marco Polo and Ibn Battuta travelled freely; the Grand Canal was extended; Beijing became the capital of a unified China for the first time.", cn: "元朝由忽必烈建立，使中国融入蒙古世界体系。在蒙古和平之下，马可·波罗与伊本·白图泰畅行无阻；大运河得到延伸；北京首次成为统一中国的首都。" },
    ming: { en: "The Ming dynasty restored Han Chinese rule after Mongol domination. The Forbidden City was built, the Great Wall rebuilt in brick, and Zheng He's seven voyages reached East Africa — decades before Columbus. Ming porcelain and novels remain world treasures.", cn: "明朝在蒙古统治后恢复汉人政权。建造紫禁城，以砖石重建长城，郑和七下西洋远及东非——比哥伦布早数十年。明代瓷器与小说至今是世界瑰宝。" },
    qing: { en: "The Qing, China's last imperial dynasty, ruled the largest territory in Chinese history. Kangxi, Yongzheng and Qianlong presided over a prosperous era, but 19th-century Western imperialism, internal rebellions, and reform failures led to the 1911 revolution.", cn: "清朝是中国最后一个帝制王朝，统治中国史上最大的疆域。康熙、雍正、乾隆缔造盛世，但19世纪西方帝国主义、内部起义与改革失败最终导致1911年革命。" },
    mongol_emp: { en: "The Mongol Empire under Genghis Khan and his heirs became the largest contiguous land empire in history. The Pax Mongolica enabled unprecedented cross-Eurasian exchange — the Black Death, gunpowder, paper money, and the compass all moved along its highways.", cn: "蒙古帝国在成吉思汗与其后裔治下成为史上最大的连续陆地帝国。蒙古和平促成了前所未有的欧亚交流——黑死病、火药、纸币与指南针皆沿其大道流通。" },
    achaemenid: { en: "The Achaemenid Persian Empire was the world's first truly multinational state — from Ethiopia to the Indus. Cyrus the Great's tolerance became legendary; the Royal Road and Cyrus Cylinder (considered by some the first charter of human rights) reshaped governance.", cn: "阿契美尼德波斯帝国是世界上第一个真正的多民族国家——从埃塞俄比亚到印度河。居鲁士大帝的宽容成为传奇；御道与居鲁士圆柱（一些人视为最早的人权宪章）重塑了治理方式。" },
    roman_empire: { en: "At its peak the Roman Empire ruled 70 million people across three continents. Latin, Roman law, Christianity, straight roads, concrete, calendars and the notion of citizenship all trace back here. The Mediterranean became a Roman lake for four centuries.", cn: "罗马帝国鼎盛时期统治三大洲的7000万人口。拉丁语、罗马法、基督教、直线道路、混凝土、历法与公民身份观念皆源于此。地中海四个世纪以来是一片罗马内海。" },
    maurya_nw: { en: "Under Maurya rule, the northwest frontier brought India into contact with Hellenistic successor states of Alexander's empire. This cultural meeting gave rise to Gandharan art and carried Buddhism along trade routes into Central Asia and China.", cn: "孔雀王朝治下的西北前沿使印度与亚历山大帝国的希腊化继承国接触。这一文化交汇催生犍陀罗艺术，并将佛教沿贸易路线带入中亚与中国。" }
};

// Additional rich entity details: capitals, key achievements, flourishes, fall
const ENTITY_DETAILS = {
    qin: { capital: { en: 'Xianyang', cn: '咸阳' }, rulers: ['Qin Shi Huang'], rulersCN: ['秦始皇'], achievements: { en: ['Unified China', 'Standardized weights, writing, currency', 'Built early Great Wall', 'Terracotta Army'], cn: ['统一中国','统一度量衡、文字、货币','修筑长城','兵马俑'] } },
    han_west: { capital: { en: "Chang'an", cn: '长安' }, rulers: ['Liu Bang','Emperor Wu'], rulersCN: ['刘邦','汉武帝'], achievements: { en: ['Silk Road opened','Paper invented','Confucianism as state ideology','Population census'], cn: ['丝绸之路开通','造纸术发明','确立儒学','人口普查'] } },
    tang: { capital: { en: "Chang'an", cn: '长安' }, rulers: ['Taizong','Wu Zetian','Xuanzong'], rulersCN: ['唐太宗','武则天','唐玄宗'], achievements: { en: ['Cosmopolitan capital of 1M','Poetic golden age','Civil service exams','Block printing'], cn: ['百万人口国际都会','诗歌黄金时代','完善科举','雕版印刷'] } },
    n_song: { capital: { en: 'Kaifeng', cn: '开封' }, rulers: ['Taizu','Shenzong'], rulersCN: ['宋太祖','宋神宗'], achievements: { en: ['Movable type printing','Paper money','Compass for navigation','Urban market economy'], cn: ['活字印刷','纸币','航海指南针','城市市场经济'] } },
    ming: { capital: { en: 'Beijing', cn: '北京' }, rulers: ['Hongwu','Yongle','Wanli'], rulersCN: ['洪武','永乐','万历'], achievements: { en: ['Forbidden City built','Zheng He voyages','Great Wall rebuilt in stone','Ming vase porcelain'], cn: ['紫禁城建成','郑和下西洋','砖石重建长城','青花瓷'] } },
    qing: { capital: { en: 'Beijing', cn: '北京' }, rulers: ['Kangxi','Qianlong','Guangxu'], rulersCN: ['康熙','乾隆','光绪'], achievements: { en: ['Largest territorial extent','High Qing prosperity','Siku Quanshu compilation','Canton trade system'], cn: ['疆域最大','康乾盛世','编纂《四库全书》','广州十三行贸易'] } },
    roman_empire: { capital: { en: 'Rome', cn: '罗马' }, rulers: ['Augustus','Trajan','Hadrian','Marcus Aurelius'], rulersCN: ['奥古斯都','图拉真','哈德良','马可·奥勒留'], achievements: { en: ['Pax Romana','Roman law','Engineering (aqueducts, roads)','Spread of Christianity'], cn: ['罗马和平','罗马法','水道桥与道路工程','基督教传播'] } },
    byzantine: { capital: { en: 'Constantinople', cn: '君士坦丁堡' }, rulers: ['Justinian I','Basil II','Constantine XI'], rulersCN: ['查士丁尼一世','巴西尔二世','君士坦丁十一世'], achievements: { en: ['Hagia Sophia','Justinian Code','Greek fire','Preservation of classical knowledge'], cn: ['圣索菲亚大教堂','查士丁尼法典','希腊火','保存古典学问'] } },
    ottoman_peak: { capital: { en: 'Istanbul', cn: '伊斯坦布尔' }, rulers: ['Suleiman the Magnificent','Mehmed II','Selim I'], rulersCN: ['苏莱曼大帝','穆罕默德二世','塞利姆一世'], achievements: { en: ['Fall of Constantinople','Mosque architecture of Sinan','Millet system','Coffee houses'], cn: ['攻陷君士坦丁堡','锡南清真寺建筑','米利特制度','咖啡馆文化'] } },
    achaemenid: { capital: { en: 'Persepolis / Susa', cn: '波斯波利斯 / 苏萨' }, rulers: ['Cyrus the Great','Darius I','Xerxes I'], rulersCN: ['居鲁士大帝','大流士一世','薛西斯一世'], achievements: { en: ['First multinational empire','Royal Road','Religious tolerance','Satrapy system'], cn: ['首个多民族帝国','御道','宗教宽容','行省制度'] } },
    abbasid: { capital: { en: 'Baghdad', cn: '巴格达' }, rulers: ['Al-Mansur','Harun al-Rashid','Al-Ma\'mun'], rulersCN: ['曼苏尔','哈伦·拉希德','麦蒙'], achievements: { en: ['House of Wisdom','Translation movement','Algebra (al-Khwarizmi)','Islamic Golden Age'], cn: ['智慧宫','翻译运动','代数（花剌子米）','伊斯兰黄金时代'] } },
    maurya: { capital: { en: 'Pataliputra', cn: '华氏城' }, rulers: ['Chandragupta','Bindusara','Ashoka'], rulersCN: ['旃陀罗笈多','频头娑罗','阿育王'], achievements: { en: ['First Indian empire','Ashoka\'s edicts','Buddhism to Sri Lanka','Sarnath lion capital'], cn: ['首个印度大帝国','阿育王石刻敕令','佛教传入斯里兰卡','鹿野苑狮柱'] } },
    gupta: { capital: { en: 'Pataliputra', cn: '华氏城' }, rulers: ['Chandragupta I','Samudragupta','Chandragupta II'], rulersCN: ['旃陀罗笈多一世','海护王','旃陀罗笈多二世'], achievements: { en: ['Concept of zero','Aryabhata astronomy','Kalidasa drama','Nalanda University'], cn: ['零的概念','阿耶波多天文学','迦梨陀娑戏剧','那烂陀寺'] } },
    mughal_max: { capital: { en: 'Delhi / Agra', cn: '德里 / 阿格拉' }, rulers: ['Akbar','Shah Jahan','Aurangzeb'], rulersCN: ['阿克巴','沙贾汗','奥朗则布'], achievements: { en: ['Taj Mahal','Peacock Throne','Din-i Ilahi','Mughal miniature painting'], cn: ['泰姬陵','孔雀宝座','丁·伊·伊拉希','莫卧儿细密画'] } },
    mongol_emp: { capital: { en: 'Karakorum', cn: '哈拉和林' }, rulers: ['Genghis Khan','Ögedei','Möngke','Kublai Khan'], rulersCN: ['成吉思汗','窝阔台','蒙哥','忽必烈'], achievements: { en: ['Largest contiguous empire','Yam postal system','Pax Mongolica trade','Cultural exchange'], cn: ['最大连续帝国','站赤邮驿','蒙古和平贸易','文化交流'] } },
    aztec: { capital: { en: 'Tenochtitlan', cn: '特诺奇蒂特兰' }, rulers: ['Itzcoatl','Moctezuma II'], rulersCN: ['伊斯科阿特尔','蒙特祖马二世'], achievements: { en: ['Chinampa agriculture','Codex tradition','Triple Alliance','Aqueduct engineering'], cn: ['浮田农业','古抄本传统','三国同盟','水道工程'] } },
    inca: { capital: { en: 'Cusco', cn: '库斯科' }, rulers: ['Pachacuti','Tupac Inca','Huayna Capac'], rulersCN: ['帕查库蒂','图帕克·印卡','瓦伊纳·卡帕克'], achievements: { en: ['40,000 km road network','Quipu record-keeping','Machu Picchu','Terraced agriculture'], cn: ['4万公里道路网络','奇普记事','马丘比丘','梯田农业'] } },
    mali: { capital: { en: 'Niani / Timbuktu', cn: '尼亚尼 / 廷巴克图' }, rulers: ['Sundiata','Mansa Musa'], rulersCN: ['松迪亚塔','曼萨·穆萨'], achievements: { en: ['Mansa Musa\'s hajj','Timbuktu scholarship','Trans-Saharan gold trade','Sankore madrasa'], cn: ['曼萨·穆萨朝圣','廷巴克图学术','跨撒哈拉黄金贸易','桑科雷经学院'] } },
    edo: { capital: { en: 'Edo (Tokyo)', cn: '江户' }, rulers: ['Tokugawa Ieyasu','Tokugawa Yoshimune'], rulersCN: ['德川家康','德川吉宗'], achievements: { en: ['250 years of peace','Ukiyo-e wood-block prints','Kabuki & haiku','Sakoku isolation'], cn: ['250年和平','浮世绘','歌舞伎与俳句','锁国政策'] } },
    joseon: { capital: { en: 'Hanyang (Seoul)', cn: '汉阳 / 首尔' }, rulers: ['Taejo','Sejong the Great','Yeongjo'], rulersCN: ['太祖','世宗大王','英祖'], achievements: { en: ['Hangul alphabet','Turtle ships (Yi Sun-sin)','Joseon ceramics','Neo-Confucian state'], cn: ['韩文字母','龟船（李舜臣）','朝鲜陶瓷','新儒家国家'] } },
    khmer: { capital: { en: 'Angkor', cn: '吴哥' }, rulers: ['Jayavarman VII','Suryavarman II'], rulersCN: ['阇耶跋摩七世','苏利耶跋摩二世'], achievements: { en: ['Angkor Wat','Bayon faces','Khmer hydraulic engineering','Classical Khmer literature'], cn: ['吴哥窟','巴戎寺四面像','高棉水利工程','古典高棉文学'] } },
    abbasid_egypt: { capital: { en: 'Fustat', cn: '福斯塔特' }, achievements: { en: ['Cairo founded (969)','Al-Azhar University','Ismaili Shia caliphate','Mediterranean trade hub'], cn: ['开罗建立（969）','艾资哈尔大学','伊斯玛仪派哈里发','地中海贸易中心'] } },
    fatimid: { capital: { en: 'Cairo', cn: '开罗' }, rulers: ['Al-Mu\'izz','Al-Hakim'], rulersCN: ['穆伊兹','哈基姆'], achievements: { en: ['Cairo founded','Al-Azhar University','Ismaili Shia caliphate','Mediterranean trade hub'], cn: ['建立开罗','艾资哈尔大学','伊斯玛仪派哈里发','地中海贸易中心'] } },
    napoleon: { capital: { en: 'Paris', cn: '巴黎' }, rulers: ['Napoleon Bonaparte'], rulersCN: ['拿破仑·波拿巴'], achievements: { en: ['Napoleonic Code','Metric system spread','Continental System','Austerlitz victory'], cn: ['拿破仑法典','公制度量衡扩展','大陆封锁','奥斯特里茨大捷'] } },
    ussr: { capital: { en: 'Moscow', cn: '莫斯科' }, rulers: ['Lenin','Stalin','Khrushchev','Brezhnev','Gorbachev'], rulersCN: ['列宁','斯大林','赫鲁晓夫','勃列日涅夫','戈尔巴乔夫'], achievements: { en: ['First socialist state','Space race (Sputnik, Gagarin)','Defeat of Nazi Germany','Superpower status'], cn: ['首个社会主义国家','太空竞赛（斯普特尼克、加加林）','击败纳粹德国','超级大国地位'] } }
};

// Historical eras for background shading
const HISTORICAL_ERAS = [
    { name: 'Bronze Age', nameCN: '青铜时代', start: -3000, end: -1200, color: 'rgba(205, 133, 63, 0.08)' },
    { name: 'Iron Age', nameCN: '铁器时代', start: -1200, end: -500, color: 'rgba(112, 128, 144, 0.08)' },
    { name: 'Classical Antiquity', nameCN: '古典时代', start: -500, end: 500, color: 'rgba(65, 105, 225, 0.08)' },
    { name: 'Early Medieval', nameCN: '中世纪早期', start: 500, end: 1000, color: 'rgba(139, 69, 19, 0.06)' },
    { name: 'High Medieval', nameCN: '中世纪盛期', start: 1000, end: 1300, color: 'rgba(128, 0, 128, 0.06)' },
    { name: 'Late Medieval', nameCN: '中世纪晚期', start: 1300, end: 1500, color: 'rgba(85, 107, 47, 0.06)' },
    { name: 'Early Modern', nameCN: '近代早期', start: 1500, end: 1800, color: 'rgba(0, 100, 0, 0.06)' },
    { name: 'Modern', nameCN: '现代', start: 1800, end: 2000, color: 'rgba(0, 0, 139, 0.06)' }
];

// Historical connections between civilizations
const CONNECTIONS = [
    // Trade routes — ancient
    { from: 'han_west', to: 'roman_empire', year: -100, type: 'trade', label: 'Silk Road Opens', labelCN: '丝绸之路开通' },
    { from: 'roman_empire', to: 'kushan', year: 100, type: 'trade', label: 'Indian Ocean Trade', labelCN: '印度洋贸易' },
    { from: 'kushan', to: 'han_east', year: 150, type: 'trade', label: 'Silk Road Buddhism', labelCN: '丝路佛教' },
    { from: 'tang', to: 'abbasid', year: 750, type: 'trade', label: 'Silk Road Peak', labelCN: '丝路贸易鼎盛' },
    { from: 'tang', to: 'umayyad', year: 720, type: 'trade', label: 'Silk Road Trade', labelCN: '丝路贸易' },
    { from: 'srivijaya', to: 'tang', year: 700, type: 'trade', label: 'Maritime Silk Road', labelCN: '海上丝绸之路' },
    { from: 'srivijaya', to: 'abbasid', year: 900, type: 'trade', label: 'Maritime Spice Trade', labelCN: '海上香料贸易' },
    { from: 'ghana', to: 'abbasid', year: 900, type: 'trade', label: 'Gold-Salt Trade', labelCN: '黄金-盐贸易' },
    { from: 'mali', to: 'abbasid', year: 1300, type: 'trade', label: 'Trans-Saharan Trade', labelCN: '跨撒哈拉贸易' },
    { from: 'mali', to: 'mamluk', year: 1324, type: 'trade', label: "Mansa Musa's Hajj", labelCN: '曼萨·穆萨朝圣' },
    { from: 'ming', to: 'majapahit', year: 1405, type: 'trade', label: 'Zheng He Voyages', labelCN: '郑和下西洋' },
    { from: 'ming', to: 'mali', year: 1418, type: 'trade', label: 'Zheng He Reaches Africa', labelCN: '郑和达非洲' },
    { from: 'n_song', to: 'fatimid', year: 1100, type: 'trade', label: 'Indian Ocean Commerce', labelCN: '印度洋贸易' },
    { from: 'yuan', to: 'ilkhanate', year: 1290, type: 'trade', label: 'Pax Mongolica', labelCN: '蒙古和平' },
    { from: 'chola', to: 'n_song', year: 1015, type: 'trade', label: 'Chola-Song Embassies', labelCN: '朱罗-宋交聘' },

    // Major Conflicts — ancient
    { from: 'achaemenid', to: 'greek_citystates', year: -490, type: 'conflict', label: 'Greco-Persian Wars', labelCN: '希波战争' },
    { from: 'macedon', to: 'achaemenid', year: -331, type: 'conquest', label: "Alexander's Conquest", labelCN: '亚历山大东征' },
    { from: 'roman_republic_2', to: 'carthage', year: -218, type: 'conflict', label: 'Second Punic War', labelCN: '第二次布匿战争' },
    { from: 'han_west', to: 'xiongnu', year: -133, type: 'conflict', label: 'Han-Xiongnu Wars', labelCN: '汉匈战争' },
    { from: 'roman_empire', to: 'parthia', year: 53, type: 'conflict', label: 'Battle of Carrhae', labelCN: '卡莱战役' },
    { from: 'roman_empire', to: 'parthia', year: 117, type: 'conflict', label: "Trajan's Parthian War", labelCN: '图拉真远征帕提亚' },
    { from: 'sasanian', to: 'roman_east', year: 260, type: 'conflict', label: 'Battle of Edessa', labelCN: '埃德萨战役' },
    { from: 'tang', to: 'abbasid', year: 751, type: 'conflict', label: 'Battle of Talas', labelCN: '怛罗斯之战' },

    // Medieval conquests
    { from: 'rashidun', to: 'sasanian', year: 651, type: 'conquest', label: 'Arab Conquest of Persia', labelCN: '阿拉伯征服波斯' },
    { from: 'rashidun', to: 'byzantine', year: 636, type: 'conquest', label: 'Yarmouk — Levant Falls', labelCN: '耶尔穆克河战役' },
    { from: 'umayyad', to: 'visigothic', year: 711, type: 'conquest', label: 'Muslim Conquest of Iberia', labelCN: '征服伊比利亚' },
    { from: 'mongol_emp', to: 'khwarazmian', year: 1220, type: 'conquest', label: 'Mongol Invasion of Khwarezm', labelCN: '蒙古征花剌子模' },
    { from: 'mongol_emp', to: 'jin_jurchen', year: 1234, type: 'conquest', label: 'Mongol Conquest of Jin', labelCN: '蒙古灭金' },
    { from: 'mongol_emp', to: 'abbasid_core', year: 1258, type: 'conquest', label: 'Sack of Baghdad', labelCN: '巴格达之围' },
    { from: 'mongol_emp', to: 'kievan_rus', year: 1240, type: 'conquest', label: 'Mongol Sack of Kiev', labelCN: '蒙古陷基辅' },
    { from: 'mamluk', to: 'mongol_emp', year: 1260, type: 'conflict', label: 'Ain Jalut — Mongols Halted', labelCN: '艾因贾鲁特战役' },
    { from: 'ottoman_mid', to: 'byzantine_anatolia', year: 1453, type: 'conquest', label: 'Fall of Constantinople', labelCN: '君士坦丁堡陷落' },
    { from: 'ming', to: 'joseon', year: 1592, type: 'conflict', label: 'Imjin War', labelCN: '万历朝鲜之役' },
    { from: 'qing', to: 'northern_yuan', year: 1635, type: 'conquest', label: 'Qing Subjugates Mongolia', labelCN: '清朝统一蒙古' },

    // Colonial conquests
    { from: 'spain', to: 'aztec', year: 1521, type: 'conquest', label: 'Spanish Conquest of Aztec', labelCN: '西班牙征服阿兹特克' },
    { from: 'spain', to: 'inca', year: 1533, type: 'conquest', label: 'Spanish Conquest of Inca', labelCN: '西班牙征服印加' },
    { from: 'great_britain', to: 'mughal_rump', year: 1757, type: 'conquest', label: 'Battle of Plassey', labelCN: '普拉西战役' },
    { from: 'great_britain', to: 'qing', year: 1842, type: 'conflict', label: 'First Opium War', labelCN: '第一次鸦片战争' },
    { from: 'taisho_showa', to: 'roc', year: 1937, type: 'conflict', label: 'Second Sino-Japanese War', labelCN: '抗日战争' },

    // Succession/Transformation
    { from: 'roman_late', to: 'byzantine_early', year: 395, type: 'succession', label: 'Empire Splits East/West', labelCN: '罗马帝国分裂' },
    { from: 'rashidun', to: 'umayyad', year: 661, type: 'succession', label: 'Umayyad Caliphate', labelCN: '倭马亚建立' },
    { from: 'umayyad', to: 'abbasid', year: 750, type: 'succession', label: 'Abbasid Revolution', labelCN: '阿拔斯革命' },
    { from: 'mongol_emp', to: 'yuan', year: 1271, type: 'succession', label: 'Yuan Founded', labelCN: '元朝建立' },
    { from: 'timurid', to: 'mughal_early', year: 1526, type: 'succession', label: 'Babur Founds Mughals', labelCN: '巴布尔建立莫卧儿' },

    // Cultural Exchange / Religion
    { from: 'tang', to: 'unified_silla', year: 650, type: 'cultural', label: 'Buddhism to Korea', labelCN: '佛教东传朝鲜' },
    { from: 'tang', to: 'nara', year: 710, type: 'cultural', label: 'Japan Adopts Tang System', labelCN: '日本学习唐制' },
    { from: 'gupta', to: 'srivijaya', year: 500, type: 'cultural', label: 'Hinduism & Buddhism', labelCN: '印度教与佛教传播' },
    { from: 'kushan', to: 'tang', year: 400, type: 'cultural', label: 'Buddhism on Silk Road', labelCN: '丝路佛教东传' },
    { from: 'byzantine', to: 'kievan_rus', year: 988, type: 'cultural', label: 'Christianization of Rus', labelCN: '罗斯基督化' },
    { from: 'carolingian', to: 'hre', year: 962, type: 'succession', label: 'Holy Roman Empire Founded', labelCN: '神圣罗马帝国建立' },

    // Southeast Asian
    { from: 'khmer', to: 'dai_viet', year: 1471, type: 'conflict', label: 'Champa-Viet Wars', labelCN: '占城战争' },
    { from: 'srivijaya', to: 'chola', year: 1025, type: 'conflict', label: 'Chola Raids Srivijaya', labelCN: '朱罗远征' },

    // Modern global
    { from: 'nazi_germany', to: 'ussr_early', year: 1941, type: 'conflict', label: 'Operation Barbarossa', labelCN: '巴巴罗萨计划' },
    { from: 'ussr', to: 'prc', year: 1950, type: 'cultural', label: 'Sino-Soviet Alliance', labelCN: '中苏同盟' }
];

// Major Historical Events — enriched to ~90 entries, each with a short description
const HISTORICAL_EVENTS = [
    // ===== PRE-HISTORY & ANCIENT =====
    { year: -3000, label: 'Cuneiform Invented', labelCN: '楔形文字发明', region: 'middleEast', type: 'invention', desc: { en: 'Sumerians in Uruk press the first writing signs into clay tablets — history begins.', cn: '乌鲁克的苏美尔人将第一批文字符号刻入泥版——历史自此开始。' } },
    { year: -2700, label: 'Egyptian Hieroglyphs', labelCN: '埃及象形文字', region: 'africa', type: 'invention', desc: { en: 'Hieroglyphic writing matures into a system used for royal inscriptions and religious texts.', cn: '象形文字发展为用于王室铭文与宗教文献的成熟体系。' } },
    { year: -2600, label: 'Great Pyramid of Giza', labelCN: '吉萨大金字塔', region: 'africa', type: 'construction', desc: { en: "Pharaoh Khufu's monument stands 146m tall — humanity's tallest structure for 3,800 years.", cn: '法老胡夫的陵墓高达146米——此后3800年间人类最高建筑。' } },
    { year: -2334, label: 'Sargon of Akkad', labelCN: '阿卡德萨尔贡', region: 'middleEast', type: 'political', desc: { en: "World's first multi-ethnic empire forged from the Sumerian city-states.", cn: '世界首个多民族帝国——由苏美尔城邦铸就。' } },
    { year: -1754, label: "Hammurabi's Code", labelCN: '汉谟拉比法典', region: 'middleEast', type: 'cultural', desc: { en: "Babylon's king inscribes 282 laws on a stele — one of humanity's earliest legal codes.", cn: '巴比伦国王在石柱上刻下282条法律——人类最早的成文法典之一。' } },
    { year: -1600, label: 'Shang Oracle Bones', labelCN: '商代甲骨文', region: 'eastAsia', type: 'invention', desc: { en: 'Earliest Chinese writing divines the future through inscriptions on turtle shells and ox bones.', cn: '最早的中国文字：在龟甲兽骨上刻辞占卜未来。' } },
    { year: -1274, label: 'Battle of Kadesh', labelCN: '卡迭石战役', region: 'middleEast', type: 'conflict', desc: { en: 'Ramesses II of Egypt vs Muwatalli II of Hatti — history\'s earliest well-documented battle.', cn: '埃及拉美西斯二世对战赫梯穆瓦塔里二世——史上有详细记录的最早战役。' } },
    { year: -776, label: 'First Olympic Games', labelCN: '第一届奥运会', region: 'europe', type: 'cultural', desc: { en: 'Athletic competitions at Olympia, held every four years in honor of Zeus.', cn: '奥林匹亚竞技大会——每四年为献给宙斯而举行。' } },
    { year: -753, label: 'Traditional Founding of Rome', labelCN: '罗马建城', region: 'europe', type: 'political', desc: { en: 'Legendary founding of Rome by Romulus; a hilltop village that would rule the world.', cn: '罗慕路斯传说中建立罗马城——一个山丘村落将统治世界。' } },
    { year: -563, label: 'Buddha Born', labelCN: '佛陀诞生', region: 'southAsia', type: 'cultural', desc: { en: 'Siddhartha Gautama is born in Lumbini; his teachings will reshape Asian civilization.', cn: '悉达多·乔达摩诞生于蓝毗尼；其教义将重塑亚洲文明。' } },
    { year: -551, label: 'Confucius Born', labelCN: '孔子诞生', region: 'eastAsia', type: 'cultural', desc: { en: 'Kong Qiu is born in Lu; his ethical philosophy will guide East Asia for 2,500 years.', cn: '孔丘生于鲁国；其伦理哲学将指引东亚两千五百年。' } },
    { year: -508, label: 'Athenian Democracy', labelCN: '雅典民主制', region: 'europe', type: 'political', desc: { en: 'Cleisthenes\' reforms create the first democratic constitution in history.', cn: '克里斯提尼改革创立史上首部民主宪制。' } },
    { year: -480, label: 'Battle of Thermopylae', labelCN: '温泉关之战', region: 'europe', type: 'conflict', desc: { en: '300 Spartans delay Xerxes\' Persian army — an enduring legend of defiance.', cn: '300勇士阻挡薛西斯波斯大军——抗争的不朽传奇。' } },
    { year: -431, label: 'Peloponnesian War', labelCN: '伯罗奔尼撒战争', region: 'europe', type: 'conflict', desc: { en: 'Athens vs Sparta — a 27-year war that exhausted classical Greece.', cn: '雅典对战斯巴达——27年战争耗尽了古典希腊。' } },
    { year: -399, label: 'Death of Socrates', labelCN: '苏格拉底之死', region: 'europe', type: 'cultural', desc: { en: 'Executed for corrupting youth; his student Plato ensures his thought endures.', cn: '被判腐蚀青年处死；其弟子柏拉图令其思想永存。' } },
    { year: -336, label: 'Alexander the Great', labelCN: '亚历山大大帝', region: 'europe', type: 'political', desc: { en: 'Takes the Macedonian throne; within 12 years he conquers from Egypt to the Indus.', cn: '继承马其顿王位；12年内征服从埃及到印度河的广袤土地。' } },
    { year: -269, label: "Ashoka's Conversion", labelCN: '阿育王皈依', region: 'southAsia', type: 'cultural', desc: { en: 'After the bloody Kalinga War, Ashoka embraces Buddhism and spreads it across Asia.', cn: '羯陵伽之战后，阿育王皈依佛教并将其传遍亚洲。' } },
    { year: -221, label: 'Qin Unifies China', labelCN: '秦统一中国', region: 'eastAsia', type: 'political', desc: { en: 'Qin Shi Huang ends the Warring States; standardizes writing, coinage, axle width.', cn: '秦始皇终结战国；统一文字、货币与车轨。' } },
    { year: -216, label: 'Battle of Cannae', labelCN: '坎尼会战', region: 'europe', type: 'conflict', desc: { en: 'Hannibal annihilates a Roman army double his size — a masterclass in tactical genius.', cn: '汉尼拔以少胜多，歼灭两倍于己的罗马军——战术天才典范。' } },
    { year: -146, label: 'Destruction of Carthage', labelCN: '迦太基毁灭', region: 'africa', type: 'conflict', desc: { en: 'Rome razes its greatest rival after three Punic Wars — the Mediterranean becomes Mare Nostrum.', cn: '经三次布匿战争罗马夷平其最大敌手——地中海成为罗马内海。' } },
    { year: -100, label: 'Silk Road Opens', labelCN: '丝绸之路开通', region: 'eastAsia', type: 'trade', desc: { en: 'Han envoys reach Central Asia; silk, spices, ideas and disease begin to flow west.', cn: '汉使到达中亚；丝绸、香料、思想与疾病开始西流。' } },
    { year: -44, label: 'Assassination of Caesar', labelCN: '凯撒遇刺', region: 'europe', type: 'political', desc: { en: 'Julius Caesar is stabbed on the Ides of March; the Republic\'s long death begins.', cn: '凯撒于三月望日被刺；共和国漫长的终结由此开始。' } },
    { year: -27, label: 'Roman Empire Begins', labelCN: '罗马帝国建立', region: 'europe', type: 'political', desc: { en: 'Octavian becomes Augustus — the Republic is dead, the Empire is born.', cn: '屋大维称奥古斯都——共和国终结，帝国诞生。' } },
    // ===== CLASSICAL =====
    { year: 0, label: 'Jesus of Nazareth', labelCN: '拿撒勒的耶稣', region: 'middleEast', type: 'cultural', desc: { en: 'Approximate birth year of Jesus — the pivot of the Western calendar.', cn: '耶稣约生于此年——成为西方纪年之枢。' } },
    { year: 79, label: 'Vesuvius Destroys Pompeii', labelCN: '维苏威毁灭庞贝', region: 'europe', type: 'disaster', desc: { en: 'Volcanic eruption preserves a Roman city in ash — a window into everyday antiquity.', cn: '火山喷发将庞贝封存于火山灰——成为古代日常生活的窗口。' } },
    { year: 105, label: 'Paper Invented', labelCN: '蔡伦造纸', region: 'eastAsia', type: 'invention', desc: { en: 'Cai Lun perfects the paper-making process — a quiet revolution for writing.', cn: '蔡伦改进造纸术——书写领域的静默革命。' } },
    { year: 220, label: 'End of Han — Three Kingdoms', labelCN: '三国鼎立', region: 'eastAsia', type: 'political', desc: { en: 'Han China fragments into the dramatic Three Kingdoms era celebrated in literature.', cn: '汉朝分裂为文学中广为传颂的三国时代。' } },
    { year: 313, label: 'Edict of Milan', labelCN: '米兰敕令', region: 'europe', type: 'cultural', desc: { en: 'Constantine legalizes Christianity — within a century it becomes Rome\'s state religion.', cn: '君士坦丁使基督教合法——百年内成为罗马国教。' } },
    { year: 330, label: 'Constantinople Founded', labelCN: '君士坦丁堡建立', region: 'europe', type: 'construction', desc: { en: 'Constantine builds a "New Rome" on the Bosphorus — capital of the East for 1,100 years.', cn: '君士坦丁在博斯普鲁斯海峡建立"新罗马"——东方首都千余年。' } },
    { year: 476, label: 'Fall of Western Rome', labelCN: '西罗马灭亡', region: 'europe', type: 'political', desc: { en: 'Odoacer deposes Romulus Augustulus — a quiet end to the Western Roman Empire.', cn: '奥多亚塞废黜罗慕路斯·奥古斯都——西罗马帝国悄然终结。' } },
    { year: 570, label: 'Birth of Muhammad', labelCN: '穆罕默德诞生', region: 'middleEast', type: 'cultural', desc: { en: 'The Prophet of Islam is born in Mecca — his revelations will reshape three continents.', cn: '伊斯兰先知生于麦加——其启示将重塑三大洲。' } },
    { year: 622, label: 'Hijra — Islamic Calendar', labelCN: '希吉拉·伊斯兰历', region: 'middleEast', type: 'cultural', desc: { en: "Muhammad's migration to Medina marks year zero of the Islamic calendar.", cn: '穆罕默德迁往麦地那——伊斯兰历元年。' } },
    { year: 732, label: 'Battle of Tours', labelCN: '图尔战役', region: 'europe', type: 'conflict', desc: { en: 'Charles Martel halts the Muslim advance into Western Europe at Poitiers.', cn: '查理·马特在普瓦捷阻挡穆斯林向西欧的推进。' } },
    { year: 751, label: 'Battle of Talas', labelCN: '怛罗斯之战', region: 'centralAsia', type: 'conflict', desc: { en: 'Abbasid vs Tang — paper-making is said to spread westward after Chinese prisoners teach it.', cn: '阿拔斯对战唐军——造纸术据传因中国战俘传授而西传。' } },
    { year: 794, label: 'Heian Capital Founded', labelCN: '平安京建都', region: 'eastAsia', type: 'construction', desc: { en: 'Emperor Kanmu moves Japan\'s capital to Kyoto — beginning the Heian golden age.', cn: '桓武天皇迁都京都——开启平安时代黄金期。' } },
    { year: 800, label: 'Charlemagne Crowned', labelCN: '查理曼加冕', region: 'europe', type: 'political', desc: { en: 'Pope Leo III crowns Charlemagne Emperor — symbolic revival of Roman authority in the West.', cn: '教宗利奥三世为查理曼加冕——罗马权威在西方的象征性复兴。' } },
    { year: 868, label: 'Diamond Sutra Printed', labelCN: '《金刚经》印刷', region: 'eastAsia', type: 'invention', desc: { en: "World's oldest dated printed book — a Chinese Buddhist sutra.", cn: '世界现存最早有确切年代的印刷书——中国佛经《金刚经》。' } },
    { year: 960, label: 'Song Dynasty Founded', labelCN: '宋朝建立', region: 'eastAsia', type: 'political', desc: { en: 'Zhao Kuangyin founds the Song — beginning of an era of commercial and technological flowering.', cn: '赵匡胤建立宋朝——商业与科技繁盛时代的开端。' } },
    { year: 1000, label: 'Leif Erikson in Vinland', labelCN: '莱夫·埃里克森登陆北美', region: 'americas', type: 'exploration', desc: { en: 'Norse explorers reach Newfoundland — Europeans in the Americas 500 years before Columbus.', cn: '维京探险家到达纽芬兰——比哥伦布早500年的欧洲人美洲登陆。' } },
    { year: 1054, label: 'Great Schism', labelCN: '东西教会大分裂', region: 'europe', type: 'cultural', desc: { en: 'Christianity splits into Catholic (West) and Orthodox (East) — a rift that endures.', cn: '基督教分裂为天主教（西方）与东正教（东方）——延续至今的裂痕。' } },
    { year: 1066, label: 'Norman Conquest', labelCN: '诺曼征服', region: 'europe', type: 'conflict', desc: { en: 'William of Normandy defeats Harold at Hastings — reshaping England forever.', cn: '诺曼底威廉在黑斯廷斯击败哈罗德——永久改变英格兰。' } },
    { year: 1095, label: 'First Crusade Called', labelCN: '第一次十字军东征', region: 'europe', type: 'conflict', desc: { en: 'Pope Urban II calls for holy war to reclaim Jerusalem — two centuries of crusades begin.', cn: '教宗乌尔班二世号召圣战夺回耶路撒冷——两个世纪的十字军东征开始。' } },
    { year: 1206, label: 'Genghis Khan United Mongols', labelCN: '成吉思汗统一蒙古', region: 'centralAsia', type: 'political', desc: { en: 'Temüjin is proclaimed Genghis Khan — world-shattering conquest follows.', cn: '铁木真被尊为成吉思汗——震动世界的征服随之而来。' } },
    { year: 1215, label: 'Magna Carta', labelCN: '大宪章', region: 'europe', type: 'political', desc: { en: 'English barons force King John to accept limits on royal power — a cornerstone of constitutionalism.', cn: '英格兰贵族迫使约翰王接受王权限制——立宪主义基石。' } },
    { year: 1258, label: 'Sack of Baghdad', labelCN: '蒙古陷巴格达', region: 'middleEast', type: 'conquest', desc: { en: "Hulagu's Mongols destroy the Abbasid capital — the end of the Islamic Golden Age.", cn: '旭烈兀的蒙古军摧毁阿拔斯首都——伊斯兰黄金时代终结。' } },
    { year: 1271, label: "Marco Polo's Journey", labelCN: '马可·波罗东行', region: 'eastAsia', type: 'exploration', desc: { en: 'Venetian merchant reaches Kublai Khan\'s court — his book inspires an age of exploration.', cn: '威尼斯商人抵达忽必烈汗廷——其游记激发探索时代。' } },
    { year: 1279, label: 'Southern Song Falls', labelCN: '南宋灭亡', region: 'eastAsia', type: 'conquest', desc: { en: 'Mongol conquest completes after the Battle of Yamen — Kublai Khan rules all China.', cn: '崖山之战后南宋灭亡——忽必烈统一中国。' } },
    { year: 1324, label: "Mansa Musa's Hajj", labelCN: '曼萨·穆萨朝圣', region: 'africa', type: 'cultural', desc: { en: 'Mali emperor distributes so much gold in Cairo that its value crashes for a decade.', cn: '马里皇帝在开罗散发的黄金令当地金价暴跌十年。' } },
    { year: 1347, label: 'Black Death', labelCN: '黑死病', region: 'europe', type: 'disaster', desc: { en: 'Plague kills 30-50% of Europe\'s population — medieval society is shattered.', cn: '鼠疫使欧洲人口减少30-50%——中世纪社会崩解。' } },
    { year: 1368, label: 'Ming Founded', labelCN: '明朝建立', region: 'eastAsia', type: 'political', desc: { en: 'Zhu Yuanzhang expels Mongols and founds the Ming — Han Chinese rule restored.', cn: '朱元璋驱逐蒙古建立明朝——汉人政权复兴。' } },
    { year: 1405, label: 'Zheng He Voyages', labelCN: '郑和下西洋', region: 'eastAsia', type: 'exploration', desc: { en: 'Ming treasure fleet of 300 ships reaches East Africa — decades before Vasco da Gama.', cn: '明代300艘宝船舰队远达东非——比达伽马早数十年。' } },
    { year: 1440, label: 'Gutenberg Press', labelCN: '古腾堡印刷机', region: 'europe', type: 'invention', desc: { en: 'Movable type printing arrives in Europe — knowledge explodes in volume and access.', cn: '活字印刷术传入欧洲——知识在数量与可及性上爆炸式增长。' } },
    { year: 1453, label: 'Fall of Constantinople', labelCN: '君士坦丁堡陷落', region: 'europe', type: 'conquest', desc: { en: 'Ottoman cannons breach Constantinople\'s walls — the Roman Empire finally ends after 2,200 years.', cn: '奥斯曼大炮轰破君士坦丁堡城墙——延续2200年的罗马帝国终结。' } },
    { year: 1492, label: 'Columbus Reaches Americas', labelCN: '哥伦布到达美洲', region: 'americas', type: 'exploration', desc: { en: "Genoese sailor lands in Bahamas — the Columbian Exchange begins.", cn: '热那亚水手登陆巴哈马——哥伦布大交换开始。' } },
    { year: 1498, label: 'Vasco da Gama to India', labelCN: '达伽马抵达印度', region: 'southAsia', type: 'exploration', desc: { en: 'Portuguese establish a direct sea route to India — rewriting global trade.', cn: '葡萄牙开辟通往印度的直航海路——重写全球贸易。' } },
    { year: 1517, label: 'Protestant Reformation', labelCN: '宗教改革', region: 'europe', type: 'cultural', desc: { en: "Luther's 95 Theses spark the schism that divides Western Christianity.", cn: '路德《九十五条论纲》引发分裂西方基督教的大改革。' } },
    { year: 1519, label: 'Cortés Reaches Tenochtitlan', labelCN: '科尔特斯抵达特诺奇蒂特兰', region: 'americas', type: 'conquest', desc: { en: 'Spanish conquistador arrives at the Aztec capital — fall follows within two years.', cn: '西班牙征服者抵达阿兹特克首都——两年内被征服。' } },
    { year: 1543, label: 'Copernicus — De Revolutionibus', labelCN: '哥白尼《天体运行论》', region: 'europe', type: 'invention', desc: { en: 'Heliocentric model published — Earth is no longer the universe\'s center.', cn: '日心说发表——地球不再是宇宙中心。' } },
    { year: 1588, label: 'Spanish Armada Defeated', labelCN: '西班牙无敌舰队败北', region: 'europe', type: 'conflict', desc: { en: 'English navy defeats Spain — beginning of Atlantic power shift.', cn: '英国海军击败西班牙——大西洋权力转移开始。' } },
    { year: 1603, label: 'Tokugawa Shogunate', labelCN: '德川幕府建立', region: 'eastAsia', type: 'political', desc: { en: 'Ieyasu becomes shogun — 250 years of peace and isolation begin.', cn: '德川家康任将军——250年和平与锁国开始。' } },
    { year: 1609, label: "Galileo's Telescope", labelCN: '伽利略望远镜', region: 'europe', type: 'invention', desc: { en: 'Galileo observes moons of Jupiter — confirming Copernicus.', cn: '伽利略观察木星卫星——证实哥白尼学说。' } },
    { year: 1644, label: 'Ming Falls; Qing Enters Beijing', labelCN: '明亡清兴', region: 'eastAsia', type: 'political', desc: { en: 'Manchu forces take Beijing as Chongzhen Emperor hangs himself — Qing dynasty begins.', cn: '崇祯帝自缢，满洲入京——清朝建立。' } },
    { year: 1687, label: "Newton's Principia", labelCN: '牛顿《自然哲学的数学原理》', region: 'europe', type: 'invention', desc: { en: 'Isaac Newton publishes laws of motion and universal gravitation — modern physics is born.', cn: '牛顿发表运动定律与万有引力——现代物理学诞生。' } },
    { year: 1707, label: 'Acts of Union', labelCN: '联合法案', region: 'europe', type: 'political', desc: { en: 'England and Scotland unite as the Kingdom of Great Britain.', cn: '英格兰与苏格兰合并为大不列颠王国。' } },
    { year: 1757, label: 'Battle of Plassey', labelCN: '普拉西战役', region: 'southAsia', type: 'conflict', desc: { en: 'British East India Company defeats Bengal Nawab — British dominance of India begins.', cn: '英国东印度公司击败孟加拉纳瓦卜——英国主导印度开始。' } },
    { year: 1776, label: 'American Independence', labelCN: '美国独立', region: 'americas', type: 'political', desc: { en: 'Thirteen colonies declare independence — a republic of unprecedented scope.', cn: '十三殖民地宣布独立——空前规模的共和国诞生。' } },
    { year: 1789, label: 'French Revolution', labelCN: '法国大革命', region: 'europe', type: 'political', desc: { en: 'Storming of the Bastille — the age of revolutions transforms European politics.', cn: '攻占巴士底狱——革命时代重塑欧洲政治。' } },
    { year: 1804, label: 'Haiti Independence', labelCN: '海地独立', region: 'americas', type: 'political', desc: { en: 'First successful slave revolt establishes the second republic in the Americas.', cn: '史上首次成功的奴隶革命建立美洲第二个共和国。' } },
    { year: 1815, label: 'Battle of Waterloo', labelCN: '滑铁卢战役', region: 'europe', type: 'conflict', desc: { en: "Napoleon's final defeat ends the French imperial era; Congress of Vienna reshapes Europe.", cn: '拿破仑最终失败，法兰西帝国时代终结；维也纳会议重塑欧洲。' } },
    { year: 1839, label: 'First Opium War', labelCN: '第一次鸦片战争', region: 'eastAsia', type: 'conflict', desc: { en: 'Britain forces China to open to opium trade — Qing "unequal treaties" era begins.', cn: '英国迫使中国开放鸦片贸易——清朝不平等条约时代开始。' } },
    { year: 1848, label: 'Communist Manifesto', labelCN: '《共产党宣言》', region: 'europe', type: 'cultural', desc: { en: 'Marx and Engels publish a pamphlet that will shake the 20th century.', cn: '马克思与恩格斯发表震撼20世纪的小册子。' } },
    { year: 1853, label: 'Perry Opens Japan', labelCN: '佩里叩关', region: 'eastAsia', type: 'political', desc: { en: "Commodore Perry's 'black ships' end Japan's two-century isolation.", cn: '佩里的"黑船"结束日本二百年锁国。' } },
    { year: 1859, label: "Darwin's Origin of Species", labelCN: '达尔文《物种起源》', region: 'europe', type: 'invention', desc: { en: 'Theory of evolution by natural selection transforms biology and human self-understanding.', cn: '自然选择的演化论改变生物学与人类自我认识。' } },
    { year: 1861, label: 'American Civil War', labelCN: '美国内战', region: 'americas', type: 'conflict', desc: { en: 'North vs South over slavery — ends with emancipation and a reunited nation.', cn: '南北为奴隶制开战——以解放黑奴与国家重新统一告终。' } },
    { year: 1868, label: 'Meiji Restoration', labelCN: '明治维新', region: 'eastAsia', type: 'political', desc: { en: 'Japan launches breakneck modernization; within decades, Asia\'s first industrial power.', cn: '日本启动急速现代化；数十年内成为亚洲首个工业强国。' } },
    { year: 1871, label: 'German Unification', labelCN: '德国统一', region: 'europe', type: 'political', desc: { en: 'Bismarck proclaims the German Empire at Versailles — European balance shattered.', cn: '俾斯麦在凡尔赛宣告德意志帝国成立——欧洲均势打破。' } },
    { year: 1885, label: 'Scramble for Africa', labelCN: '瓜分非洲', region: 'africa', type: 'political', desc: { en: 'Berlin Conference carves up Africa among European powers — colonial map consolidated.', cn: '柏林会议将非洲在欧洲列强间瓜分——殖民地图固化。' } },
    { year: 1903, label: 'Wright Flyer', labelCN: '莱特兄弟飞机', region: 'americas', type: 'invention', desc: { en: 'First powered heavier-than-air flight at Kitty Hawk — humanity leaves the ground.', cn: '小鹰镇首次动力飞行——人类离开地面。' } },
    { year: 1911, label: 'Xinhai Revolution', labelCN: '辛亥革命', region: 'eastAsia', type: 'political', desc: { en: 'Qing dynasty falls — ends 2,100 years of imperial rule in China.', cn: '清朝倾覆——结束中国2100年的帝制。' } },
    { year: 1914, label: 'World War I Begins', labelCN: '第一次世界大战', region: 'europe', type: 'conflict', desc: { en: 'Assassination in Sarajevo cascades into industrial-scale war — 17 million dead.', cn: '萨拉热窝枪声引发工业规模战争——1700万人罹难。' } },
    { year: 1917, label: 'Russian Revolution', labelCN: '十月革命', region: 'europe', type: 'political', desc: { en: 'Bolsheviks seize power — the world\'s first communist state is born.', cn: '布尔什维克夺权——世界首个社会主义国家诞生。' } },
    { year: 1929, label: 'Great Depression', labelCN: '大萧条', region: 'americas', type: 'disaster', desc: { en: 'Wall Street Crash triggers a decade of global economic collapse.', cn: '华尔街股灾引发全球十年经济崩溃。' } },
    { year: 1939, label: 'World War II Begins', labelCN: '第二次世界大战', region: 'europe', type: 'conflict', desc: { en: 'Germany invades Poland — six years of global war and genocide follow.', cn: '德国入侵波兰——六年全球战争与种族灭绝随之而来。' } },
    { year: 1945, label: 'Hiroshima & UN', labelCN: '广岛·联合国成立', region: 'americas', type: 'political', desc: { en: 'Atomic bombs end WWII; United Nations founded to prevent future world wars.', cn: '原子弹结束二战；联合国成立以防止未来世界大战。' } },
    { year: 1947, label: 'Indian Independence', labelCN: '印度独立', region: 'southAsia', type: 'political', desc: { en: 'British Raj partitions into India and Pakistan — millions migrate, 1-2 million die.', cn: '英属印度分裂为印度与巴基斯坦——数百万人迁徙，百万人死亡。' } },
    { year: 1949, label: 'PRC Founded', labelCN: '中华人民共和国成立', region: 'eastAsia', type: 'political', desc: { en: 'Mao Zedong proclaims the People\'s Republic in Beijing.', cn: '毛泽东在北京宣告中华人民共和国成立。' } },
    { year: 1957, label: 'Sputnik Launches', labelCN: '斯普特尼克升空', region: 'europe', type: 'invention', desc: { en: 'USSR puts the first artificial satellite in orbit — the Space Age begins.', cn: '苏联发射首颗人造卫星——太空时代开始。' } },
    { year: 1969, label: 'Moon Landing', labelCN: '人类登月', region: 'americas', type: 'invention', desc: { en: 'Apollo 11: Neil Armstrong takes "one small step" — humans walk on another world.', cn: '阿波罗11号：阿姆斯特朗迈出"一小步"——人类行走于另一星球。' } },
    { year: 1978, label: "China's Reform & Opening", labelCN: '中国改革开放', region: 'eastAsia', type: 'political', desc: { en: 'Deng Xiaoping launches reforms that will lift 800M out of poverty over 40 years.', cn: '邓小平发动改革——40年内使8亿人脱贫。' } },
    { year: 1989, label: 'Fall of the Berlin Wall', labelCN: '柏林墙倒塌', region: 'europe', type: 'political', desc: { en: 'East Germans pour through the Wall — the Cold War\'s iconic barrier crumbles.', cn: '东德人涌过柏林墙——冷战标志性屏障崩塌。' } },
    { year: 1991, label: 'Soviet Union Dissolves', labelCN: '苏联解体', region: 'europe', type: 'political', desc: { en: 'Fifteen successor states emerge — the 74-year Soviet experiment ends.', cn: '15个继承国出现——74年的苏维埃实验终结。' } }
];

// Capital cities for major entities
const CAPITALS = {
    qin: { name: 'Xianyang', nameCN: '咸阳', lat: 34.33, lon: 108.71 },
    han_west: { name: "Chang'an", nameCN: '长安', lat: 34.27, lon: 108.95 },
    han_east: { name: 'Luoyang', nameCN: '洛阳', lat: 34.62, lon: 112.45 },
    tang: { name: "Chang'an", nameCN: '长安', lat: 34.27, lon: 108.95 },
    n_song: { name: 'Kaifeng', nameCN: '开封', lat: 34.80, lon: 114.35 },
    s_song: { name: "Lin'an", nameCN: '临安', lat: 30.25, lon: 120.17 },
    yuan: { name: 'Dadu (Beijing)', nameCN: '大都', lat: 39.90, lon: 116.40 },
    ming: { name: 'Beijing/Nanjing', nameCN: '北京/南京', lat: 39.90, lon: 116.40 },
    qing: { name: 'Beijing', nameCN: '北京', lat: 39.90, lon: 116.40 },
    roman_empire: { name: 'Rome', nameCN: '罗马', lat: 41.90, lon: 12.50 },
    byzantine: { name: 'Constantinople', nameCN: '君士坦丁堡', lat: 41.01, lon: 28.98 },
    ottoman: { name: 'Istanbul', nameCN: '伊斯坦布尔', lat: 41.01, lon: 28.98 },
    achaemenid: { name: 'Persepolis', nameCN: '波斯波利斯', lat: 29.93, lon: 52.89 },
    abbasid: { name: 'Baghdad', nameCN: '巴格达', lat: 33.31, lon: 44.37 },
    mongol_emp: { name: 'Karakorum', nameCN: '哈拉和林', lat: 47.20, lon: 102.83 },
    mughal: { name: 'Delhi/Agra', nameCN: '德里/阿格拉', lat: 28.61, lon: 77.21 },
    aztec: { name: 'Tenochtitlan', nameCN: '特诺奇蒂特兰', lat: 19.43, lon: -99.13 },
    inca: { name: 'Cusco', nameCN: '库斯科', lat: -13.52, lon: -71.97 },
    edo: { name: 'Edo (Tokyo)', nameCN: '江户', lat: 35.68, lon: 139.77 },
    joseon: { name: 'Hanyang (Seoul)', nameCN: '汉阳', lat: 37.57, lon: 126.98 },
    khmer: { name: 'Angkor', nameCN: '吴哥', lat: 13.41, lon: 103.87 },
    mali: { name: 'Timbuktu', nameCN: '廷巴克图', lat: 16.77, lon: -3.01 }
};

// ============================================
// HISTORICAL DATA BY REGION
// ============================================

const WORLD_HISTORY = {
    eastAsia: {
        name: "East Asia",
        nameCN: "东亚",
        slotEnd: 6,
        // TERRITORY SLOTS: 0=China(North), 1=China(South), 2=Mongolia, 3=Korea, 4=Japan, 5=Vietnam
        entities: [
            // ============ SLOT 0: CHINA NORTH (Yellow River / Central Plains) ============
            { id: "china_neolithic", name: "Neolithic China", nameCN: "新石器时代", start: -3000, end: -2070, slot: 0, width: 1, color: '#A89080' },
            { id: "xia", name: "Xia", nameCN: "夏", start: -2070, end: -1600, slot: 0, width: 1, color: '#B09888' },
            { id: "shang", name: "Shang", nameCN: "商", start: -1600, end: -1046, slot: 0, width: 1, color: '#C9B896' },
            { id: "zhou_west", name: "Western Zhou", nameCN: "西周", start: -1046, end: -771, slot: 0, width: 1, color: '#D4C8A0' },
            { id: "zhou_east", name: "Eastern Zhou", nameCN: "东周", start: -771, end: -221, slot: 0, width: 1, color: '#C4B890' },
            { id: "qin", name: "Qin", nameCN: "秦", start: -221, end: -206, slot: 0, width: 2, color: '#6B7B7B', category: 'empire', rulers: ['Qin Shi Huang'] },
            { id: "han_west", name: "Western Han", nameCN: "西汉", start: -206, end: 9, slot: 0, width: 2, color: '#B89090', category: 'empire', rulers: ['Liu Bang', 'Emperor Wu'] },
            { id: "xin", name: "Xin", nameCN: "新", start: 9, end: 23, slot: 0, width: 2, color: '#9B9B9B' },
            { id: "han_east", name: "Eastern Han", nameCN: "东汉", start: 23, end: 220, slot: 0, width: 2, color: '#C49A9A' },
            { id: "cao_wei", name: "Cao Wei", nameCN: "曹魏", start: 220, end: 266, slot: 0, width: 1, color: '#8B9EC9' },
            { id: "jin_west", name: "Western Jin", nameCN: "西晋", start: 266, end: 316, slot: 0, width: 2, color: '#A890B8' },
            { id: "sixteen_k", name: "16 Kingdoms", nameCN: "十六国", start: 316, end: 439, slot: 0, width: 1, color: '#9B9B9B' },
            { id: "n_wei", name: "Northern Wei", nameCN: "北魏", start: 439, end: 534, slot: 0, width: 1, color: '#8B9BAB' },
            { id: "n_dynasties", name: "Northern Dynasties", nameCN: "北朝", start: 534, end: 581, slot: 0, width: 1, color: '#9BA5B0', category: 'kingdom' },
            { id: "sui", name: "Sui", nameCN: "隋", start: 581, end: 618, slot: 0, width: 2, color: '#C9A090', category: 'empire' },
            { id: "tang", name: "Tang", nameCN: "唐", start: 618, end: 907, slot: 0, width: 2, color: '#D4C896', category: 'empire', rulers: ['Taizong', 'Wu Zetian', 'Xuanzong'] },
            { id: "five_dyn", name: "Five Dynasties", nameCN: "五代", start: 907, end: 960, slot: 0, width: 1, color: '#A0A0A0' },
            { id: "n_song", name: "Northern Song", nameCN: "北宋", start: 960, end: 1127, slot: 0, width: 2, color: '#9BB99B', category: 'empire' },
            { id: "jin_jurchen", name: "Jin (Jurchen)", nameCN: "金", start: 1127, end: 1234, slot: 0, width: 1, color: '#C4B890', category: 'empire' },
            { id: "yuan_early", name: "Yuan", nameCN: "元(北)", start: 1234, end: 1279, slot: 0, width: 1, color: '#8BA4B8', category: 'empire' },
            { id: "yuan", name: "Yuan", nameCN: "元", start: 1279, end: 1368, slot: 0, width: 2, color: '#8BA4B8', category: 'empire', rulers: ['Kublai Khan'] },
            { id: "ming", name: "Ming", nameCN: "明", start: 1368, end: 1644, slot: 0, width: 2, color: '#B89090', category: 'empire', rulers: ['Hongwu', 'Yongle'] },
            { id: "qing", name: "Qing", nameCN: "清", start: 1644, end: 1912, slot: 0, width: 3, color: '#D4C896', category: 'empire', rulers: ['Kangxi', 'Qianlong'] },
            { id: "roc", name: "ROC", nameCN: "中华民国", start: 1912, end: 1949, slot: 0, width: 2, color: '#7B8EB9', category: 'republic' },
            { id: "prc", name: "PRC", nameCN: "中华人民共和国", start: 1949, end: 2000, slot: 0, width: 2, color: '#C49A9A', category: 'republic' },

            // ============ SLOT 1: CHINA SOUTH (Yangtze / Southern regions) ============
            { id: "south_neolithic", name: "Southern Cultures", nameCN: "南方文化", start: -3000, end: -500, slot: 1, width: 1, color: '#A89080' },
            { id: "chu_state", name: "Chu State", nameCN: "楚国", start: -500, end: -223, slot: 1, width: 1, color: '#8BAA8B' },
            { id: "shu_wu", name: "Shu/Wu", nameCN: "蜀/吴", start: 220, end: 280, slot: 1, width: 1, color: '#C9A878' },
            { id: "e_jin", name: "Eastern Jin", nameCN: "东晋", start: 316, end: 420, slot: 1, width: 1, color: '#A890B8' },
            { id: "s_dynasties", name: "Southern Dynasties", nameCN: "南朝", start: 420, end: 589, slot: 1, width: 1, color: '#8BA4B8', category: 'kingdom' },
            { id: "ten_kingdoms", name: "Ten Kingdoms", nameCN: "十国", start: 907, end: 979, slot: 1, width: 1, color: '#B0B0B0' },
            { id: "s_song", name: "Southern Song", nameCN: "南宋", start: 1127, end: 1279, slot: 1, width: 1, color: '#9BB99B' },
                                                            
            // ============ SLOT 2: MONGOLIA / STEPPE ============
            { id: "steppe_bronze", name: "Steppe Bronze Age", nameCN: "草原青铜时代", start: -3000, end: -700, slot: 2, width: 1, color: '#A89080' },
            { id: "steppe_nomads", name: "Early Nomads", nameCN: "早期游牧", start: -700, end: -209, slot: 2, width: 1, color: '#B09888' },
            { id: "xiongnu", name: "Xiongnu", nameCN: "匈奴", start: -209, end: 93, slot: 2, width: 1, color: '#C9B896', category: 'nomadic' },
            { id: "xianbei", name: "Xianbei", nameCN: "鲜卑", start: 93, end: 330, slot: 2, width: 1, color: '#A89080', category: 'nomadic' },
            { id: "rouran", name: "Rouran", nameCN: "柔然", start: 330, end: 555, slot: 2, width: 1, color: '#D4C8A0', category: 'nomadic' },
            { id: "gokturk", name: "Göktürk", nameCN: "突厥", start: 555, end: 744, slot: 2, width: 1, color: '#8B9B7B', category: 'nomadic' },
            { id: "uyghur", name: "Uyghur", nameCN: "回鹘", start: 744, end: 840, slot: 2, width: 1, color: '#9BAA8B', category: 'nomadic' },
            { id: "khitan_early", name: "Khitan", nameCN: "契丹", start: 840, end: 916, slot: 2, width: 1, color: '#A8C0A8' },
            { id: "liao", name: "Liao", nameCN: "辽", start: 916, end: 1125, slot: 2, width: 1, color: '#B09888', category: 'empire' },
            { id: "mongol_tribes", name: "Mongol Tribes", nameCN: "蒙古诸部", start: 1125, end: 1206, slot: 2, width: 1, color: '#9B9B9B' },
            { id: "mongol_emp", name: "Mongol Empire", nameCN: "蒙古帝国", start: 1206, end: 1368, slot: 2, width: 1, color: '#8BA4B8', category: 'empire', rulers: ['Genghis Khan', 'Kublai Khan'] },
            { id: "northern_yuan", name: "Northern Yuan", nameCN: "北元", start: 1368, end: 1635, slot: 2, width: 1, color: '#8BB0B0' },
            { id: "qing_mongolia", name: "Qing Mongolia", nameCN: "清属蒙古", start: 1635, end: 1644, slot: 2, width: 1, color: '#D4C896' },
            { id: "mongolia_mod", name: "Mongolia", nameCN: "蒙古国", start: 1912, end: 2000, slot: 2, width: 1, color: '#C49A9A', category: 'republic' },

            // ============ SLOT 3: KOREA ============
            { id: "korea_prehistoric", name: "Korean Prehistoric", nameCN: "朝鲜史前", start: -3000, end: -2333, slot: 3, width: 1, color: '#A89080' },
            { id: "gojoseon", name: "Gojoseon", nameCN: "古朝鲜", start: -2333, end: -108, slot: 3, width: 1, color: '#8B9EC9', category: 'kingdom' },
            { id: "proto_3k", name: "Proto-Three Kingdoms", nameCN: "原三国", start: -108, end: 57, slot: 3, width: 1, color: '#9BACC9' },
            { id: "three_k_korea", name: "Three Kingdoms", nameCN: "三国时代", start: 57, end: 668, slot: 3, width: 1, color: '#8BB0B0' },
            { id: "unified_silla", name: "Unified Silla", nameCN: "统一新罗", start: 668, end: 935, slot: 3, width: 1, color: '#8BA4B8', category: 'kingdom' },
            { id: "goryeo", name: "Goryeo", nameCN: "高丽", start: 918, end: 1392, slot: 3, width: 1, color: '#8BC0C0', category: 'kingdom' },
            { id: "joseon", name: "Joseon", nameCN: "朝鲜", start: 1392, end: 1897, slot: 3, width: 1, color: '#8BB8B8', category: 'kingdom', rulers: ['Sejong the Great'] },
            { id: "korean_emp", name: "Korean Empire", nameCN: "大韩帝国", start: 1897, end: 1910, slot: 3, width: 1, color: '#7BA8A8', category: 'empire' },
            { id: "jp_korea", name: "Japanese Korea", nameCN: "日治朝鲜", start: 1910, end: 1945, slot: 3, width: 1, color: '#C49A9A' },
            { id: "south_korea", name: "South Korea", nameCN: "韩国", start: 1948, end: 2000, slot: 3, width: 0.5, color: '#7B9EC9' },
            { id: "north_korea", name: "North Korea", nameCN: "朝鲜", start: 1948, end: 2000, slot: 3.5, width: 0.5, color: '#9B7B7B' },

            // ============ SLOT 4: JAPAN ============
            { id: "jomon", name: "Jōmon", nameCN: "绳文", start: -3000, end: -300, slot: 4, width: 1, color: '#A89080' },
            { id: "yayoi", name: "Yayoi", nameCN: "弥生", start: -300, end: 300, slot: 4, width: 1, color: '#A8C0A8' },
            { id: "kofun", name: "Kofun", nameCN: "古坟", start: 300, end: 538, slot: 4, width: 1, color: '#9BAA8B' },
            { id: "asuka", name: "Asuka", nameCN: "飞鸟", start: 538, end: 710, slot: 4, width: 1, color: '#8B9B7B' },
            { id: "nara", name: "Nara", nameCN: "奈良", start: 710, end: 794, slot: 4, width: 1, color: '#B8D0B8' },
            { id: "heian", name: "Heian", nameCN: "平安", start: 794, end: 1185, slot: 4, width: 1, color: '#B0D0B0', category: 'kingdom' },
            { id: "kamakura", name: "Kamakura", nameCN: "镰仓", start: 1185, end: 1333, slot: 4, width: 1, color: '#9BB99B' },
            { id: "muromachi", name: "Muromachi", nameCN: "室町", start: 1333, end: 1573, slot: 4, width: 1, color: '#8BAA8B' },
            { id: "azuchi", name: "Azuchi-Momoyama", nameCN: "安土桃山", start: 1573, end: 1603, slot: 4, width: 1, color: '#8BA88B' },
            { id: "edo", name: "Edo", nameCN: "江户", start: 1603, end: 1868, slot: 4, width: 1, color: '#7B9B7B', category: 'kingdom', rulers: ['Tokugawa Ieyasu'] },
            { id: "meiji", name: "Meiji", nameCN: "明治", start: 1868, end: 1912, slot: 4, width: 1, color: '#C49A9A', category: 'empire' },
            { id: "taisho_showa", name: "Taisho/Showa", nameCN: "大正/昭和", start: 1912, end: 1989, slot: 4, width: 1, color: '#B89090', category: 'empire' },
            { id: "heisei", name: "Heisei", nameCN: "平成", start: 1989, end: 2000, slot: 4, width: 1, color: '#C49A9A' },

            // ============ SLOT 5: VIETNAM ============
            { id: "vn_prehistoric", name: "Vietnamese Prehistoric", nameCN: "越南史前", start: -3000, end: -2879, slot: 5, width: 1, color: '#A89080' },
            { id: "van_lang", name: "Văn Lang", nameCN: "文郎", start: -2879, end: -258, slot: 5, width: 1, color: '#D4C896' },
            { id: "au_lac", name: "Âu Lạc", nameCN: "瓯雒", start: -258, end: -179, slot: 5, width: 1, color: '#D4B880' },
            { id: "nanyue", name: "Nanyue", nameCN: "南越", start: -179, end: -111, slot: 5, width: 1, color: '#C9A878' },
            { id: "chinese_vn", name: "Chinese Rule", nameCN: "北属时期", start: -111, end: 938, slot: 5, width: 1, color: '#A0A0A0' },
            { id: "vn_independence", name: "Ngô/Đinh/Lê", nameCN: "吴/丁/前黎", start: 938, end: 1009, slot: 5, width: 1, color: '#C9A090' },
            { id: "ly_dynasty", name: "Lý Dynasty", nameCN: "李朝", start: 1009, end: 1225, slot: 5, width: 1, color: '#C99878', category: 'kingdom' },
            { id: "tran_dynasty", name: "Trần Dynasty", nameCN: "陈朝", start: 1225, end: 1400, slot: 5, width: 1, color: '#C49A9A', category: 'kingdom' },
            { id: "ho_ming", name: "Hồ/Ming Rule", nameCN: "胡朝/明属", start: 1400, end: 1428, slot: 5, width: 1, color: '#A0A0A0' },
            { id: "le_dynasty", name: "Lê Dynasty", nameCN: "后黎朝", start: 1428, end: 1788, slot: 5, width: 1, color: '#B89090', category: 'kingdom' },
            { id: "tay_son", name: "Tây Sơn", nameCN: "西山朝", start: 1788, end: 1802, slot: 5, width: 1, color: '#A08080' },
            { id: "nguyen", name: "Nguyễn", nameCN: "阮朝", start: 1802, end: 1945, slot: 5, width: 1, color: '#C9A090', category: 'kingdom' },
            { id: "vietnam_mod", name: "Vietnam", nameCN: "越南", start: 1945, end: 2000, slot: 5, width: 1, color: '#C49A9A', category: 'republic' }
        ],
        events: [
            { year: -221, event: "Qin Unification", eventCN: "秦统一" },
            { year: 220, event: "Three Kingdoms", eventCN: "三国鼎立" },
            { year: 618, event: "Tang Founded", eventCN: "唐建立" },
            { year: 960, event: "Song Founded", eventCN: "宋建立" },
            { year: 1206, event: "Mongol Empire", eventCN: "蒙古帝国" },
            { year: 1368, event: "Ming Founded", eventCN: "明建立" },
            { year: 1644, event: "Qing Founded", eventCN: "清建立" },
            { year: 1868, event: "Meiji Restoration", eventCN: "明治维新" },
            { year: 1912, event: "ROC Founded", eventCN: "民国成立" },
            { year: 1949, event: "PRC Founded", eventCN: "共和国成立" }
        ]
    },

    europe: {
        name: "Europe",
        nameCN: "欧洲",
        slotEnd: 8,
        // TERRITORY SLOTS: 0=Greece/Balkans, 1=Italy, 2=France, 3=Iberia, 4=Britain, 5=Germany, 6=Poland, 7=Russia
        entities: [
            // ============ PRE-ROMAN ERA (local cultures) ============
            // Greece
            { id: "aegean_early", name: "Aegean Cultures", nameCN: "爱琴海文化", start: -3000, end: -2700, slot: 0, width: 1, color: '#8B4513' },
            { id: "minoan", name: "Minoan", nameCN: "米诺斯", start: -2700, end: -1450, slot: 0, width: 1, color: '#4169E1' },
            { id: "mycenaean", name: "Mycenaean", nameCN: "迈锡尼", start: -1450, end: -1100, slot: 0, width: 1, color: '#6495ED' },
            { id: "greek_dark", name: "Greek Dark Ages", nameCN: "希腊黑暗时代", start: -1100, end: -800, slot: 0, width: 1, color: '#708090' },
            { id: "greek_citystates", name: "Greek City-States", nameCN: "希腊城邦", start: -800, end: -338, slot: 0, width: 1, color: '#4682B4' },
            // Italy pre-Roman
            { id: "italic_early", name: "Italic Cultures", nameCN: "意大利文化", start: -3000, end: -900, slot: 1, width: 1, color: '#8B4513' },
            { id: "etruscan", name: "Etruscan", nameCN: "伊特鲁里亚", start: -900, end: -509, slot: 1, width: 1, color: '#A0522D' },
            // France pre-Roman
            { id: "gallic_early", name: "Gallic Cultures", nameCN: "高卢文化", start: -3000, end: -600, slot: 2, width: 1, color: '#8B4513' },
            { id: "celtic_gaul", name: "Celtic Gaul", nameCN: "凯尔特高卢", start: -600, end: -121, slot: 2, width: 1, color: '#2E8B57' },
            // Iberia pre-Roman
            { id: "iberian_early", name: "Iberian Cultures", nameCN: "伊比利亚文化", start: -3000, end: -600, slot: 3, width: 1, color: '#8B4513' },
            { id: "iberian_celtic", name: "Iberian/Celtic", nameCN: "伊比利亚/凯尔特", start: -600, end: -218, slot: 3, width: 1, color: '#2E8B57' },
            // Britain pre-Roman
            { id: "british_early", name: "British Cultures", nameCN: "不列颠文化", start: -3000, end: -600, slot: 4, width: 1, color: '#8B4513' },
            { id: "celtic_britain", name: "Celtic Britain", nameCN: "凯尔特不列颠", start: -600, end: 43, slot: 4, width: 1, color: '#2E8B57' },
            // Germany pre-Roman
            { id: "germanic_early", name: "Germanic Cultures", nameCN: "日耳曼文化", start: -3000, end: -100, slot: 5, width: 1, color: '#8B4513' },
            { id: "germanic_tribes", name: "Germanic Tribes", nameCN: "日耳曼部落", start: -100, end: 476, slot: 5, width: 1, color: '#708090' },
            // Poland pre-history
            { id: "lusatian", name: "Lusatian Culture", nameCN: "卢萨蒂亚文化", start: -3000, end: -500, slot: 6, width: 1, color: '#8B4513' },
            { id: "slavic_west", name: "West Slavic Tribes", nameCN: "西斯拉夫部落", start: -500, end: 966, slot: 6, width: 1, color: '#708090' },
            // Russia pre-history
            { id: "steppe_early", name: "Steppe Cultures", nameCN: "草原文化", start: -3000, end: -700, slot: 7, width: 1, color: '#8B4513' },
            { id: "scythian", name: "Scythians", nameCN: "斯基泰", start: -700, end: 200, slot: 7, width: 1, color: '#A0522D', category: 'nomadic' },
            { id: "slavic_east", name: "East Slavic Tribes", nameCN: "东斯拉夫部落", start: 200, end: 882, slot: 7, width: 1, color: '#708090' },

            // ============ MACEDONIAN EMPIRE (expands from Greece) ============
            { id: "macedon", name: "Macedon", nameCN: "马其顿", start: -338, end: -146, slot: 0, width: 1, color: '#5F9EA0', rulers: ['Philip II', 'Alexander the Great'] },

            // ============ ROMAN EXPANSION ============
            // Roman Republic - starts in Italy
            { id: "roman_republic_1", name: "Roman Republic", nameCN: "罗马共和", start: -509, end: -264, slot: 1, width: 1, color: '#B22222', category: 'republic' },
            // Roman Republic expands to include Iberia
            { id: "roman_republic_2", name: "Roman Republic", nameCN: "罗马共和", start: -218, end: -121, slot: 1, width: 3, color: '#B22222', category: 'republic' },
            // Roman Republic expands to include Gaul
            { id: "roman_republic_3", name: "Roman Republic", nameCN: "罗马共和", start: -121, end: -27, slot: 0, width: 4, color: '#B22222', category: 'republic' },
            // Roman Empire at peak (Greece, Italy, France, Iberia, Britain)
            { id: "roman_empire", name: "Roman Empire", nameCN: "罗马帝国", start: -27, end: 117, slot: 0, width: 5, color: '#DC143C', category: 'empire', rulers: ['Augustus', 'Trajan'] },
            // Roman Empire holds steady
            { id: "roman_empire_2", name: "Roman Empire", nameCN: "罗马帝国", start: 117, end: 285, slot: 0, width: 5, color: '#DC143C', category: 'empire', rulers: ['Hadrian', 'Marcus Aurelius'] },
            // Roman Empire (Tetrarchy/Late) - starts losing Britain
            { id: "roman_late", name: "Late Roman", nameCN: "晚期罗马", start: 285, end: 395, slot: 0, width: 5, color: '#CD5C5C', category: 'empire' },

            // ============ POST-ROMAN SPLIT ============
            // Western Roman Empire (Italy, France, Iberia, Britain)
            { id: "w_roman", name: "W. Roman Empire", nameCN: "西罗马帝国", start: 395, end: 476, slot: 1, width: 4, color: '#CD5C5C', category: 'empire' },
            // Eastern Roman/Byzantine (Greece/Balkans)
            { id: "byzantine_early", name: "Byzantine", nameCN: "拜占庭", start: 395, end: 1453, slot: 0, width: 1, color: '#800080', category: 'empire', rulers: ['Justinian I', 'Basil II'] },

            // ============ POST-ROMAN KINGDOMS (each territory gets local rulers) ============
            // Italy succession
            { id: "odoacer", name: "Odoacer", nameCN: "奥多亚塞", start: 476, end: 493, slot: 1, width: 1, color: '#696969' },
            { id: "ostrogoth", name: "Ostrogothic", nameCN: "东哥特", start: 493, end: 553, slot: 1, width: 1, color: '#A0522D', rulers: ['Theodoric'] },
            { id: "byzantine_italy", name: "Byzantine Italy", nameCN: "拜占庭意大利", start: 553, end: 751, slot: 1, width: 1, color: '#800080' },
            { id: "lombard", name: "Lombard", nameCN: "伦巴第", start: 751, end: 774, slot: 1, width: 1, color: '#CD853F' },
            // France/Gaul succession
            { id: "frankish_gaul", name: "Frankish Kingdom", nameCN: "法兰克王国", start: 476, end: 800, slot: 2, width: 1, color: '#4169E1', category: 'kingdom', rulers: ['Clovis I'] },
            // Iberia succession
            { id: "visigothic", name: "Visigothic", nameCN: "西哥特", start: 476, end: 711, slot: 3, width: 1, color: '#8B4513', category: 'kingdom' },
            // Britain succession
            { id: "sub_roman", name: "Sub-Roman Britain", nameCN: "后罗马不列颠", start: 410, end: 500, slot: 4, width: 1, color: '#CD5C5C' },
            { id: "anglo_saxon", name: "Anglo-Saxon", nameCN: "盎格鲁-撒克逊", start: 500, end: 1066, slot: 4, width: 1, color: '#B8860B', category: 'kingdom' },

            // ============ CAROLINGIAN EMPIRE (France + Germany + Italy) ============
            { id: "carolingian", name: "Carolingian Empire", nameCN: "加洛林帝国", start: 800, end: 843, slot: 1, width: 2, color: '#4169E1', category: 'empire', rulers: ['Charlemagne'] },
            // Also include Germany in Carolingian
            { id: "carolingian_germany", name: "Carolingian", nameCN: "加洛林", start: 774, end: 843, slot: 5, width: 1, color: '#4169E1' },

            // ============ POST-CAROLINGIAN SPLIT ============
            { id: "w_francia", name: "West Francia", nameCN: "西法兰克", start: 843, end: 987, slot: 2, width: 1, color: '#6495ED' },
            { id: "e_francia", name: "East Francia", nameCN: "东法兰克", start: 843, end: 962, slot: 5, width: 1, color: '#778899' },
            { id: "lotharingia", name: "Middle Francia", nameCN: "中法兰克", start: 843, end: 962, slot: 1, width: 1, color: '#5F9EA0' },

            // ============ UMAYYAD SPAIN ============
            { id: "al_andalus", name: "Al-Andalus", nameCN: "安达卢斯", start: 711, end: 1492, slot: 3, width: 1, color: '#228B22', category: 'caliphate' },

            // ============ HIGH MEDIEVAL KINGDOMS ============
            // France
            { id: "france_cap", name: "France (Capetian)", nameCN: "法国(卡佩)", start: 987, end: 1328, slot: 2, width: 1, color: '#0000CD', category: 'kingdom' },
            { id: "france_val", name: "France (Valois)", nameCN: "法国(瓦卢瓦)", start: 1328, end: 1589, slot: 2, width: 1, color: '#00008B', category: 'kingdom' },
            // Holy Roman Empire (Germany + Italy)
            { id: "hre", name: "Holy Roman Empire", nameCN: "神圣罗马帝国", start: 962, end: 1806, slot: 1, width: 1, color: '#006400', category: 'empire', rulers: ['Otto I', 'Frederick Barbarossa'] },
            { id: "hre_germany", name: "Holy Roman Empire", nameCN: "神圣罗马帝国", start: 962, end: 1806, slot: 5, width: 1, color: '#006400', category: 'empire' },
            // England
            { id: "england_medieval", name: "Medieval England", nameCN: "中世纪英格兰", start: 1066, end: 1485, slot: 4, width: 1, color: '#DAA520', category: 'kingdom', rulers: ['William I', 'Henry II', 'Edward I'] },
            { id: "england_tudor", name: "Tudor England", nameCN: "都铎英格兰", start: 1485, end: 1603, slot: 4, width: 1, color: '#DC143C', category: 'kingdom', rulers: ['Henry VIII', 'Elizabeth I'] },
            // Poland
            { id: "poland_piast", name: "Poland (Piast)", nameCN: "波兰(皮亚斯特)", start: 966, end: 1385, slot: 6, width: 1, color: '#DC143C', category: 'kingdom' },
            // Russia
            { id: "kievan_rus", name: "Kievan Rus", nameCN: "基辅罗斯", start: 882, end: 1240, slot: 7, width: 1, color: '#4682B4', category: 'kingdom', rulers: ['Vladimir I', 'Yaroslav I'] },

            // ============ MONGOL INVASION (Russia + Poland affected) ============
            { id: "mongol_europe", name: "Mongol Rule", nameCN: "蒙古统治", start: 1240, end: 1480, slot: 7, width: 1, color: '#DAA520', category: 'empire' },

            // ============ OTTOMAN EXPANSION (takes Balkans) ============
            { id: "ottoman_balkans", name: "Ottoman Balkans", nameCN: "奥斯曼巴尔干", start: 1453, end: 1821, slot: 0, width: 1, color: '#228B22', category: 'empire' },

            // ============ EARLY MODERN PERIOD ============
            // Spain unified
            { id: "spain", name: "Spain", nameCN: "西班牙", start: 1492, end: 2000, slot: 3, width: 1, color: '#FF4500', category: 'kingdom', rulers: ['Isabella I', 'Charles V', 'Philip II'] },
            // France Bourbon
            { id: "france_bour", name: "France (Bourbon)", nameCN: "法国(波旁)", start: 1589, end: 1792, slot: 2, width: 1, color: '#000080', category: 'kingdom', rulers: ['Louis XIV'] },
            // Stuart Britain
            { id: "england_stuart", name: "Stuart Britain", nameCN: "斯图亚特英国", start: 1603, end: 1714, slot: 4, width: 1, color: '#B22222', category: 'kingdom' },
            // Poland-Lithuania (large commonwealth)
            { id: "poland_jagiellon", name: "Poland-Lithuania", nameCN: "波兰立陶宛", start: 1385, end: 1795, slot: 6, width: 1, color: '#B22222', category: 'kingdom' },
            // Russia rises
            { id: "muscovy", name: "Muscovy", nameCN: "莫斯科大公国", start: 1480, end: 1547, slot: 7, width: 1, color: '#5F9EA0', category: 'kingdom', rulers: ['Ivan III'] },
            { id: "russia_tsardom", name: "Tsardom of Russia", nameCN: "俄罗斯沙皇国", start: 1547, end: 1721, slot: 7, width: 1, color: '#00CED1', category: 'kingdom', rulers: ['Ivan IV', 'Peter I'] },

            // ============ 18TH-19TH CENTURY ============
            // Great Britain
            { id: "great_britain", name: "Great Britain", nameCN: "大不列颠", start: 1714, end: 2000, slot: 4, width: 1, color: '#8B0000', category: 'kingdom', rulers: ['Victoria'] },
            // France Republic/Empire/Republic
            { id: "france_rev", name: "Revolutionary France", nameCN: "法国大革命", start: 1792, end: 1804, slot: 2, width: 1, color: '#191970', category: 'republic' },
            // Napoleon's Empire expands across Europe
            { id: "napoleon", name: "Napoleonic Empire", nameCN: "拿破仑帝国", start: 1804, end: 1815, slot: 1, width: 5, color: '#191970', category: 'empire', rulers: ['Napoleon Bonaparte'] },
            // Post-Napoleon restoration
            { id: "france_post", name: "France", nameCN: "法国", start: 1815, end: 2000, slot: 2, width: 1, color: '#191970', category: 'republic' },
            { id: "italy_states", name: "Italian States", nameCN: "意大利诸邦", start: 1815, end: 1861, slot: 1, width: 1, color: '#FFD700' },
            // Greece independence
            { id: "greece_mod", name: "Greece", nameCN: "希腊", start: 1821, end: 2000, slot: 0, width: 1, color: '#0000CD', category: 'republic' },
            // German Confederation then Empire
            { id: "german_confed", name: "German Confederation", nameCN: "德意志邦联", start: 1815, end: 1871, slot: 5, width: 1, color: '#556B2F' },
            { id: "german_empire", name: "German Empire", nameCN: "德意志帝国", start: 1871, end: 1918, slot: 5, width: 1, color: '#2F4F4F', category: 'empire', rulers: ['Wilhelm I', 'Wilhelm II'] },
            // Italy unifies
            { id: "italy_kingdom", name: "Kingdom of Italy", nameCN: "意大利王国", start: 1861, end: 1946, slot: 1, width: 1, color: '#228B22', category: 'kingdom' },
            // Russian Empire expands
            { id: "russia_empire", name: "Russian Empire", nameCN: "俄罗斯帝国", start: 1721, end: 1917, slot: 7, width: 1, color: '#0000CD', category: 'empire', rulers: ['Catherine II', 'Alexander I', 'Nicholas II'] },
            // Poland partitioned
            { id: "poland_partition", name: "Partitioned Poland", nameCN: "瓜分波兰", start: 1795, end: 1918, slot: 6, width: 1, color: '#696969' },

            // ============ 20TH CENTURY ============
            // WWI aftermath
            { id: "weimar", name: "Weimar Republic", nameCN: "魏玛共和", start: 1918, end: 1933, slot: 5, width: 1, color: '#696969', category: 'republic' },
            { id: "poland_republic", name: "Poland", nameCN: "波兰", start: 1918, end: 1939, slot: 6, width: 1, color: '#DC143C', category: 'republic' },
            { id: "ussr_early", name: "USSR", nameCN: "苏联", start: 1917, end: 1939, slot: 7, width: 1, color: '#B22222', category: 'empire', rulers: ['Lenin', 'Stalin'] },
            // Nazi Germany expands
            { id: "nazi_germany", name: "Nazi Germany", nameCN: "纳粹德国", start: 1933, end: 1945, slot: 5, width: 2, color: '#1a1a1a', category: 'empire' },
            // WWII - Nazi occupation expands further
            { id: "nazi_peak", name: "Nazi Occupied Europe", nameCN: "纳粹占领欧洲", start: 1940, end: 1944, slot: 1, width: 3, color: '#1a1a1a', category: 'empire' },
            // USSR expands west
            { id: "ussr", name: "USSR", nameCN: "苏联", start: 1945, end: 1991, slot: 6, width: 2, color: '#B22222', category: 'empire' },
            // Post-WWII
            { id: "italy_republic", name: "Italy", nameCN: "意大利", start: 1946, end: 2000, slot: 1, width: 1, color: '#006400', category: 'republic' },
            { id: "germany_divided", name: "Divided Germany", nameCN: "分裂德国", start: 1945, end: 1990, slot: 5, width: 1, color: '#4a4a4a' },
            // Post-Cold War
            { id: "germany_unified", name: "Germany", nameCN: "德国", start: 1990, end: 2000, slot: 5, width: 1, color: '#2F4F4F', category: 'republic' },
            { id: "poland_mod", name: "Poland", nameCN: "波兰", start: 1989, end: 2000, slot: 6, width: 1, color: '#DC143C', category: 'republic' },
            { id: "russia_fed", name: "Russia", nameCN: "俄罗斯", start: 1991, end: 2000, slot: 7, width: 1, color: '#0000CD', category: 'republic' }
        ],
        events: [
            { year: -753, event: "Rome Founded", eventCN: "罗马建城" },
            { year: -509, event: "Roman Republic", eventCN: "罗马共和" },
            { year: -27, event: "Roman Empire", eventCN: "罗马帝国" },
            { year: 476, event: "W. Rome Falls", eventCN: "西罗马灭亡" },
            { year: 800, event: "Charlemagne", eventCN: "查理曼" },
            { year: 1066, event: "Norman Conquest", eventCN: "诺曼征服" },
            { year: 1453, event: "Constantinople Falls", eventCN: "君堡陷落" },
            { year: 1789, event: "French Revolution", eventCN: "法国大革命" },
            { year: 1871, event: "German Unification", eventCN: "德国统一" },
            { year: 1914, event: "WWI", eventCN: "一战" },
            { year: 1939, event: "WWII", eventCN: "二战" },
            { year: 1991, event: "USSR Collapse", eventCN: "苏联解体" }
        ]
    },

    middleEast: {
        name: "Middle East",
        nameCN: "中东",
        slotEnd: 6,
        // TERRITORY SLOTS: 0=Mesopotamia/Iraq, 1=Persia/Iran, 2=Anatolia/Turkey, 3=Egypt, 4=Levant, 5=Arabia
        entities: [
            // ========== PRE-IMPERIAL ERA: Local civilizations (-3000 to -550) ==========
            // Mesopotamia local
            { id: "sumer", name: "Sumer", nameCN: "苏美尔", start: -3000, end: -2334, slot: 0, width: 1, color: '#CD853F' },
            // Akkadian Empire - first major expansion (Mesopotamia + parts of surrounding areas)
            { id: "akkad", name: "Akkadian Empire", nameCN: "阿卡德帝国", start: -2334, end: -2154, slot: 0, width: 2, color: '#D2691E', category: 'empire', rulers: ['Sargon of Akkad'] },
            // During Akkadian: Elam remains independent
            { id: "elam_akkad", name: "Elam", nameCN: "埃兰", start: -2334, end: -2154, slot: 1, width: 1, color: '#8B4513' },
            // Post-Akkadian fragmentation
            { id: "gutian", name: "Gutian", nameCN: "古提", start: -2154, end: -2112, slot: 0, width: 1, color: '#696969' },
            { id: "elam_gutian", name: "Elam", nameCN: "埃兰", start: -2154, end: -2004, slot: 1, width: 1, color: '#A0522D' },
            // Ur III - regional power
            { id: "ur_iii", name: "Ur III", nameCN: "乌尔第三", start: -2112, end: -2004, slot: 0, width: 1, color: '#B8860B', category: 'empire' },
            // Fragmented Mesopotamia
            { id: "isin_larsa", name: "Isin-Larsa", nameCN: "伊辛-拉尔萨", start: -2004, end: -1894, slot: 0, width: 1, color: '#DAA520' },
            { id: "elam_old", name: "Old Elam", nameCN: "古埃兰", start: -2004, end: -1500, slot: 1, width: 1, color: '#A0522D' },
            // Old Babylonian Empire - expands into Levant
            { id: "old_babylon", name: "Old Babylon", nameCN: "古巴比伦", start: -1894, end: -1595, slot: 0, width: 2, color: '#8B4513', category: 'empire', rulers: ['Hammurabi'] },
            // Concurrent: Anatolia
            { id: "anatolia_early", name: "Anatolian Cultures", nameCN: "安纳托利亚文化", start: -3000, end: -2000, slot: 2, width: 1, color: '#8B4513' },
            { id: "hattians", name: "Hattians", nameCN: "哈梯", start: -2000, end: -1650, slot: 2, width: 1, color: '#A0522D' },
            // Hittite Empire - major Anatolian power
            { id: "hittite", name: "Hittite Empire", nameCN: "赫梯帝国", start: -1650, end: -1178, slot: 2, width: 2, color: '#CD853F', category: 'empire', rulers: ['Suppiluliuma I'] },
            // Concurrent: Kassites in Mesopotamia
            { id: "kassites", name: "Kassites", nameCN: "喀西特", start: -1595, end: -1155, slot: 0, width: 1, color: '#A0522D' },
            { id: "elam_middle", name: "Middle Elam", nameCN: "中埃兰", start: -1500, end: -1100, slot: 1, width: 1, color: '#CD853F' },
            // Egypt concurrent
            { id: "egypt_early", name: "Egypt (Old-Middle)", nameCN: "埃及(古-中王国)", start: -3000, end: -1550, slot: 3, width: 1, color: '#FFD700', rulers: ['Khufu'] },
            // Egyptian New Kingdom - expands into Levant
            { id: "egypt_new", name: "Egyptian Empire", nameCN: "埃及新王国", start: -1550, end: -1069, slot: 3, width: 2, color: '#FFA500', category: 'empire', rulers: ['Ramesses II', 'Tutankhamun'] },
            // Canaanite/Levant
            { id: "canaanite", name: "Canaanite", nameCN: "迦南", start: -3000, end: -1550, slot: 4, width: 1, color: '#8B4513' },
            // Arabia early
            { id: "arabia_prehistoric", name: "Arabian Cultures", nameCN: "阿拉伯文化", start: -3000, end: -1000, slot: 5, width: 1, color: '#8B4513' },
            // Post-Hittite collapse
            { id: "neo_hittite", name: "Neo-Hittite", nameCN: "新赫梯", start: -1178, end: -700, slot: 2, width: 1, color: '#D2691E' },
            { id: "levant_iron", name: "Iron Age Levant", nameCN: "黎凡特铁器时代", start: -1200, end: -732, slot: 4, width: 1, color: '#A0522D' },
            // Post-Egyptian Empire
            { id: "egypt_3ip", name: "Egypt (Late)", nameCN: "埃及(后期)", start: -1069, end: -525, slot: 3, width: 1, color: '#778899' },
            // Mesopotamian fragmentation
            { id: "babylon_dark", name: "Babylon IV-V", nameCN: "巴比伦4-5", start: -1155, end: -626, slot: 0, width: 1, color: '#696969' },
            { id: "elam_neo", name: "Neo-Elam", nameCN: "新埃兰", start: -1100, end: -550, slot: 1, width: 1, color: '#D2691E' },
            { id: "arabia_ancient", name: "Arabian Kingdoms", nameCN: "阿拉伯诸国", start: -1000, end: -550, slot: 5, width: 1, color: '#A0522D' },
            // Assyrian Empire - spans Mesopotamia + Levant + Egypt
            { id: "assyria", name: "Assyrian Empire", nameCN: "亚述帝国", start: -732, end: -609, slot: 0, width: 1, color: '#2F4F4F', category: 'empire' },
            { id: "assyria_levant", name: "Assyrian Empire", nameCN: "亚述帝国", start: -732, end: -609, slot: 4, width: 1, color: '#2F4F4F', category: 'empire' },
            { id: "lydia", name: "Lydia", nameCN: "吕底亚", start: -700, end: -546, slot: 2, width: 1, color: '#FFD700', rulers: ['Croesus'] },
            // Neo-Babylonian Empire - Mesopotamia + Levant
            { id: "neo_babylon", name: "Neo-Babylonian Empire", nameCN: "新巴比伦帝国", start: -626, end: -539, slot: 0, width: 2, color: '#4A4A4A', category: 'empire', rulers: ['Nebuchadnezzar II'] },
            // Fill Levant for Neo-Babylonian
            { id: "neo_babylon_levant", name: "Neo-Babylonian", nameCN: "新巴比伦", start: -609, end: -539, slot: 4, width: 1, color: '#4A4A4A' },

            // ========== ACHAEMENID PERSIAN EMPIRE (-550 to -330) ==========
            // Persian Empire expands to control ALL territories
            { id: "achaemenid", name: "Achaemenid Persian Empire", nameCN: "阿契美尼德波斯帝国", start: -550, end: -330, slot: 0, width: 6, color: '#FFD700', category: 'empire', rulers: ['Cyrus the Great', 'Darius I', 'Xerxes I'] },

            // ========== HELLENISTIC ERA (-330 to -30) ==========
            // Alexander/Seleucid - spans most territories
            { id: "seleucid", name: "Seleucid Empire", nameCN: "塞琉古帝国", start: -330, end: -140, slot: 0, width: 4, color: '#6495ED', category: 'empire', rulers: ['Seleucus I'] },
            // Ptolemaic Egypt - independent
            { id: "ptolemaic", name: "Ptolemaic Egypt", nameCN: "托勒密埃及", start: -332, end: -30, slot: 3, width: 2, color: '#DAA520', category: 'kingdom', rulers: ['Cleopatra VII'] },
            // Arabia independent
            { id: "nabataean_early", name: "Arabian Kingdoms", nameCN: "阿拉伯诸国", start: -550, end: -100, slot: 5, width: 1, color: '#A0522D' },
            // Parthia rises
            { id: "parthia", name: "Parthian Empire", nameCN: "帕提亚帝国", start: -247, end: 224, slot: 0, width: 2, color: '#B8860B', category: 'empire' },
            // Seleucid shrinks
            { id: "seleucid_late", name: "Seleucid", nameCN: "塞琉古", start: -140, end: -64, slot: 2, width: 2, color: '#6495ED' },

            // ========== ROMAN ERA (-64 to 395) ==========
            // Rome conquers western territories
            { id: "roman_east", name: "Roman Empire (East)", nameCN: "罗马帝国(东)", start: -64, end: 395, slot: 2, width: 3, color: '#DC143C', category: 'empire' },
            // Arabia
            { id: "nabataean", name: "Nabataean", nameCN: "纳巴泰", start: -100, end: 106, slot: 5, width: 1, color: '#CD853F' },
            { id: "arabia_roman", name: "Roman Arabia", nameCN: "罗马阿拉伯", start: 106, end: 395, slot: 5, width: 1, color: '#DC143C' },

            // ========== SASANIAN-BYZANTINE ERA (224-651) ==========
            // Sasanian Empire - Persia + Mesopotamia
            { id: "sasanian", name: "Sasanian Empire", nameCN: "萨珊帝国", start: 224, end: 651, slot: 0, width: 2, color: '#CD853F', category: 'empire', rulers: ['Shapur I', 'Khosrow I'] },
            // Byzantine Empire - Anatolia + Egypt + Levant
            { id: "byzantine", name: "Byzantine Empire", nameCN: "拜占庭帝国", start: 395, end: 641, slot: 2, width: 3, color: '#800080', category: 'empire', rulers: ['Justinian I'] },
            // Arabia pre-Islamic
            { id: "arabia_late", name: "Late Antique Arabia", nameCN: "晚期阿拉伯", start: 395, end: 622, slot: 5, width: 1, color: '#696969' },

            // ========== RASHIDUN CALIPHATE (632-661) ==========
            // Rapid expansion - Arabia starts, then ALL territories
            { id: "rashidun_early", name: "Rashidun Caliphate", nameCN: "正统哈里发", start: 622, end: 636, slot: 5, width: 1, color: '#228B22', category: 'caliphate', rulers: ['Abu Bakr', 'Umar'] },
            { id: "rashidun", name: "Rashidun Caliphate", nameCN: "正统哈里发", start: 636, end: 661, slot: 0, width: 6, color: '#228B22', category: 'caliphate', rulers: ['Umar', 'Uthman', 'Ali'] },
            // Byzantine survives in Anatolia
            { id: "byzantine_anatolia", name: "Byzantine", nameCN: "拜占庭", start: 641, end: 1071, slot: 2, width: 1, color: '#800080', category: 'empire', rulers: ['Basil II'] },

            // ========== UMAYYAD CALIPHATE (661-750) ==========
            { id: "umayyad", name: "Umayyad Caliphate", nameCN: "倭马亚哈里发", start: 661, end: 750, slot: 0, width: 2, color: '#2E8B57', category: 'caliphate', rulers: ['Muawiyah I'] },
            { id: "umayyad_west", name: "Umayyad Caliphate", nameCN: "倭马亚哈里发", start: 661, end: 750, slot: 3, width: 3, color: '#2E8B57', category: 'caliphate' },

            // ========== ABBASID ERA (750-1258) ==========
            // Abbasid Caliphate - central control, then fragmentation
            { id: "abbasid", name: "Abbasid Caliphate", nameCN: "阿拔斯哈里发", start: 750, end: 868, slot: 0, width: 2, color: '#006400', category: 'caliphate', rulers: ['Harun al-Rashid'] },
            { id: "abbasid_west", name: "Abbasid Caliphate", nameCN: "阿拔斯哈里发", start: 750, end: 868, slot: 3, width: 3, color: '#006400', category: 'caliphate' },
            // Fragmentation begins
            { id: "tahirid", name: "Tahirid", nameCN: "塔希尔", start: 821, end: 873, slot: 1, width: 1, color: '#3CB371' },
            { id: "abbasid_core", name: "Abbasid", nameCN: "阿拔斯", start: 868, end: 1258, slot: 0, width: 1, color: '#006400', category: 'caliphate' },
            { id: "tulunid", name: "Tulunid", nameCN: "图伦", start: 868, end: 905, slot: 3, width: 2, color: '#3CB371' },
            { id: "saffarid", name: "Saffarid", nameCN: "萨法尔", start: 873, end: 903, slot: 1, width: 1, color: '#8FBC8F' },
            { id: "arabia_abbasid", name: "Abbasid Arabia", nameCN: "阿拔斯阿拉伯", start: 750, end: 900, slot: 5, width: 1, color: '#006400' },
            { id: "arabia_fragmented", name: "Fragmented Arabia", nameCN: "分裂时期", start: 900, end: 1517, slot: 5, width: 1, color: '#696969' },
            // Persian regional powers
            { id: "samanid", name: "Samanid", nameCN: "萨曼", start: 903, end: 999, slot: 1, width: 1, color: '#4682B4' },
            { id: "abbasid_egypt", name: "Abbasid Egypt", nameCN: "阿拔斯埃及", start: 905, end: 969, slot: 3, width: 2, color: '#006400' },
            // Fatimid Caliphate - Egypt + Levant
            { id: "fatimid", name: "Fatimid Caliphate", nameCN: "法蒂玛哈里发", start: 969, end: 1171, slot: 3, width: 2, color: '#32CD32', category: 'caliphate' },
            { id: "ghaznavid", name: "Ghaznavid", nameCN: "伽色尼", start: 999, end: 1040, slot: 1, width: 1, color: '#5F9EA0' },
            // Seljuk Empire - Persia + Anatolia (after 1071)
            { id: "seljuk_persia", name: "Seljuk Empire", nameCN: "塞尔柱帝国", start: 1040, end: 1194, slot: 1, width: 1, color: '#DC143C', category: 'empire', rulers: ['Alp Arslan', 'Malik Shah'] },
            { id: "seljuk_rum", name: "Seljuk Rum", nameCN: "罗姆苏丹国", start: 1071, end: 1308, slot: 2, width: 1, color: '#DC143C', category: 'kingdom' },
            // Crusader States
            { id: "crusader_states", name: "Crusader States", nameCN: "十字军国家", start: 1099, end: 1291, slot: 4, width: 1, color: '#DC143C' },
            // Ayyubid - Egypt + Levant
            { id: "ayyubid", name: "Ayyubid Sultanate", nameCN: "阿尤布苏丹国", start: 1171, end: 1250, slot: 3, width: 1, color: '#3CB371', category: 'kingdom', rulers: ['Saladin'] },
            { id: "khwarazmian", name: "Khwarazmian", nameCN: "花剌子模", start: 1194, end: 1220, slot: 1, width: 1, color: '#CD853F' },

            // ========== MONGOL ERA (1220-1370) ==========
            // Mongol conquest - spans Persia + Mesopotamia
            { id: "mongol_me", name: "Mongol Empire", nameCN: "蒙古帝国", start: 1220, end: 1256, slot: 0, width: 2, color: '#4682B4', category: 'empire' },
            // Mamluk Sultanate - Egypt + Levant
            { id: "mamluk", name: "Mamluk Sultanate", nameCN: "马穆鲁克苏丹国", start: 1250, end: 1517, slot: 3, width: 2, color: '#8FBC8F', category: 'kingdom' },
            // Ilkhanate - Persia + Mesopotamia + Anatolia
            { id: "ilkhanate", name: "Ilkhanate", nameCN: "伊利汗国", start: 1256, end: 1335, slot: 0, width: 2, color: '#4169E1', category: 'empire' },
            // Post-Ilkhanate fragmentation
            { id: "jalairid", name: "Jalairid", nameCN: "札剌亦儿", start: 1335, end: 1432, slot: 0, width: 1, color: '#5F9EA0' },
            { id: "timurid_persia", name: "Timurid", nameCN: "帖木儿", start: 1335, end: 1501, slot: 1, width: 1, color: '#6495ED', rulers: ['Tamerlane'] },

            // ========== OTTOMAN ERA (1299-1922) ==========
            // Ottoman starts small in Anatolia
            { id: "ottoman_early", name: "Ottoman", nameCN: "奥斯曼", start: 1299, end: 1453, slot: 2, width: 1, color: '#B22222', category: 'empire' },
            { id: "aq_qoyunlu", name: "Aq Qoyunlu", nameCN: "白羊王朝", start: 1432, end: 1508, slot: 0, width: 1, color: '#87CEEB' },
            // Ottoman expands after Constantinople (1453) - Anatolia + Balkans
            { id: "ottoman_mid", name: "Ottoman Empire", nameCN: "奥斯曼帝国", start: 1453, end: 1517, slot: 2, width: 1, color: '#B22222', category: 'empire', rulers: ['Mehmed II'] },
            // Safavid Persia rises
            { id: "safavid", name: "Safavid Empire", nameCN: "萨法维帝国", start: 1501, end: 1736, slot: 1, width: 1, color: '#4169E1', category: 'empire', rulers: ['Shah Abbas I'] },
            // Safavid briefly takes Iraq
            { id: "safavid_iraq", name: "Safavid Iraq", nameCN: "萨法维伊拉克", start: 1508, end: 1534, slot: 0, width: 1, color: '#4169E1' },
            // Ottoman at peak (1517+) - Anatolia + Mesopotamia + Egypt + Levant + Arabia
            { id: "ottoman_peak", name: "Ottoman Empire", nameCN: "奥斯曼帝国", start: 1517, end: 1918, slot: 0, width: 1, color: '#B22222', category: 'empire', rulers: ['Suleiman the Magnificent'] },
            { id: "ottoman_west", name: "Ottoman Empire", nameCN: "奥斯曼帝国", start: 1517, end: 1867, slot: 2, width: 4, color: '#B22222', category: 'empire' },
            // Persia remains independent
            { id: "afsharid", name: "Afsharid", nameCN: "阿夫沙尔", start: 1736, end: 1796, slot: 1, width: 1, color: '#6495ED', rulers: ['Nader Shah'] },
            { id: "qajar", name: "Qajar", nameCN: "卡扎尔", start: 1796, end: 1925, slot: 1, width: 1, color: '#5F9EA0', category: 'dynasty' },
            // Egypt gains autonomy
            { id: "egypt_khedivate", name: "Khedivate Egypt", nameCN: "赫迪夫埃及", start: 1867, end: 1914, slot: 3, width: 1, color: '#8B0000' },
            { id: "ottoman_late", name: "Ottoman", nameCN: "奥斯曼", start: 1867, end: 1918, slot: 2, width: 1, color: '#B22222' },
            { id: "ottoman_levant", name: "Ottoman Levant", nameCN: "奥斯曼黎凡特", start: 1867, end: 1918, slot: 4, width: 2, color: '#B22222' },

            // ========== MODERN ERA (1918-2000) ==========
            // British influence
            { id: "egypt_british", name: "British Egypt", nameCN: "英属埃及", start: 1914, end: 1952, slot: 3, width: 1, color: '#DC143C' },
            { id: "levant_mandate", name: "Mandate Period", nameCN: "托管时期", start: 1918, end: 1948, slot: 4, width: 2, color: '#4169E1' },
            { id: "iraq_british", name: "British Iraq", nameCN: "英属伊拉克", start: 1918, end: 1932, slot: 0, width: 1, color: '#DC143C' },
            // Modern states
            { id: "turkey", name: "Turkey", nameCN: "土耳其", start: 1923, end: 2000, slot: 2, width: 1, color: '#DC143C', category: 'republic' },
            { id: "pahlavi", name: "Pahlavi Iran", nameCN: "巴列维伊朗", start: 1925, end: 1979, slot: 1, width: 1, color: '#00CED1', category: 'kingdom' },
            { id: "iraq_modern", name: "Iraq", nameCN: "伊拉克", start: 1932, end: 2000, slot: 0, width: 1, color: '#006400', category: 'republic' },
            { id: "saudi_arabia", name: "Saudi Arabia", nameCN: "沙特阿拉伯", start: 1932, end: 2000, slot: 5, width: 1, color: '#228B22', category: 'kingdom' },
            { id: "levant_modern", name: "Levant States", nameCN: "黎凡特诸国", start: 1948, end: 2000, slot: 4, width: 1, color: '#228B22' },
            { id: "egypt_modern", name: "Egypt", nameCN: "埃及", start: 1952, end: 2000, slot: 3, width: 1, color: '#C41E3A', category: 'republic' },
            { id: "iran_islamic", name: "Islamic Iran", nameCN: "伊朗伊斯兰共和国", start: 1979, end: 2000, slot: 1, width: 1, color: '#228B22', category: 'republic' }
        ],
        events: [
            { year: -3100, event: "Egypt United", eventCN: "埃及统一" },
            { year: -2334, event: "Akkadian Empire", eventCN: "阿卡德帝国" },
            { year: -550, event: "Achaemenid Persia", eventCN: "阿契美尼德波斯" },
            { year: 632, event: "Islamic Caliphate", eventCN: "伊斯兰哈里发" },
            { year: 750, event: "Abbasid Revolution", eventCN: "阿拔斯革命" },
            { year: 1258, event: "Baghdad Falls", eventCN: "巴格达陷落" },
            { year: 1453, event: "Constantinople Falls", eventCN: "君士坦丁堡陷落" },
            { year: 1948, event: "Israel Founded", eventCN: "以色列建国" }
        ]
    },

    southAsia: {
        name: "South Asia",
        nameCN: "南亚",
        slotEnd: 5,
        // TERRITORY SLOTS: 0=North India (Ganges), 1=South India (Deccan), 2=Bengal, 3=Punjab/NW, 4=Sri Lanka
        entities: [
            // ========== EARLY PERIOD: Local cultures (-3000 to -600) ==========
            { id: "indus_valley", name: "Indus Valley Civilization", nameCN: "印度河文明", start: -3000, end: -1500, slot: 0, width: 2, color: '#8B4513', category: 'kingdom' },
            { id: "south_prehistoric", name: "Southern Cultures", nameCN: "南印度文化", start: -3000, end: -300, slot: 1, width: 1, color: '#8B4513' },
            { id: "bengal_early", name: "Early Bengal", nameCN: "早期孟加拉", start: -3000, end: -600, slot: 2, width: 1, color: '#8B4513' },
            { id: "indus_nw", name: "Indus NW", nameCN: "印度河西北", start: -3000, end: -1500, slot: 3, width: 1, color: '#8B4513' },
            { id: "lanka_prehistoric", name: "Lankan Prehistory", nameCN: "兰卡史前", start: -3000, end: -500, slot: 4, width: 1, color: '#8B4513' },
            // Vedic period - spreads across North
            { id: "vedic", name: "Vedic Period", nameCN: "吠陀时代", start: -1500, end: -600, slot: 0, width: 2, color: '#CD853F' },
            { id: "vedic_nw", name: "Vedic NW", nameCN: "吠陀西北", start: -1500, end: -600, slot: 3, width: 1, color: '#CD853F' },

            // ========== MAHAJANAPADAS & PERSIAN INFLUENCE (-600 to -322) ==========
            { id: "mahajanapadas", name: "Mahajanapadas", nameCN: "十六国", start: -600, end: -322, slot: 0, width: 2, color: '#A0522D' },
            { id: "gandhara", name: "Gandhara", nameCN: "犍陀罗", start: -600, end: -326, slot: 3, width: 1, color: '#A0522D' },
            { id: "bengal_mahaj", name: "Bengal States", nameCN: "孟加拉诸国", start: -600, end: -322, slot: 2, width: 1, color: '#A0522D' },

            // ========== MAURYA EMPIRE (-322 to -185): Major expansion ==========
            // Maurya at peak spans North + Bengal + NW (not quite South or Lanka)
            { id: "maurya", name: "Maurya Empire", nameCN: "孔雀帝国", start: -322, end: -185, slot: 0, width: 3, color: '#FF8C00', category: 'empire', rulers: ['Chandragupta', 'Ashoka'] },
            // Punjab/NW under Maurya
            { id: "maurya_nw", name: "Maurya Empire", nameCN: "孔雀帝国", start: -326, end: -185, slot: 3, width: 1, color: '#FF8C00', category: 'empire' },
            // South remains independent (Sangam)
            { id: "sangam_early", name: "Sangam Kingdoms", nameCN: "桑伽姆诸国", start: -300, end: 300, slot: 1, width: 1, color: '#A0522D' },
            // Lanka - Anuradhapura starts
            { id: "anuradhapura", name: "Anuradhapura", nameCN: "阿努拉德普勒", start: -500, end: 1017, slot: 4, width: 1, color: '#A0522D', category: 'kingdom' },

            // ========== POST-MAURYA FRAGMENTATION (-185 to 320) ==========
            { id: "shunga", name: "Shunga", nameCN: "巽伽", start: -185, end: -73, slot: 0, width: 2, color: '#D2691E' },
            { id: "indo_greek", name: "Indo-Greek", nameCN: "印度-希腊", start: -185, end: -10, slot: 3, width: 1, color: '#6495ED' },
            { id: "kanva", name: "Kanva", nameCN: "甘婆", start: -73, end: -30, slot: 0, width: 1, color: '#DEB887' },
            { id: "bengal_post_maurya", name: "Bengal States", nameCN: "孟加拉诸国", start: -185, end: 320, slot: 2, width: 1, color: '#CD853F' },
            { id: "indo_scythian", name: "Indo-Scythian", nameCN: "印度-塞人", start: -30, end: 30, slot: 0, width: 1, color: '#808080' },
            { id: "indo_parthian", name: "Indo-Parthian", nameCN: "印度-帕提亚", start: -10, end: 75, slot: 3, width: 1, color: '#B8860B' },
            // Kushan Empire - spans NW + North
            { id: "kushan", name: "Kushan Empire", nameCN: "贵霜帝国", start: 30, end: 320, slot: 0, width: 2, color: '#DAA520', category: 'empire', rulers: ['Kanishka'] },
            { id: "kushan_nw", name: "Kushan Empire", nameCN: "贵霜帝国", start: 75, end: 375, slot: 3, width: 1, color: '#DAA520', category: 'empire' },
            // Satavahana in South
            { id: "satavahana", name: "Satavahana", nameCN: "百乘", start: 30, end: 220, slot: 1, width: 1, color: '#B8860B', category: 'empire' },

            // ========== GUPTA EMPIRE (320-550): Golden Age expansion ==========
            // Gupta spans North + Bengal, influences South
            { id: "gupta", name: "Gupta Empire", nameCN: "笈多帝国", start: 320, end: 550, slot: 0, width: 2, color: '#FFD700', category: 'empire', rulers: ['Chandragupta II', 'Samudragupta'] },
            // South under Pallava (independent)
            { id: "pallava_early", name: "Pallava", nameCN: "帕拉瓦", start: 275, end: 550, slot: 1, width: 1, color: '#2E8B57', category: 'kingdom' },
            // NW - Kidarites, then Hephthalites
            { id: "kidarite", name: "Kidarite", nameCN: "寄多罗", start: 375, end: 465, slot: 3, width: 1, color: '#696969' },
            { id: "hephthalite", name: "Hephthalite", nameCN: "嚈哒", start: 465, end: 565, slot: 3, width: 1, color: '#808080' },

            // ========== POST-GUPTA FRAGMENTATION (550-750) ==========
            { id: "late_gupta", name: "Late Guptas", nameCN: "后笈多", start: 550, end: 606, slot: 0, width: 1, color: '#DAA520' },
            { id: "bengal_post_gupta", name: "Bengal States", nameCN: "孟加拉诸国", start: 550, end: 750, slot: 2, width: 1, color: '#DAA520' },
            { id: "pallava", name: "Pallava", nameCN: "帕拉瓦", start: 550, end: 897, slot: 1, width: 1, color: '#2E8B57', category: 'kingdom' },
            { id: "shahi", name: "Shahi Kingdoms", nameCN: "沙希诸国", start: 565, end: 1026, slot: 3, width: 1, color: '#4682B4' },
            // Harsha - brief reunification of North
            { id: "harsha", name: "Harsha's Empire", nameCN: "戒日帝国", start: 606, end: 647, slot: 0, width: 2, color: '#FFA500', category: 'empire', rulers: ['Harsha'] },
            { id: "post_harsha", name: "Post-Harsha States", nameCN: "后戒日诸国", start: 647, end: 750, slot: 0, width: 1, color: '#CD853F' },

            // ========== REGIONAL POWERS ERA (750-1206) ==========
            // Pratiharas in North
            { id: "pratiharas", name: "Pratihara", nameCN: "瞿折罗", start: 750, end: 1036, slot: 0, width: 1, color: '#2E8B57', category: 'empire' },
            // Pala in Bengal - expands
            { id: "pala", name: "Pala Empire", nameCN: "波罗帝国", start: 750, end: 1161, slot: 2, width: 1, color: '#3CB371', category: 'empire' },
            // Chola rises in South - maritime empire
            { id: "chola", name: "Chola Empire", nameCN: "朱罗帝国", start: 897, end: 1279, slot: 1, width: 1, color: '#228B22', category: 'empire', rulers: ['Rajaraja I', 'Rajendra I'] },
            // Chola conquers Lanka temporarily
            { id: "chola_lanka", name: "Chola Lanka", nameCN: "朱罗锡兰", start: 1017, end: 1070, slot: 4, width: 1, color: '#228B22' },
            // Ghaznavid raids from NW
            { id: "ghaznavid", name: "Ghaznavid", nameCN: "伽色尼", start: 1026, end: 1186, slot: 3, width: 1, color: '#5F9EA0', category: 'empire', rulers: ['Mahmud of Ghazni'] },
            { id: "rajputs", name: "Rajput States", nameCN: "拉杰普特诸邦", start: 1036, end: 1206, slot: 0, width: 1, color: '#FF6347' },
            // Lanka recovers
            { id: "polonnaruwa", name: "Polonnaruwa", nameCN: "波隆纳鲁沃", start: 1070, end: 1215, slot: 4, width: 1, color: '#CD853F' },
            { id: "sena", name: "Sena", nameCN: "塞纳", start: 1161, end: 1206, slot: 2, width: 1, color: '#2E8B57' },
            { id: "ghurid", name: "Ghurid", nameCN: "古尔", start: 1186, end: 1206, slot: 3, width: 1, color: '#4169E1' },

            // ========== DELHI SULTANATE (1206-1526): Islamic expansion ==========
            // Delhi Sultanate spans North + Bengal + NW
            { id: "delhi_sultanate", name: "Delhi Sultanate", nameCN: "德里苏丹国", start: 1206, end: 1526, slot: 0, width: 3, color: '#006400', category: 'kingdom' },
            { id: "delhi_nw", name: "Delhi Sultanate", nameCN: "德里苏丹国", start: 1206, end: 1526, slot: 3, width: 1, color: '#006400' },
            // South - Pandya then Vijayanagara
            { id: "pandya", name: "Pandya", nameCN: "潘地亚", start: 1279, end: 1336, slot: 1, width: 1, color: '#006400' },
            { id: "vijayanagara", name: "Vijayanagara Empire", nameCN: "毗奢耶那伽罗帝国", start: 1336, end: 1646, slot: 1, width: 1, color: '#32CD32', category: 'empire', rulers: ['Krishnadevaraya'] },
            // Lanka - fragmented
            { id: "lanka_transitional", name: "Lankan Kingdoms", nameCN: "兰卡诸国", start: 1215, end: 1505, slot: 4, width: 1, color: '#696969' },

            // ========== MUGHAL EMPIRE (1526-1857): Peak expansion ==========
            // Mughal early - North + NW
            { id: "mughal_early", name: "Mughal Empire", nameCN: "莫卧儿帝国", start: 1526, end: 1576, slot: 0, width: 2, color: '#4169E1', category: 'empire', rulers: ['Babur', 'Akbar'] },
            { id: "mughal_nw", name: "Mughal Empire", nameCN: "莫卧儿帝国", start: 1526, end: 1739, slot: 3, width: 1, color: '#4169E1', category: 'empire' },
            // Portuguese in Lanka
            { id: "portuguese_lanka", name: "Portuguese Ceylon", nameCN: "葡属锡兰", start: 1505, end: 1658, slot: 4, width: 1, color: '#FF8C00' },
            // Mughal expands to Bengal
            { id: "mughal_peak", name: "Mughal Empire", nameCN: "莫卧儿帝国", start: 1576, end: 1687, slot: 0, width: 3, color: '#4169E1', category: 'empire', rulers: ['Akbar', 'Shah Jahan'] },
            // Deccan Sultanates
            { id: "deccan_sultanates", name: "Deccan Sultanates", nameCN: "德干苏丹国", start: 1646, end: 1687, slot: 1, width: 1, color: '#556B2F' },
            // Dutch in Lanka
            { id: "dutch_lanka", name: "Dutch Ceylon", nameCN: "荷属锡兰", start: 1658, end: 1796, slot: 4, width: 1, color: '#FF6347' },
            // Mughal at maximum under Aurangzeb - ALL mainland
            { id: "mughal_max", name: "Mughal Empire", nameCN: "莫卧儿帝国", start: 1687, end: 1707, slot: 0, width: 4, color: '#4169E1', category: 'empire', rulers: ['Aurangzeb'] },
            // Mughal decline - Maratha rises
            { id: "mughal_decline", name: "Mughal (Declining)", nameCN: "莫卧儿(衰落)", start: 1707, end: 1757, slot: 0, width: 2, color: '#4169E1' },
            { id: "maratha", name: "Maratha Empire", nameCN: "马拉塔帝国", start: 1707, end: 1818, slot: 1, width: 1, color: '#FF8C00', category: 'empire', rulers: ['Shivaji', 'Peshwas'] },
            // Durrani takes NW
            { id: "durrani", name: "Durrani", nameCN: "杜兰尼", start: 1739, end: 1799, slot: 3, width: 1, color: '#2F4F4F' },
            // British starts in Bengal
            { id: "british_bengal", name: "British Bengal", nameCN: "英属孟加拉", start: 1757, end: 1857, slot: 2, width: 1, color: '#DC143C' },
            // Mughal rump state
            { id: "mughal_rump", name: "Mughal (Nominal)", nameCN: "莫卧儿(名义)", start: 1757, end: 1857, slot: 0, width: 1, color: '#4169E1' },
            // British in Lanka
            { id: "british_lanka", name: "British Ceylon", nameCN: "英属锡兰", start: 1796, end: 1948, slot: 4, width: 1, color: '#DC143C' },
            // Sikh Empire in NW
            { id: "sikh", name: "Sikh Empire", nameCN: "锡克帝国", start: 1799, end: 1849, slot: 3, width: 1, color: '#4682B4', category: 'empire', rulers: ['Ranjit Singh'] },
            // British expands
            { id: "british_south", name: "British India", nameCN: "英属印度", start: 1818, end: 1857, slot: 1, width: 1, color: '#DC143C' },
            { id: "british_nw", name: "British India", nameCN: "英属印度", start: 1849, end: 1857, slot: 3, width: 1, color: '#DC143C' },

            // ========== BRITISH RAJ (1857-1947): Full control ==========
            // British Raj spans ALL mainland territories
            { id: "british_raj", name: "British Raj", nameCN: "英属印度", start: 1857, end: 1947, slot: 0, width: 4, color: '#DC143C', category: 'colonial' },

            // ========== INDEPENDENCE (1947-2000) ==========
            { id: "india", name: "India", nameCN: "印度", start: 1947, end: 2000, slot: 0, width: 2, color: '#FF8C00', category: 'republic' },
            { id: "pakistan", name: "Pakistan", nameCN: "巴基斯坦", start: 1947, end: 2000, slot: 3, width: 1, color: '#228B22', category: 'republic' },
            { id: "east_pakistan", name: "East Pakistan", nameCN: "东巴基斯坦", start: 1947, end: 1971, slot: 2, width: 1, color: '#228B22' },
            { id: "bangladesh", name: "Bangladesh", nameCN: "孟加拉国", start: 1971, end: 2000, slot: 2, width: 1, color: '#006400', category: 'republic' },
            { id: "sri_lanka", name: "Sri Lanka", nameCN: "斯里兰卡", start: 1948, end: 2000, slot: 4, width: 1, color: '#B8860B', category: 'republic' }
        ],
        events: [
            { year: -322, event: "Maurya Founded", eventCN: "孔雀建立" },
            { year: 320, event: "Gupta Founded", eventCN: "笈多建立" },
            { year: 1206, event: "Delhi Sultanate", eventCN: "德里苏丹国" },
            { year: 1526, event: "Mughal Founded", eventCN: "莫卧儿建立" },
            { year: 1857, event: "Sepoy Mutiny", eventCN: "印度民族起义" },
            { year: 1947, event: "Independence", eventCN: "印巴独立" },
            { year: 1971, event: "Bangladesh", eventCN: "孟加拉独立" }
        ]
    },

    centralAsia: {
        name: "Central Asia",
        nameCN: "中亚",
        slotEnd: 5,
        // TERRITORY SLOTS: 0=Transoxiana (Uzbekistan), 1=Turkmenistan, 2=Kazakhstan (Steppe), 3=Tajikistan/Kyrgyzstan, 4=Afghanistan
        entities: [
            // ========== EARLY CULTURES (-3000 to -550) ==========
            { id: "bmac", name: "BMAC Culture", nameCN: "中亚青铜文化", start: -3000, end: -1500, slot: 0, width: 2, color: '#8B4513' },
            { id: "kazakh_bronze", name: "Steppe Cultures", nameCN: "草原文化", start: -3000, end: -900, slot: 2, width: 1, color: '#8B4513' },
            { id: "mountain_bronze", name: "Mountain Cultures", nameCN: "山地文化", start: -3000, end: -550, slot: 3, width: 1, color: '#8B4513' },
            { id: "afghan_prehistoric", name: "Afghan Cultures", nameCN: "阿富汗文化", start: -3000, end: -550, slot: 4, width: 1, color: '#8B4513' },
            { id: "sogdiana_early", name: "Early Sogdiana", nameCN: "早期粟特", start: -1500, end: -550, slot: 0, width: 2, color: '#A0522D' },
            // Scythians/Saka - steppe nomads
            { id: "scythians", name: "Scythians/Saka", nameCN: "斯基泰/塞人", start: -900, end: -200, slot: 2, width: 1, color: '#708090', category: 'nomadic' },

            // ========== ACHAEMENID PERSIAN EMPIRE (-550 to -330) ==========
            // Persia controls southern Central Asia
            { id: "persian_ca", name: "Achaemenid Empire", nameCN: "阿契美尼德帝国", start: -550, end: -330, slot: 0, width: 2, color: '#FFD700', category: 'empire' },
            { id: "persian_ca_south", name: "Achaemenid Empire", nameCN: "阿契美尼德帝国", start: -550, end: -330, slot: 3, width: 2, color: '#FFD700', category: 'empire' },

            // ========== HELLENISTIC ERA (-330 to -130) ==========
            // Greco-Bactrian Kingdom
            { id: "greco_bactria", name: "Greco-Bactria", nameCN: "希腊-巴克特里亚", start: -330, end: -130, slot: 0, width: 2, color: '#6495ED', category: 'kingdom' },
            { id: "greco_bactria_south", name: "Greco-Bactria", nameCN: "希腊-巴克特里亚", start: -330, end: -130, slot: 3, width: 2, color: '#6495ED' },
            { id: "yuezhi", name: "Yuezhi", nameCN: "月氏", start: -200, end: 30, slot: 2, width: 1, color: '#696969' },

            // ========== KUSHAN EMPIRE (-130 to 375) ==========
            // Kushan spans Transoxiana + Turkmenistan + Mountains + Afghanistan
            { id: "kushan_ca", name: "Kushan Empire", nameCN: "贵霜帝国", start: -130, end: 375, slot: 0, width: 2, color: '#DAA520', category: 'empire', rulers: ['Kanishka'] },
            { id: "kushan_ca_south", name: "Kushan Empire", nameCN: "贵霜帝国", start: -130, end: 375, slot: 3, width: 2, color: '#DAA520', category: 'empire' },
            { id: "kangju", name: "Kangju", nameCN: "康居", start: -130, end: 430, slot: 2, width: 1, color: '#B8860B' },

            // ========== HEPHTHALITE ERA (375-565) ==========
            // Hephthalites (White Huns) dominate
            { id: "kidarites", name: "Kidarites", nameCN: "寄多罗", start: 375, end: 465, slot: 0, width: 2, color: '#A0522D' },
            { id: "kidarites_south", name: "Kidarites", nameCN: "寄多罗", start: 375, end: 465, slot: 3, width: 2, color: '#A0522D' },
            { id: "kidarites_steppe", name: "Kidarites", nameCN: "寄多罗", start: 375, end: 465, slot: 2, width: 1, color: '#A0522D' },
            { id: "hephthalite", name: "Hephthalite Empire", nameCN: "嚈哒帝国", start: 465, end: 565, slot: 0, width: 5, color: '#CD853F', category: 'empire' },

            // ========== GÖKTÜRK KHAGANATE (552-744) ==========
            // First Turkic Khaganate - spans entire steppe
            { id: "gokturk", name: "Göktürk Khaganate", nameCN: "突厥汗国", start: 552, end: 744, slot: 0, width: 4, color: '#556B2F', category: 'empire' },
            // Afghanistan under different rulers
            { id: "afghan_turkic", name: "Turkic Afghanistan", nameCN: "突厥阿富汗", start: 565, end: 651, slot: 4, width: 1, color: '#556B2F' },
            { id: "afghan_islamic_early", name: "Islamic Afghanistan", nameCN: "伊斯兰阿富汗", start: 651, end: 821, slot: 4, width: 1, color: '#228B22' },

            // ========== ISLAMIC EXPANSION & FRAGMENTATION (740-1220) ==========
            // Arab conquest
            { id: "umayyad_ca", name: "Umayyad Caliphate", nameCN: "倭马亚哈里发", start: 740, end: 750, slot: 0, width: 2, color: '#2E8B57', category: 'caliphate' },
            { id: "uyghur", name: "Uyghur Khaganate", nameCN: "回鹘汗国", start: 744, end: 840, slot: 2, width: 1, color: '#2E8B57', category: 'empire' },
            // Abbasid then Samanid
            { id: "abbasid_ca", name: "Abbasid Caliphate", nameCN: "阿拔斯哈里发", start: 750, end: 821, slot: 0, width: 2, color: '#006400', category: 'caliphate' },
            // Samanid Empire - spans Transoxiana + Mountains
            { id: "samanid", name: "Samanid Empire", nameCN: "萨曼帝国", start: 821, end: 999, slot: 0, width: 2, color: '#4682B4', category: 'empire' },
            { id: "samanid_south", name: "Samanid Empire", nameCN: "萨曼帝国", start: 821, end: 999, slot: 3, width: 2, color: '#4682B4', category: 'empire' },
            { id: "kimek", name: "Kimek/Kipchak", nameCN: "基马克/钦察", start: 840, end: 1220, slot: 2, width: 1, color: '#3CB371', category: 'nomadic' },
            // Ghaznavid Empire - Afghanistan + part of Transoxiana
            { id: "ghaznavid_ca", name: "Ghaznavid Empire", nameCN: "伽色尼帝国", start: 977, end: 1040, slot: 3, width: 2, color: '#5F9EA0', category: 'empire', rulers: ['Mahmud of Ghazni'] },
            // Qara-Khanid in north
            { id: "qara_khanid", name: "Qara-Khanid", nameCN: "喀喇汗", start: 999, end: 1040, slot: 0, width: 2, color: '#3CB371', category: 'kingdom' },
            // Seljuk takes over
            { id: "seljuk_ca", name: "Seljuk Empire", nameCN: "塞尔柱帝国", start: 1040, end: 1194, slot: 0, width: 2, color: '#DC143C', category: 'empire' },
            { id: "seljuk_ca_south", name: "Seljuk Empire", nameCN: "塞尔柱帝国", start: 1040, end: 1186, slot: 3, width: 2, color: '#DC143C', category: 'empire' },
            // Ghurid in Afghanistan
            { id: "ghurid_ca", name: "Ghurid", nameCN: "古尔", start: 1186, end: 1215, slot: 4, width: 1, color: '#4169E1' },
            // Khwarazmian Empire - spans all southern territories
            { id: "khwarazm", name: "Khwarazmian Empire", nameCN: "花剌子模帝国", start: 1194, end: 1220, slot: 0, width: 2, color: '#CD853F', category: 'empire' },
            { id: "khwarazm_south", name: "Khwarazmian Empire", nameCN: "花剌子模帝国", start: 1194, end: 1220, slot: 3, width: 2, color: '#CD853F', category: 'empire' },

            // ========== MONGOL EMPIRE (1220-1370) ==========
            // Mongol conquest - ALL territories
            { id: "mongol_ca", name: "Mongol Empire", nameCN: "蒙古帝国", start: 1220, end: 1227, slot: 0, width: 5, color: '#4682B4', category: 'empire', rulers: ['Genghis Khan'] },
            // Chagatai Khanate - southern Central Asia
            { id: "chagatai", name: "Chagatai Khanate", nameCN: "察合台汗国", start: 1227, end: 1370, slot: 0, width: 2, color: '#4169E1', category: 'empire' },
            { id: "chagatai_south", name: "Chagatai Khanate", nameCN: "察合台汗国", start: 1227, end: 1370, slot: 3, width: 2, color: '#4169E1', category: 'empire' },
            // Golden Horde - northern steppe
            { id: "golden_horde", name: "Golden Horde", nameCN: "金帐汗国", start: 1227, end: 1465, slot: 2, width: 1, color: '#FFD700', category: 'empire' },

            // ========== TIMURID EMPIRE (1370-1507) ==========
            // Timur conquers - spans Transoxiana + Turkmenistan + Mountains + Afghanistan
            { id: "timurid", name: "Timurid Empire", nameCN: "帖木儿帝国", start: 1370, end: 1507, slot: 0, width: 2, color: '#6495ED', category: 'empire', rulers: ['Tamerlane', 'Ulugh Beg'] },
            { id: "timurid_south", name: "Timurid Empire", nameCN: "帖木儿帝国", start: 1370, end: 1507, slot: 3, width: 2, color: '#6495ED', category: 'empire' },
            // Kazakh Khanate rises
            { id: "kazakh_khanate", name: "Kazakh Khanate", nameCN: "哈萨克汗国", start: 1465, end: 1847, slot: 2, width: 1, color: '#5F9EA0', category: 'kingdom' },

            // ========== KHANATES ERA (1507-1868) ==========
            // Fragmentation into local khanates
            { id: "shaybanid", name: "Shaybanid/Bukhara", nameCN: "昔班尼/布哈拉", start: 1507, end: 1785, slot: 0, width: 1, color: '#00CED1', category: 'kingdom' },
            { id: "khiva", name: "Khiva Khanate", nameCN: "希瓦汗国", start: 1507, end: 1873, slot: 1, width: 1, color: '#48D1CC', category: 'kingdom' },
            { id: "kokand", name: "Kokand Khanate", nameCN: "浩罕汗国", start: 1507, end: 1876, slot: 3, width: 1, color: '#40E0D0', category: 'kingdom' },
            // Mughal then Durrani in Afghanistan
            { id: "mughal_afghan", name: "Mughal Afghanistan", nameCN: "莫卧儿阿富汗", start: 1507, end: 1747, slot: 4, width: 1, color: '#4169E1' },
            { id: "durrani", name: "Durrani Empire", nameCN: "杜兰尼帝国", start: 1747, end: 1826, slot: 4, width: 1, color: '#2F4F4F', category: 'empire', rulers: ['Ahmad Shah Durrani'] },
            // Bukhara continues
            { id: "bukhara", name: "Bukhara Emirate", nameCN: "布哈拉酋长国", start: 1785, end: 1920, slot: 0, width: 1, color: '#20B2AA', category: 'kingdom' },
            // Afghanistan independent
            { id: "afghanistan_early", name: "Afghanistan", nameCN: "阿富汗", start: 1826, end: 1920, slot: 4, width: 1, color: '#000000', category: 'kingdom' },

            // ========== RUSSIAN CONQUEST (1847-1920) ==========
            // Russia expands from north
            { id: "russian_kazakh", name: "Russian Kazakh", nameCN: "俄属哈萨克", start: 1847, end: 1920, slot: 2, width: 1, color: '#DC143C' },
            { id: "russian_khiva", name: "Russian Khiva", nameCN: "俄属希瓦", start: 1873, end: 1920, slot: 1, width: 1, color: '#DC143C' },
            { id: "russian_kokand", name: "Russian Kokand", nameCN: "俄属浩罕", start: 1876, end: 1920, slot: 3, width: 1, color: '#DC143C' },

            // ========== SOVIET ERA (1920-1991) ==========
            // Soviet Union controls ALL Central Asia except Afghanistan
            { id: "soviet_ca", name: "Soviet Central Asia", nameCN: "苏联中亚", start: 1920, end: 1991, slot: 0, width: 4, color: '#B22222', category: 'empire' },
            // Afghanistan remains independent
            { id: "afghanistan", name: "Afghanistan", nameCN: "阿富汗", start: 1920, end: 2000, slot: 4, width: 1, color: '#000000', category: 'kingdom' },

            // ========== INDEPENDENCE (1991-2000) ==========
            { id: "uzbekistan", name: "Uzbekistan", nameCN: "乌兹别克斯坦", start: 1991, end: 2000, slot: 0, width: 1, color: '#0000CD', category: 'republic' },
            { id: "turkmenistan", name: "Turkmenistan", nameCN: "土库曼斯坦", start: 1991, end: 2000, slot: 1, width: 1, color: '#228B22', category: 'republic' },
            { id: "kazakhstan", name: "Kazakhstan", nameCN: "哈萨克斯坦", start: 1991, end: 2000, slot: 2, width: 1, color: '#00BFFF', category: 'republic' },
            { id: "tajik_kyrgyz", name: "Tajikistan/Kyrgyzstan", nameCN: "塔吉克/吉尔吉斯", start: 1991, end: 2000, slot: 3, width: 1, color: '#DC143C', category: 'republic' }
        ],
        events: [
            { year: 552, event: "Göktürk Founded", eventCN: "突厥建立" },
            { year: 744, event: "Uyghur Khaganate", eventCN: "回鹘汗国" },
            { year: 1227, event: "Chagatai Khanate", eventCN: "察合台汗国" },
            { year: 1370, event: "Timurid Founded", eventCN: "帖木儿建立" },
            { year: 1991, event: "Independence", eventCN: "中亚独立" }
        ]
    },

    africa: {
        name: "Africa",
        nameCN: "非洲",
        slotEnd: 6,
        // TERRITORY SLOTS: 0=East Africa (Ethiopia/Horn), 1=Nubia/Sudan, 2=North Africa (Maghreb), 3=West Africa (Sahel), 4=West Africa (Coast), 5=Southern Africa
        entities: [
            // ========== EARLY CULTURES (-3000 to -1000) ==========
            { id: "horn_prehistoric", name: "Horn Cultures", nameCN: "非洲之角文化", start: -3000, end: -1000, slot: 0, width: 1, color: '#8B4513' },
            { id: "nubia_prehistoric", name: "Nubian Cultures", nameCN: "努比亚文化", start: -3000, end: -2500, slot: 1, width: 1, color: '#8B4513' },
            { id: "maghreb_prehistoric", name: "Maghreb Cultures", nameCN: "马格里布文化", start: -3000, end: -1100, slot: 2, width: 1, color: '#8B4513' },
            { id: "sahel_prehistoric", name: "Sahel Cultures", nameCN: "萨赫勒文化", start: -3000, end: 300, slot: 3, width: 1, color: '#8B4513' },
            { id: "coast_prehistoric", name: "Coastal Cultures", nameCN: "沿海文化", start: -3000, end: 500, slot: 4, width: 1, color: '#8B4513' },
            { id: "southern_prehistoric", name: "Southern Cultures", nameCN: "南部非洲文化", start: -3000, end: 200, slot: 5, width: 1, color: '#8B4513' },

            // ========== NILE VALLEY CIVILIZATIONS (-2500 to 350) ==========
            { id: "kerma", name: "Kerma", nameCN: "克尔马", start: -2500, end: -1500, slot: 1, width: 1, color: '#A0522D', category: 'kingdom' },
            // Egyptian New Kingdom expands into Nubia
            { id: "egypt_nubia", name: "Egyptian Nubia", nameCN: "埃及属努比亚", start: -1500, end: -1070, slot: 1, width: 1, color: '#FFD700' },
            // Phoenician colonies
            { id: "phoenician_africa", name: "Phoenician Colonies", nameCN: "腓尼基殖民地", start: -1100, end: -814, slot: 2, width: 1, color: '#800080' },
            { id: "dmt", name: "D'mt", nameCN: "达姆特", start: -1000, end: -400, slot: 0, width: 1, color: '#A0522D' },
            // Kush Kingdom - Nubia
            { id: "kush", name: "Kingdom of Kush", nameCN: "库什王国", start: -1070, end: -300, slot: 1, width: 1, color: '#B8860B', category: 'kingdom' },
            // Carthaginian Empire - North Africa
            { id: "carthage", name: "Carthaginian Empire", nameCN: "迦太基帝国", start: -814, end: -146, slot: 2, width: 1, color: '#9932CC', category: 'empire', rulers: ['Hannibal'] },
            { id: "pre_axum", name: "Pre-Axumite", nameCN: "前阿克苏姆", start: -400, end: 100, slot: 0, width: 1, color: '#CD853F' },
            // Meroë Kingdom
            { id: "meroe", name: "Meroë", nameCN: "麦罗埃", start: -300, end: 350, slot: 1, width: 1, color: '#CD853F', category: 'kingdom' },

            // ========== ROMAN & AXUMITE ERA (-146 to 700) ==========
            // Roman Africa - North Africa
            { id: "roman_africa", name: "Roman Africa", nameCN: "罗马非洲", start: -146, end: 435, slot: 2, width: 1, color: '#DC143C', category: 'empire' },
            // Axum Empire - Ethiopia, expands
            { id: "axum", name: "Axum Empire", nameCN: "阿克苏姆帝国", start: 100, end: 940, slot: 0, width: 2, color: '#D2691E', category: 'empire' },
            { id: "bantu_expansion", name: "Bantu Migration", nameCN: "班图迁徙", start: 200, end: 1000, slot: 5, width: 1, color: '#A0522D' },
            { id: "nok", name: "Nok Culture", nameCN: "诺克文化", start: 300, end: 500, slot: 4, width: 1, color: '#A0522D' },
            // Ghana Empire rises
            { id: "ghana_empire", name: "Ghana Empire", nameCN: "加纳帝国", start: 300, end: 1076, slot: 3, width: 1, color: '#FFD700', category: 'empire' },
            // Christian Nubia
            { id: "nubia_christian", name: "Christian Nubia", nameCN: "基督教努比亚", start: 350, end: 1504, slot: 1, width: 1, color: '#4169E1' },
            // Vandal Kingdom
            { id: "vandals", name: "Vandal Kingdom", nameCN: "汪达尔王国", start: 435, end: 534, slot: 2, width: 1, color: '#708090', category: 'kingdom' },
            { id: "ife", name: "Ife", nameCN: "伊费", start: 500, end: 1400, slot: 4, width: 1, color: '#FFD700', category: 'kingdom' },
            // Byzantine reconquest
            { id: "byzantine_africa", name: "Byzantine Africa", nameCN: "拜占庭非洲", start: 534, end: 698, slot: 2, width: 1, color: '#800080' },

            // ========== ISLAMIC EXPANSION (698-1048) ==========
            // Umayyad conquest - spans North Africa
            { id: "umayyad_africa", name: "Umayyad Caliphate", nameCN: "倭马亚哈里发", start: 698, end: 750, slot: 2, width: 1, color: '#2E8B57', category: 'caliphate' },
            { id: "abbasid_africa", name: "Abbasid", nameCN: "阿拔斯", start: 750, end: 800, slot: 2, width: 1, color: '#006400' },
            { id: "aghlabid", name: "Aghlabid", nameCN: "艾格莱卜", start: 800, end: 909, slot: 2, width: 1, color: '#228B22' },
            { id: "fatimid_africa", name: "Fatimid", nameCN: "法蒂玛", start: 909, end: 1048, slot: 2, width: 1, color: '#32CD32' },
            { id: "zagwe", name: "Zagwe", nameCN: "扎格韦", start: 940, end: 1270, slot: 0, width: 1, color: '#B8860B', category: 'dynasty' },
            { id: "mapungubwe", name: "Mapungubwe", nameCN: "马蓬古布韦", start: 1000, end: 1220, slot: 5, width: 1, color: '#CD853F', category: 'kingdom' },

            // ========== ALMORAVID & ALMOHAD EMPIRES (1048-1269) ==========
            // Almoravid Empire - spans N. Africa + W. Africa Sahel
            { id: "almoravid", name: "Almoravid Empire", nameCN: "穆拉比特帝国", start: 1048, end: 1147, slot: 2, width: 2, color: '#006400', category: 'empire' },
            // Ghana weakened
            { id: "ghana_late", name: "Ghana (Decline)", nameCN: "加纳(衰落)", start: 1076, end: 1200, slot: 3, width: 1, color: '#B8860B' },
            // Almohad Empire - spans N. Africa + Sahel
            { id: "almohad", name: "Almohad Empire", nameCN: "穆瓦希德帝国", start: 1147, end: 1269, slot: 2, width: 2, color: '#2E8B57', category: 'empire' },
            { id: "benin_early", name: "Benin Kingdom", nameCN: "贝宁王国", start: 1180, end: 1440, slot: 4, width: 1, color: '#8B0000', category: 'kingdom' },

            // ========== MALI & SONGHAI EMPIRES (1200-1591) ==========
            // Mali Empire at peak - spans Sahel + Coast
            { id: "mali_empire", name: "Mali Empire", nameCN: "马里帝国", start: 1200, end: 1464, slot: 3, width: 2, color: '#DAA520', category: 'empire', rulers: ['Mansa Musa', 'Sundiata Keita'] },
            { id: "great_zimbabwe", name: "Great Zimbabwe", nameCN: "大津巴布韦", start: 1220, end: 1450, slot: 5, width: 1, color: '#B8860B', category: 'kingdom' },
            // Fragmented Maghreb
            { id: "maghreb_sultanates", name: "Maghreb Sultanates", nameCN: "马格里布苏丹国", start: 1269, end: 1830, slot: 2, width: 1, color: '#228B22' },
            // Ethiopian Solomonic dynasty
            { id: "ethiopia_sol", name: "Ethiopian Empire", nameCN: "埃塞俄比亚帝国", start: 1270, end: 1855, slot: 0, width: 1, color: '#228B22', category: 'empire', rulers: ['Zara Yaqob'] },
            // Oyo rises
            { id: "oyo", name: "Oyo Empire", nameCN: "奥约帝国", start: 1400, end: 1836, slot: 4, width: 1, color: '#B22222', category: 'empire' },
            { id: "mutapa", name: "Mutapa Empire", nameCN: "穆塔帕帝国", start: 1450, end: 1760, slot: 5, width: 1, color: '#DAA520', category: 'empire' },
            // Songhai Empire - expands further
            { id: "songhai", name: "Songhai Empire", nameCN: "桑海帝国", start: 1464, end: 1591, slot: 3, width: 2, color: '#B8860B', category: 'empire', rulers: ['Askia the Great'] },
            // Benin expands
            { id: "benin", name: "Benin Kingdom", nameCN: "贝宁王国", start: 1440, end: 1897, slot: 4, width: 1, color: '#8B0000', category: 'kingdom' },
            // Funj Sultanate
            { id: "funj", name: "Funj Sultanate", nameCN: "丰吉苏丹国", start: 1504, end: 1821, slot: 1, width: 1, color: '#006400' },

            // ========== POST-SONGHAI & EUROPEAN CONTACT (1591-1884) ==========
            { id: "sahel_fragmented", name: "Post-Songhai States", nameCN: "后桑海诸国", start: 1591, end: 1800, slot: 3, width: 1, color: '#696969' },
            // Ashanti rises
            { id: "ashanti", name: "Ashanti Empire", nameCN: "阿散蒂帝国", start: 1670, end: 1902, slot: 4, width: 1, color: '#FFD700', category: 'empire' },
            { id: "southern_fragmented", name: "Southern Kingdoms", nameCN: "南部诸国", start: 1760, end: 1816, slot: 5, width: 1, color: '#696969' },
            // Sokoto Caliphate - major West African power
            { id: "sokoto", name: "Sokoto Caliphate", nameCN: "索科托哈里发国", start: 1800, end: 1903, slot: 3, width: 2, color: '#228B22', category: 'caliphate' },
            // Zulu Kingdom
            { id: "zulu", name: "Zulu Kingdom", nameCN: "祖鲁王国", start: 1816, end: 1897, slot: 5, width: 1, color: '#2F4F4F', category: 'kingdom', rulers: ['Shaka Zulu'] },
            // Egyptian Sudan
            { id: "sudan_egyptian", name: "Egyptian Sudan", nameCN: "埃及属苏丹", start: 1821, end: 1885, slot: 1, width: 1, color: '#FFD700' },
            // French begin in North Africa
            { id: "french_maghreb", name: "French N. Africa", nameCN: "法属北非", start: 1830, end: 1962, slot: 2, width: 1, color: '#0000CD', category: 'colonial' },
            // Ethiopian modernization
            { id: "ethiopia_modern", name: "Ethiopian Empire", nameCN: "埃塞俄比亚帝国", start: 1855, end: 1974, slot: 0, width: 1, color: '#006400', category: 'empire', rulers: ['Menelik II', 'Haile Selassie'] },
            // Mahdist State
            { id: "mahdist", name: "Mahdist State", nameCN: "马赫迪国", start: 1885, end: 1898, slot: 1, width: 1, color: '#228B22' },

            // ========== COLONIAL ERA (1884-1960) ==========
            // Scramble for Africa - European colonization
            { id: "colonial_south", name: "Colonial S. Africa", nameCN: "殖民南部非洲", start: 1897, end: 1961, slot: 5, width: 1, color: '#DC143C', category: 'colonial' },
            { id: "sudan_british", name: "Anglo-Egyptian Sudan", nameCN: "英埃共管苏丹", start: 1898, end: 1956, slot: 1, width: 1, color: '#DC143C', category: 'colonial' },
            { id: "british_west", name: "British W. Africa", nameCN: "英属西非", start: 1902, end: 1960, slot: 4, width: 1, color: '#DC143C', category: 'colonial' },
            { id: "french_west", name: "French W. Africa", nameCN: "法属西非", start: 1903, end: 1960, slot: 3, width: 1, color: '#0000CD', category: 'colonial' },

            // ========== INDEPENDENCE ERA (1956-2000) ==========
            { id: "sudan", name: "Sudan", nameCN: "苏丹", start: 1956, end: 2000, slot: 1, width: 1, color: '#228B22', category: 'republic' },
            { id: "sahel_modern", name: "Sahel States", nameCN: "萨赫勒诸国", start: 1960, end: 2000, slot: 3, width: 1, color: '#228B22', category: 'republic' },
            { id: "west_modern", name: "W. African States", nameCN: "西非诸国", start: 1960, end: 2000, slot: 4, width: 1, color: '#228B22', category: 'republic' },
            { id: "southern_modern", name: "Southern States", nameCN: "南部非洲诸国", start: 1961, end: 2000, slot: 5, width: 1, color: '#228B22', category: 'republic' },
            { id: "maghreb_modern", name: "Maghreb States", nameCN: "马格里布诸国", start: 1962, end: 2000, slot: 2, width: 1, color: '#228B22', category: 'republic' },
            { id: "ethiopia_derg", name: "Ethiopia", nameCN: "埃塞俄比亚", start: 1974, end: 2000, slot: 0, width: 1, color: '#006400', category: 'republic' }
        ],
        events: [
            { year: -814, event: "Carthage Founded", eventCN: "迦太基建立" },
            { year: 340, event: "Axum Christian", eventCN: "阿克苏姆皈依" },
            { year: 1235, event: "Mali Empire", eventCN: "马里帝国" },
            { year: 1324, event: "Mansa Musa Hajj", eventCN: "曼萨穆萨朝圣" },
            { year: 1464, event: "Songhai Empire", eventCN: "桑海帝国" },
            { year: 1884, event: "Berlin Conference", eventCN: "柏林会议" },
            { year: 1960, event: "Year of Africa", eventCN: "非洲年" }
        ]
    },

    americas: {
        name: "Americas",
        nameCN: "美洲",
        slotEnd: 6,
        // TERRITORY SLOTS: 0=Mesoamerica (Mexico), 1=Caribbean/Central Am., 2=Andes (Peru), 3=Brazil, 4=N. America (USA), 5=Canada
        entities: [
            // ========== EARLY CULTURES (-3000 to -1500) ==========
            { id: "meso_prehistoric", name: "Archaic Period", nameCN: "古风时期", start: -3000, end: -1500, slot: 0, width: 1, color: '#8B4513' },
            { id: "carib_prehistoric", name: "Caribbean Cultures", nameCN: "加勒比文化", start: -3000, end: -500, slot: 1, width: 1, color: '#8B4513' },
            { id: "andes_prehistoric", name: "Andean Cultures", nameCN: "安第斯文化", start: -3000, end: -900, slot: 2, width: 1, color: '#8B4513' },
            { id: "brazil_prehistoric", name: "Brazilian Cultures", nameCN: "巴西文化", start: -3000, end: 1500, slot: 3, width: 1, color: '#8B4513' },
            { id: "na_prehistoric", name: "Native Cultures", nameCN: "原住民文化", start: -3000, end: 100, slot: 4, width: 1, color: '#8B4513' },
            { id: "canada_prehistoric", name: "First Nations", nameCN: "第一民族", start: -3000, end: 1534, slot: 5, width: 1, color: '#8B4513' },

            // ========== EARLY CIVILIZATIONS (-1500 to 200) ==========
            // Olmec - mother culture of Mesoamerica
            { id: "olmec", name: "Olmec", nameCN: "奥尔梅克", start: -1500, end: -400, slot: 0, width: 2, color: '#228B22', category: 'kingdom' },
            // Chavín in Andes
            { id: "chavin", name: "Chavín", nameCN: "查文", start: -900, end: -200, slot: 2, width: 1, color: '#A0522D', category: 'kingdom' },
            // Maya Preclassic
            { id: "maya_preclassic", name: "Maya Preclassic", nameCN: "玛雅前古典", start: -500, end: 250, slot: 1, width: 1, color: '#2E8B57' },
            { id: "preclassic", name: "Preclassic Mesoamerica", nameCN: "前古典中美", start: -400, end: 200, slot: 0, width: 1, color: '#2E8B57' },
            { id: "early_intermediate", name: "Early Intermediate", nameCN: "早期中间期", start: -200, end: 600, slot: 2, width: 1, color: '#CD853F' },
            { id: "moundbuilders", name: "Mound Builders", nameCN: "土墩建造者", start: 100, end: 1450, slot: 4, width: 1, color: '#A0522D' },

            // ========== CLASSIC PERIOD (200-900) ==========
            // Teotihuacan - spans Mesoamerica + Maya influence
            { id: "teotihuacan", name: "Teotihuacan", nameCN: "特奥蒂瓦坎", start: 200, end: 650, slot: 0, width: 2, color: '#8B4513', category: 'empire' },
            // Maya Classic
            { id: "maya_classic", name: "Maya Classic", nameCN: "玛雅古典", start: 250, end: 900, slot: 1, width: 1, color: '#006400', category: 'kingdom' },
            // Middle Horizon in Andes (Wari, Tiwanaku)
            { id: "middle_horizon", name: "Middle Horizon", nameCN: "中期视野", start: 600, end: 1000, slot: 2, width: 1, color: '#DAA520' },
            { id: "epiclassic", name: "Epiclassic", nameCN: "末古典", start: 650, end: 900, slot: 0, width: 1, color: '#A0522D' },

            // ========== POSTCLASSIC PERIOD (900-1428) ==========
            // Toltec Empire - influences both Mesoamerica and Maya
            { id: "toltec", name: "Toltec Empire", nameCN: "托尔特克帝国", start: 900, end: 1168, slot: 0, width: 2, color: '#CD853F', category: 'empire' },
            // Maya Postclassic
            { id: "maya_post", name: "Maya Postclassic", nameCN: "玛雅后古典", start: 900, end: 1500, slot: 1, width: 1, color: '#3CB371' },
            // Late Intermediate in Andes
            { id: "late_intermediate", name: "Late Intermediate", nameCN: "晚期中间期", start: 1000, end: 1438, slot: 2, width: 1, color: '#B8860B' },
            { id: "postclassic", name: "Postclassic States", nameCN: "后古典诸国", start: 1168, end: 1428, slot: 0, width: 1, color: '#B8860B' },

            // ========== AZTEC & INCA EMPIRES (1428-1533) ==========
            // Aztec Triple Alliance - dominates Mesoamerica + tributary influence
            { id: "aztec", name: "Aztec Empire", nameCN: "阿兹特克帝国", start: 1428, end: 1521, slot: 0, width: 2, color: '#B22222', category: 'empire', rulers: ['Montezuma II'] },
            // Inca Empire - spans Andes
            { id: "inca", name: "Inca Empire", nameCN: "印加帝国", start: 1438, end: 1533, slot: 2, width: 1, color: '#FFA500', category: 'empire', rulers: ['Pachacuti', 'Atahualpa'] },
            // Native Nations in North America
            { id: "native_nations", name: "Native Nations", nameCN: "原住民诸部", start: 1450, end: 1607, slot: 4, width: 2, color: '#CD853F' },

            // ========== SPANISH COLONIAL ERA (1492-1821) ==========
            // Spanish Caribbean first
            { id: "spanish_carib", name: "Spanish Caribbean", nameCN: "西属加勒比", start: 1492, end: 1521, slot: 1, width: 1, color: '#FF8C00', category: 'colonial' },
            // Spanish Colonial Empire expands - spans Mesoamerica + Caribbean + Andes
            { id: "new_spain", name: "New Spain", nameCN: "新西班牙", start: 1521, end: 1821, slot: 0, width: 2, color: '#FF8C00', category: 'colonial' },
            { id: "viceroyalty_peru", name: "Viceroyalty of Peru", nameCN: "秘鲁总督区", start: 1533, end: 1824, slot: 2, width: 1, color: '#FF6347', category: 'colonial' },
            // Portuguese Brazil
            { id: "brazil_colony", name: "Colonial Brazil", nameCN: "殖民巴西", start: 1500, end: 1822, slot: 3, width: 1, color: '#228B22', category: 'colonial' },
            // New France (Canada)
            { id: "new_france", name: "New France", nameCN: "新法兰西", start: 1534, end: 1763, slot: 5, width: 1, color: '#0000CD', category: 'colonial' },
            // 13 Colonies
            { id: "thirteen_col", name: "13 Colonies", nameCN: "十三殖民地", start: 1607, end: 1776, slot: 4, width: 1, color: '#4169E1', category: 'colonial' },
            // British North America
            { id: "british_na", name: "British N. America", nameCN: "英属北美", start: 1763, end: 1867, slot: 5, width: 1, color: '#DC143C', category: 'colonial' },

            // ========== INDEPENDENCE ERA (1776-1900) ==========
            // United States - expands westward
            { id: "usa_early", name: "United States", nameCN: "美国", start: 1776, end: 1848, slot: 4, width: 1, color: '#191970', category: 'republic', rulers: ['Washington', 'Jefferson'] },
            { id: "colonial_carib", name: "Colonial Caribbean", nameCN: "殖民加勒比", start: 1800, end: 1960, slot: 1, width: 1, color: '#4169E1' },
            // Mexican Independence
            { id: "mexico_early", name: "Mexico", nameCN: "墨西哥", start: 1821, end: 1848, slot: 0, width: 2, color: '#006400', category: 'republic' },
            // Brazilian Empire
            { id: "brazil_empire", name: "Brazilian Empire", nameCN: "巴西帝国", start: 1822, end: 1889, slot: 3, width: 1, color: '#FFD700', category: 'empire' },
            // Andean Republics
            { id: "andean_republics", name: "Andean Republics", nameCN: "安第斯共和国", start: 1824, end: 2000, slot: 2, width: 1, color: '#DC143C', category: 'republic' },
            // USA expands (after Mexican-American War)
            { id: "usa", name: "United States", nameCN: "美国", start: 1848, end: 2000, slot: 4, width: 1, color: '#191970', category: 'republic', rulers: ['Lincoln', 'Roosevelt', 'Kennedy'] },
            { id: "mexico", name: "Mexico", nameCN: "墨西哥", start: 1848, end: 2000, slot: 0, width: 1, color: '#006400', category: 'republic' },
            // Central America independent
            { id: "central_america", name: "Central America", nameCN: "中美洲", start: 1848, end: 2000, slot: 1, width: 1, color: '#3CB371', category: 'republic' },
            // Canada
            { id: "canada", name: "Canada", nameCN: "加拿大", start: 1867, end: 2000, slot: 5, width: 1, color: '#DC143C', category: 'republic' },
            // Brazilian Republic
            { id: "brazil", name: "Brazil", nameCN: "巴西", start: 1889, end: 2000, slot: 3, width: 1, color: '#228B22', category: 'republic' },

            // ========== MODERN ERA (1960-2000) ==========
            { id: "caribbean", name: "Caribbean States", nameCN: "加勒比诸国", start: 1960, end: 2000, slot: 1, width: 1, color: '#00CED1', category: 'republic' }
        ],
        events: [
            { year: -1500, event: "Olmec Rise", eventCN: "奥尔梅克兴起" },
            { year: 250, event: "Maya Classic", eventCN: "玛雅古典期" },
            { year: 1325, event: "Tenochtitlan", eventCN: "特诺奇蒂特兰" },
            { year: 1438, event: "Inca Empire", eventCN: "印加帝国" },
            { year: 1492, event: "Columbus", eventCN: "哥伦布到达" },
            { year: 1521, event: "Aztec Falls", eventCN: "阿兹特克灭亡" },
            { year: 1533, event: "Inca Falls", eventCN: "印加灭亡" },
            { year: 1776, event: "US Independence", eventCN: "美国独立" },
            { year: 1804, event: "Haiti Independence", eventCN: "海地独立" },
            { year: 1821, event: "Mexican Independence", eventCN: "墨西哥独立" }
        ]
    },

    southeastAsia: {
        name: "Southeast Asia",
        nameCN: "东南亚",
        slotEnd: 6,
        // TERRITORY SLOTS: 0=Indonesia (Java/Sumatra), 1=Malaysia/Singapore, 2=Cambodia/Mekong, 3=Thailand, 4=Myanmar, 5=Philippines
        entities: [
            // ========== EARLY CULTURES (-3000 to 100) ==========
            { id: "indonesia_prehistoric", name: "Indonesian Cultures", nameCN: "印尼文化", start: -3000, end: 200, slot: 0, width: 1, color: '#8B4513' },
            { id: "malay_prehistoric", name: "Malay Cultures", nameCN: "马来文化", start: -3000, end: 100, slot: 1, width: 1, color: '#8B4513' },
            { id: "mekong_prehistoric", name: "Mekong Cultures", nameCN: "湄公河文化", start: -3000, end: 100, slot: 2, width: 1, color: '#8B4513' },
            { id: "thai_prehistoric", name: "Thai Cultures", nameCN: "泰文化", start: -3000, end: 600, slot: 3, width: 1, color: '#8B4513' },
            { id: "myanmar_prehistoric", name: "Myanmar Cultures", nameCN: "缅甸文化", start: -3000, end: 200, slot: 4, width: 1, color: '#8B4513' },
            { id: "philippines_prehistoric", name: "Philippine Cultures", nameCN: "菲律宾文化", start: -3000, end: 900, slot: 5, width: 1, color: '#8B4513' },

            // ========== INDIANIZED KINGDOMS (100-669) ==========
            // Funan - spans Cambodia + Malaysia influence
            { id: "funan", name: "Funan", nameCN: "扶南", start: 100, end: 550, slot: 1, width: 2, color: '#4169E1', category: 'kingdom' },
            { id: "tarumanagara", name: "Tarumanagara", nameCN: "多罗摩", start: 200, end: 669, slot: 0, width: 1, color: '#A0522D' },
            { id: "pyu", name: "Pyu City-States", nameCN: "骠国城邦", start: 200, end: 840, slot: 4, width: 1, color: '#708090', category: 'kingdom' },
            // Chenla
            { id: "chenla", name: "Chenla", nameCN: "真腊", start: 550, end: 802, slot: 2, width: 1, color: '#6495ED', category: 'kingdom' },
            { id: "dvaravati", name: "Dvaravati", nameCN: "堕罗钵底", start: 600, end: 1000, slot: 3, width: 1, color: '#FFD700', category: 'kingdom' },

            // ========== SRIVIJAYA MARITIME EMPIRE (669-1025) ==========
            // Srivijaya - spans Indonesia + Malaysia (maritime empire)
            { id: "srivijaya", name: "Srivijaya Empire", nameCN: "室利佛逝帝国", start: 669, end: 1025, slot: 0, width: 2, color: '#FFD700', category: 'empire' },
            // Mataram in Java (concurrent with Srivijaya)
            { id: "mataram_hindu", name: "Mataram", nameCN: "马打兰", start: 750, end: 929, slot: 0, width: 1, color: '#CD853F', category: 'kingdom' },

            // ========== KHMER EMPIRE (802-1431) ==========
            // Khmer at peak - spans Cambodia + Thailand + parts of Vietnam
            { id: "khmer", name: "Khmer Empire", nameCN: "高棉帝国", start: 802, end: 1238, slot: 2, width: 2, color: '#0000CD', category: 'empire', rulers: ['Jayavarman II', 'Suryavarman II', 'Jayavarman VII'] },
            // Pagan in Myanmar
            { id: "pagan", name: "Pagan Kingdom", nameCN: "蒲甘王国", start: 849, end: 1297, slot: 4, width: 1, color: '#A0522D', category: 'kingdom', rulers: ['Anawrahta', 'Kyanzittha'] },
            // Philippines - Barangays
            { id: "barangays", name: "Barangays", nameCN: "巴朗盖", start: 900, end: 1565, slot: 5, width: 1, color: '#4682B4', category: 'confederation' },
            // Kediri/Singhasari in Java
            { id: "kediri", name: "Kediri/Singhasari", nameCN: "谏义里/新柯沙里", start: 929, end: 1293, slot: 0, width: 1, color: '#B8860B' },
            // Khmer influence on Thailand
            { id: "khmer_thai", name: "Khmer Influence", nameCN: "高棉势力", start: 1000, end: 1238, slot: 3, width: 1, color: '#0000CD' },
            // Post-Srivijaya Malay
            { id: "post_srivijaya", name: "Post-Srivijaya States", nameCN: "后室利佛逝诸国", start: 1025, end: 1400, slot: 1, width: 1, color: '#B8860B' },
            // Sukhothai rises
            { id: "sukhothai", name: "Sukhothai", nameCN: "素可泰", start: 1238, end: 1438, slot: 3, width: 1, color: '#DAA520', category: 'kingdom', rulers: ['Ramkhamhaeng'] },
            // Khmer shrinks
            { id: "khmer_late", name: "Khmer (Late)", nameCN: "高棉(后期)", start: 1238, end: 1431, slot: 2, width: 1, color: '#0000CD' },

            // ========== MAJAPAHIT EMPIRE (1293-1527) ==========
            // Majapahit - spans Indonesia + Malaysia (peak of Indonesian empire)
            { id: "majapahit", name: "Majapahit Empire", nameCN: "满者伯夷帝国", start: 1293, end: 1527, slot: 0, width: 2, color: '#FF8C00', category: 'empire', rulers: ['Hayam Wuruk', 'Gajah Mada'] },
            // Fragmented Myanmar
            { id: "fragmented_burma", name: "Fragmented Burma", nameCN: "分裂缅甸", start: 1297, end: 1510, slot: 4, width: 1, color: '#CD853F' },
            // Ayutthaya rises - becomes dominant in mainland
            { id: "ayutthaya", name: "Ayutthaya", nameCN: "阿瑜陀耶", start: 1351, end: 1767, slot: 3, width: 1, color: '#B8860B', category: 'kingdom', rulers: ['Naresuan'] },
            // Malacca Sultanate - major trading power
            { id: "malacca", name: "Malacca Sultanate", nameCN: "马六甲苏丹国", start: 1400, end: 1511, slot: 1, width: 1, color: '#228B22', category: 'kingdom' },
            // Cambodia post-Khmer
            { id: "cambodia_post", name: "Cambodia", nameCN: "柬埔寨", start: 1431, end: 1863, slot: 2, width: 1, color: '#191970', category: 'kingdom' },

            // ========== TOUNGOO & EARLY COLONIAL (1510-1752) ==========
            // Toungoo Empire - expands in Myanmar, briefly into Thailand
            { id: "toungoo", name: "Toungoo Empire", nameCN: "东吁帝国", start: 1510, end: 1599, slot: 4, width: 1, color: '#8B4513', category: 'empire', rulers: ['Bayinnaung'] },
            // Toungoo at peak - spans Myanmar + parts of Thailand
            { id: "toungoo_peak", name: "Toungoo Empire", nameCN: "东吁帝国", start: 1550, end: 1599, slot: 4, width: 2, color: '#8B4513', category: 'empire' },
            // Portuguese Malacca
            { id: "portuguese_malacca", name: "Portuguese Malacca", nameCN: "葡属马六甲", start: 1511, end: 1641, slot: 1, width: 1, color: '#FF8C00', category: 'colonial' },
            // Islamic Sultanates in Indonesia
            { id: "islamic_sultanates", name: "Islamic Sultanates", nameCN: "伊斯兰苏丹国", start: 1527, end: 1619, slot: 0, width: 1, color: '#228B22' },
            // Spanish Philippines
            { id: "spanish_phil", name: "Spanish Philippines", nameCN: "西属菲律宾", start: 1565, end: 1898, slot: 5, width: 1, color: '#FF8C00', category: 'colonial' },
            // Restored Toungoo
            { id: "toungoo_restored", name: "Restored Toungoo", nameCN: "东吁复辟", start: 1599, end: 1752, slot: 4, width: 1, color: '#8B4513', category: 'dynasty' },
            // VOC/Dutch
            { id: "voc_java", name: "VOC/Dutch", nameCN: "荷兰东印度公司", start: 1619, end: 1800, slot: 0, width: 1, color: '#FF6347', category: 'colonial' },
            // Dutch Malacca
            { id: "dutch_malacca", name: "Dutch Malacca", nameCN: "荷属马六甲", start: 1641, end: 1824, slot: 1, width: 1, color: '#FF6347', category: 'colonial' },

            // ========== KONBAUNG & LATE PRE-COLONIAL (1752-1885) ==========
            // Konbaung Dynasty - expands in Myanmar
            { id: "konbaung", name: "Konbaung Dynasty", nameCN: "贡榜王朝", start: 1752, end: 1885, slot: 4, width: 1, color: '#B8860B', category: 'dynasty' },
            // Thonburi-Rattanakosin
            { id: "thonburi", name: "Thonburi", nameCN: "吞武里", start: 1767, end: 1782, slot: 3, width: 1, color: '#8B4513', category: 'kingdom' },
            { id: "rattanakosin", name: "Siam/Thailand", nameCN: "暹罗/泰国", start: 1782, end: 2000, slot: 3, width: 1, color: '#CD853F', category: 'kingdom', rulers: ['Rama I', 'Mongkut', 'Chulalongkorn'] },
            // Dutch East Indies
            { id: "dutch_indies", name: "Dutch East Indies", nameCN: "荷属东印度", start: 1800, end: 1945, slot: 0, width: 2, color: '#DC143C', category: 'colonial' },
            // British Malaya
            { id: "british_malaya", name: "British Malaya", nameCN: "英属马来亚", start: 1824, end: 1957, slot: 1, width: 1, color: '#DC143C', category: 'colonial' },

            // ========== COLONIAL ERA (1863-1954) ==========
            // French Indochina - spans Cambodia + Vietnam
            { id: "french_indochina", name: "French Indochina", nameCN: "法属印度支那", start: 1863, end: 1954, slot: 2, width: 1, color: '#4682B4', category: 'colonial' },
            // British Burma
            { id: "british_burma", name: "British Burma", nameCN: "英属缅甸", start: 1885, end: 1948, slot: 4, width: 1, color: '#DC143C', category: 'colonial' },
            // American Philippines
            { id: "american_phil", name: "American Philippines", nameCN: "美属菲律宾", start: 1898, end: 1946, slot: 5, width: 1, color: '#191970', category: 'colonial' },

            // ========== INDEPENDENCE (1945-2000) ==========
            { id: "indonesia", name: "Indonesia", nameCN: "印度尼西亚", start: 1945, end: 2000, slot: 0, width: 2, color: '#DC143C', category: 'republic' },
            { id: "philippines", name: "Philippines", nameCN: "菲律宾", start: 1946, end: 2000, slot: 5, width: 1, color: '#0000CD', category: 'republic' },
            { id: "myanmar", name: "Myanmar", nameCN: "缅甸", start: 1948, end: 2000, slot: 4, width: 1, color: '#228B22', category: 'republic' },
            { id: "indochina_mod", name: "Indochina States", nameCN: "印度支那诸国", start: 1954, end: 2000, slot: 2, width: 1, color: '#0000CD', category: 'republic' },
            { id: "malaysia", name: "Malaysia", nameCN: "马来西亚", start: 1957, end: 2000, slot: 1, width: 1, color: '#0000CD', category: 'republic' }
        ],
        events: [
            { year: 802, event: "Khmer Empire Founded", eventCN: "高棉帝国建立" },
            { year: 1025, event: "Chola Raids on Srivijaya", eventCN: "朱罗远征室利佛逝" },
            { year: 1238, event: "Sukhothai Founded", eventCN: "素可泰建立" },
            { year: 1293, event: "Majapahit Founded", eventCN: "满者伯夷建立" },
            { year: 1351, event: "Ayutthaya Founded", eventCN: "阿瑜陀耶建立" },
            { year: 1431, event: "Angkor Falls", eventCN: "吴哥陷落" },
            { year: 1511, event: "Portuguese Malacca", eventCN: "葡萄牙占领马六甲" },
            { year: 1767, event: "Ayutthaya Falls", eventCN: "阿瑜陀耶陷落" },
            { year: 1945, event: "Indonesian Independence", eventCN: "印尼独立" }
        ]
    }
};

// ============================================
// DOM & ELEMENTS
// ============================================

const elements = {};
let entityPositions = {}; // Store rendered entity positions for connections

function initElements() {
    elements.yearScale = document.getElementById('yearScale');
    elements.timelineGrid = document.getElementById('timelineGrid');
    elements.eventsOverlay = document.getElementById('eventsOverlay');
    elements.tooltip = document.getElementById('tooltip');
    elements.legend = document.getElementById('legendItems');
    elements.eventPanel = document.getElementById('eventPanel');
    elements.panelContent = document.getElementById('panelContent');
    elements.panelClose = document.getElementById('panelClose');
    elements.langButtons = document.querySelectorAll('.lang-btn');
    elements.eventsCheckbox = document.getElementById('showEvents');
    elements.regionCheckboxes = document.querySelectorAll('.region-toggle input');
    elements.zoomSlider = document.getElementById('zoomSlider');
    elements.zoomIn = document.getElementById('zoomIn');
    elements.zoomOut = document.getElementById('zoomOut');
    elements.zoomReset = document.getElementById('zoomReset');
    elements.zoomValue = document.getElementById('zoomValue');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchClear = document.getElementById('searchClear');
    elements.minimap = document.getElementById('minimap');
    elements.minimapViewport = document.getElementById('minimapViewport');
    elements.connectionsToggle = document.getElementById('showConnections');
    elements.erasToggle = document.getElementById('showEras');
    elements.compareBtn = document.getElementById('compareBtn');
    elements.timelineContainer = document.getElementById('timelineContainer');
    elements.timelineWrapper = document.getElementById('timelineWrapper');
    elements.yearCursor = document.getElementById('yearCursor');
    elements.presetBtns = document.querySelectorAll('.preset-btn');
    elements.eraBtns = document.querySelectorAll('.era-btn');
    elements.legendToggle = document.getElementById('legendToggle');
    elements.legendPanel = document.getElementById('legend');

    // New elements for enhanced features
    elements.connectionsSvg = document.getElementById('connectionsSvg');
    elements.globalEventsTrack = document.getElementById('globalEventsTrack');
    elements.jumpToYear = document.getElementById('jumpToYear');
    elements.jumpBtn = document.getElementById('jumpBtn');
    elements.exportBtn = document.getElementById('exportBtn');
    elements.shareBtn = document.getElementById('shareBtn');
    elements.darkModeBtn = document.getElementById('darkModeBtn');
    elements.comparePanel = document.getElementById('comparePanel');
    elements.compareOptions = document.getElementById('compareOptions');
    elements.compareClose = document.getElementById('compareClose');
    elements.compareApply = document.getElementById('compareApply');
    elements.toast = document.getElementById('toast');
    elements.fullPageBtn = document.getElementById('fullPageBtn');
    elements.exitFullPage = document.getElementById('exitFullPage');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function yearToY(year) {
    return (year - CONFIG.timelineStart) * CONFIG.yearHeight;
}

function formatYear(year) {
    if (year < 0) return `${Math.abs(year)} BC`;
    return `AD ${year}`;
}

function formatYearCN(year) {
    if (year < 0) return `公元前${Math.abs(year)}年`;
    return `公元${year}年`;
}

function getName(item) {
    return CONFIG.language === 'cn' ? (item.nameCN || item.name) : item.name;
}

function getVisibleRegions() {
    return Object.entries(CONFIG.visibleRegions)
        .filter(([_, visible]) => visible)
        .map(([region, _]) => region);
}

// ============================================
// RENDERING
// ============================================

function renderYearScale() {
    elements.yearScale.innerHTML = '';
    const totalHeight = yearToY(CONFIG.timelineEnd);

    // Choose tick step based on zoom level
    let step;
    if (CONFIG.yearHeight < 0.3) step = 500;
    else if (CONFIG.yearHeight < 0.6) step = 250;
    else if (CONFIG.yearHeight < 1.5) step = 100;
    else if (CONFIG.yearHeight < 4) step = 50;
    else if (CONFIG.yearHeight < 8) step = 25;
    else step = 10;

    // Snap start to a multiple of step
    const startYear = Math.ceil(CONFIG.timelineStart / step) * step;

    for (let year = startYear; year <= CONFIG.timelineEnd; year += step) {
        const mark = document.createElement('div');
        const isMillennium = year % 1000 === 0;
        const isCentury = year % 100 === 0;
        let cls = 'year-mark';
        if (isMillennium) cls += ' millennium';
        else if (isCentury) cls += ' century';
        mark.className = cls;
        mark.style.top = `${yearToY(year) + 35}px`;
        mark.textContent = formatYear(year);
        elements.yearScale.appendChild(mark);
    }

    elements.yearScale.style.height = `${totalHeight + 35}px`;
}

/**
 * Detect and fix obvious data conflicts where two entities sharing the SAME
 * slot footprint also overlap in time (e.g. Babylon IV-V is "still going" while
 * the Assyrian Empire occupies the same Mesopotamian slot). The earlier-starting
 * entity is trimmed to end when the later one begins.
 *
 * Multi-slot empires that overlap with single-slot kingdoms (Napoleon vs Spain)
 * are handled separately by render-order layering rather than by trimming, since
 * those usually represent legitimate brief occupations.
 */
function normalizeOverlaps() {
    let trims = 0;
    Object.values(WORLD_HISTORY).forEach(region => {
        const entities = region.entities;
        for (const a of entities) {
            // Find the earliest later-starting entity that shares a's exact slot
            // footprint. Trim a's end so the two don't visually overlap.
            // (We accept that this loses any "a continued after b ended" history;
            // the slot grid only allows one polity per slot at a time.)
            let earliest = Infinity;
            for (const b of entities) {
                if (b === a) continue;
                if (b.start <= a.start) continue;
                if (b.start >= a.end) continue;
                if (b.slot !== a.slot || b.width !== a.width) continue;
                if (b.start < earliest) earliest = b.start;
            }
            if (earliest < a.end) {
                a.end = earliest;
                trims++;
            }
        }
    });
    return trims;
}

function renderTimeline() {
    elements.timelineGrid.innerHTML = '';
    entityPositions = {}; // Reset positions
    const totalHeight = yearToY(CONFIG.timelineEnd);

    const visibleRegions = getVisibleRegions();
    let currentSlotOffset = 0;

    let totalSlots = 0;
    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (region) totalSlots += region.slotEnd + 1;
    });

    elements.timelineGrid.style.height = `${totalHeight + 50}px`;
    elements.timelineGrid.style.width = `${(totalSlots + 1) * CONFIG.baseColumnWidth + 40}px`;

    // Era backgrounds
    if (CONFIG.showEraBackgrounds) {
        renderEraBackgrounds(totalSlots);
    }

    const query = CONFIG.searchQuery ? CONFIG.searchQuery.toLowerCase() : '';
    let matchCount = 0;
    let visibleCount = 0;

    document.body.classList.toggle('search-active', !!query);

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (!region) return;

        renderRegionHeader(region, regionId, currentSlotOffset);

        // Render order: smallest territorial footprints first (bottom layer),
        // larger empires drawn on top. This way a multi-slot empire visually
        // overlays the single-slot kingdoms it temporarily occupies.
        const orderedEntities = region.entities
            .map((e, originalIdx) => ({ e, originalIdx }))
            .sort((x, y) => {
                if (x.e.width !== y.e.width) return x.e.width - y.e.width;
                if (x.e.start !== y.e.start) return x.e.start - y.e.start;
                return x.originalIdx - y.originalIdx;
            });

        orderedEntities.forEach(({ e: entity, originalIdx: idx }) => {
            // Category filter
            if (CONFIG.categoryFilter && entity.category !== CONFIG.categoryFilter) return;

            // Search match
            let isMatch = true;
            if (query) {
                const matchesName = entity.name.toLowerCase().includes(query);
                const matchesNameCN = (entity.nameCN || '').toLowerCase().includes(query);
                const matchesRulers = entity.rulers && entity.rulers.some(r => r.toLowerCase().includes(query));
                isMatch = matchesName || matchesNameCN || matchesRulers;
            }
            if (query && !isMatch) {
                // render dimmed anyway so user sees context
                renderEntity(entity, regionId, currentSlotOffset, { dim: true, animIndex: idx });
                visibleCount++;
                return;
            }
            renderEntity(entity, regionId, currentSlotOffset, { match: query && isMatch, animIndex: idx });
            if (query && isMatch) matchCount++;
            visibleCount++;
        });
        // End orderedEntities iteration

        // Mark moments when a polity gains/loses territory horizontally
        if (!CONFIG.categoryFilter && !query) {
            renderTerritorialTransitions(region, currentSlotOffset);
        }

        currentSlotOffset += region.slotEnd + 1;
    });

    // Render event medallions (numbered circles pinned to region events + historical events)
    if (CONFIG.showEvents) {
        renderEventMedallions();
    }

    // Render connections after all entities
    if (CONFIG.showConnections) {
        renderConnections();
    }

    // Stats
    updateStatsChip(visibleCount, matchCount);
}

function renderEraBackgrounds(totalSlots) {
    const gridWidth = (totalSlots + 1) * CONFIG.baseColumnWidth + 40;

    HISTORICAL_ERAS.forEach((era, idx) => {
        const top = yearToY(era.start) + 35;
        const height = yearToY(era.end) - yearToY(era.start);

        const eraDiv = document.createElement('div');
        eraDiv.className = 'era-background';
        const alternateTint = idx % 2 === 0 ? 'rgba(124, 95, 19, 0.04)' : 'rgba(43, 70, 119, 0.035)';
        eraDiv.style.cssText = `
            position: absolute;
            top: ${top}px;
            left: 0;
            width: ${gridWidth}px;
            height: ${height}px;
            background: ${alternateTint};
            pointer-events: none;
            z-index: 0;
        `;

        // Era boundary line (at the start)
        if (era.start > CONFIG.timelineStart) {
            const tick = document.createElement('div');
            tick.className = 'era-tick';
            tick.style.top = `${yearToY(era.start) + 35}px`;
            elements.timelineGrid.appendChild(tick);
        }

        // Era label — vertical on left side
        const label = document.createElement('div');
        label.className = 'era-label';
        label.style.cssText = `
            position: absolute;
            left: 6px;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            transform-origin: left center;
            font-size: 10px;
            pointer-events: none;
        `;
        label.textContent = CONFIG.language === 'cn' ? era.nameCN : era.name;
        eraDiv.appendChild(label);

        elements.timelineGrid.appendChild(eraDiv);
    });
}

function renderRegionHeader(region, regionId, slotOffset) {
    const regionStyles = {
        eastAsia:       { base: 'var(--r-eastasia)',     ink: 'var(--r-eastasia-ink)',     tint: 'var(--r-eastasia-tint)' },
        europe:         { base: 'var(--r-europe)',       ink: 'var(--r-europe-ink)',       tint: 'var(--r-europe-tint)' },
        middleEast:     { base: 'var(--r-middleeast)',   ink: 'var(--r-middleeast-ink)',   tint: 'var(--r-middleeast-tint)' },
        southAsia:      { base: 'var(--r-southasia)',    ink: 'var(--r-southasia-ink)',    tint: 'var(--r-southasia-tint)' },
        centralAsia:    { base: 'var(--r-centralasia)',  ink: 'var(--r-centralasia-ink)',  tint: 'var(--r-centralasia-tint)' },
        africa:         { base: 'var(--r-africa)',       ink: 'var(--r-africa-ink)',       tint: 'var(--r-africa-tint)' },
        americas:       { base: 'var(--r-americas)',     ink: 'var(--r-americas-ink)',     tint: 'var(--r-americas-tint)' },
        southeastAsia:  { base: 'var(--r-seasia)',       ink: 'var(--r-seasia-ink)',       tint: 'var(--r-seasia-tint)' }
    };
    const style = regionStyles[regionId] || regionStyles.europe;

    const totalHeight = yearToY(CONFIG.timelineEnd);

    // Vertical separator for adjacent regions
    if (slotOffset > 0) {
        const separator = document.createElement('div');
        separator.className = 'region-separator';
        separator.style.cssText = `
            position: absolute;
            top: 35px;
            left: ${slotOffset * CONFIG.baseColumnWidth - 1}px;
            width: 1px;
            height: ${totalHeight}px;
            pointer-events: none;
        `;
        elements.timelineGrid.appendChild(separator);
    }

    const header = document.createElement('div');
    header.className = 'region-header';
    header.setAttribute('data-region', regionId);
    header.style.cssText = `
        position: absolute;
        top: 0;
        left: ${slotOffset * CONFIG.baseColumnWidth}px;
        width: ${region.slotEnd * CONFIG.baseColumnWidth}px;
        height: 34px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 14px;
        z-index: 15;
    `;
    // Dual-language subtitle via data attribute
    header.textContent = CONFIG.language === 'cn' ? (region.nameCN || region.name) : region.name;
    header.setAttribute('data-subtitle', CONFIG.language === 'cn' ? region.name : (region.nameCN || ''));
    elements.timelineGrid.appendChild(header);
}

function renderEntity(entity, regionId, slotOffset, opts = {}) {
    const block = document.createElement('div');
    block.className = 'dynasty-block';
    if (opts.match) block.classList.add('search-match');
    if (opts.dim) block.classList.add('dim');

    const top = yearToY(entity.start) + 35;
    const rawHeight = yearToY(entity.end) - yearToY(entity.start);
    const height = Math.max(rawHeight, 3);

    // Slot grid is linear (anchored). Block visual width is proportional to
    // territorial extent but clamped/compressed for legibility.
    const slotLeft = (slotOffset + entity.slot) * CONFIG.baseColumnWidth;
    const slotSpan = entity.width * CONFIG.baseColumnWidth;
    const visualWidth = computeBlockWidth(entity.width);

    // Center the block within its slot range so wide-but-clamped empires don't
    // visually attach only to one edge.
    const left = slotLeft + (slotSpan - visualWidth) / 2;
    const width = visualWidth;

    entityPositions[entity.id] = {
        top, left, width, height,
        centerX: left + width / 2,
        centerY: top + height / 2
    };

    // Flat fill — pale tint of the entity's base color
    const baseColor = entity.color;
    const fill = paleTint(baseColor);

    // Size class based on block dimensions.
    let sizeClass = '';
    if (height < 14) sizeClass = 'block-tiny';
    else if (height < 26) sizeClass = 'block-small';
    else if (width < 44 && height > 80) sizeClass = 'block-narrow';
    else if (height > 140 && width > 100) sizeClass = 'block-huge';
    else if (height > 80 && width > 80) sizeClass = 'block-large';
    if (sizeClass) block.classList.add(sizeClass);

    block.style.cssText = `
        top: ${top}px;
        left: ${left}px;
        width: ${width}px;
        height: ${height}px;
        background: ${fill};
        --i: ${opts.animIndex || 0};
    `;

    const content = document.createElement('div');
    content.className = 'dynasty-content';

    if (entity.category && ENTITY_CATEGORIES[entity.category]) {
        block.classList.add(`category-${entity.category}`);
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'dynasty-name';
    nameEl.textContent = getName(entity);
    content.appendChild(nameEl);

    // Only show years if block has enough space
    if (height > 50 && width > 52) {
        const yearsEl = document.createElement('div');
        yearsEl.className = 'dynasty-years';
        // Show compact form: just start year on small blocks; range on larger
        if (height > 90 && width > 80) {
            yearsEl.textContent = `${formatYear(entity.start)} – ${formatYear(entity.end)}`;
        } else {
            yearsEl.textContent = formatYear(entity.start);
        }
        content.appendChild(yearsEl);

        // Show top ruler if block is big enough
        if (height > 110 && entity.rulers && entity.rulers.length && width > 80) {
            const rulerEl = document.createElement('div');
            rulerEl.className = 'dynasty-rulers';
            rulerEl.textContent = `† ${entity.rulers[0]}`;
            content.appendChild(rulerEl);
        }
    }

    block.appendChild(content);

    block.dataset.id = entity.id;
    block.dataset.name = entity.name;
    block.dataset.nameCn = entity.nameCN || '';
    block.dataset.start = entity.start;
    block.dataset.end = entity.end;
    block.dataset.region = regionId;
    if (entity.category) block.dataset.category = entity.category;

    block.addEventListener('mouseenter', handleHover);
    block.addEventListener('mouseleave', hideTooltip);
    block.addEventListener('click', () => showDetail(entity));

    elements.timelineGrid.appendChild(block);
}

// Adjust a hex color by a given lightness delta (-50 to +50)
function adjustColor(hex, delta) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = Math.max(0, Math.min(255, parseInt(h.slice(0,2),16) + delta));
    const g = Math.max(0, Math.min(255, parseInt(h.slice(2,4),16) + delta));
    const b = Math.max(0, Math.min(255, parseInt(h.slice(4,6),16) + delta));
    return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
}

// Mix toward white for a clean pale tint suitable for flat backgrounds.
// Returns a CSS color string (rgb).
function paleTint(hex, mix = 0.55) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    const mr = Math.round(r + (255 - r) * mix);
    const mg = Math.round(g + (255 - g) * mix);
    const mb = Math.round(b + (255 - b) * mix);
    return `rgb(${mr}, ${mg}, ${mb})`;
}

// After all entities in a region are rendered, walk through them in chronological
// order (per slot) and detect places where the SAME polity (matching name) gains
// or loses territory (i.e. transitions to a different width). Draw a thin
// horizontal "territorial tick" line at that moment to make the change visible.
function renderTerritorialTransitions(region, slotOffset) {
    if (!region || !region.entities) return;

    // Group entities by name (since IDs vary like roman_republic_1/2/3)
    const groupsByName = {};
    region.entities.forEach(e => {
        const key = e.name;
        if (!groupsByName[key]) groupsByName[key] = [];
        groupsByName[key].push(e);
    });

    Object.values(groupsByName).forEach(group => {
        if (group.length < 2) return;
        // Sort chronologically by start year
        group.sort((a, b) => a.start - b.start);
        for (let i = 1; i < group.length; i++) {
            const prev = group[i - 1];
            const curr = group[i];
            // Only draw if it's a contiguous transition (within 2 years tolerance)
            if (Math.abs(curr.start - prev.end) > 2) continue;
            // Only draw if territory actually changed
            const prevSlot = prev.slot;
            const prevEnd = prev.slot + prev.width;
            const currSlot = curr.slot;
            const currEnd = curr.slot + curr.width;
            if (prevSlot === currSlot && prevEnd === currEnd) continue;

            const yr = curr.start;
            const top = yearToY(yr) + 35;
            // Use the actual rendered positions of prev and curr for the tick
            const prevPos = entityPositions[prev.id];
            const currPos = entityPositions[curr.id];
            if (!prevPos || !currPos) continue;
            const fromX = Math.min(prevPos.left, currPos.left);
            const toX = Math.max(prevPos.left + prevPos.width, currPos.left + currPos.width);
            const tick = document.createElement('div');
            tick.className = 'territorial-tick';
            tick.style.cssText = `
                top: ${top}px;
                left: ${fromX}px;
                width: ${toX - fromX}px;
            `;
            elements.timelineGrid.appendChild(tick);
        }
    });
}

// Render numbered event medallions pinned to HISTORICAL_EVENTS years, placed on the left rail
function renderEventMedallions() {
    // Build a map of year -> events and render them slightly staggered when clustered
    HISTORICAL_EVENTS.forEach((event, idx) => {
        if (event.year < CONFIG.timelineStart || event.year > CONFIG.timelineEnd) return;
        const medallion = document.createElement('div');
        medallion.className = `event-medallion type-${event.type}`;
        medallion.style.top = `${yearToY(event.year) + 35}px`;
        medallion.style.left = `-22px`;
        medallion.textContent = String(idx + 1);
        medallion.title = `${formatYear(event.year)} · ${CONFIG.language === 'cn' ? event.labelCN : event.label}`;
        medallion.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetail(event, idx + 1);
        });
        medallion.addEventListener('mouseenter', (e) => showEventTooltip(e, event, idx + 1));
        medallion.addEventListener('mouseleave', hideTooltip);
        elements.timelineGrid.appendChild(medallion);
    });
}

function showEventTooltip(e, event, number) {
    const tooltip = elements.tooltip;
    tooltip.querySelector('.tooltip-title').textContent = `#${number} · ${CONFIG.language === 'cn' ? event.labelCN : event.label}`;
    tooltip.querySelector('.tooltip-title-cn').textContent = CONFIG.language === 'cn' ? event.label : event.labelCN;
    tooltip.querySelector('.tooltip-dates').textContent = formatYear(event.year);
    tooltip.querySelector('.tooltip-duration').textContent = event.type ? event.type.toUpperCase() : '';
    const meta = tooltip.querySelector('.tooltip-meta');
    meta.textContent = event.desc ? (CONFIG.language === 'cn' ? event.desc.cn : event.desc.en) : '';
    const rect = e.currentTarget.getBoundingClientRect();
    tooltip.style.left = `${Math.min(window.innerWidth - 320, rect.right + 12)}px`;
    tooltip.style.top = `${Math.max(12, rect.top - 12)}px`;
    tooltip.classList.add('visible');
}

function renderEvents() {
    // Region-specific events are now integrated via event medallions rendered
    // directly into the grid by renderEventMedallions(). The legacy events
    // overlay is left empty.
    if (elements.eventsOverlay) elements.eventsOverlay.innerHTML = '';
}

function renderLegend() {
    elements.legend.innerHTML = '';

    const visibleRegions = getVisibleRegions();

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (!region) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'legend-group';

        const title = document.createElement('div');
        title.className = 'legend-group-title';
        title.textContent = getName(region);
        groupDiv.appendChild(title);

        region.entities.slice(0, 6).forEach(entity => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color" style="background: ${entity.color}"></div>
                <span class="legend-label">${getName(entity)}</span>
            `;
            groupDiv.appendChild(item);
        });

        if (region.entities.length > 6) {
            const more = document.createElement('div');
            more.className = 'legend-more';
            more.textContent = `+${region.entities.length - 6} more`;
            more.style.cssText = 'font-size: 0.75rem; color: #888; margin-left: 18px;';
            groupDiv.appendChild(more);
        }

        elements.legend.appendChild(groupDiv);
    });
}

// ============================================
// INTERACTIONS
// ============================================

function handleHover(e) {
    const block = e.currentTarget;
    const tooltip = elements.tooltip;
    const isCn = CONFIG.language === 'cn';

    const start = parseInt(block.dataset.start);
    const end = parseInt(block.dataset.end);
    const dur = end - start;

    tooltip.querySelector('.tooltip-title').textContent = block.dataset.name;
    tooltip.querySelector('.tooltip-title-cn').textContent = block.dataset.nameCn;
    tooltip.querySelector('.tooltip-dates').textContent = `${formatYear(start)} — ${formatYear(end)}`;
    tooltip.querySelector('.tooltip-duration').textContent = `${dur} ${isCn ? '年' : 'years'}`;

    // Meta: region · category · rulers
    const regionId = block.dataset.region;
    const region = WORLD_HISTORY[regionId];
    const regionName = region ? (isCn ? region.nameCN : region.name) : '';
    const category = block.dataset.category;
    const catLabel = category && ENTITY_CATEGORIES[category]
        ? (isCn ? ENTITY_CATEGORIES[category].labelCN : ENTITY_CATEGORIES[category].label)
        : '';
    const entity = findEntityById(block.dataset.id);
    const rulers = entity && entity.rulers && entity.rulers.length ? entity.rulers.slice(0, 2).join(' · ') : '';
    const meta = [regionName, catLabel, rulers].filter(Boolean).join(' · ');
    tooltip.querySelector('.tooltip-meta').textContent = meta + (isCn ? ' · 点击查看详情' : ' · click for details');

    const rect = block.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 320, rect.right + 10);
    const top = Math.max(12, Math.min(window.innerHeight - 180, rect.top));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
}

function hideTooltip() {
    elements.tooltip.classList.remove('visible');
}

// Generate Wikipedia URL for an entity
function getWikiUrl(entity) {
    // English Wikipedia slugs
    const wikiSlugsEN = {
        // Chinese dynasties
        qin: 'Qin_dynasty',
        han_west: 'Western_Han',
        han_east: 'Eastern_Han',
        tang: 'Tang_dynasty',
        n_song: 'Song_dynasty',
        s_song: 'Song_dynasty',
        yuan: 'Yuan_dynasty',
        ming: 'Ming_dynasty',
        qing: 'Qing_dynasty',
        sui: 'Sui_dynasty',
        jin_west: 'Jin_dynasty_(266–420)',
        jin_jurchen: 'Jin_dynasty_(1115–1234)',
        cao_wei: 'Cao_Wei',
        zhou_west: 'Western_Zhou',
        zhou_east: 'Eastern_Zhou',
        xia: 'Xia_dynasty',
        shang: 'Shang_dynasty',
        xin: 'Xin_dynasty',
        five_dyn: 'Five_Dynasties_and_Ten_Kingdoms_period',
        ten_kingdoms: 'Five_Dynasties_and_Ten_Kingdoms_period',
        sixteen_k: 'Sixteen_Kingdoms',
        n_wei: 'Northern_Wei',
        n_dynasties: 'Northern_and_Southern_dynasties',
        s_dynasties: 'Northern_and_Southern_dynasties',
        e_jin: 'Eastern_Jin',
        shu_wu: 'Three_Kingdoms',
        roc: 'Republic_of_China_(1912–1949)',
        prc: "People's_Republic_of_China",
        yuan_early: 'Yuan_dynasty',

        // Mongolia/Steppe
        xiongnu: 'Xiongnu',
        xianbei: 'Xianbei',
        rouran: 'Rouran_Khaganate',
        gokturk: 'First_Turkic_Khaganate',
        uyghur: 'Uyghur_Khaganate',
        liao: 'Liao_dynasty',
        mongol_emp: 'Mongol_Empire',
        mongol_tribes: 'Mongol_Empire',
        northern_yuan: 'Northern_Yuan',

        // Korea
        gojoseon: 'Gojoseon',
        goryeo: 'Goryeo',
        joseon: 'Joseon',
        three_k_korea: 'Three_Kingdoms_of_Korea',
        unified_silla: 'Unified_Silla',
        korean_emp: 'Korean_Empire',
        jp_korea: 'Korea_under_Japanese_rule',
        south_korea: 'South_Korea',
        north_korea: 'North_Korea',

        // Japan
        jomon: 'Jōmon_period',
        yayoi: 'Yayoi_period',
        kofun: 'Kofun_period',
        asuka: 'Asuka_period',
        nara: 'Nara_period',
        heian: 'Heian_period',
        kamakura: 'Kamakura_period',
        muromachi: 'Muromachi_period',
        azuchi: 'Azuchi–Momoyama_period',
        edo: 'Edo_period',
        meiji: 'Meiji_(era)',
        taisho_showa: 'Shōwa_(1926–1989)',
        heisei: 'Heisei',

        // Europe
        roman_republic: 'Roman_Republic',
        roman_empire: 'Roman_Empire',
        byzantine: 'Byzantine_Empire',
        carolingian: 'Carolingian_Empire',
        hre: 'Holy_Roman_Empire',
        ottoman: 'Ottoman_Empire',
        ottoman_peak: 'Ottoman_Empire',
        ottoman_late: 'Ottoman_Empire',
        visigoth: 'Visigothic_Kingdom',
        frankish: 'Frankish_Empire',

        // Middle East
        achaemenid: 'Achaemenid_Empire',
        sassanid: 'Sasanian_Empire',
        rashidun: 'Rashidun_Caliphate',
        umayyad: 'Umayyad_Caliphate',
        abbasid: 'Abbasid_Caliphate',
        abbasid_late: 'Abbasid_Caliphate',
        parthia: 'Parthian_Empire',
        seleucid: 'Seleucid_Empire',
        safavid: 'Safavid_dynasty',

        // South Asia
        maurya: 'Maurya_Empire',
        gupta: 'Gupta_Empire',
        mughal: 'Mughal_Empire',
        mughal_peak: 'Mughal_Empire',
        mughal_late: 'Mughal_Empire',
        british_raj: 'British_Raj',
        delhi: 'Delhi_Sultanate',
        kushan: 'Kushan_Empire',
        chola: 'Chola_dynasty',

        // Southeast Asia
        khmer: 'Khmer_Empire',
        srivijaya: 'Srivijaya',
        majapahit: 'Majapahit',
        dai_viet: 'Đại_Việt',
        champa: 'Champa',
        pagan: 'Pagan_Kingdom',
        ayutthaya: 'Ayutthaya_Kingdom',
        lan_xang: 'Lan_Xang',

        // Africa
        egypt_old: 'Old_Kingdom_of_Egypt',
        egypt_middle: 'Middle_Kingdom_of_Egypt',
        egypt_new: 'New_Kingdom_of_Egypt',
        egypt_late: 'Late_Period_of_ancient_Egypt',
        kush: 'Kingdom_of_Kush',
        aksum: 'Kingdom_of_Aksum',
        mali: 'Mali_Empire',
        songhai: 'Songhai_Empire',
        ghana: 'Ghana_Empire',

        // Americas
        maya_classic: 'Maya_civilization',
        maya_post: 'Maya_civilization',
        aztec: 'Aztec_Empire',
        inca: 'Inca_Empire',
        olmec: 'Olmec',
        teotihuacan: 'Teotihuacan',
        toltec: 'Toltec',

        // Greek/Hellenistic
        greek_classical: 'Classical_Greece',
        greek_archaic: 'Archaic_Greece',
        macedon: 'Ancient_Macedon',
        ptolemaic: 'Ptolemaic_Kingdom',

        // Central Asia
        timurid: 'Timurid_Empire'
    };

    // Chinese Wikipedia slugs
    const wikiSlugsCN = {
        // Chinese dynasties
        qin: '秦朝',
        han_west: '西汉',
        han_east: '东汉',
        tang: '唐朝',
        n_song: '北宋',
        s_song: '南宋',
        yuan: '元朝',
        ming: '明朝',
        qing: '清朝',
        sui: '隋朝',
        jin_west: '晋朝',
        jin_jurchen: '金朝',
        cao_wei: '曹魏',
        zhou_west: '西周',
        zhou_east: '东周',
        xia: '夏朝',
        shang: '商朝',
        xin: '新朝',
        five_dyn: '五代十国',
        ten_kingdoms: '五代十国',
        sixteen_k: '五胡十六国',
        n_wei: '北魏',
        n_dynasties: '南北朝',
        s_dynasties: '南北朝',
        e_jin: '东晋',
        shu_wu: '三国',
        roc: '中華民國',
        prc: '中华人民共和国',
        yuan_early: '元朝',

        // Mongolia/Steppe
        xiongnu: '匈奴',
        xianbei: '鲜卑',
        rouran: '柔然',
        gokturk: '突厥汗国',
        uyghur: '回鹘',
        liao: '辽朝',
        mongol_emp: '蒙古帝国',
        mongol_tribes: '蒙古帝国',
        northern_yuan: '北元',

        // Korea
        gojoseon: '古朝鲜',
        goryeo: '高丽',
        joseon: '朝鲜王朝',
        three_k_korea: '朝鲜三国时代',
        unified_silla: '统一新罗',
        korean_emp: '大韩帝国',
        jp_korea: '朝鲜日治时期',
        south_korea: '大韩民国',
        north_korea: '朝鲜民主主义人民共和国',

        // Japan
        jomon: '绳文时代',
        yayoi: '弥生时代',
        kofun: '古坟时代',
        asuka: '飞鸟时代',
        nara: '奈良时代',
        heian: '平安时代',
        kamakura: '镰仓时代',
        muromachi: '室町时代',
        azuchi: '安土桃山时代',
        edo: '江户时代',
        meiji: '明治',
        taisho_showa: '昭和',
        heisei: '平成',

        // Europe
        roman_republic: '罗马共和国',
        roman_empire: '罗马帝国',
        byzantine: '拜占庭帝国',
        carolingian: '加洛林帝国',
        hre: '神圣罗马帝国',
        ottoman: '奥斯曼帝国',
        ottoman_peak: '奥斯曼帝国',
        ottoman_late: '奥斯曼帝国',
        visigoth: '西哥特王国',
        frankish: '法兰克王国',

        // Middle East
        achaemenid: '阿契美尼德王朝',
        sassanid: '萨珊王朝',
        rashidun: '正统哈里发时期',
        umayyad: '倭马亚王朝',
        abbasid: '阿拔斯王朝',
        abbasid_late: '阿拔斯王朝',
        parthia: '安息帝国',
        seleucid: '塞琉古帝国',
        safavid: '萨非王朝',

        // South Asia
        maurya: '孔雀王朝',
        gupta: '笈多王朝',
        mughal: '莫卧儿帝国',
        mughal_peak: '莫卧儿帝国',
        mughal_late: '莫卧儿帝国',
        british_raj: '英属印度',
        delhi: '德里苏丹国',
        kushan: '贵霜帝国',
        chola: '朱罗王朝',

        // Southeast Asia
        khmer: '高棉帝国',
        srivijaya: '三佛齐',
        majapahit: '满者伯夷',
        dai_viet: '大越',
        champa: '占婆',
        pagan: '蒲甘王朝',
        ayutthaya: '阿瑜陀耶王国',
        lan_xang: '澜沧王国',

        // Africa
        egypt_old: '古王國時期',
        egypt_middle: '中王國時期',
        egypt_new: '新王國時期',
        egypt_late: '古埃及后期',
        kush: '库施王国',
        aksum: '阿克苏姆帝国',
        mali: '马里帝国',
        songhai: '桑海帝国',
        ghana: '加纳帝国',

        // Americas
        maya_classic: '玛雅文明',
        maya_post: '玛雅文明',
        aztec: '阿兹特克帝国',
        inca: '印加帝国',
        olmec: '奥尔梅克文明',
        teotihuacan: '特奥蒂瓦坎',
        toltec: '托尔特克',

        // Greek/Hellenistic
        greek_classical: '古典希腊时期',
        greek_archaic: '古风时期',
        macedon: '马其顿王国',
        ptolemaic: '托勒密王国',

        // Central Asia
        timurid: '帖木儿帝国'
    };

    const isChinese = CONFIG.language === 'cn';
    const wikiSlugs = isChinese ? wikiSlugsCN : wikiSlugsEN;
    const fallbackName = isChinese ? (entity.nameCN || entity.name) : entity.name;
    const slug = wikiSlugs[entity.id] || fallbackName.replace(/\s+/g, '_');
    const lang = isChinese ? 'zh' : 'en';
    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}

function showDetail(entity) {
    const isCn = CONFIG.language === 'cn';
    const category = entity.category ? ENTITY_CATEGORIES[entity.category] : null;
    const description = HISTORICAL_DESCRIPTIONS[entity.id];
    const wikiUrl = getWikiUrl(entity);
    const details = ENTITY_DETAILS[entity.id] || {};

    // Find which region this entity belongs to
    const regionKey = getEntityRegion(entity.id);
    const region = regionKey ? WORLD_HISTORY[regionKey] : null;
    const regionName = region ? (isCn ? region.nameCN : region.name) : '';

    // Capital
    const capital = details.capital || CAPITALS[entity.id];
    const capitalName = capital ? (isCn ? (capital.cn || capital.nameCN || capital.name) : (capital.en || capital.name)) : '';

    // Rulers (merge entity.rulers + details.rulers)
    let rulersEn = entity.rulers || [];
    let rulersCn = entity.rulersCN || details.rulersCN || [];
    if (details.rulers && !entity.rulers) rulersEn = details.rulers;
    const rulers = isCn && rulersCn.length ? rulersCn : rulersEn;

    // Achievements
    const achievements = details.achievements;
    const achievementsList = achievements ? (isCn ? achievements.cn : achievements.en) : [];

    // Contemporary civilizations: overlapping in time, from visible regions
    const contemporaries = [];
    for (const rKey of Object.keys(WORLD_HISTORY)) {
        if (rKey === regionKey) continue;
        for (const e of WORLD_HISTORY[rKey].entities) {
            if (e.start < entity.end && e.end > entity.start && ['empire','caliphate','kingdom'].includes(e.category)) {
                // overlap score: length of overlap
                const overlap = Math.min(entity.end, e.end) - Math.max(entity.start, e.start);
                contemporaries.push({ entity: e, region: rKey, overlap });
            }
        }
    }
    contemporaries.sort((a,b) => b.overlap - a.overlap);
    const topContemps = contemporaries.slice(0, 6);

    // Connections
    const relatedConnections = CONNECTIONS.filter(c => c.from === entity.id || c.to === entity.id);

    const duration = entity.end - entity.start;

    let html = `
        <div class="panel-hero">
            <div>
                <div class="panel-region">${regionName}${category ? ' · ' + (isCn ? category.labelCN : category.label) : ''}</div>
                <div class="panel-hero-title">${formatYear(entity.start)} — ${formatYear(entity.end)} · ${duration} ${isCn ? '年' : 'years'}</div>
            </div>
        </div>
        <h2 id="panelTitle">${entity.name}</h2>
        <h3>${entity.nameCN || ''}</h3>
        ${category ? `<span class="category-badge" style="background: ${category.color}">${isCn ? category.labelCN : category.label}</span>` : ''}

        <div class="fact-grid">
            <div class="fact"><span class="fact-label">${isCn ? '时期' : 'Period'}</span><span class="fact-value">${formatYear(entity.start)} → ${formatYear(entity.end)}</span></div>
            <div class="fact"><span class="fact-label">${isCn ? '存续' : 'Duration'}</span><span class="fact-value">${duration} ${isCn ? '年' : 'yr'}</span></div>
            ${capitalName ? `<div class="fact"><span class="fact-label">${isCn ? '首都' : 'Capital'}</span><span class="fact-value">${capitalName}</span></div>` : ''}
            <div class="fact"><span class="fact-label">${isCn ? '地域' : 'Region'}</span><span class="fact-value">${regionName}</span></div>
        </div>
    `;

    if (description) {
        html += `
            <h4>${isCn ? '历史背景' : 'Background'}</h4>
            <p class="entity-description">${isCn ? description.cn : description.en}</p>
        `;
    }

    if (rulers && rulers.length) {
        html += `
            <h4>${isCn ? '著名统治者' : 'Notable Rulers'}</h4>
            <ul class="rulers-list">
                ${rulers.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }

    if (achievementsList.length) {
        html += `
            <h4>${isCn ? '主要成就' : 'Key Achievements'}</h4>
            <ul class="achievements-list">
                ${achievementsList.map(a => `<li>${a}</li>`).join('')}
            </ul>
        `;
    }

    if (relatedConnections.length) {
        html += `
            <h4>${isCn ? '历史联系' : 'Historical Connections'}</h4>
            <ul class="connections-list">
                ${relatedConnections.map(c => {
                    const label = isCn ? c.labelCN : c.label;
                    const other = c.from === entity.id ? c.to : c.from;
                    const otherEntity = findEntityById(other);
                    const otherName = otherEntity ? (isCn ? (otherEntity.nameCN || otherEntity.name) : otherEntity.name) : other;
                    return `<li><span class="connection-type ${c.type}">${c.type}</span>${label} ${isCn ? '·' : '·'} ${otherName} (${formatYear(c.year)})</li>`;
                }).join('')}
            </ul>
        `;
    }

    if (topContemps.length) {
        html += `
            <h4>${isCn ? '同时代' : 'Contemporaries'}</h4>
            <ul class="contemporaries-list">
                ${topContemps.map(c => {
                    const name = isCn ? (c.entity.nameCN || c.entity.name) : c.entity.name;
                    const rName = isCn ? (WORLD_HISTORY[c.region].nameCN) : WORLD_HISTORY[c.region].name;
                    return `<li><a href="#" data-jump-id="${c.entity.id}">${name}</a> — ${rName} (${formatYear(c.entity.start)}–${formatYear(c.entity.end)})</li>`;
                }).join('')}
            </ul>
        `;
    }

    html += `
        <div class="wiki-section">
            <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="wiki-link">
                ${isCn ? '在维基百科阅读' : 'Read on Wikipedia'}
            </a>
        </div>
    `;

    elements.panelContent.innerHTML = html;

    // Wire up jump-to links on contemporaries
    elements.panelContent.querySelectorAll('[data-jump-id]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const id = a.dataset.jumpId;
            const target = findEntityById(id);
            if (target) {
                hidePanel();
                setTimeout(() => {
                    scrollToYear((target.start + target.end) / 2, true);
                    setTimeout(() => showDetail(target), 600);
                }, 250);
            }
        });
    });

    showPanel();
}

function showPanel() {
    let backdrop = document.querySelector('.panel-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'panel-backdrop';
        backdrop.addEventListener('click', hidePanel);
        document.body.appendChild(backdrop);
    }
    backdrop.classList.add('visible');
    elements.eventPanel.classList.add('visible');
}

function hidePanel() {
    document.querySelector('.panel-backdrop')?.classList.remove('visible');
    elements.eventPanel.classList.remove('visible');
}

function toggleEvents(show) {
    CONFIG.showEvents = show;
    elements.eventsOverlay.classList.toggle('hidden', !show);
    renderEvents();
}

function toggleRegion(regionId, show) {
    CONFIG.visibleRegions[regionId] = show;
    renderTimeline();
    renderEvents();
    renderLegend();
}

function switchLanguage(lang) {
    CONFIG.language = lang;
    document.body.classList.toggle('lang-cn', lang === 'cn');
    elements.langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    renderTimeline();
    renderEvents();
    renderLegend();
    renderGlobalEvents();
    renderConnectionLines();
    updateStatsChip();
}

// ============================================
// ZOOM CONTROLS
// ============================================

const DEFAULT_YEAR_HEIGHT = 0.25;
const MIN_YEAR_HEIGHT = 0.1;
const MAX_YEAR_HEIGHT = 15;

function setZoom(newYearHeight) {
    newYearHeight = Math.max(MIN_YEAR_HEIGHT, Math.min(MAX_YEAR_HEIGHT, newYearHeight));

    const scrollContainer = document.querySelector('.timeline-container');
    const scrollPercent = scrollContainer ? scrollContainer.scrollTop / scrollContainer.scrollHeight : 0;

    CONFIG.yearHeight = newYearHeight;

    if (elements.zoomSlider) elements.zoomSlider.value = newYearHeight;
    if (elements.zoomValue) elements.zoomValue.textContent = `${newYearHeight.toFixed(2)} px/yr`;

    renderYearScale();
    renderTimeline();
    renderEvents();

    if (scrollContainer) {
        scrollContainer.scrollTop = scrollPercent * scrollContainer.scrollHeight;
    }
}

function zoomIn() {
    const step = CONFIG.yearHeight < 1 ? 0.25 : CONFIG.yearHeight < 3 ? 0.5 : 1;
    setZoom(CONFIG.yearHeight + step);
}
function zoomOut() {
    const step = CONFIG.yearHeight <= 1 ? 0.25 : CONFIG.yearHeight <= 3 ? 0.5 : 1;
    setZoom(CONFIG.yearHeight - step);
}
function resetZoom() { setZoom(DEFAULT_YEAR_HEIGHT); }
function handleZoomSlider(e) { setZoom(parseFloat(e.target.value)); }

// ============================================
// CONNECTIONS RENDERING
// ============================================

function renderConnections() {
    // Remove existing
    document.querySelectorAll('.connection-line').forEach(el => el.remove());
    if (!CONFIG.showConnections) return;

    // One shared SVG for all connections
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('connection-line');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 35;
        overflow: visible;
    `;

    const colors = {
        trade:      { stroke: '#6E833A', dash: '4,3', icon: '' },
        conflict:   { stroke: '#B8361F', dash: 'none', icon: '' },
        conquest:   { stroke: '#5A1108', dash: 'none', icon: '' },
        succession: { stroke: '#1F4D7A', dash: 'none', icon: '' },
        cultural:   { stroke: '#5C544A', dash: '6,2,2,2', icon: '' }
    };

    CONNECTIONS.forEach((conn, idx) => {
        const fromPos = entityPositions[conn.from];
        const toPos = entityPositions[conn.to];
        if (!fromPos || !toPos) return;

        const y = yearToY(conn.year) + 35;
        const x1 = fromPos.centerX;
        const x2 = toPos.centerX;
        const midX = (x1 + x2) / 2;

        // Curvature — arcs scale with horizontal distance
        const distance = Math.abs(x2 - x1);
        const arcHeight = Math.min(40 + distance * 0.10, 80);

        const style = colors[conn.type] || colors.cultural;

        // Small square markers at ends
        const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        dot1.setAttribute('x', x1 - 2);
        dot1.setAttribute('y', y - 2);
        dot1.setAttribute('width', '4');
        dot1.setAttribute('height', '4');
        dot1.setAttribute('fill', style.stroke);
        svg.appendChild(dot1);

        const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        dot2.setAttribute('x', x2 - 2);
        dot2.setAttribute('y', y - 2);
        dot2.setAttribute('width', '4');
        dot2.setAttribute('height', '4');
        dot2.setAttribute('fill', style.stroke);
        svg.appendChild(dot2);

        // Arced path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${x1} ${y} Q ${midX} ${y - arcHeight} ${x2} ${y}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', style.stroke);
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.65');
        if (style.dash !== 'none') path.setAttribute('stroke-dasharray', style.dash);
        path.style.pointerEvents = 'stroke';
        path.style.cursor = 'pointer';
        path.addEventListener('mouseenter', (e) => showConnectionTooltip(e, conn));
        path.addEventListener('mouseleave', hideTooltip);
        svg.appendChild(path);

        // Label — only render when sufficiently zoomed in
        if (CONFIG.yearHeight > 1.0) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const labelText = CONFIG.language === 'cn' ? conn.labelCN : conn.label;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', y - arcHeight - 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '9.5');
            text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
            text.setAttribute('font-style', 'normal');
            text.setAttribute('font-weight', '500');
            text.setAttribute('fill', style.stroke);
            text.setAttribute('opacity', '0.95');
            text.textContent = labelText;
            // White halo
            const halo = text.cloneNode(true);
            halo.setAttribute('stroke', '#FFFFFF');
            halo.setAttribute('stroke-width', '3');
            halo.setAttribute('opacity', '0.9');
            g.appendChild(halo);
            g.appendChild(text);
            svg.appendChild(g);
        }
    });

    elements.timelineGrid.appendChild(svg);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleSearch(query) {
    CONFIG.searchQuery = query.trim();

    if (elements.searchClear) {
        elements.searchClear.style.display = query ? 'block' : 'none';
    }

    renderTimeline();
    renderEvents();
    updateURLState();
}

function clearSearch() {
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
    handleSearch('');
}

// ============================================
// MINIMAP
// ============================================

// Stats chip — live counter of visible polities
function updateStatsChip(visibleCount, matchCount) {
    const entitiesEl = document.getElementById('statEntities');
    const regionsEl = document.getElementById('statRegions');
    const spanEl = document.getElementById('statSpan');
    if (!entitiesEl) return;

    let total = 0;
    getVisibleRegions().forEach(rid => {
        total += (WORLD_HISTORY[rid] ? WORLD_HISTORY[rid].entities.length : 0);
    });
    const activeRegions = getVisibleRegions().length;
    const categoryFiltered = CONFIG.categoryFilter ? visibleCount : total;

    entitiesEl.textContent = CONFIG.searchQuery && matchCount !== undefined
        ? `${matchCount} / ${categoryFiltered}`
        : `${categoryFiltered}`;
    regionsEl.textContent = `${activeRegions}`;
    spanEl.textContent = `${CONFIG.timelineEnd - CONFIG.timelineStart}`;
}

// Legacy no-op stubs (minimap removed — replaced by stats chip)
function updateMinimap() { /* stats chip handled separately */ }
function handleMinimapClick() { /* removed */ }

// ============================================
// URL STATE MANAGEMENT
// ============================================

function updateURLState() {
    const state = {
        zoom: CONFIG.yearHeight,
        lang: CONFIG.language,
        regions: Object.entries(CONFIG.visibleRegions)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(','),
        search: CONFIG.searchQuery || undefined,
        events: CONFIG.showEvents ? '1' : '0',
        connections: CONFIG.showConnections ? '1' : '0',
        eras: CONFIG.showEraBackgrounds ? '1' : '0'
    };

    const params = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, v);
    });

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newURL);
}

function loadURLState() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('zoom')) {
        CONFIG.yearHeight = parseFloat(params.get('zoom')) || DEFAULT_YEAR_HEIGHT;
    }

    if (params.has('lang')) {
        CONFIG.language = params.get('lang') === 'cn' ? 'cn' : 'en';
    }

    if (params.has('regions')) {
        const activeRegions = params.get('regions').split(',');
        Object.keys(CONFIG.visibleRegions).forEach(region => {
            CONFIG.visibleRegions[region] = activeRegions.includes(region);
        });
    }

    if (params.has('search')) {
        CONFIG.searchQuery = params.get('search');
    }

    if (params.has('events')) {
        CONFIG.showEvents = params.get('events') === '1';
    }

    if (params.has('connections')) {
        CONFIG.showConnections = params.get('connections') === '1';
    }

    if (params.has('eras')) {
        CONFIG.showEraBackgrounds = params.get('eras') === '1';
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

function setupKeyboardNavigation() {
    document.addEventListener('keydown', e => {
        const container = elements.timelineContainer;
        if (!container) return;

        // Arrow key navigation
        const scrollAmount = 100;

        switch(e.key) {
            case 'ArrowUp':
                if (!e.ctrlKey && !e.metaKey) {
                    container.scrollTop -= scrollAmount;
                    e.preventDefault();
                }
                break;
            case 'ArrowDown':
                if (!e.ctrlKey && !e.metaKey) {
                    container.scrollTop += scrollAmount;
                    e.preventDefault();
                }
                break;
            case 'ArrowLeft':
                container.scrollLeft -= scrollAmount;
                e.preventDefault();
                break;
            case 'ArrowRight':
                container.scrollLeft += scrollAmount;
                e.preventDefault();
                break;
            case 'Home':
                container.scrollTop = 0;
                e.preventDefault();
                break;
            case 'End':
                container.scrollTop = container.scrollHeight;
                e.preventDefault();
                break;
            case 'PageUp':
                container.scrollTop -= container.clientHeight;
                e.preventDefault();
                break;
            case 'PageDown':
                container.scrollTop += container.clientHeight;
                e.preventDefault();
                break;
            case '/':
                // Focus search on '/'
                if (elements.searchInput && document.activeElement !== elements.searchInput) {
                    elements.searchInput.focus();
                    e.preventDefault();
                }
                break;
        }

        updateMinimap();
    });
}

// ============================================
// TOUCH GESTURES (MOBILE)
// ============================================

let touchState = {
    startX: 0,
    startY: 0,
    startDistance: 0,
    startZoom: CONFIG.yearHeight
};

function setupTouchGestures() {
    const container = elements.timelineContainer;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Pinch gesture start
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchState.startDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        touchState.startZoom = CONFIG.yearHeight;
        e.preventDefault();
    } else if (e.touches.length === 1) {
        touchState.startX = e.touches[0].clientX;
        touchState.startY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2) {
        // Pinch to zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        const scale = currentDistance / touchState.startDistance;
        const newZoom = Math.round(touchState.startZoom * scale);

        if (newZoom !== CONFIG.yearHeight) {
            setZoom(newZoom);
        }

        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    touchState.startDistance = 0;
}

// ============================================
// TOGGLE FUNCTIONS
// ============================================

function toggleConnections(show) {
    CONFIG.showConnections = show;
    renderTimeline();
    updateURLState();
}

function toggleEras(show) {
    CONFIG.showEraBackgrounds = show;
    renderTimeline();
    updateURLState();
}

// ============================================
// YEAR CURSOR
// ============================================

function setupYearCursor() {
    const container = elements.timelineContainer;
    if (!container || !elements.yearCursor) return;

    const cursorYear = elements.yearCursor.querySelector('.cursor-year');

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const relativeY = e.clientY - rect.top + scrollTop;

        // Calculate year from Y position
        const year = Math.round(CONFIG.timelineStart + relativeY / CONFIG.yearHeight);

        if (year >= CONFIG.timelineStart && year <= CONFIG.timelineEnd) {
            elements.yearCursor.style.top = `${e.clientY}px`;
            elements.yearCursor.classList.add('visible');
            if (cursorYear) {
                cursorYear.textContent = formatYear(year);
            }
        } else {
            elements.yearCursor.classList.remove('visible');
        }
    });

    container.addEventListener('mouseleave', () => {
        elements.yearCursor.classList.remove('visible');
    });
}

// ============================================
// ZOOM PRESETS
// ============================================

function setupZoomPresets() {
    if (!elements.presetBtns) return;

    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const zoom = parseFloat(btn.dataset.zoom);
            if (!isNaN(zoom)) {
                setZoom(zoom);
                updateURLState();

                // Update active state
                elements.presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
}

// ============================================
// ERA NAVIGATION
// ============================================

function setupEraNavigation() {
    if (!elements.eraBtns) return;

    elements.eraBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const year = parseInt(btn.dataset.year);
            if (!isNaN(year)) {
                jumpToYear(year);

                // Update active state
                elements.eraBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Remove active state after a short delay
                setTimeout(() => btn.classList.remove('active'), 1000);
            }
        });
    });
}

function jumpToYear(year) {
    // Use the shared scrollToYear function
    scrollToYear(year, true);
}

// ============================================
// CONNECTION LINES VISUALIZATION
// ============================================

function renderConnectionLines() {
    // Remove old inline SVGs from grid (renderConnections also runs)
    document.querySelectorAll('.connection-line').forEach(el => el.remove());
    if (!CONFIG.showConnections) return;
    renderConnections();
}

function findEntityById(id) {
    for (const region of Object.values(WORLD_HISTORY)) {
        const entity = region.entities.find(e => e.id === id);
        if (entity) return entity;
    }
    return null;
}

function getEntityRegion(entityId) {
    for (const [regionKey, region] of Object.entries(WORLD_HISTORY)) {
        if (region.entities.some(e => e.id === entityId)) {
            return regionKey;
        }
    }
    return null;
}

function showConnectionTooltip(e, conn) {
    const tooltip = elements.tooltip;
    tooltip.querySelector('.tooltip-title').textContent = conn.label;
    tooltip.querySelector('.tooltip-title-cn').textContent = conn.labelCN;
    tooltip.querySelector('.tooltip-dates').textContent = formatYear(conn.year);
    tooltip.querySelector('.tooltip-duration').textContent = conn.type.charAt(0).toUpperCase() + conn.type.slice(1);

    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.classList.add('visible');
}

// ============================================
// GLOBAL EVENTS MARKERS
// ============================================

function renderGlobalEvents() {
    if (!elements.globalEventsTrack) return;
    elements.globalEventsTrack.innerHTML = '';

    HISTORICAL_EVENTS.forEach((event, index) => {
        if (event.year < CONFIG.timelineStart || event.year > CONFIG.timelineEnd) return;
        const marker = document.createElement('div');
        marker.className = `global-event-marker ${event.type}`;
        marker.style.top = `${yearToY(event.year) + 35}px`;
        marker.textContent = String(index + 1);
        marker.title = `#${index+1} · ${formatYear(event.year)}: ${CONFIG.language === 'cn' ? event.labelCN : event.label}`;
        marker.style.animationDelay = `${index * 0.015}s`;

        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetail(event, index + 1);
        });
        marker.addEventListener('mouseenter', (e) => showEventTooltip(e, event, index + 1));
        marker.addEventListener('mouseleave', hideTooltip);

        elements.globalEventsTrack.appendChild(marker);
    });
}

function showEventDetail(event, number) {
    const isCn = CONFIG.language === 'cn';
    const typeLabel = {
        invention: isCn ? '发明与发现' : 'Invention',
        construction: isCn ? '建造' : 'Construction',
        cultural: isCn ? '文化与宗教' : 'Cultural',
        political: isCn ? '政治' : 'Political',
        conflict: isCn ? '冲突' : 'Conflict',
        conquest: isCn ? '征服' : 'Conquest',
        exploration: isCn ? '探索' : 'Exploration',
        disaster: isCn ? '灾难' : 'Disaster',
        trade: isCn ? '贸易' : 'Trade'
    }[event.type] || event.type;

    const regionName = event.region && WORLD_HISTORY[event.region]
        ? (isCn ? WORLD_HISTORY[event.region].nameCN : WORLD_HISTORY[event.region].name)
        : '';

    // Find entities active at this year
    const active = [];
    Object.entries(WORLD_HISTORY).forEach(([regionKey, region]) => {
        region.entities.forEach(e => {
            if (e.start <= event.year && e.end >= event.year && ['empire','caliphate','kingdom','republic'].includes(e.category)) {
                active.push({ entity: e, region: regionKey });
            }
        });
    });
    const majorPowers = active.slice(0, 8);

    let html = `
        <div class="panel-hero">
            <div>
                <div class="panel-region">${isCn ? '世界大事' : 'World Event'} · ${typeLabel}</div>
                <div class="panel-hero-title">${number ? '№ ' + number + ' · ' : ''}${formatYear(event.year)}</div>
            </div>
        </div>
        <h2 id="panelTitle">${isCn ? event.labelCN : event.label}</h2>
        <h3>${isCn ? event.label : event.labelCN}</h3>

        <div class="fact-grid">
            <div class="fact"><span class="fact-label">${isCn ? '年份' : 'Year'}</span><span class="fact-value">${formatYear(event.year)}</span></div>
            <div class="fact"><span class="fact-label">${isCn ? '类型' : 'Type'}</span><span class="fact-value">${typeLabel}</span></div>
            ${regionName ? `<div class="fact"><span class="fact-label">${isCn ? '地域' : 'Region'}</span><span class="fact-value">${regionName}</span></div>` : ''}
        </div>
    `;

    if (event.desc) {
        html += `
            <h4>${isCn ? '事件背景' : 'Context'}</h4>
            <p class="entity-description">${isCn ? event.desc.cn : event.desc.en}</p>
        `;
    }

    if (majorPowers.length) {
        html += `
            <h4>${isCn ? '同期强权' : 'Powers at this Moment'}</h4>
            <ul class="contemporaries-list">
                ${majorPowers.map(p => {
                    const name = isCn ? (p.entity.nameCN || p.entity.name) : p.entity.name;
                    const rName = isCn ? WORLD_HISTORY[p.region].nameCN : WORLD_HISTORY[p.region].name;
                    return `<li><a href="#" data-jump-id="${p.entity.id}">${name}</a> — ${rName}</li>`;
                }).join('')}
            </ul>
        `;
    }

    elements.panelContent.innerHTML = html;

    elements.panelContent.querySelectorAll('[data-jump-id]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const id = a.dataset.jumpId;
            const target = findEntityById(id);
            if (target) {
                hidePanel();
                setTimeout(() => {
                    scrollToYear((target.start + target.end) / 2, true);
                    setTimeout(() => showDetail(target), 600);
                }, 250);
            }
        });
    });

    showPanel();
}

// ============================================
// JUMP TO YEAR
// ============================================

function setupJumpToYear() {
    if (!elements.jumpToYear || !elements.jumpBtn) return;

    const doJump = () => {
        let input = elements.jumpToYear.value.trim().toLowerCase();
        let year;

        // Parse input - handle BC/AD notation
        if (input.includes('bc') || input.includes('bce')) {
            year = -Math.abs(parseInt(input));
        } else if (input.includes('ad') || input.includes('ce')) {
            year = Math.abs(parseInt(input));
        } else {
            year = parseInt(input);
            // Assume negative for large numbers suggesting ancient times
            if (year > 2100) year = -year;
        }

        if (isNaN(year)) {
            showToast('Please enter a valid year');
            return;
        }

        // Clamp to timeline bounds
        year = Math.max(CONFIG.timelineStart, Math.min(CONFIG.timelineEnd, year));

        scrollToYear(year, true);
        showToast(`Jumped to ${formatYear(year)}`);
        elements.jumpToYear.value = '';
    };

    elements.jumpBtn.addEventListener('click', doJump);
    elements.jumpToYear.addEventListener('keydown', e => {
        if (e.key === 'Enter') doJump();
    });
}

function scrollToYear(year, smooth = true) {
    const container = elements.timelineContainer;
    if (!container) return;

    const y = yearToY(year) + 35;
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;
    const viewportHeight = window.innerHeight;
    // Header is sticky at top, account for its height (~108px)
    const headerOffset = 120;
    const scrollTarget = Math.max(0, containerTop + y - (viewportHeight / 2) - headerOffset);

    window.scrollTo({
        top: scrollTarget,
        behavior: smooth ? 'smooth' : 'instant'
    });

    // Also flash a highlight at that year
    flashYearBeacon(year);
}

function flashYearBeacon(year) {
    const beacon = document.createElement('div');
    beacon.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        top: ${yearToY(year) + 35}px;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--vermilion), transparent);
        box-shadow: 0 0 12px var(--vermilion);
        pointer-events: none;
        z-index: 300;
        animation: beacon-flash 1.6s ease-out forwards;
    `;
    elements.timelineGrid.appendChild(beacon);
    setTimeout(() => beacon.remove(), 1700);
}
// Inject beacon animation if not in CSS
if (!document.getElementById('beacon-style')) {
    const s = document.createElement('style');
    s.id = 'beacon-style';
    s.textContent = `@keyframes beacon-flash { 0% { opacity: 0; transform: scaleY(1); } 15% { opacity: 1; transform: scaleY(4); } 100% { opacity: 0; transform: scaleY(1); } }`;
    document.head.appendChild(s);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 2500) {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.classList.add('visible');

    setTimeout(() => {
        elements.toast.classList.remove('visible');
    }, duration);
}

// ============================================
// CONTEMPORANEOUS HIGHLIGHTING
// ============================================

function setupContemporaryHighlight() {
    document.addEventListener('mouseover', e => {
        const block = e.target.closest('.dynasty-block');
        if (!block) return;

        const start = parseInt(block.dataset.start);
        const end = parseInt(block.dataset.end);

        // Find and highlight all contemporaneous blocks
        document.querySelectorAll('.dynasty-block').forEach(other => {
            if (other === block) return;
            const otherStart = parseInt(other.dataset.start);
            const otherEnd = parseInt(other.dataset.end);

            // Check for overlap
            if (start < otherEnd && end > otherStart) {
                other.classList.add('contemporary-highlight');
            }
        });
    });

    document.addEventListener('mouseout', e => {
        const block = e.target.closest('.dynasty-block');
        if (!block) return;

        document.querySelectorAll('.dynasty-block.contemporary-highlight').forEach(el => {
            el.classList.remove('contemporary-highlight');
        });
    });
}

// ============================================
// COMPARE MODE
// ============================================

function setupCompareMode() {
    if (!elements.compareBtn || !elements.comparePanel) return;

    let selectedRegions = [];
    let compareModeActive = false;

    elements.compareBtn.addEventListener('click', () => {
        if (compareModeActive) {
            // Turn compare mode off
            compareModeActive = false;
            elements.compareBtn.classList.remove('active');
            // Restore all regions
            Object.keys(CONFIG.visibleRegions).forEach(region => {
                CONFIG.visibleRegions[region] = true;
            });
            elements.regionCheckboxes.forEach(cb => { cb.checked = true; });
            renderTimeline();
            renderLegend();
            renderConnectionLines();
            showToast(CONFIG.language === 'cn' ? '已退出对比模式' : 'Compare mode off');
            return;
        }
        // Open compare panel
        elements.compareOptions.innerHTML = '';
        selectedRegions = [];

        Object.entries(WORLD_HISTORY).forEach(([key, region]) => {
            const option = document.createElement('div');
            option.className = 'compare-option';
            option.textContent = CONFIG.language === 'cn' ? region.nameCN : region.name;
            option.dataset.region = key;

            option.addEventListener('click', () => {
                if (option.classList.contains('selected')) {
                    option.classList.remove('selected');
                    selectedRegions = selectedRegions.filter(r => r !== key);
                } else if (selectedRegions.length < 2) {
                    option.classList.add('selected');
                    selectedRegions.push(key);
                }
            });

            elements.compareOptions.appendChild(option);
        });

        elements.comparePanel.classList.add('visible');
    });

    elements.compareClose?.addEventListener('click', () => {
        elements.comparePanel.classList.remove('visible');
    });

    elements.compareApply?.addEventListener('click', () => {
        if (selectedRegions.length !== 2) {
            showToast(CONFIG.language === 'cn' ? '请选择两个地区' : 'Please select 2 regions');
            return;
        }

        compareModeActive = true;
        elements.compareBtn.classList.add('active');

        // Show only selected regions
        Object.keys(CONFIG.visibleRegions).forEach(region => {
            CONFIG.visibleRegions[region] = selectedRegions.includes(region);
        });
        elements.regionCheckboxes.forEach(cb => {
            cb.checked = CONFIG.visibleRegions[cb.dataset.region];
        });

        renderTimeline();
        renderLegend();
        renderConnectionLines();
        elements.comparePanel.classList.remove('visible');

        const names = selectedRegions.map(k => CONFIG.language === 'cn' ? WORLD_HISTORY[k].nameCN : WORLD_HISTORY[k].name).join(' ↔ ');
        showToast(`${CONFIG.language === 'cn' ? '对比' : 'Comparing'}: ${names}`);
    });
}

// ============================================
// CATEGORY FILTER
// ============================================
function setupCategoryFilter() {
    const chips = document.querySelectorAll('#categoryFilter .cat-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.dataset.category || null;
            CONFIG.categoryFilter = cat;
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderTimeline();
            renderLegend();
            renderConnectionLines();
            updateURLState();
            if (cat) {
                showToast(`${CONFIG.language === 'cn' ? '筛选' : 'Filter'}: ${ENTITY_CATEGORIES[cat] ? (CONFIG.language === 'cn' ? ENTITY_CATEGORIES[cat].labelCN : ENTITY_CATEGORIES[cat].label) : cat}`);
            } else {
                showToast(CONFIG.language === 'cn' ? '清除筛选' : 'Filter cleared');
            }
        });
    });
    // Default to "All"
    const allChip = document.querySelector('#categoryFilter .cat-chip[data-category=""]');
    allChip?.classList.add('active');
}

// ============================================
// HELP DIALOG
// ============================================
function setupHelpDialog() {
    const helpBtn = document.getElementById('helpBtn');
    if (!helpBtn) return;
    helpBtn.addEventListener('click', () => {
        const isCn = CONFIG.language === 'cn';
        const html = `
            <div class="panel-hero">
                <div>
                    <div class="panel-region">${isCn ? '导览' : 'Navigation Guide'}</div>
                    <div class="panel-hero-title">${isCn ? '编年史使用指南' : 'Using the Chronicle'}</div>
                </div>
            </div>
            <h2>${isCn ? '键盘快捷键' : 'Keyboard Shortcuts'}</h2>
            <h3>${isCn ? '掌控时间之流' : 'Navigate the flow of time'}</h3>
            <h4>${isCn ? '移动' : 'Movement'}</h4>
            <ul>
                <li><strong>↑ ↓</strong> — ${isCn ? '滚动' : 'Scroll'}</li>
                <li><strong>Page Up / Down</strong> — ${isCn ? '整页翻动' : 'Full page'}</li>
                <li><strong>Home / End</strong> — ${isCn ? '跳转到起点/终点' : 'Jump to start / end'}</li>
                <li><strong>/</strong> — ${isCn ? '聚焦搜索' : 'Focus search'}</li>
            </ul>
            <h4>${isCn ? '缩放' : 'Zoom'}</h4>
            <ul>
                <li><strong>Ctrl/Cmd +</strong> — ${isCn ? '放大' : 'Zoom in'}</li>
                <li><strong>Ctrl/Cmd −</strong> — ${isCn ? '缩小' : 'Zoom out'}</li>
                <li><strong>Ctrl/Cmd 0</strong> — ${isCn ? '重置' : 'Reset'}</li>
                <li>${isCn ? '双击时间轴以放大到该年份' : 'Double-click the timeline to zoom in'}</li>
            </ul>
            <h4>${isCn ? '面板与模式' : 'Panels & Modes'}</h4>
            <ul>
                <li><strong>Esc</strong> — ${isCn ? '关闭面板 / 退出全屏模式' : 'Close panels / exit full-page mode'}</li>
                <li>${isCn ? '点击任意王朝查看详细信息' : 'Click any polity for a museum-style placard'}</li>
                <li>${isCn ? '点击金色圆圈查看世界大事' : 'Click any gold medallion for world events'}</li>
                <li>${isCn ? '悬停一个王朝高亮其同时代者' : 'Hover a polity to see its contemporaries'}</li>
            </ul>
            <h4>${isCn ? '工具' : 'Tools'}</h4>
            <ul>
                <li><strong>Compare</strong> — ${isCn ? '对比两个地区' : 'Compare two regions side by side'}</li>
                <li><strong>Export</strong> — ${isCn ? '导出为 PNG 图片' : 'Save as PNG image'}</li>
                <li><strong>Share</strong> — ${isCn ? '复制带当前状态的链接' : 'Copy link preserving current view'}</li>
                <li><strong>Dark</strong> — ${isCn ? '切换深色模式' : 'Toggle dark mode'}</li>
                <li><strong>Full</strong> — ${isCn ? '进入无干扰阅读' : 'Enter distraction-free mode'}</li>
            </ul>
            <h4>${isCn ? '数据规模' : 'Dataset'}</h4>
            <ul>
                <li>${isCn ? '约 530 个政体、80 个世界大事、50 条历史联系' : '~530 polities · ~80 world events · ~50 connections'}</li>
                <li>${isCn ? '8 个区域 · 公元前 3000 年至 公元 2000 年' : '8 regions · 3000 BC to AD 2000'}</li>
            </ul>
        `;
        elements.panelContent.innerHTML = html;
        showPanel();
    });
}

// ============================================
// DARK MODE
// ============================================

function setupDarkMode() {
    if (!elements.darkModeBtn) return;

    // Check saved preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        elements.darkModeBtn.classList.add('active');
        elements.darkModeBtn.textContent = 'Light';
    }

    elements.darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        elements.darkModeBtn.classList.toggle('active', isDark);
        elements.darkModeBtn.textContent = isDark ? 'Light' : 'Dark';
        localStorage.setItem('darkMode', isDark);
    });
}

// ============================================
// FULL PAGE MODE
// ============================================

function setupFullPageMode() {
    if (!elements.fullPageBtn) return;

    const toggleFullPage = (enable) => {
        document.body.classList.toggle('full-page-mode', enable);
        if (enable) {
            showToast('Full page mode. Press Esc to exit.');
        }
    };

    elements.fullPageBtn.addEventListener('click', () => {
        toggleFullPage(true);
    });

    elements.exitFullPage?.addEventListener('click', () => {
        toggleFullPage(false);
    });

    // Esc key to exit full page mode
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.body.classList.contains('full-page-mode')) {
            toggleFullPage(false);
            e.stopPropagation();
        }
    });
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function setupExport() {
    if (!elements.exportBtn) return;

    elements.exportBtn.addEventListener('click', async () => {
        const isCn = CONFIG.language === 'cn';
        showToast(isCn ? '导出准备中…' : 'Preparing export…');

        try {
            if (typeof html2canvas !== 'undefined') {
                // Export the timeline-wrapper (entire grid + year scale)
                const target = elements.timelineContainer;
                const canvas = await html2canvas(target, {
                    backgroundColor: document.body.classList.contains('dark-mode') ? '#1F190F' : '#F1DFB4',
                    scale: Math.min(2, window.devicePixelRatio || 1),
                    windowWidth: target.scrollWidth,
                    windowHeight: target.scrollHeight,
                    logging: false,
                    useCORS: true
                });

                const link = document.createElement('a');
                link.download = `illuminated-chronicle-${new Date().toISOString().slice(0,10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast(isCn ? '导出成功！' : 'Saved as PNG');
            } else {
                window.print();
                showToast(isCn ? '使用打印对话框另存为 PDF' : 'Use Print dialog to save as PDF');
            }
        } catch (err) {
            console.error('Export error:', err);
            showToast(isCn ? '导出失败 — 请改用打印 (Ctrl+P)' : 'Export failed — try Print (Ctrl+P)');
        }
    });
}

// ============================================
// SHARE/URL STATE
// ============================================

function setupShare() {
    if (!elements.shareBtn) return;

    elements.shareBtn.addEventListener('click', () => {
        updateURLState();
        const url = window.location.href;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copied to clipboard!');
            });
        } else {
            // Fallback
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('Link copied!');
        }
    });
}

// ============================================
// SMOOTH SCROLL FOR ERA BUTTONS
// ============================================

function setupSmoothEraNavigation() {
    if (!elements.eraBtns || elements.eraBtns.length === 0) {
        console.warn('Era buttons not found');
        return;
    }

    elements.eraBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const year = parseInt(btn.dataset.year);
            if (isNaN(year)) {
                console.warn('Invalid year in era button:', btn.dataset.year);
                return;
            }

            scrollToYear(year, true);
            showToast(`Jumped to ${formatYear(year)}`);

            // Highlight active era button briefly
            elements.eraBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 1000);
        });
    });
}

// ============================================
// STAGGERED ANIMATION ON LOAD
// ============================================

function applyStaggeredAnimation() {
    const blocks = document.querySelectorAll('.dynasty-block');
    blocks.forEach((block, index) => {
        block.style.animationDelay = `${index * 0.015}s`;
    });
}

// ============================================
// LEGEND TOGGLE
// ============================================

function setupLegendToggle() {
    if (!elements.legendToggle || !elements.legendPanel) return;

    // Start collapsed
    elements.legendPanel.classList.add('collapsed');

    elements.legendToggle.addEventListener('click', () => {
        elements.legendPanel.classList.toggle('collapsed');
        elements.legendToggle.textContent = elements.legendPanel.classList.contains('collapsed') ? '☰' : '✕';
    });
}

// ============================================
// DOUBLE-CLICK TO ZOOM
// ============================================

function setupDoubleClickZoom() {
    const container = elements.timelineContainer;
    if (!container) return;

    container.addEventListener('dblclick', (e) => {
        // Prevent double-click on dynasty blocks from triggering zoom
        if (e.target.closest('.dynasty-block')) return;

        const rect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const clickY = e.clientY - rect.top + scrollTop;

        // Calculate the year at click position
        const clickedYear = CONFIG.timelineStart + clickY / CONFIG.yearHeight;

        // Zoom in
        const newZoom = Math.min(CONFIG.yearHeight * 2, MAX_YEAR_HEIGHT);
        setZoom(newZoom);

        // Recalculate and scroll to keep clicked year centered
        setTimeout(() => {
            const newY = yearToY(clickedYear);
            container.scrollTo({
                top: newY - (e.clientY - rect.top),
                behavior: 'instant'
            });
        }, 50);

        updateURLState();
    });
}

// ============================================
// INIT
// ============================================

function init() {
    initElements();

    // One-time data normalization: trim same-slot polities that overlap in time
    // (e.g. Babylon IV-V truncated when Assyrian Empire takes over Mesopotamia).
    const trims = normalizeOverlaps();
    if (trims > 0) console.log(`Normalized ${trims} overlapping polities`);

    // Load URL state first
    loadURLState();

    // Apply language class to body
    document.body.classList.toggle('lang-cn', CONFIG.language === 'cn');

    if (elements.zoomSlider) {
        elements.zoomSlider.min = MIN_YEAR_HEIGHT;
        elements.zoomSlider.max = MAX_YEAR_HEIGHT;
        elements.zoomSlider.value = CONFIG.yearHeight;
    }
    if (elements.zoomValue) {
        elements.zoomValue.textContent = `${CONFIG.yearHeight.toFixed(2)} px/yr`;
    }

    // Update UI to reflect loaded state
    if (elements.searchInput && CONFIG.searchQuery) {
        elements.searchInput.value = CONFIG.searchQuery;
    }
    if (elements.eventsCheckbox) {
        elements.eventsCheckbox.checked = CONFIG.showEvents;
    }
    if (elements.connectionsToggle) {
        elements.connectionsToggle.checked = CONFIG.showConnections;
    }
    if (elements.erasToggle) {
        elements.erasToggle.checked = CONFIG.showEraBackgrounds;
    }

    // Update language buttons
    elements.langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === CONFIG.language);
    });

    // Update region checkboxes
    elements.regionCheckboxes.forEach(checkbox => {
        const region = checkbox.dataset.region;
        if (region && CONFIG.visibleRegions.hasOwnProperty(region)) {
            checkbox.checked = CONFIG.visibleRegions[region];
        }
    });

    renderYearScale();
    renderTimeline();
    renderEvents();
    renderLegend();

    // Panel close
    elements.panelClose?.addEventListener('click', hidePanel);

    // Language buttons
    elements.langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
            updateURLState();
        });
    });

    // Events toggle
    elements.eventsCheckbox?.addEventListener('change', e => {
        toggleEvents(e.target.checked);
        updateURLState();
    });

    // Region checkboxes
    elements.regionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', e => {
            toggleRegion(e.target.dataset.region, e.target.checked);
            updateURLState();
        });
    });

    // Zoom controls
    elements.zoomIn?.addEventListener('click', () => { zoomIn(); updateURLState(); });
    elements.zoomOut?.addEventListener('click', () => { zoomOut(); updateURLState(); });
    elements.zoomReset?.addEventListener('click', () => { resetZoom(); updateURLState(); });
    elements.zoomSlider?.addEventListener('input', e => { handleZoomSlider(e); updateURLState(); });

    // Search functionality
    if (elements.searchInput) {
        let searchTimeout;
        elements.searchInput.addEventListener('input', e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => handleSearch(e.target.value), 300);
        });

        elements.searchInput.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                clearSearch();
                elements.searchInput.blur();
            }
        });
    }
    elements.searchClear?.addEventListener('click', clearSearch);

    // Connections toggle
    elements.connectionsToggle?.addEventListener('change', e => toggleConnections(e.target.checked));

    // Eras toggle
    elements.erasToggle?.addEventListener('change', e => toggleEras(e.target.checked));

    // Minimap
    if (elements.minimap) {
        elements.minimap.addEventListener('click', handleMinimapClick);
    }

    // Update minimap on scroll
    elements.timelineContainer?.addEventListener('scroll', () => {
        updateMinimap();
    });

    // Keyboard navigation
    setupKeyboardNavigation();

    // Touch gestures
    setupTouchGestures();

    // Year cursor tracking
    setupYearCursor();

    // Zoom presets
    setupZoomPresets();

    // Double-click to zoom
    setupDoubleClickZoom();

    // Legend toggle
    setupLegendToggle();

    // New feature setups
    setupJumpToYear();
    setupDarkMode();
    setupFullPageMode();
    setupExport();
    setupShare();
    setupCompareMode();
    setupContemporaryHighlight();
    setupSmoothEraNavigation();
    setupCategoryFilter();
    setupHelpDialog();

    // Render connection lines and global events
    renderConnectionLines();
    renderGlobalEvents();

    // Apply staggered animation
    setTimeout(applyStaggeredAnimation, 100);

    // Escape key to close panel
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { hidePanel(); hideTooltip(); elements.comparePanel?.classList.remove('visible'); }
        if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); updateURLState(); }
        if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); updateURLState(); }
        if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); resetZoom(); updateURLState(); }
    });

    // Initial minimap update
    setTimeout(updateMinimap, 100);

    console.log('World History Timeline - 3000 BC to 2000 AD');
    console.log('Features: Search, Minimap, Keyboard Nav, URL State, Connections, Era Backgrounds, Year Cursor, Zoom Presets, Era Navigation, Jump to Year, Dark Mode, Export, Compare Mode, Touch Gestures');
}

document.addEventListener('DOMContentLoaded', init);
