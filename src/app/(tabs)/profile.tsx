import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radius, space } from '@/theme/tokens';
import { avatarColor } from '@/lib/avatarColor';
import {
  addFriend,
  approveGuarantee,
  fetchFriends,
  fetchIncomingGuarantees,
  fetchProfile,
  rejectGuarantee,
  searchUsers,
  type Friend as ApiFriend,
  type FriendSearchHit,
  type GuaranteeReq,
  type ProfileSummary,
} from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { FriendRow } from '@/components/FriendRow';
import { GuaranteeRequestCard } from '@/components/GuaranteeRequestCard';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { ProfileCard } from '@/components/ProfileCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SfIcon } from '@/components/SfIcon';

// ISO(UTC) -> ' 오늘 7:52' (KST)
function timeLabel(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return `오늘 ${kst.getUTCHours()}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [requests, setRequests] = useState<GuaranteeReq[]>([]);
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, g, f] = await Promise.all([fetchProfile(), fetchIncomingGuarantees(), fetchFriends()]);
      setProfile(p);
      setRequests(g.requests);
      setFriends(f.friends);
    } catch {
      // 실패 시 이전 데이터 유지
    }
  }, []);

  // 탭에 들어올 때마다 새로고침(보증 처리·친구 추가 반영).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onResolve(id: string, approve: boolean) {
    const gid = Number(id);
    setRequests((r) => r.filter((x) => x.id !== gid)); // 낙관적 제거
    try {
      await (approve ? approveGuarantee(gid) : rejectGuarantee(gid));
    } finally {
      load(); // 카운트·친구 verified_today 등 정합
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 96 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>마이페이지</Text>
          <IconButton name="gearshape.fill" fallbackGlyph="⚙️" color={colors.textMuted} onPress={() => router.push('/settings')} />
        </View>

        <View style={styles.gutter}>
          {profile && (
            <ProfileCard
              profile={{
                initial: profile.nickname.slice(0, 1),
                name: profile.nickname,
                level: profile.level,
                school: profile.school_name,
                klass: '',
                streak: profile.streak,
                friendCount: profile.friend_count,
                guaranteeCount: profile.guarantee_count,
              }}
              onEdit={() => router.push('/profile-edit')}
            />
          )}
        </View>

        {/* 보증 요청 (내가 보증해 줄 차례) */}
        <View style={styles.section}>
          <SectionHeader
            title="보증 요청"
            leading={<SfIcon name="leaf.fill" size={17} color={colors.lime} fallbackGlyph="🌱" />}
            trailing={
              requests.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{requests.length}</Text>
                </View>
              ) : undefined
            }
          />
          <Text style={styles.explainer}>급식판이 잘 인식되지 않았을 때, 같이 먹은 친구가 보증해 주면 인증으로 처리돼요.</Text>

          <View style={styles.gutter}>
            {requests.length > 0 ? (
              requests.map((req) => (
                <Animated.View key={req.id} layout={LinearTransition.springify().damping(18)} exiting={FadeOut.duration(220)} style={styles.reqItem}>
                  <GuaranteeRequestCard
                    request={{
                      id: String(req.id),
                      initial: req.from_nickname.slice(0, 1),
                      name: req.from_nickname,
                      relation: req.relation,
                      time: timeLabel(req.created_at),
                      reason: req.reason,
                      avatarColor: avatarColor(req.from_nickname),
                    }}
                    onAccept={(id) => onResolve(id, true)}
                    onReject={(id) => onResolve(id, false)}
                  />
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <SfIcon name="checkmark.circle" size={20} color={colors.textDim} fallbackGlyph="✓" />
                <Text style={styles.emptyText}>처리할 보증 요청이 없어요</Text>
              </View>
            )}
          </View>
        </View>

        {/* 학교 친구 */}
        <View style={styles.section}>
          <SectionHeader
            title="학교 친구"
            trailing={<Text style={styles.friendCount}>{friends.length}명</Text>}
            right={
              <PressableScale style={styles.addBtn} onPress={() => setAddOpen(true)}>
                <SfIcon name="person.badge.plus" size={14} color={colors.lime} fallbackGlyph="＋" />
                <Text style={styles.addText}>친구 추가</Text>
              </PressableScale>
            }
          />
          <View style={styles.gutter}>
            {friends.length > 0 ? (
              <View style={styles.friendCard}>
                {friends.map((friend, i) => (
                  <View key={friend.id}>
                    {i > 0 && <View style={styles.friendDivider} />}
                    <FriendRow
                      friend={{
                        id: String(friend.id),
                        initial: friend.nickname.slice(0, 1),
                        name: friend.nickname,
                        klass: '같은 학교',
                        avatarColor: avatarColor(friend.nickname),
                        verifiedToday: friend.verified_today,
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>아직 친구가 없어요. 친구를 추가해 보세요.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <AddFriendModal
        visible={addOpen}
        onClose={() => {
          setAddOpen(false);
          load(); // 닫을 때 서버 기준으로 친구 목록을 다시 맞춘다(표시 드리프트 방지)
        }}
        onAdded={load}
      />
    </View>
  );
}

// --- 친구 추가 모달: 같은 학교 닉네임 검색 → 추가 ---
function AddFriendModal({ visible, onClose, onAdded }: { visible: boolean; onClose: () => void; onAdded: () => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 모달이 열리면 빈 검색으로 기본 목록(우리 학교 친구)을 부르고, 입력하면 그 닉네임으로 검색한다.
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setAddError(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchUsers(query.trim());
        setResults(r.users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, query ? 300 : 0); // 기본 목록은 바로, 타이핑은 디바운스
    return () => clearTimeout(t);
  }, [visible, query]);

  async function onAdd(hit: FriendSearchHit) {
    setAddError(null);
    // 일단 '친구'로 보여주되(즉각 반응), 서버에 안 들어가면 반드시 되돌린다.
    setResults((rs) => rs.map((r) => (r.id === hit.id ? { ...r, is_friend: true } : r)));
    try {
      await addFriend(hit.id);
      onAdded();
    } catch {
      setResults((rs) => rs.map((r) => (r.id === hit.id ? { ...r, is_friend: false } : r)));
      setAddError(`${hit.nickname}님을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.`);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalScreen, { paddingTop: 16 }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>친구 추가</Text>
          <IconButton name="xmark" fallbackGlyph="✕" color={colors.textMuted} onPress={onClose} />
        </View>
        <View style={styles.searchRow}>
          <SfIcon name="magnifyingglass" size={16} color={colors.textFaint} fallbackGlyph="🔍" />
          <TextInput
            style={styles.searchInput}
            placeholder="같은 학교 친구 닉네임 검색"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            value={query}
            onChangeText={setQuery}
          />
          {searching && <ActivityIndicator color={colors.textFaint} />}
        </View>
        {addError && <Text style={styles.addError}>{addError}</Text>}
        <Text style={styles.resultsLabel}>{query.trim() ? '검색 결과' : '우리 학교 친구'}</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingBottom: insets.bottom + 20 }}>
          {!searching && results.length === 0 && (
            <Text style={styles.searchEmpty}>
              {query.trim() ? '검색 결과가 없어요' : '우리 학교에 가입한 친구가 아직 없어요'}
            </Text>
          )}
          {results.map((hit) => (
            <View key={hit.id} style={styles.searchResult}>
              <Avatar initial={hit.nickname.slice(0, 1)} size={40} background={avatarColor(hit.nickname)} color={colors.text} />
              <Text style={styles.searchName}>{hit.nickname}</Text>
              {hit.is_friend ? (
                <Text style={styles.alreadyFriend}>친구</Text>
              ) : (
                <PressableScale style={styles.addPill} onPress={() => onAdd(hit)}>
                  <Text style={styles.addPillText}>추가</Text>
                </PressableScale>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { gap: 22 },
  gutter: { paddingHorizontal: space.gutter },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter + 4 },
  title: { fontFamily: font.bold, fontSize: 28, color: colors.text, letterSpacing: -0.6 },

  section: { gap: 12 },
  countBadge: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { fontFamily: font.bold, fontSize: 11, color: colors.onLime },
  explainer: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, lineHeight: 18, paddingHorizontal: space.gutter + 4 },
  reqItem: { marginBottom: 12 },
  emptyBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 20, backgroundColor: colors.surface, borderRadius: radius.card },
  emptyText: { fontFamily: font.medium, fontSize: 13.5, color: colors.textDim, textAlign: 'center' },

  friendCount: { fontFamily: font.medium, fontSize: 14, color: colors.textDim, marginLeft: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.limeWash, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  addText: { fontFamily: font.semibold, fontSize: 12.5, color: colors.lime, letterSpacing: -0.1 },
  friendCard: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 4 },
  friendDivider: { height: 1, backgroundColor: colors.divider },

  modalScreen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.gutter + 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontFamily: font.bold, fontSize: 20, color: colors.text },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.field, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 16, marginBottom: 14 },
  searchInput: { flex: 1, paddingVertical: 14, fontFamily: font.medium, fontSize: 15.5, color: colors.text },
  addError: { fontFamily: font.medium, fontSize: 13, color: colors.danger, marginLeft: 2, marginBottom: 10, lineHeight: 18 },
  resultsLabel: { fontFamily: font.semibold, fontSize: 12.5, color: colors.textMuted, marginLeft: 2, marginBottom: 10 },
  searchEmpty: { fontFamily: font.medium, fontSize: 13.5, color: colors.textFaint, textAlign: 'center', paddingVertical: 30 },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.field, paddingHorizontal: 14, paddingVertical: 12 },
  searchName: { flex: 1, fontFamily: font.semibold, fontSize: 15, color: colors.text },
  alreadyFriend: { fontFamily: font.medium, fontSize: 13, color: colors.textFaint },
  addPill: { backgroundColor: colors.lime, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  addPillText: { fontFamily: font.bold, fontSize: 13, color: colors.onLime },
});
