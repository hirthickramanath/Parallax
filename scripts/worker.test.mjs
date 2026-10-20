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

test("authenticated tutoring grounds revision and continues past fifty requests without a daily quota", async () => {
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
  const token = await new SignJWT({ auth_time: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: "RS256", kid: "tutor-test" })
    .setSubject("learner")
    .setAudience("parallax-73")
    .setIssuer("https://securetoken.google.com/parallax-73")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
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
    const call = (body) =>
      mf.dispatchFetch("https://worker.test", {
        method: "POST",
        headers: {
          Origin: "https://parallax-science.pages.dev",
          Authorization: "Bearer " + token,
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
    for (let i = 1; i < 55; i++) {
      const result = await call(body);
      assert.equal(result.status, 200);
      await result.text();
    }
    assert.equal(providerCalls, 55);
  } finally {
    await mf.dispose();
  }
});
