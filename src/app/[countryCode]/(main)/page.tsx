import { Metadata } from "next"
import Link from "next/link"

import BrandPromise from "@modules/home/components/brand-promise"
import CategoryRail from "@modules/home/components/category-rail"
import ComplianceCallout from "@modules/home/components/compliance-callout"
import EditorialDeck from "@modules/home/components/editorial-deck"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import NewsletterSignup from "@modules/home/components/newsletter"
import StrainHighlights from "@modules/home/components/strain-highlights"
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
    <div className="w-full">
      <div className="relative w-full overflow-hidden px-4 pb-24 pt-10 sm:px-6 lg:px-12">
        <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-col gap-20">
          <Hero countryCode={countryCode} />

          <section className="relative overflow-hidden rounded-[28px] border border-primary/40 bg-primary/12 px-5 py-6 shadow-[0_25px_60px_rgba(15,23,42,0.26)] sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full blur-3xl" style={{ background: "hsla(var(--accent),0.3)" }} />
            <div className="absolute right-[-18%] bottom-[-35%] h-64 w-64 rounded-full blur-[110px]" style={{ background: "hsla(var(--primary),0.35)" }} />
          </div>

          {/* Quick Paths */}
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Quick paths</p>
              <p className="text-lg font-semibold text-foreground">Pick your lane in two taps.</p>
            </div>
            <Link
              href={`/${countryCode}/store`}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-primary/60"
            >
              Browse all
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Shop the store",
                body: "Full catalog, fresh rotations.",
                href: `/${countryCode}/store`,
              },
              {
                title: "Express checkout",
                body: "Jump straight to bag + pay.",
                href: `/${countryCode}/checkout`,
              },
              {
                title: "Collections",
                body: "Curated drops and bundles.",
                href: `/${countryCode}/collections`,
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative flex flex-col gap-2 rounded-[20px] border border-primary/30 bg-card p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_20px_46px_rgba(15,23,42,0.26)]"
              >
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="text-sm text-foreground/70">{card.body}</p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                  Enter
                  <span className="ml-2 align-middle" aria-hidden>
                    →
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-0 rounded-[20px] border border-accent/40 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>


          <EditorialDeck countryCode={countryCode} />

          <StrainHighlights />

          <CategoryRail countryCode={countryCode} />

          <section className="relative overflow-hidden rounded-[32px] border border-primary/45 bg-card px-6 py-10 shadow-[0_35px_70px_rgba(15,23,42,0.22)] sm:px-10">
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: "hsla(var(--accent),0.38)" }} />
              <div className="absolute right-[-12%] bottom-[-28%] h-96 w-96 rounded-full blur-[130px]" style={{ background: "hsla(var(--primary),0.32)" }} />
            </div>
            <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Featured releases</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Fresh from the greenhouse
                </h2>
              </div>
              <p className="text-sm text-foreground/85">
                Curated rails refresh daily to mirror live inventory—tap into the drops before they disappear.
              </p>
            </div>
            <div className="mt-10 space-y-12">
              <FeaturedProducts collections={collections} region={region} />
            </div>
          </section>
        </div>
      </div>

      <BrandPromise />

      <ComplianceCallout />

      <NewsletterSignup />
    </div>
  )
}
