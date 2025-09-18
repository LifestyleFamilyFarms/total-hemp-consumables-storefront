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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

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
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const normalize = (path: string) => {
    if (!path) return "/"
    const [base] = path.split("?")
    const trimmed = base.replace(/\/+$/g, "")
    return trimmed === "" ? "/" : trimmed
  }
  const current = normalize(pathname)

  // Transform your NAV_ITEMS → NavMain items
  const items: NavMainItem[] = NAV_ITEMS.map((it) => {
    const url = it.href ? it.href(countryCode) : "#"
    const children =
      it.children?.map((c) => ({ title: c.label, url: c.href(countryCode) })) ?? []

    const root = `/${countryCode}`
    const rootNormalized = normalize(root)
    const target = normalize(url)
    const isRealChild = (u: string) => normalize(u) !== rootNormalized

    // Parent active logic:
    // - If the parent URL resolves to the region root (e.g., "/us"), only the Home item
    //   should be considered active on the root path. Other items that temporarily point to
    //   the root (e.g., placeholders like Merch) should not be marked active.
    // - Otherwise, allow exact match or prefix match for regular sections.
    const isRootUrl = target === rootNormalized
    const parentActiveSelf = it.href
      ? isRootUrl
        ? it.label === "Home" && current === rootNormalized
        : current === target || current.startsWith(`${target}/`)
      : false

    const parentActiveChildren = children.some(
      (c) => {
        const childTarget = normalize(c.url)
        return isRealChild(c.url) && (current === childTarget || current.startsWith(`${childTarget}/`))
      }
    )

    const parentActive = parentActiveSelf || parentActiveChildren

    return { title: it.label, url, icon: it.icon, items: children, isActive: parentActive }
  })

  return (
    <Sidebar collapsible="offcanvas" className="top-14 z-30 h-[calc(100svh-theme(spacing.14))]">
      {/* Header with prominent Close control */}
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-3 py-2">
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 rounded-md border border-sidebar-border bg-background/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-foreground/80 hover:bg-background"
          >
            Close
            <PanelLeft className="h-4 w-4" />
          </Button>
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
