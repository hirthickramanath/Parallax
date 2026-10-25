import type { Records } from "../types/learning";
export const FOUNDATION_VERSION = "foundation-rebuild-v1";
export const FOUNDATION_ORDER = [
  "MB1.1",
  "MB1.2",
  "MB2.1",
  "MB4.2",
  "MB2.3",
  "PB1.1",
  "PB1.2",
  "MB3.1",
  "MB3.2",
  "MB3.3",
  "MB3.4",
  "MB1.3",
  "MB1.4",
  "MB4.1",
  "MB2.2",
  "PB1.3",
  "PB1.4",
  "PB2.1",
  "PB2.2",
  "PB2.3",
  "MB3.5",
  "PB3.1",
  "PB3.2",
  "PB3.3",
  "PB4.1",
  "PB4.2",
  "PB4.3",
  "PB4.4",
  "MB4.3",
  "MB4.4",
  "PB5.1",
  "PB5.2",
  "PB5.3",
  "CB1.1",
  "CB1.2",
  "CB1.3",
  "CB1.4",
  "CB1.5",
] as const;
interface RevisionAnswer {
  response: string;
  submitted: string | null;
  correct: boolean | null;
  hintUsed?: boolean;
}
export interface FoundationProgress {
  version: string;
  step: number;
  visited: number[];
  answers: Record<string, RevisionAnswer>;
  completedAt: number | null;
  updatedAt: number;
}
export const foundationKey = (id: string) => `foundation-rebuild-${id}`;
export function foundationProgress(
  records: Pick<Records, "plan">,
  id: string,
): FoundationProgress {
  const raw = records.plan[foundationKey(id)];
  if (raw?.version !== FOUNDATION_VERSION)
    return {
      version: FOUNDATION_VERSION,
      step: 0,
      visited: [],
      answers: {},
      completedAt: null,
      updatedAt: 0,
    };
  return {
    version: FOUNDATION_VERSION,
    step: Math.max(0, Math.min(3, Number(raw.step) || 0)),
    visited: Array.isArray(raw.visited)
      ? raw.visited.filter((x) => [0, 1, 2].includes(x))
      : [],
    answers: (raw.answers && typeof raw.answers === "object"
      ? raw.answers
      : {}) as FoundationProgress["answers"],
    completedAt: typeof raw.completedAt === "number" ? raw.completedAt : null,
    updatedAt: Number(raw.updatedAt) || 0,
  };
}
export function revisionPracticeReady(progress: FoundationProgress) {
  return (
    [0, 1, 2].every((step) => progress.visited.includes(step)) &&
    [1, 2, 3].every((i) => {
      const a = progress.answers[`rebuild-${i}`];
      return a?.correct === true && a.response === a.submitted;
    })
  );
}
export function foundationRevised(records: Pick<Records, "plan">, id: string) {
  const p = foundationProgress(records, id);
  return !!p.completedAt && revisionPracticeReady(p);
}
export function nextFoundation(records: Pick<Records, "plan">) {
  return FOUNDATION_ORDER.find((id) => !foundationRevised(records, id));
}
