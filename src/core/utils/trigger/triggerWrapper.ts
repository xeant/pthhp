// src/utils/trigger/triggerWrapper.ts
import { dispatchTrigger } from "./triggerHub";

/**
 * 🌟 비즈니스 로직에 트리거 기능을 주입하는 고차 함수
 * @param triggerType - trigger.json에 정의된 Key (예: "comment.created")
 * @param mainAction - 실행할 실제 서버 액션
 */
export function withTrigger<T extends (...args: any[]) => Promise<any>>(
  triggerType: string,
  mainAction: T
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // 1. 메인 로직 실행 (댓글 저장 등)
    const result = await mainAction(...args);

    // 2. 결과가 성공적(success: true 혹은 데이터 존재)이라면 트리거 발동
    if (result && (result.success || result.id)) {
      // 💡 비동기로 던져서 사용자 응답 속도 최적화
      // 여기서 세션 정보를 함께 넘겨주고 싶다면 context에 추가 가능
      dispatchTrigger(triggerType, { args, result });
    }

    return result;
  };
}