import { cookies as nextCookies } from "next/headers"

import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import NextSteps from "@modules/order/components/next-steps"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const salesPersonCode =
    typeof order.metadata?.sales_person_code === "string" ||
    typeof order.metadata?.sales_person_code === "number"
      ? String(order.metadata.sales_person_code)
      : null

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <div className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4 font-semibold">
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </div>
          {salesPersonCode && (
            <div className="rounded-md border border-ui-border-base bg-white/60 p-3 text-sm text-ui-fg-subtle">
              Sales rep:{" "}
              <span className="font-semibold">{salesPersonCode}</span>
            </div>
          )}
          <OrderDetails order={order} />
          <h2 className="flex flex-row text-3xl-regular font-semibold">
            Summary
          </h2>
          <Items order={order} />
          <OrderSummary order={order} />
          <ShippingDetails order={{ ...order, shipping_methods: order.shipping_methods ?? [] }} />
          <PaymentDetails order={order} />
          <NextSteps order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
