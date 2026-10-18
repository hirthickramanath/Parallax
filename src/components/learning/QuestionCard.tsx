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
}: {
  question: Question;
  lessonId: string;
  onResult?: (id: string, correct: boolean) => void;
}) {
  const store = useLearning();
  const [response, setResponse] = useState(""),
    [result, setResult] = useState<boolean | null>(null);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const correct =
      question.type === "numeric"
        ? gradeNumeric(response, Number(question.answer), question.exact)
        : response === question.answer;
    setResult(correct);
    const id = crypto.randomUUID();
    store.put("attempts", id, {
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
    <form className="question-card" onSubmit={submit}>
      <span className="pill">
        {question.tier || "Concept check"}
        {question.conceptual ? " · Explain why" : ""}
      </span>
      <h3>{question.prompt}</h3>
      {question.options ? (
        <fieldset>
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
                  setResponse(option);
                  setResult(null);
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
            type="number"
            step="any"
            value={response}
            onChange={(e) => {
              setResponse(e.target.value);
              setResult(null);
            }}
          />
          <small>
            {question.exact
              ? "Exact numeric value required."
              : "Accepted within 2% relative tolerance (absolute tolerance 10⁻⁶ near zero)."}
          </small>
        </label>
      )}
      <Button disabled={!response} type="submit">
        Check answer
      </Button>
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
            {question.explanation}
          </p>
        </div>
      )}
    </form>
  );
}
