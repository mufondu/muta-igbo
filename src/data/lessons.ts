// ─── Mụta Igbo: Full Lesson Data ─────────────────────────────────────────────

export interface VocabItem {
  igbo: string;
  english: string;
  emoji: string;
  pronunciation?: string; // English respelling, e.g. "n-deh-woh" (source: Wordmastery.org A1/A2)
  audio?: string; // filename in assets/audio/
  example?: string; // example sentence
  partOfSpeech?: 'noun' | 'verb' | 'phrase' | 'letter' | 'number' | 'color' | 'other';
  verified?: boolean;
  source?: string;
  note?: string;
  abstract?: boolean; // true = not depictable; excluded from the picture-matching game
}

export interface LessonSection {
  id: string;
  title: string;
  igboTitle: string;
  items: VocabItem[];
}

export interface Level {
  id: string;         // '7A', '6A', etc.
  level: string;      // display label
  title: string;
  igboTitle: string;
  emoji: string;
  description: string;
  free: boolean;      // false = premium only
  sections: LessonSection[];
}

// ─── LEVEL 7A: Alphabet & Vowels ─────────────────────────────────────────────
const LEVEL_7A: Level = {
  id: '7A', level: 'Level 1', free: true,
  title: 'Alphabet & Sounds',
  igboTitle: 'Mkpụrụ Edemede',
  emoji: '🔤',
  description: 'Learn the Igbo alphabet, vowels and consonants',
  sections: [
    {
      id: 'alphabet', title: 'Igbo Alphabet', igboTitle: 'Mkpụrụ Edemede',
      items: [
        { igbo: 'a', english: 'a (open vowel)', emoji: '🅰️', partOfSpeech: 'letter', verified: true, abstract: true },
        { igbo: 'b', english: 'b (as in ball)', emoji: '🅱️', abstract: true },
        { igbo: 'ch', english: 'ch (as in church)', emoji: '🔡', abstract: true },
        { igbo: 'd', english: 'd (as in door)', emoji: '🔡', abstract: true },
        { igbo: 'e', english: 'e (as in bed)', emoji: '🔡', abstract: true },
        { igbo: 'f', english: 'f (as in fish)', emoji: '🔡', abstract: true },
        { igbo: 'g', english: 'g (as in go)', emoji: '🔡', abstract: true },
        { igbo: 'gb', english: 'gb (unique Igbo sound)', emoji: '🔡', abstract: true },
        { igbo: 'gh', english: 'gh (soft g)', emoji: '🔡', abstract: true },
        { igbo: 'gw', english: 'gw (g + w blend)', emoji: '🔡', abstract: true },
        { igbo: 'h', english: 'h (as in hat)', emoji: '🔡', abstract: true },
        { igbo: 'i', english: 'i (as in see)', emoji: '🔡', abstract: true },
        { igbo: 'ị', english: 'ị (short i, dot below)', emoji: '🔡', abstract: true },
        { igbo: 'j', english: 'j (as in jump)', emoji: '🔡', abstract: true },
        { igbo: 'k', english: 'k (as in kite)', emoji: '🔡', abstract: true },
        { igbo: 'kp', english: 'kp (unique Igbo sound)', emoji: '🔡', abstract: true },
        { igbo: 'kw', english: 'kw (k + w blend)', emoji: '🔡', abstract: true },
        { igbo: 'l', english: 'l (as in love)', emoji: '🔡', abstract: true },
        { igbo: 'm', english: 'm (as in moon)', emoji: '🔡', abstract: true },
        { igbo: 'n', english: 'n (as in night)', emoji: '🔡', abstract: true },
        { igbo: 'nw', english: 'nw (n + w blend)', emoji: '🔡', abstract: true },
        { igbo: 'ny', english: 'ny (as in canyon)', emoji: '🔡', abstract: true },
        { igbo: 'o', english: 'o (as in ore)', emoji: '🔡', abstract: true },
        { igbo: 'ọ', english: 'ọ (open o, dot below)', emoji: '🔡', abstract: true },
        { igbo: 'p', english: 'p (as in pan)', emoji: '🔡', abstract: true },
        { igbo: 'r', english: 'r (as in run)', emoji: '🔡', abstract: true },
        { igbo: 's', english: 's (as in sun)', emoji: '🔡', abstract: true },
        { igbo: 'sh', english: 'sh (as in shoe)', emoji: '🔡', abstract: true },
        { igbo: 't', english: 't (as in top)', emoji: '🔡', abstract: true },
        { igbo: 'u', english: 'u (as in food)', emoji: '🔡', abstract: true },
        { igbo: 'ụ', english: 'ụ (short u, dot below)', emoji: '🔡', abstract: true },
        { igbo: 'v', english: 'v (as in van)', emoji: '🔡', abstract: true },
        { igbo: 'w', english: 'w (as in water)', emoji: '🔡', abstract: true },
        { igbo: 'y', english: 'y (as in yes)', emoji: '🔡', abstract: true },
        { igbo: 'z', english: 'z (as in zebra)', emoji: '🔡', abstract: true },
      ],
    },
    {
      id: 'vowels', title: 'Igbo Vowels', igboTitle: 'Ụdaasụ',
      items: [
        { igbo: 'a', english: 'A — open wide (father)', emoji: '👄', example: 'Akwa — cloth / cry / egg / bridge', abstract: true },
        { igbo: 'e', english: 'E — mid front (bed)', emoji: '👄', example: 'Eze — king / teeth', abstract: true },
        { igbo: 'i', english: 'I — high front (see)', emoji: '👄', example: 'Isi — head', abstract: true },
        { igbo: 'ị', english: 'Ị — short high (bit)', emoji: '👄', example: 'Ịchie — elders', abstract: true },
        { igbo: 'o', english: 'O — mid back (ore)', emoji: '👄', example: 'Ọcha — clean / white', abstract: true },
        { igbo: 'ọ', english: 'Ọ — open back (awe)', emoji: '👄', example: 'Ọnụ — mouth', abstract: true },
        { igbo: 'u', english: 'U — high back (food)', emoji: '👄', example: 'Ụlọ — house', abstract: true },
        { igbo: 'ụ', english: 'Ụ — short high back (book)', emoji: '👄', example: 'Ụkwụ — legs / waist', abstract: true },
      ],
    },
    {
      id: 'consonants', title: 'Igbo Consonants', igboTitle: 'Mkpụrụedemede Mgbakọ',
      items: [
        { igbo: 'gb', english: 'GB — simultaneous g and b', emoji: '🔊', example: 'Gbara — ran', abstract: true },
        { igbo: 'gw', english: 'GW — rounded g', emoji: '🔊', example: 'Gwa m — tell me', abstract: true },
        { igbo: 'kp', english: 'KP — simultaneous k and p', emoji: '🔊', example: 'Kpọọ — call', abstract: true },
        { igbo: 'kw', english: 'KW — rounded k', emoji: '🔊', example: 'Kwuo — speak', abstract: true },
        { igbo: 'nw', english: 'NW — nasal w', emoji: '🔊', example: 'Nwanne — sibling', abstract: true },
        { igbo: 'ny', english: 'NY — palatal nasal', emoji: '🔊', example: 'Nyi — small', abstract: true },
        { igbo: 'ch', english: 'CH — as in church', emoji: '🔊', example: 'Chee — think', abstract: true },
        { igbo: 'sh', english: 'SH — as in shoe', emoji: '🔊', example: 'Shie — squeeze', abstract: true },
        { igbo: 'gh', english: 'GH — voiced velar fricative', emoji: '🔊', example: 'Ghọọ — become', abstract: true },
      ],
    },
  ],
};

