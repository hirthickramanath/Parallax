import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStream,
  providerDeadline,
} from "../workers/tutor/src/stream.ts";
const encode = (value) => new TextEncoder().encode(value);
test("provider SSE handles split chunks, Unicode and an unterminated final line", async () => {
  const text =
    "data: " +
    JSON.stringify({ response: "λ and " }) +
    "\n\ndata: " +
    JSON.stringify({ response: "orbits" }) +
    "\n\ndata: [DONE]";
  const bytes = encode(text);
  const source = new ReadableStream({
    start(c) {
      for (let i = 0; i < bytes.length; i += 3)
        c.enqueue(bytes.slice(i, i + 3));
      c.close();
    },
  });
  const result = await new Response(normalizeStream(source)).text();
  assert.equal(
    result,
    "data: " +
      JSON.stringify({ text: "λ and " }) +
      "\n\ndata: " +
      JSON.stringify({ text: "orbits" }) +
      "\n\n",
  );
});
test("provider errors are sanitized and never disclose raw details", async () => {
  const source = new ReadableStream({
    start(c) {
      c.enqueue(encode('data: {"error":"private-token-should-not-leak"}\n'));
      c.close();
    },
  });
  const result = await new Response(normalizeStream(source)).text();
  assert.ok(result.includes("Tutor resting"));
  assert.ok(!result.includes("private-token"));
});
test("stream deadline cancels stalled provider and sends a friendly event", async () => {
  let cancelled = false;
  const source = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const result = await new Response(normalizeStream(source, 15)).text();
  assert.ok(cancelled);
  assert.ok(result.includes("timed out"));
});
test("client cancellation cancels the locked provider reader safely", async () => {
  let cancelled = false;
  const source = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const reader = normalizeStream(source).getReader();
  await reader.cancel();
  assert.ok(cancelled);
});
test("provider connection deadline rejects and cancels a late stream", async () => {
  let cancelled = false;
  const late = new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          new ReadableStream({
            cancel() {
              cancelled = true;
            },
          }),
        ),
      20,
    ),
  );
  await assert.rejects(providerDeadline(late, 5), /deadline/);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.ok(cancelled);
});

test("completion diagnostics fire only after a successful nonempty stream", async () => {
  const { normalizeStream } = await import("../workers/tutor/src/stream.ts");
  let count = 0;
  const input = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode('data: {"response":"hello"}\n\n'));
      c.close();
    },
  });
  await new Response(
    normalizeStream(input, 1000, (n) => {
      count = n;
    }),
  ).text();
  assert.equal(count, 5);
  count = 0;
  const failed = new ReadableStream({
    start(c) {
      c.error(Error("private failure"));
    },
  });
  await new Response(
    normalizeStream(failed, 1000, (n) => {
      count = n;
    }),
  ).text();
  assert.equal(count, 0);
});
