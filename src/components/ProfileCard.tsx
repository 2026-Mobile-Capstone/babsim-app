// 마이페이지 상단 프로필 카드. 아바타 + 이름/레벨 배지 + 학교·반, 우상단 수정 버튼, 아래 통계 3개(연속 인증·학교 친구·보증 횟수).
import { StyleSheet, Text, View } from 'react-native';

import { colors, elevation, font, radius, tabular } from '@/theme/tokens';
import type { Profile } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

export function ProfileCard({ profile, onEdit }: { profile: Profile; onEdit?: () => void }) {
  const stats = [
    { value: profile.streak, label: '연속 인증' },
    { value: profile.friendCount, label: '학교 친구' },
    { value: profile.guaranteeCount, label: '보증 횟수' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar initial={profile.initial} size={64} />
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profile.level}</Text>
            </View>
          </View>
          <Text style={styles.school}>{profile.klass ? `${profile.school} · ${profile.klass}` : profile.school}</Text>
        </View>
        <PressableScale onPress={onEdit} style={styles.editBtn} hitSlop={6}>
          <SfIcon name="pencil" size={16} color={colors.textMuted} weight="medium" fallbackGlyph="✎" />
        </PressableScale>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={s.label} style={styles.statWrap}>
            {i > 0 && <View style={styles.vDivider} />}
            <View style={styles.stat}>
              <Text style={[styles.statValue, tabular]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.cardLg, borderWidth: 1, borderColor: colors.cardBorder, padding: 20, gap: 18, ...elevation.raised },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nameCol: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: font.bold, fontSize: 20, color: colors.text, letterSpacing: -0.3 },
  badge: { backgroundColor: colors.limeWash, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontFamily: font.bold, fontSize: 10.5, color: colors.lime, letterSpacing: -0.1 },
  school: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.divider },
  statsRow: { flexDirection: 'row' },
  statWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  vDivider: { width: 1, height: 30, backgroundColor: colors.divider },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontFamily: font.bold, fontSize: 21, color: colors.bone, letterSpacing: -0.4 },
  statLabel: { fontFamily: font.medium, fontSize: 11.5, color: colors.textDim },
});
