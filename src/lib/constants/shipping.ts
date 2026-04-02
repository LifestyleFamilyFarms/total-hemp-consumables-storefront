import { US_STATES, STATE_CODE_TO_NAME } from "./us-states"

/**
 * States where we CANNOT ship hemp products.
 *
 * Updated 2026-04-02 based on deep compliance research.
 * See hemp-compliance skill and vault reference:
 * 07-References/2026-04-01-hemp-flower-shipping-restrictions-by-state.md
 *
 * CORRECTIONS from previous list:
 *   - REMOVED NE, NC, SC (currently legal — moved to conditional/monitored)
 *   - ADDED AL, CA, HI, IA, IN, KY, LA, TX, UT, WY (all ban smokable hemp)
 *
 * Laws change frequently — legal counsel should review before launch.
 */
export const BLOCKED_SHIPPING_STATES = new Set([
  "Alabama", // HB 445 (Jul 2025) — smokable hemp = Class C felony
  "California", // AB 8 (Jan 2026) — ALL hemp flower/inhalables banned
  "Hawaii", // Admin rules (2020) — smokable hemp flower banned
  "Idaho", // HB 126 — 0.0% THC requirement
  "Indiana", // SEA 516 — smokable hemp = Class A misdemeanor
  "Iowa", // HF 2581 (2020) — ALL inhalable hemp banned
  "Kansas", // HB 2167 — smokable flower/vapes/teas banned
  "Kentucky", // 302 KAR 50:070 — raw flower retail sale banned (B2B only)
  "Louisiana", // Act 752 (Jan 2025) — smokable hemp flower banned
  "South Dakota", // SB 39 (2026) — smokable flower + intoxicating hemp banned
  "Tennessee", // HB 1376 (Jan 2026) — online hemp sales banned (face-to-face only)
  "Texas", // DSHS rules (Mar 31, 2026) — all smokable hemp banned
  "Utah", // State hemp regs — smokable hemp banned (oils/edibles only)
  "Wyoming", // SF 32 (2024) — hostile enforcement, 10th Circuit upheld ban
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
/**
 * IMPORTANT: Total Hemp sells THCA, Delta-9, CBD, AND CBG products.
 * THCA/Delta-9 are intoxicating — they trigger "intoxicating hemp" bans
 * in states that would otherwise allow non-intoxicating CBG.
 *
 * These states need product-level filtering or catalog restrictions.
 * THCA/Delta-9 products CANNOT ship to states marked HIGH RISK.
 *
 * Last audited: 2026-04-02.
 */
export const EXTRA_COMPLIANCE_STATES = [
  {
    code: "AR",
    label: "Arkansas",
    note: "1mg THC/container cap (SB 533). Inhalable hemp restricted. BLOCKED for THCA/D9.",
  },
  {
    code: "MS",
    label: "Mississippi",
    note: "20:1 CBD:THC ratio. AG says most consumable hemp illegal. BLOCKED for THCA/D9.",
  },
  {
    code: "CT",
    label: "Connecticut",
    note: "Intoxicating hemp restricted to regulated cannabis market. CBD/CBG OK, THCA/D9 BLOCKED.",
  },
  {
    code: "MA",
    label: "Massachusetts",
    note: "May channel intoxicating hemp to cannabis market. CBD/CBG OK, THCA/D9 HIGH RISK.",
  },
  {
    code: "VT",
    label: "Vermont",
    note: "Intoxicating hemp channeled to cannabis market. CBD/CBG OK, THCA/D9 BLOCKED.",
  },
  {
    code: "OH",
    label: "Ohio",
    note: "SB 56 bans intoxicating hemp (Mar 2026). CBD/CBG likely exempt, THCA/D9 BLOCKED.",
  },
  {
    code: "NJ",
    label: "New Jersey",
    note: "0.4mg total THC cap (Jan 2026), 21+. THCA/D9 products almost certainly over cap.",
  },
  {
    code: "VA",
    label: "Virginia",
    note: "2mg/package THC cap, retail registration, child-resistant packaging.",
  },
  {
    code: "NY",
    label: "New York",
    note: "CBD in food/drink banned (fines $250-$600). Smokable flower not affected.",
  },
  {
    code: "NE",
    label: "Nebraska",
    note: "Currently legal, AG pushing for ban. LB 316 stalled. Monitor.",
  },
  {
    code: "NC",
    label: "North Carolina",
    note: "Currently legal. HB 328 stalled. THCa-friendly for now.",
  },
  {
    code: "SC",
    label: "South Carolina",
    note: "Currently legal. Bills 3924, 4758 pending. Monitor.",
  },
  {
    code: "MN",
    label: "Minnesota",
    note: "OCM licensing required. Intoxicating hemp may need cannabis market channel.",
  },
  {
    code: "FL",
    label: "Florida",
    note: "Currently very THCa-friendly. No restrictions. Monitor — legislation pending.",
  },
] as const

export const EXTRA_COMPLIANCE_STATE_CODES = new Set(
  EXTRA_COMPLIANCE_STATES.map((s) => s.code)
)

export const ALLOWED_SHIPPING_STATES = [
  "Alaska",
  "Arizona",
  "Arkansas",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Illinois",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
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
  expandedAllowlistValues.length > 0 ? new Set(expandedAllowlistValues) : null

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
  const mode =
    process.env.NEXT_PUBLIC_CHECKOUT_SHIPPING_MODE?.trim().toLowerCase()

  return mode === "full" ? "full" : "pickup_only"
}

export const CHECKOUT_SHIPPING_MODE = resolveCheckoutShippingMode()
