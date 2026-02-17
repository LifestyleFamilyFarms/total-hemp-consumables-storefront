import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const salesPersonCode =
    typeof order.metadata?.sales_person_code === "string" ||
    typeof order.metadata?.sales_person_code === "number"
      ? String(order.metadata.sales_person_code)
      : null

  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <p>
        We have sent the order confirmation details to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </p>
      <p className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </p>
      <p className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </p>
      {salesPersonCode && (
        <p className="mt-2 text-ui-fg-subtle">
          Sales rep:{" "}
          <span className="font-semibold">{salesPersonCode}</span>
        </p>
      )}

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <p>
              Order status:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </p>
            <p>
              Payment status:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
