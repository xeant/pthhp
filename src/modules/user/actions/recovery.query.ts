import prisma from "@utils/db/prisma";

export type RecoveryUser = {
  id: number;
  accountId: string;
  email_address: string;
  nickName: string;
  status: string | null;
};

export type PasswordResetTokenRecord = {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};

const ensurePasswordResetTokenTable = async () => {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "tokenHash" TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_password_reset_token_user"
    ON "PasswordResetToken"("userId")
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_password_reset_token_expires"
    ON "PasswordResetToken"("expiresAt")
  `;
};

export const findRecoveryUserByEmail = async (email: string) => {
  const rows = await prisma.$queryRaw<RecoveryUser[]>`
    SELECT "id", "accountId", "email_address", "nickName", "status"
    FROM "User"
    WHERE LOWER("email_address") = LOWER(${email})
    LIMIT 1
  `;

  return rows[0] || null;
};

export const findRecoveryUserByAccountOrEmail = async (value: string) => {
  const rows = await prisma.$queryRaw<RecoveryUser[]>`
    SELECT "id", "accountId", "email_address", "nickName", "status"
    FROM "User"
    WHERE LOWER("accountId") = LOWER(${value})
       OR LOWER("email_address") = LOWER(${value})
    LIMIT 1
  `;

  return rows[0] || null;
};

export const createPasswordResetToken = async (userId: number, tokenHash: string, expiresAt: Date) => {
  await ensurePasswordResetTokenTable();

  await prisma.$executeRaw`
    UPDATE "PasswordResetToken"
    SET "usedAt" = NOW()
    WHERE "userId" = ${userId}
      AND "usedAt" IS NULL
  `;

  await prisma.$executeRaw`
    INSERT INTO "PasswordResetToken" ("userId", "tokenHash", "expiresAt")
    VALUES (${userId}, ${tokenHash}, ${expiresAt})
  `;
};

export const findValidPasswordResetToken = async (tokenHash: string) => {
  await ensurePasswordResetTokenTable();

  const rows = await prisma.$queryRaw<PasswordResetTokenRecord[]>`
    SELECT "id", "userId", "tokenHash", "expiresAt", "usedAt"
    FROM "PasswordResetToken"
    WHERE "tokenHash" = ${tokenHash}
      AND "usedAt" IS NULL
      AND "expiresAt" > NOW()
    LIMIT 1
  `;

  return rows[0] || null;
};

export const markPasswordResetTokenUsed = async (id: number) => {
  await prisma.$executeRaw`
    UPDATE "PasswordResetToken"
    SET "usedAt" = NOW()
    WHERE "id" = ${id}
  `;
};

export const updateUserPasswordAndClearSession = async (userId: number, passwordHash: string) => {
  await prisma.$executeRaw`
    UPDATE "User"
    SET "password" = ${passwordHash},
        "refreshToken" = NULL,
        "updateAt" = NOW()
    WHERE "id" = ${userId}
  `;
};

export const findPublicSiteUrl = async () => {
  const rows = await prisma.$queryRaw<{ value: string | null }[]>`
    SELECT "value"
    FROM "AppSetting"
    WHERE "key" = 'site.url'
    LIMIT 1
  `;

  return rows[0]?.value || process.env.NEXT_PUBLIC_DEFAULT_URL || "http://localhost:3000";
};

export const deleteExpiredPasswordResetTokens = async () => {
  await ensurePasswordResetTokenTable();

  await prisma.$executeRaw`
    DELETE FROM "PasswordResetToken"
    WHERE "expiresAt" < NOW() - INTERVAL '1 day'
       OR "usedAt" IS NOT NULL
  `;
};
