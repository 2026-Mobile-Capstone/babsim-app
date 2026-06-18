// 둥근 "유리" 컨테이너. 요구사항 1(애플 Native Liquid Glass)의 핵심 폴백 로직을 여기 한 곳에 둔다.
// 3단으로 떨어진다:
//   1) iOS 26+         -> expo-glass-effect의 GlassView (진짜 Liquid Glass)
//   2) 그 외(블러 가능) -> expo-blur의 BlurView로 반투명 유리 흉내
//   3) 최종            -> 불투명 토큰색 View (디자인이 깨지지 않게)
// liquidGlass 여부는 모듈 로드 때 한 번만 본다(런타임에 바뀌지 않음).
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/theme/tokens';

export const isLiquidGlass = isLiquidGlassAvailable();

type Props = ViewProps & {
  glassStyle?: 'regular' | 'clear';
  tintColor?: string; // Liquid Glass 위에 얹는 옅은 색조(없으면 시스템 기본)
  blurTint?: 'dark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark';
  blurIntensity?: number;
  // 블러/최종 폴백에서 밑에 까는 색. 살짝 불투명해야 글자 대비가 산다.
  fallbackColor?: string;
  interactive?: boolean;
};

export function GlassSurface({
  glassStyle = 'regular',
  tintColor,
  blurTint = 'dark',
  blurIntensity = 36,
  fallbackColor = 'rgba(24,26,20,0.72)',
  interactive = true,
  style,
  children,
  ...rest
}: Props) {
  if (isLiquidGlass) {
    return (
      <GlassView glassEffectStyle={glassStyle} isInteractive={interactive} tintColor={tintColor} style={style} {...rest}>
        {children}
      </GlassView>
    );
  }

  // overflow:hidden으로 블러를 둥근 모서리에 맞춰 자른다. 블러 위에 옅은 색을 깔아 대비를 확보.
  return (
    <View style={[style, styles.clip]} {...rest}>
      <BlurView tint={blurTint} intensity={blurIntensity} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fallbackColor }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
