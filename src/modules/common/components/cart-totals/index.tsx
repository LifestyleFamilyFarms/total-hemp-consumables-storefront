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

  const shippingAmountFromMethod = (() => {
    if (!hasShippingMethod) return 0
    const latest =
      Array.isArray(shipping_methods) && shipping_methods.length > 0
        ? (shipping_methods as any)[shipping_methods.length - 1]
        : null
    return typeof latest?.amount === "number" ? latest.amount : 0
  })()

  const shippingDisplay = hasShippingMethod
    ? shippingAmountFromMethod ||
      (typeof shipping_total === "number"
        ? shipping_total
        : typeof shipping_subtotal === "number"
          ? shipping_subtotal
          : 0)
    : 0

  return (
    <div>
      <div className="flex flex-col gap-y-2 text-sm text-muted-foreground">
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
              className="text-primary"
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
              className="text-primary"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="my-4 h-px w-full border-b border-border/70" />
      <div className="mb-2 flex items-center justify-between text-base font-semibold text-foreground">
        <span>Total</span>
        <span
          className="text-2xl font-semibold"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="mt-4 h-px w-full border-b border-border/70" />
    </div>
  )
}

export default CartTotals
