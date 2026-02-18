# State Architecture

## State Ownership Model

## 1. Server State (authoritative)
Owned by Medusa and read/mutated through `src/lib/data/*`.
- Cart
- Customer
- Product/catalog
- Category/collection
- Region
- Shipping/payment methods

Pattern:
- Read in server components/routes.
- Mutate with server actions in `src/lib/data/*`.
- Revalidate tags and refresh route.

## 2. Global Client State (UI/app only)
Owned by Zustand in `src/lib/state/*`.

Files:
- `src/lib/state/store.ts`
- `src/lib/state/slices/ui-slice.ts`
- `src/lib/state/slices/checkout-draft-slice.ts`
- `src/lib/state/selectors.ts`

### `ui` Slice
Fields:
- `isNavOpen`
- `isCartDrawerOpen`
- `activeModal`
- `isOverlayVisible`
- `toastEnabled`

Actions:
- Nav: `openNav`, `closeNav`, `setNavOpen`
- Cart drawer: `openCartDrawer`, `closeCartDrawer`, `setCartDrawerOpen`
- Modal: `openModal`, `closeModal`
- Overlay/toast flags: `setOverlayVisible`, `setToastEnabled`

### `checkoutDraft` Slice
Temporary unsaved input only:
- `email`
- `phone`
- `marketingOptIn`
- `notes`

Actions:
- `setCheckoutDraftField`
- `patchCheckoutDraft`
- `resetCheckoutDraft`

## 3. URL State (shareable)
Filters, sort, pagination, and query belong in search params.
- Existing PLP logic should continue to read/write URL params.

## 4. Local Form State
Form state stays local to components:
- React local state / `useActionState`
- Schema validation with Zod

## Rules
- Do not place Medusa entities in Zustand.
- Do not create broad React Context app state.
- Do not call Medusa SDK directly from random UI components.
- Keep SDK interactions in `src/lib/data/*`.
