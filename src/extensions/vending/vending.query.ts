import prisma from "@/core/utils/db/prisma";
import type { VendingDashboard, VendingInventory, VendingMachine, VendingPeriod, VendingPurchase, VendingSale } from "./types";

type NumberLike = number | string | null;

const toNumber = (value: NumberLike) => Number(value || 0);
const toDateString = (value: Date | string) => new Date(value).toISOString().slice(0, 10);
const toMonthStart = (value: string) => `${value.slice(0, 7)}-01`;

let schemaPromise: Promise<void> | null = null;

export const ensureVendingSchemaQuery = async () => {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "VendingMachine" ("id" SERIAL PRIMARY KEY, "slug" VARCHAR(80) NOT NULL UNIQUE, "name" VARCHAR(120) NOT NULL, "description" TEXT, "supplyUnitCost" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT TRUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW())`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "VendingPeriod" ("id" SERIAL PRIMARY KEY, "machineId" INTEGER NOT NULL REFERENCES "VendingMachine"("id") ON DELETE CASCADE, "period" DATE NOT NULL, "status" VARCHAR(20) NOT NULL DEFAULT 'draft', "note" TEXT, "reportSnapshot" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), UNIQUE ("machineId", "period"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "VendingSale" ("id" SERIAL PRIMARY KEY, "periodId" INTEGER NOT NULL REFERENCES "VendingPeriod"("id") ON DELETE CASCADE, "soldAt" DATE NOT NULL, "approvedCount" INTEGER NOT NULL DEFAULT 0, "approvedAmount" INTEGER NOT NULL DEFAULT 0, "cancelledCount" INTEGER NOT NULL DEFAULT 0, "cancelledAmount" INTEGER NOT NULL DEFAULT 0, "netCount" INTEGER NOT NULL DEFAULT 0, "netAmount" INTEGER NOT NULL DEFAULT 0, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), UNIQUE ("periodId", "soldAt"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "VendingPurchase" ("id" SERIAL PRIMARY KEY, "periodId" INTEGER NOT NULL REFERENCES "VendingPeriod"("id") ON DELETE CASCADE, "purchasedAt" DATE NOT NULL, "category" VARCHAR(20) NOT NULL, "productName" VARCHAR(160) NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, "amount" INTEGER NOT NULL DEFAULT 0, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW())`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "VendingPurchase_periodId_idx" ON "VendingPurchase" ("periodId")`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "VendingInventory" ("id" SERIAL PRIMARY KEY, "periodId" INTEGER NOT NULL REFERENCES "VendingPeriod"("id") ON DELETE CASCADE, "productName" VARCHAR(160) NOT NULL, "category" VARCHAR(20) NOT NULL DEFAULT 'product', "closingQuantity" INTEGER NOT NULL DEFAULT 0, "unitCost" INTEGER NOT NULL DEFAULT 0, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(), UNIQUE ("periodId", "productName"))`);
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
};

export const ensureDefaultVendingMachineQuery = async () => {
  await ensureVendingSchemaQuery();
  await prisma.$executeRaw`INSERT INTO "VendingMachine" ("slug", "name", "description", "supplyUnitCost") VALUES ('coffee', '커피 자판기', '커피 자판기 운영관리', 0) ON CONFLICT ("slug") DO NOTHING`;
  await prisma.$executeRaw`INSERT INTO "VendingMachine" ("slug", "name", "description", "supplyUnitCost") VALUES ('ramen', '라면 자판기', '라면 및 소모품 운영관리', 385) ON CONFLICT ("slug") DO NOTHING`;
  await prisma.$executeRaw`INSERT INTO "VendingMachine" ("slug", "name", "description", "supplyUnitCost") VALUES ('multi', '멀티 자판기', '복합 상품 자판기 운영관리', 0) ON CONFLICT ("slug") DO NOTHING`;
};

export const listVendingMachinesQuery = async (includeInactive = false): Promise<VendingMachine[]> => {
  await ensureDefaultVendingMachineQuery();
  const rows = includeInactive
    ? await prisma.$queryRaw<any[]>`SELECT "id", "slug", "name", "description", "supplyUnitCost", "isActive" FROM "VendingMachine" ORDER BY "id" ASC`
    : await prisma.$queryRaw<any[]>`SELECT "id", "slug", "name", "description", "supplyUnitCost", "isActive" FROM "VendingMachine" WHERE "isActive" = TRUE ORDER BY "id" ASC`;
  return rows.map((row) => ({ ...row, supplyUnitCost: toNumber(row.supplyUnitCost) }));
};

