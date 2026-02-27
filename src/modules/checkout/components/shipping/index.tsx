"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { setShippingMethod } from "@lib/data/cart"
import {
  CHECKOUT_SHIPPING_MODE,
  SHIPSTATION_SERVICE_ALLOWLIST_SET,
} from "@lib/constants/shipping"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "src/lib/utils"
import SectionCard from "../section-card"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

const Dot = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      "inline-block h-4 w-4 rounded-full border border-border",
      checked ? "border-primary bg-primary" : "bg-background"
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

function formatAddress(address?: HttpTypes.StoreCartAddress | null) {
  if (!address) {
    return ""
  }

  const parts = [
    address.address_1,
    address.address_2,
    address.postal_code && address.city
      ? `${address.postal_code} ${address.city}`
      : undefined,
    address.country_code ? address.country_code.toUpperCase() : undefined,
  ].filter(Boolean)

  return parts.join(", ")
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

  if (code && SHIPSTATION_SERVICE_ALLOWLIST_SET.has(code)) {
    return true
  }

  if (serviceCode && SHIPSTATION_SERVICE_ALLOWLIST_SET.has(serviceCode)) {
    return true
  }

  return false
}

const hasInsufficientInventory = (
  option?: HttpTypes.StoreCartShippingOption | null
) => Boolean((option as EnrichedShippingOption | undefined)?.insufficient_inventory)

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const currentCart = cart
  const isPickupOnlyMode = CHECKOUT_SHIPPING_MODE === "pickup_only"

  const enrichedShippingOptions = useMemo<EnrichedShippingOption[]>(() => {
    return (availableShippingMethods ?? []).map(
      (option) => option as EnrichedShippingOption
    )
  }, [availableShippingMethods])

  const pickupOptions = useMemo<EnrichedShippingOption[]>(() => {
    return (
      enrichedShippingOptions.filter(
        (option) => option.service_zone?.fulfillment_set?.type === "pickup"
      ) ?? []
    )
  }, [enrichedShippingOptions])

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
    if (isPickupOnlyMode) {
      return []
    }

    return (
      enrichedShippingOptions
        .filter(
          (option) => option.service_zone?.fulfillment_set?.type !== "pickup"
        )
        .filter((option) => isShipstationOptionAllowed(option))
        .sort((a, b) => prioritise(a) - prioritise(b)) ?? []
    )
  }, [enrichedShippingOptions, isPickupOnlyMode])

  const hasPickupOptions = pickupOptions.length > 0

  const totalWeightGrams = useMemo(() => {
    return (currentCart?.items ?? []).reduce((sum, item) => {
      const weight = Number((item as any)?.variant?.weight ?? (item as any)?.weight ?? 0)
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
      ? `${
          totalWeightPounds >= 10
            ? totalWeightPounds.toFixed(1)
            : totalWeightPounds.toFixed(2)
        } lb (${totalWeightKilograms.toFixed(2)} kg)`
      : "Not provided"

  const initialShippingMethodId =
    currentCart?.shipping_methods?.at(-1)?.shipping_option_id ?? ""
  const initialShippingAmount = currentCart?.shipping_methods?.at(-1)?.amount

  const initialPickupSelected = Boolean(
    pickupOptions.some((method) => method.id === initialShippingMethodId)
  )

  const [shippingMethodId, setShippingMethodId] = useState<string>(
    initialShippingMethodId
  )
  const [selectedShippingOptionId, setSelectedShippingOptionId] =
    useState<string>(initialPickupSelected ? "" : initialShippingMethodId)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >(() => {
    if (initialShippingMethodId && typeof initialShippingAmount === "number") {
      return { [initialShippingMethodId]: initialShippingAmount }
    }

    return {}
  })
  const [showPickupOptions, setShowPickupOptions] = useState<string>(
    isPickupOnlyMode || initialPickupSelected ? PICKUP_OPTION_ON : PICKUP_OPTION_OFF
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
    setShippingMethodId(initialShippingMethodId)

    if (isPickupOnlyMode) {
      setShowPickupOptions(PICKUP_OPTION_ON)
      setSelectedShippingOptionId("")
    } else {
      setSelectedShippingOptionId(
        initialPickupSelected ? "" : initialShippingMethodId
      )
      setShowPickupOptions(initialPickupSelected ? PICKUP_OPTION_ON : PICKUP_OPTION_OFF)
    }

    if (initialShippingMethodId && typeof initialShippingAmount === "number") {
      setCalculatedPricesMap({ [initialShippingMethodId]: initialShippingAmount })
    } else {
      setCalculatedPricesMap({})
    }
  }, [
    initialPickupSelected,
    initialShippingAmount,
    initialShippingMethodId,
    isOpen,
    isPickupOnlyMode,
  ])

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
    if (isPickupOnlyMode || showPickupOptions === PICKUP_OPTION_ON) {
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
  }, [isPickupOnlyMode, shippingOptions, selectedShippingOptionId, showPickupOptions])

  useEffect(() => {
    if (!hasCompleteShippingAddress) {
      setCalculatedPricesMap({})
    }
  }, [hasCompleteShippingAddress])

  const activeShippingMethodId =
    shippingMethodId || currentCart?.shipping_methods?.at(-1)?.shipping_option_id || ""

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    if (activeShippingMethodId) {
      router.push(pathname + "?step=payment", { scroll: false })
      return
    }

    if (isPickupOnlyMode && hasPickupOptions) {
      const firstPickup = pickupOptions.find(
        (option) => !hasInsufficientInventory(option)
      )

      if (firstPickup) {
        await handleSetPickupMethod(firstPickup.id)
        router.push(pathname + "?step=payment", { scroll: false })
        return
      }
    }

    setError("Select a delivery method before continuing to payment.")
  }

  const handleSelectShippingOption = (value: string) => {
    setSelectedShippingOptionId(value)
    setShowPickupOptions(PICKUP_OPTION_OFF)
    setError(null)
  }

  const handleCalculateShipping = async () => {
    if (isPickupOnlyMode) {
      return
    }

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
      setError("Enter your shipping address before calculating a delivery rate.")
      return
    }

    setIsProcessing(true)
    setIsCalculatingShipping(true)
    setError(null)
    setShowPickupOptions(PICKUP_OPTION_OFF)

    try {
      let amount: number | undefined =
        selectedOption.price_type === "flat"
          ? selectedOption.amount ?? undefined
          : calculatedPricesMap[selectedOption.id]

      if (
        selectedOption.price_type === "calculated" &&
        typeof calculatedPricesMap[selectedOption.id] !== "number"
      ) {
        const calculated = await calculatePriceForShippingOption(
          selectedOption.id,
          currentCart.id
        )

        if (!calculated || typeof calculated.amount !== "number") {
          throw new Error("ShipStation did not return a rate for this service.")
        }

        amount = calculated.amount
      }

      if (typeof amount !== "number") {
        throw new Error("Unable to determine a rate for this delivery service.")
      }

      await setShippingMethod({
        cartId: currentCart.id,
        shippingMethodId: selectedOption.id,
      })

      setCalculatedPricesMap((prev) => ({
        ...prev,
        [selectedOption.id]: amount as number,
      }))
      setShippingMethodId(selectedOption.id)
      router.refresh()
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

  const handleSetPickupMethod = useCallback(
    async (id: string) => {
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
      } catch (err: any) {
        setError(
          err?.message ||
            "Unable to select store pickup. Please try again or choose shipping."
        )
      } finally {
        setIsProcessing(false)
      }
    },
    [currentCart.id, hasCompleteShippingAddress, router]
  )

  useEffect(() => {
    if (
      !isOpen ||
      !isPickupOnlyMode ||
      !hasPickupOptions ||
      activeShippingMethodId ||
      isProcessing
    ) {
      return
    }

    const firstPickup = pickupOptions.find(
      (option) => !hasInsufficientInventory(option)
    )

    if (firstPickup) {
      void handleSetPickupMethod(firstPickup.id)
    }
  }, [
    activeShippingMethodId,
    hasPickupOptions,
    isOpen,
    isPickupOnlyMode,
    isProcessing,
    pickupOptions,
    handleSetPickupMethod,
  ])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  useEffect(() => {
    const prefetch = async () => {
      if (isPickupOnlyMode || !hasCompleteShippingAddress || !shippingOptions.length) {
        return
      }

      setIsPrefetchingRates(true)

      try {
        const entries = await Promise.all(
          shippingOptions.map(async (option) => {
            if (option.price_type === "flat" && typeof option.amount === "number") {
              return [option.id, option.amount] as const
            }

            if (option.price_type === "calculated") {
              const calculated = await calculatePriceForShippingOption(
                option.id,
                currentCart.id
              )
              return [
                option.id,
                typeof calculated?.amount === "number" ? calculated.amount : undefined,
              ] as const
            }

            return [option.id, undefined] as const
          })
        )

        const next: Record<string, number> = {}

        entries.forEach(([id, amount]) => {
          if (typeof amount === "number") {
            next[id] = amount
          }
        })

        if (Object.keys(next).length) {
          setCalculatedPricesMap((prev) => ({ ...prev, ...next }))
        }
      } catch {
        // no-op; user can still calculate manually
      } finally {
        setIsPrefetchingRates(false)
      }
    }

    void prefetch()
  }, [currentCart.id, hasCompleteShippingAddress, isPickupOnlyMode, shippingOptions])

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
    selectedShippingOptionId && selectedShippingOption
      ? typeof calculatedPricesMap[selectedShippingOptionId] === "number"
        ? calculatedPricesMap[selectedShippingOptionId]
        : selectedShippingOption.price_type === "flat" &&
            typeof selectedShippingOption.amount === "number"
          ? selectedShippingOption.amount
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

    const totalDisplay = convertToLocale({
      amount: selectedShippingPrice,
      currency_code: cart?.currency_code,
    })

    return `Calculated by ShipStation for ${
      totalWeightPounds >= 10
        ? totalWeightPounds.toFixed(1)
        : totalWeightPounds.toFixed(2)
    } lb — ${totalDisplay}.`
  }, [cart?.currency_code, selectedShippingOption, selectedShippingPrice, totalWeightPounds])

  const shippingRateDisplay =
    selectedShippingOption === null
      ? "-"
      : isCalculatingShipping || isPrefetchingRates
        ? <BrandSpinner className="text-muted-foreground" />
        : typeof selectedShippingPrice === "number"
          ? convertToLocale({
              amount: selectedShippingPrice,
              currency_code: cart?.currency_code,
            })
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
                How would you like your order delivered?
              </span>
            </div>

            <div data-testid="delivery-options-container">
              <div className="pb-8 md:pt-0 pt-2">
                <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Total package weight</p>
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
                          void handleSetPickupMethod(id)
                        }
                      } else if (!isPickupOnlyMode) {
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
                        <Dot checked={showPickupOptions === PICKUP_OPTION_ON} />
                        <span className="text-base font-medium text-foreground">
                          Pick up your order
                        </span>
                      </div>
                      <span className="justify-self-end text-foreground">-</span>
                    </Radio>
                  </RadioGroup>
                )}

                {isPickupOnlyMode && (
                  <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                    Pickup-only checkout is active while carrier shipping options are unavailable.
                  </div>
                )}

                {!isPickupOnlyMode && shippingOptions.length ? (
                  <div className="mt-4 rounded-2xl border border-border bg-card p-6">
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
                            const amount =
                              option.price_type === "flat" &&
                              typeof option.amount === "number"
                                ? option.amount
                                : typeof calculatedPricesMap[option.id] === "number"
                                  ? calculatedPricesMap[option.id]
                                  : undefined

                            const priceLabel =
                              typeof amount === "number"
                                ? convertToLocale({
                                    amount,
                                    currency_code: cart?.currency_code,
                                  })
                                : ""

                            return (
                              <SelectItem
                                key={option.id}
                                value={option.id}
                                disabled={hasInsufficientInventory(option)}
                              >
                                {priceLabel ? `${option.name} — ${priceLabel}` : option.name}
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
                          {isCalculatingShipping && <BrandSpinner className="mr-2" />}
                          Apply shipping rate
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!isPickupOnlyMode && !shippingOptions.length && !hasPickupOptions && (
                  <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                    No delivery services are available right now. Please verify your address or try again later.
                  </div>
                )}
              </div>
            </div>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && hasPickupOptions && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Store</span>
                <span className="mb-4 text-sm text-muted-foreground">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-8 md:pt-0 pt-2">
                  <RadioGroup
                    value={shippingMethodId || ""}
                    onChange={(value) => void handleSetPickupMethod(value)}
                  >
                    {pickupOptions.map((option) => (
                      <Radio
                        key={option.id}
                        value={option.id}
                        disabled={hasInsufficientInventory(option)}
                        data-testid="delivery-option-radio"
                        className={cn(
                          "mb-2 flex items-center justify-between rounded-2xl border border-border px-6 py-4 text-sm transition-all duration-200 bg-card hover:border-primary hover:bg-accent/5",
                          option.id === shippingMethodId && "border-primary bg-accent/10",
                          hasInsufficientInventory(option) && "cursor-not-allowed opacity-60"
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
                                option.service_zone?.fulfillment_set?.location?.address
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="justify-self-end text-foreground">
                          {convertToLocale({
                            amount: option.amount ?? 0,
                            currency_code: cart?.currency_code,
                          })}
                        </span>
                      </Radio>
                    ))}
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
              onClick={() => void handleSubmit()}
              disabled={(!activeShippingMethodId && !hasPickupOptions) || isProcessing}
              data-testid="submit-delivery-option-button"
            >
              {isProcessing && <BrandSpinner className="mr-2" />}
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
                  {convertToLocale({
                    amount: currentCart.shipping_methods?.at(-1)?.amount ?? 0,
                    currency_code: currentCart?.currency_code,
                  })}
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
