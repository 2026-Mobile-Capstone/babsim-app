import { Stack } from 'expo-router';

import { colors } from '@/theme/tokens';

// 로그인/회원가입 묶음. 헤더 없이 다크 배경.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
