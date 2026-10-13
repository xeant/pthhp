import { NextResponse } from "next/server";
import { removeNotification } from "@/modules/notification/actions/notification.action";
import {getAuthenticatedUser} from "@/core/utils/auth/authHelper";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../_utils";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    // 1. 🌟 Next.js 16 규격에 맞춰 params를 await 합니다.
    const { uuid } = await params;

    // 2. 유저 인증 확인
    const user = await getAuthenticatedUser();
    if (!user) {
      return notificationGuestResponse({ success: false, latestUnread: [], newCount: 0 });
    }

    // 3. 알림 삭제 액션 호출 (이미 보안 처리가 되어 있을 거예요)
    const result = await removeNotification(uuid, user.id);

    return NextResponse.json(result);
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse({ success: false, latestUnread: [], newCount: 0 });
    console.error("❌ [API] 삭제 처리 에러:", error);
    return notificationServerErrorResponse("삭제 실패");
  }
}
