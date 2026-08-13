import { describe, expect, it } from "vitest";

import { passwordSchema, signInSchema, signUpSchema } from "@/lib/validation/auth";
import { businessNameSchema, legalNameSchema } from "@/lib/validation/business";

describe("signUpSchema", () => {
  it("accepts a valid email and password", () => {
    const result = signUpSchema.safeParse({
      email: "owner@example.test",
      password: "correct horse",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an address that is not an email", () => {
    expect(signUpSchema.safeParse({ email: "owner", password: "correct horse" }).success)
      .toBe(false);
  });

  it("rejects a short password", () => {
    expect(signUpSchema.safeParse({ email: "owner@example.test", password: "short" }).success)
      .toBe(false);
  });

  // Anything past 72 bytes is discarded during bcrypt hashing, so accepting it
  // would suggest a strength the password does not have.
  it("rejects a password beyond bcrypt's effective length", () => {
    expect(passwordSchema.safeParse("x".repeat(72)).success).toBe(true);
    expect(passwordSchema.safeParse("x".repeat(73)).success).toBe(false);
  });

  it("rejects a missing field rather than coercing it", () => {
    expect(signUpSchema.safeParse({ email: "owner@example.test" }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: null, password: null }).success).toBe(false);
  });
});

describe("signInSchema", () => {
  // The rule may have been different when the account was created; rejecting a
  // short password here would lock someone out of their own account.
  it("accepts any non-empty password", () => {
    expect(signInSchema.safeParse({ email: "owner@example.test", password: "old" }).success)
      .toBe(true);
  });

  it("rejects an empty password", () => {
    expect(signInSchema.safeParse({ email: "owner@example.test", password: "" }).success)
      .toBe(false);
  });
});

describe("businessNameSchema", () => {
  // These bounds must stay identical to the businesses_name_length check
  // constraint in the migration, which trims before measuring.
  it("matches the database bounds of 2 to 160 trimmed characters", () => {
    expect(businessNameSchema.safeParse("Du").success).toBe(true);
    expect(businessNameSchema.safeParse("x".repeat(160)).success).toBe(true);

    expect(businessNameSchema.safeParse("D").success).toBe(false);
    expect(businessNameSchema.safeParse("x".repeat(161)).success).toBe(false);
  });

  it("trims before measuring, exactly as btrim does in the constraint", () => {
    expect(businessNameSchema.parse("  Duo Brew  ")).toBe("Duo Brew");
    expect(businessNameSchema.safeParse("   ").success).toBe(false);
    expect(businessNameSchema.safeParse(" D ").success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(businessNameSchema.safeParse("").success).toBe(false);
  });
});

describe("legalNameSchema", () => {
  // These bounds must stay identical to the businesses_legal_name_length check
  // constraint and to the invalid_legal_name guard in
  // create_business_with_owner, both of which trim before measuring.
  it("matches the database bounds of 2 to 200 trimmed characters", () => {
    expect(legalNameSchema.safeParse("Du").success).toBe(true);
    expect(legalNameSchema.safeParse("x".repeat(200)).success).toBe(true);

    expect(legalNameSchema.safeParse("D").success).toBe(false);
    expect(legalNameSchema.safeParse("x".repeat(201)).success).toBe(false);
  });

  it("trims before measuring, exactly as btrim does in the constraint", () => {
    expect(legalNameSchema.parse("  Duo Brew Trading OPC  ")).toBe(
      "Duo Brew Trading OPC",
    );
    expect(legalNameSchema.safeParse("   ").success).toBe(false);
  });

  // The screen skips the field entirely when it is left empty, so the schema
  // never sees a blank. What matters here is that a rejection tells the owner
  // they may leave it out — a business with no registered name is a normal and
  // often permanent state, not an error to be talked out of.
  it("offers leaving it blank when the value is too short", () => {
    const result = legalNameSchema.safeParse("D");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message.toLowerCase()).toContain("blank");
    }
  });
});
