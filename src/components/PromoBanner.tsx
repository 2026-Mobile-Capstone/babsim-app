// 홈 '오늘 아침' 미션 카드 = 카메라→판정 입구. (예전엔 라임 전체 채움 + 스톡 사진이라 'AI 배너' 같았다 →
// 어두운 들린 카드 + 라임은 점·버튼에만 쓰는 신호색으로, 진짜 급식판 사진을 얹어 그 학교 아침을 가리킨다.)
// 상태(미인증/완료/놓침)에 따라 문구와 톤이 바뀐다.
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, elevation, font, radius, space, tabular } from '@/theme/tokens';
import { trayPhoto } from '@/data/mockData';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

export type MissionState = 'pending' | 'verified' | 'missed';

type Props = {
  onPress: () => void;
  timeLabel?: string; // '07:00 – 08:30'
  state?: MissionState;
};

export function PromoBanner({ onPress, timeLabel = '07:00 – 08:30', state = 'pending' }: Props) {
  const done = state === 'verified';
  const missed = state === 'missed';

  const dot = done ? colors.lime : missed ? colors.textDim : colors.lime;
  const eyebrow = done ? '오늘 인증 완료' : missed ? '오늘은 놓쳤어요' : '오늘 아침';
  const headline = done ? '내일 아침도 챙겨 먹어요' : missed ? '내일 아침은 놓치지 말아요' : '아침 먹고\n폰 잠금 풀기';

  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={[styles.card, elevation.raised]}>
      <View style={styles.left}>
        <View style={styles.eyebrow}>
          {done ? (
            <SfIcon name="checkmark.seal.fill" size={13} color={colors.lime} fallbackGlyph="✓" />
          ) : (
            <View style={[styles.dot, { backgroundColor: dot }]} />
          )}
          <Text style={[styles.eyebrowText, done && { color: colors.lime }]}>{eyebrow}</Text>
          {!done && !missed && (
            <>
              <Text style={styles.eyebrowDivider}>·</Text>
              <Text style={[styles.time, tabular]}>{timeLabel}</Text>
            </>
          )}
        </View>

        <Text style={[styles.headline, done && styles.headlineDone]}>{headline}</Text>

        {!done && (
          <View style={styles.cta}>
            <Text style={styles.ctaText}>급식 인증하기</Text>
            <SfIcon name="arrow.right" size={13} color={colors.onLime} weight="bold" fallbackGlyph="→" />
          </View>
        )}
      </View>

      <View style={styles.trayWrap}>
        <Image source={trayPhoto} style={styles.tray} contentFit="cover" />
        {done && (
          <View style={styles.trayCheck}>
            <SfIcon name="checkmark" size={16} color={colors.onLime} weight="bold" fallbackGlyph="✓" />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 132,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.cardLg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  left: { flex: 1, gap: 12 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 999 },
  eyebrowText: { fontFamily: font.semibold, fontSize: 12.5, color: colors.textSecondary, letterSpacing: 0.1 },
  eyebrowDivider: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint },
  time: { fontFamily: font.semibold, fontSize: 12.5, color: colors.bone, letterSpacing: 0.2 },
  headline: { fontFamily: font.bold, fontSize: 23, lineHeight: 28, color: colors.text, letterSpacing: -0.5 },
  headlineDone: { fontSize: 19, lineHeight: 25, color: colors.bone },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginTop: 2,
  },
  ctaText: { fontFamily: font.bold, fontSize: 13.5, color: colors.onLime, letterSpacing: -0.1 },
  trayWrap: { width: 96, height: 96, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder },
  tray: { width: '100%', height: '100%' },
  trayCheck: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
