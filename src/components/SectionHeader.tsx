// 섹션 제목 줄. "베스트 메뉴 / 전체보기", "보증 요청 ②", "학교 친구 24명 / 친구 추가" 같은 데 공통으로 쓴다.
// 왼쪽에 (아이콘?)+제목+(개수/배지?), 오른쪽에 액션 노드. 필요한 슬롯만 채운다.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, space } from '@/theme/tokens';

type Props = {
  title: string;
  leading?: ReactNode; // 제목 앞 아이콘
  trailing?: ReactNode; // 제목 뒤 개수/배지
  right?: ReactNode; // 맨 오른쪽 액션
};

export function SectionHeader({ title, leading, trailing, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {leading}
        <Text style={styles.title}>{title}</Text>
        {trailing}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.gutter + 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: font.bold, fontSize: 18, color: colors.text, letterSpacing: -0.3 },
});
