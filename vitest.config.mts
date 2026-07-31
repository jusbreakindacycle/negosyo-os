import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Node environment only. Component tests will need a DOM environment;
    // that dependency is added in the milestone that first requires it.
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
