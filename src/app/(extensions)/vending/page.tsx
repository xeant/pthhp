import { redirect } from "next/navigation";
import { DefaultLayout } from "@extensions";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import VendingManagement from "@extensions/vending/VendingManagement";
import { getVendingMachinesAdminAction } from "@extensions/vending/vending.action";

export const metadata = {
  title: "자판기 운영",
};

export const dynamic = "force-dynamic";

export default async function VendingPage() {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) redirect("/auth/signin");
  if (!user.isAdmin) redirect("/");
  const machines = await getVendingMachinesAdminAction();
  return <DefaultLayout><VendingManagement machines={machines} /></DefaultLayout>;
}
