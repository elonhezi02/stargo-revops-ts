import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3102", headless: true },
  webServer: {
    command: `LLM_PROVIDER=rules PORT=3102 DATABASE_PATH=runtime/browser-${Date.now()}.sqlite npm start`,
    url: "http://127.0.0.1:3102/api/health",
    reuseExistingServer: false,
  },
  timeout: 30000,
});
