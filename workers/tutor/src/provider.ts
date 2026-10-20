import type { TutorMessage } from "./core";
export interface ProviderEnv {
  TUTOR_PROVIDER?: string;
  AI_MODEL: string;
  GEMINI_MODEL?: string;
  GEMINI_API_KEY?: string;
  AI?: {
    run: (
      model: string,
      input: {
        messages: { role: string; content: string }[];
        stream: boolean;
        max_tokens?: number;
      },
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
      messages: boundedMessages(system, messages),
      stream: true,
      max_tokens: 1024,
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

function clipBytes(text: string, budget: number) {
  const bytes = new TextEncoder().encode(text);
  return bytes.length <= budget
    ? text
    : new TextDecoder().decode(bytes.slice(0, Math.max(0, budget - 80))) +
        "\n[Reference excerpt truncated; ask for missing context when needed.]";
}
/** Bound upstream context; a long saved conversation must not exhaust the model window. */
export function boundedMessages(system: string, messages: TutorMessage[]) {
  const last = messages.at(-1);
  const latest = last
    ? { ...last, content: clipBytes(last.content, 8000) }
    : null;
  const length = (s: string) => new TextEncoder().encode(s).length;
  let remaining = 12000 - (latest ? length(latest.content) : 0);
  const prompt = clipBytes(system, Math.min(8000, remaining));
  remaining -= length(prompt);
  const history: TutorMessage[] = [];
  for (const message of messages.slice(0, -1).reverse()) {
    if (remaining < 100) break;
    const content = clipBytes(message.content, Math.min(1500, remaining));
    history.unshift({ ...message, content });
    remaining -= length(content);
  }
  return [
    { role: "system" as const, content: prompt },
    ...history,
    ...(latest ? [latest] : []),
  ];
}
function errorMessage(cause: unknown) {
  if (
    cause &&
    typeof cause === "object" &&
    "message" in cause &&
    typeof cause.message === "string"
  )
    return cause.message;
  return typeof cause === "string" ? cause : "";
}
/** Log only fixed labels and numeric service codes; never raw exception text or prompts. */
export function providerDiagnostic(cause: unknown) {
  const message = errorMessage(cause);
  const value =
    cause && typeof cause === "object"
      ? (cause as { name?: unknown; code?: unknown })
      : {};
  const knownNames = [
    "Error",
    "TypeError",
    "RangeError",
    "AiError",
    "InferenceUpstreamError",
    "AbortError",
  ];
  const name =
    typeof value.name === "string" && knownNames.includes(value.name)
      ? value.name
      : "unknown";
  const codes = [
    ...message.matchAll(/(?:code|error|status)[\s:=[\]()_-]*(\d{3,6})\b/gi),
  ].map((match) => Number(match[1]));
  if (typeof value.code === "number" && Number.isSafeInteger(value.code))
    codes.push(value.code);
  const reason = /getReader.*not a function/i.test(message)
    ? "invalid_stream"
    : /run.*not a function/i.test(message)
      ? "invalid_ai_binding"
      : /internal.*error|internal.*server/i.test(message)
        ? "upstream_internal"
        : /invalid.*input|invalid.*argument|validation/i.test(message)
          ? "invalid_input"
          : /deprecated|retired/i.test(message)
            ? "model_retired"
            : /unsupported|not supported/i.test(message)
              ? "unsupported_operation"
              : /fetch failed|network|connection/i.test(message)
                ? "upstream_network"
                : "unclassified";
  return { name, reason, upstreamCodes: [...new Set(codes)].slice(0, 5) };
}
export function providerFailure(cause: unknown) {
  const message = errorMessage(cause);
  if (/quota|neurons|credits|capacity|rate.?limit|429/i.test(message))
    return {
      code: "provider_capacity",
      error:
        "Cloudflare AI capacity is currently unavailable. Parallax has no daily question cap; please try again later.",
    };
  if (/context|too many tokens|input.*long|token.*limit/i.test(message))
    return {
      code: "provider_context",
      error:
        "The AI service could not fit this conversation. Try a shorter question or another lesson.",
    };
  if (
    /model.*not found|unknown model|model.*unavailable|model.*not available/i.test(
      message,
    )
  )
    return {
      code: "provider_model",
      error:
        "The configured AI model is unavailable. Its Cloudflare configuration needs attention.",
    };
  if (
    /unauthori|permission|forbidden|403|authentication|access.denied|not.allowed/i.test(
      message,
    )
  )
    return {
      code: "provider_access",
      error: "Cloudflare AI access needs attention in the project account.",
    };
  if (/deadline|timeout|timed out/i.test(message))
    return {
      code: "provider_timeout",
      error: "The AI service took too long to start. Please try again.",
    };
  return {
    code: "provider_unavailable",
    error:
      "The AI service is temporarily unavailable. Please try again shortly.",
  };
}
