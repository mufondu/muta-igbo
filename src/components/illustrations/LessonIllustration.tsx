import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
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
  assetKey: string;
  fallback: string;
  label: string;
};

const ILLUSTRATIONS: IllustrationEntry[] = [
  { keys: ['grandmother', 'nne ochie'], assetKey: 'family:grandmother', fallback: 'Grandma', label: 'Grandma' },
  { keys: ['grandfather', 'nna ochie'], assetKey: 'family:grandfather', fallback: 'Grandpa', label: 'Grandpa' },
  { keys: ['brother', 'nwanne nwoke'], assetKey: 'family:brother', fallback: 'Brother', label: 'Brother' },
  { keys: ['sister', 'nwanne nwanyi', 'nwanne nwanyị'], assetKey: 'family:sister', fallback: 'Sister', label: 'Sister' },
  { keys: ['children', 'ụmụ', 'umu'], assetKey: 'family:children', fallback: 'Children', label: 'Children' },
  { keys: ['child', 'nwa'], assetKey: 'family:child', fallback: 'Child', label: 'Child' },
  { keys: ['uncle', 'nwanne nna', 'nwanne nne'], assetKey: 'family:uncle', fallback: 'Uncle', label: 'Uncle' },
  { keys: ['aunt', 'nwanne nne', 'nwanne nna'], assetKey: 'family:aunt', fallback: 'Aunt', label: 'Aunt' },
  { keys: ['cousin', 'ibe'], assetKey: 'family:cousin', fallback: 'Cousin', label: 'Cousin' },
  { keys: ['mother', 'mum', 'nne'], assetKey: 'family:mother', fallback: 'Mother', label: 'Mother' },
  { keys: ['father', 'dad', 'nna'], assetKey: 'family:father', fallback: 'Father', label: 'Father' },

  { keys: ['head', 'isi'], assetKey: 'body:head', fallback: 'Head', label: 'Head' },
  { keys: ['eyebrow', 'eyebrows', 'nku anya'], assetKey: 'body:eyebrow', fallback: 'Eyebrow', label: 'Eyebrow' },
  { keys: ['eye', 'eyes', 'anya'], assetKey: 'body:eye', fallback: 'Eye', label: 'Eye' },
  { keys: ['nose', 'imi'], assetKey: 'body:nose', fallback: 'Nose', label: 'Nose' },
  { keys: ['mouth', 'ọnụ', 'onu'], assetKey: 'body:mouth', fallback: 'Mouth', label: 'Mouth' },
  { keys: ['ear', 'ntị', 'nti'], assetKey: 'body:ear', fallback: 'Ear', label: 'Ear' },
  { keys: ['hand', 'aka'], assetKey: 'body:hand', fallback: 'Hand', label: 'Hand' },
  { keys: ['leg', 'ụkwụ', 'ukwu'], assetKey: 'body:leg', fallback: 'Leg', label: 'Leg' },
  { keys: ['toes', 'toe', 'mkpisi ukwu', 'mkpịsị ụkwụ'], assetKey: 'body:toes', fallback: 'Toes', label: 'Toes' },
  { keys: ['tongue', 'ire'], assetKey: 'body:tongue', fallback: 'Tongue', label: 'Tongue' },
  { keys: ['teeth', 'tooth', 'eze'], assetKey: 'body:teeth', fallback: 'Teeth', label: 'Teeth' },

  { keys: ['dog', 'nkịta', 'nkita'], assetKey: 'animals:dog', fallback: 'Dog', label: 'Dog' },
  { keys: ['cat', 'nwamba'], assetKey: 'animals:cat', fallback: 'Cat', label: 'Cat' },
  { keys: ['chicken', 'ọkụkọ', 'okuko'], assetKey: 'animals:chicken', fallback: 'Chicken', label: 'Chicken' },
  { keys: ['goat', 'ewu'], assetKey: 'animals:goat', fallback: 'Goat', label: 'Goat' },
  { keys: ['fish', 'azụ', 'azu'], assetKey: 'animals:fish', fallback: 'Fish', label: 'Fish' },
  { keys: ['bird', 'nnụnụ', 'nnunu'], assetKey: 'animals:bird', fallback: 'Bird', label: 'Bird' },
  { keys: ['leopard', 'tiger', 'agu'], assetKey: 'animals:leopard', fallback: 'Leopard', label: 'Leopard' },
  { keys: ['lion', 'ọdụm', 'odum'], assetKey: 'animals:lion', fallback: 'Lion', label: 'Lion' },
  { keys: ['elephant', 'enyi'], assetKey: 'animals:elephant', fallback: 'Elephant', label: 'Elephant' },
  { keys: ['rabbit', 'oke bekee'], assetKey: 'animals:rabbit', fallback: 'Rabbit', label: 'Rabbit' },
  { keys: ['rat', 'oke'], assetKey: 'animals:rat', fallback: 'Rat', label: 'Rat' },
  { keys: ['python', 'snake', 'eke', 'agwọ', 'agwo'], assetKey: 'animals:python', fallback: 'Python', label: 'Python' },
  { keys: ['tortoise', 'turtle', 'mbe'], assetKey: 'animals:tortoise', fallback: 'Tortoise', label: 'Tortoise' },
  { keys: ['grasshopper', 'ụkpana', 'ukpana', 'ụkpara', 'ukpara'], assetKey: 'animals:grasshopper', fallback: 'Grasshopper', label: 'Grasshopper' },

  { keys: ['house', 'ụlọ', 'ulo'], assetKey: 'home:house', fallback: 'Home', label: 'Home' },
  { keys: ['water', 'mmiri'], assetKey: 'home:water', fallback: 'Water', label: 'Water' },
  { keys: ['book', 'akwụkwọ', 'akwukwo'], assetKey: 'home:book', fallback: 'Book', label: 'Book' },
  { keys: ['food', 'nri'], assetKey: 'food:food', fallback: 'Food', label: 'Food' },

  { keys: ['greet', 'hello', 'salute', 'salụo', 'saluo', 'bịa', 'bia', 'come'], assetKey: 'verbs:greet', fallback: 'Greet', label: 'Greet' },
  { keys: ['eat', 'rie', 'eri'], assetKey: 'verbs:eat', fallback: 'Eat', label: 'Eat' },
  { keys: ['drink', 'ṅụọ', 'nu', 'ịṅụ'], assetKey: 'verbs:drink', fallback: 'Drink', label: 'Drink' },
  { keys: ['read', 'gụ', 'agu'], assetKey: 'verbs:read', fallback: 'Read', label: 'Read' },
  { keys: ['write', 'dee'], assetKey: 'verbs:write', fallback: 'Write', label: 'Write' },
  { keys: ['run', 'gbaa ọsọ', 'gbaa oso'], assetKey: 'verbs:run', fallback: 'Run', label: 'Run' },
  { keys: ['walk', 'go', 'gaa', 'aga'], assetKey: 'verbs:walk', fallback: 'Walk', label: 'Walk' },
  { keys: ['sleep', 'raa', 'rahu ụra', 'rahu ura'], assetKey: 'verbs:sleep', fallback: 'Sleep', label: 'Sleep' },
  { keys: ['point', 'chọ', 'cho'], assetKey: 'verbs:point', fallback: 'Point', label: 'Point' },
  { keys: ['give', 'nyere'], assetKey: 'verbs:give', fallback: 'Give', label: 'Give' },
  { keys: ['clap', 'kụọ aka', 'kuo aka', 'kpo'], assetKey: 'verbs:clap', fallback: 'Clap', label: 'Clap' },
  { keys: ['think', 'chee', 'nọ', 'no', 'stay', 'be'], assetKey: 'verbs:think', fallback: 'Think', label: 'Think' },
  { keys: ['start', 'begin', 'bido'], assetKey: 'verbs:run', fallback: 'Start', label: 'Start' },
  { keys: ['stop', 'kwụsị', 'kwusi'], assetKey: 'verbs:clap', fallback: 'Stop', label: 'Stop' },
  { keys: ['stand', 'stand up', 'bilie'], assetKey: 'verbs:point', fallback: 'Stand', label: 'Stand' },
  { keys: ['speak', 'talk', 'ekwu', 'kwuru'], assetKey: 'verbs:greet', fallback: 'Speak', label: 'Speak' },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ịìí]/g, 'i')
    .replace(/[ọòó]/g, 'o')
    .replace(/[ụùú]/g, 'u')
    .replace(/[ṅñ]/g, 'n')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenIncludes(combined: string, key: string): boolean {
  const normalizedKey = normalize(key);
  if (normalizedKey.includes(' ')) return combined.includes(normalizedKey);
  return combined.split(/\s+/).includes(normalizedKey);
}

