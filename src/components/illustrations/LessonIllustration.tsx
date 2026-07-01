import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT } from '../../utils/tokens';
import { CUSTOM_ILLUSTRATIONS } from './customManifest';

type Props = {
  igbo: string;
  english: string;
  emoji?: string;
  size?: number;
  backgroundColor?: string;
};

type IllustrationEntry = {
  keys: string[];
  assetKey?: string;
  fallback: string;
  label?: string;
};

const ILLUSTRATIONS: IllustrationEntry[] = [
  { keys: ['grandmother', 'nne nne'], assetKey: 'family:grandmother', fallback: 'Grandma', label: 'Grandma' },
  { keys: ['grandfather', 'nna nna'], assetKey: 'family:grandfather', fallback: 'Grandpa', label: 'Grandpa' },
  { keys: ['mother', 'nne'], assetKey: 'family:mother', fallback: 'Mother', label: 'Mother' },
  { keys: ['father', 'nna'], assetKey: 'family:father', fallback: 'Father', label: 'Father' },
  { keys: ['brother', 'nwanne nwoke'], assetKey: 'family:brother', fallback: 'Brother', label: 'Brother' },
  { keys: ['sister', 'nwanne nwanyi'], assetKey: 'family:sister', fallback: 'Sister', label: 'Sister' },
  { keys: ['children', 'ụmụ', 'umu'], assetKey: 'family:children', fallback: 'Children', label: 'Children' },
  { keys: ['child', 'nwa'], assetKey: 'family:child', fallback: 'Child', label: 'Child' },
  { keys: ['uncle'], assetKey: 'family:uncle', fallback: 'Uncle', label: 'Uncle' },
  { keys: ['aunt'], assetKey: 'family:aunt', fallback: 'Aunt', label: 'Aunt' },
  { keys: ['cousin', 'ibe'], assetKey: 'family:cousin', fallback: 'Cousin', label: 'Cousin' },

  { keys: ['head', 'isi'], assetKey: 'body:head', fallback: 'Head', label: 'Head' },
  { keys: ['eye', 'anya'], assetKey: 'body:eye', fallback: 'Eye', label: 'Eye' },
  { keys: ['mouth', 'ọnụ', 'onu'], assetKey: 'body:mouth', fallback: 'Mouth', label: 'Mouth' },
  { keys: ['hand', 'aka'], assetKey: 'body:hand', fallback: 'Hand', label: 'Hand' },
  { keys: ['leg', 'ụkwụ', 'ukwu'], assetKey: 'body:leg', fallback: 'Leg', label: 'Leg' },
  { keys: ['ear', 'ntị', 'nti'], assetKey: 'body:ear', fallback: 'Ear', label: 'Ear' },
  { keys: ['nose', 'imi'], assetKey: 'body:nose', fallback: 'Nose', label: 'Nose' },

  { keys: ['dog', 'nkịta', 'nkita'], assetKey: 'animals:dog', fallback: '🐶', label: 'Dog' },
  { keys: ['cat', 'nwamba'], assetKey: 'animals:cat', fallback: '🐱', label: 'Cat' },
  { keys: ['chicken', 'ọkụkọ', 'okuko'], assetKey: 'animals:chicken', fallback: '🐓', label: 'Chicken' },
  { keys: ['goat', 'ewu'], assetKey: 'animals:goat', fallback: '🐐', label: 'Goat' },
  { keys: ['fish', 'azụ', 'azu'], assetKey: 'animals:fish', fallback: '🐟', label: 'Fish' },
  { keys: ['bird', 'nnụnụ', 'nnunu'], assetKey: 'animals:bird', fallback: '🐦', label: 'Bird' },
  { keys: ['leopard', 'tiger', 'agu'], assetKey: 'animals:leopard', fallback: '🐆', label: 'Animal' },

  { keys: ['house', 'ụlọ', 'ulo'], assetKey: 'home:house', fallback: '🏠', label: 'Home' },
  { keys: ['water', 'mmiri'], assetKey: 'home:water', fallback: '💧', label: 'Water' },
  { keys: ['book', 'akwụkwọ', 'akwukwo'], assetKey: 'home:book', fallback: '📘', label: 'Book' },
  { keys: ['food', 'nri'], assetKey: 'food:food', fallback: '🍲', label: 'Food' },
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

function isTextFallback(value: string): boolean {
  return /^[A-Za-z ]+$/.test(value);
}

export default function LessonIllustration({
  igbo,
  english,
  emoji,
  size = 74,
  backgroundColor = '#F2EAFE',
}: Props) {
  const entry = findIllustration(igbo, english);
  const source: ImageSourcePropType | undefined = entry?.assetKey
    ? CUSTOM_ILLUSTRATIONS[entry.assetKey]
    : undefined;

  const fallback = entry?.fallback || emoji || '✨';
  const label = entry?.label || english || igbo;

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
      ) : isTextFallback(fallback) ? (
        <Text style={styles.textFallback} numberOfLines={1}>
          {label.slice(0, 6)}
        </Text>
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.round(size * 0.42) }]}>
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
  textFallback: {
    fontSize: FONT.xs,
    fontWeight: '900',
    color: COLOR.textPrimary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
