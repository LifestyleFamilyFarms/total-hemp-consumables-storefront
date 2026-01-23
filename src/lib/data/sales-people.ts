"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getSalesRepCode } from "./cookies"

export async function attachSalesRep({
  cartId,
  customerId,
  repCode,
}: {
  cartId?: string
  customerId?: string
  repCode?: string
}) {
  const code = repCode || (await getSalesRepCode())
  if (!code) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch(`/store/sales-people/attach`, {
    method: "POST",
    body: {
      rep_code: code,
      cart_id: cartId,
      customer_id: customerId,
    },
    headers,
  })
}
