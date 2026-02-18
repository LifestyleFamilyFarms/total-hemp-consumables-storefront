"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { CreditCard, ShoppingCart, X } from "lucide-react"

import { NAV_ITEMS } from "@/components/layout/nav-data"
import { convertToLocale } from "@lib/util/money"
import { cn } from "@lib/utils"

const QUICK_ORDER = ["Flower", "Edibles", "Prerolls", "Vapes"] as const

type CartPreviewItem = {
  id: string
  title: string
  quantity: number
  thumbnail: string | null
  product_handle?: string | null
  line_total: number
}

type CartPreview = {
  id: string
  subtotal: number
  currency_code: string
  items: CartPreviewItem[]
}

export default function MobileThumbBar({ countryCode }: { countryCode: string }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [cart, setCart] = React.useState<CartPreview | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const cartHref = `/${countryCode}/cart`
  const checkoutHref = `/${countryCode}/checkout`
  const shopHref = `/${countryCode}/store`

  const fetchCartPreview = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/cart/preview", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("Unable to load cart preview")
      }
      const data = (await res.json()) as { cart: CartPreview | null }
      setCart(data.cart)
    } catch (error) {
      console.error(error)
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCartPreview()
  }, [fetchCartPreview])

  React.useEffect(() => {
    if (isOpen) {
      fetchCartPreview()
    }
  }, [isOpen, fetchCartPreview])

  const quickItems = React.useMemo(
    () =>
      QUICK_ORDER.map((label) => NAV_ITEMS.find((item) => item.label === label && item.icon)).filter(
        Boolean
      ) as Array<(typeof NAV_ITEMS)[number]>,
    []
  )

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  const hasItems = itemCount > 0
  const subtotalLabel =
    cart && typeof cart.subtotal === "number"
      ? convertToLocale({ amount: cart.subtotal, currency_code: cart.currency_code })
      : null

  const toggleDock = () => setIsOpen((prev) => !prev)

  const QuickGrid = ({ layout }: { layout: "mobile" | "desktop" }) => (
    <div className={cn("grid gap-2", layout === "mobile" ? "grid-cols-4" : "grid-cols-3")}>
      {quickItems.map((item) => (
        <Link
          key={item.label}
          href={item.href ? item.href(countryCode) : shopHref}
          className={cn(
            "group relative flex flex-col items-start gap-1 rounded-2xl border border-white/10 bg-background/80 p-2 text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/70 shadow-[0_12px_24px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5"
          )}
        >
          <span className="text-foreground">{item.label}</span>
          <span className="text-[10px] font-normal uppercase tracking-[0.3em] text-foreground/50">Shop</span>
          <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5 opacity-0 transition group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  )

  const Panel = (
    <div className="fixed left-4 right-4 bottom-[5.5rem] z-50 w-auto rounded-[32px] border border-white/10 bg-background/95 p-5 shadow-[0_45px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70 md:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-foreground/60">Cart snapshot</p>
          <p className="text-sm text-foreground/70">
            {hasItems ? `${itemCount} item${itemCount > 1 ? "s" : ""} ready` : "Cart is empty"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDock}
          aria-label="Collapse cart menu"
          className="rounded-full border border-white/15 bg-background/70 p-1 text-foreground/70 transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="rounded-2xl border border-border/40 bg-background/70 p-3 text-sm text-foreground/60">Loading cart…</p>
        ) : hasItems ? (
          <>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart?.items.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={
                    item.product_handle ? `/${countryCode}/products/${item.product_handle}` : cartHref
                  }
                  className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/80 p-2 text-left"
                >
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-background/60 text-xs text-foreground/60">
                      No art
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-foreground/60">Qty {item.quantity}</p>
                  </div>
                </Link>
              ))}
            </div>
            {cart && cart.items.length > 3 ? (
              <p className="text-xs text-foreground/60">+{cart.items.length - 3} more items in cart</p>
            ) : null}
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/40 bg-background/70 p-3 text-sm text-foreground/60">
            Cart is empty. Add from the quick lanes below.
          </p>
        )}
      </div>

      {subtotalLabel ? (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/40 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Subtotal</span>
          <span>{subtotalLabel}</span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={cartHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground"
        >
          <ShoppingCart className="h-4 w-4" />
          View cart
        </Link>
        <Link
          href={checkoutHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary"
        >
          <CreditCard className="h-4 w-4" />
          Checkout
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">Quick shop</p>
        <QuickGrid layout="mobile" />
      </div>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={toggleDock}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse cart menu" : "Open cart menu"}
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_22px_40px_rgba(15,23,42,0.28)] backdrop-blur-2xl transition hover:-translate-y-0.5 md:hidden"
        style={{
          bottom: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>{isOpen ? "Close" : "Cart"}</span>
        <span className="inline-flex min-w-[1.5rem] justify-center rounded-full border border-white/10 bg-primary/90 px-2 text-xs text-primary-foreground">
          {itemCount}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close cart menu overlay"
            onClick={toggleDock}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
          {Panel}
        </>
      ) : null}
    </>
  )
}
