"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { changePassword } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const initialState = { success: false, error: null as string | null }

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updatePassword = async (
    _currentState: { success: boolean; error: string | null },
    formData: FormData
  ): Promise<{ success: boolean; error: string | null }> => {
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match." }
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters.",
      }
    }

    return changePassword(_currentState, formData)
  }

  const [state, formAction] = useActionState(updatePassword, initialState)

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={
          <span>The password is not shown for security reasons</span>
        }
        isSuccess={successState}
        isError={!!state?.error}
        errorMessage={state?.error ?? undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Old password"
            name="old_password"
            required
            type="password"
            data-testid="old-password-input"
          />
          <Input
            label="New password"
            type="password"
            name="new_password"
            required
            data-testid="new-password-input"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm_password"
            required
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
