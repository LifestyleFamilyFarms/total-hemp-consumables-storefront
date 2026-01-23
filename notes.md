CartProvider notes:
- Accepts optional regionId/salesChannelId props and uses them when creating the cart.
- Exposes setRegion and attachCustomer helpers to realign a cart after login or region change.
- Persists cart id in localStorage under "medusa_cart_id".
