import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LoyaltyHistoryItem } from "@lib/data/customer"

type LoyaltyProps = {
  points: number | null
  history: LoyaltyHistoryItem[]
}

const Loyalty = ({ points, history }: LoyaltyProps) => {
  return (
    <div className="space-y-4" data-testid="account-loyalty-page">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Loyalty dashboard</h1>
          <LocalizedClientLink
            href="/content/loyalty-rewards"
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Rewards guide
          </LocalizedClientLink>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep track of your balance and point activity.
        </p>
        <p className="mt-4 text-4xl font-semibold" data-testid="loyalty-page-balance">
          {points ?? 0}
        </p>
        <p className="text-sm text-muted-foreground">Available points</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold">Points history</h2>
        {history.length > 0 ? (
          <ul className="mt-3 space-y-2" data-testid="loyalty-page-history">
            {history.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border/70 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {entry.type === "redeem" ? "Redeemed" : "Earned"}
                  </span>
                  <span className={entry.points < 0 ? "text-destructive" : "text-emerald-600"}>
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()} · Balance {entry.balance_after}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No activity yet. Place an order to start earning points.
          </p>
        )}
      </div>
    </div>
  )
}

export default Loyalty
