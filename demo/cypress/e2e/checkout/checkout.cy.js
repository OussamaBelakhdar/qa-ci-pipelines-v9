// cypress/e2e/checkout/checkout.cy.js
// @shard3

describe("Checkout Flow", () => {
  beforeEach(() => {
    cy.login();
    cy.addToCart("Sauce Labs Backpack");
    cy.addToCart("Sauce Labs Bike Light");
  });

  context("Checkout Step 1 — Information", () => {
    beforeEach(() => {
      cy.get(".shopping_cart_link").click();
      cy.get('[data-test="checkout"]').click();
    });

    it("reaches checkout step one from the cart", () => {
      cy.url().should("include", "/checkout-step-one.html");
      cy.get(".title").should("have.text", "Checkout: Your Information");
    });

    it("shows error when submitting empty form", () => {
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "First Name is required");
    });

    it("shows error when last name is missing", () => {
      cy.get('[data-test="firstName"]').type("John");
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "Last Name is required");
    });

    it("shows error when postal code is missing", () => {
      cy.get('[data-test="firstName"]').type("John");
      cy.get('[data-test="lastName"]').type("Doe");
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="error"]')
        .should("be.visible")
        .and("contain", "Postal Code is required");
    });

    it("proceeds to step 2 when form is valid", () => {
      cy.get('[data-test="firstName"]').type("John");
      cy.get('[data-test="lastName"]').type("Doe");
      cy.get('[data-test="postalCode"]').type("12345");
      cy.get('[data-test="continue"]').click();
      cy.url().should("include", "/checkout-step-two.html");
    });

    it("can cancel and return to cart", () => {
      cy.get('[data-test="cancel"]').click();
      cy.url().should("include", "/cart.html");
    });
  });

  context("Checkout Step 2 — Overview", () => {
    beforeEach(() => {
      cy.get(".shopping_cart_link").click();
      cy.get('[data-test="checkout"]').click();
      cy.get('[data-test="firstName"]').type("John");
      cy.get('[data-test="lastName"]').type("Doe");
      cy.get('[data-test="postalCode"]').type("12345");
      cy.get('[data-test="continue"]').click();
    });

    it("shows order overview with correct number of items", () => {
      cy.url().should("include", "/checkout-step-two.html");
      cy.get(".cart_item").should("have.length", 2);
    });

    it("shows item total, tax and grand total", () => {
      cy.get(".summary_subtotal_label").should("contain", "Item total: $");
      cy.get(".summary_tax_label").should("contain", "Tax: $");
      cy.get(".summary_total_label").should("contain", "Total: $");
    });

    it("grand total equals item total + tax", () => {
      cy.get(".summary_subtotal_label").then(($subtotal) => {
        cy.get(".summary_tax_label").then(($tax) => {
          cy.get(".summary_total_label").then(($total) => {
            const subtotal = parseFloat(
              $subtotal.text().replace("Item total: $", "")
            );
            const tax = parseFloat($tax.text().replace("Tax: $", ""));
            const total = parseFloat($total.text().replace("Total: $", ""));
            expect(total).to.be.closeTo(subtotal + tax, 0.01);
          });
        });
      });
    });
  });

  context("Checkout Completion", () => {
    it("completes the full checkout flow successfully", () => {
      cy.checkout({ firstName: "John", lastName: "Doe", zip: "75001" });

      cy.url().should("include", "/checkout-complete.html");
      cy.get('[data-test="complete-header"]').should(
        "have.text",
        "Thank you for your order!"
      );
      cy.get('[data-test="complete-text"]').should(
        "contain",
        "Your order has been dispatched"
      );
    });

    it("clears cart after successful checkout", () => {
      cy.checkout();
      cy.get(".shopping_cart_badge").should("not.exist");
    });

    it("can return to products after checkout completion", () => {
      cy.checkout();
      cy.get('[data-test="back-to-products"]').click();
      cy.url().should("include", "/inventory.html");
    });
  });
});
