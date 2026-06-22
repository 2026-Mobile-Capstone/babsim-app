// 식단 카드(어제/오늘/내일). 캐러셀 안에서 가운데(오늘)가 포커스.
// 실서버 메뉴엔 칼로리·만족도가 없을 수 있어서, 있으면 보여주고 없으면 생략한다. 급식 없는 날도 처리.
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';
import type { MealDay } from '@/data/mockData';
import { SfIcon } from '@/components/SfIcon';

export function MealCard({ day }: { day: MealDay }) {
  // 오늘 카드만 제목/아이콘을 라임으로 강조한다.
  const title = day.isToday ? `오늘의 ${day.meal}` : `${day.label} ${day.meal}`;
  const accent = day.isToday ? colors.lime : colors.text;
  const hasMeal = day.menu.length > 0;

  // 부제: '조식 · (520 kcal ·) 6/15 월'
  const subParts = [day.meal];
  if (day.kcal) subParts.push(`${day.kcal} kcal`);
  subParts.push(day.dateLabel);

  return (
    <View style={styles.card}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.cardLg, padding: 20, gap: 13 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: radius.field, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  iconBoxMuted: { backgroundColor: colors.limeWash },
  headText: { flex: 1, gap: 2 },
  title: { fontFamily: font.bold, fontSize: 18, letterSpacing: -0.3 },
  sub: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint, letterSpacing: -0.1 },
  divider: { height: 1, backgroundColor: colors.divider },
  menu: { gap: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  dot: { width: 4, height: 4, borderRadius: 999, backgroundColor: colors.textDim },
  menuText: { fontFamily: font.medium, fontSize: 14.5, color: colors.text, letterSpacing: -0.2 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: colors.textFaint },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  footerStrong: { fontFamily: font.medium, fontSize: 12.5, color: colors.textSecondary, letterSpacing: -0.1 },
  footerDim: { fontFamily: font.medium, fontSize: 12.5, color: colors.textFaint, letterSpacing: -0.1 },
});
