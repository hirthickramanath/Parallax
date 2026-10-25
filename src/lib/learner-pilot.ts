type PilotStage = "baseline" | "immediate" | "delayed";
interface PilotEntry {
  completedAt: string;
  assisted: boolean;
  helpUsed: string;
  instructionSource: string;
  feedback: string;
  responses: Record<string, { value: number | null; reasoning: string }>;
}
export interface PilotRecord {
  studyCode: string;
  priorKnowledge: "new" | "some" | "experienced";
  consentedAt: string;
  version: string;
  baseline?: PilotEntry;
  immediate?: PilotEntry;
  delayed?: PilotEntry;
}
export const PILOT_WAIT_MS = 6 * 86400000;
export function pilotNext(record: PilotRecord | null, now = Date.now()) {
  if (!record?.baseline)
    return { stage: "baseline" as PilotStage, available: true, dueAt: null };
  if (!record.immediate)
    return { stage: "immediate" as PilotStage, available: true, dueAt: null };
  const dueAt = Date.parse(record.immediate.completedAt) + PILOT_WAIT_MS;
  return {
    stage: "delayed" as PilotStage,
    available: !record.delayed && now >= dueAt,
    dueAt,
  };
}
export function pilotAnswer(value: string) {
  if (!value.trim()) return null;
  const result = Number(value.trim());
  if (!Number.isFinite(result))
    throw Error("Use a finite number, or leave blank if you do not know.");
  return result;
}
export function readPilot(raw: string | null): PilotRecord | null {
  if (!raw || raw.length > 100000) return null;
  try {
    const r = JSON.parse(raw);
    if (
      !/^[a-z0-9-]{3,40}$/i.test(r.studyCode) ||
      !["new", "some", "experienced"].includes(r.priorKnowledge) ||
      !Number.isFinite(Date.parse(r.consentedAt)) ||
      r.version !== "foundation-pilot-v1"
    )
      return null;
    for (const stage of ["baseline", "immediate", "delayed"] as const) {
      const entry = r[stage];
      if (
        entry &&
        (!Number.isFinite(Date.parse(entry.completedAt)) ||
          typeof entry.assisted !== "boolean" ||
          !entry.responses ||
          typeof entry.responses !== "object")
      )
        return null;
    }
    return r;
  } catch {
    return null;
  }
}
