"use client"

import { Loader2, Trash2 } from "lucide-react"
import { ButtonHTMLAttributes, useState } from "react"
import { cn } from "src/lib/utils"
import { Button } from "@/components/ui/button"
import { deleteLineItem } from "@lib/data/cart"
import { useRouter } from "next/navigation"

type DeleteButtonProps = {
  id: string
  className?: string
  children?: React.ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">

const DeleteButton = ({
  id,
  children = "Remove",
  className,
  ...buttonProps
}: DeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteLineItem(id)
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 px-2 text-muted-foreground hover:text-destructive"
        onClick={() => handleDelete(id)}
        disabled={isDeleting}
        type="button"
        {...buttonProps}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden />
        )}
        <span>{children}</span>
      </Button>
    </div>
  )
}

export default DeleteButton
