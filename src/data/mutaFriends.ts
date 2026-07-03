import { ImageSourcePropType } from 'react-native';

export type MutaFriendId =
  | 'adaeze'
  | 'kaira'
  | 'natachi'
  | 'ebube'
  | 'ekene'
  | 'jc'
  | 'somto'
  | 'onyeka'
  | 'chizara'
  | 'kamsi';

export interface MutaFriend {
  id: MutaFriendId;
  name: string;
  subtitle: string;
  interest: string;
  icon: string;
  description: string;
  image: ImageSourcePropType;
}

export const MUTA_FRIENDS: MutaFriend[] = [
  { id: 'adaeze', name: 'Adaeze', subtitle: 'Kind and curious', interest: 'Kind and curious', icon: '🌟', description: 'Adaeze is kind, curious, and ready to learn.', image: require('../../assets/illustrations/custom/avatars/adaeze.png') },
  { id: 'kaira', name: 'Kaira', subtitle: 'Sound star', interest: 'Sound star', icon: '🎵', description: 'Kaira loves sounds and songs.', image: require('../../assets/illustrations/custom/avatars/kaira.png') },
  { id: 'natachi', name: 'Natachi', subtitle: 'Reading friend', interest: 'Reading friend', icon: '📖', description: 'Natachi enjoys reading.', image: require('../../assets/illustrations/custom/avatars/natachi.png') },
  { id: 'ebube', name: 'Ebube', subtitle: 'Bright helper', interest: 'Bright helper', icon: '✨', description: 'Ebube is ready to help.', image: require('../../assets/illustrations/custom/avatars/ebube.png') },
  { id: 'ekene', name: 'Ekene', subtitle: 'Word explorer', interest: 'Word explorer', icon: '🧭', description: 'Ekene loves discovering new words.', image: require('../../assets/illustrations/custom/avatars/ekene.png') },
  { id: 'jc', name: 'JC', subtitle: 'Brave learner', interest: 'Brave learner', icon: '🏅', description: 'JC learns with courage.', image: require('../../assets/illustrations/custom/avatars/jc.png') },
  { id: 'somto', name: 'Somto', subtitle: 'Story friend', interest: 'Story friend', icon: '⚽', description: 'Somto enjoys stories and games.', image: require('../../assets/illustrations/custom/avatars/somto.png') },
  { id: 'onyeka', name: 'Onyeka', subtitle: 'Culture buddy', interest: 'Culture buddy', icon: '🌍', description: 'Onyeka loves culture and family.', image: require('../../assets/illustrations/custom/avatars/onyeka.png') },
  { id: 'chizara', name: 'Chizara', subtitle: 'Animal guide', interest: 'Animal guide', icon: '🐾', description: 'Chizara loves animals and nature.', image: require('../../assets/illustrations/custom/avatars/chizara.png') },
  { id: 'kamsi', name: 'Kamsi', subtitle: 'Little helper', interest: 'Little helper', icon: '🤝', description: 'Kamsi is a cheerful helper.', image: require('../../assets/illustrations/custom/avatars/kamsi.png') },
];

const LEGACY_AVATAR_MAP: Record<string, MutaFriendId> = {
  ada: 'adaeze',
  amara: 'chizara',
  chioma: 'kaira',
  ifeoma: 'natachi',
  chinedu: 'ekene',
  obinna: 'somto',
  kelechi: 'jc',
  ebuka: 'ebube',
  girl: 'kaira',
  boy: 'ekene',
  '👧🏾': 'adaeze',
  '👧🏽': 'kaira',
  '👧🏻': 'natachi',
  '👦🏾': 'ekene',
  '👦🏽': 'somto',
  '👦🏻': 'jc',
  '🧒🏾': 'ebube',
  '🧒🏽': 'kamsi',
};

export function normalizeFriendId(value: string | undefined | null): MutaFriendId {
  if (!value) return 'adaeze';
  if (MUTA_FRIENDS.some(friend => friend.id === value)) return value as MutaFriendId;
  return LEGACY_AVATAR_MAP[value] ?? 'adaeze';
}

export const normalizeAvatarId = normalizeFriendId;

export function getMutaFriend(value: string | undefined | null): MutaFriend {
  const id = normalizeFriendId(value);
  return MUTA_FRIENDS.find(friend => friend.id === id) ?? MUTA_FRIENDS[0];
}


export function getLessonGuideFriend(activeAvatar: string | undefined | null, seed = ''): MutaFriend {
  const activeId = normalizeFriendId(activeAvatar);
  const available = MUTA_FRIENDS.filter(friend => friend.id !== activeId);

  if (available.length === 0) {
    return getMutaFriend(activeId);
  }

  const stableSeed = String(seed || 'default');
  const hash = stableSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return available[hash % available.length];
}
