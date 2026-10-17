export interface LessonProgress {
  status: "not_started" | "in_progress" | "done" | "skipped";
  mastery: number;
  depthCompleted: "quick" | "full" | null;
  ladderTierDone: string[];
  lastSection: string;
  updatedAt: number;
}
