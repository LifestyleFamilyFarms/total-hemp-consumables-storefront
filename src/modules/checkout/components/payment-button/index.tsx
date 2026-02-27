"use client"

import { isAuthorizeNet } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { completeCart as completeCartAction } from "@lib/data/cart"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isAuthorizeNet(paymentSession?.provider_id):
      return (
        <AuthorizeNetPaymentButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    default:
      return (
        <Button
          disabled
          className="h-11 px-6 text-sm font-medium"
        >
          Select a payment method
        </Button>
      )
  }
}

const AuthorizeNetPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const isOrderResponse = (
    response: HttpTypes.StoreCompleteCartResponse
  ): response is Extract<HttpTypes.StoreCompleteCartResponse, { type: "order" }> =>
    response.type === "order"

  const completeCart = async () => {
    try {
      setSubmitting(true)
      const cartId = cart?.id
      if (!cartId) {
        throw new Error("No cart id found when completing order")
      }
      const result = await completeCartAction(cartId)
      if (isOrderResponse(result) && result.order?.id) {
        router.refresh()
        const order = result.order
        const country =
          order?.shipping_address?.country_code?.toLowerCase() ||
          "us"
        router.push(`/${country}/order/${order.id}/confirmed`)
      } else {
        if (!isOrderResponse(result)) {
          const msg =
            result.error?.message || "Could not complete order. Please try again."
          setErrorMessage(msg)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Could not complete order")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    void completeCart()
  }

  return (
    <>
      <Button
        disabled={notReady || submitting}
        onClick={handlePayment}
        className="h-11 px-6 text-sm font-medium"
        data-testid={dataTestId ?? "submit-order-button"}
      >
        {submitting && <BrandSpinner className="mr-2" />}
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="authorizenet-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
