"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import {
  applyFirstPurchaseDiscount,
  FirstPurchaseDiscountResponse,
} from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Expected shape of the first-purchase discount API response.
 * Typed fields are checked first; string matching is a backward-compat fallback.
 */
interface FirstPurchaseDiscountFields {
  applied?: boolean
  eligible?: boolean
  already_applied?: boolean
  disabled?: boolean
  status?: string
  message?: string
  reason?: string
  promotion_code?: string
}

type FirstPurchaseStatus =
  | "idle"
  | "loading"
  | "success"
  | "already-applied"
  | "not-eligible"
  | "disabled"
  | "error"

type FirstPurchaseDiscountProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StoreCartPromotion[]
  }
}

const promotionCode = (promotion: HttpTypes.StoreCartPromotion) =>
  typeof promotion.code === "string" ? promotion.code.toUpperCase() : ""

const hasFirstPurchasePromotion = (promotions: HttpTypes.StoreCartPromotion[] = []) =>
  promotions.some((promotion) => promotionCode(promotion).includes("FIRST_PURCHASE"))

const firstPurchasePromotionCode = (promotions: HttpTypes.StoreCartPromotion[] = []) =>
  promotions
    .map(promotionCode)
    .find((code) => Boolean(code && code.includes("FIRST_PURCHASE"))) || null

const containsAny = (value: string, patterns: string[]) =>
  patterns.some((pattern) => value.includes(pattern))

const parseStatusFromResponse = (
  response: FirstPurchaseDiscountResponse
): FirstPurchaseStatus => {
  if (response.applied === true) {
    return "success"
  }

  const status = typeof response.status === "string" ? response.status.toLowerCase() : ""
  const message = typeof response.message === "string" ? response.message.toLowerCase() : ""
  const reason = typeof response.reason === "string" ? response.reason.toLowerCase() : ""

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[FirstPurchaseDiscount] Falling back to string matching for response:",
      { status, message, reason }
    )
  }

  const combined = `${status} ${message} ${reason}`

  if (response.disabled || containsAny(combined, ["disabled", "feature flag"])) {
    return "disabled"
  }

  if (response.already_applied || containsAny(combined, ["discount already applied", "already applied"])) {
    return "already-applied"
  }

  if (
    response.eligible === false ||
    containsAny(combined, [
      "not eligible",
      "isn't eligible",
      "is not eligible",
      "only be applied",
      "no previous orders",
      "already placed an order",
      "existing order",
      "has existing orders",
      "already has at least one order",
      "cart is not assigned to a customer",
      "first-purchase discounts on your own cart",
      "first purchase discount can only",
    ])
  ) {
    return "not-eligible"
  }

  return "error"
}

