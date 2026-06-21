// 이용 안내 — 설정에서 들어온다. 잠금·보증 메커니즘을 '진짜 순서'라서 번호로 설명한다.
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, space } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';

const STEPS = [
  { title: '학교를 골라요', desc: '다니는 학교를 검색해 선택하면, 그 학교 아침 급식을 매일 불러와요.' },
  { title: '아침마다 급식판을 찍어요', desc: '정한 인증 시간 안에 식판 사진을 올려요.' },
  { title: 'AI가 오늘 메뉴랑 맞는지 봐요', desc: '사진 속 음식이 그날 급식과 맞으면 인증돼요.' },
  { title: '안 찍으면 폰이 잠겨요', desc: '시간 안에 인증을 안 하면 앱이 잠기고, 인증해야 다시 풀려요.' },
  { title: 'AI가 못 알아보면 친구가 보증해요', desc: '같이 먹은 친구가 보증하면 인증으로 처리돼 잠금이 풀려요.' },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <IconButton name="chevron.left" fallbackGlyph="‹" color={colors.textMuted} onPress={() => router.back()} />
        <Text style={styles.title}>이용 안내</Text>
        <View style={{ width: space.iconButton }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.introTitle}>밥심은 이렇게 동작해요</Text>
        <Text style={styles.introSub}>아침을 거르지 않게, 급식 인증으로 폰 잠금을 풀어요.</Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.rail}>
              <View style={styles.num}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter + 4, paddingBottom: 8 },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  intro: { paddingHorizontal: space.gutter + 4, paddingTop: 12, paddingBottom: 24, gap: 6 },
  introTitle: { fontFamily: font.bold, fontSize: 24, color: colors.bone, letterSpacing: -0.5 },
  introSub: { fontFamily: font.medium, fontSize: 14, color: colors.textDim, lineHeight: 20 },
  steps: { paddingHorizontal: space.gutter + 4 },
  step: { flexDirection: 'row', gap: 16 },
  rail: { alignItems: 'center', width: 30 },
  num: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontFamily: font.bold, fontSize: 14, color: colors.lime },
  line: { flex: 1, width: 1.5, backgroundColor: colors.divider, marginVertical: 4 },
  stepBody: { flex: 1, paddingBottom: 26 },
  stepTitle: { fontFamily: font.bold, fontSize: 16, color: colors.text, letterSpacing: -0.2, marginTop: 3 },
  stepDesc: { fontFamily: font.medium, fontSize: 13.5, color: colors.textSecondary, lineHeight: 20, marginTop: 5 },
});
