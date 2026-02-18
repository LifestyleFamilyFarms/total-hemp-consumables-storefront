import type { StorefrontState } from "./store"

export const selectIsNavOpen = (state: StorefrontState) => state.isNavOpen
export const selectSetNavOpen = (state: StorefrontState) => state.setNavOpen
export const selectCloseNav = (state: StorefrontState) => state.closeNav

export const selectIsCartDrawerOpen = (state: StorefrontState) =>
  state.isCartDrawerOpen
export const selectSetCartDrawerOpen = (state: StorefrontState) =>
  state.setCartDrawerOpen
export const selectOpenCartDrawer = (state: StorefrontState) =>
  state.openCartDrawer
export const selectCloseCartDrawer = (state: StorefrontState) =>
  state.closeCartDrawer

export const selectActiveModal = (state: StorefrontState) => state.activeModal
export const selectOpenModal = (state: StorefrontState) => state.openModal
export const selectCloseModal = (state: StorefrontState) => state.closeModal

export const selectIsOverlayVisible = (state: StorefrontState) =>
  state.isOverlayVisible
export const selectSetOverlayVisible = (state: StorefrontState) =>
  state.setOverlayVisible

export const selectToastEnabled = (state: StorefrontState) => state.toastEnabled
export const selectSetToastEnabled = (state: StorefrontState) =>
  state.setToastEnabled

export const selectCheckoutDraft = (state: StorefrontState) => state.checkoutDraft
export const selectSetCheckoutDraftField = (state: StorefrontState) =>
  state.setCheckoutDraftField
export const selectPatchCheckoutDraft = (state: StorefrontState) =>
  state.patchCheckoutDraft
export const selectResetCheckoutDraft = (state: StorefrontState) =>
  state.resetCheckoutDraft
