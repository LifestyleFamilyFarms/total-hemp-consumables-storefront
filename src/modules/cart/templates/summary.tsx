"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import FirstPurchaseDiscount from "@modules/checkout/components/first-purchase-discount"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { selectIsCartMutating, useStorefrontState } from "@lib/state"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StoreCartPromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const isCartMutating = useStorefrontState(selectIsCartMutating)

  return (
    <div className="rounded-xl border border-border/30 bg-card p-5">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-[2rem] leading-[2.75rem] font-semibold">Summary</h2>
        <FirstPurchaseDiscount cart={cart} />
        <DiscountCode cart={cart} />
        <Divider />
        <div className="relative">
          {isCartMutating ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/80 backdrop-blur-[1px]">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <BrandSpinner />
                Updating totals...
              </div>
            </div>
          ) : null}
          <CartTotals totals={cart} />
        </div>
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-12 bg-accent text-accent-foreground font-bold rounded-lg text-sm uppercase tracking-[0.08em]">Go to checkout</Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Summary
