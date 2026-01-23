# Storefront Code Review — 2025-10-03

## Project Readiness Snapshot
- **Target**: MVP live by end of week.
- **Storefront stack**: Next.js 15 (App Router) + React 19 RC, Tailwind/Radix UI, Medusa JS SDK, nonce-based CSP.
- **Overall maturity**: Core navigation and PDP/PLP improvements exist; maintenance mode landing page ready. Must address secrets exposure, missing PDP polish, analytics, and testing gaps.

## Critical Findings (address immediately)
- **Secrets management** — `.env` holds live Medusa admin and Authorize.Net credentials. The file is git-ignored; keep it private, rotate if there’s any possibility of prior exposure, and ensure production deployments source secrets from secure env management.
- **Runtime risk: Next.js 15 + React 19 RC** — RC builds may shift; confirm hosting (Railway/Vercel) supports current canary or pin to stable versions before launch.
- **Maintenance allowlist drift** — `.env` still sets `ALLOWED_PATHS=/us/gamma-gummies`; update to `/maintenance` prior to enabling maintenance mode to avoid bypass.

## High-Priority Gaps
- **Category PLPs incomplete** — `total-hemp-consumables-storefront/src/modules/store/templates/index.tsx:53` always labels pages “All products”. Need per-category headings/metadata for `/flower`, `/edibles`, `/vapes`.
- **PDP facts row outstanding** — From status doc; implement weight/dose/serving “facts” prior to launch.
- **Analytics/observability missing** — No PostHog or event tracking; at minimum log page views/cart/checkout to validate funnel post-launch.
- **Testing coverage** — No automated smoke/e2e tests. Add at least Playwright smoke or Cypress for PLP/PDP/cart/checkout before go-live.

## Medium-Priority Observations
- **Maintenance page** (`total-hemp-consumables-storefront/src/app/maintenance/page.tsx`) now aligned, but ensure messaging matches customer comms and includes expected reopen date.
- **Middleware flow** (`total-hemp-consumables-storefront/src/middleware.ts:133`) relies on region cookie; regression tests needed for dev/prod toggles, especially with maintenance path overrides.
- **CSP report endpoint missing** — Still in report-only for dev; add `/api/csp-report` before strict enforcement.
- **Localization** — Hard-coded copy references US; confirm internationalization requirements or lock region to US only.

## Critical Path to MVP (Storefront)
1. **Secrets hygiene & env audit** — Rotate tokens, scrub `.env`, update deployment docs.
2. **UI polish** — Deliver PDP facts row, category headings/metadata, confirm copy approvals.
3. **Functional QA** — Manual + automated smoke tests covering browse→cart→checkout with Authorize.Net sandbox and ShipStation rates.
4. **Analytics & monitoring** — Add PostHog (or chosen analytics) instrumentation + error monitoring (Sentry) if possible.
5. **Maintenance toggle runbook** — Document steps to enable/disable `MAINTENANCE_MODE`, verify `/maintenance` is accessible, ensure `ALLOWED_PATHS` correct.

## Recommended Next Actions
- [ ] Replace committed secrets with `.env.example` placeholders; ensure deployments ingest values from secure config.
- [ ] Implement PDP facts row + category-specific headings before design review.
- [ ] Add smoke test workflow (Playwright/Cypress) for critical flows.
- [ ] Wire PostHog (or analytics tool) for navigation, PDP, cart, checkout events.
- [ ] Add CSP report endpoint and firm up content-security-policy in production.

## Delegation Guidance
When handing storefront tasks to execution agents, provide:
- Expected design references or copy approvals for UI updates.
- Browser/test matrix (desktop/mobile) and commands to run (e.g., `yarn build`, `yarn dev`).
- Verification steps for maintenance mode, analytics events, and checkout flows.
