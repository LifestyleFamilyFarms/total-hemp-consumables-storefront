# Storefront Rebuild Handoff Status

Updated: 2026-02-18

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
