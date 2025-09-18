import { BadgeCheck, Droplets, Leaf, ShieldCheck } from "lucide-react"

const pillars = [
  {
    title: "Seed-to-sale transparency",
    description:
      "Every cultivar ships with QR-linked COAs, terpene maps, and farm provenance. Nothing hidden—ever.",
    icon: ShieldCheck,
  },
  {
    title: "Regenerative cultivation",
    description:
      "Partner farms practice regenerative soil cycles and organic IPM for clean, repeatable harvests.",
    icon: Leaf,
  },
  {
    title: "Full-spectrum formulation",
    description:
      "We balance minor cannabinoids and terpene ratios to preserve entourage benefits across every format.",
    icon: Droplets,
  },
  {
    title: "Compliance-first logistics",
    description:
      "Age-gated storefront, verified carriers, and jurisdiction-aware shipping keep us within the 2018 Farm Bill.",
    icon: BadgeCheck,
  },
]

export default function BrandPromise() {
  return (
    <section className="border-y border-border/60 bg-background/50 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 sm:px-10 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Why Total Hemp</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Elevated hemp means elevated standards.
          </h2>
          <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
            We obsess over traceability, terpene retention, and compliance controls so you can focus on the experience. These are the promises every product must meet before it reaches you.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-6 shadow-[0_16px_32px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="text-sm text-foreground/70">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
