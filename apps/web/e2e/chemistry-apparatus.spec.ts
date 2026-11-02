import { test, expect } from "@playwright/test";

test.setTimeout(90_000);

test("guided apparatus lab shows in-room step card and hint escalation", async ({ page }) => {
  await page.goto("/chemistry/lab/apparatus/run?mode=guided");
  await expect(page.getByRole("heading", { name: "Apparatus Laboratory" })).toBeVisible();
  await expect(page.getByTestId("guided-step-card")).toBeVisible();
  await expect(page.getByText(/Step 1 of/i)).toBeVisible();
  await page.getByTestId("guided-request-hint").click();
  await expect(page.getByText(/2\/2/)).toBeVisible();
});

test("selecting apparatus in guided mode shows compact in-room guide", async ({ page }) => {
  await page.goto("/chemistry/lab/apparatus/run?mode=guided");
  await page.getByRole("button", { name: /Burette/i }).first().click();
  await expect(page.getByTestId("apparatus-guide-compact")).toBeVisible();
  await expect(page.locator("#apparatus-student-guide")).toBeVisible();
});
