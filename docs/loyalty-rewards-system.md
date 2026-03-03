# Loyalty Rewards System (Implementation Reference)

Last updated: March 2, 2026
Primary repos:
- Storefront: `total-hemp-consumables-storefront`
- Backend: `total-hemp-consumables`

## Purpose
This document is the implementation source of truth for the current loyalty system so future agents can safely extend, debug, or refactor it.

## Current Business Rules
- Loyalty is customer-account based (guest carts cannot use loyalty).
- Customers earn points after completed orders when no loyalty redemption is used.
- Customers redeem points by applying a customer-scoped, single-use promotion to cart.
- Current economics target about 5% rewards value:
  - Earn rate: `1` point per `1` currency unit spent.
  - Redeem rate: `20` points per `1` currency unit discount.
  - Example: spend `$100` -> earn `100` points -> redeem for about `$5`.
- Cart completion re-validates loyalty balance to prevent overspending edge cases.

## Backend Architecture
All core logic is in Medusa backend workflows/modules, not route handlers.

### Module
- Path: `total-hemp-consumables/src/modules/loyalty`
- Module key: `LOYALTY_MODULE = "loyalty"`
- Registered in backend config at `total-hemp-consumables/medusa-config.ts`

### Data Models
- `models/loyalty-point.ts`
  - One balance row per customer (`customer_id` unique).
- `models/loyalty-transaction.ts`
  - Ledger/history row for each earn/redeem/manual operation.
  - Tracks `type`, signed `points`, `balance_after`, optional `order_id`, `cart_id`, and `reason`.

### Service
- Path: `src/modules/loyalty/service.ts`
- Key methods:
  - `getPoints(customerId)`
  - `addPoints(customerId, points, context?)`
  - `deductPoints(customerId, points, context?)`
  - `calculateEarnPointsFromAmount(amount)` -> `floor(amount * earnRate)`
  - `calculateRedeemPointsFromAmount(amount)` -> `ceil(amount * redeemRate)`
  - `calculateAmountFromRedeemPoints(points)` -> `floor(points / redeemRate)`
  - `getPointsHistory(customerId, limit, offset)`
- Env overrides:
  - `LOYALTY_EARN_POINTS_PER_CURRENCY_UNIT` (default `1`)
  - `LOYALTY_REDEEM_POINTS_PER_CURRENCY_UNIT` (default `20`)

### Workflows
- Folder: `src/workflows/loyalty`
- `apply-loyalty-on-cart.ts`
  - Validates customer/cart ownership.
  - Rejects duplicate loyalty promo.
  - Acquires cart lock.
  - Calculates discount amount from available points.
  - Creates promotion tied to `customer_id` rule.
  - Applies promo to cart and saves `metadata.loyalty_promo_id`.
- `remove-loyalty-from-cart.ts`
  - Validates customer/cart ownership.
  - Removes promo code, clears `metadata.loyalty_promo_id`, deactivates loyalty promo.
- `handle-order-points.ts`
  - Runs on `order.placed`.
  - If loyalty promo used: deduct points and deactivate promo.
  - If no loyalty promo used: add points from order total.

### Steps and Guards
- `validate-customer-exists.ts`: requires registered customer account.
- `validate-cart-customer-ownership.ts`: actor must own cart customer.
- `get-cart-loyalty-promo.ts`: utility step for found/not-found checks.
- `get-cart-loyalty-promo-amount.ts`: computes capped discount from points.
- `add-purchase-as-points.ts` / `deduct-purchase-points.ts`: include compensation handlers.

### Hook and Subscriber
- Complete-cart validation hook:
  - `src/workflows/hooks/complete-cart.ts`
  - Enforces enough points at final checkout validation.
- Hook load is ensured by module import in:
  - `src/modules/loyalty/index.ts`
- Event subscriber:
  - `src/subscribers/order-placed-loyalty.ts`
  - Event: `order.placed`
  - Executes `handleOrderPointsWorkflow`.

### API Routes
- `GET /store/customers/me/loyalty-points`
  - Returns `{ points }`
