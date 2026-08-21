import prisma from "@utils/db/prisma";

/** 🌟 [INSERT] */
export const insertNotification = async (data: any) => {
  return prisma.notification.create({
    data: {
      // 1. 수신자 ID (trigger.json에서 매핑된 userId)
      userId: Number(data.userId),

      // 2. 알림 타입 및 내용
      type: data.type || 'info',
      title: data.title || data.notificationTitle, // 넘어오는 키값에 맞춰 유연하게
      content: data.content,
      imageUrl: data.imageUrl || null,
      linkUrl: data.linkUrl || `/posts/notice/${data.documentId}`,

      // 3. 메타데이터 (JSON 형태만 쏙)
      // data.metadata가 있다면 그것만 넣고, 없으면 빈 객체
      metadata: data.metadata || {},

      // 4. 상태값
      isRead: false,
    },
  });
};

/** 🌟 [FIND] */
export const findUnreadCount = async (userId: number) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

export const findUnreadList = async (userId: number, limit = 20) => {
  return prisma.notification.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const findHistoryPage = async (userId: number, skip: number, take: number) => {
  return prisma.notification.findMany({
    where: {
      userId: Number(userId) // 여기서 한 번 더 숫자로 강제 변환
    },
    orderBy: { createdAt: "desc" },
    skip: skip || 0,
    take: take || 20,
  });
};

/** 🌟 [UPDATE] */
export const updateReadStatus = async (uuid: string, userId: number) => {
  // 💡 보안 강화: update 대신 updateMany를 사용하면 unique하지 않은 조건(userId)을 섞을 수 있습니다.
  return prisma.notification.updateMany({
    where: {
      uuid,
      userId // 반드시 내 알림이어야만 업데이트 가능!
    },
    data: {
      isRead: true,
      readAt: new Date()
    },
  });
};

export const updateAllToRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

/** 🌟 [DELETE] */
export const deleteByUuid = async (uuid: string, userId: number) => {
  // 💡 보안 강화: 내가 아닌 다른 사람이 UUID를 때려 맞춰서 지우는 것을 방지합니다.
  return prisma.notification.deleteMany({
    where: {
      uuid,
      userId
    },
  });
};

export const deleteAllByUserId = async (userId: number) => {
  return prisma.notification.deleteMany({
    where: {
      userId: Number(userId) // 보안상 userId 필수!
    },
  });
};
