import { createRemoteJWKSet, jwtVerify } from "jose";
import { validateRequest, tutorPrompt, quotaDecision } from "./core";
interface Env {
  SITE_ORIGIN: string;
  FIREBASE_PROJECT_ID: string;
  ENABLE_TUTOR: string;
  AI_MODEL: string;
  DAILY_LIMIT?: string;
  COUNTERS: DurableObjectNamespace;
  AI?: {
    run: (
      model: string,
      input: { messages: { role: string; content: string }[]; stream: boolean },
    ) => Promise<ReadableStream<Uint8Array>>;
  };
}
const keys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);
export class DailyCounter {
  constructor(private state: DurableObjectState) {}
  async fetch(request: Request) {
    const { day, limit } = (await request.json()) as {
      day: string;
      limit: number;
    };
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    )
      return new Response("Invalid counter input", { status: 400 });
    const decision = await this.state.storage.transaction(async (tx) => {
      const decision = quotaDecision(
        await tx.get<{ day: string; count: number }>("usage"),
        day,
        limit,
      );
      if (decision.allowed) await tx.put("usage", decision.next);
      return decision;
    });
    return Response.json({
      allowed: decision.allowed,
      remaining: Math.max(0, limit - decision.next.count),
    });
  }
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    if (origin !== env.SITE_ORIGIN)
      return Response.json(
        { error: "Origin not allowed" },
        { status: 403, headers },
      );
    Object.assign(headers, {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Expose-Headers": "X-Tutor-Remaining",
    });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers },
      );
    const bearer = request.headers.get("Authorization");
    if (!bearer?.startsWith("Bearer "))
      return Response.json(
        { error: "Sign in required" },
        { status: 401, headers },
      );
    let uid: string;
    try {
      const { payload } = await jwtVerify(bearer.slice(7), keys, {
        issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
        audience: env.FIREBASE_PROJECT_ID,
        algorithms: ["RS256"],
      });
      if (!payload.sub || payload.sub.length > 128) throw Error();
      uid = payload.sub;
    } catch {
      return Response.json(
        { error: "Invalid session" },
        { status: 401, headers },
      );
    }
    if (env.ENABLE_TUTOR !== "true" || !env.AI || !env.AI_MODEL)
      return Response.json(
        { error: "Tutor integration has not been activated" },
        { status: 503, headers },
      );
    let body;
    try {
      if (Number(request.headers.get("Content-Length") || 0) > 24000)
        throw Error();
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 24000) throw Error();
      body = validateRequest(JSON.parse(text));
    } catch {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400, headers },
      );
    }
    let lesson;
    try {
      const response = await fetch(
        `${env.SITE_ORIGIN}/content/${encodeURIComponent(body.lessonId)}.json`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw Error();
      lesson = (await response.json()) as Parameters<typeof tutorPrompt>[0];
      if (!Array.isArray(lesson.sections)) throw Error();
    } catch {
      return Response.json(
        { error: "Lesson content unavailable" },
        { status: 404, headers },
      );
    }
    const limit = Math.max(1, Math.min(100, Number(env.DAILY_LIMIT) || 50));
    const counter = env.COUNTERS.get(env.COUNTERS.idFromName(uid));
    let quota: { allowed: boolean; remaining: number };
    try {
      const response = await counter.fetch("https://counter.internal", {
        method: "POST",
        body: JSON.stringify({
          day: new Date().toISOString().slice(0, 10),
          limit,
        }),
      });
      quota = await response.json();
    } catch {
      return Response.json(
        { error: "Tutor usage check unavailable" },
        { status: 503, headers },
      );
    }
    headers["X-Tutor-Remaining"] = String(quota.remaining);
    if (!quota.allowed)
      return Response.json(
        { error: "Daily tutor limit reached, come back tomorrow" },
        { status: 429, headers },
      );
    try {
      const provider = await env.AI.run(env.AI_MODEL, {
        messages: [
          { role: "system", content: tutorPrompt(lesson, body) },
          ...body.history,
          { role: "user", content: body.message },
        ],
        stream: true,
      });
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const reader = provider.getReader(),
            decoder = new TextDecoder();
          let buffer = "";
          try {
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let newline;
              while ((newline = buffer.indexOf("\n")) >= 0) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!line.startsWith("data: ") || line === "data: [DONE]")
                  continue;
                const chunk = JSON.parse(line.slice(6)) as {
                  response?: string;
                  error?: unknown;
                };
                if (chunk.error) throw Error();
                if (chunk.response)
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ text: chunk.response })}\n\n`,
                    ),
                  );
              }
            }
          } catch {
            controller.enqueue(
              encoder.encode(
                'data: {"error":"Tutor resting until tomorrow. Please try later."}\n\n',
              ),
            );
          } finally {
            reader.releaseLock();
            controller.close();
          }
        },
        cancel() {
          void provider.cancel();
        },
      });
      return new Response(stream, {
        headers: { ...headers, "Content-Type": "text/event-stream" },
      });
    } catch {
      return Response.json(
        { error: "Tutor resting until tomorrow" },
        { status: 503, headers },
      );
    }
  },
};
