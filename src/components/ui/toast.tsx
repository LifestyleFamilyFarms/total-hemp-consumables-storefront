"use client"

import { useEffect } from "react"

type ToastProps = {
  message: string
  onClose: () => void
  duration?: number
}

export const Toast = ({ message, onClose, duration = 2500 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
      <div className="rounded-md bg-foreground text-background px-4 py-2 shadow-lg">
        {message}
      </div>
    </div>
  )
}
