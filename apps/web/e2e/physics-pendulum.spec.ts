import { test, expect, type Page } from "@playwright/test";

test.setTimeout(240_000);

async function openLab(page: Page) {
  await page.goto("/physics/lab/pendulum");
  await expect(page.getByRole("heading", { name: "Simple pendulum and oscillations" })).toBeVisible();
  await expect(page.locator('[data-lab-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "2D bench" }).click();
  await expect(page.getByRole("img", { name: /2D laboratory side view/i })).toBeVisible();
}

async function setLength(page: Page, value: string) {
  const field = page.getByLabel("String length in metres");
  await field.fill(value);
  await field.press("Enter");
  await expect(page.getByRole("status")).toContainText(`String length set to ${Number(value).toFixed(2)} m`);
}

async function recordRun(page: Page, row: number) {
  await page.getByRole("button", { name: "Measure effective length" }).click();
  await expect(page.getByRole("status")).toContainText("Effective length recorded as");
  await page.getByRole("button", { name: "Release and time 10 oscillations" }).click();
  const record = page.getByRole("button", { name: "Record row in notebook" });
  await expect(record).toBeEnabled({ timeout: 60_000 });
  await record.click();
  await expect(page.getByRole("status")).toContainText(`Row ${row} recorded:`);
}

async function collectFiveLengths(page: Page) {
  await page.getByRole("button", { name: "Measure release angle" }).click();
  await expect(page.getByRole("status")).toContainText("Protractor reading recorded");
  const lengths = ["0.20", "0.30", "0.40", "0.50", "0.60"];
  for (let index = 0; index < lengths.length; index += 1) {
    await setLength(page, lengths[index]);
    await recordRun(page, index + 1);
  }
}

test("collects five repeated-swing timings, fits T squared against L and persists the notebook", async ({ page }) => {
  await openLab(page);
  await collectFiveLengths(page);

  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.getByText("5/5 lengths", { exact: true })).toBeVisible();

  const analyse = page.getByRole("button", { name: "Plot T² against L and calculate g" });
  await expect(analyse).toBeEnabled();
  await analyse.click();
  await expect(page.getByRole("status")).toContainText("Graph fitted: gradient");
  await expect(page.getByRole("heading", { name: "Gradient and experimental g" })).toBeVisible();
  await expect(page.getByText("Percentage error")).toBeVisible();
  await expect(page.getByText(/r² 0\.99/)).toBeVisible();
  await expect(page.getByText("Practical evidence complete")).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-lab-ready="true"]')).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.getByRole("status")).toContainText("Graph fitted: gradient");
});

test("independent mode withholds procedural hints and the 3D view shares recorded state", async ({ page }) => {
  await openLab(page);
  await setLength(page, "0.70");
  await page.getByRole("button", { name: "Measure effective length" }).click();
  await expect(page.getByText("0.720 m").first()).toBeVisible();

  await page.getByRole("button", { name: "Independent task" }).click();
  await expect(page.getByText("Guided reminders")).toHaveCount(0);
  await expect(page.getByText(/Independent task\. Hints are hidden/)).toBeVisible();

  const lab3d = page.getByRole("button", { name: "3D laboratory" });
  await expect(lab3d).toBeEnabled();
  await lab3d.click();
  await expect(page.locator("canvas")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByLabel(/Interactive 3D simple pendulum laboratory/i)).toBeVisible();
  await expect(page.getByText("0.720 m").first()).toBeVisible();

  await page.getByRole("button", { name: "2D bench" }).click();
  await expect(page.getByRole("button", { name: "2D bench" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: /2D laboratory side view/i })).toBeVisible();
  await expect(page.getByText("0.720 m").first()).toBeVisible();
});

test("Physics hub exposes the pendulum bench and mobile layout does not overflow", async ({ page }) => {
  await page.goto("/physics");
  await expect(page.getByRole("link", { name: /Open pendulum lab/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Simple pendulum and oscillations/i })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page);
  await expect(page.getByRole("region", { name: "Pendulum laboratory room" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Pendulum graphs" })).toBeVisible();
  await expect(page.getByText("Student timing records")).toBeVisible();
  await page.getByRole("button", { name: "Measure effective length" }).click();
  await expect(page.getByRole("status")).toContainText("Effective length recorded as");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
