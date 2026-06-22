# babsim-app (밥심 앱)

아침을 거르는 기숙사생을 위한 앱. 학교를 고르면 그 학교 NEIS 조식 메뉴를 불러오고,
**아침 인증 시간대에 급식판 사진을 안 올리면 폰이 잠긴다.** 사진을 올려 AI가 "오늘 급식 맞다"고
판정하면 풀린다. AI가 못 알아보면 같이 먹은 친구가 보증해서 풀어줄 수도 있다.
Expo(React Native) + Expo Router(파일 기반 라우팅) + TypeScript.

## 실행

`expo-glass-effect`/`expo-secure-store`/`expo-notifications` 같은 네이티브 모듈을 쓰므로
Expo Go가 아니라 **개발 빌드**로 돈다.

```bash
npm install
npm run ios      # = expo run:ios (prebuild→pod install→빌드→시뮬 실행)
```

다크 테마 + 라임 디자인이라 `userInterfaceStyle`은 `dark` 고정. 폰트는 Pretendard 번들.

## Back 서버 연결

서버 주소는 `src/config.ts`의 `API_BASE_URL` 한 곳에서 바꾼다.
- **iOS 시뮬레이터**: `http://localhost:8000` (맥 로컬호스트 공유).
- **실기기(폰)**: 맥 LAN IP. `ipconfig getifaddr en0`로 확인하고, 서버는 `--host 0.0.0.0`으로 띄운다.

서버(`Back/`)가 떠 있어야 로그인·메뉴·판정·잠금이 동작한다. 실 AI 판정은 Back을 `AI_ENABLED=true`로 띄울 때.

## 흐름 / 구조

처음 켜면 **온보딩**(회원가입 → 학교 검색·선택)으로 가고, 로그인되면 탭(홈·먹은 기록·마이페이지)으로 들어간다.
아침 시간대에 오늘 인증이 없으면 `LockProvider`가 전체화면 잠금을 모든 화면 위에 띄운다.

- `src/app/_layout.tsx` — 루트. 폰트 게이트 + `SessionProvider`(세션 라우팅 게이트) + `LockProvider`(잠금 오버레이) + `Stack`(`(auth)`·`(tabs)`·`verify`·`settings` 모달).
- `src/app/(auth)/` — 로그인·회원가입(인라인 학교검색).
- `src/app/(tabs)/` — `index`(홈: 오늘 메뉴·미션)·`records`(인증 히트맵·통계)·`profile`(프로필·보증·친구). 하단 바는 `GlassTabBar`.
- `src/app/verify.tsx` — 촬영→판정 모달. `src/app/settings.tsx` — 시간대 편집·이용 안내·로그아웃.
- `src/app/notifications.tsx`(알림 = 홈 종 아이콘) · `menu-week.tsx`(전체 급식표 = 홈 달력 아이콘) · `profile-edit.tsx`(닉네임 편집 = 프로필 연필) · `help.tsx`(이용 안내). 화면의 모든 아이콘·버튼은 실제 목적지를 갖는다(빈 컨트롤 없음).
- `src/state/` — `SessionContext`(토큰·세션·아침 알림 예약), `LockProvider`(서버 `/status` 폴링 + 잠금 계산 + 오버레이).
- `src/components/` — `GlassSurface`/`GlassTabBar`(Liquid Glass), `LockScreen`, `CaptureVerify`(촬영→판정, 잠금/모달 공용), `MealCarousel`, `ContributionHeatmap`, `ProfileCard`/`GuaranteeRequestCard`/`FriendRow` 등.
- `src/api/client.ts` — Back 호출 전부(인증 헤더 자동). 응답 타입은 서버 스키마와 snake_case 1:1.
- `src/theme/tokens.ts` — 색·폰트·반경·여백 토큰 한 곳. `src/config.ts` — API 주소.
- `src/data/mockData.ts` — 이제 더미가 아니라 컴포넌트 공용 **타입 + 상수**(실데이터는 API에서 옴).

### 잠금(앱 내) · Liquid Glass

- **잠금**은 OS 레벨이 아니라 **앱 내 잠금**이다(유료 개발자 계정·FamilyControls 없이 동작). `LockProvider`가
  서버가 계산한 잠금 진실(`/status`)을 폴링하고, 시간 경계는 로컬에서 1초도 안 틀리게 재계산하며, 포그라운드 복귀·재실행마다 다시 잠근다. 격리 모듈이라 나중에 OS 레벨 잠금으로 갈아끼울 수 있다.
- **유리 면**(탭바·드롭다운)은 `GlassSurface`가 3단 처리 — iOS 26+ 진짜 Liquid Glass(`expo-glass-effect`), 그 아래·안드로이드는 `expo-blur`, 최종은 불투명 토큰색.
