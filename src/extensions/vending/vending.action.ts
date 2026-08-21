"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import {
  createVendingMachineQuery,
  createVendingPurchaseQuery,
  archiveVendingMachineQuery,
  getVendingMachineBySlugQuery,
  getOrCreateVendingPeriodQuery,
  getVendingDashboardQuery,
  listVendingMachinesQuery,
  replaceVendingInventoriesQuery,
  replaceVendingPurchasesQuery,
  replaceVendingSalesQuery,
  saveVendingReportSnapshotQuery,
  updateVendingMachineQuery,
} from "./vending.query";
import type { VendingDashboard, VendingInventory, VendingPurchase, VendingSale } from "./types";

export type VendingActionResult = { success: boolean; message: string; count?: number };
type SheetRow = Array<string | number | Date | null | undefined>;

const numberValue = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};

const textValue = (value: unknown) => String(value ?? "").trim();

const toDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const text = textValue(value).replace(/\./g, "-").replace(/\//g, "-");
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  return null;
};

const normalizeHeader = (value: unknown) => textValue(value).replace(/\s/g, "").toLowerCase();

const findColumn = (row: SheetRow, terms: string[]) => row.findIndex((cell) => terms.some((term) => normalizeHeader(cell).includes(term)));

const readRows = async (file: File) => {
  if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
    throw new Error("Excel(.xlsx, .xls) 파일만 업로드할 수 있습니다.");
  }
  if (file.size === 0 || file.size > 10 * 1024 * 1024) {
    throw new Error("업로드 파일은 10MB 이하만 허용됩니다.");
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("읽을 수 있는 시트가 없습니다.");
  return XLSX.utils.sheet_to_json<SheetRow>(sheet, { header: 1, defval: null, raw: true });
};

const parseSales = (rows: SheetRow[]): Omit<VendingSale, "id">[] => {
  const headerIndex = rows.findIndex((row) => findColumn(row, ["거래일", "거래일자", "판매일", "일자"]) >= 0);
  if (headerIndex < 0) throw new Error("매출 파일에서 거래일자 열을 찾지 못했습니다.");
  const mainHeader = rows[headerIndex];
  const subHeader = rows[headerIndex + 1] || [];
  const dateColumn = findColumn(mainHeader, ["거래일", "거래일자", "판매일", "일자"]);
  const netStart = findColumn(mainHeader, ["순매출", "순매출액", "net"]);
  const approvedStart = findColumn(mainHeader, ["승인", "결제"]);
  const cancelledStart = findColumn(mainHeader, ["취소"]);
  const countAt = (start: number) => start >= 0 ? start + Math.max(0, findColumn(subHeader.slice(start), ["건수", "건"])) : -1;
  const amountAt = (start: number) => start >= 0 ? start + Math.max(0, findColumn(subHeader.slice(start), ["금액", "금"])) : -1;
  const netCountColumn = countAt(netStart) >= 0 ? countAt(netStart) : Math.max(0, mainHeader.length - 3);
  const netAmountColumn = amountAt(netStart) >= 0 ? amountAt(netStart) : Math.max(0, mainHeader.length - 2);
  const approvedCountColumn = countAt(approvedStart);
  const approvedAmountColumn = amountAt(approvedStart);
  const cancelledCountColumn = countAt(cancelledStart);
  const cancelledAmountColumn = amountAt(cancelledStart);
  return rows.slice(headerIndex + 2).flatMap((row) => {
    const soldAt = toDate(row[dateColumn]);
    if (!soldAt) return [];
    const netCount = numberValue(row[netCountColumn]);
    const netAmount = numberValue(row[netAmountColumn]);
    if (!netCount && !netAmount) return [];
    return [{
      soldAt,
      approvedCount: approvedCountColumn >= 0 ? numberValue(row[approvedCountColumn]) : netCount,
      approvedAmount: approvedAmountColumn >= 0 ? numberValue(row[approvedAmountColumn]) : netAmount,
      cancelledCount: cancelledCountColumn >= 0 ? numberValue(row[cancelledCountColumn]) : 0,
      cancelledAmount: cancelledAmountColumn >= 0 ? numberValue(row[cancelledAmountColumn]) : 0,
      netCount,
      netAmount,
      note: null,
    }];
  });
};

