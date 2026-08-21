export const dynamic = 'force-dynamic';
import { DefaultLayout } from "@extensions";
import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";
import { getPublicSiteSettingsAction } from "@/modules/admin/actions/settings.action";

interface CurrentUser {
  id: number;
  accountId: string;
  isAdmin: boolean;
  groups: number[];
  loggedIn: boolean;
}

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = await cookieStore.get("accessToken")?.value;
  const settings = await getPublicSiteSettingsAction();

  let currentUser: CurrentUser | null = null;
  if (accessToken) {
    try {
      const decoded = await verify(accessToken);
      if (decoded?.id) {
        currentUser = {
          ...decoded,
          isAdmin: Boolean(decoded.isAdmin),
          groups: decoded.groups || [],
          loggedIn: true,
        };
      }
    } catch (err) {
      console.log("JWT decode 실패", err);
    }
  }

  return (
    <DefaultLayout
      siteTitle={settings.data?.projectTitle}
    >
        {children}
    </DefaultLayout>
  );
}
