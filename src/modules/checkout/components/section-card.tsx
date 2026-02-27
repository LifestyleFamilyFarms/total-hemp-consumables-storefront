"use client"

import { ReactNode } from "react"
import { cn } from "src/lib/utils"

type SectionCardProps = {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  rightAction?: ReactNode
}

const SectionCard = ({
  children,
  className,
  title,
  description,
  rightAction,
}: SectionCardProps) => {
  return (
    <section
      className={cn(
        "surface-panel flex flex-col gap-y-0 overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_18px_40px_hsl(var(--surface-glass-shadow)/0.18)] backdrop-blur-sm",
        className
      )}
    >
      {(title || description || rightAction) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-card/35 px-5 py-4 sm:px-7">
          <div className="flex flex-col">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-foreground/70">{description}</p>
            )}
          </div>
          {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
        </div>
      )}
      <div className="flex flex-col gap-y-6 p-5 sm:p-7 lg:p-8">{children}</div>
    </section>
  )
}

export default SectionCard