const parsePurchases = (rows: SheetRow[]): Omit<VendingPurchase, "id">[] => {
  const headerIndex = rows.findIndex((row) => findColumn(row, ["날짜", "매입일", "입고일"]) >= 0 && findColumn(row, ["품목", "상품"]) >= 0);
  if (headerIndex < 0) throw new Error("매입 파일에서 날짜와 품목 열을 찾지 못했습니다.");
  const header = rows[headerIndex];
  const dateColumn = findColumn(header, ["날짜", "매입일", "입고일"]);
  const productColumn = findColumn(header, ["품목명", "품목", "상품"]);
  const quantityColumn = findColumn(header, ["입고", "수량", "개수"]);
  const amountColumn = findColumn(header, ["금액", "매입액", "합계"]);
  const noteColumn = findColumn(header, ["비고", "메모"]);
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const purchasedAt = toDate(row[dateColumn]);
    const productName = textValue(row[productColumn]);
    if (!purchasedAt || !productName) return [];
    const category = /용기|젓가락|종이컵|컵|소모품/i.test(productName) ? "supply" : "product";
    return [{
      purchasedAt,
      productName,
      category,
      quantity: quantityColumn >= 0 ? numberValue(row[quantityColumn]) : 0,
      amount: amountColumn >= 0 ? numberValue(row[amountColumn]) : 0,
      note: noteColumn >= 0 ? textValue(row[noteColumn]) || null : null,
    }];
  });
};

const requireVendingAdmin = async () => {
  const user = await getAuthenticatedUser();
  if (!user.isAdmin) throw new Error("관리자 권한이 필요합니다.");
  return user;
};

const readPeriod = (formData: FormData) => {
  const machineId = numberValue(formData.get("machineId"));
  const period = textValue(formData.get("period"));
  if (!machineId || !/^\d{4}-\d{2}$/.test(period)) throw new Error("자판기와 대상 월을 확인해주세요.");
  return { machineId, period };
};

export const createVendingMachineAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const name = textValue(formData.get("name"));
    const rawSlug = textValue(formData.get("slug")) || name;
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name || !slug) return { success: false, message: "자판기 이름을 입력해주세요." };
    await createVendingMachineQuery({ name, slug, description: textValue(formData.get("description")), supplyUnitCost: numberValue(formData.get("supplyUnitCost")) });
    revalidatePath("/vending");
    return { success: true, message: "자판기를 추가했습니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "자판기 추가에 실패했습니다." };
  }
};

export const updateVendingMachineAdminAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const id = numberValue(formData.get("id"));
    const name = textValue(formData.get("name"));
    if (!id || !name) return { success: false, message: "자판기 이름을 입력해주세요." };
    await updateVendingMachineQuery(id, {
      name,
      description: textValue(formData.get("description")),
      supplyUnitCost: numberValue(formData.get("supplyUnitCost")),
    });
    revalidatePath("/vending");
    return { success: true, message: "자판기 정보를 수정했습니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "자판기 수정에 실패했습니다." };
  }
};

export const archiveVendingMachineAdminAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const id = numberValue(formData.get("id"));
    if (!id) return { success: false, message: "삭제할 자판기를 확인해주세요." };
    await archiveVendingMachineQuery(id);
    revalidatePath("/vending");
    return { success: true, message: "자판기를 삭제했습니다. 기존 운영 자료는 보존됩니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "자판기 삭제에 실패했습니다." };
  }
};

export const getVendingMachinesAdminAction = async () => {
  await requireVendingAdmin();
  return listVendingMachinesQuery(true);
};

export const getVendingDashboardAction = async (machineSlug: string, period?: string): Promise<VendingDashboard | null> => {
  await requireVendingAdmin();
  const machine = await getVendingMachineBySlugQuery(machineSlug);
  if (!machine) return null;
  return getVendingDashboardQuery(machine.id, period);
};

