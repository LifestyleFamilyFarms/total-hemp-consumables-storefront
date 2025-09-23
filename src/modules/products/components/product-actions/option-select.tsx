import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
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
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 ",
                {
                  "opacity-50 pointer-events-none": perValueDisabled,
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current && !perValueDisabled,
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
