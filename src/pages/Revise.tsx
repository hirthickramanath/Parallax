import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createEmptyCard, fsrs, type Card } from "ts-fsrs";
import { useLearning } from "../hooks/useLearning";
import { course } from "../lib/course";
import { dateKey } from "../lib/learning-core";
import { Rating, restoreCard, schedule } from "../lib/fsrs";
import { QuestionCard } from "../components/learning/QuestionCard";
import { ConceptMap } from "../components/learning/ConceptMap";
import { Button } from "../components/ui/button";
const concepts = Object.entries(course.authored).flatMap(([lessonId, l]) =>
  l.review.map((r, i) => ({ ...r, id: `${lessonId}-${i}`, lessonId })),
);
type Concept = (typeof concepts)[number];
export function Revise() {
  const store = useLearning();
  const [params] = useSearchParams();
  const requested = params.get("concept");
  const [query, setQuery] = useState(""),
    [active, setActive] = useState<Concept | null>(null),
    [sessionId, setSessionId] = useState(""),
    [step, setStep] = useState(0),
    [revealed, setRevealed] = useState(false),
    [rated, setRated] = useState(false),
    [score, setScore] = useState(0),
    [recallIndex, setRecallIndex] = useState(0),
    [sessionCards, setSessionCards] = useState<Concept[]>([]),
    [whyAnswered, setWhyAnswered] = useState(false),
    [coreCorrect, setCoreCorrect] = useState<boolean | null>(null);
  const catalog = [...new Map(concepts.map((c) => [c.concept, c])).values()];
  const filtered = catalog.filter((c) =>
    `${c.concept} ${c.front}`.toLowerCase().includes(query.toLowerCase()),
  );
  function strength(id: string) {
    const card = store.records.reviewCards[id]?.fsrs;
    return card && card.reps > 0
      ? fsrs().get_retrievability(restoreCard(card), new Date(), false)
      : null;
  }
  function start(c: Concept) {
    const sid = crypto.randomUUID();
    setSessionId(sid);
    store.put("revisionSessions", sid, {
      conceptIds: [c.concept],
      startedAt: Date.now(),
      finishedAt: null,
      score: 0,
    });
    setSessionCards(
      concepts
        .filter((card) => card.lessonId === c.lessonId)
        .sort((a, b) => {
          const am = a.concept === c.concept ? -1 : 0,
            bm = b.concept === c.concept ? -1 : 0;
          return am - bm || (strength(a.id) ?? -1) - (strength(b.id) ?? -1);
        })
        .slice(0, 5),
    );
    setActive(c);
    setStep(0);
    setRevealed(false);
    setRated(false);
    setScore(0);
    setRecallIndex(0);
    setWhyAnswered(false);
    setCoreCorrect(null);
  }
  useEffect(() => {
    if (requested) {
      const found = catalog.find((c) => c.concept === requested);
      if (found) start(found);
    }
  }, [requested]);
  const recall = sessionCards[recallIndex] || active;
  function rate(rating: Rating) {
    if (!recall) return;
    const previous = store.records.reviewCards[recall.id] || {
      type: "explain",
      front: recall.front,
      back: recall.back,
      lessonId: recall.lessonId,
      conceptIds: [recall.concept],
      fsrs: createEmptyCard<Card>(),
    };
    const result = schedule(previous.fsrs, rating, store.preferences.retention);
    store.put("reviewCards", recall.id, { ...previous, fsrs: result.card });
    store.put("reviewLog", crypto.randomUUID(), {
      cardId: recall.id,
      rating: Rating[rating],
      state: previous.fsrs.state,
      due: result.card.due.toISOString(),
      reviewedAt: new Date().toISOString(),
      elapsed_days: result.log.elapsed_days,
    });
    store.put("concepts", recall.concept, {
      lastRevisedAt: Date.now(),
      memoryStrength: fsrs().get_retrievability(result.card, new Date(), false),
      weak: rating <= Rating.Hard,
    });
    store.award(`review:${recall.id}:${result.card.reps}`, 2, "review");
    setRated(true);
  }
  function finish() {
    if (!active) return;
    const previous = store.records.revisionSessions[sessionId];
    store.put("revisionSessions", sessionId, {
      ...previous,
      finishedAt: Date.now(),
      score: (score + (coreCorrect ? 1 : 0)) / 2,
      conceptIds: [...new Set(sessionCards.map((c) => c.concept))],
    });
    store.award(
      `revision:${active.concept}:${dateKey(Date.now(), store.preferences.timezone)}`,
      10,
      "revision",
    );
    setStep(5);
  }
  if (active) {
    const lesson = course.authored[active.lessonId],
      why = lesson.questions.find((q) => q.conceptual && !q.tier)!,
      problem = lesson.questions.find((q) => q.tier === "core")!;
    return (
      <main id="main" className="workspace-page">
        <p className="eyebrow">
          FOCUSED CONCEPT REVISION · {active.concept.replaceAll("-", " ")}
        </p>
        <h1>Reconnect the idea.</h1>
        <progress
          max={5}
          value={Math.min(5, step + 1)}
          aria-label="Revision progress"
        />
        {step === 0 && (
          <section className="review-card">
            <h2>A thirty-second recap</h2>
            <ul>
              {lesson.recap.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <Button onClick={() => setStep(1)}>Try to recall it</Button>
          </section>
        )}
        {step === 1 && (
          <section className="review-card">
            <span className="pill">RETRIEVAL · ACTUAL FSRS REVIEW</span>
            <p className="source-note">
              Retrieval {recallIndex + 1} of {sessionCards.length} · target and
              related concepts from this lesson
            </p>
            <h2>{recall?.front}</h2>
            {!revealed ? (
              <Button onClick={() => setRevealed(true)}>
                Reveal after recalling
              </Button>
            ) : (
              <>
                <p className="review-answer">{recall?.back}</p>
                <div className="rating-buttons">
                  {[Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].map(
                    (r) => (
                      <Button
                        key={r}
                        disabled={rated}
                        variant="outline"
                        onClick={() => rate(r)}
                      >
                        {Rating[r]}
                      </Button>
                    ),
                  )}
                </div>
              </>
            )}
            <p>Only this explicit recall rating updates the FSRS schedule.</p>
            <Button
              disabled={!rated}
              onClick={() => {
                if (recallIndex < sessionCards.length - 1) {
                  setRecallIndex((i) => i + 1);
                  setRevealed(false);
                  setRated(false);
                } else setStep(2);
              }}
            >
              {recallIndex < sessionCards.length - 1
                ? "Next retrieval"
                : "Check prerequisites"}
            </Button>
          </section>
        )}
        {step === 2 && (
          <section className="empty-card">
            <h2>Find the missing link.</h2>
            <p>
              Recommended lesson prerequisites:{" "}
              {lesson.requires.length
                ? lesson.requires.join(", ")
                : "none for this Bridge entry"}
              .
            </p>
            <p>
              If your recall felt shaky, revisit these foundations before adding
              complexity. This session doesn’t invent prerequisite completion
              credit.
            </p>
            <Button onClick={() => setStep(3)}>Explain why</Button>
          </section>
        )}
        {step === 3 && (
          <>
            <QuestionCard
              lessonId={active.lessonId}
              question={{ ...why, id: `revision-why-${sessionId}` }}
              onResult={(_, correct) => {
                setScore(correct ? 1 : 0);
                setWhyAnswered(true);
              }}
            />
            <Button disabled={!whyAnswered} onClick={() => setStep(4)}>
              Try the transfer problem
            </Button>
          </>
        )}
        {step === 4 && (
          <>
            <QuestionCard
              lessonId={active.lessonId}
              question={{ ...problem, id: `revision-core-${sessionId}` }}
              onResult={(_, correct) => setCoreCorrect(correct)}
            />
            <Button disabled={coreCorrect === null} onClick={finish}>
              Finish revision
            </Button>
          </>
        )}
        {step === 5 && (
          <section className="empty-card">
            <h2>A clearer perspective.</h2>
            <p>
              Revision saved. The session earns up to 10 XP once per concept per
              day; recall reviews earn their own activity XP.
            </p>
            <Link to={`/lesson/${active.lessonId}`}>
              Revisit the complete lesson →
            </Link>
            <Button onClick={() => setActive(null)}>Back to concepts</Button>
          </section>
        )}
      </main>
    );
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">RECONNECT THE IDEAS</p>
      <h1>What needs a fresh perspective?</h1>
      <input
        className="search-input"
        aria-label="Search concepts"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search free fall, uncertainty, orbital energy…"
      />
      <div className="concept-grid">
        {filtered
          .sort((a, b) => (strength(a.id) ?? -1) - (strength(b.id) ?? -1))
          .map((c) => {
            const value = strength(c.id);
            return (
              <article className="concept-card" key={c.id}>
                <span className="pill">{c.concept.replaceAll("-", " ")}</span>
                <h2>{c.front}</h2>
                <p>
                  {value === null
                    ? "Not reviewed yet"
                    : `Estimated recall: ${Math.round(value * 100)}%`}
                </p>
                <Button variant="outline" onClick={() => start(c)}>
                  Start focused revision
                </Button>
              </article>
            );
          })}
      </div>
      {!filtered.length && <p>No matching authored concepts yet.</p>}
      <ConceptMap />
    </main>
  );
}
