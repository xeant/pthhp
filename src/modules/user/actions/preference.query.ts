import prisma from "@utils/db/prisma";

export type UserThemePreference = "system" | "light" | "dark";
export type UserFontScalePreference = "small" | "normal" | "large";

export type UserPreferenceData = {
  theme: UserThemePreference;
  notifyComments: boolean;
  notifyReplies: boolean;
  notifyAdmin: boolean;
  reduceMotion: boolean;
  fontScale: UserFontScalePreference;
};

export const DEFAULT_USER_PREFERENCE: UserPreferenceData = {
  theme: "system",
  notifyComments: true,
  notifyReplies: true,
  notifyAdmin: true,
  reduceMotion: false,
  fontScale: "normal",
};

type UserPreferenceRow = UserPreferenceData & {
  userId: number;
};

let userPreferenceTableEnsured = false;

const ensureUserPreferenceTable = async () => {
  if (userPreferenceTableEnsured) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserPreference" (
      "id" SERIAL NOT NULL,
      "userId" INTEGER NOT NULL,
      "theme" VARCHAR(20) NOT NULL DEFAULT 'system',
      "notifyComments" BOOLEAN NOT NULL DEFAULT true,
      "notifyReplies" BOOLEAN NOT NULL DEFAULT true,
      "notifyAdmin" BOOLEAN NOT NULL DEFAULT true,
      "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
      "fontScale" VARCHAR(20) NOT NULL DEFAULT 'normal',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "UserPreference_userId_key" ON "UserPreference"("userId");
    CREATE INDEX IF NOT EXISTS "idx_user_preference_user" ON "UserPreference"("userId");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'UserPreference_userId_fkey'
      ) THEN
        ALTER TABLE "UserPreference"
        ADD CONSTRAINT "UserPreference_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);

  userPreferenceTableEnsured = true;
};

const normalizePreference = (row?: Partial<UserPreferenceRow> | null): UserPreferenceData => ({
  ...DEFAULT_USER_PREFERENCE,
  ...row,
  theme: row?.theme === "light" || row?.theme === "dark" ? row.theme : "system",
  fontScale: row?.fontScale === "small" || row?.fontScale === "large" ? row.fontScale : "normal",
});

export async function findUserPreferenceByUserId(userId: number): Promise<UserPreferenceData> {
  try {
    await ensureUserPreferenceTable();
    const rows = await prisma.$queryRaw<UserPreferenceRow[]>`
      SELECT
        "theme",
        "notifyComments",
        "notifyReplies",
        "notifyAdmin",
        "reduceMotion",
        "fontScale"
      FROM "UserPreference"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;

    return normalizePreference(rows[0]);
  } catch {
    return DEFAULT_USER_PREFERENCE;
  }
}

export async function upsertUserPreference(userId: number, data: UserPreferenceData): Promise<UserPreferenceData> {
  await ensureUserPreferenceTable();

  const rows = await prisma.$queryRaw<UserPreferenceRow[]>`
    INSERT INTO "UserPreference" (
      "userId",
      "theme",
      "notifyComments",
      "notifyReplies",
      "notifyAdmin",
      "reduceMotion",
      "fontScale",
      "updatedAt"
    )
    VALUES (
      ${userId},
      ${data.theme},
      ${data.notifyComments},
      ${data.notifyReplies},
      ${data.notifyAdmin},
      ${data.reduceMotion},
      ${data.fontScale},
      NOW()
    )
    ON CONFLICT ("userId")
    DO UPDATE SET
      "theme" = EXCLUDED."theme",
      "notifyComments" = EXCLUDED."notifyComments",
      "notifyReplies" = EXCLUDED."notifyReplies",
      "notifyAdmin" = EXCLUDED."notifyAdmin",
      "reduceMotion" = EXCLUDED."reduceMotion",
      "fontScale" = EXCLUDED."fontScale",
      "updatedAt" = NOW()
    RETURNING
      "theme",
      "notifyComments",
      "notifyReplies",
      "notifyAdmin",
      "reduceMotion",
      "fontScale"
  `;

  return normalizePreference(rows[0]);
}
