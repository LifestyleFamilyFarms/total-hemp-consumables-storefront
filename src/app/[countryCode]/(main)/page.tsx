import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import StrainHighlights from "@modules/home/components/strain-highlights"
import BrandPromise from "@modules/home/components/brand-promise"
import ComplianceCallout from "@modules/home/components/compliance-callout"
import NewsletterSignup from "@modules/home/components/newsletter"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Total Hemp Consumables",
  description:
    "Farm to consumer cannabis products.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <div className="space-y-16">
      <Hero countryCode={countryCode} />

      <StrainHighlights />

      <section className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Featured releases</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Fresh from the greenhouse
            </h2>
          </div>
        </div>
        <div className="mt-8 space-y-12">
          <FeaturedProducts collections={collections} region={region} />
        </div>
      </section>

      <BrandPromise />

      <ComplianceCallout />

      <NewsletterSignup />
    </div>
  )
}
