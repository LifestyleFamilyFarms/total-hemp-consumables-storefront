import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  if (!customer) {
    return (
      <div className="flex-1 py-6 small:py-12" data-testid="account-page">
        <div className="content-container mx-auto flex h-full max-w-5xl flex-1 flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-6 small:py-12" data-testid="account-page">
      <div className="content-container mx-auto flex h-full max-w-5xl flex-1 flex-col">
        <div className="grid grid-cols-1 py-6 small:grid-cols-[240px_1fr] small:py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col gap-6 border-t border-gray-200 py-8 small:flex-row small:items-end small:justify-between small:py-12">
          <div className="max-w-xl">
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
