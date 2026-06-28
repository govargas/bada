import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    // One in-memory Mongo per file; run files serially to keep it simple.
    fileParallelism: false,
    env: { NODE_ENV: "test", JWT_SECRET: "test-secret" },
    // First run downloads the mongodb-memory-server binary.
    hookTimeout: 120000,
    testTimeout: 30000,
  },
  resolve: {
    // The backend uses NodeNext ESM, so source imports carry a `.js`
    // extension that actually points at a `.ts` file. Map it back for Vitest.
    extensionAlias: { ".js": [".ts", ".js"] },
  },
});
