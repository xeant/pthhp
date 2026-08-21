import { AdminLayout as FallbackAdminLayoutClient, adminBreadcrumbs, adminLayouts, adminMenus } from '@extensions'
import { getAuthSettingsAdminAction, getPublicSiteSettingsAction } from '@/modules/admin/actions/settings.action'
import { cookies } from 'next/headers'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies()
  const pendingAdminLayout = cookieStore.get('pending-admin-layout')?.value || ''
  const [settings, authSettings] = await Promise.all([
    getPublicSiteSettingsAction(),
    getAuthSettingsAdminAction(),
  ])
  const appName = settings.data?.appName || 'Gjworks'
  const adminLayoutKey = adminLayouts[pendingAdminLayout] ? pendingAdminLayout : settings.data?.adminLayout || 'project'
  const AdminLayoutClient = adminLayouts[adminLayoutKey] || FallbackAdminLayoutClient

  return (
    <AdminLayoutClient
      appName={appName}
      adminSessionGuard={authSettings.data?.adminSessionGuard ?? true}
      adminMenus={adminMenus}
      adminBreadcrumbs={adminBreadcrumbs}
    >
      {children}
    </AdminLayoutClient>
  )
}

export default AdminLayout
