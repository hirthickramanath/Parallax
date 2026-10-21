import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const headers = fs.readFileSync("public/_headers", "utf8");

test("every inline script in index.html is allowed by the CSP hash in public/_headers", () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(inline.length >= 1, "expected the inline theme script");
  for (const [, body] of inline) {
    const hash = "sha256-" + createHash("sha256").update(body).digest("base64");
    assert.ok(
      headers.includes(`'${hash}'`),
      `public/_headers must allow the inline script with 'sha256-…' ${hash}`,
    );
  }
});

test("security headers keep framing, sniffing and transport protections", () => {
  for (const line of [
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Strict-Transport-Security:",
    "Referrer-Policy:",
    "Permissions-Policy:",
    "Content-Security-Policy",
  ])
    assert.ok(headers.includes(line), `missing ${line}`);
  // Opener isolation would break the Firebase sign-in popup.
  assert.ok(!/Cross-Origin-Opener-Policy:\s*same-origin\s*$/m.test(headers));
});
