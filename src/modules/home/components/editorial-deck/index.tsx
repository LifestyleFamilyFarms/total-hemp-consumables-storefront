import Link from "next/link"

type EditorialDeckProps = {
  countryCode: string
}

const EDITORIAL_CARDS = [
  {
    eyebrow: "Drop highlight",
    title: "Harvest Reserve Flower Packs",
    body: "Single-origin cultivars trimmed by hand with NFC-linked COAs tucked into every jar.",
    action: "Shop Flower",
    href: "store/flower",
    accent: "from-emerald-300/30 via-emerald-500/10 to-transparent",
    why: "Full-spectrum expression with terpene overlays for connoisseurs.",
  },
  {
    eyebrow: "Chef-crafted",
    title: "Gourmet Edibles Program",
    body: "Pastry-chef collabs for citrus pâte de fruit, nano chocolates, and savory bites.",
    action: "Shop Edibles",
    href: "store/edibles",
    accent: "from-amber-300/25 via-orange-500/15 to-transparent",
    why: "Flavor-first microdoses keep clarity by day, calm by night.",
  },
  {
    eyebrow: "Wellness lab",
    title: "Sipping Elixirs & Beverages",
    body: "Sparkling adaptogenic tonics and droppers balanced for functional calm.",
    action: "Shop Beverages",
    href: "store/beverages",
    accent: "from-indigo-300/25 via-indigo-600/10 to-transparent",
    why: "Nano emulsions hit in under 10 minutes with <2g sugar.",
  },
] as const

export default function EditorialDeck({ countryCode }: EditorialDeckProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="rounded-[44px] border border-border/60 bg-background/85 px-6 py-14 shadow-[0_35px_70px_rgba(15,23,42,0.2)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 sm:px-10">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">From the greenhouse</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Editorial picks for this week.</h2>
          <p className="text-sm text-foreground/70 sm:max-w-2xl">
            Think of this as our in-house budtender board: bold imagery, terpene context, and straight-to-checkout actions for every featured format.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {EDITORIAL_CARDS.map((card) => (
            <article
              key={card.title}
              className="flex h-full flex-col gap-6 rounded-[36px] border border-border/50 bg-background/95 p-6 shadow-[0_35px_70px_rgba(15,23,42,0.22)]"
            >
              <div className="relative overflow-hidden rounded-3xl border border-border/40">
                <div className={`h-36 w-full bg-gradient-to-br ${card.accent}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_55%)] opacity-70" />
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/60">{card.eyebrow}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{card.title}</h3>
                <p className="text-sm text-foreground/70">{card.body}</p>
              </div>

              <div className="mt-auto space-y-4 border-t border-border/40 pt-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">Why it matters</p>
                  <p className="text-sm text-foreground/80">{card.why}</p>
                </div>
                <Link
                  href={`/${countryCode}/${card.href}`}
                  className="inline-flex w-max items-center gap-2 text-sm font-semibold text-foreground transition hover:gap-3"
                >
                  {card.action}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
