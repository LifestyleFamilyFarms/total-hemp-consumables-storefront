import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@lib/constants/support"

const Help = () => {
  return (
    <div className="mt-6">
      <h2 className="text-base-semi font-semibold">Need help?</h2>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <a
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              Email support: {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            <LocalizedClientLink href="/account/orders">
              View your orders
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/content/shipping-returns">
              Shipping and returns policy
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/content/contact">
              Contact support center
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/content/loyalty-rewards">
              Loyalty rewards guide
            </LocalizedClientLink>
          </li>
          {SUPPORT_PHONE ? <li>Phone support: {SUPPORT_PHONE}</li> : null}
        </ul>
      </div>
    </div>
  )
}

export default Help
