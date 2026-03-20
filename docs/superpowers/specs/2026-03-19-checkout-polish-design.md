# Checkout Polish — Design Spec

**Date:** 2026-03-19
**Branch:** `feat/checkout-polish`
**Scope:** 4 launch-blocking fixes + 4 polish items across cart/checkout flows
**Dependencies:** None (no backend changes, no new npm packages)

---

## Overview

The checkout flow is ~70% launch-ready. Cart and account are solid. This spec addresses 4 UX gaps that will lose sales and 4 polish items that make the experience feel professional.

**Success criteria:** A customer in any allowed state can complete checkout with clear feedback at every step. A customer in a blocked state learns immediately (not after 20 minutes of shopping) that shipping is restricted, with a graceful explanation and the option to ship elsewhere.

---

## Task 0 — Geo-Aware Blocked-State Warning

### Problem
A visitor from Tennessee can browse for 20 minutes, fill their cart, start checkout, and only then discover we can't ship to them. This is a terrible experience.

### Solution
Three-layer soft warning system using Vercel's free geo headers. No third-party APIs, no browser geolocation prompts, no latency.

### Files

**`src/lib/constants/shipping.ts`** (modify)
- Export `BLOCKED_SHIPPING_STATES` (currently `const`, change to `export const`)
- Add `BLOCKED_SHIPPING_STATE_CODES` — a `Set<string>` of 2-letter codes, **derived** from `BLOCKED_SHIPPING_STATES`:
  ```typescript
  import { US_STATES } from "./us-states"
  const NAME_TO_CODE = new Map(US_STATES.map(s => [s.label, s.value]))
  export const BLOCKED_SHIPPING_STATE_CODES = new Set(
    [...BLOCKED_SHIPPING_STATES].map(name => NAME_TO_CODE.get(name)).filter((c): c is string => !!c)
  )
  ```
- Add `blockedStateName(code: string): string | null` helper:
  ```typescript
  export function blockedStateName(code: string): string | null {
    if (!BLOCKED_SHIPPING_STATE_CODES.has(code)) return null
    return STATE_CODE_TO_NAME[code] ?? null
  }
  ```

**`src/lib/constants/us-states.ts`** (modify)
- Export a `STATE_CODE_TO_NAME` map: `Record<string, string>` built from the existing `US_STATES` array
- Used by `blockedStateName()` and the geo warning banner

