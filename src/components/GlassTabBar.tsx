// 하단 플로팅 탭바 — 요구사항 1의 주인공. expo-router의 커스텀 tabBar로 그린다.
// (네이티브 NativeTabs는 alpha라 라임 pill로 못 꾸며서, JS Tabs + 이 커스텀 바로 갔다.)
// 바 자체는 GlassSurface(=iOS26 Liquid Glass / 그 외 블러)로 띄우고, 활성 탭 아이콘 뒤로 라임 원이 스프링으로 미끄러진다.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type BottomTabBarProps } from 'expo-router/js-tabs';
import type { SymbolViewProps } from 'expo-symbols';

import { colors, font, radius, space } from '@/theme/tokens';
import { GlassSurface, isLiquidGlass } from '@/components/GlassSurface';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

// 라우트 이름 -> 아이콘/라벨. 파일명(index/records/profile)이 곧 라우트 이름이다.
const TAB_META: Record<string, { icon: SymbolViewProps['name']; fallback: string; label: string }> = {
  index: { icon: 'house.fill', fallback: '⌂', label: '홈' },
  records: { icon: 'fork.knife', fallback: '🍴', label: '먹은 기록' },
  profile: { icon: 'person.fill', fallback: '👤', label: '마이페이지' },
};

const INDICATOR = 40; // 활성 아이콘 뒤 라임 원 지름
const PAD_TOP = 10;

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const slotWidth = barWidth > 0 ? barWidth / state.routes.length : 0;

  const indicatorX = useSharedValue(0);
  useEffect(() => {
    if (slotWidth > 0) {
      indicatorX.value = withSpring(state.index * slotWidth, { damping: 16, stiffness: 170, mass: 0.7 });
    }
  }, [state.index, slotWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }));

  return (
    // box-none: 바 밖 영역은 터치를 아래(스크롤)로 흘려보내 콘텐츠가 바 밑으로 자연스럽게 지나가게 한다.
    <View style={[styles.wrap, { paddingBottom: insets.bottom > 0 ? insets.bottom : 14 }]} pointerEvents="box-none">
      <GlassSurface
        style={[styles.bar, !isLiquidGlass && styles.barBorder]}
        tintColor="rgba(20,24,16,0.25)"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {slotWidth > 0 && (
          <Animated.View style={[styles.indicatorSlot, { width: slotWidth }, indicatorStyle]} pointerEvents="none">
            <View style={styles.indicator} />
          </Animated.View>
        )}

        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name] ?? { icon: 'circle', fallback: '•', label: route.name };
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <PressableScale key={route.key} onPress={onPress} scaleTo={0.9} style={styles.tab}>
              <View style={styles.iconRow}>
                <SfIcon
                  name={meta.icon}
                  size={22}
                  weight={isFocused ? 'bold' : 'regular'}
                  color={isFocused ? colors.onLime : colors.textDim}
                  fallbackGlyph={meta.fallback}
                />
              </View>
              <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>{meta.label}</Text>
            </PressableScale>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 480,
    marginHorizontal: space.gutter,
    paddingTop: PAD_TOP,
    paddingBottom: 12,
    borderRadius: radius.sheet,
    // 플로팅 느낌의 그림자(안드로이드는 elevation).
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  barBorder: { borderWidth: 1, borderColor: colors.navBorder }, // 글래스 폴백일 때 가장자리 살짝
  indicatorSlot: { position: 'absolute', top: PAD_TOP, height: INDICATOR, alignItems: 'center', justifyContent: 'center' },
  indicator: { width: INDICATOR, height: INDICATOR, borderRadius: radius.pill, backgroundColor: colors.lime },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconRow: { height: INDICATOR, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, letterSpacing: -0.1, includeFontPadding: false },
  labelActive: { color: colors.lime, fontFamily: font.bold },
  labelInactive: { color: colors.textDim, fontFamily: font.medium },
});
