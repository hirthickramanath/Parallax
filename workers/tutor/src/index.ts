import {
  providerConfigured,
  tutorProvider,
  providerFailure,
  providerDiagnostic,
} from "./provider";
import { firebaseUser } from "../../shared/auth";
import { validateRequest, tutorPrompt } from "./core";
import { normalizeStream, providerDeadline } from "./stream";
import { decide, waitText } from "./limiter";
interface Env {
  SITE_ORIGIN: string;
  FIREBASE_PROJECT_ID: string;
  ENABLE_TUTOR: string;
  AI_MODEL: string;
  TUTOR_PROVIDER?: string;
  GEMINI_MODEL?: string;
  GEMINI_API_KEY?: string;
  COUNTERS: DurableObjectNamespace;
  AI?: {
    run: (
      model: string,
      input: { messages: { role: string; content: string }[]; stream: boolean },
    ) => Promise<ReadableStream<Uint8Array>>;
  };
}
// The class name and COUNTERS binding are kept so the deployed v1 Durable Object
// migration stays valid. Each learner's object now records recent request times
// and enforces a sliding-window limit (see limiter.ts). There is no fixed daily quota.
export class DailyCounter {
  constructor(private state: DurableObjectState) {}
  async fetch(request: Request) {
    if (request.method !== "POST")
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    const verdict = await this.state.storage.transaction(async (tx) => {
      const result = decide(await tx.get("hits"), Date.now());
      await tx.put("hits", result.history);
      return {
        allowed: result.allowed,
        retryAfterSeconds: result.retryAfterSeconds,
      };
    });
    return Response.json(verdict, { status: verdict.allowed ? 200 : 429 });
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
      uid = await firebaseUser(bearer.slice(7), env.FIREBASE_PROJECT_ID);
    } catch {
      return Response.json(
        { error: "Invalid session" },
        { status: 401, headers },
      );
    }
    if (env.ENABLE_TUTOR !== "true" || !providerConfigured(env))
      return Response.json(
        {
          code: "configuration_missing",
          error: "The tutor service is not activated for this deployment.",
        },
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
    // Count only valid, configured requests. Fail closed if the limiter is unreachable.
    let verdict: { allowed: boolean; retryAfterSeconds: number };
    try {
      const limiter = env.COUNTERS.get(env.COUNTERS.idFromName(uid));
      const reply = await limiter.fetch("https://limiter.internal/hit", {
        method: "POST",
      });
      verdict = (await reply.json()) as typeof verdict;
      if (typeof verdict.allowed !== "boolean") throw Error();
    } catch {
      console.error(JSON.stringify({ event: "tutor_limiter_unavailable" }));
      return Response.json(
        {
          code: "rate_limit_unavailable",
          error:
            "The tutor could not check its usage limit. Please try again shortly.",
        },
        { status: 503, headers },
      );
    }
    if (!verdict.allowed) {
      const wait = Math.min(
        86400,
        Math.max(1, Math.ceil(Number(verdict.retryAfterSeconds) || 60)),
      );
      // No account identifier or message content is logged.
      console.log(
        JSON.stringify({ event: "tutor_rate_limited", retryAfterSeconds: wait }),
      );
      return Response.json(
        {
          code: "rate_limited",
          error: `You have reached the tutor's usage limit. Please try again in ${waitText(wait)}.`,
          retryAfterSeconds: wait,
        },
        { status: 429, headers: { ...headers, "Retry-After": String(wait) } },
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
    let stage = "inference";
    try {
      const provider = await providerDeadline(
        tutorProvider(env, tutorPrompt(lesson, body), [
          ...body.history,
          { role: "user", content: body.message },
        ]),
        35000,
      );
      stage = "stream_setup";
      const stream = normalizeStream(provider, 45000, (characters) => {
        console.log(
          JSON.stringify({
            event: "tutor_reply_completed",
            provider: env.TUTOR_PROVIDER || "workers-ai",
            characters,
          }),
        );
      });
      return new Response(stream, {
        headers: { ...headers, "Content-Type": "text/event-stream" },
      });
    } catch (cause) {
      const failure = providerFailure(cause);
      console.error(
        JSON.stringify({
          event: "tutor_provider_failure",
          stage,
          diagnostic: providerDiagnostic(cause),
          code: failure.code,
          provider: env.TUTOR_PROVIDER || "workers-ai",
        }),
      );
      return Response.json(failure, { status: 503, headers });
    }
  },
};
