// 먹은 반찬 히트맵(GitHub 잔디 스타일, 연도 단위). 열=주(일~토), 행=요일. 진할수록 그날 많이 받음.
// 한 해가 가로로 길어서(최대 53열) 가로 스크롤하고, 처음엔 가장 최근 주가 보이게 끝으로 스크롤한다.
// 요일 라벨은 왼쪽에 고정, 월 라벨은 각 달 1일이 든 열 위에 얹는다. 값 -1은 칸 없음(연도 밖/미래)이라 투명하게 비운다.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, font, heat } from '@/theme/tokens';
import type { MonthMark } from '@/api/client';

const CELL = 11;
const ROW_GAP = 3.5;
const COL_GAP = 3.5;
const ROW_H = CELL + ROW_GAP;
const COL_W = CELL + COL_GAP; // 한 주(열)가 차지하는 가로폭
const MONTH_H = 18; // 월 라벨 줄 높이
const DAY_COL_W = 22;

// 요일 라벨(일~토). 디자인처럼 월/수/금만 표기한다.
const DAY_LABELS = ['', '월', '', '수', '', '금', ''];

// 그날 받은 반찬 수 -> 색 단계(0~4). 메뉴가 보통 5~7개라 5개 이상이면 가장 진하게.
function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

type Props = { weeks: number[][]; months: readonly MonthMark[] };

export function ContributionHeatmap({ weeks, months }: Props) {
  const [selected, setSelected] = useState<{ w: number; d: number } | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);

  const selectedCount = selected ? weeks[selected.w]?.[selected.d] ?? null : null;

  // 그리드가 마운트되면 한 번 부드럽게 떠오른다(컨테이너 opacity 하나만 굴려서 셀은 항상 최종 상태로 남는다).
  const appear = useSharedValue(0);
  useEffect(() => {
    appear.value = withTiming(1, { duration: 420 });
  }, [appear]);
  const bodyStyle = useAnimatedStyle(() => ({ opacity: appear.value }));

  // 연도가 바뀌면(weeks 교체) 다시 끝으로 스크롤하도록 플래그를 푼다.
  useEffect(() => {
    didScroll.current = false;
  }, [weeks]);

  const gridWidth = weeks.length * COL_W;

  return (
    <View>
      <Animated.View style={[styles.body, bodyStyle]}>
        {/* 왼쪽 고정: 월 라벨 줄 높이만큼 띄우고 요일 라벨 */}
        <View style={styles.dayCol}>
          <View style={{ height: MONTH_H }} />
          {DAY_LABELS.map((label, i) => (
            <View key={i} style={styles.dayCell}>
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!didScroll.current) {
              scrollRef.current?.scrollToEnd({ animated: false }); // 가장 최근 주부터 보이게
              didScroll.current = true;
            }
          }}>
          <View style={{ width: gridWidth }}>
            {/* 월 라벨: 각 달 1일이 든 열 위에 절대 위치 */}
            <View style={{ height: MONTH_H }}>
              {months.map((m) => (
                <Text key={m.label} style={[styles.monthLabel, { left: m.col * COL_W }]}>
                  {m.label}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {weeks.map((week, w) => (
                <View key={w} style={styles.weekCol}>
                  {week.map((count, d) => {
                    if (count < 0) return <View key={d} style={styles.cellEmpty} />; // 연도 밖/미래
                    const isSelected = selected?.w === w && selected?.d === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => setSelected(isSelected ? null : { w, d })}
                        style={[styles.cell, { backgroundColor: heat[levelFor(count)] }, isSelected && styles.cellSelected]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* 선택 캡션: 칸을 누르면 그날 받은 반찬 수, 아니면 옅은 안내 */}
      <Text style={styles.caption}>
        {selected && selectedCount !== null
          ? selectedCount > 0
            ? `이 날 받은 반찬 ${selectedCount}개`
            : '이 날은 기록이 없어요'
          : '칸을 누르면 그날 받은 반찬 수를 볼 수 있어요'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: 'row' },
  dayCol: { width: DAY_COL_W, marginRight: 2 },
  dayCell: { height: ROW_H, justifyContent: 'center' },
  dayLabel: { fontFamily: font.medium, fontSize: 10, color: colors.textFaint },
  monthLabel: { position: 'absolute', top: 0, fontFamily: font.medium, fontSize: 11, color: colors.textFaint },
  grid: { flexDirection: 'row' },
  weekCol: { marginRight: COL_GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3, marginBottom: ROW_GAP },
  cellEmpty: { width: CELL, height: CELL, marginBottom: ROW_GAP }, // 투명 자리(정렬용)
  cellSelected: { borderWidth: 1.5, borderColor: colors.text },
  caption: { fontFamily: font.medium, fontSize: 11.5, color: colors.textFaint, marginTop: 12, letterSpacing: -0.1 },
});
