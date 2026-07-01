import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT, RADIUS } from '../../utils/tokens';

type Props = {
  igbo: string;
  english: string;
  emoji?: string;
  size?: number;
  backgroundColor?: string;
};

type IllustrationEntry = {
  keys: string[];
  source?: ImageSourcePropType;
  fallback: string;
};

const ILLUSTRATIONS: IllustrationEntry[] = [
  { keys: ['dog', 'nkịta', 'nkita'], fallback: '🐶' },
  { keys: ['cat', 'nwamba'], fallback: '🐱' },
  { keys: ['chicken', 'ọkụkọ', 'okuko'], fallback: '🐓' },
  { keys: ['goat', 'ewu'], fallback: '🐐' },
  { keys: ['fish', 'azụ', 'azu'], fallback: '🐟' },
  { keys: ['bird', 'nnụnụ', 'nnunu'], fallback: '🐦' },
  { keys: ['leopard', 'tiger', 'agu'], fallback: '🐆' },
  { keys: ['child', 'nwa'], fallback: '🧒🏾' },
  { keys: ['house', 'ụlọ', 'ulo'], fallback: '🏠' },
  { keys: ['water', 'mmiri'], fallback: '💧' },
  { keys: ['food', 'nri'], fallback: '🍲' },
  { keys: ['book', 'akwụkwọ', 'akwukwo'], fallback: '📘' },
  { keys: ['hand', 'aka'], fallback: '✋🏾' },
  { keys: ['eye', 'anya'], fallback: '👁️' },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ị]/g, 'i')
    .replace(/[ụ]/g, 'u')
    .replace(/[ọ]/g, 'o')
    .replace(/[ṅ]/g, 'n');
}

function findIllustration(igbo: string, english: string): IllustrationEntry | undefined {
  const combined = `${normalize(igbo)} ${normalize(english)}`;

  return ILLUSTRATIONS.find(entry =>
    entry.keys.some(key => combined.includes(normalize(key)))
  );
}

export default function LessonIllustration({
  igbo,
  english,
  emoji,
  size = 74,
  backgroundColor = '#F2EAFE',
}: Props) {
  const entry = findIllustration(igbo, english);
  const source = entry?.source;
  const fallback = entry?.fallback || emoji || '✨';

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor,
        },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.round(size * 0.44) }]}>
          {fallback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    fontWeight: '900',
    textAlign: 'center',
  },
});
