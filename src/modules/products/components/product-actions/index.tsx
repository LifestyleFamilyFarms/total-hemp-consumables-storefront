"use client"

import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useCart } from "@lib/context/cart-context"
import { toast } from "@/components/ui/sonner"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, refresh } = useCart()

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // helper to map variant.options to keymap
  const mapOptions = (v: HttpTypes.StoreProductVariant) => {
    return (v.options || []).reduce((acc: Record<string, string>, o: any) => {
      acc[o.option_id] = o.value
      return acc
    }, {})
  }

  const variantInventoryQuantity = (
    v?: HttpTypes.StoreProductVariant
  ): number | null => {
    if (!v) {
      return null
    }

    const qty = v.inventory_quantity

    if (typeof qty === "number") {
      return qty
    }

    if (typeof qty === "string") {
      const parsed = Number(qty)
      return Number.isFinite(parsed) ? parsed : null
    }

    return null
  }

  const variantInStock = (v?: HttpTypes.StoreProductVariant) => {
    if (!v) return false
    if (!v.manage_inventory) return true
    if (v.allow_backorder) return true
    const quantity = variantInventoryQuantity(v)
    if (quantity === null) {
      return true
    }
    return quantity > 0
  }

  // compute available values for a given option based on current selection and inventory
  const getAvailableValues = (optionId: string): Set<string> => {
    const values = new Set<string>()
    ;(product.variants || []).forEach((v) => {
      if (!variantInStock(v)) return
      const vo = mapOptions(v)
      // all other selected options must match
      const matchesOthers = Object.entries(options).every(([k, val]) => {
        if (!val || k === optionId) return true
        return vo[k] === val
      })
      if (matchesOthers && vo[optionId]) {
        values.add(vo[optionId])
      }
    })
    return values
  }

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (selectedVariant?.manage_inventory) {
      const quantity = variantInventoryQuantity(selectedVariant)
      if (quantity === null || quantity > 0) {
        return true
      }
    } else if (selectedVariant) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const buttonLabel =
    !selectedVariant || !isValidVariant
      ? (product.variants?.length ?? 0) > 1
        ? "Select options"
        : "Unavailable"
      : !inStock
      ? "Out of stock"
      : "Add to cart"

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addItem(selectedVariant.id, 1).catch(() => {
      /* swallow errors for now */
    })
    await refresh()
    toast.success("Added to cart")
    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                const avail = getAvailableValues(option.id)
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                      isValueDisabled={(val) => avail.size > 0 && !avail.has(val)}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          className="flex h-10 w-full items-center justify-center"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            buttonLabel
          )}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
