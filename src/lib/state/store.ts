"use client"

import { create } from "zustand"
import { createCheckoutDraftSlice, type CheckoutDraftSlice } from "./slices/checkout-draft-slice"
import { createUiSlice, type UiSlice } from "./slices/ui-slice"

export type StorefrontState = UiSlice & CheckoutDraftSlice

export const useStorefrontState = create<StorefrontState>()((...args) => ({
  ...createUiSlice(...args),
  ...createCheckoutDraftSlice(...args),
}))
