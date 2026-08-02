import { z } from "zod";

/**
 * Shared sign-in and sign-up input rules.
 *
 * Imported by both the form and the server action. The server re-validates
 * every time: a Server Function is reachable as a plain POST, so client-side
 * validation is a convenience for the person typing, never a control.
 */

/** 254 is the maximum length of an email address per RFC 5321. */
export const emailSchema = z
  .email({ message: "Enter a valid email address." })
  .max(254, { message: "Enter a valid email address." });

/**
 * Eight characters is the floor. The 72-byte ceiling is bcrypt's: anything
 * past it is silently ignored during hashing, so a longer password would give
 * a false sense of strength.
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters." })
  .max(72, { message: "Use 72 characters or fewer." });

export const signInSchema = z.object({
  email: emailSchema,
  // No length rule on sign-in. The rule may have been different when the
  // account was made, and rejecting here would lock a person out of their own
  // account for a reason the form cannot explain.
  password: z.string().min(1, { message: "Enter your password." }),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
