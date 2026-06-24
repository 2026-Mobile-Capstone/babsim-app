// 화면 컴포넌트들이 공유하는 타입 + 몇 가지 상수.
// 실데이터(메뉴·기록·친구·보증)는 전부 Back API에서 온다 — 여기엔 더 이상 더미 데이터가 없다.
// (파일명은 초기 목업 시절 그대로지만, 지금은 타입/상수 모음이다.)

// 홈 식단 카드 한 장. 실서버 메뉴엔 칼로리/만족도가 없어서 아래 셋은 옵셔널.
export type MealDay = {
  id: string;
  label: string; // '어제' | '오늘' | '내일'
  dateLabel: string; // '6/15 월'
  meal: string; // '조식'
  menu: string[];
  isToday: boolean;
  kcal?: number;
  rating?: number;
  certifiedCount?: number;
};

// 진짜 급식판 사진(스테인리스 식판). 촬영 안내(CaptureVerify)에서 "이런 걸 찍는다"를 보여 준다.
// 에셋 require는 Metro alias가 가끔 안 먹어서 상대경로로 둔다(이 파일은 src/data/).
export const trayPhoto = require('../../assets/images/food/tray.jpg');

// 홈 미션 카드(라임 배너) 우측 원형 음식 보울. 디자이너가 이 배너용으로 뽑아둔 에셋(Figma 34:3 img/banner).
export const bannerBowl = require('../../assets/images/food/banner_bowl.png');

// 통계 카드(먹은 기록 2x2)에 넣는 한 칸.
export type StatCardData = {
  symbol: import('expo-symbols').SymbolViewProps['name']; // SF Symbol 이름(오타를 컴파일 때 잡으려 타입 박음)
  fallbackGlyph: string; // 안드/웹용 폴백 글리프
  value: string;
  unit: string;
  label: string;
  sub: string;
};

// 마이페이지 프로필 카드 표시용.
export type Profile = {
  initial: string;
  name: string;
  level: string;
  school: string;
  klass: string;
  streak: number;
  friendCount: number;
  guaranteeCount: number;
};

// 보증 요청 카드 표시용.
export type GuaranteeRequest = {
  id: string;
  initial: string;
  name: string;
  relation: string;
  time: string;
  reason: string;
  avatarColor: string;
};

// 친구 행 표시용.
export type Friend = {
  id: string;
  initial: string;
  name: string;
  klass: string;
  avatarColor: string;
  verifiedToday: boolean;
};
