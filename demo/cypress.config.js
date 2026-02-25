const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://www.saucedemo.com",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "mochawesome-report",
      overwrite: false,
      html: false,
      json: true,
    },
    retries: {
      runMode: 1,       // 1 retry in CI
      openMode: 0,      // no retry in interactive mode
    },
    env: {
      // Default credentials (overridable via env vars)
      STANDARD_USER: "standard_user",
      LOCKED_USER: "locked_out_user",
      PROBLEM_USER: "problem_user",
      PERFORMANCE_USER: "performance_glitch_user",
      PASSWORD: "secret_sauce",
    },
    setupNodeEvents(on, config) {
      // Log test start/end for CI readability
      on("before:run", (details) => {
        console.log(`\n🧪 Cypress run starting`);
        console.log(`   Browser: ${details.browser.name} ${details.browser.version}`);
        console.log(`   Specs:   ${details.specs.length} spec files`);
      });

      on("after:run", (results) => {
        if (results) {
          const rate = ((results.totalPassed / results.totalTests) * 100).toFixed(1);
          console.log(`\n📊 Run complete`);
          console.log(`   Total:  ${results.totalTests}`);
          console.log(`   Passed: ${results.totalPassed}`);
          console.log(`   Failed: ${results.totalFailed}`);
          console.log(`   Rate:   ${rate}%`);
        }
      });
    },
  },
});
