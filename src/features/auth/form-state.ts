/**
 * Form state shared by the auth actions and the form that renders them.
 *
 * Kept out of `actions.ts` because a `"use server"` module may only export
 * async functions.
 */
export type AuthFormState = {
  error: string | null;
  /**
   * `check-email` is reached only when the project requires email
   * confirmation, in which case sign-up returns no session.
   */
  status: "idle" | "check-email";
};

export const initialAuthFormState: AuthFormState = {
  error: null,
  status: "idle",
};
