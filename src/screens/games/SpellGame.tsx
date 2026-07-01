// ─── Game 3: Spell It (Tap Letters to Spell) ─────────────────────────────────
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_LEVELS } from '../../data/lessons';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
import {
  Difficulty, DifficultyPicker, FeedbackFlash,
  GameOver, ScoreBanner,
} from './GameUtils';

interface Props { onBack: () => void; }

interface SpellQuestion {
  igbo: string;
  english: string;
  emoji: string;
  letters: string[]; // shuffled
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// Split Igbo word respecting digraphs: ch, gb, gh, gw, kp, kw, nw, ny, sh
function splitIgbo(word: string): string[] {
  const digraphs = ['ch', 'gb', 'gh', 'gw', 'kp', 'kw', 'nw', 'ny', 'sh'];
  const letters: string[] = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2).toLowerCase();
    if (digraphs.includes(two)) {
      letters.push(word.slice(i, i + 2));
      i += 2;
    } else {
      letters.push(word[i]);
      i++;
    }
  }
  return letters;
}

function buildSpellQuestion(difficulty: Difficulty): SpellQuestion {
  const pool: { igbo: string; english: string; emoji: string }[] = [];
  ALL_LEVELS.forEach(level => {
    level.sections.forEach(sec => {
      sec.items.forEach(item => {
        const w = item.igbo.split(' ')[0]; // single word only
        if (w.length >= 2 && w.length <= (difficulty === 'easy' ? 4 : difficulty === 'medium' ? 7 : 12)
          && item.emoji !== '🔡' && item.emoji !== '🔊' && item.emoji !== '🔢') {
          pool.push({ igbo: w, english: item.english, emoji: item.emoji });
        }
      });
    });
  });
  const item = pool[Math.floor(Math.random() * pool.length)];
  const letters = splitIgbo(item.igbo);
  // Add decoys based on difficulty
  const decoyCount = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 2 : 4;
  const allLetters = 'abdefghiijklmnoprstuvwyz'.split('');
  const decoys = shuffle(allLetters).slice(0, decoyCount);
  return {
    igbo: item.igbo,
    english: item.english,
    emoji: item.emoji,
    letters: shuffle([...letters, ...decoys]),
  };
}

interface LetterTile { letter: string; id: string; used: boolean; }

