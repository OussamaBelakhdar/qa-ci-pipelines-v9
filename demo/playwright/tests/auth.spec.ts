// playwright/tests/auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe("Valid credentials", () => {
    test("logs in successfully with standard_user", async ({ page }) => {
      await loginPage.login("standard_user", "secret_sauce");

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator(".title")).toHaveText("Products");
      await expect(page.locator(".inventory_item")).toHaveCount(6);
    });

    test("logs in with performance_glitch_user (slow but works)", async ({ page }) => {
      test.slow(); // extend timeout for this user
      await loginPage.login("performance_glitch_user", "secret_sauce");
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test.describe("Invalid credentials", () => {
    test("shows error for wrong password", async () => {
      await loginPage.login("standard_user", "wrong_password");
      await loginPage.assertErrorContains("Username and password do not match");
    });

    test("shows error for empty username", async ({ page }) => {
      await page.getByTestId("login-button").click();
      await loginPage.assertErrorContains("Username is required");
    });

    test("shows error for empty password", async ({ page }) => {
      await page.getByTestId("username").fill("standard_user");
      await page.getByTestId("login-button").click();
      await loginPage.assertErrorContains("Password is required");
    });

    test("shows error for locked_out_user", async () => {
      await loginPage.login("locked_out_user", "secret_sauce");
      await loginPage.assertErrorContains("Sorry, this user has been locked out");
    });

    test("dismisses error when clicking X button", async () => {
      await loginPage.login("", "");
      await loginPage.assertErrorContains("Username is required");
      await loginPage.dismissError();
    });
  });
});
