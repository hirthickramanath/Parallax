import { test, expect } from "@playwright/test";
import { signedIn } from "./helpers";

// Every route gets its own document title, so tabs, history and screen readers can tell pages apart (WCAG 2.4.2).
test("public pages have distinct titles", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Parallax/);
  const home = await page.title();
  await page.goto("/login");
  await expect(page).toHaveTitle(/^Sign in — Parallax$/);
  expect(await page.title()).not.toBe(home);
});

test("signed-in pages, lessons and unknown routes update the title", async ({ page }) => {
  await signedIn(page);
  await page.goto("/learn");
  await expect(page).toHaveTitle("Course map — Parallax");
  await page.goto("/settings");
  await expect(page).toHaveTitle("Settings — Parallax");
  await page.goto("/lesson/AS1.1");
  await expect(page.locator("h1").first()).toBeVisible();
  const heading = (await page.locator("h1").first().innerText()).trim();
  await expect(page).toHaveTitle(`${heading} — Parallax`);
  await page.goto("/no-such-page");
  await expect(page).toHaveTitle("Page not found — Parallax");
});
