"use client"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

type CartContextValue = {
  cart: HttpTypes.StoreCart | null
  loading: boolean
  refresh: () => Promise<void>
  clearShippingMethods: () => Promise<void>
  addItem: (
    variantId: string,
    quantity?: number,
    metadata?: Record<string, unknown>
  ) => Promise<void>
  addShippingMethod: (
    optionId: string,
    data?: Record<string, unknown>
  ) => Promise<void>
  initiatePaymentSession: (
    cart: HttpTypes.StoreCart,
    data: HttpTypes.StoreInitializePaymentSession
  ) => Promise<void>
  completeCart: (cartId: string) => Promise<HttpTypes.StoreCompleteCartResponse>
  updateCart: (body: HttpTypes.StoreUpdateCart) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  applyPromotions: (codes: string[]) => Promise<void>
  clear: () => Promise<void>
  setRegion: (regionId: string) => Promise<void>
  attachCustomer: (customerId: string, email?: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = "medusa_cart_id"
const CART_FIELDS =
  "*items,*region,*items.product,*items.variant,*items.thumbnail,*items.metadata,+items.total,*promotions,+shipping_methods.name"

const readCartIdFromCookies = () => {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("_medusa_cart_id="))
  if (!match) return null
  return decodeURIComponent(match.split("=")[1] ?? "")
}

const getStoredCartId = () => {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(CART_STORAGE_KEY)
  if (stored) return stored
  return readCartIdFromCookies()
}

const setStoredCartId = (id: string) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CART_STORAGE_KEY, id)
  // Also set the Medusa cart cookie so SSR/server helpers can pick it up.
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `_medusa_cart_id=${encodeURIComponent(id)}; Path=/; Expires=${expires}; SameSite=Lax`
}

const clearStoredCartId = () => {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(CART_STORAGE_KEY)
  document.cookie =
    "_medusa_cart_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
}

type CartProviderProps = PropsWithChildren & {
  regionId?: string
  salesChannelId?: string
}

