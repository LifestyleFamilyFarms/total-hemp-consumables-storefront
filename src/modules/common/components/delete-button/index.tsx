"use client"

import { Loader2, Trash2 } from "lucide-react"
import { ButtonHTMLAttributes, useState } from "react"
import { useCart } from "@lib/context/cart-context"
import { cn } from "src/lib/utils"
import { Button } from "@/components/ui/button"

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
  const { removeItem, refresh } = useCart()

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await removeItem(id)
      await refresh()
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
