import { z } from "zod";

/**
 * Business name rules.
 *
 * These mirror the `businesses_name_length` check constraint exactly --
 * trimmed, between 2 and 160 characters. The database is the authority; this
 * exists so the person filling in the form gets a readable message instead of
 * a Postgres error code.
 */
export const businessNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Use at least 2 characters." })
  .max(160, { message: "Use 160 characters or fewer." });

export const createBusinessSchema = z.object({
  name: businessNameSchema,
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

/**
 * Registered DTI or SEC name rules.
 *
 * Mirrors the `businesses_legal_name_length` check constraint and the guard in
 * `create_business_with_owner`: trimmed, between 2 and 200 characters.
 *
 * Applied only when the owner actually typed something. The field is optional
 * wherever it is offered, and a business with no registered name is a normal,
 * often permanent state — the product records its absence rather than pressing
 * for a value that does not exist yet.
 */
export const legalNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Use at least 2 characters, or leave this blank." })
  .max(200, { message: "Use 200 characters or fewer." });
