import React from "react"
import { cn } from "src/lib/utils"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  "data-testid"?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  "data-testid": dataTestId,
}) => {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        data-testid={dataTestId}
        className="h-4 w-4 rounded border border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className={cn("select-none", !checked && "text-muted-foreground")}>
        {label}
      </span>
    </label>
  )
}

export default CheckboxWithLabel
