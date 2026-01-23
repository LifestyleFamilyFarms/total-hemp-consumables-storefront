import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
  currentStep,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  currentStep: string
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  const stepOrder = ["address", "delivery", "payment", "review"]
  const stepIndex = stepOrder.indexOf(currentStep)

  return (
    <div className="w-full grid grid-cols-1 gap-y-10">
      {stepIndex >= 0 && stepIndex >= 0 && (
        <Addresses cart={cart} customer={customer} />
      )}

      {stepIndex >= 1 && (
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      )}

      {stepIndex >= 2 && (
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      )}

      {stepIndex >= 3 && <Review cart={cart} />}
    </div>
  )
}
