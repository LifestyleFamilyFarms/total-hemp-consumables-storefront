# Agent Notes

- Default to the Medusa JS SDK for **all** Medusa models (carts, products, regions, fulfillment, etc.). Hand-rolled fetches are allowed only when the SDK lacks coverage—document any exceptions.
- Treat backend shipping math (ShipStation amounts, cents vs dollars) as the single source of truth; the frontend should display what the cart returns without extra scaling.
- Local JS SDK docs (auth, store, admin) are stored at `../docs/js-sdk`; use them for version-accurate method signatures.
