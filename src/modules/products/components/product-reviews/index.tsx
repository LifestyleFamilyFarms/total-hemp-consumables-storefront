"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Star } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { retrieveCustomer } from "@lib/data/customer"
import {
  createProductReview,
  listProductReviews,
  ProductReview,
} from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductReviewsProps = {
  productId: string
}

const REVIEWS_PAGE_SIZE = 6

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={`${rating}-${index}`}
          className={`h-4 w-4 ${rating >= index + 1 ? "fill-primary text-primary" : "text-foreground/35"}`}
        />
      ))}
    </div>
  )
}

function formatDate(date: string | undefined) {
  if (!date) {
    return "Recently"
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "Recently"
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatReviewer(review: ProductReview) {
  const first = typeof review.first_name === "string" ? review.first_name.trim() : ""
  const last = typeof review.last_name === "string" ? review.last_name.trim() : ""

  if (first && last) {
    return `${first} ${last.charAt(0)}.`
  }

  if (first) {
    return first
  }

  return "Verified customer"
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const qaEvidenceModeEnabled = process.env.NEXT_PUBLIC_QA_EVIDENCE_MODE === "1"
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)

  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  const [isCustomerLoading, setIsCustomerLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingModerationNote, setPendingModerationNote] = useState<string | null>(null)

  const forceRuntimeError =
    qaEvidenceModeEnabled &&
    searchParams?.get("qa_reviews_force_error") === "1"

  const hasMoreReviews = useMemo(() => reviews.length < count, [reviews.length, count])

  const loadReviews = useCallback(
    async (nextOffset = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoadingReviews(true)
      }

      setReviewsError(null)

      try {
        // QA-only toggle to deterministically exercise runtime error UI.
        if (forceRuntimeError) {
          throw new Error("Forced reviews runtime error for QA evidence.")
        }

        const response = await listProductReviews({
          productId,
          limit: REVIEWS_PAGE_SIZE,
          offset: nextOffset,
        })

        const incoming = response.reviews || []
        const safeAverage =
          typeof response.average_rating === "number" && Number.isFinite(response.average_rating)
            ? response.average_rating
            : 0

        setAverageRating(safeAverage)
        setCount(response.count || 0)
        setOffset(nextOffset + incoming.length)

        if (append) {
          setReviews((current) => {
            const seen = new Set(current.map((review) => review.id))
            const deduped = incoming.filter((review) => !seen.has(review.id))
            return [...current, ...deduped]
          })
        } else {
          setReviews(incoming)
        }
      } catch (error: any) {
        setReviewsError(error?.message ?? "Unable to load reviews.")
      } finally {
        if (append) {
          setIsLoadingMore(false)
        } else {
          setIsLoadingReviews(false)
        }
      }
    },
    [forceRuntimeError, productId]
  )

  useEffect(() => {
    loadReviews(0, false)
  }, [loadReviews])

  useEffect(() => {
    let isActive = true

    retrieveCustomer()
      .then((customer) => {
        if (!isActive) {
          return
        }

        if (!customer) {
          setIsAuthenticated(false)
          return
        }

        setIsAuthenticated(true)
      })
      .finally(() => {
        if (isActive) {
          setIsCustomerLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setSubmitError("Sign in to submit a review.")
      return
    }

    if (!content.trim() || rating < 1) {
      setSubmitError("Please add review text and select a rating.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setPendingModerationNote(null)

    try {
      const response = await createProductReview({
        productId,
        title: title.trim() || undefined,
        content: content.trim(),
        rating,
      })

      setTitle("")
      setContent("")
      setRating(0)

      const status = typeof response.review?.status === "string" ? response.review.status : "pending"
      if (status === "pending") {
        setPendingModerationNote(
          "Review submitted. It is pending moderation before appearing publicly."
        )
      } else {
        setPendingModerationNote("Review submitted successfully.")
      }

      await loadReviews(0, false)
    } catch (error: any) {
      setSubmitError(error?.message ?? "Unable to submit your review right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="bg-card border border-border/30 space-y-6 rounded-xl p-5 sm:p-6"
      data-testid="product-reviews-section"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/60">
            Product feedback
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Customer Reviews
          </h2>
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 px-4 py-2 text-right">
          <p className="text-xl font-semibold text-foreground">
            {count > 0 ? averageRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/60">
            {count} {count === 1 ? "review" : "reviews"}
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {isLoadingReviews ? (
          <div
            className="rounded-2xl border border-border/30 bg-card/70 p-5 text-sm text-foreground/75"
            data-testid="reviews-loading-state"
          >
            <span className="inline-flex items-center gap-2">
              <BrandSpinner />
              Loading reviews...
            </span>
          </div>
        ) : null}

        {!isLoadingReviews && reviewsError ? (
          <div
            className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            data-testid="reviews-error-state"
          >
            <p>{reviewsError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => loadReviews(0, false)}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoadingReviews && !reviewsError && reviews.length === 0 ? (
          <div
            className="rounded-2xl border border-border/30 bg-card/70 p-5 text-sm text-foreground/75"
            data-testid="reviews-empty-state"
          >
            No reviews yet. Be the first to share feedback.
          </div>
        ) : null}

        {!isLoadingReviews && !reviewsError && reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.map((review) => {
              const numericRating =
                typeof review.rating === "number" && Number.isFinite(review.rating)
                  ? Math.max(0, Math.min(5, Math.round(review.rating)))
                  : 0

              return (
                <li
                  key={review.id}
                  className="space-y-3 rounded-2xl border border-border/30 bg-card/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      {renderStars(numericRating)}
                      <p className="text-xs uppercase tracking-[0.18em] text-foreground/60">
                        {formatReviewer(review)}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-foreground/55">
                      {formatDate(review.created_at)}
                    </p>
                  </div>

                  {review.title ? (
                    <h3 className="text-base font-semibold text-foreground">{String(review.title)}</h3>
                  ) : null}

                  <p className="text-sm leading-relaxed text-foreground/80">
                    {review.content ? String(review.content) : "No review text provided."}
                  </p>
                </li>
              )
            })}
          </ul>
        ) : null}

        {!isLoadingReviews && !reviewsError && hasMoreReviews ? (
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => loadReviews(offset, true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <BrandSpinner />
                  Loading...
                </span>
              ) : (
                "Load more reviews"
              )}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border/30 bg-background/70 p-4 sm:p-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Write a review
        </h3>

        {isCustomerLoading ? (
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/70">
            <BrandSpinner />
            Checking account status...
          </p>
        ) : null}

        {!isCustomerLoading && !isAuthenticated ? (
          <div
            className="mt-3 space-y-3 rounded-xl border border-border/30 bg-card/70 p-4"
            data-testid="reviews-auth-required"
          >
            <p className="text-sm text-foreground/80">
              Sign in to submit a product review.
            </p>
            <LocalizedClientLink href="/account">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </LocalizedClientLink>
          </div>
        ) : null}

        {!isCustomerLoading && isAuthenticated ? (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor={`review-title-${productId}`}>Title (optional)</Label>
              <Input
                id={`review-title-${productId}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short headline"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  const active = rating >= value

                  return (
                    <Button
                      key={`rating-${value}`}
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-5 w-5 ${active ? "fill-primary text-primary" : "text-foreground/35"}`}
                      />
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`review-content-${productId}`}>Review</Label>
              <textarea
                id={`review-content-${productId}`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share product experience, effects, and overall quality."
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                maxLength={1200}
              />
            </div>

            {submitError ? (
              <p className="text-sm text-destructive" data-testid="reviews-submit-error-state">
                {submitError}
              </p>
            ) : null}

            {pendingModerationNote ? (
              <p className="text-sm text-foreground/80" data-testid="reviews-pending-moderation">
                {pendingModerationNote}
              </p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <BrandSpinner />
                  Submitting...
                </span>
              ) : (
                "Submit review"
              )}
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  )
}
