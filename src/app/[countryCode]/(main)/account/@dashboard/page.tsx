import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { getLoyaltySummary, retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const [customer, orders, loyaltySummary] = await Promise.all([
    retrieveCustomer().catch(() => null),
    listOrders().catch(() => null),
    getLoyaltySummary().catch(() => ({ points: null, history: [], count: 0 })),
  ])

  if (!customer) {
    notFound()
  }

  return (
    <Overview
      customer={customer}
      orders={orders || null}
      loyaltyPoints={loyaltySummary.points}
      loyaltyHistory={loyaltySummary.history}
    />
  )
}
