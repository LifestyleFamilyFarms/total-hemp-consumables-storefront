"use client"

import { useEffect, useRef } from "react"
import Input from "@modules/common/components/input"

type AddressSuggestion = {
  address1?: string
  city?: string
  province?: string
  postalCode?: string
  countryCode?: string
}

type AddressAutocompleteInputProps = {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddressSelected: (suggestion: AddressSuggestion) => void
  required?: boolean
  autoComplete?: string
  dataTestId?: string
}

export default function AddressAutocompleteInput({
  name,
  value,
  onChange,
  onAddressSelected,
  required,
  autoComplete = "address-line1",
  dataTestId,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
      return
    }

    const init = () => {
      const googleObj = (window as any)?.google

      if (!googleObj?.maps?.places?.Autocomplete || !inputRef.current) {
        return false
      }

      const autocomplete = new googleObj.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["address_components", "formatted_address"],
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        const components = place?.address_components ?? []

        const findComponent = (type: string, key: "long_name" | "short_name" = "long_name") =>
          components.find((component: any) => component.types?.includes(type))?.[key]

        const streetNumber = findComponent("street_number")
        const route = findComponent("route")
        const address1 = [streetNumber, route].filter(Boolean).join(" ").trim()

        const city =
          findComponent("locality") ||
          findComponent("postal_town") ||
          findComponent("administrative_area_level_2")

        const suggestion: AddressSuggestion = {
          address1: address1 || undefined,
          city: city || undefined,
          province: findComponent("administrative_area_level_1", "short_name") || undefined,
          postalCode: findComponent("postal_code") || undefined,
          countryCode: findComponent("country", "short_name")?.toLowerCase() || undefined,
        }

        onAddressSelected(suggestion)
      })

      initializedRef.current = true
      return true
    }

    if (init()) {
      return
    }

    const interval = window.setInterval(() => {
      if (init()) {
        window.clearInterval(interval)
      }
    }, 250)

    return () => {
      window.clearInterval(interval)
    }
  }, [onAddressSelected])

  return (
    <Input
      ref={inputRef}
      label="Address"
      name={name}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      required={required}
      data-testid={dataTestId}
    />
  )
}
