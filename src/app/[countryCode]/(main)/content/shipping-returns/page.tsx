import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"
import { SUPPORT_EMAIL } from "@lib/constants/support"
import { ALLOWED_SHIPPING_STATES } from "@lib/constants/shipping"

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping and refund policy for Total Hemp Consumables orders.",
}

export default function ShippingReturnsPage() {
  const shippingStateList = ALLOWED_SHIPPING_STATES.join(", ")

  return (
    <StaticContentPage
      title="Shipping Policy - Total Hemp Consumables"
      intro="This Shipping and Returns Policy applies to all orders placed through Total Hemp Consumables."
      lastUpdated="February 27, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Shipping Policy</h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold">AGE RESTRICTION:</span> Orders are
            limited to adults 21 years of age or older.
          </li>
          <li>
            <span className="font-semibold">PROCESSING TIMES:</span> Orders are
            generally processed within 2-5 business days after payment is
            authorized. Processing timelines may extend during holidays, major
            sales events, or carrier service disruptions.
          </li>
          <li>
            <span className="font-semibold">SHIPPING DESTINATIONS:</span> We
            currently ship to the following U.S. jurisdictions where our
            hemp-derived products are permitted: {shippingStateList}. Shipping
            availability is subject to change based on legal and carrier
            requirements.
          </li>
          <li>
            <span className="font-semibold">DOMESTIC SHIPMENTS ONLY:</span>{" "}
            Orders are shipped within the United States and approved U.S.
            territories only. We do not offer international shipping.
          </li>
          <li>
            <span className="font-semibold">INTERSTATE COMPLIANCE:</span> Orders
            are fulfilled in compliance with applicable federal hemp laws,
            including the 2018 Farm Bill, and any additional jurisdictional
            restrictions known at time of shipment.
          </li>
          <li>
            <span className="font-semibold">SHIPPING METHODS & PRICING:</span>{" "}
            Available fulfillment methods and charges are shown at checkout and
            may vary by location, order contents, and carrier service
            availability.
          </li>
          <li>
            <span className="font-semibold">DELIVERY WINDOWS:</span> Delivery
            estimates are provided by carriers and are not guaranteed. Title and
            risk of loss transfer upon carrier handoff where permitted by law.
          </li>
          <li>
            <span className="font-semibold">ADDRESS ACCURACY:</span> Customers
            are responsible for providing complete and accurate shipping
            information. Returned, rejected, or undeliverable packages may incur
            re-shipment charges.
          </li>
          <li>
            <span className="font-semibold">CARRIER ISSUES:</span> If a package
            is delayed, lost, or damaged in transit, contact us and we will help
            initiate a carrier claim where applicable.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Refund Policy
        </h2>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold">ALL SALES FINAL:</span> Due to the
            nature of hemp-derived products, all sales are final except where
            refunds or replacements are required by applicable law or expressly
            approved under this policy.
          </li>
          <li>
            <span className="font-semibold">
              DAMAGED/INCORRECT/SPOILED ORDERS:
            </span>{" "}
            Contact us within 7 days of delivery at{" "}
            <a
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            with your order number, a summary of the issue, and clear photos of
            the product and package.
          </li>
          <li>
            <span className="font-semibold">REFUNDS:</span> Approved refunds
            will be issued to the original payment method.
          </li>
          <li>
            <span className="font-semibold">NO RETURNS:</span> Opened or used
            products are not eligible for return.
          </li>
          <li>
            <span className="font-semibold">ORDER CHANGES/CANCELLATIONS:</span>{" "}
            We can only modify or cancel orders before fulfillment begins. Once
            an order has been processed for shipment, it cannot be canceled.
          </li>
          <li>
            <span className="font-semibold">CHARGEBACKS:</span> If you experience
            an issue with an order, contact us first so we can resolve it before
            initiating a payment dispute.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Policy Questions</h2>
        <p>
          For questions about shipping, delivery restrictions, or refunds,
          contact{" "}
          <a
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </StaticContentPage>
  )
}
