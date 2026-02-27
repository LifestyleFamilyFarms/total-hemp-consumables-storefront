"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import type { NavigationCategory } from "@lib/data/categories"
import type { BrandThemeId } from "@lib/brand"

export default function SiteFooter({
  countryCode = "us",
  categories = [],
}: {
  countryCode?: string
  categories?: NavigationCategory[]
}) {
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId

  return (
    <footer className="border-t border-border/60 bg-background/85 pb-[calc(var(--bottom-bar-height,4rem)+1.5rem)] pt-10 text-sm text-foreground/80">
      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div className="space-y-4">
          <Link href={`/${countryCode}`} className="block w-44">
            <BrandLogo theme={currentTheme} slot="footer" className="w-full" />
          </Link>
          <p className="text-xs leading-relaxed text-foreground/65">
            Clean, compliant hemp products with transparent sourcing and lab-backed quality.
            Adults 21+ only.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
            Browse
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/${countryCode}/store`} className="hover:underline">
                Shop All
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/gamma-gummies`} className="hover:underline">
                Gamma Gummies
              </Link>
            </li>
            {categories.slice(0, 5).map((category) => (
              <li key={category.id}>
                <Link href={`/${countryCode}/categories/${category.handle}`} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
            Account
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`/${countryCode}/account`} className="hover:underline">
                Sign In
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/account/orders`} className="hover:underline">
                Order History
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/account/addresses`} className="hover:underline">
                Address Book
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/loyalty-rewards`} className="hover:underline">
                Loyalty Rewards Guide
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
            Compliance
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/compliance/PrintPermit.pdf" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Permit (PDF)
              </a>
            </li>
            <li>
              <Link href={`/${countryCode}/content/shipping-returns`} className="hover:underline">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/privacy-policy`} className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/terms-of-use`} className="hover:underline">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/faq`} className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/contact`} className="hover:underline">
                Contact Support
              </Link>
            </li>
            <li>
              <Link href={`/${countryCode}/content/loyalty-rewards`} className="hover:underline">
                Loyalty Rewards
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-8xl border-t border-border/40 px-4 pt-5 text-[11px] text-foreground/60 sm:px-6">
        © {new Date().getFullYear()} Total Hemp Consumables. All rights reserved.
      </div>
    </footer>
  )
}
