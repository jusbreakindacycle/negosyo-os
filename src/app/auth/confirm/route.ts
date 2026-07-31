import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for the link in a Supabase confirmation email.
 *
 * Inert when the project has email confirmation switched off — nothing links
 * here in that case. It exists so the application works under either project
 * setting without anyone having to change an Auth setting to match the code.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    redirect("/sign-in?confirm=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    // The token is never echoed back into the URL.
    redirect("/sign-in?confirm=expired");
  }

  redirect("/onboarding");
}
