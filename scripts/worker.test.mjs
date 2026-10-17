import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
test("Worker rejects untrusted origins and missing authentication; atomic counter permits exactly 50 concurrent calls", async () => {
  const bundle = await build({
    entryPoints: ["workers/tutor/src/index.ts"],
    bundle: true,
    format: "esm",
    write: false,
    platform: "browser",
  });
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: "tutor",
          modules: true,
          script: bundle.outputFiles[0].text,
          compatibilityDate: "2026-10-17",
          durableObjects: {
            COUNTERS: { className: "DailyCounter", useSQLite: true },
          },
          bindings: {
            SITE_ORIGIN: "https://parallax-science.pages.dev",
            FIREBASE_PROJECT_ID: "parallax-73",
            ENABLE_TUTOR: "false",
            AI_MODEL: "unused",
          },
        },
      ],
    }),
  );
  try {
    const denied = await mf.dispatchFetch("https://worker.test", {
      method: "POST",
      headers: { Origin: "https://evil.test" },
    });
    assert.equal(denied.status, 403);
    const unauth = await mf.dispatchFetch("https://worker.test", {
      method: "POST",
      headers: { Origin: "https://parallax-science.pages.dev" },
    });
    assert.equal(unauth.status, 401);
    const options = await mf.dispatchFetch("https://worker.test", {
      method: "OPTIONS",
      headers: { Origin: "https://parallax-science.pages.dev" },
    });
    assert.equal(options.status, 204);
    assert.equal(
      options.headers.get("access-control-allow-origin"),
      "https://parallax-science.pages.dev",
    );
    const namespace = await mf.getDurableObjectNamespace("COUNTERS", "tutor"),
      counter = namespace.get(namespace.idFromName("test-user"));
    const results = await Promise.all(
      Array.from({ length: 75 }, () =>
        counter
          .fetch("https://counter.test", {
            method: "POST",
            body: JSON.stringify({ day: "2026-10-17", limit: 50 }),
          })
          .then((r) => r.json()),
      ),
    );
    assert.equal(results.filter((r) => r.allowed).length, 50);
    assert.equal(results.filter((r) => !r.allowed).length, 25);
    const next = await counter
      .fetch("https://counter.test", {
        method: "POST",
        body: JSON.stringify({ day: "2026-10-18", limit: 50 }),
      })
      .then((r) => r.json());
    assert.equal(next.allowed, true);
    assert.equal(next.remaining, 49);
  } finally {
    await mf.dispose();
  }
});
