import { describe, expect, it } from "vitest";

import {
  BUSINESS_STATUS_LABEL,
  REGISTRATION_STATUS_LABEL,
  deriveBusinessMode,
  shouldShowRegistrationNote,
  type BusinessStatus,
  type RegistrationStatus,
} from "@/features/businesses/business-mode";

const ALL_STATUSES: BusinessStatus[] = [
  "draft",
  "registering",
  "operating",
  "closed",
];

const ALL_REGISTRATION: RegistrationStatus[] = [
  "unknown",
  "not_started",
  "in_progress",
  "complete",
];

describe("deriveBusinessMode", () => {
  it("puts a business that has not opened into Setup mode", () => {
    expect(deriveBusinessMode("draft")).toBe("setup");
    expect(deriveBusinessMode("registering")).toBe("setup");
  });

  it("puts a trading business into Running mode", () => {
    expect(deriveBusinessMode("operating")).toBe("running");
  });

  it("does not let a closed business fall through to Setup mode", () => {
    // A closed business being told "let's get you ready to open" would be the
    // product misreading its own data.
    expect(deriveBusinessMode("closed")).toBe("closed");
  });

  it("covers every lifecycle value", () => {
    for (const status of ALL_STATUSES) {
      expect(["setup", "running", "closed"]).toContain(
        deriveBusinessMode(status),
      );
    }
  });

  it("ignores registration entirely — an informal operator is still Running", () => {
    // The invariant behind "no permit does not mean not operating". If mode
    // ever starts consulting registration, this is the test that should fail.
    expect(deriveBusinessMode("operating")).toBe("running");
    for (const registration of ALL_REGISTRATION) {
      expect(registration).toBeTruthy();
      expect(deriveBusinessMode("operating")).toBe("running");
    }
  });
});

describe("registration wording", () => {
  it("never claims the business is registered, compliant, or approved", () => {
    const forbidden = [
      "compliant",
      "approved",
      "eligible",
      "certified",
      "legally",
    ];

    for (const registration of ALL_REGISTRATION) {
      const text = REGISTRATION_STATUS_LABEL[registration].toLowerCase();
      for (const word of forbidden) {
        expect(text).not.toContain(word);
      }
    }
  });

  it("says what was recorded rather than what is true today", () => {
    // Nothing updates this value until Permits ships (DL-063 item A-5), so
    // every string has to read as a record made during setup.
    expect(REGISTRATION_STATUS_LABEL.not_started).toContain("Recorded during setup");
    expect(REGISTRATION_STATUS_LABEL.in_progress).toContain("Recorded during setup");
    expect(REGISTRATION_STATUS_LABEL.complete).toContain("Recorded during setup");
    expect(REGISTRATION_STATUS_LABEL.unknown).toContain("recorded");
  });

  it("shows the note for everything except a finished registration", () => {
    expect(shouldShowRegistrationNote("unknown")).toBe(true);
    expect(shouldShowRegistrationNote("not_started")).toBe(true);
    expect(shouldShowRegistrationNote("in_progress")).toBe(true);
    expect(shouldShowRegistrationNote("complete")).toBe(false);
  });

  it("has owner-facing wording for every lifecycle value", () => {
    for (const status of ALL_STATUSES) {
      expect(BUSINESS_STATUS_LABEL[status].length).toBeGreaterThan(0);
    }
  });
});
