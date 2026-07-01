import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';
import { getMutaFriend } from '../data/mutaFriends';

interface Props {
  avatar: string | undefined | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export default function MutaFriendAvatar({ avatar, size = 56, style, imageStyle }: Props) {
  const friend = getMutaFriend(avatar);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        style,
      ]}
    >
      <Image
        source={friend.image}
        style={[
          {
            width: size,
            height: size,
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
}
