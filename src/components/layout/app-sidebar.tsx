"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import SidebarNav from "@/components/layout/sidebar-nav"
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
import { X } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import type { BrandThemeId } from "@lib/brand"

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
  const { toggleSidebar, state, openMobile, isMobile } = useSidebar()
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId
  const isExpanded = state === "expanded"
  const showWordmark = (!isMobile && isExpanded) || (isMobile && openMobile)
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
          <Link
            href={`/${countryCode}`}
            aria-label="Return home"
            className="inline-flex"
          >
            <span className="sr-only">Total Hemp Consumables</span>
            <BrandLogo
              theme={currentTheme}
              slot={showWordmark ? "hero" : "nav"}
              size={showWordmark ? "orig" : "md"}
              className={showWordmark ? "w-60" : "w-16"}
            />
          </Link>
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-md border border-sidebar-border bg-background/70 text-foreground/80 hover:bg-background"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav (richer grouped navigation) */}
        <SidebarNav countryCode={countryCode} />
      </SidebarContent>

      <SidebarFooter />

      <SidebarRail />
    </Sidebar>
  )
}
