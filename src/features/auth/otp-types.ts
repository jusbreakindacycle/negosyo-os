/**
 * The runtime allow-list for `verifyOtp`'s `type` parameter.
 *
 * DL-055 required this before `verifyOtp` was ever called, and DL-058 carries
 * it into the native verify path. It exists because `@supabase/auth-js`'s
 * `EmailOtpType` is:
 *
 *   'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email' | (string & {})
 *
 * The `(string & {})` member means TypeScript enforces nothing about this
 * value — any string type-checks. This allow-list is the only real
 * enforcement, and it is checked before every `verifyOtp` call, not left to
 * the type system.
 *
 * `'email'` is the only value listed because it is the only email
 * verification flow this product currently implements — a typed six-digit
 * code confirming sign-up. Add a value here only when a new flow that
 * actually needs it ships (e.g. `'recovery'` alongside password recovery),
 * never speculatively.
 */
export const ALLOWED_EMAIL_OTP_TYPES = ["email"] as const;

export type AllowedEmailOtpType = (typeof ALLOWED_EMAIL_OTP_TYPES)[number];

export function isAllowedEmailOtpType(
  value: string,
): value is AllowedEmailOtpType {
  return (ALLOWED_EMAIL_OTP_TYPES as readonly string[]).includes(value);
}
