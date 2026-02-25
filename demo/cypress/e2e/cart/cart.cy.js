// cypress/e2e/cart/cart.cy.js
// @shard2

describe("Shopping Cart", () => {
  beforeEach(() => {
    cy.login();
  });

  context("Add to cart", () => {
    it("adds one product and updates cart badge to 1", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.cartCount(1);
    });

    it("adds multiple products and updates cart badge accordingly", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.addToCart("Sauce Labs Bike Light");
      cy.addToCart("Sauce Labs Bolt T-Shirt");
      cy.cartCount(3);
    });

    it("button changes to Remove after adding", () => {
      cy.contains(".inventory_item_name", "Sauce Labs Backpack")
        .parents(".inventory_item")
        .find('[data-test*="add-to-cart"]')
        .click()
        .should("not.exist");

      cy.contains(".inventory_item_name", "Sauce Labs Backpack")
        .parents(".inventory_item")
        .find('[data-test*="remove"]')
        .should("be.visible");
    });
  });

  context("Remove from cart", () => {
    it("removes a product from the inventory page", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.cartCount(1);
      cy.removeFromCart("Sauce Labs Backpack");
      cy.cartCount(0);
    });

    it("removes a product from the cart page", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.get(".shopping_cart_link").click();
      cy.get('[data-test*="remove"]').click();
      cy.get(".cart_item").should("not.exist");
      cy.get(".shopping_cart_badge").should("not.exist");
    });
  });

  context("Cart page", () => {
    it("navigates to cart when clicking cart icon", () => {
      cy.get(".shopping_cart_link").click();
      cy.url().should("include", "/cart.html");
    });

    it("shows empty cart correctly", () => {
      cy.get(".shopping_cart_link").click();
      cy.get(".cart_item").should("not.exist");
    });

    it("shows all added items in cart with correct data", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.addToCart("Sauce Labs Bike Light");
      cy.get(".shopping_cart_link").click();

      cy.get(".cart_item").should("have.length", 2);
      cy.get(".inventory_item_name").should("contain", "Sauce Labs Backpack");
      cy.get(".inventory_item_name").should("contain", "Sauce Labs Bike Light");
    });

    it("persists cart items across navigation", () => {
      cy.addToCart("Sauce Labs Backpack");
      cy.visit("/inventory-item.html?id=4");
      cy.visit("/inventory.html");
      cy.cartCount(1);
    });
  });
});
