"use server";

import { redirect } from "next/navigation";

import { clearActiveBusinessCookie } from "@/features/businesses/active-business";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

import type { AuthFormState } from "./form-state";

/**
 * One message for every credential failure.
 *
 * Distinguishing "no such account" from "wrong password" turns the sign-in
 * form into a way to test whether an email address is registered here.
 */
const CREDENTIALS_MESSAGE = "Email or password is incorrect.";

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  // Re-validated on the server even though the form validates too: a Server
  // Action is reachable as a plain POST.
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: CREDENTIALS_MESSAGE, status: "idle" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // The Supabase message is not surfaced and nothing is logged: the inputs
    // to this call include a password.
    return { error: CREDENTIALS_MESSAGE, status: "idle" };
  }

  // Outside any try/catch — redirect() signals by throwing, and a catch block
  // would swallow it.
  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: first?.message ?? "Check the details you entered.",
      status: "idle",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // A weak-password rejection is worth repeating, because the person can act
    // on it and it reveals nothing about who holds an account. Everything else
    // stays generic for the same reason as sign-in.
    const message =
      error.code === "weak_password"
        ? "That password was rejected as too weak. Try a longer one."
        : "We could not create that account. Check the email address and try again.";

    return { error: message, status: "idle" };
  }

  if (!data.session) {
    // Email confirmation is switched on for this project. The account exists
    // but there is no session until the link in the email is opened.
    return { error: null, status: "check-email" };
  }

  redirect("/onboarding");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // The active business is a per-person preference, so it should not survive
  // into whoever signs in next on this device.
  await clearActiveBusinessCookie();

  redirect("/sign-in");
}