- `GET /store/customers/me/loyalty-points/history?limit=&offset=`
  - Returns `{ history, count, limit, offset }`
- `POST /store/carts/:id/loyalty-points`
  - Applies loyalty promo on cart for authenticated cart owner.
- `DELETE /store/carts/:id/loyalty-points`
  - Removes applied loyalty promo for authenticated cart owner.

### Route Middleware and Validation
- Cart loyalty route middleware:
  - `src/api/store/carts/[id]/loyalty-points/middlewares.ts`
  - Requires customer auth (`session` or `bearer`) for POST/DELETE.
- History query validation:
  - `src/api/store/customers/me/loyalty-points/history/middlewares.ts`
  - `limit` constrained to `1..100`; `offset >= 0`.
- API error normalization:
  - `src/api/store/carts/[id]/loyalty-points/route.ts`
  - Maps known Medusa errors to consistent HTTP statuses/messages.

## Storefront Integration

### Data Layer (SDK)
- `src/lib/data/customer.ts`
  - `getLoyaltyPoints()`
  - `getLoyaltyPointsHistory({ limit, offset })`
  - `getLoyaltySummary()`
- `src/lib/data/cart.ts`
  - `applyLoyaltyPointsOnCart()`
  - `removeLoyaltyPointsOnCart()`
- Custom endpoints use `sdk.client.fetch(...)` with auth headers.

### UI Surfaces
- Checkout loyalty panel:
  - `src/modules/checkout/components/loyalty-points/index.tsx`
  - Supports apply/remove states, loading/error, explainers.
- Checkout summary placement:
  - `src/modules/checkout/templates/checkout-summary/index.tsx`
- Discount row de-duplication (loyalty promo hidden in promo list while totals remain accurate):
  - `src/modules/checkout/components/discount-code/index.tsx`
- Member banner and explainer:
  - `src/components/layout/member-rewards-banner.tsx`
- Account dashboard loyalty widgets and dedicated page:
  - `src/modules/account/components/overview/index.tsx`
  - `src/modules/account/components/loyalty/index.tsx`
- Content explanation page:
  - `src/app/[countryCode]/(main)/content/loyalty-rewards/page.tsx`

## End-to-End Flow Summary
1. Customer signs in.
2. Customer applies loyalty in checkout (`POST /store/carts/:id/loyalty-points`).
3. Backend creates customer-scoped promo and marks cart metadata.
4. Checkout totals reflect discount.
5. On complete-cart validate hook, backend re-checks available points.
6. On `order.placed`:
   - Redeem path: points deducted, promo deactivated.
   - Earn path: points added from order amount.
7. Customer sees updated balance/history in account and checkout.

## Manual Ops Script
- Backend helper script:
  - `total-hemp-consumables/src/scripts/credit-loyalty-points.ts`
- Supports manual add/deduct for a customer email.
- Env inputs include:
  - `LOYALTY_CUSTOMER_EMAIL`
  - `LOYALTY_POINTS`
  - `LOYALTY_OPERATION` (`add` or `deduct`)
  - `LOYALTY_REASON`

## Testing References
- Live testing runbook:
  - `total-hemp-consumables-storefront/docs/loyalty-live-testing.md`
- Recommended checks:
  - Apply/remove loyalty on owned cart.
  - Confirm 403 for non-owned cart attempt.
  - Confirm history and balance endpoints.
  - Complete one redeem order and one earn order.

## Change Management: Updating Reward Percentage
If changing rewards value again, update all of the following together:
1. Backend conversion constants (or env overrides) in `src/modules/loyalty/service.ts`.
2. Storefront copy mentioning reward percentage:
   - Banner modal
   - Checkout explainer
   - FAQ
   - Loyalty rewards content page
3. Re-test earn and redeem paths end-to-end.

## Known Constraints
- Rounding is intentional:
  - Earn uses floor.
  - Redeem points uses ceil.
  - Redeem amount from points uses floor.
- Loyalty promos are generated per cart/customer and should not be reused.
- Discount amount is capped at cart amount.
- Ownership checks block applying loyalty on other customers' carts.