// ─── LEVEL 6A: Greetings & Basic Phrases ─────────────────────────────────────
const LEVEL_6A: Level = {
  id: '6A', level: 'Level 2', free: true,
  title: 'Greetings & Phrases',
  igboTitle: 'Ekele na Okwu',
  emoji: '👋🏾',
  description: 'Say hello, goodbye and useful everyday phrases',
  sections: [
    {
      id: 'greetings', title: 'Greetings', igboTitle: 'Ekele',
      items: [
        { igbo: 'Nnọọ / Ndeewo', english: 'Hello / Welcome', emoji: '👋🏾', example: 'Nnọọ, Kaira!', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'Ụtụtụ ọma', english: 'Good morning', pronunciation: 'oo-too-too oh-mah', emoji: '🌅', example: 'Ụtụtụ ọma, nne!', abstract: true },
        { igbo: 'Ehihie ọma', english: 'Good afternoon', pronunciation: 'eh-hee-hyeh oh-mah', emoji: '🌞', example: 'Ehihie ọma, nna!', abstract: true },
        { igbo: 'Mgbede ọma', english: 'Good evening', pronunciation: 'mg-beh-deh oh-mah', emoji: '🌆', example: 'Mgbede ọma, mama!', partOfSpeech: 'phrase', note: 'Anyasị ọma is a common variant; Mgbede ọma is the Central Igbo primary form.', source: 'central_igbo_vocabulary_audit', abstract: true },
        { igbo: 'Ka chi fo', english: 'Good night', emoji: '🌙', example: 'Ka chi fo, Zara!', partOfSpeech: 'phrase', verified: false, note: 'Central Igbo form per audit; needs native review before audio.', source: 'central_igbo_vocabulary_audit', abstract: true },
        { igbo: 'Daalụ / I meela', english: 'Thank you', emoji: '🙏🏾', example: 'Daalụ, nne!', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'Daalụ nke ukwuu', english: 'Thank you very much', emoji: '🙏🏾', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'Ọ dị mma', english: 'It is fine / OK', pronunciation: 'oh dee m-mah', emoji: '👍🏾', abstract: true },
        { igbo: 'Ka ọ dị', english: 'Goodbye / Let it be well', pronunciation: 'kah oh dee', emoji: '👋🏾', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'Biko', english: 'Please', pronunciation: 'bee-koh', emoji: '🥺', abstract: true },
        { igbo: 'Ndo', english: 'Sorry / Excuse me', pronunciation: 'nn-doh', emoji: '😢', abstract: true },
      ],
    },
    {
      id: 'useful_phrases', title: 'Useful Words', igboTitle: 'Okwu Dị Mkpa',
      items: [
        { igbo: 'Ee', english: 'Yes', pronunciation: 'eh-eh', emoji: '✅', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'Mba', english: 'No', pronunciation: 'm-bah', emoji: '❌', abstract: true },
        { igbo: 'Gịnị', english: 'What?', pronunciation: 'gee-nee', emoji: '❓', abstract: true },
        { igbo: 'Onye', english: 'Who?', pronunciation: 'ohn-yeh', emoji: '🧑', abstract: true },
        { igbo: 'Ebe', english: 'Where?', pronunciation: 'eh-beh', emoji: '📍', abstract: true },
        { igbo: 'Kedu', english: 'How are you?', pronunciation: 'keh-doo', emoji: '🤔', abstract: true },
        { igbo: 'Ọ dị m mma', english: 'I am fine', emoji: '😊', partOfSpeech: 'phrase', verified: true, source: 'central_igbo_vocabulary_audit', abstract: true },
        { igbo: 'Aha m bụ', english: 'My name is', pronunciation: 'ah-hah m boo', emoji: '📛', abstract: true },
        { igbo: 'Kedu aha gị?', english: 'What is your name?', pronunciation: 'keh-doo ah-hah gee', emoji: '❓', abstract: true },
        { igbo: 'Ahụrụ m gị n\'anya', english: 'I love you', emoji: '❤️', partOfSpeech: 'phrase', verified: true, abstract: true },
      ],
    },
  ],
};

