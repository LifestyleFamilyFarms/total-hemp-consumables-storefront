import { Radio as RadioGroupOption } from "@headlessui/react"
import React, { type JSX } from "react"

import Radio from "@modules/common/components/radio"

// Authorize.Net provider
import { AuthorizeNetProvider, Card } from "authorizenet-react"
import { cn } from "src/lib/utils"

const ACCEPTED_CARD_BRANDS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Discover",
]

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={cn(
        "flex flex-col gap-2 text-sm cursor-pointer rounded-2xl border border-border px-6 py-4 mb-3 transition-all duration-200 bg-card hover:border-primary hover:bg-accent/5",
        selectedPaymentOptionId === paymentProviderId &&
          "border-primary/50 bg-primary/10",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <span className="text-base font-medium text-foreground">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </span>
        </div>
        <span className="justify-self-end text-foreground">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const AuthorizeNetCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string | null) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const apiLoginId = process.env.NEXT_PUBLIC_API_LOGIN_ID ?? ""
  const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY ?? ""
  const environment =
    process.env.NEXT_PUBLIC_AUTHNET_ENV === "production"
      ? "production"
      : "sandbox"

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId && (
        <AuthorizeNetProvider
          apiLoginId={apiLoginId}
          clientKey={clientKey}
          environment={environment}
        >
          <div className="my-4 transition-all duration-150 ease-in-out">
            <p className="mb-1 text-sm font-medium text-foreground">
              Enter your card details:
            </p>
            <Card
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
          onChange={(e: any) => {
            setCardComplete(e.complete)
            setError(e.error?.message || null)
            setCardBrand(e.cardType || null)
          }}
        />
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">We accept</span>
              {ACCEPTED_CARD_BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-border bg-accent/10 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {brand}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Card details are securely tokenized by Authorize.Net before we submit payment.
            </p>
          </div>
        </AuthorizeNetProvider>
      )}
    </PaymentContainer>
  )
}
