"use client"

import { isAuthorizeNet } from "@lib/constants"
import { HttpTypes } from "@medusajs/types"
import { Loader2 } from "lucide-react"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { completeCart as completeCartAction } from "@lib/data/cart"

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

  const completeCart = async () => {
    try {
      setSubmitting(true)
      const cartId = cart?.id
      if (!cartId) {
        throw new Error("No cart id found when completing order")
      }
      const result = await completeCartAction(cartId)
      if ((result as any)?.type === "order" && (result as any)?.order?.id) {
        router.refresh()
        const order = (result as any).order
        const country =
          order?.shipping_address?.country_code?.toLowerCase() ||
          order?.region?.countries?.[0]?.iso_2 ||
          "us"
        router.push(`/${country}/order/${order.id}/confirmed`)
      } else if ((result as any)?.cart) {
        const msg =
          (result as any)?.error?.message ||
          "Could not complete order. Please try again."
        setErrorMessage(msg)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not complete order")
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
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
