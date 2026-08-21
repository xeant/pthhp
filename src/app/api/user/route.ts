import { NextRequest } from "next/server";
import { jsonResponse } from "@/core/utils/helper/jsonResponse";
import {
  saveUserAction,
  getUserSessionAction,
  removeMyAccount,
} from "@/modules/user/actions/user.action";
import { getAuthSettingsRuntimeAction } from "@/modules/admin/actions/auth-settings";

/**
 * [GET] 내 정보 조회
 * - 전용 액션(getUserSessionAction)을 사용하여 보안과 로직을 통합합니다.
 */
export async function GET(): Promise<Response> {
  try {
    const result = await getUserSessionAction();

    if (result.success) {
      return jsonResponse(200, result.message, true, result.data);
    } else {
      return jsonResponse(401, result.message, false);
    }
  } catch (error) {
    return jsonResponse(500, "서버 오류가 발생했습니다.", false);
  }
}

/**
 * [POST] 회원가입
 * - saveUserAction 액션 하나로 [유효성 검사 + 중복 체크 + 해싱 + 저장]을 한 번에 끝냅니다.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const authSettings = await getAuthSettingsRuntimeAction();
    if (!authSettings.registrationEnabled) {
      return jsonResponse(403, "현재 회원가입이 허용되어 있지 않습니다.", false);
    }

    const formData = await request.formData();

    // 💡 팁: API에서 'email'로 보낸 값을 액션의 'email_address' 규격에 맞춰줍니다.
    if (formData.has("email") && !formData.has("email_address")) {
      formData.append("email_address", formData.get("email") as string);
    }

    const result = await saveUserAction(formData);

    if (result.success) {
      return jsonResponse(201, result.message, true, result.data);
    } else {
      // 중복 시 409, 입력 오류 시 400
      const status = result.message.includes("사용 중") ? 409 : 400;
      return jsonResponse(status, result.message, false, result.fieldErrors);
    }
  } catch (error) {
    return jsonResponse(500, "회원가입 처리 중 오류가 발생했습니다.", false);
  }
}

/**
 * [PUT] 회원정보 수정
 * - saveUserAction 액션은 id가 있으면 자동으로 UPDATE로 동작합니다.
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();

    // 현재 로그인된 세션 정보를 가져와서 안전하게 ID를 할당합니다.
    const session = await getUserSessionAction();
    if (!session.success || !session.data) {
      return jsonResponse(401, "로그인이 만료되었습니다.", false);
    }

    // 🛡️ 보안: 클라이언트가 보낸 ID가 아닌, 세션의 ID를 강제로 주입합니다.
    formData.set("id", session.data.id.toString());
    if (formData.has("email")) formData.set("email_address", formData.get("email") as string);

    const result = await saveUserAction(formData);

    if (result.success) {
      return jsonResponse(200, result.message, true, result.data);
    } else {
      return jsonResponse(400, result.message, false, result.fieldErrors);
    }
  } catch (error) {
    return jsonResponse(500, "정보 수정 중 오류가 발생했습니다.", false);
  }
}

/**
 * [DELETE] 회원 탈퇴
 * - 비밀번호 확인 및 계정 삭제 로직이 포함된 removeMyAccount를 사용합니다.
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const result = await removeMyAccount(formData);

    if (result.success) {
      return jsonResponse(200, result.message, true);
    } else {
      return jsonResponse(400, result.message, false, result.fieldErrors);
    }
  } catch (error) {
    return jsonResponse(500, "탈퇴 처리 중 오류가 발생했습니다.", false);
  }
}
