import prisma from "@utils/db/prisma";

const createdBefore = (cursor?: Date | null) => cursor ? { lt: cursor } : undefined;

export const countUserTimelineSummaryQuery = async (userId: number) => {
  const [documentCount, commentCount, attachmentCount, notificationCount, unreadNotificationCount] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.attachment.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    documentCount,
    commentCount,
    attachmentCount,
    notificationCount,
    unreadNotificationCount,
  };
};

export const findUserTimelineDocumentsQuery = async (userId: number, take: number, cursor?: Date | null) => {
  return prisma.document.findMany({
    where: { userId, createdAt: createdBefore(cursor) },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      thumbnail: true,
      readCount: true,
      commentCount: true,
      status: true,
      createdAt: true,
      module: {
        select: {
          mid: true,
          moduleName: true,
        },
      },
    },
  });
};

export const findUserTimelineCommentsQuery = async (userId: number, take: number, cursor?: Date | null) => {
  return prisma.comment.findMany({
    where: { userId, createdAt: createdBefore(cursor) },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      isDeleted: true,
      isSecret: true,
      depth: true,
      createdAt: true,
      document: {
        select: {
          slug: true,
          title: true,
          module: {
            select: {
              mid: true,
              moduleName: true,
            },
          },
        },
      },
    },
  });
};

export const findUserTimelineAttachmentsQuery = async (userId: number, take: number, cursor?: Date | null) => {
  return prisma.attachment.findMany({
    where: { userId, createdAt: createdBefore(cursor) },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      originalName: true,
      fileName: true,
      mimeType: true,
      size: true,
      path: true,
      createdAt: true,
    },
  });
};

export const findUserTimelineNotificationsQuery = async (userId: number, take: number, cursor?: Date | null) => {
  return prisma.notification.findMany({
    where: { userId, createdAt: createdBefore(cursor) },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      uuid: true,
      type: true,
      title: true,
      content: true,
      imageUrl: true,
      linkUrl: true,
      isRead: true,
      createdAt: true,
    },
  });
};