export const getVendingMachineBySlugQuery = async (slug: string): Promise<VendingMachine | null> => {
  await ensureDefaultVendingMachineQuery();
  const rows = await prisma.$queryRaw<any[]>`SELECT "id", "slug", "name", "description", "supplyUnitCost", "isActive" FROM "VendingMachine" WHERE "slug" = ${slug} AND "isActive" = TRUE LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], supplyUnitCost: toNumber(rows[0].supplyUnitCost) } as VendingMachine;
};

export const getOrCreateVendingPeriodQuery = async (machineId: number, period: string): Promise<VendingPeriod> => {
  await ensureDefaultVendingMachineQuery();
  const rows = await prisma.$queryRaw<any[]>`INSERT INTO "VendingPeriod" ("machineId", "period") VALUES (${machineId}, ${toMonthStart(period)}::date) ON CONFLICT ("machineId", "period") DO UPDATE SET "updatedAt" = NOW() RETURNING "id", "machineId", "period", "status", "note", "reportSnapshot"`;
  const row = rows[0];
  return { ...row, period: toDateString(row.period), reportSnapshot: row.reportSnapshot || null };
};

export const getVendingDashboardQuery = async (machineId?: number, requestedPeriod?: string): Promise<VendingDashboard> => {
  const machines = await listVendingMachinesQuery();
  const machine = machines.find((item) => item.id === machineId) || machines[0];
  const period = await getOrCreateVendingPeriodQuery(machine.id, requestedPeriod || new Date().toISOString().slice(0, 7));
  const [saleRows, purchaseRows, inventoryRows] = await Promise.all([
    prisma.$queryRaw<any[]>`SELECT "id", "soldAt", "approvedCount", "approvedAmount", "cancelledCount", "cancelledAmount", "netCount", "netAmount", "note" FROM "VendingSale" WHERE "periodId" = ${period.id} ORDER BY "soldAt" ASC`,
    prisma.$queryRaw<any[]>`SELECT "id", "purchasedAt", "category", "productName", "quantity", "amount", "note" FROM "VendingPurchase" WHERE "periodId" = ${period.id} ORDER BY "purchasedAt" ASC, "id" ASC`,
    prisma.$queryRaw<any[]>`SELECT "id", "productName", "category", "closingQuantity", "unitCost", "note" FROM "VendingInventory" WHERE "periodId" = ${period.id} ORDER BY "productName" ASC`,
  ]);
  const sales: VendingSale[] = saleRows.map((row) => ({ ...row, soldAt: toDateString(row.soldAt), approvedCount: toNumber(row.approvedCount), approvedAmount: toNumber(row.approvedAmount), cancelledCount: toNumber(row.cancelledCount), cancelledAmount: toNumber(row.cancelledAmount), netCount: toNumber(row.netCount), netAmount: toNumber(row.netAmount) }));
  const purchases: VendingPurchase[] = purchaseRows.map((row) => ({ ...row, purchasedAt: toDateString(row.purchasedAt), quantity: toNumber(row.quantity), amount: toNumber(row.amount) }));
  const inventories: VendingInventory[] = inventoryRows.map((row) => ({ ...row, closingQuantity: toNumber(row.closingQuantity), unitCost: toNumber(row.unitCost) }));
  const salesCount = sales.reduce((sum, item) => sum + item.netCount, 0);
  const salesAmount = sales.reduce((sum, item) => sum + item.netAmount, 0);
  const productPurchaseAmount = purchases.filter((item) => item.category === "product").reduce((sum, item) => sum + item.amount, 0);
  const supplyPurchaseAmount = purchases.filter((item) => item.category === "supply").reduce((sum, item) => sum + item.amount, 0);
  const productPurchases = purchases.filter((item) => item.category === "product" && item.quantity > 0);
  const productInventory = inventories.filter((item) => item.category === "product" && item.closingQuantity > 0 && item.unitCost > 0);
  const productUnitCost = productPurchases.length ? Math.round(productPurchases.reduce((sum, item) => sum + item.amount, 0) / productPurchases.reduce((sum, item) => sum + item.quantity, 0)) : productInventory.length ? Math.round(productInventory.reduce((sum, item) => sum + item.closingQuantity * item.unitCost, 0) / productInventory.reduce((sum, item) => sum + item.closingQuantity, 0)) : 0;
  const inventoryQuantity = inventories.reduce((sum, item) => sum + item.closingQuantity, 0);
  const inventoryAmount = inventories.reduce((sum, item) => sum + item.closingQuantity * item.unitCost, 0);
  const materialCost = salesCount * (productUnitCost + machine.supplyUnitCost);
  const peakSale = sales.reduce<VendingSale | null>((peak, item) => !peak || item.netAmount > peak.netAmount ? item : peak, null);
  return { machines, machine, period, sales, purchases, inventories, metrics: { salesCount, salesAmount, activeDays: sales.length, averageDailyAmount: sales.length ? Math.round(salesAmount / sales.length) : 0, peakSale, productPurchaseAmount, supplyPurchaseAmount, purchaseAmount: productPurchaseAmount + supplyPurchaseAmount, inventoryQuantity, inventoryAmount, productUnitCost, materialCost, operatingAmount: salesAmount - materialCost } };
};

export const createVendingMachineQuery = async (input: { slug: string; name: string; description?: string; supplyUnitCost: number }) => {
  await ensureVendingSchemaQuery();
  const rows = await prisma.$queryRaw<any[]>`INSERT INTO "VendingMachine" ("slug", "name", "description", "supplyUnitCost") VALUES (${input.slug}, ${input.name}, ${input.description || null}, ${input.supplyUnitCost}) RETURNING "id", "slug", "name", "description", "supplyUnitCost", "isActive"`;
  return { ...rows[0], supplyUnitCost: toNumber(rows[0].supplyUnitCost) } as VendingMachine;
};

export const updateVendingMachineQuery = async (id: number, input: { name: string; description?: string; supplyUnitCost: number }) => {
  await ensureVendingSchemaQuery();
  const rows = await prisma.$queryRaw<any[]>`UPDATE "VendingMachine" SET "name" = ${input.name}, "description" = ${input.description || null}, "supplyUnitCost" = ${input.supplyUnitCost}, "updatedAt" = NOW() WHERE "id" = ${id} RETURNING "id", "slug", "name", "description", "supplyUnitCost", "isActive"`;
  if (!rows[0]) throw new Error("자판기를 찾을 수 없습니다.");
  return { ...rows[0], supplyUnitCost: toNumber(rows[0].supplyUnitCost) } as VendingMachine;
};

export const archiveVendingMachineQuery = async (id: number) => {
  await ensureVendingSchemaQuery();
  const result = await prisma.$executeRaw`UPDATE "VendingMachine" SET "isActive" = FALSE, "updatedAt" = NOW() WHERE "id" = ${id}`;
  if (!result) throw new Error("자판기를 찾을 수 없습니다.");
};

export const replaceVendingSalesQuery = async (periodId: number, sales: Omit<VendingSale, "id">[]) => {
  await ensureVendingSchemaQuery();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "VendingSale" WHERE "periodId" = ${periodId}`;
    for (const sale of sales) await tx.$executeRaw`INSERT INTO "VendingSale" ("periodId", "soldAt", "approvedCount", "approvedAmount", "cancelledCount", "cancelledAmount", "netCount", "netAmount", "note") VALUES (${periodId}, ${sale.soldAt}::date, ${sale.approvedCount}, ${sale.approvedAmount}, ${sale.cancelledCount}, ${sale.cancelledAmount}, ${sale.netCount}, ${sale.netAmount}, ${sale.note || null})`;
  });
};

