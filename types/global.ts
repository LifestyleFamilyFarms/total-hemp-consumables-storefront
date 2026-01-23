export type VariantPrice = {
  calculated_price: number | string
  original_price: number | string
  currency_code: string
  calculated_price_type?: string | null
  price_type?: string | null
  percentage_diff?: string | number
}

export type StoreFreeShippingPrice = {
  amount: number
  currency_code: string
  target_reached?: boolean
  target_remaining?: number
  remaining_percentage?: number
}
