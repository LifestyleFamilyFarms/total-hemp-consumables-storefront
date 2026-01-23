"use client"

import React, { useCallback, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const STEP_ORDER = ["address", "delivery", "payment", "review"] as const
type Step = (typeof STEP_ORDER)[number]

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasCompleteShippingAddress = useMemo(() => {
    const address = cart?.shipping_address

    if (!address) {
      return false
    }

    const requiredFields = [
      address.first_name,
      address.last_name,
      address.address_1,
      address.city,
      address.postal_code,
      address.country_code,
      address.phone,
    ]

    if (requiredFields.some((field) => !field || `${field}`.trim() === "")) {
      return false
    }

    if (
      address.country_code?.toLowerCase() === "us" &&
      (!address.province || `${address.province}`.trim() === "")
    ) {
      return false
    }

    return true
  }, [cart?.shipping_address])

  const hasShippingMethod = (cart?.shipping_methods?.length ?? 0) > 0

  const hasPendingPaymentSession = useMemo(() => {
    return (
      cart?.payment_collection?.payment_sessions?.some(
        (session: any) => session?.status === "pending"
      ) ?? false
    )
  }, [cart?.payment_collection?.payment_sessions])

  const isFreeCheckout = (cart?.total ?? 0) === 0

  const requiredStep: Step = useMemo(() => {
    if (!hasCompleteShippingAddress) {
      return "address"
    }

    if (!hasShippingMethod) {
      return "delivery"
    }

    if (!hasPendingPaymentSession && !isFreeCheckout) {
      return "payment"
    }

    return "review"
  }, [
    hasCompleteShippingAddress,
    hasShippingMethod,
    hasPendingPaymentSession,
    isFreeCheckout,
  ])

  const ensureStep = useCallback(() => {
    const currentStep = searchParams.get("step")
    const requiredIndex = STEP_ORDER.indexOf(requiredStep)

    if (!currentStep) {
      const params = new URLSearchParams(searchParams)
      params.set("step", requiredStep)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      return
    }

    const currentIndex = STEP_ORDER.indexOf(currentStep as Step)

    if (currentIndex === -1 || currentIndex > requiredIndex) {
      const params = new URLSearchParams(searchParams)
      params.set("step", requiredStep)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [pathname, requiredStep, router, searchParams])

  useEffect(() => {
    ensureStep()
  }, [ensureStep])

  return <div>{children}</div>
}

export default PaymentWrapper
