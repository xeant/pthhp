import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { createLoginNotificationAction } from "@/modules/notification/actions/notification.action";

const isAuthError = (error: unknown) => {
  return error instanceof Error && ["UNAUTHORIZED", "INVALID_TOKEN"].includes(error.message);
};

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    await createLoginNotificationAction({
      userId: user.id,
      source: "mobile",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[Mobile Login Notification API] failed:", error);
    return NextResponse.json({ success: false, message: "로그인 알림 생성에 실패했습니다." }, { status: 500 });
  }
}