export const replaceVendingPurchasesQuery = async (periodId: number, purchases: Omit<VendingPurchase, "id">[]) => {
  await ensureVendingSchemaQuery();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "VendingPurchase" WHERE "periodId" = ${periodId}`;
    for (const purchase of purchases) await tx.$executeRaw`INSERT INTO "VendingPurchase" ("periodId", "purchasedAt", "category", "productName", "quantity", "amount", "note") VALUES (${periodId}, ${purchase.purchasedAt}::date, ${purchase.category}, ${purchase.productName}, ${purchase.quantity}, ${purchase.amount}, ${purchase.note || null})`;
  });
};

export const createVendingPurchaseQuery = async (periodId: number, purchase: Omit<VendingPurchase, "id">) => {
  await ensureVendingSchemaQuery();
  await prisma.$executeRaw`INSERT INTO "VendingPurchase" ("periodId", "purchasedAt", "category", "productName", "quantity", "amount", "note") VALUES (${periodId}, ${purchase.purchasedAt}::date, ${purchase.category}, ${purchase.productName}, ${purchase.quantity}, ${purchase.amount}, ${purchase.note || null})`;
};

export const replaceVendingInventoriesQuery = async (periodId: number, inventories: Omit<VendingInventory, "id">[]) => {
  await ensureVendingSchemaQuery();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "VendingInventory" WHERE "periodId" = ${periodId}`;
    for (const inventory of inventories) await tx.$executeRaw`INSERT INTO "VendingInventory" ("periodId", "productName", "category", "closingQuantity", "unitCost", "note") VALUES (${periodId}, ${inventory.productName}, ${inventory.category}, ${inventory.closingQuantity}, ${inventory.unitCost}, ${inventory.note || null})`;
  });
};

export const saveVendingReportSnapshotQuery = async (periodId: number, snapshot: VendingPeriod["reportSnapshot"]) => {
  await prisma.$executeRaw`UPDATE "VendingPeriod" SET "reportSnapshot" = ${JSON.stringify(snapshot)}::jsonb, "status" = 'finalized', "updatedAt" = NOW() WHERE "id" = ${periodId}`;
};
