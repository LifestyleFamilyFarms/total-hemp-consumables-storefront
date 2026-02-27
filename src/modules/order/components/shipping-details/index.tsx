import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const selectedShippingMethod = order.shipping_methods?.[0]

  return (
    <div>
      <h2 className="flex flex-row text-3xl-regular my-6 font-semibold">
        Delivery
      </h2>
      <div className="grid grid-cols-1 gap-6 small:grid-cols-3 small:gap-x-8">
        <div
          className="flex flex-col"
          data-testid="shipping-address-summary"
        >
          <span className="txt-medium-plus text-ui-fg-base mb-1">
            Shipping Address
          </span>
          <span className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </span>
          <span className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </span>
          <span className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </span>
          <span className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </span>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-contact-summary"
        >
          <span className="txt-medium-plus text-ui-fg-base mb-1">Contact</span>
          <span className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </span>
          <span className="txt-medium text-ui-fg-subtle">{order.email}</span>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-method-summary"
        >
          <span className="txt-medium-plus text-ui-fg-base mb-1">Method</span>
          <span className="txt-medium text-ui-fg-subtle">
            {selectedShippingMethod?.name ?? "Not selected"} (
            {convertToLocale({
              amount: selectedShippingMethod?.total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </span>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
