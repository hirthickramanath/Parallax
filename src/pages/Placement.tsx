import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import tests from "../../content/placement.json";
import conceptual from "../../content/placement-concepts.json";
import type { Question } from "../lib/course";
import { QuestionCard } from "../components/learning/QuestionCard";
import { useLearning } from "../hooks/useLearning";
import { Button } from "../components/ui/button";
export function Placement() {
  const [params] = useSearchParams();
  const unit = params.get("unit") === "CB" ? "CB1" : params.get("unit");
  return <PlacementTest key={unit || "diagnostic"} unit={unit} />;
}
function PlacementTest({ unit }: { unit: string | null }) {
  const selected = tests.filter((t) => !unit || t.unit === unit);
  const questions: (Question & { unitId: string })[] = selected.flatMap((t) => [
    ...t.questions.slice(0, 2).map(([prompt, answer], i) => ({
      unitId: t.unit,
      id: `${t.unit}-${i}`,
      prompt,
      answer,
      type: "numeric" as const,
      conceptual: false,
      unit: "as stated in the question",
      explanation: `Reference answer: ${answer}. Work through the units and governing relation before checking.`,
    })),
    ...(conceptual.find((c) => c.unit === t.unit)?.questions || [])
      .slice(0, unit ? 3 : 2)
      .map((q) => ({ ...q, type: "mcq" as const, unitId: t.unit })),
  ]);
  const [index, setIndex] = useState(0),
    [results, setResults] = useState<Record<string, boolean>>({}),
    [finished, setFinished] = useState(false);
  const store = useLearning();
  const q = questions[index];
  if (!q)
    return (
      <main id="main" className="workspace-page">
        <h1>No bridge test found.</h1>
        <Link to="/placement">Open diagnostic</Link>
      </main>
    );
  function finish() {
    if (unit) {
      const score =
        Object.values(results).filter(Boolean).length / questions.length;
      const current = store.records.units[unit];
      store.put("units", unit, {
        skipTestScore: score,
        skippedWithCredit: score >= 0.8 || !!current?.skippedWithCredit,
        completedAt: score >= 0.8 ? Date.now() : current?.completedAt || null,
      });
    }
    setFinished(true);
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">
        {unit ? "BRIDGE SKIP TEST" : "BRIDGE READINESS DIAGNOSTIC"}
      </p>
      <h1>
        {unit ? `Check your ${unit} foundation.` : "Find your starting point."}
      </h1>
      <p className="page-description">
        {unit
          ? "Five conceptual and numeric questions. At least 80% grants skip credit for this Bridge unit."
          : "Forty mixed diagnostic questions across maths, physics, and chemistry. Results suggest Bridge units to revisit; separate skip tests grant credit."}{" "}
        This draft is a screening tool, not a complete JEE-level placement
        assessment.
      </p>
      {finished ? (
        <section className="empty-card">
          <h2>
            {Object.values(results).filter(Boolean).length} / {questions.length}{" "}
            correct
          </h2>
          {selected.map((t) => {
            const subset = questions.filter((q) => q.unitId === t.unit);
            const score =
              subset.filter((q) => results[q.id]).length / subset.length;
            return (
              <p key={t.unit}>
                {t.unit}: {Math.round(score * 100)}% ·{" "}
                {score >= 0.8 ? "Foundation looks ready" : "Review recommended"}{" "}
                {!unit && (
                  <Link to={`/placement?unit=${t.unit}`}>Take skip test →</Link>
                )}
              </p>
            );
          })}
          {unit && (
            <p>
              {store.records.units[unit]?.skippedWithCredit
                ? "Skip credit saved. Dependent units can use this prerequisite."
                : "No skip credit granted. Review the unit and try again."}
            </p>
          )}
          <Link to="/learn">Back to course</Link>
        </section>
      ) : (
        <>
          <progress
            aria-label="Diagnostic progress"
            value={index + 1}
            max={questions.length}
          />
          <h2 className="sr-only">Question {index + 1}</h2>
          <p>
            {index + 1} of {questions.length} · {q.unitId}
          </p>
          <QuestionCard
            key={q.id}
            lessonId="placement"
            question={{ ...q, tier: unit ? "skip-test" : "placement" }}
            onResult={(id, correct) =>
              setResults((r) => ({ ...r, [id]: correct }))
            }
          />
          <Button
            disabled={results[q.id] === undefined}
            onClick={() =>
              index === questions.length - 1 ? finish() : setIndex((i) => i + 1)
            }
          >
            {index === questions.length - 1
              ? "Finish diagnostic"
              : "Next question"}
          </Button>
        </>
      )}
    </main>
  );
}
