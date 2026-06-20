import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, font, heat, radius, space, tabular } from '@/theme/tokens';
import { fetchHistory, type HistoryResponse, type HistoryStats } from '@/api/client';
import type { StatCardData } from '@/data/mockData';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';
import { StatCard } from '@/components/StatCard';

const CURRENT_YEAR = new Date().getFullYear();

function toStatCards(s: HistoryStats): StatCardData[] {
  return [
    { symbol: 'flame.fill', fallbackGlyph: '🔥', value: String(s.best_streak), unit: '일', label: '최고 연속', sub: '이 해 가장 길게' },
    { symbol: 'fork.knife', fallbackGlyph: '🍴', value: String(s.avg_sides), unit: '개', label: '평균 받은 반찬', sub: '받은 날 기준' },
    { symbol: 'calendar', fallbackGlyph: '📅', value: String(s.verified_days), unit: '일', label: '인증한 날', sub: '이 해 누적' },
    { symbol: 'checkmark.seal.fill', fallbackGlyph: '✓', value: String(s.success_rate), unit: '%', label: '인증 성공률', sub: '시도한 날 기준' },
  ];
}

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const canNext = year < CURRENT_YEAR;

  const load = useCallback(async (y: number) => {
    setLoading(true);
    try {
      setData(await fetchHistory(y));
    } catch {
      // 실패 시 이전 데이터 유지(빈 화면보단 낫다)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(year);
  }, [year, load]);

  const cards = data ? toStatCards(data.stats) : [];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 96 }]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>먹은 기록</Text>
            <Text style={styles.subtitle}>아침 인증 기록</Text>
          </View>
          <View style={styles.yearNav}>
            <PressableScale onPress={() => setYear((y) => y - 1)} hitSlop={8} style={styles.yearArrow}>
              <SfIcon name="chevron.left" size={13} color={colors.textMuted} fallbackGlyph="‹" />
            </PressableScale>
            <Text style={[styles.yearText, tabular]}>{year}년</Text>
            <PressableScale onPress={() => canNext && setYear((y) => y + 1)} hitSlop={8} disabled={!canNext} style={styles.yearArrow}>
              <SfIcon name="chevron.right" size={13} color={canNext ? colors.textMuted : colors.textFaint} fallbackGlyph="›" />
            </PressableScale>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{year}년에 받은 반찬</Text>
            <View style={styles.legend}>
              <Text style={styles.legendText}>적게</Text>
              {heat.map((c, i) => (
                <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
              ))}
              <Text style={styles.legendText}>많이</Text>
            </View>
          </View>

          <View style={styles.bigRow}>
            <Text style={[styles.bigNumber, tabular]}>{data ? data.stats.total : '–'}</Text>
            <Text style={styles.bigUnit}>개</Text>
          </View>

          {loading && !data ? (
            <View style={styles.heatmapLoading}>
              <ActivityIndicator color={colors.lime} />
            </View>
          ) : data ? (
            <ContributionHeatmap weeks={data.weeks} months={data.months} />
          ) : (
            <Text style={styles.emptyHeat}>기록을 불러오지 못했어요</Text>
          )}
        </View>

        {data && (
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <StatCard data={cards[0]} />
              <StatCard data={cards[1]} />
            </View>
            <View style={styles.gridRow}>
              <StatCard data={cards[2]} />
              <StatCard data={cards[3]} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { gap: 20, paddingHorizontal: space.gutter },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 4 },
  headerText: { gap: 4 },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.text, letterSpacing: -0.6 },
  subtitle: { fontFamily: font.medium, fontSize: 13, color: colors.textDim, letterSpacing: -0.1 },
  yearNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginTop: 4,
  },
  yearArrow: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  yearText: { fontFamily: font.semibold, fontSize: 13.5, color: colors.text, letterSpacing: 0.2, minWidth: 48, textAlign: 'center' },

  summaryCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.cardLg, borderWidth: 1, borderColor: colors.cardBorder, padding: 20, gap: 6, ...elevation.raised },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: font.medium, fontSize: 13, color: colors.textMuted, letterSpacing: -0.1 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendText: { fontFamily: font.medium, fontSize: 10, color: colors.textFaint },
  legendCell: { width: 9, height: 9, borderRadius: 2 },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 16 },
  bigNumber: { fontFamily: font.bold, fontSize: 36, color: colors.bone, letterSpacing: -1.2 },
  bigUnit: { fontFamily: font.semibold, fontSize: 16, color: colors.textMuted, marginBottom: 5 },
  heatmapLoading: { paddingVertical: 40, alignItems: 'center' },
  emptyHeat: { fontFamily: font.medium, fontSize: 13, color: colors.textFaint, paddingVertical: 30, textAlign: 'center' },

  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
});
