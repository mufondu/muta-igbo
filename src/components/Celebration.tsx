// ─── Celebration: confetti star burst (pure Animated, zero dependencies) ─────
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PIECES = ['⭐', '🌟', '✨', '🎉', '💛', '💚', '🧡'];
const COUNT = 22;

interface PieceSpec {
  emoji: string;
  startX: number;
  drift: number;
  rotate: number;
  delay: number;
  duration: number;
  size: number;
}

function makePieces(): PieceSpec[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    emoji: PIECES[i % PIECES.length],
    startX: Math.random() * SCREEN_W,
    drift: (Math.random() - 0.5) * 140,
    rotate: (Math.random() - 0.5) * 720,
    delay: Math.random() * 350,
    duration: 1600 + Math.random() * 900,
    size: 18 + Math.random() * 16,
  }));
}

function ConfettiPiece({ spec }: { spec: PieceSpec }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: spec.duration,
      delay: spec.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, SCREEN_H * 0.85],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, spec.drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${spec.rotate}deg`],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: spec.startX,
        top: 0,
        fontSize: spec.size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    >
      {spec.emoji}
    </Animated.Text>
  );
}

// Full-screen confetti overlay. Mount when celebrating; unmounts itself visually
// after the animation completes (parent controls actual unmount via `visible`).
export function Confetti({ visible }: { visible: boolean }) {
  const pieces = useMemo(makePieces, [visible]);
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((spec, i) => <ConfettiPiece key={i} spec={spec} />)}
    </View>
  );
}

// Character cheer card: shows a Muta Friend image with a speech bubble.
// Pass any ImageSource (friend.image) and a phrase.
export function CharacterCheer({ image, name, phrase }: {
  image: any; name: string; phrase: string;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 9, mass: 0.7 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bounce, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[cheer.wrap, { transform: [{ scale }] }]}>
      <Animated.Image
        source={image}
        style={[cheer.img, { transform: [{ translateY: bounce }] }]}
        resizeMode="contain"
      />
      <View style={cheer.bubble}>
        <Text style={cheer.bubbleName}>{name} says:</Text>
        <Text style={cheer.bubbleText}>{phrase}</Text>
      </View>
    </Animated.View>
  );
}

const cheer = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, marginVertical: 8 },
  img: { width: 96, height: 96 },
  bubble: {
    backgroundColor: '#FFF6D6',
    borderWidth: 2, borderColor: '#F0C84A',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8,
    alignItems: 'center', maxWidth: 260,
  },
  bubbleName: { fontSize: 11, fontWeight: '700', color: '#C05A22' },
  bubbleText: { fontSize: 15, fontWeight: '800', color: '#1A1A14', textAlign: 'center', marginTop: 2 },
});

// Igbo praise phrases for correct answers and wins
export const PRAISE_PHRASES = [
  'Ọ dị mma! (Well done!)',
  'Ị mere nke ọma! (You did great!)',
  'Nnukwu! (Wonderful!)',
  'Ọ zuru ezu! (Perfect!)',
  'Jisie ike! (Keep it up!)',
  'Ị bụ ọkachamara! (You are a champion!)',
];

export function randomPraise(): string {
  return PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
}
