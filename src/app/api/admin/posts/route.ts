import { NextRequest, NextResponse } from "next/server";
import prisma, { PermissionSubject } from "@/core/utils/db/prisma";
import { verify } from "@/core/utils/auth/jwtAuth";
import { jsonResponse } from "@/core/utils/helper/jsonResponse"; // Prisma 클라이언트 경로 확인

interface FormDataFields {
  moduleId: string;
  moduleName: string;
  listCount: number;
  pageCount: number;
  documentLike: boolean;
  consultingState: boolean;
  commentState: boolean;
  permissions: object | null;
}
//
// export async function GET(request: NextRequest): Promise<Response> {
//   try {
//     // URL에서 쿼리 파라미터 가져오기
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const keyword = searchParams.get("keyword") || "";
//
//     const listCount = 10; // 한 페이지당 게시글 수
//     const skip = (page - 1) * listCount;
//     const totalCount = await prisma.posts.count();
//     const totalPages = Math.ceil(totalCount / listCount);
//
//     // 게시글 조회
//     const posts = await prisma.posts.findMany({
//       where: {
//         OR: [
//           { pid: { contains: keyword, mode: "insensitive" } }, // 게시판 ID 검색
//           { postName: { contains: keyword, mode: "insensitive" } }, // 게시판 이름 검색
//         ],
//       },
//       skip,
//       take: listCount,
//       orderBy: { createdAt: "desc" }, // 최신순 정렬
//     });
//
//     return NextResponse.json(
//       {
//         success: true,
//         data: posts,
//         pagination: {
//           page,
//           listCount,
//           totalCount,
//           totalPages,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Post List API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "게시판 목록을 불러오는 중 오류 발생" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(request: NextRequest): Promise<Response> {
  try {
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
      const formData = await request.formData();
      const data = Object.fromEntries(formData.entries());
      const {
        moduleId,
        moduleName,
        listCount,
        pageCount,
        documentLike,
        consultingState,
        commentState,
        permissions,
      } = data as Record<keyof FormDataFields, string>;

      // 🚧 중복 게시판 확인
      const existingPost = await prisma.modules.findFirst({
        where: {
          OR: [{ mid: moduleId }, { moduleName: moduleName }],
        },
      });

      if (existingPost) {
        return NextResponse.json(
          {
            success: false,
            type: "warning",
            message:
              "Duplicate board ID or name detected. Please use unique values.",
          },
          { status: 409 },
        );
      }

      const newPost = await prisma.modules.create({
        data: {
          mid: moduleId,
          moduleName: moduleName,
          moduleDesc: "",
          config: JSON.stringify({
            listCount: Number(listCount),
            pageCount: Number(pageCount),
            documentLike: documentLike === "true",
            consultingState: consultingState === "true",
            commentState: commentState === "true",
          }),
          status: "active",
        },
      });

      // Step 2: 권한 생성
      if (permissions) {
        const parsedPermissions = JSON.parse(permissions) as {
          resource: string;
          action: string;
          subjectType: "USER" | "ROLE"; // 예시
          subjectId?: number;
        }[];

        await prisma.permission.createMany({
          data: parsedPermissions.map((perm) => ({
            module: "posts",
            resource: `post:${newPost.id}`, // 예: post:42
            action: perm.action,
            subjectType: PermissionSubject[perm.subjectType],
            subjectId: perm.subjectId,
          })),
        });
      }
      return NextResponse.json(
        {
          success: true,
          type: "success",
          message: "게시판 생성에 성공하였습니다.",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("게시판 생성 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "게시판 생성 중 오류 발생" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
      const body = await request.json();
      console.log(body);
      const { ids } = body;
      console.log(ids);

      if (!Array.isArray(ids))
        return NextResponse.json(
          {
            success: true,
            type: "danger",
            message: "Invalid request: 'ids' must be a non-empty array",
          },
          { status: 400 },
        );

      try {
        await prisma.modules.deleteMany({
          where: { id: { in: ids } },
        });
        return NextResponse.json(
          {
            success: true,
            type: "success",
            message: "Selected posts have been successfully deleted.",
          },
          { status: 200 },
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            type: "danger",
            message: "An error occurred while deleting posts.",
          },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.error("게시판 삭제 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "게시판 삭제 중 오류 발생" },
      { status: 500 },
    );
  }
}
