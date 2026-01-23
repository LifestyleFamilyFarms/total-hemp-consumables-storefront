import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { cn } from "src/lib/utils"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const {
    total = 0,
    original_total = 0,
    subtotal = 0,
    original_subtotal = 0,
    discount_total = 0,
  } = item

  // Current line total: prefer total (includes tax/discounts), fallback to subtotal.
  const currentPrice =
    typeof total === "number" && total > 0 ? total : subtotal ?? 0
  // Original line total: prefer original_total, fallback to original_subtotal/current.
  const originalPrice =
    typeof original_total === "number" && original_total > 0
      ? original_total
      : original_subtotal ?? currentPrice

  const hasDiscount = (discount_total ?? 0) > 0

  const hasReducedPrice =
    hasDiscount && originalPrice - currentPrice > 0.001

  return (
    <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
      {hasReducedPrice && (
        <div className="text-right">
          <p className="text-xs">
            {style === "default" && <span className="text-muted-foreground">Original: </span>}
            <span
              className="line-through text-muted-foreground"
              data-testid="product-original-price"
            >
              {convertToLocale({
                amount: originalPrice,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-xs font-semibold text-primary">
              -{getPercentageDiff(originalPrice, currentPrice || 0)}%
            </span>
          )}
        </div>
      )}
      <span
        className={cn(
          "text-base font-semibold text-foreground",
          hasReducedPrice && "text-primary"
        )}
        data-testid="product-price"
      >
        {convertToLocale({
          amount: currentPrice,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemPrice
