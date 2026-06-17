// KST(한국 시간) 헬퍼. NEIS·서버가 KST 기준이라, 폰 시간대가 달라도 '오늘'과 '지금 시각'을 KST로 본다.

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// 오늘 날짜 YYYYMMDD (KST)
export function todayKst(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}${pad2(kst.getUTCMonth() + 1)}${pad2(kst.getUTCDate())}`;
}

// 지금 시각 HHMM (KST). 잠금 시간대 판정(window_start <= now <= window_end)에 쓴다.
export function nowHhmmKst(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${pad2(kst.getUTCHours())}${pad2(kst.getUTCMinutes())}`;
}

// ISO 시각 -> 상대 표시('방금'·'12분 전'·'3시간 전'·'어제'·'6/20'). 알림 목록용.
export function relativeFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((Date.now() - then) / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  if (diffH < 48) return '어제';
  const kst = new Date(then + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()}`;
}
