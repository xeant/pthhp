import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { getWebPushRuntimeStatusAction } from "@/modules/notification/actions/web-push.action";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user.isAdmin) {
      return NextResponse.json({ success: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const status = await getWebPushRuntimeStatusAction(new URL(request.url).origin);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    const isAuthError = error instanceof Error && ["UNAUTHORIZED", "INVALID_TOKEN"].includes(error.message);

    if (isAuthError) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[PWA Status API] failed:", error);
    return NextResponse.json({ success: false, message: "PWA/Web Push 상태 확인에 실패했습니다." }, { status: 500 });
  }
}
