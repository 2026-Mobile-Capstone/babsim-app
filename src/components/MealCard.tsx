// 식단 카드(어제/오늘/내일). 캐러셀 안에서 가운데로 온 카드가 표면 사다리를 타고 떠오른다
// — 그림자 + 밝은 표면(surfaceAlt) + scale 1 + 살짝 위로. 양옆 날은 어두운 표면(surfaceSunken)으로 가라앉는다.
// 높이는 cardHeight로 고정한다: 메뉴가 적은 날도 카드가 안 줄어들어 세 장이 같은 크기로 보인다.
// 실서버 메뉴엔 칼로리·만족도가 없을 수 있어서, 있으면 보여주고 없으면 생략한다. 급식 없는 날도 처리.
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, font, radius } from '@/theme/tokens';
import type { MealDay } from '@/data/mockData';
import { SfIcon } from '@/components/SfIcon';

type Props = {
  day: MealDay;
  // 캐러셀 스크롤에 묶어 깊이(떠오름)를 만든다. snap = 카드 한 칸 폭(+간격).
  scrollX: SharedValue<number>;
  index: number;
  snap: number;
  cardHeight: number;
};

export function MealCard({ day, scrollX, index, snap, cardHeight }: Props) {
  // 오늘 카드만 제목/아이콘을 라임으로 강조한다(떠오름은 '가운데로 온 카드', 라임 강조는 '오늘' — 서로 독립).
  const title = day.isToday ? `오늘의 ${day.meal}` : `${day.label} ${day.meal}`;
  const accent = day.isToday ? colors.lime : colors.text;
  const hasMeal = day.menu.length > 0;

  // 부제: '조식 · (520 kcal ·) 6/15 월'
  const subParts = [day.meal];
  if (day.kcal) subParts.push(`${day.kcal} kcal`);
  subParts.push(day.dateLabel);

  // 가운데(거리 0)일수록 떠오른다: 큰 scale·셈 그림자·밝은 표면. 멀수록 가라앉는다: 작고·어둡고·아래로·흐리게.
  const lift = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * snap);
    return {
      transform: [
        { scale: interpolate(distance, [0, snap], [1, 0.86], 'clamp') },
        { translateY: interpolate(distance, [0, snap], [0, 7], 'clamp') },
      ],
      // 양옆도 어제/내일이 읽힐 만큼은 남긴다(0.62) — 가운데 팝아웃은 scale·그림자·밝은 표면으로 충분히 선다.
      opacity: interpolate(distance, [0, snap], [1, 0.62], 'clamp'),
      backgroundColor: interpolateColor(distance, [0, snap], [colors.surfaceAlt, colors.surfaceSunken]),
      // iOS 그림자(떠오른 카드만). Android는 elevation으로 근사.
      shadowOpacity: interpolate(distance, [0, snap], [0.55, 0], 'clamp'),
      shadowRadius: interpolate(distance, [0, snap], [22, 6], 'clamp'),
      shadowOffset: { width: 0, height: interpolate(distance, [0, snap], [14, 2], 'clamp') },
      elevation: interpolate(distance, [0, snap], [12, 0], 'clamp'),
    };
  });

  return (
    <Animated.View style={[styles.card, { height: cardHeight }, lift]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, !day.isToday && styles.iconBoxMuted]}>
          <SfIcon name="fork.knife" size={22} color={day.isToday ? colors.onLime : colors.lime} weight="bold" fallbackGlyph="🍴" />
        </View>
        <View style={styles.headText}>
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
          <Text style={styles.sub}>{subParts.join(' · ')}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {hasMeal ? (
        // flex:1 — 남는 높이를 메뉴가 먹어 항목은 위 정렬, 짧은 메뉴는 아래 여백. 그래서 카드 높이가 일정해도 안 비어 보인다.
        <View style={styles.menu}>
          {day.menu.map((item) => (
            <View key={item} style={styles.menuRow}>
              <View style={styles.dot} />
              <Text style={styles.menuText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <SfIcon name="moon.zzz.fill" size={18} color={colors.textFaint} fallbackGlyph="💤" />
          <Text style={styles.emptyText}>이 날은 급식이 없어요</Text>
        </View>
      )}

      {day.certifiedCount != null && day.certifiedCount > 0 && (
        <View style={styles.footer}>
          <SfIcon name="star.fill" size={13} color={colors.lime} fallbackGlyph="★" />
          <Text style={styles.footerStrong}>만족도 {(day.rating ?? 0).toFixed(1)}</Text>
          <Text style={styles.footerDim}>·</Text>
          <Text style={styles.footerDim}>{day.certifiedCount.toLocaleString()}명 인증</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // backgroundColor는 lift에서 애니메이트한다(surfaceAlt↔surfaceSunken). 여기선 정적인 것만.
  // overflow:'hidden'을 쓰면 iOS 그림자가 죽어서 쓰지 않는다.
  card: { borderRadius: radius.cardLg, padding: 20, gap: 14, shadowColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: radius.field, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  iconBoxMuted: { backgroundColor: colors.limeWash },
  headText: { flex: 1, gap: 2 },
  title: { fontFamily: font.bold, fontSize: 18, letterSpacing: -0.3 },
  sub: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint, letterSpacing: -0.1 },
  divider: { height: 1, backgroundColor: colors.divider },
  menu: { flex: 1, gap: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  dot: { width: 4, height: 4, borderRadius: 999, backgroundColor: colors.textDim },
  menuText: { fontFamily: font.medium, fontSize: 14.5, color: colors.text, letterSpacing: -0.2 },
  empty: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: colors.textFaint },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  footerStrong: { fontFamily: font.medium, fontSize: 12.5, color: colors.textSecondary, letterSpacing: -0.1 },
  footerDim: { fontFamily: font.medium, fontSize: 12.5, color: colors.textFaint, letterSpacing: -0.1 },
});
