"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z, ZodError } from "zod"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  getSalesRepCode,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { attachSalesRep } from "./sales-people"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const repCode = await getSalesRepCode()
  const hasRep = cart?.metadata?.sales_person_id || cart?.metadata?.sales_person_code
  if (repCode && !hasRep) {
    await attachSalesRep({ cartId: cart.id, repCode })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .catch(medusaError)

  const updatedCart = await sdk.store.cart
    .retrieve(cartId, {}, headers)
    .then((response) => response.cart)
    .catch(() => null)

  if (!updatedCart || (updatedCart.items?.length ?? 0) === 0) {
    await clearCart()
    return
  }

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  const fulfillmentCacheTag = await getCacheTag("fulfillment")
  revalidateTag(fulfillmentCacheTag)
}

export async function clearCart() {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when clearing cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client
    .fetch<{ cart: HttpTypes.StoreCart }>(
      `/store/carts/${cartId}/reset`,
      {
        method: "POST",
        headers,
      }
    )
    .catch(medusaError)

  const newCart = response?.cart

  if (newCart?.id) {
    await setCartId(newCart.id)
  } else {
    await removeCartId()
  }

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  const fulfillmentCacheTag = await getCacheTag("fulfillment")
  revalidateTag(fulfillmentCacheTag)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

const PHONE_REGEX = /^[0-9+()\-.\s]+$/

export type SetAddressesActionState =
  | { status: "idle" }
  | { status: "success"; countryCode: string }
  | { status: "error"; message: string }

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
      .min(7, "Phone number must be at least 7 characters long")
      .regex(PHONE_REGEX, "Enter a valid phone number")
      .refine((val) => /\d/.test(val), "Enter a valid phone number"),
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

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(
  currentState: SetAddressesActionState,
  formData: FormData
): Promise<SetAddressesActionState> {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

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

    return {
      status: "success",
      countryCode: parsed.shipping_address.country_code,
    }
  } catch (e: any) {
    if (e instanceof ZodError) {
      const message = e.issues?.[0]?.message ?? "Please review your address."
      return {
        status: "error",
        message,
      }
    }
    return {
      status: "error",
      message: e.message ?? "Unable to save address.",
    }
  }
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
