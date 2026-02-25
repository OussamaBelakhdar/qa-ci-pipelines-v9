// playwright/pages/InventoryPage.ts
import { Page, expect } from "@playwright/test";

export class InventoryPage {
  constructor(private page: Page) {}

  get title()        { return this.page.locator(".title"); }
  get items()        { return this.page.locator(".inventory_item"); }
  get sortDropdown() { return this.page.locator(".product_sort_container"); }
  get cartBadge()    { return this.page.locator(".shopping_cart_badge"); }
  get cartLink()     { return this.page.locator(".shopping_cart_link"); }

  itemNames()  { return this.page.locator(".inventory_item_name"); }
  itemPrices() { return this.page.locator(".inventory_item_price"); }

  addToCartButton(productName: string) {
    return this.page
      .locator(".inventory_item")
      .filter({ hasText: productName })
      .locator('[class*="btn_inventory"]');
  }

  async goto() {
    await this.page.goto("/inventory.html");
  }

  async assertPageLoaded() {
    await expect(this.title).toHaveText("Products");
    await expect(this.items).toHaveCount(6);
  }

  async addToCart(productName: string) {
    await this.addToCartButton(productName).click();
  }

  async sortBy(option: "az" | "za" | "lohi" | "hilo") {
    await this.sortDropdown.selectOption(option);
  }

  async getItemNames(): Promise<string[]> {
    return this.itemNames().allInnerTexts();
  }

  async getItemPrices(): Promise<number[]> {
    const texts = await this.itemPrices().allInnerTexts();
    return texts.map((t) => parseFloat(t.replace("$", "")));
  }

  async assertCartBadge(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
