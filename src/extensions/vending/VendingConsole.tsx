"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { FileText, FileUp, LayoutDashboard, PackagePlus, Printer, ReceiptText, Save, ShoppingCart } from "lucide-react";
import {
  createVendingPurchaseAction,
  finalizeVendingReportAction,
  importVendingSpreadsheetAction,
  saveVendingInventoryAction,
  type VendingActionResult,
} from "./vending.action";
import type { VendingDashboard, VendingInventory } from "./types";

type VendingView = "dashboard" | "purchases" | "sales" | "report";
type InventoryDraft = Omit<VendingInventory, "id">;

const won = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;
const count = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}건`;
const monthText = (period: string) => `${period.slice(0, 4)}년 ${Number(period.slice(5, 7))}월`;

const toDraft = (item: VendingInventory): InventoryDraft => ({
  productName: item.productName,
  category: item.category,
  closingQuantity: item.closingQuantity,
  unitCost: item.unitCost,
  note: item.note,
});

const tabs: Array<{ key: VendingView; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { key: "purchases", label: "매입내역", icon: ShoppingCart },
  { key: "sales", label: "매출내역", icon: ReceiptText },
  { key: "report", label: "월간보고서", icon: FileText },
];

export default function VendingConsole({ dashboard, view }: { dashboard: VendingDashboard; view: VendingView }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [inventory, setInventory] = useState<InventoryDraft[]>(dashboard.inventories.map(toDraft));
  const periodValue = dashboard.period.period.slice(0, 7);
  const basePath = `/vending/${dashboard.machine.slug}`;

  useEffect(() => setInventory(dashboard.inventories.map(toDraft)), [dashboard.inventories]);

  const submit = (formData: FormData, action: (data: FormData) => Promise<VendingActionResult>) => {
    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.message);
      if (result.success) window.location.reload();
    });
  };

  const changePeriod = (period: string) => {
    window.location.href = `${basePath}/${view}?period=${period}`;
  };

  const updateInventory = (index: number, key: keyof InventoryDraft, value: string) => {
    setInventory((items) => items.map((item, itemIndex) => itemIndex === index ? {
      ...item,
      [key]: key === "closingQuantity" || key === "unitCost" ? Number(value || 0) : value,
    } : item));
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      <div className="border-b border-gray-200 pb-6 dark:border-dark-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">자판기 운영</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">{dashboard.machine.name}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">{monthText(periodValue)} 운영 자료</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input aria-label="대상 월" type="month" value={periodValue} onChange={(event) => changePeriod(event.target.value)} className="h-10 border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-gray-950 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100" />
            <Link href="/vending" className="inline-flex h-10 items-center border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-700 dark:text-dark-200 dark:hover:bg-dark-900">자판기 관리</Link>
          </div>
        </div>
        <nav className="mt-6 flex overflow-x-auto border-b border-gray-200 dark:border-dark-800" aria-label="자판기 운영 메뉴">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.key;
            return <Link key={tab.key} href={`${basePath}/${tab.key}?period=${periodValue}`} className={`inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-medium ${active ? "border-emerald-700 text-emerald-700 dark:text-emerald-300" : "border-transparent text-gray-500 hover:text-gray-950 dark:text-dark-300 dark:hover:text-white"}`}><Icon size={16} />{tab.label}</Link>;
          })}
        </nav>
      </div>

      {message && <div className="mt-5 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-200">{message}</div>}

      {view === "dashboard" && <DashboardView dashboard={dashboard} basePath={basePath} period={periodValue} />}
      {view === "purchases" && <PurchaseView dashboard={dashboard} period={periodValue} pending={pending} submit={submit} />}
      {view === "sales" && <SalesView dashboard={dashboard} period={periodValue} pending={pending} submit={submit} />}
      {view === "report" && <ReportView dashboard={dashboard} inventory={inventory} setInventory={setInventory} updateInventory={updateInventory} period={periodValue} pending={pending} submit={submit} />}
    </div>
  );
}

function DashboardView({ dashboard, basePath, period }: { dashboard: VendingDashboard; basePath: string; period: string }) {
  return <div className="mt-8 space-y-7"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="순매출" value={won(dashboard.metrics.salesAmount)} detail={count(dashboard.metrics.salesCount)} /><Metric label="일평균 매출" value={won(dashboard.metrics.averageDailyAmount)} detail={`${dashboard.metrics.activeDays}일 운영`} /><Metric label="월간 매입" value={won(dashboard.metrics.purchaseAmount)} detail={`${dashboard.purchases.length}건`} /><Metric label="월말 재고" value={won(dashboard.metrics.inventoryAmount)} detail={`${dashboard.metrics.inventoryQuantity}개`} /></section><section className="grid gap-5 lg:grid-cols-2"><SummaryPanel title="매입 현황" rows={[["상품 매입", won(dashboard.metrics.productPurchaseAmount)], ["소모품 매입", won(dashboard.metrics.supplyPurchaseAmount)], ["합계", won(dashboard.metrics.purchaseAmount)]]} href={`${basePath}/purchases?period=${period}`} /><SummaryPanel title="매출 현황" rows={[["순매출", won(dashboard.metrics.salesAmount)], ["판매 건수", count(dashboard.metrics.salesCount)], ["최고 매출일", dashboard.metrics.peakSale?.soldAt || "-"]]} href={`${basePath}/sales?period=${period}`} /></section></div>;
}

function PurchaseView({ dashboard, period, pending, submit }: { dashboard: VendingDashboard; period: string; pending: boolean; submit: (data: FormData, action: (data: FormData) => Promise<VendingActionResult>) => void }) {
  return <div className="mt-8 grid gap-5 lg:grid-cols-2"><div className="space-y-5"><UploadPanel title="매입자료 업로드" kind="purchase" machineId={dashboard.machine.id} period={period} pending={pending} submit={submit} /><form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget), createVendingPurchaseAction); }} className="border border-gray-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900"><input type="hidden" name="machineId" value={dashboard.machine.id} /><input type="hidden" name="period" value={period} /><h2 className="text-base font-semibold text-gray-950 dark:text-white">매입 건 입력</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required name="purchasedAt" type="date" defaultValue={`${period}-01`} className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><select name="category" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950"><option value="product">상품 매입</option><option value="supply">소모품 매입</option></select><input required name="productName" placeholder="품목" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input required name="quantity" type="number" min="1" placeholder="수량" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input required name="amount" type="number" min="0" placeholder="금액" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /><input name="note" placeholder="비고" className="h-10 border border-gray-300 bg-white px-3 text-sm dark:border-dark-700 dark:bg-dark-950" /></div><div className="mt-4 flex justify-end"><button disabled={pending} className="inline-flex h-10 items-center gap-2 bg-gray-950 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-950"><Save size={16} />매입 저장</button></div></form></div><DataTable headers={["일자", "구분", "품목", "수량", "금액", "비고"]} rows={dashboard.purchases.map((item) => [item.purchasedAt, item.category === "product" ? "상품" : "소모품", item.productName, String(item.quantity), won(item.amount), item.note || ""])} empty="등록된 매입내역이 없습니다." /></div>;
}

function SalesView({ dashboard, period, pending, submit }: { dashboard: VendingDashboard; period: string; pending: boolean; submit: (data: FormData, action: (data: FormData) => Promise<VendingActionResult>) => void }) {
  return <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><UploadPanel title="매출자료 업로드" kind="sales" machineId={dashboard.machine.id} period={period} pending={pending} submit={submit} /><DataTable headers={["일자", "승인", "취소", "순매출 건수", "순매출 금액"]} rows={dashboard.sales.map((item) => [item.soldAt, won(item.approvedAmount), won(item.cancelledAmount), count(item.netCount), won(item.netAmount)])} empty="등록된 매출내역이 없습니다." /></div>;
}

function ReportView({ dashboard, inventory, setInventory, updateInventory, period, pending, submit }: { dashboard: VendingDashboard; inventory: InventoryDraft[]; setInventory: React.Dispatch<React.SetStateAction<InventoryDraft[]>>; updateInventory: (index: number, key: keyof InventoryDraft, value: string) => void; period: string; pending: boolean; submit: (data: FormData, action: (data: FormData) => Promise<VendingActionResult>) => void }) {
  return <div className="mt-8 space-y-8"><section className="border border-gray-200 dark:border-dark-800"><div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-dark-800 md:flex-row md:items-center md:justify-between"><div><h2 className="text-base font-semibold text-gray-950 dark:text-white">월말 재고</h2><p className="mt-1 text-sm text-gray-500 dark:text-dark-300">평균 단가는 상품별 매입 단가 또는 직접 입력값을 사용합니다.</p></div><button type="button" onClick={() => setInventory((items) => [...items, { productName: "", category: "product", closingQuantity: 0, unitCost: 0, note: null }])} className="inline-flex h-9 items-center justify-center gap-2 border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-700 dark:text-dark-200 dark:hover:bg-dark-900"><PackagePlus size={16} />품목 추가</button></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-dark-900 dark:text-dark-300"><tr><th className="px-4 py-3">품목</th><th className="px-4 py-3">구분</th><th className="px-4 py-3 text-right">월말 재고</th><th className="px-4 py-3 text-right">평균 단가</th><th className="px-4 py-3 text-right">재고금액</th><th className="px-4 py-3">비고</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-dark-800">{inventory.map((item, index) => <tr key={`${item.productName}-${index}`}><td className="px-4 py-2"><input value={item.productName} onChange={(event) => updateInventory(index, "productName", event.target.value)} className="h-9 w-full border border-gray-200 bg-white px-2 dark:border-dark-700 dark:bg-dark-950" /></td><td className="px-4 py-2"><select value={item.category} onChange={(event) => updateInventory(index, "category", event.target.value)} className="h-9 border border-gray-200 bg-white px-2 dark:border-dark-700 dark:bg-dark-950"><option value="product">상품</option><option value="supply">소모품</option></select></td><td className="px-4 py-2 text-right"><input value={item.closingQuantity} type="number" min="0" onChange={(event) => updateInventory(index, "closingQuantity", event.target.value)} className="h-9 w-24 border border-gray-200 bg-white px-2 text-right dark:border-dark-700 dark:bg-dark-950" /></td><td className="px-4 py-2 text-right"><input value={item.unitCost} type="number" min="0" onChange={(event) => updateInventory(index, "unitCost", event.target.value)} className="h-9 w-28 border border-gray-200 bg-white px-2 text-right dark:border-dark-700 dark:bg-dark-950" /></td><td className="px-4 py-2 text-right font-medium tabular-nums">{won(item.closingQuantity * item.unitCost)}</td><td className="px-4 py-2"><input value={item.note || ""} onChange={(event) => updateInventory(index, "note", event.target.value)} className="h-9 w-full border border-gray-200 bg-white px-2 dark:border-dark-700 dark:bg-dark-950" /></td></tr>)}{inventory.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">월말 재고를 입력해주세요.</td></tr>}</tbody></table></div><div className="flex justify-end border-t border-gray-200 px-4 py-3 dark:border-dark-800"><button disabled={pending} onClick={() => { const formData = new FormData(); formData.set("machineId", String(dashboard.machine.id)); formData.set("period", period); formData.set("entries", JSON.stringify(inventory)); submit(formData, saveVendingInventoryAction); }} className="inline-flex h-10 items-center gap-2 bg-gray-950 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-950"><Save size={16} />재고 저장</button></div></section><section className="border border-gray-200 dark:border-dark-800 print:border-0"><div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-5 dark:border-dark-800 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">월간 운영 보고서</p><h2 className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">{monthText(period)} {dashboard.machine.name} 운영 보고서</h2></div><div className="flex gap-2 print:hidden"><button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 border border-gray-300 px-3 text-sm font-medium text-gray-700 dark:border-dark-700 dark:text-dark-200"><Printer size={16} />인쇄</button><button disabled={pending} onClick={() => { const formData = new FormData(); formData.set("machineId", String(dashboard.machine.id)); formData.set("period", period); submit(formData, finalizeVendingReportAction); }} className="inline-flex h-10 items-center gap-2 bg-emerald-700 px-3 text-sm font-medium text-white disabled:opacity-50"><Save size={16} />보고서 확정</button></div></div><ReportContent dashboard={dashboard} /></section></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900"><p className="text-sm text-gray-500 dark:text-dark-300">{label}</p><p className="mt-2 text-xl font-semibold tabular-nums text-gray-950 dark:text-white">{value}</p><p className="mt-2 text-xs text-gray-400 dark:text-dark-400">{detail}</p></div>; }
function SummaryPanel({ title, rows, href }: { title: string; rows: string[][]; href: string }) { return <section className="border border-gray-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900"><div className="flex items-center justify-between"><h2 className="text-base font-semibold text-gray-950 dark:text-white">{title}</h2><Link href={href} className="text-sm font-medium text-emerald-700 dark:text-emerald-300">자세히</Link></div><dl className="mt-5 space-y-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between border-b border-gray-100 pb-3 text-sm last:border-0 last:pb-0 dark:border-dark-800"><dt className="text-gray-500 dark:text-dark-300">{label}</dt><dd className="font-medium text-gray-950 dark:text-white">{value}</dd></div>)}</dl></section>; }
function UploadPanel({ title, kind, machineId, period, pending, submit }: { title: string; kind: "purchase" | "sales"; machineId: number; period: string; pending: boolean; submit: (data: FormData, action: (data: FormData) => Promise<VendingActionResult>) => void }) { return <form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget), importVendingSpreadsheetAction); }} className="border border-gray-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900"><input type="hidden" name="kind" value={kind} /><input type="hidden" name="machineId" value={machineId} /><input type="hidden" name="period" value={period} /><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-gray-950 dark:text-white">{title}</h2><p className="mt-1 text-sm text-gray-500 dark:text-dark-300">Excel 파일의 해당 월 자료로 교체합니다.</p></div><FileUp size={20} className="text-gray-400" /></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><input required name="file" type="file" accept=".xlsx,.xls" className="block min-w-0 flex-1 text-sm text-gray-500 file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 dark:text-dark-300 dark:file:bg-dark-800 dark:file:text-dark-100" /><button disabled={pending} className="h-10 bg-gray-950 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-950">저장</button></div></form>; }
function DataTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) { return <div className="overflow-x-auto border border-gray-200 dark:border-dark-800"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-dark-900 dark:text-dark-300"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 dark:divide-dark-800">{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-gray-700 dark:text-dark-200">{cell}</td>)}</tr>)}{rows.length === 0 && <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-gray-400">{empty}</td></tr>}</tbody></table></div>; }
function ReportContent({ dashboard }: { dashboard: VendingDashboard }) { const { metrics } = dashboard; return <div className="space-y-7 p-5 md:p-7"><DataTable headers={["매출", "금액", "건수"]} rows={[["순매출", won(metrics.salesAmount), count(metrics.salesCount)], ["판매분 자재비", won(metrics.materialCost), ""], ["자재비 차감 후 금액", won(metrics.operatingAmount), ""]]} empty="" /><DataTable headers={["매입 구분", "금액", "건수"]} rows={[["상품 매입", won(metrics.productPurchaseAmount), count(dashboard.purchases.filter((item) => item.category === "product").length)], ["소모품 매입", won(metrics.supplyPurchaseAmount), count(dashboard.purchases.filter((item) => item.category === "supply").length)], ["월말 재고", won(metrics.inventoryAmount), `${metrics.inventoryQuantity}개`]]} empty="" /><div className="text-sm leading-7 text-gray-700 dark:text-dark-200"><p>{monthText(dashboard.period.period.slice(0, 7))} {dashboard.machine.name}은 순매출 {won(metrics.salesAmount)}과 {count(metrics.salesCount)}의 이용 실적으로 운영되었습니다.</p><p>판매분 자재비 차감 후 금액은 {won(metrics.operatingAmount)}이며, 월말 재고금액은 {won(metrics.inventoryAmount)}입니다.</p></div></div>; }
