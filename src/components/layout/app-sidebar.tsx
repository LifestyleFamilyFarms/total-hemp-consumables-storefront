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

    const root = `/${countryCode}`
    const isRealChild = (u: string) => u !== root && u !== `${root}/`

    // Parent active logic:
    // - If the parent URL resolves to the region root (e.g., "/us"), only the Home item
    //   should be considered active on the root path. Other items that temporarily point to
    //   the root (e.g., placeholders like Merch) should not be marked active.
    // - Otherwise, allow exact match or prefix match for regular sections.
    const isRootUrl = url === root || url === `${root}/`
    const parentActiveSelf = it.href
      ? isRootUrl
        ? it.label === "Home" && pathname === root
        : pathname === url || pathname.startsWith(url + "/")
      : false

    const parentActiveChildren = children.some(
      (c) => isRealChild(c.url) && (pathname === c.url || pathname.startsWith(c.url + "/"))
    )

    const parentActive = parentActiveSelf || parentActiveChildren

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
