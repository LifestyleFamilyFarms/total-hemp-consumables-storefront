import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/lib/sort-options"
import { parsePlpUrlState } from "@modules/store/lib/url-state"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sort?: SortOptions
    sortBy?: SortOptions
    q?: string
    category?: string | string[]
    type?: string | string[]
    effect?: string | string[]
    compound?: string | string[]
    cardStyle?: string | string[]
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Total Hemp Consumables`,
    description: `${collection.title} collection`,
    alternates: {
      canonical: `/${params.countryCode}/collections/${params.handle}`,
    },
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const state = parsePlpUrlState(searchParams)

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={state.page}
      sortBy={state.sort}
      q={state.q}
      selectedCategories={state.category}
      selectedTypes={state.type}
      selectedEffects={state.effect}
      selectedCompounds={state.compound}
      cardStyle={state.cardStyle}
      countryCode={params.countryCode}
    />
  )
}
