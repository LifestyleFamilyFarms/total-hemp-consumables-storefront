"use client"

import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "@/components/layout/nav-data"
import SidebarNav from "@/components/layout/sidebar-nav"
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

  return (
    <Sidebar
      collapsible="offcanvas"
      className="top-14 z-30 h-auto"
      style={{ bottom: "var(--bottom-bar-height, 4rem)" }}
    >
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
        {/* Main nav (richer grouped navigation) */}
        <SidebarNav countryCode={countryCode} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} countryCode={countryCode} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
