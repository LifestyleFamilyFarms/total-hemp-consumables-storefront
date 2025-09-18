import React, { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import TerpeneProfile from "@modules/products/components/terpene-profile"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { getProductPrice } from "@lib/util/get-product-price"

import ProductInfo from "@modules/products/templates/product-info"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const { cheapestPrice } = getProductPrice({ product })
  const priceDisplay = cheapestPrice ? (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-semibold text-foreground sm:text-4xl">
        {cheapestPrice.calculated_price}
      </span>
      {cheapestPrice.original_price && cheapestPrice.original_price !== cheapestPrice.calculated_price ? (
        <span className="text-sm text-foreground/60 line-through">{cheapestPrice.original_price}</span>
      ) : null}
    </div>
  ) : null

  return (
    <div className="space-y-16 pb-24">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pt-10 sm:px-10 lg:grid-cols-[1.6fr_1fr]">
        <ImageGallery images={product?.images || []} />
        <div className="flex flex-col gap-8">
          <ProductInfo product={product} priceDisplay={priceDisplay} />

          <div className="rounded-[32px] border border-border/60 bg-background/80 p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)] backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/40" />}>
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

          <TerpeneProfile profile={parseTerpenes(product.metadata)} />

          <ProductOnboardingCta />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <ProductTabs product={product} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 sm:px-10" data-testid="related-products-container">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Customers also enjoy</h2>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </section>
    </div>
  )
}

export default ProductTemplate

function parseTerpenes(metadata: Record<string, any> | undefined) {
  if (!metadata) return undefined
  const raw = metadata.terpene_profile || metadata.terpenes_json
  if (!raw) return undefined
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => ({
          name: typeof entry.name === 'string' ? entry.name : String(entry.terpene || ''),
          percent: typeof entry.percent === 'number' ? entry.percent : Number(entry.value ?? 0),
        }))
        .filter((entry) => entry.name && !Number.isNaN(entry.percent))
    }
  } catch (err) {
    console.warn('Unable to parse terpene profile', err)
  }
  return undefined
}

