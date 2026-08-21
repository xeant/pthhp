'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'

import Dropdown from '@/core/components/dropdown/Dropdown'
import Left from '@/core/components/panel/Left'
import NotificationBell from '@/core/components/bell/bell'
import { useUserContext } from '@/core/providers/UserProvider'
import { clearPwaAppBadge } from '@/core/utils/pwa/appBadge'
import type { AdminBreadcrumbRegistry, AdminMenuItem } from '@/core/registry/adminRegistry'

type AdminLayoutProps = {
  children: React.ReactNode;
  appName: string;
  adminSessionGuard: boolean;
  adminMenus: AdminMenuItem[];
  adminBreadcrumbs: AdminBreadcrumbRegistry;
};

const cleanAdminPath = (path: string) => {
  if (!path || path === '/') return path
  return path.replace(/\/+$/, '')
}

const isAdminIndexHref = (href: string) => href === '/admin' || href === '/admin/settings'

const isAdminPathActive = (pathname: string, href: string) => {
  const cleanedPath = cleanAdminPath(pathname)
  const cleanedHref = cleanAdminPath(href)

  if (cleanedPath === cleanedHref) return true
  if (isAdminIndexHref(cleanedHref)) return false

  return cleanedPath.startsWith(`${cleanedHref}/`)
}

const getAdminBreadcrumbs = (pathname: string, adminBreadcrumbs: AdminBreadcrumbRegistry) => {
  const segments = pathname.split('/').filter(Boolean)
  const section = segments[1]

  if (!section) return ['ADMIN', 'OVERVIEW']

  const sectionLabel = section === 'user' ? 'USER' : section.toUpperCase()
  const lastSegment = segments[segments.length - 1]
  const candidate = !lastSegment || !Number.isNaN(Number(lastSegment)) ? 'index' : lastSegment
  const mapped = adminBreadcrumbs[section]?.[candidate]

  if (mapped) return [sectionLabel, mapped]

  if (segments[2] && !Number.isNaN(Number(segments[2]))) return [sectionLabel, 'UPDATE']

  return [sectionLabel, (candidate || 'OVERVIEW').replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()]
}

const getMenuActive = (pathname: string, menu: AdminMenuItem) => {
  if (menu.href && isAdminPathActive(pathname, menu.href)) return true
  return menu.items?.some((item) => isAdminPathActive(pathname, item.href)) ?? false
}

type AdminSideNavProps = {
  appName: string;
  appInitial: string;
  normalizedPathname: string;
  openMenus: Record<string, boolean>;
  setOpenMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  menuConfig: AdminMenuItem[];
  onNavigate?: () => void;
  onSignOut: () => void;
}

