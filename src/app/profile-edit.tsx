// 프로필 편집 — 마이페이지 연필 아이콘의 목적지. 지금은 닉네임만 바꾼다.
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radius, space } from '@/theme/tokens';
import { ApiError, updateSettings } from '@/api/client';
import { useSession } from '@/state/SessionContext';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useSession();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = nickname.trim().length > 0 && nickname.trim() !== user?.nickname;

  async function onSave() {
    const next = nickname.trim();
    if (!next) {
      setError('닉네임을 입력해 주세요');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings({ nickname: next });
      updateUser(updated);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '닉네임을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.grabber} />
      <View style={styles.header}>
        <Text style={styles.title}>프로필 편집</Text>
        <IconButton name="xmark" fallbackGlyph="✕" color={colors.textMuted} onPress={() => router.back()} />
      </View>

      <View style={styles.avatarWrap}>
        <Avatar initial={(nickname || '?').slice(0, 1)} size={88} />
      </View>

      <Text style={styles.label}>닉네임</Text>
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        value={nickname}
        onChangeText={setNickname}
        maxLength={20}
      />
      <Text style={styles.hint}>친구들에게 이 이름으로 보여요.</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <PressableScale style={[styles.save, (!changed || saving) && styles.disabled]} onPress={onSave} disabled={!changed || saving}>
        {saving ? <ActivityIndicator color={colors.onLime} /> : <Text style={styles.saveText}>저장</Text>}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.gutter + 4 },
  grabber: { alignSelf: 'center', width: 38, height: 5, borderRadius: 999, backgroundColor: colors.divider, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  avatarWrap: { alignItems: 'center', paddingVertical: 24 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.textMuted, marginLeft: 2, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontFamily: font.medium,
    fontSize: 15.5,
    color: colors.text,
  },
  hint: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, marginLeft: 2, marginTop: 8 },
  error: { fontFamily: font.medium, fontSize: 13.5, color: colors.danger, marginTop: 8, lineHeight: 19 },
  save: { backgroundColor: colors.lime, borderRadius: radius.field, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveText: { fontFamily: font.bold, fontSize: 15, color: colors.onLime },
  disabled: { opacity: 0.5 },
});
