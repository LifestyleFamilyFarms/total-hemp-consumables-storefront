# Checkout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 launch-blocking checkout UX gaps and 4 polish items so customers in allowed states get clear feedback at every step, and blocked-state visitors learn immediately that shipping is restricted.

**Architecture:** Layered compliance system — middleware sets a geo cookie from Vercel headers, age gate and banner read it for soft warnings, address step validates for hard blocks. Review step gets a full order summary. Payment errors get human-friendly mappings. All changes are frontend-only with zero backend modifications.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Medusa.js v2, Authorize.Net (Accept.js via `authorizenet-react`), Vercel Edge Runtime

**Spec:** `docs/superpowers/specs/2026-03-19-checkout-polish-design.md`

---

## File Map

| File | Action | Task | Purpose |
|------|--------|------|---------|
| `src/lib/constants/us-states.ts` | Modify | 1 | Add `STATE_CODE_TO_NAME` lookup map |
| `src/lib/constants/shipping.ts` | Modify | 1, 5 | Export blocked states, add code set, delivery estimates |
| `src/middleware.ts` | Modify | 2 | Read geo header, set `geo_region` cookie |
| `src/components/layout/age-gate.tsx` | Modify | 3 | Show shipping notice for blocked states |
| `src/components/layout/geo-warning-banner.tsx` | Create | 3 | Persistent amber banner for blocked-state visitors |
| `src/components/layout/app-shell.tsx` | Modify | 3 | Render geo warning banner above topbar |
| `src/modules/checkout/components/review/index.tsx` | Modify | 4 | Full order summary before Place Order |
| `src/lib/util/payment-errors.ts` | Create | 5 | ANET error code → human message map |
| `src/modules/checkout/components/payment-button/index.tsx` | Modify | 5 | Wire mapped payment errors |
| `src/modules/checkout/components/shipping-address/index.tsx` | Modify | 6 | Blocked-state inline error |
| `src/modules/checkout/components/addresses/index.tsx` | Modify | 6 | Disable submit for blocked states |
| `src/app/[countryCode]/(checkout)/checkout/page.tsx` | Modify | 7 | Pass countryCode to CheckoutForm |
| `src/modules/checkout/templates/checkout-form/index.tsx` | Modify | 7 | Empty cart redirect guard |
| `src/modules/checkout/components/shipping/index.tsx` | Modify | 8 | Show delivery estimates |
| `src/modules/checkout/components/payment-container/index.tsx` | Modify | 9 | Dark mode card input styles |
| `src/lib/data/cart.ts` | Modify | 10 | Remove dead gift card stubs |
| `src/modules/checkout/components/first-purchase-discount/index.tsx` | Modify | 11 | Typed response checks before string matching |

---

## Task 1: State Code Lookup + Blocked State Codes

**Files:**
- Modify: `src/lib/constants/us-states.ts`
- Modify: `src/lib/constants/shipping.ts`

- [ ] **Step 1: Add STATE_CODE_TO_NAME to us-states.ts**

Open `src/lib/constants/us-states.ts` and add after the `US_STATES` array:

```typescript
/** Lookup: 2-letter code → full state name. Built from US_STATES. */
export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  US_STATES.map((s) => [s.value, s.label])
)
```

- [ ] **Step 2: Export BLOCKED_SHIPPING_STATES and add derived code set**

Open `src/lib/constants/shipping.ts`. Change `const BLOCKED_SHIPPING_STATES` to `export const BLOCKED_SHIPPING_STATES`.

Then make two changes:

**At the top of the file** (before the doc comment), add the import:

```typescript
import { US_STATES, STATE_CODE_TO_NAME } from "./us-states"
```

**After the `BLOCKED_SHIPPING_STATES` set** (around line 23), add the derived constants:

```typescript
const NAME_TO_CODE = new Map(US_STATES.map((s) => [s.label, s.value]))

/** 2-letter codes for all blocked shipping states. Derived from BLOCKED_SHIPPING_STATES. */
export const BLOCKED_SHIPPING_STATE_CODES = new Set(
  [...BLOCKED_SHIPPING_STATES]
    .map((name) => NAME_TO_CODE.get(name))
    .filter((c): c is string => !!c)
)

/** Returns full state name if the code is blocked, null otherwise. */
export function blockedStateName(code: string): string | null {
  if (!BLOCKED_SHIPPING_STATE_CODES.has(code.toUpperCase())) return null
  return STATE_CODE_TO_NAME[code.toUpperCase()] ?? null
}
```

