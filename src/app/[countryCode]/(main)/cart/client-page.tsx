"use client"

import CartTemplate from "@modules/cart/templates"
import EmptyCartMessage from "@modules/cart/components/empty-cart-message"
import SignInPrompt from "@modules/cart/components/sign-in-prompt"
import Divider from "@modules/common/components/divider"

type ClientCartPageProps = {
  initialCart: any
  initialCustomer: any
}

export default function ClientCartPage({
  initialCart,
  initialCustomer,
}: ClientCartPageProps) {
  const cart = initialCart ?? null
  const customer = initialCustomer ?? null

  if (!cart || (cart.items?.length ?? 0) === 0) {
    return (
      <div className="py-12">
        <div className="content-container" data-testid="cart-container">
          {!customer && (
            <div className="bg-white py-6 gap-y-6">
              <SignInPrompt />
              <Divider />
            </div>
          )}
          <EmptyCartMessage />
        </div>
      </div>
    )
  }

  return <CartTemplate cart={cart} customer={customer} />
}
