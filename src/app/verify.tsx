// 홈 배너/촬영으로 올라오는 판정 모달(잠금이 아닐 때 쓰는 입구). 잠겼을 땐 LockScreen 안에서 같은 흐름을 탄다.
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, space } from '@/theme/tokens';
import { todayKst } from '@/lib/time';
import { useLock } from '@/state/LockProvider';
import { CaptureVerify } from '@/components/CaptureVerify';
import { IconButton } from '@/components/IconButton';

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const lock = useLock();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.grabber} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>오늘 급식 확인</Text>
          <Text style={styles.subtitle}>급식판 사진을 찍거나 골라서 확인해요</Text>
        </View>
        <IconButton name="xmark" fallbackGlyph="✕" color={colors.textMuted} onPress={() => router.back()} />
      </View>

      <View style={styles.body}>
        {/* 판정 통과 시 잠금 상태도 갱신(잠금 중이었다면 풀린다). 결과는 모달 안에 계속 보여 준다. */}
        <CaptureVerify date={todayKst()} onVerified={() => lock.refresh()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.gutter + 4 },
  grabber: { alignSelf: 'center', width: 38, height: 5, borderRadius: 999, backgroundColor: colors.divider, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontFamily: font.medium, fontSize: 13, color: colors.textDim, marginTop: 4 },
  body: { flex: 1 },
});
