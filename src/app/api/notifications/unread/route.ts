import { NextResponse } from "next/server";
import { getUnreadList } from "@/modules/notification/actions/notification.action";
import {getAuthenticatedUser} from "@/core/utils/auth/authHelper";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../_utils";

export async function GET() {
  try {
    // 1. 여기서 에러가 나면 바로 catch로 넘어갑니다.
    const user = await getAuthenticatedUser();

    // 2. 유저 정보가 정말로 없는지 한 번 더 안전하게 체크
    if (!user || !user.id) {
      console.log("[Notification API]: No user found in session");
      return notificationGuestResponse([]);
    }

    const notifications = await getUnreadList(user.id);
    return NextResponse.json(notifications || []); // null 대비
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse([]);

    console.error("[Notification API Error]:", error);
    return notificationServerErrorResponse("서버 내부 에러");
  }
}
