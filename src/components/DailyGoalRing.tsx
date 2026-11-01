// ─── Daily Goal Ring: complete 3 activities today ─────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

export const DAILY_GOAL = 3;

// Shiny gold palette used only when the daily goal is complete.
const GOLD_DEEP = '#E19A00';
const GOLD = '#F7B500';
const GOLD_BRIGHT = '#FFD54A';
const GOLD_HILITE = '#FFF3C4';

interface Props {
  completed: number;   // activities done today
  goal?: number;       // activities per day (defaults to DAILY_GOAL)
  size?: number;
}

// Segmented ring built from 3 arc segments using rotated half-circles is heavy;
// instead we use a simple, kid-clear segmented pill bar plus a big star that
// fills when the goal is reached. Reads instantly for pre-readers.
export function DailyGoalRing({ completed, goal = DAILY_GOAL }: Props) {
  const done = Math.min(completed, goal);
  const goalMet = done >= goal;

  const starScale = useRef(new Animated.Value(goalMet ? 1 : 0.85)).current;
  const starSpin = useRef(new Animated.Value(0)).current;    // gentle wobble
  const shimmer = useRef(new Animated.Value(0)).current;     // sweep across bar
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!goalMet) {
      starScale.setValue(0.85);
      return;
    }

    // Celebratory pop, then a soft looping pulse + wobble on the star.
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(starScale, { toValue: 1.16, duration: 720, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(starScale, { toValue: 1.0, duration: 720, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ]),
    );
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(starSpin, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(starSpin, { toValue: -1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(starSpin, { toValue: 0, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    );

    Animated.sequence([
      Animated.spring(starScale, { toValue: 1.3, useNativeDriver: true, damping: 6 }),
      Animated.spring(starScale, { toValue: 1, useNativeDriver: true, damping: 8 }),
    ]).start(() => pulse.start());
    wobble.start();

    return () => { pulse.stop(); wobble.stop(); };
  }, [goalMet]);

  // Shiny sweep across the gold bar once we know its width.
  useEffect(() => {
    if (!goalMet || barWidth <= 0) return;
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.delay(900),
      ]),
    );
    sweep.start();
    return () => sweep.stop();
  }, [goalMet, barWidth]);

  const spin = starSpin.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-60, barWidth + 60] });

  return (
    <View style={[s.wrap, goalMet && s.wrapDone]}>
      <Animated.Text style={[s.star, { transform: [{ scale: starScale }, { rotate: spin }], opacity: goalMet ? 1 : 0.35 }]}>
        {goalMet ? '🌟' : '⭐'}
      </Animated.Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, goalMet && s.titleDone]}>
          {goalMet ? 'Daily goal complete! 🎉' : 'Today\'s goal'}
        </Text>

        <View
          style={[s.segRow, goalMet && s.segRowDone]}
          onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
        >
          {Array.from({ length: goal }).map((_, i) => (
            <View key={i} style={[s.seg, i < done ? (goalMet ? s.segGold : s.segDone) : s.segTodo]}>
              {goalMet && <View style={s.segGloss} />}
            </View>
          ))}

          {goalMet && barWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[s.shimmer, { transform: [{ translateX: shimmerX }, { rotate: '18deg' }] }]}
            />
          )}
        </View>

        <Text style={s.sub}>
          {goalMet
            ? 'Ị mere nke ọma! Come back tomorrow!'
            : `${done} of ${goal} activities · lessons, games or quizzes`}
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
  wrapDone: {
    backgroundColor: '#FFFBEF',
    borderColor: GOLD_BRIGHT,
    shadowColor: GOLD,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  star: { fontSize: 36 },
  title: { fontSize: FONT.md, fontWeight: '900', color: COLOR.textPrimary },
  titleDone: { color: GOLD_DEEP },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 4 },
  segRowDone: { borderRadius: 6, overflow: 'hidden' },
  seg: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  segDone: { backgroundColor: COLOR.gold },
  segTodo: { backgroundColor: '#F0EBE0' },
  segGold: {
    backgroundColor: GOLD,
    borderWidth: 1,
    borderColor: GOLD_DEEP,
    shadowColor: GOLD, shadowOpacity: 0.6, shadowRadius: 4, elevation: 2,
  },
  // Glossy top highlight gives the gold a shiny, rounded look.
  segGloss: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    backgroundColor: GOLD_HILITE, opacity: 0.75,
    borderTopLeftRadius: 5, borderTopRightRadius: 5,
  },
  // Sweeping light reflection animated across the completed bar.
  shimmer: {
    position: 'absolute', top: -6, bottom: -6, width: 26,
    backgroundColor: '#FFFFFF', opacity: 0.55, borderRadius: 8,
  },
  sub: { fontSize: FONT.xs, color: COLOR.textSecond },
});
