"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { cn } from "src/lib/utils"
import { useCart } from "@lib/context/cart-context"

const ClearCartButton = ({ className }: { className?: string }) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { clear } = useCart()

  const handleClear = () => {
    startTransition(async () => {
      await clear().catch(() => {
        /* swallow errors for now */
      })

      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      params.delete("step")
      params.delete("shippingOption")
      const next = params.toString()
      const nextPath = next ? `${url.pathname}?${next}` : url.pathname
      router.replace(nextPath, { scroll: false })
      router.refresh()
    })
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
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Clear cart
    </Button>
  )
}

export default ClearCartButton
