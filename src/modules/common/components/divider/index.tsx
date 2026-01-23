import { cn } from "src/lib/utils"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={cn("h-px w-full border-b border-border/60 mt-1", className)}
  />
)

export default Divider
