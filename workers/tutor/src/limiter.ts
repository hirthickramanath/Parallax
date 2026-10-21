/** Per-learner sliding-window limits for tutor requests. Pure functions; no I/O. */
export const LIMITS = { perMinute: 10, perDay: 200 } as const;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export interface LimitVerdict {
  allowed: boolean;
  /** Seconds until another request would be allowed; 0 when allowed. */
  retryAfterSeconds: number;
  /** Request times (ms, ascending) to store. A rejected request is not recorded. */
  history: number[];
}

/**
 * Decide whether a request at `now` is allowed, given earlier request times.
 * Both windows slide: a request is allowed only while fewer than the limit
 * of accepted requests fall inside the window.
 */
export function decide(
  stored: unknown,
  now: number,
  limits: { perMinute: number; perDay: number } = LIMITS,
): LimitVerdict {
  const recent = (Array.isArray(stored) ? stored : [])
    .filter((t): t is number => typeof t === "number" && Number.isFinite(t))
    .filter((t) => t > now - DAY_MS && t <= now)
    .sort((a, b) => a - b);
  const inMinute = recent.filter((t) => t > now - MINUTE_MS);
  let wait = 0;
  if (inMinute.length >= limits.perMinute)
    wait = Math.max(
      wait,
      inMinute[inMinute.length - limits.perMinute] + MINUTE_MS - now,
    );
  if (recent.length >= limits.perDay)
    wait = Math.max(
      wait,
      recent[recent.length - limits.perDay] + DAY_MS - now,
    );
  if (wait > 0)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(wait / 1000)),
      history: recent,
    };
  return { allowed: true, retryAfterSeconds: 0, history: [...recent, now] };
}

/** Human-readable wait for an error message. */
export function waitText(seconds: number) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `about ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  const hours = Math.ceil(seconds / 3600);
  return `about ${hours} hour${hours === 1 ? "" : "s"}`;
}
