import React from "react"
import { CreditCard as CreditCardIcon } from "lucide-react"

/* Map of payment provider_id to their title and icon. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  "pp_authorizenet_authorizenet": {
    title: "Credit Card",
    icon: <CreditCardIcon className="h-4 w-4" />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCardIcon className="h-4 w-4" />, // fallback icon
  },
}

export const isAuthorizeNet = (providerId?: string) => {
  return providerId?.startsWith("pp_authorizenet")
}

export const PAYMENT_METHOD_INFO: Record<string, { title: string }> = {
  "pp_authorizenet_authorizenet": { title: "Credit Card" },
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
