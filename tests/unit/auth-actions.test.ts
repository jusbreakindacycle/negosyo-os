import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Application tests for the auth Server Actions.
 *
 * Supabase and the Next.js request APIs are mocked. What is being checked here
 * is the behaviour the person on the other side of the form experiences: what
 * they are told when sign-in fails, and what happens to their session cookies
 * when they sign out.
 */

const h = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    // The real redirect() signals by throwing, and code downstream of it never
    // runs. Mocking it any other way would test a control flow that does not
    // exist in production.
    const error = new Error("NEXT_REDIRECT") as Error & { url: string };
    error.url = url;
    throw error;
  });

  return {
    redirect,
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    clearActiveBusinessCookie: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({ redirect: h.redirect }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: h.signInWithPassword,
      signUp: h.signUp,
      signOut: h.signOut,
    },
  }),
}));

vi.mock("@/features/businesses/active-business", () => ({
  clearActiveBusinessCookie: h.clearActiveBusinessCookie,
}));

const { signInAction, signOutAction, signUpAction } = await import(
  "@/features/auth/actions"
);
const { initialAuthFormState } = await import("@/features/auth/form-state");

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

async function expectRedirect(promise: Promise<unknown>, url: string) {
  await expect(promise).rejects.toMatchObject({ message: "NEXT_REDIRECT", url });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signInAction", () => {
  it("redirects to the dashboard on success", async () => {
    h.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    await expectRedirect(
      signInAction(initialAuthFormState, form({
        email: "owner@example.test",
        password: "correct horse",
      })),
      "/dashboard",
    );
  });

  // Telling the two cases apart turns the form into a way to check whether an
  // email address holds an account here.
  it("gives the same message for a wrong password and an unknown account", async () => {
    h.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials", code: "invalid_credentials" },
    });

    const wrongPassword = await signInAction(
      initialAuthFormState,
      form({ email: "owner@example.test", password: "wrong" }),
    );

    h.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "User not found", code: "user_not_found" },
    });

    const unknownAccount = await signInAction(
      initialAuthFormState,
      form({ email: "nobody@example.test", password: "whatever" }),
    );

    expect(wrongPassword.error).toBe("Email or password is incorrect.");
    expect(unknownAccount.error).toEqual(wrongPassword.error);
  });

  it("never returns the submitted password or the Supabase message", async () => {
    h.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials", code: "invalid_credentials" },
    });

    const state = await signInAction(
      initialAuthFormState,
      form({ email: "owner@example.test", password: "s3cret-value" }),
    );

    const serialised = JSON.stringify(state);
    expect(serialised).not.toContain("s3cret-value");
    expect(serialised).not.toContain("Invalid login credentials");
  });

  it("rejects a malformed email without calling Supabase", async () => {
    const state = await signInAction(
      initialAuthFormState,
      form({ email: "not-an-email", password: "correct horse" }),
    );

    expect(state.error).toBe("Email or password is incorrect.");
    expect(h.signInWithPassword).not.toHaveBeenCalled();
  });

  // The action is reachable as a plain POST, so the form's `required`
  // attributes guarantee nothing.
  it("rejects missing fields without calling Supabase", async () => {
    const state = await signInAction(initialAuthFormState, form({}));

    expect(state.error).toBe("Email or password is incorrect.");
    expect(h.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("signUpAction", () => {
  it("sends a new owner to onboarding when a session comes back", async () => {
    h.signUp.mockResolvedValue({ data: { session: { access_token: "x" } }, error: null });

    await expectRedirect(
      signUpAction(initialAuthFormState, form({
        email: "owner@example.test",
        password: "correct horse",
      })),
      "/onboarding",
    );
  });

  // No session means the project requires email confirmation.
  it("asks the person to check their email when no session comes back", async () => {
    h.signUp.mockResolvedValue({ data: { session: null }, error: null });

    const state = await signUpAction(
      initialAuthFormState,
      form({ email: "owner@example.test", password: "correct horse" }),
    );

    expect(state).toEqual({ error: null, status: "check-email" });
  });

  it("repeats a weak-password rejection, which the person can act on", async () => {
    h.signUp.mockResolvedValue({
      data: {},
      error: { message: "Password is too weak", code: "weak_password" },
    });

    const state = await signUpAction(
      initialAuthFormState,
      form({ email: "owner@example.test", password: "password" }),
    );

    expect(state.error).toContain("too weak");
  });

  it("stays generic about an address that is already registered", async () => {
    h.signUp.mockResolvedValue({
      data: {},
      error: { message: "User already registered", code: "user_already_exists" },
    });

    const state = await signUpAction(
      initialAuthFormState,
      form({ email: "taken@example.test", password: "correct horse" }),
    );

    expect(state.error).not.toContain("already");
    expect(state.error).toBe(
      "We could not create that account. Check the email address and try again.",
    );
  });

  it("rejects a short password without calling Supabase", async () => {
    const state = await signUpAction(
      initialAuthFormState,
      form({ email: "owner@example.test", password: "short" }),
    );

    expect(state.error).toBe("Use at least 8 characters.");
    expect(h.signUp).not.toHaveBeenCalled();
  });
});

describe("signOutAction", () => {
  it("clears the active business as well as the session", async () => {
    h.signOut.mockResolvedValue({ error: null });

    await expectRedirect(signOutAction(), "/sign-in");

    expect(h.signOut).toHaveBeenCalledOnce();
    // Otherwise the next person to sign in on this device inherits a pointer
    // to a business they may have no membership for.
    expect(h.clearActiveBusinessCookie).toHaveBeenCalledOnce();
  });
});
