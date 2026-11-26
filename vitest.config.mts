import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Testes unitários e de componente (Vitest + Testing Library, em jsdom).
 * Os testes E2E ficam em `tests/e2e` e rodam pelo Playwright.
 */
export default defineConfig({
  plugins: [react()],
  // Resolve o alias `@/` do tsconfig (substitui o plugin vite-tsconfig-paths).
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
    restoreMocks: true,
  },
});
