import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export type NavigationCategory = {
  id: string
  name: string
  handle: string
  rank?: number | null
  children?: NavigationCategory[]
}

export type CategoryImageContract = {
  thumbnail: string | null
  banner: string | null
  gallery: string[]
}

export type CatalogCategoryMediaCard = {
  id: string
  name: string
  handle: string
  thumbnail: string | null
}

type CatalogCategoryMediaRecord = {
  id: string
  name: string
  handle: string
  parent_category_id?: string | null
  rank?: number | null
  metadata?: Record<string, unknown> | null
}

const createEmptyCategoryImages = (): CategoryImageContract => ({
  thumbnail: null,
  banner: null,
  gallery: [],
})

const normalizeImageUrl = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  return normalized.length ? normalized : null
}

const normalizeCategoryImages = (input: unknown): CategoryImageContract => {
  const contract = input && typeof input === "object" ? (input as Record<string, unknown>) : {}

  const gallery = Array.isArray(contract.gallery)
    ? Array.from(
        new Set(
          contract.gallery
            .map((value) => normalizeImageUrl(value))
            .filter((value): value is string => Boolean(value))
        )
      )
    : []

  return {
    thumbnail: normalizeImageUrl(contract.thumbnail),
    banner: normalizeImageUrl(contract.banner),
    gallery,
  }
}

const getCategoryImagesFromMetadata = (
  metadata: Record<string, unknown> | null | undefined
): CategoryImageContract => {
  if (!metadata || typeof metadata !== "object") {
    return createEmptyCategoryImages()
  }

  const contract = metadata.category_images

  return normalizeCategoryImages(contract)
}

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const listCatalogCategories = async () => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: "id,name,handle,parent_category_id,rank",
          limit: 100,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryIdsByHandles = async (handles: string[]) => {
  if (!handles.length) {
    return []
  }

  const normalized = Array.from(new Set(handles.map((handle) => handle.trim()))).filter(
    Boolean
  )

  if (!normalized.length) {
    return []
  }

  const categories = await listCatalogCategories()

  return categories
    .filter((category) => normalized.includes(category.handle))
    .map((category) => category.id)
}

export const listNavigationCategories = async (): Promise<NavigationCategory[]> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "id,name,handle,parent_category_id,rank,*category_children.id,*category_children.name,*category_children.handle,*category_children.rank",
          limit: 100,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => {
      return product_categories
        .filter((category) => !category.parent_category_id)
        .map((category) => ({
          id: category.id,
          name: category.name,
          handle: category.handle,
          rank: category.rank ?? null,
          children: (category.category_children || [])
            .map((child) => ({
              id: child.id,
              name: child.name,
              handle: child.handle,
              rank: child.rank ?? null,
            }))
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
        }))
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    })
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}

export const getCategoryImages = async (categoryId: string): Promise<CategoryImageContract> => {
  if (!categoryId) {
    return createEmptyCategoryImages()
  }

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{
      category_id: string
      images?: unknown
    }>(`/store/product-categories/${categoryId}/images`, {
      next,
      cache: "force-cache",
    })
    .then((response) => normalizeCategoryImages(response.images))
    .catch(() => createEmptyCategoryImages())
}

export const listCatalogCategoryMediaCards = async ({
  limit = 6,
}: {
  limit?: number
} = {}): Promise<CatalogCategoryMediaCard[]> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const { product_categories } = await sdk.client.fetch<{
    product_categories: CatalogCategoryMediaRecord[]
  }>("/store/product-categories", {
    query: {
      fields: "id,name,handle,parent_category_id,rank,metadata",
      limit: 100,
    },
    next,
    cache: "force-cache",
  })

  return product_categories
    .filter((category) => !category.parent_category_id)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, Math.max(limit, 0))
    .map((category) => {
      const images = getCategoryImagesFromMetadata(category.metadata)

      return {
        id: category.id,
        name: category.name,
        handle: category.handle,
        thumbnail: images.thumbnail,
      }
    })
}