**`src/middleware.ts`** (modify)
- After the existing `x-vercel-ip-country` read (line 83), also read `x-vercel-ip-country-region`
- **Guard:** Only set the `geo_region` cookie if the header is present and non-empty (it is absent in local dev and non-Vercel deploys — the geo warning simply won't appear, which is fine)
- Set a `geo_region` cookie on **every** response path with the 2-letter state code (e.g., `TN`)
- Cookie: `{ maxAge: 60 * 60 * 24, sameSite: 'lax', path: '/' }`
- Must be set on ALL three middleware response paths:
  1. Line 261-263: returning visitor with cache ID (`nextWithSecurityHeaders()`)
  2. Line 267-273: first visit with country code in URL (redirect + set cache ID)
  3. Line 288-294: no country code in URL (redirect to region)
- Create a helper like `withGeoCookie(response, request)` to avoid repeating the logic

**`src/components/layout/age-gate.tsx`** (modify)
- After user confirms 21+, check `geo_region` cookie via `document.cookie`
- If the code is in `BLOCKED_SHIPPING_STATE_CODES`, show an amber info box before closing:
  - Heading: "Shipping notice"
  - Body: "We're unable to ship hemp products to {State Name} due to state regulations. You can still shop and ship to friends or family in any of our {ALLOWED_SHIPPING_STATES.length} approved states."
  - Link: "View shipping states →" linking to `/content/shipping-returns`
  - "Continue browsing" button dismisses the gate
- If not blocked, age gate closes normally (no change to happy path)

**`src/components/layout/geo-warning-banner.tsx`** (new)
- Client component, reads `geo_region` cookie
- If blocked state and not dismissed this session:
  - Thin amber bar: `bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800`
  - Text: "Hemp shipping is unavailable in {State}. You can still ship to approved states. [View states →]"
  - Dismiss X button → sets `sessionStorage.setItem('geo_banner_dismissed', '1')`
- Returns null if not blocked or dismissed
- Fixed above topbar (adjusts layout via CSS variable or DOM order)

**`src/components/layout/app-shell.tsx`** or equivalent layout (modify)
- Render `<GeoWarningBanner />` above the topbar

### VPN Behavior
- VPN showing wrong state → user gets false warning, ignores it, checks out fine with real address
- VPN hiding real state → user bypasses warning, caught at address step (Task 3)
- Geo layer is courtesy UX only; address validation is the hard gate

---

## Task 1 — Review Step Order Summary

### Problem
The review step shows only T&C text and a "Place Order" button. Users click blind without seeing what they're buying, where it's going, or what they're paying.

### Solution
Add a complete order summary above the T&C text and payment button.

### Files

**`src/modules/checkout/components/review/index.tsx`** (modify)
- Add three summary blocks above the existing T&C paragraph:
  1. **Ship to** — `cart.shipping_address`: name, address_1, address_2, city, province, postal_code
  2. **Delivery** — `cart.shipping_methods[last]`: method name + formatted amount
  3. **Payment** — If `paidByGiftcard` (gift cards cover full total), show "Gift card". Otherwise show "Card on file" (Authorize.Net opaque data tokens do not contain card details like last-4 digits, so always use this fallback)
- Each block: label in `text-xs uppercase tracking-wide text-muted-foreground`, value in `text-sm text-foreground`
- Separated by a subtle divider

- Add a collapsible **Order items** section:
  - Each line item: thumbnail (48×48), title, variant options, `qty × unit_price`
  - Below items: reuse `CartTotals` component from `src/modules/common/components/cart-totals/` (expects prop shape: `{ total, subtotal, tax_total, shipping_total, discount_total, gift_card_total, currency_code, shipping_methods }`)
  - Default state: collapsed if > 3 items, expanded if ≤ 3
  - Toggle: "{N} items · {total}" button

- All data comes from the existing `cart` prop — zero new data fetching

### Cart type reference
```typescript
cart.shipping_address: { first_name, last_name, address_1, address_2, city, province, postal_code, country_code }
cart.shipping_methods[]: { name, amount }
cart.payment_collection.payment_sessions[]: { provider_id, data }
cart.items[]: { title, thumbnail, quantity, unit_price, variant { title, options } }
```

---

## Task 2 — Authorize.Net Payment Error Mapping

### Problem
Payment failures show raw backend error messages like "Could not complete order. Please try again." Users don't know if their card was declined, expired, or had a wrong CVV.

### Solution
Map Authorize.Net response codes to human-friendly messages.

### Files

**`src/lib/util/payment-errors.ts`** (new)
```typescript
const ANET_ERROR_MAP: Record<string, string> = {
  "2":  "Your card was declined. Please try another card or contact your bank.",
  "3":  "There was an error processing your card. Please try again.",
  "4":  "Your card has been flagged for review. Please try another card.",
  "6":  "Invalid card number. Please double-check and try again.",
  "7":  "Your card has expired. Please use a different card.",
  "8":  "Your card has expired. Please use a different card.",
  "11": "This transaction was already submitted. Please refresh and try again.",
  "27": "Address verification failed. Please check your billing address.",
  "44": "CVV mismatch. Please check the security code on your card.",
  "45": "AVS and CVV check failed. Please verify your card details.",
  "65": "Your card has exceeded its credit limit.",
  "78": "Invalid CVV. Please check the 3-digit code on the back of your card.",
  "152": "Transaction pending review. Please wait or try another card.",
  "253": "Transaction could not be processed. Please try another card.",
}

export function mapPaymentError(rawError: string | null | undefined): string {
  if (!rawError) return "Payment could not be processed. Please try again."

  // Try to extract ANET response code from error message
  const codeMatch = rawError.match(/response_code[=:]\s*(\d+)/i)
    ?? rawError.match(/code[=:]\s*["']?(\d+)/i)
    ?? rawError.match(/E(\d{5})/i)

  if (codeMatch) {
    const mapped = ANET_ERROR_MAP[codeMatch[1]]
    if (mapped) return mapped
  }

  // Keyword fallback for errors without codes
  const lower = rawError.toLowerCase()
  if (lower.includes("decline")) return ANET_ERROR_MAP["2"]
  if (lower.includes("expired")) return ANET_ERROR_MAP["7"]
  if (lower.includes("cvv") || lower.includes("security code")) return ANET_ERROR_MAP["78"]
  if (lower.includes("insufficient")) return ANET_ERROR_MAP["65"]

  return "Payment could not be processed. Please try again or use a different card."
}
```

**`src/modules/checkout/components/payment-button/index.tsx`** (modify)
- Import `mapPaymentError`
- In `AuthorizeNetPaymentButton.completeCart()` catch blocks:
  - Replace `setErrorMessage(msg)` with `setErrorMessage(mapPaymentError(msg))`
  - Replace `setErrorMessage(err.message)` with `setErrorMessage(mapPaymentError(err.message))`
  - Replace `setErrorMessage("Could not complete order")` with `setErrorMessage(mapPaymentError(null))`

---

## Task 3 — Address Step Blocked-State Intercept

### Problem
User can fill out an entire shipping address for a blocked state before learning we can't ship there. With the geo banner (Task 0) most users will know, but this is the hard gate.

### Solution
Inline validation when the state/province field is set to a blocked state.

### Files

**`src/modules/checkout/components/shipping-address/index.tsx`** (modify)
- Import `BLOCKED_SHIPPING_STATE_CODES`, `blockedStateName` from `@lib/constants/shipping`
- After the province `<NativeSelect>` / state selector, add a conditional error block:
  ```tsx
  {isBlockedState && (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      We're unable to ship hemp products to {stateName}. Online hemp sales
      are restricted by state law. You may ship to a different state.
    </div>
  )}
  ```
- Compute `isBlockedState` from the current province form value:
  ```typescript
  const provinceValue = formData["shipping_address.province"]
  const isBlockedState = provinceValue && BLOCKED_SHIPPING_STATE_CODES.has(provinceValue.toUpperCase())
  const stateName = isBlockedState ? blockedStateName(provinceValue.toUpperCase()) : null
  ```

**`src/modules/checkout/components/addresses/index.tsx`** (modify)
- Pass `isBlockedState` down or check it before allowing form submission
- Disable "Continue to delivery" button when `isBlockedState` is true
- **Important:** Billing address is intentionally NOT checked against blocked states. A customer in Tennessee may have a TN billing address while shipping a gift to a friend in an allowed state. Only the shipping destination matters for hemp compliance.

---

## Task 4 — Empty Cart Checkout Guard

### Problem
If a user clears their cart mid-checkout (or their session expires), the checkout page renders with no items and no graceful redirect.

### Solution
Server-side redirect in the checkout form when cart has zero items.

### Files

**`src/modules/checkout/templates/checkout-form/index.tsx`** (modify)
- After the existing `if (!cart) return null` check, add:
  ```typescript
  if (!cart.items || cart.items.length === 0) {
    redirect(`/${countryCode}/cart`)
  }
  ```
- Import `redirect` from `next/navigation`
- `countryCode` must be passed as a prop from the checkout page component (where `params.countryCode` is available)

**`src/app/[countryCode]/(checkout)/checkout/page.tsx`** (modify)
- Pass `countryCode={params.countryCode}` to `<CheckoutForm>`
- Update `CheckoutForm` props type to include `countryCode: string`

**Note:** In practice, `deleteLineItem` → `clearCart()` usually removes the cart ID cookie before the user could reach checkout with zero items. This guard is for edge cases: session expiry, race conditions, or direct URL navigation to `/checkout` with an empty cart.

---

## Task 5 — Shipping Delivery Estimates (Polish)

### Problem
Shipping methods show name and price but no estimated delivery timeframe.

### Solution
Add estimated delivery text based on service type keywords.

### Files

**`src/lib/constants/shipping.ts`** (modify)
- Add `DELIVERY_ESTIMATE_MAP`:
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

  export function getDeliveryEstimate(serviceName: string): string | null {
    const lower = serviceName.toLowerCase()
    for (const [key, estimate] of Object.entries(DELIVERY_ESTIMATE_MAP)) {
      if (lower.includes(key)) return estimate
    }
    return null
  }
  ```

**`src/modules/checkout/components/shipping/index.tsx`** (modify)
- Import `getDeliveryEstimate`
- In the shipping option select items + rate display area, show estimate as muted text:
  ```tsx
  {estimate && <span className="text-xs text-muted-foreground">{estimate}</span>}
  ```

---

## Task 6 — Authorize.Net Dark Mode (Polish)

### Problem
Card input styles are hardcoded: `fontSize: "16px", color: "#424770"`. Ignores indica (dark) theme.

### Solution
Read CSS custom properties at render time and pass to Accept.js.

### Files

**`src/modules/checkout/components/payment/index.tsx`** (modify)
- Replace hardcoded color values with computed styles:
  ```typescript
  const computedStyle = typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement)
    : null

  const resolve = (varName: string, fallback: string): string => {
    const raw = computedStyle?.getPropertyValue(varName)?.trim()
    return raw ? `hsl(${raw})` : fallback
  }

  const cardStyles = {
    fontSize: "16px",
    color: resolve('--foreground', "#424770"),
    placeholder: resolve('--muted-foreground', "#aab7c4"),
    invalid: resolve('--destructive', "#9e2146"),
  }
  ```
- **Required:** CSS vars in this project are bare HSL triplets (e.g., `137 55% 22%`), NOT valid CSS color strings. Accept.js injects values directly into a `<style>` tag inside an iframe. The `hsl()` wrapper is mandatory — without it, card inputs will have no visible text. The `resolve()` helper above handles this.
- `getComputedStyle` resolves all `var()` references, so chained vars like `--foreground: var(--brand-forest)` work correctly.

---

## Task 7 — Gift Card Dead Code Cleanup (Polish)

### Problem
`applyGiftCard()` and `removeGiftCard()` in `src/lib/data/cart.ts` are empty stubs with no implementation.

### Solution
Remove the stub functions and add a deferred note.

### Files

**`src/lib/data/cart.ts`** (modify)
- Delete `applyGiftCard`, `removeGiftCard`, and `removeDiscount` stub function bodies (all empty/no-op)
- Replace with: `// Gift card + discount removal deferred to post-launch — see vault decision log`
- Search for any imports of these functions and remove them
- If any UI components reference them, remove those references (expected: none based on audit)

