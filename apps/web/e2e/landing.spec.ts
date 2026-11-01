import { test, expect } from "@playwright/test";

test.describe("Expera landing page", () => {
  test("introduces the platform and early access", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Science you can");
    await expect(page.getByRole("link", { name: "Join the waitlist" }).first()).toBeVisible();
    await expect(page.locator("#branches")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Integrated STEM learning branches/i })).toBeVisible();
    await page.getByRole("link", { name: /Volumetric and salt analysis/i }).click();
    await expect(page).toHaveURL(/\/chemistry/);
  });
});
