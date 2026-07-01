import { ImageSourcePropType } from 'react-native';

export type MutaFriendId =
  | 'ada'
  | 'amara'
  | 'chioma'
  | 'ifeoma'
  | 'chinedu'
  | 'obinna'
  | 'kelechi'
  | 'ebuka';

export interface MutaFriend {
  id: MutaFriendId;
  name: string;
  interest: string;
  icon: string;
  description: string;
  image: ImageSourcePropType;
}

export const MUTA_FRIENDS: MutaFriend[] = [
  {
    id: 'ada',
    name: 'Ada',
    interest: 'Loves books',
    icon: '📖',
    description: 'Ada is curious, kind, and loves learning new things.',
    image: require('../../assets/characters/ada_avatar_clean.png'),
  },
  {
    id: 'amara',
    name: 'Amara',
    interest: 'Loves animals',
    icon: '🐾',
    description: 'Amara is gentle, playful, and loves animals.',
    image: require('../../assets/characters/amara_avatar_clean.png'),
  },
  {
    id: 'chioma',
    name: 'Chioma',
    interest: 'Loves songs',
    icon: '🎵',
    description: 'Chioma loves music, rhythm, and singing along.',
    image: require('../../assets/characters/chioma_avatar_clean.png'),
  },
  {
    id: 'ifeoma',
    name: 'Ifeoma',
    interest: 'Loves drawing',
    icon: '🎨',
    description: 'Ifeoma is creative and loves drawing colorful pictures.',
    image: require('../../assets/characters/ifeoma_avatar_clean.png'),
  },
  {
    id: 'chinedu',
    name: 'Chinedu',
    interest: 'Loves stories',
    icon: '📚',
    description: 'Chinedu loves folktales, stories, and adventures.',
    image: require('../../assets/characters/chinedu_avatar_clean.png'),
  },
  {
    id: 'obinna',
    name: 'Obinna',
    interest: 'Loves football',
    icon: '⚽',
    description: 'Obinna is energetic and loves games and movement.',
    image: require('../../assets/characters/obinna_avatar_clean.png'),
  },
  {
    id: 'kelechi',
    name: 'Kelechi',
    interest: 'Loves drums',
    icon: '🥁',
    description: 'Kelechi loves drums, dancing, and celebration.',
    image: require('../../assets/characters/kelechi_avatar_clean.png'),
  },
  {
    id: 'ebuka',
    name: 'Ebuka',
    interest: 'Loves puzzles',
    icon: '🧩',
    description: 'Ebuka loves puzzles, patterns, and solving problems.',
    image: require('../../assets/characters/ebuka_avatar_clean.png'),
  },
];

const LEGACY_AVATAR_MAP: Record<string, MutaFriendId> = {
  girl: 'ada',
  boy: 'chinedu',
  '👧🏾': 'ada',
  '👧🏽': 'amara',
  '👧🏻': 'chioma',
  '👦🏾': 'chinedu',
  '👦🏽': 'obinna',
  '👦🏻': 'ebuka',
  '🧒🏾': 'kelechi',
  '🧒🏽': 'ifeoma',
};

export function normalizeFriendId(value: string | undefined | null): MutaFriendId {
  if (!value) return 'ada';
  if (MUTA_FRIENDS.some(friend => friend.id === value)) return value as MutaFriendId;
  return LEGACY_AVATAR_MAP[value] ?? 'ada';
}

export function getMutaFriend(value: string | undefined | null): MutaFriend {
  const id = normalizeFriendId(value);
  return MUTA_FRIENDS.find(friend => friend.id === id) ?? MUTA_FRIENDS[0];
}
