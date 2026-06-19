// 홈의 '같이 먹는 친구' 줄. 오늘 아침을 인증한 친구는 라임 체크 + 또렷하게, 아직인 친구는 흐리게.
// 친구가 없으면 아무것도 안 보여 준다(홈이 빈 블록으로 비지 않게).
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, space } from '@/theme/tokens';
import type { Friend } from '@/api/client';
import { avatarColor } from '@/lib/avatarColor';
import { Avatar } from '@/components/Avatar';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

const MAX_SHOWN = 6;

export function FriendsToday({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) return null;

  const eaten = friends.filter((f) => f.verified_today).length;
  // 먹은 친구를 앞으로(동기부여 + 라임이 먼저 보이게).
  const ordered = [...friends].sort((a, b) => Number(b.verified_today) - Number(a.verified_today));
  const shown = ordered.slice(0, MAX_SHOWN);
  const overflow = friends.length - shown.length;

  return (
    <View style={styles.block}>
      <Text style={styles.label}>같이 먹는 친구</Text>
      <PressableScale scaleTo={0.99} onPress={() => router.push('/(tabs)/profile')} style={styles.card}>
        <Text style={styles.count}>
          {eaten > 0 ? `오늘 ${eaten}명이 아침을 먹었어요` : '아직 아침을 인증한 친구가 없어요'}
        </Text>
        <View style={styles.avatars}>
          {shown.map((f) => (
            <View key={f.id} style={[styles.avatarWrap, !f.verified_today && styles.dim]}>
              <Avatar initial={f.nickname.slice(0, 1)} size={42} background={avatarColor(f.nickname)} color={colors.text} />
              {f.verified_today && (
                <View style={styles.check}>
                  <SfIcon name="checkmark" size={9} color={colors.onLime} weight="bold" fallbackGlyph="✓" />
                </View>
              )}
            </View>
          ))}
          {overflow > 0 && (
            <View style={styles.more}>
              <Text style={styles.moreText}>+{overflow}</Text>
            </View>
          )}
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 12 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.textMuted, paddingHorizontal: space.gutter + 4, letterSpacing: 0.1 },
  card: { marginHorizontal: space.gutter, backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, gap: 16 },
  count: { fontFamily: font.semibold, fontSize: 14.5, color: colors.text, letterSpacing: -0.2 },
  avatars: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatarWrap: {},
  dim: { opacity: 0.38 }, // 아직 인증 안 한 친구
  check: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: { width: 42, height: 42, borderRadius: 999, backgroundColor: colors.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  moreText: { fontFamily: font.bold, fontSize: 13, color: colors.textMuted },
});
