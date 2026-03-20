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