const AdminSideNav = ({
  appName,
  appInitial,
  normalizedPathname,
  openMenus,
  setOpenMenus,
  menuConfig,
  onNavigate,
  onSignOut,
}: AdminSideNavProps) => {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-5 dark:border-dark-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white dark:bg-dark-100 dark:text-dark-950">
          {appInitial}
        </span>
        <span className="truncate text-sm font-bold tracking-tight">{appName}</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {menuConfig.map((menu) => {
            const active = getMenuActive(normalizedPathname, menu)
            const opened = openMenus[menu.id] ?? active

            if (menu.href) {
              return (
                <Link
                  key={menu.id}
                  href={menu.href}
                  onClick={onNavigate}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-gray-950 text-white dark:bg-dark-100 dark:text-dark-950'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:text-dark-400 dark:hover:bg-dark-900 dark:hover:text-dark-100'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center">{menu.icon}</span>
                  <span>{menu.label}</span>
                </Link>
              )
            }

            return (
              <div key={menu.id}>
                <button
                  type="button"
                  onClick={() => setOpenMenus((prev) => ({ ...prev, [menu.id]: !opened }))}
                  className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-gray-950 text-white dark:bg-dark-100 dark:text-dark-950'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:text-dark-400 dark:hover:bg-dark-900 dark:hover:text-dark-100'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center">{menu.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{menu.label}</span>
                  <ChevronDown size={15} className={`transition-transform ${opened ? 'rotate-180' : ''}`} />
                </button>

                {opened && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-dark-800">
                    {menu.items?.map((item) => {
                      const itemActive = isAdminPathActive(normalizedPathname, item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            itemActive
                              ? 'font-bold text-gray-950 dark:text-dark-50'
                              : 'text-gray-500 hover:text-gray-950 dark:text-dark-400 dark:hover:text-dark-100'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-gray-100 p-4 dark:border-dark-800">
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:bg-dark-900 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100"
        >
          <LogOut size={14} />
          로그아웃
        </button>
      </div>
    </div>
  )
}

const AdminLayout = ({ children, appName, adminSessionGuard, adminMenus, adminBreadcrumbs }: AdminLayoutProps) => {
  const pathname = usePathname()
  const normalizedPathname = cleanAdminPath(pathname ?? '/admin')
  const menuConfig = useMemo(() => adminMenus, [adminMenus])
  const breadcrumbs = useMemo(() => getAdminBreadcrumbs(normalizedPathname, adminBreadcrumbs), [adminBreadcrumbs, normalizedPathname])
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { user, isLoading, refetch } = useUserContext()
  const appInitial = appName.trim().charAt(0).toUpperCase() || 'P'
  const userDisplayName = String(user?.profile?.nickName || user?.nickName || user?.id || 'Admin')
  const userEmail = String(user?.email || '')
  const userInitial = userDisplayName.slice(0, 1).toUpperCase() || appInitial
  const userProfileImage = user?.profile?.profileImage || user?.profileImage || ''

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    await clearPwaAppBadge()
    window.dispatchEvent(new Event('refresh-unread'))
    window.location.href = '/'
  }

  useEffect(() => {
    const nextOpenMenus = menuConfig.reduce<Record<string, boolean>>((acc, menu) => {
      acc[menu.id] = getMenuActive(normalizedPathname, menu)
      return acc
    }, {})

    setOpenMenus((prev) => ({ ...nextOpenMenus, ...prev }))
  }, [menuConfig, normalizedPathname])

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      window.location.replace(`/auth/signin?reason=expired&redirect=${encodeURIComponent(normalizedPathname || '/admin')}`)
      return
    }

    if (!user.isAdmin) window.location.replace('/access')
  }, [isLoading, normalizedPathname, user])

  useEffect(() => {
    if (!adminSessionGuard) return

    let isMounted = true

    const verifyAdminSession = async () => {
      try {
        const result = await refetch()
        const nextUser = result?.data

        if (!isMounted) return

        if (!nextUser) {
          window.location.replace(`/auth/signin?reason=expired&redirect=${encodeURIComponent(normalizedPathname || '/admin')}`)
          return
        }

        if (!nextUser.isAdmin) window.location.replace('/access')
      } catch {
        if (isMounted) window.location.replace(`/auth/signin?reason=expired&redirect=${encodeURIComponent(normalizedPathname || '/admin')}`)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) void verifyAdminSession()
    }

    window.addEventListener('focus', verifyAdminSession)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const interval = window.setInterval(verifyAdminSession, 5 * 60 * 1000)

    return () => {
      isMounted = false
      window.removeEventListener('focus', verifyAdminSession)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(interval)
    }
  }, [adminSessionGuard, normalizedPathname, refetch])

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-500 dark:bg-dark-950 dark:text-dark-400">
        관리자 권한을 확인하고 있습니다.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-dark-950 dark:text-dark-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-gray-200 bg-white/90 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-950/90 lg:flex">
        <AdminSideNav
          appName={appName}
          appInitial={appInitial}
          normalizedPathname={normalizedPathname}
          openMenus={openMenus}
          setOpenMenus={setOpenMenus}
          menuConfig={menuConfig}
          onSignOut={handleSignOut}
        />
      </aside>

      <Left state={showMobileMenu} close={setShowMobileMenu} width={275}>
        <AdminSideNav
          appName={appName}
          appInitial={appInitial}
          normalizedPathname={normalizedPathname}
          openMenus={openMenus}
          setOpenMenus={setOpenMenus}
          menuConfig={menuConfig}
          onNavigate={() => setShowMobileMenu(false)}
          onSignOut={handleSignOut}
        />
      </Left>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-950/80 md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:hover:border-dark-700 dark:hover:text-dark-100 lg:hidden"
              aria-label="관리자 메뉴 열기"
            >
              <Menu size={17} />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-dark-500">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`${item}-${index}`}>
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-950 dark:text-dark-100' : ''}>{item}</span>
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden h-9 w-64 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-gray-400 md:flex dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500">
              <Search size={15} />
              <span className="text-xs font-medium">Quick search...</span>
            </div>
            <NotificationBell />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-2 pr-3 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:hover:border-dark-700 dark:hover:text-dark-100"
                aria-expanded={showUserDropdown}
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[11px] font-black text-gray-600 dark:bg-dark-800 dark:text-dark-100">
                  {userProfileImage ? (
                    <img src={userProfileImage} alt={userDisplayName} className="h-full w-full object-cover" />
                  ) : (
                    userInitial
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-400 dark:border-dark-900" />
                </span>
                <span className="hidden max-w-28 truncate text-xs font-bold lg:block">{userDisplayName}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform dark:text-dark-500 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              <Dropdown state={showUserDropdown} close={setShowUserDropdown} className="right-0 top-full mt-2">
                <div className="w-max min-w-60 max-w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-950/5 dark:border-dark-800 dark:bg-dark-900/95 dark:shadow-black/40">
                  <div className="border-b border-gray-100 px-3 py-3 dark:border-dark-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-black text-gray-700 dark:bg-dark-800 dark:text-dark-100">
                        {userProfileImage ? (
                          <img src={userProfileImage} alt={userDisplayName} className="h-full w-full object-cover" />
                        ) : (
                          userInitial
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-gray-950 dark:text-dark-100">{userDisplayName}</div>
                        {userEmail && <div className="mt-0.5 truncate text-xs text-gray-400 dark:text-dark-500">{userEmail}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link href="/user" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100">
                      <UserRound size={15} />
                      내 정보
                    </Link>
                    <Link href="/user/preferences" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100">
                      <Settings size={15} />
                      개인 설정
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100"
                    >
                      <LogOut size={15} />
                      로그아웃
                    </button>
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
