"use client"
import type { ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import ComplianceBar from "@/components/layout/compliance-bar"
import Topbar from "@/components/layout/topbar"
import CategoryTopbar from "@/components/layout/category-topbar"
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
        {/* Topbar full-width (sticky) */}
        <Topbar
          countryCode={countryCode}
          cart={cart}
          categories={categories}
          user={user}
        />
        <CategoryTopbar countryCode={countryCode} categories={categories} />

        <div className="relative isolate mt-24 px-4 pt-6 pb-12 sm:px-6 lg:pl-16 lg:pr-4 md:pb-12 md:pl-16">
          <div className="mx-auto max-w-6xl shell-surface__content">{children}</div>
        </div>

        {/* BottomBar full-width (Compliance) */}
        <ComplianceBar />
        {withBottomBar ? <div className="border-t bg-background">{/* <BottomBar /> */}</div> : null}
      </main>

      <AgeGate />
    </>
  )
}
