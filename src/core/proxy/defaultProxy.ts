import { NextRequest, NextResponse } from "next/server";

import { getExpiredAuthCookieOptions } from "@/core/utils/auth/authCookies";
import { verify } from "@/core/utils/auth/jwtAuth";
import redisClient from "@/core/utils/redis/redis";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  if (isStateChangingRequest(request) && !isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  }

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  let decodeToken: { id: string; isAdmin: boolean } | null = null;
  if (accessToken?.value) {
    try {
      const verified = await verify(accessToken.value);
      decodeToken = verified
        ? { id: String(verified.id), isAdmin: Boolean(verified.isAdmin) }
        : null;
    } catch {
      // Token errors are handled by the route permission checks below.
    }
  }

  if (decodeToken?.id) {
    const userIp = getClientIp(request).replace(/^::ffff:/, "");
    const activeKey = `active_user:${decodeToken.id}:${userIp}`;

    try {
      const isActive = await redisClient.exists(activeKey);

      if (!isActive && !pathname.startsWith("/auth")) {
        const response = NextResponse.redirect(new URL("/auth/signin?reason=kicked", request.url));
        response.cookies.set("accessToken", "", getExpiredAuthCookieOptions());
        response.cookies.set("refreshToken", "", getExpiredAuthCookieOptions());
        return response;
      }

      await redisClient.expire(activeKey, 300);
    } catch (error) {
      console.error("Proxy Redis Error:", error);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!decodeToken?.id) return NextResponse.redirect(new URL("/auth/signin", request.url));
    if (!decodeToken?.isAdmin) return NextResponse.redirect(new URL("/access", request.url));
  }

  if (pathname.startsWith("/user") && !decodeToken?.id) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

const getClientIp = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (request as any).ip || request.headers.get("x-real-ip") || "unknown";
};

const CSRF_PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const isStateChangingRequest = (request: NextRequest) => {
  return CSRF_PROTECTED_METHODS.has(request.method.toUpperCase());
};

const isSameOriginRequest = (request: NextRequest) => {
  const sourceOrigin = getHeaderOrigin(request.headers.get("origin"))
    ?? getHeaderOrigin(request.headers.get("referer"));

  if (!sourceOrigin) return false;

  return getAllowedOrigins(request).has(sourceOrigin);
};

const getAllowedOrigins = (request: NextRequest) => {
  const origins = new Set<string>([request.nextUrl.origin]);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");

  if (host) {
    origins.add(`${forwardedProto || request.nextUrl.protocol.replace(":", "")}://${host}`);
  }

  const defaultUrlOrigin = getHeaderOrigin(process.env.NEXT_PUBLIC_DEFAULT_URL ?? null);
  if (defaultUrlOrigin) origins.add(defaultUrlOrigin);

  return origins;
};

const getHeaderOrigin = (value: string | null) => {
  if (!value || value === "null") return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};
