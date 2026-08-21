import { NextResponse, NextRequest } from "next/server";
import { verify } from "@/core/utils/auth/jwtAuth";
import { findUserById } from "@/modules/user/actions/user.query";
import { hashedPassword, verifyPassword } from "@/core/utils/auth/password";
import prisma from "@/core/utils/db/prisma";

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const verifyToken = await verify(accessToken!);
    if (verifyToken) {
      const user = await findUserById(verifyToken.id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const formData = await request.formData();
      const nowPasswordValue = formData.get("nowPasswordValue") as string;
      const newPasswordValue = formData.get("newPasswordValue") as string;
      const renewPasswordValue = formData.get("renewPasswordValue") as string;

      if (!nowPasswordValue || !newPasswordValue || !renewPasswordValue) {
        return NextResponse.json(
          {
            success: false,
            type: "warning",
            message: "모든 필드를 입력하세요.",
          },
          { status: 400 },
        );
      }

      if (newPasswordValue !== renewPasswordValue) {
        return NextResponse.json(
          {
            success: false,
            type: "error",
            message: "새 비밀번호가 일치하지 않습니다.",
          },
          { status: 400 },
        );
      }

      if (user! && (await verifyPassword(nowPasswordValue, user!.password))) {
        console.log(2345234234);
        await prisma.user.update({
          where: {
            accountId: verifyToken.accountId,
          },
          data: {
            password: await hashedPassword(newPasswordValue),
          },
        });
        return NextResponse.json({
          success: true,
          type: "success",
          message: "비밀번호가 성공적으로 변경되었습니다.",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            type: "error",
            message: "현재 비밀번호가 일치하지 않습니다.",
          },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { success: false, type: "error", message: "Invalid or expired token" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
