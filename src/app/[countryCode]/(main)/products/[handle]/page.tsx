import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getProductByHandle, listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import ProductTemplate from "@modules/products/templates"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ variant?: string }>
}

const BRAND_NAME = "Total Hemp Consumables"

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

const toAbsoluteProductUrl = (countryCode: string, handle: string) =>
  `${normalizeBaseUrl(getBaseURL())}/${countryCode}/products/${handle}`

const toMetaDescription = (product: HttpTypes.StoreProduct) => {
  const description =
    product.description?.trim() ||
    `Shop ${product.title} from ${BRAND_NAME}.`

  if (description.length <= 160) {
    return description
  }

  return `${description.slice(0, 157).trimEnd()}...`
}

const readCalculatedAmount = (variant?: HttpTypes.StoreProductVariant) => {
  const value = variant?.calculated_price?.calculated_amount

  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

const isVariantInStock = (variant?: HttpTypes.StoreProductVariant) => {
  if (!variant) {
    return false
  }

  if (!variant.manage_inventory || variant.allow_backorder) {
    return true
  }

  if (typeof variant.inventory_quantity === "number") {
    return variant.inventory_quantity > 0
  }

  if (typeof variant.inventory_quantity === "string") {
    const parsed = Number(variant.inventory_quantity)
    return Number.isFinite(parsed) ? parsed > 0 : true
  }

  return true
}

const resolveSeoVariant = (
  product: HttpTypes.StoreProduct,
  variantId?: string
) => {
  const variants = product.variants || []

  if (!variants.length) {
    return undefined
  }

  if (variantId) {
    const matched = variants.find((variant) => variant.id === variantId)
    if (matched) {
      return matched
    }
  }

  const cheapest = [...variants]
    .filter((variant) => readCalculatedAmount(variant) !== null)
    .sort((left, right) => {
      const leftAmount = readCalculatedAmount(left) ?? Number.MAX_SAFE_INTEGER
      const rightAmount = readCalculatedAmount(right) ?? Number.MAX_SAFE_INTEGER
      return leftAmount - rightAmount
    })[0]

  return cheapest || variants[0]
}

const buildProductSchema = ({
  product,
  countryCode,
  handle,
  variantId,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  handle: string
  variantId?: string
}) => {
  const productUrl = toAbsoluteProductUrl(countryCode, handle)
  const variant = resolveSeoVariant(product, variantId)
  const amount = readCalculatedAmount(variant)
  const currencyCode = variant?.calculated_price?.currency_code?.toUpperCase() || "USD"
  const imageUrls = Array.from(
    new Set(
      [
        product.thumbnail,
        ...(product.images || []).map((image) => image?.url),
      ].filter((value): value is string => Boolean(value))
    )
  )

  const offer =
    typeof amount === "number"
      ? {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: currencyCode,
          price: amount.toFixed(2),
          availability: isVariantInStock(variant)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          priceValidUntil: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 90
          ).toISOString(),
        }
      : undefined

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: toMetaDescription(product),
    image: imageUrls,
    sku: variant?.sku || product.handle || product.id,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    url: productUrl,
    ...(offer ? { offers: offer } : {}),
  }
}

const buildBreadcrumbSchema = ({
  product,
  countryCode,
  handle,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  handle: string
}) => {
  const baseUrl = normalizeBaseUrl(getBaseURL())
  const productUrl = `${baseUrl}/${countryCode}/products/${handle}`
  const category = product.categories?.[0]
  const items: Array<{ "@type": string; position: number; name: string; item: string }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${baseUrl}/${countryCode}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Store",
      item: `${baseUrl}/${countryCode}/store`,
    },
  ]

  if (category?.handle && category?.name) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: `${baseUrl}/${countryCode}/categories/${category.handle}`,
    })
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: product.title,
    item: productUrl,
  })

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle({
    countryCode: params.countryCode,
    handle,
  })

  if (!product) {
    notFound()
  }

  const description = toMetaDescription(product)
  const canonicalPath = `/${params.countryCode}/products/${handle}`

  return {
    title: `${product.title} | Total Hemp Consumables`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${product.title} | Total Hemp Consumables`,
      description,
      url: canonicalPath,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Total Hemp Consumables`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle({
    countryCode: params.countryCode,
    handle: params.handle,
  })

  if (!pricedProduct) {
    notFound()
  }

  const activeVariantId =
    typeof searchParams.variant === "string" ? searchParams.variant : undefined

  const productSchema = buildProductSchema({
    product: pricedProduct,
    countryCode: params.countryCode,
    handle: params.handle,
    variantId: activeVariantId,
  })

  const breadcrumbSchema = buildBreadcrumbSchema({
    product: pricedProduct,
    countryCode: params.countryCode,
    handle: params.handle,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <ProductTemplate
        product={pricedProduct}
        countryCode={params.countryCode}
        initialVariantId={activeVariantId}
      />
    </>
  )
}
