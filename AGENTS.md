# Agent Notes

- Use Medusa JS SDK for Medusa traffic by default; for custom routes use `sdk.client.fetch`.
- Keep `sdk.client.fetch` usage in `src/lib/data/*` only; UI/components should call data-layer helpers.
- Never pass `JSON.stringify(...)` into SDK request bodies; pass plain objects.
- Treat backend pricing/shipping values as source of truth. Do not add `/100` scaling heuristics in storefront display logic.
- Shipping mode is controlled by `NEXT_PUBLIC_CHECKOUT_SHIPPING_MODE` (`pickup_only` default, `full` to enable full carrier selection path).
- Local JS SDK docs (auth, store, admin) are stored at `../docs/js-sdk`; use them for version-accurate signatures.
