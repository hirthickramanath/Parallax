import {
  providerConfigured,
  tutorProvider,
  providerFailure,
  providerDiagnostic,
} from "./provider";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { validateRequest, tutorPrompt } from "./core";
import { normalizeStream, providerDeadline } from "./stream";
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
const keys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);
// Retain the class for the deployed v1 migration. Requests no longer use a daily quota.
export class DailyCounter {
  async fetch() {
    return new Response("Daily quotas have been removed", { status: 410 });
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
      const { payload } = await jwtVerify(bearer.slice(7), keys, {
        issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
        audience: env.FIREBASE_PROJECT_ID,
        algorithms: ["RS256"],
        requiredClaims: ["sub", "iat", "exp", "auth_time"],
      });
      if (
        !payload.sub ||
        payload.sub.length > 128 ||
        Number(payload.iat) > Date.now() / 1000 ||
        Number(payload.auth_time) > Date.now() / 1000
      )
        throw Error();
      uid = payload.sub;
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
      const stream = normalizeStream(provider);
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
