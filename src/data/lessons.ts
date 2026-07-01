// ─── Mụta Igbo: Full Lesson Data ─────────────────────────────────────────────

export interface VocabItem {
  igbo: string;
  english: string;
  emoji: string;
  audio?: string; // filename in assets/audio/
  example?: string; // example sentence
  partOfSpeech?: 'noun' | 'verb' | 'phrase' | 'letter' | 'number' | 'color' | 'other';
  verified?: boolean;
  source?: string;
  note?: string;
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
  id: '7A', level: 'Sound Garden', free: true,
  title: 'Alphabet & Sounds',
  igboTitle: 'Mkpụrụ Edemede',
  emoji: '🔤',
  description: 'Learn the Igbo alphabet, vowels and consonants',
  sections: [
    {
      id: 'alphabet', title: 'Igbo Alphabet', igboTitle: 'Mkpụrụ Edemede',
      items: [
        { igbo: 'a', english: 'a (open vowel)', emoji: '🅰️', partOfSpeech: 'letter', verified: true },
        { igbo: 'b', english: 'b (as in ball)', emoji: '🅱️' },
        { igbo: 'ch', english: 'ch (as in church)', emoji: '🔡' },
        { igbo: 'd', english: 'd (as in door)', emoji: '🔡' },
        { igbo: 'e', english: 'e (as in bed)', emoji: '🔡' },
        { igbo: 'f', english: 'f (as in fish)', emoji: '🔡' },
        { igbo: 'g', english: 'g (as in go)', emoji: '🔡' },
        { igbo: 'gb', english: 'gb (unique Igbo sound)', emoji: '🔡' },
        { igbo: 'gh', english: 'gh (soft g)', emoji: '🔡' },
        { igbo: 'gw', english: 'gw (g + w blend)', emoji: '🔡' },
        { igbo: 'h', english: 'h (as in hat)', emoji: '🔡' },
        { igbo: 'i', english: 'i (as in see)', emoji: '🔡' },
        { igbo: 'ị', english: 'ị (short i, dot below)', emoji: '🔡' },
        { igbo: 'j', english: 'j (as in jump)', emoji: '🔡' },
        { igbo: 'k', english: 'k (as in kite)', emoji: '🔡' },
        { igbo: 'kp', english: 'kp (unique Igbo sound)', emoji: '🔡' },
        { igbo: 'kw', english: 'kw (k + w blend)', emoji: '🔡' },
        { igbo: 'l', english: 'l (as in love)', emoji: '🔡' },
        { igbo: 'm', english: 'm (as in moon)', emoji: '🔡' },
        { igbo: 'n', english: 'n (as in night)', emoji: '🔡' },
        { igbo: 'nw', english: 'nw (n + w blend)', emoji: '🔡' },
        { igbo: 'ny', english: 'ny (as in canyon)', emoji: '🔡' },
        { igbo: 'o', english: 'o (as in ore)', emoji: '🔡' },
        { igbo: 'ọ', english: 'ọ (open o, dot below)', emoji: '🔡' },
        { igbo: 'p', english: 'p (as in pan)', emoji: '🔡' },
        { igbo: 'r', english: 'r (as in run)', emoji: '🔡' },
        { igbo: 's', english: 's (as in sun)', emoji: '🔡' },
        { igbo: 'sh', english: 'sh (as in shoe)', emoji: '🔡' },
        { igbo: 't', english: 't (as in top)', emoji: '🔡' },
        { igbo: 'u', english: 'u (as in food)', emoji: '🔡' },
        { igbo: 'ụ', english: 'ụ (short u, dot below)', emoji: '🔡' },
        { igbo: 'v', english: 'v (as in van)', emoji: '🔡' },
        { igbo: 'w', english: 'w (as in water)', emoji: '🔡' },
        { igbo: 'y', english: 'y (as in yes)', emoji: '🔡' },
        { igbo: 'z', english: 'z (as in zebra)', emoji: '🔡' },
      ],
    },
    {
      id: 'vowels', title: 'Igbo Vowels', igboTitle: 'Ụdaasụ',
      items: [
        { igbo: 'a', english: 'A — open wide (father)', emoji: '👄', example: 'Akwa — cloth / cry / egg / bridge' },
        { igbo: 'e', english: 'E — mid front (bed)', emoji: '👄', example: 'Eze — king / teeth' },
        { igbo: 'i', english: 'I — high front (see)', emoji: '👄', example: 'Isi — head' },
        { igbo: 'ị', english: 'Ị — short high (bit)', emoji: '👄', example: 'Ịchie — elders' },
        { igbo: 'o', english: 'O — mid back (ore)', emoji: '👄', example: 'Ọcha — clean / white' },
        { igbo: 'ọ', english: 'Ọ — open back (awe)', emoji: '👄', example: 'Ọnụ — mouth' },
        { igbo: 'u', english: 'U — high back (food)', emoji: '👄', example: 'Ụlọ — house' },
        { igbo: 'ụ', english: 'Ụ — short high back (book)', emoji: '👄', example: 'Ụkwụ — legs / waist' },
      ],
    },
    {
      id: 'consonants', title: 'Igbo Consonants', igboTitle: 'Mkpụrụedemede Mgbakọ',
      items: [
        { igbo: 'gb', english: 'GB — simultaneous g and b', emoji: '🔊', example: 'Gbara — ran' },
        { igbo: 'gw', english: 'GW — rounded g', emoji: '🔊', example: 'Gwa m — tell me' },
        { igbo: 'kp', english: 'KP — simultaneous k and p', emoji: '🔊', example: 'Kpọọ — call' },
        { igbo: 'kw', english: 'KW — rounded k', emoji: '🔊', example: 'Kwuo — speak' },
        { igbo: 'nw', english: 'NW — nasal w', emoji: '🔊', example: 'Nwanne — sibling' },
        { igbo: 'ny', english: 'NY — palatal nasal', emoji: '🔊', example: 'Nyi — small' },
        { igbo: 'ch', english: 'CH — as in church', emoji: '🔊', example: 'Chee — think' },
        { igbo: 'sh', english: 'SH — as in shoe', emoji: '🔊', example: 'Shie — squeeze' },
        { igbo: 'gh', english: 'GH — voiced velar fricative', emoji: '🔊', example: 'Ghọọ — become' },
      ],
    },
  ],
};

