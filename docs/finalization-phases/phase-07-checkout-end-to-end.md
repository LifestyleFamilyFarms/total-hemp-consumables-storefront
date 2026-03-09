# Phase 07 Finalization: Checkout End-to-End

Status: Pending

## Goal
Validate shipping, payment, and loyalty behavior in a full checkout flow.

## Pass Checklist
- [ ] Checkout step progression works in `pickup_only` mode.
- [ ] Address handling and validation reduce user error.
- [ ] Payment path is verified for current provider setup.
- [ ] Loyalty apply/remove and final validation are stable.
- [ ] Checkout UI is legible and theme-consistent on target devices.

## Evidence Required
- One successful end-to-end order placement summary.
- One loyalty-redeem checkout summary.
- Any payment-session caveats documented.

## Deep-Dive Agent Prompt
```text
Run a Phase 07 finalization pass for checkout.

Use skills:
- storefront-best-practices
- building-storefronts
- building-with-medusa

Goal:
Prove checkout is production-safe for current shipping/payment configuration.

Deliverable:
- End-to-end scenario matrix (guest/member, with/without loyalty)
- Blocking UX or functional issues
```
