export type VendingMachine = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  supplyUnitCost: number;
  isActive: boolean;
};

export type VendingReportSnapshot = {
  generatedAt: string;
  salesAmount: number;
  salesCount: number;
  materialCost: number;
  operatingAmount: number;
  inventoryAmount: number;
};

export type VendingPeriod = {
  id: number;
  machineId: number;
  period: string;
  status: "draft" | "finalized";
  note: string | null;
  reportSnapshot: VendingReportSnapshot | null;
};

export type VendingSale = {
  id: number;
  soldAt: string;
  approvedCount: number;
  approvedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  netCount: number;
  netAmount: number;
  note: string | null;
};

export type VendingPurchase = {
  id: number;
  purchasedAt: string;
  category: "product" | "supply";
  productName: string;
  quantity: number;
  amount: number;
  note: string | null;
};

export type VendingInventory = {
  id: number;
  productName: string;
  category: "product" | "supply";
  closingQuantity: number;
  unitCost: number;
  note: string | null;
};

export type VendingDashboard = {
  machines: VendingMachine[];
  machine: VendingMachine;
  period: VendingPeriod;
  sales: VendingSale[];
  purchases: VendingPurchase[];
  inventories: VendingInventory[];
  metrics: {
    salesCount: number;
    salesAmount: number;
    activeDays: number;
    averageDailyAmount: number;
    peakSale: VendingSale | null;
    productPurchaseAmount: number;
    supplyPurchaseAmount: number;
    purchaseAmount: number;
    inventoryQuantity: number;
    inventoryAmount: number;
    productUnitCost: number;
    materialCost: number;
    operatingAmount: number;
  };
};
