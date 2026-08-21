// src/app/(extentions)/posts/_actions/document.query.ts

import prisma from "@utils/db/prisma";
import { Prisma } from "@core/utils/db/generated/client";
import { nanoid } from "nanoid";

export async function findDocumentBySlug(slug: string) {
  return prisma.document.findUnique({
    where: {
      slug: slug // 👈 문자열(NanoID)로 직접 조회
    },
    include: {
      user: {
        select: { id: true, nickName: true, email_address: true, profile: true }
      },
      category: {
        select: { id: true, title: true, desc: true, color: true, parentId: true }
      },
      module: {
        select: { id: true, mid: true, config: true }
      },
    }
  });
}

export async function findDocumentDeleteInfoBySlug(slug: string) {
  return prisma.document.findUnique({
    where: { slug },
    select: {
      id: true,
      userId: true,
      title: true,
    },
  });
}

export async function findDocument(id: number | string) {
  const numericId = Number(id);

  if (isNaN(numericId)) {
    console.error(`[findDocument] Invalid ID provided: ${id}`);
    return null;
  }

  return prisma.document.findUnique({
    where: {
      id: numericId // 👈 이제 무조건 숫자(Int)만 들어갑니다.
    },
    include: {
      user: {
        select: {
          id: true,
          nickName: true,
          email_address: true,
          profile: true
        }
      },
      category: {
        select: {
          id: true,
          title: true,
          desc: true,
          color: true,
          parentId: true
        }
      }
    }
  });
}

export async function findDocumentList(
  postsId: number,
  page: number,
  pageSize: number,
  categoryId?: number,
  ownerId?: number,
  status?: string
) {
  const whereCondition: Prisma.DocumentWhereInput = {
    moduleType: "posts",
    moduleId: postsId,
    ...(categoryId && categoryId !== 0 ? { categoryId } : {}),
    ...(ownerId !== undefined ? { userId: ownerId } : {}),
    ...(status === "open" ? { OR: [{ status: "open" }, { status: null }] } : {}),
    ...(status && status !== "open" ? { status } : {}),
  };

  const [items, totalCount] = await Promise.all([
    prisma.document.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug:true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isNotice: true,
        isSecrets: true,
        status: true,
        readCount: true,
        commentCount: true,
        voteCount: true,
        thumbnail: true,
        extraFieldData: true,
        category: { select: { id: true, title: true, parentId: true } },
        user: { select: { id: true, nickName: true, profile: true } },
        Comment: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            user: {
              select: { nickName: true, profile: true }
            }
          }
        }
      },
    }),
    prisma.document.count({ where: whereCondition }),
  ]);

  return { items, totalCount };
}

export async function countIssueStatuses(postsId: number, categoryId?: number, ownerId?: number) {
  const baseWhere: Prisma.DocumentWhereInput = {
    moduleType: "posts",
    moduleId: postsId,
    ...(categoryId && categoryId !== 0 ? { categoryId } : {}),
    ...(ownerId !== undefined ? { userId: ownerId } : {}),
  };

  const [open, closed] = await Promise.all([
    prisma.document.count({
      where: {
        ...baseWhere,
        OR: [{ status: "open" }, { status: null }],
      },
    }),
    prisma.document.count({
      where: {
        ...baseWhere,
        status: "closed",
      },
    }),
  ]);

  return { open, closed };
}

export async function insertDocument(data: any) {
  return prisma.document.create({
    data: data as Prisma.DocumentUncheckedCreateInput
  });
}

export async function updateDocument(id: number, data: any) {
  return prisma.document.update({
    where: { id },
    data: data as Prisma.DocumentUncheckedUpdateInput
  });
}

export async function deleteDocument(id: number) {
  return prisma.document.delete({ where: { id } });
}

/**
 * 권한 체크를 위한 최소 정보 조회
 */
export async function findDocumentForAuth(id: number) {
  return prisma.document.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
}


/**
 * 특정 시간 이내의 조회 로그 확인
 */
export async function findRecentViewLog(documentId: number, since: Date, userId?: number, ip?: string) {
  return prisma.documentViewLog.findFirst({
    where: {
      documentId,
      OR: [
        userId ? { userId } : {},
        (!userId && ip) ? { ipAddress: ip } : {},
      ],
      viewedAt: { gte: since },
    },
  });
}

/**
 * 조회수 증가 및 로그 생성 (트랜잭션)
 */
export async function incrementReadCountWithLog(documentId: number, userId?: number, ip?: string) {
  return prisma.$transaction([
    prisma.document.update({
      where: { id: documentId },
      data: { readCount: { increment: 1 } },
    }),
    prisma.documentViewLog.create({
      data: { documentId, userId, ipAddress: ip },
    }),
  ]);
}
