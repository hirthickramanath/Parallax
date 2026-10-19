import { useMemo, useState } from "react";
import { useLearning } from "../../hooks/useLearning";
import { adaptiveNext, adjustChallenge } from "../../lib/journey";
import type { Authored } from "../../lib/course";
import { QuestionCard } from "./QuestionCard";
import { Button } from "../ui/button";
export function AdaptiveCheck({ lesson }: { lesson: Authored }) {
  const store = useLearning(),
    saved = store.records.plan[`challenge-${lesson.track}`];
  const session = store.records.lessons[lesson.id]?.interaction?.adaptive;
  const [level, setLevel] = useState(
      Math.max(0, Math.min(2, Number(session?.level ?? saved?.level ?? 1))),
    ),
    [seen, setSeen] = useState<string[]>(session?.seen || []),
    [feedback, setFeedback] = useState(session?.feedback || ""),
    [answer, setAnswer] = useState<boolean | null>(session?.answer ?? null),
    [done, setDone] = useState(session?.done || false);
  const q = useMemo(
    () => adaptiveNext(lesson.questions, seen, level),
    [lesson, seen, level],
  );
  function persist(patch: Partial<NonNullable<typeof session>>) {
    store.saveLessonInteraction(lesson.id, {
      adaptive: { level, seen, feedback, answer, done, ...patch },
    });
  }
  return (
    <section className="adaptive-check">
      <span className="pill">FIND YOUR CHALLENGE</span>
      <h3>A question first. Then the right next step.</h3>
      <p>
        Correct answers lead to a harder question; mistakes bring a smaller step
        and an explanation. This short check adjusts support, not access to the
        full theory.
      </p>
      {done || !q ? (
        <>
          <p role="status">
            {
              [
                "Build the foundation, with worked steps.",
                "Develop the idea, then try a transfer problem.",
                "Start with a Core challenge; revisit steps whenever useful.",
              ][level]
            }
          </p>
          <p>
            Your starting pace is saved for {lesson.track}. This is a
            provisional guide based on a small authored question bank.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSeen([]);
              setDone(false);
              setAnswer(null);
              store.saveLessonInteraction(lesson.id, {
                adaptive: {
                  level,
                  seen: [],
                  done: false,
                  answer: null,
                  feedback: "",
                },
                responses: Object.fromEntries(
                  lesson.questions.map((item) => [
                    `adaptive-${item.id}`,
                    { response: "", result: null, submitted: null },
                  ]),
                ),
              });
            }}
          >
            Try the check again
          </Button>
        </>
      ) : (
        <>
          <QuestionCard
            key={`${q.id}-${seen.length}`}
            lockAfterSubmit
            lessonId={lesson.id}
            question={{ ...q, id: `adaptive-${q.id}`, tier: "adaptive" }}
            onResult={(_, correct) => {
              if (answer !== null) return;
              setAnswer(correct);
              persist({
                answer: correct,
                feedback: correct
                  ? "Good reasoning. Let’s step up."
                  : "Take a smaller step. Use the explanation, then try another idea.",
              });
              setFeedback(
                correct
                  ? "Good reasoning. Let’s step up."
                  : "Take a smaller step. Use the explanation, then try another idea.",
              );
            }}
          />
          {answer !== null && (
            <>
              <p role="status">{feedback}</p>
              <Button
                onClick={() => {
                  const next = adjustChallenge(level, answer);
                  const ids = [...seen, q.id];
                  setLevel(next);
                  setSeen(ids);
                  setAnswer(null);
                  persist({
                    level: next,
                    seen: ids,
                    answer: null,
                    done:
                      ids.length >= 4 ||
                      !adaptiveNext(lesson.questions, ids, next),
                  });
                  store.put("plan", `challenge-${lesson.track}`, {
                    level: next,
                    updatedAt: Date.now(),
                  });
                  if (
                    ids.length >= 4 ||
                    !adaptiveNext(lesson.questions, ids, next)
                  )
                    setDone(true);
                }}
              >
                Next challenge
              </Button>
            </>
          )}
        </>
      )}
    </section>
  );
}
