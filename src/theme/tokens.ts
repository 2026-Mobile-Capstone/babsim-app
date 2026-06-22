// 밥심 디자인 토큰. 색·폰트·반경·여백을 한 곳에 모은다 (루트 claude.md: 설정은 한 곳에).
//
// 팔레트는 '급식판' 자체에서 나왔다 — 스테인리스 식판(steel-dark) + 신선한 채소(lime) + 쌀밥·우유(bone-cream).
// lime은 '인증/해제/지금'을 가리키는 신호색이라 아껴 쓴다(다 칠하면 신호가 안 된다).
// bone(따뜻한 미색)은 '완료'와 큰 숫자·강조에 써서 초록-검정 단조로움을 깬다.

export const colors = {
  // 바탕 + 표면 단계(낮음<바탕<표면<들린 표면) — 깊이를 주려고 사다리로 둔다.
  bg: '#0D0F0B', // 살짝 따뜻한 먹색(완전 블랙 아님)
  surfaceSunken: '#131510', // 우물(칩·입력칸·빈 영역)
  surface: '#1A1D15', // 기본 카드
  surfaceAlt: '#21241A', // 들린 카드(중요한 것 — 통계/베스트/모달 시트)
  navBg: '#14160E', // 탭바 폴백색

  // 신호색 lime — 아껴 쓴다(액션/인증/해제)
  lime: '#C2F94B',
  limeDeep: '#A4E034', // 눌림·보조 라임
  onLime: '#0D0F0B', // lime 위 글자
  onLimeDim: '#1A2410', // lime 위 보조 글자
  // 라임 변형은 면(Wash)과 선(Border)으로 나눈다. 전엔 파일마다 rgba를 손으로 적었는데
  // 그 중 절반이 lime(194,249,75)이 아니라 살짝 다른 hue(189,242,69=#BDF245)였다 — 여기로 모으며 진짜 lime으로 통일.
  limeWash: 'rgba(194,249,75,0.12)', // 라임 옅게 깐 면(아이콘 칸·배지·보조 버튼). 전엔 0.10~0.14로 흔들렸는데 0.12로 통일.
  limeBorder: 'rgba(194,249,75,0.25)', // 라임 강조 테두리(선택된 항목·오늘·결과 카드). 전엔 0.22~0.30으로 흔들렸는데 0.25로 통일.

  // bone — 완료/강조/큰 숫자
  bone: '#ECE9DE',

  // 텍스트 사다리(밝음→어두움). 차갑지 않게 세이지-스틸 톤.
  text: '#ECEDE7',
  textSecondary: '#AEB3A4',
  textMuted: '#8C9382',
  textDim: '#6B7264',
  textFaint: '#565C50',
  locationLabel: '#8C9382',

  chipBorder: '#363B2E',
  chipText: '#9AA08D',

  divider: 'rgba(236,233,222,0.07)',
  navBorder: 'rgba(236,233,222,0.09)',
  cardBorder: 'rgba(236,233,222,0.05)', // 들린 카드 가장자리 헤어라인(은은한 입체감)

  // 위험/실패(흐릿) — 탁한 호박색
  warning: '#D9B45A',
  warningBg: 'rgba(217,180,90,0.12)',
  warningBorder: 'rgba(217,180,90,0.22)',
  warningText: '#DFC074',

  // 부정/거절
  danger: '#E2806C', // 에러 텍스트는 전부 이걸로 — 전엔 화면마다 #E5786A를 따로 박아서 톤이 미묘하게 달랐다.
  dangerBg: 'rgba(226,128,108,0.12)', // danger 옅게 깐 면(알림 배지 등). warningBg와 짝.

  // 사진 위 가림막 — bg(0D0F0B)를 반쯤 깔아 그 위 힌트 글자가 읽히게.
  scrim: 'rgba(13,15,11,0.45)',
} as const;

// 히트맵 강도 0~4. 스테인리스 어둠 → 신선한 라임.
export const heat = ['#1A1D15', '#2E4019', '#557A24', '#8FC233', '#C2F94B'] as const;

export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

// 숫자는 자릿수가 흔들리지 않게 고정폭으로(카운트다운·통계·시간).
export const tabular = { fontVariant: ['tabular-nums' as const] };

export const radius = {
  card: 22,
  cardLg: 26,
  sheet: 28,
  field: 14,
  pill: 999,
} as const;

export const space = {
  gutter: 16,
  iconButton: 44,
} as const;

// 들린 카드용 그림자(은은하게). iOS는 shadow*, 안드는 elevation.
export const elevation = {
  raised: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
