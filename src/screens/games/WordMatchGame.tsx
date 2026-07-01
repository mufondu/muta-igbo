// ─── Game 1: Word Match (Memory Card Flip) ───────────────────────────────────
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buildQuizPool } from '../../data/lessons';
import { COLOR, FONT, IS_TABLET, RADIUS, SPACE } from '../../utils/tokens';
import {
  Difficulty, DifficultyPicker, FeedbackFlash,
  GameOver, ScoreBanner, starsFromScore,
} from './GameUtils';

interface Props { onBack: () => void; isPremium: boolean; }

interface Card {
  id: string;
  pairId: string;
  content: string;
  type: 'igbo' | 'english';
  emoji?: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildCards(difficulty: Difficulty, isPremium: boolean): Card[] {
  const pool = buildQuizPool(isPremium);
  const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const items = shuffle(pool).slice(0, pairCount);
  const cards: Card[] = [];
  items.forEach((item, i) => {
    const pairId = `pair_${i}`;
    cards.push({ id: `igbo_${i}`,    pairId, content: item.igbo,    type: 'igbo',    flipped: false, matched: false });
    cards.push({ id: `eng_${i}`,     pairId, content: item.english, type: 'english', emoji: item.emoji, flipped: false, matched: false });
  });
  return shuffle(cards);
}

function CardTile({ card, onPress }: { card: Card; onPress: () => void }) {
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flip, {
      toValue: card.flipped || card.matched ? 1 : 0,
      useNativeDriver: true, damping: 12,
    }).start();
  }, [card.flipped, card.matched]);

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const backRotate  = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontOpacity = flip.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1] });
  const backOpacity  = flip.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0] });

  const cardSize = IS_TABLET ? 100 : 78;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={card.flipped || card.matched}
      activeOpacity={0.85}
      style={{ width: cardSize, height: cardSize }}
    >
      {/* Back (face down) */}
      <Animated.View style={[
        s.card, { width: cardSize, height: cardSize, position: 'absolute',
          opacity: backOpacity, transform: [{ rotateY: backRotate }],
          backgroundColor: card.matched ? COLOR.successLight : COLOR.forestDark,
          borderColor: card.matched ? COLOR.success : COLOR.forest,
        }
      ]}>
        <Text style={{ fontSize: 28 }}>{card.matched ? '✅' : '🌿'}</Text>
      </Animated.View>

      {/* Front (face up) */}
      <Animated.View style={[
        s.card, { width: cardSize, height: cardSize, position: 'absolute',
          opacity: frontOpacity, transform: [{ rotateY: frontRotate }],
          backgroundColor: card.type === 'igbo' ? COLOR.forestLight : COLOR.goldLight,
          borderColor: card.type === 'igbo' ? COLOR.forest : COLOR.gold,
        }
      ]}>
        {card.emoji && <Text style={s.cardEmoji}>{card.emoji}</Text>}
        <Text style={[s.cardText, { color: card.type === 'igbo' ? COLOR.forest : COLOR.clay }]}
          numberOfLines={2} adjustsFontSizeToFit>
          {card.content}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function WordMatchGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards]           = useState<Card[]>([]);
  const [selected, setSelected]     = useState<string[]>([]);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [moves, setMoves]           = useState(0);
  const [feedback, setFeedback]     = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver]     = useState(false);
  const [started, setStarted]       = useState(false);

  const start = useCallback((d: Difficulty) => {
    setCards(buildCards(d, isPremium));
    setSelected([]); setScore(0); setStreak(0);
    setMoves(0); setFeedback(null); setGameOver(false); setStarted(true);
  }, [isPremium]);

  function flip(id: string) {
    if (selected.length === 2) return;
    const newSelected = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setMoves(m => m + 1);

    if (newSelected.length === 2) {
      setSelected(newSelected);
      const [a, b] = newSelected.map(sid => cards.find(c => c.id === sid)!);
      if (a.pairId === b.pairId) {
        // Match
        const ns = streak + 1;
        setStreak(ns); setScore(s => s + 1 + Math.floor(ns / 3));
        setFeedback({ text: ns >= 3 ? `🔥 ${ns} in a row! Ọma!` : 'Nnukwu! Match! ✅', correct: true });
        setCards(prev => prev.map(c =>
          c.pairId === a.pairId ? { ...c, matched: true, flipped: true } : c
        ));
        setSelected([]);
        // Check if all matched
        setTimeout(() => {
          setCards(prev => {
            if (prev.every(c => c.matched)) setGameOver(true);
            return prev;
          });
        }, 400);
      } else {
        // No match
        setStreak(0);
        setFeedback({ text: 'Ewoo! Try again! 💪', correct: false });
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setSelected([]);
        }, 1000);
      }
    } else {
      setSelected(newSelected);
    }
  }

  const cols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 4;

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <View>
            <Text style={s.headerTitle}>Word Match 🃏</Text>
            <Text style={s.headerSub}>Flip cards to find matching pairs</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.setupPad}>
          <Text style={s.instrEmoji}>🃏</Text>
          <Text style={s.instrTitle}>Word Match</Text>
          <Text style={s.instrBody}>
            Flip two cards at a time. Match the Igbo word with its English meaning.
            Find all pairs to win! 🌍
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
      <ScrollView style={s.root} contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <Text style={s.headerTitle}>Word Match 🃏</Text>
        </View>
        <GameOver score={score} streak={streak} difficulty={difficulty}
          onReplay={() => start(difficulty)} onHome={onBack} />
      </ScrollView>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.backText} onPress={onBack}>⬅</Text>
        <Text style={s.headerTitle}>Word Match 🃏</Text>
        <Text style={s.movesText}>Moves: {moves}</Text>
      </View>
      <ScrollView contentContainerStyle={s.gamePad}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />
        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}
        <View style={[s.grid, { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', gap: SPACE.sm }]}>
          {cards.map(card => (
            <CardTile key={card.id} card={card} onPress={() => !card.matched && flip(card.id)} />
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
  backText:   { fontSize: FONT.xl, color: COLOR.gold, paddingRight: 4 },
  headerTitle:{ fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream, flex: 1 },
  headerSub:  { fontSize: FONT.xs, color: '#7AB897' },
  movesText:  { fontSize: FONT.sm, color: COLOR.gold, fontWeight: '700' },

  setupPad: { padding: SPACE.lg, alignItems: 'center' },
  instrEmoji:{ fontSize: 56, marginBottom: SPACE.sm },
  instrTitle:{ fontSize: FONT.xxl, fontWeight: '900', color: COLOR.textPrimary, marginBottom: SPACE.sm },
  instrBody: { fontSize: FONT.md, color: COLOR.textSecond, textAlign: 'center', lineHeight: 22, marginBottom: SPACE.xl },
  startBtn:  { backgroundColor: COLOR.forest, borderRadius: RADIUS.pill, paddingVertical: 14, paddingHorizontal: 40, marginTop: SPACE.sm },
  startBtnText:{ fontSize: FONT.lg, fontWeight: '800', color: COLOR.textWhite },

  gamePad: { padding: SPACE.md, paddingBottom: 60 },
  grid: {},
  card: {
    borderRadius: RADIUS.md, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    padding: 4,
  },
  cardEmoji: { fontSize: 22, marginBottom: 2 },
  cardText:  { fontSize: FONT.xs, fontWeight: '700', textAlign: 'center' },
});
