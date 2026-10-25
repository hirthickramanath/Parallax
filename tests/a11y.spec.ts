import { test, expect, type Page } from "@playwright/test";
import { signedIn } from "./helpers";

// A dependency-free structural accessibility audit of rendered pages. It catches missing names, labels,
// alt text, landmarks and broken ARIA references. It does NOT check colour contrast, keyboard operation,
// focus order, screen-reader output or zoom/reflow: those still need a manual pass or axe-core.
// Colour contrast and ARIA validity are covered by axe-core in axe.spec.ts.

interface Violation {
  rule: string;
  detail: string;
}

async function audit(page: Page): Promise<Violation[]> {
  return page.evaluate(() => {
    const out: { rule: string; detail: string }[] = [];
    const add = (rule: string, el: Element | string) =>
      out.push({
        rule,
        detail:
          typeof el === "string"
            ? el
            : `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || "").trim().slice(0, 40)}" ${(el.getAttribute("class") || "").slice(0, 50)}`,
      });
    const visible = (el: Element) => {
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") return false;
      return (
        el.getClientRects().length > 0 &&
        !el.closest("[hidden],[aria-hidden='true'],[inert]")
      );
    };
    const text = (id: string) =>
      document.getElementById(id)?.textContent?.trim() || "";
    const nameOf = (el: Element): string => {
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) return labelledby.split(/\s+/).map(text).join(" ").trim();
      const aria = el.getAttribute("aria-label")?.trim();
      if (aria) return aria;
      const own = (el.textContent || "").trim();
      if (own) return own;
      const img = el.querySelector("img[alt]:not([alt=''])");
      if (img) return img.getAttribute("alt") || "";
      const svgTitle = el.querySelector("svg title")?.textContent?.trim();
      if (svgTitle) return svgTitle;
      return el.getAttribute("title")?.trim() || "";
    };

    if (!document.documentElement.lang)
      add("html-lang", "missing lang on <html>");
    if (!document.title.trim()) add("document-title", "empty <title>");
    const mains = [...document.querySelectorAll("main, [role='main']")].filter(
      visible,
    );
    if (mains.length !== 1)
      add("one-main", `found ${mains.length} main landmarks`);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(
      visible,
    );
    if (!headings.some((h) => h.tagName === "H1"))
      add("has-h1", "no visible <h1>");
    let previous = 0;
    for (const h of headings) {
      const level = Number(h.tagName[1]);
      if (previous && level > previous + 1)
        add(
          "heading-order",
          `${h.tagName.toLowerCase()} follows h${previous}: "${(h.textContent || "").trim().slice(0, 40)}"`,
        );
      if (!(h.textContent || "").trim() && !h.querySelector("img[alt]"))
        add("empty-heading", h);
      previous = level;
    }
    for (const el of document.querySelectorAll("button, [role='button']"))
      if (visible(el) && !nameOf(el)) add("button-name", el);
    for (const el of document.querySelectorAll("a")) {
      if (!visible(el)) continue;
      if (!el.getAttribute("href") && el.getAttribute("role") !== "button")
        add("link-href", el);
      if (!nameOf(el)) add("link-name", el);
    }
    for (const img of document.querySelectorAll("img")) {
      if (!visible(img)) continue;
      if (
        !img.hasAttribute("alt") &&
        img.getAttribute("role") !== "presentation"
      )
        add("img-alt", img.getAttribute("src") || "img");
    }
    for (const el of document.querySelectorAll("input, select, textarea")) {
      const type = (el.getAttribute("type") || "").toLowerCase();
      if (
        ["hidden", "submit", "button", "reset", "image"].includes(type) ||
        !visible(el)
      )
        continue;
      const labelled =
        el.hasAttribute("aria-label") ||
        el.hasAttribute("aria-labelledby") ||
        el.closest("label") ||
        (el.id &&
          document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) ||
        el.hasAttribute("title");
      if (
        !labelled ||
        (!nameOf(el) &&
          !el.closest("label") &&
          !(
            el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
          ))
      )
        add(
          "form-label",
          `${el.tagName.toLowerCase()}[type=${type || "text"}] ${el.getAttribute("name") || el.id || ""}`,
        );
    }
    for (const frame of document.querySelectorAll("iframe"))
      if (visible(frame) && !frame.getAttribute("title"))
        add("frame-title", "iframe without title");
    const ids = new Map<string, number>();
    for (const el of document.querySelectorAll("[id]"))
      ids.set(el.id, (ids.get(el.id) || 0) + 1);
    for (const [id, n] of ids)
      if (n > 1) add("duplicate-id", `${id} used ${n} times`);
    for (const el of document.querySelectorAll(
      "[aria-labelledby],[aria-describedby],[aria-controls]",
    )) {
      for (const attr of [
        "aria-labelledby",
        "aria-describedby",
        "aria-controls",
      ]) {
        for (const ref of (el.getAttribute(attr) || "")
          .split(/\s+/)
          .filter(Boolean))
          if (!document.getElementById(ref) && visible(el))
            add("aria-ref", `${attr}="${ref}" on ${el.tagName.toLowerCase()}`);
      }
    }
    return out;
  });
}

const publicPages = ["/login"];
const learnerPages = [
  "/dashboard",
  "/learn",
  "/settings",
  "/plan",
  "/stats",
  "/review",
  "/projects",
  "/placement",
  "/teaching-lab",
  "/lesson/PB1.1",
  "/lesson/AS1.3",
  "/lesson/PB1.4",
];

for (const path of publicPages) {
  test(`structural accessibility audit: ${path} (signed out)`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await audit(page)).toEqual([]);
  });
}

test("structural accessibility audit: signed-in pages", async ({ page }) => {
  await signedIn(page);
  const failures: Record<string, Violation[]> = {};
  for (const path of learnerPages) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const found = await audit(page);
    if (found.length) failures[path] = found;
  }
  expect(failures).toEqual({});
});

test("the audit itself detects the problems it claims to detect", async ({
  page,
}) => {
  await page.setContent(`<!doctype html><html><head></head><body>
    <h1>Title</h1><h3>Skipped</h3>
    <button></button><a>nothing</a><a href="/x"></a><img src="x.png">
    <input type="text" name="unlabelled"><div id="d"></div><div id="d"></div>
    <p aria-labelledby="missing">x</p><iframe></iframe></body></html>`);
  const rules = (await audit(page)).map((v) => v.rule);
  for (const rule of [
    "html-lang",
    "document-title",
    "one-main",
    "heading-order",
    "button-name",
    "link-href",
    "link-name",
    "img-alt",
    "form-label",
    "duplicate-id",
    "frame-title",
  ])
    expect(rules, rule).toContain(rule);
});
