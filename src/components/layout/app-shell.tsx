"use client"
import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import ComplianceBar from "@/components/layout/compliance-bar"
import Topbar from "@/components/layout/topbar"
import CategoryTopbar from "@/components/layout/category-topbar"
import { useAppContext } from "@lib/context/app-context"
import AgeGate from "@/components/layout/age-gate"

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
  children: ReactNode
  user?: User
  withBottomBar?: boolean
}) {
  const { sidebarOpen, setSidebarOpen } = useAppContext()
  // const [isClient, setIsClient] = useState(false)

  return (
    // Sidebar default closed so it overlays without pushing content
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* Sidebar overlay, positioned under the topbar via its own top offset */}
      <AppSidebar countryCode={countryCode} user={user} />

      <SidebarInset className="shell-surface shell-surface--full">
        {/* Topbar full-width (sticky) */}
        <Topbar countryCode={countryCode} user={user} />
        <CategoryTopbar countryCode={countryCode} />

        <div className="relative isolate mt-24 px-4 pt-6 pb-12 sm:px-6 lg:pl-16 lg:pr-4 md:pb-12 md:pl-16">
          <div className="mx-auto max-w-6xl shell-surface__content">{children}</div>
        </div>

        {/* BottomBar full-width (Compliance) */}
        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background">{/* <BottomBar /> */}</div> : null}
      </SidebarInset>

      <AgeGate />
    </SidebarProvider>
  )
}
