import { describe, expect, it } from "vitest";

import {
  ALLOWED_EMAIL_OTP_TYPES,
  isAllowedEmailOtpType,
} from "@/features/auth/otp-types";

describe("isAllowedEmailOtpType", () => {
  it("allows the one type this product actually verifies", () => {
    expect(isAllowedEmailOtpType("email")).toBe(true);
  });

  // EmailOtpType includes `(string & {})`, so nothing here is caught by the
  // compiler. The runtime check is the only real control.
  it("rejects every other EmailOtpType value, even though each type-checks", () => {
    expect(isAllowedEmailOtpType("signup")).toBe(false);
    expect(isAllowedEmailOtpType("invite")).toBe(false);
    expect(isAllowedEmailOtpType("magiclink")).toBe(false);
    expect(isAllowedEmailOtpType("recovery")).toBe(false);
    expect(isAllowedEmailOtpType("email_change")).toBe(false);
  });

  it("rejects an arbitrary attacker-supplied string", () => {
    expect(isAllowedEmailOtpType("sql_injection_attempt")).toBe(false);
    expect(isAllowedEmailOtpType("")).toBe(false);
  });

  it("exposes exactly one allowed type", () => {
    expect(ALLOWED_EMAIL_OTP_TYPES).toEqual(["email"]);
  });
});
