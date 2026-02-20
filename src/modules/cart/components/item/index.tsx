"use client"

import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { cn } from "src/lib/utils"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import {
  selectBeginCartMutation,
  selectEndCartMutation,
  useStorefrontState,
} from "@lib/state"
import { trackCartEvent } from "@lib/analytics/cart-events"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardMessage, setGuardMessage] = useState("")
  const params = useParams<{ countryCode?: string }>()
  const router = useRouter()
  const beginCartMutation = useStorefrontState(selectBeginCartMutation)
  const endCartMutation = useStorefrontState(selectEndCartMutation)
  const countryCode =
    typeof params?.countryCode === "string" ? params.countryCode : "us"
  const variantId = item.variant_id || item.variant?.id || null
  const maxQuantity = item.variant?.manage_inventory ? 10 : 99
  const isPending = updating || removing

  const changeQuantity = async (quantity: number) => {
    if (quantity === item.quantity || quantity < 1 || isPending) {
      return
    }

    if (quantity > maxQuantity) {
      const message = `Maximum quantity is ${maxQuantity} for this item.`
      setGuardMessage(message)
      toast.info(message)
      return
    }

    setError(null)
    setGuardMessage("")
    setUpdating(true)
    beginCartMutation()

    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })
      trackCartEvent("cart_quantity_changed", {
        source: "cart_page",
        direction: quantity > (item.quantity ?? 0) ? "increase" : "decrease",
        line_id: item.id,
        variant_id: variantId,
        quantity,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update quantity")
      trackCartEvent("cart_quantity_change_failed", {
        source: "cart_page",
        line_id: item.id,
        variant_id: variantId,
      })
    } finally {
      endCartMutation()
      setUpdating(false)
    }
  }

  const undoRemove = async () => {
    if (!variantId) {
      return
    }

    beginCartMutation()
    try {
      await addToCart({
        variantId,
        quantity: item.quantity ?? 1,
        countryCode,
      })
      trackCartEvent("cart_item_undo_remove", {
        source: "cart_page",
        line_id: item.id,
        variant_id: variantId,
        quantity: item.quantity ?? 1,
      })
      toast.success("Item restored.")
      router.refresh()
    } catch {
      toast.error("Unable to restore item.")
    } finally {
      endCartMutation()
    }
  }

  const removeItem = async () => {
    if (isPending) {
      return
    }

    setError(null)
    setGuardMessage("")
    setRemoving(true)
    beginCartMutation()

    try {
      await deleteLineItem(item.id)
      trackCartEvent("cart_item_removed", {
        source: "cart_page",
        line_id: item.id,
        variant_id: variantId,
      })
      toast.success("Item removed from cart.", {
        description: item.product_title || item.title || undefined,
        action: variantId
          ? {
              label: "Undo",
              onClick: () => {
                void undoRemove()
              },
            }
          : undefined,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove item")
      trackCartEvent("cart_item_remove_failed", {
        source: "cart_page",
        line_id: item.id,
        variant_id: variantId,
      })
    } finally {
      endCartMutation()
      setRemoving(false)
    }
  }

  return (
    <tr className="w-full border-b border-border/60 last:border-b-0" data-testid="product-row">
      <td className="p-4 w-24 align-top">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={cn("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </td>

      <td className="text-left align-top">
        <p className="text-sm font-medium text-foreground" data-testid="product-title">
          {item.product_title}
        </p>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </td>

      {type === "full" && (
        <td className="align-top">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-md border border-border/60">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-r-none"
                onClick={() => changeQuantity((item.quantity ?? 1) - 1)}
                disabled={isPending || (item.quantity ?? 1) <= 1}
                aria-label="Decrease quantity"
                data-testid="product-quantity-decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-8 px-2 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-l-none"
                onClick={() => changeQuantity((item.quantity ?? 1) + 1)}
                disabled={isPending || (item.quantity ?? 1) >= maxQuantity}
                aria-label="Increase quantity"
                data-testid="product-quantity-increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={removeItem}
              disabled={isPending}
              data-testid="product-delete-button"
            >
              {removing ? (
                <BrandSpinner className="h-3.5 w-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove
            </Button>
            {updating ? <BrandSpinner /> : null}
            {guardMessage ? (
              <p className="w-full text-xs text-muted-foreground">{guardMessage}</p>
            ) : null}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </td>
      )}

      {type === "full" && (
        <td className="hidden small:table-cell align-top">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </td>
      )}

      <td className="pr-0 align-top">
        <span
          className={cn("pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <span className="text-ui-fg-muted text-sm">{item.quantity}x </span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </td>
    </tr>
  )
}

export default Item
