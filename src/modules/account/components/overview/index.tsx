import { LoyaltyHistoryItem } from "@lib/data/customer"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  loyaltyPoints: number | null
  loyaltyHistory: LoyaltyHistoryItem[]
}

const Overview = ({
  customer,
  orders,
  loyaltyPoints,
  loyaltyHistory,
}: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        <div className="text-xl-semi flex justify-between items-center mb-4">
          <span data-testid="welcome-message" data-value={customer?.first_name}>
            Hello {customer?.first_name}
          </span>
          <span className="text-small-regular text-ui-fg-base">
            Signed in as:{" "}
            <span
              className="font-semibold"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </span>
        </div>

        <div className="flex flex-col py-8 border-t border-gray-200 gap-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-semibold">Profile completion</h3>
              <p className="mt-2 text-3xl font-semibold" data-testid="customer-profile-completion">
                {getProfileCompletion(customer)}%
              </p>
              <p className="text-sm text-muted-foreground">Keep your account details current.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-base font-semibold">Saved addresses</h3>
              <p className="mt-2 text-3xl font-semibold" data-testid="addresses-count">
                {customer?.addresses?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Speed up repeat checkout.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4" id="loyalty-overview">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">Loyalty balance</h3>
                <LocalizedClientLink
                  href="/content/loyalty-rewards"
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  How it works
                </LocalizedClientLink>
              </div>
              <p className="mt-2 text-3xl font-semibold" data-testid="loyalty-points-balance">
                {loyaltyPoints ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Redeem points for order discounts.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Loyalty activity</h3>
                <LocalizedClientLink href="/account/loyalty" className="text-sm text-primary hover:text-primary/80">
                  View all
                </LocalizedClientLink>
              </div>

              {loyaltyHistory.length > 0 ? (
                <ul className="space-y-2" data-testid="loyalty-history-preview">
                  {loyaltyHistory.slice(0, 3).map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-border/70 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {entry.type === "redeem" ? "Points redeemed" : "Points earned"}
                        </span>
                        <span className={entry.points < 0 ? "text-destructive" : "text-emerald-600"}>
                          {entry.points > 0 ? `+${entry.points}` : entry.points}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()} · Balance {entry.balance_after}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your loyalty activity will appear here after your first points-eligible order.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Recent orders</h3>
                <LocalizedClientLink href="/account/orders" className="text-sm text-primary hover:text-primary/80">
                  View all
                </LocalizedClientLink>
              </div>

              {orders && orders.length > 0 ? (
                <ul className="space-y-2" data-testid="orders-wrapper">
                  {orders.slice(0, 4).map((order) => (
                    <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                      <div className="rounded-lg border border-border/70 p-3">
                        <div className="grid grid-cols-3 gap-x-2 text-xs text-muted-foreground">
                          <span>Date placed</span>
                          <span>Order number</span>
                          <span>Total</span>
                          <span data-testid="order-created-date">
                            {new Date(order.created_at).toDateString()}
                          </span>
                          <span data-testid="order-id" data-value={order.display_id}>
                            #{order.display_id}
                          </span>
                          <span data-testid="order-amount">
                            {convertToLocale({
                              amount: order.total,
                              currency_code: order.currency_code,
                            })}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <LocalizedClientLink
                            href={`/account/orders/details/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                          >
                            Order details
                            <ChevronDown className="-rotate-90" />
                          </LocalizedClientLink>
                          <LocalizedClientLink
                            href="/store"
                            className="text-sm text-foreground underline-offset-2 hover:underline"
                          >
                            Reorder items
                          </LocalizedClientLink>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p data-testid="no-orders-message" className="text-sm text-muted-foreground">
                  No recent orders yet. Start shopping to earn loyalty points.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
