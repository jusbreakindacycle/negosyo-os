import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy-client";

/**
 * Next.js 16 Proxy — the file convention that replaced `middleware.ts`.
 *
 * It lives in `src/` rather than the repository root because the app router
 * lives at `src/app`, and the two must sit at the same level.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except static assets. Without a matcher the Proxy also runs
     * for CSS, JS, and images, and an auth redirect would then break the page
     * it was trying to protect.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
