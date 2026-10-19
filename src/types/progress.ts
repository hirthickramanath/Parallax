export interface LessonInteraction {
  lastQuestionId?: string;
  serverAssessment?: unknown;
  assessmentRequestId?: string;
  responses?: Record<
    string,
    { response: string; result: boolean | null; submitted: string | null }
  >;
  theoryShown?: Record<string, number>;
  adaptive?: {
    level: number;
    seen: string[];
    answer: boolean | null;
    done: boolean;
    feedback: string;
  };
}
export interface LessonProgress {
  resetAt?: number;
  interaction?: LessonInteraction;
  status: "not_started" | "in_progress" | "done" | "skipped";
  mastery: number;
  depthCompleted: "quick" | "full" | null;
  ladderTierDone: string[];
  lastSection: string;
  updatedAt: number;
}
