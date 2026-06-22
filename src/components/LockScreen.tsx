// 전체화면 잠금 — 앱의 감정적 정점. 아침에 미인증이면 모든 화면 위를 덮는다.
// 카운트다운을 주인공으로 세우고(큰 고정폭 숫자), 라임은 '인증하기'와 잠금 글리프 점에만 쓴다.
// 여기서 바로 촬영→판정(CaptureVerify)을 하고, 통과하면 onVerified로 풀린다.
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radius, space, tabular } from '@/theme/tokens';
import { fetchMenuAround } from '@/api/client';
import { CaptureVerify } from '@/components/CaptureVerify';
import { SfIcon } from '@/components/SfIcon';

type Props = {
  date: string; // 오늘 YYYYMMDD
  windowEnd: string; // HHMM (인증 마감)
  onVerified: () => void;
};

function remainingSecs(windowEnd: string): number {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const end = new Date(now);
  end.setUTCHours(+windowEnd.slice(0, 2), +windowEnd.slice(2), 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

// 1시간 넘으면 h:mm:ss, 아니면 mm:ss. 고정폭이라 안 흔들린다.
function fmtRemaining(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

export function LockScreen({ date, windowEnd, onVerified }: Props) {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(() => remainingSecs(windowEnd));

  useEffect(() => {
    (async () => {
      try {
        const around = await fetchMenuAround(date);
        setMenu(around.today.menu);
      } catch {
        // 메뉴 못 불러와도 잠금/촬영은 되니 조용히 넘어간다.
      }
    })();
  }, [date]);

  useEffect(() => {
    const id = setInterval(() => setRemaining(remainingSecs(windowEnd)), 1000);
    return () => clearInterval(id);
  }, [windowEnd]);

  return (
    <View style={styles.overlay}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.head}>
          <View style={styles.lockGlyph}>
            <SfIcon name="lock.fill" size={18} color={colors.lime} weight="bold" fallbackGlyph="🔒" />
          </View>
          <Text style={styles.title}>폰이 잠겼어요</Text>
          <Text style={styles.subtitle}>오늘 아침 급식을 인증하면 풀려요</Text>
        </View>

        {/* 카운트다운 = 주인공 */}
        <View style={styles.countdown}>
          <Text style={styles.countLabel}>인증 마감까지</Text>
          <Text style={[styles.countValue, tabular]}>{fmtRemaining(remaining)}</Text>
        </View>

        {menu.length > 0 && (
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>오늘의 조식</Text>
            <View style={styles.menuList}>
              {menu.map((item) => (
                <View key={item} style={styles.menuRow}>
                  <View style={styles.dot} />
                  <Text style={styles.menuText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <CaptureVerify date={date} onVerified={onVerified} />

        <Text style={styles.note}>급식판 사진을 올려야 다시 쓸 수 있어요</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, zIndex: 9999, elevation: 9999 },
  content: { paddingHorizontal: space.gutter + 8, gap: 16, alignItems: 'stretch' },
  head: { alignItems: 'center', gap: 8 },
  lockGlyph: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.limeWash,
    borderWidth: 1,
    borderColor: colors.limeBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontFamily: font.bold, fontSize: 22, color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontFamily: font.medium, fontSize: 14, color: colors.textDim, textAlign: 'center' },
  countdown: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  countLabel: { fontFamily: font.medium, fontSize: 12.5, color: colors.textMuted, letterSpacing: 0.3 },
  countValue: { fontFamily: font.bold, fontSize: 52, color: colors.bone, letterSpacing: -1 },
  menuCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, gap: 12 },
  menuTitle: { fontFamily: font.bold, fontSize: 14, color: colors.textSecondary, letterSpacing: -0.1 },
  menuList: { gap: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 4, height: 4, borderRadius: 999, backgroundColor: colors.textDim },
  menuText: { fontFamily: font.medium, fontSize: 14.5, color: colors.text },
  note: { fontFamily: font.medium, fontSize: 12, color: colors.textFaint, textAlign: 'center', marginTop: 4 },
});
