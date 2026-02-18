"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { ShoppingCart } from "lucide-react"
import {
  selectIsCartDrawerOpen,
  selectSetCartDrawerOpen,
  useStorefrontState,
} from "@lib/state"
import LineItemOptions from "@modules/common/components/line-item-options"

type CartDrawerProps = {
  countryCode: string
  cart: HttpTypes.StoreCart | null
  className?: string
  compact?: boolean
  compactOnMobile?: boolean
  isAuthenticated?: boolean
}

const lineItemTotal = (
  item: HttpTypes.StoreCartLineItem,
  currencyCode: string
) => {
  const total =
    typeof item.total === "number"
      ? item.total
      : typeof item.unit_price === "number"
        ? item.unit_price * item.quantity
        : 0

  return convertToLocale({
    amount: total,
    currency_code: currencyCode,
  })
}

export default function CartDrawer({
  countryCode,
  cart,
  className,
  compact = false,
  compactOnMobile = false,
  isAuthenticated = false,
}: CartDrawerProps) {
  const isOpen = useStorefrontState(selectIsCartDrawerOpen)
  const setCartDrawerOpen = useStorefrontState(selectSetCartDrawerOpen)

  const items = cart?.items ?? []
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  const subtotal = cart?.subtotal ?? 0
  const currencyCode = cart?.currency_code ?? "usd"

  return (
    <Sheet open={isOpen} onOpenChange={setCartDrawerOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={className}
          aria-label={`Shopping cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {compactOnMobile ? (
            <>
              <span className="min-w-[1.2rem] text-center text-xs font-bold lg:hidden">
                {itemCount}
              </span>
              <span className="hidden lg:inline">Cart ({itemCount})</span>
            </>
          ) : compact ? (
            <span className="min-w-[1.2rem] text-center text-xs font-bold">{itemCount}</span>
          ) : (
            <span>Cart ({itemCount})</span>
          )}
          <span className="sr-only" aria-live="polite">
            Cart contains {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md p-0">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            {itemCount > 0
              ? `${itemCount} item${itemCount > 1 ? "s" : ""} ready`
              : "Your cart is currently empty."}
          </SheetDescription>
        </SheetHeader>

        <Separator className="mt-4" />

        {items.length > 0 ? (
          <>
            <ScrollArea className="h-[calc(100vh-290px)] px-6">
              <div className="grid gap-4 py-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-border/70 p-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/${countryCode}/products/${item.product_handle ?? ""}`}
                        onClick={() => setCartDrawerOpen(false)}
                        className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
                      >
                        {item.product_title ?? item.title}
                      </Link>
                      {item.variant?.title ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <LineItemOptions variant={item.variant} />
                        </div>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {lineItemTotal(item, currencyCode)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />
            <div className="space-y-4 px-6 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
                </span>
              </div>
              {!isAuthenticated ? (
                <div className="rounded-xl border border-border/60 bg-muted/25 p-3 lg:hidden">
                  <p className="text-sm font-semibold text-foreground">
                    Save your cart and speed up checkout.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sign in or create an account. You can still check out as a guest.
                  </p>
                  <Button asChild variant="secondary" className="mt-3 w-full">
                    <Link
                      href={`/${countryCode}/account`}
                      onClick={() => setCartDrawerOpen(false)}
                    >
                      Sign in / Create account
                    </Link>
                  </Button>
                </div>
              ) : null}
              <div className="grid gap-2">
                <Button asChild className="w-full">
                  <Link
                    href={`/${countryCode}/cart`}
                    onClick={() => setCartDrawerOpen(false)}
                  >
                    Go to cart
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={`/${countryCode}/checkout?step=address`}
                    onClick={() => setCartDrawerOpen(false)}
                  >
                    Checkout
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-12">
            <p className="text-sm text-muted-foreground">
              Add products from any product page to start checkout.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href={`/${countryCode}/store`} onClick={() => setCartDrawerOpen(false)}>
                Explore products
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
