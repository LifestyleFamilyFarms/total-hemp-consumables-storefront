import type { StateCreator } from "zustand"
import type { StorefrontState } from "../store"

export type CheckoutDraft = {
  email: string
  phone: string
  marketingOptIn: boolean
  notes: string
}

export type CheckoutDraftSlice = {
  checkoutDraft: CheckoutDraft
  setCheckoutDraftField: <K extends keyof CheckoutDraft>(
    key: K,
    value: CheckoutDraft[K]
  ) => void
  patchCheckoutDraft: (patch: Partial<CheckoutDraft>) => void
  resetCheckoutDraft: () => void
}

const initialCheckoutDraft: CheckoutDraft = {
  email: "",
  phone: "",
  marketingOptIn: false,
  notes: "",
}

export const createCheckoutDraftSlice: StateCreator<
  StorefrontState,
  [],
  [],
  CheckoutDraftSlice
> = (set) => ({
  checkoutDraft: initialCheckoutDraft,
  setCheckoutDraftField: (key, value) =>
    set((state) => ({
      checkoutDraft: {
        ...state.checkoutDraft,
        [key]: value,
      },
    })),
  patchCheckoutDraft: (patch) =>
    set((state) => ({
      checkoutDraft: {
        ...state.checkoutDraft,
        ...patch,
      },
    })),
  resetCheckoutDraft: () => set({ checkoutDraft: initialCheckoutDraft }),
})
