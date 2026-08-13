/**
 * Turns a `create_business_with_owner` failure into something an owner can
 * read.
 *
 * Kept free of any Expo, React Native, or Supabase import for the same reason
 * `resolve-active-business.ts` is: it can then be reasoned about and tested on
 * its own, without the module that constructs the Supabase client — which
 * reads environment variables at import time — being dragged into a unit test.
 *
 * The match is on the message text rather than the SQLSTATE because that is
 * what PostgREST puts in `error.message`, and it is the shape the caller
 * already relied on.
 */

/**
 * Returned unchanged rather than turned into a sentence: no screen shows this
 * to anybody. A missing session means the caller should be sent back to sign
 * in, so it stays a sentinel for the caller to branch on.
 */
export const AUTH_REQUIRED = "auth_required";

export function describeCreateBusinessError(message: string): string {
  if (message.includes("auth_required")) {
    return AUTH_REQUIRED;
  }

  if (message.includes("invalid_business_name")) {
    return "Enter a business name between 2 and 160 characters.";
  }

  // The registered name is optional everywhere it is offered, so this can only
  // be reached by someone who typed something too short or only spaces. It says
  // "leave it blank" because that is a real and permanent answer for many
  // businesses, not a corner the owner has to talk their way out of.
  if (message.includes("invalid_legal_name")) {
    return "Enter a registered name between 2 and 200 characters, or leave it blank.";
  }

  // DL-055 item 7 and DL-059 item 3: this is an abuse ceiling, not pricing,
  // packaging, or a subscription tier, and it must not be worded as one. No
  // upgrade is offered because none exists, and none is planned by the
  // decision that created the limit.
  //
  // The sentence also promises nothing the app can do. Closing a business
  // would free a slot — the database counts only businesses whose status is
  // not `closed` — but there is no way to close one from the app yet: there
  // is no UPDATE grant on `businesses` and no RPC that sets its status. Saying
  // "close one" here would send the owner looking for a control that is not
  // there.
  if (message.includes("business_limit_reached")) {
    return "You can have up to three businesses at a time.";
  }

  return "We could not create that business. Please try again.";
}

/**
 * Turns a `declare_business_status` failure into something an owner can read.
 *
 * The transition rules live in the RPC (DL-063), so these messages describe
 * what happened rather than restating the rules — a second copy here would be
 * one more thing to keep in step with the database.
 */
export function describeStatusChangeError(message: string): string {
  if (message.includes("auth_required")) {
    return AUTH_REQUIRED;
  }

  // A non-member and a business that does not exist arrive here identically,
  // and they must stay identical to the owner too: a distinct "no such
  // business" message would confirm which ids are real.
  if (message.includes("not_a_member")) {
    return "You cannot change this business.";
  }

  // Reachable in ordinary use by tapping the control twice — the second call
  // asks for a transition that has already happened, and the database refuses
  // a no-op so the audit trail never records a change that did not occur. The
  // wording assumes the benign case, because that is the likely one.
  if (message.includes("invalid_status_transition")) {
    return "That change is not available for this business. It may already be open.";
  }

  return "We could not record that change. Please try again.";
}
