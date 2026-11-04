import { test, expect } from "@playwright/test";

test.describe("Expera landing page", () => {
  test("introduces the platform and early access", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Science is better when you can");
    await expect(page.getByRole("button", { name: "Join the waitlist" }).first()).toBeVisible();
    await expect(page.locator("#reality")).toBeVisible();
    await expect(page.getByRole("heading", { name: /A laboratory should never be out of reach/i })).toBeVisible();
    await expect(page.locator("#curriculum")).toBeVisible();
    await expect(page.getByText("Curricular Domains", { exact: true })).toBeVisible();
    await expect(page.locator("#branches")).toBeVisible();
    await page.getByRole("link", { name: /Launch Chemistry Lab/i }).click();
    await expect(page).toHaveURL(/\/chemistry/);
  });
});
