"use client"

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={2500}
      {...props}
    />
  )
}

export const toast = sonnerToast
