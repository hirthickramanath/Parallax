import {
  buildPushPayload,
  type PushSubscription,
} from "@block65/webcrypto-web-push";
import { assessmentUser } from "../../assessment/src/auth";
import { allowedPushEndpoint, reminderDate } from "./core";
interface Env {
  SITE_ORIGIN: string;
  FIREBASE_PROJECT_ID: string;
  ENABLE_REMINDERS: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
  REMINDERS: DurableObjectNamespace;
}
interface Device {
  id: string;
  subscription: PushSubscription;
  lastSentDate?: string;
  lastTestAt?: number;
  lastAttemptAt?: number;
  attemptDate?: string;
  attempts?: number;
}
interface User {
  timezone: string;
  time: string;
  goalMetDate: string;
  devices: Device[];
}
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export class ReminderRegistry {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    if (path === "/dispatch") {
      let attempted = 0,
        sent = 0,
        failed = 0,
        lastError = "";
      if (
        this.env.ENABLE_REMINDERS !== "true" ||
        !this.env.VAPID_PRIVATE_KEY ||
        !this.env.VAPID_PUBLIC_KEY ||
        !this.env.VAPID_SUBJECT
      )
        return json({ sent: 0, configured: false });
      const leaseId = crypto.randomUUID();
      const acquired = await this.state.storage.transaction(async (tx) => {
        const lease = await tx.get<{ id: string; until: number }>(
          "dispatch-lease",
        );
        if (lease && lease.until > Date.now()) return false;
        await tx.put("dispatch-lease", {
          id: leaseId,
          until: Date.now() + 600000,
        });
        return true;
      });
      if (!acquired) return json({ sent: 0, busy: true });
      try {
        const users = await this.state.storage.list<User>({
          prefix: "user:",
          limit: 50,
        });
        for (const [key, user] of users) {
          const originalIds = new Set(user.devices.map((d) => d.id));
          const local = reminderDate(user.timezone, user.time);
          if (!local.due || user.goalMetDate === local.date) continue;
          for (const device of [...user.devices]) {
            if (attempted >= 40) break;
            if (
              device.lastSentDate === local.date ||
              (device.lastAttemptAt &&
                Date.now() - device.lastAttemptAt < 240000) ||
              (device.attemptDate === local.date && (device.attempts || 0) >= 3)
            )
              continue;
            attempted++;
            device.attempts =
              device.attemptDate === local.date
                ? (device.attempts || 0) + 1
                : 1;
            device.attemptDate = local.date;
            device.lastAttemptAt = Date.now();
            let stage = "encryption";
            try {
              const payload = await buildPushPayload(
                {
                  data: {
                    title: "A little curiosity, today",
                    body: "Your next science question is waiting.",
                    url: "/dashboard",
                  },
                  options: {
                    ttl: 900,
                    urgency: "normal",
                    topic: "parallax-study",
                  },
                },
                device.subscription,
                {
                  subject: this.env.VAPID_SUBJECT,
                  publicKey: this.env.VAPID_PUBLIC_KEY,
                  privateKey: this.env.VAPID_PRIVATE_KEY,
                },
              );
              stage = "transport";
              const result = await fetch(device.subscription.endpoint, {
                ...payload,
                redirect: "manual",
                signal: AbortSignal.timeout(10000),
              });
              if (result.ok) {
                device.lastSentDate = local.date;
                sent++;
              } else if ([404, 410].includes(result.status))
                user.devices = user.devices.filter((d) => d.id !== device.id);
            } catch (error) {
              failed++;
              lastError =
                error instanceof Error ? stage + ":" + error.name : "Error";
              /* Bounded retry on a later cron tick; never log endpoints/keys. */
            }
          }
          // Preserve preferences/unsubscriptions changed while network delivery awaited.
          await this.state.storage.transaction(async (tx) => {
            const latest = await tx.get<User>(key);
            if (!latest) return;
            latest.devices = latest.devices
              .filter(
                (d) =>
                  !originalIds.has(d.id) ||
                  user.devices.some((sent) => sent.id === d.id),
              )
              .map((d) => {
                const sent = user.devices.find((s) => s.id === d.id);
                if (!sent) return d;
                return {
                  ...d,
                  lastSentDate: sent.lastSentDate,
                  lastAttemptAt: sent.lastAttemptAt,
                  attemptDate: sent.attemptDate,
                  attempts: sent.attempts,
                };
              });
            await tx.put(key, latest);
          });
        }
        return json({ sent, attempted, failed, lastError });
      } finally {
        await this.state.storage.transaction(async (tx) => {
          const lease = await tx.get<{ id: string }>("dispatch-lease");
          if (lease?.id === leaseId) await tx.delete("dispatch-lease");
        });
      }
    }
    const uid = request.headers.get("X-Account");
    if (!uid) return json({ error: "No account" }, 401);
    const key = `user:${uid}`;
    if (request.method === "GET") {
      const user = await this.state.storage.get<User>(key);
      return json({ devices: user?.devices.map((d) => d.id) || [] });
    }
    const text = await request.text();
    if (text.length > 8192) return json({ error: "Request too large" }, 413);
    let body: any;
    try {
      body = JSON.parse(text);
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw Error();
    } catch {
      return json({ error: "Invalid request" }, 400);
    }
    if (path === "/test") {
      if (request.method !== "POST")
        return json({ error: "Method not allowed" }, 405);
      if (!/^[a-f0-9]{64}$/.test(body.id || ""))
        return json({ error: "Choose a subscribed browser" }, 400);
      if (
        this.env.ENABLE_REMINDERS !== "true" ||
        !this.env.VAPID_PRIVATE_KEY ||
        !this.env.VAPID_PUBLIC_KEY ||
        !this.env.VAPID_SUBJECT
      )
        return json({ error: "Background reminders are not activated" }, 503);
      const item = await this.state.storage.transaction(async (tx) => {
        const user = await tx.get<User>(key),
          device = user?.devices.find((d) => d.id === body.id);
        if (!user || !device) return { device: null, status: 404 };
        if (device.lastTestAt && Date.now() - device.lastTestAt < 60000)
          return { device: null, status: 429 };
        device.lastTestAt = Date.now();
        await tx.put(key, user);
        return { device, status: 200 };
      });
      if (!item.device)
        return json(
          {
            error:
              item.status === 429
                ? "Wait one minute before another test"
                : "This browser is not subscribed",
          },
          item.status,
        );
      try {
        const payload = await buildPushPayload(
          {
            data: {
              title: "Parallax reminders are connected",
              body: "This is your test notification. Your daily reminder follows your saved local time.",
              url: "/dashboard",
            },
            options: { ttl: 120, urgency: "normal", topic: "parallax-test" },
          },
          item.device.subscription,
          {
            subject: this.env.VAPID_SUBJECT,
            publicKey: this.env.VAPID_PUBLIC_KEY,
            privateKey: this.env.VAPID_PRIVATE_KEY,
          },
        );
        const result = await fetch(item.device.subscription.endpoint, {
          ...payload,
          redirect: "manual",
          signal: AbortSignal.timeout(10000),
        });
        return result.ok
          ? json({ accepted: true })
          : json(
              {
                error:
                  "Push service rejected the test. Re-enable reminders for this browser.",
              },
              502,
            );
      } catch {
        return json({ error: "Test notification could not be sent" }, 503);
      }
    }
    if (request.method === "DELETE") {
      await this.state.storage.transaction(async (tx) => {
        const user = await tx.get<User>(key);
        if (!user) return;
        user.devices = user.devices.filter((d) => d.id !== body.id);
        if (user.devices.length) await tx.put(key, user);
        else await tx.delete(key);
      });
      return json({ removed: true });
    }
    if (!["POST", "PATCH"].includes(request.method))
      return json({ error: "Method not allowed" }, 405);
    try {
      reminderDate(body.timezone, body.time);
    } catch {
      return json({ error: "Choose a valid timezone and time" }, 400);
    }
    if (
      body.goalMetDate !== "" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(body.goalMetDate || "")
    )
      return json({ error: "Invalid goal date" }, 400);
    let subscription: PushSubscription | undefined = body.subscription,
      id = "";
    if (request.method === "POST") {
      if (
        !subscription ||
        !allowedPushEndpoint(subscription.endpoint) ||
        !/^[A-Za-z0-9_-]{87}$/.test(subscription.keys?.p256dh || "") ||
        !/^[A-Za-z0-9_-]{22}$/.test(subscription.keys?.auth || "")
      )
        return json({ error: "Unsupported push subscription" }, 400);
      try {
        const raw = Uint8Array.from(
          atob(subscription.keys.p256dh.replace(/-/g, "+").replace(/_/g, "/")),
          (c) => c.charCodeAt(0),
        );
        await crypto.subtle.importKey(
          "raw",
          raw,
          { name: "ECDH", namedCurve: "P-256" },
          false,
          [],
        );
      } catch {
        return json({ error: "Invalid subscription key" }, 400);
      }
      id = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(subscription.endpoint),
          ),
        ),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    return this.state.storage.transaction(async (tx) => {
      const existing = await tx.get<User>(key);
      if (!existing && request.method === "PATCH")
        return json({ updated: false });
      if (
        !existing &&
        (await tx.list({ prefix: "user:", limit: 51 })).size >= 50
      )
        return json({ error: "Reminder pilot capacity reached" }, 503);
      const user: User = existing || {
        timezone: body.timezone,
        time: body.time,
        goalMetDate: body.goalMetDate,
        devices: [],
      };
      Object.assign(user, {
        timezone: body.timezone,
        time: body.time,
        goalMetDate: body.goalMetDate,
      });
      if (subscription && !user.devices.some((d) => d.id === id)) {
        if (user.devices.length >= 3)
          return json({ error: "At most three browsers per account" }, 409);
        user.devices.push({ id, subscription });
      }
      await tx.put(key, user);
      return json({ updated: true, id });
    });
  }
}
export default {
  async fetch(request: Request, env: Env) {
    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    if (request.headers.get("Origin") !== env.SITE_ORIGIN)
      return Response.json(
        { error: "Origin not allowed" },
        { status: 403, headers },
      );
    Object.assign(headers, {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (!["/subscription", "/test"].includes(new URL(request.url).pathname))
      return Response.json({ error: "Not found" }, { status: 404, headers });
    if (new URL(request.url).pathname === "/test" && request.method !== "POST")
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers },
      );
    let uid: string;
    try {
      const bearer = request.headers.get("Authorization");
      if (!bearer?.startsWith("Bearer ")) throw Error();
      uid = await assessmentUser(bearer.slice(7), env.FIREBASE_PROJECT_ID);
    } catch {
      return Response.json(
        { error: "Invalid session" },
        { status: 401, headers },
      );
    }
    if (
      env.ENABLE_REMINDERS !== "true" ||
      !env.VAPID_PRIVATE_KEY ||
      !env.VAPID_PUBLIC_KEY ||
      !env.VAPID_SUBJECT
    )
      return Response.json(
        { error: "Background reminders are not activated" },
        { status: 503, headers },
      );
    try {
      const registry = env.REMINDERS.get(env.REMINDERS.idFromName("registry"));
      const internal = new Request(
        `https://registry.internal${new URL(request.url).pathname}`,
        request,
      );
      internal.headers.set("X-Account", uid);
      const response = await registry.fetch(internal);
      return new Response(response.body, {
        status: response.status,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch {
      return Response.json(
        { error: "Reminder service unavailable" },
        { status: 503, headers },
      );
    }
  },
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (env.ENABLE_REMINDERS === "true")
      ctx.waitUntil(
        env.REMINDERS.get(env.REMINDERS.idFromName("registry")).fetch(
          "https://registry.internal/dispatch",
        ),
      );
  },
};
