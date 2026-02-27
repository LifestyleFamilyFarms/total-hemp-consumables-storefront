"use client"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LoyaltyPoints from "@modules/checkout/components/loyalty-points"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import { HttpTypes } from "@medusajs/types"

type CheckoutSummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StoreCartPromotion[]
  }
}

const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
  const itemCount = cart?.items?.reduce(
    (sum: number, item: HttpTypes.StoreCartLineItem) =>
      sum + (item?.quantity ?? 0),
    0
  )

  return (
    <aside className="lg:sticky lg:top-8">
      <div className="surface-panel rounded-2xl border border-border/60 bg-card/85 shadow-[0_16px_36px_hsl(var(--surface-glass-shadow)/0.2)]">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-2xl font-semibold tracking-tight">
            Order summary
          </h2>
          {typeof itemCount === "number" && itemCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <div className="px-5 pt-4 pb-1">
          <CartTotals totals={cart} />
        </div>

        <div className="border-t border-border/70 px-5 pb-5 pt-2">
          <DiscountCode cart={cart} />
          <LoyaltyPoints cart={cart} />
        </div>

        <div className="border-t border-border/70 px-5 pb-5">
          <ItemsPreviewTemplate cart={cart} />
        </div>
      </div>
    </aside>
  )
}

export default CheckoutSummary
