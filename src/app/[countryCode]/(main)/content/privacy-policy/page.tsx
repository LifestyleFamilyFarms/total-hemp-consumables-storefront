import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"
import { SUPPORT_EMAIL } from "@lib/constants/support"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Total Hemp Consumables and how customer data is handled.",
}

export default function PrivacyPolicyPage() {
  return (
    <StaticContentPage
      title="Privacy Policy - Total Hemp Consumables"
      intro="This policy explains what information we collect and how we use, disclose, and protect it."
      lastUpdated="February 27, 2026"
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 1 - INFORMATION WE COLLECT
        </h2>
        <p>
          We may collect personal information you provide directly, including your
          name, billing and shipping address, email address, phone number, and
          order details. We also collect technical data such as IP address,
          browser/device information, and usage data from our website and
          storefront tools.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 2 - CONSENT
        </h2>
        <p>
          By completing a transaction, placing an order, or arranging delivery,
          you consent to our collecting and using your information for order
          fulfillment, customer support, fraud prevention, and legal compliance.
          For marketing communications, we request consent when required by law
          and provide opt-out options in each communication.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 3 - HOW WE USE YOUR INFORMATION
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Process and fulfill orders, payments, and delivery requests.</li>
          <li>Provide customer service and respond to support inquiries.</li>
          <li>Maintain account functionality and storefront security.</li>
          <li>
            Detect, investigate, and prevent fraud, abuse, or unauthorized
            activity.
          </li>
          <li>Meet tax, accounting, legal, and regulatory obligations.</li>
          <li>
            Improve storefront performance, merchandising, and customer
            experience.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 4 - DISCLOSURE
        </h2>
        <p>
          We may share personal information with service providers and processors
          that support store operations, such as ecommerce infrastructure,
          payment processing, analytics, fraud prevention, and customer support.
          We may also disclose information if required by law, subpoena, or legal
          process, or to protect rights, safety, and security.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 5 - THIRD-PARTY SERVICES (MEDUSA)
        </h2>
        <p>
          Our storefront uses third-party infrastructure and platform services,
          including Medusa-based commerce services, to process and manage orders.
          Payment card data is handled by payment processors subject to applicable
          payment industry standards.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 6 - SECURITY
        </h2>
        <p>
          We use commercially reasonable administrative, technical, and physical
          safeguards designed to protect personal information. No transmission or
          storage system can be guaranteed as 100% secure.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 7 - COOKIES AND TRACKING
        </h2>
        <p>
          We use cookies and similar technologies to maintain sessions, keep carts
          active, secure account access, and understand storefront usage. You can
          manage browser cookie settings at any time, but disabling cookies may
          affect storefront functionality.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 8 - DATA RETENTION
        </h2>
        <p>
          We retain personal information for as long as reasonably necessary for
          the purposes in this policy, including fulfilling orders, maintaining
          records, resolving disputes, enforcing agreements, and meeting legal
          obligations.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 9 - AGE OF CONSENT
        </h2>
        <p>
          You must be 21 years of age or older to use this site and purchase our
          products.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 10 - GDPR & CCPA RIGHTS
        </h2>
        <p>
          You have the right to access, correct, or request deletion of your
          personal data. Depending on your jurisdiction, you may also have rights
          to data portability, objection, restriction, and to limit certain uses
          of sensitive personal information.
        </p>
        <p>
          California residents may request details about categories of personal
          information collected, disclosed, and shared. We do not sell personal
          information for money.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 11 - HOW TO EXERCISE YOUR PRIVACY RIGHTS
        </h2>
        <p>
          To submit a privacy request, contact{" "}
          <a
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          . We may verify your identity before completing your request and will
          respond within the timelines required by applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          SECTION 12 - POLICY CHANGES
        </h2>
        <p>
          We may update this policy from time to time. Changes become effective
          when posted to this page unless otherwise required by law.
        </p>
      </section>
    </StaticContentPage>
  )
}
