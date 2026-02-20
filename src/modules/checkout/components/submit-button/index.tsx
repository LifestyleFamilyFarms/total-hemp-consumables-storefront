"use client"

import React from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "src/lib/utils"
import { BrandSpinner } from "@/components/brand/brand-spinner"

type SubmitButtonVariant = "primary" | "secondary" | "transparent" | "danger" | null

const variantMap: Record<NonNullable<SubmitButtonVariant>, "default" | "secondary" | "ghost" | "destructive"> = {
  primary: "default",
  secondary: "secondary",
  transparent: "ghost",
  danger: "destructive",
}

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: SubmitButtonVariant
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()
  const mappedVariant =
    variant ? variantMap[variant] ?? "default" : "default"

  return (
    <Button
      type="submit"
      variant={mappedVariant}
      className={cn("h-11 px-6 text-sm font-medium", className)}
      disabled={pending}
      data-testid={dataTestId}
    >
      {pending && <BrandSpinner className="mr-2" />}
      {children}
    </Button>
  )
}
