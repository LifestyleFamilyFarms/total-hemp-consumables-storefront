#!/usr/bin/env node

const MedusaSDK = require("@medusajs/js-sdk")
const fs = require("node:fs")
const path = require("node:path")

const Medusa = MedusaSDK.default ?? MedusaSDK

const loadDotEnv = () => {
  const envPath = path.join(process.cwd(), ".env")
  if (!fs.existsSync(envPath)) {
    return
  }

  const lines = fs.readFileSync(envPath, "utf8").split("\n")
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }

    const eqIdx = line.indexOf("=")
    if (eqIdx < 0) {
      continue
    }

    const key = line.slice(0, eqIdx).trim()
    const value = line.slice(eqIdx + 1).trim()

    if (!key) {
      continue
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

const backendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"
const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  process.env.MEDUSA_DEV_PUBLISHABLE_KEY ||
  ""
const email = process.env.LOYALTY_TEST_EMAIL || ""
const password = process.env.LOYALTY_TEST_PASSWORD || ""
const shouldCompleteRedeem = process.argv.includes("--complete-redeem")

const fail = (message) => {
  console.error(`FAIL: ${message}`)
  process.exit(1)
}

const pass = (message) => {
  console.log(`PASS: ${message}`)
}

const ensure = (condition, message) => {
  if (!condition) {
    fail(message)
  }
}

const isForbiddenError = (error) => {
  if (!error || typeof error !== "object") {
    return false
  }

  const status = error?.status || error?.response?.status
  if (status === 403) {
    return true
  }

  const text = `${error?.message || ""} ${error?.response?.data?.message || ""}`.toLowerCase()
  return text.includes("403") || text.includes("not allowed")
}

if (!publishableKey) {
  fail(
    "Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY or MEDUSA_DEV_PUBLISHABLE_KEY."
  )
}

if (!email || !password) {
  fail(
    "Missing loyalty test credentials. Set LOYALTY_TEST_EMAIL and LOYALTY_TEST_PASSWORD."
  )
}

const authedSdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
  auth: {
    type: "jwt",
  },
})

const guestSdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
  auth: {
    type: "jwt",
  },
})

const summary = {
  backend_url: backendUrl,
  customer_email: email,
  complete_redeem: shouldCompleteRedeem,
  points_before: null,
  points_after: null,
  history_count: null,
  guest_ownership_403: false,
  apply_remove_cycle_ok: false,
  complete_type: null,
  order_id: null,
}

