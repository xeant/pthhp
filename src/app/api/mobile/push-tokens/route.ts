import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import { registerPushTokenAction, unregisterPushTokenAction } from "@/modules/notification/actions/push.action";

const isAuthError = (error: unknown) => {
  return error instanceof Error && ["UNAUTHORIZED", "INVALID_TOKEN"].includes(error.message);
};

const readTokenBody = async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const token = body?.token?.toString().trim();
  const platform = body?.platform?.toString().trim() || "android";
  const deviceName = body?.deviceName?.toString().trim() || null;

  return { token, platform, deviceName };
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { token, platform, deviceName } = await readTokenBody(request);

    if (!token || token.length < 20) {
      return NextResponse.json({ success: false, message: "유효하지 않은 푸시 토큰입니다." }, { status: 400 });
    }

    const result = await registerPushTokenAction({
      userId: user.id,
      token,
      platform,
      deviceName,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[Push Token API] register failed:", error);
    return NextResponse.json({ success: false, message: "푸시 토큰 등록에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { token } = await readTokenBody(request);

    if (!token) {
      return NextResponse.json({ success: false, message: "토큰이 없습니다." }, { status: 400 });
    }

    const result = await unregisterPushTokenAction(user.id, token);
    return NextResponse.json(result);
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    console.error("[Push Token API] unregister failed:", error);
    return NextResponse.json({ success: false, message: "푸시 토큰 해제에 실패했습니다." }, { status: 500 });
  }
}
