import prisma from "@utils/db/prisma";

export type WebPushSubscriptionInput = {
  userId: number;
  endpoint: string;
  p256dh?: string | null;
  auth?: string | null;
  userAgent?: string | null;
};

export type WebPushSubscriptionRow = {
  id: number;
  userId: number;
  endpoint: string;
  p256dh: string | null;
  auth: string | null;
  userAgent?: string | null;
  isActive?: boolean;
  failureCount?: number;
  lastSeenAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export const upsertWebPushSubscriptionQuery = async ({
  userId,
  endpoint,
  p256dh,
  auth,
  userAgent,
}: WebPushSubscriptionInput) => {
  return prisma.$executeRaw`
    INSERT INTO "WebPushSubscription" (
      "userId",
      "endpoint",
      "p256dh",
      "auth",
      "userAgent",
      "isActive",
      "failureCount",
      "lastSeenAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${userId},
      ${endpoint},
      ${p256dh ?? null},
      ${auth ?? null},
      ${userAgent ?? null},
      true,
      0,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT ("endpoint") DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "p256dh" = EXCLUDED."p256dh",
      "auth" = EXCLUDED."auth",
      "userAgent" = EXCLUDED."userAgent",
      "isActive" = true,
      "failureCount" = 0,
      "lastSeenAt" = NOW(),
      "updatedAt" = NOW()
  `;
};

export const deleteWebPushSubscriptionQuery = async (userId: number, endpoint: string) => {
  return prisma.$executeRaw`
    DELETE FROM "WebPushSubscription"
    WHERE "userId" = ${userId} AND "endpoint" = ${endpoint}
  `;
};

export const deleteWebPushSubscriptionByIdQuery = async (userId: number, id: number) => {
  return prisma.$executeRaw`
    DELETE FROM "WebPushSubscription"
    WHERE "userId" = ${userId} AND "id" = ${id}
  `;
};

export const deleteOtherWebPushSubscriptionsQuery = async (userId: number, currentEndpoint: string) => {
  return prisma.$executeRaw`
    DELETE FROM "WebPushSubscription"
    WHERE "userId" = ${userId} AND "endpoint" <> ${currentEndpoint}
  `;
};

export const disableWebPushSubscriptionsQuery = async (endpoints: string[]) => {
  if (endpoints.length === 0) return 0;

  return prisma.$executeRaw`
    UPDATE "WebPushSubscription"
    SET "isActive" = false, "failureCount" = "failureCount" + 1, "updatedAt" = NOW()
    WHERE "endpoint" = ANY(${endpoints})
  `;
};

export const findActiveWebPushSubscriptionsByUserQuery = async (userId: number) => {
  return prisma.$queryRaw<WebPushSubscriptionRow[]>`
    SELECT "id", "userId", "endpoint", "p256dh", "auth"
    FROM "WebPushSubscription"
    WHERE "userId" = ${userId} AND "isActive" = true
    ORDER BY "lastSeenAt" DESC
  `;
};

export const findWebPushSubscriptionsByUserQuery = async (userId: number) => {
  return prisma.$queryRaw<WebPushSubscriptionRow[]>`
    SELECT
      "id",
      "userId",
      "endpoint",
      "p256dh",
      "auth",
      "userAgent",
      "isActive",
      "failureCount",
      "lastSeenAt",
      "createdAt",
      "updatedAt"
    FROM "WebPushSubscription"
    WHERE "userId" = ${userId}
    ORDER BY "isActive" DESC, "lastSeenAt" DESC, "id" DESC
  `;
};

export const countActiveWebPushSubscriptionsQuery = async (userId?: number) => {
  const rows = userId
    ? await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS "count"
        FROM "WebPushSubscription"
        WHERE "userId" = ${userId} AND "isActive" = true
      `
    : await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS "count"
        FROM "WebPushSubscription"
        WHERE "isActive" = true
      `;

  return Number(rows[0]?.count || 0);
};
