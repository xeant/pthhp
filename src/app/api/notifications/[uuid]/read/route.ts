import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { setReadStatus } from "@/modules/notification/actions/notification.action";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../../_utils";

// 🌟 params의 타입을 Promise로 감싸주는 게 핵심입니다.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    // 1. Next.js 15 규격에 맞게 params를 await 합니다.
    const { uuid } = await params;

    // 2. 유저 인증
    const user = await getAuthenticatedUser();
    if (!user) {
      return notificationGuestResponse({ success: false, newCount: 0 });
    }

    // 3. 읽음 처리 액션 실행
    const result = await setReadStatus(uuid, user.id);

    return NextResponse.json(result);
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse({ success: false, newCount: 0 });
    console.error("❌ [API] 읽음 처리 에러:", error);
    return notificationServerErrorResponse("처리 실패");
  }
}
