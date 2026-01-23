"use client"

import { useCart } from "@lib/context/cart-context"
import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  const { cart: ctxCart } = useCart()
  const currentCart = ctxCart ?? cart
  const itemCount = currentCart?.items?.reduce(
    (sum: number, item: any) => sum + (item?.quantity ?? 0),
    0
  )

  return (
    <aside className="lg:sticky lg:top-8">
      <div className="rounded-2xl border border-border bg-white shadow-sm">
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
          <CartTotals totals={currentCart} />
        </div>

        <div className="px-5 pt-2 pb-5 border-t border-border/80">
          <DiscountCode cart={currentCart} />
        </div>

        <div className="px-5 pb-5 border-t border-border/80">
          <ItemsPreviewTemplate cart={currentCart} />
        </div>
      </div>
    </aside>
  )
}

export default CheckoutSummary
