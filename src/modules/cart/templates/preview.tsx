"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import { useCart } from "@lib/context/cart-context"
import { cn } from "src/lib/utils"
import {
  Table,
  TableBody,
} from "@/components/ui/table"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const { cart: ctxCart } = useCart()
  const currentCart = ctxCart ?? cart
  const items = currentCart.items
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={cn({
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      <Table className="w-full text-sm">
        <TableBody data-testid="items-table">
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
                      type="preview"
                      currencyCode={currentCart.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ItemsPreviewTemplate
