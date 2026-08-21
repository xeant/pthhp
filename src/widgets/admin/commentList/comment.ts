'use server';

import prisma from "@utils/db/prisma";

export async function getCommentListAll(limit?: number) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  return prisma.comment.findMany({
    take: safeLimit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      uuid: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      isDeleted: true,
      isSecret: true,
      voteCount: true,
      depth: true,
      status: true,

      user: {
        select: {
          id: true,
          accountId: true,
          nickName: true,
        },
      },

      document: {
        select: {
          id: true,
          uuid: true,
          slug: true,
          title: true,
          isSecrets: true,
          moduleId: true,
          moduleType: true,
          status: true,
          module: {
            select: {
              id: true,
              mid: true,
              moduleName: true,
            },
          },
        },
      },
    },
  });
}