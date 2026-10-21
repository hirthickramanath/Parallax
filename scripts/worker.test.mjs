import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
test("Worker rejects untrusted origins and missing authentication without exposing a daily cap", async () => {
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
  } finally {
    await mf.dispose();
  }
});

test("authenticated tutoring grounds revision and enforces a per-learner burst limit without a fixed daily quota", async () => {
  const { generateKeyPair, exportJWK, SignJWT } = await import("jose");
  const { publicKey, privateKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: "tutor-test",
    alg: "RS256",
    use: "sig",
  };
  const sign = (subject) =>
    new SignJWT({ auth_time: Math.floor(Date.now() / 1000) })
      .setProtectedHeader({ alg: "RS256", kid: "tutor-test" })
      .setSubject(subject)
      .setAudience("parallax-73")
      .setIssuer("https://securetoken.google.com/parallax-73")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
  const token = await sign("learner");
  const bundle = await build({
    entryPoints: ["workers/tutor/src/index.ts"],
    bundle: true,
    format: "esm",
    write: false,
    platform: "browser",
  });
  let providerCalls = 0;
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: "gemini-tutor",
          modules: true,
          script: bundle.outputFiles[0].text,
          compatibilityDate: "2026-10-17",
          durableObjects: {
            COUNTERS: { className: "DailyCounter", useSQLite: true },
          },
          bindings: {
            SITE_ORIGIN: "https://parallax-science.pages.dev",
            FIREBASE_PROJECT_ID: "parallax-73",
            ENABLE_TUTOR: "true",
            TUTOR_PROVIDER: "gemini",
            AI_MODEL: "",
            GEMINI_MODEL: "test-model",
            GEMINI_API_KEY: "test-only",
          },
          outboundService: async (request) => {
            const u = new URL(request.url);
            if (u.hostname === "www.googleapis.com")
              return Response.json({ keys: [jwk] });
            if (u.pathname === "/content/MB2.3.json")
              return Response.json({
                title: "Planes",
                requires: ["MB4.2"],
                sections: [
                  {
                    id: "theory",
                    fullOnly: false,
                    text: "Normalize a vector.",
                  },
                ],
                revisionGuide: {
                  terms: [{ term: "norm", meaning: "divide by length" }],
                },
              });
            if (u.hostname === "generativelanguage.googleapis.com") {
              providerCalls++;
              assert.equal(request.headers.get("x-goog-api-key"), "test-only");
              const body = await request.json();
              assert.match(
                body.systemInstruction.parts[0].text,
                /divide by length/,
              );
              assert.match(
                body.systemInstruction.parts[0].text,
                /guided practice/,
              );
              return new Response(
                "data: " +
                  JSON.stringify({
                    candidates: [
                      {
                        content: {
                          parts: [{ text: "Check the vector length first." }],
                        },
                      },
                    ],
                  }) +
                  "\n\n",
              );
            }
            throw Error("Unexpected external call");
          },
        },
      ],
    }),
  );
  try {
    const call = (body, bearer = token) =>
      mf.dispatchFetch("https://worker.test", {
        method: "POST",
        headers: {
          Origin: "https://parallax-science.pages.dev",
          Authorization: "Bearer " + bearer,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    const body = {
      lessonId: "MB2.3",
      depth: "full",
      revisionStep: 3,
      message: "I forgot normalization",
    };
    assert.equal((await call({ ...body, revisionStep: 99 })).status, 400);
    const first = await call(body);
    assert.equal(first.status, 200);
    assert.match(await first.text(), /vector length/);
    assert.equal(first.headers.get("x-tutor-remaining"), null);
    // Ten requests per minute per learner are allowed; invalid requests are not counted.
    for (let i = 1; i < 10; i++) {
      const result = await call(body);
      assert.equal(result.status, 200);
      await result.text();
    }
    assert.equal(providerCalls, 10);
    const limited = await call(body);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) >= 1);
    const detail = await limited.json();
    assert.equal(detail.code, "rate_limited");
    assert.match(detail.error, /usage limit/);
    assert.equal(providerCalls, 10, "a limited request must not reach the provider");
    // The limit is per learner: another account is unaffected.
    const other = await call(body, await sign("other-learner"));
    assert.equal(other.status, 200);
    await other.text();
    assert.equal(providerCalls, 11);
  } finally {
    await mf.dispose();
  }
});
