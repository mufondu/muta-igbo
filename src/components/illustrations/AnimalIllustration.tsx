import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export type AnimalId =
  | 'dog'
  | 'cat'
  | 'chicken'
  | 'goat'
  | 'fish'
  | 'bird'
  | 'leopard'
  | 'lion'
  | 'elephant'
  | 'rabbit'
  | 'rat'
  | 'python'
  | 'tortoise'
  | 'grasshopper';

type Props = {
  animal: AnimalId | string;
  size?: number;
};

const ANIMAL_IMAGES: Record<string, any> = {
  dog: require('../../../assets/illustrations/custom/animals/dog.png'),
  cat: require('../../../assets/illustrations/custom/animals/cat.png'),
  chicken: require('../../../assets/illustrations/custom/animals/chicken.png'),
  goat: require('../../../assets/illustrations/custom/animals/goat.png'),
  fish: require('../../../assets/illustrations/custom/animals/fish.png'),
  bird: require('../../../assets/illustrations/custom/animals/bird.png'),
  leopard: require('../../../assets/illustrations/custom/animals/leopard.png'),
  lion: require('../../../assets/illustrations/custom/animals/lion.png'),
  elephant: require('../../../assets/illustrations/custom/animals/elephant.png'),
  rabbit: require('../../../assets/illustrations/custom/animals/rabbit.png'),
  rat: require('../../../assets/illustrations/custom/animals/rat.png'),
  python: require('../../../assets/illustrations/custom/animals/python.png'),
  tortoise: require('../../../assets/illustrations/custom/animals/tortoise.png'),
  grasshopper: require('../../../assets/illustrations/custom/animals/grasshopper.png'),
};

export function AnimalIllustration({ animal, size = 88 }: Props) {
  const source = ANIMAL_IMAGES[String(animal).toLowerCase()] ?? ANIMAL_IMAGES.tortoise;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  image: {
    width: '112%',
    height: '112%',
  },
});
