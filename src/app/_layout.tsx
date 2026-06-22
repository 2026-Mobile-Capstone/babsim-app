import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';
import { SessionProvider, useSession } from '@/state/SessionContext';
import { LockProvider } from '@/state/LockProvider';

// 폰트가 다 깔리기 전엔 스플래시를 띄워 둔다(시스템 폰트로 깜빡 보였다 바뀌는 걸 막는다).
SplashScreen.preventAutoHideAsync();

// 앱이 켜져 있을 때도 아침 알림을 배너로 보여 준다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 세션 상태에 따라 (auth)↔(tabs)로 보내는 게이트.
function RootNavigator() {
  const { status } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // 복원 중엔 아무 데도 안 보낸다
    const inAuth = segments[0] === '(auth)';
    if (status === 'guest' && !inAuth) {
      router.replace('/(auth)/login');
    } else if (status === 'authed' && inAuth) {
      router.replace('/(tabs)');
    }
  }, [status, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      {/* 촬영→판정은 홈에서 올라오는 모달 */}
      <Stack.Screen name="verify" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="menu-week" />
      <Stack.Screen name="help" />
    </Stack>
  );
}

export default function RootLayout() {
  // app.json의 expo-font 플러그인은 네이티브 빌드에서만 폰트를 심는다. Expo Go 개발에선 적용이 안 되므로,
  // 런타임 useFonts로도 같이 불러서 어느 환경에서든 Pretendard가 뜨게 한다(상대경로 require — Metro alias 회피).
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  // gesture-handler 루트는 reanimated 제스처/애니메이션에 필요해서 최상단에 둔다.
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SessionProvider>
          {/* LockProvider는 네비게이터 위에 잠금 오버레이를 얹는다(게스트일 땐 아무것도 안 함) */}
          <LockProvider>
            <RootNavigator />
          </LockProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
