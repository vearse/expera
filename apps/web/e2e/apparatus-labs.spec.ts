import { test, expect, type Page } from "@playwright/test";

test.setTimeout(90_000);

async function checkInventory(page: Page, path: string, heading: string, item: string) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose an apparatus" })).toBeVisible();
  await page.getByRole("button", { name: item, exact: true }).click();
  await expect(page.getByRole("heading", { name: item, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What it is used for" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to use it" })).toBeVisible();
}

test("physics apparatus inventory shows the full instrument guide", async ({ page }) => {
  await checkInventory(page, "/physics/lab/apparatus", "Physics apparatus laboratory", "Micrometer screw gauge");
  await expect(page.getByText("0.01 mm").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Safety" })).toBeVisible();
});

test("biology apparatus inventory shows the full specimen-material guide", async ({ page }) => {
  await checkInventory(page, "/biology/lab/apparatus", "Biology apparatus laboratory", "Iodine solution");
  await expect(page.getByText(/turns blue-black with starch/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Safety" })).toBeVisible();
});

test("selecting a physics station opens its apparatus guide below the room", async ({ page }) => {
  await page.goto("/physics/lab/measurement");
  await expect(page.locator('[data-lab-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "2D bench" }).click();
  await page.locator('section[aria-label="Practical completion summary"] button').first().click();
  await expect(page.locator("#apparatus-vernier")).toBeVisible();
  await expect(page.locator("#apparatus-vernier").getByRole("heading", { name: "Vernier calipers" })).toBeVisible();
  await expect(page.getByText("The Vernier scale gives the extra digit").first()).toBeVisible();
  await page.locator("#apparatus-vernier").getByRole("button", { name: "Close apparatus guide" }).click();
  await expect(page.locator("#apparatus-vernier")).toHaveCount(0);
});


test("subject hubs link to the new apparatus laboratories", async ({ page }) => {
  await page.goto("/physics?tab=lab");
  await expect(page.getByRole("link", { name: /Open apparatus lab/i })).toHaveAttribute("href", "/physics/lab/apparatus");
  await page.goto("/biology?tab=lab");
  await expect(page.getByRole("link", { name: /Open apparatus lab/i })).toHaveAttribute("href", "/biology/lab/apparatus");
});
