import { NextResponse } from "next/server";
import { getUnreadCount } from "@/modules/notification/actions/notification.action";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../_utils";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const count = await getUnreadCount(user.id);
    return NextResponse.json({ count });
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse({ count: 0 });
    return notificationServerErrorResponse("알림 카운트 로드 실패");
  }
}
