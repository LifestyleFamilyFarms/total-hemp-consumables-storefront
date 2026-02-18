# Storefront Architecture

## Purpose
This scaffold establishes durable boundaries for the Next.js App Router rebuild so feature work can ship without structural rewrites.

## Core Decisions
1. Server-first data model.
2. Zustand as the only global client state system.
3. URL search params for shareable view state.
4. Local form state with Zod validation where needed.

## Folder Boundaries
- `src/app/*`: Route/layout orchestration and server component entrypoints.
- `src/lib/data/*`: Server-only Medusa access and mutations. SDK calls are centralized here.
- `src/lib/state/*`: Zustand store, slices, and selectors for UI/app state only.
- `src/modules/*`: Feature composition and presentation.

## UI Primitive Layer
- Canonical primitives live in `src/components/ui/*` (shadcn source files).
- New primitives must be added through shadcn workflow and existing aliases.
- Feature modules compose from these primitives instead of creating a parallel primitive system.

## Server State Boundaries
The following entities are server state only and are never stored in Zustand:
- Customer
- Cart
- Products
- Categories
- Regions

Read pattern:
- Server components call `src/lib/data/*` to retrieve Medusa data.

Write pattern:
- Client components call server actions in `src/lib/data/*`.
- Actions revalidate cache tags (`carts`, `fulfillment`, etc.).
- Client triggers `router.refresh()` to pull updated server state.

## Global Client State (Zustand)
Implemented in `src/lib/state/*`:
- `ui` slice: nav, cart drawer, modal, overlay, toast flags.
- `checkoutDraft` slice: temporary draft inputs only (no Medusa entities).

## Real End-to-End Flow Implemented
Product add-to-cart is now wired through the scaffold:
1. `src/modules/products/components/product-actions/index.tsx` calls server action `addToCart` from `src/lib/data/cart.ts`.
2. `addToCart` updates Medusa cart and revalidates cart-related tags.
3. Client calls `router.refresh()`.
4. `src/app/[countryCode]/(main)/layout.tsx` reloads cart server state.
5. `src/components/layout/topbar.tsx` receives fresh cart and renders `src/modules/cart/components/cart-drawer/index.tsx`.
6. Zustand `ui` action opens the cart drawer for immediate feedback.

## Anti-Patterns Explicitly Blocked
- No Medusa entity storage in Zustand.
- No Redux / parallel global app-state system.
- No ad-hoc SDK calls inside random feature components.
- Legacy cart context removed from runtime path (`src/providers.tsx`).

## Current Runtime Providers
- Allowed narrow context: theme provider.
- Global app state: Zustand only (`src/lib/state/store.ts`).
