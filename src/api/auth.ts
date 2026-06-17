// 로그인 토큰(JWT) 저장소. 민감값이라 expo-secure-store(키체인)에 둔다.
// client.ts가 매 요청에 토큰을 붙여야 해서, 디스크 읽기를 매번 하지 않게 메모리에도 캐시한다.
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'babsim.token';

let cached: string | null = null;

// 앱 시작 때 한 번 불러 캐시를 채운다.
export async function loadToken(): Promise<string | null> {
  cached = await SecureStore.getItemAsync(TOKEN_KEY);
  return cached;
}

export async function saveToken(token: string): Promise<void> {
  cached = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cached = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// client.ts가 동기적으로 읽어 헤더에 붙인다(이미 loadToken으로 채워져 있다).
export function currentToken(): string | null {
  return cached;
}

// 세션 도중 토큰이 만료/무효라 401이 오면 알리는 콜백. SessionProvider가 등록한다.
// (앱 시작 때 /auth/me 401은 거기서 따로 처리하고, 여기선 '쓰던 중 토큰이 죽는' 경우를 잡는다.)
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export function notifyUnauthorized(): void {
  onUnauthorized?.();
}
