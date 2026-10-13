import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { deleteAllNotifications } from "@/modules/notification/actions/notification.action";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../_utils";

export async function POST() {
  try {
    // 1. 현재 로그인한 유저 확인
    const user = await getAuthenticatedUser();
    if (!user) return notificationGuestResponse({ success: false, message: "인증된 사용자가 아닙니다." });

    // 2. 해당 유저의 모든 알림 삭제 액션 호출
    await deleteAllNotifications(user.id);

    return NextResponse.json({ success: true, message: "모든 알림이 삭제되었습니다." });
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse({ success: false, message: "인증된 사용자가 아닙니다." });
    console.error("❌ [API] 전체 삭제 에러:", error);
    return notificationServerErrorResponse("전체 삭제 실패");
  }
}
