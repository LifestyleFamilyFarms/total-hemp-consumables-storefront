"use client"

import { cn } from "@lib/utils"
import { CheckCircle2, Circle, CreditCard, Home, Package } from "lucide-react"
import { useSearchParams } from "next/navigation"

const steps = [
  { id: "address", label: "Address", icon: Home },
  { id: "delivery", label: "Delivery", icon: Package },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: CheckCircle2 },
]

export function CheckoutSteps() {
  const searchParams = useSearchParams()
  const current = searchParams.get("step") || "address"

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
        {steps.map((step, idx) => {
          const Icon = step.icon ?? Circle
          const isActive = step.id === current
          const isComplete =
            steps.findIndex((s) => s.id === current) > steps.findIndex((s) => s.id === step.id)

          return (
            <div key={step.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : isComplete
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-col leading-tight">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-foreground" : "text-foreground/80"
                  )}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Step {idx + 1} of {steps.length}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-xs text-muted-foreground px-1">›</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
