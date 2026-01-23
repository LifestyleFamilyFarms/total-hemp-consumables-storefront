# Total Hemp Consumables – Brand Integration Roadmap

This living document tracks the phased plan for integrating the refreshed logo package into the storefront. Update it as decisions evolve.

## Phase 1 – Asset Preparation
- [x] Batch-convert all `LOGOS_ICONS_WEB` assets into transparent PNG + WebP outputs (multiple sizes if needed).
- [x] Generate a typed manifest that maps human-friendly variant keys (e.g., `heroWordmark`, `navMonogram`) to file paths, dimensions, and background constraints.
- [x] Store conversion tooling/scripts in `scripts/` so assets can be regenerated if the designer updates the source files.

## Phase 2 – Component & Documentation (in progress)
- [x] Build a `BrandLogo` React component that consumes the manifest and centralizes `<Image>` usage.
- [x] Document usage rules (min sizes, TM handling, palette reminders) in `docs/brand-assets.md`.
- [ ] Export SVG logo set from the AI source so nav/hero marks stay crisp at any size.

## Phase 3 – UI Integration
- [x] Replace placeholder text logos in the topbar/sidebar with real assets using `BrandLogo`.
- [ ] Thread branded marks through hero, footer, and feature sections, validating layout on mobile and desktop.
  - Owner: UX + FE
  - Acceptance: hero shows footerStack mark, footer/editorial surfaces display heroWordmark or SVG when shipped.
- [ ] Audit performance (Lighthouse/LCP) to ensure the new media doesn’t regress load times.
  - Owner: FE + Perf
  - Acceptance: Home LCP ≤ 2.5s on mid-tier mobile with hero gradients + imagery enabled.

### Landing-page directives (Nov 2025)
- [x] Recompose hero into a 50/50 “decision board.”
  - Shipped Nov 12 in `src/modules/home/components/hero/index.tsx`: brand story, stats, and compliance link on the left; guided strain/category selector rail on the right.
- [x] Clarify CTA hierarchy.
  - “Shop the collection” is the single filled CTA; Express Checkout now renders as a pill link with helper copy explaining saved-cart requirements; compliance link lives inline under the stats row.
- [x] Lock voice/tone to “modern dispensary,” not “Apple clone.”
  - Copy throughout hero, StrainHighlights, CategoryRail, and EditorialDeck now references greenhouse/budtender cues—no Apple/App Store mentions in customer-facing text.
- [x] Wire SVG logos + theme mapping.
  - Brand manifest now references the exported SVG set in `public/logos/svg`, and `BrandLogo` automatically selects the correct variant per theme (B&W, Greyscale, Sativa, Indica) with PNG/WebP fallbacks for legacy contexts.
- [x] Map every road to purchase above the fold.
  - Hero now ships a “shop lanes” grid that links directly into Flower, Edibles, and Vapes, plus inline Cart/Checkout controls in the topbar and Cart Menu Dock.
- [ ] Relax typography + layout density.
  - ✅ `StrainHighlights`, `CategoryRail`, and `EditorialDeck` now use sentence-case headings, relaxed tracking, and descriptive body copy (Nov 12).
  - ⏭ Apply the same tokens to `BrandPromise`, `ComplianceCallout`, newsletter CTA, and Feature rail copy (UI/FE pairing, due Nov 15).
- [ ] Streamline Featured releases.
  - Replace the current per-collection stack with a curated 4–6 SKU rail that exposes filter chips (strain, format, potency) and a “Browse all collections” panel rather than repeating Collection grids.
  - Add quick-add CTAs or dosage/unit metadata to `ProductPreview` so users can act without drilling into PDPs.
- [ ] Enrich editorial + trust sections.
  - ✅ `EditorialDeck` cards now include gradient art wells + “Why it matters” blurbs.
  - ⏭ Redraw `BrandPromise`/`ComplianceCallout` with iconography, COA snippets, and a state-selector module so compliance info is scannable (UI mocks due Nov 18).
- [ ] Polish conversion microflows.
  - ✅ Floating cart button replaced with the new Cart Menu Dock (`src/components/layout/mobile-thumb-bar.tsx`) that surfaces Cart + Checkout actions across mobile/desktop while keeping quick nav lanes.
  - Allow newsletter sign-up with email only (names optional) and add inline validation/status icons.
  - Introduce an inline age + shipping eligibility check modal so new visitors know up front whether they can order.

### UI designer handoff – Sprint 47
1. Build responsive mocks for the curated Featured rail (filters + quick-add patterns). Include mobile + desktop states with annotations for motion/empty states.
2. Redesign `BrandPromise` + `ComplianceCallout` with sentence-case copy, iconography, and a “shipping eligibility” selector tile.
3. Stitch cart subtotal + item preview data into the Cart Menu Dock (mobile + desktop), including hover/expanded states and add-to-cart toasts.
4. Deliverables due Nov 18 so FE can slot work during the Nov 19 sprint; reference shipped components in `src/modules/home/components/hero|strain-highlights|category-rail|editorial-deck`.

## Phase 4 – Motion & Polish (optional)
- [ ] Layer subtle animation states (hover glows, fade-ins, SVG stroke reveals) via the `BrandLogo` component so motion stays consistent site-wide.
- [ ] Explore scroll-triggered or GSAP-powered treatments only after static placements feel solid.

---
_Last updated: 2025-11-12 15:02 EST_
