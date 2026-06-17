// 아침 인증 로컬 알림. 서버 푸시 없이(유료 계정 불필요) 매일 인증 시간대 시작에 한 번 울린다.
import * as Notifications from 'expo-notifications';

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// 매일 windowStart(HHMM)에 울리는 알림을 (재)등록한다. 기존 예약은 지우고 다시 건다.
export async function scheduleMorningReminder(windowStart: string): Promise<void> {
  if (!(await ensurePermission())) return; // 권한 없으면 조용히 넘어간다
  await Notifications.cancelAllScheduledNotificationsAsync();
  const hour = Number(windowStart.slice(0, 2)) || 7;
  const minute = Number(windowStart.slice(2)) || 0;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '아침 인증하고 잠금 풀기 🍚',
      body: '오늘 급식판 사진을 올리면 폰 잠금이 풀려요.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
