// ─── Game 4: Listen & Tap (Tap the right picture) ────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buildQuizPool } from '../../data/lessons';
import { COLOR, FONT, IS_TABLET, RADIUS, SPACE } from '../../utils/tokens';
import {
  Difficulty, DifficultyPicker, FeedbackFlash,
  GameOver, ScoreBanner,
} from './GameUtils';

interface Props { onBack: () => void; isPremium: boolean; }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

interface TapQuestion {
  igbo: string;
  english: string;
  correctEmoji: string;
  options: { igbo: string; english: string; emoji: string }[];
}

function buildQuestion(difficulty: Difficulty, isPremium: boolean): TapQuestion {
  const pool = buildQuizPool(isPremium).filter(i => i.emoji && i.emoji !== '🔡' && i.emoji !== '🔊' && i.emoji !== '🔢');
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const count = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  const wrong = shuffle(pool.filter(i => i.igbo !== correct.igbo)).slice(0, count - 1);
  return {
    igbo: correct.igbo,
    english: correct.english,
    correctEmoji: correct.emoji,
    options: shuffle([correct, ...wrong]),
  };
}

export default function ListenTapGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [question, setQuestion]     = useState<TapQuestion | null>(null);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [feedback, setFeedback]     = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver]     = useState(false);
  const [round, setRound]           = useState(0);
  const [started, setStarted]       = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const MAX_ROUNDS = 10;

  const next = useCallback((d: Difficulty) => {
    setQuestion(buildQuestion(d, isPremium));
    setFeedback(null); setShowEnglish(false);
  }, [isPremium]);

  function start(d: Difficulty) {
    setScore(0); setStreak(0); setRound(0);
    setGameOver(false); setStarted(true);
    setQuestion(buildQuestion(d, isPremium));
    setFeedback(null); setShowEnglish(false);
  }

  function tap(opt: { igbo: string; english: string; emoji: string }) {
    if (!question) return;
    if (opt.igbo === question.igbo) {
      const ns = streak + 1;
      setStreak(ns); setScore(s => s + 1 + Math.floor(ns / 3));
      setFeedback({ text: ns >= 3 ? `🔥 Ọkachamara! ${ns} in a row!` : 'Nnukwu! Correct! ✅', correct: true });
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= MAX_ROUNDS) { setTimeout(() => setGameOver(true), 1200); return; }
      setTimeout(() => next(difficulty), 1200);
    } else {
      setStreak(0);
      setFeedback({ text: `Ewoo! That is ${opt.english}. Try again! 💪`, correct: false });
    }
  }

  const optSize = IS_TABLET ? 120 : difficulty === 'easy' ? 130 : difficulty === 'medium' ? 100 : 85;

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <View>
            <Text style={s.headerTitle}>Listen & Tap 👂</Text>
            <Text style={s.headerSub}>Tap the correct picture</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.setupPad}>
          <Text style={s.instrEmoji}>👂</Text>
          <Text style={s.instrTitle}>Listen & Tap</Text>
          <Text style={s.instrBody}>
            You will see an Igbo word. Tap the correct picture that matches it!
            Harder levels have more pictures to choose from. 🌍
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
          <Text style={s.headerTitle}>Listen & Tap 👂</Text>
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
        <Text style={s.headerTitle}>Listen & Tap 👂</Text>
        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>
      <ScrollView contentContainerStyle={s.gamePad}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        {/* Word prompt */}
        <View style={s.promptCard}>
          <Text style={s.promptLabel}>Tap the picture for:</Text>
          <Text style={s.promptIgbo}>{question.igbo}</Text>
          <TouchableOpacity onPress={() => setShowEnglish(v => !v)} style={s.hintBtn}>
            <Text style={s.hintBtnText}>{showEnglish ? `"${question.english}"` : '💡 Show English hint'}</Text>
          </TouchableOpacity>
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        {/* Picture grid */}
        <View style={s.pictureGrid}>
          {question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[s.pictureOpt, { width: optSize, height: optSize }]}
              onPress={() => tap(opt)}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: optSize * 0.45 }}>{opt.emoji}</Text>
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

  promptCard: {
    backgroundColor: COLOR.forestLight, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: '#B0D8BE',
    padding: SPACE.lg, alignItems: 'center', marginBottom: SPACE.md,
  },
  promptLabel: { fontSize: FONT.sm, color: COLOR.textSecond, marginBottom: 4 },
  promptIgbo:  { fontSize: FONT.hero, fontWeight: '900', color: COLOR.forest },
  hintBtn:     { marginTop: SPACE.sm, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: COLOR.goldLight, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder },
  hintBtnText: { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },

  pictureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACE.md },
  pictureOpt: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: COLOR.border,
    alignItems: 'center', justifyContent: 'center',
  },
});