---

## Task 8 — First Purchase Discount Response Hardening (Polish)

### Problem
First purchase discount component uses fragile string matching to detect eligibility:
```typescript
const combined = `${status} ${message} ${reason}`
if (containsAny(combined, ["not eligible", "isn't eligible", ...]))
```
If the backend changes wording, detection breaks.

### Solution
Check typed response fields first, fall back to string matching.

### Files

**`src/modules/checkout/components/first-purchase-discount/index.tsx`** (modify)
- Add typed field checks before string matching:
  ```typescript
  // Prefer typed fields from backend response
  if (response.eligible === false) return "not-eligible"
  if (response.already_applied === true) return "already-applied"
  if (response.disabled === true) return "disabled"

  // Fallback to string matching for backward compat
  const combined = `${status} ${message} ${reason}`
  // ... existing logic
  ```
- Add TypeScript interface for the expected response shape
- Log a warning when falling back to string matching (dev only) so we notice if backend isn't sending typed fields

---

## Execution Order

```
Task 0 (geo warning) ──┐
                        ├──→ Task 3 (address intercept, needs BLOCKED_SHIPPING_STATE_CODES from T0)
Task 1 (review summary) ┘

Task 2 (payment errors) ──── independent
Task 4 (empty cart guard) ── independent

Task 5 (delivery estimates) ─┐
Task 6 (dark mode payment) ──┤── all independent, can parallel
Task 7 (gift card cleanup) ──┤
Task 8 (first purchase) ─────┘
```

**Parallelizable groups:**
- Group A: Tasks 0 + 1 (then Task 3 after T0 merges)
- Group B: Tasks 2 + 4
- Group C: Tasks 5 + 6 + 7 + 8

## Validation Gate

After all tasks:
```bash
yarn lint && yarn build && yarn check:commerce-rules
```

All must pass before merging `feat/checkout-polish` to main.

---

## Out of Scope

- Product-level state filtering (separate decision: `02-Decisions/2026-03-19-product-level-compliance-filtering.md`)
- Gift card full implementation (post-launch)
- Profile email update (broken, separate ticket)
- International shipping
- Real-time order tracking via ShipStation webhooks (account polish, not checkout)
