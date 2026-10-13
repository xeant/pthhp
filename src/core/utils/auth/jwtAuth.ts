import { SignJWT, jwtVerify } from "jose";

type TokenType = "access" | "refresh";

interface BaseTokenPayload {
  id: number;
  accountId: string;
  isAdmin: boolean | null;
  groups?: number[];
  nickName?: string | null;
  tokenType: TokenType;
  exp: number;
}

type AccessTokenPayload = BaseTokenPayload & { tokenType: "access" };
type RefreshTokenPayload = BaseTokenPayload & { tokenType: "refresh" };

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return new TextEncoder().encode(jwtSecret);
};

const verifyByType = async <T extends BaseTokenPayload>(token: string, tokenType: TokenType): Promise<T | null> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tokenType !== tokenType) return null;
    return payload as unknown as T;
  } catch (err) {
    return null;
  }
};

// access Token 발급
const sign = async (payload: object, expiresIn = process.env.ACCESSTOKEN_EXPIRES_IN) => {
  const accessToken_expiresIn = expiresIn;
  if (!accessToken_expiresIn)
    throw new Error("ACCESSTOKEN_EXPIRES_IN is not defined");
  return await new SignJWT({ ...payload, tokenType: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(accessToken_expiresIn)
    .sign(getJwtSecret());
};

// access Token 검증
const verify = async (token: string): Promise<AccessTokenPayload | null> => verifyByType<AccessTokenPayload>(token, "access");

// refresh Token 발급
const refresh = async (payload: object, expiresIn = process.env.REFRESHTOKEN_EXPIRES_IN) => {
  const refreshToken_expiresIn = expiresIn;
  if (!refreshToken_expiresIn)
    throw new Error("REFRESHTOKEN_EXPIRES_IN is not defined");
  return await new SignJWT({ ...payload, tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(refreshToken_expiresIn)
    .sign(getJwtSecret());
};

const refreshVerify = async (
  token: string,
): Promise<RefreshTokenPayload | null> => verifyByType<RefreshTokenPayload>(token, "refresh");

export { sign, verify, refresh, refreshVerify };
