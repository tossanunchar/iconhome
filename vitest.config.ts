import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "**/.next/**", "**/dist/**"],
    globals: true,
  },
});
