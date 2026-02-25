// playwright/tests/catalog.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Product Catalog", () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).loginAsStandardUser();
    inventory = new InventoryPage(page);
    await inventory.goto();
  });

  test("displays 6 products", async () => {
    await inventory.assertPageLoaded();
  });

  test("every product has name, price and button", async ({ page }) => {
    for (const item of await page.locator(".inventory_item").all()) {
      await expect(item.locator(".inventory_item_name")).not.toBeEmpty();
      await expect(item.locator(".inventory_item_price")).toContainText("$");
      await expect(item.locator('[class*="btn_inventory"]')).toBeVisible();
    }
  });

  test("sorts A to Z by default", async () => {
    const names = await inventory.getItemNames();
    expect(names).toEqual([...names].sort());
  });

  test("sorts Z to A", async () => {
    await inventory.sortBy("za");
    const names = await inventory.getItemNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test("sorts by price low to high", async () => {
    await inventory.sortBy("lohi");
    const prices = await inventory.getItemPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("sorts by price high to low", async () => {
    await inventory.sortBy("hilo");
    const prices = await inventory.getItemPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test("navigates to product detail", async ({ page }) => {
    const firstName = (await inventory.getItemNames())[0];
    await inventory.itemNames().first().click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.locator(".inventory_details_name")).toContainText(firstName);
  });
});
