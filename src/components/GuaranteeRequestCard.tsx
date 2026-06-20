// 보증 요청 카드. AI가 급식판을 못 알아봤을 때, 같이 먹은 친구가 "얘 진짜 먹었어요" 하고 대신 인증해 주는 흐름.
// 보증하기/거절을 누르면 부모(마이페이지)가 목록에서 빼면서 사라지는 애니메이션을 준다.
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';
import type { GuaranteeRequest } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

type Props = {
  request: GuaranteeRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
};

export function GuaranteeRequestCard({ request, onAccept, onReject }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar initial={request.initial} size={42} background={request.avatarColor} color={colors.text} />
        <View style={styles.who}>
          <Text style={styles.name}>{request.name}</Text>
          <Text style={styles.relation}>{request.relation}</Text>
        </View>
        <Text style={styles.time}>{request.time}</Text>
      </View>

      {/* 경고가 아니라 '왜 보증이 필요한지' 맥락. 호박색 알림박스 대신 담백한 한 줄. */}
      <View style={styles.reason}>
        <SfIcon name="camera.fill" size={13} color={colors.textMuted} fallbackGlyph="📷" />
        <Text style={styles.reasonText}>{request.reason}</Text>
      </View>

      <View style={styles.buttons}>
        <PressableScale onPress={() => onAccept(request.id)} style={[styles.btn, styles.accept]}>
          <SfIcon name="checkmark.seal.fill" size={15} color={colors.onLime} fallbackGlyph="✓" />
          <Text style={styles.acceptText}>보증하기</Text>
        </PressableScale>
        <PressableScale onPress={() => onReject(request.id)} style={[styles.btn, styles.reject]}>
          <Text style={styles.rejectText}>거절</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder, // 라임 신호는 아래 사유 줄이 맡는다(테두리는 차분히)
    padding: 16,
    gap: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  who: { flex: 1, gap: 2 },
  name: { fontFamily: font.bold, fontSize: 15, color: colors.text, letterSpacing: -0.2 },
  relation: { fontFamily: font.medium, fontSize: 12, color: colors.textDim },
  time: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint },
  reason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.field,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.lime, // 보증 사유라는 신호만 살짝
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  reasonText: { flex: 1, fontFamily: font.medium, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18, letterSpacing: -0.1 },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: radius.field },
  accept: { backgroundColor: colors.lime, flex: 1.6 },
  acceptText: { fontFamily: font.bold, fontSize: 14.5, color: colors.onLime, letterSpacing: -0.2 },
  reject: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.chipBorder },
  rejectText: { fontFamily: font.semibold, fontSize: 14.5, color: colors.textMuted, letterSpacing: -0.2 },
});