Note: `STATE_CODE_TO_NAME` comes from the same `us-states` module added in Step 1.

- [ ] **Step 3: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants/us-states.ts src/lib/constants/shipping.ts
git commit -m "feat(compliance): add blocked state code set and lookup helpers"
```

---

## Task 2: Middleware Geo Cookie

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Add withGeoCookie helper**

Open `src/middleware.ts`. Add this helper function after the `withRepCookie` function (around line 243):

```typescript
const withGeoCookie = (res: NextResponse, req: NextRequest) => {
  const region = req.headers.get("x-vercel-ip-country-region")?.toUpperCase()
  if (region && region.length === 2) {
    res.cookies.set("geo_region", region, {
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      path: "/",
    })
  }
  return res
}
```

- [ ] **Step 2: Wire withGeoCookie into all response paths**

There are 5 places where responses are returned. Add `withGeoCookie` to each:

**Path 1 — Maintenance mode (line ~221-222):** Change:
```typescript
return setSecurityHeaders(NextResponse.redirect(url, 307))
```
to:
```typescript
return withGeoCookie(setSecurityHeaders(NextResponse.redirect(url, 307)), request)
```

**Path 2 — Has country code + has cache ID (line ~261-263):** Change:
```typescript
const res = nextWithSecurityHeaders()
return withRepCookie(res)
```
to:
```typescript
const res = nextWithSecurityHeaders()
return withRepCookie(withGeoCookie(res, request))
```

**Path 3 — Has country code + no cache ID (line ~267-273):** Add `withGeoCookie` before the return. Change:
```typescript
setSecurityHeaders(response)
return withRepCookie(response)
```
to:
```typescript
setSecurityHeaders(response)
return withRepCookie(withGeoCookie(response, request))
```

**Path 4 — No country code (line ~288-294):** Change:
```typescript
setSecurityHeaders(response)
return withRepCookie(response)
```
to:
```typescript
setSecurityHeaders(response)
return withRepCookie(withGeoCookie(response, request))
```

**Path 5 — Static assets (line ~277-280):** Change:
```typescript
const res = nextWithSecurityHeaders()
return withRepCookie(res)
```
to:
```typescript
const res = nextWithSecurityHeaders()
return withRepCookie(withGeoCookie(res, request))
```

- [ ] **Step 3: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds. In local dev, `x-vercel-ip-country-region` will be absent so no cookie is set — this is correct.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(compliance): set geo_region cookie from Vercel geo headers"
```

---

## Task 3: Age Gate Shipping Notice + Geo Warning Banner

**Files:**
- Modify: `src/components/layout/age-gate.tsx`
- Create: `src/components/layout/geo-warning-banner.tsx`
- Modify: `src/components/layout/app-shell.tsx`

- [ ] **Step 1: Add geo-aware notice to age gate**

Open `src/components/layout/age-gate.tsx`. Add imports at top:

```typescript
import { BLOCKED_SHIPPING_STATE_CODES, ALLOWED_SHIPPING_STATES, blockedStateName } from "@lib/constants/shipping"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
```

Add a helper to read the cookie (inside the component or above it):

```typescript
function getGeoRegion(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)geo_region=([A-Z]{2})/)
  return match?.[1] ?? null
}
```

Add state for the geo notice phase. Change the component to have a two-phase close: after age confirmation, check geo. Replace the "Yes, I am 21+" button's `onClick` with:

```typescript
const [showGeoNotice, setShowGeoNotice] = useState(false)
const [geoState, setGeoState] = useState<string | null>(null)

const handleAgeConfirm = () => {
  writeStoredTimestamp(getExpiry())
  const region = getGeoRegion()
  if (region && BLOCKED_SHIPPING_STATE_CODES.has(region)) {
    setGeoState(blockedStateName(region) ?? region)
    setShowGeoNotice(true)
  } else {
    setOpen(false)
  }
}
```

Then in the JSX, after the existing button grid, add a conditional geo notice:

