import { US_STATES, STATE_CODE_TO_NAME } from "./us-states"

/**
 * States where we CANNOT ship hemp products.
 *
 * Blocked:
 *   - ID: requires 0.0% THC (not 0.3%), effectively bans all hemp products
 *   - KS, NE, NC, SC, WY: hemp shipping prohibited or unclear legality
 *   - TN: online/delivery hemp sales BANNED effective Jan 1, 2026 (face-to-face only)
 *
 * Medical-only (excluded — we don't have medical licensing):
 *   - SD: medical-only hemp program
 *
 * See hemp-compliance skill for full state-by-state reference.
 */
export const BLOCKED_SHIPPING_STATES = new Set([
  "Idaho",
  "Kansas",
  "Nebraska",
  "North Carolina",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Wyoming",
])

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

/**
 * States requiring extra compliance beyond our baseline 21+ / age-gate:
 *   - NJ: adopted federal 0.4mg total THC cap early (Jan 2026), intoxicating
 *         hemp beverages restricted after April 13, 2026
 *   - AL, AR, MS: medical-only programs — currently allowed but may need
 *         product-level restrictions depending on catalog
 *   - NY: CBD in food/drink banned (fines $250-$600)
 *   - OH: SB 56 (Dec 2025) banned intoxicating hemp products
 *
 * These states are still in ALLOWED_SHIPPING_STATES but need product-level
 * validation at checkout or catalog filtering before launch.
 */
export const EXTRA_COMPLIANCE_STATES = [
  { code: "NJ", label: "New Jersey", note: "0.4mg total THC cap, 21+, beverage restrictions after Apr 2026" },
  { code: "NY", label: "New York", note: "CBD in food/drink banned, fines $250-$600" },
  { code: "OH", label: "Ohio", note: "SB 56 banned intoxicating hemp products Dec 2025" },
  { code: "AL", label: "Alabama", note: "Medical-only program — review product catalog" },
  { code: "AR", label: "Arkansas", note: "Medical-only program — review product catalog" },
  { code: "MS", label: "Mississippi", note: "Medical-only, 20:1 CBD:THC ratio, max 2.5mg THC/mL" },
] as const

export const EXTRA_COMPLIANCE_STATE_CODES = new Set(
  EXTRA_COMPLIANCE_STATES.map((s) => s.code)
)

export const ALLOWED_SHIPPING_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
]

export const ALLOWED_SHIPPING_STATES_LABEL = ALLOWED_SHIPPING_STATES.join(" • ")

const parseEnvAllowlist = (value?: string) => {
  if (!value) {
    return null
  }

  if (value.trim() === "*") {
    return []
  }

  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.toLowerCase())

  return entries.length ? entries : null
}

const ENV_ALLOWLIST = parseEnvAllowlist(
  process.env.NEXT_PUBLIC_SHIPSTATION_SERVICE_ALLOWLIST
)

export const SHIPSTATION_SERVICE_ALLOWLIST =
  ENV_ALLOWLIST === null ? null : ENV_ALLOWLIST

const expandedAllowlistValues = SHIPSTATION_SERVICE_ALLOWLIST
  ? SHIPSTATION_SERVICE_ALLOWLIST.flatMap((entry) => {
      const normalized = entry.toLowerCase()

      if (!normalized.startsWith("shipstation_")) {
        return [normalized]
      }

      const withoutPrefix = normalized.replace(/^shipstation_/, "")

      return withoutPrefix ? [normalized, withoutPrefix] : [normalized]
    })
  : []

export const SHIPSTATION_SERVICE_ALLOWLIST_SET =
  expandedAllowlistValues.length > 0
    ? new Set(expandedAllowlistValues)
    : null

/** Ordered most-specific to least-specific to avoid keyword collisions (e.g. "Priority Express" → express wins). */
export const DELIVERY_ESTIMATE_MAP: Record<string, string> = {
  overnight: "Next business day",
  "2-day": "2 business days",
  "2day": "2 business days",
  express: "1–2 business days",
  priority: "2–3 business days",
  ground: "5–7 business days",
  economy: "5–10 business days",
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

export type CheckoutShippingMode = "pickup_only" | "full"

const resolveCheckoutShippingMode = (): CheckoutShippingMode => {
  const mode = process.env.NEXT_PUBLIC_CHECKOUT_SHIPPING_MODE
    ?.trim()
    .toLowerCase()

  return mode === "full" ? "full" : "pickup_only"
}

export const CHECKOUT_SHIPPING_MODE = resolveCheckoutShippingMode()
