# Purpose
Storefront execution contract for `total-hemp-consumables-storefront`.

Agents working in this repo must keep data access architecture clean, protect UX/state behavior across breakpoints, and provide evidence-backed handoffs.

# Canonical Docs
- Command center (cross-repo dispatch, runbooks, evidence):
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/docs/finalization-phases`
- Storefront phase docs:
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront/docs/finalization-phases`
- Storefront wave references:
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront/docs/wave-1-docs`
- JS SDK method references:
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/docs/js-sdk`
- Backend repo (read-only unless explicitly assigned):
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables`

# Skills References
- Storefront architecture and Medusa integration:
  - `/Users/franciscraven/.agents/skills/building-storefronts/SKILL.md`
- Ecommerce UX/component guardrails:
  - `/Users/franciscraven/.agents/skills/storefront-best-practices/SKILL.md`
- Frontend/runtime verification tooling:
  - `/Users/franciscraven/.agents/skills/webapp-testing/SKILL.md`
  - `/Users/franciscraven/.agents/skills/playwright-cli/SKILL.md`

# Path Ownership
| Lane | Primary Paths | Notes |
|---|---|---|
| Medusa data access | `src/lib/data/**` | All custom Medusa route calls belong here. |
| Product and PDP UX | `src/modules/products/**` | Reviews/wishlist/PDP behavior. |
| Cart/checkout/order UX | `src/modules/cart/**`, `src/modules/checkout/**`, `src/modules/order/**` | Critical conversion path. |
| Catalog/category presentation | `src/modules/store/**`, `src/modules/categories/**` | Category media and PLP surfaces. |
| Account/auth UX | `src/modules/account/**` | Sign-in/register/account flows. |
| Shared layout/theme | `src/components/layout/**`, `src/components/theme/**`, `src/lib/brand/**`, `src/app/global.css` | Preserve theme/system consistency. |

# Hard Rules
- Use Medusa JS SDK for Medusa traffic; for custom endpoints use `sdk.client.fetch`.
- Keep Medusa calls in `src/lib/data/**` only. UI/components must call data-layer helpers.
- Never pass `JSON.stringify(...)` into SDK request bodies; pass plain objects.
- Treat backend monetary/shipping values as source of truth. Do not add `/100` scaling heuristics.
- Preserve env-driven behavior:
  - `NEXT_PUBLIC_CHECKOUT_SHIPPING_MODE` controls pickup-only vs full shipping UI behavior.
  - QA query toggles must only activate when `NEXT_PUBLIC_QA_EVIDENCE_MODE === "1"`.
- Preserve explicit error/loading/empty/success UX states in critical flows (cart, checkout, reorder, reviews, wishlist).
- Keep shared design system coherent (tokens/classes/components). Avoid ad hoc style drift on global surfaces.

# Validation Gates
- Required for substantial storefront changes:
  - `yarn lint`
  - `yarn build`
  - `yarn check:commerce-rules`
- Run when relevant to scope:
  - `yarn qa:responsive-smoke` for layout/responsive changes.
  - `yarn qa:loyalty-live` for loyalty/cart-account interaction changes (when test credentials are available).
  - `yarn brand:build` when changing brand asset mapping/pipeline.
- Record pass/fail for each executed command in handoff.

# Handoff Requirements
- Mandatory dispatch lifecycle checklist for substantial tasks:
  1. Documentation intake gate: request relevant docs, wait for docs or explicit `none`.
  2. Doc Map: list doc path, relevance, decisions.
  3. Scope lock: include explicit non-goals and lane boundaries.
  4. Run validation gates and capture runtime evidence.
  5. Publish handoff report with artifacts.
- Handoff payload must include:
  - Files changed
  - UI state matrix (expected vs observed) for affected critical flows
  - Commands run + pass/fail
  - Evidence artifact paths (screenshots/log/json)
  - Risks/blockers and recommended owner

# Prohibited Patterns
- Raw `fetch` for Medusa routes in UI/components.
- `sdk.client.fetch` calls outside `src/lib/data/**`.
- `JSON.stringify` request body usage with SDK calls.
- Hidden fallback behavior that masks API errors without user-visible state.
- Unscoped cross-lane edits (for example touching catalog/feed while assigned to checkout-only scope) without explicit assignment.
- Referencing deprecated top-level workspace docs as canonical.
