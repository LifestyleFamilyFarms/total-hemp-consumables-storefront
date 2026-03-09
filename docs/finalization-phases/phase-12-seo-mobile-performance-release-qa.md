# Phase 12 Finalization: SEO, Mobile, Performance, Release QA

Status: Pending

## Goal
Complete launch validation for discoverability, performance, and responsive quality.

## Pass Checklist
- [ ] Metadata/canonicals/schema are valid on key routes.
- [ ] `robots.txt` and `sitemap.xml` are correct for launch env.
- [ ] Core responsive checks pass on `390x844`, `1024x768`, `1440x900`.
- [ ] Lighthouse/PageSpeed pass is documented with action items.
- [ ] Final lint/build checks are green.

## Evidence Required
- SEO route verification notes.
- Responsive review notes and remaining UI defects.
- Lighthouse/PageSpeed report summary.

## Deep-Dive Agent Prompt
```text
Run a Phase 12 finalization pass for SEO/mobile/performance/release QA.

Use skills:
- storefront-best-practices
- building-storefronts

Goal:
Produce a production readiness verdict with objective evidence.

Deliverable:
- Go-live risk report (critical/high/medium)
- Final pass/fail recommendation with required remediations
```
