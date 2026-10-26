/**
 * Per-learner sliding-window limit for tutor requests. Pure functions; no I/O.
 * There is deliberately no daily cap: the owner asked for it to be removed.
 */
export const LIMITS = { perMinute: 10 } as const;
const MINUTE_MS = 60_000;

export interface LimitVerdict {
  allowed: boolean;
  /** Seconds until another request would be allowed; 0 when allowed. */
  retryAfterSeconds: number;
  /** Request times (ms, ascending) to store. A rejected request is not recorded. */
  history: number[];
}

/**
 * Decide whether a request at `now` is allowed, given earlier request times.
 * The window slides: a request is allowed only while fewer than the limit
 * of accepted requests fall inside the last minute.
 */
export function decide(
  stored: unknown,
  now: number,
  limits: { perMinute: number } = LIMITS,
): LimitVerdict {
  const recent = (Array.isArray(stored) ? stored : [])
    .filter((t): t is number => typeof t === "number" && Number.isFinite(t))
    .filter((t) => t > now - MINUTE_MS && t <= now)
    .sort((a, b) => a - b);
  let wait = 0;
  if (recent.length >= limits.perMinute)
    wait = recent[recent.length - limits.perMinute] + MINUTE_MS - now;
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
