import { collections, emptyRecords } from "./learning-core.ts";
import type { Preferences, Records } from "../types/learning.ts";
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export interface ProgressBackup {
  records: Records;
  preferences: Partial<Preferences>;
  count: number;
}
const object = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const number = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
const text = (v: unknown) => typeof v === "string";
const strings = (v: unknown) => Array.isArray(v) && v.every(text);
const bool = (v: unknown) => typeof v === "boolean";
function requireValid(valid: unknown) {
  if (!valid)
    throw Error("This backup contains invalid progress. Nothing was imported.");
}
function inspect(value: unknown, depth = 0) {
  requireValid(depth < 30);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    requireValid(!["__proto__", "prototype", "constructor"].includes(key));
    inspect(child, depth + 1);
  }
}
export function parseProgressBackup(raw: string): ProgressBackup {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES)
    throw Error("Choose a progress backup smaller than 5 MB.");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw Error("Choose a valid Parallax JSON progress backup.");
  }
  inspect(data);
  requireValid(
    object(data) && object(data.records) && object(data.preferences),
  );
  requireValid(
    data.format === undefined ||
      (data.format === "parallax-progress" && data.version === 1),
  );
  const records = emptyRecords();
  let count = 0;
  for (const kind of Object.keys(data.records))
    requireValid(collections.includes(kind as (typeof collections)[number]));
  for (const kind of collections) {
    const values = data.records[kind] ?? {};
    requireValid(object(values));
    for (const [id, value] of Object.entries(values)) {
      requireValid(
        ++count <= 10000 &&
          id.length > 0 &&
          id.length <= 500 &&
          !id.includes("/") &&
          object(value),
      );
      const v = value as Record<string, any>;
      if (v.resetAt !== undefined) requireValid(number(v.resetAt));
      for (const field of ["updatedAt", "generatedAt", "createdAt"])
        if (v[field] !== undefined) requireValid(number(v[field]));
      switch (kind) {
        case "lessons":
          requireValid(
            ["not_started", "in_progress", "done", "skipped"].includes(
              v.status,
            ) &&
              number(v.mastery) &&
              v.mastery <= 1 &&
              [null, "quick", "full"].includes(v.depthCompleted) &&
              strings(v.ladderTierDone) &&
              text(v.lastSection) &&
              number(v.updatedAt),
          );
          if (v.interaction !== undefined) {
            requireValid(object(v.interaction));
            for (const field of ["responses", "theoryShown"])
              if (v.interaction[field] !== undefined)
                requireValid(object(v.interaction[field]));
            if (v.interaction.responses)
              for (const r of Object.values(v.interaction.responses) as any[])
                requireValid(
                  object(r) &&
                    text(r.response) &&
                    (r.result === null || bool(r.result)) &&
                    (r.submitted === null || text(r.submitted)),
                );
            if (v.interaction.theoryShown)
              requireValid(
                Object.values(v.interaction.theoryShown).every(number),
              );
            if (v.interaction.adaptive) {
              const a = v.interaction.adaptive;
              requireValid(
                object(a) &&
                  number(a.level) &&
                  strings(a.seen) &&
                  bool(a.done) &&
                  text(a.feedback) &&
                  (a.answer === null || bool(a.answer)),
              );
            }
            // Server assessment sessions cannot be restored as trusted evidence.
            delete v.interaction.serverAssessment;
            delete v.interaction.assessmentRequestId;
          }
          break;
        case "days":
          requireValid(
            /^\d{4}-\d{2}-\d{2}$/.test(id) &&
              number(v.xp) &&
              bool(v.goalMet) &&
              object(v.xpByTrack) &&
              Object.values(v.xpByTrack).every(number) &&
              Array.isArray(v.activities),
          );
          for (const a of v.activities)
            requireValid(
              object(a) &&
                text(a.id) &&
                number(a.xp) &&
                text(a.track) &&
                number(a.at),
            );
          break;
        case "attempts":
          requireValid(
            text(v.questionId) &&
              text(v.tier) &&
              text(v.response) &&
              bool(v.isCorrect) &&
              text(v.aiFeedback) &&
              number(v.createdAt),
          );
          break;
        case "notes":
          requireValid(text(v.bodyMd) && number(v.updatedAt));
          break;
        case "units":
          requireValid(
            number(v.skipTestScore) &&
              bool(v.skippedWithCredit) &&
              (v.completedAt === null || number(v.completedAt)),
          );
          break;
        case "concepts":
          requireValid(
            number(v.lastRevisedAt) && number(v.memoryStrength) && bool(v.weak),
          );
          break;
        case "revisionSessions":
          requireValid(
            strings(v.conceptIds) &&
              number(v.startedAt) &&
              (v.finishedAt === null || number(v.finishedAt)) &&
              number(v.score),
          );
          break;
        case "reviewCards":
          requireValid(
            text(v.type) &&
              text(v.front) &&
              text(v.back) &&
              text(v.lessonId) &&
              strings(v.conceptIds) &&
              object(v.fsrs),
          );
          requireValid(
            text(v.fsrs.due) && Number.isFinite(Date.parse(v.fsrs.due)),
          );
          for (const field of [
            "stability",
            "difficulty",
            "elapsed_days",
            "scheduled_days",
            "reps",
            "lapses",
            "state",
          ])
            requireValid(number(v.fsrs[field]));
          if (v.fsrs.last_review !== undefined)
            requireValid(
              text(v.fsrs.last_review) &&
                Number.isFinite(Date.parse(v.fsrs.last_review)),
            );
          break;
        case "reviewLog":
          requireValid(
            text(v.cardId) &&
              text(v.rating) &&
              number(v.state) &&
              text(v.reviewedAt) &&
              Number.isFinite(Date.parse(v.reviewedAt)) &&
              text(v.due) &&
              Number.isFinite(Date.parse(v.due)),
          );
          break;
        case "plan":
          if (v.items !== undefined)
            requireValid(
              (object(v.items) && Object.values(v.items).every(strings)) ||
                (Array.isArray(v.items) && v.items.length === 0),
            );
          if (v.lessonId !== undefined) requireValid(text(v.lessonId));
          if (v.section !== undefined) requireValid(text(v.section));
          if (v.version === "foundation-rebuild-v1") {
            requireValid(
              number(v.step) &&
                v.step <= 3 &&
                Array.isArray(v.visited) &&
                v.visited.every(number) &&
                object(v.answers) &&
                number(v.updatedAt) &&
                (v.completedAt === null || number(v.completedAt)),
            );
            for (const a of Object.values(v.answers) as any[])
              requireValid(
                object(a) &&
                  text(a.response) &&
                  (a.submitted === null || text(a.submitted)) &&
                  (a.correct === null || bool(a.correct)),
              );
          }
          break;
      }
      (records[kind] as Record<string, unknown>)[id] = v;
    }
  }
  const p = data.preferences,
    preferences: Partial<Preferences> = {};
  if (p.depth !== undefined) {
    requireValid(["quick", "full"].includes(p.depth));
    preferences.depth = p.depth;
  }
  for (const key of ["strictLocking", "foundationRevision"] as const)
    if (p[key] !== undefined) {
      requireValid(bool(p[key]));
      preferences[key] = p[key];
    }
  for (const [key, min, max] of [
    ["dailyGoal", 1, 1000],
    ["retention", 0.8, 0.95],
    ["newCards", 0, 50],
  ] as const)
    if (p[key] !== undefined) {
      requireValid(number(p[key]) && p[key] >= min && p[key] <= max);
      preferences[key] = p[key];
    }
  if (p.timezone !== undefined) {
    requireValid(text(p.timezone));
    try {
      new Intl.DateTimeFormat("en", { timeZone: p.timezone }).format();
    } catch {
      requireValid(false);
    }
    preferences.timezone = p.timezone;
  }
  if (p.reminderTime !== undefined) {
    requireValid(
      text(p.reminderTime) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminderTime),
    );
    preferences.reminderTime = p.reminderTime;
  }
  if (p.trackMix !== undefined) {
    requireValid(
      object(p.trackMix) &&
        ["physics", "maths", "astro", "other"].every((k) =>
          number(p.trackMix[k]),
        ),
    );
    preferences.trackMix = p.trackMix;
  }
  if (p.examPlan !== undefined) {
    requireValid(
      object(p.examPlan) && text(p.examPlan.date) && strings(p.examPlan.units),
    );
    preferences.examPlan = p.examPlan;
  }
  return { records, preferences, count };
}
