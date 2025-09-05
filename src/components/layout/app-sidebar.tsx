"use client"

import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/components/layout/nav-data"
import { NavMain, type NavMainItem } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type User = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  isAuthenticated?: boolean
} | null

export function AppSidebar({
  countryCode,
  user,
}: {
  countryCode: string
  user: User
}) {
  const pathname = usePathname()

  // Transform your NAV_ITEMS → NavMain items
  const items: NavMainItem[] = NAV_ITEMS.map((it) => {
    const url = it.href ? it.href(countryCode) : "#"
    const children =
      it.children?.map((c) => ({ title: c.label, url: c.href(countryCode) })) ?? []
  
    const parentActive =
      (it.href ? pathname === url || pathname.startsWith(url + "/") : false) ||
      children.some((c) => pathname === c.url || pathname.startsWith(c.url + "/"))
  
    return { title: it.label, url, icon: it.icon, items: children, isActive: parentActive }
  })

  return (
    <Sidebar collapsible="icon">
      {/* Header: visible only when expanded; puts trigger at top-right */}
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-end px-2">
          <SidebarTrigger aria-label="Collapse sidebar" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Collapsed-only: show trigger as the first icon in the list */}
        <div className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenu>
            <SidebarMenuItem>
              {/* Use SidebarTrigger directly; no nested buttons */}
              <SidebarTrigger
                aria-label="Expand sidebar"
                className="h-9 w-full justify-center"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {/* Main nav */}
        <NavMain items={items} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} countryCode={countryCode} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}