import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"
import { Input as BaseInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, touched, required, topLabel, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex w-full flex-col gap-2">
        {topLabel && (
          <Label className="text-xs font-medium text-muted-foreground">
            {topLabel}
          </Label>
        )}
        {label && (
          <Label
            htmlFor={name}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}
        <div className="relative">
          <BaseInput
            type={inputType}
            name={name}
            required={required}
            autoComplete={props.autoComplete}
            {...props}
            ref={inputRef}
            className="h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
