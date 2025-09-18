import type { Metadata } from "next"
import StoreTemplate from "@modules/store/templates"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Vapes | Total Hemp Consumables",
}

export default async function VapesPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string; sortBy?: SortOptions }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  return (
    <StoreTemplate
      sortBy={searchParams.sortBy}
      page={searchParams.page}
      countryCode={params.countryCode}
    />
  )
}

