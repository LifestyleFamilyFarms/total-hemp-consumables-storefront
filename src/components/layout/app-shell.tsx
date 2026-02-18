"use client"
import type { ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import ComplianceBar from "@/components/layout/compliance-bar"
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
  return (
    <>
      <main className="shell-surface shell-surface--full relative flex w-full flex-1 flex-col">
        <Topbar
          countryCode={countryCode}
          cart={cart}
          categories={categories}
          user={user}
        />

        <div className="relative isolate px-0 pb-[calc(var(--bottom-bar-height,4rem)+2rem)] pt-3 sm:px-6 md:pt-5">
          <div className="mx-auto max-w-8xl shell-surface__content">{children}</div>
        </div>

        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background" /> : null}
      </main>

      <AgeGate />
    </>
  )
}
