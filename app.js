/**
 * World History Timeline
 * Covers 3000 BC - 2000 AD across all major civilizations
 * Layered/stacked regions with toggle visibility
 * Enhanced with search, mini-map, keyboard nav, URL state, and more
 */

const CONFIG = {
    timelineStart: -3000,  // 3000 BC
    timelineEnd: 2000,     // 2000 AD
    yearHeight: 0.25,      // pixels per year (fits entire 5000 years on screen)
    baseColumnWidth: 55,
    language: 'en',
    showEvents: false,
    showConnections: true,
    showEraBackgrounds: true,
    compareMode: false,
    compareRegions: [],
    searchQuery: '',
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
    goryeo: { en: "Goryeo unified the Korean peninsula and gave Korea its English name. It is known for celadon pottery, the Tripitaka Koreana (Buddhist scriptures carved on woodblocks), and the invention of metal movable type printing.", cn: "高丽统一了朝鲜半岛，Korea这个英文名称就来源于此。高丽以青瓷、高丽大藏经（雕刻在木版上的佛经）和金属活字印刷的发明闻名。" }
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
    // Trade Routes
    { from: 'han_west', to: 'roman_empire', year: -100, type: 'trade', label: 'Silk Road Opens', labelCN: '丝绸之路开通' },
    { from: 'roman_empire', to: 'kushan', year: 100, type: 'trade', label: 'Indian Ocean Trade', labelCN: '印度洋贸易' },
    { from: 'tang', to: 'abbasid', year: 750, type: 'trade', label: 'Silk Road Peak', labelCN: '丝路贸易鼎盛' },
    { from: 'srivijaya', to: 'tang', year: 700, type: 'trade', label: 'Maritime Silk Road', labelCN: '海上丝绸之路' },
    { from: 'mali', to: 'abbasid', year: 1300, type: 'trade', label: 'Trans-Saharan Trade', labelCN: '跨撒哈拉贸易' },
    { from: 'ming', to: 'majapahit', year: 1405, type: 'trade', label: 'Zheng He Voyages', labelCN: '郑和下西洋' },

    // Major Conflicts
    { from: 'achaemenid', to: 'greek_classical', year: -490, type: 'conflict', label: 'Greco-Persian Wars', labelCN: '希波战争' },
    { from: 'tang', to: 'abbasid', year: 751, type: 'conflict', label: 'Battle of Talas', labelCN: '怛罗斯之战' },
    { from: 'mongol_emp', to: 'abbasid', year: 1258, type: 'conquest', label: 'Siege of Baghdad', labelCN: '巴格达之围' },
    { from: 'mongol_emp', to: 'jin_jurchen', year: 1234, type: 'conquest', label: 'Mongol Conquest of Jin', labelCN: '蒙古灭金' },
    { from: 'ming', to: 'joseon', year: 1592, type: 'conflict', label: 'Imjin War', labelCN: '万历朝鲜之役' },
    { from: 'ottoman', to: 'byzantine', year: 1453, type: 'conquest', label: 'Fall of Constantinople', labelCN: '君士坦丁堡陷落' },
    { from: 'qing', to: 'mongol_emp', year: 1635, type: 'conquest', label: 'Qing Subjugates Mongolia', labelCN: '清朝统一蒙古' },
    { from: 'roman_empire', to: 'parthia', year: 53, type: 'conflict', label: 'Battle of Carrhae', labelCN: '卡莱战役' },

    // Colonial Conquests
    { from: 'aztec', to: 'roman_empire', year: 1521, type: 'conquest', label: 'Spanish Conquest', labelCN: '西班牙征服阿兹特克' },
    { from: 'inca', to: 'roman_empire', year: 1533, type: 'conquest', label: 'Conquest of Peru', labelCN: '秘鲁征服' },
    { from: 'mughal', to: 'british_raj', year: 1757, type: 'conquest', label: 'Battle of Plassey', labelCN: '普拉西战役' },

    // Succession/Transformation
    { from: 'mongol_emp', to: 'yuan', year: 1271, type: 'succession', label: 'Yuan Founded', labelCN: '元朝建立' },
    { from: 'roman_empire', to: 'byzantine', year: 395, type: 'succession', label: 'Empire Splits', labelCN: '罗马帝国分裂' },
    { from: 'rashidun', to: 'umayyad', year: 661, type: 'succession', label: 'Umayyad Caliphate', labelCN: '倭马亚王朝建立' },
    { from: 'umayyad', to: 'abbasid', year: 750, type: 'succession', label: 'Abbasid Revolution', labelCN: '阿拔斯革命' },

    // Cultural Exchange
    { from: 'tang', to: 'unified_silla', year: 650, type: 'cultural', label: 'Buddhism Spreads', labelCN: '佛教传播' },
    { from: 'tang', to: 'nara', year: 710, type: 'cultural', label: 'Japan Adopts Chinese System', labelCN: '日本学习唐制' },
    { from: 'gupta', to: 'srivijaya', year: 500, type: 'cultural', label: 'Hinduism Spreads', labelCN: '印度教传播' },
    { from: 'khmer', to: 'dai_viet', year: 1471, type: 'conflict', label: 'Cham-Viet Wars', labelCN: '占城战争' },
    { from: 'srivijaya', to: 'chola', year: 1025, type: 'conflict', label: 'Chola Raids', labelCN: '朱罗远征' }
];

