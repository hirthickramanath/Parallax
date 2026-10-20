import { test } from "node:test";
import assert from "node:assert/strict";
import {
  providerConfigured,
  tutorProvider,
} from "../workers/tutor/src/provider.ts";
import { normalizeStream } from "../workers/tutor/src/stream.ts";
import { validateRequest, tutorPrompt } from "../workers/tutor/src/core.ts";
test("Gemini adapter uses server header authentication, trusted URL, correct roles and normalized visible text", async () => {
  const env = {
    TUTOR_PROVIDER: "gemini",
    GEMINI_MODEL: "configured-model",
    GEMINI_API_KEY: "test-only-key",
    AI_MODEL: "",
  };
  assert.equal(providerConfigured(env), true);
  let called = 0;
  const stream = await tutorProvider(
    env,
    "Teach with units",
    [
      { role: "user", content: "Why?" },
      { role: "assistant", content: "Try this." },
      { role: "user", content: "Explain." },
    ],
    async (url, init) => {
      called++;
      assert.match(
        url,
        /^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\/configured-model:/,
      );
      assert.ok(!url.includes("test-only-key"));
      assert.equal(init.headers["x-goog-api-key"], "test-only-key");
      const body = JSON.parse(init.body);
      assert.equal(body.systemInstruction.parts[0].text, "Teach with units");
      assert.equal(body.contents[1].role, "model");
      return new Response(
        "data: " +
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    { text: "hidden", thought: true },
                    { text: "Visible λ." },
                  ],
                },
              },
            ],
          }) +
          "\n\n",
      );
    },
  );
  const text = await new Response(normalizeStream(stream)).text();
  assert.ok(text.includes("Visible λ."));
  assert.ok(!text.includes("hidden"));
  assert.equal(called, 1);
});
test("missing or unsafe provider configuration never makes a provider request; upstream errors stay generic", async () => {
  for (const env of [
    { TUTOR_PROVIDER: "gemini", AI_MODEL: "" },
    { TUTOR_PROVIDER: "unknown", AI_MODEL: "x" },
    {
      TUTOR_PROVIDER: "gemini",
      AI_MODEL: "",
      GEMINI_MODEL: "../bad",
      GEMINI_API_KEY: "test",
    },
  ]) {
    assert.equal(providerConfigured(env), false);
    await assert.rejects(
      () =>
        tutorProvider(env, "s", [], () => {
          throw Error("should not call");
        }),
      /not configured/,
    );
  }
  await assert.rejects(
    () =>
      tutorProvider(
        {
          TUTOR_PROVIDER: "gemini",
          AI_MODEL: "",
          GEMINI_MODEL: "model",
          GEMINI_API_KEY: "test",
        },
        "s",
        [],
        async () => new Response("private provider details", { status: 429 }),
      ),
    /^Error: Tutor provider unavailable$/,
  );
});
test("revision tutoring receives the actual revision guide and validates the current step", () => {
  const req = validateRequest({
    lessonId: "MB2.3",
    depth: "full",
    message: "Explain normalization",
    revisionStep: 0,
  });
  const text = tutorPrompt(
    {
      title: "Planes",
      requires: [],
      sections: [{ id: "theory", fullOnly: false, text: "Plane equation" }],
      revisionGuide: {
        terms: [{ term: "normalization", meaning: "divide by length" }],
      },
    },
    req,
  );
  assert.match(text, /divide by length/);
  assert.match(text, /rebuild meaning/);
  assert.match(text, /long gap/);
  assert.throws(() => validateRequest({ ...req, revisionStep: 4 }));
});
test("Gemini header deadline is cleared once streaming starts", async () => {
  let signal;
  const body = await tutorProvider(
    {
      TUTOR_PROVIDER: "gemini",
      GEMINI_API_KEY: "test",
      GEMINI_MODEL: "model",
      AI_MODEL: "",
    },
    "s",
    [],
    async (_, init) => {
      signal = init.signal;
      return new Response(
        new ReadableStream({
          start(c) {
            setTimeout(() => {
              c.enqueue(new TextEncoder().encode("late body"));
              c.close();
            }, 20);
          },
        }),
      );
    },
    5,
  );
  assert.equal(await new Response(body).text(), "late body");
  assert.equal(signal.aborted, false);
});

test("Workers AI receives bounded context and preserves the latest question", async () => {
  const { boundedMessages } = await import("../workers/tutor/src/provider.ts");
  const messages = boundedMessages(
    "Trusted instructions. " + "reference ".repeat(10000),
    [
      ...Array.from({ length: 10 }, (_, i) => ({
        role: i % 2 ? "assistant" : "user",
        content: "old λ ".repeat(2000),
      })),
      { role: "user", content: "Why is the normalization negative?" },
    ],
  );
  assert.ok(
    messages.reduce(
      (n, m) => n + new TextEncoder().encode(m.content).length,
      0,
    ) <= 12000,
  );
  assert.equal(messages.at(-1).content, "Why is the normalization negative?");
  assert.match(messages[0].content, /Trusted instructions/);
  assert.match(messages[0].content, /truncated/);
  let called = false;
  await tutorProvider(
    {
      AI_MODEL: "test",
      AI: {
        run: async (model, input) => {
          called = true;
          assert.equal(input.max_tokens, 1024);
          assert.ok(
            input.messages.reduce((n, m) => n + m.content.length, 0) <= 12000,
          );
          return new ReadableStream({
            start(c) {
              c.close();
            },
          });
        },
      },
    },
    "reference ".repeat(10000),
    [{ role: "user", content: "latest" }],
  );
  assert.equal(called, true);
});
test("provider failures expose only safe actionable categories", async () => {
  const { providerFailure } = await import("../workers/tutor/src/provider.ts");
  for (const [message, code] of [
    ["quota exceeded private-data", "provider_capacity"],
    ["input context too long", "provider_context"],
    ["model not found", "provider_model"],
    ["403 unauthorized", "provider_access"],
    ["Provider deadline exceeded", "provider_timeout"],
    ["some private payload", "provider_unavailable"],
  ]) {
    const failure = providerFailure(Error(message));
    assert.equal(failure.code, code);
    assert.ok(!failure.error.includes("private"));
  }
});

test("provider diagnostics preserve service codes without logging private exception text", async () => {
  const { providerDiagnostic, providerFailure } =
    await import("../workers/tutor/src/provider.ts");
  assert.deepEqual(
    providerDiagnostic({
      name: "AiError",
      message: "Error 5007: internal server error with private question",
      code: 5007,
    }),
    { name: "AiError", reason: "upstream_internal", upstreamCodes: [5007] },
  );
  assert.equal(
    providerDiagnostic(new TypeError("provider.getReader is not a function"))
      .reason,
    "invalid_stream",
  );
  assert.equal(
    providerFailure({ message: "403 forbidden private question" }).code,
    "provider_access",
  );
  assert.ok(
    !JSON.stringify(
      providerDiagnostic({
        name: "private question",
        message: "secret payload",
      }),
    ).includes("secret"),
  );
  assert.deepEqual(providerDiagnostic(null), {
    name: "unknown",
    reason: "unclassified",
    upstreamCodes: [],
  });
});
