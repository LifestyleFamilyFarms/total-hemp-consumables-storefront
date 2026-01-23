"use client"

import React, { useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { Input } from "@/components/ui/input"
import { useCart } from "@lib/context/cart-context"
import { Button } from "@/components/ui/button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { applyPromotions, refresh } = useCart()
  const [error, setError] = useState<string | null>(null)

  const { items = [], promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    try {
      await applyPromotions(
        validPromotions
          .filter((p) => p.code !== undefined)
          .map((p) => p.code!)
      )
      await refresh()
      setError(null)
    } catch (err: any) {
      setError(err?.message ?? "Unable to remove promotion.")
    }
  }

  const addPromotionCode = async (formData: FormData) => {
    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
      await refresh()
      setError(null)
      if (input) {
        input.value = ""
      }
    } catch (err: any) {
      setError(err?.message ?? "Unable to apply promotion.")
      setIsOpen(true)
    }
  }

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void addPromotionCode(new FormData(e.currentTarget))
          }}
          className="w-full mb-5"
        >
          <div className="my-2 flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-sm font-medium text-primary hover:text-primary/80"
              data-testid="add-discount-button"
            >
              Add Promotion Code(s)
            </button>
          </div>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2">
                <Input
                  className="size-full"
                  id="promotion-input"
                  name="code"
                  type="text"
                  autoFocus={false}
                  data-testid="discount-input"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  data-testid="discount-apply-button"
                >
                  Apply
                </Button>
              </div>

              <ErrorMessage error={error} data-testid="discount-error-message" />
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="flex w-full flex-col">
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Promotion(s) applied:
            </h3>

            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="mb-2 flex w-full items-center justify-between gap-4"
                data-testid="discount-row"
              >
                <div className="flex w-4/5 items-baseline gap-2 text-sm text-muted-foreground">
                  <span className="truncate" data-testid="discount-code">
                    <span className="mr-2 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {promotion.code}
                    </span>
                    (
                    {promotion.application_method?.value !== undefined &&
                      promotion.application_method.currency_code !==
                        undefined && (
                        <>
                          {promotion.application_method.type === "percentage"
                            ? `${promotion.application_method.value}%`
                            : convertToLocale({
                                amount: promotion.application_method.value,
                                currency_code:
                                  promotion.application_method.currency_code,
                              })}
                        </>
                      )}
                    )
                  </span>
                </div>
                {!promotion.is_automatic && (
                  <button
                    className="flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (!promotion.code) {
                        return
                      }

                      removePromotionCode(promotion.code)
                    }}
                    data-testid="remove-discount-button"
                  >
                    <Trash size={14} />
                    <span className="sr-only">
                      Remove discount code from order
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
