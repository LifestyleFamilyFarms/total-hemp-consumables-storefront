import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"

import AppShell from "@/components/layout/app-shell"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { children } = props
  const { countryCode } = await props.params
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

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
      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {children}
      <Footer />
    </AppShell>
  )
}
