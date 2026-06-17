// Back(babsim-server)이랑 통신하는 자리. RN 내장 fetch만 쓴다.
// 아래 타입은 Back의 응답 스키마(app/schemas)랑 1:1로 맞춘다. 서버가 snake_case로 주니 그대로 받는다.
// 서버 스키마가 바뀌면 여기도 같이 고친다.
import { API_BASE_URL } from '@/config';
import { currentToken, notifyUnauthorized } from '@/api/auth';

// --- 공통 요청기 ---

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ReqOpts = { method?: string; headers?: Record<string, string>; body?: BodyInit };

async function req<T>(path: string, opts: ReqOpts = {}): Promise<T> {
  const headers: Record<string, string> = { ...opts.headers };
  const token = currentToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { method: opts.method ?? 'GET', headers, body: opts.body });
  if (!res.ok) {
    // 토큰을 붙여 보냈는데도 401이면 그 토큰이 만료/무효라는 뜻 — 세션을 게스트로 떨궈
    // 에러만 반복해서 뜨고 갇히는 걸 막는다. (토큰 없이 받은 401은 그냥 로그인 필요라 건드리지 않는다.)
    if (res.status === 401 && token) notifyUnauthorized();
    // 서버는 에러를 {detail: "..."}로 준다. 못 읽으면 상태코드만이라도 보여준다.
    let detail = `요청이 실패했어요 (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {
      // 본문이 JSON이 아니면 기본 메시지로 둔다(서버 다운 등)
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

function jsonBody(data: unknown): ReqOpts {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

// --- 타입 (Back 스키마 1:1) ---

export type User = {
  id: number;
  nickname: string;
  school_atpt: string;
  school_schul: string;
  school_name: string;
  window_start: string; // HHMM
  window_end: string; // HHMM
};

export type AuthResponse = { token: string; user: User };

export type SchoolHit = { name: string; atpt: string; schul: string; address: string | null };

export type MenuResponse = {
  date: string; // YYYYMMDD
  menu: string[];
  has_meal: boolean;
  kcal: number | null; // NEIS 칼로리, 없으면 null
};

export type MenuAroundResponse = {
  yesterday: MenuResponse;
  today: MenuResponse;
  tomorrow: MenuResponse;
};

export type MatchItem = {
  dish: string;
  comp_idx: number | null;
  cosine: number;
  present: boolean;
  in_vocab: boolean;
};

export type TodayStatus = {
  date: string; // YYYYMMDD
  status: string; // pending | verified | failed | excused
  window_start: string; // HHMM
  window_end: string; // HHMM
  now_kst: string; // HHMM (서버 기준)
  locked: boolean;
};

export type VerifyResponse = {
  decision: boolean;
  confidence: number;
  coverage: number;
  coverage_in_vocab: number;
  mean_cosine: number;
  menu: string[];
  matches: MatchItem[];
  n_compartments: number;
  today: TodayStatus; // 이 판정 반영 후 오늘 상태(잠금 여부 포함)
};

// --- 엔드포인트 ---

export function signup(body: {
  nickname: string;
  password: string;
  school_atpt: string;
  school_schul: string;
  school_name: string;
  window_start?: string;
  window_end?: string;
}): Promise<AuthResponse> {
  return req('/auth/signup', jsonBody(body));
}

export function login(body: { nickname: string; password: string }): Promise<AuthResponse> {
  return req('/auth/login', jsonBody(body));
}

export function fetchMe(): Promise<User> {
  return req('/auth/me');
}

// 계정 변경 — 닉네임·인증 시간대·학교(준 것만 바뀐다).
export function updateSettings(body: {
  nickname?: string;
  window_start?: string;
  window_end?: string;
  school_atpt?: string;
  school_schul?: string;
  school_name?: string;
}): Promise<User> {
  return req('/auth/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export type MenuWeekResponse = { week_start: string; days: MenuResponse[] };

export function fetchMenuWeek(date?: string): Promise<MenuWeekResponse> {
  return req(`/menu/week${date ? `?date=${date}` : ''}`);
}

export type NotificationItem = {
  id: string;
  kind: string;
  icon: string; // SF Symbol 이름
  title: string;
  subtitle: string;
  at: string; // ISO
  target: string; // 누르면 갈 경로
};

export function fetchNotifications(): Promise<{ items: NotificationItem[] }> {
  return req('/notifications');
}

export function searchSchools(q: string): Promise<{ schools: SchoolHit[] }> {
  return req(`/schools/search?q=${encodeURIComponent(q)}`);
}

export function fetchMenuAround(date?: string): Promise<MenuAroundResponse> {
  return req(`/menu/around${date ? `?date=${date}` : ''}`);
}

// 오늘 인증/잠금 상태. LockProvider가 폴링한다.
export function fetchStatus(date?: string): Promise<TodayStatus> {
  return req(`/status${date ? `?date=${date}` : ''}`);
}

export type HistoryStats = {
  total: number; // 그 해 받은 반찬 수
  verified_days: number; // 그 해 인증한 날
  best_streak: number; // 그 해 최고 연속
  success_rate: number; // 0~100
  avg_sides: number; // 받은 날 기준 평균 반찬 수
};

export type MonthMark = { label: string; col: number };

export type HistoryResponse = {
  year: number;
  // GitHub 잔디식 연도 그리드. 열=주(일~토), 값=그날 받은 반찬 수. -1=칸 없음(연도 밖/미래).
  weeks: number[][];
  months: MonthMark[]; // 월 라벨 + 위치(열)
  stats: HistoryStats;
};

export function fetchHistory(year?: number): Promise<HistoryResponse> {
  return req(`/status/history${year ? `?year=${year}` : ''}`);
}

// --- 프로필 / 친구 / 보증 (Back social.py 스키마 1:1) ---

export type ProfileSummary = {
  nickname: string;
  school_name: string;
  level: string;
  streak: number;
  total: number;
  friend_count: number;
  guarantee_count: number;
};

export type Friend = { id: number; nickname: string; school_name: string; verified_today: boolean };
export type FriendSearchHit = { id: number; nickname: string; school_name: string; is_friend: boolean };
export type GuaranteeReq = {
  id: number;
  from_user_id: number;
  from_nickname: string;
  relation: string;
  date: string;
  reason: string;
  created_at: string; // ISO
};

export function fetchProfile(): Promise<ProfileSummary> {
  return req('/auth/profile');
}

export function fetchFriends(): Promise<{ friends: Friend[] }> {
  return req('/friends');
}

export function searchUsers(q: string): Promise<{ users: FriendSearchHit[] }> {
  return req(`/friends/search?q=${encodeURIComponent(q)}`);
}

export function addFriend(friendId: number): Promise<Friend> {
  return req('/friends', jsonBody({ friend_id: friendId }));
}

export function fetchIncomingGuarantees(): Promise<{ requests: GuaranteeReq[] }> {
  return req('/guarantees/incoming');
}

export function createGuarantee(toUserId: number, date: string, reason: string): Promise<GuaranteeReq> {
  return req('/guarantees', jsonBody({ to_user_id: toUserId, date, reason }));
}

export function approveGuarantee(id: number): Promise<{ ok: boolean }> {
  return req(`/guarantees/${id}/approve`, { method: 'POST' });
}

export function rejectGuarantee(id: number): Promise<{ ok: boolean }> {
  return req(`/guarantees/${id}/reject`, { method: 'POST' });
}

// 급식판 사진 + 날짜로 판정 요청. (인증 토큰은 req가 알아서 붙인다)
export async function verifyTray(imageUri: string, date: string): Promise<VerifyResponse> {
  const form = new FormData();
  // RN에선 파일을 {uri, name, type} 형태로 append한다(웹 File 객체가 없다).
  form.append('image', { uri: imageUri, name: 'tray.jpg', type: 'image/jpeg' } as any);
  form.append('date', date);
  // Content-Type은 직접 세팅하지 않는다 — RN이 multipart boundary를 알아서 붙인다.
  return req('/verify', { method: 'POST', body: form });
}
