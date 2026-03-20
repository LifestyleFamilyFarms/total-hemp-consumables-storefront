import { DEFAULT_SORT, SortOptions, isSortOption } from "./sort-options"

type QueryValue = string | string[] | undefined

export type PlpSearchParams = Record<string, QueryValue>

export const PLP_QUERY_KEYS = {
  sort: "sort",
  legacySort: "sortBy",
  page: "page",
  query: "q",
  category: "category",
  type: "type",
  effect: "effect",
  compound: "compound",
} as const

export type PlpUrlState = {
  sort: SortOptions
  page: number
  q: string
  category: string[]
  type: string[]
  effect: string[]
  compound: string[]
}

const readFirst = (value: QueryValue) =>
  Array.isArray(value) ? value[0] : value

const splitCsvValues = (value: QueryValue): string[] => {
  const values = Array.isArray(value) ? value : value ? [value] : []

  return Array.from(
    new Set(
      values
        .flatMap((part) => part.split(","))
        .map((part) => part.trim())
        .filter(Boolean)
    )
  )
}

const normalizePage = (value: QueryValue) => {
  const parsed = Number.parseInt(readFirst(value) || "", 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }
  return parsed
}

const normalizeSort = (searchParams: PlpSearchParams): SortOptions => {
  const sort =
    readFirst(searchParams[PLP_QUERY_KEYS.sort]) ||
    readFirst(searchParams[PLP_QUERY_KEYS.legacySort])

  if (!sort || !isSortOption(sort)) {
    return DEFAULT_SORT
  }

  return sort
}

export const parsePlpUrlState = (searchParams: PlpSearchParams): PlpUrlState => {
  const q = (readFirst(searchParams[PLP_QUERY_KEYS.query]) || "").trim()
  const category = splitCsvValues(searchParams[PLP_QUERY_KEYS.category])
  const type = splitCsvValues(searchParams[PLP_QUERY_KEYS.type])
  const effect = splitCsvValues(searchParams[PLP_QUERY_KEYS.effect])
  const compound = splitCsvValues(searchParams[PLP_QUERY_KEYS.compound])

  return {
    sort: normalizeSort(searchParams),
    page: normalizePage(searchParams[PLP_QUERY_KEYS.page]),
    q,
    category,
    type,
    effect,
    compound,
  }
}
