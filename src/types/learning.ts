import type { Card } from "ts-fsrs";
import type { LessonProgress } from "./progress";
export interface Activity {
  id: string;
  xp: number;
  track: string;
  at: number;
}
export interface Day {
  xp: number;
  activities: Activity[];
  goalMet: boolean;
  xpByTrack: Record<string, number>;
}
export interface Attempt {
  resetAt?: number;
  questionId: string;
  tier: string;
  response: string;
  isCorrect: boolean;
  aiFeedback: string;
  createdAt: number;
}
export interface ReviewCard {
  resetAt?: number;
  type: string;
  front: string;
  back: string;
  lessonId: string;
  conceptIds: string[];
  fsrs: Card;
}
export interface Note {
  bodyMd: string;
  updatedAt: number;
}
export interface UnitProgress {
  resetAt?: number;
  skipTestScore: number;
  skippedWithCredit: boolean;
  completedAt: number | null;
}
export interface Records {
  lessons: Record<string, LessonProgress>;
  days: Record<string, Day>;
  attempts: Record<string, Attempt>;
  reviewCards: Record<string, ReviewCard>;
  reviewLog: Record<string, Record<string, unknown>>;
  notes: Record<string, Note>;
  units: Record<string, UnitProgress>;
  concepts: Record<
    string,
    { lastRevisedAt: number; memoryStrength: number; weak: boolean }
  >;
  revisionSessions: Record<
    string,
    {
      conceptIds: string[];
      startedAt: number;
      finishedAt: number | null;
      score: number;
    }
  >;
  plan: Record<string, Record<string, unknown>>;
}
export type Collection = keyof Records;
export interface Preferences {
  remindersEnabled?: boolean;
  reminderTime?: string;
  reminderDismissedDate?: string;
  lastReminderDate?: string;
  trackMix?: { physics: number; maths: number; astro: number; other: number };
  examPlan?: { date: string; units: string[] };
  depth: "quick" | "full";
  dailyGoal: number;
  strictLocking: boolean;
  timezone: string;
  retention: number;
  newCards: number;
}
