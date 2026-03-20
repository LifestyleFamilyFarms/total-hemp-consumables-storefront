import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import { listNavigationCategories } from "@lib/data/categories"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"

import Topbar from "@/components/layout/topbar"
import ComplianceBar from "@/components/layout/compliance-bar"
import AgeGate from "@/components/layout/age-gate"
import GeoWarningBanner from "@/components/layout/geo-warning-banner"
import MemberRewardsBanner from "@/components/layout/member-rewards-banner"
import SiteFooter from "@/components/layout/footer"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  const categories = await listNavigationCategories().catch(() => [])

  const user = customer
    ? {
        name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
        email: customer.email,
        avatarUrl: null,
        isAuthenticated: true,
      }
    : {
        name: null,
        email: null,
        avatarUrl: null,
        isAuthenticated: false,
      }

  return (
    <>
      <GeoWarningBanner />
      <Topbar
        countryCode={countryCode}
        cart={cart}
        categories={categories}
        user={user}
      />
      <MemberRewardsBanner
        countryCode={countryCode}
        isAuthenticated={Boolean(user?.isAuthenticated)}
      />

      <div className="mx-auto w-full max-w-8xl px-4 pt-4 pb-8 sm:px-6 sm:pt-6">
        {customer && cart && <CartMismatchBanner customer={customer} cart={cart} />}
        {children}
      </div>

      <ComplianceBar />
      <SiteFooter countryCode={countryCode} categories={categories} />
      <AgeGate />
    </>
  )
}
