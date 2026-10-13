import { NextResponse } from "next/server";
import { setAllRead } from "@/modules/notification/actions/notification.action";
import {getAuthenticatedUser} from "@/core/utils/auth/authHelper";
import { isNotificationAuthError, notificationGuestResponse, notificationServerErrorResponse } from "../_utils";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    const result = await setAllRead(user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (isNotificationAuthError(error)) return notificationGuestResponse({ success: false, newCount: 0 });
    return notificationServerErrorResponse("전체 읽음 처리 실패");
  }
}
