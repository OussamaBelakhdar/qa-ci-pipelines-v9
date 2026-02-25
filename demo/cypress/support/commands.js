// cypress/support/commands.js
// Custom commands for Saucedemo test suite

/**
 * Login with credentials
 * @example cy.login('standard_user', 'secret_sauce')
 * @example cy.login() — uses default standard_user
 */
Cypress.Commands.add("login", (username, password) => {
  // Fallback chain: argument → Cypress.env → hardcoded default
  // Hardcoded defaults are safe: saucedemo.com is a public test site
  const user = username || Cypress.env("STANDARD_USER") || "standard_user";
  const pass = password || Cypress.env("PASSWORD") || "secret_sauce";

  cy.session([user, pass], () => {
    cy.visit("/");
    cy.get('[data-test="username"]').type(user);
    cy.get('[data-test="password"]').type(pass);
    cy.get('[data-test="login-button"]').click();
    cy.url().should("include", "/inventory.html");
  });
});

/**
 * Add a product to cart by name
 * @example cy.addToCart('Sauce Labs Backpack')
 */
Cypress.Commands.add("addToCart", (productName) => {
  cy.contains(".inventory_item_name", productName)
    .parents(".inventory_item")
    .find('[class*="btn_inventory"]')
    .click();
});

/**
 * Remove a product from cart by name
 */
Cypress.Commands.add("removeFromCart", (productName) => {
  cy.contains(".inventory_item_name", productName)
    .parents(".inventory_item")
    .find('[class*="btn_inventory"]')
    .click();
});

/**
 * Complete the full checkout flow
 * @example cy.checkout({ firstName: 'John', lastName: 'Doe', zip: '12345' })
 */
Cypress.Commands.add("checkout", ({ firstName, lastName, zip } = {}) => {
  cy.get('[data-test="shopping-cart-link"]').click();
  cy.get('[data-test="checkout"]').click();
  cy.get('[data-test="firstName"]').type(firstName || "John");
  cy.get('[data-test="lastName"]').type(lastName || "Doe");
  cy.get('[data-test="postalCode"]').type(zip || "12345");
  cy.get('[data-test="continue"]').click();
  cy.get('[data-test="finish"]').click();
  cy.get('[data-test="complete-header"]').should(
    "contain",
    "Thank you for your order"
  );
});

/**
 * Assert cart badge count
 * @example cy.cartCount(3)
 */
Cypress.Commands.add("cartCount", (expected) => {
  if (expected === 0) {
    cy.get(".shopping_cart_badge").should("not.exist");
  } else {
    cy.get(".shopping_cart_badge").should("have.text", String(expected));
  }
});
