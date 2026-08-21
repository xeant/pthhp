import { NextResponse, NextRequest } from "next/server";

import { refresh, refreshVerify, sign, verify } from "@/core/utils/auth/jwtAuth";

import { findUserById } from "@/modules/user/actions/user.query";
import prisma from "@/core/utils/db/prisma";
import { getAccessTokenCookieOptions, getExpiredAuthCookieOptions, getRefreshTokenCookieOptions } from "@/core/utils/auth/authCookies";
import { hashRefreshToken } from "@/core/utils/auth/refreshToken";
import { getAuthSettingsRuntimeAction } from "@/modules/admin/actions/auth-settings";
import { findUserPreferenceByUserId } from "@/modules/user/actions/preference.query";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const authSettings = await getAuthSettingsRuntimeAction();

    let userId: number | null = null;
    let needsNewToken = false;

    // 1. Access Token 검증
    if (accessToken) {
      const decoded = await verify(accessToken);
      if (decoded) userId = decoded.id;
      else needsNewToken = true; // 만료됨
    } else {
      needsNewToken = true; // 토큰 없음
    }

    // 2. 토큰 갱신이 필요한 경우 Refresh Token 확인
    if (needsNewToken && refreshToken) {
      const refreshDecoded = await refreshVerify(refreshToken);
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const refreshUser = refreshDecoded?.id
        ? await prisma.user.findUnique({
          where: { id: refreshDecoded.id },
          include: { userGroups: { select: { groupId: true } } },
        })
        : null;

      if (refreshDecoded && refreshUser?.refreshToken === refreshTokenHash) {
        if (!isUserAccountAvailable(refreshUser)) {
          return expiredSessionResponse();
        }

        userId = refreshDecoded.id;

        // 새로운 Access Token 발급 및 쿠키 설정 로직 진행
        const tokenParams = {
          id: refreshUser.id,
          accountId: refreshUser.accountId,
          isAdmin: refreshUser.isAdmin,
          nickName: refreshUser.nickName,
          groups: refreshUser.userGroups.map((group) => group.groupId),
        };
        const [newAccessToken, newRefreshToken] = await Promise.all([
          sign(tokenParams, authSettings.accessTokenExpiresIn),
          refresh(tokenParams, authSettings.refreshTokenExpiresIn),
        ]);

        await prisma.user.update({
          where: { id: refreshUser.id },
          data: { refreshToken: hashRefreshToken(newRefreshToken) },
        });

        // 유저 정보 가져오기 (공통 로직으로 통합)
        const user = await findUserById(userId!);
        if (user) {
          const response = NextResponse.json({
            isLoggedIn: true,
            ...(await formatUserResponse(user)) // 유저 정보 포맷팅
          });

          response.cookies.set({
            name: "accessToken",
            value: newAccessToken,
            ...getAccessTokenCookieOptions(authSettings.accessTokenExpiresIn),
          });
          response.cookies.set({
            name: "refreshToken",
            value: newRefreshToken,
            ...getRefreshTokenCookieOptions(authSettings.refreshTokenExpiresIn),
          });
          return response;
        }
      }
    }

    // 3. 유저 정보 반환 (정상 로그인 상태)
    if (userId) {
      const user = await findUserById(userId);
      if (user) {
        if (!isUserAccountAvailable(user)) {
          return expiredSessionResponse();
        }

        return NextResponse.json({
          isLoggedIn: true,
          ...(await formatUserResponse(user))
        });
      }
    }

    // 4. 모든 검증 실패 시 쿠키 삭제 및 비로그인 반환
    return expiredSessionResponse();

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function isUserAccountAvailable(user: any) {
  return Boolean(user.isAdmin) || !user.status || user.status === "active";
}

function expiredSessionResponse() {
  const response = NextResponse.json({ isLoggedIn: false });
  response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
  response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
  return response;
}

// 헬퍼 함수: 응답 포맷 통일
async function formatUserResponse(user: any) {
  return {
    id: user.id,
    accountId: user.accountId,
    nickName: user.nickName,
    email_address: user.email_address,
    isAdmin: user.isAdmin,
    profile: user.profile,
    profileImage: user.profile?.profileImage || null,
    preferences: await findUserPreferenceByUserId(user.id),
  };
}
