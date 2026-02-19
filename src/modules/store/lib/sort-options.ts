export const PRODUCT_SORT_VALUES = [
  "created_at",
  "price_asc",
  "price_desc",
  "title_az",
  "title_za",
] as const

export type SortOptions = (typeof PRODUCT_SORT_VALUES)[number]

export const DEFAULT_SORT: SortOptions = "created_at"

export const SORT_LABELS: Record<SortOptions, string> = {
  created_at: "Newest",
  price_desc: "Price: High to Low",
  price_asc: "Price: Low to High",
  title_az: "Name: A to Z",
  title_za: "Name: Z to A",
}

export const isSortOption = (value: string): value is SortOptions =>
  PRODUCT_SORT_VALUES.includes(value as SortOptions)
