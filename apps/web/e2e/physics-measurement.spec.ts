import { test, expect, type Page } from "@playwright/test";

test.setTimeout(90_000);

async function openLab(page: Page) {
  await page.goto("/physics/lab/measurement");
  await expect(page.getByRole("heading", { name: "Measurement and errors" })).toBeVisible();
  await expect(page.locator('[data-lab-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "2D bench" }).click();
  await expect(page.getByRole("img", { name: /2D isometric physics laboratory bench/i })).toBeVisible();
}

async function recordAndSave(page: Page, observation: string, conclusion: string) {
  await page.getByRole("button", { name: "Record reading in notebook" }).click();
  await expect(page.getByRole("status").filter({ hasText: "added to your notebook draft" })).toBeVisible();
  await page.getByLabel("Observation").fill(observation);
  await page.getByLabel("Conclusion").fill(conclusion);
  await page.getByRole("button", { name: "Save station evidence" }).click();
}

test("completes the Vernier station and persists the notebook evidence", async ({ page }) => {
  await openLab(page);

  await page.getByRole("button", { name: "Close gently on the rod" }).click();
  await expect(page.getByText("2.34 cm").first()).toBeVisible();
  await expect(page.getByText("23.0 mm").first()).toBeVisible();

  await recordAndSave(
    page,
    "I closed the Vernier jaws gently on the aluminium rod and read the main scale and coinciding division.",
    "The observed length is 2.34 cm with a Vernier least count of 0.1 mm.",
  );

  await expect(page.getByRole("status").filter({ hasText: "Vernier calipers saved. Station complete." })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Saved and verified" })).toBeVisible();
  await expect(page.getByText("1 of 6 stations verified")).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 of 6 stations verified")).toBeVisible();
  await expect(page.getByLabel("Observation")).toHaveValue(/aluminium rod/);
  await expect(page.getByRole("tab", { name: /Vernier/ })).toContainText("✓");
});

test("micrometer zero error is corrected and independent mode withholds hints", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: "Independent assessment" }).click();
  await expect(page.getByText("The thimble has 50 divisions")).toHaveCount(0);

  await page.getByRole("tab", { name: "Micrometer" }).click();
  await page.getByRole("button", { name: "Use the ratchet on the gauge" }).click();
  await expect(page.getByText("5.76 mm").first()).toBeVisible();
  await expect(page.getByText("5.78 mm").first()).toBeVisible();

  await page.getByRole("button", { name: "Record reading in notebook" }).click();
  await page.getByLabel("Observation").fill("The sleeve and thimble gave an observed thickness that needed the positive zero-error correction.");
  await page.getByLabel("Conclusion").fill("The corrected thickness is 5.76 mm after subtracting 0.02 mm.");
  await page.getByRole("button", { name: "Save station evidence" }).click();

  await expect(page.getByRole("status").filter({ hasText: "Micrometer screw gauge saved. Station complete." })).toBeVisible();
  await expect(page.getByText("Independent assessment breakdown")).toBeVisible();
  await expect(page.getByText("1/6 complete")).toBeVisible();
  await expect(page.getByText("The thimble has 50 divisions")).toHaveCount(0);

  await page.getByRole("button", { name: "Guided practice" }).click();
  await expect(page.getByText("The thimble has 50 divisions")).toBeVisible();
});

test("3D and 2D views share the same instrument state", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: "Close gently on the rod" }).click();

  const lab3d = page.getByRole("button", { name: "3D laboratory" });
  await expect(lab3d).toBeEnabled();
  await lab3d.click();
  await expect(page.locator("canvas")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByLabel(/Interactive isometric 3D Physics laboratory/i)).toBeVisible();

  await page.getByRole("button", { name: "2D bench" }).click();
  await expect(page.getByText("2.34 cm").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "2D bench" })).toHaveAttribute("aria-pressed", "true");
});

test("density station calculates both densities", async ({ page }) => {
  await openLab(page);
  await page.getByRole("tab", { name: "Density" }).click();

  await page.getByRole("button", { name: "Measure diameter" }).click();
  await page.getByRole("button", { name: "Measure height" }).click();
  await page.getByRole("button", { name: "Weigh solid" }).click();
  await page.getByRole("button", { name: "Weigh empty cylinder" }).click();
  await page.getByRole("button", { name: "Weigh filled cylinder" }).click();

  await expect(page.getByText("2.70 g/cm³").first()).toBeVisible();
  await expect(page.getByText("1.26 g/cm³").first()).toBeVisible();

  await recordAndSave(
    page,
    "I measured the cylinder dimensions and massed both the solid and the liquid-filled measuring cylinder.",
    "The solid density is 2.70 g/cm3 and the liquid density is 1.26 g/cm3.",
  );
  await expect(page.getByRole("status").filter({ hasText: "Density of solids and liquids saved. Station complete." })).toBeVisible();
});

test("mobile layout exposes the room, workbench and notebook without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page);

  await expect(page.getByRole("region", { name: "Measurement workbench" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Physics laboratory notebook" })).toBeVisible();
  await page.getByRole("tab", { name: "Parallax" }).click();
  await page.getByRole("button", { name: "Align eye with pointer" }).click();
  await expect(page.getByText("No parallax shift").first()).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
