// SF Symbols 아이콘 한 겹 래퍼. iOS에선 또렷한 시스템 심볼이 나오고,
// 안드로이드/웹에선 SymbolView가 문자열 name만으론 아무것도 안 그리므로 fallbackGlyph(이모지/문자)를 꼭 받아 대신 보여준다.
import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { Text } from 'react-native';

import { colors } from '@/theme/tokens';

type Props = {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  fallbackGlyph?: string;
};

export function SfIcon({ name, size = 22, color = colors.text, weight = 'regular', fallbackGlyph }: Props) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      fallback={
        fallbackGlyph ? <Text style={{ fontSize: size * 0.84, color, lineHeight: size + 2 }}>{fallbackGlyph}</Text> : undefined
      }
    />
  );
}