export const importVendingSpreadsheetAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const { machineId, period } = readPeriod(formData);
    const kind = textValue(formData.get("kind"));
    const file = formData.get("file");
    if (!(file instanceof File)) return { success: false, message: "업로드할 Excel 파일을 선택해주세요." };
    const target = await getOrCreateVendingPeriodQuery(machineId, period);
    const rows = await readRows(file);
    if (kind === "sales") {
      const sales = parseSales(rows).filter((sale) => sale.soldAt.startsWith(`${period}-`));
      if (!sales.length) return { success: false, message: "선택한 월의 매출 행을 찾지 못했습니다. 자판기와 월을 확인해 주세요." };
      await replaceVendingSalesQuery(target.id, sales);
      revalidatePath("/vending");
      return { success: true, count: sales.length, message: `${sales.length}일의 매출자료를 저장했습니다.` };
    }
    if (kind === "purchase") {
      const purchases = parsePurchases(rows).filter((purchase) => purchase.purchasedAt.startsWith(`${period}-`));
      if (!purchases.length) return { success: false, message: "선택한 월의 매입 행을 찾지 못했습니다. 자판기와 월을 확인해 주세요." };
      await replaceVendingPurchasesQuery(target.id, purchases);
      revalidatePath("/vending");
      return { success: true, count: purchases.length, message: `${purchases.length}건의 매입자료를 저장했습니다.` };
    }
    return { success: false, message: "알 수 없는 업로드 유형입니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "파일 처리 중 오류가 발생했습니다." };
  }
};

export const createVendingPurchaseAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const { machineId, period } = readPeriod(formData);
    const purchasedAt = toDate(formData.get("purchasedAt"));
    const productName = textValue(formData.get("productName"));
    const quantity = numberValue(formData.get("quantity"));
    const amount = numberValue(formData.get("amount"));
    if (!purchasedAt || !purchasedAt.startsWith(`${period}-`) || !productName || quantity <= 0 || amount < 0) {
      return { success: false, message: "일자, 품목, 수량, 금액을 확인해주세요." };
    }
    const target = await getOrCreateVendingPeriodQuery(machineId, period);
    await createVendingPurchaseQuery(target.id, {
      purchasedAt,
      productName,
      category: textValue(formData.get("category")) === "supply" ? "supply" : "product",
      quantity,
      amount,
      note: textValue(formData.get("note")) || null,
    });
    revalidatePath("/vending");
    return { success: true, message: "매입 건을 저장했습니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "매입 저장에 실패했습니다." };
  }
};

export const saveVendingInventoryAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const { machineId, period } = readPeriod(formData);
    const entries = JSON.parse(textValue(formData.get("entries"))) as Omit<VendingInventory, "id">[];
    const inventories = entries.filter((item) => item.productName?.trim()).map((item) => ({
      productName: item.productName.trim(),
      category: item.category === "supply" ? "supply" as const : "product" as const,
      closingQuantity: Math.max(0, numberValue(item.closingQuantity)),
      unitCost: Math.max(0, numberValue(item.unitCost)),
      note: item.note?.trim() || null,
    }));
    const target = await getOrCreateVendingPeriodQuery(machineId, period);
    await replaceVendingInventoriesQuery(target.id, inventories);
    revalidatePath("/vending");
    return { success: true, count: inventories.length, message: "월말 재고를 저장했습니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "재고 저장에 실패했습니다." };
  }
};

export const finalizeVendingReportAction = async (formData: FormData): Promise<VendingActionResult> => {
  try {
    await requireVendingAdmin();
    const { machineId, period } = readPeriod(formData);
    const dashboard = await getVendingDashboardQuery(machineId, period);
    await saveVendingReportSnapshotQuery(dashboard.period.id, {
      generatedAt: new Date().toISOString(),
      salesAmount: dashboard.metrics.salesAmount,
      salesCount: dashboard.metrics.salesCount,
      materialCost: dashboard.metrics.materialCost,
      operatingAmount: dashboard.metrics.operatingAmount,
      inventoryAmount: dashboard.metrics.inventoryAmount,
    });
    revalidatePath("/vending");
    return { success: true, message: "월간 운영보고서를 확정 저장했습니다." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "보고서 저장에 실패했습니다." };
  }
};