// Major Historical Events
const HISTORICAL_EVENTS = [
    // Inventions & Discoveries
    { year: -3000, label: 'Writing Invented', labelCN: '文字发明', region: 'middleEast', type: 'invention' },
    { year: -2600, label: 'Great Pyramid Built', labelCN: '大金字塔建成', region: 'africa', type: 'construction' },
    { year: -1754, label: "Hammurabi's Code", labelCN: '汉谟拉比法典', region: 'middleEast', type: 'cultural' },
    { year: -551, label: 'Confucius Born', labelCN: '孔子诞生', region: 'eastAsia', type: 'cultural' },
    { year: -508, label: 'Athenian Democracy', labelCN: '雅典民主制', region: 'europe', type: 'political' },
    { year: -221, label: 'China Unified', labelCN: '秦统一中国', region: 'eastAsia', type: 'political' },
    { year: -27, label: 'Roman Empire Begins', labelCN: '罗马帝国建立', region: 'europe', type: 'political' },
    { year: 105, label: 'Paper Invented', labelCN: '造纸术发明', region: 'eastAsia', type: 'invention' },
    { year: 330, label: 'Constantinople Founded', labelCN: '君士坦丁堡建立', region: 'europe', type: 'construction' },
    { year: 476, label: 'Fall of Rome', labelCN: '西罗马帝国灭亡', region: 'europe', type: 'political' },
    { year: 622, label: 'Islamic Calendar Begins', labelCN: '伊斯兰历元年', region: 'middleEast', type: 'cultural' },
    { year: 868, label: 'First Printed Book', labelCN: '最早印刷书籍', region: 'eastAsia', type: 'invention' },
    { year: 1054, label: 'Great Schism', labelCN: '东西教会分裂', region: 'europe', type: 'cultural' },
    { year: 1215, label: 'Magna Carta', labelCN: '大宪章', region: 'europe', type: 'political' },
    { year: 1347, label: 'Black Death Arrives', labelCN: '黑死病爆发', region: 'europe', type: 'disaster' },
    { year: 1440, label: 'Printing Press', labelCN: '活字印刷术', region: 'europe', type: 'invention' },
    { year: 1492, label: 'Columbus Reaches Americas', labelCN: '哥伦布到达美洲', region: 'americas', type: 'exploration' },
    { year: 1517, label: 'Protestant Reformation', labelCN: '宗教改革', region: 'europe', type: 'cultural' },
    { year: 1687, label: 'Newton\'s Principia', labelCN: '牛顿《原理》', region: 'europe', type: 'invention' },
    { year: 1776, label: 'American Independence', labelCN: '美国独立', region: 'americas', type: 'political' },
    { year: 1789, label: 'French Revolution', labelCN: '法国大革命', region: 'europe', type: 'political' },
    { year: 1839, label: 'Opium War Begins', labelCN: '鸦片战争', region: 'eastAsia', type: 'conflict' },
    { year: 1868, label: 'Meiji Restoration', labelCN: '明治维新', region: 'eastAsia', type: 'political' },
    { year: 1914, label: 'World War I', labelCN: '第一次世界大战', region: 'europe', type: 'conflict' },
    { year: 1939, label: 'World War II', labelCN: '第二次世界大战', region: 'europe', type: 'conflict' },
    { year: 1945, label: 'United Nations Founded', labelCN: '联合国成立', region: 'americas', type: 'political' },
    { year: 1969, label: 'Moon Landing', labelCN: '人类登月', region: 'americas', type: 'invention' },
    { year: 1991, label: 'Soviet Union Dissolves', labelCN: '苏联解体', region: 'europe', type: 'political' }
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
            { id: "n_dynasties", name: "N. Dynasties", nameCN: "北朝", start: 534, end: 581, slot: 0, width: 1, color: '#9BA5B0' },
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
            { id: "s_dynasties", name: "S. Dynasties", nameCN: "南朝", start: 420, end: 589, slot: 1, width: 1, color: '#8BA4B8' },
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
            { id: "elam_akkad", name: "Elam", nameCN: "埃兰", start: -2334, end: -2154, slot: 2, width: 1, color: '#8B4513' },
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

    let step = 100;
    if (CONFIG.yearHeight < 0.5) step = 1000;
    else if (CONFIG.yearHeight < 1) step = 500;
    else if (CONFIG.yearHeight < 2) step = 250;
    else if (CONFIG.yearHeight < 4) step = 200;
    else if (CONFIG.yearHeight > 8) step = 50;

    for (let year = CONFIG.timelineStart; year <= CONFIG.timelineEnd; year += step) {
        const mark = document.createElement('div');
        mark.className = year % (step * 2) === 0 ? 'year-mark century' : 'year-mark';
        mark.style.top = `${yearToY(year)}px`;
        mark.textContent = formatYear(year);
        elements.yearScale.appendChild(mark);
    }

    elements.yearScale.style.height = `${totalHeight}px`;
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

    elements.timelineGrid.style.height = `${totalHeight}px`;
    elements.timelineGrid.style.width = `${(totalSlots + 2) * CONFIG.baseColumnWidth}px`;

    // Render era backgrounds
    if (CONFIG.showEraBackgrounds) {
        renderEraBackgrounds(totalSlots);
    }

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (!region) return;

        renderRegionHeader(region, regionId, currentSlotOffset);

        region.entities.forEach(entity => {
            // Filter by search query
            if (CONFIG.searchQuery) {
                const query = CONFIG.searchQuery.toLowerCase();
                const matchesName = entity.name.toLowerCase().includes(query);
                const matchesNameCN = (entity.nameCN || '').toLowerCase().includes(query);
                const matchesRulers = entity.rulers && entity.rulers.some(r => r.toLowerCase().includes(query));
                if (!matchesName && !matchesNameCN && !matchesRulers) {
                    return; // Skip non-matching entities
                }
            }
            renderEntity(entity, regionId, currentSlotOffset);
        });

        currentSlotOffset += region.slotEnd + 1;
    });

    // Render connections after all entities
    if (CONFIG.showConnections) {
        renderConnections();
    }

    // Update minimap
    updateMinimap();
}

