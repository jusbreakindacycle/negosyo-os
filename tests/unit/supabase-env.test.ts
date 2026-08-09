import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSupabaseEnv } from "@/lib/supabase/env";

const URL_VAR = "EXPO_PUBLIC_SUPABASE_URL";
const KEY_VAR = "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

describe("getSupabaseEnv", () => {
  let original: Record<string, string | undefined>;

  beforeEach(() => {
    original = { [URL_VAR]: process.env[URL_VAR], [KEY_VAR]: process.env[KEY_VAR] };
    delete process.env[URL_VAR];
    delete process.env[KEY_VAR];
  });

  afterEach(() => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("returns both values when they are set", () => {
    process.env[URL_VAR] = "https://example.supabase.co";
    process.env[KEY_VAR] = "publishable-key";

    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "publishable-key",
    });
  });

  it("names every missing variable", () => {
    expect(() => getSupabaseEnv()).toThrow(URL_VAR);
    expect(() => getSupabaseEnv()).toThrow(KEY_VAR);
  });

  it("names only the variable that is actually missing", () => {
    process.env[URL_VAR] = "https://example.supabase.co";

    expect(() => getSupabaseEnv()).toThrow(KEY_VAR);
    expect(() => getSupabaseEnv()).not.toThrow(URL_VAR);
  });
});
