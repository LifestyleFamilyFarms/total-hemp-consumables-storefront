"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import Modal from "@modules/common/components/modal"

const BANNER_DISMISS_KEY = "thc_member_rewards_banner_dismissed_session_v3"

type MemberRewardsBannerProps = {
  countryCode: string
  isAuthenticated?: boolean
}

export default function MemberRewardsBanner({
  countryCode,
  isAuthenticated = false,
}: MemberRewardsBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExplainerOpen, setIsExplainerOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setIsVisible(false)
      return
    }

    const wasDismissed = window.sessionStorage.getItem(BANNER_DISMISS_KEY) === "1"

    setIsVisible(!wasDismissed)
  }, [isAuthenticated])

  if (isAuthenticated || !isVisible) {
    return null
  }

  return (
    <div className="sticky top-16 z-30 border-b border-border/60 bg-emerald-100/90 backdrop-blur supports-[backdrop-filter]:bg-emerald-100/70">
      <div className="relative mx-auto w-full max-w-8xl px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 pr-10 text-center">
          <p className="text-sm font-medium text-emerald-900">
            Members earn loyalty points toward future discounts.
          </p>
          <button
            type="button"
            onClick={() => setIsExplainerOpen(true)}
            className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50 transition hover:bg-emerald-800"
          >
            Learn more
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem(BANNER_DISMISS_KEY, "1")
            setIsVisible(false)
          }}
          aria-label="Dismiss member rewards message"
          className="absolute right-4 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-800/30 text-emerald-900 transition hover:bg-emerald-200 sm:right-6"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Modal
        isOpen={isExplainerOpen}
        close={() => setIsExplainerOpen(false)}
        size="small"
        data-testid="member-rewards-explainer-modal"
      >
        <Modal.Title>Loyalty Rewards</Modal.Title>
        <Modal.Description>
          Members earn loyalty points on completed orders and can redeem those points
          for future checkout discounts.
        </Modal.Description>
        <Modal.Body>
          <div className="w-full space-y-3 text-sm text-ui-fg-base">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Current rewards value is approximately 4% back.</li>
              <li>Points are tracked in your account loyalty dashboard.</li>
              <li>Redeem points during checkout whenever you are ready.</li>
            </ul>
            <div className="flex w-full justify-center pt-1">
              <Link
                href={`/${countryCode}/account`}
                className="inline-flex items-center rounded-md border border-emerald-700/40 bg-emerald-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50 transition hover:bg-emerald-800"
                onClick={() => setIsExplainerOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
