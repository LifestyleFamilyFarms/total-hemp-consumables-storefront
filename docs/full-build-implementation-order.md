# Storefront Full Build Implementation Order

Updated: 2026-02-27

## Purpose
This order aligns implementation with:
- `building-storefronts` skill (SDK + React Query + data-fetch patterns)
- `storefront-best-practices` skill (ecommerce UX, layout, SEO, mobile)
- Existing repo architecture in `docs/storefront-architecture.md` and `docs/state-architecture.md`

## Non-Negotiable Rules (Apply in Every Phase)
- Keep Medusa reads/writes in `src/lib/data/*`.
- Keep Medusa entities out of Zustand.
- Use URL params for shareable catalog state.
- Use Medusa SDK methods or `sdk.client.fetch`; no raw `fetch` for Medusa routes.
- Use local SDK references in `docs/js-sdk/*` for method signatures.
- Display Medusa prices as-is (never divide by 100).
- Run `yarn lint` and `yarn build` before phase handoff.

## Implementation Sequence

| Phase | Goal | Primary Areas | Required References Before Coding | Exit Criteria |
|---|---|---|---|---|
| 0 | Preflight and alignment | `docs/*`, env, backend health | `reference/design.md`, `reference/connecting-to-backend.md`, `reference/medusa.md`, `references/frontend-integration.md` | Team aligned on boundaries, env validated, known blockers listed |
| 1 | Unblock commerce-critical backend issues | Backend cart/payment behavior + `src/lib/data/cart.ts` integration checks | `docs/js-sdk/store-methods/cart.md`, `docs/js-sdk/store-methods/payment.md`, `references/frontend-integration.md` | Add-to-cart (`POST /store/carts/:id/line-items`) succeeds consistently |
| 2 | Foundation hardening | `src/lib/data/*`, shell contracts, region/country flow | `reference/navbar.md`, `reference/footer.md`, `reference/mobile-responsiveness.md`, `reference/medusa.md` | Cart badge/count and region behavior are stable across breakpoints |
| 3 | Home + navigation polish | `src/app/[countryCode]/(main)/page.tsx`, layout modules | `reference/layouts/home-page.md`, `reference/components/hero.md`, `reference/components/navbar.md`, `reference/components/footer.md` | Homepage has clear CTA hierarchy, dynamic category links, mobile-safe nav flows |
| 4 | Catalog browsing completion (PLP) | `src/modules/store/*`, category/collection routes | `reference/layouts/product-listing.md`, `reference/components/product-card.md`, `reference/components/search.md`, `references/frontend-integration.md` | URL-state filters/sort/pagination fully stable with good empty/loading states |
| 5 | Product detail completion (PDP) | `src/modules/products/*`, product route | `reference/layouts/product-details.md`, `reference/components/product-reviews.md`, `reference/components/product-slider.md` | Variant selection, stock state, add-to-cart feedback, related products all pass smoke tests |
| 6 | Cart UX and resilience | `src/modules/cart/*`, shared totals/actions | `reference/layouts/cart.md`, `reference/components/cart-popup.md`, `references/frontend-integration.md` | Variant details always shown, optimistic updates + rollback, promo handling and cart cleanup patterns validated |
| 7 | Checkout end-to-end | `src/modules/checkout/*`, checkout route | `reference/layouts/checkout.md`, `reference/medusa.md`, `docs/js-sdk/store-methods/payment.md` | Shipping + payment methods dynamically fetched, payment session init verified, successful order placement works |
| 8 | Order confirmation and post-purchase | `src/modules/order/*`, confirmed route | `reference/layouts/order-confirmation.md` | Confirmation includes order details, next steps, support path, and cart is cleared |
| 9 | Account area completion | account routes/modules | `reference/layouts/account.md`, `references/frontend-integration.md` | Profile/orders/addresses are stable, reorder flow defined, auth edge cases covered |
| 10 | Static/compliance pages | add route set for policies/FAQ/contact | `reference/layouts/static-pages.md`, `reference/seo.md` | FAQ/contact/shipping-returns/privacy/terms are live and linked |
| 11 | Promotions and wishlist | cart/PLP/PDP/account integrations | `reference/features/promotions.md`, `reference/features/wishlist.md` | Promotion UX complete; wishlist only if backend support is confirmed |
| 12 | SEO, mobile, performance, release QA | metadata, sitemap, responsive/perf audits | `reference/seo.md`, `reference/mobile-responsiveness.md` | Schema + metadata + sitemap complete, Core Web Vitals within targets, full smoke matrix passes |

## Recommended Workstreams (to avoid overlap)
- Stream A: Phases 0-2 (platform stability and unblockers).
- Stream B: Phases 3-5 (discovery and product browsing).
- Stream C: Phases 6-8 (purchase funnel).
- Stream D: Phases 9-12 (retention, compliance, optimization, launch QA).

## Immediate Next 3 Actions in This Repo
1. Finish Packet 1 manual QA gates for loyalty and checkout (auth, ownership, apply/remove, order placement, complete-cart validation).
2. Execute required responsive checks for checkout/account/cart at `390x844`, `1024x768`, and `1440x900`.
3. Continue phases 6-8 as a single funnel hardening sprint before starting phases 9-12.
