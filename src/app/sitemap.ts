import type { MetadataRoute } from "next"
import { listCatalogCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

const PRODUCT_PAGE_LIMIT = 100
const MAX_PRODUCT_PAGES = 50
const BASE_PATHS = [
  "",
  "/store",
  "/cart",
  "/account",
  "/gamma-gummies",
  "/content",
  "/content/loyalty-rewards",
  "/content/about",
  "/content/contact",
  "/content/faq",
  "/content/privacy-policy",
  "/content/shipping-returns",
  "/content/terms-of-use",
]

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

const getCountryCodes = async () => {
  const regions = await listRegions().catch(() => [])
  const codes = new Set<string>()

  for (const region of regions || []) {
    for (const country of region.countries || []) {
      const code = country?.iso_2?.toLowerCase()
      if (code) {
        codes.add(code)
      }
    }
  }

  if (!codes.size) {
    codes.add("us")
  }

  return Array.from(codes)
}

const parseLastModified = (value: unknown): Date => {
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date()
}

const buildStaticUrls = (baseUrl: string, countryCodes: string[]): MetadataRoute.Sitemap => {
  const now = new Date()

  return countryCodes.flatMap((countryCode) =>
    BASE_PATHS.map((path) => ({
      url: `${baseUrl}/${countryCode}${path}`,
      lastModified: now,
      changeFrequency: path === "" || path === "/store" ? "daily" : "weekly",
      priority: path === "" ? 1 : path === "/store" ? 0.9 : 0.6,
    }))
  )
}

const buildCategoryUrls = async (
  baseUrl: string,
  countryCodes: string[]
): Promise<MetadataRoute.Sitemap> => {
  const categories = await listCatalogCategories().catch(() => [])

  return countryCodes.flatMap((countryCode) =>
    categories
      .filter((category) => Boolean(category?.handle))
      .map((category) => ({
        url: `${baseUrl}/${countryCode}/categories/${category.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  )
}

const buildCollectionUrls = async (
  baseUrl: string,
  countryCodes: string[]
): Promise<MetadataRoute.Sitemap> => {
  const { collections } = await listCollections({ limit: "200", offset: "0" }).catch(() => ({
    collections: [],
    count: 0,
  }))

  return countryCodes.flatMap((countryCode) =>
    collections
      .filter((collection) => Boolean(collection?.handle))
      .map((collection) => ({
        url: `${baseUrl}/${countryCode}/collections/${collection.handle}`,
        lastModified: parseLastModified(collection.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  )
}

const buildProductUrlsForCountry = async (
  baseUrl: string,
  countryCode: string
): Promise<MetadataRoute.Sitemap> => {
  const entries: MetadataRoute.Sitemap = []
  let page = 1
  let guard = 0

  while (guard < MAX_PRODUCT_PAGES) {
    guard += 1

    const result = await listProducts({
      pageParam: page,
      countryCode,
      queryParams: {
        limit: PRODUCT_PAGE_LIMIT,
        fields: "handle,updated_at",
      },
    }).catch(() => null)

    if (!result) {
      break
    }

    for (const product of result.response.products || []) {
      if (!product?.handle) {
        continue
      }

      entries.push({
        url: `${baseUrl}/${countryCode}/products/${product.handle}`,
        lastModified: parseLastModified(product.updated_at),
        changeFrequency: "daily",
        priority: 0.8,
      })
    }

    if (!result.nextPage) {
      break
    }

    page = result.nextPage
  }

  return entries
}

const dedupeSitemapEntries = (
  entries: MetadataRoute.Sitemap
): MetadataRoute.Sitemap => {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const entry of entries) {
    if (!entry?.url) {
      continue
    }

    byUrl.set(entry.url, entry)
  }

  return Array.from(byUrl.values())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(getBaseURL())
  const countryCodes = await getCountryCodes()

  const [categoryEntries, collectionEntries, ...productEntriesByCountry] = await Promise.all([
    buildCategoryUrls(baseUrl, countryCodes),
    buildCollectionUrls(baseUrl, countryCodes),
    ...countryCodes.map((countryCode) => buildProductUrlsForCountry(baseUrl, countryCode)),
  ])

  return dedupeSitemapEntries([
    ...buildStaticUrls(baseUrl, countryCodes),
    ...categoryEntries,
    ...collectionEntries,
    ...productEntriesByCountry.flat(),
  ])
}
