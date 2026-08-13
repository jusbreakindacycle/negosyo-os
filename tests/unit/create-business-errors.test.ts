import { describe, expect, it } from "vitest";

import {
  AUTH_REQUIRED,
  describeCreateBusinessError,
  describeStatusChangeError,
} from "@/features/businesses/create-business-errors";

// The strings on the left are what PostgREST puts in `error.message` when the
// RPC raises. They are wrapped in surrounding text by PostgREST, which is why
// the function matches on inclusion rather than equality — these fixtures keep
// that wrapping so the test fails if the matching is ever tightened to `===`.
const AUTH = 'unexpected response: auth_required (SQLSTATE 42501)';
const BAD_NAME = 'unexpected response: invalid_business_name (SQLSTATE 22023)';
const AT_LIMIT = 'unexpected response: business_limit_reached (SQLSTATE 53400)';
const BAD_LEGAL_NAME = 'unexpected response: invalid_legal_name (SQLSTATE 22023)';
const NOT_A_MEMBER = 'unexpected response: not_a_member (SQLSTATE 42501)';
const BAD_TRANSITION =
  'unexpected response: invalid_status_transition (SQLSTATE 22023)';

describe("describeCreateBusinessError", () => {
  it("returns the sentinel for a missing session rather than a sentence", () => {
    expect(describeCreateBusinessError(AUTH)).toBe(AUTH_REQUIRED);
  });

  it("explains a rejected business name in terms of the rule that rejected it", () => {
    expect(describeCreateBusinessError(BAD_NAME)).toBe(
      "Enter a business name between 2 and 160 characters.",
    );
  });

  it("explains the three-business ceiling", () => {
    expect(describeCreateBusinessError(AT_LIMIT)).toBe(
      "You can have up to three businesses at a time.",
    );
  });

  // DL-055 item 7 and DL-059 item 3: the ceiling is abuse control, and it must
  // never be presented to an owner as pricing, packaging, or a tier. This
  // asserts the wording directly, because the rule is about what the owner
  // reads and nothing else in the codebase enforces it.
  it("does not word the ceiling as pricing, packaging, or an upgrade", () => {
    const message = describeCreateBusinessError(AT_LIMIT).toLowerCase();

    for (const forbidden of [
      "upgrade",
      "plan",
      "tier",
      "subscribe",
      "subscription",
      "premium",
      "pro",
      "paid",
      "free",
      "billing",
      "trial",
    ]) {
      expect(message).not.toContain(forbidden);
    }
  });

  // The ceiling frees up when a business is closed, but nothing in the app can
  // close one yet — there is no UPDATE grant on `businesses` and no RPC that
  // sets its status. The message must not send the owner looking for a control
  // that does not exist.
  it("does not tell the owner to close a business, which the app cannot do yet", () => {
    expect(describeCreateBusinessError(AT_LIMIT).toLowerCase()).not.toContain(
      "clos",
    );
  });

  it("treats a rejected registered name as optional rather than as a failure", () => {
    // A business with no registered name is a normal and often permanent
    // state, so the message has to offer leaving it blank.
    const message = describeCreateBusinessError(BAD_LEGAL_NAME);

    expect(message).toContain("2 and 200 characters");
    expect(message.toLowerCase()).toContain("blank");
  });

  it("falls back to a plain retry message for anything unrecognised", () => {
    expect(describeCreateBusinessError("connection reset by peer")).toBe(
      "We could not create that business. Please try again.",
    );
    expect(describeCreateBusinessError("")).toBe(
      "We could not create that business. Please try again.",
    );
  });
});

describe("describeStatusChangeError", () => {
  it("returns the sentinel for a missing session rather than a sentence", () => {
    expect(describeStatusChangeError(AUTH)).toBe(AUTH_REQUIRED);
  });

  // The RPC reports a foreign business and a business that does not exist
  // identically, so an id cannot be probed for existence. That property is only
  // preserved if the interface does not undo it with a more specific message.
  it("does not reveal whether the business exists", () => {
    const message = describeStatusChangeError(NOT_A_MEMBER).toLowerCase();

    expect(message).toBe("you cannot change this business.");
    expect(message).not.toContain("not found");
    expect(message).not.toContain("does not exist");
    expect(message).not.toContain("no such");
  });

  it("assumes the benign case for a refused transition", () => {
    // The way an owner actually reaches this is by tapping the control twice.
    // The database refuses a no-op so the audit trail never records a change
    // that did not happen.
    expect(describeStatusChangeError(BAD_TRANSITION)).toBe(
      "That change is not available for this business. It may already be open.",
    );
  });

  it("never presents an owner declaration as a compliance outcome", () => {
    const messages = [
      describeStatusChangeError(NOT_A_MEMBER),
      describeStatusChangeError(BAD_TRANSITION),
      describeStatusChangeError("something else entirely"),
    ];

    for (const message of messages) {
      const text = message.toLowerCase();
      for (const forbidden of ["registered", "compliant", "approved", "permit"]) {
        expect(text).not.toContain(forbidden);
      }
    }
  });

  it("falls back to a plain retry message for anything unrecognised", () => {
    expect(describeStatusChangeError("connection reset by peer")).toBe(
      "We could not record that change. Please try again.",
    );
  });
});
