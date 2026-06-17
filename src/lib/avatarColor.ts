// 닉네임 -> 아바타 배경색. 같은 사람은 늘 같은 색이 나오게 닉네임을 해시한다.
// 마이페이지·홈 친구 줄 등 여러 곳에서 같은 색을 써야 해서 한 곳에 모았다.
const AVATAR_COLORS = ['#E8743B', '#6C8CE8', '#4C6FE0', '#9B5CE6', '#E0794C', '#3FB8A0', '#D85C8A'];

export function avatarColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
