import { NextResponse } from "next/server"

import { retrieveCart } from "@lib/data/cart"

export async function GET() {
  try {
    const cart = await retrieveCart()

    if (!cart) {
      return NextResponse.json({ cart: null })
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        subtotal: cart.subtotal ?? 0,
        currency_code: cart.currency_code,
        items:
          cart.items?.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            thumbnail: item.thumbnail || item.variant?.product?.thumbnail || null,
            product_handle: item.product_handle,
            line_total: item.total ?? 0,
          })) ?? [],
      },
    })
  } catch (error) {
    console.error("Cart preview error", error)
    return NextResponse.json({ cart: null }, { status: 500 })
  }
}
