import { test, expect } from "@playwright/test";

test("chemistry hub has four tabs", async ({ page }) => {
  await page.goto("/chemistry?tab=learn");
  const learn = page.locator('a[href="/chemistry?tab=learn"]');
  const lab = page.locator('a[href="/chemistry?tab=lab"]');
  const practice = page.locator('a[href="/chemistry?tab=practice"]');
  const exam = page.locator('a[href="/chemistry?tab=exam"]');

  await expect(learn).toBeVisible();
  await expect(learn).toHaveAttribute("aria-current", "page");
  await expect(lab).toBeVisible();
  await expect(practice).toBeVisible();
  await expect(exam).toBeVisible();

  await lab.click();
  await expect(lab).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Acid-base titration laboratory" }).first()).toBeVisible();
});