function renderEraBackgrounds(totalSlots) {
    const gridWidth = (totalSlots + 2) * CONFIG.baseColumnWidth;

    HISTORICAL_ERAS.forEach(era => {
        const top = yearToY(era.start) + 35;
        const height = yearToY(era.end) - yearToY(era.start);

        const eraDiv = document.createElement('div');
        eraDiv.className = 'era-background';
        eraDiv.style.cssText = `
            position: absolute;
            top: ${top}px;
            left: 0;
            width: ${gridWidth}px;
            height: ${height}px;
            background: ${era.color};
            pointer-events: none;
            z-index: 0;
        `;

        // Era label on left side
        const label = document.createElement('div');
        label.className = 'era-label';
        label.style.cssText = `
            position: absolute;
            left: 5px;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            transform-origin: left center;
            font-family: 'Cinzel', serif;
            font-size: 10px;
            color: rgba(0,0,0,0.25);
            white-space: nowrap;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        `;
        label.textContent = CONFIG.language === 'cn' ? era.nameCN : era.name;
        eraDiv.appendChild(label);

        elements.timelineGrid.appendChild(eraDiv);
    });
}

function renderRegionHeader(region, regionId, slotOffset) {
    const colors = {
        eastAsia: '#C41E3A',
        europe: '#4169E1',
        middleEast: '#CD853F',
        southAsia: '#FF8C00',
        centralAsia: '#708090',
        africa: '#D2691E',
        americas: '#2E8B57',
        southeastAsia: '#9932CC'
    };

    const totalHeight = yearToY(CONFIG.timelineEnd);
    const color = colors[regionId];

    // Region separator line (vertical)
    if (slotOffset > 0) {
        const separator = document.createElement('div');
        separator.className = 'region-separator';
        separator.style.cssText = `
            position: absolute;
            top: 35px;
            left: ${slotOffset * CONFIG.baseColumnWidth - 2}px;
            width: 4px;
            height: ${totalHeight - 35}px;
            background: linear-gradient(180deg,
                ${color}40 0%,
                ${color}20 10%,
                ${color}08 50%,
                ${color}20 90%,
                ${color}40 100%
            );
            pointer-events: none;
        `;
        elements.timelineGrid.appendChild(separator);
    }

    // Header bar
    const header = document.createElement('div');
    header.className = 'region-header';
    header.style.cssText = `
        position: absolute;
        top: 0;
        left: ${slotOffset * CONFIG.baseColumnWidth}px;
        width: ${region.slotEnd * CONFIG.baseColumnWidth}px;
        height: 32px;
        background: linear-gradient(90deg, ${color}50, ${color}20, transparent);
        border-bottom: 3px solid ${color};
        border-left: 3px solid ${color};
        display: flex;
        align-items: center;
        padding-left: 12px;
        font-family: 'Cinzel', serif;
        font-size: 0.85rem;
        color: #1A1408;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-shadow: 0 1px 0 rgba(255,255,255,0.5);
        z-index: 10;
    `;
    header.textContent = getName(region);
    elements.timelineGrid.appendChild(header);
}

