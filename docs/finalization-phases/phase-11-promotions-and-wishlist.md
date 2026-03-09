# Phase 11 Finalization: Promotions and Wishlist

Status: Pending

## Goal
Finalize promotion visibility and document wishlist scope decision.

## Pass Checklist
- [ ] Promotions are shown clearly in cart/checkout/order contexts.
- [ ] No duplicate/confusing promotion rendering.
- [ ] Wishlist status is explicitly marked (`implemented` or `deferred`).
- [ ] Any deferred items include clear backend dependency notes.

## Evidence Required
- Promo display behavior summary across core funnel screens.
- Wishlist decision note with dependency mapping.

## Deep-Dive Agent Prompt
```text
Run a Phase 11 finalization pass for promotions/wishlist scope.

Use skills:
- storefront-best-practices
- building-storefronts

Goal:
Confirm promo UX quality and close wishlist scope ambiguity for launch.

Deliverable:
- Promo UX findings and fixes
- Wishlist go/no-go recommendation with rationale
```
