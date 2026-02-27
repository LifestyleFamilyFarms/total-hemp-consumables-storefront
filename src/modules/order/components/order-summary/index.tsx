import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

type PromotionLine = {
  key: string
  label: string
  amount: number
}

const getPromotionLines = (order: HttpTypes.StoreOrder): PromotionLine[] => {
  const grouped = new Map<string, PromotionLine>()

  const itemAdjustments = (order.items || []).flatMap((item) => item.adjustments || [])
  const shippingAdjustments = (order.shipping_methods || []).flatMap(
    (shippingMethod) => shippingMethod.adjustments || []
  )

  const adjustments = [...itemAdjustments, ...shippingAdjustments]

  for (const adjustment of adjustments) {
    if (!adjustment) {
      continue
    }

    const amount = Math.abs(Number(adjustment.amount || 0))
    if (!Number.isFinite(amount) || amount <= 0) {
      continue
    }

    const label =
      adjustment.code?.trim() ||
      adjustment.description?.trim() ||
      adjustment.promotion_id ||
      "Promotion"

    const key = adjustment.code || adjustment.promotion_id || label

    const existing = grouped.get(key)
    if (existing) {
      existing.amount += amount
    } else {
      grouped.set(key, {
        key,
        label,
        amount,
      })
    }
  }

  return Array.from(grouped.values())
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  const promotionLines = getPromotionLines(order)

  return (
    <div>
      <h2 className="text-base-semi">Order Summary</h2>
      <div className="text-small-regular text-ui-fg-base my-2">
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Subtotal</span>
          <span>{getAmount(order.subtotal)}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- {getAmount(order.discount_total)}</span>
            </div>
          )}
          {promotionLines.length > 0 && (
            <div className="rounded-md border border-border/60 bg-muted/20 p-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/65">
                Applied promotions
              </p>
              <div className="space-y-1.5">
                {promotionLines.map((promotion) => (
                  <div
                    key={promotion.key}
                    className="flex items-center justify-between text-xs text-foreground/75"
                  >
                    <span className="truncate">{promotion.label}</span>
                    <span>- {getAmount(promotion.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- {getAmount(order.gift_card_total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{getAmount(order.shipping_total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{getAmount(order.tax_total)}</span>
          </div>
        </div>
        <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Total</span>
          <span>{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
