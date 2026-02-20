"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DEFAULT_SORT,
  SortOptions,
  SORT_LABELS,
} from "@modules/store/lib/sort-options"
import { PLP_QUERY_KEYS } from "@modules/store/lib/url-state"

type FacetOption = {
  value: string
  label: string
  count: number
}

type FacetOptionGroups = {
  type: FacetOption[]
  effect: FacetOption[]
  compound: FacetOption[]
}

type PlpControlsProps = {
  sort: SortOptions
  q: string
  category: string[]
  type: string[]
  effect: string[]
  compound: string[]
  facetOptions: FacetOptionGroups
}

type MobileDraftState = {
  sort: SortOptions
  type: string[]
  effect: string[]
  compound: string[]
}

const SORT_OPTIONS: SortOptions[] = [
  "created_at",
  "price_desc",
  "price_asc",
  "title_az",
  "title_za",
]

const toSortedUnique = (values: string[]) => Array.from(new Set(values)).sort()

const toCsv = (values: string[]) => toSortedUnique(values).join(",")

const toggleListValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]

function FacetGroup({
  title,
  options,
  selectedValues,
  onToggle,
}: {
  title: string
  options: FacetOption[]
  selectedValues: Set<string>
  onToggle: (value: string) => void
}) {
  if (!options.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selectedValues.has(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={
                active
                  ? "inline-flex min-h-9 items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                  : "inline-flex min-h-9 items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/50"
              }
            >
              <span>{option.label}</span>
              <span className={active ? "text-primary-foreground/90" : "text-foreground/60"}>
                ({option.count})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActiveFilterChips({
  typeOptions,
  effectOptions,
  compoundOptions,
  selectedType,
  selectedEffect,
  selectedCompound,
  q,
  category,
  onRemoveType,
  onRemoveEffect,
  onRemoveCompound,
  onClearAll,
}: {
  typeOptions: FacetOption[]
  effectOptions: FacetOption[]
  compoundOptions: FacetOption[]
  selectedType: string[]
  selectedEffect: string[]
  selectedCompound: string[]
  q: string
  category: string[]
  onRemoveType: (value: string) => void
  onRemoveEffect: (value: string) => void
  onRemoveCompound: (value: string) => void
  onClearAll: () => void
}) {
  const typeMap = useMemo(
    () => new Map(typeOptions.map((item) => [item.value, item.label])),
    [typeOptions]
  )
  const effectMap = useMemo(
    () => new Map(effectOptions.map((item) => [item.value, item.label])),
    [effectOptions]
  )
  const compoundMap = useMemo(
    () => new Map(compoundOptions.map((item) => [item.value, item.label])),
    [compoundOptions]
  )

  const hasActiveFilters =
    selectedType.length > 0 ||
    selectedEffect.length > 0 ||
    selectedCompound.length > 0 ||
    Boolean(q) ||
    category.length > 0

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
          Active filters
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onClearAll}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedType.map((value) => (
          <button
            key={`type-${value}`}
            type="button"
            onClick={() => onRemoveType(value)}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            Type: {typeMap.get(value) ?? value}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {selectedEffect.map((value) => (
          <button
            key={`effect-${value}`}
            type="button"
            onClick={() => onRemoveEffect(value)}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            Effect: {effectMap.get(value) ?? value}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {selectedCompound.map((value) => (
          <button
            key={`compound-${value}`}
            type="button"
            onClick={() => onRemoveCompound(value)}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            Compound: {compoundMap.get(value) ?? value}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {q ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-dashed border-border/60 bg-background/80 px-2.5 text-xs font-semibold text-foreground/70">
            Keyword: {q}
          </span>
        ) : null}
        {category.map((value) => (
          <span
            key={`category-${value}`}
            className="inline-flex min-h-8 items-center rounded-full border border-dashed border-border/60 bg-background/80 px-2.5 text-xs font-semibold text-foreground/70"
          >
            Category: {value}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PlpControls({
  sort,
  q,
  category,
  type,
  effect,
  compound,
  facetOptions,
}: PlpControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileDraft, setMobileDraft] = useState<MobileDraftState>({
    sort,
    type,
    effect,
    compound,
  })

  const selectedType = useMemo(() => new Set(type), [type])
  const selectedEffect = useMemo(() => new Set(effect), [effect])
  const selectedCompound = useMemo(() => new Set(compound), [compound])

  useEffect(() => {
    setMobileDraft({
      sort,
      type,
      effect,
      compound,
    })
  }, [sort, type, effect, compound])

  const pushParams = (mutator: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutator(params)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const onSortChange = (nextSort: SortOptions) => {
    pushParams((params) => {
      params.set(PLP_QUERY_KEYS.sort, nextSort)
      params.delete(PLP_QUERY_KEYS.legacySort)
      params.delete(PLP_QUERY_KEYS.page)
    })
  }

  const writeFacetSelection = (
    params: URLSearchParams,
    key: (typeof PLP_QUERY_KEYS)["type" | "effect" | "compound"],
    values: string[]
  ) => {
    const csv = toCsv(values)
    if (csv) {
      params.set(key, csv)
    } else {
      params.delete(key)
    }
  }

  const applyDesktopSelection = ({
    nextType,
    nextEffect,
    nextCompound,
  }: {
    nextType?: string[]
    nextEffect?: string[]
    nextCompound?: string[]
  }) => {
    pushParams((params) => {
      writeFacetSelection(params, PLP_QUERY_KEYS.type, nextType ?? type)
      writeFacetSelection(params, PLP_QUERY_KEYS.effect, nextEffect ?? effect)
      writeFacetSelection(params, PLP_QUERY_KEYS.compound, nextCompound ?? compound)
      params.delete(PLP_QUERY_KEYS.page)
    })
  }

  const clearFilters = () => {
    pushParams((params) => {
      params.delete(PLP_QUERY_KEYS.query)
      params.delete(PLP_QUERY_KEYS.category)
      params.delete(PLP_QUERY_KEYS.type)
      params.delete(PLP_QUERY_KEYS.effect)
      params.delete(PLP_QUERY_KEYS.compound)
      params.delete(PLP_QUERY_KEYS.page)
    })
  }

  const applyMobileFilters = () => {
    pushParams((params) => {
      params.set(PLP_QUERY_KEYS.sort, mobileDraft.sort)
      params.delete(PLP_QUERY_KEYS.legacySort)
      writeFacetSelection(params, PLP_QUERY_KEYS.type, mobileDraft.type)
      writeFacetSelection(params, PLP_QUERY_KEYS.effect, mobileDraft.effect)
      writeFacetSelection(params, PLP_QUERY_KEYS.compound, mobileDraft.compound)
      params.delete(PLP_QUERY_KEYS.page)
    })

    setMobileOpen(false)
  }

  return (
    <section className="surface-panel space-y-4 rounded-3xl border border-border/60 p-4">
      <div className="hidden space-y-4 lg:block">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Sort
          </p>
          <Select onValueChange={(value) => onSortChange(value as SortOptions)} value={sort || DEFAULT_SORT}>
            <SelectTrigger className="w-full" aria-label="Sort products">
              <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent align="start">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ActiveFilterChips
          typeOptions={facetOptions.type}
          effectOptions={facetOptions.effect}
          compoundOptions={facetOptions.compound}
          selectedType={type}
          selectedEffect={effect}
          selectedCompound={compound}
          q={q}
          category={category}
          onRemoveType={(value) =>
            applyDesktopSelection({
              nextType: type.filter((item) => item !== value),
            })
          }
          onRemoveEffect={(value) =>
            applyDesktopSelection({
              nextEffect: effect.filter((item) => item !== value),
            })
          }
          onRemoveCompound={(value) =>
            applyDesktopSelection({
              nextCompound: compound.filter((item) => item !== value),
            })
          }
          onClearAll={clearFilters}
        />

        <FacetGroup
          title="Type"
          options={facetOptions.type}
          selectedValues={selectedType}
          onToggle={(value) =>
            applyDesktopSelection({
              nextType: toggleListValue(type, value),
            })
          }
        />

        <FacetGroup
          title="Effect"
          options={facetOptions.effect}
          selectedValues={selectedEffect}
          onToggle={(value) =>
            applyDesktopSelection({
              nextEffect: toggleListValue(effect, value),
            })
          }
        />

        <FacetGroup
          title="Cannabinoid"
          options={facetOptions.compound}
          selectedValues={selectedCompound}
          onToggle={(value) =>
            applyDesktopSelection({
              nextCompound: toggleListValue(compound, value),
            })
          }
        />
      </div>

      <div className="space-y-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={() => setMobileOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <Button type="button" variant="ghost" onClick={clearFilters} className="h-10 px-3">
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <ActiveFilterChips
          typeOptions={facetOptions.type}
          effectOptions={facetOptions.effect}
          compoundOptions={facetOptions.compound}
          selectedType={type}
          selectedEffect={effect}
          selectedCompound={compound}
          q={q}
          category={category}
          onRemoveType={(value) =>
            applyDesktopSelection({
              nextType: type.filter((item) => item !== value),
            })
          }
          onRemoveEffect={(value) =>
            applyDesktopSelection({
              nextEffect: effect.filter((item) => item !== value),
            })
          }
          onRemoveCompound={(value) =>
            applyDesktopSelection({
              nextCompound: compound.filter((item) => item !== value),
            })
          }
          onClearAll={clearFilters}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[92vw] overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter catalog</SheetTitle>
            <SheetDescription>
              Refine by product type, intended effect, and cannabinoid profile.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Sort
              </p>
              <Select
                onValueChange={(value) =>
                  setMobileDraft((prev) => ({
                    ...prev,
                    sort: value as SortOptions,
                  }))
                }
                value={mobileDraft.sort || DEFAULT_SORT}
              >
                <SelectTrigger className="w-full" aria-label="Sort products">
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent align="start">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {SORT_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FacetGroup
              title="Type"
              options={facetOptions.type}
              selectedValues={new Set(mobileDraft.type)}
              onToggle={(value) =>
                setMobileDraft((prev) => ({
                  ...prev,
                  type: toggleListValue(prev.type, value),
                }))
              }
            />

            <FacetGroup
              title="Effect"
              options={facetOptions.effect}
              selectedValues={new Set(mobileDraft.effect)}
              onToggle={(value) =>
                setMobileDraft((prev) => ({
                  ...prev,
                  effect: toggleListValue(prev.effect, value),
                }))
              }
            />

            <FacetGroup
              title="Cannabinoid"
              options={facetOptions.compound}
              selectedValues={new Set(mobileDraft.compound)}
              onToggle={(value) =>
                setMobileDraft((prev) => ({
                  ...prev,
                  compound: toggleListValue(prev.compound, value),
                }))
              }
            />
          </div>

          <div className="mt-8 flex gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setMobileOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={applyMobileFilters}>
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
