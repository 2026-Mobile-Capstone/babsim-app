// 전체 급식표 — 홈 헤더 달력 아이콘의 목적지. 그 주 월~일 조식을 한눈에. 이전/다음 주로 넘긴다.
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radius, space } from '@/theme/tokens';
import { fetchMenuWeek, type MenuWeekResponse } from '@/api/client';
import { todayKst } from '@/lib/time';
import { IconButton } from '@/components/IconButton';
import { SfIcon } from '@/components/SfIcon';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function md(d: string): string {
  return `${+d.slice(4, 6)}/${+d.slice(6, 8)}`;
}

// 기준 날짜를 days만큼 옮긴다(주 단위 이동에 ±7).
function shift(date: string, days: number): string {
  const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8)));
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

export default function MenuWeekScreen() {
  const insets = useSafeAreaInsets();
  const [anchor, setAnchor] = useState(() => todayKst());
  const [data, setData] = useState<MenuWeekResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const today = todayKst();

  const load = useCallback(async (date: string) => {
    setLoading(true);
    try {
      setData(await fetchMenuWeek(date));
    } catch {
      // 실패 시 이전 데이터 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(anchor);
  }, [anchor, load]);

  const rangeLabel = data ? `${md(data.week_start)} – ${md(shift(data.week_start, 6))}` : '';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <IconButton name="chevron.left" fallbackGlyph="‹" color={colors.textMuted} onPress={() => router.back()} />
        <Text style={styles.title}>급식표</Text>
        <View style={{ width: space.iconButton }} />
      </View>

      <View style={styles.weekNav}>
        <IconButton name="chevron.left" fallbackGlyph="‹" color={colors.textSecondary} background={colors.surfaceSunken} onPress={() => setAnchor((a) => shift(a, -7))} />
        <Text style={styles.range}>{rangeLabel || '이번 주'}</Text>
        <IconButton name="chevron.right" fallbackGlyph="›" color={colors.textSecondary} background={colors.surfaceSunken} onPress={() => setAnchor((a) => shift(a, 7))} />
      </View>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.lime} />
        </View>
      ) : data ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
          {data.days.map((day, i) => {
            const isToday = day.date === today;
            return (
              <View key={day.date} style={[styles.dayRow, isToday && styles.dayRowToday]}>
                <View style={[styles.dayBadge, isToday && styles.dayBadgeToday]}>
                  <Text style={[styles.dayWd, isToday && styles.dayWdToday]}>{WEEKDAYS[i]}</Text>
                  <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>{md(day.date)}</Text>
                </View>
                <View style={styles.dayBody}>
                  {day.has_meal ? (
                    <View style={styles.chips}>
                      {day.menu.map((dish) => (
                        <View key={dish} style={[styles.chip, isToday && styles.chipToday]}>
                          <Text style={[styles.chipText, isToday && styles.chipTextToday]}>{dish}</Text>
                        </View>
                      ))}
                      {day.kcal ? (
                        <View style={styles.kcalChip}>
                          <SfIcon name="flame.fill" size={11} color={colors.lime} fallbackGlyph="🔥" />
                          <Text style={styles.kcalText}>{day.kcal} kcal</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <Text style={styles.noMeal}>급식 없음</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter + 4, paddingBottom: 8 },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 8 },
  range: { fontFamily: font.semibold, fontSize: 15, color: colors.bone, minWidth: 120, textAlign: 'center', letterSpacing: 0.2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  list: { paddingHorizontal: space.gutter, gap: 10, paddingTop: 6 },
  dayRow: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.card, padding: 16 },
  dayRowToday: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.limeBorder },
  dayBadge: { width: 48, alignItems: 'center', gap: 2, paddingTop: 2 },
  dayBadgeToday: {},
  dayWd: { fontFamily: font.bold, fontSize: 16, color: colors.textSecondary },
  dayWdToday: { color: colors.lime },
  dayDate: { fontFamily: font.medium, fontSize: 11.5, color: colors.textFaint },
  dayDateToday: { color: colors.lime },
  dayBody: { flex: 1, justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: colors.surfaceSunken, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 },
  chipToday: { backgroundColor: colors.limeWash },
  chipText: { fontFamily: font.medium, fontSize: 12.5, color: colors.textSecondary, letterSpacing: -0.1 },
  chipTextToday: { color: colors.bone },
  kcalChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.limeWash, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  kcalText: { fontFamily: font.semibold, fontSize: 11.5, color: colors.lime, letterSpacing: -0.1 },
  noMeal: { fontFamily: font.medium, fontSize: 13.5, color: colors.textFaint },
});
