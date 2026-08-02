import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Application tests for the business Server Actions.
 *
 * The property under test is authorisation: a Server Action is reachable as a
 * plain POST, so nothing in the interface constrains what arrives here.
 */

const h = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as Error & { url: string };
    error.url = url;
    throw error;
  });

  return {
    redirect,
    revalidatePath: vi.fn(),
    requireUser: vi.fn(async () => ({ id: "user-a", email: "a@example.test" })),
    rpc: vi.fn(),
    setActiveBusinessCookie: vi.fn(),
    clearActiveBusinessCookie: vi.fn(),
    hasMembership: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({ redirect: h.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: h.revalidatePath }));
vi.mock("@/lib/auth/current-user", () => ({ requireUser: h.requireUser }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc: h.rpc }),
}));
vi.mock("@/features/businesses/active-business", () => ({
  setActiveBusinessCookie: h.setActiveBusinessCookie,
  clearActiveBusinessCookie: h.clearActiveBusinessCookie,
}));
vi.mock("@/features/businesses/queries", () => ({
  hasMembership: h.hasMembership,
}));

const { createBusinessAction, switchBusinessAction } = await import(
  "@/features/businesses/actions"
);
const { initialCreateBusinessState } = await import(
  "@/features/businesses/form-state"
);

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
  h.requireUser.mockResolvedValue({ id: "user-a", email: "a@example.test" });
});

describe("createBusinessAction", () => {
  it("creates the business through the RPC and makes it active", async () => {
    h.rpc.mockResolvedValue({ data: { id: "business-one", name: "Duo Brew" }, error: null });

    await expectRedirect(
      createBusinessAction(initialCreateBusinessState, form({ name: "Duo Brew" })),
      "/dashboard",
    );

    // The single RPC is what makes the business, the owner membership, and the
    // audit event one indivisible act.
    expect(h.rpc).toHaveBeenCalledWith("create_business_with_owner", {
      p_name: "Duo Brew",
    });
    expect(h.setActiveBusinessCookie).toHaveBeenCalledWith("business-one");
  });

  it("trims the name before it reaches the database", async () => {
    h.rpc.mockResolvedValue({ data: { id: "business-one", name: "Duo Brew" }, error: null });

    await expectRedirect(
      createBusinessAction(initialCreateBusinessState, form({ name: "  Duo Brew  " })),
      "/dashboard",
    );

    expect(h.rpc).toHaveBeenCalledWith("create_business_with_owner", {
      p_name: "Duo Brew",
    });
  });

  it("rejects a too-short name without calling the database", async () => {
    const state = await createBusinessAction(
      initialCreateBusinessState,
      form({ name: "D" }),
    );

    expect(state.error).toBe("Use at least 2 characters.");
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only name without calling the database", async () => {
    const state = await createBusinessAction(
      initialCreateBusinessState,
      form({ name: "    " }),
    );

    expect(state.error).not.toBeNull();
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("does nothing when there is no session", async () => {
    h.requireUser.mockImplementation(async () => {
      const error = new Error("NEXT_REDIRECT") as Error & { url: string };
      error.url = "/sign-in";
      throw error;
    });

    await expectRedirect(
      createBusinessAction(initialCreateBusinessState, form({ name: "Duo Brew" })),
      "/sign-in",
    );

    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });

  it("sends the caller to sign-in when the database reports no session", async () => {
    h.rpc.mockResolvedValue({
      data: null,
      error: { message: 'auth_required', code: "42501" },
    });

    await expectRedirect(
      createBusinessAction(initialCreateBusinessState, form({ name: "Duo Brew" })),
      "/sign-in",
    );

    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });

  it("reports a failure without switching the active business", async () => {
    h.rpc.mockResolvedValue({
      data: null,
      error: { message: "connection reset", code: "08006" },
    });

    const state = await createBusinessAction(
      initialCreateBusinessState,
      form({ name: "Duo Brew" }),
    );

    expect(state.error).toBe("We could not create that business. Please try again.");
    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });
});

describe("switchBusinessAction", () => {
  it("switches to a business the caller is a member of", async () => {
    h.hasMembership.mockResolvedValue(true);

    await expectRedirect(
      switchBusinessAction(form({ businessId: "business-one" })),
      "/dashboard",
    );

    expect(h.setActiveBusinessCookie).toHaveBeenCalledWith("business-one");
  });

  // The whole point of the membership re-check: this request did not come from
  // the switcher, which only ever renders authorised businesses.
  it("refuses a business the caller has no membership for", async () => {
    h.hasMembership.mockResolvedValue(false);

    await expectRedirect(
      switchBusinessAction(form({ businessId: "someone-elses-business" })),
      "/dashboard",
    );

    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });

  it("refuses a missing or empty business id", async () => {
    await expectRedirect(switchBusinessAction(form({})), "/dashboard");
    await expectRedirect(
      switchBusinessAction(form({ businessId: "" })),
      "/dashboard",
    );

    expect(h.hasMembership).not.toHaveBeenCalled();
    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });

  it("does nothing when there is no session", async () => {
    h.requireUser.mockImplementation(async () => {
      const error = new Error("NEXT_REDIRECT") as Error & { url: string };
      error.url = "/sign-in";
      throw error;
    });

    await expectRedirect(
      switchBusinessAction(form({ businessId: "business-one" })),
      "/sign-in",
    );

    expect(h.hasMembership).not.toHaveBeenCalled();
    expect(h.setActiveBusinessCookie).not.toHaveBeenCalled();
  });
});
