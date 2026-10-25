import { expect, test } from "@playwright/test";

// The playwright config turns reduced motion on so the intro does not slow every other test.
// These tests turn motion back on to check the intro itself.
test.describe("startup animation", () => {
  test("plays on load and Escape skips it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/login");
    const intro = page.getByRole("dialog", { name: "Parallax is starting" });
    await expect(intro).toBeVisible();
    await expect(intro.getByText("Two views. One distance.")).toBeAttached();
    await page.keyboard.press("Escape");
    await expect(intro).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Welcome to Parallax." }),
    ).toBeVisible();
  });

  test("the Skip button works and every reload plays it again", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/login");
    const intro = page.getByRole("dialog", { name: "Parallax is starting" });
    await intro.getByRole("button", { name: /skip/i }).click();
    await expect(intro).toBeHidden();
    await page.reload();
    await expect(intro).toBeVisible();
  });

  test("ends by itself", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/login");
    const intro = page.getByRole("dialog", { name: "Parallax is starting" });
    await expect(intro).toBeVisible();
    await expect(intro).toBeHidden({ timeout: 8000 });
  });

  test("is not shown when the visitor prefers reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to Parallax." }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Parallax is starting" }),
    ).toHaveCount(0);
  });
});
