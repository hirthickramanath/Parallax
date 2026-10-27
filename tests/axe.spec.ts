import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { signedIn } from "./helpers";

// axe-core checks what the structural audit in a11y.spec.ts cannot: colour contrast, ARIA validity and
// target sizes. Motion is reduced so the startup animation does not sit over the page.
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const publicPages = ["/", "/login"];
const learnerPages = [
  "/dashboard",
  "/learn",
  "/review",
  "/stats",
  "/settings",
  "/projects",
  "/lesson/PB1.1",
  "/lesson/CB1.1",
];

async function violations(page: Page) {
  // The session check shows a loader until Firebase answers; audit the page, not the loader.
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1:visible").first()).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(tags).analyze();
  return result.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    nodes: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
  }));
}

for (const scheme of ["light", "dark"] as const) {
  test(`axe: public pages (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const found: Record<string, unknown> = {};
    for (const path of publicPages) {
      await page.goto(path);
      const v = await violations(page);
      if (v.length) found[path] = v;
    }
    expect(found).toEqual({});
  });

  test(`axe: signed-in pages (${scheme})`, async ({ page }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ colorScheme: scheme });
    await signedIn(page);
    const found: Record<string, unknown> = {};
    for (const path of learnerPages) {
      await page.goto(path);
      const v = await violations(page);
      if (v.length) found[path] = v;
    }
    expect(found).toEqual({});
  });
}
