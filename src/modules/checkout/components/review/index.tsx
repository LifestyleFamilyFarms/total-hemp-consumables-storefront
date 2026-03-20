"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import CartTotals from "@modules/common/components/cart-totals"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import SectionCard from "../section-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"

function AddressSummary({ address }: { address: HttpTypes.StoreCartAddress }) {
  return (
    <div className="text-sm text-foreground">
      <p>
        {address.first_name} {address.last_name}
      </p>
      <p>{address.address_1}</p>
      {address.address_2 && <p>{address.address_2}</p>}
      <p>
        {address.city}, {address.province} {address.postal_code}
      </p>
    </div>
  )
}

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  const items: any[] = cart?.items ?? []
  const [itemsExpanded, setItemsExpanded] = useState(items.length <= 3)

  const shippingMethod = cart?.shipping_methods?.at(-1)
  const currencyCode = cart?.currency_code ?? "usd"

  return (
    <SectionCard
      title="Review"
      description="Confirm everything looks good before placing your order."
    >
      {isOpen && previousStepsCompleted && (
        <>
          {/* Order summary */}
          <div className="mb-6 space-y-4 rounded-xl border border-border/60 bg-card/50 p-4">
            {/* Ship to */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ship to
              </p>
              {cart.shipping_address && (
                <AddressSummary address={cart.shipping_address} />
              )}
            </div>

            <div className="h-px bg-border/50" />

            {/* Delivery */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Delivery
              </p>
              <p className="text-sm text-foreground">
                {shippingMethod?.name ?? "Standard shipping"}
                {typeof shippingMethod?.amount === "number" && (
                  <span className="ml-2 text-muted-foreground">
                    {convertToLocale({
                      amount: shippingMethod.amount,
                      currency_code: currencyCode,
                    })}
                  </span>
                )}
              </p>
            </div>

            <div className="h-px bg-border/50" />

            {/* Payment */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment
              </p>
              <p className="text-sm text-foreground">
                {paidByGiftcard ? "Gift card" : "Card on file"}
              </p>
            </div>
          </div>

          {/* Order items */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setItemsExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              data-testid="review-items-toggle"
            >
              <span>
                {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                {convertToLocale({
                  amount: cart?.total ?? 0,
                  currency_code: currencyCode,
                })}
              </span>
              {itemsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {itemsExpanded && (
              <div className="mt-3 space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3"
                    data-testid="review-line-item"
                  >
                    {item.thumbnail && (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/30">
                        <Image
                          src={item.thumbnail}
                          alt={item.title ?? ""}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.variant?.title &&
                        item.variant.title !== item.title && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.title}
                          </p>
                        )}
                    </div>
                    <p className="flex-shrink-0 text-sm text-foreground">
                      {item.quantity} ×{" "}
                      {convertToLocale({
                        amount: item.unit_price ?? 0,
                        currency_code: currencyCode,
                      })}
                    </p>
                  </div>
                ))}

                <div className="mt-4 border-t border-border/50 pt-4">
                  <CartTotals totals={cart} />
                </div>
              </div>
            )}
          </div>

          {/* T&C + Place Order */}
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <p className="text-sm font-medium leading-6 text-foreground">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Total Hemp
                Consumables&apos; Privacy Policy.
              </p>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
      {!isOpen && (
        <div className="text-sm text-muted-foreground">
          {previousStepsCompleted ? (
            <span>Ready to place your order.</span>
          ) : (
            <span>Complete delivery and payment to review.</span>
          )}
        </div>
      )}
    </SectionCard>
  )
}

export default Review
