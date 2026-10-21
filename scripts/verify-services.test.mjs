import { test } from "node:test";
import assert from "node:assert/strict";
import { probes, runProbes } from "./verify-services.mjs";

const urls = { site: "https://site.example", tutor: "https://tutor.example", push: "https://push.example" };

/** A stand-in for the deployed services that follows the documented access rules. */
function healthy(url, init = {}) {
  const origin = init.headers?.Origin;
  const u = new URL(url);
  const headers = new Headers();
  if (u.host === "site.example") return new Response("{}", { status: 200 });
  if (origin !== urls.site) return new Response("{}", { status: 403 });
  headers.set("Access-Control-Allow-Origin", urls.site);
  if (init.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (u.host === "push.example" && u.pathname !== "/subscription") return new Response("{}", { status: 404, headers });
  return new Response("{}", { status: 401, headers });
}

test("a healthy deployment passes every probe", async () => {
  const results = await runProbes(probes(urls), async (u, i) => healthy(u, i));
  assert.ok(results.length >= 8);
  assert.deepEqual(results.filter((r) => !r.ok), []);
});

test("the probes fail when an access rule is lost or a service is down", async () => {
  const open = await runProbes(probes(urls), async (u, i) => {
    const r = healthy(u, i);
    return i?.headers?.Origin === "https://evil.example" ? new Response(null, { status: 204 }) : r;
  });
  assert.ok(open.some((r) => !r.ok && /other origins/.test(r.name)));
  const revived = await runProbes(probes(urls), async (u, i) => (u.endsWith("/test") ? new Response("{}", { status: 200 }) : healthy(u, i)));
  assert.ok(revived.some((r) => !r.ok && /\/test/.test(r.name)));
  const down = await runProbes(probes(urls), async () => {
    throw new TypeError("network");
  });
  assert.ok(down.every((r) => !r.ok));
});
