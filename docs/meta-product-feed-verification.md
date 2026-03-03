# Meta Product Feed Verification

This storefront lane does not modify backend feed generation.  
Use this documented check path to verify feed visibility for operators/devs.

## Check Path

Use the Medusa backend base URL with:

`/product-feed?currency_code=<currency>&country_code=<country>`

Example:

`http://localhost:9000/product-feed?currency_code=usd&country_code=us`

## Quick Validation

1. Open the URL in a browser and confirm XML is returned.
2. Confirm the response includes `<rss` and at least one `<item>` when products exist.
3. If empty or invalid, confirm:
   - `currency_code` is a valid 3-letter code.
   - `country_code` is a valid 2-letter code.
   - The backend has published products for the requested region/currency context.

## cURL Check

```bash
curl -i "http://localhost:9000/product-feed?currency_code=usd&country_code=us"
```

Expected:
- `HTTP/1.1 200`
- `Content-Type: application/xml; charset=utf-8`