function findIllustration(igbo: string, english: string): IllustrationEntry | undefined {
  const normalizedIgbo = normalize(igbo);
  const normalizedEnglish = normalize(english);
  const combined = normalizedIgbo + ' ' + normalizedEnglish;

  const animalByEnglish: Record<string, string> = {
    dog: 'animals:dog',
    cat: 'animals:cat',
    chicken: 'animals:chicken',
    goat: 'animals:goat',
    fish: 'animals:fish',
    bird: 'animals:bird',
    leopard: 'animals:leopard',
    tiger: 'animals:leopard',
    lion: 'animals:lion',
    elephant: 'animals:elephant',
    rabbit: 'animals:rabbit',
    rat: 'animals:rat',
    python: 'animals:python',
    tortoise: 'animals:tortoise',
    grasshopper: 'animals:grasshopper',
  };

  for (const animalName of Object.keys(animalByEnglish)) {
    if (normalizedEnglish.includes(animalName)) {
      return ILLUSTRATIONS.find(x => x.assetKey === animalByEnglish[animalName]);
    }
  }

  if (normalizedEnglish.includes('grandfather')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:grandfather');
  if (normalizedEnglish.includes('grandmother')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:grandmother');
  if (normalizedEnglish.includes('brother')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:brother');
  if (normalizedEnglish.includes('sister')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:sister');
  if (normalizedEnglish.includes('children')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:children');
  if (normalizedEnglish.includes('child')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:child');
  if (normalizedEnglish.includes('uncle')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:uncle');
  if (normalizedEnglish.includes('aunt')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:aunt');
  if (normalizedEnglish.includes('cousin')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:cousin');
  if (normalizedEnglish.includes('mother') || normalizedEnglish.includes('mum')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:mother');
  if (normalizedEnglish.includes('father') || normalizedEnglish.includes('dad')) return ILLUSTRATIONS.find(x => x.assetKey === 'family:father');

  if (normalizedIgbo === 'nne ochie') return ILLUSTRATIONS.find(x => x.assetKey === 'family:grandmother');
  if (normalizedIgbo === 'nna ochie') return ILLUSTRATIONS.find(x => x.assetKey === 'family:grandfather');
  if (normalizedIgbo === 'nwanne nwoke') return ILLUSTRATIONS.find(x => x.assetKey === 'family:brother');
  if (normalizedIgbo === 'nwanne nwanyi') return ILLUSTRATIONS.find(x => x.assetKey === 'family:sister');
  if (normalizedIgbo === 'umu') return ILLUSTRATIONS.find(x => x.assetKey === 'family:children');
  if (normalizedIgbo === 'nwa') return ILLUSTRATIONS.find(x => x.assetKey === 'family:child');
  if (normalizedIgbo === 'ibe') return ILLUSTRATIONS.find(x => x.assetKey === 'family:cousin');
  if (normalizedIgbo === 'nne') return ILLUSTRATIONS.find(x => x.assetKey === 'family:mother');
  if (normalizedIgbo === 'nna') return ILLUSTRATIONS.find(x => x.assetKey === 'family:father');

  if (normalizedIgbo.includes('eri') || normalizedEnglish.includes('eat')) return ILLUSTRATIONS.find(x => x.assetKey === 'verbs:eat');
  if (normalizedIgbo.includes('agu') || normalizedEnglish.includes('read')) return ILLUSTRATIONS.find(x => x.assetKey === 'verbs:read');
  if (normalizedIgbo.includes('asu') || normalizedEnglish.includes('greet')) return ILLUSTRATIONS.find(x => x.assetKey === 'verbs:greet');
  if (normalizedIgbo.includes('aga') || normalizedEnglish.includes('go') || normalizedEnglish.includes('went')) return ILLUSTRATIONS.find(x => x.assetKey === 'verbs:walk');
  if (normalizedIgbo.includes('ekwu') || normalizedIgbo.includes('kwuru') || normalizedEnglish.includes('speak') || normalizedEnglish.includes('spoke')) return ILLUSTRATIONS.find(x => x.assetKey === 'verbs:greet');

  return ILLUSTRATIONS.find(entry =>
    entry.keys.some(key => tokenIncludes(combined, key))
  );
}

function isTextFallback(source?: ImageSourcePropType): boolean {
  return !source;
}

function isAnimalAsset(assetKey?: string): boolean {
  return Boolean(assetKey && assetKey.startsWith('animals:'));
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
}: Props) {
  const entry = findIllustration(igbo, english);
  const source: ImageSourcePropType | undefined = entry?.assetKey
    ? CUSTOM_ILLUSTRATIONS[entry.assetKey]
    : undefined;

  const bodyAsset = isBodyAsset(entry?.assetKey);
  const animalAsset = isAnimalAsset(entry?.assetKey);
  const label = entry?.label || english || igbo;
  const fallback = entry?.fallback || label;
  const imageResizeMode = bodyAsset || animalAsset ? 'contain' : 'cover';
  const imageBackgroundColor = animalAsset ? '#FFFFFF' : bodyAsset ? '#FFF8EE' : 'transparent';

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: Math.max(18, size * 0.24),
          backgroundColor: animalAsset ? '#FFFFFF' : backgroundColor,
        },
      ]}
    >
      {isTextFallback(source) ? (
        <Text style={[styles.fallbackText, { fontSize: Math.max(10, size * 0.18) }]} numberOfLines={1}>
          {fallback}
        </Text>
      ) : (
        <Image source={source} style={[styles.image, animalAsset && styles.animalImage, { backgroundColor: imageBackgroundColor }]} resizeMode={imageResizeMode} />
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
    borderColor: 'rgba(81, 55, 20, 0.10)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  animalImage: {
    width: '120%',
    height: '120%',
  },
  fallbackText: {
    color: '#171611',
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
