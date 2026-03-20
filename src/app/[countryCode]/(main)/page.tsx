import { Metadata } from "next"

import { listNavigationCategories } from "@lib/data/categories"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listProductsForPlp } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"

import HeroSection from "@modules/home/components/hero/hero-section"
import EffectSection from "@modules/home/components/shop-by-effect/effect-section"
import CategorySection from "@modules/home/components/category-grid/category-section"
import CollectionSection from "@modules/home/components/featured-collection/collection-section"
import ArrivalsSection from "@modules/home/components/new-arrivals/arrivals-section"
import TrustSection from "@modules/home/components/trust-strip/trust-section"
import NewsletterSection from "@modules/home/components/newsletter/newsletter-section"

export const metadata: Metadata = {
  title: "Total Hemp Consumables",
  description: "Farm to consumer cannabis products.",
}

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

const buildOrganizationSchema = (countryCode: string) => {
  const baseUrl = normalizeBaseUrl(getBaseURL())
  const storefrontUrl = `${baseUrl}/${countryCode}`

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Total Hemp Consumables",
    url: storefrontUrl,
    logo: `${baseUrl}/opengraph-image.jpg`,
    email: "support@totalhemp.co",
    sameAs: [],
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [categories, collectionsResponse, newest] = await Promise.all([
    listNavigationCategories().catch(() => []),
    listCollections({ fields: "id,handle,title" }).catch(() => ({
      collections: [] as HttpTypes.StoreCollection[],
      count: 0,
    })),
    listProductsForPlp({
      countryCode,
      page: 1,
      sortBy: "created_at",
    }).catch(() => ({ products: [] as HttpTypes.StoreProduct[], count: 0 })),
  ])

  const firstHandle = collectionsResponse.collections[0]?.handle
  const featuredCollection = firstHandle
    ? await getCollectionByHandle(firstHandle).catch(() => null)
    : null

  const organizationSchema = buildOrganizationSchema(countryCode)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <HeroSection />

      {/* Post-hero: full-bleed alternating bands for visual rhythm */}
      <div className="relative -mx-[50vw] left-1/2 right-1/2 w-screen">
        <div className="bg-background">
          <div className="mx-auto max-w-8xl">
            <EffectSection />
          </div>
        </div>
        <div className="bg-card">
          <div className="mx-auto max-w-8xl">
            <CategorySection categories={categories} />
          </div>
        </div>
        <div className="bg-background">
          <div className="mx-auto max-w-8xl">
            <CollectionSection collection={featuredCollection} />
            <ArrivalsSection products={newest.products} />
          </div>
        </div>
        <div className="bg-card">
          <div className="mx-auto max-w-8xl">
            <TrustSection />
            <NewsletterSection />
          </div>
        </div>
      </div>
    </>
  )
}
