import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"
import { SUPPORT_EMAIL } from "@lib/constants/support"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Total Hemp Consumables storefront and products.",
}

export default function TermsOfUsePage() {
  return (
    <StaticContentPage
      title="Terms of Service - Total Hemp Consumables"
      intro="These Terms of Service govern your access to and use of this storefront and any purchases made from Total Hemp Consumables."
      lastUpdated="February 27, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          1. ACCEPTANCE OF TERMS
        </h2>
        <p>
          By accessing this site or placing an order, you agree to be bound by
          these Terms of Service and our related policies, including Shipping &
          Returns and Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">2. ELIGIBILITY</h2>
        <p>
          You must be at least 21 years old to purchase or use products sold by
          Total Hemp Consumables.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          3. PRODUCT USE DISCLAIMER
        </h2>
        <p>
          Products are not intended for use by pregnant or nursing individuals.
          Consult a physician if you have a medical condition or take
          prescription medication.
        </p>
        <p>
          Statements on this site have not been evaluated by the U.S. Food and
          Drug Administration unless explicitly stated. Products are not intended
          to diagnose, treat, cure, or prevent any disease.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">4. COMPLIANCE</h2>
        <p>
          Products are sold in compliance with applicable federal hemp laws.
          You are responsible for understanding and complying with your local and
          state laws before purchasing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          5. PRODUCT INFORMATION, PRICING, AND AVAILABILITY
        </h2>
        <p>
          We strive for accurate product descriptions, pricing, and availability
          but do not warrant that all listings are error-free. We may correct
          errors, update product information, or cancel orders where required,
          including where pricing or availability errors occur.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          6. ORDER ACCEPTANCE AND CANCELLATION
        </h2>
        <p>
          Your order is an offer to purchase. We reserve the right to accept,
          reject, limit, or cancel orders at our discretion, including for
          suspected fraud, legal restrictions, or inventory constraints. If we
          cancel a paid order, we will issue a refund to the original payment
          method.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">7. PAYMENTS</h2>
        <p>
          All payments are processed securely through third-party providers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          8. SHIPPING, RETURNS, AND REFUNDS
        </h2>
        <p>
          Shipping restrictions, delivery terms, and refund eligibility are
          governed by our Shipping & Returns policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          9. INTELLECTUAL PROPERTY
        </h2>
        <p>
          All content on this site, including text, graphics, branding, logos,
          and layout, is owned by or licensed to Total Hemp Consumables and may
          not be used without permission.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          10. LIMITATION OF LIABILITY
        </h2>
        <p>
          To the maximum extent permitted by law, Total Hemp Consumables is not
          liable for indirect, incidental, special, consequential, or punitive
          damages, or for losses resulting from misuse of products, delays outside
          our control, or unauthorized access to your account.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot be excluded under
          applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          11. INDEMNIFICATION
        </h2>
        <p>
          You agree to indemnify and hold harmless Total Hemp Consumables from
          claims, damages, and expenses arising from your misuse of the site or
          violation of these terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          12. GOVERNING LAW AND DISPUTES
        </h2>
        <p>
          These terms are governed by applicable U.S. law and state law where
          required. Any dispute will be resolved in a court of competent
          jurisdiction unless otherwise required by applicable consumer-protection
          law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          13. CONTACT
        </h2>
        <p>
          Questions about these Terms may be sent to{" "}
          <a
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">14. CHANGES</h2>
        <p>
          We may update these Terms at any time. Changes are effective when posted
          to this page unless otherwise required by law.
        </p>
      </section>
    </StaticContentPage>
  )
}
