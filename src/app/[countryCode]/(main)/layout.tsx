import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
 

import AppShell from "@/components/layout/app-shell"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
 

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

  const user = customer
  ? {
      name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
      email: customer.email,
      avatarUrl: null, // if you have an avatar URL, set it here
      isAuthenticated: true,
    }
  : {
      name: null,
      email: null,
      avatarUrl: null,
      isAuthenticated: false,
    }

  return (
    <AppShell countryCode={countryCode} user={user}>
      {customer && cart && <CartMismatchBanner customer={customer} cart={cart} />}
      {/* Free shipping nudge removed */}
      {children}
      <Footer />
    </AppShell>
  )
}
