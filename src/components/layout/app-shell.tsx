"use client"

import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import MobileThumbBar from "@/components/layout/mobile-thumb-bar"
import ComplianceBar from "@/components/layout/compliance-bar"
import IconRail from "@/components/layout/icon-rail"
import { ShoppingCart } from "lucide-react"

type User = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  isAuthenticated?: boolean
} | null

function TopbarContent({ countryCode, user }: { countryCode: string; user: User }) {
  const { state } = useSidebar()
  const isExpanded = state === "expanded"
  return (
    <div className="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        {/* Compact logo when sidebar is collapsed; horizontal when expanded */}
        {isExpanded ? (
          <Link
            href={`/${countryCode}`}
            className="inline-flex h-9 w-40 items-center justify-center rounded-md border border-border/60 bg-background/80 text-[10px] font-semibold tracking-[0.2em] text-foreground/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50"
          >
            HORIZONTAL LOGO
          </Link>
        ) : (
          <Link
            href={`/${countryCode}`}
            className="inline-flex h-9 w-24 items-center justify-center rounded-full border border-border/60 bg-background/80 text-[10px] font-semibold uppercase tracking-[0.4em] text-foreground/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50"
          >
            LOGO
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher className="h-8" />
        <Button asChild variant="outline" size="icon" aria-label="Cart">
          <Link href={`/${countryCode}/checkout`} prefetch={false}>
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {user?.isAuthenticated ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={`/${countryCode}/account`}>Account</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link href={`/${countryCode}/account`}>Sign up</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AppShell({
  countryCode,
  children,
  user = null,
  withBottomBar = false,
}: {
  countryCode: string
  children: React.ReactNode
  user?: User
  withBottomBar?: boolean
  }) {
  return (
    // Sidebar default closed so it overlays without pushing content
    <SidebarProvider defaultOpen={false}>
      {/* Sidebar overlay, positioned under the topbar via its own top offset */}
      <AppSidebar countryCode={countryCode} user={user} />

      <SidebarInset>
        {/* Topbar full-width (sticky) */}
        <TopbarContent countryCode={countryCode} user={user} />

        {/* Left icon rail (desktop), content to the right */}
        <IconRail />
        <div className="mx-auto max-w-6xl mt-12 px-4 pt-6 pb-12 sm:px-6 lg:pl-16 lg:pr-4 md:pb-12 md:pl-16">{children}</div>

        {/* BottomBar full-width (Compliance) */}
        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background">{/* <BottomBar /> */}</div> : null}
      </SidebarInset>

      {/* Mobile thumb bar for quick browse (sits above compliance bar) */}
      <MobileThumbBar countryCode={countryCode} />
    </SidebarProvider>
  )
}
