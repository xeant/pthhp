import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";

import { createRandomToken, QR_LOGIN_TTL_SECONDS, writeQrLoginSession } from "./_utils";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const sessionId = createRandomToken(16);
    const nonce = createRandomToken(16);
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + QR_LOGIN_TTL_SECONDS * 1000);

    await writeQrLoginSession(sessionId, {
      nonce,
      status: "pending",
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    const qrPayload = `gjw1:${sessionId}:${nonce}`;

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "L",
      margin: 2,
      scale: 8,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      success: true,
      sessionId,
      expiresAt: expiresAt.toISOString(),
      ttlSeconds: QR_LOGIN_TTL_SECONDS,
      qrPayload,
      qrDataUrl,
    });
  } catch (error) {
    console.error("QR Login Create Error:", error);
    return NextResponse.json({ success: false, message: "QR 로그인 세션을 만들지 못했습니다." }, { status: 500 });
  }
}
