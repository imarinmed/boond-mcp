import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "node_modules/",
        "tests/",
        "build/",
        "**/*.d.ts",
        "**/index.ts",
        "src/index.ts",
      ],
      branches: 80,
      lines: 80,
      functions: 80,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
