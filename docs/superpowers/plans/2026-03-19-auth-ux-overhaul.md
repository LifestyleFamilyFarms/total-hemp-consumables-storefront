# Auth UX Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the generic sign-in/sign-up experience into a branded, mobile-first, conversion-optimized auth flow with real validation, password strength feedback, forgot-password support, and smooth view transitions — all using existing brand tokens and zero backend changes.

**Architecture:** Client-only overhaul touching ~12 files. All auth mutations remain in `src/lib/data/customer.ts` server actions → Medusa SDK. We add Zod validation schemas, a password strength utility, animated view transitions via CSS, and a forgot-password stub (Medusa's reset token flow). No new dependencies — everything uses existing shadcn/ui primitives, Sonner toasts, and brand tokens.

**Tech Stack:** Next.js 15 App Router, React 19 (`useActionState`), Zod, Tailwind CSS (brand tokens), shadcn/ui, Sonner, Medusa JS SDK

---

## Current State (What's Broken)

| Issue | File | Severity |
|-------|------|----------|
| "Welcome Back" / "Join us!" generic copy | login, register components | UX — no brand voice |
| No client-side validation | login, register | UX — errors only after server roundtrip |
| No password strength indicator | register | UX — users don't know requirements |
| No forgot password link or flow | login component | BROKEN — no recovery path |
| Email update stubbed (TODO) | profile-email | BROKEN — fake success (DEFERRED — not in this plan's scope) |
| Password change stubbed | profile-password | BROKEN — toast "not implemented" |
| No transition animation between views | login-template | UX — jarring view switch |
| No success feedback after signup | register | UX — silent redirect |
| No age verification nudge | register | COMPLIANCE — hemp requires 21+ |

## File Structure

### Files to CREATE

| File | Responsibility |
|------|---------------|
| `src/lib/validation/auth-schemas.ts` | Zod schemas for login, register, password reset forms |
| `src/lib/util/password-strength.ts` | Password strength scoring utility (0-4 scale) |
| `src/modules/account/components/password-strength-bar/index.tsx` | Visual password strength indicator |
| `src/modules/account/components/forgot-password/index.tsx` | Forgot password form (email input → Medusa reset token) |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/modules/account/templates/login-template.tsx` | Add FORGOT_PASSWORD view, CSS transitions, mobile polish |
| `src/modules/account/components/login/index.tsx` | Brand copy, Zod validation, forgot password link, field errors |
| `src/modules/account/components/register/index.tsx` | Brand copy, Zod validation, password strength, age checkbox, success toast |
| `src/modules/account/components/profile-password/index.tsx` | Wire to Medusa auth provider for real password changes |
| `src/lib/data/customer.ts` | Add `requestPasswordReset` and `resetPassword` server actions |
| `src/modules/common/components/input/index.tsx` | Add `error` prop for field-level error display |

### Files NOT TOUCHED

| File | Reason |
|------|--------|
| `src/components/ui/*` | shadcn/ui layer — extend, don't modify |
| `src/lib/brand/index.ts` | Brand system is complete, no changes needed |
| `src/app/global.css` | Brand tokens already defined |
| `src/lib/data/cookies.ts` | Auth token management works correctly |

---

## Task 1: Auth Validation Schemas

**Files:**
- Create: `src/lib/validation/auth-schemas.ts`

- [ ] **Step 1: Create the validation directory**

```bash
mkdir -p src/lib/validation
```

- [ ] **Step 2: Write auth Zod schemas**

Create `src/lib/validation/auth-schemas.ts`:

```typescript
import { z } from "zod"

/**
 * Shared field validators for auth forms.
 * Reuse the Name transform from signup-core.ts pattern.
 */
const Name = z
  .string()
  .transform((val) => val.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(1, "Required")
      .max(64, "Too long")
      .refine(
        (val) => /^[A-Za-z\u00C0-\u017F\s.'\-]+$/.test(val),
        "Only letters, spaces, apostrophes, hyphens, periods"
      )
  )

const Email = z
  .string()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address")
  .transform((email) => email.trim().toLowerCase())

const Password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")

const Phone = z
  .string()
  .transform((val) => val.replace(/[\s\-().]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
  )
  .optional()
  .or(z.literal(""))

export const LoginSchema = z.object({
  email: Email,
  password: z.string().min(1, "Password is required"),
})

export const RegisterSchema = z.object({
  first_name: Name,
  last_name: Name,
  email: Email,
  phone: Phone,
  password: Password,
  age_confirmed: z.preprocess(
    (val) => val ?? "",
    z.string().refine((val) => val === "on", "You must confirm you are 21 or older")
  ),
})

export const ForgotPasswordSchema = z.object({
  email: Email,
})

export const ResetPasswordSchema = z.object({
  email: Email,
  new_password: Password,
  confirm_password: z.string().min(1, "Please confirm your password"),
  token: z.string().min(1),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

/**
 * Parse FormData against a schema. Returns { data, errors } where
 * errors is a flat Record<fieldName, errorMessage> or null.
 *
 * NOTE: Only supports single-value fields. Multi-value fields (e.g., multiple
 * checkboxes with the same name) will only retain the last value.
 */
export function validateFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): { data: z.infer<T> | null; errors: Record<string, string> | null } {
  const raw = Object.fromEntries(formData.entries())
  const result = schema.safeParse(raw)

  if (result.success) {
    return { data: result.data, errors: null }
  }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".")
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return { data: null, errors }
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && npx tsc --noEmit src/lib/validation/auth-schemas.ts 2>&1 | head -20`
Expected: No errors (or only unrelated ones from other files)

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation/auth-schemas.ts
git commit -m "feat(auth): add Zod validation schemas for login, register, forgot/reset password"
```

---

## Task 2: Password Strength Utility

**Files:**
- Create: `src/lib/util/password-strength.ts`

- [ ] **Step 1: Write the password strength scorer**

Create `src/lib/util/password-strength.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/util/password-strength.ts
git commit -m "feat(auth): add password strength scoring utility"
```

---

## Task 3: Password Strength Bar Component

**Files:**
- Create: `src/modules/account/components/password-strength-bar/index.tsx`

- [ ] **Step 1: Write the component**

Create `src/modules/account/components/password-strength-bar/index.tsx`:

```tsx
"use client"

import { scorePassword } from "@lib/util/password-strength"
import { cn } from "@lib/utils"

type Props = {
  password: string
  className?: string
}

const PasswordStrengthBar = ({ password, className }: Props) => {
  const { score, label, color } = scorePassword(password)

  if (!password) return null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < score ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-300",
          score <= 1
            ? "text-destructive"
            : score === 2
              ? "text-[hsl(var(--brand-gold))]"
              : "text-[hsl(var(--brand-teal))]"
        )}
      >
        {label}
      </span>
    </div>
  )
}

export default PasswordStrengthBar
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/account/components/password-strength-bar/index.tsx
git commit -m "feat(auth): add password strength bar component"
```

---

## Task 4: Add Field-Level Error Display to Input Component

**Files:**
- Modify: `src/modules/common/components/input/index.tsx`

- [ ] **Step 1: Add `error` prop to Input**

In `src/modules/common/components/input/index.tsx`, update the `InputProps` type and render:

```tsx
// Updated InputProps — add error field
type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  error?: string  // <-- NEW: field-level error message
  name: string
  topLabel?: string
}
```

Then after the `<BaseInput>` and password toggle button's closing `</div>`, add:

```tsx
{/* Field-level error message */}
{props.error && (
  <p className="mt-1 text-xs font-medium text-destructive" role="alert">
    {props.error}
  </p>
)}
```

Note: The `error` prop is destructured from `props` via the spread, so reference it as `props.error` in the render, or explicitly destructure it in the forwardRef callback params. The cleanest approach is to destructure `error` alongside the other named props:

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, touched, required, topLabel, error, ...props }, ref) => {
```

Then at the bottom of the component, before the closing `</div>` of the outer wrapper:

```tsx
{error && (
  <p className="mt-1 text-xs font-medium text-destructive" role="alert">
    {error}
  </p>
)}
```

Also add a red border when error is present — update the `<BaseInput>` className:

```tsx
className={cn(
  "h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
  error && "border-destructive focus-visible:ring-destructive"
)}
```

Import `cn` from `src/lib/utils` at the top of the file.

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && npx tsc --noEmit 2>&1 | grep -i "input" | head -10`
Expected: No new errors related to Input component

- [ ] **Step 3: Commit**

```bash
git add src/modules/common/components/input/index.tsx
git commit -m "feat(auth): add field-level error display to Input component"
```

---

## Task 5: Add Forgot Password and Reset Password Server Actions

**Files:**
- Modify: `src/lib/data/customer.ts`

- [ ] **Step 1: Add `requestPasswordReset` server action**

Add these two server actions to `src/lib/data/customer.ts`, after the existing `login` action:

```typescript
export async function requestPasswordReset(
  _currentState: { success: boolean; error: string | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const email = formData.get("email") as string

  try {
    // Medusa v2 auth reset: POST /auth/customer/emailpass/reset-password
    // This sends a reset token to the customer's email via notification provider
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
    return { success: true, error: null }
  } catch (error: any) {
    // Always return success to prevent email enumeration attacks
    // Even if the email doesn't exist, we show the same message
    return { success: true, error: null }
  }
}

export async function resetPassword(
  _currentState: { success: boolean; error: string | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const token = formData.get("token") as string
  const newPassword = formData.get("new_password") as string

  try {
    // Medusa v2: POST /auth/customer/emailpass/update with token + new password
    // Token identifies the user — no email needed in body
    await sdk.auth.updateProvider("customer", "emailpass", {
      password: newPassword,
    }, token)
    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Could not reset password. Please try again.",
    }
  }
}
```

**Important:** Check Medusa SDK type signatures before implementing. The SDK methods may differ slightly. The key patterns are:
- `sdk.auth.resetPassword(actorType, provider, body)` for requesting reset
- `sdk.auth.updateProvider(actorType, provider, body, token)` for applying reset

If these exact methods don't exist on the SDK, check for `sdk.client.fetch()` patterns to hit the REST endpoints directly:
- `POST /auth/customer/emailpass/reset-password` with `{ identifier: email }`
- `POST /auth/customer/emailpass/update` with `{ email, password }` + token in header

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"`

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/customer.ts
git commit -m "feat(auth): add password reset server actions"
```

---

## Task 6: Forgot Password Component

**Files:**
- Create: `src/modules/account/components/forgot-password/index.tsx`

- [ ] **Step 1: Write the component**

Create `src/modules/account/components/forgot-password/index.tsx`:

```tsx
"use client"

import { useActionState, useState } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { ForgotPasswordSchema, validateFormData } from "@lib/validation/auth-schemas"
import { ArrowLeft, Mail } from "lucide-react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [state, formAction] = useActionState(requestPasswordReset, {
    success: false,
    error: null,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(ForgotPasswordSchema, formData)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors(null)
    formAction(formData)
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[30rem] flex-col items-center"
      data-testid="forgot-password-page"
    >
      {state.success && !fieldErrors ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand-teal))]/15">
            <Mail className="h-7 w-7 text-[hsl(var(--brand-teal))]" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mb-6 text-sm leading-6 text-foreground/80">
            If an account exists with that email, we&apos;ve sent password reset
            instructions. Check your inbox and spam folder.
          </p>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-teal))] hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </div>
      ) : (
        /* ── Form state ── */
        <>
          <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
            Reset your password
          </h1>
          <p className="mb-6 text-center text-sm leading-6 text-foreground/80">
            Enter the email associated with your account and we&apos;ll send
            you a link to reset your password.
          </p>
          <form className="w-full" action={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              error={fieldErrors?.email}
              data-testid="forgot-email-input"
            />
            <SubmitButton className="w-full mt-6" data-testid="forgot-submit">
              Send reset link
            </SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </>
      )}
    </div>
  )
}

