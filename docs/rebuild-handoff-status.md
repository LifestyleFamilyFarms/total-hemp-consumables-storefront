# Storefront Rebuild Handoff Status

Updated: 2026-02-27

## Purpose
Single source of truth for what has been scaffolded, what is in scope next, and how agents should avoid overlap.

## Architecture Status (Locked Decisions)
- Server-first data model is active. Medusa entities (cart/customer/products/categories/regions) are server state only.
- Global client state is Zustand only (`src/lib/state/*`) and used for UI/app state, not Medusa entities.
- URL state remains the source for shareable list/filter/sort/pagination state.
- Form state is local (`useActionState`/component state) with Zod validation where needed.
- shadcn primitives are the canonical UI layer (`src/components/ui/*`).

## Completed Scaffold Work
- App/layout orchestration path established in `src/app/*` and `src/components/layout/*`.
- Data access boundaries are centralized in `src/lib/data/*`.
- Zustand slices/selectors scaffolded in `src/lib/state/*`:
  - `ui` slice
  - `checkoutDraft` slice
- Navigation shell rebuild completed (desktop/tablet/mobile).
- Category navigation wired from server data (`src/lib/data/categories.ts`).
- Cart drawer wired to server cart state with Zustand UI-open state only.
- Guest sign-in CTA added for cart drawer (mobile) and cart page sign-in prompt made mobile-safe.
- Gamma Gummies signup flow boundary cleanup:
  - Removed client-side ad-hoc SDK call from component.
  - Added server action in data layer (`src/lib/data/signup.ts`).
  - Shared signup business logic in `src/lib/data/signup-core.ts`.
  - API route now reuses same core logic (`src/app/api/signup/route.ts`).
- Dialog accessibility warnings addressed by adding missing sheet descriptions.
- Medusa SDK debug logging changed to opt-in only (`MEDUSA_SDK_DEBUG=1`).

## Quality Gate Status
- `yarn lint`: pass
- `yarn build`: pass

Note:
- Full manual smoke matrix (register/login/cart transfer/address CRUD) is still recommended before production release.

## Open Risks / Follow-ups
- `src/modules/layout/components/side-menu/*` appears legacy and should not be reintroduced into active shell flows.
- Keep `MEDUSA_ADMIN_TOKEN` server-only; never expose in client bundles or docs.
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is intentionally public and expected client-visible.
- Product media governance is now documented in `docs/product-media-ordering.md` (variant metadata + gallery rank workflow for intentional PDP primary images).
- TODO (repo hygiene): decide asset policy to keep only production-served assets in `public/`, and gitignore raw/source design assets folder(s) once finalized.

## Agent Ownership (No Cross-Streams)

### Agent A (Shell/Nav/Theme) - done for this pass
- Owns: `src/components/layout/*`, `src/components/theme/*`, shell-level responsive behavior.
- Do not start new PLP/PDP data work in this stream.

### Agent B (PLP/PDP Data + UI) - next
- Owns:
  - Product listing and product detail modules/routes.
  - URL-state filter/sort/pagination contract.
  - Server data loaders/actions for catalog presentation.
- Must preserve:
  - Existing shell contracts (`Topbar`, `MobileNav`, `CartDrawer`).
  - State boundaries from `docs/state-architecture.md`.
- Required signoff:
  - `docs/agent-b-acceptance-checklist.md`

### Agent C (Checkout Integration)
- Owns:
  - Checkout step flow integration and polish.
  - Auth/cart transfer/address interactions inside checkout journey.
- Must preserve:
  - Server-first data mutations in `src/lib/data/*`.
  - Zustand limited to UI flags/drafts only.

## Start Protocol For Any Agent
1. Read:
   - `docs/storefront-architecture.md`
   - `docs/state-architecture.md`
   - `docs/agent-handoff-checklist.md`
   - `docs/rebuild-handoff-status.md` (this file)
   - `docs/agent-b-acceptance-checklist.md` (when Agent B is active)
2. Confirm target scope (A/B/C) before touching files.
3. Implement only inside owned boundaries.
4. Run:
   - `yarn lint`
   - `yarn build`
5. Update this file’s "Updated" date and add a short change note block.

