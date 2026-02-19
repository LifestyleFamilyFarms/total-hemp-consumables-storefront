"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { DEFAULT_SORT, SortOptions } from "@modules/store/lib/sort-options"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getCategoryIdsByHandles } from "./categories"
import { getRegion, retrieveRegion } from "./regions"

const resolvedSalesChannels = new Map<string, string | null>()
let cachedDefaultSalesChannelId: string | null | undefined

type ProductListQueryParams = HttpTypes.StoreProductListParams

const PRODUCT_LIMIT = 12
const SORT_BATCH_LIMIT = 100
const SORT_MAX_PAGES = 20
const PRODUCT_LIST_FIELDS =
  "*options,*variants.calculated_price,+variants.inventory_quantity,+variants.options,+variants.metadata,+metadata,+tags,+type,+images.url,+images.rank"

export type PlpFacetOption = {
  value: string
  label: string
  count: number
}

export type PlpFacetGroups = {
  type: PlpFacetOption[]
  effect: PlpFacetOption[]
  compound: PlpFacetOption[]
}

type FacetRule = {
  value: string
  label: string
  pattern: RegExp
}

type FacetAccumulator = {
  label: string
  ids: Set<string>
  count: number
}

const EFFECT_RULES: FacetRule[] = [
  { value: "sleep", label: "Sleep", pattern: /\bsleep\b/i },
  { value: "focus", label: "Focus", pattern: /\bfocus\b/i },
  { value: "energy", label: "Energy", pattern: /\benergy\b/i },
  { value: "calm", label: "Calm", pattern: /\bcalm\b/i },
  { value: "relaxation", label: "Relaxation", pattern: /\brelax(ation)?\b/i },
  { value: "relief", label: "Relief", pattern: /\brelief\b/i },
  { value: "recovery", label: "Recovery", pattern: /\brecovery\b/i },
  { value: "mood", label: "Mood", pattern: /\bmood\b/i },
  { value: "balance", label: "Balance", pattern: /\bbalance\b/i },
  { value: "euphoria", label: "Euphoria", pattern: /\beuphoria\b/i },
]

const COMPOUND_RULES: FacetRule[] = [
  { value: "thc-free", label: "THC-Free", pattern: /\bthc[- ]?free\b/i },
  { value: "delta-9", label: "Delta-9", pattern: /\bdelta[- ]?9\b/i },
  { value: "cbd", label: "CBD", pattern: /\bcbd\b/i },
  { value: "cbg", label: "CBG", pattern: /\bcbg\b/i },
  { value: "thc", label: "THC", pattern: /\bthc\b/i },
]

const normalizeFacetValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ")

