// src/app/(extentions)/posts/_actions/comment.query.ts
import prisma from "@utils/db/prisma";

// --- 조회(Find) ---
export async function findCommentById(id: number) {
  return prisma.comment.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } }
  });
}

export async function findDocumentCommentAccessInfo(documentId: number) {
  return prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      userId: true,
      slug: true,
      isSecrets: true,
      module: {
        select: {
          config: true,
        },
      },
    },
  });
}

export async function countRootComments(documentId: number) {
  return prisma.comment.count({ where: { documentId, parentId: null } });
}

export async function findRootComments(documentId: number, page: number, pageSize: number) {
  return prisma.comment.findMany({
    where: { documentId, parentId: null },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { user: { select: { id: true, nickName: true, profile: true } } },
  });
}

export async function findChildComments(documentId: number, rootIds: number[]) {
  return prisma.comment.findMany({
    where: { documentId, parentId: { in: rootIds } },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, nickName: true, profile: true } } },
  });
}

export async function insertComment(data: any) {
  const result = await prisma.comment.create({
    data,
    include: {
      user: { select: { id: true, nickName: true, profile: true } },
      document: {
        select: {
          id: true,
          slug:true,
          userId: true, // 게시글 작성자
          extraFieldData: true,
          module: { select: { mid: true } }
        }
      },
      // 🌟 1. 부모 댓글의 작성자 정보를 가져옵니다.
      parent: {
        select: { userId: true }
      }
    }
  });
  // 🌟 2. 알림 수신자(targetUserId) 결정 로직
  // 부모 댓글(parentId)이 있으면 부모 댓글 작성자에게, 없으면 게시글 작성자에게 보냅니다.
  const targetUserId = result.parentId ? result.parent?.userId : result.document.userId;

  const notificationTitle = result.parentId ? "💬 내 댓글에 답글이 달렸습니다" : "💬 새 댓글이 달렸습니다";
  const documentExtraFieldData = result.document.extraFieldData as Record<string, any> | null;
  const documentNotificationEnabled = documentExtraFieldData?.notificationEnabled !== false && documentExtraFieldData?.notificationEnabled !== "false";

  return {
    ...result,
    targetUserId,
    notificationTitle,
    notificationSubType: result.parentId ? "reply" : "comment",
    documentNotificationEnabled,
  };
}

export async function updateComment(id: number, data: any) {
  return prisma.comment.update({
    where: { id },
    data,
    include: { user: { select: { id: true, nickName: true, profile: true } } }
  });
}

export async function deleteComment(id: number) {
  return prisma.comment.delete({ where: { id } });
}

// --- 문서 카운트 관련 (원본의 increment/decrement 로직) ---
export async function incrementDocumentCommentCount(documentId: number) {
  return prisma.document.update({
    where: { id: documentId },
    data: { commentCount: { increment: 1 } },
  });
}

export async function decrementDocumentCommentCount(documentId: number) {
  return prisma.$transaction(async (tx) => {
    // 🌟 핵심: await를 붙여서 데이터를 실제로 받아와야 합니다.
    const doc = await tx.document.findUnique({
      where: { id: documentId },
      select: { commentCount: true },
    });

    // 이제 doc은 쿼리 객체가 아니라 { commentCount: number | null } | null 타입입니다.
    const currentCount = doc?.commentCount ?? 0;
    const newCount = Math.max(currentCount - 1, 0);

    return await tx.document.update({
      where: { id: documentId },
      data: { commentCount: newCount },
    });
  });
}

// 참여자 조회
export async function findParticipants(documentId: number) {
  return prisma.comment.findMany({
    where: { documentId, userId: { not: null }, isDeleted: false },
    distinct: ['userId'],
    select: { user: { select: { id: true, nickName: true, profile: true } } }
  });
}
