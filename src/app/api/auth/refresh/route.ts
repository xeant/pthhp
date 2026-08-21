import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  sign,
  refresh,
  refreshVerify,
} from "@/core/utils/auth/jwtAuth";
import prisma from "@/core/utils/db/prisma";
import { getAccessTokenCookieOptions, getExpiredAuthCookieOptions, getRefreshTokenCookieOptions } from "@/core/utils/auth/authCookies";
import { hashRefreshToken } from "@/core/utils/auth/refreshToken";
import { getAuthSettingsRuntimeAction } from "@/modules/admin/actions/auth-settings";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const authSettings = await getAuthSettingsRuntimeAction();

  try {
    if (!refreshToken) {
      const response = NextResponse.json({
        success: false,
        code: "token_error",
        type: "error",
        message: "refreshToken이 존재하지 않습니다.",
        data: {},
      }, { status: 401 });
      response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
      response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
      return response;
    }

    const refreshVerifyToken = await refreshVerify(refreshToken);
    if (!refreshVerifyToken?.id) {
      const response = NextResponse.json({
        success: false,
        code: "refreshToken_expires",
        type: "error",
        message: "token이 만료되었습니다. 로그인을 새로 해주세요.",
        data: {},
      }, { status: 401 });
      response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
      response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: refreshVerifyToken.id },
      include: {
        userGroups: {
          select: { groupId: true },
        },
      },
    });

    if (!user || user.refreshToken !== hashRefreshToken(refreshToken)) {
      const response = NextResponse.json({
        success: false,
        code: "invalid_refreshToken",
        type: "error",
        message: "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
        data: {},
      }, { status: 401 });
      response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
      response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
      return response;
    }

    if (!user.isAdmin && user.status && user.status !== "active") {
      const response = NextResponse.json({
        success: false,
        code: "inactive_account",
        type: "error",
        message: "현재 사용할 수 없는 계정입니다.",
        data: {},
      }, { status: 403 });
      response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
      response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
      return response;
    }

    const tokenParams = {
      id: user.id,
      accountId: user.accountId,
      isAdmin: user.isAdmin,
      nickName: user.nickName,
      groups: user.userGroups.map((group) => group.groupId),
    };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      sign(tokenParams, authSettings.accessTokenExpiresIn),
      refresh(tokenParams, authSettings.refreshTokenExpiresIn),
    ]);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashRefreshToken(newRefreshToken) },
    });

    const response = NextResponse.json({
      success: true,
      code: "new_accessToken",
      type: "success",
      message: "토큰이 갱신되었습니다.",
      data: {},
    });
    response.cookies.set("accessToken", newAccessToken, getAccessTokenCookieOptions(authSettings.accessTokenExpiresIn));
    response.cookies.set("refreshToken", newRefreshToken, getRefreshTokenCookieOptions(authSettings.refreshTokenExpiresIn));

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        code: "server_error",
        type: "error",
        message: "서버 오류가 발생했습니다.",
        data: {},
      },
      { status: 500 },
    );
  }
}
