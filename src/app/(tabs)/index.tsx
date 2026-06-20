import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, space } from '@/theme/tokens';
import { fetchFriends, fetchMenuAround, fetchStatus, type Friend, type MenuAroundResponse, type TodayStatus } from '@/api/client';
import { useSession } from '@/state/SessionContext';
import { nowHhmmKst } from '@/lib/time';
import type { MealDay } from '@/data/mockData';
import { FriendsToday } from '@/components/FriendsToday';
import { IconButton } from '@/components/IconButton';
import { MealCarousel } from '@/components/MealCarousel';
import { PromoBanner, type MissionState } from '@/components/PromoBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SfIcon } from '@/components/SfIcon';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// YYYYMMDD -> '6/15 월'
function formatDateLabel(d: string): string {
  const y = +d.slice(0, 4);
  const mo = +d.slice(4, 6);
  const day = +d.slice(6, 8);
  const wd = WEEKDAYS[new Date(Date.UTC(y, mo - 1, day)).getUTCDay()];
  return `${mo}/${day} ${wd}`;
}

// '0700','0830' -> '07:00 – 08:30'
function cleanWindow(start: string, end: string): string {
  const hm = (s: string) => `${s.slice(0, 2)}:${s.slice(2)}`;
  return `${hm(start)} – ${hm(end)}`;
}

function missionState(status: TodayStatus | null): MissionState {
  if (!status) return 'pending';
  if (status.status === 'verified' || status.status === 'excused') return 'verified';
  return nowHhmmKst() > status.window_end ? 'missed' : 'pending';
}

function toMealDays(d: MenuAroundResponse): MealDay[] {
  return [
    { id: d.yesterday.date, label: '어제', dateLabel: formatDateLabel(d.yesterday.date), meal: '조식', menu: d.yesterday.menu, isToday: false, kcal: d.yesterday.kcal ?? undefined },
    { id: d.today.date, label: '오늘', dateLabel: formatDateLabel(d.today.date), meal: '조식', menu: d.today.menu, isToday: true, kcal: d.today.kcal ?? undefined },
    { id: d.tomorrow.date, label: '내일', dateLabel: formatDateLabel(d.tomorrow.date), meal: '조식', menu: d.tomorrow.menu, isToday: false, kcal: d.tomorrow.kcal ?? undefined },
  ];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [days, setDays] = useState<MealDay[] | null>(null);
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [around, today, fr] = await Promise.all([
        fetchMenuAround(),
        fetchStatus().catch(() => null),
        fetchFriends().catch(() => ({ friends: [] })),
      ]);
      setDays(toMealDays(around));
      setStatus(today);
      setFriends(fr.friends);
    } catch {
      setError('메뉴를 불러오지 못했어요. 서버 연결을 확인해 주세요.');
    }
  }, []);

  // 세션이 들어온 뒤 첫 로드. 콜드스타트 때 토큰이 늦게 차서 /status가 401나는 걸 피하려고 user를 기다린다.
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [user, load]);

  // 홈으로 돌아올 때마다 조용히 갱신 — 인증/해제/놓침 상태가 배너에 바로 반영되게.
  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 96 }]}>
        <ScreenHeader
          left={<IconButton name="calendar" fallbackGlyph="📅" onPress={() => router.push('/menu-week')} />}
          center={
            <View style={styles.location}>
              <Text style={styles.locationLabel}>우리 학교 급식</Text>
              <View style={styles.locationRow}>
                <SfIcon name="mappin.and.ellipse" size={13} color={colors.textMuted} fallbackGlyph="📍" />
                <Text style={styles.school} numberOfLines={1}>
                  {user?.school_name ?? '학교'}
                </Text>
              </View>
            </View>
          }
          right={<IconButton name="bell.fill" fallbackGlyph="🔔" onPress={() => router.push('/notifications')} />}
        />

        <Animated.View entering={FadeInDown.delay(40).duration(360)}>
          <PromoBanner
            onPress={() => router.push('/verify')}
            timeLabel={user ? cleanWindow(user.window_start, user.window_end) : undefined}
            state={missionState(status)}
          />
        </Animated.View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.lime} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : days ? (
          <View style={styles.carouselBlock}>
            <Text style={styles.sectionLabel}>이번 주 조식</Text>
            <MealCarousel days={days} />
          </View>
        ) : null}

        {!loading && !error && <FriendsToday friends={friends} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { gap: 20 },
  location: { alignItems: 'center', gap: 3, maxWidth: 240 },
  locationLabel: { fontFamily: font.medium, fontSize: 11, color: colors.locationLabel, letterSpacing: 0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  school: { fontFamily: font.bold, fontSize: 16, color: colors.text, letterSpacing: -0.3 },
  carouselBlock: { gap: 12 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 13, color: colors.textMuted, paddingHorizontal: space.gutter + 4, letterSpacing: 0.1 },
  center: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  error: { fontFamily: font.medium, fontSize: 14, color: colors.textDim, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
