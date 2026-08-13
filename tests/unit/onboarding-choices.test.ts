import { describe, expect, it } from "vitest";

import {
  ENTRY_CHOICES,
  findEntryChoice,
  resolveRegistrationStatus,
} from "@/features/businesses/onboarding-choices";

describe("entry choices", () => {
  it("offers exactly the four owner realities", () => {
    expect(ENTRY_CHOICES.map((c) => c.id)).toEqual([
      "preparing",
      "registering",
      "operating_registered",
      "operating_informal",
    ]);
  });

  it("marks only the two trading answers as operating", () => {
    // These two are what produce Running mode server-side. If a not-yet-open
    // choice ever sets this, a business that has not opened would be told to
    // start recording daily takings.
    expect(findEntryChoice("preparing").isOperating).toBe(false);
    expect(findEntryChoice("registering").isOperating).toBe(false);
    expect(findEntryChoice("operating_registered").isOperating).toBe(true);
    expect(findEntryChoice("operating_informal").isOperating).toBe(true);
  });

  it("fixes the registration answer only where the choice already implies one", () => {
    expect(findEntryChoice("preparing").registrationStatus).toBe("not_started");
    expect(findEntryChoice("operating_registered").registrationStatus).toBe("complete");
    expect(findEntryChoice("registering").registrationStatus).toBeNull();
    expect(findEntryChoice("operating_informal").registrationStatus).toBeNull();
  });

  it("asks the follow-up question only where the answer is genuinely open", () => {
    for (const choice of ENTRY_CHOICES) {
      if (choice.registrationStatus === null) {
        expect(choice.registrationOptions.length).toBeGreaterThan(0);
      } else {
        expect(choice.registrationOptions).toEqual([]);
      }
    }
  });

  it("lets the owner decline every follow-up question", () => {
    // Declining is a real answer, and it has to remain one: `unknown` exists
    // precisely so a missing fact is recorded as missing.
    for (const choice of ENTRY_CHOICES) {
      if (choice.registrationOptions.length > 0) {
        expect(choice.registrationOptions.map((o) => o.value)).toContain("unknown");
      }
    }
  });

  it("only asks for a registered name where one could plausibly exist", () => {
    // Asking a business that has filed nothing for its DTI name is asking it to
    // invent one.
    expect(findEntryChoice("preparing").asksLegalName).toBe(false);
    expect(findEntryChoice("operating_informal").asksLegalName).toBe(false);
    expect(findEntryChoice("registering").asksLegalName).toBe(true);
    expect(findEntryChoice("operating_registered").asksLegalName).toBe(true);
  });

  it("throws on an unknown choice rather than guessing one", () => {
    // @ts-expect-error deliberately invalid, to prove it is not silently coerced
    expect(() => findEntryChoice("something_else")).toThrow();
  });
});

describe("resolveRegistrationStatus", () => {
  it("uses the fixed answer when the choice has one", () => {
    expect(
      resolveRegistrationStatus(findEntryChoice("preparing"), null),
    ).toBe("not_started");
    expect(
      resolveRegistrationStatus(findEntryChoice("operating_registered"), null),
    ).toBe("complete");
  });

  it("uses the follow-up answer when the owner gave one", () => {
    expect(
      resolveRegistrationStatus(findEntryChoice("registering"), "complete"),
    ).toBe("complete");
    expect(
      resolveRegistrationStatus(findEntryChoice("operating_informal"), "in_progress"),
    ).toBe("in_progress");
  });

  it("records unknown rather than guessing when the follow-up went unanswered", () => {
    expect(
      resolveRegistrationStatus(findEntryChoice("registering"), null),
    ).toBe("unknown");
    expect(
      resolveRegistrationStatus(findEntryChoice("operating_informal"), null),
    ).toBe("unknown");
  });

  it("never produces a lifecycle status", () => {
    // The client must not compute `draft`, `registering`, or `operating`: the
    // mapping is authoritative inside create_business_with_owner (DL-063), and
    // a second copy here would be free to disagree with it. This module may
    // only ever emit a registration value.
    const registrationValues = ["unknown", "not_started", "in_progress", "complete"];

    for (const choice of ENTRY_CHOICES) {
      expect(registrationValues).toContain(
        resolveRegistrationStatus(choice, null),
      );
      for (const option of choice.registrationOptions) {
        expect(registrationValues).toContain(
          resolveRegistrationStatus(choice, option.value),
        );
      }
    }
  });
});
