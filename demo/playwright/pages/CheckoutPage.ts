// playwright/pages/CheckoutPage.ts
import { Page, expect } from "@playwright/test";

export class CheckoutPage {
  constructor(private page: Page) {}

  // Step 1 — Information
  get firstNameInput() { return this.page.getByTestId("firstName"); }
  get lastNameInput()  { return this.page.getByTestId("lastName"); }
  get zipInput()       { return this.page.getByTestId("postalCode"); }
  get continueBtn()    { return this.page.getByTestId("continue"); }
  get cancelBtn()      { return this.page.getByTestId("cancel"); }
  get errorMsg()       { return this.page.getByTestId("error"); }

  // Step 2 — Overview
  get subtotalLabel()  { return this.page.locator(".summary_subtotal_label"); }
  get taxLabel()       { return this.page.locator(".summary_tax_label"); }
  get totalLabel()     { return this.page.locator(".summary_total_label"); }
  get finishBtn()      { return this.page.getByTestId("finish"); }

  // Confirmation
  get completeHeader() { return this.page.getByTestId("complete-header"); }
  get completeText()   { return this.page.getByTestId("complete-text"); }
  get backBtn()        { return this.page.getByTestId("back-to-products"); }

  async fillInformation(firstName: string, lastName: string, zip: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipInput.fill(zip);
    await this.continueBtn.click();
  }

  async assertErrorContains(text: string) {
    await expect(this.errorMsg).toBeVisible();
    await expect(this.errorMsg).toContainText(text);
  }

  async completeOrder() {
    await this.finishBtn.click();
  }

  async assertOrderComplete() {
    await expect(this.completeHeader).toHaveText("Thank you for your order!");
    await expect(this.completeText).toContainText("Your order has been dispatched");
  }

  async extractPrices(): Promise<{ subtotal: number; tax: number; total: number }> {
    const subText = await this.subtotalLabel.innerText();
    const taxText = await this.taxLabel.innerText();
    const totText = await this.totalLabel.innerText();

    const parse = (text: string) =>
      parseFloat(text.replace(/[^0-9.]/g, ""));

    return {
      subtotal: parse(subText),
      tax:      parse(taxText),
      total:    parse(totText),
    };
  }
}
