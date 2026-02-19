import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/lib/sort-options"
import { parsePlpUrlState } from "@modules/store/lib/url-state"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sort?: SortOptions
    sortBy?: SortOptions
    page?: string
    q?: string
    category?: string | string[]
    type?: string | string[]
    effect?: string | string[]
    compound?: string | string[]
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const state = parsePlpUrlState(searchParams)

  return (
    <StoreTemplate
      sortBy={state.sort}
      page={state.page}
      q={state.q}
      category={state.category}
      type={state.type}
      effect={state.effect}
      compound={state.compound}
      countryCode={params.countryCode}
      layout="split"
    />
  )
}
