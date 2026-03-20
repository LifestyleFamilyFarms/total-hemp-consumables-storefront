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
        "flex flex-col gap-y-0 overflow-hidden rounded-xl border border-border/30 bg-card",
        className
      )}
    >
      {(title || description || rightAction) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/30 bg-card/35 px-5 py-4 sm:px-7">
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
