"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions, setCartId } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*items.adjustments,*shipping_methods,*shipping_methods.adjustments,*metadata",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields:
          "*items,+items.metadata,*items.variant,*items.product,*items.adjustments,*shipping_methods,*shipping_methods.adjustments,*metadata",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export type ReorderItem = {
  id?: string
  order_item_id?: string
  title?: string
  quantity?: number
  variant_id?: string
  product_id?: string | null
  product_title?: string
  variant_title?: string
  reason?: string
  [key: string]: unknown
}

export type ReorderSuggestion = {
  id: string
  title: string
  sku?: string | null
}

export type ReorderSuggestionGroup = {
  order_item_id?: string
  original_variant_id?: string | null
  product_id?: string
  variants?: ReorderSuggestion[]
  [key: string]: unknown
}

export type ReorderResponse = {
  cart_id?: string
  added_items?: ReorderItem[]
  unavailable_items?: ReorderItem[]
  suggested_variants?: ReorderSuggestionGroup[]
  [key: string]: unknown
}

export const reorderOrder = async (orderId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client
    .fetch<ReorderResponse>(`/store/customers/me/orders/${orderId}/reorder`, {
      method: "POST",
      headers,
      cache: "no-store",
    })
    .catch(medusaError)

  if (typeof response?.cart_id === "string" && response.cart_id) {
    await setCartId(response.cart_id)
  }

  return response
}
