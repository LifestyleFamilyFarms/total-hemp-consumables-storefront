import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const salesPersonCode =
    typeof order.metadata?.sales_person_code === "string" ||
    typeof order.metadata?.sales_person_code === "number"
      ? String(order.metadata.sales_person_code)
      : null

  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <Card
      data-testid="order-card"
      className="overflow-hidden border border-border/60 bg-card/70 shadow-[0_18px_42px_rgba(6,10,22,0.28)]"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2 uppercase tracking-[0.16em] text-foreground/80">
            <span className="text-muted-foreground">Order</span>
            <span data-testid="order-display-id">#{order.display_id}</span>
          </span>
          <span
            className="text-xs font-medium text-muted-foreground"
            data-testid="order-created-at"
          >
            {new Date(order.created_at).toDateString()}
          </span>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span data-testid="order-amount">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          {salesPersonCode && (
            <>
              <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
              <span className="text-xs uppercase tracking-wide">
                Rep {salesPersonCode}
              </span>
            </>
          )}
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <span>{numberOfLines} {numberOfLines === 1 ? "item" : "items"}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 small:grid-cols-4">
          {order.items?.slice(0, 3).map((i) => {
            return (
              <div
                key={i.id}
                className="group flex flex-col gap-y-2 rounded-xl border border-border/40 bg-background/60 p-2"
                data-testid="order-item"
              >
                <Thumbnail
                  thumbnail={i.thumbnail}
                  images={[]}
                  size="full"
                  className="rounded-lg border border-border/40 bg-card/50"
                />
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span
                    className="line-clamp-2 font-semibold"
                    data-testid="item-title"
                  >
                    {i.title}
                  </span>
                  <span className="text-muted-foreground">
                    × <span data-testid="item-quantity">{i.quantity}</span>
                  </span>
                </div>
              </div>
            )
          })}
          {numberOfProducts > 4 && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 text-sm text-muted-foreground">
              <span className="font-semibold">
                + {numberOfLines - 4}
              </span>
              <span>more</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end pt-0">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button
            data-testid="order-details-link"
            variant="secondary"
            size="sm"
            className="rounded-full px-4"
          >
            See details
          </Button>
        </LocalizedClientLink>
      </CardFooter>
    </Card>
  )
}

export default OrderCard
