// 학교 친구 한 줄. 아바타 + 이름/반, 오른쪽엔 오늘 인증했으면 라임 체크, 아니면 옅은 '아직'.
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';
import type { Friend } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { SfIcon } from '@/components/SfIcon';

export function FriendRow({ friend }: { friend: Friend }) {
  return (
    <View style={styles.row}>
      <Avatar initial={friend.initial} size={44} background={friend.avatarColor} color={colors.text} />
      <View style={styles.who}>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.klass}>{friend.klass}</Text>
      </View>
      {friend.verifiedToday ? (
        <SfIcon name="checkmark.seal.fill" size={20} color={colors.lime} fallbackGlyph="✅" />
      ) : (
        <Text style={styles.pending}>아직</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  who: { flex: 1, gap: 2 },
  name: { fontFamily: font.semibold, fontSize: 15, color: colors.text, letterSpacing: -0.2 },
  klass: { fontFamily: font.medium, fontSize: 12, color: colors.textDim },
  pending: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint },
});
