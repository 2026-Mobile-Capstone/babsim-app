import { Tabs } from 'expo-router/js-tabs';

import { colors } from '@/theme/tokens';
import { GlassTabBar } from '@/components/GlassTabBar';

// 3개 탭. 바는 직접 그린 Liquid Glass 플로팅 바(GlassTabBar)로 갈아끼운다.
// 화면 배경은 토큰 bg로 고정(다크).
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="records" options={{ title: '먹은 기록' }} />
      <Tabs.Screen name="profile" options={{ title: '마이페이지' }} />
    </Tabs>
  );
}
