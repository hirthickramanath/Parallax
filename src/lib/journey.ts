import type { Question } from "./course";
/** Monday in the learner's timezone, based on a YYYY-MM-DD local date. */
export function weekStart(today: string) {
  const day = new Date(today + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}
export function questionLevel(question: Question) {
  return question.tier === "warmup" ? 0 : question.tier === "core" ? 2 : 1;
}
export function adaptiveNext(
  questions: Question[],
  seen: string[],
  level: number,
) {
  return questions
    .filter((q) => !seen.includes(q.id))
    .sort(
      (a, b) =>
        Math.abs(questionLevel(a) - level) -
          Math.abs(questionLevel(b) - level) ||
        Number(b.type === "numeric") - Number(a.type === "numeric"),
    )[0];
}
export function adjustChallenge(level: number, correct: boolean) {
  return Math.max(0, Math.min(2, level + (correct ? 1 : -1)));
}