// ─── LEVEL 5A: Numbers & Counting ────────────────────────────────────────────
const LEVEL_5A: Level = {
  id: '5A', level: 'Level 3', free: false,
  title: 'Numbers & Counting',
  igboTitle: 'Ọgụgụ',
  emoji: '🔢',
  description: 'Count from 1 to 100 in Igbo',
  sections: [
    {
      id: 'numbers_1_10', title: 'Numbers 1–10', igboTitle: 'Ọgụgụ 1–10',
      items: [
        { igbo: 'Otu', english: '1 — One', pronunciation: 'oh-too', emoji: '1️⃣' },
        { igbo: 'Abụọ', english: '2 — Two', pronunciation: 'ah-bu-oh', emoji: '2️⃣' },
        { igbo: 'Atọ', english: '3 — Three', pronunciation: 'ah-toh', emoji: '3️⃣' },
        { igbo: 'Anọ', english: '4 — Four', pronunciation: 'ah-noh', emoji: '4️⃣' },
        { igbo: 'Ise', english: '5 — Five', pronunciation: 'ee-seh', emoji: '5️⃣' },
        { igbo: 'Isii', english: '6 — Six', pronunciation: 'ee-see-ee', emoji: '6️⃣' },
        { igbo: 'Asaa', english: '7 — Seven', pronunciation: 'ah-sah-ah', emoji: '7️⃣' },
        { igbo: 'Asatọ', english: '8 — Eight', pronunciation: 'ah-sah-toh', emoji: '8️⃣' },
        { igbo: 'Itoolu', english: '9 — Nine', emoji: '9️⃣', partOfSpeech: 'number', verified: true },
        { igbo: 'Iri', english: '10 — Ten', pronunciation: 'ee-ree', emoji: '🔟' },
      ],
    },
    {
      id: 'numbers_11_20', title: 'Numbers 11–20', igboTitle: 'Ọgụgụ 11–20',
      items: [
        { igbo: 'Iri na otu', english: '11 — Eleven', emoji: '🔢' },
        { igbo: 'Iri na abụọ', english: '12 — Twelve', emoji: '🔢' },
        { igbo: 'Iri na atọ', english: '13 — Thirteen', emoji: '🔢' },
        { igbo: 'Iri na anọ', english: '14 — Fourteen', emoji: '🔢' },
        { igbo: 'Iri na ise', english: '15 — Fifteen', emoji: '🔢' },
        { igbo: 'Iri na isii', english: '16 — Sixteen', emoji: '🔢' },
        { igbo: 'Iri na asaa', english: '17 — Seventeen', emoji: '🔢' },
        { igbo: 'Iri na asatọ', english: '18 — Eighteen', emoji: '🔢' },
        { igbo: 'Iri na itoolu', english: '19 — Nineteen', emoji: '🔢', partOfSpeech: 'number', verified: true },
        { igbo: 'Iri abụọ', english: '20 — Twenty', emoji: '🔢' },
      ],
    },
    {
      id: 'numbers_21_40', title: 'Numbers 21–40', igboTitle: 'Ọgụgụ 21–40',
      items: [
        { igbo: 'Iri abụọ na otu', english: '21 — Twenty-one', emoji: '🔢' },
        { igbo: 'Iri abụọ na abụọ', english: '22 — Twenty-two', emoji: '🔢' },
        { igbo: 'Iri abụọ na atọ', english: '23 — Twenty-three', emoji: '🔢' },
        { igbo: 'Iri abụọ na anọ', english: '24 — Twenty-four', emoji: '🔢' },
        { igbo: 'Iri abụọ na ise', english: '25 — Twenty-five', emoji: '🔢' },
        { igbo: 'Iri abụọ na isii', english: '26 — Twenty-six', emoji: '🔢' },
        { igbo: 'Iri abụọ na asaa', english: '27 — Twenty-seven', emoji: '🔢' },
        { igbo: 'Iri abụọ na asatọ', english: '28 — Twenty-eight', emoji: '🔢' },
        { igbo: 'Iri abụọ na itoolu', english: '29 — Twenty-nine', emoji: '🔢' },
        { igbo: 'Iri atọ', english: '30 — Thirty', emoji: '🔢' },
        { igbo: 'Iri atọ na otu', english: '31 — Thirty-one', emoji: '🔢' },
        { igbo: 'Iri atọ na abụọ', english: '32 — Thirty-two', emoji: '🔢' },
        { igbo: 'Iri atọ na atọ', english: '33 — Thirty-three', emoji: '🔢' },
        { igbo: 'Iri atọ na anọ', english: '34 — Thirty-four', emoji: '🔢' },
        { igbo: 'Iri atọ na ise', english: '35 — Thirty-five', emoji: '🔢' },
        { igbo: 'Iri atọ na isii', english: '36 — Thirty-six', emoji: '🔢' },
        { igbo: 'Iri atọ na asaa', english: '37 — Thirty-seven', emoji: '🔢' },
        { igbo: 'Iri atọ na asatọ', english: '38 — Thirty-eight', emoji: '🔢' },
        { igbo: 'Iri atọ na itoolu', english: '39 — Thirty-nine', emoji: '🔢' },
        { igbo: 'Iri anọ', english: '40 — Forty', emoji: '🔢' },
      ],
    },
    {
      id: 'numbers_41_60', title: 'Numbers 41–60', igboTitle: 'Ọgụgụ 41–60',
      items: [
        { igbo: 'Iri anọ na otu', english: '41 — Forty-one', emoji: '🔢' },
        { igbo: 'Iri anọ na abụọ', english: '42 — Forty-two', emoji: '🔢' },
        { igbo: 'Iri anọ na atọ', english: '43 — Forty-three', emoji: '🔢' },
        { igbo: 'Iri anọ na anọ', english: '44 — Forty-four', emoji: '🔢' },
        { igbo: 'Iri anọ na ise', english: '45 — Forty-five', emoji: '🔢' },
        { igbo: 'Iri anọ na isii', english: '46 — Forty-six', emoji: '🔢' },
        { igbo: 'Iri anọ na asaa', english: '47 — Forty-seven', emoji: '🔢' },
        { igbo: 'Iri anọ na asatọ', english: '48 — Forty-eight', emoji: '🔢' },
        { igbo: 'Iri anọ na itoolu', english: '49 — Forty-nine', emoji: '🔢' },
        { igbo: 'Iri ise', english: '50 — Fifty', emoji: '🔢' },
        { igbo: 'Iri ise na otu', english: '51 — Fifty-one', emoji: '🔢' },
        { igbo: 'Iri ise na abụọ', english: '52 — Fifty-two', emoji: '🔢' },
        { igbo: 'Iri ise na atọ', english: '53 — Fifty-three', emoji: '🔢' },
        { igbo: 'Iri ise na anọ', english: '54 — Fifty-four', emoji: '🔢' },
        { igbo: 'Iri ise na ise', english: '55 — Fifty-five', emoji: '🔢' },
        { igbo: 'Iri ise na isii', english: '56 — Fifty-six', emoji: '🔢' },
        { igbo: 'Iri ise na asaa', english: '57 — Fifty-seven', emoji: '🔢' },
        { igbo: 'Iri ise na asatọ', english: '58 — Fifty-eight', emoji: '🔢' },
        { igbo: 'Iri ise na itoolu', english: '59 — Fifty-nine', emoji: '🔢' },
        { igbo: 'Iri isii', english: '60 — Sixty', emoji: '🔢' },
      ],
    },
    {
      id: 'numbers_61_80', title: 'Numbers 61–80', igboTitle: 'Ọgụgụ 61–80',
      items: [
        { igbo: 'Iri isii na otu', english: '61 — Sixty-one', emoji: '🔢' },
        { igbo: 'Iri isii na abụọ', english: '62 — Sixty-two', emoji: '🔢' },
        { igbo: 'Iri isii na atọ', english: '63 — Sixty-three', emoji: '🔢' },
        { igbo: 'Iri isii na anọ', english: '64 — Sixty-four', emoji: '🔢' },
        { igbo: 'Iri isii na ise', english: '65 — Sixty-five', emoji: '🔢' },
        { igbo: 'Iri isii na isii', english: '66 — Sixty-six', emoji: '🔢' },
        { igbo: 'Iri isii na asaa', english: '67 — Sixty-seven', emoji: '🔢' },
        { igbo: 'Iri isii na asatọ', english: '68 — Sixty-eight', emoji: '🔢' },
        { igbo: 'Iri isii na itoolu', english: '69 — Sixty-nine', emoji: '🔢' },
        { igbo: 'Iri asaa', english: '70 — Seventy', emoji: '🔢' },
        { igbo: 'Iri asaa na otu', english: '71 — Seventy-one', emoji: '🔢' },
        { igbo: 'Iri asaa na abụọ', english: '72 — Seventy-two', emoji: '🔢' },
        { igbo: 'Iri asaa na atọ', english: '73 — Seventy-three', emoji: '🔢' },
        { igbo: 'Iri asaa na anọ', english: '74 — Seventy-four', emoji: '🔢' },
        { igbo: 'Iri asaa na ise', english: '75 — Seventy-five', emoji: '🔢' },
        { igbo: 'Iri asaa na isii', english: '76 — Seventy-six', emoji: '🔢' },
        { igbo: 'Iri asaa na asaa', english: '77 — Seventy-seven', emoji: '🔢' },
        { igbo: 'Iri asaa na asatọ', english: '78 — Seventy-eight', emoji: '🔢' },
        { igbo: 'Iri asaa na itoolu', english: '79 — Seventy-nine', emoji: '🔢' },
        { igbo: 'Iri asatọ', english: '80 — Eighty', emoji: '🔢' },
      ],
    },
    {
      id: 'numbers_81_100', title: 'Numbers 81–100', igboTitle: 'Ọgụgụ 81–100',
      items: [
        { igbo: 'Iri asatọ na otu', english: '81 — Eighty-one', emoji: '🔢' },
        { igbo: 'Iri asatọ na abụọ', english: '82 — Eighty-two', emoji: '🔢' },
        { igbo: 'Iri asatọ na atọ', english: '83 — Eighty-three', emoji: '🔢' },
        { igbo: 'Iri asatọ na anọ', english: '84 — Eighty-four', emoji: '🔢' },
        { igbo: 'Iri asatọ na ise', english: '85 — Eighty-five', emoji: '🔢' },
        { igbo: 'Iri asatọ na isii', english: '86 — Eighty-six', emoji: '🔢' },
        { igbo: 'Iri asatọ na asaa', english: '87 — Eighty-seven', emoji: '🔢' },
        { igbo: 'Iri asatọ na asatọ', english: '88 — Eighty-eight', emoji: '🔢' },
        { igbo: 'Iri asatọ na itoolu', english: '89 — Eighty-nine', emoji: '🔢' },
        { igbo: 'Iri itoolu', english: '90 — Ninety', emoji: '🔢', partOfSpeech: 'number', verified: true, source: 'central_igbo_vocabulary_audit' },
        { igbo: 'Iri itoolu na otu', english: '91 — Ninety-one', emoji: '🔢' },
        { igbo: 'Iri itoolu na abụọ', english: '92 — Ninety-two', emoji: '🔢' },
        { igbo: 'Iri itoolu na atọ', english: '93 — Ninety-three', emoji: '🔢' },
        { igbo: 'Iri itoolu na anọ', english: '94 — Ninety-four', emoji: '🔢' },
        { igbo: 'Iri itoolu na ise', english: '95 — Ninety-five', emoji: '🔢' },
        { igbo: 'Iri itoolu na isii', english: '96 — Ninety-six', emoji: '🔢' },
        { igbo: 'Iri itoolu na asaa', english: '97 — Ninety-seven', emoji: '🔢' },
        { igbo: 'Iri itoolu na asatọ', english: '98 — Ninety-eight', emoji: '🔢' },
        { igbo: 'Iri itoolu na itoolu', english: '99 — Ninety-nine', emoji: '🔢' },
        { igbo: 'Otu narị', english: '100 — One hundred', emoji: '🔢' },
      ],
    },
  ],
};

