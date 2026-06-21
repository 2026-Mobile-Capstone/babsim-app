// 설정 모달: 아침 인증 시간대 편집 + 로그아웃. 시간대를 바꾸면 서버에 저장하고 세션·알림도 갱신된다.
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radius, space, tabular } from '@/theme/tokens';
import { updateSettings } from '@/api/client';
import { useSession } from '@/state/SessionContext';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

const STEP = 10; // 10분 단위로 조정

function toMin(hhmm: string): number {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(2));
}
function toHHMM(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0');
}
function fmt(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function TimeStepper({ label, value, onChange }: { label: string; value: number; onChange: (m: number) => void }) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepper}>
        <PressableScale style={styles.stepBtn} onPress={() => onChange(value - STEP)}>
          <SfIcon name="minus" size={16} color={colors.text} weight="bold" fallbackGlyph="–" />
        </PressableScale>
        <Text style={[styles.stepValue, tabular]}>{fmt(value)}</Text>
        <PressableScale style={styles.stepBtn} onPress={() => onChange(value + STEP)}>
          <SfIcon name="plus" size={16} color={colors.text} weight="bold" fallbackGlyph="+" />
        </PressableScale>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser, signOut } = useSession();
  const [start, setStart] = useState(() => (user ? toMin(user.window_start) : 7 * 60));
  const [end, setEnd] = useState(() => (user ? toMin(user.window_end) : 8 * 60 + 30));
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    try {
      const updated = await updateSettings({ window_start: toHHMM(start), window_end: toHHMM(end) });
      updateUser(updated); // 세션 갱신 → 알림 재예약 + 잠금 시간대 반영
      router.back();
    } catch {
      Alert.alert('저장 실패', '시간대를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.grabber} />
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <IconButton name="xmark" fallbackGlyph="✕" color={colors.textMuted} onPress={() => router.back()} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>아침 인증 시간대</Text>
        <Text style={styles.sectionHint}>이 시간 안에 인증을 안 하면 폰이 잠겨요.</Text>
        <View style={styles.card}>
          <TimeStepper label="시작" value={start} onChange={setStart} />
          <View style={styles.divider} />
          <TimeStepper label="마감" value={end} onChange={setEnd} />
        </View>
        <PressableScale style={[styles.save, saving && styles.disabled]} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.onLime} /> : <Text style={styles.saveText}>저장</Text>}
        </PressableScale>
      </View>

      <View style={styles.section}>
        <PressableScale style={styles.linkRow} onPress={() => router.push('/help')}>
          <Text style={styles.linkText}>이용 안내</Text>
          <SfIcon name="chevron.right" size={14} color={colors.textFaint} fallbackGlyph="›" />
        </PressableScale>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>계정</Text>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <Text style={styles.accountKey}>닉네임</Text>
              <Text style={styles.accountValue}>{user.nickname}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Text style={styles.accountKey}>학교</Text>
              <Text style={styles.accountValue} numberOfLines={1}>
                {user.school_name}
              </Text>
            </View>
          </View>
          <PressableScale style={styles.logout} onPress={confirmLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.gutter + 4 },
  grabber: { alignSelf: 'center', width: 38, height: 5, borderRadius: 999, backgroundColor: colors.divider, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, letterSpacing: -0.4 },
  section: { gap: 8, marginBottom: 24 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 13, color: colors.textMuted, marginLeft: 2 },
  sectionHint: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, marginLeft: 2, marginBottom: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 18 },
  divider: { height: 1, backgroundColor: colors.divider },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  stepLabel: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: font.bold, fontSize: 19, color: colors.bone, minWidth: 66, textAlign: 'center', letterSpacing: 0.5 },
  save: { backgroundColor: colors.lime, borderRadius: radius.field, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  saveText: { fontFamily: font.bold, fontSize: 15, color: colors.onLime },
  disabled: { opacity: 0.6 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, gap: 12 },
  accountKey: { fontFamily: font.medium, fontSize: 14, color: colors.textDim },
  accountValue: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: colors.text, textAlign: 'right' },
  logout: { paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  logoutText: { fontFamily: font.semibold, fontSize: 14.5, color: colors.danger },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 18, paddingVertical: 17 },
  linkText: { fontFamily: font.semibold, fontSize: 15, color: colors.text },
});
