"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { toast } from "@/components/ui/sonner"
import {
  selectBeginCartMutation,
  selectEndCartMutation,
  useStorefrontState,
} from "@lib/state"
import { trackCartEvent } from "@lib/analytics/cart-events"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type CartDrawerItemActionsProps = {
  lineId: string
  quantity: number
  variantId?: string | null
  title?: string | null
  maxQuantity?: number
}

export default function CartDrawerItemActions({
  lineId,
  quantity,
  variantId,
  title,
  maxQuantity = 99,
}: CartDrawerItemActionsProps) {
  const router = useRouter()
  const params = useParams<{ countryCode?: string }>()
  const [isPending, setIsPending] = useState(false)
  const [guardMessage, setGuardMessage] = useState("")
  const beginCartMutation = useStorefrontState(selectBeginCartMutation)
  const endCartMutation = useStorefrontState(selectEndCartMutation)
  const countryCode =
    typeof params?.countryCode === "string" ? params.countryCode : "us"

  const updateQuantity = async (nextQuantity: number) => {
    if (isPending || nextQuantity < 1 || nextQuantity === quantity) {
      return
    }

    if (nextQuantity > maxQuantity) {
      const message = `Maximum quantity is ${maxQuantity} for this item.`
      setGuardMessage(message)
      toast.info(message)
      return
    }

    setGuardMessage("")
    setIsPending(true)
    beginCartMutation()

    try {
      await updateLineItem({
        lineId,
        quantity: nextQuantity,
      })
      trackCartEvent("cart_quantity_changed", {
        source: "drawer",
        direction: nextQuantity > quantity ? "increase" : "decrease",
        line_id: lineId,
        variant_id: variantId || null,
        quantity: nextQuantity,
      })
      router.refresh()
    } finally {
      endCartMutation()
      setIsPending(false)
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
        quantity,
        countryCode,
      })
      trackCartEvent("cart_item_undo_remove", {
        source: "drawer",
        line_id: lineId,
        variant_id: variantId,
        quantity,
      })
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

    setGuardMessage("")
    setIsPending(true)
    beginCartMutation()

    try {
      await deleteLineItem(lineId)
      trackCartEvent("cart_item_removed", {
        source: "drawer",
        line_id: lineId,
        variant_id: variantId || null,
      })
      toast.success("Item removed from cart.", {
        description: title || undefined,
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
    } finally {
      endCartMutation()
      setIsPending(false)
    }
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center rounded-md border border-border/60">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-r-none"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={isPending || quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-8 px-2 text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-l-none"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isPending}
            aria-label="Increase quantity"
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
        >
          {isPending ? (
            <BrandSpinner className="h-3.5 w-3.5" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Remove
        </Button>
      </div>
      {guardMessage ? (
        <p className="w-full text-xs text-muted-foreground">{guardMessage}</p>
      ) : null}
    </div>
  )
}
