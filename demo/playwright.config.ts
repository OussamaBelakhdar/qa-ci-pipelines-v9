import { defineConfig, devices } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// JSON output path is dynamic per browser when PW_REPORT_FILE is set.
// The CI pipeline (demo-playwright-saucedemo.yml) sets this env var per matrix
// job so chromium, firefox and webkit each write a separate JSON file that
// the report job can later download and merge.
//
// Locally: omit PW_REPORT_FILE → single file "playwright-report/results.json"
// ─────────────────────────────────────────────────────────────────────────────
const jsonOutputFile =
  process.env.PW_REPORT_FILE ?? "playwright-report/results.json";

export default defineConfig({
  testDir: "./playwright/tests",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: jsonOutputFile }],
    ["github"],
    ["allure-playwright", { outputFolder: "allure-results" }],
    ["list"],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    viewport: { width: 1280, height: 720 },
    actionTimeout: 8_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile project intentionally excluded from the default run.
    // All current specs target desktop selectors (.inventory_item, .cart_item…).
    // To enable: tag tests with @mobile and uncomment below.
    // {
    //   name: "mobile-chrome",
    //   use: { ...devices["Pixel 5"] },
    //   grep: /@mobile/,
    // },
  ],

  outputDir: "test-results/",
});
