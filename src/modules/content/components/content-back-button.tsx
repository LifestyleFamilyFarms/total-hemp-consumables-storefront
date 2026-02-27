"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type ContentBackButtonProps = {
  fallbackHref: string
  label?: string
}

export default function ContentBackButton({
  fallbackHref,
  label = "Back",
}: ContentBackButtonProps) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mb-2 inline-flex items-center gap-2"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
          return
        }

        router.push(fallbackHref)
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
