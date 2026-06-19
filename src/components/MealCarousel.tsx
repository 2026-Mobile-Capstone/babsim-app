// 식단 카드 가로 캐러셀. 스냅으로 한 장씩 넘어가고, 가운데로 올수록 카드가 커지고 또렷해진다(양옆은 작고 흐릿).
// 페이지 닷도 스크롤 위치를 따라 늘었다 줄었다 한다. 전부 reanimated 스크롤 값(scrollX) 하나로 굴린다.
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import type { MealDay } from '@/data/mockData';
import { MealCard } from '@/components/MealCard';

const GAP = 14;
const CARD_RATIO = 0.72; // 화면 너비 대비 카드 폭

export function MealCarousel({ days }: { days: MealDay[] }) {
  // 폭은 useWindowDimensions 대신 실제 레이아웃 폭(onLayout)으로 잡는다.
  // 웹 정적 렌더(SSR)에선 useWindowDimensions가 엉뚱한 값(예: 76)으로 굳어 카드가 찌부되는 일이 있어서다.
  const [width, setWidth] = useState(0);
  const cardWidth = Math.round(width * CARD_RATIO);
  const snap = cardWidth + GAP;
  const sidePad = (width - cardWidth) / 2 - GAP / 2; // 첫/마지막 카드도 정중앙에 오게

  const initialIndex = Math.max(0, days.findIndex((d) => d.isToday));
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // 폭이 정해지면 오늘 카드로 초기 위치를 잡는다(네이티브 contentOffset가 안 먹는 웹까지 커버).
  useEffect(() => {
    if (width > 0 && initialIndex > 0) {
      const x = initialIndex * snap;
      scrollX.value = x;
      scrollRef.current?.scrollTo({ x, animated: false });
    }
  }, [width, initialIndex, snap, scrollX]);

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== width) setWidth(w);
  }

  return (
    <View onLayout={onLayout}>
      {cardWidth > 0 && (
        <>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={snap}
            decelerationRate="fast"
            contentOffset={{ x: initialIndex * snap, y: 0 }}
            contentContainerStyle={{ paddingHorizontal: sidePad }}
            onScroll={onScroll}
            scrollEventThrottle={16}>
            {days.map((day, index) => (
              <CarouselItem key={day.id} day={day} index={index} scrollX={scrollX} cardWidth={cardWidth} snap={snap} />
            ))}
          </Animated.ScrollView>

          <View style={styles.dots}>
            {days.map((day, index) => (
              <Dot key={day.id} index={index} scrollX={scrollX} snap={snap} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function CarouselItem({
  day,
  index,
  scrollX,
  cardWidth,
  snap,
}: {
  day: MealDay;
  index: number;
  scrollX: SharedValue<number>;
  cardWidth: number;
  snap: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * snap);
    const scale = interpolate(distance, [0, snap], [1, 0.9], 'clamp');
    const opacity = interpolate(distance, [0, snap], [1, 0.45], 'clamp');
    return { transform: [{ scale }], opacity };
  });

  return (
    // flexShrink:0 — 웹의 가로 ScrollView는 고정폭 자식도 줄여 버려서(카드가 한 글자 폭으로 찌부됨) 명시로 막는다.
    <Animated.View style={[{ width: cardWidth, marginHorizontal: GAP / 2, flexShrink: 0 }, animatedStyle]}>
      <MealCard day={day} />
    </Animated.View>
  );
}

function Dot({ index, scrollX, snap }: { index: number; scrollX: SharedValue<number>; snap: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * snap);
    const width = interpolate(distance, [0, snap], [22, 7], 'clamp');
    const opacity = interpolate(distance, [0, snap], [1, 0.35], 'clamp');
    return { width, opacity };
  });
  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 7, marginTop: 18 },
  dot: { height: 7, borderRadius: 999, backgroundColor: colors.lime },
});
