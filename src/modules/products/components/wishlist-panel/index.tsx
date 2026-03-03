"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Heart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { retrieveCustomer } from "@lib/data/customer"
import {
  addWishlistItem,
  deleteWishlistItem,
  getCustomerWishlist,
  Wishlist,
  WishlistItem,
} from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type WishlistPanelProps = {
  selectedVariant: HttpTypes.StoreProductVariant | undefined
}

const variantIdForItem = (item: WishlistItem) =>
  item.product_variant?.id || item.product_variant_id || item.variant_id || ""

const displayLabelForItem = (item: WishlistItem) => {
  const productTitle = item.product_variant?.product?.title
  const variantTitle = item.product_variant?.title

  if (productTitle && variantTitle) {
    return `${productTitle} - ${variantTitle}`
  }

  if (productTitle) {
    return productTitle
  }

  if (variantTitle) {
    return variantTitle
  }

  return item.product_variant?.sku || "Saved item"
}

export default function WishlistPanel({ selectedVariant }: WishlistPanelProps) {
  const [isCustomerLoading, setIsCustomerLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [wishlistError, setWishlistError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const selectedVariantId = selectedVariant?.id || ""

  const selectedWishlistItem = useMemo(() => {
    if (!selectedVariantId) {
      return null
    }

    return (
      wishlist?.items?.find((item) => variantIdForItem(item) === selectedVariantId) || null
    )
  }, [selectedVariantId, wishlist?.items])

  const loadWishlist = useCallback(async () => {
    setIsWishlistLoading(true)
    setWishlistError(null)

    try {
      const nextWishlist = await getCustomerWishlist()
      setWishlist(nextWishlist)
    } catch (error: any) {
      setWishlistError(error?.message ?? "Unable to load wishlist.")
    } finally {
      setIsWishlistLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    retrieveCustomer()
      .then(async (customer) => {
        if (!isActive) {
          return
        }

        if (!customer) {
          setIsAuthenticated(false)
          return
        }

        setIsAuthenticated(true)
        await loadWishlist()
      })
      .finally(() => {
        if (isActive) {
          setIsCustomerLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [loadWishlist])

  const handleToggleSelectedVariant = async () => {
    if (!isAuthenticated || !selectedVariantId) {
      return
    }

    setIsMutating(true)
    setActionMessage(null)
    setWishlistError(null)

    const previous = wishlist

    if (selectedWishlistItem) {
      setWishlist((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          items: current.items.filter((item) => item.id !== selectedWishlistItem.id),
        }
      })
    } else {
      const optimisticItem: WishlistItem = {
        id: `optimistic-${selectedVariantId}`,
        product_variant_id: selectedVariantId,
        product_variant: {
          id: selectedVariantId,
          title: selectedVariant?.title || "Selected variant",
        },
      }

      setWishlist((current) => {
        if (!current) {
          return {
            id: "optimistic",
            items: [optimisticItem],
          }
        }

        return {
          ...current,
          items: [optimisticItem, ...(current.items || [])],
        }
      })
    }

    try {
      if (selectedWishlistItem) {
        await deleteWishlistItem(selectedWishlistItem.id)
      } else {
        await addWishlistItem(selectedVariantId)
      }
      await loadWishlist()
      setActionMessage(selectedWishlistItem ? "Removed from wishlist." : "Added to wishlist.")
    } catch (error: any) {
      setWishlist(previous)
      setWishlistError(error?.message ?? "Unable to update wishlist.")
    } finally {
      setIsMutating(false)
    }
  }

  const handleRemoveItem = async (item: WishlistItem) => {
    if (!isAuthenticated) {
      return
    }

    setIsMutating(true)
    setActionMessage(null)
    setWishlistError(null)

    const previous = wishlist

    setWishlist((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        items: current.items.filter((entry) => entry.id !== item.id),
      }
    })

    try {
      await deleteWishlistItem(item.id)
      await loadWishlist()
      setActionMessage("Wishlist updated.")
    } catch (error: any) {
      setWishlist(previous)
      setWishlistError(error?.message ?? "Unable to remove wishlist item.")
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/60">
          Wishlist
        </p>
        <p className="text-xs uppercase tracking-[0.16em] text-foreground/55">
          {wishlist?.items?.length || 0} saved
        </p>
      </div>

      {isCustomerLoading ? (
        <p className="inline-flex items-center gap-2 text-sm text-foreground/70">
          <BrandSpinner />
          Checking account status...
        </p>
      ) : null}

      {!isCustomerLoading && !isAuthenticated ? (
        <div
          className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-3"
          data-testid="wishlist-auth-required"
        >
          <p className="text-sm text-foreground/80">Sign in to save products to your wishlist.</p>
          <LocalizedClientLink href="/account">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </LocalizedClientLink>
        </div>
      ) : null}

      {!isCustomerLoading && isAuthenticated ? (
        <>
          <Button
            type="button"
            variant={selectedWishlistItem ? "secondary" : "outline"}
            className="w-full"
            disabled={isMutating || !selectedVariantId || isWishlistLoading}
            onClick={handleToggleSelectedVariant}
            data-testid="wishlist-toggle-button"
          >
            {isMutating ? (
              <span className="inline-flex items-center gap-2">
                <BrandSpinner />
                Updating...
              </span>
            ) : !selectedVariantId ? (
              "Add to wishlist (select options first)"
            ) : selectedWishlistItem ? (
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 fill-primary text-primary" />
                Remove from wishlist
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Add to wishlist
              </span>
            )}
          </Button>

          {actionMessage ? (
            <p className="text-xs text-foreground/75" data-testid="wishlist-action-message">
              {actionMessage}
            </p>
          ) : null}

          {wishlistError ? (
            <div
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              data-testid="wishlist-error-state"
            >
              <p>{wishlistError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={loadWishlist}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {isWishlistLoading ? (
            <p
              className="inline-flex items-center gap-2 text-xs text-foreground/70"
              data-testid="wishlist-loading-state"
            >
              <BrandSpinner />
              Loading wishlist...
            </p>
          ) : null}

          {!isWishlistLoading && !wishlistError ? (
            <div className="space-y-2" data-testid="wishlist-items-state">
              {!wishlist?.items?.length ? (
                <p className="text-xs text-foreground/70" data-testid="wishlist-empty-state">
                  No saved items yet.
                </p>
              ) : (
                <ul className="space-y-2" data-testid="wishlist-items-list">
                  {wishlist.items.map((item) => {
                    const selected = variantIdForItem(item) === selectedVariantId

                    return (
                      <li
                        key={item.id}
                        className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
                          selected
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/50 bg-card/65"
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-foreground/85">
                          {displayLabelForItem(item)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-foreground/70 hover:text-foreground"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isMutating}
                          aria-label="Remove item from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
