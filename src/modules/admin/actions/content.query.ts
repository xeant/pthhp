import prisma from "@utils/db/prisma";

export const findRecentDocumentsAdminQuery = async (page: number, pageSize: number) => {
  const where = {
    moduleType: "posts",
  };

  const [items, totalCount] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        status: true,
        published: true,
        isNotice: true,
        isSecrets: true,
        readCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        module: {
          select: {
            id: true,
            mid: true,
            moduleName: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            nickName: true,
            accountId: true,
            profile: {
              select: {
                profileImage: true,
              },
            },
          },
        },
      },
    }),
    prisma.document.count({ where }),
  ]);

  return { items, totalCount };
};

export const findRecentCommentsAdminQuery = async (page: number, pageSize: number) => {
  const [items, totalCount] = await Promise.all([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        uuid: true,
        slug: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
        isSecret: true,
        status: true,
        depth: true,
        parentId: true,
        user: {
          select: {
            id: true,
            nickName: true,
            accountId: true,
            profile: {
              select: {
                profileImage: true,
              },
            },
          },
        },
        document: {
          select: {
            id: true,
            slug: true,
            title: true,
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
    }),
    prisma.comment.count(),
  ]);

  return { items, totalCount };
};

export const findRecentAttachmentsAdminQuery = async (page: number, pageSize: number) => {
  const [items, totalCount] = await Promise.all([
    prisma.attachment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        uuid: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        size: true,
        path: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            nickName: true,
            accountId: true,
            profile: {
              select: {
                profileImage: true,
              },
            },
          },
        },
      },
    }),
    prisma.attachment.count(),
  ]);

  return { items, totalCount };
};

export const findDocumentDeleteTargetAdminQuery = async (id: number) => {
  return prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      userId: true,
      module: {
        select: {
          mid: true,
          moduleName: true,
        },
      },
    },
  });
};

export const findCommentDeleteTargetAdminQuery = async (id: number) => {
  return prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      userId: true,
      documentId: true,
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

export const findAttachmentDeleteTargetAdminQuery = async (id: number) => {
  return prisma.attachment.findUnique({
    where: { id },
    select: {
      id: true,
      originalName: true,
      fileName: true,
      path: true,
      userId: true,
      mimeType: true,
    },
  });
};
