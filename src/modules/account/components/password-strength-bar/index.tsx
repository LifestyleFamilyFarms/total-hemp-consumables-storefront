"use client"

import { scorePassword } from "@lib/util/password-strength"
import { cn } from "@lib/utils"

type Props = {
  password: string
  className?: string
}

const PasswordStrengthBar = ({ password, className }: Props) => {
  const { score, label, color } = scorePassword(password)

  if (!password) return null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < score ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-300",
          score <= 1
            ? "text-destructive"
            : score === 2
              ? "text-[hsl(var(--brand-gold))]"
              : "text-[hsl(var(--brand-teal))]"
        )}
      >
        {label}
      </span>
    </div>
  )
}

export default PasswordStrengthBar
