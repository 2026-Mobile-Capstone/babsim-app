import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, login as loginApi } from '@/api/client';
import { useSession } from '@/state/SessionContext';
import { colors, font, radius, space } from '@/theme/tokens';
import { PressableScale } from '@/components/PressableScale';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null); // 닉네임에서 엔터치면 비번칸으로 넘긴다

  async function onLogin() {
    if (!nickname.trim() || !password) {
      setError('닉네임과 비밀번호를 입력해 주세요');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = await loginApi({ nickname: nickname.trim(), password });
      await signIn(auth); // 게이트가 (tabs)로 보낸다
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '로그인에 실패했어요. 인터넷 연결을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.brand}>밥심</Text>
        <Text style={styles.tagline}>아침 먹고 폰 잠금 풀기</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="닉네임"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            value={nickname}
            onChangeText={setNickname}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={onLogin}
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <PressableScale onPress={onLogin} disabled={loading} style={[styles.primary, loading && styles.disabled]}>
            {loading ? <ActivityIndicator color={colors.onLime} /> : <Text style={styles.primaryText}>로그인</Text>}
          </PressableScale>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.muted}>계정이 없어요? </Text>
          <Link href="/(auth)/signup" style={styles.link}>
            회원가입
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: space.gutter + 8 },
  brand: { fontFamily: font.bold, fontSize: 46, color: colors.lime, letterSpacing: -1.5 },
  tagline: { fontFamily: font.medium, fontSize: 15, color: colors.textSecondary, marginTop: 8 },
  form: { marginTop: 44, gap: 12 },
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
  error: { fontFamily: font.medium, fontSize: 13.5, color: '#E5786A', lineHeight: 19, marginTop: 2 },
  primary: { backgroundColor: colors.lime, borderRadius: radius.field, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  primaryText: { fontFamily: font.bold, fontSize: 15.5, color: colors.onLime, letterSpacing: -0.2 },
  disabled: { opacity: 0.6 },
  bottom: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  muted: { fontFamily: font.medium, fontSize: 14, color: colors.textDim },
  link: { fontFamily: font.bold, fontSize: 14, color: colors.lime },
});