const slugifyFacetValue = (value: string) =>
  normalizeFacetValue(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

const titleizeFacetValue = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const createFacetAccumulator = (
  map: Map<string, FacetAccumulator>,
  value: string,
  label: string,
  id: string
) => {
  const existing = map.get(value)

  if (existing) {
    existing.ids.add(id)
    existing.count += 1
    return
  }

  map.set(value, {
    label,
    ids: new Set([id]),
    count: 1,
  })
}

const getMatchedRule = (rules: FacetRule[], value: string) =>
  rules.find((rule) => rule.pattern.test(value))

const toSortedFacetOptions = (map: Map<string, FacetAccumulator>): PlpFacetOption[] =>
  Array.from(map.entries())
    .map(([value, entry]) => ({
      value,
      label: entry.label,
      count: entry.count,
    }))
    .sort((left, right) => {
      if (left.count !== right.count) {
        return right.count - left.count
      }

      return left.label.localeCompare(right.label)
    })

const resolveFacetIds = (
  selectedValues: string[] | undefined,
  map: Map<string, FacetAccumulator>
) => {
  if (!selectedValues?.length) {
    return []
  }

  return Array.from(
    new Set(
      selectedValues.flatMap((value) => {
        const match = map.get(value)
        return match ? Array.from(match.ids) : []
      })
    )
  )
}

const resolvePlpCategoryIds = async ({
  categoryHandles,
  categoryId,
}: {
  categoryHandles?: string[]
  categoryId?: string
}) => {
  const handleCategoryIds = categoryHandles?.length
    ? await getCategoryIdsByHandles(categoryHandles)
    : []

  return Array.from(new Set([...(categoryId ? [categoryId] : []), ...handleCategoryIds]))
}

const buildPlpBaseQueryParams = ({
  q,
  categoryIds,
  collectionId,
  productsIds,
}: {
  q?: string
  categoryIds?: string[]
  collectionId?: string
  productsIds?: string[]
}): ProductListQueryParams => ({
  limit: PRODUCT_LIMIT,
  ...(q ? { q } : {}),
  ...(categoryIds?.length ? { category_id: categoryIds } : {}),
  ...(collectionId ? { collection_id: [collectionId] } : {}),
  ...(productsIds?.length ? { id: productsIds } : {}),
})

const collectFacetIndex = ({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) => {
  const typeMap = new Map<string, FacetAccumulator>()
  const effectMap = new Map<string, FacetAccumulator>()
  const compoundMap = new Map<string, FacetAccumulator>()

  for (const product of products) {
    const typeId = product.type?.id
    const typeValue = product.type?.value

    if (typeId && typeValue) {
      const slug = slugifyFacetValue(typeValue)
      const label = titleizeFacetValue(typeValue)

      if (slug) {
        createFacetAccumulator(typeMap, slug, label, typeId)
      }
    }

    const seenEffectValues = new Set<string>()
    const seenCompoundValues = new Set<string>()

    for (const tag of product.tags || []) {
      const tagId = tag.id
      const tagValue = tag.value

      if (!tagId || !tagValue) {
        continue
      }

      const normalized = normalizeFacetValue(tagValue)
      const effectRule = getMatchedRule(EFFECT_RULES, normalized)
      const compoundRule = getMatchedRule(COMPOUND_RULES, normalized)

      if (effectRule && !seenEffectValues.has(effectRule.value)) {
        seenEffectValues.add(effectRule.value)
        createFacetAccumulator(effectMap, effectRule.value, effectRule.label, tagId)
      }

      if (compoundRule && !seenCompoundValues.has(compoundRule.value)) {
        seenCompoundValues.add(compoundRule.value)
        createFacetAccumulator(
          compoundMap,
          compoundRule.value,
          compoundRule.label,
          tagId
        )
      }
    }
  }

  return {
    typeMap,
    effectMap,
    compoundMap,
  }
}

const getPlpFacetIndex = async ({
  countryCode,
  queryParams,
}: {
  countryCode: string
  queryParams: ProductListQueryParams
}) => {
  const { products } = await collectProductsForSort({
    countryCode,
    queryParams,
  })

  return collectFacetIndex({ products })
}

const dedupeProductsById = (products: HttpTypes.StoreProduct[]) => {
  const seen = new Set<string>()
  const deduped: HttpTypes.StoreProduct[] = []

  for (const product of products) {
    if (!product?.id || seen.has(product.id)) {
      continue
    }

    seen.add(product.id)
    deduped.push(product)
  }

  return deduped
}

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
  } catch {
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
  } catch {
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
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || PRODUCT_LIMIT
  const currentPage = Math.max(pageParam, 1)
  const offset = currentPage === 1 ? 0 : (currentPage - 1) * limit

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

  let idPart = "all"
  if (queryParams?.id) {
    if (Array.isArray(queryParams.id)) {
      idPart = queryParams.id.join(",")
    } else {
      idPart = queryParams.id
    }
  }

  const cacheTag = ["products", region.id, idPart].join("-")

  const next = {
    ...(await getCacheOptions(cacheTag)),
  }

  const salesChannelId = await resolveSalesChannelId(region.id, headers)

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      "/store/products",
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region.id,
          ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
          fields: PRODUCT_LIST_FIELDS,
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const dedupedProducts = dedupeProductsById(products)
      const nextPage = count > offset + limit ? currentPage + 1 : null
      return {
        response: {
          products: dedupedProducts,
          count,
        },
        nextPage,
        queryParams,
      }
    })
}

