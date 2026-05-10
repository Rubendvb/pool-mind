import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Default environment for pure TS tests.
    // Component tests override with // @vitest-environment jsdom at file top.
    environment: "node",
    coverage: {
      provider: "v8",
      include: [
        "src/lib/chemistry.ts",
        "src/lib/finance.ts",
        "src/lib/logger.ts",
        "src/lib/utils/date.ts",
      ],
      reporter: ["text", "html"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
