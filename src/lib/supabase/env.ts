/**
 * Reads the client-safe Supabase environment variables.
 *
 * Both values are EXPO_PUBLIC_, so Expo inlines them into the shipped app
 * bundle. Nothing secret belongs in this module. In particular the
 * service-role key must never be read here — it bypasses Row Level Security.
 *
 * Missing values fail loudly and by name, because the alternative is a
 * confusing "Invalid URL" error thrown from deep inside the Supabase client.
 */
export function getSupabaseEnv() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment ${
        missing.length === 1 ? "variable" : "variables"
      }: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in the values.`,
    );
  }

  return { url: url as string, publishableKey: publishableKey as string };
}
