type TriggerType = "before" | "after" | "both";

export function withTrigger<T extends (...args: any[]) => Promise<any>>(
  type: TriggerType,
  mainFn: T,
  triggerFn: (args: Parameters<T>, result?: Awaited<ReturnType<T>>) => Promise<void> | void
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {

    // 1. [BEFORE] 트리거 실행
    if (type === "before" || type === "both") {
      await triggerFn(args);
    }

    // 2. 메인 함수 실행
    const result = await mainFn(...args);

    // 3. [AFTER] 트리거 실행 (메인 결과값을 트리거에 전달 가능)
    if (type === "after" || type === "both") {
      await triggerFn(args, result);
    }

    return result;
  };
}