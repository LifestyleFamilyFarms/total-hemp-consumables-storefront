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
        "bg-white border border-border rounded-3xl shadow-sm backdrop-blur-sm flex flex-col gap-y-0 overflow-hidden",
        className
      )}
    >
      {(title || description || rightAction) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/80 px-6 py-4 sm:px-8">
          <div className="flex flex-col">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
        </div>
      )}
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col gap-y-6">{children}</div>
    </section>
  )
}

export default SectionCard
