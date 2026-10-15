import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // The real package throws outside a React Server Components bundle.
      "server-only": fileURLToPath(new URL("./test/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // Lets server modules load; unit tests never open a connection.
    env: {
      SKIP_ENV_VALIDATION: "1",
      DATABASE_URL: "postgresql://test@localhost:5432/unused",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret!",
      CRON_SECRET: "test-cron-secret-0123456789",
    },
  },
});
