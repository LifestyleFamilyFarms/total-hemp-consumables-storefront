"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MobileThumbBar from "@/components/layout/mobile-thumb-bar"
import ComplianceBar from "@/components/layout/compliance-bar"

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
  return (
    <SidebarProvider>
      <AppSidebar countryCode={countryCode} user={user} />

      <SidebarInset>
        {/* Topbar (no SidebarTrigger here) */}
        <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile-only hamburger to open the drawer */}
            <SidebarTrigger className="mr-1 md:hidden" aria-label="Open menu" />

            <Link href={`/${countryCode}`} className="font-extrabold tracking-tight">
              Total&nbsp;Hemp
            </Link>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Scrollable content */}
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 lg:px-8 md:pb-24">{children}</div>

        {/* Mobile thumb bar for quick browse (sits above compliance bar) */}
        <MobileThumbBar countryCode={countryCode} />

        {/* Fixed compliance bar always visible */}
        <ComplianceBar />

        {withBottomBar ? <div className="border-t bg-background">{/* <BottomBar /> */}</div> : null}
      </SidebarInset>
    </SidebarProvider>
  )
}
