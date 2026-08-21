export function parseActionInput<T>(input: FormData | T): T {
    if (input instanceof FormData) {
        // FormData를 Plain Object로 변환
        return Object.fromEntries(input.entries()) as unknown as T;
    }
    return input; // 이미 JSON(Object)이라면 그대로 반환
}