export const CartProvider = ({
  children,
  regionId,
  salesChannelId,
}: CartProviderProps) => {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCart = useCallback(async (cartId: string) => {
    return sdk.store.cart
      .retrieve(cartId, { fields: CART_FIELDS })
      .then((res) => res.cart)
  }, [])

  const fetchOrCreateCart = useCallback(async () => {
    let nextCart: HttpTypes.StoreCart | null = null
    let cartId = getStoredCartId()
    // Ensure the cart cookie is set when we already have an ID in storage.
    if (cartId) {
      setStoredCartId(cartId)
    }

    if (cartId) {
      nextCart = await loadCart(cartId)
        .catch(() => null)
      if (nextCart && !getStoredCartId()) {
        setStoredCartId(cartId)
      }
    }

    if (!nextCart) {
      const created = await sdk.store.cart.create({
        ...(regionId ? { region_id: regionId } : {}),
        ...(salesChannelId ? { sales_channel_id: salesChannelId } : {}),
      })
      const full = await loadCart(created.cart.id)
      cartId = created.cart.id
      setStoredCartId(cartId)
      nextCart = full
    }

    setCart(nextCart)
  }, [loadCart, regionId, salesChannelId])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      setLoading(true)
      try {
        await fetchOrCreateCart()
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void init()
    return () => {
      mounted = false
    }
  }, [fetchOrCreateCart])

  const refresh = useCallback(async () => {
    const cartId = getStoredCartId()
    if (!cartId) {
      await fetchOrCreateCart()
      return
    }
    const refreshed = await loadCart(cartId)
      .catch(() => null)
    if (refreshed) {
      setCart(refreshed)
    } else {
      await fetchOrCreateCart()
    }
  }, [fetchOrCreateCart, loadCart])

  const clearShippingMethods = useCallback(async () => {
    const cartId = getStoredCartId()
    if (!cartId) return
    // Reset clears shipping methods server-side; ignore failures and still reload.
    try {
      await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
        `/store/carts/${cartId}/reset`,
        { method: "POST" }
      )
    } catch {
      // ignore
    }
    const updated = await loadCart(cartId).catch(() => null)
    if (updated) {
      setCart(updated)
    } else {
      await fetchOrCreateCart()
    }
  }, [fetchOrCreateCart, loadCart])

  const addItem = useCallback(
    async (variantId: string, quantity = 1, metadata?: Record<string, unknown>) => {
      if (!variantId) return
      await fetchOrCreateCart()
      const cartId = getStoredCartId()
      if (!cartId) return
      // When items change, clear shipping so stale rates can’t linger.
      await clearShippingMethods().catch(() => {})
      await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
        metadata,
      })
      const updated = await loadCart(cartId)
      setCart(updated)
    },
    [clearShippingMethods, fetchOrCreateCart, loadCart]
  )

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!lineId || Number.isNaN(quantity)) return
      const cartId = getStoredCartId()
      if (!cartId) return
      await clearShippingMethods().catch(() => {})
      await sdk.store.cart.updateLineItem(cartId, lineId, { quantity })
      const updated = await loadCart(cartId)
      setCart(updated)
    },
    [clearShippingMethods, loadCart]
  )

  const addShippingMethod = useCallback(
    async (optionId: string, data?: Record<string, unknown>) => {
      const cartId = getStoredCartId()
      if (!cartId || !optionId) return
      await sdk.store.cart.addShippingMethod(cartId, {
        option_id: optionId,
        data: data || {},
      })
      const updated = await loadCart(cartId)
      setCart(updated)
    },
    [loadCart]
  )

  const initiatePaymentSession = useCallback(
    async (
      cart: HttpTypes.StoreCart,
      data: HttpTypes.StoreInitializePaymentSession
    ) => {
      if (!cart?.id) return
      await sdk.store.payment.initiatePaymentSession(cart, data)
      await refresh()
    },
    [refresh]
  )

  const completeCart = useCallback(
    async (cartId: string) => {
      if (!cartId) {
        throw new Error("No cart id found when completing order")
      }
      const result = await sdk.store.cart.complete(cartId)
      await refresh()
      return result
    },
    [refresh]
  )

  const updateCart = useCallback(
    async (body: HttpTypes.StoreUpdateCart) => {
      const cartId = getStoredCartId()
      if (!cartId) return
      await sdk.store.cart.update(cartId, body)
      const updated = await loadCart(cartId)
      setCart(updated)
    },
    [loadCart]
  )

  const removeItem = useCallback(async (lineId: string) => {
    if (!lineId) return
    const cartId = getStoredCartId()
    if (!cartId) return
    await clearShippingMethods().catch(() => {})
    await sdk.store.cart.deleteLineItem(cartId, lineId)
    const updated = await loadCart(cartId).catch(() => null)
    if (updated) {
      setCart(updated)
    } else {
      await fetchOrCreateCart()
    }
  }, [clearShippingMethods, fetchOrCreateCart, loadCart])

  const applyPromotions = useCallback(
    async (codes: string[]) => {
      const cartId = getStoredCartId()
      if (!cartId) return
      await sdk.store.cart.update(cartId, { promo_codes: codes })
      const updated = await loadCart(cartId)
      setCart(updated)
    },
    [loadCart]
  )

  const clear = useCallback(async () => {
    clearStoredCartId()
    await fetchOrCreateCart()
  }, [fetchOrCreateCart])

  const setRegion = useCallback(
    async (nextRegionId: string) => {
      const cartId = getStoredCartId()
      if (!cartId || !nextRegionId) return
      const updated = await sdk.store.cart
        .update(cartId, { region_id: nextRegionId }, { fields: CART_FIELDS })
        .then((res) => res.cart)
      setCart(updated)
    },
    []
  )

  const attachCustomer = useCallback(
    async (customerId: string, email?: string) => {
      const cartId = getStoredCartId()
      if (!cartId || !customerId) return
      // transferCart requires the user to be authenticated; it returns the updated cart.
      const transferred = await sdk.store.cart
        .transferCart(cartId, { fields: CART_FIELDS })
        .then((res) => res.cart)
        .catch(() => null)

      if (email && cartId) {
        const withEmail = await sdk.store.cart
          .update(cartId, { email }, { fields: CART_FIELDS })
          .then((res) => res.cart)
        setCart(withEmail)
        return
      }

      if (transferred) {
        setCart(transferred)
      }
    },
    []
  )

  const value: CartContextValue = {
    cart,
    loading,
    refresh,
    clearShippingMethods,
    addItem,
    updateItem,
    addShippingMethod,
    initiatePaymentSession,
    completeCart,
    updateCart,
    removeItem,
    applyPromotions,
    clear,
    setRegion,
    attachCustomer,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return ctx
}
