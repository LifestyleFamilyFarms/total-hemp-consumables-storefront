"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type ProductReviewStatus = "pending" | "approved" | "rejected" | string

export type ProductReview = {
  id: string
  title?: string | null
  content?: string | null
  rating?: number | null
  first_name?: string | null
  last_name?: string | null
  status?: ProductReviewStatus
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export type ProductReviewsResponse = {
  reviews: ProductReview[]
  average_rating?: number
  count: number
  limit: number
  offset: number
}

export const listProductReviews = async ({
  productId,
  limit = 8,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(`product-reviews-${productId}`)),
  }

  return sdk.client
    .fetch<ProductReviewsResponse>(`/store/products/${productId}/reviews`, {
      method: "GET",
      headers,
      query: {
        limit,
        offset,
        order: "-created_at",
      },
      next,
      cache: "no-store",
    })
    .then((response) => ({
      reviews: Array.isArray(response.reviews) ? response.reviews : [],
      count: typeof response.count === "number" ? response.count : 0,
      limit: typeof response.limit === "number" ? response.limit : limit,
      offset: typeof response.offset === "number" ? response.offset : offset,
      average_rating:
        typeof response.average_rating === "number"
          ? response.average_rating
          : undefined,
    }))
    .catch(medusaError)
}

export const createProductReview = async ({
  productId,
  title,
  content,
  rating,
}: {
  productId: string
  title?: string
  content: string
  rating: number
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ review: ProductReview }>(`/store/products/${productId}/reviews`, {
      method: "POST",
      headers,
      body: {
        title,
        content,
        rating,
      },
      next: {
        ...(await getCacheOptions(`product-reviews-${productId}`)),
      },
      cache: "no-store",
    })
    .catch(medusaError)
}
