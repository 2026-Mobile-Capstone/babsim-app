// API 서버 주소.
// - iOS 시뮬레이터: 시뮬은 맥의 네트워크를 그대로 쓰니 localhost로 붙는다.
// - 실기기(폰): 같은 와이파이의 맥 LAN IP로 바꿔야 한다(`ipconfig getifaddr en0`).
//   서버는 `uvicorn app.main:app --host 0.0.0.0`으로 띄운다.
export const API_BASE_URL = 'http://localhost:8000';
