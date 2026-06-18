// 로그인 세션. 앱 시작 때 저장된 토큰으로 /auth/me를 불러 사용자를 복원하고,
// 로그인/로그아웃을 한 곳에서 처리한다. 라우팅 게이트(_layout)가 이 status를 보고 (auth)↔(tabs)를 정한다.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchMe, type AuthResponse, type User } from '@/api/client';
import { clearToken, loadToken, saveToken, setUnauthorizedHandler } from '@/api/auth';
import { cancelReminders, scheduleMorningReminder } from '@/lib/notifications';

type Status = 'loading' | 'guest' | 'authed';

type SessionValue = {
  status: Status;
  user: User | null;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (user: User) => void; // 설정 변경 후 세션 사용자 갱신(알림 재예약 트리거)
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  // 시작 때: 토큰 있으면 /auth/me로 복원, 없거나 만료면 guest.
  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (!token) {
        setStatus('guest');
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
        setStatus('authed');
      } catch {
        // 토큰이 만료/무효면 지우고 게스트로.
        await clearToken();
        setStatus('guest');
      }
    })();
  }, []);

  // 쓰던 중 토큰이 만료/무효라 401이 오면(api 레이어가 알려준다) 깔끔히 게스트로 떨군다.
  // 게이트(_layout)가 status를 보고 자동으로 로그인 화면으로 돌린다.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setStatus('guest');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function signIn(auth: AuthResponse) {
    await saveToken(auth.token);
    setUser(auth.user);
    setStatus('authed');
  }

  async function signOut() {
    await clearToken();
    await cancelReminders();
    setUser(null);
    setStatus('guest');
  }

  function updateUser(next: User) {
    setUser(next);
  }

  // 로그인 상태 + 인증 시간대가 정해지면 매일 아침 로컬 알림을 (재)예약한다.
  useEffect(() => {
    if (status === 'authed' && user) {
      scheduleMorningReminder(user.window_start);
    }
  }, [status, user?.window_start]);

  async function refresh() {
    try {
      setUser(await fetchMe());
    } catch {
      // 새로고침 실패는 조용히 넘긴다(다음 요청에서 401이면 그때 처리).
    }
  }

  const value = useMemo<SessionValue>(() => ({ status, user, signIn, signOut, refresh, updateUser }), [status, user]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession은 SessionProvider 안에서만 쓸 수 있어요');
  return ctx;
}