export default function SpellGame({ onBack }: Props) {
  const [difficulty, setDifficulty]   = useState<Difficulty>('easy');
  const [question, setQuestion]       = useState<SpellQuestion | null>(null);
  const [tiles, setTiles]             = useState<LetterTile[]>([]);
  const [typed, setTyped]             = useState<{ letter: string; tileId: string }[]>([]);
  const [score, setScore]             = useState(0);
  const [streak, setStreak]           = useState(0);
  const [feedback, setFeedback]       = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver]       = useState(false);
  const [round, setRound]             = useState(0);
  const [started, setStarted]         = useState(false);
  const MAX_ROUNDS = 8;

  const loadQuestion = useCallback((d: Difficulty) => {
    const q = buildSpellQuestion(d);
    setQuestion(q);
    setTiles(q.letters.map((l, i) => ({ letter: l, id: `tile_${i}_${l}`, used: false })));
    setTyped([]); setFeedback(null);
  }, []);

  function start(d: Difficulty) {
    setScore(0); setStreak(0); setRound(0);
    setGameOver(false); setStarted(true);
    loadQuestion(d);
  }

  function tapLetter(tile: LetterTile) {
    if (tile.used) return;
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));
    setTyped(prev => [...prev, { letter: tile.letter, tileId: tile.id }]);
  }

  function removeLast() {
    if (typed.length === 0) return;
    const last = typed[typed.length - 1];
    setTiles(prev => prev.map(t => t.id === last.tileId ? { ...t, used: false } : t));
    setTyped(prev => prev.slice(0, -1));
  }

  function checkSpelling() {
    if (!question) return;
    const attempt = typed.map(t => t.letter).join('');
    if (attempt.toLowerCase() === question.igbo.toLowerCase()) {
      const ns = streak + 1;
      setStreak(ns); setScore(s => s + 2 + Math.floor(ns / 2));
      setFeedback({ text: ns >= 3 ? `🔥 Spelling master! ${ns} in a row!` : 'Ọ zuru ezu! Perfect! ✅', correct: true });
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= MAX_ROUNDS) { setTimeout(() => setGameOver(true), 1400); return; }
      setTimeout(() => loadQuestion(difficulty), 1400);
    } else {
      setStreak(0);
      setFeedback({ text: `Ewoo! The correct spelling is: ${question.igbo} 💪`, correct: false });
      // Reset tiles
      setTimeout(() => {
        setTiles(prev => prev.map(t => ({ ...t, used: false })));
        setTyped([]);
        setFeedback(null);
      }, 2000);
    }
  }

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <View>
            <Text style={s.headerTitle}>Spell It 🔤</Text>
            <Text style={s.headerSub}>Tap letters to spell Igbo words</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.setupPad}>
          <Text style={s.instrEmoji}>🔤</Text>
          <Text style={s.instrTitle}>Spell It!</Text>
          <Text style={s.instrBody}>
            Look at the picture and English clue. Tap the letters in the right order to spell the Igbo word! 🌍
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
          <Text style={s.headerTitle}>Spell It 🔤</Text>
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
        <Text style={s.headerTitle}>Spell It 🔤</Text>
        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>
      <ScrollView contentContainerStyle={s.gamePad}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        {/* Clue card */}
        <View style={s.clueCard}>
          <Text style={s.clueEmoji}>{question.emoji}</Text>
          <Text style={s.clueEnglish}>{question.english}</Text>
          <Text style={s.clueHint}>Spell the Igbo word</Text>
        </View>

        {/* Answer slots */}
        <View style={s.answerRow}>
          {splitIgbo(question.igbo).map((_, i) => (
            <View key={i} style={[s.answerSlot, typed[i] && s.answerSlotFilled]}>
              <Text style={s.answerSlotText}>{typed[i]?.letter ?? ''}</Text>
            </View>
          ))}
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        {/* Letter tiles */}
        <View style={s.tilesRow}>
          {tiles.map(tile => (
            <TouchableOpacity
              key={tile.id}
              style={[s.tile, tile.used && s.tileUsed]}
              onPress={() => tapLetter(tile)}
              disabled={tile.used}
              activeOpacity={0.75}
            >
              <Text style={[s.tileLetter, tile.used && s.tileLetterUsed]}>{tile.letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.deleteBtn} onPress={removeLast}>
            <Text style={s.deleteBtnText}>⌫ Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.checkBtn, typed.length === 0 && s.checkBtnDisabled]}
            onPress={checkSpelling}
            disabled={typed.length === 0}
          >
            <Text style={s.checkBtnText}>Check ✓</Text>
          </TouchableOpacity>
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

  clueCard: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLOR.border,
    padding: SPACE.lg, alignItems: 'center', marginBottom: SPACE.md,
  },
  clueEmoji:   { fontSize: 56, marginBottom: SPACE.sm },
  clueEnglish: { fontSize: FONT.xxl, fontWeight: '800', color: COLOR.textPrimary },
  clueHint:    { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 4, fontStyle: 'italic' },

  answerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: SPACE.md },
  answerSlot: {
    minWidth: 40, height: 44, paddingHorizontal: 6,
    borderBottomWidth: 3, borderBottomColor: COLOR.border,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4,
  },
  answerSlotFilled: { borderBottomColor: COLOR.forest },
  answerSlotText:   { fontSize: FONT.lg, fontWeight: '800', color: COLOR.forest },

  tilesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACE.sm, marginBottom: SPACE.md },
  tile: {
    minWidth: 44, height: 44, paddingHorizontal: 8,
    backgroundColor: COLOR.forestDark, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLOR.forest,
  },
  tileUsed:       { backgroundColor: COLOR.border, borderColor: COLOR.border, opacity: 0.4 },
  tileLetter:     { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  tileLetterUsed: { color: COLOR.textHint },

  actionRow: { flexDirection: 'row', gap: SPACE.sm },
  deleteBtn: {
    flex: 1, backgroundColor: COLOR.clayLight, borderRadius: RADIUS.md,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E8B090',
  },
  deleteBtnText: { fontSize: FONT.md, fontWeight: '700', color: COLOR.clay },
  checkBtn: {
    flex: 2, backgroundColor: COLOR.forest, borderRadius: RADIUS.md,
    paddingVertical: 12, alignItems: 'center',
  },
  checkBtnDisabled: { opacity: 0.4 },
  checkBtnText: { fontSize: FONT.md, fontWeight: '800', color: COLOR.textWhite },
});
