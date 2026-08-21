import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { refreshVerify, verify } from "@/core/utils/auth/jwtAuth";
import prisma from "@/core/utils/db/prisma";
import { getExpiredAuthCookieOptions } from "@/core/utils/auth/authCookies";
import { hashRefreshToken } from "@/core/utils/auth/refreshToken";

export async function POST(): Promise<Response> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const verified = accessToken ? await verify(accessToken) : null;
    const refreshVerified = !verified && refreshToken ? await refreshVerify(refreshToken) : null;
    const userId = verified?.id || refreshVerified?.id;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });

      if (!refreshToken || user?.refreshToken === hashRefreshToken(refreshToken)) {
        await prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null },
        }).catch(() => null);
      }
    }

    // 쿠키에서 accessToken, refreshToken을 가져와서 삭제
    const response = NextResponse.json({ message: "Logged out successfully" });

    // accessToken, refreshToken 쿠키 삭제
    response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
    response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());

    // 로그아웃 후 응답 반환
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error during logout" },
      { status: 500 },
    );
  }
}
