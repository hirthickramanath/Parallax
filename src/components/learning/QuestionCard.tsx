import { useState } from "react";
import { CheckCircle2, CircleX } from "lucide-react";
import type { Question } from "../../lib/course";
import { gradeNumeric } from "../../lib/learning-core";
import { useLearning } from "../../hooks/useLearning";
import { Button } from "../ui/button";
export function QuestionCard({
  question,
  lessonId,
  onResult,
  lockAfterSubmit = false,
}: {
  question: Question;
  lessonId: string;
  onResult?: (id: string, correct: boolean) => void;
  lockAfterSubmit?: boolean;
}) {
  const store = useLearning();
  const saved =
    store.records.lessons[lessonId]?.interaction?.responses?.[question.id];
  const [response, setResponse] = useState(saved?.response || ""),
    [result, setResult] = useState<boolean | null>(saved?.result ?? null),
    [submitted, setSubmitted] = useState<string | null>(
      saved?.submitted ?? null,
    ),
    [showHint, setShowHint] = useState(false);
  function change(value: string) {
    setResponse(value);
    setResult(null);
    store.saveLessonInteraction(lessonId, {
      lastQuestionId: question.id,
      responses: {
        [question.id]: { response: value, result: null, submitted },
      },
    });
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !response.trim() ||
      response === submitted ||
      (lockAfterSubmit && submitted !== null)
    )
      return;
    const correct =
      question.type === "numeric"
        ? gradeNumeric(response, Number(question.answer), question.exact)
        : response === question.answer;
    setResult(correct);
    setSubmitted(response);
    store.saveLessonInteraction(lessonId, {
      lastQuestionId: question.id,
      responses: {
        [question.id]: { response, result: correct, submitted: response },
      },
    });
    const id = crypto.randomUUID();
    store.put("attempts", id, {
      resetAt: store.records.lessons[lessonId]?.resetAt || 0,
      questionId: `${lessonId}:${question.id}`,
      tier: question.tier || "check",
      response,
      isCorrect: correct,
      aiFeedback: question.explanation,
      createdAt: Date.now(),
    });
    onResult?.(question.id, correct);
  }
  return (
    <form
      className="question-card"
      data-question-id={question.id}
      onSubmit={submit}
    >
      <span className="pill">
        {question.tier || "Concept check"}
        {question.conceptual ? " · Explain why" : ""}
      </span>
      <h3>{question.prompt}</h3>
      {question.options ? (
        <fieldset disabled={lockAfterSubmit && submitted !== null}>
          <legend className="sr-only">Choose an answer</legend>
          {question.options.map((option) => (
            <label
              className={`answer-choice ${response === option ? "selected" : ""}`}
              key={option}
            >
              <input
                required
                type="radio"
                name={question.id}
                value={option}
                checked={response === option}
                onChange={() => {
                  change(option);
                }}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ) : (
        <label className="numeric-answer">
          Your answer ({question.unit})
          <input
            required
            disabled={lockAfterSubmit && submitted !== null}
            type="number"
            step="any"
            value={response}
            onChange={(e) => {
              change(e.target.value);
            }}
          />
          <small>
            {question.exact
              ? "Exact numeric value required."
              : "Accepted within 2% relative tolerance (absolute tolerance 10⁻⁶ near zero)."}
          </small>
        </label>
      )}
      <Button
        disabled={
          !response.trim() ||
          response === submitted ||
          (lockAfterSubmit && submitted !== null)
        }
        type="submit"
      >
        Check answer
      </Button>
      {question.hint && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? "Hide hint" : "Give me a hint"}
          </Button>
          {showHint && <p className="info-box">{question.hint}</p>}
        </>
      )}
      {result !== null && (
        <div
          className={`answer-feedback ${result ? "correct" : "incorrect"}`}
          role="status"
        >
          {result ? <CheckCircle2 size={20} /> : <CircleX size={20} />}
          <p>
            <strong>
              {result ? "That’s right." : "Not quite—here’s why."}
            </strong>
            <br />
            {!result && question.misconceptions?.[response]
              ? question.misconceptions[response]
              : question.explanation}
          </p>
        </div>
      )}
    </form>
  );
}
