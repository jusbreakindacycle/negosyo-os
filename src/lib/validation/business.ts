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
