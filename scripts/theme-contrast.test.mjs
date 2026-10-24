// Checks every text and UI colour pair in src/styles/textbook.css against WCAG 2.2 AA,
// in light and dark, for every palette. Add a pair here when you add a token that carries text.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/styles/textbook.css", import.meta.url),
  "utf8",
);

function tokens(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`).exec(css);
  assert.ok(match, `Missing token block for ${selector}`);
  const out = {};
  for (const [, name, value] of match[1].matchAll(
    /--tb-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  ))
    out[name] = value;
  return out;
}

function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const palettes = ["ink", "forest", "cosmic", "ocean", "ember"];
// [foreground, background, minimum ratio, what it is]
const textPairs = [
  ["ink", "paper", 4.5, "body text"],
  ["ink", "surface", 4.5, "text on cards"],
  ["ink", "sunken", 4.5, "text on hover rows"],
  ["ink-2", "paper", 4.5, "secondary text"],
  ["ink-2", "surface", 4.5, "secondary text on cards"],
  ["muted", "paper", 4.5, "labels and captions"],
  ["muted", "surface", 4.5, "labels on cards"],
  ["muted", "sunken", 4.5, "labels on hover rows"],
  ["ink", "accent-soft", 4.5, "text on practice boxes"],
  ["ink-2", "accent-soft", 4.5, "labels on practice boxes"],
  ["ink", "worked", 4.5, "text on worked examples"],
  ["ink-2", "worked", 4.5, "labels on worked examples"],
  ["accent", "paper", 4.5, "links and active place"],
  ["accent", "surface", 4.5, "links on cards"],
  ["accent", "accent-soft", 4.5, "links on practice boxes"],
  ["on-accent", "accent", 4.5, "tutor button text"],
  ["on-accent", "accent-hover", 4.5, "tutor button hover text"],
  ["paper", "ink", 4.5, "primary button text"],
  ["ok", "ok-bg", 4.5, "correct label"],
  ["ink", "ok-bg", 4.5, "correct explanation"],
  ["bad", "bad-bg", 4.5, "wrong label"],
  ["ink", "bad-bg", 4.5, "wrong explanation"],
  ["gold", "paper", 3, "streak and star icons"],
  ...["maths", "physics", "chemistry", "computing", "astro"].map((k) => [
    "on-track",
    `trk-${k}`,
    4.5,
    `text on the ${k} unit banner`,
  ]),
];
const uiPairs = [
  ["line", "paper", 3, "input and button borders"],
  ["line", "surface", 3, "input borders on cards"],
  ["accent", "paper", 3, "focus ring"],
  ["accent", "surface", 3, "focus ring on cards"],
  ...["maths", "physics", "chemistry", "computing", "astro"].map((k) => [
    `trk-${k}`,
    "paper",
    3,
    `${k} lesson node against the page`,
  ]),
];

for (const theme of ["light", "dark"]) {
  for (const palette of palettes) {
    test(`${theme} theme, ${palette} palette meets WCAG AA contrast`, () => {
      const base = tokens(theme === "light" ? ":root" : ':root[data-theme="dark"]');
      const lightOverride =
        palette === "ink" ? {} : tokens(`:root[data-palette="${palette}"]`);
      const resolved = { ...base };
      if (theme === "light") Object.assign(resolved, lightOverride);
      else if (palette !== "ink")
        Object.assign(
          resolved,
          tokens(`:root[data-theme="dark"][data-palette="${palette}"]`),
        );
      const failures = [];
      for (const [fg, bg, min, what] of [...textPairs, ...uiPairs]) {
        assert.ok(resolved[fg], `token --tb-${fg} is missing`);
        assert.ok(resolved[bg], `token --tb-${bg} is missing`);
        const ratio = contrast(resolved[fg], resolved[bg]);
        if (ratio < min)
          failures.push(
            `${what}: --tb-${fg} ${resolved[fg]} on --tb-${bg} ${resolved[bg]} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
          );
      }
      assert.deepEqual(failures, []);
    });
  }
}

test("the accent is never a feedback colour", () => {
  for (const selector of [":root", ':root[data-theme="dark"]']) {
    const t = tokens(selector);
    assert.notEqual(t.accent, t.ok);
    assert.notEqual(t.accent, t.bad);
  }
});
