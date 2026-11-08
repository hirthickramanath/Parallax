import { useEffect, useState } from "react";
import type { Question } from "./course";

const loaders = import.meta.glob<Question[]>("../generated/questions/*.json", {
  import: "default",
});
const cache = new Map<string, Question[]>();

/** Questions are split out of the course metadata so the entry chunk stays small. */
export function loadQuestions(id: string): Promise<Question[]> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const load = loaders[`../generated/questions/${id}.json`];
  if (!load) return Promise.reject(new Error(`No questions for ${id}`));
  return load().then((questions) => {
    cache.set(id, questions);
    return questions;
  });
}

/** Returns undefined while loading. A failed load throws so the route error boundary can show its message. */
export function useQuestions(id: string | undefined): Question[] | undefined {
  const [state, setState] = useState<{ id: string; questions: Question[] }>();
  const [error, setError] = useState<Error>();
  useEffect(() => {
    if (!id) return;
    let live = true;
    loadQuestions(id).then(
      (questions) => live && setState({ id, questions }),
      (e: Error) => live && setError(e),
    );
    return () => {
      live = false;
    };
  }, [id]);
  if (error) throw error;
  if (!id) return undefined;
  return cache.get(id) || (state?.id === id ? state.questions : undefined);
}
