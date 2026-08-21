require("dotenv/config");

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Client } = require("pg");

const getEnv = (key, fallback = "") => process.env[key] || fallback;

const slugify = (value, fallback) => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
};

const settings = [
  {
    key: "site.appName",
    value: getEnv("APP_NAME", "plextype"),
    group: "site",
    label: "APP_NAME",
    description: "사이트 영문 시스템 이름입니다.",
    isPublic: true,
  },
  {
    key: "site.projectName",
    value: getEnv("PROJECT_NAME", getEnv("APP_NAME", "plextype")),
    group: "site",
    label: "PROJECT_NAME",
    description: "프로젝트 내부 식별 이름입니다.",
    isPublic: false,
  },
  {
    key: "site.projectTitle",
    value: getEnv("PROJECT_TITLE", getEnv("APP_TITLE", "plextype")),
    group: "site",
    label: "PROJECT_TITLE",
    description: "사용자 화면에 노출되는 사이트 표시명입니다.",
    isPublic: true,
  },
  {
    key: "site.url",
    value: getEnv("NEXT_PUBLIC_DEFAULT_URL", "http://localhost:3000"),
    group: "site",
    label: "사이트 URL",
    description: "사이트 대표 URL입니다.",
    isPublic: true,
  },
  {
    key: "site.apiBaseUrl",
    value: getEnv("NEXT_PUBLIC_API_BASE_URL", ""),
    group: "site",
    label: "API Base URL",
    description: "외부에서 사용할 API 기본 URL입니다.",
    isPublic: true,
  },
];

const runAdditionalSeed = async (client, seedPath) => {
  if (!fs.existsSync(seedPath)) return;

  const seedModule = require(seedPath);
  const seedFn = seedModule.seed || seedModule.default || seedModule;

  if (typeof seedFn !== "function") {
    throw new Error(`${path.relative(process.cwd(), seedPath)} must export a seed function.`);
  }

  await seedFn({ client, bcrypt });
};

const runExtensionSeed = async (client) => {
  await runAdditionalSeed(client, path.join(process.cwd(), "src", "extensions", "prisma", "seed.js"));
};

const runProjectSeed = async (client) => {
  await runAdditionalSeed(client, path.join(process.cwd(), "src", "project", "prisma", "seed.js"));
};

async function main() {
  const databaseUrl = getEnv("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const client = new Client({ connectionString: databaseUrl });
  const adminId = getEnv("ADMIN_ACCOUNT_ID", "admin");
  const adminPw = getEnv("ADMIN_PASSWORD", "admin1234");
  const adminEmail = getEnv("ADMIN_EMAIL", "admin@test.com");
  const adminNickname = getEnv("ADMIN_NICKNAME", "운영자");
  const adminSlug = slugify(adminId, "admin");
  const hashedAdminPassword = await bcrypt.hash(adminPw, 10);

  console.log("Seeding database...");

  await client.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      INSERT INTO "UserGroup" ("groupName", "groupTitle", "groupDesc", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT ("groupName")
      DO UPDATE SET
        "groupTitle" = EXCLUDED."groupTitle",
        "groupDesc" = EXCLUDED."groupDesc",
        "updatedAt" = NOW()
    `, ["regular", "정회원", "정회원입니다."]);

    await client.query(`
      INSERT INTO "User" (
        "slug",
        "accountId",
        "email_address",
        "nickName",
        "password",
        "isAdmin",
        "isManagers",
        "status",
        "createdAt",
        "updateAt"
      )
      VALUES ($1, $2, $3, $4, $5, TRUE, TRUE, 'active', NOW(), NOW())
      ON CONFLICT ("accountId")
      DO UPDATE SET
        "isAdmin" = TRUE,
        "isManagers" = TRUE,
        "status" = COALESCE("User"."status", 'active'),
        "updateAt" = NOW()
    `, [adminSlug, adminId, adminEmail, adminNickname, hashedAdminPassword]);

    await client.query(`
      INSERT INTO "Modules" ("mid", "moduleName", "moduleDesc", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("moduleName")
      DO UPDATE SET
        "mid" = EXCLUDED."mid",
        "moduleDesc" = EXCLUDED."moduleDesc",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    `, ["notice", "notice", "공지사항 게시판입니다.", "active"]);

    for (const item of settings) {
      await client.query(`
        INSERT INTO "AppSetting" (
          "key",
          "value",
          "group",
          "label",
          "description",
          "isPublic",
          "status",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
        ON CONFLICT ("key") DO NOTHING
      `, [
        item.key,
        item.value,
        item.group,
        item.label,
        item.description,
        item.isPublic,
      ]);
    }

    await runExtensionSeed(client);
    await runProjectSeed(client);

    await client.query("COMMIT");
    console.log(`Seed completed. Admin ID: ${adminId}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
