import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { createECDH, randomBytes } from "node:crypto";

import {
  allowedPushEndpoint,
  reminderDate,
} from "../workers/reminders/src/core.ts";
test("push endpoints exclude arbitrary HTTPS hosts and reminder windows respect local dates", () => {
  for (const url of [
    "https://fcm.googleapis.com/fcm/send/test",
    "https://updates.push.services.mozilla.com/wpush/v2/example",
    "https://web.push.apple.com/test",
  ])
    assert.equal(allowedPushEndpoint(url), true);
  for (const url of [
    "http://fcm.googleapis.com/test",
    "https://127.0.0.1/test",
    "https://evil.test",
    "https://fcm.googleapis.com.evil.test/x",
    "https://user:pass@fcm.googleapis.com/x",
    "https://fcm.googleapis.com:8443/x",
  ])
    assert.equal(allowedPushEndpoint(url), false);
  assert.deepEqual(
    reminderDate("Asia/Kolkata", "00:15", Date.parse("2026-10-18T18:50:00Z")),
    { date: "2026-10-19", due: true },
  );
  assert.equal(
    reminderDate("UTC", "18:00", Date.parse("2026-10-19T18:31:00Z")).due,
    false,
  );
  assert.deepEqual(
    reminderDate("UTC", "23:59", Date.parse("2026-10-20T00:05:00Z")),
    { date: "2026-10-19", due: true },
  );
  assert.throws(() => reminderDate("bad/timezone", "18:00"));
  assert.throws(() => reminderDate("UTC", "99:00"));
});
test("push registry scopes account subscriptions, rejects unsafe endpoints and encrypts/deduplicates a due notification", async () => {
  const vapid = createECDH("prime256v1");
  vapid.generateKeys();
  const keys = {
      publicKey: vapid.getPublicKey().toString("base64url"),
      privateKey: vapid.getPrivateKey().toString("base64url"),
    },
    ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  const subscription = {
    endpoint: "https://fcm.googleapis.com/fcm/send/test-only",
    expirationTime: null,
    keys: {
      p256dh: ecdh.getPublicKey().toString("base64url"),
      auth: randomBytes(16).toString("base64url"),
    },
  };
  const bundle = await build({
    entryPoints: ["workers/reminders/src/index.ts"],
    bundle: true,
    platform: "browser",
    format: "esm",
    write: false,
  });
  let deliveries = 0,
    hold = false,
    release,
    entered;
  let gate = Promise.resolve();
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: "reminders",
          modules: true,
          script: bundle.outputFiles[0].text,
          compatibilityDate: "2026-10-19",
          durableObjects: {
            REMINDERS: { className: "ReminderRegistry", useSQLite: true },
          },
          bindings: {
            SITE_ORIGIN: "https://parallax-science.pages.dev",
            FIREBASE_PROJECT_ID: "parallax-73",
            ENABLE_REMINDERS: "true",
            VAPID_PUBLIC_KEY: keys.publicKey,
            VAPID_PRIVATE_KEY: keys.privateKey,
            VAPID_SUBJECT: "mailto:test@example.com",
          },
          outboundService: async (request) => {
            if (new URL(request.url).hostname === "fcm.googleapis.com") {
              deliveries++;
              assert.equal(
                request.headers.get("content-encoding"),
                "aes128gcm",
              );
              assert.ok(
                request.headers.get("authorization")?.startsWith("vapid "),
              );
              assert.ok((await request.arrayBuffer()).byteLength > 50);
              if (hold) {
                entered();
                await gate;
              }
              return new Response(null, { status: 201 });
            }
            return new Response(null, { status: 503 });
          },
        },
      ],
    }),
  );
  try {
    assert.equal(
      (
        await mf.dispatchFetch("https://reminders.test/subscription", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await mf.dispatchFetch("https://reminders.test/subscription", {
          method: "POST",
          headers: { Origin: "https://parallax-science.pages.dev" },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await mf.dispatchFetch("https://reminders.test/dispatch", {
          method: "POST",
          headers: { Origin: "https://parallax-science.pages.dev" },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await mf.dispatchFetch("https://reminders.test/test", {
          method: "GET",
          headers: { Origin: "https://parallax-science.pages.dev" },
        })
      ).status,
      405,
    );
    const ns = await mf.getDurableObjectNamespace("REMINDERS", "reminders"),
      registry = ns.get(ns.idFromName("registry"));
    const call = (uid, method, body, path = "subscription") =>
      registry.fetch(`https://registry.test/${path}`, {
        method,
        headers: { "X-Account": uid },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    const date = new Date(),
      time = `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
    const input = { subscription, timezone: "UTC", time, goalMetDate: "" };
    assert.equal(
      (
        await call("owner", "POST", {
          ...input,
          subscription: {
            ...subscription,
            endpoint: "https://127.0.0.1/secret",
          },
        })
      ).status,
      400,
    );
    const response = await call("owner", "POST", input);
    assert.equal(response.status, 200);
    const { id } = await response.json();
    assert.equal(id.length, 64);
    assert.equal((await (await call("other", "GET")).json()).devices.length, 0);
    assert.equal((await (await call("owner", "GET")).json()).devices.length, 1);
    const dispatched = await (
      await call("scheduler", "GET", undefined, "dispatch")
    ).json();
    assert.equal(dispatched.sent, 1, JSON.stringify(dispatched));
    assert.equal(deliveries, 1);
    assert.equal(
      (await (await call("scheduler", "GET", undefined, "dispatch")).json())
        .sent,
      0,
    );
    assert.equal((await call("other", "POST", { id }, "test")).status, 404);
    assert.equal((await call("owner", "POST", { id }, "test")).status, 200);
    assert.equal(deliveries, 2);
    assert.equal((await call("owner", "POST", { id }, "test")).status, 429);
    assert.equal(deliveries, 2);
    await call("other", "DELETE", { id });
    assert.equal((await (await call("owner", "GET")).json()).devices.length, 1);
    await call("owner", "DELETE", { id });
    assert.equal((await (await call("owner", "GET")).json()).devices.length, 0);
    await call("owner", "POST", input);
    hold = true;
    gate = new Promise((resolve) => {
      release = resolve;
    });
    const started = new Promise((resolve) => {
      entered = resolve;
    });
    const sending = call("scheduler", "GET", undefined, "dispatch");
    let timer;
    await Promise.race([
      started,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(Error("Push did not reach mock transport")),
          5000,
        );
      }),
    ]);
    clearTimeout(timer);
    assert.equal(
      (await (await call("scheduler", "GET", undefined, "dispatch")).json())
        .busy,
      true,
    );
    await call("owner", "DELETE", { id });
    release();
    await sending;
    assert.equal((await (await call("owner", "GET")).json()).devices.length, 0);
  } finally {
    await mf.dispose();
  }
});

test("VAPID key tool writes paired protected files outside the checkout without printing the secret", async () => {
  const fs = await import("node:fs"),
    os = await import("node:os"),
    path = await import("node:path"),
    { spawnSync } = await import("node:child_process");
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "parallax-key-test-"),
  );
  try {
    const result = spawnSync(
      process.execPath,
      ["scripts/create-vapid-keys.mjs", directory],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const secret = fs.readFileSync(
        path.join(directory, "vapid-private.txt"),
        "utf8",
      ),
      publicKey = fs.readFileSync(
        path.join(directory, "vapid-public.txt"),
        "utf8",
      );
    assert.equal(
      fs.statSync(path.join(directory, "vapid-private.txt")).mode & 0o777,
      0o600,
    );
    assert.ok(
      !result.stdout.includes(secret),
      "Secret must not appear in output",
    );
    const pair = createECDH("prime256v1");
    pair.setPrivateKey(Buffer.from(secret, "base64url"));
    assert.equal(pair.getPublicKey().toString("base64url"), publicKey);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
