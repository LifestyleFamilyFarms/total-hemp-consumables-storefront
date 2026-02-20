# Storefront Rebuild Handoff Status

Updated: 2026-02-19

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
