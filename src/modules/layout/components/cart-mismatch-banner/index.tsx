"use client"

import { transferCart } from "@lib/data/customer"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Run transfer again")

  if (!customer || !!cart.customer_id) {
    return null
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Transferring..")

      await transferCart()
    } catch {
      setActionText("Run transfer again")
      setIsPending(false)
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-[0_14px_36px_rgba(252,211,77,0.35)]">
      <div className="flex flex-col items-start gap-2 small:flex-row small:items-center small:justify-between">
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          Something went wrong when we tried to transfer your cart.
        </span>

        <Button
          variant="outline"
          size="sm"
          className="border-amber-300 bg-white/70 text-amber-900 hover:bg-amber-100"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
