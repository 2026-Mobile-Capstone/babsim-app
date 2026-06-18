// 헤더에 쓰는 44px 원형 아이콘 버튼(햄버거·벨·기어). 누르면 살짝 줄어든다.
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { SymbolViewProps } from 'expo-symbols';

import { colors, radius, space } from '@/theme/tokens';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

type Props = {
  name: SymbolViewProps['name'];
  fallbackGlyph?: string;
  onPress?: () => void;
  color?: string;
  background?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  name,
  fallbackGlyph,
  onPress,
  color = colors.text,
  background = colors.surface,
  size = 22,
  style,
}: Props) {
  return (
    <PressableScale onPress={onPress} style={[styles.button, { backgroundColor: background }, style]} hitSlop={6}>
      <SfIcon name={name} size={size} color={color} weight="medium" fallbackGlyph={fallbackGlyph} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: space.iconButton,
    height: space.iconButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
