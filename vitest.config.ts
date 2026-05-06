import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/lib/chemistry.ts"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
