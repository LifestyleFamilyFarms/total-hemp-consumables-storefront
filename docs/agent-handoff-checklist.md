# Agent Handoff Checklist

## Read First
- `docs/rebuild-handoff-status.md` (current status, ownership, and no-cross-stream scope)
- `docs/storefront-architecture.md`
- `docs/state-architecture.md`
- `docs/agent-b-acceptance-checklist.md` (required for Agent B pass/fail signoff)

## Boundary Checklist
- [ ] Route/layout logic stays in `src/app/*`.
- [ ] All Medusa reads/writes are in `src/lib/data/*`.
- [ ] Global client state changes go through `src/lib/state/*` only.
- [ ] No Medusa entities are stored in Zustand.
- [ ] URL-search state is used for shareable filters/sort/pagination/search.
- [ ] Form state is local and validated with Zod where needed.

## Implementation Checklist
- [ ] Reuse shadcn primitives from `src/components/ui/*` first.
- [ ] Add new primitives via shadcn workflow only when missing.
- [ ] Avoid introducing parallel UI primitive systems.
- [ ] Keep SDK calls out of presentation components.
- [ ] Revalidate cache tags in mutations that affect server state.
- [ ] Do not hardcode navigation categories; fetch from `src/lib/data/categories.ts`.

## Regression Checklist
- [ ] Register/login still functions.
- [ ] Cart transfer on auth still functions.
- [ ] Address CRUD still functions.
- [ ] Cart and checkout pages refresh correctly after mutations.

## Code Review Checklist
- [ ] New files are placed in correct architecture boundary.
- [ ] Server actions are typed and error-handled.
- [ ] Client components use selectors from `src/lib/state/selectors.ts`.
- [ ] No broad app context providers added.
- [ ] No reintroduction of legacy sidebar architecture.

## Required Commands Before Handoff
- `yarn lint`
- `yarn build`

## Notes for Next Feature Agents
- Add-to-cart flow is already scaffolded end-to-end using server actions + cache revalidation + Zustand UI drawer state.
- Use this pattern for future cart, PLP/PDP, and checkout enhancements.
