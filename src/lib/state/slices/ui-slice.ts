import type { StateCreator } from "zustand"
import type { StorefrontState } from "../store"

export type UiModalId = "search" | "country" | "age-gate" | null

export type UiSlice = {
  isNavOpen: boolean
  isCartDrawerOpen: boolean
  activeModal: UiModalId
  isOverlayVisible: boolean
  toastEnabled: boolean
  cartMutationCount: number
  openNav: () => void
  closeNav: () => void
  setNavOpen: (open: boolean) => void
  openCartDrawer: () => void
  closeCartDrawer: () => void
  setCartDrawerOpen: (open: boolean) => void
  openModal: (modal: Exclude<UiModalId, null>) => void
  closeModal: () => void
  setOverlayVisible: (visible: boolean) => void
  setToastEnabled: (enabled: boolean) => void
  beginCartMutation: () => void
  endCartMutation: () => void
}

export const createUiSlice: StateCreator<StorefrontState, [], [], UiSlice> = (
  set
) => ({
  isNavOpen: false,
  isCartDrawerOpen: false,
  activeModal: null,
  isOverlayVisible: false,
  toastEnabled: true,
  cartMutationCount: 0,
  openNav: () => set({ isNavOpen: true }),
  closeNav: () => set({ isNavOpen: false }),
  setNavOpen: (open) => set({ isNavOpen: open }),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setOverlayVisible: (visible) => set({ isOverlayVisible: visible }),
  setToastEnabled: (enabled) => set({ toastEnabled: enabled }),
  beginCartMutation: () =>
    set((state) => ({ cartMutationCount: state.cartMutationCount + 1 })),
  endCartMutation: () =>
    set((state) => ({
      cartMutationCount: Math.max(0, state.cartMutationCount - 1),
    })),
})
