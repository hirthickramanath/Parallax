import raw from "../../content/revision/foundation.json";
import { gradeNumeric } from "./learning-core";
export interface RevisionCheck {
  id: string;
  prompt: string;
  answer: string;
  unit: string;
  hint: string;
  explanation: string;
  type: "mcq" | "numeric";
  options?: string[];
  exact?: boolean;
  optional?: boolean;
}
export interface RevisionModule {
  id: string;
  intro: string;
  terms: { term: string; meaning: string }[];
  derivation: string[];
  examples: { title: string; steps: string[] }[];
  pitfall: string;
  checks: RevisionCheck[];
}
export const revisionModules = raw.modules as RevisionModule[];
export function revisionAnswerCorrect(
  question: RevisionCheck,
  response: string,
) {
  return question.type === "numeric"
    ? gradeNumeric(response, Number(question.answer), question.exact)
    : response === question.answer;
}
