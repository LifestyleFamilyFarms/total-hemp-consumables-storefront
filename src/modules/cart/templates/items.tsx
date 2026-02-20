"use client"

import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import ClearCartButton from "@modules/cart/components/clear-cart-button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="flex items-center justify-between gap-3 pb-3">
        <h2 className="text-[2rem] leading-[2.75rem] font-semibold">Cart</h2>
        <ClearCartButton />
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
                        currencyCode={cart?.currency_code ?? ""}
                      />
                    )
                  })
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
