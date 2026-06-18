import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, searchSchools, signup as signupApi, type SchoolHit } from '@/api/client';
import { useSession } from '@/state/SessionContext';
import { colors, font, radius, space } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

// 온보딩 기본 아침 인증 시간대. 가입 후 마이페이지에서 바꾼다.
const DEFAULT_WINDOW = { start: '0700', end: '0830' };

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState<SchoolHit | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SchoolHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 엔터로 닉네임 -> 비번 -> 학교검색 순으로 넘긴다.
  const passwordRef = useRef<TextInput>(null);
  const schoolQueryRef = useRef<TextInput>(null);

  // 학교 검색: 타이핑이 멈추면 350ms 뒤 한 번만 NEIS에 묻는다(매 글자마다 안 친다).
  useEffect(() => {
    const q = query.trim();
    if (!q || school) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const r = await searchSchools(q);
        setResults(r.schools);
      } catch {
        setResults([]); // 검색 실패는 조용히(결과 없음으로)
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, school]);

  function pickSchool(hit: SchoolHit) {
    setSchool(hit);
    setQuery(hit.name);
    setResults([]);
  }

  function clearSchool() {
    setSchool(null);
    setQuery('');
  }

  async function onSignup() {
    if (!nickname.trim() || !password) {
      setError('닉네임과 비밀번호를 입력해 주세요');
      return;
    }
    if (!school) {
      setError('다니는 학교를 선택해 주세요');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = await signupApi({
        nickname: nickname.trim(),
        password,
        school_atpt: school.atpt,
        school_schul: school.schul,
        school_name: school.name,
        window_start: DEFAULT_WINDOW.start,
        window_end: DEFAULT_WINDOW.end,
      });
      await signIn(auth);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '회원가입에 실패했어요. 서버 연결을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <IconButton name="chevron.left" fallbackGlyph="‹" color={colors.textMuted} onPress={() => router.back()} />
          <Text style={styles.title}>회원가입</Text>
          <View style={{ width: space.iconButton }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            placeholder="친구들에게 보일 이름"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            value={nickname}
            onChangeText={setNickname}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => schoolQueryRef.current?.focus()}
          />

          <Text style={styles.label}>학교</Text>
          {school ? (
            <View style={styles.selectedSchool}>
              <SfIcon name="checkmark.seal.fill" size={18} color={colors.lime} fallbackGlyph="✓" />
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{school.name}</Text>
                {school.address && <Text style={styles.selectedAddr}>{school.address}</Text>}
              </View>
              <PressableScale onPress={clearSchool} hitSlop={8}>
                <Text style={styles.changeBtn}>다시 선택</Text>
              </PressableScale>
            </View>
          ) : (
            <>
              <View style={styles.searchRow}>
                <SfIcon name="magnifyingglass" size={16} color={colors.textFaint} fallbackGlyph="🔍" />
                <TextInput
                  ref={schoolQueryRef}
                  style={styles.searchInput}
                  placeholder="학교 이름으로 검색"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  onSubmitEditing={() => results.length > 0 && pickSchool(results[0])}
                />
                {searching && <ActivityIndicator color={colors.textFaint} />}
              </View>
              {results.map((hit) => (
                <PressableScale key={`${hit.atpt}-${hit.schul}`} onPress={() => pickSchool(hit)} style={styles.resultRow}>
                  <Text style={styles.resultName}>{hit.name}</Text>
                  {hit.address && <Text style={styles.resultAddr}>{hit.address}</Text>}
                </PressableScale>
              ))}
            </>
          )}

          <Text style={styles.windowNote}>
            아침 인증 시간은 {DEFAULT_WINDOW.start.slice(0, 2)}:{DEFAULT_WINDOW.start.slice(2)}–
            {DEFAULT_WINDOW.end.slice(0, 2)}:{DEFAULT_WINDOW.end.slice(2)}로 시작해요 (마이페이지에서 바꿀 수 있어요)
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <PressableScale onPress={onSignup} disabled={loading} style={[styles.primary, loading && styles.disabled]}>
            {loading ? <ActivityIndicator color={colors.onLime} /> : <Text style={styles.primaryText}>가입하고 시작하기</Text>}
          </PressableScale>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.gutter + 8, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  form: { marginTop: 16, gap: 8 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.textMuted, marginTop: 10, marginLeft: 2 },
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, paddingVertical: 15, fontFamily: font.medium, fontSize: 15.5, color: colors.text },
  resultRow: { backgroundColor: colors.surfaceSunken, borderRadius: radius.field, paddingHorizontal: 16, paddingVertical: 13, gap: 3 },
  resultName: { fontFamily: font.semibold, fontSize: 14.5, color: colors.text },
  resultAddr: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint },
  selectedSchool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: 'rgba(189,242,69,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedName: { fontFamily: font.bold, fontSize: 14.5, color: colors.text },
  selectedAddr: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint, marginTop: 2 },
  changeBtn: { fontFamily: font.semibold, fontSize: 12.5, color: colors.lime },
  windowNote: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, lineHeight: 18, marginTop: 8, marginLeft: 2 },
  error: { fontFamily: font.medium, fontSize: 13.5, color: '#E5786A', lineHeight: 19, marginTop: 4 },
  primary: { backgroundColor: colors.lime, borderRadius: radius.field, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  primaryText: { fontFamily: font.bold, fontSize: 15.5, color: colors.onLime, letterSpacing: -0.2 },
  disabled: { opacity: 0.6 },
});
