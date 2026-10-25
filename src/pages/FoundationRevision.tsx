import { useTutorDock, useTutorLesson } from "../components/learning/TutorDock";
import { lazy, Suspense, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLearning } from "../hooks/useLearning";
import { course } from "../lib/course";
import {
  FOUNDATION_ORDER,
  foundationProgress,
  foundationKey,
  foundationRevised,
  nextFoundation,
  revisionPracticeReady,
  type FoundationProgress,
} from "../lib/foundation-path";
import {
  revisionModules,
  revisionAnswerCorrect,
} from "../lib/foundation-revision";
import { LessonSimulation } from "../components/learning/LessonSimulation";
import { SymbolDefinition } from "../components/learning/StoredSection";
import { AppearanceToggles } from "../components/ThemeSelect";
import { Button } from "../components/ui/button";
import "katex/dist/katex.min.css";
const modules = import.meta.glob<{
  default: React.ComponentType<{ components: Record<string, unknown> }>;
}>("../../content/lessons/*.mdx");
const theoryComponents = {
  LessonSection: ({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) =>
    id === "theory" ? (
      <section className="lesson-prose">{children}</section>
    ) : null,
  Widget: () => null,
  Symbol: SymbolDefinition,
};
const steps = [
  "Rebuild the idea",
  "Worked examples",
  "Full theory",
  "Practise and connect",
];
export function FoundationRevision() {
  const { id } = useParams();
  return id ? <RevisionPlayer key={id} id={id} /> : <RevisionOverview />;
}
function RevisionOverview() {
  const store = useLearning(),
    navigate = useNavigate(),
    next = nextFoundation(store.records),
    done = FOUNDATION_ORDER.filter((id) =>
      foundationRevised(store.records, id),
    ).length;
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">FOUNDATIONS BEFORE THE FRONTIER</p>
      <h1>Let the ideas come back, one step at a time.</h1>
      <p className="page-description">
        A 38-chapter revision route for things you learned before, and a careful
        introduction to anything you missed. No entrance quiz is required.
        Complete theory remains part of every chapter.
      </p>
      <section className="settings-card">
        <h2>{done} of 38 chapters revised</h2>
        <p>
          Each chapter: learn the terms → follow two worked examples → revisit
          the full argument → investigate and practise. Work at your own pace;
          this is not a timed test.
        </p>
        {next ? (
          <Button
            onClick={() => {
              store.setPreferences({ foundationRevision: true, depth: "full" });
              navigate(`/foundation-revision/${next}`);
            }}
          >
            {done ? "Resume guided revision" : "Begin guided revision"}
          </Button>
        ) : (
          <Button asChild>
            <Link
              to="/placement"
              onClick={() =>
                store.setPreferences({ foundationRevision: false })
              }
            >
              Check readiness for the main course
            </Link>
          </Button>
        )}
        <p className="source-note">
          Revision practice is recorded separately from your original reading
          and mastery. Existing lessons, notes, streaks and XP are preserved.
          Passing these small practice sets does not independently certify
          mastery.
        </p>
      </section>
      <ol className="foundation-chapter-list">
        {FOUNDATION_ORDER.map((id, i) => (
          <li key={id}>
            <Link to={`/foundation-revision/${id}`}>
              <span>
                {i + 1}. {course.authored[id].title}
              </span>
              <small>
                {id} ·{" "}
                {foundationRevised(store.records, id)
                  ? "Revision practice complete"
                  : "Rebuild → derive → practise"}
              </small>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
function RevisionPlayer({ id }: { id: string }) {
  const { isOpen: showTutor, toggle: toggleTutor } = useTutorDock();
  const store = useLearning(),
    guide = revisionModules.find((m) => m.id === id),
    lesson = course.authored[id],
    p = foundationProgress(store.records, id);
  useTutorLesson(id, "theory", "full", p.step);
  const Theory = useMemo(
    () =>
      modules[`../../content/lessons/${id}.mdx`]
        ? lazy(modules[`../../content/lessons/${id}.mdx`])
        : null,
    [id],
  );
  useEffect(() => {
    if (guide)
      store.setPreferences({ foundationRevision: true, depth: "full" });
  }, [id]);
  if (!guide || !lesson)
    return (
      <main id="main" className="workspace-page">
        <h1>Revision chapter not found</h1>
        <Link to="/foundation-revision">Open the foundation route</Link>
      </main>
    );
  const index = FOUNDATION_ORDER.indexOf(
      id as (typeof FOUNDATION_ORDER)[number],
    ),
    next = nextFoundation(store.records),
    ready = revisionPracticeReady(p);
  function save(patch: Partial<FoundationProgress>) {
    store.put("plan", foundationKey(id), {
      ...p,
      ...patch,
      updatedAt: Date.now(),
    });
  }
  function move(step: number) {
    save({ step });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function advance() {
    save({
      visited: [...new Set([...p.visited, p.step])],
      step: Math.min(3, p.step + 1),
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <main id="main" className="lesson-player revision-player">
      <header className="revision-player-header">
        <Link to="/foundation-revision">← Revision path</Link>
        <AppearanceToggles />
        <Link to="/dashboard">Dashboard</Link>
      </header>
      <p className="eyebrow">
        DRAFT · IN-DEPTH REVISION · CHAPTER {index + 1} OF 38 · {id}
      </p>
      <h1>{lesson.title}</h1>
      <label className="revision-step-select">
        Revision step
        <select
          aria-label="Revision step"
          value={p.step}
          onChange={(e) => move(Number(e.target.value))}
        >
          {steps.map((name, i) => (
            <option key={name} value={i}>
              {i + 1}. {name}
            </option>
          ))}
        </select>
      </label>
      <progress
        aria-label="Revision chapter steps"
        value={p.step + 1}
        max={4}
      />
      <div className="lesson-layout with-simulation">
        <article className="revision-guide">
          {p.step === 0 && (
            <section>
              <h2>Start with the meaning</h2>
              <p>{guide.intro}</p>
              <h3>Words before equations</h3>
              <dl className="revision-glossary">
                {guide.terms.map((t) => (
                  <div key={t.term}>
                    <dt>{t.term}</dt>
                    <dd>{t.meaning}</dd>
                  </div>
                ))}
              </dl>
              <h3>Build the relationship</h3>
              <ol className="revision-derivation">
                {guide.derivation.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <aside className="info-box">
                <strong>Watch for this: </strong>
                {guide.pitfall}
              </aside>
            </section>
          )}
          {p.step === 1 && (
            <section>
              <h2>Follow the reasoning</h2>
              <p>
                Read one line at a time. Before opening the next line, predict
                what operation or physical idea comes next.
              </p>
              {guide.examples.map((example) => (
                <article className="revision-worked" key={example.title}>
                  <h3>{example.title}</h3>
                  {example.steps.map((line, i) => (
                    <details key={line} open={i === 0}>
                      <summary>Worked step {i + 1}</summary>
                      <p>{line}</p>
                    </details>
                  ))}
                </article>
              ))}
              <p>
                Now change one input in the investigation beside the example.
                Predict the sign or trend before moving its control.
              </p>
            </section>
          )}
          {p.step === 2 && (
            <section>
              <h2>Keep the complete argument</h2>
              <p>
                The refresher prepares you for this derivation. Read the
                assumptions and limits as carefully as the equations. If a term
                still feels unfamiliar, return to the first step.
              </p>
              <Suspense fallback={<p role="status">Opening full theory…</p>}>
                {Theory && <Theory components={theoryComponents} />}
              </Suspense>
            </section>
          )}
          {p.step === 3 && (
            <section>
              <h2>Try it, explain it, transfer it</h2>
              <p>
                Start with a small calculation, check the idea, then change the
                situation. Mistakes bring feedback; there is no timer. A hint is
                support, not a penalty. Use decimals for fractional answers.
              </p>
              {guide.checks.map((q) => {
                const a = p.answers[q.id] || {
                  response: "",
                  submitted: null,
                  correct: null,
                };
                return (
                  <form
                    className="question-card"
                    data-question-id={`revision-${q.id}`}
                    key={q.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (
                        !a.response.trim() ||
                        a.response === a.submitted ||
                        a.correct
                      )
                        return;
                      save({
                        answers: {
                          ...p.answers,
                          [q.id]: {
                            ...a,
                            submitted: a.response,
                            correct: revisionAnswerCorrect(q, a.response),
                          },
                        },
                      });
                    }}
                  >
                    {q.optional && (
                      <p className="eyebrow">
                        OPTIONAL TRANSFER · TRY A NEW SITUATION
                      </p>
                    )}
                    <h3>{q.prompt}</h3>
                    {q.options ? (
                      <fieldset disabled={a.correct === true}>
                        <legend className="sr-only">Choose an answer</legend>
                        {q.options.map((option) => (
                          <label className="answer-choice" key={option}>
                            <input
                              type="radio"
                              name={q.id}
                              checked={a.response === option}
                              onChange={() =>
                                save({
                                  answers: {
                                    ...p.answers,
                                    [q.id]: {
                                      ...a,
                                      response: option,
                                      correct: null,
                                    },
                                  },
                                })
                              }
                            />
                            {option}
                          </label>
                        ))}
                      </fieldset>
                    ) : (
                      <label>
                        Your answer{q.unit ? ` (${q.unit})` : ""}
                        <input
                          aria-label={`Answer ${q.id}`}
                          type="number"
                          step="any"
                          value={a.response}
                          disabled={a.correct === true}
                          onChange={(e) =>
                            save({
                              answers: {
                                ...p.answers,
                                [q.id]: {
                                  ...a,
                                  response: e.target.value,
                                  correct: null,
                                },
                              },
                            })
                          }
                        />
                      </label>
                    )}
                    <div className="lab-actions">
                      <Button
                        type="submit"
                        disabled={
                          !a.response.trim() ||
                          a.response === a.submitted ||
                          a.correct === true
                        }
                      >
                        Check answer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          save({
                            answers: {
                              ...p.answers,
                              [q.id]: { ...a, hintUsed: !a.hintUsed },
                            },
                          })
                        }
                      >
                        {a.hintUsed
                          ? "Hide support"
                          : "Help me take a smaller step"}
                      </Button>
                    </div>
                    {a.hintUsed && <p className="info-box">{q.hint}</p>}
                    {a.correct !== null && (
                      <p role="status">
                        {a.correct
                          ? "That’s right."
                          : "Not yet. Revisit the worked example, then try again."}{" "}
                        {q.explanation}
                      </p>
                    )}
                  </form>
                );
              })}
              {!ready && (
                <p className="info-box">
                  Finish the three reading steps and all three practice checks
                  before closing this revision chapter. The transfer challenge
                  is optional. You can revisit any step.
                </p>
              )}
              <Button
                disabled={!ready || !!p.completedAt}
                onClick={() => {
                  save({ completedAt: Date.now() });
                  store.award(`foundation-rebuild-v1:${id}`, 5, lesson.track);
                }}
              >
                Finish this revision
              </Button>
              {!!p.completedAt && (
                <section className="settings-card">
                  <h3>Revision practice complete</h3>
                  <p>
                    Can you explain the relationship without looking? A later
                    recall check is still useful. Your original course mastery
                    is unchanged.
                  </p>
                  {next ? (
                    <Button asChild>
                      <Link to={`/foundation-revision/${next}`}>
                        Next foundation →
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link
                        to="/placement"
                        onClick={() =>
                          store.setPreferences({ foundationRevision: false })
                        }
                      >
                        Check readiness for the main course
                      </Link>
                    </Button>
                  )}
                </section>
              )}
              <Button variant="outline" onClick={() => move(0)}>
                Still feels shaky — rebuild again
              </Button>
            </section>
          )}
          {p.step < 3 && (
            <div className="lab-actions">
              <Button onClick={advance}>
                {p.step === 2
                  ? "I’ve read the argument — practise"
                  : "Continue revision"}
              </Button>
              {p.step > 0 && (
                <Button variant="outline" onClick={() => move(p.step - 1)}>
                  Previous step
                </Button>
              )}
            </div>
          )}
        </article>
        <LessonSimulation lesson={lesson} />
        <div className="revision-tutor-entry">
          <Button
            variant="outline"
            aria-expanded={showTutor}
            onClick={toggleTutor}
          >
            {showTutor ? "Close AI tutor" : "Ask AI tutor"}
          </Button>
        </div>
      </div>
    </main>
  );
}
