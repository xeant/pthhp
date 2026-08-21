import { NextResponse } from "next/server";

/**
 * 공통 JSON 응답 함수 (데이터 바구니 추가)
 * @param status HTTP 상태 코드
 * @param message 응답 메시지
 * @param success 성공 여부
 * @param data 추가 데이터 (결과값 또는 에러 상세내용) 🌟 추가됨
 */
export function jsonResponse(
  status: number,
  message: string,
  success: boolean = false,
  data: any = null, // 🌟 4번째 인자를 추가합니다.
) {
  return NextResponse.json(
    {
      success,
      type: success ? "success" : "error",
      message,
      data // 🌟 응답 본문에 데이터를 포함시킵니다.
    },
    { status },
  );
}