export default ForgotPassword
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/account/components/forgot-password/index.tsx
git commit -m "feat(auth): add forgot password component with email validation"
```

---

## Task 7: Overhaul Login Component

**Files:**
- Modify: `src/modules/account/components/login/index.tsx`

- [ ] **Step 1: Rewrite the Login component**

Replace the contents of `src/modules/account/components/login/index.tsx`:

```tsx
"use client"

import { useActionState, useState } from "react"
import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { LoginSchema, validateFormData } from "@lib/validation/auth-schemas"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(LoginSchema, formData)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors(null)
    formAction(formData)
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[30rem] flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Sign in to Total Hemp
      </h1>
      <p className="mb-6 text-center text-sm leading-6 text-foreground/80 small:mb-8">
        Track orders, earn loyalty rewards, and check out faster.
      </p>
      <form className="w-full" action={handleSubmit}>
        <div className="flex w-full flex-col gap-y-3">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            error={fieldErrors?.email}
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={fieldErrors?.password}
            data-testid="password-input"
          />
        </div>
        {/* Forgot password link */}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="text-xs font-medium text-foreground/70 underline underline-offset-4 hover:text-foreground transition-colors"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </button>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-5">
          Sign in
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-foreground/80">
        New to Total Hemp?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-semibold text-[hsl(var(--brand-teal))] underline underline-offset-4 hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
          data-testid="register-button"
        >
          Create an account
        </button>
      </span>
    </div>
  )
}

