// 알림 — 홈 종 아이콘의 목적지. 보증·친구·인증 이벤트를 모아 보여 준다(서버가 파생).
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SymbolViewProps } from 'expo-symbols';

import { colors, font, radius, space } from '@/theme/tokens';
import { fetchNotifications, type NotificationItem } from '@/api/client';
import { relativeFromNow } from '@/lib/time';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { SfIcon } from '@/components/SfIcon';

// 종류별 아이콘 색/칸 색 — 색이 무슨 일인지 거든다(처리 필요=라임, 거절=빨강, 리마인더=호박).
function kindStyle(kind: string): { color: string; bg: string } {
  switch (kind) {
    case 'guarantee_rejected':
      return { color: colors.danger, bg: 'rgba(226,128,108,0.12)' };
    case 'reminder':
      return { color: colors.warning, bg: colors.warningBg };
    case 'friend':
      return { color: colors.textSecondary, bg: colors.surfaceSunken };
    default: // guarantee_in / guarantee_approved / verified
      return { color: colors.lime, bg: colors.limeWash };
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NotificationItem[] | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetchNotifications();
      setItems(r.items);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <IconButton name="chevron.left" fallbackGlyph="‹" color={colors.textMuted} onPress={() => router.back()} />
        <Text style={styles.title}>알림</Text>
        <View style={{ width: space.iconButton }} />
      </View>

      {items === null ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.lime} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <SfIcon name="bell.slash" size={26} color={colors.textDim} fallbackGlyph="🔕" />
          <Text style={styles.emptyText}>새 소식이 없어요</Text>
          <Text style={styles.emptySub}>아침 인증과 친구 소식이 여기 모여요</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
          {items.map((it) => {
            const ks = kindStyle(it.kind);
            return (
              <PressableScale key={it.id} scaleTo={0.98} style={styles.row} onPress={() => router.push(it.target as Href)}>
                <View style={[styles.iconChip, { backgroundColor: ks.bg }]}>
                  <SfIcon name={it.icon as SymbolViewProps['name']} size={17} color={ks.color} weight="semibold" fallbackGlyph="•" />
                </View>
                <View style={styles.body}>
                  <Text style={styles.rowTitle}>{it.title}</Text>
                  {it.subtitle ? (
                    <Text style={styles.rowSub} numberOfLines={2}>
                      {it.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.time}>{relativeFromNow(it.at)}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.gutter + 4, paddingBottom: 8 },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyText: { fontFamily: font.semibold, fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  emptySub: { fontFamily: font.medium, fontSize: 13, color: colors.textDim },
  list: { paddingHorizontal: space.gutter, gap: 10, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface, borderRadius: radius.card, padding: 15 },
  iconChip: { width: 38, height: 38, borderRadius: radius.field, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: font.semibold, fontSize: 14.5, color: colors.text, letterSpacing: -0.2 },
  rowSub: { fontFamily: font.medium, fontSize: 12.5, color: colors.textDim, lineHeight: 17 },
  time: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint },
});
