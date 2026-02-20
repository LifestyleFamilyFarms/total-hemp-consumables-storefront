"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "src/lib/utils"
import { clearCart } from "@lib/data/cart"
import {
  selectBeginCartMutation,
  selectEndCartMutation,
  useStorefrontState,
} from "@lib/state"
import { trackCartEvent } from "@lib/analytics/cart-events"
import { toast } from "@/components/ui/sonner"
import { BrandSpinner } from "@/components/brand/brand-spinner"

const ClearCartButton = ({
  className,
  source = "cart_page",
}: {
  className?: string
  source?: "cart_page" | "drawer"
}) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const beginCartMutation = useStorefrontState(selectBeginCartMutation)
  const endCartMutation = useStorefrontState(selectEndCartMutation)

  const handleClear = () => {
    if (isPending) {
      return
    }

    setIsPending(true)
    beginCartMutation()

    ;(async () => {
      try {
        await clearCart()
        trackCartEvent("cart_cleared", { source })
        toast.success("Cart cleared.")
      } catch {
        trackCartEvent("cart_clear_failed", { source })
        toast.error("Unable to clear cart.")
      } finally {
        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)
        params.delete("step")
        params.delete("shippingOption")
        const next = params.toString()
        const nextPath = next ? `${url.pathname}?${next}` : url.pathname
        router.replace(nextPath, { scroll: false })
        router.refresh()
        endCartMutation()
        setIsPending(false)
      }
    })()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClear}
      disabled={isPending}
      className={cn("gap-2", className)}
    >
      {isPending ? (
        <BrandSpinner />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Clear cart
    </Button>
  )
}

export default ClearCartButton