function renderEntity(entity, regionId, slotOffset) {
    const block = document.createElement('div');
    block.className = 'dynasty-block';

    const top = yearToY(entity.start) + 35; // Account for header
    const height = Math.max(yearToY(entity.end) - yearToY(entity.start), 8);
    const left = (slotOffset + entity.slot) * CONFIG.baseColumnWidth + 1;

    // Width fills the entire slot with minimal gap (1px each side)
    // This creates the dense, territory-based visualization
    const baseWidth = entity.width * CONFIG.baseColumnWidth - 2;
    const width = baseWidth;

    // Store position for connections
    entityPositions[entity.id] = {
        top: top,
        left: left,
        width: Math.max(width, 28),
        height: height,
        centerX: left + Math.max(width, 28) / 2,
        centerY: top + height / 2
    };

    // Darken color slightly for better contrast
    const baseColor = entity.color;

    // Add highlight for search matches
    const isSearchMatch = CONFIG.searchQuery && (
        entity.name.toLowerCase().includes(CONFIG.searchQuery.toLowerCase()) ||
        (entity.nameCN || '').toLowerCase().includes(CONFIG.searchQuery.toLowerCase())
    );

    block.style.cssText = `
        top: ${top}px;
        left: ${left}px;
        width: ${Math.max(width, 28)}px;
        height: ${height}px;
        background: linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 100%);
        min-height: 8px;
        ${isSearchMatch ? 'outline: 3px solid var(--gold-leaf); outline-offset: 2px;' : ''}
    `;

    const content = document.createElement('div');
    content.className = 'dynasty-content';

    // Add category class for styling
    if (entity.category && ENTITY_CATEGORIES[entity.category]) {
        block.classList.add(`category-${entity.category}`);
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'dynasty-name';
    nameEl.textContent = getName(entity);
    content.appendChild(nameEl);

    if (height > 40) {
        const yearsEl = document.createElement('div');
        yearsEl.className = 'dynasty-years';
        yearsEl.textContent = `${formatYear(entity.start)}`;
        content.appendChild(yearsEl);
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

function renderEvents() {
    elements.eventsOverlay.innerHTML = '';
    if (!CONFIG.showEvents) return;

    const visibleRegions = getVisibleRegions();

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (!region || !region.events) return;

        region.events.forEach(event => {
            const marker = document.createElement('div');
            marker.className = 'event-marker';
            marker.style.top = `${yearToY(event.year)}px`;

            const tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            tooltip.innerHTML = `
                <span class="event-year">${formatYear(event.year)}</span>
                <span class="event-text">${event.event}</span>
            `;
            marker.appendChild(tooltip);

            elements.eventsOverlay.appendChild(marker);
        });
    });
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

    tooltip.querySelector('.tooltip-title').textContent = block.dataset.name;
    tooltip.querySelector('.tooltip-title-cn').textContent = block.dataset.nameCn;
    tooltip.querySelector('.tooltip-dates').textContent =
        `${formatYear(parseInt(block.dataset.start))} — ${formatYear(parseInt(block.dataset.end))}`;
    tooltip.querySelector('.tooltip-duration').textContent =
        `${parseInt(block.dataset.end) - parseInt(block.dataset.start)} years`;

    const rect = block.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
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
    const category = entity.category ? ENTITY_CATEGORIES[entity.category] : null;
    const description = HISTORICAL_DESCRIPTIONS[entity.id];
    const wikiUrl = getWikiUrl(entity);

    let html = `
        <h2>${entity.name}</h2>
        <h3>${entity.nameCN || ''}</h3>
        ${category ? `<p class="entity-category"><span class="category-badge" style="background: ${category.color}">${CONFIG.language === 'cn' ? category.labelCN : category.label}</span></p>` : ''}
        <p><strong>${CONFIG.language === 'cn' ? '时期' : 'Period'}:</strong> ${formatYear(entity.start)} — ${formatYear(entity.end)}</p>
        <p><strong>${CONFIG.language === 'cn' ? '持续' : 'Duration'}:</strong> ${entity.end - entity.start} ${CONFIG.language === 'cn' ? '年' : 'years'}</p>
    `;

    // Add historical background description
    if (description) {
        html += `
            <div class="description-section">
                <h4>${CONFIG.language === 'cn' ? '历史背景' : 'Historical Background'}</h4>
                <p class="entity-description">${CONFIG.language === 'cn' ? description.cn : description.en}</p>
            </div>
        `;
    }

    // Add notable rulers if available
    if (entity.rulers && entity.rulers.length > 0) {
        html += `
            <div class="rulers-section">
                <h4>${CONFIG.language === 'cn' ? '著名统治者' : 'Notable Rulers'}</h4>
                <ul class="rulers-list">
                    ${entity.rulers.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Find connections involving this entity
    const relatedConnections = CONNECTIONS.filter(c => c.from === entity.id || c.to === entity.id);
    if (relatedConnections.length > 0) {
        html += `
            <div class="connections-section">
                <h4>${CONFIG.language === 'cn' ? '历史联系' : 'Historical Connections'}</h4>
                <ul class="connections-list">
                    ${relatedConnections.map(c => {
                        const typeLabel = c.type === 'trade' ? 'Trade: ' : c.type === 'conflict' ? 'Conflict: ' : c.type === 'conquest' ? 'Conquest: ' : '';
                        return `<li><span class="connection-type">${typeLabel}</span>${CONFIG.language === 'cn' ? c.labelCN : c.label} (${formatYear(c.year)})</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }

    // Add Wikipedia link
    html += `
        <div class="wiki-section">
            <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="wiki-link">
                ${CONFIG.language === 'cn' ? '在维基百科上了解更多' : 'Read more on Wikipedia'}
            </a>
        </div>
    `;

    elements.panelContent.innerHTML = html;
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
    elements.langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    renderTimeline();
    renderEvents();
    renderLegend();
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
    if (elements.zoomValue) elements.zoomValue.textContent = `${newYearHeight} px/yr`;

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
    // Remove existing connections
    document.querySelectorAll('.connection-line').forEach(el => el.remove());

    CONNECTIONS.forEach(conn => {
        const fromPos = entityPositions[conn.from];
        const toPos = entityPositions[conn.to];

        if (!fromPos || !toPos) return; // Entities not visible

        // Create SVG line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('connection-line');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            overflow: visible;
        `;

        const connectionY = yearToY(conn.year) + 35;

        // Draw bezier curve
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = fromPos.centerX;
        const endX = toPos.centerX;
        const midX = (startX + endX) / 2;

        // Create a curved path
        const d = `M ${startX} ${connectionY} Q ${midX} ${connectionY - 30} ${endX} ${connectionY}`;

        const colors = {
            trade: '#228B22',
            conflict: '#DC143C',
            conquest: '#8B0000',
            succession: '#4169E1'
        };

        path.setAttribute('d', d);
        path.setAttribute('stroke', colors[conn.type] || '#708090');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', conn.type === 'trade' ? '5,5' : 'none');
        path.setAttribute('opacity', '0.6');

        svg.appendChild(path);

        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', connectionY - 35);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '9');
        text.setAttribute('fill', colors[conn.type] || '#708090');
        text.textContent = CONFIG.language === 'cn' ? conn.labelCN : conn.label;
        svg.appendChild(text);

        elements.timelineGrid.appendChild(svg);
    });
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

function updateMinimap() {
    if (!elements.minimap) return;

    const container = elements.timelineContainer;
    if (!container) return;

    const totalHeight = yearToY(CONFIG.timelineEnd);
    const viewportHeight = container.clientHeight;
    const scrollTop = container.scrollTop;

    // Calculate minimap dimensions
    const minimapHeight = elements.minimap.clientHeight || 200;
    const scale = minimapHeight / totalHeight;

    // Update viewport indicator
    if (elements.minimapViewport) {
        const vpHeight = Math.max(viewportHeight * scale, 10);
        const vpTop = scrollTop * scale;

        elements.minimapViewport.style.cssText = `
            position: absolute;
            top: ${vpTop}px;
            left: 0;
            right: 0;
            height: ${vpHeight}px;
            background: rgba(201, 162, 39, 0.3);
            border: 1px solid var(--gold-leaf);
            pointer-events: none;
            transition: top 0.1s;
        `;
    }

    // Render mini blocks
    elements.minimap.querySelectorAll('.minimap-block').forEach(el => el.remove());

    const visibleRegions = getVisibleRegions();
    let slotOffset = 0;
    let totalSlots = 0;

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (region) totalSlots += region.slotEnd + 1;
    });

    const minimapWidth = elements.minimap.clientWidth || 60;
    const slotWidth = minimapWidth / (totalSlots || 1);

    visibleRegions.forEach(regionId => {
        const region = WORLD_HISTORY[regionId];
        if (!region) return;

        region.entities.forEach(entity => {
            const block = document.createElement('div');
            block.className = 'minimap-block';

            const top = (yearToY(entity.start) + 35) * scale;
            const height = Math.max((yearToY(entity.end) - yearToY(entity.start)) * scale, 1);
            const left = (slotOffset + entity.slot) * slotWidth;
            const width = Math.max(entity.width * slotWidth, 1);

            block.style.cssText = `
                position: absolute;
                top: ${top}px;
                left: ${left}px;
                width: ${width}px;
                height: ${height}px;
                background: ${entity.color};
                opacity: 0.7;
            `;

            elements.minimap.appendChild(block);
        });

        slotOffset += region.slotEnd + 1;
    });
}

function handleMinimapClick(e) {
    if (!elements.minimap || !elements.timelineContainer) return;

    const rect = elements.minimap.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minimapHeight = elements.minimap.clientHeight;
    const totalHeight = yearToY(CONFIG.timelineEnd);

    const scrollTo = (clickY / minimapHeight) * totalHeight;
    elements.timelineContainer.scrollTop = scrollTo - elements.timelineContainer.clientHeight / 2;
}

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
    if (!elements.connectionsSvg || !CONFIG.showConnections) {
        if (elements.connectionsSvg) elements.connectionsSvg.innerHTML = '';
        return;
    }

    const svg = elements.connectionsSvg;
    svg.innerHTML = '';

    // Set SVG size
    const totalHeight = (CONFIG.timelineEnd - CONFIG.timelineStart) * CONFIG.yearHeight;
    svg.setAttribute('height', totalHeight);

    CONNECTIONS.forEach(conn => {
        // Find entities
        const fromEntity = findEntityById(conn.from);
        const toEntity = findEntityById(conn.to);

        if (!fromEntity || !toEntity) return;

        // Check if regions are visible
        const fromRegion = getEntityRegion(conn.from);
        const toRegion = getEntityRegion(conn.to);
        if (!CONFIG.visibleRegions[fromRegion] || !CONFIG.visibleRegions[toRegion]) return;

        // Get positions
        const fromPos = entityPositions[conn.from];
        const toPos = entityPositions[conn.to];
        if (!fromPos || !toPos) return;

        const y = yearToY(conn.year);

        // Create curved path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const fromX = fromPos.centerX || (fromPos.left + fromPos.width / 2);
        const toX = toPos.centerX || (toPos.left + toPos.width / 2);
        const midX = (fromX + toX) / 2;

        const d = `M ${fromX} ${y}
                   Q ${midX} ${y - 30} ${toX} ${y}`;

        path.setAttribute('d', d);
        path.setAttribute('class', `connection-line ${conn.type}`);
        path.setAttribute('data-label', CONFIG.language === 'cn' ? conn.labelCN : conn.label);

        // Add tooltip on hover
        path.style.pointerEvents = 'stroke';
        path.addEventListener('mouseenter', (e) => {
            showConnectionTooltip(e, conn);
        });
        path.addEventListener('mouseleave', hideTooltip);

        svg.appendChild(path);
    });
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
        const marker = document.createElement('div');
        marker.className = `global-event-marker ${event.type}`;
        marker.style.top = `${yearToY(event.year)}px`;
        marker.title = `${formatYear(event.year)}: ${CONFIG.language === 'cn' ? event.labelCN : event.label}`;
        marker.style.animationDelay = `${index * 0.02}s`;

        marker.addEventListener('click', () => {
            showEventDetail(event);
        });

        elements.globalEventsTrack.appendChild(marker);
    });
}

