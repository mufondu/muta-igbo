// ─── Igbo History: Verified Facts ────────────────────────────────────────────
// Sources: Wikipedia (Igbo people, Kingdom of Nri), archaeological records,
// Thurstan Shaw excavations, Onwuejeogwu (1981), Afigbo (1972)

export interface HistoryFact {
  id: string;
  era: string;
  year: string;
  title: string;
  igboTitle: string;
  body: string;
  emoji: string;
  source: string;
}

export interface HistorySection {
  id: string;
  title: string;
  igboTitle: string;
  emoji: string;
  facts: HistoryFact[];
}

export const HISTORY_SECTIONS: HistorySection[] = [
  {
    id: 'origins',
    title: 'Origins of the Igbo People',
    igboTitle: 'Ihe Banyere Ọdịnaala Igbo',
    emoji: '🌍',
    facts: [
      {
        id: 'pottery',
        era: 'Stone Age',
        year: 'c. 3,000 – 2,500 BC',
        title: 'Ancient Pottery at Nsukka and Afikpo',
        igboTitle: 'Ite Ụrọ Ochie',
        emoji: '🏺',
        body: 'Archaeological excavations in the 1970s uncovered pottery dated to around 3,000 to 2,500 BC at Nsukka and Afikpo, in the heart of Igboland. These findings show similarities with later Igbo pottery traditions, placing the Igbo among the oldest settled peoples in sub-Saharan Africa.',
        source: 'Thurstan Shaw, Discovering Nigeria\'s Past (1975)',
      },
      {
        id: 'iron',
        era: 'Iron Age',
        year: 'c. 2,000 BC – 750 BC',
        title: 'Iron Smelting at Lejja and Opi',
        igboTitle: 'Igwe Igwe na Opi na Lejja',
        emoji: '⚒️',
        body: 'Evidence of iron smelting has been found at Lejja in the Nsukka region dating to approximately 2,000 BC, and at Opi dating to 750 BC. This makes the Igbo people among the earliest iron smelters in all of Africa, predating many other African civilisations in metalwork.',
        source: 'F.N. Anozie, Early Iron Technology in Igboland (1979)',
      },
      {
        id: 'eri',
        era: 'Founding',
        year: 'c. 948 AD',
        title: 'Eri Settles the Anambra Valley',
        igboTitle: 'Eri Biri na Ọ Wụ Anambra',
        emoji: '👑',
        body: 'According to Igbo oral tradition and historical records, Eri, described as a sky being sent by Chukwu (the Supreme God), settled at the confluence of the Ezu and Omambala rivers in present-day Aguleri, Anambra State. He brought societal order, agriculture, and spiritual authority to the people of the Anambra valley. He is regarded as the ancestor of many Igbo clans.',
        source: 'Onwuejeogwu, An Igbo Civilisation: Nri Kingdom and Hegemony (1981)',
      },
      {
        id: 'aguleri',
        era: 'Founding',
        year: 'c. 948 AD',
        title: 'Aguleri: Ancestral Home of Ndi Igbo',
        igboTitle: 'Aguleri: Ulo Nna Ndi Igbo',
        emoji: '🏡',
        body: 'Aguleri, where Eri first settled, is recognised as the ancestral home of the Igbo people. Eri\'s first son Agulu (founder of Aguleri) remained at the family home while his son Menri migrated to establish the Kingdom of Nri. By Igbo tradition, no Nri man may break the kolanut where an Aguleri man is present without his permission, acknowledging Aguleri\'s seniority.',
        source: 'Edmonton Igbo School Historical Records; Vanguard Nigeria (2014)',
      },
    ],
  },
  {
    id: 'nri_kingdom',
    title: 'The Kingdom of Nri',
    igboTitle: 'Ọràézè Nri',
    emoji: '🏛️',
    facts: [
      {
        id: 'nri_founded',
        era: 'Medieval',
        year: 'c. 900 – 1043 AD',
        title: 'The Kingdom of Nri is Established',
        igboTitle: 'Ọ Bụ Mgbe Ha Tọọle Ọràézè Nri',
        emoji: '🌿',
        body: 'Menri, son of Eri, migrated from Aguleri and established the Kingdom of Nri (Ọràézè Nri) in what is now Anambra State. The first Eze Nri (priest-king) Ìfikuánim began his reign in 1043 AD. The kingdom grew into one of the most influential states in Igboland, spreading its authority through peaceful ritual conversion rather than military force.',
        source: 'Wikipedia: Kingdom of Nri; Onwuejeogwu (1981)',
      },
      {
        id: 'igbo_ukwu',
        era: 'Medieval',
        year: '9th – 10th century AD',
        title: 'The Igbo-Ukwu Bronze Treasures',
        igboTitle: 'Àjà Ọla Igbo-Ukwu',
        emoji: '🏆',
        body: 'Royal burial sites at Igbo-Ukwu, south of Nri, were excavated and found to contain spectacular bronze artefacts dating to the 9th and 10th centuries AD. These are the oldest bronzes ever discovered in Nigeria, older than the famous bronzes of Ife and Benin. They demonstrate sophisticated lost-wax casting techniques and artistic mastery of extraordinary detail, depicting birds, snails, chameleons, and natural forms.',
        source: 'Thurstan Shaw, Igbo-Ukwu: An Account of Archaeological Discoveries (1970)',
      },
      {
        id: 'nri_democracy',
        era: 'Medieval',
        year: 'c. 900 – 1900 AD',
        title: 'A Republic Before Republics',
        igboTitle: 'Ọchịchọ Onye Onye Na Ya',
        emoji: '🤝',
        body: 'Long before modern democracy, the Igbo people governed themselves through republican councils of elders. Most Igbo communities had no king. Power was shared among title holders, age grades, and open assemblies. The Portuguese who arrived in the 15th century noted and documented this system. Nri itself expanded not through war but through peaceful oath and ritual — a unique model of governance in African history.',
        source: 'Wikipedia: Igbo people; Encyclopedia.com',
      },
      {
        id: 'nri_calendar',
        era: 'Medieval',
        year: 'c. 900 AD onwards',
        title: 'The Igbo Calendar and Astronomy',
        igboTitle: 'Ọnwa Igbo na Ihe Igwe Elu',
        emoji: '🌙',
        body: 'The Nri priests developed a sophisticated Igbo calendar system. An Igbo week had four days: Eke, Afor, Nkwo, and Ọye (still used today for market days). A month had seven weeks. Thirteen months made a year, with one day added to the last month annually. British anthropologist Northcote Thomas reported in 1910 that Nri priests could name the stars including Orion and the Great Bear, using them to calculate lunar periods and navigate long journeys.',
        source: 'Northcote Thomas, Anthropological Report on Ibo-speaking peoples (1913)',
      },
      {
        id: 'nri_currency',
        era: 'Medieval',
        year: 'c. 900 – 1900 AD',
        title: 'Manilla Currency and Early Banking',
        igboTitle: 'Ego Igbo na Ụlọ Akụ Ochie',
        emoji: '💰',
        body: 'The Nri kingdom used Manillas as currency, bronze or copper armlets that served as legal tender across the region. The Igbo also developed Isusu, a communal savings and loan system still used today across Nigeria. These financial innovations show a sophisticated economy centuries before European colonisation.',
        source: 'Let Africa Speak: The Nri Kingdom (2019)',
      },
      {
        id: 'nri_refuge',
        era: 'Medieval',
        year: 'c. 900 – 1900 AD',
        title: 'A Kingdom That Freed Slaves',
        igboTitle: 'Ọràézè Nri Na-Ahapụ Ndị Ohu',
        emoji: '🕊️',
        body: 'While the trans-Atlantic slave trade devastated much of West Africa, the Kingdom of Nri stood apart. It was a haven for escaped slaves, outcasts, and those rejected by other communities. Any slave who reached Nri territory was declared free. The British labelled Nri as agents of regression because they refused to participate in the slave trade. Nri also had no standing army, making it one of the most peaceful civilisations in African history.',
        source: 'Wikipedia: Kingdom of Nri; dkmngr.com',
      },
    ],
  },
  {
    id: 'colonial',
    title: 'Colonial Era and Resistance',
    igboTitle: 'Oge Ndị Oyibo na Ọgụ Igbo',
    emoji: '⚔️',
    facts: [
      {
        id: 'portuguese',
        era: 'Early Contact',
        year: '15th century',
        title: 'First European Contact: The Portuguese',
        igboTitle: 'Ndị Ọyibo Mbụ: Ndị Portugal',
        emoji: '⛵',
        body: 'The Portuguese were the first Europeans to make contact with the Igbo-speaking peoples in the mid-15th century. For nearly four centuries, the Niger Coast served as a trading zone between European and African merchants. The Igbo became key figures in regional trade, though this period also included the painful era of the trans-Atlantic slave trade.',
        source: 'Encyclopedia.com: Igbo',
      },
      {
        id: 'aro',
        era: 'Pre-colonial',
        year: '17th – 19th century',
        title: 'The Aro Confederacy',
        igboTitle: 'Nzukọ Ndị Aro',
        emoji: '🗺️',
        body: 'The Aro Confederacy, centred at Arochukwu in present-day Abia State, became one of the most powerful Igbo political and commercial networks in the 17th to 19th centuries. The Aro people controlled long-distance trade routes across Igboland and beyond, using the oracle Ibini Ukpabi (the Long Juju of Arochukwu) as a source of spiritual authority and commercial influence.',
        source: 'Wikipedia: Igbo people; Afigbo (1972)',
      },
      {
        id: 'british',
        era: 'Colonial',
        year: '1900 AD',
        title: 'British Colonial Rule Begins',
        igboTitle: 'Oge Ọchịchọ Ndị Bekee',
        emoji: '🏴',
        body: 'The Protectorate of Southern Nigeria, established in 1900, incorporated Igboland. In 1911, British forces dethroned Eze Nri Obalike and forced him to renounce his spiritual power, ending the theocratic authority of the Nri kingdom. Despite this, Igbo communities mounted fierce resistance, most notably the Women\'s War (Ogu Umunwanyi) of 1929, in which Igbo women in Aba organised one of the largest anti-colonial uprisings in Nigeria\'s history.',
        source: 'Wikipedia: Igbo people; Kingdom of Nri',
      },
    ],
  },
  {
    id: 'culture',
    title: 'Igbo Culture and Traditions',
    igboTitle: 'Ọdịnala Igbo',
    emoji: '🎭',
    facts: [
      {
        id: 'odinani',
        era: 'Culture',
        year: 'Ancient to present',
        title: 'Odinani: The Igbo Spiritual System',
        igboTitle: 'Ọdinani Igbo',
        emoji: '🙏🏾',
        body: 'Odinani is the traditional spiritual and religious system of the Igbo people. At its centre is Chukwu, the Supreme Being and creator of all things. Below Chukwu are the Alusi (deities), with Ala (the earth goddess) being among the most important. Ani governs morality, fertility, and the dead. The Igbo also believe in Chi, a personal guardian spirit unique to each person. Odinani shaped Igbo law, governance, art, and daily life for thousands of years.',
        source: 'Wikipedia: Igbo people; Odinani',
      },
      {
        id: 'kolanut',
        era: 'Culture',
        year: 'Ancient to present',
        title: 'Oji: The Sacred Kola Nut',
        igboTitle: 'Oji: Mkpụrụ Ọjị Dị Nsọ',
        emoji: '🌰',
        body: 'The kola nut (Oji) holds sacred significance in Igbo culture. It is offered to guests as a sign of welcome, used in prayers and libations, and shared in important ceremonies. There is a famous Igbo proverb: "Onye wetara oji, wetara ndụ" — "He who brings kola nut brings life." The way the kola nut is broken and shared follows specific protocols that reflect social hierarchy, respect for elders, and spiritual reverence.',
        source: 'Igbo cultural oral tradition',
      },
      {
        id: 'masquerade',
        era: 'Culture',
        year: 'Ancient to present',
        title: 'Mmanwu: The Masquerade Tradition',
        igboTitle: 'Mmanwu Igbo',
        emoji: '🎭',
        body: 'Mmanwu (masquerades) are among the most important cultural and spiritual traditions in Igboland. Masquerades are believed to be ancestral spirits returning from the land of the dead to interact with the living. They appear during important festivals, enforce community laws, settle disputes, and celebrate harvests. Each Igbo community has its own distinct masquerade traditions, costumes, and songs. The Mmanwu tradition is recognised as a living cultural heritage.',
        source: 'Igbo cultural heritage records',
      },
      {
        id: 'isusu',
        era: 'Culture',
        year: 'Ancient to present',
        title: 'Isusu: Communal Savings Tradition',
        igboTitle: 'Isusu: Ịchịkọ Ego Ọnụ',
        emoji: '💰',
        body: 'Isusu is a traditional Igbo rotating credit and savings system. A group of people contribute a fixed amount regularly, and each member takes the full pot in rotation. This system, also known as Esusu across West Africa, predates modern banking by centuries and continues to thrive today. It is built on trust, community accountability, and mutual support — core Igbo values.',
        source: 'Igbo economic history records',
      },
      {
        id: 'new_yam',
        era: 'Culture',
        year: 'Ancient to present',
        title: 'Iri Ji: The New Yam Festival',
        igboTitle: 'Iri Ji Ọhụrụ',
        emoji: '🌾',
        body: 'The New Yam Festival (Iri Ji or Iwa Ji) is one of the most important Igbo celebrations. Yam is the king of crops in Igboland and a symbol of wealth, prosperity, and manhood. The festival marks the end of the farming season and the beginning of harvest. No one eats the new yam until the community celebration, where offerings are made to Ala (the earth goddess) and ancestors. It is celebrated across all Igbo communities with feasting, music, dance, and masquerades.',
        source: 'Igbo agricultural and cultural tradition',
      },
    ],
  },
  {
    id: 'modern',
    title: 'Modern Igbo: Resilience and Achievement',
    igboTitle: 'Ndị Igbo Taa: Ike na Ọganiihu',
    emoji: '🚀',
    facts: [
      {
        id: 'language_spread',
        era: 'Modern',
        year: 'Present',
        title: 'Igbo: One of Africa\'s Major Languages',
        igboTitle: 'Igbo Bụ Otu n\'ime Asụsụ Ukwu Africa',
        emoji: '🌍',
        body: 'The Igbo language is spoken by over 45 million people, making it one of the largest languages in Africa and the world. It belongs to the Niger-Congo language family. Central Igbo serves as a widely taught and understood form of Igbo, while many regional varieties preserve the rich linguistic diversity of Igboland.',
        source: 'Wikipedia: Igbo language',
      },
      {
        id: 'diaspora',
        era: 'Modern',
        year: 'Present',
        title: 'The Igbo Diaspora',
        igboTitle: 'Ndị Igbo n\'ụwa Niile',
        emoji: '✈️',
        body: 'The Igbo diaspora spans every continent. Significant Igbo communities exist in the United Kingdom, United States, Canada, Australia, and across Europe and the Caribbean. Despite living far from home, Igbo diaspora communities maintain their language, culture, and traditions through associations, festivals, and now digital tools like Mụta Igbo. The Igbo proverb captures this: "Onye wetara oji wetara ndụ" — wherever the Igbo go, they carry their identity with them.',
        source: 'Wikipedia: Igbo people',
      },
      {
        id: 'muta_mission',
        era: 'Present',
        year: '2025',
        title: 'Why Mụta Igbo Exists',
        igboTitle: 'Ihe Mere A Wuo Mụta Igbo',
        emoji: '📱',
        body: 'Research shows that children raised in diaspora families are most likely to lose their ancestral language by the second generation. Mụta Igbo was created to address this directly — giving Igbo children in the diaspora and at home a joyful, structured, and authentic path to learning Central Igbo. Every word, story, and lesson in this app is a thread connecting children back to thousands of years of Igbo history and culture.',
        source: 'Mụta Igbo mission statement',
      },
    ],
  },
];

export const getTotalFacts = (): number =>
  HISTORY_SECTIONS.reduce((sum, s) => sum + s.facts.length, 0);