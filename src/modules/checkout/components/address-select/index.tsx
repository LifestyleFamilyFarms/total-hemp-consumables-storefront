import { Listbox, Transition } from "@headlessui/react"
import { ChevronsUpDown } from "lucide-react"
import { Fragment, useMemo } from "react"

import Radio from "@modules/common/components/radio"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { cn } from "src/lib/utils"

type AddressSelectProps = {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: HttpTypes.StoreCartAddress | null
  onSelect: (
    address: HttpTypes.StoreCartAddress | undefined,
    email?: string
  ) => void
}

const AddressSelect = ({
  addresses,
  addressInput,
  onSelect,
}: AddressSelectProps) => {
  const handleSelect = (id: string) => {
    const savedAddress = addresses.find((a) => a.id === id)
    if (savedAddress) {
      onSelect(savedAddress as HttpTypes.StoreCartAddress)
    }
  }

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => compareAddresses(a, addressInput))
  }, [addresses, addressInput])

  return (
    <Listbox onChange={handleSelect} value={selectedAddress?.id}>
      <div className="relative">
        <Listbox.Button
          className="relative flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          data-testid="shipping-address-select"
        >
          {({ open }) => (
            <>
              <span className="block truncate">
                {selectedAddress
                  ? selectedAddress.address_1
                  : "Choose an address"}
              </span>
              <ChevronsUpDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className="absolute z-20 max-h-60 w-full overflow-auto border border-border border-t-0 bg-white text-sm shadow-md focus:outline-none"
            data-testid="shipping-address-options"
          >
            {addresses.map((address) => {
              return (
                <Listbox.Option
                  key={address.id}
                  value={address.id}
                  className="relative flex cursor-pointer select-none items-start gap-4 px-4 py-4 hover:bg-muted"
                  data-testid="shipping-address-option"
                >
                  <div className="flex items-start gap-x-4">
                    <Radio
                      checked={selectedAddress?.id === address.id}
                      data-testid="shipping-address-radio"
                    />
                    <div className="flex flex-col">
                      <span className="text-left text-sm font-semibold text-foreground">
                        {address.first_name} {address.last_name}
                      </span>
                      {address.company && (
                        <span className="text-sm text-muted-foreground">
                          {address.company}
                        </span>
                      )}
                      <div className="mt-2 flex flex-col text-left text-sm text-muted-foreground">
                        <span className="text-foreground">
                          {address.address_1}
                          {address.address_2 && (
                            <span>, {address.address_2}</span>
                          )}
                        </span>
                        <span className="text-foreground">
                          {address.postal_code}, {address.city}
                        </span>
                        <span className="text-foreground">
                          {address.province && `${address.province}, `}
                          {address.country_code?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Listbox.Option>
              )
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default AddressSelect
