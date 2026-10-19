import type { Activity, Day, Records } from "../types/learning";
export const collections = [
  "lessons",
  "days",
  "attempts",
  "reviewCards",
  "reviewLog",
  "notes",
  "units",
  "concepts",
  "revisionSessions",
  "plan",
] as const;
export function emptyRecords(): Records {
  return {
    lessons: {},
    days: {},
    attempts: {},
    reviewCards: {},
    reviewLog: {},
    notes: {},
    units: {},
    concepts: {},
    revisionSessions: {},
    plan: {},
  };
}
export function dateKey(time: number, timezone: string): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(time);
  return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}-${p.find((x) => x.type === "day")!.value}`;
}
export function mergeDay(a: Day | undefined, b: Day, goal: number): Day {
  const activities = [
    ...new Map(
      [...(a?.activities || []), ...b.activities].map((e) => [e.id, e]),
    ).values(),
  ];
  const xp = activities.reduce((n, e) => n + e.xp, 0);
  const xpByTrack: Record<string, number> = {};
  for (const e of activities)
    xpByTrack[e.track] = (xpByTrack[e.track] || 0) + e.xp;
  return {
    xp,
    activities,
    goalMet: !!a?.goalMet || b.goalMet || xp >= goal,
    xpByTrack,
  };
}
export function activityDay(activity: Activity, goal: number): Day {
  return mergeDay(
    undefined,
    { xp: 0, activities: [activity], goalMet: false, xpByTrack: {} },
    goal,
  );
}
const previous = (key: string) =>
  new Date(Date.parse(key + "T12:00:00Z") - 86400000)
    .toISOString()
    .slice(0, 10);
export function streakStats(days: Record<string, Day>, today: string) {
  const keys = Object.keys(days)
    .filter((k) => days[k].goalMet && k <= today)
    .sort();
  let streak = 0,
    longest = 0,
    freezes = 0,
    earned = 0,
    last: string | undefined;
  for (const day of keys) {
    const gap = last
      ? Math.round((Date.parse(day) - Date.parse(last)) / 86400000)
      : 1;
    const missed = Math.max(0, gap - 1);
    if (!last || missed > freezes) {
      if (last) freezes = 0;
      streak = 1;
      earned = 1;
    } else {
      freezes -= missed;
      streak++;
      earned++;
    }
    if (earned === 7) {
      freezes = Math.min(2, freezes + 1);
      earned = 0;
    }
    longest = Math.max(longest, streak);
    last = day;
  }
  if (last && last !== today && last !== previous(today)) {
    const missed =
      Math.round((Date.parse(today) - Date.parse(last)) / 86400000) - 1;
    if (missed > freezes) {
      streak = 0;
      freezes = 0;
    } else freezes -= missed;
  }
  return {
    current: streak,
    longest,
    freezes,
    totalXp: Object.values(days).reduce((sum, d) => sum + d.xp, 0),
    activeDays: keys.length,
  };
}
export function withinTolerance(
  response: number,
  expected: number,
  relative = 0.02,
  absolute = 1e-6,
) {
  return (
    Number.isFinite(response) &&
    Math.abs(response - expected) <=
      Math.max(Math.abs(expected) * relative, absolute)
  );
}
/** Exact grading for discrete answers; approximate grading retains the course defaults. */
export function gradeNumeric(
  response: string,
  expected: number,
  exact = false,
) {
  if (!response.trim() || !Number.isFinite(expected)) return false;
  const value = Number(response);
  return (
    Number.isFinite(value) &&
    (exact ? value === expected : withinTolerance(value, expected))
  );
}
/** Merge append-only activity and preserve completed work; other records use explicit clocks. */
export function mergeDocument(
  kind: string,
  existing: object | undefined,
  incoming: object,
  goal: number,
): object {
  if (!existing) return incoming;
  if (kind === "days") return mergeDay(existing as Day, incoming as Day, goal);
  const a = existing as Record<string, unknown>,
    b = incoming as Record<string, unknown>;
  const clock = (v: Record<string, unknown>) =>
    Number(v.updatedAt || v.generatedAt || v.completedAt || v.createdAt || 0);
  if (
    ["lessons", "units", "reviewCards", "attempts"].includes(kind) &&
    Number(a.resetAt || 0) !== Number(b.resetAt || 0)
  )
    return Number(a.resetAt || 0) > Number(b.resetAt || 0)
      ? existing
      : incoming;
  if (kind === "lessons") {
    const latest = clock(b) >= clock(a) ? b : a;
    return {
      ...latest,
      status:
        a.status === "done" || b.status === "done" ? "done" : latest.status,
      depthCompleted:
        a.depthCompleted === "full" || b.depthCompleted === "full"
          ? "full"
          : latest.depthCompleted,
      ladderTierDone: [
        ...new Set([
          ...((a.ladderTierDone as string[]) || []),
          ...((b.ladderTierDone as string[]) || []),
        ]),
      ],
    };
  }
  if (kind === "units")
    return {
      ...(clock(b) >= clock(a) ? b : a),
      skippedWithCredit: !!a.skippedWithCredit || !!b.skippedWithCredit,
      skipTestScore: Math.max(
        Number(a.skipTestScore || 0),
        Number(b.skipTestScore || 0),
      ),
    };
  if (kind === "reviewCards") {
    const ca = a.fsrs as { last_review?: string | Date },
      cb = b.fsrs as { last_review?: string | Date };
    return new Date(cb.last_review || 0).getTime() >=
      new Date(ca.last_review || 0).getTime()
      ? incoming
      : existing;
  }
  return clock(b) >= clock(a) ? incoming : existing;
}
