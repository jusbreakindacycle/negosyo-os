import { describe, expect, it } from "vitest";

import {
  hasUsableBusiness,
  resolveActiveBusiness,
  resolveActiveBusinessId,
  type BusinessSummary,
} from "@/features/businesses/resolve-active-business";

function business(
  id: string,
  name: string,
  overrides: Partial<BusinessSummary> = {},
): BusinessSummary {
  return {
    id,
    name,
    status: "operating",
    registration_status: "unknown",
    legal_name: null,
    ...overrides,
  };
}

const ONE: BusinessSummary = business("business-one", "Business One");
const TWO: BusinessSummary = business("business-two", "Business Two");
const CLOSED_ONE: BusinessSummary = business("business-one", "Business One", {
  status: "closed",
});
const DRAFT_TWO: BusinessSummary = business("business-two", "Business Two", {
  status: "draft",
});

describe("resolveActiveBusinessId", () => {
  it("honours a stored value that names an authorised business", () => {
    expect(resolveActiveBusinessId("business-two", [ONE, TWO])).toBe(
      "business-two",
    );
  });

  it("falls back to the first business when there is no stored value", () => {
    expect(resolveActiveBusinessId(null, [ONE, TWO])).toBe("business-one");
    expect(resolveActiveBusinessId(undefined, [ONE, TWO])).toBe("business-one");
    expect(resolveActiveBusinessId("", [ONE, TWO])).toBe("business-one");
  });

  // The stored value is attacker-controlled, so naming someone else's
  // business must not make the interface act as if it were open.
  it("ignores a stored value naming a business the user is not a member of", () => {
    expect(resolveActiveBusinessId("someone-elses-business", [ONE])).toBe(
      "business-one",
    );
  });

  it("ignores a stored value for a business the user has lost access to", () => {
    expect(resolveActiveBusinessId("business-two", [ONE])).toBe("business-one");
  });

  it("returns null when the user has no businesses at all", () => {
    expect(resolveActiveBusinessId("business-one", [])).toBeNull();
    expect(resolveActiveBusinessId(null, [])).toBeNull();
  });

  // Without this, an owner whose first-created business was closed would open
  // the app into the closed notice every single time.
  it("skips a closed business when choosing a default", () => {
    expect(resolveActiveBusinessId(null, [CLOSED_ONE, TWO])).toBe("business-two");
    expect(resolveActiveBusinessId(null, [CLOSED_ONE, DRAFT_TWO])).toBe(
      "business-two",
    );
  });

  it("still honours an explicit stored preference for a closed business", () => {
    // If they deliberately switched to it to look at it, switching away from
    // underneath them would be the surprising behaviour.
    expect(resolveActiveBusinessId("business-one", [CLOSED_ONE, TWO])).toBe(
      "business-one",
    );
  });

  it("falls back to the first business when every one of them is closed", () => {
    const closedTwo = business("business-two", "Business Two", { status: "closed" });
    expect(resolveActiveBusinessId(null, [CLOSED_ONE, closedTwo])).toBe(
      "business-one",
    );
  });
});

describe("hasUsableBusiness", () => {
  it("is false when the person has nothing", () => {
    expect(hasUsableBusiness([])).toBe(false);
  });

  it("is false when every business is closed", () => {
    // This is what lets an owner start again instead of being redirected in a
    // circle between the dashboard and onboarding.
    const closedTwo = business("business-two", "Business Two", { status: "closed" });
    expect(hasUsableBusiness([CLOSED_ONE, closedTwo])).toBe(false);
  });

  it("is true for any business that is not closed, including one still in setup", () => {
    expect(hasUsableBusiness([DRAFT_TWO])).toBe(true);
    expect(hasUsableBusiness([CLOSED_ONE, DRAFT_TWO])).toBe(true);
    expect(hasUsableBusiness([ONE])).toBe(true);
  });
});

describe("resolveActiveBusiness", () => {
  it("returns the whole business, not just the id", () => {
    expect(resolveActiveBusiness("business-two", [ONE, TWO])).toEqual(TWO);
  });

  it("returns null when there is nothing to resolve", () => {
    expect(resolveActiveBusiness("business-one", [])).toBeNull();
  });
});
