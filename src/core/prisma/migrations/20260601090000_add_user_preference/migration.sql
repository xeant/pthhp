CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'system',
    "notifyComments" BOOLEAN NOT NULL DEFAULT true,
    "notifyReplies" BOOLEAN NOT NULL DEFAULT true,
    "notifyAdmin" BOOLEAN NOT NULL DEFAULT true,
    "showProfileImage" BOOLEAN NOT NULL DEFAULT true,
    "showNickname" BOOLEAN NOT NULL DEFAULT true,
    "editorCompact" BOOLEAN NOT NULL DEFAULT true,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "fontScale" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");
CREATE INDEX "idx_user_preference_user" ON "UserPreference"("userId");

ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
