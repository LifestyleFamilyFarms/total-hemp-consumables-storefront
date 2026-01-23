import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckoutSteps } from "@modules/checkout/components/steps"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: { countryCode?: string }
  searchParams: { step?: string } | Promise<{ step?: string }>
}) {
  const resolvedSearch =
    searchParams && typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<{ step?: string }>)
      : (searchParams as { step?: string } | undefined) || {}

  const cart = await retrieveCart()

  if (!cart) {
    const country = params?.countryCode || "us"
    redirect(`/${country}/cart`)
  }

  const customer = await retrieveCustomer()
  const currentStep = resolvedSearch?.step || "address"

  return (
    <div className="bg-ui-bg-subtle min-h-screen py-12 sm:py-16">
      <div className="content-container max-w-[1440px]">
        <CheckoutSteps />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_380px] lg:gap-14 xl:grid-cols-[minmax(0,1.7fr)_400px] xl:gap-20">
          <PaymentWrapper cart={cart}>
            <CheckoutForm
              cart={cart}
              customer={customer}
              currentStep={currentStep}
            />
          </PaymentWrapper>
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
