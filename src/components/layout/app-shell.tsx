"use client"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ComplianceBar from "@/components/layout/compliance-bar"
import MemberRewardsBanner from "@/components/layout/member-rewards-banner"
import Topbar from "@/components/layout/topbar"
import AgeGate from "@/components/layout/age-gate"
import type { NavigationCategory } from "@lib/data/categories"

type User = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  isAuthenticated?: boolean
} | null

export default function AppShell({
  countryCode,
  children,
  cart = null,
  categories = [],
  user = null,
  withBottomBar = false,
}: {
  countryCode: string
  children: ReactNode
  cart?: HttpTypes.StoreCart | null
  categories?: NavigationCategory[]
  user?: User
  withBottomBar?: boolean
}) {
  const pathname = usePathname()
  const isAccountAuthRoute = pathname === `/${countryCode}/account`
  const shellContentSpacing = isAccountAuthRoute
    ? "relative isolate px-0 pb-2 pt-0 sm:px-6"
    : "relative isolate px-0 pb-[calc(var(--bottom-bar-height,4rem)+2rem)] pt-4 sm:px-6 sm:pt-6"

  return (
    <>
      <main className="shell-surface shell-surface--full relative flex w-full flex-1 flex-col">
        <Topbar
          countryCode={countryCode}
          cart={cart}
          categories={categories}
          user={user}
        />
        {!isAccountAuthRoute ? (
          <MemberRewardsBanner
            countryCode={countryCode}
            isAuthenticated={Boolean(user?.isAuthenticated)}
          />
        ) : null}

        <div className={shellContentSpacing}>
          <div className="mx-auto max-w-8xl shell-surface__content">{children}</div>
        </div>

        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background" /> : null}
      </main>

      <AgeGate />
    </>
  )
}
