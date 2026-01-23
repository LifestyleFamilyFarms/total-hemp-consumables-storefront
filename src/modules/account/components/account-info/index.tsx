import { Disclosure } from "@headlessui/react"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "src/lib/utils"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground shadow-[0_12px_28px_rgba(6,10,22,0.18)]" data-testid={dataTestid}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-2 text-base font-medium text-foreground">
            {typeof currentInfo === "string" ? (
              <span data-testid="current-info">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <Button
          variant={state ? "secondary" : "outline"}
          size="sm"
          className="min-w-[110px]"
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
          data-active={state}
        >
          {state ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Disclosure>
        <Disclosure.Panel
          static
          className={cn(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[120px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <span>{label} updated successfully</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={cn(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[120px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 shadow-sm">
            <span>{errorMessage}</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={cn(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-3 pt-2">
            <div className="rounded-xl border border-border/60 bg-card/70 p-3 shadow-inner">
              {children}
            </div>
            <div className="flex items-center justify-end">
              <Button
                className="w-full small:max-w-[160px]"
                type="submit"
                data-testid="save-button"
                disabled={pending}
              >
                {pending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
