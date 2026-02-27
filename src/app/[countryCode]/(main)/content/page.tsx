import { Metadata } from "next"
import Link from "next/link"
import StaticContentPage from "@modules/content/templates/static-content-page"

type ContentIndexPageProps = {
  params: Promise<{ countryCode: string }>
}

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Policies and support resources for shipping, returns, privacy, terms, and customer service.",
}

export default async function ContentIndexPage(props: ContentIndexPageProps) {
  const { countryCode } = await props.params

  const links = [
    { href: `/${countryCode}/content/loyalty-rewards`, label: "Loyalty Rewards" },
    { href: `/${countryCode}/content/faq`, label: "FAQ" },
    { href: `/${countryCode}/content/contact`, label: "Contact" },
    { href: `/${countryCode}/content/shipping-returns`, label: "Shipping & Returns" },
    { href: `/${countryCode}/content/privacy-policy`, label: "Privacy Policy" },
    { href: `/${countryCode}/content/terms-of-use`, label: "Terms of Use" },
    { href: `/${countryCode}/content/about`, label: "About Total Hemp" },
  ]

  return (
    <StaticContentPage
      title="Help Center"
      intro="Everything you need before and after checkout, including policy and support details."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-border hover:bg-card"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </StaticContentPage>
  )
}
