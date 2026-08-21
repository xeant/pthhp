import { NextRequest, NextResponse } from "next/server";

import { getQrLoginKey, readQrLoginSession, setQrLoginCookies } from "../_utils";
import redisClient from "@/core/utils/redis/redis";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ success: false, status: "missing" }, { status: 400 });
    }

    const session = await readQrLoginSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, status: "expired" }, { status: 404 });
    }

    if (session.status !== "approved" || !session.userId) {
      const ttl = await redisClient.ttl(getQrLoginKey(sessionId));
      return NextResponse.json({
        success: true,
        status: "pending",
        expiresAt: session.expiresAt,
        ttlSeconds: Math.max(ttl, 0),
      });
    }

    const response = await setQrLoginCookies(request, session.userId);
    await redisClient.del(getQrLoginKey(sessionId));

    if (!response) {
      return NextResponse.json({ success: false, status: "failed" }, { status: 401 });
    }

    return response;
  } catch (error) {
    console.error("QR Login Status Error:", error);
    return NextResponse.json({ success: false, status: "error" }, { status: 500 });
  }
}
