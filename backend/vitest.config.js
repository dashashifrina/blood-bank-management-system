import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Use forks pool with a single fork to prevent MongoDB connection conflicts
    pool: "forks",
    singleFork: true,
    // Run test files sequentially
    sequence: {
      concurrent: false,
    },
  },
});
