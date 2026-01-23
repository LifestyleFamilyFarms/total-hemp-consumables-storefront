"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

type RegionRequestInit =
  | { cache: "no-store" }
  | {
      cache: "force-cache"
      next: Awaited<ReturnType<typeof getCacheOptions>>
    }

const buildRegionRequestInit = async (
  forceRefresh: boolean,
  cacheKey: string
): Promise<RegionRequestInit> => {
  if (forceRefresh) {
    return { cache: "no-store" }
  }

  return {
    cache: "force-cache",
    next: await getCacheOptions(cacheKey),
  }
}

export const listRegions = async (forceRefresh = false) => {
  const requestInit = await buildRegionRequestInit(forceRefresh, "regions")

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      ...requestInit,
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string, forceRefresh = false) => {
  const requestInit = await buildRegionRequestInit(
    forceRefresh,
    ["regions", id].join("-")
  )

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      ...requestInit,
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

export const getRegion = async (countryCode: string) => {
  const normalized = (countryCode || "us").toLowerCase()

  const findRegion = async (forceRefresh = false) => {
    const regions = await listRegions(forceRefresh)

    if (!regions?.length) {
      return null
    }

    const match =
      regions.find((region) =>
        region.countries?.some(
          (country) => country?.iso_2?.toLowerCase() === normalized
        )
      ) || null

    return match
  }

  try {
    let region = await findRegion(false)

    if (!region) {
      region = await findRegion(true)
    }

    if (!region) {
      return null
    }

    try {
      await retrieveRegion(region.id, true)
    } catch {
      region = await findRegion(true)
    }

    return region ?? null
  } catch {
    return null
  }
}
