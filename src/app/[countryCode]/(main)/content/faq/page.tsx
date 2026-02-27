import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ordering, shipping, account access, and loyalty points.",
}

export default function FaqPage() {
  return (
    <StaticContentPage
      title="Frequently Asked Questions"
      intro="Quick answers for common pre-purchase and post-purchase questions."
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Do I need an account to order?</h2>
        <p>
          You can browse products without an account. Signing in improves repeat
          checkout and gives access to loyalty balance and order history.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">How do loyalty points work?</h2>
        <p>
          Members earn approximately 4% back on eligible orders, and points can be
          redeemed during checkout. You can review balance and recent activity from
          your account dashboard.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Why are shipping choices limited?</h2>
        <p>
          Shipping methods depend on jurisdiction and active fulfillment
          configuration. During rollout, checkout may operate in pickup-only mode.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">How do I request support?</h2>
        <p>
          Use our Contact page for order, account, or product support and include
          your order number when applicable.
        </p>
      </section>
    </StaticContentPage>
  )
}
