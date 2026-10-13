import prisma from "@utils/db/prisma";

type PushTokenInput = {
  userId: number;
  token: string;
  platform: string;
  deviceName?: string | null;
};

type PushTokenRow = {
  token: string;
};

export const upsertPushTokenQuery = async ({ userId, token, platform, deviceName }: PushTokenInput) => {
  return prisma.$executeRaw`
    INSERT INTO "PushToken" (
      "userId",
      "token",
      "platform",
      "deviceName",
      "isActive",
      "lastSeenAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${userId},
      ${token},
      ${platform},
      ${deviceName ?? null},
      true,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT ("token") DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "platform" = EXCLUDED."platform",
      "deviceName" = EXCLUDED."deviceName",
      "isActive" = true,
      "lastSeenAt" = NOW(),
      "updatedAt" = NOW()
  `;
};

export const disablePushTokenQuery = async (userId: number, token: string) => {
  return prisma.$executeRaw`
    UPDATE "PushToken"
    SET "isActive" = false, "updatedAt" = NOW()
    WHERE "userId" = ${userId} AND "token" = ${token}
  `;
};

export const disablePushTokensQuery = async (tokens: string[]) => {
  if (tokens.length === 0) return 0;

  return prisma.$executeRaw`
    UPDATE "PushToken"
    SET "isActive" = false, "updatedAt" = NOW()
    WHERE "token" = ANY(${tokens})
  `;
};

export const findActivePushTokensByUserQuery = async (userId: number) => {
  return prisma.$queryRaw<PushTokenRow[]>`
    SELECT "token"
    FROM "PushToken"
    WHERE "userId" = ${userId} AND "isActive" = true
    ORDER BY "lastSeenAt" DESC
  `;
};
