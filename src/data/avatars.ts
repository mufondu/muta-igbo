import { ImageSourcePropType } from 'react-native';

export type MutaFriendId =
  | 'ada'
  | 'amara'
  | 'chioma'
  | 'ifeoma'
  | 'chinedu'
  | 'obinna'
  | 'kelechi'
  | 'ebuka'
  | '👦🏾'
  | '👧🏾'
  | '👦🏽'
  | '👧🏽'
  | '👦🏻'
  | '👧🏻'
  | '🧒🏾'
  | '🧒🏽'
  | 'girl'
  | 'boy';

export interface MutaFriend {
  id: MutaFriendId;
  name: string;
  gender: 'girl' | 'boy';
  trait: string;
  image: ImageSourcePropType;
}

const ADA = require('../../assets/characters/ada.png');
const AMARA = require('../../assets/characters/amara.png');
const CHIOMA = require('../../assets/characters/chioma.png');
const IFEOMA = require('../../assets/characters/ifeoma.png');
const CHINEDU = require('../../assets/characters/chinedu.png');
const OBINNA = require('../../assets/characters/obinna.png');
const KELECHI = require('../../assets/characters/kelechi.png');
const EBUKA = require('../../assets/characters/ebuka.png');

export const MUTA_FRIENDS: MutaFriend[] = [
  { id: 'ada', name: 'Ada', gender: 'girl', trait: 'Loves books', image: ADA },
  { id: 'amara', name: 'Amara', gender: 'girl', trait: 'Loves animals', image: AMARA },
  { id: 'chioma', name: 'Chioma', gender: 'girl', trait: 'Loves songs', image: CHIOMA },
  { id: 'ifeoma', name: 'Ifeoma', gender: 'girl', trait: 'Loves drawing', image: IFEOMA },
  { id: 'chinedu', name: 'Chinedu', gender: 'boy', trait: 'Loves stories', image: CHINEDU },
  { id: 'obinna', name: 'Obinna', gender: 'boy', trait: 'Loves football', image: OBINNA },
  { id: 'kelechi', name: 'Kelechi', gender: 'boy', trait: 'Loves drums', image: KELECHI },
  { id: 'ebuka', name: 'Ebuka', gender: 'boy', trait: 'Loves puzzles', image: EBUKA },
];

const LEGACY_AVATAR_MAP: Record<string, MutaFriendId> = {
  girl: 'ada',
  '👧🏾': 'ada',
  '👧🏽': 'amara',
  '👧🏻': 'chioma',
  boy: 'chinedu',
  '👦🏾': 'chinedu',
  '👦🏽': 'obinna',
  '👦🏻': 'kelechi',
  '🧒🏾': 'ebuka',
  '🧒🏽': 'ifeoma',
};

export function normalizeAvatarId(avatar?: string | null): MutaFriendId {
  if (!avatar) return 'ada';
  if (MUTA_FRIENDS.some(friend => friend.id === avatar)) return avatar as MutaFriendId;
  return LEGACY_AVATAR_MAP[avatar] ?? 'ada';
}

export function getMutaFriend(avatar?: string | null): MutaFriend {
  const normalized = normalizeAvatarId(avatar);
  return MUTA_FRIENDS.find(friend => friend.id === normalized) ?? MUTA_FRIENDS[0];
}
