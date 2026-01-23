"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { useCart } from "@lib/context/cart-context"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const { cart: ctxCart, loading } = useCart()
  const currentCart = ctxCart ?? cart ?? null
  const items = currentCart?.items
  return (
    <div>
      <div className="pb-3 flex items-center">
        <h2 className="text-[2rem] leading-[2.75rem] font-semibold">Cart</h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="text-muted-foreground font-medium">
              <TableHead className="text-left">Item</TableHead>
              <TableHead />
              <TableHead className="text-left">Quantity</TableHead>
              <TableHead className="text-left hidden small:table-cell">
                Price
              </TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items
              ? items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  })
                  .map((item) => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={currentCart?.currency_code ?? ""}
                      />
                    )
                  })
              : loading
                ? repeat(5).map((i) => <SkeletonLineItem key={i} />)
                : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
