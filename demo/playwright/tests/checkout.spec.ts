// playwright/tests/checkout.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";

test.describe("Shopping Cart & Checkout", () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsStandardUser();
    inventory = new InventoryPage(page);
    await inventory.goto();
  });

  test.describe("Cart operations", () => {
    test("adds product and shows cart badge 1", async () => {
      await inventory.addToCart("Sauce Labs Backpack");
      await inventory.assertCartBadge(1);
    });

    test("adds 3 products and shows cart badge 3", async () => {
      await inventory.addToCart("Sauce Labs Backpack");
      await inventory.addToCart("Sauce Labs Bike Light");
      await inventory.addToCart("Sauce Labs Bolt T-Shirt");
      await inventory.assertCartBadge(3);
    });

    test("removes product from cart page", async ({ page }) => {
      await inventory.addToCart("Sauce Labs Backpack");
      const cart = new CartPage(page);
      await cart.goto();
      await cart.assertItemCount(1);
      await cart.removeItem("Sauce Labs Backpack");
      await cart.assertItemCount(0);
      await inventory.assertCartBadge(0);
    });
  });

  test.describe("Checkout flow", () => {
    test.beforeEach(async () => {
      await inventory.addToCart("Sauce Labs Backpack");
      await inventory.addToCart("Sauce Labs Bike Light");
    });

    test("shows error for empty checkout form", async ({ page }) => {
      await inventory.cartLink.click();
      await new CartPage(page).proceedToCheckout();
      const checkout = new CheckoutPage(page);
      await checkout.continueBtn.click();
      await checkout.assertErrorContains("First Name is required");
    });

    test("completes full checkout successfully", async ({ page }) => {
      await inventory.cartLink.click();
      await new CartPage(page).proceedToCheckout();
      const checkout = new CheckoutPage(page);
      await checkout.fillInformation("John", "Doe", "75001");
      await checkout.completeOrder();
      await checkout.assertOrderComplete();
    });

    test("grand total equals subtotal plus tax", async ({ page }) => {
      await inventory.cartLink.click();
      await new CartPage(page).proceedToCheckout();
      const checkout = new CheckoutPage(page);
      await checkout.fillInformation("John", "Doe", "75001");
      const { subtotal, tax, total } = await checkout.extractPrices();
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    test("cart is empty after successful checkout", async ({ page }) => {
      await inventory.cartLink.click();
      await new CartPage(page).proceedToCheckout();
      const checkout = new CheckoutPage(page);
      await checkout.fillInformation("John", "Doe", "75001");
      await checkout.completeOrder();
      await inventory.assertCartBadge(0);
    });
  });
});
