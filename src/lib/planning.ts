export interface PlanCandidate {
  id: string;
  track: string;
  phase: number;
}
export interface TrackMix {
  physics: number;
  maths: number;
  astro: number;
  other: number;
}
export const defaultMix: TrackMix = {
  physics: 3,
  maths: 2,
  astro: 1,
  other: 1,
};
/** Prefer the earliest eligible phase; never treat planned work as completed prerequisites. */
export function balancedPlan(
  candidates: PlanCandidate[],
  mix: TrackMix = defaultMix,
) {
  const remaining = [...candidates].sort(
    (a, b) =>
      a.phase - b.phase ||
      a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  const counts = { ...mix };
  const result: PlanCandidate[] = [];
  const tracks = ["physics", "maths", "astro", "other"] as const;
  while (tracks.some((t) => counts[t] > 0)) {
    for (const track of tracks) {
      if (counts[track] <= 0) continue;
      counts[track]--;
      if (!remaining.length) break;
      const phase = remaining[0].phase;
      let index = remaining.findIndex(
        (l) =>
          l.phase === phase &&
          (track === "other"
            ? !["physics", "maths", "astro"].includes(l.track)
            : l.track === track),
      );
      if (index < 0 && track === "astro")
        index = remaining.findIndex(
          (l) => l.phase === phase && l.track === "physics",
        );
      if (index < 0) index = 0;
      result.push(remaining.splice(index, 1)[0]);
    }
  }
  return result;
}
export function examSchedule(
  items: { id: string; lessonId: string; strength: number | null }[],
  today: string,
  target: string,
) {
  const distance = Math.floor(
    (Date.parse(target + "T12:00:00Z") - Date.parse(today + "T12:00:00Z")) /
      86400000,
  );
  if (!Number.isFinite(distance) || distance < 1 || distance > 365)
    throw Error("Choose an exam date 1–365 days ahead.");
  const sorted = [...items].sort(
    (a, b) => (a.strength ?? -1) - (b.strength ?? -1),
  );
  const days = distance;
  return sorted.map((item, i) => ({
    ...item,
    date: new Date(
      Date.parse(today + "T12:00:00Z") +
        Math.min(
          days - 1,
          Math.floor(
            (i * Math.max(0, days - 1)) / Math.max(1, sorted.length - 1),
          ),
        ) *
          86400000,
    )
      .toISOString()
      .slice(0, 10),
  }));
}
