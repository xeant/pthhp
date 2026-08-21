import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DefaultLayout } from "@extensions";
import { getAuthenticatedUser } from "@/core/utils/auth/authHelper";
import VendingConsole from "@extensions/vending/VendingConsole";
import { getVendingDashboardAction } from "@extensions/vending/vending.action";

const views = ["dashboard", "purchases", "sales", "report"] as const;
type VendingView = typeof views[number];

export const dynamic = "force-dynamic";

export default async function VendingMachinePage({ params, searchParams }: { params: Promise<{ machine: string; view: string }>; searchParams: Promise<{ period?: string }> }) {
  const user = await getAuthenticatedUser().catch(() => null);
  if (!user) redirect("/auth/signin");
  if (!user.isAdmin) redirect("/");
  const route = await params;
  if (!views.includes(route.view as VendingView)) notFound();
  const query = await searchParams;
  const dashboard = await getVendingDashboardAction(route.machine, query.period);
  if (!dashboard) notFound();
  return <DefaultLayout><VendingConsole dashboard={dashboard} view={route.view as VendingView} /></DefaultLayout>;
}
