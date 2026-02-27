import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Total Hemp Consumables, our standards, and customer-first approach.",
}

export default function AboutPage() {
  return (
    <StaticContentPage
      title="About Total Hemp"
      intro="We focus on compliant hemp products, clear labeling, and a repeat-customer experience."
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Our mission</h2>
        <p>
          Deliver dependable hemp products with transparent product information and
          a checkout experience customers can trust.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">What we prioritize</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Compliance-aware catalog and shipping controls</li>
          <li>Consistent product detail and ingredient clarity</li>
          <li>Customer retention through account and loyalty features</li>
        </ul>
      </section>
    </StaticContentPage>
  )
}