// ─── LEVEL 4A: Body Parts & Family ───────────────────────────────────────────
const LEVEL_4A: Level = {
  id: '4A', level: 'Level 4', free: false,
  title: 'Body Parts & Family',
  igboTitle: 'Akụkụ Ahụ na Ezinụlọ',
  emoji: '🧍🏾‍♀️',
  description: 'Name body parts and family members',
  sections: [
    {
      id: 'body', title: 'Body Parts', igboTitle: 'Akụkụ Ahụ',
      items: [
      { igbo: 'Isi', english: 'Head', emoji: '🙂' },
      { igbo: 'Anya', english: 'Eyes', emoji: '👀' },
      { igbo: 'Nku anya', english: 'Eyebrows', emoji: '🤨' },
      { igbo: 'Imi', english: 'Nose', emoji: '👃🏾' },
      { igbo: 'Ọnụ', english: 'Mouth', emoji: '👄' },
      { igbo: 'Ntị', english: 'Ear', emoji: '👂🏾' },
      { igbo: 'Aka', english: 'Hand', emoji: '✋🏾' },
      { igbo: 'Ụkwụ', english: 'Leg', emoji: '🦵🏾' },
      { igbo: 'Mkpịsị ụkwụ', english: 'Toes', emoji: '🦶🏾' },
      { igbo: 'Ire', english: 'Tongue', emoji: '👅' },
      { igbo: 'Eze', english: 'Teeth', emoji: '🦷' },
    ],
    },
    {
      id: 'family', title: 'Family Members', igboTitle: 'Ezinụlọ',
      items: [
      { igbo: 'Nna', english: 'Father / Dad', pronunciation: 'nn-nah', emoji: '👨🏾' },
      { igbo: 'Nne', english: 'Mother / Mum', pronunciation: 'nn-neh', emoji: '👩🏾' },
      { igbo: 'Nna ochie', english: 'Grandfather', emoji: '👴🏾' },
      { igbo: 'Nne ochie', english: 'Grandmother', emoji: '👵🏾' },
      { igbo: 'Nwanne nwoke', english: 'Brother', pronunciation: 'nn-wah-n-neh nn-woh-keh', emoji: '👦🏾' },
      { igbo: 'Nwanne nwanyị', english: 'Sister', pronunciation: 'nn-wah-n-neh nn-wah-nyee', emoji: '👧🏾' },
      { igbo: 'Nwa', english: 'Child', pronunciation: 'nn-wah', emoji: '🧒🏾' },
      { igbo: 'Ụmụ', english: 'Children', emoji: '🧒🏾🧒🏾' },
      { igbo: 'Nwanne nna', english: 'Uncle', emoji: '🧔🏾' },
      { igbo: 'Nwanne nne', english: 'Aunt', emoji: '👩🏾‍🦱' },
      { igbo: 'Ibe', english: 'Cousin', emoji: '🧑🏾' },
    ],
    },
  ],
};

