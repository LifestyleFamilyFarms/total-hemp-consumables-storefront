"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
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
    <div className="flex flex-col gap-y-4">
      <h2 className="text-[2rem] leading-[2.75rem] font-semibold">Summary</h2>
      <DiscountCode cart={cart} />
      <Divider />
      <div className="relative">
        {isCartMutating ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]">
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
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
