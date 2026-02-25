// cypress/e2e/catalog/products.cy.js
// @shard2

describe("Product Catalog", () => {
  beforeEach(() => {
    cy.login();
  });

  context("Product listing", () => {
    it("displays 6 products on the inventory page", () => {
      cy.get(".inventory_item").should("have.length", 6);
    });

    it("each product has a name, description, price and add-to-cart button", () => {
      cy.get(".inventory_item").each(($item) => {
        cy.wrap($item).find(".inventory_item_name").should("not.be.empty");
        cy.wrap($item).find(".inventory_item_desc").should("not.be.empty");
        cy.wrap($item).find(".inventory_item_price").should("contain", "$");
        cy.wrap($item).find('[class*="btn_inventory"]').should("be.visible");
      });
    });

    it("all prices are positive numbers", () => {
      cy.get(".inventory_item_price").each(($price) => {
        const value = parseFloat($price.text().replace("$", ""));
        expect(value).to.be.greaterThan(0);
      });
    });
  });

  context("Sorting", () => {
    it("sorts products A to Z by default", () => {
      cy.get(".product_sort_container").should("have.value", "az");
      cy.get(".inventory_item_name").then(($names) => {
        const names = [...$names].map((el) => el.innerText);
        expect(names).to.deep.equal([...names].sort());
      });
    });

    it("sorts products Z to A", () => {
      cy.get(".product_sort_container").select("za");
      cy.get(".inventory_item_name").then(($names) => {
        const names = [...$names].map((el) => el.innerText);
        expect(names).to.deep.equal([...names].sort().reverse());
      });
    });

    it("sorts products by price low to high", () => {
      cy.get(".product_sort_container").select("lohi");
      cy.get(".inventory_item_price").then(($prices) => {
        const prices = [...$prices].map((el) =>
          parseFloat(el.innerText.replace("$", ""))
        );
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sorted);
      });
    });

    it("sorts products by price high to low", () => {
      cy.get(".product_sort_container").select("hilo");
      cy.get(".inventory_item_price").then(($prices) => {
        const prices = [...$prices].map((el) =>
          parseFloat(el.innerText.replace("$", ""))
        );
        const sorted = [...prices].sort((a, b) => b - a);
        expect(prices).to.deep.equal(sorted);
      });
    });
  });

  context("Product detail", () => {
    it("navigates to product detail when clicking a product name", () => {
      cy.get(".inventory_item_name").first().then(($name) => {
        const name = $name.text();
        cy.wrap($name).click();
        cy.url().should("include", "/inventory-item.html");
        cy.get(".inventory_details_name").should("contain", name);
      });
    });

    it("returns to inventory when clicking Back to products", () => {
      cy.get(".inventory_item_name").first().click();
      cy.get('[data-test="back-to-products"]').click();
      cy.url().should("include", "/inventory.html");
    });

    it("can add to cart from product detail page", () => {
      cy.get(".inventory_item_name").first().click();
      cy.get('[data-test="add-to-cart"]').click();
      cy.get(".shopping_cart_badge").should("have.text", "1");
    });
  });
});
