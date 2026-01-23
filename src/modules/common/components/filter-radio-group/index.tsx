import { Dot } from "lucide-react"
import * as RadixRadioGroup from "@radix-ui/react-radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "src/lib/utils"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </span>
      <RadixRadioGroup.Root
        data-testid={dataTestId}
        onValueChange={handleChange}
        value={value}
        className="flex flex-col gap-2"
      >
        {items?.map((i) => (
          <div
            key={i.value}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground transition hover:border-border hover:bg-card/80"
          >
            <RadixRadioGroup.Item
              className="peer sr-only"
              id={i.value}
              value={i.value}
            />
            <Label
              htmlFor={i.value}
              className={cn(
                "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:cursor-pointer",
                i.value === value && "text-foreground"
              )}
              data-testid="radio-label"
              data-active={i.value === value}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-background/70 transition peer-focus:ring-2 peer-focus:ring-ring",
                  i.value === value && "border-primary/60 bg-primary/10"
                )}
                aria-hidden
              >
                {i.value === value ? (
                  <Dot className="h-4 w-4 text-primary" />
                ) : null}
              </span>
              {i.label}
            </Label>
          </div>
        ))}
      </RadixRadioGroup.Root>
    </div>
  )
}

export default FilterRadioGroup
