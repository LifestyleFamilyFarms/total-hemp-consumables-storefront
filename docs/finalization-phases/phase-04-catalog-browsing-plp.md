# Phase 04 Finalization: Catalog Browsing (PLP)

Status: Pending

## Goal
Validate URL-driven PLP behavior, filtering, sorting, and state restoration.

## Pass Checklist
- [ ] URL state restoration works for sort/page/filter combinations.
- [ ] Filter chips/drawers behave correctly on mobile and desktop.
- [ ] Product cards render pricing/tags/variant previews correctly.
- [ ] Empty/loading/error states are clear and actionable.

## Evidence Required
- URL state test cases and outcomes.
- Notes for category/collection parity.

## Deep-Dive Agent Prompt
```text
Run a Phase 04 finalization pass for PLP behavior.

Use skills:
- storefront-best-practices
- building-storefronts

Goal:
Stress-test URL-state PLP behavior and ensure user-visible product card data is correct.

Deliverable:
- Tested URL matrix and pass/fail
- UX issues that can impact conversion
```
