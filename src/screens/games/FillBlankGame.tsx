// ─── Game 2: Fill in the Blank ────────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
import {
  Difficulty, DifficultyPicker, FeedbackFlash,
  GameOver, ScoreBanner,
} from './GameUtils';

interface Props { onBack: () => void; isPremium: boolean; }

interface BlankQuestion {
  sentence: string;       // with ___ for blank
  igboSentence: string;   // Igbo version shown as hint
  answer: string;
  options: string[];
  emoji: string;
}

const QUESTIONS: BlankQuestion[] = [
  { sentence: 'The ___ is on the head.', igboSentence: '___ dị n\'isi.', answer: 'Isi', options: ['Isi', 'Anya', 'Ntị', 'Ọnụ', 'Aka', 'Ụkwụ'], emoji: '👤' },
  { sentence: 'The dog says ___.', igboSentence: 'Nkịta na-ekwu ___.', answer: 'Nkịta', options: ['Nkịta', 'Nwamba', 'Ewu', 'Agu', 'Enyi', 'Mbe'], emoji: '🐕' },
  { sentence: 'Good morning is ___ ọma.', igboSentence: '___ ọma bụ ekele ụtụtụ.', answer: 'Ụtụtụ', options: ['Ụtụtụ', 'Anyasị', 'Ehihie', 'Abalị', 'Oge', 'Ụbọchị'], emoji: '🌅' },
  { sentence: 'Thank you in Igbo is ___.', igboSentence: 'Ịsị daalụ bụ ___.', answer: 'Daalụ', options: ['Daalụ', 'Biko', 'Ndo', 'Nnọọ', 'Mba', 'Ee'], emoji: '🙏🏿' },
  { sentence: 'The number five is ___.', igboSentence: 'Ọnụọgụ ise bụ ___.', answer: 'Ise', options: ['Ise', 'Isii', 'Asaa', 'Anọ', 'Atọ', 'Otu'], emoji: '5️⃣' },
  { sentence: 'The colour red is ___ ___.', igboSentence: 'Agba ọbara bụ ___ ___.', answer: 'Ọbara ọbara', options: ['Ọbara ọbara', 'Odo odo', 'Ojii', 'Ọcha', 'Ncha ncha', 'Aja aja'], emoji: '🔴' },
  { sentence: 'To eat in Igbo is ___.', igboSentence: 'Irie nri bụ ___.', answer: 'Rie', options: ['Rie', 'Nwa', 'Gaa', 'Bia', 'Nọ', 'Hụ'], emoji: '🍽️' },
  { sentence: 'Father in Igbo is ___.', igboSentence: 'Nna bụ ___ n\'Igbo.', answer: 'Nna', options: ['Nna', 'Nne', 'Nwa', 'Ibe', 'Ụmụ', 'Olu'], emoji: '👨🏿' },
  { sentence: 'The lion is called ___ in Igbo.', igboSentence: 'Ọ na-akpọ ọdum ___.', answer: 'Odum', options: ['Odum', 'Agu', 'Enyi', 'Mbe', 'Eke', 'Nnụnụ'], emoji: '🦁' },
  { sentence: 'House in Igbo is ___.', igboSentence: 'Ụlọ bụ ___ n\'Igbo.', answer: 'Ụlọ', options: ['Ụlọ', 'Ahịa', 'Ọrụ', 'Egwu', 'Oge', 'Mmiri'], emoji: '🏠' },
  { sentence: 'I am fine is ___ m mma.', igboSentence: '___ m mma.', answer: 'Adị', options: ['Adị', 'Aha', 'Kedu', 'Biko', 'Ndo', 'Ee'], emoji: '😊' },
  { sentence: 'Water in Igbo is ___.', igboSentence: 'Mmiri bụ ___ n\'Igbo.', answer: 'Mmiri', options: ['Mmiri', 'Nri', 'Ọrụ', 'Akwụkwọ', 'Egwu', 'Ụlọ'], emoji: '💧' },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildQuestion(difficulty: Difficulty): BlankQuestion {
  const q = { ...QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)] };
  const wrongOptions = q.options.filter(o => o !== q.answer);
  const count = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  q.options = shuffle([q.answer, ...shuffle(wrongOptions).slice(0, count - 1)]);
  return q;
}

