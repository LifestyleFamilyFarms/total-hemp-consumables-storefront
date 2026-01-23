import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { Metadata } from "next"
import ClientCartPage from "./client-page"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart().catch(() => null)
  const customer = await retrieveCustomer()

  return <ClientCartPage initialCart={cart} initialCustomer={customer} />
}
