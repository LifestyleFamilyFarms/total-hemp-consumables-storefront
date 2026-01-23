"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
    shipping_methods?: Array<unknown>
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
    shipping_total,
    shipping_methods,
  } = totals

  const hasShippingMethod =
    Array.isArray(shipping_methods) && shipping_methods.length > 0

  /**
   * Shipping amounts from the API can occasionally arrive in minor units
   * (cents). If we see a clearly out-of-range value, normalise by 100 to
   * avoid showing $900+ rates to the shopper. We also fall back gracefully
   * when no shipping method has been selected yet.
   */
  const normalizeShipping = (amount?: number | null) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return 0
    }
    // Heuristic: if the value looks 100x too large, scale it down.
    return amount >= 200 ? amount / 100 : amount
  }

  const shippingAmountFromMethod = (() => {
    if (!hasShippingMethod) return 0
    const latest =
      Array.isArray(shipping_methods) && shipping_methods.length > 0
        ? (shipping_methods as any)[shipping_methods.length - 1]
        : null
    return normalizeShipping(
      typeof latest?.amount === "number" ? latest.amount : undefined
    )
  })()

  const shippingDisplay = hasShippingMethod
    ? shippingAmountFromMethod ||
      normalizeShipping(
        typeof shipping_total === "number"
          ? shipping_total
          : typeof shipping_subtotal === "number"
            ? shipping_subtotal
            : 0
      )
    : 0

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center">
            Subtotal (excl. shipping and taxes)
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shippingDisplay || 0}>
            {hasShippingMethod
              ? convertToLocale({
                  amount: shippingDisplay ?? 0,
                  currency_code,
                })
              : "Calculated at checkout"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
