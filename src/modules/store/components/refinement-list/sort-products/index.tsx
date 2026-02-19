"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import {
  DEFAULT_SORT,
  SortOptions,
  SORT_LABELS,
} from "@modules/store/lib/sort-options"
export type { SortOptions } from "@modules/store/lib/sort-options"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
    label: SORT_LABELS.created_at,
  },
  {
    value: "price_asc",
    label: SORT_LABELS.price_asc,
  },
  {
    value: "price_desc",
    label: SORT_LABELS.price_desc,
  },
  {
    value: "title_az",
    label: SORT_LABELS.title_az,
  },
  {
    value: "title_za",
    label: SORT_LABELS.title_za,
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sort", value)
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy || DEFAULT_SORT}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
