"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import Link from "next/link"
import ComplianceBar from "@/components/layout/compliance-bar"
import IconRail from "@/components/layout/icon-rail"
import { ShoppingCart } from "lucide-react"
import Topbar from "@/components/layout/topbar"
import { useAppContext } from "@lib/context/app-context"

type User = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  isAuthenticated?: boolean
} | null

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
  const [isClient, setIsClient] = useState(false)
  const { sidebarOpen, setSidebarOpen } = useAppContext()

  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    // Sidebar default closed so it overlays without pushing content
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* Sidebar overlay, positioned under the topbar via its own top offset */}
      <AppSidebar countryCode={countryCode} user={user} />

      <SidebarInset className="shell-surface shell-surface--full">
        {/* Topbar full-width (sticky) */}
        <Topbar countryCode={countryCode} user={user} />

        {/* Left icon rail (desktop), content to the right */}
        <IconRail />
        <div className="relative isolate mt-12 px-4 pt-6 pb-12 sm:px-6 lg:pl-16 lg:pr-4 md:pb-12 md:pl-16">
          <div className="mx-auto max-w-6xl shell-surface__content">{children}</div>
        </div>

        {/* BottomBar full-width (Compliance) */}
        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background">{/* <BottomBar /> */}</div> : null}
      </SidebarInset>

      {/* Mobile thumb bar for quick browse (sits above compliance bar) */}
      {isClient ? (
        <div className="fixed right-6 z-40 hidden md:block" style={{ bottom: "calc(var(--bottom-bar-height, 5rem))" }}>
          <Link
            href={`/${countryCode}/cart`}
            className="group relative inline-flex items-center gap-3 rounded-[32px] border border-border/50 bg-background px-6 py-5 text-lg font-semibold text-foreground shadow-[0_25px_60px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5"
          >
            <span className="absolute -top-3 right-4 h-2 w-2 rounded-full bg-primary group-hover:bg-primary/80" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-background">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">Cart</span>
              <span className="text-base font-semibold text-foreground">View items</span>
            </div>
          </Link>
        </div>
      ) : null}

      {/* Mobile thumb bar disabled per UX request */}
    </SidebarProvider>
  )
}
