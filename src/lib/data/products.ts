"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

const resolvedSalesChannels = new Map<string, string | null>()
let cachedDefaultSalesChannelId: string | null | undefined

const getDefaultStoreSalesChannelId = async (
  headers: Record<string, string>
) => {
  if (typeof cachedDefaultSalesChannelId !== "undefined") {
    return cachedDefaultSalesChannelId
  }

  try {
    const { store } = await sdk.client.fetch<{ store: any }>("/store", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    cachedDefaultSalesChannelId =
      store?.default_sales_channel_id ??
      store?.default_sales_channel?.id ??
      null

    return cachedDefaultSalesChannelId
  } catch (error) {
    cachedDefaultSalesChannelId = null
    return null
  }
}

const resolveSalesChannelId = async (
  regionId: string,
  headers: Record<string, string>
) => {
  const defaultSalesChannelId = await getDefaultStoreSalesChannelId(headers)
  if (defaultSalesChannelId) {
    return defaultSalesChannelId
  }

  if (resolvedSalesChannels.has(regionId)) {
    return resolvedSalesChannels.get(regionId)
  }

  try {
    const { cart } = await sdk.store.cart.create(
      { region_id: regionId },
      {},
      headers
    )

    const salesChannelId = cart?.sales_channel_id ?? null
    resolvedSalesChannels.set(regionId, salesChannelId)

    return salesChannelId
  } catch (error) {
    resolvedSalesChannels.set(regionId, null)
    return null
  }
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam === 1) ? 0 : (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // --- Enhanced Caching Policy ---
  // Create a cache tag that is unique per region and query params
  let idPart = "all"
  if (queryParams?.id) {
    if (Array.isArray(queryParams.id)) {
      idPart = queryParams.id.join(",")
    } else {
      idPart = queryParams.id
    }
  }
  const cacheTag = [
    "products",
    region.id,
    idPart
  ].join("-")

  // Use getCacheOptions for consistency and set a 30 day revalidation
  const next = {
    ...(await getCacheOptions(cacheTag))
  }

  const salesChannelId = await resolveSalesChannelId(region.id, headers)

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region.id,
          ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+variants.options,+variants.metadata,+metadata,+tags,+type",
          ...queryParams,
        },
        headers,
        next,
        cache: 'force-cache',
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null
      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
