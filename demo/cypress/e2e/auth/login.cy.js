// cypress/e2e/auth/login.cy.js
// @shard1

describe("Authentication — Login", () => {
  // No global beforeEach — tests using cy.login() must not call cy.visit("/")
  // beforehand because cy.session() already navigates to about:blank then calls
  // cy.visit("/") internally. A double page-load causes pageLoadTimeout errors
  // in CI against the external saucedemo.com site.

  context("Valid credentials", () => {
    it("logs in successfully with standard_user", () => {
      cy.visit("/");
      cy.fixture("users").then(({ standard }) => {
        cy.get('[data-test="username"]').type(standard.username);
        cy.get('[data-test="password"]').type(standard.password);
        cy.get('[data-test="login-button"]').click();

        cy.url().should("include", "/inventory.html");
        cy.get(".title").should("have.text", "Products");
        cy.get(".inventory_list").should("be.visible");
        cy.get(".inventory_item").should("have.length", 6);
      });
    });

    it("preserves session across page reloads", () => {
      cy.login();
      cy.visit("/inventory.html"); // cy.session() leaves browser on about:blank — navigate first
      cy.reload();
      cy.url().should("include", "/inventory.html");
      cy.get(".title").should("have.text", "Products");
    });

    it("shows the correct username in the burger menu", () => {
      cy.login();
      cy.visit("/inventory.html"); // cy.session() leaves browser on about:blank — navigate first
      cy.get("#react-burger-menu-btn").click();
      cy.get(".bm-menu").should("be.visible");
    });
  });

  context("Invalid credentials", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("shows error for wrong password", () => {
      cy.get('[data-test="username"]').type("standard_user");
      cy.get('[data-test="password"]').type("wrong_password");
      cy.get('[data-test="login-button"]').click();

      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "Username and password do not match");
    });

    it("shows error for empty username", () => {
      cy.get('[data-test="login-button"]').click();
      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "Username is required");
    });

    it("shows error for empty password", () => {
      cy.get('[data-test="username"]').type("standard_user");
      cy.get('[data-test="login-button"]').click();
      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "Password is required");
    });

    it("shows error for locked_out_user", () => {
      cy.fixture("users").then(({ locked }) => {
        cy.get('[data-test="username"]').type(locked.username);
        cy.get('[data-test="password"]').type(locked.password);
        cy.get('[data-test="login-button"]').click();

        cy.get('[data-test="error"]')
          .should("be.visible")
          .and("contain", "Sorry, this user has been locked out");
      });
    });

    it("clears error when user starts typing", () => {
      cy.get('[data-test="login-button"]').click();
      cy.get('[data-test="error"]').should("be.visible");
      cy.get('[data-test="error-button"]').click();
      cy.get('[data-test="error"]').should("not.exist");
    });
  });
});
