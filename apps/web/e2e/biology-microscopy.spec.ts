import { test, expect, type Page } from "@playwright/test";

test.setTimeout(60_000);

async function placeLabel(page: Page, text: string, x: number, y: number) {
  const field = page.locator('svg[role="application"]');
  await page.getByPlaceholder("e.g. Cell wall").fill(text);
  await page.getByRole("button", { name: "Place label", exact: true }).click();
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  if (!box) throw new Error("drawing field not found");
  await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
}

test("completes an onion epidermis observation, drawing and notebook entry", async ({ page }) => {
  await page.goto("/biology/lab/microscopy");
  await expect(page.getByRole("heading", { name: "Cells and microscopy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prepare a wet mount" })).toBeVisible();

  await page.getByRole("button", { name: /LED compound light microscope/ }).click();
  await page.getByRole("button", { name: "Eyepiece", exact: true }).click();
  await expect(page.getByText(/Contains the ocular lens/)).toBeVisible();

  await page.getByRole("button", { name: "Take sample: Peel a thin epidermal layer" }).click();
  await page.getByRole("button", { name: "Mount sample: Mount the peel" }).click();
  await page.getByRole("button", { name: "Apply stain: Add iodine solution" }).click();
  await page.getByRole("button", { name: "Add coverslip: Lower the coverslip" }).click();
  await expect(page.getByText("Slide ready").first()).toBeVisible();

  await page.getByRole("button", { name: "Place prepared slide on stage" }).click();
  await page.getByRole("button", { name: "Secure clips" }).click();
  await page.getByRole("button", { name: "Raise the stage using the coarse adjustment" }).click();
  for (let i = 0; i < 10; i += 1) {
    await page.getByRole("button", { name: "Raise the stage using the fine adjustment" }).click();
  }

  await expect(page.getByText("Specimen in view").first()).toBeVisible();
  await page.getByRole("button", { name: "Record this observation" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Observation recorded" })).toBeVisible();

  const field = page.locator('svg[role="application"]');
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  if (!box) throw new Error("drawing field not found");
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.28, { steps: 6 });
  await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.58, { steps: 6 });
  await page.mouse.up();

  await placeLabel(page, "Cell wall", 0.5, 0.16);
  await placeLabel(page, "Nucleus", 0.52, 0.48);
  await page.getByRole("button", { name: "Save notebook entry" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Notebook entry saved and complete" })).toBeVisible();
});

test("mobile layout exposes controls and the 2D fallback uses the same state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/biology/lab/microscopy");
  await expect(page.getByRole("heading", { name: "Cells and microscopy" })).toBeVisible();

  await page.getByRole("button", { name: "2D bench" }).click();
  await expect(page.getByRole("img", { name: /2D biology laboratory bench/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "2D bench" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Take sample: Peel a thin epidermal layer" }).click();
  await expect(page.getByText("1/4 steps").first()).toBeVisible();

  await page.getByRole("button", { name: "Exam Preparation" }).click();
  await expect(page.getByText("Hints for this practical")).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
