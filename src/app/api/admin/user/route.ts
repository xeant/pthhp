import { NextRequest } from "next/server";
import { verify } from "@/core/utils/auth/jwtAuth";
import { jsonResponse } from "@/core/utils/helper/jsonResponse";
import {
  saveUserAction,
} from "@/modules/user/actions/user.action";

/**
 * [GET] 관리자 권한 확인
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) return jsonResponse(403, "로그인이 필요합니다.", false);

    const verifyToken = await verify(accessToken);
    if (!verifyToken || !verifyToken.isAdmin) {
      return jsonResponse(403, "관리자 권한이 없습니다.", false);
    }

    return jsonResponse(200, "관리자 인증 성공", true);
  } catch (error) {
    return jsonResponse(500, "서버 오류가 발생했습니다.", false);
  }
}

/**
 * [POST] 사용자 등록
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const verifyToken = accessToken ? await verify(accessToken) : null;

    if (!verifyToken || !verifyToken.isAdmin) {
      return jsonResponse(403, "관리자만 유저를 등록할 수 있습니다.", false);
    }

    const formData = await request.formData();
    const result = await saveUserAction(formData);

    if (result.success) {
      return jsonResponse(201, result.message, true, result.data);
    } else {
      const status = result.message.includes("사용 중") ? 409 : 400;
      return jsonResponse(status, result.message, false, result.fieldErrors);
    }

  } catch (error) {
    console.error("API Register Error:", error);
    return jsonResponse(500, "서버 내부 오류가 발생했습니다.", false);
  }
}

// 🌟 혹시라도 위 export들이 인식 안 될 때를 대비한 명시적 모듈 선언 (생략 가능하지만 안전함)
export {};