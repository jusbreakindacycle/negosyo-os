import { describe, expect, it } from "vitest";

import {
  resolveActiveBusiness,
  resolveActiveBusinessId,
  type BusinessSummary,
} from "@/features/businesses/resolve-active-business";

const ONE: BusinessSummary = { id: "business-one", name: "Business One" };
const TWO: BusinessSummary = { id: "business-two", name: "Business Two" };

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
});

describe("resolveActiveBusiness", () => {
  it("returns the whole business, not just the id", () => {
    expect(resolveActiveBusiness("business-two", [ONE, TWO])).toEqual(TWO);
  });

  it("returns null when there is nothing to resolve", () => {
    expect(resolveActiveBusiness("business-one", [])).toBeNull();
  });
});
