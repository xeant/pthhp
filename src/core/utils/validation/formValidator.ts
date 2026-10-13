import { z } from "zod";

// Zod 스키마와 데이터를 넣으면, 성공 여부와 포장된 에러를 뱉어내는 만능 함수
export function validateForm<T>(schema: z.ZodType<T>, payload: any) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach(issue => {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    });

    return {
      isValid: false as const,
      errorResponse: {
        success: false,
        type: "error" as const,
        message: parsed.error.issues[0]?.message || "입력값을 확인해주세요.",
        fieldErrors
      }
    };
  }

  return { isValid: true as const, data: parsed.data };
}