export default function FillBlankGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [question, setQuestion]     = useState<BlankQuestion | null>(null);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [feedback, setFeedback]     = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver]     = useState(false);
  const [round, setRound]           = useState(0);
  const [started, setStarted]       = useState(false);
  const [showIgbo, setShowIgbo]     = useState(false);
  const MAX_ROUNDS = 10;

  const next = useCallback((d: Difficulty) => {
    setQuestion(buildQuestion(d));
    setFeedback(null); setShowIgbo(false);
  }, []);

  function start(d: Difficulty) {
    setScore(0); setStreak(0); setRound(0);
    setGameOver(false); setStarted(true);
    setQuestion(buildQuestion(d));
    setFeedback(null); setShowIgbo(false);
  }

  function answer(opt: string) {
    if (!question) return;
    if (opt === question.answer) {
      const ns = streak + 1;
      setStreak(ns); setScore(s => s + 1 + Math.floor(ns / 3));
      setFeedback({ text: ns >= 3 ? `🔥 Ọkachamara! ${ns} in a row!` : 'Nnukwu! Correct! ✅', correct: true });
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= MAX_ROUNDS) { setTimeout(() => setGameOver(true), 1200); return; }
      setTimeout(() => next(difficulty), 1200);
    } else {
      setStreak(0);
      setFeedback({ text: `Ewoo! The answer is ${question.answer} 💪`, correct: false });
    }
  }

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <View>
            <Text style={s.headerTitle}>Fill the Blank ✏️</Text>
            <Text style={s.headerSub}>Complete the Igbo sentence</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.setupPad}>
          <Text style={s.instrEmoji}>✏️</Text>
          <Text style={s.instrTitle}>Fill the Blank</Text>
          <Text style={s.instrBody}>
            Read the sentence with a missing word. Choose the correct Igbo word to fill the blank! 🌍
          </Text>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <TouchableOpacity style={s.startBtn} onPress={() => start(difficulty)} activeOpacity={0.85}>
            <Text style={s.startBtnText}>Start Game 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (gameOver) {
    return (
      <ScrollView style={s.root} contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <Text style={s.headerTitle}>Fill the Blank ✏️</Text>
        </View>
        <GameOver score={score} streak={streak} difficulty={difficulty}
          onReplay={() => start(difficulty)} onHome={onBack} />
      </ScrollView>
    );
  }

  if (!question) return null;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.backText} onPress={onBack}>⬅</Text>
        <Text style={s.headerTitle}>Fill the Blank ✏️</Text>
        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>
      <ScrollView contentContainerStyle={s.gamePad}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        {/* Question card */}
        <View style={s.questionCard}>
          <Text style={s.questionEmoji}>{question.emoji}</Text>
          <Text style={s.questionText}>{question.sentence}</Text>
          <TouchableOpacity onPress={() => setShowIgbo(v => !v)} style={s.hintBtn}>
            <Text style={s.hintBtnText}>{showIgbo ? '🙈 Hide hint' : '💡 Show Igbo hint'}</Text>
          </TouchableOpacity>
          {showIgbo && (
            <Text style={s.hintText}>{question.igboSentence}</Text>
          )}
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        {/* Options */}
        <View style={s.optionsGrid}>
          {question.options.map(opt => (
            <TouchableOpacity key={opt} style={s.optBtn} onPress={() => answer(opt)} activeOpacity={0.8}>
              <Text style={s.optText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestDark, paddingVertical: 14, paddingHorizontal: SPACE.md,
  },
  backText:    { fontSize: FONT.xl, color: COLOR.gold, paddingRight: 4 },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream, flex: 1 },
  headerSub:   { fontSize: FONT.xs, color: '#7AB897' },
  roundText:   { fontSize: FONT.sm, color: COLOR.gold, fontWeight: '700' },

  setupPad:    { padding: SPACE.lg, alignItems: 'center' },
  instrEmoji:  { fontSize: 56, marginBottom: SPACE.sm },
  instrTitle:  { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.textPrimary, marginBottom: SPACE.sm },
  instrBody:   { fontSize: FONT.md, color: COLOR.textSecond, textAlign: 'center', lineHeight: 22, marginBottom: SPACE.xl },
  startBtn:    { backgroundColor: COLOR.forest, borderRadius: RADIUS.pill, paddingVertical: 14, paddingHorizontal: 40, marginTop: SPACE.sm },
  startBtnText:{ fontSize: FONT.lg, fontWeight: '800', color: COLOR.textWhite },

  gamePad: { padding: SPACE.md, paddingBottom: 60 },
  progressTrack: { height: 6, backgroundColor: COLOR.border, borderRadius: 3, marginBottom: SPACE.md, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: COLOR.forest, borderRadius: 3 },

  questionCard: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLOR.border,
    padding: SPACE.lg, alignItems: 'center', marginBottom: SPACE.md,
  },
  questionEmoji: { fontSize: 48, marginBottom: SPACE.sm },
  questionText:  { fontSize: FONT.xl, fontWeight: '700', color: COLOR.textPrimary, textAlign: 'center', lineHeight: 28 },
  hintBtn:       { marginTop: SPACE.sm, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: COLOR.goldLight, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder },
  hintBtnText:   { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },
  hintText:      { fontSize: FONT.md, color: COLOR.forest, fontStyle: 'italic', marginTop: SPACE.sm, textAlign: 'center' },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, justifyContent: 'space-between' },
  optBtn: {
    width: '47%', backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLOR.border,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  optText: { fontSize: FONT.md, fontWeight: '700', color: COLOR.textPrimary, textAlign: 'center' },
});
