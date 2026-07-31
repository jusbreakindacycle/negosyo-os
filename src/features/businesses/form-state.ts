/**
 * Form state for business creation.
 *
 * Kept out of `actions.ts` because a `"use server"` module may only export
 * async functions.
 */
export type CreateBusinessState = {
  error: string | null;
};

export const initialCreateBusinessState: CreateBusinessState = {
  error: null,
};
