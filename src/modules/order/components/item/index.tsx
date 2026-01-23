import { HttpTypes } from "@medusajs/types"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import { TableCell, TableRow } from "@/components/ui/table"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <TableRow className="w-full" data-testid="product-row">
      <TableCell className="p-4 w-24 align-top">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </TableCell>

      <TableCell className="text-left align-top">
        <p className="txt-medium-plus text-ui-fg-base" data-testid="product-name">
          {item.product_title}
        </p>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </TableCell>

      <TableCell className="pr-0 align-top">
        <span className="pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <span className="text-ui-fg-muted text-sm">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </TableCell>
    </TableRow>
  )
}

export default Item
