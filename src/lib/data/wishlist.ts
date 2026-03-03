"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"

type WishlistProduct = {
  id?: string
  title?: string
  handle?: string
  thumbnail?: string | null
}

type WishlistProductVariant = {
  id?: string
  title?: string
  sku?: string | null
  product?: WishlistProduct | null
}

export type WishlistItem = {
  id: string
  wishlist_id?: string
  product_variant_id?: string
  variant_id?: string
  product_variant?: WishlistProductVariant | null
  [key: string]: unknown
}

export type Wishlist = {
  id: string
  customer_id?: string
  sales_channel_id?: string
  items: WishlistItem[]
  [key: string]: unknown
}

type BackendWishlist = {
  id: string
  customer_id?: string
  sales_channel_id?: string
}

type BackendWishlistItem = {
  id: string
  wishlist_id: string
  variant_id: string
  variant?: WishlistProductVariant | null
  [key: string]: unknown
}

type BackendWishlistGetResponse = {
  wishlist: BackendWishlist | null
  items?: BackendWishlistItem[]
}

export type AddWishlistItemResponse = {
  wishlist_id: string
  item: BackendWishlistItem
}

export type DeleteWishlistItemResponse = {
  id: string
  removed: boolean
}

const normalizeWishlistItem = (item: BackendWishlistItem): WishlistItem => ({
  ...item,
  wishlist_id: item.wishlist_id,
  variant_id: item.variant_id,
  product_variant_id: item.variant_id,
  product_variant: item.variant || null,
})

const normalizeWishlist = (payload: BackendWishlistGetResponse): Wishlist | null => {
  if (!payload.wishlist) {
    return null
  }

  return {
    id: payload.wishlist.id,
    customer_id: payload.wishlist.customer_id,
    sales_channel_id: payload.wishlist.sales_channel_id,
    items: (payload.items || []).map(normalizeWishlistItem),
  }
}

const hasAuthorizationHeader = (headers: Record<string, string>) =>
  typeof headers.authorization === "string" && headers.authorization.length > 0

const isNotFoundOrAuthError = (error: any) => {
  const status = error?.response?.status
  return status === 401 || status === 403 || status === 404
}

export const getCustomerWishlist = async (): Promise<Wishlist | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  } as Record<string, string>

  if (!hasAuthorizationHeader(headers)) {
    return null
  }

  const next = {
    ...(await getCacheOptions("wishlists")),
  }

  try {
    const response = await sdk.client.fetch<BackendWishlistGetResponse>(
      "/store/customers/me/wishlists",
      {
        method: "GET",
        headers,
        next,
        cache: "no-store",
      }
    )

    return normalizeWishlist(response)
  } catch (error) {
    if (isNotFoundOrAuthError(error)) {
      return null
    }

    medusaError(error)
  }
}

export const addWishlistItem = async (variantId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<AddWishlistItemResponse>("/store/customers/me/wishlists/items", {
      method: "POST",
      headers,
      body: {
        variant_id: variantId,
      },
      next: {
        ...(await getCacheOptions("wishlists")),
      },
      cache: "no-store",
    })
    .catch(medusaError)
}

export const deleteWishlistItem = async (itemId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<DeleteWishlistItemResponse>(`/store/customers/me/wishlists/items/${itemId}`, {
      method: "DELETE",
      headers,
      next: {
        ...(await getCacheOptions("wishlists")),
      },
      cache: "no-store",
    })
    .catch(medusaError)
}
