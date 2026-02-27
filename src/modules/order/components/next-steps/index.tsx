import { SUPPORT_EMAIL } from "@lib/constants/support"
import { HttpTypes } from "@medusajs/types"

type NextStepsProps = {
  order: HttpTypes.StoreOrder
}

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value)

const addBusinessDays = (value: Date, days: number) => {
  const result = new Date(value)
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }

  return result
}

const NextSteps = ({ order }: NextStepsProps) => {
  const shippingMethodName = (order.shipping_methods?.[0]?.name || "").toLowerCase()
  const isPickupOrder = shippingMethodName.includes("pickup")

  const createdAt = new Date(order.created_at)
  const expectedDate = addBusinessDays(createdAt, isPickupOrder ? 2 : 5)

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4" data-testid="order-next-steps">
      <h2 className="text-base font-semibold text-foreground">What happens next</h2>
      <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">1. Order confirmed:</span>{" "}
          your payment is complete and your order is now in our queue.
        </li>
        <li>
          <span className="font-medium text-foreground">
            {isPickupOrder ? "2. Pickup prep:" : "2. Fulfillment prep:"}
          </span>{" "}
          {isPickupOrder
            ? `we will notify you when it is ready, usually by ${formatDate(expectedDate)}.`
            : `we will send tracking as soon as it ships, usually by ${formatDate(expectedDate)}.`}
        </li>
        <li>
          <span className="font-medium text-foreground">3. Need help:</span>{" "}
          email{" "}
          <a className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </li>
      </ol>
    </div>
  )
}

export default NextSteps
