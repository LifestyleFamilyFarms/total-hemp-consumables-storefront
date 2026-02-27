import { Metadata } from "next"
import Link from "next/link"
import StaticContentPage from "@modules/content/templates/static-content-page"
import ContentBackButton from "@modules/content/components/content-back-button"

type LoyaltyRewardsPageProps = {
  params: Promise<{ countryCode: string }>
}

export const metadata: Metadata = {
  title: "Loyalty Rewards",
  description:
    "Learn how Total Hemp Consumables loyalty points are earned, redeemed, and validated at checkout.",
}

export default async function LoyaltyRewardsPage(props: LoyaltyRewardsPageProps) {
  const { countryCode } = await props.params

  return (
    <StaticContentPage
      title="Loyalty Rewards"
      intro="Our loyalty program is designed to reward repeat customers with simple, transparent points."
      lastUpdated="February 27, 2026"
    >
      <ContentBackButton
        fallbackHref={`/${countryCode}/content`}
        label="Back"
      />

      <section>
        <h2 className="text-lg font-semibold text-foreground">How points work</h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold">EARN:</span> When an eligible order is placed
            without a loyalty redemption, points are added after the order is
            completed.
          </li>
          <li>
            <span className="font-semibold">MEMBER BENEFIT:</span> Members currently
            earn approximately 4% back on eligible orders.
          </li>
          <li>
            <span className="font-semibold">REDEEM:</span> Points convert to
            checkout discount using the active rewards redemption rate.
          </li>
          <li>
            <span className="font-semibold">ROUNDING:</span> Points and discounts are
            converted using whole-number math to keep balances consistent.
          </li>
          <li>
            <span className="font-semibold">LIMIT:</span> Redeemed points cannot exceed
            your available balance or cart amount.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Checkout behavior</h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            If you apply loyalty points, the checkout shows the discount
            immediately in your order summary.
          </li>
          <li>
            At order completion, your current balance is validated again to
            prevent overspending in edge cases.
          </li>
          <li>
            If your available points are no longer sufficient, checkout blocks
            completion and asks you to update the order.
          </li>
          <li>
            Loyalty promotions are single-use and tied to your account.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Where to manage loyalty</h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            Review your balance and recent activity in your{" "}
            <Link
              href={`/${countryCode}/account/loyalty`}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Loyalty Dashboard
            </Link>
            .
          </li>
          <li>
            Apply or remove loyalty points directly during{" "}
            <Link
              href={`/${countryCode}/checkout`}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              checkout
            </Link>
            .
          </li>
        </ul>
      </section>
    </StaticContentPage>
  )
}
