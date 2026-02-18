"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import SectionCard from "../section-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { cn } from "src/lib/utils"
import { SHIPSTATION_SERVICE_ALLOWLIST_SET } from "src/lib/constants/shipping"
import { setShippingMethod } from "@lib/data/cart"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

const Dot = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      "inline-block h-4 w-4 rounded-full border border-border",
      checked ? "bg-primary border-primary" : "bg-white"
    )}
  />
)

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

type EnrichedShippingOption = HttpTypes.StoreCartShippingOption & {
  service_zone?: {
    fulfillment_set?: {
      type?: string
      location?: { address?: HttpTypes.StoreCartAddress }
    }
  }
  insufficient_inventory?: boolean
}

const gramsToPounds = (grams: number) => grams / 453.59237
const gramsToKilograms = (grams: number) => grams / 1000
const formatCurrencyFromMinor = (
  value: number,
  currency: string | undefined
) =>
  convertToLocale({
    amount: value / 100,
    currency_code: currency ?? "usd",
  })

const normalizeToMinorUnits = (amount?: number | null) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return undefined
  }
  // If the value looks like dollars (e.g., 9.1 -> $9.10), convert to cents.
  // If it's already in cents (e.g., 910), leave as-is.
  return Math.abs(amount) < 1000 ? Math.round(amount * 100) : Math.round(amount)
}

function formatAddress(address?: HttpTypes.StoreCartAddress | null) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const isShipstationOptionAllowed = (
  option: HttpTypes.StoreCartShippingOption
) => {
  if (!option.provider_id?.includes("shipstation")) {
    return true
  }

  if (!SHIPSTATION_SERVICE_ALLOWLIST_SET?.size) {
    return true
  }

  const code =
    typeof option.type?.code === "string"
      ? option.type.code.toLowerCase()
      : undefined

  const data =
    typeof option.data === "object" && option.data !== null
      ? (option.data as Record<string, unknown>)
      : undefined
  const serviceCode =
    typeof data?.carrier_service_code === "string"
      ? data.carrier_service_code.toLowerCase()
      : undefined

  if (code && SHIPSTATION_SERVICE_ALLOWLIST_SET?.has(code)) {
    return true
  }

  if (serviceCode && SHIPSTATION_SERVICE_ALLOWLIST_SET?.has(serviceCode)) {
    return true
  }

  return false
}

