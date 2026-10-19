import type { LessonProgress } from "../types/progress";
export function demonstratedMastery(progress: LessonProgress | undefined) {
  return (
    !!progress &&
    progress.mastery >= 0.8 &&
    progress.depthCompleted === "full" &&
    progress.ladderTierDone.includes("warmup") &&
    progress.ladderTierDone.includes("core")
  );
}
