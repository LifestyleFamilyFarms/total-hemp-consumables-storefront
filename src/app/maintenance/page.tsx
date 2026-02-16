import type { Metadata } from "next"
import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import LaunchWaitlistForm from "@modules/maintenance/components/launch-waitlist-form"

export const metadata: Metadata = {
  title: "Grand Opening Soon | Total Hemp Consumables",
  description:
    "Total Hemp Consumables is in maintenance mode while we prepare launch inventory. Join the email list for grand opening alerts.",
}

export const dynamic = "force-dynamic"

const RETIRED_CATEGORY_HANDLES = new Set(["flower", "flowers", "vape", "vapes"])
const THC_PRIORITY_TERMS = ["thc", "delta-9", "delta 9", "delta9"]

function isThcPriorityCategory(name?: string | null, handle?: string | null) {
  const value = `${name || ""} ${handle || ""}`.toLowerCase()
  return THC_PRIORITY_TERMS.some((term) => value.includes(term))
}

async function getLaunchCategories() {
  try {
    const categories = await listCategories({ limit: 100 })

    const topLevelCategories = categories.filter((category) => {
      return !category.parent_category && !category.parent_category_id
    })

    const filteredCategories = topLevelCategories.filter((category) => {
      const handle = (category.handle || "").toLowerCase().trim()

      if (RETIRED_CATEGORY_HANDLES.has(handle)) {
        return false
      }

      return (category.products?.length || 0) > 0
    })

    const sortedCategories = [...filteredCategories].sort((a, b) => {
      const aIsThc = isThcPriorityCategory(a.name, a.handle)
      const bIsThc = isThcPriorityCategory(b.name, b.handle)

      if (aIsThc !== bIsThc) {
        return aIsThc ? -1 : 1
      }

      return (b.name || "").localeCompare(a.name || "")
    })

    return sortedCategories.slice(0, 8)
  } catch {
    return []
  }
}

export default async function MaintenancePage() {
  const launchCategories = await getLaunchCategories()

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/20 px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(142,213,188,0.2),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(227,177,108,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />

      <section className="w-full max-w-6xl rounded-[36px] border border-border/40 bg-gradient-to-br from-background/90 via-background/82 to-secondary/10 p-7 shadow-[0_32px_90px_rgba(12,23,34,0.28)] backdrop-blur-md supports-[backdrop-filter]:bg-background/55 sm:p-10 lg:p-12">
        <header className="mb-10 flex justify-center border-b border-border/35 pb-7">
          <Image
            src="/logos/svg/COLORhorizontal_FULL_COLOR_LOGO_PRINT.svg"
            alt="Total Hemp Consumables"
            width={340}
            height={121}
            unoptimized
            priority
            className="h-auto w-[260px] max-w-full drop-shadow-[0_18px_28px_rgba(15,23,42,0.35)] sm:w-[340px]"
          />
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-6 text-left">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Total Hemp Consumables is about to launch, be the first to know when it happens
            </h1>

            <p className="text-base leading-relaxed text-foreground/75 sm:text-lg">
              We&apos;re in final production and compliance prep before opening the full storefront. Expect a first-wave
              lineup centered on premium Delta-9 THC products, with complementary CBD offerings.
            </p>

            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-background/80 to-secondary/15 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Premium menu preview</p>
              {launchCategories.length > 0 ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                    Live categories currently staged for launch:
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2" data-testid="maintenance-live-categories">
                    {launchCategories.map((category) => (
                      <li
                        key={category.id}
                        className="rounded-full border border-border/55 bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/80"
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-relaxed text-foreground/65">
                    This lineup is pulled directly from our live store catalog.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                  Curated Delta-9 THC gummies, beverages, and elixirs with lab-backed transparency,
                  compliance-first packaging, and small-batch release cadence.
                </p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-foreground/70">
              Need wholesale support or launch timeline details? Email{" "}
              <a className="font-semibold text-primary underline" href="mailto:info@totalhemp.co">
                info@totalhemp.co
              </a>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-background/85 via-background/75 to-secondary/20 p-6 shadow-[0_18px_45px_rgba(12,23,34,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/60">Launch alerts</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Drop your email for first access.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              We&apos;ll send one email for opening day and occasional updates for premium THC releases.
            </p>

            <div className="mt-6">
              <LaunchWaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
