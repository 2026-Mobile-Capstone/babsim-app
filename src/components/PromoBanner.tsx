// 홈 '오늘 아침' 미션 카드 = 카메라→판정 입구. Figma 34:3(PromoBanner) 디자인.
// 라임 카드 + 우측 원형 음식 보울 + '조식 미션' 다크 pill. 카드 전체가 탭 영역이라 따로 CTA 버튼은 없다.
// (한때 '라임+스톡사진은 AI 배너 같다'며 다크 카드+실제 식판사진으로 바꿨던 적이 있는데, Figma대로 되돌렸다.)
// 상태(미인증/완료/놓침)에 따라 pill 문구·헤드라인이 바뀌고, 라임 톤은 셋 다 공통으로 쓴다.
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, space, tabular } from '@/theme/tokens';
import { bannerBowl } from '@/data/mockData';
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

  const pillLabel = done ? '인증 완료' : missed ? '오늘은 놓쳤어요' : '조식 미션';
  const headline = done
    ? '내일 아침도\n챙겨 먹어요'
    : missed
      ? '내일 아침은\n놓치지 말아요'
      : '아침밥 인증하고\n폰 잠금 풀기!';

  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={styles.card}>
      <View style={styles.left}>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            {done && <SfIcon name="checkmark" size={10} color={colors.lime} weight="bold" fallbackGlyph="✓" />}
            <Text style={styles.pillText}>{pillLabel}</Text>
          </View>
          {/* 시간 창은 pending(아직 인증 전)에서만 의미 있다. 완료·놓침이면 숨긴다. */}
          {!done && !missed && <Text style={[styles.time, tabular]}>{timeLabel}</Text>}
        </View>

        <Text style={styles.headline}>{headline}</Text>
      </View>

      <View style={styles.bowlWrap}>
        <Image source={bannerBowl} style={styles.bowl} contentFit="cover" />
      </View>

      {/* 완료 표시: 라임 카드 위라 색을 뒤집어 다크 배지 + 라임 체크로. 보울 위에 얹는다. */}
      {done && (
        <View style={styles.doneBadge}>
          <SfIcon name="checkmark" size={15} color={colors.lime} weight="bold" fallbackGlyph="✓" />
        </View>
      )}
    </PressableScale>
  );
}

// 보울 원 지름. Figma의 158px ellipse 그대로 — 카드 우상단에 박혀 일부가 모서리에 클립된다.
const BOWL = 158;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 138,
    backgroundColor: colors.lime,
    borderRadius: radius.card,
    // 우측 보울이 카드 모서리(우상단)에 자연스럽게 클립되게. 이 때문에 iOS 그림자는 같은 뷰에 못 얹어서
    // 평평하게 둔다 — Figma도 평평하다.
    overflow: 'hidden',
    paddingLeft: 22,
    paddingVertical: 20,
  },
  // 보울이 absolute라, 텍스트가 보울 영역(좌측 끝 x≈232)을 침범하지 않게 폭을 묶는다.
  left: { maxWidth: 190, gap: 10 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.onLime,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillText: { fontFamily: font.bold, fontSize: 10.5, color: colors.lime, letterSpacing: 0.2 },
  time: { fontFamily: font.medium, fontSize: 11.5, color: colors.onLimeDim },
  headline: { fontFamily: font.bold, fontSize: 22, lineHeight: 26, color: colors.onLime, letterSpacing: -0.4 },
  bowlWrap: {
    position: 'absolute',
    right: -32,
    top: -8,
    width: BOWL,
    height: BOWL,
    borderRadius: BOWL / 2,
    overflow: 'hidden',
  },
  // 살짝 키워(원보다 크게) 흰 접시 테를 원 밖으로 밀어낸다. Figma는 이미지가 원보다 ~1.2배.
  bowl: { width: '100%', height: '100%', transform: [{ scale: 1.1 }] },
  doneBadge: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: colors.onLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
