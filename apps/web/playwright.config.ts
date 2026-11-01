import { defineConfig, devices } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHANNEL;
const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "e2e",
  webServer: { command: "npm run dev", url: baseURL, reuseExistingServer: true, timeout: 120_000 },
  use: { baseURL, ...(channel ? { channel } : {}) },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
