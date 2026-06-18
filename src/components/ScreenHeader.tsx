// 화면 상단 공통 행. 좌/가운데/우 슬롯만 잡아 주는 얇은 레이아웃 컴포넌트(내용은 화면이 채운다).
// 홈은 좌=햄버거, 가운데=학교 위치, 우=알림 식으로 쓴다.
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { space } from '@/theme/tokens';

type Props = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({ left, center, right, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.side}>{left}</View>
      {center ? <View style={styles.center}>{center}</View> : null}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: space.gutter + 4,
  },
  side: { minWidth: space.iconButton, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
});
