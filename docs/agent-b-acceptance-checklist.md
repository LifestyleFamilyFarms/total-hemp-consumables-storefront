# Agent B Acceptance Checklist (PLP/PDP)

Use this as pass/fail criteria before handing work to Agent C.

## Scope Guard
- [ ] Changes are limited to PLP/PDP data + UI responsibilities.
- [ ] Shell contracts are preserved (`Topbar`, `MobileNav`, `CartDrawer`).
- [ ] No legacy sidebar architecture reintroduced.

## Boundary Guard
- [ ] Medusa reads/writes are implemented in `src/lib/data/*`.
- [ ] No ad-hoc SDK calls inside presentation components.
- [ ] No Medusa entities are stored in Zustand.
- [ ] Zustand usage is UI/app state only.

## URL State Contract (PLP)
- [ ] `sort` is represented in URL search params.
- [ ] Pagination state is represented in URL search params.
- [ ] Search query/filter state is represented in URL search params.
- [ ] Reloading the same URL restores the same PLP state.
- [ ] Shared URL opens to equivalent PLP state.

## PDP Contract
- [ ] PDP is server-rendered through route-level data loading.
- [ ] Variant/option selection is correctly handled.
- [ ] Add-to-cart uses existing server action/data-layer flow.
- [ ] Cart refresh/drawer behavior still works after add-to-cart.

## Data + Cache
- [ ] Product/category data access uses server-first patterns.
- [ ] Mutations affecting cart revalidate necessary tags and refresh correctly.
- [ ] No client-global duplication of product/customer/cart state.

## Quality Gates
- [ ] `yarn lint` passes.
- [ ] `yarn build` passes.
- [ ] Manual smoke passes:
  - [ ] PLP URL state restore/share
  - [ ] PDP variant + add-to-cart
  - [ ] Cart reflects updates after mutation

## Responsive QA Gate (Required)
- [ ] Validate layouts at these viewport sizes before handoff:
  - [ ] `360x800` (small mobile)
  - [ ] `390x844` (modern mobile)
  - [ ] `768x1024` (tablet portrait)
  - [ ] `1024x768` (tablet landscape / small laptop)
  - [ ] `1280x800` (desktop)
  - [ ] `1440x900` (desktop wide)
- [ ] Validate these routes at each size:
  - [ ] `/[countryCode]/store`
  - [ ] `/[countryCode]/categories/[handle]`
  - [ ] `/[countryCode]/products/[handle]`
- [ ] Validate shell interactions at each size:
  - [ ] Topbar/nav behavior
  - [ ] Cart drawer open/close and item controls

## Handoff Documentation
- [ ] `docs/rebuild-handoff-status.md` updated with Agent B change note.
- [ ] Files changed are listed by boundary (`app`, `lib/data`, `modules`, docs).
- [ ] Risks/follow-ups for Agent C are explicitly listed.
