import type { TutorMessage } from "./core";
export interface ProviderEnv {
  TUTOR_PROVIDER?: string;
  AI_MODEL: string;
  GEMINI_MODEL?: string;
  GEMINI_API_KEY?: string;
  AI?: {
    run: (
      model: string,
      input: { messages: { role: string; content: string }[]; stream: boolean },
    ) => Promise<ReadableStream<Uint8Array>>;
  };
}
export function providerConfigured(env: ProviderEnv) {
  return env.TUTOR_PROVIDER === "gemini"
    ? !!env.GEMINI_API_KEY &&
        !!env.GEMINI_MODEL &&
        /^[a-zA-Z0-9._-]+$/.test(env.GEMINI_MODEL)
    : (!env.TUTOR_PROVIDER || env.TUTOR_PROVIDER === "workers-ai") &&
        !!env.AI &&
        !!env.AI_MODEL;
}
export async function tutorProvider(
  env: ProviderEnv,
  system: string,
  messages: TutorMessage[],
  request: typeof fetch = fetch,
  headerTimeoutMs = 15000,
) {
  if (!providerConfigured(env)) throw Error("Tutor provider is not configured");
  if (env.TUTOR_PROVIDER !== "gemini")
    return env.AI!.run(env.AI_MODEL, {
      messages: [{ role: "system", content: system }, ...messages],
      stream: true,
    });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), headerTimeoutMs);
  let r: Response;
  try {
    r = await request(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { temperature: 0.4, maxOutputTokens: 2000 },
        }),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timer);
  }
  if (!r.ok || !r.body) {
    await r.body?.cancel();
    throw Error("Tutor provider unavailable");
  }
  return r.body;
}
