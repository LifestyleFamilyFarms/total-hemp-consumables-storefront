/**
 * Password strength scoring (0–4 scale).
 * No external dependencies — pure string analysis.
 *
 * 0 = too weak (red)
 * 1 = weak (orange/tangelo)
 * 2 = fair (gold)
 * 3 = good (teal)
 * 4 = strong (forest/green)
 */

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
  score: StrengthLevel
  label: string
  color: string // Tailwind class referencing brand tokens
}

const STRENGTH_MAP: Record<StrengthLevel, Omit<PasswordStrength, "score">> = {
  0: { label: "Too weak", color: "bg-destructive" },
  1: { label: "Weak", color: "bg-[hsl(var(--brand-tangelo))]" },
  2: { label: "Fair", color: "bg-[hsl(var(--brand-gold))]" },
  3: { label: "Good", color: "bg-[hsl(var(--brand-teal))]" },
  4: { label: "Strong", color: "bg-[hsl(var(--brand-forest))]" },
}

export function scorePassword(password: string): PasswordStrength {
  if (!password || password.length < 1) {
    return { score: 0, ...STRENGTH_MAP[0] }
  }

  let score = 0

  // Length checks (most important factor)
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Penalize common patterns
  if (/^[a-zA-Z]+$/.test(password)) score = Math.max(score - 1, 0)
  if (/^[0-9]+$/.test(password)) score = Math.max(score - 1, 0)
  if (/(.)\1{2,}/.test(password)) score = Math.max(score - 1, 0) // repeated chars
  if (/^(password|123456|qwerty)/i.test(password)) score = 0

  // Clamp to 0-4
  const clamped = Math.min(Math.max(score, 0), 4) as StrengthLevel

  return { score: clamped, ...STRENGTH_MAP[clamped] }
}