const hasInsufficientInventory = (
  option?: HttpTypes.StoreCartShippingOption | null
) => Boolean((option as any)?.insufficient_inventory)

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const currentCart = cart

  const enrichedShippingOptions = useMemo<EnrichedShippingOption[]>(() => {
    return (availableShippingMethods ?? []).map(
      (option) => option as EnrichedShippingOption
    )
  }, [availableShippingMethods])

  const totalWeightGrams = useMemo(() => {
    return (currentCart?.items ?? []).reduce((sum, item) => {
      const weight =
        Number((item as any)?.variant?.weight ?? (item as any)?.weight ?? 0)
      const quantity = Number(item?.quantity ?? 0)
      return sum + weight * quantity
    }, 0)
  }, [currentCart?.items])

  const totalWeightPounds =
    totalWeightGrams > 0 ? gramsToPounds(totalWeightGrams) : 0
  const totalWeightKilograms =
    totalWeightGrams > 0 ? gramsToKilograms(totalWeightGrams) : 0

  const weightSummary =
    totalWeightGrams > 0
      ? `${totalWeightPounds >= 10 ? totalWeightPounds.toFixed(1) : totalWeightPounds.toFixed(2)} lb (${totalWeightKilograms.toFixed(2)} kg)`
      : "Not provided"

  const initialShippingMethodId =
    currentCart?.shipping_methods?.at(-1)?.shipping_option_id ?? null
  const initialShippingAmount =
    normalizeToMinorUnits(currentCart?.shipping_methods?.at(-1)?.amount) ?? null

  const initialPickupSelected = Boolean(
    enrichedShippingOptions.some(
      (method) =>
        method.id === initialShippingMethodId &&
        method.service_zone?.fulfillment_set?.type === "pickup"
    )
  )

  const [shippingMethodId, setShippingMethodId] = useState<string>(
    initialShippingMethodId || ""
  )
  const [selectedShippingOptionId, setSelectedShippingOptionId] =
    useState<string>(initialPickupSelected ? "" : initialShippingMethodId || "")
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >(() => {
    if (
      initialShippingMethodId &&
      !initialPickupSelected &&
      typeof initialShippingAmount === "number"
    ) {
      return { [initialShippingMethodId]: initialShippingAmount }
    }

    return {}
  })
  const [showPickupOptions, setShowPickupOptions] = useState<string>(
    initialPickupSelected ? PICKUP_OPTION_ON : PICKUP_OPTION_OFF
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [isPrefetchingRates, setIsPrefetchingRates] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  useEffect(() => {
    setShippingMethodId(initialShippingMethodId || "")
    setSelectedShippingOptionId(
      initialPickupSelected ? "" : initialShippingMethodId || ""
    )
    setShowPickupOptions(initialPickupSelected ? PICKUP_OPTION_ON : PICKUP_OPTION_OFF)

    if (
      initialShippingMethodId &&
      !initialPickupSelected &&
      typeof initialShippingAmount === "number"
    ) {
      setCalculatedPricesMap({ [initialShippingMethodId]: initialShippingAmount })
    } else {
      setCalculatedPricesMap({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPickupSelected, initialShippingAmount, initialShippingMethodId, isOpen])

  const prioritise = (option: HttpTypes.StoreCartShippingOption) => {
    if (option.provider_id?.includes("shipstation")) {
      return 0
    }
    if (option.price_type === "calculated") {
      return 1
    }
    return 2
  }

  const shippingOptions = useMemo<EnrichedShippingOption[]>(() => {
    return (
      enrichedShippingOptions
        .filter(
          (option) => option.service_zone?.fulfillment_set?.type !== "pickup"
        )
        .filter((option) => isShipstationOptionAllowed(option))
        .sort((a, b) => prioritise(a) - prioritise(b)) ?? []
    )
  }, [enrichedShippingOptions])

  const pickupOptions = useMemo<EnrichedShippingOption[]>(() => {
    return (
      enrichedShippingOptions.filter(
        (option) => option.service_zone?.fulfillment_set?.type === "pickup"
      ) ?? []
    )
  }, [enrichedShippingOptions])

  const hasPickupOptions = pickupOptions.length > 0

  const hasCompleteShippingAddress = useMemo(() => {
    const address = currentCart?.shipping_address

    if (!address) {
      return false
    }

    const requiredFields = [
      address.first_name,
      address.last_name,
      address.address_1,
      address.city,
      address.postal_code,
      address.country_code,
      address.phone,
    ]

    if (requiredFields.some((field) => !field || `${field}`.trim() === "")) {
      return false
    }

    if (
      address.country_code?.toLowerCase() === "us" &&
      (!address.province || `${address.province}`.trim() === "")
    ) {
      return false
    }

    return true
  }, [currentCart?.shipping_address])

  useEffect(() => {
    if (showPickupOptions === PICKUP_OPTION_ON) {
      return
    }

    if (!shippingOptions.length) {
      if (selectedShippingOptionId !== "") {
        setSelectedShippingOptionId("")
      }
      return
    }

    if (!selectedShippingOptionId) {
      setSelectedShippingOptionId(shippingOptions[0].id)
      return
    }

    const exists = shippingOptions.some(
      (option) => option.id === selectedShippingOptionId
    )

    if (!exists) {
      setSelectedShippingOptionId(shippingOptions[0].id)
    }
  }, [shippingOptions, selectedShippingOptionId, showPickupOptions])

  useEffect(() => {
    if (!hasCompleteShippingAddress) {
      setCalculatedPricesMap({})
    }
  }, [hasCompleteShippingAddress])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSelectShippingOption = (value: string) => {
    setSelectedShippingOptionId(value)
    setShowPickupOptions(PICKUP_OPTION_OFF)
    setError(null)
  }

  const handleCalculateShipping = async () => {
    if (!selectedShippingOptionId) {
      setError("Select a delivery service before calculating shipping.")
      return
    }

    const selectedOption = shippingOptions.find(
      (option) => option.id === selectedShippingOptionId
    )

    if (!selectedOption) {
      setError("The selected delivery service is no longer available.")
      return
    }

    if (hasInsufficientInventory(selectedOption)) {
      setError("This delivery service is currently unavailable.")
      return
    }

    if (!hasCompleteShippingAddress) {
      setError(
        "Enter your shipping address before calculating a delivery rate."
      )
      return
    }

    setIsProcessing(true)
    setIsCalculatingShipping(true)
    setError(null)
    setShowPickupOptions(PICKUP_OPTION_OFF)

    try {
      let amountMinor: number | undefined =
        selectedOption.price_type === "flat"
          ? normalizeToMinorUnits(selectedOption.amount ?? undefined)
          : calculatedPricesMap[selectedOption.id]

      if (
        selectedOption.price_type === "calculated" &&
        typeof calculatedPricesMap[selectedOption.id] !== "number"
      ) {
        const calculated = await calculatePriceForShippingOption(
          selectedOption.id,
          currentCart?.id as string
        )

        if (!calculated || typeof calculated.amount !== "number") {
          throw new Error("ShipStation did not return a rate for this service.")
        }

        amountMinor = normalizeToMinorUnits(calculated.amount)
      }

      if (typeof amountMinor !== "number") {
        throw new Error("Unable to determine a rate for this delivery service.")
      }

      await setShippingMethod({
        cartId: currentCart.id,
        shippingMethodId: selectedOption.id,
      })

      setCalculatedPricesMap((prev) => ({
        ...prev,
        [selectedOption.id]: amountMinor as number,
      }))
      setShippingMethodId(selectedOption.id)
      router.refresh()
      // Log for debug visibility
      // eslint-disable-next-line no-console
      console.log("[shipping] set option", selectedOption.id, "amountMinor", amountMinor)
      // Auto-advance to payment after applying shipping
      router.push(`${pathname}?step=payment`, { scroll: false })
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to calculate shipping. Please try again or choose a different service."
      )
    } finally {
      setIsProcessing(false)
      setIsCalculatingShipping(false)
    }
  }

  const handleSetPickupMethod = async (id: string) => {
    if (!hasCompleteShippingAddress) {
      setError("Enter your shipping address before selecting a delivery method.")
      return
    }

    setError(null)

    setIsProcessing(true)
    setShowPickupOptions(PICKUP_OPTION_ON)
      setSelectedShippingOptionId("")

    try {
      await setShippingMethod({
        cartId: currentCart.id,
        shippingMethodId: id,
      })
      setShippingMethodId(id)
      router.refresh()
      // eslint-disable-next-line no-console
      console.log("[shipping] set pickup method", id)
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to select store pickup. Please try again or choose shipping."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Prefetch rates for all available shipping options when address is complete.
  useEffect(() => {
    const prefetch = async () => {
      if (!hasCompleteShippingAddress || !shippingOptions.length) return
      setIsPrefetchingRates(true)
      try {
        const entries = await Promise.all(
          shippingOptions.map(async (option) => {
            if (option.price_type === "flat" && typeof option.amount === "number") {
              return [option.id, normalizeToMinorUnits(option.amount)] as const
            }
            if (option.price_type === "calculated") {
              const calculated = await calculatePriceForShippingOption(
                option.id,
                currentCart?.id as string
              )
              return [
                option.id,
                normalizeToMinorUnits(
                  typeof calculated?.amount === "number" ? calculated.amount : undefined
                ),
              ] as const
            }
            return [option.id, undefined] as const
          })
        )
        const next: Record<string, number> = {}
        entries.forEach(([id, amt]) => {
          if (typeof amt === "number") {
            next[id] = amt
          }
        })
        if (Object.keys(next).length) {
          setCalculatedPricesMap((prev) => ({ ...prev, ...next }))
        }
      } catch (err) {
        // swallow prefetch errors; user can still click Apply to fetch a rate
        console.warn("[shipping] prefetch rates error", err)
      } finally {
        setIsPrefetchingRates(false)
      }
    }
    void prefetch()
  }, [currentCart?.id, hasCompleteShippingAddress, shippingOptions])

  const selectedShippingOption = selectedShippingOptionId
    ? shippingOptions.find((option) => option.id === selectedShippingOptionId)
    : null

  const hasPendingPaymentSession = useMemo(() => {
    return (
      currentCart?.payment_collection?.payment_sessions?.some(
        (session: any) => session?.status === "pending"
      ) ?? false
    )
  }, [currentCart?.payment_collection?.payment_sessions])

  const selectedShippingPrice =
    selectedShippingOptionId
      ? typeof calculatedPricesMap[selectedShippingOptionId] === "number"
        ? calculatedPricesMap[selectedShippingOptionId]
        : selectedShippingOption?.price_type === "flat" &&
            typeof selectedShippingOption.amount === "number"
          ? normalizeToMinorUnits(selectedShippingOption.amount)
          : undefined
      : undefined

  const shippingRateExplanation = useMemo(() => {
    if (!selectedShippingOption) {
      return "Select a delivery service to see the rate."
    }

    if (selectedShippingOption.price_type === "flat") {
      return "Flat rate provided by ShipStation."
    }

    if (typeof selectedShippingPrice !== "number") {
      return "Calculated rate for the package weight above."
    }

    if (totalWeightPounds <= 0) {
      return "Calculated rate returned by ShipStation (no item weight on file)."
    }

    const totalDisplay = formatCurrencyFromMinor(
      selectedShippingPrice,
      cart?.currency_code
    )

    return `Calculated by ShipStation for ${totalWeightPounds >= 10 ? totalWeightPounds.toFixed(1) : totalWeightPounds.toFixed(2)} lb — ${totalDisplay}.`
  }, [
    cart?.currency_code,
    selectedShippingOption,
    selectedShippingPrice,
    totalWeightPounds,
  ])

  const shippingRateDisplay =
    selectedShippingOption === null
      ? "-"
      : isCalculatingShipping || isPrefetchingRates
        ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )
        : typeof selectedShippingPrice === "number"
          ? formatCurrencyFromMinor(
              selectedShippingPrice,
              cart?.currency_code
            )
          : "-"

  const isCalculateDisabled =
    !selectedShippingOption ||
    hasInsufficientInventory(selectedShippingOption) ||
    !hasCompleteShippingAddress ||
    isProcessing ||
    isCalculatingShipping

  const showContinueToPaymentCTA =
    !isOpen &&
    (currentCart?.shipping_methods?.length ?? 0) > 0 &&
    !hasPendingPaymentSession &&
    (currentCart?.total ?? 0) > 0

  return (
    <SectionCard
      title="Delivery"
      description="Choose how you’d like your order delivered."
      rightAction={
        !isOpen &&
        currentCart?.shipping_address &&
        currentCart?.billing_address &&
        currentCart?.email ? (
          <button
            onClick={handleEdit}
            className="text-sm font-medium text-primary hover:text-primary/80"
            data-testid="edit-delivery-button"
          >
            Edit
          </button>
        ) : null
      }
    >
      {isOpen ? (
        <>
          <div className="grid gap-y-8">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                Shipping method
              </span>
              <span className="mb-4 text-sm text-muted-foreground">
                How would you like you order delivered
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-8 md:pt-0 pt-2">
                <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Total package weight
                  </p>
                  <p>{weightSummary}</p>
                </div>
                {hasPickupOptions && (
                  <RadioGroup
                    value={showPickupOptions}
                    onChange={(value) => {
                      if (value === PICKUP_OPTION_ON) {
                        const id = pickupOptions.find(
                          (option) => !hasInsufficientInventory(option)
                        )?.id

                        if (id) {
                          handleSetPickupMethod(id)
                        }
                      } else {
                        setShowPickupOptions(PICKUP_OPTION_OFF)
                      }
                    }}
                  >
                    <Radio
                      value={PICKUP_OPTION_ON}
                      data-testid="delivery-option-radio"
                      className={cn(
                        "flex items-center justify-between rounded-2xl border border-border px-6 py-4 text-sm transition-all duration-200 bg-accent/5 hover:border-primary hover:bg-accent/10",
                        showPickupOptions === PICKUP_OPTION_ON &&
                          "border-primary bg-accent/10"
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <Dot
                          checked={showPickupOptions === PICKUP_OPTION_ON}
                        />
                        <span className="text-base font-medium text-foreground">
                          Pick up your order
                        </span>
                      </div>
                      <span className="justify-self-end text-foreground">
                        -
                      </span>
                    </Radio>
                  </RadioGroup>
                )}

                {shippingOptions.length ? (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-4">
                      <Select
                        value={selectedShippingOptionId}
                        onValueChange={handleSelectShippingOption}
                        disabled={showPickupOptions === PICKUP_OPTION_ON}
                      >
                        <SelectTrigger
                          className="h-12 w-full text-left"
                          aria-label="Delivery service"
                          data-testid="delivery-option-select"
                        >
                          <SelectValue placeholder="Select a delivery service" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingOptions.map((option) => {
                            const amountMinor =
                              option.price_type === "flat" &&
                              typeof option.amount === "number"
                                ? normalizeToMinorUnits(option.amount)
                                : typeof calculatedPricesMap[option.id] ===
                                    "number"
                                  ? calculatedPricesMap[option.id]
                                  : undefined
                            const priceLabel =
                              typeof amountMinor === "number"
                                ? formatCurrencyFromMinor(
                                    amountMinor,
                                    cart?.currency_code
                                  )
                                : ""
                            return (
                              <SelectItem
                                key={option.id}
                                value={option.id}
                                disabled={hasInsufficientInventory(option)}
                              >
                                {priceLabel
                                  ? `${option.name} — ${priceLabel}`
                                  : option.name}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            Shipping rate
                          </span>
                          <div className="text-sm text-muted-foreground">
                            {shippingRateDisplay}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shippingRateExplanation}
                          </div>
                        </div>
                        <Button
                          type="button"
                          className="h-11 w-full px-6 text-sm font-medium sm:w-auto"
                          onClick={handleCalculateShipping}
                          disabled={isCalculateDisabled}
                          data-testid="calculate-shipping-button"
                        >
                          {isCalculatingShipping && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Apply shipping rate
                        </Button>
                      </div>

                      {hasInsufficientInventory(selectedShippingOption) && (
                        <p className="text-sm text-destructive">
                          This delivery service is currently unavailable.
                        </p>
                      )}

                      {!hasCompleteShippingAddress && (
                        <p className="text-sm text-muted-foreground">
                          Enter your complete shipping address to enable rate
                          calculation.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                    No delivery services are available right now. Please verify
                    your address or try again later.
                  </div>
                )}
              </div>
            </div>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Store
                </span>
                <span className="mb-4 text-sm text-muted-foreground">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-8 md:pt-0 pt-2">
                    <RadioGroup
                      value={shippingMethodId ?? ""}
                      onChange={(value) => handleSetPickupMethod(value)}
                    >
                      {pickupOptions.map((option) => {
                        return (
                          <Radio
                            key={option.id}
                            value={option.id}
                            disabled={hasInsufficientInventory(option)}
                          data-testid="delivery-option-radio"
                          className={cn(
                            "flex items-center justify-between rounded-2xl border border-border px-6 py-4 text-sm transition-all duration-200 bg-card hover:border-primary hover:bg-accent/5",
                            option.id === shippingMethodId &&
                              "border-primary bg-accent/10",
                            hasInsufficientInventory(option) &&
                              "cursor-not-allowed opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <Dot checked={option.id === shippingMethodId} />
                            <div className="flex flex-col">
                              <span className="text-base font-medium text-foreground">
                                {option.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatAddress(
                                  option.service_zone?.fulfillment_set?.location
                                    ?.address
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-foreground">
                            {convertToLocale({
                              amount:
                                normalizeToMinorUnits(option.amount ?? 0) ?? 0,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              className="h-11 w-full px-6 text-sm font-medium md:w-auto"
              onClick={handleSubmit}
              disabled={!shippingMethodId || isProcessing}
              data-testid="submit-delivery-option-button"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          {currentCart && (currentCart.shipping_methods?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <span className="text-foreground font-medium">Method</span>
                <span className="text-sm text-muted-foreground">
                  {currentCart.shipping_methods?.at(-1)?.name}{" "}
                  {formatCurrencyFromMinor(
                    normalizeToMinorUnits(
                      currentCart.shipping_methods?.at(-1)?.amount ?? 0
                    ) ?? 0,
                    currentCart?.currency_code
                  )}
                </span>
              </div>
              {showContinueToPaymentCTA && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(`${pathname}?step=delivery`, {
                      scroll: false,
                    })
                  }}
                >
                  Change shipping method
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span>No delivery method selected yet.</span>
              <button
                onClick={handleEdit}
                className="w-fit text-sm font-medium text-primary hover:text-primary/80"
              >
                Choose delivery
              </button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

export default Shipping