```tsx
{showGeoNotice && geoState && (
  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/50">
    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
      Shipping notice
    </p>
    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
      We&apos;re unable to ship hemp products to {geoState} due to state
      regulations. You can still shop and ship to friends or family in any
      of our {ALLOWED_SHIPPING_STATES.length} approved states.
    </p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        onClick={() => setOpen(false)}
      >
        Continue browsing
      </button>
      <LocalizedClientLink
        href="/content/shipping-returns"
        className="text-sm font-medium text-amber-700 underline hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
        onClick={() => setOpen(false)}
      >
        View shipping states →
      </LocalizedClientLink>
    </div>
  </div>
)}
```

Update the "Yes, I am 21+" button to call `handleAgeConfirm` instead of the inline handler. Hide the button grid when `showGeoNotice` is true.

- [ ] **Step 2: Create geo warning banner**

Create `src/components/layout/geo-warning-banner.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { BLOCKED_SHIPPING_STATE_CODES, blockedStateName } from "@lib/constants/shipping"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { X } from "lucide-react"

const DISMISS_KEY = "geo_banner_dismissed"

function getGeoRegion(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)geo_region=([A-Z]{2})/)
  return match?.[1] ?? null
}

export default function GeoWarningBanner() {
  const [visible, setVisible] = useState(false)
  const [stateName, setStateName] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return
    const region = getGeoRegion()
    if (region && BLOCKED_SHIPPING_STATE_CODES.has(region)) {
      setStateName(blockedStateName(region) ?? region)
      setVisible(true)
    }
  }, [])

  if (!visible || !stateName) return null

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  return (
    <div
      className="relative flex items-center justify-center gap-x-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 sm:text-sm"
      role="status"
      aria-label="Shipping restriction notice"
    >
      <p>
        Hemp shipping is unavailable in {stateName}. You can still ship to
        approved states.{" "}
        <LocalizedClientLink
          href="/content/shipping-returns"
          className="font-medium underline hover:text-amber-700 dark:hover:text-amber-100"
        >
          View states
        </LocalizedClientLink>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss shipping notice"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-amber-600 transition hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Add banner to app shell**

Open `src/components/layout/app-shell.tsx`. Add import:

```typescript
import GeoWarningBanner from "@/components/layout/geo-warning-banner"
```

Add `<GeoWarningBanner />` as the first child inside the `<main>` tag, before `<Topbar>`:

```tsx
<main className="shell-surface shell-surface--full relative flex w-full flex-1 flex-col">
  <GeoWarningBanner />
  <Topbar ... />
```

- [ ] **Step 4: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/age-gate.tsx src/components/layout/geo-warning-banner.tsx src/components/layout/app-shell.tsx
git commit -m "feat(compliance): geo-aware shipping notice in age gate and persistent banner"
```

---

## Task 4: Review Step Order Summary

**Files:**
- Modify: `src/modules/checkout/components/review/index.tsx`

- [ ] **Step 1: Rewrite review component with full order summary**

Replace the contents of `src/modules/checkout/components/review/index.tsx` with:

```tsx
"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import CartTotals from "@modules/common/components/cart-totals"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import SectionCard from "../section-card"
import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"

function AddressSummary({ address }: { address: HttpTypes.StoreCartAddress }) {
  return (
    <div className="text-sm text-foreground">
      <p>
        {address.first_name} {address.last_name}
      </p>
      <p>{address.address_1}</p>
      {address.address_2 && <p>{address.address_2}</p>}
      <p>
        {address.city}, {address.province} {address.postal_code}
      </p>
    </div>
  )
}

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  const items: any[] = cart?.items ?? []
  const [itemsExpanded, setItemsExpanded] = useState(items.length <= 3)

  const shippingMethod = cart?.shipping_methods?.at(-1)
  const currencyCode = cart?.currency_code ?? "usd"

  return (
    <SectionCard
      title="Review"
      description="Confirm everything looks good before placing your order."
    >
      {isOpen && previousStepsCompleted && (
        <>
          {/* Order summary */}
          <div className="mb-6 space-y-4 rounded-xl border border-border/60 bg-card/50 p-4">
            {/* Ship to */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ship to
              </p>
              {cart.shipping_address && (
                <AddressSummary address={cart.shipping_address} />
              )}
            </div>

            <div className="h-px bg-border/50" />

            {/* Delivery */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Delivery
              </p>
              <p className="text-sm text-foreground">
                {shippingMethod?.name ?? "Standard shipping"}
                {typeof shippingMethod?.amount === "number" && (
                  <span className="ml-2 text-muted-foreground">
                    {convertToLocale({
                      amount: shippingMethod.amount,
                      currency_code: currencyCode,
                    })}
                  </span>
                )}
              </p>
            </div>

            <div className="h-px bg-border/50" />

            {/* Payment */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment
              </p>
              <p className="text-sm text-foreground">
                {paidByGiftcard ? "Gift card" : "Card on file"}
              </p>
            </div>
          </div>

          {/* Order items */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setItemsExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              data-testid="review-items-toggle"
            >
              <span>
                {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                {convertToLocale({
                  amount: cart?.total ?? 0,
                  currency_code: currencyCode,
                })}
              </span>
              {itemsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {itemsExpanded && (
              <div className="mt-3 space-y-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3"
                    data-testid="review-line-item"
                  >
                    {item.thumbnail && (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/30">
                        <Image
                          src={item.thumbnail}
                          alt={item.title ?? ""}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.variant?.title &&
                        item.variant.title !== item.title && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.title}
                          </p>
                        )}
                    </div>
                    <p className="flex-shrink-0 text-sm text-foreground">
                      {item.quantity} ×{" "}
                      {convertToLocale({
                        amount: item.unit_price ?? 0,
                        currency_code: currencyCode,
                      })}
                    </p>
                  </div>
                ))}

                <div className="mt-4 border-t border-border/50 pt-4">
                  <CartTotals totals={cart} />
                </div>
              </div>
            )}
          </div>

          {/* T&C + Place Order */}
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <p className="text-sm font-medium leading-6 text-foreground">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Total Hemp
                Consumables&apos; Privacy Policy.
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
```

- [ ] **Step 2: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modules/checkout/components/review/index.tsx
git commit -m "feat(checkout): add full order summary to review step"
```

---

## Task 5: Payment Error Mapping + Delivery Estimates

**Files:**
- Create: `src/lib/util/payment-errors.ts`
- Modify: `src/modules/checkout/components/payment-button/index.tsx`
- Modify: `src/lib/constants/shipping.ts`
- Modify: `src/modules/checkout/components/shipping/index.tsx`

- [ ] **Step 1: Create payment error mapping utility**

Create `src/lib/util/payment-errors.ts`:

```typescript
/**
 * Maps Authorize.Net response/reason codes to user-friendly messages.
 * See: https://developer.authorize.net/api/reference/responseCodes.html
 */
const ANET_ERROR_MAP: Record<string, string> = {
  "2": "Your card was declined. Please try another card or contact your bank.",
  "3": "There was an error processing your card. Please try again.",
  "4": "Your card has been flagged for review. Please try another card.",
  "6": "Invalid card number. Please double-check and try again.",
  "7": "Your card has expired. Please use a different card.",
  "8": "Your card has expired. Please use a different card.",
  "11": "This transaction was already submitted. Please refresh and try again.",
  "27": "Address verification failed. Please check your billing address.",
  "44": "CVV mismatch. Please check the security code on your card.",
  "45": "AVS and CVV check failed. Please verify your card details.",
  "65": "Your card has exceeded its credit limit.",
  "78": "Invalid CVV. Please check the 3-digit code on the back of your card.",
  "152": "Transaction pending review. Please wait or try another card.",
  "253": "Transaction could not be processed. Please try another card.",
}

/**
 * Parses a raw payment error (from Authorize.Net via Medusa) and returns
 * a customer-friendly message. Tries code extraction first, then keyword
 * fallback, then generic message.
 */
