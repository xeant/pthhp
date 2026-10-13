import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedQrUser, readQrLoginSession, writeQrLoginSession } from "../_utils";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await getAuthenticatedQrUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "앱 로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const sessionId = body?.sessionId?.toString();
    const nonce = body?.nonce?.toString();

    if (!sessionId || !nonce) {
      return NextResponse.json({ success: false, message: "QR 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const session = await readQrLoginSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, message: "만료된 QR입니다." }, { status: 410 });
    }

    if (session.nonce !== nonce) {
      return NextResponse.json({ success: false, message: "QR 검증에 실패했습니다." }, { status: 403 });
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: "만료된 QR입니다." }, { status: 410 });
    }

    await writeQrLoginSession(sessionId, {
      ...session,
      status: "approved",
      approvedAt: new Date().toISOString(),
      userId: user.id,
    }, 60);

    return NextResponse.json({
      success: true,
      message: "웹 로그인을 승인했습니다.",
    });
  } catch (error) {
    console.error("QR Login Complete Error:", error);
    return NextResponse.json({ success: false, message: "QR 승인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
