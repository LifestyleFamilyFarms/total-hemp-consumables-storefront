import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { cn } from "src/lib/utils"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const {
    total = 0,
    original_total = 0,
    subtotal = 0,
    original_subtotal = 0,
    unit_price,
    discount_total = 0,
    quantity,
  } = item

  // Prefer subtotal (excl. tax) for display; fall back to total.
  const rawCurrent =
    typeof subtotal === "number" && subtotal > 0 ? subtotal : total || 0
  const rawOriginal =
    typeof original_subtotal === "number" && original_subtotal > 0
      ? original_subtotal
      : original_total || rawCurrent

  const safeQty = quantity && quantity > 0 ? quantity : 1
  const currentUnit =
    typeof unit_price === "number" ? unit_price : rawCurrent / safeQty
  const originalUnit =
    typeof original_total === "number" && original_total > 0
      ? rawOriginal / safeQty
      : rawCurrent / safeQty

  const hasDiscount = (discount_total ?? 0) > 0

  const hasReducedPrice = hasDiscount && originalUnit - currentUnit > 0.001

  const percentage_diff = hasReducedPrice
    ? Math.round(((originalUnit - currentUnit) / originalUnit) * 100)
    : 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
            className="line-through"
            data-testid="product-unit-original-price"
          >
            {convertToLocale({
              amount: originalUnit,
              currency_code: currencyCode,
            })}
          </span>
        </p>
        {style === "default" && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={cn("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: currentUnit,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
