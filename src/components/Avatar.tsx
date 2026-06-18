// 이니셜 원형 아바타. 프로필은 라임 바탕에 어두운 글자, 친구/보증은 각자 색 바탕에 흰 글자.
// 사진이 아니라 이니셜이라 로딩이 없고 어디서나 즉시 그려진다.
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';

type Props = {
  initial: string;
  size?: number;
  background?: string;
  color?: string;
};

export function Avatar({ initial, size = 56, background = colors.lime, color = colors.onLime }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: background },
      ]}>
      <Text style={[styles.initial, { color, fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: font.bold, includeFontPadding: false },
});
