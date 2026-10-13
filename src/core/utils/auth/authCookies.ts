import { timeToSeconds } from "@/core/utils/date/timeToSeconds";

const getAuthCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

const getAccessTokenCookieOptions = (expiresIn = process.env.ACCESSTOKEN_EXPIRES_IN || "1h") => getAuthCookieOptions(timeToSeconds(expiresIn));

const getRefreshTokenCookieOptions = (expiresIn = process.env.REFRESHTOKEN_EXPIRES_IN || "4h") => getAuthCookieOptions(timeToSeconds(expiresIn));

const getExpiredAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
});

export {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getExpiredAuthCookieOptions,
};
