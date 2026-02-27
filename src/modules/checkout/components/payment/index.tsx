"use client"

import { RadioGroup } from "@headlessui/react"
import { isAuthorizeNet, PAYMENT_METHOD_INFO, paymentInfoMap } from "@lib/constants"
import ErrorMessage from "@modules/checkout/components/error-message"
import { AuthorizeNetCardContainer } from "@modules/checkout/components/payment-container"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { createToken } from "authorizenet-react"
import SectionCard from "../section-card"
import { Button } from "@/components/ui/button"
import { CreditCard as CreditCardIcon } from "lucide-react"
import { initiatePaymentSession } from "@lib/data/cart"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type CartSnapshot = {
  shipping_methods: Array<{ amount: number; name: string }>
  billing_address?: Record<string, unknown> | null
  shipping_address?: Record<string, unknown> | null
}

const buildAuthorizeNetCartSnapshot = (cart: any): CartSnapshot | undefined => {
  if (!cart) {
    return undefined
  }

  const shippingMethods =
    cart.shipping_methods?.map((method: any) => ({
      amount: method.amount,
      name:
        method.name ??
        method.shipping_option?.name ??
        "Shipping",
    })) ?? []

  const maybeCopyAddress = (address: any) => {
    if (!address) {
      return null
    }
    const {
      first_name,
      last_name,
      company,
      address_1,
      address_2,
      city,
      postal_code,
      province,
      country_code,
      phone,
    } = address
    return {
      first_name,
      last_name,
      company,
      address_1,
      address_2,
      city,
      postal_code,
      province,
      country_code,
      phone,
    }
  }

  return {
    shipping_methods: shippingMethods,
    billing_address: maybeCopyAddress(cart.billing_address),
    shipping_address: maybeCopyAddress(cart.shipping_address),
  }
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const currentCart = cart
  const authorizeNetMethods = (availablePaymentMethods || []).filter(
    (method) => isAuthorizeNet(method.id)
  )
  const activeSession = currentCart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? authorizeNetMethods.at(0)?.id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isAuthorize = isAuthorizeNet(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {
    const isValidMethod = authorizeNetMethods.some(
      (m) => m.id === method
    )

    if (!isValidMethod) {
      return
    }

    if (method === selectedPaymentMethod) {
      return
    }

    setError(null)
    setCardBrand(null)
    setCardComplete(false)
    setSelectedPaymentMethod(method)

  }

  // No auto-selection to avoid unintended session init flows

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  useEffect(() => {
    if (authorizeNetMethods.length === 0) {
      setSelectedPaymentMethod("")
      return
    }

    const current = authorizeNetMethods.find(
      (method) => method.id === selectedPaymentMethod
    )

    if (!current) {
      setSelectedPaymentMethod(authorizeNetMethods[0].id)
    }
  }, [authorizeNetMethods, selectedPaymentMethod])

  const paymentReady =
    (activeSession && (currentCart?.shipping_methods?.length ?? 0) !== 0) ||
    paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (!selectedPaymentMethod) {
        setError("Select a payment method to continue.")
        return
      }

      const hasActiveForSelected =
        activeSession?.provider_id === selectedPaymentMethod

      if (isAuthorize) {
        if (!hasActiveForSelected) {
          if (!cardComplete) {
            setError("Please complete your card details.")
            return
          }

          const token = await createToken()
          const opaqueData = token?.opaqueData

          if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
            throw new Error("Could not tokenize card. Try again.")
          }

          const authorizeNetCart = buildAuthorizeNetCartSnapshot(currentCart)

          await initiatePaymentSession(currentCart, {
            provider_id: selectedPaymentMethod,
            data: {
              dataDescriptor: opaqueData.dataDescriptor,
              dataValue: opaqueData.dataValue,
              ...(authorizeNetCart ? { cart: authorizeNetCart } : {}),
            },
          })
        }

        router.refresh()
        router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
        return
      }

      router.push(
        pathname + "?" + createQueryString("step", "review"),
        {
          scroll: false,
        }
      )
    } catch (err: any) {
      console.error("[authorize-net] initiatePaymentSession failed", err)
      const message =
        err?.message ||
        err?.response?.messages?.message?.[0]?.text ||
        err?.response?.error?.text ||
        "Something went wrong."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const activeSessionMatchesSelection =
    activeSession?.provider_id === selectedPaymentMethod
  const requiresCardEntry =
    !paidByGiftcard && isAuthorize && !activeSessionMatchesSelection

  return (
    <SectionCard
      title="Payment"
      description="Choose how you want to pay for your order."
      rightAction={
        !isOpen && paymentReady ? (
          <button
            onClick={handleEdit}
            className="text-sm font-medium text-primary hover:text-primary/80"
            data-testid="edit-payment-button"
          >
            Edit
          </button>
        ) : null
      }
      className={
        isOpen
          ? "border-primary/50 bg-primary/10"
          : undefined
      }
    >
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && authorizeNetMethods.length > 0 && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {authorizeNetMethods.map((paymentMethod) => (
                  <AuthorizeNetCardContainer
                    key={paymentMethod.id}
                    paymentProviderId={paymentMethod.id}
                    selectedPaymentOptionId={selectedPaymentMethod}
                    paymentInfoMap={paymentInfoMap}
                    setCardBrand={setCardBrand}
                    setError={setError}
                    setCardComplete={setCardComplete}
                  />
                ))}
              </RadioGroup>
            </>
          )}
          {!paidByGiftcard && authorizeNetMethods.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No supported payment methods are enabled. Contact support.
            </p>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col gap-y-1">
              <p className="text-sm font-medium text-foreground">Payment method</p>
              <p className="text-sm text-muted-foreground" data-testid="payment-method-summary">
                Gift card
              </p>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            className="mt-6 h-11 w-full px-6 text-sm font-medium md:w-auto"
            onClick={handleSubmit}
            disabled={
              (!selectedPaymentMethod && !paidByGiftcard) ||
              (requiresCardEntry && !cardComplete) ||
              isLoading
            }
            data-testid="submit-payment-button"
          >
            {isLoading && <BrandSpinner className="mr-2" />}
            {requiresCardEntry ? "Enter card details" : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="grid gap-6 text-sm md:grid-cols-2">
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-foreground">Payment method</p>
                <p
                  className="text-muted-foreground"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </p>
              </div>
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-foreground">Payment details</p>
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-testid="payment-details-summary"
                >
                  <div className="flex h-7 w-fit items-center rounded-md bg-accent/10 px-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCardIcon className="h-4 w-4" aria-hidden />
                    )}
                  </div>
                  <span>{cardBrand || "Card details ready"}</span>
                </div>
              </div>
            </div>
          ) : !paymentReady && !paidByGiftcard ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Payment not completed</p>
                <p>
                  Your delivery choice is saved. Continue to payment to tokenize
                  your card details and finish checkout.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={handleEdit}
              >
                Continue to payment
              </Button>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col gap-y-1">
              <p className="text-sm font-medium text-foreground">
                Payment method
              </p>
              <p
                className="text-sm text-muted-foreground"
                data-testid="payment-method-summary"
              >
                Gift card
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}

export default Payment
