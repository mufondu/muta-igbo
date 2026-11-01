import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { CUSTOM_ILLUSTRATIONS } from './customManifest';
import { getApprovedAsset } from '../../data/pictureRegistry';

type Props = {
  igbo: string;
  english: string;
  emoji?: string;
  size?: number;
  backgroundColor?: string;
  partOfSpeech?: string;
  // When true, the item's own emoji wins over the keyword-matched illustration.
  // Used for tense cards, where each tense has its own emoji (action / ✅ / ⏳)
  // but shares an action keyword that would otherwise collapse them to one image.
  preferEmoji?: boolean;
};

// Generic glyphs that carry no real picture value — keep the text label for these.
const PLACEHOLDER_EMOJI = new Set(['🔡', '🔊']);

function isRenderableEmoji(emoji?: string): boolean {
  if (!emoji) return false;
  if (PLACEHOLDER_EMOJI.has(emoji)) return false;
  // Skip plain ASCII text (e.g. stray labels); real emoji are non-ASCII.
  return /[^\u0000-\u007F]/.test(emoji);
}

// Colour lessons have no photographic asset — a big filled swatch reads far more
// clearly for a 4-year-old than a tiny emoji square, and never depends on the
// device emoji font. Keyed by the English colour word.
type ColorSwatch = { color: string; border?: string };
const COLOR_SWATCHES: { match: string; swatch: ColorSwatch }[] = [
  { match: 'white', swatch: { color: '#FFFFFF', border: '#D9D2C5' } },
  { match: 'black', swatch: { color: '#2B2B2B' } },
  { match: 'red', swatch: { color: '#E23B3B' } },
  { match: 'yellow', swatch: { color: '#FFCE3A', border: '#E9B21F' } },
  { match: 'green', swatch: { color: '#3CC26B' } },
  { match: 'blue', swatch: { color: '#3B82F6' } },
  { match: 'orange', swatch: { color: '#FF9A3B' } },
  { match: 'purple', swatch: { color: '#9B5DE5' } },
  { match: 'brown', swatch: { color: '#9C6B3F' } },
  { match: 'pink', swatch: { color: '#F472B6' } },
  { match: 'grey', swatch: { color: '#9CA3AF' } },
  { match: 'gray', swatch: { color: '#9CA3AF' } },
];

function getColorSwatch(igbo: string, english: string, partOfSpeech?: string): ColorSwatch | undefined {
  const en = (english || '').toLowerCase();
  // Only treat as a colour when it is clearly one, to avoid matching words like
  // "greenhouse". Colour items are tagged partOfSpeech:'color'; otherwise fall
  // back to a whole-word check on the English label.
  const words = en.replace(/[^a-z\s]/g, ' ').split(/\s+/);
  for (const { match, swatch } of COLOR_SWATCHES) {
    if (partOfSpeech === 'color' ? en.includes(match) : words.includes(match)) {
      return swatch;
    }
  }
  return undefined;
}


function isTextFallback(source?: ImageSourcePropType): boolean {
  return !source;
}

function isAnimalAsset(assetKey?: string): boolean {
  return Boolean(assetKey && assetKey.startsWith('animals:'));
}

function isFamilyAsset(assetKey?: string): boolean {
  return !!assetKey && assetKey.startsWith('family:');
}

function isBodyAsset(assetKey?: string): boolean {
  return Boolean(assetKey && assetKey.startsWith('body:'));
}

export default function LessonIllustration({
  igbo,
  english,
  emoji,
  size = 64,
  backgroundColor = '#F2EAFD',
  partOfSpeech,
  preferEmoji = false,
}: Props) {
  const colorSwatch = getColorSwatch(igbo, english, partOfSpeech);
  const useEmojiFirst = preferEmoji && isRenderableEmoji(emoji);
  // Pictures come ONLY from the reviewed registry (exact Igbo + English pair). No guessing.
  const assetKey = getApprovedAsset(igbo, english);
  const source: ImageSourcePropType | undefined = assetKey
    ? CUSTOM_ILLUSTRATIONS[assetKey]
    : undefined;

  const bodyAsset = isBodyAsset(assetKey);
  const animalAsset = isAnimalAsset(assetKey);
  const familyAsset = isFamilyAsset(assetKey);
  const fallback = english || igbo;
  const imageResizeMode = bodyAsset || animalAsset || familyAsset ? 'contain' : 'cover';
  const imageBackgroundColor = animalAsset || familyAsset ? 'transparent' : bodyAsset ? '#FFF8EE' : 'transparent';

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: 0,
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
      ]}
    >
      {useEmojiFirst ? (
        <Text style={[styles.fallbackEmoji, { fontSize: Math.max(22, size * 0.7) }]} numberOfLines={1}>
          {emoji}
        </Text>
      ) : colorSwatch ? (
        <View
          style={[
            styles.swatch,
            {
              width: size * 0.82,
              height: size * 0.82,
              borderRadius: (size * 0.82) / 2,
              backgroundColor: colorSwatch.color,
              borderColor: colorSwatch.border || 'rgba(27,42,107,0.12)',
            },
          ]}
        />
      ) : isTextFallback(source) ? (
        isRenderableEmoji(emoji) ? (
          <Text style={[styles.fallbackEmoji, { fontSize: Math.max(22, size * 0.7) }]} numberOfLines={1}>
            {emoji}
          </Text>
        ) : (
          <Text style={[styles.fallbackText, { fontSize: Math.max(10, size * 0.18) }]} numberOfLines={1}>
            {fallback}
          </Text>
        )
      ) : (
        <Image
          source={source}
          style={[
            styles.image,
            animalAsset && styles.animalImage,
            familyAsset && styles.familyImage,
            { backgroundColor: imageBackgroundColor },
          ]}
          resizeMode={imageResizeMode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  animalImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  familyImage: {
    width: '118%',
    height: '118%',
    backgroundColor: 'transparent',
  },
  fallbackText: {
    color: '#171611',
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  fallbackEmoji: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  swatch: {
    borderWidth: 3,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
