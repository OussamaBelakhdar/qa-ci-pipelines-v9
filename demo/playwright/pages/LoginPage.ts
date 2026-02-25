// playwright/pages/LoginPage.ts
import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  // Locators
  get usernameInput() { return this.page.getByTestId("username"); }
  get passwordInput() { return this.page.getByTestId("password"); }
  get loginButton()   { return this.page.getByTestId("login-button"); }
  get errorMessage()  { return this.page.getByTestId("error"); }
  get errorCloseBtn() { return this.page.getByTestId("error-button"); }

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsStandardUser() {
    await this.login("standard_user", "secret_sauce");
  }

  async assertErrorContains(text: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(text);
  }

  async dismissError() {
    await this.errorCloseBtn.click();
    await expect(this.errorMessage).not.toBeVisible();
  }
}
