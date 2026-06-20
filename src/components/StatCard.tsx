// 먹은 기록 화면의 2x2 통계 카드(연속 인증·인증률·평균 반찬·만족도). 아이콘 박스 + 큰 수치 + 라벨 + 부연.
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, tabular } from '@/theme/tokens';
import type { StatCardData } from '@/data/mockData';
import { SfIcon } from '@/components/SfIcon';

export function StatCard({ data }: { data: StatCardData }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <SfIcon name={data.symbol} size={18} color={colors.lime} weight="semibold" fallbackGlyph={data.fallbackGlyph} />
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, tabular]}>{data.value}</Text>
        {data.unit ? <Text style={styles.unit}>{data.unit}</Text> : null}
      </View>
      <Text style={styles.label}>{data.label}</Text>
      <Text style={styles.sub}>{data.sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.card,
    padding: 18,
    gap: 2,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.field,
    backgroundColor: colors.limeWash, // 라임을 옅게 깐 아이콘 칸
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  value: { fontFamily: font.bold, fontSize: 27, color: colors.bone, letterSpacing: -0.6, includeFontPadding: false },
  unit: { fontFamily: font.medium, fontSize: 13, color: colors.textMuted, marginBottom: 3 },
  label: { fontFamily: font.semibold, fontSize: 13.5, color: colors.text, marginTop: 4, letterSpacing: -0.2 },
  sub: { fontFamily: font.medium, fontSize: 11.5, color: colors.textFaint, letterSpacing: -0.1 },
});
