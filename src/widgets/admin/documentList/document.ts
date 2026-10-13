'use server';

import prisma from "@utils/db/prisma";

export async function getDocumentListAll(limit?: number) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  return prisma.document.findMany({
    take: safeLimit,
    orderBy: {
      createdAt: 'desc',
    },

    select: {
      id: true,
      uuid: true,
      slug: true,
      title: true,
      content: true,
      createdAt: true,
      isSecrets: true,
      authorName: true,
      status: true,
      user: {
        select: {
          id: true,
          accountId: true,
          nickName: true,
        },
      },
      module: {
        select: {
          id: true,
          mid: true,
          moduleName: true,
        },
      },
    }
  });
}
