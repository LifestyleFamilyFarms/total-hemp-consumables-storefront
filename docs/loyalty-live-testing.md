# Loyalty Live Testing

Updated: 2026-02-27

## Purpose
Run fast loyalty flow checks during active development without screenshot loops.

This guide covers:
- API-level loyalty smoke checks (scripted).
- Manual browser checks for paid Authorize.Net sandbox path (Accept.js).

## Prerequisites
- Backend running at `http://localhost:9000` (or set `MEDUSA_BACKEND_URL`).
- Storefront environment contains a valid publishable key:
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (preferred), or
  - `MEDUSA_DEV_PUBLISHABLE_KEY`
- Test customer credentials available:
  - `LOYALTY_TEST_EMAIL`
  - `LOYALTY_TEST_PASSWORD`

## Scripted Smoke Check

Command:

```bash
LOYALTY_TEST_EMAIL=test@totalhemp.co \
LOYALTY_TEST_PASSWORD=testingtesting123 \
yarn qa:loyalty-live
```

What it verifies:
1. Customer auth works.
2. `GET /store/customers/me/loyalty-points` works.
3. `GET /store/customers/me/loyalty-points/history` works.
4. Ownership guard blocks non-owned cart loyalty apply (`403` expected).
5. Owned cart loyalty apply/remove cycle works.
6. Loyalty promo metadata is set/cleared correctly.

Optional (state-mutating) completion check:

```bash
LOYALTY_TEST_EMAIL=test@totalhemp.co \
LOYALTY_TEST_PASSWORD=testingtesting123 \
yarn qa:loyalty-live --complete-redeem
```

This attempts a full cart completion after re-applying loyalty. Use only when you intentionally want to place a test order.

## Manual Browser Check (Paid Authorize.Net Sandbox Path)

Use this when validating non-zero total checkout and earn-points behavior:

1. Start backend and storefront.
2. Sign in with test customer account.
3. Add a product and go to checkout.
4. Do **not** apply loyalty points (to test earn path).
5. Complete checkout in browser using Authorize.Net sandbox form/tokenization flow.
6. Confirm order placement succeeds.
7. Confirm loyalty balance increased:
   - Account loyalty dashboard (`/account/loyalty`) or
   - API response from `/store/customers/me/loyalty-points`.

## Notes
- API-only completion is not equivalent to full browser Accept.js tokenization for paid Authorize.Net flows.
- Prefer running scripted check first, then one manual paid checkout pass for final confidence.