## Change Note Template
Use this at the bottom of this file when an agent finishes:

```
### Change Note - YYYY-MM-DD - Agent X
- Completed:
- Files touched:
- Quality gates:
- Risks:
```

### Change Note - 2026-02-19 - Agent B
- Completed:
  - Implemented shared PLP URL contract parsing for `sort`, `page`, `q`, and `category`.
  - Wired PLP routes/templates to server data loading via URL state (`store`, `categories`, `collections`).
  - Added PLP controls UI for search, sort, category filters, and URL-driven pagination.
  - Added PDP data helpers (`getProductByHandle`, `getProductById`) and updated PDP route/actions wrapper to use them.
- Files touched:
  - `src/app/[countryCode]/(main)/store/*`
  - `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`
  - `src/app/[countryCode]/(main)/collections/[handle]/page.tsx`
  - `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
  - `src/lib/data/products.ts`
  - `src/lib/data/categories.ts`
  - `src/modules/store/*`
  - `src/modules/categories/templates/index.tsx`
  - `src/modules/collections/templates/index.tsx`
  - `src/modules/products/templates/product-actions-wrapper/index.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
- Risks:
  - Manual smoke verification for URL share/reload behavior and PDP add-to-cart flow is still required in browser.
  - PLP price sorting currently uses server-side in-memory sort after batched fetches, which may need optimization for very large catalogs.

### Change Note - 2026-02-19 - Agent B (follow-up)
- Completed:
  - Aligned storefront after route cleanup by removing stale references to deleted `/store/*` and `/products/*` subroutes.
  - Updated homepage editorial CTA links to URL-filtered `/store` routes.
  - Updated revalidation endpoint path map to existing route structure.
  - Re-ran lint/build and smoke checks on local dev server.
- Files touched:
  - `src/modules/home/components/editorial-deck/index.tsx`
  - `src/app/api/revalidate/route.ts`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
  - Smoke (`/us/store` URL state): pass
  - Smoke (PDP add-to-cart/cart update): fail due backend `POST /store/carts/:id/line-items` returning `500 unknown_error`.
- Risks:
  - Add-to-cart remains backend-blocked; direct backend API test reproduces the same failure outside storefront.

### Change Note - 2026-02-19 - Agent B
- Completed:
  - Rebuilt Home route composition to server-driven catalog sections and removed prior placeholder home component stack.
  - Rebuilt PLP shell/cards/controls/pagination across `store`, `categories`, and `collections` with URL-state contract preserved (`sort`, `page`, `q`, `category`).
  - Rebuilt PDP into a unified variant-aware UI with metadata-backed sections (`Product Description`, `Ingredients`, `Product Details`, `FAQs`), variant option state, price updates, and variant media switching from variant metadata filenames.
  - Cleaned unused legacy PDP/home components to prevent regressions and placeholder reintroduction.
  - Hardened product list handling by deduplicating product records in server data layer before sorting/pagination.
- Files touched:
  - `src/app/[countryCode]/(main)/page.tsx`
  - `src/app/[countryCode]/(main)/store/page.tsx`
  - `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`
  - `src/app/[countryCode]/(main)/collections/[handle]/page.tsx`
  - `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
  - `src/lib/data/products.ts`
  - `src/lib/util/sort-products.ts`
  - `src/modules/store/*`
  - `src/modules/categories/templates/index.tsx`
  - `src/modules/collections/templates/index.tsx`
  - `src/modules/products/templates/index.tsx`
  - `src/modules/products/components/product-detail-client/index.tsx`
  - `src/modules/products/components/product-preview/index.tsx`
  - `src/modules/products/components/related-products/index.tsx`
  - Removed legacy placeholder home/PDP component files under `src/modules/home/components/*` and old PDP component paths.
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
  - Smoke (server-rendered PLP URL-state markers via `/us/store?page=2`, `/us/store?sort=price_asc&q=gummies`): pass
  - Smoke (PDP server render includes variant controls + metadata sections): pass
  - Smoke (backend cart line-item API): fail (`POST /store/carts/:id/line-items` returns `500 unknown_error`)
- Risks:
  - Add-to-cart remains backend-blocked by Medusa cart line-item endpoint failure, independent of storefront UI wiring.
  - Interactive browser automation smoke was constrained by local Playwright module resolution in this workspace; executed deterministic route/API smoke instead.

### Change Note - 2026-02-19 - Agent B (PDP/PLP stabilization pass)
- Completed:
  - Kept strict server category filtering and added category-specific empty-state diagnostics when Store API returns zero products.
  - Updated shared PLP template plumbing to support contextual empty-state messaging without changing URL-state contract.
  - Rebuilt PDP detail layout so accordion content is inline in the right column and removed duplicate Product Description accordion section.
  - Switched Ingredients rendering to raw metadata text (no list parsing/splitting) while preserving FAQ/details metadata handling.
  - Implemented hybrid variant controls: chip buttons for smaller option sets and select dropdowns for larger option sets.
  - Implemented smart variant media ordering to prioritize thumbnail/front imagery and push label/nutrition/ingredient assets later.
- Files touched:
  - `src/modules/categories/templates/index.tsx`
  - `src/modules/store/templates/index.tsx`
  - `src/modules/store/templates/paginated-products.tsx`
  - `src/modules/products/components/product-detail-client/index.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
  - Smoke on isolated dev server (`yarn dev -p 8001`):
    - PLP URL-state rendering (`/us/store?sort=price_asc&q=gummies&page=2`): pass
    - Category diagnostic messaging (`/us/categories/cbd-gummies` with empty dev category matches): pass
    - PDP layout/accordion/variant controls markers (`/us/products/cbg-gummies`): pass
- Risks:
  - Environment divergence remains: production has category links, current local dev Store API returns zero `category_id` matches.
  - User-provided `:8000` storefront process returned `500 Internal Server Error` during smoke; isolated `:8001` process was used for verification.

### Change Note - 2026-02-19 - Agent B (price-sort clarity follow-up)
- Completed:
  - Updated PLP server-side price sorting semantics:
    - `price_asc` now sorts by product minimum variant price.
    - `price_desc` now sorts by product maximum variant price.
  - Updated PLP product card pricing to show explicit ranges for multi-variant products (for example, `$10.00 - $30.00`) instead of only `From $X`.
  - Kept single-price products unchanged and compare-at strike-through only for single-price sale scenarios.
- Files touched:
  - `src/lib/util/sort-products.ts`
  - `src/modules/products/components/product-preview/index.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass (after clearing stale build output by rotating `.next` directory)
  - Smoke on isolated dev server (`yarn dev -p 8001`):
    - Category route with dev category assignments (`/us/categories/cbd-gummies`): pass
    - Price display range rendering on PLP (`/us/store?sort=price_asc`): pass
    - Descending sort leading with higher top-end ranges (`/us/store?sort=price_desc`): pass
- Risks:
  - User-managed storefront process on `:8000` continued to return `500` during direct smoke requests; isolated `:8001` was used for deterministic verification.

### Change Note - 2026-02-19 - Agent B (PLP tag-pill refresh)
- Completed:
  - Replaced hardcoded `Lab-tested` product card pill with dynamic Medusa product tags in PLP product cards.
  - Added fallback to `Lab-tested` only when a product has no tags.
  - Preserved strain badge rendering and prevented duplicate pill/badge values.
- Files touched:
  - `src/modules/products/components/product-preview/index.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
- Risks:
  - Tag order currently follows Medusa tag ordering; merchandising may want a future priority map (for example, always prefer effect/use-case tags over brand tags).

### Change Note - 2026-02-19 - Agent B (PDP desktop density/layout)
- Completed:
  - Reduced PDP desktop side-gutter pressure by widening the product template container.
  - Updated PDP desktop structure to three columns at `xl` breakpoint:
    - media column
    - selector/add-to-cart column
    - accordion column (`Ingredients`, `Product Details`, `FAQs`)
  - Preserved stacked flow on smaller breakpoints in the requested order (`image`, `selector`, `accordion`).
- Files touched:
  - `src/modules/products/templates/index.tsx`
  - `src/modules/products/components/product-detail-client/index.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
  - Smoke on isolated dev server (`yarn dev -p 8001`) for PDP route: pass
- Risks:
  - Final perceived spacing still depends on browser width; if needed, we can tune the `xl`/`2xl` column ratios in one follow-up pass.

### Change Note - 2026-02-19 - Agent B (PLP controls pass - search removed)
- Completed:
  - Removed PLP search input/button UI and shifted to browse-first controls.
  - Extended PLP URL-state contract with facet params: `type`, `effect`, `compound` (while preserving backward-compatible parsing for legacy `q`/`category` links).
  - Implemented server-side PLP facet indexing and filtering in data layer using Medusa-supported `type_id` and `tag_id` filters.
  - Replaced duplicate category pills in PLP controls with compact facet groups (`Type`, `Effect`, `Cannabinoid`) and active-filter chips.
  - Added mobile filter drawer with draft/apply behavior so filter changes apply in batch on mobile.
  - Added compact PLP variant preview on product cards with numeric-aware option value sorting and `+N more` summary.
- Files touched:
  - `src/modules/store/lib/url-state.ts`
  - `src/lib/data/products.ts`
  - `src/modules/store/components/plp-controls.tsx`
  - `src/modules/store/templates/index.tsx`
  - `src/modules/store/templates/paginated-products.tsx`
  - `src/modules/products/components/product-preview/index.tsx`
  - `src/modules/categories/templates/index.tsx`
  - `src/modules/collections/templates/index.tsx`
  - `src/app/[countryCode]/(main)/store/page.tsx`
  - `src/app/[countryCode]/(main)/categories/[...category]/page.tsx`
  - `src/app/[countryCode]/(main)/collections/[handle]/page.tsx`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - `yarn lint`: pass
  - `yarn build`: pass
  - Smoke (`yarn dev -p 8001` + HTTP checks):
    - `/us/store` renders browse-first controls with no `Search catalog` UI: pass
    - `/us/store?type=gummies&effect=sleep&compound=cbd&sort=price_asc` applies facet URL state and returns filtered results: pass
    - PLP cards render compact variant previews (for example, ordered numeric strength/count values): pass
- Risks:
  - Facet options are currently derived from catalog tags/types in Medusa; inconsistent merchandising tags can reduce filter quality until data normalization is tightened.
  - Legacy `q` links remain supported but hidden from direct input UI, so they may appear as non-editable keyword chips until cleared.

### Change Note - 2026-02-27 - Agent C (Packet 1 QA baseline + backlog sync)
- Completed:
  - Synced production todo backlog with Packet 1 required QA gates and remaining skills integration order.
  - Verified backend and storefront build/lint/static checks:
    - backend `yarn build`: pass
    - storefront `yarn lint`: pass
    - storefront `yarn build`: pass
    - storefront `yarn check:commerce-rules`: pass
  - Applied database migrations and confirmed loyalty module is up-to-date (`npx medusa db:migrate`: pass).
  - Ran backend integration HTTP tests (`yarn test:integration:http`: pass).
  - Verified loyalty route auth and mutation behavior:
    - unauthenticated `GET/POST/DELETE` loyalty routes correctly reject with `401`.
    - authenticated customer routes return expected payload for points/history.
    - fixed cart loyalty route error mapping so workflow validation errors return `400` with actionable messages (instead of generic `500`).
- Files touched:
  - `docs/full-build-implementation-order.md`
  - `docs/rebuild-handoff-status.md`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/api/store/carts/[id]/loyalty-points/route.ts`
- Quality gates:
  - `yarn build` (backend): pass
  - `yarn lint` (storefront): pass
  - `yarn build` (storefront): pass
  - `yarn check:commerce-rules` (storefront): pass
  - `yarn test:integration:http` (backend): pass
  - `yarn test:integration:modules` (backend): no tests found (script exits 1)
- Risks:
  - Full authenticated loyalty success-path E2E still needs browser QA (apply/remove with non-zero points, order placement with deduction, insufficient-points block on complete-cart hook).
  - Responsive QA matrix for checkout/account/cart is still pending and required before production signoff.

### Change Note - 2026-02-27 - Agent A (Loyalty QA hardening follow-up)
- Completed:
  - Added backend loyalty utility script to credit points by customer email for repeatable QA:
    - `src/scripts/credit-loyalty-points.ts`
    - package script alias: `yarn loyalty:credit`
  - Credited test customer (`test@totalhemp.co`) and validated authenticated loyalty endpoints.
  - Fixed loyalty apply workflow cart totals query fields so loyalty apply uses cart totals correctly.
  - Fixed loyalty remove workflow metadata cleanup to explicitly null `metadata.loyalty_promo_id`.
  - Verified apply/remove mutation path with authenticated customer and real cart line item:
    - apply: `200`
    - remove: `200`
- Files touched:
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/scripts/credit-loyalty-points.ts`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/package.json`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/workflows/loyalty/apply-loyalty-on-cart.ts`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/workflows/loyalty/remove-loyalty-from-cart.ts`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - backend `yarn build`: pass
- Risks:
  - Full order placement loyalty deduction and complete-cart insufficient-points validation remain blocked in this environment because checkout currently returns no shipping options for carts.

### Change Note - 2026-02-27 - Agent A (Pickup-only QA unblock + loyalty E2E)
- Completed:
  - Added temporary pickup-option seeding script:
    - backend script: `src/scripts/ensure-pickup-shipping-option.ts`
    - package script: `yarn shipping:ensure:pickup`
  - Added manual fulfillment provider alongside ShipStation in backend config so pickup-only QA can run without external rates.
  - Extended loyalty utility script to support both add/deduct operations (`LOYALTY_OPERATION=add|deduct`) for deterministic QA.
  - Verified loyalty flows end-to-end on backend runtime with updated provider config (`:9001`):
    - apply/remove loyalty on cart: pass
    - checkout completion with pickup shipping + system payment: pass
    - `order.placed` deduction + history ledger update: pass
    - complete-cart insufficient-points hook: pass (blocked completion with expected error)
  - Restored test customer loyalty balance after insufficient-points validation.
  - Re-verified happy-path loyalty checkout completion on active backend runtime (`:9000`) after pickup-option seeding.
- Files touched:
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/medusa-config.ts`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/scripts/ensure-pickup-shipping-option.ts`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/src/scripts/credit-loyalty-points.ts`
  - `/Users/franciscraven/Desktop/total-hemp/total-hemp-consumables/package.json`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - backend `yarn build`: pass
- Risks:
  - Temporary pickup QA options are now seeded in dev data; cleanup policy should be decided once distributor shipping options go live.

### Change Note - 2026-02-27 - Agent C (Funnel hardening follow-up: confirmation + support)
- Completed:
  - Confirmed shipping strategy decision in production todo: keep `pickup_only` for this packet and defer ShipStation sandbox integration.
  - Improved order confirmation phase-8 UX by adding a "What happens next" timeline card with pickup/shipping-aware messaging.
  - Replaced broken order confirmation help links (`/contact`) with valid support paths:
    - mailto support address
    - `/account/orders` for post-purchase management.
  - Added configurable storefront support contact env vars (`NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_PHONE`).
  - Fixed order confirmation metadata typo (`Your purchase was successful`).
- Files touched:
  - `src/modules/order/components/next-steps/index.tsx`
  - `src/modules/order/components/help/index.tsx`
  - `src/modules/order/templates/order-completed-template.tsx`
  - `src/lib/constants/support.ts`
  - `src/app/[countryCode]/(main)/order/[id]/confirmed/page.tsx`
  - `.env.template`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - storefront `yarn check:commerce-rules`: pass
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
  - backend `yarn build`: pass
  - backend `yarn test:integration:http`: pass
- Risks:
  - Static policy/contact page set is still pending (phase 10); support currently routes through email plus account order management.

### Change Note - 2026-02-27 - Agent C (Funnel hardening follow-up: type safety + delivery summary)
- Completed:
  - Hardened checkout completion button handling by removing `any` response parsing and using typed `StoreCompleteCartResponse` narrowing.
  - Typed server cart completion action return signature for safer downstream usage.
  - Hardened cart/checkout summary typing:
    - removed `any` usage in checkout summary item count
    - removed `as any` cast in cart template summary handoff.
  - Improved order confirmation delivery block:
    - removed `as any` on shipping methods
    - removed fragile number-string replacement in shipping price formatting
    - improved mobile layout from fixed thirds to responsive grid.
- Files touched:
  - `src/lib/data/cart.ts`
  - `src/modules/checkout/components/payment-button/index.tsx`
  - `src/modules/checkout/templates/checkout-summary/index.tsx`
  - `src/modules/cart/templates/index.tsx`
  - `src/modules/order/components/shipping-details/index.tsx`
- Quality gates:
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
  - storefront `yarn check:commerce-rules`: pass
- Risks:
  - Next.js build is configured to skip type validation, so hard TS guarantees still depend on editor/CI typecheck configuration.

### Change Note - 2026-02-27 - Agent C (Responsive QA automation)
- Completed:
  - Added repeatable responsive smoke script for required launch routes and viewport matrix:
    - routes: `/us/cart`, `/us/checkout`, `/us/account`
    - viewports: `360x800`, `390x844`, `768x1024`, `1024x768`, `1280x800`, `1440x900`
  - Added package command: `yarn qa:responsive-smoke`
  - Executed run against active local storefront and generated screenshots:
    - `artifacts/responsive/20260226-214054`
- Files touched:
  - `scripts/responsive-smoke.sh`
  - `package.json`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - `yarn qa:responsive-smoke`: pass
- Risks:
  - Automated capture confirms pages render, but final launch signoff still requires manual visual review of screenshots.

### Change Note - 2026-02-27 - Agent C (Typecheck visibility pass)
- Completed:
  - Ran explicit `yarn tsc --noEmit` to surface type debt hidden by Next build’s "skip type validation" behavior.
  - Fixed the type regressions introduced in this hardening pass (cart promotion types and checkout completion response narrowing).
  - Recorded remaining pre-existing TypeScript errors in production todo backlog for targeted cleanup.
- Files touched:
  - `src/modules/cart/templates/summary.tsx`
  - `src/modules/cart/templates/index.tsx`
  - `src/modules/checkout/templates/checkout-summary/index.tsx`
  - `src/modules/checkout/components/discount-code/index.tsx`
  - `src/modules/checkout/components/loyalty-points/index.tsx`
  - `src/modules/checkout/components/payment-button/index.tsx`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
  - storefront `yarn tsc --noEmit`: fail (pre-existing type debt outside packet scope logged)
- Risks:
  - Type errors in product/account/brand utility files remain a release risk unless corrected or explicitly deferred.

### Change Note - 2026-02-27 - Agent C (Typecheck backlog closure)
- Completed:
  - Cleared all storefront `tsc` failures discovered in the prior pass.
  - Fixed brand asset output typing for optional SVG variants.
  - Hardened analytics payload serialization to remove `undefined` values before tracking.
  - Aligned address action-state typing across add/edit/billing forms.
  - Normalized signup action return type for register `useActionState`.
  - Updated PDP option loops/keying to avoid `entries()` downlevel iterator typing issues.
  - Fixed PLP price-summary type predicate/nullability handling.
- Files touched:
  - `src/components/brand/brand-logo.tsx`
  - `src/lib/analytics/cart-events.ts`
  - `src/lib/data/customer.ts`
  - `src/modules/account/components/profile-billing-address/index.tsx`
  - `src/modules/products/components/product-detail-client/index.tsx`
  - `src/modules/products/components/product-preview/index.tsx`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - storefront `yarn tsc --noEmit`: pass
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
  - storefront `yarn check:commerce-rules`: pass
- Risks:
  - No new blocking compiler risks identified in this pass.

### Change Note - 2026-02-27 - Agent C (Phase 10 static/compliance baseline)
- Completed:
  - Implemented static content route set under main storefront:
    - `/[countryCode]/content`
    - `/[countryCode]/content/about`
    - `/[countryCode]/content/contact`
    - `/[countryCode]/content/faq`
    - `/[countryCode]/content/privacy-policy`
    - `/[countryCode]/content/shipping-returns`
    - `/[countryCode]/content/terms-of-use`
  - Added reusable static content page template for policy/help content.
  - Updated footer compliance links to point to real static routes.
  - Updated order confirmation help links to include shipping/returns and contact center routes.
  - Updated compliance bar privacy copy to reflect policy availability.
- Files touched:
  - `src/modules/content/templates/static-content-page.tsx`
  - `src/app/[countryCode]/(main)/content/page.tsx`
  - `src/app/[countryCode]/(main)/content/about/page.tsx`
  - `src/app/[countryCode]/(main)/content/contact/page.tsx`
  - `src/app/[countryCode]/(main)/content/faq/page.tsx`
  - `src/app/[countryCode]/(main)/content/privacy-policy/page.tsx`
  - `src/app/[countryCode]/(main)/content/shipping-returns/page.tsx`
  - `src/app/[countryCode]/(main)/content/terms-of-use/page.tsx`
  - `src/components/layout/footer.tsx`
  - `src/components/layout/compliance-bar.tsx`
  - `src/modules/order/components/help/index.tsx`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
- Quality gates:
  - storefront `yarn tsc --noEmit`: pass
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
  - storefront `yarn check:commerce-rules`: pass
- Risks:
  - Policy page content is production-safe baseline copy but still needs legal copy review before final launch signoff.

### Change Note - 2026-02-27 - Agent C (Compliance mobile UX + Phase 12 SEO baseline)
- Completed:
  - Refined compliance bar UX with compact mobile mode (`<sm`) and bottom-sheet popout while preserving desktop/tablet pill-popover layout.
  - Synced compliance snippets with updated Shipping/Terms/Privacy policy language and links.
  - Added global metadata defaults (title template, description, OG, Twitter, robots).
  - Added dynamic `robots.txt` and `sitemap.xml` routes.
  - Added PDP canonical metadata and structured data output (Product + Breadcrumb JSON-LD).
  - Added homepage Organization JSON-LD structured data.
  - Fixed canonical metadata paths for store/category/collection pages.
- Files touched:
  - `src/components/layout/compliance-bar.tsx`
  - `src/app/layout.tsx`
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`
  - `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - storefront `yarn lint`: pass
  - storefront `yarn build`: pass
- Risks:
  - `sitemap.xml` currently relies on storefront data APIs at generation time; if backend connectivity degrades, sitemap content can be partially reduced until connectivity recovers.
  - Search Console submission and launch-environment Core Web Vitals verification are still pending.

### Change Note - 2026-02-27 - Agent C (Phase 11 promotions transparency follow-up)
- Completed:
  - Added order-level promotion transparency by aggregating line-item and shipping adjustment entries in order summaries.
  - Updated order-confirmed flow to use the same summary component as account order details, keeping post-purchase promotion visibility consistent.
  - Expanded order data fetch fields to include item/shipping adjustment relations needed for promotion breakdown display.
  - Verified wishlist support is not currently present in backend/storefront code paths and deferred wishlist implementation pending backend capability.
- Files touched:
  - `src/modules/order/components/order-summary/index.tsx`
  - `src/modules/order/templates/order-completed-template.tsx`
  - `src/lib/data/orders.ts`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - storefront `yarn lint`: pass
  - storefront `yarn tsc --noEmit`: pass
  - storefront `yarn build`: pass
  - storefront `yarn check:commerce-rules`: pass
- Risks:
  - Promotion label quality depends on upstream adjustment metadata (`code`/`description`) present in order adjustments.

### Change Note - 2026-02-27 - Agent C (Responsive QA unblock - age gate)
- Completed:
  - Added a dev-only age-gate QA bypass (`qa_age_verified=1`) so automation can capture true page UI states without manual gate interaction.
  - Updated responsive smoke script to append the QA bypass parameter to capture URLs.
  - Re-ran responsive smoke capture successfully with bypass:
    - `artifacts/responsive/20260226-233017`
- Files touched:
  - `src/components/layout/age-gate.tsx`
  - `scripts/responsive-smoke.sh`
  - `/Users/franciscraven/Desktop/total-hemp/to-do-prod.md`
  - `docs/rebuild-handoff-status.md`
- Quality gates:
  - storefront `yarn lint`: pass
  - storefront `yarn tsc --noEmit`: pass
  - storefront `yarn build`: pass
  - storefront `yarn check:commerce-rules`: pass
- Risks:
  - Bypass only works in non-production builds; production age gate behavior remains unchanged.
