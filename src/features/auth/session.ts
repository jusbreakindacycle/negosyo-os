import { clearActiveBusinessId } from "@/features/businesses/store";
import { supabase } from "@/lib/supabase/client";

import { isAllowedEmailOtpType } from "./otp-types";

/**
 * One message for every credential failure.
 *
 * Distinguishing "no such account" from "wrong password" turns the sign-in
 * form into a way to test whether an email address is registered here.
 * Carried over unchanged from the web client's `src/features/auth/actions.ts`.
 */
export const CREDENTIALS_MESSAGE = "Email or password is incorrect.";

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // The Supabase message is not surfaced and nothing is logged: the inputs
    // to this call include a password.
    return { error: CREDENTIALS_MESSAGE };
  }

  return { error: null };
}

/**
 * Starts sign-up. The account is created immediately; it has no usable
 * session until the six-digit code emailed to it is verified through
 * {@link verifySignUpCode}.
 */
export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // A weak-password rejection is worth repeating, because the person can
    // act on it and it reveals nothing about who holds an account. Everything
    // else stays generic for the same reason as sign-in.
    const message =
      error.code === "weak_password"
        ? "That password was rejected as too weak. Try a longer one."
        : "We could not create that account. Check the email address and try again.";

    return { error: message };
  }

  return { error: null };
}

/**
 * Verifies the six-digit code from the sign-up confirmation email.
 *
 * `type` is checked against the DL-058 allow-list before it ever reaches
 * `verifyOtp` — see `src/features/auth/otp-types.ts` for why that check
 * cannot be left to the type system.
 */
export async function verifySignUpCode(email: string, token: string) {
  const type = "email";

  if (!isAllowedEmailOtpType(type)) {
    // Unreachable with the current single-value allow-list; kept explicit so
    // this function still fails safely if the allow-list is ever widened
    // incorrectly.
    return { error: "Unsupported verification type." };
  }

  const { error } = await supabase.auth.verifyOtp({ email, token, type });

  if (error) {
    return { error: "That code is invalid or has expired. Request a new one." };
  }

  return { error: null };
}

/** Resends the sign-up confirmation code. Rate-limited server-side by Supabase Auth. */
export async function resendSignUpCode(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    return { error: "We could not resend the code. Try again in a moment." };
  }

  return { error: null };
}

export async function signOut() {
  await supabase.auth.signOut();

  // The active business is a per-person preference, so it should not survive
  // into whoever signs in next on this device.
  await clearActiveBusinessId();
}