const collectProductsForSort = async ({
  countryCode,
  queryParams,
}: {
  countryCode: string
  queryParams?: ProductListQueryParams
}) => {
  const products: HttpTypes.StoreProduct[] = []
  let count = 0
  let currentPage = 1
  let guard = 0

  while (guard < SORT_MAX_PAGES) {
    guard += 1

    const { response, nextPage } = await listProducts({
      pageParam: currentPage,
      queryParams: {
        ...queryParams,
        limit: SORT_BATCH_LIMIT,
      },
      countryCode,
    })

    count = response.count
    products.push(...response.products)

    if (!nextPage || products.length >= count) {
      break
    }

    currentPage = nextPage
  }

  const dedupedProducts = dedupeProductsById(products)

  return {
    products: dedupedProducts.slice(0, count || dedupedProducts.length),
    count,
  }
}

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = DEFAULT_SORT,
  countryCode,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || PRODUCT_LIMIT
  const currentPage = Math.max(page, 1)

  const { products, count } = await collectProductsForSort({
    countryCode,
    queryParams,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const offset = (currentPage - 1) * limit
  const nextPage = count > offset + limit ? currentPage + 1 : null

  return {
    response: {
      products: sortedProducts.slice(offset, offset + limit),
      count,
    },
    nextPage,
    queryParams,
  }
}

export const listProductsForPlp = async ({
  countryCode,
  page = 1,
  sortBy = DEFAULT_SORT,
  q,
  categoryHandles,
  categoryId,
  collectionId,
  productsIds,
  typeValues,
  effectValues,
  compoundValues,
}: {
  countryCode: string
  page?: number
  sortBy?: SortOptions
  q?: string
  categoryHandles?: string[]
  categoryId?: string
  collectionId?: string
  productsIds?: string[]
  typeValues?: string[]
  effectValues?: string[]
  compoundValues?: string[]
}) => {
  const categoryIds = await resolvePlpCategoryIds({
    categoryHandles,
    categoryId,
  })

  const baseQueryParams = buildPlpBaseQueryParams({
    q,
    categoryIds,
    collectionId,
    productsIds,
  })

  let typeIds: string[] = []
  let tagIds: string[] = []

  if (typeValues?.length || effectValues?.length || compoundValues?.length) {
    const { typeMap, effectMap, compoundMap } = await getPlpFacetIndex({
      countryCode,
      queryParams: baseQueryParams,
    })

    typeIds = resolveFacetIds(typeValues, typeMap)

    tagIds = Array.from(
      new Set([
        ...resolveFacetIds(effectValues, effectMap),
        ...resolveFacetIds(compoundValues, compoundMap),
      ])
    )
  }

  const queryParams: ProductListQueryParams = {
    ...baseQueryParams,
    ...(typeIds.length ? { type_id: typeIds } : {}),
    ...(tagIds.length ? { tag_id: tagIds } : {}),
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  return {
    products,
    count,
    page: Math.max(page, 1),
    sortBy,
    q: q || "",
    categoryIds,
    totalPages: Math.max(1, Math.ceil(count / PRODUCT_LIMIT)),
  }
}

export const getPlpFacetOptions = async ({
  countryCode,
  q,
  categoryHandles,
  categoryId,
  collectionId,
  productsIds,
}: {
  countryCode: string
  q?: string
  categoryHandles?: string[]
  categoryId?: string
  collectionId?: string
  productsIds?: string[]
}): Promise<PlpFacetGroups> => {
  const categoryIds = await resolvePlpCategoryIds({
    categoryHandles,
    categoryId,
  })

  const baseQueryParams = buildPlpBaseQueryParams({
    q,
    categoryIds,
    collectionId,
    productsIds,
  })

  const { typeMap, effectMap, compoundMap } = await getPlpFacetIndex({
    countryCode,
    queryParams: baseQueryParams,
  })

  return {
    type: toSortedFacetOptions(typeMap),
    effect: toSortedFacetOptions(effectMap),
    compound: toSortedFacetOptions(compoundMap),
  }
}

export const getProductByHandle = async ({
  countryCode,
  handle,
}: {
  countryCode: string
  handle: string
}) => {
  const {
    response: {
      products: [product],
    },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 1,
      handle,
      fields: PRODUCT_LIST_FIELDS,
    },
  })

  return product || null
}

export const getProductById = async ({
  id,
  countryCode,
  regionId,
}: {
  id: string
  countryCode?: string
  regionId?: string
}) => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const {
    response: {
      products: [product],
    },
  } = await listProducts({
    countryCode,
    regionId,
    queryParams: {
      limit: 1,
      id: [id],
      fields: PRODUCT_LIST_FIELDS,
    },
  })

  return product || null
}
