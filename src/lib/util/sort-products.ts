import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/lib/sort-options"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
  _maxPrice?: number
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = [...products] as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute both min/max prices so asc/desc can reflect variant ranges.
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        const variantPrices = product.variants
          .map((variant) => variant?.calculated_price?.calculated_amount)
          .filter((amount): amount is number => typeof amount === "number")

        if (variantPrices.length) {
          product._minPrice = Math.min(...variantPrices)
          product._maxPrice = Math.max(...variantPrices)
        } else {
          product._minPrice = Infinity
          product._maxPrice = -Infinity
        }
      } else {
        product._minPrice = Infinity
        product._maxPrice = -Infinity
      }
    })

    // Low->high uses min price, high->low uses max price.
    sortedProducts.sort((a, b) => {
      if (sortBy === "price_asc") {
        const minDiff = (a._minPrice ?? Infinity) - (b._minPrice ?? Infinity)
        if (minDiff !== 0) {
          return minDiff
        }

        return (a._maxPrice ?? -Infinity) - (b._maxPrice ?? -Infinity)
      }

      const maxDiff = (b._maxPrice ?? -Infinity) - (a._maxPrice ?? -Infinity)
      if (maxDiff !== 0) {
        return maxDiff
      }

      return (b._minPrice ?? Infinity) - (a._minPrice ?? Infinity)
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  if (sortBy === "title_az") {
    sortedProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }

  if (sortBy === "title_za") {
    sortedProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""))
  }

  return sortedProducts
}
