// 1. JSX 내의 모든 커스텀 엘리먼트 허용 (기존 유지)
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// 2. 전역 인터페이스 및 변수
declare global {
  // 인증 유저는 세션 어디서든 쓰이므로 전역으로 두는 것이 편리함
  interface AuthUser {
    id: number;
    accountId: string;
    isAdmin: boolean;
    groups: any[]; // []에서 any[]로 수정 (빈 배열 타입 방지)
    exp: number;   // JWT exp는 보통 timestamp(number)입니다
  }

  // 커스텀 로거 등 전역 변수
  var Log: any;
}

// 💡 중요: export {}가 있어야 이 파일이 '모듈'이 아닌 '전역 선언'으로 작동합니다.
export {};