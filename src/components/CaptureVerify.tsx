// 급식판 촬영 → 서버 /verify 판정 → 결과 표시. 잠금화면과 홈 모달이 똑같이 쓴다(중복 제거).
// 판정이 통과(decision=true)되면 onVerified를 부른다 — 부모가 잠금 해제든 모달 닫기든 알아서 한다.
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';
import { createGuarantee, fetchFriends, verifyTray, type Friend, type VerifyResponse } from '@/api/client';
import { trayPhoto } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

type Props = {
  date: string; // YYYYMMDD (오늘)
  onVerified: () => void; // 판정 통과 시
  onResult?: (r: VerifyResponse) => void; // 통과/실패 모두 — 부모가 보증 요청 등에 쓴다
};

export function CaptureVerify({ date, onVerified, onResult }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI 실패 시 친구 보증 요청용 상태
  const [askFriends, setAskFriends] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentTo, setSentTo] = useState<string | null>(null);

  // 새 사진을 고르면 이전 판정·보증요청 상태는 의미 없으니 같이 비운다.
  function setPicked(uri: string) {
    setImageUri(uri);
    setResult(null);
    setError(null);
    setAskFriends(false);
    setSentTo(null);
  }

  async function openFriendPicker() {
    setAskFriends(true);
    try {
      const r = await fetchFriends();
      setFriends(r.friends);
    } catch {
      setFriends([]);
    }
  }

  async function requestGuaranteeTo(friend: Friend) {
    try {
      await createGuarantee(friend.id, date, '급식판 사진이 잘 안 찍혀서 인증을 못 했어요');
      setSentTo(friend.nickname);
    } catch {
      setError('보증 요청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('카메라 권한이 없어서 사진을 찍을 수 없어요. 설정에서 허용해 주세요.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) setPicked(res.assets[0].uri);
  }

  async function pickFromLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled) setPicked(res.assets[0].uri);
  }

  async function onVerify() {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    try {
      const r = await verifyTray(imageUri, date);
      setResult(r);
      onResult?.(r);
      if (r.decision) onVerified();
    } catch (e) {
      // 서버가 안 떠 있거나 LAN IP가 틀리면 여기로 온다. 삼키지 말고 보여준다.
      setError(`확인하는 데 문제가 생겼어요. 잠시 후 다시 시도해 주세요. (${e instanceof Error ? e.message : String(e)})`);
    } finally {
      setLoading(false);
    }
  }

  const presentCount = result ? result.matches.filter((m) => m.present).length : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.pickRow}>
        <PressableScale onPress={pickFromCamera} style={styles.pickBtn}>
          <SfIcon name="camera.fill" size={20} color={colors.lime} fallbackGlyph="📷" />
          <Text style={styles.pickText}>사진 촬영</Text>
        </PressableScale>
        <PressableScale onPress={pickFromLibrary} style={styles.pickBtn}>
          <SfIcon name="photo.on.rectangle" size={20} color={colors.lime} fallbackGlyph="🖼" />
          <Text style={styles.pickText}>갤러리</Text>
        </PressableScale>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
      ) : (
        // 빈 상태에 진짜 급식판 예시를 흐릿하게 깔아 '이렇게 찍는다'를 보여 준다.
        <View style={styles.preview}>
          <Image source={trayPhoto} style={styles.previewExample} contentFit="cover" />
          <View style={styles.previewScrim} />
          <View style={styles.previewHintWrap}>
            <SfIcon name="camera.fill" size={20} color={colors.bone} fallbackGlyph="📷" />
            <Text style={styles.previewHint}>이렇게 위에서 잘 보이게 찍어요</Text>
          </View>
        </View>
      )}

      {imageUri && (
        <PressableScale onPress={onVerify} disabled={loading} style={[styles.primary, loading && styles.disabled]}>
          {loading ? <ActivityIndicator color={colors.onLime} /> : <Text style={styles.primaryText}>오늘 급식 확인</Text>}
        </PressableScale>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={[styles.result, result.decision ? styles.resultOk : styles.resultNo]}>
          <Text style={styles.resultHead}>
            {result.decision ? '✅ 오늘 급식을 먹었어요!' : '❌ 오늘 급식이 아닌 것 같아요'}
          </Text>
          <Text style={styles.resultLine}>
            메뉴 {presentCount}/{result.menu.length}개를 찾았어요 · 일치도 {result.coverage.toFixed(2)}
          </Text>
        </View>
      )}

      {/* AI가 못 알아봤을 때: 같이 먹은 친구에게 보증을 요청하는 길 */}
      {result && !result.decision && (
        <View style={styles.guaranteeBox}>
          {sentTo ? (
            <Text style={styles.sentText}>🌱 {sentTo}님에게 보증을 요청했어요. 친구가 승인하면 잠금이 풀려요.</Text>
          ) : !askFriends ? (
            <PressableScale style={styles.guaranteeBtn} onPress={openFriendPicker}>
              <SfIcon name="leaf.fill" size={15} color={colors.lime} fallbackGlyph="🌱" />
              <Text style={styles.guaranteeBtnText}>친구에게 보증 요청</Text>
            </PressableScale>
          ) : friends.length === 0 ? (
            <Text style={styles.guaranteeHint}>아직 친구가 없어요. 마이페이지에서 친구를 추가해 주세요.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              <Text style={styles.guaranteeHint}>같이 먹은 친구에게 보증을 요청해요</Text>
              {friends.map((f) => (
                <PressableScale key={f.id} style={styles.friendRow} onPress={() => requestGuaranteeTo(f)}>
                  <Avatar initial={f.nickname.slice(0, 1)} size={32} background={colors.surfaceSunken} color={colors.text} />
                  <Text style={styles.friendName}>{f.nickname}</Text>
                  <SfIcon name="paperplane.fill" size={14} color={colors.lime} fallbackGlyph="➤" />
                </PressableScale>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  pickRow: { flexDirection: 'row', gap: 12 },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.field,
    paddingVertical: 15,
  },
  pickText: { fontFamily: font.semibold, fontSize: 14, color: colors.text, letterSpacing: -0.2 },
  preview: { width: '100%', height: 220, borderRadius: radius.card, backgroundColor: colors.surface, overflow: 'hidden', justifyContent: 'flex-end' },
  previewExample: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 },
  previewScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim },
  previewHintWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  previewHint: { fontFamily: font.semibold, fontSize: 13, color: colors.bone },
  primary: { backgroundColor: colors.lime, borderRadius: radius.field, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: font.bold, fontSize: 15.5, color: colors.onLime, letterSpacing: -0.2 },
  disabled: { opacity: 0.6 },
  error: { fontFamily: font.medium, fontSize: 13.5, color: colors.danger, lineHeight: 19 },
  result: { borderRadius: radius.card, padding: 16, gap: 6, borderWidth: 1 },
  resultOk: { backgroundColor: colors.limeWash, borderColor: colors.limeBorder },
  resultNo: { backgroundColor: colors.surface, borderColor: colors.divider },
  resultHead: { fontFamily: font.bold, fontSize: 16, color: colors.text, letterSpacing: -0.3 },
  resultLine: { fontFamily: font.medium, fontSize: 13, color: colors.textSecondary },
  guaranteeBox: { gap: 8 },
  guaranteeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.limeWash,
    borderRadius: radius.field,
    paddingVertical: 14,
  },
  guaranteeBtnText: { fontFamily: font.bold, fontSize: 14, color: colors.lime, letterSpacing: -0.2 },
  guaranteeHint: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, paddingHorizontal: 2 },
  sentText: { fontFamily: font.medium, fontSize: 13.5, color: colors.textSecondary, lineHeight: 19, paddingVertical: 4 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.surface, borderRadius: radius.field, paddingHorizontal: 14, paddingVertical: 10 },
  friendName: { flex: 1, fontFamily: font.semibold, fontSize: 14.5, color: colors.text },
});
