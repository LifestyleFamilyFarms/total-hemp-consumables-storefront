"use client"

import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import SectionCard from "../section-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { z, ZodError } from "zod"
import { updateCart } from "@lib/data/cart"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const currentCart = cart
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const queryStep = searchParams.get("step")
  const hasShippingAddress =
    !!currentCart?.shipping_address?.first_name &&
    !!currentCart?.shipping_address?.address_1 &&
    !!currentCart?.shipping_address?.postal_code
  const isOpen = queryStep === "address" || !hasShippingAddress

  const [sameAsBilling, setSameAsBilling] = useState(() => {
    if (currentCart?.shipping_address && currentCart?.billing_address) {
      return compareAddresses(currentCart.shipping_address, currentCart.billing_address)
    }
    return true
  })

  useEffect(() => {
    if (currentCart?.shipping_address && currentCart?.billing_address) {
      setSameAsBilling(
        compareAddresses(currentCart.shipping_address, currentCart.billing_address)
      )
    }
  }, [currentCart?.billing_address, currentCart?.shipping_address])

  const toggleSameAsBilling = () => {
    setSameAsBilling((prev) => !prev)
  }

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [addressError, setAddressError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const normalizePhone = (val: string) => val.replace(/\D+/g, "")

  const addressSchema = z
    .object({
      first_name: z.string().trim().min(1, "First name is required"),
      last_name: z.string().trim().min(1, "Last name is required"),
      address_1: z.string().trim().min(1, "Address is required"),
      address_2: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val ? val : undefined)),
      company: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val ? val : undefined)),
      postal_code: z.string().trim().min(1, "Postal code is required"),
      city: z.string().trim().min(1, "City is required"),
      country_code: z.string().trim().min(2, "Country is required"),
      province: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val ? val : undefined)),
      phone: z
        .string()
        .trim()
        .transform((val) => normalizePhone(val))
        .refine(
          (val) => /^\d{10}$/.test(val),
          "Phone number must be 10 digits (area code + number)"
        ),
    })
    .superRefine((value, ctx) => {
      if (value.country_code.toLowerCase() === "us" && !value.province) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["province"],
          message: "State is required for United States addresses",
        })
      }
    })
    .transform((value) => ({
      ...value,
      country_code: value.country_code.toLowerCase(),
    }))

  const addressFormSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    shipping_address: addressSchema,
    billing_address: addressSchema,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAddressError(null)
    setSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const getField = (key: string) => {
        const value = formData.get(key)
        if (typeof value === "string") {
          return value.trim()
        }
        return value ? String(value).trim() : ""
      }

      const buildAddress = (prefix: string) => ({
        first_name: getField(`${prefix}.first_name`),
        last_name: getField(`${prefix}.last_name`),
        address_1: getField(`${prefix}.address_1`),
        address_2: "",
        company: getField(`${prefix}.company`),
        postal_code: getField(`${prefix}.postal_code`),
        city: getField(`${prefix}.city`),
        country_code: getField(`${prefix}.country_code`),
        province: getField(`${prefix}.province`),
        phone: getField(`${prefix}.phone`),
      })

      const shippingInput = buildAddress("shipping_address")
      const sameAsBilling = formData.get("same_as_billing")
      const billingInput =
        sameAsBilling === "on"
          ? { ...shippingInput }
          : buildAddress("billing_address")

      const parsed = addressFormSchema.parse({
        email: getField("email"),
        shipping_address: shippingInput,
        billing_address: billingInput,
      })

      await updateCart(parsed)
      router.refresh()

      router.push(`${pathname}?step=delivery`, { scroll: false })
    } catch (e: any) {
      if (e instanceof ZodError) {
        const message = e.issues?.[0]?.message ?? "Please review your address."
        setAddressError(message)
      } else {
        setAddressError(e?.message ?? "Unable to save address.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="Address"
      description="Enter your contact and delivery details."
      rightAction={
        !isOpen && cart?.shipping_address ? (
          <button
            onClick={handleEdit}
            className="text-sm font-medium text-primary hover:text-primary/80"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        ) : null
      }
    >
      {isOpen ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-10">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={currentCart}
            />

            {!sameAsBilling && (
              <BillingAddress cart={currentCart} />
            )}
            <Button
              type="submit"
              className="w-full md:w-auto h-11 px-6 text-sm font-medium"
              data-testid="submit-address-button"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to delivery
            </Button>
            <ErrorMessage
              error={addressError}
              data-testid="address-error-message"
            />
          </div>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground">
          {currentCart && currentCart.shipping_address ? (
            <div className="flex flex-wrap gap-3">
              <div
                className="flex flex-col gap-0.5"
                data-testid="shipping-address-summary"
              >
                <span className="text-foreground font-medium">Shipping</span>
                <span>
                  {currentCart.shipping_address.first_name}{" "}
                  {currentCart.shipping_address.last_name}
                </span>
                <span>
                  {currentCart.shipping_address.address_1}
                  {currentCart.shipping_address.address_2
                    ? `, ${currentCart.shipping_address.address_2}`
                    : ""}
                </span>
                <span>
                  {currentCart.shipping_address.city},{" "}
                  {currentCart.shipping_address.postal_code}
                </span>
                <span>
                  {currentCart.shipping_address.country_code?.toUpperCase()}
                </span>
              </div>
              <div
                className="flex flex-col gap-0.5"
                data-testid="shipping-contact-summary"
              >
                <span className="text-foreground font-medium">Contact</span>
                <span>{currentCart.shipping_address.phone}</span>
                <span>{currentCart.email}</span>
              </div>
              <div
                className="flex flex-col gap-0.5"
                data-testid="billing-address-summary"
              >
                <span className="text-foreground font-medium">Billing</span>
                {sameAsBilling ? (
                  <span>Same as shipping.</span>
                ) : (
                  <span>
                    {currentCart.billing_address?.city},{" "}
                    {currentCart.billing_address?.postal_code}{" "}
                    {currentCart.billing_address?.country_code?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ) : currentCart ? (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>No shipping address on file yet.</span>
              <button
                onClick={handleEdit}
                className="w-fit text-sm font-medium text-primary hover:text-primary/80"
              >
                Add shipping address
              </button>
            </div>
          ) : (
            <Spinner />
          )}
        </div>
      )}
    </SectionCard>
  )
}

export default Addresses
