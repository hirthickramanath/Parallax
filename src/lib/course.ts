import raw from "../generated/course.json";
import type { Records } from "../types/learning";
export interface Lesson {
  id: string;
  title: string;
  unit: string;
  track: string;
  phase: number;
  level: string;
  hook: string;
  requires: string[];
  status: string;
  available: boolean;
}
export interface Unit {
  id: string;
  title: string;
  phase: number;
  track: string;
  needs: string[];
  lessons: string[];
  anyTwoPhase6?: boolean;
}
export interface SectionMeta {
  id: string;
  title: string;
  layer: string;
  fullOnly: boolean;
  text?: string;
}
export interface Authored extends Lesson {
  widgets?: string[];
  book_refs: string[];
  verification?: {
    status?: string;
    reviewer?: string;
    reviewedAt?: string;
    note?: string;
  };
  recap: string[];
  questions: Question[];
  review: { front: string; back: string; concept: string }[];
  sections: SectionMeta[];
}
export interface Question {
  id: string;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint?: string;
  misconceptions?: Record<string, string>;
  type: "mcq" | "numeric";
  exact?: boolean;
  unit?: string;
  conceptual: boolean;
  tier?: string;
}
export const course = raw as unknown as {
  units: Unit[];
  lessons: Lesson[];
  authored: Record<string, Authored>;
};
/** Stable order within each phase, shared by restart and the level path. */
export const journeyLessons = [...course.lessons].sort(
  (a, b) => a.phase - b.phase,
);
export const phases = [
  "Bridge refresher",
  "Foundations",
  "First stars",
  "Analytical & modern core",
  "Stars & molecules",
  "Deeper structure",
  "Relativity & quantum",
  "The universe",
  "Research",
];
export function unitMet(id: string, records: Records) {
  const unit = course.units.find((u) => u.id === id);
  return (
    !!records.units[id]?.skippedWithCredit ||
    !!unit?.lessons.every(
      (l) =>
        records.lessons[l]?.mastery >= 0.8 &&
        records.lessons[l]?.ladderTierDone.includes("core") &&
        records.lessons[l]?.ladderTierDone.includes("warmup"),
    )
  );
}
export function missingNeeds(lesson: Lesson, records: Records) {
  const unit = course.units.find((u) => u.id === lesson.unit)!;
  const missing = unit.needs.filter((id) => !unitMet(id, records));
  if (
    unit.anyTwoPhase6 &&
    course.units.filter((u) => u.phase === 6 && unitMet(u.id, records)).length <
      2
  )
    missing.push("any two Phase 6 units");
  for (const id of lesson.requires) {
    const dependency = course.lessons.find((l) => l.id === id);
    if (!dependency) {
      missing.push(id);
      continue;
    }
    if (dependency.unit !== lesson.unit && unit.needs.includes(dependency.unit))
      continue;
    if (records.units[dependency.unit]?.skippedWithCredit) continue;
    if (!["done", "skipped"].includes(records.lessons[id]?.status))
      missing.push(id);
  }
  return missing;
}
export function nextLesson(records: Records) {
  const available = journeyLessons.filter(
    (l) => l.available && records.lessons[l.id]?.status !== "done",
  );
  return (
    available.find((l) => missingNeeds(l, records).length === 0) || available[0]
  );
}
