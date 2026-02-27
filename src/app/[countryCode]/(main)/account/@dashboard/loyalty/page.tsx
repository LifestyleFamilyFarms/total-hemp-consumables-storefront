import { getLoyaltySummary, retrieveCustomer } from "@lib/data/customer"
import Loyalty from "@modules/account/components/loyalty"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Loyalty",
  description: "View your loyalty point balance and activity.",
}

export default async function LoyaltyPage() {
  const [customer, loyaltySummary] = await Promise.all([
    retrieveCustomer().catch(() => null),
    getLoyaltySummary().catch(() => ({ points: null, history: [], count: 0 })),
  ])

  if (!customer) {
    notFound()
  }

  return <Loyalty points={loyaltySummary.points} history={loyaltySummary.history} />
}
