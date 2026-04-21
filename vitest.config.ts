import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for component tests (DOM APIs needed)
    environment: "jsdom",

    // Global test setup file
    setupFiles: ["tests/setup.ts"],

    // Include test files
    include: ["**/*.test.ts", "**/*.test.tsx"],

    // Globals: describe, it, expect without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],

      // Files to check coverage
      include: [
        "lib/**/*.ts",
        "lib/**/*.tsx",
        "features/**/*.ts",
        "features/**/*.tsx",
        "shared/**/*.ts",
        "shared/**/*.tsx",
      ],

      // Exclude non-testable files
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/types.ts",
        "**/types/**",
        "**/schemas/index.ts", // Zod schemas, covered via validation tests
        "**/*.stories.ts",
        "**/*.stories.tsx",
      ],

      // Thresholds (adjust based on your team's standards)
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },

    // Timeout for async tests
    testTimeout: 10_000,

    // Hook timeout
    hookTimeout: 10_000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "server-only": path.resolve(__dirname, "./tests/fixtures/server-only.ts"),
    },
  },
});
