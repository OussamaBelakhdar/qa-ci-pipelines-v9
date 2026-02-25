// cypress/support/e2e.js
import "./commands";

// Suppress uncaught exception from saucedemo (vendor scripts)
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver") || err.message.includes("Script error")) {
    return false;
  }
});
