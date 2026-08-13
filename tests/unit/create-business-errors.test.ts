import { describe, expect, it } from "vitest";

import {
  AUTH_REQUIRED,
  describeCreateBusinessError,
} from "@/features/businesses/create-business-errors";

// The strings on the left are what PostgREST puts in `error.message` when the
// RPC raises. They are wrapped in surrounding text by PostgREST, which is why
// the function matches on inclusion rather than equality — these fixtures keep
// that wrapping so the test fails if the matching is ever tightened to `===`.
const AUTH = 'unexpected response: auth_required (SQLSTATE 42501)';
const BAD_NAME = 'unexpected response: invalid_business_name (SQLSTATE 22023)';
const AT_LIMIT = 'unexpected response: business_limit_reached (SQLSTATE 53400)';

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

  it("falls back to a plain retry message for anything unrecognised", () => {
    expect(describeCreateBusinessError("connection reset by peer")).toBe(
      "We could not create that business. Please try again.",
    );
    expect(describeCreateBusinessError("")).toBe(
      "We could not create that business. Please try again.",
    );
  });
});
