import { cookies, headers } from "next/headers";
import { verify } from "./jwtAuth";

export async function getAuthenticatedUser() {
  // 🌟 headers()가 Promise를 반환하므로 await로 먼저 받아야 합니다.
  const headerList = await headers();
  const authHeader = headerList.get("authorization");
  const tokenFromHeader = authHeader?.split(" ")[1];

  // 🌟 cookies() 역시 Promise이므로 await가 필요합니다.
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("accessToken")?.value;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  // 3. jwtAuth.ts의 verify 함수로 검증
  const payload = await verify(token);

  if (!payload || !payload.id) {
    throw new Error("INVALID_TOKEN");
  }

  // 4. 유저 ID 반환
  return {
    id: Number(payload.id),
    accountId: payload.accountId,
    isAdmin: payload.isAdmin
  };
}
