import { Metadata } from "next"
import Link from "next/link"

import { listNavigationCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProductsForPlp } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

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

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [categories, collectionsResponse, newest, valuePicks] = await Promise.all([
    listNavigationCategories().catch(() => []),
    listCollections({ fields: "id,handle,title" }).catch(() => ({
      collections: [] as HttpTypes.StoreCollection[],
      count: 0,
    })),
    listProductsForPlp({
      countryCode,
      page: 1,
      sortBy: "created_at",
    }),
    listProductsForPlp({
      countryCode,
      page: 1,
      sortBy: "price_asc",
    }),
  ])

  const spotlightCategories = categories.slice(0, 6)
  const spotlightCollections = collectionsResponse.collections.slice(0, 3)
  const organizationSchema = buildOrganizationSchema(countryCode)

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <section className="mx-auto w-full max-w-6xl px-6 pt-10 sm:px-10">
        <div className="relative overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-card via-card/85 to-background px-6 py-12 shadow-[0_30px_60px_rgba(15,23,42,0.16)] sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(18,165,120,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.22),transparent_45%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">
                Total Hemp Consumables
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Hemp products built for real shopping, not placeholder decks.
              </h1>
              <p className="max-w-2xl text-sm text-foreground/75 sm:text-base">
                Explore live inventory with clear variant pricing, ingredient visibility,
                and product FAQs pulled straight from your catalog metadata.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${countryCode}/store`}
                  className="inline-flex items-center rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Shop the catalog
                </Link>
                <Link
                  href={`/${countryCode}/store?sort=price_asc`}
                  className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground"
                >
                  Value picks
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
              {[
                "Variant-aware pricing on PLP + PDP",
                "Metadata-driven product FAQs and ingredients",
                "URL-shareable filters, search, sort, and pagination",
              ].map((item) => (
                <p key={item} className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-foreground/80">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {spotlightCategories.length ? (
        <section className="mx-auto mt-10 w-full max-w-6xl px-6 sm:px-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/60">Shop by category</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Start with what you actually want.
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${countryCode}/store?category=${category.handle}`}
                className="group flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/50"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-foreground/70">
                    Filtered listing view with sort, search, and shareable URL state.
                  </p>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-foreground/60 group-hover:text-foreground">
                  Explore category
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {spotlightCollections.length ? (
        <section className="mx-auto mt-10 w-full max-w-6xl px-6 sm:px-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/60">Collections</p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Curated product sets
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {spotlightCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/${countryCode}/collections/${collection.handle}`}
                className="rounded-3xl border border-border/60 bg-card/70 p-5 transition hover:border-primary/50"
              >
                <p className="text-lg font-semibold text-foreground">{collection.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-foreground/60">Open collection</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-12 w-full max-w-6xl space-y-10 px-6 sm:px-10">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/60">New arrivals</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Recently added products
              </h2>
            </div>
            <Link
              href={`/${countryCode}/store?sort=created_at`}
              className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {newest.products.slice(0, 4).map((product) => (
              <ProductPreview key={product.id} product={product} region={region} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-foreground/60">Value picks</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Strong value per serving
              </h2>
            </div>
            <Link
              href={`/${countryCode}/store?sort=price_asc`}
              className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valuePicks.products.slice(0, 4).map((product) => (
              <ProductPreview key={product.id} product={product} region={region} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