export function mapPaymentError(rawError: string | null | undefined): string {
  if (!rawError) {
    return "Payment could not be processed. Please try again."
  }

  // Try to extract ANET response code from error message
  const codeMatch =
    rawError.match(/response_code[=:]\s*(\d+)/i) ??
    rawError.match(/code[=:]\s*["']?(\d+)/i) ??
    rawError.match(/E(\d{5})/i)

  if (codeMatch) {
    const mapped = ANET_ERROR_MAP[codeMatch[1]]
    if (mapped) return mapped
  }

  // Keyword fallback for errors without codes
  const lower = rawError.toLowerCase()
  if (lower.includes("decline")) return ANET_ERROR_MAP["2"]
  if (lower.includes("expired")) return ANET_ERROR_MAP["7"]
  if (lower.includes("cvv") || lower.includes("security code"))
    return ANET_ERROR_MAP["78"]
  if (lower.includes("insufficient")) return ANET_ERROR_MAP["65"]

  return "Payment could not be processed. Please try again or use a different card."
}
```

- [ ] **Step 2: Wire payment error mapping into payment button**

Open `src/modules/checkout/components/payment-button/index.tsx`. Add import:

```typescript
import { mapPaymentError } from "@lib/util/payment-errors"
```

In `AuthorizeNetPaymentButton`, modify the `completeCart` function error handling:

Replace line ~87-88:
```typescript
const msg =
  result.error?.message || "Could not complete order. Please try again."
setErrorMessage(msg)
```
with:
```typescript
setErrorMessage(mapPaymentError(result.error?.message))
```

Replace line ~93:
```typescript
setErrorMessage(err.message)
```
with:
```typescript
setErrorMessage(mapPaymentError(err.message))
```

Replace line ~95:
```typescript
setErrorMessage("Could not complete order")
```
with:
```typescript
setErrorMessage(mapPaymentError(null))
```

- [ ] **Step 3: Add delivery estimate map and helper to shipping constants**

Open `src/lib/constants/shipping.ts`. Add at the end of the file (before the `CheckoutShippingMode` section):

```typescript
export const DELIVERY_ESTIMATE_MAP: Record<string, string> = {
  ground: "5–7 business days",
  economy: "5–10 business days",
  priority: "2–3 business days",
  express: "1–2 business days",
  overnight: "Next business day",
  "2day": "2 business days",
  "2-day": "2 business days",
  standard: "3–5 business days",
}

/** Returns an estimated delivery timeframe based on service name keywords, or null. */
export function getDeliveryEstimate(serviceName: string): string | null {
  const lower = serviceName.toLowerCase()
  for (const [key, estimate] of Object.entries(DELIVERY_ESTIMATE_MAP)) {
    if (lower.includes(key)) return estimate
  }
  return null
}
```

- [ ] **Step 4: Show delivery estimates in shipping component**

Open `src/modules/checkout/components/shipping/index.tsx`. Add import:

```typescript
import { getDeliveryEstimate } from "@lib/constants/shipping"
```

Find the `shippingRateExplanation` useMemo (around line 565). After the `shippingRateExplanation` variable, add:

```typescript
const deliveryEstimate = selectedShippingOption?.name
  ? getDeliveryEstimate(selectedShippingOption.name)
  : null
```

Find the shipping rate display area (around line 746-756). There is a `<div>` containing `{shippingRateExplanation}`:

```tsx
<div className="text-xs text-muted-foreground">
  {shippingRateExplanation}
</div>
```

Add a new **sibling** `<div>` immediately AFTER this closing `</div>` (not nested inside it):

```tsx
<div className="text-xs text-muted-foreground">
  {shippingRateExplanation}
</div>
{deliveryEstimate && (
  <div className="text-xs font-medium text-foreground/80">
    Est. delivery: {deliveryEstimate}
  </div>
)}
```

- [ ] **Step 5: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/util/payment-errors.ts src/modules/checkout/components/payment-button/index.tsx src/lib/constants/shipping.ts src/modules/checkout/components/shipping/index.tsx
git commit -m "feat(checkout): payment error mapping and delivery estimates"
```

---

## Task 6: Address Step Blocked-State Intercept

**Files:**
- Modify: `src/modules/checkout/components/shipping-address/index.tsx`
- Modify: `src/modules/checkout/components/addresses/index.tsx`

- [ ] **Step 1: Add blocked-state check to shipping address**

Open `src/modules/checkout/components/shipping-address/index.tsx`. Add import:

```typescript
import { BLOCKED_SHIPPING_STATE_CODES, blockedStateName } from "@lib/constants/shipping"
```

Inside the `ShippingAddress` component, after `const isUsAddress = ...` (around line 108), add:

```typescript
const provinceValue = formData["shipping_address.province"] || ""
const isBlockedState =
  isUsAddress &&
  provinceValue.length > 0 &&
  BLOCKED_SHIPPING_STATE_CODES.has(provinceValue.toUpperCase())
const blockedName = isBlockedState
  ? blockedStateName(provinceValue.toUpperCase())
  : null
```

In the JSX, after the closing `</NativeSelect>` for the province (line ~277) and before the closing `</div>` of that flex-col, add the error block:

```tsx
{isBlockedState && blockedName && (
  <div
    className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    role="alert"
    data-testid="blocked-state-error"
  >
    We&apos;re unable to ship hemp products to {blockedName}. Online
    hemp sales are restricted by state law. You may ship to a
    different state.
  </div>
)}
```

Export `isBlockedState` so the parent can consume it. The simplest approach: since `ShippingAddress` doesn't return state to the parent, add an `onBlockedStateChange` callback prop.

Modify the component function signature from:

```typescript
const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
```

to:

```typescript
const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  onBlockedStateChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
  onBlockedStateChange?: (blocked: boolean) => void
}) => {
```

Add a `useEffect` to report changes:

```typescript
useEffect(() => {
  onBlockedStateChange?.(isBlockedState)
}, [isBlockedState, onBlockedStateChange])
```

- [ ] **Step 2: Disable submit in addresses component when state is blocked**

Open `src/modules/checkout/components/addresses/index.tsx`. Add state:

```typescript
const [shippingBlocked, setShippingBlocked] = useState(false)
```

Pass callback to ShippingAddress:

```tsx
<ShippingAddress
  customer={customer}
  checked={sameAsBilling}
  onChange={toggleSameAsBilling}
  cart={currentCart}
  onBlockedStateChange={setShippingBlocked}
/>
```

Disable the submit button when blocked. Find the `<Button type="submit"` and change:

```tsx
disabled={submitting}
```
to:
```tsx
disabled={submitting || shippingBlocked}
```

Also add a note to the user by adding after the Button if blocked:

```tsx
{shippingBlocked && (
  <p className="text-xs text-destructive" data-testid="blocked-state-submit-hint">
    Change your shipping state to continue.
  </p>
)}
```

Note: Billing address is intentionally NOT checked — a TN billing address shipping to NY is valid.

- [ ] **Step 3: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/modules/checkout/components/shipping-address/index.tsx src/modules/checkout/components/addresses/index.tsx
git commit -m "feat(checkout): block address submission for restricted shipping states"
```

---

## Task 7: Empty Cart Checkout Guard

**Files:**
- Modify: `src/app/[countryCode]/(checkout)/checkout/page.tsx`
- Modify: `src/modules/checkout/templates/checkout-form/index.tsx`

- [ ] **Step 1: Pass countryCode to CheckoutForm**

Open `src/app/[countryCode]/(checkout)/checkout/page.tsx`. Change the `CheckoutForm` render:

```tsx
<CheckoutForm
  cart={cart}
  customer={customer}
  currentStep={currentStep}
  countryCode={params?.countryCode || "us"}
/>
```

- [ ] **Step 2: Add empty cart guard to CheckoutForm**

Open `src/modules/checkout/templates/checkout-form/index.tsx`. Add import:

```typescript
import { redirect } from "next/navigation"
```

Update the component props to accept `countryCode`:

```typescript
export default async function CheckoutForm({
  cart,
  customer,
  currentStep,
  countryCode,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  currentStep: string
  countryCode: string
}) {
```

After `if (!cart) { return null }`, add:

```typescript
if (!cart.items || cart.items.length === 0) {
  redirect(`/${countryCode}/cart`)
}
```

- [ ] **Step 3: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/\\[countryCode\\]/\\(checkout\\)/checkout/page.tsx src/modules/checkout/templates/checkout-form/index.tsx
git commit -m "fix(checkout): redirect to cart page when cart is empty"
```

---

## Task 8: Placeholder — covered in Task 5

Delivery estimates were combined with Task 5 for efficiency. Skip to Task 9.

---

## Task 9: Authorize.Net Dark Mode Card Styles

**Files:**
- Modify: `src/modules/checkout/components/payment-container/index.tsx`

- [ ] **Step 1: Replace hardcoded card input colors with theme-aware values**

Open `src/modules/checkout/components/payment-container/index.tsx`. Find the `<Card>` component's `options` prop (around line 99-112).

Replace the entire `options` object with:

```tsx
options={{
  style: (() => {
    const cs =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null
    const resolve = (v: string, fb: string) => {
      const raw = cs?.getPropertyValue(v)?.trim()
      return raw ? `hsl(${raw})` : fb
    }
    return {
      base: {
        fontSize: "16px",
        color: resolve("--foreground", "#424770"),
        "::placeholder": {
          color: resolve("--muted-foreground", "#aab7c4"),
        },
      },
      invalid: {
        color: resolve("--destructive", "#9e2146"),
      },
    }
  })(),
}}
```

Note: This IIFE runs at render time in the browser. `getComputedStyle` resolves chained CSS vars. The `hsl()` wrapper is mandatory because the project stores CSS vars as bare HSL triplets (e.g., `137 55% 22%`), not as valid CSS color strings.

- [ ] **Step 2: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modules/checkout/components/payment-container/index.tsx
git commit -m "fix(checkout): theme-aware card input colors for dark mode"
```

---

## Task 10: Gift Card Dead Code Cleanup

**Files:**
- Modify: `src/lib/data/cart.ts`

- [ ] **Step 1: Remove stub functions**

Open `src/lib/data/cart.ts`. Find and delete the three stub functions (around lines 470-511):

- `applyGiftCard` (lines ~470-480)
- `removeDiscount` (lines ~482-491)
- `removeGiftCard` (lines ~493-511)

Replace all three with a single comment:

```typescript
// Gift card + discount removal deferred to post-launch
// See vault: 02-Decisions/2026-03-19-product-level-compliance-filtering.md
```

- [ ] **Step 2: Check for imports of removed functions**

Run grep to find any imports:

```bash
grep -rn "applyGiftCard\|removeGiftCard\|removeDiscount" src/ --include="*.tsx" --include="*.ts" | grep -v "cart.ts" | grep -v "node_modules"
```

Expected: No results (audit confirmed no external consumers). If any are found, remove those imports.

- [ ] **Step 3: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/cart.ts
git commit -m "chore: remove dead gift card and discount stubs"
```

---

## Task 11: First Purchase Discount Response Hardening

**Files:**
- Modify: `src/modules/checkout/components/first-purchase-discount/index.tsx`

- [ ] **Step 1: Add typed response checks to parseStatusFromResponse**

Open `src/modules/checkout/components/first-purchase-discount/index.tsx`. Find the `parseStatusFromResponse` function (line ~45).

The function already checks `response.applied`, `response.disabled`, `response.already_applied`, and `response.eligible` as typed fields (lines 48, 57, 61, 66). These checks are already present and correctly ordered before the string matching fallback.

The current implementation is actually better than the spec assumed — it already uses typed fields first and falls back to string matching. The improvement needed is:

1. Add a dev-only warning when falling back to string matching
2. Add a TypeScript interface for clarity

Add this interface near the top of the file (after imports):

```typescript
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
```

In `parseStatusFromResponse`, the typed field checks (`response.applied`, `response.disabled`, `response.already_applied`, `response.eligible`) are at lines 48-83. If none of those short-circuit, execution falls through to `const combined` (line 55) which starts the string matching. Add a dev warning right BEFORE the `const combined` line (line ~55), to log when we're falling through to the fragile string path:

```typescript
if (process.env.NODE_ENV === "development") {
  console.warn(
    "[FirstPurchaseDiscount] Falling back to string matching for response:",
    { status, message, reason }
  )
}
```

- [ ] **Step 2: Verify build**

Run: `yarn build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/modules/checkout/components/first-purchase-discount/index.tsx
git commit -m "fix(checkout): add typed response interface and dev fallback warning for first-purchase discount"
```

---

## Task 12: Validation Gate

- [ ] **Step 1: Run all validation gates**

```bash
yarn lint && yarn build && yarn check:commerce-rules
```

Expected: All three pass with no errors.

- [ ] **Step 2: Verify git status**

```bash
git log --oneline -12
git status
```

Expected: ~10 clean commits on `feat/checkout-polish`, no uncommitted changes.

---

## Execution Order Summary

```
Task 1 (state code lookups) ─── foundation for Tasks 3, 5, 6
Task 2 (middleware geo cookie) ── foundation for Task 3
Task 3 (age gate + banner) ──── depends on Tasks 1, 2
Task 4 (review summary) ─────── independent
Task 5 (payment errors + delivery estimates) ── depends on Task 1 (shipping.ts)
Task 6 (address intercept) ──── depends on Task 1
Task 7 (empty cart guard) ───── independent
Task 9 (dark mode card) ─────── independent
Task 10 (gift card cleanup) ──── independent
Task 11 (first purchase) ────── independent
Task 12 (validation gate) ───── final, after all tasks
```

**Parallelizable:** Tasks 4, 7, 9, 10, 11 are fully independent and can run in any order or in parallel.
