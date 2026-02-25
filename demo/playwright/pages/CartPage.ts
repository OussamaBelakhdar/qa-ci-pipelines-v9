// playwright/pages/CartPage.ts
import { Page, expect } from "@playwright/test";

export class CartPage {
  constructor(private page: Page) {}

  get title()       { return this.page.locator(".title"); }
  get cartItems()   { return this.page.locator(".cart_item"); }
  get checkoutBtn() { return this.page.getByTestId("checkout"); }
  get continueBtn() { return this.page.getByTestId("continue-shopping"); }

  removeButton(productName: string) {
    return this.page
      .locator(".cart_item")
      .filter({ hasText: productName })
      .locator('[data-test*="remove"]');
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  async assertPageLoaded() {
    await expect(this.title).toHaveText("Your Cart");
  }

  async assertItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async removeItem(productName: string) {
    await this.removeButton(productName).click();
  }

  async proceedToCheckout() {
    await this.checkoutBtn.click();
  }
}
