// 앱 내 잠금 컨트롤러. 서버 /status를 폴링해 '오늘 인증 상태'를 받고, 잠금 여부는 로컬에서
// (상태 + 시간대 + 지금 KST 시각)으로 계산한다. 잠겼으면 LockScreen이 네비게이터 위를 덮는다.
//
// 잠금의 진실은 서버 status(verified/failed/excused/pending)지만, '지금 시간대 안인가'는 1초도 안 틀리게
// 로컬 시계로 재계산한다(폴링 사이에 시간대가 끝나도 바로 풀리게). 격리된 모듈이라, 나중에 유료계정이
// 생기면 이 자리(오버레이 렌더)를 네이티브 FamilyControls 잠금으로 바꿔 끼우면 된다.
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, BackHandler } from 'react-native';

import { fetchStatus, type TodayStatus } from '@/api/client';
import { nowHhmmKst, todayKst } from '@/lib/time';
import { useSession } from '@/state/SessionContext';
import { LockScreen } from '@/components/LockScreen';

const STATUS_KEY = 'babsim.laststatus';

// 잠금 = 오늘 아직 충족 못함 + 지금이 인증 시간대 안. 시간대를 지나면 풀린다(아침 한정).
function computeLocked(t: TodayStatus | null): boolean {
  if (!t) return false;
  if (t.status === 'verified' || t.status === 'excused') return false;
  const now = nowHhmmKst();
  return t.window_start <= now && now <= t.window_end;
}

type LockValue = {
  refresh: () => Promise<void>;
  markSatisfied: () => void;
};

const LockContext = createContext<LockValue | null>(null);

export function LockProvider({ children }: { children: ReactNode }) {
  const { status: sessionStatus, user } = useSession();
  const [today, setToday] = useState<TodayStatus | null>(null);
  const [, setTick] = useState(0); // 시간 경계 재계산을 위한 강제 리렌더

  const refresh = useCallback(async () => {
    if (sessionStatus !== 'authed') return;
    try {
      const s = await fetchStatus();
      setToday(s);
      await SecureStore.setItemAsync(STATUS_KEY, JSON.stringify(s));
    } catch {
      // 네트워크 실패 시 마지막 상태를 유지한다(낙관적 잠금).
    }
  }, [sessionStatus]);

  // 세션이 들어오면: 저장된 오늘 상태로 먼저 잠그고(콜드스타트 깜빡임 방지), 그 다음 /status로 정합.
  useEffect(() => {
    if (sessionStatus !== 'authed') {
      setToday(null);
      return;
    }
    (async () => {
      try {
        const cached = await SecureStore.getItemAsync(STATUS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as TodayStatus;
          if (parsed.date === todayKst()) setToday(parsed); // 어제 상태면 무시
        }
      } catch {
        // 저장값 깨졌으면 무시하고 refresh로 받는다.
      }
      await refresh();
    })();
  }, [sessionStatus, refresh]);

  // 포그라운드 복귀마다 재확인(보증 승인·다른 기기 인증 반영 + 잠금 재계산).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // 잠금 경계 재계산(15초) + 상태 폴링(60초).
  useEffect(() => {
    if (sessionStatus !== 'authed') return;
    const tickId = setInterval(() => setTick((x) => x + 1), 15000);
    const pollId = setInterval(refresh, 60000);
    return () => {
      clearInterval(tickId);
      clearInterval(pollId);
    };
  }, [sessionStatus, refresh]);

  const locked = computeLocked(today);

  // 잠겼을 때 안드로이드 뒤로가기를 먹는다(iOS는 오버레이가 터치를 가로채 따로 필요 없음).
  useEffect(() => {
    if (!locked) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [locked]);

  // 인증 통과/보증으로 충족됐을 때 즉시 해제(서버 정합은 refresh로).
  const markSatisfied = useCallback(() => {
    setToday((t) => (t ? { ...t, status: 'verified' } : t));
    refresh();
  }, [refresh]);

  const value = useMemo<LockValue>(() => ({ refresh, markSatisfied }), [refresh, markSatisfied]);

  return (
    <LockContext.Provider value={value}>
      {children}
      {locked && today && user && <LockScreen date={today.date} windowEnd={today.window_end} onVerified={markSatisfied} />}
    </LockContext.Provider>
  );
}

export function useLock(): LockValue {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLock은 LockProvider 안에서만 쓸 수 있어요');
  return ctx;
}
