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

  const userId = verified.id;

  try {
    const [
      boardCount,
      documentCount,
      attachmentCount,
      unreadNotificationCount,
      groupCount,
      recentDocuments,
      recentAttachments,
    ] = await Promise.all([
      prisma.modules.count({ where: { status: "active" } }),
      prisma.document.count({ where: { userId } }),
      prisma.attachment.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.userGroupUser.count({ where: { userId } }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          uuid: true,
          slug: true,
          title: true,
          moduleType: true,
          moduleId: true,
          updatedAt: true,
          module: {
            select: {
              mid: true,
              moduleName: true,
            },
          },
        },
      }),
      prisma.attachment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          uuid: true,
          originalName: true,
          mimeType: true,
          size: true,
          path: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          counts: {
            boards: boardCount,
            documents: documentCount,
            files: attachmentCount,
            unreadNotifications: unreadNotificationCount,
            groups: groupCount,
          },
          recentDocuments,
          recentAttachments,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Mobile Bootstrap API Error]", error);
    return NextResponse.json(
      { success: false, message: "모바일 초기 데이터를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