// ─── LEVEL 3A: Animals & Colours ─────────────────────────────────────────────
const LEVEL_3A: Level = {
  id: '3A', level: 'Level 5', free: false,
  title: 'Animals & Colours',
  igboTitle: 'Anụmanụ na Agba',
  emoji: '🦁',
  description: 'Name animals and describe colours in Igbo',
  sections: [
    {
      id: 'animals', title: 'Animals', igboTitle: 'Anụmanụ',
      items: [
      { igbo: 'Nkịta', english: 'Dog', emoji: '🐕' },
      { igbo: 'Nwamba', english: 'Cat', emoji: '🐈' },
      { igbo: 'Ọkụkọ', english: 'Chicken', emoji: '🐔' },
      { igbo: 'Ewu', english: 'Goat', emoji: '🐐' },
      { igbo: 'Azụ', english: 'Fish', pronunciation: 'ah-zoo', emoji: '🐟' },
      { igbo: 'Nnụnụ', english: 'Bird', emoji: '🐦' },
      { igbo: 'Agụ', english: 'Leopard', emoji: '🐆' },
      { igbo: 'Ọdụm', english: 'Lion', emoji: '🦁' },
      { igbo: 'Enyi', english: 'Elephant', emoji: '🐘' },
      { igbo: 'Oke bekee', english: 'Rabbit', emoji: '🐇' },
      { igbo: 'Oke', english: 'Rat', emoji: '🐀' },
      { igbo: 'Eke', english: 'Python', emoji: '🐍' },
      { igbo: 'Mbe', english: 'Tortoise', emoji: '🐢' },
      { igbo: 'Ụkpana', english: 'Grasshopper', emoji: '🦗' },
    ],
    },
    {
      id: 'colours', title: 'Colours', igboTitle: 'Agba',
      items: [
        { igbo: 'Ọcha', english: 'White / Clean', emoji: '⬜', partOfSpeech: 'color' },
        { igbo: 'Ojii', english: 'Black / Dark', emoji: '⬛', partOfSpeech: 'color' },
        { igbo: 'Ọbara ọbara', english: 'Red (blood red)', emoji: '🔴', partOfSpeech: 'color' },
        { igbo: 'Odo odo', english: 'Yellow', emoji: '🟡', partOfSpeech: 'color' },
        { igbo: 'Ncha ncha', english: 'Green', emoji: '🟢', partOfSpeech: 'color' },
        { igbo: 'Anụnụ anụnụ', english: 'Blue', emoji: '🔵', partOfSpeech: 'color' },
        { igbo: 'Mmanụ', english: 'Orange', pronunciation: 'm-mah-noo', emoji: '🟠', partOfSpeech: 'color', verified: false, note: 'Orange colour term per Drops Visual Dictionary (languagedrops.com); pending final native Central Igbo sign-off. Replaces "Orenji"; original "Ọsọ ọsọ" meant "fast" and was incorrect.', source: 'languagedrops_visual_dictionary' },
        { igbo: 'Ede ede', english: 'Purple', emoji: '🟣', partOfSpeech: 'color' },
        { igbo: 'Aja aja', english: 'Brown', emoji: '🟤', partOfSpeech: 'color' },
      ],
    },
  ],
};