// ─── LEVEL 6A: Greetings & Basic Phrases ─────────────────────────────────────
const LEVEL_6A: Level = {
  id: '6A', level: 'Hello Village', free: true,
  title: 'Greetings & Phrases',
  igboTitle: 'Ekele na Okwu',
  emoji: '👋🏾',
  description: 'Say hello, goodbye and useful everyday phrases',
  sections: [
    {
      id: 'greetings', title: 'Greetings', igboTitle: 'Ekele',
      items: [
        { igbo: 'Nnọọ / Ndeewo', english: 'Hello / Welcome', emoji: '👋🏾', example: 'Nnọọ, Kaira!', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Ụtụtụ ọma', english: 'Good morning', emoji: '🌅', example: 'Ụtụtụ ọma, nne!' },
        { igbo: 'Ehihie ọma', english: 'Good afternoon', emoji: '☀️', example: 'Ehihie ọma, nna!' },
        { igbo: 'Anyasị ọma', english: 'Good evening', emoji: '🌆', example: 'Anyasị ọma, mama!' },
        { igbo: 'Ka chi bọọ', english: 'Good night', emoji: '🌙', example: 'Ka chi bọọ, Zara!', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Daalụ / I meela', english: 'Thank you', emoji: '🙏🏾', example: 'Daalụ, nne!', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Daalụ nke ukwuu', english: 'Thank you very much', emoji: '🙏🏾', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Ọ dị mma', english: 'It is fine / OK', emoji: '👍🏾' },
        { igbo: 'Ka ọ dị', english: 'Goodbye / Let it be well', emoji: '👋🏾', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Biko', english: 'Please', emoji: '🥺' },
        { igbo: 'Ndo', english: 'Sorry / Excuse me', emoji: '😢' },
      ],
    },
    {
      id: 'useful_phrases', title: 'Useful Words', igboTitle: 'Okwu Dị Mkpa',
      items: [
        { igbo: 'Ee', english: 'Yes', emoji: '✅', partOfSpeech: 'phrase', verified: true },
        { igbo: 'Mba', english: 'No', emoji: '❌' },
        { igbo: 'Gịnị', english: 'What?', emoji: '❓' },
        { igbo: 'Onye', english: 'Who?', emoji: '🧑' },
        { igbo: 'Ebe', english: 'Where?', emoji: '📍' },
        { igbo: 'Kedu', english: 'How are you?', emoji: '🤔' },
        { igbo: 'Adị m mma', english: 'I am fine', emoji: '😊' },
        { igbo: 'Aha m bụ', english: 'My name is', emoji: '📛' },
        { igbo: 'Kedu aha gị?', english: 'What is your name?', emoji: '❓' },
        { igbo: 'Ahụrụ m gị n\'anya', english: 'I love you', emoji: '❤️', partOfSpeech: 'phrase', verified: true },
      ],
    },
  ],
};

// ─── LEVEL 5A: Numbers & Counting ────────────────────────────────────────────
const LEVEL_5A: Level = {
  id: '5A', level: 'Counting Market', free: false,
  title: 'Numbers & Counting',
  igboTitle: 'Ọgụgụ',
  emoji: '🔢',
  description: 'Count from 1 to 100 in Igbo',
  sections: [
    {
      id: 'numbers_1_10', title: 'Numbers 1–10', igboTitle: 'Ọgụgụ 1–10',
      items: [
        { igbo: 'Otu', english: '1 — One', emoji: '1️⃣' },
        { igbo: 'Abụọ', english: '2 — Two', emoji: '2️⃣' },
        { igbo: 'Atọ', english: '3 — Three', emoji: '3️⃣' },
        { igbo: 'Anọ', english: '4 — Four', emoji: '4️⃣' },
        { igbo: 'Ise', english: '5 — Five', emoji: '5️⃣' },
        { igbo: 'Isii', english: '6 — Six', emoji: '6️⃣' },
        { igbo: 'Asaa', english: '7 — Seven', emoji: '7️⃣' },
        { igbo: 'Asatọ', english: '8 — Eight', emoji: '8️⃣' },
        { igbo: 'Itoolu', english: '9 — Nine', emoji: '9️⃣', partOfSpeech: 'number', verified: true },
        { igbo: 'Iri', english: '10 — Ten', emoji: '🔟' },
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
      id: 'numbers_big', title: 'Big Numbers', igboTitle: 'Ọgụgụ Ukwu',
      items: [
        { igbo: 'Iri atọ', english: '30 — Thirty', emoji: '🔢' },
        { igbo: 'Iri anọ', english: '40 — Forty', emoji: '🔢' },
        { igbo: 'Iri ise', english: '50 — Fifty', emoji: '🔢' },
        { igbo: 'Iri isii', english: '60 — Sixty', emoji: '🔢' },
        { igbo: 'Iri asaa', english: '70 — Seventy', emoji: '🔢' },
        { igbo: 'Iri asatọ', english: '80 — Eighty', emoji: '🔢' },
        { igbo: 'Iri itoolu', english: '90 — Ninety', emoji: '🔢', partOfSpeech: 'number', verified: true },
        { igbo: 'Otu narị', english: '100 — One hundred', emoji: '💯' },
      ],
    },
  ],
};

// ─── LEVEL 4A: Body Parts & Family ───────────────────────────────────────────
const LEVEL_4A: Level = {
  id: '4A', level: 'Family Tree', free: false,
  title: 'Body Parts & Family',
  igboTitle: 'Akụkụ Ahụ na Ezinụlọ',
  emoji: '🧍🏾‍♀️',
  description: 'Name body parts and family members',
  sections: [
    {
      id: 'body', title: 'Body Parts', igboTitle: 'Akụkụ Ahụ',
      items: [
        { igbo: 'Isi', english: 'Head', emoji: '👤' },
        { igbo: 'Anya', english: 'Eyes', emoji: '👀' },
        { igbo: 'Nku anya', english: 'Eyebrows', emoji: '🤨' },
        { igbo: 'Imi', english: 'Nose', emoji: '👃' },
        { igbo: 'Ọnụ', english: 'Mouth', emoji: '👄' },
        { igbo: 'Ire', english: 'Tongue', emoji: '👅' },
        { igbo: 'Eze', english: 'Teeth', emoji: '🦷' },
        { igbo: 'Ntị', english: 'Ears', emoji: '👂' },
        { igbo: 'Olu', english: 'Neck', emoji: '🙆🏾' },
        { igbo: 'Aka', english: 'Hands / Arms', emoji: '💪🏾' },
        { igbo: 'Mkpịsị aka', english: 'Fingers', emoji: '🤚🏾' },
        { igbo: 'Mbo', english: 'Nails', emoji: '💅🏾' },
        { igbo: 'Obi / Obi ukwu', english: 'Chest / Heart', emoji: '❤️' },
        { igbo: 'Afọ', english: 'Stomach / Belly', emoji: '🤰' },
        { igbo: 'Ụkwụ', english: 'Legs / Feet', emoji: '🦵' },
        { igbo: 'Mkpịsị ụkwụ', english: 'Toes', emoji: '🦶🏾' },
        { igbo: 'Azụ', english: 'Back', emoji: '🚶🏾' },
      ],
    },
    {
      id: 'family', title: 'Family Members', igboTitle: 'Ezinụlọ',
      items: [
        { igbo: 'Nna', english: 'Father / Dad', emoji: '👨🏾' },
        { igbo: 'Nne', english: 'Mother / Mum', emoji: '👩🏾' },
        { igbo: 'Nna ochie', english: 'Grandfather', emoji: '👴🏾' },
        { igbo: 'Nne ochie', english: 'Grandmother', emoji: '👵🏾' },
        { igbo: 'Nwanne nwoke', english: 'Brother', emoji: '👦🏾' },
        { igbo: 'Nwanne nwanyị', english: 'Sister', emoji: '👧🏾' },
        { igbo: 'Nwa', english: 'Child', emoji: '👶🏾' },
        { igbo: 'Ụmụ', english: 'Children', emoji: '👫🏾' },
        { igbo: 'Nna nna', english: 'Uncle (paternal)', emoji: '🧔🏾' },
        { igbo: 'Ibe', english: 'Cousin', emoji: '🧑🏾' },
      ],
    },
  ],
};

// ─── LEVEL 3A: Animals & Colours ─────────────────────────────────────────────
const LEVEL_3A: Level = {
  id: '3A', level: 'Home & Food', free: false,
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
        { igbo: 'Ọkụkọ', english: 'Chicken', emoji: '🐓' },
        { igbo: 'Ewu', english: 'Goat', emoji: '🐐' },
        { igbo: 'Azụ', english: 'Fish', emoji: '🐟' },
        { igbo: 'Nnụnụ', english: 'Bird', emoji: '🐦', partOfSpeech: 'noun', verified: true },
        { igbo: 'Agu', english: 'Leopard / Tiger', emoji: '🐆' },
        { igbo: 'Odum', english: 'Lion', emoji: '🦁' },
        { igbo: 'Enyi', english: 'Elephant', emoji: '🐘' },
        { igbo: 'Ọkịta', english: 'Rabbit', emoji: '🐇' },
        { igbo: 'Oke', english: 'Rat / Mouse', emoji: '🐭', partOfSpeech: 'noun', verified: true, note: 'Use context or illustration to distinguish rat vs mouse.' },
        { igbo: 'Eke', english: 'Python / Snake', emoji: '🐍' },
        { igbo: 'Mbe', english: 'Tortoise', emoji: '🐢' },
        { igbo: 'Nnụnụ', english: 'Bird (general)', emoji: '🦅' },
        { igbo: 'Ụkpana', english: 'Grasshopper', emoji: '🦗' },
      ],
    },
    {
      id: 'colours', title: 'Colours', igboTitle: 'Agba',
      items: [
        { igbo: 'Ọcha', english: 'White / Clean', emoji: '⬜' },
        { igbo: 'Ojii', english: 'Black / Dark', emoji: '⬛' },
        { igbo: 'Ọbara ọbara', english: 'Red (blood red)', emoji: '🔴' },
        { igbo: 'Odo odo', english: 'Yellow', emoji: '🟡' },
        { igbo: 'Ncha ncha', english: 'Green', emoji: '🟢' },
        { igbo: 'Anụnụ anụnụ', english: 'Blue', emoji: '🔵' },
        { igbo: 'Ọsọ ọsọ', english: 'Orange', emoji: '🟠' },
        { igbo: 'Ede ede', english: 'Purple', emoji: '🟣' },
        { igbo: 'Aja aja', english: 'Brown', emoji: '🟤' },
      ],
    },
  ],
};

// ─── LEVEL 2A: Verbs & Actions ────────────────────────────────────────────────
const LEVEL_2A: Level = {
  id: '2A', level: 'Nature Walk', free: false,
  title: 'Verbs & Actions',
  igboTitle: 'Ngwaa na Omume',
  emoji: '🏃🏾',
  description: 'Basic Igbo verbs and how to use them',
  sections: [
    {
      id: 'basic_verbs', title: 'Basic Verbs', igboTitle: 'Ngwaa Dị Mfe',
      items: [
        { igbo: 'Rie', english: 'Eat', emoji: '🍽️', example: 'Rie nri — Eat food', partOfSpeech: 'verb', verified: true },
        { igbo: 'Ịṅụ', english: 'Drink', emoji: '🥤', example: 'Ṅụọ mmiri — Drink water', partOfSpeech: 'verb', verified: true, note: 'Do not confuse with Nwa, which means child.' },
        { igbo: 'Bịa', english: 'Come', emoji: '👋🏾', example: 'Bịa ebe a — Come here', partOfSpeech: 'verb', verified: true },
        { igbo: 'Gaa', english: 'Go', emoji: '🚶🏾', example: 'Gaa ụlọ — Go home', partOfSpeech: 'verb', verified: true },
        { igbo: 'Nọ', english: 'Stay / Be', emoji: '🧘🏾', example: 'Nọ ebe a — Stay here' },
        { igbo: 'Kwuo', english: 'Say / Speak', emoji: '🗣️', example: 'Kwuo Igbo — Speak Igbo', partOfSpeech: 'verb', verified: true },
        { igbo: 'Gee ntị', english: 'Listen', emoji: '👂', example: 'Gee ntị — Listen', partOfSpeech: 'verb', verified: true },
        { igbo: 'Lee', english: 'Look', emoji: '👁️', example: 'Lee ya — Look at it', partOfSpeech: 'verb', verified: true },
        { igbo: 'Mee', english: 'Do / Make', emoji: '✋🏾', example: 'Mee ya — Do it' },
        { igbo: 'Chee echiche', english: 'Think', emoji: '🤔', example: 'Chee echiche — Think', partOfSpeech: 'verb', verified: true },
        { igbo: 'Gbaa ọsọ', english: 'Run', emoji: '🏃🏾', example: 'Gbaa ọsọ — Run', partOfSpeech: 'verb', verified: true },
        { igbo: 'Rahụ ụra', english: 'Sleep', emoji: '😴', example: 'Rahụ ụra — Sleep', partOfSpeech: 'verb', verified: true },
        { igbo: 'Bido', english: 'Start / Begin', emoji: '🚀', example: 'Bido ọrụ — Start work' },
        { igbo: 'Kwụsị', english: 'Stop', emoji: '🛑', example: 'Kwụsị ihe i na-eme — Stop what you are doing' },
        { igbo: 'Bilie', english: 'Stand up', emoji: '🧍🏾', example: 'Bilie — Stand up', partOfSpeech: 'verb', verified: true },
      ],
    },
    {
      id: 'tenses', title: 'Simple Tenses', igboTitle: 'Oge Ngwaa',
      items: [
        { igbo: 'Ana m eri nri', english: 'I am eating (present)', emoji: '🍽️', partOfSpeech: 'phrase', verified: true },
        { igbo: 'M riri', english: 'I ate (past)', emoji: '✅' },
        { igbo: 'M ga-eri', english: 'I will eat (future)', emoji: '⏳' },
        { igbo: 'Ana m aga', english: 'I am going (present)', emoji: '🚶🏾', partOfSpeech: 'phrase', verified: true },
        { igbo: 'M gara', english: 'I went (past)', emoji: '✅' },
        { igbo: 'M ga-aga', english: 'I will go (future)', emoji: '⏳' },
        { igbo: 'Ana m ekwu', english: 'I am speaking (present)', emoji: '🗣️', partOfSpeech: 'phrase', verified: true },
        { igbo: 'M kwuru', english: 'I spoke (past)', emoji: '✅' },
        { igbo: 'M ga-ekwu', english: 'I will speak (future)', emoji: '⏳' },
      ],
    },
  ],
};

// ─── LEVEL 1A: Grammar & Parts of Speech ─────────────────────────────────────
const LEVEL_1A: Level = {
  id: '1A', level: 'Word Builder', free: false,
  title: 'Grammar & Language',
  igboTitle: 'Ụzọ Asụsụ',
  emoji: '📖',
  description: 'Parts of speech, singular/plural, opposites, clauses',
  sections: [
    {
      id: 'parts_of_speech', title: 'Parts of Speech', igboTitle: 'Akụkụ Okwu',
      items: [
        { igbo: 'Aha (Noun)', english: 'Noun — names a person, place or thing', emoji: '🧸', example: 'Nwa, ụlọ, mmiri' },
        { igbo: 'Ngwaa (Verb)', english: 'Verb — shows action or state', emoji: '⚽', example: 'Rie, gaa, nọ' },
        { igbo: 'Nkọwa aha (Adjective)', english: 'Adjective — describes a noun', emoji: '🌈', example: 'Ọcha, ukwu, mma' },
        { igbo: 'Nkọwa ngwaa (Adverb)', english: 'Adverb — describes a verb', emoji: '🚀', example: 'Ngwa ngwa (quickly), nke ọma (well)' },
        { igbo: 'Ihe nchọpụta (Pronoun)', english: 'Pronoun — replaces a noun', emoji: '🙋🏾', example: 'Ya (him/her/it), Ha (them)' },
        { igbo: 'Ihe njikọ (Conjunction)', english: 'Conjunction — joins words', emoji: '��', example: 'Na (and), ma (but/or)' },
        { igbo: 'Ihe ntinye (Preposition)', english: 'Preposition — shows position', emoji: '🏠', example: 'N\'ime (inside), n\'elu (on top)' },
      ],
    },
    {
      id: 'singular_plural', title: 'Singular & Plural', igboTitle: 'Otu na Ọtụtụ',
      items: [
        { igbo: 'Nwa — Ụmụaka', english: 'Child — Children', emoji: '👶🏾' },
        { igbo: 'Ọkụkọ — Ụmụ ọkụkọ', english: 'Chicken — Chickens', emoji: '🐓' },
        { igbo: 'Ewu — Ụmụ ewu', english: 'Goat — Goats', emoji: '🐐' },
        { igbo: 'Nkịta — Ụmụ nkịta', english: 'Dog — Dogs', emoji: '🐕' },
        { igbo: 'Ụlọ — Ụlọ ọtụtụ', english: 'House — Houses', emoji: '🏠' },
        { igbo: 'Onye nkuzi — Ndị nkuzi', english: 'Teacher — Teachers', emoji: '👩🏾‍🏫', partOfSpeech: 'noun', verified: true },
        { igbo: 'Nwa nwoke — Ụmụ nwoke', english: 'Boy — Boys', emoji: '👦🏾' },
        { igbo: 'Nwa nwanyị — Ụmụ nwanyị', english: 'Girl — Girls', emoji: '👧🏾' },
      ],
    },
    {
      id: 'opposites', title: 'Words & Opposites', igboTitle: 'Okwu na Ntụgharị Ha',
      items: [
        { igbo: 'Ọma / Njọ', english: 'Good / Bad', emoji: '🙂' },
        { igbo: 'Ukwu / Obere', english: 'Big / Small', emoji: '🧸' },
        { igbo: 'Ọcha / Ruru unyi', english: 'Clean / Dirty', emoji: '🧼', partOfSpeech: 'other', verified: true },
        { igbo: 'Ọhụrụ / Ochie', english: 'New / Old', emoji: '🎁' },
        { igbo: 'Ìhè / Ọchịchịrị', english: 'Light / Dark', emoji: '🌞', partOfSpeech: 'other', verified: true },
        { igbo: 'Ogologo / Mkpụmkpụ', english: 'Long / Short', emoji: '📏', partOfSpeech: 'other', verified: true },
        { igbo: 'Elu / Ala', english: 'High / Low', emoji: '🎈', partOfSpeech: 'other', verified: true },
        { igbo: 'Ngwa / Nwayọ', english: 'Fast / Slow', emoji: '🚗' },
        { igbo: 'Ike / Mfe', english: 'Hard / Easy', emoji: '🧱', partOfSpeech: 'other', verified: true },
        { igbo: 'Mbụ / Ikpeazụ', english: 'First / Last', emoji: '🏁', partOfSpeech: 'other', verified: true },
      ],
    },
    {
      id: 'clauses', title: 'Clauses & Phrases', igboTitle: 'Ahịrịokwu na Okwuasụsụ',
      items: [
        { igbo: 'Ọ bụ nwa ọma', english: 'She/He is a good child', emoji: '👧🏾' },
        { igbo: 'Ewu nọ n\'ọhịa', english: 'The goat is in the bush', emoji: '🐐' },
        { igbo: 'Kaira na Zara bụ ụmụ nwanyị', english: 'Kaira and Zara are girls', emoji: '👧🏾👧🏾' },
        { igbo: 'Mmiri dị mma', english: 'Water is good', emoji: '💧' },
        { igbo: 'A na m eri nri ugbu a', english: 'I am eating food now', emoji: '🍽️' },
        { igbo: 'Gaa n\'ụlọ akwụkwọ', english: 'Go to school', emoji: '🏫' },
        { igbo: 'Ọ bụ onye ọ bụla', english: 'It is everyone', emoji: '👥' },
        { igbo: 'Ihe dị iche iche', english: 'Different things', emoji: '🌈' },
      ],
    },
    {
      id: 'punctuation', title: 'Punctuation', igboTitle: 'Akara Edemede',
      items: [
        { igbo: '. (Ntọala)', english: 'Full stop — ends a sentence', emoji: '⏺️' },
        { igbo: ', (Ntọala obere)', english: 'Comma — short pause', emoji: ',' },
        { igbo: '? (Akara ajụjụ)', english: 'Question mark', emoji: '❓' },
        { igbo: '! (Akara ịtọ ụtọ)', english: 'Exclamation mark', emoji: '❗' },
        { igbo: '" " (Akara okwu)', english: 'Quotation marks', emoji: '💬' },
        { igbo: ': (Akara nkọwa)', english: 'Colon — introduces a list', emoji: '📋' },
      ],
    },
    {
      id: 'vocab_dev', title: 'Vocabulary Development', igboTitle: 'Mmụta Okwu',
      items: [
        { igbo: 'Ụlọ', english: 'House / Home', emoji: '🏠' },
        { igbo: 'Ụlọ akwụkwọ', english: 'School', emoji: '🏫' },
        { igbo: 'Ahịa', english: 'Market', emoji: '🛒' },
        { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
        { igbo: 'Nri', english: 'Food', emoji: '🍲' },
        { igbo: 'Akwụkwọ', english: 'Book / Paper / Leaf', emoji: '📖' },
        { igbo: 'Ọrụ', english: 'Work / Task', emoji: '💼' },
        { igbo: 'Egwu', english: 'Game / Dance / Music', emoji: '🎵' },
        { igbo: 'Anyanwụ', english: 'Sun', emoji: '☀️' },
        { igbo: 'Ọnwa', english: 'Moon / Month', emoji: '🌙' },
        { igbo: 'Igwe ojii', english: 'Cloud / Sky', emoji: '☁️' },
        { igbo: 'Oge', english: 'Time', emoji: '⏰' },
        { igbo: 'Ụbọchị', english: 'Day', emoji: '📅' },
        { igbo: 'Abalị', english: 'Night', emoji: '🌙' },
        { igbo: 'Oge ọhụrụ', english: 'New Year', emoji: '🎆' },
      ],
    },
  ],
};

// ─── OGWASHI-UKWU ENUANI TRANSLATOR ──────────────────────────────────────────
export interface TranslatorItem {
  central: string;
  ogwashi: string;
  english: string;
  emoji: string;
}

export const TRANSLATOR_POOL: TranslatorItem[] = [
  { central: 'Ihe (Thing)', ogwashi: 'Nhẹ / Ighẹ', english: 'Thing', emoji: '📦' },
  { central: 'Gịnị (What)', ogwashi: 'Ngini', english: 'What', emoji: '❓' },
  { central: 'Aha m', ogwashi: 'Afa m', english: 'My Name', emoji: '📛' },
  { central: 'Bịa ebe a', ogwashi: 'Bịa ẹfẹ nị', english: 'Come here', emoji: '👇🏾' },
  { central: 'Ebe gị', ogwashi: 'Ẹfẹ gị', english: 'Your place', emoji: '🏠' },
  { central: 'Nna (Father)', ogwashi: 'Ịna', english: 'Father', emoji: '👨🏾' },
  { central: 'Nne (Mother)', ogwashi: 'Ịne', english: 'Mother', emoji: '👩🏾' },
  { central: 'Mmiri (Water)', ogwashi: 'Ẹmẹlị', english: 'Water', emoji: '💧' },
  { central: 'Ọma (Good)', ogwashi: 'Ọma nị', english: 'Good', emoji: '✅' },
  { central: 'Nwanne (Sibling)', ogwashi: 'Ọfọ', english: 'Sibling', emoji: '👫🏾' },
];

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
    subtitle: 'The Tortoise & The Birds · Enuani Edition',
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

// ─── ALL LEVELS (ordered 7A to 1A, progressive) ────────────────────────────
export const ALL_LEVELS: Level[] = [
  LEVEL_7A,
  LEVEL_6A,
  LEVEL_5A,
  LEVEL_4A,
  LEVEL_3A,
  LEVEL_2A,
  LEVEL_1A,
];

export const getLevelById = (id: string): Level | undefined =>
  ALL_LEVELS.find(l => l.id === id);

// ─── QUIZ POOL (from free + premium, filtered at runtime) ────────────────────
export const buildQuizPool = (includePremium: boolean): VocabItem[] => {
  const pool: VocabItem[] = [];
  ALL_LEVELS.forEach(level => {
    if (!level.free && !includePremium) return;
    level.sections.forEach(section => {
      pool.push(...section.items.filter(i => i.emoji !== '🔡' && i.emoji !== '🔊'));
    });
  });
  return pool;
};