import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createEmptyCard, type Card } from "ts-fsrs";
import { course, missingNeeds } from "../lib/course";
import { useLearning } from "../hooks/useLearning";
import {
  SectionContext,
  StoredSection,
  SymbolDefinition,
} from "../components/learning/StoredSection";
import { QuestionCard } from "../components/learning/QuestionCard";
import { TutorPanel } from "../components/learning/TutorPanel";
import { Widget } from "../components/widgets/registry";
import { Button } from "../components/ui/button";
import type { LessonProgress } from "../types/progress";
import "katex/dist/katex.min.css";
const mdxComponents = {
  LessonSection: StoredSection,
  Widget,
  Symbol: SymbolDefinition,
};
const modules = import.meta.glob<{
  default: React.ComponentType<{ components: Record<string, unknown> }>;
}>("../../content/lessons/*.mdx");
export function LessonPlayer() {
  const { id = "" } = useParams();
  const lesson = course.authored[id];
  return lesson ? (
    <Player key={id} id={id} />
  ) : (
    <main id="main" className="workspace-page">
      <h1>Lesson not authored yet</h1>
      <p>This curriculum entry is a draft stub, not a completed lesson.</p>
      <Link to="/learn">Back to the course</Link>
    </main>
  );
}
function Player({ id }: { id: string }) {
  const store = useLearning(),
    lesson = course.authored[id];
  const [index, setIndex] = useState(() => {
      const bookmark = store.records.lessons[id]?.lastSection;
      return Math.max(
        0,
        lesson.sections
          .filter((s) => store.preferences.depth === "full" || !s.fullOnly)
          .findIndex((s) => s.id === bookmark),
      );
    }),
    [finished, setFinished] = useState(false),
    [showTutor, setShowTutor] = useState(false),
    [cardAdded, setCardAdded] = useState(false),
    [prediction, setPrediction] = useState(
      store.records.attempts[`prediction-${id}`]?.response || "",
    ),
    [reveal, setReveal] = useState(
      !!store.records.attempts[`prediction-${id}`],
    );
  const depth = store.preferences.depth;
  const sections = lesson.sections.filter(
    (s) => depth === "full" || !s.fullOnly,
  );
  const active = sections[Math.min(index, sections.length - 1)];
  const needs = missingNeeds(lesson, store.records);
  const MDX = useMemo(
    () => lazy(modules[`../../content/lessons/${id}.mdx`]),
    [id],
  );
  const progress = (): LessonProgress =>
    store.records.lessons[id] || {
      status: "in_progress",
      mastery: 0,
      depthCompleted: null,
      ladderTierDone: [],
      lastSection: active.id,
      updatedAt: Date.now(),
    };
  useEffect(() => {
    const current = store.records.lessons[id];
    store.put("lessons", id, {
      ...progress(),
      status: current?.status === "done" ? "done" : "in_progress",
      lastSection: active.id,
      updatedAt: Date.now(),
    });
    window.scrollTo(0, 0);
  }, [id, active.id]);
  function result(qid: string, correct: boolean) {
    const q = lesson.questions.find((q) => q.id === qid)!;
    const current = progress();
    const attempts = Object.values(store.records.attempts);
    const latest = new Map(
      attempts
        .filter((a) => a.questionId.startsWith(id + ":"))
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((a) => [a.questionId.slice(id.length + 1), a.isCorrect]),
    );
    const correctIds = new Set(
      [...latest].filter(([, correct]) => correct).map(([qid]) => qid),
    );
    const checks = lesson.questions.filter((q) => !q.tier);
    const score =
      checks.filter((q) => correctIds.has(q.id)).length / checks.length;
    const tiers = [
      ...new Set([
        ...current.ladderTierDone,
        ...(q.tier && correct ? [q.tier] : []),
      ]),
    ];
    store.put("lessons", id, {
      ...current,
      mastery: score,
      ladderTierDone: tiers,
      updatedAt: Date.now(),
    });
    if (correct)
      store.award(
        `${id}:answer:${qid}`,
        q.tier === "core" ? 5 : 2,
        lesson.track,
      );
  }
  function complete() {
    const current = progress();
    store.put("lessons", id, {
      ...current,
      status: "done",
      depthCompleted: current.depthCompleted === "full" ? "full" : depth,
      updatedAt: Date.now(),
    });
    store.award(`lesson:${id}`, 20, lesson.track);
    for (const [i, card] of lesson.review.entries())
      if (!store.records.reviewCards[`${id}-${i}`])
        store.put("reviewCards", `${id}-${i}`, {
          type: "explain",
          front: card.front,
          back: card.back,
          lessonId: id,
          conceptIds: [card.concept],
          fsrs: createEmptyCard<Card>(),
        });
    setFinished(true);
  }

  if (store.preferences.strictLocking && needs.length)
    return (
      <main id="main" className="workspace-page">
        <h1>Prerequisites first</h1>
        <p>
          Complete {needs.join(", ")} or turn off strict locking in Settings.
        </p>
        <Link to="/learn">View course</Link>
      </main>
    );
  if (finished)
    return (
      <main id="main" className="workspace-page finish-screen">
        <span className="finish-star">✦</span>
        <p className="eyebrow">ANOTHER PERSPECTIVE UNLOCKED</p>
        <h1>Keep the question alive.</h1>
        <p>
          Lesson completed. Your answers and study activity are saved on this
          device.
        </p>
        <p>
          Mastery: {Math.round((store.records.lessons[id]?.mastery || 0) * 100)}
          % · Full mastery also needs correct Warm-up and Core answers.
        </p>
        <ul>
          {lesson.recap.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </main>
    );
  return (
    <main id="main" className="lesson-player">
      <div className="lesson-toolbar">
        <Link to="/dashboard">← Exit lesson</Link>
        <span>{id} · Draft</span>
        <label>
          Depth{" "}
          <select
            value={depth}
            onChange={(e) => {
              store.setPreferences({
                depth: e.target.value as "quick" | "full",
              });
              setIndex(0);
            }}
          >
            <option value="full">Full study</option>
            <option value="quick">Quick review</option>
          </select>
        </label>
      </div>
      <progress
        aria-label="Lesson progress"
        value={index + 1}
        max={sections.length}
      />
      <div className="lesson-heading">
        <p className="eyebrow">
          {lesson.track} / {index + 1} OF {sections.length}
        </p>
        <h1>{lesson.title}</h1>
        {needs.length > 0 && (
          <p className="info-box">
            Recommended first: {needs.join(", ")}. Soft locking lets you explore
            this draft.
          </p>
        )}
      </div>
      <div className={`lesson-layout ${showTutor ? "with-tutor" : ""}`}>
        <div>
          <div className="section-navigation">
            <label>
              Section{" "}
              <select
                aria-label="Lesson section"
                value={active.id}
                onChange={(e) => {
                  const target = sections.findIndex(
                    (s) => s.id === e.target.value,
                  );
                  const puzzle = sections.findIndex(
                    (s) => s.layer === "puzzle",
                  );
                  setIndex(!reveal && target > puzzle ? puzzle : target);
                }}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {active.layer === "puzzle" && !reveal ? (
            <section className="prediction-card">
              <h2>Predict before the reveal</h2>
              <p>{lesson.hook}</p>
              <label>
                Your prediction
                <textarea
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                />
              </label>
              <Button
                disabled={!prediction.trim()}
                onClick={() => {
                  store.put("attempts", `prediction-${id}`, {
                    questionId: `${id}:prediction`,
                    tier: "prediction",
                    response: prediction,
                    isCorrect: false,
                    aiFeedback:
                      "Ungraded prediction recorded before the reveal.",
                    createdAt: Date.now(),
                  });
                  setReveal(true);
                }}
              >
                Commit and investigate
              </Button>
            </section>
          ) : (
            <Suspense fallback={<p role="status">Opening lesson…</p>}>
              <SectionContext.Provider
                value={{
                  activeId: active.id,
                  onTheoryComplete: () => {
                    if (!store.records.attempts[`theory-${id}`]) {
                      store.put("attempts", `theory-${id}`, {
                        questionId: `${id}:theory-view`,
                        tier: "theory",
                        response: "All theory blocks revealed",
                        isCorrect: true,
                        aiFeedback:
                          "Theory reveal event, not an assessment of understanding.",
                        createdAt: Date.now(),
                      });
                      store.award(`theory:${id}`, 10, lesson.track);
                    }
                  },
                }}
              >
                <MDX components={mdxComponents} />
              </SectionContext.Provider>
            </Suspense>
          )}
          {active.layer === "before" && (
            <section>
              <h3>A short readiness check</h3>
              <p>
                If two or more feel uncertain, revisit the listed prerequisites
                before studying the full derivation. This check does not grant
                mastery.
              </p>
              {lesson.questions
                .filter((q) => q.conceptual && !q.tier)
                .slice(0, 3)
                .map((q) => (
                  <QuestionCard
                    key={q.id}
                    lessonId={id}
                    question={{
                      ...q,
                      id: "readiness-" + q.id,
                      tier: "readiness",
                    }}
                  />
                ))}
            </section>
          )}
          {(active.layer === "check" || active.layer === "problems") &&
            lesson.questions
              .filter((q) => (active.layer === "check" ? !q.tier : !!q.tier))
              .map((q) => (
                <QuestionCard
                  key={q.id}
                  lessonId={id}
                  question={q}
                  onResult={result}
                />
              ))}
          <div className="lesson-notes">
            <label htmlFor="lesson-note">Your lab notebook</label>
            <textarea
              id="lesson-note"
              placeholder="Prediction, observations, a question to revisit…"
              value={store.records.notes[id]?.bodyMd || ""}
              onChange={(e) =>
                store.put("notes", id, {
                  bodyMd: e.target.value,
                  updatedAt: Date.now(),
                })
              }
            />
            <Button
              variant="outline"
              disabled={!store.records.notes[id]?.bodyMd || cardAdded}
              onClick={() => {
                const key = crypto.randomUUID();
                store.put("reviewCards", key, {
                  type: "explain",
                  front: `Explain ${active.title.toLowerCase()} in ${lesson.title}.`,
                  back: store.records.notes[id].bodyMd,
                  lessonId: id,
                  conceptIds: lesson.review.map((r) => r.concept),
                  fsrs: createEmptyCard<Card>(),
                });
                setCardAdded(true);
              }}
            >
              {cardAdded
                ? "Notebook card created"
                : "Make a review card from this note"}
            </Button>
          </div>
          <div className="lesson-controls">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((n) => n - 1)}
            >
              Previous
            </Button>
            <button
              className="text-button"
              onClick={() => setShowTutor(!showTutor)}
            >
              {showTutor ? "Close tutor" : "Ask about this section"}
            </button>
            <Button
              disabled={active.layer === "puzzle" && !reveal}
              onClick={() =>
                index === sections.length - 1
                  ? complete()
                  : setIndex((n) => n + 1)
              }
            >
              {index === sections.length - 1 ? "Finish lesson" : "Continue"}
            </Button>
          </div>
          <p className="source-note">
            Draft educational content. Scientific and source verification
            remains pending; no verified badge is implied.
          </p>
        </div>
        {showTutor && (
          <TutorPanel lessonId={id} sectionId={active.id} depth={depth} />
        )}
      </div>
    </main>
  );
}