// ─── LEVEL 2A: Verbs & Actions ────────────────────────────────────────────────
const LEVEL_2A: Level = {
  id: '2A', level: 'Level 6', free: false,
  title: 'Verbs & Actions',
  igboTitle: 'Ngwaa na Omume',
  emoji: '🏃🏾',
  description: 'Basic Igbo verbs and how to use them',
  sections: [
    {
      id: 'basic_verbs', title: 'Basic Verbs', igboTitle: 'Ngwaa Dị Mfe',
      items: [
        { igbo: 'Rie', english: 'Eat', pronunciation: 'ree-eh', emoji: '🍽️', example: 'Rie nri — Eat food', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Ịṅụ', english: 'Drink', emoji: '🥤', example: 'Ṅụọ mmiri — Drink water', partOfSpeech: 'verb', verified: true, note: 'Do not confuse with Nwa, which means child.', abstract: true },
        { igbo: 'Bịa', english: 'Come', pronunciation: 'bee-ah', emoji: '👋🏾', example: 'Bịa ebe a — Come here', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Gaa', english: 'Go', pronunciation: 'gah-ah', emoji: '🚶🏾', example: 'Gaa ụlọ — Go home', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Nọ', english: 'Stay / Be', emoji: '🧘🏾', example: 'Nọ ebe a — Stay here', abstract: true },
        { igbo: 'Kwuo', english: 'Say / Speak', emoji: '🗣️', example: 'Kwuo Igbo — Speak Igbo', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Gee ntị', english: 'Listen', emoji: '👂', example: 'Gee ntị — Listen', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Lee', english: 'Look', emoji: '👁️', example: 'Lee ya — Look at it', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Mee', english: 'Do / Make', emoji: '✋🏾', example: 'Mee ya — Do it', abstract: true },
        { igbo: 'Chee echiche', english: 'Think', emoji: '🤔', example: 'Chee echiche — Think', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Gbaa ọsọ', english: 'Run', emoji: '🏃🏾', example: 'Gbaa ọsọ — Run', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Rahụ ụra', english: 'Sleep', emoji: '😴', example: 'Rahụ ụra — Sleep', partOfSpeech: 'verb', verified: true, abstract: true },
        { igbo: 'Bido', english: 'Start / Begin', emoji: '🚀', example: 'Bido ọrụ — Start work', abstract: true },
        { igbo: 'Kwụsị', english: 'Stop', emoji: '🛑', example: 'Kwụsị ihe i na-eme — Stop what you are doing', abstract: true },
        { igbo: 'Bilie', english: 'Stand up', emoji: '🧍🏾', example: 'Bilie — Stand up', partOfSpeech: 'verb', verified: true, abstract: true },
      ],
    },
    {
      id: 'tenses', title: 'Simple Tenses', igboTitle: 'Oge Ngwaa',
      items: [
        { igbo: 'Ana m eri nri', english: 'I am eating (present)', emoji: '🍽️', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'M riri', english: 'I ate (past)', emoji: '✅', abstract: true },
        { igbo: 'M ga-eri', english: 'I will eat (future)', emoji: '⏳', abstract: true },
        { igbo: 'Ana m aga', english: 'I am going (present)', emoji: '🚶🏾', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'M gara', english: 'I went (past)', emoji: '✅', abstract: true },
        { igbo: 'M ga-aga', english: 'I will go (future)', emoji: '⏳', abstract: true },
        { igbo: 'Ana m ekwu', english: 'I am speaking (present)', emoji: '🗣️', partOfSpeech: 'phrase', verified: true, abstract: true },
        { igbo: 'M kwuru', english: 'I spoke (past)', emoji: '✅', abstract: true },
        { igbo: 'M ga-ekwu', english: 'I will speak (future)', emoji: '⏳', abstract: true },
      ],
    },
  ],
};

// ─── LEVEL 1A: Grammar & Parts of Speech ─────────────────────────────────────
const LEVEL_1A: Level = {
  id: '1A', level: 'Level 7', free: false,
  title: 'Grammar & Language',
  igboTitle: 'Ụzọ Asụsụ',
  emoji: '📖',
  description: 'Parts of speech, singular/plural, opposites, clauses',
  sections: [
    {
      id: 'parts_of_speech', title: 'Parts of Speech', igboTitle: 'Akụkụ Okwu',
      items: [
        { igbo: 'Aha (Noun)', english: 'Noun — names a person, place or thing', emoji: '🧸', example: 'Nwa, ụlọ, mmiri', abstract: true },
        { igbo: 'Ngwaa (Verb)', english: 'Verb — shows action or state', emoji: '⚽', example: 'Rie, gaa, nọ', abstract: true },
        { igbo: 'Nkọwa aha (Adjective)', english: 'Adjective — describes a noun', emoji: '🌈', example: 'Ọcha, ukwu, mma', abstract: true },
        { igbo: 'Nkọwa ngwaa (Adverb)', english: 'Adverb — describes a verb', emoji: '🚀', example: 'Ngwa ngwa (quickly), nke ọma (well)', abstract: true },
        { igbo: 'Ihe nchọpụta (Pronoun)', english: 'Pronoun — replaces a noun', emoji: '🙋🏾', example: 'Ya (him/her/it), Ha (them)', abstract: true },
        { igbo: 'Ihe njikọ (Conjunction)', english: 'Conjunction — joins words', emoji: '🔗', example: 'Na (and), ma (but/or)', abstract: true },
        { igbo: 'Ihe ntinye (Preposition)', english: 'Preposition — shows position', emoji: '🏠', example: 'N\'ime (inside), n\'elu (on top)', abstract: true },
      ],
    },
    {
      id: 'singular_plural', title: 'Singular & Plural', igboTitle: 'Otu na Ọtụtụ',
      items: [
        { igbo: 'Nwa — Ụmụaka', english: 'Child — Children', emoji: '👶🏾', abstract: true },
        { igbo: 'Ọkụkọ — Ụmụ ọkụkọ', english: 'Chicken — Chickens', emoji: '🐓', abstract: true },
        { igbo: 'Ewu — Ụmụ ewu', english: 'Goat — Goats', emoji: '🐐', abstract: true },
        { igbo: 'Nkịta — Ụmụ nkịta', english: 'Dog — Dogs', emoji: '🐕', abstract: true },
        { igbo: 'Ụlọ — Ụlọ ọtụtụ', english: 'House — Houses', emoji: '🏠', abstract: true },
        { igbo: 'Onye nkuzi — Ndị nkuzi', english: 'Teacher — Teachers', emoji: '👩🏾‍🏫', partOfSpeech: 'noun', verified: true, abstract: true },
        { igbo: 'Nwa nwoke — Ụmụ nwoke', english: 'Boy — Boys', emoji: '👦🏾', abstract: true },
        { igbo: 'Nwa nwanyị — Ụmụ nwanyị', english: 'Girl — Girls', emoji: '👧🏾', abstract: true },
      ],
    },
    {
      id: 'opposites', title: 'Words & Opposites', igboTitle: 'Okwu na Ntụgharị Ha',
      items: [
        { igbo: 'Ọma / Njọ', english: 'Good / Bad', emoji: '🙂', abstract: true },
        { igbo: 'Ukwu / Obere', english: 'Big / Small', emoji: '🧸', abstract: true },
        { igbo: 'Ọcha / Ruru unyi', english: 'Clean / Dirty', emoji: '🧼', partOfSpeech: 'other', verified: true, abstract: true },
        { igbo: 'Ọhụrụ / Ochie', english: 'New / Old', emoji: '🎁', abstract: true },
        { igbo: 'Ìhè / Ọchịchịrị', english: 'Light / Dark', emoji: '🌞', partOfSpeech: 'other', verified: true, abstract: true },
        { igbo: 'Ogologo / Mkpụmkpụ', english: 'Long / Short', emoji: '📏', partOfSpeech: 'other', verified: true, abstract: true },
        { igbo: 'Elu / Ala', english: 'High / Low', emoji: '🎈', partOfSpeech: 'other', verified: true, abstract: true },
        { igbo: 'Ngwa / Nwayọ', english: 'Fast / Slow', emoji: '🚗', abstract: true },
        { igbo: 'Ike / Mfe', english: 'Hard / Easy', emoji: '🧱', partOfSpeech: 'other', verified: true, abstract: true },
        { igbo: 'Mbụ / Ikpeazụ', english: 'First / Last', emoji: '🏁', partOfSpeech: 'other', verified: true, abstract: true },
      ],
    },
    {
      id: 'clauses', title: 'Clauses & Phrases', igboTitle: 'Ahịrịokwu na Okwuasụsụ',
      items: [
        { igbo: 'Ọ bụ nwa ọma', english: 'She/He is a good child', emoji: '👧🏾', abstract: true },
        { igbo: 'Ewu nọ n\'ọhịa', english: 'The goat is in the bush', emoji: '🐐', abstract: true },
        { igbo: 'Kaira na Zara bụ ụmụ nwanyị', english: 'Kaira and Zara are girls', emoji: '👧🏾👧🏾', abstract: true },
        { igbo: 'Mmiri dị mma', english: 'Water is good', emoji: '💧', abstract: true },
        { igbo: 'A na m eri nri ugbu a', english: 'I am eating food now', emoji: '🍽️', abstract: true },
        { igbo: 'Gaa n\'ụlọ akwụkwọ', english: 'Go to school', emoji: '🏫', abstract: true },
        { igbo: 'Ọ bụ onye ọ bụla', english: 'It is everyone', emoji: '👥', abstract: true },
        { igbo: 'Ihe dị iche iche', english: 'Different things', emoji: '🌈', abstract: true },
      ],
    },
    {
      id: 'punctuation', title: 'Punctuation', igboTitle: 'Akara Edemede',
      items: [
        { igbo: '. (Ntọala)', english: 'Full stop — ends a sentence', emoji: '⏺️', abstract: true },
        { igbo: ', (Ntọala obere)', english: 'Comma — short pause', emoji: ',', abstract: true },
        { igbo: '? (Akara ajụjụ)', english: 'Question mark', emoji: '❓', abstract: true },
        { igbo: '! (Akara ịtọ ụtọ)', english: 'Exclamation mark', emoji: '❗', abstract: true },
        { igbo: '" " (Akara okwu)', english: 'Quotation marks', emoji: '💬', abstract: true },
        { igbo: ': (Akara nkọwa)', english: 'Colon — introduces a list', emoji: '📋', abstract: true },
      ],
    },
    {
      id: 'vocab_dev', title: 'Vocabulary Development', igboTitle: 'Mmụta Okwu',
      items: [
        { igbo: 'Ụlọ', english: 'House / Home', pronunciation: 'oo-loh', emoji: '🏠' },
        { igbo: 'Ụlọ akwụkwọ', english: 'School', pronunciation: 'oo-loh ah-kwoo-kwoh', emoji: '🏫' },
        { igbo: 'Ahịa', english: 'Market', pronunciation: 'ah-hyah', emoji: '🛒' },
        { igbo: 'Mmiri', english: 'Water', pronunciation: 'm-mee-ree', emoji: '💧' },
        { igbo: 'Nri', english: 'Food', pronunciation: 'nn-ree', emoji: '🍲' },
        { igbo: 'Akwụkwọ', english: 'Book / Paper / Leaf', pronunciation: 'ah-kwoo-kwoh', emoji: '📖' },
        { igbo: 'Ọrụ', english: 'Work / Task', emoji: '💼' },
        { igbo: 'Egwu', english: 'Game / Dance / Music', emoji: '🎵' },
        { igbo: 'Anyanwụ', english: 'Sun', emoji: '☀️' },
        { igbo: 'Ọnwa', english: 'Moon / Month', emoji: '🌙' },
        { igbo: 'Igwe ojii', english: 'Cloud / Sky', emoji: '☁️' },
        { igbo: 'Oge', english: 'Time', emoji: '⏰' },
        { igbo: 'Ụbọchị', english: 'Day', emoji: '📅' },
        { igbo: 'Abalị', english: 'Night', emoji: '🌃' },
        { igbo: 'Oge ọhụrụ', english: 'New Year', emoji: '🎆' },
      ],
    },
  ],
};

// ─── OGWASHI-UKWU ENUANI TRANSLATOR ──────────────────────────────────────────
// ─── FOLKTALES ────────────────────────────────────────────────────────────────
export interface Folktale {
  id: string;
  title: string;
  subtitle: string;
  coverEmoji: string;
  body: string;
  moral: string;
  free: boolean;
}

export const FOLKTALES: Folktale[] = [
  {
    id: 'mbe_birds',
    title: 'Mbe na Ụmụ Nnunu',
    subtitle: 'The Tortoise & The Birds · Central Igbo Edition',
    coverEmoji: '🐢🦅',
    body: 'Mbe (the Tortoise) wanted to fly to a feast in the sky. The birds gave him feathers, but Mbe was greedy and changed his afa (name) to "All of You" so he could eat all the nhẹ (things) at the feast! The birds got angry, took back their feathers, and Mbe crashed down, cracking his shell.',
    moral: 'Greed breaks a home. Be content with what you have.',
    free: true,
  },
  {
    id: 'eze_lion',
    title: 'Odum na Ewu',
    subtitle: 'The Lion & The Goat',
    coverEmoji: '🦁🐐',
    body: 'Odum (Lion) once caught Ewu (Goat) and was about to eat her. Ewu said, "Wait, let me sing you a song first." The lion agreed. Ewu sang so beautifully that animals came from everywhere to listen. While Odum was distracted, Ewu slipped away quietly. She ran home and never wandered far again.',
    moral: 'Use your gifts wisely. A calm mind finds a way out.',
    free: false,
  },
  {
    id: 'spider_wisdom',
    title: 'Udele na Ọgwụ Amamihe',
    subtitle: 'The Vulture & The Wisdom Gourd',
    coverEmoji: '🦅🪴',
    body: 'Long ago, a man tried to collect all the wisdom in the world into one gourd and hang it at the top of a tree. As he struggled to climb while holding the gourd, his young son laughed and said, "Papa, hang it on your back!" The father realised his son had more wisdom than the whole gourd. He broke it open and scattered wisdom across the world for everyone.',
    moral: 'Wisdom belongs to everyone. Listen even to the young.',
    free: false,
  },
];

// ─── LEVEL PB: Everyday Phrasebook (kid-safe, with pronunciation) ─────────────
// Words sourced from Wordmastery.org A1/A2 lists; only the kid-appropriate
// subset is included (no money/work/health-complaint/adult phrases). Each
// item carries an English pronunciation respelling. verified:false = grounded
// in the Wordmastery lists, still pending native-speaker sign-off.
const LEVEL_PB: Level = {
  id: 'PB', level: 'Phrasebook', free: false,
  title: 'Everyday Phrasebook',
  igboTitle: 'Okwu Kwa Ụbọchị',
  emoji: '🗣️',
  description: 'Fun everyday Igbo phrases with easy say-it-out-loud pronunciation',
  sections: [
    {
      id: 'happy_feelings', title: 'Happy Feelings', igboTitle: 'Mmetụta Obi',
      items: [
        { igbo: 'Obi dị m ụtọ', english: 'I am happy', emoji: '😊', pronunciation: 'oh-bee dee m oo-toh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Agụụ na-agụ m', english: 'I am hungry', emoji: '😋', pronunciation: 'ah-goo nah-ah-goo m', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ike gwụrụ m', english: 'I am tired', emoji: '😪', pronunciation: 'ee-keh gwoo-roo m', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ụra na-atụ m', english: 'I am sleepy', emoji: '😴', pronunciation: 'oo-rah nah-ah-too m', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ndụ dị mma', english: 'Life is good', emoji: '🌻', pronunciation: 'nn-doo dee m-mah', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
      ],
    },
    {
      id: 'kind_words', title: 'Kind & Everyday Words', igboTitle: 'Okwu Obiọma',
      items: [
        { igbo: 'Nnọọ', english: 'Welcome', emoji: '🤗', pronunciation: 'nn-oh-oh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Chere', english: 'Wait', emoji: '✋🏾', pronunciation: 'cheh-reh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Jisi ike', english: 'Keep it up / Be strong', emoji: '💪🏾', pronunciation: 'jee-see ee-keh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Nsogbu adịghị', english: 'No problem', emoji: '👍🏾', pronunciation: 'nn-sohg-boo ah-dee-gee', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ije ọma', english: 'Safe journey', emoji: '🚗', pronunciation: 'ee-jeh oh-mah', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Chineke gozie gị', english: 'God bless you', emoji: '🙏🏾', pronunciation: 'chee-neh-keh goh-zyeh gee', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'A na m amụ Igbo', english: 'I am learning Igbo', emoji: '📚', pronunciation: 'ah nah m ah-moo ee-boh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
      ],
    },
    {
      id: 'time_words', title: 'Time Words', igboTitle: 'Okwu Oge',
      items: [
        { igbo: 'Taa', english: 'Today', emoji: '📅', pronunciation: 'tah-ah', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Echi', english: 'Tomorrow', emoji: '🌅', pronunciation: 'eh-chee', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ụnyaahụ', english: 'Yesterday', emoji: '🌙', pronunciation: 'oon-yah-hoo', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ugbu a', english: 'Now', emoji: '⏰', pronunciation: 'oo-gboo ah', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Mgbe niile', english: 'Always', emoji: '♾️', pronunciation: 'mg-beh nee-leh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
      ],
    },
    {
      id: 'i_can_do_it', title: 'I Can Do It!', igboTitle: 'Ihe M Nwere Ike Ime',
      items: [
        { igbo: 'Ịgba ọsọ', english: 'To run', emoji: '🏃🏾', pronunciation: 'ee-gbah oh-soh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ịgba egwu', english: 'To dance', emoji: '💃🏾', pronunciation: 'ee-gbah eh-gwoo', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ịga ije', english: 'To walk', emoji: '🚶🏾', pronunciation: 'ee-gah ee-jeh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ịgụ akwụkwọ', english: 'To read', emoji: '📖', pronunciation: 'ee-goo ah-kwoo-kwoh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Ide ihe', english: 'To write', emoji: '✏️', pronunciation: 'ee-deh ee-heh', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
        { igbo: 'Isi nri', english: 'To cook', emoji: '🍲', pronunciation: 'ee-see nn-ree', partOfSpeech: 'phrase', abstract: true, verified: false, source: 'Wordmastery.org A1/A2' },
      ],
    },
  ],
};

// ─── ALL LEVELS (ordered 7A to 1A, progressive) ────────────────────────────
export const ALL_LEVELS: Level[] = [
  LEVEL_7A,
  LEVEL_6A,
  LEVEL_5A,
  LEVEL_4A,
  LEVEL_3A,
  LEVEL_2A,
  LEVEL_1A,
  LEVEL_PB,
];

export const getLevelById = (id: string): Level | undefined =>
  ALL_LEVELS.find(l => l.id === id);

// ─── QUIZ POOL (from free + premium, filtered at runtime) ────────────────────
export const buildQuizPool = (includePremium: boolean): VocabItem[] => {
  // A word is quiz-able if it isn't a letter-tile (🔡) or listen-only (🔊) card.
  const isQuizable = (i: VocabItem) => i.emoji !== '🔡' && i.emoji !== '🔊';

  const collect = (freeOnly: boolean): VocabItem[] => {
    const pool: VocabItem[] = [];
    ALL_LEVELS.forEach(level => {
      if (freeOnly && !level.free) return;
      level.sections.forEach(section => {
        pool.push(...section.items.filter(isQuizable));
      });
    });
    return pool;
  };

  const pool = collect(!includePremium);
  if (pool.length > 0) return pool;

  // Safety net: never hand back an empty pool (randomFrom would crash the quiz).
  // If the tier filter emptied it — e.g. a future data change gates every free
  // level — fall back to every quiz-able word regardless of tier.
  return collect(false);
};