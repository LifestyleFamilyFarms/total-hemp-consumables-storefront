"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"
import Input from "@modules/common/components/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg text-neutral-950">
            Order transfers
          </h3>
          <p className="text-base-regular text-neutral-500">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full" name="order_id" label="Order ID" />
            <SubmitButton
              variant="secondary"
              className="w-fit whitespace-nowrap self-end"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <p className="text-base-regular text-rose-500 text-right">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-neutral-50 shadow-borders-base w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
            <div className="flex flex-col gap-y-1">
              <p className="text-medim-pl text-neutral-950">
                Transfer for order {state.order?.id} requested
              </p>
              <p className="text-base-regular text-neutral-600">
                Transfer request email sent to {state.order?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-fit"
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss transfer request message"
          >
            <XCircle className="h-4 w-4 text-neutral-500" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}
