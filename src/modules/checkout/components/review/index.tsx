"use client"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import SectionCard from "../section-card"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <SectionCard
      title="Review"
      description="Confirm everything looks good before placing your order."
    >
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <p className="text-sm font-medium leading-6 text-foreground">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
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
