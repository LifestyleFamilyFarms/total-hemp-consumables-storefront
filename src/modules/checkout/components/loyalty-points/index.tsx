"use client"

import {
  applyLoyaltyPointsOnCart,
  removeLoyaltyPointsOnCart,
} from "@lib/data/cart"
import { getLoyaltyPoints } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CircleHelp, ExternalLink, X } from "lucide-react"

type LoyaltyPointsProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StoreCartPromotion[]
    metadata?: Record<string, unknown> | null
  }
}

const LoyaltyPoints = ({ cart }: LoyaltyPointsProps) => {
  const router = useRouter()

  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoyaltyPointsPromoApplied = useMemo(() => {
    const loyaltyPromoId = cart.metadata?.loyalty_promo_id

    if (typeof loyaltyPromoId !== "string" || !loyaltyPromoId) {
      return false
    }

    return cart.promotions.some((promo) => promo.id === loyaltyPromoId)
  }, [cart.metadata, cart.promotions])

  useEffect(() => {
    let active = true

    setIsLoading(true)

    getLoyaltyPoints()
      .then((points) => {
        if (!active) {
          return
        }

        setLoyaltyPoints(points)
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [cart.id])

  const handleTogglePromotion = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()

    setIsMutating(true)
    setError(null)

    try {
      if (!isLoyaltyPointsPromoApplied) {
        await applyLoyaltyPointsOnCart()
      } else {
        await removeLoyaltyPointsOnCart()
      }

      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? "Unable to update loyalty points right now.")
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Loyalty points</h3>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-muted/50"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                  How it works
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                sideOffset={8}
                className="w-[min(94vw,22rem)] rounded-xl border-border/70 bg-popover/95 p-0 shadow-xl"
              >
                <div className="max-h-[70vh] overflow-y-auto">
                  <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-popover/95 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                      Loyalty rewards
                    </p>
                    <PopoverClose
                      aria-label="Close loyalty guide"
                      className="rounded-md p-1 text-foreground/80 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </PopoverClose>
                  </div>
                  <div className="space-y-3 px-4 py-3 text-xs leading-relaxed text-foreground/85 sm:text-sm">
                    <p>
                      Earn points after eligible orders. Redeem points directly
                      at checkout.
                    </p>
                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>Members earn approximately 4% back on eligible orders.</li>
                      <li>
                        Points convert at the current rewards redemption rate.
                      </li>
                      <li>Discount cannot exceed your cart amount.</li>
                      <li>
                        Your balance is validated again before order completion.
                      </li>
                      <li>
                        If your balance changes, checkout may ask you to remove
                        or adjust loyalty redemption.
                      </li>
                    </ul>
                    <LocalizedClientLink
                      href="/content/loyalty-rewards"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
                    >
                      Full rewards guide
                      <ExternalLink className="h-3.5 w-3.5" />
                    </LocalizedClientLink>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <LocalizedClientLink
              href="/content/loyalty-rewards"
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Guide
            </LocalizedClientLink>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Checking your points…</p>
        ) : loyaltyPoints === null ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Sign in to view and redeem loyalty points during checkout.
            </p>
            <LocalizedClientLink
              href="/account"
              className="w-fit text-sm font-medium text-primary hover:text-primary/80"
            >
              Sign in / Create account
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-foreground">
                Available points: <span className="font-semibold">{loyaltyPoints}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Redeem points for an order discount. Earn new points on eligible purchases.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant={isLoyaltyPointsPromoApplied ? "outline" : "default"}
                onClick={handleTogglePromotion}
                disabled={
                  isMutating ||
                  (!isLoyaltyPointsPromoApplied && (!loyaltyPoints || loyaltyPoints <= 0))
                }
                data-testid="toggle-loyalty-points-button"
              >
                {isMutating
                  ? "Updating..."
                  : isLoyaltyPointsPromoApplied
                    ? "Remove loyalty points"
                    : "Apply loyalty points"}
              </Button>
              {loyaltyPoints <= 0 && !isLoyaltyPointsPromoApplied && (
                <span className="text-xs text-muted-foreground">
                  You need enough points to unlock a redeemable discount.
                </span>
              )}
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-destructive" data-testid="loyalty-points-error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoyaltyPoints
