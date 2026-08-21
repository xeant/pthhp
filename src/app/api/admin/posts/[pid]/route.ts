import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/utils/db/prisma";
import { verify } from "@/core/utils/auth/jwtAuth"; // Prisma 클라이언트 경로 확인

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname; // /api/admin/posts/abc123
    const id = pathname.split("/").pop(); // 마지막 segment 가져오기
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifyToken = await verify(accessToken!);
    if (!verifyToken || verifyToken.isAdmin !== true) {
      return NextResponse.json(
        {
          success: true,
          type: "warning",
          message: "Access denied. You do not have administrator privileges.",
        },
        { status: 403 },
      );
    } else {
      const post = await prisma.modules.findUnique({
        where: { id: Number(id) },
        // include: {
        //   categories: {
        //     include: {
        //       documents: true, // Category 안의 Document를 가져옴
        //     },
        //   },
        // },
      });

      if (!post) {
        return NextResponse.json(
          { success: false, message: "게시물을 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const userId = verifyToken.id;
      console.log(userId);
      // 유저가 속한 그룹 ID들 조회
      const userGroupLinks = await prisma.userGroupUser.findMany({
        where: { userId },
        select: { groupId: true },
      });
      console.log(userGroupLinks);
      const groupIds = userGroupLinks.map((g) => g.groupId);
      console.log(groupIds);
      // 해당 게시물에 대한 그룹 권한 조회
      const permissions = await prisma.permission.findMany({
        where: {
          moduleType: "posts",
          moduleId: Number(id),
          subjectType: "group",
          subjectId: { in: groupIds },
        },
      });
      console.log(permissions);
      return NextResponse.json(
        {
          success: true,
          type: "success",
          message: "",
          data: {
            post,
            permissions,
          },
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("게시판 리스트 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "게시판 정보를 불러오는 중 오류 발생" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } },
  );
}
