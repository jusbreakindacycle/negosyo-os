import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-1")).toBe("px-2 py-1");
  });

  it("lets a later Tailwind class win over an earlier conflicting one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps non-conflicting Tailwind classes together", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