export default function FirstPurchaseDiscount({ cart }: FirstPurchaseDiscountProps) {
  const router = useRouter()

  const alreadyApplied = useMemo(
    () => hasFirstPurchasePromotion(cart.promotions || []),
    [cart.promotions]
  )
  const existingPromotionCode = useMemo(
    () => firstPurchasePromotionCode(cart.promotions || []),
    [cart.promotions]
  )

  const [status, setStatus] = useState<FirstPurchaseStatus>(
    cart.id ? (alreadyApplied ? "already-applied" : "idle") : "disabled"
  )
  const [message, setMessage] = useState<string | null>(
    alreadyApplied ? "First-purchase discount is already applied." : null
  )
  const [appliedCode, setAppliedCode] = useState<string | null>(existingPromotionCode)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let active = true

    retrieveCustomer()
      .then((customer) => {
        if (!active) {
          return
        }

        setIsAuthenticated(Boolean(customer?.id))
      })
      .finally(() => {
        if (active) {
          setIsAuthChecked(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const requiresAuth = !isAuthenticated

  const isActionDisabled =
    !isAuthChecked ||
    requiresAuth ||
    status === "loading" ||
    status === "disabled" ||
    status === "already-applied" ||
    !cart.id

  const handleApplyDiscount = async () => {
    if (!cart.id) {
      setStatus("disabled")
      setMessage("First-purchase discount is disabled until a cart is available.")
      return
    }

    setStatus("loading")
    setMessage(null)

    try {
      const response = await applyFirstPurchaseDiscount(cart.id)
      const nextStatus = parseStatusFromResponse(response)
      const nextCode =
        typeof response.promotion_code === "string" && response.promotion_code.trim()
          ? response.promotion_code.trim()
          : null

      setStatus(nextStatus)
      setAppliedCode(nextCode)
      setMessage(
        (typeof response.message === "string" && response.message) ||
          (typeof response.reason === "string" && response.reason) ||
          (nextStatus === "success"
            ? "First-purchase discount applied."
            : nextStatus === "already-applied"
              ? "First-purchase discount is already applied."
              : nextStatus === "not-eligible"
                ? "You are not eligible for the first-purchase discount."
                : "First-purchase discount is currently unavailable.")
      )

      if (nextStatus === "success") {
        setTimeout(() => {
          router.refresh()
        }, 1200)
      }
    } catch (error: any) {
      const fallback = error?.message ?? "Unable to apply first-purchase discount."
      const normalized = String(fallback).toLowerCase()

      if (normalized.includes("already")) {
        setStatus("already-applied")
      } else if (
        normalized.includes("not eligible") ||
        normalized.includes("is not eligible") ||
        normalized.includes("first purchase") ||
        normalized.includes("no previous orders") ||
        normalized.includes("already placed an order") ||
        normalized.includes("existing order") ||
        normalized.includes("already has at least one order") ||
        normalized.includes("cart is not assigned to a customer")
      ) {
        setStatus("not-eligible")
      } else if (normalized.includes("disabled")) {
        setStatus("disabled")
      } else {
        setStatus("error")
      }

      setMessage(fallback)
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border/30 bg-card p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
          First purchase
        </p>
        <h3 className="text-sm font-semibold text-foreground">
          Apply first-purchase discount
        </h3>
      </div>

      {requiresAuth ? (
        <div
          className="space-y-2 rounded-xl border border-border/60 bg-background/75 p-3"
          data-testid="first-purchase-auth-required"
        >
          <p className="text-xs text-foreground/75">
            Sign in to check first-purchase discount eligibility.
          </p>
          <LocalizedClientLink href="/account">
            <Button size="sm" variant="secondary">
              Sign in
            </Button>
          </LocalizedClientLink>
        </div>
      ) : null}

      {!isAuthChecked ? (
        <p className="text-xs text-foreground/75" data-testid="first-purchase-auth-checking">
          Checking sign-in status...
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        onClick={handleApplyDiscount}
        disabled={isActionDisabled}
        data-testid="first-purchase-action-button"
      >
        {status === "loading" ? (
          <span className="inline-flex items-center gap-2">
            <BrandSpinner />
            Applying...
          </span>
        ) : status === "already-applied" ? (
          "Already applied"
        ) : status === "disabled" ? (
          "Discount unavailable"
        ) : (
          "Apply first-purchase discount"
        )}
      </Button>

      {status === "idle" && !requiresAuth ? (
        <p className="text-xs text-foreground/80" data-testid="first-purchase-idle-copy">
          Check whether your cart qualifies for a first-purchase discount.
        </p>
      ) : null}

      {status === "success" ? (
        <div className="space-y-1" data-testid="first-purchase-success-state">
          <p className="text-xs text-foreground/80">{message || "Discount applied."}</p>
          {appliedCode ? (
            <p className="text-xs text-foreground/70">Promotion code: {appliedCode}</p>
          ) : null}
        </div>
      ) : null}

      {status === "not-eligible" ? (
        <p className="text-xs text-foreground/80" data-testid="first-purchase-not-eligible-state">
          {message || "Not eligible for first-purchase discount."}
        </p>
      ) : null}

      {status === "already-applied" ? (
        <div className="space-y-1" data-testid="first-purchase-already-applied-state">
          <p className="text-xs text-foreground/80">
            {message || "First-purchase discount already applied."}
          </p>
          {appliedCode ? (
            <p className="text-xs text-foreground/70">Promotion code: {appliedCode}</p>
          ) : null}
        </div>
      ) : null}

      {status === "disabled" ? (
        <p className="text-xs text-foreground/80" data-testid="first-purchase-disabled-state">
          {message || "First-purchase discount is currently disabled."}
        </p>
      ) : null}

      {status === "error" ? (
        <p className="text-xs text-destructive" data-testid="first-purchase-error-state">
          {message}
        </p>
      ) : null}
    </section>
  )
}