async function main() {
  const loginResult = await authedSdk.auth.login("customer", "emailpass", {
    email,
    password,
  })

  ensure(
    typeof loginResult === "string",
    "Customer login did not return a JWT token."
  )

  const authHeaders = {
    Authorization: `Bearer ${loginResult}`,
  }

  pass("Customer login succeeded.")

  const pointsResponse = await authedSdk.client.fetch(
    "/store/customers/me/loyalty-points",
    {
      method: "GET",
      headers: authHeaders,
    }
  )

  ensure(
    typeof pointsResponse?.points === "number",
    "Could not read customer loyalty points."
  )

  summary.points_before = pointsResponse.points
  pass(`Fetched loyalty points (${pointsResponse.points}).`)

  const historyResponse = await authedSdk.client.fetch(
    "/store/customers/me/loyalty-points/history",
    {
      method: "GET",
      headers: authHeaders,
      query: {
        limit: 5,
        offset: 0,
      },
    }
  )

  ensure(
    Array.isArray(historyResponse?.history),
    "Could not read customer loyalty history."
  )
  summary.history_count = Number(historyResponse?.count || 0)
  pass(`Fetched loyalty history (${summary.history_count} records).`)

  const { regions } = await guestSdk.store.region.list()
  const regionId = regions?.[0]?.id
  ensure(regionId, "No store region found for live loyalty smoke test.")

  const { products } = await guestSdk.store.product.list({
    limit: 1,
    fields: "*variants",
  })

  const variantId = products?.[0]?.variants?.[0]?.id
  ensure(variantId, "No product variant found for live loyalty smoke test.")

  const { cart: guestCart } = await guestSdk.store.cart.create({
    region_id: regionId,
    items: [{ variant_id: variantId, quantity: 1 }],
  })

  ensure(guestCart?.id, "Failed to create guest cart.")

  try {
    await authedSdk.client.fetch(`/store/carts/${guestCart.id}/loyalty-points`, {
      method: "POST",
      headers: authHeaders,
      body: {},
    })
  } catch (error) {
    if (isForbiddenError(error)) {
      summary.guest_ownership_403 = true
      pass("Ownership guard returned 403 for non-owned cart.")
    } else {
      throw error
    }
  }

  ensure(
    summary.guest_ownership_403,
    "Ownership check did not return a forbidden response."
  )

  const { cart: flowCart } = await guestSdk.store.cart.create({
    region_id: regionId,
    items: [{ variant_id: variantId, quantity: 1 }],
  })

  ensure(flowCart?.id, "Failed to create loyalty flow cart.")

  await authedSdk.store.cart.transferCart(flowCart.id, {}, authHeaders)

  const { cart: ownedCart } = await authedSdk.store.cart.retrieve(
    flowCart.id,
    {},
    authHeaders
  )
  ensure(ownedCart?.customer_id, "Cart transfer did not associate a customer.")

  const applyResponse = await authedSdk.client.fetch(
    `/store/carts/${flowCart.id}/loyalty-points`,
    {
      method: "POST",
      headers: authHeaders,
      body: {},
    }
  )

  ensure(
    Boolean(applyResponse?.cart?.metadata?.loyalty_promo_id),
    "Loyalty promotion was not applied to cart metadata."
  )

  const removeResponse = await authedSdk.client.fetch(
    `/store/carts/${flowCart.id}/loyalty-points`,
    {
      method: "DELETE",
      headers: authHeaders,
      body: {},
    }
  )

  ensure(
    !removeResponse?.cart?.metadata?.loyalty_promo_id,
    "Loyalty promotion metadata was not cleared after removal."
  )

  ensure(
    (removeResponse?.cart?.promotions || []).length === 0,
    "Loyalty promotion still present on cart after removal."
  )

  summary.apply_remove_cycle_ok = true
  pass("Apply/remove loyalty cycle succeeded on owned cart.")

  if (shouldCompleteRedeem) {
    const applyBeforeComplete = await authedSdk.client.fetch(
      `/store/carts/${flowCart.id}/loyalty-points`,
      {
        method: "POST",
        headers: authHeaders,
        body: {},
      }
    )

    ensure(
      Boolean(applyBeforeComplete?.cart?.metadata?.loyalty_promo_id),
      "Could not re-apply loyalty promotion before complete-cart check."
    )

    const completeResult = await authedSdk.store.cart.complete(
      flowCart.id,
      {},
      authHeaders
    )
    summary.complete_type = completeResult?.type || null
    summary.order_id = completeResult?.order?.id || null

    ensure(
      completeResult?.type === "order",
      `Complete cart did not place an order. Received type: ${completeResult?.type || "unknown"}`
    )

    pass(`Redeem completion placed order ${completeResult.order.id}.`)
  }

  const pointsAfterResponse = await authedSdk.client.fetch(
    "/store/customers/me/loyalty-points",
    {
      method: "GET",
      headers: authHeaders,
    }
  )

  ensure(
    typeof pointsAfterResponse?.points === "number",
    "Could not re-read customer loyalty points."
  )

  summary.points_after = pointsAfterResponse.points
  pass(`Post-check loyalty points fetched (${pointsAfterResponse.points}).`)

  console.log("\nLive loyalty smoke summary:")
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error("FAIL: loyalty live smoke error")
  console.error(error)
  process.exit(1)
})
