import { HttpTypes } from "@medusajs/types"
import { cn } from "src/lib/utils"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  isValueDisabled?: (value: string) => boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  isValueDisabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  function labelFor(title: string, value: string) {
    if (/weight/i.test(title)) {
      const match = /([0-9]+)\s*g/i.exec(value || "")
      const g = match ? parseInt(match[1]) : NaN
      const map: Record<number, string> = { 350: "1/8 oz", 700: "1/4 oz", 1400: "1/2 oz", 2800: "1 oz" }
      if (!isNaN(g) && map[g]) return map[g]
      return value
    }
    if (/dose/i.test(title)) {
      const num = parseInt(value)
      return isNaN(num) ? value : `${num} mg`
    }
    if (/pack\s*size/i.test(title)) {
      const num = parseInt(value)
      return isNaN(num) ? value : `${num} pack`
    }
    if (/serving/i.test(title)) {
      const num = parseInt(value)
      return isNaN(num) ? value : `${num} mg`
    }
    return value
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const perValueDisabled = !!isValueDisabled && isValueDisabled(v)
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={cn(
                "flex-1 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-semibold text-foreground transition duration-150 hover:-translate-y-[1px] hover:border-primary/50 hover:shadow-[0_10px_30px_rgba(6,10,22,0.15)]",
                {
                  "opacity-50 pointer-events-none": perValueDisabled,
                  "border-primary/50 bg-primary/10 text-foreground shadow-[0_10px_30px_rgba(6,10,22,0.12)]":
                    v === current && !perValueDisabled,
                }
              )}
              disabled={disabled || perValueDisabled}
              data-testid="option-button"
            >
              {labelFor(title, v)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
