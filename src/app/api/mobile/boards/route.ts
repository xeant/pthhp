import { NextRequest, NextResponse } from "next/server";

import prisma from "@/core/utils/db/prisma";
import { verify } from "@/core/utils/auth/jwtAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const accessToken = request.cookies.get("accessToken")?.value;
  const verified = accessToken ? await verify(accessToken) : null;

  if (!verified?.id) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    const boards = await prisma.modules.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        mid: true,
        moduleName: true,
        moduleDesc: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
            Categorys: true,
          },
        },
        documents: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            id: true,
            uuid: true,
            slug: true,
            title: true,
            updatedAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: boards.map((board) => ({
          id: board.id,
          mid: board.mid,
          moduleName: board.moduleName,
          moduleDesc: board.moduleDesc,
          config: board.config,
          documentCount: board._count.documents,
          categoryCount: board._count.Categorys,
          latestDocument: board.documents[0] || null,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Mobile Boards API Error]", error);
    return NextResponse.json(
      { success: false, message: "게시판 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
