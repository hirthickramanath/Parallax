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

test("signed-in pages, lessons and unknown routes update the title", async ({
  page,
}) => {
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

// A page chunk that fails to download (flaky network, or a deploy that replaced the file) must not leave a blank page.
test("a failed page chunk shows a recoverable message", async ({ page }) => {
  await signedIn(page);
  await page.route("**/assets/Stats-*.js", (route) => route.abort());
  await page.goto("/stats");
  await expect(page.getByRole("alert")).toContainText("This page did not load");
  await expect(
    page.getByRole("button", { name: "Reload the page" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
  // Other pages still work, so the failure is contained to the route.
  await page.unroute("**/assets/Stats-*.js");
  await page.goto("/settings");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});
