// 표준 응답 규약
export interface ActionResponse<T = any> {
  success: boolean;            // 작업 성공 여부
  message: string;             // 사용자에게 보여줄 알림 문구
  type?: "success" | "error" | "warning" | "info"; // 알림 UI 스타일에 활용
  data?: T | null;             // 성공 시 전달할 실제 데이터 (제네릭 사용)
  fieldErrors?: Record<string, string>; // 폼 필드별 에러 메시지 (예: { accountId: "중복" })
}