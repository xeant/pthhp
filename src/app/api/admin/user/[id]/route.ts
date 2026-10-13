import { NextResponse, NextRequest } from "next/server";

import { verify } from "@/core/utils/auth/jwtAuth";
import { jsonResponse } from "@/core/utils/helper/jsonResponse";
import prisma, { PermissionSubject } from "@/core/utils/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken)
      return jsonResponse(
        403,
        "Unauthorized access. Please log in to continue",
      );

    const verifyToken = await verify(accessToken);
    if (!verifyToken || verifyToken.isAdmin !== true) {
      return jsonResponse(
        403,
        "Access denied. You do not have administrator privileges.",
      );
    }

    // ✅ 여기서 반드시 Response 반환
    return NextResponse.json({
      success: true,
      type: "success",
      message: "Admin access granted",
    });
  } catch (error) {
    console.error("Server error:", error);
    return jsonResponse(500, "Internal server error. Please try again later.");
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } },
  );
}