export default Login
```

**Key changes from original:**
- "Welcome Back" → "Sign in to Total Hemp" (brand-specific)
- "New here?" → "New to Total Hemp?" (brand-specific)
- "Sign up" → "Create an account" (clearer CTA)
- Added Zod client-side validation with `fieldErrors` state
- Added "Forgot password?" link (routes to `LOGIN_VIEW.FORGOT_PASSWORD`)
- Teal brand color for the register link
- Improved spacing (`gap-y-3` instead of `gap-y-2`)

- [ ] **Step 2: Commit**

```bash
git add src/modules/account/components/login/index.tsx
git commit -m "feat(auth): overhaul login component — brand copy, Zod validation, forgot password link"
```

---

## Task 8: Overhaul Register Component

**Files:**
- Modify: `src/modules/account/components/register/index.tsx`

- [ ] **Step 1: Rewrite the Register component**

Replace the contents of `src/modules/account/components/register/index.tsx`:

```tsx
"use client"

import { useActionState, useState, useEffect, useRef } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { RegisterSchema, validateFormData } from "@lib/validation/auth-schemas"
import PasswordStrengthBar from "@modules/account/components/password-strength-bar"
import { toast } from "@/components/ui/sonner"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null)
  const [password, setPassword] = useState("")
  const hasSubmitted = useRef(false)

  // Show success toast when signup completes (message stays null = success)
  useEffect(() => {
    if (hasSubmitted.current && message === null) {
      toast.success("Account created! Welcome to Total Hemp.")
      hasSubmitted.current = false
    }
  }, [message])

  const handleSubmit = (formData: FormData) => {
    const { errors } = validateFormData(RegisterSchema, formData)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors(null)
    hasSubmitted.current = true
    formAction(formData)
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[34rem] flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Create your account
      </h1>
      <p className="mb-4 text-center text-sm leading-5 text-foreground/80 small:mb-5">
        Earn loyalty points, track your orders, and check out faster.
      </p>
      <form className="w-full flex flex-col" action={handleSubmit}>
        <div className="grid w-full gap-3 small:grid-cols-2">
          <div>
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              error={fieldErrors?.first_name}
              data-testid="first-name-input"
            />
          </div>
          <div>
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
              error={fieldErrors?.last_name}
              data-testid="last-name-input"
            />
          </div>
          <div>
            <Input
              label="Email"
              name="email"
              required
              type="email"
              autoComplete="email"
              error={fieldErrors?.email}
              data-testid="email-input"
            />
          </div>
          <div>
            <Input
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              error={fieldErrors?.phone}
              data-testid="phone-input"
            />
          </div>
          <div className="small:col-span-2">
            <Input
              label="Password"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              error={fieldErrors?.password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
            />
            <PasswordStrengthBar password={password} className="mt-2" />
          </div>

          {/* Age verification checkbox — hemp compliance requires 21+ */}
          <div className="small:col-span-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="age_confirmed"
                required
                className="mt-0.5 h-5 w-5 rounded border-input accent-[hsl(var(--brand-teal))] focus:ring-2 focus:ring-ring"
                data-testid="age-confirm-checkbox"
              />
              <span className="text-xs leading-5 text-foreground/80 group-hover:text-foreground transition-colors">
                I confirm that I am <strong>21 years of age or older</strong>.
                Hemp products are restricted to adults only.
              </span>
            </label>
            {fieldErrors?.age_confirmed && (
              <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                {fieldErrors.age_confirmed}
              </p>
            )}
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="mt-4 text-center text-xs leading-5 text-foreground/70">
          By creating an account, you agree to Total Hemp
          Consumables&apos;{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-4" data-testid="register-button">
          Create Account
        </SubmitButton>
      </form>
      <span className="mt-4 text-center text-sm text-foreground/80">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-semibold text-[hsl(var(--brand-teal))] underline underline-offset-4 hover:text-[hsl(var(--brand-teal))]/80 transition-colors"
        >
          Sign in
        </button>
      </span>
    </div>
  )
}

export default Register
```

**Key changes from original:**
- "Join us!" → "Create your account" (action-oriented, brand-specific)
- Added Zod client-side validation with per-field errors
- Added password strength bar below password field
- Added age verification checkbox (21+ — hemp compliance requirement from @hemp-compliance skill)
- "Sign Up" → "Create Account" (button text)
- Added `onChange` to password field for live strength feedback
- Improved spacing (`gap-3`)
- Transition effects on links

- [ ] **Step 2: Commit**

```bash
git add src/modules/account/components/register/index.tsx
git commit -m "feat(auth): overhaul register — Zod validation, password strength, age checkbox, brand copy"
```

---

## Task 9: Overhaul Login Template (View Transitions + Forgot Password View)

**Files:**
- Modify: `src/modules/account/templates/login-template.tsx`

- [ ] **Step 1: Update LOGIN_VIEW enum and add transitions**

Update `src/modules/account/templates/login-template.tsx`:

```tsx
"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useTheme } from "@/components/theme/theme-provider"
import {
  BrandThemeId,
  getAuthPanelLogoVariantForTheme,
} from "@lib/brand"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const resolveLoginView = (viewParam: string | null): LOGIN_VIEW => {
  if (!viewParam) {
    return LOGIN_VIEW.SIGN_IN
  }

  const normalized = viewParam.toLowerCase()

  if (normalized === "register" || normalized === "signup" || normalized === "sign-up") {
    return LOGIN_VIEW.REGISTER
  }

  if (normalized === "forgot-password" || normalized === "reset") {
    return LOGIN_VIEW.FORGOT_PASSWORD
  }

  return LOGIN_VIEW.SIGN_IN
}

const LoginTemplate = () => {
  const searchParams = useSearchParams()
  const requestedView = useMemo(
    () => resolveLoginView(searchParams.get("view")),
    [searchParams]
  )
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(requestedView)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { theme } = useTheme()
  const currentTheme = theme as BrandThemeId
  const authLogoVariant = getAuthPanelLogoVariantForTheme(currentTheme)
  const isRegisterView = currentView === LOGIN_VIEW.REGISTER

  useEffect(() => {
    setCurrentView(requestedView)
  }, [requestedView])

  // Smooth view transition handler with cleanup for rapid switching
  const transitionTimer = useRef<NodeJS.Timeout>()

  const handleViewChange = useCallback((view: LOGIN_VIEW) => {
    clearTimeout(transitionTimer.current)
    setIsTransitioning(true)
    transitionTimer.current = setTimeout(() => {
      setCurrentView(view)
      setIsTransitioning(false)
    }, 150)
  }, [])

  return (
    <div
      className={`flex min-h-[calc(100dvh-6.25rem)] w-full justify-center px-3 py-2 small:px-6 small:py-4 ${isRegisterView ? "items-start" : "items-center"}`}
      data-auth-isolated="true"
    >
      <section className="surface-universal relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── Brand Panel (desktop only) ── */}
        <div className="relative hidden min-h-[560px] overflow-hidden border-r border-ui-border-base/45 lg:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-12 -right-10 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
            <div className="relative w-full max-w-[540px]">
              <BrandLogo
                variant={authLogoVariant}
                size="md"
                format="svg"
                priority
                className="w-full opacity-95 drop-shadow-[0_20px_40px_hsl(var(--surface-glass-shadow)/0.24)]"
              />
              <div className="auth-logo-overlay pointer-events-none absolute left-1/2 top-1/2 w-[82%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border" />
            </div>
            {/* Tagline */}
            <p className="max-w-xs text-center text-sm font-medium leading-relaxed text-foreground/60">
              Premium hemp &amp; CBD products — lab-tested, legally compliant, delivered to your door.
            </p>
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div
          className={`relative mx-auto flex w-full flex-col items-center lg:min-h-[560px] lg:max-w-none ${
            isRegisterView
              ? "max-w-xl p-3 small:p-5 md:p-6"
              : "max-w-md p-5 small:p-8 md:p-10"
          }`}
        >
          {/* Mobile logo */}
          <div className="mb-3 flex w-full justify-center lg:hidden">
            <BrandLogo
              theme={currentTheme}
              slot="hero"
              size="md"
              format="svg"
              priority
              className="w-full max-w-[280px] opacity-95"
            />
          </div>

          {/* Form container with transition */}
          <div
            className={`surface-universal mx-auto w-full rounded-3xl text-foreground transition-opacity duration-150 ease-in-out ${
              isTransitioning ? "opacity-0" : "opacity-100"
            } ${isRegisterView ? "p-4 small:p-5 md:p-6" : "p-5 small:p-8"}`}
          >
            {currentView === LOGIN_VIEW.SIGN_IN && (
              <Login setCurrentView={handleViewChange} />
            )}
            {currentView === LOGIN_VIEW.REGISTER && (
              <Register setCurrentView={handleViewChange} />
            )}
            {currentView === LOGIN_VIEW.FORGOT_PASSWORD && (
              <ForgotPassword setCurrentView={handleViewChange} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginTemplate
```

**Key changes:**
- Added `FORGOT_PASSWORD` to `LOGIN_VIEW` enum
- Added `handleViewChange` with 150ms CSS opacity transition between views
- Added brand tagline in the desktop logo panel
- Reduced mobile logo max-width from 320px to 280px for better proportions
- Renders `<ForgotPassword>` when `currentView === FORGOT_PASSWORD`
- URL support: `?view=forgot-password` or `?view=reset`

- [ ] **Step 2: Verify the build compiles**

Run: `cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && npx tsc --noEmit 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/modules/account/templates/login-template.tsx
git commit -m "feat(auth): add forgot password view, CSS transitions, brand tagline to login template"
```

---

## Task 10: Wire Profile Password Change

**Files:**
- Modify: `src/modules/account/components/profile-password/index.tsx`

- [ ] **Step 1: Read the current file**

Read `src/modules/account/components/profile-password/index.tsx` to understand the existing structure and the `AccountInfo` wrapper props.

- [ ] **Step 2: Replace the stub with a real implementation**

The profile password component wraps its form in `<AccountInfo>`. The form needs to:
1. Collect old_password, new_password, confirm_password
2. Validate that new_password === confirm_password
3. Call `updateCustomer({ password: newPassword })` (Medusa v2 supports this on the store customer update endpoint if the auth provider supports it)

**Important caveat:** Medusa v2's `emailpass` auth provider may not support password change via `updateCustomer`. If it doesn't, this needs to go through `sdk.auth.updateProvider()`. Check the Medusa docs (@medusa-dev:building-storefronts skill) before implementing. The form UI should be built regardless — if the backend method isn't available, leave a clear TODO with the exact API call needed rather than a silent toast.

The password change cannot use `updateCustomer` — Medusa v2's `StoreUpdateCustomer` type doesn't include a `password` field. Passwords are managed through the auth provider. Add a dedicated server action in `src/lib/data/customer.ts`:

```typescript
// In src/lib/data/customer.ts — add this server action:
export async function changePassword(
  _currentState: { success: boolean; error: string | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const newPassword = formData.get("new_password") as string
  const headers = getAuthHeaders()

  try {
    // Password change for authenticated users goes through the auth provider.
    // Medusa v2: PUT /auth/customer/emailpass with the current session token.
    // The SDK method is sdk.auth.updateProvider().
    // NOTE: Verify exact method signature against Medusa SDK before implementing.
    // If sdk.auth.updateProvider doesn't support session-based updates,
    // fall back to sdk.client.fetch("/auth/customer/emailpass", { method: "PUT", body: { password: newPassword }, headers })
    await sdk.auth.updateProvider("customer", "emailpass", {
      password: newPassword,
    })
    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Could not update password. Please try again.",
    }
  }
}
```

Then replace the existing handler in the profile-password component with:

```typescript
const updatePassword = async () => {
  if (newPassword !== confirmPassword) {
    setErrorState("Passwords do not match")
    return
  }
  if (newPassword.length < 8) {
    setErrorState("Password must be at least 8 characters")
    return
  }

  try {
    const result = await changePassword(
      { success: false, error: null },
      (() => { const fd = new FormData(); fd.set("new_password", newPassword); return fd })()
    )
    if (result.error) {
      setErrorState(result.error)
      return
    }
    setSuccessState(true)
    clearForm()
  } catch (error: any) {
    setErrorState(error?.message || "Could not update password. Please try again.")
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/account/components/profile-password/index.tsx
git commit -m "feat(auth): wire profile password change (replaces stub toast)"
```

---

## Task 11: Responsive Polish + Visual QA

**Files:**
- Modify: Various — final pass across all auth components

- [ ] **Step 1: Test at mobile breakpoint (390×844)**

Start dev server: `yarn dev`

Navigate to `http://localhost:8000/us/account` in browser.

Verify at 390px width:
- [ ] Logo renders cleanly, not clipped
- [ ] Form fills viewport width with comfortable padding
- [ ] All inputs have 44px+ touch targets
- [ ] Password strength bar renders correctly
- [ ] Age checkbox is tappable with comfortable spacing
- [ ] "Forgot password?" link is reachable
- [ ] View transitions are smooth between sign-in ↔ register ↔ forgot password
- [ ] Error messages display below fields, not cut off

- [ ] **Step 2: Test at tablet breakpoint (768×1024)**

Verify:
- [ ] Split panel does NOT show (still single column until `lg`)
- [ ] Form content is centered and proportional
- [ ] Register grid shows 2 columns for name/email/phone

- [ ] **Step 3: Test at desktop breakpoint (1440×900)**

Verify:
- [ ] Split panel shows: logo left, form right
- [ ] Brand tagline visible below logo
- [ ] Logo overlay circle renders
- [ ] Decorative blobs visible
- [ ] Form panel properly centered vertically

- [ ] **Step 4: Test both themes**

Toggle between sativa (light) and indica (dark):
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Password strength bar colors are visible in both themes
- [ ] Error states (red borders, destructive text) are clear in both themes
- [ ] Teal accent links are readable against both backgrounds

- [ ] **Step 5: Adjust any issues found**

Fix spacing, color, or layout issues discovered during QA.

- [ ] **Step 6: Commit final polish**

```bash
git add src/modules/account/ src/modules/common/components/input/
git commit -m "fix(auth): responsive polish and visual QA adjustments"
```

---

## Task 12: Validation Gate

- [ ] **Step 1: Run linter**

```bash
cd /Users/franciscraven/Desktop/total-hemp/total-hemp-consumables-storefront && yarn lint
```
Expected: No new errors

- [ ] **Step 2: Run production build**

```bash
yarn build
```
Expected: Build succeeds

- [ ] **Step 3: Run commerce rules check**

```bash
yarn check:commerce-rules
```
Expected: No violations

- [ ] **Step 4: Fix any issues**

If any of the above fail, fix the issues and re-run.

- [ ] **Step 5: Final commit**

```bash
git add src/lib/validation/ src/lib/util/ src/lib/data/customer.ts src/modules/account/ src/modules/common/components/input/
git commit -m "chore(auth): pass lint + build + commerce-rules validation gate"
```

---

## Summary of Changes

| What Changed | Before | After |
|-------------|--------|-------|
| Sign-in heading | "Welcome Back" | "Sign in to Total Hemp" |
| Register heading | "Join us!" | "Create your account" |
| Form validation | HTML5 only (server roundtrip) | Zod client-side + server fallback |
| Field errors | Single error banner | Per-field inline errors (red border + message) |
| Password feedback | None | 4-segment strength bar with labels |
| Forgot password | Missing entirely | Full flow: email → success state |
| Age verification | None | 21+ checkbox (hemp compliance) |
| View transitions | Instant swap | 150ms opacity fade |
| Brand tagline | None | Desktop panel tagline |
| Register CTA | "Sign Up" | "Create Account" |
| Theme support | Works | Both themes QA'd |
| Profile password | Stub (toast "not implemented") | Wired to Medusa |

**Files created:** 4
**Files modified:** 6
**Backend changes:** 0 (server actions only, no new API routes)
**New dependencies:** 0 (uses existing Zod, Sonner, Lucide)
