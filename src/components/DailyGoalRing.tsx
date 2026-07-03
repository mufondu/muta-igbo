// ─── Daily Goal Ring: complete 3 activities today ─────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

export const DAILY_GOAL = 3;

interface Props {
  completed: number;   // activities done today (0..3+)
  size?: number;
}

// Segmented ring built from 3 arc segments using rotated half-circles is heavy;
// instead we use a simple, kid-clear segmented pill bar plus a big star that
// fills when the goal is reached. Reads instantly for pre-readers.
export function DailyGoalRing({ completed }: Props) {
  const done = Math.min(completed, DAILY_GOAL);
  const goalMet = done >= DAILY_GOAL;
  const starScale = useRef(new Animated.Value(goalMet ? 1 : 0.85)).current;

  useEffect(() => {
    if (goalMet) {
      Animated.sequence([
        Animated.spring(starScale, { toValue: 1.25, useNativeDriver: true, damping: 6 }),
        Animated.spring(starScale, { toValue: 1, useNativeDriver: true, damping: 8 }),
      ]).start();
    }
  }, [goalMet]);

  return (
    <View style={s.wrap}>
      <Animated.Text style={[s.star, { transform: [{ scale: starScale }], opacity: goalMet ? 1 : 0.35 }]}>
        {goalMet ? '🌟' : '⭐'}
      </Animated.Text>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>
          {goalMet ? 'Daily goal complete! 🎉' : 'Today\'s goal'}
        </Text>
        <View style={s.segRow}>
          {Array.from({ length: DAILY_GOAL }).map((_, i) => (
            <View
              key={i}
              style={[s.seg, i < done ? s.segDone : s.segTodo]}
            />
          ))}
        </View>
        <Text style={s.sub}>
          {goalMet
            ? 'Ị mere nke ọma! Come back tomorrow!'
            : `${done} of ${DAILY_GOAL} activities · lessons, games or quizzes`}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFDF8',
    borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: '#F0EBE0',
    padding: SPACE.md, marginBottom: SPACE.md,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  star: { fontSize: 36 },
  title: { fontSize: FONT.md, fontWeight: '900', color: COLOR.textPrimary },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 4 },
  seg: { flex: 1, height: 10, borderRadius: 5 },
  segDone: { backgroundColor: COLOR.gold },
  segTodo: { backgroundColor: '#F0EBE0' },
  sub: { fontSize: FONT.xs, color: COLOR.textSecond },
});
