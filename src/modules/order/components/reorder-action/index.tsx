"use client"

import { useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ReorderItem,
  ReorderResponse,
  ReorderSuggestionGroup,
  reorderOrder,
} from "@lib/data/orders"

type ReorderActionProps = {
  orderId: string
}

const listFromUnknown = <T,>(value: unknown): T[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value as T[]
}

const itemLabel = (item: ReorderItem) => {
  if (typeof item.title === "string" && item.title.trim()) {
    return item.title.trim()
  }

  if (typeof item.product_title === "string" && item.product_title.trim()) {
    return item.product_title.trim()
  }

  if (typeof item.variant_title === "string" && item.variant_title.trim()) {
    return item.variant_title.trim()
  }

  return item.variant_id || item.id || "Item"
}

export default function ReorderAction({ orderId }: ReorderActionProps) {
  const qaEvidenceModeEnabled = process.env.NEXT_PUBLIC_QA_EVIDENCE_MODE === "1"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReorderResponse | null>(null)

  const addedItems = useMemo(() => listFromUnknown<ReorderItem>(result?.added_items), [result])
  const unavailableItems = useMemo(
    () => listFromUnknown<ReorderItem>(result?.unavailable_items),
    [result]
  )
  const suggestedVariants = useMemo(
    () => listFromUnknown<ReorderSuggestionGroup>(result?.suggested_variants),
    [result]
  )

  const showResultPanel = isLoading || Boolean(result)

  const handleReorder = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const forceQaError =
        qaEvidenceModeEnabled &&
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("qa_reorder_force_error") === "1"

      if (forceQaError) {
        throw new Error("Forced reorder failure for QA evidence.")
      }

      const response = await reorderOrder(orderId)
      setResult(response)
    } catch (err: any) {
      setError(err?.message ?? "Unable to prepare reorder cart.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="surface-panel space-y-4 rounded-2xl border border-border/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Quick reorder
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Rebuild this order in your cart
          </h2>
        </div>

        <Button onClick={handleReorder} disabled={isLoading} data-testid="reorder-action-button">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <BrandSpinner />
              Building cart...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reorder
            </span>
          )}
        </Button>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          data-testid="reorder-error-state"
        >
          {error}
        </div>
      ) : null}

      {showResultPanel ? (
        <div
          className="space-y-3 rounded-xl border border-border/60 bg-card/70 p-4"
          data-testid="reorder-result-state"
        >
          <p className="text-sm text-foreground/80" data-testid="reorder-result-summary">
            {isLoading
              ? "Processing reorder. Review details will appear once the cart is prepared."
              : "Reorder processed. Review added and unavailable items below."}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div
              className="space-y-2 rounded-lg border border-border/50 bg-background/80 p-3"
              data-testid="reorder-added-items-section"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                Added items
              </h3>
              {isLoading ? (
                <p className="text-xs text-foreground/65">Loading added items...</p>
              ) : addedItems.length ? (
                <ul className="space-y-1 text-sm text-foreground/85">
                  {addedItems.map((item, index) => (
                    <li key={`${item.id || item.variant_id || "added"}-${index}`}>
                      {itemLabel(item)}
                      {typeof item.quantity === "number" ? ` x${item.quantity}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-foreground/65">No items were added.</p>
              )}
            </div>

            <div
              className="space-y-2 rounded-lg border border-border/50 bg-background/80 p-3"
              data-testid="reorder-unavailable-items-section"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                Unavailable items
              </h3>
              {isLoading ? (
                <p className="text-xs text-foreground/65">Loading unavailable items...</p>
              ) : unavailableItems.length ? (
                <ul className="space-y-1 text-sm text-foreground/85">
                  {unavailableItems.map((item, index) => (
                    <li key={`${item.id || item.variant_id || "missing"}-${index}`}>
                      {itemLabel(item)}
                      {typeof item.reason === "string" && item.reason
                        ? ` (${item.reason})`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-foreground/65">All prior items are available.</p>
              )}
            </div>

            <div
              className="space-y-2 rounded-lg border border-border/50 bg-background/80 p-3"
              data-testid="reorder-suggested-variants-section"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                Suggested variants
              </h3>
              {isLoading ? (
                <p className="text-xs text-foreground/65">Loading suggested variants...</p>
              ) : suggestedVariants.length ? (
                <ul className="space-y-1 text-sm text-foreground/85">
                  {suggestedVariants.map((suggestion, index) => {
                    const variants = Array.isArray(suggestion.variants)
                      ? suggestion.variants
                      : []

                    if (!variants.length) {
                      return null
                    }

                    return (
                      <li key={`${suggestion.order_item_id || suggestion.product_id || "suggestion"}-${index}`}>
                        <p className="text-xs text-foreground/65">
                          Alternatives for item {suggestion.order_item_id || index + 1}:
                        </p>
                        <ul className="mt-1 space-y-1">
                          {variants.map((variant) => (
                            <li key={variant.id}>
                              {variant.title}
                              {variant.sku ? ` (${variant.sku})` : ""}
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-foreground/65">No alternatives suggested.</p>
              )}
            </div>
          </div>

          <p className="text-xs text-foreground/65" data-testid="reorder-no-substitution-copy">
            No substitutions were applied automatically.
          </p>

          {result?.cart_id ? (
            <div data-testid="reorder-cart-handoff">
              <LocalizedClientLink href="/cart">
                <Button variant="secondary" size="sm">
                  Review cart
                </Button>
              </LocalizedClientLink>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
