import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = {
  avatar?: string;
  name?: string;
  size?: number;
};

const AVATARS: Record<string, ImageSourcePropType> = {
  adaeze: require('../../../assets/illustrations/custom/avatars/adaeze.png'),
  kaira: require('../../../assets/illustrations/custom/avatars/kaira.png'),
  natachi: require('../../../assets/illustrations/custom/avatars/natachi.png'),
  ebube: require('../../../assets/illustrations/custom/avatars/ebube.png'),
  ekene: require('../../../assets/illustrations/custom/avatars/ekene.png'),
  jc: require('../../../assets/illustrations/custom/avatars/jc.png'),
  somto: require('../../../assets/illustrations/custom/avatars/somto.png'),
  onyeka: require('../../../assets/illustrations/custom/avatars/onyeka.png'),
  chizara: require('../../../assets/illustrations/custom/avatars/chizara.png'),
  kamsi: require('../../../assets/illustrations/custom/avatars/kamsi.png'),
};

const LEGACY_AVATAR_MAP: Record<string, string> = {
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

function normalize(value?: string): string {
  const key = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();

  return LEGACY_AVATAR_MAP[key] ?? key;
}

export function getAvatarIllustrationSource(avatar?: string, name?: string): ImageSourcePropType {
  const key = normalize(avatar || name);
  return AVATARS[key] ?? AVATARS.adaeze;
}

export default function AvatarIllustration({ avatar, name, size = 56 }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Image
        source={getAvatarIllustrationSource(avatar, name)}
        style={styles.image}
        resizeMode="contain"
      />
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
    width: '112%',
    height: '112%',
  },
});
