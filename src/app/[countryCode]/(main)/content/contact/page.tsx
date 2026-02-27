import { Metadata } from "next"
import StaticContentPage from "@modules/content/templates/static-content-page"
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@lib/constants/support"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Total Hemp support for order assistance, returns, and account help.",
}

export default function ContactPage() {
  return (
    <StaticContentPage
      title="Contact Support"
      intro="For the fastest help, include your order number and a short summary of the issue."
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Support email</h2>
        <p>
          <a
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </section>

      {SUPPORT_PHONE ? (
        <section>
          <h2 className="text-lg font-semibold text-foreground">Phone</h2>
          <p>{SUPPORT_PHONE}</p>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-foreground">Support topics</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Order status and delivery questions</li>
          <li>Returns and exchanges</li>
          <li>Account login and profile updates</li>
          <li>Loyalty points and promotion questions</li>
        </ul>
      </section>
    </StaticContentPage>
  )
}
