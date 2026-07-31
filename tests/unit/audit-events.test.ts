import { describe, expect, it } from "vitest";

import { buildAuditMetadata } from "@/lib/audit/events";

describe("buildAuditMetadata", () => {
  it("keeps allow-listed scalar values", () => {
    expect(
      buildAuditMetadata({ business_name: "Duo Brew", source: "app" }),
    ).toEqual({ business_name: "Duo Brew", source: "app" });
  });

  // The audit table is never deleted, so anything that lands here lands here
  // permanently.
  it("drops credentials and tokens even when a caller passes them", () => {
    expect(
      buildAuditMetadata({
        business_name: "Duo Brew",
        password: "hunter2",
        access_token: "eyJhbGciOi",
        otp: "123456",
      }),
    ).toEqual({ business_name: "Duo Brew" });
  });

  it("drops personal and tax identifiers", () => {
    expect(
      buildAuditMetadata({
        tin: "123-456-789-000",
        email: "owner@example.test",
        phone: "09171234567",
        full_name: "Ana Dela Cruz",
      }),
    ).toEqual({});
  });

  // A nested object is how an entire form payload ends up in an audit row.
  it("refuses nested objects and arrays", () => {
    expect(
      buildAuditMetadata({
        business_name: { first: "Duo", second: "Brew" },
        entity_label: ["a", "b"],
        source: "app",
      }),
    ).toEqual({ source: "app" });
  });

  it("keeps an explicit null but drops undefined", () => {
    expect(
      buildAuditMetadata({ previous_status: null, next_status: undefined }),
    ).toEqual({ previous_status: null });
  });

  it("returns an empty object for empty input", () => {
    expect(buildAuditMetadata({})).toEqual({});
  });
});
