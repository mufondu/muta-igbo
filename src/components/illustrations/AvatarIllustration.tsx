import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  size?: number;
};

export default function AvatarIllustration({ source, size = 56 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  image: {
    width: '118%',
    height: '118%',
  },
});