function showEventDetail(event) {
    const html = `
        <h2>${event.label}</h2>
        <h3>${event.labelCN}</h3>
        <p><strong>${CONFIG.language === 'cn' ? '年份' : 'Year'}:</strong> ${formatYear(event.year)}</p>
        <p><strong>${CONFIG.language === 'cn' ? '类型' : 'Type'}:</strong> ${event.type}</p>
        <p><strong>${CONFIG.language === 'cn' ? '地区' : 'Region'}:</strong> ${event.region}</p>
    `;
    elements.panelContent.innerHTML = html;
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
    if (!container) {
        console.warn('Timeline container not found');
        return;
    }

    const y = yearToY(year);
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollTarget = Math.max(0, containerTop + y - viewportHeight / 2);

    console.log(`Scrolling to year ${year}: y=${y}, scrollTarget=${scrollTarget}`);

    window.scrollTo({
        top: scrollTarget,
        behavior: smooth ? 'smooth' : 'instant'
    });
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

    elements.compareBtn.addEventListener('click', () => {
        // Populate options
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
            showToast('Please select exactly 2 regions');
            return;
        }

        // Hide all regions except selected
        Object.keys(CONFIG.visibleRegions).forEach(region => {
            CONFIG.visibleRegions[region] = selectedRegions.includes(region);
        });

        // Update checkboxes
        elements.regionCheckboxes.forEach(checkbox => {
            checkbox.checked = CONFIG.visibleRegions[checkbox.dataset.region];
        });

        renderTimeline();
        renderEvents();
        renderLegend();
        renderConnectionLines();
        elements.comparePanel.classList.remove('visible');
        showToast(`Comparing ${selectedRegions.join(' & ')}`);
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
        showToast('Preparing export...');

        try {
            // Use html2canvas if available, otherwise simple screenshot
            if (typeof html2canvas !== 'undefined') {
                const canvas = await html2canvas(elements.timelineGrid, {
                    backgroundColor: '#F5E6C8',
                    scale: 2
                });

                const link = document.createElement('a');
                link.download = `world-history-timeline-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Timeline exported!');
            } else {
                // Fallback - print dialog
                window.print();
                showToast('Use Print dialog to save as PDF');
            }
        } catch (err) {
            showToast('Export failed - try Print (Ctrl+P)');
            console.error('Export error:', err);
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

    // Load URL state first
    loadURLState();

    if (elements.zoomSlider) {
        elements.zoomSlider.min = MIN_YEAR_HEIGHT;
        elements.zoomSlider.max = MAX_YEAR_HEIGHT;
        elements.zoomSlider.value = CONFIG.yearHeight;
    }
    if (elements.zoomValue) {
        elements.zoomValue.textContent = `${CONFIG.yearHeight} px/yr`;
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
